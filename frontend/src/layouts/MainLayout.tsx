import type { ReactNode } from 'react'
import { BottomBar } from './BottomBar'

interface MainLayoutProps {
  children: ReactNode
  showBottomBar?: boolean
}

export function MainLayout({ children, showBottomBar = true }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-full max-w-[420px] mx-auto w-full touch-none pt-[env(safe-area-inset-top)] app-content-wrap bg-[var(--bg-main)]">
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      {showBottomBar && <BottomBar />}
    </div>
  )
}
