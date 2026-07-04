# ============================================================
# print-to-pdf.ps1
# ------------------------------------------------------------
# Cetak laporan-uts.html ke PDF dengan paginasi DETERMINISTIK
# menggunakan Chrome Headless. Hasilnya sama persis setiap kali
# dijalankan dan tidak terpengaruh dialog print / preferensi user.
#
# CARA PAKAI (PowerShell di folder docs):
#   ./print-to-pdf.ps1
#
# OUTPUT: laporan-uts.pdf di folder yang sama.
# ============================================================

$ErrorActionPreference = "Stop"

# 1) Cari Chrome (64-bit dulu, lalu 32-bit, lalu Edge sebagai fallback)
$chromeCandidates = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)
$chrome = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) {
    Write-Error "Chrome / Edge tidak ditemukan. Install Google Chrome dulu."
    exit 1
}
Write-Host "Browser : $chrome" -ForegroundColor Cyan

# 2) Path absolut HTML input dan PDF output
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlPath  = Join-Path $scriptDir "laporan-uts.html"
$pdfPath   = Join-Path $scriptDir "laporan-uts.pdf"

if (-not (Test-Path $htmlPath)) {
    Write-Error "File tidak ditemukan: $htmlPath"
    exit 1
}

# Format URL file:/// untuk Windows
$fileUrl = "file:///" + ($htmlPath -replace "\\", "/")
Write-Host "Input   : $htmlPath" -ForegroundColor Cyan
Write-Host "Output  : $pdfPath"  -ForegroundColor Cyan

# 3) Hapus PDF lama jika ada
if (Test-Path $pdfPath) { Remove-Item $pdfPath -Force }

# 4) Cetak ke PDF
#    --virtual-time-budget=20000  → kasih 20 detik agar diagram PlantUML
#                                   yang di-fetch dari server sempat loading.
#    --no-pdf-header-footer       → matikan header/footer browser default.
#    --print-to-pdf-no-header     → flag legacy, tetap dipasang utk kompatibilitas.
#    --hide-scrollbars            → cegah scrollbar muncul di hasil.
#    --run-all-compositor-stages-before-draw → tunggu semua paint selesai.
#    --disable-gpu                → wajib di Windows headless lama.
& $chrome `
    --headless=new `
    --disable-gpu `
    --hide-scrollbars `
    --no-pdf-header-footer `
    --print-to-pdf-no-header `
    --run-all-compositor-stages-before-draw `
    --virtual-time-budget=20000 `
    --print-to-pdf="$pdfPath" `
    "$fileUrl"

# 5) Polling 1 detik agar Chrome sempat flush ke disk (cegah false-negative)
for ($i = 0; $i -lt 5; $i++) {
    if (Test-Path -LiteralPath $pdfPath) { break }
    Start-Sleep -Milliseconds 200
}

if (Test-Path -LiteralPath $pdfPath) {
    $size = [math]::Round((Get-Item -LiteralPath $pdfPath).Length / 1KB, 0)
    Write-Host ""
    Write-Host ("OK. PDF dibuat: {0} ({1:N0} KB)" -f $pdfPath, $size) -ForegroundColor Green
} else {
    Write-Error "Gagal membuat PDF."
    exit 1
}
