# Pixel Duel - Deterministic ECS Fighting Game

A fighting game built with a clean **Entity-Component-System (ECS)** architecture using **Miniplex** and **Pixi.js**.

## Architecture Highlights

This project demonstrates a production-grade game architecture with complete separation of concerns:

- **Data Layer**: Miniplex ECS manages all game state
- **Logic Layer**: Pure, deterministic systems update game state at 60 FPS
- **Presentation Layer**: Pixi.js reads state and renders to canvas

### Why This Architecture?

✅ **Deterministic**: Fixed timestep ensures consistent physics regardless of frame rate  
✅ **Testable**: Systems are pure functions that can be unit tested  
✅ **Scalable**: Adding features doesn't break existing code  
✅ **Rollback-Ready**: Architecture supports networked multiplayer  

## Project Structure

```
src/
├── main.ts              # Entry point with fixed timestep loop
├── config.ts            # Game constants (gravity, speed, colors)
├── types.ts             # TypeScript ECS component definitions
├── state/
│   └── world.ts         # Miniplex world initialization
├── systems/             # Game logic (pure functions)
│   ├── inputSystem.ts   # Keyboard abstraction
│   ├── physicsSystem.ts # Movement, gravity, collision
│   ├── combatSystem.ts  # Stance-based fighting logic
│   └── renderSystem.ts  # Syncs state to Pixi sprites
└── entities/            # Entity factories (data constructors)
    ├── createPlayer.ts  # Player + Sword creation
    └── createLevel.ts   # Ground and walls
```

## Game Mechanics

### Controls

**Player 1:**
- `W/A/S/D` - Move and jump
- `E` - Attack
- `Q/R` - Change stance (Up/Down)

**Player 2:**
- `Arrow Keys` - Move and jump
- `Numpad 0` - Attack
- `Numpad 1/2` - Change stance (Up/Down)

### Combat System

Rock-Paper-Scissors stance system:
- **High** beats **Low**
- **Low** beats **Mid**
- **Mid** beats **High**

When stances match, swords clash and push players back.

## Technical Details

### Fixed Timestep Loop

The game runs physics at exactly 60 ticks per second using an accumulator pattern:

```typescript
while (accumulator >= FIXED_TIMESTEP) {
  updateInputSystem();
  updatePhysicsSystem(FIXED_TIMESTEP);
  updateCombatSystem();
  accumulator -= FIXED_TIMESTEP;
}
```

This ensures deterministic gameplay regardless of display refresh rate (30Hz, 60Hz, 144Hz, etc.).

### ECS Components

Entities are composed of optional components:

- `Position` - x/y coordinates
- `Velocity` - Movement vector
- `Collider` - Hit box (player/sword/wall)
- `Stance` - Combat state (Low/Mid/High)
- `Input` - Player intent (abstracted from hardware)
- `Sprite` - Visual representation key

## Running the Game

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Building for Production

```bash
npm run build
npm run preview
```

## Future Enhancements

- Spritesheet animations
- Sound effects
- Multiple levels with screen scrolling
- Online multiplayer (using rollback netcode)
- AI opponents
- Tournament mode

## Dependencies

- **Miniplex** - Lightweight ECS library
- **Pixi.js** - High-performance 2D WebGL renderer
- **Vite** - Fast development server and build tool
- **TypeScript** - Type-safe JavaScript

---

Built following game industry best practices for deterministic simulation and clean architecture.
