/**
 * Zustand store: экраны, баланс, профиль, игра.
 */
import { create } from 'zustand'

export type Screen = 'home' | 'leaderboard' | 'frens' | 'profile' | 'game'

interface GameState {
  screen: Screen
  balance: number
  username: string | null
  userId: number | null
  botUsername: string | null
  referralInvited: number
  referralEarned: number
  gamesPlayed: number
  totalDeposited: number
  totalWithdrawn: number
  totalProfit: number
  onlineCount: number
  activePlayers7d: number
  inGame: boolean
  bet: number
  highScore: number
  rank: number
  soundEnabled: boolean
  vibrationEnabled: boolean

  setScreen: (screen: Screen) => void
  setBalance: (balance: number) => void
  setProfile: (username: string, userId: number) => void
  setBotUsername: (username: string | null) => void
  setReferralStats: (invited: number, earned: number) => void
  setProfileStats: (games: number, deposited: number, withdrawn: number) => void
  setTotalProfit: (profit: number) => void
  setStats: (online: number, active7d: number) => void
  setInGame: (inGame: boolean) => void
  setBet: (bet: number) => void
  setHighScore: (score: number) => void
  setRank: (rank: number) => void
  setSoundEnabled: (v: boolean) => void
  setVibrationEnabled: (v: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'home',
  balance: 0,
  username: null,
  userId: null,
  botUsername: null,
  referralInvited: 0,
  referralEarned: 0,
  gamesPlayed: 0,
  totalDeposited: 0,
  totalWithdrawn: 0,
  totalProfit: 0,
  onlineCount: 0,
  activePlayers7d: 0,
  inGame: false,
  bet: 50,
  highScore: 0,
  rank: 0,
  soundEnabled: true,
  vibrationEnabled: true,

  setScreen: (screen) => set({ screen }),
  setBalance: (balance) => set({ balance }),
  setProfile: (username, userId) => set({ username, userId }),
  setBotUsername: (botUsername) => set({ botUsername }),
  setReferralStats: (referralInvited, referralEarned) => set({ referralInvited, referralEarned }),
  setProfileStats: (gamesPlayed, totalDeposited, totalWithdrawn) => set({ gamesPlayed, totalDeposited, totalWithdrawn }),
  setTotalProfit: (totalProfit) => set({ totalProfit }),
  setStats: (onlineCount, activePlayers7d) => set({ onlineCount, activePlayers7d }),
  setInGame: (inGame) => set({ inGame }),
  setBet: (bet) => set({ bet }),
  setHighScore: (highScore) => set({ highScore }),
  setRank: (rank) => set({ rank }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
}))
