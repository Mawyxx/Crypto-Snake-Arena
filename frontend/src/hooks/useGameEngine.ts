import { useRef, useCallback, useEffect, useState } from 'react'
import { decodeWorldSnapshot, encodePlayerInput } from '@/shared/api'
import { interpolatePosition, interpolateAngle, extrapolateHead } from '@/engine/Interpolation'
import {
  initFromServerBody,
  updateLocalSnake,
  getBodyForRender,
  type LocalSnakeState,
} from '@/engine/snakeBodyReconstruction'
import type { game } from '@/shared/api/proto/game'

const SERVER_TICK_RATE_MS = 50
const INTERPOLATION_DELAY_MS = 100
const RECONNECT_DELAYS_MS = [1000, 2000, 3000]
const MAX_RECONNECT_ATTEMPTS = 3

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'closed' | 'failed' | 'queued'

export interface InterpolatedSnake extends game.ISnake {
  head: { x: number; y: number }
  angle: number
  boost?: boolean
}

export interface InterpolatedWorldSnapshot {
  tick?: number | null
  snakes?: InterpolatedSnake[]
  coins?: game.ICoin[] | null
}

const DEATH_ANIMATION_MS = 500

export interface GameEngineOptions {
  localSnakeId?: number | null
  onDeath?: (score: number) => void
  onDeathDetected?: (snake: game.ISnake, score: number) => void
  onGrow?: () => void
  enabled?: boolean
}

