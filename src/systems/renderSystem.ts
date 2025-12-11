// Render System - Syncs ECS State to Pixi.js Sprites
//
// This system handles:
// - Loading spritesheet assets
// - Creating/destroying sprites for entities
// - Updating sprite positions to match ECS positions
// - Flipping sprites based on facing direction
// - Playing animations based on entity state
// - UI elements (stage indicator, transitions, win text)

import {
  Application,
  Assets,
  Sprite,
  Container,
  Text,
  Graphics,
  Spritesheet,
} from 'pixi.js';
import { queries } from '../state/world';
import { GAME, PLAYER, SWORD, STAGE, COLORS } from '../config';
import { getTransitionOpacity, getStageState } from '../state/stageManager';
import type { Entity, AnimationName } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Animation playback speed (frames per second)
// Frame duration is used by animationSystem.ts for timing

// Sprite scale factors to match entity collider sizes
// Scale sprites so their visual size matches the game collider dimensions
const PLAYER_SCALE = PLAYER.HEIGHT / 844; // Scale player sprite to match PLAYER.HEIGHT
const SWORD_SCALE = SWORD.WIDTH / 1876;   // Scale sword sprite to match SWORD.WIDTH

// ============================================================================
// STATE
// ============================================================================

// Loaded spritesheet reference
let spritesheet: Spritesheet | null = null;

// Map entity IDs to their Pixi sprite containers
// Using Container to allow for complex sprite setups (player + effects, etc.)
const spriteMap = new Map<string, Container>();

// Pixi application and display objects
let app: Application;
let gameContainer: Container;
let uiContainer: Container;
let transitionOverlay: Graphics;
let stageIndicator: Text;
let winText: Text;

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initRenderSystem(): Promise<Application> {
  // Create Pixi application
  app = new Application();

  await app.init({
    resizeTo: window,
    antialias: false,
    resolution: window.devicePixelRatio,
    backgroundColor: GAME.BACKGROUND_COLOR,
  });

  // Load spritesheet
  await loadAssets();

  // Create container hierarchy
  // gameContainer holds all game entities (players, swords, level)
  // uiContainer holds UI elements (stage indicator, win text)
  gameContainer = new Container();
  uiContainer = new Container();
  app.stage.addChild(gameContainer);
  app.stage.addChild(uiContainer);

  // Add background sprite (behind everything in gameContainer)
  createBackgroundSprite();

  // Initialize UI elements
  initUI();

  return app;
}

async function loadAssets(): Promise<void> {
  // Load the spritesheet JSON which references sheet.png
  spritesheet = await Assets.load<Spritesheet>('/assets/sheet.json');
  
  console.log('Spritesheet loaded:', spritesheet);
  console.log('Available textures:', Object.keys(spritesheet.textures));
  console.log('Available animations:', Object.keys(spritesheet.animations));
}

function createBackgroundSprite(): void {
  if (!spritesheet) return;
  
  const bgTexture = spritesheet.textures['background'];
  if (!bgTexture) {
    console.warn('Background texture not found in spritesheet');
    return;
  }
  
  const bgSprite = new Sprite(bgTexture);
  // Scale background to fill the game area
  bgSprite.width = GAME.WIDTH;
  bgSprite.height = GAME.HEIGHT;
  bgSprite.position.set(0, 0);
  
  // Add at the back of gameContainer (index 0)
  gameContainer.addChildAt(bgSprite, 0);
}

function initUI(): void {
  // Instructions text
  const instructions = new Text({
    text: 'P1: WASD + E(attack) + Q/R(stance) + S(pickup) | P2: Arrows + /(attack) + ,/.(stance) + Down(pickup)',
    style: { fill: 0xffffff, fontSize: 12 },
  });
  instructions.position.set(10, 10);
  uiContainer.addChild(instructions);

  // Stage progress indicator
  stageIndicator = new Text({
    text: '',
    style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' },
  });
  stageIndicator.anchor.set(0.5, 0);
  uiContainer.addChild(stageIndicator);

  // Win text (hidden until game ends)
  winText = new Text({
    text: '',
    style: { fill: 0xffd700, fontSize: 48, fontWeight: 'bold' },
  });
  winText.anchor.set(0.5, 0.5);
  winText.visible = false;
  uiContainer.addChild(winText);

  // Screen transition overlay
  transitionOverlay = new Graphics();
  transitionOverlay.rect(0, 0, GAME.WIDTH, GAME.HEIGHT);
  transitionOverlay.fill(0x000000);
  transitionOverlay.alpha = 0;
  uiContainer.addChild(transitionOverlay);
}

