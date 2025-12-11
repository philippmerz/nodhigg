// Animation System - Updates animation frame indices over time
//
// This system handles:
// - Advancing animation frame timers
// - Cycling through animation frames at variable speeds
//
// Note: The actual texture swapping happens in renderSystem.
// This system just manages the ECS animation state.

import { queries } from '../state/world';

// Animation configuration per animation type
// fps: frames per second for this animation
// frameCount: number of frames in the animation (must match sheet.json)
const ANIMATION_CONFIG: Record<string, { fps: number; frameCount: number }> = {
  idle: { fps: 8, frameCount: 1 },     // Uses player_walk_1 only
  walk: { fps: 50, frameCount: 22 },   // Uses player_walk_1 through player_walk_22
  jump: { fps: 8, frameCount: 1 },     // Uses player_walk_1 (placeholder)
  attack: { fps: 8, frameCount: 1 },   // Uses player_walk_1 (placeholder)
};

export function updateAnimationSystem(deltaTime: number): void {
  // Only players have animations currently
  for (const entity of queries.players) {
    if (!entity.animation) continue;

    // Get config for current animation
    const config = ANIMATION_CONFIG[entity.animation.current] ?? { fps: 8, frameCount: 1 };
    const frameDuration = 1000 / config.fps;

    // Accumulate time
    entity.animation.frameTime += deltaTime;

    // Check if we should advance to next frame
    if (entity.animation.frameTime >= frameDuration) {
      entity.animation.frameTime -= frameDuration;

      // Advance frame index (loop)
      entity.animation.frameIndex = (entity.animation.frameIndex + 1) % config.frameCount;
    }
  }
}
