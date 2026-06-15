import type { Team } from './team'

export type GameStatus = 'ready'

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
}
