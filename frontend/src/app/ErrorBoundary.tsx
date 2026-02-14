import React from 'react'
import { designTokens } from '@/shared/config'

function handleReload(): void {
  window.location.reload()
}

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error): void {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full p-6"
          style={{
            backgroundColor: designTokens.bgMainAlt,
            color: designTokens.textPrimary,
          }}
        >
          <p className="text-lg font-medium mb-4">Ошибка загрузки</p>
          <button
            type="button"
            onClick={handleReload}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/25"
          >
            Обновить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
