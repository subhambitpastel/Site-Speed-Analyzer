# System Architecture

## Overview

The Lighthouse Bulk Report Generator is a fully static Next.js 16 web application that generates Lighthouse performance reports for multiple URLs using the Google PageSpeed Insights API. It is configured with `output: "export"` and runs entirely client-side in the browser. There are no server components, API routes, middleware, or backend services. The API key is exposed client-side via `NEXT_PUBLIC_PSI_API_KEY` by design, enabling deployment on free static hosting platforms.

---

## High-Level Architecture

The system supports two data flow paths depending on how URLs enter the pipeline.

### Path 1: Fresh Analysis

```
URLInput / FileUpload (URL-only file)
       |
  URL validation (urlValidator.ts)
       |
  pagespeedClient.ts  -->  Google PSI API v5
       |
  reportParser.ts
       |
  LighthouseReport (typed object)
       |
  Results Dashboard (ResultsTable, ScoreBadge, ScoreChart, MetricsPanel)
```

The user enters URLs directly or uploads a file containing only URLs. Each URL is validated, queued, and sent to the PageSpeed Insights API. Raw JSON responses are parsed into typed `LighthouseReport` objects and rendered progressively as they arrive.

### Path 2: Resume from File

```
FileUpload (exported report file)
       |
  fileParser.ts (detects report columns in uploaded XLS/XLSX/CSV)
       |
  Reconstruct LighthouseReport objects from exported data
       |
  Pre-populate Results Dashboard with completed reports
       +-- Queue incomplete URLs for Path 1
```

When the user uploads a previously exported report file, the file parser detects Lighthouse score columns and reconstructs typed report objects. Completed reports appear immediately in the dashboard. URLs that lack score data are queued for fresh analysis through Path 1.

---

## Components

### 1. Input Layer

Responsible for collecting URLs from the user through two channels.

- **URLInput.tsx** -- Multi-line text area for direct URL entry with inline validation feedback.
- **FileUpload.tsx** -- Drag-and-drop file upload supporting XLS, XLSX, and CSV formats. Extracts URLs from uploaded files and detects exported reports for resume capability. Includes an embedded strategy toggle.

### 2. File Parser

Handles file parsing and URL validation.

- **fileParser.ts** -- Parses uploaded spreadsheet and CSV files via the `xlsx` library. Inspects column headers to determine whether the file contains URL-only data or a previously exported Lighthouse report. Returns a discriminated union (`ParseFileResult`) that separates the two cases. Enforces a 10 MB size limit and 500 URL maximum.
- **urlValidator.ts** -- Validates and sanitizes user-supplied URLs before they enter the processing queue.

### 3. API Integration Layer

Manages communication with the Google PageSpeed Insights API.

- **pagespeedClient.ts** -- Sends requests to the PSI API v5 endpoint with a concurrency limit of 4 simultaneous requests. Implements exponential backoff on HTTP 429 (rate limit) responses, a 60-second per-request timeout, and AbortController support for cancellation.

### 4. Report Parser

Transforms raw API responses into the application's internal data model.

- **reportParser.ts** -- Extracts category scores (Performance, Accessibility, SEO, Best Practices) and Core Web Vitals (FCP, LCP, TBT, CLS, TTI) from the raw Lighthouse JSON and returns a typed `LighthouseReport` object.

### 5. Orchestration (page.tsx)

The root `Home` component in `page.tsx` orchestrates the entire application.

- Manages a queue-based worker pool that processes URLs with bounded concurrency.
- Renders results progressively: placeholder entries appear immediately for each URL, then update in-place as reports arrive.
- Uses an `abortControllerRef` using AbortController for instant cancellation of in-flight requests.
- Maintains a per-strategy result cache (`resultsCacheRef`) so switching between mobile and desktop preserves previously fetched reports.
- Handles theme initialization and dark mode toggling.

### 6. Results Display

Renders Lighthouse data in the dashboard.

- **ResultsTable.tsx** -- Desktop table layout with sortable columns and expandable rows that reveal Core Web Vitals. Collapses to a mobile card layout on small screens. Displays "From file" badges on imported results.
- **ScoreBadge.tsx** -- Animated SVG ring with a color-coded arc (green >= 90, orange >= 50, red < 50) and centered numeric score.
- **ScoreChart.tsx** -- Horizontal bar chart visualizing category scores with hover tooltips.
- **MetricsPanel.tsx** -- Grid of Core Web Vitals with definition tooltips explaining each metric.
- **Tooltip.tsx** -- Reusable glass-panel tooltip component with configurable positioning.
- **LoadingSpinner.tsx** -- Orbiting ring animation with progress text displayed during analysis.

