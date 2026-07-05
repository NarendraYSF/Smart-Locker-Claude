// Main app: state, router, inactivity timer, screen lifecycle.

import { qs } from "./utils/dom.js";
import { startClock } from "./utils/clock.js";
import { releaseLocker } from "./data.js";

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
let inactivityCheckerId = null;
let lastUserInteraction = Date.now();
const IDLE_TIMEOUT_MS = 60_000;
const IDLE_CHECK_INTERVAL = 1_000;

/** Record a real user interaction (not a programmatic navigate). */
function onUserActivity() {
  lastUserInteraction = Date.now();
}

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

  // Start or stop the idle checker based on current screen
  manageIdleChecker();
}

/**
 * Periodically check whether the user has been inactive for IDLE_TIMEOUT_MS.
 * Unlike the old approach, programmatic navigate() calls from screen auto-timers
 * do NOT reset the clock — only real user events (pointer/key/touch) do.
 */
function manageIdleChecker() {
  // On the idle screen, stop checking
  if (state.screen === "idle") {
    if (inactivityCheckerId) {
      clearInterval(inactivityCheckerId);
      inactivityCheckerId = null;
    }
    return;
  }

  // Already running — nothing to do
  if (inactivityCheckerId) return;

  // Start a periodic checker
  inactivityCheckerId = setInterval(() => {
    if (state.screen === "idle") {
      clearInterval(inactivityCheckerId);
      inactivityCheckerId = null;
      return;
    }

    if (Date.now() - lastUserInteraction >= IDLE_TIMEOUT_MS) {
      clearInterval(inactivityCheckerId);
      inactivityCheckerId = null;
      // Auto-return to idle, clearing transient state.
      // Release any locker reserved by an abandoned courier flow; the
      // from-state guard makes this a no-op after a completed deposit.
      if (state.assignedLocker) releaseLocker(state.assignedLocker.id);
      Object.assign(state, {
        user: null,
        recipient: null,
        packageSize: null,
        assignedLocker: null,
        openReason: null,
        claimedMailId: null,
        completedLocker: null
      });
      navigate("idle");
    }
  }, IDLE_CHECK_INTERVAL);
}

// Any real user interaction resets the inactivity clock
["pointerdown", "keydown", "touchstart"].forEach((evt) => {
  window.addEventListener(evt, onUserActivity, { passive: true });
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

// --- Viewport fit ------------------------------------------------------
// The kiosk canvas is a fixed 1080x1920. CSS provides an initial
// scale(min(100dvw/1080, 100dvh/1920)), but viewport units can lie on
// tablet browsers (dynamic address bars, older WebViews without dvh).
// Measuring the real visible viewport in JS and setting the transform
// directly guarantees the whole canvas fits, e.g. on 16:10 displays.

const KIOSK_W = 1080;
const KIOSK_H = 1920;

function fitKiosk() {
  const kiosk = qs("[data-kiosk]");
  if (!kiosk) return;
  const vw = (window.visualViewport && window.visualViewport.width) || window.innerWidth;
  const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  const scale = Math.min(vw / KIOSK_W, vh / KIOSK_H);
  kiosk.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", fitKiosk);
window.addEventListener("orientationchange", fitKiosk);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", fitKiosk);
}

// --- Boot ------------------------------------------------------------
// NOTE: module scripts are deferred, so by the time this file runs the DOM
// is usually already parsed and DOMContentLoaded has already fired. We must
// boot directly if that's the case, otherwise queue it.

function boot() {
  fitKiosk();
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
