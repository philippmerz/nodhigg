// Collision System - Detect and resolve all collision interactions

import { world, queries } from '../state/world';
import { boxesOverlap, entityToBox, getCenterX, getHorizontalOverlap } from '../utils/collision';
import { disarmPlayer } from './attackSystem';
import { killPlayer } from './combatSystem';
import type { Entity } from '../types';

/**
 * Main collision system update
 */
export function updateCollisionSystem(): void {
  const players = Array.from(queries.players);

  if (players.length < 2) return;

  const [player1, player2] = players;

  // Resolve sword-to-sword blocking (when stances match, only for held swords)
  resolveSwordBlocking(player1, player2);

  // Detect held sword-to-player hits
  detectHeldSwordHits();

  // Detect flying sword-to-player hits (kills any player on contact)
  detectFlyingSwordHits(players);
}

/**
 * When two players have the same stance and their held swords collide,
 * push them apart so they can't walk through each other
 */
function resolveSwordBlocking(player1: Entity, player2: Entity): void {
  if (
    !player1.position || !player1.stance || !player1.collider ||
    !player2.position || !player2.stance || !player2.collider
  ) {
    return;
  }

  // Only block if stances match
  if (player1.stance.current !== player2.stance.current) return;

  // Get held sword entities only
  const sword1 = world.entities.find((e) => e.sword?.parentId === player1.id && e.sword.state === 'held');
  const sword2 = world.entities.find((e) => e.sword?.parentId === player2.id && e.sword.state === 'held');

  if (!sword1?.position || !sword1?.collider || !sword2?.position || !sword2?.collider) return;

  // Check if swords overlap
  const s1Box = entityToBox(sword1.position, sword1.collider);
  const s2Box = entityToBox(sword2.position, sword2.collider);

  if (!boxesOverlap(s1Box, s2Box)) return;

  // Calculate overlap and push players apart
  const overlap = getHorizontalOverlap(s1Box, s2Box);
  const pushAmount = overlap / 2 + 1; // +1 to ensure separation

  if (player1.position.x < player2.position.x) {
    // Player1 is on the left, push left; Player2 push right
    player1.position.x -= pushAmount;
    player2.position.x += pushAmount;
  } else {
    // Player2 is on the left, push left; Player1 push right
    player1.position.x += pushAmount;
    player2.position.x -= pushAmount;
  }

  // Disarm attacking players when swords clash
  const p1Attacking = player1.attack?.isAttacking || (player1.attack?.extension ?? 0) > 0;
  const p2Attacking = player2.attack?.isAttacking || (player2.attack?.extension ?? 0) > 0;

  if (p1Attacking) {
    disarmPlayer(player2.id);
  }
  if (p2Attacking) {
    disarmPlayer(player1.id);
  }
}

/**
 * Detect held sword-to-player hits (with stance-based blocking)
 */
function detectHeldSwordHits(): void {
  const swords = Array.from(queries.swords);
  const players = Array.from(queries.players);

  if (players.length < 2) return;

  // Check each held sword against the opposite player
  for (const sword of swords) {
    if (!sword.sword || !sword.position || !sword.collider) continue;
    if (sword.sword.state !== 'held') continue;

    // Find the owner of this sword
    const attacker = players.find((p) => p.id === sword.sword!.parentId);
    if (!attacker?.player || !attacker.stance || !attacker.facing) continue;

    // Find the defender (other player)
    const defender = players.find((p) => p.id !== attacker.id);
    if (!defender?.player || !defender.position || !defender.collider || !defender.stance || !defender.facing || !defender.health) continue;

    // Check for collision
    const swordBox = entityToBox(sword.position, sword.collider);
    const defenderBox = entityToBox(defender.position, defender.collider);

    if (!boxesOverlap(swordBox, defenderBox)) continue;

    // Check if defender has a sword to block with
    const defenderSword = world.entities.find(
      (e) => e.sword?.parentId === defender.id && e.sword.state === 'held'
    );
    const defenderIsArmed = !!defenderSword;

    // Determine if hit from behind
    const defenderCenter = getCenterX(defenderBox);
    const swordCenter = getCenterX(swordBox);

    const hitFromBehind =
      (defender.facing.direction === 1 && swordCenter < defenderCenter) ||
      (defender.facing.direction === -1 && swordCenter > defenderCenter);

    if (hitFromBehind) {
      // Backstab - always lethal
      killPlayer(defender.player.id, attacker.player.id, true);
    } else if (!defenderIsArmed) {
      // Disarmed player cannot block - always lethal
      killPlayer(defender.player.id, attacker.player.id, false);
    } else {
      // Frontal hit on armed player - sword gets past guard
      // Note: Same-stance blocking is handled by resolveSwordBlocking()
      // which pushes players apart before swords can reach bodies
      killPlayer(defender.player.id, attacker.player.id, false);
    }
  }
}

/**
 * Detect flying sword-to-player hits (kills any player on contact)
 */
function detectFlyingSwordHits(players: Entity[]): void {
  const swords = Array.from(queries.swords);

  for (const sword of swords) {
    if (!sword.sword || !sword.position || !sword.collider) continue;
    if (sword.sword.state !== 'flying') continue;

    for (const player of players) {
      if (!player.player || !player.position || !player.collider) continue;

      const swordBox = entityToBox(sword.position, sword.collider);
      const playerBox = entityToBox(player.position, player.collider);

      if (boxesOverlap(swordBox, playerBox)) {
        // Flying sword kills on contact - attacker is 0 (environmental kill)
        // We'll use the other player as attacker for respawn positioning
        const otherPlayer = players.find((p) => p.player?.id !== player.player?.id);
        const attackerId = otherPlayer?.player?.id ?? player.player.id;
        
        killPlayer(player.player.id, attackerId, false);
        console.log(`Player ${player.player.id} was killed by a flying sword!`);
      }
    }
  }
}
