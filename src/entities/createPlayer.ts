// Player Entity Factory

import { PLAYER, SWORD, STANCE } from '../config';
import { world } from '../state/world';
import type { Entity } from '../types';

/**
 * Create a player entity and its associated sword
 * @param playerId - Player 1 or 2
 * @param x - Spawn X position
 * @param y - Spawn Y position
 * @param facingDirection - Initial facing direction (defaults based on player ID)
 */
export function createPlayer(
  playerId: 1 | 2,
  x: number,
  y: number,
  facingDirection?: 1 | -1
): string {
  const entityId = `player${playerId}`;
  const facing = facingDirection ?? (playerId === 1 ? 1 : -1);
  
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
      direction: facing,
    },
    attack: {
      isAttacking: false,
      extension: 0,
      isRetracting: false,
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
    position: { x: x + SWORD.OFFSET_X * facing, y: y + SWORD.OFFSET_Y },
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

/**
 * Remove a player entity and its associated sword from the world
 * @param playerId - Player 1 or 2
 * @returns The removed player entity (for accessing last known state), or undefined
 */
export function removePlayer(playerId: 1 | 2): Entity | undefined {
  const entityId = `player${playerId}`;
  const swordId = `sword${playerId}`;

  // Find the entities
  const playerEntity = world.entities.find(e => e.id === entityId);
  const swordEntity = world.entities.find(e => e.id === swordId);

  // Remove from world
  if (swordEntity) {
    world.remove(swordEntity);
  }
  if (playerEntity) {
    world.remove(playerEntity);
  }

  return playerEntity;
}
