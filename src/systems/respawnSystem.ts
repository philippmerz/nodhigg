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
 */
function respawnPlayer(entry: RespawnEntry): void {
  const { playerId, killerPosition, killerFacing } = entry;

  // Find the other player (the killer, if still alive)
  const otherPlayer = Array.from(queries.players).find(p => p.player?.id !== playerId);

  // Calculate spawn position
  let spawnX: number;
  let facingDirection: 1 | -1;
  const spawnY = LEVEL.GROUND_Y - PLAYER.HEIGHT;

  // Use current position of other player if available, otherwise use stored killer position
  const referenceX = otherPlayer?.position?.x ?? killerPosition?.x;
  const referenceFacing = otherPlayer?.facing?.direction ?? killerFacing;

  if (referenceX !== undefined && referenceFacing !== undefined) {
    // Try to spawn in front of the other player
    const frontX = referenceX + (referenceFacing * RESPAWN.DISTANCE);

    // Check if front position is within bounds
    if (frontX > 0 && frontX < GAME.WIDTH - PLAYER.WIDTH) {
      spawnX = frontX;
      // Face towards the other player
      facingDirection = referenceFacing > 0 ? -1 : 1;
    } else {
      // Spawn behind if front is out of bounds
      spawnX = referenceX - (referenceFacing * RESPAWN.DISTANCE);
      // Face towards the other player
      facingDirection = referenceFacing;
    }
  } else {
    // Fallback to default spawn positions
    spawnX = playerId === 1 ? PLAYER.SPAWN_P1_X : PLAYER.SPAWN_P2_X;
    facingDirection = playerId === 1 ? 1 : -1;
  }

  // Clamp spawn position to screen bounds
  spawnX = Math.max(PLAYER.WIDTH, Math.min(spawnX, GAME.WIDTH - PLAYER.WIDTH * 2));

  // Create the player entity fresh
  createPlayer(playerId, spawnX, spawnY, facingDirection);

  console.log(`Player ${playerId} respawned at (${spawnX.toFixed(0)}, ${spawnY.toFixed(0)})`);
}
