
import type { FC } from 'react'
import { useGameStore } from '@/store'

export const Menu: FC = () => {
  const setInGame = useGameStore((s) => s.setInGame)

  return (
    <div className="menu">
      <button type="button" onClick={() => setInGame(true)}>
        Найти игру
      </button>
      {/* TODO: "Баланс", "Пополнить" */}
    </div>
  )
}
