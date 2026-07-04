// Tiny DOM helpers — no framework, no dependencies.

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Build an element declaratively.
 * Example: h("button.btn.btn--primary", { onclick: fn, "aria-label": "Go" }, "Go")
 */
export function h(tag, props = {}, ...children) {
  const [name, ...rest] = tag.split(/([.#])/);
  const el = document.createElement(name);

  let i = 0;
  while (i < rest.length) {
    const marker = rest[i];
    const value = rest[i + 1] || "";
    if (marker === ".") el.classList.add(value);
    else if (marker === "#") el.id = value;
    i += 2;
  }

  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = `${el.className} ${v}`.trim();
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k in el && typeof v !== "boolean") {
      try {
        el[k] = v;
      } catch {
        el.setAttribute(k, v);
      }
    } else {
      el.setAttribute(k, v === true ? "" : v);
    }
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === "string" || typeof child === "number") {
      el.appendChild(document.createTextNode(String(child)));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

/** Inline SVG icons (minimal set used across the kiosk). */
export function icon(name, { className = "" } = {}) {
  const paths = ICONS[name];
  if (!paths) return document.createComment(`icon missing: ${name}`);
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.75");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  if (className) svg.setAttribute("class", className);
  for (const d of paths) {
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", d);
    svg.appendChild(p);
  }
  return svg;
}

const ICONS = {
  arrowRight: ["M5 12h14", "M13 6l6 6-6 6"],
  arrowLeft: ["M19 12H5", "M11 6l-6 6 6 6"],
  check: ["M5 13l4 4L19 7"],
  card: [
    "M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z",
    "M3 10h18",
    "M7 15h4"
  ],
  mail: [
    "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z",
    "M3 7l9 7 9-7"
  ],
  package: [
    "M12 3l9 5v8l-9 5-9-5V8Z",
    "M3 8l9 5 9-5",
    "M12 13v10",
    "M7.5 5.5l9 5"
  ],
  search: ["M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z", "M21 21l-4.35-4.35"],
  send: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4Z"],
  lock: [
    "M5 11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z",
    "M8 9V7a4 4 0 1 1 8 0v2"
  ],
  clock: ["M12 6v6l4 2", "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"],
  envelope: [
    "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z",
    "M3 7l9 7 9-7"
  ],
  boxSm: ["M5 8h14v12H5Z", "M5 8l2-4h10l2 4"],
  boxMd: ["M4 8h16v12H4Z", "M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"],
  boxLg: ["M3 7h18v13H3Z", "M3 11h18", "M11 7V4h2v3"],
  x: ["M18 6L6 18", "M6 6l12 12"],
  user: [
    "M16 14a4 4 0 1 0-8 0",
    "M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "M4 22a8 8 0 0 1 16 0"
  ]
};
