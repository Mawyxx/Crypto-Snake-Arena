import React from 'react'
import { PixiComponent } from '@pixi/react'
import { Container, Graphics as PixiGraphics, BLEND_MODES } from 'pixi.js'
import type { InterpolatedSnake } from '@/hooks/useGameEngine'

// slither.io-clone palette
const SNAKE_COLORS = [
  0xc080ff, 0x9099ff, 0x80d0d0, 0x80ff80, 0xeeee70, 0xffa060, 0xff9090, 0xff4040, 0xe030e0,
]

type SnakeId = number | { toNumber: () => number } | string | null | undefined

function getSnakeColor(snakeId: SnakeId): number {
  if (snakeId == null) return 0xc080ff
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

// slither.io-clone: preferredDistance = 17*scale = 10.2, SegmentLen 42 → 4 круга на сегмент
const CIRCLES_PER_SEGMENT = 4

// slither.io-clone: scale 0.6, sec.width*0.5 → radius ~19.2. Мир 2400, наш 2000 → radius 16
const CLONE_CIRCLE_RADIUS = 19.2 * (2000 / 2400) // ≈16

function expandBodyForRender(
  body: { x?: number | null; y?: number | null }[]
): { x: number; y: number }[] {
  if (body.length < 2) return body.map((p) => ({ x: p.x ?? 0, y: p.y ?? 0 }))
  const result: { x: number; y: number }[] = []
  for (let i = 0; i < body.length - 1; i++) {
    const p0 = { x: body[i].x ?? 0, y: body[i].y ?? 0 }
    const p1 = { x: body[i + 1].x ?? 0, y: body[i + 1].y ?? 0 }
    result.push(p0)
    for (let k = 1; k < CIRCLES_PER_SEGMENT; k++) {
      const t = k / CIRCLES_PER_SEGMENT
      result.push({
        x: p0.x + (p1.x - p0.x) * t,
        y: p0.y + (p1.y - p0.y) * t,
      })
    }
  }
  result.push({ x: body[body.length - 1].x ?? 0, y: body[body.length - 1].y ?? 0 })
  return result
}

/** slither.io-clone: плоские круги circle.png, shadow под каждым, глаза */
function drawSnakeAsCircles(
  g: PixiGraphics,
  glowG: PixiGraphics,
  shadowG: PixiGraphics,
  snake: InterpolatedSnake,
  isLocalPlayer: boolean
) {
  g.clear()
  glowG.clear()
  shadowG.clear()
  const rawBody = snake.body ?? []
  const head = snake.head
  if (!head) return

  const body = expandBodyForRender(rawBody)
  const color = isLocalPlayer ? 0xc080ff : getSnakeColor(snake.id)
  const boost = snake.boost ?? false

  // clone: scale 0.6, radius ~16. Голова и тело — одинаковый размер
  const segRadius = CLONE_CIRCLE_RADIUS
  const headR = segRadius

  const hx = head.x ?? 0
  const hy = head.y ?? 0
  const angle = snake.angle ?? 0

  // Shadow: clone darkTint 0xaaaaaa, под каждым кругом
  const shadowColor = 0xaaaaaa
  const shadowRadius = segRadius * 1.1
  body.forEach((segment) => {
    const sx = segment?.x ?? 0
    const sy = segment?.y ?? 0
    shadowG.beginFill(shadowColor, 0.5)
    shadowG.drawCircle(sx, sy + 2, shadowRadius)
    shadowG.endFill()
  })
  shadowG.beginFill(shadowColor, 0.5)
  shadowG.drawCircle(hx, hy + 2, headR * 1.1)
  shadowG.endFill()

  // Body: clone — плоские круги, без outline и объёма
  body.forEach((segment) => {
    const sx = segment?.x ?? 0
    const sy = segment?.y ?? 0
    g.beginFill(color)
    g.drawCircle(sx, sy, segRadius)
    g.endFill()
  })

  // Head
  g.beginFill(color)
  g.drawCircle(hx, hy, headR)
  g.endFill()

  // Boost glow (clone: shadow lightUp при space)
  if (boost) {
    const layers = [
      { r: 4, a: 0.18 },
      { r: 8, a: 0.1 },
      { r: 12, a: 0.05 },
    ]
    body.forEach((segment) => {
      const sx = segment?.x ?? 0
      const sy = segment?.y ?? 0
      for (const layer of layers) {
        glowG.beginFill(color, layer.a)
        glowG.drawCircle(sx, sy, segRadius + layer.r)
        glowG.endFill()
      }
    })
    for (const layer of layers) {
      glowG.beginFill(color, layer.a)
      glowG.drawCircle(hx, hy, headR + layer.r)
      glowG.endFill()
    }
  }

  // Eyes: clone eyePair — offset head.width*0.25, head.width*0.125
  const eyeOffsetX = headR * 0.5
  const eyeOffsetY = headR * 0.25
  const eyeR = headR * 0.2
  const pupilR = headR * 0.1
  const leftEx = hx - eyeOffsetX
  const leftEy = hy - eyeOffsetY
  const rightEx = hx + eyeOffsetX
  const rightEy = hy - eyeOffsetY

  g.beginFill(0xffffff)
  g.drawCircle(leftEx, leftEy, eyeR)
  g.endFill()
  g.beginFill(0x000000)
  g.drawCircle(leftEx + Math.cos(angle) * 2, leftEy + Math.sin(angle) * 2, pupilR)
  g.endFill()

  g.beginFill(0xffffff)
  g.drawCircle(rightEx, rightEy, eyeR)
  g.endFill()
  g.beginFill(0x000000)
  g.drawCircle(rightEx + Math.cos(angle) * 2, rightEy + Math.sin(angle) * 2, pupilR)
  g.endFill()
}

const SnakeContainer = PixiComponent<SnakeViewProps, Container>('SnakeContainer', {
  create: () => {
    const container = new Container()
    const shadowGraphics = new PixiGraphics()
    const glowGraphics = new PixiGraphics()
    glowGraphics.blendMode = BLEND_MODES.ADD
    const graphics = new PixiGraphics()
    container.addChild(shadowGraphics)
    container.addChild(glowGraphics)
    container.addChild(graphics)
    ;(container as unknown as {
      __graphics: PixiGraphics
      __glowGraphics: PixiGraphics
      __shadowGraphics: PixiGraphics
    }).__graphics = graphics
    ;(container as unknown as {
      __graphics: PixiGraphics
      __glowGraphics: PixiGraphics
      __shadowGraphics: PixiGraphics
    }).__glowGraphics = glowGraphics
    ;(container as unknown as {
      __graphics: PixiGraphics
      __glowGraphics: PixiGraphics
      __shadowGraphics: PixiGraphics
    }).__shadowGraphics = shadowGraphics
    return container
  },
  applyProps: (instance, _oldProps, newProps) => {
    const ref = instance as unknown as {
      __graphics: PixiGraphics
      __glowGraphics: PixiGraphics
      __shadowGraphics: PixiGraphics
    }
    drawSnakeAsCircles(
      ref.__graphics,
      ref.__glowGraphics,
      ref.__shadowGraphics,
      newProps.snake,
      newProps.isLocalPlayer
    )
  },
})

function areSnakePropsEqual(prev: SnakeViewProps, next: SnakeViewProps): boolean {
  if (prev.isLocalPlayer !== next.isLocalPlayer) return false
  const prevSnake = prev.snake
  const nextSnake = next.snake
  if (Number(prevSnake?.id) !== Number(nextSnake?.id)) return false
  if ((prevSnake?.boost ?? false) !== (nextSnake?.boost ?? false)) return false
  const prevHead = prevSnake?.head
  const nextHead = nextSnake?.head
  if (Math.round(prevHead?.x ?? 0) !== Math.round(nextHead?.x ?? 0)) return false
  if (Math.round(prevHead?.y ?? 0) !== Math.round(nextHead?.y ?? 0)) return false
  if (Math.round((prevSnake?.angle ?? 0) * 100) !== Math.round((nextSnake?.angle ?? 0) * 100)) return false
  const prevBody = prevSnake?.body ?? []
  const nextBody = nextSnake?.body ?? []
  if (prevBody.length !== nextBody.length) return false
  if (prevBody.length > 0) {
    const prevFirst = prevBody[0]
    const nextFirst = nextBody[0]
    if (Math.round(prevFirst?.x ?? 0) !== Math.round(nextFirst?.x ?? 0)) return false
    if (Math.round(prevFirst?.y ?? 0) !== Math.round(nextFirst?.y ?? 0)) return false
  }
  return true
}

export const SnakeView = React.memo(
  ({ snake, isLocalPlayer }: SnakeViewProps) => (
    <SnakeContainer snake={snake} isLocalPlayer={isLocalPlayer} />
  ),
  areSnakePropsEqual
)
