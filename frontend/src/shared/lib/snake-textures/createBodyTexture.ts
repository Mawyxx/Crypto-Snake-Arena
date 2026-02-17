/**
 * Creates a radial gradient texture for snake body (SimpleRope).
 * Cached by color to avoid recreation.
 */
import { Texture } from 'pixi.js'

/** Texture dimensions; height defines SimpleRope thickness (segment width). */
export const BODY_TEXTURE_WIDTH = 128
export const BODY_TEXTURE_HEIGHT = 32

const textureCache = new Map<number, Texture>()

function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: ((hex >> 16) & 0xff) / 255,
    g: ((hex >> 8) & 0xff) / 255,
    b: (hex & 0xff) / 255,
  }
}

export function createBodyTexture(color: number): Texture {
  const cached = textureCache.get(color)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = BODY_TEXTURE_WIDTH
  canvas.height = BODY_TEXTURE_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const tex = Texture.EMPTY
    textureCache.set(color, tex)
    return tex
  }

  const { r, g, b } = hexToRgb(color)
  const centerX = BODY_TEXTURE_WIDTH / 2
  const centerY = BODY_TEXTURE_HEIGHT / 2
  const radius = Math.min(BODY_TEXTURE_WIDTH, BODY_TEXTURE_HEIGHT) / 2

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  )
  gradient.addColorStop(0, `rgba(${r * 255}, ${g * 255}, ${b * 255}, 0.95)`)
  gradient.addColorStop(0.5, `rgba(${r * 255}, ${g * 255}, ${b * 255}, 0.85)`)
  gradient.addColorStop(1, `rgba(${r * 255}, ${g * 255}, ${b * 255}, 0.6)`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, BODY_TEXTURE_WIDTH, BODY_TEXTURE_HEIGHT)

  const texture = Texture.from(canvas)
  textureCache.set(color, texture)
  return texture
}
