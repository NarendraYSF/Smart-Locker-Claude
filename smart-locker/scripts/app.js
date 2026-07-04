// Main app: state, router, inactivity timer, screen lifecycle.

import { qs } from "./utils/dom.js";
import { startClock } from "./utils/clock.js";

import { mount as mountIdle } from "./screens/idle.js";
import { mount as mountTap } from "./screens/tap-card.js";
import { mount as mountDashboard } from "./screens/dashboard.js";
import { mount as mountOpening } from "./screens/opening-locker.js";
import { mount as mountCourier } from "./screens/courier.js";
import { mount as mountMail } from "./screens/mail.js";
import { mount as mountDone } from "./screens/done.js";

const SCREENS = {
  idle: mountIdle,
  "tap-card": mountTap,
  dashboard: mountDashboard,
  "opening-locker": mountOpening,
  "courier-search": (root, ctx) => mountCourier(root, ctx, "search"),
  "courier-size": (root, ctx) => mountCourier(root, ctx, "size"),
  "courier-assign": (root, ctx) => mountCourier(root, ctx, "assign"),
  mail: mountMail,
  "done-screen": mountDone
};

/** Global reactive-ish state. Rerender = navigate(current). */
export const state = {
  screen: "idle",
  user: null,             // staff object after RFID tap
  recipient: null,        // selected recipient (courier flow)
  packageSize: null,      // selected size object (courier flow)
  assignedLocker: null,   // locker assigned for delivery
  openReason: null,       // 'self' | 'claim-mail' | 'deliver'
  claimedMailId: null     // mail item being claimed
};

let currentCleanup = null;
let inactivityTimer = null;
const IDLE_TIMEOUT_MS = 60_000;

/** Navigate to a screen, optionally with a context payload. */
export function navigate(screen, ctx = {}) {
  const stage = qs("[data-stage]");
  if (!stage) return;

  // clear any previous screen's cleanup
  if (typeof currentCleanup === "function") {
    try { currentCleanup(); } catch (e) { console.warn(e); }
    currentCleanup = null;
  }

  // apply partial context into state
  Object.assign(state, ctx);
  state.screen = screen;

  // update attr for CSS / debugging
  stage.setAttribute("data-screen", screen);
  stage.innerHTML = "";

  const mount = SCREENS[screen];
  if (!mount) {
    console.error(`Unknown screen: ${screen}`);
    return;
  }

  currentCleanup = mount(stage, state) || null;

  resetInactivity();
}

function resetInactivity() {
  clearTimeout(inactivityTimer);
  if (state.screen === "idle") return;
  inactivityTimer = setTimeout(() => {
    // auto-return to idle, clearing transient state
    Object.assign(state, {
      user: null,
      recipient: null,
      packageSize: null,
      assignedLocker: null,
      openReason: null,
      claimedMailId: null
    });
    navigate("idle");
  }, IDLE_TIMEOUT_MS);
}

// Any user interaction should reset the inactivity timer
["pointerdown", "keydown", "touchstart"].forEach((evt) => {
  window.addEventListener(evt, resetInactivity, { passive: true });
});

// --- Toast host ------------------------------------------------------

export function toast(msg, { duration = 3200 } = {}) {
  const host = qs("[data-toast-host]");
  if (!host) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 320ms ease, transform 320ms ease";
    setTimeout(() => el.remove(), 400);
  }, duration);
}

// --- Boot ------------------------------------------------------------
// NOTE: module scripts are deferred, so by the time this file runs the DOM
// is usually already parsed and DOMContentLoaded has already fired. We must
// boot directly if that's the case, otherwise queue it.

function boot() {
  startClock({
    dateEl: qs("[data-clock-date]"),
    timeEl: qs("[data-clock-time]")
  });
  navigate("idle");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

// Expose for dev in console
// eslint-disable-next-line no-undef
if (typeof window !== "undefined") {
  window.__kiosk = { navigate, state, toast };
}
