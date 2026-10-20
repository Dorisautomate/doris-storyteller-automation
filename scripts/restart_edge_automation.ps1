Write-Host "[*] Restarting Microsoft Edge with automation debugging..."
Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$args = @(
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--restore-last-session",
    "https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6"
)
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList $args -PassThru
Start-Sleep -Seconds 5

$conn = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 9222 }
if ($conn) {
    Write-Host "[SUCCESS] Edge is listening on port 9222! PID: $($conn.OwningProcess)"
} else {
    Write-Host "[!] Port 9222 not listening yet."
}
