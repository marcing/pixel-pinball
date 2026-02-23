export const Deco = {
  gamepad(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath();
    const rw = s * 1.2, rh = s * 0.6;
    ctx.moveTo(x - rw / 2 + 8, y - rh / 2);
    ctx.lineTo(x + rw / 2 - 8, y - rh / 2);
    ctx.quadraticCurveTo(x + rw / 2, y - rh / 2, x + rw / 2, y - rh / 2 + 8);
    ctx.lineTo(x + rw / 2, y + rh / 2 - 8);
    ctx.quadraticCurveTo(x + rw / 2, y + rh / 2, x + rw / 2 - 8, y + rh / 2);
    ctx.lineTo(x - rw / 2 + 8, y + rh / 2);
    ctx.quadraticCurveTo(x - rw / 2, y + rh / 2, x - rw / 2, y + rh / 2 - 8);
    ctx.lineTo(x - rw / 2, y - rh / 2 + 8);
    ctx.quadraticCurveTo(x - rw / 2, y - rh / 2, x - rw / 2 + 8, y - rh / 2);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - s * 0.25, y, s * 0.1, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + s * 0.25, y, s * 0.1, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },
  dpad(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c;
    const w = s * 0.3, h = s * 0.9;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.fillRect(x - h / 2, y - w / 2, h, w);
    ctx.restore();
  },
  keyboard(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.1; ctx.strokeStyle = c; ctx.lineWidth = 1.5;
    ctx.strokeRect(x - s * 0.6, y - s * 0.3, s * 1.2, s * 0.6);
    for (let r = 0; r < 3; r++)
      for (let col = 0; col < 5; col++) {
        ctx.strokeRect(x - s * 0.5 + col * s * 0.22, y - s * 0.2 + r * s * 0.18, s * 0.16, s * 0.12);
      }
    ctx.restore();
  },
  mouse(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, s * 0.3, s * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.3); ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - s * 0.15, s * 0.08, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },
  heart(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.4);
    ctx.bezierCurveTo(x - s * 0.5, y, x - s * 0.5, y - s * 0.35, x, y - s * 0.15);
    ctx.bezierCurveTo(x + s * 0.5, y - s * 0.35, x + s * 0.5, y, x, y + s * 0.4);
    ctx.fill(); ctx.restore();
  },
  star(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
      const r = s * 0.45;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
      const a2 = a + 2 * Math.PI / 5;
      ctx.lineTo(x + Math.cos(a2) * r * 0.4, y + Math.sin(a2) * r * 0.4);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  },
  monitor(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.1; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.strokeRect(x - s * 0.45, y - s * 0.35, s * 0.9, s * 0.55);
    ctx.fillStyle = c; ctx.fillRect(x - s * 0.1, y + s * 0.2, s * 0.2, s * 0.15);
    ctx.fillRect(x - s * 0.25, y + s * 0.35, s * 0.5, s * 0.05);
    ctx.restore();
  },
  lightning(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.15; ctx.strokeStyle = c; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.1, y - s * 0.5);
    ctx.lineTo(x - s * 0.15, y); ctx.lineTo(x + s * 0.1, y);
    ctx.lineTo(x - s * 0.1, y + s * 0.5);
    ctx.stroke(); ctx.restore();
  },
  coin(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, s * 0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.font = (s * 0.4) + 'px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = c; ctx.fillText('$', x, y);
    ctx.restore();
  },
  rocket(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.5);
    ctx.lineTo(x - s * 0.15, y + s * 0.3);
    ctx.lineTo(x + s * 0.15, y + s * 0.3);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.15, y + s * 0.15); ctx.lineTo(x - s * 0.3, y + s * 0.35);
    ctx.lineTo(x - s * 0.15, y + s * 0.3); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.15, y + s * 0.15); ctx.lineTo(x + s * 0.3, y + s * 0.35);
    ctx.lineTo(x + s * 0.15, y + s * 0.3); ctx.stroke();
    ctx.restore();
  },
  gear(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath();
    const teeth = 8, outer = s * 0.4, inner = s * 0.3;
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.35) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
      const a4 = ((i + 0.85) / teeth) * Math.PI * 2;
      ctx.lineTo(x + Math.cos(a1) * inner, y + Math.sin(a1) * inner);
      ctx.lineTo(x + Math.cos(a2) * outer, y + Math.sin(a2) * outer);
      ctx.lineTo(x + Math.cos(a3) * outer, y + Math.sin(a3) * outer);
      ctx.lineTo(x + Math.cos(a4) * inner, y + Math.sin(a4) * inner);
    }
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, s * 0.12, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },
  trophy(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.25, y - s * 0.3);
    ctx.lineTo(x + s * 0.25, y - s * 0.3);
    ctx.lineTo(x + s * 0.15, y + s * 0.1);
    ctx.lineTo(x - s * 0.15, y + s * 0.1);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(x - s * 0.05, y + s * 0.1, s * 0.1, s * 0.15);
    ctx.fillRect(x - s * 0.2, y + s * 0.25, s * 0.4, s * 0.06);
    ctx.restore();
  },
  crown(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.35, y + s * 0.2);
    ctx.lineTo(x - s * 0.35, y - s * 0.1);
    ctx.lineTo(x - s * 0.15, y + s * 0.05);
    ctx.lineTo(x, y - s * 0.3);
    ctx.lineTo(x + s * 0.15, y + s * 0.05);
    ctx.lineTo(x + s * 0.35, y - s * 0.1);
    ctx.lineTo(x + s * 0.35, y + s * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  arcadeCab(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.1; ctx.strokeStyle = c; ctx.lineWidth = 2;
    const w = s * 0.4, h = s * 0.8;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeRect(x - w * 0.35, y - h * 0.35, w * 0.7, h * 0.3);
    ctx.beginPath(); ctx.arc(x - w * 0.12, y + h * 0.1, s * 0.05, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w * 0.12, y + h * 0.1, s * 0.05, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + h * 0.18); ctx.lineTo(x, y + h * 0.28); ctx.stroke();
    ctx.restore();
  },
  chip(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.1; ctx.strokeStyle = c; ctx.lineWidth = 1.5;
    const w = s * 0.6, h = s * 0.4;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    const pins = 6;
    for (let i = 0; i < pins; i++) {
      const px = x - w / 2 + (i + 0.5) * (w / pins);
      ctx.beginPath(); ctx.moveTo(px, y - h / 2); ctx.lineTo(px, y - h / 2 - s * 0.1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, y + h / 2); ctx.lineTo(px, y + h / 2 + s * 0.1); ctx.stroke();
    }
    ctx.restore();
  },
  invader(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c;
    const ps = s * 0.08;
    const pattern = [
      [0,0,1,0,0,0,0,0,1,0,0],
      [0,0,0,1,0,0,0,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [0,1,1,0,1,1,1,0,1,1,0],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,0,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,1],
      [0,0,0,1,1,0,1,1,0,0,0],
    ];
    const ox = x - (pattern[0].length * ps) / 2;
    const oy = y - (pattern.length * ps) / 2;
    for (let r = 0; r < pattern.length; r++)
      for (let col = 0; col < pattern[r].length; col++)
        if (pattern[r][col]) ctx.fillRect(ox + col * ps, oy + r * ps, ps, ps);
    ctx.restore();
  },
  ghost(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y - s * 0.1, s * 0.3, Math.PI, 0);
    ctx.lineTo(x + s * 0.3, y + s * 0.3);
    for (let i = 0; i < 3; i++) {
      const bx = x + s * 0.3 - (i + 1) * s * 0.2;
      ctx.lineTo(bx + s * 0.1, y + s * 0.15);
      ctx.lineTo(bx, y + s * 0.3);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.arc(x - s * 0.1, y - s * 0.12, s * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + s * 0.1, y - s * 0.12, s * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  joystick(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.1; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y + s * 0.25, s * 0.3, s * 0.12, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.13); ctx.lineTo(x, y - s * 0.25); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - s * 0.3, s * 0.1, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },
  sword(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.5); ctx.lineTo(x, y + s * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - s * 0.2, y + s * 0.05); ctx.lineTo(x + s * 0.2, y + s * 0.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - s * 0.06, y + s * 0.15); ctx.lineTo(x + s * 0.06, y + s * 0.15);
    ctx.lineTo(x + s * 0.06, y + s * 0.4); ctx.lineTo(x - s * 0.06, y + s * 0.4); ctx.closePath(); ctx.stroke();
    ctx.restore();
  },
  ufo(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    // Dome (top bubble)
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.12, s * 0.18, s * 0.2, 0, Math.PI, 0);
    ctx.stroke();
    // Main saucer body
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.45, s * 0.14, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Under-rim detail
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.06, s * 0.3, s * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Bottom lights
    ctx.fillStyle = c;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(x + i * s * 0.12, y + s * 0.15, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
    // Beam (subtle triangle below)
    ctx.beginPath();
    ctx.moveTo(x - s * 0.15, y + s * 0.18);
    ctx.lineTo(x + s * 0.15, y + s * 0.18);
    ctx.lineTo(x + s * 0.25, y + s * 0.45);
    ctx.lineTo(x - s * 0.25, y + s * 0.45);
    ctx.closePath();
    ctx.globalAlpha = 0.04; ctx.fillStyle = c; ctx.fill();
    ctx.restore();
  },
  euro(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, s * 0.38, 0, Math.PI * 2); ctx.stroke();
    ctx.font = 'bold ' + (s * 0.48) + 'px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = c; ctx.fillText('\u20AC', x, y + 1);
    ctx.restore();
  },
  potion(ctx, x, y, s, c) {
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - s * 0.08, y - s * 0.35); ctx.lineTo(x + s * 0.08, y - s * 0.35);
    ctx.lineTo(x + s * 0.08, y - s * 0.15);
    ctx.quadraticCurveTo(x + s * 0.3, y, x + s * 0.25, y + s * 0.25);
    ctx.quadraticCurveTo(x + s * 0.2, y + s * 0.4, x, y + s * 0.4);
    ctx.quadraticCurveTo(x - s * 0.2, y + s * 0.4, x - s * 0.25, y + s * 0.25);
    ctx.quadraticCurveTo(x - s * 0.3, y, x - s * 0.08, y - s * 0.15);
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = c; ctx.globalAlpha = 0.06;
    ctx.fill();
    ctx.restore();
  }
};

export const DECO_LIST = [
  'gamepad', 'dpad', 'keyboard', 'mouse', 'heart', 'star', 'monitor',
  'lightning', 'coin', 'rocket', 'gear', 'trophy', 'crown',
  'arcadeCab', 'chip', 'invader', 'ghost', 'joystick', 'sword', 'potion'
];
