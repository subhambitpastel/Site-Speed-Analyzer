# Bugs To Be Fixed

---

### TASK-1: Comprehensive Unit Testing — Setup, Write, Fix, Retest Until Perfect

> **Note to the fixing agent (Claude):** You are a **professional QA tester AND a professional developer**. Your job is to set up a complete Jest + React Testing Library test suite, write thorough unit tests for **every single component and utility module** in this application, run them, fix any bugs or failures discovered, and **retest in a loop until every test passes and the app is fully functional**. Do not stop at "tests written" — the deliverable is a **green test suite with a working application**.

---

#### Phase 1: Test Infrastructure Setup
- Install and configure **Jest** + **@testing-library/react** + **@testing-library/jest-dom** + **@testing-library/user-event** + **ts-jest** (or `@swc/jest` for speed)
- Add `jest.config.ts` with proper Next.js + TypeScript + path alias (`@/*` → `./src/*`) support
- Add a `jest.setup.ts` that imports `@testing-library/jest-dom`
- Mock browser APIs as needed: `localStorage`, `window.matchMedia`, `IntersectionObserver`, `URL.createObjectURL`, `Blob`
- Add a `test` script to `package.json`
- Ensure the setup compiles and runs with zero errors before writing any tests

#### Phase 2: Unit Tests for Utility / Library Modules
Write test files in a `__tests__/` folder (or co-located `.test.ts` files). Cover:

1. **`src/lib/urlValidator.ts`**
   - Valid URLs (http, https, with/without www, with paths, with query params)
   - Invalid URLs (missing protocol, empty string, random text, javascript: URIs, duplicate URLs)
   - Edge cases (trailing slashes, unicode domains, very long URLs)

2. **`src/lib/reportParser.ts`**
   - Parsing a complete valid PSI API response into a `LighthouseReport`
   - Handling missing/partial data gracefully (missing categories, missing metrics)
   - Correct extraction of scores (performance, accessibility, SEO, best-practices)
   - Correct extraction of metrics (FCP, LCP, TBT, CLS, TTI) with proper units

3. **`src/lib/pagespeedClient.ts`**
   - Successful API call returns parsed data
   - 429 rate-limit triggers exponential backoff retry
   - Timeout after 60s
   - Network error handling
   - Concurrency limit of 4 is respected
   - Mock `fetch` for all tests — never hit the real API

4. **`src/lib/exportCSV.ts`**
   - Generates valid CSV string from results array
   - Handles special characters (commas, quotes, newlines in URLs)
   - Empty results produce header-only CSV
   - Correct column order and formatting

5. **`src/lib/exportPDF.ts`**
   - Calls jsPDF/autotable correctly (mock jsPDF)
   - Passes correct data structure to autotable
   - Handles empty results without crashing

6. **`src/lib/exportDOCX.ts`**
   - Generates a valid docx Blob
   - Includes all result rows
   - Handles empty results without crashing

7. **`src/lib/fileParser.ts`**
   - Parses CSV files with URLs
   - Parses XLS/XLSX files with URLs
   - Handles files with no valid URLs
   - Extracts previously-completed results from exported report files (resume feature)

#### Phase 3: Unit Tests for UI Components
Use `@testing-library/react` with `render`, `screen`, `fireEvent`, `userEvent`, `waitFor`. Cover:

1. **`src/components/URLInput.tsx`**
   - Renders textarea and submit button
   - Submit button is disabled when textarea is empty
   - Submit button shows loading spinner during analysis
   - Calls onSubmit with parsed URLs on form submission
   - Displays validation errors for invalid URLs
   - Textarea is disabled during loading state

2. **`src/components/FileUpload.tsx`**
   - Renders file input / drop zone
   - Accepts CSV, XLS, XLSX files
   - Rejects unsupported file types
   - Calls onFileLoad with parsed URLs from uploaded file
   - Displays file name after upload

