// Debug System - Draws red wireframe boxes around all colliders
//
// Enable/disable via DEBUG flag in config.ts
// This helps visualize hitbox positions independently from sprite rendering

import { Graphics, Container } from 'pixi.js';
import { queries } from '../state/world';
import { DEBUG } from '../config';

// Map entity IDs to their debug graphics
const debugBoxes = new Map<string, Graphics>();

// Container for all debug graphics (added to stage in init)
let debugContainer: Container | null = null;

/**
 * Initialize the debug system - call after render system init
 * @param stage - The Pixi stage to add debug graphics to
 */
export function initDebugSystem(stage: Container): void {
  if (!DEBUG) return;
  
  debugContainer = new Container();
  debugContainer.label = 'debugContainer';
  stage.addChild(debugContainer);
}

/**
 * Update debug collider boxes - call every frame after render
 */
export function updateDebugSystem(): void {
  if (!DEBUG || !debugContainer) return;

  // Update boxes for all entities with colliders
  for (const entity of queries.collidables) {
    if (!entity.position || !entity.collider) continue;

    let box = debugBoxes.get(entity.id);

    // Create box if it doesn't exist
    if (!box) {
      box = new Graphics();
      debugBoxes.set(entity.id, box);
      debugContainer.addChild(box);
    }

    // Clear and redraw the box
    box.clear();
    
    // Draw red wireframe rectangle
    box.rect(0, 0, entity.collider.w, entity.collider.h);
    box.stroke({ width: 2, color: 0xff0000 });
    
    // Position at entity's collider position
    box.position.set(entity.position.x, entity.position.y);
  }

  // Remove boxes for deleted entities
  const entityIds = new Set(Array.from(queries.collidables).map(e => e.id));
  
  for (const [id, box] of debugBoxes.entries()) {
    if (!entityIds.has(id)) {
      debugContainer.removeChild(box);
      box.destroy();
      debugBoxes.delete(id);
    }
  }
}

/**
 * Clean up debug system resources
 */
export function destroyDebugSystem(): void {
  if (!debugContainer) return;
  
  for (const box of debugBoxes.values()) {
    box.destroy();
  }
  debugBoxes.clear();
  
  debugContainer.destroy({ children: true });
  debugContainer = null;
}
