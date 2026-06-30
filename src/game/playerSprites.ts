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

const PLAYER_SPRITE_LEGACY_PATH = '/assets/sprites/player/legacy'
const PLAYER_SPRITE_BRAZIL_PATH = '/assets/sprites/player/brazil'

const LEGACY_PLAYER_SPRITE_ANIMATIONS: Record<
  PlayerAnimationName,
  PlayerSpriteAnimation
> = {
  running: {
    src: `${PLAYER_SPRITE_LEGACY_PATH}/running.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 6,
    fps: 12,
    loop: true,
  },
  sprint: {
    src: `${PLAYER_SPRITE_LEGACY_PATH}/running.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 6,
    fps: 14,
    loop: true,
  },
  idle: {
    src: `${PLAYER_SPRITE_LEGACY_PATH}/idle.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 4,
    fps: 6,
    loop: true,
  },
  jump: {
    src: `${PLAYER_SPRITE_LEGACY_PATH}/runningJump.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 8,
    fps: 12,
    loop: false,
  },
  kick: {
    src: `${PLAYER_SPRITE_LEGACY_PATH}/kick.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 4,
    fps: 14,
    loop: false,
  },
  slide: {
    src: `${PLAYER_SPRITE_LEGACY_PATH}/runningJump.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 8,
    fps: 12,
    loop: false,
    frames: [4, 5, 6, 7],
  },
}

const BRAZIL_PLAYER_SPRITE_ANIMATIONS: Record<
  PlayerAnimationName,
  PlayerSpriteAnimation
> = {
  running: {
    src: `${PLAYER_SPRITE_BRAZIL_PATH}/running.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 6,
    fps: 11,
    loop: true,
  },
  sprint: {
    src: `${PLAYER_SPRITE_BRAZIL_PATH}/running.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 6,
    fps: 12,
    loop: true,
  },
  idle: {
    src: `${PLAYER_SPRITE_BRAZIL_PATH}/idle.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 4,
    fps: 6,
    loop: true,
  },
  jump: {
    src: `${PLAYER_SPRITE_BRAZIL_PATH}/runningJump.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 8,
    fps: 12,
    loop: false,
  },
  kick: {
    src: `${PLAYER_SPRITE_BRAZIL_PATH}/kick.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 4,
    fps: 14,
    loop: false,
  },
  slide: {
    src: `${PLAYER_SPRITE_BRAZIL_PATH}/runningJump.png`,
    frameWidth: 120,
    frameHeight: 120,
    frameCount: 8,
    fps: 12,
    loop: false,
    frames: [4, 5, 6, 7],
  },
}

export const PLAYER_SPRITE_SETS = {
  legacy: {
    animations: LEGACY_PLAYER_SPRITE_ANIMATIONS,
    scale: 2,
    footAnchorX: 60,
    footAnchorY: 90,
    offsetX: 0,
    offsetY: 0,
    usePaletteSwap: true,
  },
  brasil: {
    animations: BRAZIL_PLAYER_SPRITE_ANIMATIONS,
    scale: 2,
    footAnchorX: 60,
    footAnchorY: 90,
    offsetX: 0,
    offsetY: 0,
    usePaletteSwap: false,
  },
} satisfies Record<string, PlayerSpriteSet>

export const PLAYER_SPRITE_ANIMATIONS =
  PLAYER_SPRITE_SETS.legacy.animations

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
