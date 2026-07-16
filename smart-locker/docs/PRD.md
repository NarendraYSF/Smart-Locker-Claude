# PRD — Pilot Loker Pintar FST

> One-page PRD (format: product-manager-toolkit). **Status:** Draft for
> Sekretariat FST review · **Owner:** (fill in) · **Last updated:** 5 Jul 2026

## Problem

Packages and documents for ~250 dosen/tendik FST arrive at a front desk that
is only staffed 07.30–16.00. Recipients teach through delivery hours, find out
about packages late or never, and the Sekretariat carries liability for items
it stores ad hoc. Couriers wait or dump packages unattended.

## Goal & success metrics

**Objective:** make the smart locker the default, trusted channel for staff
deliveries at FST — replacing ad-hoc front-desk handling.

| Key result | Baseline | Target (end of pilot semester) |
|---|---|---|
| Incoming staff packages routed through the locker | 0% | 60% |
| Median kiosk session duration | unknown | < 45 s |
| Packages picked up within 24 h of deposit | n/a | > 90% |
| Usability task success (moderated test) | unmeasured | > 80% |
| Locker faults unresolved after 1 business day | n/a | 0 |

## Users

Personas in `research/personas.md` (proto, pending validation): **Dosen**
(fast tap-and-go, needs arrival notification), **Tendik** (traceability,
audit), **Kurir** (first-time user, < 2 min, needs proof of deposit).
Operator: **Sekretariat admin** (not served by the current UI — see risks).

## Scope — pilot

**In:**

- Current kiosk UI (post-Sprint 1) on one 10.5" 16:10 unit, FST lobby
- 24 lockers, 3 sizes; three flows: self-access, mail claim, courier deposit
- Receipt code on deposit; idle warning; help overlay; fuzzy recipient search
- Real RFID reading and lock actuation (hardware integration — required
  before pilot; adapter points documented in the code and UML)
- Paper fallback log at the Sekretariat for disputes

**Out (explicitly):**

- Automatic recipient notification (WA/SMS/email) — top backlog item, spiked
  during pilot but not launch-blocking *if* the Sekretariat forwards arrivals
  manually in week 1–2
- Admin console (staff registration, locker reassignment, force-open) —
  Sekretariat operates via developer support during pilot
- PIN/one-time-code fallback auth; payment; multi-kiosk; i18n

## Requirements (numbered, testable)

1. Staff with a registered RFID card can open their own locker in < 45 s
   from idle, unassisted.
2. A first-time courier can deposit a package for a recipient known only by
   name (no titles, 1 typo tolerated) in < 2 min, unassisted.
3. Every deposit produces a photographable receipt code shown ≥ 15 s and
   registers the package as claimable by the recipient.
4. Cancelling any flow returns the user without a success message and frees
   any reserved locker (locker inventory must be stable across a full day).
5. The kiosk warns before its 60 s inactivity reset and never strands a
   session silently.
6. Help/contact information is reachable from every screen.
7. (Hardware) Lock opens only after the kiosk commands it; door state is
   reflected in the UI within 1 s. *(spec to be written before integration)*

## Risks & open questions

- **No notification at launch** — the core promise ("penerima dihubungi")
  stays manual; measure pickup-within-24h closely in weeks 1–2.
- **No admin tooling** — jams and mis-deposits need developer intervention;
  acceptable for one kiosk, not beyond pilot.
- **Unvalidated assumptions** — delivery volume (~20/day) and channel
  preferences come from guesses; run `research/research-plan.md` before or
  during week 1.
- Open: who owns the kiosk hardware budget? Which courier companies deliver
  most volume at FST?

## Milestones

1. Usability study (1 week, `research/usability-test-kit.md`) → fix criticals
2. Hardware integration spec + bench test
3. Lobby pilot, 1 semester, metrics reviewed monthly with Sekretariat
