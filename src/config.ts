// Game Configuration Constants

export const PHYSICS = {
  GRAVITY: 0.5,
  FRICTION: 0.85,
  JUMP_FORCE: -12,
  MOVE_SPEED: 5,
  MAX_FALL_SPEED: 15,
} as const;

export const GAME = {
  get WIDTH() { return window.innerWidth; },
  get HEIGHT() { return window.innerHeight; },
  FIXED_TIMESTEP: 1000 / 60, // 60 FPS
  BACKGROUND_COLOR: 0x2c3e50,
} as const;

export const PLAYER = {
  WIDTH: 20,
  HEIGHT: 40,
  get SPAWN_P1_X() { return window.innerWidth * 0.25; }, // 25% from left
  get SPAWN_P2_X() { return window.innerWidth * 0.75; }, // 75% from left
  get SPAWN_Y() { return window.innerHeight * 0.5; },    // 50% from top
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
  CHANGE_COOLDOWN: 50, // ms
} as const;

export const COLORS = {
  PLAYER_1: 0x3498db, // Blue
  PLAYER_2: 0xe74c3c, // Red
  SWORD: 0xecf0f1,    // White
  GROUND: 0x27ae60,   // Green
  WALL: 0x95a5a6,     // Gray
} as const;

export const LEVEL = {
  get GROUND_Y() { return window.innerHeight * 0.83; },     // 83% down screen
  get GROUND_HEIGHT() { return window.innerHeight * 0.17; }, // 17% of screen
} as const;
