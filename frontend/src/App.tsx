import { AppContent } from './AppContent'

function App() {
  return (
    <div
      className="app w-full overflow-hidden"
      style={{
        height: 'var(--tg-viewport-height, 100vh)',
        minHeight: '100vh',
        backgroundColor: '#0A0A0B',
        color: '#ffffff',
      }}
    >
      <AppContent />
    </div>
  )
}

export default App
