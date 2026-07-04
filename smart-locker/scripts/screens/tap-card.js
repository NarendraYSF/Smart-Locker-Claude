// Tap card screen: simulated RFID. Press Enter or wait ~3s for success.

import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";
import { staff } from "../data.js";

export function mount(stage) {
  const root = h(
    "section.tap.stagger",
    {},

    h(
      "div.tap__header",
      {},
      h(
        "p.eyebrow",
        {},
        "01 \u00B7 Autentikasi Staf"
      ),
      h(
        "h2.tap__title",
        {},
        "Dekatkan ",
        h("em", {}, "kartu"),
        " Anda"
      ),
      h(
        "p.tap__sub",
        {},
        "ke area pembaca RFID di bawah layar."
      )
    ),

    h(
      "div.tap__stage",
      {},
      h(
        "div.tap__radar",
        {},
        h("span.tap__ripple", {}),
        h("span.tap__ripple.tap__ripple--b", {}),
        h("span.tap__ripple.tap__ripple--c", {}),
        h(
          "div.tap__card",
          {},
          h("p.tap__card-meta", {}, "Kartu Identitas UIN"),
          h("p.tap__card-title", {}, "Staf \u2014 FST"),
          h("p.tap__card-num", {}, "\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022")
        )
      )
    ),

    h(
      "div.tap__foot",
      {},
      h(
        "button.btn.btn--ghost",
        {
          type: "button",
          onclick: () => navigate("idle")
        },
        icon("arrowLeft", { className: "btn__icon" }),
        "Batal"
      ),
      h(
        "button.btn.btn--primary",
        {
          type: "button",
          onclick: simulate
        },
        icon("card", { className: "btn__icon" }),
        "Simulasikan Tap"
      )
    ),

    h(
      "div.tap__hint",
      {},
      h("span", {}, "Dev shortcut:"),
      h("span.tap__hint-key", {}, "Enter"),
      h("span", {}, "untuk simulasi tap")
    )
  );

  stage.appendChild(root);

  // auto-success after 3.5s for pure ambient demo
  const autoId = setTimeout(simulate, 3500);

  const keyHandler = (e) => {
    if (e.key === "Enter" || e.code === "Enter") {
      e.preventDefault();
      simulate();
    } else if (e.key === "Escape") {
      navigate("idle");
    }
  };
  window.addEventListener("keydown", keyHandler);

  function simulate() {
    clearTimeout(autoId);
    window.removeEventListener("keydown", keyHandler);
    // pick a deterministic but visually rich user: first staff with mail
    const user = staff.find((s) => s.nip === "198203102009011012") || staff[0];
    navigate("dashboard", { user });
  }

  return () => {
    clearTimeout(autoId);
    window.removeEventListener("keydown", keyHandler);
  };
}
