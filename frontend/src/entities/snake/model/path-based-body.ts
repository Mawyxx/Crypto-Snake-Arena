/**
 * Path-based body interpolation — сегменты вдоль пути, не LERP body[i].
 */
import {
  buildPathFromBody,
  pointAtDistance,
  type Point,
} from '@/shared/lib/path-sampler'
import { interpolatePosition } from '@/shared/lib/interpolation'
import { PREFERRED_DIST } from '../types'

type PointLike = { x?: number | null; y?: number | null }

function toPoint(p: PointLike): Point {
  return { x: p?.x ?? 0, y: p?.y ?? 0 }
}

export function interpolateBodyAlongPath(
  prevHead: PointLike,
  prevBody: PointLike[],
  currHead: PointLike,
  currBody: PointLike[],
  alpha: number,
  preferredDist: number = PREFERRED_DIST
): Point[] {
  const pH = toPoint(prevHead)
  const pHb = prevBody.map(toPoint)
  const cH = toPoint(currHead)
  const cHb = currBody.map(toPoint)

  const prevPath = buildPathFromBody(pH, pHb.length > 0 ? pHb.slice(1) : [])
  const currPath = buildPathFromBody(cH, cHb.length > 0 ? cHb.slice(1) : [])

  const segmentCount = Math.max(
    prevBody.length > 0 ? prevBody.length : 1,
    currBody.length > 0 ? currBody.length : 1,
    1
  )

  if (prevPath.length < 2 && currPath.length < 2) {
    // Когда пути слишком короткие, возвращаем массив с одной интерполированной точкой
    return [interpolatePosition(pH, cH, alpha)]
  }

  const samples: Point[] = []
  for (let i = 0; i < segmentCount; i++) {
    const dist = preferredDist * i
    const prevPt = pointAtDistance(prevPath, dist)
    const currPt = pointAtDistance(currPath, dist)
    if (prevPt && currPt) {
      samples.push(interpolatePosition(prevPt, currPt, alpha))
    } else if (currPt) {
      samples.push(currPt)
    } else if (prevPt) {
      samples.push(prevPt)
    }
  }

  if (samples.length === 0) {
    const head = interpolatePosition(pH, cH, alpha)
    return [head]
  }

  return samples
}
