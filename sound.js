export class SoundSystem {
  constructor() { this.ctx = null; this.enabled = true; this.initialized = false; }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) { this.enabled = false; }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  play(freq, dur, type, vol) {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      g.gain.setValueAtTime(vol || 0.2, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }

  bumper() {
    const variants = [
      this._bmPop, this._bmThwack, this._bmBuzz,
      this._bmRicochet, this._bmKick
    ];
    variants[Math.floor(Math.random() * variants.length)].call(this);
  }

  // Bumper 1 — Classic pop (original with overtone)
  _bmPop() {
    const f = 500 + Math.random() * 400;
    this.play(f, 0.1, 'square', 0.12);
    this.play(f * 1.5, 0.06, 'sine', 0.05);
  }

  // Bumper 2 — Punchy thwack (quick sine drop + click)
  _bmThwack() {
    this.play(1400, 0.02, 'square', 0.1);
    this.play(300 + Math.random() * 200, 0.1, 'sine', 0.14);
  }

  // Bumper 3 — Electric buzz (short sawtooth burst)
  _bmBuzz() {
    const f = 400 + Math.random() * 300;
    this.play(f, 0.08, 'sawtooth', 0.08);
    this.play(f * 2.02, 0.06, 'sawtooth', 0.03);
  }

  // Bumper 4 — Ricochet ping (high sine + bounce)
  _bmRicochet() {
    const f = 800 + Math.random() * 600;
    this.play(f, 0.05, 'sine', 0.14);
    setTimeout(() => this.play(f * 0.7, 0.08, 'sine', 0.08), 40);
  }

  // Bumper 5 — Rubber kick (low triangle thump)
  _bmKick() {
    this.play(200 + Math.random() * 150, 0.08, 'triangle', 0.16);
    this.play(800 + Math.random() * 400, 0.04, 'square', 0.06);
  }

  target() {
    const variants = [
      this._tgBell, this._tgChirp, this._tgBlip,
      this._tgChime, this._tgPlink
    ];
    variants[Math.floor(Math.random() * variants.length)].call(this);
  }

  // Target 1 — Bell ding
  _tgBell() {
    this.play(880, 0.15, 'sine', 0.18);
    this.play(1760, 0.1, 'sine', 0.06);
  }

  // Target 2 — Quick chirp (rising two-tone)
  _tgChirp() {
    this.play(660, 0.06, 'sine', 0.16);
    setTimeout(() => this.play(990, 0.12, 'sine', 0.14), 50);
  }

  // Target 3 — Digital blip (square + sine)
  _tgBlip() {
    const f = 700 + Math.random() * 400;
    this.play(f, 0.08, 'square', 0.08);
    this.play(f * 2, 0.1, 'sine', 0.1);
  }

  // Target 4 — Glass chime (high shimmer)
  _tgChime() {
    this.play(1200, 0.12, 'sine', 0.14);
    this.play(1810, 0.1, 'sine', 0.06);
    setTimeout(() => this.play(2400, 0.08, 'sine', 0.04), 40);
  }

  // Target 5 — Woody plink (triangle thunk + tone)
  _tgPlink() {
    this.play(440, 0.04, 'triangle', 0.14);
    setTimeout(() => this.play(880, 0.12, 'sine', 0.12), 30);
  }

  flipper() { this.play(180, 0.04, 'square', 0.06); }

  launch() {
    const variants = [
      this._laPlasma, this._laPhoton, this._laZap,
      this._laRetro, this._laSteam
    ];
    const fn = variants[Math.floor(Math.random() * variants.length)];
    fn.call(this);
  }

  // Launch 1 — Plasma burst (sci-fi sweep + bass thump)
  _laPlasma() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'sawtooth';
      o1.frequency.setValueAtTime(60, t);
      o1.frequency.exponentialRampToValueAtTime(800, t + 0.18);
      g1.gain.setValueAtTime(0.12, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.25);
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'square';
      o2.frequency.setValueAtTime(200, t + 0.08);
      o2.frequency.exponentialRampToValueAtTime(2400, t + 0.2);
      g2.gain.setValueAtTime(0.06, t + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t + 0.08); o2.stop(t + 0.28);
      const o3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
      o3.type = 'sine';
      o3.frequency.setValueAtTime(1800, t + 0.15);
      o3.frequency.exponentialRampToValueAtTime(3200, t + 0.22);
      o3.frequency.exponentialRampToValueAtTime(600, t + 0.4);
      g3.gain.setValueAtTime(0.001, t + 0.15);
      g3.gain.linearRampToValueAtTime(0.1, t + 0.18);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o3.connect(g3); g3.connect(this.ctx.destination);
      o3.start(t + 0.15); o3.stop(t + 0.4);
      const o4 = this.ctx.createOscillator(), g4 = this.ctx.createGain();
      o4.type = 'sine';
      o4.frequency.setValueAtTime(80, t + 0.05);
      o4.frequency.exponentialRampToValueAtTime(30, t + 0.2);
      g4.gain.setValueAtTime(0.18, t + 0.05);
      g4.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o4.connect(g4); g4.connect(this.ctx.destination);
      o4.start(t + 0.05); o4.stop(t + 0.25);
    } catch (e) {}
  }

  // Launch 2 — Photon torpedo (rising hum then bright ping)
  _laPhoton() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      // Deep hum build-up
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'triangle';
      o1.frequency.setValueAtTime(50, t);
      o1.frequency.exponentialRampToValueAtTime(300, t + 0.2);
      g1.gain.setValueAtTime(0.15, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.3);
      // Bright ping release
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(1400, t + 0.12);
      o2.frequency.exponentialRampToValueAtTime(2800, t + 0.18);
      o2.frequency.exponentialRampToValueAtTime(1000, t + 0.35);
      g2.gain.setValueAtTime(0.001, t + 0.12);
      g2.gain.linearRampToValueAtTime(0.16, t + 0.15);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t + 0.12); o2.stop(t + 0.38);
      // Harmonic shimmer
      const o3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
      o3.type = 'sine';
      o3.frequency.setValueAtTime(2810, t + 0.12);
      o3.frequency.exponentialRampToValueAtTime(5600, t + 0.18);
      o3.frequency.exponentialRampToValueAtTime(2000, t + 0.35);
      g3.gain.setValueAtTime(0.001, t + 0.12);
      g3.gain.linearRampToValueAtTime(0.05, t + 0.15);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o3.connect(g3); g3.connect(this.ctx.destination);
      o3.start(t + 0.12); o3.stop(t + 0.35);
    } catch (e) {}
  }

  // Launch 3 — Electric zap (crackling burst)
  _laZap() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      // Main zap — fast sawtooth sweep up
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'sawtooth';
      o1.frequency.setValueAtTime(150, t);
      o1.frequency.exponentialRampToValueAtTime(4000, t + 0.08);
      o1.frequency.exponentialRampToValueAtTime(500, t + 0.2);
      g1.gain.setValueAtTime(0.1, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.22);
      // Crackle pops — rapid square bursts
      [0, 0.03, 0.07, 0.1, 0.15].forEach(d => {
        const f = 1500 + Math.random() * 3000;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(f, t + d);
        g.gain.setValueAtTime(0.05, t + d);
        g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.02);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t + d); o.stop(t + d + 0.025);
      });
      // Bass punch
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(100, t);
      o2.frequency.exponentialRampToValueAtTime(35, t + 0.15);
      g2.gain.setValueAtTime(0.18, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t); o2.stop(t + 0.2);
    } catch (e) {}
  }

  // Launch 4 — Retro arcade whoosh (8-bit ascending)
  _laRetro() {
    [150, 300, 600, 1200, 2400].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.06, 'square', 0.1), i * 30);
    });
    setTimeout(() => this.play(3200, 0.12, 'sine', 0.08), 160);
    setTimeout(() => this.play(80, 0.08, 'triangle', 0.12), 0);
  }

  // Launch 5 — Steam cannon (pressure release + whoosh)
  _laSteam() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      // Pressure build — low rumble
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'triangle';
      o1.frequency.setValueAtTime(40, t);
      o1.frequency.linearRampToValueAtTime(120, t + 0.12);
      g1.gain.setValueAtTime(0.14, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.2);
      // Steam hiss — high noise-like burst
      [3000, 4500, 2200, 3800, 5000].forEach((f, i) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, t + 0.08);
        o.frequency.exponentialRampToValueAtTime(f * 0.3, t + 0.3);
        g.gain.setValueAtTime(0.02, t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t + 0.08 + i * 0.01); o.stop(t + 0.3);
      });
      // Thunk release
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(200, t + 0.06);
      o2.frequency.exponentialRampToValueAtTime(50, t + 0.18);
      g2.gain.setValueAtTime(0.2, t + 0.06);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t + 0.06); o2.stop(t + 0.22);
    } catch (e) {}
  }

  chargeTick(power) {
    // Sci-fi charge whine
    this.play(80 + power * 1200, 0.04, 'square', 0.03);
    if (power > 0.5) this.play(60 + power * 600, 0.03, 'sawtooth', 0.02);
  }

  ballLost() {
    const variants = [
      this._blWaterPlop, this._blToiletFlush, this._blSadTrombone,
      this._blSlideWhistle, this._blBoing
    ];
    const fn = variants[Math.floor(Math.random() * variants.length)];
    fn.call(this);
  }

  // Variant 1 — Water plop with bubbles
  _blWaterPlop() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      // Descending plop
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(350, t);
      o1.frequency.exponentialRampToValueAtTime(55, t + 0.18);
      g1.gain.setValueAtTime(0.25, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.35);
      // Bubble 1
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(80, t + 0.12);
      o2.frequency.exponentialRampToValueAtTime(130, t + 0.22);
      o2.frequency.exponentialRampToValueAtTime(55, t + 0.4);
      g2.gain.setValueAtTime(0.001, t);
      g2.gain.linearRampToValueAtTime(0.15, t + 0.14);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t + 0.1); o2.stop(t + 0.45);
      // Bubble 2
      const o3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
      o3.type = 'sine';
      o3.frequency.setValueAtTime(100, t + 0.25);
      o3.frequency.exponentialRampToValueAtTime(160, t + 0.33);
      o3.frequency.exponentialRampToValueAtTime(65, t + 0.5);
      g3.gain.setValueAtTime(0.001, t);
      g3.gain.linearRampToValueAtTime(0.1, t + 0.28);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o3.connect(g3); g3.connect(this.ctx.destination);
      o3.start(t + 0.22); o3.stop(t + 0.55);
      // Splash burst
      [1200, 1800, 900, 1500].forEach((f, i) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t + i * 0.015); o.stop(t + 0.08 + i * 0.015);
      });
    } catch (e) {}
  }

  // Variant 2 — Toilet flush (swirling descend + water noise)
  _blToiletFlush() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      // Flush handle click
      this.play(1800, 0.03, 'square', 0.1);
      // Swirling water — descending with wobble via two detuned oscillators
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'sawtooth';
      o1.frequency.setValueAtTime(400, t + 0.05);
      o1.frequency.exponentialRampToValueAtTime(120, t + 0.5);
      o1.frequency.exponentialRampToValueAtTime(40, t + 0.9);
      g1.gain.setValueAtTime(0.08, t + 0.05);
      g1.gain.setValueAtTime(0.1, t + 0.2);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t + 0.05); o1.stop(t + 0.95);
      // Swirl wobble (slightly detuned)
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'sawtooth';
      o2.frequency.setValueAtTime(408, t + 0.05);
      o2.frequency.exponentialRampToValueAtTime(125, t + 0.5);
      o2.frequency.exponentialRampToValueAtTime(42, t + 0.9);
      g2.gain.setValueAtTime(0.06, t + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t + 0.05); o2.stop(t + 0.95);
      // Low rumble drain
      const o3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
      o3.type = 'triangle';
      o3.frequency.setValueAtTime(60, t + 0.3);
      o3.frequency.exponentialRampToValueAtTime(25, t + 1.0);
      g3.gain.setValueAtTime(0.001, t + 0.3);
      g3.gain.linearRampToValueAtTime(0.12, t + 0.5);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      o3.connect(g3); g3.connect(this.ctx.destination);
      o3.start(t + 0.3); o3.stop(t + 1.1);
      // Water splashes
      [0.1, 0.25, 0.4, 0.55, 0.65].forEach(d => {
        const f = 800 + Math.random() * 1200;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, t + d);
        g.gain.setValueAtTime(0.03, t + d);
        g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.05);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t + d); o.stop(t + d + 0.06);
      });
    } catch (e) {}
  }

  // Variant 3 — Sad trombone (wah-wah-wah-waaah)
  _blSadTrombone() {
    const notes = [
      { f: 311, d: 0.22, t: 0 },
      { f: 293, d: 0.22, t: 0.25 },
      { f: 277, d: 0.22, t: 0.50 },
      { f: 233, d: 0.55, t: 0.75 }
    ];
    notes.forEach(n => {
      setTimeout(() => {
        this.play(n.f, n.d, 'sawtooth', 0.1);
        this.play(n.f * 2, n.d, 'sine', 0.04);
      }, n.t * 1000);
    });
  }

  // Variant 4 — Slide whistle going down
  _blSlideWhistle() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(2000, t);
      o1.frequency.exponentialRampToValueAtTime(100, t + 0.6);
      g1.gain.setValueAtTime(0.18, t);
      g1.gain.setValueAtTime(0.18, t + 0.4);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.65);
      // Breathy overtone
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(2010, t);
      o2.frequency.exponentialRampToValueAtTime(105, t + 0.6);
      g2.gain.setValueAtTime(0.06, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t); o2.stop(t + 0.6);
      // Thud at the end
      setTimeout(() => this.play(60, 0.1, 'sine', 0.15), 580);
    } catch (e) {}
  }

  // Variant 5 — Cartoon boing spring
  _blBoing() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      // Springy oscillation — frequency wobbles up and down
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(600, t);
      o1.frequency.linearRampToValueAtTime(200, t + 0.08);
      o1.frequency.linearRampToValueAtTime(500, t + 0.16);
      o1.frequency.linearRampToValueAtTime(150, t + 0.28);
      o1.frequency.linearRampToValueAtTime(350, t + 0.36);
      o1.frequency.linearRampToValueAtTime(100, t + 0.5);
      g1.gain.setValueAtTime(0.2, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.55);
      // Metallic overtone
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'square';
      o2.frequency.setValueAtTime(1200, t);
      o2.frequency.linearRampToValueAtTime(400, t + 0.08);
      o2.frequency.linearRampToValueAtTime(1000, t + 0.16);
      o2.frequency.linearRampToValueAtTime(300, t + 0.28);
      o2.frequency.linearRampToValueAtTime(600, t + 0.4);
      g2.gain.setValueAtTime(0.04, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t); o2.stop(t + 0.45);
    } catch (e) {}
  }

  levelUp(level) {
    const fn = this['_lvl' + (level || 1)];
    if (fn) fn.call(this);
    else this._lvl1();
  }

  // 1 — Simple rising arpeggio (C major)
  _lvl1() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.2, 'sine', 0.18), i * 140));
  }

  // 2 — Triumphant fanfare with chord finish
  _lvl2() {
    [523, 659, 784].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'sine', 0.16), i * 80));
    setTimeout(() => { this.play(1047, 0.4, 'sine', 0.2); this.play(784, 0.4, 'sine', 0.12); this.play(1319, 0.35, 'sine', 0.1); }, 320);
    setTimeout(() => { this.play(1568, 0.3, 'sine', 0.08); this.play(1047, 0.5, 'sine', 0.14); }, 550);
    setTimeout(() => this.play(2093, 0.15, 'sine', 0.06), 750);
  }

  // 3 — Bouncy pentatonic (G major penta)
  _lvl3() {
    [392, 440, 523, 587, 659, 784].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'triangle', 0.16), i * 90));
    setTimeout(() => this.play(784, 0.4, 'sine', 0.18), 600);
  }

  // 4 — Power-up chime (quick double octave)
  _lvl4() {
    [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.1, 'sine', 0.14), i * 60));
    setTimeout(() => { this.play(1047, 0.5, 'sine', 0.18); this.play(523, 0.5, 'sine', 0.1); }, 480);
  }

  // 5 — Funky square wave groove (D minor → major resolve)
  _lvl5() {
    [294, 349, 440, 349, 294, 370, 440, 587].forEach((f, i) => setTimeout(() => this.play(f, 0.12, 'square', 0.1), i * 75));
    setTimeout(() => this.play(587, 0.4, 'sine', 0.18), 650);
  }

  // 6 — Heroic fifth leap (C→G repeated, then high C)
  _lvl6() {
    [262, 392, 330, 523].forEach((f, i) => setTimeout(() => this.play(f, 0.18, 'sine', 0.16), i * 130));
    setTimeout(() => { this.play(784, 0.35, 'sine', 0.2); this.play(523, 0.35, 'sine', 0.12); }, 580);
    setTimeout(() => this.play(1047, 0.4, 'sine', 0.15), 780);
  }

  // 7 — Retro coin collect (8-bit style)
  _lvl7() {
    [988, 1319].forEach((f, i) => setTimeout(() => this.play(f, 0.12, 'square', 0.12), i * 80));
    setTimeout(() => { this.play(1568, 0.3, 'square', 0.1); this.play(784, 0.3, 'sine', 0.1); }, 200);
    setTimeout(() => this.play(2093, 0.2, 'sine', 0.08), 400);
  }

  // 8 — Mysterious shimmer (whole tone scale)
  _lvl8() {
    [523, 587, 659, 740, 831, 932, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.2, 'sine', 0.13), i * 80));
    setTimeout(() => { this.play(1047, 0.5, 'sine', 0.18); this.play(659, 0.5, 'sine', 0.1); }, 620);
  }

  // 9 — Rapid fire burst then big resolve
  _lvl9() {
    [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.08, 'sawtooth', 0.08), i * 45));
    setTimeout(() => { this.play(1047, 0.5, 'sine', 0.2); this.play(784, 0.5, 'sine', 0.14); this.play(1319, 0.4, 'sine', 0.1); }, 420);
  }

  // 10 — Halfway milestone! Double fanfare
  _lvl10() {
    [392, 523, 659, 784].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'sine', 0.16), i * 100));
    setTimeout(() => { this.play(523, 0.12, 'sine', 0.14); this.play(659, 0.12, 'sine', 0.14); }, 500);
    setTimeout(() => { this.play(784, 0.15, 'sine', 0.16); this.play(988, 0.15, 'sine', 0.16); }, 620);
    setTimeout(() => { this.play(1047, 0.6, 'sine', 0.2); this.play(784, 0.6, 'sine', 0.14); this.play(1319, 0.5, 'sine', 0.1); }, 750);
    setTimeout(() => this.play(1568, 0.3, 'sine', 0.08), 950);
  }

  // 11 — Electric buzz ramp (sawtooth power)
  _lvl11() {
    [220, 330, 440, 550, 660, 880].forEach((f, i) => setTimeout(() => this.play(f, 0.12, 'sawtooth', 0.09), i * 70));
    setTimeout(() => { this.play(880, 0.4, 'sine', 0.2); this.play(1100, 0.35, 'sine', 0.12); }, 480);
    setTimeout(() => this.play(1760, 0.2, 'sine', 0.08), 680);
  }

  // 12 — Jazz lick (chromatic run into major)
  _lvl12() {
    [440, 466, 494, 523, 554, 587, 622, 659].forEach((f, i) => setTimeout(() => this.play(f, 0.1, 'triangle', 0.12), i * 55));
    setTimeout(() => { this.play(880, 0.4, 'sine', 0.18); this.play(1109, 0.4, 'sine', 0.12); }, 500);
    setTimeout(() => this.play(1319, 0.3, 'sine', 0.1), 680);
  }

  // 13 — Military march (dotted rhythm)
  _lvl13() {
    const notes = [[392, 0], [392, 180], [523, 300], [659, 420], [659, 500], [784, 620]];
    notes.forEach(([f, t]) => setTimeout(() => this.play(f, 0.15, 'square', 0.1), t));
    setTimeout(() => { this.play(1047, 0.5, 'sine', 0.2); this.play(659, 0.5, 'sine', 0.12); }, 780);
  }

  // 14 — Descend then soar (valley shape)
  _lvl14() {
    [784, 659, 523, 440, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'sine', 0.14), i * 90));
    setTimeout(() => { this.play(1047, 0.5, 'sine', 0.2); this.play(1319, 0.4, 'sine', 0.12); }, 800);
  }

  // 15 — Three-quarter mark! Majestic brass feel
  _lvl15() {
    [262, 330, 392].forEach((f, i) => setTimeout(() => this.play(f, 0.2, 'sawtooth', 0.08), i * 120));
    setTimeout(() => { this.play(523, 0.3, 'sawtooth', 0.1); this.play(392, 0.3, 'sine', 0.12); }, 420);
    setTimeout(() => { this.play(659, 0.2, 'sine', 0.16); this.play(784, 0.2, 'sine', 0.16); }, 600);
    setTimeout(() => { this.play(1047, 0.6, 'sine', 0.22); this.play(784, 0.6, 'sine', 0.14); this.play(523, 0.6, 'sine', 0.1); }, 780);
    setTimeout(() => this.play(1568, 0.25, 'sine', 0.08), 1000);
  }

  // 16 — Robot beep sequence (tech feel)
  _lvl16() {
    [880, 1047, 880, 1319, 880, 1568].forEach((f, i) => setTimeout(() => this.play(f, 0.08, 'square', 0.1), i * 70));
    setTimeout(() => this.play(1047, 0.12, 'square', 0.08), 480);
    setTimeout(() => { this.play(1568, 0.4, 'sine', 0.18); this.play(1047, 0.4, 'sine', 0.12); }, 560);
    setTimeout(() => this.play(2093, 0.2, 'sine', 0.08), 760);
  }

  // 17 — Dragon fire! Dramatic minor then major resolve
  _lvl17() {
    [330, 392, 466, 523, 622, 659].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'sawtooth', 0.09), i * 85));
    setTimeout(() => this.play(784, 0.15, 'sine', 0.16), 560);
    setTimeout(() => { this.play(988, 0.5, 'sine', 0.2); this.play(659, 0.5, 'sine', 0.14); this.play(1319, 0.4, 'sine', 0.1); }, 680);
    setTimeout(() => this.play(1976, 0.2, 'sine', 0.08), 900);
  }

  // 18 — Warp speed (accelerating notes)
  _lvl18() {
    const delays = [0, 120, 220, 300, 360, 400, 430, 450];
    [262, 330, 392, 523, 659, 784, 988, 1319].forEach((f, i) => setTimeout(() => this.play(f, 0.12, 'sine', 0.14), delays[i]));
    setTimeout(() => { this.play(1568, 0.5, 'sine', 0.2); this.play(1047, 0.5, 'sine', 0.14); }, 520);
    setTimeout(() => { this.play(2093, 0.3, 'sine', 0.1); this.play(1568, 0.3, 'sine', 0.08); }, 720);
  }

  // 19 — Trophy chase! Intense staccato then glory
  _lvl19() {
    [523, 659, 523, 784, 523, 988, 523, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.06, 'square', 0.1), i * 55));
    setTimeout(() => { this.play(1319, 0.15, 'sine', 0.16); this.play(988, 0.15, 'sine', 0.12); }, 480);
    setTimeout(() => { this.play(1568, 0.5, 'sine', 0.22); this.play(1047, 0.5, 'sine', 0.16); this.play(1319, 0.5, 'sine', 0.12); }, 600);
    setTimeout(() => { this.play(2093, 0.3, 'sine', 0.1); this.play(1568, 0.3, 'sine', 0.08); }, 850);
    setTimeout(() => this.play(2637, 0.2, 'sine', 0.06), 1000);
  }

  // 20 — FINAL BOSS defeated! Epic full orchestral fanfare
  _lvl20() {
    // Timpani roll
    [131, 131, 131, 131].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'triangle', 0.12), i * 60));
    // Brass ascent
    [262, 330, 392, 523].forEach((f, i) => setTimeout(() => this.play(f, 0.2, 'sawtooth', 0.08), 280 + i * 100));
    // First chord hit
    setTimeout(() => { this.play(659, 0.3, 'sine', 0.18); this.play(523, 0.3, 'sine', 0.14); this.play(784, 0.3, 'sine', 0.14); }, 720);
    // Second higher chord
    setTimeout(() => { this.play(784, 0.3, 'sine', 0.18); this.play(659, 0.3, 'sine', 0.14); this.play(988, 0.3, 'sine', 0.14); }, 900);
    // Grand finale chord
    setTimeout(() => {
      this.play(1047, 0.7, 'sine', 0.22); this.play(784, 0.7, 'sine', 0.16);
      this.play(1319, 0.6, 'sine', 0.14); this.play(523, 0.7, 'sine', 0.1);
    }, 1080);
    // Sparkle cascade
    setTimeout(() => this.play(1568, 0.3, 'sine', 0.1), 1350);
    setTimeout(() => this.play(2093, 0.25, 'sine', 0.08), 1500);
    setTimeout(() => this.play(2637, 0.2, 'sine', 0.06), 1620);
  }

  gameOverSnd() {
    [400, 300, 200, 100].forEach((f, i) => setTimeout(() => this.play(f, 0.3, 'sine', 0.15), i * 200));
  }

  victory() {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.2, 'sine', 0.2), i * 150));
  }

  reset() {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    try {
      // Quick descending sweep — teleport whoosh
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(800, t);
      o1.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      g1.gain.setValueAtTime(0.15, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o1.connect(g1); g1.connect(this.ctx.destination);
      o1.start(t); o1.stop(t + 0.2);
      // Soft thud at end
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(100, t + 0.05);
      o2.frequency.exponentialRampToValueAtTime(50, t + 0.15);
      g2.gain.setValueAtTime(0.12, t + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(t + 0.05); o2.stop(t + 0.2);
      // High sparkle accent
      const o3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
      o3.type = 'sine';
      o3.frequency.setValueAtTime(2000, t);
      o3.frequency.exponentialRampToValueAtTime(600, t + 0.12);
      g3.gain.setValueAtTime(0.06, t);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o3.connect(g3); g3.connect(this.ctx.destination);
      o3.start(t); o3.stop(t + 0.15);
    } catch (e) {}
  }

  wall() { this.play(120, 0.04, 'triangle', 0.04); }
  score() { this.play(1200, 0.08, 'sine', 0.1); }

  combo(multiplier) {
    const vol = Math.min(0.06 + multiplier * 0.03, 0.2);
    // Rising chime — more notes for higher combos
    const notes = [660, 880, 1100];
    if (multiplier >= 3) notes.push(1320);
    if (multiplier >= 4) notes.push(1540);
    if (multiplier >= 5) notes.push(1760);
    notes.forEach((f, i) => setTimeout(() => this.play(f, 0.1, 'sine', vol), i * 45));
    // Sparkle finish
    setTimeout(() => this.play(notes[notes.length - 1] * 1.5, 0.15, 'sine', vol * 0.5), notes.length * 45);
  }
}
