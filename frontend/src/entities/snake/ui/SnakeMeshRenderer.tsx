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
import { pointAtDistance, getPathLength } from '@/shared/lib/path-sampler'
import { getSkinConfig } from '../lib/skin-config'

const GROWTH_FLASH_MS = 200
const TRAIL_LENGTH = 18
const TRAIL_POSITION_THRESHOLD = 2

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

/**
 * Отрисовывает сегменты змеи как отдельные круги (Slither.io render_mode 2).
 * Отрисовывает от хвоста к голове для правильного наслоения.
 * Каждый сегмент размещается на пути головы на определенном расстоянии от предыдущего,
 * создавая эффект "следования" - каждый сегмент движется по пути предыдущего.
 */
function drawSnakeSegments(
  graphics: Graphics,
  path: { x: number; y: number }[],
  segmentRadius: number,
  color: number,
  isShadow: boolean,
  boost: boolean
): void {
  graphics.clear()
  
  if (path.length === 0) return
  
  // ВАЖНО: ВСЕГДА рисуем круги по всей длине пути!
  // Расстояние между центрами кругов для плотного перекрытия (~80-85%)
  // В оригинале Slither.io: minSegmentSpacing = 4.5px (или 3px для WebGL)
  const segmentSpacing = Math.max(4, segmentRadius * 0.3) // ~4-5px при radius=14.5px для ОЧЕНЬ плотного перекрытия
  
  const pathLength = getPathLength(path)
  
  // Вычисляем количество сегментов на основе длины пути
  // Гарантируем минимум 30 сегментов для визуальной плавности
  const calculatedSegments = pathLength > 0 ? Math.ceil(pathLength / segmentSpacing) : path.length
  const segmentCount = Math.max(30, Math.max(calculatedSegments, path.length))
  
  // Отрисовываем от хвоста к голове для правильного наслоения
  for (let i = segmentCount - 1; i >= 0; i--) {
    // Вычисляем расстояние от головы для этого сегмента
    const distFromHead = (segmentCount - 1 - i) * segmentSpacing
    
    // Если расстояние превышает длину пути, используем последнюю точку пути
    let segmentPos: { x: number; y: number } | null
    if (distFromHead >= pathLength) {
      segmentPos = path[path.length - 1] // хвост
    } else {
      segmentPos = pointAtDistance(path, distFromHead)
    }
    
    if (!segmentPos) continue
    
    // Swell для первых 4 сегментов (как в оригинале Slither.io)
    let radius = segmentRadius
    const segmentIndex = segmentCount - 1 - i // индекс от головы (0 = голова)
    if (segmentIndex < 4) {
      radius = segmentRadius * (1 + (4 - segmentIndex) * 0.08)
    }
    
    if (isShadow) {
      // Тень: чёрный круг с увеличенным радиусом
      graphics.beginFill(0x000000, boost ? 0.5 : 0.3)
      graphics.drawCircle(segmentPos.x, segmentPos.y, radius + 5)
      graphics.endFill()
    } else {
      // Тело: цветной круг
      graphics.beginFill(color, 0.95)
      graphics.drawCircle(segmentPos.x, segmentPos.y, radius)
      graphics.endFill()
      
      // Обводка: чёрная с alpha 0.4 (как в оригинале Slither.io)
      graphics.lineStyle(2, 0x000000, 0.4)
      graphics.drawCircle(segmentPos.x, segmentPos.y, radius)
      graphics.lineStyle(0) // сброс
    }
  }
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

  // Shadow layer - отрисовка теней сегментов
  if (path.length >= 2) {
    const segmentRadius = lsz * 0.5
    drawSnakeSegments(ref.shadowGraphics, path, segmentRadius, 0, true, boost)
    ref.shadowGraphics.visible = true
  } else {
    ref.shadowGraphics.visible = false
  }

  // Body segments - отрисовка сегментов тела
  if (path.length >= 2) {
    const segmentRadius = lsz * 0.5
    drawSnakeSegments(ref.bodyGraphics, path, segmentRadius, skin.bodyColor, false, boost)
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
