$shiftPids = (Get-Process shift -ErrorAction SilentlyContinue).Id
if ($shiftPids) {
    Get-NetTCPConnection -State Listen | Where-Object { $shiftPids -contains $_.OwningProcess } | Format-Table LocalAddress, LocalPort, OwningProcess
} else {
    Write-Host "No Shift processes"
}
