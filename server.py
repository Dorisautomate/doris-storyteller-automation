"""
Doris Automation — Local API Bridge & Web Server
Connects Frontend (UI) directly to Kaggle Server & Hugging Face
"""

import os
import sys
import json
import subprocess
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

PORT = 5000
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
KAGGLE_DIR = os.path.join(WORKSPACE_DIR, "kaggle")
HF_DATASET_REPO = "Dorisautomate/automation-assets"

current_job = {
    "jobId": None,
    "status": "idle",
    "progress": "0%",
    "milestone": "Ready to execute",
    "logs": [],
    "assetUrl": None
}

def log_event(text):
    print(f"[Bridge] {text}", flush=True)
    current_job["logs"].append(text)

def run_kaggle_worker():
    global current_job
    try:
        log_event("Pushing kernel to Kaggle with T4 GPU accelerator...")
        python_exe = sys.executable
        cmd = [
            python_exe, "-m", "kaggle", "kernels", "push",
            "-p", KAGGLE_DIR,
            "--accelerator", "NvidiaTeslaT4"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, cwd=WORKSPACE_DIR)
        log_event(f"Kaggle push response: {res.stdout.strip() or res.stderr.strip()}")
        
        if res.returncode != 0:
            current_job["status"] = "failed"
            current_job["milestone"] = f"Failed to push to Kaggle: {res.stderr[:200]}"
            return
            
        current_job["status"] = "running"
        current_job["milestone"] = "Executing on Kaggle server (T4 GPU)..."
        
        # Poll Kaggle status until complete
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        
        import time
        while current_job["status"] == "running":
            time.sleep(8)
            status_obj = api.kernels_status("dorisautomate/doris-storyteller-worker")
            s = str(status_obj.status)
            log_event(f"Kaggle execution state: {s}")
            
            if "COMPLETE" in s:
                current_job["status"] = "completed"
                current_job["progress"] = "100%"
                current_job["milestone"] = "Kaggle execution complete! Video rendered and uploaded to Hugging Face."
                current_job["assetUrl"] = f"https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/videos/doris_kaggle_story_video.mp4"
                log_event(f"Success! Final asset URL: {current_job['assetUrl']}")
                break
            elif "ERROR" in s or "FAIL" in s:
                current_job["status"] = "failed"
                current_job["milestone"] = f"Kaggle job failed: {status_obj.failure_message or 'Unknown error'}"
                break
    except Exception as e:
        log_event(f"Worker exception: {e}")
        current_job["status"] = "failed"
        current_job["milestone"] = str(e)

class RequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(WORKSPACE_DIR, "frontend"), **kwargs)

    def end_headers(self):
        # Enable CORS for frontend running on Firebase Hosting or localhost
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/status":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(current_job).encode('utf-8'))
            return
        elif parsed.path == "/api/latest-video":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            data = {
                "videoUrl": f"https://huggingface.co/datasets/{HF_DATASET_REPO}/resolve/main/videos/doris_kaggle_story_video.mp4"
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return
            
        # Serve frontend static files
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/run":
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length) if length > 0 else b'{}'
            try:
                payload = json.loads(body.decode('utf-8'))
            except:
                payload = {}
                
            global current_job
            job_id = f"epic_job_{int(time.time())}"
            current_job = {
                "jobId": job_id,
                "status": "queued",
                "progress": "5%",
                "milestone": "Initiating Kaggle T4 server push...",
                "logs": [f"Starting new job: {job_id}"],
                "assetUrl": None
            }
            
            # Start background thread to run Kaggle worker
            thread = threading.Thread(target=run_kaggle_worker, daemon=True)
            thread.start()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "jobId": job_id}).encode('utf-8'))
            return

def start_server():
    server = HTTPServer(('127.0.0.1', PORT), RequestHandler)
    print(f"[Server] Doris Automation Bridge running on http://127.0.0.1:{PORT}")
    server.serve_forever()

if __name__ == "__main__":
    start_server()
