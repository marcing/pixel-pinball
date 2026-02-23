import { TW, TH, TOTAL_LEVELS, S } from '../constants.js';
import { Deco } from '../decorations.js';

export function renderMenu(ctx) {
  const g = this.g;
  this.renderBackground(ctx);
  this.renderUfoFlyby(ctx);
  this.renderRocketFlyby(ctx);
  this.renderShootingStar(ctx);
  this.renderInvaderMarch(ctx);
  this.renderPacmanChase(ctx);
  this.renderTetromino(ctx);
  this.renderPixelBat(ctx);
  this.renderInsertCoin(ctx);
  this.renderSatellite(ctx);
  this.renderMarioChase(ctx);
  this.renderSaturn(ctx);
  this.renderBirdOfPrey(ctx);
  this.renderEnterprise(ctx);
  this.renderBorgCube(ctx);

  const t = g.animTime;

  Deco.gamepad(ctx, 100 * S, 340 * S, 90 * S, '#FF6B35');
  Deco.joystick(ctx, 300 * S, 370 * S, 70 * S, '#E040FB');
  Deco.arcadeCab(ctx, 200 * S, 310 * S, 60 * S, '#00E676');
  Deco.invader(ctx, 150 * S, 420 * S, 55 * S, '#2979FF');
  Deco.ghost(ctx, 280 * S, 450 * S, 50 * S, '#FF4081');
  Deco.dpad(ctx, 60 * S, 450 * S, 50 * S, '#FFEA00');

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold ' + Math.floor(45 * S) + 'px monospace';
  ctx.textAlign = 'center';
  const titleY = 180 * S + Math.sin(t * 1.5) * 8;
  ctx.shadowColor = '#FF6B35';
  ctx.shadowBlur = 20;
  ctx.fillText('PIXEL', TW / 2, titleY);
  ctx.fillStyle = '#FF6B35';
  ctx.fillText('PINBALL', TW / 2, titleY + 50 * S);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#AAA';
  ctx.font = Math.floor(14 * S) + 'px monospace';
  ctx.fillText('A Game by Oliver Gil', TW / 2, titleY + 95 * S);

  const hasSave = !!g._savedProgress;
  const blink = Math.sin(t * 3) > 0;
  if (blink) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold ' + Math.floor(18 * S) + 'px monospace';
    if (hasSave) {
      ctx.fillText(g.isMobile ? 'TAP TO CONTINUE' : 'PRESS SPACE TO CONTINUE', TW / 2, 520 * S);
    } else {
      ctx.fillText(g.isMobile ? 'TAP TO START' : 'PRESS SPACE TO START', TW / 2, 520 * S);
    }
  }

  // Show saved progress info
  if (hasSave) {
    ctx.fillStyle = '#6cf';
    ctx.font = Math.floor(13 * S) + 'px monospace';
    ctx.fillText('Saved: Level ' + g._savedProgress.level + ' | Score: ' + g._savedProgress.totalScore, TW / 2, 548 * S);
  }

  ctx.fillStyle = '#888';
  ctx.font = Math.floor(12 * S) + 'px monospace';
  const ctrlY = hasSave ? 575 * S : 560 * S;
  if (g.isMobile) {
    ctx.fillText('Touch left/right to control flippers', TW / 2, ctrlY);
    ctx.fillText('Touch bottom-right to launch', TW / 2, ctrlY + 18 * S);
  } else {
    ctx.fillText('LEFT CTRL / RIGHT CTRL = Flippers', TW / 2, ctrlY);
    ctx.fillText('SPACE = Launch ball  |  R = Reset ball', TW / 2, ctrlY + 18 * S);
  }
  ctx.fillText('20 Levels | Progressive scoring', TW / 2, ctrlY + 40 * S);

  // Year
  ctx.fillStyle = '#666';
  ctx.font = Math.floor(14 * S) + 'px monospace';
  ctx.fillText('2026', TW / 2, TH - 30 * S);
}

