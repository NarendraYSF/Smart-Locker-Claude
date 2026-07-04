# UML Diagrams — Loker Pintar FST

Four PlantUML sources modeling the kiosk system. They reflect the current
prototype (`scripts/app.js`, `scripts/data.js`, `scripts/screens/*`) and also
mark the planned hardware adapters (RFID reader, locker hardware, notification
service) as `<<adapter>>` / `<<device>>` so the diagrams stay valid once the
real backend is wired in.

| File | Diagram |
| --- | --- |
| `use-case.puml` | Use case diagram — actors, system boundary, include/extend |
| `activity.puml` | Activity diagram — three swimlanes (User / Kiosk / Hardware), all 3 flows |
| `class.puml`    | Class diagram — domain, data layer, app core, screen layer, planned adapters |
| `sequence.puml` | Sequence diagram — boot + 3 scenarios + inactivity cross-cut |

## Rendering

Pick one:

### Option A — VS Code

Install the **PlantUML** extension (`jebbs.plantuml`), open any `.puml`,
press `Alt+D` to preview.

### Option B — CLI (Java + Graphviz required)

```bash
# from this folder
plantuml -tsvg use-case.puml activity.puml class.puml sequence.puml
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
