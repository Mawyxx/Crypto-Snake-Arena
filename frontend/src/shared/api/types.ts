/**
 * Shared API response types matching backend.
 */

export interface ProfileResponse {
  user_id: number
  tg_id: number
  username: string
  display_name?: string
  first_name?: string
  last_name?: string
  balance: number
  referral_invited?: number
  referral_earned?: number
  games_played?: number
  total_deposited?: number
  total_withdrawn?: number
  total_profit?: number
  rank?: number
  is_admin?: boolean
}

export interface ConfigResponse {
  bot_username?: string
}

export interface StatsResponse {
  online: number
  active_players_7d: number
}

export interface LeaderboardEntry {
  rank: number
  user_id: number
  display_name: string
  avatar_url?: string | null
  total_profit: number
}

export interface ReferralEntry {
  referred_id: number
  display_name: string
  avatar_url?: string | null
  joined_at: number
  earned_from: number
}

export interface RecentGameEntry {
  id: number
  opponent_name: string
  opponent_avatar?: string | null
  profit: number
  status: 'win' | 'loss'
  duration?: number // seconds
  created_at: number
}

/**
 * WebSocket message types from backend
 */

export interface WebSocketQueueMessage {
  type: 'queue'
  position: number
}

export interface WebSocketCashOutMessage {
  type: 'cash_out'
  reward: number
  score: number
}

export interface WebSocketErrorMessage {
  error: string
}

export type WebSocketMessage = WebSocketQueueMessage | WebSocketCashOutMessage | WebSocketErrorMessage

/**
 * Type guards for WebSocket messages
 */

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isWebSocketQueueMessage(data: unknown): data is WebSocketQueueMessage {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return obj.type === 'queue' && isNumber(obj.position) && obj.position >= 0
}

export function isWebSocketCashOutMessage(data: unknown): data is WebSocketCashOutMessage {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    obj.type === 'cash_out' &&
    isNumber(obj.reward) &&
    isNumber(obj.score) &&
    obj.reward >= 0 &&
    obj.score >= 0
  )
}

export function isWebSocketErrorMessage(data: unknown): data is WebSocketErrorMessage {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return 'error' in obj && isString(obj.error)
}

export function isWebSocketMessage(data: unknown): data is WebSocketMessage {
  return isWebSocketQueueMessage(data) || isWebSocketCashOutMessage(data) || isWebSocketErrorMessage(data)
}
