import React from 'react'
import ReactDOM from 'react-dom/client'
import { App, ErrorBoundary } from '@/app'
import { designTokens } from '@/shared/config'
import { initTelegram } from '@/shared/lib'
import i18n from '@/shared/lib/i18n'
import './index.css'

function showError(msg: string) {
  const rootEl = document.getElementById('root')
  if (!rootEl) return
  rootEl.innerHTML =
    `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:${designTokens.bgMainAlt};color:${designTokens.textPrimary};font-family:sans-serif;padding:20px;text-align:center;font-size:14px">` +
    `<p style="margin-bottom:12px;color:${designTokens.colorErrorLight}">${i18n.t('common.loadError')}</p>` +
    '<pre style="max-width:100%;overflow:auto;font-size:11px;margin-bottom:16px;white-space:pre-wrap;word-break:break-all">' +
    String(msg).replace(/</g, '&lt;') +
    '</pre>' +
    `<button onclick="location.reload()" style="padding:12px 24px;background:${designTokens.primary};color:${designTokens.textPrimary};border:none;border-radius:8px;font-weight:bold;cursor:pointer">${i18n.t('common.reload')}</button>` +
    '</div>'
}

function bootstrap() {
  const rootEl = document.getElementById('root')
  if (!rootEl) return

  try {
    if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok')) {
      fetch(window.location.origin, { headers: { 'ngrok-skip-browser-warning': '1' } }).catch(() => { /* ignore */ })
    }

    const root = ReactDOM.createRoot(rootEl)
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )

    initTelegram().catch(() => { /* ignore */ })
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
    const r = e.reason
    const msg = r instanceof Error ? (r.message + (r.stack ? '\n' + r.stack : '')) : String(r)
    showError(msg)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap)
} else {
  bootstrap()
}
