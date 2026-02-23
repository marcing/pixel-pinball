import { PinballGame, setupShareClick } from './game.js';

window.addEventListener('load', () => {
  if (typeof Matter === 'undefined') {
    document.getElementById('loading').innerHTML =
      '<p style="color:#f66">Failed to load physics engine.<br>Please check your internet connection.</p>';
    return;
  }

  const game = new PinballGame();
  setupShareClick(game);
  game.start();
  window._game = game;
});
