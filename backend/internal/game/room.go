package game

import (
	"context"
	"log"
	"math"
	"math/rand"
	"strconv"
	"sync"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	gamepb "github.com/crypto-snake-arena/server/proto"
	"github.com/google/uuid"
	"google.golang.org/protobuf/proto"
)

const (
	TickRate     = 50 * time.Millisecond // 20 обновлений в секунду
	DropLifeTime = 3000 * time.Millisecond
)

const MaxPlayers = 20

// Максимальный поворот за один тик (рад). Ввод с большей дельтой ограничивается.
const MaxTurnSpeed = 0.2

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
	RewardCreditor    RewardCreditor
	DeathHandler      DeathHandler
	ResultRecorder    GameResultRecorder

	// Communication
	Register   chan *Player
	Unregister chan *Player
	Inputs     chan *PlayerInput

	// Broadcast: подписчики получают WorldSnapshot
	subscribersMu sync.RWMutex
	subscribers   []*subscriber

	stopChan     chan struct{}
	stopping     bool   // при Stop — не слать в broadcast, затем закрыть каналы
	onStopped    func(roomID string) // вызывается в конце Stop() с ID комнаты, nil допустим
	onSlotFreed  func(*Room)         // вызывается при Unregister (слот освобождён), nil допустим
}

type subscriber struct {
	ch   chan []byte
	once sync.Once
}

func (s *subscriber) close() { s.once.Do(func() { close(s.ch) }) }

func NewRoom(rewardCreditor RewardCreditor, deathHandler DeathHandler, resultRecorder GameResultRecorder, onStopped func(roomID string), onSlotFreed func(*Room)) *Room {
	return &Room{
		RewardCreditor: rewardCreditor,
		DeathHandler:   deathHandler,
		ResultRecorder: resultRecorder,
		onStopped:      onStopped,
		onSlotFreed:    onSlotFreed,
		ID:             uuid.New().String(),
		Snakes:         make(map[uint64]*domain.Snake),
		Coins:          make(map[string]*domain.Coin),
		Grid:           domain.NewSpatialGrid(1000), // Карта 1000x1000
		Register:       make(chan *Player),
		Unregister:     make(chan *Player),
		Inputs:         make(chan *PlayerInput, 100), // Буфер на 100 команд
		stopChan:       make(chan struct{}),
	}
}

const spawnTries = 15   // число попыток выбора точки спавна
const spawnMargin = 50  // отступ от края арены (не спавнить у смертельной границы)

// pickSpawnPosition выбирает позицию внутри круглой арены, предпочтительно подальше от других змеек.
func pickSpawnPosition(grid *domain.SpatialGrid, snakes map[uint64]*domain.Snake) (float64, float64) {
	cx, cy := grid.Width/2, grid.Height/2
	arenaRadius := math.Min(grid.Width, grid.Height) / 2
	maxR := arenaRadius - float64(spawnMargin)
	if maxR <= 0 {
		return cx, cy
	}
	minR := float64(spawnMargin)
	if minR >= maxR {
		minR = 0
	}

	heads := make([]domain.Point, 0, len(snakes))
	for _, s := range snakes {
		heads = append(heads, s.Head())
	}

	bestX, bestY := cx, cy
	bestMinDist := -1.0

	for i := 0; i < spawnTries; i++ {
		angle := rand.Float64() * 2 * math.Pi
		r := minR + rand.Float64()*(maxR-minR)
		x := cx + math.Cos(angle)*r
		y := cy + math.Sin(angle)*r

		minDist := 1e9
		if len(heads) == 0 {
			minDist = maxR
		} else {
			for _, h := range heads {
				dx, dy := x-h.X, y-h.Y
				d := math.Sqrt(dx*dx + dy*dy)
				if d < minDist {
					minDist = d
				}
			}
		}
		if minDist > bestMinDist {
			bestMinDist = minDist
			bestX, bestY = x, y
		}
	}
	return bestX, bestY
}

