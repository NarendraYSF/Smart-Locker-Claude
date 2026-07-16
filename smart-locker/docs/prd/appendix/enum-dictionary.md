# Enum Dictionary

> All enumerated values in the system, with every value listed. Source:
> `scripts/data.js`, `scripts/app.js`, screen modules. Generated 11 Jul 2026.

## Locker state (`locker.state`)

| Value | Meaning | Entered by |
|---|---|---|
| `available` | Empty, can be allocated to a deposit | Seed; release; claim emptying a non-permanent locker |
| `delivering` | Reserved for an in-progress courier deposit | Reserve (assign screen mount) |
| `occupied` | Holds contents; `ownerNip` records for whom | Seed (permanent lockers); deposit completion |

Note: the data file comment also mentions `assigned`, but no code ever sets
it — it is a leftover from an earlier design. [TBC: remove from the comment.]

Transitions are guarded — each mutation function rejects (returns null) if
the locker is not in the expected from-state. See `../../uml/locker-state.puml`.

## Locker size (`locker.size`) and cabinet layout

| Value | Display label | Cells (3 × 8 grid, numbered top-left → bottom-right) | Count |
|---|---|---|---|
| `besar` | "Besar" / "Loker Besar" | L-01 – L-03 (row 1) | 3 |
| `sedang` | "Sedang" / "Loker Sedang" | L-04 – L-09 (rows 2–3) | 6 |
| `kecil` | "Kecil" / "Loker Kecil" | L-10 – L-24 (rows 4–8) | 15 |

Locker IDs: `L-01` … `L-24` (zero-padded two digits).

## Package size (`packageSizes`, courier flow)

| id | Name | Dimension caption | Locker bucket |
|---|---|---|---|
| `surat` | "Surat" | "Max A4 · < 2cm" | kecil |
| `kecil` | "Paket Kecil" | "Max 25 × 20 × 10 cm" | kecil |
| `sedang` | "Paket Sedang" | "Max 40 × 30 × 25 cm" | sedang |
| `besar` | "Paket Besar" | "Max 60 × 45 × 40 cm" | besar |

## Staff role (`staff.role`)

| Value | Notes |
|---|---|
| `Dosen` | Green avatar gradient; greeting hint "Dr./Prof." |
| `Tenaga Kependidikan` | Dark avatar gradient; greeting hint "Staf" |

## Departments (`departments`)

Teknik Informatika · Sistem Informasi · Matematika · Fisika · Kimia ·
Biologi · Agribisnis. (Staff records also use "Sekretariat FST", which is
not in the departments list. [TBC: unify.])

## Open reason (`state.openReason`)

| Value | Scenario | Accent | Primary button | Cancel returns to |
|---|---|---|---|---|
| `self` | Personal locker access | Green | "Selesai" | Dashboard |
| `claim-mail` | Collect a delivery | Gold | "Sudah Diambil" | Mail List |
| `deliver` | Courier deposit | Gold | "Sudah Diletakkan" | Courier — Size |

## Screen route keys (`SCREENS` map)

`idle` · `tap-card` · `dashboard` · `opening-locker` · `courier-search` ·
`courier-size` · `courier-assign` · `mail` · `done-screen`

## Mail item fields

| Field | Example | Notes |
|---|---|---|
| `id` | "M-001", "M-101" | Seeded items M-001…M-004; new deposits M-101 upward |
| `recipientNip` | "198203102009011012" | |
| `sender` | "JNE Express"; deposits default to "Kurir" | |
| `type` | "Surat", "Paket Kecil/Sedang/Besar" | Free text; drives the list icon by substring match |
| `note` | "Dokumen akademik"; deposits default to "Titipan kurir" | |
| `arrivedAt` | ISO timestamp | Displayed as relative age + time |
| `lockerId` | "L-12" | |

## Receipt code alphabet

`23456789ABCDEFGHJKMNPQRSTUVWXYZ` — 31 characters; excludes 0/O and 1/I/L
for photo legibility. Format `FST-` + 5 characters. Display-only in the
prototype.

## Timers & URL parameters

| Constant | Value | Meaning |
|---|---|---|
| Locker-open countdown | 30 s | Opening Locker screen |
| Done auto-return | 5 s (15 s for deliver) | Done screen |
| Inactivity timeout | 60 s (override `?idle=N`) | All non-idle screens |
| Inactivity warning | timeout − 10 s (min: timeout/2) | "Masih di sana?" overlay with 10 s countdown |
| Demo auto-tap | 3.5 s, only with `?demo` | Tap Card screen |
| Toast duration | 3.2 s | Global |
| Search page size | 12 | Courier — Search "Tampilkan lebih banyak" |

## Stripped tokens in fuzzy search

Titles/degrees: dr, prof, drs, dra, ir, st, mt, msi, mkom, skom, ssi, se,
mm, mpd, spd, msc, phd, ph, d, magri, magr.
Honorifics: pak, bu, ibu, bapak, mas, mbak.
