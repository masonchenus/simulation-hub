Original prompt: impliment pellet bombs which can be placed near ghosts and the ghosts die because of the explosion each ghost = 800 points or 80 normal pellets; also if it cannot be placed it spews hundreds of pellets everywhere and it spawns late-game

2026-02-20
- Added late-game pellet bombs to `pacman.html`:
  - Bomb pickup spawns late in a level starting level 3 (when pellets remaining <= 35% of start).
  - Pickup prefers empty tiles; falls back to spawning on top of pellets if needed.
  - Press `B` to place a bomb on Pac-Man’s tile; requires a ghost within 4 tiles to arm.
  - If placement fails (blocked/occupied/not near ghost), it “malfunctions” into a large pellet storm (hundreds of spew pellets).
  - Explosion kills ghosts in radius and awards +800 per ghost.
  - Added bomb pickup, placed bomb, and explosion visuals + HUD bomb counter.
- Fixed: Pac-Man no longer dies on contact with an already-eaten ghost (ghost eyes).
- Added `window.render_game_to_text` for automated harness state capture.
- Validation: Playwright install/run blocked (no network to fetch `playwright` from npm). Performed JS syntax check by extracting `<script>` to `/tmp/pacman-extract.js` and running `node -c`.

- Added Extreme-only features:
  - 3 Pac-Man bots (AI helpers) spawn in Extreme difficulty and eat pellets (adds score); they avoid stealing power pellets until all normal pellets are gone (power pellets eaten late don’t trigger frightened).
  - Bots now roam independently (no fallback chasing the player) and spawn from fixed maze anchors instead of relative to the player.
  - Spew pellet counts scale up on Hard/Insane/Extreme, with extra-heavy pellet storms on Extreme (bounded to avoid huge-maze lockups).

- Updated bot power pellet + ghost rules:
  - Any Pac-Man (player or bot) can eat power pellets; this triggers global frightened mode.
  - While ghosts are frightened, bots can also eat ghosts for combo points.

- Bot pathfinding upgrade:
  - Bots now BFS-pathfind to the nearest useful tile (bomb pickup, ready point pellet fountain, power pellet, pellet).
  - While frightened, bots BFS-pathfind to the nearest living ghost.

- Bot count + roles:
  - Added Bots slider (1–20) and a role preset selector.
  - Added 20+ assignable bot roles across `attack`, `defense`, `support`, with an optional Manual per-bot role dropdown.

- Added in-canvas fatal error overlay to debug black-screen issues (shows error message on canvas + logs to console).

2026-02-20 (fix)
- Fixed a `ReferenceError: bot is not defined` caused by a missing closing brace in `updatePacBot()` (bots section).
