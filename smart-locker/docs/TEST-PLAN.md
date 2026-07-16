# Rencana Pengujian & Checklist UAT — Loker Pintar FST

> Status: siap dieksekusi · 11 Jul 2026
>
> Metode: **black-box** terhadap prototipe browser. Setiap kasus uji dipetakan
> ke use case pada `docs/uml/bab4/use-case.puml` (UC-01 s.d. UC-11) sehingga
> matriks ini dapat diangkat langsung ke bab pengujian laporan UAS.
> Pengujian perangkat keras TIDAK diduplikasi di sini — lihat bagian 7.

---

## 1. Pendahuluan

### 1.1 Tujuan

Memverifikasi bahwa seluruh fungsi prototipe kios Loker Pintar FST berjalan
sesuai spesifikasi (dokumen `docs/prd/`), termasuk jalur pembatalan, guard
navigasi, dan perilaku lintas alur (timer inaktivitas, kode bukti titip).

### 1.2 Ruang lingkup

- **Termasuk:** seluruh alur fungsional yang dapat dieksekusi di browser
  (autentikasi simulasi, dashboard, kiriman, penitipan kurir, pembatalan,
  bantuan), pengujian lintas alur, nonfungsional dasar, dan UAT per persona.
- **Tidak termasuk:** integrasi RFID/solenoid/sensor pintu nyata — checklist
  bench dan end-to-end hardware ada di `docs/INTEGRATION-SPEC.md` §9
  (dirujuk pada bagian 7); notifikasi penerima (belum diimplementasikan,
  backlog B-01); konsol admin (B-03).

### 1.3 Lingkungan uji

