import urllib.request
import json

try:
    with urllib.request.urlopen('http://127.0.0.1:59851/json') as response:
        tabs = json.loads(response.read().decode('utf-8'))
        for t in tabs:
            if t.get('type') == 'page':
                print(f"[{t.get('id')}] {t.get('title')} -> {t.get('url')}")
except Exception as e:
    print(f"Error connecting to CDP: {e}")
