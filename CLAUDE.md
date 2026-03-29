# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server at http://localhost:3000
npm test          # Run all Jest tests (20 tests, 3 suites)
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
- `circuit-symbol`
- `circuit-object`
- `isometric-cube`

New tools added to `public/tools/` also need a new `tool-id` added to `VALID_TOOLS`.

### Circuit tools — two tiers

- **Primary school** (`/tools/circuits`): wraps `circuit_pri_suitev2.html`, which is a shell that iframes `circuit_diagram_creatorv2.html` (symbol) and `object_circuitv2.html` (object). The toggle lives inside the suite HTML itself. Note: switching modes inside the suite loses canvas state (single iframe with changing `src`).
- **Sec/JC** (`/tools/circuits-secjc`): wraps `circuit_diagram_secjc.html` directly. 3-column layout with extended components (transistor, transformer, potentiometer, LED, etc.).

The old `circuit-diagram-suite.html` is archived in `_archive/`.

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

Three suites in `__tests__/`:
- `api/event.test.ts` — API route: input validation, rate-limit behaviour, happy-path DB call sequence. DB is mocked via `jest.mock('@/lib/db')`.
- `tracker.test.js` — tracker.js: UUID lifecycle, fetch fired per export button ID, no-op when `tool-id` meta is absent. Evaluated with `eval()` in jsdom.
- `pages/index.test.tsx` — smoke test: all tool cards render with correct hrefs.

The metrics page and HTML canvas logic are **not unit-tested** — validate manually after changes.
