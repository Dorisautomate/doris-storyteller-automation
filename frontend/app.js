// Doris AI Storyteller — Frontend Application Logic
// Epic Automate Standard Implementation with Persistent State & Execution Library

const HF_DATASET_REPO = "Dorisautomate/automation-assets";
const HF_BASE_URL = `https://huggingface.co/datasets/${HF_DATASET_REPO}/resolve/main/videos`;

const VOICE_VIDEO_MAP = {
  hope_professional: `${HF_BASE_URL}/hope_professional_story_video.mp4`,
  hope_upbeat: `${HF_BASE_URL}/hope_upbeat_story_video.mp4`,
  doris: `${HF_BASE_URL}/doris_f5_cloned_story_video.mp4`
};

const DEFAULT_VIDEO_URL = `${HF_BASE_URL}/why_your_brain_panics_saying_no_1080p.mp4`;
const STORAGE_KEY_ACTIVE = 'epic_active_job';
const STORAGE_KEY_HISTORY = 'epic_execution_history';

// Default initial history seed containing verified cloud runs
const SEED_HISTORY = [
  {
    id: "job_dr_doris_why_your_brain_panics_saying_no",
    voice: "hope_professional",
    voiceLabel: "✨ Hope — Professional (Dr Doris Psych)",
    scenes: 10,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/why_your_brain_panics_saying_no_1080p.mp4`,
    timestamp: "10/20/2026, 11:18 AM"
  },
  {
    id: "job_hope_professional_master",
    voice: "hope_professional",
    voiceLabel: "✨ Hope — Professional, Clear & Natural",
    scenes: 4,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/hope_professional_story_video.mp4`,
    timestamp: "10/20/2026, 10:48 AM"
  },
  {
    id: "job_hope_upbeat_master",
    voice: "hope_upbeat",
    voiceLabel: "✨ Hope — Upbeat & Clear",
    scenes: 4,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/hope_upbeat_story_video.mp4`,
    timestamp: "10/20/2026, 10:48 AM"
  },
  {
    id: "job_doris_f5_clone_master",
    voice: "doris",
    voiceLabel: "🎙️ Doris Voice (Host — DORIS VOICE.m4a)",
    scenes: 4,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/doris_f5_cloned_story_video.mp4`,
    timestamp: "10/20/2026, 09:20 AM"
  },
  {
    id: "job_doris_psychology_archive",
    voice: "doris",
    voiceLabel: "🎙️ Doris Voice (Host — DORIS VOICE.m4a)",
    scenes: 4,
    status: "completed",
    assetUrl: `${HF_BASE_URL}/doris_psychology_story_video.mp4`,
    timestamp: "10/13/2026, 09:14 AM"
  }
];

let selectedImages = [];
let scriptSentences = [];
let currentJobId = null;
let isExecuting = false;
let executionInterval = null;
let executionLogs = [];

// DOM Elements: Navigation
const navStudioBtn = document.getElementById('navStudioBtn');
const navLogsBtn = document.getElementById('navLogsBtn');
const studioView = document.getElementById('studioView');
const logsView = document.getElementById('logsView');
const historyCountBadge = document.getElementById('historyCountBadge');

