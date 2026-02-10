import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  children,
  onClick,
  ...props
}: ButtonProps) {
  const base =
    'rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-600 text-white shadow-lg shadow-blue-500/25',
    secondary:
      'bg-[var(--bg-card)] border border-white/[0.08] text-white hover:border-white/15',
    ghost:
      'bg-transparent text-white/80 border border-white/10 hover:bg-white/5',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
