import type { GameSceneState, GameState } from '../types/game'
import {
  BASE_SPEED,
  GRAVITY,
  GROUND_PATTERN_WIDTH,
  JUMP_FORCE,
  MAX_DELTA_TIME,
  PLAYER_GROUND_Y,
} from './constants'
import { renderGameScene } from './renderer'

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW'])

function createSceneState(gameState: GameState): GameSceneState {
  return {
    ...gameState,
    elapsedTime: 0,
    groundOffset: 0,
    speed: BASE_SPEED,
    playerY: PLAYER_GROUND_Y,
    playerVelocityY: 0,
    isGrounded: true,
  }
}

export function updateGame(state: GameSceneState, deltaTime: number) {
  state.elapsedTime += deltaTime
  state.groundOffset =
    (state.groundOffset + state.speed * deltaTime) % GROUND_PATTERN_WIDTH

  if (!state.isGrounded) {
    state.playerVelocityY += GRAVITY * deltaTime
    state.playerY += state.playerVelocityY * deltaTime

    if (state.playerY >= PLAYER_GROUND_Y) {
      state.playerY = PLAYER_GROUND_Y
      state.playerVelocityY = 0
      state.isGrounded = true
    }
  }
}

function jump(state: GameSceneState) {
  if (!state.isGrounded) return

  state.playerVelocityY = -JUMP_FORCE
  state.isGrounded = false
}

export function startGameEngine(
  context: CanvasRenderingContext2D,
  gameState: GameState,
) {
  const sceneState = createSceneState(gameState)
  let animationFrameId = 0
  let previousTime: number | null = null
  let isRunning = true

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!JUMP_KEYS.has(event.code)) return

    event.preventDefault()
    if (!event.repeat) jump(sceneState)
  }

  const frame = (currentTime: number) => {
    if (!isRunning) return

    const deltaTime =
      previousTime === null
        ? 0
        : Math.min((currentTime - previousTime) / 1000, MAX_DELTA_TIME)

    previousTime = currentTime
    updateGame(sceneState, deltaTime)
    renderGameScene(context, sceneState)
    animationFrameId = requestAnimationFrame(frame)
  }

  window.addEventListener('keydown', handleKeyDown)
  renderGameScene(context, sceneState)
  animationFrameId = requestAnimationFrame(frame)

  return () => {
    isRunning = false
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('keydown', handleKeyDown)
  }
}
