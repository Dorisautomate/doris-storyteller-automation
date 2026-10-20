$args = @(
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--user-data-dir=C:\Users\doris\EdgeProfile",
    "https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6"
)
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList $args -PassThru
Start-Sleep -Seconds 4
$conn = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 9222 }
if ($conn) {
    Write-Host "[SUCCESS] Edge port 9222 is active with real profile! PID: $($conn.OwningProcess)"
} else {
    Write-Host "[FAIL] Port 9222 not listening"
}
