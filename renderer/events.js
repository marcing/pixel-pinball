import { TW, TH, S } from '../constants.js';

export function renderUfoFlyby(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._ufo && !this._ufoScheduled) {
    const delay = this._ufoNextTime === 0
      ? 24 + Math.random() * 20
      : 65 + Math.random() * 65;
    this._ufoNextTime = t + delay;
    this._ufoScheduled = true;
  }

  if (!this._ufo && this._ufoScheduled && t >= this._ufoNextTime) {
    const goRight = Math.random() > 0.5;
    const yBand = 80 + Math.random() * (TH * 0.5);
    const size = (35 + Math.random() * 30) * S;
    const speed = (40 + Math.random() * 50) * S;
    const wobbleAmp = 8 + Math.random() * 12;
    const wobbleFreq = 1.5 + Math.random() * 2;
    this._ufo = {
      startX: goRight ? -size : TW + size,
      endX: goRight ? TW + size : -size,
      y: yBand, size, speed,
      dir: goRight ? 1 : -1,
      wobbleAmp, wobbleFreq,
      startTime: t, tilt: 0
    };
    this._ufoScheduled = false;
  }

  if (this._ufo) {
    const u = this._ufo;
    const elapsed = t - u.startTime;
    const totalDist = Math.abs(u.endX - u.startX);
    const progress = (elapsed * u.speed) / totalDist;

    if (progress > 1) { this._ufo = null; return; }

    const x = u.startX + (u.endX - u.startX) * progress;
    const wobble = Math.sin(t * u.wobbleFreq) * u.wobbleAmp;
    const y = u.y + wobble;
    const tilt = Math.cos(t * u.wobbleFreq) * 0.08 * u.dir;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);

    if (!g.lowPerf) {
      const glowR = u.size * 0.8;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
      glow.addColorStop(0, c.a + '12');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(-glowR, -glowR, glowR * 2, glowR * 2);
    }

    ctx.globalAlpha = 0.10 + Math.sin(t * 3) * 0.03;
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 1.5;

    const s = u.size;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.12, s * 0.18, s * 0.2, 0, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.45, s * 0.14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, s * 0.06, s * 0.3, s * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();

    const lightColors = [c.p, c.s, c.a];
    ctx.fillStyle = c.a;
    for (let i = -2; i <= 2; i++) {
      const lc = lightColors[((i + 2) + Math.floor(t * 4)) % 3];
      ctx.fillStyle = lc;
      ctx.globalAlpha = 0.15 + Math.sin(t * 5 + i * 1.5) * 0.08;
      ctx.beginPath();
      ctx.arc(i * s * 0.12, s * 0.15, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.18);
    ctx.lineTo(s * 0.15, s * 0.18);
    ctx.lineTo(s * 0.25, s * 0.45);
    ctx.lineTo(-s * 0.25, s * 0.45);
    ctx.closePath();
    const beamPulse = 0.03 + Math.sin(t * 4) * 0.015;
    ctx.globalAlpha = beamPulse;
    ctx.fillStyle = c.a;
    ctx.fill();

    ctx.restore();
  }
}

