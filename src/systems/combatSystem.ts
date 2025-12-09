// Combat System - Stance-Based Fighting Logic

import { queries } from '../state/world';
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
  checkSwordHit(sword1, player2, player1);
  checkSwordHit(sword2, player1, player2);
}

function checkSwordHit(sword: Entity, defender: Entity, attacker: Entity): void {
  if (
    !sword.position || !sword.collider ||
    !defender.position || !defender.collider ||
    !defender.stance || !attacker.stance || !defender.health
  ) {
    return;
  }

  const collision = checkCollision(
    { x: sword.position.x, y: sword.position.y, w: sword.collider.w, h: sword.collider.h },
    { x: defender.position.x, y: defender.position.y, w: defender.collider.w, h: defender.collider.h }
  );

  if (collision) {
    // Rock-Paper-Scissors logic: High > Low > Mid > High
    const hit = isStanceAdvantage(attacker.stance.current, defender.stance.current);
    
    if (hit) {
      // Kill the defender
      defender.health.current = 0;
      console.log(`Player ${attacker.player?.id} killed Player ${defender.player?.id}!`);
    }
  }
}

function isStanceAdvantage(attackStance: 0 | 1 | 2, defenseStance: 0 | 1 | 2): boolean {
  // High (2) beats Low (0)
  if (attackStance === 2 && defenseStance === 0) return true;
  // Low (0) beats Mid (1)
  if (attackStance === 0 && defenseStance === 1) return true;
  // Mid (1) beats High (2)
  if (attackStance === 1 && defenseStance === 2) return true;
  
  return false;
}

function handleClash(player1: Entity, player2: Entity): void {
  // When stances match, swords clash
  // Could implement disarm logic, knockback, etc.
  console.log('Clash!');
  
  // Simple knockback
  if (player1.velocity) player1.velocity.x -= 2;
  if (player2.velocity) player2.velocity.x += 2;
}
