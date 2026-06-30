import type { GameSceneState } from '../types/game'
import type { Team } from '../types/team'
import { PLAYER_X, RUN_CYCLE_SPEED } from './constants'
import { GAME_THEME } from './theme'

interface Point {
  x: number
  y: number
}

interface PlayerPose {
  bob: number
  lean: number
  leftElbow: Point
  leftHand: Point
  rightElbow: Point
  rightHand: Point
  leftKnee: Point
  leftFoot: Point
  rightKnee: Point
  rightFoot: Point
}

interface UniformColors {
  shirt: string
  detail: string
  shorts: string
  number: string
}

const PLAYER_SCALE = 3

function getUniformColors(team: Team): UniformColors {
  if (team.slug === 'argentina') {
    return {
      shirt: team.colors.secondary,
      detail: team.colors.primary,
      shorts: GAME_THEME.uniformDark,
      number: GAME_THEME.uniformDark,
    }
  }

  return {
    shirt: team.colors.primary,
    detail: team.colors.secondary,
    shorts: team.colors.accent,
    number: GAME_THEME.uniformWhite,
  }
}

function getRunningPose(elapsedTime: number): PlayerPose {
  const phase = elapsedTime * RUN_CYCLE_SPEED * 0.82
  const stride = Math.sin(phase)

  return {
    bob: Math.abs(Math.sin(phase * 2)) * 0.65,
    lean: 1.2,
    leftElbow: { x: -5 - stride * 1.5, y: -19 },
    leftHand: { x: -4 - stride * 3.5, y: -14 },
    rightElbow: { x: 6 + stride * 1.5, y: -20 },
    rightHand: { x: 5 + stride * 3.5, y: -15 },
    leftKnee: { x: -2 + stride * 2.2, y: -6 },
    leftFoot: { x: -3 + stride * 4.8, y: -1 },
    rightKnee: { x: 2 - stride * 2.2, y: -6 },
    rightFoot: { x: 3 - stride * 4.8, y: -1 },
  }
}

function getJumpPose(): PlayerPose {
  return {
    bob: 0,
    lean: 1,
    leftElbow: { x: -7, y: -20 },
    leftHand: { x: -6, y: -15 },
    rightElbow: { x: 8, y: -20 },
    rightHand: { x: 7, y: -15 },
    leftKnee: { x: -5, y: -5 },
    leftFoot: { x: -1, y: -2 },
    rightKnee: { x: 5, y: -5 },
    rightFoot: { x: 1, y: -3 },
  }
}

function getKickPose(): PlayerPose {
  return {
    bob: 0.4,
    lean: 2,
    leftElbow: { x: -7, y: -21 },
    leftHand: { x: -9, y: -16 },
    rightElbow: { x: 7, y: -19 },
    rightHand: { x: 8, y: -14 },
    leftKnee: { x: -3, y: -6 },
    leftFoot: { x: -4, y: -1 },
    rightKnee: { x: 7, y: -7 },
    rightFoot: { x: 15, y: -6 },
  }
}

function getGameOverPose(): PlayerPose {
  return {
    bob: 0,
    lean: 2.4,
    leftElbow: { x: -4, y: -18 },
    leftHand: { x: -3, y: -12 },
    rightElbow: { x: 7, y: -18 },
    rightHand: { x: 6, y: -12 },
    leftKnee: { x: -2, y: -6 },
    leftFoot: { x: -3, y: -1 },
    rightKnee: { x: 3, y: -6 },
    rightFoot: { x: 4, y: -1 },
  }
}

function getPose(state: GameSceneState) {
  if (state.isGameOver) return getGameOverPose()
  if (state.ball.state === 'shot' && state.ball.x < PLAYER_X + 200) {
    return getKickPose()
  }
  if (!state.isGrounded) return getJumpPose()
  return getRunningPose(state.elapsedTime)
}

function drawSegment(
  context: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number,
) {
  context.lineCap = 'square'
  context.lineJoin = 'miter'
  context.strokeStyle = GAME_THEME.playerOutline
  context.lineWidth = width + 1.7
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.stroke()
  context.strokeStyle = color
  context.lineWidth = width
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.stroke()
}

function drawArm(
  context: CanvasRenderingContext2D,
  shoulder: Point,
  elbow: Point,
  hand: Point,
  shirt: string,
) {
  drawSegment(context, shoulder, elbow, shirt, 2.4)
  drawSegment(context, elbow, hand, GAME_THEME.playerSkin, 2)
  context.fillStyle = GAME_THEME.playerOutline
  context.fillRect(hand.x - 1.5, hand.y - 1.5, 3, 3)
  context.fillStyle = GAME_THEME.playerSkin
  context.fillRect(hand.x - 1, hand.y - 1, 2, 2)
}

