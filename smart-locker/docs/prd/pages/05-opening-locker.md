# Opening Locker

> **Route:** `opening-locker` · **Module:** `scripts/screens/opening-locker.js`
> **Generated:** 11 Jul 2026

## Overview

The moment the physical locker door is (to be) unlocked. One screen serves
three scenarios, selected by `openReason`; the reason drives the color
accent, the copy, which locker is opened, what happens on completion, and
where "Batal" returns to.

| `openReason` | Scenario | Accent | Locker opened |
|---|---|---|---|
| `self` | Staff opens their personal locker | Green | The user's permanent locker |
| `claim-mail` | Staff collects a delivery | Gold | The locker holding the claimed mail item |
| `deliver` | Courier deposits a package | Gold | The locker reserved in the assign step |

## Layout

- **Eyebrow row:** status pill (text varies by reason, see below) + mono
  pill with the locker ID (e.g. "L-12").
- **Stage (center):** giant two-digit locker number inside animated rings,
  with size label (e.g. "Loker Sedang · L-12").
- **Message line** (varies by reason).
- **Foot:** countdown ring ("Waktu kunci otomatis", 30 → 0 s), primary
  action button, ghost "Batal".

### Copy by reason

| Element | self | claim-mail | deliver |
|---|---|---|---|
| Status pill | "Loker terbuka untuk Anda" | "Kiriman siap diambil" | "Paket siap diletakkan" |
| Message | "Silakan ambil atau letakkan barang Anda, lalu tutup kembali pintu loker." | "Silakan ambil kiriman Anda, lalu tutup kembali pintu loker." | "Silakan letakkan kiriman dan tutup pintu. Penerima akan dihubungi secara otomatis." |
| Primary button | "Selesai" | "Sudah Diambil" | "Sudah Diletakkan" |

## Interactions

### Page load
- Guard: resolves the target locker from state per the table above; if no
  locker can be resolved (missing state, direct navigation), redirect to
  Idle.
- Starts a **30-second countdown**; on real hardware this is when the
  unlock command fires (integration spec §6).

### Countdown reaches zero
- **Behavior:** identical to tapping the primary button (`finish`). The
  prototype assumes the action was completed; on real hardware the door
  sensor will confirm (B-04).

### Primary button ("Selesai" / "Sudah Diambil" / "Sudah Diletakkan")
- **self:** no data changes; navigate to Done.
- **claim-mail:** the mail item is removed from the pending list; if its
  locker was a courier-assigned one (not the recipient's permanent locker)
  and now holds no other mail, the locker returns to available.
- **deliver:** the reserved locker transitions delivering → occupied and is
  stamped with the recipient; the deposit is registered as a pending mail
  item (type = the chosen package size name, sender defaults to "Kurir").
- All three navigate to Done with `completedLocker` set.

### "Batal" — abort without success
- **deliver:** the reserved locker is released back to available, toast
  "Penitipan dibatalkan", return to Courier — Package Size.
- **claim-mail:** nothing is claimed, toast "Pengambilan dibatalkan",
  return to Mail List.
- **self:** return to Dashboard.
- In no case is the Done screen shown.

## API dependencies

| Need | Suggested endpoint | Trigger | Notes |
|---|---|---|---|
| Unlock locker | hardware bridge, `locker.unlock` | Page load | See `../../INTEGRATION-SPEC.md` §4 |
| Complete deposit | `POST /api/lockers/{id}/occupy` + `POST /api/mail` | deliver finish | Transactional pair; see api-inventory |
| Complete claim | `POST /api/mail/{id}/claim` | claim-mail finish | Frees non-permanent lockers server-side |
| Release reservation | `POST /api/lockers/{id}/release` | deliver cancel | Guarded: only from the delivering state |

## Screen relationships

- **From:** Dashboard (self), Mail List (claim-mail), Courier — Assign
  (deliver).
- **To:** Done (finish); Dashboard / Mail List / Courier — Size (cancel,
  by reason).

## Business rules

- The countdown is a *user* window, not an electrical hold: the lock is
  pulsed open once and re-latches mechanically (integration spec §3).
- Locker state changes are guarded: completing a deposit only succeeds from
  the "delivering" state, so double-taps or stray calls cannot corrupt
  inventory.

## [TBC]

- The deliver message promises "Penerima akan dihubungi secara otomatis",
  but notification is not implemented (backlog B-01). Copy should be
  adjusted or the feature shipped before pilot.
- Countdown expiry currently *completes* the flow even if the user walked
  away after the door opened. With a real door sensor this becomes the
  left-open failure case (integration spec §7).
