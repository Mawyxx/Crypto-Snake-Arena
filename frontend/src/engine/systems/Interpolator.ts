/**
 * Interpolator — LERP между тиками сервера для плавного движения.
 * Клиент обязан интерполировать между server ticks (20 Hz).
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export interface InterpolatedState {
  headX: number
  headY: number
  tailSegments: number[]
}

/**
 * Интерполяция между предыдущим и текущим состоянием.
 * t — прогресс до следующего тика (0..1).
 */
export function interpolateSnake(
  prev: InterpolatedState,
  next: InterpolatedState,
  t: number
): InterpolatedState {
  return {
    headX: lerp(prev.headX, next.headX, t),
    headY: lerp(prev.headY, next.headY, t),
    tailSegments: prev.tailSegments.map((v, i) =>
      lerp(v, next.tailSegments[i] ?? v, t)
    ),
  }
}
