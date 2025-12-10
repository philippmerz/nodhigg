// Miniplex World Initialization

import { World } from 'miniplex';
import type { Entity } from '../types';

// Create the ECS World
export const world = new World<Entity>();

// Helpful queries for different entity types
export const queries = {
  players: world.with('player', 'position', 'velocity', 'collider', 'stance', 'input'),
  swords: world.with('sword', 'position', 'collider'),
  walls: world.with('collider', 'position').where((e) => e.collider.tag === 'wall'),
  sprites: world.with('sprite', 'position'),
  collidables: world.with('collider', 'position'),
};
