import os
import json
import base64
import sqlite3
import shutil
import tempfile
import ctypes
from ctypes import wintypes

class DATA_BLOB(ctypes.Structure):
    _fields_ = [('cbData', wintypes.DWORD),
                ('pbData', ctypes.POINTER(ctypes.c_char))]

def decrypt_dpapi(encrypted_bytes):
    blob_in = DATA_BLOB(len(encrypted_bytes), ctypes.create_string_buffer(encrypted_bytes))
    blob_out = DATA_BLOB()
    if ctypes.windll.crypt32.CryptUnprotectData(ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out)):
        return ctypes.string_at(blob_out.pbData, blob_out.cbData)
    return None

def export_cookies():
    local_state_path = r'C:\Users\doris\AppData\Local\Google\Chrome\User Data\Local State'
    with open(local_state_path, 'r', encoding='utf-8') as f:
        local_state = json.load(f)
    encrypted_key = base64.b64decode(local_state['os_crypt']['encrypted_key'])
    aes_key = decrypt_dpapi(encrypted_key[5:])
    
    # Save aes_key as hex
    print("AES Key Hex:", aes_key.hex())
    with open(r'c:\Users\doris\Downloads\Doris Automation\scripts\chrome_aes_key.txt', 'w') as f:
        f.write(aes_key.hex())

    # Copy Cookies DB from Default
    src_db = r'C:\Users\doris\AppData\Local\Google\Chrome\User Data\Default\Network\Cookies'
    temp_db = r'c:\Users\doris\Downloads\Doris Automation\scripts\temp_cookies.db'
    shutil.copyfile(src_db, temp_db)

    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    cursor.execute("SELECT host_key, name, path, is_secure, is_httponly, expires_utc, samesite, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%google.com%'")
    rows = cursor.fetchall()
    print(f"Found {len(rows)} Google cookies in Default profile!")

    # Also check Profile 2
    src_db2 = r'C:\Users\doris\AppData\Local\Google\Chrome\User Data\Profile 2\Network\Cookies'
    temp_db2 = r'c:\Users\doris\Downloads\Doris Automation\scripts\temp_cookies2.db'
    shutil.copyfile(src_db2, temp_db2)
    conn2 = sqlite3.connect(temp_db2)
    cursor2 = conn2.cursor()
    cursor2.execute("SELECT host_key, name, path, is_secure, is_httponly, expires_utc, samesite, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%google.com%'")
    rows2 = cursor2.fetchall()
    print(f"Found {len(rows2)} Google cookies in Profile 2!")

    # Export both to a json
    data = {
        'aes_key_hex': aes_key.hex(),
        'default_cookies': rows,
        'profile2_cookies': rows2
    }
    with open(r'c:\Users\doris\Downloads\Doris Automation\scripts\extracted_encrypted_cookies.json', 'w') as f:
        json.dump(data, f)
    print("Exported encrypted cookies to extracted_encrypted_cookies.json!")

export_cookies()
