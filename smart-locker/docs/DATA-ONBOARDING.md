# Data Onboarding — Loker Pintar FST

> Prosedur mengganti 10 data staf fiktif (seed prototipe) dengan direktori
> asli dosen & tenaga kependidikan FST sebelum pilot.
>
> Audiens: **bagian 1–3** petugas Sekretariat (Bahasa Indonesia) ·
> **bagian 4** developer (English) · **bagian 5–6** keduanya.
>
> Berkas pendukung di `docs/ops/`: `staff-template.csv` (formulir kosong),
> `staff-example.csv` (contoh terisi), `csv-to-data.mjs` (konverter).

---

## 1. Ringkasan & pembagian peran

| Langkah | Siapa | Hasil |
|---|---|---|
| Isi formulir data staf | Sekretariat | `staff-template.csv` terisi lengkap kecuali kolom `rfid_uid` |
| Sesi pendataan kartu | Sekretariat + staf | Kolom `rfid_uid` terisi |
| Konversi & muat ke kiosk | Developer | `scripts/data.js` berisi data asli |
| Verifikasi bersama | Keduanya | Checklist bagian 5 lulus |

Perkiraan waktu: pengisian formulir 1–2 hari kerja (menunggu kelengkapan),
sesi kartu ±2 menit per orang, konversi & verifikasi ±30 menit.

---

## 2. Formulir pengumpulan data (Sekretariat)

Buka `docs/ops/staff-template.csv` di Excel (pemisah titik-koma `;` —
sesuai pengaturan Excel Indonesia). Satu baris per orang. Lihat
`staff-example.csv` untuk contoh terisi.

| Kolom | Aturan | Contoh |
|---|---|---|
| `nip` | Tepat 18 digit, tanpa spasi/titik. Tidak boleh kembar | `198203102009011012` |
| `nama_lengkap` | Nama resmi LENGKAP dengan gelar, ejaan persis — nama ini yang tampil di layar kiosk dan dicari kurir | `Dr. Arini Hidayati, M.Kom.` |
| `role` | Persis salah satu: `Dosen` atau `Tenaga Kependidikan` (huruf besar-kecil berpengaruh) | `Dosen` |
| `departemen` | Salah satu: Teknik Informatika, Sistem Informasi, Matematika, Fisika, Kimia, Biologi, Agribisnis, Sekretariat FST | `Fisika` |
| `rfid_uid` | KOSONGKAN dulu — diisi saat sesi pendataan kartu (bagian 3) | `04A1B2C3` |
| `loker_permanen` | `L-01` s.d. `L-24`, atau kosong bila orang tsb tidak mendapat loker tetap. Satu loker hanya untuk satu orang | `L-12` |

### Pembagian loker permanen vs pool kurir

Kabinet berisi **24 loker**: `L-01`–`L-03` besar (baris atas),
`L-04`–`L-09` sedang, `L-10`–`L-24` kecil. Setiap loker yang ditetapkan
sebagai loker permanen **mengurangi kapasitas penitipan kurir** untuk
ukuran tersebut. Saran untuk pilot:

- Sisakan **minimal 1 loker besar, 2 sedang, dan 5 kecil** untuk pool kurir.
- Artinya loker permanen maksimal ±16 orang; staf lain tetap bisa menerima
  kiriman (paket dititipkan ke loker pool mana pun), hanya tidak punya
  loker pribadi.
- Prioritaskan loker permanen untuk staf dengan volume dokumen/kiriman
  tertinggi.

### Catatan privasi

Berkas ini memuat NIP dan UID kartu identitas — **data pribadi**. Simpan
hanya di PC Sekretariat, jangan kirim lewat grup/WA publik, dan serahkan
ke developer secara langsung (flashdisk/drive internal). Setelah dimuat ke
kiosk, berkas kerja di luar PC Sekretariat dihapus. (Sejalan dengan catatan
keamanan `INTEGRATION-SPEC.md` §8: UID diperlakukan sebagai token opaque.)

---

## 3. Sesi pendataan kartu RFID (Sekretariat)

Tujuan: mengisi kolom `rfid_uid` dengan UID kartu identitas UIN milik
masing-masing staf.

1. Umumkan jadwal sesi (mis. dua slot pagi/siang selama 3 hari di
   Sekretariat) — cukup bawa kartu identitas, prosesnya ±2 menit.
