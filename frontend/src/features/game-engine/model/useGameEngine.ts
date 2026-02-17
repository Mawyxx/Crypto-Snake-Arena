import { useRef, useCallback, useEffect, useState } from 'react'
import { decodeWorldSnapshot, encodePlayerInput } from '@/shared/api'
import {
  interpolatePosition,
  interpolateAngle,
  extrapolateHead,
} from '@/shared/lib/interpolation'
import { RingSnapshotBuffer } from '@/shared/lib/snapshot-buffer'
import {
  interpolateBodyAlongPath,
  initClientHeadPath,
  reconcileClientHeadPathWithServer,
  updateClientHeadPath,
  buildMeshPathFromHeadPath,
  type ClientHeadPathState,
} from '@/entities/snake'
import type { game } from '@/shared/api/proto/game'

const INTERPOLATION_DELAY_MS = 100
const RECONNECT_DELAYS_MS = [1000, 2000, 3000]
const MAX_RECONNECT_ATTEMPTS = 3

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'closed'
  | 'failed'
  | 'queued'

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
  const { localSnakeId, onDeath, onDeathDetected, onGrow, enabled = true } =
    options ?? {}
  const onDeathRef = useRef(onDeath)
  onDeathRef.current = onDeath
  const onDeathDetectedRef = useRef(onDeathDetected)
  onDeathDetectedRef.current = onDeathDetected
  const onGrowRef = useRef(onGrow)
  onGrowRef.current = onGrow
  const deathTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevBodyLengthRef = useRef<number>(0)

  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const snapshotBufferRef = useRef<RingSnapshotBuffer>(new RingSnapshotBuffer())
  const prevSnapshotRef = useRef<game.IWorldSnapshot | null>(null)
  const socket = useRef<WebSocket | null>(null)
  const deathFired = useRef(false)
  const reconnectAttempt = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intentionalClose = useRef(false)
  const lastSentAngleRef = useRef<number>(0)
  const lastSentBoostRef = useRef<boolean>(false)
  const localSnakePathRef = useRef<ClientHeadPathState | null>(null)

  const connect = useCallback(async () => {
    if (!enabled || !wsUrl) return

    intentionalClose.current = false
    deathFired.current = false
    localSnakePathRef.current = null
    prevBodyLengthRef.current = 0
    snapshotBufferRef.current.clear()
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
          const parsed = JSON.parse(raw) as {
            type?: string
            position?: number
            error?: string
          }
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
          /* ignore */
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

      if (localSnakeId != null) {
        const prevHadLocal = prevSnapshotRef.current?.snakes?.some(
          (s) => Number(s.id) === Number(localSnakeId)
        )
        const currHasLocal = snapshot.snakes?.some(
          (s) => Number(s.id) === Number(localSnakeId)
        )
        if (prevHadLocal && !currHasLocal && !deathFired.current) {
          deathFired.current = true
          const deadSnake = prevSnapshotRef.current?.snakes?.find(
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
      prevSnapshotRef.current = snapshot

      snapshotBufferRef.current.push({
        tick: Number(snapshot.tick ?? 0),
        timestamp: Date.now(),
        snakes: snapshot.snakes ?? [],
        coins: snapshot.coins ?? [],
      })

      if (localSnakeId != null) {
        const mySnake = snapshot.snakes?.find(
          (s) => Number(s.id) === Number(localSnakeId)
        )
        if (mySnake) {
          if (!localSnakePathRef.current && mySnake.angle != null) {
            lastSentAngleRef.current = mySnake.angle as number
            lastSentBoostRef.current = false
          }
          const body = (mySnake.body ?? []) as { x: number; y: number }[]
          const bodyLength = (mySnake.bodyLength ?? body.length) as number
          if (bodyLength > prevBodyLengthRef.current && prevBodyLengthRef.current > 0) {
            onGrowRef.current?.()
          }
          prevBodyLengthRef.current = bodyLength
          const head = mySnake.head as { x: number; y: number }
          if (body.length > 0) {
            if (!localSnakePathRef.current) {
              localSnakePathRef.current = initClientHeadPath(head, body, bodyLength)
            } else {
              reconcileClientHeadPathWithServer(
                localSnakePathRef.current,
                head,
                body,
                bodyLength
              )
            }
          } else if (bodyLength > 0 && head) {
            if (!localSnakePathRef.current) {
              localSnakePathRef.current = initClientHeadPath(
                head,
                [],
                bodyLength
              )
            }
            reconcileClientHeadPathWithServer(
              localSnakePathRef.current,
              head,
              [],
              bodyLength
            )
          }
        } else {
          localSnakePathRef.current = null
          prevBodyLengthRef.current = 0
        }
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
  }, [wsUrl, localSnakeId, enabled])

  useEffect(() => {
    if (!enabled) {
      setStatus('closed')
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

  const getInterpolatedState = useCallback((): InterpolatedWorldSnapshot | null => {
    const buffer = snapshotBufferRef.current
    const renderTime = Date.now() - INTERPOLATION_DELAY_MS
    const input = buffer.getInterpolationInput(renderTime)
    let prevFrame: { snakes?: game.ISnake[] } | null
    let currFrame: { tick: number; timestamp: number; snakes?: game.ISnake[]; coins?: game.ICoin[] }
    let alpha: number
    if (input) {
      prevFrame = input.prev
      currFrame = input.curr
      alpha = input.alpha
    } else {
      const frame = buffer.getInterpolated(renderTime)
      if (!frame) return null
      prevFrame = null
      currFrame = frame
      alpha = 1
    }

    const extrapolationSec = Math.min(INTERPOLATION_DELAY_MS / 1000, 0.1)

    const interpolatedSnakes: InterpolatedSnake[] = (
      currFrame.snakes ?? []
    ).map((snake: game.ISnake) => {
      const head = snake.head as { x: number; y: number }
      if (!head) {
        return {
          ...snake,
          head: { x: 0, y: 0 },
          angle: snake.angle ?? 0,
          body: snake.body ?? [],
        } as InterpolatedSnake
      }

      const isLocal =
        localSnakeId != null && Number(snake.id) === Number(localSnakeId)
      const prevSnake = prevFrame?.snakes?.find(
        (s) => Number(s.id) === Number(snake.id)
      )
      const prevHead = prevSnake?.head as { x: number; y: number } | undefined
      const currBody = (snake.body ?? []) as { x: number; y: number }[]

      const interpolatedHead =
        prevHead && !isLocal
          ? interpolatePosition(prevHead, head, alpha)
          : head
      const displayAngle = isLocal
        ? lastSentAngleRef.current
        : interpolateAngle(
            prevSnake?.angle ?? 0,
            snake.angle ?? 0,
            alpha
          )
      const displayHead = isLocal
        ? extrapolateHead(
            interpolatedHead,
            displayAngle,
            lastSentBoostRef.current,
            extrapolationSec
          )
        : interpolatedHead

      let displayBody: { x: number; y: number }[]

      if (isLocal && localSnakePathRef.current) {
        const bodyLength = (snake.bodyLength ?? currBody.length) as number
        if (bodyLength > 0) {
          updateClientHeadPath(
            localSnakePathRef.current,
            displayHead,
            bodyLength
          )
          displayBody = buildMeshPathFromHeadPath(
            localSnakePathRef.current.headPath,
            bodyLength
          )
        } else {
          displayBody = []
        }
      } else if (prevFrame && prevSnake) {
        const prevBody = (prevSnake.body ?? []) as { x: number; y: number }[]
        if (prevHead && (prevBody.length > 0 || currBody.length > 0)) {
          displayBody = interpolateBodyAlongPath(
            prevHead,
            prevBody,
            head,
            currBody,
            alpha
          )
        } else {
          displayBody = currBody
        }
      } else {
        displayBody = currBody
      }

      return {
        ...snake,
        head: displayHead,
        angle: displayAngle,
        body: displayBody,
        boost: isLocal ? lastSentBoostRef.current : false,
      } as InterpolatedSnake
    })

    return {
      tick: currFrame.tick,
      timestamp: currFrame.timestamp,
      snakes: interpolatedSnakes,
      coins: currFrame.coins,
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
    getInterpolatedState,
    sendInput,
    closeSocket,
    getLocalSnakeScore,
    status,
  }
}
