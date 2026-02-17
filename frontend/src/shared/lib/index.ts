export { getApiBaseUrl } from './apiBaseUrl'
export {
  lerp,
  interpolatePosition,
  extrapolateHead,
  interpolateAngle,
  BASE_SPEED,
  BOOST_SPEED,
  type Point,
} from './interpolation'
export {
  buildPathFromBody,
  pointAtDistance,
  sampleBodyAlongPath,
} from './path-sampler'
export { RingSnapshotBuffer } from './snapshot-buffer'
export { createBodyTexture, createHeadTexture } from './snake-textures'
export type { SnapshotFrame, ISnapshotBuffer } from './snapshot-buffer'
export {
  getStoredLang,
  setStoredLang,
  LANG_RU,
  LANG_EN,
  type LangCode,
} from './i18n'
export {
  initTelegram,
  getInitData,
  getUserIdFromInitData,
  getPhotoUrlFromInitData,
  getTelegramUserFromInitData,
  getDisplayNameFromTelegramUser,
  type TelegramUser,
} from './telegramInit'
