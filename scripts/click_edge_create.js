const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  console.log('[*] Current URL:', page.url());
  const btn = await page.$('a:has-text("Create with Google Flow"), button:has-text("Create with Google Flow")');
  if (btn) {
    console.log('[*] Clicking Create with Google Flow...');
    await btn.click();
    await page.waitForTimeout(5000);
    console.log('[✓] New URL:', page.url());
    console.log('[✓] Title:', await page.title());
    await page.screenshot({ path: 'scripts/edge_after_create_click.png' });
  } else {
    console.log('Button not found');
  }
}

main().catch(console.error);
