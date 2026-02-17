export { interpolateBodyAlongPath } from './model/path-based-body'
export {
  initClientHeadPath,
  reconcileClientHeadPathWithServer,
  updateClientHeadPath,
  getBodyFromClientPath,
  type ClientHeadPathState,
} from './model/client-prediction'
export { PREFERRED_DIST, MAX_HEAD_PATH_LEN, type Point } from './types'
export {
  createSnakeMeshRef,
  updateSnakeMesh,
  type SnakeMeshRendererProps,
  type SnakeMeshRef,
} from './ui/SnakeMeshRenderer'
export { getSkinConfig, getSnakeColor, type SnakeSkinConfig } from './lib/skin-config'
export {
  buildMeshPathFromBody,
  buildMeshPathFromHeadPath,
  MESH_STEP_PX,
  MIN_MESH_POINTS,
} from './lib/mesh-path'
