/**
 * @deprecated Replaced by entities/snake client-prediction (path-following).
 * snakeBodyReconstruction — клиентская Verlet-симуляция хвоста для своей змеи.
 */

export interface Point {
  x: number
  y: number
}

const SEGMENT_LEN = 42.0 // Slither.io default_msl
const CONSTRAINT_PASSES = 6
const MIN_DIST = 1e-6
const MAX_STRETCH_RATIO = 1.5
const CST = 0.43 // Slither.io recalcSepMults, сглаживание тела

/** Локальное состояние змеи для reconstruction */
export interface LocalSnakeState {
  headX: number
  headY: number
  tail: number[] // [x1,y1, x2,y2, ...]
}

/**
 * Инициализирует состояние из полного body с сервера (первый snapshot).
 * Если body пустой — создаёт хвост по линии (angle=0, влево от головы).
 */
export function initFromServerBody(
  head: Point,
  body: Point[] | null | undefined,
  bodyLength?: number
): LocalSnakeState {
  const tail: number[] = []
  const hx = head?.x ?? 0
  const hy = head?.y ?? 0
  if (body && body.length > 1) {
    for (let i = 1; i < body.length; i++) {
      const point = body[i]
      tail.push(point?.x ?? 0, point?.y ?? 0)
    }
  } else if (bodyLength != null && bodyLength > 1) {
    for (let i = 1; i < bodyLength; i++) {
      tail.push(hx - i * SEGMENT_LEN, hy)
    }
  }
  return {
    headX: hx,
    headY: hy,
    tail,
  }
}

/**
 * Smus-проход (Slither.io): сглаживание от 3-го сегмента с конца к хвосту.
 * Синхронно с backend applySmusSmoothing.
 */
function applySmusSmoothing(state: LocalSnakeState): void {
  const segCount = state.tail.length / 2
  const k = segCount - 3
  if (k < 1) return
  let lmpoX = state.tail[2 * k]
  let lmpoY = state.tail[2 * k + 1]
  for (let i = k - 1; i >= 0; i--) {
    let n = k - i
    if (n > 4) n = 4
    const mv = (CST * n) / 4
    const cx = state.tail[2 * i]
    const cy = state.tail[2 * i + 1]
    state.tail[2 * i] += (lmpoX - cx) * mv
    state.tail[2 * i + 1] += (lmpoY - cy) * mv
    lmpoX = state.tail[2 * i]
    lmpoY = state.tail[2 * i + 1]
  }
}

/**
 * Обновляет хвост по Verlet (Distance Constraint). Синхронно с backend updateTail.
 */
function updateTail(state: LocalSnakeState): void {
  let prevX = state.headX
  let prevY = state.headY
  for (let i = 0; i < state.tail.length; i += 2) {
    const cx = state.tail[i]
    const cy = state.tail[i + 1]
    const dx = prevX - cx
    const dy = prevY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < MIN_DIST) {
      prevX = cx
      prevY = cy
      continue
    }
    let ratio = SEGMENT_LEN / dist
    if (ratio > MAX_STRETCH_RATIO) {
      ratio = MAX_STRETCH_RATIO
    }
    state.tail[i] = prevX - dx * ratio
    state.tail[i + 1] = prevY - dy * ratio
    prevX = state.tail[i]
    prevY = state.tail[i + 1]
  }
}

/**
 * Добавляет сегмент в хвост (при Grow).
 */
function growTail(state: LocalSnakeState): void {
  if (state.tail.length < 4) return
  const lastX = state.tail[state.tail.length - 2]
  const lastY = state.tail[state.tail.length - 1]
  const prevX = state.tail[state.tail.length - 4]
  const prevY = state.tail[state.tail.length - 3]
  const dx = lastX - prevX
  const dy = lastY - prevY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > MIN_DIST) {
    const ratio = SEGMENT_LEN / dist
    state.tail.push(lastX + dx * ratio, lastY + dy * ratio)
  } else {
    state.tail.push(lastX, lastY)
  }
}

/**
 * Обновляет локальное состояние: head + angle от сервера, Verlet для хвоста.
 * Если body_length > текущей длины — добавляет сегменты (Grow).
 */
export function updateLocalSnake(
  state: LocalSnakeState,
  head: Point,
  bodyLength: number
): void {
  state.headX = head?.x ?? 0
  state.headY = head?.y ?? 0

  while (1 + state.tail.length / 2 < bodyLength) {
    growTail(state)
  }

  for (let pass = 0; pass < CONSTRAINT_PASSES; pass++) {
    updateTail(state)
  }
  applySmusSmoothing(state)
}

/**
 * Возвращает body для рендера: [head, ...tail segments].
 */
export function getBodyForRender(state: LocalSnakeState): Point[] {
  const body: Point[] = [{ x: state.headX, y: state.headY }]
  for (let i = 0; i < state.tail.length; i += 2) {
    body.push({ x: state.tail[i], y: state.tail[i + 1] })
  }
  return body
}
