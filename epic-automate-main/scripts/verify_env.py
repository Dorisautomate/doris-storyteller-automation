#!/usr/bin/env python3
"""
Epic Automate - Environment Pre-Flight Credential Audit
=======================================================
Audits the 4 essential pillars of access for Epic Automate:
1. GitHub PAT (with repo write scopes)
2. Hugging Face Token (with write scopes)
3. Kaggle API Token (~/.kaggle/kaggle.json or env)
4. Firebase CLI Authentication
"""

import os
import sys
import json
import urllib.request
import urllib.error
import subprocess
import io

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

def test_github():
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        return False, "GITHUB_TOKEN not found in environment."
    try:
        req = urllib.request.Request(
            "https://api.github.com/user",
            headers={"Authorization": f"token {token}", "User-Agent": "EpicAutomateAudit"}
        )
        with urllib.request.urlopen(req, timeout=8) as res:
            scopes = res.headers.get("X-OAuth-Scopes", "")
            data = json.loads(res.read().decode())
            username = data.get("login")
            scope_info = f"Scopes: [{scopes}]" if scopes else "Fine-grained token / standard PAT"
            return True, f"Authenticated as @{username} ({scope_info})"
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}: Token invalid or expired."
    except Exception as e:
        return False, f"Connection failed: {e}"

def test_huggingface():
    token = os.environ.get("HF_TOKEN", "").strip()
    if not token:
        # Check huggingface-cli cache
        hf_token_path = os.path.expanduser("~/.cache/huggingface/token")
        if os.path.exists(hf_token_path):
            try:
                with open(hf_token_path, "r") as f:
                    token = f.read().strip()
            except Exception:
                pass

    if not token:
        return False, "HF_TOKEN not found in environment or ~/.cache/huggingface/token."

    try:
        req = urllib.request.Request(
            "https://huggingface.co/api/whoami-v2",
            headers={"Authorization": f"Bearer {token}", "User-Agent": "EpicAutomateAudit"}
        )
        with urllib.request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read().decode())
            name = data.get("name", "Unknown")
            status_desc = f"Authenticated as @{name}"
            return True, status_desc
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}: Token invalid or expired."
    except Exception as e:
        return False, f"Connection failed: {e}"

def test_kaggle():
    kaggle_user = os.environ.get("KAGGLE_USERNAME", "").strip()
    kaggle_key = os.environ.get("KAGGLE_KEY", "").strip()

    kaggle_json_path = os.path.expanduser("~/.kaggle/kaggle.json")
    if not kaggle_user and os.path.exists(kaggle_json_path):
        try:
            with open(kaggle_json_path, "r") as f:
                kj = json.load(f)
                kaggle_user = kj.get("username", "")
                kaggle_key = kj.get("key", "")
        except Exception:
            pass

    if not kaggle_user or not kaggle_key:
        return False, "Kaggle credentials not found in environment or ~/.kaggle/kaggle.json."

    try:
        import base64
        auth_str = f"{kaggle_user}:{kaggle_key}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()
        req = urllib.request.Request(
            "https://www.kaggle.com/api/v1/datasets/list?pageSize=1",
            headers={"Authorization": f"Basic {b64_auth}", "User-Agent": "EpicAutomateAudit"}
        )
        with urllib.request.urlopen(req, timeout=8) as res:
            return True, f"Authenticated as Kaggle user @{kaggle_user}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}: Kaggle credentials rejected."
    except Exception as e:
        return False, f"Connection test failed: {e}"

def test_firebase():
    try:
        result = subprocess.run(
            ["firebase", "projects:list", "--json"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=True,
            timeout=10
        )
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                count = len(data.get("result", []))
                return True, f"Firebase CLI authenticated ({count} projects accessible)."
            except Exception:
                return True, "Firebase CLI authenticated."
        else:
            return False, "Firebase CLI not logged in (run `firebase login`)."
    except Exception as e:
        return False, f"Firebase CLI execution check failed: {e}"

def main():
    print("=" * 65)
    print("[*] Epic Automate - Credential Pre-Flight Verification")
    print("=" * 65)

    checks = [
        ("GitHub Personal Access Token", test_github, "https://github.com/settings/tokens (Scope: repo)"),
        ("Hugging Face Access Token", test_huggingface, "https://huggingface.co/settings/tokens (Role: write)"),
        ("Kaggle API Credentials", test_kaggle, "https://www.kaggle.com/settings -> API -> Create New Token"),
        ("Firebase CLI Authentication", test_firebase, "Run `firebase login` in your terminal")
    ]

    all_passed = True
    for name, func, guide_link in checks:
        passed, msg = func()
        status_icon = "[PASS]" if passed else "[MISSING]"
        print(f"\n{status_icon} | {name}")
        print(f"       Details: {msg}")
        if not passed:
            all_passed = False
            print(f"       Guide:   Get token at -> {guide_link}")

    print("\n" + "=" * 65)
    if all_passed:
        print("[SUCCESS] All 4 credentials verified! Ready to build Epic Automate projects.")
    else:
        print("[NOTICE] Some credentials need attention. Follow the guides above to configure them.")
    print("=" * 65)

if __name__ == "__main__":
    main()
