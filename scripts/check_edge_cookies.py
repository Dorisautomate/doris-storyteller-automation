import sqlite3
import shutil

shutil.copyfile(r'C:\Users\doris\AppData\Local\Microsoft\Edge\User Data\Default\Network\Cookies', 'scripts/edge_temp_cookies.db')
conn = sqlite3.connect('scripts/edge_temp_cookies.db')
cur = conn.cursor()
cur.execute("SELECT host_key, name, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%google.com%' AND (name = 'SID' OR name = 'SSID' OR name = 'OSID' OR name = '__Secure-1PSID')")
rows = cur.fetchall()
print(f'Found {len(rows)} core Google auth cookies in Edge!')
for r in rows:
    raw = bytes.fromhex(r[2])
    print(r[0], r[1], 'prefix:', raw[:3])
