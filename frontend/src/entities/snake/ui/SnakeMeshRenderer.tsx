/**
 * SnakeMeshRenderer — segmented circle-based snake rendering (Slither.io style).
 */
import {
  Container,
  Graphics,
  BLEND_MODES,
  BlurFilter,
} from 'pixi.js'
import { GlowFilter } from '@pixi/filter-glow'
import { getSkinConfig } from '../lib/skin-config'

const GROWTH_FLASH_MS = 200
const TRAIL_LENGTH = 18
const TRAIL_POSITION_THRESHOLD = 2

const BASE_RADIUS = 8.8
const GROWTH_SQRT_FACTOR = 0.62
const MAX_RADIUS_SCALE = 2.8
const TAIL_TAPER_SEGMENTS = 20
const TAIL_MIN_RADIUS_SCALE = 0.14
const HEAD_SWELL_SEGMENTS = 4
const HEAD_SWELL_FACTOR = 0.08
const SHADOW_PADDING = 4.5
const HIGHLIGHT_RATIO = 0.88
const HIGHLIGHT_ALPHA = 0.34
const HIGHLIGHT_BRIGHTNESS = 1.15
const OUTLINE_ALPHA = 0.4
const OUTLINE_WIDTH = 2
const DEBUG_LOG_INTERVAL_MS = 450

export interface SnakeMeshRendererProps {
  path: { x: number; y: number }[]
  color: number
  skinId?: number
  isLocalPlayer: boolean
  angle: number
  boost: boolean
  mouseWorld?: { x: number; y: number } | null
  growthFlash?: number
  trailState?: {
    buffer: { x: number; y: number }[]
    lastHead: { x: number; y: number } | null
  }
}

export interface SnakeMeshRef {
  shadowContainer: Container
  shadowGraphics: Graphics
  bodyGraphics: Graphics
  bodyContainer: Container
  headGraphics: Graphics
  eyesGraphics: Graphics
  flashGraphics: Graphics
  trailGraphics: Graphics
}

type SnakeDebugGlobal = typeof globalThis & { __SNAKE_RENDER_DEBUG__?: boolean }

interface RenderSegment {
  x: number
  y: number
  radius: number
}

function brightenColor(color: number, factor: number): number {
  const r = ((color >> 16) & 0xff) * factor
  const g = ((color >> 8) & 0xff) * factor
  const b = (color & 0xff) * factor
  return (
    (Math.min(255, r) << 16) |
    (Math.min(255, g) << 8) |
    Math.min(255, b)
  )
}

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

let lastDebugLogTs = 0

function isRenderDebugEnabled(): boolean {
  if (!import.meta.env.DEV) return false
  const g = globalThis as SnakeDebugGlobal
  return g.__SNAKE_RENDER_DEBUG__ === true
}

function buildRenderSegments(path: { x: number; y: number }[], baseSegmentRadius: number): RenderSegment[] {
  const totalPoints = path.length
  if (totalPoints === 0) return []

  const segments: RenderSegment[] = []

  // От хвоста к голове — как в Slither, чтобы слои ложились корректно.
  for (let i = totalPoints - 1; i >= 0; i--) {
    const point = path[i]
    const indexFromHead = i
    const indexFromTail = totalPoints - 1 - i

    let radius = baseSegmentRadius

    if (indexFromHead < HEAD_SWELL_SEGMENTS) {
      radius *= 1 + (HEAD_SWELL_SEGMENTS - indexFromHead) * HEAD_SWELL_FACTOR
    } else if (indexFromTail < TAIL_TAPER_SEGMENTS) {
      const tailT = indexFromTail / TAIL_TAPER_SEGMENTS
      const tailScale = TAIL_MIN_RADIUS_SCALE + tailT * (1 - TAIL_MIN_RADIUS_SCALE)
      radius *= tailScale
    }

    segments.push({ x: point.x, y: point.y, radius })
  }

  return segments
}

/**
 * Рендерит тело змеи пассами, близкими к Slither mode 2:
 * shadow -> body -> highlight -> outline.
 */
