/**
 * Admin API response types.
 */

export interface DashboardSummary {
  total_players_with_revenue: number
  total_games: number
  total_net_profit: number
  avg_profit_per_death: number
}

export interface LedgerEntry {
  id: string
  game_id?: string
  player_id?: number
  entry_fee: number
  platform_fee: number
  type: string
  created_at: string
}

export interface LedgerResponse {
  entries: LedgerEntry[]
  total: number
}

export interface PeriodStats {
  total_profit: number
  death_count: number
  expired_count: number
  withdraw_count: number
}
