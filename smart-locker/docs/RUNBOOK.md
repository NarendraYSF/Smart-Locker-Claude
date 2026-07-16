# Kiosk Operations Runbook — Loker Pintar FST

> Audience: **sections 1–2** technical operator (English) · **section 3**
> petugas Sekretariat FST (Bahasa Indonesia) · **section 4** everyone.
>
> Kiosk hardware: Windows PC/mini-PC driving a 10.5" 16:10 touch display,
> portrait orientation.

---

## 1. Deployment (Windows kiosk PC)

### 1.1 Get the app onto the PC

Copy (or `git clone`) the repository so the app lives at a stable path, e.g.
`C:\kiosk\smart-locker\`. The deployable unit is the `smart-locker/` folder
only — `docs/` is not needed on the kiosk but does no harm.

### 1.2 Serve the app

The app uses native ES modules, so it **cannot** be opened via `file://` —
it must be served over HTTP. Either server works; python is preferred (no
first-run download):

```powershell
# option A — python
cd C:\kiosk\smart-locker
python -m http.server 5173

# option B — node
cd C:\kiosk\smart-locker
npx serve . -l 5173
```

In practice you will not run these by hand — use the helper script (1.4).

### 1.3 Chrome in kiosk mode

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --kiosk --app=http://localhost:5173 `
  --noerrdialogs --disable-session-crashed-bubble --incognito
```

- `--kiosk` — fullscreen, no address bar, no tabs
- `--incognito` — no "restore pages?" prompts after a crash
- `--noerrdialogs --disable-session-crashed-bubble` — suppress popups a
  passerby could interact with

To exit kiosk mode with a keyboard attached: `Alt+F4` (or `Ctrl+Alt+Del` →
Task Manager on a touch-only unit).

### 1.4 Helper script + autostart

`docs/ops/start-kiosk.ps1` starts the server (python, falling back to npx),
waits until `http://localhost:5173` responds, then launches Chrome in kiosk
mode. To make the kiosk self-start after boot or power loss:

