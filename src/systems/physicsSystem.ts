// Physics System - Gravity, Movement, and Collision

import { world, queries } from '../state/world';
import { PHYSICS, LEVEL, STANCE } from '../config';
import type { Entity } from '../types';

// Track if entities are grounded
const grounded = new Map<string, boolean>();

// Track previous frame's stance button state for edge detection
const prevStanceButtonState = new Map<string, { up: boolean; down: boolean }>();

export function updatePhysicsSystem(deltaTime: number): void {
  // Update player physics
  for (const entity of queries.players) {
    if (!entity.position || !entity.velocity || !entity.input || !entity.collider) continue;

    // Apply horizontal input
    entity.velocity.x = entity.input.x * PHYSICS.MOVE_SPEED;

    // Apply gravity
    entity.velocity.y += PHYSICS.GRAVITY;

    // Cap fall speed
    if (entity.velocity.y > PHYSICS.MAX_FALL_SPEED) {
      entity.velocity.y = PHYSICS.MAX_FALL_SPEED;
    }

    // Jump
    const isGrounded = grounded.get(entity.id) || false;
    if (entity.input.jump && isGrounded) {
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

    // Apply stance-based movement
    if (entity.stance) {
      updateStance(entity, deltaTime);
    }
  }

  // Update sword positions based on parent
  for (const swordEntity of queries.swords) {
    if (!swordEntity.sword || !swordEntity.position) continue;

    const parent = world.entities.find((e) => e.id === swordEntity.sword.parentId);
    if (!parent || !parent.position || !parent.stance) continue;

    // Position sword relative to parent and stance
    let yOffset = swordEntity.sword.offset.y;
    
    // Adjust sword Y position based on stance
    if (parent.stance.current === 0) yOffset += 15; // Low
    if (parent.stance.current === 1) yOffset += 0;  // Mid
    if (parent.stance.current === 2) yOffset -= 15; // High

    swordEntity.position.x = parent.position.x + swordEntity.sword.offset.x;
    swordEntity.position.y = parent.position.y + yOffset;
    }
}

function updateStance(entity: Entity, deltaTime: number): void {
  if (!entity.stance || !entity.input) return;

  // Get previous button state (default to released)
  const prevState = prevStanceButtonState.get(entity.id) || { up: false, down: false };

  // Detect button press (transition from not pressed to pressed)
  const stanceUpPressed = entity.input.stanceUp && !prevState.up;
  const stanceDownPressed = entity.input.stanceDown && !prevState.down;

  // Update previous state for next frame
  prevStanceButtonState.set(entity.id, {
    up: entity.input.stanceUp,
    down: entity.input.stanceDown,
  });

  // Decrement timer
  if (entity.stance.timer > 0) {
    entity.stance.timer -= deltaTime;
  }

  // Only allow stance changes when timer expires AND button is newly pressed
  if (entity.stance.timer <= 0) {
    if (stanceUpPressed) {
      entity.stance.current = Math.max(0, entity.stance.current - 1) as 0 | 1 | 2;
      entity.stance.timer = STANCE.CHANGE_COOLDOWN;
    } else if (stanceDownPressed) {
      entity.stance.current = Math.min(2, entity.stance.current + 1) as 0 | 1 | 2;
      entity.stance.timer = STANCE.CHANGE_COOLDOWN;
    }
  }
}
