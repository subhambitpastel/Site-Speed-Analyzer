# Recent Fixations & Improvements

This file tracks recent improvements and bug fixes. New entries are added at the top.

---

### 29. Comprehensive Unit Testing Setup (2026-03-18)
- **Bug:** No test suite existed for the application — no way to verify component behavior or catch regressions
- **Root cause:** Test infrastructure not set up, no test configuration or test files
- **Fix:** Set up Jest + React Testing Library with next/jest, browser API mocks, and path alias support. Wrote 179 tests across 18 test suites: 7 utility module test files (urlValidator, reportParser, pagespeedClient, exportCSV, exportPDF, exportDOCX, fileParser), 9 component test files (URLInput, FileUpload, ScoreBadge, ScoreChart, MetricsPanel, Tooltip, ResultsTable, ExportDropdown, LoadingSpinner), and page.tsx integration tests. All tests pass with zero failures.
- **Files modified:** jest.config.ts (new), jest.setup.ts (new), package.json, src/__tests__/smoke.test.ts, src/__tests__/lib/*.test.ts (7 files), src/__tests__/components/*.test.tsx (9 files), src/__tests__/page.test.tsx
- **Verified by:** npm test (179/179 passing), npm run build (success), npm run lint (clean)

### 28. Resume Analysis from Previously Exported Files (2026-03-18)
- **Bug:** Uploading a previously exported XLS/CSV/XLSX re-analyzed all URLs from scratch instead of reusing existing data
- **Root cause:** fileParser.ts only extracted URLs, discarded all score/metric data from uploaded files
- **Fix:** Enhanced fileParser to detect exported report files (checks for Performance/Accessibility/SEO/Best Practices columns), reconstructs LighthouseReport objects from exported data, returns discriminated union. Updated FileUpload with import UI showing summary. Added handleImportReports to page.tsx for direct result pre-population. Added "From file" badge in ResultsTable. Also updated export functions to include ALL URLs (completed + incomplete) so progress can be saved and resumed.
- **Files modified:** src/lib/fileParser.ts, src/components/FileUpload.tsx, src/app/page.tsx, src/types/report.ts, src/components/ResultsTable.tsx, src/lib/exportCSV.ts, src/lib/exportDOCX.ts
- **Verified by:** Build passes, quality score 90/85

### 27. Default to Dark Mode on First Visit (2026-03-18)
- **Bug:** App defaulted to light mode on first visit, ignoring dark-mode-first preference
- **Root cause:** useState initializer defaulted to false (light mode), no blocking script to set dark class before paint
- **Fix:** Added blocking inline script in layout.tsx that checks localStorage and defaults to dark, changed useState to default true, added explicit localStorage validation, extracted reusable applyTheme callback
- **Files modified:** src/app/layout.tsx, src/app/page.tsx
- **Verified by:** Build passes, quality score 90/85, no FOUC, existing preferences respected

### 26. Metric Definition Tooltips for FCP/LCP/TBT/CLS/TTI (2026-03-17)
- **Bug:** Hovering over FCP, LCP, TBT, CLS, TTI metric abbreviations in MetricsPanel showed no definitions
- **Root cause:** Metric abbreviations had no hover tooltips explaining what each metric measures
- **Fix:** Added detailed definition tooltips for all 5 metrics with full name and plain-English explanation (e.g., "FCP — Time until the browser renders the first piece of content"), dashed underline on abbreviations to hint interactivity, reused shared glass-panel tooltip component for consistency with BUG-6/BUG-7
- **Files modified:** src/components/MetricsPanel.tsx
- **Verified by:** Build passes, visual QA confirms tooltips appear on hover with consistent styling

### 25. Premium Tooltips in ScoreChart Bar Chart (2026-03-17)
- **Bug:** Hovering over category labels (Performance, Accessibility, SEO, Best Practices) in the Score Overview horizontal bar chart showed no tooltip
- **Root cause:** ScoreChart category labels had no hover information explaining what each score measures
- **Fix:** Added glass-panel tooltips with info icons on all 4 category labels in the horizontal bar chart, reusing the same Tooltip component and styling from ResultsTable for visual consistency, with intelligent positioning to avoid bar overlap or container clipping
- **Files modified:** src/components/ScoreChart.tsx
- **Verified by:** Build passes, tooltips render correctly without overlapping bars

### 24. Premium Tooltips in ResultsTable (2026-03-17)
- **Bug:** Hovering over Performance, Accessibility, SEO, and Best Practices column headers/score labels in the results table showed nothing
- **Root cause:** Score category labels in desktop headers, desktop row cells, and mobile card labels had no hover information
- **Fix:** Added glass-panel tooltips with smooth fade-in animation (150-200ms), subtle shadow, rounded corners, and info icons (circle-i) next to each header. Created reusable Tooltip component with detailed descriptions for all 4 categories. Positioned intelligently to avoid overflow
- **Files modified:** src/components/ResultsTable.tsx, src/components/Tooltip.tsx (new)
- **Verified by:** Build passes, quality score 92/85

### 23. Orbiting Ring Loader Animation (2026-03-17)
- **Bug:** Loading animation during analysis was a basic spinner without visual polish
- **Root cause:** LoadingSpinner used simple rotate animation without gradient arc or glow effects
- **Fix:** Replaced with 96px SVG ring loader featuring gradient arc trail (sky-500 to transparent), bloom glow filter, progress-proportional stroke-dasharray that fills as analysis progresses, smooth continuous rotation via GPU-accelerated CSS keyframes, and centered progress percentage text inside the ring
- **Files modified:** src/components/LoadingSpinner.tsx, src/app/globals.css
- **Verified by:** Build passes, quality score 92/85

### 22. Strategy Badge in Results Area (2026-03-17)
- **Bug:** After analysis completes, no visible indicator showed whether results were for Desktop or Mobile
- **Root cause:** Results section header had no strategy label or badge
- **Fix:** Added gradient pill badge next to Results heading showing "Desktop Results" or "Mobile Results" with device icon (monitor/smartphone SVG), using app accent gradient for active strategy color, badge-swap animation on strategy change, updates dynamically when user switches strategy and re-runs
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes, quality score 92/85

### 21. Strategy Toggle Repositioned Near Generate Button (2026-03-17)
- **Bug:** Desktop/Mobile toggle was disconnected from the URL input and Generate Report button, breaking the natural UX flow
- **Root cause:** Toggle was positioned too far from the primary action area, not visually grouped with input/generate workflow
- **Fix:** Moved toggle inline with the Generate Report button row (left-aligned toggle, right-aligned button) for tight visual grouping. Ensured balanced layout on both mobile and desktop viewports using consistent spacing tokens from the existing design system
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes, responsive layout verified on mobile and desktop

### 20. Premium Sliding Toggle Switch (2026-03-17)
- **Bug:** Desktop/Mobile strategy toggle used pill-style buttons that didn't feel like a modern premium switch
- **Root cause:** Original implementation used two discrete buttons with no sliding thumb animation or physical motion feel
- **Fix:** Replaced pill buttons with iOS-style sliding toggle switch featuring a smooth sliding thumb/knob with subtle shadow, track color/gradient change on slide, spring-like cubic-bezier easing for physical satisfying motion, bold/white active label with muted inactive label, monitor/phone icons beside labels, disabled state (dimmed, non-interactive) while analysis is loading
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes, quality score 85/85

### 19. Navbar Overlapping Content Fixed (2026-03-17)
- **Bug:** Navbar overlapped page content when scrolling
- **Root cause:** Fixed navbar had no hide/show behavior and main content lacked proper top padding
- **Fix:** Added hide-on-scroll-down, show-on-scroll-up pattern with scroll direction tracking, 10px debounce threshold, smooth CSS transition, and proper content padding (pt-20/sm:pt-24/lg:pt-28)
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes, quality score 92/85

### 18. Color-Coded DOCX Export (2026-03-17)
- **Bug:** DOCX export was plain black and white
- **Root cause:** Score cells lacked colored backgrounds and text styling
- **Fix:** Added colored score cell shading (green/orange/red), bold colored score text, enhanced header rows, and score color legend section
- **Files modified:** src/lib/exportDOCX.ts
- **Verified by:** Build passes, quality score 88/85

### 17. Color-Coded Excel/XLS Export (2026-03-17)
- **Bug:** CSV export was plain black and white with no color coding
- **Root cause:** Plain CSV format cannot support colors or styling
- **Fix:** Replaced with SpreadsheetML XML format (.xls) with color-coded score cells (green/orange/red), dark header row, alternating row backgrounds, title row, and bold summary row
- **Files modified:** src/lib/exportCSV.ts, src/components/ExportDropdown.tsx
- **Verified by:** Build passes, quality score 88/85

### 16. Metric Definition Tooltips in MetricsPanel (2026-03-17)
- **Bug:** No tooltip when hovering FCP, LCP, TBT, CLS, TTI metric abbreviations
- **Root cause:** Metric abbreviations had no definitions shown on hover
- **Fix:** Added definition tooltips for all 5 metrics with full name and brief explanation
- **Files modified:** src/components/MetricsPanel.tsx
- **Verified by:** Build passes

### 15. Score Tooltips in ScoreChart (2026-03-17)
- **Bug:** No tooltip when hovering score categories in Score Overview section
- **Root cause:** ScoreChart category labels had no hover tooltips
- **Fix:** Added same descriptive tooltips to all 4 category labels in horizontal bar chart
- **Files modified:** src/components/ScoreChart.tsx
- **Verified by:** Build passes

### 14. Score Tooltips in ResultsTable (2026-03-17)
- **Bug:** No tooltip when hovering Performance, Accessibility, SEO, Best Practices in results table
- **Root cause:** Score labels had no hover information
- **Fix:** Added descriptive tooltips to all 4 score categories in desktop headers, desktop row cells, and mobile card labels using reusable Tooltip component
- **Files modified:** src/components/ResultsTable.tsx, src/components/Tooltip.tsx (new)
- **Verified by:** Build passes, quality score 92/85

### 13. Circular Motion Loading Animation (2026-03-17)
- **Bug:** Loading animation was a basic spinner without circular ring motion
- **Root cause:** LoadingSpinner used simple rotate animation without elastic dasharray
- **Fix:** Added spinner-dash keyframe animation that varies stroke-dasharray (1,150 to 90,150) for Material-style elastic ring effect, combined with circular rotation
- **Files modified:** src/components/LoadingSpinner.tsx, src/app/globals.css
- **Verified by:** Build passes, quality score 92/85

### 12. Desktop/Mobile Indicator in Results Area (2026-03-17)
- **Bug:** No visible indicator showing which strategy the results are for
- **Root cause:** Results section had no strategy label
- **Fix:** Added pill badge with device icon (monitor/smartphone) next to Results heading, dynamically shows "Desktop results" or "Mobile results" with badge-swap animation
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes, quality score 92/85

### 11. Default Strategy Changed to Desktop (2026-03-17)
- **Bug:** Strategy defaulted to Mobile instead of Desktop
- **Root cause:** useState initialized with "mobile"
- **Fix:** Changed default from useState("mobile") to useState("desktop")
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes

### 10. Strategy Toggle Repositioned Near Input Area (2026-03-17)
- **Bug:** Strategy toggle was in the header, far from the URL input/generate area
- **Root cause:** Toggle was placed in the top nav bar instead of the analysis configuration section
- **Fix:** Moved toggle to just above the input mode tabs (Enter URLs / Upload File) for better UX flow
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes

### 9. Smooth Strategy Toggle Switch (2026-03-17)
- **Bug:** Desktop/Mobile strategy selector used separate buttons instead of a smooth toggle
- **Root cause:** Original implementation used two discrete buttons with no sliding animation
- **Fix:** Replaced with pill-shaped sliding toggle switch with CSS transitions (duration-300), gradient active indicator
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes, quality score 85/85

### 8. Fix fetchedAt TypeError on Results Display (2026-03-16)
- **Bug:** Runtime TypeError: Cannot read properties of undefined (reading 'fetchedAt') on line 372 of page.tsx
- **Root cause:** Results array could contain undefined entries from strategy cache populated during cancelled/partial runs. The .filter() and .some() calls did not use optional chaining.
- **Fix:** Added optional chaining (r?.fetchedAt) on results filter/some calls, and added .filter(Boolean) when restoring cached results to remove any undefined entries
- **Files modified:** src/app/page.tsx
- **Verified by:** Build passes

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
