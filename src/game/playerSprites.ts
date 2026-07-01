import type { TeamSlug } from '../types/team'

export type PlayerAnimationName =
  | 'running'
  | 'sprint'
  | 'idle'
  | 'jump'
  | 'kick'
  | 'slide'

export interface PlayerSpriteAnimation {
  src: string
  frameWidth: number
  frameHeight: number
  frameCount: number
  fps: number
  loop: boolean
  frames?: readonly number[]
}

export interface PlayerSpriteSet {
  animations: Record<PlayerAnimationName, PlayerSpriteAnimation>
  scale: number
  footAnchorX: number
  footAnchorY: number
  offsetX: number
  offsetY: number
  usePaletteSwap: boolean
}

function createPlayerSpriteAnimations(
  path: string,
): Record<PlayerAnimationName, PlayerSpriteAnimation> {
  return {
    running: {
      src: `${path}/running.png`,
      frameWidth: 120,
      frameHeight: 120,
      frameCount: 6,
      fps: 11,
      loop: true,
    },
    sprint: {
      src: `${path}/running.png`,
      frameWidth: 120,
      frameHeight: 120,
      frameCount: 6,
      fps: 12,
      loop: true,
    },
    idle: {
      src: `${path}/idle.png`,
      frameWidth: 120,
      frameHeight: 120,
      frameCount: 4,
      fps: 6,
      loop: true,
    },
    jump: {
      src: `${path}/runningJump.png`,
      frameWidth: 120,
      frameHeight: 120,
      frameCount: 8,
      fps: 12,
      loop: false,
    },
    kick: {
      src: `${path}/kick.png`,
      frameWidth: 120,
      frameHeight: 120,
      frameCount: 4,
      fps: 14,
      loop: false,
    },
    slide: {
      src: `${path}/runningJump.png`,
      frameWidth: 120,
      frameHeight: 120,
      frameCount: 8,
      fps: 12,
      loop: false,
      frames: [4, 5, 6, 7],
    },
  }
}

const PLAYER_SPRITE_PATHS: Record<TeamSlug, string> = {
  brasil: '/assets/sprites/player/brazil',
  argentina: '/assets/sprites/player/argentina',
  chile: '/assets/sprites/player/chile',
}

const PLAYER_SPRITE_SET_BASE = {
  scale: 2,
  footAnchorX: 60,
  footAnchorY: 90,
  offsetX: 0,
  offsetY: 0,
  usePaletteSwap: false,
}

export const PLAYER_SPRITE_SETS = {
  brasil: {
    ...PLAYER_SPRITE_SET_BASE,
    animations: createPlayerSpriteAnimations(PLAYER_SPRITE_PATHS.brasil),
  },
  argentina: {
    ...PLAYER_SPRITE_SET_BASE,
    animations: createPlayerSpriteAnimations(PLAYER_SPRITE_PATHS.argentina),
  },
  chile: {
    ...PLAYER_SPRITE_SET_BASE,
    animations: createPlayerSpriteAnimations(PLAYER_SPRITE_PATHS.chile),
  },
} satisfies Record<TeamSlug, PlayerSpriteSet>

export const PLAYER_SPRITE_ANIMATIONS =
  PLAYER_SPRITE_SETS.brasil.animations

type SpriteLoadStatus = 'loading' | 'loaded' | 'error'

interface CachedPlayerSprite {
  image: HTMLImageElement
  status: SpriteLoadStatus
}

const playerSpriteCache = new Map<string, CachedPlayerSprite>()

export function getPlayerSprite(
  animation: PlayerSpriteAnimation,
): HTMLImageElement | null {
  const cached = playerSpriteCache.get(animation.src)
  if (cached) return cached.status === 'loaded' ? cached.image : null

  const image = new Image()
  const entry: CachedPlayerSprite = { image, status: 'loading' }
  image.decoding = 'async'
  image.addEventListener('load', () => {
    entry.status = 'loaded'
  }, { once: true })
  image.addEventListener('error', () => {
    entry.status = 'error'
  }, { once: true })
  image.src = animation.src
  playerSpriteCache.set(animation.src, entry)
  return null
}

Object.values(PLAYER_SPRITE_SETS).forEach((spriteSet) => {
  Object.values(spriteSet.animations).forEach((animation) => {
    getPlayerSprite(animation)
  })
})
