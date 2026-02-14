/**
 * Centralized API client with retry and error handling.
 */
import { getApiBaseUrl } from '@/shared/lib'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiFetchOptions {
  initData?: string | null
  retries?: number
}

const DEFAULT_RETRIES = 2
const RETRY_DELAYS_MS = [1000, 2000]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryable(status: number): boolean {
  return status >= 500 || status === 408 || status === 429
}

export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions
): Promise<T> {
  const { initData, retries = DEFAULT_RETRIES } = options ?? {}
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '1',
  }
  if (initData?.trim()) {
    headers['Authorization'] = `tma ${initData}`
  }

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!res.ok) {
        const text = await res.text()
        const err = new ApiError(
          text || `Request failed: ${res.status}`,
          res.status
        )
        if (isRetryable(res.status) && attempt < retries) {
          const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]
          await sleep(delay)
          lastError = err
          continue
        }
        throw err
      }

      const text = await res.text()
      if (!text || !text.trim()) return {} as T
      try {
        return JSON.parse(text) as T
      } catch {
        throw new ApiError(`Invalid JSON: ${text.slice(0, 100)}`, res.status)
      }
    } catch (e) {
      if (e instanceof ApiError) throw e
      lastError = e
      if (attempt < retries) {
        const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]
        await sleep(delay)
      } else {
        throw e
      }
    }
  }
  throw lastError
}

export async function apiGet<T>(path: string, initData?: string | null): Promise<T> {
  return apiFetch<T>(path, { initData })
}

export async function apiPatch<T>(
  path: string,
  body: Record<string, unknown>,
  initData?: string | null
): Promise<T> {
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  }
  if (initData?.trim()) {
    headers['Authorization'] = `tma ${initData}`
  }
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new ApiError(text || `Request failed: ${res.status}`, res.status)
  }
  const text = await res.text()
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json') && text) {
    try {
      return JSON.parse(text) as T
    } catch {
      /* fallthrough to empty */
    }
  }
  return {} as T
}

export async function apiPost<T>(
  path: string,
  body?: Record<string, unknown> | null,
  initData?: string | null
): Promise<T> {
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  }
  if (initData?.trim()) {
    headers['Authorization'] = `tma ${initData}`
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new ApiError(text || `Request failed: ${res.status}`, res.status)
  }
  const text = await res.text()
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json') && text) {
    try {
      return JSON.parse(text) as T
    } catch {
      /* fallthrough */
    }
  }
  return {} as T
}
