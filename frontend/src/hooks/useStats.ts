/**
 * useStats — загрузка online и active_players_7d с GET /api/stats.
 * Heartbeat каждые 30 сек для presence.
 */
import { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '@/store'
import { useTelegram } from '@/features/auth'
import { apiGet, ApiError } from '@/shared/api'
import type { StatsResponse } from '@/shared/api'

const HEARTBEAT_INTERVAL_MS = 30_000

export function useStats() {
  const { initData } = useTelegram()
  const { setStats } = useGameStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStats = useCallback(async () => {
    if (!initData) return

    try {
      const data = await apiGet<StatsResponse>('/api/stats', initData)
      setStats(Number(data.online) || 0, Number(data.active_players_7d) || 0)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return
      console.warn('[useStats]', e)
    }
  }, [initData, setStats])

  useEffect(() => {
    if (!initData) return

    fetchStats()
    intervalRef.current = setInterval(fetchStats, HEARTBEAT_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [initData, fetchStats])

  return { refetch: fetchStats }
}
