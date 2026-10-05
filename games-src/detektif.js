/* ===================== Detektif Jaringan ===================== */
var CASES1 = [
  {ctx:'Pak Budi tidak bisa membuka aplikasi internal. Lampu link di kartu jaringan (NIC) komputernya mati.',
   opts:[{k:'a',t:'Instal ulang Windows',fb:'Terlalu jauh. Lampu link mati menunjuk ke kabel atau port, bukan sistem operasi.'},
         {k:'b',t:'Cek kabel LAN dan port switch'},
         {k:'c',t:'Ganti alamat DNS server',fb:'DNS baru relevan kalau koneksi fisiknya sudah hidup.'}],
   ans:'b', why:'Pengujian berlapis dimulai dari Physical layer: pastikan kabel dan port dulu (modul hal. 45).'},
  {ctx:'PC berhasil ping ke IP server, tetapi nama server tidak bisa dibuka di browser.',
   opts:[{k:'a',t:'Ganti kabel jaringan',fb:'Ping ke IP berhasil, jadi kabel sudah baik.'},
         {k:'b',t:'Cek pengaturan DNS di PC'},
         {k:'c',t:'Ubah subnet mask',fb:'Koneksi ke IP sudah jalan, jadi mask bukan penyebabnya.'}],
   ans:'b', why:'Koneksi sampai ke IP, tetapi penerjemahan nama gagal. Itu ciri masalah DNS.'},
  {ctx:'Sebuah PC tidak mendapat IP yang benar, padahal kabel terpasang. PC lain di ruangan itu normal.',
   opts:[{k:'a',t:'Periksa konfigurasi IP PC itu (apakah DHCP aktif)'},
         {k:'b',t:'Restart router kantor',fb:'PC lain normal, jadi masalahnya terlokalisasi di PC ini.'},
         {k:'c',t:'Ganti penyedia internet',fb:'Terlalu besar untuk masalah di satu PC.'}],
   ans:'a', why:'Tentukan letak masalah dulu. Karena hanya satu PC, periksa sisi klien (modul hal. 45).'},
  {ctx:'Seluruh pengguna di lantai 3 terputus. Lantai lain normal.',
   opts:[{k:'a',t:'Instal ulang semua PC di lantai 3',fb:'Banyak PC sekaligus bermasalah, penyebab bersama lebih mungkin.'},
         {k:'b',t:'Ganti password Wi-Fi',fb:'Tidak ada hubungannya dengan putusnya jaringan kabel satu lantai.'},
         {k:'c',t:'Cek switch lantai 3 dan jalur uplink-nya'}],
   ans:'c', why:'Satu lantai terdampak berarti penyebab bersama, misalnya switch atau uplink lantai itu.'},
  {ctx:'PC tidak bisa ping ke gateway. PC lain di segmen yang sama normal.',
   opts:[{k:'a',t:'Periksa IP, mask, dan gateway di PC itu'},
         {k:'b',t:'Beli bandwidth lebih besar',fb:'Ini bukan masalah kapasitas, karena PC lain normal.'},
         {k:'c',t:'Matikan semua switch',fb:'Justru memperluas dampak ke pengguna lain.'}],
   ans:'a', why:'Hanya satu PC yang gagal, jadi cek konfigurasi lokal sebelum menyentuh infrastruktur bersama.'}
];
var CASES2 = [
  {ctx:'Satu PC tidak bisa ke internet. PC lain di ruangan yang sama normal.',
   s1:{prompt:'Uji apa yang paling dulu dilakukan?',
       opts:[{k:'a',t:'Lihat konfigurasi IP, mask, dan gateway di PC itu (ipconfig)'},
             {k:'b',t:'Ganti router kantor',fb:'PC lain normal, router bukan tersangka utama.'},
             {k:'c',t:'Ganti semua kabel di ruangan',fb:'Terlalu luas untuk masalah yang hanya di satu PC.'}],
       ans:'a', why:'Periksa konfigurasi lokal dulu sebelum menguji ke luar.'},
   clue:'IP 192.168.10.25, mask 255.255.255.0, gateway 192.168.1.1. Router kantor memakai 192.168.10.1.',
   s2:{prompt:'Apa penyebab dan perbaikannya?',
       opts:[{k:'a',t:'Gateway tidak satu subnet dengan PC: ubah ke 192.168.10.1'},
             {k:'b',t:'Kabel rusak: ganti kabel',fb:'IP sudah terbaca, jadi koneksi fisik hidup.'},
             {k:'c',t:'DNS salah: ganti DNS',fb:'DNS tidak bisa menolong kalau gateway tidak terjangkau.'}],
       ans:'a', why:'Gateway harus berada di subnet yang sama dengan PC.'}},
  {ctx:'Beberapa PC di satu ruangan tidak mendapat IP otomatis. PC yang sudah menyala sejak pagi masih normal.',
   s1:{prompt:'Uji apa yang paling masuk akal?',
       opts:[{k:'a',t:'Cek status DHCP server dan jumlah alamat yang masih tersedia'},
             {k:'b',t:'Instal ulang PC yang gagal',fb:'Banyak PC gagal sekaligus, jadi penyebabnya bukan di tiap PC.'},
             {k:'c',t:'Ganti subnet mask semua PC',fb:'Mask bukan penyebab PC gagal mendapat IP.'}],
       ans:'a', why:'PC baru gagal, PC lama aman. Periksa layanan yang membagikan alamat.'},
   clue:'DHCP server aktif, tetapi seluruh 50 alamat di pool sudah terpakai.',
   s2:{prompt:'Apa tindakan yang tepat?',
       opts:[{k:'a',t:'Perbesar pool DHCP atau perpendek masa sewa (lease)'},
             {k:'b',t:'Matikan firewall',fb:'Tidak berkaitan dengan habisnya alamat.'},
             {k:'c',t:'Ganti semua kabel',fb:'Kabel tidak membuat alamat DHCP habis.'}],
       ans:'a', why:'Pool yang habis perlu diperbesar atau dikelola lebih efisien.'}},
  {ctx:'Internet kantor lambat setiap sore. Pagi hari normal.',
   s1:{prompt:'Apa yang dilakukan lebih dulu?',
       opts:[{k:'a',t:'Lihat grafik monitoring trafik (SNMP/MRTG) pada jam lambat'},
             {k:'b',t:'Restart semua PC',fb:'Tidak menjawab kenapa lambatnya hanya sore hari.'},
             {k:'c',t:'Langsung beli bandwidth lebih besar',fb:'Keputusan upgrade butuh data dulu.'}],
       ans:'a', why:'Monitoring memberi data trafik untuk menentukan penyebab (modul hal. 50-52).'},
   clue:'Utilisasi WAN mencapai sekitar 95% pada pukul 15.00 sampai 17.00.',
   s2:{prompt:'Tindakan yang paling tepat?',
       opts:[{k:'a',t:'Lakukan capacity planning dan pertimbangkan upgrade'},
             {k:'b',t:'Abaikan karena masih dalam batas normal',fb:'95% sudah mendekati penuh, itu tanda perlu tindakan.'},
             {k:'c',t:'Hapus log monitoring',fb:'Menghapus data justru menghilangkan bukti.'}],
       ans:'a', why:'Utilisasi yang mendekati penuh perlu perencanaan kapasitas.'}},
  {ctx:'Aplikasi web internal tiba-tiba tidak bisa diakses dari semua PC. Server dalam keadaan menyala.',
   s1:{prompt:'Uji apa yang paling dulu?',
       opts:[{k:'a',t:'Uji berlapis: ping IP server, lalu cek koneksi ke port layanan'},
             {k:'b',t:'Instal ulang browser di semua PC',fb:'Semua PC gagal, jadi bukan masalah browser.'},
             {k:'c',t:'Ganti server',fb:'Belum ada bukti server rusak.'}],
       ans:'a', why:'Uji dari bawah ke atas untuk mempersempit letak masalah.'},
   clue:'Ping ke IP server berhasil, tetapi koneksi ke port 443 timeout. Kemarin ada perubahan aturan firewall.',
   s2:{prompt:'Apa penyebab dan tindak lanjutnya?',
       opts:[{k:'a',t:'Aturan firewall untuk port 443 terblokir: perbaiki aturan, lalu catat perubahannya'},
             {k:'b',t:'Subnet mask semua PC salah',fb:'Ping berhasil, jadi pengalamatan IP sudah benar.'},
             {k:'c',t:'Kabel server rusak',fb:'Ping berhasil, jadi kabel baik.'}],
       ans:'a', why:'Ping jalan tetapi port tertutup mengarah ke aturan firewall.'}}
];
var ORD = [
  {ctx:'Switch lantai 3 mati, sekitar 40 pengguna terputus.',
   t:['Lihat dashboard monitoring: hanya segmen lantai 3 yang down','Periksa log dan lampu port uplink: uplink fiber tidak ada sinyal','Alihkan lantai 3 ke jalur cadangan agar jaringan lain tidak terdampak','Ganti modul SFP yang rusak dan kembalikan jalur utama','Catat penyebab, perbaikan, dan waktu pemulihan di log insiden']},
  {ctx:'Internet lambat setiap jam kerja.',
   t:['Lihat grafik monitoring: bandwidth WAN penuh pada jam tertentu','Telusuri sumber trafik: satu server backup mengirim data tiap jam 10','Batasi sementara trafik itu agar pengguna lain tidak terdampak','Jadwalkan ulang backup ke malam hari','Catat temuan dan perubahan jadwal untuk perencanaan kapasitas']},
  {ctx:'Divisi keuangan tidak bisa mencetak ke printer jaringan.',
   t:['Cek siapa yang terdampak: hanya VLAN keuangan','Periksa konfigurasi ACL: aturan baru memblokir segmen keuangan ke printer','Izinkan sementara akses ke printer untuk VLAN keuangan tanpa membuka segmen lain','Perbaiki ACL sesuai kebijakan segmentasi','Catat perubahan ACL dan penyebabnya']}
];
var LABELS = ['Tentukan letak masalah','Diagnosa','By-pass','Selesaikan','Dokumentasikan'];

