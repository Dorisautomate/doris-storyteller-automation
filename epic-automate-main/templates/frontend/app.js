// Epic Automate - Frontend Logic with Real-Time Firestore Synchronization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Replace with your project's Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const form = document.getElementById("triggerForm");
const jobTitleInput = document.getElementById("jobTitle");
const jobPayloadInput = document.getElementById("jobPayload");
const btnLaunch = document.getElementById("btnLaunch");
const btnCancel = document.getElementById("btnCancel");
const statusLabel = document.getElementById("statusLabel");
const milestoneText = document.getElementById("milestoneText");
const progressPct = document.getElementById("progressPct");
const progressBarFill = document.getElementById("progressBarFill");
const logConsole = document.getElementById("logConsole");
const btnClearLog = document.getElementById("btnClearLog");
const outputCard = document.getElementById("outputCard");
const assetUrlInput = document.getElementById("assetUrlInput");
const btnCopyUrl = document.getElementById("btnCopyUrl");
const videoPlayer = document.getElementById("videoPlayer");
const audioPlayer = document.getElementById("audioPlayer");

let currentJobId = null;
let unsubscribeSnapshot = null;

function appendLog(message, type = "info") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
  logConsole.scrollTop = logConsole.scrollHeight;
}

btnClearLog.addEventListener("click", () => {
  logConsole.innerHTML = "";
});

btnCopyUrl.addEventListener("click", () => {
  if (assetUrlInput.value) {
    navigator.clipboard.writeText(assetUrlInput.value);
    const originalText = btnCopyUrl.textContent;
    btnCopyUrl.textContent = "✅ Copied!";
    setTimeout(() => { btnCopyUrl.textContent = originalText; }, 2000);
  }
});

// Launch Job Handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  currentJobId = "job_" + Date.now();
  appendLog(`Creating job ${currentJobId}: "${jobTitleInput.value}"...`, "system");
  
  btnLaunch.disabled = true;
  btnCancel.disabled = false;
  statusLabel.textContent = "Launching";
  outputCard.style.display = "none";
  videoPlayer.style.display = "none";
  audioPlayer.style.display = "none";

  try {
    const jobDocRef = doc(db, "automations", currentJobId);
    await setDoc(jobDocRef, {
      job_id: currentJobId,
      title: jobTitleInput.value,
      payload: jobPayloadInput.value,
      progress: 0,
      current_milestone: "Job queued for Kaggle T4 execution...",
      status: "queued",
      cancel_requested: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    appendLog(`Job successfully dispatched to Firestore. Waiting for Kaggle worker...`, "system");
    subscribeToJob(currentJobId);
  } catch (err) {
    appendLog(`Error launching job: ${err.message}`, "error");
    btnLaunch.disabled = false;
    btnCancel.disabled = true;
  }
});

// Cancel Job Handler
btnCancel.addEventListener("click", async () => {
  if (!currentJobId) return;
  
  if (confirm("Are you sure you want to cancel this running automation?")) {
    appendLog("Sending immediate cancellation signal to Kaggle worker...", "warning");
    try {
      const jobDocRef = doc(db, "automations", currentJobId);
      await updateDoc(jobDocRef, {
        cancel_requested: true,
        status: "cancelled",
        current_milestone: "Cancellation requested by user."
      });
      btnCancel.disabled = true;
    } catch (err) {
      appendLog(`Failed to send cancel signal: ${err.message}`, "error");
    }
  }
});

// Real-Time Firestore Snapshot Listener
function subscribeToJob(jobId) {
  if (unsubscribeSnapshot) unsubscribeSnapshot();

  const jobDocRef = doc(db, "automations", jobId);
  unsubscribeSnapshot = onSnapshot(jobDocRef, (docSnap) => {
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const progress = data.progress || 0;
    const milestone = data.current_milestone || "Processing...";
    const status = data.status || "running";

    // Update Progress UI
    progressPct.textContent = `${progress}%`;
    progressBarFill.style.width = `${progress}%`;
    milestoneText.textContent = milestone;
    statusLabel.textContent = status.toUpperCase();

    appendLog(`[${status.toUpperCase()}] ${milestone}`);

    // Handle Finished States
    if (status === "completed") {
      btnLaunch.disabled = false;
      btnCancel.disabled = true;
      statusLabel.textContent = "Completed";
      appendLog("🎉 Automation completed successfully!", "success");

      if (data.asset_url) {
        outputCard.style.display = "block";
        assetUrlInput.value = data.asset_url;
        
        // Render Web Media Preview
        if (data.asset_type === "video" || data.asset_url.endsWith(".mp4")) {
          videoPlayer.src = data.asset_url;
          videoPlayer.style.display = "block";
          videoPlayer.load();
        } else if (data.asset_type === "audio" || data.asset_url.endsWith(".mp3") || data.asset_url.endsWith(".wav")) {
          audioPlayer.src = data.asset_url;
          audioPlayer.style.display = "block";
          audioPlayer.load();
        }
      }
    } else if (status === "failed" || status === "cancelled") {
      btnLaunch.disabled = false;
      btnCancel.disabled = true;
      if (status === "cancelled") {
        progressBarFill.style.backgroundColor = "#ef4444";
        appendLog("⏹ Job execution stopped by user.", "warning");
      }
    }
  });
}
