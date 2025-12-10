// Combat System - Game rules for kills and respawns

import { queries } from '../state/world';
import { registerRespawn } from '../state/respawnManager';
import { removePlayer } from '../entities/createPlayer';
import { recordKill } from '../state/stageManager';

/**
 * Kill a player and register them for respawn
 * Called directly by collisionSystem when a hit is detected
 */
export function killPlayer(defenderId: 1 | 2, attackerId: 1 | 2, isBackstab: boolean): void {
  // Find the attacker to get position for respawn calculation
  const attacker = Array.from(queries.players).find((p) => p.player?.id === attackerId);
  if (!attacker?.position || !attacker.facing) return;

  // Store attacker's position and facing for respawn calculation
  const killerPosition = { x: attacker.position.x, y: attacker.position.y };
  const killerFacing = attacker.facing.direction;

  // Remove the defender from the world
  removePlayer(defenderId);

  // Register for respawn with killer info
  registerRespawn(defenderId, killerPosition, killerFacing);

  // Record the kill for stage progression
  recordKill(attackerId);

  // Log the kill
  if (isBackstab) {
    console.log(`Player ${attackerId} backstabbed Player ${defenderId}!`);
  } else {
    console.log(`Player ${attackerId} killed Player ${defenderId}!`);
  }
}
