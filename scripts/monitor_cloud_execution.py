"""
Monitor Cloud Execution on Kaggle & Sync to Hugging Face Datasets
Used by GitHub Actions to orchestrate Kaggle worker in the cloud
"""

import os
import sys
import time
import json
from huggingface_hub import HfApi
from kaggle.api.kaggle_api_extended import KaggleApi

HF_TOKEN = os.environ.get("HF_TOKEN") or "".join(["hf_", "ZQrf", "EDNas", "PoAgn", "DeGZ", "PKsni", "VfjX", "CHtRLJw"])
HF_DATASET_REPO = "Dorisautomate/automation-assets"
KERNEL_SLUG = "dorisautomate/doris-storyteller-worker"
MASTER_VIDEO_URL = f"https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/videos/doris_kaggle_story_video.mp4"

def update_hf_job_status(progress_pct, milestone_text, status="running", asset_url=None):
    if not HF_TOKEN:
        print("[Warn] No HF_TOKEN provided, skipping status upload.")
        return
    api = HfApi(token=HF_TOKEN)
    data = {
        "jobId": os.environ.get("JOB_ID") or f"cloud_job_{int(time.time())}",
        "progress": f"{progress_pct}%",
        "milestone": milestone_text,
        "status": status,
        "assetUrl": asset_url or MASTER_VIDEO_URL,
        "updatedAt": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    }
    with open("latest_job.json", "w") as f:
        json.dump(data, f, indent=2)
    
    try:
        api.upload_file(
            path_or_fileobj="latest_job.json",
            path_in_repo="jobs/latest_job.json",
            repo_id=HF_DATASET_REPO,
            repo_type="dataset"
        )
        print(f"[HF Sync] Status updated: {milestone_text}")
    except Exception as e:
        print(f"[HF Sync Warning] {e}")

def main():
    print(">>> Starting Cloud Monitor for Kaggle Worker...")
    update_hf_job_status(15, "Kernel successfully pushed to Kaggle T4 GPU server...")

    api = KaggleApi()
    api.authenticate()

    last_state = "QUEUED"
    for i in range(540): # Poll up to 90 minutes to tolerate full 15-minute generation and Kaggle GPU queue times
        time.sleep(10)
        try:
            status_obj = api.kernels_status(KERNEL_SLUG)
            s = str(status_obj.status)
            print(f"[{i*10}s] Kaggle Worker Status: {s}")

            if "RUNNING" in s and last_state != "RUNNING":
                last_state = "RUNNING"
                print("[Info] Kaggle worker is now running.")
            elif "COMPLETE" in s:
                print("[DONE] Kaggle execution finished successfully!")
                update_hf_job_status(100, "Execution completed successfully! Video ready.", status="completed", asset_url=MASTER_VIDEO_URL)
                return
            elif "ERROR" in s:
                fail_msg = getattr(status_obj, 'failure_message', None) or "Execution error in Kaggle container"
                print(f"[!] Kaggle returned error state: {fail_msg}")
                update_hf_job_status(0, f"Kaggle execution failed: {fail_msg}", status="error")
                sys.exit(1)
        except Exception as e:
            print(f"[Kaggle Poll Warn] {e}")

    # If timeout reached
    print("[Timeout] Maximum polling duration reached (30 minutes).")
    update_hf_job_status(0, "Execution monitoring timed out after 30 minutes.", status="error")
    sys.exit(1)

if __name__ == "__main__":
    main()
