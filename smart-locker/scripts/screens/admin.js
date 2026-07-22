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

  // Shared Modal Helper
  function showModal(title, contentFn) {
    const overlay = h(
      "div",
      {
        style: {
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "grid", placeItems: "center", zIndex: 100,
          backdropFilter: "blur(4px)"
        }
      },
      h(
        "div",
        {
          style: {
            background: "var(--bg-card)", padding: "var(--space-6)",
            borderRadius: "var(--radius-lg)", border: "1px solid var(--line-strong)",
            width: "80%", maxWidth: "600px", display: "grid", gap: "var(--space-5)"
          }
        },
        h("h2", { style: { fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)" } }, title),
        contentFn(() => overlay.remove())
      )
    );
    stage.appendChild(overlay);
  }

  // Update Stats Helper
  const updateStats = () => {
    const statsEl = root.querySelector('.admin__stats');
    if (statsEl) {
      statsEl.children[1].querySelector('.admin__stat-value').textContent = lockers.filter(l => l.state === "occupied").length;
      statsEl.children[2].querySelector('.admin__stat-value').textContent = lockers.filter(l => l.state === "available" || l.state === "rusak").length;
    }
  };

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
              { 
                class: `admin__cell--${l.state}`,
                style: { cursor: "pointer" },
                onclick: () => {
                  showModal(`Kelola Loker ${l.id}`, (close) => h(
                    "div", { style: { display: "grid", gap: "var(--space-3)" } },
                    h("p", { style: { color: "var(--fg-secondary)" } }, `Status saat ini: ${l.state.toUpperCase()}`),
                    h("button.btn.btn--primary", { onclick: () => { l.state = "available"; updateStats(); renderBody(); close(); } }, "Set Tersedia"),
                    h("button.btn", { style: { background: "var(--danger-soft)", color: "var(--danger)" }, onclick: () => { l.state = "rusak"; updateStats(); renderBody(); close(); } }, "Tandai Rusak (Tidak Dipakai)"),
                    h("button.btn.btn--ghost", { onclick: close }, "Batal")
                  ));
                }
              },
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
          h("div.admin__legend-item", {}, h("span.admin__legend-dot.admin__legend-dot--delivering"), "Sedang Diisi"),
          h("div.admin__legend-item", {}, h("span.admin__legend-dot", { style: { background: "var(--danger)" } }), "Rusak")
        )
      );
      body.appendChild(grid);
    } else {
      const container = h("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-4)", height: "100%" } });
      
      const actionBar = h(
        "div",
        { style: { display: "flex", justifyContent: "flex-end" } },
        h(
          "button",
          {
            style: {
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--accent-glow-soft)",
              border: "1px solid var(--line-accent)",
              color: "var(--accent-glow)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              transition: "transform var(--dur-fast)"
            },
            onmousedown: (e) => e.currentTarget.style.transform = "scale(0.95)",
            onmouseup: (e) => e.currentTarget.style.transform = "none",
            onmouseleave: (e) => e.currentTarget.style.transform = "none",
            onclick: () => {
              showModal("Tambah Staf Baru", (close) => {
                const inputStyle = { padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--line-soft)", background: "var(--bg-elevated)", color: "var(--fg-primary)", outline: "none", fontSize: "var(--fs-md)" };
                const nipInput = h("input", { type: "text", placeholder: "NIP", style: inputStyle });
                const nameInput = h("input", { type: "text", placeholder: "Nama Lengkap", style: inputStyle });
                const deptInput = h("input", { type: "text", placeholder: "Departemen", style: inputStyle });
                
                return h(
                  "div", { style: { display: "grid", gap: "var(--space-3)" } },
                  nipInput,
                  nameInput,
                  deptInput,
                  h("div", { style: { display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" } },
                    h("button.btn.btn--ghost", { style: { flex: 1 }, onclick: close }, "Batal"),
                    h("button.btn.btn--primary", { 
                      style: { flex: 1 },
                      onclick: () => { 
                        const nip = nipInput.value.trim();
                        const name = nameInput.value.trim();
                        const dept = deptInput.value.trim();
                        if (!nip || !name || !dept) return;
                        
                        staff.unshift({
                          nip,
                          name,
                          role: "Dosen", // Default to Dosen
                          dept,
                          initials: name.slice(0, 2).toUpperCase(),
                          rfid: "N" + Math.floor(Math.random()*1000), // Mock RFID
                          lockerId: null
                        });
                        renderBody();
                        close(); 
                      } 
                    }, "Simpan")
                  )
                );
              });
            }
          },
          icon("plus")
        )
      );
      
      const list = h(
        "div.admin__staff-list",
        {},
        ...staff.map(s => {
          const l = lockers.find(x => x.id === s.lockerId);
          return h(
            "div.admin__staff-item.recipient",
            {
              style: { cursor: "pointer" },
              onclick: () => {
                showModal(`Kelola Staf: ${s.name}`, (close) => {
                  const inputStyle = { padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--line-soft)", background: "var(--bg-elevated)", color: "var(--fg-primary)", outline: "none", fontSize: "var(--fs-md)" };
                  const nameInput = h("input", { type: "text", value: s.name, placeholder: "Nama Lengkap", style: inputStyle });
                  const deptInput = h("input", { type: "text", value: s.dept, placeholder: "Departemen", style: inputStyle });
                  
                  return h(
                    "div", { style: { display: "grid", gap: "var(--space-3)" } },
                    h("label", { style: { color: "var(--fg-secondary)", fontSize: "var(--fs-sm)" } }, "Nama Staf"),
                    nameInput,
                    h("label", { style: { color: "var(--fg-secondary)", fontSize: "var(--fs-sm)", marginTop: "var(--space-2)" } }, "Departemen"),
                    deptInput,
                    h("div", { style: { display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" } },
                      h("button.btn.btn--ghost", { style: { flex: 1 }, onclick: close }, "Batal"),
                      h("button.btn.btn--primary", { 
                        style: { flex: 1 },
                        onclick: () => { 
                          const newName = nameInput.value.trim();
                          const newDept = deptInput.value.trim();
                          if (newName) s.name = newName; 
                          if (newDept) s.dept = newDept;
                          renderBody();
                          close(); 
                        } 
                      }, "Simpan")
                    )
                  );
                });
              }
            },
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
      
      container.appendChild(actionBar);
      container.appendChild(list);
      body.appendChild(container);
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
