import type { GameSceneState } from '../types/game'
import { GAME_THEME } from './theme'

type Obstacle = GameSceneState['obstacles'][number]

function drawObstacleShadow(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  context.save()
  context.fillStyle = GAME_THEME.entityShadow
  context.beginPath()
  context.ellipse(
    obstacle.x + obstacle.width / 2,
    obstacle.y + obstacle.height + 4,
    obstacle.width * 0.58,
    8,
    0,
    0,
    Math.PI * 2,
  )
  context.fill()
  context.restore()
}

function drawCone(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  const baseY = obstacle.y + obstacle.height
  const centerX = obstacle.x + obstacle.width / 2

  drawObstacleShadow(context, obstacle)

  context.save()
  context.fillStyle = GAME_THEME.coneDark
  context.strokeStyle = GAME_THEME.coneOutline
  context.lineWidth = 2
  context.beginPath()
  context.roundRect(obstacle.x + 1, baseY - 12, obstacle.width - 2, 12, 3)
  context.fill()
  context.stroke()

  const coneGradient = context.createLinearGradient(
    obstacle.x,
    obstacle.y,
    obstacle.x + obstacle.width,
    obstacle.y,
  )
  coneGradient.addColorStop(0, GAME_THEME.coneDark)
  coneGradient.addColorStop(0.42, GAME_THEME.cone)
  coneGradient.addColorStop(1, GAME_THEME.coneLight)

  context.fillStyle = coneGradient
  context.beginPath()
  context.moveTo(centerX, obstacle.y + 2)
  context.lineTo(obstacle.x + obstacle.width - 5, baseY - 10)
  context.lineTo(obstacle.x + 5, baseY - 10)
  context.closePath()
  context.fill()
  context.stroke()

  context.fillStyle = GAME_THEME.coneLight
  context.beginPath()
  context.moveTo(centerX - 9, baseY - 31)
  context.lineTo(centerX + 11, baseY - 31)
  context.lineTo(centerX + 14, baseY - 23)
  context.lineTo(centerX - 12, baseY - 23)
  context.closePath()
  context.fill()

  context.fillStyle = GAME_THEME.coneShine
  context.beginPath()
  context.moveTo(centerX - 3, obstacle.y + 13)
  context.lineTo(centerX + 5, baseY - 16)
  context.lineTo(centerX, baseY - 16)
  context.closePath()
  context.fill()
  context.restore()
}

function drawBarrier(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  drawObstacleShadow(context, obstacle)

  context.save()
  context.strokeStyle = GAME_THEME.barrierInk
  context.lineWidth = 2

  context.fillStyle = GAME_THEME.barrierFrame
  context.beginPath()
  context.roundRect(obstacle.x + 5, obstacle.y + 5, 8, obstacle.height - 4, 3)
  context.roundRect(
    obstacle.x + obstacle.width - 13,
    obstacle.y + 5,
    8,
    obstacle.height - 4,
    3,
  )
  context.fill()
  context.stroke()

  context.fillStyle = GAME_THEME.barrier
  context.beginPath()
  context.roundRect(obstacle.x + 2, obstacle.y + 10, obstacle.width - 4, 12, 3)
  context.roundRect(obstacle.x + 2, obstacle.y + 27, obstacle.width - 4, 12, 3)
  context.fill()
  context.stroke()

  context.fillStyle = GAME_THEME.barrierStripe
  context.fillRect(obstacle.x + 12, obstacle.y + 12, 10, 8)
  context.fillRect(obstacle.x + obstacle.width - 24, obstacle.y + 29, 10, 8)

  context.fillStyle = GAME_THEME.barrierShadow
  context.fillRect(obstacle.x + 8, obstacle.y + obstacle.height - 4, 12, 5)
  context.fillRect(
    obstacle.x + obstacle.width - 20,
    obstacle.y + obstacle.height - 4,
    12,
    5,
  )
  context.restore()
}

function drawBreakableBarrier(
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
  elapsedTime: number,
) {
  const pulse = 0.75 + Math.sin(elapsedTime * 10) * 0.18

  drawObstacleShadow(context, obstacle)

  context.save()
  context.globalAlpha = pulse
  context.fillStyle = GAME_THEME.breakableGlow
  context.beginPath()
  context.roundRect(obstacle.x - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 10, 8)
  context.fill()
  context.restore()

  context.save()
  context.fillStyle = GAME_THEME.breakable
  context.strokeStyle = GAME_THEME.breakableDark
  context.lineWidth = 3
  context.beginPath()
  context.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5)
  context.fill()
  context.stroke()

  context.fillStyle = GAME_THEME.powerShot
  context.beginPath()
  context.moveTo(obstacle.x + obstacle.width * 0.56, obstacle.y + 10)
  context.lineTo(obstacle.x + obstacle.width * 0.34, obstacle.y + 36)
  context.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y + 36)
  context.lineTo(obstacle.x + obstacle.width * 0.38, obstacle.y + obstacle.height - 9)
  context.lineTo(obstacle.x + obstacle.width * 0.68, obstacle.y + 29)
  context.lineTo(obstacle.x + obstacle.width * 0.52, obstacle.y + 29)
  context.closePath()
  context.fill()

  context.strokeStyle = GAME_THEME.breakableCrack
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(obstacle.x + 10, obstacle.y + 14)
  context.lineTo(obstacle.x + 20, obstacle.y + 25)
  context.lineTo(obstacle.x + 15, obstacle.y + 38)
  context.moveTo(obstacle.x + obstacle.width - 10, obstacle.y + 18)
  context.lineTo(obstacle.x + obstacle.width - 22, obstacle.y + 31)
  context.lineTo(obstacle.x + obstacle.width - 15, obstacle.y + 47)
  context.moveTo(obstacle.x + 14, obstacle.y + obstacle.height - 14)
  context.lineTo(obstacle.x + 25, obstacle.y + obstacle.height - 24)
  context.stroke()

  context.strokeStyle = GAME_THEME.powerShotStrong
  context.lineWidth = 2
  context.strokeRect(
    obstacle.x + 5,
    obstacle.y + 5,
    obstacle.width - 10,
    obstacle.height - 10,
  )
  context.restore()
}

export function drawObstacles(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  state.obstacles.forEach((obstacle) => {
    if (obstacle.type === 'cone') {
      drawCone(context, obstacle)
      return
    }

    if (obstacle.type === 'breakableBarrier') {
      drawBreakableBarrier(context, obstacle, state.elapsedTime)
      return
    }

    drawBarrier(context, obstacle)
  })
}
