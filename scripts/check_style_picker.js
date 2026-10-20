const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();
  const browser = await chromium.connectOverCDP(wsUrl);
  const page = browser.contexts()[0].pages().find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14'));

  let f6 = null;
  for (const f of page.frames()) {
    if (await f.$('button:has-text("16:9")')) {
      f6 = f;
      break;
    }
  }

  // Look at window or React state or message handlers
  const info = await f6.evaluate(() => {
    // Check if there are any global variables or React/Vue components
    const btn = document.querySelector('button div p')?.closest('button');
    return {
      onclick: btn ? String(btn.onclick) : null,
      dataset: btn ? btn.dataset : null,
      parentHtml: btn ? btn.parentElement.innerHTML : null
    };
  });
  console.log('Button info:', info);

  // Let's also check if clicking sends a postMessage to parent!
  // In Google Flow applets:
  // Applets run inside sandboxed iframe and send postMessage to parent to open the Media Picker!
  const allScriptContent = await f6.$$eval('script', scs => scs.map(s => s.innerText).join('\n'));
  const match = allScriptContent.match(/postMessage\([^)]+\)/g) || [];
  console.log('postMessage calls found:', match.slice(0, 5));
}

main().catch(console.error);
