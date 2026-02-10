import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui'

const CONFETTI_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa']

export interface VictoryOverlayProps {
  visible: boolean
  reward: number
  newBalance: number
  onCollect: () => void
}

export function VictoryOverlay({ visible, reward, newBalance, onCollect }: VictoryOverlayProps) {
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
          {CONFETTI_COLORS.flatMap((c, i) =>
            Array.from({ length: 3 }, (_, j) => (
              <motion.div
                key={`${i}-${j}`}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  left: `${20 + i * 20 + j * 10}%`,
                  top: -10,
                  backgroundColor: c,
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: '100vh',
                  opacity: 0,
                  rotate: 360 * (j % 2 === 0 ? 1 : -1),
                }}
                transition={{
                  duration: 2 + j * 0.5,
                  delay: i * 0.1 + j * 0.2,
                }}
              />
            ))
          )}

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm flex flex-col items-center gap-6 relative z-10"
          >
            <h1 className="text-2xl font-black text-white text-center drop-shadow-lg tracking-tight">
              УСПЕШНЫЙ ВЫХОД!
            </h1>

            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              <span className="text-2xl font-bold text-emerald-400 uppercase tracking-wider">$</span>
            </motion.div>

            <div className="w-full space-y-3 card-premium-elevated p-5 rounded-2xl">
              <p className="text-center text-emerald-400 font-bold text-xl">
                Чистый профит: +<span className="tabular-nums">{reward.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
                <span className="ml-1 text-sm font-semibold text-emerald-400/90">USDT</span>
              </p>
              <p className="text-center text-[var(--text-secondary)]">
                Итоговый баланс: <span className="text-white font-semibold tabular-nums">{newBalance.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
                <span className="ml-1 text-xs text-emerald-400/80">USDT</span>
              </p>
            </div>

            <Button fullWidth size="lg" onClick={onCollect}>
              Забрать и выйти
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
