# Bug Fix Rules

Rules and workflow for fixing bugs in this application.

---

## Workflow

1. **Bugs are logged in `TO_BE_FIXED.md`.**
   - Each bug entry should include a clear title, description, steps to reproduce (if applicable), and the affected area of the application.

2. **The AI agent (a5c) reads `TO_BE_FIXED.md`**, picks up the bug, investigates the root cause, and implements the fix.

3. **After fixing, the agent adds a detailed entry to `RECENT_FIXATION.md`** at the top of the file containing:
   - **Title** — short summary of what was fixed
   - **Date** — when it was fixed
   - **Bug description** — what was going wrong
   - **Root cause** — why the bug was happening
   - **Fix applied** — what was changed and in which files
   - **Files modified** — list of files touched
   - **How it was verified** — how the fix was confirmed (manual test, E2E test, etc.)

4. **Remove the bug entry from `TO_BE_FIXED.md`** once the fix is complete and documented in `RECENT_FIXATION.md`.

---

## `TO_BE_FIXED.md` Entry Format

```markdown
### BUG-<number>: <Short Title>
- **Area:** <affected component/page>
- **Description:** <what is broken>
- **Steps to reproduce:** <how to trigger the bug>
- **Priority:** <high / medium / low>
```

## `RECENT_FIXATION.md` Entry Format

```markdown
### <number>. <Short Title> (<date>)
- **Bug:** <what was broken>
- **Root cause:** <why it happened>
- **Fix:** <what was changed>
- **Files modified:** <list of files>
- **Verified by:** <how it was tested>
```
