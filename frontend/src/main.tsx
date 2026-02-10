import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initTelegram } from './lib/telegramInit'
import { ErrorBoundary } from './ErrorBoundary'
import './index.css'

function showError(msg: string) {
  const rootEl = document.getElementById('root')
  if (!rootEl) return
  rootEl.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:sans-serif;padding:20px;text-align:center;font-size:14px">' +
    '<p style="margin-bottom:12px;color:#f87171">Ошибка загрузки</p>' +
    '<pre style="max-width:100%;overflow:auto;font-size:11px;margin-bottom:16px;white-space:pre-wrap;word-break:break-all">' +
    String(msg).replace(/</g, '&lt;') +
    '</pre>' +
    '<button onclick="location.reload()" style="padding:12px 24px;background:#06b6d4;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer">Обновить</button>' +
    '</div>'
}

function bootstrap() {
  const rootEl = document.getElementById('root')
  if (!rootEl) return

  try {
    if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok')) {
      fetch(window.location.origin, { headers: { 'ngrok-skip-browser-warning': '1' } }).catch(() => {})
    }

    const root = ReactDOM.createRoot(rootEl)
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )

    initTelegram().catch(() => {})
  } catch (e) {
    const errMsg = e instanceof Error ? e.message + '\n' + (e.stack || '') : String(e)
    showError(errMsg)
  }
}

if (typeof window !== 'undefined') {
  window.onerror = function (msg, _url, _line, _col, err) {
    const txt = err ? err.message + '\n' + (err.stack || '') : String(msg)
    showError(txt)
    return true
  }
  window.onunhandledrejection = function (e) {
    showError(String(e.reason))
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap)
} else {
  bootstrap()
}
