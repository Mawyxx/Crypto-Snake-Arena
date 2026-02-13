import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminDashboard, useAdminStats, useAdminExport } from '@/features/admin'
import { useHaptic } from '@/features/haptic'

function formatUsdt(n: number): string {
  return `$${Number(n).toFixed(2)}`
}

export function AdminPage() {
  const { t } = useTranslation()
  const { data, loading, error, refetch } = useAdminDashboard()
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const { data: periodData } = useAdminStats(period)
  const { exportCsv, exporting } = useAdminExport()
  const { impact } = useHaptic()

  const handleExport = () => {
    impact('medium')
    exportCsv()
  }

  const handleRefetch = () => {
    impact('light')
    refetch()
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md relative bg-[var(--bg-main)]">
      <header className="ios-blur sticky top-0 z-50 flex justify-between items-center px-6 pt-12 pb-4 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/80">
        <h1 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
          {t('nav.admin')}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar pb-24 px-5">
        {/* Hero banner — gradient как Home/Frens */}
        <div className="mt-5 mb-4 rounded-[var(--radius-card)] overflow-hidden relative" style={{ background: 'var(--gradient-hero)' }}>
          <div className="relative z-10 px-6 py-6">
            <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase">
              {t('admin.totalNetProfit')}
            </p>
            {loading ? (
              <p className="text-2xl font-bold text-white mt-2">{t('admin.loading')}</p>
            ) : error ? (
              <p className="text-lg text-white/80 mt-2">{t('admin.error')}</p>
            ) : (
              <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                {formatUsdt(data?.total_net_profit ?? 0)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleRefetch}
                className="text-[10px] font-bold text-white/80 hover:text-white transition-colors"
              >
                {t('admin.refetch')}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="text-[10px] font-bold text-white/90 hover:text-white disabled:opacity-60 transition-opacity flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                {t('admin.exportCsv')}
              </button>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-6 opacity-10 transform -rotate-12 pointer-events-none">
            <span className="material-symbols-outlined text-[120px] text-white">payments</span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[var(--anthracite)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] p-4 h-[84px] flex flex-col justify-between">
            <span className="text-[9px] text-white/40 font-bold tracking-widest uppercase">
              {t('admin.totalPlayers')}
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              {loading ? '—' : (data?.total_players_with_revenue ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--anthracite)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] p-4 h-[84px] flex flex-col justify-between">
            <span className="text-[9px] text-white/40 font-bold tracking-widest uppercase">
              {t('admin.totalGames')}
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              {loading ? '—' : (data?.total_games ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--anthracite)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] p-4 h-[84px] flex flex-col justify-between">
            <span className="text-[9px] text-white/40 font-bold tracking-widest uppercase">
              {t('admin.avgProfitPerDeath')}
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              {loading ? '—' : formatUsdt(data?.avg_profit_per_death ?? 0)}
            </span>
          </div>
        </div>

        {/* Period stats */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  period === p
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--anthracite)] text-white/60 hover:text-white border border-[var(--border-subtle)]'
                }`}
              >
                {p === 'day' ? '24h' : p === 'week' ? '7d' : '30d'}
              </button>
            ))}
          </div>
          <div className="bg-[var(--anthracite)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] p-5">
            <h3 className="text-[9px] text-white/40 font-bold tracking-widest uppercase mb-4">
              {t('admin.periodStats')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-white/50 block mb-1">{t('admin.deathCount')}</span>
                <span className="text-lg font-bold text-white">{periodData?.death_count ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 block mb-1">{t('admin.expiredCount')}</span>
                <span className="text-lg font-bold text-white">{periodData?.expired_count ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 block mb-1">{t('admin.withdrawCount')}</span>
                <span className="text-lg font-bold text-white">{periodData?.withdraw_count ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 block mb-1">{t('admin.totalNetProfit')}</span>
                <span className="text-lg font-bold text-[var(--accent-mint)]">
                  {periodData ? formatUsdt(periodData.total_profit) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
