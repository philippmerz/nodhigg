// Stage System - Handle stage progression checks and transitions

import { queries, world } from '../state/world';
import { SWORD } from '../config';
import {
  getStageState,
  canPlayerProgress,
  startTransition,
  updateTransition,
  getSpawnPositions,
} from '../state/stageManager';

/**
 * Check if players have reached progression conditions and handle transitions
 */
export function updateStageSystem(deltaTime: number): void {
  const state = getStageState();

  // Handle ongoing transition
  if (state.isTransitioning) {
    const shouldReset = updateTransition(deltaTime);
    if (shouldReset) {
      resetStageEntities();
    }
    return; // Don't check progression during transition
  }

  // Game already won - no more progression
  if (state.winner) return;

  // Check if either player can progress
  const players = Array.from(queries.players);

  for (const player of players) {
    if (!player.player || !player.position) continue;

    const playerId = player.player.id;
    const playerX = player.position.x;

    if (canPlayerProgress(playerId, playerX)) {
      startTransition(playerId);
      return; // Only one player can progress at a time
    }
  }
}

/**
 * Reset all entities for a new stage (called at transition midpoint)
 */
function resetStageEntities(): void {
  console.log('Resetting stage entities...');

  const spawns = getSpawnPositions();

  // Reset players to spawn positions
  for (const player of queries.players) {
    if (!player.player || !player.position || !player.velocity) continue;

    if (player.player.id === 1) {
      player.position.x = spawns.p1X;
      player.position.y = spawns.y;
    } else {
      player.position.x = spawns.p2X;
      player.position.y = spawns.y;
    }

    // Reset velocity
    player.velocity.x = 0;
    player.velocity.y = 0;

    // Reset attack state
    if (player.attack) {
      player.attack.isAttacking = false;
      player.attack.extension = 0;
      player.attack.isRetracting = false;
    }

    // Reset facing to default
    if (player.facing) {
      player.facing.direction = player.player.id === 1 ? 1 : -1;
    }
  }

  // Remove all loose swords (flying or grounded) and recreate held swords
  const looseSwords = world.entities.filter(
    (e) => e.sword && e.sword.state !== 'held'
  );
  for (const sword of looseSwords) {
    world.remove(sword);
  }

  // Ensure each player has a held sword
  for (const player of queries.players) {
    if (!player.player) continue;

    const playerId = player.player.id;
    const existingSword = world.entities.find(
      (e) => e.sword?.parentId === player.id && e.sword.state === 'held'
    );

    if (!existingSword) {
      // Create a new sword for this player
      const swordId = `sword${playerId}`;
      const facing = player.facing?.direction ?? (playerId === 1 ? 1 : -1);
      const spawnX = playerId === 1 ? spawns.p1X : spawns.p2X;

      // Remove any existing sword entity with this ID (shouldn't happen but safety)
      const oldSword = world.entities.find((e) => e.id === swordId);
      if (oldSword) world.remove(oldSword);

      world.add({
        id: swordId,
        sword: {
          parentId: player.id,
          offset: { x: 5, y: 0 },
          state: 'held',
        },
        position: { x: spawnX + 5 * facing, y: spawns.y },
        velocity: { x: 0, y: 0 },
        collider: {
          type: 'box',
          w: 30,
          h: 5,
          tag: 'sword',
        },
        sprite: {
          key: swordId,
        },
      });
    }
  }

  console.log('Stage entities reset complete');
}
