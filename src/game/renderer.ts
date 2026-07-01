import type { GameSceneState } from '../types/game'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SHOW_DEBUG_HUD,
} from './constants'
import { drawBall } from './ballRenderer'
import {
  drawBlockedFeedback,
  drawDestructionFeedback,
  drawGoalFeedback,
  drawKickEffect,
  drawPowerShotFeedback,
} from './effectsRenderer'
import { drawGoals } from './goalRenderer'
import { drawObstacles } from './obstacleRenderer'
import { drawPlayer } from './playerSpriteRenderer'
import { drawGroundShadows, drawScenery } from './scenery'
import { GAME_THEME } from './theme'

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
  drawBlockedFeedback(context, state)
  drawKickEffect(context, state)
  drawBall(context, state)
  drawTeamName(context, state)
  drawGoalsCounter(context, state)
  if (SHOW_DEBUG_HUD) drawDifficultyDebug(context, state)
  drawPowerShotFeedback(context, state)
  drawGoalFeedback(context, state)
  drawGameOver(context, state)
}
