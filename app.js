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

// Drawer/chat stubs — filled in Tasks 5 and 11
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
