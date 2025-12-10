// Input System - Hardware Abstraction Layer

import { queries } from '../state/world';

// Keyboard state tracking
const keys = new Set<string>();

// Previous frame's button state for edge detection
const prevInputState = new Map<string, {
  jump: boolean;
  attack: boolean;
  stanceUp: boolean;
  stanceDown: boolean;
  pickup: boolean;
}>();

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

    // Get previous state
    const prev = prevInputState.get(entity.id) || {
      jump: false,
      attack: false,
      stanceUp: false,
      stanceDown: false,
      pickup: false,
    };

    // Player 1 controls: WASD + E (attack) + Q/R (stance) + S (pickup)
    // Player 2 controls: Arrow Keys + Slash (attack) + Comma/Period (stance) + ArrowDown (pickup)
    if (entity.player.id === 1) {
      // Movement
      let x = 0;
      if (keys.has('KeyA')) x -= 1;
      if (keys.has('KeyD')) x += 1;
      entity.input.x = x;

      // Current button states
      entity.input.jump = keys.has('KeyW');
      entity.input.attack = keys.has('KeyE');
      entity.input.stanceUp = keys.has('KeyQ');
      entity.input.stanceDown = keys.has('KeyR');
      entity.input.pickup = keys.has('KeyS');
    } else if (entity.player.id === 2) {
      // Movement
      let x = 0;
      if (keys.has('ArrowLeft')) x -= 1;
      if (keys.has('ArrowRight')) x += 1;
      entity.input.x = x;

      // Current button states
      entity.input.jump = keys.has('ArrowUp');
      entity.input.attack = keys.has('Slash');
      entity.input.stanceUp = keys.has('Comma');
      entity.input.stanceDown = keys.has('Period');
      entity.input.pickup = keys.has('ArrowDown');
    }

    // Edge detection: true only on the frame button was pressed
    entity.input.jumpPressed = entity.input.jump && !prev.jump;
    entity.input.attackPressed = entity.input.attack && !prev.attack;
    entity.input.stanceUpPressed = entity.input.stanceUp && !prev.stanceUp;
    entity.input.stanceDownPressed = entity.input.stanceDown && !prev.stanceDown;
    entity.input.pickupPressed = entity.input.pickup && !prev.pickup;

    // Store current state for next frame
    prevInputState.set(entity.id, {
      jump: entity.input.jump,
      attack: entity.input.attack,
      stanceUp: entity.input.stanceUp,
      stanceDown: entity.input.stanceDown,
      pickup: entity.input.pickup,
    });
  }
}
