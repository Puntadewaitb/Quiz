# Game Prakom (satu halaman)

`index.html` = 6 game dalam satu file. Alur: input nama → pilih game → main → tiap level selesai otomatis dikirim ke Google Sheet.

- Setup Sheet: lihat `tools/apps-script/README.md`, lalu `python3 tools/build.py "<URL web app>"`.
- Sumber game asli: `games/` (per game) dan `games-src/`. Edit lalu jalankan `tools/build.py` untuk membuat ulang `index.html`.
- Tanpa `SHEET_URL`, hasil tetap tersimpan di browser dan bisa diunduh sebagai CSV.

Kelas: bagikan link `?kelas=A`, `?kelas=B`, dst. Rekap per kelas otomatis di Google Sheet (lihat `tools/apps-script/README.md`).

Papan Peringkat (Top 5 per kelas) ada di aplikasi; halaman admin di `/admin/` memakai token dari `buatTokenAdmin` (lihat `tools/apps-script/README.md`).

## Game Man TI (urutan menu mengikuti halaman slide)
Komponen dan Cloud (hal. 5-19) > Sortir Lifecycle (20-21) > Urutan Pengadaan (32-33) > Kepatuhan dan Kematangan (63-70).
Sumber: `games-src/komponencloud.js` dan `games-src/kepatuhan.js`. Alur kerja: ubah `games-src/`, jalankan `python3 tools/build_games.py`, lalu `python3 tools/build.py "<URL web app>"`.
Uji data: `node tools/test_manti.js` (struktur soal, 2000x pembangkitan, nilai batas skor). Audit panjang opsi: `node tools/audit_options.js`.
