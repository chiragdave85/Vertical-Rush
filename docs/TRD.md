# Vertical Rush — Technical Requirements

Version: 1.1 neon release candidate · September 2026

## Architecture

Static HTML/CSS and native ES modules. Canvas 2D performs perspective projection and rendering; Web Audio synthesizes music and effects. No runtime libraries or build step.

| Module | Responsibility |
| --- | --- |
| `engine.js` | Pure world-space rules, sine-wave motion, axis switching, clipping, precision, scores and bounded tower storage |
| `scene.js` | Perspective camera, ground grid/fog, luminous slab faces, glow, cuts, rings and reduced decorative motion |
| `audio.js` | Gesture-unlocked AudioContext, procedural soundtrack/effects, gain buses and compressor |
| `app.js` | Home/playing/paused/over phases, modal/input routing, focus, settings and persistence |

## Reference calibration

The public reference exposes an initial size of 3 units, oscillation amplitude 4, and angular rate 2 rad/s. Our equivalent scale is initial width/depth 180, amplitude 240, and the same 2 rad/s Classic rate. This produces a π-second cycle and peak speed 480 world units/s. Zen uses 1.15 rad/s.

Motion is computed directly from elapsed active-play time:

```text
offset = sin(elapsedSeconds × angularRate − π/2) × 240
movingOrigin = previousOrigin + offset
```

The initial phase starts at one extreme for a readable first approach. Continuous phase survives placement and axis changes. Speed does not increase with score. This independently reproduces the cadence; it does not reuse the reference implementation. Scoring remains block height rather than reference combo points.

## Rules

Initial block: 180×180 world units. Elevation increases by 30 per placement. Axes alternate x/z. On the movement axis, overlap is previous size minus absolute origin offset. Nonpositive overlap ends Classic or retries Zen. Perfect tolerance is `min(6, previous axis size × .18)`. Perfect placements snap without regrowth; other hits clip exactly. Store only the newest 90 blocks; absolute height and counters persist. Invalid/nonpositive time deltas are ignored.

## Rendering

One requestAnimationFrame loop uses elapsed seconds capped at 50 ms after stalls. World coordinates are unaffected by resizing. ResizeObserver updates canvas resolution; device pixel ratio is capped at 2.

The camera rotates x/z into horizontal and depth components, applies pitch, then divides by camera-space depth to project onto the screen. The title view uses a low pitch and shallow angle, easing into the elevated playing view. Camera height tracks ascent. A near-plane guard avoids invalid projection. Grid segments are grouped by depth and weight into a small number of stroke batches; fog and a radial vignette attenuate the horizon and edges.

Blocks have top and side faces, with stronger emissive-style Canvas shadows and a radial light around the active block. Effects expire. Reduced-motion preference removes camera drift, cuts and rings and snaps camera transitions. Preference is read at startup; reload after an OS preference change.

## Audio and lifecycle

Original pentatonic melody, sustained harmonies, bass pulses and interaction motifs. Gesture-gated context creation is optional/nonfatal. Separate music/effects gains feed a compressor; ended oscillators disconnect. Music uses a 375 ms interval, so timing can be affected by main-thread load. Pause stops the sequencer and suspends audio; hidden-page and pagehide events suspend it. Async start/resume continuations recheck phase and visibility before starting music.

Settings can preview effects while paused; music resumes only with play. No recorded audio or external music requests.

## Persistence

| Key | Value |
| --- | --- |
| `vertical-rush-bests` | Validated nonnegative safe integer heights per mode; earlier records retained |
| `vertical-rush-settings` | Master sound flag and clamped music/effects gains |
| `vertical-rush-neon-theme` | Allowlisted Neon/Lavender/Mint/Peach theme; defaults to Neon |

All reads/writes are guarded and failed storage degrades to in-memory play. Local records are untrusted and unsuitable for public competition. The prior `vertical-rush-theme` key is left untouched but superseded by the neon-theme key. Application code sends no user data; Google Fonts requests still contact the font provider.

## Input and accessibility

Space uses normal button activation when a button is focused; elsewhere it starts/places. P/Esc pause/resume outside native dialogs and editable fields. Key repeat is suppressed; placements have a 160 ms guard. Right-click cannot place a block. Modal opening pauses and closing does not auto-resume. Semantic buttons, range labels, pressed states, text feedback, focus styling and native dialog focus containment are provided. Full nonvisual spatial gameplay and WCAG conformance have not been established.

## Delivery and validation

Serve `index.html`, `styles.css` and `src/` over HTTP locally or HTTPS on a static host. No backend, secrets, installation or build required. Python's local server is development-only. Production MIME types, compression and coordinated cache policy remain deployment requirements.

Run `npm test` with Node 18+. Fifteen tests cover game rules and the new sine-wave calibration, phase continuity, stable speed, slower Zen pace, invalid time inputs, finale framing, orbit continuity, visible faces, reduced motion and camera reset. Browser evidence and remaining launch checks are in QA.md.

## Finale camera

`Scene.beginFinale()` captures the rendered yaw. The orbit eases into 0.12 rad/s (roughly 52 seconds per revolution) using a frame-rate-independent integrated velocity ramp. Camera elevation targets the midpoint of retained block bounds; distance scales with tower height and viewport dimensions. Visible x/z walls are selected by yaw quadrant so the full orbit preserves solid faces. Grid and tower share the same camera. The engine remains frozen. Reduced motion holds orientation and snaps framing. Replay/home clears finale state. Modal dialogs and hidden tabs suspend the animation.

## Ten-point scoring and results update

Every landed block displays 10 points (10, 20, 30, …) in both modes. HUD, personal best and results use the same conversion. Stored records and internal engine counters remain block heights, preserving existing history without migration; misses earn no points and perfect-drop counts remain literal counts. The Game Over heading and score are larger using the existing fonts. Play Again uses a filled theme-colored button with a gentle glow animation, disabled for reduced-motion preference. Tower orbit behavior is unchanged. The settings gear has symmetrical teeth and a centered ring.


### Mobile sound and personal records

The original synthesized soundtrack starts from a click/tap, with retries after suspended or interrupted audio. A persistent Sound On / Muted control is available during play; music and effects volumes remain in Settings. Supported audio-session APIs request media playback. Mobile operating-system audio behavior still needs physical iOS and Android testing.

Records now use a browser-local random player identifier and separate Classic/Zen values. New identities start at zero. Legacy records are preserved but only adopted via **Restore my previous records** in Settings, because their owner cannot be inferred. Reset personal bests affects only the current browser identity. There is no account synchronization; people sharing one browser also share its player identity.
