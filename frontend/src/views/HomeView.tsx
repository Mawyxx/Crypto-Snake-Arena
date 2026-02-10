import { useGameStore } from '@/store'
import { useHaptic } from '@/hooks/useHaptic'
import { useTelegram } from '@/hooks/useTelegram'
import { UserAvatar, BalanceCapsule } from '@/components/ui'

const BET_OPTIONS = [30, 50, 100, 250, 500]

export function HomeView() {
  const { bet, setBet, setScreen, setInGame, balance, username, userId } = useGameStore()
  const { impact, notify } = useHaptic()
  const { photoUrl } = useTelegram()

  const stakeUsdt = bet / 100
  const canPlay = balance >= stakeUsdt

  const handlePlay = () => {
    if (!canPlay) return
    notify('success')
    setInGame(true)
    setScreen('game')
  }

  const handleBetChange = (delta: number) => {
    impact('light')
    const idx = BET_OPTIONS.indexOf(bet)
    let next = idx + delta
    if (next < 0) next = 0
    if (next >= BET_OPTIONS.length) next = BET_OPTIONS.length - 1
    setBet(BET_OPTIONS[next])
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overscroll-contain touch-auto bg-[var(--bg-main)]">
      {/* Шапка */}
      <header className="header-compact flex items-center justify-between shrink-0 p-4 pb-3 bg-[var(--bg-main)] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <UserAvatar src={photoUrl} name={username} size={42} className="ring-2 ring-white/10 ring-offset-2 ring-offset-[var(--bg-main)]" />
          <div>
            <p className="font-semibold text-white truncate max-w-[120px] text-sm">
              {username || 'Игрок'}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              #{userId != null ? String(userId).slice(-4) : '—'}
            </p>
          </div>
        </div>
        <BalanceCapsule
          balance={balance}
          onAdd={() => {
            impact('light')
            const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
            if (tg?.showAlert) tg.showAlert('Пополнение скоро')
            setScreen('profile')
          }}
        />
      </header>

      {/* Hero — PLAY: ограничено по высоте, чтобы кнопка и ставка всегда в зоне видимости */}
      <div className="home-hero flex-1 min-h-0 flex flex-col items-center justify-center px-4 pt-6 pb-6">
        <div className="w-full min-h-0 flex flex-col items-center justify-center flex-shrink gap-0" style={{ maxHeight: 'min(80vh, 100%)' }}>
          <div className="relative flex items-center justify-center flex-shrink-0">
            {/* Glow behind */}
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/20 blur-3xl" />
            <div
              className="absolute w-56 h-56 rounded-full p-[4px] animate-[gradient-spin_4s_linear_infinite]"
              style={{
                background: 'conic-gradient(from 0deg, #22d3ee, #3b82f6, #a78bfa, #f472b6, #22d3ee)',
                boxShadow: '0 0 60px rgba(34, 211, 238, 0.25), 0 0 120px rgba(139, 92, 246, 0.15)',
              }}
            />
            <button
              type="button"
              onClick={handlePlay}
              disabled={!canPlay}
              className={`relative z-10 w-52 h-52 rounded-full flex flex-col items-center justify-center font-extrabold text-xl text-white uppercase tracking-[0.2em] transition-all bg-[var(--bg-main)] border-[3px] border-[var(--bg-card-elevated)] ${
                canPlay
                  ? 'active:scale-[0.97] shadow-[inset_0_0_60px_rgba(34,211,238,0.03)]'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              ИГРАТЬ
              {!canPlay && (
                <span className="text-xs font-medium normal-case mt-1.5 text-[var(--text-secondary)]">
                  Недостаточно баланса
                </span>
              )}
            </button>
          </div>

          {/* Bet Selector */}
          <div className="home-hero-bet flex items-center justify-center gap-4 mt-10 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleBetChange(-1)}
              className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] flex items-center justify-center text-2xl font-medium text-white active:scale-95 transition-all hover:border-white/15"
            >
              −
            </button>
            <div className="min-w-[110px] py-3 px-6 rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] text-center shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
              <span className="font-bold text-white tabular-nums text-lg">
                {stakeUsdt.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="ml-1.5 text-xs font-semibold text-[var(--accent-emerald)]/90 uppercase tracking-wider">USDT</span>
            </div>
            <button
              type="button"
              onClick={() => handleBetChange(1)}
              className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] flex items-center justify-center text-2xl font-medium text-white active:scale-95 transition-all hover:border-white/15"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
