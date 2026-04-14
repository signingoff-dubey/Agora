# CLAUDE.md — AI Coding Guide

This file tells the AI how to work in this project. Read this file first before doing anything. Follow every rule here.

---

## FIRST TIME SETUP

When you enter a project for the first time, check if these files exist. If they don't, create them by asking the user for the required information.

### Files to create (if missing):

---

### 1. `prd.md` — Product Requirements Document

Ask the user:
- What is the product name?
- What problem does it solve?
- Who is the target user?
- What are the core features (must-have)?
- What are the nice-to-have features?
- What platforms will it run on?
- Are there any known constraints (budget, tech stack, deadline)?

Then create `prd.md` with this structure:

```
# Product Requirements Document

## Product Name
## Problem Statement (one line)
## Target Users
## Core Features (must-have)
## Nice-to-Have Features
## Platform / Environment
## Constraints
## Success Criteria
## Out of Scope
```

---

### 2. `problem_statement.md` — Problem Statement

Ask the user:
- What is the core problem being solved?
- Who faces this problem?
- Why do existing solutions fail?
- What does success look like?

Then create `problem_statement.md` with this structure:

```
# Problem Statement

## The Problem
## Who Is Affected
## Why Existing Solutions Fail
## Our Solution
## Definition of Success
```

---

### 3. `progress.md` — Version & Progress Tracker

Create `progress.md` immediately with an initial entry. Update it after every meaningful change, new feature, or git commit.

Structure:

```
# Progress Log

## Current Version: v0.1.0
## Status: [In Progress / Stable / Beta]

---

## [v0.1.0] — YYYY-MM-DD
### What's New
- Initial project setup

### Known Issues
- None yet

### Future Scope
- (list features planned for future versions)

---

## Git History
| Commit | Date | Message |
|--------|------|---------|
| abc1234 | YYYY-MM-DD | Initial commit |
```

**Rules:**
- Every time a new feature is added, add a new version entry.
- When a future scope item gets implemented, move it from Future Scope to What's New in the new version.
- Always update Git History after every commit.

---

### 4. `pitch.md` — Project Pitch

Ask the user:
- What is the elevator pitch (1-2 sentences)?
- What is the core value proposition?
- Who is the audience for this pitch (investors, judges, users)?
- Any demo or prototype available?

Then create `pitch.md` with this structure:

```
# Project Pitch

## One-Line Pitch
## The Problem
## Our Solution
## Key Features
## Target Audience
## Tech Stack
## Why Us / Why Now
## Demo / Screenshots
## Team
```

---

### 5. `issues.md` — Issues & Fixes Log

Create `issues.md` immediately. Update it every time you encounter an error, bug, or unexpected behaviour and fix it.

Structure:

```
# Issues & Fixes Log

> AI: Read this file before debugging. If the same issue occurred before, the fix is already here.

---

## [ISSUE-001] — YYYY-MM-DD
**Title:** Short description of the issue
**Symptom:** What error or behaviour was observed
**Root Cause:** Why it happened
**Fix:** Exactly what was done to fix it
**Files Changed:** List of files modified
**Status:** Resolved / Ongoing

---
```

**Rules:**
- Before debugging any error, search this file first.
- If the same issue appears again, follow the previous fix.
- If a new fix is needed, add a new entry even for the same error.

---

### 6. `README.md` — Project README

Ask the user:
- What is the project name and description?
- What is the tech stack?
- Any installation steps?
- Any environment variables needed?

Then create `README.md` and keep updating it after every new feature or release.

Structure:

```
# Project Name

> One-line description

## Latest Release: v0.1.0

## Features
- Feature 1
- Feature 2

## Tech Stack
| Layer | Technology |
|-------|-----------|
| ... | ... |

## File Structure
```
project/
├── src/
├── README.md
├── prd.md
└── ...
```

## Setup & Installation
```bash
# steps here
```

## Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| ... | ... | Yes/No |

## How to Run
```bash
# steps here
```

## Changelog
### v0.1.0 — YYYY-MM-DD
- Initial release

## License
```

**Rules:**
- Update File Structure every time a new file or folder is added.
- Add a new Changelog entry after every release or major feature.
- Keep Tech Stack table accurate at all times.

---

## ADDITIONAL SETUP CHECKS

Run these checks during first-time setup alongside creating the docs.

---

### Git Check

Check if git is initialized:
```bash
git status
```

If not initialized:
- Ask the user: "Should I initialize a git repo and make the first commit?"
- If yes: run `git init`, create `.gitignore`, make initial commit.
- Suggest a GitHub repo name based on the project name.

