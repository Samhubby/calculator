# Engineering Calculator PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vanilla JS PWA that looks like an iPhone calculator but hides scientific, numerical methods, and Gemini LLM chat features for exam use.

**Architecture:** Four files — `index.html` (markup), `styles.css` (all layout/theme), `app.js` (all logic split into modules via ES6 classes), plus `manifest.json` and `sw.js`. No build step. math.js loaded from CDN. Gemini called directly from the browser.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6), math.js 13 (CDN), Google Gemini 1.5 Flash REST API, GitHub Pages

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Markup skeleton — calculator layout, all overlay containers, script/style links |
| `styles.css` | All styles — portrait iPhone theme, landscape scientific layout, drawer/sheet animations, chat UI |
| `app.js` | All logic — calculator engine, scientific functions, numerical solvers, LLM chat, PWA registration |
| `manifest.json` | PWA metadata — name, icons, display mode, orientation, theme color |
| `sw.js` | Service worker — precache all assets, serve offline |

---

## Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Calculator">
  <meta name="theme-color" content="#000000">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="icon-192.png">
  <title>Calculator</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <!-- Display -->
    <div id="display-wrap">
      <div id="display">0</div>
    </div>

    <!-- Basic buttons (portrait) -->
    <div id="basic-grid">
      <button class="btn btn-fn" data-action="clear">AC</button>
      <button class="btn btn-fn" data-action="sign">+/−</button>
      <button class="btn btn-fn" data-action="percent">%</button>
      <button class="btn btn-op" data-action="op" data-op="/">÷</button>

      <button class="btn btn-num" data-action="num" data-val="7">7</button>
      <button class="btn btn-num" data-action="num" data-val="8">8</button>
      <button class="btn btn-num" data-action="num" data-val="9">9</button>
      <button class="btn btn-op" data-action="op" data-op="*">×</button>

      <button class="btn btn-num" data-action="num" data-val="4">4</button>
      <button class="btn btn-num" data-action="num" data-val="5">5</button>
      <button class="btn btn-num" data-action="num" data-val="6">6</button>
      <button class="btn btn-op" data-action="op" data-op="-">−</button>

      <button class="btn btn-num" data-action="num" data-val="1">1</button>
      <button class="btn btn-num" data-action="num" data-val="2">2</button>
      <button class="btn btn-num" data-action="num" data-val="3">3</button>
      <button class="btn btn-op" data-action="op" data-op="+">+</button>

      <button class="btn btn-num btn-zero" id="btn-zero" data-action="num" data-val="0">0</button>
      <button class="btn btn-num" data-action="decimal">.</button>
      <button class="btn btn-op" data-action="equals">=</button>
    </div>

    <!-- Scientific panel (landscape only) -->
    <div id="sci-panel">
      <button class="btn btn-sci" data-action="sci" data-fn="sin">sin</button>
      <button class="btn btn-sci" data-action="sci" data-fn="cos">cos</button>
      <button class="btn btn-sci" data-action="sci" data-fn="tan">tan</button>
      <button class="btn btn-sci" data-action="sci" data-fn="asin">sin⁻¹</button>
      <button class="btn btn-sci" data-action="sci" data-fn="acos">cos⁻¹</button>
      <button class="btn btn-sci" data-action="sci" data-fn="atan">tan⁻¹</button>
      <button class="btn btn-sci" data-action="sci" data-fn="log">log</button>
      <button class="btn btn-sci" data-action="sci" data-fn="ln">ln</button>
      <button class="btn btn-sci" data-action="sci" data-fn="sqrt">√</button>
      <button class="btn btn-sci" data-action="sci" data-fn="sq">x²</button>
      <button class="btn btn-sci" data-action="sci" data-fn="pow">xʸ</button>
      <button class="btn btn-sci" data-action="sci" data-fn="pi">π</button>
      <button class="btn btn-sci" data-action="sci" data-fn="e">e</button>
      <button class="btn btn-sci" data-action="sci" data-fn="open">(</button>
      <button class="btn btn-sci" data-action="sci" data-fn="close">)</button>
    </div>

    <!-- Landscape toolbar -->
    <div id="landscape-toolbar">
      <button id="btn-settings" title="Settings">⚙</button>
      <button id="btn-drawer" title="Numerical Methods">≡</button>
    </div>

    <!-- Numerical Methods Drawer -->
    <div id="drawer" class="sheet hidden">
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <div id="drawer-tabs">
          <button class="tab-btn active" data-tab="bisection">Bisection</button>
          <button class="tab-btn" data-tab="newton">NR/Secant</button>
          <button class="tab-btn" data-tab="interp">Interp</button>
          <button class="tab-btn" data-tab="integral">∫</button>
          <button class="tab-btn" data-tab="deriv">d/dx</button>
        </div>
        <button class="sheet-close" id="drawer-close">×</button>
      </div>
      <div id="drawer-content">
        <!-- Tab panels injected by JS -->
      </div>
    </div>

    <!-- LLM Chat Overlay -->
    <div id="chat-sheet" class="sheet hidden">
      <div class="sheet-handle" id="chat-handle"></div>
      <div class="sheet-header">
        <span class="sheet-title">AI Assistant</span>
        <button class="sheet-close" id="chat-close">×</button>
      </div>
      <div id="chat-history"></div>
      <div id="chat-input-row">
        <input type="text" id="chat-input" placeholder="Ask a question..." autocomplete="off">
        <button id="chat-send">↑</button>
      </div>
    </div>

    <!-- Settings Modal -->
    <div id="settings-modal" class="modal hidden">
      <div class="modal-box">
        <h3>Gemini API Key</h3>
        <input type="password" id="api-key-input" placeholder="Paste your API key">
        <div class="modal-btns">
          <button id="settings-cancel">Cancel</button>
          <button id="settings-save">Save</button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div id="backdrop" class="hidden"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/mathjs@13/lib/browser/math.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create empty `styles.css`**

```css
/* styles.css — filled in Task 2 */
```

- [ ] **Step 3: Create empty `app.js`**

```js
// app.js — filled in Task 3+
```

- [ ] **Step 4: Verify HTML loads in browser**

