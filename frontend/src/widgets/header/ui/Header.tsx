import { useGameStore } from '@/store'
import { useHaptic } from '@/features/haptic'
import { useTelegram } from '@/features/auth'
import { UserAvatar } from '@/entities/user'
import { BalanceCapsule } from '@/entities/balance'

export function Header() {
  const balance = useGameStore((s) => s.balance)
  const username = useGameStore((s) => s.username)
  const userId = useGameStore((s) => s.userId)
  const setScreen = useGameStore((s) => s.setScreen)
  const { impact } = useHaptic()
  const { photoUrl } = useTelegram()

  return (
    <header className="header-compact flex items-center justify-between shrink-0 p-4 pb-3 border-b border-white/5 bg-[var(--bg-main-alt)]">
      <div className="flex items-center gap-3">
        <UserAvatar src={photoUrl} name={username} size={40} className="ring-2 ring-white/5" />
        <div>
          <p className="font-semibold text-white truncate max-w-[120px] text-sm">
            {username || ''}
          </p>
          <p className="text-xs text-white/50">
            #{userId != null ? String(userId).slice(-4) : '—'}
          </p>
        </div>
      </div>
      <BalanceCapsule
        balance={balance}
        onAdd={() => {
          impact('light')
          setScreen('profile')
        }}
      />
    </header>
  )
}