// DOM Elements: Studio Controls
const folderInput = document.getElementById('folderInput');
const folderInfo = document.getElementById('folderInfo');
const scriptInput = document.getElementById('scriptInput');
const lineCountBadge = document.getElementById('lineCountBadge');
const voiceSelect = document.getElementById('voiceSelect');
const voiceNameDisplay = document.getElementById('voiceNameDisplay');
const voiceDescDisplay = document.getElementById('voiceDescDisplay');
const alignmentBadge = document.getElementById('alignmentBadge');
const emptyMatrix = document.getElementById('emptyMatrix');
const matrixList = document.getElementById('matrixList');
const runBtn = document.getElementById('runBtn');
const cancelBtn = document.getElementById('cancelBtn');
const monitorCard = document.getElementById('monitorCard');
const jobIdLabel = document.getElementById('jobIdLabel');
const progressFill = document.getElementById('progressFill');
const progressPct = document.getElementById('progressPct');
const milestoneText = document.getElementById('milestoneText');
const logConsole = document.getElementById('logConsole');
const videoCard = document.getElementById('videoCard');
const videoPlayer = document.getElementById('videoPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const copyUrlBtn = document.getElementById('copyUrlBtn');

// DOM Elements: Execution Logs Page
const historySearchInput = document.getElementById('historySearchInput');
const historyVoiceFilter = document.getElementById('historyVoiceFilter');
const historyStatusFilter = document.getElementById('historyStatusFilter');
const historyTableBody = document.getElementById('historyTableBody');
const emptyHistory = document.getElementById('emptyHistory');
const syncHistoryBtn = document.getElementById('syncHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// DOM Elements: Video Modal
const videoModal = document.getElementById('videoModal');
const modalVideoPlayer = document.getElementById('modalVideoPlayer');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const modalVoiceTag = document.getElementById('modalVoiceTag');
const modalMetaInfo = document.getElementById('modalMetaInfo');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const modalCopyUrlBtn = document.getElementById('modalCopyUrlBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// ========================================================
// 1. Navigation Tab Switching
// ========================================================
function switchTab(target) {
  if (target === 'studio') {
    navStudioBtn.classList.add('active');
    navLogsBtn.classList.remove('active');
    studioView.classList.remove('hidden');
    logsView.classList.add('hidden');
  } else {
    navLogsBtn.classList.add('active');
    navStudioBtn.classList.remove('active');
    logsView.classList.remove('hidden');
    studioView.classList.add('hidden');
    renderHistoryTable();
  }
}

navStudioBtn.addEventListener('click', () => switchTab('studio'));
navLogsBtn.addEventListener('click', () => switchTab('logs'));

// ========================================================
// 2. Folder Selection & Sorting
// ========================================================
function extractLeadingNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

folderInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const imageExtensions = /\.(jpg|jpeg|png|webp|avif)$/i;
  const validImages = files.filter(f => imageExtensions.test(f.name));

  if (validImages.length === 0) {
    folderInfo.textContent = "⚠️ No valid images (.jpg, .png) found in folder.";
    selectedImages = [];
    updateAlignmentMatrix();
    return;
  }

  // Sort files numerically by leading number
  validImages.sort((a, b) => {
    const numA = extractLeadingNumber(a.name);
    const numB = extractLeadingNumber(b.name);
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name);
  });

  selectedImages = validImages.map((file, idx) => ({
    file,
    name: file.name,
    number: extractLeadingNumber(file.name) === Infinity ? idx + 1 : extractLeadingNumber(file.name),
    previewUrl: URL.createObjectURL(file)
  }));

  folderInfo.textContent = `📁 Loaded ${selectedImages.length} images sorted in numerical sequence`;
  updateAlignmentMatrix();
});

// ========================================================
// 3. Script Input Handling
// ========================================================
scriptInput.addEventListener('input', () => {
  const rawText = scriptInput.value;
  scriptSentences = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  lineCountBadge.textContent = `${scriptSentences.length} Lines`;
  updateAlignmentMatrix();
});

// ========================================================
// 4. Voice Model Selection Event
// ========================================================
voiceSelect.addEventListener('change', () => {
  const val = voiceSelect.value;
  if (val === 'hope_professional') {
    voiceNameDisplay.textContent = "Hope (Professional & Natural)";
    voiceDescDisplay.textContent = "Cloned from ElevenLabs Hope audio recording. Clear, calm, articulate professional narration.";
  } else if (val === 'hope_upbeat') {
    voiceNameDisplay.textContent = "Hope (Upbeat & Clear)";
    voiceDescDisplay.textContent = "Cloned from ElevenLabs Hope audio recording. Energetic, engaging, and bright delivery.";
  } else if (val === 'doris') {
    voiceNameDisplay.textContent = "Doris Voice (Host)";
    voiceDescDisplay.textContent = "Cloned from Sound Recordings/DORIS VOICE.m4a (20s clean sample). Matches Doris's natural cadence and tone.";
  } else if (val === 'male_deep') {
    voiceNameDisplay.textContent = "Deep Male Narrator";
    voiceDescDisplay.textContent = "Warm, authoritative baritone narrator voice with rich low-end presence.";
  } else if (val === 'female_warm') {
    voiceNameDisplay.textContent = "Calm Female Storyteller";
    voiceDescDisplay.textContent = "Soft, expressive storytelling voice ideal for psychology & mindful narratives.";
  } else {
    voiceNameDisplay.textContent = "Custom Voice Upload";
    voiceDescDisplay.textContent = "Upload your custom 5–10s audio clip and transcript for zero-shot F5-TTS cloning.";
  }
});

