import type { GameSceneState } from '../types/game'
import {
  BALL_DISTANCE,
  BALL_RADIUS,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_HEIGHT,
  GROUND_PATTERN_WIDTH,
  GROUND_Y,
  PLAYER_X,
  RUN_CYCLE_SPEED,
  SCENE_COLORS,
} from './constants'

function drawObstacle(
  context: CanvasRenderingContext2D,
  obstacle: GameSceneState['obstacles'][number],
) {
  if (obstacle.type === 'cone') {
    context.fillStyle = '#f97316'
    context.beginPath()
    context.moveTo(obstacle.x + obstacle.width / 2, obstacle.y)
    context.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height)
    context.lineTo(obstacle.x, obstacle.y + obstacle.height)
    context.closePath()
    context.fill()

    context.fillStyle = '#ffffff'
    context.fillRect(obstacle.x + 10, obstacle.y + obstacle.height - 22, 18, 7)
    return
  }

  context.fillStyle = '#facc15'
  context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

  context.fillStyle = '#7c2d12'
  context.fillRect(obstacle.x + 8, obstacle.y + 8, 10, obstacle.height - 16)
  context.fillRect(obstacle.x + obstacle.width - 18, obstacle.y + 8, 10, obstacle.height - 16)
  context.fillRect(obstacle.x + 8, obstacle.y + 18, obstacle.width - 16, 10)
}

function drawGoal(
  context: CanvasRenderingContext2D,
  goal: GameSceneState['goals'][number],
) {
  context.save()
  context.strokeStyle = '#f8fafc'
  context.lineWidth = 7
  context.lineCap = 'square'

  context.beginPath()
  context.moveTo(goal.x, goal.y + goal.height)
  context.lineTo(goal.x, goal.y)
  context.lineTo(goal.x + goal.width, goal.y)
  context.lineTo(goal.x + goal.width, goal.y + goal.height)
  context.stroke()

  context.strokeStyle = 'rgba(219, 234, 254, 0.55)'
  context.lineWidth = 2
  for (let netX = goal.x + 18; netX < goal.x + goal.width; netX += 18) {
    context.beginPath()
    context.moveTo(netX, goal.y + 8)
    context.lineTo(netX, goal.y + goal.height)
    context.stroke()
  }

  for (let netY = goal.y + 18; netY < goal.y + goal.height; netY += 18) {
    context.beginPath()
    context.moveTo(goal.x + 4, netY)
    context.lineTo(goal.x + goal.width - 4, netY)
    context.stroke()
  }

  context.fillStyle = 'rgba(15, 23, 42, 0.28)'
  context.fillRect(goal.x + 7, goal.y + 7, goal.width - 14, goal.height - 7)
  context.restore()
}

function drawBackground(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, 0, GAME_HEIGHT)
  gradient.addColorStop(0, SCENE_COLORS.skyTop)
  gradient.addColorStop(1, SCENE_COLORS.skyBottom)

  context.fillStyle = gradient
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

  context.fillStyle = 'rgba(255, 255, 255, 0.08)'
  context.beginPath()
  context.arc(790, 90, 130, 0, Math.PI * 2)
  context.fill()
}

function drawGround(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  context.fillStyle = SCENE_COLORS.ground
  context.fillRect(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT)

  context.fillStyle = SCENE_COLORS.groundDark
  context.fillRect(0, GAME_HEIGHT - 18, GAME_WIDTH, 18)

  context.strokeStyle = SCENE_COLORS.line
  context.lineWidth = 4
  for (
    let markerX = -state.groundOffset;
    markerX < GAME_WIDTH;
    markerX += GROUND_PATTERN_WIDTH
  ) {
    context.beginPath()
    context.moveTo(markerX, GROUND_Y + 30)
    context.lineTo(markerX + 50, GROUND_Y + 30)
    context.stroke()
  }

  context.fillStyle = 'rgba(9, 74, 40, 0.34)'
  for (
    let patchX = GROUND_PATTERN_WIDTH / 2 - state.groundOffset;
    patchX < GAME_WIDTH;
    patchX += GROUND_PATTERN_WIDTH
  ) {
    context.beginPath()
    context.moveTo(patchX, GROUND_Y + 58)
    context.lineTo(patchX + 16, GROUND_Y + 44)
    context.lineTo(patchX + 32, GROUND_Y + 58)
    context.closePath()
    context.fill()
  }
}

function drawObstacles(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  state.obstacles.forEach((obstacle) => drawObstacle(context, obstacle))
}

function drawGoals(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  state.goals.forEach((goal) => drawGoal(context, goal))
}

