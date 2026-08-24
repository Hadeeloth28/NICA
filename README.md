# NICA

An isometric-style browser game built with React + Vite + TypeScript, inspired
by a cybersecurity training academy: walk your avatar across a node map,
complete missions with real cybersecurity quiz challenges, level up, and
unlock new locations.

## Features

- **World map** — a node-graph map (Trailhead, Student Cafe, Cisco School,
  Firewall Vault, Security Center, Secret Grotto) with an animated avatar that
  walks along the path between locations.
- **Missions** — multi-step missions with a mix of "walk to location" and
  "quiz challenge" objectives (real cybersecurity scenario questions).
- **Progression** — XP, levels, coins, badges/achievements, and an inventory
  of items earned from missions.
- **Sophia AI** — a mentor panel with contextual dialogue that reacts to your
  mission progress.
- **Panels** — Inventory, Achievements, Leaderboard, Calendar (using the real
  current date), and Messages, all wired to live game state.
- Progress is saved to `localStorage` automatically.

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
  components/   # UI components
    panels/     # Inventory / Achievements / Leaderboard / Calendar / Messages
```
