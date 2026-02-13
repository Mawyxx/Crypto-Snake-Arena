import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--bg-menu-card)] backdrop-blur-md border border-white/10 rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