function drawPlayer(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const runPhase = state.elapsedTime * RUN_CYCLE_SPEED
  const bodyBob = state.isGrounded ? Math.abs(Math.sin(runPhase)) * 4 : 0
  const legSwing = state.isGrounded ? Math.sin(runPhase) * 18 : 0
  const bodyY = state.playerY - bodyBob

  context.strokeStyle = '#10213a'
  context.lineWidth = 12
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(PLAYER_X - 12, bodyY - 20)
  context.lineTo(PLAYER_X - 12 + legSwing, state.playerY - 2)
  context.moveTo(PLAYER_X + 12, bodyY - 20)
  context.lineTo(PLAYER_X + 12 - legSwing, state.playerY - 2)
  context.stroke()

  context.fillStyle = '#d99a68'
  context.beginPath()
  context.arc(PLAYER_X, bodyY - 102, 24, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = state.selectedTeam.colors.primary
  context.fillRect(PLAYER_X - 27, bodyY - 78, 54, 58)

  context.fillStyle = state.selectedTeam.colors.secondary
  context.fillRect(PLAYER_X - 27, bodyY - 68, 54, 12)
}

function getBallPosition(
  state: GameSceneState,
) {
  const runPhase = state.elapsedTime * RUN_CYCLE_SPEED
  const ballBounce = state.isGrounded ? Math.abs(Math.sin(runPhase)) * 4 : 0

  return {
    x: PLAYER_X + BALL_DISTANCE + Math.sin(runPhase) * 3,
    y: state.playerY - BALL_RADIUS - ballBounce,
  }
}

function drawKickEffect(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (!state.isKicking) return

  const ball = getBallPosition(state)

  context.strokeStyle = 'rgba(250, 204, 21, 0.82)'
  context.lineWidth = 4
  context.beginPath()
  context.arc(ball.x + 8, ball.y, BALL_RADIUS + 12, -0.75, 0.75)
  context.stroke()

  context.fillStyle = 'rgba(250, 204, 21, 0.9)'
  context.beginPath()
  context.moveTo(ball.x + BALL_RADIUS + 16, ball.y)
  context.lineTo(ball.x + BALL_RADIUS + 34, ball.y - 8)
  context.lineTo(ball.x + BALL_RADIUS + 34, ball.y + 8)
  context.closePath()
  context.fill()
}

function drawBall(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const ball = getBallPosition(state)

  context.save()
  context.translate(ball.x, ball.y)
  context.rotate(state.elapsedTime * state.speed / BALL_RADIUS)

  context.fillStyle = '#ffffff'
  context.strokeStyle = '#172033'
  context.lineWidth = 4
  context.beginPath()
  context.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.fillStyle = '#172033'
  context.beginPath()
  context.arc(0, 0, 7, 0, Math.PI * 2)
  context.arc(0, -13, 3, 0, Math.PI * 2)
  context.arc(0, 13, 3, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawTeamName(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  context.fillStyle = 'rgba(6, 18, 38, 0.6)'
  context.beginPath()
  context.roundRect(32, 30, 270, 68, 18)
  context.fill()

  context.fillStyle = state.selectedTeam.colors.primary
  context.fillRect(50, 49, 8, 30)

  context.fillStyle = SCENE_COLORS.text
  context.font = '700 27px Inter, system-ui, sans-serif'
  context.textBaseline = 'middle'
  context.fillText(state.selectedTeam.name, 76, 65)
}

function drawGoalsCounter(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  context.fillStyle = 'rgba(6, 18, 38, 0.6)'
  context.beginPath()
  context.roundRect(GAME_WIDTH - 216, 30, 184, 68, 18)
  context.fill()

  context.fillStyle = '#facc15'
  context.font = '800 28px Inter, system-ui, sans-serif'
  context.textAlign = 'right'
  context.textBaseline = 'middle'
  context.fillText(`Gols ${state.goalsScored}`, GAME_WIDTH - 54, 65)
  context.textAlign = 'start'
}

function drawGoalFeedback(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.goalFeedbackTimer <= 0) return

  const pulse = Math.sin(state.elapsedTime * 18) * 4

  context.fillStyle = 'rgba(250, 204, 21, 0.18)'
  context.beginPath()
  context.arc(GAME_WIDTH / 2, 124, 98 + pulse, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#facc15'
  context.font = '900 58px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('GOAL!', GAME_WIDTH / 2, 124)
  context.textAlign = 'start'
}

function drawGameOver(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (!state.isGameOver) return

  context.fillStyle = 'rgba(5, 12, 26, 0.62)'
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

  context.fillStyle = SCENE_COLORS.text
  context.font = '800 52px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 22)

  context.font = '600 22px Inter, system-ui, sans-serif'
  context.fillText(
    'Pressione Enter ou use Jogar novamente',
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2 + 34,
  )

  context.textAlign = 'start'
}

export function renderGameScene(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  drawBackground(context)
  drawGround(context, state)
  drawGoals(context, state)
  drawObstacles(context, state)
  drawPlayer(context, state)
  drawKickEffect(context, state)
  drawBall(context, state)
  drawTeamName(context, state)
  drawGoalsCounter(context, state)
  drawGoalFeedback(context, state)
  drawGameOver(context, state)
}
