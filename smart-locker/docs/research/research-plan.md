# Research Plan — Loker Pintar FST Kiosk

> Workflow 1 of the `cs-ux-researcher` agent: research questions → methodology →
> participants → study materials → stakeholder alignment.
>
> **Status:** Draft for Sekretariat FST review · **Owner:** (fill in) · **Target window:** 2 weeks

## 1. Background & decision this research informs

The kiosk UI prototype is functionally complete (3 flows: staff self-access,
mail claim, courier delivery). Before investing in hardware integration and a
backend, we need evidence that:

- the flows match how dosen, tendik, and couriers actually behave, and
- the current UI can be operated unassisted by first-time users.

**Decisions informed:** go/no-go on lobby pilot; priority order of the Sprint 1
backlog; whether a PIN fallback and courier receipt are launch-blocking.

## 2. Research questions

| # | Question | Type |
|---|----------|------|
| RQ1 | Can a first-time courier deposit a package for a verbally-given name in under 2 minutes, unassisted? | Evaluative |
| RQ2 | Can dosen/tendik open their locker and claim mail in under 45 seconds? | Evaluative |
| RQ3 | What do recipients expect to happen after a package is deposited for them (notification channel, timing)? | Exploratory |
| RQ4 | How do staff currently receive mail/packages, and where does that process fail? | Exploratory |
| RQ5 | What would make staff *not* trust the locker with official documents? | Exploratory |

**What we already know (assumptions to validate):** ~250 staff at FST,
~20 deliveries/day estimated, front desk handles packages 07.30–16.00 only.
None of these numbers have been confirmed by the Sekretariat.

## 3. Methodology

Per the method-selection table in the skill:

| Question | Method | Why |
|----------|--------|-----|
| RQ1, RQ2 | Moderated guerrilla usability test on the prototype (lobby, 10.5" kiosk hardware) | Evaluative; behavior over opinion |
| RQ3, RQ4, RQ5 | Semi-structured intercept interviews (10 min) immediately after each test session | Exploratory; "why" needs conversation |

Prototype = current build served locally on the actual kiosk display, with the
3.5s auto-login **disabled** for test sessions (it would contaminate RQ2).

## 4. Participants

| Segment | n | Screening criteria |
|---------|---|-------------------|
| Dosen | 3 | Teaches ≥3 days/week; has received ≥1 package at campus this semester |
| Tendik | 2 | Handles documents or front-desk duty |
| Kurir | 3 | Active courier (JNE/J&T/SiCepat/GoSend etc.) delivering to campus; has never seen the kiosk |
| **Total** | **8** | 5–8 per the usability framework (5+ per design) |

Recruit dosen/tendik via Sekretariat; intercept couriers at the actual lobby
during 10.00–14.00 delivery peak. Incentive: snack/coffee voucher (couriers:
cash equivalent, keep it under 2 minutes of overhead).

## 5. Study materials

- Task scenarios and moderator script: see `usability-test-kit.md`
- Interview guide: section 6 below
- Note-taking template: see `usability-test-kit.md` §4
- Consent: verbal consent + session counter sheet (no audio recording of
  couriers without written consent; prefer observer notes)

## 6. Interview guide (post-test, 10 min)

Questions are non-leading, behavior-first, in Bahasa Indonesia:

1. "Ceritakan terakhir kali Bapak/Ibu menerima paket di kampus. Apa yang terjadi dari paket datang sampai di tangan Anda?" *(RQ4, context)*
2. "Apa bagian yang paling merepotkan dari proses itu?" *(RQ4, pain)*
3. "Kalau paket Anda dititipkan di loker ini, apa yang Anda harapkan terjadi selanjutnya?" *(RQ3 — do NOT suggest channels; probe: kapan? lewat apa?)*
4. "Dokumen seperti apa yang tidak akan Anda titipkan di loker ini? Kenapa?" *(RQ5, trust)*
5. (Kurir) "Setelah menitipkan paket, apa yang Anda butuhkan sebagai bukti untuk aplikasi kurir Anda?" *(receipt requirement)*
6. "Kalau boleh mengubah satu hal dari mesin tadi, apa yang Anda ubah?" *(reflection)*

## 7. Analysis plan

- Code transcripts/notes with tags: `[GOAL]` `[PAIN]` `[BEHAVIOR]` `[CONTEXT]` `[QUOTE]`
- Pattern threshold: 3+ participants mentioning = pattern
- Usability issues severity-rated 1–4 (see `usability-test-kit.md` §5)
- Outputs: findings report, updated personas (`personas.md`), prioritized
  issue list mapped to backlog items

## 8. Stakeholder alignment

- [ ] Share this plan with Sekretariat FST and get delivery-volume numbers
- [ ] Invite 1–2 stakeholders to observe sessions (target: ≥2 observers/study)
- [ ] Agree findings review date (within 1 week of last session)
- [ ] Agree that critical findings block the pilot; majors get fixed within 2 sprints

## 9. Timeline

| Day | Activity |
|-----|----------|
| 1–2 | Recruit dosen/tendik, prep kiosk + disable auto-login, dry-run the script |
| 3–5 | 8 sessions (test + interview), daily debrief |
| 6–7 | Synthesis (coding, severity rating), findings report |
| 8 | Stakeholder readout; backlog update |

## Success metrics for this study

| Metric | Target |
|--------|--------|
| Sessions completed | 8 |
| Participants matching screening criteria | >90% |
| Findings that become backlog items or design changes | >80% |
| Stakeholder observers per session | ≥2 |
