/* ===================== Urutan Pengadaan ===================== */
var STEPS = [
  {id:'p1', t:'Penetapan kebutuhan pengadaan'},
  {id:'p2', t:'Pembentukan tim pengadaan'},
  {id:'p3', t:'Penyusunan dokumen pengadaan'},
  {id:'p4', t:'Pengumuman pengadaan'},
  {id:'p5', t:'Evaluasi dan pemilihan penyedia'},
  {id:'p6', t:'Pelaksanaan kontrak'},
  {id:'p7', t:'Pengujian infrastruktur TI'},
  {id:'p8', t:'Pengiriman dan penyerahan'}
];
function stepList(){
  return '<ol>' + STEPS.map(function(s){ return '<li>' + esc(s.t) + '</li>'; }).join('') + '</ol>';
}
GAME = {
  key:'pengadaan', title:'Urutan Pengadaan', emoji:'📋',
  intro:'Susun tahapan pengadaan infrastruktur TI dari awal sampai serah terima.',
  levels:[['Mudah','4 tahap, langsung ada tanda benar atau salah'],['Sedang','8 tahap, sebagian posisi terkunci'],['Sulit','8 tahap tanpa petunjuk, waktu 90 detik']],
  foot:'Rujukan: Modul Manajemen Infrastruktur TI (Pusdiklat BPS, 2025), Bab B.',
  start:function(level){
    if (level === 1) {
      var four = [STEPS[0], STEPS[3], STEPS[5], STEPS[7]];
      runOrder({level:1, title:levelTitle(1), items:four, feedback:'live', g2:true,
        task:'Urutkan 4 tahap pengadaan dari yang paling awal. Tap kartu untuk memasangnya ke posisi berikutnya.',
        onDone:function(r){
          var s = starsLow(r.mistakes, 0, 2); saveBest(1, s);
          showResult({level:1, stars:s, title:'Urutan benar!', text: s === 3 ? 'Rapi. Tidak ada yang salah.' : 'Berhasil. Ulangi untuk tanpa salah.', stats:['Salah letak: ' + r.mistakes],
            extra:'<div class="reveal"><b>Delapan tahap lengkapnya</b>' + stepList() + '</div>'});
        }});
    } else if (level === 2) {
      var idx = shuffle([0,1,2,3,4,5,6,7]).slice(0, 3);
      runOrder({level:2, title:levelTitle(2), items:STEPS, locked:idx, feedback:'marks', g2:true,
        task:'Urutkan 8 tahap pengadaan. Tiga posisi sudah terkunci sebagai petunjuk. Tap Periksa kalau sudah penuh.',
        onDone:function(r){
          var s = starsLow(r.checks, 2, 4); saveBest(2, s);
          showResult({level:2, stars:s, title:'Urutan benar!', text: s === 3 ? 'Rapi. Alur pengadaan sudah lancar.' : 'Berhasil. Ulangi supaya lebih sedikit pemeriksaan.', stats:['Pemeriksaan: ' + r.checks + 'x']});
        }});
    } else {
      runOrder({level:3, title:levelTitle(3), items:STEPS, feedback:'count', g2:true, timer:90,
        task:'Urutkan 8 tahap pengadaan tanpa petunjuk sebelum waktu habis, lalu tap Periksa.',
        onDone:function(r){
          var s = starsBy(r.left, 45, 20, 1); saveBest(3, s);
          showResult({level:3, stars:s, title:'Urutan benar!', text: s === 3 ? 'Cepat dan tepat. Alur pengadaan sudah di luar kepala.' : 'Berhasil. Ulangi untuk lebih cepat.', stats:['Sisa waktu: ' + r.left + ' dtk', 'Pemeriksaan: ' + r.checks + 'x']});
        },
        onTimeout:function(r){
          showResult({level:3, stars:0, title:'Waktu habis', text:'Pelajari urutannya dulu, lalu coba lagi.', stats:['Pemeriksaan: ' + r.checks + 'x'],
            extra:'<div class="reveal"><b>Urutan yang benar</b>' + stepList() + '</div>'});
        }});
    }
  }
};
showMenu();
