import React from 'react'
import { PixiComponent } from '@pixi/react'
import { Container, Graphics as PixiGraphics, BLEND_MODES, LINE_CAP, LINE_JOIN } from 'pixi.js'
import type { InterpolatedSnake } from '@/hooks/useGameEngine'

// slither.io palette (STYLE_REFERENCE.md)
const SNAKE_COLORS = [
  0xc080ff, 0x9099ff, 0x80d0d0, 0x80ff80, 0xeeee70, 0xffa060, 0xff9090, 0xff4040, 0xe030e0,
]

function getSnakeColor(skinIdOrSnakeId: number | null | undefined): number {
  if (skinIdOrSnakeId == null) return 0xc080ff
  const id = Number(skinIdOrSnakeId)
  return SNAKE_COLORS[Math.abs(id) % SNAKE_COLORS.length]
}

function lightenColor(hex: number, factor = 0.3): number {
  const r = Math.min(255, ((hex >> 16) & 0xff) + 255 * factor)
  const g = Math.min(255, ((hex >> 8) & 0xff) + 255 * factor)
  const b = Math.min(255, (hex & 0xff) + 255 * factor)
  return (r << 16) | (g << 8) | b
}

interface SnakeViewProps {
  snake: InterpolatedSnake
  isLocalPlayer: boolean
}

/** Build path from head to tail for stroke drawing. body[0] is head from server. */
function buildBodyPath(
  head: { x?: number | null; y?: number | null },
  body: { x?: number | null; y?: number | null }[]
): { x: number; y: number }[] {
  const hx = head?.x ?? 0
  const hy = head?.y ?? 0
  if (!body || body.length === 0) return [{ x: hx, y: hy }]
  const path: { x: number; y: number }[] = [{ x: hx, y: hy }]
  for (let i = 1; i < body.length; i++) {
    const p = body[i]
    path.push({ x: p?.x ?? 0, y: p?.y ?? 0 })
  }
  return path
}

/** Draw path on graphics with lineStyle. PixiJS strokes when lineTo is called with lineStyle set. */
function drawPath(
  g: PixiGraphics,
  path: { x: number; y: number }[],
  width: number,
  color: number,
  alpha: number
) {
  if (path.length < 2) return
  g.lineStyle({
    width,
    color,
    alpha,
    cap: LINE_CAP.ROUND,
    join: LINE_JOIN.ROUND,
  })
  g.moveTo(path[0].x, path[0].y)
  for (let i = 1; i < path.length; i++) {
    g.lineTo(path[i].x, path[i].y)
  }
}

/** Slither-style: stroke path instead of circles. Layers: shadow, glow, main, highlight, eyes. */
function drawSnake(
  g: PixiGraphics,
  glowG: PixiGraphics,
  shadowG: PixiGraphics,
  snake: InterpolatedSnake,
  isLocalPlayer: boolean
) {
  g.clear()
  glowG.clear()
  shadowG.clear()
  const head = snake.head
  if (!head) return

  const rawBody = snake.body ?? []
  const path = buildBodyPath(head, rawBody)
  const color = isLocalPlayer ? 0xc080ff : getSnakeColor(Number(snake.skinId ?? snake.id ?? 0))
  const boost = snake.boost ?? false

  const bodyLen = path.length
  const scale = Math.min(6, 1 + (bodyLen - 2) / 106)
  const lsz = 29 * scale

  const hx = head.x ?? 0
  const hy = head.y ?? 0
  const angle = snake.angle ?? 0

  if (path.length >= 2) {
    // Layer 1: Shadow
    drawPath(shadowG, path, lsz + 10, 0x000000, 0.3)

    // Layer 2: Glow (BLEND_MODES.ADD) — constant neon
    drawPath(glowG, path, lsz + 20, color, 0.1)
    if (boost) {
      drawPath(glowG, path, lsz + 30, color, 0.2)
    }

    // Layer 3: Main — outline then fill
    drawPath(g, path, lsz + 5, 0x000000, 0.4)
    drawPath(g, path, lsz, color, 0.8)

    // Layer 4: Highlight (center line)
    drawPath(g, path, lsz * 0.5, lightenColor(color), 0.6)
    g.lineStyle(0) // flush last path
  }

  // Eyes — draw on top of head (use head radius from lsz)
  const headR = lsz * 0.5
  const eyeOffsetX = headR * 0.5
  const eyeOffsetY = headR * 0.25
  const eyeR = headR * 0.2
  const pupilR = headR * 0.1
  const leftEx = hx - eyeOffsetX
  const leftEy = hy - eyeOffsetY
  const rightEx = hx + eyeOffsetX
  const rightEy = hy - eyeOffsetY

  g.lineStyle(0)
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

  // Fallback: single point (head only) — draw a circle
  if (path.length < 2) {
    g.lineStyle(0)
    g.beginFill(color)
    g.drawCircle(hx, hy, headR)
    g.endFill()
  }
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
    drawSnake(
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
  if (Number(prevSnake?.skinId ?? -1) !== Number(nextSnake?.skinId ?? -1)) return false
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
