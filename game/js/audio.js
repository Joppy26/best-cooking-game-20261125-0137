// All sound is synthesized live with WebAudio: no audio files, no network.
// A short tone helper plus a filtered-noise burst for chopping and sizzling.

export class SoundBoard {
  constructor() {
    this.context = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.context = new AudioContextClass();
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  playTone(freq, seconds, type, volume, delay) {
    if (this.muted) return;
    const ctx = this.unlock();
    if (!ctx) return;
    const start = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume || 0.1, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  }

  playNoise(seconds, volume, filterFreq) {
    if (this.muted) return;
    const ctx = this.unlock();
    if (!ctx) return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / length);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1800;
    const gain = ctx.createGain();
    gain.gain.value = volume || 0.12;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  chop() {
    this.playNoise(0.09, 0.16, 2600);
    this.playTone(340, 0.07, 'triangle', 0.07);
  }

  grillOn() {
    this.playTone(220, 0.12, 'triangle', 0.08);
    this.playTone(330, 0.1, 'triangle', 0.06, 0.06);
  }

  grillDone() {
    this.playTone(660, 0.09, 'sine', 0.11);
    this.playTone(880, 0.12, 'sine', 0.11, 0.08);
  }

  serve(combo) {
    this.playTone(523, 0.1, 'sine', 0.12);
    this.playTone(659, 0.1, 'sine', 0.12, 0.09);
    this.playTone(784, 0.18, 'sine', 0.13, 0.18);
    if (combo >= 3) this.playTone(1046, 0.16, 'sine', 0.1, 0.27);
  }

  wrong() {
    this.playTone(170, 0.2, 'sawtooth', 0.06);
    this.playTone(130, 0.24, 'sawtooth', 0.06, 0.09);
  }

  expired() {
    this.playTone(196, 0.16, 'square', 0.05);
    this.playTone(147, 0.22, 'square', 0.05, 0.12);
  }

  tick() {
    this.playTone(920, 0.045, 'square', 0.035);
  }

  startShift() {
    this.playTone(392, 0.12, 'sine', 0.11);
    this.playTone(523, 0.12, 'sine', 0.11, 0.1);
    this.playTone(659, 0.2, 'sine', 0.12, 0.2);
  }

  endShift() {
    this.playTone(392, 0.2, 'sine', 0.11);
    this.playTone(330, 0.2, 'sine', 0.11, 0.18);
    this.playTone(262, 0.4, 'sine', 0.11, 0.36);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
