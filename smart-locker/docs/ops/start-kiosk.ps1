# start-kiosk.ps1 — start the Loker Pintar FST kiosk.
# Starts a local static server for the app, waits until it responds,
# then launches Chrome in kiosk mode. Safe to run repeatedly: if the
# server is already up it just (re)launches Chrome.
#
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File start-kiosk.ps1
# See docs/RUNBOOK.md section 1.4 for autostart setup.

$ErrorActionPreference = "Stop"

$Port = 5173
$Url = "http://localhost:$Port"
# App root = two levels up from this script (docs/ops/ -> smart-locker/)
$AppRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

function Test-Server {
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return $resp.StatusCode -eq 200
    } catch {
        return $false
    }
}

# --- 1. Start the static server (unless already running) ---------------
if (-not (Test-Server)) {
    $python = Get-Command python -ErrorAction SilentlyContinue
    $npx = Get-Command npx -ErrorAction SilentlyContinue

    if ($python) {
        Write-Host "Starting python http.server on port $Port..."
        Start-Process -FilePath $python.Source `
            -ArgumentList "-m", "http.server", "$Port" `
            -WorkingDirectory $AppRoot -WindowStyle Hidden
    } elseif ($npx) {
        Write-Host "Python not found; starting 'npx serve' on port $Port..."
        Start-Process -FilePath $npx.Source `
            -ArgumentList "serve", ".", "-l", "$Port" `
            -WorkingDirectory $AppRoot -WindowStyle Hidden
    } else {
        Write-Error ("Neither python nor node (npx) was found on this PC. " +
            "Install Python (python.org) or Node.js (nodejs.org), then run this script again.")
        exit 1
    }

    # --- 2. Wait until the server responds (max ~30 s) ------------------
    $deadline = (Get-Date).AddSeconds(30)
    while (-not (Test-Server)) {
        if ((Get-Date) -gt $deadline) {
            Write-Error "Server did not respond at $Url within 30 seconds. Check that port $Port is free."
            exit 1
        }
        Start-Sleep -Milliseconds 500
    }
}

Write-Host "Server is up at $Url"

# --- 3. Launch Chrome in kiosk mode -------------------------------------
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
$chrome = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) {
    Write-Error "Chrome was not found. Install Google Chrome, then run this script again."
    exit 1
}

Write-Host "Launching Chrome kiosk..."
Start-Process -FilePath $chrome -ArgumentList `
    "--kiosk", "--app=$Url", `
    "--noerrdialogs", "--disable-session-crashed-bubble", "--incognito"
