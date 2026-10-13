#!/usr/bin/env python3
"""
Epic Automate - Kaggle T4 Worker Template
==========================================
Executes heavy automation workloads on Kaggle T4 GPU accelerator with:
1. Live Firestore milestone and progress streaming
2. Interruptible cancellation watchdog
3. Hugging Face Datasets asset upload
4. Direct asset URL return for web frontend preview
"""

import os
import sys
import time
import json
import logging
import threading
import subprocess
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("epic_worker")

# Environment & Job Configuration
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "YOUR_FIREBASE_PROJECT_ID")
JOB_ID = os.environ.get("JOB_ID", f"job_{int(time.time())}")
HF_TOKEN = os.environ.get("HF_TOKEN", "")
HF_DATASET_REPO = os.environ.get("HF_DATASET_REPO", "username/epic-automation-assets")

cancel_event = threading.Event()
active_subprocesses = []

def update_firestore(progress_pct: int, milestone_text: str, status: str = "running", asset_url: str = None, asset_type: str = "video", log_line: str = None):
    """
    Directly updates Firestore document via REST API.
    Zero heavy Google Cloud SDK dependencies needed on the worker.
    """
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/automations/{JOB_ID}"
    
    fields = {
        "progress": {"integerValue": str(progress_pct)},
        "current_milestone": {"stringValue": milestone_text},
        "status": {"stringValue": status},
        "updated_at": {"stringValue": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    }
    
    update_masks = ["progress", "current_milestone", "status", "updated_at"]
    
    if asset_url:
        fields["asset_url"] = {"stringValue": asset_url}
        fields["asset_type"] = {"stringValue": asset_type}
        update_masks.extend(["asset_url", "asset_type"])
        
    mask_query = "&".join([f"updateMask.fieldPaths={m}" for m in update_masks])
    
    try:
        resp = requests.patch(f"{url}?{mask_query}", json={"fields": fields}, timeout=6)
        if resp.status_code not in (200, 201):
            logger.warning(f"Firestore update responded with code {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.warning(f"Failed to push milestone update to Firestore: {e}")

def cancellation_watchdog_loop(poll_interval: float = 3.0):
    """
    Continuously inspects the Firestore job document for a cancellation signal.
    If the user clicks 'Cancel' on the web frontend, this kills all processes immediately.
    """
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/automations/{JOB_ID}"
    logger.info("Cancellation watchdog activated.")
    
    while not cancel_event.is_set():
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                doc = resp.json().get("fields", {})
                cancel_requested = doc.get("cancel_requested", {}).get("booleanValue", False)
                status = doc.get("status", {}).get("stringValue", "")
                
                if cancel_requested or status == "cancelled":
                    logger.warning("[ABORT] Cancellation requested from frontend! Terminating execution immediately...")
                    cancel_event.set()
                    
                    # Terminate any running child processes (e.g. FFmpeg, deep learning jobs)
                    for proc in active_subprocesses:
                        try:
                            proc.kill()
                        except Exception:
                            pass
                            
                    update_firestore(
                        progress_pct=0,
                        milestone_text="Execution cancelled by user request.",
                        status="cancelled"
                    )
                    os._exit(0)
        except Exception as e:
            logger.debug(f"Watchdog polling check error: {e}")
            
        time.sleep(poll_interval)

def check_cancel():
    """Inline check before heavy operations."""
    if cancel_event.is_set():
        logger.warning("Operation cancelled. Exiting.")
        sys.exit(0)

def run_command_with_cancel(cmd: list):
    """Executes a command while registering it to the active subprocess registry."""
    check_cancel()
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    active_subprocesses.append(proc)
    stdout, stderr = proc.communicate()
    active_subprocesses.remove(proc)
    if proc.returncode != 0:
        raise RuntimeError(f"Command {' '.join(cmd)} failed with code {proc.returncode}: {stderr}")
    return stdout

def upload_to_huggingface(local_filepath: str, job_id: str, repo_id: str, token: str) -> str:
    """
    Uploads generated media file to Hugging Face Datasets repository and returns raw download URL.
    """
    from huggingface_hub import HfApi
    
    api = HfApi(token=token)
    api.create_repo(repo_id=repo_id, repo_type="dataset", exist_ok=True, private=False)
    
    filename = os.path.basename(local_filepath)
    remote_path = f"artifacts/{job_id}/{filename}"
    
    logger.info(f"Uploading {local_filepath} to Hugging Face Datasets: {repo_id}/{remote_path}...")
    api.upload_file(
        path_or_fileobj=local_filepath,
        path_in_repo=remote_path,
        repo_id=repo_id,
        repo_type="dataset"
    )
    
    # Direct raw download URL for web preview player
    download_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/{remote_path}"
    logger.info(f"Upload complete. Direct URL: {download_url}")
    return download_url

def run_automation_pipeline():
    """
    Main workload logic for the automation job.
    Replace or extend this method with your specific neural models,
    video generation pipelines, TTS audio rendering, or data transformations.
    """
    logger.info(f"--- Starting Epic Automate Pipeline for Job ID: {JOB_ID} ---")
    
    # Milestone 1: Environment Initialization
    check_cancel()
    update_firestore(5, "Verifying Kaggle T4 GPU acceleration and CUDA drivers...")
    time.sleep(2)
    
    # Milestone 2: Input Acquisition & Preprocessing
    check_cancel()
    update_firestore(25, "Fetching source inputs and initializing model checkpoints...")
    time.sleep(3)
    
    # Milestone 3: Heavy Compute / Neural Generation
    check_cancel()
    update_firestore(55, "Running heavy neural synthesis / processing batch...")
    time.sleep(4)
    
    # Milestone 4: Rendering / Final Assembly
    check_cancel()
    update_firestore(75, "Rendering output media with FFmpeg and optimizing encoding...")
    output_media = f"output_{JOB_ID}.mp4"
    
    # Create sample media for demo or connect your real engine
    if not os.path.exists(output_media):
        with open(output_media, "wb") as f:
            f.write(b"\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2mp41")
            
    # Milestone 5: Hugging Face Datasets Upload
    check_cancel()
    update_firestore(90, "Uploading generated media to Hugging Face Datasets storage...")
    
    asset_url = ""
    if HF_TOKEN and HF_DATASET_REPO:
        try:
            asset_url = upload_to_huggingface(output_media, JOB_ID, HF_DATASET_REPO, HF_TOKEN)
        except Exception as e:
            logger.error(f"Hugging Face upload failed: {e}")
            update_firestore(90, f"Upload error: {e}", status="failed")
            return
    else:
        logger.warning("HF_TOKEN or HF_DATASET_REPO not specified. Using local placeholder.")
        asset_url = f"https://huggingface.co/datasets/placeholder/{output_media}"

    # Milestone 6: Completion
    check_cancel()
    update_firestore(
        progress_pct=100,
        milestone_text="Automation complete! Output asset ready for download and preview.",
        status="completed",
        asset_url=asset_url,
        asset_type="video"
    )
    logger.info(f"Job completed successfully. Asset URL: {asset_url}")

def main():
    # Start the cancellation watchdog in background daemon thread
    watchdog = threading.Thread(target=cancellation_watchdog_loop, daemon=True)
    watchdog.start()
    
    try:
        run_automation_pipeline()
    except Exception as exc:
        logger.exception("Pipeline crashed unexpectedly:")
        update_firestore(
            progress_pct=0,
            milestone_text=f"Execution error: {str(exc)}",
            status="failed"
        )
        sys.exit(1)

if __name__ == "__main__":
    main()
