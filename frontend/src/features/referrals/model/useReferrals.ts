/**
 * useReferrals — загрузка списка приглашённых друзей с GET /api/user/referrals.
 */
import { useCallback, useEffect, useState } from 'react'
import { useTelegram } from '@/features/auth'
import { apiGet, ApiError } from '@/shared/api'
import type { ReferralEntry } from '@/shared/api'

export type { ReferralEntry }

export function useReferrals(options?: { limit?: number; refetchOnMount?: boolean }) {
  const { initData } = useTelegram()
  const limit = options?.limit ?? 20
  const refetchOnMount = options?.refetchOnMount ?? true
  const [entries, setEntries] = useState<ReferralEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!initData) {
      setLoading(false)
      setEntries([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const raw = await apiGet<ReferralEntry[]>(`/api/user/referrals?limit=${limit}`, initData)
      const data = Array.isArray(raw) ? raw : []
      const entries: ReferralEntry[] = data.map((e) => ({
        referred_id: Number(e.referred_id) || 0,
        display_name: (String(e.display_name ?? '').trim()) || '',
        avatar_url: (e.avatar_url && String(e.avatar_url).trim()) || null,
        joined_at: Number(e.joined_at) || 0,
        earned_from: Number(e.earned_from) || 0,
      }))
      setEntries(entries)
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 404)) {
        setEntries([])
        return
      }
      const msg = e instanceof Error ? e.message : 'Failed to load referrals'
      setError(msg)
      console.warn('[useReferrals]', e)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [initData, limit])

  useEffect(() => {
    if (refetchOnMount) {
      refetch()
    }
  }, [refetchOnMount, refetch])

  return { entries, loading, error, refetch }
}
