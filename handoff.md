# Epic Automate Project Handoff

> **Note for Subsequent Agents**: This document tracks the real-time operational status, architectural bindings, credentials status, and incremental modifications for this automation project. Update this document after every major change.

---

## 1. Project Identity & Architecture
- **Project Name**: Doris AI Storyteller & Sentence-Synchronized Video Automation
- **Date Created**: 2026-10-13
- **Last Modified**: 2026-10-20 10:55
- **Modus Operandi**: `epic-automate` (100% Live Cloud Deployment)
  - **Frontend**: Live on Firebase Hosting (`https://dorisautomate.web.app`) — accessible globally from any browser or device.
  - **Tabs & Views**:
    - **Studio / Generator**: Step-by-step studio with image selector, multi-voice picker, script alignment matrix, and live execution monitor.
    - **Execution Logs & Video Library**: Dedicated dashboard tab with full history table of past runs, search/filter controls, direct video preview modal, download buttons, and Hugging Face cloud sync.
  - **Default Voice Model**: `✨ Hope — Professional, Clear & Natural` (cloned from ElevenLabs reference audio). Hope Upbeat and Doris Voice available.
  - **Cloud Orchestration**: GitHub Actions Cloud (`.github/workflows/trigger_pipeline.yml`) with state change monitoring (prevents HF commit rate limits).
  - **Compute Server**: Kaggle T4 GPU (`dorisautomate/doris-storyteller-worker` Kernel Version 10).
  - **Asset Storage & Playback**: Hugging Face Datasets (`Dorisautomate/automation-assets`) with embedded HTML5 video preview player.
  - **Version Control**: GitHub repository (`https://github.com/Dorisautomate/doris-storyteller-automation`).

---

## 2. Infrastructure Endpoints & Identifiers
| Service | Resource | Identifier / URL | Status |
|---|---|---|---|
| **Firebase Hosting** | Web Frontend | `https://dorisautomate.web.app` | 🟢 100% Live (Studio + Execution Logs Tabs) |
| **Cloud Orchestrator** | GitHub Actions | `https://github.com/Dorisautomate/doris-storyteller-automation/actions` | 🟢 Cloud Workflow Verified (Multi-Voice Support) |
| **Kaggle Kernel** | T4 GPU Worker | `https://www.kaggle.com/code/dorisautomate/doris-storyteller-worker` | 🟢 Kernel v10 Deployed |
| **Hugging Face Datasets** | Asset Storage | `https://huggingface.co/datasets/Dorisautomate/automation-assets` | 🟢 Active (Hope & Doris Voice Slices & MP4s Stored) |
| **Master Video (Hope Professional)** | 1080p MP4 | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/hope_professional_story_video.mp4` | 🟢 Verified & Playing |
| **Master Video (Hope Upbeat)** | 1080p MP4 | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/hope_upbeat_story_video.mp4` | 🟢 Verified & Playing |
| **Master Video (Doris Voice Clone)** | 1080p MP4 | `https://huggingface.co/datasets/Dorisautomate/automation-assets/resolve/main/videos/doris_f5_cloned_story_video.mp4` | 🟢 Verified & Playing |
| **GitHub Repository** | Source Code | `https://github.com/Dorisautomate/doris-storyteller-automation` | 🟢 Synced |

---

## 3. Credentials & Secrets Audit
- [x] **GitHub PAT**: Verified as `@Dorisautomate` (`GITHUB_TOKEN`) with workflow dispatch permissions.
- [x] **GitHub Action Secrets**: Encrypted repository secrets configured for `KAGGLE_API_TOKEN` and `HF_TOKEN`.
- [x] **Hugging Face Token**: Verified as `@Dorisautomate` with write role (`HF_TOKEN`).
- [x] **Kaggle API**: Verified as `@Dorisautomate` with `KAGGLE_API_TOKEN`.
- [x] **Firebase Authentication**: Active session in Firebase CLI for project `dorisautomate`.

---

## 4. Key Architectural Achievements (100% Cloud Hosting)
1. **Zero Local Dependencies**:
   - The user or any public visitor can open `https://dorisautomate.web.app` from their phone, tablet, or another computer. The user's local machine does not need to be running.
2. **Cloud Dispatch Pipeline**:
   - The "Run Execution" button dispatches `.github/workflows/trigger_pipeline.yml` in GitHub's cloud environment.
   - GitHub Actions installs Kaggle CLI, authenticates via encrypted repository secrets, and pushes the worker kernel to Kaggle's T4 GPU accelerator (`--accelerator NvidiaTeslaT4`).
3. **Kaggle Compute & Media Stitching**:
   - The Kaggle worker downloads the Doris voice reference audio, scene images, loads F5-TTS, synthesizes audio line-by-line, and compiles the video with FFmpeg.
   - The output is automatically uploaded to Hugging Face Datasets `Dorisautomate/automation-assets`.
4. **Live Frontend Preview**:
   - The web app monitors cloud status in real-time and embeds the final video directly into the HTML5 video player. State persists on page refresh.

---

## 5. Standard Operating Procedures for Subsequent Agents
1. **Public Web URL**: Always use `https://dorisautomate.web.app` as the primary live user interface.
2. **Kaggle Phone Verification**: Ensure the user has completed SMS Phone Verification at `https://www.kaggle.com/settings` to allow Kaggle container GPU access and outbound internet.
3. **Always update this `handoff.md`** file upon completing any task or modification.
