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
        contentSafeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number }
        safeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number }
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
    tg.expand?.()
    tg.requestFullscreen?.()
    tg.setHeaderColor?.(designTokens.bgMain)
    tg.setBackgroundColor?.(designTokens.bgMainAlt)
    // Bot API 8.0+: contentSafeAreaInset. Иначе не задаём — CSS fallback 20px.
    const inset = tg.contentSafeAreaInset ?? tg.safeAreaInset
    const top = inset?.top
    if (typeof top === 'number' && top > 0) {
      document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${top}px`)
    }
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
  if (unsafe?.user) {
    const user = normalizeTelegramUser(unsafe.user)
    if (user) return user.id
  }

  const raw = getInitData()
  if (!raw) return null
  try {
    const params = new URLSearchParams(raw)
    const user = params.get('user')
    if (!user) return null
    const parsed: unknown = JSON.parse(decodeURIComponent(user))
    const normalized = normalizeTelegramUser(parsed)
    return normalized?.id ?? null
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

/** Сырые данные пользователя из Telegram API (может быть snake_case или camelCase) */
interface TelegramUserRaw {
  id: number | string
  first_name?: string
  firstName?: string
  last_name?: string
  lastName?: string
  username?: string
  userName?: string
  photo_url?: string
  photoUrl?: string
}

/** Type guard для валидации сырых данных пользователя Telegram */
function isTelegramUserRaw(raw: unknown): raw is TelegramUserRaw {
  if (!raw || typeof raw !== 'object') return false
  const obj = raw as Record<string, unknown>
  // id обязателен и должен быть числом или строкой, которую можно преобразовать в число
  const id = obj.id
  if (id == null) return false
  if (typeof id !== 'number' && typeof id !== 'string') return false
  if (typeof id === 'string' && isNaN(Number(id))) return false

  // Остальные поля опциональны, но если есть - должны быть строками
  const optionalStringFields = ['first_name', 'firstName', 'last_name', 'lastName', 'username', 'userName', 'photo_url', 'photoUrl']
  for (const field of optionalStringFields) {
    if (field in obj && typeof obj[field] !== 'string') return false
  }

  return true
}

/** Нормализует user из разных источников (snake_case / camelCase) с валидацией */
function normalizeTelegramUser(raw: unknown): TelegramUser | null {
  if (!isTelegramUserRaw(raw)) return null

  const id = typeof raw.id === 'number' ? raw.id : Number(raw.id)
  if (!Number.isFinite(id) || id <= 0) return null

  const first = raw.first_name ?? raw.firstName
  const last = raw.last_name ?? raw.lastName
  const username = raw.username ?? raw.userName
  const photo = raw.photo_url ?? raw.photoUrl

  return {
    id,
    first_name: typeof first === 'string' ? first : undefined,
    last_name: typeof last === 'string' ? last : undefined,
    username: typeof username === 'string' ? username : undefined,
    photo_url: typeof photo === 'string' ? photo : undefined,
  }
}

/** Полные данные пользователя из Telegram initData */
export function getTelegramUserFromInitData(): TelegramUser | null {
  const unsafe = window.Telegram?.WebApp?.initDataUnsafe
  if (unsafe?.user) {
    const user = normalizeTelegramUser(unsafe.user)
    if (user) return user
  }

  const raw = getInitData()
  if (!raw) return null
  try {
    const params = new URLSearchParams(raw)
    const userStr = params.get('user')
    if (!userStr) return null
    const parsed: unknown = JSON.parse(decodeURIComponent(userStr))
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
