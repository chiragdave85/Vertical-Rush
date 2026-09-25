# Vertical Rush — Creative Brief

## Direction

A full-screen neon arcade inspired by the user's [Neon Stack reference](https://neon-stack-nine.vercel.app/). Replace the earlier pastel landing page with a focused game world: near-black atmosphere, a cyan perspective grid fading into fog, luminous dimensional blocks, and a light, widely spaced title.

The identity remains **Vertical Rush**. The experience opens on the grid with a direct “Tap to start” invitation. During play, the tower and score take priority. Settings hold the secondary decisions.

## Visual system

- Deep black-blue backdrop, cyan grid lines, soft environmental glow, and dark peripheral falloff.
- Perspective-projected slabs with distinct shaded faces. The moving block glows more strongly than the placed stack.
- A low camera angle at the title screen eases into the playing view. Slow decorative drift stops during pause and is disabled for reduced-motion preference.
- Thin Outfit title and score typography; geometric Space Grotesk for supporting headings.
- Neon cyan is the default. Lavender, Mint, and Peach remain selectable as luminous accents on the same dark environment.
- Full viewport on desktop and mobile. No marketing cards or sidebar during gameplay.

## Pace and sound

Classic mirrors the reference's steady sine-wave movement: 2 radians per second, a full cycle every π seconds, and an amplitude of 1⅓ starting block widths. Turns ease naturally at the edges; speed does not increase with height. Zen keeps its unlimited retries and slower movement.

Retain the original synthesized electronic score and interaction sounds. Perfect streaks climb musically. Music and effects have separate volume controls and master mute. Sound starts only after interaction.

## Interaction principles

A single deliberate action places a block. Keep clear keyboard and touch routes, quiet instructions, pause/resume, readable results, and local personal records. Settings opened during a run pause it; closing settings does not resume automatically.

## Scope

Match the reference's overall composition, rhythm, and atmosphere while retaining our game identity and features. This is an independent Canvas implementation, not a copy of the reference's React/Three.js source, assets, or audio. Records remain block heights rather than adopting the reference's combo-weighted score.

## Finale motion reference

The supplied 2.88-second recording shows a gentle camera orbit around the intact tower and ground grid. Recreate that unhurried showcase with transparent results over the visible stack, a smooth pullback, and no spinning or disassembly of individual blocks.
