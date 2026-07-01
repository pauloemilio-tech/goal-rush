import type { GameSceneState } from '../types/game'
import {
  BLOCKED_FEEDBACK_TIME,
  DESTRUCTION_FEEDBACK_TIME,
  GAME_WIDTH,
  GOAL_FEEDBACK_TIME,
} from './constants'
import { GAME_THEME } from './theme'

export function drawKickEffect(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.ball.state !== 'shot') return

  const { ball } = state
  context.save()
  context.strokeStyle = ball.isPowerShot
    ? GAME_THEME.powerShotStrong
    : GAME_THEME.kick
  context.lineWidth = ball.isPowerShot ? 5 : 3
  context.lineCap = 'round'
  context.beginPath()
  context.arc(ball.x + 8, ball.y, ball.radius + 8, -0.75, 0.75)
  context.stroke()

  if (!ball.isPowerShot) {
    context.fillStyle = GAME_THEME.kickStrong
    context.beginPath()
    context.moveTo(ball.x - ball.radius - 7, ball.y)
    context.lineTo(ball.x - ball.radius - 28, ball.y - 6)
    context.lineTo(ball.x - ball.radius - 28, ball.y + 6)
    context.closePath()
    context.fill()
  }
  context.restore()
}

export function drawPowerShotFeedback(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.powerShotGoalId === null && !state.ball.isPowerShot) return

  const pulse = 1 + Math.sin(state.elapsedTime * 10) * 0.04

  context.save()
  context.translate(GAME_WIDTH / 2, 126)
  context.scale(pulse, pulse)
  context.font = '900 29px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineWidth = 5
  context.strokeStyle = GAME_THEME.scoreOutline
  context.shadowColor = GAME_THEME.powerShot
  context.shadowBlur = 14
  context.strokeText('POWER SHOT', 0, 0)
  context.fillStyle = GAME_THEME.powerShot
  context.fillText('POWER SHOT', 0, 0)
  context.restore()
}

export function drawDestructionFeedback(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.destructionFeedbackTimer <= 0) return

  const progress =
    1 - state.destructionFeedbackTimer / DESTRUCTION_FEEDBACK_TIME
  const fade = 1 - progress

  context.save()
  context.translate(state.destructionFeedbackX, state.destructionFeedbackY)
  context.globalAlpha = fade

  for (let index = 0; index < 7; index += 1) {
    const angle = -0.5 + (Math.PI * 2 * index) / 7
    const distance = 10 + progress * 46
    const size = index % 2 === 0 ? 9 : 6
    context.save()
    context.translate(Math.cos(angle) * distance, Math.sin(angle) * distance)
    context.rotate(angle + progress * 3)
    context.fillStyle = index % 2 === 0
      ? GAME_THEME.powerShot
      : GAME_THEME.powerFragment
    context.fillRect(-size / 2, -size / 2, size, size)
    context.restore()
  }

  context.font = '900 18px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineWidth = 4
  context.strokeStyle = GAME_THEME.scoreOutline
  context.strokeText('BREAK!', 0, -39 - progress * 10)
  context.fillStyle = GAME_THEME.hudText
  context.fillText('BREAK!', 0, -39 - progress * 10)
  context.restore()
}

export function drawBlockedFeedback(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.blockedFeedbackTimer <= 0) return

  const progress = 1 - state.blockedFeedbackTimer / BLOCKED_FEEDBACK_TIME
  const fade = 1 - progress
  const x = state.blockedFeedbackX
  const y = state.blockedFeedbackY

  context.save()
  context.globalAlpha = fade
  context.strokeStyle = GAME_THEME.impact
  context.lineWidth = 3
  context.beginPath()
  context.arc(x, y, 14 + progress * 16, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = GAME_THEME.impactGlow
  context.beginPath()
  context.arc(x, y, 10 + progress * 12, 0, Math.PI * 2)
  context.fill()

  context.font = '900 15px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineWidth = 3
  context.strokeStyle = GAME_THEME.scoreOutline
  context.strokeText('BLOCKED', x, y - 32 - progress * 8)
  context.fillStyle = GAME_THEME.hudText
  context.fillText('BLOCKED', x, y - 32 - progress * 8)
  context.restore()
}

export function drawGoalFeedback(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  if (state.goalFeedbackTimer <= 0) return

  const progress = 1 - state.goalFeedbackTimer / GOAL_FEEDBACK_TIME
  const intro = Math.min(1, progress / 0.18)
  const outro = Math.min(1, state.goalFeedbackTimer / 0.22)
  const bounce = Math.sin(progress * Math.PI * 2.2) * 0.08 * outro
  const scale = (0.75 + intro * 0.35 + bounce) * outro

  context.save()
  context.translate(GAME_WIDTH / 2, 124)
  context.scale(scale, scale)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '900 58px Inter, system-ui, sans-serif'
  context.shadowColor = GAME_THEME.score
  context.shadowBlur = 20
  context.fillStyle = GAME_THEME.scoreGlow
  context.beginPath()
  context.roundRect(-118, -42, 236, 84, 18)
  context.fill()
  context.lineWidth = 7
  context.strokeStyle = GAME_THEME.scoreOutline
  context.strokeText('GOAL!', 0, 0)
  context.fillStyle = GAME_THEME.score
  context.fillText('GOAL!', 0, 0)
  context.restore()
}
