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
  for (let i = 0; i < n; i++) {
    const p = trailState.buffer[i]
    const t = i / Math.max(1, n - 1)
    graphics.beginFill(color, t * 0.18)
    graphics.drawCircle(p.x, p.y, 1 + t * 4)
    graphics.endFill()
  }
}

function drawShadow(graphics: Graphics, path: XY[], headRadius: number): void {
  graphics.clear()
  for (let i = path.length - 1; i >= 0; i--) {
    const p = path[i]
    const t = i / Math.max(1, path.length - 1)
    const r = Math.max(3, headRadius * (0.55 - 0.3 * t))
    graphics.beginFill(0x000000, 0.16 * (1 - t))
    graphics.drawCircle(p.x + 6, p.y + 6, r)
    graphics.endFill()
  }
}

function drawBody(graphics: Graphics, path: XY[], color: number, boost: boolean): void {
  graphics.clear()
  const outerAlpha = boost ? 0.42 : 0.24
  const coreAlpha = boost ? 0.98 : 0.92

  for (let i = path.length - 1; i >= 0; i--) {
    const p = path[i]
    const t = i / Math.max(1, path.length - 1)
    const radius = Math.max(3, 10 - t * 4.6)
    graphics.beginFill(color, outerAlpha * (1 - t * 0.5))
    graphics.drawCircle(p.x, p.y, radius + (boost ? 2.2 : 1.2))
    graphics.endFill()

    graphics.beginFill(color, coreAlpha)
    graphics.drawCircle(p.x, p.y, radius)
    graphics.endFill()
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
  headSprite.width = headRadius * 2.15
  headSprite.height = headRadius * 2.15
  headSprite.tint = color
  headSprite.alpha = 0.96

  if (boost) {
    graphics.beginFill(color, 0.22)
    graphics.drawCircle(head.x, head.y, headRadius + 7)
    graphics.endFill()
  }
}

function drawEyes(graphics: Graphics, head: XY, headRadius: number, angle: number, mouseWorld?: XY | null): void {
  graphics.clear()
  const lookAngle = mouseWorld
    ? Math.atan2(mouseWorld.y - head.y, mouseWorld.x - head.x)
    : angle

  const side = lookAngle + Math.PI / 2
  const spread = headRadius * 0.42
  const forward = headRadius * 0.22
  const eyeRadius = Math.max(2.6, headRadius * 0.26)
  const pupilRadius = Math.max(1.2, eyeRadius * 0.45)

  const lx = head.x + Math.cos(side) * spread + Math.cos(lookAngle) * forward
  const ly = head.y + Math.sin(side) * spread + Math.sin(lookAngle) * forward
  const rx = head.x - Math.cos(side) * spread + Math.cos(lookAngle) * forward
  const ry = head.y - Math.sin(side) * spread + Math.sin(lookAngle) * forward

  graphics.beginFill(0xffffff, 0.98)
  graphics.drawCircle(lx, ly, eyeRadius)
  graphics.drawCircle(rx, ry, eyeRadius)
  graphics.endFill()

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
