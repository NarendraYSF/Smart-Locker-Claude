# Proto-Personas — Loker Pintar FST

> Workflow 2 of the `cs-ux-researcher` agent. These are **proto-personas**
> derived from code review, domain context, and assumptions — **not** research
> data. Per the persona-methodology validity criteria:
>
> **Confidence: LOW · Sample size: 0 users · Data sources: 0 of 2 minimum.**
> Do not treat these as production personas until validated through the study
> in `research-plan.md`. Each persona lists its riskiest assumptions.

---

## P1 · Bu Arini — "Dosen padat jadwal" (primary)

> "Saya cuma punya sepuluh menit di antara kelas. Kalau ambil paket harus
> antre di sekretariat, ya besok-besok saja."

| | |
|---|---|
| Role | Dosen, Teknik Informatika |
| Age range | 35–50 |
| Tech proficiency | High (daily laptop + smartphone, campus apps) |
| Usage frequency | 2–4×/month (packages), daily walk-past |

**Goals**
- Pick up mail/packages in under a minute, between classes or after hours
- Know a package arrived *without* having to check physically

**Behaviors**
- On campus 4–5 days/week but rarely near the Sekretariat
- Orders books/documents to campus because home delivery is less secure

**Frustrations (assumed)**
- Front desk closed by the time she's free (after 16.00)
- No arrival notification today — finds out days later
- Card sometimes left in the other bag → needs a fallback

**Design implications**
- → Arrival notification is the killer feature, not the door
- → Tap-to-open must stay under 45 s end-to-end
- → PIN/one-time-code fallback for forgotten cards

**Riskiest assumptions to validate:** notification channel preference
(WhatsApp? email? SMS?); actual package frequency; after-hours pickup demand.

---

## P2 · Pak Rudi — "Tendik penjaga dokumen" (primary)

> "Kalau dokumen dinas hilang, yang dicari ya saya."

| | |
|---|---|
| Role | Tenaga Kependidikan, Sekretariat/administration |
| Age range | 30–55 |
| Tech proficiency | Medium |
| Usage frequency | Weekly (official documents in/out) |

**Goals**
- Hand over documents with a traceable record (who, what, when)
- Reduce interruptions from staff asking "paket saya sudah datang belum?"

**Behaviors**
- Currently the human fallback: signs for packages, stores them, chases recipients
- Trusts paper logs; skeptical of systems without an audit trail

**Frustrations (assumed)**
- Blamed when packages go missing under the current ad-hoc process
- No visibility into locker contents/occupancy — can't answer questions

**Design implications**
- → Audit log of deposits/claims (even a read-only list) builds trust
- → Admin view: occupancy, force-open, reassignment (currently missing entirely)
- → The locker should *reduce* his workload, not add a system to babysit

**Riskiest assumptions to validate:** whether tendik are users, operators, or
both; what record-keeping is required by faculty administration rules.

---

## P3 · Mas Dedi — "Kurir kejar setoran" (first-time user)

> "Dua menit per alamat. Lebih dari itu, rute saya berantakan."

| | |
|---|---|
| Role | Courier (JNE/J&T/SiCepat/GoSend) |
| Age range | 20–35 |
| Tech proficiency | High on his courier app, zero on this kiosk |
| Usage frequency | First-time, every time (high driver turnover) |

**Goals**
- Deposit the package and get proof of delivery, fast
- Never need to talk to anyone or wait

**Behaviors**
- Knows the recipient only as a (possibly misspelled) name on a label
- Photographs everything as evidence for his app
- Will abandon and dump the package at the front desk if the kiosk stalls

**Frustrations (assumed)**
- Search fails on typos/nicknames ("Pak Budi" vs "Prof. Budi Santoso, Ph.D.")
- No receipt/code after deposit → nothing to photograph as proof
- Guessing package size categories from printed dimensions

**Design implications**
- → Fuzzy, forgiving recipient search; show result counts
- → Deposit receipt code on the done screen, photographable
- → Physical size gauge sticker next to the kiosk beats on-screen dimensions

**Riskiest assumptions to validate:** courier tolerance time before abandoning;
whether their apps accept a code/photo as proof of delivery.

---

## Missing persona (strategic gap)

**P4 · Admin Sekretariat** — the system has no admin surface: no staff
registration, locker reassignment, force-open, or audit log. Before building
P4's tooling, interview the Sekretariat to learn who would operate the system
day-to-day. Track as a discovery item, not a UI fix.

---

## Validation checklist (from persona methodology)

- [ ] Based on 20+ users (currently: 0)
- [ ] At least 2 data sources — planned: intercept interviews + usability sessions
- [ ] Frustrations include frequency counts (currently: assumptions)
- [ ] Reviewed with customer-facing staff (Sekretariat front desk)
- [ ] Segment sizes cross-checked (staff directory, delivery logs)
- [ ] Refresh after the study in `research-plan.md`, then semi-annually
