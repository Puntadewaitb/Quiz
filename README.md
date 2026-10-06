# Game Prakom (satu halaman)

`index.html` = 6 game dalam satu file. Alur: input nama → pilih game → main → tiap level selesai otomatis dikirim ke Google Sheet.

- Setup Sheet: lihat `tools/apps-script/README.md`, lalu `python3 tools/build.py "<URL web app>"`.
- Sumber game asli: `games/` (per game) dan `games-src/`. Edit lalu jalankan `tools/build.py` untuk membuat ulang `index.html`.
- Tanpa `SHEET_URL`, hasil tetap tersimpan di browser dan bisa diunduh sebagai CSV.

Kelas: bagikan link `?kelas=A`, `?kelas=B`, dst. Rekap per kelas otomatis di Google Sheet (lihat `tools/apps-script/README.md`).
