import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore, type Screen } from '@/store'
import { useBalance } from '@/hooks/useBalance'
import { useConfig } from '@/hooks/useConfig'
import { getTelegramUserFromInitData, getDisplayNameFromTelegramUser } from '@/lib/telegramInit'
import { BottomBar } from '@/layouts'
import {
  HomeView,
  LeaderboardView,
  FrensView,
  ProfileView,
  GameView,
} from '@/views'

const screenComponents: Record<Screen, React.ComponentType> = {
  home: HomeView,
  leaderboard: LeaderboardView,
  frens: FrensView,
  profile: ProfileView,
  game: GameView,
}

export function AppContent() {
  const { screen, setScreen, setProfile } = useGameStore()
  const showBackButton = screen !== 'home'
  const prevScreenRef = useRef<Screen>(screen)

  useEffect(() => {
    const tgUser = getTelegramUserFromInitData()
    if (tgUser) {
      const cached = typeof localStorage !== 'undefined'
        ? localStorage.getItem(`crypto_snake_dn_${tgUser.id}`)
        : null
      const name = cached ?? getDisplayNameFromTelegramUser(tgUser)
      setProfile(name, tgUser.id)
    }
  }, [setProfile])

  if (prevScreenRef.current !== screen) {
    prevScreenRef.current = screen
  }

  useConfig()
  useBalance({ refetchOnMount: true })

  useEffect(() => {
    const btn = window.Telegram?.WebApp?.BackButton
    if (!btn) return
    if (showBackButton) btn.show()
    else btn.hide()
  }, [showBackButton])

  useEffect(() => {
    const btn = window.Telegram?.WebApp?.BackButton
    if (!btn) return
    const handler = () => setScreen('home')
    btn.onClick(handler)
    return () => btn.offClick(handler)
  }, [setScreen])

  const Component = screenComponents[screen]
  const isGame = screen === 'game'

  const wrapperVariants = { initial: {}, animate: {}, exit: {} }

  const contentVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 0 },
    exit: { opacity: 1 },
  }

  const contentTransition = { duration: 0.35, ease: 'easeOut' as const }
  const overlayExitTransition = { duration: 0.15, ease: 'easeIn' as const }

  if (isGame) {
    return (
      <div className="app app-content-wrap relative h-full w-full max-w-[420px] mx-auto bg-[var(--bg-main)] touch-none overflow-hidden min-h-[100dvh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={wrapperVariants}
            initial="initial"
            animate="animate"
            exit="exit"
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
    <div className="app app-content-wrap flex flex-col h-full min-h-0 w-full max-w-[420px] mx-auto bg-[var(--bg-main)] touch-none overflow-hidden pt-[env(safe-area-inset-top)]">
      <main className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={wrapperVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full absolute inset-0"
          >
            <motion.div
              variants={contentVariants}
              transition={contentTransition}
              className="h-full min-h-full overflow-y-auto overscroll-contain touch-auto bg-[var(--bg-main)]"
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
      </main>
      <BottomBar />
    </div>
  )
}
