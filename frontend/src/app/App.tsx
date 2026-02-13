import { AppContent } from './AppContent'
import { TelegramGate } from './TelegramGate'
import { designTokens } from '@/shared/config'

function App() {
  return (
    <div
      className="app w-full overflow-hidden"
      style={{
        height: 'var(--tg-viewport-height, 100vh)',
        minHeight: '100vh',
        backgroundColor: designTokens.bgMain,
        color: designTokens.textPrimary,
      }}
    >
      <TelegramGate>
        <AppContent />
      </TelegramGate>
    </div>
  )
}

export default App
