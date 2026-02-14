export function useHaptic() {
  const impact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(style)
    } catch { /* Haptic not available */ }
  }

  const notify = (type: 'error' | 'success' | 'warning' = 'success') => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(type)
    } catch { /* Haptic not available */ }
  }

  return { impact, notify }
}
