const { chromium } = require('playwright');

async function testCDPFlow() {
  console.log('[*] Connecting to live Chrome on port 9222 via CDP...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  console.log('[✓] Connected over CDP!');

  const contexts = browser.contexts();
  console.log(`[✓] Found ${contexts.length} context(s)`);
  const context = contexts[0];
  const pages = context.pages();
  console.log(`[✓] Found ${pages.length} page(s)`);
  const page = pages[0] || await context.newPage();

  console.log('[*] Navigating to Google Flow tool...');
  await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', {
    waitUntil: 'networkidle',
    timeout: 45000
  });

  await page.waitForTimeout(6000);
  console.log('[✓] Current Title:', await page.title());
  console.log('[✓] Current URL:', page.url());

  const body = await page.innerText('body');
  console.log('=== PAGE BODY PREVIEW ===\n', body.substring(0, 600));

  await page.screenshot({ path: 'scripts/flow_cdp_live.png', fullPage: true });
  console.log('[✓] Saved screenshot to scripts/flow_cdp_live.png');

  // Do NOT close browser, just disconnect CDP!
  // await browser.close();
}

testCDPFlow().catch(console.error);