Always check if a `.gitignore` exists. If not, create one based on the tech stack. At minimum include:
```
.env
.env.local
node_modules/
__pycache__/
*.pyc
.DS_Store
dist/
build/
*.log
```

---

### Environment Variables Check

Check if a `.env` file exists. If it does:
- Never read or print its contents.
- Never commit it to git — verify `.gitignore` blocks it.
- Create a `.env.example` file with the same keys but empty or dummy values.

Structure for `.env.example`:
```
API_KEY=your_key_here
DATABASE_URL=your_db_url_here
PORT=3000
```

If no `.env` exists but the project likely needs one, ask the user:
- "Does this project need any API keys or environment variables?"
- If yes, create `.env.example` and remind user to create their own `.env`.

---

### Dependencies Check

Check if a dependency file exists for the tech stack:

| Stack | File to check |
|-------|--------------|
| Node.js | `package.json` |
| Python | `requirements.txt` or `pyproject.toml` |
| Android | `build.gradle` |
| Flutter | `pubspec.yaml` |

If missing, ask the user what libraries/packages the project uses and create the appropriate file.

If it exists, read it and note the tech stack and versions in memory for the session.

---

### Folder Structure Check

Scan the project folder. If it looks empty or unorganized:
- Ask the user: "Should I scaffold the folder structure for this project?"
- Suggest a structure based on the tech stack.
- Do not create files/folders without approval.

---

### Coding Conventions Check

Ask the user once during setup:
- What language and framework is being used?
- Any preferred naming conventions? (camelCase, snake_case, PascalCase)
- Tabs or spaces? How many?
- Any linting rules or formatter in use? (ESLint, Prettier, Black, etc.)

Store these in a `conventions` section at the bottom of this file or in a separate `style_guide.md` if the user wants one.

Default conventions to follow if user doesn't specify:
- Use the language's standard convention (PEP8 for Python, Google style for Java, etc.)
- Functions: camelCase (JS/Java), snake_case (Python)
- Constants: UPPER_SNAKE_CASE
- Files: lowercase-with-hyphens for web, PascalCase for components
- No commented-out dead code left in files

---

### Security Check

Before writing any code, flag these if found:
- API keys or secrets hardcoded anywhere in source files → move to `.env`
- Passwords in plaintext → flag immediately
- `console.log` or `print` statements logging sensitive data → remove
- Public repos with `.env` committed → alert user immediately

Never write code that:
- Hardcodes credentials
- Disables SSL/TLS verification
- Stores passwords in plaintext

---

### Testing Check

Ask the user:
- "Does this project have tests? Should I write them?"
- If yes, ask what testing framework they use.

After every major feature, suggest writing at least one test for the core logic. If no test framework is set up, recommend one based on the stack:

| Stack | Recommended |
|-------|------------|
| Python | pytest |
| Node.js | Jest |
| Java/Android | JUnit |
| React | React Testing Library |

---

### Existing Code Check

Before writing anything new:
1. Scan existing files to understand what's already built.
2. Never duplicate logic that already exists elsewhere.
3. If a function already does something similar, reuse or extend it — don't rewrite.
4. Ask before refactoring existing working code.

---

## ONGOING RULES (Follow Always)

### Before every task:
1. Read `issues.md` — check if the problem was seen before.
2. Read `progress.md` — understand where the project currently stands.
3. Read `prd.md` — stay aligned with requirements.

### After every task:
1. Update `progress.md` if a feature was added or changed.
2. Update `issues.md` if a bug was encountered and fixed.
3. Update `README.md` if files, features, or setup steps changed.

### When you don't know something:
- Ask the user. Do not assume.
- State clearly what information you need and why.

### When making a commit:
- Suggest a commit message.
- Add the commit to the Git History table in `progress.md`.

---

## FILE OVERVIEW

| File | Purpose | Updated When |
|------|---------|--------------|
| `CLAUDE.md` | This file. AI instructions. | Rarely |
| `prd.md` | Product requirements | Requirements change |
| `problem_statement.md` | Core problem definition | Rarely |
| `progress.md` | Versions, git log, future scope | Every feature / commit |
| `pitch.md` | Project pitch for demos/hackathons | Before presentations |
| `issues.md` | Bug log with fixes | Every bug encountered |
| `README.md` | Public-facing project documentation | Every release / new feature |
| `.env.example` | Template for environment variables | When new env vars are added |
| `.gitignore` | Files to exclude from git | When new file types are added |
| `style_guide.md` | Coding conventions (optional) | When conventions are agreed upon |
