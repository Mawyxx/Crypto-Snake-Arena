package repository

import (
	"bytes"
	"context"
	"encoding/csv"
	"strconv"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DashboardSummary — данные из VIEW admin_dashboard_summary.
type DashboardSummary struct {
	TotalPlayersWithRevenue int64   `json:"total_players_with_revenue"`
	TotalGames              int64   `json:"total_games"`
	TotalNetProfit          float64 `json:"total_net_profit"`
	AvgProfitPerDeath       float64 `json:"avg_profit_per_death"`
}

// LedgerEntry — запись лога для API.
type LedgerEntry struct {
	ID          string   `json:"id"`
	GameID      *string  `json:"game_id,omitempty"`
	PlayerID    *int64   `json:"player_id,omitempty"`
	EntryFee    float64  `json:"entry_fee"`
	PlatformFee float64  `json:"platform_fee"`
	Type        string   `json:"type"`
	CreatedAt   string   `json:"created_at"`
}

// PeriodStats — агрегаты за период.
type PeriodStats struct {
	TotalProfit   float64 `json:"total_profit" gorm:"column:total_profit"`
	DeathCount    int64   `json:"death_count" gorm:"column:death_count"`
	ExpiredCount  int64   `json:"expired_count" gorm:"column:expired_count"`
	WithdrawCount int64   `json:"withdraw_count" gorm:"column:withdraw_count"`
}

// AdminRepository — репозиторий для админ-панели.
type AdminRepository struct {
	db *gorm.DB
}

// NewAdminRepository создаёт репозиторий.
func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

// AppendLedgerEntry добавляет запись в admin_revenue_ledger. Если db != nil — используется он (в рамках транзакции).
func (r *AdminRepository) AppendLedgerEntry(ctx context.Context, db *gorm.DB, gameID *string, playerID *int64, entryFee, platformFee float64, entryType string) error {
	e := domain.AdminLedgerEntry{
		ID:          uuid.New().String(),
		GameID:      gameID,
		PlayerID:    playerID,
		EntryFee:    entryFee,
		PlatformFee: platformFee,
		Type:        entryType,
	}
	d := r.db
	if db != nil {
		d = db
	}
	return d.WithContext(ctx).Create(&e).Error
}

// GetDashboardSummary читает из VIEW admin_dashboard_summary.
func (r *AdminRepository) GetDashboardSummary(ctx context.Context) (*DashboardSummary, error) {
	var s DashboardSummary
	err := r.db.WithContext(ctx).Raw("SELECT * FROM admin_dashboard_summary").Scan(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// GetLedger возвращает записи лога с пагинацией.
func (r *AdminRepository) GetLedger(ctx context.Context, from, to time.Time, limit, offset int) ([]LedgerEntry, int, error) {
	q := r.db.WithContext(ctx).Model(&domain.AdminLedgerEntry{})
	q = q.Where("created_at >= ? AND created_at <= ?", from, to)

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var rows []domain.AdminLedgerEntry
	if err := q.Order("created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	out := make([]LedgerEntry, 0, len(rows))
	for _, row := range rows {
		e := LedgerEntry{
			ID:          row.ID,
			EntryFee:    row.EntryFee,
			PlatformFee: row.PlatformFee,
			Type:        row.Type,
			CreatedAt:   row.CreatedAt.Format(time.RFC3339),
		}
		if row.GameID != nil {
			e.GameID = row.GameID
		}
		if row.PlayerID != nil {
			e.PlayerID = row.PlayerID
		}
		out = append(out, e)
	}
	return out, int(total), nil
}

// GetStatsByPeriod возвращает агрегаты за период (day, week, month).
func (r *AdminRepository) GetStatsByPeriod(ctx context.Context, period string) (*PeriodStats, error) {
	var start time.Time
	now := time.Now()
	switch period {
	case "day":
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	case "week":
		start = now.AddDate(0, 0, -7)
	case "month":
		start = now.AddDate(0, -1, 0)
	default:
		period = "day"
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	}

	var s PeriodStats
	err := r.db.WithContext(ctx).Raw(
		`SELECT COALESCE(SUM(platform_fee), 0) as total_profit,
			COALESCE(COUNT(*) FILTER (WHERE type = 'death'), 0)::bigint as death_count,
			COALESCE(COUNT(*) FILTER (WHERE type = 'expired'), 0)::bigint as expired_count,
			COALESCE(COUNT(*) FILTER (WHERE type = 'withdrawal'), 0)::bigint as withdraw_count
		FROM admin_revenue_ledger WHERE created_at >= ? AND created_at <= ?`,
		start, now,
	).Scan(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// ExportLedgerCSV возвращает CSV-файл с логом за период.
func (r *AdminRepository) ExportLedgerCSV(ctx context.Context, from, to time.Time) ([]byte, error) {
	var rows []domain.AdminLedgerEntry
	if err := r.db.WithContext(ctx).Where("created_at >= ? AND created_at <= ?", from, to).
		Order("created_at ASC").Find(&rows).Error; err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)
	w.Write([]string{"id", "game_id", "player_id", "entry_fee", "platform_fee", "type", "created_at"})
	for _, row := range rows {
		gid := ""
		if row.GameID != nil {
			gid = *row.GameID
		}
		pid := ""
		if row.PlayerID != nil {
			pid = strconv.FormatInt(*row.PlayerID, 10)
		}
		w.Write([]string{
			row.ID,
			gid,
			pid,
			strconv.FormatFloat(row.EntryFee, 'f', 8, 64),
			strconv.FormatFloat(row.PlatformFee, 'f', 8, 64),
			row.Type,
			row.CreatedAt.Format(time.RFC3339),
		})
	}
	w.Flush()
	if err := w.Error(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
