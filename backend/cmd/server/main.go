package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	httphandler "github.com/crypto-snake-arena/server/internal/delivery/http"
	"github.com/crypto-snake-arena/server/internal/delivery/ws"
	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/game"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, using env vars")
	}

	// Postgres
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=crypto_snake port=5432 sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(50) // лимит при наплыве игроков
	sqlDB.SetMaxIdleConns(10) // пул простаивающих соединений
	if err := db.AutoMigrate(&domain.User{}, &domain.Transaction{}, &domain.Referral{}, &domain.ReferralEarning{}); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}
	log.Println("postgres connected, migrations applied")

	// Auth
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		log.Println("warning: TELEGRAM_BOT_TOKEN not set, auth will fail")
	}
	validator := auth.NewValidator(botToken)

	// TxManager (PlaceBet, AddGameReward) — реализует GameWallet и RewardCreditor
	txManager := payment.NewTxManager(db)
	userResolver := repository.NewUserResolverDB(db)

	// Менеджер комнат: хранит map комнат, выдаёт свободную или создаёт новую; каждая комната — своя горутина и Ticker
	roomManager := game.NewRoomManager(txManager, txManager)
	log.Println("room manager started")

	// WebSocket handler
	wsHandler := ws.NewHandler(txManager, validator, userResolver)

	// HTTP handler (REST API)
	httpHandler := httphandler.NewHandler(validator, userResolver, botToken)

	// Router
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("health check from %s", r.RemoteAddr)
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wsHandler.UpgradeAndHandle(w, r, roomManager)
	})
	httpHandler.SetupRouter(mux)

	// Static frontend (for single ngrok tunnel)
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		for _, p := range []string{"../frontend/dist", "frontend/dist"} {
			if fi, err := os.Stat(p); err == nil && fi.IsDir() {
				staticDir = p
				break
			}
		}
		if staticDir == "" {
			staticDir = "../frontend/dist"
		}
	}
	if fi, err := os.Stat(staticDir); err == nil && fi.IsDir() {
		fs := http.FileServer(http.Dir(staticDir))
		indexPath := filepath.Join(staticDir, "index.html")
		mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/" || r.URL.Path == "" || !strings.Contains(r.URL.Path, ".") {
				w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
				http.ServeFile(w, r, indexPath)
				return
			}
			// Отключаем кэш для JS/CSS — всегда свежая версия
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			fs.ServeHTTP(w, r)
		}))
		log.Println("serving static from", staticDir)
	} else {
		log.Println("STATIC_DIR not found, API only mode")
	}

	// CORS: ALLOWED_ORIGINS или * для dev
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	var c *cors.Cors
	if allowedOrigins == "*" || allowedOrigins == "all" {
		c = cors.AllowAll()
	} else if allowedOrigins != "" {
		c = cors.New(cors.Options{
			AllowedOrigins:   stringList(allowedOrigins),
			AllowCredentials: true,
			AllowedHeaders:   []string{"Authorization", "Content-Type"},
		})
	} else {
		allowOrigin := func(_ *http.Request, origin string) bool {
			return strings.HasPrefix(origin, "http://localhost") ||
				strings.HasPrefix(origin, "https://localhost") ||
				strings.HasPrefix(origin, "http://127.0.0.1") ||
				strings.HasPrefix(origin, "https://127.0.0.1") ||
				strings.HasPrefix(origin, "https://web.telegram.org") ||
				strings.Contains(origin, ".ngrok-free.app") ||
				strings.Contains(origin, ".ngrok-free.dev")
		}
		c = cors.New(cors.Options{
			AllowOriginRequestFunc: allowOrigin,
			AllowCredentials:       true,
			AllowedHeaders:         []string{"Authorization", "Content-Type"},
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      c.Handler(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	// Graceful Shutdown
	go func() {
		log.Printf("server listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	roomManager.Stop()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}
	log.Println("server stopped")
}

func stringList(s string) []string {
	var out []string
	for _, v := range strings.Split(s, ",") {
		if t := strings.TrimSpace(v); t != "" {
			out = append(out, t)
		}
	}
	return out
}
