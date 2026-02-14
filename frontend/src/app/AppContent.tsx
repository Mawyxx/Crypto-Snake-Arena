import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore, type Screen } from '@/store'
import { useBalance } from '@/entities/balance'
import { useConfig } from '@/hooks/useConfig'
import { useStats } from '@/hooks/useStats'
import { getTelegramUserFromInitData, getDisplayNameFromTelegramUser } from '@/shared/lib'
import { BottomBar } from '@/widgets/bottom-bar'
import { HomePage } from '@/pages/home'
import { LeaderboardPage } from '@/pages/leaderboard'
import { FrensPage } from '@/pages/frens'
import { ProfilePage } from '@/pages/profile'
import { GamePage } from '@/pages/game'
import { AdminPage } from '@/pages/admin'

const screenComponents: Record<Screen, React.ComponentType> = {
  home: HomePage,
  leaderboard: LeaderboardPage,
  frens: FrensPage,
  profile: ProfilePage,
  admin: AdminPage,
  game: GamePage,
}

export function AppContent() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const setProfile = useGameStore((s) => s.setProfile)
  const showBackButton = screen !== 'home'
  const prevScreenRef = useRef<Screen>(screen)

  useEffect(() => {
    const tgUser = getTelegramUserFromInitData()
    if (!tgUser || !Number.isFinite(tgUser.id)) return
    let cached: string | null = null
    try {
      if (typeof localStorage !== 'undefined') {
        cached = localStorage.getItem(`crypto_snake_dn_${tgUser.id}`)
      }
    } catch {
      /* localStorage disabled */
    }
    const name = cached ?? getDisplayNameFromTelegramUser(tgUser)
    setProfile(name || '', tgUser.id, undefined)
  }, [setProfile])

  if (prevScreenRef.current !== screen) {
    prevScreenRef.current = screen
  }

  useConfig()
  useBalance({ refetchOnMount: true })
  useStats()

  useEffect(() => {
    const btn = (window as { Telegram?: { WebApp?: { BackButton?: { show: () => void; hide: () => void } } } }).Telegram?.WebApp?.BackButton
    if (!btn) return
    if (showBackButton) btn.show()
    else btn.hide()
  }, [showBackButton])

  useEffect(() => {
    const btn = (window as { Telegram?: { WebApp?: { BackButton?: { onClick: (cb: () => void) => void; offClick: (cb: () => void) => void } } } }).Telegram?.WebApp?.BackButton
    if (!btn) return
    const handler = () => setScreen('home')
    btn.onClick(handler)
    return () => btn.offClick(handler)
  }, [setScreen])

  const Component = screenComponents[screen]
  const isGame = screen === 'game'

  const contentVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  }

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 0 },
    exit: { opacity: 1 },
  }

  const contentTransition = { duration: 0.25, ease: 'easeOut' as const }
  const overlayExitTransition = { duration: 0.15, ease: 'easeIn' as const }

  if (isGame) {
    return (
      <div className="app app-content-wrap relative h-full w-full max-w-[420px] mx-auto bg-[var(--bg-main)] touch-none overflow-hidden min-h-[100dvh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="relative h-full"
          >
            <motion.div
              variants={contentVariants}
              transition={contentTransition}
              className="h-full"
            >
              <Component />
            </motion.div>
            <motion.div
              variants={overlayVariants}
              transition={overlayExitTransition}
              className="absolute inset-0 bg-black pointer-events-none"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="app app-content-wrap relative flex flex-col h-full min-h-0 w-full max-w-[420px] mx-auto bg-[var(--bg-main)] overflow-hidden pt-[env(safe-area-inset-top)]">
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div
          className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain touch-auto hide-scrollbar bg-[var(--bg-main)]"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={contentTransition}
              className="min-h-full"
            >
              <Component />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomBar />
    </div>
  )
}
