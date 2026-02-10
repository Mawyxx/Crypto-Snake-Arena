import { useEffect, useState } from 'react'
import { useHaptic } from '@/hooks/useHaptic'
import { useGameStore } from '@/store'
import { getUserIdFromInitData } from '@/lib/telegramInit'
import { useConfig } from '@/hooks/useConfig'
import { Copy } from 'lucide-react'

// Username бота. Укажи в .env.local: VITE_TELEGRAM_BOT_USERNAME=ТвойБот
const FALLBACK_BOT = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'GorillaCaseBot'

export function FrensView() {
  const { impact, notify } = useHaptic()
  const { refetch } = useConfig()
  const { referralInvited, referralEarned, botUsername } = useGameStore()
  const bot = botUsername || FALLBACK_BOT

  // Повторный запрос конфига при открытии вкладки, если бот ещё не загружен
  useEffect(() => {
    if (!botUsername) refetch()
  }, [botUsername, refetch])
  const tgId = getUserIdFromInitData()
  const referralLink = tgId && bot ? `https://t.me/${bot}?start=r_${tgId}` : ''
  const [copied, setCopied] = useState(false)

  const handleInvite = () => {
    impact('light')
    const openLink = window.Telegram?.WebApp?.openTelegramLink
    if (openLink && referralLink) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Играй в Crypto Snake Arena! Приглашай друзей — получай 30% нашей прибыли')}`
      openLink(shareUrl)
    } else if (navigator.share && referralLink) {
      navigator.share({
        title: 'Crypto Snake Arena',
        text: 'Играй в Crypto Snake Arena! Приглашай друзей — получай 30% нашей прибыли',
        url: referralLink,
      })
    } else if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      notify('success')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopy = () => {
    impact('light')
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      notify('success')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overscroll-contain touch-auto bg-[var(--bg-main)] pb-bottom-bar">
      <div className="shrink-0 p-5 pb-8">
        <h1 className="text-xl font-bold text-white mb-8 leading-tight">
          Приглашай друзей — получай <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">30%</span> нашей прибыли
        </h1>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 card-premium-elevated p-5 rounded-2xl border border-white/[0.06]">
            <p className="text-3xl font-extrabold text-white tabular-nums">{referralInvited}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">Приглашено</p>
          </div>
          <div className="flex-1 card-premium-elevated p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
            <p className="text-2xl font-extrabold text-[var(--accent-emerald)] tabular-nums">
              {referralEarned.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">Заработано <span className="text-[var(--accent-emerald)]/80">USDT</span></p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleInvite}
            className="flex-1 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-600 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
          >
            Пригласить
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="w-14 h-14 shrink-0 rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] flex items-center justify-center text-white active:scale-95 transition-all hover:border-white/15"
            title="Копировать ссылку"
          >
            <Copy size={22} className={copied ? 'text-emerald-400' : ''} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