function drawSnakeSegments(
  graphics: Graphics,
  path: { x: number; y: number }[],
  baseSegmentRadius: number,
  color: number,
  isShadow: boolean,
  boost: boolean
): void {
  graphics.clear()

  if (path.length === 0) return

  const segments = buildRenderSegments(path, baseSegmentRadius)
  if (segments.length === 0) return

  if (isRenderDebugEnabled()) {
    const now = Date.now()
    if (now - lastDebugLogTs > DEBUG_LOG_INTERVAL_MS) {
      let sum = 0
      for (let i = 1; i < segments.length; i++) {
        sum += getDistance(segments[i - 1], segments[i])
      }
      const avgSpacing = segments.length > 1 ? sum / (segments.length - 1) : 0
      console.debug('[snake-render]', {
        pathPoints: path.length,
        drawnSegments: segments.length,
        baseRadius: Number(baseSegmentRadius.toFixed(2)),
        avgSpacing: Number(avgSpacing.toFixed(2)),
      })
      lastDebugLogTs = now
    }
  }

  if (isShadow) {
    graphics.beginFill(0x000000, boost ? 0.45 : 0.28)
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      graphics.drawCircle(seg.x, seg.y, seg.radius + SHADOW_PADDING)
    }
    graphics.endFill()
    return
  }

  graphics.beginFill(color, 0.95)
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    graphics.drawCircle(seg.x, seg.y, seg.radius)
  }
  graphics.endFill()

  const highlightColor = brightenColor(color, HIGHLIGHT_BRIGHTNESS)
  graphics.beginFill(highlightColor, HIGHLIGHT_ALPHA)
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const hlr = seg.radius * HIGHLIGHT_RATIO
    graphics.drawCircle(seg.x - seg.radius * 0.2, seg.y - seg.radius * 0.22, hlr)
  }
  graphics.endFill()

  graphics.lineStyle(OUTLINE_WIDTH, 0x000000, OUTLINE_ALPHA)
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    graphics.drawCircle(seg.x, seg.y, seg.radius)
  }
  graphics.lineStyle(0)
}

function updateHeadTrail(
  buffer: { x: number; y: number }[],
  lastHead: { x: number; y: number } | null,
  head: { x: number; y: number }
): void {
  const dx = head.x - (lastHead?.x ?? head.x - 1)
  const dy = head.y - (lastHead?.y ?? head.y - 1)
  if (lastHead && dx * dx + dy * dy < TRAIL_POSITION_THRESHOLD * TRAIL_POSITION_THRESHOLD) {
    return
  }
  buffer.push({ x: head.x, y: head.y })
  if (buffer.length > TRAIL_LENGTH) buffer.shift()
}

export function createSnakeMeshRef(): SnakeMeshRef {
  const shadowContainer = new Container()
  shadowContainer.x = 2
  shadowContainer.y = 4

  const shadowGraphics = new Graphics()
  shadowGraphics.filters = [new BlurFilter(4, 2)]
  shadowContainer.addChild(shadowGraphics)

  const bodyContainer = new Container()
  const bodyGraphics = new Graphics()
  bodyContainer.addChild(bodyGraphics)

  const headGraphics = new Graphics()
  const eyesGraphics = new Graphics()
  const flashGraphics = new Graphics()
  const trailGraphics = new Graphics()
  trailGraphics.blendMode = BLEND_MODES.ADD

  return {
    shadowContainer,
    shadowGraphics,
    bodyGraphics,
    bodyContainer,
    headGraphics,
    eyesGraphics,
    flashGraphics,
    trailGraphics,
  }
}

