package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
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
	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	"github.com/crypto-snake-arena/server/internal/infrastructure/presence"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
	"github.com/crypto-snake-arena/server/internal/logger"
	"github.com/crypto-snake-arena/server/internal/usecase"
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
	if err := run(log); err != nil {
		log.Fatal("server failed", zap.Error(err))
	}
}

func run(log *zap.Logger) error {
	db, sqlDB, err := setupDB()
	if err != nil {
		return fmt.Errorf("setup db: %w", err)
	}
	defer sqlDB.Close()

	procCtx, procCancel := context.WithCancel(context.Background())
	defer procCancel()

	rdb, err := setupRedis()
	if err != nil {
		return fmt.Errorf("setup redis: %w", err)
	}
	defer rdb.Close()

	roomManager, mux, err := setupHandlers(log, db, rdb, procCtx)
	if err != nil {
		return err
	}

	return runHTTPServer(log, mux, roomManager, procCancel)
}

func setupDB() (*gorm.DB, *sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=crypto_snake port=5432 sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{SkipDefaultTransaction: true})
	if err != nil {
		return nil, nil, fmt.Errorf("connect postgres: %w", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, nil, fmt.Errorf("get sql.DB: %w", err)
	}
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetMaxIdleConns(10)
	if err := db.AutoMigrate(&domain.User{}, &domain.Transaction{}, &domain.Referral{}, &domain.ReferralEarning{}, &domain.GameResult{}, &domain.RevenueLog{}, &domain.PendingReward{}); err != nil {
		return nil, nil, fmt.Errorf("migrate: %w", err)
	}
	if err := runAdminLedgerMigration(db); err != nil {
		zap.L().Warn("admin_revenue_ledger migration failed (table may exist)", zap.Error(err))
	}
	if err := runPendingRewardsMigration(db); err != nil {
		zap.L().Warn("pending_rewards migration failed (table may exist)", zap.Error(err))
	}
	zap.L().Info("postgres connected, migrations applied")
	return db, sqlDB, nil
}

func setupRedis() (*redis.Client, error) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	var rdb *redis.Client
	if strings.HasPrefix(redisURL, "redis://") || strings.HasPrefix(redisURL, "rediss://") {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			return nil, fmt.Errorf("redis parse URL: %w", err)
		}
		rdb = redis.NewClient(opt)
	} else {
		rdb = redis.NewClient(&redis.Options{Addr: redisURL})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis connect: %w", err)
	}
	zap.L().Info("redis connected")
	return rdb, nil
}

func setupHandlers(log *zap.Logger, db *gorm.DB, rdb *redis.Client, procCtx context.Context) (*game.RoomManager, *http.ServeMux, error) {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		log.Warn("TELEGRAM_BOT_TOKEN not set, auth will fail")
	}
	validator := auth.NewValidator(botToken)

	adminRepo := repository.NewAdminRepository(db)
	txManager := payment.NewTxManager(db, adminRepo)
	pendingRewardRepo := repository.NewPendingRewardRepository(db)
	rewardService := usecase.NewRewardService(txManager, pendingRewardRepo, log)
	userResolver := repository.NewUserResolverDB(db)

	rewardService.StartProcessor(procCtx)

	roomManager := game.NewRoomManager(rewardService, txManager, txManager, txManager)
	log.Info("room manager started")

	wsHandler := ws.NewHandler(rewardService, validator, userResolver)

	presenceStore := presence.NewRedisStore(rdb)

	go startRankUpdater(db)

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

	setupStaticFiles(mux, log)

	return roomManager, mux, nil
}

func startRankUpdater(db *gorm.DB) {
	log := zap.L()
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
	updateRanks()
	for range ticker.C {
		updateRanks()
	}
}

func setupStaticFiles(mux *http.ServeMux, log *zap.Logger) {
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
		// deepsource ignore GO-S1034: noDirFS prevents directory listing
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
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			fs.ServeHTTP(w, r)
		}))
		log.Info("serving static", zap.String("dir", staticDir))
	} else {
		log.Info("STATIC_DIR not found, API only mode")
	}
}

func setupCORS() *cors.Cors {
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "*" || allowedOrigins == "all" {
		return cors.AllowAll()
	}
	if allowedOrigins != "" {
		return cors.New(cors.Options{
			AllowedOrigins:   stringList(allowedOrigins),
			AllowCredentials: true,
			AllowedHeaders:   []string{"Authorization", "Content-Type"},
		})
	}
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
	return cors.New(cors.Options{
		AllowOriginRequestFunc: allowOrigin,
		AllowCredentials:      true,
		AllowedHeaders:        []string{"Authorization", "Content-Type"},
	})
}

func getPort() string {
	if p := os.Getenv("PORT"); p != "" {
		return p
	}
	return "8080"
}

func runHTTPServer(log *zap.Logger, mux *http.ServeMux, roomManager *game.RoomManager, procCancel context.CancelFunc) error {
	c := setupCORS()
	srv := &http.Server{
		Addr:         ":" + getPort(),
		Handler:      c.Handler(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Info("server listening", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server error", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("shutting down...")

	procCancel()
	roomManager.Stop()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("server shutdown error", zap.Error(err))
	}
	log.Info("server stopped")
	return nil
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
