package game

import (
	"context"
	"math"
	"sync"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

const (
	TickRate     = 50 * time.Millisecond // 20 обновлений в секунду
	MaxDt        = 0.1                   // clamp dt при долгих паузах (GC)
	DropLifeTime = 5000 * time.Millisecond
)

const MaxPlayers = 20

// Минимальный Score (масса), при котором разрешён boost; иначе сервер принудительно выключает.
const MinScoreForBoost = 0.5

type Room struct {
	ID          string
	CurrentTick uint64
	Mu          sync.RWMutex

	// Game State
	Snakes map[uint64]*domain.Snake
	Coins  map[string]*domain.Coin
	Grid   *domain.SpatialGrid

	// Finance
	RewardCreditor      RewardCreditor
	DeathHandler        DeathHandler
	ExpiredCoinsHandler ExpiredCoinsHandler
	ResultRecorder      GameResultRecorder

	// Communication
	Register   chan *Player
	Unregister chan *Player
	Inputs     chan *PlayerInput

	// Broadcast: подписчики получают WorldSnapshot
	subscribersMu sync.RWMutex
	subscribers   []*subscriber

	stopChan    chan struct{}
	stopping    bool   // при Stop — не слать в broadcast, затем закрыть каналы
	onStopped   func(roomID string) // вызывается в конце Stop() с ID комнаты, nil допустим
	onSlotFreed func(*Room)         // вызывается при Unregister (слот освобождён), nil допустим
}

type subscriber struct {
	ch            chan []byte
	snakeID       uint64 // 0 = неизвестно, полный body
	firstSnapshot bool   // первый snapshot — полный body для инициализации клиента
	once          sync.Once
}

func (s *subscriber) close() { s.once.Do(func() { close(s.ch) }) }

func NewRoom(rewardCreditor RewardCreditor, deathHandler DeathHandler, expiredCoinsHandler ExpiredCoinsHandler, resultRecorder GameResultRecorder, onStopped func(roomID string), onSlotFreed func(*Room)) *Room {
	return &Room{
		RewardCreditor:      rewardCreditor,
		DeathHandler:        deathHandler,
		ExpiredCoinsHandler: expiredCoinsHandler,
		ResultRecorder:      resultRecorder,
		onStopped:           onStopped,
		onSlotFreed:         onSlotFreed,
		ID:                  uuid.New().String(),
		Snakes:              make(map[uint64]*domain.Snake),
		Coins:               make(map[string]*domain.Coin),
		Grid:                domain.NewSpatialGrid(2000), // Карта 2000x2000 (Slither.io scale для SegmentLen 42)
		Register:            make(chan *Player),
		Unregister:          make(chan *Player),
		Inputs:              make(chan *PlayerInput, 100), // Буфер на 100 команд
		stopChan:            make(chan struct{}),
	}
}

// Run - главный игровой цикл. Запускается в отдельной горутине.
func (r *Room) Run() {
	ticker := time.NewTicker(TickRate)
	defer ticker.Stop()
	lastTickTime := time.Now()

	for {
		select {
		case <-r.stopChan:
			return

		case player := <-r.Register:
			r.Mu.Lock()
			RegisterPlayer(r, player)
			r.Mu.Unlock()

		case player := <-r.Unregister:
			r.Mu.Lock()
			UnregisterPlayer(r, player)
			r.Mu.Unlock()
			if r.onSlotFreed != nil {
				r.onSlotFreed(r)
			}

		case input := <-r.Inputs:
			r.Mu.Lock()
			if snake, ok := r.Snakes[input.PlayerID]; ok {
				if math.IsNaN(input.Angle) || math.IsInf(input.Angle, 0) {
					r.Mu.Unlock()
					zap.L().Warn("room invalid input angle rejected", zap.Uint64("playerID", input.PlayerID), zap.Float64("angle", input.Angle))
					continue
				}
				snake.SetTargetAngle(input.Angle)
				boost := input.Boost && snake.Score >= MinScoreForBoost
				snake.SetBoost(boost)
			}
			r.Mu.Unlock()

		case <-ticker.C:
			now := time.Now()
			dt := now.Sub(lastTickTime).Seconds()
			lastTickTime = now
			if dt <= 0 {
				dt = 0.001
			}
			if dt > MaxDt {
				dt = MaxDt
			}
			r.CurrentTick++
			r.updateGameState(dt)
			go r.broadcastSnapshot()
		}
	}
}

func (r *Room) updateGameState(dt float64) {
	r.Mu.Lock()
	defer r.Mu.Unlock()

	consumedInTick := make(map[string]bool)

	r.Grid.Clear()
	for _, c := range r.Coins {
		r.Grid.AddCoin(c)
	}

	toDeleteSnakes := MoveSnakes(dt, r.Snakes, r.Grid)
	for _, id := range toDeleteSnakes {
		if snake, ok := r.Snakes[id]; ok {
			ProcessDeath(r, snake)
		}
	}

	toDeleteCoins := ConsumeCoins(r.Snakes, r.Coins, r.Grid, toDeleteSnakes, consumedInTick)

	now := time.Now()
	expiredToDelete, expiredTotal := ExpireCoins(r.Coins, now)
	toDeleteCoins = append(toDeleteCoins, expiredToDelete...)
	for _, id := range expiredToDelete {
		consumedInTick[id] = true
	}

	for _, id := range toDeleteSnakes {
		delete(r.Snakes, id)
	}
	for _, id := range toDeleteCoins {
		delete(r.Coins, id)
	}

	if expiredTotal > 0 && r.ExpiredCoinsHandler != nil {
		roomID := r.ID
		total := expiredTotal
		go func() {
			if err := r.ExpiredCoinsHandler.OnExpiredCoins(context.Background(), roomID, total); err != nil {
				zap.L().Error("room OnExpiredCoins failed", zap.String("roomID", roomID), zap.Float64("totalValue", total), zap.Error(err))
			}
		}()
	}
}

// Subscribe возвращает канал и функцию закрытия (Unsubscribe + close, sync.Once в вызывающем коде).
// snakeID — ID змеи этого игрока; при snakeID != 0 для своей змеи body не шлётся (кроме первого snapshot).
func (r *Room) Subscribe(snakeID uint64) (chan []byte, func()) {
	s := &subscriber{
		ch:            make(chan []byte, 100),
		snakeID:       snakeID,
		firstSnapshot: true,
	}
	r.subscribersMu.Lock()
	r.subscribers = append(r.subscribers, s)
	r.subscribersMu.Unlock()
	return s.ch, func() { r.Unsubscribe(s); s.close() }
}

// Unsubscribe удаляет подписчика из рассылки. Канал закрывает closeFn.
func (r *Room) Unsubscribe(s *subscriber) {
	r.subscribersMu.Lock()
	for i, c := range r.subscribers {
		if c == s {
			r.subscribers = append(r.subscribers[:i], r.subscribers[i+1:]...)
			break
		}
	}
	r.subscribersMu.Unlock()
}

// Stop — мягкая остановка: закрывает broadcast, дренажит Unregister (сохраняет балансы в PG), затем выход.
func (r *Room) Stop() {
	r.subscribersMu.Lock()
	r.stopping = true
	for _, s := range r.subscribers {
		s.close()
	}
	r.subscribers = nil
	r.subscribersMu.Unlock()

	close(r.stopChan)
	time.Sleep(2 * TickRate) // даём broadcastSnapshot завершиться

	DrainUnregister(r, time.Now().Add(3*time.Second))

	r.Mu.Lock()
	SyncBalanceOnShutdown(r)
	r.Mu.Unlock()

	if r.onStopped != nil {
		r.onStopped(r.ID)
	}
}

// PlayerCount возвращает текущее количество игроков в комнате.
func (r *Room) PlayerCount() int {
	r.Mu.RLock()
	defer r.Mu.RUnlock()
	return len(r.Snakes)
}

// CanJoin проверяет, есть ли место в комнате.
func (r *Room) CanJoin() bool {
	return r.PlayerCount() < MaxPlayers
}

// AverageStake — среднее арифметическое актуальных ставок (CurrentScore) всех игроков в комнате.
// Пустая комната возвращает 0.
func (r *Room) AverageStake() float64 {
	r.Mu.RLock()
	defer r.Mu.RUnlock()
	if len(r.Snakes) == 0 {
		return 0
	}
	var sum float64
	for _, s := range r.Snakes {
		sum += s.CurrentScore()
	}
	return sum / float64(len(r.Snakes))
}
