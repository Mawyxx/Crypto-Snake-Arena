/**
 * SnakeMeshRenderer — slither-like layered snake rendering.
 */
import { Container, Graphics, Sprite } from 'pixi.js'
import { BODY_TEXTURE_HEIGHT } from '@/shared/lib/snake-textures/createBodyTexture'
import { createHeadTexture } from '@/shared/lib/snake-textures/createHeadTexture'
import { getSkinConfig } from '../lib/skin-config'

type XY = { x: number; y: number }

export interface SnakeMeshRendererProps {
  path: XY[]
  color: number
  skinId?: number
  isLocalPlayer: boolean
  angle: number
  boost: boolean
  mouseWorld?: XY | null
  growthFlash?: number
  trailState?: {
    buffer: XY[]
    lastHead: XY | null
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
  headSprite: Sprite
}

const MAX_TRAIL_POINTS = 24
const TRAIL_STEP_SQ = 9
const FLASH_MS = 180
const BODY_TARGET_SPACING = 4.6
const MAX_SUBDIV_SEGMENTS = 3
const SHADOW_OFFSET = 5

export function createSnakeMeshRef(): SnakeMeshRef {
  const shadowContainer = new Container()
  const shadowGraphics = new Graphics()
  const bodyContainer = new Container()
  const bodyGraphics = new Graphics()
  const headGraphics = new Graphics()
  const eyesGraphics = new Graphics()
  const flashGraphics = new Graphics()
  const trailGraphics = new Graphics()
  const headSprite = new Sprite(createHeadTexture())
  headSprite.anchor.set(0.5)

  shadowContainer.addChild(shadowGraphics)
  bodyContainer.addChild(bodyGraphics)

  return {
    shadowContainer,
    shadowGraphics,
    bodyGraphics,
    bodyContainer,
    headGraphics,
    eyesGraphics,
    flashGraphics,
    trailGraphics,
    headSprite,
  }
}

export function updateSnakeMesh(container: Container, ref: SnakeMeshRef, props: SnakeMeshRendererProps): void {
  if (container.children.length === 0) {
    container.addChild(ref.trailGraphics)
    container.addChild(ref.shadowContainer)
    container.addChild(ref.bodyContainer)
    container.addChild(ref.headSprite)
    container.addChild(ref.headGraphics)
    container.addChild(ref.eyesGraphics)
    container.addChild(ref.flashGraphics)
  }

  if (props.path.length === 0) {
    clearMesh(ref)
    return
  }

  const skin = getSkinConfig(props.skinId ?? 0, props.isLocalPlayer)
  const head = props.path[0]
  const headRadius = Math.max(8, BODY_TEXTURE_HEIGHT * 0.56)

  drawTrail(ref.trailGraphics, props, skin.bodyColor)
  drawShadow(ref.shadowGraphics, props.path, headRadius)
  drawBody(ref.bodyGraphics, props.path, skin.bodyColor, props.boost)
  drawHead(ref.headGraphics, ref.headSprite, head, headRadius, skin.bodyColor, props.boost)
  drawEyes(ref.eyesGraphics, head, headRadius, props.angle, props.mouseWorld)
  drawGrowthFlash(ref.flashGraphics, head, headRadius, props.growthFlash)
}

function clearMesh(ref: SnakeMeshRef): void {
  ref.shadowGraphics.clear()
  ref.bodyGraphics.clear()
  ref.headGraphics.clear()
  ref.eyesGraphics.clear()
  ref.flashGraphics.clear()
  ref.trailGraphics.clear()
  ref.headSprite.visible = false
}

function drawTrail(graphics: Graphics, props: SnakeMeshRendererProps, color: number): void {
  graphics.clear()
  const trailState = props.trailState
  if (!trailState || props.path.length === 0) return

  const head = props.path[0]
  const last = trailState.lastHead
  if (!last) {
    trailState.lastHead = { x: head.x, y: head.y }
  } else {
    const dx = head.x - last.x
    const dy = head.y - last.y
    if ((dx * dx + dy * dy) >= TRAIL_STEP_SQ) {
      trailState.buffer.push({ x: head.x, y: head.y })
      trailState.lastHead = { x: head.x, y: head.y }
      if (trailState.buffer.length > MAX_TRAIL_POINTS) {
        trailState.buffer.shift()
      }
    }
  }

  const n = trailState.buffer.length
  const boostAlpha = props.boost ? 1.35 : 1
  for (let i = 0; i < n; i++) {
    const p = trailState.buffer[i]
    const t = i / Math.max(1, n - 1)
    graphics.beginFill(color, Math.min(0.28, t * 0.16 * boostAlpha))
    graphics.drawCircle(p.x, p.y, 1 + t * (props.boost ? 4.8 : 3.6))
    graphics.endFill()
  }
}

function drawShadow(graphics: Graphics, path: XY[], headRadius: number): void {
  graphics.clear()
  for (let i = path.length - 1; i >= 0; i--) {
    const p = path[i]
    const t = i / Math.max(1, path.length - 1)
    const r = Math.max(3, headRadius * (0.55 - 0.3 * t))
    graphics.beginFill(0x000000, 0.12 * (1 - t))
    graphics.drawCircle(p.x + SHADOW_OFFSET, p.y + SHADOW_OFFSET, r)
    graphics.endFill()
  }
}

function profileRadius(t: number): number {
  // Neck bump + smooth tail taper for slither-like silhouette.
  const neck = 1 + 0.14 * Math.exp(-((t - 0.11) * (t - 0.11)) / 0.012)
  const tail = 1 - 0.7 * Math.pow(t, 1.5)
  return Math.max(2.6, 9.4 * neck * tail)
}

function drawBody(graphics: Graphics, path: XY[], color: number, boost: boolean): void {
  graphics.clear()
  const outerAlpha = boost ? 0.4 : 0.24
  const coreAlpha = boost ? 0.96 : 0.92
  const n = path.length
  if (n === 0) return

  for (let i = 0; i < n; i++) {
    const p = path[i]
    const t = i / Math.max(1, n - 1)
    const radius = profileRadius(t)

    graphics.beginFill(color, outerAlpha * (1 - t * 0.32))
    graphics.drawCircle(p.x, p.y, radius + (boost ? 2.4 : 1.2))
    graphics.endFill()

    graphics.beginFill(color, coreAlpha)
    graphics.drawCircle(p.x, p.y, radius)
    graphics.endFill()
  }

  // Subdivide sparse segments so body always reads as continuous circles, not sticks.
  for (let i = 0; i < n - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= BODY_TARGET_SPACING) continue
    const extra = Math.min(MAX_SUBDIV_SEGMENTS, Math.floor(dist / BODY_TARGET_SPACING))
    if (extra <= 0) continue

    for (let s = 1; s <= extra; s++) {
      const k = s / (extra + 1)
      const x = a.x + dx * k
      const y = a.y + dy * k
      const t = (i + k) / Math.max(1, n - 1)
      const radius = profileRadius(t)

      graphics.beginFill(color, outerAlpha * (1 - t * 0.32))
      graphics.drawCircle(x, y, radius + (boost ? 2.2 : 1.05))
      graphics.endFill()

      graphics.beginFill(color, coreAlpha)
      graphics.drawCircle(x, y, radius)
      graphics.endFill()
    }
  }
}

