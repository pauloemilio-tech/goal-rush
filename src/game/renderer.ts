import type { GameState } from '../types/game'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_HEIGHT,
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

function drawGround(context: CanvasRenderingContext2D) {
  const groundY = GAME_HEIGHT - GROUND_HEIGHT

  context.fillStyle = SCENE_COLORS.ground
  context.fillRect(0, groundY, GAME_WIDTH, GROUND_HEIGHT)

  context.fillStyle = SCENE_COLORS.groundDark
  context.fillRect(0, GAME_HEIGHT - 18, GAME_WIDTH, 18)

  context.strokeStyle = SCENE_COLORS.line
  context.lineWidth = 4
  context.setLineDash([20, 16])
  context.beginPath()
  context.moveTo(0, groundY + 30)
  context.lineTo(GAME_WIDTH, groundY + 30)
  context.stroke()
  context.setLineDash([])
}

function drawPlayer(context: CanvasRenderingContext2D, state: GameState) {
  const playerX = 300
  const groundY = GAME_HEIGHT - GROUND_HEIGHT

  // Placeholder visual temporário para o jogador.
  context.fillStyle = '#d99a68'
  context.beginPath()
  context.arc(playerX, groundY - 102, 24, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = state.selectedTeam.colors.primary
  context.fillRect(playerX - 27, groundY - 78, 54, 58)

  context.fillStyle = state.selectedTeam.colors.secondary
  context.fillRect(playerX - 27, groundY - 68, 54, 12)

  context.strokeStyle = '#10213a'
  context.lineWidth = 12
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(playerX - 12, groundY - 20)
  context.lineTo(playerX - 20, groundY)
  context.moveTo(playerX + 12, groundY - 20)
  context.lineTo(playerX + 25, groundY)
  context.stroke()
}

function drawBall(context: CanvasRenderingContext2D) {
  const ballX = 385
  const ballY = GAME_HEIGHT - GROUND_HEIGHT - 20

  // Placeholder visual temporário para a bola.
  context.fillStyle = '#ffffff'
  context.strokeStyle = '#172033'
  context.lineWidth = 4
  context.beginPath()
  context.arc(ballX, ballY, 20, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.fillStyle = '#172033'
  context.beginPath()
  context.arc(ballX, ballY, 7, 0, Math.PI * 2)
  context.fill()
}

function drawTeamName(context: CanvasRenderingContext2D, state: GameState) {
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
  state: GameState,
) {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  drawBackground(context)
  drawGround(context)
  drawPlayer(context, state)
  drawBall(context)
  drawTeamName(context, state)
}
