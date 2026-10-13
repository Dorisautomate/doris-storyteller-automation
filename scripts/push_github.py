import os
import subprocess
import requests

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
USERNAME = "Dorisautomate"
REPO_NAME = "doris-storyteller-automation"

# 1. Create repo on GitHub if not existing
headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}
data = {
    "name": REPO_NAME,
    "description": "Doris AI Storyteller — Epic Automate: F5-TTS voiceover & sentence-synced video generator",
    "private": False
}
res = requests.post("https://api.github.com/user/repos", headers=headers, json=data)
if res.status_code in [201, 422]:
    print(f"[DONE] GitHub repository ready: https://github.com/{USERNAME}/{REPO_NAME}")
else:
    print(f"[!] GitHub repo creation responded: {res.status_code} - {res.text}")

# 2. Configure Git and push
git_exe = r"C:\Program Files\Git\cmd\git.exe"

def run_git(args):
    cmd = [git_exe] + args
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)

try:
    if not os.path.exists(".git"):
        run_git(["init"])
    run_git(["config", "user.name", "Dorisautomate"])
    run_git(["config", "user.email", "dorisautomate@gmail.com"])
    
    # Create .gitignore
    with open(".gitignore", "w") as f:
        f.write("node_modules/\ntemp_build/\n*.mp3\n*.zip\n")

    run_git(["add", "."])
    run_git(["commit", "-m", "feat: complete Epic Automate pipeline with live Firebase deployment and Hugging Face video"])
    
    remote_url = f"https://{GITHUB_TOKEN}@github.com/{USERNAME}/{REPO_NAME}.git"
    
    # Check if remote origin exists
    remotes = run_git(["remote"]).stdout
    if "origin" in remotes:
        run_git(["remote", "set-url", "origin", remote_url])
    else:
        run_git(["remote", "add", "origin", remote_url])
        
    run_git(["branch", "-M", "main"])
    run_git(["push", "-u", "origin", "main", "--force"])
    print(f"[DONE] Successfully pushed all code to https://github.com/{USERNAME}/{REPO_NAME}")
except Exception as e:
    print(f"[!] Git push warning: {e}")
