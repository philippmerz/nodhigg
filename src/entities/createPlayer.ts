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
      pickup: false,
      jumpPressed: false,
      attackPressed: false,
      stanceUpPressed: false,
      stanceDownPressed: false,
      pickupPressed: false,
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

  // Check if a loose sword already exists for this player (from disarm before death)
  const swordId = `sword${playerId}`;
  const existingLooseSword = world.entities.find(
    (e) => e.id === swordId && e.sword && e.sword.state !== 'held'
  );

  // Only create a new sword if there isn't a loose one in the world
  if (!existingLooseSword) {
    world.add({
      id: swordId,
      sword: {
        parentId: entityId,
        offset: { x: SWORD.OFFSET_X, y: SWORD.OFFSET_Y },
        state: 'held',
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
  }
  // If a loose sword exists, player spawns unarmed and must pick it up

  return entityId;
}

/**
 * Remove a player entity and its associated held sword from the world
 * Flying or grounded swords are NOT removed (they persist in the world)
 * @param playerId - Player 1 or 2
 * @returns The removed player entity (for accessing last known state), or undefined
 */
export function removePlayer(playerId: 1 | 2): Entity | undefined {
  const entityId = `player${playerId}`;

  // Find the entities
  const playerEntity = world.entities.find(e => e.id === entityId);
  
  // Find sword that is held by this player (don't remove loose swords)
  const swordEntity = world.entities.find(
    e => e.sword?.parentId === entityId && e.sword.state === 'held'
  );

  // Remove held sword from world
  if (swordEntity) {
    world.remove(swordEntity);
  }
  
  // Remove player from world
  if (playerEntity) {
    world.remove(playerEntity);
  }

  return playerEntity;
}
