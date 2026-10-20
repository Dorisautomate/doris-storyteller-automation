$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222", "--remote-allow-origins=*", "https://flow.google.com/shared/tool/ee8f4722-38cb-4363-967f-057725e7c3c6" -PassThru
Start-Sleep -Seconds 5
$conn = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 9222 }
if ($conn) {
    Write-Host "[SUCCESS] Chrome port 9222 is active! PID: $($conn.OwningProcess)"
} else {
    Write-Host "[FAIL] Chrome port 9222 not listening"
}
