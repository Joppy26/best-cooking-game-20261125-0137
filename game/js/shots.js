// Staged scenes for screenshots: each one sets the real game state to a
// fixed, deterministic moment, and the renderer draws it exactly as a
// player would see it mid-shift. Same name always gives the same frame.

import { newShift, patienceForLevel } from './state.js';

function makeOrder(state, dishId, patienceFraction) {
  const patience = patienceForLevel(state.level);
  state.orders.push({
    id: state.nextOrderId,
    dishId,
    patience: patience * patienceFraction,
    patienceMax: patience,
  });
  state.nextOrderId += 1;
}

/**
 * Stage the named scene (start, assembly, ready or rush) on a fresh state
 * and return the screen the renderer should draw over it.
 */
export function stageShot(name, state) {
  const fresh = newShift(77);
  Object.keys(fresh).forEach((key) => {
    state[key] = fresh[key];
  });

  if (name === 'assembly') {
    state.screen = 'play';
    state.timeLeft = 132;
    state.elapsed = 48;
    state.score = 340;
    state.coins = 220;
    state.served = 3;
    state.combo = 2;
    state.level = 1;
    makeOrder(state, 'telur-dadar', 0.72);
    makeOrder(state, 'ayam-bakar', 0.55);
    state.plate = ['nasi', 'telur'];
    state.grill = [{ ingredient: 'ayam', progress: 0.6, done: false }];
    state.spawnIn = 6;
    return 'play';
  }

  if (name === 'ready') {
    state.screen = 'play';
    state.timeLeft = 84;
    state.elapsed = 96;
    state.score = 860;
    state.coins = 570;
    state.served = 7;
    state.combo = 3;
    state.bestCombo = 3;
    state.level = 2;
    makeOrder(state, 'telur-dadar', 0.6);
    makeOrder(state, 'sayur-lodeh', 0.8);
    state.plate = ['nasi', 'telur', 'sayur'];
    state.grill = [];
    state.spawnIn = 4;
    return 'play';
  }

  if (name === 'rush') {
    state.screen = 'play';
    state.timeLeft = 32;
    state.elapsed = 148;
    state.score = 1250;
    state.coins = 890;
    state.served = 11;
    state.combo = 5;
    state.bestCombo = 5;
    state.level = 3;
    makeOrder(state, 'komplit', 0.22);
    makeOrder(state, 'pedas', 0.35);
    makeOrder(state, 'ayam-bakar', 0.48);
    state.plate = ['nasi', 'ayambakar'];
    state.grill = [
      { ingredient: 'ayam', progress: 1, done: true },
      { ingredient: 'ayam', progress: 0.35, done: false },
    ];
    state.spawnIn = 2;
    return 'play';
  }

  // Default: the start scene — title over a kitchen already taking orders.
  state.screen = 'title';
  state.timeLeft = 180;
  state.elapsed = 0;
  state.score = 0;
  state.coins = 0;
  state.served = 0;
  makeOrder(state, 'ayam-bakar', 0.9);
  makeOrder(state, 'sayur-lodeh', 0.75);
  return 'title';
}
