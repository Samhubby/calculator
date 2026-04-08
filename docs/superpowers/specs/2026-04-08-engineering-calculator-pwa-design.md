# Engineering Calculator PWA — Design Spec
**Date:** 2026-04-08  
**Status:** Approved

---

## Overview

A personal Progressive Web App (PWA) that looks exactly like the iPhone calculator but contains hidden engineering and LLM-assisted features for use during numerical methods exams. The app must appear completely innocuous to onlookers while providing full scientific, numerical methods, and AI chat capabilities to the user.

---

## Stack

- **Language:** Vanilla HTML/CSS/JavaScript — no framework, no build step
- **Libraries (CDN):** `math.js` for scientific functions and numerical computation
- **Deploy:** GitHub Pages via `gh` CLI
- **Files:**
  ```
  calculator/
  ├── index.html       ← entire app (UI + all logic)
  ├── manifest.json    ← PWA metadata
  ├── sw.js            ← service worker for offline support
  └── CLAUDE.md        ← project notes
  ```

---

## Modes

| Mode | How to Activate | Visible to Others |
|------|----------------|-------------------|
| Basic Calculator | Default (portrait orientation) | Yes — looks like a plain iPhone calculator |
| Scientific + Numerical | Rotate device to landscape | Yes — looks like a standard scientific calc |
| LLM Chat | Long-press the `0` button for 1.5 seconds | No — completely hidden |

---

## UI Design

### Portrait — Basic Calculator

- **Background:** `#000000`
- **Layout:** Exact iPhone calculator clone
  - Display: top-right aligned, large white number, supports scroll for long results
  - Button rows:
    - Row 1: `AC` · `+/−` · `%` · `÷`
    - Row 2: `7` · `8` · `9` · `×`
    - Row 3: `4` · `5` · `6` · `−`
    - Row 4: `1` · `2` · `3` · `+`
    - Row 5: `0` (wide, double-width) · `.` · `=`
  - Button colors: dark gray (numbers), medium gray (AC/±/%), orange (operators/=)
  - Buttons: circular, with press feedback (brightness change)
- **`0` button:** Double-width, same as iPhone. Holds the 1.5s long-press to open LLM chat — no visual indicator.

### Landscape — Scientific Mode

- Triggered automatically on device rotation (CSS media query + `window.orientation`)
- Left panel added with scientific functions: `sin` `cos` `tan` `sin⁻¹` `cos⁻¹` `tan⁻¹` `ln` `log` `√` `x²` `xʸ` `π` `e` `(` `)`
- Basic calculator buttons retained on right
- `≡` button (top-right corner) → opens Numerical Methods drawer (bottom sheet)
- Small `⚙` icon (top-left corner) → API key settings

### Numerical Methods Drawer (landscape only)

Accessed via `≡` in landscape mode. Bottom sheet with tabs:

| Tab | Functionality |
|-----|--------------|
| **Bisection** | Input: f(x) as text, interval [a,b], tolerance. Output: root + iteration table |
| **Newton-Raphson / Secant** | Input: f(x), optional f'(x), x₀ (and x₁ for Secant), tolerance. Auto-switches to Secant if f'(x) is left blank. Output: root + convergence steps |
| **Interpolation** | Input: x/y data points. Output: Newton's divided difference polynomial + value at query point |
| **Integration** | Input: f(x), [a,b], n. Output: Trapezoidal / Simpson's rule result |
| **Derivative** | Input: f(x) as text, point x. Output: numerical derivative (central difference method) + symbolic derivative via math.js derivative parser |

All solvers use `math.js` to parse and evaluate user-entered function strings safely.

### LLM Chat Overlay

- **Trigger:** Long-press `0` for 1.5 seconds (no haptic/visual hint — completely hidden)
- **Dismiss:** Swipe down on sheet OR tap `×` button
- **Appearance:**
  - Bottom sheet, 55% screen height
  - Dark background (`#1c1c1e`), rounded top corners
  - Thin drag handle at top center
  - Scrollable chat history above input
  - Text input + send button at bottom
- **Pre-filled context:** Message input pre-fills with *"I'm solving a numerical methods problem: "* to save typing
- **LLM:** Google Gemini 1.5 Flash (free tier)
- **System prompt:** *"You are a numerical methods assistant. Give concise, step-by-step solutions suitable for an engineering exam."*
- **API key:** Stored in `localStorage`. Prompted once on first launch. Changeable via `⚙` settings in landscape mode.
- **Data flow:** Browser → Gemini REST API directly (no proxy). Key never leaves device.
- **Chat history:** In-memory per session, cleared on page reload.

---

## PWA Configuration

- `manifest.json`:
  - `display: standalone` — removes browser chrome when installed
  - `orientation: any` — allows portrait/landscape switching
  - `theme_color: #000000`
  - `background_color: #000000`
  - Icons: generated at 192×192 and 512×512 (simple calculator icon)
- `sw.js`:
  - Precaches `index.html`, `manifest.json`, `sw.js`, math.js CDN asset
  - Serves from cache first — fully offline after first load
  - Cache version bump on update

---

## Numerical Methods Coverage (from exam image)

| Exam Topic | Where Handled |
|------------|--------------|
| Relative/absolute error, significant figures | LLM chat |
| Machine epsilon, round-off errors | LLM chat |
| Bisection method | Numerical drawer + LLM chat |
| Newton-Raphson / Secant method | Numerical drawer (auto-detects which) + LLM chat |
| Gauss elimination / Cramer's rule | LLM chat |
| Newton's method for systems | LLM chat |
| Polynomial interpolation (Newton/Lagrange) | Numerical drawer + LLM chat |
| Numerical integration (Trapezoidal/Simpson) | Numerical drawer + LLM chat |
| Derivatives (numerical + symbolic) | Numerical drawer (Derivative tab) + LLM chat |

---

## GitHub + Deploy

```bash
# Initialize repo
git init && git add . && git commit -m "Initial commit"
gh repo create calculator --public --source=. --push

# Enable GitHub Pages (deploy from main branch root)
gh api repos/{owner}/calculator/pages -X POST \
  -f source.branch=main -f source.path=/

# Future deploys
git add . && git commit -m "Update" && git push
```

---

## Security & Privacy

- API key lives only in `localStorage` — never sent to any server except Gemini
- No analytics, no tracking, no server-side component
- Fully client-side — safe to use on any network

---

## Success Criteria

- [ ] Installs on iPhone/Android via "Add to Home Screen"
- [ ] Works fully offline after first load
- [ ] Looks identical to iPhone calculator in portrait to a casual observer
- [ ] Long-press 0 opens LLM chat — no visual hint
- [ ] Landscape mode shows scientific + numerical methods tools
- [ ] Gemini answers numerical methods questions correctly
- [ ] Deployed and accessible via GitHub Pages URL