3. **`src/components/StrategyToggle.tsx`**
   - Renders Desktop and Mobile options
   - Desktop is selected by default
   - Clicking Mobile switches the active state
   - Calls onChange callback with correct strategy value
   - Is disabled during loading state
   - Visual indicator clearly shows active state

4. **`src/components/ScoreBadge.tsx`**
   - Renders SVG circular progress ring
   - Shows correct score number
   - Green color for scores ≥ 90
   - Orange/amber color for scores ≥ 50 and < 90
   - Red color for scores < 50
   - Handles score of 0 and 100 correctly

5. **`src/components/ScoreChart.tsx`**
   - Renders all 4 category bars (Performance, Accessibility, SEO, Best Practices)
   - Bar widths correspond to scores
   - Correct color coding per score range
   - Hover tooltips display category descriptions

6. **`src/components/MetricsPanel.tsx`**
   - Renders all 5 metric cards (FCP, LCP, TBT, CLS, TTI)
   - Displays correct metric values with units
   - Hover tooltips display metric definitions
   - Responsive grid layout renders correctly

7. **`src/components/Tooltip.tsx`**
   - Renders tooltip content on hover/focus
   - Hides tooltip when not hovered
   - Positions correctly (no overflow clipping)

8. **`src/components/ResultsTable.tsx`**
   - Renders table headers for all columns
   - Shows loading state (spinner + "Analyzing...") for pending URLs
   - Shows error state for failed URLs
   - Shows score badges for completed URLs
   - Clicking a row expands it to show ScoreChart + MetricsPanel
   - Sorting works correctly (ascending/descending toggle)
   - Hover tooltips on column headers show category descriptions

9. **`src/components/ExportDropdown.tsx`**
   - Renders export button
   - Dropdown opens on click with CSV, PDF, DOCX options
   - Each option triggers the correct export function
   - Dropdown closes after selection
   - Is disabled when no results exist

10. **`src/components/LoadingSpinner.tsx`**
    - Renders SVG spinner
    - Accepts size prop (sm, md, lg) and renders correct dimensions
    - Has proper animation class

#### Phase 4: Integration-Level Tests for `page.tsx`
1. **Initial render** — dark mode default, Desktop strategy selected, URL input mode active
2. **Mode switching** — toggling between "Enter URLs" and "Upload File" tabs
3. **Strategy toggle** — switching Desktop ↔ Mobile updates state
4. **Dark mode toggle** — clicking the theme button toggles dark/light class
5. **Navbar scroll behavior** — navbar hides on scroll down, shows on scroll up
6. **Full analysis flow** (mock `pagespeedClient`) — enter URLs → click Generate → see loading states → see results → expand a row → verify ScoreChart + MetricsPanel render
7. **Cancel analysis** — clicking cancel mid-analysis stops processing
8. **Export flow** — with mock results, clicking Export → CSV/PDF/DOCX triggers correct export

#### Phase 5: Fix-Retest Loop
- **Run the full test suite** with `npm test`
- For every failing test:
  - Diagnose whether the failure is a **test bug** (wrong assertion, missing mock) or an **application bug** (component doesn't behave as expected)
  - Fix the root cause in the appropriate file (test or source)
  - Re-run the failing test to confirm it passes
- **Repeat until the entire suite is green** with 0 failures
- Run `npm run build` to confirm the app still compiles after any source changes
- Run `npm run lint` to confirm no lint errors were introduced

#### Phase 6: Final Verification
- All tests pass: `npm test` → 0 failures
- App builds: `npm run build` → success
- Lint clean: `npm run lint` → no errors
- Report the final test count, pass rate, and any source-code bugs discovered and fixed during testing

---

- **Priority:** high
- **Deliverables:**
  - `jest.config.ts`, `jest.setup.ts`
  - Test files for all 7 lib modules and all 10 components + `page.tsx`
  - All source-code bug fixes discovered during testing
  - Green test suite, clean build, clean lint
