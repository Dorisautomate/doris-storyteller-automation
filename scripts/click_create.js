const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  console.log('[*] Clicking Create with Google Flow button...');
  // Find link or button matching Create with Google Flow
  await page.click('a:has-text("Create with Google Flow"), button:has-text("Create with Google Flow")');
  await page.waitForTimeout(6000);
  console.log('[✓] New URL:', page.url());
  console.log('[✓] New Title:', await page.title());
  const body = await page.innerText('body');
  console.log('Body preview:\n', body.substring(0, 500));
  await page.screenshot({ path: 'scripts/flow_after_click_create.png' });
}

main().catch(console.error);
