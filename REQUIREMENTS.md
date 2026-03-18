# Requirements Specification

## Functional Requirements

### URL Input

The application shall accept URLs for analysis through two input methods:

- Manual multi-line text entry, one URL per line, supporting both HTTP and HTTPS protocols.
- File upload of XLS, XLSX, or CSV files via drag-and-drop or click-to-browse. The parser performs smart URL column detection in spreadsheets.
- All URLs are validated and sanitized before processing.
- Maximum of 500 URLs per batch. Maximum file size of 10MB.

---

### Lighthouse Report Retrieval

The system shall retrieve Lighthouse reports via the Google PageSpeed Insights API v5.

API endpoint:

https://www.googleapis.com/pagespeedonline/v5/runPagespeed

- Desktop and Mobile strategy support with a sliding toggle switch. Desktop is the default strategy.
- Per-strategy result caching: switching between Desktop and Mobile displays cached results instantly without re-fetching.

Required data per URL:

- Performance score
- Accessibility score
- SEO score
- Best Practices score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

---

### Results Display

The system shall display results in a structured dashboard:

- Responsive table layout on desktop viewports; card-based layout on mobile viewports.
- Animated SVG score ring badges with color coding: green (score >= 90), orange (score >= 50), red (score < 50). Scores animate with a count-up effect.
- Expandable rows revealing a Score Overview horizontal bar chart and Core Web Vitals metrics panel.
- Column sorting with ascending/descending toggle.
- Strategy indicator badge (Desktop/Mobile) with device icon next to the Results heading, updating dynamically on strategy change.
- Glass-panel tooltips on score category headers (Performance, Accessibility, SEO, Best Practices) and metric abbreviations (FCP, LCP, TBT, CLS, TTI) with full names and plain-English definitions.
- "From file" badge on results imported from a previously exported file.

---

### Batch Processing

The system shall process URLs concurrently:

- Queue-based worker pool with 4 parallel workers.
- Exponential backoff on HTTP 429 rate limit responses: 3 retries with a 10-second base delay.
- 60-second timeout per API request.
- AbortController integration for instant cancellation of all in-flight requests.
- Progressive rendering: results display immediately as placeholders and update in-place as each URL completes.

---

### Export

The system shall support four export formats, all executed entirely in-browser:

- **PDF**: Branded header bar, color-coded score backgrounds (green/orange/red), alternating row shading, footer with page numbers, visual summary section.
- **XLS**: Color-coded SpreadsheetML Excel format (.xls) with colored score cells, dark header row, alternating row backgrounds, title row, and bold summary row. Available as a separate export button in the dropdown.
- **CSV**: Plain text export (.csv) with UTF-8 BOM and column headers. Available as a separate export button in the dropdown, distinct from the XLS option.
- **DOCX**: Colored score cell shading, styled table headers, bold score text, and score color legend section.

All export formats include both completed and incomplete URLs so that progress can be saved and resumed.

---

### Resume from File

The system shall support resuming analysis from a previously exported file:

- Upload of previously exported XLS, CSV, or XLSX files.
- Auto-detection of completed results by identifying rows with valid scores (checks for Performance, Accessibility, SEO, Best Practices columns).
- Pre-population of the results table with existing data from the imported file.
- Queuing of only incomplete URLs for fresh analysis.
- Import summary displaying the count of loaded results versus queued URLs.

---

### Theme

- Dark mode by default on first visit.
- Blocking inline script in the document head prevents flash of unstyled content (FOUC) by applying the dark class before first paint.
- Light/dark toggle with localStorage persistence.
- Existing user preferences are respected on subsequent visits.

---

### Error Handling

The system shall handle errors gracefully:

- Invalid URL detection and reporting prior to submission.
- API failure handling with user-friendly error messages (no raw alert dialogs).
- Network error detection.
- 60-second timeout with descriptive error message per URL.
- HTTP 429 rate limit retry with exponential backoff (3 retries, 10-second base).
- AbortController for instant cancellation; remaining URLs are marked as cancelled.
- Per-URL error display in the results table/cards.

---

## Non-Functional Requirements

### Deployment

- Fully static website generated via Next.js static export (output: "export").
- No server infrastructure, API routes, middleware, or backend required.

---

### Performance

- Up to 500 URLs per batch.
- 4 concurrent API requests via worker pool.
- Progressive rendering for responsive UI during long-running batches.

---

### Compatibility

- Chrome, Edge, Firefox, Safari.
- Responsive design: mobile, tablet, and desktop viewports.
- Mobile-first breakpoints with minimum 44px touch targets.

---

### Security

- URL input sanitization to prevent malformed URL injection.
- Client-side API key exposed intentionally via NEXT_PUBLIC_PSI_API_KEY for static deployment.

---

### Maintainability

- TypeScript throughout.
- Modular component architecture with reusable UI components (Tooltip, ScoreBadge, etc.).
- Path alias @/* mapped to src/*.

---

## External Dependencies

- Next.js 16
- Tailwind CSS 4
- Google PageSpeed Insights API v5
- xlsx / SheetJS (file parsing for XLS, XLSX, CSV uploads)
- jsPDF + jspdf-autotable (PDF export)
- docx + file-saver (DOCX export)
