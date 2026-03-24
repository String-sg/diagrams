# Diagram Tools

Teaching tools for creating clean, exportable diagrams. Built for primary school educators — no installation required for end users.

## Tools

| Tool | Route | Description |
|------|-------|-------------|
| Circuit Diagrams | `/tools/circuits` | Symbol and object-style circuit diagrams with battery, bulb, switch, and electromagnet components. Export as PNG. |
| Isometric Cube Builder | `/tools/isometric-cube` | Build 3D cube structures and auto-generate top, front, and side orthogonal views. Export as PNG. |

The circuit tool has two modes (toggle without losing your work):
- **Symbol** — standard schematic symbols for worksheets
- **Object** — realistic apparatus style for apparatus diagrams

## Metrics

Visit `/metrics` to see PNG export counts per tool, all-time and for the current month.

Metrics use an anonymous browser UUID (no login). Only PNG exports are counted.

## Running locally

```bash
npm install
```

Create `.env.local`:
```
DATABASE_URL=your_neon_connection_string
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database setup

Run `lib/schema.sql` once against your NeonDB instance.

**Option A — Neon dashboard:**
1. Go to [console.neon.tech](https://console.neon.tech) → SQL Editor
2. Paste and run the contents of `lib/schema.sql`

**Option B — psql:**
```bash
psql $DATABASE_URL -f lib/schema.sql
```

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL` — from your Neon project dashboard
   - `NEXT_PUBLIC_GA_ID` — your GA4 Measurement ID (format: `G-XXXXXXXXXX`)
4. Deploy

## Editing the HTML tools

The diagram tools live in `public/tools/` as standalone HTML files. You can edit them directly — no React knowledge needed.

Two things in each file must not be removed:

```html
<!-- In <head> — identifies the tool for metrics tracking -->
<meta name="tool-id" content="circuit-symbol" />

<!-- Before </body> — loads the tracking script -->
<script src="/tracker.js"></script>
```

## Project structure

```
app/
  page.tsx                  # Index — links to all tools
  tools/
    circuits/page.tsx       # Combined circuit view (symbol + object tabs)
    isometric-cube/page.tsx # Isometric cube wrapper
  metrics/page.tsx          # Metrics dashboard
  api/event/route.ts        # POST endpoint — records PNG exports
  layout.tsx                # Root layout with GA4
lib/
  db.ts                     # NeonDB connection (lazy)
  schema.sql                # Run once to create DB tables
public/
  tools/                    # HTML tool files (edit freely)
  tracker.js                # Shared tracking script
_archive/
  circuit-diagram-suite.html  # Retired — superseded by combined view
```

## Stack

- [Next.js 14](https://nextjs.org) — framework
- [Vercel](https://vercel.com) — hosting
- [NeonDB](https://neon.tech) — Postgres for metrics
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Google Analytics 4](https://analytics.google.com) — traffic analytics
