/**
 * useBalance — загрузка баланса с GET /api/user/profile.
 * Вызывается при загрузке приложения и после экрана завершения игры.
 */
import { useCallback, useEffect } from 'react'
import { useGameStore } from '@/store'
import { useTelegram } from './useTelegram'
import { getTelegramUserFromInitData, getDisplayNameFromTelegramUser } from '@/lib/telegramInit'

function getApiBaseUrl(): string {
  const apiEnv = import.meta.env.VITE_API_URL as string | undefined
  if (apiEnv) return apiEnv
  const wsEnv = import.meta.env.VITE_WS_URL as string | undefined
  if (wsEnv) return wsEnv.replace(/^ws/, 'http').replace(/\/ws\/?$/, '')
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:8080'
}

interface ProfileResponse {
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
}

export function useBalance(options?: { refetchOnMount?: boolean }) {
  const { initData } = useTelegram()
  const { setBalance, setProfile, setReferralStats, setProfileStats } = useGameStore()
  const refetchOnMount = options?.refetchOnMount ?? true

  const refetch = useCallback(async () => {
    if (!initData) return

    try {
      const res = await fetch(`${getApiBaseUrl().replace(/\/$/, '')}/api/user/profile`, {
        method: 'GET',
        headers: {
          Authorization: `tma ${initData}`,
          'ngrok-skip-browser-warning': '1',
        },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 404) return
        throw new Error(`Profile fetch failed: ${res.status}`)
      }

      const data: ProfileResponse = await res.json()
      setBalance(data.balance)
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
            'Игрок'
          : (data.display_name ?? (data.username || 'Игрок'))
      setProfile(displayName, data.tg_id)
      setReferralStats(data.referral_invited ?? 0, data.referral_earned ?? 0)
      setProfileStats(
        data.games_played ?? 0,
        data.total_deposited ?? 0,
        data.total_withdrawn ?? 0
      )
      try {
        localStorage.setItem(`crypto_snake_dn_${data.tg_id}`, displayName)
      } catch {}
    } catch (e) {
      console.warn('[useBalance]', e)
    }
  }, [initData, setBalance, setProfile, setReferralStats, setProfileStats])

  useEffect(() => {
    if (refetchOnMount && initData) {
      refetch()
    }
  }, [refetchOnMount, initData, refetch])

  return { refetch }
}
