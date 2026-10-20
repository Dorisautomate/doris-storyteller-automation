const { chromium } = require('playwright');

async function main() {
  console.log('[*] Testing headed Chrome with user profile...');
  try {
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: [
        '--user-data-dir=C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data',
        '--profile-directory=Default'
      ]
    });
    console.log('[✓] Browser launched!');
    const page = await browser.newPage();
    console.log('[*] Navigating...');
    await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6');
    await page.waitForTimeout(5000);
    console.log('Title:', await page.title());
    await page.screenshot({ path: 'scripts/headed_real_profile.png' });
    await browser.close();
  } catch (e) {
    console.error('[!] Error caught:', e);
  }
}

main();
