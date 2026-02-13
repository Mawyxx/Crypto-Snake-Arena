import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store'
import { useTelegram } from '@/features/auth'
import { useBalance } from '@/entities/balance'
import { UserAvatar } from '@/entities/user'
import { IconRound } from '@/shared/ui'
import { setStoredLang, LANG_RU, LANG_EN, type LangCode } from '@/shared/lib'

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
  const { photoUrl } = useTelegram()

  const { t } = useTranslation()
  const handleDeposit = () => {
    const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
    if (tg?.showAlert) tg.showAlert(t('common.deposit'))
  }

  const handleWithdraw = () => {
    const tg = (window as { Telegram?: { WebApp?: { showAlert?: (m: string) => void } } }).Telegram?.WebApp
    if (tg?.showAlert) tg.showAlert(t('common.withdraw'))
  }

  return (
    <main className="flex-1 flex flex-col justify-start gap-3 mt-2 px-4 pb-bottom-bar">
      <section className="hero-banner rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center card-border">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 p-1 avatar-glow mb-3 overflow-hidden">
            <UserAvatar src={photoUrl} name={username} size={72} className="rounded-full" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white truncate max-w-full">
            {username || ''}
          </h2>
          <p className="text-[13px] font-medium text-white/60">
            {(username ? `@${String(username).replace(/\s/g, '_').toLowerCase().slice(0, 20)} • ` : '')}{t('profile.rank', { rank: rank || 0 })}
          </p>
        </div>
      </section>

      <section className="bg-[var(--bg-menu-card)] rounded-2xl p-6 card-border">
        <div className="flex flex-col items-center text-center mb-5">
          <span className="text-[10px] font-medium text-white/40 tracking-[0.2em] mb-1.5 uppercase">{t('profile.balance')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-neon-green tracking-tight tabular-nums">
              {(Number(balance) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-white/30 uppercase tracking-widest">usdt</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDeposit}
            className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[11px] tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
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
        <div className="bg-[var(--bg-menu-card)] rounded-2xl p-5 card-border flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium text-white/40 tracking-widest mb-1 uppercase">{t('profile.gamesPlayed')}</span>
          <span className="text-2xl font-bold tracking-tight text-white tabular-nums">{gamesPlayed}</span>
        </div>
        <div className="bg-[var(--bg-menu-card)] rounded-2xl p-5 card-border flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium text-white/40 tracking-widest mb-1 uppercase">{t('profile.totalProfit')}</span>
          <span className={`text-2xl font-bold tracking-tight tabular-nums ${totalProfit >= 0 ? 'text-neon-green' : 'text-error'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
          </span>
        </div>
      </section>

      <section className="bg-[var(--bg-menu-card)] rounded-2xl card-border divide-y divide-white/5 overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconRound name="volume_up" size={20} className="text-primary/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">{t('profile.soundEffects')}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 [transition-timing-function:var(--ease-smooth)] active:scale-95 ${soundEnabled ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 [transition-timing-function:var(--ease-smooth)] ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconRound name="vibration" size={20} className="text-primary/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">{t('profile.vibration')}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={vibrationEnabled}
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 [transition-timing-function:var(--ease-smooth)] active:scale-95 ${vibrationEnabled ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 [transition-timing-function:var(--ease-smooth)] ${
                vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconRound name="language" size={20} className="text-primary/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">{t('profile.language')}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </section>
    </main>
  )
})
