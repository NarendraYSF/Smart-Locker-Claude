// Dashboard: welcome back, user meta, three actions.

import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";
import { mailFor, lockers } from "../data.js";

export function mount(stage, state) {
  const user = state.user;
  if (!user) {
    navigate("idle");
    return;
  }

  const mail = mailFor(user.nip);
  const mailCount = mail.length;
  const myLocker = lockers.find((l) => l.id === user.lockerId);
  const lockerNumberLabel = myLocker ? String(myLocker.number).padStart(2, "0") : "--";

  const isDosen = user.role === "Dosen";
  const greetingHint = isDosen ? "Dr./Prof." : "Staf";

  const root = h(
    "section.dash.stagger",
    {},

    // Hero
    h(
      "div.dash__hero",
      {},
      h(
        "div.dash__avatar-wrap",
        {},
        h("div.avatar", {}, user.initials || user.name.slice(0, 2)),
        h("span.dash__avatar-ring", {})
      ),
      h(
        "div",
        {},
        h("p.dash__greeting", {}, "Assalamualaikum,"),
        h("h1.dash__name", {}, user.name),
        h(
          "div.dash__meta",
          {},
          h(
            "span.pill.pill--green",
            {},
            h("span.pill__dot", {}),
            user.role
          ),
          h("span.pill", {}, user.dept),
          h("span.pill.pill--mono", {}, `NIP ${user.nip}`)
        )
      )
    ),

    // Summary row
    h(
      "div.dash__summary",
      {},
      h(
        "div.dash__summary-item",
        {},
        h("p.dash__summary-label", {}, "Loker Anda"),
        h("p.dash__summary-value", {}, lockerNumberLabel)
      ),
      h(
        "div.dash__summary-item",
        {},
        h("p.dash__summary-label", {}, "Kiriman Baru"),
        h(
          "p.dash__summary-value",
          { class: mailCount ? "dash__summary-value--gold" : "" },
          String(mailCount).padStart(2, "0")
        )
      ),
      h(
        "div.dash__summary-item",
        {},
        h("p.dash__summary-label", {}, "Status"),
        h(
          "p.dash__summary-value.dash__summary-value--green",
          {},
          "Aktif"
        )
      )
    ),

    // Action tiles
    h(
      "div.dash__actions",
      {},
      h(
        "button.dash__action.dash__action--primary",
        {
          type: "button",
          onclick: () =>
            navigate("opening-locker", {
              openReason: "self"
            })
        },
        h(
          "div.dash__action-eyebrow",
          {},
          h("span", {}, "01 \u00B7 Akses Pribadi"),
          icon("lock", { className: "btn__icon" })
        ),
        h(
          "div",
          {},
          h(
            "h3.dash__action-title",
            {},
            "Buka ",
            h("em", {}, "Loker Saya")
          ),
          h(
            "p",
            { style: { color: "var(--fg-muted)", marginTop: "var(--space-3)", fontSize: "var(--fs-sm)" } },
            `Loker ${lockerNumberLabel} akan terbuka selama 30 detik.`
          )
        ),
        h(
          "div.dash__action-foot",
          {},
          h("span", {}, `Loker ${lockerNumberLabel}`),
          icon("arrowRight", { className: "dash__action-arrow" })
        )
      ),

      h(
        "button.dash__action.dash__action--gold",
        {
          type: "button",
          disabled: mailCount === 0,
          style: mailCount === 0 ? { opacity: 0.5, pointerEvents: "none" } : {},
          onclick: () => navigate("mail")
        },
        h(
          "div.dash__action-eyebrow",
          {},
          h("span", {}, "02 \u00B7 Kiriman"),
          mailCount > 0
            ? h("span.badge", {}, String(mailCount))
            : h("span.pill", {}, "Kosong")
        ),
        h(
          "h3.dash__action-title",
          {},
          "Surat & ",
          h("em", {}, "Paket")
        ),
        h(
          "div.dash__action-foot",
          {},
          h("span", {}, mailCount > 0 ? "Ambil kiriman" : "Tidak ada kiriman"),
          icon("arrowRight", { className: "dash__action-arrow" })
        )
      ),

      h(
        "button.dash__action",
        {
          type: "button",
          onclick: () => navigate("idle")
        },
        h("div.dash__action-eyebrow", {}, h("span", {}, "03 \u00B7 Keluar")),
        h(
          "h3.dash__action-title",
          {},
          h("em", {}, "Selesai")
        ),
        h(
          "div.dash__action-foot",
          {},
          h("span", {}, "Kembali ke beranda"),
          icon("arrowRight", { className: "dash__action-arrow" })
        )
      )
    )
  );

  stage.appendChild(root);
}
