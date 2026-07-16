// Opening Locker: big number, green/gold glow, countdown, then completion state.
//
// Reason drives color, copy, and next navigation:
//   'self'        -> user opening own locker
//   'claim-mail'  -> user retrieving an incoming mail/package
//   'deliver'     -> courier dropping a package into assigned locker

import { h, icon } from "../utils/dom.js";
import { navigate, toast } from "../app.js";
import {
  lockers,
  incomingMail,
  occupyLocker,
  releaseLocker,
  recordDelivery,
  claimMail
} from "../data.js";

const COUNTDOWN_SECONDS = 30;

export function mount(stage, state) {
  const reason = state.openReason || "self";

  let locker;
  if (reason === "deliver") {
    locker = state.assignedLocker;
  } else if (reason === "claim-mail") {
    const mailItem = incomingMail.find((x) => x.id === state.claimedMailId);
    locker = mailItem
      ? lockers.find((l) => l.id === mailItem.lockerId)
      : (state.user && lockers.find((l) => l.id === state.user.lockerId));
  } else {
    locker = state.user && lockers.find((l) => l.id === state.user.lockerId);
  }

  if (!locker) {
    navigate("idle");
    return;
  }

  const isGold = reason === "deliver" || reason === "claim-mail";
  const numberStr = String(locker.number).padStart(2, "0");

  const eyebrowText =
    reason === "deliver"
      ? "Paket siap diletakkan"
      : reason === "claim-mail"
      ? "Kiriman siap diambil"
      : "Loker terbuka untuk Anda";

  const message =
    reason === "deliver"
      ? "Silakan letakkan kiriman dan tutup pintu. Penerima akan dihubungi secara otomatis."
      : reason === "claim-mail"
      ? "Silakan ambil kiriman Anda, lalu tutup kembali pintu loker."
      : "Silakan ambil atau letakkan barang Anda, lalu tutup kembali pintu loker.";

  const cta =
    reason === "deliver"
      ? "Sudah Diletakkan"
      : reason === "claim-mail"
      ? "Sudah Diambil"
      : "Selesai";

  const root = h(
    "section.opening.stagger",
    { dataset: { reason } },

    h(
      "div.opening__eyebrow",
      {},
      h(
        "span.pill",
        { class: isGold ? "pill pill--gold" : "pill pill--green" },
        h("span.pill__dot", {}),
        eyebrowText
      ),
      h("span.pill.pill--mono", {}, locker.id)
    ),

    h(
      "div.opening__stage",
      {},
      h(
        "div.opening__rings",
        {},
        h("span.opening__ring.opening__ring--1", {
          style: isGold
            ? { borderColor: "rgba(212,168,75,0.35)" }
            : {}
        }),
        h("span.opening__ring.opening__ring--2", {
          style: isGold
            ? { borderColor: "rgba(212,168,75,0.25)" }
            : {}
        }),
        h("span.opening__ring.opening__ring--3", {
          style: isGold
            ? { borderColor: "rgba(212,168,75,0.18)" }
            : {}
        })
      ),
      h(
        "div",
        {},
        h(
          "p.opening__number",
          { class: isGold ? "opening__number opening__number--gold" : "" },
          numberStr
        ),
        h("p.opening__label", {}, `${size(locker.size)} \u00B7 ${locker.id}`)
      )
    ),

    h("p.opening__message", {}, message),

    h(
      "div.opening__foot",
      {},
      h(
        "div.opening__countdown",
        {},
        countdownRing(isGold),
        h("p.opening__countdown-label", {}, "Waktu kunci otomatis")
      ),
      h(
        "button.btn",
        {
          type: "button",
          class: isGold ? "btn btn--gold" : "btn btn--primary",
          onclick: finish
        },
        icon("check", { className: "btn__icon" }),
        cta
      ),
      h(
        "button.btn.btn--ghost",
        {
          type: "button",
          onclick: cancel
        },
        "Batal"
      )
    )
  );

  stage.appendChild(root);

  // --- countdown & auto-close ---
  const ring = root.querySelector("[data-ring-fill]");
  const ringLabel = root.querySelector("[data-ring-label]");
  const circumference = 2 * Math.PI * 54; // r=54
  let remaining = COUNTDOWN_SECONDS;

  const tick = () => {
    if (!ring || !ringLabel) return;
    const progress = remaining / COUNTDOWN_SECONDS;
    ring.style.strokeDashoffset = circumference * (1 - progress);
    ringLabel.textContent = String(remaining).padStart(2, "0");
    if (remaining <= 0) {
      finish();
      return;
    }
    remaining -= 1;
  };
  tick();
  const id = setInterval(tick, 1000);

  function finish() {
    clearInterval(id);
    if (reason === "deliver") {
      // Complete the deposit: delivering -> occupied, then register the
      // package as claimable mail for the recipient.
      const recipientNip = state.recipient ? state.recipient.nip : null;
      occupyLocker(locker.id, recipientNip);
      if (recipientNip) {
        recordDelivery({
          lockerId: locker.id,
          recipientNip,
          type: state.packageSize ? state.packageSize.name : "Paket"
        });
      }
    } else if (reason === "claim-mail" && state.claimedMailId) {
      claimMail(state.claimedMailId);
    }
    navigate("done-screen", { openReason: reason, completedLocker: locker });
  }

  // Abort without a success screen: return to where the user came from.
  function cancel() {
    clearInterval(id);
    if (reason === "deliver") {
      releaseLocker(locker.id);
      toast("Penitipan dibatalkan");
      navigate("courier-size", { assignedLocker: null, openReason: null });
    } else if (reason === "claim-mail") {
      toast("Pengambilan dibatalkan");
      navigate("mail", { claimedMailId: null, openReason: null });
    } else {
      navigate("dashboard", { openReason: null });
    }
  }

  return () => clearInterval(id);
}

