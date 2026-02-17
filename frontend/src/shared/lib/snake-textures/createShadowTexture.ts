/**
 * Dark texture for snake shadow layer (SimpleRope).
 */
import { Texture } from 'pixi.js'

const SHADOW_WIDTH = 128
const SHADOW_HEIGHT = 40

let shadowTextureCache: Texture | null = null

export function createShadowTexture(): Texture {
  if (shadowTextureCache) return shadowTextureCache

  const canvas = document.createElement('canvas')
  canvas.width = SHADOW_WIDTH
  canvas.height = SHADOW_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    shadowTextureCache = Texture.EMPTY
    return shadowTextureCache
  }

  const gradient = ctx.createRadialGradient(
    SHADOW_WIDTH / 2,
    SHADOW_HEIGHT / 2,
    0,
    SHADOW_WIDTH / 2,
    SHADOW_HEIGHT / 2,
    SHADOW_HEIGHT / 2
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.25)')
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT)

  shadowTextureCache = Texture.from(canvas)
  return shadowTextureCache
}
