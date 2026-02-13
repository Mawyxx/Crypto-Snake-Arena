/**
 * protoSerializer — превращает «сырые» байты из WebSocket в понятные TypeScript-объекты.
 */
import type { game as GameTypes } from './proto/game';
import { game } from './proto/game.js';
const WorldSnapshot = game.WorldSnapshot;
const PlayerInput = game.PlayerInput;

export const decodeWorldSnapshot = (data: Uint8Array): GameTypes.IWorldSnapshot => {
  try {
    const message = WorldSnapshot.decode(data);
    return WorldSnapshot.toObject(message, {
      longs: Number,
      defaults: true,
    }) as GameTypes.IWorldSnapshot;
  } catch (e) {
    console.error('Ошибка декодирования Protobuf:', e);
    throw e;
  }
};

export const encodePlayerInput = (angle: number, boost: boolean): Uint8Array => {
  const payload = { angle, boost };
  const errMsg = PlayerInput.verify(payload);
  if (errMsg) throw Error(errMsg);

  const message = PlayerInput.create(payload);
  return PlayerInput.encode(message).finish();
};
