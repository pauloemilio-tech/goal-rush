import type { Team } from '../types/team'

interface TeamSelectProps {
  teams: Team[]
  onSelectTeam: (team: Team) => void
}

export function TeamSelect({ teams, onSelectTeam }: TeamSelectProps) {
  return (
    <div className="team-grid" aria-label="Selecione sua seleção">
      {teams.map((team) => (
        <button
          className="team-card"
          key={team.slug}
          onClick={() => onSelectTeam(team)}
          style={{
            '--team-primary': team.colors.primary,
            '--team-secondary': team.colors.secondary,
            '--team-accent': team.colors.accent,
          } as React.CSSProperties}
          type="button"
        >
          <span className="team-card__flag" aria-hidden="true">
            <span />
          </span>
          <span className="team-card__content">
            <strong>{team.name}</strong>
            <small>{team.label}</small>
          </span>
          <span className="team-card__arrow" aria-hidden="true">
            →
          </span>
        </button>
      ))}
    </div>
  )
}
