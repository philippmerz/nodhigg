// Game Configuration Constants

export const PHYSICS = {
  GRAVITY: 0.5,
  FRICTION: 0.85,
  JUMP_FORCE: -12,
  MOVE_SPEED: 5,
  MAX_FALL_SPEED: 15,
} as const;

export const GAME = {
  WIDTH: 800,
  HEIGHT: 600,
  FIXED_TIMESTEP: 1000 / 60, // 60 FPS
  BACKGROUND_COLOR: 0x2c3e50,
} as const;

export const PLAYER = {
  WIDTH: 20,
  HEIGHT: 40,
  SPAWN_P1_X: 200,
  SPAWN_P2_X: 600,
  SPAWN_Y: 300,
  STARTING_HEALTH: 1,
} as const;

export const SWORD = {
  WIDTH: 30,
  HEIGHT: 5,
  OFFSET_X: 25,
  OFFSET_Y: 0,
} as const;

export const STANCE = {
  LOW: 0,
  MID: 1,
  HIGH: 2,
  CHANGE_COOLDOWN: 200, // ms
} as const;

export const COLORS = {
  PLAYER_1: 0x3498db, // Blue
  PLAYER_2: 0xe74c3c, // Red
  SWORD: 0xecf0f1,    // White
  GROUND: 0x27ae60,   // Green
  WALL: 0x95a5a6,     // Gray
} as const;

export const LEVEL = {
  GROUND_Y: 500,
  GROUND_HEIGHT: 100,
} as const;
