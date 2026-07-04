# Cara Cetak `laporan-uts.html` ke PDF (paginasi presisi)

Masalah: `Ctrl + P` di Chrome **tidak deterministik** — paginasi bisa bergeser
karena dialog print, font system, atau preferensi user. Akibatnya nomor
halaman di **Daftar Isi** bisa tidak cocok.

Solusi: pakai **Chrome Headless** atau **Puppeteer** dari command line.
Hasilnya 100% sama setiap kali dijalankan.

---

## Opsi 1 — Chrome Headless (paling cepat, tanpa install)

```powershell
cd smart-locker\docs
./print-to-pdf.ps1
```

Output: `laporan-uts.pdf` di folder yang sama.

> Catatan: script tunggu `--virtual-time-budget=20000` (20 detik) supaya diagram
> PlantUML yang di-fetch dari `plantuml.com` sempat terload. Jika koneksi lambat,
> naikkan angkanya di dalam script.

---

## Opsi 2 — Puppeteer (paling reliable — direkomendasikan)

Berbeda dengan Opsi 1, script ini **secara eksplisit menunggu setiap gambar
diagram PlantUML selesai dimuat** sebelum mencetak. Jadi tidak ada risiko
halaman bergeser karena diagram yang masih kosong saat print.

Sekali setup:

```powershell
cd smart-locker\docs
npm init -y
npm install puppeteer
```

Jalankan setiap kali ingin cetak ulang:

```powershell
node print-to-pdf.mjs
```

Output: `laporan-uts.pdf` di folder yang sama.

---

## Kenapa hasilnya akurat sesuai TOC?

1. Ukuran kertas, margin, dan media print sudah dikunci di CSS via `@page`
   (3 cm atas/kanan/bawah, 4 cm kiri).
2. Script Puppeteer pakai flag `preferCSSPageSize: true` dan `margin: 0` —
   artinya tidak ada margin tambahan dari engine print.
3. Background CSS (warna visualisasi baru, tabel, dll) ikut tercetak karena
   `printBackground: true`.
4. Pagination TIDAK terpengaruh dialog print user, scaling, atau header/footer
   browser default.

## Tips

- Kalau ada perubahan teks/gambar di HTML, jalankan ulang script.
- Untuk reproducibility maksimum, **jangan** pakai Ctrl+P sama sekali —
  selalu lewat script.
- Nomor halaman di Daftar Isi (`<span class="pg">…</span>`) saat ini hard-coded.
  Jika ada penambahan/penghapusan konten yang menggeser layout, update angka
  di Daftar Isi secara manual mengikuti hasil PDF yang baru.
