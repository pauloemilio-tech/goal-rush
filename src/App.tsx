import { useState } from 'react'
import { GameScreen } from './components/GameScreen'
import { HomeScreen } from './components/HomeScreen'
import type { GameState } from './types/game'
import type { Team } from './types/team'

function App() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const handleBackToHome = () => {
    setSelectedTeam(null)
  }

  const gameState: GameState | null = selectedTeam
    ? {
        status: 'ready',
        selectedTeam,
      }
    : null

  return (
    <div className="app">
      {gameState ? (
        <GameScreen
          gameState={gameState}
          onBackToHome={handleBackToHome}
        />
      ) : (
        <HomeScreen onSelectTeam={setSelectedTeam} />
      )}
    </div>
  )
}

export default App
