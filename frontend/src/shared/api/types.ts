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