function drawHead(
  graphics: Graphics,
  headSprite: Sprite,
  head: XY,
  headRadius: number,
  color: number,
  boost: boolean
): void {
  graphics.clear()
  headSprite.visible = true
  headSprite.position.set(head.x, head.y)
  headSprite.width = headRadius * 2.18
  headSprite.height = headRadius * 2.18
  headSprite.tint = color
  headSprite.alpha = 0.98

  if (boost) {
    const pulse = 1 + Math.sin(Date.now() * 0.03) * 0.08
    graphics.beginFill(color, 0.2)
    graphics.drawCircle(head.x, head.y, (headRadius + 7) * pulse)
    graphics.endFill()
  }
}

function drawEyes(graphics: Graphics, head: XY, headRadius: number, angle: number, mouseWorld?: XY | null): void {
  graphics.clear()
  // Глазницы привязаны к направлению движения (angle), не к мышке
  const side = angle + Math.PI / 2
  const spread = headRadius * 0.4
  const forward = headRadius * 0.2
  const eyeRadius = Math.max(2.3, headRadius * 0.23)
  const pupilRadius = Math.max(1.2, eyeRadius * 0.45)

  const lx = head.x + Math.cos(side) * spread + Math.cos(angle) * forward
  const ly = head.y + Math.sin(side) * spread + Math.sin(angle) * forward
  const rx = head.x - Math.cos(side) * spread + Math.cos(angle) * forward
  const ry = head.y - Math.sin(side) * spread + Math.sin(angle) * forward

  graphics.beginFill(0xffffff, 0.98)
  graphics.drawCircle(lx, ly, eyeRadius)
  graphics.drawCircle(rx, ry, eyeRadius)
  graphics.endFill()

  // Только зрачки поворачиваются на мышку
  const lookAngle = mouseWorld
    ? Math.atan2(mouseWorld.y - head.y, mouseWorld.x - head.x)
    : angle
  const pupilShift = eyeRadius * 0.38
  const px = Math.cos(lookAngle) * pupilShift
  const py = Math.sin(lookAngle) * pupilShift

  graphics.beginFill(0x101214, 0.95)
  graphics.drawCircle(lx + px, ly + py, pupilRadius)
  graphics.drawCircle(rx + px, ry + py, pupilRadius)
  graphics.endFill()
}

function drawGrowthFlash(graphics: Graphics, head: XY, headRadius: number, growthFlash?: number): void {
  graphics.clear()
  if (!growthFlash) return
  const ageMs = Date.now() - growthFlash
  if (ageMs < 0 || ageMs > FLASH_MS) return

  const t = ageMs / FLASH_MS
  graphics.beginFill(0xffffff, 0.35 * (1 - t))
  graphics.drawCircle(head.x, head.y, headRadius + 10 * t)
  graphics.endFill()
}
