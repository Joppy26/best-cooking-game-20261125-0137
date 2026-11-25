// game.js — Warung Rush game state: orders, the shift timer, scoring,
// hearts, combos and input. Rendering lives in kitchen.js, data in recipes.js.

const SHIFT_SECONDS = 150;
const MAX_ORDERS = 3;
const MAX_HEARTS = 3;

function makeOrder(id, level) {
  const dish = DISHES[Math.floor(Math.random() * DISHES.length)];
  const timeMax = Math.max(14, 30 - level * 2);
  return { id, dish, timeLeft: timeMax, timeMax };
}

function newGameState() {
  return {
    phase: 'playing',
    score: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    hearts: MAX_HEARTS,
    shiftTotal: SHIFT_SECONDS,
    shiftTimeLeft: SHIFT_SECONDS,
    orders: [],
    plate: [],
    message: null,
    muted: false,
    nextOrderId: 1,
    spawnIn: 1.5,
    lastTickSecond: -1,
  };
}

const GameState = newGameState();

function showMessage(text, color, ms) {
  GameState.message = { text, color: color || '#2e7d32', until: performance.now() + (ms || 1800) };
}

function spawnOrder() {
  if (GameState.orders.length >= MAX_ORDERS) return;
  GameState.orders.push(makeOrder(GameState.nextOrderId++, GameState.level));
}

function startShift() {
  const fresh = newGameState();
  Object.assign(GameState, fresh);
  // Two orders on the board from the first second, so the kitchen is busy at once.
  spawnOrder();
  spawnOrder();
  showMessage('Shift started! Serve the orders!', '#2e7d32', 2200);
}

function addIngredient(id) {
  if (GameState.phase !== 'playing') return;
  if (GameState.plate.length >= 6) {
    showMessage('Plate is full — serve or clear it', '#8f1d12');
    SoundBank.playWrong();
    return;
  }
  if (GameState.plate.includes(id)) {
    showMessage(ingredientById(id).name + ' is already on the plate', '#8f5a1d');
    return;
  }
  GameState.plate.push(id);
  SoundBank.playAdd();
}

function clearPlate() {
  if (GameState.plate.length === 0) return;
  GameState.plate = [];
  SoundBank.playRemove();
}

function loseHeart(reason) {
  GameState.hearts -= 1;
  GameState.combo = 0;
  SoundBank.playWrong();
  showMessage(reason, '#8f1d12', 2200);
  if (GameState.hearts <= 0) endShift();
}

function servePlate() {
  if (GameState.phase !== 'playing') return;
  if (GameState.plate.length === 0) {
    showMessage('Nothing on the plate yet!', '#8f5a1d');
    return;
  }
  const order = findMatchingOrder(GameState.plate, GameState.orders);
  if (!order) {
    GameState.plate = [];
    loseHeart('Wrong dish! The customer walks away.');
    return;
  }
  const timeBonus = Math.round(order.timeLeft) * 2;
  const comboBonus = GameState.combo * 10;
  const points = order.dish.price + timeBonus + comboBonus;
  GameState.score += points;
  GameState.served += 1;
  GameState.combo += 1;
  GameState.bestCombo = Math.max(GameState.bestCombo, GameState.combo);
  GameState.orders = GameState.orders.filter((o) => o.id !== order.id);
  GameState.plate = [];
  SoundBank.playServe();
  showMessage(
    order.dish.name + ' served! +' + points + (GameState.combo > 1 ? '  Combo x' + GameState.combo : ''),
    '#2e7d32',
  );
  const newLevel = Math.floor(GameState.served / 5) + 1;
  if (newLevel > GameState.level) {
    GameState.level = newLevel;
    showMessage('Level ' + newLevel + '! Orders come faster now.', '#2e7d32', 2400);
  }
}

function endShift() {
  GameState.phase = 'over';
  SoundBank.playGameOver();
}

function updateGame(dt) {
  if (GameState.phase !== 'playing') return;
  GameState.shiftTimeLeft -= dt;
  if (GameState.shiftTimeLeft <= 0) {
    GameState.shiftTimeLeft = 0;
    endShift();
    return;
  }
  // Spawn new orders on a timer that speeds up with the level.
  GameState.spawnIn -= dt;
  if (GameState.spawnIn <= 0) {
    spawnOrder();
    GameState.spawnIn = Math.max(3.5, 8 - GameState.level * 0.8);
  }
  // Tick each order down; an expired order costs a heart.
  for (let i = GameState.orders.length - 1; i >= 0; i--) {
    const order = GameState.orders[i];
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) {
      GameState.orders.splice(i, 1);
      loseHeart('Too slow! An order expired.');
      if (GameState.phase !== 'playing') return;
    }
  }
  // One tick sound in the last five seconds of any order.
  const wholeSecond = Math.ceil(GameState.shiftTimeLeft);
  if (wholeSecond !== GameState.lastTickSecond) {
    GameState.lastTickSecond = wholeSecond;
    if (GameState.orders.some((o) => o.timeLeft < 5)) SoundBank.playTick();
  }
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function handleCanvasClick(canvasX, canvasY) {
  if (GameState.phase === 'over') {
    startShift();
    return;
  }
  if (GameState.phase === 'paused') return;
  if (pointInRect(canvasX, canvasY, LAYOUT.serveButton)) {
    servePlate();
    return;
  }
  if (pointInRect(canvasX, canvasY, LAYOUT.clearButton)) {
    clearPlate();
    return;
  }
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (pointInRect(canvasX, canvasY, binRect(i))) {
      addIngredient(INGREDIENTS[i].id);
      return;
    }
  }
}

function handleKey(key) {
  const lower = key.toLowerCase();
  if (lower === 'p') {
    if (GameState.phase === 'playing') GameState.phase = 'paused';
    else if (GameState.phase === 'paused') GameState.phase = 'playing';
    return;
  }
  if (lower === 'm') {
    GameState.muted = SoundBank.toggleMute();
    return;
  }
  if (lower === 'r') {
    startShift();
    return;
  }
  if (GameState.phase !== 'playing') return;
  if (key === ' ' || lower === 'enter') {
    servePlate();
    return;
  }
  if (key === 'Backspace' || key === 'Delete') {
    clearPlate();
    return;
  }
  const ing = INGREDIENTS.find((item) => item.key === key);
  if (ing) addIngredient(ing.id);
}
