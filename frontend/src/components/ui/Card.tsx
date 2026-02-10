import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--tg-theme-secondary-bg-color,#2d2d44)]/80 backdrop-blur-md border border-white/10 rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
