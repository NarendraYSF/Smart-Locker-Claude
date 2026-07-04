// ============================================================
// update-toc.mjs
// ------------------------------------------------------------
// Update entri Daftar Isi di laporan-uts.html berdasarkan
// mapping nomor halaman dari toc-pages.json (yang dihasilkan
// oleh extract-toc-pages.mjs).
//
// Workflow:
//   1. node print-to-pdf.mjs       -> generate PDF
//   2. node extract-toc-pages.mjs  -> parse PDF, hasilkan toc-pages.json
//   3. node update-toc.mjs         -> update HTML Daftar Isi
//   4. node print-to-pdf.mjs       -> regenerate PDF dengan TOC yang benar
// ============================================================

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, "laporan-uts.html");
const jsonPath = join(__dirname, "toc-pages.json");

const mapping = JSON.parse(readFileSync(jsonPath, "utf8"));
let html = readFileSync(htmlPath, "utf8");

// Untuk setiap entri di mapping, cari <li ...><span ...>NUM</span><span class="title-text">TOC_TEXT</span>...<span class="pg">OLD</span></li>
// dan update OLD -> displayed value.
let updates = 0;
for (const entry of mapping) {
  if (!entry.displayed || entry.displayed === "?") continue;

  // Escape regex special chars di tocText
  const escapedTitle = entry.tocText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Pattern: cari <li> yang berisi span title-text dengan tocText, lalu
  // tangkap dan ganti angka di <span class="pg">N</span> di akhir <li>.
  // Kita cari di seluruh document karena Daftar Isi muncul sekali saja.
  const re = new RegExp(
    `(<li[^>]*>[^]*?<span class="title-text">${escapedTitle}</span>[^]*?<span class="pg">)([^<]+)(</span></li>)`,
    "g"
  );

  const newHtml = html.replace(re, (match, before, oldVal, after) => {
    if (oldVal === entry.displayed) return match;
    updates++;
    console.log(
      `  ${entry.tocText.padEnd(45)} ${oldVal.padStart(4)} -> ${entry.displayed}`
    );
    return `${before}${entry.displayed}${after}`;
  });

  html = newHtml;
}

writeFileSync(htmlPath, html, "utf8");
console.log(`\nSelesai. ${updates} entri Daftar Isi di-update.`);
