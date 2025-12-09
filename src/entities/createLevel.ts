// Level Entity Factory

import { GAME, LEVEL } from '../config';
import { world } from '../state/world';

export function createLevel(): void {
  // Create the ground
  world.add({
    id: 'ground',
    position: { x: 0, y: LEVEL.GROUND_Y },
    collider: {
      type: 'box',
      w: GAME.WIDTH,
      h: LEVEL.GROUND_HEIGHT,
      tag: 'wall',
    },
    sprite: {
      key: 'ground',
    },
  });

  // Create left wall
  world.add({
    id: 'wall-left',
    position: { x: -50, y: 0 },
    collider: {
      type: 'box',
      w: 50,
      h: GAME.HEIGHT,
      tag: 'wall',
    },
    sprite: {
      key: 'wall-left',
    },
  });

  // Create right wall
  world.add({
    id: 'wall-right',
    position: { x: GAME.WIDTH, y: 0 },
    collider: {
      type: 'box',
      w: 50,
      h: GAME.HEIGHT,
      tag: 'wall',
    },
    sprite: {
      key: 'wall-right',
    },
  });
}
