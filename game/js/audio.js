// audio.js — tiny synthesized sound effects with WebAudio. No audio files,
// no network: every sound is an oscillator envelope built at runtime.

const SoundBank = {
  ctx: null,
  muted: false,

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, dur, type, vol, when) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const start = ctx.currentTime + (when || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  },

  playAdd() {
    this.tone(520, 0.08, 'triangle', 0.10);
    this.tone(780, 0.07, 'triangle', 0.07, 0.05);
  },

  playRemove() {
    this.tone(300, 0.08, 'triangle', 0.08);
  },

  playServe() {
    this.tone(523, 0.10, 'sine', 0.12);
    this.tone(659, 0.10, 'sine', 0.12, 0.09);
    this.tone(784, 0.16, 'sine', 0.14, 0.18);
  },

  playWrong() {
    this.tone(180, 0.22, 'sawtooth', 0.07);
    this.tone(140, 0.25, 'sawtooth', 0.07, 0.08);
  },

  playTick() {
    this.tone(880, 0.05, 'square', 0.04);
  },

  playGameOver() {
    this.tone(392, 0.18, 'sine', 0.12);
    this.tone(330, 0.18, 'sine', 0.12, 0.16);
    this.tone(262, 0.34, 'sine', 0.12, 0.32);
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },
};
