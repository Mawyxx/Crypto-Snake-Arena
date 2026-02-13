import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui'

export interface GameOverOverlayProps {
  visible: boolean
  score: number
  bet: number
  onRetry: () => void
  onGoHome: () => void
}

export function GameOverOverlay({ visible, score, bet, onRetry, onGoHome }: GameOverOverlayProps) {
  const { t } = useTranslation()
  const handleShare = () => {
    const text = encodeURIComponent(t('gameOver.shareText', { score }))
    const url = encodeURIComponent(window.location.href)
    const shareUrl = `https://t.me/share/url?url=${url}&text=${text}`
    const openLink = window.Telegram?.WebApp?.openTelegramLink
    if (openLink) {
      openLink(shareUrl)
    } else if (navigator.share) {
      navigator.share({
        title: 'Crypto Snake Arena',
        text: t('gameOver.shareText', { score }),
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)]/98 backdrop-blur-xl"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm flex flex-col items-center gap-6"
          >
            <h1 className="text-2xl font-black text-white text-center tracking-tight">
              {t('gameOver.title')}
            </h1>

            <div className="w-full space-y-3 card-premium-elevated p-5 rounded-2xl">
              <p className="text-center text-white">
                {t('gameOver.coinsCollected')}: <span className="font-bold text-lg">{score}</span>
              </p>
              <p className="text-center text-[var(--text-secondary)] font-medium">
                {t('gameOver.lostStake')}: <span className="text-white font-semibold tabular-nums">
                  {(bet / 100).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="ml-1 text-[10px] text-[var(--accent-emerald)]/80 uppercase font-semibold">USDT</span>
              </p>
            </div>

            <div className="w-full space-y-3">
              <Button fullWidth size="lg" onClick={onRetry}>
                {t('gameOver.tryAgain')}
              </Button>
              <button
                type="button"
                onClick={onGoHome}
                className="w-full py-2.5 text-sm text-[var(--text-secondary)] font-medium hover:text-white transition-colors"
              >
                {t('common.toMainMenu')}
              </button>
              <Button variant="secondary" fullWidth size="md" onClick={handleShare}>
                {t('gameOver.shareRecord')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
