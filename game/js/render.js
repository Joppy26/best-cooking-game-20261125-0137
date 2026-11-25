// Every pixel of Dapur Kilat is drawn here with canvas shapes: the kitchen,
// the order board, the ingredient bins, the grill, the plate and the bell.
// Layout rectangles are exported so input.js can hit-test the same spots.

import { DISHES, GRILLED_CHICKEN, INGREDIENTS, dishById, findMatchingOrder, ingredientById } from './recipes.js';
import { GRILL_SLOTS, MAX_PLATE } from './state.js';

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 56 },
  board: { x: 16, y: 68, w: 276, h: 362 },
  plateZone: { x: 308, y: 68, w: 676, h: 362 },
  plate: { x: 496, y: 208, w: 300, h: 150 },
  grill: { x: 1000, y: 68, w: 264, h: 232 },
  bell: { x: 1000, y: 312, w: 264, h: 118 },
  bins: { x: 16, y: 446, w: 1248, h: 210 },
  hintBar: { x: 0, y: 680, w: 1280, h: 40 },
  startButton: { x: 490, y: 470, w: 300, h: 64 },
  restartButton: { x: 490, y: 500, w: 300, h: 64 },
};

export function binRect(index) {
  const area = LAYOUT.bins;
  const gap = 12;
  const width = (area.w - gap * (INGREDIENTS.length - 1)) / INGREDIENTS.length;
  return { x: area.x + index * (width + gap), y: area.y, w: width, h: area.h };
}

