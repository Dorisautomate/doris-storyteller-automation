import os
import shutil
import subprocess

edge_src = r'C:\Users\doris\AppData\Local\Microsoft\Edge\User Data'
edge_dest = r'C:\Users\doris\.edge-flow-profile'

subprocess.run(['powershell', '-Command', 'Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue'], check=False)

os.makedirs(os.path.join(edge_dest, 'Default'), exist_ok=True)

# Copy Local State
shutil.copyfile(os.path.join(edge_src, 'Local State'), os.path.join(edge_dest, 'Local State'))
print('[OK] Copied Local State!')

# Copy Preferences
try:
    shutil.copyfile(os.path.join(edge_src, 'Default', 'Preferences'), os.path.join(edge_dest, 'Default', 'Preferences'))
    print('[OK] Copied Preferences!')
except Exception as e:
    print('Preferences error:', e)

# Copy Network (Cookies)
try:
    src_net = os.path.join(edge_src, 'Default', 'Network')
    dest_net = os.path.join(edge_dest, 'Default', 'Network')
    os.makedirs(dest_net, exist_ok=True)
    for f in os.listdir(src_net):
        shutil.copyfile(os.path.join(src_net, f), os.path.join(dest_net, f))
    print('[OK] Copied Network folder (Cookies)!')
except Exception as e:
    print('Network error:', e)

# Copy Sessions, Local Storage, IndexedDB
for item in ['Sessions', 'Session Storage', 'Local Storage', 'IndexedDB']:
    s = os.path.join(edge_src, 'Default', item)
    d = os.path.join(edge_dest, 'Default', item)
    if os.path.exists(s):
        try:
            subprocess.run(f'robocopy "{s}" "{d}" /E /NFL /NDL /NJH /NJS /nc /ns /np', shell=True)
            print(f'[OK] Cloned {item}!')
        except Exception as e:
            print(f'{item} error:', e)

print('[ALL DONE] Edge Profile successfully cloned!')
