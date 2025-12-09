# Assets Directory

This directory is for game assets like spritesheets, textures, and sound files.

## Current Implementation

The game currently uses Pixi.js Graphics API to draw colored rectangles.

## Future Assets

When adding visual assets:

1. **Spritesheets** - Character animations
2. **Textures** - Background tiles, UI elements
3. **Audio** - Sound effects and music

## Loading Assets

Update `src/systems/renderSystem.ts` to load textures:

```typescript
import { Assets } from 'pixi.js';

// In initRenderSystem:
await Assets.load([
  { alias: 'player1', src: '/assets/player1.png' },
  { alias: 'player2', src: '/assets/player2.png' },
]);
```
