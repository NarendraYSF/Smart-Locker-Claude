# Courier — Search Recipient (Step 1 of 3)

> **Route:** `courier-search` · **Module:** `scripts/screens/courier.js` (step "search")
> **Generated:** 11 Jul 2026

## Overview

First step of the deposit flow: the courier finds the staff member the
package is addressed to. Search is deliberately forgiving because couriers
type from package labels — academic titles and honorifics are ignored and
one typo is tolerated.

## Layout

- **Crumb row:** back button "Batal" (to Idle) + "Langkah 1 dari 3".
- **Header:** "Untuk Tamu & Kurir", title "Kirim untuk *siapa?*", subline
  "Cari Dosen atau Tenaga Kependidikan berdasarkan nama, departemen, atau
  NIP.", search field, result count line.
- **Recipient list (scrollable, touch-pannable).**
- **Foot strip:** "Data disediakan oleh Sekretariat FST" + live free-locker
  count "{n} loker tersedia".

## Fields

### Search field

| Property | Value |
|---|---|
| Placeholder | "Cari nama, departemen, atau NIP" |
| Autocomplete | Off |
| Behavior | Live filtering on every keystroke; resets pagination to the first 12 results |

### Result count line

- "0 hasil" when nothing matches
- "Menampilkan {shown} dari {total} hasil" when truncated
- "{total} hasil" otherwise

### Recipient row

| Element | Content |
|---|---|
| Avatar | Initials; green gradient for Dosen, darker gradient for Tenaga Kependidikan |
| Name | Full name with titles, e.g. "Dr. Arini Hidayati, M.Kom." |
| Meta | Role · Department · "· NIP {number}" |
| Action | Whole row is the button |

### Empty state

"Tidak ada staf cocok dengan pencarian. Coba nama tanpa gelar, departemen,
atau NIP."

### Pagination

Results render 12 at a time; a full-width ghost button "Tampilkan lebih
banyak ({remaining} lagi)" appends the next 12.

## Interactions

### Page load
Shows the full staff directory (empty query = all staff), first 12 rows.

### Search
- **Trigger:** typing in the field.
- **Matching rules (fuzzy):**
  - Academic titles/degree fragments (dr, prof, mkom, phd, …) and
    honorifics (pak, bu, ibu, bapak, mas, mbak) are stripped from both the
    query and the target before matching.
  - Query tokens may appear in any order; every token must match some
    name/department token (substring match).
  - Tokens of 4+ characters tolerate a single character edit
    (insertion, deletion, or substitution) — "budhi" finds "Budi".
  - A query containing 4+ digits searches the NIP by substring instead.

### Select recipient
- **Trigger:** tap a row.
- **Behavior:** navigate to Courier — Package Size with `recipient` set.

## API dependencies

| Need | Suggested endpoint | Trigger | Notes |
|---|---|---|---|
| Fuzzy staff search | `GET /api/staff?q={query}` | Each keystroke (debounce recommended server-side [TBC]) | Fuzzy rules above must live server-side; see api-inventory |
| Free locker count | `GET /api/lockers/summary` | Page load | Foot strip figure |

## Screen relationships

- **From:** Idle (CTA 2); Courier — Size "Ganti Penerima".
- **To:** Courier — Size (passes `recipient`); Idle ("Batal").

## Business rules

- No authentication: couriers are anonymous. The recipient's NIP is shown
  in results — an accepted privacy trade-off for label matching. [TBC:
  consider masking part of the NIP in production.]
