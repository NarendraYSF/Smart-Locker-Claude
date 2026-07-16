# Idle (Welcome)

> **Route:** `idle` · **Module:** `scripts/screens/idle.js`
> **Generated:** 11 Jul 2026

## Overview

The resting state of the kiosk and the entry point for both audiences. It
presents the service's purpose and two large call-to-action buttons: one
for staff (RFID authentication) and one for guests/couriers (deposit flow).
Every completed or abandoned session eventually returns here.

## Layout

- **Hero (top):** eyebrow "Loker Pintar · FST UIN Jakarta", headline
  "Ruang *aman* untuk dokumen, surat, dan paket Anda.", subline describing
  the service for staff and couriers.
- **Aside (right of hero):** three info rows — "Lokasi" (Gedung Dekanat FST ·
  Lt. 1, dekat Sekretariat), "Jam Layanan" (Senin–Jumat, 07.30–19.00 WIB),
  "Total Loker" ("48 unit · 3 ukuran" — inconsistent with the 24-locker
  inventory, see [TBC] below).
- **CTA row (bottom):** two giant buttons side by side.

## Fields & actions

| Button | Label | Behavior |
|---|---|---|
| CTA 1 (green) | "01 · Untuk Staf" / "Staf *Akademik*" / "Dekatkan kartu identitas UIN untuk membuka loker atau mengambil kiriman Anda." / foot: "Tap Kartu RFID" | Navigate to Tap Card |
| CTA 2 (gold) | "02 · Untuk Tamu & Kurir" / "Kirim *Surat* atau Paket" / "Titipkan kiriman untuk Dosen atau Tendik. Sistem akan memilih loker yang sesuai secara otomatis." / foot: "Pilih Penerima" | Navigate to Courier — Search |

## Interactions

### Page load
Static render; no data fetched. The inactivity checker is **stopped** on
this screen (there is no session to protect).

### Choose a path
- **Trigger:** tap either CTA.
- **Behavior:** navigates to `tap-card` (staff) or `courier-search`
  (courier). No state is set yet.

## API dependencies

None. This screen reads no data.

## Screen relationships

- **From:** every flow ends here — Done auto-return, inactivity timeout,
  "Batal" on Tap Card, "Selesai/Keluar" on Dashboard.
- **To:** `tap-card` (staff), `courier-search` (courier).

## Business rules

- Arrival at Idle always coincides with cleared session state (the callers
  clear it); Idle itself trusts that and stores nothing.

## [TBC]

- Aside claims "48 unit · 3 ukuran"; the data layer defines 24 lockers.
  Either the copy anticipates a larger production cabinet or it is stale.
