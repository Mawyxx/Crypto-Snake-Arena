import { memo, useCallback } from 'react'
import { Graphics } from '@pixi/react'
import type * as PIXI from 'pixi.js'
import type { game } from '@/shared/api/proto/game'

// Точная палитра slither.io (первые 9 цветов из per_color_imgs)
const ORB_COLORS = [
  0xc080ff, 0x9099ff, 0x80d0d0, 0x80ff80, 0xeeee70, 0xffa060, 0xff9090, 0xff4040, 0xe030e0,
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
  const a = prev.coin
  const b = next.coin
  if ((a?.id ?? '') !== (b?.id ?? '')) return false
  const ap = a?.pos
  const bp = b?.pos
  if (Math.round(ap?.x ?? 0) !== Math.round(bp?.x ?? 0)) return false
  if (Math.round(ap?.y ?? 0) !== Math.round(bp?.y ?? 0)) return false
  return Math.round((a?.value ?? 0) * 100) === Math.round((b?.value ?? 0) * 100)
}

/** Slither.io style: светящиеся орбы */
const CoinViewInner = ({ coin }: CoinViewProps) => {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()

      const pos = coin.pos
      if (!pos || pos.x == null || pos.y == null) return

      const x = pos.x
      const y = pos.y
      const value = coin.value ?? 0
      const radius = 4 + Math.min(value * 0.2, 2)
      const color = getOrbColor(coin.id ?? '')

      // Slither.io: многослойное свечение как в оригинале
      g.beginFill(color, 0.15)
      g.drawCircle(x, y, radius + 8)
      g.endFill()
      g.beginFill(color, 0.4)
      g.drawCircle(x, y, radius + 4)
      g.endFill()
      g.beginFill(color, 0.9)
      g.drawCircle(x, y, radius)
      g.endFill()
      // Блик сверху-слева
      g.beginFill(0xffffff, 0.85)
      g.drawCircle(x - radius * 0.25, y - radius * 0.25, radius * 0.35)
      g.endFill()
    },
    [coin]
  )

  return <Graphics draw={draw} />
}

export const CoinView = memo(CoinViewInner, areCoinPropsEqual)
