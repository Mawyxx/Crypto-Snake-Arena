import { PixiComponent } from '@pixi/react'
import { Graphics as PixiGraphics } from '@pixi/graphics'
import type { InterpolatedSnake } from '@/hooks/useGameEngine'

// Точная палитра slither.io из game.js (rrs, ggs, bbs — первые 9 цветов)
const SNAKE_COLORS = [
  0xc080ff, 0x9099ff, 0x80d0d0, 0x80ff80, 0xeeee70, 0xffa060, 0xff9090, 0xff4040, 0xe030e0,
]

function getSnakeColor(snakeId: unknown): number {
  if (snakeId == null) return 0x00ffff
  const id = typeof snakeId === 'object' && snakeId !== null && 'toNumber' in snakeId
    ? (snakeId as { toNumber: () => number }).toNumber()
    : typeof snakeId === 'string'
      ? parseInt(snakeId, 10) || 0
      : Number(snakeId)
  return SNAKE_COLORS[Math.abs(id) % SNAKE_COLORS.length]
}

interface SnakeViewProps {
  snake: InterpolatedSnake
  isLocalPlayer: boolean
}

/** Slither.io style: змея из кружков (сегментов), голова и глаза — тоже кружки */
function drawSnake(g: PixiGraphics, snake: InterpolatedSnake, isLocalPlayer: boolean) {
  g.clear()

  const body = snake.body ?? []
  if (body.length === 0 && !snake.head) return

  const color = isLocalPlayer ? 0xc080ff : getSnakeColor(snake.id)
  const headColor = isLocalPlayer ? 0xc080ff : color
  const segRadius = isLocalPlayer ? 5 : 4.5 // радиус кружка сегмента

  g.lineStyle(0)

  // Тело — цепочка кружков как в slither.io
  for (let i = 0; i < body.length; i++) {
    const p = body[i]
    const px = p?.x ?? 0
    const py = p?.y ?? 0
    // Первые 4 сегмента (у головы) — чуть крупнее, как в slither
    const swell = i < 4 ? 1 + (4 - i) * 0.08 : 1
    const r = segRadius * swell
    g.beginFill(color)
    g.drawCircle(px, py, r)
    g.endFill()
  }

  // Голова — крупный кружок с обводкой
  if (snake.head) {
    const hx = snake.head.x ?? 0
    const hy = snake.head.y ?? 0
    const angle = snake.angle ?? 0
    const headR = 8

    // Обводка головы
    g.beginFill(0xffffff, isLocalPlayer ? 0.9 : 0.5)
    g.drawCircle(hx, hy, headR + 1.5)
    g.endFill()
    g.beginFill(headColor)
    g.drawCircle(hx, hy, headR)
    g.endFill()

    // Глаза — кружки (белок + зрачок + блик)
    const eyeDist = 5
    const eyeR = 2.5
    const pupilR = 1.2
    const leftEx = hx + Math.cos(angle - 0.45) * eyeDist
    const leftEy = hy + Math.sin(angle - 0.45) * eyeDist
    const rightEx = hx + Math.cos(angle + 0.45) * eyeDist
    const rightEy = hy + Math.sin(angle + 0.45) * eyeDist

    // Левый глаз: белок
    g.beginFill(0xffffff)
    g.drawCircle(leftEx, leftEy, eyeR)
    g.endFill()
    // Зрачок
    g.beginFill(0x000000)
    g.drawCircle(leftEx + Math.cos(angle) * 0.5, leftEy + Math.sin(angle) * 0.5, pupilR)
    g.endFill()
    // Блик
    g.beginFill(0xffffff, 0.9)
    g.drawCircle(leftEx - 0.6, leftEy - 0.6, 0.4)
    g.endFill()

    // Правый глаз
    g.beginFill(0xffffff)
    g.drawCircle(rightEx, rightEy, eyeR)
    g.endFill()
    g.beginFill(0x000000)
    g.drawCircle(rightEx + Math.cos(angle) * 0.5, rightEy + Math.sin(angle) * 0.5, pupilR)
    g.endFill()
    g.beginFill(0xffffff, 0.9)
    g.drawCircle(rightEx - 0.6, rightEy - 0.6, 0.4)
    g.endFill()
  }
}

const SnakeGraphics = PixiComponent<SnakeViewProps, PixiGraphics>('SnakeGraphics', {
  create: () => new PixiGraphics(),
  applyProps: (instance, _oldProps, newProps) => {
    drawSnake(instance, newProps.snake, newProps.isLocalPlayer)
  },
})

export const SnakeView = ({ snake, isLocalPlayer }: SnakeViewProps) => (
  <SnakeGraphics snake={snake} isLocalPlayer={isLocalPlayer} />
)
