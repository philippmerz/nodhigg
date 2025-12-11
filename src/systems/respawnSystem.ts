// Respawn System - Handles player respawning
// Checks the RespawnManager for players ready to respawn and recreates their entities

import { updateRespawnTimers, type RespawnEntry } from '../state/respawnManager';
import { queries } from '../state/world';
import { createPlayer } from '../entities/createPlayer';
import { GAME, LEVEL, PLAYER, RESPAWN } from '../config';

/**
 * Update respawn timers and respawn players when ready
 */
export function updateRespawnSystem(deltaTime: number): void {
  // Update timers and get players ready to respawn
  const readyToRespawn = updateRespawnTimers(deltaTime);

  for (const entry of readyToRespawn) {
    respawnPlayer(entry);
  }
}

/**
 * Calculate spawn position and recreate the player entity
 * Players spawn in the way of the other player's stage succession direction
 */
function respawnPlayer(entry: RespawnEntry): void {
  const { playerId } = entry;

  // Find the other player (the killer, if still alive)
  const otherPlayer = Array.from(queries.players).find(p => p.player?.id !== playerId);

  // Calculate spawn position
  let spawnX: number;
  let facingDirection: 1 | -1;
  const spawnY = LEVEL.GROUND_Y - PLAYER.HEIGHT;

  const otherX = otherPlayer?.position?.x;

  if (otherX !== undefined) {
    // Determine the other player's progression direction
    // P1 progresses right (+1), P2 progresses left (-1)
    const otherPlayerId = otherPlayer?.player?.id;
    const otherProgressDirection = otherPlayerId === 1 ? 1 : -1;

    // Spawn in the way of their progression (in front of their goal)
    const blockingX = otherX + (otherProgressDirection * RESPAWN.DISTANCE);

    // Check if blocking position is within bounds
    if (blockingX > PLAYER.WIDTH && blockingX < GAME.WIDTH - PLAYER.WIDTH) {
      spawnX = blockingX;
      // Face towards the other player
      facingDirection = otherProgressDirection > 0 ? -1 : 1;
    } else {
      // No space in blocking direction, spawn on the other side
      spawnX = otherX - (otherProgressDirection * RESPAWN.DISTANCE);
      // Still face towards the other player
      facingDirection = otherProgressDirection;
      
      // Clamp to bounds
      spawnX = Math.max(PLAYER.WIDTH, Math.min(spawnX, GAME.WIDTH - PLAYER.WIDTH * 2));
    }
  } else {
    // Fallback to default spawn positions (no other player found)
    spawnX = playerId === 1 ? PLAYER.SPAWN_P1_X : PLAYER.SPAWN_P2_X;
    facingDirection = playerId === 1 ? 1 : -1;
  }

  // Create the player entity fresh
  createPlayer(playerId, spawnX, spawnY, facingDirection);

  console.log(`Player ${playerId} respawned at (${spawnX.toFixed(0)}, ${spawnY.toFixed(0)})`);
}
