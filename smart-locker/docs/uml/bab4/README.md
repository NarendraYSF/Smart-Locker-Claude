# Diagram BAB IV — Sesuai Catatan Dosen

Set diagram yang mengikuti dua aturan dari notulensi dosen:

1. **Sinkronisasi 1:1** — jumlah activity diagram sama persis dengan jumlah
   use case pada use case diagram (11 use case = 11 activity diagram).
2. **Sequence per aktor makro** — satu sequence diagram per aktor utama
   (3 aktor = 3 sequence diagram), bukan per aktivitas kecil, dengan notasi
   panah UML baku: `->` permintaan sinkron (garis lurus, mata panah solid),
   `-->>` balikan data (garis putus-putus, mata panah terbuka).

Diagram lengkap versi teknis (termasuk aktor perangkat, state machine loker,
dan dua varian class diagram) tetap ada di folder induk `docs/uml/`.

## Pemetaan 1:1 Use Case ↔ Activity Diagram

| Use Case | Aktor | Activity Diagram |
| --- | --- | --- |
| UC-01 Autentikasi via RFID | Staf | `activity-uc01-autentikasi-rfid.puml` |
| UC-02 Lihat Dashboard Personal | Staf | `activity-uc02-lihat-dashboard.puml` |
| UC-03 Buka Loker Pribadi | Staf | `activity-uc03-buka-loker-pribadi.puml` |
| UC-04 Lihat Daftar Kiriman | Staf | `activity-uc04-lihat-daftar-kiriman.puml` |
| UC-05 Ambil Kiriman | Staf | `activity-uc05-ambil-kiriman.puml` |
| UC-06 Cari Penerima | Kurir | `activity-uc06-cari-penerima.puml` |
| UC-07 Pilih Ukuran Paket | Kurir | `activity-uc07-pilih-ukuran-paket.puml` |
| UC-08 Titipkan Paket | Kurir | `activity-uc08-titipkan-paket.puml` |
| UC-09 Batalkan Operasi | Staf & Kurir | `activity-uc09-batalkan-operasi.puml` |
| UC-10 Lihat Bantuan | Staf & Kurir | `activity-uc10-lihat-bantuan.puml` |
| UC-11 Kelola Data Staf & Loker | Admin | `activity-uc11-kelola-data.puml` |

Use case diagram sumber: `use-case.puml` (11 lingkaran use case — langkah
internal sistem seperti alokasi loker, deteksi pintu, kunci otomatis, dan
reset idle TIDAK dijadikan use case tersendiri; langkah itu muncul di dalam
activity diagram terkait).

## Sequence Diagram per Aktor

| Aktor | File | Cakupan makro |
| --- | --- | --- |
| Staf (Dosen / Tendik) | `sequence-staf.puml` | UC-01, UC-02, UC-03, UC-04, UC-05 |
| Tamu / Kurir | `sequence-kurir.puml` | UC-06, UC-07, UC-08 |
| Admin Sekretariat | `sequence-admin.puml` | UC-11 (kelola data + pantau status) |

Komponen pada lifeline: **Kiosk UI (Frontend)**, **DataRepository (Backend
Service)**, **Locker Hardware**, dan **Notification Service `<<planned>>`**
(khusus kurir). Konsol Admin pada `sequence-admin.puml` ditandai
`<<planned>>` karena masih backlog (B-03).

## Notasi panah (catatan dosen no. 4)

| Jenis pesan | Sintaks PlantUML | Render |
| --- | --- | --- |
| Permintaan sinkron | `A -> B : pesan` | garis lurus, mata panah tertutup/solid |
| Balikan data | `B -->> A : hasil` | garis putus-putus, mata panah terbuka |

Semua sequence diagram di folder ini sudah memakai `-->>` untuk seluruh
pesan balikan.

## Render

Sama seperti folder induk: ekstensi PlantUML (`Alt+D`), atau tempel ke
<https://www.plantuml.com/plantuml/uml/>, atau `plantuml -tpng *.puml`
bila Java + Graphviz sudah terpasang.
