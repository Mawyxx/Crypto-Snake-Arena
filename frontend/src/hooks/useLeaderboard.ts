/**
 * useLeaderboard — загрузка топа игроков с GET /api/leaderboard.
 */
import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '@/shared/api'
import type { LeaderboardEntry } from '@/shared/api'

export type { LeaderboardEntry }

export function useLeaderboard(options?: { limit?: number; refetchOnMount?: boolean }) {
  const limit = options?.limit ?? 50
  const refetchOnMount = options?.refetchOnMount ?? true
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await apiGet<LeaderboardEntry[]>(`/api/leaderboard?limit=${limit}`)
      const data = Array.isArray(raw) ? raw : []
      const entries: LeaderboardEntry[] = data.map((e, i) => ({
        rank: Number(e.rank) || i + 1,
        user_id: Number(e.user_id) || 0,
        display_name: (String(e.display_name ?? '').trim()) || '',
        avatar_url: (e.avatar_url && String(e.avatar_url).trim()) || null,
        total_profit: Number(e.total_profit) || 0,
      }))
      setEntries(entries)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load leaderboard'
      setError(msg)
      console.warn('[useLeaderboard]', e)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (refetchOnMount) {
      refetch()
    }
  }, [refetchOnMount, refetch])

  return { entries, loading, error, refetch }
}
