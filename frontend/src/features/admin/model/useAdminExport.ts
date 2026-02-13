/**
 * useAdminExport — экспорт CSV.
 */
import { useCallback, useState } from 'react'
import { useTelegram } from '@/features/auth'
import { fetchAdminExport } from '../api/adminApi'

export function useAdminExport() {
  const { initData } = useTelegram()
  const [exporting, setExporting] = useState(false)

  const exportCsv = useCallback(
    async (from?: string, to?: string) => {
      if (!initData) return
      setExporting(true)
      try {
        const blob = await fetchAdminExport(initData, from, to)
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `revenue_ledger_${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(a.href)
      } catch (e) {
        console.warn('[useAdminExport]', e)
      } finally {
        setExporting(false)
      }
    },
    [initData]
  )

  return { exportCsv, exporting }
}
