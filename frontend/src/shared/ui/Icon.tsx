import type { HTMLAttributes } from 'react'

export type MaterialSymbolName =
  | 'home'
  | 'leaderboard'
  | 'group'
  | 'remove'
  | 'add'
  | 'info'
  | 'check'
  | 'close'
  | 'content_copy'
  | 'share'
  | 'military_tech'
  | 'add_circle'
  | 'file_upload'
  | 'volume_up'
  | 'vibration'
  | 'language'
  | 'chevron_right'
  | 'card_giftcard'
  | 'admin_panel_settings'

interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: MaterialSymbolName
  size?: number
  filled?: boolean
}

export function Icon({ name, size = 24, filled = false, className = '', style, ...props }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  )
}

export type MaterialIconRoundName = 'add_circle' | 'file_upload' | 'volume_up' | 'vibration' | 'language' | 'chevron_right'

interface IconRoundProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: MaterialIconRoundName
  size?: number
}

export function IconRound({ name, size = 24, className = '', ...props }: IconRoundProps) {
  return (
    <span className={`material-icons-round ${className}`} style={{ fontSize: size }} {...props}>
      {name}
    </span>
  )
}
