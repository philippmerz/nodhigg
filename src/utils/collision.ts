// Collision Detection Utilities

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Check if two axis-aligned bounding boxes overlap
 */
export function boxesOverlap(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Get the horizontal overlap amount between two boxes (assumes they overlap)
 */
export function getHorizontalOverlap(a: Box, b: Box): number {
  const aRight = a.x + a.w;
  const bRight = b.x + b.w;
  
  // Overlap from the right of a into b
  const overlapRight = aRight - b.x;
  // Overlap from the right of b into a
  const overlapLeft = bRight - a.x;
  
  return Math.min(overlapRight, overlapLeft);
}

/**
 * Get the center X coordinate of a box
 */
export function getCenterX(box: Box): number {
  return box.x + box.w / 2;
}

/**
 * Get the center Y coordinate of a box
 */
export function getCenterY(box: Box): number {
  return box.y + box.h / 2;
}

/**
 * Create a box from entity position and collider
 */
export function entityToBox(
  position: { x: number; y: number },
  collider: { w: number; h: number }
): Box {
  return {
    x: position.x,
    y: position.y,
    w: collider.w,
    h: collider.h,
  };
}
