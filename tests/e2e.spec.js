// Engineering Calculator PWA — Playwright E2E Tests
// Run: npx playwright test
// Requires local server: npx serve -p 4321

const { test, expect } = require('@playwright/test');
const BASE = 'http://localhost:4321';

test.beforeEach(async ({ page }) => {
  // Clear localStorage so settings modal doesn't interfere
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Dismiss settings modal if it appears
  const cancel = page.locator('#settings-cancel');
  if (await cancel.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cancel.click();
  }
});

// ── BASIC CALCULATOR ─────────────────────────────────────────────────────────

test('display starts at 0', async ({ page }) => {
  await expect(page.locator('#display')).toHaveText('0');
});

test('7 × 8 = 56', async ({ page }) => {
  await page.click('[data-val="7"]');
  await page.click('[data-op="*"]');
  await page.click('[data-val="8"]');
  await page.click('[data-action="equals"]');
  await expect(page.locator('#display')).toHaveText('56');
});

test('10 ÷ 0 = Error', async ({ page }) => {
  await page.click('[data-val="1"]');
  await page.click('[data-val="0"]');
  await page.click('[data-op="/"]');
  await page.click('[data-val="0"]');
  await page.click('[data-action="equals"]');
  await expect(page.locator('#display')).toHaveText('Error');
});

test('AC clears display', async ({ page }) => {
  await page.click('[data-val="5"]');
  await page.click('[data-action="clear"]');
  await expect(page.locator('#display')).toHaveText('0');
});

test('decimal input works', async ({ page }) => {
  await page.click('[data-val="3"]');
  await page.click('[data-action="decimal"]');
  await page.click('[data-val="1"]');
  await page.click('[data-val="4"]');
  await expect(page.locator('#display')).toHaveText('3.14');
});

test('percent of number', async ({ page }) => {
  await page.click('[data-val="9"]');
  await page.click('[data-action="percent"]');
  await expect(page.locator('#display')).toHaveText('0.09');
});

test('+/− sign toggle', async ({ page }) => {
  await page.click('[data-val="7"]');
  await page.click('[data-action="sign"]');
  await expect(page.locator('#display')).toHaveText('-7');
});

test('operator button highlights when active', async ({ page }) => {
  await page.click('[data-val="5"]');
  await page.click('[data-op="+"]');
  const plusBtn = page.locator('[data-op="+"]');
  await expect(plusBtn).toHaveClass(/active/);
});

// ── SCIENTIFIC MODE (landscape simulation) ───────────────────────────────────

test('sin(30) = 0.5', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 }); // landscape
  await page.click('[data-val="3"]');
  await page.click('[data-val="0"]');
  await page.click('[data-fn="sin"]');
  const text = await page.locator('#display').textContent();
  expect(Math.abs(parseFloat(text) - 0.5)).toBeLessThan(0.0001);
});

test('log(100) = 2', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('[data-val="1"]');
  await page.click('[data-val="0"]');
  await page.click('[data-val="0"]');
  await page.click('[data-fn="log"]');
  const text = await page.locator('#display').textContent();
  expect(Math.abs(parseFloat(text) - 2)).toBeLessThan(0.0001);
});

test('π button inserts pi', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('[data-fn="pi"]');
  const text = await page.locator('#display').textContent();
  expect(Math.abs(parseFloat(text) - Math.PI)).toBeLessThan(0.0001);
});

// ── NUMERICAL METHODS DRAWER ─────────────────────────────────────────────────

test('≡ opens numerical methods drawer in landscape', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-drawer');
  await expect(page.locator('#drawer')).not.toHaveClass(/hidden/);
});

test('bisection finds root of x^3 - x - 2', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-drawer');
  await page.fill('#bis-fx', 'x^3 - x - 2');
  await page.fill('#bis-a', '1');
  await page.fill('#bis-b', '2');
  await page.fill('#bis-tol', '0.0001');
  await page.click('#bis-solve');
  const result = await page.locator('#bis-result').textContent();
  expect(result).toContain('Root');
  const match = result.match(/Root ≈ ([\d.]+)/);
  expect(match).toBeTruthy();
  expect(Math.abs(parseFloat(match[1]) - 1.5214)).toBeLessThan(0.001);
});

test('Newton-Raphson finds root of x^3 - x - 2', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-drawer');
  await page.click('[data-tab="newton"]');
  await page.fill('#nr-fx', 'x^3 - x - 2');
  await page.fill('#nr-dfx', '3*x^2 - 1');
  await page.fill('#nr-x0', '1.5');
  await page.fill('#nr-tol', '0.0001');
  await page.click('#nr-solve');
  const result = await page.locator('#nr-result').textContent();
  expect(result).toContain('Newton-Raphson');
  const match = result.match(/Root ≈ ([\d.]+)/);
  expect(match).toBeTruthy();
  expect(Math.abs(parseFloat(match[1]) - 1.5214)).toBeLessThan(0.001);
});

