// Respawn Manager - Tracks respawn state outside of ECS
// This allows entities to be fully removed from the world while dead

import { RESPAWN } from '../config';

export interface RespawnEntry {
  playerId: 1 | 2;
  timer: number;
  killerPosition?: { x: number; y: number };
  killerFacing?: 1 | -1;
}

// Active respawn timers (keyed by player ID)
const respawnQueue = new Map<1 | 2, RespawnEntry>();

/**
 * Register a player for respawn after being killed
 */
export function registerRespawn(
  playerId: 1 | 2,
  killerPosition?: { x: number; y: number },
  killerFacing?: 1 | -1
): void {
  respawnQueue.set(playerId, {
    playerId,
    timer: RESPAWN.TIME,
    killerPosition,
    killerFacing,
  });
}

/**
 * Update all respawn timers
 * Returns list of players ready to respawn
 */
export function updateRespawnTimers(deltaTime: number): RespawnEntry[] {
  const readyToRespawn: RespawnEntry[] = [];

  for (const [playerId, entry] of respawnQueue.entries()) {
    entry.timer -= deltaTime;

    if (entry.timer <= 0) {
      readyToRespawn.push(entry);
      respawnQueue.delete(playerId);
    }
  }

  return readyToRespawn;
}

/**
 * Check if a player is currently waiting to respawn
 */
export function isPlayerRespawning(playerId: 1 | 2): boolean {
  return respawnQueue.has(playerId);
}

/**
 * Get remaining respawn time for a player (or 0 if not respawning)
 */
export function getRespawnTime(playerId: 1 | 2): number {
  return respawnQueue.get(playerId)?.timer ?? 0;
}

/**
 * Clear all respawn entries (for game reset)
 */
export function clearRespawnQueue(): void {
  respawnQueue.clear();
}
