# Courier — Confirm & Assign (Step 3 of 3)

> **Route:** `courier-assign` · **Module:** `scripts/screens/courier.js` (step "assign")
> **Generated:** 11 Jul 2026

## Overview

Final confirmation before the locker opens. Shows which locker was
allocated (highlighted on a cabinet map), recaps the recipient and package,
and holds the locker via a reservation while the courier decides.

## Layout

- **Crumb row:** back button "Ganti Ukuran" (to Size) + "Langkah 3 dari 3".
- **Header:** "Konfirmasi Loker", title "Loker *{nn}*", subline "Sistem
  mengalokasikan loker kosong terdekat untuk {package size}."
- **Two-column body:**
  - **Left — locker map card:** "Peta Loker", "3 × 8" grid of all 24 cells;
    the allocated cell is highlighted gold ("Target"), occupied cells are
    dark ("Terisi"), free cells neutral ("Tersedia"); legend below.
  - **Right — summary column:** gold card "Penerima" (name, role ·
    department), card "Kiriman" (size icon, name, dimension caption), and
    the primary action button.

## Fields & actions

| Control | Label | Behavior |
|---|---|---|
| Back (crumb) | "Ganti Ukuran" | Releases the reservation, returns to Size with the locker cleared |
| Primary (gold, large) | "Buka Loker & Titipkan" | Navigate to Opening Locker with `openReason: "deliver"` |

## Interactions

### Page load
- Guard: missing `recipient`, `packageSize`, or `assignedLocker` → redirect
  to Search.
- **Reserves the allocated locker** (available → delivering) so no parallel
  session [TBC: single-kiosk today, relevant once multiple entry points
  exist] and no inactivity-abandoned flow can double-book it. The
  reservation is guarded: reserving a non-available locker is a no-op.

### Reservation release paths
The reservation is released (delivering → available) by any of:
- "Ganti Ukuran" back button (here),
- "Batal" on the next screen (Opening Locker, deliver variant),
- the global 60 s inactivity reset.
It is *consumed* (delivering → occupied) only by "Sudah Diletakkan" on the
next screen.

## API dependencies

| Need | Suggested endpoint | Trigger | Notes |
|---|---|---|---|
| Reserve locker | `POST /api/lockers/{id}/reserve` | Page load | 409 if no longer available → return to Size with message [TBC] |
| Release locker | `POST /api/lockers/{id}/release` | Back button | Guarded server-side |
| Locker map | `GET /api/lockers` | Page load | Full 24-cell state for the map |

## Screen relationships

- **From:** Courier — Size (tile tap).
- **To:** Opening Locker (`deliver`); Courier — Size ("Ganti Ukuran").

## Business rules

- The map is informational only — cells are not tappable; the courier
  cannot choose a different locker manually.
- Remounting this screen (e.g. via an in-flow back-and-forward) re-runs the
  reservation; the from-state guard makes the second call harmless.
