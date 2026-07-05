// Courier flow: search recipient -> pick size -> assign locker -> open locker.
//
// All three steps are a single module with a `step` argument to keep the
// visual header consistent and the nav simple.

import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";
import {
  searchStaff,
  packageSizes,
  countFree,
  findFreeLocker,
  reserveLocker,
  releaseLocker,
  lockers
} from "../data.js";

export function mount(stage, state, step) {
  if (step === "search") return mountSearch(stage, state);
  if (step === "size") return mountSize(stage, state);
  if (step === "assign") return mountAssign(stage, state);
  navigate("idle");
}

// -------------------------------------------------------------------
// Step 1 — search recipient
// -------------------------------------------------------------------

function mountSearch(stage, state) {
  let query = "";

  const root = h(
    "section.courier.stagger",
    {},

    h(
      "div.screen__crumb",
      {},
      h(
        "button.screen__back",
        { type: "button", onclick: () => navigate("idle") },
        icon("arrowLeft", { className: "screen__back-arrow" }),
        "Batal"
      ),
      h(
        "p",
        { class: "eyebrow", style: { marginLeft: "auto" } },
        "Langkah 1 dari 3"
      )
    ),

    h(
      "div.courier__header",
      {},
      h("p.courier__step", {}, "Untuk Tamu & Kurir"),
      h(
        "h2.courier__title",
        {},
        "Kirim untuk ",
        h("em", {}, "siapa?")
      ),
      h(
        "p.courier__sub",
        {},
        "Cari Dosen atau Tenaga Kependidikan berdasarkan nama, departemen, atau NIP."
      ),
      h(
        "label.field",
        { for: "q" },
        icon("search", { className: "field__icon" }),
        h("input.field__input", {
          id: "q",
          type: "text",
          placeholder: "Cari nama, departemen, atau NIP",
          autocomplete: "off",
          oninput: (e) => {
            query = e.target.value;
            renderList();
          }
        })
      )
    ),

    h("div.recipient-list", { "data-list": "" }),

    h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-xs)",
          letterSpacing: "var(--ls-label)",
          textTransform: "uppercase",
          color: "var(--fg-subtle)",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid var(--line-hairline)"
        }
      },
      h("span", {}, "Data disediakan oleh Sekretariat FST"),
      h("span", {}, `${lockers.filter((l) => l.state === "available").length} loker tersedia`)
    )
  );

  stage.appendChild(root);
  renderList();

  function renderList() {
    const list = root.querySelector("[data-list]");
    if (!list) return;
    list.innerHTML = "";

    const results = searchStaff(query).slice(0, 12);
    if (results.length === 0) {
      list.appendChild(
        h("div.recipient-empty", {}, "Tidak ada staf cocok dengan pencarian.")
      );
      return;
    }

    for (const s of results) {
      list.appendChild(
        h(
          "button.recipient",
          {
            type: "button",
            onclick: () =>
              navigate("courier-size", { recipient: s })
          },
          h(
            "div",
            {
              class: "avatar avatar--sm",
              style: {
                background:
                  s.role === "Dosen"
                    ? "linear-gradient(135deg, var(--accent-uin-strong), var(--accent-uin))"
                    : "linear-gradient(135deg, #3c5652, #2a403c)"
              }
            },
            s.initials
          ),
          h(
            "div",
            {},
            h("p.recipient__name", {}, s.name),
            h(
              "div.recipient__meta",
              {},
              h("span", {}, s.role),
              h("span", { style: { color: "var(--fg-subtle)" } }, "\u2022"),
              h("span", {}, s.dept),
              h("span.recipient__nip", {}, `\u00B7 NIP ${s.nip}`)
            )
          ),
          icon("arrowRight", { className: "recipient__arrow" })
        )
      );
    }
  }
}

// -------------------------------------------------------------------
// Step 2 — pick package size
// -------------------------------------------------------------------

