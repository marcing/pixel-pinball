# Pixel Pinball

**[Play now](https://marcing.github.io/pixel-pinball/)**

A retro pixel-art pinball game built with vanilla JavaScript and [Matter.js](https://brm.io/matter-js/) physics.

## Features

- 20 progressively challenging levels
- Physics-based flipper and ball mechanics
- Bumpers, targets, tunnels, and other classic pinball elements
- Particle effects and dynamic lighting
- Procedural sound effects (no audio files needed)
- Mobile touch controls and desktop keyboard support
- Adaptive performance scaling

## Play

Open `index.html` in a browser, or start the included dev server:

```bash
node server.js
```

Then visit [http://localhost:3000](http://localhost:3000).

## Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Left flipper | `A` / `Left Arrow` / `Z` | Tap left side |
| Right flipper | `D` / `Right Arrow` / `/` | Tap right side |
| Launch ball | `Space` (hold to charge) | Tap & hold bottom |

## Tech Stack

- **Rendering** — HTML5 Canvas 2D
- **Physics** — Matter.js 0.19
- **Audio** — Web Audio API (procedural synthesis)
- **Bundling** — None; ES modules loaded directly by the browser

## Project Structure

```
├── index.html        # Entry point
├── main.js           # Bootstrap
├── game.js           # Core game loop, physics setup, input handling
├── constants.js      # Shared constants and scoring formula
├── levels.js         # Level definitions (bumpers, targets, walls, tunnels)
├── sound.js          # Procedural sound system (Web Audio API)
├── effects.js        # Particle and light systems
├── decorations.js    # Visual table decorations
├── renderer/         # Rendering subsystem
│   ├── index.js      # Renderer entry point
│   ├── background.js # Starfield and background effects
│   ├── table.js      # Table elements (bumpers, walls, targets)
│   ├── ball.js       # Ball and trail rendering
│   ├── hud.js        # Score, level, and UI overlays
│   ├── screens.js    # Menu, level-complete, and game-over screens
│   └── events.js     # Visual event feedback
└── server.js         # Minimal Node.js dev server
```

## License

MIT
