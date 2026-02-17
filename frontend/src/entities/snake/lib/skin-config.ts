/**
 * Skin configuration for snake rendering (colors, GlowFilter params).
 * Matches slither.io palette.
 */

const SNAKE_COLORS = [
  0xc080ff, 0x9099ff, 0x80d0d0, 0x80ff80, 0xeeee70, 0xffa060, 0xff9090, 0xff4040, 0xe030e0,
]

const LOCAL_PLAYER_COLOR = 0xc080ff

export interface SnakeSkinConfig {
  bodyColor: number
  glowColor: number
  glowDistance: number
  glowOuterStrength: number
  boostGlowOuterStrength: number
}

export function getSkinConfig(skinId: number, isLocalPlayer: boolean): SnakeSkinConfig {
  const bodyColor = isLocalPlayer ? LOCAL_PLAYER_COLOR : SNAKE_COLORS[Math.abs(skinId) % SNAKE_COLORS.length]
  return {
    bodyColor,
    glowColor: bodyColor,
    glowDistance: 15,
    glowOuterStrength: 2,
    boostGlowOuterStrength: 5,
  }
}

export function getSnakeColor(skinIdOrSnakeId: number | null | undefined): number {
  if (skinIdOrSnakeId == null) return LOCAL_PLAYER_COLOR
  const id = Number(skinIdOrSnakeId)
  return SNAKE_COLORS[Math.abs(id) % SNAKE_COLORS.length]
}
