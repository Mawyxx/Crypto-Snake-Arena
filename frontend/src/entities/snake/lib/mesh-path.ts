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

// Ближе к референсу: плотные точки тела с коротким шагом (segment distance vibe).
export const MESH_STEP_PX = 3
export const MIN_MESH_POINTS = 24

type PointLike = { x?: number | null; y?: number | null }

function toPoint(p: PointLike): Point {
  return { x: p?.x ?? 0, y: p?.y ?? 0 }
}

function distance(a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

function trimPathToLength(path: Point[], maxLen: number): Point[] {
  if (path.length === 0) return []
  if (path.length === 1 || maxLen <= 0) return [{ ...path[0] }]

  let acc = 0
  const out: Point[] = [{ ...path[0] }]

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const curr = path[i]
    const segLen = distance(prev, curr)
    const nextAcc = acc + segLen

    if (nextAcc <= maxLen) {
      out.push({ ...curr })
      acc = nextAcc
      continue
    }

    const remaining = maxLen - acc
    if (remaining > 0 && segLen > 1e-6) {
      const t = remaining / segLen
      out.push({
        x: prev.x + (curr.x - prev.x) * t,
        y: prev.y + (curr.y - prev.y) * t,
      })
    }
    break
  }

  return out
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

  // Ограничиваем path длиной змеи в мировых единицах.
  const maxDist = Math.max(0, (snakeLength - 1) * PREFERRED_DIST)
  const trimmed = trimPathToLength(headPath, maxDist)
  if (trimmed.length < 2) return trimmed.length > 0 ? trimmed : [{ ...headPath[0] }]

  // Для match с референсом всегда получаем равномерный плотный path (без дыр по расстоянию).
  const totalLen = getPathLength(trimmed)
  const targetPoints = Math.max(MIN_MESH_POINTS, Math.ceil(totalLen / MESH_STEP_PX) + 1)
  const out: Point[] = []
  for (let i = 0; i < targetPoints; i++) {
    const t = targetPoints > 1 ? i / (targetPoints - 1) : 0
    const pt = pointAtDistance(trimmed, totalLen * t)
    if (pt) out.push(pt)
  }
  return out.length > 0 ? out : trimmed
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
  const bodyPoints = body.map(toPoint)
  const hasDuplicateHead = bodyPoints.length > 0 && distance(h, bodyPoints[0]) < 0.001
  const sparsePath = buildPathFromBody(h, hasDuplicateHead ? bodyPoints.slice(1) : bodyPoints)

  // Для sparse body сначала сглаживаем кривую, затем делаем один ресемпл.
  if (sparsePath.length < SPARSE_BODY_THRESHOLD) {
    const sampleCount = Math.max(MIN_MESH_POINTS, sparsePath.length * 4)
    const smoothed = samplePathCatmullRom(sparsePath, sampleCount)
    return resamplePathDense(smoothed, MESH_STEP_PX, Math.max(MIN_MESH_POINTS, sparsePath.length))
  }

  // Для удалённых змей тоже принудительно выравниваем spacing до плотного шага.
  return resamplePathDense(sparsePath, MESH_STEP_PX, Math.max(MIN_MESH_POINTS, sparsePath.length * 2))
}
