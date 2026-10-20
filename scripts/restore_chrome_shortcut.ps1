$sh = New-Object -ComObject WScript.Shell
$shortcut = $sh.CreateShortcut("C:\Users\doris\OneDrive\Desktop\Google Chrome.lnk")
$shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$shortcut.Arguments = ""
$shortcut.Save()
Write-Host "Google Chrome shortcut restored to normal!"
