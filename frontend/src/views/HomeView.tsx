import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store'
import { useHaptic } from '@/features/haptic'
import { useTelegram } from '@/features/auth'
import { useBalance } from '@/entities/balance'
import { Icon } from '@/shared/ui'
import { UserAvatar } from '@/entities/user'
import { getRecentGames, formatRelativeTime, type RecentGame } from '@/features/game-history'

const BET_OPTIONS = [30, 50, 100, 250, 500]

export const HomeView = React.memo(function HomeView() {
  const { t, i18n } = useTranslation()
  const bet = useGameStore((s) => s.bet)
  const setBet = useGameStore((s) => s.setBet)
  const setScreen = useGameStore((s) => s.setScreen)
  const setInGame = useGameStore((s) => s.setInGame)
  const balance = useGameStore((s) => s.balance)
  const username = useGameStore((s) => s.username)
  const rank = useGameStore((s) => s.rank)
  const gamesPlayed = useGameStore((s) => s.gamesPlayed)
  const totalProfit = useGameStore((s) => s.totalProfit)
  const onlineCount = useGameStore((s) => s.onlineCount)
  const { impact, notify } = useHaptic()
  const { photoUrl, initData } = useTelegram()
  const { refetch } = useBalance({ refetchOnMount: false })
  const [games, setGames] = useState<RecentGame[]>([])
  const [loading, setLoading] = useState(true)
  const [gamesExpanded, setGamesExpanded] = useState(false)

  const validBet = useMemo(() => {
    if (BET_OPTIONS.includes(bet)) return bet
    const nearest = BET_OPTIONS.reduce((a, b) => (Math.abs(b - bet) < Math.abs(a - bet) ? b : a))
    return nearest
  }, [bet])

  useEffect(() => {
    if (!initData?.trim()) {
      setGames([])
      setLoading(false)
      return
    }
    let cancelled = false
    getRecentGames(initData)
      .then((data) => {
        if (!cancelled) {
          setGames(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGames([])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [initData])

  useEffect(() => {
    if (validBet !== bet) setBet(validBet)
  }, [validBet, bet, setBet])

  const stakeUsdt = validBet / 100
  const canPlay = balance >= stakeUsdt

  const handlePlay = () => {
    if (!canPlay) return
    impact('medium')
    notify('success')
    setInGame(true)
    setScreen('game')
  }

  const handleBetChange = (delta: number) => {
    impact('medium')
    const idx = BET_OPTIONS.indexOf(bet)
    let next = idx + delta
    if (next < 0) next = 0
    if (next >= BET_OPTIONS.length) next = BET_OPTIONS.length - 1
    setBet(BET_OPTIONS[next])
  }

  const handleAddFunds = async () => {
    impact('light')
    const { DEV_AUTO_CREDIT } = await import('@/config/dev')
    if (DEV_AUTO_CREDIT && initData) {
      try {
        await import('@/shared/api').then(({ apiPost }) => apiPost('/api/dev/credit-500', {}, initData))
        refetch()
        notify?.('success')
        if ((window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp?.showAlert) {
          ;(window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram!.WebApp!.showAlert!('+500 USDT')
        }
      } catch (e) {
        const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
        const msg = e && typeof e === 'object' && 'status' in e && (e as { status: number }).status === 404
          ? 'Добавь DEV_AUTO_CREDIT=true в .env на сервере и перезапусти'
          : t('common.deposit')
        if (tg?.showAlert) tg.showAlert(msg)
      }
    } else {
      const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
      if (tg?.showAlert) tg.showAlert(initData ? t('common.deposit') : 'Нет initData')
    }
    setScreen('profile')
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md relative bg-[var(--bg-main)]">
      <header className="ios-blur sticky top-0 z-50 flex justify-between items-center px-6 pt-4 pb-4 w-full border-b border-white/5 bg-[var(--bg-main)]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
            <UserAvatar src={photoUrl} name={username} size={40} className="rounded-none" />
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold leading-none tracking-tight text-white truncate max-w-[140px]">
              {username || ''}
            </span>
            <span className="text-[10px] font-bold text-white/30 uppercase mt-1 tracking-widest leading-none">
              {t('home.globalRank', { rank: gamesPlayed === 0 || rank === 0 ? '???' : rank })}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddFunds}
          className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 active:scale-95 transition-transform"
        >
          <span className="text-[14px] font-bold tracking-tight text-white">
            {(Number(balance) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] font-bold text-[#007AFF]">USDT</span>
        </button>
      </header>

      <main className="flex-grow overflow-y-auto custom-scrollbar px-5 py-6 space-y-5">
        <div className="hero-banner p-6 relative overflow-hidden flex flex-col justify-between h-[180px] min-h-[180px]">
          <div className="absolute -right-5 -top-5 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('home.online', { count: onlineCount ?? 0 })}</span>
            </div>
            <Icon name="info" size={20} className="text-white/50" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-[0.9]">{t('home.enterArena')}<br/>{t('home.arena')}</h2>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-[0.2em] mt-3">{t('home.theUltimateDuel')}</p>
            </div>
          </div>
        </div>

        <div className="premium-card p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('home.selectBet')}</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('home.maxBet')}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleBetChange(-1)}
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Icon name="remove" size={20} className="text-white/60" />
              </button>
              <div className="flex-grow h-14 recessed-field rounded-2xl flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-white">
                  {stakeUsdt.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold text-[#007AFF] uppercase">USDT</span>
              </div>
              <button
                type="button"
                onClick={() => handleBetChange(1)}
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Icon name="add" size={20} className="text-white/60" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePlay}
            disabled={!canPlay}
            className={`w-full py-5 rounded-2xl text-white font-black text-lg uppercase tracking-[0.2em] active:scale-[0.98] transition-all bg-[#007AFF] play-button-glow ${!canPlay ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {t('home.playButton')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="premium-card p-5">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('home.myGames')}</span>
            <div className="text-2xl font-bold mt-1 tracking-tight text-white">{gamesPlayed}</div>
          </div>
          <div className="premium-card p-5">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('home.totalProfit')}</span>
            <div className={`text-2xl font-bold mt-1 tracking-tight ${totalProfit >= 0 ? 'text-[#22C55E]' : 'text-[#FF3B30]'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[13px] font-black text-white uppercase tracking-widest">{t('home.recentGames')}</h3>
            {games.length > 5 && (
              <button
                type="button"
                onClick={() => { impact('light'); setGamesExpanded(!gamesExpanded) }}
                className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider active:scale-95 transition-transform"
              >
                {gamesExpanded ? t('home.showLess') : t('common.showAll')}
              </button>
            )}
          </div>
          <div className="space-y-5">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                      <div className="flex flex-col gap-2">
                        <div className="h-3 w-16 bg-white/10 animate-pulse rounded" />
                        <div className="h-2.5 w-14 bg-white/10 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-14 bg-white/10 animate-pulse rounded" />
                  </div>
                ))}
              </>
            ) : games.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center">
                <p className="text-sm text-white/40 text-center">{t('home.playFirst')}</p>
              </div>
            ) : (
              (gamesExpanded ? games : games.slice(0, 5)).map((game, i) => {
                const isWin = game.status === 'win'
                return (
                  <button
                    key={game.id ? `game-${game.id}` : `game-i-${i}`}
                    type="button"
                    onClick={() => impact('light')}
                    className="w-full flex items-center justify-between text-left active:scale-[0.99] transition-transform hover:bg-white/[0.03] rounded-2xl -mx-2 px-2 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isWin ? 'bg-neon-green/20' : 'bg-error/20'
                        }`}
                      >
                        {isWin ? (
                          <Icon name="check" size={20} className="text-neon-green" />
                        ) : (
                          <Icon name="close" size={20} className="text-error" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-bold tracking-tight uppercase ${
                            isWin ? 'text-[#22C55E]' : 'text-[#FF3B30]'
                          }`}
                        >
                          {isWin ? t('home.win') : t('home.lose')}
                        </span>
                        <span className="text-[10px] text-white/30 font-medium uppercase">
                          {formatRelativeTime(game.created_at, t, i18n.language)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold shrink-0 ${game.profit > 0 ? 'text-[#22C55E]' : 'text-[#FF3B30]'}`}
                    >
                      {game.profit > 0 ? '+' : ''}
                      {game.profit.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="h-28" />
      </main>
    </div>
  )
})
