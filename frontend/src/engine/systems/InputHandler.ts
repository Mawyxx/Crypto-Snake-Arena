/**
 * InputHandler — сбор ввода (angle, boost) и отправка на сервер.
 * Single Responsibility: только ввод и вызов callback.
 */
export interface InputState {
  angle: number
  boost: boolean
}

export type InputCallback = (state: InputState) => void

export class InputHandler {
  private callback: InputCallback | null = null
  private currentAngle = 0
  private boost = false

  setCallback(cb: InputCallback): void {
    this.callback = cb
  }

  setAngle(angle: number): void {
    this.currentAngle = angle
    this.emit()
  }

  setBoost(boost: boolean): void {
    this.boost = boost
    this.emit()
  }

  private emit(): void {
    this.callback?.({
      angle: this.currentAngle,
      boost: this.boost,
    })
  }
}
