import { TW, TH, BALL_R, FLIPPER_LEN, FLIPPER_W, TOTAL_LEVELS, S, scoreForLevel } from './constants.js';
import { SoundSystem } from './sound.js';
import { ParticleSystem, LightSystem } from './effects.js';
import { LEVELS } from './levels.js';
import { Renderer } from './renderer/index.js';

const { Engine, Bodies, Body, Events, Composite } = Matter;

// Fix: Matter.js v0.19.0 ignores restitution/friction on static bodies.
// Patch Bodies factories to re-apply these opts after creation.
(() => {
  const _patch = (body, opts) => {
    if (body && opts) {
      if (opts.restitution !== undefined) body.restitution = opts.restitution;
      if (opts.friction !== undefined) body.friction = opts.friction;
    }
    return body;
  };
  const _rect = Bodies.rectangle, _circ = Bodies.circle, _poly = Bodies.polygon, _verts = Bodies.fromVertices;
  Bodies.rectangle = (...a) => _patch(_rect(...a), a[4]);
  Bodies.circle = (...a) => _patch(_circ(...a), a[3]);
  Bodies.polygon = (...a) => _patch(_poly(...a), a[4]);
  Bodies.fromVertices = (...a) => _patch(_verts(...a), a[3]);
})();

export class PinballGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundSystem();
    this.particles = new ParticleSystem();
    this.lights = new LightSystem();
    this.renderer = new Renderer(this);

    this.state = 'MENU';
    this.level = 1;
    this.levelScore = 0;
    this.totalScore = 0;
    this.ballLaunched = false;
    this.launchPower = 0;
    this.launchCharging = false;

    this.leftActive = false;
    this.rightActive = false;
    this.spaceDown = false;

    this.engine = null;
    this.leftFlipper = null;
    this.rightFlipper = null;
    this.ball = null;
    this.bumperBodies = [];
    this.targetBodies = [];
    this.wallBodies = [];
    this.tunnelBodies = [];

    this.bgStars = [];
    for (let i = 0; i < 60; i++) {
      this.bgStars.push({
        x: Math.random() * TW, y: Math.random() * TH,
        r: 0.5 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.bgTraces = [];
    this.ballTrail = []; // [{x, y, age}] for colorful trail
    this.sharedScore = 0;
    this.sharedLevel = 0;
    this.animTime = 0;
    this.screenShake = 0;
    this.scorePopups = [];
    this.touchIds = {};
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this._fpsHistory = [];        // recent frame times for FPS detection
    this._fpsLowCount = 0;        // consecutive low-FPS frames
    this._renderFrame = 0;        // frame counter for throttling
    this.isFirefox = /Firefox/i.test(navigator.userAgent);
    this.lowPerf = this.isMobile && this.isFirefox; // initial guess, auto-detected at runtime
    this.scale = 1;
    this.renderScale = 1;
    this._lastChargeTick = 0;
    this.wallFrictionContacts = []; // active ball-wall contacts for visual sparks
    this.slingshotHitTime = { left: 0, right: 0 }; // flash timing for slingshot lines
    this.wallHitFlashes = []; // [{x, y, time}] for wall contact flashes
    this.resetButtonHover = false; // true when mouse hovers over reset button
    this.resetFlashTime = 0;      // Date.now() when reset was last triggered
    this.debugBodies = false;     // show physics body outlines (Ctrl+H)
    this.comboCount = 0;       // consecutive hits
    this.comboTimer = 0;       // time of last hit (ms)
    this.comboWindow = 1500;   // ms window to keep combo alive
    this.comboMultiplier = 1;  // current score multiplier
    this.recentTargets = [];   // [{body, time}] for multi-target bonus
    this.multiTargetWindow = 3000; // ms window for multi-target bonus

    // Load saved progress from localStorage
    this._savedProgress = this._loadProgress();
  }

  _saveProgress() {
    try {
      localStorage.setItem('pixelPinball', JSON.stringify({
        level: this.level,
        totalScore: this.totalScore,
        levelScore: this.levelScore
      }));
    } catch (e) { /* ignore quota errors */ }
  }

  _loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem('pixelPinball'));
      if (data && data.level > 1 && data.level <= TOTAL_LEVELS) {
        return { level: data.level, totalScore: data.totalScore || 0, levelScore: data.levelScore || 0 };
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  _clearProgress() {
    try { localStorage.removeItem('pixelPinball'); } catch (e) { /* ignore */ }
    this._savedProgress = null;
  }

  updateScore(pts) {
    this.levelScore += pts;
    this.totalScore += pts;
    this._saveProgress();
  }

  getLevelCfg() {
    const idx = Math.min(this.level - 1, TOTAL_LEVELS - 1);
    return LEVELS[idx] || LEVELS[TOTAL_LEVELS - 1];
  }

  // ==================== INIT ====================
  start() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => this.resize());
    this.setupInput();
    this.checkShareLink();
    document.getElementById('loading').style.display = 'none';
    this.gameLoop(0);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.lowPerf ? 1 : 2);
    const vv = window.visualViewport;
    const container = document.getElementById('gameContainer');
    const maxW = vv ? vv.width : container.clientWidth;
    const maxH = Math.min(
      vv ? vv.height : Infinity,
      window.innerHeight,
      container.clientHeight
    );
    // Uniform scaling — fit entire game, no cropping
    this.scale = Math.min(maxW / TW, maxH / TH);
    this.scaleX = this.scale;
    this.scaleY = this.scale;
    this.offsetX = 0;
    const dw = Math.floor(TW * this.scale);
    const dh = Math.floor(TH * this.scale);
    this.canvas.width = dw * dpr;
    this.canvas.height = dh * dpr;
    this.canvas.style.width = dw + 'px';
    this.canvas.style.height = dh + 'px';
    this.renderScaleX = this.scale * dpr;
    this.renderScaleY = this.scale * dpr;
    this.renderScale = this.renderScaleX;
  }

  // ==================== PHYSICS ====================
  initPhysics() {
    this.engine = Engine.create({
      gravity: { x: 0, y: 0.18, scale: 0.001 },
      positionIterations: 20,
      velocityIterations: 20,
      constraintIterations: 6
    });
    this.createTableWalls();
    this.createFlippers();
    this.setupCollisions();
  }

  createTableWalls() {
    const o = { isStatic: true, restitution: 0.8, friction: 0.005, label: 'wall' };
    const w = [];

    // Top wall (bottom edge aligned with visual at 16*S) — frictionless for smooth arc-to-play transition
    w.push(Bodies.rectangle(170 * S, 16 * S - 15, 320 * S, 30, { ...o, friction: 0.0 }));
    // Left wall — single section from top wall junction downward
    const lwTop = 16 * S + 5;  // start just below top wall, no gap
    const lwH = TH - lwTop;
    w.push(Bodies.rectangle(16 * S - 15, lwTop + lwH / 2, 30, lwH, o));
    // Right wall (starts where the arc curve ends)
    const rwTop = 78 * S;
    const rwH = TH - rwTop;
    w.push(Bodies.rectangle(TW - 2, rwTop + rwH / 2, 30, rwH, o));

    // Right playfield wall / launch lane inner wall
    // Left edge aligned with visual at 383*S; thinner to keep launch lane width
    w.push(Bodies.rectangle(386 * S, 427.5 * S, 6 * S, 665 * S, o));


    // Right upper corner arc boundary — chain of rotated rectangles along bezier curve
    // Skip first 2 segments to avoid overlap with right wall (prevents ball pinch)
    const arcP0x = TW - 6, arcP0y = 100 * S + 5;
    const arcP1x = TW - 6, arcP1y = 16 * S - 7;
    const arcP2x = 258 * S + 6, arcP2y = 16 * S - 5;
    const arcThick = 8 * S;
    const arcSegs = 12;
    const arcPts = [];
    for (let i = 0; i <= arcSegs; i++) {
      const t = i / arcSegs, mt = 1 - t;
      arcPts.push({
        x: mt*mt*arcP0x + 2*mt*t*arcP1x + t*t*arcP2x,
        y: mt*mt*arcP0y + 2*mt*t*arcP1y + t*t*arcP2y
      });
    }
    // Create rotated rectangles along curve, skip first 2 (overlap with right wall)
    for (let i = 2; i < arcSegs; i++) {
      const p0 = arcPts[i], p1 = arcPts[i + 1];
      const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
      const dx = p1.x - p0.x, dy = p1.y - p0.y;
      const segLen = Math.sqrt(dx*dx + dy*dy) + 2; // +2 overlap to prevent gaps
      const angle = Math.atan2(dy, dx);
      w.push(Bodies.rectangle(mx, my, segLen, arcThick,
        { ...o, friction: 0.0, angle, label: 'arc' }
      ));
    }

    // Slingshot / dead zone — single solid quad per side, labeled 'slingshot' for
    // bounce detection. Top edge IS the visual slingshot slope line.
    // Use _polyCentroid to ensure body placement matches vertex coordinates exactly.
    const leftSlingVerts = [
      { x: 16 * S, y: 560 * S },   // slope top (wall junction)
      { x: 98 * S + 5, y: 700 * S - 10 },   // slope bottom end
      { x: 98 * S + 5, y: 757 * S },   // bottom-right (floor)
      { x: 16 * S, y: 757 * S }    // bottom-left (wall/floor)
    ];
    const lc = this._polyCentroid(leftSlingVerts);
    w.push(Bodies.fromVertices(lc.x, lc.y, leftSlingVerts, { ...o, label: 'slingshot' }));

    const rightSlingVerts = [
      { x: 383 * S, y: 560 * S },  // slope top (wall junction)
      { x: 383 * S, y: 757 * S },  // bottom-right (wall/floor)
      { x: 301 * S - 5, y: 757 * S },  // bottom-left (floor)
      { x: 301 * S - 5, y: 700 * S - 10 }   // slope bottom end
    ];
    const rc = this._polyCentroid(rightSlingVerts);
    w.push(Bodies.fromVertices(rc.x, rc.y, rightSlingVerts, { ...o, label: 'slingshot' }));

    // (drain boundaries + corner deflectors removed — dead zone quads cover these areas)

    // (removed — dead zone quad covers this area now)
    // Deflector at left slingshot/wall top junction (where wall meets slope)
    w.push(Bodies.circle(20 * S, 558 * S, 5 * S, { ...o, restitution: 0.8, label: 'wall' }));
    // Deflector at right slingshot/wall top junction
    w.push(Bodies.circle(379 * S, 558 * S, 5 * S, { ...o, restitution: 0.8, label: 'wall' }));

    // Deflector at top of inner wall (small, doesn't block lane)
    w.push(Bodies.circle(380 * S, 95 * S, 5 * S, { ...o, restitution: 0.8, friction: 0.0, label: 'wall' }));

    // (bottom floor walls removed — slingshot dead zone quads cover this area)

    this.wallBodies = w;
    Composite.add(this.engine.world, w);
  }

  // Compute the area centroid of a polygon (for correct fromVertices placement)
  _polyCentroid(verts) {
    let area = 0, cx = 0, cy = 0;
    for (let i = 0, n = verts.length; i < n; i++) {
      const j = (i + 1) % n;
      const cross = verts[i].x * verts[j].y - verts[j].x * verts[i].y;
      area += cross;
      cx += (verts[i].x + verts[j].x) * cross;
      cy += (verts[i].y + verts[j].y) * cross;
    }
    area /= 2;
    return { x: cx / (6 * area), y: cy / (6 * area) };
  }

  _makeRoundedRect(cx, cy, w, h, opts) {
    // Create a rounded-rectangle body matching the visual roundRect rendering
    const hw = w / 2, hh = h / 2;
    const r = Math.min(hw, hh, 10);  // same radius as renderer
    const segs = 4; // segments per corner arc
    const verts = [];
    // Four corners: top-right, bottom-right, bottom-left, top-left
    const corners = [
      { cx:  hw - r, cy: -hh + r, startA: -Math.PI / 2, endA: 0 },
      { cx:  hw - r, cy:  hh - r, startA: 0, endA: Math.PI / 2 },
      { cx: -hw + r, cy:  hh - r, startA: Math.PI / 2, endA: Math.PI },
      { cx: -hw + r, cy: -hh + r, startA: Math.PI, endA: Math.PI * 1.5 },
    ];
    for (const c of corners) {
      for (let i = 0; i <= segs; i++) {
        const a = c.startA + (c.endA - c.startA) * i / segs;
        verts.push({ x: c.cx + Math.cos(a) * r, y: c.cy + Math.sin(a) * r });
      }
    }
    return Bodies.fromVertices(cx, cy, verts, opts);
  }

  _makeTaperedFlipper(cx, cy, len, pivotW, tipW, isLeft, opts) {
    // Create a tapered trapezoid flipper body matching visual dimensions.
    // Pre-compensate for centroid shift: fromVertices shifts vertices so centroid = body position.
    // For a trapezoid, centroid shifts toward the wider end by: hw*(th-ph)/(3*(ph+th))
    const hw = len / 2;
    const ph = pivotW / 2;  // half-height at pivot
    const th = tipW / 2;    // half-height at tip
    // Centroid offset from geometric center (negative = toward pivot for left flipper)
    const cx_off = hw * (th - ph) / (3 * (ph + th));
    // Shift vertices to cancel centroid offset so body center stays where we want it
    const sx = -cx_off;  // shift applied to all vertex x-coords
    const verts = isLeft ? [
      { x: -hw + sx, y: -ph },   // pivot top
      { x:  hw + sx, y: -th },   // tip top
      { x:  hw + sx, y:  th },   // tip bottom
      { x: -hw + sx, y:  ph },   // pivot bottom
    ] : [
      { x: -hw + sx, y: -th },   // tip top
      { x:  hw + sx, y: -ph },   // pivot top
      { x:  hw + sx, y:  ph },   // pivot bottom
      { x: -hw + sx, y:  th },   // tip bottom
    ];
    return Bodies.fromVertices(cx, cy, verts, opts);
  }

  createFlippers() {
    const fo = { isStatic: true, friction: 0.5, restitution: 0.06, label: 'flipper' };
    const pivotW = FLIPPER_W;          // Match visual pivot diameter
    const tipW = FLIPPER_W * 0.6;      // Match visual tip diameter
    this.leftFlipper = this._makeTaperedFlipper(157 * S, 700 * S, FLIPPER_LEN, pivotW, tipW, true, fo);
    this.leftFlipperPivot = { x: 98 * S, y: 700 * S };
    this.leftFlipperAngle = 0.5;
    this.rightFlipper = this._makeTaperedFlipper(242 * S, 700 * S, FLIPPER_LEN, pivotW, tipW, false, fo);
    this.rightFlipperPivot = { x: 301 * S, y: 700 * S };
    this.rightFlipperAngle = -0.5;
    this._positionFlipper(this.leftFlipper, this.leftFlipperPivot, this.leftFlipperAngle, true);
    this._positionFlipper(this.rightFlipper, this.rightFlipperPivot, this.rightFlipperAngle, false);

    // Secondary shorter flippers at side walls (oscillate up/down)
    const miniLen = FLIPPER_LEN * 0.6;
    const miniPivotW = FLIPPER_W - 2;               // Match visual mini pivot
    const miniTipW = (FLIPPER_W - 2) * 0.5;         // Match visual mini tip
    this.miniFlipperBaseY = 288 * S;
    this.miniFlipperRange = 288 * 0.75 * S; // 75% downward travel
    this.leftFlipper2 = this._makeTaperedFlipper(40 * S, 288 * S, miniLen, miniPivotW, miniTipW, true, fo);
    this.leftFlipperPivot2 = { x: 22 * S, y: 288 * S };
    this.leftFlipperAngle2 = 0.5;
    this.rightFlipper2 = this._makeTaperedFlipper(359 * S, 288 * S, miniLen, miniPivotW, miniTipW, false, fo);
    this.rightFlipperPivot2 = { x: 377 * S, y: 288 * S };
    this.rightFlipperAngle2 = -0.5;
    this._positionFlipperMini(this.leftFlipper2, this.leftFlipperPivot2, this.leftFlipperAngle2, true, miniLen);
    this._positionFlipperMini(this.rightFlipper2, this.rightFlipperPivot2, this.rightFlipperAngle2, false, miniLen);

    Composite.add(this.engine.world, [this.leftFlipper, this.rightFlipper, this.leftFlipper2, this.rightFlipper2]);
  }

  _positionFlipper(body, pivot, angle, isLeft) {
    const hw = FLIPPER_LEN / 2 - 3;
    const ox = isLeft ? hw : -hw;
    const cx = pivot.x + Math.cos(angle) * ox;
    const cy = pivot.y + Math.sin(angle) * ox;
    Body.setPosition(body, { x: cx, y: cy });
    Body.setAngle(body, angle);
  }

  _positionFlipperMini(body, pivot, angle, isLeft, len) {
    const hw = len / 2 - 3;
    const ox = isLeft ? hw : -hw;
    const cx = pivot.x + Math.cos(angle) * ox;
    const cy = pivot.y + Math.sin(angle) * ox;
    Body.setPosition(body, { x: cx, y: cy });
    Body.setAngle(body, angle);
  }

  createBall(x, y) {
    if (this.ball) Composite.remove(this.engine.world, this.ball);
    this.ball = Bodies.circle(x || 398 * S, y || 670 * S, BALL_R, {
      density: 0.001, friction: 0.04, frictionAir: 0.002,
      restitution: 0.5, label: 'ball', slop: 0.01
    });
    Composite.add(this.engine.world, this.ball);
    this.ballLaunched = false;
  }

  loadLevel(num) {
    this.clearLevelBodies();
    const cfg = LEVELS[num - 1];
    if (!cfg) return;

    // Difficulty scaling: gravity increases with level
    this.engine.gravity.y = 0.12 + (num - 1) * 0.01;

    const bo = { isStatic: true, restitution: 1.6, label: 'bumper' };
    this.bumperBodies = [];
    for (const b of cfg.bumpers) {
      const bx = b[0] * S;
      const last = b[b.length - 1];
      const shape = typeof last === 'string' ? last : 'c';
      let body;

      if (shape === 'r') {
        // Rectangle: [x, y, w, h, angle, 'r']
        body = Bodies.rectangle(bx, b[1] * S, b[2] * S, b[3] * S, { ...bo, angle: b[4] || 0 });
        body.bumperType = 'r';
        body.bumperW = b[2] * S;
        body.bumperH = b[3] * S;
        body.bumperRadius = Math.max(b[2], b[3]) * S / 2;
      } else if (shape === 't') {
        // Triangle: [x, y, radius, angle, 't']
        body = Bodies.polygon(bx, b[1] * S, 3, b[2] * S, { ...bo, angle: b[3] || 0 });
        body.bumperType = 't';
        body.bumperRadius = b[2] * S;
      } else if (shape === 'd') {
        // Diamond: [x, y, radius, angle, 'd']
        body = Bodies.polygon(bx, b[1] * S, 4, b[2] * S, { ...bo, angle: b[3] || 0 });
        body.bumperType = 'd';
        body.bumperRadius = b[2] * S;
      } else {
        // Circle: [x, y, radius]
        body = Bodies.circle(bx, b[1] * S, b[2] * S, { ...bo });
        body.bumperType = 'c';
        body.bumperRadius = b[2] * S;
      }

      // Points based on row: top=5, middle=3, bottom=2
      body.pointValue = b[1] < 280 ? 5 : b[1] < 400 ? 3 : 2;
      body.hitTime = 0;
      body.baseX = bx; // store base position for hover animation
      body.hoverPhase = Math.random() * Math.PI * 2;
      body.hoverRange = 12 * S; // slightly less than targets
      this.bumperBodies.push(body);
    }

    const to = { isStatic: true, restitution: 0.3, label: 'target' };
    this.targetBodies = [];
    for (const t of cfg.targets) {
      // Use explicit angle (5th element) or auto-angle for horizontal targets
      let angle = t.length > 4 ? (t[4] || 0) : 0;
      const isHorizontal = t[2] > t[3];
      if (isHorizontal && Math.abs(angle) < 0.15) angle = 0.15;
      const body = this._makeRoundedRect(t[0] * S, t[1] * S, t[2] * S, t[3] * S,
        { ...to, angle });
      body.targetW = t[2] * S; body.targetH = t[3] * S;
      body.pointValue = (t[2] === t[3]) ? 10 : 1; // square targets worth 10
      body.hit = false;
      body.hitTime = 0;
      body.baseX = t[0] * S;
      body.hoverPhase = Math.random() * Math.PI * 2;
      body.hoverRange = 18 * S;
      this.targetBodies.push(body);
    }

    // Tunnels
    this.tunnelBodies = [];
    if (cfg.tunnels) {
      for (const t of cfg.tunnels) {
        const entry = Bodies.circle(t[0] * S, t[1] * S, 15 * S, {
          isStatic: true, isSensor: true, label: 'tunnel_entry'
        });
        const exit = Bodies.circle(t[2] * S, t[3] * S, 15 * S, {
          isStatic: true, isSensor: true, label: 'tunnel_exit'
        });
        entry.tunnelExit = exit;
        entry.tunnelCooldown = 0;
        exit.tunnelEntry = entry;
        exit.tunnelCooldown = 0;
        this.tunnelBodies.push(entry, exit);
      }
    }

    Composite.add(this.engine.world, [
      ...this.bumperBodies, ...this.targetBodies,
      ...this.tunnelBodies
    ]);

    // Generate background circuit traces
    this.bgTraces = [];
    const seed = num * 7 + 13;
    for (let i = 0; i < 12; i++) {
      const sx = ((seed * (i + 1) * 37) % (TW - 60)) + 30;
      const sy = ((seed * (i + 1) * 53) % (TH - 150)) + 80;
      const segs = [];
      let cx = sx, cy = sy;
      for (let j = 0; j < 2 + (i % 3); j++) {
        const horizontal = (j + i) % 2 === 0;
        const len = 20 + ((seed + i * 7 + j * 13) % 50);
        const dir = (i + j) % 2 === 0 ? 1 : -1;
        const ex = horizontal ? Math.max(25, Math.min(TW - 25, cx + len * dir)) : cx;
        const ey = horizontal ? cy : Math.max(40, Math.min(TH - 60, cy + len * dir));
        segs.push({ x1: cx, y1: cy, x2: ex, y2: ey });
        cx = ex; cy = ey;
      }
      this.bgTraces.push(segs);
    }
  }

  clearLevelBodies() {
    if (this.bumperBodies.length) Composite.remove(this.engine.world, this.bumperBodies);
    if (this.targetBodies.length) Composite.remove(this.engine.world, this.targetBodies);
    if (this.tunnelBodies.length) Composite.remove(this.engine.world, this.tunnelBodies);
    this.bumperBodies = [];
    this.targetBodies = [];
    this.tunnelBodies = [];
  }

  setupCollisions() {
    Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA, b = pair.bodyB;
        let ball = null, other = null;
        if (a.label === 'ball') { ball = a; other = b; }
        else if (b.label === 'ball') { ball = b; other = a; }
        if (!ball) continue;

        if (other.label === 'bumper') {
          const dx = ball.position.x - other.position.x;
          const dy = ball.position.y - other.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const bForce = 0.1 + (this.level - 1) * 0.004;
          Body.applyForce(ball, ball.position, { x: (dx / dist) * bForce, y: (dy / dist) * bForce });
          const pts = other.pointValue || 1;
          this.addScore(pts, other.position.x, other.position.y);
          other.hitTime = Date.now();
          const c = this.getLevelCfg().colors;
          this.particles.emit(other.position.x, other.position.y, c.p, this.lowPerf ? 5 : 15);
          if (!this.lowPerf) this.lights.add(other.position.x, other.position.y, c.p, other.bumperRadius * 3);
          this.sound.bumper();
          this.screenShake = 3;
        }
        else if (other.label === 'target') {
          // Skip scoring if target is already hit (hidden)
          if (other.hit) continue;
          // Bounce ball off target — scores every hit like bumpers
          const dx = ball.position.x - other.position.x;
          const dy = ball.position.y - other.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const tForce = 0.015 + (this.level - 1) * 0.002;
          Body.applyForce(ball, ball.position, { x: (dx / dist) * tForce, y: (dy / dist) * tForce });
          other.hit = true;
          other.hitTime = Date.now();
          // Disable collision so ball passes through hidden target
          other.collisionFilter = { group: 0, category: 0x0002, mask: 0x0000 };
          const pts = other.pointValue || 1;
          this.addScore(pts, other.position.x, other.position.y);

          // Track unique targets for multi-target bonus
          const now2 = Date.now();
          this.recentTargets = this.recentTargets.filter(r => now2 - r.time < this.multiTargetWindow);
          if (!this.recentTargets.some(r => r.body === other)) {
            this.recentTargets.push({ body: other, time: now2 });
          }
          const uniqueCount = this.recentTargets.length;
          if (uniqueCount >= 3) {
            const bonus = uniqueCount * 5;
            this.updateScore(bonus);
            this.scorePopups.push({
              x: other.position.x, y: other.position.y - 30,
              text: uniqueCount + ' TARGETS! +' + bonus,
              life: 2.2, vy: -2, combo: true
            });
            if (!this.lowPerf) {
              const c2 = this.getLevelCfg().colors;
              this.particles.emit(other.position.x, other.position.y, '#FFD700', uniqueCount * 4);
              this.lights.screen(c2.p);
            }
            this.screenShake = Math.min(this.screenShake + 2, 8);
          }

          const c = this.getLevelCfg().colors;
          this.particles.emit(other.position.x, other.position.y, c.a, this.lowPerf ? 4 : 12);
          if (!this.lowPerf) {
            this.lights.add(other.position.x, other.position.y, c.a, 50);
            this.lights.screen(c.a);
          }
          this.sound.target();
          this.screenShake = 4;
        }
        else if (other.label === 'slingshot') {
          const dx = ball.position.x - other.position.x;
          const dy = ball.position.y - other.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          Body.applyForce(ball, ball.position, { x: (dx / dist) * 0.01, y: (dy / dist) * 0.01 });
          // Track slingshot hit for flash effect
          if (ball.position.x < TW / 2) {
            this.slingshotHitTime.left = Date.now();
          } else {
            this.slingshotHitTime.right = Date.now();
          }
          this.sound.wall();
        }
        else if (other.label === 'arc') {
          this.wallHitFlashes.push({
            x: ball.position.x, y: ball.position.y,
            time: Date.now()
          });
          this.sound.wall();
        }
        else if (other.label === 'wall') {
          // Skip friction in the launch lane and top zone (arc/top wall/upper left)
          const inLane = ball.position.x > 383 * S;
          const inTopZone = ball.position.y < 80 * S;
          if (!inLane && !inTopZone) {
            // Friction slowdown on wall hit
            const v = ball.velocity;
            const spd = Math.sqrt(v.x * v.x + v.y * v.y);
            if (spd > 1.5) {
              const drag = 0.985;
              Body.setVelocity(ball, { x: v.x * drag, y: v.y * drag });
              // Friction sparks
              this.wallFrictionContacts.push({
                x: ball.position.x, y: ball.position.y,
                vx: v.x, vy: v.y, spd,
                time: Date.now()
              });
            }
            // Flash of light at contact point
            this.wallHitFlashes.push({
              x: ball.position.x, y: ball.position.y,
              time: Date.now()
            });
            // Small outward push on left/right outer walls
            if (ball.position.x < 50 * S) {
              Body.applyForce(ball, ball.position, { x: 0.008, y: 0 });
            } else if (ball.position.x > 360 * S && ball.position.x < 383 * S) {
              Body.applyForce(ball, ball.position, { x: -0.008, y: 0 });
            }
          }
          this.sound.wall();
        }
        else if (other.label === 'flipper') {
          // Muted thud on flipper contact (same as wall)
          this.sound.wall();
          // Friction slowdown on flipper contact
          const v = ball.velocity;
          const spd = Math.sqrt(v.x * v.x + v.y * v.y);
          if (spd > 1.5) {
            const drag = 0.85;
            Body.setVelocity(ball, { x: v.x * drag, y: v.y * drag });
            this.wallFrictionContacts.push({
              x: ball.position.x, y: ball.position.y,
              vx: v.x, vy: v.y, spd,
              time: Date.now()
            });
          }

          // Proportional force boost: compensate for weak hits near pivot
          const flippers = [
            { body: this.leftFlipper, pivot: this.leftFlipperPivot, active: this.leftActive, isLeft: true },
            { body: this.rightFlipper, pivot: this.rightFlipperPivot, active: this.rightActive, isLeft: false },
            { body: this.leftFlipper2, pivot: this.leftFlipperPivot2, active: this.leftActive, isLeft: true },
            { body: this.rightFlipper2, pivot: this.rightFlipperPivot2, active: this.rightActive, isLeft: false },
          ];
          for (const f of flippers) {
            if (other !== f.body || !f.active) continue;
            // How close is the ball to the pivot? 0 = at pivot, 1 = at tip
            const dx = ball.position.x - f.pivot.x;
            const dy = ball.position.y - f.pivot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const flipLen = FLIPPER_LEN / 2;
            const t = Math.min(dist / flipLen, 1); // 0 near pivot, 1 near tip
            // Boost force near pivot (inverse relationship): more boost when t is small
            if (t < 0.6) {
              const boost = (1 - t / 0.6) * 5; // max boost of 5 at pivot, fading to 0 at 60%
              const angle = f.body.angle + (f.isLeft ? -Math.PI / 3 : Math.PI / 3);
              Body.setVelocity(ball, {
                x: ball.velocity.x + Math.cos(angle) * boost,
                y: ball.velocity.y + Math.sin(angle) * boost
              });
            }
            break;
          }
        }
      }
    });

    // Continuous friction while ball slides along wall
    Events.on(this.engine, 'collisionActive', (event) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA, b = pair.bodyB;
        let ball = null, other = null;
        if (a.label === 'ball') { ball = a; other = b; }
        else if (b.label === 'ball') { ball = b; other = a; }
        if (!ball) continue;

        if (other.label === 'wall' || other.label === 'flipper') {
          // Skip friction in the launch lane and top zone
          const inLane = ball.position.x > 383 * S;
          const inTopZone = ball.position.y < 80 * S;
          if ((inLane || inTopZone) && other.label !== 'flipper') continue;
          const v = ball.velocity;
          const spd = Math.sqrt(v.x * v.x + v.y * v.y);
          if (spd > 1) {
            // Gentle continuous drag
            const drag = other.label === 'flipper' ? 0.97 : 0.997;
            Body.setVelocity(ball, { x: v.x * drag, y: v.y * drag });
            // Emit small sparks periodically
            const now = Date.now();
            const last = this._lastWallSparkTime || 0;
            if (now - last > 60) {
              this._lastWallSparkTime = now;
              this.wallFrictionContacts.push({
                x: ball.position.x, y: ball.position.y,
                vx: v.x, vy: v.y, spd,
                time: now
              });
            }
          }
        }
      }
    });
  }

  // ==================== INPUT ====================
  setupInput() {
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.sound.init();

      if (e.key === 'Control' || e.key === 'Shift') {
        e.preventDefault();
        if (e.location === 1) {
          this.leftActive = true;
          if (this.state === 'PLAYING') this.sound.flipper();
        } else if (e.location === 2) {
          this.rightActive = true;
          if (this.state === 'PLAYING') this.sound.flipper();
        }
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.leftActive = true;
        if (this.state === 'PLAYING') this.sound.flipper();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.rightActive = true;
        if (this.state === 'PLAYING') this.sound.flipper();
      }

      if (e.key === ' ') {
        e.preventDefault();
        this.spaceDown = true;
        if (this.state === 'MENU' || this.state === 'SHARED') this.startGame();
        else if (this.state === 'GAME_OVER') this.startGame();
        else if (this.state === 'LEVEL_COMPLETE') this.nextLevel();
        else if (this.state === 'VICTORY') this.startGame();
        else if (this.state === 'PLAYING' && !this.ballLaunched) {
          this.launchCharging = true;
        }
      }

      if (e.key === 'Enter') {
        if (this.state === 'MENU' || this.state === 'SHARED') this.startGame();
        else if (this.state === 'GAME_OVER') this.startGame();
        else if (this.state === 'LEVEL_COMPLETE') this.nextLevel();
        else if (this.state === 'VICTORY') this.startGame();
      }

      if (e.key === 'r' || e.key === 'R') {
        if (this.state === 'PLAYING') {
          this.createBall();
          this.resetFlashTime = Date.now();
          this.sound.reset();
        }
      }

      if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        this.debugBodies = !this.debugBodies;
      }

      // Hidden: Ctrl+V to toggle victory screen
      if (e.key === 'v' && e.ctrlKey) {
        e.preventDefault();
        if (this.state === 'VICTORY') {
          this.state = this._preVictoryState || 'PLAYING';
        } else {
          this._preVictoryState = this.state;
          this.state = 'VICTORY';
        }
      }

      // Hidden: Ctrl+Plus / Ctrl+Minus to change levels
      if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        if (this.state === 'PLAYING' && this.level < TOTAL_LEVELS) {
          this.level++;
          this.levelScore = 0;
          this.loadLevel(this.level);
          this.createBall();
        }
      }
      if (e.ctrlKey && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        if (this.state === 'PLAYING' && this.level > 1) {
          this.level--;
          this.levelScore = 0;
          this.loadLevel(this.level);
          this.createBall();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Control' || e.key === 'Shift') {
        if (e.location === 1) this.leftActive = false;
        else if (e.location === 2) this.rightActive = false;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.leftActive = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.rightActive = false;
      if (e.key === ' ') {
        if (this.state === 'PLAYING' && this.launchCharging && !this.ballLaunched) {
          this.launchBall();
        }
        this.spaceDown = false;
        this.launchCharging = false;
      }
    });

    // Touch (uses shared _getInputZone for zone detection)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.sound.init();
      for (const t of e.changedTouches) {
        const pos = this.touchToGame(t.clientX, t.clientY);
        const zone = this._getInputZone(pos.x, pos.y);
        this.touchIds[t.identifier] = zone;

        if (this.state !== 'PLAYING') {
          if (this.state === 'MENU' || this.state === 'SHARED') this.startGame();
          else if (this.state === 'GAME_OVER') this.startGame();
          else if (this.state === 'LEVEL_COMPLETE') this.nextLevel();
          else if (this.state === 'VICTORY') this.startGame();
          return;
        }

        // Mobile reset button
        if (this._isResetButtonHit(pos.x, pos.y)) {
          this.createBall();
          this.resetFlashTime = Date.now();
          this.sound.reset();
          this.touchIds[t.identifier] = 'reset';
          continue;
        }

        if (zone === 'launch') {
          this.launchCharging = true;
        } else if (zone === 'left') {
          this.leftActive = true;
          this.sound.flipper();
        } else {
          this.rightActive = true;
          this.sound.flipper();
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const zone = this.touchIds[t.identifier];
        delete this.touchIds[t.identifier];
        if (!zone) continue;

        if (zone === 'launch') {
          if (this.launchCharging && !this.ballLaunched) this.launchBall();
          this.launchCharging = false;
        } else if (zone === 'left') {
          this.leftActive = false;
        } else {
          this.rightActive = false;
        }
      }
      if (e.touches.length === 0) {
        this.leftActive = false;
        this.rightActive = false;
        this.launchCharging = false;
      }
    }, { passive: false });

    this.canvas.addEventListener('touchcancel', () => {
      this.leftActive = false;
      this.rightActive = false;
      this.launchCharging = false;
      this.touchIds = {};
    });

    // Mouse support (uses shared _getInputZone for zone detection)
    this._mouseAction = null; // 'left', 'right', or 'launch'

    this.canvas.addEventListener('mousedown', (e) => {
      this.sound.init();
      if (this.state !== 'PLAYING') return;

      const rect = this.canvas.getBoundingClientRect();
      const gx = (e.clientX - rect.left) / this.scaleX;
      const gy = (e.clientY - rect.top) / this.scaleY;

      // Reset button click
      if (this._isResetButtonHit(gx, gy)) {
        this.createBall();
        this.resetFlashTime = Date.now();
        this.sound.reset();
        this._mouseAction = 'reset';
        return;
      }

      const zone = this._getInputZone(gx, gy);
      this._mouseAction = zone;

      if (zone === 'launch') {
        this.launchCharging = true;
        e.preventDefault();
      } else if (zone === 'left') {
        this.leftActive = true;
        this.sound.flipper();
      } else {
        this.rightActive = true;
        this.sound.flipper();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (!this._mouseAction) return;

      if (this._mouseAction === 'launch') {
        if (this.launchCharging && !this.ballLaunched) this.launchBall();
        this.launchCharging = false;
      } else if (this._mouseAction === 'left') {
        this.leftActive = false;
      } else {
        this.rightActive = false;
      }
      this._mouseAction = null;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state !== 'PLAYING') { this.resetButtonHover = false; this.canvas.style.cursor = ''; return; }
      const rect = this.canvas.getBoundingClientRect();
      const gx = (e.clientX - rect.left) / this.scaleX;
      const gy = (e.clientY - rect.top) / this.scaleY;
      this.resetButtonHover = this._isResetButtonHit(gx, gy);
      this.canvas.style.cursor = this.resetButtonHover ? 'pointer' : '';
    });

    this.canvas.addEventListener('mouseleave', () => {
      if (this._mouseAction === 'launch') {
        if (this.launchCharging && !this.ballLaunched) this.launchBall();
        this.launchCharging = false;
      } else if (this._mouseAction === 'left') {
        this.leftActive = false;
      } else if (this._mouseAction === 'right') {
        this.rightActive = false;
      }
      this._mouseAction = null;
    });

    this.canvas.addEventListener('click', (e) => {
      this.sound.init();
      if (this._shareClicked) { this._shareClicked = false; return; }
      if (this.state === 'MENU' || this.state === 'SHARED') this.startGame();
      else if (this.state === 'GAME_OVER') this.startGame();
      else if (this.state === 'LEVEL_COMPLETE') this.nextLevel();
      else if (this.state === 'VICTORY') this.startGame();
    });
  }

  touchToGame(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: (cx - rect.left) / this.scaleX, y: (cy - rect.top) / this.scaleY };
  }

  // Check if touch/click hits the reset button (rotated along arc curve)
  _isResetButtonHit(gx, gy) {
    const bw = 64 * S, bh = 22 * S;
    // Compute button position along the top-right arc (same as renderer)
    const arcT = 0.48;
    const aP0x = TW - 16, aP0y = 100 * S;
    const aP1x = TW - 16, aP1y = 16 * S;
    const aP2x = 258 * S, aP2y = 16 * S;
    const amt = 1 - arcT;
    const arcX = amt*amt*aP0x + 2*amt*arcT*aP1x + arcT*arcT*aP2x;
    const arcY = amt*amt*aP0y + 2*amt*arcT*aP1y + arcT*arcT*aP2y;
    const tanX = 2*amt*(aP1x - aP0x) + 2*arcT*(aP2x - aP1x);
    const tanY = 2*amt*(aP1y - aP0y) + 2*arcT*(aP2y - aP1y);
    const btnAngle = Math.atan2(-tanY, -tanX);
    const normLen = Math.sqrt(tanX*tanX + tanY*tanY);
    const bx = arcX + (-tanY / normLen) * 22 + 6;
    const by = arcY + (tanX / normLen) * 22;
    // Transform click into button's local rotated space
    const dx = gx - bx, dy = gy - by;
    const cos = Math.cos(-btnAngle), sin = Math.sin(-btnAngle);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    return Math.abs(lx) <= bw / 2 + 8 && Math.abs(ly) <= bh / 2 + 8;
  }

  // Shared input zone detection for touch and mouse
  _getInputZone(gx, gy) {
    const playCX = (16 + 383) / 2 * S;
    if (!this.ballLaunched && gx > 383 * S) return 'launch';
    if (gx < playCX) return 'left';
    return 'right';
  }

  // ==================== GAME LOGIC ====================
  startGame() {
    // Resume from saved progress if available
    if (this._savedProgress) {
      this.level = this._savedProgress.level;
      this.totalScore = this._savedProgress.totalScore;
      this.levelScore = this._savedProgress.levelScore || 0;
      this._savedProgress = null; // consume it so next start is fresh
    } else {
      this.level = 1;
      this.totalScore = 0;
      this.levelScore = 0;
    }
    this.state = 'PLAYING';
    this.scorePopups = [];

    if (this.engine) {
      Composite.clear(this.engine.world, false);
      Engine.clear(this.engine);
    }
    this.initPhysics();
    this.loadLevel(this.level);
    this.createBall();
  }

  restartGame() {
    this._clearProgress();
    this.level = 1;
    this.levelScore = 0;
    this.totalScore = 0;
    this.state = 'MENU';
    this.scorePopups = [];
  }

  nextLevel() {
    this.level++;
    if (this.level > TOTAL_LEVELS) {
      this.state = 'VICTORY';
      this.sound.victory();
      this._clearProgress(); // Game complete, clear saved state
      // Analytics: game complete
      if (typeof gtag === 'function') {
        gtag('event', 'game_complete', {
          total_score: this.totalScore
        });
      }
      return;
    }
    this.levelScore = 0;
    this.state = 'PLAYING';
    this._saveProgress(); // Save progress for browser restore
    this.loadLevel(this.level);
    this.createBall();
  }

  launchBall() {
    if (this.ballLaunched) return;
    const power = Math.min(this.launchPower, 1);
    if (power < 0.1) return;

    const speed = 5 + power * 25;
    Body.setVelocity(this.ball, { x: -2 - power * 2, y: -speed });

    this.ballLaunched = true;
    this.launchPower = 0;
    this.sound.launch();

    const c = this.getLevelCfg().colors;
    const bx = this.ball.position.x, by = this.ball.position.y;
    this.particles.emit(bx, by + 15, c.p, 20);
    this.lights.add(bx, by + 15, c.p, 50);
    this.screenShake = 2;
  }

  addScore(pts, x, y) {
    const now = Date.now();
    // Combo system: rapid hits increase multiplier
    if (now - this.comboTimer < this.comboWindow) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.comboTimer = now;
    // Multiplier: x1 for 1st hit, x2 at 3 hits, x3 at 6, x4 at 10, x5 at 15
    this.comboMultiplier = this.comboCount < 3 ? 1 :
                           this.comboCount < 6 ? 2 :
                           this.comboCount < 10 ? 3 :
                           this.comboCount < 15 ? 4 : 5;

    const finalPts = pts * this.comboMultiplier;
    this.updateScore(finalPts);
    this.sound.score();

    if (this.comboMultiplier > 1) {
      this.sound.combo(this.comboMultiplier);
      this.scorePopups.push({ x, y, text: '+' + finalPts + ' x' + this.comboMultiplier, life: 1.8, vy: -1.5, combo: true });
      // Extra effects for combos
      if (!this.lowPerf) {
        const c = this.getLevelCfg().colors;
        this.particles.emit(x, y, '#FFD700', this.comboMultiplier * 5);
      }
      this.screenShake = Math.min(this.screenShake + 1, 6);
    } else {
      this.scorePopups.push({ x, y, text: '+' + pts, life: 1.5, vy: -1.5 });
    }
  }

  loseLife() {
    this.sound.ballLost();
    this.screenShake = 5;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.createBall();
  }

  // Compute target angles and speeds for flippers (called once per frame)
  _flipperTargets() {
    const REST_L = 0.5, ACTIVE_L = -0.5;
    const REST_R = -0.5, ACTIVE_R = 0.5;
    const UP_SPEED = 0.6, DOWN_SPEED = 0.1;
    return {
      targetL: this.leftActive ? ACTIVE_L : REST_L,
      speedL: this.leftActive ? UP_SPEED : DOWN_SPEED,
      targetR: this.rightActive ? ACTIVE_R : REST_R,
      speedR: this.rightActive ? UP_SPEED : DOWN_SPEED,
    };
  }

  // Move flippers by a fraction of the full frame step (called per substep)
  updateFlippersStep(fraction) {
    const { targetL, speedL, targetR, speedR } = this._flipperTargets();
    const miniLen = FLIPPER_LEN * 0.6;

    // Left main
    const stepL = speedL * fraction;
    const diffL = targetL - this.leftFlipperAngle;
    if (Math.abs(diffL) < 0.01) this.leftFlipperAngle = targetL;
    else this.leftFlipperAngle += Math.sign(diffL) * Math.min(stepL, Math.abs(diffL));
    const prevL = this.leftFlipper.angle;
    this._positionFlipper(this.leftFlipper, this.leftFlipperPivot, this.leftFlipperAngle, true);
    Body.setAngularVelocity(this.leftFlipper, (this.leftFlipperAngle - prevL) / fraction * 0.47);

    // Right main
    const stepR = speedR * fraction;
    const diffR = targetR - this.rightFlipperAngle;
    if (Math.abs(diffR) < 0.01) this.rightFlipperAngle = targetR;
    else this.rightFlipperAngle += Math.sign(diffR) * Math.min(stepR, Math.abs(diffR));
    const prevR = this.rightFlipper.angle;
    this._positionFlipper(this.rightFlipper, this.rightFlipperPivot, this.rightFlipperAngle, false);
    Body.setAngularVelocity(this.rightFlipper, (this.rightFlipperAngle - prevR) / fraction * 0.47);

    // Oscillate mini flipper Y positions (smooth sine wave, ~4s period)
    const oscY = this.miniFlipperBaseY + (Math.sin(this.animTime * 1.5) * 0.5 + 0.5) * this.miniFlipperRange;
    this.leftFlipperPivot2.y = oscY;
    this.rightFlipperPivot2.y = oscY;

    // Left mini
    const prevL2 = this.leftFlipper2.angle;
    const diffL2 = targetL - this.leftFlipperAngle2;
    if (Math.abs(diffL2) < 0.01) this.leftFlipperAngle2 = targetL;
    else this.leftFlipperAngle2 += Math.sign(diffL2) * Math.min(stepL, Math.abs(diffL2));
    this._positionFlipperMini(this.leftFlipper2, this.leftFlipperPivot2, this.leftFlipperAngle2, true, miniLen);
    Body.setAngularVelocity(this.leftFlipper2, (this.leftFlipperAngle2 - prevL2) / fraction * 0.65);

    // Right mini
    const prevR2 = this.rightFlipper2.angle;
    const diffR2 = targetR - this.rightFlipperAngle2;
    if (Math.abs(diffR2) < 0.01) this.rightFlipperAngle2 = targetR;
    else this.rightFlipperAngle2 += Math.sign(diffR2) * Math.min(stepR, Math.abs(diffR2));
    this._positionFlipperMini(this.rightFlipper2, this.rightFlipperPivot2, this.rightFlipperAngle2, false, miniLen);
    Body.setAngularVelocity(this.rightFlipper2, (this.rightFlipperAngle2 - prevR2) / fraction * 0.65);
  }

  checkBallLost() {
    if (this.ball && this.ball.position.y > TH + 30) {
      this.loseLife();
    }
    if (this.ball) {
      // Hold ball at launch position when not launched (prevent falling under gravity)
      if (!this.ballLaunched && this.ball.position.x > 383 * S) {
        const restY = 670 * S;
        if (this.ball.position.y > restY) {
          Body.setPosition(this.ball, { x: 398 * S, y: restY });
          Body.setVelocity(this.ball, { x: 0, y: 0 });
        }
      }
      const v = this.ball.velocity;
      const spd = Math.sqrt(v.x * v.x + v.y * v.y);
      const inLane = this.ball.position.x > 383 * S;
      const maxSpd = inLane ? 30 : 12 + (this.level - 1) * 0.2;
      if (spd > maxSpd) {
        const drag = 0.93;
        Body.setVelocity(this.ball, { x: v.x * drag, y: v.y * drag });
      }
      const bx = this.ball.position.x, by = this.ball.position.y;
      if (bx < 20 || bx > TW - 15 || by < 10) {
        Body.setPosition(this.ball, { x: 398 * S, y: 670 * S });
        Body.setVelocity(this.ball, { x: 0, y: 0 });
        this.ballLaunched = false;
      }

      // Re-enable launcher if ball falls back into the launch lane
      if (this.ballLaunched && bx > 383 * S && by > 600 * S && spd < 3) {
        Body.setPosition(this.ball, { x: 398 * S, y: 670 * S });
        Body.setVelocity(this.ball, { x: 0, y: 0 });
        this.ballLaunched = false;
        this.launchPower = 0;
      }

      // Anti-stuck: apply gradual force when ball is slow (no sudden jumps)
      if (this.ballLaunched && bx < 383 * S && spd < 1.5) {
        // Gentle continuous push: away from nearest wall + downward
        const forceX = bx < TW / 2 ? 0.0015 : -0.0015;
        Body.applyForce(this.ball, this.ball.position, { x: forceX, y: 0.001 });
      }
    }
  }

  checkLevelComplete() {
    if (this.levelScore >= scoreForLevel(this.level)) {
      this.state = 'LEVEL_COMPLETE';
      this.sound.levelUp(this.level);
      // Analytics: level complete
      if (typeof gtag === 'function') {
        gtag('event', 'level_complete', {
          level: this.level,
          level_name: this.getLevelCfg().name,
          score: this.levelScore,
          total_score: this.totalScore
        });
      }
    }
  }

  checkTunnels() {
    if (!this.ball || !this.tunnelBodies.length) return;
    const bx = this.ball.position.x, by = this.ball.position.y;
    const now = Date.now();
    const tunnelR = 15 * S;

    for (const t of this.tunnelBodies) {
      if (t.label !== 'tunnel_entry') continue;
      if (now < t.tunnelCooldown) continue;

      const dx = bx - t.position.x, dy = by - t.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < tunnelR) {
        const exit = t.tunnelExit;
        Body.setPosition(this.ball, { x: exit.position.x, y: exit.position.y });
        Body.setVelocity(this.ball, { x: 0, y: 3 });
        t.tunnelCooldown = now + 2000;
        exit.tunnelCooldown = now + 2000;

        const c = this.getLevelCfg().colors;
        this.particles.emit(t.position.x, t.position.y, c.s, 15);
        this.particles.emit(exit.position.x, exit.position.y, c.s, 15);
        this.lights.add(t.position.x, t.position.y, c.s, 40);
        this.lights.add(exit.position.x, exit.position.y, c.s, 40);
        this.sound.target();
        this.addScore(10, exit.position.x, exit.position.y);
        this.screenShake = 3;
        break;
      }
    }
  }

  update() {
    if (this.state !== 'PLAYING') return;

    if (this.launchCharging && !this.ballLaunched) {
      this.launchPower = Math.min(this.launchPower + 0.02, 1);
      const tickNum = Math.floor(this.launchPower * 20);
      if (tickNum !== this._lastChargeTick) {
        this._lastChargeTick = tickNum;
        this.sound.chargeTick(this.launchPower);
      }
    } else {
      this._lastChargeTick = 0;
    }

    // Interleaved flipper + physics substeps (prevents ball tunneling through flippers)
    const SUBSTEPS = this.lowPerf ? 4 : 6;
    const fixedDt = 1000 / 60 / SUBSTEPS;
    const frac = 1 / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) {
      this.updateFlippersStep(frac);
      Engine.update(this.engine, fixedDt);
    }

    // Ball going up: gentle drag to simulate tilted table incline
    if (this.ball && this.ball.velocity.y < -1 && this.ball.position.x < 383 * S) {
      const v = this.ball.velocity;
      Body.setVelocity(this.ball, { x: v.x, y: v.y * 0.999 });
    }

    // Gentle push out of wall-slope corner junctions to prevent getting stuck
    if (this.ball) {
      const bx = this.ball.position.x, by = this.ball.position.y;
      const v = this.ball.velocity;
      const spd = Math.sqrt(v.x * v.x + v.y * v.y);
      // Left wall-slope corner: near (16*S, 560*S)
      if (bx < 35 * S && by > 540 * S && by < 580 * S && spd < 3) {
        Body.applyForce(this.ball, this.ball.position, { x: 0.003, y: 0.002 });
      }
      // Right wall-slope corner: near (383*S, 560*S)
      if (bx > 365 * S && bx < 383 * S && by > 540 * S && by < 580 * S && spd < 3) {
        Body.applyForce(this.ball, this.ball.position, { x: -0.003, y: 0.002 });
      }
    }

    // Arc curve guide — nudge ball leftward when it stalls near the top
    if (this.ball && this.ball.position.y < 60 * S) {
      const v = this.ball.velocity;
      const spd = Math.sqrt(v.x * v.x + v.y * v.y);
      if (spd < 4 && this.ball.position.x > 100 * S) {
        Body.applyForce(this.ball, this.ball.position, { x: -0.004, y: 0.002 });
      }
    }

    // Record ball trail
    if (this.ball && this.ballLaunched) {
      const bx = this.ball.position.x, by = this.ball.position.y;
      const v = this.ball.velocity;
      const spd = Math.sqrt(v.x * v.x + v.y * v.y);
      if (spd > 2) {
        this.ballTrail.push({ x: bx, y: by, age: 0, spd });
      }
      if (this.ballTrail.length > 40) this.ballTrail.shift();
    }
    for (let i = this.ballTrail.length - 1; i >= 0; i--) {
      this.ballTrail[i].age++;
      if (this.ballTrail[i].age > 40) this.ballTrail.splice(i, 1);
    }

    this.checkBallLost();
    this.checkTunnels();
    this.checkLevelComplete();

    // Clean up old wall friction contacts and hit flashes
    const now = Date.now();
    while (this.wallFrictionContacts.length > 0 && now - this.wallFrictionContacts[0].time > 500) {
      this.wallFrictionContacts.shift();
    }
    if (this.wallFrictionContacts.length > 30) {
      this.wallFrictionContacts = this.wallFrictionContacts.slice(-30);
    }
    while (this.wallHitFlashes.length > 0 && now - this.wallHitFlashes[0].time > 400) {
      this.wallHitFlashes.shift();
    }
    if (this.wallHitFlashes.length > 20) {
      this.wallHitFlashes = this.wallHitFlashes.slice(-20);
    }

    // Reset targets - faster reset in later levels
    const resetTime = Math.max(2000, 5000 - (this.level - 1) * 150);
    for (const t of this.targetBodies) {
      if (t.hit && now - t.hitTime > resetTime) {
        t.hit = false;
        // Restore collision so ball bounces off visible target
        t.collisionFilter = { group: 0, category: 0x0001, mask: 0xFFFFFFFF };
      }
      // Hover targets left-right
      const hoverX = t.baseX + Math.sin(this.animTime * 1.2 + t.hoverPhase) * t.hoverRange;
      Body.setPosition(t, { x: hoverX, y: t.position.y });
    }

    // Hover bumpers left-right
    for (const b of this.bumperBodies) {
      const hoverX = b.baseX + Math.sin(this.animTime * 0.9 + b.hoverPhase) * b.hoverRange;
      Body.setPosition(b, { x: hoverX, y: b.position.y });
    }
  }

  // ==================== GAME LOOP ====================
  gameLoop(ts) {
    this.animTime = ts / 1000;
    this._renderFrame++;

    // Frame-rate independent: accumulate time and run fixed-step updates
    if (!this._lastTs) this._lastTs = ts;
    let elapsed = ts - this._lastTs;
    this._lastTs = ts;

    // Auto-detect low performance: track FPS over recent frames (mobile only)
    if (elapsed > 0 && this.isMobile) {
      this._fpsHistory.push(elapsed);
      if (this._fpsHistory.length > 60) this._fpsHistory.shift();
      if (this._fpsHistory.length >= 30) {
        const avgMs = this._fpsHistory.reduce((a, b) => a + b) / this._fpsHistory.length;
        if (!this.lowPerf && avgMs > 25) { // below ~40fps → degrade
          this._fpsLowCount++;
          if (this._fpsLowCount > 3) {
            this.lowPerf = true;
            this.resize();
          }
        } else if (this.lowPerf && avgMs < 18) { // above ~55fps → recover
          this._fpsHighCount = (this._fpsHighCount || 0) + 1;
          if (this._fpsHighCount > 10) {
            this.lowPerf = false;
            this._fpsHighCount = 0;
            this.resize();
          }
        } else {
          this._fpsLowCount = 0;
          this._fpsHighCount = 0;
        }
      }
    }

    // Clamp to avoid spiral of death on slow devices
    if (elapsed > 50) elapsed = 50;

    const STEP = 1000 / 60; // 16.67ms per logic step
    // Only run physics when actually playing (skip on menu/victory/etc.)
    if (this.state === 'PLAYING' || this.state === 'LEVEL_COMPLETE') {
      this._accumulator = (this._accumulator || 0) + elapsed;
      while (this._accumulator >= STEP) {
        this.update();
        this._accumulator -= STEP;
      }
    }

    // On low-perf, throttle particle/light updates to every other frame
    if (!this.lowPerf || (this._renderFrame & 1) === 0) {
      this.particles.update();
      this.lights.update();
    }

    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const p = this.scorePopups[i];
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) this.scorePopups.splice(i, 1);
    }

    if (this.screenShake > 0) this.screenShake *= 0.85;
    if (this.screenShake < 0.1) this.screenShake = 0;

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.renderScaleX, this.renderScaleY);
    if (this.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.screenShake * 2,
        (Math.random() - 0.5) * this.screenShake * 2
      );
    }
    // Disable canvas shadows on low-perf devices (Firefox mobile) for major FPS gain
    if (this.lowPerf && !this._shadowPatched) {
      this._shadowPatched = true;
      const proto = Object.getPrototypeOf(ctx);
      const origSBDesc = Object.getOwnPropertyDescriptor(proto, 'shadowBlur');
      const origSCDesc = Object.getOwnPropertyDescriptor(proto, 'shadowColor');
      if (origSBDesc) Object.defineProperty(ctx, 'shadowBlur', { set() {}, get() { return 0; }, configurable: true });
      if (origSCDesc) Object.defineProperty(ctx, 'shadowColor', { set() {}, get() { return 'transparent'; }, configurable: true });
    }
    this.renderer.render(ctx);
    ctx.restore();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // ==================== SHARE ====================
  generateShareLink() {
    const params = new URLSearchParams();
    params.set('s', this.totalScore);
    params.set('l', this.level);
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }

  checkShareLink() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('s')) {
      this.sharedScore = parseInt(params.get('s')) || 0;
      this.sharedLevel = parseInt(params.get('l')) || 1;
      this.state = 'SHARED';
    }
  }

  copyShareLink() {
    const link = this.generateShareLink();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        this.scorePopups.push({ x: TW / 2, y: 480 * S, text: 'Link copied!', life: 1.5, vy: -1 });
      }).catch(() => this.fallbackCopy(link));
    } else {
      this.fallbackCopy(link);
    }
  }

  fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    this.scorePopups.push({ x: TW / 2, y: 480 * S, text: 'Link copied!', life: 1.5, vy: -1 });
  }
}

