export { SnakeObject, CoinObject, ArenaObject } from './objects'
export type { SnakeRenderState, CoinRenderState } from './objects'
export { lerp, interpolateSnake, InputHandler } from './systems'
export type { InterpolatedState, InputState } from './systems'
export {
  lerp as lerpNum,
  interpolatePosition,
  interpolateAngle,
} from './Interpolation'
export type { Point } from './Interpolation'
export { Viewport } from './viewport'
