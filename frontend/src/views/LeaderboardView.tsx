import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store'
import { useHaptic } from '@/features/haptic'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useBalance } from '@/entities/balance'
import { UserAvatar } from '@/entities/user'
import { Icon } from '@/shared/ui'

export const LeaderboardView = React.memo(function LeaderboardView() {
  const { t } = useTranslation()
  const setScreen = useGameStore((s) => s.setScreen)
  const setInGame = useGameStore((s) => s.setInGame)
  const bet = useGameStore((s) => s.bet)
  const balance = useGameStore((s) => s.balance)
  const rank = useGameStore((s) => s.rank)
  const userId = useGameStore((s) => s.userId)
  const gamesPlayed = useGameStore((s) => s.gamesPlayed)
  const totalProfit = useGameStore((s) => s.totalProfit)
  const activePlayers7d = useGameStore((s) => s.activePlayers7d)
  const { impact, notify } = useHaptic()
  const { entries, loading, error, refetch } = useLeaderboard({ limit: 50 })
  useBalance({ refetchOnMount: true })

  const stakeUsdt = bet / 100
  const canPlay = balance >= stakeUsdt

  const handlePlay = () => {
    if (!canPlay) {
      setScreen('home')
      return
    }
    impact('medium')
    notify('success')
    setInGame(true)
    setScreen('game')
  }

  const handleShare = () => {
    impact('light')
    const url = encodeURIComponent(window.location.href)
    const text = t('leaderboard.shareText')
    const shareUrl = `https://t.me/share/url?url=${url}&text=${encodeURIComponent(text)}`
    const openLink = window.Telegram?.WebApp?.openTelegramLink
    if (openLink) {
      openLink(shareUrl)
    } else if (navigator.share) {
      navigator.share({ title: 'Crypto Snake Arena', text, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  return (
    <main className="pt-[env(safe-area-inset-top)] flex-1 flex flex-col px-5 pb-32 overflow-y-auto hide-scrollbar">
      <div className="relative mt-4 bg-gradient-to-br from-[#007AFF] via-[#0060FF] to-[#004BDD] p-5 rounded-[28px] shadow-[0_15px_45px_rgba(0,122,255,0.4)] mb-4 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 banner-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black tracking-[0.2em] text-white/70 uppercase">{t('leaderboard.yourRank')}</p>
              <h2 className="text-5xl font-bold tracking-tighter text-white">#{gamesPlayed === 0 || rank === 0 ? '???' : rank}</h2>
            </div>
            <div className="medal-glow-effect">
              <div className="w-14 h-14 glass-medal rounded-2xl flex items-center justify-center">
                <Icon name="military_tech" size={32} filled className="text-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex flex-col">
              <p className="text-[8px] font-bold tracking-[0.1em] text-white/60 uppercase">{t('leaderboard.activePlayers')}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">{activePlayers7d ?? 0}</span>
                <span className="text-[8px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded-full">{t('leaderboard.in7Days')}</span>
              </div>
            </div>
            {rank > 0 && activePlayers7d != null && activePlayers7d > 0 && (
              <span className="text-[9px] font-bold text-white/70 tracking-widest uppercase bg-black/10 px-2 py-1 rounded-lg">
                TOP {((rank - 1) / Math.max(activePlayers7d, 1) * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="bg-[#111111] p-5 rounded-[28px] border border-white/5 flex justify-between items-center flex-shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase">{t('leaderboard.totalProfit')}</p>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-[#22C55E]' : 'text-[#FF3B30]'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-bold text-[#22C55E]/60 uppercase">USDT</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Icon name="share" size={20} className="text-white/70" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          <div className="bg-[#111111] p-5 rounded-[28px] border border-white/5 space-y-1">
            <p className="text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase">{t('leaderboard.totalWins')}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{gamesPlayed}</p>
          </div>
          <div className="bg-[#111111] p-5 rounded-[28px] border border-white/5 space-y-1">
            <p className="text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase">{t('leaderboard.bestProfit')}</p>
            <p className="text-2xl font-bold text-[#22C55E] tracking-tight">
              {totalProfit > 0 ? totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-[11px] font-bold text-white/30 tracking-[0.2em] uppercase">{t('leaderboard.topPlayers')}</h3>
          </div>
          <div className="space-y-2 overflow-y-auto hide-scrollbar flex-1 pb-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-white/40">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <p className="text-sm text-white/40 text-center">{error}</p>
                <button
                  type="button"
                  onClick={() => { impact('light'); refetch() }}
                  className="px-8 py-4 rounded-2xl bg-primary text-white font-semibold text-base active:scale-95 transition-all"
                >
                  {t('common.retry')}
                </button>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <p className="text-sm text-white/40 text-center">{t('leaderboard.playFirstRank')}</p>
                <button
                  type="button"
                  onClick={handlePlay}
                  className="px-8 py-4 rounded-2xl bg-primary text-white font-semibold text-base active:scale-95 transition-all"
                >
                  {t('common.play')}
                </button>
              </div>
            ) : (
              entries.map((entry) => {
                const isCurrentUser = userId != null && Number(entry.user_id) === Number(userId)
                return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-4 rounded-[28px] border ${
                    isCurrentUser ? 'user-row-highlight' : 'bg-[#111111]/50 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar src={entry.avatar_url ?? undefined} name={entry.display_name} size={40} />
                    <span className={`text-sm font-bold w-8 ${isCurrentUser ? 'text-[#007AFF]' : 'text-white/40'}`}>#{entry.rank}</span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate max-w-[100px]">
                          {entry.display_name || t('leaderboard.player')}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[8px] bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/30 px-1.5 py-0.5 rounded-sm uppercase font-black shrink-0">
                            {t('leaderboard.you')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${entry.total_profit >= 0 ? 'text-[#22C55E]' : 'text-[#FF3B30]'}`}
                  >
                    {entry.total_profit >= 0 ? '+' : ''}
                    {entry.total_profit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} USDT
                  </span>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </main>
  )
})
