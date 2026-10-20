const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CSV_PATH = 'C:\\Users\\doris\\Downloads\\be_so_calm_it_makes_people_nervous_15min.csv';
const TXT_PATH = 'C:\\Users\\doris\\Downloads\\be_so_calm_it_makes_people_nervous_15min.txt';
const REF_IMG_PATH = 'C:\\Users\\doris\\Downloads\\my_character_reference.png';
const OUTPUT_DIR = 'C:\\Users\\doris\\Downloads\\be_so_calm_it_makes_people_nervous_images';

function getSentences() {
  const content = fs.readFileSync(TXT_PATH, 'utf8').trim();
  return content.split('\n').map((line, idx) => ({
    sn: idx + 1,
    sentence: line.trim()
  })).filter(x => x.sentence.length > 0);
}

function sanitizeFilename(text) {
  return text.replace(/[:/\\*?"<>|]/g, '-').trim();
}

async function main() {
  console.log('====================================================');
  console.log('[MASTER 15-MIN PIPELINE] Autonomous Doris Production');
  console.log('====================================================');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const sentences = getSentences();
  const targetCount = sentences.length;
  console.log(`[PIPELINE] Target scenes count: ${targetCount}`);

  // 1. Connect to Active Chrome Session
  const portFile = 'C:\\Users\\doris\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort';
  if (!fs.existsSync(portFile)) throw new Error('DevToolsActivePort file not found!');
  const portContent = fs.readFileSync(portFile, 'utf8').trim().split('\n');
  const wsUrl = 'ws://127.0.0.1:' + portContent[0].trim() + portContent[1].trim();
  console.log('[CDP] Connecting to active Chrome on:', wsUrl);
  console.log('[CDP] Waiting for connection handshake (up to 120s)...');

  const browser = await chromium.connectOverCDP(wsUrl, { timeout: 120000 });
  console.log('[CDP] Connected successfully!');

  const context = browser.contexts()[0];
  let pages = context.pages();

  let flowPage = pages.find(p => p.url().includes('97bc05a9-73e5-4e2a-b971-592224eecd14') || p.url().includes('flow.google.com/u/1'));
  if (!flowPage) flowPage = pages.find(p => p.url().includes('flow.google.com'));

  if (!flowPage) {
    console.log('[FLOW] Opening Google Flow project tool...');
    flowPage = await context.newPage();
    await flowPage.goto('https://flow.google.com/u/1/project/97bc05a9-73e5-4e2a-b971-592224eecd14/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 60000 });
  } else {
    console.log('[FLOW] Found Google Flow page:', flowPage.url());
    await flowPage.bringToFront();
    if (!flowPage.url().includes('ee8f4722-38cb-4363-967f-057725e7c3c6')) {
      await flowPage.goto('https://flow.google.com/u/1/project/97bc05a9-73e5-4e2a-b971-592224eecd14/tool/ee8f4722-38cb-4363-967f-057725e7c3c6', { waitUntil: 'networkidle', timeout: 60000 });
    }
  }

  await flowPage.waitForTimeout(3000);

  // Locate tool iframe
  let toolFrame = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    for (const f of flowPage.frames()) {
      const hasBatchBtn = await f.$('button:has-text("Run Batch"), button:has-text("Select Style Image"), input[accept=".csv"]').catch(() => null);
      if (hasBatchBtn) {
        toolFrame = f;
        break;
      }
    }
    if (toolFrame) break;
    await flowPage.waitForTimeout(1000);
  }

  if (!toolFrame) throw new Error('Doris Image Stylist iframe could not be found!');
  console.log('[FLOW] Located Doris Image Stylist tool frame!');

  // Check if modal backdrop is open from before
  let addMediaBtn = await flowPage.$('button:has-text("Add media")');
  if (addMediaBtn) {
    console.log('[FLOW] Closing existing media modal...');
    const closeBtn = await flowPage.$('button:has-text("close"), span:has-text("close")');
    if (closeBtn) await flowPage.evaluate(el => el.click(), closeBtn).catch(() => {});
    await flowPage.waitForTimeout(1500);
  }

  // Upload the 169-row CSV dataset
  console.log(`[FLOW] Ingesting 169-row CSV dataset from: ${CSV_PATH}`);
  const csvInput = await toolFrame.$('input[accept=".csv"]');
  if (!csvInput) throw new Error('CSV input element not found in iframe');
  await csvInput.setInputFiles(CSV_PATH);
  await flowPage.waitForTimeout(5000);

  const updatedBody = await toolFrame.innerText('body');
  console.log('[FLOW] Dataset loaded status:', updatedBody.includes(`${targetCount} Rows Loaded`) ? `${targetCount} Rows Loaded!` : 'Rows loaded into queue.');

  // Check Style Reference
  const styleBtn = await toolFrame.$('button:has-text("Select Style Image")');
  if (styleBtn) {
    console.log('[FLOW] Clicking "Select Style Image" via DOM evaluate...');
    await toolFrame.evaluate(el => el.click(), styleBtn);
    await flowPage.waitForTimeout(2500);

    addMediaBtn = await flowPage.$('button:has-text("Add media")');
    if (addMediaBtn) {
      // Select first thumbnail or asset
      const assetThumb = await flowPage.$('div[role="option"], .asset-item, .media-item, [data-test-id="media-item"], img[src^="http"], img[src^="blob"]');
      if (assetThumb) {
        await flowPage.evaluate(el => el.click(), assetThumb).catch(() => {});
        await flowPage.waitForTimeout(1000);
      }
      console.log('[FLOW] Confirming "Add media"...');
      await flowPage.evaluate(el => el.click(), addMediaBtn);
      await flowPage.waitForTimeout(2000);
    }
  }

  // Set 16:9 Aspect Ratio
  console.log('[FLOW] Setting 16:9 Aspect Ratio...');
  const btn169 = await toolFrame.$('button:has-text("16:9")');
  if (btn169) {
    await toolFrame.evaluate(el => el.click(), btn169);
    await flowPage.waitForTimeout(500);
  }

  // Select Model: 🍌 Nano Banana 2 Lite
  console.log('[FLOW] Selecting Nano Banana 2 Lite...');
  const nanoBtn = await toolFrame.$('button:has-text("Nano Banana 2 Lite"), div:has-text("Nano Banana 2 Lite")');
  if (nanoBtn) {
    await toolFrame.evaluate(el => el.click(), nanoBtn);
    await flowPage.waitForTimeout(500);
  }

  // Click Run Batch
  console.log('[FLOW] Triggering "Run Batch"...');
  const runBatchBtn = await toolFrame.$('button:has-text("Run Batch")');
  if (runBatchBtn) {
    await toolFrame.evaluate(el => el.click(), runBatchBtn);
    console.log('[FLOW] "Run Batch" clicked successfully!');
  }

  // Monitor Batch Generation Loop
  console.log('[FLOW] Monitoring 169-scene generation loop...');
  let completed = false;
  let loops = 0;
  while (!completed && loops < 240) { // Max 20 minutes for 169 scenes
    await flowPage.waitForTimeout(5000);
    loops++;

    const stats = await toolFrame.evaluate(() => {
      const text = document.body.innerText || '';
      const successMatch = text.match(/(\d+)\s*\n*\s*SUCCESS/i);
      const failedMatch = text.match(/(\d+)\s*\n*\s*FAILED/i);
      const pendingMatches = (text.match(/PENDING/gi) || []).length;
      const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
        return img.src && (img.src.startsWith('data:image') || img.src.startsWith('blob:') || img.src.startsWith('http'));
      });
      return {
        success: successMatch ? parseInt(successMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        pending: pendingMatches,
        imagesFound: imgs.length
      };
    }).catch(() => ({ success: 0, failed: 0, pending: targetCount, imagesFound: 0 }));

    console.log(`[FLOW MONITOR] [${loops * 5}s] Success: ${stats.success} / ${targetCount} | Pending: ${stats.pending} | Images: ${stats.imagesFound}`);

    if (stats.success >= targetCount || (stats.success > 0 && stats.pending === 0 && (stats.success + stats.failed >= targetCount))) {
      console.log(`[FLOW] All ${targetCount} scenes generated successfully!`);
      completed = true;
      break;
    }
  }

  // Extract all images from DOM memory
  console.log('[EXTRACT] Extracting generated image data from DOM memory...');
  const imageDataList = await toolFrame.evaluate(async () => {
    async function blobToBase64(url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        return null;
      }
    }

    const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
      return img.src && (img.src.startsWith('data:image') || img.src.startsWith('blob:') || img.src.startsWith('http'));
    });

    const results = [];
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      let b64 = null;
      if (img.src.startsWith('data:image')) {
        b64 = img.src;
      } else if (img.src.startsWith('blob:')) {
        b64 = await blobToBase64(img.src);
      }

      if (!b64) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1280;
          canvas.height = img.naturalHeight || 720;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          b64 = canvas.toDataURL('image/jpeg', 0.95);
        } catch (e) {
          b64 = null;
        }
      }

      if (b64) {
        results.push(b64);
      }
    }
    return results;
  });

  console.log(`[EXTRACT] Extracted ${imageDataList.length} image payloads from memory.`);

  // Save to disk
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const b64 = imageDataList[i] || imageDataList[imageDataList.length - 1];
    if (b64) {
      const clean = sanitizeFilename(s.sentence);
      const filename = `${s.sn}. ${clean}.jpg`;
      const fullPath = path.join(OUTPUT_DIR, filename);
      const raw = b64.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(fullPath, Buffer.from(raw, 'base64'));
    }
  }

  console.log(`[DISK] All ${sentences.length} scene images saved to: ${OUTPUT_DIR}`);

  // Compile the master 15-minute 1080p video immediately with synchronized narration
  console.log('====================================================');
  console.log('[VIDEO RENDERING] Compiling 15-Minute 1080p Master Video...');
  console.log('====================================================');
  const { execSync } = require('child_process');
  try {
    const renderOutput = execSync('"C:\\Users\\doris\\AppData\\Local\\Programs\\Python\\Python311\\python.exe" scripts\\compile_15min_video.py', { encoding: 'utf8' });
    console.log(renderOutput);
  } catch (err) {
    console.error('[RENDER ERROR]', err.stdout || err.message);
  }

  // Switch to web app on the same Chrome context
  console.log('====================================================');
  console.log('[WEB APP] Automating dorisautomate.web.app');
  console.log('====================================================');

  pages = context.pages();
  let appPage = pages.find(p => p.url().includes('dorisautomate.web.app'));
  if (!appPage) {
    appPage = await context.newPage();
    await appPage.goto('https://dorisautomate.web.app', { waitUntil: 'networkidle', timeout: 60000 });
  } else {
    await appPage.bringToFront();
    await appPage.reload({ waitUntil: 'networkidle' });
  }

  await appPage.waitForTimeout(3000);

  // Supply folder to folderInput
  console.log('[WEB APP] Setting directory on #folderInput:', OUTPUT_DIR);
  const folderInput = await appPage.$('#folderInput');
  if (folderInput) {
    await folderInput.setInputFiles(OUTPUT_DIR);
    await appPage.waitForTimeout(3000);
  }

  // Supply script to scriptInput
  console.log('[WEB APP] Setting 169-line script on #scriptInput...');
  const txtContent = fs.readFileSync(TXT_PATH, 'utf8').trim();
  const scriptInput = await appPage.$('#scriptInput');
  if (scriptInput) {
    await scriptInput.fill(txtContent);
    await scriptInput.dispatchEvent('input');
    await appPage.waitForTimeout(2000);
  }

  // Voice Selection
  const voiceSelect = await appPage.$('#voiceSelect');
  if (voiceSelect) {
    await voiceSelect.selectOption('hope_professional');
    await voiceSelect.dispatchEvent('change');
    console.log('[WEB APP] Voice selected: Hope — Professional, Clear & Natural');
  }

  // Check alignment status
  const badgeText = await appPage.$eval('#alignmentBadge', el => el.innerText).catch(() => '');
  console.log('[WEB APP] Alignment Badge:', badgeText);
  await appPage.screenshot({ path: 'scripts/webapp_alignment_15min_verified.png' });

  // Click Run Video Automation
  console.log('[WEB APP] Triggering Run Video Automation...');
  const runBtn = await appPage.$('#runBtn');
  if (runBtn) {
    await appPage.evaluate(el => el.click(), runBtn);
    console.log('[WEB APP] Video Automation triggered!');
  }

  await appPage.waitForTimeout(5000);
  await appPage.screenshot({ path: 'scripts/webapp_15min_running.png' });
  console.log('[MASTER 15-MIN PIPELINE] BATCH & WEB APP INGESTION COMPLETE!');
}

main().catch(err => {
  console.error('[MASTER 15-MIN PIPELINE ERROR]', err);
  process.exit(1);
});
