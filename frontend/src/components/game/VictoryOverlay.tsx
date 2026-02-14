import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui'
import { designTokens } from '@/shared/config'

const CONFETTI_COLORS = ['#fbbf24', designTokens.colorSuccess, '#60a5fa', '#f472b6', '#a78bfa']

const CONFETTI_PIECES = CONFETTI_COLORS.flatMap((color, colorIndex) =>
  Array.from({ length: 3 }, (_, replicaIndex) => ({
    id: `confetti-${color}-${colorIndex}-${replicaIndex}`,
    color,
    left: 20 + colorIndex * 20 + replicaIndex * 10,
    replicaIndex,
    colorIndex,
  }))
)

export interface VictoryOverlayProps {
  visible: boolean
  reward: number
  newBalance: number
  onCollect: () => void
}

export function VictoryOverlay({ visible, reward, newBalance, onCollect }: VictoryOverlayProps) {
  const { t } = useTranslation()
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)]/98 backdrop-blur-xl overflow-hidden"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {/* Конфетти */}
          {CONFETTI_PIECES.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  left: `${piece.left}%`,
                  top: -10,
                  backgroundColor: piece.color,
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: '100vh',
                  opacity: 0,
                  rotate: 360 * (piece.replicaIndex % 2 === 0 ? 1 : -1),
                }}
                transition={{
                  duration: 2 + piece.replicaIndex * 0.5,
                  delay: piece.colorIndex * 0.1 + piece.replicaIndex * 0.2,
                }}
              />
          ))}

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm flex flex-col items-center gap-6 relative z-10"
          >
            <h1 className="text-2xl font-black text-white text-center drop-shadow-lg tracking-tight">
              {t('victory.title')}
            </h1>

            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom right, ${designTokens.colorSuccess}4D, ${designTokens.colorSuccess}1A)`,
              border: `1px solid ${designTokens.colorSuccess}66`,
              boxShadow: `0 10px 15px -3px ${designTokens.colorSuccess}33, 0 4px 6px -2px ${designTokens.colorSuccess}20`,
            }}
            >
              <span className="text-2xl font-bold uppercase tracking-wider" style={{ color: designTokens.colorSuccess }}>$</span>
            </motion.div>

            <div className="w-full space-y-3 card-premium-elevated p-5 rounded-2xl">
              <p className="text-center text-neon-green font-bold text-xl">
                {t('victory.netProfit')}: +<span className="tabular-nums">{reward.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
                <span className="ml-1 text-sm font-semibold text-neon-green/90">USDT</span>
              </p>
              <p className="text-center text-[var(--text-secondary)]">
                {t('victory.finalBalance')}: <span className="text-white font-semibold tabular-nums">{newBalance.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
                <span className="ml-1 text-xs text-neon-green/80">USDT</span>
              </p>
            </div>

            <Button fullWidth size="lg" onClick={onCollect}>
              {t('victory.collectAndExit')}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