export const useGameEngine = (wsUrl: string, options?: GameEngineOptions) => {
  const { localSnakeId, onDeath, onDeathDetected, onGrow, enabled = true } = options ?? {}
  const onDeathRef = useRef(onDeath)
  onDeathRef.current = onDeath
  const onDeathDetectedRef = useRef(onDeathDetected)
  onDeathDetectedRef.current = onDeathDetected
  const onGrowRef = useRef(onGrow)
  onGrowRef.current = onGrow
  const deathTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevBodyLengthRef = useRef<number>(0)

  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const lastMessageTime = useRef<number>(0)
  const prevState = useRef<game.IWorldSnapshot | null>(null)
  const currState = useRef<game.IWorldSnapshot | null>(null)
  const socket = useRef<WebSocket | null>(null)
  const deathFired = useRef(false)
  const reconnectAttempt = useRef(0)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intentionalClose = useRef(false)
  const lastSentAngleRef = useRef<number>(0)
  const lastSentBoostRef = useRef<boolean>(false)
  const localSnakeBodyRef = useRef<LocalSnakeState | null>(null)

  const connect = useCallback(async () => {
    if (!enabled || !wsUrl) return

    intentionalClose.current = false
    deathFired.current = false
    localSnakeBodyRef.current = null
    prevBodyLengthRef.current = 0
    const isReconnecting = reconnectAttempt.current > 0
    setStatus(isReconnecting ? 'reconnecting' : 'connecting')

    // Прогрев ngrok: иначе WebSocket-рукопожатие получает HTML-интерстициал и соединение падает
    if (wsUrl.includes('ngrok-free.app') || wsUrl.includes('ngrok-free.dev')) {
      const httpsUrl = wsUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:').split('?')[0]
      try {
        await fetch(httpsUrl, { headers: { 'ngrok-skip-browser-warning': '1' } })
      } catch {
        // бэк вернёт 401 без initData — ок
      }
    }

    socket.current = new WebSocket(wsUrl)
    socket.current.binaryType = 'arraybuffer'

    socket.current.onopen = () => {
      reconnectAttempt.current = 0
      setStatus('connected')
    }

    socket.current.onmessage = (event) => {
      const raw = event.data
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw) as { type?: string; position?: number; error?: string }
          if (parsed.type === 'queue') {
            setStatus('queued')
            return
          }
          if (parsed.error) {
            intentionalClose.current = true
            socket.current?.close()
            socket.current = null
            setStatus('failed')
            return
          }
        } catch {
          // ignore non-JSON text
        }
        return
      }

      let data: Uint8Array
      try {
        if (raw instanceof ArrayBuffer) {
          data = new Uint8Array(raw)
        } else if (raw instanceof Uint8Array) {
          data = raw
        } else {
          return
        }
      } catch {
        return
      }
      let snapshot: game.IWorldSnapshot
      try {
        snapshot = decodeWorldSnapshot(data)
      } catch {
        return
      }

      setStatus('connected')
      prevState.current = currState.current
      currState.current = snapshot
      lastMessageTime.current = Date.now()

      if (localSnakeId != null) {
        const mySnake = snapshot.snakes?.find((s) => Number(s.id) === Number(localSnakeId))
        if (mySnake) {
          if (!prevState.current && mySnake.angle != null) {
            lastSentAngleRef.current = mySnake.angle
            lastSentBoostRef.current = false
          }
          const body = mySnake.body ?? []
          const bodyLength = mySnake.bodyLength ?? body.length
          if (bodyLength > prevBodyLengthRef.current && prevBodyLengthRef.current > 0) {
            onGrowRef.current?.()
          }
          prevBodyLengthRef.current = bodyLength
          if (body.length > 0) {
            localSnakeBodyRef.current = initFromServerBody(
              mySnake.head as { x: number; y: number },
              body as { x: number; y: number }[]
            )
          } else if (bodyLength > 0 && mySnake.head) {
            if (!localSnakeBodyRef.current) {
              localSnakeBodyRef.current = initFromServerBody(
                mySnake.head as { x: number; y: number },
                [],
                bodyLength
              )
            }
            updateLocalSnake(
              localSnakeBodyRef.current,
              mySnake.head as { x: number; y: number },
              bodyLength
            )
          }
        } else {
          localSnakeBodyRef.current = null
          prevBodyLengthRef.current = 0
        }
      }

      if (
        localSnakeId != null &&
        !deathFired.current &&
        prevState.current?.snakes?.some((s) => Number(s.id) === Number(localSnakeId)) &&
        !snapshot.snakes?.some((s) => Number(s.id) === Number(localSnakeId))
      ) {
        deathFired.current = true
        const deadSnake = prevState.current.snakes.find((s) => Number(s.id) === Number(localSnakeId))
        const score = deadSnake?.score ?? 0
        intentionalClose.current = true
        socket.current?.close()
        socket.current = null
        setStatus('closed')
        if (deadSnake) onDeathDetectedRef.current?.(deadSnake, score)
        deathTimeoutRef.current = setTimeout(() => {
          deathTimeoutRef.current = null
          onDeathRef.current?.(score)
        }, DEATH_ANIMATION_MS)
      }
    }

    socket.current.onclose = () => {
      if (intentionalClose.current) return

      socket.current = null
      setStatus('reconnecting')

      if (reconnectAttempt.current >= MAX_RECONNECT_ATTEMPTS) {
        setStatus('failed')
        return
      }

      const delay = RECONNECT_DELAYS_MS[Math.min(reconnectAttempt.current, RECONNECT_DELAYS_MS.length - 1)]
      reconnectAttempt.current++

      reconnectTimeout.current = setTimeout(() => {
        reconnectTimeout.current = null
        connect()
      }, delay)
    }

    socket.current.onerror = () => {
      // onclose вызовется после onerror
    }
  }, [wsUrl, localSnakeId, enabled])

  // deepsource ignore JS-0045: useEffect cleanup return is valid React pattern
  useEffect(() => {
    if (!enabled) {
      setStatus('closed')
      return
    }
    connect()

    return () => {
      intentionalClose.current = true
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
        reconnectTimeout.current = null
      }
      if (deathTimeoutRef.current) {
        clearTimeout(deathTimeoutRef.current)
        deathTimeoutRef.current = null
      }
      socket.current?.close()
      socket.current = null
    }
  }, [connect, enabled])

  const getInterpolatedState = useCallback((): InterpolatedWorldSnapshot | null => {
    if (!currState.current) return null
    if (!prevState.current) return currState.current as InterpolatedWorldSnapshot

    const now = Date.now()
    const renderTime = now - INTERPOLATION_DELAY_MS
    const alpha = (renderTime - lastMessageTime.current + SERVER_TICK_RATE_MS) / SERVER_TICK_RATE_MS
    const alphaClamped = Math.max(0, Math.min(1, alpha))

    const extrapolationSec = Math.min(INTERPOLATION_DELAY_MS / 1000, 0.1)

    const interpolatedSnakes: InterpolatedSnake[] = (currState.current.snakes ?? []).map((currSnake) => {
      const prevSnake = prevState.current?.snakes?.find((s) => Number(s.id) === Number(currSnake.id))
      if (!prevSnake?.head || !currSnake.head) {
        return {
          ...currSnake,
          head: currSnake.head ?? { x: 0, y: 0 },
          angle: currSnake.angle ?? 0,
          body: currSnake.body ?? [],
        } as InterpolatedSnake
      }

      const interpolatedHead = interpolatePosition(
        prevSnake.head as { x: number; y: number },
        currSnake.head as { x: number; y: number },
        alphaClamped
      )
      const interpolatedAngle = interpolateAngle(
        prevSnake.angle ?? 0,
        currSnake.angle ?? 0,
        alphaClamped
      )

      const isLocal = localSnakeId != null && Number(currSnake.id) === Number(localSnakeId)
      const displayAngle = isLocal ? lastSentAngleRef.current : interpolatedAngle
      const displayHead = isLocal
        ? extrapolateHead(interpolatedHead, displayAngle, lastSentBoostRef.current, extrapolationSec)
        : interpolatedHead

      let displayBody: { x: number; y: number }[]
      const currBody = currSnake.body ?? []
      if (isLocal && currBody.length === 0 && localSnakeBodyRef.current) {
        const bodyLength = currSnake.bodyLength ?? 0
        if (bodyLength > 0) {
          updateLocalSnake(localSnakeBodyRef.current, displayHead, bodyLength)
          displayBody = getBodyForRender(localSnakeBodyRef.current)
        } else {
          displayBody = []
        }
      } else {
        const prevBody = prevSnake.body ?? []
        displayBody = currBody.map((currP, i) => {
          const prevP = prevBody[i]
          if (!prevP) return currP as { x: number; y: number }
          return interpolatePosition(
            prevP as { x: number; y: number },
            currP as { x: number; y: number },
            alphaClamped
          )
        })
      }

      return {
        ...currSnake,
        head: displayHead,
        angle: displayAngle,
        body: displayBody,
        boost: isLocal ? lastSentBoostRef.current : false,
      } as InterpolatedSnake
    })

    return {
      ...currState.current,
      snakes: interpolatedSnakes,
    } as InterpolatedWorldSnapshot
  }, [localSnakeId])

  const sendInput = useCallback((angle: number, boost: boolean) => {
    if (socket.current?.readyState !== WebSocket.OPEN) return
    lastSentAngleRef.current = angle
    lastSentBoostRef.current = boost
    const data = encodePlayerInput(angle, boost)
    socket.current.send(data)
  }, [])

  const closeSocket = useCallback((sendCashOut = false) => {
    intentionalClose.current = true
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }
    if (socket.current) {
      if (sendCashOut && socket.current.readyState === WebSocket.OPEN) {
        try {
          socket.current.send('CASH_OUT')
        } catch {
          /* ignore */
        }
      }
      socket.current.close()
      socket.current = null
    }
    setStatus('closed')
  }, [])

  const getLocalSnakeScore = useCallback((): number => {
    const snake = currState.current?.snakes?.find((sn) => Number(sn.id) === Number(localSnakeId))
    return snake?.score ?? 0
  }, [localSnakeId])

  return { getInterpolatedState, sendInput, closeSocket, getLocalSnakeScore, status }
}
