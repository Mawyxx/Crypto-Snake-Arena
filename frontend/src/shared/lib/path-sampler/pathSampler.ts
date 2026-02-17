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
