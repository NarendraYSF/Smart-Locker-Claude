// One-shot layout check: renders each print HTML via file:// and
// screenshots the .page element to shots/_preview-*.png for review.
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe")
];
const chromePath = CHROME_PATHS.find((p) => existsSync(p));

const browser = await puppeteer.launch({ executablePath: chromePath, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 1 });

for (const file of ["poster-kurir.html", "panduan-staf.html", "log-kertas.html"]) {
  await page.goto(pathToFileURL(join(__dirname, file)).href, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  const els = await page.$$(".page");
  for (let i = 0; i < els.length; i++) {
    const suffix = els.length > 1 ? `-p${i + 1}` : "";
    await els[i].screenshot({
      path: join(__dirname, "shots", `_preview-${file.replace(".html", "")}${suffix}.png`)
    });
  }
  console.log(`previewed ${file} (${els.length} page/s)`);
}
await browser.close();