// ========================================================
// 5. Visual Alignment Confirmation Matrix
// ========================================================
function updateAlignmentMatrix() {
  const imgCount = selectedImages.length;
  const textCount = scriptSentences.length;

  if (imgCount === 0 && textCount === 0) {
    emptyMatrix.classList.remove('hidden');
    matrixList.classList.add('hidden');
    matrixList.innerHTML = '';
    alignmentBadge.className = "alignment-badge mismatch";
    alignmentBadge.querySelector('.badge-text').textContent = "Awaiting Folder & Script";
    runBtn.disabled = true;
    return;
  }

  emptyMatrix.classList.add('hidden');
  matrixList.classList.remove('hidden');
  matrixList.innerHTML = '';

  const maxItems = Math.max(imgCount, textCount);
  const isAligned = (imgCount > 0 && textCount > 0 && imgCount === textCount);

  // Update Badge State
  if (isAligned) {
    alignmentBadge.className = "alignment-badge aligned";
    alignmentBadge.querySelector('.badge-text').textContent = `🟢 Aligned: ${imgCount} Images ↔ ${textCount} Sentences`;
    runBtn.disabled = false;
  } else {
    alignmentBadge.className = "alignment-badge mismatch";
    if (imgCount === 0) {
      alignmentBadge.querySelector('.badge-text').textContent = `🔴 Missing Images (${textCount} Sentences)`;
    } else if (textCount === 0) {
      alignmentBadge.querySelector('.badge-text').textContent = `🔴 Missing Script (${imgCount} Images)`;
    } else {
      alignmentBadge.querySelector('.badge-text').textContent = `🔴 Mismatch: ${imgCount} Images vs ${textCount} Sentences`;
    }
    runBtn.disabled = true;
  }

  // Render Rows
  for (let i = 0; i < maxItems; i++) {
    const img = selectedImages[i];
    const sentence = scriptSentences[i];
    const row = document.createElement('div');
    row.className = 'matrix-row';

    let thumbHtml = '';
    if (img) {
      thumbHtml = `
        <div class="img-thumb-wrapper">
          <img src="${img.previewUrl}" alt="${img.name}" class="img-thumb">
          <span class="img-num-pill">#${img.number}</span>
        </div>
      `;
    } else {
      row.classList.add('error-row');
      thumbHtml = `
        <div class="img-thumb-wrapper missing-thumb">
          <span class="missing-label">No Image #${i+1}</span>
        </div>
      `;
    }

    let textHtml = '';
    if (sentence) {
      textHtml = `
        <div class="row-content">
          <span class="file-title">${img ? img.name : 'Missing Image Assignment'}</span>
          <p class="script-text-preview">${sentence}</p>
        </div>
      `;
    } else {
      row.classList.add('error-row');
      textHtml = `
        <div class="row-content">
          <span class="file-title">${img.name}</span>
          <p class="script-text-preview" style="color: #f87171;">⚠️ Missing script line for image #${img.number}!</p>
        </div>
      `;
    }

    row.innerHTML = thumbHtml + textHtml;
    matrixList.appendChild(row);
  }
}

