# Mail List

> **Route:** `mail` · **Module:** `scripts/screens/mail.js`
> **Generated:** 11 Jul 2026

## Overview

Shows the signed-in user's pending deliveries (letters and packages waiting
in lockers), newest first, and lets them start the collection flow for any
item.

## Layout

- **Crumb row:** back button "Kembali" (to Dashboard) + right-aligned count
  "{n} kiriman".
- **Header:** eyebrow "02 · Kiriman Masuk", title "Surat & Paket untuk
  *{first name}*" (name truncated at the first comma, i.e. before academic
  degrees).
- **List (scrollable):** one row per mail item.
- **Foot:** ghost button "Tutup" (also returns to Dashboard).

## Fields

### Mail item row

| Element | Content | Notes |
|---|---|---|
| Icon | Envelope or box icon inferred from the type text ("surat" → envelope; "besar"/"sedang" → matching box; otherwise small box) | Text-matching heuristic |
| Sender | e.g. "Kantor Pos Ciputat", "JNE Express" | |
| Note | Italic free text, e.g. "Dokumen akademik" | |
| Meta | Type · "Loker {nn}" · relative age (e.g. "2 jam lalu") · arrival time | Relative formatting from the clock utility |
| Action | Gold button "Ambil" | Starts collection |

### Empty state

"Tidak ada kiriman saat ini." — normally unreachable (the Dashboard tile is
disabled at zero mail) but shown if the last item is claimed elsewhere or on
direct navigation.

## Interactions

### Page load
- Guard: no signed-in user → redirect to Idle.
- Loads pending mail for the user, sorted newest first.

### Collect an item
- **Trigger:** "Ambil" on a row.
- **Behavior:** navigates to Opening Locker with `openReason: "claim-mail"`
  and `claimedMailId` set to the row's mail ID. The mail is **not** yet
  marked collected — that happens only when the user confirms on the next
  screen.

## API dependencies

| Need | Suggested endpoint | Trigger | Notes |
|---|---|---|---|
| Pending mail for user | `GET /api/staff/{nip}/mail` | Page load | Same endpoint as Dashboard |

## Screen relationships

- **From:** Dashboard (tile 02); Opening Locker "Batal" (claim-mail variant).
- **To:** Opening Locker (`claim-mail`); Dashboard ("Kembali"/"Tutup").

## Business rules

- Sorting is strictly by arrival time descending; there is no read/unread
  concept — an item disappears only when claimed.
- A single locker can hold multiple mail items (e.g. the demo user's
  permanent locker holds two); each is listed and claimed separately.
