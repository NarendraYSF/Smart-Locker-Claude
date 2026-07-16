# Dashboard

> **Route:** `dashboard` · **Module:** `scripts/screens/dashboard.js`
> **Generated:** 11 Jul 2026

## Overview

The signed-in staff member's home. Greets the user, summarizes their locker
and incoming mail at a glance, and offers three actions: open their personal
locker, view/collect mail, or sign out.

## Layout

- **Hero:** avatar (initials) with ring accent; greeting "Assalamualaikum,",
  the user's full name, and three meta pills: role ("Dosen" or
  "Tenaga Kependidikan"), department, "NIP {number}".
- **Summary row:** three stat items.
- **Action tiles:** three large buttons.

## Fields

### Summary row

| Item | Label | Value | Notes |
|---|---|---|---|
| 1 | "Loker Anda" | Two-digit locker number (e.g. "12"), "--" if the user has no locker | From the user's permanent locker assignment |
| 2 | "Kiriman Baru" | Two-digit count of pending mail | Gold-highlighted when > 0 |
| 3 | "Status" | Always "Aktif" | Hardcoded [TBC: presumably future account status] |

### Action tiles

| Tile | Labels | Enabled when | Behavior |
|---|---|---|---|
| 01 · Akses Pribadi (green) | "Buka *Loker Saya*" / "Loker {nn} akan terbuka selama 30 detik." / foot "Loker {nn}" | Always | Navigate to Opening Locker with `openReason: "self"` |
| 02 · Kiriman (gold) | "Surat & *Paket*" / badge with mail count, or pill "Kosong" / foot "Ambil kiriman" or "Tidak ada kiriman" | Mail count > 0 (disabled and dimmed at 0) | Navigate to Mail List |
| 03 · Keluar | "*Selesai*" / foot "Kembali ke beranda" | Always | Return to Idle (sign out) |

## Interactions

### Page load
- Guard: if no signed-in user in state, redirect to Idle (protects against
  direct navigation).
- Loads the user's pending mail (count drives tile 02 state) and their
  permanent locker record (number drives tile 01 labels).

### Sign out
- **Trigger:** tile 03.
- **Behavior:** navigates to Idle. Note: `user` is not explicitly cleared
  here; it is cleared by whichever exit path follows (Done screen or
  inactivity reset). Since Idle stores nothing, this is benign in the
  prototype. [TBC: production should clear the session explicitly on exit.]

## API dependencies

| Need | Suggested endpoint | Trigger | Notes |
|---|---|---|---|
| Pending mail for user | `GET /api/staff/{nip}/mail` | Page load | Count + list; newest first |
| User's locker record | `GET /api/lockers/{id}` | Page load | Number, size, state |

## Screen relationships

- **From:** Tap Card (with `user`); Opening Locker "Batal" (self variant);
  Mail List "Kembali"/"Tutup".
- **To:** Opening Locker (`openReason: "self"`); Mail List; Idle.

## Business rules

- Greeting hint differentiates by role (Dosen vs Tenaga Kependidikan), but
  the visible greeting is the same "Assalamualaikum," for both.
- The mail tile is a hard gate: with zero mail it cannot be tapped, so the
  Mail List's empty state is normally unreachable from here.