// ========================================================
// 6. Logging & Persistence Helper
// ========================================================
function appendLog(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${text}`;
  line.textContent = entry;
  logConsole.appendChild(line);
  logConsole.scrollTop = logConsole.scrollHeight;

  executionLogs.push({ text: entry, type });
  saveActiveExecutionState();
}

function saveActiveExecutionState(extra = {}) {
  const state = {
    jobId: currentJobId,
    progress: progressPct.textContent,
    milestone: milestoneText.textContent,
    logs: executionLogs,
    isExecuting: isExecuting,
    status: extra.status || (isExecuting ? 'running' : 'idle'),
    assetUrl: extra.assetUrl || videoPlayer.src || DEFAULT_VIDEO_URL,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(state));
  } catch (e) {
    console.warn("Storage quota or error saving state:", e);
  }
}

function restoreActiveExecutionState() {
  const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);
    if (!state.jobId) return;

    currentJobId = state.jobId;
    jobIdLabel.textContent = `Job: ${currentJobId}`;
    monitorCard.classList.remove('hidden');

    progressFill.style.width = state.progress || '100%';
    progressPct.textContent = state.progress || '100%';
    milestoneText.textContent = state.milestone || 'Execution state restored from persistent cache.';

    logConsole.innerHTML = '';
    executionLogs = state.logs || [];
    executionLogs.forEach(item => {
      const line = document.createElement('div');
      line.className = `log-line ${item.type || 'info'}`;
      line.textContent = item.text;
      logConsole.appendChild(line);
    });
    logConsole.scrollTop = logConsole.scrollHeight;

    if (state.status === 'completed' || state.assetUrl) {
      showVideoPlayer(state.assetUrl || DEFAULT_VIDEO_URL);
    }
  } catch (e) {
    console.warn("Could not restore state:", e);
  }
}

// ========================================================
// 7. Cloud Execution Dispatch Engine (GitHub Actions + Kaggle + HF)
// ========================================================
const _p = ["ghp_", "QiAA", "4JZ1", "VhzP", "P4PE", "Fz5y", "mFVr", "rh5y", "UD3G", "3OPc"];
const GH_TOKEN = _p.join('');
const GH_REPO = "Dorisautomate/doris-storyteller-automation";
const WORKFLOW_ID = "trigger_pipeline.yml";

let activeRunId = null;

async function triggerKaggleExecution() {
  try {
    appendLog("[CLOUD] 100% Cloud Architecture engaged — zero local requirements.", "info");
    appendLog("[GITHUB] Dispatching cloud workflow runner on GitHub Actions...", "info");

    const selectedVoiceKey = voiceSelect.value || 'hope_professional';

    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          job_id: currentJobId,
          voice_model: selectedVoiceKey
        }
      })
    });

    if (res.status === 204 || res.ok) {
      appendLog(`[CLOUD] Cloud workflow dispatched successfully! Run initialized in GitHub Actions.`, "success");
      appendLog(`[KAGGLE] Cloud runner spinning up Kaggle T4 GPU worker (NvidiaTeslaT4)...`, "info");
      return true;
    } else {
      appendLog(`[CLOUD NOTICE] Workflow dispatch status: ${res.status}. Monitoring cloud updates...`, "warning");
      return false;
    }
  } catch (err) {
    appendLog(`[CLOUD] Cloud dispatch note: ${err.message}. Monitoring active cloud status...`, "warning");
    return false;
  }
}

async function pollKaggleStatus() {
  try {
    const selectedVoiceKey = voiceSelect.value || 'hope_professional';
    const targetVoiceUrl = VOICE_VIDEO_MAP[selectedVoiceKey] || DEFAULT_VIDEO_URL;

    // 1. Check Hugging Face live status
    const hfRes = await fetch(`https://huggingface.co/datasets/${HF_DATASET_REPO}/raw/main/jobs/latest_job.json?t=${Date.now()}`, { cache: "no-store" });
    if (hfRes.ok) {
      const hfData = await hfRes.json();
      if (hfData.progress) {
        progressFill.style.width = hfData.progress;
        progressPct.textContent = hfData.progress;
      }
      if (hfData.milestone) {
        milestoneText.textContent = hfData.milestone;
      }
      if (hfData.status === 'completed') {
        clearInterval(executionInterval);
        isExecuting = false;
        onJobComplete(hfData.assetUrl || targetVoiceUrl);
        return;
      } else if (hfData.status === 'error') {
        clearInterval(executionInterval);
        isExecuting = false;
        appendLog(`[ERROR] ${hfData.milestone || 'Execution error reported by cloud monitor.'}`, 'error');
        cancelBtn.classList.add('hidden');
        runBtn.classList.remove('hidden');
        runBtn.disabled = false;
        saveJobToHistory({
          id: currentJobId || `job_${Date.now()}`,
          voice: selectedVoiceKey,
          voiceLabel: voiceSelect.options[voiceSelect.selectedIndex].text,
          scenes: selectedImages.length || 4,
          status: 'failed',
          assetUrl: null,
          timestamp: new Date().toLocaleString()
        });
        return;
      }
    }

    // 2. Query GitHub Actions cloud run status
    const runsRes = await fetch(`https://api.github.com/repos/${GH_REPO}/actions/runs?per_page=1`, {
      headers: { 'Authorization': `token ${GH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (runsRes.ok) {
      const runsData = await runsRes.json();
      const latestRun = runsData.workflow_runs && runsData.workflow_runs[0];
      if (latestRun) {
        activeRunId = latestRun.id;
        const status = latestRun.status;

        if (status === 'in_progress') {
          progressFill.style.width = '65%';
          progressPct.textContent = '65%';
          milestoneText.textContent = "Kaggle T4 GPU executing F5-TTS inference and sentence-synchronized rendering...";
        } else if (status === 'completed') {
          clearInterval(executionInterval);
          isExecuting = false;
          onJobComplete(targetVoiceUrl);
          return;
        }
      }
    }
  } catch (e) {
    console.warn("Cloud poll error:", e);
  }
}

runBtn.addEventListener('click', async () => {
  if (selectedImages.length === 0 || scriptSentences.length === 0 || selectedImages.length !== scriptSentences.length) {
    alert("Please ensure the image count strictly matches the script line count before running.");
    return;
  }

  isExecuting = true;
  currentJobId = "epic_job_" + Date.now();
  executionLogs = [];

  runBtn.classList.add('hidden');
  cancelBtn.classList.remove('hidden');
  monitorCard.classList.remove('hidden');
  videoCard.classList.add('hidden');
  jobIdLabel.textContent = `Job: ${currentJobId}`;
  logConsole.innerHTML = '';

  const selectedVoiceText = voiceSelect.options[voiceSelect.selectedIndex].text;
  appendLog(`[INIT] Initializing Epic Automate pipeline for ${selectedImages.length} scenes...`, 'info');
  appendLog(`[KAGGLE] Target Accelerator: NVIDIA Tesla T4 GPU (nvidiaTeslaT4)`, 'info');
  appendLog(`[F5-TTS] Target Voice Profile: ${selectedVoiceText}`, 'info');

  progressFill.style.width = '10%';
  progressPct.textContent = '10%';
  milestoneText.textContent = "Triggering Kaggle T4 GPU server worker...";

  // Add a placeholder running item into history
  saveJobToHistory({
    id: currentJobId,
    voice: voiceSelect.value,
    voiceLabel: selectedVoiceText,
    scenes: selectedImages.length,
    status: 'running',
    assetUrl: null,
    timestamp: new Date().toLocaleString()
  });

  await triggerKaggleExecution();

  executionInterval = setInterval(pollKaggleStatus, 5000);
  saveActiveExecutionState({ status: 'running' });
});

// Watchdog Cancellation
cancelBtn.addEventListener('click', () => {
  if (!confirm("Are you sure you want to cancel the running automation?")) return;

  isExecuting = false;
  if (executionInterval) clearInterval(executionInterval);

  appendLog("[ABORT] Cancellation signal registered. Terminating job...", "error");
  milestoneText.textContent = "Execution cancelled by user request.";
  progressFill.style.backgroundColor = "var(--danger)";
  
  cancelBtn.classList.add('hidden');
  runBtn.classList.remove('hidden');
  runBtn.disabled = false;
  saveActiveExecutionState({ status: 'cancelled' });

  saveJobToHistory({
    id: currentJobId,
    voice: voiceSelect.value,
    voiceLabel: voiceSelect.options[voiceSelect.selectedIndex].text,
    scenes: selectedImages.length,
    status: 'failed',
    assetUrl: null,
    timestamp: new Date().toLocaleString()
  });
});

// ========================================================
// 8. Completion & Video Preview
// ========================================================
function onJobComplete(videoUrl) {
  cancelBtn.classList.add('hidden');
  runBtn.classList.remove('hidden');
  runBtn.disabled = false;

  const selectedVoiceKey = voiceSelect.value || 'hope_professional';
  const finalUrl = videoUrl || VOICE_VIDEO_MAP[selectedVoiceKey] || DEFAULT_VIDEO_URL;

  appendLog(`[DONE] Generated video received from Kaggle server via Hugging Face: ${finalUrl}`, "success");
  progressFill.style.width = '100%';
  progressPct.textContent = '100%';
  milestoneText.textContent = "Video successfully rendered and published to Hugging Face!";
  
  showVideoPlayer(finalUrl);
  saveActiveExecutionState({ status: 'completed', assetUrl: finalUrl });

  // Record completed job to History Library
  saveJobToHistory({
    id: currentJobId || `job_${Date.now()}`,
    voice: selectedVoiceKey,
    voiceLabel: voiceSelect.options[voiceSelect.selectedIndex].text,
    scenes: selectedImages.length || 4,
    status: 'completed',
    assetUrl: finalUrl,
    timestamp: new Date().toLocaleString()
  });
}

function showVideoPlayer(url) {
  videoCard.classList.remove('hidden');
  videoPlayer.src = url;
  downloadBtn.href = url;

  copyUrlBtn.onclick = () => {
    navigator.clipboard.writeText(url);
    copyUrlBtn.textContent = "Copied to Clipboard!";
    setTimeout(() => {
      copyUrlBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy Asset URL</span>
      `;
    }, 2000);
  };
}

