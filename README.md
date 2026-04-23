# Fauna — A Living Field Guide

Turn the wild into a game. Photograph real animals in the wild, earn points by rarity, and compete with a private circle of friends. Zoo animals don't count.

## Stack

- **Next.js 15.5.15** (App Router) with **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for the signature blur-fade-from-bottom transitions
- **Louize Display** (TTF, in `/public/fonts/`) as the display face, with **Manrope** for body copy via `next/font`

## Run it

```bash
npm install
npm run dev
npm run typecheck
```

Open <http://localhost:3000>.

## Pages

| Route | Purpose |
|---|---|
| `/` | Earth Day landing page with route cards into the rest of the prototype |
| `/onboarding` | Three-step product walkthrough for capture, geofence, and scoring |
| `/dex` | Personal wildlife journal with rarity progress, sightings, and fact placeholders |
| `/capture` | Mocked camera flow for idle → scanning → accepted / enclosure detected |
| `/leaderboard` | Private friends board focused on readability instead of noisy gamification |
| `/species/[id]` | Detail page for a captured species |

## Design language

- **Palette**: paper, navy, forest, moss, blue, lime, clay. Navy and forest do most of the visual work; lime stays rare and useful.
- **Type**: Louize for display moments, Manrope for the product UI.
- **Motion**: every screen enters with a blur-fade-up. Transitions use `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Texture**: restrained grid texture, soft atmospheric gradients, and translucent paper panels.

## Where to plug in the ML / backend later

- `/capture` — replace the mocked `setTimeout` in `handleCapture()` with an actual CV inference call.
- `/lib/data.ts` — swap mock arrays for DB queries (Postgres + Prisma, Supabase, or whatever you prefer).
- Zoo detection — hook into a geofence service or reverse-geocode against OSM enclosure tags.

## Note on the font

Louize Display is loaded from `public/fonts/LouizeDisplay.ttf`. Per the license bundled with the font, if you ship this publicly, add the required attribution link in your footer:

```html
<a href="http://www.onlinewebfonts.com">Web Fonts</a>
```
