const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('accounts.google.com')) || context.pages()[0];

  console.log('[*] Typing email into #identifierId...');
  await page.fill('#identifierId', 'dorischierozolam22@gmail.com');
  await page.waitForTimeout(1000);
  console.log('[*] Pressing Enter...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);

  console.log('[✓] New URL:', page.url());
  console.log('[✓] New Title:', await page.title());
  const body = await page.innerText('body');
  console.log('Body Text after email submit:\n', body.substring(0, 500));
  await page.screenshot({ path: 'scripts/signin_after_email.png' });
}

main().catch(console.error);
