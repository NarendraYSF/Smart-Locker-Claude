# Hardware/Backend Integration Spec — Loker Pintar FST

> Status: **draft for review** · Unblocks backlog item **B-04** (door-sensor &
> lock hardware integration, pilot gate) in `docs/BACKLOG.md`.
>
> Audience: the developer implementing the bridge service and firmware, and
> the frontend developer wiring the adapters into the kiosk UI.

---

## 1. Purpose & scope

The kiosk prototype simulates all hardware today: the RFID tap is an
Enter key / on-screen button (`scripts/screens/tap-card.js`) and the door
close is the "Selesai / Sudah Diletakkan / Sudah Diambil" button
(`scripts/screens/opening-locker.js`). This document specifies the contract
for replacing those simulations with real hardware:

- **RFID reader** — staff authentication by campus ID card
- **Electromechanical locks** (12 V solenoid) — one per locker, 24 total
- **Door sensors** (reed switch) — one per locker, 24 total

It concretizes the three adapter interfaces already declared in
`docs/uml/class.puml`:

| Interface | Method(s) | Replaces |
|---|---|---|
| `RfidReader` | `onTap(callback)` | Enter-key / button simulation on the tap-card screen |
| `LockerHardware` | `unlock(lockerId)`, `onDoorClosed(callback)` | Button-driven `finish()` on the opening-locker screen |
| `NotificationGateway` | `notify(staff, mail)` | Not covered here — separate backlog item B-01 |

**Out of scope:** recipient notifications (B-01), the admin console (B-03),
persistence of locker state across restarts, and payment/billing of any kind.

### Inventory constants

The physical cabinet must match the seeded inventory in `scripts/data.js`:

- **24 lockers**, IDs `L-01` … `L-24`, numbered top-left to bottom-right in a
  3-column × 8-row grid
- Size distribution: `L-01`–`L-03` **besar** (row 1), `L-04`–`L-09` **sedang**
  (rows 2–3), `L-10`–`L-24` **kecil** (rows 4–8)

---

## 2. Architecture options

Both options expose the **same WebSocket contract to the browser**
(section 4), so the kiosk UI code is identical either way. The choice only
affects what runs below the WebSocket.

### Option A — ESP32 + bridge service on the Windows kiosk PC (baseline)

```
Chrome kiosk (browser)
   │  WebSocket ws://127.0.0.1:8765  (JSON, section 4)
Bridge service (Python, same PC)
   │  Serial-USB 115200 baud          (JSON frames, section 5)
ESP32 controller (in the cabinet)
   ├─ RFID reader (SPI)
   ├─ 24 relay channels → 12 V solenoids
   └─ 24 reed switches (via I/O expanders)
```

The existing Windows PC from `docs/RUNBOOK.md` stays as-is; the bridge is a
third process started by `docs/ops/start-kiosk.ps1` alongside the HTTP
server and Chrome. The ESP32 does all real-time I/O (debouncing reed
switches, pulsing relays), which a desktop OS is bad at.

### Option B — Raspberry Pi drives GPIO directly

```
Chrome kiosk (browser, on the Pi)
   │  WebSocket ws://127.0.0.1:8765  (same contract)
Bridge service (Python, on the Pi)
   │  gpiozero / lgpio
GPIO + I/O expanders (MCP23017 over I2C)
   ├─ RFID reader (SPI)
   ├─ relay boards → solenoids
   └─ reed switches
```

The Pi replaces the Windows PC entirely: it renders the kiosk UI **and**
drives the hardware, removing the serial hop and one device.

### Comparison

| Criterion | Option A (ESP32 + bridge) | Option B (Raspberry Pi) |
|---|---|---|
| Extra hardware | ESP32 (~Rp 60 rb) + existing PC | Pi 4/5 (~Rp 1–1,5 jt) replaces PC |
| I/O for 24+24 channels | MCU pins + expanders, real-time reliable | Same expanders, but timing at mercy of Linux scheduler |
| Ops fit | **Keeps RUNBOOK + start-kiosk.ps1 unchanged** | Rewrites deployment docs for Linux |
| Failure isolation | UI crash ≠ hardware crash (separate devices) | One device, one point of failure |
| Kiosk UI performance | Existing PC, known-good | Pi must drive 1080×1920 Chrome smoothly |
| Dev familiarity | Arduino ecosystem, easy bench testing | Requires Linux + GPIO experience |

### Decision

**Option A is the baseline.** Rationale: it preserves the entire existing
Windows deployment (runbook, autostart script, recovery procedures already
written for the Sekretariat), isolates real-time I/O in a microcontroller,
and is cheaper to add to the current setup. Option B remains documented as
a fallback if the pilot cabinet ends up needing a smaller physical footprint.
Everything from section 4 onward applies to both options unchanged.

---

## 3. Bill of materials (Option A)

