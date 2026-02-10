import { useGameStore } from '@/store'
import { useHaptic } from '@/hooks/useHaptic'
import { useTelegram } from '@/hooks/useTelegram'
import { UserAvatar } from '@/components/ui'

const BET_OPTIONS = [30, 50, 100, 250, 500]
const ACTIVE_PLAYERS_MOCK = 128

export function HomeView() {
  const { bet, setBet, setScreen, setInGame, balance, username, userId, rank } = useGameStore()
  const { impact, notify } = useHaptic()
  const { photoUrl } = useTelegram()

  const stakeUsdt = bet / 100
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

  const handleAddFunds = () => {
    impact('light')
    const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
    if (tg?.showAlert) tg.showAlert('Пополнение скоро')
    setScreen('profile')
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overscroll-contain touch-auto bg-[#0A0A0B]">
      {/* Header: Player */}
      <header className="header-compact flex items-center justify-between shrink-0 px-4 pt-4 pb-3 bg-[#0A0A0B]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar
              src={photoUrl}
              name={username}
              size={48}
              className="ring-2 ring-white/10 ring-offset-2 ring-offset-[#0A0A0B]"
            />
            <div className="absolute -bottom-1 left-1 rounded-full px-2 py-[2px] bg-[#161618] border border-white/10">
              <span className="text-[10px] font-semibold text-white/80">
                Lv.{rank || 1}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-white truncate max-w-[150px]">
              {username || 'Игрок'}
            </p>
            <p className="text-[11px] text-white/40">
              ID #{userId != null ? String(userId).slice(-4) : '—'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddFunds}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm active:scale-95 transition-transform"
        >
          <div className="w-6 h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
            <span className="text-xs text-[#22C55E]">+</span>
          </div>
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[10px] font-medium text-white/40">
              Баланс
            </span>
            <span className="text-xs font-semibold text-white tabular-nums">
              {balance.toLocaleString('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-[10px] text-white/40">USDT</span>
            </span>
          </div>
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 pb-5 pt-2">
        {/* Big balance squaricle */}
        <section className="rounded-[28px] bg-[#161618] px-5 py-5 flex flex-col gap-3">
          <span className="text-[11px] font-medium text-white/40 uppercase tracking-wide">
            Общий баланс
          </span>
          <p className="text-5xl font-black tracking-tighter text-white leading-none">
            {balance.toLocaleString('ru-RU', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-medium text-white/40">
              В валюте USDT
            </span>
            <span className="text-xs font-medium text-[#007AFF]">
              Арена открыта
            </span>
          </div>
        </section>

        {/* Arena Core: vertical hero card */}
        <section className="rounded-[28px] bg-[#161618] overflow-hidden">
          <button
            type="button"
            onClick={handlePlay}
            disabled={!canPlay}
            className="w-full h-full text-left"
          >
            <div className="relative px-5 py-5">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#020617] via-transparent to-transparent" />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white/40 uppercase tracking-[0.16em]">
                      Боевой режим
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-white tracking-tight">
                      ENTER ARENA
                    </h1>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center rounded-full bg-[#007AFF]/20 px-3 py-1 border border-[#007AFF]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mr-1.5" />
                      <span className="text-[10px] font-medium text-white">
                        {ACTIVE_PLAYERS_MOCK} в игре
                      </span>
                    </span>
                    {!canPlay && (
                      <span className="text-[10px] font-medium text-white/40">
                        Пополните баланс
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/40">
                      Текущая ставка
                    </span>
                    <span className="mt-1 text-lg font-semibold text-white tabular-nums">
                      {stakeUsdt.toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      <span className="text-xs text-white/40">USDT</span>
                    </span>
                  </div>
                  <div
                    className={`h-[44px] px-5 rounded-full flex items-center justify-center text-[15px] font-semibold ${
                      canPlay
                        ? 'bg-[radial-gradient(circle_at_0_0,#22C55E,transparent_55%),linear-gradient(135deg,#22C55E,#16A34A)] text-white'
                        : 'bg-[#202023] text-white/40'
                    }`}
                  >
                    {canPlay ? 'ИГРАТЬ' : 'Недостаточно средств'}
                  </div>
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* Stake selector pill */}
        <section className="rounded-[28px] bg-[#161618] px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
              Ставка
            </span>
            <span className="text-xs font-medium text-white/40">
              Потенциал выигрыша: <span className="text-white">2x</span>
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3 rounded-[999px] bg-[#202023] px-3 py-2">
            <button
              type="button"
              onClick={() => handleBetChange(-1)}
              className="w-9 h-9 rounded-full bg-[#161618] flex items-center justify-center text-base font-semibold text-white active:scale-95 transition-transform"
            >
              −
            </button>

            <div className="flex-1 flex flex-col items-center">
              <span className="text-lg font-semibold text-white tabular-nums">
                {stakeUsdt.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                <span className="text-xs text-white/40">USDT</span>
              </span>
              <span className="text-[11px] text-white/40">
                {bet.toLocaleString('ru-RU')} базовых очков
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleBetChange(1)}
              className="w-9 h-9 rounded-full bg-[#161618] flex items-center justify-center text-base font-semibold text-white active:scale-95 transition-transform"
            >
              +
            </button>
          </div>
        </section>

        {/* Social & Growth */}
        <section className="mt-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              impact('light')
              setScreen('leaderboard')
            }}
            className="rounded-[28px] bg-[#161618] px-4 py-4 flex flex-col items-start gap-2 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-2xl bg-[#007AFF]/15 flex items-center justify-center">
              <span className="text-sm text-[#007AFF]">🏆</span>
            </div>
            <span className="text-sm font-semibold text-white">
              Global Top
            </span>
            <span className="text-[11px] text-white/40">
              Рейтинг арены
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              impact('light')
              setScreen('frens')
            }}
            className="rounded-[28px] bg-[#161618] px-4 py-4 flex flex-col items-start gap-2 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-2xl bg-[#22C55E]/15 flex items-center justify-center">
              <span className="text-sm text-[#22C55E]">👥</span>
            </div>
            <span className="text-sm font-semibold text-white">
              Friends
            </span>
            <span className="text-[11px] text-white/40">
              Бонус за приглашения
            </span>
          </button>
        </section>
      </div>
    </div>
  )
}
