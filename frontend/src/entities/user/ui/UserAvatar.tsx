interface UserAvatarProps {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
}

export function UserAvatar({ src, name, size = 40, className = '' }: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const bg = 'bg-white/10'

  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span
          className={`${bg} text-white font-semibold text-sm`}
          style={{ lineHeight: `${size}px` }}
        >
          {initial}
        </span>
      )}
    </div>
  )
}
