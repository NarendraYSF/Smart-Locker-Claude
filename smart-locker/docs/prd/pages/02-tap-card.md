# Tap Card (RFID Authentication)

> **Route:** `tap-card` · **Module:** `scripts/screens/tap-card.js`
> **Generated:** 11 Jul 2026

## Overview

Staff authentication gate. Instructs the user to hold their UIN identity
card to the RFID reader below the screen. In the prototype the tap is
simulated; on real hardware the reader event will drive the same success
path (see `../../INTEGRATION-SPEC.md`).

## Layout

- **Header:** eyebrow "01 · Autentikasi Staf", title "Dekatkan *kartu* Anda",
  subline "ke area pembaca RFID di bawah layar."
- **Stage (center):** animated radar ripples around a stylized card visual
  ("Kartu Identitas UIN" / "Staf — FST" / masked digits).
- **Foot:** two buttons.
- **Hint row:** "Dev shortcut: Enter untuk simulasi tap" (development aid,
  should be removed for production [TBC]).

## Fields & actions

| Control | Label | Behavior |
|---|---|---|
| Ghost button | "Batal" | Return to Idle |
| Primary button | "Simulasikan Tap" | Simulates a successful card read |
| Keyboard: Enter | — | Same as "Simulasikan Tap" |
| Keyboard: Escape | — | Same as "Batal" |

## Interactions

### Page load
Static render. If the URL contains `?demo`, a successful tap is simulated
automatically after 3.5 s (exhibition mode only — otherwise the screen
waits indefinitely, bounded by the global 60 s inactivity reset).

### Successful tap
- **Trigger:** button, Enter key, `?demo` timer, or (future) real reader event.
- **Behavior:** the card UID is resolved to a staff record; the prototype
  always signs in a fixed demo user (NIP 198203102009011012, chosen because
  she has seeded mail). Navigates to Dashboard with `user` set.
- **Failure path:** an unrecognized card is **not handled in the prototype**
  — there is no error state on this screen. [TBC: production needs a
  "Kartu tidak dikenali" state; the UML activity diagram already models a
  toast + retry.]

## API dependencies

| Need | Suggested endpoint | Trigger | Notes |
|---|---|---|---|
| Resolve card UID to staff | `GET /api/staff/by-rfid/{uid}` | Card tap | 404 → show not-recognized state. See [api-inventory](../appendix/api-inventory.md) |

## Screen relationships

- **From:** Idle (CTA 1).
- **To:** Dashboard (success, passes `user`); Idle (cancel/escape).

## Business rules

- No PIN or second factor: possession of the card is the sole credential
  (documented as convenience-grade auth in the integration spec).
- The Enter shortcut and demo timer must never sign in a bystander in
  production: auto-tap is gated behind `?demo`, and the production URL
  must not carry that parameter (RUNBOOK §2).
