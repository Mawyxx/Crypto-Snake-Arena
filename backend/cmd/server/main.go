package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	httphandler "github.com/crypto-snake-arena/server/internal/delivery/http"
	"github.com/crypto-snake-arena/server/internal/delivery/ws"
	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/game"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
	"github.com/crypto-snake-arena/server/internal/usecase"
	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	"github.com/crypto-snake-arena/server/internal/infrastructure/presence"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
	"github.com/crypto-snake-arena/server/internal/logger"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"github.com/rs/cors"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		// ignore: using env vars
	}
	logger.Init()
	log := zap.L()

	// Postgres
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=crypto_snake port=5432 sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{SkipDefaultTransaction: true})
	if err != nil {
		log.Fatal("failed to connect to postgres", zap.Error(err))
	}
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("failed to get sql.DB", zap.Error(err))
	}
	sqlDB.SetMaxOpenConns(50) // лимит при наплыве игроков
	sqlDB.SetMaxIdleConns(10) // пул простаивающих соединений
	if err := db.AutoMigrate(&domain.User{}, &domain.Transaction{}, &domain.Referral{}, &domain.ReferralEarning{}, &domain.GameResult{}, &domain.RevenueLog{}, &domain.PendingReward{}); err != nil {
		log.Fatal("failed to migrate", zap.Error(err))
	}
	// Миграции 012, 013 (idempotent)
	if err := runAdminLedgerMigration(db); err != nil {
		log.Warn("admin_revenue_ledger migration failed (table may exist)", zap.Error(err))
	}
	if err := runPendingRewardsMigration(db); err != nil {
		log.Warn("pending_rewards migration failed (table may exist)", zap.Error(err))
	}
	log.Info("postgres connected, migrations applied")

	// Auth
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		log.Warn("TELEGRAM_BOT_TOKEN not set, auth will fail")
	}
	validator := auth.NewValidator(botToken)

	// AdminRepository для admin_revenue_ledger (миграция 012)
	adminRepo := repository.NewAdminRepository(db)
	txManager := payment.NewTxManager(db, adminRepo)
	pendingRewardRepo := repository.NewPendingRewardRepository(db)
	rewardService := usecase.NewRewardService(txManager, pendingRewardRepo, log)
	userResolver := repository.NewUserResolverDB(db)

	// Контекст для фоновых задач (processor останавливается при cancel)
	procCtx, procCancel := context.WithCancel(context.Background())
	defer procCancel()
	rewardService.StartProcessor(procCtx)

	// Менеджер комнат: RewardCreditor = rewardService (fallback в pending_rewards при ошибке)
	roomManager := game.NewRoomManager(rewardService, txManager, txManager, txManager)
	log.Info("room manager started")

	// WebSocket handler (GameWallet = rewardService)
	wsHandler := ws.NewHandler(rewardService, validator, userResolver)

	// Redis для presence (online-счётчик, multi-instance)
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	var rdb *redis.Client
	if strings.HasPrefix(redisURL, "redis://") || strings.HasPrefix(redisURL, "rediss://") {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Fatal("redis parse URL failed", zap.Error(err))
		}
		rdb = redis.NewClient(opt)
	} else {
		rdb = redis.NewClient(&redis.Options{Addr: redisURL})
	}
	rdbCtx, rdbCancel := context.WithTimeout(context.Background(), 5*time.Second)
	if err := rdb.Ping(rdbCtx).Err(); err != nil {
		log.Fatal("redis connect failed", zap.Error(err))
	}
	rdbCancel()
	defer rdb.Close()
	log.Info("redis connected")

	presenceStore := presence.NewRedisStore(rdb)

	// Фоновая задача: обновление rank в users раз в 15 мин
	go func() {
		ticker := time.NewTicker(15 * time.Minute)
		defer ticker.Stop()
		updateRanks := func() {
			if err := db.Exec(`
				WITH t AS (SELECT user_id, SUM(profit) as total FROM game_results GROUP BY user_id),
				ranked AS (SELECT user_id, ROW_NUMBER() OVER (ORDER BY total DESC, user_id ASC)::int as r FROM t)
				UPDATE users u SET rank = ranked.r FROM ranked WHERE u.id = ranked.user_id
			`).Error; err != nil {
				log.Error("rank-updater failed", zap.Error(err))
			}
			if err := db.Exec(`UPDATE users u SET rank = 0 WHERE NOT EXISTS (SELECT 1 FROM game_results g WHERE g.user_id = u.id)`).Error; err != nil {
				log.Error("rank-updater unranked failed", zap.Error(err))
			}
		}
		updateRanks() // первый раз сразу после старта
		for range ticker.C {
			updateRanks()
		}
	}()

	// HTTP handler (REST API)
	webhookSecret := os.Getenv("WEBHOOK_SECRET_TOKEN")
	platformStats := repository.NewPlatformStatsDB(db)
	adminTgID := int64(0)
	if s := os.Getenv("ADMIN_TG_ID"); s != "" {
		if n, err := strconv.ParseInt(s, 10, 64); err == nil {
			adminTgID = n
		}
	}
	addBalanceSecret := os.Getenv("ADD_BALANCE_SECRET")
	httpHandler := httphandler.NewHandler(validator, userResolver, presenceStore, platformStats, adminRepo, txManager, adminTgID, botToken, webhookSecret, addBalanceSecret)

	// Router
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		log.Debug("health check", zap.String("remote", r.RemoteAddr))
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
		fs := noDirListingFileServer(http.Dir(staticDir))
		indexPath := filepath.Join(staticDir, "index.html")
		mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.HasPrefix(r.URL.Path, "/api") || strings.HasPrefix(r.URL.Path, "/ws") {
				http.NotFound(w, r)
				return
			}
			if r.URL.Path == "/" || r.URL.Path == "" || !strings.Contains(r.URL.Path, ".") {
				w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
				http.ServeFile(w, r, indexPath)
				return
			}
			// Отключаем кэш для JS/CSS — всегда свежая версия
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			fs.ServeHTTP(w, r)
		}))
		log.Info("serving static", zap.String("dir", staticDir))
	} else {
		log.Info("STATIC_DIR not found, API only mode")
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
				strings.Contains(origin, ".ngrok-free.dev") ||
				strings.Contains(origin, "arrenasnake.net")
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
		log.Info("server listening", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server error", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("shutting down...")

	procCancel() // останавливаем pending reward processor

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	roomManager.Stop()
	if err := srv.Shutdown(ctx); err != nil {
		log.Error("server shutdown error", zap.Error(err))
	}
	log.Info("server stopped")
}

func runAdminLedgerMigration(db *gorm.DB) error {
	return runSQLMigration(db, "012_admin_revenue_ledger.sql")
}

func runPendingRewardsMigration(db *gorm.DB) error {
	return runSQLMigration(db, "013_pending_rewards.sql")
}

func runSQLMigration(db *gorm.DB, filename string) error {
	for _, dir := range []string{"migrations", "../migrations", "../../migrations", "backend/migrations"} {
		path := filepath.Join(dir, filename)
		if _, err := os.Stat(path); err == nil {
			raw, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			return db.Exec(string(raw)).Error
		}
	}
	return os.ErrNotExist
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

// noDirFS wraps http.FileSystem to return 404 for directory requests (prevents directory listing).
type noDirFS struct {
	fs http.FileSystem
}

func (d noDirFS) Open(name string) (http.File, error) {
	f, err := d.fs.Open(name)
	if err != nil {
		return nil, err
	}
	stat, err := f.Stat()
	if err != nil {
		f.Close()
		return nil, err
	}
	if stat.IsDir() {
		f.Close()
		return nil, os.ErrNotExist
	}
	return f, nil
}

func noDirListingFileServer(dir http.Dir) http.Handler {
	return http.FileServer(noDirFS{fs: dir})
}
