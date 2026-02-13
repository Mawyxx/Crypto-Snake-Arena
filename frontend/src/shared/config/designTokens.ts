/**
 * Design tokens as JS values — for use in inline styles, APIs (e.g. Telegram setBackgroundColor).
 * CSS uses tokens.css; this file keeps the same values for programmatic use.
 */
export const designTokens = {
  /** Цвет карточек главного меню — единый источник */
  bgMenuCard: '#161618',
  bgMain: '#000000',
  bgMainAlt: '#000000',
  textPrimary: '#ffffff',
  primary: '#007aff',
  colorSuccess: '#22c55e',
  colorError: '#ff3b30',
  colorErrorLight: '#f87171',
} as const
