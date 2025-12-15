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

## Running the Game

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Dependencies

- **Miniplex** - ECS library
- **Pixi.js** - 2D WebGL renderer
- **Vite** - Development server and build tool
- **TypeScript**
