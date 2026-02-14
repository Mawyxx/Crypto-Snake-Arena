import React from 'react'
import { PixiComponent } from '@pixi/react'
import { Container, Graphics as PixiGraphics, BLEND_MODES } from 'pixi.js'
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

/** Slither.io shadowBlur=30: 2-3 glow layers with ADD blend (scaled for lsz*0.5) */
const BOOST_GLOW_LAYERS: { offset: number; alpha: number }[] = [
  { offset: 4, alpha: 0.15 },
  { offset: 8, alpha: 0.08 },
  { offset: 12, alpha: 0.04 },
]

// slither.io-clone: preferredDistance = 17*scale ≈ 10.2, circle radius ~19. SegmentLen 42 → 4 круга на сегмент ≈ 10.5 между
const CIRCLES_PER_SEGMENT = 4

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

/** Slither.io 1:1: lsz=29*scale, head 52/32 и 62/32, outline (lsz+5), glow при boost */
function drawSnakeAsCircles(
  g: PixiGraphics,
  glowG: PixiGraphics,
  snake: InterpolatedSnake,
  isLocalPlayer: boolean
) {
  g.clear()
  glowG.clear()
  const rawBody = snake.body ?? []
  const head = snake.head
  if (!head) return

  const body = expandBodyForRender(rawBody)

  const color = isLocalPlayer ? 0xc080ff : getSnakeColor(snake.id)
  const boost = snake.boost ?? false

  // slither.io-clone: scale 0.6, circle radius ~19 (sec.width*0.5*scale). preferredDistance 10.2.
  const bodyLen = rawBody.length + 1
  const scale = Math.min(6, 1 + Math.max(0, (bodyLen - 2) / 106))
  const lsz = 29 * scale * 1.3 // радиус ~19 как в клоне (было 0.5 — слишком мелко)
  const segRadius = lsz / 2
  const headR = (lsz * 62) / 32 / 2
  const outlineExtra = (lsz + 5) / 2 - segRadius

  const hx = head.x ?? 0
  const hy = head.y ?? 0
  const angle = snake.angle ?? 0

  // Body: дискретные круги как в slither.io-clone (preferredDistance 10.2)
  body.forEach((segment) => {
    const sx = segment?.x ?? 0
    const sy = segment?.y ?? 0
    const radius = segRadius

    if (boost) {
      for (const layer of BOOST_GLOW_LAYERS) {
        glowG.beginFill(color, layer.alpha)
        glowG.drawCircle(sx, sy, radius + layer.offset)
        glowG.endFill()
      }
    }
    // slither.io-clone: плоские круги как circle.png
    g.beginFill(0x000000, 0.35)
    g.drawCircle(sx, sy, radius + outlineExtra)
    g.endFill()
    g.beginFill(color)
    g.drawCircle(sx, sy, radius)
    g.endFill()
  })

  // Голова — olsz 52/32, shsz 62/32
  const headOutline = (lsz * 52) / 32 / 2
  if (boost) {
    for (const layer of BOOST_GLOW_LAYERS) {
      glowG.beginFill(color, layer.alpha)
      glowG.drawCircle(hx, hy, headR + layer.offset)
      glowG.endFill()
    }
  }
  g.beginFill(0x000000, 0.35)
  g.drawCircle(hx, hy, headOutline + outlineExtra)
  g.endFill()
  g.beginFill(color)
  g.drawCircle(hx, hy, headR)
  g.endFill()

  // Глаза: ed=6*ssc, esp=6*ssc (Slither default)
  const eyeDist = 6 * scale
  const eyeR = 2.8 * scale
  const pupilR = 1.3 * scale
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
    const glowGraphics = new PixiGraphics()
    glowGraphics.blendMode = BLEND_MODES.ADD
    const graphics = new PixiGraphics()
    container.addChild(glowGraphics)
    container.addChild(graphics)
    ;(container as unknown as { __graphics: PixiGraphics; __glowGraphics: PixiGraphics }).__graphics = graphics
    ;(container as unknown as { __graphics: PixiGraphics; __glowGraphics: PixiGraphics }).__glowGraphics = glowGraphics
    return container
  },
  applyProps: (instance, _oldProps, newProps) => {
    const graphics = (instance as unknown as { __graphics: PixiGraphics; __glowGraphics: PixiGraphics }).__graphics
    const glowGraphics = (instance as unknown as { __graphics: PixiGraphics; __glowGraphics: PixiGraphics }).__glowGraphics
    drawSnakeAsCircles(graphics, glowGraphics, newProps.snake, newProps.isLocalPlayer)
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
