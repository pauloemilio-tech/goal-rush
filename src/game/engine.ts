import type {
  Ball,
  GameSceneState,
  GameState,
  Goal,
  GoalScenario,
  Obstacle,
  ObstacleType,
} from '../types/game'
import {
  BALL_ATTACHED_OFFSET_X,
  BALL_ATTACHED_OFFSET_Y,
  BALL_ATTACHED_TRANSITION_SPEED,
  BALL_GRAVITY,
  BALL_MIN_ROLL_SPEED,
  BALL_RADIUS,
  BALL_RESET_DELAY,
  BALL_ROLL_DECELERATION,
  BALL_SHOT_SPEED_X,
  BALL_SHOT_SPEED_Y,
  BALL_TUCK_OFFSET_X,
  BALL_TUCK_OFFSET_Y,
  BALL_TUCK_WARNING_DISTANCE,
  BLOCKED_FEEDBACK_TIME,
  BASE_SPEED,
  DESTRUCTION_FEEDBACK_TIME,
  GOAL_FEEDBACK_TIME,
  GOAL_HEIGHT,
  GOAL_MIN_DISTANCE_FROM_OBSTACLE,
  GOAL_MIN_DISTANCE_FROM_OTHER_GOAL,
  GOAL_NET_REACTION_TIME,
  GOAL_POST_WIDTH,
  GOAL_REMOVE_PADDING,
  GOAL_SPAWN_MAX_TIME,
  GOAL_SPAWN_MIN_TIME,
  GOAL_SPAWN_RETRY_DELAY,
  GOAL_START_X,
  GOAL_SAFE_APPROACH_DISTANCE,
  GOAL_SAFE_EXIT_DISTANCE,
  GOAL_WIDTH,
  GAME_WIDTH,
  GRAVITY,
  GROUND_PATTERN_WIDTH,
  DIFFICULTY_MAX_TIME,
  DIFFICULTY_STAGE_2_TIME,
  DIFFICULTY_STAGE_3_TIME,
  DIFFICULTY_STAGE_4_TIME,
  MAX_GAME_SPEED,
  MAX_OBSTACLES_WITHOUT_GOAL,
  MIN_GOAL_SPAWN_INTERVAL,
  MIN_OBSTACLE_SPAWN_INTERVAL,
  OBSTACLE_MAX_SPAWN_TIME,
  OBSTACLE_MIN_SPAWN_TIME,
  OBSTACLE_REMOVE_PADDING,
  OBSTACLE_START_X,
  OBSTACLE_VARIANTS,
  NORMAL_GOAL_CHANCE,
  POWER_SHOT_BARRIER_DISTANCE,
  POWER_SHOT_GOAL_CHANCE,
  POWER_SHOT_UNLOCK_TIME,
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

interface DifficultySettings {
  level: number
  speed: number
  obstacleMinTime: number
  obstacleMaxTime: number
  goalMinTime: number
  goalMaxTime: number
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function getDifficultySettings(elapsedTime: number): DifficultySettings {
  if (elapsedTime < DIFFICULTY_STAGE_2_TIME) {
    const progress = elapsedTime / DIFFICULTY_STAGE_2_TIME
    return {
      level: 1,
      speed: interpolate(BASE_SPEED, 270, progress),
      obstacleMinTime: interpolate(OBSTACLE_MIN_SPAWN_TIME, 1.9, progress),
      obstacleMaxTime: interpolate(OBSTACLE_MAX_SPAWN_TIME, 2.9, progress),
      goalMinTime: interpolate(GOAL_SPAWN_MIN_TIME, 3.8, progress),
      goalMaxTime: interpolate(GOAL_SPAWN_MAX_TIME, 5, progress),
    }
  }

  if (elapsedTime < DIFFICULTY_STAGE_3_TIME) {
    const progress =
      (elapsedTime - DIFFICULTY_STAGE_2_TIME) /
      (DIFFICULTY_STAGE_3_TIME - DIFFICULTY_STAGE_2_TIME)
    return {
      level: 2,
      speed: interpolate(270, 305, progress),
      obstacleMinTime: interpolate(1.9, 1.5, progress),
      obstacleMaxTime: interpolate(2.9, 2.4, progress),
      goalMinTime: interpolate(3.8, 3.2, progress),
      goalMaxTime: interpolate(5, 4.3, progress),
    }
  }

  if (elapsedTime < DIFFICULTY_STAGE_4_TIME) {
    const progress =
      (elapsedTime - DIFFICULTY_STAGE_3_TIME) /
      (DIFFICULTY_STAGE_4_TIME - DIFFICULTY_STAGE_3_TIME)
    return {
      level: 3,
      speed: interpolate(305, 335, progress),
      obstacleMinTime: interpolate(1.5, 1.3, progress),
      obstacleMaxTime: interpolate(2.4, 2.1, progress),
      goalMinTime: interpolate(3.2, 2.9, progress),
      goalMaxTime: interpolate(4.3, 3.9, progress),
    }
  }

  const progress = Math.min(
    1,
    (elapsedTime - DIFFICULTY_STAGE_4_TIME) /
      (DIFFICULTY_MAX_TIME - DIFFICULTY_STAGE_4_TIME),
  )
  return {
    level: 4,
    speed: interpolate(335, MAX_GAME_SPEED, progress),
    obstacleMinTime: interpolate(1.3, MIN_OBSTACLE_SPAWN_INTERVAL, progress),
    obstacleMaxTime: interpolate(2.1, 1.9, progress),
    goalMinTime: interpolate(2.9, MIN_GOAL_SPAWN_INTERVAL, progress),
    goalMaxTime: interpolate(3.9, 3.7, progress),
  }
}

function getRandomSpawnTime(elapsedTime: number) {
  const settings = getDifficultySettings(elapsedTime)
  return (
    settings.obstacleMinTime +
    Math.random() * (settings.obstacleMaxTime - settings.obstacleMinTime)
  )
}

function getRandomGoalSpawnTime(elapsedTime: number) {
  const settings = getDifficultySettings(elapsedTime)
  return (
    settings.goalMinTime +
    Math.random() * (settings.goalMaxTime - settings.goalMinTime)
  )
}

function createSceneState(gameState: GameState): GameSceneState {
  return {
    ...gameState,
    elapsedTime: 0,
    groundOffset: 0,
    speed: BASE_SPEED,
    difficultyLevel: 1,
    playerY: PLAYER_GROUND_Y,
    playerVelocityY: 0,
    isGrounded: true,
    obstacles: [],
    goals: [],
    goalsScored: 0,
    ball: createInitialBall(),
    goalFeedbackTimer: 0,
    powerShotGoalId: null,
    destructionFeedbackTimer: 0,
    destructionFeedbackX: 0,
    destructionFeedbackY: 0,
    blockedFeedbackTimer: 0,
    blockedFeedbackX: 0,
    blockedFeedbackY: 0,
    isGameOver: false,
    nextObstacleSpawnIn: getRandomSpawnTime(0),
    nextGoalSpawnIn: getRandomGoalSpawnTime(0),
    obstacleIdCounter: 0,
    goalIdCounter: 0,
    obstaclesSinceLastGoal: 0,
    timeSinceLastGoal: 0,
    timeSinceLastObstacle: 0,
  }
}

function createInitialBall(): Ball {
  return {
    x: PLAYER_X + BALL_ATTACHED_OFFSET_X,
    y: PLAYER_GROUND_Y - BALL_ATTACHED_OFFSET_Y,
    velocityX: 0,
    velocityY: 0,
    radius: BALL_RADIUS,
    state: 'attached',
    resetTimer: 0,
    isPowerShot: false,
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
    destructible: false,
    powerShotGoalId: null,
  }
}

function createGoal(state: GameSceneState, scenario: GoalScenario): Goal {
  state.goalIdCounter += 1

  return {
    id: state.goalIdCounter,
    x: GOAL_START_X,
    y: PLAYER_GROUND_Y - GOAL_HEIGHT,
    width: GOAL_WIDTH,
    height: GOAL_HEIGHT,
    type: 'ground',
    isScored: false,
    scenario,
    goalVisualState: 'visible',
    goalReactionTimer: 0,
  }
}

function rangesOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) {
  return firstStart < secondEnd && firstEnd > secondStart
}

function isGoalSpawnAreaSafe(state: GameSceneState) {
  const safeStart =
    GOAL_START_X -
    Math.max(GOAL_SAFE_APPROACH_DISTANCE, GOAL_MIN_DISTANCE_FROM_OBSTACLE)
  const safeEnd =
    GOAL_START_X +
    GOAL_WIDTH +
    Math.max(GOAL_SAFE_EXIT_DISTANCE, GOAL_MIN_DISTANCE_FROM_OBSTACLE)
  const hasNearbyObstacle = state.obstacles.some((obstacle) =>
    rangesOverlap(
      safeStart,
      safeEnd,
      obstacle.x,
      obstacle.x + obstacle.width,
    ),
  )
  const hasNearbyGoal = state.goals.some((goal) =>
    Math.abs(goal.x - GOAL_START_X) < GOAL_MIN_DISTANCE_FROM_OTHER_GOAL,
  )

  return !hasNearbyObstacle && !hasNearbyGoal
}

function canSpawnObstacle(state: GameSceneState) {
  const obstacleEnd =
    OBSTACLE_START_X +
    Math.max(OBSTACLE_VARIANTS.cone.width, OBSTACLE_VARIANTS.barrier.width)

  return !state.goals.some((goal) =>
    rangesOverlap(
      OBSTACLE_START_X,
      obstacleEnd,
      goal.x - GOAL_SAFE_APPROACH_DISTANCE,
      goal.x + goal.width + GOAL_SAFE_EXIT_DISTANCE,
    ),
  )
}

function createPowerShotBarrier(state: GameSceneState, goal: Goal): Obstacle {
  const size = OBSTACLE_VARIANTS.breakableBarrier
  state.obstacleIdCounter += 1

  return {
    id: state.obstacleIdCounter,
    x: goal.x - POWER_SHOT_BARRIER_DISTANCE,
    y: PLAYER_GROUND_Y - size.height,
    width: size.width,
    height: size.height,
    type: 'breakableBarrier',
    destructible: true,
    powerShotGoalId: goal.id,
  }
}

function spawnGoalScenario(state: GameSceneState) {
  const totalChance = NORMAL_GOAL_CHANCE + POWER_SHOT_GOAL_CHANCE
  const scenario: GoalScenario =
    state.elapsedTime < POWER_SHOT_UNLOCK_TIME ||
    Math.random() * totalChance < NORMAL_GOAL_CHANCE
      ? 'normal'
      : 'powerShot'
  const goal = createGoal(state, scenario)
  state.goals.push(goal)

  if (scenario === 'powerShot') {
    state.obstacles.push(createPowerShotBarrier(state, goal))
    state.powerShotGoalId = goal.id
  }

  state.obstaclesSinceLastGoal = 0
  state.timeSinceLastGoal = 0
}

function updateObstacles(state: GameSceneState, deltaTime: number) {
  state.nextObstacleSpawnIn -= deltaTime

  if (state.nextObstacleSpawnIn <= 0) {
    if (state.obstaclesSinceLastGoal >= MAX_OBSTACLES_WITHOUT_GOAL) {
      state.nextObstacleSpawnIn = GOAL_SPAWN_RETRY_DELAY
      state.nextGoalSpawnIn = Math.min(
        state.nextGoalSpawnIn,
        GOAL_SPAWN_RETRY_DELAY,
      )
    } else if (canSpawnObstacle(state)) {
      state.obstacles.push(createObstacle(state))
      state.obstaclesSinceLastGoal += 1
      state.timeSinceLastObstacle = 0
      state.nextObstacleSpawnIn = getRandomSpawnTime(state.elapsedTime)
    } else {
      state.nextObstacleSpawnIn = GOAL_SPAWN_RETRY_DELAY
    }
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
    if (
      state.ball.state === 'attached' &&
      state.powerShotGoalId === null &&
      isGoalSpawnAreaSafe(state)
    ) {
      spawnGoalScenario(state)
      state.nextGoalSpawnIn = getRandomGoalSpawnTime(state.elapsedTime)
    } else {
      state.nextGoalSpawnIn = GOAL_SPAWN_RETRY_DELAY
    }
  }

  state.goals = state.goals
    .map((goal) => ({
      ...goal,
      x: goal.x - state.speed * deltaTime,
      goalReactionTimer:
        goal.goalVisualState === 'goalReaction'
          ? Math.max(0, goal.goalReactionTimer - deltaTime)
          : goal.goalReactionTimer,
    }))
    .filter(
      (goal) =>
        goal.x + goal.width > -GOAL_REMOVE_PADDING &&
        (goal.goalVisualState !== 'goalReaction' ||
          goal.goalReactionTimer > 0),
    )

  if (
    state.powerShotGoalId !== null &&
    !state.goals.some((goal) => goal.id === state.powerShotGoalId)
  ) {
    clearPowerShotScenario(state)
  }
}

function getPlayerHitbox(state: GameSceneState): Rect {
  return {
    x: PLAYER_X - PLAYER_HITBOX_WIDTH / 2,
    y: state.playerY - PLAYER_HITBOX_OFFSET_Y,
    width: PLAYER_HITBOX_WIDTH,
    height: PLAYER_HITBOX_HEIGHT,
  }
}

function getNearestObstacleAhead(state: GameSceneState) {
  return state.obstacles.reduce<Obstacle | undefined>((nearest, obstacle) => {
    const distance = obstacle.x - PLAYER_X
    if (distance < 0 || distance > BALL_TUCK_WARNING_DISTANCE) return nearest
    if (!nearest || obstacle.x < nearest.x) return obstacle
    return nearest
  }, undefined)
}

function attachBallToPlayer(
  state: GameSceneState,
  deltaTime: number,
  snapToTarget = false,
) {
  const shouldTuck =
    !state.isGrounded || getNearestObstacleAhead(state) !== undefined
  const runPhase = state.elapsedTime * RUN_CYCLE_SPEED
  const offsetX = shouldTuck
    ? BALL_TUCK_OFFSET_X
    : BALL_ATTACHED_OFFSET_X + Math.sin(runPhase) * 3
  const offsetY = shouldTuck
    ? BALL_TUCK_OFFSET_Y
    : BALL_ATTACHED_OFFSET_Y + Math.abs(Math.sin(runPhase)) * 4
  const targetX = PLAYER_X + offsetX
  const targetY = state.playerY - offsetY
  const transition = snapToTarget
    ? 1
    : 1 - Math.exp(-BALL_ATTACHED_TRANSITION_SPEED * deltaTime)

  state.ball.x += (targetX - state.ball.x) * transition
  state.ball.y += (targetY - state.ball.y) * transition
  state.ball.velocityX = 0
  state.ball.velocityY = 0
}

function shootBall(state: GameSceneState) {
  if (state.isGameOver || state.ball.state !== 'attached') return

  state.ball.state = 'shot'
  state.ball.isPowerShot = state.powerShotGoalId !== null
  state.ball.velocityX = BALL_SHOT_SPEED_X
  state.ball.velocityY = BALL_SHOT_SPEED_Y
}

function clearPowerShotScenario(state: GameSceneState) {
  if (state.powerShotGoalId !== null) {
    const scenarioGoalId = state.powerShotGoalId
    state.goals = state.goals.filter(
      (goal) => goal.id !== scenarioGoalId || goal.isScored,
    )
    state.obstacles = state.obstacles.filter(
      (obstacle) => obstacle.powerShotGoalId !== scenarioGoalId,
    )
    state.powerShotGoalId = null
  }

  state.ball.isPowerShot = false
}

function resetBall(state: GameSceneState) {
  clearPowerShotScenario(state)

  state.ball.state = 'resetting'
  state.ball.velocityX = 0
  state.ball.velocityY = 0
  state.ball.resetTimer = BALL_RESET_DELAY
}

function segmentIntersectsExpandedRect(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  rect: Rect,
  padding: number,
) {
  const left = rect.x - padding
  const right = rect.x + rect.width + padding
  const top = rect.y - padding
  const bottom = rect.y + rect.height + padding
  const deltaX = toX - fromX
  const deltaY = toY - fromY
  let near = 0
  let far = 1

  for (const [start, delta, min, max] of [
    [fromX, deltaX, left, right],
    [fromY, deltaY, top, bottom],
  ]) {
    if (delta === 0) {
      if (start < min || start > max) return false
      continue
    }

    const first = (min - start) / delta
    const second = (max - start) / delta
    near = Math.max(near, Math.min(first, second))
    far = Math.min(far, Math.max(first, second))
    if (near > far) return false
  }

  return true
}

function checkBallGoalCollision(
  state: GameSceneState,
  previousX: number,
  previousY: number,
  deltaTime: number,
) {
  if (state.ball.state !== 'shot') return false

  const scoredGoal = state.goals.find((goal) => {
    if (goal.isScored) return false

    const goalLineX = goal.x + GOAL_POST_WIDTH / 2
    const previousGoalLineX = goalLineX + state.speed * deltaTime
    const previousBallFront = previousX + state.ball.radius
    const currentBallFront = state.ball.x + state.ball.radius
    const previousDistance = previousBallFront - previousGoalLineX
    const currentDistance = currentBallFront - goalLineX
    const crossedGoalLine = previousDistance <= 0 && currentDistance >= 0
    const crossingProgress = crossedGoalLine
      ? -previousDistance / (currentDistance - previousDistance)
      : 0
    const ballYAtGoal =
      previousY + (state.ball.y - previousY) * crossingProgress
    const goalOpeningTop = goal.y + GOAL_POST_WIDTH / 2
    const goalOpeningBottom = goal.y + goal.height
    const ballTop = ballYAtGoal - state.ball.radius
    const ballBottom = ballYAtGoal + state.ball.radius
    const overlapsOpening =
      ballBottom > goalOpeningTop && ballTop < goalOpeningBottom

    return crossedGoalLine && overlapsOpening
  })

  if (!scoredGoal) return false

  scoredGoal.isScored = true
  scoredGoal.goalVisualState = 'goalReaction'
  scoredGoal.goalReactionTimer = GOAL_NET_REACTION_TIME
  state.goalsScored += 1
  state.goalFeedbackTimer = GOAL_FEEDBACK_TIME
  return true
}

function checkShotObstacleCollision(
  state: GameSceneState,
  previousX: number,
  previousY: number,
  deltaTime: number,
) {
  if (state.ball.state !== 'shot') return false

  const collision = state.obstacles.find((obstacle) =>
    segmentIntersectsExpandedRect(
      previousX,
      previousY,
      state.ball.x,
      state.ball.y,
      { ...obstacle, width: obstacle.width + state.speed * deltaTime },
      state.ball.radius,
    ),
  )

  if (!collision) return false

  const canDestroy =
    state.ball.isPowerShot &&
    collision.destructible &&
    collision.powerShotGoalId === state.powerShotGoalId

  if (canDestroy) {
    state.obstacles = state.obstacles.filter(
      (obstacle) => obstacle.id !== collision.id,
    )
    state.destructionFeedbackTimer = DESTRUCTION_FEEDBACK_TIME
    state.destructionFeedbackX = collision.x + collision.width / 2
    state.destructionFeedbackY = collision.y + collision.height / 2
    return false
  }

  state.blockedFeedbackTimer = BLOCKED_FEEDBACK_TIME
  state.blockedFeedbackX = state.ball.x
  state.blockedFeedbackY = state.ball.y
  return true
}

function updateBall(state: GameSceneState, deltaTime: number) {
  if (state.ball.state === 'attached') {
    attachBallToPlayer(state, deltaTime)
    return
  }

  if (state.ball.state === 'resetting') {
    state.ball.resetTimer = Math.max(0, state.ball.resetTimer - deltaTime)
    if (state.ball.resetTimer === 0) {
      state.ball.state = 'attached'
      attachBallToPlayer(state, deltaTime, true)
    }
    return
  }

  const previousX = state.ball.x
  const previousY = state.ball.y
  const wasRolling =
    state.ball.y + state.ball.radius >= PLAYER_GROUND_Y - 0.5 &&
    state.ball.velocityY >= 0

  if (!wasRolling) {
    state.ball.velocityY += BALL_GRAVITY * deltaTime
  }
  state.ball.x += state.ball.velocityX * deltaTime
  state.ball.y += state.ball.velocityY * deltaTime

  if (
    state.ball.y + state.ball.radius >= PLAYER_GROUND_Y &&
    state.ball.velocityY >= 0
  ) {
    state.ball.y = PLAYER_GROUND_Y - state.ball.radius
    state.ball.velocityY = 0
    state.ball.velocityX = Math.max(
      0,
      state.ball.velocityX - BALL_ROLL_DECELERATION * deltaTime,
    )
  }

  const wasBlocked = checkShotObstacleCollision(
    state,
    previousX,
    previousY,
    deltaTime,
  )

  const wasGoal = checkBallGoalCollision(
    state,
    previousX,
    previousY,
    deltaTime,
  )
  if (wasGoal) {
    resetBall(state)
    return
  }

  if (wasBlocked) {
    resetBall(state)
    return
  }

  const stoppedRolling =
    wasRolling && state.ball.velocityX <= BALL_MIN_ROLL_SPEED
  if (stoppedRolling || state.ball.x - state.ball.radius > GAME_WIDTH) {
    resetBall(state)
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
  const difficulty = getDifficultySettings(state.elapsedTime)
  state.difficultyLevel = difficulty.level
  state.speed = difficulty.speed
  state.timeSinceLastGoal += deltaTime
  state.timeSinceLastObstacle += deltaTime
  state.groundOffset =
    (state.groundOffset + state.speed * deltaTime) % GROUND_PATTERN_WIDTH
  state.goalFeedbackTimer = Math.max(0, state.goalFeedbackTimer - deltaTime)
  state.destructionFeedbackTimer = Math.max(
    0,
    state.destructionFeedbackTimer - deltaTime,
  )
  if (state.destructionFeedbackTimer > 0) {
    state.destructionFeedbackX -= state.speed * deltaTime
  }
  state.blockedFeedbackTimer = Math.max(
    0,
    state.blockedFeedbackTimer - deltaTime,
  )
  if (state.blockedFeedbackTimer > 0) {
    state.blockedFeedbackX -= state.speed * deltaTime
  }

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
  updateBall(state, deltaTime)
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
    clearPowerShotScenario(sceneState)
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
      if (!event.repeat) shootBall(sceneState)
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
