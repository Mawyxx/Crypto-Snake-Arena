import type { game } from '@/shared/api/proto/game'

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'closed'
  | 'failed'
  | 'queued'

export interface InterpolatedSnake extends game.ISnake {
  head: { x: number; y: number }
  angle: number
  boost?: boolean
}

export interface InterpolatedWorldSnapshot {
  tick?: number | null
  snakes?: InterpolatedSnake[]
  coins?: game.ICoin[] | null
  timestamp?: number
}

export interface GameEngineOptions {
  localSnakeId?: number | null
  onDeath?: (score: number) => void
  onDeathDetected?: (snake: game.ISnake, score: number) => void
  onGrow?: () => void
  onCashOut?: (reward: number, score: number) => void
  enabled?: boolean
}
