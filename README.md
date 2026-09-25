# Vertical Rush

**Find your rhythm. Rise above.** A full-screen neon perspective stacking game with an original adaptive soundscape. Built with native browser APIs; no runtime packages, accounts, ads, or build step.

## Run locally

Requirements: Python 3 for the local server. Node.js 18+ is optional and used for tests.

```sh
git clone https://github.com/chiragdave85/Vertical-Rush.git
cd Vertical-Rush
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. Stop the server with Ctrl+C. `npm start` runs the same server. Do not open `index.html` directly with a file URL; JavaScript modules require an HTTP server.

## Play

- Open **Settings** to choose **Classic** for the reference-matched sine-wave rhythm and game-over on a miss, or **Zen** for slower motion and unlimited retries.
- Choose **Neon**, **Lavender**, **Mint**, or **Peach**, then select **Tap to start**. Neon is the default.
- Click/tap the scene, use **Place block**, or press **Space**. Blocks alternate between two axes. Overhangs are cut away; perfect placements preserve the block.
- Use **P**, **Esc**, or the pause button to pause/resume. Switching tabs pauses automatically.
- Open Settings for master mute and independent music/effects volume. Audio starts after a user gesture. Music plays during active games.
- Best heights are saved separately per mode in this browser. Clearing browser storage clears records and preferences.

## Reference-inspired update

The visual direction and Classic movement are calibrated to the supplied [Neon Stack reference](https://neon-stack-nine.vercel.app/): a dark full-screen arena, glowing cyan grid and slabs, sparse typography, and a 3.14-second movement cycle. This is an independent implementation that keeps Vertical Rush branding, height-based scoring, original sound, and Zen mode. Existing local records and sound settings are preserved.

## What’s included

- Canvas-projected 3D geometry with luminous faces, a cyan perspective grid, distance fog, falling cuts, camera tracking, and perfect-placement rings.
- Full-viewport desktop and mobile layouts, keyboard controls, native help/settings dialogs, visible focus, and reduced-motion support for decorative motion.
- Original Web Audio pentatonic music, warm pads, bass pulses, and melodic interaction cues. No downloaded music or music licensing dependency.
- Resilient local persistence: the game still works if storage is unavailable.
- Bounded tower history and capped rendering pixel density for long sessions.

## Verify

```sh
npm test
```

Fifteen tests cover perfect placements, both clipping axes and sides, Classic failure, Zen retries, frame-rate independence, pause behavior, narrow blocks, long-session/reset behavior, reference sine-wave timing, constant pace/phase continuity, slower Zen motion, and finale camera/face rendering behavior. No package installation is required. Browser checks and outstanding release work are recorded in [QA.md](docs/QA.md).

## Project map

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic interface, metadata, inline icons, dialogs |
| `styles.css` | Responsive layouts, neon palette tokens, typography, focus states |
| `src/engine.js` | Deterministic world-space game rules |
| `src/scene.js` | Perspective projection, grid/fog, glow, camera and visual effects |
| `src/audio.js` | Procedural soundtrack and interaction sounds |
| `src/app.js` | Inputs, lifecycle, preferences, interface state |
| `tests/engine.test.js` | Dependency-free game-rule tests |

## Documentation

- [Product requirements](docs/PRD.md)
- [Technical requirements](docs/TRD.md)
- [Creative brief](docs/BRIEF.md)
- [Verification and release checklist](docs/QA.md)

## Hosting and launch scope

Deploy `index.html`, `styles.css`, and `src/` together to an HTTPS static host. No server-side application or secrets are needed. Serve JavaScript with the correct MIME type and refresh HTML/CSS/JS together when releasing. The Python server is for development, not public production traffic.

Google Fonts supplies Outfit and Space Grotesk; system sans-serif fallbacks keep the app usable if those requests fail. For a self-contained/offline release, vendor licensed font files and replace the external font links. This version does not install a service worker and does not promise offline availability.

This is a playable release candidate, not a claim of completed public-scale validation. Physical-device audio checks, assistive-technology review, hosting configuration, and public-release performance checks remain before broad distribution. There is no global leaderboard, authentication, telemetry, cloud save, or anti-cheat service. Local scores are user-controlled. No project license has been selected; choose one before distributing source under an open-source license.

## End-of-game showcase

When Classic ends, the camera eases back to frame the retained tower and slowly orbits it with the grid. Results stay sharp over a transparent backdrop. Replay resets the camera; reduced-motion preference uses a static view.

## Vercel deployment

The root `vercel.json` runs the tests and `npm run build`, then publishes only `dist/`. The build copies the game files without runtime dependencies; documentation, tests, and local scratch folders are not deployed. Use the repository root and the Other framework preset. Production tracks `main`.