// Run - главный игровой цикл. Запускается в отдельной горутине.
func (r *Room) Run() {
	ticker := time.NewTicker(TickRate)
	defer ticker.Stop()

	for {
		select {
		case <-r.stopChan:
			return // Мягкая остановка комнаты

		// 1. Обработка входящих игроков (TgID = snake ID в Protobuf)
		case player := <-r.Register:
			r.Mu.Lock()
			x, y := pickSpawnPosition(r.Grid, r.Snakes)
			snake := domain.NewSnakeAt(player.TgID, x, y)
			snake.SetEntryFee(player.EntryFee)
			snake.UserID = int64(player.UserID)
			snake.JoinedTick = r.CurrentTick
			r.Snakes[player.TgID] = snake
			r.Mu.Unlock()

		// 2. Обработка выходов (Cash Out только если живой или явный CASH_OUT; мёртвая змейка — без награды)
		case player := <-r.Unregister:
			r.Mu.Lock()
			if snake, ok := r.Snakes[player.TgID]; ok {
				if snake.Score > 0 && !snake.Dead && r.RewardCreditor != nil {
					refID := r.ID + ":unreg:" + strconv.FormatUint(uint64(player.UserID), 10)
					if err := r.RewardCreditor.AddGameReward(context.Background(), player.UserID, snake.Score, refID); err != nil {
						log.Printf("[Room] AddGameReward failed on Unregister: userID=%d score=%.2f err=%v", player.UserID, snake.Score, err)
					}
				}
				if r.ResultRecorder != nil {
					loot := snake.Score
					if snake.Dead {
						loot = 0
					}
					status := "loss"
					if loot > 0 && !snake.Dead {
						status = "win"
					}
					durationSec := int((r.CurrentTick - snake.JoinedTick) * 50 / 1000)
					if durationSec < 0 {
						durationSec = 0
					}
					if err := r.ResultRecorder.RecordGameResult(context.Background(), player.UserID, player.EntryFee, loot, r.ID, status, durationSec); err != nil {
						log.Printf("[Room] RecordGameResult failed on Unregister: userID=%d stake=%.2f loot=%.2f err=%v", player.UserID, player.EntryFee, loot, err)
					}
				}
			}
			delete(r.Snakes, player.TgID)
			r.Mu.Unlock()
			if r.onSlotFreed != nil {
				r.onSlotFreed(r)
			}

		// 3. Обработка ввода (Управление) с серверной валидацией
		case input := <-r.Inputs:
			r.Mu.Lock()
			if snake, ok := r.Snakes[input.PlayerID]; ok {
				// Ограничение угла: дельта не больше MaxTurnSpeed за тик
				delta := normalizeAngle(input.Angle - snake.Angle)
				if delta > MaxTurnSpeed {
					delta = MaxTurnSpeed
				}
				if delta < -MaxTurnSpeed {
					delta = -MaxTurnSpeed
				}
				snake.SetDirection(snake.Angle + delta)
				// Boost только при достаточной массе (Score)
				boost := input.Boost && snake.Score >= MinScoreForBoost
				snake.SetBoost(boost)
			}
			r.Mu.Unlock()

		// 4. ГЛАВНЫЙ ТИК (Физика и логика)
		case <-ticker.C:
			r.CurrentTick++
			r.updateGameState()
			go r.broadcastSnapshot() // Рассылка в отдельной горутине, не блокирует тик
		}
	}
}

func (r *Room) updateGameState() {
	r.Mu.Lock() // Блокируем всю комнату на запись на время расчета (это должно быть супер-быстро)
	defer r.Mu.Unlock()

	toDeleteSnakes := make([]uint64, 0, 8)
	toDeleteCoins := make([]string, 0, 16)
	consumedInTick := make(map[string]bool) // Защита от дюпа: монета, съеденная одной змейкой, недоступна другим в этом тике

	// Очищаем сетку коллизий перед новым кадром
	r.Grid.Clear()

	// Регистрируем существующие монеты в сетке
	for _, c := range r.Coins {
		r.Grid.AddCoin(c)
	}

	// Шаг 1: Движение и заполнение сетки
	for _, snake := range r.Snakes {
		snake.Move()
		if !r.Grid.InBounds(snake.Head()) {
			r.killSnake(snake, &toDeleteSnakes)
			continue
		}
		r.Grid.AddSnake(snake)
	}

	// Шаг 2: Проверка столкновений (Physics)
	for id, snake := range r.Snakes {
		if contains(toDeleteSnakes, id) {
			continue
		}
		dead := false

		otherIDs := r.Grid.GetSnakesInCell(snake.Head(), id)
		for _, otherID := range otherIDs {
			other, ok := r.Snakes[otherID]
			if !ok || contains(toDeleteSnakes, otherID) {
				continue
			}
			myHead := snake.Head()
			for _, seg := range other.Body() {
				if myHead.Distance(seg) < domain.SnakeRadius {
					r.killSnake(snake, &toDeleteSnakes)
					dead = true
					break
				}
			}
			if dead {
				break
			}
		}
		if dead {
			continue
		}

		body := snake.Body()
		for i := 1; i < len(body); i++ {
			if snake.Head().Distance(body[i]) < domain.SnakeRadius {
				r.killSnake(snake, &toDeleteSnakes)
				dead = true
				break
			}
		}
		if dead {
			continue
		}

		coinsInCell := r.Grid.GetCoinsNear(snake.Head())
		for _, coin := range coinsInCell {
			if consumedInTick[coin.ID] {
				continue // Монета уже съедена другой змеёй в этом тике
			}
			if snake.Head().Intersects(coin) {
				snake.Grow()
				snake.AddScore(coin.Value)
				toDeleteCoins = append(toDeleteCoins, coin.ID)
				consumedInTick[coin.ID] = true
			}
		}
	}

	// Шаг 3: Собираем просроченные монеты (TTL)
	now := time.Now()
	for id, coin := range r.Coins {
		if now.After(coin.ExpiresAt) {
			toDeleteCoins = append(toDeleteCoins, id)
			consumedInTick[id] = true
		}
	}

	// Безопасное удаление: строго ПОСЛЕ завершения всех циклов range (через toDelete)
	for _, id := range toDeleteSnakes {
		delete(r.Snakes, id)
	}
	for _, id := range toDeleteCoins {
		delete(r.Coins, id)
	}
}

