/* ===================== Sortir Lifecycle ===================== */
var PH = [
  {id:'plan',   label:'Pengadaan', sub:'Plan + Procure', short:'Pengadaan'},
  {id:'deploy', label:'Penyebaran', sub:'Deploy', short:'Penyebaran'},
  {id:'use',    label:'Penggunaan', sub:'Use', short:'Penggunaan'},
  {id:'maint',  label:'Pemeliharaan', sub:'Maintain', short:'Pemeliharaan'},
  {id:'decom',  label:'Penonaktifan', sub:'Decommission', short:'Penonaktifan'},
  {id:'reuse',  label:'Pakai ulang atau nilai sisa', sub:'Reuse / Salvage', short:'Reuse / Salvage'}
];
var C = {
  kak:   {t:'Menetapkan kebutuhan dan menyusun KAK', bin:'plan'},
  beli:  {t:'Membeli perangkat dari penyedia terpilih', bin:'plan'},
  terima:{t:'Penerima memastikan barang benar-benar diterima', bin:'plan'},
  pasang:{t:'Memasang dan mengonfigurasi perangkat di lokasi', bin:'deploy'},
  catat: {t:'Mencatat lokasi, penanggung jawab, vendor, dan garansi aset', bin:'deploy'},
  pantau:{t:'Memantau tingkat pemakaian aset', bin:'use'},
  pindah:{t:'Memindahkan aset yang jarang dipakai ke unit yang lebih membutuhkan', bin:'use'},
  update:{t:'Memperbarui perangkat lunak dan mengubah konfigurasinya', bin:'maint'},
  tambah:{t:'Menambah komponen, misalnya memori', bin:'maint'},
  off:   {t:'Menyatakan perangkat tidak lagi digunakan', bin:'decom'},
  pakai: {t:'Perangkat nonaktif dipakai ulang oleh unit lain', bin:'reuse'},
  sisa:  {t:'Mencatat nilai sisa perangkat sampai pemanfaatannya selesai', bin:'reuse'}
};
function cardsOf(keys){ return keys.map(function(k){ return {id:k, t:C[k].t, bin:C[k].bin}; }); }

var SC = [
  {t:'Penerima mengecek barang yang datang sesuai pesanan, lalu sistem memberi sinyal ke bagian pembayaran.', a:'plan', why:'Konfirmasi penerimaan dan pembayaran terjadi di tahap pengadaan (modul hal. 16).'},
  {t:'Server baru dicatat lokasi rak, penanggung jawab, dan masa garansinya.', a:'deploy', why:'Data lokasi, penanggung jawab, konfigurasi, vendor, dan garansi diperbarui pada fase penyebaran.'},
  {t:'Server mahal yang jarang dipakai dipindahkan ke unit yang lebih membutuhkan.', a:'use', why:'Fase penggunaan tidak statis: data pemakaian dipakai untuk mengoptimalkan pemanfaatan aset.'},
  {t:'Setelah pembaruan perangkat lunak, data konfigurasi di sistem manajemen aset ikut diperbarui.', a:'maint', why:'Peningkatan atau perubahan aset (misalnya pembaruan software) masuk Maintain, dan informasi konfigurasinya harus diperbarui.'},
  {t:'Memori server ditambah supaya kinerjanya meningkat.', a:'maint', why:'Penambahan komponen adalah peningkatan aset, jadi termasuk Maintain.'},
  {t:'Laptop lama sudah tidak dipakai, tetapi unit lain masih mau memakainya.', a:'reuse', why:'Aset yang dinonaktifkan kadang masih bisa dimanfaatkan kembali (reuse).'},
  {t:'Perangkat nonaktif tidak bisa dipakai lagi, tetapi masih punya nilai sisa yang harus dicatat.', a:'reuse', why:'Bila tidak bisa dipakai ulang, nilai sisanya (salvage) dicatat dan dikelola sampai pemanfaatannya selesai.'},
  {t:'Perangkat dinyatakan tidak lagi digunakan dan dikeluarkan dari operasional.', a:'decom', why:'Saat aset tidak lagi digunakan, ia memasuki fase penonaktifan.'},
  {t:'Perangkat lunak operasional memperbarui tingkat pemakaian aset secara berkala.', a:'use', why:'Memantau pemakaian terjadi selama fase penggunaan.'},
  {t:'Menyusun KAK dan HPS sebelum perangkat dibeli.', a:'plan', why:'Perencanaan kebutuhan dan penyusunan dokumen adalah bagian Plan + Procure.'}
];

GAME = {
  key:'lifecycle', title:'Sortir Lifecycle', emoji:'♻️',
  intro:'Tempatkan kegiatan ke fase siklus hidup infrastruktur TI yang tepat.',
  levels:[['Mudah','8 kegiatan ke 5 fase, langsung ada tanda benar atau salah'],['Sedang','12 kegiatan ke 6 fase, periksa di akhir'],['Sulit','8 kasus abu-abu, pilih fase yang paling tepat']],
  foot:'Rujukan: Modul Manajemen Infrastruktur TI hal. 16-17 dan diagram lifecycle di slide.',
  start:function(level){
    if (level === 1) {
      runSorter({level:1, title:levelTitle(1), feedback:'live', bins:PH.slice(0,5),
        cards:cardsOf(['kak','beli','pasang','catat','pantau','update','tambah','off']),
        task:'Tap kegiatan, lalu tap fase yang tepat. Tap kartu di kotak untuk memindahkannya.',
        onDone:function(r){
          var s = starsLow(r.mistakes, 1, 4); saveBest(1, s);
          showResult({level:1, stars:s, title:'Semua tepat!', text: s === 3 ? 'Rapi. Alur lifecycle sudah jelas.' : 'Berhasil. Ulangi untuk lebih tepat.', stats:['Salah letak: ' + r.mistakes]});
        }});
    } else if (level === 2) {
      runSorter({level:2, title:levelTitle(2), feedback:'check', bins:PH, cards:cardsOf(Object.keys(C)),
        task:'Tempatkan 12 kegiatan ke 6 fase, lalu tap Periksa.',
        onDone:function(r){
          var s = starsLow(r.checks, 2, 4); saveBest(2, s);
          showResult({level:2, stars:s, title:'Semua kegiatan tepat!', text: s === 3 ? 'Rapi. Termasuk reuse dan salvage.' : 'Berhasil. Ulangi supaya lebih sekali jalan.', stats:['Pemeriksaan: ' + r.checks + 'x']});
        }});
    } else {
      var qs = shuffle(SC).slice(0, 8).map(function(s){
        return {prompt:s.t, ctx:'Fase mana yang paling tepat?', opts:PH.map(function(p){ return {k:p.id, t:p.label + ' (' + p.sub + ')'}; }), ans:s.a, why:s.why};
      });
      runQuiz({level:3, title:levelTitle(3), qs:qs,
        finish:function(score, total){
          var s = starsBy(score, 7, 5, 3); saveBest(3, s);
          showResult({level:3, stars:s, title:'Skor ' + score + ' dari ' + total,
            text: s === 3 ? 'Hampir sempurna. Kasus abu-abu pun bisa dibaca.' : 'Bagus. Perhatikan beda Use, Maintain, dan Reuse atau Salvage.', stats:[],
            note:'Pengelompokan Maintain, Reuse, dan Salvage mengikuti diagram lifecycle di slide.'});
        }});
    }
  }
};
showMenu();
