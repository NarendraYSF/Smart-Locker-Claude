// Done screen: brief success confirmation, then auto-return to idle after 5s.

import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";

const AUTO_RETURN_MS = 5000;

export function mount(stage, state) {
  const reason = state.openReason || "self";
  const isGold = reason === "deliver" || reason === "claim-mail";
  const locker = state.completedLocker;

  const title =
    reason === "deliver"
      ? ["Terima kasih, kiriman telah ", { em: "tersimpan" }, "."]
      : reason === "claim-mail"
      ? ["Kiriman telah ", { em: "diambil" }, "."]
      : ["Loker telah ", { em: "ditutup" }, "."];

  const sub =
    reason === "deliver"
      ? "Penerima akan menerima notifikasi dan dapat mengambil kiriman kapan saja dalam jam layanan."
      : reason === "claim-mail"
      ? "Semoga harinya menyenangkan. Jangan lupa tutup kembali pintu loker dengan rapat."
      : "Semoga harinya menyenangkan, hati-hati di perjalanan.";

  const clearedState = {
    user: null,
    recipient: null,
    packageSize: null,
    assignedLocker: null,
    openReason: null,
    claimedMailId: null,
    completedLocker: null
  };

  const root = h(
    "section.done.stagger",
    {},

    h(
      "div",
      { class: isGold ? "done__check done__check--gold" : "done__check" },
      icon("check")
    ),

    h(
      "h2",
      { class: isGold ? "done__title done__title--gold" : "done__title" },
      ...renderTitle(title)
    ),

    h("p.done__sub", {}, sub),

    locker
      ? h(
          "div.done__detail",
          {},
          h("span", {}, "Loker"),
          h("strong", {}, String(locker.number).padStart(2, "0")),
          h("span", { style: { color: "var(--fg-subtle)" } }, "\u2022"),
          h("span", {}, locker.id),
          h("span", { style: { color: "var(--fg-subtle)" } }, "\u2022"),
          h("span", {}, sizeLabel(locker.size))
        )
      : null,

    h(
      "div",
      { style: { display: "flex", gap: "var(--space-4)", alignItems: "center" } },
      h(
        "button.btn.btn--ghost",
        { type: "button", onclick: () => navigate("idle", clearedState) },
        "Kembali Sekarang"
      ),
      h("p.done__auto", { "data-auto": "" }, "Kembali otomatis dalam 5 detik")
    )
  );

  stage.appendChild(root);

  let remaining = 5;
  const label = root.querySelector("[data-auto]");
  const id = setInterval(() => {
    remaining -= 1;
    if (label) label.textContent = `Kembali otomatis dalam ${remaining} detik`;
    if (remaining <= 0) {
      clearInterval(id);
      // clear transient state
      navigate("idle", clearedState);
    }
  }, 1000);

  const autoReturn = setTimeout(() => {}, AUTO_RETURN_MS); // handled above

  return () => {
    clearInterval(id);
    clearTimeout(autoReturn);
  };
}

function renderTitle(tokens) {
  return tokens.map((t) =>
    typeof t === "string" ? t : h("em", {}, t.em)
  );
}

function sizeLabel(s) {
  switch (s) {
    case "besar": return "Besar";
    case "sedang": return "Sedang";
    default: return "Kecil";
  }
}
