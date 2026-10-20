$args = @(
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--user-data-dir=C:\Users\doris\ChromeProfile",
    "--profile-directory=Profile 2",
    "https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6"
)
$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList $args -PassThru
Start-Sleep -Seconds 6
$conn = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 9222 }
if ($conn) {
    Write-Host "[SUCCESS] Chrome port 9222 active on PID: $($conn.OwningProcess)"
} else {
    Write-Host "[FAIL] Port 9222 not listening"
}
