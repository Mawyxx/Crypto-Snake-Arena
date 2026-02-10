import type { FC } from 'react'
import { useGameStore } from '@/store'

export const GameHUD: FC = () => {
  const balance = useGameStore((s) => s.balance)
  const score = 0 // TODO: из engine/state

  return (
    <div className="game-hud">
      <span>Баланс: <span className="tabular-nums">{balance.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span> <span className="text-[#26a17b]/90 text-xs">USDT</span></span>
      <span>Счёт: {score}</span>
    </div>
  )
}
