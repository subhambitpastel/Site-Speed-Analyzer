# Version Control Rules

> **Purpose:** Define git commit conventions for AI assistants working on this project. Read this file before making any commits.

---

## Commit Frequency

- **One commit per development step** (e.g., Step 1.1, Step 1.2, Step 2.1)
- **Never batch** multiple steps into one commit
- **Never split** one step across multiple commits (unless the step explicitly has sub-parts)
- Commit only after the step's acceptance criteria from `DONE_CRITERIA.md` are verified

---

## Commit Message Format

```
Step X.Y — <Step Title>

<2-3 line summary of what was implemented>

Acceptance criteria met:
- <criterion 1>
- <criterion 2>
- <criterion 3>
```

### Example

```
Step 1.2 — Database Schema

Created all 26 models across 10 files in tiered dependency order.
Added 4 materialized views, all critical indexes, and soft delete
pattern (SMALLINT IntegerChoices) on Entity and Group.

Acceptance criteria met:
- All 26 tables created via Django migrations
- Entity and Group have SMALLINT status with IntegerChoices (0-3)
- Materialized views exclude soft-deleted records (WHERE status != 0)
```

---

## Commit Commands

```bash
git add -A
git commit -m "<message>"
git push origin main
```

---

## Tags & Releases

| Tag      | When            | Description                                           |
| -------- | --------------- | ----------------------------------------------------- |
| `v0.1.0` | After Step 1.7  | Part 1: Dashboard & Foundation complete               |
| `v0.2.0` | After Step 2.12 | Part 2: Search & Core Viewers complete                |
| `v1.0.0` | After Step 3.5  | Part 3: AI Intelligence Layer complete (full release) |

### Tag Commands

```bash
git tag -a v0.1.0 -m "Part 1: Dashboard & Foundation complete"
git push origin v0.1.0
```

---

## Branch Strategy

| Branch                 | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `main`                 | Production-ready code. All steps commit here.             |
| `feature/<step>`       | Optional: use for large steps if you want PR-style review |
| `hotfix/<description>` | Urgent fixes after a part is tagged                       |

For most development, commit directly to `main`. Use feature branches only if a step is large enough to warrant incremental review.

---

## .gitignore Requirements

Ensure these are in `.gitignore` before the first commit:

```
# Python
__pycache__/
*.py[cod]
*.egg-info/
venv/
.env

# Node
node_modules/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Django
db.sqlite3
*.log
media/uploads/

# Generated
*.drawio.bak
```

---

## Rules for AI Assistants

1. **Read `DONE_CRITERIA.md`** before committing — verify the step's conditions are met
2. **Do not commit broken code** — the app must start without errors after every commit
3. **Do not commit placeholder or TODO code** — each commit is a complete, working increment
4. **Do not amend or rebase** previous commits — keep linear history
5. **Do not commit secrets** — API keys, credentials, `.env` files must never be committed
6. **Do commit documentation updates** — if a step changes behavior, update `README.md` in the same commit
7. **Run the app** before committing — `python manage.py runserver` and `npm run dev` must both work
8. **Include migrations** in commits — never commit model changes without their migration files

---

_This file is read by AI assistants to maintain consistent version control practices across the project._