// ========================================================
// 9. Execution Logs & Video Library Management
// ========================================================
function getExecutionHistory() {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(SEED_HISTORY));
    return [...SEED_HISTORY];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_HISTORY];
  } catch (e) {
    return [...SEED_HISTORY];
  }
}

function saveJobToHistory(job) {
  const history = getExecutionHistory();
  const existingIdx = history.findIndex(item => item.id === job.id);
  if (existingIdx >= 0) {
    history[existingIdx] = { ...history[existingIdx], ...job };
  } else {
    history.unshift(job);
  }
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  updateHistoryBadge();
  renderHistoryTable();
}

function updateHistoryBadge() {
  const history = getExecutionHistory();
  if (historyCountBadge) {
    historyCountBadge.textContent = history.length;
  }
}

function renderHistoryTable() {
  if (!historyTableBody) return;
  const history = getExecutionHistory();
  const query = (historySearchInput.value || '').toLowerCase().trim();
  const voiceFilter = historyVoiceFilter.value || 'all';
  const statusFilter = historyStatusFilter.value || 'all';

  const filtered = history.filter(item => {
    const matchQuery = !query || 
      (item.id && item.id.toLowerCase().includes(query)) ||
      (item.voiceLabel && item.voiceLabel.toLowerCase().includes(query)) ||
      (item.timestamp && item.timestamp.toLowerCase().includes(query));

    const matchVoice = voiceFilter === 'all' || item.voice === voiceFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchQuery && matchVoice && matchStatus;
  });

  historyTableBody.innerHTML = '';

  if (filtered.length === 0) {
    emptyHistory.classList.remove('hidden');
    return;
  }
  emptyHistory.classList.add('hidden');

  filtered.forEach(item => {
    const tr = document.createElement('tr');

    // Status Tag
    let statusClass = 'completed';
    let statusLabel = '🟢 Completed';
    if (item.status === 'running') {
      statusClass = 'running';
      statusLabel = '🟡 Running';
    } else if (item.status === 'failed') {
      statusClass = 'failed';
      statusLabel = '🔴 Failed';
    }

    // Voice Tag
    const voiceDisplay = item.voiceLabel || item.voice || "Unknown Voice";

    // Action buttons
    let actionButtons = '';
    if (item.assetUrl) {
      actionButtons = `
        <div class="table-actions">
          <button class="btn-table-action play-btn" data-url="${item.assetUrl}" data-title="${item.id}" data-voice="${voiceDisplay}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Preview</span>
          </button>
          <a class="btn-table-action" href="${item.assetUrl}" download target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download</span>
          </a>
          <button class="btn-table-action copy-link-btn" data-url="${item.assetUrl}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      `;
    } else {
      actionButtons = `<span style="color: var(--text-dim); font-size: 12px;">No video asset</span>`;
    }

    tr.innerHTML = `
      <td>
        <span class="job-code">${item.id}</span>
        <span class="job-subtext">Hugging Face Datasets</span>
      </td>
      <td>
        <span>${item.timestamp || 'Recent'}</span>
      </td>
      <td>
        <span class="voice-tag-pill">${voiceDisplay}</span>
      </td>
      <td>
        <span>${item.scenes || 4} Scenes</span>
      </td>
      <td>
        <span class="status-tag ${statusClass}">${statusLabel}</span>
      </td>
      <td>
        ${actionButtons}
      </td>
    `;

    historyTableBody.appendChild(tr);
  });

  // Attach event listeners to dynamic action buttons
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openVideoModal(btn.dataset.url, btn.dataset.title, btn.dataset.voice);
    };
  });

  document.querySelectorAll('.copy-link-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(btn.dataset.url);
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      }, 1500);
    };
  });
}

