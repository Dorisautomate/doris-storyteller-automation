# Epic Automate ⚡

> **A standardized modus operandi for architecting, deploying, and monitoring custom AI and cloud automation systems.**

`Epic Automate` unifies **Firebase**, **Google Cloud Firestore**, **Kaggle T4 GPUs**, **Hugging Face Datasets**, and **GitHub** into a seamless, cost-effective automation pipeline.

---

## 🌟 The Core Architecture

1. **Frontend Hosting (Firebase)**:
   - Compulsorily provisioned as a **brand-new Firebase project** for every unique automation.
   - Hosts the reactive web control center on Firebase Hosting (`https://<project-id>.web.app`).

2. **Real-Time State & Logs (Cloud Firestore)**:
   - Lightweight document state under `/automations/{jobId}`.
   - Synchronizes percentage progress (`0-100%`), live milestone text, and execution logs in real time.
   - Carries the two-way cancellation signal (`cancel_requested: true`).

3. **Compute Server (Kaggle T4 GPU)**:
   - Offloads heavy deep learning, AI generation, and media rendering to Kaggle's free T4 GPU.
   - Triggered via `kaggle kernels push`.
   - **Mandatory T4 Research Rule**: Always re-verifies Kaggle's latest accelerator syntax (`nvidiaTeslaT4`) prior to execution.
   - **Cancellation Watchdog**: Polls Firestore continuously to terminate execution and subprocesses immediately when the user clicks Cancel.

4. **Asset Storage (Hugging Face Datasets)**:
   - Eliminates expensive cloud bucket egress fees by storing generated videos, audio, images, and archives in free Hugging Face Datasets repositories.
   - Returns direct raw file URLs to Firestore and provides an **embedded HTML5 Video/Audio preview player** directly on the web app.

5. **Version Control & Living Handoff**:
   - Pushes all code and configurations to GitHub using the user's GitHub Personal Access Token (PAT).
   - Maintains a living `handoff.md` file detailing progress, component states, and instructions for subsequent agents.

---

## 📁 Repository Structure

```
epic-automate/
├── SKILL.md                          # Master AI agent instructions & invocation rules
├── README.md                         # Architecture overview and documentation
├── templates/
│   ├── kernel-metadata.json          # Kaggle T4 kernel metadata template
│   ├── kaggle_executor.py            # Production-grade Python worker with Firestore sync & cancel watchdog
│   ├── handoff_template.md           # Standard handoff.md template for agent state continuity
│   └── frontend/
│       ├── index.html                # Web dashboard with live progress & media preview
│       ├── app.js                    # Real-time Firestore sync & cancel handler
│       └── style.css                 # Sleek dark-mode interface styling
└── scripts/
    └── verify_env.py                 # Automated pre-flight credential checker
```

---

## 🔑 Credential Requirements

| Service | Credential | Purpose | How to Acquire |
|---|---|---|---|
| **GitHub** | `GITHUB_TOKEN` | Version control & repo push | [github.com/settings/tokens](https://github.com/settings/tokens) (Scope: `repo`) |
| **Hugging Face** | `HF_TOKEN` | Free asset storage upload | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (Role: `write`) |
| **Kaggle** | `kaggle.json` | T4 GPU kernel execution | [kaggle.com/settings](https://kaggle.com/settings) (API -> Create New Token) |
| **Firebase** | CLI Session | Project creation & hosting | Run `firebase login` |

---

## 🚀 Quick Start Credential Check

Run the pre-flight verification script to inspect your local setup:

```bash
python scripts/verify_env.py
```

---

## 💡 Invocation

Trigger this agent skill anytime by entering:
- `/epic-automate`
- *"I want to create an automation"*
- *"I want to build a custom automation framework"*
