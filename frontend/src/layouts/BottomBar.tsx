import { Home, Trophy, Users } from 'lucide-react'
import { useGameStore, type Screen } from '@/store'
import { useHaptic } from '@/hooks/useHaptic'
import { useTelegram } from '@/hooks/useTelegram'
import { UserAvatar } from '@/components/ui'

const tabs: { id: Screen; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'leaderboard', label: 'Топ', Icon: Trophy },
  { id: 'frens', label: 'Друзья', Icon: Users },
]

export function BottomBar() {
  const { screen, setScreen, username } = useGameStore()
  const { impact } = useHaptic()
  const { photoUrl } = useTelegram()

  const handleTab = (s: Screen) => {
    impact('light')
    setScreen(s)
  }

  return (
    <nav className="bottom-bar-fixed bottom-bar-compact flex shrink-0 items-center justify-around py-2 px-2 bg-black border-t border-white/10">
      {tabs.map((tab) => {
        const isActive = screen === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTab(tab.id)}
            className={`tab-btn flex flex-col items-center gap-1.5 py-2.5 px-4 rounded-xl transition-all duration-200 min-w-[56px] ${
              isActive ? 'text-white' : 'text-[var(--text-secondary)]'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-white/10' : ''}`}>
              <tab.Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-semibold">{tab.label}</span>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-0.5" />}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => handleTab('profile')}
        className={`tab-btn flex flex-col items-center gap-1.5 py-2.5 px-4 rounded-xl transition-all duration-200 min-w-[56px] ${
          screen === 'profile' ? 'text-white' : 'text-[var(--text-secondary)]'
        }`}
      >
        <div className={`p-0.5 rounded-xl transition-all ${screen === 'profile' ? 'ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[var(--bg-main)]' : ''}`}>
          <UserAvatar src={photoUrl} name={username} size={24} />
        </div>
        <span className="text-[10px] font-semibold">Профиль</span>
        {screen === 'profile' && <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-0.5" />}
      </button>
    </nav>
  )
}
