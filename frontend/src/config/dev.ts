/**
 * DEV: при клике на баланс/пополнить — начисляется 500 USDT.
 * VITE_DEV_AUTO_CREDIT=true в билде → фронт пытается credit-500. Бэкенд решает по .env.
 * Для релиза: vars.VITE_DEV_AUTO_CREDIT=false в GitHub или убрать из .env на сервере.
 */
export const DEV_AUTO_CREDIT =
  import.meta.env.VITE_DEV_AUTO_CREDIT === 'true' ||
  import.meta.env.VITE_DEV_AUTO_CREDIT === '1' ||
  (import.meta.env.VITE_DEV_AUTO_CREDIT !== 'false' && import.meta.env.VITE_DEV_AUTO_CREDIT !== '0')
