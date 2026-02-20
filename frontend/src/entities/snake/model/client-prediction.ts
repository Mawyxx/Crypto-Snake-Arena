/**
 * Client-side prediction с path-following вместо Verlet.
 * Синхронизировано с backend headPath логикой.
 */
import {
  sampleBodyAlongPath,
  samplePathCatmullRom,
  type Point,
} from '@/shared/lib/path-sampler'
import { PREFERRED_DIST, MAX_HEAD_PATH_LEN } from '../types'

const RECONCILE_DENSE_POINTS = 60

export interface ClientHeadPathState {
  headPath: Point[]
  tickHistory: number[] // tick для каждой точки в headPath (для reconciliation)
  snakeLength: number
  localTick: number // локальный счетчик тиков для updateClientHeadPath
}

type PointLike = { x?: number | null; y?: number | null }

function toPoint(p: PointLike): Point {
  return { x: p?.x ?? 0, y: p?.y ?? 0 }
}

export function initClientHeadPath(
  head: PointLike,
  body: PointLike[] | null | undefined,
  bodyLength?: number,
  initialTick?: number
): ClientHeadPathState {
  const h = toPoint(head)
  const path: Point[] = [h]
  const tickHistory: number[] = [initialTick ?? 0]
  let len = 1
  if (body && body.length > 1) {
    for (let i = 1; i < body.length; i++) {
      path.push(toPoint(body[i]))
      tickHistory.push(initialTick ?? 0)
    }
    len = body.length
  } else if (bodyLength != null && bodyLength > 1) {
    for (let i = 1; i < bodyLength; i++) {
      path.push({ x: h.x - i * PREFERRED_DIST, y: h.y })
      tickHistory.push(initialTick ?? 0)
    }
    len = bodyLength
  }
  const headPath =
    path.length >= 4 ? samplePathCatmullRom(path, RECONCILE_DENSE_POINTS) : path
  // Расширить tickHistory до размера headPath (после Catmull-Rom может быть больше точек)
  while (tickHistory.length < headPath.length) {
    tickHistory.push(initialTick ?? 0)
  }
  return { headPath, tickHistory, snakeLength: len, localTick: initialTick ?? 0 }
}

function lerp(a: number, b: number, alpha: number): number {
  return a + (b - a) * alpha
}

export function reconcileClientHeadPathWithServer(
  state: ClientHeadPathState,
  serverTick: number,
  serverHead: Point,
  serverBody: PointLike[],
  bodyLength: number
): void {
  if (serverBody.length === 0) return
  
  // Найти индекс точки с нужным tick
  const targetIdx = state.tickHistory.findIndex((t) => t === serverTick)
  if (targetIdx >= 0 && targetIdx < state.headPath.length) {
    const targetPoint = state.headPath[targetIdx]
    // Lerp текущей головы к targetPoint для плавности
    const alpha = 0.3 // или динамический на основе задержки
    state.headPath[0] = {
      x: lerp(state.headPath[0].x, targetPoint.x, alpha),
      y: lerp(state.headPath[0].y, targetPoint.y, alpha),
    }
    // Обновить tickHistory для головы
    state.tickHistory[0] = serverTick
  } else {
    // Fallback: заменить path как сейчас
    const serverPath: Point[] = [serverHead]
    for (let i = 1; i < serverBody.length; i++) {
      serverPath.push(toPoint(serverBody[i]))
    }
    state.headPath =
      serverPath.length >= 4
        ? samplePathCatmullRom(serverPath, RECONCILE_DENSE_POINTS)
        : serverPath
    // Обновить tickHistory
    state.tickHistory = new Array(state.headPath.length).fill(serverTick)
  }
  state.snakeLength = bodyLength
  if (state.headPath.length > MAX_HEAD_PATH_LEN) {
    state.headPath = state.headPath.slice(0, MAX_HEAD_PATH_LEN)
    state.tickHistory = state.tickHistory.slice(0, MAX_HEAD_PATH_LEN)
  }
}

export function updateClientHeadPath(
  state: ClientHeadPathState,
  predictedHead: Point,
  bodyLength: number
): void {
  state.localTick++
  state.headPath.unshift(predictedHead)
  state.tickHistory.unshift(state.localTick)
  if (state.headPath.length > MAX_HEAD_PATH_LEN) {
    state.headPath = state.headPath.slice(0, MAX_HEAD_PATH_LEN)
    state.tickHistory = state.tickHistory.slice(0, MAX_HEAD_PATH_LEN)
  }
  // Упростить логику роста - убрать сложную логику, просто использовать path напрямую
  state.snakeLength = bodyLength
}

export function getBodyFromClientPath(state: ClientHeadPathState): Point[] {
  return sampleBodyAlongPath(
    state.headPath,
    state.snakeLength,
    PREFERRED_DIST
  )
}
