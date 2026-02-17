/**
 * Path sampler — семплирование точек вдоль пути head→body для плавных сегментов.
 */

export interface Point {
  x: number
  y: number
}

export function buildPathFromBody(
  head: Point,
  body: Point[]
): Point[] {
  const path: Point[] = [{ x: head.x ?? 0, y: head.y ?? 0 }]
  for (let i = 0; i < body.length; i++) {
    const p = body[i]
    if (p != null) {
      path.push({ x: p.x ?? 0, y: p.y ?? 0 })
    }
  }
  return path
}

export function getPathLength(path: Point[]): number {
  if (path.length < 2) return 0
  let total = 0
  for (let i = 0; i < path.length - 1; i++) {
    const p0 = path[i]
    const p1 = path[i + 1]
    const dx = p1.x - p0.x
    const dy = p1.y - p0.y
    total += Math.sqrt(dx * dx + dy * dy)
  }
  return total
}

export function pointAtDistance(path: Point[], distFromHead: number): Point | null {
  if (path.length < 2) return path[0] ?? null
  let accumulated = 0
  for (let i = 0; i < path.length - 1; i++) {
    const p0 = path[i]
    const p1 = path[i + 1]
    const dx = p1.x - p0.x
    const dy = p1.y - p0.y
    const segLen = Math.sqrt(dx * dx + dy * dy)
    if (accumulated + segLen >= distFromHead) {
      const t = segLen > 1e-9 ? (distFromHead - accumulated) / segLen : 0
      const clamped = Math.max(0, Math.min(1, t))
      return {
        x: p0.x + dx * clamped,
        y: p0.y + dy * clamped,
      }
    }
    accumulated += segLen
  }
  return path[path.length - 1]
}

export function sampleBodyAlongPath(
  path: Point[],
  segmentCount: number,
  preferredDist: number
): Point[] {
  const body: Point[] = []
  for (let i = 0; i < segmentCount; i++) {
    const dist = preferredDist * i
    const pt = pointAtDistance(path, dist)
    if (pt == null) break
    body.push(pt)
  }
  if (body.length === 0 && path.length > 0) {
    body.push(path[0])
  }
  return body
}

/**
 * Dense resampling for mesh (SimpleRope).
 * Guarantees minPoints; uses stepPx spacing when path is long enough.
 */
export function resamplePathDense(
  path: Point[],
  stepPx: number,
  minPoints: number
): Point[] {
  if (path.length === 0) return []
  if (path.length === 1) return [{ ...path[0] }]

  const totalLen = getPathLength(path)
  const targetCount =
    totalLen < 1e-6
      ? minPoints
      : Math.max(minPoints, Math.ceil(totalLen / stepPx) + 1)

  const result: Point[] = []
  for (let i = 0; i < targetCount; i++) {
    const t = targetCount > 1 ? i / (targetCount - 1) : 0
    const dist = t * totalLen
    const pt = pointAtDistance(path, dist)
    if (pt) result.push(pt)
  }
  return result.length > 0 ? result : [path[0]]
}

/**
 * Catmull-Rom spline for smooth curves through sparse points.
 * path.length < 4 falls back to resamplePathDense.
 */
export function samplePathCatmullRom(
  path: Point[],
  numSamples: number
): Point[] {
  if (path.length < 4) {
    return resamplePathDense(path, 8, Math.max(numSamples, 30))
  }

  const result: Point[] = []
  const n = path.length - 1

  for (let k = 0; k < numSamples; k++) {
    const t = numSamples > 1 ? (k / (numSamples - 1)) * n : 0
    const seg = Math.min(Math.floor(t), n - 1)
    const localT = t - seg

    const p0 = path[Math.max(0, seg - 1)]
    const p1 = path[seg]
    const p2 = path[seg + 1]
    const p3 = path[Math.min(seg + 2, path.length - 1)]

    const t2 = localT * localT
    const t3 = t2 * localT
    result.push({
      x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * localT + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * localT + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    })
  }
  return result
}
