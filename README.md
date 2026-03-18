# Site Speed Analyzer

## Overview

Site Speed Analyzer is a bulk Lighthouse performance analyzer that runs entirely in the browser. It accepts multiple URLs, queries the Google PageSpeed Insights API v5, and presents color-coded scores in a responsive dashboard. There is no backend -- the app is a fully static site designed for free hosting on platforms like Vercel, Cloudflare Pages, or Netlify.

## Key Features

### Bulk Analysis

- Analyze up to 500 URLs in a single run
- 4 concurrent workers with queue-based processing
- Progressive rendering -- results appear in real time as each URL completes
- Cancel/abort with instant in-flight request termination via AbortController
- Exponential backoff on API rate limits (HTTP 429)

### Input Methods

- Manual URL entry (one per line)
- File upload: drag-and-drop or click-to-browse (XLS, XLSX, CSV)
- Smart URL column detection in spreadsheets
- Resume from exported files -- upload a previously exported report to continue where you left off
- Import summary showing completed vs queued URLs

### Desktop and Mobile Strategy

- Sliding toggle switch to select Desktop or Mobile analysis
- Desktop as the default strategy
- Per-strategy result caching (switch without re-running)
- Strategy indicator badge in the results area
- Dynamic hero subtitle that displays "Desktop" or "Mobile" based on the current toggle selection

### Results Dashboard

- Responsive table on desktop, card layout on mobile
- Animated SVG score ring badges with color coding (green >= 90, orange >= 50, red < 50)
- Expandable rows with Score Overview chart and Core Web Vitals detail
- Score count-up animations on render
- Horizontal bar chart with glow effects
- Tooltips on score categories and metric abbreviations (desktop only; removed from mobile card layout)
- Column sorting
- "From file" badge on results imported from a previous export

### Export Formats

- PDF -- branded header, color-coded score cells, page numbers
- XLS -- color-coded SpreadsheetML Excel format with colored score cells, alternating row backgrounds, and summary row
- CSV -- plain text export with headers and metadata (separate button in the export dropdown)
- DOCX -- colored score shading, score legend, styled tables
- All exports include both completed and incomplete URLs to support the resume workflow

### Modern UI/UX

- Dark mode by default with FOUC prevention
- Light/dark toggle with localStorage persistence
- Responsive design with mobile-first breakpoints
- Orbiting ring loader with progress percentage indicator
- Static navbar that scrolls with the page
- Glass-panel effects and gradient backgrounds

## Metrics Provided

Each analyzed URL returns the following Lighthouse data:

- Performance Score
- Accessibility Score
- SEO Score
- Best Practices Score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

## Tech Stack

- Next.js 16 (static export, `output: "export"`)
- TypeScript
- Tailwind CSS 4
- Google PageSpeed Insights API v5
- jsPDF + jspdf-autotable (PDF export)
- docx + file-saver (DOCX export)
- xlsx / SheetJS (file parsing and XLS export)

## Architecture

```
URLInput / FileUpload
       |
       v
  URL Validation (lib/urlValidator.ts)
       |
       v
  pagespeedClient.ts  -->  Google PSI API v5
       |                   (or scores imported from file)
       v
  reportParser.ts  -->  typed LighthouseReport
       |
       v
  page.tsx orchestration  -->  progressive results state
       |
       v
  ResultsTable / ScoreChart / MetricsPanel  -->  visual display
       |
       v
  ExportDropdown  -->  PDF / XLS / CSV / DOCX
```

All logic runs client-side. There are no server components, API routes, or middleware.

## Getting Started

Clone the repository:

```bash
git clone <repo-url>
cd Site-Speed-Analyzer
npm install
```

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_PSI_API_KEY=your_google_api_key
```

You can obtain a free API key from the [Google Cloud Console](https://console.cloud.google.com/) by enabling the PageSpeed Insights API.

Run the application:

```bash
npm run dev        # Start development server
npm run build      # Production build (static files output to /out)
npm run lint       # Run ESLint
```

## Usage

1. Open the application in your browser.
2. Enter one or more URLs manually, or upload a file (XLS, XLSX, CSV) containing URLs.
3. Select the analysis strategy using the Desktop/Mobile toggle.
4. Click "Generate Report" to start the analysis.
5. Results appear progressively as each URL completes.
6. Expand any row to view the Score Overview chart and Core Web Vitals.
7. Export results in your preferred format (PDF, XLS, CSV, DOCX).
8. To resume later, upload a previously exported file -- completed results are restored and only remaining URLs are queued.

## Deployment

This is a fully static site. Deploy the `/out` directory to any static hosting provider:

- Vercel
- Cloudflare Pages
- Netlify
- GitHub Pages

No server runtime is required.

## License

MIT License
