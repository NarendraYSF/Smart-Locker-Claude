# Journey Maps — Loker Pintar FST

> Workflow 3 of the `cs-ux-researcher` agent. Layers per stage: actions,
> touchpoints, emotions (1–5, estimated), pain points, opportunities.
> Emotions and pain points are hypotheses until the usability study runs.
>
> Opportunity priority = Frequency × Severity × Solvability (1–5 each).

---

## Journey A · Courier delivers a package (persona P3, highest risk)

**Trigger:** courier arrives with a package addressed to FST staff.
**Success:** package secured, proof of delivery captured, courier gone in <2 min.

| Stage | Actions | Touchpoint | Emotion | Pain points | Opportunities |
|-------|---------|------------|:-------:|-------------|---------------|
| Arrive | Spots kiosk, taps gold CTA | Idle screen | 4 | Kiosk visibility in lobby unknown | Signage; "Kurir mulai di sini" sticker |
| Find recipient | Types name from label | Search screen | 3 | Exact substring match; typos/nicknames fail; 12-result cap is silent | Fuzzy search; result count; degree-title stripping |
| Choose size | Compares package to printed dimensions | Size screen | 3 | Abstract cm dimensions | Physical size gauge next to kiosk; photos on tiles |
| Deposit | Door opens, places package, 30 s countdown | Opening screen | 2 | "Batal" shows success anyway; no door-closed confirmation | Real cancel path; door-sensor state (hardware phase) |
| Leave | Reads done screen, walks away | Done screen | 2 | No receipt/code to photograph; notification promised in copy but nonexistent | **Deposit code + WA/SMS notification — moment of truth** |

**Moments of truth:** (1) first search result — decides whether he trusts the
machine; (2) the done screen — decides whether he ever uses it again instead
of dumping at the front desk.

**Top opportunities (F×S×S):**
1. Deposit receipt code — 5×4×5 = **100**
2. Recipient notification — 5×4×4 = **80**
3. Fuzzy search — 4×4×5 = **80**

---

## Journey B · Dosen claims incoming mail (persona P1)

**Trigger:** (today) word of mouth / checking speculatively — there is no notification.
**Success:** mail in hand, locker closed, <45 s at the kiosk.

| Stage | Actions | Touchpoint | Emotion | Pain points | Opportunities |
|-------|---------|------------|:-------:|-------------|---------------|
| Learn of arrival | — (no channel exists) | none | 1 | Finds out days late or never | Arrival notification (the real product) |
| Authenticate | Taps staff CTA, taps card | Tap-card screen | 4 | Forgotten card = dead end | PIN / one-time code fallback |
| Review | Reads dashboard badge, opens mail list | Dashboard, mail list | 4 | 60 s idle reset can fire while reading | "Masih di sana?" warning at 50 s |
| Claim | Taps "Ambil", takes item | Opening screen | 4 | Same false-cancel issue as Journey A | Real cancel path |
| Done | Auto-return to idle | Done screen | 5 | — | — |

**Moment of truth:** the notification that doesn't exist yet. The in-kiosk
flow is already good (shortest, clearest journey) — the gap is entirely
*before* the user reaches the kiosk.

**Top opportunity:** arrival notification — 5×5×4 = **100**.

---

## Journey C · Dosen/Tendik opens own locker (persona P1/P2)

**Trigger:** wants to store or retrieve personal items.
**Success:** locker opened and closed, <45 s.

| Stage | Actions | Touchpoint | Emotion | Pain points | Opportunities |
|-------|---------|------------|:-------:|-------------|---------------|
| Authenticate | Taps staff CTA, taps card | Tap-card | 4 | Card fallback (as Journey B) | PIN fallback |
| Orient | Reads dashboard | Dashboard | 5 | — (clear layout) | — |
| Open | Taps "Buka Loker Saya" | Opening screen | 4 | 30 s fixed window; no extend option | "Tambah waktu" button on countdown |
| Close | Taps "Selesai" | Done screen | 4 | No door-left-open detection | Hardware-phase door sensor |

This journey is healthy. Only shared fixes (cancel path, PIN fallback) apply.

---

## Cross-journey synthesis

| Theme | Appears in | Backlog mapping |
|-------|------------|-----------------|
| Notification gap (before-kiosk experience) | A, B | Notification spike → build |
| False cancel / trust in confirmations | A, B, C | Sprint 1: real cancel path |
| Card-only auth | B, C | PIN fallback story |
| Search forgiveness | A | Sprint 1: fuzzy search |
| Proof of deposit | A | Sprint 1: receipt code |

Validate emotions and pain frequency in the usability study before re-scoring.
