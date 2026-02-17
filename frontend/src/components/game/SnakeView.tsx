import React from 'react'
import { PixiComponent } from '@pixi/react'
import { Container } from 'pixi.js'
import type { InterpolatedSnake } from '@/hooks/useGameEngine'
import { createSnakeMeshRef, updateSnakeMesh, getSnakeColor } from '@/entities/snake'
import type { SnakeMeshRef } from '@/entities/snake'

interface SnakeViewProps {
  snake: InterpolatedSnake
  isLocalPlayer: boolean
  mouseWorld?: { x: number; y: number } | null
  growthFlash?: number
}

/** Build path from head to tail for mesh drawing. body[0] is head from server. */
function buildBodyPath(
  head: { x?: number | null; y?: number | null },
  body: { x?: number | null; y?: number | null }[]
): { x: number; y: number }[] {
  const hx = head?.x ?? 0
  const hy = head?.y ?? 0
  if (!body || body.length === 0) return [{ x: hx, y: hy }]
  const path: { x: number; y: number }[] = [{ x: hx, y: hy }]
  for (let i = 1; i < body.length; i++) {
    const p = body[i]
    path.push({ x: p?.x ?? 0, y: p?.y ?? 0 })
  }
  return path
}

type SnakeContainerRef = SnakeMeshRef & {
  __trailState: { buffer: { x: number; y: number }[]; lastHead: { x: number; y: number } | null }
}

const SnakeContainer = PixiComponent<SnakeViewProps, Container>('SnakeContainer', {
  create: () => {
    const container = new Container()
    const meshRef = createSnakeMeshRef()
    const ref = { ...meshRef, __trailState: { buffer: [], lastHead: null } }
    ;(container as unknown as SnakeContainerRef).__trailState = ref.__trailState
    Object.assign(container as unknown as SnakeContainerRef, meshRef, ref)
    return container
  },
  applyProps: (instance, _oldProps, newProps) => {
    const ref = instance as unknown as SnakeContainerRef
    const head = newProps.snake?.head
    if (!head) return

    const rawBody = newProps.snake?.body ?? []
    const path = buildBodyPath(head, rawBody)
    const skinId = Number(newProps.snake?.skinId ?? newProps.snake?.id ?? 0)
    const color = getSnakeColor(newProps.isLocalPlayer ? null : skinId) // local = preferred color

    updateSnakeMesh(instance, ref, {
      path,
      color,
      skinId,
      isLocalPlayer: newProps.isLocalPlayer,
      angle: newProps.snake?.angle ?? 0,
      boost: newProps.snake?.boost ?? false,
      mouseWorld: newProps.mouseWorld ?? null,
      growthFlash: newProps.growthFlash,
      trailState: ref.__trailState,
    })
  },
})

function areSnakePropsEqual(prev: SnakeViewProps, next: SnakeViewProps): boolean {
  if (prev.isLocalPlayer !== next.isLocalPlayer) return false
  const prevMw = prev.mouseWorld
  const nextMw = next.mouseWorld
  if (prevMw && nextMw && (Math.round(prevMw.x) !== Math.round(nextMw.x) || Math.round(prevMw.y) !== Math.round(nextMw.y))) return false
  const prevSnake = prev.snake
  const nextSnake = next.snake
  if (Number(prevSnake?.id) !== Number(nextSnake?.id)) return false
  if (Number(prevSnake?.skinId ?? -1) !== Number(nextSnake?.skinId ?? -1)) return false
  if ((prevSnake?.boost ?? false) !== (nextSnake?.boost ?? false)) return false
  const prevHead = prevSnake?.head
  const nextHead = nextSnake?.head
  if (Math.round(prevHead?.x ?? 0) !== Math.round(nextHead?.x ?? 0)) return false
  if (Math.round(prevHead?.y ?? 0) !== Math.round(nextHead?.y ?? 0)) return false
  if (Math.round((prevSnake?.angle ?? 0) * 100) !== Math.round((nextSnake?.angle ?? 0) * 100)) return false
  const prevBody = prevSnake?.body ?? []
  const nextBody = nextSnake?.body ?? []
  if (prevBody.length !== nextBody.length) return false
  if (prevBody.length > 0) {
    const prevFirst = prevBody[0]
    const nextFirst = nextBody[0]
    if (Math.round(prevFirst?.x ?? 0) !== Math.round(nextFirst?.x ?? 0)) return false
    if (Math.round(prevFirst?.y ?? 0) !== Math.round(nextFirst?.y ?? 0)) return false
  }
  if ((prev.growthFlash ?? 0) !== (next.growthFlash ?? 0)) return false
  return true
}

export const SnakeView = React.memo(
  ({ snake, isLocalPlayer, mouseWorld, growthFlash }: SnakeViewProps) => (
    <SnakeContainer snake={snake} isLocalPlayer={isLocalPlayer} mouseWorld={mouseWorld} growthFlash={growthFlash} />
  ),
  areSnakePropsEqual
)
