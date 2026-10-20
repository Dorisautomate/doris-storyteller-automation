const { chromium } = require('playwright');

async function inspectFlow() {
  const context = await chromium.launchPersistentContext('C:\\Users\\doris\\.chrome-debug-profile', {
    channel: 'chrome',
    headless: false
  });
  const page = await context.newPage();
  await page.goto('https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  console.log('Frames count:', page.frames().length);
  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    console.log(`Frame ${i}: ${f.url()}`);
  }

  // Look across all frames for inputs, buttons, text
  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    try {
      const inputs = await f.$$eval('input', els => els.map(e => ({ type: e.type, id: e.id, name: e.name, accept: e.accept, placeholder: e.placeholder })));
      const buttons = await f.$$eval('button', els => els.map(e => e.innerText.trim()).filter(Boolean));
      console.log(`Frame ${i} inputs:`, inputs);
      console.log(`Frame ${i} buttons:`, buttons);
    } catch (e) {
      console.log(`Frame ${i} eval error:`, e.message);
    }
  }

  await page.screenshot({ path: 'scripts/flow_state.png', fullPage: true });
  await context.close();
}

inspectFlow().catch(console.error);