export function grillSlotRect(index) {
  const area = LAYOUT.grill;
  const slotW = (area.w - 48) / GRILL_SLOTS;
  return { x: area.x + 16 + index * slotW, y: area.y + 96, w: slotW - 12, h: 104 };
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function hitAt(state, x, y) {
  if (state.screen === 'title' && pointInRect(x, y, LAYOUT.startButton)) return { kind: 'start' };
  if (state.screen === 'over' && pointInRect(x, y, LAYOUT.restartButton)) return { kind: 'restart' };
  if (state.screen !== 'play') return null;
  if (pointInRect(x, y, LAYOUT.bell)) return { kind: 'serve' };
  if (pointInRect(x, y, LAYOUT.plate)) return { kind: 'plate' };
  for (let index = 0; index < GRILL_SLOTS; index += 1) {
    if (pointInRect(x, y, grillSlotRect(index))) return { kind: 'grill', slot: index };
  }
  for (let index = 0; index < INGREDIENTS.length; index += 1) {
    if (pointInRect(x, y, binRect(index))) return { kind: 'bin', ingredient: INGREDIENTS[index].id };
  }
  return null;
}

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawText(ctx, text, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

/** One ingredient drawn as a flat vector icon, centred at (x, y), radius r. */
export function drawFoodIcon(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'nasi') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.25, r, r * 0.62, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#e8d9ac';
    for (let index = 0; index < 7; index += 1) {
      const angle = Math.PI + (index / 6) * Math.PI;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r * 0.55, r * 0.25 + Math.sin(angle) * r * 0.35, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#c9a86a';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.28, r * 1.08, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#f2a594';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, 0, r * 0.62, r * 0.55, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7c9b8';
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.15, r * 0.3, r * 0.28, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7e3d3';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, r * 0.3);
    ctx.lineTo(r * 0.85, r * 0.75);
    ctx.stroke();
  } else if (id === GRILLED_CHICKEN) {
    ctx.fillStyle = '#b4632a';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, 0, r * 0.62, r * 0.55, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a3f16';
    ctx.fillRect(-r * 0.55, -r * 0.1, r * 0.16, r * 0.5);
    ctx.fillRect(-r * 0.25, -r * 0.28, r * 0.16, r * 0.5);
    ctx.fillRect(r * 0.05, -r * 0.1, r * 0.16, r * 0.5);
    ctx.strokeStyle = '#f7e3d3';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, r * 0.3);
    ctx.lineTo(r * 0.85, r * 0.75);
    ctx.stroke();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fffdf2';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7b731';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd76e';
    ctx.beginPath();
    ctx.arc(r * 0.02, -r * 0.12, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#4e9b3a';
    for (let index = 0; index < 3; index += 1) {
      const angle = -0.7 + index * 0.7;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.45, r * 0.34, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#2e6b24';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.2);
    ctx.lineTo(0, r * 0.8);
    ctx.stroke();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#c62f22';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.9, r * 0.55, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#e2483a';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.12, r * 0.72, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7c1d12';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, r * 0.05, r * 0.16, r * 0.1, 0.3, 0, Math.PI * 2);
    ctx.ellipse(r * 0.3, r * 0.2, r * 0.14, r * 0.09, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3e7a2e';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(r * 0.45, -r * 0.35);
    ctx.quadraticCurveTo(r * 0.7, -r * 0.6, r * 0.95, -r * 0.45);
    ctx.stroke();
  } else if (id === 'kerupuk') {
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath();
    for (let step = 0; step <= 24; step += 1) {
      const angle = (step / 24) * Math.PI * 2;
      const radius = r * (0.82 + 0.18 * Math.sin(angle * 5));
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8a83c';
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r * 0.45, Math.sin(angle) * r * 0.45, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawTopBar(ctx, state) {
  const bar = LAYOUT.topBar;
  ctx.fillStyle = '#4a2c17';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  ctx.fillStyle = '#f7c873';
  ctx.fillRect(bar.x, bar.y + bar.h - 4, bar.w, 4);
  drawText(ctx, 'DAPUR KILAT', 20, 20, 26, '#ffe9a8', 'left');
  drawText(ctx, 'Warung Bu Sari — masak cepat, saji cepat', 20, 42, 12, '#d9a05b', 'left');

  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = Math.floor(state.timeLeft % 60);
  const timeText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const urgent = state.timeLeft <= 30 && state.screen === 'play';
  drawText(ctx, 'SHIFT', 560, 18, 12, '#d9a05b', 'center');
  drawText(ctx, timeText, 560, 40, 26, urgent ? '#ff6b5e' : '#ffffff', 'center');
  ctx.fillStyle = '#2b1a0e';
  roundRect(ctx, 640, 14, 150, 14, 7);
  ctx.fill();
  ctx.fillStyle = urgent ? '#ff6b5e' : '#7bc96f';
  roundRect(ctx, 640, 14, 150 * Math.max(0, state.timeLeft / 180), 14, 7);
  ctx.fill();

  drawText(ctx, `Skor ${state.score}`, 1260, 18, 18, '#ffe9a8', 'right');
  drawText(ctx, `Rp ${state.coins}   Level ${state.level}   Kombo x${state.combo}`, 1260, 42, 13, '#d9a05b', 'right');
}

function drawOrderBoard(ctx, state) {
  const board = LAYOUT.board;
  ctx.fillStyle = '#5d3a1e';
  roundRect(ctx, board.x, board.y, board.w, board.h, 12);
  ctx.fill();
  ctx.fillStyle = '#f7e3c0';
  roundRect(ctx, board.x + 8, board.y + 8, board.w - 16, board.h - 16, 8);
  ctx.fill();
  drawText(ctx, 'PESANAN', board.x + board.w / 2, board.y + 28, 18, '#5d3a1e', 'center');
  ctx.strokeStyle = '#d9b98a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(board.x + 16, board.y + 46);
  ctx.lineTo(board.x + board.w - 16, board.y + 46);
  ctx.stroke();

  if (state.orders.length === 0) {
    drawText(ctx, 'Belum ada pesanan…', board.x + board.w / 2, board.y + 120, 14, '#8a6a45', 'center');
    return;
  }
  state.orders.forEach((order, index) => {
    const dish = dishById(order.dishId);
    if (!dish) return;
    const y = board.y + 58 + index * 104;
    const w = board.w - 32;
    const fraction = Math.max(0, order.patience / order.patienceMax);
    ctx.fillStyle = index === 0 ? '#fff6e0' : '#f3e2c2';
    roundRect(ctx, board.x + 16, y, w, 92, 8);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawText(ctx, dish.name, board.x + 28, y + 18, 16, '#4a2c17', 'left');
    drawText(ctx, `Rp ${dish.price}`, board.x + board.w - 28, y + 18, 14, '#8a5a2b', 'right');
    dish.needs.forEach((need, needIndex) => {
      drawFoodIcon(ctx, need, board.x + 40 + needIndex * 44, y + 52, 15);
    });
    drawText(ctx, dish.blurb, board.x + 28 + dish.needs.length * 44, y + 52, 11, '#8a6a45', 'left');
    ctx.fillStyle = '#e8d9ac';
    roundRect(ctx, board.x + 28, y + 74, w - 24, 8, 4);
    ctx.fill();
    ctx.fillStyle = fraction > 0.5 ? '#7bc96f' : fraction > 0.25 ? '#f7b731' : '#e2483a';
    roundRect(ctx, board.x + 28, y + 74, (w - 24) * fraction, 8, 4);
    ctx.fill();
  });
}

function drawPlateZone(ctx, state) {
  const zone = LAYOUT.plateZone;
  ctx.fillStyle = '#f7dcab';
  roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 12);
  ctx.fill();
  ctx.fillStyle = '#e8c183';
  roundRect(ctx, zone.x, zone.y, zone.w, 90, 12);
  ctx.fill();
  ctx.fillStyle = '#bfe3f2';
  roundRect(ctx, zone.x + 24, zone.y + 14, 150, 62, 6);
  ctx.fill();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(zone.x + 70, zone.y + 36, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(zone.x + 120, zone.y + 50, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  drawText(ctx, 'DAPUR', zone.x + 240, zone.y + 30, 20, '#8a5a2b', 'left');
  drawText(ctx, 'rak bumbu • wajan • piring saji', zone.x + 240, zone.y + 56, 12, '#a87a45', 'left');

  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(zone.x, zone.y + 330, zone.w, 100);
  ctx.fillStyle = '#a87a45';
  ctx.fillRect(zone.x, zone.y + 330, zone.w, 6);

  const plate = LAYOUT.plate;
  const cx = plate.x + plate.w / 2;
  const cy = plate.y + plate.h / 2;
  const shake = state.elapsed < state.shakeUntil ? (Math.random() - 0.5) * 8 : 0;
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = '#d9d9d9';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18, 150, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 138, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 118, 38, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (state.plate.length === 0) {
    drawText(ctx, 'Piring kosong — klik bahan di bawah', cx, cy + 12, 13, '#b09a7a', 'center');
  } else {
    const spots = [
      [-52, -6], [0, -14], [52, -6], [-26, 12], [26, 12],
    ];
    state.plate.forEach((ingredientId, index) => {
      const spot = spots[index % spots.length];
      drawFoodIcon(ctx, ingredientId, cx + spot[0], cy + spot[1], 26);
    });
    drawText(ctx, `${state.plate.length}/${MAX_PLATE} bahan`, cx, cy + 62, 12, '#8a6a45', 'center');
  }
  ctx.restore();

  drawText(ctx, 'PIRING SAJI', cx, zone.y + 118, 13, '#8a5a2b', 'center');
  if (state.message && state.elapsed < state.messageUntil) {
    drawText(ctx, state.message, cx, zone.y + 138, 15, '#a34a38', 'center');
  }
  const match = state.plate.length > 0 ? findMatchingOrder(state.plate, state.orders) : null;
  if (match) {
    const dish = dishById(match.dishId);
    drawText(ctx, `Cocok: ${dish.name} — bunyikan bel!`, cx, zone.y + 158, 15, '#3e7a2e', 'center');
  }

  state.floaters.forEach((floater) => {
    ctx.globalAlpha = Math.max(0, Math.min(1, floater.life));
    drawText(ctx, floater.text, floater.x, floater.y, 18, floater.color, 'center');
    ctx.globalAlpha = 1;
  });
}

function drawGrill(ctx, state) {
  const area = LAYOUT.grill;
  ctx.fillStyle = '#3a3a3a';
  roundRect(ctx, area.x, area.y, area.w, area.h, 12);
  ctx.fill();
  ctx.fillStyle = '#555555';
  roundRect(ctx, area.x + 10, area.y + 10, area.w - 20, 66, 8);
  ctx.fill();
  drawText(ctx, 'PANGGANGAN', area.x + area.w / 2, area.y + 30, 16, '#ffe9a8', 'center');
  drawText(ctx, 'klik Ayam (2) untuk memanggang', area.x + area.w / 2, area.y + 54, 11, '#c9c9c9', 'center');

  for (let index = 0; index < GRILL_SLOTS; index += 1) {
    const slot = grillSlotRect(index);
    ctx.fillStyle = '#222222';
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 8);
    ctx.fill();
    const item = state.grill[index];
    if (!item) {
      drawText(ctx, 'kosong', slot.x + slot.w / 2, slot.y + slot.h / 2, 12, '#777777', 'center');
      continue;
    }
    const cx = slot.x + slot.w / 2;
    if (!item.done) {
      ctx.fillStyle = '#ff9a3d';
      ctx.beginPath();
      ctx.ellipse(cx, slot.y + slot.h - 14, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd76e';
      ctx.beginPath();
      ctx.ellipse(cx, slot.y + slot.h - 18, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      drawFoodIcon(ctx, 'ayam', cx, slot.y + 38, 24);
      ctx.fillStyle = '#444444';
      roundRect(ctx, slot.x + 10, slot.y + slot.h - 12, slot.w - 20, 6, 3);
      ctx.fill();
      ctx.fillStyle = '#ff9a3d';
      roundRect(ctx, slot.x + 10, slot.y + slot.h - 12, (slot.w - 20) * item.progress, 6, 3);
      ctx.fill();
    } else {
      ctx.fillStyle = '#7bc96f';
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 8);
      ctx.fill();
      drawFoodIcon(ctx, GRILLED_CHICKEN, cx, slot.y + 40, 26);
      drawText(ctx, 'MATANG! Klik!', cx, slot.y + 82, 12, '#1e4d14', 'center');
    }
  }
}

function drawBell(ctx, state) {
  const bell = LAYOUT.bell;
  const ready = state.plate.length > 0 && findMatchingOrder(state.plate, state.orders) !== null;
  ctx.fillStyle = ready ? '#2e7d32' : '#6e3c14';
  roundRect(ctx, bell.x, bell.y, bell.w, bell.h, 12);
  ctx.fill();
  if (ready) {
    ctx.strokeStyle = '#b6ff9e';
    ctx.lineWidth = 4;
    roundRect(ctx, bell.x + 4, bell.y + 4, bell.w - 8, bell.h - 8, 10);
    ctx.stroke();
  }
  ctx.fillStyle = '#f7c873';
  ctx.beginPath();
  ctx.arc(bell.x + 56, bell.y + 62, 34, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(bell.x + 18, bell.y + 62, 76, 8);
  ctx.beginPath();
  ctx.arc(bell.x + 56, bell.y + 78, 8, 0, Math.PI * 2);
  ctx.fill();
  drawText(ctx, ready ? 'SIAP SAJI!' : 'SAJI', bell.x + 168, bell.y + 48, ready ? 21 : 24, '#ffffff', 'center');
  drawText(ctx, ready ? 'bunyi bel, antar!' : 'Space / klik bel', bell.x + 168, bell.y + 82, 12, '#ffe9a8', 'center');
}

function drawBins(ctx, state) {
  const area = LAYOUT.bins;
  ctx.fillStyle = '#8a5a2b';
  roundRect(ctx, area.x, area.y - 8, area.w, area.h + 16, 12);
  ctx.fill();
  ctx.fillStyle = '#a87a45';
  ctx.fillRect(area.x, area.y - 8, area.w, 8);

  INGREDIENTS.forEach((ingredient, index) => {
    const rect = binRect(index);
    ctx.fillStyle = '#f7e3c0';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.strokeStyle = ingredient.dark;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = ingredient.color;
    roundRect(ctx, rect.x + 10, rect.y + 10, rect.w - 20, 108, 8);
    ctx.fill();
    drawFoodIcon(ctx, ingredient.id, rect.x + rect.w / 2, rect.y + 64, 40);
    drawText(ctx, ingredient.name, rect.x + rect.w / 2, rect.y + 140, 20, '#4a2c17', 'center');
    drawText(ctx, ingredient.hint, rect.x + rect.w / 2, rect.y + 164, 11, '#8a6a45', 'center');
    ctx.fillStyle = '#4a2c17';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w - 24, rect.y + 24, 14, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, ingredient.key, rect.x + rect.w - 24, rect.y + 25, 14, '#ffe9a8', 'center');
  });
}

function drawHintBar(ctx, state) {
  const bar = LAYOUT.hintBar;
  ctx.fillStyle = '#241a12';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  const text = state.screen === 'play'
    ? '1–6 bahan   •   G / klik Ayam: panggang   •   Space: saji   •   Backspace: kosongkan piring   •   P: jeda   •   M: bisu   •   R: ulang'
    : 'Klik MULAI untuk membuka warung. Sajikan pesanan sebelum waktunya habis!';
  drawText(ctx, text, 640, bar.y + 20, 13, '#d9a05b', 'center');
}

function drawTitleScreen(ctx, state) {
  ctx.fillStyle = 'rgba(36, 26, 18, 0.72)';
  ctx.fillRect(0, 56, 1280, 624);
  drawText(ctx, 'DAPUR KILAT', 640, 150, 64, '#ffe9a8', 'center');
  drawText(ctx, 'Warung Bu Sari buka! Masak cepat, saji cepat, jangan sampai pelanggan menunggu.', 640, 205, 18, '#ffffff', 'center');
  drawText(ctx, 'Baca pesanan di papan, rakit hidangan di piring, panggang ayam di panggangan,', 640, 235, 15, '#f7c873', 'center');
  drawText(ctx, 'lalu bunyikan bel saat piring cocok dengan pesanan. Shift 3 menit — skor setinggi mungkin!', 640, 258, 15, '#f7c873', 'center');
  drawText(ctx, 'Nasi Ayam Bakar  •  Nasi Telur Dadar  •  Nasi Sayur Lodeh  •  Nasi Komplit  •  Nasi Pedas', 640, 300, 14, '#ffffff', 'center');

  const button = LAYOUT.startButton;
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, button.x, button.y, button.w, button.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#b6ff9e';
  ctx.lineWidth = 3;
  ctx.stroke();
  drawText(ctx, 'MULAI MASAK', button.x + button.w / 2, button.y + button.h / 2 + 1, 26, '#ffffff', 'center');
  drawText(ctx, 'atau tekan Enter', 640, button.y + button.h + 26, 13, '#d9a05b', 'center');
}

function drawGameOverScreen(ctx, state) {
  ctx.fillStyle = 'rgba(36, 26, 18, 0.78)';
  ctx.fillRect(0, 56, 1280, 624);
  drawText(ctx, 'SHIFT SELESAI!', 640, 170, 52, '#ffe9a8', 'center');
  drawText(ctx, `Skor akhir: ${state.score}`, 640, 240, 28, '#ffffff', 'center');
  drawText(ctx, `Pesanan disajikan: ${state.served}   •   Kombo terbaik: x${state.bestCombo}   •   Level: ${state.level}`, 640, 290, 17, '#f7c873', 'center');
  const verdict = state.served >= 12 ? 'Bu Sari bangga! Warungmu ramai sekali hari ini.'
    : state.served >= 6 ? 'Lumayan! Besok masak lebih cepat lagi.'
    : 'Pelanggan masih menunggu… coba lagi, lebih cepat!';
  drawText(ctx, verdict, 640, 330, 16, '#ffffff', 'center');
  const button = LAYOUT.restartButton;
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, button.x, button.y, button.w, button.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#b6ff9e';
  ctx.lineWidth = 3;
  ctx.stroke();
  drawText(ctx, 'MASAK LAGI', button.x + button.w / 2, button.y + button.h / 2 + 1, 26, '#ffffff', 'center');
  drawText(ctx, 'atau tekan R', 640, button.y + button.h + 26, 13, '#d9a05b', 'center');
}

function drawPausedNote(ctx) {
  ctx.fillStyle = 'rgba(36, 26, 18, 0.55)';
  ctx.fillRect(0, 56, 1280, 624);
  drawText(ctx, 'JEDA — tekan P untuk lanjut', 640, 360, 30, '#ffffff', 'center');
}

export function drawKitchen(ctx, state) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#f7dcab';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawTopBar(ctx, state);
  drawOrderBoard(ctx, state);
  drawPlateZone(ctx, state);
  drawGrill(ctx, state);
  drawBell(ctx, state);
  drawBins(ctx, state);
  drawHintBar(ctx, state);
  if (state.screen === 'title') drawTitleScreen(ctx, state);
  else if (state.screen === 'over') drawGameOverScreen(ctx, state);
  else if (state.paused) drawPausedNote(ctx);
}

export { DISHES };
