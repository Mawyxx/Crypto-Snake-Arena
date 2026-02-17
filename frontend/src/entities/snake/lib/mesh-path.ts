/**
 * Dense mesh path for SimpleRope — устраняет угловатость змеи.
 * Slither-clone: preferredDistance ~10px; мы используем 8px.
 */
import {
  buildPathFromBody,
  resamplePathDense,
  type Point,
} from '@/shared/lib/path-sampler'

export const MESH_STEP_PX = 8
export const MIN_MESH_POINTS = 30

type PointLike = { x?: number | null; y?: number | null }

function toPoint(p: PointLike): Point {
  return { x: p?.x ?? 0, y: p?.y ?? 0 }
}

/**
 * Builds a dense path for SimpleRope from sparse head + body.
 */
export function buildMeshPathFromBody(
  head: PointLike,
  body: PointLike[],
  _options?: { useCatmullRom?: boolean }
): Point[] {
  const h = toPoint(head)
  const tail = body.length > 1 ? body.slice(1).map(toPoint) : []
  const sparsePath = buildPathFromBody(h, tail)
  return resamplePathDense(sparsePath, MESH_STEP_PX, MIN_MESH_POINTS)
}
