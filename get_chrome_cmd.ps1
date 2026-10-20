$pids = (Get-Process chrome -ErrorAction SilentlyContinue).Id
if ($pids) {
    Get-NetTCPConnection -State Listen | Where-Object { $pids -contains $_.OwningProcess } | Format-Table LocalAddress, LocalPort, OwningProcess
} else {
    Write-Host "No Chrome processes found"
}
