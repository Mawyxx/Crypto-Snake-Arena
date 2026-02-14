import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHaptic } from '@/features/haptic'
import { useGameStore } from '@/store'
import { useReferrals } from '@/features/referrals'
import { UserAvatar } from '@/entities/user'
import { Icon } from '@/shared/ui'
import { getUserIdFromInitData } from '@/shared/lib'
import { useConfig } from '@/hooks/useConfig'
import { formatRelativeTime } from '@/features/game-history'

const FALLBACK_BOT = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'CryptoSnakeArena_Bot'

export const FrensView = React.memo(function FrensView() {
  const { t, i18n } = useTranslation()
  const { impact, notify } = useHaptic()
  const { refetch } = useConfig()
  const { entries, loading, error, refetch: refetchReferrals } = useReferrals({ limit: 20 })
  const { referralInvited, referralEarned, botUsername } = useGameStore()
  const bot = botUsername || FALLBACK_BOT

  useEffect(() => {
    if (!botUsername) refetch()
  }, [botUsername, refetch])

  const tgId = getUserIdFromInitData()
  const referralLink = tgId && bot ? `https://t.me/${bot}?startapp=r_${tgId}` : ''
  const [copied, setCopied] = useState(false)

  const handleInvite = () => {
    impact?.('light')
    const openLink = window.Telegram?.WebApp?.openTelegramLink
    if (openLink && referralLink) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(t('frens.shareText'))}`
      openLink(shareUrl)
    } else if (navigator.share && referralLink) {
      navigator.share({
        title: 'Crypto Snake Arena',
        text: t('frens.shareText'),
        url: referralLink,
      }).catch(() => { notify?.('error') })
    } else if (referralLink) {
      navigator.clipboard.writeText(referralLink).then(() => {
        notify?.('success')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => { notify?.('error') })
    }
  }

  const handleCopy = () => {
    impact?.('light')
    if (referralLink) {
      navigator.clipboard.writeText(referralLink).then(() => {
        notify?.('success')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => { notify?.('error') })
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-bottom-bar">
      <div className="px-5 pt-6 pb-2">
        <div className="bg-gradient-to-br from-[#007AFF] via-[#0060FF] to-[#004BDD] rounded-[28px] p-7 relative overflow-hidden shadow-[0_15px_45px_rgba(0,122,255,0.4)]">
          <div className="absolute inset-0 banner-pattern opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/15" />
          <div className="absolute -right-6 -bottom-6 opacity-30 -rotate-12 pointer-events-none z-0">
            <Icon name="card_giftcard" size={140} className="text-white leading-none" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white text-premium">
              {t('frens.earn30')} 30%
            </h1>
            <p className="text-white/80 text-sm mt-1.5 max-w-[220px] font-medium leading-relaxed">
              {t('frens.fromCommissions')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3">
        <div className="bg-[#111111] border border-white/5 rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 bg-[#1a1a1a] rounded-2xl px-5 py-4 border border-white/5 overflow-hidden">
              <span className="text-primary font-semibold text-sm tracking-tight truncate block">
                {referralLink ? `${referralLink.slice(0, 24)}...` : '—'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="bg-primary hover:bg-primary/90 transition-colors w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 active:scale-95"
            >
              <Icon name="content_copy" size={24} className={copied ? 'text-neon-green' : 'text-white'} />
            </button>
          </div>
          <p className="text-[10px] text-white/30 mt-4 uppercase tracking-[0.15em] text-center font-bold">
            {t('frens.shareLinkHint')}
          </p>
        </div>
      </div>

      <div className="px-5 py-2">
        <button
          type="button"
          onClick={handleInvite}
          className="w-full h-16 rounded-[28px] flex items-center justify-center gap-3 active:scale-95 transition-all bg-[rgba(0,122,255,0.1)] border border-white/5 backdrop-blur-sm"
        >
          <Icon name="share" size={20} className="text-[#007AFF] font-bold" />
          <span className="font-bold text-white text-base tracking-tight uppercase">{t('frens.inviteFriends')}</span>
        </button>
      </div>

      <div className="px-5 py-3 grid grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-[28px] p-6 flex flex-col justify-between h-32">
          <span className="text-[10px] text-white/40 font-bold tracking-[0.1em] uppercase">{t('frens.totalFriends')}</span>
          <span className="text-3xl font-bold text-premium text-white">{referralInvited}</span>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-[28px] p-6 flex flex-col justify-between h-32">
          <span className="text-[10px] text-white/40 font-bold tracking-[0.1em] uppercase">{t('frens.earned')}</span>
          <span className="text-3xl font-bold text-[#007AFF] text-premium">
            ${referralEarned.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-[11px] font-bold text-white/30 tracking-[0.2em] uppercase">{t('frens.yourNetwork')}</h2>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-[28px] overflow-hidden">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-5 border-b border-white/5 opacity-50">
                  <div className="w-11 h-11 rounded-full bg-white/10 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3 w-20 bg-white/10 animate-pulse rounded" />
                    <div className="h-2.5 w-28 bg-white/10 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-14 bg-white/10 animate-pulse rounded shrink-0" />
                </div>
              ))}
            </>
          ) : error ? (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-white/40">{error}</p>
              <button
                type="button"
                onClick={() => { impact?.('light'); refetchReferrals() }}
                className="mt-3 text-[11px] font-bold text-primary uppercase tracking-wider"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-white/40">{t('frens.invitedHere')}</p>
            </div>
          ) : (
            entries.map((entry, i) => (
              <div
                key={entry.referred_id ? `ref-${entry.referred_id}` : `ref-i-${i}`}
                className="flex items-center gap-4 p-5 border-b border-white/5 last:border-0"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <UserAvatar src={entry.avatar_url ?? undefined} name={entry.display_name} size={44} className="rounded-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white text-premium truncate">{entry.display_name || ''}</h4>
                  <p className="text-[11px] text-secondary mt-0.5 font-medium">
                    {t('frens.joined', { time: formatRelativeTime(entry.joined_at, t, i18n.language) })}
                  </p>
                </div>
                <div className="text-[#22C55E] font-bold text-sm tracking-tight shrink-0">
                  +${entry.earned_from.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
})
