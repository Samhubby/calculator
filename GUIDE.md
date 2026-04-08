# Engineering Calculator — User Guide

A PWA that looks like an iPhone calculator but hides powerful engineering tools inside.

---

## Install on iPhone (Add to Home Screen)

1. Open **Safari** on your iPhone (must be Safari — Chrome/Firefox won't work for PWA install)
2. Go to: **https://samhubby.github.io/calculator**
3. Tap the **Share** button (box with arrow pointing up) in the Safari toolbar
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"** in the top-right corner
6. The Calculator icon appears on your home screen — launch it from there

> **Note:** The app must be opened from the home screen icon (not Safari) to run in full-screen standalone mode with no browser UI.

---

## First Launch — Gemini API Key

On first launch, a prompt asks for a Gemini API key. This is needed for the AI chat feature.

**How to get a free key:**

1. Go to **https://aistudio.google.com**
2. Sign in with your Google account
3. Click **"Get API key"** → **"Create API key"**
4. Copy the key
5. Paste it into the prompt on the calculator and tap **Save**

The key is stored locally on your device and never sent anywhere except directly to Google.

> Skip this by tapping **Cancel** — the calculator works fully without it; only the AI chat will be unavailable.

---

## Basic Calculator (Portrait Mode)

Hold the phone upright. You get the standard iPhone calculator layout.

| Button | Action |
|--------|--------|
| `AC` | Clear everything |
| `+/−` | Toggle positive/negative |
| `%` | Divide by 100 |
| `÷ × − +` | Standard operators |
| `=` | Calculate result |
| `.` | Decimal point |

Chaining operations works exactly like the iPhone calculator.

---

## Scientific Mode (Landscape)

Rotate the phone to **landscape**. A scientific panel appears on the left side.

| Button | Function |
|--------|----------|
| `sin` `cos` `tan` | Trig functions (degrees) |
| `sin⁻¹` `cos⁻¹` `tan⁻¹` | Inverse trig (returns degrees) |
| `log` | Log base 10 |
| `ln` | Natural log |
| `√` | Square root |
| `x²` | Square |
| `xʸ` | Power (enter base, press xʸ, enter exponent, press =) |
| `π` | Insert π |
| `e` | Insert Euler's number |
| `( )` | Parentheses for grouping |

---

## Numerical Methods Drawer (Landscape)

In landscape, tap the **≡** button (top-right) to open the Numerical Methods drawer.

Five tabs are available:

### Bisection Method

Finds a root of f(x) = 0 between two bounds.

| Field | What to enter |
|-------|---------------|
| f(x) | Expression, e.g. `x^3 - x - 2` |
| a | Left bound (must have opposite sign to f(b)) |
| b | Right bound |
| Tolerance | Accuracy, e.g. `0.0001` |

Tap **Solve** → shows root approximation and iteration count.

**Example:** `x^3 - x - 2`, a=`1`, b=`2`, tol=`0.0001` → Root ≈ 1.5214

---

### Newton-Raphson / Secant Method

Faster root-finding. Provide derivative for Newton-Raphson, or leave it blank for Secant method.

| Field | What to enter |
|-------|---------------|
| f(x) | Expression, e.g. `x^3 - x - 2` |
| f'(x) | Derivative (leave blank for Secant) |
| x₀ | Initial guess |
| x₁ | Second guess (Secant only) |
| Tolerance | e.g. `0.0001` |

- Fill in f'(x) → uses **Newton-Raphson**
- Leave f'(x) blank + fill x₁ → uses **Secant method**

**Example:** f(x)=`x^3 - x - 2`, f'(x)=`3*x^2 - 1`, x₀=`1.5` → Root ≈ 1.5214

---

### Interpolation

Fits a polynomial through your data points and evaluates it at a query x.

| Field | What to enter |
|-------|---------------|
| Data points | One `x, y` pair per line |
| x | The x value to evaluate |

Uses Newton's divided difference method (polynomial interpolation).

**Example:**
```
0, 0
1, 1
2, 4
```
At x=`1.5` → f(1.5) ≈ 2.25

---

### Integration (∫ tab)

Numerically integrates f(x) from a to b.

| Field | What to enter |
|-------|---------------|
| f(x) | Expression, e.g. `x^2` |
| a | Lower bound |
| b | Upper bound |
| n | Number of intervals (higher = more accurate) |

Shows both **Trapezoidal** and **Simpson's** rule results.

**Example:** `x^2` from `0` to `1` with n=`100` → ≈ 0.3333

---

### Derivative (d/dx tab)

Computes derivative at a specific point numerically (and symbolically if possible).

| Field | What to enter |
|-------|---------------|
| f(x) | Expression, e.g. `x^3` |
| x | Point at which to evaluate |

Shows:
- **Numerical derivative** using central difference formula
- **Symbolic derivative** via math.js (exact)

**Example:** `x^3` at x=`2` → f'(2) ≈ 12

---

## AI Chat (Hidden Feature)

**Long-press the `0` button for 1.5 seconds** to open the AI chat sheet.

- The input pre-fills with "I'm solving a numerical methods problem: "
- Type your question and tap **↑** to send
- Gemini 1.5 Flash responds in the chat window
- Swipe down or tap **×** to dismiss

This feature is invisible in portrait mode. In landscape, it also requires the 1.5s long-press — no visible button.

> Requires a Gemini API key (set via ⚙ Settings).

---

## Settings (Landscape)

Tap the **⚙** icon in landscape to update your Gemini API key.

---

## Expression Syntax

All f(x) fields use **math.js** expression syntax:

| Math notation | Type this |
|---------------|-----------|
| x² | `x^2` |
| x³ | `x^3` |
| √x | `sqrt(x)` |
| sin(x) | `sin(x)` |
| eˣ | `exp(x)` |
| ln(x) | `log(x, e)` or `ln(x)` |
| log₁₀(x) | `log(x, 10)` or `log10(x)` |
| π | `pi` |
| Multiplication | `3*x` not `3x` |

---

## Keyboard Shortcuts (Desktop)

When using on desktop/laptop:

| Key | Action |
|-----|--------|
| `0-9` | Number input |
| `+ - * /` | Operators |
| `Enter` | Equals |
| `Escape` | Clear |
| `.` | Decimal |

---

## Troubleshooting

**"Add to Home Screen" doesn't show a standalone app icon**
- Must use Safari (not Chrome or Firefox)
- Wait a few seconds after tapping Add — the icon should appear on your last home screen page

**The app shows in Safari, not standalone**
- Tap the home screen icon, not the Safari bookmark

**AI chat isn't responding**
- Check your Gemini API key via ⚙ Settings
- Ensure you have an internet connection (AI requires internet; calculator works offline)

**Bisection returns an error**
- f(a) and f(b) must have opposite signs (the root must be bracketed between a and b)

**Scientific buttons not visible**
- Rotate to landscape mode
