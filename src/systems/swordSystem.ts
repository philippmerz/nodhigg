// Sword System - Position held swords and handle flying/grounded sword physics

import { world, queries } from '../state/world';
import { SWORD, PLAYER, PHYSICS, LEVEL, GAME } from '../config';

import type { Entity } from '../types';

/**
 * Update all swords - held swords follow players, loose swords have physics
 */
export function updateSwordSystem(): void {
  for (const swordEntity of queries.swords) {
    if (!swordEntity.sword || !swordEntity.position || !swordEntity.collider || !swordEntity.velocity) continue;

    if (swordEntity.sword.state === 'held') {
      updateHeldSword(swordEntity);
    } else if (swordEntity.sword.state === 'flying') {
      updateFlyingSword(swordEntity);
    }
    // Grounded swords don't move
  }
}

/**
 * Position a held sword relative to its parent player
 */
function updateHeldSword(swordEntity: Entity): void {
  if (!swordEntity.sword || !swordEntity.position || !swordEntity.collider) return;

  const parent = world.entities.find((e) => e.id === swordEntity.sword!.parentId);
  if (!parent || !parent.position || !parent.stance) return;

  // Get facing direction (default to right)
  const facing = parent.facing?.direction ?? 1;

  // Get attack extension
  const extension = parent.attack?.extension ?? 0;

  // Calculate Y offset based on stance
  let yOffset = swordEntity.sword.offset.y;
  if (parent.stance.current === 0) yOffset += 15; // Low
  if (parent.stance.current === 1) yOffset += 0;  // Mid
  if (parent.stance.current === 2) yOffset -= 15; // High

  // Calculate X position based on facing direction and attack extension
  const totalOffset = swordEntity.sword.offset.x + extension;
  const swordWidth = SWORD.WIDTH + extension;

  if (facing === 1) {
    // Facing right: sword starts at player's right edge + offset
    swordEntity.position.x = parent.position.x + PLAYER.WIDTH + totalOffset;
  } else {
    // Facing left: sword ends at player's left edge - offset
    swordEntity.position.x = parent.position.x - totalOffset - swordWidth;
  }

  swordEntity.position.y = parent.position.y + yOffset;

  // Update sword collider width based on extension
  swordEntity.collider.w = swordWidth;
}

/**
 * Handle physics for flying swords (gravity, wall bounce, ground landing)
 */
function updateFlyingSword(swordEntity: Entity): void {
  if (!swordEntity.sword || !swordEntity.position || !swordEntity.velocity || !swordEntity.collider) return;

  // Apply gravity
  swordEntity.velocity.y += PHYSICS.GRAVITY;

  // Cap fall speed
  if (swordEntity.velocity.y > PHYSICS.MAX_FALL_SPEED) {
    swordEntity.velocity.y = PHYSICS.MAX_FALL_SPEED;
  }

  // Update position
  swordEntity.position.x += swordEntity.velocity.x;
  swordEntity.position.y += swordEntity.velocity.y;

  // Wall collision (bounce off screen edges)
  const leftWall = 0;
  const rightWall = GAME.WIDTH;

  if (swordEntity.position.x <= leftWall) {
    swordEntity.position.x = leftWall;
    swordEntity.velocity.x = -swordEntity.velocity.x * SWORD.BOUNCE_DAMPING;
  } else if (swordEntity.position.x + swordEntity.collider.w >= rightWall) {
    swordEntity.position.x = rightWall - swordEntity.collider.w;
    swordEntity.velocity.x = -swordEntity.velocity.x * SWORD.BOUNCE_DAMPING;
  }

  // Ground collision (land and become pickup-able)
  const groundTop = LEVEL.GROUND_Y;
  const swordBottom = swordEntity.position.y + swordEntity.collider.h;

  if (swordBottom >= groundTop && swordEntity.velocity.y >= 0) {
    swordEntity.position.y = groundTop - swordEntity.collider.h;
    swordEntity.velocity.x = 0;
    swordEntity.velocity.y = 0;
    swordEntity.sword.state = 'grounded';
    console.log('Sword landed on the ground!');
  }

  // Reset collider width for loose swords (no extension)
  swordEntity.collider.w = SWORD.WIDTH;
}
