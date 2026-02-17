/**
 * Client-side prediction с path-following вместо Verlet.
 * Синхронизировано с backend headPath логикой.
 */
import { sampleBodyAlongPath, type Point } from '@/shared/lib/path-sampler'
import { PREFERRED_DIST, MAX_HEAD_PATH_LEN } from '../types'

export interface ClientHeadPathState {
  headPath: Point[]
  snakeLength: number
}

type PointLike = { x?: number | null; y?: number | null }

function toPoint(p: PointLike): Point {
  return { x: p?.x ?? 0, y: p?.y ?? 0 }
}

export function initClientHeadPath(
  head: PointLike,
  body: PointLike[] | null | undefined,
  bodyLength?: number
): ClientHeadPathState {
  const h = toPoint(head)
  const path: Point[] = [h]
  let len = 1
  if (body && body.length > 1) {
    for (let i = 1; i < body.length; i++) {
      path.push(toPoint(body[i]))
    }
    len = body.length
  } else if (bodyLength != null && bodyLength > 1) {
    for (let i = 1; i < bodyLength; i++) {
      path.push({ x: h.x - i * PREFERRED_DIST, y: h.y })
    }
    len = bodyLength
  }
  return { headPath: path, snakeLength: len }
}

export function reconcileClientHeadPathWithServer(
  state: ClientHeadPathState,
  predictedHead: Point,
  serverBody: PointLike[],
  bodyLength: number
): void {
  if (serverBody.length === 0) return
  const serverPath = [predictedHead]
  for (let i = 1; i < serverBody.length; i++) {
    serverPath.push(toPoint(serverBody[i]))
  }
  state.headPath = serverPath
  state.snakeLength = bodyLength
  if (state.headPath.length > MAX_HEAD_PATH_LEN) {
    state.headPath = state.headPath.slice(0, MAX_HEAD_PATH_LEN)
  }
}

export function updateClientHeadPath(
  state: ClientHeadPathState,
  predictedHead: Point,
  bodyLength: number
): void {
  state.headPath.unshift(predictedHead)
  if (state.headPath.length > MAX_HEAD_PATH_LEN) {
    state.headPath = state.headPath.slice(0, MAX_HEAD_PATH_LEN)
  }
  while (state.snakeLength < bodyLength && state.headPath.length >= 4) {
    const last = state.headPath[state.headPath.length - 1]
    const prev = state.headPath[state.headPath.length - 2]
    const dx = last.x - prev.x
    const dy = last.y - prev.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 1e-6) {
      const ratio = PREFERRED_DIST / dist
      state.headPath.push({
        x: last.x + dx * ratio,
        y: last.y + dy * ratio,
      })
    } else {
      state.headPath.push({ ...last })
    }
    state.snakeLength++
  }
  state.snakeLength = bodyLength
}

export function getBodyFromClientPath(state: ClientHeadPathState): Point[] {
  return sampleBodyAlongPath(
    state.headPath,
    state.snakeLength,
    PREFERRED_DIST
  )
}
