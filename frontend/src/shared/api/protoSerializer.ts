/**
 * protoSerializer — превращает «сырые» байты из WebSocket в понятные TypeScript-объекты.
 * Использует строгую валидацию через protobuf verify методы.
 */
import type { game as GameTypes } from './proto/game';
import { game } from './proto/game.js';
const WorldSnapshot = game.WorldSnapshot;
const PlayerInput = game.PlayerInput;

/**
 * Декодирует WorldSnapshot из бинарных данных с валидацией
 */
export const decodeWorldSnapshot = (data: Uint8Array): GameTypes.IWorldSnapshot => {
  if (!(data instanceof Uint8Array) || data.length === 0) {
    throw new Error('Invalid data: expected non-empty Uint8Array');
  }

  try {
    const message = WorldSnapshot.decode(data);
    
    // Валидация через verify метод protobuf
    const errMsg = WorldSnapshot.verify(message);
    if (errMsg) {
      throw new Error(`WorldSnapshot validation failed: ${errMsg}`);
    }

    const obj = WorldSnapshot.toObject(message, {
      longs: Number,
      defaults: true,
    });

    // Дополнительная проверка структуры результата
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid WorldSnapshot: toObject returned invalid result');
    }

    return obj as GameTypes.IWorldSnapshot;
  } catch (e) {
    console.error('Ошибка декодирования Protobuf:', e);
    throw e instanceof Error ? e : new Error(`Protobuf decode error: ${String(e)}`);
  }
};

/**
 * Кодирует PlayerInput в бинарные данные с валидацией
 */
export const encodePlayerInput = (angle: number, boost: boolean): Uint8Array => {
  // Валидация входных параметров
  if (typeof angle !== 'number' || !Number.isFinite(angle)) {
    throw new Error(`Invalid angle: expected finite number, got ${typeof angle}`);
  }
  if (typeof boost !== 'boolean') {
    throw new Error(`Invalid boost: expected boolean, got ${typeof boost}`);
  }

  const payload: GameTypes.IPlayerInput = { angle, boost };
  
  // Валидация через verify метод protobuf
  const errMsg = PlayerInput.verify(payload);
  if (errMsg) {
    throw new Error(`PlayerInput validation failed: ${errMsg}`);
  }

  try {
    const message = PlayerInput.create(payload);
    return PlayerInput.encode(message).finish();
  } catch (e) {
    console.error('Ошибка кодирования Protobuf:', e);
    throw e instanceof Error ? e : new Error(`Protobuf encode error: ${String(e)}`);
  }
};
