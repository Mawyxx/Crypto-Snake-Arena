import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store'
import { useTelegram } from '@/features/auth'
import { useBalance } from '@/entities/balance'
import { useHaptic } from '@/features/haptic'
import { UserAvatar } from '@/entities/user'
import { IconRound } from '@/shared/ui'
import { setStoredLang, LANG_RU, LANG_EN, getTelegramUserFromInitData, type LangCode } from '@/shared/lib'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const lang = (i18n.language?.startsWith('en') ? LANG_EN : LANG_RU) as LangCode
  const handleClick = () => {
    const next = lang === LANG_RU ? LANG_EN : LANG_RU
    i18n.changeLanguage(next)
    setStoredLang(next)
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors active:scale-95"
    >
      <span className="text-[11px] font-bold">{lang.toUpperCase()}</span>
      <IconRound name="chevron_right" size={20} />
    </button>
  )
}

export const ProfileView = React.memo(function ProfileView() {
  const { refetch } = useBalance({ refetchOnMount: false })
  useEffect(() => {
    refetch()
  }, [refetch])

  const username = useGameStore((s) => s.username)
  const balance = useGameStore((s) => s.balance)
  const rank = useGameStore((s) => s.rank)
  const gamesPlayed = useGameStore((s) => s.gamesPlayed)
  const totalProfit = useGameStore((s) => s.totalProfit)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const vibrationEnabled = useGameStore((s) => s.vibrationEnabled)
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled)
  const setVibrationEnabled = useGameStore((s) => s.setVibrationEnabled)
  const { photoUrl, initData } = useTelegram()
  const { impact, notify } = useHaptic()

  const { t } = useTranslation()
  const tgUser = getTelegramUserFromInitData()
  const first = tgUser && tgUser.first_name ? tgUser.first_name : ''
  const last = tgUser && tgUser.last_name ? tgUser.last_name : ''
  const fullName = [first, last].filter(Boolean).join(' ').trim() || username || ''
  const handleStr = tgUser && tgUser.username ? '@' + tgUser.username : (username ? '@' + String(username).replace(/\s/g, '_').toLowerCase() : '')
  const bannerLine1 = fullName || t('leaderboard.player')
  const rankStr = gamesPlayed === 0 || rank === 0 ? '???' : String(rank)
  const bannerLine2 = handleStr ? `${handleStr} • Rank #${rankStr}` : `Rank #${rankStr}`

  const handleDeposit = async () => {
    impact('light')
    const { DEV_AUTO_CREDIT } = await import('@/config/dev')
    if (!initData?.trim()) {
      const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
      if (tg?.showAlert) tg.showAlert('Нет initData')
      return
    }
    if (!DEV_AUTO_CREDIT) {
      const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
      if (tg?.showAlert) tg.showAlert(t('common.deposit'))
      return
    }
    try {
      const { apiPost } = await import('@/shared/api')
      await apiPost('/api/dev/credit-500', {}, initData)
      refetch()
      notify('success')
      const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
      if (tg?.showAlert) tg.showAlert('+500 USDT')
    } catch (e) {
      const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
      const status = e && typeof e === 'object' && 'status' in e ? (e as { status: number }).status : 0
      const msg = status === 404
        ? 'DEV_AUTO_CREDIT=true в .env на сервере + systemctl restart crypto-snake-arena'
        : status === 401
          ? 'Ошибка авторизации'
          : t('common.deposit')
      if (tg?.showAlert) tg.showAlert(msg)
    }
  }

  const handleWithdraw = () => {
    const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
    if (tg?.showAlert) tg.showAlert(t('common.withdraw'))
  }

  return (
    <main className="flex-1 flex flex-col justify-start gap-3 pt-4 px-5 pb-bottom-bar">
      <section className="bg-gradient-to-br from-[#007AFF] via-[#0047a0] to-[#001a3d] rounded-2xl p-6 relative flex flex-col items-center justify-center overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center w-full min-w-0 px-1">
          <div className="w-24 h-24 rounded-full border-2 border-white/20 avatar-glow mb-3 overflow-hidden shrink-0 aspect-square">
            <UserAvatar src={photoUrl} name={username} size={92} objectPosition="55% 55%" className="rounded-full" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-white break-words text-center w-full leading-snug">
            {bannerLine1 || t('leaderboard.player')}
          </h2>
          <p className="text-[13px] font-medium text-white/60 mt-0.5">
            {bannerLine2}
          </p>
        </div>
      </section>

      <section className="bg-[#111111] rounded-2xl p-6 border border-white/5">
        <button
          type="button"
          className="flex flex-col items-center text-center mb-5 w-full cursor-pointer bg-transparent border-0 p-0"
          onClick={handleDeposit}
        >
          <span className="text-[10px] font-medium text-white/40 tracking-[0.2em] mb-1.5 uppercase">{t('profile.balance')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#22C55E] tracking-tight">
              {(Number(balance) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-white/30 uppercase tracking-widest">usdt</span>
          </div>
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDeposit}
            className="flex-1 bg-[#007AFF] text-white py-3.5 rounded-xl font-bold text-[11px] tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <IconRound name="add_circle" size={16} />
            {t('profile.deposit')}
          </button>
          <button
            type="button"
            onClick={handleWithdraw}
            className="flex-1 border border-white/10 text-white py-3.5 rounded-xl font-bold text-[11px] tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <IconRound name="file_upload" size={16} />
            {t('profile.withdraw')}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-[#111111] rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium text-white/40 tracking-widest mb-1 uppercase">{t('profile.gamesPlayed')}</span>
          <span className="text-2xl font-bold tracking-tight text-white">{gamesPlayed}</span>
        </div>
        <div className="bg-[#111111] rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium text-white/40 tracking-widest mb-1 uppercase">{t('profile.totalProfit')}</span>
          <span className={`text-2xl font-bold tracking-tight ${totalProfit >= 0 ? 'text-neon-green' : 'text-error'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
          </span>
        </div>
      </section>

      <section className="bg-[#111111] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconRound name="volume_up" size={20} className="text-[#007AFF]/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">{t('profile.soundEffects')}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 active:scale-95 ${soundEnabled ? 'bg-[#007AFF] justify-end' : 'bg-white/10 justify-start'}`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-sm flex-shrink-0" />
          </button>
        </div>
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconRound name="vibration" size={20} className="text-[#007AFF]/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">{t('profile.vibration')}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={vibrationEnabled}
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 active:scale-95 ${vibrationEnabled ? 'bg-[#007AFF] justify-end' : 'bg-white/10 justify-start'}`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-sm flex-shrink-0" />
          </button>
        </div>
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconRound name="language" size={20} className="text-[#007AFF]/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">{t('profile.language')}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </section>
    </main>
  )
})
