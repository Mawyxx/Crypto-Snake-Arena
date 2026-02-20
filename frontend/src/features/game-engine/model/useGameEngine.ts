import { useEffect } from 'react'
import { useWebSocket } from '../lib/useWebSocket'
import { usePrediction } from '../lib/usePrediction'
import { useInterpolation } from '../lib/useInterpolation'
import type { GameEngineOptions } from '../types'

export const useGameEngine = (wsUrl: string, options?: GameEngineOptions) => {
  const { localSnakeId, onDeath, onDeathDetected, onGrow, onCashOut, enabled = true } =
    options ?? {}

  // Prediction хук - client-side prediction для локальной змейки
  const prediction = usePrediction({
    localSnakeId,
    onGrow,
  })

  // WebSocket хук - управление соединением и получение данных от сервера
  const websocket = useWebSocket({
    wsUrl,
    enabled,
    localSnakeId,
    onDeath,
    onDeathDetected,
    onGrow,
    onCashOut,
  })

  // Обновляем prediction при изменении prevSnapshot от WebSocket
  useEffect(() => {
    if (websocket.prevSnapshot) {
      prediction.updateFromSnapshot(websocket.prevSnapshot)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocket.prevSnapshot])

  // Interpolation хук - интерполяция состояний для плавного отображения
  const interpolation = useInterpolation({
    snapshotBuffer: websocket.snapshotBuffer,
    localSnakeId,
    getLastSentAngle: prediction.getLastSentAngle,
    getLastSentBoost: prediction.getLastSentBoost,
    getLocalSnakePath: prediction.getLocalSnakePath,
  })

  // Обертка для sendInput, которая также обновляет prediction
  const sendInput = (angle: number, boost: boolean) => {
    prediction.updateLastSentInput(angle, boost)
    websocket.sendInput(angle, boost)
  }

  return {
    getInterpolatedState: interpolation.getInterpolatedState,
    sendInput,
    closeSocket: websocket.closeSocket,
    getLocalSnakeScore: websocket.getLocalSnakeScore,
    status: websocket.status,
  }
}

// Реэкспорт типов для обратной совместимости
export type { ConnectionStatus, InterpolatedSnake, InterpolatedWorldSnapshot, GameEngineOptions } from '../types'