function drawBoot(
  context: CanvasRenderingContext2D,
  foot: Point,
) {
  context.fillStyle = GAME_THEME.playerOutline
  context.fillRect(foot.x - 2.5, foot.y - 1.5, 6.5, 3.5)
  context.fillStyle = GAME_THEME.boot
  context.fillRect(foot.x - 2, foot.y - 1, 5.5, 2.5)
  context.fillStyle = GAME_THEME.bootSole
  context.fillRect(foot.x - 1.5, foot.y + 1, 5, 0.7)
}

function drawLeg(
  context: CanvasRenderingContext2D,
  hip: Point,
  knee: Point,
  foot: Point,
) {
  drawSegment(context, hip, knee, GAME_THEME.playerSkin, 3)
  drawSegment(context, knee, foot, GAME_THEME.uniformWhite, 2.8)
  drawBoot(context, foot)
}

function createShirtPath(
  context: CanvasRenderingContext2D,
  lean: number,
) {
  context.beginPath()
  context.moveTo(lean - 4, -27)
  context.lineTo(lean + 5, -27)
  context.lineTo(lean + 6, -23)
  context.lineTo(lean + 4, -15)
  context.lineTo(lean - 4, -15)
  context.lineTo(lean - 5, -23)
  context.closePath()
}

function drawShirt(
  context: CanvasRenderingContext2D,
  pose: PlayerPose,
  colors: UniformColors,
  team: Team,
) {
  createShirtPath(context, pose.lean)
  context.fillStyle = colors.shirt
  context.fill()
  context.strokeStyle = GAME_THEME.playerOutline
  context.lineWidth = 1.4
  context.stroke()

  context.save()
  createShirtPath(context, pose.lean)
  context.clip()
  context.fillStyle = colors.detail
  if (team.slug === 'argentina') {
    context.fillRect(pose.lean - 2.5, -28, 2.2, 14)
    context.fillRect(pose.lean + 2.2, -28, 2.2, 14)
  } else {
    context.fillRect(pose.lean - 6, -21, 13, 2)
  }
  context.restore()

  context.fillStyle = colors.number
  context.font = '900 5px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('7', pose.lean + 0.5, -18)
  context.textAlign = 'start'
}

function drawShorts(
  context: CanvasRenderingContext2D,
  pose: PlayerPose,
  color: string,
) {
  context.fillStyle = GAME_THEME.playerOutline
  context.fillRect(pose.lean - 4.8, -16, 10, 6.5)
  context.fillStyle = color
  context.fillRect(pose.lean - 4.1, -15.3, 8.6, 4.8)
  context.fillStyle = GAME_THEME.playerOutline
  context.fillRect(pose.lean - 0.3, -12.5, 1.2, 3)
}

function drawHead(
  context: CanvasRenderingContext2D,
  pose: PlayerPose,
) {
  const headX = pose.lean + 0.5
  context.fillStyle = GAME_THEME.playerOutline
  context.fillRect(headX - 5.5, -38, 12, 12)
  context.fillStyle = GAME_THEME.playerSkin
  context.fillRect(headX - 4.5, -37, 10, 10)
  context.fillStyle = GAME_THEME.playerSkinShade
  context.fillRect(headX + 5.5, -33.5, 2, 3)
  context.fillStyle = GAME_THEME.playerHair
  context.fillRect(headX - 4.5, -37, 10, 3)
  context.fillRect(headX - 5.5, -36, 3, 6)
  context.fillRect(headX - 3.5, -38.5, 7, 2)
  context.fillStyle = GAME_THEME.playerOutline
  context.fillRect(headX + 2.5, -32.5, 1.2, 1.2)
  context.fillStyle = GAME_THEME.playerSkinShade
  context.fillRect(headX - 1.5, -27, 4, 2)
}

export function drawPlayer(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  const pose = getPose(state)
  const colors = getUniformColors(state.selectedTeam)
  const leftShoulder = { x: pose.lean - 4, y: -24 }
  const rightShoulder = { x: pose.lean + 5, y: -24 }
  const leftHip = { x: pose.lean - 2.5, y: -11 }
  const rightHip = { x: pose.lean + 2.8, y: -11 }

  context.save()
  context.translate(PLAYER_X, state.playerY - pose.bob * PLAYER_SCALE)
  context.scale(PLAYER_SCALE, PLAYER_SCALE)
  drawArm(
    context,
    leftShoulder,
    pose.leftElbow,
    pose.leftHand,
    colors.shirt,
  )
  drawLeg(context, leftHip, pose.leftKnee, pose.leftFoot)
  drawShirt(context, pose, colors, state.selectedTeam)
  drawShorts(context, pose, colors.shorts)
  drawLeg(context, rightHip, pose.rightKnee, pose.rightFoot)
  drawArm(
    context,
    rightShoulder,
    pose.rightElbow,
    pose.rightHand,
    colors.shirt,
  )
  drawHead(context, pose)
  context.restore()
}