test('Secant method (no f-prime) finds root', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-drawer');
  await page.click('[data-tab="newton"]');
  await page.fill('#nr-fx', 'x^3 - x - 2');
  // Leave nr-dfx blank → Secant
  await page.fill('#nr-x0', '1');
  await page.fill('#nr-x1', '2');
  await page.fill('#nr-tol', '0.0001');
  await page.click('#nr-solve');
  const result = await page.locator('#nr-result').textContent();
  expect(result).toContain('Secant');
});

test('interpolation evaluates correctly', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-drawer');
  await page.click('[data-tab="interp"]');
  await page.fill('#interp-data', '0, 0\n1, 1\n2, 4');
  await page.fill('#interp-x', '1.5');
  await page.click('#interp-solve');
  const result = await page.locator('#interp-result').textContent();
  expect(result).toContain('f(1.5)');
  // Quadratic through (0,0),(1,1),(2,4) at x=1.5 → 2.25
  const match = result.match(/f\(1\.5\) ≈ ([\d.]+)/);
  expect(match).toBeTruthy();
  expect(Math.abs(parseFloat(match[1]) - 2.25)).toBeLessThan(0.001);
});

test('trapezoidal integration of x^2 from 0 to 1', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-drawer');
  await page.click('[data-tab="integral"]');
  await page.fill('#int-fx', 'x^2');
  await page.fill('#int-a', '0');
  await page.fill('#int-b', '1');
  await page.fill('#int-n', '100');
  await page.click('#int-solve');
  const result = await page.locator('#int-result').textContent();
  expect(result).toContain('Trapezoidal');
  expect(result).toContain('Simpson');
  // Both should be close to 1/3 ≈ 0.3333
  const trapMatch = result.match(/Trapezoidal[^:]*:\s*∫f dx ≈ ([\d.]+)/);
  expect(trapMatch).toBeTruthy();
  expect(Math.abs(parseFloat(trapMatch[1]) - 0.3333)).toBeLessThan(0.001);
});

test('derivative of x^3 at x=2 is 12', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-drawer');
  await page.click('[data-tab="deriv"]');
  await page.fill('#drv-fx', 'x^3');
  await page.fill('#drv-x', '2');
  await page.click('#drv-solve');
  const result = await page.locator('#drv-result').textContent();
  expect(result).toContain("f'(2)");
  const match = result.match(/Numerical f'\(2\) ≈ ([\d.]+)/);
  expect(match).toBeTruthy();
  expect(Math.abs(parseFloat(match[1]) - 12)).toBeLessThan(0.001);
});

// ── LLM CHAT ─────────────────────────────────────────────────────────────────

test('double-tap 0 opens chat sheet', async ({ page }) => {
  await page.locator('#btn-zero').dblclick();
  await page.waitForTimeout(350);
  await expect(page.locator('#chat-sheet')).not.toHaveClass(/hidden/);
});

test('chat input pre-fills on first open', async ({ page }) => {
  await page.locator('#btn-zero').dblclick();
  await page.waitForTimeout(350);
  const input = page.locator('#chat-input');
  await expect(input).toHaveValue("I'm solving a numerical methods problem: ");
});

test('chat close button dismisses sheet', async ({ page }) => {
  await page.locator('#btn-zero').dblclick();
  await page.waitForTimeout(350);
  await page.click('#chat-close');
  await expect(page.locator('#chat-sheet')).toHaveClass(/hidden/);
});

// ── SETTINGS ─────────────────────────────────────────────────────────────────

test('settings modal shows on first launch (no API key)', async ({ page }) => {
  await expect(page.locator('#settings-modal')).not.toHaveClass(/hidden/);
});

test('saving an API key dismisses modal', async ({ page }) => {
  await page.fill('#api-key-input', 'test-key-123');
  await page.click('#settings-save');
  await expect(page.locator('#settings-modal')).toHaveClass(/hidden/);
});

test('API key persists in localStorage', async ({ page }) => {
  await page.fill('#api-key-input', 'my-test-key');
  await page.click('#settings-save');
  const stored = await page.evaluate(() => localStorage.getItem('ai_api_key'));
  expect(stored).toBe('my-test-key');
});

test('settings modal does not show on reload with saved key', async ({ page }) => {
  await page.fill('#api-key-input', 'saved-key');
  await page.click('#settings-save');
  await page.reload();
  await page.waitForTimeout(1200);
  await expect(page.locator('#settings-modal')).toHaveClass(/hidden/);
});

test('gear icon opens settings in landscape', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.click('#btn-settings');
  await expect(page.locator('#settings-modal')).not.toHaveClass(/hidden/);
});

// ── PWA ──────────────────────────────────────────────────────────────────────

test('manifest.json is accessible', async ({ page }) => {
  const res = await page.request.get(`${BASE}/manifest.json`);
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.name).toBe('Calculator');
  expect(json.display).toBe('standalone');
});

test('service worker file is accessible', async ({ page }) => {
  const res = await page.request.get(`${BASE}/sw.js`);
  expect(res.status()).toBe(200);
});
