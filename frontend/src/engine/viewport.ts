/**
 * Viewport — камера и масштабирование.
 */
import type { Container } from 'pixi.js'

export class Viewport {
  private container: Container
  private scale = 1
  private offsetX = 0
  private offsetY = 0

  constructor(container: Container) {
    this.container = container
  }

  setScale(scale: number): void {
    this.scale = scale
    this.container.scale.set(scale)
  }

  setOffset(x: number, y: number): void {
    this.offsetX = x
    this.offsetY = y
    this.container.position.set(x, y)
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale,
    }
  }
}
