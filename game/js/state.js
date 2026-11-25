// Game state and rules for Dapur Kilat: orders, the grill, the plate,
// serving, scoring, the shift timer and level pressure.

import { DISHES, GRILLED_CHICKEN, findMatchingOrder, ingredientById } from './recipes.js';
import { makeRng, pickFrom } from './rng.js';

export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 3;
export const MAX_PLATE = 5;
export const GRILL_SLOTS = 2;
export const GRILL_SECONDS = 4;

export function newShift(seed) {
  return {
    screen: 'title',
    rng: makeRng(seed || 20261125),
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    orders: [],
    nextOrderId: 1,
    spawnIn: 1.5,
    plate: [],
    grill: [],
    floaters: [],
    message: '',
    messageUntil: 0,
    shakeUntil: 0,
    paused: false,
    muted: false,
    elapsed: 0,
    lastTickSecond: -1,
    over: false,
  };
}

export function patienceForLevel(level) {
  return Math.max(28, 46 - level * 3);
}

export function spawnGapForLevel(level) {
  return Math.max(6.5, 12 - level * 1.2);
}

export function spawnOrder(state) {
  const dish = pickFrom(state.rng, DISHES);
  const patience = patienceForLevel(state.level);
  state.orders.push({
    id: state.nextOrderId,
    dishId: dish.id,
    patience,
    patienceMax: patience,
  });
  state.nextOrderId += 1;
}

export function startShift(state) {
  const fresh = newShift(20261125 + Math.floor(Math.random() * 100000));
  Object.keys(fresh).forEach((key) => {
    state[key] = fresh[key];
  });
  state.screen = 'play';
  spawnOrder(state);
  spawnOrder(state);
}

export function addFloater(state, text, x, y, color) {
  state.floaters.push({ text, x, y, color: color || '#ffffff', life: 1.4 });
}

export function addToPlate(state, ingredientId, x, y, sounds) {
  if (state.screen !== 'play' || state.paused) return false;
  if (ingredientId === 'ayam') {
    return sendChickenToGrill(state, x, y, sounds);
  }
  if (state.plate.length >= MAX_PLATE) {
    addFloater(state, 'Piring penuh!', x, y, '#ffb3a0');
    if (sounds) sounds.wrong();
    return false;
  }
  state.plate.push(ingredientId);
  addFloater(state, `+ ${ingredientById(ingredientId).name}`, x, y - 10, '#ffe9a8');
  if (sounds) sounds.chop();
  return true;
}

export function sendChickenToGrill(state, x, y, sounds) {
  if (state.grill.length >= GRILL_SLOTS) {
    addFloater(state, 'Panggangan penuh!', x, y, '#ffb3a0');
    if (sounds) sounds.wrong();
    return false;
  }
  state.grill.push({ ingredient: 'ayam', progress: 0, done: false });
  addFloater(state, 'Ayam naik panggangan', x, y - 10, '#ffc9a8');
  if (sounds) sounds.grillOn();
  return true;
}

export function takeGrilledChicken(state, slotIndex, x, y, sounds) {
  const slot = state.grill[slotIndex];
  if (!slot || !slot.done) return false;
  if (state.plate.length >= MAX_PLATE) {
    addFloater(state, 'Piring penuh!', x, y, '#ffb3a0');
    if (sounds) sounds.wrong();
    return false;
  }
  state.grill.splice(slotIndex, 1);
  state.plate.push(GRILLED_CHICKEN);
  addFloater(state, '+ Ayam Bakar', x, y - 10, '#ffd98a');
  if (sounds) sounds.chop();
  return true;
}

export function clearPlate(state, sounds) {
  if (state.plate.length === 0) return;
  state.plate = [];
  if (sounds) sounds.playTone(300, 0.08, 'triangle', 0.07);
}

export function servePlate(state, sounds) {
  if (state.screen !== 'play' || state.paused) return false;
  if (state.plate.length === 0) {
    addFloater(state, 'Piring masih kosong', 640, 330, '#ffb3a0');
    if (sounds) sounds.wrong();
    return false;
  }
  const order = findMatchingOrder(state.plate, state.orders);
  if (!order) {
    state.combo = 0;
    state.shakeUntil = state.elapsed + 0.35;
    addFloater(state, 'Bukan pesanan itu!', 640, 330, '#ff8a7a');
    if (sounds) sounds.wrong();
    return false;
  }
  const dish = DISHES.find((item) => item.id === order.dishId);
  const patienceBonus = Math.round(50 * (order.patience / order.patienceMax));
  const comboBonus = state.combo * 10;
  const earned = dish.price + patienceBonus + comboBonus;
  state.score += earned;
  state.coins += dish.price;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((item) => item.id !== order.id);
  state.plate = [];
  state.level = 1 + Math.floor(state.served / 5);
  addFloater(state, `+${earned}  ${dish.name}`, 640, 300, '#b6ff9e');
  if (state.combo >= 2) {
    addFloater(state, `Kombo x${state.combo}!`, 640, 260, '#ffe066');
  }
  if (sounds) sounds.serve(state.combo);
  return true;
}

export function tickShift(state, dt, sounds) {
  if (state.screen !== 'play' || state.paused) return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);

  const wholeSecond = Math.floor(state.timeLeft);
  if (wholeSecond !== state.lastTickSecond) {
    state.lastTickSecond = wholeSecond;
    if (wholeSecond <= 10 && wholeSecond > 0 && sounds) sounds.tick();
  }

  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    state.spawnIn = spawnGapForLevel(state.level);
  }

  for (let index = state.orders.length - 1; index >= 0; index -= 1) {
    const order = state.orders[index];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(index, 1);
      state.combo = 0;
      state.message = 'Pesanan hangus! Pelanggan pergi.';
      state.messageUntil = state.elapsed + 2;
      if (sounds) sounds.expired();
    }
  }

  for (let index = 0; index < state.grill.length; index += 1) {
    const slot = state.grill[index];
    if (!slot.done) {
      slot.progress += dt / GRILL_SECONDS;
      if (slot.progress >= 1) {
        slot.progress = 1;
        slot.done = true;
        if (sounds) sounds.grillDone();
      }
    }
  }

  for (let index = state.floaters.length - 1; index >= 0; index -= 1) {
    const floater = state.floaters[index];
    floater.life -= dt;
    floater.y -= 34 * dt;
    if (floater.life <= 0) state.floaters.splice(index, 1);
  }

  if (state.timeLeft <= 0) {
    state.screen = 'over';
    state.over = true;
    if (sounds) sounds.endShift();
  }
}
