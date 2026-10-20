const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();
  const browser = await chromium.connectOverCDP(wsUrl);
  const page = browser.contexts()[0].pages().find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14'));

  for (const f of page.frames()) {
    const btn = await f.$('button:has-text("Select Style Image")');
    if (btn) {
      console.log('[*] Found button, clicking...');
      
      // Check if file chooser opens
      page.once('filechooser', async (chooser) => {
        console.log('[✓] File chooser opened! Setting file:', 'C:\\Users\\doris\\Downloads\\my_character_reference.png');
        await chooser.setFiles('C:\\Users\\doris\\Downloads\\my_character_reference.png');
      });

      await btn.click();
      await page.waitForTimeout(3000);
      console.log('[*] Checked click.');
      break;
    }
  }
}

main().catch(console.error);
