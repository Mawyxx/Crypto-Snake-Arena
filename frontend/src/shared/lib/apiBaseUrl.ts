/**
 * Единый источник base URL для API-запросов.
 * DRY: используется во всех хуках и сервисах.
 */
export function getApiBaseUrl(): string {
  const apiEnv = import.meta.env.VITE_API_URL as string | undefined
  if (apiEnv?.trim()) return apiEnv.replace(/\/$/, '')
  const wsEnv = import.meta.env.VITE_WS_URL as string | undefined
  if (wsEnv?.trim()) {
    return wsEnv.replace(/^wss?/, 'http').replace(/\/ws\/?$/, '').replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:8080'
}
