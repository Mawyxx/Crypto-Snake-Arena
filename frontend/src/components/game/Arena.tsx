import { Stage, Container, useTick, useApp, Text, Graphics } from '@pixi/react'
import { TextStyle, ColorMatrixFilter } from 'pixi.js'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { game } from '@/shared/api/proto/game'
import { useGameEngine, type InterpolatedWorldSnapshot, type InterpolatedSnake } from '@/hooks/useGameEngine'
import { useInputHandler } from '@/hooks/useInputHandler'
import { useTelegram } from '@/features/auth'
import { SnakeView } from './SnakeView'
import { CoinView } from './CoinView'

const WORLD_SIZE = 2000
const ARENA_RADIUS = 1000 // круговая арена (Slither.io scale для SegmentLen 42)
// slither.io-clone: 800x500 viewport, world 3x. Видно 800x500. factor 4 = zoom in как в клоне
const CAMERA_ZOOM_FACTOR = 4.0

export interface GameResult {
  status: 'win' | 'lose'
  score: number
  reward: number
}

interface ArenaProps {
  wsBaseUrl: string
  stake?: number
  localSnakeId?: number | null
  onGameEnd?: (result: GameResult) => void
  onDeathDetected?: (snake: game.ISnake, score: number) => void
  onConnectionFailed?: () => void
  cashOutRequested?: boolean
  blockInputRef?: React.RefObject<boolean>
  onScoreUpdate?: (score: number) => void
}

/**
 * Игровая арена: responsive PixiJS, камера следует за змейке. Без setState в useTick.
 */
export const Arena = ({
  wsBaseUrl,
  stake = 0.3,
  localSnakeId = null,
  onGameEnd,
  onDeathDetected,
  onConnectionFailed,
  cashOutRequested = false,
  blockInputRef,
  onScoreUpdate,
}: ArenaProps) => {
  const { t } = useTranslation()
  const { initData } = useTelegram()
  const containerRef = useRef<HTMLDivElement>(null)
  const snakeHeadRef = useRef<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState({ width: WORLD_SIZE, height: WORLD_SIZE })
  const [lastGrowAt, setLastGrowAt] = useState(0)

  const base = wsBaseUrl.replace(/\/$/, '')
  const wsPath = base.endsWith('/ws') ? '' : '/ws'
  const wsUrl = `${base}${wsPath}?initData=${encodeURIComponent(initData || '')}&stake=${stake}`

  const { getInterpolatedState, sendInput, closeSocket, getLocalSnakeScore, status } = useGameEngine(
    wsUrl,
    {
      localSnakeId,
      onDeath: useCallback(
        (score: number) => {
          onGameEnd?.({ status: 'lose', score, reward: 0 })
        },
        [onGameEnd]
      ),
      onDeathDetected,
      onGrow: useCallback(() => setLastGrowAt(Date.now()), []),
      onCashOut: useCallback(
        (reward: number, score: number) => {
          // Reward получен от сервера - вызываем onGameEnd
          onGameEnd?.({ status: 'win', score, reward })
        },
        [onGameEnd]
      ),
    }
  )

  // deepsource ignore JS-0045: useEffect cleanup return is valid React pattern
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateSize = () => {
      const width = Math.max(el.clientWidth || WORLD_SIZE, 200)
      const height = Math.max(el.clientHeight || WORLD_SIZE, 200)
      setSize({ width, height })
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [])

  const cashOutHandled = useRef(false)
  useEffect(() => {
    if (!cashOutRequested || cashOutHandled.current) return
    cashOutHandled.current = true
    // Отправляем CASH_OUT на сервер - reward придет через onCashOut callback
    closeSocket(true) // send CASH_OUT to backend before close
  }, [cashOutRequested, closeSocket])

  const sendInputStable = useCallback(sendInput, [])
  useInputHandler(sendInputStable, { containerRef, blockInputRef })

  const handleConnectionFailed = useCallback(() => {
    onConnectionFailed?.()
  }, [onConnectionFailed])

  const lastScoreRef = useRef(-1)
  // deepsource ignore JS-0045: useEffect cleanup return is valid React pattern
  useEffect(() => {
    if (!onScoreUpdate) return
    let rafId = 0
    const tick = () => {
      const score = getLocalSnakeScore()
      if (score !== lastScoreRef.current) {
        lastScoreRef.current = score
        onScoreUpdate(score)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [getLocalSnakeScore, onScoreUpdate])

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        minHeight: 200,
        minWidth: 200,
        touchAction: 'none',
        cursor: 'default',
      }}
    >
      {/* Статичный фон — HTML-слой, не следует за камерой */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          backgroundImage: 'url(/bg54.jpg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '599px 519px',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundColor: '#161c22',
          pointerEvents: 'none',
        }}
        aria-hidden
      />
      {(status === 'reconnecting' || status === 'connecting') && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="text-white font-medium">
            {status === 'reconnecting' ? t('game.reconnecting') : t('game.connecting')}
          </span>
        </div>
      )}
      {status === 'queued' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-sm">
          <span className="text-white font-medium">{t('game.queueWaiting')}</span>
          <span className="text-white/70 text-sm">{t('game.queueHint')}</span>
        </div>
      )}
      {status === 'failed' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm p-4">
          <span className="text-white font-medium text-center">{t('game.noConnection')}</span>
          <span className="text-white/70 text-sm text-center">{t('game.checkInternet')}</span>
          <button
            type="button"
            onClick={handleConnectionFailed}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm active:scale-95 transition-transform hover:brightness-110"
          >
            {t('common.toMainMenu')}
          </button>
        </div>
      )}
      <Stage
        width={size.width}
        height={size.height}
        style={{ position: 'relative', zIndex: 1 }}
        options={{
          backgroundAlpha: 0,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <GameLoop
          getInterpolatedState={getInterpolatedState}
          localSnakeId={localSnakeId}
          snakeHeadRef={snakeHeadRef}
          containerRef={containerRef}
          containerWidth={size.width}
          containerHeight={size.height}
          status={status}
          lastGrowAt={lastGrowAt}
        />
      </Stage>
    </div>
  )
}

