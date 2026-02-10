import { useEffect } from 'react'
import { useGameStore } from '@/store'
import { useTelegram } from '@/hooks/useTelegram'
import { useBalance } from '@/hooks/useBalance'
import { UserAvatar } from '@/components/ui'

export function ProfileView() {
  const { refetch } = useBalance({ refetchOnMount: false })
  useEffect(() => {
    refetch()
  }, [refetch])

  const {
    username,
    balance,
    rank,
    gamesPlayed,
    totalDeposited,
    totalWithdrawn,
    soundEnabled,
    vibrationEnabled,
    setSoundEnabled,
    setVibrationEnabled,
  } = useGameStore()
  const { photoUrl } = useTelegram()

  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overscroll-contain touch-auto bg-black pb-bottom-bar">
      {/* Профиль */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <section className="rounded-[24px] bg-[#1C1C1E] px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-[#111111]">
              <UserAvatar src={photoUrl} name={username} size={56} className="rounded-none" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-white truncate">
                {username || 'Игрок'}
              </h1>
              <p className="mt-1 text-xs text-[#8E8E93]">
                Ранг #{rank || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#8E8E93]">Баланс</p>
              <p className="mt-0.5 text-sm font-semibold text-white tabular-nums">
                {balance.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                <span className="text-xs text-[#8E8E93]">USDT</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
            <div className="pt-2 flex flex-col items-center justify-center">
              <p className="font-semibold text-white tabular-nums text-sm">
                {gamesPlayed}
              </p>
              <p className="mt-0.5 text-[11px] text-[#8E8E93]">
                Игр
              </p>
            </div>
            <div className="pt-2 flex flex-col items-center justify-center">
              <p className="font-semibold tabular-nums text-sm text-[#26D07C]">
                {totalDeposited.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-xs text-[#8E8E93]"> USDT</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#8E8E93]">
                Заведено
              </p>
            </div>
            <div className="pt-2 flex flex-col items-center justify-center">
              <p className="font-semibold tabular-nums text-sm text-[#26D07C]">
                {totalWithdrawn.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-xs text-[#8E8E93]"> USDT</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#8E8E93]">
                Выведено
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* История: inset grouped list */}
      <div className="flex-1 px-4 pb-4">
        <h2 className="text-xs text-[#8E8E93] uppercase tracking-wider mb-3">
          История
        </h2>
        <section className="rounded-[24px] bg-[#1C1C1E]">
          <div className="px-4 py-4 border-b border-white/5">
            <p className="text-[13px] text-[#8E8E93]">
              У вас пока нет операций. Сыграйте пару игр или пополните баланс, чтобы увидеть движение средств.
            </p>
          </div>
        </section>
      </div>

      {/* Настройки — inset grouped style */}
      <div className="shrink-0 px-4 pb-4">
        <h3 className="text-xs text-[#8E8E93] uppercase tracking-wider mb-3">
          Настройки
        </h3>
        <section className="rounded-[24px] bg-[#1C1C1E] overflow-hidden">
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-white/5">
            <span className="text-sm font-medium text-white">Звук</span>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                soundEnabled ? 'bg-[#26D07C]' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm font-medium text-white">Вибрация</span>
            <button
              type="button"
              role="switch"
              aria-checked={vibrationEnabled}
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                vibrationEnabled ? 'bg-[#26D07C]' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
