/**
 * useAdminDashboard — загрузка дашборда админки.
 */
import { useCallback, useEffect, useState } from 'react'
import { useTelegram } from '@/features/auth'
import { fetchAdminDashboard } from '../api/adminApi'
import type { DashboardSummary } from '@/shared/api'

export function useAdminDashboard() {
  const { initData } = useTelegram()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!initData) return
    setLoading(true)
    setError(null)
    try {
      const d = await fetchAdminDashboard(initData)
      setData(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [initData])

  useEffect(() => {
    if (initData) refetch()
  }, [initData, refetch])

  return { data, loading, error, refetch }
}
