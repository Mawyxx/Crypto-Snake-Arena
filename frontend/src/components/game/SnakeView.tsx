import React from 'react'
import { PixiComponent } from '@pixi/react'
import {
  Container,
  Graphics as PixiGraphics,
  SimpleRope,
  Texture,
  Point,
} from 'pixi.js'
import type { InterpolatedSnake } from '@/hooks/useGameEngine'

// Rope texture: vertical gradient for smooth body (height = rope thickness)
function createRopeTexture(): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 24
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 24)
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.85)')
    gradient.addColorStop(1, 'rgba(255,255,255,0.7)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 8, 24)
  }
  return Texture.from(canvas)
}

const ROPE_TEXTURE = createRopeTexture()

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

interface SnakeContainerData {
  rope: SimpleRope
  graphics: PixiGraphics
  points: Point[]
}

function drawHeadAndEyes(
  g: PixiGraphics,
  snake: InterpolatedSnake,
  isLocalPlayer: boolean,
  skipClear = false
) {
  if (!skipClear) g.clear()
  if (!snake.head) return

  const color = isLocalPlayer ? 0xc080ff : getSnakeColor(snake.id)
  const headColor = isLocalPlayer ? 0xc080ff : color
  const hx = snake.head.x ?? 0
  const hy = snake.head.y ?? 0
  const angle = snake.angle ?? 0
  const headR = 8

  // Head outline
  g.beginFill(0xffffff, isLocalPlayer ? 0.9 : 0.5)
  g.drawCircle(hx, hy, headR + 1.5)
  g.endFill()
  g.beginFill(headColor)
  g.drawCircle(hx, hy, headR)
  g.endFill()

  // Eyes
  const eyeDist = 5
  const eyeR = 2.5
  const pupilR = 1.2
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
  g.drawCircle(leftEx - 0.6, leftEy - 0.6, 0.4)
  g.endFill()

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

/** Fallback: draw body as circles + head when body.length < 2 */
function drawBodyAndHeadFallback(
  g: PixiGraphics,
  snake: InterpolatedSnake,
  isLocalPlayer: boolean
) {
  g.clear()
  const body = snake.body ?? []
  const color = isLocalPlayer ? 0xc080ff : getSnakeColor(snake.id)
  const segRadius = isLocalPlayer ? 5 : 4.5

  g.lineStyle(0)
  for (let i = 0; i < body.length; i++) {
    const p = body[i]
    const px = p?.x ?? 0
    const py = p?.y ?? 0
    const swell = i < 4 ? 1 + (4 - i) * 0.08 : 1
    const r = segRadius * swell
    g.beginFill(color)
    g.drawCircle(px, py, r)
    g.endFill()
  }
  drawHeadAndEyes(g, snake, isLocalPlayer, true)
}

const SnakeContainer = PixiComponent<SnakeViewProps, Container>('SnakeContainer', {
  create: () => {
    const container = new Container()
    const points = [new Point(0, 0), new Point(0, 0)]
    const rope = new SimpleRope(ROPE_TEXTURE, points, 0.5)
    rope.visible = false
    const graphics = new PixiGraphics()
    container.addChild(rope)
    container.addChild(graphics)
    ;(container as unknown as { __snakeData: SnakeContainerData }).__snakeData = {
      rope,
      graphics,
      points,
    }
    return container
  },
  applyProps: (instance, _oldProps, newProps) => {
    const data = (instance as unknown as { __snakeData: SnakeContainerData }).__snakeData
    const { rope, graphics } = data
    const snake = newProps.snake
    const body = snake.body ?? []
    const head = snake.head

    if (!head) return

    const color = newProps.isLocalPlayer ? 0xc080ff : getSnakeColor(snake.id)
    rope.tint = color

    if (body.length >= 2) {
      // SimpleRope: points = [head, ...body]
      const neededPoints = 1 + body.length
      if (data.points.length !== neededPoints) {
        instance.removeChild(rope)
        rope.destroy()
        const newPoints: Point[] = []
        newPoints.push(new Point(head.x ?? 0, head.y ?? 0))
        for (let i = 0; i < body.length; i++) {
          newPoints.push(new Point(body[i]?.x ?? 0, body[i]?.y ?? 0))
        }
        data.points = newPoints
        const newRope = new SimpleRope(ROPE_TEXTURE, newPoints, 0.5)
        newRope.tint = color
        newRope.visible = true
        data.rope = newRope
        instance.addChildAt(newRope, 0)
      } else {
        data.points[0].x = head.x ?? 0
        data.points[0].y = head.y ?? 0
        for (let i = 0; i < body.length; i++) {
          data.points[i + 1].x = body[i]?.x ?? 0
          data.points[i + 1].y = body[i]?.y ?? 0
        }
        rope.visible = true
      }
      drawHeadAndEyes(graphics, snake, newProps.isLocalPlayer)
    } else {
      rope.visible = false
      drawBodyAndHeadFallback(graphics, snake, newProps.isLocalPlayer)
    }
  },
})

function areSnakePropsEqual(prev: SnakeViewProps, next: SnakeViewProps): boolean {
  if (prev.isLocalPlayer !== next.isLocalPlayer) return false
  const a = prev.snake
  const b = next.snake
  if (Number(a?.id) !== Number(b?.id)) return false
  const ah = a?.head
  const bh = b?.head
  if (Math.round(ah?.x ?? 0) !== Math.round(bh?.x ?? 0)) return false
  if (Math.round(ah?.y ?? 0) !== Math.round(bh?.y ?? 0)) return false
  if (Math.round((a?.angle ?? 0) * 100) !== Math.round((b?.angle ?? 0) * 100)) return false
  if (Math.round((a?.score ?? 0) * 100) !== Math.round((b?.score ?? 0) * 100)) return false
  const ab = a?.body ?? []
  const bb = b?.body ?? []
  if (ab.length !== bb.length) return false
  // Compare first and last body point for rope/position updates
  if (ab.length > 0) {
    const af = ab[0]
    const bf = bb[0]
    if (Math.round(af?.x ?? 0) !== Math.round(bf?.x ?? 0)) return false
    if (Math.round(af?.y ?? 0) !== Math.round(bf?.y ?? 0)) return false
    if (ab.length > 1) {
      const al = ab[ab.length - 1]
      const bl = bb[bb.length - 1]
      if (Math.round(al?.x ?? 0) !== Math.round(bl?.x ?? 0)) return false
      if (Math.round(al?.y ?? 0) !== Math.round(bl?.y ?? 0)) return false
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
