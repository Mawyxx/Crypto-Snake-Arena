import { designTokens } from '@/shared/config'

const BOT = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'CryptoSnakeArena_Bot'
const BOT_LINK = `https://t.me/${BOT}`

/** Проверяет, что приложение открыто из Telegram Mini App (есть initData) */
export function isInTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false
  const initData = window.Telegram?.WebApp?.initData ?? ''
  return initData.length > 0
}

export function TelegramGate({ children }: { children: React.ReactNode }) {
  if (isInTelegramMiniApp()) {
    return <>{children}</>
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
      style={{
        background: designTokens.bgMainAlt,
        color: designTokens.textPrimary,
      }}
    >
      <div style={{ maxWidth: 360 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Crypto Snake Arena
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            marginBottom: 24,
            opacity: 0.9,
          }}
        >
          Приложение доступно только в Telegram Mini App. Открой бота и нажми «Играть» или кнопку меню.
        </p>
        <a
          href={BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: designTokens.primary,
            color: designTokens.textPrimary,
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          Открыть в Telegram
        </a>
        <p
          style={{
            marginTop: 20,
            fontSize: 13,
            opacity: 0.6,
          }}
        >
          t.me/{BOT}
        </p>
      </div>
    </div>
  )
}
