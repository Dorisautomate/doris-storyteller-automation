$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222", "--remote-allow-origins=*" -PassThru
Start-Sleep -Seconds 4
$conn = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 9222 }
if ($conn) {
    Write-Host "[SUCCESS] Chrome is listening on port 9222! OwningProcess: $($conn.OwningProcess)"
} else {
    Write-Host "[FAIL] Chrome did not bind port 9222"
}