Open `index.html` in Chrome. Expected: blank black page, no console errors except "math.js not fully loaded" (CDN loads async).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "feat: add project scaffold with HTML skeleton"
```

---

## Task 2: iPhone Calculator Styles (Portrait)

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Write base + portrait styles**

```css
/* ===== RESET & BASE ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #000;
  --btn-num: #333333;
  --btn-fn: #a5a5a5;
  --btn-op: #ff9f0a;
  --btn-op-active: #fff;
  --btn-sci: #2d2d2d;
  --text: #fff;
  --display-text: #fff;
  --sheet-bg: #1c1c1e;
  --sheet-border: #3a3a3c;
  --input-bg: #2c2c2e;
  --accent: #ff9f0a;
}

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  max-width: 428px;
  margin: 0 auto;
  background: var(--bg);
  position: relative;
}

/* ===== DISPLAY ===== */
#display-wrap {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 0 24px 8px;
  overflow: hidden;
}

#display {
  font-size: clamp(48px, 14vw, 96px);
  font-weight: 200;
  color: var(--display-text);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.1;
}

/* ===== BUTTON GRID ===== */
#basic-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px;
}

.btn {
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  font-size: clamp(22px, 6vw, 40px);
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.1s;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
}

.btn:active { filter: brightness(1.4); }

