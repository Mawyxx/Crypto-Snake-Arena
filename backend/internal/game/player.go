package game

// Player — подключённый игрок на арене.
// TgID — Telegram user ID, используется как snake ID в Protobuf (фронт ожидает tg_id).
// UserID — внутренний DB ID, для операций с кошельком.
type Player struct {
	TgID     uint64  // ID змейки в игре (= Telegram user ID)
	UserID   uint    // Внутренний ID для PlaceBet, AddGameReward
	EntryFee float64 // Ставка при входе
}

// PlayerInput — команда управления от клиента.
type PlayerInput struct {
	PlayerID uint64
	Angle    float64
	Boost    bool
}
