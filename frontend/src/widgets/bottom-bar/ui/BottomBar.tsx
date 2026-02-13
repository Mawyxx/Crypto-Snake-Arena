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
    <nav
      className="bottom-bar-compact fixed left-1/2 -translate-x-1/2 w-[90%] max-w-md flex items-center gap-3 z-50"
      style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex flex-1 items-center justify-between glass-capsule rounded-full p-1.5 nav-shadow min-w-0">
        {tabs.map((tab) => {
          const isActive = screen === tab.id
          const iconName = tab.iconName === 'admin_panel_settings' ? 'admin_panel_settings' : tab.iconName
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTab(tab.id)}
              className={`tab-btn flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 active:scale-95 hover:opacity-70 ${
                isActive ? 'text-primary' : 'text-secondary'
              }`}
            >
              <Icon name={iconName} size={22} filled={isActive} className={isActive ? 'text-primary' : 'text-secondary'} />
              <span className={`text-[8px] font-bold uppercase mt-1 tracking-tighter ${isActive ? 'text-primary' : 'font-medium text-secondary'}`}>
                {t(tab.labelKey)}
              </span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => handleTab('profile')}
        className={`w-14 h-14 shrink-0 active:scale-95 transition-transform bg-[var(--bg-menu-card)] rounded-full flex items-center justify-center p-0.5 border-2 border-primary flex-shrink-0 ${screen === 'profile' ? 'profile-ring' : ''}`}
      >
        <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
          <UserAvatar src={photoUrl} name={username} size={48} className="rounded-full" />
        </div>
      </button>
    </nav>
  )
}
