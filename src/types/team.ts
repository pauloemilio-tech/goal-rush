export type TeamSlug = 'brasil' | 'argentina' | 'chile'

export interface TeamColors {
  primary: string
  secondary: string
  accent: string
}

export interface Team {
  name: string
  slug: TeamSlug
  colors: TeamColors
  label: string
}
