# Done (Confirmation)

> **Route:** `done-screen` · **Module:** `scripts/screens/done.js`
> **Generated:** 11 Jul 2026

## Overview

Success confirmation after any completed locker operation, then automatic
return to Idle. Courier deposits additionally show a receipt code and stay
on screen three times longer so the courier can photograph it as proof of
delivery.

## Layout

- **Check icon** (gold accent for courier/claim scenarios, green for self).
- **Title and subline** (vary by scenario, below).
- **Receipt card** (deliver only): label "Kode Bukti Titip" + code.
- **Locker detail strip:** "Loker {nn} • {L-id} • {Kecil|Sedang|Besar}".
- **Foot:** ghost button "Kembali Sekarang" + auto-return caption
  "Kembali otomatis dalam {n} detik" (live countdown).

### Copy by scenario

| `openReason` | Title | Subline | Auto-return |
|---|---|---|---|
| `deliver` | "Terima kasih, kiriman telah *tersimpan*." | "Tunjukkan atau foto kode di bawah ini sebagai bukti penitipan. Penerima dapat mengambil kiriman dalam jam layanan." | 15 s |
| `claim-mail` | "Kiriman telah *diambil*." | "Semoga harinya menyenangkan. Jangan lupa tutup kembali pintu loker dengan rapat." | 5 s |
| `self` | "Loker telah *ditutup*." | "Semoga harinya menyenangkan, hati-hati di perjalanan." | 5 s |

## Receipt code

- Format: `FST-XXXXX` — five characters from the alphabet
  `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (0/O and 1/I/L excluded so a phone
  photo is unambiguous).
- Generated client-side per deposit and **displayed only** — it is not
  stored anywhere in the prototype. During the pilot the Sekretariat's
  paper log is the matching record (RUNBOOK §3.4/3.6). [TBC: production
  should persist the code with the delivery record; see api-inventory.]

## Interactions

### Page load
Starts the auto-return countdown (15 s deliver / 5 s otherwise); the
caption updates every second.

### Return to Idle
- **Trigger:** "Kembali Sekarang" or countdown reaching zero.
- **Behavior:** the entire session state (`user`, `recipient`,
  `packageSize`, `assignedLocker`, `openReason`, `claimedMailId`,
  `completedLocker`) is cleared and the kiosk returns to Idle.

## API dependencies

None directly (all state changes happened on the Opening Locker screen).
If receipt persistence is added, the deposit endpoint should return the
code to display (see [api-inventory](../appendix/api-inventory.md)).

## Screen relationships

- **From:** Opening Locker (finish, any reason; passes `completedLocker`).
- **To:** Idle (always; state cleared).

## Business rules

- This screen is unreachable via cancel paths — "Batal" never shows a
  success message (a deliberate Sprint 1 fix).
- After a deposit, the recipient's mail list already contains the new item;
  the staff member will see it on their next sign-in.
