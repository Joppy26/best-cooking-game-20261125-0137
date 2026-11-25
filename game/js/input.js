// Mouse and keyboard input for Dapur Kilat. Clicks are hit-tested against the
// layout rectangles render.js draws, so what you see is what you can click.

import { CANVAS_H, CANVAS_W, hitAt } from './render.js';
import { INGREDIENTS } from './recipes.js';
import { addToPlate, clearPlate, servePlate, startShift, takeGrilledChicken } from './state.js';

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (CANVAS_W / rect.width),
    y: (event.clientY - rect.top) * (CANVAS_H / rect.height),
  };
}

export function attachInput(canvas, state, sounds, announce) {
  canvas.addEventListener('click', (event) => {
    sounds.unlock();
    const point = canvasPoint(canvas, event);
    handleClick(state, sounds, announce, point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Backspace') event.preventDefault();
    sounds.unlock();
    handleKey(state, sounds, announce, event.key);
  });
}

export function handleClick(state, sounds, announce, x, y) {
  const hit = hitAt(state, x, y);
  if (!hit) return;
  if (hit.kind === 'start') {
    startShift(state);
    sounds.startShift();
    announce('Shift dimulai. Sajikan pesanan secepat mungkin.');
    return;
  }
  if (hit.kind === 'restart') {
    startShift(state);
    sounds.startShift();
    announce('Shift baru dimulai.');
    return;
  }
  if (hit.kind === 'serve') {
    const served = servePlate(state, sounds);
    if (served) announce(`Pesanan disajikan. Skor ${state.score}.`);
    return;
  }
  if (hit.kind === 'plate') {
    clearPlate(state, sounds);
    return;
  }
  if (hit.kind === 'grill') {
    takeGrilledChicken(state, hit.slot, x, y, sounds);
    return;
  }
  if (hit.kind === 'bin') {
    addToPlate(state, hit.ingredient, x, y, sounds);
  }
}

export function handleKey(state, sounds, announce, key) {
  if (state.screen === 'title' && (key === 'Enter' || key === ' ')) {
    startShift(state);
    sounds.startShift();
    announce('Shift dimulai.');
    return;
  }
  if (state.screen === 'over' && (key === 'r' || key === 'R' || key === 'Enter')) {
    startShift(state);
    sounds.startShift();
    announce('Shift baru dimulai.');
    return;
  }
  if (state.screen !== 'play') return;
  if (key === 'p' || key === 'P' || key === 'Escape') {
    state.paused = !state.paused;
    announce(state.paused ? 'Jeda.' : 'Lanjut masak.');
    return;
  }
  if (key === 'm' || key === 'M') {
    state.muted = sounds.toggleMute();
    announce(state.muted ? 'Suara mati.' : 'Suara hidup.');
    return;
  }
  if (state.paused) return;
  if (key === ' ') {
    const served = servePlate(state, sounds);
    if (served) announce(`Pesanan disajikan. Skor ${state.score}.`);
    return;
  }
  if (key === 'Backspace') {
    clearPlate(state, sounds);
    return;
  }
  if (key === 'g' || key === 'G') {
    addToPlate(state, 'ayam', 1120, 200, sounds);
    return;
  }
  const ingredient = INGREDIENTS.find((item) => item.key === key);
  if (ingredient) {
    addToPlate(state, ingredient.id, 640, 600, sounds);
  }
  if (key === 'r' || key === 'R') {
    startShift(state);
    sounds.startShift();
    announce('Shift diulang dari awal.');
  }
}
