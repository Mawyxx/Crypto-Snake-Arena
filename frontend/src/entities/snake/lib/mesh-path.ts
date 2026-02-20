/**
 * Dense mesh path for SimpleRope — устраняет угловатость змеи.
 * Slither-clone: preferredDistance ~10px; мы используем 8px.
 */
import {
  buildPathFromBody,
  getPathLength,
  pointAtDistance,
  resamplePathDense,
  samplePathCatmullRom,
  type Point,
} from '@/shared/lib/path-sampler'
import { PREFERRED_DIST } from '../types'

export const MESH_STEP_PX = 4
export const MIN_MESH_POINTS = 100

type PointLike = { x?: number | null; y?: number | null }

function toPoint(p: PointLike): Point {
  return { x: p?.x ?? 0, y: p?.y ?? 0 }
}

/**
 * Dense mesh path from client headPath (local snake only).
 * Для локальной змейки headPath уже dense после reconcile, используем напрямую.
 */
export function buildMeshPathFromHeadPath(
  headPath: Point[],
  snakeLength: number
): Point[] {
  if (headPath.length === 0) return []
  if (headPath.length === 1 || snakeLength <= 1) return [{ ...headPath[0] }]

  // Для локальной змейки headPath уже dense после reconcile, используем напрямую
  // Ограничиваем длину до snakeLength сегментов
  const maxDist = Math.max(0, (snakeLength - 1) * PREFERRED_DIST)
  const pathLen = getPathLength(headPath)
  const targetLen = Math.min(pathLen, maxDist)

  // Если path достаточно dense, используем напрямую
  if (headPath.length >= MIN_MESH_POINTS) {
    // Обрезаем path до targetLen
    let accumulated = 0
    const result: Point[] = [headPath[0]]
    for (let i = 1; i < headPath.length; i++) {
      const dist = Math.sqrt(
        Math.pow(headPath[i].x - headPath[i - 1].x, 2) +
        Math.pow(headPath[i].y - headPath[i - 1].y, 2)
      )
      accumulated += dist
      if (accumulated <= targetLen) {
        result.push(headPath[i])
      } else {
        // Интерполируем последнюю точку
        const t = (targetLen - (accumulated - dist)) / dist
        result.push({
          x: headPath[i - 1].x + (headPath[i].x - headPath[i - 1].x) * t,
          y: headPath[i - 1].y + (headPath[i].y - headPath[i - 1].y) * t,
        })
        break
      }
    }
    return result.length > 0 ? result : [{ ...headPath[0] }]
  }

  // Fallback: если path sparse, делаем resample
  const stepPx = MESH_STEP_PX
  const targetCount = Math.max(MIN_MESH_POINTS, Math.ceil(targetLen / stepPx) + 1)
  const result: Point[] = []
  for (let i = 0; i < targetCount; i++) {
    const t = targetCount > 1 ? i / (targetCount - 1) : 0
    const dist = t * targetLen
    const pt = pointAtDistance(headPath, dist)
    if (pt) result.push(pt)
  }
  return result.length > 0 ? result : [{ ...headPath[0] }]
}

const SPARSE_BODY_THRESHOLD = 25

/**
 * Builds a dense path for SimpleRope from sparse head + body (remote snakes only).
 * For sparse body (length < 15) uses Catmull-Rom smoothing before resample.
 * Для dense body использует path напрямую.
 */
export function buildMeshPathFromBody(
  head: PointLike,
  body: PointLike[],
  _options?: { useCatmullRom?: boolean }
): Point[] {
  const h = toPoint(head)
  const tail = body.length > 1 ? body.slice(1).map(toPoint) : []
  const sparsePath = buildPathFromBody(h, tail)

  // Для sparse body используем Catmull-Rom, иначе path как есть
  if (sparsePath.length < SPARSE_BODY_THRESHOLD) {
    const smoothed = samplePathCatmullRom(sparsePath, MIN_MESH_POINTS)
    return resamplePathDense(smoothed, MESH_STEP_PX, MIN_MESH_POINTS)
  }
  // Для dense body используем path напрямую (уже достаточно точек)
  return resamplePathDense(sparsePath, MESH_STEP_PX, MIN_MESH_POINTS)
}
