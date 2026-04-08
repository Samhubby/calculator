# Engineering Calculator PWA

## Project Overview

A personal Progressive Web App (PWA) that looks exactly like the iPhone calculator but contains hidden engineering and AI-assisted features for use during numerical methods exams.

## Repository

- **GitHub:** https://github.com/Samhubby/calculator
- **Deployed:** https://samhubby.github.io/calculator
- **Branch:** `master`

## Stack

- Vanilla HTML/CSS/JavaScript (no framework, no build step)
- `math.js` via CDN for scientific + numerical computation
- Google Gemini 1.5 Flash API for LLM chat
- GitHub Pages for deployment

## File Structure

```
calculator/
├── index.html            ← entire app (UI + all logic)
├── manifest.json         ← PWA metadata
├── sw.js                 ← service worker (offline support)
├── CLAUDE.md             ← this file
├── GUIDE.md              ← user guide (install + feature usage)
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-04-08-engineering-calculator-pwa-design.md
```

## Modes

| Mode | Trigger | Visible to Others |
|------|---------|-------------------|
| Basic Calculator | Default portrait | Yes — looks like iPhone calculator |
| Scientific + Numerical | Rotate to landscape | Yes |
| LLM Chat | Long-press `0` for 1.5s | No — completely hidden |
| Numerical Methods Drawer | `≡` button in landscape | Partially hidden |
| Derivative Calculator | Tab inside Numerical Methods drawer | Hidden |

## Hidden Features

- **Long-press `0` (1.5s):** Opens Gemini LLM chat as a bottom sheet (55% height)
  - Swipe down or tap `×` to dismiss
  - Pre-fills "I'm solving a numerical methods problem: "
- **`≡` menu (landscape):** Opens Numerical Methods drawer with tabs:
  - Bisection Method
  - Newton-Raphson / Secant Method
  - Interpolation (Newton's divided difference)
  - Numerical Integration (Trapezoidal / Simpson's)
  - Derivative (numerical + symbolic via math.js)
- **`⚙` icon (landscape):** Change Gemini API key (stored in localStorage)

## LLM Setup

- API: Google Gemini 1.5 Flash (free tier — no credit card needed)
- Get key at: https://aistudio.google.com
- Key stored in `localStorage` — never leaves the device
- System prompt: numerical methods exam assistant

## Deploy

```bash
# Push changes
git add . && git commit -m "update" && git push

# GitHub Pages auto-deploys from master branch root
```

## Implementation Plan

Full plan: [docs/superpowers/plans/2026-04-08-engineering-calculator-pwa.md](docs/superpowers/plans/2026-04-08-engineering-calculator-pwa.md)

Execution: Subagent-driven development (14 tasks → Playwright E2E testing)

## Testing

### Unit / Console Tests
- Calculator engine: `runCalcTests()` — runs in DevTools console on localhost
- Numerical solvers: `runSolverTests()` — runs in DevTools console on localhost
- Both wrapped in `if (localhost)` guard — do not run in production

### Playwright E2E Tests (run after all 14 tasks complete)
- File: `tests/e2e.spec.js`
- Runner: Playwright (installed as dev dependency or via npx)
- Covers:
  - Basic calculator operations
  - Landscape scientific mode
  - Bisection, Newton-Raphson, Interpolation, Integration, Derivative solvers
  - Long-press 0 → chat sheet opens
  - Swipe/close chat sheet
  - API key settings modal (first launch)
  - PWA installability (manifest + SW registered)

```bash
# Run Playwright tests
npx playwright test

# Run with UI
npx playwright test --ui
```

## User Guide

Full usage guide (install on iPhone + all features): [GUIDE.md](GUIDE.md)

## Design Spec

Full design document: [docs/superpowers/specs/2026-04-08-engineering-calculator-pwa-design.md](docs/superpowers/specs/2026-04-08-engineering-calculator-pwa-design.md)

## Changelog

| Date | Change |
|------|--------|
| 2026-04-08 | Project initialized, design spec written |
| 2026-04-08 | Added derivative calculator tab to numerical methods drawer |
| 2026-04-08 | Repository created on GitHub, GitHub Pages enabled |
| 2026-04-08 | Implementation plan created (14 tasks, subagent-driven) |
| 2026-04-08 | Playwright E2E testing planned for post-implementation |
| 2026-04-08 | All 14 tasks implemented — full app complete |
| 2026-04-08 | Playwright E2E tests written and run — 16/16 passing |
| 2026-04-08 | Fix iOS PWA install — absolute manifest paths for GitHub Pages subdirectory |
| 2026-04-08 | Add GUIDE.md — full user guide for install and all features |