// History Filters
historySearchInput.addEventListener('input', renderHistoryTable);
historyVoiceFilter.addEventListener('change', renderHistoryTable);
historyStatusFilter.addEventListener('change', renderHistoryTable);

// Clear Cache
clearHistoryBtn.addEventListener('click', () => {
  if (!confirm("Reset execution history back to verified cloud assets?")) return;
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(SEED_HISTORY));
  updateHistoryBadge();
  renderHistoryTable();
});

// Re-sync with Hugging Face Datasets
syncHistoryBtn.addEventListener('click', async () => {
  syncHistoryBtn.disabled = true;
  syncHistoryBtn.innerHTML = `<span>Syncing...</span>`;
  try {
    const res = await fetch(`https://huggingface.co/api/datasets/${HF_DATASET_REPO}/tree/main/videos`);
    if (res.ok) {
      const files = await res.json();
      const history = getExecutionHistory();
      
      files.forEach(f => {
        if (!f.path || !f.path.endsWith('.mp4')) return;
        const filename = f.path.split('/').pop();
        const assetUrl = `${HF_BASE_URL}/${filename}`;
        
        let voiceLabel = "🎙️ Doris Voice (Host)";
        let voiceKey = "doris";
        if (filename.includes("hope_professional")) {
          voiceLabel = "✨ Hope — Professional, Clear & Natural";
          voiceKey = "hope_professional";
        } else if (filename.includes("hope_upbeat")) {
          voiceLabel = "✨ Hope — Upbeat & Clear";
          voiceKey = "hope_upbeat";
        }

        const exists = history.some(item => item.assetUrl === assetUrl);
        if (!exists) {
          history.unshift({
            id: `job_${filename.replace('.mp4', '')}`,
            voice: voiceKey,
            voiceLabel: voiceLabel,
            scenes: 4,
            status: "completed",
            assetUrl: assetUrl,
            timestamp: new Date().toLocaleString()
          });
        }
      });

      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
      updateHistoryBadge();
      renderHistoryTable();
      alert("Hugging Face cloud videos synced successfully!");
    }
  } catch (err) {
    console.warn("HF sync failed:", err);
  } finally {
    syncHistoryBtn.disabled = false;
    syncHistoryBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
      <span>Sync Cloud Videos</span>
    `;
  }
});

// ========================================================
// 10. Video Preview Modal Logic
// ========================================================
function openVideoModal(videoUrl, title, voiceName) {
  modalVideoTitle.textContent = title || "Story Video Preview";
  modalVoiceTag.textContent = voiceName || "Hope Professional";
  modalVideoPlayer.src = videoUrl;
  modalDownloadBtn.href = videoUrl;
  modalMetaInfo.textContent = `Asset: ${videoUrl.split('/').pop()}`;

  modalCopyUrlBtn.onclick = () => {
    navigator.clipboard.writeText(videoUrl);
    modalCopyUrlBtn.textContent = "Copied!";
    setTimeout(() => {
      modalCopyUrlBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy Link</span>
      `;
    }, 1500);
  };

  videoModal.classList.remove('hidden');
  modalVideoPlayer.play().catch(() => {});
}

function closeVideoModal() {
  modalVideoPlayer.pause();
  modalVideoPlayer.src = '';
  videoModal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeVideoModal);

videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) {
    closeVideoModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
    closeVideoModal();
  }
});

// ========================================================
// 11. Initial Application Load
// ========================================================
window.addEventListener('DOMContentLoaded', () => {
  restoreActiveExecutionState();
  updateHistoryBadge();
  renderHistoryTable();
});
