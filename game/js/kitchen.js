// kitchen.js — draws the whole warung kitchen on the canvas: the header with
// score and shift timer, the order board, the menu, the ingredient counter,
// the serving plate and the overlays. All art is drawn with canvas paths;
// no image files are loaded.

const CANVAS_W = 1280;
const CANVAS_H = 800;

// Layout rectangles in canvas coordinates (the canvas is fixed at 1280x800).
const LAYOUT = {
  header: { x: 0, y: 0, w: 1280, h: 70 },
  orderBoard: { x: 24, y: 88, w: 380, h: 348 },
  menuBoard: { x: 24, y: 452, w: 380, h: 316 },
  plate: { x: 840, y: 330 },
  serveButton: { x: 700, y: 560, w: 180, h: 64 },
  clearButton: { x: 900, y: 560, w: 180, h: 64 },
  counter: { x: 428, y: 648, w: 828, h: 128 },
};

const BIN_W = 128;
const BIN_GAP = 10;

function binRect(index) {
  const startX = LAYOUT.counter.x + 8;
  return {
    x: startX + index * (BIN_W + BIN_GAP),
    y: LAYOUT.counter.y + 14,
    w: BIN_W,
    h: 100,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawIngredientIcon(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'nasi') {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.ellipse(0, 6, r, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9c49a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e8d9b0';
    for (const [dx, dy] of [[-10, -2], [0, -6], [10, 0], [-4, 4], [6, 6]]) {
      ctx.beginPath();
      ctx.arc(dx * r / 22, dy * r / 22, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = '#e8a34c';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.5);
    ctx.quadraticCurveTo(-r, -r * 0.6, 0, -r * 0.7);
    ctx.quadraticCurveTo(r, -r * 0.6, r * 0.7, r * 0.5);
    ctx.quadraticCurveTo(0, r * 0.9, -r * 0.7, r * 0.5);
    ctx.fill();
    ctx.strokeStyle = '#9c5a1d';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#f7c877';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.15, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.72, r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9c49a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#7bc96f';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, r * 0.2, r * 0.5, r * 0.32, -0.5, 0, Math.PI * 2);
    ctx.ellipse(r * 0.35, r * 0.2, r * 0.5, r * 0.32, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3e7d32';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#2e6b25';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(0, r * 0.1);
    ctx.stroke();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#e23b2e';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.quadraticCurveTo(r * 0.75, -r * 0.2, r * 0.55, r * 0.45);
    ctx.quadraticCurveTo(r * 0.2, r * 0.85, -r * 0.2, r * 0.7);
    ctx.quadraticCurveTo(-r * 0.7, r * 0.3, -r * 0.55, -r * 0.4);
    ctx.quadraticCurveTo(-r * 0.3, -r * 0.75, 0, -r * 0.8);
    ctx.fill();
    ctx.strokeStyle = '#8f1d12';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#3e7d32';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.quadraticCurveTo(r * 0.15, -r * 1.15, r * 0.4, -r * 1.05);
    ctx.stroke();
  } else if (id === 'kerupuk') {
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const px = Math.cos(a) * r * 0.85;
      const py = Math.sin(a) * r * 0.85;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b07f1e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#c98f2e';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHeader(ctx, state) {
  const h = LAYOUT.header;
  ctx.fillStyle = '#5b2d18';
  ctx.fillRect(h.x, h.y, h.w, h.h);
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARUNG RUSH', 24, 36);

  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Score  ' + state.score, 300, 36);
  ctx.fillText('Served  ' + state.served, 480, 36);
  ctx.fillText('Lv ' + state.level, 640, 36);

  // Hearts.
  for (let i = 0; i < 3; i++) {
    const cx = 760 + i * 34;
    const cy = 36;
    ctx.fillStyle = i < state.hearts ? '#ff5a5a' : '#6b4a3a';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 9);
    ctx.bezierCurveTo(cx - 13, cy - 3, cx - 8, cy - 13, cx, cy - 5);
    ctx.bezierCurveTo(cx + 8, cy - 13, cx + 13, cy - 3, cx, cy + 9);
    ctx.fill();
  }

  // Shift timer bar.
  const barX = 880;
  const barW = 280;
  ctx.fillStyle = '#3a241a';
  roundRect(ctx, barX, 22, barW, 26, 8);
  ctx.fill();
  const frac = Math.max(0, state.shiftTimeLeft / state.shiftTotal);
  ctx.fillStyle = frac < 0.2 ? '#ff5a5a' : '#7bc96f';
  roundRect(ctx, barX + 2, 24, (barW - 4) * frac, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  const mins = Math.floor(state.shiftTimeLeft / 60);
  const secs = Math.floor(state.shiftTimeLeft % 60);
  ctx.fillText('SHIFT ' + mins + ':' + String(secs).padStart(2, '0'), barX + barW / 2, 35);
  ctx.textAlign = 'left';

  if (state.muted) {
    ctx.fillStyle = '#e8c99a';
    ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('MUTED (M)', 1180, 36);
  }
}

function drawOrderBoard(ctx, state) {
  const b = LAYOUT.orderBoard;
  ctx.fillStyle = '#3a241a';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('ORDER BOARD', b.x + 16, b.y + 30);
  ctx.fillStyle = '#e8c99a';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Serve the dish before its timer runs out!', b.x + 16, b.y + 54);

  if (state.orders.length === 0) {
    ctx.fillStyle = '#e8c99a';
    ctx.font = 'italic 17px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('No orders yet — customers are coming…', b.x + 16, b.y + 120);
    return;
  }
  state.orders.forEach((order, i) => {
    const y = b.y + 74 + i * 90;
    const urgent = order.timeLeft < 6;
    ctx.fillStyle = urgent ? '#5b1d12' : '#f7e3c0';
    roundRect(ctx, b.x + 12, y, b.w - 24, 80, 10);
    ctx.fill();
    ctx.fillStyle = '#3a241a';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(order.dish.name, b.x + 26, y + 26);
    ctx.fillStyle = '#7a4a21';
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Rp ' + order.dish.price, b.x + b.w - 26, y + 26);
    ctx.textAlign = 'left';
    // Ingredient chips.
    order.dish.needs.forEach((need, j) => {
      const ing = ingredientById(need);
      const cx = b.x + 40 + j * 104;
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.arc(cx, y + 52, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ing.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#3a241a';
      ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText(ing.name, cx + 16, y + 57);
    });
    // Order countdown bar.
    const barW = b.w - 52;
    const frac = Math.max(0, order.timeLeft / order.timeMax);
    ctx.fillStyle = '#d9c49a';
    roundRect(ctx, b.x + 26, y + 66, barW, 8, 4);
    ctx.fill();
    ctx.fillStyle = urgent ? '#e23b2e' : '#7bc96f';
    roundRect(ctx, b.x + 26, y + 66, barW * frac, 8, 4);
    ctx.fill();
  });
}

function drawMenuBoard(ctx) {
  const b = LAYOUT.menuBoard;
  ctx.fillStyle = '#2e4a2a';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#cfe8b0';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('MENU — WARUNG RUSH', b.x + 16, b.y + 30);
  DISHES.forEach((dish, i) => {
    const y = b.y + 62 + i * 60;
    ctx.fillStyle = '#ffe9c9';
    ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(dish.name, b.x + 16, y);
    ctx.fillStyle = '#cfe8b0';
    ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
    const recipe = dish.needs.map((need) => ingredientById(need).name).join(' + ');
    ctx.fillText(recipe, b.x + 16, y + 24);
    ctx.fillStyle = '#ffb347';
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Rp ' + dish.price, b.x + b.w - 16, y);
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = '#cfe8b0';
  ctx.font = 'italic 14px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Tip: keys 1–6 add ingredients, Space serves.', b.x + 16, b.y + b.h - 16);
}

function drawKitchenBack(ctx) {
  // Wall, window and stove behind the plate area.
  ctx.fillStyle = '#f2d8a8';
  ctx.fillRect(428, 88, 828, 560);
  ctx.fillStyle = '#bfe3f0';
  roundRect(ctx, 480, 120, 220, 150, 10);
  ctx.fill();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(590, 120);
  ctx.lineTo(590, 270);
  ctx.moveTo(480, 195);
  ctx.lineTo(700, 195);
  ctx.stroke();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(650, 150, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7bc96f';
  ctx.beginPath();
  ctx.ellipse(590, 255, 90, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hanging lamp.
  ctx.strokeStyle = '#3a241a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(1080, 88);
  ctx.lineTo(1080, 140);
  ctx.stroke();
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.moveTo(1040, 140);
  ctx.lineTo(1120, 140);
  ctx.lineTo(1096, 180);
  ctx.lineTo(1064, 180);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.ellipse(1080, 184, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Stove with a pot.
  ctx.fillStyle = '#4a4a4a';
  roundRect(ctx, 480, 300, 220, 90, 8);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(540, 330, 26, 0, Math.PI * 2);
  ctx.arc(640, 330, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e23b2e';
  ctx.beginPath();
  ctx.arc(540, 330, 12, 0, Math.PI * 2);
  ctx.arc(640, 330, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8f8f8f';
  roundRect(ctx, 500, 268, 200, 34, 10);
  ctx.fill();
  ctx.fillStyle = '#e8c99a';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('WARUNG KITCHEN', 492, 372);
}

function drawPlateArea(ctx, state) {
  const px = LAYOUT.plate.x;
  const py = LAYOUT.plate.y;
  ctx.fillStyle = '#7a4a21';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR PLATE', px, py - 150);
  ctx.textAlign = 'left';
  // Table shadow and plate.
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(px, py + 96, 210, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(px, py + 60, 200, 78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#f7e3c0';
  ctx.beginPath();
  ctx.ellipse(px, py + 60, 160, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.plate.length === 0) {
    ctx.fillStyle = '#a98a68';
    ctx.font = 'italic 18px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empty — add ingredients from the counter', px, py + 66);
    ctx.textAlign = 'left';
  } else {
    // Draw the assembled ingredients piled on the plate.
    const spots = [
      [px - 70, py + 40], [px + 10, py + 30], [px + 80, py + 50],
      [px - 20, py + 70], [px + 50, py + 80], [px - 90, py + 75],
    ];
    state.plate.forEach((id, i) => {
      const spot = spots[i % spots.length];
      drawIngredientIcon(ctx, id, spot[0], spot[1], 34);
    });
    const match = findMatchingOrder(state.plate, state.orders);
    ctx.fillStyle = match ? '#2e7d32' : '#7a4a21';
    ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      match ? 'Ready to serve: ' + match.dish.name + '!' : 'Assembling… match an order above',
      px, py + 150,
    );
    ctx.textAlign = 'left';
  }

  // Serve and Clear buttons.
  drawButton(ctx, LAYOUT.serveButton, 'SERVE  (Space)', '#2e7d32', state.plate.length > 0);
  drawButton(ctx, LAYOUT.clearButton, 'CLEAR  (Bksp)', '#8f5a1d', state.plate.length > 0);
}

function drawButton(ctx, rect, label, color, enabled) {
  ctx.fillStyle = enabled ? color : '#9a8a76';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawCounter(ctx, state) {
  const c = LAYOUT.counter;
  ctx.fillStyle = '#7a4a21';
  roundRect(ctx, c.x, c.y, c.w, c.h, 12);
  ctx.fill();
  ctx.fillStyle = '#5b2d18';
  ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('INGREDIENTS — click or press 1–6', c.x + 16, c.y - 10);
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const onPlate = state.plate.includes(ing.id);
    ctx.fillStyle = onPlate ? '#ffe9c9' : '#f7e3c0';
    roundRect(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.strokeStyle = onPlate ? '#2e7d32' : '#c9a86a';
    ctx.lineWidth = onPlate ? 4 : 2;
    ctx.stroke();
    drawIngredientIcon(ctx, ing.id, r.x + r.w / 2, r.y + 38, 26);
    ctx.fillStyle = '#3a241a';
    ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ing.name, r.x + r.w / 2, r.y + 80);
    ctx.fillStyle = '#7a4a21';
    ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('[' + ing.key + ']', r.x + r.w / 2, r.y + 96);
    ctx.textAlign = 'left';
  });
}

function drawMessage(ctx, state) {
  if (!state.message || state.message.until <= performance.now()) return;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = state.message.color;
  roundRect(ctx, 440, 96, 380, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.message.text, 630, 119);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawOverlay(ctx, state) {
  if (state.phase === 'paused') {
    ctx.fillStyle = 'rgba(30,16,8,0.72)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffe9c9';
    ctx.font = 'bold 52px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2 - 20);
    ctx.font = '22px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('Press P to keep cooking', CANVAS_W / 2, CANVAS_H / 2 + 30);
    ctx.textAlign = 'left';
    return;
  }
  if (state.phase === 'over') {
    ctx.fillStyle = 'rgba(30,16,8,0.82)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffb347';
    ctx.font = 'bold 52px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHIFT OVER!', CANVAS_W / 2, 300);
    ctx.fillStyle = '#ffe9c9';
    ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('Final score: ' + state.score, CANVAS_W / 2, 360);
    ctx.font = '24px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('Dishes served: ' + state.served + '   •   Best combo: x' + state.bestCombo, CANVAS_W / 2, 410);
    ctx.fillText('Press R or click to play again', CANVAS_W / 2, 470);
    ctx.textAlign = 'left';
  }
}

/** Draw one frame of the game. */
function drawKitchen(ctx, state) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#f7e3c0';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawHeader(ctx, state);
  drawKitchenBack(ctx);
  drawOrderBoard(ctx, state);
  drawMenuBoard(ctx);
  drawPlateArea(ctx, state);
  drawCounter(ctx, state);
  drawMessage(ctx, state);
  drawOverlay(ctx, state);
}
