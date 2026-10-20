const { chromium } = require('playwright');

async function inspectSignInPage() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('accounts.google.com')) || context.pages()[0];

  console.log('Page URL:', page.url());
  console.log('Page Title:', await page.title());

  const inputs = await page.$$eval('input', els => els.map(e => ({ id: e.id, name: e.name, type: e.type, value: e.value })));
  console.log('Inputs:', inputs);

  const text = await page.innerText('body');
  console.log('Body Text:\n', text.substring(0, 600));

  await page.screenshot({ path: 'scripts/signin_inspect.png' });
  console.log('[✓] Screenshot saved to scripts/signin_inspect.png');
}

inspectSignInPage().catch(console.error);
