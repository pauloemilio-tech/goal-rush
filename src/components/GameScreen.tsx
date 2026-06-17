import { useCallback, useState } from 'react'
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
  const [isGameOver, setIsGameOver] = useState(false)
  const [restartSignal, setRestartSignal] = useState(0)

  const handleGameOverChange = useCallback((nextIsGameOver: boolean) => {
    setIsGameOver(nextIsGameOver)
  }, [])

  const handlePlayAgain = () => {
    setIsGameOver(false)
    setRestartSignal((currentSignal) => currentSignal + 1)
  }

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
          <GameCanvas
            gameState={gameState}
            onGameOverChange={handleGameOverChange}
            restartSignal={restartSignal}
          />
        </div>

        <footer className="game-footer">
          <span
            className="team-dot"
            style={{ backgroundColor: gameState.selectedTeam.colors.primary }}
          />
          <strong>{gameState.selectedTeam.name}</strong>
          <span className="game-status-text">
            {isGameOver ? 'Fim de jogo' : 'Cena inicial pronta para jogar'}
          </span>
          {isGameOver && (
            <button
              className="secondary-button play-again-button"
              onClick={handlePlayAgain}
              type="button"
            >
              Jogar novamente
            </button>
          )}
        </footer>
      </section>
    </main>
  )
}
