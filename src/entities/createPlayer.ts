// Player Entity Factory

import { PLAYER, SWORD, STANCE } from '../config';
import { world } from '../state/world';

export function createPlayer(playerId: 1 | 2, x: number, y: number): string {
  const entityId = `player${playerId}`;
  
  // Create the player entity
  world.add({
    id: entityId,
    player: { id: playerId },
    position: { x, y },
    velocity: { x: 0, y: 0 },
    collider: {
      type: 'box',
      w: PLAYER.WIDTH,
      h: PLAYER.HEIGHT,
      tag: 'player',
    },
    stance: {
      current: STANCE.MID,
      timer: 0,
    },
    input: {
      x: 0,
      jump: false,
      attack: false,
      stanceUp: false,
      stanceDown: false,
    },
    sprite: {
      key: entityId,
    },
    health: {
      current: PLAYER.STARTING_HEALTH,
      max: PLAYER.STARTING_HEALTH,
    },
    facing: {
      direction: playerId === 1 ? 1 : -1, // P1 faces right, P2 faces left
    },
  });

  // Create the sword entity attached to the player
  const swordId = `sword${playerId}`;
  world.add({
    id: swordId,
    sword: {
      parentId: entityId,
      offset: { x: SWORD.OFFSET_X, y: SWORD.OFFSET_Y },
    },
    position: { x: x + SWORD.OFFSET_X, y: y + SWORD.OFFSET_Y },
    velocity: { x: 0, y: 0 },
    collider: {
      type: 'box',
      w: SWORD.WIDTH,
      h: SWORD.HEIGHT,
      tag: 'sword',
    },
    sprite: {
      key: swordId,
    },
  });

  return entityId;
}