.btn-num { background: var(--btn-num); color: var(--text); }
.btn-fn  { background: var(--btn-fn); color: #000; }
.btn-op  { background: var(--btn-op); color: #fff; }
.btn-op.active { background: var(--btn-op-active); color: var(--btn-op); }

/* Zero button spans 2 columns */
.btn-zero {
  grid-column: span 2;
  aspect-ratio: unset;
  border-radius: 40px;
  justify-content: flex-start;
  padding-left: 28px;
}

/* ===== LANDSCAPE TOOLBAR (hidden in portrait) ===== */
#landscape-toolbar { display: none; }
#sci-panel { display: none; }
```

- [ ] **Step 2: Open in browser, resize to mobile viewport (375×812)**

DevTools → Toggle device toolbar → iPhone 14 Pro. Expected: Black calculator, display shows "0", all buttons visible with correct colors and layout matching iPhone calculator.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add iPhone calculator portrait styles"
```

---

## Task 3: Calculator Engine

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Write the calculator engine class**

```js
class Calculator {
  constructor() {
    this.reset();
  }

  reset() {
    this.current = '0';
    this.previous = null;
    this.operator = null;
    this.shouldReplace = false;
    this.opActive = null;
  }

  get display() { return this.current; }

  inputDigit(digit) {
    if (this.shouldReplace) {
      this.current = String(digit);
      this.shouldReplace = false;
    } else {
      this.current = this.current === '0' ? String(digit) : this.current + digit;
    }
    // Cap display length
    if (this.current.replace('-', '').replace('.', '').length > 9) {
      this.current = this.current.slice(0, this.current.startsWith('-') ? 10 : 9);
    }
  }

  inputDecimal() {
    if (this.shouldReplace) { this.current = '0.'; this.shouldReplace = false; return; }
    if (!this.current.includes('.')) this.current += '.';
  }

  inputOperator(op) {
    if (this.operator && !this.shouldReplace) this.equals();
    this.previous = parseFloat(this.current);
    this.operator = op;
    this.shouldReplace = true;
    this.opActive = op;
  }

  equals() {
    if (this.operator === null || this.previous === null) return;
    const a = this.previous;
    const b = parseFloat(this.current);
    let result;
    switch (this.operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b === 0 ? 'Error' : a / b; break;
      default: return;
    }
    this.current = result === 'Error' ? 'Error' : this._fmt(result);
    this.previous = null;
    this.operator = null;
    this.shouldReplace = true;
    this.opActive = null;
  }

  percent() {
    const v = parseFloat(this.current);
    if (this.previous !== null && this.operator) {
      this.current = this._fmt(this.previous * v / 100);
    } else {
      this.current = this._fmt(v / 100);
    }
  }

  sign() {
    const v = parseFloat(this.current);
    if (v !== 0) this.current = this._fmt(-v);
  }

  clear() { this.reset(); }

  _fmt(n) {
    if (!isFinite(n)) return 'Error';
    // Use toPrecision to avoid floating point noise, then remove trailing zeros
    let s = parseFloat(n.toPrecision(10)).toString();
    if (s.length > 12) s = parseFloat(n.toExponential(4)).toString();
    return s;
  }
}
```

- [ ] **Step 2: Write quick console tests for the engine**

Add this block at the bottom of `app.js` temporarily (remove before final deploy, or wrap in `if (location.hostname === 'localhost')`):

```js
function runCalcTests() {
  const c = new Calculator();
  const assert = (label, got, want) => {
    if (String(got) !== String(want)) console.error(`FAIL ${label}: got ${got}, want ${want}`);
    else console.log(`PASS ${label}`);
  };

  c.inputDigit(5); c.inputOperator('+'); c.inputDigit(3); c.equals();
  assert('5+3=8', c.display, '8');

  c.clear(); c.inputDigit(1); c.inputDigit(0); c.inputOperator('/'); c.inputDigit(0); c.equals();
  assert('10/0=Error', c.display, 'Error');

  c.clear(); c.inputDigit(9); c.percent();
  assert('9%=0.09', c.display, '0.09');

  c.clear(); c.inputDigit(7); c.sign();
  assert('sign(7)=-7', c.display, '-7');

  console.log('Calculator tests done');
}
runCalcTests();
```

- [ ] **Step 3: Wire up the UI to the engine**

Add below the `Calculator` class and test block:

```js
const calc = new Calculator();
const displayEl = document.getElementById('display');

function updateDisplay() {
  const d = calc.display;
  displayEl.textContent = d;
  // Shrink font for long numbers
  const len = d.replace('-', '').length;
  displayEl.style.fontSize = len > 9 ? 'clamp(28px, 8vw, 52px)'
    : len > 6 ? 'clamp(40px, 11vw, 72px)'
    : '';
  // Highlight active operator button
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active'));
  if (calc.opActive) {
    document.querySelectorAll('[data-op]').forEach(b => {
      if (b.dataset.op === calc.opActive) b.classList.add('active');
    });
  }
}

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => handleBtn(btn));
});

function handleBtn(btn) {
  const action = btn.dataset.action;
  if (action === 'num')     calc.inputDigit(btn.dataset.val);
  if (action === 'op')      calc.inputOperator(btn.dataset.op);
  if (action === 'equals')  calc.equals();
  if (action === 'decimal') calc.inputDecimal();
  if (action === 'clear')   calc.clear();
  if (action === 'percent') calc.percent();
  if (action === 'sign')    calc.sign();
  updateDisplay();
}

updateDisplay();
```

- [ ] **Step 4: Open browser, run console tests**

Open DevTools Console. Expected:
```
PASS 5+3=8
PASS 10/0=Error
PASS 9%=0.09
PASS sign(7)=-7
Calculator tests done
```

- [ ] **Step 5: Test manually in browser**
  - Tap `7` → display shows `7`
  - Tap `×` → operator button turns white (active)
  - Tap `8` → display shows `8`
  - Tap `=` → display shows `56`
  - Tap `AC` → display shows `0`

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: add calculator engine with UI wiring and console tests"
```

---

## Task 4: Landscape Scientific Mode

**Files:**
- Modify: `styles.css`
- Modify: `app.js`

- [ ] **Step 1: Add landscape CSS**

Append to `styles.css`:

```css
/* ===== LANDSCAPE ===== */
@media (orientation: landscape) {
  #app {
    flex-direction: row;
    max-width: 100%;
    height: 100dvh;
  }

  #sci-panel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    padding: 6px;
    width: 38%;
    align-content: start;
    overflow-y: auto;
  }

  #display-wrap {
    position: absolute;
    top: 0; left: 38%; right: 0;
    height: 22%;
    padding: 4px 16px 4px;
  }

  #display { font-size: clamp(32px, 5vw, 56px); }

  #basic-grid {
    position: absolute;
    top: 22%; left: 38%; right: 0; bottom: 40px;
    gap: 6px;
    padding: 6px;
  }

  .btn { font-size: clamp(14px, 3vw, 22px); }
  .btn-zero { padding-left: 16px; }

  #landscape-toolbar {
    display: flex;
    position: absolute;
    bottom: 0; left: 38%; right: 0;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    border-top: 1px solid #222;
  }

  #landscape-toolbar button {
    background: none;
    border: none;
    color: var(--btn-fn);
    font-size: 20px;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 6px;
  }
  #landscape-toolbar button:active { background: #333; }

  .btn-sci {
    aspect-ratio: unset;
    height: 44px;
    border-radius: 8px;
    font-size: clamp(11px, 2.5vw, 16px);
    background: var(--btn-sci);
  }
}
```

- [ ] **Step 2: Add scientific function handler in `app.js`**

Add after `updateDisplay()` definition:

```js
function handleSci(fn) {
  let v = parseFloat(calc.display);
  let result;
  const DEG = Math.PI / 180;
  switch (fn) {
    case 'sin':   result = Math.sin(v * DEG); break;
    case 'cos':   result = Math.cos(v * DEG); break;
    case 'tan':   result = Math.tan(v * DEG); break;
    case 'asin':  result = Math.asin(v) / DEG; break;
    case 'acos':  result = Math.acos(v) / DEG; break;
    case 'atan':  result = Math.atan(v) / DEG; break;
    case 'log':   result = Math.log10(v); break;
    case 'ln':    result = Math.log(v); break;
    case 'sqrt':  result = Math.sqrt(v); break;
    case 'sq':    result = v * v; break;
    case 'pow':
      calc.inputOperator('**');
      // math.js pow — handled as operator chain
      return;
    case 'pi':
      calc.current = String(Math.PI);
      calc.shouldReplace = true;
      updateDisplay(); return;
    case 'e':
      calc.current = String(Math.E);
      calc.shouldReplace = true;
      updateDisplay(); return;
    case 'open':
    case 'close':
      // Parentheses: append to display for expression building
      // Not supported in basic engine — signal user
      return;
    default: return;
  }
  if (!isFinite(result)) result = 'Error';
  calc.current = calc._fmt(result);
  calc.shouldReplace = true;
  updateDisplay();
}
```

Update `handleBtn` to add the `sci` action case:

```js
function handleBtn(btn) {
  const action = btn.dataset.action;
  if (action === 'num')     calc.inputDigit(btn.dataset.val);
  if (action === 'op')      calc.inputOperator(btn.dataset.op);
  if (action === 'equals')  calc.equals();
  if (action === 'decimal') calc.inputDecimal();
  if (action === 'clear')   calc.clear();
  if (action === 'percent') calc.percent();
  if (action === 'sign')    calc.sign();
  if (action === 'sci')     handleSci(btn.dataset.fn);
  updateDisplay();
}
```

- [ ] **Step 3: Test in browser — rotate to landscape**

DevTools → device toolbar → rotate. Expected:
- Scientific panel appears on left (3 columns of grey buttons)
- ⚙ and ≡ toolbar visible at bottom
- Type `30`, tap `sin` → display shows `0.5`
- Type `100`, tap `log` → display shows `2`

- [ ] **Step 4: Commit**

```bash
git add styles.css app.js
git commit -m "feat: add landscape scientific mode with trig/log functions"
```

---

## Task 5: Numerical Methods Drawer Shell

**Files:**
- Modify: `styles.css`
- Modify: `app.js`

- [ ] **Step 1: Add drawer styles**

Append to `styles.css`:

```css
/* ===== SHEETS (drawer + chat) ===== */
.sheet {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--sheet-bg);
  border-radius: 16px 16px 0 0;
  z-index: 100;
  transform: translateY(0);
  transition: transform 0.3s ease;
  max-height: 80dvh;
  display: flex;
  flex-direction: column;
}

.sheet.hidden { transform: translateY(110%); pointer-events: none; }

.sheet-handle {
  width: 36px; height: 5px;
  background: #555;
  border-radius: 3px;
  margin: 10px auto 4px;
  flex-shrink: 0;
  cursor: grab;
}

.sheet-header {
  display: flex;
  align-items: center;
  padding: 4px 12px 8px;
  border-bottom: 1px solid var(--sheet-border);
  flex-shrink: 0;
  gap: 8px;
}

.sheet-title { font-size: 15px; font-weight: 500; flex: 1; }

.sheet-close {
  background: #3a3a3c;
  border: none;
  color: #fff;
  width: 28px; height: 28px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Drawer tabs */
#drawer-tabs {
  display: flex;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
}

.tab-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}
.tab-btn.active {
  background: var(--accent);
  color: #000;
  font-weight: 600;
}

