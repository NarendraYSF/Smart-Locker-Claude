// ============================================================
// extract-toc-pages.mjs
// ------------------------------------------------------------
// Parse laporan-uts.pdf, cari halaman fisik tempat setiap
// heading Daftar Isi muncul, lalu petakan ke nomor halaman
// AKADEMIK (sesuai @page counter).
//
// Pemetaan pdf_page -> displayed_page:
//   pdf_page 1: Cover (no number)
//   pdf_page 2: Kata Pengantar -> "i"
//   pdf_page 3: Daftar Isi -> "ii"
//   pdf_page N >= 4: BAB body -> arabic = N - 3
//
// Output: JSON ke stdout dan file toc-pages.json
// ============================================================

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pdfPath   = join(__dirname, "laporan-uts.pdf");
const buffer    = new Uint8Array(readFileSync(pdfPath));

const loadingTask = getDocument({ data: buffer, disableFontFace: true });
const pdf = await loadingTask.promise;
const totalPages = pdf.numPages;
console.log(`Total halaman PDF: ${totalPages}`);

// Ekstrak teks per halaman
const pageTexts = [];
for (let i = 1; i <= totalPages; i++) {
  const page = await pdf.getPage(i);
  const tc = await page.getTextContent();
  // Gabung dengan space, tapi hilangkan multiple-space
  const text = tc.items.map((it) => it.str).join(" ").replace(/\s+/g, " ").trim();
  pageTexts.push(text);
}

// Daftar entri yang ingin kita cari (mengikuti urutan Daftar Isi)
// `key` adalah substring unik yang muncul di body laporan untuk heading.
// `tocText` adalah teks persis di TOC (digunakan untuk update HTML).
const entries = [
  { tocText: "KATA PENGANTAR",         key: "KATA PENGANTAR",       roman: true  },
  { tocText: "DAFTAR ISI",             key: "DAFTAR ISI",           roman: true  },
  { tocText: "PENDAHULUAN",            key: "BAB I PENDAHULUAN",    bab:   true  },
  { tocText: "Latar Belakang",         key: "1.1 Latar Belakang"                 },
  { tocText: "Identifikasi Masalah",   key: "1.2 Identifikasi Masalah"           },
  { tocText: "Rumusan Masalah",        key: "1.3 Rumusan Masalah"                },
  { tocText: "Batasan Masalah",        key: "1.4 Batasan Masalah"                },
  { tocText: "Tujuan Project",         key: "1.5 Tujuan Project"                 },
  { tocText: "Manfaat Project",        key: "1.6 Manfaat Project"                },
  { tocText: "Metode Pengumpulan Data",key: "1.7 Metode Pengumpulan Data"        },
  { tocText: "Sistematika Penulisan",  key: "1.8 Sistematika Penulisan"          },
  { tocText: "ANALISIS SISTEM BERJALAN", key: "Objek penelitian dalam laporan ini adalah", bab: true },
  { tocText: "Gambaran Umum Objek Penelitian", key: "2.1 Gambaran Umum Objek Penelitian" },
  { tocText: "Profil Instansi",         key: "2.2 Profil Instansi"               },
  { tocText: "Struktur Organisasi",     key: "2.3 Struktur Organisasi"           },
  { tocText: "Tugas dan Fungsi",        key: "2.4 Tugas dan Fungsi"              },
  { tocText: "Prosedur Sistem Berjalan",key: "2.5 Prosedur Sistem Berjalan"      },
  { tocText: "Dokumen Masukan dan Keluaran", key: "2.6 Dokumen Masukan dan Keluaran" },
  { tocText: "Permasalahan Sistem Berjalan", key: "2.7 Permasalahan Sistem Berjalan" },
  { tocText: "Solusi yang Diusulkan",   key: "2.8 Solusi yang Diusulkan"         },
  { tocText: "ANALISIS KEBUTUHAN SISTEM", key: "Analisis kebutuhan sistem merupakan tahapan penting", bab: true },
  { tocText: "Analisis Kebutuhan Sistem", key: "3.1 Analisis Kebutuhan Sistem"   },
  { tocText: "Identifikasi Pengguna / Aktor", key: "3.2 Identifikasi Pengguna" },
  { tocText: "Kebutuhan Fungsional",    key: "3.3 Kebutuhan Fungsional"          },
  { tocText: "Kebutuhan Nonfungsional", key: "3.4 Kebutuhan Nonfungsional"       },
  { tocText: "Kebutuhan Perangkat Keras", key: "3.5 Kebutuhan Perangkat Keras"   },
  { tocText: "Kebutuhan Perangkat Lunak", key: "3.6 Kebutuhan Perangkat Lunak"   },
  { tocText: "Kebutuhan Data",          key: "3.7 Kebutuhan Data"                },
  { tocText: "Kebutuhan Input, Proses, dan Output", key: "3.8 Kebutuhan Input"   },
  { tocText: "Spesifikasi Kebutuhan Sistem", key: "3.9 Spesifikasi Kebutuhan Sistem" },
  { tocText: "PERANCANGAN SISTEM",      key: "Berdasarkan hasil analisis pada Bab III, dirancanglah", bab: true },
  { tocText: "Rancangan Sistem Usulan", key: "4.1 Rancangan Sistem Usulan"       },
  { tocText: "Use Case Diagram",        key: "4.2 Use Case Diagram"              },
  { tocText: "Deskripsi Use Case",      key: "4.3 Deskripsi Use Case"            },
  { tocText: "Activity Diagram",        key: "4.4 Activity Diagram"              },
  { tocText: "Sequence Diagram",        key: "4.5 Sequence Diagram"              },
  { tocText: "Class Diagram",           key: "4.6 Class Diagram"                 },
  { tocText: "Perancangan Basis Data",  key: "4.7 Perancangan Basis Data"        },
  { tocText: "Struktur Tabel",          key: "4.8 Struktur Tabel"                },
  { tocText: "Rancangan Antarmuka",     key: "4.9 Rancangan Antarmuka"           },
];

