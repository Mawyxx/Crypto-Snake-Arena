/**
 * Interpolation — LERP между тиками сервера для плавного движения.
 */

export interface Point {
  x: number
  y: number
}

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
}

export const interpolatePosition = (oldPos: Point, newPos: Point, alpha: number): Point => ({
  x: lerp(oldPos.x, newPos.x, alpha),
  y: lerp(oldPos.y, newPos.y, alpha),
})

export const BASE_SPEED = 71
export const BOOST_SPEED = 180

export const extrapolateHead = (
  head: Point,
  angle: number,
  boost: boolean,
  dtSec: number
): Point => {
  const speed = boost ? BOOST_SPEED : BASE_SPEED
  const dist = speed * dtSec
  return {
    x: head.x + Math.cos(angle) * dist,
    y: head.y + Math.sin(angle) * dist,
  }
}

export const interpolateAngle = (oldAngle: number, newAngle: number, alpha: number): number => {
  let diff = newAngle - oldAngle
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return oldAngle + diff * alpha
}
