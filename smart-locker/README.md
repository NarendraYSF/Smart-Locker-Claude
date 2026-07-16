# Loker Pintar FST — Kiosk UI Prototype

Static, portrait-orientation kiosk UI for the smart locker system serving **Dosen & Tenaga Kependidikan FST UIN Syarif Hidayatullah Jakarta**.

Pure HTML + CSS + vanilla JS. No build step, no dependencies except Google Fonts.

## Design Direction

**Calm Academic Futurism** — a dark, confident interface anchored by UIN's institutional green with warm-gold accents for courier/delivery flows. Editorial serif (Fraunces) handles hero typography; a tight sans (Inter Tight) handles UI; mono (JetBrains Mono) handles IDs and NIPs. A faint Islamic geometric pattern drifts behind every screen.

**Canvas:** 1080 × 1920 portrait. The kiosk auto-scales to fit any viewport for development without changing its intended proportions.

## Running

The app uses native ES modules, so browsers will refuse to load it over `file://`. Serve the folder from any local HTTP server.

```bash
# from the smart-locker/ folder

# option A — python (ships with macOS/Linux; on Windows if Python installed)
python -m http.server 5173

# option B — node
npx serve .

# option C — deno
deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts
```

Then open <http://localhost:5173>.

## User Flows

### Flow 1 — Dosen / Tendik opens their own locker

1. **Idle** → tap *"Staf Akademik"*.
2. **Tap Card** → simulated RFID success after ~3.5s, or press **Enter** for an instant tap (dev shortcut).
3. **Dashboard** shows the signed-in staff, their locker number, and a badge for incoming mail.
4. Tap **"Buka Loker Saya"** → **Opening Locker** screen with a 30s countdown.
5. Tap **"Selesai"** → **Done** confirmation → auto-returns to Idle in 5s.

### Flow 2 — Staff claims incoming mail

1. Dashboard → tap the gold **"Surat & Paket"** tile.
2. **Mail List** shows each item with sender, type, arrival time, and assigned locker.
3. Tap **"Ambil"** on any item → **Opening Locker** (gold accent) → **Done**.

### Flow 3 — Courier delivers a package

1. **Idle** → tap *"Kirim Surat atau Paket"*.
2. **Recipient Search** — search by name, department, or NIP.
3. **Package Size** — pick Surat, Paket Kecil, Paket Sedang, or Paket Besar.
4. **Confirm** — the system picks the nearest free locker of the matching size and shows it highlighted on the locker-grid viewport.
5. Tap **"Buka Loker & Titipkan"** → **Opening Locker** (gold) → **Done**.

## Dev Shortcuts

| Key | Effect |
| --- | --- |
| `Enter` | Simulate RFID tap on the Tap Card screen |
| `Escape` | Cancel Tap Card and return to Idle |
| Any interaction | Resets the 60-second inactivity timer |
| No input for 60s | Auto-returns to Idle from any non-idle screen |

Open the browser devtools console and you have access to `window.__kiosk` with `{ navigate, state, toast }` for manual testing:

```js
__kiosk.navigate("dashboard", { user: __kiosk.state.user });
__kiosk.toast("Hello from devtools");
```

## File Structure

```
smart-locker/
  index.html                 # shell, fonts, CSS/JS hookup
  styles/
    tokens.css               # colors, typography, spacing, motion variables
    base.css                 # reset, typography, utilities
    layout.css               # kiosk frame + portrait auto-scale
    components.css           # buttons, cards, locker-cell, pills, field, avatar
    motion.css               # keyframes: stagger-in, ripple, unlock-pop, pulse
    screens.css              # per-screen compositions
  scripts/
    app.js                   # state machine + screen router + inactivity
    data.js                  # mock staff, lockers, mail, package sizes
    screens/
      idle.js                # ambient welcome
      tap-card.js            # simulated RFID
      dashboard.js           # post-auth dashboard
      opening-locker.js      # giant locker number + countdown
      mail.js                # incoming mail list
      courier.js             # search -> size -> assign
      done.js                # success confirmation
    utils/
      dom.js                 # hyperscript `h()` + inline-SVG `icon()`
      clock.js               # live Jakarta date/time + relative formatting
  assets/
    pattern-geo.svg          # subtle 8-point star backdrop
```

## Product Docs

- `docs/PRD.md` — pilot PRD: problem, success metrics, scope, requirements
- `docs/BACKLOG.md` — living backlog: Sprint 1 results + prioritized next stories
- `docs/RUNBOOK.md` — kiosk ops: deployment, URL params, recovery steps (ID) + `docs/ops/start-kiosk.ps1`
- `docs/INTEGRATION-SPEC.md` — hardware integration contract: ESP32/Pi options, WebSocket + serial protocols, failure modes, B-04 acceptance tests
- `docs/prd/` — per-screen functional spec (9 screens), enum dictionary, navigation map, reverse-engineered backend API inventory
- `docs/TEST-PLAN.md` — rencana pengujian black-box (ID): 64 kasus uji dipetakan ke 11 use case BAB IV + UAT per persona
- `docs/print/` — materi cetak sisi kios (ID): poster kurir "3 Langkah", panduan staf, log kertas §3.6 — buka di browser lalu Cetak/Print; screenshot di-refresh via `capture-screens.mjs`
- `docs/DATA-ONBOARDING.md` — prosedur memuat direktori staf asli: formulir CSV Sekretariat, sesi pendataan kartu RFID, konverter `docs/ops/csv-to-data.mjs`
- `docs/product-review.html` — full product & UX review (printable)
- `docs/uml/` — five PlantUML diagrams, current with the post-Sprint 1 code

## UX Research

Research artifacts live in `docs/research/` (produced with the `cs-ux-researcher` workflow):

- `research-plan.md` — 2-week study plan: questions, methodology, participants, timeline
- `personas.md` — 3 proto-personas (low confidence, pending validation)
- `journey-maps.md` — journey maps for the 3 flows with prioritized opportunities
- `usability-test-kit.md` — task scenarios, moderator script, severity framework, report template

## Scope Boundary

This prototype is **UI only**. Explicitly out of scope:

- Real RFID reading, real unlock hardware, real backend
- Real authentication/authorization
- Internationalization (copy is Indonesian with Arabic salutation)
- Persistent state across reloads

Once the hardware side is ready, each screen's `mount()` becomes an adapter: replace the simulated 3.5s RFID timeout with a real reader event, replace the 30s countdown with a real "door is closed" signal, and replace the mock data module with API calls. The visual language and state machine stay.
