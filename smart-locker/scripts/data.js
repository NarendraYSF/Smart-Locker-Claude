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

/** Locker grid: 3 columns x 8 rows = 24 cells.
 *  size distribution: row 1 (cells 1-3)   = besar
 *                     rows 2-3 (cells 4-9) = sedang
 *                     rows 4-8 (cells 10-24) = kecil
 */
export const lockers = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  let size = "kecil";
  if (n <= 3) size = "besar";
  else if (n <= 9) size = "sedang";
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
    lockerId: "L-19"
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
    lockerId: "L-20"
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
    lockerId: "L-21"
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

// --- Locker state transitions ---------------------------------------
// The only place locker.state may be mutated. Each function enforces its
// valid from-state and returns the locker, or null if the transition was
// invalid (so stray calls can never corrupt inventory).

function lockerById(id) {
  return lockers.find((l) => l.id === id) || null;
}

/** available -> delivering. Reserve a locker for an in-progress courier deposit. */
export function reserveLocker(id) {
  const l = lockerById(id);
  if (!l || l.state !== "available") return null;
  l.state = "delivering";
  return l;
}

/** delivering -> available. Cancel/timeout path; no-op on any other state. */
export function releaseLocker(id) {
  const l = lockerById(id);
  if (!l || l.state !== "delivering") return null;
  l.state = "available";
  l.ownerNip = null;
  return l;
}

/** delivering -> occupied. Successful deposit; records the recipient. */
export function occupyLocker(id, ownerNip = null) {
  const l = lockerById(id);
  if (!l || l.state !== "delivering") return null;
  l.state = "occupied";
  l.ownerNip = ownerNip;
  return l;
}

// --- Mail lifecycle ---------------------------------------------------

let deliverySeq = 100;

/** Register a completed courier deposit as claimable incoming mail. */
export function recordDelivery({ lockerId, recipientNip, type, sender = "Kurir", note = "Titipan kurir" }) {
  deliverySeq += 1;
  const m = {
    id: `M-${deliverySeq}`,
    recipientNip,
    sender,
    type,
    note,
    arrivedAt: new Date().toISOString(),
    lockerId
  };
  incomingMail.push(m);
  const l = lockerById(lockerId);
  if (l) l.hasMail = true;
  return m;
}

/**
 * Complete a mail claim: remove the item, refresh the locker's mail flag,
 * and free the locker again if it was a courier-assigned one (not the
 * recipient's permanent locker) with nothing left inside.
 */
export function claimMail(mailId) {
  const idx = incomingMail.findIndex((m) => m.id === mailId);
  if (idx === -1) return null;
  const [m] = incomingMail.splice(idx, 1);
  const l = lockerById(m.lockerId);
  if (l) {
    l.hasMail = incomingMail.some((x) => x.lockerId === l.id);
    const owner = staff.find((s) => s.nip === m.recipientNip);
    const isPermanent = Boolean(owner && owner.lockerId === l.id);
    if (!isPermanent && !l.hasMail && l.state === "occupied") {
      l.state = "available";
      l.ownerNip = null;
    }
  }
  return m;
}

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

// --- Staff search ------------------------------------------------------
// Couriers type names from package labels: no academic titles, honorifics
// ("Pak Budi"), and the occasional typo. Matching is therefore fuzzy:
// titles/degrees are stripped, query tokens may appear in any order, and
// tokens of 4+ characters tolerate a single-character typo.

const TITLE_TOKENS = new Set([
  // academic titles & common degree fragments
  "dr", "prof", "drs", "dra", "ir", "st", "mt", "msi", "mkom", "skom",
  "ssi", "se", "mm", "mpd", "spd", "msc", "phd", "ph", "d", "magri", "magr",
  // honorifics couriers might type
  "pak", "bu", "ibu", "bapak", "mas", "mbak"
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !TITLE_TOKENS.has(t));
}

/** True if a and b differ by at most one edit (insert/delete/substitute). */
function withinOneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i += 1;
      j += 1;
      continue;
    }
    if (edits) return false;
    edits = 1;
    if (short.length === long.length) i += 1; // substitution
    j += 1; // insertion in the longer string
  }
  return true;
}

function tokenMatches(queryToken, targetToken) {
  if (targetToken.includes(queryToken)) return true;
  if (queryToken.length >= 4 && withinOneEdit(queryToken, targetToken)) return true;
  return false;
}

/** Utility: fuzzy search staff by free-text query (name / NIP / dept). */
export function searchStaff(q) {
  const raw = q.trim().toLowerCase();
  if (!raw) return staff;

  // digit queries search the NIP directly
  const digits = raw.replace(/\D/g, "");
  const queryTokens = tokenize(raw);

  return staff.filter((x) => {
    if (digits.length >= 4 && x.nip.includes(digits)) return true;
    if (queryTokens.length === 0) return false;
    const targetTokens = [...tokenize(x.name), ...tokenize(x.dept)];
    return queryTokens.every((qt) =>
      targetTokens.some((tt) => tokenMatches(qt, tt))
    );
  });
}