export function renderRocketFlyby(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._rocket && !this._rocketScheduled) {
    const delay = this._rocketNextTime === 0
      ? 32 + Math.random() * 24
      : 80 + Math.random() * 80;
    this._rocketNextTime = t + delay;
    this._rocketScheduled = true;
  }

  if (!this._rocket && this._rocketScheduled && t >= this._rocketNextTime) {
    const x = 60 + Math.random() * (TW - 120);
    const drift = (Math.random() - 0.5) * 40 * S;
    const size = (25 + Math.random() * 20) * S;
    const speed = (60 + Math.random() * 80) * S;
    this._rocket = {
      x, drift, size, speed,
      startTime: t,
      wobblePhase: Math.random() * Math.PI * 2,
      startY: TH + size,
      endY: -size * 2
    };
    this._rocketScheduled = false;
  }

  if (this._rocket) {
    const r = this._rocket;
    const elapsed = t - r.startTime;
    const totalDist = r.startY - r.endY;
    const progress = (elapsed * r.speed) / totalDist;

    if (progress > 1) { this._rocket = null; return; }

    const y = r.startY + (r.endY - r.startY) * progress;
    const x = r.x + r.drift * progress + Math.sin(t * 2 + r.wobblePhase) * 6;
    const s = r.size;

    ctx.save();
    ctx.translate(x, y);

    if (!g.lowPerf) {
      const flameLen = s * (1.2 + Math.sin(t * 12) * 0.3);
      const flameGrad = ctx.createLinearGradient(0, s * 0.3, 0, s * 0.3 + flameLen);
      flameGrad.addColorStop(0, c.p + '30');
      flameGrad.addColorStop(0.3, c.s + '18');
      flameGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, s * 0.3);
      ctx.lineTo(s * 0.1, s * 0.3);
      ctx.lineTo(s * 0.04, s * 0.3 + flameLen);
      ctx.lineTo(-s * 0.04, s * 0.3 + flameLen);
      ctx.closePath();
      ctx.globalAlpha = 0.25;
      ctx.fill();

      for (let i = 1; i <= 5; i++) {
        const py = s * 0.3 + flameLen * 0.3 + i * s * 0.25;
        const px = Math.sin(t * 6 + i * 2.3) * s * 0.08;
        const smokeAlpha = 0.06 * (1 - i / 6);
        ctx.globalAlpha = smokeAlpha;
        ctx.fillStyle = '#AAA';
        ctx.beginPath();
        ctx.arc(px, py, s * 0.04 + i * s * 0.015, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 0.10 + Math.sin(t * 4) * 0.02;
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(-s * 0.13, -s * 0.15);
    ctx.lineTo(s * 0.13, -s * 0.15);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.13, -s * 0.15);
    ctx.lineTo(-s * 0.13, s * 0.25);
    ctx.lineTo(s * 0.13, s * 0.25);
    ctx.lineTo(s * 0.13, -s * 0.15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.13, s * 0.15);
    ctx.lineTo(-s * 0.28, s * 0.35);
    ctx.lineTo(-s * 0.13, s * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.13, s * 0.15);
    ctx.lineTo(s * 0.28, s * 0.35);
    ctx.lineTo(s * 0.13, s * 0.25);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.06, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = c.p;
    ctx.globalAlpha = 0.10 + Math.sin(t * 10) * 0.05;
    ctx.beginPath();
    ctx.arc(0, s * 0.28, s * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export function renderShootingStar(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._star && !this._starScheduled) {
    const delay = this._starNextTime === 0 ? 20 + Math.random() * 20 : 40 + Math.random() * 55;
    this._starNextTime = t + delay;
    this._starScheduled = true;
  }
  if (!this._star && this._starScheduled && t >= this._starNextTime) {
    const fromLeft = Math.random() > 0.3;
    const startX = fromLeft ? -20 : TW + 20;
    const startY = Math.random() * TH * 0.4;
    const angle = fromLeft ? (0.3 + Math.random() * 0.5) : (Math.PI - 0.3 - Math.random() * 0.5);
    this._star = {
      startX, startY, angle,
      speed: (300 + Math.random() * 400) * S,
      startTime: t,
      length: (60 + Math.random() * 80) * S,
      life: 0.8 + Math.random() * 0.6,
      sparkles: []
    };
    for (let i = 0; i < 12; i++) {
      this._star.sparkles.push({
        offset: Math.random() * 0.8,
        dx: (Math.random() - 0.5) * 10,
        dy: (Math.random() - 0.5) * 10,
        size: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
    this._starScheduled = false;
  }

  if (this._star) {
    const s = this._star;
    const elapsed = t - s.startTime;
    if (elapsed > s.life) { this._star = null; return; }
    const progress = elapsed / s.life;
    const x = s.startX + Math.cos(s.angle) * s.speed * elapsed;
    const y = s.startY + Math.sin(s.angle) * s.speed * elapsed;
    const fade = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;

    ctx.save();
    const tailX = x - Math.cos(s.angle) * s.length;
    const tailY = y - Math.sin(s.angle) * s.length;
    const grad = ctx.createLinearGradient(tailX, tailY, x, y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.7, c.a + '20');
    grad.addColorStop(1, '#FFFFFF');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.globalAlpha = fade * 0.3;
    ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(x, y); ctx.stroke();

    ctx.globalAlpha = fade * 0.5;
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();

    if (!g.lowPerf) {
      for (const sp of s.sparkles) {
        const sx = tailX + (x - tailX) * (1 - sp.offset) + sp.dx;
        const sy = tailY + (y - tailY) * (1 - sp.offset) + sp.dy;
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * 8 + sp.phase));
        ctx.globalAlpha = fade * 0.15 * twinkle;
        ctx.fillStyle = sp.offset > 0.5 ? c.a : '#FFF';
        ctx.beginPath(); ctx.arc(sx, sy, sp.size, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
}

export function renderInvaderMarch(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._invaders && !this._invScheduled) {
    const delay = this._invNextTime === 0 ? 40 + Math.random() * 24 : 88 + Math.random() * 95;
    this._invNextTime = t + delay;
    this._invScheduled = true;
  }
  if (!this._invaders && this._invScheduled && t >= this._invNextTime) {
    const goRight = Math.random() > 0.5;
    const count = 3 + Math.floor(Math.random() * 2);
    const y = 100 + Math.random() * (TH * 0.45);
    const size = (6 + Math.random() * 4) * S;
    const spacing = size * 3.5;
    this._invaders = {
      goRight, y, size, spacing, count,
      startX: goRight ? -count * spacing : TW + count * spacing,
      speed: (30 + Math.random() * 30) * S,
      startTime: t,
      bobAmp: 8 * S,
      bobFreq: 2 + Math.random()
    };
    this._invScheduled = false;
  }

  if (this._invaders) {
    const inv = this._invaders;
    const elapsed = t - inv.startTime;
    const dx = inv.speed * elapsed * (inv.goRight ? 1 : -1);
    const baseX = inv.startX + dx;

    const leadX = baseX + (inv.goRight ? inv.count * inv.spacing : -inv.count * inv.spacing);
    if ((inv.goRight && baseX > TW + 50) || (!inv.goRight && leadX < -50)) {
      this._invaders = null; return;
    }

    ctx.save();
    const pattern = [
      [0,1,0,0,0,1,0],
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [1,0,1,1,1,0,1],
      [1,0,1,0,1,0,1],
    ];
    const frame = Math.floor(t * 3) % 2;
    const legs = frame === 0
      ? [[1,0,0,0,0,0,1], [0,1,0,0,0,1,0]]
      : [[0,0,1,0,1,0,0], [0,1,0,0,0,1,0]];

    const colors = [c.p, c.s, c.a];
    for (let i = 0; i < inv.count; i++) {
      const ix = baseX + i * inv.spacing;
      const bob = Math.sin(t * inv.bobFreq + i * 0.8) * inv.bobAmp;
      const iy = inv.y + bob;
      const ps = inv.size * 0.18;
      const color = colors[i % 3];
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.10;

      const allRows = [...pattern, ...legs];
      const ox = ix - (7 * ps) / 2;
      const oy = iy - (allRows.length * ps) / 2;
      for (let r = 0; r < allRows.length; r++) {
        for (let col = 0; col < allRows[r].length; col++) {
          if (allRows[r][col]) ctx.fillRect(ox + col * ps, oy + r * ps, ps, ps);
        }
      }
    }
    ctx.restore();
  }
}

export function renderPacmanChase(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._pacman && !this._pacScheduled) {
    const delay = this._pacNextTime === 0 ? 48 + Math.random() * 32 : 95 + Math.random() * 110;
    this._pacNextTime = t + delay;
    this._pacScheduled = true;
  }
  if (!this._pacman && this._pacScheduled && t >= this._pacNextTime) {
    const goRight = Math.random() > 0.5;
    const y = 120 + Math.random() * (TH * 0.5);
    const size = (14 + Math.random() * 8) * S;
    const powered = Math.random() > 0.6;
    this._pacman = {
      goRight, y, size, powered,
      startX: goRight ? -size * 8 : TW + size * 8,
      speed: (45 + Math.random() * 35) * S,
      startTime: t,
      dotSpacing: size * 2.2,
      dotCount: 8
    };
    this._pacScheduled = false;
  }

  if (this._pacman) {
    const p = this._pacman;
    const elapsed = t - p.startTime;
    const dir = p.goRight ? 1 : -1;
    const baseX = p.startX + p.speed * elapsed * dir;

    if ((p.goRight && baseX > TW + p.size * 10) || (!p.goRight && baseX < -p.size * 10)) {
      this._pacman = null; return;
    }

    ctx.save();
    const s = p.size;

    ctx.fillStyle = c.s;
    ctx.globalAlpha = 0.08;
    for (let i = 1; i <= p.dotCount; i++) {
      const dotX = baseX + dir * (s * 2 + i * p.dotSpacing) * (p.powered ? -1 : 1);
      const pacPos = p.powered ? baseX - dir * s * 1.5 : baseX;
      const eaten = p.goRight ? dotX < pacPos : dotX > pacPos;
      if (!eaten) {
        ctx.beginPath();
        ctx.arc(dotX, p.y, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const pacX = baseX;
    const mouth = Math.abs(Math.sin(t * 10)) * 0.8;
    const startAngle = p.goRight ? mouth * 0.4 : Math.PI + mouth * 0.4;
    const endAngle = p.goRight ? Math.PI * 2 - mouth * 0.4 : Math.PI - mouth * 0.4;
    ctx.fillStyle = '#FFEA00';
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(pacX, p.y);
    ctx.arc(pacX, p.y, s, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    const ghostOffset = p.powered ? s * 3.5 : -s * 3.5;
    const ghostX = baseX + ghostOffset * dir;
    const ghostColor = p.powered ? '#2222FF' : '#FF0000';
    ctx.fillStyle = ghostColor;
    ctx.globalAlpha = 0.10;
    ctx.beginPath();
    ctx.arc(ghostX, p.y - s * 0.15, s * 0.7, Math.PI, 0);
    ctx.lineTo(ghostX + s * 0.7, p.y + s * 0.5);
    for (let i = 0; i < 3; i++) {
      const bx = ghostX + s * 0.7 - (i + 1) * s * (1.4 / 3);
      ctx.lineTo(bx + s * 0.23, p.y + s * 0.25);
      ctx.lineTo(bx, p.y + s * 0.5);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.arc(ghostX - s * 0.2, p.y - s * 0.2, s * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ghostX + s * 0.2, p.y - s * 0.2, s * 0.13, 0, Math.PI * 2); ctx.fill();
    if (!p.powered) {
      ctx.fillStyle = '#00F'; ctx.globalAlpha = 0.15;
      const eyeDir = dir * s * 0.05;
      ctx.beginPath(); ctx.arc(ghostX - s * 0.2 + eyeDir, p.y - s * 0.2, s * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ghostX + s * 0.2 + eyeDir, p.y - s * 0.2, s * 0.06, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }
}

export function renderTetromino(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._tetro && !this._tetroScheduled) {
    const delay = this._tetroNextTime === 0 ? 36 + Math.random() * 24 : 80 + Math.random() * 88;
    this._tetroNextTime = t + delay;
    this._tetroScheduled = true;
  }
  if (!this._tetro && this._tetroScheduled && t >= this._tetroNextTime) {
    const shapes = [
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[1,1],[1,2]],
      [[0,2],[1,0],[1,1],[1,2]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,1],[1,0],[1,1],[1,2]],
    ];
    const colors = ['#00FFFF','#FFEA00','#2979FF','#FF6D00','#00E676','#FF1744','#AA00FF'];
    const idx = Math.floor(Math.random() * shapes.length);
    this._tetro = {
      shape: shapes[idx],
      color: colors[idx],
      x: 60 + Math.random() * (TW - 120),
      startTime: t,
      speed: (25 + Math.random() * 40) * S,
      rotSpeed: 0.4 + Math.random() * 0.8,
      blockSize: (6 + Math.random() * 4) * S,
      drift: (Math.random() - 0.5) * 20 * S,
      startY: -40 * S
    };
    this._tetroScheduled = false;
  }

  if (this._tetro) {
    const tr = this._tetro;
    const elapsed = t - tr.startTime;
    const y = tr.startY + tr.speed * elapsed;
    const x = tr.x + tr.drift * (elapsed / 10) + Math.sin(t * 0.8) * 5;
    const rot = elapsed * tr.rotSpeed;

    if (y > TH + 60 * S) { this._tetro = null; return; }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = tr.color;
    ctx.strokeStyle = tr.color;
    ctx.lineWidth = 1;

    const bs = tr.blockSize;
    const cx = 1.5 * bs, cy = 1 * bs;
    for (const [r, col] of tr.shape) {
      const bx = col * bs - cx;
      const by = r * bs - cy;
      ctx.fillRect(bx, by, bs - 1, bs - 1);
      ctx.globalAlpha = 0.15;
      ctx.strokeRect(bx, by, bs - 1, bs - 1);
      ctx.globalAlpha = 0.10;
    }
    ctx.restore();
  }
}

export function renderPixelBat(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._bat && !this._batScheduled) {
    const delay = this._batNextTime === 0 ? 48 + Math.random() * 32 : 88 + Math.random() * 105;
    this._batNextTime = t + delay;
    this._batScheduled = true;
  }
  if (!this._bat && this._batScheduled && t >= this._batNextTime) {
    const goRight = Math.random() > 0.5;
    this._bat = {
      goRight,
      x: goRight ? -30 * S : TW + 30 * S,
      y: 80 + Math.random() * TH * 0.4,
      size: (12 + Math.random() * 8) * S,
      speedX: (25 + Math.random() * 35) * S,
      startTime: t,
      yWave1: { amp: 30 + Math.random() * 50, freq: 1.5 + Math.random() * 2 },
      yWave2: { amp: 10 + Math.random() * 20, freq: 3 + Math.random() * 3 },
      wingSpeed: 8 + Math.random() * 4
    };
    this._batScheduled = false;
  }

  if (this._bat) {
    const b = this._bat;
    const elapsed = t - b.startTime;
    const dir = b.goRight ? 1 : -1;
    const x = b.x + b.speedX * elapsed * dir;
    const y = b.y
      + Math.sin(t * b.yWave1.freq) * b.yWave1.amp
      + Math.sin(t * b.yWave2.freq) * b.yWave2.amp;

    if ((b.goRight && x > TW + 50) || (!b.goRight && x < -50)) {
      this._bat = null; return;
    }

    const s = b.size;
    const wing = Math.sin(t * b.wingSpeed);
    const wingAngle = wing * 0.6;

    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = c.a;
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.15, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.05);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.5, -s * 0.7, -s * 0.1);
    ctx.quadraticCurveTo(-s * 0.6, s * 0.05, -s * 0.35, s * 0.05);
    ctx.lineTo(-s * 0.1, s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.02);
    ctx.lineTo(-s * 0.55, -s * 0.35);
    ctx.moveTo(-s * 0.35, 0);
    ctx.lineTo(-s * 0.65, -s * 0.15);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.rotate(-wingAngle);
    ctx.globalAlpha = 0.10;
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.05);
    ctx.quadraticCurveTo(s * 0.5, -s * 0.5, s * 0.7, -s * 0.1);
    ctx.quadraticCurveTo(s * 0.6, s * 0.05, s * 0.35, s * 0.05);
    ctx.lineTo(s * 0.1, s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.moveTo(s * 0.25, -s * 0.02);
    ctx.lineTo(s * 0.55, -s * 0.35);
    ctx.moveTo(s * 0.35, 0);
    ctx.lineTo(s * 0.65, -s * 0.15);
    ctx.stroke();
    ctx.restore();

    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(-s * 0.07, -s * 0.12, s * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.07, -s * 0.12, s * 0.04, 0, Math.PI * 2); ctx.fill();

    ctx.globalAlpha = 0.10;
    ctx.fillStyle = c.a;
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.22);
    ctx.lineTo(-s * 0.15, -s * 0.35);
    ctx.lineTo(-s * 0.02, -s * 0.22);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.22);
    ctx.lineTo(s * 0.15, -s * 0.35);
    ctx.lineTo(s * 0.02, -s * 0.22);
    ctx.fill();

    ctx.restore();
  }
}

export function renderInsertCoin(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;

  if (!this._insertCoin && !this._coinScheduled) {
    const delay = this._coinNextTime === 0 ? 55 + Math.random() * 32 : 95 + Math.random() * 110;
    this._coinNextTime = t + delay;
    this._coinScheduled = true;
  }
  if (!this._insertCoin && this._coinScheduled && t >= this._coinNextTime) {
    const texts = ['INSERT COIN', 'PRESS START', 'PLAYER 1', 'READY!', 'GAME ON', 'HIGH SCORE'];
    this._insertCoin = {
      text: texts[Math.floor(Math.random() * texts.length)],
      startTime: t,
      life: 2.5 + Math.random() * 1.5,
      y: 150 + Math.random() * (TH * 0.4),
      x: TW * 0.2 + Math.random() * TW * 0.6,
      size: (12 + Math.random() * 6) * S,
      flicker: 3 + Math.random() * 4
    };
    this._coinScheduled = false;
  }

  if (this._insertCoin) {
    const ic = this._insertCoin;
    const elapsed = t - ic.startTime;
    if (elapsed > ic.life) { this._insertCoin = null; return; }

    const fadeIn = Math.min(elapsed / 0.3, 1);
    const fadeOut = Math.min((ic.life - elapsed) / 0.5, 1);
    const envelope = fadeIn * fadeOut;

    const blink = Math.sin(t * ic.flicker) > -0.2 ? 1 : 0;

    if (blink) {
      ctx.save();
      ctx.globalAlpha = envelope * 0.08;
      ctx.font = 'bold ' + Math.floor(ic.size) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (!g.lowPerf) {
        ctx.shadowColor = c.p;
        ctx.shadowBlur = 15;
      }

      ctx.fillStyle = c.p;
      ctx.fillText(ic.text, ic.x, ic.y);

      ctx.globalAlpha = envelope * 0.03;
      ctx.fillStyle = '#FF0000';
      ctx.fillText(ic.text, ic.x - 1.5, ic.y);
      ctx.fillStyle = '#00FFFF';
      ctx.fillText(ic.text, ic.x + 1.5, ic.y);

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }
}

export function renderSatellite(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = g.getLevelCfg().colors;

  if (!this._sat && !this._satScheduled) {
    const delay = this._satNextTime === 0
      ? 40 + Math.random() * 40
      : 88 + Math.random() * 112;
    this._satNextTime = t + delay;
    this._satScheduled = true;
  }

  if (!this._sat && this._satScheduled && t >= this._satNextTime) {
    const goRight = Math.random() > 0.5;
    const size = (25 + Math.random() * 20) * S;
    const speed = (25 + Math.random() * 35) * S;
    const yStart = 60 + Math.random() * (TH * 0.4);
    const yEnd = yStart + (Math.random() - 0.5) * TH * 0.25;
    this._sat = {
      startX: goRight ? -size * 2 : TW + size * 2,
      endX: goRight ? TW + size * 2 : -size * 2,
      yStart, yEnd, size, speed,
      dir: goRight ? 1 : -1,
      startTime: t,
      panelAngle: Math.random() * Math.PI,
      tumbleSpeed: 0.3 + Math.random() * 0.6
    };
    this._satScheduled = false;
  }

  if (this._sat) {
    const sat = this._sat;
    const elapsed = t - sat.startTime;
    const totalDist = Math.abs(sat.endX - sat.startX);
    const progress = (elapsed * sat.speed) / totalDist;

    if (progress > 1) {
      this._sat = null;
      return;
    }

    const x = sat.startX + (sat.endX - sat.startX) * progress;
    const y = sat.yStart + (sat.yEnd - sat.yStart) * progress;
    const s = sat.size;
    const bodyAngle = Math.sin(t * sat.tumbleSpeed) * 0.15;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(bodyAngle);
    ctx.globalAlpha = 0.12 + Math.sin(t * 2) * 0.03;
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 1.5;

    const bw = s * 0.25, bh = s * 0.2;
    ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

    const pw = s * 0.4, ph = s * 0.18;
    const panelGap = bw / 2 + 2;

    ctx.strokeRect(-panelGap - pw, -ph / 2, pw, ph);
    ctx.globalAlpha *= 0.6;
    for (let i = 1; i <= 3; i++) {
      const lx = -panelGap - pw + (pw / 4) * i;
      ctx.beginPath(); ctx.moveTo(lx, -ph / 2); ctx.lineTo(lx, ph / 2); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-panelGap - pw, 0); ctx.lineTo(-panelGap, 0); ctx.stroke();
    ctx.globalAlpha = 0.12 + Math.sin(t * 2) * 0.03;

    ctx.strokeRect(panelGap, -ph / 2, pw, ph);
    ctx.globalAlpha *= 0.6;
    for (let i = 1; i <= 3; i++) {
      const lx = panelGap + (pw / 4) * i;
      ctx.beginPath(); ctx.moveTo(lx, -ph / 2); ctx.lineTo(lx, ph / 2); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(panelGap, 0); ctx.lineTo(panelGap + pw, 0); ctx.stroke();
    ctx.globalAlpha = 0.12 + Math.sin(t * 2) * 0.03;

    ctx.beginPath();
    ctx.moveTo(0, -bh / 2);
    ctx.lineTo(0, -bh / 2 - s * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -bh / 2 - s * 0.15, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = c.s;
    ctx.fill();

    if (Math.sin(t * 4) > 0.3) {
      ctx.fillStyle = c.p;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export function renderMarioChase(ctx) {
  const g = this.g;
  const t = g.animTime;

  if (!this._mario && !this._marioScheduled) {
    const delay = this._marioNextTime === 0
      ? 55 + Math.random() * 55
      : 105 + Math.random() * 130;
    this._marioNextTime = t + delay;
    this._marioScheduled = true;
  }

  if (!this._mario && this._marioScheduled && t >= this._marioNextTime) {
    const goRight = Math.random() > 0.5;
    const yBand = 150 + Math.random() * (TH * 0.45);
    const size = (30 + Math.random() * 15) * S;
    const speed = (50 + Math.random() * 40) * S;
    this._mario = {
      startX: goRight ? -size * 4 : TW + size * 4,
      endX: goRight ? TW + size * 4 : -size * 4,
      y: yBand, size, speed,
      dir: goRight ? 1 : -1,
      startTime: t, gap: size * 2.5
    };
    this._marioScheduled = false;
  }

  if (this._mario) {
    const m = this._mario;
    const elapsed = t - m.startTime;
    const totalDist = Math.abs(m.endX - m.startX);
    const progress = (elapsed * m.speed) / totalDist;

    if (progress > 1) {
      this._mario = null;
      return;
    }

    const baseX = m.startX + (m.endX - m.startX) * progress;
    const s = m.size;
    const p = s / 10;
    const runFrame = Math.floor(t * 6) % 2;
    const bounce = Math.sin(t * 10) * p * 1.5;

    ctx.globalAlpha = 0.12 + Math.sin(t * 2.5) * 0.03;

    // Princess
    const px = baseX + m.gap * m.dir;
    const py = m.y + bounce;
    ctx.save();
    ctx.translate(px, py);
    if (m.dir < 0) { ctx.scale(-1, 1); }

    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(-3 * p, -2 * p, 6 * p, 5 * p);
    ctx.fillRect(-4 * p, 3 * p, 8 * p, 2 * p);
    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(-2 * p, -5 * p, 4 * p, 3 * p);
    ctx.fillStyle = '#336';
    ctx.fillRect(-1 * p, -4 * p, p, p);
    ctx.fillRect(1 * p, -4 * p, p, p);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-2 * p, -7 * p, 4 * p, 2 * p);
    ctx.fillRect(-3 * p, -8 * p, p, p);
    ctx.fillRect(0, -8 * p, p, p);
    ctx.fillRect(2 * p, -8 * p, p, p);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-3 * p, -5 * p, p, 4 * p);
    ctx.fillRect(2 * p, -5 * p, p, 4 * p);
    ctx.fillStyle = '#FFDAB9';
    if (runFrame === 0) {
      ctx.fillRect(-2 * p, 5 * p, 2 * p, 3 * p);
      ctx.fillRect(1 * p, 5 * p, 2 * p, 2 * p);
    } else {
      ctx.fillRect(-1 * p, 5 * p, 2 * p, 2 * p);
      ctx.fillRect(0, 5 * p, 2 * p, 3 * p);
    }
    ctx.restore();

    // Mario
    const mx = baseX;
    const my = m.y + bounce;
    ctx.save();
    ctx.translate(mx, my);
    if (m.dir < 0) { ctx.scale(-1, 1); }

    ctx.fillStyle = '#E00';
    ctx.fillRect(-2 * p, -7 * p, 5 * p, 2 * p);
    ctx.fillRect(-3 * p, -6 * p, 2 * p, p);
    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(-2 * p, -5 * p, 4 * p, 3 * p);
    ctx.fillStyle = '#336';
    ctx.fillRect(-1 * p, -4 * p, p, p);
    ctx.fillRect(1 * p, -4 * p, p, p);
    ctx.fillStyle = '#421';
    ctx.fillRect(-2 * p, -3 * p, 4 * p, p);
    ctx.fillStyle = '#22E';
    ctx.fillRect(-3 * p, -1 * p, 6 * p, 4 * p);
    ctx.fillStyle = '#E00';
    ctx.fillRect(-3 * p, -2 * p, 6 * p, 2 * p);
    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(3 * p, -2 * p, 2 * p, p);
    ctx.fillRect(-4 * p, -1 * p, p, p);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-1 * p, 0, p, p);
    ctx.fillRect(1 * p, 0, p, p);
    ctx.fillStyle = '#22E';
    if (runFrame === 0) {
      ctx.fillRect(-2 * p, 3 * p, 2 * p, 2 * p);
      ctx.fillRect(1 * p, 3 * p, 2 * p, 3 * p);
    } else {
      ctx.fillRect(-2 * p, 3 * p, 2 * p, 3 * p);
      ctx.fillRect(1 * p, 3 * p, 2 * p, 2 * p);
    }
    ctx.fillStyle = '#631';
    const legOff = runFrame === 0 ? 0 : p;
    ctx.fillRect(-2 * p, 5 * p + legOff, 3 * p, p);
    ctx.fillRect(1 * p, 5 * p + (runFrame === 0 ? p : 0), 3 * p, p);

    ctx.restore();

    // Heart
    const hx = baseX + m.gap * m.dir * 0.5;
    const hy = m.y - s * 0.8 + Math.sin(t * 3) * p * 3;
    ctx.fillStyle = '#F44';
    ctx.globalAlpha = 0.1 + Math.sin(t * 4) * 0.04;
    const hs = p * 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, hy + hs * 0.3);
    ctx.bezierCurveTo(hx - hs, hy - hs * 0.5, hx - hs * 0.5, hy - hs * 1.2, hx, hy - hs * 0.5);
    ctx.bezierCurveTo(hx + hs * 0.5, hy - hs * 1.2, hx + hs, hy - hs * 0.5, hx, hy + hs * 0.3);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

export function renderSaturn(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = g.getLevelCfg().colors;

  if (!this._saturn && !this._saturnScheduled) {
    const delay = this._saturnNextTime === 0
      ? 48 + Math.random() * 48
      : 95 + Math.random() * 120;
    this._saturnNextTime = t + delay;
    this._saturnScheduled = true;
  }

  if (!this._saturn && this._saturnScheduled && t >= this._saturnNextTime) {
    const goRight = Math.random() > 0.5;
    const size = (25 + Math.random() * 15) * S;
    const speed = (15 + Math.random() * 20) * S;
    const yStart = 80 + Math.random() * (TH * 0.4);
    const yEnd = yStart + (Math.random() - 0.5) * TH * 0.15;
    this._saturn = {
      startX: goRight ? -size * 3 : TW + size * 3,
      endX: goRight ? TW + size * 3 : -size * 3,
      yStart, yEnd, size, speed,
      dir: goRight ? 1 : -1,
      startTime: t,
      tilt: 0.3 + Math.random() * 0.25,
      rotSpeed: 0.15 + Math.random() * 0.2
    };
    this._saturnScheduled = false;
  }

  if (this._saturn) {
    const sat = this._saturn;
    const elapsed = t - sat.startTime;
    const totalDist = Math.abs(sat.endX - sat.startX);
    const progress = (elapsed * sat.speed) / totalDist;

    if (progress > 1) {
      this._saturn = null;
      return;
    }

    const x = sat.startX + (sat.endX - sat.startX) * progress;
    const y = sat.yStart + (sat.yEnd - sat.yStart) * progress;
    const s = sat.size;
    const bodyR = s * 0.3;
    const rot = Math.sin(t * sat.rotSpeed) * 0.08;
    const alpha = 0.1 + Math.sin(t * 1.5) * 0.03;

    const ringTilt = sat.tilt + Math.sin(t * 0.4) * 0.08;
    const ringW = s * 0.9;
    const ringH = ringW * ringTilt;
    const ringRot = t * 0.15;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Back half of rings
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = alpha * 0.6;

    ctx.beginPath();
    ctx.ellipse(0, 0, ringW, ringH, ringRot, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, ringW * 0.82, ringH * 0.82, ringRot, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringW * 0.68, ringH * 0.68, ringRot, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Planet body (occludes back rings)
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#0a0a1a';
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.s;
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.ellipse(0, -bodyR * 0.2, bodyR * 0.85, bodyR * 0.08, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, bodyR * 0.25, bodyR * 0.7, bodyR * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Front half of rings
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(0, 0, ringW, ringH, ringRot, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, ringW * 0.82, ringH * 0.82, ringRot, 0, Math.PI);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringW * 0.68, ringH * 0.68, ringRot, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}

// ==================== KLINGON BIRD OF PREY ====================
export function renderBirdOfPrey(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = g.getLevelCfg().colors;

  // Schedule
  if (!this._bop && !this._bopScheduled) {
    const delay = this._bopNextTime === 0
      ? 55 + Math.random() * 48
      : 95 + Math.random() * 130;
    this._bopNextTime = t + delay;
    this._bopScheduled = true;
  }

  // Spawn
  if (!this._bop && this._bopScheduled && t >= this._bopNextTime) {
    const goRight = Math.random() > 0.5;
    const size = (40 + Math.random() * 20) * S;
    const speed = (30 + Math.random() * 25) * S;
    const yStart = 100 + Math.random() * (TH * 0.35);
    const yEnd = yStart + (Math.random() - 0.5) * TH * 0.2;
    this._bop = {
      startX: goRight ? -size * 3 : TW + size * 3,
      endX: goRight ? TW + size * 3 : -size * 3,
      yStart, yEnd, size, speed,
      dir: goRight ? 1 : -1,
      startTime: t,
      torpedosFired: false,
      torpedos: []
    };
    this._bopScheduled = false;
  }

  // Render
  if (this._bop) {
    const b = this._bop;
    const elapsed = t - b.startTime;
    const totalDist = Math.abs(b.endX - b.startX);
    const progress = (elapsed * b.speed) / totalDist;

    if (progress > 1) {
      this._bop = null;
      return;
    }

    const x = b.startX + (b.endX - b.startX) * progress;
    const y = b.yStart + (b.yEnd - b.yStart) * progress;
    const s = b.size;
    const p = s / 14;
    const wobble = Math.sin(t * 1.2) * p;

    // Wing tip positions (for torpedoes, in local coords before dir flip)
    const wingTipTopY = -9 * p;
    const wingTipBotY = 9 * p;
    const wingTipX = -7 * p;

    // Fire torpedoes when in middle of screen
    if (!b.torpedosFired && x > TW * 0.3 && x < TW * 0.7) {
      b.torpedosFired = true;
      b.torpedoTime = t;
      const tipXWorld = x + wingTipX * b.dir;
      b.torpedos = [
        { sx: tipXWorld, sy: y + wobble + wingTipTopY, time: t },
        { sx: tipXWorld, sy: y + wobble + wingTipBotY, time: t + 0.1 }
      ];
    }

    ctx.save();
    ctx.translate(x, y + wobble);
    if (b.dir < 0) ctx.scale(-1, 1);
    const alpha = 0.12 + Math.sin(t * 2) * 0.03;

    // Klingon green color scheme
    const kGreen = '#2a6e2a';
    const kGreenLight = '#3a8a3a';
    const kGreenDark = '#1a4a1a';

    // === Wings — swept-back, movie-style bird shape (filled green) ===

    // Top wing
    ctx.globalAlpha = alpha;
    ctx.fillStyle = kGreen;
    ctx.beginPath();
    ctx.moveTo(-1 * p, -2 * p);
    ctx.lineTo(-3 * p, -2.5 * p);
    ctx.quadraticCurveTo(-5 * p, -5 * p, -7 * p, -8.5 * p);
    ctx.lineTo(-8 * p, -9 * p);
    ctx.lineTo(-6.5 * p, -8.5 * p);
    ctx.quadraticCurveTo(-4 * p, -5.5 * p, -4 * p, -2 * p);
    ctx.closePath();
    ctx.fill();
    // Wing edge highlight
    ctx.strokeStyle = kGreenLight;
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.7;
    ctx.stroke();

    // Top wing panel lines
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = kGreenDark;
    ctx.beginPath();
    ctx.moveTo(-2.5 * p, -2.5 * p);
    ctx.quadraticCurveTo(-4.5 * p, -5 * p, -6.5 * p, -7.5 * p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3 * p, -2.5 * p);
    ctx.quadraticCurveTo(-5 * p, -4.5 * p, -7 * p, -7 * p);
    ctx.stroke();

    // Bottom wing
    ctx.globalAlpha = alpha;
    ctx.fillStyle = kGreen;
    ctx.beginPath();
    ctx.moveTo(-1 * p, 2 * p);
    ctx.lineTo(-3 * p, 2.5 * p);
    ctx.quadraticCurveTo(-5 * p, 5 * p, -7 * p, 8.5 * p);
    ctx.lineTo(-8 * p, 9 * p);
    ctx.lineTo(-6.5 * p, 8.5 * p);
    ctx.quadraticCurveTo(-4 * p, 5.5 * p, -4 * p, 2 * p);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = kGreenLight;
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.7;
    ctx.stroke();

    // Bottom wing panel lines
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = kGreenDark;
    ctx.beginPath();
    ctx.moveTo(-2.5 * p, 2.5 * p);
    ctx.quadraticCurveTo(-4.5 * p, 5 * p, -6.5 * p, 7.5 * p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3 * p, 2.5 * p);
    ctx.quadraticCurveTo(-5 * p, 4.5 * p, -7 * p, 7 * p);
    ctx.stroke();

    // === Main hull / body (filled) ===
    ctx.globalAlpha = alpha;
    ctx.fillStyle = kGreenDark;
    ctx.beginPath();
    ctx.moveTo(2 * p, -1.5 * p);
    ctx.lineTo(-3 * p, -2 * p);
    ctx.lineTo(-5 * p, -1.5 * p);
    ctx.lineTo(-5 * p, 1.5 * p);
    ctx.lineTo(-3 * p, 2 * p);
    ctx.lineTo(2 * p, 1.5 * p);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = kGreenLight;
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();

    // Hull center line
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = kGreenLight;
    ctx.beginPath();
    ctx.moveTo(2 * p, 0);
    ctx.lineTo(-5 * p, 0);
    ctx.stroke();

    // === Neck (connecting head to body) ===
    ctx.globalAlpha = alpha;
    ctx.fillStyle = kGreenDark;
    ctx.beginPath();
    ctx.moveTo(5 * p, -0.6 * p);
    ctx.lineTo(2 * p, -1.2 * p);
    ctx.lineTo(2 * p, 1.2 * p);
    ctx.lineTo(5 * p, 0.6 * p);
    ctx.closePath();
    ctx.fill();

    // === Command pod (bulbous head, filled) ===
    ctx.fillStyle = kGreen;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(7 * p, 0, 2 * p, 1.5 * p, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = kGreenLight;
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();
    // Bridge window
    ctx.fillStyle = '#4a2';
    ctx.globalAlpha = alpha * 1.2;
    ctx.beginPath();
    ctx.arc(8.2 * p, 0, 0.4 * p, 0, Math.PI * 2);
    ctx.fill();

    // Impulse engine at rear
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = kGreenDark;
    ctx.beginPath();
    ctx.moveTo(-5 * p, -1 * p);
    ctx.lineTo(-6 * p, -0.8 * p);
    ctx.lineTo(-6 * p, 0.8 * p);
    ctx.lineTo(-5 * p, 1 * p);
    ctx.closePath();
    ctx.fill();
    // Engine glow
    if (Math.sin(t * 6) > 0) {
      ctx.fillStyle = '#f44';
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.ellipse(-5.8 * p, 0, 0.6 * p, 0.7 * p, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // === Disruptor cannons at wing tips ===
    ctx.globalAlpha = alpha;
    ctx.fillStyle = kGreenDark;
    ctx.beginPath();
    ctx.arc(-7.5 * p, -8.8 * p, p * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-7.5 * p, 8.8 * p, p * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Blinking disruptor glow (green)
    if (Math.sin(t * 5) > 0.4) {
      ctx.fillStyle = '#0f0';
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(-7.5 * p, -8.8 * p, p * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-7.5 * p, 8.8 * p, p * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // === Torpedo launcher under the head ===
    ctx.globalAlpha = alpha * 0.6;
    ctx.fillStyle = '#f44';
    ctx.beginPath();
    ctx.arc(8.5 * p, 0, 0.3 * p, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Render photon torpedoes (in world space)
    if (b.torpedos && b.torpedos.length > 0) {
      for (const torp of b.torpedos) {
        if (t < torp.time) continue;
        const torpElapsed = t - torp.time;
        const torpSpeed = 200 * S;
        const torpX = torp.sx + torpSpeed * torpElapsed * b.dir;
        const torpY = torp.sy;

        if (torpX < -50 || torpX > TW + 50) continue;

        // Green glowing torpedo
        ctx.save();
        ctx.globalAlpha = Math.max(0, 0.3 - torpElapsed * 0.15);
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(torpX, torpY, 3 * S, 0, Math.PI * 2);
        ctx.fill();

        // Torpedo trail
        ctx.globalAlpha = Math.max(0, 0.15 - torpElapsed * 0.08);
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(torpX, torpY);
        ctx.lineTo(torpX - b.dir * 15 * S, torpY);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// ==================== USS ENTERPRISE (side profile) ====================
export function renderEnterprise(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = g.getLevelCfg().colors;

  // Schedule
  if (!this._enterprise && !this._enterpriseScheduled) {
    const delay = this._enterpriseNextTime === 0
      ? 64 + Math.random() * 55
      : 105 + Math.random() * 135;
    this._enterpriseNextTime = t + delay;
    this._enterpriseScheduled = true;
  }

  // Spawn
  if (!this._enterprise && this._enterpriseScheduled && t >= this._enterpriseNextTime) {
    const goRight = Math.random() > 0.5;
    const size = (40 + Math.random() * 20) * S;
    const speed = (25 + Math.random() * 20) * S;
    const yStart = 80 + Math.random() * (TH * 0.35);
    const yEnd = yStart + (Math.random() - 0.5) * TH * 0.15;
    this._enterprise = {
      startX: goRight ? -size * 3 : TW + size * 3,
      endX: goRight ? TW + size * 3 : -size * 3,
      yStart, yEnd, size, speed,
      dir: goRight ? 1 : -1,
      startTime: t,
      warpTriggered: false,
      warpTime: 0,
      warpX: 0,
      warpY: 0
    };
    this._enterpriseScheduled = false;
  }

  // Render
  if (this._enterprise) {
    const e = this._enterprise;
    const elapsed = t - e.startTime;
    const totalDist = Math.abs(e.endX - e.startX);

    let x, y;
    const buildupDuration = 0.5;

    if (e.warpTriggered) {
      const warpElapsed = t - e.warpTime;

      if (warpElapsed < buildupDuration) {
        x = e.warpX;
        y = e.warpY;
      } else {
        const warpDist = (warpElapsed - buildupDuration) * e.speed * 20;
        x = e.warpX + warpDist * e.dir;
        y = e.warpY;

        if ((e.dir > 0 && x > TW + 300) || (e.dir < 0 && x < -300)) {
          this._enterprise = null;
          return;
        }
      }
    } else {
      const progress = (elapsed * e.speed) / totalDist;
      if (progress > 1) { this._enterprise = null; return; }
      x = e.startX + (e.endX - e.startX) * progress;
      y = e.yStart + (e.yEnd - e.yStart) * progress;

      if (x > TW * 0.35 && x < TW * 0.65) {
        e.warpTriggered = true;
        e.warpTime = t;
        e.warpX = x;
        e.warpY = y;
      }
    }

    const s = e.size;
    const p = s / 14;
    const wobble = e.warpTriggered ? 0 : Math.sin(t * 0.8) * p * 0.5;

    const warpElapsed = e.warpTriggered ? t - e.warpTime : 0;
    const inBuildup = e.warpTriggered && warpElapsed < buildupDuration;
    const inWarp = e.warpTriggered && warpElapsed >= buildupDuration;
    const buildupFactor = inBuildup ? warpElapsed / buildupDuration : 0;

    // Warp light trails
    if (inWarp) {
      const streakLen = Math.min((warpElapsed - buildupDuration) * 400 * S, 300 * S);
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#4af';
      ctx.lineWidth = 2;
      // Nacelle trail (above ship)
      ctx.beginPath();
      ctx.moveTo(x, y - 5 * p);
      ctx.lineTo(x - e.dir * streakLen, y - 5 * p);
      ctx.stroke();
      // Hull trail
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y + 1 * p);
      ctx.lineTo(x - e.dir * streakLen * 0.7, y + 1 * p);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y + wobble);
    if (e.dir < 0) ctx.scale(-1, 1);

    // Warp stretch
    if (inWarp) {
      const stretch = 1 + Math.min((warpElapsed - buildupDuration) * 3, 2);
      ctx.scale(stretch, 1 / Math.sqrt(stretch));
    } else if (inBuildup) {
      ctx.scale(1 + buildupFactor * 0.15, 1 - buildupFactor * 0.05);
    }

    const baseAlpha = 0.12 + Math.sin(t * 1.8) * 0.03;
    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 1.5;

    // === SIDE PROFILE VIEW ===
    // Ship faces right: saucer at front (right), nacelle behind (left), engineering below

    // Saucer section (seen edge-on from side — larger thin ellipse)
    ctx.beginPath();
    ctx.ellipse(6 * p, -2 * p, 5.5 * p, 1.5 * p, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bridge dome on top of saucer
    ctx.beginPath();
    ctx.ellipse(6 * p, -3.6 * p, 1.3 * p, 0.5 * p, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Neck connecting saucer down to engineering hull
    ctx.beginPath();
    ctx.moveTo(4 * p, -0.6 * p);
    ctx.lineTo(2 * p, 1.5 * p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5.5 * p, -0.6 * p);
    ctx.lineTo(3 * p, 1.5 * p);
    ctx.stroke();

    // Engineering hull (secondary hull — torpedo-shaped, below saucer)
    ctx.beginPath();
    ctx.moveTo(3 * p, 1 * p);
    ctx.lineTo(-4 * p, 1 * p);
    ctx.quadraticCurveTo(-6 * p, 1 * p, -6 * p, 2.5 * p);
    ctx.quadraticCurveTo(-6 * p, 4 * p, -4 * p, 4 * p);
    ctx.lineTo(3 * p, 4 * p);
    ctx.quadraticCurveTo(5 * p, 4 * p, 5 * p, 2.5 * p);
    ctx.quadraticCurveTo(5 * p, 1 * p, 3 * p, 1 * p);
    ctx.stroke();

    // Deflector dish (front of engineering hull)
    ctx.beginPath();
    ctx.arc(4.5 * p, 2.5 * p, 0.8 * p, 0, Math.PI * 2);
    ctx.stroke();
    // Deflector glow
    ctx.globalAlpha = baseAlpha * 0.6;
    ctx.fillStyle = '#4af';
    ctx.beginPath();
    ctx.arc(4.5 * p, 2.5 * p, 0.5 * p, 0, Math.PI * 2);
    ctx.fill();

    // Shuttle bay (rear of engineering hull)
    ctx.globalAlpha = baseAlpha * 0.5;
    ctx.strokeStyle = c.s;
    ctx.beginPath();
    ctx.moveTo(-5 * p, 2 * p);
    ctx.lineTo(-5 * p, 3 * p);
    ctx.stroke();

    // Nacelle pylon (goes up from engineering hull to nacelle)
    ctx.globalAlpha = baseAlpha;
    ctx.beginPath();
    ctx.moveTo(-2 * p, 1 * p);
    ctx.lineTo(-4 * p, -4 * p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1 * p, 1 * p);
    ctx.lineTo(-3 * p, -4 * p);
    ctx.stroke();

    // Warp nacelle (long tube above/behind saucer)
    ctx.beginPath();
    ctx.moveTo(-1 * p, -4.5 * p);
    ctx.lineTo(-8 * p, -4.5 * p);
    ctx.lineTo(-8 * p, -5.5 * p);
    ctx.lineTo(-1 * p, -5.5 * p);
    ctx.closePath();
    ctx.stroke();

    // Bussard collector (front of nacelle)
    ctx.beginPath();
    ctx.arc(-1 * p, -5 * p, 0.5 * p, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Nacelle endcap (rear)
    ctx.beginPath();
    ctx.moveTo(-8 * p, -4.5 * p);
    ctx.lineTo(-8.5 * p, -5 * p);
    ctx.lineTo(-8 * p, -5.5 * p);
    ctx.stroke();

    // Hull panel detail lines
    ctx.globalAlpha = baseAlpha * 0.35;
    // Engineering hull midline
    ctx.beginPath();
    ctx.moveTo(-4 * p, 2.5 * p);
    ctx.lineTo(3 * p, 2.5 * p);
    ctx.stroke();
    // Saucer deck line
    ctx.beginPath();
    ctx.moveTo(1 * p, -2 * p);
    ctx.lineTo(11 * p, -2 * p);
    ctx.stroke();

    // Bussard collector glow (red)
    const bussardAlpha = inBuildup ? 0.12 + buildupFactor * 0.2 : (inWarp ? 0.35 : 0.12);
    if (Math.sin(t * 3) > 0 || inBuildup || inWarp) {
      ctx.fillStyle = '#f44';
      ctx.globalAlpha = bussardAlpha;
      ctx.beginPath();
      ctx.arc(-1 * p, -5 * p, p * (0.6 + (inBuildup ? buildupFactor * 0.4 : 0)), 0, Math.PI * 2);
      ctx.fill();
    }

    // Nacelle warp glow (blue) — intensifies during warp
    const nacelleAlpha = inBuildup ? 0.06 + buildupFactor * 0.2 : (inWarp ? 0.3 : 0.06 + Math.sin(t * 4) * 0.04);
    ctx.fillStyle = '#4af';
    ctx.globalAlpha = nacelleAlpha;
    ctx.fillRect(-8 * p, -5.5 * p, 7 * p, p);

    // Impulse engines (red glow at rear of saucer)
    if (Math.sin(t * 4) > 0.2) {
      ctx.fillStyle = '#f44';
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.arc(1 * p, -2 * p, 0.4 * p, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warp buildup flash
    if (inBuildup && buildupFactor > 0.7) {
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = (buildupFactor - 0.7) / 0.3 * 0.15;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ==================== BORG CUBE ====================
export function renderBorgCube(ctx) {
  const g = this.g;
  const t = g.animTime;
  const c = g.getLevelCfg().colors;

  // Schedule
  if (!this._borg && !this._borgScheduled) {
    const delay = this._borgNextTime === 0
      ? 72 + Math.random() * 55
      : 112 + Math.random() * 145;
    this._borgNextTime = t + delay;
    this._borgScheduled = true;
  }

  // Spawn
  if (!this._borg && this._borgScheduled && t >= this._borgNextTime) {
    const goRight = Math.random() > 0.5;
    const size = (35 + Math.random() * 15) * S;
    const speed = (10 + Math.random() * 10) * S;
    const yStart = 80 + Math.random() * (TH * 0.3);
    const yEnd = yStart + (Math.random() - 0.5) * TH * 0.08;
    this._borg = {
      startX: goRight ? -size * 2 : TW + size * 2,
      endX: goRight ? TW + size * 2 : -size * 2,
      yStart, yEnd, size, speed,
      dir: goRight ? 1 : -1,
      startTime: t,
      laserFired: false,
      laserTime: 0,
      laserX: 0,
      laserY: 0
    };
    this._borgScheduled = false;
  }

  // Render
  if (this._borg) {
    const b = this._borg;
    const elapsed = t - b.startTime;
    const totalDist = Math.abs(b.endX - b.startX);
    const progress = (elapsed * b.speed) / totalDist;

    if (progress > 1) {
      this._borg = null;
      return;
    }

    const x = b.startX + (b.endX - b.startX) * progress;
    const y = b.yStart + (b.yEnd - b.yStart) * progress;
    const s = b.size;
    const baseAlpha = 0.13 + Math.sin(t * 1.2) * 0.03;

    // Trigger laser when crossing middle of screen
    if (!b.laserFired && x > TW * 0.3 && x < TW * 0.7) {
      b.laserFired = true;
      b.laserTime = t;
      b.laserX = x;
      b.laserY = y;
    }

    // Borg color scheme — dark metallic with green
    const borgDark = '#2a2a2a';
    const borgMid = '#3a3a3a';
    const borgLight = '#555';
    const borgGreen = '#2aff2a';
    const borgGreenDim = '#1a8a1a';

    ctx.save();
    ctx.translate(x, y);

    // Slight rotation oscillation (menacing slow spin)
    const rot = Math.sin(t * 0.3) * 0.05;
    ctx.rotate(rot);

    // === 3D CUBE (isometric-ish) ===
    // Face size
    const half = s * 0.4;
    // Isometric offsets for depth
    const dx = s * 0.18;
    const dy = s * 0.12;

    // --- Back-top face (darkest) ---
    ctx.globalAlpha = baseAlpha * 0.7;
    ctx.fillStyle = borgDark;
    ctx.beginPath();
    ctx.moveTo(-half, -half);         // top-left front
    ctx.lineTo(-half + dx, -half - dy); // top-left back
    ctx.lineTo(half + dx, -half - dy);  // top-right back
    ctx.lineTo(half, -half);           // top-right front
    ctx.closePath();
    ctx.fill();

    // Top face grid lines
    ctx.strokeStyle = borgGreenDim;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = baseAlpha * 0.4;
    for (let i = 1; i < 4; i++) {
      const frac = i / 4;
      ctx.beginPath();
      ctx.moveTo(-half + (half * 2) * frac, -half);
      ctx.lineTo(-half + dx + (half * 2) * frac, -half - dy);
      ctx.stroke();
    }

    // --- Right side face (medium) ---
    ctx.globalAlpha = baseAlpha * 0.8;
    ctx.fillStyle = borgMid;
    ctx.beginPath();
    ctx.moveTo(half, -half);
    ctx.lineTo(half + dx, -half - dy);
    ctx.lineTo(half + dx, half - dy);
    ctx.lineTo(half, half);
    ctx.closePath();
    ctx.fill();

    // Right face grid
    ctx.strokeStyle = borgGreenDim;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = baseAlpha * 0.4;
    for (let i = 1; i < 4; i++) {
      const frac = i / 4;
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(half, -half + (half * 2) * frac);
      ctx.lineTo(half + dx, -half - dy + (half * 2) * frac);
      ctx.stroke();
    }
    // Vertical line on right face
    ctx.beginPath();
    ctx.moveTo(half + dx * 0.5, -half - dy * 0.5);
    ctx.lineTo(half + dx * 0.5, half - dy * 0.5);
    ctx.stroke();

    // --- Front face (brightest) ---
    ctx.globalAlpha = baseAlpha;
    ctx.fillStyle = borgMid;
    ctx.fillRect(-half, -half, half * 2, half * 2);

    // Front face grid lines (circuitry pattern)
    ctx.strokeStyle = borgGreenDim;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = baseAlpha * 0.5;
    const gridN = 4;
    for (let i = 1; i < gridN; i++) {
      const frac = i / gridN;
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(-half + (half * 2) * frac, -half);
      ctx.lineTo(-half + (half * 2) * frac, half);
      ctx.stroke();
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(-half, -half + (half * 2) * frac);
      ctx.lineTo(half, -half + (half * 2) * frac);
      ctx.stroke();
    }

    // Front face edge highlight
    ctx.strokeStyle = borgLight;
    ctx.lineWidth = 1;
    ctx.globalAlpha = baseAlpha * 0.6;
    ctx.strokeRect(-half, -half, half * 2, half * 2);

    // Pulsing green nodes at grid intersections
    ctx.fillStyle = borgGreen;
    for (let gx = 1; gx < gridN; gx++) {
      for (let gy = 1; gy < gridN; gy++) {
        const nx = -half + (half * 2) * gx / gridN;
        const ny = -half + (half * 2) * gy / gridN;
        const pulse = Math.sin(t * 2 + gx * 1.3 + gy * 0.7);
        if (pulse > 0.3) {
          ctx.globalAlpha = baseAlpha * (0.4 + pulse * 0.4);
          ctx.beginPath();
          ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Central green glow (power core)
    ctx.globalAlpha = baseAlpha * (0.3 + Math.sin(t * 1.5) * 0.15);
    ctx.fillStyle = borgGreen;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Outer glow ring
    ctx.globalAlpha = baseAlpha * 0.15;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === CUTTING BEAM (laser) ===
    if (b.laserFired) {
      const laserElapsed = t - b.laserTime;
      const laserDuration = 1.2;

      if (laserElapsed < laserDuration) {
        const laserProgress = laserElapsed / laserDuration;
        // Beam fades in, holds, fades out
        let laserAlpha;
        if (laserProgress < 0.15) {
          laserAlpha = laserProgress / 0.15;
        } else if (laserProgress < 0.75) {
          laserAlpha = 1;
        } else {
          laserAlpha = 1 - (laserProgress - 0.75) / 0.25;
        }

        // Beam extends downward from the cube
        const beamStartY = y + half;
        const beamLen = TH * 0.4 * Math.min(laserProgress * 4, 1);
        const beamEndY = beamStartY + beamLen;

        // Beam jitter
        const jx = Math.sin(t * 30) * 2;

        ctx.save();

        // Wide outer glow
        ctx.globalAlpha = 0.04 * laserAlpha;
        ctx.strokeStyle = borgGreen;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(x + jx * 0.3, beamStartY);
        ctx.lineTo(x + jx, beamEndY);
        ctx.stroke();

        // Medium glow
        ctx.globalAlpha = 0.08 * laserAlpha;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x + jx * 0.3, beamStartY);
        ctx.lineTo(x + jx, beamEndY);
        ctx.stroke();

        // Core beam (bright)
        ctx.globalAlpha = 0.18 * laserAlpha;
        ctx.strokeStyle = '#aaffaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + jx * 0.3, beamStartY);
        ctx.lineTo(x + jx, beamEndY);
        ctx.stroke();

        // Impact point glow at end of beam
        if (laserProgress > 0.2) {
          ctx.globalAlpha = 0.12 * laserAlpha;
          ctx.fillStyle = borgGreen;
          ctx.beginPath();
          ctx.arc(x + jx, beamEndY, 6 + Math.sin(t * 20) * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }
  }
}
