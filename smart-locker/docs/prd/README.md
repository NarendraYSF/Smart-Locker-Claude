# Loker Pintar FST — Per-Screen Product Requirements

> Reverse-engineered from the prototype source (`scripts/`) using the
> code-to-prd workflow, 11 Jul 2026. Companion documents:
> `../PRD.md` (pilot goals & metrics), `../INTEGRATION-SPEC.md` (hardware
> contract), `../uml/` (diagrams).

## System overview

Loker Pintar FST is a touch-kiosk application for the smart locker cabinet
at Fakultas Sains dan Teknologi, UIN Syarif Hidayatullah Jakarta. It serves
two walk-up audiences with no training: **staff** (dosen and tenaga
kependidikan) who open their personal locker or collect incoming mail after
an RFID card tap, and **couriers/guests** who deposit letters or packages
for a staff member without involving the Sekretariat.

The prototype is a fixed 1080 × 1920 portrait canvas that scales itself to
any display. It is a single-page application: one persistent frame (header
with faculty branding and a live clock, footer with a help button) and a
stage area where one of nine screens is mounted at a time. **All data is
in-memory mock data** — every "API Dependencies" section in these documents
describes the *required backend endpoint*, reverse-engineered from the data
functions the screen calls (see [appendix/api-inventory.md](appendix/api-inventory.md)).

## Screen inventory

| # | Screen | Route key | Module | Doc |
|---|--------|-----------|--------|-----|
| 1 | Idle (welcome) | `idle` | `screens/idle.js` | [01-idle.md](pages/01-idle.md) |
| 2 | Tap Card (RFID auth) | `tap-card` | `screens/tap-card.js` | [02-tap-card.md](pages/02-tap-card.md) |
| 3 | Dashboard | `dashboard` | `screens/dashboard.js` | [03-dashboard.md](pages/03-dashboard.md) |
| 4 | Mail List | `mail` | `screens/mail.js` | [04-mail-list.md](pages/04-mail-list.md) |
| 5 | Opening Locker | `opening-locker` | `screens/opening-locker.js` | [05-opening-locker.md](pages/05-opening-locker.md) |
| 6 | Courier — Search Recipient | `courier-search` | `screens/courier.js` (step "search") | [06-courier-search.md](pages/06-courier-search.md) |
| 7 | Courier — Package Size | `courier-size` | `screens/courier.js` (step "size") | [07-courier-size.md](pages/07-courier-size.md) |
| 8 | Courier — Confirm & Assign | `courier-assign` | `screens/courier.js` (step "assign") | [08-courier-assign.md](pages/08-courier-assign.md) |
| 9 | Done (confirmation) | `done-screen` | `screens/done.js` | [09-done.md](pages/09-done.md) |

Navigation between screens is a function call (`navigate(route, ctx)`) that
merges `ctx` into a single global session state:

| State field | Type | Meaning |
|---|---|---|
| `user` | Staff or null | Signed-in staff member (set by tap-card) |
| `recipient` | Staff or null | Package recipient chosen by the courier |
| `packageSize` | PackageSize or null | Size tile chosen by the courier |
| `assignedLocker` | Locker or null | Locker allocated for the deposit |
| `openReason` | `"self"` \| `"claim-mail"` \| `"deliver"` \| null | Why the locker is being opened |
| `claimedMailId` | string or null | Mail item being collected |
| `completedLocker` | Locker or null | Locker shown on the Done screen |

## Global patterns (apply to every screen except where noted)

- **Inactivity reset.** On any screen except Idle, 60 s without a real touch/
  key event shows a "Masih di sana?" overlay with a 10-second countdown
  ("Sentuh layar untuk melanjutkan sesi Anda."). Any touch dismisses it; if
  it expires, the session state is cleared, any locker reserved by an
  abandoned courier flow is released, and the kiosk returns to Idle. URL
  parameter `?idle=N` overrides the timeout to N seconds (testing only).
- **Help overlay.** The footer button "Butuh bantuan?" (present on every
  screen) opens an overlay with the Sekretariat location, service hours,
  phone number, and problem-reporting guidance; "Tutup" or tapping outside
  closes it. Opening help does not disturb the session, but the inactivity
  timer keeps running.
- **Toasts.** Transient messages appear at the bottom for ~3.2 s (e.g.
  "Penitipan dibatalkan").
- **Demo mode.** With `?demo` in the URL, the Tap Card screen signs in a demo
  user automatically after 3.5 s. Never used in production.
- **Persistent frame.** Header: FST logo, faculty name, live date/time
  (Indonesian locale). Footer: service description and help button. These
  never unmount.

## Known copy/data inconsistencies found during analysis

- The Idle screen aside claims "48 unit · 3 ukuran" but the system data
  defines **24 lockers**. One of the two is wrong. [TBC]
- The Opening Locker screen (deliver variant) says "Penerima akan dihubungi
  secara otomatis", but recipient notification is **not implemented**
  (backlog B-01). Copy overpromises.
