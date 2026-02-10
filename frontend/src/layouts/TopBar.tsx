import { useGameStore } from '@/store'
import { useHaptic } from '@/hooks/useHaptic'
import { useTelegram } from '@/hooks/useTelegram'
import { UserAvatar, BalanceCapsule } from '@/components/ui'

export function TopBar() {
  const { balance, username, userId, setScreen } = useGameStore()
  const { impact } = useHaptic()
  const { photoUrl } = useTelegram()

  return (
    <header className="header-compact flex items-center justify-between shrink-0 p-4 pb-3 bg-[#0a0a0a] border-b border-white/5">
      <div className="flex items-center gap-3">
        <UserAvatar src={photoUrl} name={username} size={40} className="ring-2 ring-white/5" />
        <div>
          <p className="font-semibold text-white truncate max-w-[120px] text-sm">
            {username || 'Игрок'}
          </p>
          <p className="text-xs text-[#888888]">
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
