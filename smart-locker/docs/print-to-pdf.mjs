// ============================================================
// print-to-pdf.mjs
// ------------------------------------------------------------
// Cetak laporan-uts.html ke PDF dengan paginasi DETERMINISTIK
// menggunakan Puppeteer (headless Chromium). Berbeda dengan
// `chrome --print-to-pdf` biasa, script ini secara eksplisit
// menunggu SEMUA gambar diagram PlantUML selesai dimuat dari
// server sebelum mencetak — sehingga halaman tidak bergeser
// karena diagram yang masih kosong.
//
// CARA PAKAI (sekali saja install dependencies):
//   cd smart-locker/docs
//   npm init -y
//   npm install puppeteer
//   node print-to-pdf.mjs
//
// OUTPUT: laporan-uts.pdf di folder yang sama.
// ============================================================

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, statSync } from "node:fs";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath  = join(__dirname, "laporan-uts.html");
const pdfPath   = join(__dirname, "laporan-uts.pdf");

if (!existsSync(htmlPath)) {
  console.error(`File tidak ditemukan: ${htmlPath}`);
  process.exit(1);
}

console.log(`Input  : ${htmlPath}`);
console.log(`Output : ${pdfPath}`);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage();

  // Emulate "screen" media supaya layout konsisten dengan tampilan layar.
  // Ganti ke "print" jika kamu ingin engine memakai @media print rules,
  // tapi karena CSS sudah pakai @page + @media print, "screen" sudah cukup.
  await page.emulateMediaType("print");

  // Load HTML lokal
  const fileUrl = pathToFileURL(htmlPath).href;
  await page.goto(fileUrl, {
    waitUntil: ["load", "domcontentloaded", "networkidle0"],
    timeout: 60_000,
  });

  // Tunggu SEMUA gambar di halaman (termasuk PlantUML async) selesai dimuat.
  // Ini bagian paling penting agar pagination tidak bergeser.
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          // resolve apa pun yang terjadi (selesai / error) agar tidak hang
          img.addEventListener("load",  resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );
    // Beri 500ms tambahan supaya layout settle setelah gambar terakhir.
    await new Promise((r) => setTimeout(r, 500));
    // Pastikan font sudah ready (Times New Roman tersedia di Windows tapi
    // tetap aman menunggu document.fonts.ready)
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Cetak PDF. Kalau file utama terkunci (mis. dibuka di IDE / PDF viewer),
  // fallback ke nama file dengan suffix timestamp.
  let outputPath = pdfPath;
  try {
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true, // pakai @page CSS (size A4 + margin 0)
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
      timeout: 120_000,
    });
  } catch (err) {
    if (err && err.code === "EBUSY") {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      outputPath = pdfPath.replace(/\.pdf$/i, `-${stamp}.pdf`);
      console.warn(`\n[!] File utama sedang terkunci. Menulis ke: ${outputPath}`);
      await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        displayHeaderFooter: false,
        timeout: 120_000,
      });
    } else {
      throw err;
    }
  }

  const sizeKB = (statSync(outputPath).size / 1024).toFixed(0);
  console.log(`\nOK. PDF dibuat: ${outputPath} (${sizeKB} KB)`);
} finally {
  await browser.close();
}
