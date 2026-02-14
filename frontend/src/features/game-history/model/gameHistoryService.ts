import type { TFunction } from 'i18next'
import { apiGet, ApiError } from '@/shared/api'
import type { RecentGameEntry } from '@/shared/api'

export interface RecentGame {
  id: number
  opponent_name: string
  opponent_avatar: string | null
  profit: number
  status: 'win' | 'loss'
  duration?: number // seconds in game
  created_at: number
}

const DATE_LOCALES: Record<string, string> = { ru: 'ru-RU', en: 'en-US' }

export function formatRelativeTime(ts: number, t: TFunction, lang?: string): string {
  const n = Number(ts)
  if (!Number.isFinite(n) || n <= 0) return '—'
  const now = Date.now()
  const diffMs = now - n
  const dateLocale = (lang && DATE_LOCALES[lang]) || 'ru-RU'
  if (diffMs < 0) return new Date(n).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return t('time.justNow')
  if (diffMin < 60) return t('time.minAgo', { count: diffMin })
  if (diffHour < 24) return diffHour === 1 ? t('time.hourAgo') : t('time.hoursAgo', { count: diffHour })
  if (diffDay === 1) return t('time.yesterday')
  if (diffDay < 7) return t('time.daysAgo', { count: diffDay })
  return new Date(n).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })
}

export async function getRecentGames(initData: string): Promise<RecentGame[]> {
  if (!initData?.trim()) return []

  try {
    const raw = await apiGet<RecentGameEntry[]>('/api/user/recent-games', initData)
    const data = Array.isArray(raw) ? raw : []
    return data.map((g) => ({
      id: Number(g.id) || 0,
      opponent_name: (String(g.opponent_name ?? '').trim()) || '',
      opponent_avatar: g.opponent_avatar != null && g.opponent_avatar !== '' ? String(g.opponent_avatar) : null,
      profit: Number(g.profit) || 0,
      status: (g.status === 'win' || g.status === 'loss' ? g.status : 'loss') as 'win' | 'loss',
      duration: typeof g.duration === 'number' ? g.duration : undefined,
      created_at: Number(g.created_at) || Date.now(),
    }))
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 404)) return []
    console.warn('[gameHistoryService]', e)
    return []
  }
}
