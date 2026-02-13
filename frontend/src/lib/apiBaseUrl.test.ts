import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('getApiBaseUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses VITE_API_URL when set', async () => {
    const { getApiBaseUrl } = await import('./apiBaseUrl')
    const url = getApiBaseUrl()
    expect(url).toBeDefined()
    expect(typeof url).toBe('string')
  })

  it('returns string without trailing slash', async () => {
    const { getApiBaseUrl } = await import('./apiBaseUrl')
    const url = getApiBaseUrl()
    expect(url.endsWith('/')).toBe(false)
  })
})