// ============================================================================
// MAIN UPDATE LOOP
// ============================================================================

export function updateRenderSystem(_alpha: number): void {
  if (!app || !spritesheet) return;

  const stageState = getStageState();

  // Update UI
  updateTransitionOverlay();
  updateStageIndicator(stageState.currentStage, stageState.lastKillBy);
  updateWinText(stageState.winner);

  // Sync sprites with entities
  syncSpritesToEntities();

  // Clean up sprites for removed entities
  removeOrphanedSprites();
}

// ============================================================================
// SPRITE SYNC
// ============================================================================

function syncSpritesToEntities(): void {
  for (const entity of queries.sprites) {
    if (!entity.position || !entity.sprite) continue;

    let container = spriteMap.get(entity.id);

    // Create sprite container if it doesn't exist
    if (!container) {
      const newContainer = createSpriteForEntity(entity);
      if (!newContainer) continue; // Skip if we couldn't create sprite
      container = newContainer;
      spriteMap.set(entity.id, container);
      gameContainer.addChild(container);
    }

    // Update sprite based on entity state
    updateSpriteForEntity(entity, container);
  }
}

function createSpriteForEntity(entity: Entity): Container | null {
  if (!spritesheet) return null;

  const container = new Container();

  if (entity.player) {
    // Player entity - create sprite from walk animation frame
    const texture = spritesheet.textures['player_walk_1'];
    if (!texture) {
      console.warn('Missing player texture');
      return null;
    }
    const sprite = new Sprite(texture);
    
    // Scale sprite to match player collider size
    sprite.scale.set(PLAYER_SCALE);
    
    // Set anchor to bottom-center for proper positioning
    // This makes the sprite's position correspond to the player's feet
    sprite.anchor.set(0.5, 1);
    
    // Store reference for easy access
    sprite.label = 'mainSprite';
    container.addChild(sprite);
  } else if (entity.sword) {
    // Sword entity
    const texture = spritesheet.textures['sword'];
    if (!texture) {
      console.warn('Missing sword texture');
      return null;
    }
    const sprite = new Sprite(texture);
    
    // Scale sword to match collider
    sprite.scale.set(SWORD_SCALE);
    
    // Anchor at left-center for proper rotation point
    sprite.anchor.set(0, 0.5);
    
    sprite.label = 'mainSprite';
    container.addChild(sprite);
  } else if (entity.collider?.tag === 'wall') {
    // Level geometry - use colored rectangles (no sprite in sheet)
    const graphics = new Graphics();
    const isGround = entity.id === 'ground';
    const color = isGround ? COLORS.GROUND : COLORS.WALL;
    
    graphics.rect(0, 0, entity.collider.w, entity.collider.h);
    graphics.fill(color);
    graphics.label = 'mainSprite';
    container.addChild(graphics);
  }

  return container;
}

function updateSpriteForEntity(entity: Entity, container: Container): void {
  if (!spritesheet) return;

  const mainSprite = container.getChildByLabel('mainSprite');
  if (!mainSprite) return;

  if (entity.player && mainSprite instanceof Sprite) {
    updatePlayerSprite(entity, mainSprite);
  } else if (entity.sword && mainSprite instanceof Sprite) {
    updateSwordSprite(entity, mainSprite);
  } else if (entity.collider?.tag === 'wall') {
    // Level geometry just needs position update
    container.position.set(entity.position!.x, entity.position!.y);
  }
}

function updatePlayerSprite(entity: Entity, sprite: Sprite): void {
  if (!entity.position || !entity.animation || !spritesheet) return;

  // Determine animation state from entity state
  const animName = determineAnimation(entity);
  
  // Update animation if state changed
  if (entity.animation.current !== animName) {
    entity.animation.current = animName;
    entity.animation.frameIndex = 0;
    entity.animation.frameTime = 0;
  }

  // Get current animation frames
  const animKey = `player_${animName}`;
  const frames = spritesheet.animations[animKey];
  
  if (frames && frames.length > 0) {
    // Update frame based on time (handled by animationSystem or here)
    const frameIndex = entity.animation.frameIndex % frames.length;
    sprite.texture = frames[frameIndex];
  }

  // Position: ECS position is top-left of collider, sprite anchor is bottom-center
  // So we need to offset to center-bottom of the collider
  const container = sprite.parent;
  if (container) {
    container.position.set(
      entity.position.x + PLAYER.WIDTH / 2,
      entity.position.y + PLAYER.HEIGHT
    );
  }

  // Flip sprite based on facing direction
  // scale.x negative = facing left
  const facingDir = entity.facing?.direction ?? 1;
  sprite.scale.x = Math.abs(sprite.scale.x) * facingDir;
}

