import type { GameSceneState, GameState } from '../types/game'
import {
  BASE_SPEED,
  GROUND_PATTERN_WIDTH,
  MAX_DELTA_TIME,
} from './constants'
import { renderGameScene } from './renderer'

function createSceneState(gameState: GameState): GameSceneState {
  return {
    ...gameState,
    elapsedTime: 0,
    groundOffset: 0,
    speed: BASE_SPEED,
  }
}

export function updateGame(state: GameSceneState, deltaTime: number) {
  state.elapsedTime += deltaTime
  state.groundOffset =
    (state.groundOffset + state.speed * deltaTime) % GROUND_PATTERN_WIDTH
}

export function startGameEngine(
  context: CanvasRenderingContext2D,
  gameState: GameState,
) {
  const sceneState = createSceneState(gameState)
  let animationFrameId = 0
  let previousTime: number | null = null
  let isRunning = true

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

  renderGameScene(context, sceneState)
  animationFrameId = requestAnimationFrame(frame)

  return () => {
    isRunning = false
    cancelAnimationFrame(animationFrameId)
  }
}
