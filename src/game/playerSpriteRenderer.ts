import type { GameSceneState } from '../types/game'
import type { TeamSlug } from '../types/team'
import {
  BALL_ATTACHED_OFFSET_X,
  BALL_SHOT_SPEED_X,
  JUMP_FORCE,
  PLAYER_X,
} from './constants'
import { drawPlayer as drawProceduralPlayer } from './playerRenderer'
import {
  getPlayerSprite,
  PLAYER_SPRITE_SETS,
  type PlayerSpriteSet,
  type PlayerAnimationName,
  type PlayerSpriteAnimation,
} from './playerSprites'

export const PLAYER_SPRINT_VISUAL_SPEED_THRESHOLD = 310

interface SelectedAnimation {
  name: PlayerAnimationName
  config: PlayerSpriteAnimation
  elapsedTime: number
}

function getKickAnimationTime(state: GameSceneState) {
  const kickStartX = PLAYER_X + BALL_ATTACHED_OFFSET_X
  return Math.max(0, state.ball.x - kickStartX) / BALL_SHOT_SPEED_X
}

function getPlayerSpriteSet(teamSlug: TeamSlug): PlayerSpriteSet {
  return PLAYER_SPRITE_SETS[teamSlug]
}

function getKickDuration(spriteSet: PlayerSpriteSet) {
  const config = spriteSet.animations.kick
  return config.frameCount / config.fps
}

function isKickAnimationActive(
  state: GameSceneState,
  spriteSet: PlayerSpriteSet,
) {
  return (
    state.ball.state === 'shot' &&
    getKickAnimationTime(state) < getKickDuration(spriteSet)
  )
}

function selectAnimation(
  state: GameSceneState,
  spriteSet: PlayerSpriteSet,
): SelectedAnimation {
  if (
    !state.isGameOver &&
    isKickAnimationActive(state, spriteSet)
  ) {
    return {
      name: 'kick',
      config: spriteSet.animations.kick,
      elapsedTime: getKickAnimationTime(state),
    }
  }

  if (state.isGameOver) {
    return {
      name: 'idle',
      config: spriteSet.animations.idle,
      elapsedTime: performance.now() / 1000,
    }
  }

  if (!state.isGrounded) {
    return {
      name: 'jump',
      config: spriteSet.animations.jump,
      elapsedTime: 0,
    }
  }

  if (state.speed >= PLAYER_SPRINT_VISUAL_SPEED_THRESHOLD) {
    return {
      name: 'sprint',
      config: spriteSet.animations.sprint,
      elapsedTime: state.elapsedTime,
    }
  }

  return {
    name: 'running',
    config: spriteSet.animations.running,
    elapsedTime: state.elapsedTime,
  }
}

function getJumpFrameIndex(state: GameSceneState, frameCount: number) {
  const normalizedVelocity =
    (state.playerVelocityY + JUMP_FORCE) / (JUMP_FORCE * 2)
  const jumpProgress = Math.max(0, Math.min(1, normalizedVelocity))
  return Math.min(frameCount - 1, Math.floor(jumpProgress * frameCount))
}

function getFrameIndex(
  state: GameSceneState,
  animation: SelectedAnimation,
) {
  const { config } = animation
  const availableFrameCount = config.frames?.length ?? config.frameCount

  let sequenceIndex: number
  if (animation.name === 'jump') {
    sequenceIndex = getJumpFrameIndex(state, availableFrameCount)
  } else {
    const rawFrame = Math.floor(animation.elapsedTime * config.fps)
    sequenceIndex = config.loop
      ? rawFrame % availableFrameCount
      : Math.min(availableFrameCount - 1, rawFrame)
  }

  return config.frames?.[sequenceIndex] ?? sequenceIndex
}

function getAnimationSource(
  config: PlayerSpriteAnimation,
) {
  const image = getPlayerSprite(config)
  if (!image) return null
  return image
}

function getDrawMetrics(
  state: GameSceneState,
  spriteSet: PlayerSpriteSet,
  config: PlayerSpriteAnimation,
) {
  return {
    x: Math.round(
      PLAYER_X -
        spriteSet.footAnchorX * spriteSet.scale +
        spriteSet.offsetX,
    ),
    y: Math.round(
      state.playerY -
        spriteSet.footAnchorY * spriteSet.scale +
        spriteSet.offsetY,
    ),
    width: Math.round(config.frameWidth * spriteSet.scale),
    height: Math.round(config.frameHeight * spriteSet.scale),
  }
}

function drawAnimationFrame(
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  config: PlayerSpriteAnimation,
  frameIndex: number,
  metrics: ReturnType<typeof getDrawMetrics>,
) {
  const sourceX = Math.round(frameIndex * config.frameWidth)
  const sourceY = 0
  const sourceWidth = Math.round(config.frameWidth)
  const sourceHeight = Math.round(config.frameHeight)
  context.drawImage(
    source,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    metrics.x,
    metrics.y,
    metrics.width,
    metrics.height,
  )
}

function drawPlayerSprite(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const spriteSet = getPlayerSpriteSet(state.selectedTeam.slug)

  const animation = selectAnimation(state, spriteSet)
  const source = getAnimationSource(
    animation.config,
  )
  if (!source) return false

  const frameIndex = getFrameIndex(state, animation)
  const metrics = getDrawMetrics(state, spriteSet, animation.config)
  context.save()
  context.imageSmoothingEnabled = false
  drawAnimationFrame(
    context,
    source,
    animation.config,
    frameIndex,
    metrics,
  )
  context.restore()
  return true
}

export function drawPlayer(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (!drawPlayerSprite(context, state)) {
    drawProceduralPlayer(context, state)
  }
}
