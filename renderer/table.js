import { TW, TH, FLIPPER_LEN, FLIPPER_W, S } from '../constants.js';

export function renderTableWalls(ctx) {
  const g = this.g;
  const c = g.getLevelCfg().colors;
  const t = g.animTime;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Outer glow layer
  ctx.strokeStyle = c.s;
  ctx.lineWidth = 10;
  ctx.globalAlpha = 0.08;
  ctx.beginPath();
  ctx.moveTo(16 * S, 757 * S); ctx.lineTo(16 * S, 16 * S); ctx.lineTo(260 * S, 16 * S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(383 * S, 100 * S); ctx.lineTo(383 * S, 757 * S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(TW - 16, 95 * S); ctx.lineTo(TW - 16, 757 * S);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Arc coordinates
  const aP0x = TW - 16, aP0y = 100 * S, aP1x = TW - 16, aP1y = 16 * S, aP2x = 258 * S, aP2y = 16 * S;

  // Left wall + top wall to arc start
  ctx.strokeStyle = c.s;
  ctx.lineWidth = 5;
  ctx.shadowColor = c.s;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(98 * S + 5, 757 * S);
  ctx.lineTo(16 * S, 757 * S);
  ctx.lineTo(16 * S, 16 * S);
  ctx.lineTo(aP2x, 16 * S);
  ctx.stroke();

  // Right upper corner arc
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(aP2x, aP2y);
  for (let i = 0; i <= 40; i++) {
    const t2 = i / 40, mt = 1 - t2;
    const bx = mt * mt * aP2x + 2 * mt * t2 * aP1x + t2 * t2 * aP0x;
    const by = mt * mt * aP2y + 2 * mt * t2 * aP1y + t2 * t2 * aP0y;
    ctx.lineTo(bx, by);
  }
  ctx.stroke();

  // Fill above-arc region (concave space between arc and corner)
  ctx.beginPath();
  ctx.moveTo(aP0x, aP0y);
  ctx.lineTo(aP0x, aP2y);
  ctx.lineTo(aP2x, aP2y);
  for (let i = 1; i <= 40; i++) {
    const t2 = i / 40, mt2 = 1 - t2;
    const fx = mt2*mt2*aP2x + 2*mt2*t2*aP1x + t2*t2*aP0x;
    const fy = mt2*mt2*aP2y + 2*mt2*t2*aP1y + t2*t2*aP0y;
    ctx.lineTo(fx, fy);
  }
  ctx.closePath();
  const arcFillGrad = ctx.createLinearGradient(aP2x, aP2y, aP0x, aP0y);
  arcFillGrad.addColorStop(0, c.s + '10');
  arcFillGrad.addColorStop(0.5, c.s + '20');
  arcFillGrad.addColorStop(1, c.s + '10');
  ctx.fillStyle = arcFillGrad;
  ctx.globalAlpha = 1;
  ctx.fill();
  // Diagonal stripes in the arc fill area
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(aP0x, aP0y);
  ctx.lineTo(aP0x, aP2y);
  ctx.lineTo(aP2x, aP2y);
  for (let i = 1; i <= 40; i++) {
    const t2 = i / 40, mt2 = 1 - t2;
    const fx = mt2*mt2*aP2x + 2*mt2*t2*aP1x + t2*t2*aP0x;
    const fy = mt2*mt2*aP2y + 2*mt2*t2*aP1y + t2*t2*aP0y;
    ctx.lineTo(fx, fy);
  }
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = c.s;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.1;
  for (let d = 0; d < 400; d += 15) {
    ctx.beginPath();
    ctx.moveTo(aP2x + d, aP2y);
    ctx.lineTo(aP0x, aP2y + d * 0.55);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // Inner wall (right boundary of playfield, left boundary of launch lane)
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(383 * S, 100 * S);
  ctx.lineTo(383 * S, 757 * S);
  ctx.lineTo(301 * S - 5, 757 * S);
  ctx.stroke();

  // Outer right wall (starts where arc curve ends)
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(TW - 16, aP0y);
  ctx.lineTo(TW - 16, 757 * S);
  ctx.stroke();
  // Bottom floor under launch lane
  ctx.beginPath();
  ctx.moveTo(383 * S, 757 * S); ctx.lineTo(TW - 16, 757 * S);
  ctx.stroke();

  // ===== SLINGSHOT AREAS =====
  ctx.shadowBlur = 0;

  // Left slingshot
  const lsX1 = 16 * S, lsY1 = 560 * S;
  const lsX2 = 98 * S + 5, lsY2 = 700 * S - 10;
  const lsGrad = ctx.createLinearGradient(lsX1, lsY1, lsX2, lsY2);
  lsGrad.addColorStop(0, c.a + '08');
  lsGrad.addColorStop(1, c.a + '18');
  ctx.fillStyle = lsGrad;
  ctx.beginPath();
  ctx.moveTo(lsX1, lsY1); ctx.lineTo(lsX2, lsY2);
  ctx.lineTo(lsX1, lsY2); ctx.closePath();
  ctx.fill();

  // Right slingshot
  const rsX1 = 383 * S, rsY1 = 560 * S;
  const rsX2 = 301 * S - 5, rsY2 = 700 * S - 10;
  const rsGrad = ctx.createLinearGradient(rsX1, rsY1, rsX2, rsY2);
  rsGrad.addColorStop(0, c.a + '08');
  rsGrad.addColorStop(1, c.a + '18');
  ctx.fillStyle = rsGrad;
  ctx.beginPath();
  ctx.moveTo(rsX1, rsY1); ctx.lineTo(rsX2, rsY2);
  ctx.lineTo(rsX1, rsY2); ctx.closePath();
  ctx.fill();

  // Slingshot wall lines
  ctx.strokeStyle = c.a;
  ctx.lineWidth = 5;
  ctx.shadowColor = c.a;
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(lsX1, lsY1); ctx.lineTo(lsX2, lsY2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rsX1, rsY1); ctx.lineTo(rsX2, rsY2); ctx.stroke();

  // Slingshot rubber strip indicators (pulsing)
  const slPulse = 0.4 + Math.sin(t * 5) * 0.2;
  ctx.globalAlpha = slPulse;
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lsX1, lsY1); ctx.lineTo(lsX2, lsY2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rsX1, rsY1); ctx.lineTo(rsX2, rsY2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Left dead zone fill
  const dzGrad = ctx.createLinearGradient(16 * S, 600 * S, 80 * S, 755 * S);
  dzGrad.addColorStop(0, c.s + '10');
  dzGrad.addColorStop(0.4, c.s + '20');
  dzGrad.addColorStop(1, c.s + '30');
  ctx.fillStyle = dzGrad;
  ctx.beginPath();
  ctx.moveTo(16 * S, 560 * S);
  ctx.lineTo(98 * S + 5, 700 * S - 10);
  ctx.lineTo(98 * S + 5, 755 * S);
  ctx.lineTo(16 * S, 755 * S);
  ctx.closePath();
  ctx.fill();
  // Diagonal stripes
  ctx.strokeStyle = c.s;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.08;
  for (let dy = 0; dy < 260; dy += 15) {
    ctx.beginPath();
    ctx.moveTo(16 * S, (570 + dy) * S);
    ctx.lineTo(16 * S + dy * 0.55 * S, 755 * S);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Dead zone border
  ctx.strokeStyle = c.s;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(16 * S, 560 * S);
  ctx.lineTo(98 * S + 5, 700 * S - 10);
  ctx.lineTo(98 * S + 5, 755 * S);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Right dead zone fill
  const rdzGrad = ctx.createLinearGradient(383 * S, 600 * S, 320 * S, 755 * S);
  rdzGrad.addColorStop(0, c.s + '10');
  rdzGrad.addColorStop(0.4, c.s + '20');
  rdzGrad.addColorStop(1, c.s + '30');
  ctx.fillStyle = rdzGrad;
  ctx.beginPath();
  ctx.moveTo(383 * S, 560 * S);
  ctx.lineTo(301 * S - 5, 700 * S - 10);
  ctx.lineTo(301 * S - 5, 755 * S);
  ctx.lineTo(383 * S, 755 * S);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = c.s;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.08;
  for (let dy = 0; dy < 240; dy += 15) {
    ctx.beginPath();
    ctx.moveTo(383 * S, (570 + dy) * S);
    ctx.lineTo(383 * S - dy * 0.60 * S, 755 * S);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.s;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(383 * S, 560 * S);
  ctx.lineTo(301 * S - 5, 700 * S - 10);
  ctx.lineTo(301 * S - 5, 755 * S);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Drain boundaries
  ctx.strokeStyle = c.s;
  ctx.shadowColor = c.s;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(98 * S + 5, 695 * S); ctx.lineTo(98 * S + 5, 755 * S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(301 * S - 5, 695 * S); ctx.lineTo(301 * S - 5, 755 * S); ctx.stroke();

  // Bottom floor
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(16 * S, 757 * S); ctx.lineTo(98 * S + 5, 757 * S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(301 * S - 5, 757 * S); ctx.lineTo(383 * S, 757 * S);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Flash wall boundary near ball contact points (friction sparks)
  const contacts = g.wallFrictionContacts;
  if (contacts && contacts.length > 0) {
    const now = Date.now();
    for (const hit of contacts) {
      const age = now - hit.time;
      if (age > 300) continue;
      const flash = 1 - age / 300;

      const r = 40 + flash * 30;
      const grad = ctx.createRadialGradient(hit.x, hit.y, 0, hit.x, hit.y, r);
      grad.addColorStop(0, c.s);
      grad.addColorStop(0.3, c.p + '88');
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = flash * 0.7;
      ctx.fillStyle = grad;
      ctx.fillRect(hit.x - r, hit.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  // Wall hit flash — bright white burst at contact point
  const wallFlashes = g.wallHitFlashes;
  if (wallFlashes && wallFlashes.length > 0) {
    const now2 = Date.now();
    for (const wf of wallFlashes) {
      const age = now2 - wf.time;
      if (age > 350) continue;
      const flash = 1 - age / 350;
      const r = 20 + flash * 25;
      const grad = ctx.createRadialGradient(wf.x, wf.y, 0, wf.x, wf.y, r);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, c.s + 'CC');
      grad.addColorStop(0.7, c.s + '44');
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = flash * 0.85;
      ctx.fillStyle = grad;
      ctx.fillRect(wf.x - r, wf.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  // Slingshot flash — light up the entire rubber line on hit
  const slHit = g.slingshotHitTime;
  if (slHit) {
    const now3 = Date.now();
    const flashDuration = 400;

    // Left slingshot flash
    const lAge = now3 - slHit.left;
    if (lAge < flashDuration) {
      const lFlash = 1 - lAge / flashDuration;
      // Bright rubber line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6 + lFlash * 4;
      ctx.globalAlpha = lFlash * 0.9;
      ctx.shadowColor = c.a;
      ctx.shadowBlur = 25 * lFlash;
      ctx.beginPath(); ctx.moveTo(lsX1, lsY1); ctx.lineTo(lsX2, lsY2); ctx.stroke();
      // Secondary colored glow line
      ctx.strokeStyle = c.a;
      ctx.lineWidth = 10 + lFlash * 8;
      ctx.globalAlpha = lFlash * 0.4;
      ctx.beginPath(); ctx.moveTo(lsX1, lsY1); ctx.lineTo(lsX2, lsY2); ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Right slingshot flash
    const rAge = now3 - slHit.right;
    if (rAge < flashDuration) {
      const rFlash = 1 - rAge / flashDuration;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6 + rFlash * 4;
      ctx.globalAlpha = rFlash * 0.9;
      ctx.shadowColor = c.a;
      ctx.shadowBlur = 25 * rFlash;
      ctx.beginPath(); ctx.moveTo(rsX1, rsY1); ctx.lineTo(rsX2, rsY2); ctx.stroke();
      ctx.strokeStyle = c.a;
      ctx.lineWidth = 10 + rFlash * 8;
      ctx.globalAlpha = rFlash * 0.4;
      ctx.beginPath(); ctx.moveTo(rsX1, rsY1); ctx.lineTo(rsX2, rsY2); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

export function renderTunnels(ctx) {
  const g = this.g;
  const c = g.getLevelCfg().colors;
  const t = g.animTime;
  if (!g.tunnelBodies || !g.tunnelBodies.length) return;

  const tunnelR = 15 * S;

  // Draw connecting tubes between entry-exit pairs
  for (const tb of g.tunnelBodies) {
    if (tb.label !== 'tunnel_entry') continue;
    const exit = tb.tunnelExit;
    if (!exit) continue;

    const ex = tb.position.x, ey = tb.position.y;
    const ox = exit.position.x, oy = exit.position.y;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    const mx = (ex + ox) / 2, my = (ey + oy) / 2 - 30 * S;
    ctx.quadraticCurveTo(mx, my, ox, oy);
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.1;
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.15;
    ctx.stroke();

    // Moving dot along tube
    const dotT = (t * 0.5) % 1;
    const mt = 1 - dotT;
    const dx = mt * mt * ex + 2 * mt * dotT * mx + dotT * dotT * ox;
    const dy = mt * mt * ey + 2 * mt * dotT * my + dotT * dotT * oy;
    ctx.beginPath();
    ctx.arc(dx, dy, 3, 0, Math.PI * 2);
    ctx.fillStyle = c.s;
    ctx.globalAlpha = 0.4;
    ctx.fill();
  }

  // Draw tunnel holes
  for (const tb of g.tunnelBodies) {
    const x = tb.position.x, y = tb.position.y;
    const isEntry = tb.label === 'tunnel_entry';
    const col = isEntry ? c.s : c.a;

    ctx.beginPath();
    ctx.arc(x, y, tunnelR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.25 + Math.sin(t * 3 + x * 0.01) * 0.1;
    ctx.shadowColor = col;
    ctx.shadowBlur = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, tunnelR, 0, Math.PI * 2);
    const holeGrad = ctx.createRadialGradient(x, y, 0, x, y, tunnelR);
    holeGrad.addColorStop(0, '#000');
    holeGrad.addColorStop(0.7, '#0a0a0a');
    holeGrad.addColorStop(1, col + '20');
    ctx.fillStyle = holeGrad;
    ctx.globalAlpha = 0.5;
    ctx.fill();

    ctx.beginPath();
    const spiralAngle = t * 2;
    ctx.arc(x, y, tunnelR * 0.6, spiralAngle, spiralAngle + Math.PI * 1.5);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.18;
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.globalAlpha = 0.33;
    ctx.font = 'bold ' + Math.floor(10 * S) + 'px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isEntry ? 'IN' : 'OUT', x, y);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

export function renderBumpers(ctx) {
  const g = this.g;
  const c = g.getLevelCfg().colors;
  const now = Date.now();
  const colors = [c.p, c.s, c.a];

  for (let bi = 0; bi < g.bumperBodies.length; bi++) {
    const b = g.bumperBodies[bi];
    const x = b.position.x, y = b.position.y;
    const type = b.bumperType || 'c';
    const r = b.bumperRadius;
    const isHit = now - b.hitTime < 200;
    const hitFactor = isHit ? 1 - (now - b.hitTime) / 200 : 0;
    const style = bi % 3;
    const col = colors[style];
    const pulseSpd = 2.5 + style * 0.8;
    const pulse = Math.sin(g.animTime * pulseSpd + bi * 1.3) * 0.15 + 0.85;
    const t = g.animTime;

    if (type === 'c') {
      // HIT SHOCKWAVE RINGS
      if (isHit && !g.lowPerf) {
        const ringR = r + 3 + (1 - hitFactor) * r * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5 * hitFactor;
        ctx.globalAlpha = hitFactor * 0.6;
        ctx.stroke();
        const ring2 = r + 3 + (1 - hitFactor) * r * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, ring2, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1.5 * hitFactor;
        ctx.globalAlpha = hitFactor * 0.3;
        ctx.stroke();
      }

      // AMBIENT BREATHING GLOW
      if (!g.lowPerf) {
        const glowR = r * (1.6 + pulse * 0.3);
        const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowR);
        glow.addColorStop(0, col + '15');
        glow.addColorStop(0.6, col + '08');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.globalAlpha = isHit ? 0.8 : 0.4;
        ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2); ctx.fill();
      }

      // ORBITING DOTS
      if (!g.lowPerf) {
        const dotCount = style === 0 ? 3 : style === 1 ? 4 : 5;
        const orbitR = r + 5 + Math.sin(t * 1.5 + bi) * 2;
        for (let d = 0; d < dotCount; d++) {
          const angle = t * (1.2 + style * 0.3) + d * (Math.PI * 2 / dotCount) + bi * 0.7;
          const dx = x + Math.cos(angle) * orbitR;
          const dy = y + Math.sin(angle) * orbitR;
          ctx.beginPath();
          ctx.arc(dx, dy, 1.5 + Math.sin(t * 4 + d) * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = isHit ? '#FFF' : col;
          ctx.globalAlpha = isHit ? 0.7 : 0.25 + Math.sin(t * 3 + d * 2) * 0.1;
          ctx.fill();
        }
      }

      // OUTER BORDER RING
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = isHit ? '#FFF' : col;
      ctx.lineWidth = 2;
      ctx.globalAlpha = isHit ? 0.9 : pulse * 0.35;
      if (isHit && !g.lowPerf) { ctx.shadowColor = col; ctx.shadowBlur = 20 * hitFactor; }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // MAIN BODY
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
      if (isHit) {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#FFFFFF');
        grad.addColorStop(0.7, col);
        grad.addColorStop(1, col + 'CC');
      } else {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.25, col);
        grad.addColorStop(0.8, col + 'AA');
        grad.addColorStop(1, col + '44');
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.globalAlpha = isHit ? 0.95 : pulse * 0.85;
      ctx.fill();

      // INNER DECORATION (per style)
      if (style === 0) {
        ctx.beginPath();
        ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = c.bg;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        const ringPulse = r * 0.6 + Math.sin(t * 3 + bi) * r * 0.05;
        ctx.beginPath();
        ctx.arc(x, y, ringPulse, 0, Math.PI * 2);
        ctx.strokeStyle = isHit ? '#FFF' : col;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = isHit ? 0.9 : 0.5 + Math.sin(t * 2) * 0.2;
        ctx.stroke();
        const coreR = r * 0.12 + Math.sin(t * 5 + bi) * r * 0.04;
        ctx.beginPath(); ctx.arc(x, y, coreR, 0, Math.PI * 2);
        ctx.fillStyle = isHit ? '#FFF' : col;
        ctx.globalAlpha = isHit ? 0.8 : 0.4;
        ctx.fill();
      } else if (style === 1) {
        ctx.beginPath();
        ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = c.bg;
        ctx.globalAlpha = 0.88;
        ctx.fill();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 1.2 + bi);
        ctx.strokeStyle = isHit ? '#FFF' : col;
        ctx.lineWidth = 2;
        ctx.globalAlpha = isHit ? 0.8 : 0.5;
        for (let a = 0; a < 3; a++) {
          const startA = a * Math.PI * 2 / 3;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.48, startA, startA + Math.PI * 0.45);
          ctx.stroke();
        }
        ctx.rotate(-t * 2.4);
        ctx.globalAlpha = isHit ? 0.6 : 0.3;
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 2; a++) {
          const startA = a * Math.PI;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.28, startA, startA + Math.PI * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, r * 0.58, 0, Math.PI * 2);
        ctx.fillStyle = c.bg;
        ctx.globalAlpha = 0.88;
        ctx.fill();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 0.7 + bi);
        ctx.strokeStyle = isHit ? '#FFF' : col;
        ctx.lineWidth = 2;
        ctx.globalAlpha = isHit ? 0.8 : 0.55;
        for (let a = 0; a < 4; a++) {
          const ang = a * Math.PI / 2;
          const innerR = r * 0.12, outerR = r * 0.48;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * innerR, Math.sin(ang) * innerR);
          ctx.lineTo(Math.cos(ang) * outerR, Math.sin(ang) * outerR);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * outerR, Math.sin(ang) * outerR, 2, 0, Math.PI * 2);
          ctx.fillStyle = isHit ? '#FFF' : col;
          ctx.fill();
        }
        ctx.rotate(Math.PI / 4);
        const dSize = r * 0.12 + Math.sin(t * 4 + bi) * r * 0.03;
        ctx.fillStyle = isHit ? '#FFF' : col;
        ctx.globalAlpha = isHit ? 0.7 : 0.4;
        ctx.fillRect(-dSize, -dSize, dSize * 2, dSize * 2);
        ctx.restore();
      }

      // SPECULAR HIGHLIGHT
      const hlGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x - r * 0.2, y - r * 0.2, r * 0.4);
      hlGrad.addColorStop(0, 'rgba(255,255,255,' + (isHit ? '0.6' : '0.3') + ')');
      hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = hlGrad;
      ctx.globalAlpha = 1;
      ctx.fill();

      // BOTTOM RIM SHADOW
      const rimGrad = ctx.createLinearGradient(x, y, x, y + r);
      rimGrad.addColorStop(0, 'transparent');
      rimGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.globalAlpha = 0.5;
      ctx.fill();

    } else if (type === 'r') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(b.angle);
      const hw = b.bumperW / 2, hh = b.bumperH / 2;
      ctx.fillStyle = isHit ? '#FFFFFF' : col;
      ctx.globalAlpha = isHit ? 0.9 : pulse * 0.8;
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
      ctx.fillStyle = isHit ? col : c.bg;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(-hw * 0.6, -hh * 0.45, hw * 1.2, hh * 0.9);
      ctx.strokeStyle = isHit ? '#FFF' : col;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
      ctx.restore();
    } else {
      const verts = b.vertices;
      ctx.beginPath();
      ctx.moveTo(verts[0].x, verts[0].y);
      for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
      ctx.closePath();
      ctx.fillStyle = isHit ? '#FFFFFF' : col;
      ctx.globalAlpha = isHit ? 0.9 : pulse * 0.8;
      ctx.fill();
      ctx.beginPath();
      for (let i = 0; i < verts.length; i++) {
        const vx = x + (verts[i].x - x) * 0.55;
        const vy = y + (verts[i].y - y) * 0.55;
        if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.fillStyle = isHit ? col : c.bg;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(verts[0].x, verts[0].y);
      for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
      ctx.closePath();
      ctx.strokeStyle = isHit ? '#FFF' : col;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.45;
      ctx.stroke();
    }

    // Point value text
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.9;
    const fontSize = Math.max(10, Math.floor(r * 0.45));
    ctx.font = 'bold ' + fontSize + 'px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b.pointValue, x, y);

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

export function renderTargets(ctx) {
  const g = this.g;
  const c = g.getLevelCfg().colors;
  const now = Date.now();
  for (const t of g.targetBodies) {
    const x = t.position.x, y = t.position.y;
    const isHit = t.hit;
    const hitAge = now - t.hitTime;
    const hitRecent = hitAge < 3500;

    if (isHit && hitAge < 3000) {
      continue;
    }
    const fadeIn = (isHit && hitAge < 3500) ? (hitAge - 3000) / 500 : 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t.angle);

    const hw = t.targetW / 2, hh = t.targetH / 2;
    const pulse = 0.7 + Math.sin(g.animTime * 4 + x) * 0.2;
    const r = Math.min(hw, hh, 10);

    if (hitRecent && hitAge >= 3000) { ctx.shadowColor = c.a; ctx.shadowBlur = 20; }

    ctx.beginPath();
    ctx.roundRect(-hw - 2, -hh - 2, t.targetW + 4, t.targetH + 4, r + 2);
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 2;
    ctx.globalAlpha = (hitRecent ? 0.8 : pulse * 0.3) * fadeIn;
    ctx.stroke();

    const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.3, c.a);
    grad.addColorStop(1, c.a + '88');
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, t.targetW, t.targetH, r);
    ctx.fillStyle = grad;
    ctx.globalAlpha = pulse * 0.85 * fadeIn;
    ctx.fill();

    const innerMargin = Math.min(3, hw * 0.2, hh * 0.2);
    ctx.beginPath();
    ctx.roundRect(-hw + innerMargin, -hh + innerMargin,
      t.targetW - innerMargin * 2, t.targetH - innerMargin * 2, Math.max(1, r - 2));
    ctx.fillStyle = c.bg || '#0D0D3B';
    ctx.globalAlpha = 0.85 * fadeIn;
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-hw + innerMargin, -hh + innerMargin,
      t.targetW - innerMargin * 2, t.targetH - innerMargin * 2, Math.max(1, r - 2));
    ctx.strokeStyle = hitRecent ? '#FFF' : c.a;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5 * fadeIn;
    ctx.stroke();

    const specW = Math.min(hw * 0.3, 6);
    const specH = Math.min(hh * 0.3, 6);
    ctx.beginPath();
    ctx.ellipse(-hw * 0.25, -hh * 0.25, specW, specH, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.globalAlpha = 0.3 * fadeIn;
    ctx.fill();

    const pts = t.pointValue || 1;
    const minDim = Math.min(t.targetW, t.targetH);
    const fSize = Math.max(8, Math.floor(minDim * 0.55));
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.9 * fadeIn;
    ctx.font = 'bold ' + fSize + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pts, 0, 0);

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

export function renderFlippers(ctx) {
  const g = this.g;
  const c = g.getLevelCfg().colors;

  const _flipperPath = (ctx, pivotEnd, tipEnd, pivotR, tipR, isLeft) => {
    ctx.beginPath();
    if (isLeft) {
      ctx.arc(pivotEnd, 0, pivotR, -Math.PI / 2, Math.PI / 2, true);
      ctx.lineTo(tipEnd, tipR);
      ctx.arc(tipEnd, 0, tipR, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(pivotEnd, -pivotR);
    } else {
      ctx.arc(pivotEnd, 0, pivotR, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(tipEnd, tipR);
      ctx.arc(tipEnd, 0, tipR, Math.PI / 2, -Math.PI / 2);
      ctx.lineTo(pivotEnd, -pivotR);
    }
    ctx.closePath();
  };

  const drawFlipper = (body, isLeft, mini) => {
    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);

    const len = mini ? FLIPPER_LEN * 0.6 : FLIPPER_LEN;
    const w = mini ? FLIPPER_W - 2 : FLIPPER_W;
    const hw = len / 2, hh = w / 2;
    const active = isLeft ? g.leftActive : g.rightActive;
    const pivotEnd = isLeft ? -hw : hw;
    const tipEnd = isLeft ? hw : -hw;
    const pivotR = hh;
    const tipR = mini ? hh * 0.5 : hh * 0.6;

    if (mini) ctx.globalAlpha = 0.85;

    if (active && !g.lowPerf) {
      ctx.shadowColor = c.p;
      ctx.shadowBlur = 15;
    }

    _flipperPath(ctx, pivotEnd, tipEnd, pivotR, tipR, isLeft);
    ctx.strokeStyle = active ? '#FFF' : c.s;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const grad = ctx.createLinearGradient(-hw, -hh, -hw, hh);
    if (active) {
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, c.s);
      grad.addColorStop(0.7, c.p);
      grad.addColorStop(1, '#444');
    } else {
      grad.addColorStop(0, c.s + 'CC');
      grad.addColorStop(0.4, c.s + '88');
      grad.addColorStop(1, '#333');
    }
    _flipperPath(ctx, pivotEnd, tipEnd, pivotR, tipR, isLeft);
    ctx.fillStyle = grad;
    ctx.fill();

    _flipperPath(ctx, pivotEnd, tipEnd, pivotR, tipR, isLeft);
    ctx.clip();
    const hlGrad = ctx.createLinearGradient(0, -hh, 0, 0);
    hlGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hlGrad;
    ctx.fillRect(-hw - pivotR, -hh, len + pivotR * 2, hh);

    ctx.beginPath();
    ctx.arc(pivotEnd, 0, pivotR * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.strokeStyle = active ? '#FFF' : c.s;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  };

  drawFlipper(g.leftFlipper, true, false);
  drawFlipper(g.rightFlipper, false, false);

  if (g.leftFlipper2) {
    drawFlipper(g.leftFlipper2, true, true);
    drawFlipper(g.rightFlipper2, false, true);
  }
}
