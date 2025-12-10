// Movement System - Gravity, Velocity, and Ground Collision

import { queries } from '../state/world';
import { PHYSICS, LEVEL } from '../config';

// Track if entities are grounded
const grounded = new Map<string, boolean>();

/**
 * Check if an entity is currently on the ground
 */
export function isGrounded(entityId: string): boolean {
  return grounded.get(entityId) || false;
}

/**
 * Update movement for all players
 */
export function updateMovementSystem(deltaTime: number): void {
  for (const entity of queries.players) {
    if (!entity.position || !entity.velocity || !entity.input || !entity.collider) continue;

    // Check if movement is blocked (e.g., during attack retraction)
    const movementBlocked = entity.attack?.isRetracting ?? false;

    // Apply horizontal input (blocked during retraction)
    if (movementBlocked) {
      entity.velocity.x = 0;
    } else {
      entity.velocity.x = entity.input.x * PHYSICS.MOVE_SPEED;
    }

    // Update facing direction based on movement (not during attack)
    if (entity.input.x !== 0 && entity.facing && !movementBlocked) {
      entity.facing.direction = entity.input.x > 0 ? 1 : -1;
    }

    // Apply gravity
    entity.velocity.y += PHYSICS.GRAVITY;

    // Cap fall speed
    if (entity.velocity.y > PHYSICS.MAX_FALL_SPEED) {
      entity.velocity.y = PHYSICS.MAX_FALL_SPEED;
    }

    // Jump (blocked during retraction, uses edge detection)
    const entityGrounded = grounded.get(entity.id) || false;
    if (entity.input.jumpPressed && entityGrounded && !movementBlocked) {
      entity.velocity.y = PHYSICS.JUMP_FORCE;
    }

    // Update position
    entity.position.x += entity.velocity.x;
    entity.position.y += entity.velocity.y;

    // Ground collision
    const groundTop = LEVEL.GROUND_Y;
    const entityBottom = entity.position.y + entity.collider.h;

    if (entityBottom >= groundTop && entity.velocity.y >= 0) {
      entity.position.y = groundTop - entity.collider.h;
      entity.velocity.y = 0;
      grounded.set(entity.id, true);
    } else {
      grounded.set(entity.id, false);
    }
  }
}
