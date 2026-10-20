const { chromium } = require('playwright');
const fs = require('fs');

const CSV_PATH = 'C:\\Users\\doris\\Downloads\\why_your_brain_panics_saying_no_true_1min.csv';

async function main() {
  const content = fs.readFileSync('C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort', 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + content[0].trim() + content[1].trim();
  const browser = await chromium.connectOverCDP(wsUrl);
  const page = browser.contexts()[0].pages().find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14'));

  for (const f of page.frames()) {
    const csvInput = await f.$('input[accept=".csv"]');
    if (csvInput) {
      console.log('[*] Found CSV file input in frame:', f.url());
      console.log('[*] Setting file:', CSV_PATH);
      await csvInput.setInputFiles(CSV_PATH);
      await page.waitForTimeout(4000);

      // Check text in frame after CSV upload
      const text = await f.innerText('body');
      console.log('=== FRAME BODY AFTER CSV UPLOAD ===\n', text.substring(0, 800));

      await page.screenshot({ path: 'scripts/after_csv_upload.png' });
      console.log('[✓] Screenshot saved to scripts/after_csv_upload.png');
      break;
    }
  }
}

main().catch(console.error);
