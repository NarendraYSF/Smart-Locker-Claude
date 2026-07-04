// Mail list: incoming items for the signed-in user.
//
// Each item triggers the opening-locker flow in 'claim-mail' mode.

import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";
import { mailFor } from "../data.js";
import { formatRelative, formatTime } from "../utils/clock.js";

export function mount(stage, state) {
  const user = state.user;
  if (!user) {
    navigate("idle");
    return;
  }
  const items = mailFor(user.nip);

  const root = h(
    "section.mail.stagger",
    {},

    h(
      "div.screen__crumb",
      {},
      h(
        "button.screen__back",
        { type: "button", onclick: () => navigate("dashboard") },
        icon("arrowLeft", { className: "screen__back-arrow" }),
        "Kembali"
      ),
      h(
        "p",
        { class: "eyebrow", style: { marginLeft: "auto" } },
        `${items.length} kiriman`
      )
    ),

    h(
      "div",
      {},
      h("p.eyebrow", {}, "02 \u00B7 Kiriman Masuk"),
      h(
        "h2.screen__title",
        { style: { marginTop: "var(--space-3)" } },
        "Surat & Paket untuk ",
        h("em", { class: "display--italic", style: { color: "var(--accent-gold)" } }, user.name.split(",")[0])
      )
    ),

    items.length === 0
      ? h("div.mail-empty", {}, "Tidak ada kiriman saat ini.")
      : h(
          "div.mail-list",
          {},
          ...items.map((m) =>
            h(
              "div.mail-item",
              {},
              h(
                "div.mail-item__icon",
                {},
                icon(iconFor(m.type))
              ),
              h(
                "div",
                {},
                h("p.mail-item__sender", {}, m.sender),
                h(
                  "p",
                  {
                    style: {
                      fontSize: "var(--fs-sm)",
                      color: "var(--fg-secondary)",
                      marginTop: "var(--space-2)",
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic"
                    }
                  },
                  m.note
                ),
                h(
                  "div.mail-item__meta",
                  {},
                  h("span", {}, m.type),
                  h("span.mail-item__meta-dot", {}),
                  h("span", {}, `Loker ${lockerNumFromId(m.lockerId)}`),
                  h("span.mail-item__meta-dot", {}),
                  h("span", {}, formatRelative(m.arrivedAt)),
                  h("span.mail-item__meta-dot", {}),
                  h("span", {}, formatTime(m.arrivedAt))
                )
              ),
              h(
                "button.btn.btn--gold",
                {
                  type: "button",
                  onclick: () =>
                    navigate("opening-locker", {
                      openReason: "claim-mail",
                      claimedMailId: m.id
                    })
                },
                icon("lock", { className: "btn__icon" }),
                "Ambil"
              )
            )
          )
        ),

    h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid var(--line-hairline)"
        }
      },
      h(
        "button.btn.btn--ghost",
        { type: "button", onclick: () => navigate("dashboard") },
        "Tutup"
      )
    )
  );

  stage.appendChild(root);
}

function iconFor(type) {
  if (type && type.toLowerCase().includes("surat")) return "envelope";
  if (type && type.toLowerCase().includes("besar")) return "boxLg";
  if (type && type.toLowerCase().includes("sedang")) return "boxMd";
  return "boxSm";
}

function lockerNumFromId(id) {
  if (!id) return "--";
  return id.replace(/^L-/, "");
}
