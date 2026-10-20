# Launches a packaged Windows build and fails unless it opens a window.
# 1.35.0 built fine but crashed in its ready handler and never showed a window, so
# a green build alone does not mean the app starts.
param([string]$Exe = "packaged\win-unpacked\wnr.exe", [int]$TimeoutSec = 30)

$ErrorActionPreference = "Stop"
$proc = Start-Process -FilePath $Exe -PassThru
$deadline = (Get-Date).AddSeconds($TimeoutSec)
$ok = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 1
    if (Get-Process -Name wnr -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }) {
        $ok = $true
        break
    }
    if ($proc.HasExited) { break }
}
Get-Process -Name wnr -ErrorAction SilentlyContinue | Stop-Process -Force
if ($ok) {
    Write-Host "wnr opened a window"
    exit 0
}
Write-Host "wnr did not open a window within $TimeoutSec s"
exit 1
