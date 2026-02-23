import { TW, TH } from './constants.js';

export class ParticleSystem {
  constructor() { this.particles = []; }

  emit(x, y, color, count) {
    count = count || 10;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: 0.015 + Math.random() * 0.03,
        color, size: 2 + Math.random() * 4
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.08;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  render(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export class LightSystem {
  constructor() { this.flashes = []; }

  add(x, y, color, radius) {
    this.flashes.push({ x, y, color, radius: radius || 60, life: 1, decay: 0.04 });
  }

  screen(color) {
    this.flashes.push({ x: TW / 2, y: TH / 2, color, radius: TW, life: 0.4, decay: 0.04, full: true });
  }

  update() {
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      this.flashes[i].life -= this.flashes[i].decay;
      if (this.flashes[i].life <= 0) this.flashes.splice(i, 1);
    }
  }

  render(ctx) {
    if (this.flashes.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const f of this.flashes) {
      if (f.full) {
        ctx.globalAlpha = f.life * 0.12;
        ctx.fillStyle = f.color;
        ctx.fillRect(0, 0, TW, TH);
      } else {
        const r = f.radius * f.life;

        // Outer bloom (wide, dim)
        ctx.globalAlpha = f.life * 0.06;
        const g1 = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 2.5);
        g1.addColorStop(0, f.color);
        g1.addColorStop(0.3, f.color);
        g1.addColorStop(1, 'transparent');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Main glow
        ctx.globalAlpha = f.life * 0.25;
        const g2 = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        g2.addColorStop(0, '#FFFFFF');
        g2.addColorStop(0.05, f.color);
        g2.addColorStop(0.5, f.color);
        g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.globalAlpha = f.life * 0.5;
        const coreR = Math.max(3, r * 0.18);
        const g3 = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, coreR);
        g3.addColorStop(0, '#FFFFFF');
        g3.addColorStop(0.6, f.color);
        g3.addColorStop(1, 'transparent');
        ctx.fillStyle = g3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, coreR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
