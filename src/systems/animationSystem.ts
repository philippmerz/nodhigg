// Animation System - Updates animation frame indices over time
//
// This system handles:
// - Advancing animation frame timers
// - Cycling through animation frames at a fixed rate
//
// Note: The actual texture swapping happens in renderSystem.
// This system just manages the ECS animation state.

import { queries } from '../state/world';

// Animation playback configuration
const ANIMATION_FPS = 8;
const FRAME_DURATION = 1000 / ANIMATION_FPS;

// Frame counts for each animation (must match sheet.json)
// You can adjust these as you add more sprites
const ANIMATION_FRAME_COUNTS: Record<string, number> = {
  idle: 1,    // Uses player_walk_1 only
  walk: 2,    // Uses player_walk_1 and player_walk_2
  jump: 1,    // Uses player_walk_1 (placeholder)
  attack: 1,  // Uses player_walk_1 (placeholder)
};

export function updateAnimationSystem(deltaTime: number): void {
  // Only players have animations currently
  for (const entity of queries.players) {
    if (!entity.animation) continue;

    // Accumulate time
    entity.animation.frameTime += deltaTime;

    // Check if we should advance to next frame
    if (entity.animation.frameTime >= FRAME_DURATION) {
      entity.animation.frameTime -= FRAME_DURATION;

      // Get frame count for current animation
      const frameCount = ANIMATION_FRAME_COUNTS[entity.animation.current] ?? 1;

      // Advance frame index (loop)
      entity.animation.frameIndex = (entity.animation.frameIndex + 1) % frameCount;
    }
  }
}
