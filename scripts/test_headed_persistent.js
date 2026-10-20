const { chromium } = require('playwright');

async function main() {
  console.log('[*] Testing launchPersistentContext on real user data dir...');
  try {
    const context = await chromium.launchPersistentContext(
      'C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data',
      {
        channel: 'chrome',
        headless: false,
        args: [
          '--profile-directory=Default'
        ],
        timeout: 15000
      }
    );
    console.log('[✓] Successfully opened persistent context!');
    const page = context.pages()[0] || await context.newPage();
    console.log('[*] Navigating to Google Flow tool link...');
    await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);
    console.log('Title:', await page.title());
    const bodyText = await page.innerText('body');
    console.log('Body preview:\n', bodyText.substring(0, 500));
    await page.screenshot({ path: 'scripts/headed_persistent_real.png' });
    await context.close();
  } catch (e) {
    console.error('[!] Error caught:', e.message);
  }
}

main();
