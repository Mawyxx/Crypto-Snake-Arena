import { useEffect, useRef } from 'react'

const FIXED_RATE_MS = 50

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
  const isBoosting = useRef<boolean>(false)
  const lastSendTime = useRef<number>(0)

  useEffect(() => {
    const getCenter = () => {
      const el = containerRef?.current
      if (el) {
        const rect = el.getBoundingClientRect()
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      }
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }

    const handleInput = (clientX: number, clientY: number) => {
      if (blockInputRef?.current) return
      const { x: centerX, y: centerY } = getCenter()
      const angle = Math.atan2(clientY - centerY, clientX - centerX)

      const now = Date.now()
      lastAngle.current = angle

      // Throttle: не чаще раза в 50мс, даже при сильном изменении угла
      if (now - lastSendTime.current < FIXED_RATE_MS) return
      lastSendTime.current = now
      onInput(angle, isBoosting.current)
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
      onInput(lastAngle.current, false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (blockInputRef?.current) return
      if (e.code === 'Space') {
        e.preventDefault()
        isBoosting.current = true
        const now = Date.now()
        if (now - lastSendTime.current >= FIXED_RATE_MS) {
          lastSendTime.current = now
          onInput(lastAngle.current, true)
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isBoosting.current = false
        // Boost off — всегда отправляем, иначе сервер не узнает об отмене
        onInput(lastAngle.current, false)
      }
    }

    // Фиксированная частота: при удержании boost отправляем угол каждые 50ms
    const interval = setInterval(() => {
      if (blockInputRef?.current) return
      if (isBoosting.current) {
        const now = Date.now()
        if (now - lastSendTime.current >= FIXED_RATE_MS) {
          lastSendTime.current = now
          onInput(lastAngle.current, true)
        }
      }
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
