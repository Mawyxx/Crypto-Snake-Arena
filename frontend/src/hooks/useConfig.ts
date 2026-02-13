/**
 * useConfig — загрузка публичной конфигурации (bot_username) с GET /api/config.
 * bot_username используется для генерации реферальной ссылки.
 */
import { useCallback, useEffect } from 'react'
import { useGameStore } from '@/store'
import { apiGet } from '@/shared/api'
import type { ConfigResponse } from '@/shared/api'

async function fetchBotUsername(): Promise<string | null> {
  try {
    const data = await apiGet<ConfigResponse>('/api/config')
    return data?.bot_username || null
  } catch {
    return null
  }
}

export function useConfig() {
  const setBotUsername = useGameStore((s) => s.setBotUsername)

  const load = useCallback(() => {
    fetchBotUsername().then((username) => {
      if (username) setBotUsername(username)
    })
  }, [setBotUsername])

  useEffect(() => {
    load()
  }, [load])

  return { refetch: load }
}
