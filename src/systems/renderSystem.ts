// Render System - Syncs ECS State to Pixi.js Sprites

import { Application, Graphics, Container, Text } from 'pixi.js';
import { queries } from '../state/world';
import { GAME, COLORS, PLAYER, STAGE } from '../config';
import { getTransitionOpacity, getStageState } from '../state/stageManager';

// Map entity IDs to Pixi Graphics objects
const spriteMap = new Map<string, Graphics>();

let app: Application;
let container: Container;
let transitionOverlay: Graphics;
let stageIndicator: Text;
let winText: Text;

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
    text: 'P1: WASD + E(attack) + Q/R(stance) + S(pickup) | P2: Arrows + /(attack) + ,/.(stance) + Down(pickup)',
    style: { fill: 0xffffff, fontSize: 12 }
  });
  instructions.position.set(10, 10);
  app.stage.addChild(instructions);

  // Create stage indicator
  stageIndicator = new Text({
    text: '',
    style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' }
  });
  stageIndicator.anchor.set(0.5, 0);
  app.stage.addChild(stageIndicator);

  // Create win text (hidden initially)
  winText = new Text({
    text: '',
    style: { fill: 0xffd700, fontSize: 48, fontWeight: 'bold' }
  });
  winText.anchor.set(0.5, 0.5);
  winText.visible = false;
  app.stage.addChild(winText);

  // Create transition overlay (black rectangle covering screen)
  transitionOverlay = new Graphics();
  transitionOverlay.rect(0, 0, GAME.WIDTH, GAME.HEIGHT);
  transitionOverlay.fill(0x000000);
  transitionOverlay.alpha = 0;
  app.stage.addChild(transitionOverlay);

  return app;
}

export function updateRenderSystem(_alpha: number): void {
  if (!app) return;

  const stageState = getStageState();

  // Update transition overlay
  transitionOverlay.alpha = getTransitionOpacity();
  
  // Resize overlay if window changed
  transitionOverlay.clear();
  transitionOverlay.rect(0, 0, GAME.WIDTH, GAME.HEIGHT);
  transitionOverlay.fill(0x000000);

  // Update stage indicator
  updateStageIndicator(stageState.currentStage, stageState.lastKillBy);

  // Update win text
  if (stageState.winner) {
    winText.visible = true;
    winText.text = `PLAYER ${stageState.winner} WINS!`;
    winText.position.set(GAME.WIDTH / 2, GAME.HEIGHT / 2);
  }

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

/**
 * Update the stage indicator display
 * Shows: [P2 goal] ○○○○○ ● ○○○○○ [P1 goal]
 * Filled circles show progress, arrow shows who can advance
 */
function updateStageIndicator(currentStage: number, lastKillBy: 1 | 2 | null): void {
  const totalStages = STAGE.TOTAL_STAGES;
  
  // Build visual representation
  // Left side: P2's progress (negative stages)
  // Center: current position
  // Right side: P1's progress (positive stages)
  
  let display = '';
  
  // P2 side (left) - filled if stage is negative
  for (let i = totalStages; i >= 1; i--) {
    if (currentStage <= -i) {
      display += '●';
    } else {
      display += '○';
    }
  }
  
  // Center marker
  display += ' ◆ ';
  
  // P1 side (right) - filled if stage is positive
  for (let i = 1; i <= totalStages; i++) {
    if (currentStage >= i) {
      display += '●';
    } else {
      display += '○';
    }
  }
  
  // Add arrow showing who can advance
  if (lastKillBy === 1) {
    display += ' →';
  } else if (lastKillBy === 2) {
    display = '← ' + display;
  }
  
  stageIndicator.text = display;
  stageIndicator.position.set(GAME.WIDTH / 2, 30);
}
