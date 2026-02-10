import { getInitData, getPhotoUrlFromInitData } from '@/lib/telegramInit'

/**
 * Telegram WebApp — initData для Authorization header.
 */
export function useTelegram() {
  const initData =
    typeof window !== 'undefined'
      ? getInitData() || window.Telegram?.WebApp?.initData || ''
      : ''
  const photoUrl =
    typeof window !== 'undefined' ? getPhotoUrlFromInitData() : null
  const ready = () => window.Telegram?.WebApp?.ready?.()
  const expand = () => window.Telegram?.WebApp?.expand?.()
  return { initData, photoUrl, ready, expand }
}
