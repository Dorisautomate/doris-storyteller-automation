$edgePids = (Get-Process msedge -ErrorAction SilentlyContinue).Id
if ($edgePids) {
    Get-NetTCPConnection -State Listen | Where-Object { $edgePids -contains $_.OwningProcess } | Format-Table LocalAddress, LocalPort, OwningProcess
} else {
    Write-Host "No Edge processes"
}
