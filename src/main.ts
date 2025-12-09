// Main Entry Point - Fixed Timestep Game Loop

import { initRenderSystem, updateRenderSystem } from './systems/renderSystem';
import { initInputSystem, updateInputSystem } from './systems/inputSystem';
import { updatePhysicsSystem } from './systems/physicsSystem';
import { updateCombatSystem } from './systems/combatSystem';
import { createPlayer } from './entities/createPlayer';
import { createLevel } from './entities/createLevel';
import { GAME, PLAYER } from './config';

// Fixed timestep configuration
const FIXED_TIMESTEP = GAME.FIXED_TIMESTEP; // 16.67ms (60 FPS)
const MAX_FRAME_TIME = 250; // Prevent spiral of death

let lastTime = 0;
let accumulator = 0;

async function init() {
  // Initialize systems
  const app = await initRenderSystem();
  initInputSystem();

  // Create game entities
  createLevel();
  createPlayer(1, PLAYER.SPAWN_P1_X, PLAYER.SPAWN_Y);
  createPlayer(2, PLAYER.SPAWN_P2_X, PLAYER.SPAWN_Y);

  // Mount Pixi canvas
  document.getElementById('app')?.appendChild(app.canvas);

  // Start game loop
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime: number) {
  requestAnimationFrame(gameLoop);

  // Calculate delta time
  let deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Prevent spiral of death
  if (deltaTime > MAX_FRAME_TIME) {
    deltaTime = MAX_FRAME_TIME;
  }

  // Accumulate time
  accumulator += deltaTime;

  // Fixed update loop
  while (accumulator >= FIXED_TIMESTEP) {
    // Update input (reads hardware state)
    updateInputSystem();

    // Update physics (deterministic)
    updatePhysicsSystem(FIXED_TIMESTEP);

    // Update combat (deterministic)
    updateCombatSystem();

    accumulator -= FIXED_TIMESTEP;
  }

  // Calculate interpolation alpha
  const alpha = accumulator / FIXED_TIMESTEP;

  // Render with interpolation
  updateRenderSystem(alpha);
}

// Start the game
init().catch(console.error);
