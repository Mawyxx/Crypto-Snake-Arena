package repository

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("user not found")

// UserResolverDB реализует ws.UserResolver — получение userID по tg_id.
type UserResolverDB struct {
	db *gorm.DB
}

// NewUserResolverDB создаёт резолвер.
func NewUserResolverDB(db *gorm.DB) *UserResolverDB {
	return &UserResolverDB{db: db}
}

// GetUserIDByTgID возвращает внутренний ID пользователя по Telegram ID.
func (r *UserResolverDB) GetUserIDByTgID(ctx context.Context, tgID int64) (uint, error) {
	var user domain.User
	err := r.db.WithContext(ctx).Where("tg_id = ?", tgID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, ErrUserNotFound
		}
		return 0, err
	}
	return user.ID, nil
}

// GetUserByTgID возвращает пользователя по Telegram ID.
func (r *UserResolverDB) GetUserByTgID(ctx context.Context, tgID int64) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).Where("tg_id = ?", tgID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

// GetOrCreateUser возвращает пользователя по tg_id или создаёт нового. Обновляет display_name при наличии.
// startParam: r_123456 — при создании нового пользователя создаёт реферальную связь.
func (r *UserResolverDB) GetOrCreateUser(ctx context.Context, tgID int64, username, displayName, startParam string) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).Where("tg_id = ?", tgID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = domain.User{
				TgID:        tgID,
				Username:    username,
				DisplayName: displayName,
			}
			if err := r.db.WithContext(ctx).Create(&user).Error; err != nil {
				return nil, err
			}
			// Реферал: startParam = r_{referrer_tg_id}
			if strings.HasPrefix(startParam, "r_") {
				refIDStr := strings.TrimPrefix(startParam, "r_")
				if refTgID, parseErr := strconv.ParseInt(refIDStr, 10, 64); parseErr == nil && refTgID != tgID {
					var referrer domain.User
					if r.db.WithContext(ctx).Where("tg_id = ?", refTgID).First(&referrer).Error == nil {
						_ = r.db.WithContext(ctx).Create(&domain.Referral{
							ReferrerID: referrer.ID,
							ReferredID: user.ID,
						}).Error
						user.ReferredBy = &referrer.ID
						_ = r.db.WithContext(ctx).Model(&user).Update("referred_by", referrer.ID)
					}
				}
			}
			return &user, nil
		}
		return nil, err
	}
	if displayName != "" && user.DisplayName != displayName {
		user.DisplayName = displayName
		_ = r.db.WithContext(ctx).Model(&user).Update("display_name", displayName)
	}
	return &user, nil
}

// UpdateUserPhotoURL обновляет photo_url пользователя.
func (r *UserResolverDB) UpdateUserPhotoURL(ctx context.Context, userID uint, photoURL string) error {
	return r.db.WithContext(ctx).Model(&domain.User{}).Where("id = ?", userID).Update("photo_url", photoURL).Error
}

// GetReferralStats возвращает количество приглашённых и сумму заработка.
func (r *UserResolverDB) GetReferralStats(ctx context.Context, userID uint) (invited int, earned float64, err error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.Referral{}).Where("referrer_id = ?", userID).Count(&count).Error; err != nil {
		return 0, 0, err
	}
	var sum float64
	r.db.WithContext(ctx).Model(&domain.ReferralEarning{}).Where("referrer_id = ?", userID).Select("COALESCE(SUM(amount), 0)").Scan(&sum)
	return int(count), sum, nil
}

