# UML Diagrams — Loker Pintar FST

Seven PlantUML sources modeling the kiosk system. They reflect the current
prototype (`scripts/app.js`, `scripts/data.js`, `scripts/screens/*`) **after
the Sprint 1 fixes**, and also mark the planned hardware adapters (RFID
reader, locker hardware, notification service) as `<<adapter>>` /
`<<device>>` so the diagrams stay valid once the real backend is wired in.

| File | Diagram |
| --- | --- |
| `use-case.puml` | Use case diagram — actors, system boundary, include/extend |
| `activity.puml` | Activity diagram — three swimlanes (User / Kiosk / Hardware), all 3 flows with cancel branches |
| `class.puml`    | Class diagram — domain, data layer, app core, screen layer, planned adapters |
| `class-no-specialization.puml` | Class diagram variant — flat model, no inheritance; role/size/state as attributes (matches the actual JS implementation) |
| `class-specialization.puml` | Class diagram variant — generalization hierarchies: Pengguna → Staf → Dosen/Tendik + Kurir, Loker by size, Kiriman by type, Screen subclasses |
| `sequence.puml` | Sequence diagram — boot + 3 scenarios (incl. cancel alts) + inactivity cross-cut |
| `locker-state.puml` | State machine — guarded locker lifecycle (available / delivering / occupied) |

There is also a **`bab4/`** subfolder with a report-compliant set per the
lecturer's notes: a simplified 11-use-case diagram, exactly 11 activity
diagrams (1:1 with the use cases), and 3 macro sequence diagrams (one per
human actor) using strict UML arrow notation (`->` request, `-->>` return).
See `bab4/README.md` for the full mapping table.

## Sprint 1 behaviors covered

- **Guarded locker transitions** — `reserveLocker` / `releaseLocker` /
  `occupyLocker` in `data.js`; invalid transitions are rejected
- **Real cancel paths** — "Batal" on the opening screen returns to the origin
  screen without a success state and frees reserved lockers
- **Mail lifecycle** — deposits become claimable mail (`recordDelivery`);
  claims remove it and free non-permanent lockers (`claimMail`)
- **Receipt code** — courier deposits show `FST-XXXXX`, 15 s auto-return
- **Idle warning** — "Masih di sana?" overlay 10 s before the 60 s reset;
  timeout releases abandoned reservations (`?idle=seconds` override)
- **Demo-gated auto-login** — tap-card auto-tap only with `?demo`
- **Help overlay** — persistent "Butuh bantuan?" in the footer
- **Notification** — still `<<planned>>`, not implemented

## Rendering

Pick one:

### Option A — VS Code

Install the **PlantUML** extension (`jebbs.plantuml`), open any `.puml`,
press `Alt+D` to preview.

### Option B — CLI (Java + Graphviz required)

```bash
# from this folder — renders all seven diagrams
plantuml -tsvg *.puml
# or PNG
plantuml -tpng *.puml
```

### Option C — Web

Paste the file contents into <https://www.plantuml.com/plantuml/uml/> for a
zero-install render.

## Conventions used

- **Actors** — solid for humans (Staf, Kurir, Admin), `<<device>>` for RFID and
  locker hardware, `<<system>>` for the inactivity timer and notification service.
- **`<<include>>`** — mandatory step inside a use case (e.g. `Buka Loker Pribadi`
  always includes `Buka Pintu Loker`).
- **`<<extend>>`** — optional / event-triggered (e.g. `Auto-Lock` extends
  `Buka Pintu Loker` on timeout).
- **Swimlanes** in the activity diagram match the same three-layer split used
  in the sequence diagram (User → Kiosk → Hardware).
- **Class colors** follow the kiosk's palette (`#2A403C` UIN green border,
  `#F4F1E8` parchment fill, `#8A6A1F` gold for decision diamonds and grouping).
