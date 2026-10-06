# Setup Google Sheet

1. Buat Google Sheet baru → **Extensions → Apps Script**.
2. Tempel isi `Code.gs`, simpan, jalankan fungsi `setup` sekali (izinkan akses). Muncul sheet `Log` dan `Rekap`.
3. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone**. Salin URL `/exec`.
4. Bangun ulang halaman: `python3 tools/build.py "https://script.google.com/macros/s/XXXX/exec"`
   (atau edit `SHEET_URL` di `index.html`).

Tiap level selesai = 1 baris di `Log` (waktu, nama, game, tema, level, bintang, hasil, detail). `Rekap` = total bintang per nama.
Hasil yang gagal terkirim diantrekan di browser dan dicoba ulang otomatis.

## Poin & peringkat
Tab `Rekap` = papan peringkat per orang, dihitung ulang otomatis setiap ada hasil masuk.
- 10 poin per bintang terbaik per game+level (`POIN_PER_BINTANG`)
- +5 bonus jika percobaan pertama langsung 3 bintang (`BONUS_SEKALI_JALAN`)
- -1 per percobaan ulang (`PENALTI_ULANG`)
- Urutan: total poin, lalu percobaan paling sedikit, lalu yang selesai paling awal.

Ubah aturan: edit konstanta di atas `Code.gs`, **Deploy > Manage deployments > pensil > New version > Deploy** (URL tetap), lalu jalankan `setup` untuk hitung ulang data lama.

## Banyak kelas, satu Sheet
Kelas ditentukan oleh link, tanpa edit kode: `.../Quiz/?kelas=A`, `?kelas=B`, `?kelas=C`, dst.
- Kode kelas: huruf/angka/spasi/`_`/`-`, otomatis huruf besar, maks 20 karakter. Tanpa `?kelas=` = kelas `-`.
- `Log` punya kolom **Kelas** (kolom J). Nama yang sama di kelas berbeda dihitung orang berbeda.
- Tab `Rekap` = peringkat gabungan (ada kolom Kelas). Tab `Rekap A`, `Rekap B`, ... dibuat otomatis untuk tiap kelas yang punya data.
- Data lama tanpa kelas masuk ke kelas `-` (hanya tampil di tab `Rekap` gabungan).
- Setelah menempel `Code.gs` baru: jalankan `setup` sekali (menambah header Kelas di sheet lama), lalu Deploy > Manage deployments > pensil > New version > Deploy.