function size(s) {
  switch (s) {
    case "besar": return "Loker Besar";
    case "sedang": return "Loker Sedang";
    default: return "Loker Kecil";
  }
}

function countdownRing(isGold) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 120 120");
  svg.setAttribute("width", "140");
  svg.setAttribute("height", "140");
  svg.setAttribute("style", "transform:rotate(-90deg)");

  const track = document.createElementNS(ns, "circle");
  track.setAttribute("cx", "60");
  track.setAttribute("cy", "60");
  track.setAttribute("r", "54");
  track.setAttribute("fill", "none");
  track.setAttribute("stroke", "var(--line-soft)");
  track.setAttribute("stroke-width", "4");
  svg.appendChild(track);

  const fill = document.createElementNS(ns, "circle");
  fill.setAttribute("cx", "60");
  fill.setAttribute("cy", "60");
  fill.setAttribute("r", "54");
  fill.setAttribute("fill", "none");
  fill.setAttribute("stroke", isGold ? "var(--accent-gold)" : "var(--accent-glow)");
  fill.setAttribute("stroke-width", "4");
  fill.setAttribute("stroke-linecap", "round");
  const c = 2 * Math.PI * 54;
  fill.setAttribute("stroke-dasharray", String(c));
  fill.setAttribute("stroke-dashoffset", "0");
  fill.setAttribute("data-ring-fill", "");
  fill.style.transition = "stroke-dashoffset 1000ms linear";
  svg.appendChild(fill);

  const wrap = h("div", {
    style: {
      position: "relative",
      width: "140px",
      height: "140px",
      display: "grid",
      placeItems: "center"
    }
  });
  wrap.appendChild(svg);

  const label = h(
    "span.mono",
    {
      "data-ring-label": "",
      style: {
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-xl)",
        color: "var(--fg-primary)",
        fontVariantNumeric: "tabular-nums"
      }
    },
    "00"
  );
  wrap.appendChild(label);
  return wrap;
}
