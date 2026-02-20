import { useRef, useCallback, useEffect, useState } from 'react'
import { decodeWorldSnapshot, encodePlayerInput } from '@/shared/api'
import {
  isWebSocketQueueMessage,
  isWebSocketCashOutMessage,
  isWebSocketErrorMessage,
} from '@/shared/api/types'
import { RingSnapshotBuffer } from '@/shared/lib/snapshot-buffer'
import type { game } from '@/shared/api/proto/game'
import type { ConnectionStatus } from '../types'

const RECONNECT_DELAYS_MS = [1000, 2000, 3000]
const MAX_RECONNECT_ATTEMPTS = 3
const DEATH_ANIMATION_MS = 500

export interface UseWebSocketOptions {
  wsUrl: string
  enabled?: boolean
  localSnakeId?: number | null
  onDeath?: (score: number) => void
  onDeathDetected?: (snake: game.ISnake, score: number) => void
  onGrow?: () => void
  onCashOut?: (reward: number, score: number) => void
}

export interface UseWebSocketReturn {
  status: ConnectionStatus
  snapshotBuffer: RingSnapshotBuffer
  prevSnapshot: game.IWorldSnapshot | null
  sendInput: (angle: number, boost: boolean) => void
  closeSocket: (sendCashOut?: boolean) => void
  getLocalSnakeScore: () => number
}

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    wsUrl,
    enabled = true,
    localSnakeId,
    onDeath,
    onDeathDetected,
    onGrow,
    onCashOut,
  } = options

  const onDeathRef = useRef(onDeath)
  onDeathRef.current = onDeath
  const onDeathDetectedRef = useRef(onDeathDetected)
  onDeathDetectedRef.current = onDeathDetected
  const onGrowRef = useRef(onGrow)
  onGrowRef.current = onGrow
  const onCashOutRef = useRef(onCashOut)
  onCashOutRef.current = onCashOut

  const deathTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [prevSnapshot, setPrevSnapshot] = useState<game.IWorldSnapshot | null>(null)
  const snapshotBufferRef = useRef<RingSnapshotBuffer>(new RingSnapshotBuffer())
  const socket = useRef<WebSocket | null>(null)
  const deathFired = useRef(false)
  const reconnectAttempt = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intentionalClose = useRef(false)
  const reconnectTokenRef = useRef<string | null>(null)

  const buildWsUrl = useCallback((): string => {
    const token = reconnectTokenRef.current
    if (!token) return wsUrl
    const separator = wsUrl.includes('?') ? '&' : '?'
    return `${wsUrl}${separator}reconnect_token=${encodeURIComponent(token)}`
  }, [wsUrl])

  const connect = useCallback(async () => {
    if (!enabled || !wsUrl) return

    intentionalClose.current = false
    deathFired.current = false
    snapshotBufferRef.current.clear()
    setPrevSnapshot(null)
    const isReconnecting = reconnectAttempt.current > 0
    setStatus(isReconnecting ? 'reconnecting' : 'connecting')

    if (wsUrl.includes('ngrok-free.app') || wsUrl.includes('ngrok-free.dev')) {
      const httpsUrl = wsUrl
        .replace(/^wss:/, 'https:')
        .replace(/^ws:/, 'http:')
        .split('?')[0]
      try {
        await fetch(httpsUrl, { headers: { 'ngrok-skip-browser-warning': '1' } })
      } catch {
        /* ok */
      }
    }

    socket.current = new WebSocket(buildWsUrl())
    socket.current.binaryType = 'arraybuffer'

    socket.current.onopen = () => {
      reconnectAttempt.current = 0
      setStatus('connected')
    }

    socket.current.onmessage = (event) => {
      const raw = event.data
      if (typeof raw === 'string') {
        try {
          const parsed: unknown = JSON.parse(raw)

          if (isWebSocketQueueMessage(parsed)) {
            setStatus('queued')
            return
          }
          if (
            parsed &&
            typeof parsed === 'object' &&
            (parsed as { type?: string }).type === 'session'
          ) {
            const token = (parsed as { reconnect_token?: string }).reconnect_token
            if (token && typeof token === 'string') {
              reconnectTokenRef.current = token
            }
            return
          }

          if (isWebSocketCashOutMessage(parsed)) {
            if (onCashOutRef.current && parsed.reward > 0) {
              onCashOutRef.current(parsed.reward, parsed.score)
            }
            return
          }

          if (isWebSocketErrorMessage(parsed)) {
            intentionalClose.current = true
            socket.current?.close()
            socket.current = null
            setStatus('failed')
            return
          }
        } catch {
          /* ignore invalid JSON */
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

      // Обработка смерти локальной змейки
      if (localSnakeId != null) {
        const prevHadLocal = prevSnapshot?.snakes?.some(
          (s) => Number(s.id) === Number(localSnakeId)
        )
        const currHasLocal = snapshot.snakes?.some(
          (s) => Number(s.id) === Number(localSnakeId)
        )
        if (prevHadLocal && !currHasLocal && !deathFired.current) {
          deathFired.current = true
          const deadSnake = prevSnapshot?.snakes?.find(
            (s) => Number(s.id) === Number(localSnakeId)
          )
          const score = (deadSnake?.score as number) ?? 0
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

      setPrevSnapshot(snapshot)

      snapshotBufferRef.current.push({
        tick: Number(snapshot.tick ?? 0),
        timestamp: Date.now(),
        snakes: snapshot.snakes ?? [],
        coins: snapshot.coins ?? [],
      })
    }

    socket.current.onclose = () => {
      if (intentionalClose.current) return
      socket.current = null
      setStatus('reconnecting')
      if (reconnectAttempt.current >= MAX_RECONNECT_ATTEMPTS) {
        setStatus('failed')
        return
      }
      const delay =
        RECONNECT_DELAYS_MS[
          Math.min(reconnectAttempt.current, RECONNECT_DELAYS_MS.length - 1)
        ]
      reconnectAttempt.current++
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null
        connect()
      }, delay)
    }

    socket.current.onerror = () => {}
  }, [buildWsUrl, localSnakeId, enabled, wsUrl])

  useEffect(() => {
    if (!enabled) {
      setStatus('closed')
      reconnectTokenRef.current = null
      return
    }
    connect()
    return () => {
      intentionalClose.current = true
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (deathTimeoutRef.current) {
        clearTimeout(deathTimeoutRef.current)
        deathTimeoutRef.current = null
      }
      socket.current?.close()
      socket.current = null
    }
  }, [connect, enabled])

  const sendInput = useCallback((angle: number, boost: boolean) => {
    if (socket.current?.readyState !== WebSocket.OPEN) return
    const data = encodePlayerInput(angle, boost)
    socket.current.send(data)
  }, [])

  const closeSocket = useCallback((sendCashOut = false) => {
    intentionalClose.current = true
    reconnectTokenRef.current = null
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
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
    const frame = snapshotBufferRef.current.getInterpolated(Date.now())
    const snake = frame?.snakes?.find(
      (sn) => Number(sn.id) === Number(localSnakeId)
    )
    return (snake?.score as number) ?? 0
  }, [localSnakeId])

  return {
    status,
    snapshotBuffer: snapshotBufferRef.current,
    prevSnapshot,
    sendInput,
    closeSocket,
    getLocalSnakeScore,
  }
}
