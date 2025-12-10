// Combat System - Stance-Based Fighting Logic

import { queries } from '../state/world';
import { registerRespawn } from '../state/respawnManager';
import { removePlayer } from '../entities/createPlayer';
import type { Entity } from '../types';

// Check if two box colliders overlap
function checkCollision(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function updateCombatSystem(): void {
  // Get all swords and players
  const swords = Array.from(queries.swords);
  const players = Array.from(queries.players);

  // Need 2 players and 2 swords for combat
  if (swords.length < 2 || players.length < 2) return;

  const [sword1, sword2] = swords;
  const [player1, player2] = players;

  // Check sword-to-sword collision (Clash/Disarm)
  if (
    sword1.position && sword1.collider &&
    sword2.position && sword2.collider
  ) {
    const collision = checkCollision(
      { x: sword1.position.x, y: sword1.position.y, w: sword1.collider.w, h: sword1.collider.h },
      { x: sword2.position.x, y: sword2.position.y, w: sword2.collider.w, h: sword2.collider.h }
    );

    if (collision) {
      // If stances match, it's a clash (disarm logic could go here)
      if (player1.stance && player2.stance && player1.stance.current === player2.stance.current) {
        handleClash(player1, player2);
      }
    }
  }

  // Check sword-to-player collisions
  // Note: We check both, but only one kill can happen per frame
  // (the second check will fail because the player is removed)
  checkSwordHit(sword1, player2, player1);
  checkSwordHit(sword2, player1, player2);
}

function checkSwordHit(sword: Entity, defender: Entity, attacker: Entity): void {
  if (
    !sword.position || !sword.collider ||
    !defender.position || !defender.collider ||
    !defender.stance || !attacker.stance || !defender.health ||
    !defender.facing || !attacker.facing || !defender.player || !attacker.player
  ) {
    return;
  }

  const collision = checkCollision(
    { x: sword.position.x, y: sword.position.y, w: sword.collider.w, h: sword.collider.h },
    { x: defender.position.x, y: defender.position.y, w: defender.collider.w, h: defender.collider.h }
  );

  if (collision) {
    // Check if sword hit defender's back
    const defenderCenter = defender.position.x + defender.collider.w / 2;
    const swordCenter = sword.position.x + sword.collider.w / 2;
    
    // Sword is behind defender if:
    // - Defender faces right (1) and sword is to the left of defender
    // - Defender faces left (-1) and sword is to the right of defender
    const hitFromBehind = 
      (defender.facing.direction === 1 && swordCenter < defenderCenter) ||
      (defender.facing.direction === -1 && swordCenter > defenderCenter);

    if (hitFromBehind) {
      // Back hit is always lethal
      killPlayer(defender, attacker);
      console.log(`Player ${attacker.player.id} backstabbed Player ${defender.player.id}!`);
      return;
    }

    // Kill if stances are different (attacker's sword gets past defender's guard)
    if (attacker.stance.current !== defender.stance.current) {
      killPlayer(defender, attacker);
      console.log(`Player ${attacker.player.id} killed Player ${defender.player.id}!`);
    }
    // If stances match, the swords block each other (handled in physics)
  }
}

function killPlayer(defender: Entity, attacker: Entity): void {
  if (!defender.player || !attacker.position || !attacker.facing) return;
  
  const defenderId = defender.player.id;
  
  // Store attacker's position and facing for respawn calculation
  const killerPosition = { x: attacker.position.x, y: attacker.position.y };
  const killerFacing = attacker.facing.direction;
  
  // Remove the player (and sword) from the world entirely
  removePlayer(defenderId);
  
  // Register for respawn with killer info
  registerRespawn(defenderId, killerPosition, killerFacing);
}

function handleClash(player1: Entity, player2: Entity): void {
  // When stances match, swords clash
  // Could implement disarm logic, knockback, etc.
  console.log('Clash!');
  
  // Simple knockback
  if (player1.velocity) player1.velocity.x -= 2;
  if (player2.velocity) player2.velocity.x += 2;
}