GAME = {
  key:'detektif', title:'Detektif Jaringan', emoji:'🕵️',
  intro:'Cari penyebab masalah jaringan dengan langkah yang runtut, dari lokalisasi sampai dokumentasi.',
  levels:[['Mudah','3 kasus, pilih langkah pertama yang tepat'],['Sedang','3 kasus bertahap: uji dulu, lalu tentukan penyebab'],['Sulit','Urutkan 5 langkah analisis masalah pada 2 kasus']],
  foot:'Rujukan: Modul Sistem Jaringan Komputer hal. 45 dan hal. 55-56.',
  start:function(level){
    if (level === 1) {
      var qs = shuffle(CASES1).slice(0, 3).map(function(c){
        return {ctx:c.ctx, prompt:'Langkah pertama yang paling tepat?', opts:c.opts, ans:c.ans, why:c.why};
      });
      runQuiz({level:1, title:levelTitle(1), qs:qs,
        finish:function(score, total){
          var s = starsBy(score, 3, 2, 1); saveBest(1, s);
          showResult({level:1, stars:s, title:'Skor ' + score + ' dari ' + total, text: s === 3 ? 'Tajam. Selalu persempit letak masalah dulu.' : 'Bagus. Ingat: persempit dulu letak masalahnya.', stats:[]});
        }});
    } else if (level === 2) {
      var qs2 = [];
      shuffle(CASES2).slice(0, 3).forEach(function(c){
        qs2.push({ctx:c.ctx, prompt:c.s1.prompt, opts:c.s1.opts, ans:c.s1.ans, why:c.s1.why});
        qs2.push({ctx:c.ctx, clue:c.clue, cluelabel:'Hasil pengujian', prompt:c.s2.prompt, opts:c.s2.opts, ans:c.s2.ans, why:c.s2.why});
      });
      runQuiz({level:2, title:levelTitle(2), qs:qs2,
        finish:function(score, total){
          var s = starsBy(score, 5, 3, 1); saveBest(2, s);
          showResult({level:2, stars:s, title:'Skor ' + score + ' dari ' + total, text: s === 3 ? 'Tajam. Uji dulu, baru putuskan.' : 'Bagus. Ulangi dan baca hasil pengujiannya dengan teliti.', stats:[]});
        }});
    } else {
      var cases = shuffle(ORD).slice(0, 2), ci = 0, totalChecks = 0;
      (function nextCase(){
        var c = cases[ci];
        runOrder({level:3, title:levelTitle(3) + ' (' + (ci+1) + '/2)', items:c.t.map(function(t, i){ return {id:'s' + i, t:t}; }),
          labels:LABELS, reveal:true, feedback:'count',
          task:'<b>' + c.ctx + '</b> Urutkan 5 langkah analisis masalah dari yang paling awal, lalu tap Periksa.',
          onDone:function(r){
            totalChecks += r.checks; ci++;
            if (ci < cases.length) nextCase();
            else {
              var s = starsLow(totalChecks, 2, 4); saveBest(3, s);
              showResult({level:3, stars:s, title:'Dua kasus selesai!', text: s === 3 ? 'Tajam. Urutannya sudah jadi kebiasaan.' : 'Berhasil. Ulangi supaya sekali jalan.', stats:['Pemeriksaan: ' + totalChecks + 'x'],
                note:'Urutan mengikuti modul: tentukan letak masalah, diagnosa, by-pass, selesaikan, lalu dokumentasikan.'});
            }
          }});
      })();
    }
  }
};
showMenu();