1. `Win+R` → `shell:startup` → Enter
2. Create a shortcut there with target:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\kiosk\smart-locker\docs\ops\start-kiosk.ps1"`
3. Set the kiosk PC to log in automatically (`netplwiz`, untick "Users must
   enter a user name and password") so a reboot goes straight to the kiosk.

Alternative: register the same command in Task Scheduler, trigger "At log on".

### 1.5 Display, sleep, and updates

```powershell
# never sleep, never blank the screen (run once, as admin)
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
```

- **Portrait rotation:** Settings → System → Display → Display orientation →
  *Portrait*. The app scales itself to any viewport (`fitKiosk()` in
  `scripts/app.js`), but the physical panel must be rotated in Windows.
- **Screensaver:** Settings → Personalization → Lock screen → Screen saver →
  *None*.
- **Windows Update:** set Active Hours to 07.00–19.00 so forced reboots do
  not happen during service hours (Settings → Windows Update → Advanced).

### 1.6 Touch keyboard

The courier search field needs an on-screen keyboard on a touch-only kiosk:
Settings → Time & language → Typing → Touch keyboard → enable **"Show the
touch keyboard when there's no keyboard attached"**.

### 1.7 First-boot verification checklist

- [ ] Whole kiosk canvas visible in portrait — header, footer, both idle CTAs
- [ ] Staff list on the courier search screen scrolls with a finger swipe
- [ ] Tap-card screen **waits** (no auto-login) — URL has no `?demo`
- [ ] Touch keyboard appears when tapping the search field
- [ ] "Butuh bantuan?" button in the footer opens the help overlay
- [ ] Clock shows correct Jakarta time
- [ ] Pull the power plug, restore it: kiosk returns to the idle screen
      without human help

---

## 2. URL parameter reference

| Parameter | Effect | Use |
|---|---|---|
| `?demo` | Tap-card screen signs in a demo user automatically after 3.5 s | Exhibitions / self-running demos only. **Never in production** — anyone near the kiosk would be signed in |
| `?idle=N` | Overrides the 60 s inactivity timeout to N seconds (warning overlay still appears 10 s before reset) | Testing only |

Combined example for a fast-cycling demo: `http://localhost:5173/?demo&idle=20`.
Production URL is always plain `http://localhost:5173`.

---

## 3. Operasional Harian & Pemulihan (untuk Petugas Sekretariat)

### 3.1 Pemeriksaan pagi (30 detik)

1. Layar menampilkan halaman sambutan dengan dua tombol besar
   ("Staf Akademik" dan "Kirim Surat atau Paket").
2. Jam di pojok kanan atas menunjukkan waktu yang benar.
3. Sentuh layar sekali — layar merespons.

Jika ketiganya baik, kiosk siap. Jika tidak, ikuti bagian 3.2.

### 3.2 Layar beku, kosong, atau tidak merespons

1. Tunggu 10 detik — bisa jadi kiosk sedang kembali ke layar awal.
2. Jika tetap beku: tekan tombol power PC **sekali, singkat** (jangan
   ditahan), tunggu PC mati, lalu nyalakan kembali.
3. Kiosk akan menyala sendiri sampai layar sambutan (± 2 menit).
4. **Catat kejadian di log kertas** (lihat 3.6) — data titipan hari itu
   hilang saat kiosk dinyalakan ulang (keterbatasan prototipe, bagian 4).
5. Jika kiosk tidak kembali normal setelah 2× percobaan, hubungi pengembang
   (3.7).

### 3.3 Pintu loker tidak terbuka

1. Catat **nomor loker** yang bermasalah.
2. Buka pintu dengan **kunci manual** (dipegang Sekretariat).
3. Serahkan isi loker langsung ke penerima, minta tanda tangan di log kertas.
4. Tempel penanda "TIDAK DIPAKAI" pada loker tersebut sampai diperbaiki.
5. Catat di log kertas + laporkan ke pengembang.

### 3.4 Salah titip / paket tertinggal / komplain kurir

1. Minta **Kode Bukti Titip** (format `FST-XXXXX`) dari kurir atau penerima —
   kurir difoto kodenya saat menitipkan.
2. Cocokkan dengan log kertas.
3. Buka loker terkait dengan kunci manual bila perlu, selesaikan serah terima
   secara manual, dan catat tindakan di log.

### 3.5 Kiosk mati setelah listrik padam

Kiosk seharusnya menyala kembali **otomatis** sampai layar sambutan. Jika
tidak: nyalakan PC dengan tombol power, tunggu ± 2 menit. Jika tetap tidak
muncul layar sambutan, hubungi pengembang.

### 3.6 Log kertas (sumber kebenaran selama pilot)

Sediakan buku log di Sekretariat dengan kolom:

| Tanggal/Jam | No. Loker | Kode Bukti Titip | Kejadian | Tindakan | Paraf |
|---|---|---|---|---|---|

Isi setiap kali ada: restart kiosk, buka manual, komplain, atau serah terima
di luar sistem.

### 3.7 Eskalasi

Hubungi pengembang jika: kiosk tidak pulih setelah 2× restart, pintu loker
rusak fisik, atau ada perselisihan yang tidak terjawab oleh log kertas.
**Kontak pengembang:** (isi nama + nomor WA).

---

## 4. Known limitations (pilot phase)

- **All state is in memory.** A browser refresh or PC restart erases that
  day's deposits, claims, and locker occupancy. The paper log (3.6) is the
  source of truth. For this reason, do **NOT** schedule automatic nightly
  restarts or "maintenance reboots" — restart only to recover from a fault,
  and log it when you do.
- **Fonts need internet.** Offline, the kiosk falls back to system fonts —
  functional but visually degraded. Self-host the fonts before a
  permanently-offline installation.
- **No notification** to recipients yet (top backlog item `B-01`) — during
  the pilot the Sekretariat forwards arrival info manually.
- **No admin console** — staff/locker data changes require the developer
  (backlog `B-03`).
- RFID tap and door lock are **simulated** until hardware integration
  (backlog `B-04`); the kiosk currently confirms deposits on button taps.