export function updateSnakeMesh(container: Container, ref: SnakeMeshRef, props: SnakeMeshRendererProps): void {
  const { path, color, skinId = 0, isLocalPlayer, angle, boost, mouseWorld, growthFlash, trailState } = props

  if (path.length === 0) return

  const skin = getSkinConfig(skinId, isLocalPlayer)
  const bodyLen = path.length
  
  // Нелинейный рост толщины: заметно жирнее при росте длины, но без взрывного масштаба.
  const growthFactor = 1 + Math.sqrt(bodyLen) * GROWTH_SQRT_FACTOR / 10
  const baseRadius = BASE_RADIUS * Math.min(growthFactor, MAX_RADIUS_SCALE)
  
  // Для совместимости с существующим кодом вычисляем lsz и headR
  const scale = Math.min(6, 1 + (bodyLen - 2) / 106)
  const lsz = 29 * scale
  const headR = baseRadius // Используем baseRadius для головы
  const hx = path[0].x
  const hy = path[0].y

  // Trail (boost, local only)
  if (trailState) {
    if (boost && isLocalPlayer && path.length >= 2) {
      updateHeadTrail(trailState.buffer, trailState.lastHead, { x: hx, y: hy })
      trailState.lastHead = { x: hx, y: hy }
      if (trailState.buffer.length >= 2) {
        ref.trailGraphics.clear()
        const buf = trailState.buffer
        const n = buf.length - 1
        for (let i = 0; i < n; i++) {
          const alpha = 0.3 * (i + 1) / n
          ref.trailGraphics.lineStyle(lsz * 0.6, color, alpha)
          ref.trailGraphics.moveTo(buf[i].x, buf[i].y)
          ref.trailGraphics.lineTo(buf[i + 1].x, buf[i + 1].y)
        }
        ref.trailGraphics.visible = true
      }
    } else {
      trailState.buffer.length = 0
      trailState.lastHead = null
      ref.trailGraphics.clear()
      ref.trailGraphics.visible = false
    }
  }

  // Shadow layer - отрисовка теней сегментов
  if (path.length >= 2) {
    drawSnakeSegments(ref.shadowGraphics, path, baseRadius, 0, true, boost)
    ref.shadowGraphics.visible = true
  } else {
    ref.shadowGraphics.visible = false
  }

  // Body segments - отрисовка сегментов тела с улучшенной визуализацией
  if (path.length >= 2) {
    drawSnakeSegments(ref.bodyGraphics, path, baseRadius, skin.bodyColor, false, boost)
    ref.bodyGraphics.visible = true

    // Glow filter для boost эффекта
    let glowFilter = ref.bodyContainer.filters?.[0] as GlowFilter | undefined
    if (!glowFilter) {
      glowFilter = new GlowFilter({
        distance: skin.glowDistance,
        outerStrength: skin.glowOuterStrength,
        color: skin.glowColor,
        quality: 0.3,
      })
      ref.bodyContainer.filters = [glowFilter]
    }
    glowFilter.outerStrength = boost ? skin.boostGlowOuterStrength : skin.glowOuterStrength
    glowFilter.color = skin.glowColor
  } else {
    ref.bodyGraphics.visible = false
    ref.bodyContainer.filters = []
  }

  // Head
  ref.headGraphics.clear()
  ref.headGraphics.beginFill(skin.bodyColor, 0.95)
  ref.headGraphics.drawCircle(hx, hy, headR)
  ref.headGraphics.endFill()
  ref.headGraphics.lineStyle(2, 0x000000, 0.4)
  ref.headGraphics.drawCircle(hx, hy, headR)

  // Eyes
  const eyeOrbit = headR * 0.58
  const eyeR = headR * 0.22
  const pupilR = headR * 0.11
  const maxPupilOffset = pupilR * 0.8
  const leftEx = hx + Math.cos(angle + 0.8) * eyeOrbit
  const leftEy = hy + Math.sin(angle + 0.8) * eyeOrbit
  const rightEx = hx + Math.cos(angle - 0.8) * eyeOrbit
  const rightEy = hy + Math.sin(angle - 0.8) * eyeOrbit

  const pupilOffset = (eyeX: number, eyeY: number) => {
    if (isLocalPlayer && mouseWorld) {
      const dx = mouseWorld.x - eyeX
      const dy = mouseWorld.y - eyeY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0.01) {
        const s = Math.min(1, maxPupilOffset / dist)
        return { x: dx * s, y: dy * s }
      }
    }
    return { x: Math.cos(angle) * 2, y: Math.sin(angle) * 2 }
  }

  const leftPupil = pupilOffset(leftEx, leftEy)
  const rightPupil = pupilOffset(rightEx, rightEy)

  ref.eyesGraphics.clear()
  ref.eyesGraphics.beginFill(0xffffff)
  ref.eyesGraphics.drawCircle(leftEx, leftEy, eyeR)
  ref.eyesGraphics.endFill()
  ref.eyesGraphics.beginFill(0x000000)
  ref.eyesGraphics.drawCircle(leftEx + leftPupil.x, leftEy + leftPupil.y, pupilR)
  ref.eyesGraphics.endFill()
  ref.eyesGraphics.beginFill(0xffffff)
  ref.eyesGraphics.drawCircle(rightEx, rightEy, eyeR)
  ref.eyesGraphics.endFill()
  ref.eyesGraphics.beginFill(0x000000)
  ref.eyesGraphics.drawCircle(rightEx + rightPupil.x, rightEy + rightPupil.y, pupilR)
  ref.eyesGraphics.endFill()

  // Growth flash
  ref.flashGraphics.clear()
  if (growthFlash && growthFlash > 0) {
    const elapsed = Date.now() - growthFlash
    if (elapsed < GROWTH_FLASH_MS) {
      const alpha = 0.8 * (1 - elapsed / GROWTH_FLASH_MS)
      ref.flashGraphics.beginFill(0xffffff, alpha)
      ref.flashGraphics.drawCircle(hx, hy, headR * 1.5)
      ref.flashGraphics.endFill()
      ref.flashGraphics.visible = true
    } else {
      ref.flashGraphics.visible = false
    }
  } else {
    ref.flashGraphics.visible = false
  }

  // Fallback: head only
  if (path.length < 2) {
    ref.headGraphics.clear()
    ref.headGraphics.beginFill(skin.bodyColor, 0.95)
    ref.headGraphics.drawCircle(hx, hy, headR)
    ref.headGraphics.endFill()
  }

  // Assemble container (order: trail, shadow, body, head, eyes, flash)
  container.removeChildren()
  container.addChild(ref.trailGraphics)
  container.addChild(ref.shadowContainer)
  container.addChild(ref.bodyContainer)
  container.addChild(ref.headGraphics)
  container.addChild(ref.eyesGraphics)
  container.addChild(ref.flashGraphics)
}
