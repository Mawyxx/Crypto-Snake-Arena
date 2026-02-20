import { useEffect, useRef } from 'react'

const FIXED_RATE_MS = 50
const INPUT_DEADZONE_PX = 14
const SMOOTH_ALPHA = 0.36
const MIN_SEND_DELTA_RAD = 0.012
const MAX_STEP_RAD = 0.42

interface UseInputHandlerOptions {
  /** Ref контейнера игры — угол считается от его центра. Без ref — от центра окна. */
  containerRef?: React.RefObject<HTMLElement | null>
  /** Когда true — не обрабатывать ввод (удержание кнопки выхода). */
  blockInputRef?: React.RefObject<boolean>
}

/**
 * Обработчик ввода для змейки: мышь, тач, Space для boost.
 * Throttle: не чаще раза в 50мс, защита от флуда сервера.
 */
export const useInputHandler = (
  onInput: (angle: number, boost: boolean) => void,
  options?: UseInputHandlerOptions
) => {
  const { containerRef, blockInputRef } = options ?? {}
  const lastAngle = useRef<number>(0)
  const targetAngle = useRef<number>(0)
  const smoothedAngle = useRef<number>(0)
  const isBoosting = useRef<boolean>(false)
  const lastSendTime = useRef<number>(0)
  const lastAimTime = useRef<number>(0)

  const normalizeAngle = (angle: number): number => {
    let a = angle
    while (a > Math.PI) a -= Math.PI * 2
    while (a < -Math.PI) a += Math.PI * 2
    return a
  }

  const shortestDelta = (from: number, to: number): number => {
    return normalizeAngle(to - from)
  }

  useEffect(() => {
    const getCenter = () => {
      const el = containerRef?.current
      if (el) {
        const rect = el.getBoundingClientRect()
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      }
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }

    const stepSmoothedAngle = () => {
      const delta = shortestDelta(smoothedAngle.current, targetAngle.current)
      const clamped = Math.max(-MAX_STEP_RAD, Math.min(MAX_STEP_RAD, delta))
      smoothedAngle.current = normalizeAngle(smoothedAngle.current + clamped * SMOOTH_ALPHA)
      return smoothedAngle.current
    }

    const maybeSendInput = (forceBoostState?: boolean) => {
      const now = Date.now()
      if (now - lastSendTime.current < FIXED_RATE_MS) return
      const next = stepSmoothedAngle()
      if (Math.abs(shortestDelta(lastAngle.current, next)) < MIN_SEND_DELTA_RAD && !forceBoostState) return
      lastSendTime.current = now
      lastAngle.current = next
      onInput(next, forceBoostState ?? isBoosting.current)
    }

    const handleInput = (clientX: number, clientY: number) => {
      if (blockInputRef?.current) return
      const { x: centerX, y: centerY } = getCenter()
      const dx = clientX - centerX
      const dy = clientY - centerY
      if ((dx * dx + dy * dy) < INPUT_DEADZONE_PX * INPUT_DEADZONE_PX) return

      targetAngle.current = Math.atan2(dy, dx)
      lastAimTime.current = Date.now()
      maybeSendInput()
    }

    const onMouseMove = (e: MouseEvent) => handleInput(e.clientX, e.clientY)

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault()
        handleInput(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      if (blockInputRef?.current) return
      if (e.touches[0]) {
        isBoosting.current = true
        handleInput(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      // Не отключать boost при мультитаче — только когда все пальцы убраны
      if (e.touches.length > 0) return
      isBoosting.current = false
      // Boost off — всегда отправляем
      onInput(smoothedAngle.current, false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (blockInputRef?.current) return
      if (e.code === 'Space') {
        e.preventDefault()
        isBoosting.current = true
        const now = Date.now()
        if (now - lastSendTime.current >= FIXED_RATE_MS) {
          lastSendTime.current = now
          const next = stepSmoothedAngle()
          lastAngle.current = next
          onInput(next, true)
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isBoosting.current = false
        // Boost off — всегда отправляем, иначе сервер не узнает об отмене
        onInput(smoothedAngle.current, false)
      }
    }

    // Фиксированная частота: boost и активный поворот живут в одном 50ms send-rate.
    const interval = setInterval(() => {
      if (blockInputRef?.current) return
      const now = Date.now()
      const aimActive = now - lastAimTime.current < 180
      if (!isBoosting.current && !aimActive) return
      maybeSendInput()
    }, FIXED_RATE_MS)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onInput, blockInputRef])
}
