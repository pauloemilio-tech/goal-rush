import { teams } from '../data/teams'
import type { Team } from '../types/team'
import { TeamSelect } from './TeamSelect'

interface HomeScreenProps {
  onSelectTeam: (team: Team) => void
}

export function HomeScreen({ onSelectTeam }: HomeScreenProps) {
  return (
    <main className="screen home-screen">
      <section className="hero">
        <div className="eyebrow">
          <span className="eyebrow__ball" aria-hidden="true" />
          Endless football runner
        </div>

        <h1>
          Goal <span>Rush</span>
        </h1>

        <p>
          Corra pelo gramado, represente suas cores e prepare-se para uma
          aventura de futebol sem fim.
        </p>

        <div className="selection-panel">
          <div className="selection-panel__heading">
            <div>
              <span className="step-label">Primeiro passo</span>
              <h2>Escolha sua seleção</h2>
            </div>
            <span className="team-count">3 seleções</span>
          </div>

          <TeamSelect teams={teams} onSelectTeam={onSelectTeam} />
        </div>
      </section>
    </main>
  )
}
