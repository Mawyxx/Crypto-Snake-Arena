/**
 * Interpolation — LERP между тиками сервера для плавного движения.
 * Клиент обязан интерполировать между server ticks (20 Hz).
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Линейная интерполяция (LERP)
 * @param start начальное значение
 * @param end целевое значение
 * @param t фактор времени (0.0 - 1.0)
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * Плавно вычисляет позицию между двумя кадрами сервера
 */
export const interpolatePosition = (
  oldPos: Point,
  newPos: Point,
  alpha: number
): Point => {
  return {
    x: lerp(oldPos.x, newPos.x, alpha),
    y: lerp(oldPos.y, newPos.y, alpha),
  };
};

/**
 * Интерполяция угла (чтобы змейка не крутилась на 360° при переходе через 0)
 */
export const interpolateAngle = (
  oldAngle: number,
  newAngle: number,
  alpha: number
): number => {
  let diff = newAngle - oldAngle;
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return oldAngle + diff * alpha;
};
