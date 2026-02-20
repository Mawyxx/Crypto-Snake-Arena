import type { game } from '@/shared/api/proto/game'

export interface SnapshotFrame {
  tick: number
  timestamp: number
  snakes: game.ISnake[]
  coins: game.ICoin[]
}

export interface InterpolationInput {
  prev: SnapshotFrame
  curr: SnapshotFrame
  alpha: number
}

export interface ISnapshotBuffer {
  push(frame: SnapshotFrame): void
  getInterpolated(renderTime: number): SnapshotFrame | null
  getInterpolationInput(renderTime: number): InterpolationInput | null
  clear(): void
}
