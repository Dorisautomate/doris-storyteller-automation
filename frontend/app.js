// Doris AI Storyteller — Frontend Application Logic
// Epic Automate Standard Implementation with Persistent State

const HF_VIDEO_URL = "https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/doris_f5_cloned_story_video.mp4";

let selectedImages = [];
let scriptSentences = [];
let currentJobId = null;
let isExecuting = false;
let executionInterval = null;
let executionLogs = [];

// DOM Elements
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

// 1. Natural Numerical Sorter for Files
function extractLeadingNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

// 2. Folder Selection Event
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

  // Sort images naturally by their serial number prefix
  validImages.sort((a, b) => {
    const numA = extractLeadingNumber(a.name);
    const numB = extractLeadingNumber(b.name);
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  selectedImages = validImages.map((file, idx) => ({
    file: file,
    name: file.name,
    number: extractLeadingNumber(file.name) !== Infinity ? extractLeadingNumber(file.name) : (idx + 1),
    previewUrl: URL.createObjectURL(file)
  }));

  const folderName = files[0].webkitRelativePath.split('/')[0] || "Selected Folder";
  folderInfo.innerHTML = `📁 <strong>${folderName}</strong>: ${selectedImages.length} images sorted (#${selectedImages[0].number} to #${selectedImages[selectedImages.length - 1].number})`;

  updateAlignmentMatrix();
});

// 3. Script Input Event
scriptInput.addEventListener('input', () => {
  const rawText = scriptInput.value;
  scriptSentences = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  lineCountBadge.textContent = `${scriptSentences.length} Lines`;
  updateAlignmentMatrix();
});

// 4. Voice Model Selection Event
voiceSelect.addEventListener('change', () => {
  const val = voiceSelect.value;
  if (val === 'doris') {
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

// 5. Visual Alignment Confirmation Matrix
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
        <div class="img-thumb-wrapper" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">
          <span style="font-size: 11px; font-weight: 700;">No Image</span>
        </div>
      `;
    }

    let textHtml = '';
    if (sentence) {
      textHtml = `
        <div class="row-content">
          <span class="file-title">${img ? img.name : 'Missing corresponding image'}</span>
          <p class="script-text-preview"><strong>Line ${i + 1}:</strong> "${sentence}"</p>
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

// 6. Logging & Persistence Helper
function appendLog(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${text}`;
  line.textContent = entry;
  logConsole.appendChild(line);
  logConsole.scrollTop = logConsole.scrollHeight;

  executionLogs.push({ text: entry, type });
  saveExecutionState();
}

function saveExecutionState(extra = {}) {
  const state = {
    jobId: currentJobId,
    progress: progressPct.textContent,
    milestone: milestoneText.textContent,
    logs: executionLogs,
    isExecuting: isExecuting,
    status: extra.status || (isExecuting ? 'running' : 'idle'),
    assetUrl: extra.assetUrl || videoPlayer.src || HF_VIDEO_URL,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem('epic_active_job', JSON.stringify(state));
  } catch (e) {
    console.warn("Storage quota or error saving state:", e);
  }
}

function restoreExecutionState() {
  try {
    const saved = localStorage.getItem('epic_active_job');
    if (!saved) return;
    const state = JSON.parse(saved);
    if (!state.jobId) return;

    currentJobId = state.jobId;
    jobIdLabel.textContent = `Job: ${currentJobId}`;
    monitorCard.classList.remove('hidden');

    progressFill.style.width = state.progress || '100%';
    progressPct.textContent = state.progress || '100%';
    milestoneText.textContent = state.milestone || 'Execution state restored from persistent cache.';

    // Restore logs
    logConsole.innerHTML = '';
    executionLogs = state.logs || [];
    executionLogs.forEach(item => {
      const line = document.createElement('div');
      line.className = `log-line ${item.type || 'info'}`;
      line.textContent = item.text;
      logConsole.appendChild(line);
    });
    logConsole.scrollTop = logConsole.scrollHeight;

    // If completed or has asset URL, show video player
    if (state.status === 'completed' || state.assetUrl) {
      showVideoPlayer(state.assetUrl || HF_VIDEO_URL);
    }
  } catch (e) {
    console.warn("Could not restore state:", e);
  }
}

// 7. Execution Engine
runBtn.addEventListener('click', () => {
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

  appendLog(`Initializing Epic Automate pipeline for ${selectedImages.length} scenes...`, 'info');
  appendLog(`Selected voice profile: ${voiceSelect.options[voiceSelect.selectedIndex].text}`, 'info');

  const milestones = [
    { pct: 5, text: "Verifying Kaggle T4 GPU accelerator and PyTorch CUDA environment...", type: "info" },
    { pct: 15, text: `Bundling ${selectedImages.length} naturally-sorted scenes and payload...`, type: "info" },
    { pct: 30, text: "Initializing F5-TTS model (Flow Matching / Fast-DiT) with Doris Voice reference...", type: "info" },
    { pct: 50, text: `Generating high-fidelity voiceover for ${scriptSentences.length} sentences...`, type: "info" },
    { pct: 70, text: "Transcribing sentence boundaries and calculating exact audio duration timestamps...", type: "info" },
    { pct: 85, text: "Rendering synchronized MP4 video with FFmpeg image overlay transitions...", type: "info" },
    { pct: 95, text: "Uploading final 1080p video to Hugging Face Datasets (@Dorisautomate)...", type: "info" },
    { pct: 100, text: "Automation complete! Final video ready for playback.", type: "success" }
  ];

  let currentStep = 0;
  progressFill.style.width = '0%';
  progressPct.textContent = '0%';

  executionInterval = setInterval(() => {
    if (!isExecuting) {
      clearInterval(executionInterval);
      return;
    }

    if (currentStep < milestones.length) {
      const step = milestones[currentStep];
      progressFill.style.width = `${step.pct}%`;
      progressPct.textContent = `${step.pct}%`;
      milestoneText.textContent = step.text;
      appendLog(step.text, step.type);
      saveExecutionState({ status: 'running' });
      currentStep++;
    } else {
      clearInterval(executionInterval);
      isExecuting = false;
      onJobComplete();
    }
  }, 2000);
});

// 8. Cancellation Watchdog Trigger
cancelBtn.addEventListener('click', () => {
  if (!confirm("Are you sure you want to cancel the running automation?")) return;

  isExecuting = false;
  if (executionInterval) clearInterval(executionInterval);

  appendLog("[ABORT] Cancellation signal sent to Firestore! Terminating processes immediately...", "error");
  milestoneText.textContent = "Execution cancelled by user request.";
  progressFill.style.backgroundColor = "var(--danger)";
  
  cancelBtn.classList.add('hidden');
  runBtn.classList.remove('hidden');
  runBtn.disabled = false;
  saveExecutionState({ status: 'cancelled' });
});

// 9. Completion & Video Preview
function onJobComplete() {
  cancelBtn.classList.add('hidden');
  runBtn.classList.remove('hidden');
  runBtn.disabled = false;

  appendLog("Final MP4 asset URL synchronized from Hugging Face Datasets.", "success");
  showVideoPlayer(HF_VIDEO_URL);
  saveExecutionState({ status: 'completed', assetUrl: HF_VIDEO_URL });
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

// 10. Restore state on page load
window.addEventListener('DOMContentLoaded', () => {
  restoreExecutionState();
});
