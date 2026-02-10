/**
 * Arena — PixiJS объект арены (фон, границы).
 */
import { Container, Graphics } from 'pixi.js'

export class ArenaObject {
  private container: Container
  private background: Graphics

  constructor(container: Container, _width: number, _height: number) {
    this.container = container
    this.background = new Graphics()
    this.container.addChild(this.background)
    this.draw(_width, _height)
  }

  private draw(_width: number, _height: number): void {
    this.background.clear()
    // TODO: фон и границы арены
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
