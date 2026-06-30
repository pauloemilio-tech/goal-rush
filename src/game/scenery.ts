import type { GameSceneState } from '../types/game'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_PATTERN_WIDTH,
  GROUND_Y,
  PLAYER_GROUND_Y,
  PLAYER_X,
} from './constants'
import { GAME_THEME } from './theme'

const STADIUM_TOP = 178
const BOARD_TOP = 316
const BOARD_HEIGHT = 38
const FIELD_STRIPE_WIDTH = GROUND_PATTERN_WIDTH * 2
const FIELD_LINE_SPACING = FIELD_STRIPE_WIDTH * 4
const ADVERTISING_BOARD_WIDTH = 190
const ADVERTISING_LABELS = [
  'GOAL RUSH',
  'PLAY FAST',
  'SCORE MORE',
  'WORLD FOOTBALL',
  'RUN & SCORE',
]
const CLOUDS = [
  { x: 90, y: 76, scale: 0.82 },
  { x: 470, y: 118, scale: 0.58 },
  { x: 805, y: 62, scale: 0.72 },
]

function wrapOffset(value: number, width: number) {
  return ((value % width) + width) % width
}

function drawCloudShape(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  context.fillStyle = GAME_THEME.cloudShade
  context.beginPath()
  context.ellipse(3, 8, 62, 18, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = GAME_THEME.cloud
  context.beginPath()
  context.arc(-34, 0, 24, 0, Math.PI * 2)
  context.arc(-3, -13, 33, 0, Math.PI * 2)
  context.arc(32, 1, 25, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawSky(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const gradient = context.createLinearGradient(0, 0, 0, STADIUM_TOP + 70)
  gradient.addColorStop(0, GAME_THEME.skyTop)
  gradient.addColorStop(0.58, GAME_THEME.skyMiddle)
  gradient.addColorStop(1, GAME_THEME.skyHorizon)
  context.fillStyle = gradient
  context.fillRect(0, 0, GAME_WIDTH, STADIUM_TOP + 90)

  context.fillStyle = GAME_THEME.sun
  context.beginPath()
  context.arc(795, 76, 72, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = GAME_THEME.horizonGlow
  context.fillRect(0, STADIUM_TOP - 22, GAME_WIDTH, 72)

  const cloudOffset = wrapOffset(state.elapsedTime * 10, GAME_WIDTH + 260)
  CLOUDS.forEach((cloud) => {
    let cloudX = cloud.x - cloudOffset
    if (cloudX < -130) cloudX += GAME_WIDTH + 260
    drawCloudShape(context, cloudX, cloud.y, cloud.scale)
  })
}

function drawFloodlights(context: CanvasRenderingContext2D) {
  for (const x of [92, GAME_WIDTH - 92]) {
    context.strokeStyle = GAME_THEME.stadiumStructure
    context.lineWidth = 7
    context.beginPath()
    context.moveTo(x, STADIUM_TOP + 42)
    context.lineTo(x, 82)
    context.stroke()

    context.fillStyle = GAME_THEME.floodlightGlow
    context.beginPath()
    context.arc(x, 76, 42, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = GAME_THEME.floodlight
    context.fillRect(x - 28, 62, 56, 24)
    context.fillStyle = GAME_THEME.stadiumStructure
    for (let lightX = x - 20; lightX <= x + 20; lightX += 20) {
      context.fillRect(lightX - 3, 68, 6, 6)
    }
  }
}

function drawStadium(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  drawFloodlights(context)
  context.fillStyle = GAME_THEME.stadiumStructure
  context.beginPath()
  context.moveTo(0, STADIUM_TOP + 20)
  context.lineTo(110, STADIUM_TOP - 8)
  context.lineTo(GAME_WIDTH - 110, STADIUM_TOP - 8)
  context.lineTo(GAME_WIDTH, STADIUM_TOP + 20)
  context.lineTo(GAME_WIDTH, BOARD_TOP)
  context.lineTo(0, BOARD_TOP)
  context.closePath()
  context.fill()

  context.fillStyle = GAME_THEME.stadiumRoof
  context.fillRect(70, STADIUM_TOP - 17, GAME_WIDTH - 140, 18)

  const stadiumTravel = state.elapsedTime * state.speed * 0.08
  const stadiumOffset = wrapOffset(stadiumTravel, 30)
  const stadiumCycle = Math.floor(stadiumTravel / 30)
  for (let row = 0; row < 4; row += 1) {
    const rowY = STADIUM_TOP + 27 + row * 27
    context.fillStyle = row % 2 === 0
      ? GAME_THEME.stadiumTier
      : GAME_THEME.stadiumAisle
    context.fillRect(0, rowY - 8, GAME_WIDTH, 24)

    for (let x = -stadiumOffset; x < GAME_WIDTH + 20; x += 30) {
      const rawColorIndex =
        Math.floor((x + stadiumOffset) / 30) + row + stadiumCycle
      const colorIndex =
        ((rawColorIndex % GAME_THEME.crowd.length) + GAME_THEME.crowd.length) %
        GAME_THEME.crowd.length
      context.fillStyle = GAME_THEME.crowd[colorIndex]
      context.beginPath()
      context.arc(x + (row % 2) * 10, rowY, 4, 0, Math.PI * 2)
      context.fill()
    }
  }
}

function drawAdvertisingBoards(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const boardTravel = state.elapsedTime * state.speed * 0.22
  const offset = wrapOffset(boardTravel, ADVERTISING_BOARD_WIDTH)
  const boardCycle = Math.floor(boardTravel / ADVERTISING_BOARD_WIDTH)

  for (
    let x = -ADVERTISING_BOARD_WIDTH - offset, index = 0;
    x < GAME_WIDTH + ADVERTISING_BOARD_WIDTH;
    x += ADVERTISING_BOARD_WIDTH, index += 1
  ) {
    const visualIndex = index + boardCycle
    context.fillStyle = visualIndex % 2 === 0
      ? GAME_THEME.boardDark
      : GAME_THEME.boardLight
    context.fillRect(x, BOARD_TOP, ADVERTISING_BOARD_WIDTH - 3, BOARD_HEIGHT)
    context.fillStyle = state.selectedTeam.colors.primary
    context.fillRect(x, BOARD_TOP, ADVERTISING_BOARD_WIDTH - 3, 4)
    context.fillStyle = GAME_THEME.boardText
    context.font = '800 15px Inter, system-ui, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(
      ADVERTISING_LABELS[visualIndex % ADVERTISING_LABELS.length],
      x + ADVERTISING_BOARD_WIDTH / 2,
      BOARD_TOP + BOARD_HEIGHT / 2 + 2,
    )
  }
  context.textAlign = 'start'
}

function drawField(context: CanvasRenderingContext2D) {
  context.fillStyle = GAME_THEME.fieldLight
  context.fillRect(0, BOARD_TOP + BOARD_HEIGHT, GAME_WIDTH, GAME_HEIGHT)

  for (
    let stripeX = 0, stripeIndex = 0;
    stripeX < GAME_WIDTH;
    stripeX += FIELD_STRIPE_WIDTH
  ) {
    context.fillStyle = stripeIndex % 2 === 0
      ? GAME_THEME.fieldLight
      : GAME_THEME.fieldDark
    context.fillRect(
      stripeX,
      BOARD_TOP + BOARD_HEIGHT,
      FIELD_STRIPE_WIDTH,
      GAME_HEIGHT - BOARD_TOP - BOARD_HEIGHT,
    )
    stripeIndex += 1
  }

  context.fillStyle = GAME_THEME.groundShadow
  context.fillRect(0, GROUND_Y, GAME_WIDTH, 8)
  context.fillStyle = GAME_THEME.fieldDeep
  context.fillRect(0, GAME_HEIGHT - 16, GAME_WIDTH, 16)

  context.strokeStyle = GAME_THEME.fieldLine
  context.lineWidth = 3
  for (
    let x = FIELD_LINE_SPACING / 2;
    x < GAME_WIDTH;
    x += FIELD_LINE_SPACING
  ) {
    context.beginPath()
    context.moveTo(x, GROUND_Y + 3)
    context.lineTo(x, GAME_HEIGHT - 16)
    context.stroke()
  }

}

export function drawScenery(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  drawSky(context, state)
  drawStadium(context, state)
  drawAdvertisingBoards(context, state)
  drawField(context)
}

function drawEllipseShadow(
  context: CanvasRenderingContext2D,
  x: number,
  width: number,
  alphaScale = 1,
) {
  context.save()
  context.globalAlpha = alphaScale
  context.fillStyle = GAME_THEME.entityShadow
  context.beginPath()
  context.ellipse(x, PLAYER_GROUND_Y + 3, width, 7, 0, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

export function drawGroundShadows(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const playerHeight = Math.max(0, PLAYER_GROUND_Y - state.playerY)
  const playerAirRatio = Math.min(1, playerHeight / 150)
  drawEllipseShadow(
    context,
    PLAYER_X,
    34 - playerAirRatio * 10,
    1 - playerAirRatio * 0.42,
  )

  const ballHeight = Math.max(
    0,
    PLAYER_GROUND_Y - (state.ball.y + state.ball.radius),
  )
  const ballAirRatio = Math.min(1, ballHeight / 130)
  drawEllipseShadow(
    context,
    state.ball.x,
    state.ball.radius * (0.82 - ballAirRatio * 0.34),
    0.78 - ballAirRatio * 0.38,
  )

  state.obstacles.forEach((obstacle) => {
    drawEllipseShadow(
      context,
      obstacle.x + obstacle.width / 2,
      obstacle.width * 0.48,
      0.82,
    )
  })

  state.goals.forEach((goal) => {
    drawEllipseShadow(
      context,
      goal.x + goal.width / 2,
      goal.width * 0.52,
      0.55,
    )
  })
}
