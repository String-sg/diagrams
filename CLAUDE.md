# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server at http://localhost:3000
npm test          # Run all Jest tests (95 tests, 8 suites)
npm run build     # Production build
```

Run a single test file:
```bash
npx jest __tests__/api/event.test.ts
npx jest __tests__/tracker.test.js
```

## Environment

Requires `.env.local`:
```
DATABASE_URL=          # NeonDB (Postgres) connection string
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # GA4 Measurement ID
```

Database schema: run `lib/schema.sql` once against NeonDB to create `users` and `events` tables.

## Architecture

This is a **Next.js 14 App Router** project. The core tools are **standalone HTML files** in `public/tools/` — not React components. The Next.js layer provides routing, a thin iframe wrapper per tool, metrics tracking, and the home page index.

### Tool pattern

Each Next.js tool page (`app/tools/<name>/page.tsx`) renders a header with a back link and a full-viewport `<iframe>` pointing to the HTML file at `/tools/<filename>.html`. The HTML files are fully self-contained and can be edited without React knowledge.

**Every HTML tool file must include two things — do not remove them:**
```html
<!-- In <head> — identifies the tool for metrics -->
<meta name="tool-id" content="<tool-id>" />

<!-- Before </body> — loads shared tracking script -->
<script src="/tracker.js"></script>
```

Valid `tool-id` values (must match `VALID_TOOLS` in `app/api/event/route.ts`):
- `circuit-symbol` — primary school symbol circuit diagram
- `circuit-object` — primary school object circuit diagram
- `circuit-secjc` — Sec/JC circuit diagram
- `water-tank` — water tank diagram generator
- `isometric-cube`

New tools added to `public/tools/` also need a new `tool-id` added to `VALID_TOOLS`.

### Tool pages

- **`/tools/circuits`** — primary school; wraps `circuit_pri_suitev2.html`, which is a shell that iframes `circuit_diagram_creatorv2.html` (symbol) or `object_circuitv2.html` (object). Toggle lives in the suite HTML. Switching modes loses canvas state.
- **`/tools/circuits-secjc`** — wraps `circuit_diagram_secjc.html`. 3-column layout with extended components (transistor, transformer, potentiometer, LED, etc.).
- **`/tools/water-tank`** — wraps `water_tank_generator.html`. Depends on `tap.png` being co-located in `public/tools/`.
- **`/tools/isometric-cube`** — wraps `isometric_cube.html`.

The old suite (`circuit-diagram-suite.html`) and original companions (`circuit_diagram_creator.html`, `object_circuit.html`) remain at the repo root as reference; the deployed versions in `public/tools/` are the `v2` copies.

### Metrics system

`public/tracker.js` is injected into every HTML tool. It:
1. Gets/creates a persistent anonymous UUID in `localStorage` (`diag_uid` key)
2. Attaches click listeners to `#exportBtn`, `#downloadBtn`, `#exportViewsBtn`
3. POSTs `{ uuid, tool }` to `/api/event` on export

`app/api/event/route.ts` validates the payload, applies a **5-minute rate limit per UUID+tool** via a DB query, then upserts the user row and inserts the event. Silent 200 on rate-limit hit.

`app/metrics/page.tsx` is a server component that queries NeonDB at render time — no auth, unlisted route.

### DB layer

`lib/db.ts` exports `getDb()` — a lazy singleton that initialises the Neon client on first call. The client is a tagged template literal (`sql\`...\``).

## Tests

Eight suites in `__tests__/` (95 tests total):

**API & infrastructure**
- `api/event.test.ts` — API route: input validation, rate-limit behaviour, happy-path DB call sequence, all 5 valid tool names accepted. DB is mocked via `jest.mock('@/lib/db')`.
- `tracker.test.js` — tracker.js: UUID lifecycle, fetch fired per export button ID, no-op when `tool-id` meta is absent. Evaluated with `eval()` in jsdom.

**Pages**
- `pages/index.test.tsx` — smoke test: all 4 tool cards render with correct titles and hrefs.
- `pages/metrics.test.tsx` — async server component: aggregate stats, per-tool rows, zero defaults, DB error state. DB mocked via `jest.mock('@/lib/db')`.

**Canvas logic** (`__tests__/canvas/`)
- `circuit-symbol.test.js` — `snap`, `gcd`, `componentSize`, `getComponentNodes` from `circuit_diagram_creatorv2.html`. GRID=28, **COMPONENT_SCALE=0.8** (all component sizes multiplied by 0.8).
- `circuit-secjc.test.js` — same functions plus `rotatePoint` from `circuit_diagram_secjc.html`. GRID=22.4, includes transistor (3-node) and transformer (2-node) geometry.
- `object-circuit.test.js` — `rotatePoint`, `getLocalNodes`, `getComponentNodes` from `object_circuitv2.html`. **COMPONENT_SCALE=0.8** (battery/switch nodes), **BULB_SCALE=1** (bulb nodes unscaled).
- `water-tank.test.js` — IIFE-based script; tested via DOM events (`fireInput`/`fireChange`) and `svgWrap.innerHTML` inspection.

**Canvas test pattern**: `__tests__/canvas/helpers.js` provides `loadCircuitScript` (eval-extracts functions from HTML) and `loadIifeScript` (eval-runs IIFE scripts). The helpers file is excluded from Jest test discovery via `testPathIgnorePatterns`.

**Key gotcha**: `snap(-10)` returns `-0` in JavaScript (IEEE 754); use `Math.abs(snap(-10))` or `toBeCloseTo` when asserting zero.
