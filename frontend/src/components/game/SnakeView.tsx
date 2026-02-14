import React from 'react'
import { PixiComponent } from '@pixi/react'
import { Container, Graphics as PixiGraphics } from 'pixi.js'
import type { InterpolatedSnake } from '@/hooks/useGameEngine'

// Slither.io palette (first 9 colors)
const SNAKE_COLORS = [
  0xc080ff, 0x9099ff, 0x80d0d0, 0x80ff80, 0xeeee70, 0xffa060, 0xff9090, 0xff4040, 0xe030e0,
]

type SnakeId = number | { toNumber: () => number } | string | null | undefined

function getSnakeColor(snakeId: SnakeId): number {
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

/** Slither.io style: змейка полностью из кружков — body + head + глаза */
function drawSnakeAsCircles(
  g: PixiGraphics,
  snake: InterpolatedSnake,
  isLocalPlayer: boolean
) {
  g.clear()
  const body = snake.body ?? []
  const head = snake.head
  if (!head) return

  const color = isLocalPlayer ? 0xc080ff : getSnakeColor(snake.id)
  const segRadius = isLocalPlayer ? 5.5 : 5
  const headR = 9
  const hx = head.x ?? 0
  const hy = head.y ?? 0
  const angle = snake.angle ?? 0

  // Body: хвост → голова, каждый сегмент — круг (как в Slither.io)
  body.forEach((segment, index) => {
    const sx = segment?.x ?? 0
    const sy = segment?.y ?? 0
    const distFromHead = index
    const radius = segRadius * (distFromHead < 4 ? 1 + (4 - distFromHead) * 0.08 : 1)

    g.beginFill(0xffffff, isLocalPlayer ? 0.4 : 0.25)
    g.drawCircle(sx, sy, radius + 1.2)
    g.endFill()
    g.beginFill(color)
    g.drawCircle(sx, sy, radius)
    g.endFill()
  })

  // Голова — самый большой круг
  g.beginFill(0xffffff, isLocalPlayer ? 0.5 : 0.3)
  g.drawCircle(hx, hy, headR + 1.5)
  g.endFill()
  g.beginFill(color)
  g.drawCircle(hx, hy, headR)
  g.endFill()

  // Глаза только на голове
  const eyeDist = 5.5
  const eyeR = 2.8
  const pupilR = 1.3
  const leftEx = hx + Math.cos(angle - 0.45) * eyeDist
  const leftEy = hy + Math.sin(angle - 0.45) * eyeDist
  const rightEx = hx + Math.cos(angle + 0.45) * eyeDist
  const rightEy = hy + Math.sin(angle + 0.45) * eyeDist

  g.beginFill(0xffffff)
  g.drawCircle(leftEx, leftEy, eyeR)
  g.endFill()
  g.beginFill(0x000000)
  g.drawCircle(leftEx + Math.cos(angle) * 0.5, leftEy + Math.sin(angle) * 0.5, pupilR)
  g.endFill()
  g.beginFill(0xffffff, 0.9)
  g.drawCircle(leftEx - 0.7, leftEy - 0.7, 0.5)
  g.endFill()

  g.beginFill(0xffffff)
  g.drawCircle(rightEx, rightEy, eyeR)
  g.endFill()
  g.beginFill(0x000000)
  g.drawCircle(rightEx + Math.cos(angle) * 0.5, rightEy + Math.sin(angle) * 0.5, pupilR)
  g.endFill()
  g.beginFill(0xffffff, 0.9)
  g.drawCircle(rightEx - 0.7, rightEy - 0.7, 0.5)
  g.endFill()
}

const SnakeContainer = PixiComponent<SnakeViewProps, Container>('SnakeContainer', {
  create: () => {
    const container = new Container()
    const graphics = new PixiGraphics()
    container.addChild(graphics)
    ;(container as unknown as { __graphics: PixiGraphics }).__graphics = graphics
    return container
  },
  applyProps: (instance, _oldProps, newProps) => {
    const graphics = (instance as unknown as { __graphics: PixiGraphics }).__graphics
    drawSnakeAsCircles(graphics, newProps.snake, newProps.isLocalPlayer)
  },
})

function areSnakePropsEqual(prev: SnakeViewProps, next: SnakeViewProps): boolean {
  if (prev.isLocalPlayer !== next.isLocalPlayer) return false
  const prevSnake = prev.snake
  const nextSnake = next.snake
  if (Number(prevSnake?.id) !== Number(nextSnake?.id)) return false
  const prevHead = prevSnake?.head
  const nextHead = nextSnake?.head
  if (Math.round(prevHead?.x ?? 0) !== Math.round(nextHead?.x ?? 0)) return false
  if (Math.round(prevHead?.y ?? 0) !== Math.round(nextHead?.y ?? 0)) return false
  if (Math.round((prevSnake?.angle ?? 0) * 100) !== Math.round((nextSnake?.angle ?? 0) * 100)) return false
  if (Math.round((prevSnake?.score ?? 0) * 100) !== Math.round((nextSnake?.score ?? 0) * 100)) return false
  const prevBody = prevSnake?.body ?? []
  const nextBody = nextSnake?.body ?? []
  if (prevBody.length !== nextBody.length) return false
  if (prevBody.length > 0) {
    const prevFirst = prevBody[0]
    const nextFirst = nextBody[0]
    if (Math.round(prevFirst?.x ?? 0) !== Math.round(nextFirst?.x ?? 0)) return false
    if (Math.round(prevFirst?.y ?? 0) !== Math.round(nextFirst?.y ?? 0)) return false
    if (prevBody.length > 1) {
      const prevLast = prevBody[prevBody.length - 1]
      const nextLast = nextBody[nextBody.length - 1]
      if (Math.round(prevLast?.x ?? 0) !== Math.round(nextLast?.x ?? 0)) return false
      if (Math.round(prevLast?.y ?? 0) !== Math.round(nextLast?.y ?? 0)) return false
    }
  }
  return true
}

export const SnakeView = React.memo(
  ({ snake, isLocalPlayer }: SnakeViewProps) => (
    <SnakeContainer snake={snake} isLocalPlayer={isLocalPlayer} />
  ),
  areSnakePropsEqual
)
