import { motion } from 'framer-motion'

const DEATH_FLASH_MS = 500

interface DeathEffectOverlayProps {
  visible: boolean
}

/**
 * White flash overlay during death animation.
 * Opacity: 0 → 0.6 → 0 over ~500ms.
 */
export function DeathEffectOverlay({ visible }: DeathEffectOverlayProps) {
  if (!visible) return null

  return (
    <motion.div
      className="absolute inset-0 z-30 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.6, 0] }}
      transition={{
        duration: DEATH_FLASH_MS / 1000,
        times: [0, 0.2, 1],
      }}
      style={{ backgroundColor: 'white' }}
    />
  )
}
