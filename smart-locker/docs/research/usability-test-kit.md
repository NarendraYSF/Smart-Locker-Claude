# Usability Test Kit — Loker Pintar FST

> Workflow 4 of the `cs-ux-researcher` agent: test plan, task scenarios,
> moderator script, note-taking template, severity framework, report template.
> Companion to `research-plan.md` (which covers recruiting and scheduling).

## 1. Setup

- Prototype served locally on the real 10.5" kiosk display, portrait
- **Disable the 3.5 s auto-login** in `scripts/screens/tap-card.js` for
  sessions (it falsifies task timing); keep the Enter shortcut as the
  moderator's "simulated card tap"
- One moderator + one note-taker; observers behind the participant
- Timer app; printed note sheets (§4); a real shoebox-sized package as a prop

## 2. Task scenarios

Tasks are **scenarios with goals**, not instructions. Read aloud in Bahasa
Indonesia. Do not name buttons or screens.

### T1 · Warm-up + self-access (dosen/tendik)
> "Bayangkan Bapak/Ibu baru selesai mengajar dan ingin menyimpan dokumen di
> loker pribadi Anda. Silakan gunakan mesin ini seperti biasa."

- **Success:** reaches opening-locker screen and completes with "Selesai"
- **Expected time:** 30 s · **Fail threshold:** 60 s or assist requested

### T2 · Claim mail (dosen/tendik)
> "Kemarin ada kabar bahwa ada kiriman untuk Anda di loker. Silakan ambil
> kiriman itu."

- **Success:** navigates dashboard → mail list → "Ambil" → done
- **Expected time:** 45 s · **Fail threshold:** 90 s

### T3 · Deliver a package (kurir) — core task
> Hand the participant the prop package with a label:
> **"Budi Santoso — Fakultas Sains dan Teknologi"** (note: label omits titles;
> directory entry is "Prof. Budi Santoso, Ph.D." — this is deliberate).
> "Antarkan paket ini seperti Anda bekerja biasa. Anggap saya tidak ada."

- **Success:** recipient found, size chosen, deposit confirmed
- **Expected time:** 90 s · **Fail threshold:** 3 min or abandonment
- **Watch for:** search term used, reaction to size tiles, what they do at
  the done screen (do they look for a receipt? photograph the screen?)

### T4 · Edge case — cancel midway (all)
> "Ternyata paket ini salah alamat. Batalkan prosesnya."

- **Success:** user believes the operation was cancelled
- **Known defect:** "Batal" currently shows a success screen — record
  whether the participant notices and how they react (validates severity)

### T5 · Free exploration (2 min, all)
> "Silakan coba apa pun yang ingin Anda coba. Ceritakan yang Anda pikirkan."

## 3. Moderator script

**Intro (2 min):**
> "Kami menguji mesinnya, bukan Anda — tidak ada jawaban salah. Sambil
> mencoba, tolong ceritakan apa yang sedang Anda pikirkan. Saya tidak bisa
> membantu selama tugas berlangsung, tapi setelah selesai kita bisa
> berdiskusi. Boleh kami catat jalannya sesi?"

**During tasks — non-leading prompts only:**
- "Apa yang sedang Anda cari?"
- "Apa yang Anda harapkan terjadi barusan?"
- (if stuck >20 s in silence) "Ceritakan yang Anda pikirkan."

**Never say:** button names, screen names, "coba tekan…", "sudah benar kok".

**Post-task (after each):** "Dari 1 sampai 5, seberapa mudah tugas tadi?
Apa yang paling membingungkan?"

**Debrief:** run the interview guide from `research-plan.md` §6.

## 4. Note-taking template

One sheet per participant per task:

```
Participant: P__  Segment: dosen / tendik / kurir     Task: T__
Completed:  YES / YES-with-struggle / ASSISTED / FAILED / ABANDONED
Time: ____ s        Errors (wrong taps): ____
First reaction (verbatim): ................................................
Where they hesitated: ......................................................
Quotes: ....................................................................
Ease rating (participant, 1–5): ____
Observer severity guess (1–4): ____
```

## 5. Severity + analysis framework

| Severity | Definition | Action |
|----------|------------|--------|
| 4 Critical | Prevents task completion | Fix immediately, blocks pilot |
| 3 Major | Significant difficulty or error | Fix before release |
| 2 Minor | Hesitation, self-recovered | Fix when possible |
| 1 Cosmetic | Noticed, no impact | Backlog |

**Metrics targets (from the framework):**

| Metric | Target |
|--------|--------|
| Task completion rate | >80% |
| Time on task | <2× expected |
| Error rate | <15% |
| Post-task ease | >4/5 |

**Analysis steps:** compute per-task success/time → cluster observed issues →
severity-rate each (pattern = 3+ participants) → map to backlog items →
re-test criticals after fixes.

## 6. Findings report template

```
# Usability Findings — Round 1 (date)

## Executive summary (3–5 bullets)

## Results by task
| Task | Completion | Median time | Target | Verdict |

## Issues (severity-sorted)
### ISS-01 · [title] — Severity N
Evidence: (participant count, quotes, timings)
Recommendation: (specific design/code change)
Backlog item: (link)

## Persona updates
(what the sessions confirmed/refuted in personas.md)

## Re-test plan
(criticals to verify after fixes)
```

## 7. Known defects going in

Log these ahead of sessions so notes distinguish "known" from "new":

1. "Batal" on opening screen shows success (T4 validates severity)
2. No receipt/code on courier done screen (T3 watches for the need)
3. Recipient search is exact-substring (T3's label is designed to trip it)
4. 60 s idle reset without warning (may fire during think-aloud — note it)