function updateSwordSprite(entity: Entity, sprite: Sprite): void {
  if (!entity.position || !entity.collider) return;

  const container = sprite.parent;
  if (!container) return;

  // Calculate scale based on current collider width (which changes during attack)
  // Original sword sprite is 1876px wide
  const currentScale = entity.collider.w / 1876;

  // Find parent player to determine facing
  if (entity.sword?.parentId) {
    const parent = Array.from(queries.players).find(
      (p) => p.id === entity.sword?.parentId
    );
    if (parent?.facing) {
      const facingDir = parent.facing.direction;
      
      // The ECS collider position represents the hitbox.
      // We need to align the sprite visual with this hitbox.
      // 
      // Collider positioning (from swordSystem.ts):
      // - Facing right: collider.x = player right edge + offset (sword extends rightward)
      // - Facing left: collider.x = player left edge - offset - width (sword extends leftward)
      //
      // In both cases, the "base" of the sword is near the player,
      // and the "tip" is at the far end.
      
      if (facingDir === 1) {
        // Facing right: sword extends from position.x to position.x + collider.w
        // The sprite naturally points left, so we flip it with negative scale.
        // Negative scale.x with anchor (0, 0.5) mirrors around the left edge,
        // causing the sprite to render to the LEFT of the position.
        // To compensate, we position at the RIGHT edge of the collider.
        sprite.anchor.set(0, 0.5);
        sprite.scale.x = -currentScale;
        container.position.set(
          entity.position.x + entity.collider.w, // Right edge of collider
          entity.position.y + SWORD.HEIGHT / 2
        );
      } else {
        // Facing left: sword extends from position.x to position.x + collider.w
        // Sprite naturally points left, no flip needed.
        // With anchor (0, 0.5), sprite renders to the right of position.
        // Position at the LEFT edge of the collider.
        sprite.anchor.set(0, 0.5);
        sprite.scale.x = currentScale;
        container.position.set(
          entity.position.x, // Left edge of collider
          entity.position.y + SWORD.HEIGHT / 2
        );
      }
    }
  } else {
    // Loose sword - default orientation pointing right
    sprite.anchor.set(0, 0.5);
    sprite.scale.x = -currentScale;
    container.position.set(
      entity.position.x + entity.collider.w, // Compensate for negative scale flip
      entity.position.y + SWORD.HEIGHT / 2
    );
  }
}

function determineAnimation(entity: Entity): AnimationName {
  if (!entity.velocity) return 'idle';

  // Check if attacking
  if (entity.attack?.isAttacking) {
    return 'attack';
  }

  // Check if in air (jumping or falling)
  // Simple heuristic: if y velocity is significant, we're airborne
  if (Math.abs(entity.velocity.y) > 2) {
    return 'jump';
  }

  // Check if moving horizontally
  if (Math.abs(entity.velocity.x) > 0.5) {
    return 'walk';
  }

  return 'idle';
}

// ============================================================================
// CLEANUP
// ============================================================================

function removeOrphanedSprites(): void {
  const entityIds = new Set(Array.from(queries.sprites).map((e) => e.id));

  for (const [id, container] of spriteMap.entries()) {
    if (!entityIds.has(id)) {
      gameContainer.removeChild(container);
      container.destroy({ children: true });
      spriteMap.delete(id);
    }
  }
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateTransitionOverlay(): void {
  transitionOverlay.alpha = getTransitionOpacity();

  // Resize overlay if window changed
  transitionOverlay.clear();
  transitionOverlay.rect(0, 0, GAME.WIDTH, GAME.HEIGHT);
  transitionOverlay.fill(0x000000);
}

function updateWinText(winner: 1 | 2 | null): void {
  if (winner) {
    winText.visible = true;
    winText.text = `PLAYER ${winner} WINS!`;
    winText.position.set(GAME.WIDTH / 2, GAME.HEIGHT / 2);
  }
}

function updateStageIndicator(currentStage: number, lastKillBy: 1 | 2 | null): void {
  const totalStages = STAGE.TOTAL_STAGES;

  // Build visual representation
  // Left side: P2's progress (negative stages)
  // Center: current position marker
  // Right side: P1's progress (positive stages)

  let display = '';

  // P2 side (left) - filled if stage is negative
  for (let i = totalStages; i >= 1; i--) {
    display += currentStage <= -i ? '●' : '○';
  }

  // Center marker
  display += ' ◆ ';

  // P1 side (right) - filled if stage is positive
  for (let i = 1; i <= totalStages; i++) {
    display += currentStage >= i ? '●' : '○';
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
