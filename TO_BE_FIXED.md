# Bugs To Be Fixed

> **Note to the fixing agent (Claude):** You are a very professional frontend designer and developer. Approach every fix with pixel-perfect attention to detail, smooth micro-interactions, modern UI/UX sensibilities, and polished visual design. Every element should feel intentional, cohesive, and delightful to use.

---

### BUG-9: Default to dark mode on first visit
- **Area:** Theme initialization (`page.tsx` — dark mode toggle + localStorage logic)
- **Description:** The application should default to **dark mode** on first load when no theme preference is stored in localStorage. Currently the app likely defaults to light mode or follows system preference. Change the initial state so that dark mode is the default. If a user has already chosen a theme, their stored preference should still be respected — this only affects first-time visitors or cleared storage. Ensure the `dark` class is applied to `<html>` before first paint to avoid a flash of light mode.
- **Steps to reproduce:** Clear localStorage, open the app — it loads in light mode instead of dark mode.
- **Priority:** high

### BUG-10: Resume analysis from previously exported XLS/CSV/XLSX files
- **Area:** FileUpload component, `page.tsx` orchestration, export parsers
- **Description:** The Upload File feature already supports importing XLS/CSV/XLSX files to extract website URLs. **Enhance this** so that when a user uploads an exported report file (one previously exported from this app), the system: (1) Detects which sites already have completed results in the uploaded file (rows with scores/metrics, not just URLs). (2) Pre-populates those completed results directly into the results table — loading scores, metrics, and all data from the file without re-analyzing those sites. (3) Identifies sites that are not yet done (rows with URLs but no scores, or missing/incomplete data) and only queues those for fresh analysis. (4) Resumes analysis from where it left off — the user sees already-done sites instantly and only waits for the remaining ones. This is critical for large batches where a user may have analyzed 50 out of 200 sites, exported to save progress, and now wants to continue without re-running the completed ones. The UX should clearly indicate which results were loaded from file vs. freshly analyzed (e.g., a subtle "loaded from file" badge). Show a brief summary on import like "Loaded 50 completed results, 150 sites queued for analysis."
- **Steps to reproduce:** Export results as XLS after partial analysis → re-upload that XLS file → currently all URLs are re-analyzed from scratch instead of reusing existing data.
- **Priority:** high
