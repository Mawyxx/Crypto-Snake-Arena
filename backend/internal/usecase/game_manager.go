package usecase

import "context"

// GameManager — управление сессиями: создание комнат, старт/стоп.
// Логика входа в игру реализована в delivery/ws (PlaceBet + Room.Register).
// TODO: рефакторинг — перенести логику сюда при смене архитектуры.
type GameManager struct{}

// NewGameManager создаёт GameManager.
func NewGameManager() *GameManager {
	return &GameManager{}
}

// JoinRoom — заглушка. Реальная логика в ws.Handler.UpgradeAndHandle.
func (gm *GameManager) JoinRoom(_ context.Context, userID int64, roomID string, stake float64) error {
	_ = userID
	_ = roomID
	_ = stake
	return nil
}
