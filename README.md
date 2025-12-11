# Pixel Duel

A local multiplayer fighting game built with **Miniplex** ECS and **Pixi.js**.

## Architecture

- **Data Layer**: Miniplex ECS manages all game state
- **Logic Layer**: Deterministic systems update game state at 60 FPS
- **Presentation Layer**: Pixi.js renders sprites from spritesheet

**Key benefits:**
- Fixed timestep ensures consistent physics regardless of frame rate
- Systems are pure functions, easy to test
- Architecture supports rollback netcode for online multiplayer

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
│   ├── movementSystem.ts # Movement and gravity
│   ├── collisionSystem.ts # Collision detection
│   ├── combatSystem.ts  # Fighting logic
│   └── renderSystem.ts  # Syncs state to Pixi sprites
└── entities/            # Entity factories
    ├── createPlayer.ts  # Player + Sword creation
    └── createLevel.ts   # Ground and walls
```

## Controls

**Player 1:**
- `W/A/S/D` - Move and jump
- `E` - Attack
- `Q/R` - Change stance (Up/Down)
- `S` - Pick up sword

**Player 2:**
- `Arrow Keys` - Move and jump
- `/` - Attack
- `,/.` - Change stance (Up/Down)
- `Down` - Pick up sword

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

## Dependencies

- **Miniplex** - ECS library
- **Pixi.js** - 2D WebGL renderer
- **Vite** - Development server and build tool
- **TypeScript**