// GetUserStats возвращает игры, объём депозитов, выводов и игровой профит.
// Один SQL-запрос вместо четырёх — использует idx_transactions_user_type.
func (r *UserResolverDB) GetUserStats(ctx context.Context, userID uint) (gamesPlayed int, totalDeposited, totalWithdrawn, totalProfit float64, err error) {
	var result struct {
		Games     int64   `gorm:"column:games"`
		Deposited float64 `gorm:"column:deposited"`
		Withdrawn float64 `gorm:"column:withdrawn"`
		Profit    float64 `gorm:"column:profit"`
	}
	err = r.db.WithContext(ctx).Raw(`
		SELECT
			(SELECT COUNT(*) FROM transactions WHERE user_id = ? AND type = 'game_entry')::bigint AS games,
			(SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = ? AND type = 'deposit' AND amount > 0) AS deposited,
			(SELECT COALESCE(SUM(ABS(amount)), 0) FROM transactions WHERE user_id = ? AND type = 'withdraw') AS withdrawn,
			(SELECT COALESCE(SUM(profit), 0) FROM game_results WHERE user_id = ?) AS profit
	`, userID, userID, userID, userID).Scan(&result).Error
	if err != nil {
		return 0, 0, 0, 0, err
	}
	return int(result.Games), result.Deposited, result.Withdrawn, result.Profit, nil
}

// ReferralEntry — запись приглашённого друга для UI.
type ReferralEntry struct {
	ReferredID  uint    `json:"referred_id"`
	DisplayName string  `json:"display_name"`
	AvatarURL   string  `json:"avatar_url"`
	JoinedAt    int64   `json:"joined_at"`   // Unix ms
	EarnedFrom  float64 `json:"earned_from"` // сумма с этого друга
}

// GetReferrals возвращает список приглашённых пользователем друзей (limit 20).
func (r *UserResolverDB) GetReferrals(ctx context.Context, referrerID uint, limit int) ([]ReferralEntry, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 50 {
		limit = 50
	}
	var rows []struct {
		ReferredID  uint
		DisplayName string
		PhotoURL    string
		JoinedAt    time.Time
		EarnedFrom  float64
	}
	err := r.db.WithContext(ctx).Raw(`
		SELECT ref.referred_id,
			COALESCE(NULLIF(u.display_name, ''), u.username, 'Игрок') as display_name,
			COALESCE(u.photo_url, '') as photo_url,
			ref.created_at as joined_at,
			COALESCE(earn.total, 0) as earned_from
		FROM referrals ref
		JOIN users u ON u.id = ref.referred_id
		LEFT JOIN (
			SELECT referred_id, SUM(amount) as total
			FROM referral_earnings
			WHERE referrer_id = ? AND referred_id > 0
			GROUP BY referred_id
		) earn ON earn.referred_id = ref.referred_id
		WHERE ref.referrer_id = ?
		ORDER BY ref.created_at DESC
		LIMIT ?
	`, referrerID, referrerID, limit).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]ReferralEntry, len(rows))
	for i, row := range rows {
		result[i] = ReferralEntry{
			ReferredID:  row.ReferredID,
			DisplayName: row.DisplayName,
			AvatarURL:   row.PhotoURL,
			JoinedAt:    row.JoinedAt.UnixMilli(),
			EarnedFrom:  row.EarnedFrom,
		}
	}
	return result, nil
}

// LeaderboardEntry — запись в таблице лидеров.
type LeaderboardEntry struct {
	Rank        int     `json:"rank"`
	UserID      uint    `json:"user_id"`
	DisplayName string  `json:"display_name"`
	AvatarURL   string  `json:"avatar_url"`
	TotalProfit float64 `json:"total_profit"`
}

// GetUserRank возвращает позицию пользователя по total_profit (1 = лучший).
// Использует user.Rank если > 0 (кэш), иначе вычисляет на лету.
func (r *UserResolverDB) GetUserRank(ctx context.Context, userID uint, cachedRank int) (int, error) {
	if cachedRank > 0 {
		return cachedRank, nil
	}
	var myTotal float64
	r.db.WithContext(ctx).Model(&domain.GameResult{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(profit), 0)").Scan(&myTotal)
	var betterCount int64
	r.db.WithContext(ctx).Raw(`
		SELECT COUNT(*) FROM (
			SELECT user_id FROM game_results GROUP BY user_id
			HAVING SUM(profit) > ?
		) t
	`, myTotal).Scan(&betterCount)
	return int(betterCount) + 1, nil
}

// GetActivePlayersCount7d возвращает количество уникальных игроков, сыгравших хотя бы раз за последние 7 дней.
func (r *UserResolverDB) GetActivePlayersCount7d(ctx context.Context) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).Raw(`
		SELECT COUNT(DISTINCT user_id) FROM game_results
		WHERE created_at >= NOW() - INTERVAL '7 days'
	`).Scan(&count).Error
	if err != nil {
		return 0, err
	}
	return int(count), nil
}

