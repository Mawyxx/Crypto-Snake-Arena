import { designTokens } from '@/shared/config'

/**
 * Telegram Mini App — только legacy API (window.Telegram.WebApp).
 * Без @telegram-apps/sdk — он падает в WebView и блокирует загрузку.
 */
/** iOS fix: предотвращает схлопывание при скролле вниз (document не scrollable или scrollY=0). */
function ensureDocumentIsScrollable(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const el = document.documentElement
  const isScrollable = el.scrollHeight > window.innerHeight
  if (!isScrollable) {
    el.style.setProperty('height', 'calc(100vh + 1px)', 'important')
  }
}

/** Отключает вертикальный свайп для закрытия (Bot API 7.7+), чтобы скролл не закрывал приложение. */
function disableVerticalSwipesForScroll(): void {
  const tg = (window as { Telegram?: { WebApp?: { disableVerticalSwipes?: () => void } } }).Telegram?.WebApp
  tg?.disableVerticalSwipes?.()
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string
        initDataUnsafe?: {
          user?: {
            id: number
            first_name?: string
            last_name?: string
            username?: string
            photo_url?: string
          }
        }
        ready: () => void
        expand: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        BackButton?: {
          show: () => void
          hide: () => void
          onClick: (cb: () => void) => void
          offClick: (cb: () => void) => void
        }
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
        }
        openTelegramLink?: (url: string) => void
        requestFullscreen?: () => void
        isVersionAtLeast?: (version: string) => boolean
        disableVerticalSwipes?: () => void
      }
    }
  }
}

export async function initTelegram(): Promise<void> {
  const tg = window.Telegram?.WebApp
  if (!tg) return

  try {
    document.documentElement.setAttribute('data-telegram', '1')
    document.body.setAttribute('data-telegram', '1')
    tg.ready?.()
    tg.setHeaderColor?.('bg_color')
    tg.setBackgroundColor?.(designTokens.bgMainAlt)
    disableVerticalSwipesForScroll()
    if (typeof window !== 'undefined') {
      window.addEventListener('load', ensureDocumentIsScrollable)
      if (document.readyState === 'complete') ensureDocumentIsScrollable()
    }
  } catch { /* Telegram WebApp not available */ }
}

const INIT_DATA_KEY = 'crypto_snake_init_data'

export function getInitData(): string {
  const fromTg = window.Telegram?.WebApp?.initData ?? ''
  if (fromTg) {
    try {
      sessionStorage.setItem(INIT_DATA_KEY, fromTg)
    } catch { /* sessionStorage unavailable */ }
    return fromTg
  }
  try {
    return sessionStorage.getItem(INIT_DATA_KEY) ?? ''
  } catch {
    return ''
  }
}

export function getUserIdFromInitData(): number | null {
  const unsafe = window.Telegram?.WebApp?.initDataUnsafe
  if (unsafe?.user?.id) return unsafe.user.id

  const raw = getInitData()
  if (!raw) return null
  try {
    const params = new URLSearchParams(raw)
    const user = params.get('user')
    if (!user) return null
    const parsed = JSON.parse(decodeURIComponent(user))
    return parsed?.id ?? null
  } catch {
    return null
  }
}

/** URL аватарки пользователя из initDataUnsafe (если разрешено в настройках приватности) */
export function getPhotoUrlFromInitData(): string | null {
  const user = getTelegramUserFromInitData()
  return user?.photo_url ?? null
}

export interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

/** Нормализует user из разных источников (snake_case / camelCase) */
function normalizeTelegramUser(raw: Record<string, unknown>): TelegramUser | null {
  if (!raw?.id) return null
  const first = (raw.first_name ?? raw.firstName) as string | undefined
  const last = (raw.last_name ?? raw.lastName) as string | undefined
  const username = (raw.username ?? raw.userName) as string | undefined
  const photo = (raw.photo_url ?? raw.photoUrl) as string | undefined
  return {
    id: Number(raw.id),
    first_name: first || undefined,
    last_name: last || undefined,
    username: username || undefined,
    photo_url: photo || undefined,
  }
}

/** Полные данные пользователя из Telegram initData */
export function getTelegramUserFromInitData(): TelegramUser | null {
  const unsafe = window.Telegram?.WebApp?.initDataUnsafe
  if (unsafe?.user) {
    const user = normalizeTelegramUser(unsafe.user as Record<string, unknown>)
    if (user) return user
  }

  const raw = getInitData()
  if (!raw) return null
  try {
    const params = new URLSearchParams(raw)
    const userStr = params.get('user')
    if (!userStr) return null
    const parsed = JSON.parse(decodeURIComponent(userStr)) as Record<string, unknown>
    return normalizeTelegramUser(parsed)
  } catch {
    return null
  }
}

/** Отображаемое имя: first_name last_name, иначе username без @, иначе пустая строка */
export function getDisplayNameFromTelegramUser(user: TelegramUser): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  if (fullName) return fullName
  if (user.username) return user.username.replace(/^@/, '')
  return ''
}