| # | Item | Qty | Notes |
|---|---|---|---|
| 1 | ESP32 DevKit (WROOM-32) | 1 | USB-serial built in |
| 2 | RFID reader 13.56 MHz (MFRC522 or PN532) | 1 | Campus staff cards are assumed Mifare Classic/DESFire — **verify, open question Q1** |
| 3 | Relay board 8-channel, opto-isolated | 3 | 24 channels total; driven via MCP23017 |
| 4 | MCP23017 I/O expander (I2C) | 4 | 2 × outputs (relays), 2 × inputs (reed switches) |
| 5 | Solenoid lock 12 V DC (fail-secure) | 24 | ~650 mA inrush each; only one pulsed at a time |
| 6 | Reed switch + magnet (NC, surface mount) | 24 | One per door |
| 7 | PSU 12 V / 5 A switching | 1 | Solenoids pulsed one-at-a-time → 5 A is ample |
| 8 | PSU 5 V / 3 A (or buck from 12 V) | 1 | ESP32 + logic + relay coils |
| 9 | USB-A to micro-USB/USB-C cable, shielded, ≤3 m | 1 | PC ↔ ESP32 |

### Channel addressing

Locker IDs map to expander channels by number: locker `L-nn` → relay channel
`nn-1` and input channel `nn-1` (zero-based, `L-01` → channel 0 … `L-24` →
channel 23). The firmware holds this table; the wire protocols use only
locker numbers (1–24), so miswiring is fixed in one place (firmware config).

Electrical rules:

- Solenoids are **pulsed, never held**: `unlock` energizes the relay for
  1.5 s (configurable) and releases. The UI's 30 s countdown is a *user*
  window, not an electrical hold time — the door stays openable because the
  latch is mechanical once released.
- Reed switches are NC (closed = door closed) so a cut wire reads as
  "door open" — fail-loud, not fail-silent.
- All 24 inputs are debounced in firmware (25 ms).

---

## 4. Browser ↔ bridge WebSocket protocol

- Endpoint: `ws://127.0.0.1:8765` — **bound to loopback only** (section 8)
- Encoding: one JSON object per WebSocket text message
- Every message carries `v` (protocol version, currently `1`) and `type`

### 4.1 Events (bridge → browser)

| `type` | Payload | Emitted when |
|---|---|---|
| `rfid.tap` | `{ "uid": "04A1B2C3D4" }` | A card is read. `uid` is the card UID as uppercase hex, no separators |
| `door.closed` | `{ "locker": 7 }` | Reed switch closes after having been open |
| `door.open` | `{ "locker": 7 }` | Reed switch opens (informational; used for left-open detection) |
| `hw.status` | `{ "link": "up" \| "down" }` | Serial link to the ESP32 comes up or drops |

### 4.2 Commands (browser → bridge) and replies

Request: `{ "v": 1, "type": "locker.unlock", "id": "req-17", "locker": 7 }`

Reply (bridge → browser, matched by `id`):

- Ack: `{ "v": 1, "type": "ack", "id": "req-17" }` — relay pulsed and
  confirmed by firmware
- Nack: `{ "v": 1, "type": "nack", "id": "req-17", "error": "E_TIMEOUT" }`

Error codes:

| Code | Meaning | UI behavior |
|---|---|---|
| `E_TIMEOUT` | Firmware did not confirm within 2 s | Show retry prompt; after 2 failed retries show manual-key guidance (RUNBOOK 3.3) |
| `E_LINK_DOWN` | Serial link to ESP32 is down | Same as above, plus operator alert |
| `E_BAD_LOCKER` | Locker number outside 1–24 | Programming error; log and toast |

### 4.3 Heartbeat & reconnection

- Bridge sends `{ "type": "ping" }` every 10 s; browser replies `pong`.
  Two missed pongs → bridge drops the connection (stale client).
- The browser adapter reconnects with exponential backoff (1 s → 2 s → 4 s,
  cap 15 s). While disconnected the kiosk runs in **simulation mode**
  (section 6) so the UI never hard-fails.
- On (re)connect the bridge immediately sends `hw.status` so the adapter
  knows whether real hardware is live.

---

## 5. Bridge ↔ ESP32 serial protocol

- 115200 baud, 8N1, newline-delimited JSON (one frame per `\n`)
- Same shapes as section 4 minus `v`/`id` bookkeeping:

| Direction | Frame | Notes |
|---|---|---|
| PC → MCU | `{"c":"unlock","l":7}` | Pulse relay for locker 7 |
| MCU → PC | `{"e":"ack","l":7}` | Relay pulsed |
| MCU → PC | `{"e":"tap","uid":"04A1B2C3D4"}` | Card read |
| MCU → PC | `{"e":"door","l":7,"s":"open"\|"closed"}` | Debounced state change |
| MCU → PC | `{"e":"boot"}` | Firmware started; bridge re-syncs door states |
| PC → MCU | `{"c":"scan"}` | Request full door-state dump (after `boot` or bridge restart) |
| MCU → PC | `{"e":"state","doors":[0,0,1,...]}` | 24 entries, 1 = open |

Timeouts: the bridge waits **2 s** for `ack` after `unlock` before returning
`E_TIMEOUT` upstream. The bridge marks the link down (`hw.status: down`)
after 5 s of serial silence (firmware emits a `{"e":"hb"}` heartbeat every
2 s).

---

## 6. Frontend adapter design