/**
 * useTick — только refs, без setState.
 * Re-render через отдельную подписку на ticker (не внутри useTick).
 */
// Mock state для проверки рендеринга при отсутствии соединения (dev)
const MOCK_SNAKE = {
  id: 1,
  head: { x: 1000, y: 1000 },
  body: [
    { x: 958, y: 1000 },
    { x: 916, y: 1000 },
    { x: 874, y: 1000 },
  ],
  angle: 0,
  score: 0,
  bodyLength: 4,
  boost: false,
} as InterpolatedSnake

const MOCK_STATE: InterpolatedWorldSnapshot = {
  snakes: [MOCK_SNAKE],
  coins: [],
}

function GameLoop({
  getInterpolatedState,
  localSnakeId,
  snakeHeadRef,
  containerRef,
  containerWidth,
  containerHeight,
  status,
  lastGrowAt,
}: {
  getInterpolatedState: () => InterpolatedWorldSnapshot | null
  localSnakeId: number | null | undefined
  snakeHeadRef: React.MutableRefObject<{ x: number; y: number } | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  containerWidth: number
  containerHeight: number
  status: string
  lastGrowAt: number
}) {
  const app = useApp()
  const stateRef = useRef<InterpolatedWorldSnapshot | null>(null)
  const viewportRef = useRef({ x: 0, y: 0, scale: 1 })
  const targetViewportRef = useRef({ x: 0, y: 0, scale: 1 })
  const mouseWorldRef = useRef<{ x: number; y: number } | null>(null)
  const [, forceUpdate] = useState(0)
  const [lowPerfMode, setLowPerfMode] = useState(false)
  const CAMERA_BASE_LERP = 0.105
  const CAMERA_BOOST_LERP = 0.16
  const perfLastTsRef = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now())
  const perfAccumRef = useRef(0)
  const perfFramesRef = useRef(0)
  const cameraScaleRef = useRef(1)
  const headVelocityRef = useRef(0)

  useEffect(() => {
    const el = containerRef?.current
    if (!el) return
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
      if (clientX == null || clientY == null) return
      const rect = el.getBoundingClientRect()
      const vp = viewportRef.current
      const screenX = clientX - rect.left
      const screenY = clientY - rect.top
      mouseWorldRef.current = {
        x: (screenX - vp.x) / vp.scale,
        y: (screenY - vp.y) / vp.scale,
      }
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('touchmove', onMove, { passive: true })
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('touchmove', onMove)
    }
  }, [containerRef])

  useTick((delta) => {
    const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const frameMs = Math.max(1, nowPerf - perfLastTsRef.current)
    perfLastTsRef.current = nowPerf
    perfAccumRef.current += frameMs
    perfFramesRef.current += 1
    if (perfAccumRef.current >= 1000) {
      const avgFrame = perfAccumRef.current / Math.max(1, perfFramesRef.current)
      const fps = 1000 / avgFrame
      const heap = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory?.usedJSHeapSize ?? 0
      ;(window as Window & { __snakePerf?: Record<string, number | string> }).__snakePerf = {
        fps: Number(fps.toFixed(1)),
        frameMs: Number(avgFrame.toFixed(2)),
        heapUsedMb: Number((heap / (1024 * 1024)).toFixed(2)),
        ts: Date.now(),
      }
      const shouldLowPerf = fps < 35
      setLowPerfMode((prev) => (prev === shouldLowPerf ? prev : shouldLowPerf))
      perfAccumRef.current = 0
      perfFramesRef.current = 0
    }

    const state = getInterpolatedState()
    stateRef.current = state

    let head = snakeHeadRef.current
    let mySnake: InterpolatedSnake | undefined
    if (state?.snakes && localSnakeId != null) {
      mySnake = state.snakes.find((snake) => Number(snake.id) === Number(localSnakeId))
      if (mySnake?.head) {
        head = { x: mySnake.head.x ?? 0, y: mySnake.head.y ?? 0 }
        const prev = snakeHeadRef.current
        if (prev) {
          const dx = head.x - prev.x
          const dy = head.y - prev.y
          headVelocityRef.current = headVelocityRef.current * 0.75 + Math.sqrt(dx * dx + dy * dy) * 0.25
        }
        snakeHeadRef.current = head
      }
    } else {
      snakeHeadRef.current = null
    }

    const centerX = head?.x ?? WORLD_SIZE / 2
    const centerY = head?.y ?? WORLD_SIZE / 2
    const bodyLen = mySnake?.body?.length ?? 0
    const slitherZoom = 0.64285 + 0.514285714 / Math.max(1, (bodyLen + 16) / 36)
    const baseScale = Math.min(containerWidth / WORLD_SIZE, containerHeight / WORLD_SIZE)
    const desiredScale = baseScale * slitherZoom * CAMERA_ZOOM_FACTOR
    cameraScaleRef.current += (desiredScale - cameraScaleRef.current) * 0.09
    const scale = cameraScaleRef.current
    const targetX = containerWidth / 2 - centerX * scale
    const targetY = containerHeight / 2 - centerY * scale
    targetViewportRef.current = { scale, x: targetX, y: targetY }

    const viewport = viewportRef.current
    const targetViewport = targetViewportRef.current
    const turnBoost = Math.min(0.045, headVelocityRef.current * 0.0022)
    const boostLerp = mySnake?.boost ? CAMERA_BOOST_LERP : CAMERA_BASE_LERP
    const lerpFactor = Math.min(1, (boostLerp + turnBoost) * (typeof delta === 'number' ? delta : 1))
    viewportRef.current = {
      scale: viewport.scale + (targetViewport.scale - viewport.scale) * lerpFactor,
      x: viewport.x + (targetViewport.x - viewport.x) * lerpFactor,
      y: viewport.y + (targetViewport.y - viewport.y) * lerpFactor,
    }
  })

  useEffect(() => {
    const onTick = () => forceUpdate((n) => n + 1)
    app.ticker.add(onTick)
    return () => {
      try {
        app?.ticker?.remove(onTick)
      } catch {
        // app may be destroyed on unmount
      }
    }
  }, [app])

  let state = stateRef.current
  // Dev: показываем mock-змейку при отсутствии соединения для проверки рендеринга
  if (!state && import.meta.env.DEV && (status === 'connecting' || status === 'failed')) {
    state = MOCK_STATE
  }
  const vp = viewportRef.current

  return (
    <GameContent
      state={state}
      localSnakeId={localSnakeId}
      viewportX={vp.x}
      viewportY={vp.y}
      viewportScale={vp.scale}
      mouseWorld={mouseWorldRef.current}
      lastGrowAt={lastGrowAt}
      lowPerfMode={lowPerfMode}
    />
  )
}

