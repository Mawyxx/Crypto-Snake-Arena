import { useState, useCallback, useEffect, useRef } from 'react'
import { Arena, GameOverOverlay, VictoryOverlay, type GameResult } from '@/components/game'
import { useGameStore } from '@/store'
import { getUserIdFromInitData } from '@/lib/telegramInit'
import { useHaptic } from '@/hooks/useHaptic'
import { useBalance } from '@/hooks/useBalance'
import { useMemo } from 'react'

const HOLD_EXIT_MS = 4000

function HoldToExitOverlay({
  onHoldStart,
  onHoldEnd,
  holdMs,
}: {
  onHoldStart: () => void
  onHoldEnd: () => void
  holdMs: number
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
        className="relative w-14 h-14 rounded-2xl bg-black/60 border border-white/20 flex flex-col items-center justify-center active:bg-black/80 transition-colors overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
      >
        <span className="relative z-10 text-[10px] text-white/90 font-medium">Выйти</span>
        <span className="relative z-10 text-[8px] text-white/60">удерж. 4с</span>
        {progress > 0 && (
          <div
            className="absolute inset-0 bg-emerald-500/50 transition-none"
            style={{ height: `${progress * 100}%`, bottom: 0 }}
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

export function GameView() {
  const { bet, setScreen, setInGame, setBalance, balance, userId } = useGameStore()
  const { notify } = useHaptic()
  const { refetch: refetchBalance } = useBalance({ refetchOnMount: false })
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
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

  useEffect(() => {
    if (gameResult) refetchBalance()
  }, [gameResult, refetchBalance])

  const localSnakeId = useMemo(
    () => getUserIdFromInitData() ?? userId,
    [userId]
  )

  const handleGameEnd = useCallback(
    (result: GameResult) => {
      setGameResult(result)
      setInGame(false)
      if (result.status === 'win') {
        notify('success')
        const currentBalance = useGameStore.getState().balance
        setBalance(currentBalance + result.reward)
      } else {
        notify('error')
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
            />
            {/* Кнопка Забрать — компактно для режима шторки */}
            <div
              className="absolute right-3 bottom-3 z-20"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
            >
              <button
                type="button"
                onClick={handleCashOut}
                className="px-3 py-1.5 rounded-lg bg-[#4C447c]/95 border border-white/30 text-white font-bold text-xs shadow-lg shadow-black/40 active:scale-95 transition-transform"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
              >
                Забрать
              </button>
            </div>
            <HoldToExitOverlay
              onHoldStart={handleHoldStart}
              onHoldEnd={handleHoldEnd}
              holdMs={HOLD_EXIT_MS}
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
        reward={gameResult?.reward ?? 0}
        newBalance={balance + (gameResult?.reward ?? 0)}
        onCollect={handleCollectAndExit}
      />
    </div>
  )
}
