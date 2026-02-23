import { TW, TH, S } from '../constants.js';
import { renderBackground } from './background.js';
import * as events from './events.js';
import * as table from './table.js';
import * as ball from './ball.js';
import * as hud from './hud.js';
import * as screens from './screens.js';

export class Renderer {
  constructor(game) {
    this.g = game;
    // Launch lane arrow activation times (for light-up effect)
    this.laneArrows = [];
    this._laneArrowsInit = false;
    // UFO flyby state
    this._ufo = null;
    this._ufoNextTime = 0;
    this._ufoScheduled = false;
    // Rocket flyby state
    this._rocket = null;
    this._rocketNextTime = 0;
    this._rocketScheduled = false;
    // Shooting star state
    this._star = null;
    this._starNextTime = 0;
    this._starScheduled = false;
    // Space invader march state
    this._invaders = null;
    this._invNextTime = 0;
    this._invScheduled = false;
    // Pac-Man chase state
    this._pacman = null;
    this._pacNextTime = 0;
    this._pacScheduled = false;
    // Falling tetromino state
    this._tetro = null;
    this._tetroNextTime = 0;
    this._tetroScheduled = false;
    // Pixel bat state
    this._bat = null;
    this._batNextTime = 0;
    this._batScheduled = false;
    // INSERT COIN flash state
    this._insertCoin = null;
    this._coinNextTime = 0;
    this._coinScheduled = false;
    // Satellite flyby state
    this._sat = null;
    this._satNextTime = 0;
    this._satScheduled = false;
    // Mario & Princess chase state
    this._mario = null;
    this._marioNextTime = 0;
    this._marioScheduled = false;
    // Saturn flyby state
    this._saturn = null;
    this._saturnNextTime = 0;
    this._saturnScheduled = false;
    // Klingon Bird of Prey state
    this._bop = null;
    this._bopNextTime = 0;
    this._bopScheduled = false;
    // USS Enterprise state
    this._enterprise = null;
    this._enterpriseNextTime = 0;
    this._enterpriseScheduled = false;
    // Borg Cube state
    this._borg = null;
    this._borgNextTime = 0;
    this._borgScheduled = false;
  }

  // Performance helper: skip shadows on low-perf devices
  _shadow(ctx, color, blur) {
    if (this.g.lowPerf) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; return; }
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
  }

  // ==================== GAME SCREEN ====================
  renderGame(ctx) {
    const g = this.g;
    this.renderBackground(ctx);
    // Skip decorative flyby animations on low-perf devices
    if (!g.lowPerf) {
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
    }
    this.renderTableWalls(ctx);
    this.renderTunnels(ctx);
    this.renderBumpers(ctx);
    this.renderTargets(ctx);
    this.renderFlippers(ctx);
    this.renderBallTrail(ctx);
    this.renderBall(ctx);
    this.renderLaunchIndicator(ctx);
    this.renderWallFriction(ctx);
    g.lights.render(ctx);
    g.particles.render(ctx);
    this.renderHUD(ctx);

    // Debug: draw physics body outlines
    if (g.debugBodies) {
      const allBodies = Matter.Composite.allBodies(g.engine.world);
      ctx.save();
      for (const body of allBodies) {
        const verts = body.vertices;
        if (!verts || verts.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
        ctx.closePath();
        ctx.strokeStyle = body.label === 'slingshot' ? '#FF0' :
                          body.label === 'flipper' ? '#0FF' :
                          body.isStatic ? '#F00' : '#0F0';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
      }
      ctx.restore();
    }

  }

  // ==================== MAIN RENDER ====================
  render(ctx) {
    const g = this.g;
    if (g.state === 'MENU') this.renderMenu(ctx);
    else if (g.state === 'SHARED') this.renderShared(ctx);
    else if (g.state === 'PLAYING') this.renderGame(ctx);
    else if (g.state === 'LEVEL_COMPLETE') { this.renderGame(ctx); this.renderLevelComplete(ctx); }
    else if (g.state === 'GAME_OVER') { this.renderGame(ctx); this.renderGameOver(ctx); }
    else if (g.state === 'VICTORY') { this.renderGame(ctx); this.renderVictory(ctx); }
  }
}

// Attach methods from modules to Renderer prototype
Object.assign(Renderer.prototype,
  { renderBackground },
  events,
  table,
  ball,
  hud,
  screens
);
