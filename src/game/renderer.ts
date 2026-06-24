import type { GameSceneState } from '../types/game'
import {
  DESTRUCTION_FEEDBACK_TIME,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_HEIGHT,
  GROUND_PATTERN_WIDTH,
  GROUND_Y,
  GOAL_POST_WIDTH,
  PLAYER_X,
  RUN_CYCLE_SPEED,
  SCENE_COLORS,
  SHOW_DEBUG_HUD,
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

  if (obstacle.type === 'breakableBarrier') {
    context.fillStyle = '#7c3aed'
    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    context.strokeStyle = '#67e8f9'
    context.lineWidth = 4
    context.strokeRect(
      obstacle.x + 2,
      obstacle.y + 2,
      obstacle.width - 4,
      obstacle.height - 4,
    )
    context.beginPath()
    context.moveTo(obstacle.x + 8, obstacle.y + 8)
    context.lineTo(
      obstacle.x + obstacle.width - 8,
      obstacle.y + obstacle.height - 8,
    )
    context.moveTo(obstacle.x + obstacle.width - 8, obstacle.y + 8)
    context.lineTo(obstacle.x + 8, obstacle.y + obstacle.height - 8)
    context.stroke()
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
  context.lineWidth = GOAL_POST_WIDTH
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

function drawKickEffect(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.ball.state !== 'shot') return

  const ball = state.ball

  if (ball.isPowerShot) {
    const gradient = context.createLinearGradient(
      ball.x - 100,
      ball.y,
      ball.x,
      ball.y,
    )
    gradient.addColorStop(0, 'rgba(103, 232, 249, 0)')
    gradient.addColorStop(1, 'rgba(103, 232, 249, 0.9)')
    context.strokeStyle = gradient
    context.lineWidth = 10
    context.beginPath()
    context.moveTo(ball.x - 90, ball.y)
    context.lineTo(ball.x - ball.radius, ball.y)
    context.stroke()
  }

  context.strokeStyle = ball.isPowerShot
    ? 'rgba(103, 232, 249, 0.95)'
    : 'rgba(250, 204, 21, 0.82)'
  context.lineWidth = 4
  context.beginPath()
  context.arc(ball.x + 8, ball.y, ball.radius + 8, -0.75, 0.75)
  context.stroke()

  context.fillStyle = 'rgba(250, 204, 21, 0.9)'
  context.beginPath()
  context.moveTo(ball.x - ball.radius - 8, ball.y)
  context.lineTo(ball.x - ball.radius - 30, ball.y - 7)
  context.lineTo(ball.x - ball.radius - 30, ball.y + 7)
  context.closePath()
  context.fill()
}

function drawPowerShotFeedback(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.powerShotGoalId === null && !state.ball.isPowerShot) return

  context.fillStyle = '#67e8f9'
  context.font = '900 30px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('POWER SHOT', GAME_WIDTH / 2, 128)
  context.textAlign = 'start'
}

function drawDestructionFeedback(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.destructionFeedbackTimer <= 0) return

  const progress =
    1 - state.destructionFeedbackTimer / DESTRUCTION_FEEDBACK_TIME
  context.save()
  context.translate(state.destructionFeedbackX, state.destructionFeedbackY)

  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6
    const distance = 12 + progress * 42
    context.fillStyle = index % 2 === 0 ? '#67e8f9' : '#a78bfa'
    context.fillRect(
      Math.cos(angle) * distance - 4,
      Math.sin(angle) * distance - 4,
      8,
      8,
    )
  }

  context.fillStyle = '#ffffff'
  context.font = '900 18px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText('BREAK!', 0, -38)
  context.restore()
}

function drawBall(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const ball = state.ball

  context.save()
  context.translate(ball.x, ball.y)
  context.rotate(state.elapsedTime * Math.max(state.speed, ball.velocityX) / ball.radius)

  context.fillStyle = '#ffffff'
  context.strokeStyle = '#172033'
  context.lineWidth = 4
  context.beginPath()
  context.arc(0, 0, ball.radius, 0, Math.PI * 2)
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

function drawDifficultyDebug(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  context.fillStyle = 'rgba(6, 18, 38, 0.62)'
  context.beginPath()
  context.roundRect(32, GAME_HEIGHT - 58, 270, 34, 10)
  context.fill()

  context.fillStyle = 'rgba(255, 255, 255, 0.82)'
  context.font = '600 15px Inter, system-ui, sans-serif'
  context.textBaseline = 'middle'
  context.fillText(
    `${state.elapsedTime.toFixed(1)}s  •  estágio ${state.difficultyLevel}  •  ${Math.round(state.speed)} px/s`,
    46,
    GAME_HEIGHT - 41,
  )
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
  drawDestructionFeedback(context, state)
  drawKickEffect(context, state)
  drawBall(context, state)
  drawTeamName(context, state)
  drawGoalsCounter(context, state)
  if (SHOW_DEBUG_HUD) drawDifficultyDebug(context, state)
  drawPowerShotFeedback(context, state)
  drawGoalFeedback(context, state)
  drawGameOver(context, state)
}
