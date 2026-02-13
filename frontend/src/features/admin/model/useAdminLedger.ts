/**
 * useAdminLedger — пагинация по логу ledger.
 */
import { useCallback, useEffect, useState } from 'react'
import { useTelegram } from '@/features/auth'
import { fetchAdminLedger } from '../api/adminApi'
import type { LedgerResponse } from '@/shared/api'

interface UseAdminLedgerParams {
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export function useAdminLedger(params: UseAdminLedgerParams = {}) {
  const { initData } = useTelegram()
  const [data, setData] = useState<LedgerResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { from, to, limit, offset } = params
  const refetch = useCallback(async () => {
    if (!initData) return
    setLoading(true)
    setError(null)
    try {
      const d = await fetchAdminLedger(initData, { from, to, limit, offset })
      setData(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [initData, from, to, limit, offset])

  useEffect(() => {
    if (initData) refetch()
  }, [initData, refetch])

  return { data, loading, error, refetch }
}
