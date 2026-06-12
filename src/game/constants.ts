export const GAME_WIDTH = 960
export const GAME_HEIGHT = 480
export const GROUND_HEIGHT = 112
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT

export const BASE_SPEED = 260
export const MAX_DELTA_TIME = 0.05
export const GROUND_PATTERN_WIDTH = 96

export const PLAYER_X = 300
export const RUN_CYCLE_SPEED = 11
export const BALL_DISTANCE = 82
export const BALL_RADIUS = 20

export const SCENE_COLORS = {
  skyTop: '#172b4f',
  skyBottom: '#35658a',
  ground: '#31a553',
  groundDark: '#17723a',
  line: '#ecf8e9',
  text: '#ffffff',
} as const
