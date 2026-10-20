$src = "C:\Users\doris\AppData\Local\Microsoft\Edge\User Data\Default\Network\Cookies"
$dest = "c:\Users\doris\Downloads\Doris Automation\scripts\edge_shared_cookies.db"

$fsIn = [System.IO.File]::Open($src, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$fsOut = [System.IO.File]::Create($dest)
$fsIn.CopyTo($fsOut)
$fsIn.Close()
$fsOut.Close()

Write-Host "Successfully copied Edge locked Cookies DB! Size: $( (Get-Item $dest).Length ) bytes"
