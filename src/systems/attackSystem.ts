// Attack System - Handle attack state machine (thrust/retract)

import { world, queries } from '../state/world';
import { SWORD } from '../config';

/**
 * Update attack state for all players
 */
export function updateAttackSystem(deltaTime: number): void {
  for (const entity of queries.players) {
    if (!entity.attack || !entity.input) continue;

    // Check if player has a sword (is armed)
    const playerSword = world.entities.find(
      (e) => e.sword?.parentId === entity.id && e.sword.state === 'held'
    );
    const isArmed = !!playerSword;

    // Only allow attacks if armed
    if (!isArmed) continue;

    // Handle attack initiation (using edge detection from input system)
    if (entity.input.attackPressed && !entity.attack.isAttacking && !entity.attack.isRetracting) {
      // Start attack - instant extension
      entity.attack.isAttacking = true;
      entity.attack.extension = SWORD.THRUST_EXTENSION;
      entity.attack.isRetracting = false;
    }

    // If attacking (sword extended), immediately start retracting
    if (entity.attack.isAttacking && entity.attack.extension >= SWORD.THRUST_EXTENSION) {
      entity.attack.isAttacking = false;
      entity.attack.isRetracting = true;
    }

    // Handle retraction
    if (entity.attack.isRetracting) {
      entity.attack.extension -= SWORD.RETRACT_SPEED * deltaTime;

      if (entity.attack.extension <= 0) {
        entity.attack.extension = 0;
        entity.attack.isRetracting = false;
      }
    }
  }
}

/**
 * Disarm a player - launch their sword into the air
 */
export function disarmPlayer(entityId: string): void {
  for (const entity of queries.players) {
    if (entity.id !== entityId) continue;

    // Reset attack state
    if (entity.attack) {
      entity.attack.isAttacking = false;
      entity.attack.extension = 0;
      entity.attack.isRetracting = false;
    }

    // Add knockback to player
    if (entity.velocity && entity.facing) {
      entity.velocity.x = -entity.facing.direction * 8;
    }

    // Find and launch the player's sword
    const playerSword = world.entities.find(
      (e) => e.sword?.parentId === entity.id && e.sword.state === 'held'
    );

    if (playerSword?.sword && playerSword.velocity && entity.facing && entity.position) {
      // Detach sword from player
      playerSword.sword.parentId = null;
      playerSword.sword.state = 'flying';

      // Launch sword in opposite direction of player's facing
      const launchDirection = -entity.facing.direction;
      playerSword.velocity.x = launchDirection * SWORD.LAUNCH_VELOCITY_X;
      playerSword.velocity.y = SWORD.LAUNCH_VELOCITY_Y;

      console.log(`Player ${entity.player?.id}'s sword was knocked away!`);
    }
  }
}