export function renderShared(ctx) {
  const g = this.g;
  this.renderBackground(ctx);
  this.renderUfoFlyby(ctx);
  this.renderRocketFlyby(ctx);
  this.renderShootingStar(ctx);
  this.renderInvaderMarch(ctx);
  this.renderPacmanChase(ctx);
  this.renderTetromino(ctx);
  this.renderPixelBat(ctx);
  this.renderInsertCoin(ctx);
  this.renderSatellite(ctx);
  this.renderMarioChase(ctx);
  this.renderSaturn(ctx);
  this.renderBirdOfPrey(ctx);
  this.renderEnterprise(ctx);
  this.renderBorgCube(ctx);

  const t = g.animTime;

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold ' + Math.floor(35 * S) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 15;
  ctx.fillText('CHALLENGE!', TW / 2, 200 * S);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold ' + Math.floor(22 * S) + 'px monospace';
  ctx.fillText('Your friend scored', TW / 2, 280 * S);
  ctx.font = 'bold ' + Math.floor(45 * S) + 'px monospace';
  ctx.fillText(g.sharedScore + ' PTS', TW / 2, 330 * S);
  ctx.font = Math.floor(18 * S) + 'px monospace';
  ctx.fillText('and reached Level ' + g.sharedLevel, TW / 2, 370 * S);

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold ' + Math.floor(18 * S) + 'px monospace';
  ctx.fillText('Can you beat them?', TW / 2, 440 * S);

  const blink = Math.sin(t * 3) > 0;
  if (blink) {
    ctx.fillStyle = '#00E676';
    ctx.font = 'bold ' + Math.floor(22 * S) + 'px monospace';
    ctx.fillText(g.isMobile ? 'TAP TO PLAY' : 'PRESS SPACE TO PLAY', TW / 2, 520 * S);
  }

  ctx.fillStyle = '#555';
  ctx.font = Math.floor(12 * S) + 'px monospace';
  ctx.fillText('Pixel Pinball by Oliver Gil', TW / 2, TH - 30);
}

export function renderLevelComplete(ctx) {
  const g = this.g;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, TW, TH);

  const c = g.getLevelCfg().colors;
  const t = g.animTime;

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold ' + Math.floor(35 * S) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = c.p;
  ctx.shadowBlur = 20;
  ctx.fillText('LEVEL ' + g.level, TW / 2, 300 * S);
  ctx.fillText('COMPLETE!', TW / 2, 345 * S);
  ctx.shadowBlur = 0;

  ctx.fillStyle = c.p;
  ctx.font = Math.floor(18 * S) + 'px monospace';
  ctx.fillText('Score: ' + g.totalScore, TW / 2, 400 * S);

  const blink = Math.sin(t * 3) > 0;
  if (blink) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold ' + Math.floor(16 * S) + 'px monospace';
    if (g.level >= TOTAL_LEVELS) {
      ctx.fillText('PRESS SPACE FOR VICTORY', TW / 2, 460 * S);
    } else {
      ctx.fillText(g.isMobile ? 'TAP FOR NEXT LEVEL' : 'PRESS SPACE FOR NEXT LEVEL', TW / 2, 460 * S);
    }
  }

  if (Math.random() < 0.3) {
    g.particles.emit(Math.random() * TW, Math.random() * TH * 0.5, c.p, 3);
  }
}

