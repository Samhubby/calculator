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
    let s = parseFloat(n.toPrecision(10)).toString();
    if (s.length > 12) s = parseFloat(n.toExponential(4)).toString();
    return s;
  }
}

// ===== UI WIRING =====
const calc = new Calculator();
const displayEl = document.getElementById('display');

function updateDisplay() {
  const d = calc.display;
  displayEl.textContent = d;
  const len = d.replace('-', '').length;
  displayEl.style.fontSize = len > 9 ? 'clamp(28px, 8vw, 52px)'
    : len > 6 ? 'clamp(40px, 11vw, 72px)'
    : '';
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
  if (action === 'sci')     handleSci(btn.dataset.fn);
  updateDisplay();
}

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
      return;
    default: return;
  }
  if (!isFinite(result)) result = 'Error';
  calc.current = calc._fmt(result);
  calc.shouldReplace = true;
  updateDisplay();
}

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
  if (drawerContent.children.length > 0) return;
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

// Panel HTML stubs — filled in Tasks 6-10
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
function integralPanel()  { return '<p style="color:#888;font-size:13px">Loading...</p>'; }
function derivPanel()     { return '<p style="color:#888;font-size:13px">Loading...</p>'; }

function newtonInterpolation(points, queryX) {
  const n = points.length;
  const x = points.map(p => p[0]);
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

  // Newton/Secant
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

  // Interpolation
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
}

// closeChatSheet stub — replaced in Task 11
function closeChatSheet() {}

// ===== CONSOLE TESTS (localhost only) =====
function runCalcTests() {
  const c = new Calculator();
  const assert = (label, got, want) => {
    if (String(got) !== String(want)) console.error('FAIL ' + label + ': got ' + got + ', want ' + want);
    else console.log('PASS ' + label);
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

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  runCalcTests();
}

updateDisplay();
