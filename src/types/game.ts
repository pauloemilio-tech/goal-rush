import type { Team } from './team'

export type GameStatus = 'ready'
export type ObstacleType = 'cone' | 'barrier'
export type GoalType = 'ground'

export interface Obstacle {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: ObstacleType
}

export interface Goal {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: GoalType
  isScored: boolean
}

export interface GameState {
  status: GameStatus
  selectedTeam: Team
}

export interface GameSceneState extends GameState {
  elapsedTime: number
  groundOffset: number
  speed: number
  playerY: number
  playerVelocityY: number
  isGrounded: boolean
  obstacles: Obstacle[]
  goals: Goal[]
  goalsScored: number
  isKicking: boolean
  kickTimer: number
  goalFeedbackTimer: number
  isGameOver: boolean
  nextObstacleSpawnIn: number
  nextGoalSpawnIn: number
  obstacleIdCounter: number
  goalIdCounter: number
}