### 7. Export Layer

All export logic runs entirely in the browser.

- **exportPDF.ts** -- Generates PDF reports using jsPDF with jspdf-autotable. Includes a branded header layout and color-coded score cells.
- **exportCSV.ts** -- Produces both SpreadsheetML XML (saved as .xls with color-coded cells) and plain CSV output. Includes all queued URLs regardless of completion status.
- **exportDOCX.ts** -- Creates Word documents using the `docx` package with colored score shading in table cells.
- **ExportDropdown.tsx** -- Dropdown menu component offering PDF, XLS, CSV, and DOCX export format selection.

### 8. Strategy Toggle

- **StrategyToggle.tsx** -- Accessible toggle switch (role="switch") for selecting between mobile and desktop analysis strategies. Embedded in both the URLInput area and the FileUpload component.

### 9. Theme System

- A blocking inline script in `layout.tsx` reads the stored theme preference from localStorage before first paint, preventing flash of unstyled content (FOUC). Dark mode is the default.
- React state with localStorage persistence manages theme toggling at runtime.
- Styling is handled by Tailwind CSS 4 via the PostCSS plugin, using the class strategy for dark mode.

---

## Key Files

```
src/
  app/
    layout.tsx          Root layout with fonts (Sora, JetBrains Mono), metadata, and theme script
    page.tsx            Main orchestration component; all application state lives here
    globals.css         Global styles and Tailwind directives

  components/
    URLInput.tsx        Multi-line URL text input with validation
    FileUpload.tsx      Drag-and-drop file upload with report resume detection
    StrategyToggle.tsx  Mobile/desktop strategy toggle switch
    ResultsTable.tsx    Sortable results table with expandable rows and mobile cards
    ScoreBadge.tsx      Animated SVG ring score indicator
    ScoreChart.tsx      Horizontal bar chart for category scores
    MetricsPanel.tsx    Core Web Vitals grid with definition tooltips
    Tooltip.tsx         Reusable positioned tooltip component
    ExportDropdown.tsx  Export format selection dropdown
    LoadingSpinner.tsx  Orbiting ring loader with progress display

  lib/
    pagespeedClient.ts  Google PSI API client with concurrency, backoff, and abort
    reportParser.ts     Transforms raw API JSON into typed LighthouseReport
    fileParser.ts       Parses uploaded XLS/XLSX/CSV; detects reports vs URL-only files
    urlValidator.ts     URL validation and sanitization
    exportPDF.ts        PDF generation via jsPDF and jspdf-autotable
    exportCSV.ts        SpreadsheetML XLS and plain CSV generation
    exportDOCX.ts       DOCX generation via the docx package

  types/
    report.ts           TypeScript interfaces: LighthouseReport, CategoryScores, CoreWebVitals
```

---

## State Management

All state lives in the root `Home` component in `page.tsx`. There is no external state management library.

| State / Ref | Type | Purpose |
|---|---|---|
| `results` | `LighthouseReport[]` | Array of report objects indexed by URL position. Placeholder entries are created immediately and updated in-place as API responses arrive. |
| `resultsCacheRef` | `React.MutableRefObject<Map<string, LighthouseReport[]>>` | Per-strategy cache keyed by `"mobile"` or `"desktop"`. Preserves fetched results when the user switches strategies. |
| `abortControllerRef` | `React.MutableRefObject<AbortController \| null>` | AbortController for instant cancellation of in-flight API requests when the user cancels a batch. |
| `strategy` | `"desktop" \| "mobile"` | Current analysis strategy passed to the PSI API and used as the cache key. |

---

## Lighthouse Data Source

All Lighthouse metrics are sourced from the Google PageSpeed Insights API v5.

Endpoint: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`

---

## Deployment Architecture

```
Git Repository  -->  Static Build (npm run build)  -->  Hosting Platform
```

The build produces a fully static export in the `/out` directory. Supported hosting platforms include Cloudflare Pages, Vercel, Netlify, and GitHub Pages.

---

## Security Considerations

- Input validation and URL sanitization before API requests.
- File size limit (10 MB) and URL count limit (500) on uploaded files.
- Concurrency throttling and exponential backoff to prevent API flooding.
- The API key is intentionally client-side; access restrictions should be configured in the Google Cloud Console (HTTP referrer restrictions).
