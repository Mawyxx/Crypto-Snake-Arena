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

export const MESH_STEP_PX = 8
export const MIN_MESH_POINTS = 30

type PointLike = { x?: number | null; y?: number | null }

function toPoint(p: PointLike): Point {
  return { x: p?.x ?? 0, y: p?.y ?? 0 }
}

/**
 * Dense mesh path from client headPath (local snake only).
 */
export function buildMeshPathFromHeadPath(
  headPath: Point[],
  snakeLength: number
): Point[] {
  if (headPath.length === 0) return []
  if (headPath.length === 1 || snakeLength <= 1) return [{ ...headPath[0] }]

  const maxDist = Math.max(0, (snakeLength - 1) * PREFERRED_DIST)
  const pathLen = getPathLength(headPath)
  const targetLen = Math.min(pathLen, maxDist)

  const stepPx = MESH_STEP_PX
  const minPoints = MIN_MESH_POINTS
  const targetCount = Math.max(minPoints, Math.ceil(targetLen / stepPx) + 1)

  const result: Point[] = []
  for (let i = 0; i < targetCount; i++) {
    const t = targetCount > 1 ? i / (targetCount - 1) : 0
    const dist = t * targetLen
    const pt = pointAtDistance(headPath, dist)
    if (pt) result.push(pt)
  }
  return result.length > 0 ? result : [{ ...headPath[0] }]
}

const SPARSE_BODY_THRESHOLD = 15

/**
 * Builds a dense path for SimpleRope from sparse head + body.
 * For sparse body (length < 15) uses Catmull-Rom smoothing before resample.
 */
export function buildMeshPathFromBody(
  head: PointLike,
  body: PointLike[],
  _options?: { useCatmullRom?: boolean }
): Point[] {
  const h = toPoint(head)
  const tail = body.length > 1 ? body.slice(1).map(toPoint) : []
  const sparsePath = buildPathFromBody(h, tail)

  if (sparsePath.length < SPARSE_BODY_THRESHOLD) {
    const smoothed = samplePathCatmullRom(sparsePath, MIN_MESH_POINTS)
    return resamplePathDense(smoothed, MESH_STEP_PX, MIN_MESH_POINTS)
  }
  return resamplePathDense(sparsePath, MESH_STEP_PX, MIN_MESH_POINTS)
}
