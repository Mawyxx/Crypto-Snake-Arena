export function useHaptic() {
  const impact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      const tg = (window as { Telegram?: { WebApp?: { HapticFeedback?: { impactOccurred: (s: string) => void } } } }).Telegram?.WebApp?.HapticFeedback
      tg?.impactOccurred?.(style)
    } catch {}
  }

  const notify = (type: 'error' | 'success' | 'warning' = 'success') => {
    try {
      const tg = (window as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred: (t: string) => void } } } }).Telegram?.WebApp?.HapticFeedback
      tg?.notificationOccurred?.(type)
    } catch {}
  }

  return { impact, notify }
}
