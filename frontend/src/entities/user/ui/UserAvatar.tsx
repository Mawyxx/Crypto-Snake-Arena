interface UserAvatarProps {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
  /** Фокус обрезки: center, top, center top и т.д. — для коррекции кадрирования фото */
  objectPosition?: string
}

export function UserAvatar({ src, name, size = 40, className = '', objectPosition = 'center' }: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const bg = 'bg-white/10'

  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover block" style={{ objectPosition }} />
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
