import type { Team } from './team'

export type GameStatus = 'ready'
export type ObstacleType = 'cone' | 'barrier'

export interface Obstacle {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: ObstacleType
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
  isGameOver: boolean
  nextObstacleSpawnIn: number
  obstacleIdCounter: number
}
