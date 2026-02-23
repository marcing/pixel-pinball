import { BALL_R, S } from '../constants.js';

export function renderBallTrail(ctx) {
  const g = this.g;
  const trail = g.ballTrail;
  if (trail.length < 2) return;
  const c = g.getLevelCfg().colors;
  const colors = [c.p, c.s, c.a];

  // Speed intensity: 0 at spd<=2, 1 at spd>=15
  const spdFactor = (spd) => Math.min(Math.max(((spd || 0) - 2) / 13, 0), 1);

  // Trail dots — size and opacity scale with speed
  for (let i = 0; i < trail.length; i++) {
    const pt = trail[i];
    const t = 1 - pt.age / 40;
    if (t <= 0) continue;
    const intensity = spdFactor(pt.spd);
    if (intensity < 0.05) continue;
    const r = BALL_R * (0.3 + 0.5 * intensity) * t;
    const color = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = t * (0.1 + 0.5 * intensity);
    ctx.fill();
  }

  // Glow line — only visible at higher speeds
  if (trail.length >= 2) {
    let avgSpd = 0;
    for (const pt of trail) avgSpd += (pt.spd || 0);
    avgSpd /= trail.length;
    const lineInt = spdFactor(avgSpd);

    if (lineInt > 0.1) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.strokeStyle = c.p;
      ctx.lineWidth = 1 + 3 * lineInt;
      ctx.globalAlpha = 0.05 + 0.35 * lineInt;
      if (!g.lowPerf) { ctx.shadowColor = c.p; ctx.shadowBlur = 6 + 10 * lineInt; }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  ctx.globalAlpha = 1;
}

export function renderBall(ctx) {
  const g = this.g;
  if (!g.ball) return;
  const x = g.ball.position.x, y = g.ball.position.y;
  const R = BALL_R;
  const c = g.getLevelCfg().colors;
  const v = g.ball.velocity;
  const spd = Math.sqrt(v.x * v.x + v.y * v.y);

  // Outer glow — colored by level, intensity scales with speed
  if (!g.lowPerf) {
    const glowR = R * 2.5 + Math.min(spd * 0.3, R);
    const glow = ctx.createRadialGradient(x, y, R * 0.5, x, y, glowR);
    glow.addColorStop(0, c.p + '40');
    glow.addColorStop(0.5, c.s + '18');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glow; ctx.fill();
  }

  // Drop shadow
  ctx.beginPath(); ctx.arc(x + 2, y + 3, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();

  // Base chrome gradient — offset highlight for 3D look
  const grad = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.05, x, y, R);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.15, '#F0F0F0');
  grad.addColorStop(0.35, '#C8C8C8');
  grad.addColorStop(0.6, '#808080');
  grad.addColorStop(0.85, '#404040');
  grad.addColorStop(1, '#282828');
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = grad; ctx.fill();

  // Color reflection — level primary color tinted rim
  const rimGrad = ctx.createRadialGradient(x + R * 0.2, y + R * 0.25, R * 0.3, x, y, R);
  rimGrad.addColorStop(0, 'transparent');
  rimGrad.addColorStop(0.6, 'transparent');
  rimGrad.addColorStop(0.85, c.p + '50');
  rimGrad.addColorStop(1, c.p + '30');
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = rimGrad; ctx.fill();

  // Secondary color reflection on opposite side
  const rim2 = ctx.createRadialGradient(x - R * 0.4, y + R * 0.3, R * 0.1, x, y, R);
  rim2.addColorStop(0, c.s + '35');
  rim2.addColorStop(0.4, c.s + '15');
  rim2.addColorStop(1, 'transparent');
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = rim2; ctx.fill();

  // Main specular highlight — big soft shine
  const hlX = x - R * 0.28, hlY = y - R * 0.28;
  const hl = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, R * 0.55);
  hl.addColorStop(0, 'rgba(255,255,255,0.9)');
  hl.addColorStop(0.4, 'rgba(255,255,255,0.4)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = hl; ctx.fill();

  // Small sharp specular dot
  ctx.beginPath(); ctx.arc(x - R * 0.22, y - R * 0.22, R * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();

  // Rim edge highlight — thin bright ring on top
  ctx.beginPath(); ctx.arc(x, y, R - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Speed-based chrome shine effect
  if (spd > 2 && !g.lowPerf) {
    const shimmer = Math.min((spd - 2) / 15, 0.4);
    const shGrad = ctx.createRadialGradient(x, y - R * 0.1, 0, x, y, R);
    shGrad.addColorStop(0, c.a + Math.floor(shimmer * 255).toString(16).padStart(2, '0'));
    shGrad.addColorStop(0.5, 'transparent');
    shGrad.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fillStyle = shGrad; ctx.fill();
  }
}
