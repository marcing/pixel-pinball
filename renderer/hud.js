import { TW, TH, BALL_R, S, scoreForLevel } from '../constants.js';

export function renderLaunchIndicator(ctx) {
  const g = this.g;
  const c = g.getLevelCfg().colors;
  const t = g.animTime;
  const now = Date.now();

  // Lane geometry
  const laneX = 383 * S, laneW = (TW - 16) - 383 * S;
  const laneTop = 95 * S, laneBot = 755 * S;
  const laneCX = laneX + laneW / 2;

  // Init arrow positions
  const arrowSpacing = 55 * S;
  const arrowCount = Math.floor((laneBot - laneTop - 60 * S) / arrowSpacing);
  if (!this._laneArrowsInit || this.laneArrows.length !== arrowCount) {
    this.laneArrows = [];
    for (let i = 0; i < arrowCount; i++) {
      this.laneArrows.push({ y: laneBot - 40 * S - i * arrowSpacing, litTime: 0 });
    }
    this._laneArrowsInit = true;
  }

  // Track ball in lane - light up arrows as ball passes
  if (g.ball) {
    const bx = g.ball.position.x, by = g.ball.position.y;
    const inLane = bx > 383 * S && bx < (TW - 16);
    if (inLane) {
      for (const arrow of this.laneArrows) {
        if (Math.abs(by - arrow.y) < arrowSpacing * 0.6) {
          arrow.litTime = now;
        }
      }
    }
  }

  // Side rail strips
  const railGrad = ctx.createLinearGradient(laneX, laneTop, laneX, laneBot);
  railGrad.addColorStop(0, c.p + '00');
  railGrad.addColorStop(0.3, c.p + '30');
  railGrad.addColorStop(0.7, c.p + '30');
  railGrad.addColorStop(1, c.p + '00');
  ctx.fillStyle = railGrad;
  ctx.fillRect(laneX, laneTop, 3, laneBot - laneTop);
  ctx.fillRect(laneX + laneW - 3, laneTop, 3, laneBot - laneTop);

  // Dashed center line
  ctx.strokeStyle = c.p;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.08;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  ctx.moveTo(laneCX, laneTop + 10);
  ctx.lineTo(laneCX, laneBot - 10);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // ===== ARROWS (only visible after ball is launched) =====
  if (!g.ballLaunched) { /* skip arrows before launch */ }
  else {
  const arrowW = 14 * S;
  const arrowH = 10 * S;

  for (let i = 0; i < this.laneArrows.length; i++) {
    const arrow = this.laneArrows[i];
    const ay = arrow.y;
    const litAge = now - arrow.litTime;
    const isLit = litAge < 800;
    const litFactor = isLit ? Math.max(0, 1 - litAge / 800) : 0;

    // Ambient pulse for unlit arrows
    const ambPulse = 0.08 + Math.sin(t * 2 + i * 0.9) * 0.04;

    // Glow behind arrow when lit
    if (isLit) {
      ctx.save();
      ctx.shadowColor = c.p;
      ctx.shadowBlur = 15 * litFactor;
      const glowGrad = ctx.createRadialGradient(laneCX, ay, 0, laneCX, ay, arrowW + 8);
      glowGrad.addColorStop(0, c.p + Math.floor(litFactor * 80).toString(16).padStart(2, '0'));
      glowGrad.addColorStop(1, c.p + '00');
      ctx.fillStyle = glowGrad;
      ctx.globalAlpha = litFactor * 0.7;
      ctx.fillRect(laneX + 2, ay - arrowH, laneW - 4, arrowH * 2);
      ctx.restore();
    }

    // Arrow chevron (double)
    const drawChevron = (cx, cy, w, h, alpha) => {
      ctx.beginPath();
      ctx.moveTo(cx - w, cy + h);
      ctx.lineTo(cx, cy - h);
      ctx.lineTo(cx + w, cy + h);
      ctx.strokeStyle = isLit ? '#FFF' : c.p;
      ctx.lineWidth = isLit ? 2.5 : 1.5;
      ctx.globalAlpha = alpha;
      ctx.stroke();
    };

    const baseAlpha = isLit ? 0.5 + litFactor * 0.5 : ambPulse;

    // Upper chevron
    drawChevron(laneCX, ay - arrowH * 0.3, arrowW * 0.45, arrowH * 0.4, baseAlpha);
    // Lower chevron
    drawChevron(laneCX, ay + arrowH * 0.4, arrowW * 0.45, arrowH * 0.4, baseAlpha * 0.7);

    // Small dot below arrow pair
    ctx.beginPath();
    ctx.arc(laneCX, ay + arrowH * 0.95, isLit ? 2.5 : 1.5, 0, Math.PI * 2);
    ctx.fillStyle = isLit ? '#FFF' : c.p;
    ctx.globalAlpha = isLit ? 0.6 + litFactor * 0.4 : ambPulse * 0.8;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  } // end arrows block

  // ===== SPRING & PLUNGER (only when ball not launched) =====
  if (g.ballLaunched) return;

  const ballY = g.ball ? g.ball.position.y : 670 * S;
  const springCX = 398 * S;

  // Spring coils - metallic 3D look
  const pullBack = g.launchCharging ? g.launchPower * 15 * S : 0;
  const springTop = ballY + BALL_R + 2;
  const springBot = springTop + 60 * S + pullBack;
  const coils = 8;
  const coilH = (springBot - springTop) / coils;
  const zigzagW = 12;
  const coilThick = 5;

  // Draw each coil segment with metallic shading
  for (let i = 0; i < coils; i++) {
    const y1 = springTop + i * coilH;
    const y2 = springTop + (i + 1) * coilH;
    const x1 = i === 0 ? springCX : springCX + (i % 2 === 0 ? -zigzagW : zigzagW);
    const x2 = springCX + ((i + 1) % 2 === 0 ? -zigzagW : zigzagW);

    // Shadow layer
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = coilThick + 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(x1 + 1, y1 + 1); ctx.lineTo(x2 + 1, y2 + 1); ctx.stroke();

    // Main metallic stroke — gradient per segment
    const segGrad = ctx.createLinearGradient(springCX - zigzagW, 0, springCX + zigzagW, 0);
    segGrad.addColorStop(0, '#404040');
    segGrad.addColorStop(0.3, '#A0A0A0');
    segGrad.addColorStop(0.5, '#E0E0E0');
    segGrad.addColorStop(0.7, '#A0A0A0');
    segGrad.addColorStop(1, '#404040');
    ctx.strokeStyle = segGrad;
    ctx.lineWidth = coilThick;
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    // Top highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1 - 1); ctx.lineTo(x2, y2 - 1); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Plunger handle — compact square metallic knob
  const handleY = springBot + 2;
  const charging = g.launchCharging;
  const chargePow = charging ? g.launchPower : 0;
  const knobW = 22 * S;
  const knobH = 14 * S;
  const knobR = 3 * S;
  const kx = springCX - knobW / 2;
  const ky = handleY;

  // Knob body — rounded rectangle
  const knobGrad = ctx.createLinearGradient(kx, ky, kx + knobW, ky + knobH);
  knobGrad.addColorStop(0, '#404040');
  knobGrad.addColorStop(0.2, '#A0A0A0');
  knobGrad.addColorStop(0.4, '#E0E0E0');
  knobGrad.addColorStop(0.6, '#A0A0A0');
  knobGrad.addColorStop(0.8, '#505050');
  knobGrad.addColorStop(1, '#303030');
  ctx.beginPath();
  ctx.moveTo(kx + knobR, ky);
  ctx.lineTo(kx + knobW - knobR, ky);
  ctx.arcTo(kx + knobW, ky, kx + knobW, ky + knobR, knobR);
  ctx.lineTo(kx + knobW, ky + knobH - knobR);
  ctx.arcTo(kx + knobW, ky + knobH, kx + knobW - knobR, ky + knobH, knobR);
  ctx.lineTo(kx + knobR, ky + knobH);
  ctx.arcTo(kx, ky + knobH, kx, ky + knobH - knobR, knobR);
  ctx.lineTo(kx, ky + knobR);
  ctx.arcTo(kx, ky, kx + knobR, ky, knobR);
  ctx.closePath();
  ctx.fillStyle = knobGrad;
  ctx.fill();

  // Border
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Grip lines (horizontal)
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const ly = ky + knobH * (0.15 + i * 0.2);
    ctx.beginPath();
    ctx.moveTo(kx + knobW * 0.2, ly);
    ctx.lineTo(kx + knobW * 0.8, ly);
    ctx.stroke();
  }

  // Left highlight streak
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(kx + 3, ky + 3);
  ctx.lineTo(kx + 3, ky + knobH - 3);
  ctx.stroke();

  ctx.globalAlpha = 1;

  // Power bar
  if (g.launchCharging) {
    const barH = g.launchPower * 300 * S;
    const barBot = 710 * S;
    const grad2 = ctx.createLinearGradient(0, barBot, 0, barBot - barH);
    grad2.addColorStop(0, '#FF4444');
    grad2.addColorStop(0.5, '#FFAA00');
    grad2.addColorStop(1, '#44FF44');
    ctx.fillStyle = grad2;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(laneX + 2, barBot - barH, 5, barH);
    ctx.globalAlpha = 1;

    // Lane glow
    ctx.globalAlpha = g.launchPower * 0.12;
    ctx.fillStyle = c.p;
    ctx.fillRect(laneX, 450 * S, laneW, 260 * S);
    ctx.globalAlpha = 1;

    // Power percentage
    ctx.fillStyle = '#FFF';
    ctx.globalAlpha = 0.7;
    ctx.font = 'bold ' + Math.floor(12 * S) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(g.launchPower * 100) + '%', springCX, 650 * S);
    ctx.globalAlpha = 1;
  }

  // Blinking arrow (idle)
  if (!g.launchCharging) {
    const blink = Math.sin(t * 4) > 0;
    if (blink) {
      ctx.fillStyle = c.p;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(springCX, 640 * S);
      ctx.lineTo(springCX - 8, 656 * S);
      ctx.lineTo(springCX + 8, 656 * S);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  ctx.globalAlpha = 1;
}

export function renderHUD(ctx) {
  const g = this.g;
  const c = g.getLevelCfg() ? g.getLevelCfg().colors : { p: '#FF6B35', s: '#FFF', a: '#E040FB' };
  const target = scoreForLevel(g.level);

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold ' + Math.floor(20 * S) + 'px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE: ' + g.levelScore, 25 * S, 40 * S);

  ctx.fillStyle = c.p;
  ctx.font = 'bold ' + Math.floor(14 * S) + 'px monospace';
  ctx.fillText('LEVEL ' + g.level + ': ' + (g.getLevelCfg() ? g.getLevelCfg().name : ''), 25 * S, 58 * S);

  // Level progress bar
  const barW = 180 * S, barH = 7, barX = 25 * S, barY = 66 * S;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(barX, barY, barW, barH);
  const progress = Math.min(g.levelScore / target, 1);
  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barGrad.addColorStop(0, c.p);
  barGrad.addColorStop(1, c.a);
  ctx.fillStyle = barGrad;
  ctx.fillRect(barX, barY, barW * progress, barH);

  ctx.fillStyle = c.s;
  ctx.globalAlpha = 0.6;
  ctx.font = Math.floor(12 * S) + 'px monospace';
  ctx.fillText(g.levelScore + ' / ' + target, 25 * S, 84 * S);
  ctx.globalAlpha = 1;

  // Reset button (rotated along arc curve, styled like walls)
  if (g.state === 'PLAYING') {
    const bw = 64 * S, bh = 22 * S, br = 5 * S;

    // Compute position along the top-right arc
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

    const isHover = g.resetButtonHover;
    const clickAge = Date.now() - (g.resetFlashTime || 0);
    const isClicked = clickAge < 300;
    const clickFade = isClicked ? 1 - clickAge / 300 : 0;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(btnAngle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer glow layer (like wall glow)
    ctx.beginPath();
    ctx.roundRect(-bw/2 - 3, -bh/2 - 3, bw + 6, bh + 6, br + 3);
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 8;
    ctx.globalAlpha = isClicked ? 0.25 + clickFade * 0.2 : isHover ? 0.15 : 0.08;
    ctx.stroke();

    // Fill — subtle theme tint
    ctx.beginPath();
    ctx.roundRect(-bw/2, -bh/2, bw, bh, br);
    if (isClicked) {
      ctx.fillStyle = c.s + Math.floor(40 + clickFade * 80).toString(16).padStart(2, '0');
    } else if (isHover) {
      ctx.fillStyle = c.s + '25';
    } else {
      ctx.fillStyle = c.s + '12';
    }
    ctx.globalAlpha = 1;
    ctx.fill();

    // Main border (wall style with shadow glow)
    ctx.shadowColor = isClicked ? '#FFF' : c.s;
    ctx.shadowBlur = isClicked ? 20 * clickFade + 12 : isHover ? 16 : 12;
    ctx.beginPath();
    ctx.roundRect(-bw/2, -bh/2, bw, bh, br);
    ctx.strokeStyle = isClicked ? '#FFF' : c.s;
    ctx.lineWidth = isHover ? 4 : 3;
    ctx.globalAlpha = isClicked ? 0.9 + clickFade * 0.1 : isHover ? 0.7 : 0.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // "RESET" text
    ctx.fillStyle = isClicked ? '#FFF' : c.s;
    ctx.globalAlpha = isClicked ? 1 : isHover ? 0.9 : 0.7;
    ctx.font = 'bold ' + Math.floor(14 * S) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isClicked) {
      ctx.shadowColor = c.s;
      ctx.shadowBlur = 15 * clickFade;
    }
    ctx.fillText('RESET', 0, 1);
    ctx.shadowBlur = 0;

    // Click flash burst — expanding ring
    if (isClicked) {
      const ringR = bw * 0.3 + (1 - clickFade) * bw * 0.4;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = c.s;
      ctx.lineWidth = 2 * clickFade;
      ctx.globalAlpha = clickFade * 0.5;
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Reset viewport flash — brief themed overlay
  const resetAge = Date.now() - (g.resetFlashTime || 0);
  if (resetAge < 350) {
    const flashFade = 1 - resetAge / 350;
    ctx.fillStyle = '#FFF';
    ctx.globalAlpha = flashFade * 0.25;
    ctx.fillRect(0, 0, TW, TH);
    ctx.fillStyle = c.s;
    ctx.globalAlpha = flashFade * 0.1;
    ctx.fillRect(0, 0, TW, TH);
    ctx.globalAlpha = 1;
  }

  // Score popups
  for (const p of g.scorePopups) {
    const isCombo = p.combo;
    const scale = 1 + (1 - p.life / (isCombo ? 1.8 : 1.5)) * 0.3;
    const baseSize = isCombo ? 24 : 20;
    const size = Math.floor(baseSize * S * scale);
    ctx.globalAlpha = Math.min(p.life * 1.5, 1);
    ctx.font = 'bold ' + size + 'px monospace';
    ctx.textAlign = 'center';
    const glowColor = isCombo ? '#FF4500' : '#FFD700';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isCombo ? 18 : 12;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = isCombo ? 4 : 3;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = isCombo ? '#FF6B35' : '#FFD700';
    ctx.fillText(p.text, p.x, p.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  // Combo meter display
  if (g.comboMultiplier > 1) {
    const elapsed = Date.now() - g.comboTimer;
    const remaining = Math.max(0, 1 - elapsed / g.comboWindow);
    if (remaining > 0) {
      const cx = TW / 2, cy = 110 * S;
      ctx.globalAlpha = remaining;
      ctx.font = 'bold ' + Math.floor(18 * S) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF4500';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#FF6B35';
      ctx.fillText('COMBO x' + g.comboMultiplier + ' (' + g.comboCount + ' hits)', cx, cy);
      const barW = 120 * S, barH = 4 * S;
      ctx.fillStyle = '#333';
      ctx.fillRect(cx - barW / 2, cy + 6 * S, barW, barH);
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(cx - barW / 2, cy + 6 * S, barW * remaining, barH);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }
}

export function renderWallFriction(ctx) {
  const g = this.g;
  const contacts = g.wallFrictionContacts;
  if (!contacts || contacts.length === 0) return;

  const c = g.getLevelCfg().colors;
  const now = Date.now();
  const sparkColors = ['#FFD700', '#FF8C00', '#FFA500', '#FFEF00', '#FFF'];

  for (const hit of contacts) {
    const age = now - hit.time;
    if (age > 500) continue;
    const life = 1 - age / 500;
    const intensity = Math.min(hit.spd / 8, 1);

    // Glow at contact point
    const glowR = (10 + intensity * 15) * life;
    const glowGrad = ctx.createRadialGradient(hit.x, hit.y, 0, hit.x, hit.y, glowR);
    glowGrad.addColorStop(0, 'rgba(255, 200, 50, ' + (life * 0.4 * intensity) + ')');
    glowGrad.addColorStop(0.5, 'rgba(255, 140, 0, ' + (life * 0.2 * intensity) + ')');
    glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(hit.x - glowR, hit.y - glowR, glowR * 2, glowR * 2);

    // Small spark particles flying away from wall
    const numSparks = Math.floor(3 + intensity * 4);
    const seed = hit.time % 1000;
    for (let s = 0; s < numSparks; s++) {
      const sparkLife = life * (1 - s * 0.1);
      if (sparkLife <= 0) continue;

      const angle = Math.atan2(hit.vy, hit.vx) + (((seed * (s + 1) * 7) % 100) / 100 - 0.5) * 2.5;
      const dist = age * 0.04 * (1 + ((seed * (s + 3)) % 50) / 50) * intensity;
      const sx = hit.x - Math.cos(angle) * dist;
      const sy = hit.y - Math.sin(angle) * dist;

      const sparkR = (1 + intensity * 2) * sparkLife;
      const sparkCol = sparkColors[s % sparkColors.length];

      ctx.beginPath();
      ctx.arc(sx, sy, sparkR, 0, Math.PI * 2);
      ctx.fillStyle = sparkCol;
      ctx.globalAlpha = sparkLife * 0.8;
      ctx.fill();

      // Tiny trail behind each spark
      if (dist > 3) {
        const tx = hit.x - Math.cos(angle) * dist * 0.5;
        const ty = hit.y - Math.sin(angle) * dist * 0.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = sparkCol;
        ctx.lineWidth = sparkR * 0.6;
        ctx.globalAlpha = sparkLife * 0.3;
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
}
