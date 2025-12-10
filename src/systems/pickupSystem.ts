// Pickup System - Handle players picking up grounded swords

import { queries } from '../state/world';
import { boxesOverlap, entityToBox } from '../utils/collision';
import { SWORD } from '../config';
import type { Entity } from '../types';

/**
 * Check for unarmed players trying to pick up grounded swords
 */
export function updatePickupSystem(): void {
  const players = Array.from(queries.players);
  const swords = Array.from(queries.swords);

  for (const player of players) {
    if (!player.player || !player.position || !player.collider || !player.input) continue;

    // Check if player pressed pickup
    if (!player.input.pickupPressed) continue;

    // Check if player is already armed
    const hasOwnSword = swords.some(
      (s) => s.sword?.parentId === player.id && s.sword.state === 'held'
    );
    if (hasOwnSword) continue;

    // Find a grounded sword within pickup range
    const groundedSword = findNearestGroundedSword(player, swords);
    if (!groundedSword?.sword) continue;

    // Pick up the sword
    groundedSword.sword.parentId = player.id;
    groundedSword.sword.state = 'held';

    // Reset velocity
    if (groundedSword.velocity) {
      groundedSword.velocity.x = 0;
      groundedSword.velocity.y = 0;
    }

    console.log(`Player ${player.player.id} picked up a sword!`);
  }
}

/**
 * Find the nearest grounded sword to a player within pickup range
 */
function findNearestGroundedSword(
  player: Entity,
  swords: Entity[]
): Entity | null {
  if (!player.position || !player.collider) return null;

  const playerBox = entityToBox(player.position, player.collider);
  
  // Expand player box by pickup range for detection
  const pickupBox = {
    x: playerBox.x - SWORD.PICKUP_RANGE,
    y: playerBox.y - SWORD.PICKUP_RANGE,
    w: playerBox.w + SWORD.PICKUP_RANGE * 2,
    h: playerBox.h + SWORD.PICKUP_RANGE * 2,
  };

  let nearestSword: Entity | null = null;
  let nearestDistance = Infinity;

  for (const sword of swords) {
    if (!sword.sword || !sword.position || !sword.collider) continue;
    if (sword.sword.state !== 'grounded') continue;

    const swordBox = entityToBox(sword.position, sword.collider);
    
    if (!boxesOverlap(pickupBox, swordBox)) continue;

    // Calculate distance to player center
    const playerCenterX = player.position.x + player.collider.w / 2;
    const playerCenterY = player.position.y + player.collider.h / 2;
    const swordCenterX = sword.position.x + sword.collider.w / 2;
    const swordCenterY = sword.position.y + sword.collider.h / 2;

    const distance = Math.hypot(swordCenterX - playerCenterX, swordCenterY - playerCenterY);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestSword = sword;
    }
  }

  return nearestSword;
}
