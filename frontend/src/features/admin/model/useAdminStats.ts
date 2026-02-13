/**
 * useAdminStats — агрегаты за период.
 */
import { useCallback, useEffect, useState } from 'react'
import { useTelegram } from '@/features/auth'
import { fetchAdminStats } from '../api/adminApi'
import type { PeriodStats } from '@/shared/api'

export function useAdminStats(period: 'day' | 'week' | 'month' = 'day') {
  const { initData } = useTelegram()
  const [data, setData] = useState<PeriodStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!initData) return
    setLoading(true)
    setError(null)
    try {
      const d = await fetchAdminStats(initData, period)
      setData(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [initData, period])

  useEffect(() => {
    if (initData) refetch()
  }, [initData, period, refetch])

  return { data, loading, error, refetch }
}