export function renderGameOver(ctx) {
  const g = this.g;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, TW, TH);

  const t = g.animTime;

  ctx.fillStyle = '#FF4444';
  ctx.font = 'bold ' + Math.floor(40 * S) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 20;
  ctx.fillText('GAME OVER', TW / 2, 280 * S);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFF';
  ctx.font = Math.floor(18 * S) + 'px monospace';
  ctx.fillText('Final Score: ' + g.totalScore, TW / 2, 340 * S);
  ctx.fillText('Reached Level: ' + g.level, TW / 2, 370 * S);

  // Share button
  const btnW = 220 * S, btnH = 45 * S;
  ctx.fillStyle = '#2979FF';
  ctx.fillRect(TW / 2 - btnW / 2, 420 * S, btnW, btnH);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold ' + Math.floor(15 * S) + 'px monospace';
  ctx.fillText('SHARE SCORE', TW / 2, 420 * S + btnH / 2 + 5);

  ctx.fillStyle = '#888';
  ctx.font = Math.floor(12 * S) + 'px monospace';
  ctx.fillText('(Click to copy link)', TW / 2, 490 * S);

  const blink = Math.sin(t * 3) > 0;
  if (blink) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold ' + Math.floor(16 * S) + 'px monospace';
    ctx.fillText(g.isMobile ? 'TAP TO PLAY AGAIN' : 'PRESS SPACE TO PLAY AGAIN', TW / 2, 540 * S);
  }

  ctx.fillStyle = '#555';
  ctx.font = Math.floor(12 * S) + 'px monospace';
  ctx.fillText('Pixel Pinball by Oliver Gil', TW / 2, TH - 30);

  g._shareButtonBounds = { x: TW / 2 - btnW / 2, y: 420 * S, w: btnW, h: btnH };
}

export function renderVictory(ctx) {
  const g = this.g;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, TW, TH);

  const t = g.animTime;
  const rainbow = ['#FF0000', '#FF7700', '#FFFF00', '#00FF00', '#0077FF', '#8B00FF'];
  const cIdx = Math.floor(t * 3) % rainbow.length;

  ctx.fillStyle = rainbow[cIdx];
  ctx.font = 'bold ' + Math.floor(50 * S) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = rainbow[(cIdx + 3) % rainbow.length];
  ctx.shadowBlur = 25;
  ctx.fillText('YOU WON!', TW / 2, 260 * S);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold ' + Math.floor(24 * S) + 'px monospace';
  ctx.fillText('CONGRATULATIONS!', TW / 2, 320 * S);

  ctx.fillStyle = '#FFF';
  ctx.font = Math.floor(18 * S) + 'px monospace';
  ctx.fillText('Final Score: ' + g.totalScore, TW / 2, 380 * S);
  ctx.fillText('All ' + TOTAL_LEVELS + ' levels completed!', TW / 2, 410 * S);

  Deco.crown(ctx, TW / 2, 160 * S, 100 * S, '#FFD700');
  ctx.globalAlpha = 1;

  const btnW = 220 * S, btnH = 45 * S;

  // Share button
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(TW / 2 - btnW / 2, 450 * S, btnW, btnH);
  ctx.fillStyle = '#000';
  ctx.font = 'bold ' + Math.floor(15 * S) + 'px monospace';
  ctx.fillText('SHARE VICTORY', TW / 2, 450 * S + btnH / 2 + 5);
  g._shareButtonBounds = { x: TW / 2 - btnW / 2, y: 450 * S, w: btnW, h: btnH };

  // Replay button
  const replayY = 520 * S;
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(TW / 2 - btnW / 2, replayY, btnW, btnH);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(TW / 2 - btnW / 2, replayY, btnW, btnH);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold ' + Math.floor(15 * S) + 'px monospace';
  ctx.fillText('REPLAY FROM START', TW / 2, replayY + btnH / 2 + 5);
  g._replayButtonBounds = { x: TW / 2 - btnW / 2, y: replayY, w: btnW, h: btnH };

  ctx.fillStyle = '#888';
  ctx.font = Math.floor(12 * S) + 'px monospace';
  ctx.fillText('Pixel Pinball by Oliver Gil', TW / 2, TH - 30);

  if (Math.random() < 0.4) {
    g.particles.emit(Math.random() * TW, Math.random() * TH * 0.3,
      rainbow[Math.floor(Math.random() * rainbow.length)], 5);
  }

  // Score popups (on top of overlay so "Link copied!" is visible)
  for (const p of g.scorePopups) {
    const scale = 1 + (1 - p.life / 1.5) * 0.3;
    const size = Math.floor(24 * S * scale);
    ctx.globalAlpha = Math.min(p.life * 1.5, 1);
    ctx.font = 'bold ' + size + 'px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = '#FFF';
    ctx.fillText(p.text, p.x, p.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}
