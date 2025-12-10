// Stance System - Handle stance changes

import { queries } from '../state/world';
import { STANCE } from '../config';

/**
 * Update stance for all players
 */
export function updateStanceSystem(deltaTime: number): void {
  for (const entity of queries.players) {
    if (!entity.stance || !entity.input) continue;

    // Don't allow stance changes during attack retraction
    if (entity.attack?.isRetracting) continue;

    // Decrement cooldown timer
    if (entity.stance.timer > 0) {
      entity.stance.timer -= deltaTime;
    }

    // Only allow stance changes when timer expires AND button is newly pressed
    if (entity.stance.timer <= 0) {
      if (entity.input.stanceUpPressed) {
        entity.stance.current = Math.max(0, entity.stance.current - 1) as 0 | 1 | 2;
        entity.stance.timer = STANCE.CHANGE_COOLDOWN;
      } else if (entity.input.stanceDownPressed) {
        entity.stance.current = Math.min(2, entity.stance.current + 1) as 0 | 1 | 2;
        entity.stance.timer = STANCE.CHANGE_COOLDOWN;
      }
    }
  }
}
