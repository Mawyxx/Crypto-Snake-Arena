import { AppContent } from './AppContent'

function App() {
  return (
    <div
      className="app w-full overflow-hidden"
      style={{
        height: 'var(--tg-viewport-height, 100vh)',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff',
      }}
    >
      <AppContent />
    </div>
  )
}

export default App
