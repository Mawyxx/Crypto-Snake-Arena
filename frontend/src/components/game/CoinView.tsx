import { memo, useCallback } from 'react'
import { Graphics } from '@pixi/react'
import type { Graphics as PixiGraphics } from 'pixi.js'
import type { game } from '@/shared/api/proto/game'

// Slither.io: разноцветные светящиеся орбы (как на скрине)
const ORB_COLORS = [
  0xff4040, 0xff9060, 0xeeee70, 0x80ff80, 0x80d0ff, 0xc080ff, 0xff80c0, 0xffffff,
]

interface CoinViewProps {
  coin: game.ICoin
}

function getOrbColor(coinId: string | null | undefined): number {
  if (!coinId) return 0xffdd00
  let hash = 0
  for (let i = 0; i < coinId.length; i++) hash = (hash << 5) - hash + coinId.charCodeAt(i)
  return ORB_COLORS[Math.abs(hash) % ORB_COLORS.length]
}

function areCoinPropsEqual(prev: CoinViewProps, next: CoinViewProps): boolean {
  const prevCoin = prev.coin
  const nextCoin = next.coin
  if ((prevCoin?.id ?? '') !== (nextCoin?.id ?? '')) return false
  const prevPos = prevCoin?.pos
  const nextPos = nextCoin?.pos
  if (Math.round(prevPos?.x ?? 0) !== Math.round(nextPos?.x ?? 0)) return false
  if (Math.round(prevPos?.y ?? 0) !== Math.round(nextPos?.y ?? 0)) return false
  if ((prevCoin?.consumingSnakeId ?? 0) !== (nextCoin?.consumingSnakeId ?? 0)) return false
  if ((nextCoin?.consumingSnakeId ?? 0) !== 0) return false // when consuming, always re-render for pulse
  return Math.round((prevCoin?.value ?? 0) * 100) === Math.round((nextCoin?.value ?? 0) * 100)
}

/** Slither.io style: светящиеся орбы. When consuming — pulse toward head (constraint animation). */
const CoinViewInner = ({ coin }: CoinViewProps) => {
  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear()

      const pos = coin.pos
      if (!pos || pos.x == null || pos.y == null) return

      const x = pos.x
      const y = pos.y
      const value = coin.value ?? 0
      const baseRadius = 4 + Math.min(value * 0.2, 2)
      const consuming = (coin.consumingSnakeId ?? 0) !== 0
      // Pulse scale when being consumed (slither-clone: food moves toward head)
      const pulse = consuming ? 1 + Math.sin(Date.now() / 100) * 0.15 : 1
      const radius = baseRadius * pulse
      const color = getOrbColor(coin.id ?? '')

      // Скрин: яркие светящиеся орбы с мягким ореолом
      g.beginFill(color, consuming ? 0.25 : 0.18)
      g.drawCircle(x, y, radius + 12)
      g.endFill()
      g.beginFill(color, consuming ? 0.55 : 0.4)
      g.drawCircle(x, y, radius + 6)
      g.endFill()
      g.beginFill(color, 0.95)
      g.drawCircle(x, y, radius)
      g.endFill()
      // Блик для объёма
      g.beginFill(0xffffff, 0.7)
      g.drawCircle(x - radius * 0.3, y - radius * 0.3, radius * 0.4)
      g.endFill()
    },
    [coin]
  )

  return <Graphics draw={draw} />
}

export const CoinView = memo(CoinViewInner, areCoinPropsEqual)