/* Drawer content */
#drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* Solver form styles */
.solver-form { display: flex; flex-direction: column; gap: 10px; }

.solver-form label {
  font-size: 12px;
  color: #888;
  margin-bottom: 2px;
  display: block;
}

.solver-form input[type="text"],
.solver-form input[type="number"] {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--sheet-border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  padding: 8px 10px;
  outline: none;
}
.solver-form input:focus { border-color: var(--accent); }

.solver-btn {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}
.solver-btn:active { filter: brightness(0.85); }

.solver-result {
  background: var(--input-bg);
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  color: #ccc;
  white-space: pre-wrap;
  font-family: 'SF Mono', monospace;
  min-height: 48px;
  line-height: 1.6;
}

/* Backdrop */
#backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 90;
}
#backdrop.hidden { display: none; }
```

- [ ] **Step 2: Add drawer open/close/tab logic in `app.js`**

Add below the `handleSci` function:

```js
// ===== DRAWER =====
const drawer = document.getElementById('drawer');
const drawerContent = document.getElementById('drawer-content');
const backdrop = document.getElementById('backdrop');

function openDrawer() {
  renderDrawerTabs();
  drawer.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}

function closeDrawer() {
  drawer.classList.add('hidden');
  backdrop.classList.add('hidden');
}

function renderDrawerTabs() {
  if (drawerContent.children.length > 0) return; // Already rendered
  drawerContent.innerHTML = `
    <div class="tab-panel active" id="tab-bisection">${bisectionPanel()}</div>
    <div class="tab-panel" id="tab-newton">${newtonPanel()}</div>
    <div class="tab-panel" id="tab-interp">${interpPanel()}</div>
    <div class="tab-panel" id="tab-integral">${integralPanel()}</div>
    <div class="tab-panel" id="tab-deriv">${derivPanel()}</div>
  `;
  wireDrawerForms();
}

document.getElementById('btn-drawer').addEventListener('click', openDrawer);
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
// closeChatSheet defined in Task 11 — stub so backdrop click doesn't throw before then
if (typeof closeChatSheet === 'undefined') window.closeChatSheet = () => {};
backdrop.addEventListener('click', () => { closeDrawer(); closeChatSheet(); });

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});
```

- [ ] **Step 3: Add placeholder panel functions (stubs — filled in Tasks 6–10)**

```js
function bisectionPanel() { return '<p style="color:#888;font-size:13px">Loading...</p>'; }
function newtonPanel()    { return '<p style="color:#888;font-size:13px">Loading...</p>'; }
function interpPanel()    { return '<p style="color:#888;font-size:13px">Loading...</p>'; }
function integralPanel()  { return '<p style="color:#888;font-size:13px">Loading...</p>'; }
function derivPanel()     { return '<p style="color:#888;font-size:13px">Loading...</p>'; }
function wireDrawerForms() {}
```

- [ ] **Step 4: Test drawer in browser (landscape)**

Rotate to landscape. Tap `≡`. Expected: dark sheet slides up from bottom, 5 tabs visible, backdrop dims calculator. Tap `×` or backdrop → sheet slides down.

- [ ] **Step 5: Commit**

```bash
git add styles.css app.js
git commit -m "feat: add numerical methods drawer shell with tabs"
```

---

## Task 6: Bisection Solver Tab

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `bisectionPanel()` stub**

```js
function bisectionPanel() {
  return `
    <div class="solver-form" id="bisection-form">
      <div>
        <label>f(x) — e.g. x^3 - x - 2</label>
        <input type="text" id="bis-fx" placeholder="x^3 - x - 2">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><label>a</label><input type="number" id="bis-a" placeholder="1"></div>
        <div><label>b</label><input type="number" id="bis-b" placeholder="2"></div>
      </div>
      <div><label>Tolerance</label><input type="number" id="bis-tol" value="0.0001" step="any"></div>
      <button class="solver-btn" id="bis-solve">Find Root</button>
      <div class="solver-result" id="bis-result">—</div>
    </div>`;
}
```

- [ ] **Step 2: Add bisection algorithm**

```js
function bisection(fStr, a, b, tol) {
  const f = x => math.evaluate(fStr, { x });
  let fa = f(a), fb = f(b);
  if (fa * fb > 0) return { error: 'f(a) and f(b) must have opposite signs.' };
  const rows = [];
  let iter = 0;
  while ((b - a) / 2 > tol && iter < 100) {
    iter++;
    const c = (a + b) / 2;
    const fc = f(c);
    rows.push({ iter, a: a.toFixed(6), b: b.toFixed(6), c: c.toFixed(6), fc: fc.toFixed(6) });
    if (Math.abs(fc) < 1e-12) { a = b = c; break; }
    if (fa * fc < 0) { b = c; fb = fc; }
    else             { a = c; fa = fc; }
  }
  return { root: ((a + b) / 2).toFixed(8), iterations: iter, rows };
}
```

- [ ] **Step 3: Write console tests for bisection**

Add to `runCalcTests()` or create a separate call:

```js
function runSolverTests() {
  const assert = (label, got, want) => {
    if (Math.abs(parseFloat(got) - want) > 1e-4)
      console.error(`FAIL ${label}: got ${got}, want ~${want}`);
    else console.log(`PASS ${label}`);
  };
  const r1 = bisection('x^3 - x - 2', 1, 2, 0.0001);
  assert('bisection x^3-x-2', r1.root, 1.5214);
  const r2 = bisection('x^2 - 4', 0, 3, 0.0001);
  assert('bisection x^2-4', r2.root, 2.0);
  console.log('Solver tests done');
}
```

- [ ] **Step 4: Wire bisection form (add to `wireDrawerForms`)**

Replace `wireDrawerForms`:

```js
function wireDrawerForms() {
  // Bisection
  document.getElementById('bis-solve')?.addEventListener('click', () => {
    const fx  = document.getElementById('bis-fx').value.trim();
    const a   = parseFloat(document.getElementById('bis-a').value);
    const b   = parseFloat(document.getElementById('bis-b').value);
    const tol = parseFloat(document.getElementById('bis-tol').value);
    const out = document.getElementById('bis-result');
    if (!fx || isNaN(a) || isNaN(b) || isNaN(tol)) { out.textContent = 'Fill all fields.'; return; }
    try {
      const res = bisection(fx, a, b, tol);
      if (res.error) { out.textContent = res.error; return; }
      const table = res.rows.slice(-5).map(r =>
        `#${r.iter}  a=${r.a}  b=${r.b}  c=${r.c}  f(c)=${r.fc}`
      ).join('\n');
      out.textContent = `Root ≈ ${res.root}\nIterations: ${res.iterations}\n\nLast 5 steps:\n${table}`;
    } catch(e) { out.textContent = 'Error: ' + e.message; }
  });
  // Newton/Secant, Interp, Integral, Deriv wired in later tasks
}
```

- [ ] **Step 5: Test in browser**

Open drawer → Bisection tab. Enter `x^3 - x - 2`, a=`1`, b=`2`, tol=`0.0001`. Tap "Find Root". Expected: `Root ≈ 1.52138000`, with iteration table.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: add bisection method solver"
```