function mountSize(stage, state) {
  const recipient = state.recipient;
  if (!recipient) {
    navigate("courier-search");
    return;
  }

  const root = h(
    "section.courier.stagger",
    {},

    h(
      "div.screen__crumb",
      {},
      h(
        "button.screen__back",
        { type: "button", onclick: () => navigate("courier-search") },
        icon("arrowLeft", { className: "screen__back-arrow" }),
        "Ganti Penerima"
      ),
      h("p", { class: "eyebrow", style: { marginLeft: "auto" } }, "Langkah 2 dari 3")
    ),

    h(
      "div.courier__header",
      {},
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "var(--space-4)" } },
        h(
          "div.avatar.avatar--sm",
          {
            style: {
              background: recipient.role === "Dosen"
                ? "linear-gradient(135deg, var(--accent-uin-strong), var(--accent-uin))"
                : "linear-gradient(135deg, #3c5652, #2a403c)"
            }
          },
          recipient.initials
        ),
        h(
          "div",
          {},
          h("p.courier__step", {}, `Untuk ${recipient.role}`),
          h(
            "h2",
            {
              class: "courier__title",
              style: { fontSize: "56px" }
            },
            recipient.name
          )
        )
      ),
      h(
        "p.courier__sub",
        {},
        "Pilih ukuran kiriman agar sistem memilihkan loker yang sesuai."
      )
    ),

    h(
      "div.size-grid",
      {},
      ...packageSizes.map((pkg) => {
        const free = countFree(pkg.bucket);
        const disabled = free === 0;
        return h(
          "button.size",
          {
            type: "button",
            disabled,
            style: disabled ? { opacity: 0.45, pointerEvents: "none" } : {},
            onclick: () => pick(pkg)
          },
          h("div.size__badge", {}, icon(pkg.icon)),
          h("p.size__dim", {}, pkg.dim),
          h("h3.size__name", {}, pkg.name),
          h(
            "p.size__count",
            {},
            disabled
              ? "Loker penuh untuk ukuran ini"
              : h(
                  "span",
                  {},
                  h("strong", {}, String(free)),
                  " loker tersedia"
                )
          )
        );
      })
    )
  );

  stage.appendChild(root);

  function pick(pkg) {
    const locker = findFreeLocker(pkg.bucket);
    if (!locker) return;
    navigate("courier-assign", {
      packageSize: pkg,
      assignedLocker: locker
    });
  }
}

// -------------------------------------------------------------------
// Step 3 — confirm & assign
// -------------------------------------------------------------------