| Komponen | Nilai |
|---|---|
| Perangkat | PC/tablet dengan layar sentuh (target: 10.5" 16:10 portrait) |
| Browser | Chrome mode kios (`--kiosk`, lihat RUNBOOK §1.3) |
| Server | `python -m http.server 5173` dari folder `smart-locker/` |
| URL produksi | `http://localhost:5173` — **tanpa** `?demo` |
| URL uji cepat idle | `http://localhost:5173/?idle=15` (timeout 15 detik) |
| Data | Seed bawaan `scripts/data.js` (24 loker; pengguna demo NIP 198203102009011012 memiliki 2 kiriman di L-12) |
| Reset antar kasus | Muat ulang halaman (state prototipe seluruhnya in-memory) |

### 1.4 Format kasus uji

Kolom **Hasil Aktual** dan **Status** (Lulus / Gagal / Blokir) diisi penguji.
Langkah selalu dimulai dari layar Idle setelah muat ulang, kecuali disebutkan.

---

## 2. Matriks kasus uji fungsional

### TC-UC01 — Autentikasi via RFID (layar Tap Card)

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC01-01 | Tap sukses (simulasi) | Idle → "Staf Akademik" → tap tombol "Simulasikan Tap" | Masuk ke Dashboard atas nama Dr. Arini Hidayati (NIP 198203102009011012) | | |
| TC-UC01-02 | Tap via Enter | Di layar Tap Card tekan Enter | Sama dengan TC-UC01-01 | | |
| TC-UC01-03 | Batal | Di layar Tap Card tap "Batal" | Kembali ke Idle, tidak ada sesi | | |
| TC-UC01-04 | Escape | Di layar Tap Card tekan Escape | Sama dengan TC-UC01-03 | | |
| TC-UC01-05 | Tanpa `?demo` tidak auto-login | Buka URL polos, diamkan layar Tap Card 10 detik | TIDAK ada login otomatis (layar menunggu) | | |
| TC-UC01-06 | Dengan `?demo` auto-login | Buka `/?demo`, masuk Tap Card, tunggu ±3,5 detik | Login otomatis terjadi (mode pameran) | | |

### TC-UC02 — Lihat Dashboard Personal

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC02-01 | Ringkasan benar | Login sebagai pengguna demo | "Loker Anda" = 12; "Kiriman Baru" = 02 (emas); "Status" = Aktif; pill role/departemen/NIP tampil | | |
| TC-UC02-02 | Tile kiriman aktif | Amati tile "02 · Kiriman" | Badge "2", foot "Ambil kiriman", tile bisa ditap | | |
| TC-UC02-03 | Tile kiriman nonaktif saat 0 | Klaim kedua kiriman (lihat TC-UC05), kembali ke Dashboard via login ulang | Tile "02 · Kiriman" redup, pill "Kosong", tidak bisa ditap | | |
| TC-UC02-04 | Keluar | Tap tile "03 · Keluar" | Kembali ke Idle | | |
| TC-UC02-05 | Guard tanpa sesi | Di console jalankan `__kiosk.navigate("dashboard")` tanpa login | Dialihkan kembali ke Idle (tidak crash) | | |

### TC-UC03 — Buka Loker Pribadi

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC03-01 | Layar terbuka benar | Dashboard → "Buka Loker Saya" | Layar Opening aksen hijau; nomor "12"; pill "Loker terbuka untuk Anda"; countdown mulai 30 | | |
| TC-UC03-02 | Selesai manual | Tap "Selesai" sebelum countdown habis | Layar Done hijau "Loker telah ditutup."; auto-return 5 detik | | |
| TC-UC03-03 | Countdown habis | Diamkan 30 detik (sentuh layar sesekali agar idle reset tidak menyela) | Otomatis pindah ke Done (perilaku prototipe; dengan hardware nanti dikonfirmasi sensor pintu) | | |

### TC-UC04 — Lihat Daftar Kiriman

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC04-01 | Daftar tampil urut terbaru | Dashboard → "Surat & Paket" | 2 item; "Kantor Pos Ciputat" (±2 jam lalu) di atas "Penerbit Erlangga" (±24 jam lalu); crumb "2 kiriman" | | |
| TC-UC04-02 | Meta item lengkap | Amati item pertama | Ikon sesuai jenis, pengirim, catatan italic, meta: jenis · "Loker 12" · umur relatif · jam tiba | | |
| TC-UC04-03 | Kembali | Tap "Kembali" atau "Tutup" | Kembali ke Dashboard, sesi tetap | | |

### TC-UC05 — Ambil Kiriman

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC05-01 | Klaim sukses | Mail → "Ambil" pada M-001 → layar Opening emas "Kiriman siap diambil" → "Sudah Diambil" | Done emas "Kiriman telah diambil."; login ulang: "Kiriman Baru" = 01 dan M-001 hilang dari daftar | | |
| TC-UC05-02 | Loker permanen tetap terisi | Setelah TC-UC05-01 amati peta loker (alur kurir, layar Assign) | L-12 tetap gelap/terisi (loker permanen staf, masih ada M-002) | | |
| TC-UC05-03 | Loker kurir bebas setelah klaim | Titipkan paket baru ke pengguna demo (alur UC-08, loker non-permanen mis. L-01/L-04/L-10), lalu klaim kiriman tsb | Setelah klaim, loker tsb kembali "Tersedia" di peta dan hitungan ukuran bertambah 1 | | |

### TC-UC06 — Cari Penerima (fuzzy search)

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC06-01 | Daftar awal | Idle → "Kirim Surat atau Paket" | 10 staf tampil, caption "10 hasil", foot menunjukkan jumlah loker tersedia | | |
| TC-UC06-02 | Cari tanpa gelar | Ketik `arini hidayati` | "Dr. Arini Hidayati, M.Kom." ditemukan | | |
| TC-UC06-03 | Gelar/honorifik diabaikan | Ketik `pak budi` | "Prof. Budi Santoso, Ph.D." ditemukan | | |
| TC-UC06-04 | Urutan kata bebas | Ketik `santoso budi` | Prof. Budi Santoso tetap ditemukan | | |
| TC-UC06-05 | Toleransi 1 typo | Ketik `budhi` | Prof. Budi Santoso ditemukan | | |
| TC-UC06-06 | Cari via NIP | Ketik `1982` | Staf dengan NIP mengandung "1982" ditemukan (Dr. Arini) | | |
| TC-UC06-07 | Cari via departemen | Ketik `fisika` | Dr. Fajar Ramadhan ditemukan | | |
| TC-UC06-08 | 0 hasil | Ketik `zzzz` | Caption "0 hasil" + pesan "Tidak ada staf cocok dengan pencarian. Coba nama tanpa gelar, departemen, atau NIP." | | |
| TC-UC06-09 | Batal | Tap "Batal" | Kembali ke Idle | | |

Catatan: tombol "Tampilkan lebih banyak" hanya muncul bila hasil > 12;
dengan 10 staf seed, kasus paginasi **Blokir — data** (catat di rekap; uji
ulang setelah direktori staf produksi dimuat).

### TC-UC07 — Pilih Ukuran Paket

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC07-01 | Hitungan per ukuran | Pilih penerima → amati 4 tile | Kondisi seed: Surat & Paket Kecil = 10 tersedia; Paket Sedang = 4; Paket Besar = 2 (10 loker permanen terisi) | | |
| TC-UC07-02 | Surat = pool Paket Kecil | Bandingkan angka tile "Surat" dan "Paket Kecil" | Selalu identik (satu pool loker kecil) | | |
| TC-UC07-03 | Tile penuh nonaktif | Titipkan paket besar 2× (L-01, L-02 terisi — L-03 sudah permanen), kembali pilih ukuran | Tile "Paket Besar" redup, teks "Loker penuh untuk ukuran ini", tidak bisa ditap | | |
| TC-UC07-04 | Ganti Penerima | Tap "Ganti Penerima" | Kembali ke pencarian, penerima bisa dipilih ulang | | |

### TC-UC08 — Titipkan Paket

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC08-01 | Alokasi & peta | Pilih "Paket Sedang" | Layar Assign: "Loker 04" (loker sedang bebas bernomor terkecil); peta 3×8: L-04 emas "Target", loker permanen gelap "Terisi" | | |
| TC-UC08-02 | Reservasi mengunci loker | Saat di layar Assign, hitung foot "loker tersedia" di benak: | Jumlah tersedia berkurang 1 dibanding sebelum masuk Assign (loker ber-status delivering) | | |
| TC-UC08-03 | Ganti Ukuran melepas reservasi | Tap "Ganti Ukuran" lalu amati tile | Hitungan ukuran kembali seperti semula (reservasi dilepas) | | |
| TC-UC08-04 | Deposit sukses | "Buka Loker & Titipkan" → "Sudah Diletakkan" | Done emas "Terima kasih, kiriman telah tersimpan." + Kode Bukti Titip + detail loker | | |
| TC-UC08-05 | Kiriman terdaftar untuk penerima | Setelah TC-UC08-04, login sebagai staf (penerima = pengguna demo) | Kiriman baru muncul di daftar: pengirim "Kurir", catatan "Titipan kurir", loker sesuai | | |

### TC-UC09 — Batalkan Operasi (3 varian "Batal" di layar Opening)

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC09-01 | Batal — loker pribadi | UC-03 sampai layar Opening → "Batal" | Kembali ke **Dashboard**; TANPA layar sukses | | |
| TC-UC09-02 | Batal — ambil kiriman | UC-05 sampai layar Opening → "Batal" | Toast "Pengambilan dibatalkan"; kembali ke **daftar kiriman**; kiriman TIDAK hilang | | |
| TC-UC09-03 | Batal — titip paket | UC-08 sampai layar Opening → "Batal" | Toast "Penitipan dibatalkan"; kembali ke **pilih ukuran**; hitungan loker pulih (reservasi dilepas); tidak ada kiriman baru untuk penerima | | |

### TC-UC10 — Lihat Bantuan

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC10-01 | Overlay lengkap | Di layar mana pun tap "Butuh bantuan?" di footer | Overlay: Lokasi, Jam layanan, Telepon, Laporkan masalah, tombol "Tutup" | | |
| TC-UC10-02 | Tutup via tombol | Tap "Tutup" | Overlay hilang; layar di baliknya tidak berubah (sesi utuh) | | |
| TC-UC10-03 | Tutup via area luar | Buka lagi, tap area gelap di luar kartu | Overlay hilang | | |
| TC-UC10-04 | Navigasi menutup overlay | Buka overlay, lalu picu perpindahan layar (mis. countdown Done habis) | Overlay ikut tertutup, tidak "menempel" di layar baru | | |

### TC-UC11 — Kelola Data Staf & Loker (Admin)

Prototipe belum memiliki konsol admin (backlog B-03); pengelolaan data
dilakukan dengan menyunting `scripts/data.js`.

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-UC11-01 | Perubahan data seed terbaca | Tambah satu entri staf di `data.js`, muat ulang kiosk, cari nama tsb di alur kurir | Staf baru ditemukan di pencarian | | |
| TC-UC11-02 | Konsol admin | — | **N/A — future scope (B-03)**; dicatat di rekap sebagai belum diuji | | |

---

## 3. Pengujian lintas alur (cross-cutting)

Gunakan `/?idle=15` agar timeout menjadi 15 detik (peringatan muncul ±7,5
detik karena aturan "minimal separuh timeout").

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-CC-01 | Peringatan idle muncul | Login, diamkan tanpa sentuhan | Overlay "Masih di sana?" + hitung mundur + "Sentuh layar untuk melanjutkan sesi Anda." | | |
| TC-CC-02 | Sentuhan membatalkan reset | Saat overlay tampil, sentuh layar | Overlay hilang, sesi berlanjut di layar yang sama | | |
| TC-CC-03 | Reset ke Idle | Diamkan sampai hitung mundur habis | Kembali ke Idle; login ulang menunjukkan state bersih | | |
| TC-CC-04 | Loker terbengkalai dilepas | Alur kurir sampai layar Assign (reservasi aktif), diamkan sampai reset | Setelah reset, hitungan loker ukuran tsb pulih (delivering → available) | | |
| TC-CC-05 | Idle screen bebas timer | Diamkan layar Idle > timeout | Tidak terjadi apa-apa (checker berhenti di Idle) | | |
| TC-CC-06 | Kode bukti & durasi Done | Selesaikan satu deposit | Kode format `FST-` + 5 karakter (tanpa 0/O/1/I/L); caption "Kembali otomatis dalam 15 detik" menghitung mundur; alur self/klaim hanya 5 detik | | |
| TC-CC-07 | State bersih pasca Done | Setelah Done kembali ke Idle, tap "Staf Akademik" | Layar Tap Card menunggu tap baru; tidak ada sisa sesi sebelumnya | | |

---

## 4. Pengujian nonfungsional (prototipe)

| ID | Skenario | Langkah | Hasil yang diharapkan | Aktual | Status |
|---|---|---|---|---|---|
| TC-NF-01 | Skala 16:10 | Buka pada layar 10.5" 16:10 portrait (atau jendela dengan rasio sama) | Seluruh kanvas terlihat: header, footer, kedua CTA Idle — tanpa terpotong | | |
| TC-NF-02 | Ubah ukuran jendela | Ubah ukuran jendela browser saat app berjalan | Kanvas menyesuaikan skala secara mulus (fitKiosk) | | |
| TC-NF-03 | Scroll sentuh daftar staf | Di pencarian kurir, usap daftar dengan jari/drag | Daftar menggulir; halaman di belakangnya tidak ikut bergeser | | |
| TC-NF-04 | Scroll sentuh daftar kiriman | Sama pada daftar kiriman | Sama | | |
| TC-NF-05 | Jam header | Amati header selama ±2 menit | Tanggal/waktu lokal Indonesia berjalan benar | | |
| TC-NF-06 | Tanpa internet (font) | Putus koneksi, muat ulang | App tetap berfungsi penuh dengan font sistem (degradasi wajar, RUNBOOK §4) | | |

---

## 5. Regresi temuan analisis PRD (expected fail sampai diperbaiki)

Empat defect terdokumentasi di `docs/prd/` (tanda [TBC]). Kasus di bawah
**diharapkan GAGAL** hari ini; gunakan untuk memverifikasi perbaikannya.

| ID | Temuan | Verifikasi perbaikan | Status kini |
|---|---|---|---|
| TC-RG-01 | Idle menulis "48 unit · 3 ukuran" padahal inventori 24 loker | Aside Idle menampilkan angka yang konsisten dengan data | Expected fail |
| TC-RG-02 | Pesan deliver menjanjikan "Penerima akan dihubungi secara otomatis" padahal notifikasi belum ada (B-01) | Salinan tidak lagi menjanjikan notifikasi, ATAU B-01 terpasang | Expected fail |
| TC-RG-03 | Tidak ada state "kartu tidak dikenali" di Tap Card | Kartu tak dikenal memunculkan pesan error + tetap di Tap Card | Expected fail (belum bisa diuji tanpa hardware; siapkan untuk B-04) |
| TC-RG-04 | Kode bukti tidak disimpan (hanya ditampilkan) | Kode dapat dicocokkan ulang oleh sistem/log (lihat api-inventory §7) | Expected fail — mitigasi pilot: log kertas RUNBOOK §3.6 |

---

## 6. UAT per persona (skenario end-to-end)

Setiap skenario dinyatakan **lulus** bila penguji menyelesaikannya tanpa
bantuan moderator dan semua checkpoint terpenuhi. Sediakan kolom paraf.

### UAT-1 · Dosen — "Ambil kiriman saya"

Peran: dosen dengan kiriman menunggu (pengguna demo).

1. [ ] Menemukan dan menekan CTA staf di layar Idle
2. [ ] Autentikasi (simulasi tap) sampai Dashboard
3. [ ] Membaca jumlah kiriman baru dengan benar
4. [ ] Membuka daftar kiriman dan memilih item yang tepat
5. [ ] Menyelesaikan klaim sampai layar Done tanpa salah tekan
6. [ ] Kiriman hilang dari daftar setelah klaim

Paraf penguji: ______ · Waktu tempuh: ______ detik

### UAT-2 · Kurir — "Titipkan paket dan bawa bukti"

Peran: kurir membawa paket berlabel nama + gelar (mis. "Dr. Arini Hidayati").

1. [ ] Menemukan CTA kurir di Idle
2. [ ] Menemukan penerima meski mengetik tanpa gelar / dengan 1 typo
3. [ ] Memilih ukuran yang sesuai; memahami arti angka ketersediaan
4. [ ] Memahami peta loker (posisi loker target)
5. [ ] Menyelesaikan deposit sampai Done
6. [ ] Sempat memfoto Kode Bukti Titip sebelum layar kembali ke Idle (15 detik)

Paraf penguji: ______ · Waktu tempuh: ______ detik

### UAT-3 · Petugas Sekretariat — "Operasional harian"

Peran: petugas non-teknis, berbekal RUNBOOK bagian 3 (Bahasa Indonesia).

1. [ ] Pemeriksaan pagi §3.1: layar sambutan, jam benar, layar merespons
2. [ ] Simulasi pemulihan §3.2: matikan/nyalakan PC → kiosk kembali ke layar
       sambutan tanpa bantuan developer (autostart)
3. [ ] Menemukan informasi bantuan untuk pengguna yang bertanya
       (overlay "Butuh bantuan?")
4. [ ] Mengisi log kertas §3.6 untuk satu kejadian simulasi

Paraf penguji: ______

---

## 7. Rujukan pengujian perangkat keras

Tidak diduplikasi di sini. Saat integrasi B-04 dimulai, eksekusi checklist
di `docs/INTEGRATION-SPEC.md` §9:

| Kelompok | Isi | Lokasi |
|---|---|---|
| Bench test | unlock/ack, tap UID, debounce reed switch, reconnect bridge | INTEGRATION-SPEC §9 (5 butir) |
| End-to-end | B-04 AC1 (pintu tertutup mengakhiri countdown), B-04 AC2 (pintu dibiarkan terbuka → prompt + alert), deposit penuh, bridge mati → fallback simulasi, power-cycle | INTEGRATION-SPEC §9 (5 butir) |

---

## 8. Pelaporan hasil

Rekap diisi setelah satu putaran pengujian penuh; format ini dirancang agar
tabelnya bisa disalin ke bab pengujian laporan UAS.

| Kelompok | Jumlah kasus | Lulus | Gagal | Blokir/N-A |
|---|---|---|---|---|
| TC-UC01 – TC-UC11 (fungsional) | 47 | | | |
| TC-CC (lintas alur) | 7 | | | |
| TC-NF (nonfungsional) | 6 | | | |
| TC-RG (regresi temuan PRD) | 4 | | | (expected fail) |
| **Total** | **64** | | | |

Ketentuan:

- **Gagal** menyertakan ID kasus, tangkapan layar, dan langkah reproduksi;
  daftarkan sebagai kandidat backlog di `docs/BACKLOG.md`.
- **Blokir** dicatat dengan alasannya (mis. TC-UC06 paginasi menunggu data
  staf produksi; TC-RG-03 menunggu hardware).
- Putaran pengujian diulang penuh setelah setiap perubahan kode yang
  menyentuh alur (regresi manual — belum ada suite otomatis permanen).
