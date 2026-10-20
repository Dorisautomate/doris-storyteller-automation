$sh = New-Object -ComObject WScript.Shell
$shortcut = $sh.CreateShortcut("C:\Users\doris\OneDrive\Desktop\Microsoft Edge (Automation).lnk")
$shortcut.TargetPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$shortcut.Arguments = "--remote-debugging-port=9222 --remote-allow-origins=* --restore-last-session"
$shortcut.Save()
Write-Host "Created 'Microsoft Edge (Automation)' shortcut on Desktop!"
