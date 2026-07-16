# API Inventory — Reverse-Engineered Backend Spec

> **No API is integrated today.** All data lives in memory in
> `scripts/data.js`. This inventory reverse-engineers the backend contract
> the kiosk needs, one endpoint per data-layer function, following the
> code-to-prd "API not integrated" rule. The **hardware** side (RFID
> events, unlock commands, door sensors) is specified separately in
> [`../../INTEGRATION-SPEC.md`](../../INTEGRATION-SPEC.md) and is not
> duplicated here.
>
> Paths are suggestions; adjust to the chosen backend's conventions.

## Entities

| Entity | Key fields |
|---|---|
| Staff | `nip` (PK), `name`, `role`, `dept`, `initials`, `rfid` (unique), `lockerId` (permanent locker, nullable) |
| Locker | `id` (PK, "L-nn"), `number` (1–24), `size` (kecil/sedang/besar), `state` (available/delivering/occupied), `ownerNip` (nullable), `hasMail` (derived) |
| Mail | `id` (PK), `recipientNip` (FK Staff), `sender`, `type`, `note`, `arrivedAt` (ISO), `lockerId` (FK Locker) |

## Endpoints

### 1. Resolve card UID → staff — replaces `staff.find(by rfid)`

- **`GET /api/staff/by-rfid/{uid}`** — trigger: RFID tap event (Tap Card screen)
- Response 200: full Staff object; 404: unknown card → kiosk shows a
  not-recognized state (not yet built, see 02-tap-card [TBC])

### 2. Fuzzy staff search — replaces `searchStaff(q)`

- **`GET /api/staff?q={query}&offset=0&limit=12`** — trigger: each search
  keystroke (client currently unthrottled; server-side debounce or client
  throttle recommended [TBC])
- Business rules the server must reproduce (currently client-side):
  - Strip academic titles/degrees and honorifics from query and target
    (list in [enum-dictionary](enum-dictionary.md))
  - All query tokens must match some name/department token, any order,
    substring match
  - Tokens of 4+ characters tolerate one edit (insert/delete/substitute)
  - A query containing 4+ digits searches `nip` by substring instead
  - Empty query returns the full directory
- Response: `{ total, items: Staff[] }` — `total` drives the
  "Menampilkan X dari Y hasil" caption and the "Tampilkan lebih banyak"
  pagination (page size 12)

### 3. Pending mail for a user — replaces `mailFor(nip)`

- **`GET /api/staff/{nip}/mail`** — trigger: Dashboard and Mail List load
- Response: Mail[], sorted `arrivedAt` descending

### 4. Locker inventory & summary — replaces `lockers`, `countFree`, `findFreeLocker`

- **`GET /api/lockers`** — full 24-cell state; trigger: Assign screen map
- **`GET /api/lockers/summary`** — `{ kecil: n, sedang: n, besar: n, totalFree: n }`;
  trigger: Courier Search foot strip, Courier Size tiles
- **`GET /api/lockers/free?size={bucket}`** — first free locker (lowest
  number) of the bucket or 404; trigger: size tile tap

### 5. Reserve locker — replaces `reserveLocker(id)`

- **`POST /api/lockers/{id}/reserve`** — trigger: Assign screen mount
- Guard: only from state `available`; otherwise **409 Conflict** (the
  prototype returns null silently; production UI should return to the size
  screen with a "loker baru saja terisi" message [TBC])
- Response 200: Locker with `state: "delivering"`
- Server-side TTL recommended (mirror of the kiosk's 60 s inactivity
  release) so a crashed kiosk cannot strand reservations [TBC]

### 6. Release reservation — replaces `releaseLocker(id)`

- **`POST /api/lockers/{id}/release`** — triggers: "Ganti Ukuran", "Batal"
  on deliver, inactivity reset
- Guard: only from `delivering` (no-op / 409 otherwise — callers treat it
  as best-effort)
- Clears `ownerNip`, returns state to `available`

### 7. Complete deposit — replaces `occupyLocker(id, nip)` + `recordDelivery(...)`

- **`POST /api/deposits`** — trigger: "Sudah Diletakkan" (Opening Locker,
  deliver)
- Request: `{ lockerId, recipientNip, type, sender?: "Kurir", note?: "Titipan kurir" }`
- Atomic transaction: locker `delivering → occupied` (guarded, 409 on
  wrong state) + create Mail record (`id` from a server sequence;
  prototype uses M-101 upward) + set `hasMail`
- Response 201: `{ mail: Mail, receiptCode: "FST-XXXXX" }` — the prototype
  generates the receipt code client-side and never stores it; the server
  should own generation and persistence so codes are verifiable
  (RUNBOOK §3.4 dispute flow) [TBC]
- Side effect (planned, backlog B-01): enqueue recipient notification

### 8. Complete claim — replaces `claimMail(mailId)`

- **`POST /api/mail/{id}/claim`** — trigger: "Sudah Diambil" (Opening
  Locker, claim-mail)
- Request context: authenticated staff `nip` must equal `recipientNip`
  (the prototype cannot enforce this; the server must [TBC])
- Server logic (mirrors the prototype exactly):
  1. Remove the mail record
  2. Recompute the locker's `hasMail` from remaining mail
  3. If the locker is **not** the recipient's permanent locker AND now has
     no mail AND is `occupied` → free it (`available`, `ownerNip` null);
     permanent staff lockers stay `occupied`
- Response 200: the claimed Mail; 404 if already claimed

## Non-functional notes

- **Consistency:** counts shown on Search/Size and the Assign map should be
  read from the same source as the reservation guard, otherwise the 409
  path fires more often than users expect.
- **Idempotency:** endpoints 5–8 are state-machine guarded; safe retry
  semantics follow from the guards.
- **Auth:** staff endpoints (3, 8) require the tapped-card session;
  courier endpoints (2, 4–7) are anonymous by design.
- **Audit:** every transition in 5–8 should be logged (who/when/locker) —
  the missing access log is identified in the UTS report as a core problem
  the system exists to solve.
