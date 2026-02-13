import { getInitData, getPhotoUrlFromInitData } from '@/shared/lib'

/**
 * Telegram WebApp — initData для Authorization header.
 */
export function useTelegram() {
  const initData =
    typeof window !== 'undefined'
      ? getInitData() || (window as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData || ''
      : ''
  const photoUrl =
    typeof window !== 'undefined' ? getPhotoUrlFromInitData() : null
  const ready = () => (window as { Telegram?: { WebApp?: { ready?: () => void } } }).Telegram?.WebApp?.ready?.()
  const expand = () => (window as { Telegram?: { WebApp?: { expand?: () => void } } }).Telegram?.WebApp?.expand?.()
  return { initData, photoUrl, ready, expand }
}
