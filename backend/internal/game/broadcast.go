package game

import (
	gamepb "github.com/crypto-snake-arena/server/proto"
	"google.golang.org/protobuf/proto"
)

// broadcastSnapshot рассылает WorldSnapshot всем подписчикам. RLock для snakes/coins, subscribersMu для subs.
func (r *Room) broadcastSnapshot() {
	r.Mu.RLock()
	snakes := make([]*gamepb.Snake, 0, len(r.Snakes))
	for id, s := range r.Snakes {
		body := s.Body()
		pbBody := make([]*gamepb.Point, 0, len(body))
		for _, p := range body {
			pbBody = append(pbBody, &gamepb.Point{X: float32(p.X), Y: float32(p.Y)})
		}
		snakes = append(snakes, &gamepb.Snake{
			Id:         id,
			Head:       &gamepb.Point{X: float32(s.HeadX), Y: float32(s.HeadY)},
			Body:       pbBody,
			Angle:      float32(s.CurrentAngle),
			Score:      float32(s.Score),
			BodyLength: int32(len(body)),
			SkinId:     s.SkinID,
		})
	}
	coins := make([]*gamepb.Coin, 0, len(r.Coins))
	for id, c := range r.Coins {
		coin := &gamepb.Coin{
			Id:    id,
			Pos:   &gamepb.Point{X: float32(c.X), Y: float32(c.Y)},
			Value: float32(c.Value),
		}
		if c.ConsumingSnakeID != 0 {
			sid := c.ConsumingSnakeID
			coin.ConsumingSnakeId = &sid
		}
		coins = append(coins, coin)
	}
	r.Mu.RUnlock()

	r.subscribersMu.RLock()
	stopping := r.stopping
	subs := make([]*subscriber, len(r.subscribers))
	copy(subs, r.subscribers)
	r.subscribersMu.RUnlock()

	if stopping {
		return
	}
	for _, sub := range subs {
		snapshot := r.buildSnapshotForSubscriber(snakes, coins, sub)
		data, err := proto.Marshal(snapshot)
		if err != nil {
			continue
		}
		select {
		case sub.ch <- data:
			sub.firstSnapshot = false
		default:
			// Канал полон — пропускаем кадр для этого клиента
		}
	}
}

// buildSnapshotForSubscriber строит snapshot для подписчика. Для своей змеи (id == sub.snakeID)
// при !firstSnapshot — omit body, оставляем body_length. Первый snapshot — полный body.
func (r *Room) buildSnapshotForSubscriber(snakes []*gamepb.Snake, coins []*gamepb.Coin, sub *subscriber) *gamepb.WorldSnapshot {
	pbSnakes := make([]*gamepb.Snake, 0, len(snakes))
	for _, s := range snakes {
		snake := &gamepb.Snake{
			Id:         s.Id,
			Head:       s.Head,
			Body:       s.Body,
			Angle:      s.Angle,
			Score:      s.Score,
			BodyLength: s.BodyLength,
			SkinId:     s.SkinId,
		}
		// Always send body (from headPath) for interpolation; omit optimization removed for headPath consistency
		pbSnakes = append(pbSnakes, snake)
	}
	return &gamepb.WorldSnapshot{
		Tick:   r.CurrentTick,
		Snakes: pbSnakes,
		Coins:  coins,
	}
}