---

## Task 7: Newton-Raphson / Secant Solver Tab

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `newtonPanel()` stub**

```js
function newtonPanel() {
  return `
    <div class="solver-form">
      <div><label>f(x)</label><input type="text" id="nr-fx" placeholder="x^3 - x - 2"></div>
      <div><label>f'(x) — leave blank for Secant method</label><input type="text" id="nr-dfx" placeholder="3*x^2 - 1"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><label>x₀</label><input type="number" id="nr-x0" placeholder="1.5" step="any"></div>
        <div><label>x₁ (Secant only)</label><input type="number" id="nr-x1" placeholder="2" step="any"></div>
      </div>
      <div><label>Tolerance</label><input type="number" id="nr-tol" value="0.0001" step="any"></div>
      <button class="solver-btn" id="nr-solve">Find Root</button>
      <div class="solver-result" id="nr-result">—</div>
    </div>`;
}
```

- [ ] **Step 2: Add Newton-Raphson and Secant algorithms**

```js
function newtonRaphson(fStr, dfStr, x0, tol) {
  const f  = x => math.evaluate(fStr,  { x });
  const df = x => math.evaluate(dfStr, { x });
  let x = x0, rows = [];
  for (let i = 0; i < 50; i++) {
    const fx = f(x), dfx = df(x);
    if (Math.abs(dfx) < 1e-14) return { error: "f'(x) ≈ 0 — method fails at this point." };
    const xNew = x - fx / dfx;
    rows.push({ iter: i+1, x: x.toFixed(8), fx: fx.toFixed(6), dfx: dfx.toFixed(6), xNew: xNew.toFixed(8) });
    if (Math.abs(xNew - x) < tol) return { root: xNew.toFixed(8), iterations: i+1, method: 'Newton-Raphson', rows };
    x = xNew;
  }
  return { error: 'Did not converge in 50 iterations.' };
}

function secant(fStr, x0, x1, tol) {
  const f = x => math.evaluate(fStr, { x });
  let rows = [];
  for (let i = 0; i < 50; i++) {
    const f0 = f(x0), f1 = f(x1);
    if (Math.abs(f1 - f0) < 1e-14) return { error: 'f(x1) - f(x0) ≈ 0 — method fails.' };
    const x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
    rows.push({ iter: i+1, x0: x0.toFixed(6), x1: x1.toFixed(6), x2: x2.toFixed(8) });
    if (Math.abs(x2 - x1) < tol) return { root: x2.toFixed(8), iterations: i+1, method: 'Secant', rows };
    x0 = x1; x1 = x2;
  }
  return { error: 'Did not converge in 50 iterations.' };
}
```

- [ ] **Step 3: Write console tests**

Add to `runSolverTests()`:

```js
const r3 = newtonRaphson('x^3 - x - 2', '3*x^2 - 1', 1.5, 0.0001);
assert('newton x^3-x-2', r3.root, 1.5214);
const r4 = secant('x^3 - x - 2', 1, 2, 0.0001);
assert('secant x^3-x-2', r4.root, 1.5214);
```

- [ ] **Step 4: Wire Newton/Secant form (add to `wireDrawerForms`)**

After the bisection block inside `wireDrawerForms`:

```js
  document.getElementById('nr-solve')?.addEventListener('click', () => {
    const fx   = document.getElementById('nr-fx').value.trim();
    const dfx  = document.getElementById('nr-dfx').value.trim();
    const x0   = parseFloat(document.getElementById('nr-x0').value);
    const x1   = parseFloat(document.getElementById('nr-x1').value);
    const tol  = parseFloat(document.getElementById('nr-tol').value);
    const out  = document.getElementById('nr-result');
    if (!fx || isNaN(x0)) { out.textContent = 'Fill f(x) and x₀.'; return; }
    try {
      let res;
      if (dfx) {
        res = newtonRaphson(fx, dfx, x0, tol);
      } else {
        if (isNaN(x1)) { out.textContent = 'Enter x₁ for Secant method.'; return; }
        res = secant(fx, x0, x1, tol);
      }
      if (res.error) { out.textContent = res.error; return; }
      const table = res.rows.slice(-5).map(r =>
        `#${r.iter}  ${Object.values(r).slice(1).join('  ')}`
      ).join('\n');
      out.textContent = `Method: ${res.method}\nRoot ≈ ${res.root}\nIterations: ${res.iterations}\n\nLast 5 steps:\n${table}`;
    } catch(e) { out.textContent = 'Error: ' + e.message; }
  });
```

- [ ] **Step 5: Test in browser**

Open drawer → NR/Secant tab. Enter `x^3 - x - 2`, f'(x) = `3*x^2 - 1`, x₀ = `1.5`. Tap solve. Expected root ≈ `1.52137971`. Then clear f'(x), enter x₁ = `2` → switches to Secant, same root.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: add Newton-Raphson and Secant method solvers"
```

---

## Task 8: Interpolation Tab

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `interpPanel()` stub**

```js
function interpPanel() {
  return `
    <div class="solver-form">
      <div>
        <label>Data points — one per line as: x, y</label>
        <textarea id="interp-data" rows="5" style="width:100%;background:var(--input-bg);border:1px solid var(--sheet-border);border-radius:8px;color:var(--text);font-size:13px;padding:8px;font-family:monospace;resize:vertical" placeholder="1, 1\n2, 8\n3, 27"></textarea>
      </div>
      <div><label>Query point x</label><input type="number" id="interp-x" placeholder="2.5" step="any"></div>
      <button class="solver-btn" id="interp-solve">Interpolate</button>
      <div class="solver-result" id="interp-result">—</div>
    </div>`;
}
```

