/* ===================== Sortir OSI ===================== */
var LAYERS = [
  {id:'7', label:'Layer 7: Application',  short:'Layer 7', name:'7 Application'},
  {id:'6', label:'Layer 6: Presentation', short:'Layer 6', name:'6 Presentation'},
  {id:'5', label:'Layer 5: Session',      short:'Layer 5', name:'5 Session'},
  {id:'4', label:'Layer 4: Transport',    short:'Layer 4', name:'4 Transport'},
  {id:'3', label:'Layer 3: Network',      short:'Layer 3', name:'3 Network'},
  {id:'2', label:'Layer 2: Data Link',    short:'Layer 2', name:'2 Data Link'},
  {id:'1', label:'Layer 1: Physical',     short:'Layer 1', name:'1 Physical'}
];
var CARDPOOL = {
  '7': ['HTTP','DNS','SMTP','FTP'],
  '6': ['Enkripsi SSL/TLS','Format gambar JPEG','Pengkodean karakter UTF-8'],
  '5': ['Membuka, mengelola, dan menutup sesi komunikasi'],
  '4': ['TCP','UDP','Nomor port (80, 443)'],
  '3': ['Alamat IP','Router','Routing (memilih jalur)'],
  '2': ['Alamat MAC','Switch','Frame'],
  '1': ['Kabel UTP','Fiber optik','Bit 0 dan 1']
};
function makeCards(counts){
  var out = [], n = 0;
  LAYERS.forEach(function(L, i){
    shuffle(CARDPOOL[L.id]).slice(0, counts[i]).forEach(function(t){ out.push({id:'c' + (n++), t:t, bin:L.id}); });
  });
  return out;
}
var SCEN = [
  {t:'Kabel LAN pada sebuah PC terlepas dari port switch.', a:'1', why:'Media fisik (kabel) terputus, jadi bit tidak bisa dikirim. Itu masalah Physical layer.'},
  {t:'Switch meneruskan frame ke PC yang benar berdasarkan alamat tujuannya. Di layer mana ini terjadi?', a:'2', why:'Switch bekerja di Data Link layer dan memakai alamat MAC.'},
  {t:'PC diberi IP di subnet yang salah, sehingga tidak bisa menjangkau jaringan lain.', a:'3', why:'Pengalamatan IP dan jangkauan antar jaringan adalah urusan Network layer.'},
  {t:'Router tidak punya rute ke jaringan tujuan, sehingga paket dibuang.', a:'3', why:'Pemilihan rute (routing) dilakukan di Network layer.'},
  {t:'Firewall memblokir port 443, sehingga situs HTTPS tidak terbuka.', a:'4', why:'Nomor port adalah pengalamatan di Transport layer.'},
  {t:'Sebagian paket TCP hilang di jalan, lalu dikirim ulang otomatis.', a:'4', why:'Flow control dan error recovery dilakukan oleh Transport layer (TCP).'},
  {t:'Sertifikat TLS kedaluwarsa, sehingga enkripsi koneksi HTTPS gagal dibentuk.', a:'6', why:'Menurut modul, enkripsi dan dekripsi (SSL/TLS) ada di Presentation layer.'},
  {t:'Sesi komunikasi antar aplikasi terputus dan tidak bisa dibuka kembali.', a:'5', why:'Pembukaan, pengelolaan, dan penutupan sesi adalah tugas Session layer.'},
  {t:'Nama domain tidak bisa diterjemahkan ke alamat IP karena DNS server bermasalah.', a:'7', why:'Menurut modul, DNS termasuk protokol Application layer.'},
  {t:'Teks di halaman web tampil berantakan karena pengkodean karakter tidak cocok.', a:'6', why:'Format data dan pengkodean karakter (misalnya UTF-8) ada di Presentation layer.'},
  {t:'Data diubah menjadi bit-bit listrik atau cahaya yang berjalan di kabel.', a:'1', why:'Pengiriman bit mentah lewat media fisik adalah Physical layer.'},
  {t:'Paket data diberi header berisi IP sumber dan IP tujuan.', a:'3', why:'Alamat IP ditambahkan di Network layer saat proses encapsulation.'}
];

GAME = {
  key:'osi', title:'Sortir OSI', emoji:'🧱',
  intro:'Tempatkan protokol, perangkat, dan masalah jaringan ke layer OSI yang tepat.',
  levels:[['Mudah','7 kartu ke 7 layer, nama layer terlihat'],['Sedang','12 kartu, nama layer disembunyikan'],['Sulit','8 skenario, tebak layer yang bermasalah (ada timer)']],
  foot:'Rujukan: Modul Sistem Jaringan Komputer (Pusdiklat BPS, 2025), hal. 10-11.',
  start:function(level){
    if (level === 1) {
      runSorter({level:1, title:levelTitle(1), feedback:'live', bins:LAYERS, cards:makeCards([1,1,1,1,1,1,1]),
        task:'Tap kartu, lalu tap kotak layer yang tepat. Tap kartu di kotak untuk memindahkannya.',
        onDone:function(r){
          var s = starsLow(r.mistakes, 1, 4); saveBest(1, s);
          showResult({level:1, stars:s, title:'7 layer terisi!', text: s === 3 ? 'Rapi. Urutan OSI sudah hafal.' : 'Berhasil. Ulangi untuk lebih tepat.', stats:['Salah letak: ' + r.mistakes]});
        }});
    } else if (level === 2) {
      runSorter({level:2, title:levelTitle(2), feedback:'check', hideNames:true, bins:LAYERS, cards:makeCards([2,2,1,2,2,2,1]),
        task:'Nama layer disembunyikan. Tempatkan 12 kartu ke nomor layer yang tepat, lalu tap Periksa.',
        onDone:function(r){
          var s = starsLow(r.checks, 2, 4); saveBest(2, s);
          showResult({level:2, stars:s, title:'Semua kartu tepat!', text: s === 3 ? 'Rapi. Hafal sampai nomor layernya.' : 'Berhasil. Ulangi supaya lebih sekali jalan.', stats:['Pemeriksaan: ' + r.checks + 'x']});
        }});
    } else {
      var qs = shuffle(SCEN).slice(0, 8).map(function(s){
        return {prompt:s.t, opts:LAYERS.map(function(L){ return {k:L.id, t:L.name}; }), ans:s.a, why:s.why};
      });
      runQuiz({level:3, title:levelTitle(3), qs:qs, perQ:20, cols:2,
        finish:function(score, total){
          var s = starsBy(score, 7, 5, 3); saveBest(3, s);
          showResult({level:3, stars:s, title:'Skor ' + score + ' dari ' + total,
            text: s === 3 ? 'Hampir sempurna. Diagnosis per layer sudah tajam.' : (s >= 1 ? 'Bagus. Ulangi dan fokus pada layer 3, 4, dan 6.' : 'Ulangi dulu level 1 dan 2, lalu coba lagi.'), stats:[]});
        }});
    }
  }
};
showMenu();
