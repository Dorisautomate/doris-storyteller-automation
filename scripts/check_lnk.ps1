$sh = New-Object -ComObject WScript.Shell
$target = $sh.CreateShortcut("C:\Users\doris\OneDrive\Desktop\Google Chrome.lnk")
Write-Host "Target: $($target.TargetPath)"
Write-Host "Arguments: $($target.Arguments)"
