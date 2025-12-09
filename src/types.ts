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
  parentId: string;
  offset: { x: number; y: number };
}

export interface Input {
  x: number; // -1, 0, 1
  jump: boolean;
  attack: boolean;
  stanceUp: boolean;
  stanceDown: boolean;
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
};
