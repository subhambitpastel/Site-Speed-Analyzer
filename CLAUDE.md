# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build (static export to /out)
npm run lint       # ESLint (flat config, next/core-web-vitals + next/typescript)
```

No test framework is configured. No database or backend.

## Architecture

This is a **fully static** Next.js 16 app (configured with `output: "export"` in next.config.ts). There are no server components, API routes, or middleware — everything runs client-side in the browser.

### Data Flow

1. **URLInput** — user enters URLs (one per line), validated by `lib/urlValidator.ts`
2. **pagespeedClient.ts** — calls Google PageSpeed Insights API v5 with concurrency limit of 4, exponential backoff on 429s, 60s timeout
3. **reportParser.ts** — transforms raw API response into typed `LighthouseReport` (defined in `types/report.ts`)
4. **page.tsx** — orchestrates everything: manages queue-based worker pool, updates results array progressively as each URL completes
5. **ResultsTable / ScoreBadge / MetricsPanel / ScoreChart** — render results with color-coded scores
6. **ExportDropdown** — triggers `lib/exportPDF.ts`, `lib/exportCSV.ts`, or `lib/exportDOCX.ts`

### Key Architectural Decisions

- **No backend**: API key is exposed client-side via `NEXT_PUBLIC_PSI_API_KEY` in `.env.local`. This is intentional — the app is designed for free static hosting.
- **Progressive rendering**: Results display immediately as placeholders, then update in-place as each URL's report arrives. The `results` state array is indexed by URL position.
- **Abort pattern**: `abortRef` (a React ref) is checked between queue items to support cancellation without AbortController complexity.
- **Export libraries**: jsPDF + jspdf-autotable for PDF, `docx` package for DOCX, manual string building for CSV. All run entirely in-browser.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Conventions

- Single `page.tsx` app — all state lives in the `Home` component (no state management library).
- Tailwind CSS 4 via PostCSS plugin. Dark mode uses class strategy with localStorage persistence.
- Scores use a consistent color system: green (≥90), orange (≥50), red (<50) — replicated across UI components and PDF export.
