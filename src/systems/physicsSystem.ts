// Physics System - Gravity, Movement, and Collision

import { world, queries } from '../state/world';
import { PHYSICS, LEVEL, STANCE } from '../config';
import type { Entity } from '../types';

// Track if entities are grounded
const grounded = new Map<string, boolean>();

// Track previous frame's stance button state for edge detection
const prevStanceButtonState = new Map<string, { up: boolean; down: boolean }>();

export function updatePhysicsSystem(deltaTime: number): void {
  const players = Array.from(queries.players);
  
  // Update player physics
  for (const entity of players) {
    if (!entity.position || !entity.velocity || !entity.input || !entity.collider) continue;

    // Apply horizontal input
    entity.velocity.x = entity.input.x * PHYSICS.MOVE_SPEED;

    // Update facing direction based on movement
    if (entity.input.x !== 0 && entity.facing) {
      entity.facing.direction = entity.input.x > 0 ? 1 : -1;
    }

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

  // Check sword-to-sword collision (blocking) when stances match
  if (players.length === 2) {
    resolveSwordCollision(players[0], players[1]);
  }

  // Update sword positions based on parent
  for (const swordEntity of queries.swords) {
    if (!swordEntity.sword || !swordEntity.position) continue;

    const parent = world.entities.find((e) => e.id === swordEntity.sword.parentId);
    if (!parent || !parent.position || !parent.stance) continue;

    // Get facing direction (default to right)
    const facing = parent.facing?.direction ?? 1;

    // Position sword relative to parent and stance
    let yOffset = swordEntity.sword.offset.y;
    
    // Adjust sword Y position based on stance
    if (parent.stance.current === 0) yOffset += 15; // Low
    if (parent.stance.current === 1) yOffset += 0;  // Mid
    if (parent.stance.current === 2) yOffset -= 15; // High

    // Position sword on the side player is facing
    swordEntity.position.x = parent.position.x + (swordEntity.sword.offset.x * facing);
    swordEntity.position.y = parent.position.y + yOffset;
    }
}

/**
 * When two players have the same stance and their swords collide,
 * push them apart so they can't walk through each other
 */
function resolveSwordCollision(player1: Entity, player2: Entity): void {
  if (
    !player1.position || !player1.stance || !player1.facing || !player1.collider ||
    !player2.position || !player2.stance || !player2.facing || !player2.collider
  ) {
    return;
  }

  // Only block if stances match
  if (player1.stance.current !== player2.stance.current) return;

  // Get sword entities
  const sword1 = world.entities.find(e => e.sword?.parentId === player1.id);
  const sword2 = world.entities.find(e => e.sword?.parentId === player2.id);

  if (!sword1?.position || !sword1?.collider || !sword2?.position || !sword2?.collider) return;

  // Check if swords overlap
  const s1 = { x: sword1.position.x, y: sword1.position.y, w: sword1.collider.w, h: sword1.collider.h };
  const s2 = { x: sword2.position.x, y: sword2.position.y, w: sword2.collider.w, h: sword2.collider.h };

  const swordsOverlap = 
    s1.x < s2.x + s2.w &&
    s1.x + s1.w > s2.x &&
    s1.y < s2.y + s2.h &&
    s1.y + s1.h > s2.y;

  if (!swordsOverlap) return;

  // Calculate overlap and push players apart
  const s1Center = s1.x + s1.w / 2;
  const s2Center = s2.x + s2.w / 2;
  
  // Calculate the overlap amount
  let overlap: number;
  if (s1Center < s2Center) {
    // Sword1 is to the left of Sword2
    overlap = (s1.x + s1.w) - s2.x;
  } else {
    // Sword2 is to the left of Sword1
    overlap = (s2.x + s2.w) - s1.x;
  }

  // Push each player back by half the overlap
  const pushAmount = overlap / 2 + 1; // +1 to ensure separation

  if (player1.position.x < player2.position.x) {
    // Player1 is on the left, push left; Player2 push right
    player1.position.x -= pushAmount;
    player2.position.x += pushAmount;
  } else {
    // Player2 is on the left, push left; Player1 push right
    player1.position.x += pushAmount;
    player2.position.x -= pushAmount;
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
