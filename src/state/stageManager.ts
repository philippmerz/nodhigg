// Stage Manager - Track stage progression and transitions

import { STAGE, GAME, PLAYER } from '../config';

export type PlayerId = 1 | 2;

export interface StageState {
  // Current stage: 0 = center, positive = P1 progressing right, negative = P2 progressing left
  // Range: -TOTAL_STAGES to +TOTAL_STAGES
  currentStage: number;

  // Who got the last kill (null at game start - neither can progress)
  lastKillBy: PlayerId | null;

  // Transition state
  isTransitioning: boolean;
  transitionProgress: number; // 0 to 1
  transitionDirection: 'out' | 'in';

  // Winner (null until game ends)
  winner: PlayerId | null;
}

// Module state
const state: StageState = {
  currentStage: 0,
  lastKillBy: null,
  isTransitioning: false,
  transitionProgress: 0,
  transitionDirection: 'out',
  winner: null,
};

/**
 * Get the current stage state (read-only view)
 */
export function getStageState(): Readonly<StageState> {
  return state;
}

/**
 * Record a kill - the killer becomes eligible to progress
 */
export function recordKill(killerId: PlayerId): void {
  state.lastKillBy = killerId;
  console.log(`Player ${killerId} got a kill - eligible to progress!`);
}

/**
 * Check if a player can progress (has last kill and reached their goal edge)
 */
export function canPlayerProgress(playerId: PlayerId, playerX: number): boolean {
  // Can't progress during transition or if game is won
  if (state.isTransitioning || state.winner) return false;

  // Must have the last kill
  if (state.lastKillBy !== playerId) return false;

  // P1 progresses right, P2 progresses left
  if (playerId === 1) {
    // P1 needs to reach right edge, and stage must not be at max
    const atRightEdge = playerX >= GAME.WIDTH - STAGE.EDGE_THRESHOLD;
    const canGoRight = state.currentStage < STAGE.TOTAL_STAGES;
    return atRightEdge && canGoRight;
  } else {
    // P2 needs to reach left edge, and stage must not be at min
    const atLeftEdge = playerX <= STAGE.EDGE_THRESHOLD;
    const canGoLeft = state.currentStage > -STAGE.TOTAL_STAGES;
    return atLeftEdge && canGoLeft;
  }
}

/**
 * Start stage transition when a player progresses
 */
export function startTransition(progressingPlayer: PlayerId): void {
  state.isTransitioning = true;
  state.transitionProgress = 0;
  state.transitionDirection = 'out';

  // Update stage based on who progressed
  if (progressingPlayer === 1) {
    state.currentStage += 1;
    console.log(`Stage progressed to ${state.currentStage} (P1 advancing right)`);
  } else {
    state.currentStage -= 1;
    console.log(`Stage progressed to ${state.currentStage} (P2 advancing left)`);
  }

  // Reset last kill - must earn progression again
  state.lastKillBy = null;

  // Check for win condition
  if (state.currentStage >= STAGE.TOTAL_STAGES) {
    state.winner = 1;
    console.log('Player 1 WINS!');
  } else if (state.currentStage <= -STAGE.TOTAL_STAGES) {
    state.winner = 2;
    console.log('Player 2 WINS!');
  }
}

/**
 * Update transition animation
 * Returns true when transition reaches midpoint (time to reset stage)
 */
export function updateTransition(deltaTime: number): boolean {
  if (!state.isTransitioning) return false;

  const transitionSpeed = 1 / (STAGE.TRANSITION_DURATION / 2); // Complete one direction in half duration
  state.transitionProgress += transitionSpeed * deltaTime;

  if (state.transitionProgress >= 1) {
    if (state.transitionDirection === 'out') {
      // Midpoint reached - switch to fade in
      state.transitionDirection = 'in';
      state.transitionProgress = 0;
      return true; // Signal to reset stage entities
    } else {
      // Transition complete
      state.isTransitioning = false;
      state.transitionProgress = 0;
      return false;
    }
  }

  return false;
}

/**
 * Get the current transition opacity (0 = fully visible, 1 = fully black)
 */
export function getTransitionOpacity(): number {
  if (!state.isTransitioning) return 0;

  if (state.transitionDirection === 'out') {
    // Fading to black
    return state.transitionProgress;
  } else {
    // Fading from black
    return 1 - state.transitionProgress;
  }
}

/**
 * Get spawn positions for current stage context
 * When stage is positive (P1 territory), P2 spawns more defensively
 * When stage is negative (P2 territory), P1 spawns more defensively
 */
export function getSpawnPositions(): { p1X: number; p2X: number; y: number } {
  const y = PLAYER.SPAWN_Y;
  
  // Base positions
  let p1X = PLAYER.SPAWN_P1_X;
  let p2X = PLAYER.SPAWN_P2_X;

  // Adjust based on stage progression (optional: could add visual variety)
  // For now, keep symmetric spawns

  return { p1X, p2X, y };
}

/**
 * Reset the stage manager (for new game)
 */
export function resetStageManager(): void {
  state.currentStage = 0;
  state.lastKillBy = null;
  state.isTransitioning = false;
  state.transitionProgress = 0;
  state.transitionDirection = 'out';
  state.winner = null;
}
