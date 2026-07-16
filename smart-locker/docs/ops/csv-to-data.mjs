// ============================================================
// csv-to-data.mjs
// ------------------------------------------------------------
// Converts the Sekretariat staff spreadsheet (semicolon CSV,
// see staff-template.csv) into the `staff` array block for
// smart-locker/scripts/data.js.
//
// Usage:
//   node csv-to-data.mjs staff-filled.csv            # prints the array
//   node csv-to-data.mjs staff-filled.csv > out.txt  # or into a file
//
// Validates every row; on any error, prints ALL problems and
// exits non-zero without producing output.
// See docs/DATA-ONBOARDING.md for the full procedure.
// ============================================================

import { readFileSync } from "node:fs";

const VALID_ROLES = ["Dosen", "Tenaga Kependidikan"];
const KNOWN_DEPTS = [
  "Teknik Informatika", "Sistem Informasi", "Matematika", "Fisika",
  "Kimia", "Biologi", "Agribisnis", "Sekretariat FST"
];
// Tokens skipped when deriving initials (mirrors the fuzzy-search list)
const TITLE_TOKENS = new Set([
  "dr", "prof", "drs", "dra", "ir", "st", "mt", "msi", "mkom", "skom",
  "ssi", "se", "mm", "mpd", "spd", "msc", "phd", "ph", "d", "magri", "magr"
]);

const file = process.argv[2];
if (!file) {
  console.error("Usage: node csv-to-data.mjs <staff.csv>");
  process.exit(1);
}

const raw = readFileSync(file, "utf8").replace(/^\uFEFF/, ""); // strip Excel BOM
const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
const header = lines[0].split(";").map((h) => h.trim().toLowerCase());

const EXPECTED = ["nip", "nama_lengkap", "role", "departemen", "rfid_uid", "loker_permanen"];
if (EXPECTED.some((c, i) => header[i] !== c)) {
  console.error(`Header salah. Harus persis:\n  ${EXPECTED.join(";")}\nDitemukan:\n  ${header.join(";")}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const seenNip = new Map();
const seenUid = new Map();
const seenLocker = new Map();
const rows = [];

function initialsFrom(name) {
  const words = name
    .replace(/[^A-Za-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !TITLE_TOKENS.has(w.toLowerCase()));
  const first = words[0] ? words[0][0] : "?";
  const second = words[1] ? words[1][0] : (words[0] ? words[0][1] || "" : "");
  return (first + second).toUpperCase();
}

for (let i = 1; i < lines.length; i++) {
  const lineNo = i + 1;
  const cols = lines[i].split(";").map((c) => c.trim());
  // Skip fully empty template rows
  if (cols.every((c) => c === "")) continue;

  const [nip, nama, role, dept, uidRaw, lockerRaw] = cols;
  const uid = (uidRaw || "").toUpperCase();
  const locker = (lockerRaw || "").toUpperCase();

  if (!/^\d{18}$/.test(nip)) {
    errors.push(`Baris ${lineNo}: NIP harus tepat 18 digit tanpa spasi (ditemukan "${nip}")`);
  } else if (seenNip.has(nip)) {
    errors.push(`Baris ${lineNo}: NIP ${nip} duplikat (sudah ada di baris ${seenNip.get(nip)})`);
  } else {
    seenNip.set(nip, lineNo);
  }

  if (!nama) errors.push(`Baris ${lineNo}: nama_lengkap kosong`);

  if (!VALID_ROLES.includes(role)) {
    errors.push(`Baris ${lineNo}: role harus persis "Dosen" atau "Tenaga Kependidikan" (ditemukan "${role}")`);
  }

  if (!dept) {
    errors.push(`Baris ${lineNo}: departemen kosong`);
  } else if (!KNOWN_DEPTS.includes(dept)) {
    warnings.push(`Baris ${lineNo}: departemen "${dept}" tidak ada di daftar dikenal (${KNOWN_DEPTS.join(", ")}) — dibiarkan, pastikan ejaan benar`);
  }

  if (uid !== "") {
    if (!/^[0-9A-F]{6,20}$/.test(uid)) {
      errors.push(`Baris ${lineNo}: rfid_uid harus heksadesimal (0-9, A-F) tanpa pemisah, atau kosong (ditemukan "${uidRaw}")`);
    } else if (seenUid.has(uid)) {
      errors.push(`Baris ${lineNo}: rfid_uid ${uid} duplikat (sudah ada di baris ${seenUid.get(uid)})`);
    } else {
      seenUid.set(uid, lineNo);
    }
  }

  if (locker !== "") {
    const m = locker.match(/^L-(\d{2})$/);
    const n = m ? Number(m[1]) : 0;
    if (!m || n < 1 || n > 24) {
      errors.push(`Baris ${lineNo}: loker_permanen harus L-01 s.d. L-24 atau kosong (ditemukan "${lockerRaw}")`);
    } else if (seenLocker.has(locker)) {
      errors.push(`Baris ${lineNo}: loker ${locker} dipakai dua kali (sudah ada di baris ${seenLocker.get(locker)})`);
    } else {
      seenLocker.set(locker, lineNo);
    }
  }

  rows.push({ nip, nama, role, dept, uid, locker });
}

if (rows.length === 0) errors.push("Tidak ada baris data terisi.");

for (const w of warnings) console.error(`PERINGATAN: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} KESALAHAN — perbaiki CSV lalu jalankan ulang:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const entries = rows.map((r) => `  {
    nip: "${r.nip}",
    name: "${esc(r.nama)}",
    role: "${r.role}",
    dept: "${esc(r.dept)}",
    initials: "${initialsFrom(r.nama)}",
    rfid: ${r.uid ? `"${r.uid}"` : "null"},
    lockerId: ${r.locker ? `"${r.locker}"` : "null"}
  }`);

console.log(`/** Staff directory — generated from ${file}, ${new Date().toISOString().slice(0, 10)} (${rows.length} orang) */
export const staff = [
${entries.join(",\n")}
];`);
console.error(`\nOK: ${rows.length} staf tervalidasi. Tempel blok di atas ke scripts/data.js menggantikan array staff lama.`);
