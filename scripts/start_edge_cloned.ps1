$args = @(
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--user-data-dir=C:\Users\doris\.edge-flow-profile",
    "https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6"
)
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList $args -PassThru
Start-Sleep -Seconds 5
$conn = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 9222 }
if ($conn) {
    Write-Host "[SUCCESS] Edge automation active on port 9222! PID: $($conn.OwningProcess)"
} else {
    Write-Host "[FAIL] Port 9222 not listening"
}
