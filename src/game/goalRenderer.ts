import type { GameSceneState, Goal } from '../types/game'
import {
  GOAL_NET_REACTION_TIME,
  GOAL_POST_WIDTH,
} from './constants'
import { GAME_THEME } from './theme'

function getGoalReactionProgress(goal: Goal) {
  if (goal.goalVisualState !== 'goalReaction') return 0
  return 1 - goal.goalReactionTimer / GOAL_NET_REACTION_TIME
}

function getNetOffset(progress: number, netX: number, netY: number) {
  if (progress <= 0) return { x: 0, y: 0 }

  const clampedProgress = Math.min(1, Math.max(0, progress))
  const damping = (1 - clampedProgress) ** 2
  const snap = Math.sin(clampedProgress * Math.PI * 4.5)
  const centerBias = 1 - Math.min(1, Math.abs(netY - 46) / 58)
  const wave = Math.sin(netX * 0.1 + netY * 0.05)
  const strength = (5 + centerBias * 7) * damping * snap

  return {
    x: strength + wave * damping * 2,
    y: strength * 0.22,
  }
}

function drawGoalShadow(context: CanvasRenderingContext2D, goal: Goal) {
  context.fillStyle = GAME_THEME.entityShadow
  context.beginPath()
  context.ellipse(
    goal.x + goal.width / 2,
    goal.y + goal.height + 5,
    goal.width * 0.56,
    9,
    0,
    0,
    Math.PI * 2,
  )
  context.fill()
}

function drawBackStructure(context: CanvasRenderingContext2D, goal: Goal) {
  const depth = 13

  context.save()
  context.fillStyle = GAME_THEME.goalInterior
  context.fillRect(goal.x + 8, goal.y + 8, goal.width - 16, goal.height - 8)

  context.strokeStyle = GAME_THEME.goalPostEdge
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(goal.x + depth, goal.y + depth)
  context.lineTo(goal.x + goal.width + depth, goal.y + depth)
  context.lineTo(goal.x + goal.width + depth, goal.y + goal.height)
  context.moveTo(goal.x + depth, goal.y + depth)
  context.lineTo(goal.x + depth, goal.y + goal.height)
  context.stroke()

  context.strokeStyle = GAME_THEME.goalFrameShade
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(goal.x + goal.width, goal.y)
  context.lineTo(goal.x + goal.width + depth, goal.y + depth)
  context.moveTo(goal.x, goal.y)
  context.lineTo(goal.x + depth, goal.y + depth)
  context.stroke()
  context.restore()
}

function drawNet(context: CanvasRenderingContext2D, goal: Goal) {
  const progress = getGoalReactionProgress(goal)

  context.save()
  context.strokeStyle = GAME_THEME.goalNetDeep
  context.lineWidth = 2
  for (let netX = goal.x + 18; netX < goal.x + goal.width; netX += 18) {
    const topOffset = getNetOffset(progress, netX - goal.x, 8)
    const bottomOffset = getNetOffset(progress, netX - goal.x, goal.height)
    context.beginPath()
    context.moveTo(netX + topOffset.x, goal.y + 9 + topOffset.y)
    context.lineTo(netX + bottomOffset.x, goal.y + goal.height + bottomOffset.y)
    context.stroke()
  }

  context.strokeStyle = GAME_THEME.goalNet
  for (let netY = goal.y + 18; netY < goal.y + goal.height; netY += 18) {
    const leftOffset = getNetOffset(progress, 8, netY - goal.y)
    const rightOffset = getNetOffset(progress, goal.width, netY - goal.y)
    context.beginPath()
    context.moveTo(goal.x + 7 + leftOffset.x, netY + leftOffset.y)
    context.lineTo(
      goal.x + goal.width - 5 + rightOffset.x,
      netY + rightOffset.y,
    )
    context.stroke()
  }

  context.strokeStyle = GAME_THEME.goalNetDeep
  context.lineWidth = 1.4
  for (let diagonal = -goal.height; diagonal < goal.width; diagonal += 24) {
    const startX = Math.max(8, diagonal)
    const endX = Math.min(goal.width - 5, diagonal + goal.height)
    const startOffset = getNetOffset(progress, startX, 8)
    const endOffset = getNetOffset(progress, endX, goal.height)
    context.beginPath()
    context.moveTo(goal.x + startX + startOffset.x, goal.y + 8 + startOffset.y)
    context.lineTo(
      goal.x + endX + endOffset.x,
      goal.y + goal.height + endOffset.y,
    )
    context.stroke()
  }
  context.restore()
}

function drawFrontPosts(context: CanvasRenderingContext2D, goal: Goal) {
  context.save()
  context.strokeStyle = GAME_THEME.goalPostEdge
  context.lineWidth = GOAL_POST_WIDTH + 4
  context.lineCap = 'square'
  context.beginPath()
  context.moveTo(goal.x, goal.y + goal.height)
  context.lineTo(goal.x, goal.y)
  context.lineTo(goal.x + goal.width, goal.y)
  context.lineTo(goal.x + goal.width, goal.y + goal.height)
  context.stroke()

  context.strokeStyle = GAME_THEME.goalFrame
  context.lineWidth = GOAL_POST_WIDTH
  context.beginPath()
  context.moveTo(goal.x, goal.y + goal.height)
  context.lineTo(goal.x, goal.y)
  context.lineTo(goal.x + goal.width, goal.y)
  context.lineTo(goal.x + goal.width, goal.y + goal.height)
  context.stroke()
  context.restore()
}

function drawGoalHighlights(context: CanvasRenderingContext2D, goal: Goal) {
  context.save()
  context.strokeStyle = GAME_THEME.goalFrameShade
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(goal.x + 10, goal.y + 13)
  context.lineTo(goal.x + goal.width - 10, goal.y + 13)
  context.moveTo(goal.x + 10, goal.y + 13)
  context.lineTo(goal.x + 10, goal.y + goal.height - 3)
  context.stroke()
  context.restore()
}

function drawGoal(context: CanvasRenderingContext2D, goal: Goal) {
  const fadeTime = 0.1
  const alpha =
    goal.goalVisualState === 'goalReaction'
      ? Math.min(1, goal.goalReactionTimer / fadeTime)
      : 1

  context.save()
  context.globalAlpha = alpha
  drawGoalShadow(context, goal)
  drawBackStructure(context, goal)
  drawNet(context, goal)
  drawFrontPosts(context, goal)
  drawGoalHighlights(context, goal)
  context.restore()
}

export function drawGoals(
  context: CanvasRenderingContext2D,
  state: GameSceneState,
) {
  state.goals.forEach((goal) => drawGoal(context, goal))
}
