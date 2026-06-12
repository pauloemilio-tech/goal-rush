import type { Team } from '../types/team'

export const teams: Team[] = [
  {
    name: 'Brasil',
    slug: 'brasil',
    label: 'Verde e amarelo',
    colors: {
      primary: '#ffdf3f',
      secondary: '#149447',
      accent: '#1755a6',
    },
  },
  {
    name: 'Argentina',
    slug: 'argentina',
    label: 'Albiceleste',
    colors: {
      primary: '#75bde8',
      secondary: '#f8fbff',
      accent: '#e6b84a',
    },
  },
  {
    name: 'Chile',
    slug: 'chile',
    label: 'La Roja',
    colors: {
      primary: '#e6343e',
      secondary: '#f8fbff',
      accent: '#174b9b',
    },
  },
]
