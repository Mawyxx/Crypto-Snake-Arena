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

// Константы для улучшенной визуализации
const BASE_RADIUS = 14.5 // Базовый радиус сегмента
const SPACING_RATIO = 0.25 // Коэффициент наслоения (расстояние между сегментами = radius * SPACING_RATIO)
const TAIL_TAPER_SEGMENTS = 20 // Количество сегментов хвоста для сужения
const HEAD_SWELL_SEGMENTS = 4 // Количество сегментов головы для увеличения
const HEAD_SWELL_FACTOR = 0.08 // Фактор увеличения головы
const HIGHLIGHT_RATIO = 0.85 // Радиус блика относительно основного круга (85%)
const HIGHLIGHT_BRIGHTNESS = 1.2 // Яркость блика (на 20% ярче)

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
 * Вычисляет яркость цвета для блика (делает цвет светлее).
 */
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

/**
 * Вычисляет расстояние между двумя точками.
 */
function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Отрисовывает сегменты змеи с улучшенной визуализацией (Slither.io style).
 * 
 * Особенности:
 * - Адаптивный spacing: сегменты рисуются только когда расстояние превышает порог
 * - Круг в круге: внешний круг + внутренний блик для объема
 * - Сужение хвоста: плавное уменьшение радиуса последних сегментов
 * - Оптимизация: группировка похожих сегментов
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
  
  // path[0] - голова, path[path.length-1] - хвост
  const totalSegments = path.length
  let lastDrawnPos: { x: number; y: number } | null = null
  const minSpacing = baseSegmentRadius * SPACING_RATIO
  
  // Итерируемся от хвоста к голове для правильного наслоения
  for (let i = path.length - 1; i >= 0; i--) {
    const point = path[i]
    const segmentIndexFromHead = i // 0 = голова, totalSegments-1 = хвост
    const segmentIndexFromTail = totalSegments - 1 - i // 0 = хвост, totalSegments-1 = голова
    
    // Адаптивный spacing: проверяем расстояние от последнего нарисованного сегмента
    if (lastDrawnPos !== null) {
      const dist = getDistance(lastDrawnPos, point)
      if (dist < minSpacing) {
        continue // Пропускаем этот сегмент, слишком близко к предыдущему
      }
    }
    
    // Вычисляем радиус с учетом позиции сегмента
    let radius = baseSegmentRadius
    
    // Swell для головы (первые HEAD_SWELL_SEGMENTS сегментов)
    if (segmentIndexFromHead < HEAD_SWELL_SEGMENTS) {
      radius = baseSegmentRadius * (1 + (HEAD_SWELL_SEGMENTS - segmentIndexFromHead) * HEAD_SWELL_FACTOR)
    }
    // Сужение хвоста (последние TAIL_TAPER_SEGMENTS сегментов)
    else if (segmentIndexFromTail < TAIL_TAPER_SEGMENTS) {
      const taperFactor = segmentIndexFromTail / TAIL_TAPER_SEGMENTS
      // Плавное уменьшение от baseSegmentRadius до baseSegmentRadius * 0.3
      radius = baseSegmentRadius * (0.3 + taperFactor * 0.7)
    }
    
    if (isShadow) {
      // Тень: чёрный круг с увеличенным радиусом
      graphics.beginFill(0x000000, boost ? 0.5 : 0.3)
      graphics.drawCircle(point.x, point.y, radius + 5)
      graphics.endFill()
    } else {
      // Тело: внешний круг с основным цветом
      graphics.beginFill(color, 0.95)
      graphics.drawCircle(point.x, point.y, radius)
      graphics.endFill()
      
      // Блик: внутренний круг чуть меньшего радиуса с более светлым оттенком
      const highlightRadius = radius * HIGHLIGHT_RATIO
      const highlightColor = brightenColor(color, HIGHLIGHT_BRIGHTNESS)
      graphics.beginFill(highlightColor, 0.6)
      graphics.drawCircle(point.x, point.y, highlightRadius)
      graphics.endFill()
      
      // Обводка: чёрная с alpha 0.4 (как в оригинале Slither.io)
      graphics.lineStyle(2, 0x000000, 0.4)
      graphics.drawCircle(point.x, point.y, radius)
      graphics.lineStyle(0) // сброс
    }
    
    // Обновляем позицию последнего нарисованного сегмента
    lastDrawnPos = point
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
  
  // Нелинейный рост (жирность): логарифмическая зависимость от массы
  // Используем формулу: BASE_RADIUS * (1 + sqrt(bodyLen) / коэффициент)
  // Это дает ощутимый рост толщины с увеличением длины
  const growthFactor = 1 + Math.sqrt(bodyLen) / 15
  const baseRadius = BASE_RADIUS * Math.min(growthFactor, 3.5) // Ограничиваем максимальный рост
  
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
