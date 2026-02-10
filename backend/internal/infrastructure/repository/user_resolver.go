package repository

import (
	"context"
	"errors"
	"strconv"
	"strings"

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

// GetUserStats возвращает игры, объём депозитов и выводов.
func (r *UserResolverDB) GetUserStats(ctx context.Context, userID uint) (gamesPlayed int, totalDeposited, totalWithdrawn float64, err error) {
	var games int64
	r.db.WithContext(ctx).Model(&domain.Transaction{}).
		Where("user_id = ? AND type = ?", userID, "game_entry").
		Count(&games)
	var deposited, withdrawn float64
	r.db.WithContext(ctx).Model(&domain.Transaction{}).
		Where("user_id = ? AND type = ? AND amount > 0", userID, "deposit").
		Select("COALESCE(SUM(amount), 0)").Scan(&deposited)
	r.db.WithContext(ctx).Model(&domain.Transaction{}).
		Where("user_id = ? AND type = ?", userID, "withdraw").
		Select("COALESCE(SUM(ABS(amount)), 0)").Scan(&withdrawn)
	return int(games), deposited, withdrawn, nil
}
