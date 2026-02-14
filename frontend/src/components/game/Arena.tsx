import { Stage, Container, useTick, useApp, Text, Graphics } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameEngine, type InterpolatedWorldSnapshot, type InterpolatedSnake } from '@/hooks/useGameEngine'
import { useInputHandler } from '@/hooks/useInputHandler'
import { useTelegram } from '@/features/auth'
import { SnakeView } from './SnakeView'
import { CoinView } from './CoinView'

const WORLD_SIZE = 1000
const ARENA_RADIUS = 500 // круговая арена, смерть за границей
// Slither.io: показываем больше арены (зум камеры ~0.8 = видно больше поля)
const CAMERA_ZOOM = 0.8

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
    if (!cashOutRequested || !onGameEnd || cashOutHandled.current) return
    cashOutHandled.current = true
    const score = getLocalSnakeScore()
    closeSocket(true) // send CASH_OUT to backend before close
    onGameEnd({ status: 'win', score, reward: score })
  }, [cashOutRequested, onGameEnd, getLocalSnakeScore, closeSocket])

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

  // Slither.io body background: #161c22
  const bgColor = 0x161c22

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
        options={{
          background: bgColor,
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
          containerWidth={size.width}
          containerHeight={size.height}
          status={status}
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
  head: { x: 500, y: 500 },
  body: [
    { x: 488, y: 500 },
    { x: 476, y: 500 },
    { x: 464, y: 500 },
  ],
  angle: 0,
  score: 0,
  bodyLength: 3,
} as InterpolatedSnake

const MOCK_STATE: InterpolatedWorldSnapshot = {
  snakes: [MOCK_SNAKE],
  coins: [],
}

function GameLoop({
  getInterpolatedState,
  localSnakeId,
  snakeHeadRef,
  containerWidth,
  containerHeight,
  status,
}: {
  getInterpolatedState: () => InterpolatedWorldSnapshot | null
  localSnakeId: number | null | undefined
  snakeHeadRef: React.MutableRefObject<{ x: number; y: number } | null>
  containerWidth: number
  containerHeight: number
  status: string
}) {
  const app = useApp()
  const stateRef = useRef<InterpolatedWorldSnapshot | null>(null)
  const viewportRef = useRef({ x: 0, y: 0, scale: 1 })
  const targetViewportRef = useRef({ x: 0, y: 0, scale: 1 })
  const [, forceUpdate] = useState(0)
  const CAMERA_LERP = 0.15

  useTick((delta) => {
    const state = getInterpolatedState()
    stateRef.current = state

    let head = snakeHeadRef.current
    if (state?.snakes && localSnakeId != null) {
      const mySnake = state.snakes.find((snake) => Number(snake.id) === Number(localSnakeId))
      if (mySnake?.head) {
        head = { x: mySnake.head.x ?? 0, y: mySnake.head.y ?? 0 }
        snakeHeadRef.current = head
      }
    } else {
      snakeHeadRef.current = null
    }

    const centerX = head?.x ?? WORLD_SIZE / 2
    const centerY = head?.y ?? WORLD_SIZE / 2
    const scale = Math.min(containerWidth / WORLD_SIZE, containerHeight / WORLD_SIZE) * CAMERA_ZOOM
    const targetX = containerWidth / 2 - centerX * scale
    const targetY = containerHeight / 2 - centerY * scale
    targetViewportRef.current = { scale, x: targetX, y: targetY }

    const viewport = viewportRef.current
    const targetViewport = targetViewportRef.current
    const lerpFactor = Math.min(1, CAMERA_LERP * (typeof delta === 'number' ? delta : 1))
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
    />
  )
}

interface GameContentProps {
  state: InterpolatedWorldSnapshot | null
  localSnakeId: number | null | undefined
  viewportX: number
  viewportY: number
  viewportScale: number
}

// Фон арены: Slither.io-style #161c22 (без внешней текстуры — надёжный fallback)
const BG_PADDING = 500
const BG_SIZE = WORLD_SIZE + BG_PADDING * 2

function ArenaBackground() {
  const draw = React.useCallback((g: import('pixi.js').Graphics) => {
    g.clear()
    g.beginFill(0x161c22, 1)
    g.drawRect(-BG_PADDING, -BG_PADDING, BG_SIZE, BG_SIZE)
    g.endFill()
  }, [])
  return <Graphics draw={draw} />
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

function GameContent({
  state,
  localSnakeId,
  viewportX,
  viewportY,
  viewportScale,
}: GameContentProps) {
  const localSnake = state && localSnakeId != null
    ? state.snakes?.find((s) => Number(s.id) === Number(localSnakeId))
    : null
  const score = localSnake?.score ?? 0

  return (
    <Container position={[viewportX, viewportY]} scale={viewportScale}>
      <ArenaBackground />
      <ArenaBoundary />
      {state?.snakes?.map((snake) => (
        <SnakeView
          key={String(snake.id)}
          snake={snake}
          isLocalPlayer={localSnakeId != null && Number(snake.id) === Number(localSnakeId)}
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
  )
}
