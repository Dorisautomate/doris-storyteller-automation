const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  console.log('[*] Filling email: dorischierozolam22@gmail.com');
  await page.fill('input[type="email"]', 'dorischierozolam22@gmail.com');
  await page.waitForTimeout(1000);
  console.log('[*] Clicking Next button...');
  await page.click('#identifierNext button, button:has-text("Next")');
  await page.waitForTimeout(5000);
  console.log('[✓] New URL:', page.url());
  console.log('[✓] New Title:', await page.title());
  const body = await page.innerText('body');
  console.log('Body after Next:\n', body.substring(0, 500));
  await page.screenshot({ path: 'scripts/edge_after_email_next.png' });
}

main().catch(console.error);
