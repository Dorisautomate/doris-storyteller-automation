const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();
  const browser = await chromium.connectOverCDP(wsUrl);
  const page = browser.contexts()[0].pages().find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14'));

  await page.screenshot({ path: 'scripts/after_style_click.png', fullPage: true });
  console.log('Saved screenshot after click');

  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    const text = await f.innerText('body').catch(() => '');
    if (text.includes('Upload') || text.includes('Image') || text.includes('Style')) {
      console.log(`Frame ${i} has text snippet:`, text.substring(0, 300));
    }
  }
}

main().catch(console.error);
