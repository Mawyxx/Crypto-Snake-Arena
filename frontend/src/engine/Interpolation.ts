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

/** Константы с бэкенда: units/sec (Slither.io 1:1) */
export const BASE_SPEED = 71
export const BOOST_SPEED = 180

/**
 * Экстраполяция головы вперёд по направлению (для client-side prediction).
 * @param head текущая позиция головы
 * @param angle угол направления (рад)
 * @param boost режим ускорения
 * @param dtSec время экстраполяции в секундах (напр. 0.05–0.1)
 */
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
