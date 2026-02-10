import { useRef, useCallback, useEffect, useState } from 'react'
import { decodeWorldSnapshot, encodePlayerInput } from '@/api/protoSerializer'
import { interpolatePosition, interpolateAngle } from '@/engine/Interpolation'
import type { game } from '@/api/proto/game'

const SERVER_TICK_RATE_MS = 50
const INTERPOLATION_DELAY_MS = 100
const RECONNECT_DELAYS_MS = [1000, 2000, 3000]
const MAX_RECONNECT_ATTEMPTS = 3

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'closed' | 'failed'

export interface InterpolatedSnake extends game.ISnake {
  head: { x: number; y: number }
  angle: number
}

export interface InterpolatedWorldSnapshot {
  tick?: number | null
  snakes?: InterpolatedSnake[]
  coins?: game.ICoin[] | null
}

export interface GameEngineOptions {
  localSnakeId?: number | null
  onDeath?: (score: number) => void
  enabled?: boolean
}

export const useGameEngine = (wsUrl: string, options?: GameEngineOptions) => {
  const { localSnakeId, onDeath, enabled = true } = options ?? {}
  const onDeathRef = useRef(onDeath)
  onDeathRef.current = onDeath

  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const lastMessageTime = useRef<number>(0)
  const prevState = useRef<game.IWorldSnapshot | null>(null)
  const currState = useRef<game.IWorldSnapshot | null>(null)
  const socket = useRef<WebSocket | null>(null)
  const deathFired = useRef(false)
  const reconnectAttempt = useRef(0)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intentionalClose = useRef(false)

  const connect = useCallback(async () => {
    if (!enabled || !wsUrl) return

    intentionalClose.current = false
    deathFired.current = false
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
      const data = new Uint8Array(event.data as ArrayBuffer)
      const snapshot = decodeWorldSnapshot(data)

      prevState.current = currState.current
      currState.current = snapshot
      lastMessageTime.current = Date.now()

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
        onDeathRef.current?.(score)
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

    const interpolatedSnakes: InterpolatedSnake[] = (currState.current.snakes ?? []).map((currSnake) => {
      const prevSnake = prevState.current?.snakes?.find((s) => Number(s.id) === Number(currSnake.id))
      if (!prevSnake?.head || !currSnake.head) {
        return {
          ...currSnake,
          head: currSnake.head ?? { x: 0, y: 0 },
          angle: currSnake.angle ?? 0,
        } as InterpolatedSnake
      }

      return {
        ...currSnake,
        head: interpolatePosition(
          prevSnake.head as { x: number; y: number },
          currSnake.head as { x: number; y: number },
          alphaClamped
        ),
        angle: interpolateAngle(
          prevSnake.angle ?? 0,
          currSnake.angle ?? 0,
          alphaClamped
        ),
      } as InterpolatedSnake
    })

    return {
      ...currState.current,
      snakes: interpolatedSnakes,
    } as InterpolatedWorldSnapshot
  }, [])

  const sendInput = useCallback((angle: number, boost: boolean) => {
    if (socket.current?.readyState !== WebSocket.OPEN) return
    const data = encodePlayerInput(angle, boost)
    socket.current.send(data)
  }, [])

  const closeSocket = useCallback(() => {
    intentionalClose.current = true
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }
    if (socket.current) {
      socket.current.close()
      socket.current = null
    }
    setStatus('closed')
  }, [])

  const getLocalSnakeScore = useCallback((): number => {
    const s = currState.current?.snakes?.find((sn) => Number(sn.id) === Number(localSnakeId))
    return s?.score ?? 0
  }, [localSnakeId])

  return { getInterpolatedState, sendInput, closeSocket, getLocalSnakeScore, status }
}
