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
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overscroll-contain touch-auto bg-[#0a0a0a] pb-bottom-bar">
      <div className="shrink-0 p-4">
        {/* Карточка профиля */}
        <div className="rounded-2xl bg-[#2A2A2A] border border-white/5 overflow-hidden">
          {/* Верх: аватар, ник, рейтинг, баланс */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/5">
              <UserAvatar src={photoUrl} name={username} size={56} className="rounded-none" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-white truncate">{username || 'Игрок'}</h1>
              <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600">
                #{rank || 0}+
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="text-right">
                <p className="text-xs text-[#888888]">Баланс</p>
                <p className="font-bold text-white tabular-nums text-sm">
                  {balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[#26a17b]/90 text-xs">USDT</span>
                </p>
              </div>
            </div>
          </div>

          {/* Разделитель */}
          <div className="h-px bg-white/5 mx-4" />

          {/* Низ: Игр, Объём, Вывод — равные колонки */}
          <div className="p-4 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-white tabular-nums text-sm">{gamesPlayed}</p>
              <p className="text-xs text-[#888888] mt-0.5">Игр</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold tabular-nums text-sm text-[#26a17b]">
                {totalDeposited.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[#26a17b]/80 text-xs">USDT</span>
              </p>
              <p className="text-xs text-[#888888] mt-0.5">Объём</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold tabular-nums text-sm text-[#26a17b]">
                {totalWithdrawn.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[#26a17b]/80 text-xs">USDT</span>
              </p>
              <p className="text-xs text-[#888888] mt-0.5">Вывод</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4">
        <h2 className="text-xs text-[#888888] uppercase tracking-wider mb-3">
          История транзакций
        </h2>
        <div className="card-premium py-8 flex items-center justify-center rounded-2xl">
          <p className="text-[#888888] text-sm">Пока пусто</p>
        </div>
      </div>

      {/* Settings */}
      <div className="shrink-0 p-4 border-t border-white/5">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-white text-sm font-medium">Звук</span>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative w-14 h-8 rounded-full transition-all ${
                soundEnabled ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/25' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-200 ${soundEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-white text-sm font-medium">Вибрация</span>
            <button
              type="button"
              role="switch"
              aria-checked={vibrationEnabled}
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`relative w-14 h-8 rounded-full transition-all ${
                vibrationEnabled ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/25' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-200 ${vibrationEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
    </div>
  )
}
