// Render System - Syncs ECS State to Pixi.js Sprites

import { Application, Graphics, Container, Text } from 'pixi.js';
import { queries } from '../state/world';
import { GAME, COLORS, PLAYER } from '../config';

// Map entity IDs to Pixi Graphics objects
const spriteMap = new Map<string, Graphics>();

let app: Application;
let container: Container;

export async function initRenderSystem(): Promise<Application> {
  // Create Pixi application
  app = new Application();
  
  await app.init({
    resizeTo: window,
    antialias: false,
    resolution: window.devicePixelRatio,
    backgroundColor: GAME.BACKGROUND_COLOR,
  });

  container = new Container();
  app.stage.addChild(container);

  // Add instructions text
  const instructions = new Text({
    text: 'P1: WASD + E(attack) + Q/R(stance) | P2: Arrows + Num0(attack) + Num1/2(stance)',
    style: { fill: 0xffffff, fontSize: 12 }
  });
  instructions.position.set(10, 10);
  app.stage.addChild(instructions);

  return app;
}

export function updateRenderSystem(_alpha: number): void {
  if (!app) return;

  // Render all entities with sprite and position
  for (const entity of queries.sprites) {
    if (!entity.position || !entity.sprite) continue;

    let sprite = spriteMap.get(entity.id);

    // Create sprite if it doesn't exist
    if (!sprite) {
      sprite = new Graphics();
      spriteMap.set(entity.id, sprite);
      container.addChild(sprite);
    }

    // Clear and redraw based on entity type
    sprite.clear();

    if (entity.collider) {
      const color = getColorForEntity(entity.id, entity.collider.tag);
      sprite.rect(0, 0, entity.collider.w, entity.collider.h);
      sprite.fill(color);
    }

    // Position sprite (with interpolation if needed)
    sprite.position.set(entity.position.x, entity.position.y);

    // Add stance indicator for players
    if (entity.player && entity.stance !== undefined) {
      const textColor = entity.player.id === 1 ? COLORS.PLAYER_1 : COLORS.PLAYER_2;
      
      sprite.clear();
      sprite.rect(0, 0, PLAYER.WIDTH, PLAYER.HEIGHT);
      sprite.fill(getColorForEntity(entity.id, 'player'));
      
      // Draw stance indicator
      const indicator = new Graphics();
      indicator.circle(PLAYER.WIDTH / 2, -10, 5);
      indicator.fill(textColor);
      sprite.addChild(indicator);
    }
  }

  // Remove sprites for deleted entities
  for (const [id, sprite] of spriteMap.entries()) {
    const entityExists = Array.from(queries.sprites).some(e => e.id === id);
    if (!entityExists) {
      container.removeChild(sprite);
      spriteMap.delete(id);
    }
  }
}

function getColorForEntity(id: string, tag: string): number {
  if (id === 'player1') return COLORS.PLAYER_1;
  if (id === 'player2') return COLORS.PLAYER_2;
  if (id === 'sword1' || id === 'sword2') return COLORS.SWORD;
  if (id === 'ground') return COLORS.GROUND;
  if (tag === 'wall') return COLORS.WALL;
  return 0xffffff;
}
