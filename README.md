# Levanta

_Learn &middot; Play &middot; Build &middot; Rise_

An isometric-style browser game built with React + Vite + TypeScript: walk
your avatar across a node map, complete missions with real cybersecurity quiz
challenges, level up, and unlock new locations.

## Features

- **World map** — a node-graph map (Trailhead, Student Cafe, Cisco School,
  Firewall Vault, Security Center, Secret Grotto, Threat Lab) with an animated
  avatar that walks along the path between locations, hand-drawn SVG building
  illustrations, and decorative foliage.
- **Missions** — a 3-mission chain (Firewall Vault Breach → Security Center
  Sweep → Threat Lab: Ransomware Outbreak) mixing "walk to location" and
  "quiz challenge" objectives with real cybersecurity scenario questions.
- **Progression** — XP, levels, gems (coins), badges/achievements, day
  streak, and an inventory of items earned from missions.
- **Sophia AI** — a mentor panel with contextual dialogue that reacts to your
  mission progress.
- **Sound** — synthesized UI sound effects (Web Audio API, no audio files)
  for clicks, correct/incorrect answers, footsteps, level-up, and mission
  complete, with a mute toggle.
- **Navigation** — a left icon sidebar on desktop, bottom tab bar on mobile,
  both driving the same Inventory / Achievements / Leaderboard / Calendar /
  Messages panels wired to live game state.
- Fully responsive down to phone widths. Progress is saved to
  `localStorage` automatically.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run lint      # run oxlint
```

## Project structure

```
src/
  data/         # static game data (locations, missions, quizzes, catalog)
  state/        # zustand store (game state + persistence)
  lib/          # sound effects (Web Audio API)
  components/   # UI components
    panels/     # Inventory / Achievements / Leaderboard / Calendar / Messages
```
