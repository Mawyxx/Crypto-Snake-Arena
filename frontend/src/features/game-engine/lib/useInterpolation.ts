import { useCallback } from 'react'
import {
  interpolatePosition,
  interpolateAngle,
  extrapolateHead,
} from '@/shared/lib/interpolation'
import { RingSnapshotBuffer } from '@/shared/lib/snapshot-buffer'
import { interpolateBodyAlongPath, updateClientHeadPath, buildMeshPathFromHeadPath } from '@/entities/snake'
import type { ClientHeadPathState } from '@/entities/snake'
import type { game } from '@/shared/api/proto/game'
import type { InterpolatedSnake, InterpolatedWorldSnapshot } from '../types'

const INTERPOLATION_DELAY_MS = 100

export interface UseInterpolationOptions {
  snapshotBuffer: RingSnapshotBuffer
  localSnakeId?: number | null
  getLastSentAngle: () => number
  getLastSentBoost: () => boolean
  getLocalSnakePath: () => ClientHeadPathState | null
}

export interface UseInterpolationReturn {
  getInterpolatedState: () => InterpolatedWorldSnapshot | null
}

export const useInterpolation = (
  options: UseInterpolationOptions
): UseInterpolationReturn => {
  const {
    snapshotBuffer,
    localSnakeId,
    getLastSentAngle,
    getLastSentBoost,
    getLocalSnakePath,
  } = options

  const getInterpolatedState = useCallback((): InterpolatedWorldSnapshot | null => {
    // Вызываем геттеры каждый кадр для получения свежих значений
    const lastSentAngle = getLastSentAngle()
    const lastSentBoost = getLastSentBoost()
    const localSnakePath = getLocalSnakePath()
    const buffer = snapshotBuffer
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
        ? lastSentAngle
        : interpolateAngle(
            prevSnake?.angle ?? 0,
            snake.angle ?? 0,
            alpha
          )
      const displayHead = isLocal
        ? extrapolateHead(
            interpolatedHead,
            displayAngle,
            lastSentBoost,
            extrapolationSec
          )
        : interpolatedHead

      let displayBody: { x: number; y: number }[]

      if (isLocal && localSnakePath) {
        const bodyLength = (snake.bodyLength ?? currBody.length) as number
        if (bodyLength > 0) {
          // updateClientHeadPath мутирует объект, поэтому работаем с ним напрямую
          updateClientHeadPath(
            localSnakePath,
            displayHead,
            bodyLength
          )
          displayBody = buildMeshPathFromHeadPath(
            localSnakePath.headPath,
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
        boost: isLocal ? lastSentBoost : false,
      } as InterpolatedSnake
    })

    return {
      tick: currFrame.tick,
      timestamp: currFrame.timestamp,
      snakes: interpolatedSnakes,
      coins: currFrame.coins,
    } as InterpolatedWorldSnapshot
  }, [snapshotBuffer, localSnakeId, getLastSentAngle, getLastSentBoost, getLocalSnakePath])

  return {
    getInterpolatedState,
  }
}