New module (future work, not in this spec's deliverable):
`scripts/adapters/hardware.js`, implementing the `class.puml` interfaces:

```js
// Sketch — final API to be confirmed at implementation time
export const rfidReader = {
  onTap(cb) { /* subscribe to rfid.tap events */ }
};
export const lockerHardware = {
  unlock(lockerId) { /* send locker.unlock, return Promise<void> */ },
  onDoorClosed(cb) { /* subscribe to door.closed, filter by locker */ }
};
```

Integration points in the existing screens:

- `tap-card.js` — `rfidReader.onTap(uid)` looks up `staff.find(s => s.rfid === uid)`
  and calls the same success path as today's `simulate()`. The Enter-key
  shortcut and `?demo` auto-tap **remain** as simulation fallbacks.
- `opening-locker.js` — `lockerHardware.unlock(locker.id)` fires on mount;
  `onDoorClosed` triggers the same `finish()` the button calls today,
  satisfying B-04 acceptance criterion 1 (countdown ends without a tap).
  The buttons remain as fallback.

**Simulation mode is the default.** The adapter attempts the WebSocket
connection at boot; if unavailable (or after disconnection), all methods
fall back to today's simulated behavior. This means the same build runs on
a developer laptop with no hardware, and the kiosk degrades gracefully if
the bridge crashes mid-session.

---

## 7. Failure modes & timeouts

| Failure | Detection | System behavior |
|---|---|---|
| Door closed by user | `door.closed` event | Countdown stops, proceed to Done — **B-04 AC 1** |
| Door left open past 30 s countdown | No `door.closed` when countdown hits 0 | Show persistent "Tutup pintu loker" prompt; after +60 s emit operator alert (screen banner + log) — **B-04 AC 2** |
| Unlock not confirmed | `E_TIMEOUT` nack | Retry ×2, then guide user to Sekretariat (manual key, RUNBOOK 3.3) |
| ESP32 offline | `hw.status: down` / `E_LINK_DOWN` | Kiosk switches to simulation mode + shows "layanan loker terganggu" notice on courier entry points |
| Bridge process dead | WebSocket unreachable | Same as above (adapter fallback) |
| Reed switch wire cut | NC switch reads "open" permanently | Locker appears stuck-open → operator investigates; deposits to it are blocked |
| Kiosk PC reboot | — | `start-kiosk.ps1` restarts bridge + server + Chrome; bridge sends `scan` to re-sync door states |

All in-memory state limitations from RUNBOOK section 4 still apply: a
restart loses the day's deposits regardless of hardware state.

---

## 8. Security notes

- The bridge binds to `127.0.0.1` **only**. No LAN exposure, no
  authentication needed beyond OS process boundaries.
- Card UIDs are opaque tokens: the wire never carries names or NIPs. The
  UID→staff mapping lives only in the kiosk's data layer.
- Mifare Classic UIDs are clonable; RFID here is *convenience-grade*
  authentication, acceptable for a locker pilot but worth stating: the
  paper log (RUNBOOK 3.6) remains the dispute-resolution mechanism.
- Firmware accepts only the two commands in section 5; there is no remote
  flash/update path over this link.

---

## 9. Acceptance test checklist

Bench tests (bridge + ESP32 on a desk, 2 relays + 2 reed switches):

- [ ] `locker.unlock` pulses the correct relay and returns `ack` < 2 s
- [ ] `unlock` with serial cable pulled returns `E_LINK_DOWN`; reconnect recovers within 5 s
- [ ] Card tap emits `rfid.tap` with the expected UID (test with 3 different cards)
- [ ] Opening/closing a reed switch emits `door.open` / `door.closed` exactly once each (debounce)
- [ ] Bridge restart mid-session: browser reconnects and receives `hw.status: up` + fresh door states

End-to-end (full cabinet, kiosk UI):

- [ ] **B-04 AC 1:** staff opens locker, closes the door → countdown ends and Done screen shows without any button tap
- [ ] **B-04 AC 2:** door left open past countdown → "tutup pintu" prompt shows, operator alert fires after grace period
- [ ] Courier deposit: unlock → deposit → door close → receipt code shown; locker state OCCUPIED
- [ ] Kill the bridge process mid-flow → kiosk falls back to simulation buttons without a crash
- [ ] Power-cycle the whole cabinet → kiosk self-restores per RUNBOOK 1.7 checklist

---

## 10. Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| Q1 | What card technology do FST staff IDs actually use (Mifare Classic? DESFire? 125 kHz)? Determines reader choice (item 2 in BOM) | Sekretariat + developer | BOM purchase |
| Q2 | Cabinet fabrication: are the 24 lockers an existing cabinet retrofit or new build? Affects solenoid mounting and wire routing | Fakultas | Install date |
| Q3 | PSU + wiring enclosure placement and mains access at the install site | Fakultas | Install date |
| Q4 | Who owns and maintains the bridge service + firmware code after the pilot? | Prodi / developer | Handover plan |
| Q5 | Alert channel for the "door left open" operator alert during the pilot — screen banner only, or also a message to the Sekretariat? | Sekretariat | Section 7 finalization |
