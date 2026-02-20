import type { SnapshotFrame, ISnapshotBuffer } from './types'
import { interpolatePosition, interpolateAngle } from '@/shared/lib/interpolation'

const MAX_FRAMES = 16
const MAX_AGE_MS = 300

export class RingSnapshotBuffer implements ISnapshotBuffer {
  private frames: SnapshotFrame[] = []

  push(frame: SnapshotFrame): void {
    this.frames.push(frame)
    if (this.frames.length > MAX_FRAMES) {
      this.frames.shift()
    }
  }

  getInterpolated(renderTime: number): SnapshotFrame | null {
    const cutoff = renderTime - MAX_AGE_MS
    this.frames = this.frames.filter((f) => f.timestamp >= cutoff)
    if (this.frames.length === 0) return null
    if (this.frames.length === 1) return this.frames[0]

    let prev = this.frames[0]
    let curr = this.frames[0]
    for (let i = 0; i < this.frames.length - 1; i++) {
      if (this.frames[i + 1].timestamp <= renderTime) {
        prev = this.frames[i]
        curr = this.frames[i + 1]
      }
    }
    if (curr.timestamp <= renderTime) {
      return curr
    }
    if (prev.timestamp > renderTime) {
      return prev
    }

    const dt = curr.timestamp - prev.timestamp
    const alpha = dt > 0 ? (renderTime - prev.timestamp) / dt : 1
    const alphaClamped = Math.max(0, Math.min(1, alpha))

    const interpolatedSnakes = (curr.snakes ?? []).map((curSnake) => {
      const prevSnake = prev.snakes?.find((s) => Number(s.id) === Number(curSnake.id))
      if (!prevSnake?.head || !curSnake.head) {
        return { ...curSnake, head: curSnake.head ?? { x: 0, y: 0 }, angle: curSnake.angle ?? 0 }
      }
      const head = interpolatePosition(
        prevSnake.head as { x: number; y: number },
        curSnake.head as { x: number; y: number },
        alphaClamped
      )
      const angle = interpolateAngle(
        prevSnake.angle ?? 0,
        curSnake.angle ?? 0,
        alphaClamped
      )
      const prevBody = prevSnake.body ?? []
      const currBody = curSnake.body ?? []
      const body = currBody.map((curP, i) => {
        const prevP = prevBody[i]
        if (!prevP) return curP as { x: number; y: number }
        return interpolatePosition(
          prevP as { x: number; y: number },
          curP as { x: number; y: number },
          alphaClamped
        )
      })
      return { ...curSnake, head, angle, body }
    })

    return {
      tick: Math.round(prev.tick + (curr.tick - prev.tick) * alphaClamped),
      timestamp: renderTime,
      snakes: interpolatedSnakes,
      coins: alphaClamped < 0.5 ? prev.coins : curr.coins,
    }
  }

  getInterpolationInput(renderTime: number): import('./types').InterpolationInput | null {
    const cutoff = renderTime - MAX_AGE_MS
    this.frames = this.frames.filter((f) => f.timestamp >= cutoff)
    if (this.frames.length < 2) return null
    let prev = this.frames[0]
    let curr = this.frames[0]
    for (let i = 0; i < this.frames.length - 1; i++) {
      if (this.frames[i + 1].timestamp <= renderTime) {
        prev = this.frames[i]
        curr = this.frames[i + 1]
      }
    }
    if (curr.timestamp <= renderTime) {
      const last = this.frames[this.frames.length - 1]
      const secondLast = this.frames[this.frames.length - 2]
      return { prev: secondLast, curr: last, alpha: 1 }
    }
    if (prev.timestamp > renderTime) return { prev: this.frames[0], curr: this.frames[1], alpha: 0 }
    const dt = curr.timestamp - prev.timestamp
    const alpha = dt > 0 ? Math.max(0, Math.min(1, (renderTime - prev.timestamp) / dt)) : 0
    return { prev, curr, alpha }
  }

  clear(): void {
    this.frames = []
  }
}
