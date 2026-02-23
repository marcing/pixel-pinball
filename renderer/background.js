import { TW, TH, S } from '../constants.js';
import { Deco } from '../decorations.js';

// Themed decoration pools per level (keyed by level number 1-20)
// Each pool has decorations that relate to the level's name/theme
const LEVEL_POOLS = {
  1:  ['gamepad', 'arcadeCab', 'joystick', 'dpad', 'coin', 'star', 'monitor'],       // Arcade Start
  2:  ['dpad', 'gamepad', 'joystick', 'chip', 'monitor', 'arcadeCab', 'gear'],        // Retro Controller
  3:  ['keyboard', 'chip', 'monitor', 'mouse', 'gear', 'dpad', 'lightning'],           // Keyboard Quest
  4:  ['mouse', 'keyboard', 'monitor', 'chip', 'gear', 'ghost', 'star'],              // Mouse Maze
  5:  ['heart', 'star', 'invader', 'ghost', 'potion', 'coin', 'gamepad'],             // Pixel Hearts
  6:  ['monitor', 'arcadeCab', 'chip', 'gamepad', 'joystick', 'dpad', 'gear'],        // Cartridge Bay
  7:  ['dpad', 'gamepad', 'joystick', 'arcadeCab', 'invader', 'ghost', 'star'],       // D-Pad Arena
  8:  ['monitor', 'keyboard', 'chip', 'lightning', 'star', 'gear', 'arcadeCab'],       // Sound Wave
  9:  ['monitor', 'star', 'ghost', 'invader', 'rocket', 'coin', 'heart'],             // Screen Saver
  10: ['gear', 'chip', 'keyboard', 'monitor', 'mouse', 'lightning', 'dpad'],           // USB Connect
  11: ['lightning', 'star', 'rocket', 'gear', 'chip', 'crown', 'trophy'],              // Power Surge
  12: ['coin', 'trophy', 'crown', 'star', 'arcadeCab', 'gamepad', 'euro'],              // Coin Rush
  13: ['rocket', 'invader', 'star', 'lightning', 'ghost', 'monitor', 'gear'],          // Space Battle
  14: ['lightning', 'rocket', 'gear', 'star', 'trophy', 'chip', 'gamepad'],            // Speed Circuit
  15: ['star', 'potion', 'heart', 'ghost', 'invader', 'crown', 'trophy'],              // Puzzle Palace
  16: ['gear', 'chip', 'monitor', 'lightning', 'keyboard', 'mouse', 'arcadeCab'],      // Robot Core
  17: ['lightning', 'rocket', 'star', 'crown', 'invader', 'ghost', 'heart'],           // Dragon Fire
  18: ['star', 'rocket', 'lightning', 'ghost', 'invader', 'monitor', 'potion'],        // Warp Zone
  19: ['trophy', 'crown', 'coin', 'star', 'heart', 'gamepad', 'joystick'],             // Trophy Chase
  20: ['crown', 'trophy', 'lightning', 'star', 'gear', 'rocket', 'invader'],           // Final Boss
};

// Seeded pseudo-random (mulberry32)
function mkRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cache per level number
let _cachedLevel = -1;
let _cachedDecos = null;

function buildLevelDecos(level, icon) {
  const rng = mkRng(level * 7919 + 31);
  const decos = [];
  const DECO_COUNT = 12;

  // Get themed pool for this level
  const pool = LEVEL_POOLS[level] || LEVEL_POOLS[1];

  // Level's own icon appears 2-3 times
  const iconCount = 2 + (rng() > 0.5 ? 1 : 0);

  // Build types: icon first, then picks from themed pool
  const types = [];
  for (let i = 0; i < iconCount; i++) types.push(icon);
  while (types.length < DECO_COUNT) {
    types.push(pool[Math.floor(rng() * pool.length)]);
  }

  // Shuffle types
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  // Generate positions — spread across the table, avoid center band too much
  // Use grid cells to avoid clumping
  const cols = 3;
  const rows = 4;
  const cellW = (TW - 40 * S) / cols;
  const cellH = (TH - 40 * S) / rows;
  const margin = 20 * S;

  for (let i = 0; i < DECO_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    // Jitter within cell
    const jx = rng() * 0.7 + 0.15;
    const jy = rng() * 0.7 + 0.15;
    const x = margin + col * cellW + jx * cellW;
    const y = margin + row * cellH + jy * cellH;
    const size = (35 + rng() * 30) * S;

    decos.push({ fn: types[i], x, y, s: size });
  }

  return decos;
}

export function renderBackground(ctx) {
  const g = this.g;
  const c = (g.state === 'MENU' || g.state === 'SHARED')
    ? { bg: '#0D0D3B', p: '#FF6B35', s: '#00E676', a: '#E040FB' }
    : g.getLevelCfg().colors;
  const t = g.animTime;

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, TW, TH);

  // On low-perf: skip animated stars, grid, and grid dots
  if (!g.lowPerf) {
    for (const s of g.bgStars) {
      const alpha = 0.2 + 0.3 * Math.sin(t * s.speed + s.phase);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = c.p;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.035;
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 1;
    const gs = 50;
    const yOff = (t * 8) % gs;
    const xOff = (t * 6) % gs;
    for (let y = -gs; y < TH + gs; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y + yOff); ctx.lineTo(TW, y + yOff); ctx.stroke();
    }
    for (let x = -gs; x < TW + gs; x += gs) {
      ctx.beginPath(); ctx.moveTo(x + xOff, 0); ctx.lineTo(x + xOff, TH); ctx.stroke();
    }

    for (let y = -gs; y < TH + gs; y += gs) {
      for (let x = -gs; x < TW + gs; x += gs) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + x * 0.05 + y * 0.03);
        ctx.globalAlpha = 0.03 + pulse * 0.03;
        ctx.fillStyle = c.a;
        ctx.beginPath();
        ctx.arc(x + xOff, y + yOff, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;

  if (g.state !== 'MENU' && g.state !== 'SHARED' && g.bgTraces) {
    ctx.strokeStyle = c.s;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.04;
    for (const trace of g.bgTraces) {
      ctx.beginPath();
      for (const seg of trace) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();
      ctx.fillStyle = c.s;
      for (const seg of trace) {
        ctx.beginPath();
        ctx.arc(seg.x2, seg.y2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // CRT scanlines — skip on low-perf (hundreds of fillRect calls)
  if (!g.lowPerf) {
    ctx.globalAlpha = 0.02;
    ctx.fillStyle = '#000';
    for (let y = 0; y < TH; y += 3) {
      ctx.fillRect(0, y, TW, 1);
    }
    ctx.globalAlpha = 1;
  }

  if (g.state !== 'MENU' && g.state !== 'SHARED') {
    const cfg = g.getLevelCfg();
    // Generate or use cached per-level decorations
    if (_cachedLevel !== g.level) {
      _cachedDecos = buildLevelDecos(g.level, cfg.icon);
      _cachedLevel = g.level;
    }
    const bgDecos = _cachedDecos;
    const colors = [c.p, c.s, c.a];
    for (let i = 0; i < bgDecos.length; i++) {
      const d = bgDecos[i];
      const fn = Deco[d.fn] || Deco.star;
      const breath = 1 + Math.sin(t * 0.4 + i * 1.2) * 0.06;
      const yFloat = Math.sin(t * 0.25 + i * 0.7) * 4;
      fn(ctx, d.x, d.y + yFloat, d.s * breath, colors[i % 3]);
    }
  }
}
