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

function drawBall(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const runPhase = state.elapsedTime * RUN_CYCLE_SPEED
  const ballX = PLAYER_X + BALL_DISTANCE + Math.sin(runPhase) * 3
  const ballBounce = state.isGrounded ? Math.abs(Math.sin(runPhase)) * 4 : 0
  const ballY = state.playerY - BALL_RADIUS - ballBounce

  context.save()
  context.translate(ballX, ballY)
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

export function renderGameScene(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  drawBackground(context)
  drawGround(context, state)
  drawPlayer(context, state)
  drawBall(context, state)
  drawTeamName(context, state)
}
