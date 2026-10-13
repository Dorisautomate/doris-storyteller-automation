# Epic Automate Project Handoff

> **Note for Subsequent Agents**: This document tracks the real-time operational status, architectural bindings, credentials status, and incremental modifications for this automation project. Update this document after every major change.

---

## 1. Project Identity & Architecture
- **Project Name**: [Project Name]
- **Date Created**: [YYYY-MM-DD]
- **Last Modified**: [YYYY-MM-DD HH:MM]
- **Modus Operandi**: `epic-automate`
  - Frontend: Dedicated New Firebase Project (Firebase Hosting)
  - State & Progress: Cloud Firestore
  - Compute Server: Kaggle T4 GPU (`nvidiaTeslaT4`) via Kernel Push
  - Asset Storage: Hugging Face Datasets with Web Media Preview Player
  - Version Control: GitHub Repository

---

## 2. Infrastructure Endpoints & Identifiers
| Service | Resource | Identifier / URL | Status |
|---|---|---|---|
| **Firebase Hosting** | Web Frontend | `https://[PROJECT_ID].web.app` | 🟢 Live / 🟡 Pending |
| **Cloud Firestore** | State Database | Project: `[PROJECT_ID]`, Collection: `/automations` | 🟢 Active |
| **Kaggle Kernel** | Compute Worker | Slug: `[KAGGLE_USER]/[KERNEL_SLUG]` | 🟢 Ready |
| **Kaggle Accelerator** | GPU Spec | `nvidiaTeslaT4` (Verified) | 🟢 Enabled |
| **Hugging Face** | Storage Dataset | `https://huggingface.co/datasets/[HF_USER]/[DATASET_NAME]` | 🟢 Active |
| **GitHub** | Source Code | `https://github.com/[GITHUB_USER]/[REPO_NAME]` | 🟢 Synced |

---

## 3. Credentials & Secrets Audit
- [ ] **GitHub PAT**: Stored as `GITHUB_TOKEN` with write access to repository.
- [ ] **Hugging Face Token**: Stored as `HF_TOKEN` with Write permissions.
- [ ] **Kaggle API**: Verified via `~/.kaggle/kaggle.json` or `KAGGLE_USERNAME` & `KAGGLE_KEY`.
- [ ] **Firebase Authentication**: Active session in Firebase CLI for project `[PROJECT_ID]`.

---

## 4. Work Completed & Modifications Log
- **[YYYY-MM-DD]**: Initialized new Firebase project `[PROJECT_ID]`.
- **[YYYY-MM-DD]**: Deployed control frontend with live progress bar and cancellation trigger.
- **[YYYY-MM-DD]**: Configured Kaggle T4 kernel with real-time milestone streaming.
- **[YYYY-MM-DD]**: Tested Hugging Face dataset upload and web preview player.
- **[YYYY-MM-DD]**: Committed and pushed all code to GitHub.

---

## 5. Standard Operating Procedures for Subsequent Agents
1. **Never reuse an old Firebase project** unless explicitly requested by the user.
2. **Always re-verify Kaggle's latest T4 accelerator syntax** before pushing kernels.
3. **Verify the cancellation watchdog** functions properly when testing workers.
4. **Always update this `handoff.md`** file upon completing any task or modification.
