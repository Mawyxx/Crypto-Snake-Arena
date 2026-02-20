import { useRef, useCallback } from 'react'
import {
  initClientHeadPath,
  reconcileClientHeadPathWithServer,
  type ClientHeadPathState,
} from '@/entities/snake'
import type { game } from '@/shared/api/proto/game'

export interface UsePredictionOptions {
  localSnakeId?: number | null
  onGrow?: () => void
}

export interface UsePredictionReturn {
  getLastSentAngle: () => number
  getLastSentBoost: () => boolean
  getLocalSnakePath: () => ClientHeadPathState | null
  updateFromSnapshot: (snapshot: game.IWorldSnapshot) => void
  reset: () => void
  updateLastSentInput: (angle: number, boost: boolean) => void
}

export const usePrediction = (options: UsePredictionOptions): UsePredictionReturn => {
  const { localSnakeId, onGrow } = options

  const localSnakePathRef = useRef<ClientHeadPathState | null>(null)
  const lastSentAngleRef = useRef<number>(0)
  const lastSentBoostRef = useRef<boolean>(false)
  const prevBodyLengthRef = useRef<number>(0)
  const onGrowRef = useRef(onGrow)
  onGrowRef.current = onGrow

  const updateFromSnapshot = useCallback(
    (snapshot: game.IWorldSnapshot) => {
      if (localSnakeId == null) {
        localSnakePathRef.current = null
        prevBodyLengthRef.current = 0
        return
      }

      const mySnake = snapshot.snakes?.find(
        (s) => Number(s.id) === Number(localSnakeId)
      )

      if (mySnake) {
        // Инициализация lastSentAngle при первом появлении змейки
        if (!localSnakePathRef.current && mySnake.angle != null) {
          const angle = mySnake.angle as number
          lastSentAngleRef.current = angle
          lastSentBoostRef.current = false
        }

        const body = (mySnake.body ?? []) as { x: number; y: number }[]
        const bodyLength = (mySnake.bodyLength ?? body.length) as number

        // Обработка роста змейки
        if (bodyLength > prevBodyLengthRef.current && prevBodyLengthRef.current > 0) {
          onGrowRef.current?.()
        }
        prevBodyLengthRef.current = bodyLength

        const head = mySnake.head as { x: number; y: number }
        const serverTick = Number(snapshot.tick ?? 0)

        if (body.length > 0) {
          if (!localSnakePathRef.current) {
            const path = initClientHeadPath(
              head,
              body,
              bodyLength,
              serverTick
            )
            localSnakePathRef.current = path
          } else {
            // reconcileClientHeadPathWithServer мутирует объект напрямую
            reconcileClientHeadPathWithServer(
              localSnakePathRef.current,
              serverTick,
              head,
              body,
              bodyLength
            )
          }
        } else if (bodyLength > 0 && head) {
          if (!localSnakePathRef.current) {
            const path = initClientHeadPath(
              head,
              [],
              bodyLength,
              serverTick
            )
            localSnakePathRef.current = path
          } else {
            // reconcileClientHeadPathWithServer мутирует объект напрямую
            reconcileClientHeadPathWithServer(
              localSnakePathRef.current,
              serverTick,
              head,
              [],
              bodyLength
            )
          }
        }
      } else {
        localSnakePathRef.current = null
        prevBodyLengthRef.current = 0
      }
    },
    [localSnakeId]
  )

  const reset = useCallback(() => {
    localSnakePathRef.current = null
    prevBodyLengthRef.current = 0
    lastSentAngleRef.current = 0
    lastSentBoostRef.current = false
  }, [])

  const updateLastSentInput = useCallback((angle: number, boost: boolean) => {
    lastSentAngleRef.current = angle
    lastSentBoostRef.current = boost
  }, [])

  // Getter-функции для чтения refs без триггера ре-рендера
  const getLastSentAngle = useCallback(() => lastSentAngleRef.current, [])
  const getLastSentBoost = useCallback(() => lastSentBoostRef.current, [])
  const getLocalSnakePath = useCallback(() => localSnakePathRef.current, [])

  return {
    getLastSentAngle,
    getLastSentBoost,
    getLocalSnakePath,
    updateFromSnapshot,
    reset,
    updateLastSentInput,
  }
}