function mountAssign(stage, state) {
  const { recipient, packageSize, assignedLocker } = state;
  if (!recipient || !packageSize || !assignedLocker) {
    navigate("courier-search");
    return;
  }

  // reserve the locker for this in-progress deposit (available -> delivering)
  reserveLocker(assignedLocker.id);

  const root = h(
    "section.courier.stagger",
    {},

    h(
      "div.screen__crumb",
      {},
      h(
        "button.screen__back",
        {
          type: "button",
          onclick: () => {
            releaseLocker(assignedLocker.id);
            navigate("courier-size", { assignedLocker: null });
          }
        },
        icon("arrowLeft", { className: "screen__back-arrow" }),
        "Ganti Ukuran"
      ),
      h("p", { class: "eyebrow", style: { marginLeft: "auto" } }, "Langkah 3 dari 3")
    ),

    h(
      "div.courier__header",
      {},
      h("p.courier__step", {}, "Konfirmasi Loker"),
      h(
        "h2.courier__title",
        {},
        "Loker ",
        h("em", {}, String(assignedLocker.number).padStart(2, "0"))
      ),
      h(
        "p.courier__sub",
        {},
        `Sistem mengalokasikan loker kosong terdekat untuk ${packageSize.name.toLowerCase()}.`
      )
    ),

    // grid visualization + summary
    h(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-5)",
          alignItems: "stretch"
        }
      },
      lockerGrid(assignedLocker),
      h(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateRows: "auto auto 1fr",
            gap: "var(--space-4)"
          }
        },
        h(
          "div.card.card--gold",
          {},
          h("p.eyebrow", {}, "Penerima"),
          h(
            "p",
            {
              style: {
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-xl)",
                marginTop: "var(--space-2)",
                lineHeight: "1.1"
              }
            },
            recipient.name
          ),
          h(
            "p",
            {
              style: {
                fontFamily: "var(--font-mono)",
                fontSize: "var(--fs-xs)",
                color: "var(--fg-muted)",
                marginTop: "var(--space-1)",
                letterSpacing: "var(--ls-label)",
                textTransform: "uppercase"
              }
            },
            `${recipient.role} \u00B7 ${recipient.dept}`
          )
        ),
        h(
          "div.card",
          {},
          h("p.eyebrow", {}, "Kiriman"),
          h(
            "div",
            {
              style: {
                display: "flex",
                gap: "var(--space-4)",
                alignItems: "center",
                marginTop: "var(--space-3)"
              }
            },
            h(
              "div",
              {
                style: {
                  width: "64px",
                  height: "64px",
                  borderRadius: "14px",
                  background: "var(--bg-card-gold)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--accent-gold)"
                }
              },
              icon(packageSize.icon, { className: "btn__icon btn__icon--lg" })
            ),
            h(
              "div",
              {},
              h(
                "p",
                { style: { fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)" } },
                packageSize.name
              ),
              h(
                "p",
                {
                  style: {
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--fs-xs)",
                    color: "var(--fg-muted)",
                    marginTop: "4px",
                    letterSpacing: "var(--ls-label)",
                    textTransform: "uppercase"
                  }
                },
                packageSize.dim
              )
            )
          )
        ),
        h(
          "button.btn.btn--gold.btn--lg",
          {
            type: "button",
            style: { width: "100%", alignSelf: "end" },
            onclick: () =>
              navigate("opening-locker", {
                openReason: "deliver",
                assignedLocker
              })
          },
          icon("lock", { className: "btn__icon" }),
          "Buka Loker & Titipkan"
        )
      )
    )
  );

  stage.appendChild(root);
}

function lockerGrid(target) {
  const wrap = h(
    "div.card",
    {
      style: {
        padding: "var(--space-5)",
        display: "grid",
        gap: "var(--space-4)"
      }
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline"
        }
      },
      h("p.eyebrow", {}, "Peta Loker"),
      h(
        "p",
        {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-xs)",
            color: "var(--fg-muted)"
          }
        },
        "6 \u00D7 8"
      )
    ),
    h(
      "div.locker-grid.locker-grid--compact",
      { style: { padding: "var(--space-4)" } },
      ...lockers.map((l) => {
        let cls = "locker-cell";
        if (l.id === target.id) cls = "locker-cell locker-cell--target";
        else if (l.state === "occupied") cls = "locker-cell locker-cell--occupied";
        return h(
          "div",
          { class: cls, title: `${l.id} \u2022 ${sizeLabel(l.size)}` },
          String(l.number).padStart(2, "0")
        );
      })
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          gap: "var(--space-4)",
          fontSize: "var(--fs-xs)",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "var(--ls-label)",
          textTransform: "uppercase"
        }
      },
      legend("var(--accent-gold)", "Target"),
      legend("var(--bg-card-strong)", "Terisi"),
      legend("var(--bg-raised)", "Tersedia")
    )
  );
  return wrap;
}

function legend(color, label) {
  return h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: "var(--space-2)" } },
    h("span", {
      style: {
        width: "12px",
        height: "12px",
        borderRadius: "3px",
        background: color,
        border: "1px solid var(--line-strong)"
      }
    }),
    h("span", {}, label)
  );
}

function sizeLabel(s) {
  return s === "besar" ? "Besar" : s === "sedang" ? "Sedang" : "Kecil";
}
