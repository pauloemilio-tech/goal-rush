import type { Team } from './team'

export type GameStatus = 'ready'

export interface GameState {
  status: GameStatus
  selectedTeam: Team
}
