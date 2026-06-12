import type { GameState } from '../types/game'
import { GameCanvas } from './GameCanvas'

interface GameScreenProps {
  gameState: GameState
  onBackToHome: () => void
}

export function GameScreen({
  gameState,
  onBackToHome,
}: GameScreenProps) {
  return (
    <main className="screen game-screen">
      <section className="game-shell">
        <header className="game-header">
          <div>
            <span className="step-label">Seleção escolhida</span>
            <h1>{gameState.selectedTeam.name}</h1>
            <span className="team-label">
              {gameState.selectedTeam.label}
            </span>
          </div>

          <button
            className="secondary-button"
            onClick={onBackToHome}
            type="button"
          >
            Voltar ao menu inicial
          </button>
        </header>

        <div className="canvas-frame">
          <GameCanvas gameState={gameState} />
        </div>

        <footer className="game-footer">
          <span
            className="team-dot"
            style={{ backgroundColor: gameState.selectedTeam.colors.primary }}
          />
          <strong>{gameState.selectedTeam.name}</strong>
          <span>Cena inicial pronta para jogar</span>
        </footer>
      </section>
    </main>
  )
}
