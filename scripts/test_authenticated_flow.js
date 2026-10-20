const { chromium } = require('playwright');
const fs = require('fs');

async function testAuth() {
  const cookies = JSON.parse(fs.readFileSync('scripts/profile2_cookies.json', 'utf8'));

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false
  });

  const context = await browser.newContext();
  let addedCount = 0;
  for (const c of cookies) {
    try {
      await context.addCookies([c]);
      addedCount++;
    } catch (e) {
      console.log('Skipping invalid cookie:', c.name, e.message);
    }
  }
  console.log(`[✓] Successfully added ${addedCount}/${cookies.length} cookies to context!`);

  const page = await context.newPage();

  console.log('[*] Testing auth at https://myaccount.google.com...');
  await page.goto('https://myaccount.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('[✓] Account title:', await page.title());
  console.log('[✓] Current URL:', page.url());

  console.log('[*] Testing Google Flow Tool...');
  await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', {
    waitUntil: 'networkidle',
    timeout: 45000
  });

  await page.waitForTimeout(6000);
  console.log('[✓] Flow Page Title:', await page.title());
  console.log('[✓] Flow URL:', page.url());

  const bodyText = await page.innerText('body');
  console.log('[✓] Body text preview:\n', bodyText.substring(0, 500));

  await page.screenshot({ path: 'scripts/flow_authenticated.png', fullPage: true });
  console.log('[✓] Saved screenshot to scripts/flow_authenticated.png');

  await browser.close();
}

testAuth().catch(console.error);
