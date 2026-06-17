import type { GameSceneState, GameState, Obstacle, ObstacleType } from '../types/game'
import {
  BASE_SPEED,
  GRAVITY,
  GROUND_PATTERN_WIDTH,
  OBSTACLE_MAX_SPAWN_TIME,
  OBSTACLE_MIN_SPAWN_TIME,
  OBSTACLE_REMOVE_PADDING,
  OBSTACLE_START_X,
  OBSTACLE_VARIANTS,
  JUMP_FORCE,
  MAX_DELTA_TIME,
  PLAYER_HITBOX_HEIGHT,
  PLAYER_HITBOX_OFFSET_Y,
  PLAYER_HITBOX_WIDTH,
  PLAYER_GROUND_Y,
  PLAYER_X,
} from './constants'
import { renderGameScene } from './renderer'

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW'])
const RESTART_KEY = 'Enter'

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface GameEngineOptions {
  onGameOverChange?: (isGameOver: boolean) => void
}

function getRandomSpawnTime() {
  return (
    OBSTACLE_MIN_SPAWN_TIME +
    Math.random() * (OBSTACLE_MAX_SPAWN_TIME - OBSTACLE_MIN_SPAWN_TIME)
  )
}

function createSceneState(gameState: GameState): GameSceneState {
  return {
    ...gameState,
    elapsedTime: 0,
    groundOffset: 0,
    speed: BASE_SPEED,
    playerY: PLAYER_GROUND_Y,
    playerVelocityY: 0,
    isGrounded: true,
    obstacles: [],
    isGameOver: false,
    nextObstacleSpawnIn: getRandomSpawnTime(),
    obstacleIdCounter: 0,
  }
}

function createObstacle(state: GameSceneState): Obstacle {
  const type: ObstacleType = Math.random() > 0.5 ? 'cone' : 'barrier'
  const size = OBSTACLE_VARIANTS[type]

  state.obstacleIdCounter += 1

  return {
    id: state.obstacleIdCounter,
    x: OBSTACLE_START_X,
    y: PLAYER_GROUND_Y - size.height,
    width: size.width,
    height: size.height,
    type,
  }
}

function updateObstacles(state: GameSceneState, deltaTime: number) {
  state.nextObstacleSpawnIn -= deltaTime

  if (state.nextObstacleSpawnIn <= 0) {
    state.obstacles.push(createObstacle(state))
    state.nextObstacleSpawnIn = getRandomSpawnTime()
  }

  state.obstacles = state.obstacles
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - state.speed * deltaTime,
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -OBSTACLE_REMOVE_PADDING)
}

function getPlayerHitbox(state: GameSceneState): Rect {
  return {
    x: PLAYER_X - PLAYER_HITBOX_WIDTH / 2,
    y: state.playerY - PLAYER_HITBOX_OFFSET_Y,
    width: PLAYER_HITBOX_WIDTH,
    height: PLAYER_HITBOX_HEIGHT,
  }
}

function doRectsOverlap(first: Rect, second: Rect) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  )
}

function hasObstacleCollision(state: GameSceneState) {
  const playerHitbox = getPlayerHitbox(state)

  return state.obstacles.some((obstacle) =>
    doRectsOverlap(playerHitbox, obstacle),
  )
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

  updateObstacles(state, deltaTime)
}

function jump(state: GameSceneState) {
  if (!state.isGrounded) return

  state.playerVelocityY = -JUMP_FORCE
  state.isGrounded = false
}

export function startGameEngine(
  context: CanvasRenderingContext2D,
  gameState: GameState,
  options: GameEngineOptions = {},
) {
  let sceneState = createSceneState(gameState)
  let animationFrameId = 0
  let previousTime: number | null = null
  let isRunning = true

  const restartGame = () => {
    sceneState = createSceneState(gameState)
    previousTime = null
    options.onGameOverChange?.(false)
    renderGameScene(context, sceneState)
  }

  const setGameOver = () => {
    if (sceneState.isGameOver) return

    sceneState.isGameOver = true
    sceneState.playerVelocityY = 0
    options.onGameOverChange?.(true)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (sceneState.isGameOver && event.code === RESTART_KEY) {
      event.preventDefault()
      if (!event.repeat) restartGame()
      return
    }

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
    if (!sceneState.isGameOver) {
      updateGame(sceneState, deltaTime)

      if (hasObstacleCollision(sceneState)) {
        setGameOver()
      }
    }

    renderGameScene(context, sceneState)
    animationFrameId = requestAnimationFrame(frame)
  }

  window.addEventListener('keydown', handleKeyDown)
  options.onGameOverChange?.(false)
  renderGameScene(context, sceneState)
  animationFrameId = requestAnimationFrame(frame)

  return () => {
    isRunning = false
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('keydown', handleKeyDown)
  }
}
