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
  if (btn.id === 'btn-zero') return; // handled separately with double-tap
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
function derivPanel() {
  return `
    <div class="solver-form">
      <div><label>f(x)</label><input type="text" id="drv-fx" placeholder="x^3 + 2*x"></div>
      <div><label>Point x</label><input type="number" id="drv-x" placeholder="2" step="any"></div>
      <button class="solver-btn" id="drv-solve">Differentiate</button>
      <div class="solver-result" id="drv-result">—</div>
    </div>`;
}

function numericalDerivative(fStr, x, h = 1e-5) {
  const f = t => math.evaluate(fStr, { x: t });
  return (f(x + h) - f(x - h)) / (2 * h);
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

function trapezoidalRule(fStr, a, b, n) {
  const f = x => math.evaluate(fStr, { x });
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += 2 * f(a + i * h);
  return (h / 2) * sum;
}

function simpsonsRule(fStr, a, b, n) {
  if (n % 2 !== 0) n++;
  const f = x => math.evaluate(fStr, { x });
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
  return (h / 3) * sum;
}

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

  // Integration
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

  // Derivative
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
}

// ===== CHAT =====
const chatSheet   = document.getElementById('chat-sheet');
const chatInput   = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');
const SYSTEM_PROMPT = 'You are a numerical methods assistant. Give concise, step-by-step solutions suitable for an engineering exam. Use plain text, no markdown.';

function openChatSheet() {
  chatSheet.classList.remove('hidden');
  backdrop.classList.remove('hidden');
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

// Swipe-down to close
let touchStartY = 0;
document.getElementById('chat-handle').addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; });
document.getElementById('chat-handle').addEventListener('touchend', e => {
  if (e.changedTouches[0].clientY - touchStartY > 60) closeChatSheet();
});

// Double-tap 0 → open chat
const zeroBtn = document.getElementById('btn-zero');
let zeroLastTap = 0;
let zeroTapTimer = null;

// Remove zero from general click handler (re-wired below with double-tap logic)
zeroBtn.addEventListener('click', () => {
  const now = Date.now();
  if (now - zeroLastTap < 300) {
    clearTimeout(zeroTapTimer);
    zeroLastTap = 0;
    openChatSheet();
  } else {
    zeroLastTap = now;
    zeroTapTimer = setTimeout(() => { handleBtn(zeroBtn); }, 280);
  }
});


// Send message
async function sendChat() {
  const apiKey = localStorage.getItem('gemini_api_key');
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
    if (!res.ok) {
      thinking.remove();
      appendMsg('ai', 'API error: ' + (data?.error?.message || `HTTP ${res.status}`));
      return;
    }
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || (data?.promptFeedback?.blockReason ? 'Blocked: ' + data.promptFeedback.blockReason : null)
      || data?.error?.message
      || 'No response.';
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

// First-launch: show settings if no API key
window.addEventListener('load', () => {
  if (!localStorage.getItem('gemini_api_key')) {
    setTimeout(showSettingsModal, 800);
  }
});

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

function runSolverTests() {
  const assert = (label, got, want) => {
    if (Math.abs(parseFloat(got) - want) > 1e-4)
      console.error('FAIL ' + label + ': got ' + got + ', want ~' + want);
    else console.log('PASS ' + label);
  };
  const r1 = bisection('x^3 - x - 2', 1, 2, 0.0001);
  assert('bisection x^3-x-2', r1.root, 1.5214);
  const r2 = bisection('x^2 - 4', 0, 3, 0.0001);
  assert('bisection x^2-4', r2.root, 2.0);
  const r3 = newtonRaphson('x^3 - x - 2', '3*x^2 - 1', 1.5, 0.0001);
  assert('newton x^3-x-2', r3.root, 1.5214);
  const r4 = secant('x^3 - x - 2', 1, 2, 0.0001);
  assert('secant x^3-x-2', r4.root, 1.5214);
  const pts = [[1,1],[2,8],[3,27]];
  const ri = newtonInterpolation(pts, 2.5);
  assert('interp cubic at 2.5', ri.value, 16); // quadratic through 3 points
  const trap = trapezoidalRule('x^2', 0, 1, 100);
  assert('trapezoidal x^2 0-1', trap.toFixed(4), 0.3333);
  const simp = simpsonsRule('x^2', 0, 1, 100);
  assert('simpsons x^2 0-1', simp.toFixed(4), 0.3333);
  const nd = numericalDerivative('x^3', 2);
  assert('numerical deriv x^3 at 2', nd.toFixed(4), 12.0000);
  console.log('Solver tests done');
}

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  runCalcTests();
  runSolverTests();
}

updateDisplay();

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err =>
      console.warn('SW registration failed:', err)
    );
  });
}
