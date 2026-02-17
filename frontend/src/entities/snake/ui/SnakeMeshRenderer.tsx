/**
 * SnakeMeshRenderer — mesh-based snake rendering (SimpleRope, GlowFilter, shadow).
 */
import {
  Container,
  Graphics,
  SimpleRope,
  Point,
  BLEND_MODES,
  BlurFilter,
} from 'pixi.js'
import { GlowFilter } from '@pixi/filter-glow'
import { createBodyTexture, createShadowTexture } from '@/shared/lib/snake-textures'
import { getSkinConfig } from '../lib/skin-config'

const GROWTH_FLASH_MS = 200
const TRAIL_LENGTH = 18
const TRAIL_POSITION_THRESHOLD = 2
const TEXTURE_SCALE = 0.5

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
  shadowRope: SimpleRope | null
  bodyRope: SimpleRope | null
  bodyContainer: Container
  headGraphics: Graphics
  eyesGraphics: Graphics
  flashGraphics: Graphics
  trailGraphics: Graphics
  ropePoints: Point[]
  shadowPoints: Point[]
}

function ensureRopePoints(
  points: Point[],
  path: { x: number; y: number }[]
): Point[] {
  while (points.length < path.length) {
    points.push(new Point(0, 0))
  }
  if (points.length > path.length) {
    points.length = path.length
  }
  for (let i = 0; i < path.length; i++) {
    points[i].set(path[i].x, path[i].y)
  }
  return points
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

  const shadowRope: SimpleRope | null = null
  const bodyRope: SimpleRope | null = null
  const bodyContainer = new Container()
  const headGraphics = new Graphics()
  const eyesGraphics = new Graphics()
  const flashGraphics = new Graphics()
  const trailGraphics = new Graphics()
  trailGraphics.blendMode = BLEND_MODES.ADD

  return {
    shadowContainer,
    shadowRope,
    bodyRope,
    bodyContainer,
    headGraphics,
    eyesGraphics,
    flashGraphics,
    trailGraphics,
    ropePoints: [],
    shadowPoints: [],
  }
}

export function updateSnakeMesh(container: Container, ref: SnakeMeshRef, props: SnakeMeshRendererProps): void {
  const { path, color, skinId = 0, isLocalPlayer, angle, boost, mouseWorld, growthFlash, trailState } = props

  if (path.length === 0) return

  const skin = getSkinConfig(skinId, isLocalPlayer)
  const bodyLen = path.length
  const scale = Math.min(6, 1 + (bodyLen - 2) / 106)
  const lsz = 29 * scale
  const headR = lsz * 0.5
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

  // Shadow layer
  if (path.length >= 2) {
    ref.shadowPoints = ensureRopePoints(ref.shadowPoints, path)
    if (!ref.shadowRope) {
      const shadowTexture = createShadowTexture()
      ref.shadowRope = new SimpleRope(shadowTexture, ref.shadowPoints, TEXTURE_SCALE)
      ref.shadowRope.filters = [new BlurFilter(4, 2)]
      ref.shadowContainer.addChild(ref.shadowRope)
    }
    ref.shadowRope.scale.set((lsz + 10) / ref.shadowRope.texture.height)
    ref.shadowRope.alpha = boost ? 0.5 : 0.3
    ref.shadowRope.tint = boost ? 0xaa3333 : 0x000000
    ref.shadowRope.visible = true
  } else {
    if (ref.shadowRope) ref.shadowRope.visible = false
  }

  // Body rope
  if (path.length >= 2) {
    const bodyTexture = createBodyTexture(skin.bodyColor)
    ref.ropePoints = ensureRopePoints(ref.ropePoints, path)
    if (!ref.bodyRope) {
      ref.bodyRope = new SimpleRope(bodyTexture, ref.ropePoints, TEXTURE_SCALE)
      ref.bodyContainer.addChild(ref.bodyRope)
    }
    ref.bodyRope.scale.set(lsz / bodyTexture.height)
    ref.bodyRope.tint = skin.bodyColor
    ref.bodyRope.visible = true

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
    if (ref.bodyRope) ref.bodyRope.visible = false
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
  const eyeOffsetX = headR * 0.5
  const eyeOffsetY = headR * 0.25
  const eyeR = headR * 0.2
  const pupilR = headR * 0.1
  const maxPupilOffset = pupilR * 0.8
  const leftEx = hx - eyeOffsetX
  const leftEy = hy - eyeOffsetY
  const rightEx = hx + eyeOffsetX
  const rightEy = hy - eyeOffsetY

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