func (r *Room) killSnake(victim *domain.Snake, toDelete *[]uint64) {
	// Немедленно снимаем с претендентов на награду (Unregister не должен вызывать AddGameReward)
	victim.Dead = true
	// Жертва не получает очки при смерти — только выпадение монет на поле
	// 20% rake — платформа; 30% от rake — рефереру
	victimScore := victim.CurrentScore()
	dropAmount := victimScore * 0.8
	newCoins := domain.SpawnCoins(victim.Body(), dropAmount)
	for _, c := range newCoins {
		r.Coins[c.ID] = c
		r.Grid.AddCoin(c)
	}
	if r.DeathHandler != nil && victim.UserID > 0 && victimScore > 0 {
		refID := r.ID + ":death:" + strconv.FormatUint(victim.ID, 10)
		go func() {
			if err := r.DeathHandler.OnPlayerDeath(context.Background(), uint(victim.UserID), victimScore, refID); err != nil {
				log.Printf("[Room] OnPlayerDeath failed: victimUserID=%d score=%.2f err=%v", victim.UserID, victimScore, err)
			}
		}()
	}
	if r.ResultRecorder != nil && victim.UserID > 0 {
		durationSec := int((r.CurrentTick - victim.JoinedTick) * 50 / 1000)
		if durationSec < 0 {
			durationSec = 0
		}
		go func() {
			if err := r.ResultRecorder.RecordGameResult(context.Background(), uint(victim.UserID), victim.EntryFee, 0, r.ID, "loss", durationSec); err != nil {
				log.Printf("[Room] RecordGameResult failed on killSnake: victimUserID=%d stake=%.2f err=%v", victim.UserID, victim.EntryFee, err)
			}
		}()
	}
	*toDelete = append(*toDelete, victim.ID) // victim.ID = TgID (snake ID)
}

func (r *Room) broadcastSnapshot() {
	// Копируем данные змеек и монет во временную структуру под RLock.
	// proto.Marshal вызывается после снятия блокировки — не держим Mu во время сериализации.
	var snapshot *gamepb.WorldSnapshot
	r.Mu.RLock()
	{
		snapshot = &gamepb.WorldSnapshot{
			Tick:   r.CurrentTick,
			Snakes: make([]*gamepb.Snake, 0, len(r.Snakes)),
			Coins:  make([]*gamepb.Coin, 0, len(r.Coins)),
		}
		for id, s := range r.Snakes {
			body := s.Body()
			pbBody := make([]*gamepb.Point, 0, len(body))
			for _, p := range body {
				pbBody = append(pbBody, &gamepb.Point{X: float32(p.X), Y: float32(p.Y)})
			}
			snapshot.Snakes = append(snapshot.Snakes, &gamepb.Snake{
				Id:    id,
				Head:  &gamepb.Point{X: float32(s.HeadX), Y: float32(s.HeadY)},
				Body:  pbBody,
				Angle: float32(s.Angle),
				Score: float32(s.Score),
			})
		}
		for id, c := range r.Coins {
			snapshot.Coins = append(snapshot.Coins, &gamepb.Coin{
				Id:    id,
				Pos:   &gamepb.Point{X: float32(c.X), Y: float32(c.Y)},
				Value: float32(c.Value),
			})
		}
	}
	r.Mu.RUnlock()

	data, err := proto.Marshal(snapshot)
	if err != nil {
		return
	}

	r.subscribersMu.RLock()
	stopping := r.stopping
	subs := make([]*subscriber, len(r.subscribers))
	copy(subs, r.subscribers)
	r.subscribersMu.RUnlock()

	if stopping {
		return
	}
	for _, s := range subs {
		select {
		case s.ch <- data:
		default:
			// Канал полон — пропускаем кадр для этого клиента
		}
	}
}

// Subscribe возвращает канал и функцию закрытия (Unsubscribe + close, sync.Once в вызывающем коде).
func (r *Room) Subscribe() (chan []byte, func()) {
	s := &subscriber{ch: make(chan []byte, 100)}
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

// Stop — мягкая остановка комнаты. Закрывает все broadcast-каналы, чтобы runWriter могли выйти.
func (r *Room) Stop() {
	r.subscribersMu.Lock()
	r.stopping = true
	r.subscribersMu.Unlock()
	close(r.stopChan)
	// Даём in-flight broadcastSnapshot завершиться (они проверяют stopping)
	time.Sleep(2 * TickRate)
	r.subscribersMu.Lock()
	for _, s := range r.subscribers {
		s.close()
	}
	r.subscribers = nil
	r.subscribersMu.Unlock()
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

// normalizeAngle приводит разницу углов к интервалу (-pi, pi].
func normalizeAngle(delta float64) float64 {
	for delta > math.Pi {
		delta -= 2 * math.Pi
	}
	for delta <= -math.Pi {
		delta += 2 * math.Pi
	}
	return delta
}

func contains(ids []uint64, id uint64) bool {
	for _, v := range ids {
		if v == id {
			return true
		}
	}
	return false
}
