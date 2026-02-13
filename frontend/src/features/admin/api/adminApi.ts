/**
 * Admin API — вызовы /api/admin/*.
 */
import { apiGet } from '@/shared/api'
import { getApiBaseUrl } from '@/shared/lib'
import type {
  DashboardSummary,
  LedgerResponse,
  PeriodStats,
} from '@/shared/api'

const ADMIN = '/api/admin'

export async function fetchAdminDashboard(initData: string): Promise<DashboardSummary> {
  return apiGet<DashboardSummary>(`${ADMIN}/dashboard`, initData)
}

export async function fetchAdminLedger(
  initData: string,
  params: { from?: string; to?: string; limit?: number; offset?: number }
): Promise<LedgerResponse> {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.offset != null) search.set('offset', String(params.offset))
  const q = search.toString()
  return apiGet<LedgerResponse>(`${ADMIN}/ledger${q ? `?${q}` : ''}`, initData)
}

export async function fetchAdminStats(
  initData: string,
  period: 'day' | 'week' | 'month' = 'day'
): Promise<PeriodStats> {
  return apiGet<PeriodStats>(`${ADMIN}/stats?period=${period}`, initData)
}

export async function fetchAdminExport(
  initData: string,
  from?: string,
  to?: string
): Promise<Blob> {
  const search = new URLSearchParams()
  if (from) search.set('from', from)
  if (to) search.set('to', to)
  const q = search.toString()
  const url = `${getApiBaseUrl()}${ADMIN}/export${q ? `?${q}` : ''}`
  const headers: Record<string, string> = { 'ngrok-skip-browser-warning': '1' }
  if (initData?.trim()) headers['Authorization'] = `tma ${initData}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Export failed: ${res.status}`)
  return res.blob()
}