- [ ] **Step 2: Add Newton's divided difference algorithm**

```js
function newtonInterpolation(points, queryX) {
  const n = points.length;
  const x = points.map(p => p[0]);
  // Build divided difference table
  const d = points.map(p => p[1]);
  const coeff = [d[0]];
  let prev = [...d];
  for (let j = 1; j < n; j++) {
    const next = [];
    for (let i = 0; i < n - j; i++) {
      next.push((prev[i+1] - prev[i]) / (x[i+j] - x[i]));
    }
    coeff.push(next[0]);
    prev = next;
  }
  // Evaluate Newton polynomial at queryX
  let result = coeff[0];
  let term = 1;
  const steps = [`f[x₀] = ${coeff[0].toFixed(6)}`];
  for (let i = 1; i < n; i++) {
    term *= (queryX - x[i-1]);
    result += coeff[i] * term;
    steps.push(`f[x₀..x${i}] = ${coeff[i].toFixed(6)}`);
  }
  return { value: result, coefficients: coeff, steps };
}
```

- [ ] **Step 3: Write console test**

Add to `runSolverTests()`:

```js
const pts = [[1,1],[2,8],[3,27]];
const ri = newtonInterpolation(pts, 2.5);
assert('interp cubic at 2.5', ri.value, 15.625); // 2.5^3
```

- [ ] **Step 4: Wire interpolation form (add to `wireDrawerForms`)**

```js
  document.getElementById('interp-solve')?.addEventListener('click', () => {
    const raw = document.getElementById('interp-data').value.trim();
    const qx  = parseFloat(document.getElementById('interp-x').value);
    const out = document.getElementById('interp-result');
    if (!raw || isNaN(qx)) { out.textContent = 'Enter data points and query x.'; return; }
    try {
      const points = raw.split('\n').map(line => {
        const parts = line.split(',').map(Number);
        if (parts.length < 2 || parts.some(isNaN)) throw new Error(`Invalid line: "${line}"`);
        return parts;
      });
      const res = newtonInterpolation(points, qx);
      out.textContent = `f(${qx}) ≈ ${res.value.toFixed(6)}\n\nDivided differences:\n${res.steps.join('\n')}`;
    } catch(e) { out.textContent = 'Error: ' + e.message; }
  });
```

- [ ] **Step 5: Test in browser**

Open drawer → Interp tab. Enter:
```
1, 1
2, 8
3, 27
```
Query x = `2.5`. Expected: `f(2.5) ≈ 15.625000`.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: add Newton's divided difference interpolation solver"
```

---

## Task 9: Numerical Integration Tab

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `integralPanel()` stub**

```js
function integralPanel() {
  return `
    <div class="solver-form">
      <div><label>f(x)</label><input type="text" id="int-fx" placeholder="x^2"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><label>a</label><input type="number" id="int-a" placeholder="0" step="any"></div>
        <div><label>b</label><input type="number" id="int-b" placeholder="1" step="any"></div>
      </div>
      <div><label>n (subintervals — even for Simpson)</label><input type="number" id="int-n" value="10" min="2"></div>
      <button class="solver-btn" id="int-solve">Integrate</button>
      <div class="solver-result" id="int-result">—</div>
    </div>`;
}
```

- [ ] **Step 2: Add Trapezoidal and Simpson's rule**

```js
function trapezoidalRule(fStr, a, b, n) {
  const f = x => math.evaluate(fStr, { x });
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += 2 * f(a + i * h);
  return (h / 2) * sum;
}

function simpsonsRule(fStr, a, b, n) {
  if (n % 2 !== 0) n++; // Simpson requires even n
  const f = x => math.evaluate(fStr, { x });
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
  return (h / 3) * sum;
}
```

- [ ] **Step 3: Write console tests**

Add to `runSolverTests()`:

```js
// ∫x² from 0 to 1 = 1/3 ≈ 0.3333
const trap = trapezoidalRule('x^2', 0, 1, 100);
assert('trapezoidal x^2 0-1', trap.toFixed(4), '0.3333');
const simp = simpsonsRule('x^2', 0, 1, 100);
assert('simpsons x^2 0-1', simp.toFixed(4), '0.3333');
```

- [ ] **Step 4: Wire integration form (add to `wireDrawerForms`)**

```js
  document.getElementById('int-solve')?.addEventListener('click', () => {
    const fx = document.getElementById('int-fx').value.trim();
    const a  = parseFloat(document.getElementById('int-a').value);
    const b  = parseFloat(document.getElementById('int-b').value);
    const n  = parseInt(document.getElementById('int-n').value);
    const out = document.getElementById('int-result');
    if (!fx || isNaN(a) || isNaN(b) || isNaN(n)) { out.textContent = 'Fill all fields.'; return; }
    try {
      const trap = trapezoidalRule(fx, a, b, n);
      const simp = simpsonsRule(fx, a, b, n % 2 === 0 ? n : n + 1);
      out.textContent = `Trapezoidal (n=${n}):\n  ∫f dx ≈ ${trap.toFixed(8)}\n\nSimpson's (n=${n % 2 === 0 ? n : n+1}):\n  ∫f dx ≈ ${simp.toFixed(8)}`;
    } catch(e) { out.textContent = 'Error: ' + e.message; }
  });
```

- [ ] **Step 5: Test in browser**

Drawer → ∫ tab. Enter `x^2`, a=`0`, b=`1`, n=`10`. Expected:
- Trapezoidal ≈ `0.33500000`
- Simpson's ≈ `0.33333333`

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: add Trapezoidal and Simpson's integration solvers"
```

---

## Task 10: Derivative Calculator Tab

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `derivPanel()` stub**

```js
function derivPanel() {
  return `
    <div class="solver-form">
      <div><label>f(x)</label><input type="text" id="drv-fx" placeholder="x^3 + 2*x"></div>
      <div><label>Point x</label><input type="number" id="drv-x" placeholder="2" step="any"></div>
      <button class="solver-btn" id="drv-solve">Differentiate</button>
      <div class="solver-result" id="drv-result">—</div>
    </div>`;
}
```

- [ ] **Step 2: Add derivative functions**