// GetLeaderboard возвращает топ игроков по total_profit.
func (r *UserResolverDB) GetLeaderboard(ctx context.Context, limit int) ([]LeaderboardEntry, error) {
	if limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}
	var rows []struct {
		UserID      uint
		DisplayName string
		PhotoURL    string
		TotalProfit float64
	}
	err := r.db.WithContext(ctx).Table("game_results").
		Select("game_results.user_id, COALESCE(NULLIF(users.display_name, ''), users.username, 'Игрок') as display_name, COALESCE(users.photo_url, '') as photo_url, SUM(game_results.profit) as total_profit").
		Joins("JOIN users ON users.id = game_results.user_id").
		Group("game_results.user_id, users.display_name, users.username, users.photo_url").
		Order("total_profit DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]LeaderboardEntry, len(rows))
	for i, row := range rows {
		result[i] = LeaderboardEntry{
			Rank:        i + 1,
			UserID:      row.UserID,
			DisplayName: row.DisplayName,
			AvatarURL:   row.PhotoURL,
			TotalProfit: row.TotalProfit,
		}
	}
	if len(result) == 0 {
		result = []LeaderboardEntry{}
	}
	return result, nil
}

// RecentGameEntry — запись последней игры для UI.
type RecentGameEntry struct {
	ID             uint     `json:"id"`
	OpponentName   string   `json:"opponent_name"`
	OpponentAvatar *string  `json:"opponent_avatar"` // null, users не хранит фото
	Profit         float64  `json:"profit"`
	Status         string   `json:"status"`    // "win" | "loss" | "draw"
	Duration       int      `json:"duration"`  // seconds
	CreatedAt      int64    `json:"created_at"` // Unix ms
}

// GetRecentGames возвращает последние игры пользователя (limit 20).
func (r *UserResolverDB) GetRecentGames(ctx context.Context, userID uint, limit int) ([]RecentGameEntry, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 50 {
		limit = 50
	}
	var rows []struct {
		ID           uint
		Profit       float64
		Status       string
		Duration     int
		CreatedAt    time.Time
		OpponentName *string
	}
	err := r.db.WithContext(ctx).Raw(`
		SELECT gr.id, gr.profit, COALESCE(NULLIF(gr.status, ''), CASE WHEN gr.profit > 0 THEN 'win' ELSE 'loss' END) as status,
			COALESCE(gr.duration, 0) as duration, gr.created_at,
			CASE WHEN opp.user_id IS NULL THEN 'Арена'
				ELSE COALESCE(NULLIF(u.display_name, ''), u.username, 'Игрок') END as opponent_name
		FROM game_results gr
		LEFT JOIN LATERAL (
			SELECT o.user_id FROM game_results o
			WHERE o.room_id = gr.room_id AND o.user_id != gr.user_id
			LIMIT 1
		) opp ON true
		LEFT JOIN users u ON u.id = opp.user_id
		WHERE gr.user_id = ?
		ORDER BY gr.created_at DESC
		LIMIT ?
	`, userID, limit).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]RecentGameEntry, len(rows))
	for i, row := range rows {
		oppName := "Арена"
		if row.OpponentName != nil && *row.OpponentName != "" {
			oppName = *row.OpponentName
		}
		status := row.Status
		if status == "" {
			if row.Profit > 0 {
				status = "win"
			} else {
				status = "loss"
			}
		}
		result[i] = RecentGameEntry{
			ID:           row.ID,
			OpponentName: oppName,
			Profit:       row.Profit,
			Status:       status,
			Duration:     row.Duration,
			CreatedAt:    row.CreatedAt.UnixMilli(),
		}
	}
	return result, nil
}
