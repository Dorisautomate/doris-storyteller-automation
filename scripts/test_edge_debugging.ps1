$args = @(
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--user-data-dir=C:\Users\doris\.edge-test-profile"
)
$proc = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList $args -PassThru
Start-Sleep -Seconds 4
$conn = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 9222 }
if ($conn) {
    Write-Host "[SUCCESS] Edge port 9222 active on PID: $($conn.OwningProcess)"
    Stop-Process -Id $conn.OwningProcess -Force
} else {
    Write-Host "[FAIL] Edge port 9222 not listening"
}
