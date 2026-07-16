# Courier — Package Size (Step 2 of 3)

> **Route:** `courier-size` · **Module:** `scripts/screens/courier.js` (step "size")
> **Generated:** 11 Jul 2026

## Overview

Second step of the deposit flow: the courier declares the package size so
the system can allocate an appropriately sized locker. Availability per
size is shown live; sold-out sizes cannot be selected.

## Layout

- **Crumb row:** back button "Ganti Penerima" (to Search) + "Langkah 2 dari 3".
- **Header:** recipient recap (avatar, "Untuk {Dosen|Tenaga Kependidikan}",
  recipient name) and subline "Pilih ukuran kiriman agar sistem memilihkan
  loker yang sesuai."
- **Size grid:** four tiles.

## Fields

### Size tiles

| Tile | Dimension caption | Maps to locker size |
|---|---|---|
| "Surat" | "Max A4 · < 2cm" | kecil |
| "Paket Kecil" | "Max 25 × 20 × 10 cm" | kecil |
| "Paket Sedang" | "Max 40 × 30 × 25 cm" | sedang |
| "Paket Besar" | "Max 60 × 45 × 40 cm" | besar |

Each tile shows either "**{n}** loker tersedia" or, when none are free,
"Loker penuh untuk ukuran ini" with the tile disabled and dimmed.

Note: "Surat" and "Paket Kecil" share the same locker pool (both map to
small lockers), so their availability numbers are always identical.

## Interactions

### Page load
- Guard: no `recipient` in state → redirect back to Search.
- Counts free lockers per size bucket to label/disable tiles.

### Pick a size
- **Trigger:** tap an enabled tile.
- **Behavior:** the first free locker of that size (lowest number, i.e.
  nearest the top of the cabinet) is chosen and passed forward; navigate to
  Courier — Confirm & Assign with `packageSize` and `assignedLocker` set.
  The locker is **not yet reserved** — reservation happens when the assign
  screen mounts.
- **Race note:** between load and tap the last locker could theoretically
  be taken; the guard is the reservation on the next screen. [TBC: the
  prototype does not surface a "just sold out" message; production should.]

## API dependencies

| Need | Suggested endpoint | Trigger | Notes |
|---|---|---|---|
| Free count per size | `GET /api/lockers/summary` | Page load | Buckets: kecil / sedang / besar |
| Find free locker | `GET /api/lockers/free?size={bucket}` | Tile tap | Returns lowest-numbered free locker |

## Screen relationships

- **From:** Courier — Search (with `recipient`); Courier — Assign
  "Ganti Ukuran"; Opening Locker "Batal" (deliver variant).
- **To:** Courier — Assign (passes `packageSize` + `assignedLocker`);
  Courier — Search ("Ganti Penerima").

## Business rules

- Allocation strategy is first-free-by-number within the size bucket; there
  is no proximity or load-balancing logic beyond that.
- A package must fit the declared size; there is no physical validation —
  the courier self-declares (a physical size gauge is backlog B-05).
