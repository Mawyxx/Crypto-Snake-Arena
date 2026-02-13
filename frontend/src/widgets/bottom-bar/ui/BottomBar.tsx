import { useTranslation } from 'react-i18next'
import { useGameStore, type Screen } from '@/store'
import { useHaptic } from '@/features/haptic'
import { useTelegram } from '@/features/auth'
import { UserAvatar } from '@/entities/user'
import { Icon } from '@/shared/ui'

const baseTabs: { id: Screen; labelKey: string; iconName: 'home' | 'leaderboard' | 'group' | 'admin_panel_settings' }[] = [
  { id: 'home', labelKey: 'nav.home', iconName: 'home' },
  { id: 'leaderboard', labelKey: 'nav.leaderboard', iconName: 'leaderboard' },
  { id: 'frens', labelKey: 'nav.frens', iconName: 'group' },
]

export function BottomBar() {
  const { t } = useTranslation()
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const username = useGameStore((s) => s.username)
  const isAdmin = useGameStore((s) => s.isAdmin)
  const { impact } = useHaptic()
  const { photoUrl } = useTelegram()

  const tabs = isAdmin
    ? [...baseTabs, { id: 'admin' as Screen, labelKey: 'nav.admin', iconName: 'admin_panel_settings' as const }]
    : baseTabs

  const handleTab = (s: Screen) => {
    impact('light')
    setScreen(s)
  }

  return (
    <div
      className="absolute bottom-8 left-0 right-0 px-4 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="max-w-md mx-auto flex items-center gap-3 w-full">
        <nav className="flex-grow flex items-center justify-around nav-pill rounded-[2.5rem] py-3.5 px-6">
          {tabs.map((tab) => {
            const isActive = screen === tab.id
            const iconName = tab.iconName === 'admin_panel_settings' ? 'admin_panel_settings' : tab.iconName
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTab(tab.id)}
                className={`tab-btn flex flex-col items-center gap-1 transition-all duration-200 min-w-[56px] active:scale-95 hover:opacity-70 ${
                  isActive ? 'text-primary' : 'opacity-40 text-white'
                }`}
              >
                <Icon name={iconName} size={28} filled={isActive} className={isActive ? 'text-primary' : ''} />
                <span className={`text-[10px] ${isActive ? 'font-bold text-primary' : 'font-medium text-white'}`}>
                  {t(tab.labelKey)}
                </span>
              </button>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={() => handleTab('profile')}
          className="w-[72px] h-[72px] shrink-0 active:scale-95 transition-transform bg-anthracite rounded-full flex items-center justify-center border border-white/10"
        >
          <div className={`w-12 h-12 rounded-full p-0.5 flex items-center justify-center overflow-hidden ${screen === 'profile' ? 'neon-avatar-ring' : 'border border-white/10'}`}>
            <UserAvatar src={photoUrl} name={username} size={44} className="rounded-full" />
          </div>
        </button>
      </div>
    </div>
  )
}
