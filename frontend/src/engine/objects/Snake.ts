/**
 * Snake — PixiJS объект змейки. Только отрисовка, без логики.
 */
import { Container, Graphics } from 'pixi.js'

export interface SnakeRenderState {
  headX: number
  headY: number
  tailSegments: number[]
  score: number
}

export class SnakeObject {
  private container: Container
  private head: Graphics
  private tail: Graphics

  constructor(container: Container) {
    this.container = container
    this.head = new Graphics()
    this.tail = new Graphics()
    this.container.addChild(this.head)
    this.container.addChild(this.tail)
  }

  update(_state: SnakeRenderState): void {
    this.head.clear()
    this.tail.clear()
    // TODO: отрисовка головы и хвоста по state
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
