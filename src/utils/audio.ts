// Lightweight procedural Web Audio effects for tactile notebook & physics clicks

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Tactile pen / paper click
  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Pleasing success chime for download
  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.1, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  // Heavy tug on rope sound
  playPull(pullNumber: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Low thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = Math.max(90, 160 - pullNumber * 7);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
    gain.gain.setValueAtTime(0.12 + Math.min(0.08, pullNumber * 0.01), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.22);

    // Rope creak / friction noise
    const creak = ctx.createOscillator();
    const creakGain = ctx.createGain();
    creak.type = 'sine';
    creak.frequency.setValueAtTime(280 + pullNumber * 30, now + 0.03);
    creak.frequency.linearRampToValueAtTime(420 + pullNumber * 40, now + 0.12);
    creakGain.gain.setValueAtTime(0.04, now + 0.03);
    creakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    creak.connect(creakGain);
    creakGain.connect(ctx.destination);
    creak.start(now + 0.03);
    creak.stop(now + 0.16);
  }

  // Loop swirl / whoosh
  playWhoosh() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.36);
  }

  // Climax rope snap / vortex suction
  playSnap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Snap whip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(850, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.16);

    // Cosmic descending suction
    const swirl = ctx.createOscillator();
    const swirlGain = ctx.createGain();
    swirl.type = 'sine';
    swirl.frequency.setValueAtTime(650, now + 0.1);
    swirl.frequency.exponentialRampToValueAtTime(45, now + 0.9);
    swirlGain.gain.setValueAtTime(0.12, now + 0.1);
    swirlGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    swirl.connect(swirlGain);
    swirlGain.connect(ctx.destination);
    swirl.start(now + 0.1);
    swirl.stop(now + 0.95);
  }

  // Comic launch / jump whistle when figure gets yanked through the air
  playLaunch() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.55);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  // Comic scatter / shatter explosion when figure is pulled into the loop
  playScatter() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Pop / explosion noise burst
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'triangle' : 'sawtooth';
      const f = 200 + Math.random() * 600;
      osc.frequency.setValueAtTime(f, now + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(50, now + i * 0.04 + 0.12);
      gain.gain.setValueAtTime(0.15, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.15);
    }
  }
}

export const sounds = new SoundEffects();
