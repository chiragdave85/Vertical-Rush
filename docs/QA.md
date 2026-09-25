# Verification and release checklist

## Completed for the neon update

- `npm test`: all 11 tests pass. Original rule coverage remains, with new checks for the π-second Classic sine cycle, 240-unit amplitude, continuous phase, constant pace across heights, slower Zen movement, and invalid time deltas.
- Node syntax checks pass for the application and scene modules.
- Inspected the supplied reference's title/play views and public motion constants; independently calibrated our world-space units to its amplitude/size ratio and angular rate.
- Visually checked the full-screen title, luminous blocks, grid/fog and camera transition in the in-app browser at desktop/tablet widths.
- Observed the settings dialog with both modes, all four palette options, retained volume values, and the selected saved theme.
- Observed retained personal records after reload.
- Verified start, keyboard pause, resume, and return-home flows.
- Inspected the 390×844 mobile pause and active-game views. Score, settings, pause and placement controls remained visible without page scrolling. Restored the default viewport after testing.
- No error/warning entries were returned by the browser console during the neon gameplay check.

Earlier-version checks also covered Classic results, mode/palette selection, help, and master mute. Those earlier checks do not substitute for the remaining full release matrix below. Audio has not received physical listening sign-off; no production load test or accessibility conformance is claimed.

## Before a broad public launch

- [ ] Listen on headphones and phone speakers: melody balance, click level, clipping, mute, pause/resume, and iOS audio unlock.
- [ ] Test Safari/iOS, Chrome/Android, Firefox, and Edge on physical devices, including portrait/landscape, zoom, and interruption recovery.
- [ ] Measure frame times and memory during sustained high towers on midrange mobile hardware; confirm audio remains steady under load.
- [ ] Audit contrast, keyboard focus order, dialog interactions, touch targets and assistive technologies. Decide whether a nonvisual timing mode is needed before claiming inclusive gameplay.
- [ ] Exercise storage-blocked/corrupt-storage browser scenarios and Google Fonts failure. These are handled in code but were not all tested end-to-end here.
- [ ] Verify reduced-motion behavior on target operating systems.
- [ ] Select an HTTPS static host, configure MIME/compression/caching, and smoke-test the deployed URL.
- [ ] Review distribution license and font hosting. No analytics, cookies for tracking, accounts, or global score service are included.

## Repeatable manual smoke sequence

1. Open Settings from home; choose each palette and both modes.
2. Start Classic, land a block, land a perfect block, miss, and replay.
3. Start Zen, intentionally miss and verify the height stays unchanged while a fresh block appears.
4. Pause with P, resume, open help during play, close it, then explicitly resume.
5. Switch browser tabs during play; return and verify the paused panel.
6. Mute/unmute and adjust both volume sliders. Reload and verify settings and best heights.
7. At a narrow mobile size, tap to start and verify that the arena, score, pause and Place block controls remain usable.

## Tower-orbit verification

- All 15 automated tests pass, including all-quadrant face selection, short/tall/retained-stack framing, frame-rate-independent rotation, immutable game geometry, reduced motion and reset.
- Browser fixture exercised the real results path with a deterministic 20-block tower and disabled persistence/audio; inspected the visible stack, eased framing and opposite-side rendering. No browser errors or warnings were reported. The temporary fixture was removed after verification.
- Physical-device motion comfort remains part of the broader release review.
