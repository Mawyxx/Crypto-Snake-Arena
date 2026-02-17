/**
 * Creates a circular gradient texture for snake head.
 * Single shared texture (head tint applied via Sprite.tint if needed).
 */
import { Texture } from 'pixi.js'

const HEAD_SIZE = 64

let headTextureCache: Texture | null = null

export function createHeadTexture(): Texture {
  if (headTextureCache) return headTextureCache

  const canvas = document.createElement('canvas')
  canvas.width = HEAD_SIZE
  canvas.height = HEAD_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    headTextureCache = Texture.EMPTY
    return headTextureCache
  }

  const center = HEAD_SIZE / 2
  const radius = center - 2

  const gradient = ctx.createRadialGradient(
    center - radius * 0.3,
    center - radius * 0.3,
    0,
    center,
    center,
    radius
  )
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
  gradient.addColorStop(0.5, 'rgba(240, 240, 255, 0.9)')
  gradient.addColorStop(1, 'rgba(200, 200, 220, 0.85)')

  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.lineWidth = 2
  ctx.stroke()

  headTextureCache = Texture.from(canvas)
  return headTextureCache
}
