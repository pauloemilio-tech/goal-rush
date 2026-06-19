export const GAME_WIDTH = 960
export const GAME_HEIGHT = 480
export const GROUND_HEIGHT = 112
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT

export const BASE_SPEED = 260
export const MAX_DELTA_TIME = 0.05
export const GROUND_PATTERN_WIDTH = 96

export const PLAYER_X = 300
export const PLAYER_GROUND_Y = GROUND_Y
export const PLAYER_HITBOX_WIDTH = 42
export const PLAYER_HITBOX_HEIGHT = 92
export const PLAYER_HITBOX_OFFSET_Y = 94
export const GRAVITY = 1900
export const JUMP_FORCE = 720
export const RUN_CYCLE_SPEED = 11
export const BALL_DISTANCE = 82
export const BALL_RADIUS = 20

export const OBSTACLE_MIN_SPAWN_TIME = 1.1
export const OBSTACLE_MAX_SPAWN_TIME = 2.1
export const OBSTACLE_START_X = GAME_WIDTH + 56
export const OBSTACLE_REMOVE_PADDING = 80
export const OBSTACLE_VARIANTS = {
  cone: {
    width: 38,
    height: 62,
  },
  barrier: {
    width: 56,
    height: 46,
  },
} as const

export const GOAL_WIDTH = 118
export const GOAL_HEIGHT = 92
export const GOAL_START_X = GAME_WIDTH + 120
export const GOAL_REMOVE_PADDING = 120
export const GOAL_SPAWN_MIN_TIME = 3.4
export const GOAL_SPAWN_MAX_TIME = 5.8
export const KICK_ACTIVE_TIME = 0.26
export const GOAL_DETECTION_RANGE = 54
export const GOAL_FEEDBACK_TIME = 1.05

export const SCENE_COLORS = {
  skyTop: '#172b4f',
  skyBottom: '#35658a',
  ground: '#31a553',
  groundDark: '#17723a',
  line: '#ecf8e9',
  text: '#ffffff',
} as const