// Cari halaman pertama yang mengandung key tersebut.
// startFrom: index halaman (0-based) untuk mulai mencari.
// Body content (BAB I onwards) selalu mulai dari page 4 (PDF index 3),
// jadi kita skip page 1-3 (cover + Kata Pengantar + Daftar Isi) untuk
// mencegah false positive dari Daftar Isi yang nge-list semua heading.
function findPage(searchKey, startFrom = 0) {
  for (let i = startFrom; i < pageTexts.length; i++) {
    if (pageTexts[i].includes(searchKey)) return i + 1;
  }
  return null;
}

function toRoman(n) {
  if (n <= 0) return "?";
  const map = [
    ["x", 10], ["ix", 9], ["v", 5], ["iv", 4], ["i", 1],
  ];
  let r = "", x = n;
  for (const [c, v] of map) while (x >= v) { r += c; x -= v; }
  return r;
}

// Daftar Isi bisa span >1 halaman. Kita deteksi otomatis kapan body
// mulai dengan mencari paragraf pertama 1.1 Latar Belakang yang TIDAK
// muncul di Daftar Isi (Daftar Isi cuma punya teks "Latar Belakang"
// sebagai item, BUKAN paragraf "Perkembangan teknologi informasi...").
const BODY_START_MARKER = "Perkembangan teknologi informasi";
let bodyStartIndex = pageTexts.findIndex((t) => t.includes(BODY_START_MARKER));
if (bodyStartIndex < 0) {
  console.warn(`PERINGATAN: marker body tidak ditemukan, fallback ke index 3`);
  bodyStartIndex = 3;
}
console.log(`Body content mulai di PDF page: ${bodyStartIndex + 1}`);

// Halaman roman = halaman sebelum bodyStartIndex (skip cover di page 1)
// Mapping: pdf_page=2 -> "i", pdf_page=3 -> "ii", dst.
// Mapping body: pdf_page=bodyStartIndex+1 -> "1", dst.
const BODY_PAGE_OFFSET = bodyStartIndex; // pdf_page - bodyStartIndex = displayed_arabic

function toDisplayedV2(pdfPage, isRoman) {
  if (pdfPage == null) return "?";
  if (isRoman) return toRoman(pdfPage - 1); // page 2 -> i, page 3 -> ii
  return String(pdfPage - BODY_PAGE_OFFSET);
}

const result = entries.map((e) => {
  const startFrom = e.roman ? 0 : bodyStartIndex;
  const pdfPage = findPage(e.key, startFrom);
  const displayed = toDisplayedV2(pdfPage, e.roman);
  return { tocText: e.tocText, key: e.key, pdfPage, displayed, isBab: !!e.bab, isRoman: !!e.roman };
});

// Tampilkan tabel ringkas
console.log("\n" + "─".repeat(80));
console.log("Entri Daftar Isi".padEnd(50) + "PDF#".padStart(6) + "Displayed".padStart(12));
console.log("─".repeat(80));
for (const r of result) {
  const lbl = (r.isBab ? "[BAB] " : r.isRoman ? "[ROM] " : "      ") + r.tocText;
  console.log(lbl.padEnd(50) + String(r.pdfPage ?? "?").padStart(6) + String(r.displayed).padStart(12));
}
console.log("─".repeat(80));

// Simpan ke JSON
const outPath = join(__dirname, "toc-pages.json");
writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log(`\nMapping disimpan ke: ${outPath}`);
