Original prompt: in the gd-clone.html impliment all the orbs (yellow orbs, pink orbs, green orbs, blue orbs, black orbs, green orbs"

- Added orb editor tools (`orb_yellow`, `orb_pink`, `orb_green`, `orb_blue`, `orb_black`).
- Implemented orb activation on input press (prefers nearby orb) with cooldown to prevent repeat triggers.
- Added orb visuals (pulse glow + hitbox debug ring) and activation pulse FX.
- Added jump pad tools (`pad_yellow`, `pad_pink`, `pad_green`, `pad_blue`, `pad_black`) that trigger on contact (supports ceiling pads via 180° rotation).
- Added pad visuals + activation pulse FX and included pads in `render_game_to_text` counts.
- Added basic `window.render_game_to_text` + `window.advanceTime(ms)` hooks for automated testing.

- Added a Play Mode selector (difficulty: Easy → Extreme Demon, focus: All Gamemodes/Cube/Ship/UFO/Wave/Ball/Robot/Spider).
- Implemented preset level generation (deterministic seeded layouts) and wiring: menu → start → retry → next level.
- Added in-game level title + “NEXT” button on completion for Play Mode runs.
- Updated Crash Guard into a non-blocking error overlay (surfaces `window.error`, unhandled rejections, and `console.warn/error`) and added a watchdog to recover from render-loop stalls.
- Added an in-game/editor autoclicker (toggle + CPS + target A/B/BOTH) that pulses jump/orb activation without overriding manual holds.

2026-03-04
- P0: Prevented “unexpected quit/restart” from spacebar activating focused UI buttons by blurring/focusing the canvas on mode transitions and preventing default on Space/ArrowUp keyup.
- Made QUIT button non-focusable (`tabindex="-1"`) and ignored jump keys while typing in inputs/selects.
- Eliminated noisy `/favicon.ico` 404 by using a data-URL favicon.
- Improved `window.advanceTime(ms)` to render a frame (without double-stepping physics) so headless automation screenshots aren’t blank.
- Added an editor toggle for spike rotation step: 90° ↔ 45° (`TILT STEP: 90°/45°`).

2026-03-05
- Implemented slope hazards (`SLP 22.5`, `SLP 45`, `SLP 90`) with 90° rotation cycling on click; slopes are deadly to Wave mode (segment-vs-hitbox collision).
- Updated Wave physics: mini wave now travels at ~75° by using a larger wave vertical velocity when mini.
- Added `setForceLoopForever(true)` loop guardian to keep rAF alive and auto-restart if play drops back to MENU unexpectedly.
- Added a cross-app watchdog (`js/app-guardian.js`) and included it in all mini-app HTML pages; enable via `setForceLoopForeverEverywhere(true)` or `?forceLoop=1`.
- Fractal sim: reduced V-Tree / H-Tree crowding by increasing node spacing and adding lane offsets/jitter to avoid near-parallel overlaps.
- Fix: V-Tree silhouette was breaking due to generic overlap nudging; disabled `placeWithoutOverlap` for `v-tree`/`h-tree` so lanes stay structured.
- Fractal sim: fixed `Hex Grid` layout to use a true hex lattice (axial coords / 60° directions, spiral placement for >6 children) and matched the SVG export logic.
- Added Playwright smoke runner for fractal layouts/presets: `tools/test-fractal-layouts.mjs` (screenshots + error capture).
- Fix: layout switching handler threw `ReferenceError: transform is not defined`; replaced with `app.transform` so changing layouts works.
- Fix: Hilbert (and SVG export) threw `Cannot access 'decay' before initialization`; hoisted `decay` in `drawNode`/`drawNodeSVG`.
- Fix: Game of Life theme crashed with `ReferenceError: type is not defined`; now reads `golType.value` instead.
- Added `window.__drawCount` render hook so Playwright waits on real redraws (more reliable preset/layout smoke tests).
- Fix: Hilbert layout now draws sequential curve segments (no long cross-links) and uses constant line width for visibility.
- Fix: L-system presets now render via turtle traversal (plant/dragon look correct), not tree-width layout.
- Fractal sim: reduced Solar layout clutter by tightening satellite arcs for non-root levels and increasing orbital spacing.
- Added labels to layout/preset contact sheets in `tools/make-contact-sheets.mjs`.
- Ran layout smoke test: `output/fractal-layout-smoke-run13`.
- Regenerated contact sheets + manifest: `output/fractal-smoke-gallery/contact-layouts.png`, `output/fractal-smoke-gallery/contact-presets.png`, `output/fractal-smoke-gallery/manifest.json`.
- Fractal sim: added global parametric positioning for curve/pattern layouts (arc/rose/cardioid/etc.) to avoid recursive clutter; includes Ulam/global phyllotaxis and warps.
- SVG export now mirrors global layout positions for those curve/pattern layouts.
- Ran layout smoke test: `output/fractal-layout-smoke-run14`.
- Regenerated contact sheets + manifest for run14.
- Fractal sim: added layered tree/binary positioning to fix collapsed tree layouts.
- Ran layout smoke test: `output/fractal-layout-smoke-run15`.
- Regenerated contact sheets + manifest for run15.
- Fractal sim: moved spiral layouts (spiral/spiral3/spiral5) to global parametric positioning to reduce clutter.
- Ran layout smoke test: `output/fractal-layout-smoke-run16`.
- Regenerated contact sheets + manifest for run16.
- Fractal sim: concentric now renders without sequential connecting lines; gear moved to global layout to reduce clutter.
- Ran layout smoke test: `output/fractal-layout-smoke-run17`.
- Regenerated contact sheets + manifest for run17.
- Fractal sim: added frustum culling for nodes and line segments using screen-space view bounds (respects rotation/compare).
- Ran layout smoke test: `output/fractal-layout-smoke-run18`.
- GD clone: stabilized frame stepping using delta-time and ensured only a single rAF loop runs to prevent runaway speed and random quits.

2026-03-03
- Added an observation deck (“sky deck”) to the Realistic Skyscraper in `tower-collapse-sim.html` (east-side facade opening + deck slab + glass railings + props).
- Added URL params to `tower-collapse-sim.html` for deterministic setup: `?realistic=1` and optional `&floors=N`.
- Fixed selection-chunk movement so dummies standing on selected blocks freeze and move with ArrowUp lift + ArrowLeft/Right tilt (prevents ragdolls “sticking” while the skyscraper chunk moves).
- Updated the observation deck props to use coin-operated telescopes (3 units) instead of a generic binocular stand.
- Adjusted telescopes to face outward (+X) and increased telescope count/density along the deck edge.
- Added rooftop details to the Realistic Skyscraper: weather radome, vintage water tower, ventilation duct runs/vent caps, and denser lightning rods with perimeter conductor + mast finial.
- Rebuilt the rooftop communications mast (“internet antenna”) as a more realistic 4-leg lattice tower with bracing bays, ladder, platforms/handrails, sector panels + RRUs, obstruction lights, and cable bundle.
- Fixed a variable name collision (`ladderX`) between the mast ladder and roof-access ladder.
- Added more realistic office-room dressing: ceiling LED panels, HVAC diffusers, sprinklers, carpet tiles, exit signage, fire extinguisher cabinet, conference projector/screen, laptops/notepads, and desk accessories/chairs.
- Networking/power pass: much smaller server patch cables, dense per-desk network drops from an IDF closet, and thicker power drops from a bus-duct/panelboard (power wires now spark/explode on destruction).
- Fixed lobby entrance blocking by cutting a south-facade opening and moving revolving-door vestibules off the main path.
- Added first-person collision resolution so the camera can’t clip through/inside solid blocks (ignores tiny cabling).
- Stairs now alternate direction per floor so runs align between floors; elevators moved into an external glass shaft so they’re visible.
- Moved elevators back inside the central core (added glass-lined interior shafts/rails) and fixed FPS movement mapping to match WASD/arrow expectations.
