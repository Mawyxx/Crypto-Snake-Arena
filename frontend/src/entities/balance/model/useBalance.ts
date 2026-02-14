/**
 * useBalance — загрузка баланса с GET /api/user/profile.
 * Вызывается при загрузке приложения и после экрана завершения игры.
 */
import { useCallback, useEffect } from 'react'
import { useGameStore } from '@/store'
import { useTelegram } from '@/features/auth'
import { getTelegramUserFromInitData, getDisplayNameFromTelegramUser, getPhotoUrlFromInitData } from '@/shared/lib'
import { apiGet, apiPatch, ApiError } from '@/shared/api'
import type { ProfileResponse } from '@/shared/api'

export function useBalance(options?: { refetchOnMount?: boolean }) {
  const { initData } = useTelegram()
  const { setBalance, setProfile, setReferralStats, setProfileStats, setTotalProfit, setRank, setAdmin } = useGameStore()
  const refetchOnMount = options?.refetchOnMount ?? true

  const refetch = useCallback(async () => {
    if (!initData) return

    try {
      const data = await apiGet<ProfileResponse>('/api/user/profile', initData)
      const balanceVal = typeof data.balance === 'number' ? data.balance : Number(data.balance) || 0
      const rawTgId = data.tg_id
      const tgId =
        typeof rawTgId === 'number' && Number.isFinite(rawTgId)
          ? rawTgId
          : (() => {
              const n = Number(rawTgId)
              return Number.isFinite(n) ? n : 0
            })()
      setBalance(balanceVal)
      const tgUser = getTelegramUserFromInitData()
      const hasNameFromClient = tgUser && (tgUser.first_name || tgUser.last_name)
      const hasNameFromApi = !!(data.first_name || data.last_name)
      const displayName = hasNameFromClient
        ? getDisplayNameFromTelegramUser(tgUser!)
        : hasNameFromApi
          ? [data.first_name, data.last_name].filter(Boolean).join(' ').trim() ||
            data.display_name ||
            data.username ||
            ''
          : (data.display_name ?? (data.username || ''))
      const internalUserId =
        typeof data.user_id === 'number' && Number.isFinite(data.user_id) ? data.user_id : undefined
      setProfile(displayName, tgId, internalUserId)
      setReferralStats(data.referral_invited ?? 0, data.referral_earned ?? 0)
      setProfileStats(
        data.games_played ?? 0,
        data.total_deposited ?? 0,
        data.total_withdrawn ?? 0
      )
      setTotalProfit(data.total_profit ?? 0)
      setRank(data.rank ?? 0)
      setAdmin(data.is_admin ?? false)
      try {
        if (tgId) localStorage.setItem(`crypto_snake_dn_${tgId}`, displayName)
      } catch (_) {
        /* localStorage disabled or quota exceeded */
      }
      const photoUrl = getPhotoUrlFromInitData()
      if (photoUrl) {
        apiPatch('/api/user/profile', { photo_url: photoUrl }, initData).catch(() => {})
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 404)) {
        setBalance(0)
        setProfile('', 0, undefined)
        setReferralStats(0, 0)
        setProfileStats(0, 0, 0)
        setTotalProfit(0)
        setRank(0)
        setAdmin(false)
        return
      }
      console.warn('[useBalance]', e)
    }
  }, [initData, setBalance, setProfile, setReferralStats, setProfileStats, setTotalProfit, setRank, setAdmin])

  useEffect(() => {
    if (refetchOnMount && initData) {
      refetch()
    }
  }, [refetchOnMount, initData, refetch])

  return { refetch }
}
