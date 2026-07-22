import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";
import { lockers, staff, incomingMail } from "../data.js";

export function mount(stage, state) {
  const user = state.user;
  if (!user || user.dept !== "Sekretariat FST") {
    navigate("idle");
    return;
  }

  // Calculate stats
  const totalLocker = lockers.length;
  const occupiedCount = lockers.filter(l => l.state === "occupied").length;
  const availableCount = lockers.filter(l => l.state === "available").length;
  const activeMailCount = incomingMail.length;

  let activeTab = "loker"; // 'loker' | 'staf'

  // Header
  const header = h(
    "div.admin__header",
    {},
    h(
      "button.screen__back",
      { type: "button", onclick: () => navigate("dashboard") },
      icon("arrowLeft", { className: "screen__back-arrow" }),
      "Kembali"
    ),
    h(
      "div.admin__title-wrap",
      {},
      h("p.eyebrow", {}, "Kelola Data Staf & Loker"),
      h("h1", {}, "Admin Panel")
    )
  );

  // Stats
  const stats = h(
    "div.admin__stats",
    {},
    h(
      "div.admin__stat",
      {},
      h("p.admin__stat-label", {}, "Total Loker"),
      h("p.admin__stat-value", {}, totalLocker)
    ),
    h(
      "div.admin__stat",
      {},
      h("p.admin__stat-label", {}, "Terisi"),
      h("p.admin__stat-value.admin__stat-value--occupied", {}, occupiedCount)
    ),
    h(
      "div.admin__stat",
      {},
      h("p.admin__stat-label", {}, "Tersedia"),
      h("p.admin__stat-value", {}, availableCount)
    ),
    h(
      "div.admin__stat",
      {},
      h("p.admin__stat-label", {}, "Kiriman Aktif"),
      h("p.admin__stat-value.admin__stat-value--gold", {}, activeMailCount)
    )
  );

  // Body Container
  const body = h("div.admin__body", {});

  const renderBody = () => {
    body.innerHTML = "";
    
    // Tabs
    const tabs = h(
      "div.admin__tabs",
      {},
      h(
        "button.admin__tab",
        {
          type: "button",
          class: activeTab === "loker" ? "admin__tab--active" : "",
          onclick: () => { activeTab = "loker"; renderBody(); }
        },
        icon("grid", { className: "admin__tab-icon" }),
        "Status Loker"
      ),
      h(
        "button.admin__tab",
        {
          type: "button",
          class: activeTab === "staf" ? "admin__tab--active" : "",
          onclick: () => { activeTab = "staf"; renderBody(); }
        },
        icon("users", { className: "admin__tab-icon" }),
        "Data Staf"
      )
    );
    body.appendChild(tabs);

    if (activeTab === "loker") {
      const grid = h(
        "div.admin__grid-wrap",
        {},
        h(
          "div.admin__grid",
          {},
          ...lockers.map(l => {
            return h(
              "div.admin__cell",
              { class: `admin__cell--${l.state}` },
              h("p.admin__cell-id", {}, l.id),
              h("p.admin__cell-size", {}, l.size)
            );
          })
        ),
        h(
          "div.admin__legend",
          {},
          h("div.admin__legend-item", {}, h("span.admin__legend-dot"), "Tersedia"),
          h("div.admin__legend-item", {}, h("span.admin__legend-dot.admin__legend-dot--occupied"), "Terisi"),
          h("div.admin__legend-item", {}, h("span.admin__legend-dot.admin__legend-dot--delivering"), "Sedang Diisi")
        )
      );
      body.appendChild(grid);
    } else {
      const list = h(
        "div.admin__staff-list",
        {},
        ...staff.map(s => {
          const l = lockers.find(x => x.id === s.lockerId);
          return h(
            "div.admin__staff-item.recipient",
            {},
            h(
              "div.recipient__avatar",
              {},
              h("span", {}, s.initials)
            ),
            h(
              "div.recipient__info",
              {},
              h("p.recipient__name", {}, s.name),
              h("p.recipient__dept", {}, s.dept)
            ),
            h(
              "div.recipient__meta",
              {},
              h("span.pill.pill--mono", {}, `NIP ${s.nip}`),
              h("span.pill", {}, l ? `Loker ${s.lockerId}` : "Tidak Ada Loker")
            )
          );
        })
      );
      body.appendChild(list);
    }
  };

  renderBody();

  // Footer
  const foot = h(
    "div.admin__foot",
    {},
    h(
      "button.btn.btn--ghost",
      { type: "button", onclick: () => navigate("idle") },
      "Keluar"
    )
  );

  const root = h(
    "section.admin.stagger",
    {},
    header,
    stats,
    body,
    foot
  );

  stage.appendChild(root);
}