```js
function numericalDerivative(fStr, x, h = 1e-5) {
  const f = t => math.evaluate(fStr, { x: t });
  return (f(x + h) - f(x - h)) / (2 * h); // central difference
}

function symbolicDerivative(fStr) {
  try {
    const node = math.parse(fStr);
    const derived = math.derivative(node, 'x');
    return derived.toString();
  } catch(e) {
    return null;
  }
}
```

- [ ] **Step 3: Write console tests**

Add to `runSolverTests()`:

```js
// d/dx(x^3) at x=2 = 3*4 = 12
const nd = numericalDerivative('x^3', 2);
assert('numerical deriv x^3 at 2', nd.toFixed(4), '12.0000');
const sd = symbolicDerivative('x^3');
console.log('symbolic d/dx(x^3) =', sd); // should be 3 * x ^ 2
```

- [ ] **Step 4: Wire derivative form (add to `wireDrawerForms`)**

```js
  document.getElementById('drv-solve')?.addEventListener('click', () => {
    const fx = document.getElementById('drv-fx').value.trim();
    const x  = parseFloat(document.getElementById('drv-x').value);
    const out = document.getElementById('drv-result');
    if (!fx || isNaN(x)) { out.textContent = 'Fill f(x) and x.'; return; }
    try {
      const numerical = numericalDerivative(fx, x);
      const symbolic  = symbolicDerivative(fx);
      let text = `Numerical f'(${x}) ≈ ${numerical.toFixed(8)}\n(central difference, h=1e-5)`;
      if (symbolic) text += `\n\nSymbolic f'(x) = ${symbolic}\nf'(${x}) = ${math.evaluate(symbolic, { x }).toFixed(8)}`;
      out.textContent = text;
    } catch(e) { out.textContent = 'Error: ' + e.message; }
  });
```

- [ ] **Step 5: Test in browser**

Drawer → d/dx tab. Enter `x^3 + 2*x`, point `2`. Expected:
```
Numerical f'(2) ≈ 14.00000000
Symbolic f'(x) = 3 * x ^ 2 + 2
f'(2) = 14.00000000
```

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: add derivative calculator (numerical + symbolic)"
```

---

## Task 11: LLM Chat Overlay

**Files:**
- Modify: `styles.css`
- Modify: `app.js`

- [ ] **Step 1: Add chat sheet styles**

Append to `styles.css`:

```css
/* ===== CHAT SHEET ===== */
#chat-sheet {
  height: 55dvh;
  max-height: 55dvh;
}

#chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-msg {
  max-width: 88%;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.chat-msg.user {
  background: var(--accent);
  color: #000;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.chat-msg.ai {
  background: #2c2c2e;
  color: var(--text);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}
.chat-msg.thinking {
  background: #2c2c2e;
  color: #888;
  align-self: flex-start;
  font-style: italic;
}

#chat-input-row {
  display: flex;
  gap: 8px;
  padding: 8px 12px 12px;
  border-top: 1px solid var(--sheet-border);
  flex-shrink: 0;
}

#chat-input {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--sheet-border);
  border-radius: 20px;
  color: var(--text);
  font-size: 14px;
  padding: 8px 14px;
  outline: none;
}
#chat-input:focus { border-color: var(--accent); }

#chat-send {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 50%;
  width: 36px; height: 36px;
  font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
#chat-send:active { filter: brightness(0.85); }
```

- [ ] **Step 2: Add chat logic in `app.js`**

```js
// ===== CHAT =====
const chatSheet  = document.getElementById('chat-sheet');
const chatInput  = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');
const SYSTEM_PROMPT = 'You are a numerical methods assistant. Give concise, step-by-step solutions suitable for an engineering exam. Use plain text, no markdown.';

function openChatSheet() {
  chatSheet.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  // Pre-fill input on first open
  if (!chatHistory.children.length) {
    chatInput.value = 'I\'m solving a numerical methods problem: ';
  }
  setTimeout(() => chatInput.focus(), 300);
}

function closeChatSheet() {
  chatSheet.classList.add('hidden');
  backdrop.classList.add('hidden');
}

document.getElementById('chat-close').addEventListener('click', closeChatSheet);

// Swipe-down to close chat sheet
let touchStartY = 0;
document.getElementById('chat-handle').addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; });
document.getElementById('chat-handle').addEventListener('touchend', e => {
  if (e.changedTouches[0].clientY - touchStartY > 60) closeChatSheet();
});

// Long-press 0 → open chat
let longPressTimer = null;
const zeroBtn = document.getElementById('btn-zero');
zeroBtn.addEventListener('pointerdown', () => {
  longPressTimer = setTimeout(openChatSheet, 1500);
});
zeroBtn.addEventListener('pointerup',   () => clearTimeout(longPressTimer));
zeroBtn.addEventListener('pointerleave',() => clearTimeout(longPressTimer));

// Send message
async function sendChat() {
  const apiKey = localStorage.getItem('gemini_api_key');
  // showSettingsModal defined in Task 12 — guard so chat works before Task 12 is done
  if (!apiKey) { if (typeof showSettingsModal === 'function') showSettingsModal(); return; }
  const msg = chatInput.value.trim();
  if (!msg) return;
  chatInput.value = '';
  appendMsg('user', msg);
  const thinking = appendMsg('ai', '...', 'thinking');
  try {
    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: msg }] }]
    };
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    thinking.remove();
    appendMsg('ai', reply);
  } catch(e) {
    thinking.remove();
    appendMsg('ai', 'Network error: ' + e.message);
  }
}

function appendMsg(role, text, extraClass = '') {
  const el = document.createElement('div');
  el.className = 'chat-msg ' + role + (extraClass ? ' ' + extraClass : '');
  el.textContent = text;
  chatHistory.appendChild(el);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return el;
}

document.getElementById('chat-send').addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
```

- [ ] **Step 3: Test long-press in browser**

On mobile (or DevTools touch simulation): press and hold `0` for 1.5 seconds. Expected: chat sheet slides up, input pre-filled with "I'm solving a numerical methods problem: ". Short tap on `0` should just input `0` normally.

- [ ] **Step 4: Commit**

```bash
git add styles.css app.js
git commit -m "feat: add hidden LLM chat overlay with long-press 0 trigger"
```

---

## Task 12: API Key Settings + First-Launch Prompt

**Files:**
- Modify: `styles.css`
- Modify: `app.js`

- [ ] **Step 1: Add settings modal styles**

Append to `styles.css`:

