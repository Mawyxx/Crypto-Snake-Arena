/**
 * Coin — PixiJS объект монеты. Только отрисовка.
 */
import { Container, Graphics } from 'pixi.js'

export interface CoinRenderState {
  x: number
  y: number
  value: number
}

export class CoinObject {
  private container: Container
  private graphics: Graphics

  constructor(container: Container) {
    this.container = container
    this.graphics = new Graphics()
    this.container.addChild(this.graphics)
  }

  update(_state: CoinRenderState): void {
    this.graphics.clear()
    // TODO: отрисовка монеты (цвет/размер могут слегка варьироваться визуально)
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