interface GameContentProps {
  state: InterpolatedWorldSnapshot | null
  localSnakeId: number | null | undefined
  viewportX: number
  viewportY: number
  viewportScale: number
  mouseWorld: { x: number; y: number } | null
  lastGrowAt: number
  lowPerfMode: boolean
}

/** Круговая граница арены — смерть при пересечении */
function ArenaBoundary() {
  const draw = React.useCallback((g: import('pixi.js').Graphics) => {
    g.clear()
    const cx = WORLD_SIZE / 2
    const cy = WORLD_SIZE / 2
    g.lineStyle(3, 0xffffff, 0.6)
    g.drawCircle(cx, cy, ARENA_RADIUS)
  }, [])
  return <Graphics draw={draw} />
}

const BLOOM_FILTER = (() => {
  const f = new ColorMatrixFilter()
  f.brightness(1.05, false)
  return f
})()

function GameContent({
  state,
  localSnakeId,
  viewportX,
  viewportY,
  viewportScale,
  mouseWorld,
  lastGrowAt,
  lowPerfMode,
}: GameContentProps) {
  const localSnake = state && localSnakeId != null
    ? state.snakes?.find((s) => Number(s.id) === Number(localSnakeId))
    : null
  const score = localSnake?.score ?? 0

  return (
    <>
      <Container position={[viewportX, viewportY]} scale={viewportScale} filters={lowPerfMode ? [] : [BLOOM_FILTER]}>
        <ArenaBoundary />
      {state?.snakes?.map((snake) => (
        <SnakeView
          key={String(snake.id)}
          snake={snake}
          isLocalPlayer={localSnakeId != null && Number(snake.id) === Number(localSnakeId)}
          mouseWorld={mouseWorld}
          growthFlash={localSnakeId != null && Number(snake.id) === Number(localSnakeId) ? lastGrowAt : undefined}
        />
      ))}
      {state?.coins?.map((coin, i) => (
        <CoinView key={coin.id != null && coin.id !== '' ? String(coin.id) : `coin-${i}`} coin={coin} />
      ))}
      {/* Slither.io: счёт под змейкой — белый с тенью для читаемости */}
      {localSnake?.head && (
        <Text
          text={String(Math.round(score))}
          x={(localSnake.head.x ?? 0) + 14}
          y={(localSnake.head.y ?? 0) + 10}
          style={new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: 0xffffff,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 4,
            dropShadowDistance: 1,
          })}
        />
      )}
      </Container>
    </>
  )
}
