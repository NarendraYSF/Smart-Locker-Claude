// Done screen: brief success confirmation, then auto-return to idle.
// Courier deposits show a receipt code and linger longer so it can be
// photographed as proof of delivery.

import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";

// Unambiguous alphabet: no 0/O, 1/I/L to keep the code phone-photo friendly.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function receiptCode() {
  let s = "";
  for (let i = 0; i < 5; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `FST-${s}`;
}

export function mount(stage, state) {
  const reason = state.openReason || "self";
  const isGold = reason === "deliver" || reason === "claim-mail";
  const locker = state.completedLocker;
  const isDeliver = reason === "deliver";
  const code = isDeliver ? receiptCode() : null;
  const autoReturnSeconds = isDeliver ? 15 : 5;

  const title =
    reason === "deliver"
      ? ["Terima kasih, kiriman telah ", { em: "tersimpan" }, "."]
      : reason === "claim-mail"
      ? ["Kiriman telah ", { em: "diambil" }, "."]
      : ["Loker telah ", { em: "ditutup" }, "."];

  const sub =
    reason === "deliver"
      ? "Tunjukkan atau foto kode di bawah ini sebagai bukti penitipan. Penerima dapat mengambil kiriman dalam jam layanan."
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

    code
      ? h(
          "div.done__receipt",
          { "data-receipt": "" },
          h("p.done__receipt-label", {}, "Kode Bukti Titip"),
          h("p.done__receipt-code", {}, code)
        )
      : null,

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
      h(
        "p.done__auto",
        { "data-auto": "" },
        `Kembali otomatis dalam ${autoReturnSeconds} detik`
      )
    )
  );

  stage.appendChild(root);

  let remaining = autoReturnSeconds;
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

  return () => clearInterval(id);
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
