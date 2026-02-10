package auth

import (
	"errors"
	"time"

	initdata "github.com/telegram-mini-apps/init-data-golang"
)

// UserInfo — данные игрока из initData (после валидации).
type UserInfo struct {
	ID         int64  // Telegram user ID
	Username   string
	FirstName  string
	LastName   string
	StartParam string // startapp из ссылки (r_123456 для реферала)
}

// Validator проверяет Telegram InitData.
type Validator struct {
	token string
}

// NewValidator создаёт валидатор.
func NewValidator(token string) *Validator {
	return &Validator{token: token}
}

// Validate проверяет подпись и свежесть данных, возвращает данные игрока из initData.
func (v *Validator) Validate(rawInitData string) (*UserInfo, error) {
	expIn := 1 * time.Hour
	if err := initdata.Validate(rawInitData, v.token, expIn); err != nil {
		return nil, errors.New("invalid or expired init data")
	}
	data, err := initdata.Parse(rawInitData)
	if err != nil {
		return nil, errors.New("failed to parse init data")
	}
	if data.User.ID == 0 {
		return nil, errors.New("user data is missing")
	}
	return &UserInfo{
		ID:         data.User.ID,
		Username:   data.User.Username,
		FirstName:  data.User.FirstName,
		LastName:   data.User.LastName,
		StartParam: data.StartParam,
	}, nil
}
