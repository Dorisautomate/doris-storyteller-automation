$sh = New-Object -ComObject WScript.Shell
$shortcut = $sh.CreateShortcut("C:\Users\doris\OneDrive\Desktop\Google Chrome.lnk")
$shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$shortcut.Arguments = "--remote-debugging-port=9222 --remote-allow-origins=*"
$shortcut.Save()
Write-Host "Desktop shortcut updated with --remote-debugging-port=9222!"
