import { useState } from 'react'
import { useGameStore } from '@/store'

type Tab = 'day' | 'all'

export function LeaderboardView() {
  const [tab, setTab] = useState<Tab>('day')
  const { setScreen, setInGame } = useGameStore()

  const handlePlay = () => {
    setInGame(true)
    setScreen('game')
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overscroll-contain bg-[var(--bg-main)] pb-bottom-bar">
      <div className="flex shrink-0 gap-2 p-2 mx-4 mt-4 rounded-2xl bg-[var(--bg-card)] border border-white/[0.06]">
        <button
          type="button"
          onClick={() => setTab('day')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            tab === 'day' ? 'bg-white/10 text-white shadow-lg' : 'text-[var(--text-secondary)]'
          }`}
        >
          За день
        </button>
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            tab === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-[var(--text-secondary)]'
          }`}
        >
          Все время
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 gap-6 py-6" style={{ maxHeight: 'min(80vh, 100%)' }}>
        <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <span className="text-4xl">🏆</span>
        </div>
        <p className="text-[var(--text-secondary)] text-sm text-center font-medium shrink-0">
          Сыграй первую игру — появишься в рейтинге
        </p>
        <button
          type="button"
          onClick={handlePlay}
          className="shrink-0 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
        >
          Играть
        </button>
      </div>
    </div>
  )
}
