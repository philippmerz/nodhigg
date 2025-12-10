// Core ECS Component Types for Pixel Duel

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Collider {
  type: 'box';
  w: number;
  h: number;
  tag: 'player' | 'sword' | 'wall';
}

export interface Stance {
  current: 0 | 1 | 2; // 0=Low, 1=Mid, 2=High
  timer: number;
}

export interface Sword {
  parentId: string | null;  // null when sword is loose (dropped/flying)
  offset: { x: number; y: number };
  state: 'held' | 'flying' | 'grounded';
}

export interface Input {
  x: number; // -1, 0, 1
  jump: boolean;
  attack: boolean;
  stanceUp: boolean;
  stanceDown: boolean;
  pickup: boolean;
  // Edge detection (true only on frame button was pressed)
  jumpPressed: boolean;
  attackPressed: boolean;
  stanceUpPressed: boolean;
  stanceDownPressed: boolean;
  pickupPressed: boolean;
}

export interface Sprite {
  key: string; // Used to map to Pixi sprite
}

export interface Health {
  current: number;
  max: number;
}

export interface Player {
  id: 1 | 2; // Player 1 or Player 2
}

export interface Facing {
  direction: 1 | -1; // 1 = right, -1 = left
}

export interface Attack {
  isAttacking: boolean;      // Currently in attack animation
  extension: number;         // Current sword extension (0 to max)
  isRetracting: boolean;     // In retraction phase
}

// Complete Entity Type
export type Entity = {
  id: string;
  position?: Position;
  velocity?: Velocity;
  collider?: Collider;
  stance?: Stance;
  sword?: Sword;
  input?: Input;
  sprite?: Sprite;
  health?: Health;
  player?: Player;
  facing?: Facing;
  attack?: Attack;
};
