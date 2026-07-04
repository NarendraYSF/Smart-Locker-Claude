// Mock data for the static prototype.
// Represents dosen & tenaga kependidikan of FST UIN Syarif Hidayatullah Jakarta.

/** Departments within FST */
export const departments = [
  "Teknik Informatika",
  "Sistem Informasi",
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Agribisnis"
];

/** Locker grid: 6 columns x 8 rows = 48 cells.
 *  size distribution: rows 1-1 (cells 1-6)  = besar
 *                     rows 2-3 (cells 7-18) = sedang
 *                     rows 4-8 (cells 19-48) = kecil
 */
export const lockers = Array.from({ length: 48 }, (_, i) => {
  const n = i + 1;
  let size = "kecil";
  if (n <= 6) size = "besar";
  else if (n <= 18) size = "sedang";
  return {
    id: `L-${String(n).padStart(2, "0")}`,
    number: n,
    size,
    state: "available", // available | assigned | occupied | delivering
    ownerNip: null
  };
});

/** Staff directory */
export const staff = [
  {
    nip: "198203102009011012",
    name: "Dr. Arini Hidayati, M.Kom.",
    role: "Dosen",
    dept: "Teknik Informatika",
    initials: "AH",
    rfid: "04A1B2C3",
    lockerId: "L-12"
  },
  {
    nip: "197809152005012008",
    name: "Prof. Budi Santoso, Ph.D.",
    role: "Dosen",
    dept: "Matematika",
    initials: "BS",
    rfid: "04A1B2C4",
    lockerId: "L-03"
  },
  {
    nip: "199104272015042003",
    name: "Siti Nurhaliza, S.Kom., M.T.",
    role: "Dosen",
    dept: "Sistem Informasi",
    initials: "SN",
    rfid: "04A1B2C5",
    lockerId: "L-22"
  },
  {
    nip: "198712112011031004",
    name: "Dr. Fajar Ramadhan, M.Si.",
    role: "Dosen",
    dept: "Fisika",
    initials: "FR",
    rfid: "04A1B2C6",
    lockerId: "L-07"
  },
  {
    nip: "199305182019032006",
    name: "Laila Khoirunnisa, S.Si.",
    role: "Tenaga Kependidikan",
    dept: "Biologi",
    initials: "LK",
    rfid: "04A1B2C7",
    lockerId: "L-28"
  },
  {
    nip: "198505232010121001",
    name: "Dr. Ahmad Zaki, M.Sc.",
    role: "Dosen",
    dept: "Kimia",
    initials: "AZ",
    rfid: "04A1B2C8",
    lockerId: "L-14"
  },
  {
    nip: "199607122020121011",
    name: "Rina Agustina, S.E.",
    role: "Tenaga Kependidikan",
    dept: "Sekretariat FST",
    initials: "RA",
    rfid: "04A1B2C9",
    lockerId: "L-31"
  },
  {
    nip: "198812152013041005",
    name: "Dr. Haikal Firmansyah, M.Agri.",
    role: "Dosen",
    dept: "Agribisnis",
    initials: "HF",
    rfid: "04A1B2CA",
    lockerId: "L-09"
  },
  {
    nip: "199209292018032004",
    name: "Maya Putri Lestari, S.Kom.",
    role: "Tenaga Kependidikan",
    dept: "Teknik Informatika",
    initials: "MP",
    rfid: "04A1B2CB",
    lockerId: "L-35"
  },
  {
    nip: "198001112006041003",
    name: "Prof. Dr. Kurnia Rahman, M.Pd.",
    role: "Dosen",
    dept: "Matematika",
    initials: "KR",
    rfid: "04A1B2CC",
    lockerId: "L-02"
  }
];

/** Pending mail for certain staff */
export const incomingMail = [
  {
    id: "M-001",
    recipientNip: "198203102009011012",
    sender: "Kantor Pos Ciputat",
    type: "Paket Kecil",
    note: "Dokumen akademik",
    arrivedAt: offsetHours(-2),
    lockerId: "L-12"
  },
  {
    id: "M-002",
    recipientNip: "198203102009011012",
    sender: "Penerbit Erlangga",
    type: "Surat",
    note: "Undangan workshop",
    arrivedAt: offsetHours(-24),
    lockerId: "L-12"
  },
  {
    id: "M-003",
    recipientNip: "199104272015042003",
    sender: "JNE Express",
    type: "Paket Sedang",
    note: "Buku referensi",
    arrivedAt: offsetHours(-5),
    lockerId: "L-22"
  },
  {
    id: "M-004",
    recipientNip: "198505232010121001",
    sender: "LIPI",
    type: "Surat",
    note: "Konfirmasi kolaborasi riset",
    arrivedAt: offsetHours(-40),
    lockerId: "L-14"
  }
];

/** Package size options for courier flow */
export const packageSizes = [
  {
    id: "surat",
    name: "Surat",
    icon: "envelope",
    dim: "Max A4 · < 2cm",
    bucket: "kecil"
  },
  {
    id: "kecil",
    name: "Paket Kecil",
    icon: "boxSm",
    dim: "Max 25 \u00D7 20 \u00D7 10 cm",
    bucket: "kecil"
  },
  {
    id: "sedang",
    name: "Paket Sedang",
    icon: "boxMd",
    dim: "Max 40 \u00D7 30 \u00D7 25 cm",
    bucket: "sedang"
  },
  {
    id: "besar",
    name: "Paket Besar",
    icon: "boxLg",
    dim: "Max 60 \u00D7 45 \u00D7 40 cm",
    bucket: "besar"
  }
];

/** Seed some lockers as occupied and mail-linked for visual richness */
function seed() {
  for (const s of staff) {
    const l = lockers.find((x) => x.id === s.lockerId);
    if (l) {
      l.state = "occupied";
      l.ownerNip = s.nip;
    }
  }
  for (const m of incomingMail) {
    if (!m.lockerId) continue;
    const l = lockers.find((x) => x.id === m.lockerId);
    if (l) l.hasMail = true;
  }
}

function offsetHours(delta) {
  const d = new Date();
  d.setHours(d.getHours() + delta);
  return d.toISOString();
}

seed();

/** Utility: how many free lockers of a given size bucket. */
export function countFree(size) {
  return lockers.filter((l) => l.size === size && l.state === "available").length;
}

/** Utility: find first free locker of a given size; null if none. */
export function findFreeLocker(size) {
  return lockers.find((l) => l.size === size && l.state === "available") || null;
}

/** Utility: get mail for a given NIP, sorted newest first. */
export function mailFor(nip) {
  return incomingMail
    .filter((m) => m.recipientNip === nip)
    .sort((a, b) => new Date(b.arrivedAt) - new Date(a.arrivedAt));
}

/** Utility: search staff by free-text query (name / NIP / dept). */
export function searchStaff(q) {
  const s = q.trim().toLowerCase();
  if (!s) return staff;
  return staff.filter(
    (x) =>
      x.name.toLowerCase().includes(s) ||
      x.nip.includes(s) ||
      x.dept.toLowerCase().includes(s)
  );
}
