/**
 * useConfig — загрузка публичной конфигурации (bot_username) с GET /api/config.
 * bot_username используется для генерации реферальной ссылки.
 */
import { useCallback, useEffect } from 'react'
import { useGameStore } from '@/store'

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

interface ConfigResponse {
  bot_username?: string
}

async function fetchBotUsername(): Promise<string | null> {
  const base = getApiBaseUrl().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/config`, {
      headers: { 'ngrok-skip-browser-warning': '1' },
    })
    if (!res.ok) return null
    const data: ConfigResponse = await res.json()
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
