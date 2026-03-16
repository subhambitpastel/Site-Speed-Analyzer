# Recent Fixations & Improvements

This file tracks recent improvements and bug fixes. New entries are added at the top.

---

### 7. Cancel Button Race Condition Fix (2026-03-16)
- **Bug:** Cancel button caused errors due to race conditions with in-flight requests
- **Root cause:** Cancel set isLoading=false immediately while workers still ran, causing stale state updates. Retry backoff wait was not abortable.
- **Fix:** Removed immediate isLoading=false from cancel onClick (let workers finish cleanly), made retry wait abortable via AbortSignal, added abort check before caching results
- **Files modified:** src/app/page.tsx, src/lib/pagespeedClient.ts, tests/cancel.spec.ts (new), playwright.config.ts (new)
- **Verified by:** Playwright browser tests (2 tests passing)

### 5. Cancel Button Instantly Aborts Analysis (2026-03-16)
- **Bug:** Cancel button did not stop in-flight API requests immediately
- **Root cause:** Cancel only set a boolean flag; in-flight fetch() calls were not aborted
- **Fix:** Added AbortController integration — cancel now aborts all in-flight fetch requests instantly, clears loading state, and marks remaining URLs as cancelled
- **Files modified:** src/app/page.tsx, src/lib/pagespeedClient.ts
- **Verified by:** Build passes

### 6. Strategy Toggle Caches Results Per Device Type (2026-03-16)
- **Bug:** Switching between Desktop/Mobile toggle re-triggered analysis instead of showing cached results
- **Root cause:** No results caching per device type; strategy change cleared results
- **Fix:** Added in-memory results cache per strategy (mobile/desktop). Toggling shows cached results instantly.
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes

### 4. Upload Excel/CSV File for Bulk Reports (2026-03-16)
- **Bug:** No option to upload a file with multiple website URLs for bulk report generation
- **Root cause:** Feature not implemented — only manual URL entry was available
- **Fix:** Added file upload with drag-and-drop UI, Excel/CSV parser using SheetJS (xlsx), smart URL column detection, tab toggle between "Enter URLs" and "Upload File" modes, 10MB file size limit, 500 URL cap
- **Files modified:** src/lib/fileParser.ts (new), src/components/FileUpload.tsx (new), src/app/page.tsx, package.json
- **Verified by:** Build passes, quality scoring (91/100)

### 1. Frontend UI & Mobile Responsiveness (2026-03-16)
- **Bug:** Frontend not responsive on mobile/tablet - elements overflow, misalign, don't adapt
- **Root cause:** Missing responsive breakpoints, fixed widths, no mobile-specific layouts, no dark mode toggle
- **Fix:** Added mobile card-based layout for results table, responsive breakpoints across all components, dark mode toggle with localStorage, proper touch targets (44px), focus-visible rings, cancel button for scans
- **Files modified:** src/app/page.tsx, src/app/globals.css, src/app/layout.tsx, src/components/ResultsTable.tsx, src/components/MetricsPanel.tsx, src/components/ScoreChart.tsx, src/components/ExportDropdown.tsx, src/components/URLInput.tsx, src/components/ScoreBadge.tsx
- **Verified by:** Visual QA scoring (85/100), build verification passes

### 2. Browser-Based Frontend Review & Fixes (2026-03-16)
- **Bug:** Frontend needed comprehensive review for visual correctness and functional behavior
- **Root cause:** Score ring animation had wrong circumference (282.74 vs 100.53), dropdown lacked keyboard accessibility, no cancel button, alert() used for errors
- **Fix:** Fixed SVG score ring animation, added Escape key + ARIA attributes to export dropdown, added cancel button, replaced alert() with console.error in exports, added aria-labels to expandable rows
- **Files modified:** src/app/globals.css, src/components/ExportDropdown.tsx, src/components/ResultsTable.tsx, src/app/page.tsx, src/lib/exportPDF.ts, src/lib/exportCSV.ts, src/lib/exportDOCX.ts
- **Verified by:** Comprehensive code review, build verification passes

### 3. Export Files Polish (PDF/CSV/DOCX) (2026-03-16)
- **Bug:** Exported files not well-structured, not properly aligned, not visually attractive
- **Root cause:** Basic formatting without professional styling - plain tables, no color coding, no branding
- **Fix:** PDF: branded header bar, color-coded score backgrounds, alternating rows, footer with page numbers, visual summary section. DOCX: professional title page, colored table headers, score color shading, page breaks, header/footer. CSV: UTF-8 BOM, metadata comments, averages row
- **Files modified:** src/lib/exportPDF.ts, src/lib/exportCSV.ts, src/lib/exportDOCX.ts
- **Verified by:** Export quality scoring (85/100), build verification passes
