# Tetris BD

Offline bilingual (English / বাংলা) Tetris for the browser. Stack the falling
blocks, fill rows to clear them, and beat your best score. No account, no
server, no network requests — open `index.html` and play.

Live demo: https://fahad3235.github.io/tetris-bd/

## Features

- **Full Tetris gameplay** — 10×20 board, all 7 tetrominoes, 7-bag randomizer
- **Rotation with wall kicks** — pieces nudge off walls instead of jamming
- **Ghost piece** — see exactly where the current piece will land
- **Hold piece + 3-piece Next queue** — plan ahead, swap once per piece
- **Scoring & levels** — Single 100 / Double 300 / Triple 500 / Tetris 800,
  multiplied by the current level; level rises every 10 lines, gravity speeds up
- **Soft drop (+1/cell) and hard drop (+2/cell)**
- **Pause, restart, game-over screen** with final score and "New best" callout
- **Best score saved in the browser** (localStorage, this device only)
- **English / বাংলা toggle** (persisted) with Bengali digits
- **Keyboard + on-screen controls** — arrows, Space, C, P work on desktop;
  tap buttons work on mobile (390px layout verified, no horizontal overflow)

## Controls

| Key | Action |
|---|---|
| ← → | Move |
| ↑ / X | Rotate |
| ↓ | Soft drop |
| Space | Hard drop |
| C | Hold piece |
| P | Pause / resume |
| Enter | Start / restart |

## Tech stack

Vanilla HTML + CSS + JavaScript. No frameworks, no build step, no dependencies.
The game engine (`js/tetris.js`) has no DOM code, so the same file runs under
Node for unit tests and in the browser for the game.

## Run locally

Just open `index.html` in any modern browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Tests

```bash
node tests/tetris.test.js   # 23 engine + i18n checks (no dependencies)
node tests/smoke.mjs        # 13 headless-Chrome checks (needs /opt/meta-chromium/chrome
                            # or set the chrome path at the top of the script)
```

Unit checks cover: piece shapes and rotation math, wall kicks, floor/wall
collision, ghost position, line clears (single / double / Tetris), level-scaled
scoring, level-up timing, hard/soft drop points, hold rules and re-arming,
game-over on a blocked spawn, the speed curve, and EN/BN string-table parity
plus Bengali-digit formatting. Smoke checks cover: page render, overlay flow,
canvas painting, keyboard and button input, language toggle both ways,
pause/resume, 390px mobile overflow, and zero console errors.

## Project structure

```
index.html        UI shell + styles
js/tetris.js      Pure game engine (board, pieces, scoring, hold, ghost)
js/i18n.js        EN/BN strings + Bengali-digit formatting
js/app.js         Canvas rendering, input, game loop, persistence
tests/tetris.test.js   Node unit tests
tests/smoke.mjs        Headless-Chrome smoke test (raw CDP)
```

## Limitations

- Rotation uses a small fixed kick table (no kick, sideways, up) — not the full
  SRS kick system, so a few tight wall situations that SRS would allow may fail.
- No lock delay: a piece locks the moment it cannot move down. Fast play at
  high levels is therefore less forgiving than in commercial Tetris games.
- Sound effects are not included (deliberately, to keep the app fully silent
  and dependency-free).
- Best score lives in one browser's localStorage; it does not sync anywhere.
- Single-player only; no online leaderboards or multiplayer.

## Status

Complete MVP. All 23 unit checks and all 13 headless-Chrome smoke checks pass
with zero console errors. Source files are pure ASCII (Bengali text is stored
as `\uXXXX` escapes in JS and numeric entities in HTML) so the files survive
any transport encoding unchanged.
