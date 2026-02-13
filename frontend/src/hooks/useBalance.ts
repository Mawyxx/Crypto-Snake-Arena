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
  const { setBalance, setProfile, setReferralStats, setProfileStats, setTotalProfit, setRank } = useGameStore()
  const refetchOnMount = options?.refetchOnMount ?? true

  const refetch = useCallback(async () => {
    if (!initData) return

    try {
      const data = await apiGet<ProfileResponse>('/api/user/profile', initData)
      const balanceVal = typeof data.balance === 'number' ? data.balance : Number(data.balance) || 0
      const tgId = typeof data.tg_id === 'number' ? data.tg_id : Number(data.tg_id) || 0
      setBalance(balanceVal)
      const tgUser = getTelegramUserFromInitData()
      // Ник (first_name + last_name) в приоритете; username только если имени нет
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
      setProfile(displayName, tgId)
      setReferralStats(data.referral_invited ?? 0, data.referral_earned ?? 0)
      setProfileStats(
        data.games_played ?? 0,
        data.total_deposited ?? 0,
        data.total_withdrawn ?? 0
      )
      setTotalProfit(data.total_profit ?? 0)
      setRank(data.rank ?? 0)
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
        return
      }
      console.warn('[useBalance]', e)
    }
  }, [initData, setBalance, setProfile, setReferralStats, setProfileStats, setTotalProfit, setRank])

  useEffect(() => {
    if (refetchOnMount && initData) {
      refetch()
    }
  }, [refetchOnMount, initData, refetch])

  return { refetch }
}
