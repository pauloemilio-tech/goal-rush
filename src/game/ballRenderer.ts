import type { GameSceneState } from '../types/game'
import { GAME_THEME } from './theme'

type Ball = GameSceneState['ball']
type BallImageStatus = 'loading' | 'loaded' | 'error'

const BALL_VISUAL_SIZE = 34

const BALL_SPRITES = {
  ball1: {
    id: 'ball1',
    src: '/assets/sprites/balls/ball1.png',
    visualSize: BALL_VISUAL_SIZE,
  },
} as const

const selectedBallSprite = BALL_SPRITES.ball1
const ballSpriteImage = new Image()
let ballSpriteStatus: BallImageStatus = 'loading'

ballSpriteImage.addEventListener('load', () => {
  ballSpriteStatus = 'loaded'
})
ballSpriteImage.addEventListener('error', () => {
  ballSpriteStatus = 'error'
})
ballSpriteImage.src = selectedBallSprite.src

function drawBallTrail(context: CanvasRenderingContext2D, ball: Ball) {
  if (ball.state !== 'shot') return

  const trailLength = ball.isPowerShot ? 118 : 42
  const trailWidth = ball.isPowerShot ? 13 : 5
  const gradient = context.createLinearGradient(
    ball.x - trailLength,
    ball.y,
    ball.x - ball.radius,
    ball.y,
  )
  gradient.addColorStop(
    0,
    ball.isPowerShot ? GAME_THEME.powerShotFade : GAME_THEME.kickFade,
  )
  gradient.addColorStop(1, ball.isPowerShot ? GAME_THEME.powerShotGlow : GAME_THEME.kick)

  context.save()
  context.strokeStyle = gradient
  context.lineWidth = trailWidth
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(ball.x - trailLength, ball.y + (ball.isPowerShot ? 2 : 0))
  context.lineTo(ball.x - ball.radius, ball.y)
  context.stroke()

  if (ball.isPowerShot) {
    context.strokeStyle = GAME_THEME.powerShotStrong
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(ball.x - 62, ball.y - 10)
    context.lineTo(ball.x - ball.radius, ball.y - 4)
    context.moveTo(ball.x - 74, ball.y + 12)
    context.lineTo(ball.x - ball.radius - 2, ball.y + 5)
    context.stroke()
  }

  context.restore()
}

function drawBallAura(context: CanvasRenderingContext2D, ball: Ball, elapsedTime: number) {
  if (!ball.isPowerShot) return

  const pulse = Math.sin(elapsedTime * 18) * 2
  context.save()
  context.strokeStyle = GAME_THEME.powerShotGlow
  context.lineWidth = 4
  context.beginPath()
  context.arc(ball.x, ball.y, ball.radius + 7 + pulse, 0, Math.PI * 2)
  context.stroke()
  context.restore()
}

function drawProceduralBall(context: CanvasRenderingContext2D, ball: Ball) {
  const bodyGradient = context.createRadialGradient(
    -ball.radius * 0.36,
    -ball.radius * 0.42,
    2,
    0,
    0,
    ball.radius,
  )
  bodyGradient.addColorStop(0, GAME_THEME.ballHighlight)
  bodyGradient.addColorStop(0.58, GAME_THEME.ball)
  bodyGradient.addColorStop(1, GAME_THEME.ballShade)

  context.fillStyle = bodyGradient
  context.strokeStyle = GAME_THEME.ballInk
  context.lineWidth = 2.5
  context.beginPath()
  context.arc(0, 0, ball.radius, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.save()
  context.beginPath()
  context.arc(0, 0, ball.radius - 1, 0, Math.PI * 2)
  context.clip()

  context.fillStyle = GAME_THEME.ballInk
  context.strokeStyle = GAME_THEME.ballSeam
  context.lineWidth = 1.5

  context.beginPath()
  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5
    const x = Math.cos(angle) * 7
    const y = Math.sin(angle) * 7
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.fill()
  context.stroke()

  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5
    const panelX = Math.cos(angle) * (ball.radius * 0.56)
    const panelY = Math.sin(angle) * (ball.radius * 0.56)
    context.beginPath()
    context.ellipse(panelX, panelY, 4.8, 7.5, angle, 0, Math.PI * 2)
    context.fill()
    context.stroke()

    context.beginPath()
    context.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8)
    context.lineTo(panelX * 0.82, panelY * 0.82)
    context.stroke()
  }

  context.restore()

  context.fillStyle = GAME_THEME.ballHighlight
  context.beginPath()
  context.arc(-7, -8, 4, 0, Math.PI * 2)
  context.fill()
}

function drawBallSprite(context: CanvasRenderingContext2D) {
  if (ballSpriteStatus !== 'loaded') return false

  const size = selectedBallSprite.visualSize
  const offset = Math.round(size / 2)

  context.save()
  context.imageSmoothingEnabled = false
  context.drawImage(
    ballSpriteImage,
    -offset,
    -offset,
    size,
    size,
  )
  context.restore()
  return true
}

export function drawBall(context: CanvasRenderingContext2D, state: GameSceneState) {
  const { ball } = state
  const visualVelocity = ball.state === 'attached' ? state.speed : ball.velocityX
  const rotation = (state.elapsedTime * visualVelocity) / ball.radius

  drawBallTrail(context, ball)
  drawBallAura(context, ball, state.elapsedTime)

  context.save()
  context.translate(Math.round(ball.x), Math.round(ball.y))
  context.rotate(rotation)

  if (!drawBallSprite(context)) {
    drawProceduralBall(context, ball)
  }

  context.restore()
}

export const BALL_SPRITE_INFO = selectedBallSprite
