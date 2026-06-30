import type { GameSceneState } from '../types/game'
import {
  DESTRUCTION_FEEDBACK_TIME,
  GAME_HEIGHT,
  GAME_WIDTH,
  GOAL_POST_WIDTH,
  SHOW_DEBUG_HUD,
} from './constants'
import { drawPlayer } from './playerSpriteRenderer'
import { drawGroundShadows, drawScenery } from './scenery'
import { GAME_THEME } from './theme'

function drawObstacle(
  context: CanvasRenderingContext2D,
  obstacle: GameSceneState['obstacles'][number],
) {
  if (obstacle.type === 'cone') {
    context.fillStyle = GAME_THEME.cone
    context.beginPath()
    context.moveTo(obstacle.x + obstacle.width / 2, obstacle.y)
    context.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height)
    context.lineTo(obstacle.x, obstacle.y + obstacle.height)
    context.closePath()
    context.fill()

    context.fillStyle = GAME_THEME.ball
    context.fillRect(obstacle.x + 10, obstacle.y + obstacle.height - 22, 18, 7)
    return
  }

  if (obstacle.type === 'breakableBarrier') {
    context.fillStyle = GAME_THEME.breakable
    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    context.strokeStyle = GAME_THEME.powerShot
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

  context.fillStyle = GAME_THEME.barrier
  context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

  context.fillStyle = GAME_THEME.barrierInk
  context.fillRect(obstacle.x + 8, obstacle.y + 8, 10, obstacle.height - 16)
  context.fillRect(obstacle.x + obstacle.width - 18, obstacle.y + 8, 10, obstacle.height - 16)
  context.fillRect(obstacle.x + 8, obstacle.y + 18, obstacle.width - 16, 10)
}

function drawGoal(
  context: CanvasRenderingContext2D,
  goal: GameSceneState['goals'][number],
) {
  context.save()
  context.strokeStyle = GAME_THEME.goalFrame
  context.lineWidth = GOAL_POST_WIDTH
  context.lineCap = 'square'

  context.beginPath()
  context.moveTo(goal.x, goal.y + goal.height)
  context.lineTo(goal.x, goal.y)
  context.lineTo(goal.x + goal.width, goal.y)
  context.lineTo(goal.x + goal.width, goal.y + goal.height)
  context.stroke()

  context.strokeStyle = GAME_THEME.goalNet
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

  context.fillStyle = GAME_THEME.goalInterior
  context.fillRect(goal.x + 7, goal.y + 7, goal.width - 14, goal.height - 7)
  context.restore()
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
    gradient.addColorStop(0, GAME_THEME.powerShotFade)
    gradient.addColorStop(1, GAME_THEME.powerShotGlow)
    context.strokeStyle = gradient
    context.lineWidth = 10
    context.beginPath()
    context.moveTo(ball.x - 90, ball.y)
    context.lineTo(ball.x - ball.radius, ball.y)
    context.stroke()
  }

  context.strokeStyle = ball.isPowerShot
    ? GAME_THEME.powerShotStrong
    : GAME_THEME.kick
  context.lineWidth = 4
  context.beginPath()
  context.arc(ball.x + 8, ball.y, ball.radius + 8, -0.75, 0.75)
  context.stroke()

  context.fillStyle = GAME_THEME.kickStrong
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

  context.fillStyle = GAME_THEME.powerShot
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
    context.fillStyle = index % 2 === 0
      ? GAME_THEME.powerShot
      : GAME_THEME.powerFragment
    context.fillRect(
      Math.cos(angle) * distance - 4,
      Math.sin(angle) * distance - 4,
      8,
      8,
    )
  }

  context.fillStyle = GAME_THEME.hudText
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

  context.fillStyle = GAME_THEME.ball
  context.strokeStyle = GAME_THEME.ballInk
  context.lineWidth = 4
  context.beginPath()
  context.arc(0, 0, ball.radius, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.fillStyle = GAME_THEME.ballInk
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
  context.fillStyle = GAME_THEME.hudPanel
  context.beginPath()
  context.roundRect(32, 30, 270, 68, 18)
  context.fill()

  context.fillStyle = state.selectedTeam.colors.primary
  context.fillRect(50, 49, 8, 30)

  context.fillStyle = GAME_THEME.hudText
  context.font = '700 27px Inter, system-ui, sans-serif'
  context.textBaseline = 'middle'
  context.fillText(state.selectedTeam.name, 76, 65)
}

function drawGoalsCounter(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  context.fillStyle = GAME_THEME.hudPanel
  context.beginPath()
  context.roundRect(GAME_WIDTH - 216, 30, 184, 68, 18)
  context.fill()

  context.fillStyle = GAME_THEME.score
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
  context.fillStyle = GAME_THEME.hudPanelSoft
  context.beginPath()
  context.roundRect(32, GAME_HEIGHT - 58, 270, 34, 10)
  context.fill()

  context.fillStyle = GAME_THEME.hudTextSoft
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

  context.fillStyle = GAME_THEME.scoreGlow
  context.beginPath()
  context.arc(GAME_WIDTH / 2, 124, 98 + pulse, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = GAME_THEME.score
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

  context.fillStyle = GAME_THEME.overlay
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

  context.fillStyle = GAME_THEME.hudText
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
  drawScenery(context, state)
  drawGroundShadows(context, state)
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
