// ============================================================
// capture-screens.mjs
// ------------------------------------------------------------
// Captures the 6 kiosk screenshots used by the printed
// materials (poster-kurir.html, panduan-staf.html).
//
// - Serves smart-locker/ on a private port (no external deps)
// - Drives the real UI (clicks + typing); uses window.__kiosk
//   only where a direct jump is needed (done screen w/ receipt)
// - Writes PNGs to docs/print/shots/ and fails loudly if any
//   screenshot is missing.
//
// Run (PowerShell):
//   $env:PATH = "C:\Program Files\nodejs;" + $env:PATH
//   node capture-screens.mjs
// ============================================================

import puppeteer from "puppeteer";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = normalize(join(__dirname, "..", ".."));   // smart-locker/
const SHOTS_DIR = join(__dirname, "shots");
const PORT = 5317;

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe")
];
const chromePath = CHROME_PATHS.find((p) => existsSync(p));
if (!chromePath) {
  console.error("Chrome not found in the usual locations.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff2": "font/woff2"
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
    let filePath = normalize(join(APP_ROOT, urlPath === "/" ? "index.html" : urlPath));
    if (!filePath.startsWith(APP_ROOT)) throw new Error("path escape");
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((resolve) => server.listen(PORT, resolve));
console.log(`Static server on http://localhost:${PORT} (root: ${APP_ROOT})`);

mkdirSync(SHOTS_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  args: ["--force-device-scale-factor=1"]
});

const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

async function settle(ms = 700) {
  // Wait for fonts + entrance animations to finish before shooting.
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, ms));
}

async function shot(name) {
  const file = join(SHOTS_DIR, name);
  await page.screenshot({ path: file });
  console.log(`  captured ${name}`);
}

console.log("Loading kiosk (no ?demo)...");
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
await settle(1200);

// --- 1. tap-card ----------------------------------------------------
await page.click(".idle__cta--primary");
await page.waitForSelector("section.tap");
await settle();
await shot("tap-card.png");

// --- 2. dashboard (simulated login via Enter) -----------------------
await page.keyboard.press("Enter");
await page.waitForSelector("section.dash");
await settle();
await shot("dashboard.png");

// --- 3. courier-search with a typed query ---------------------------
await page.evaluate(() => window.__kiosk.navigate("idle"));
await page.waitForSelector(".idle__cta--gold");
await page.click(".idle__cta--gold");
await page.waitForSelector("#q");
await page.type("#q", "arini", { delay: 60 });
await settle();
await shot("courier-search.png");

// --- 4. courier-size -------------------------------------------------
await page.click(".recipient");
await page.waitForSelector(".size-grid");
await settle();
await shot("courier-size.png");

// --- 5. courier-assign (pick "Paket Sedang", 3rd tile) ---------------
await page.evaluate(() => {
  const tiles = [...document.querySelectorAll(".size-grid .size")];
  const sedang = tiles.find((t) => t.textContent.includes("Paket Sedang"));
  sedang.click();
});
await page.waitForSelector(".locker-grid");
await settle();
await shot("courier-assign.png");

// --- 6. done screen with receipt code --------------------------------
// Direct jump: completedLocker only needs number/id/size for rendering.
await page.evaluate(() => {
  window.__kiosk.navigate("done-screen", {
    openReason: "deliver",
    completedLocker: { number: 4, id: "L-04", size: "sedang" }
  });
});
await page.waitForSelector(".done__receipt");
await settle();
await shot("done-receipt.png");

await browser.close();
server.close();

// --- verify -----------------------------------------------------------
const expected = [
  "tap-card.png", "dashboard.png", "courier-search.png",
  "courier-size.png", "courier-assign.png", "done-receipt.png"
];
let ok = true;
for (const f of expected) {
  const p = join(SHOTS_DIR, f);
  if (!existsSync(p) || statSync(p).size < 10_000) {
    console.error(`MISSING/EMPTY: ${f}`);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log(`All ${expected.length} screenshots OK in ${SHOTS_DIR}`);