// ==================== SHARE CLICK HANDLER ====================
export function setupShareClick(game) {
  game.canvas.addEventListener('click', (e) => {
    if (game.state !== 'GAME_OVER' && game.state !== 'VICTORY') return;
    if (!game._shareButtonBounds) return;
    const rect = game.canvas.getBoundingClientRect();
    const gx = (e.clientX - rect.left) / game.scaleX;
    const gy = (e.clientY - rect.top) / game.scaleY;
    const b = game._shareButtonBounds;
    if (gx >= b.x && gx <= b.x + b.w && gy >= b.y && gy <= b.y + b.h) {
      e.stopPropagation();
      game._shareClicked = true;
      game.copyShareLink();
    }
  });

  game.canvas.addEventListener('touchstart', (e) => {
    if (game.state !== 'GAME_OVER' && game.state !== 'VICTORY') return;
    if (!game._shareButtonBounds) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const pos = game.touchToGame(touch.clientX, touch.clientY);
    const b = game._shareButtonBounds;
    if (pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) {
      e.stopPropagation();
      e.preventDefault();
      game._shareClicked = true;
      game.copyShareLink();
      return;
    }
    // Replay button (Victory screen only)
    if (game.state === 'VICTORY' && game._replayButtonBounds) {
      const r = game._replayButtonBounds;
      if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
        e.stopPropagation();
        e.preventDefault();
        game._shareClicked = true;
        game.restartGame();
      }
    }
  }, { passive: false });

  // Replay button click handler (desktop)
  game.canvas.addEventListener('click', (e) => {
    if (game.state !== 'VICTORY') return;
    if (!game._replayButtonBounds) return;
    const rect = game.canvas.getBoundingClientRect();
    const gx = (e.clientX - rect.left) / game.scaleX;
    const gy = (e.clientY - rect.top) / game.scaleY;
    const r = game._replayButtonBounds;
    if (gx >= r.x && gx <= r.x + r.w && gy >= r.y && gy <= r.y + r.h) {
      e.stopPropagation();
      game._shareClicked = true;
      game.restartGame();
    }
  });
}
