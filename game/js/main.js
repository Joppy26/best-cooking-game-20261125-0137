// Dapur Kilat boot: wires the canvas, input and the frame loop. With
// ?shot=<name> in the URL it stages a fixed screenshot scene instead of
// starting the title screen, and the game logic stays frozen on that frame.

import { SoundBoard } from './audio.js';
import { attachInput } from './input.js';
import { drawKitchen } from './render.js';
import { stageShot } from './shots.js';
import { newShift, tickShift } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');
const sounds = new SoundBoard();
const state = newShift(20261125);

function announce(text) {
  statusLine.textContent = text;
}

attachInput(canvas, state, sounds, announce);

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
let frozenShot = null;
if (shotName) {
  frozenShot = stageShot(shotName, state);
  state.screen = frozenShot;
}

let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  if (!frozenShot) {
    tickShift(state, dt, sounds);
  }
  drawKitchen(ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Hooks for automated play-testing from the browser console.
window.DapurKilat = { state, sounds, stageShot };
