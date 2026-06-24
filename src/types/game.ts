import type { Team } from './team'

export type GameStatus = 'ready'
export type ObstacleType = 'cone' | 'barrier' | 'breakableBarrier'
export type GoalType = 'ground'
export type GoalScenario = 'normal' | 'powerShot'
export type BallState = 'attached' | 'shot' | 'resetting'

export interface Ball {
  x: number
  y: number
  velocityX: number
  velocityY: number
  radius: number
  state: BallState
  resetTimer: number
  isPowerShot: boolean
}

export interface Obstacle {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: ObstacleType
  destructible: boolean
  powerShotGoalId: number | null
}

export interface Goal {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: GoalType
  isScored: boolean
  scenario: GoalScenario
}

export interface GameState {
  status: GameStatus
  selectedTeam: Team
}

export interface GameSceneState extends GameState {
  elapsedTime: number
  groundOffset: number
  speed: number
  difficultyLevel: number
  playerY: number
  playerVelocityY: number
  isGrounded: boolean
  obstacles: Obstacle[]
  goals: Goal[]
  goalsScored: number
  ball: Ball
  goalFeedbackTimer: number
  powerShotGoalId: number | null
  destructionFeedbackTimer: number
  destructionFeedbackX: number
  destructionFeedbackY: number
  isGameOver: boolean
  nextObstacleSpawnIn: number
  nextGoalSpawnIn: number
  obstacleIdCounter: number
  goalIdCounter: number
  obstaclesSinceLastGoal: number
  timeSinceLastGoal: number
  timeSinceLastObstacle: number
}
