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
        "button.btn.btn--ghost",
        {
          type: "button",
          onclick: () => simulate("199607122020121011") // Rina Agustina (Admin)
        },
        icon("settings", { className: "btn__icon" }),
        "Tap Admin (Dev)"
      ),
      h(
        "button.btn.btn--primary",
        {
          type: "button",
          onclick: () => simulate()
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
      h("span", {}, "(Staf),"),
      h("span.tap__hint-key", {}, "A"),
      h("span", {}, "(Admin)")
    )
  );

  stage.appendChild(root);

  // Auto-success after 3.5s ONLY in ambient demo mode (?demo). In normal
  // operation the screen waits for a real tap (Enter / button), so bystanders
  // are never signed in and usability-test timings stay clean.
  const demoMode = new URLSearchParams(window.location.search).has("demo");
  const autoId = demoMode ? setTimeout(simulate, 3500) : null;

  const keyHandler = (e) => {
    if (e.key === "Enter" || e.code === "Enter") {
      e.preventDefault();
      simulate(); // Default staff
    } else if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      simulate("199607122020121011"); // Rina Agustina (Admin)
    } else if (e.key === "Escape") {
      navigate("idle");
    }
  };
  window.addEventListener("keydown", keyHandler);

  function simulate(forceNip) {
    clearTimeout(autoId);
    window.removeEventListener("keydown", keyHandler);
    // pick a deterministic but visually rich user, or a specific admin if requested
    const user = forceNip 
      ? staff.find((s) => s.nip === forceNip) 
      : (staff.find((s) => s.nip === "198203102009011012") || staff[0]);
      
    if (user.dept === "Sekretariat FST") {
      navigate("admin", { user });
    } else {
      navigate("dashboard", { user });
    }
  }

  return () => {
    clearTimeout(autoId);
    window.removeEventListener("keydown", keyHandler);
  };
}
