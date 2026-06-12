import { useEffect, useRef } from 'react'
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants'
import { startGameEngine } from '../game/engine'
import type { GameState } from '../types/game'

interface GameCanvasProps {
  gameState: GameState
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const pixelRatio = window.devicePixelRatio || 1
    canvas.width = GAME_WIDTH * pixelRatio
    canvas.height = GAME_HEIGHT * pixelRatio
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

    return startGameEngine(context, gameState)
  }, [gameState])

  return (
    <canvas
      aria-label={`Cena do jogo com a seleção ${gameState.selectedTeam.name}`}
      className="game-canvas"
      ref={canvasRef}
      role="img"
      style={{ aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}` }}
    />
  )
}
