import type {
  GameSceneState,
  GameState,
  Goal,
  Obstacle,
  ObstacleType,
} from '../types/game'
import {
  BALL_DISTANCE,
  BASE_SPEED,
  GOAL_DETECTION_RANGE,
  GOAL_FEEDBACK_TIME,
  GOAL_HEIGHT,
  GOAL_REMOVE_PADDING,
  GOAL_SPAWN_MAX_TIME,
  GOAL_SPAWN_MIN_TIME,
  GOAL_START_X,
  GOAL_WIDTH,
  GRAVITY,
  GROUND_PATTERN_WIDTH,
  KICK_ACTIVE_TIME,
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
  RUN_CYCLE_SPEED,
} from './constants'
import { renderGameScene } from './renderer'

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW'])
const KICK_KEYS = new Set(['KeyX', 'KeyK', 'Enter'])
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

function getRandomGoalSpawnTime() {
  return (
    GOAL_SPAWN_MIN_TIME +
    Math.random() * (GOAL_SPAWN_MAX_TIME - GOAL_SPAWN_MIN_TIME)
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
    goals: [],
    goalsScored: 0,
    isKicking: false,
    kickTimer: 0,
    goalFeedbackTimer: 0,
    isGameOver: false,
    nextObstacleSpawnIn: getRandomSpawnTime(),
    nextGoalSpawnIn: getRandomGoalSpawnTime(),
    obstacleIdCounter: 0,
    goalIdCounter: 0,
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

function createGoal(state: GameSceneState): Goal {
  state.goalIdCounter += 1

  return {
    id: state.goalIdCounter,
    x: GOAL_START_X,
    y: PLAYER_GROUND_Y - GOAL_HEIGHT,
    width: GOAL_WIDTH,
    height: GOAL_HEIGHT,
    type: 'ground',
    isScored: false,
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

function updateGoals(state: GameSceneState, deltaTime: number) {
  state.nextGoalSpawnIn -= deltaTime

  if (state.nextGoalSpawnIn <= 0) {
    state.goals.push(createGoal(state))
    state.nextGoalSpawnIn = getRandomGoalSpawnTime()
  }

  state.goals = state.goals
    .map((goal) => ({
      ...goal,
      x: goal.x - state.speed * deltaTime,
    }))
    .filter((goal) => goal.x + goal.width > -GOAL_REMOVE_PADDING && !goal.isScored)
}

function getPlayerHitbox(state: GameSceneState): Rect {
  return {
    x: PLAYER_X - PLAYER_HITBOX_WIDTH / 2,
    y: state.playerY - PLAYER_HITBOX_OFFSET_Y,
    width: PLAYER_HITBOX_WIDTH,
    height: PLAYER_HITBOX_HEIGHT,
  }
}

function getBallX(state: GameSceneState) {
  return PLAYER_X + BALL_DISTANCE + Math.sin(state.elapsedTime * RUN_CYCLE_SPEED) * 3
}

function kick(state: GameSceneState) {
  if (state.isGameOver) return

  state.isKicking = true
  state.kickTimer = KICK_ACTIVE_TIME
}

function updateKick(state: GameSceneState, deltaTime: number) {
  if (state.kickTimer <= 0) {
    state.isKicking = false
    return
  }

  state.kickTimer = Math.max(0, state.kickTimer - deltaTime)
  state.isKicking = state.kickTimer > 0
}

function checkGoalScoring(state: GameSceneState) {
  if (!state.isKicking) return

  const ballX = getBallX(state)

  state.goals.forEach((goal) => {
    if (goal.isScored) return

    const goalMouthX = goal.x + goal.width * 0.2
    const isBallNearGoal =
      ballX >= goalMouthX - GOAL_DETECTION_RANGE &&
      ballX <= goal.x + goal.width + GOAL_DETECTION_RANGE

    if (!isBallNearGoal) return

    goal.isScored = true
    state.goalsScored += 1
    state.goalFeedbackTimer = GOAL_FEEDBACK_TIME
  })
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
  state.goalFeedbackTimer = Math.max(0, state.goalFeedbackTimer - deltaTime)
  updateKick(state, deltaTime)

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
  updateGoals(state, deltaTime)
  checkGoalScoring(state)
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

    if (KICK_KEYS.has(event.code)) {
      event.preventDefault()
      if (!event.repeat) kick(sceneState)
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
