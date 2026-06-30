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
export const GRAVITY = 1800
export const JUMP_FORCE = 720
export const RUN_CYCLE_SPEED = 11
export const BALL_RADIUS = 20
export const BALL_ATTACHED_OFFSET_X = 72
export const BALL_ATTACHED_OFFSET_Y = BALL_RADIUS
export const BALL_TUCK_WARNING_DISTANCE = 150
export const BALL_TUCK_OFFSET_X = 0
export const BALL_TUCK_OFFSET_Y = 32
export const BALL_ATTACHED_TRANSITION_SPEED = 12
export const BALL_SHOT_SPEED_X = 760
export const BALL_SHOT_SPEED_Y = -260
export const BALL_GRAVITY = 920
export const BALL_ROLL_DECELERATION = 180
export const BALL_MIN_ROLL_SPEED = 80
export const BALL_RESET_DELAY = 0.32

export const OBSTACLE_MIN_SPAWN_TIME = 2.2
export const OBSTACLE_MAX_SPAWN_TIME = 3.2
export const MIN_OBSTACLE_SPAWN_INTERVAL = 1.2
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
  breakableBarrier: {
    width: 52,
    height: 70,
  },
} as const

export const GOAL_WIDTH = 118
export const GOAL_HEIGHT = 92
export const GOAL_POST_WIDTH = 7
export const GOAL_START_X = GAME_WIDTH + 120
export const GOAL_REMOVE_PADDING = 120
export const GOAL_SPAWN_MIN_TIME = 4.2
export const GOAL_SPAWN_MAX_TIME = 5.5
export const MIN_GOAL_SPAWN_INTERVAL = 2.8
export const GOAL_FEEDBACK_TIME = 1.05
export const GOAL_MIN_DISTANCE_FROM_OBSTACLE = 180
export const GOAL_MIN_DISTANCE_FROM_OTHER_GOAL = 600
export const GOAL_SAFE_APPROACH_DISTANCE = 420
export const GOAL_SAFE_EXIT_DISTANCE = 200
export const GOAL_SPAWN_RETRY_DELAY = 0.7
export const NORMAL_GOAL_CHANCE = 0.9
export const POWER_SHOT_GOAL_CHANCE = 0.1
export const POWER_SHOT_BARRIER_DISTANCE = 210
export const DESTRUCTION_FEEDBACK_TIME = 0.5
export const MAX_OBSTACLES_WITHOUT_GOAL = 2
export const MAX_GAME_SPEED = 360
export const POWER_SHOT_UNLOCK_TIME = 20
export const DIFFICULTY_STAGE_2_TIME = 20
export const DIFFICULTY_STAGE_3_TIME = 45
export const DIFFICULTY_STAGE_4_TIME = 75
export const DIFFICULTY_MAX_TIME = 120
export const SHOW_DEBUG_HUD = false