```css
/* ===== MODAL ===== */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  background: rgba(0,0,0,0.7);
}
.modal.hidden { display: none; }

.modal-box {
  background: var(--sheet-bg);
  border-radius: 16px;
  padding: 24px;
  width: min(320px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-box h3 { font-size: 17px; font-weight: 600; }
.modal-box input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--sheet-border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
}
.modal-box input:focus { border-color: var(--accent); }
.modal-btns { display: flex; gap: 10px; }
.modal-btns button {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
#settings-cancel { background: #3a3a3c; color: var(--text); }
#settings-save   { background: var(--accent); color: #000; }
```

- [ ] **Step 2: Add settings logic in `app.js`**

```js
// ===== SETTINGS =====
const settingsModal = document.getElementById('settings-modal');
const apiKeyInput   = document.getElementById('api-key-input');

function showSettingsModal() {
  apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
  settingsModal.classList.remove('hidden');
  setTimeout(() => apiKeyInput.focus(), 100);
}

function hideSettingsModal() {
  settingsModal.classList.add('hidden');
}

document.getElementById('settings-save').addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem('gemini_api_key', key);
    hideSettingsModal();
  } else {
    apiKeyInput.style.borderColor = 'red';
    setTimeout(() => apiKeyInput.style.borderColor = '', 1500);
  }
});

document.getElementById('settings-cancel').addEventListener('click', hideSettingsModal);
document.getElementById('btn-settings').addEventListener('click', showSettingsModal);

// First-launch check: prompt for API key if not set
window.addEventListener('load', () => {
  if (!localStorage.getItem('gemini_api_key')) {
    setTimeout(showSettingsModal, 800);
  }
});
```

- [ ] **Step 3: Test first-launch flow in browser**

Open DevTools → Application → Local Storage → delete `gemini_api_key`. Reload page. Expected: settings modal appears after ~800ms asking for API key. Enter a dummy key, tap Save. Reload — modal should NOT appear again.

- [ ] **Step 4: Test chat with API key**

Enter a real Gemini API key from https://aistudio.google.com. Long-press `0` → type "What is the bisection method?" → send. Expected: AI response appears.

- [ ] **Step 5: Commit**

```bash
git add styles.css app.js
git commit -m "feat: add API key settings modal with first-launch prompt"
```

---

## Task 13: Service Worker + Manifest

**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Create: `icon-192.png` (inline SVG → PNG via canvas, or inline as data URI in HTML)

- [ ] **Step 1: Create `manifest.json`**

```json
{
  "name": "Calculator",
  "short_name": "Calculator",
  "description": "Calculator",
  "start_url": "./",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Generate icons via script (run once in browser console)**

Open `index.html` in browser. In DevTools console, run this to download both icons:

```js
function makeIcon(size, filename) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#ff9f0a';
  ctx.font = `bold ${size * 0.5}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('=', size/2, size/2);
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = filename;
  a.click();
}
makeIcon(192, 'icon-192.png');
makeIcon(512, 'icon-512.png');
```

Move the downloaded `icon-192.png` and `icon-512.png` to the project root.

- [ ] **Step 3: Create `sw.js`**

```js
const CACHE = 'calc-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/mathjs@13/lib/browser/math.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

- [ ] **Step 4: Register service worker in `app.js`**

Add at the very end of `app.js`:

```js
// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err =>
      console.warn('SW registration failed:', err)
    );
  });
}
```

- [ ] **Step 5: Verify PWA install**

DevTools → Application → Manifest. Expected: name "Calculator", icons shown, display "standalone". Application → Service Workers: SW registered and active. Lighthouse → PWA audit → should pass installability.

On mobile: open GitHub Pages URL in Chrome/Safari → "Add to Home Screen" prompt or option should appear.

- [ ] **Step 6: Commit**

```bash
git add manifest.json sw.js icon-192.png icon-512.png app.js
git commit -m "feat: add PWA manifest and service worker for offline support"
```

---

## Task 14: Final Polish + Deploy

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Remove test-only code from `app.js`**

Remove or wrap the `runCalcTests()` and `runSolverTests()` calls at the bottom of `app.js`:

```js
// Only run in dev
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  runCalcTests();
  runSolverTests();
}
```

- [ ] **Step 2: Verify all features end-to-end**

Checklist — test each in browser (DevTools device mode, iPhone 14 Pro):
- [ ] Portrait: all buttons work, display correct
- [ ] `7 × 8 = 56` ✓
- [ ] `30 sin =` → `0.5` (landscape)
- [ ] Bisection: `x^3 - x - 2`, a=1, b=2 → root ≈ 1.5214
- [ ] NR: `x^3 - x - 2`, f'=`3*x^2-1`, x₀=1.5 → root ≈ 1.5214
- [ ] Secant: same f(x), no f'(x), x₁=2 → root ≈ 1.5214
- [ ] Interpolation: (1,1),(2,8),(3,27), query 2.5 → 15.625
- [ ] Integration: `x^2`, 0 to 1 → ≈ 0.3333
- [ ] Derivative: `x^3+2*x` at 2 → 14
- [ ] Long-press 0 → chat opens
- [ ] Chat sends message to Gemini, gets response
- [ ] Swipe down chat → dismisses
- [ ] ⚙ → settings modal → change key → save

- [ ] **Step 3: Update CLAUDE.md changelog**

Add row to the Changelog table in `CLAUDE.md`:

```markdown
| 2026-04-08 | All features implemented and deployed |
```

- [ ] **Step 4: Push and verify GitHub Pages**

```bash
git add .
git commit -m "feat: complete engineering calculator PWA — all features"
git push origin master
```

Wait ~60s then open https://samhubby.github.io/calculator/ on your phone. Expected: app loads, "Add to Home Screen" works.

- [ ] **Step 5: Final commit**

```bash
git status  # should be clean
```

---

## Success Criteria Checklist

| Criteria | Task |
|----------|------|
| Installs via "Add to Home Screen" | Task 13 |
| Works fully offline | Task 13 |
| Looks identical to iPhone calculator in portrait | Tasks 2, 3 |
| Long-press 0 opens LLM chat — no visual hint | Task 11 |
| Landscape shows scientific + numerical tools | Tasks 4, 5–10 |
| Gemini answers numerical methods questions | Tasks 11, 12 |
| Deployed to GitHub Pages | Task 14 |
