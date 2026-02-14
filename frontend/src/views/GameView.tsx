import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Arena, GameOverOverlay, VictoryOverlay, type GameResult } from '@/components/game'
import { useGameStore } from '@/store'
import { getUserIdFromInitData } from '@/shared/lib'
import { useHaptic } from '@/features/haptic'
import { useBalance } from '@/entities/balance'

const HOLD_EXIT_MS = 4000

function HoldToExitOverlay({
  onHoldStart,
  onHoldEnd,
  holdMs,
  t,
}: {
  onHoldStart: () => void
  onHoldEnd: () => void
  holdMs: number
  t: (key: string) => string
}) {
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const handlePointerDown = useCallback(() => {
    onHoldStart()
    startTimeRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - (startTimeRef.current ?? 0)
      setProgress(Math.min(1, elapsed / holdMs))
      if (elapsed < holdMs) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [onHoldStart, holdMs])

  const handlePointerUp = useCallback(() => {
    onHoldEnd()
    startTimeRef.current = null
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setProgress(0)
  }, [onHoldEnd])

  const handlePointerLeave = useCallback(() => {
    if (startTimeRef.current !== null) handlePointerUp()
  }, [handlePointerUp])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className="absolute bottom-4 left-4 z-20 touch-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <button
        type="button"
        className="relative w-[60px] h-[60px] rounded-[20px] bg-[var(--bg-menu-card)] border border-white/10 flex flex-col items-center justify-center active:bg-[var(--bg-surface-alt)] transition-colors overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
      >
        <span className="relative z-10 text-[10px] text-white font-medium">{t('game.exit')}</span>
        <span className="relative z-10 text-[8px] text-[var(--text-secondary)]">{t('game.hold4s')}</span>
        {progress > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 bg-neon-green/70 transition-none"
            style={{ height: `${progress * 100}%` }}
          />
        )}
      </button>
    </div>
  )
}

function getWsBaseUrl(): string {
  const env = import.meta.env.VITE_WS_URL as string | undefined
  if (env) return env.replace(/^http/, 'ws')
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
    return `${wsProtocol}//${host}`
  }
  return 'ws://localhost:8080'
}

export const GameView = React.memo(function GameView() {
  const { t } = useTranslation()
  const { bet, setScreen, setInGame, setBalance, balance, userId } = useGameStore()
  const { notify } = useHaptic()
  const { refetch: refetchBalance } = useBalance({ refetchOnMount: false })
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [liveScore, setLiveScore] = useState(0)
  const [cashOutRequested, setCashOutRequested] = useState(false)
  const blockInputRef = useRef(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCashOut = useCallback(() => setCashOutRequested(true), [])
  const handleHoldStart = useCallback(() => {
    blockInputRef.current = true
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null
      blockInputRef.current = false
      handleCashOut()
    }, HOLD_EXIT_MS)
  }, [handleCashOut])

  const handleHoldEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    blockInputRef.current = false
  }, [])

  // deepsource ignore JS-0045: useEffect cleanup return is valid React pattern
  useEffect(() => {
    if (!gameResult) return
    // При победе бэкенд зачисляет на баланс с задержкой — даём 600ms, чтобы избежать race condition
    const delayMs = gameResult.status === 'win' ? 600 : 0
    const timeoutId = setTimeout(refetchBalance, delayMs)
    return () => clearTimeout(timeoutId)
  }, [gameResult, refetchBalance])

  const localSnakeId = useMemo((): number | null => {
    const fromTg = getUserIdFromInitData()
    if (fromTg != null && Number.isFinite(fromTg)) return fromTg
    if (userId != null && Number.isFinite(userId)) return userId
    return null
  }, [userId])

  const handleGameEnd = useCallback(
    (result: GameResult) => {
      setGameResult(result)
      setInGame(false)
      if (result.status === 'win') {
        notify?.('success')
        const currentBalance = Number(useGameStore.getState().balance) || 0
        const reward = Number.isFinite(Number(result.reward)) ? Number(result.reward) : 0
        setBalance(currentBalance + reward)
      } else {
        notify?.('error')
      }
    },
    [setInGame, setBalance, notify]
  )

  const handleExit = () => {
    setInGame(false)
    setScreen('home')
  }

  const handleRetry = () => {
    setGameResult(null)
    setLiveScore(0)
    setCashOutRequested(false)
    setInGame(true)
    setScreen('game')
  }

  const handleGoHome = () => {
    setGameResult(null)
    setCashOutRequested(false)
    setScreen('home')
  }

  const handleCollectAndExit = () => {
    setGameResult(null)
    setCashOutRequested(false)
    setScreen('home')
  }

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  return (
    <div className="h-full flex flex-col touch-none pt-[env(safe-area-inset-top)] bg-[var(--bg-main)]">
      <div className="flex-1 min-h-0 pb-[env(safe-area-inset-bottom)] relative">
        {!gameResult && (
          <>
            <Arena
              key="arena"
              wsBaseUrl={getWsBaseUrl()}
              stake={Math.max(0.3, bet / 100)}
              localSnakeId={localSnakeId}
              onGameEnd={handleGameEnd}
              onConnectionFailed={handleExit}
              cashOutRequested={cashOutRequested}
              blockInputRef={blockInputRef}
              onScoreUpdate={setLiveScore}
            />
            {/* Top overlay with stake summary */}
            <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
              <div className="flex items-center justify-between gap-3 pointer-events-auto rounded-[28px] bg-[var(--bg-menu-card)]/95 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-white/40 uppercase tracking-wide">
                    {t('game.round')}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {t('game.battleMode')}
                  </span>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] text-white/40">
                      {t('game.score')}
                    </span>
                    <span className="text-sm font-semibold text-white tabular-nums">
                      {liveScore}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] text-white/40">
                      {t('game.stake')}
                    </span>
                    <span className="text-sm font-semibold text-white tabular-nums">
                      {Math.max(0.3, bet / 100).toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      <span className="text-[11px] text-white/40">USDT</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute right-3 bottom-3 z-20"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
            >
              <button
                type="button"
                onClick={handleCashOut}
                className="px-3 py-1.5 rounded-[20px] bg-[var(--bg-menu-card)] border border-white/10 text-[11px] font-semibold text-white active:scale-95 transition-transform"
              >
                {t('game.cashOut')}
              </button>
            </div>
            <HoldToExitOverlay
              onHoldStart={handleHoldStart}
              onHoldEnd={handleHoldEnd}
              holdMs={HOLD_EXIT_MS}
              t={t}
            />
          </>
        )}
      </div>

      <GameOverOverlay
        visible={gameResult?.status === 'lose'}
        score={gameResult?.score ?? 0}
        bet={bet}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
      />

      <VictoryOverlay
        visible={gameResult?.status === 'win'}
        reward={Number.isFinite(Number(gameResult?.reward)) ? Number(gameResult?.reward) : 0}
        newBalance={(Number(balance) || 0) + (Number.isFinite(Number(gameResult?.reward)) ? Number(gameResult?.reward) : 0)}
        onCollect={handleCollectAndExit}
      />
    </div>
  )
})
