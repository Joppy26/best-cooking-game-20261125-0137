// main.js — boots Warung Rush: wires the canvas, input and the frame loop,
// and exposes the state for play-testing in the browser console.

(function bootWarungRush() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (event.clientY - rect.top) * (CANVAS_H / rect.height),
    };
  }

  canvas.addEventListener('click', (event) => {
    SoundBank.ensureContext();
    const point = canvasPoint(event);
    handleCanvasClick(point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') event.preventDefault();
    if (event.key === 'Backspace') event.preventDefault();
    SoundBank.ensureContext();
    handleKey(event.key);
  });

  startShift();

  let lastTime = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    updateGame(dt);
    drawKitchen(ctx, GameState);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Handy hooks for automated play-testing.
  window.WarungRush = { state: GameState, addIngredient, servePlate, clearPlate, startShift };
})();
