// Input System - Hardware Abstraction Layer

import { queries } from '../state/world';

// Keyboard state tracking
const keys = new Set<string>();

// Initialize keyboard listeners
export function initInputSystem(): void {
  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });
}

// Update all player input components based on keyboard state
export function updateInputSystem(): void {
  for (const entity of queries.players) {
    if (!entity.player || !entity.input) continue;

    // Player 1 controls: WASD + E (attack) + Q/R (stance)
    // Player 2 controls: Arrow Keys + NumPad0 (attack) + NumPad1/NumPad2 (stance)
    if (entity.player.id === 1) {
      // Movement
      let x = 0;
      if (keys.has('KeyA')) x -= 1;
      if (keys.has('KeyD')) x += 1;
      entity.input.x = x;

      // Actions
      entity.input.jump = keys.has('KeyW');
      entity.input.attack = keys.has('KeyE');
      entity.input.stanceUp = keys.has('KeyQ');
      entity.input.stanceDown = keys.has('KeyR');
    } else if (entity.player.id === 2) {
      // Movement
      let x = 0;
      if (keys.has('ArrowLeft')) x -= 1;
      if (keys.has('ArrowRight')) x += 1;
      entity.input.x = x;

      // Actions
      entity.input.jump = keys.has('ArrowUp');
      entity.input.attack = keys.has('Numpad0');
      entity.input.stanceUp = keys.has('Numpad1');
      entity.input.stanceDown = keys.has('Numpad2');
    }
  }
}
