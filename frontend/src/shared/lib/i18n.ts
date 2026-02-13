import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from '@/locales/ru.json'
import en from '@/locales/en.json'

const STORAGE_KEY = 'crypto_snake_lang'

export const LANG_RU = 'ru'
export const LANG_EN = 'en'
export type LangCode = typeof LANG_RU | typeof LANG_EN

export function getStoredLang(): LangCode {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === LANG_EN || s === LANG_RU) return s
  } catch {
    /* ignore */
  }
  return LANG_RU
}

export function setStoredLang(lang: LangCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore */
  }
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: getStoredLang(),
  fallbackLng: LANG_RU,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
