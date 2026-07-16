# Backlog — Loker Pintar FST

> Living document. Prioritization: RICE (see `product-review.html`), stories
> INVEST-validated with Given-When-Then acceptance criteria
> (format: agile-product-owner). Update after every sprint and after the
> usability study re-scores priorities.

## Sprint 1 — DONE (5 Jul 2026)

Velocity data point: ~17 pts committed, all completed in-session.

| ID | Story | Pts | Result |
|----|-------|-----|--------|
| S1-01 | Real cancel path on opening screen | 2 | `cancel()` per reason; toast; no false success |
| S1-02 | Locker inventory lifecycle | 3 | Guarded `reserve/release/occupy` + `recordDelivery`/`claimMail` |
| S1-03 | Gate auto-login behind `?demo` | 1 | Bystanders never signed in |
| S1-04 | Idle timeout warning | 2 | Overlay at T-10 s; `?idle=` override |
| S1-05 | Fuzzy recipient search + result count | 3 | Title-stripping, 1-typo tolerance, "Tampilkan lebih banyak" |
| S1-06 | Deposit receipt code | 5 | `FST-XXXXX`, 15 s auto-return |
| S1-07 | Help affordance | 2 | Footer button + overlay |

All verified by a 22-assertion headless suite (layout, cancel/release paths,
deliver-claim cycle, search, idle, help).

## Next up (priority order)

### B-01 · Recipient notification — 8 pts · HIGH

*As a dosen, I want to be notified when a package is deposited for me, so
that I can pick it up promptly without checking the locker speculatively.*

Blocked on: channel decision (WA Business API / SMS gateway / email) — spike
S2-spike below. Validate channel preference in the usability study (RQ3).

1. Given a completed deposit, when `recordDelivery` succeeds, then the
   recipient receives a message with locker number and receipt code within
   1 minute.
2. Given a notification failure, when delivery succeeds anyway, then the
   failure is logged and visible to the operator (no silent loss).
3. Given a claim, when the recipient picks up, then no further reminders send.

### S2-spike · Notification channel options — 3 pts

Compare WA Business API, SMS gateway, campus email: cost per message,
approval requirements (campus IT), deliverability. Output: 1-page decision doc.

### B-02 · PIN / one-time-code fallback auth — 5 pts · MEDIUM

*As a staff member who forgot my card, I want an alternative way to open my
locker, so that a forgotten card is an inconvenience, not a dead end.*

1. Given the tap-card screen, when I choose "Tanpa kartu", then I can request
   a one-time code sent via the notification channel (depends on B-01).
2. Given 3 failed code attempts, when I try again, then the flow locks for
   15 minutes and advises visiting the Sekretariat.

### B-03 · Admin console (Sekretariat) — 13 pts · MEDIUM — SPLIT BEFORE SPRINT

Epic; split by operation (CRUD split technique): view occupancy + audit log
(5), register/edit staff & cards (5), force-open + reassign locker (3).
Interview the Sekretariat first (missing persona P4 in `research/personas.md`).

### B-04 · Door-sensor & lock hardware integration — 8 pts · HIGH (pilot gate)

Replace simulated open/close with the adapter interfaces in `docs/uml/class.puml`
(`RfidReader`, `LockerHardware`). Requires the integration spec (docs TODO).

1. Given the opening screen, when hardware confirms the door closed, then the
   countdown ends without the user tapping anything.
2. Given a door left open past the countdown, when auto-lock cannot engage,
   then the kiosk shows a "tutup pintu" prompt and alerts the operator.

### B-05 · Physical size gauge + size-tile photos — 2 pts · LOW

Journey A finding: couriers guess sizes from printed cm dimensions.

## Docs backlog

- ~~Hardware/backend integration spec (before B-04)~~ — DONE:
  `docs/INTEGRATION-SPEC.md` (11 Jul 2026); open questions Q1–Q5 tracked there
- ~~Per-screen functional spec~~ — DONE: `docs/prd/` (11 Jul 2026); 9 screen
  docs + backend API inventory reverse-engineered from the mock data layer
- ~~Test plan / UAT checklist~~ — DONE: `docs/TEST-PLAN.md` (11 Jul 2026);
  64 kasus uji (ID) dipetakan ke 11 UC bab4 + UAT 3 persona; 4 regresi
  temuan PRD berstatus expected-fail
- ~~Materi cetak sisi kios~~ — DONE: `docs/print/` (11 Jul 2026); poster
  kurir + panduan staf (screenshot asli via `capture-screens.mjs`) +
  log kertas RUNBOOK §3.6 siap cetak A4
- ~~Data onboarding guide~~ — DONE: `docs/DATA-ONBOARDING.md` +
  `docs/ops/staff-template.csv` + `csv-to-data.mjs` (11 Jul 2026);
  sesi pendataan UID menunggu jawaban Q1 INTEGRATION-SPEC
- ~~Kiosk deployment & operations runbook~~ — DONE: `docs/RUNBOOK.md` +
  `docs/ops/start-kiosk.ps1` (11 Jul 2026)
- Usability findings report (after the study; template in
  `research/usability-test-kit.md` §6)