2. Petugas membuka berkas CSV, staf menempelkan kartu ke reader.
3. Alat pembaca menampilkan UID — salin ke kolom `rfid_uid` pada baris
   orang tersebut. Format: huruf/angka heksadesimal tanpa titik dua atau
   spasi (contoh `04A1B2C3`, bukan `04:A1:B2:C3`).
4. Centang nama yang sudah terekam; kejar sisa staf yang belum hadir
   sebelum tenggat.

> **[Menunggu Q1]** Perintah/alat pembaca UID bergantung pada jawaban
> pertanyaan terbuka Q1 di `INTEGRATION-SPEC.md` §10 (teknologi kartu
> identitas UIN). Setelah reader dipilih, isi kotak ini dengan langkah
> pembacaannya (mis. aplikasi NFC Tools di ponsel Android untuk kartu
> Mifare, atau tool serial ESP32).

**Fase sebelum hardware terpasang:** kolom `rfid_uid` boleh dikosongkan —
kiosk tetap berjalan dengan simulasi tap. Data nama/NIP/loker sudah
berguna lebih dulu untuk pencarian kurir dan alokasi loker.

---

## 4. Conversion & loading (developer, English)

1. Receive the filled CSV from the Sekretariat (hand-carried, see privacy
   note above). Save it next to the converter, e.g.
   `docs/ops/staff-filled.csv` — **do not commit it to git**.
2. Run the converter (Node on PATH, from `docs/ops/`):

   ```powershell
   node csv-to-data.mjs staff-filled.csv
   ```

3. The script validates every row and either:
   - prints **all** problems with row numbers and exits non-zero
     (fix the CSV with the Sekretariat, run again), or
   - prints the generated `export const staff = [...]` block.

   Validations: NIP exactly 18 digits & unique; role exactly one of the
   two values; department on the known list (warning only); UID uppercase
   hex & unique or blank; locker `L-01`..`L-24` & unique or blank.
   `initials` are derived automatically (titles skipped).

4. Paste the generated block into `smart-locker/scripts/data.js`,
   replacing the existing `export const staff = [...]` array. Nothing else
   needs editing: the existing `seed()` function derives permanent-locker
   occupancy (`occupied` + `ownerNip`) from `lockerId` automatically.
5. Also update `incomingMail`: remove the fictional seed items (M-001 …
   M-004) or re-point them at real NIPs for demo purposes — fictional
   recipients would otherwise show unclaimable mail.
6. Reload the kiosk (Ctrl+R / restart per RUNBOOK) and run section 5.

Note: staff whose `rfid` is `null` cannot be matched by a real reader tap
(the prototype's simulated tap ignores UIDs, so nothing breaks today).
Collect the missing UIDs before hardware go-live.

---

## 5. Verifikasi pasca-muat (bersama)

- [ ] Jumlah staf pada pencarian kurir (query kosong) = jumlah baris CSV
- [ ] Uji 3 nama acak lewat pencarian: dengan gelar, tanpa gelar, dan
      dengan 1 salah ketik — semuanya ditemukan (TEST-PLAN TC-UC06)
- [ ] Peta loker (layar Assign kurir): semua loker permanen tampil
      "Terisi", pool kurir tampil "Tersedia", jumlahnya sesuai pembagian
      bagian 2
- [ ] Hitungan tile ukuran (layar pilih ukuran) = jumlah loker pool per
      ukuran
- [ ] Bila staf > 12: kasus paginasi "Tampilkan lebih banyak"
      (TEST-PLAN TC-UC06, sebelumnya Blokir — data) kini bisa dieksekusi
- [ ] Cadangkan CSV final di PC Sekretariat (sumber kebenaran data)

---

## 6. Keterbatasan yang perlu dipahami

- **Perubahan data = edit file + muat ulang.** Prototipe membaca
  `data.js` saat boot; staf baru/kartu hilang/pindah loker berarti
  mengulang bagian 4 (edit + reload, ±10 menit). Konsol admin untuk
  mengelola ini tanpa developer adalah backlog B-03.
- **Data hilang saat restart tetap berlaku** untuk titipan harian
  (RUNBOOK §4) — onboarding ini hanya mengisi data master, bukan
  mengubah sifat in-memory prototipe.
- CSV berisi data pribadi — perlakukan sesuai catatan privasi bagian 2.
