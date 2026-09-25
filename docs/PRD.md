# Vertical Rush — Product Requirements

Version: 1.1 neon release candidate · September 2026

## Objective

Bring the professional arcade feel of the user's [reference](https://neon-stack-nine.vercel.app/) to Vertical Rush: full-screen play, a glowing 3D-looking world, sparse controls, and the same steady movement cadence. Preserve original audio, local records, alternate palettes, and Zen mode.

## Player journeys

1. Open the title screen and tap/click the arena, select Tap to start, or press Space.
2. Time alternating-axis placements. Overhang falls away; perfect drops retain dimensions and extend a musical streak.
3. Pause deliberately or automatically when changing tabs. Resume the exact gameplay state.
4. Open settings to adjust the palette or sound; select a different mode from the home state.
5. Retry after a Classic miss, or continue automatically after a Zen miss.

## Requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| P01 | Full-screen composition | Arena fills the viewport with no scrolling; title, score, settings and placement controls remain usable on mobile. |
| P02 | Reference-inspired visuals | Near-black environment, fogged perspective grid, luminous blocks, shaded faces, restrained typography, and strong active-block emphasis. |
| P03 | Classic rhythm | Sinusoidal movement at 2 rad/s, period π seconds, amplitude 240 world units against a 180-unit starting block; no height-based acceleration. |
| P04 | Zen rhythm | Sinusoidal movement at 1.15 rad/s; misses respawn without increasing height or ending play. |
| P05 | Precision rules | Alternate x/z axes, remove overhang exactly, snap perfect drops, end Classic on zero overlap, add one height unit per successful placement. |
| P06 | Controls | Touch/pointer and keyboard routes; pause with P/Esc; ignore repeat keys and rapid duplicate drops. |
| P07 | Lifecycle | Hidden tabs suspend audio and pause play; modal opening pauses; closing leaves explicit resume to the player. |
| P08 | Personalization | Neon, Lavender, Mint, Peach; music/effects volume and master mute; local persistence. |
| P09 | Records | Separate Classic/Zen best heights, retained from the earlier version; no cloud/global ranking. |
| P10 | Supporting screens | Native settings/help dialogs; result height and perfect count; replay and home controls. |
| P11 | Access basics | Labels, visible focus, meaningful button states, native dialogs, text results, reduced decorative motion. Spatial gameplay is not fully nonvisual. |

## Scoring and compatibility

Continue using block height rather than the reference's combo points. Preserve existing best heights and sound preferences. A new neon-theme preference key defaults the visual redesign to cyan; choosing an alternate palette then persists it. Earlier Classic records remain personal history even though the pace has changed.

## Quality targets

Aim for smooth 60 fps and input response within one frame on representative devices. Use no runtime package downloads and tolerate failed storage or audio initialization. Validate real-device sound, performance, accessibility and deployment before claiming broad production readiness. These are targets, not a claim of a completed device matrix.

## Boundaries

No accounts, analytics, purchases, global leaderboard, multiplayer, cloud save, or offline installation. No commercial recorded music. The renderer projects 3D world geometry onto Canvas 2D; it is not a WebGL engine. Public hosting is outside this change.

## Release gate

Pass rule tests and browser smoke flows, then complete outstanding checks in QA.md. Physical-device listening, browser coverage, accessibility review, and HTTPS deployment remain launch tasks.

## End-of-game showcase

After a Classic miss, present the completed tower with a slow continuous camera orbit and an eased pullback that frames the retained stack. Keep results and replay usable without blurring the tower. Do not orbit during active gameplay or pause. Respect reduced-motion preference and reset the view on replay/home.

## Ten-point scoring and results update

Every landed block displays 10 points (10, 20, 30, …) in both modes. HUD, personal best and results use the same conversion. Stored records and internal engine counters remain block heights, preserving existing history without migration; misses earn no points and perfect-drop counts remain literal counts. The Game Over heading and score are larger using the existing fonts. Play Again uses a filled theme-colored button with a gentle glow animation, disabled for reduced-motion preference. Tower orbit behavior is unchanged. The settings gear has symmetrical teeth and a centered ring.
