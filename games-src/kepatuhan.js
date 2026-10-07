/* ===================== Kepatuhan dan Kematangan ===================== */
var K3_PERQ = 30;   /* detik per soal di Level 3 */
/* Data soal disalin dari TAMBAH_GAME_MANTI_3_4.md. Hanya teks PENGECOH 6 soal bank yang diperpanjang agar jawaban benar tidak selalu opsi terpendek atau terpanjang. */
/* helper kuis: bentuk satu soal untuk runQuiz. Kunci opsi berupa huruf. */
function mkQ(ctx, prompt, optTexts, ansText, why, fixed){
  var texts = fixed ? optTexts.slice() : shuffle(optTexts);
  var opts = texts.map(function(t, i){ return {k:String.fromCharCode(97 + i), t:t}; });
  var hit = opts.filter(function(o){ return o.t === ansText; });
  if (hit.length !== 1) throw new Error('Jawaban tidak ditemukan tepat satu kali: ' + ansText);
  return {ctx:ctx, prompt:prompt, opts:opts, ans:hit[0].k, why:why};
}

var K3_KAT = [
  {id:'sangat', label:'Sangat patuh',                sub:'90-100%', short:'90-100%'},
  {id:'patuh',  label:'Patuh',                       sub:'75-89%',  short:'75-89%'},
  {id:'cukup',  label:'Cukup patuh',                 sub:'60-74%',  short:'60-74%'},
  {id:'tidak',  label:'Tidak patuh / risiko tinggi', sub:'<60%',    short:'<60%'}
];
function k3Kategori(p){ return p >= 90 ? 'sangat' : (p >= 75 ? 'patuh' : (p >= 60 ? 'cukup' : 'tidak')); }
function k3Nama(id){ return K3_KAT.filter(function(k){ return k.id === id; })[0].label; }

/* Level 1: kartu skor. Ambil 2 acak per kategori (8 kartu). Sengaja tanpa nilai batas (90, 75, 60). */
var K3_SKOR = {
  sangat:[91, 93, 96, 98],
  patuh: [77, 80, 82, 86],
  cukup: [62, 65, 68, 72],
  tidak: [41, 48, 52, 57]
};
function k3L1Cards(){
  var out = [], n = 0;
  Object.keys(K3_SKOR).forEach(function(kat){
    shuffle(K3_SKOR[kat]).slice(0, 2).forEach(function(v){ out.push({id:'c' + (n++), t:v + '%', bin:kat}); });
  });
  return out;
}

/* Level 2: dua ronde urutan. Susunan array = urutan benar. name dipakai hanya di layar "Urutan yang benar". */
var K3_MATURITY = [
  {id:'m1', t:'Proses belum terdokumentasi, ketergantungan tinggi pada individu, kontrol minim', name:'Level 1: Initial (Awal)'},
  {id:'m2', t:'Proses terdokumentasi dan konsisten, pengelolaan dasar dan pengendalian risiko mulai ada', name:'Level 2: Managed (Terorganisir)'},
  {id:'m3', t:'Proses formal dan menjadi standar organisasi', name:'Level 3: Defined (Terdefinisi)'},
  {id:'m4', t:'Pengukuran dan analisis data dilakukan secara rutin', name:'Level 4: Quantitatively Managed'},
  {id:'m5', t:'Perbaikan berkelanjutan dan inovasi proaktif', name:'Level 5: Optimizing'}
];
var K3_LANGKAH = [
  {id:'e1', t:'Pengumpulan data dan dokumen', name:'Langkah 1'},
  {id:'e2', t:'Penilaian tingkat kematangan', name:'Langkah 2'},
  {id:'e3', t:'Menilai kepatuhan terhadap standar dan regulasi', name:'Langkah 3'},
  {id:'e4', t:'Analisis dan pelaporan hasil', name:'Langkah 4'}
];

/* Level 3: bank soal. a = jawaban benar, o = opsi khusus (bila tidak ada, pakai K3_OPTS), w = penjelasan. */
var K3_OPTS = {
  level:['Initial (Awal)', 'Managed (Terorganisir)', 'Defined (Terdefinisi)', 'Quantitatively Managed', 'Optimizing'],
  langkah:['Pengumpulan data dan dokumen', 'Penilaian tingkat kematangan', 'Menilai kepatuhan terhadap standar dan regulasi', 'Analisis dan pelaporan hasil']
};
var K3_FIXED = {level:true, langkah:true};
var K3_ASK = {level:'Tingkat kematangan yang paling sesuai?', langkah:'Termasuk langkah evaluasi yang mana?'};
var K3_BANK = {
  level:[
    {p:'Pengelolaan server hanya berjalan karena satu admin yang hafal caranya. Tidak ada dokumen prosedur dan kontrol minim.', a:'Initial (Awal)', w:'Ciri Initial: proses belum terdokumentasi, bergantung pada individu, kontrol minim.'},
    {p:'Prosedur backup sudah terdokumentasi dan dijalankan konsisten, dan pengendalian risiko dasar mulai ada.', a:'Managed (Terorganisir)', w:'Ciri Managed: proses terdokumentasi dan konsisten, pengelolaan dasar dan pengendalian risiko mulai ada.'},
    {p:'Seluruh unit mengikuti prosedur formal yang sudah menjadi standar organisasi.', a:'Defined (Terdefinisi)', w:'Ciri Defined: proses formal dan menjadi standar organisasi.'},
    {p:'Waktu pemulihan layanan dan kapasitas server diukur dan dianalisis secara rutin.', a:'Quantitatively Managed', w:'Ciri Quantitatively Managed: pengukuran dan analisis data dilakukan rutin.'},
    {p:'Hasil evaluasi dipakai terus-menerus untuk perbaikan dan inovasi proaktif.', a:'Optimizing', w:'Ciri Optimizing: perbaikan berkelanjutan dan inovasi proaktif.'}
  ],
  langkah:[
    {p:'Tim mengumpulkan data dan dokumen pendukung dari unit yang diperiksa.', a:'Pengumpulan data dan dokumen', w:'Ini langkah 1 evaluasi hasil pemeriksaan kepatuhan.'},
    {p:'Tim menilai proses TI memakai model tingkat kematangan.', a:'Penilaian tingkat kematangan', w:'Ini langkah 2: penilaian tingkat kematangan.'},
    {p:'Tim membandingkan kondisi unit dengan ISO 27001 dan ketentuan pemerintah.', a:'Menilai kepatuhan terhadap standar dan regulasi', w:'Ini langkah 3: menilai kepatuhan terhadap standar dan regulasi.'},
    {p:'Tim menganalisis hasil penilaian, lalu menyusun laporan beserta rekomendasi peningkatan.', a:'Analisis dan pelaporan hasil', w:'Ini langkah 4. Output evaluasi berupa gambaran kondisi tata kelola TI dan rekomendasi peningkatan.'}
  ],
  kasus:[
    {p:'Sebuah unit kerja memperoleh skor kepatuhan 82% dengan satu temuan minor: dokumentasi SOP incident response belum lengkap. Kategori dan rekomendasi yang tepat?',
     a:'Patuh; lengkapi dokumentasi SOP sebelum audit berikutnya',
     o:['Patuh; lengkapi dokumentasi SOP sebelum audit berikutnya', 'Sangat patuh; tidak perlu tindakan apa pun pada audit berikutnya', 'Cukup patuh; ganti seluruh perangkat server lalu audit ulang', 'Tidak patuh; hentikan operasional unit sampai audit ulang'],
     w:'Skor 82% masuk kategori Patuh (75-89%). Temuan minornya ditindaklanjuti dengan melengkapi dokumentasi SOP sebelum audit berikutnya.'},
    {p:'Pada studi kasus audit kepatuhan berbasis COBIT, checklist mencakup aspek apa saja?',
     a:'Kontrol akses, backup data, dan incident response',
     o:['Kontrol akses, backup data, dan incident response', 'Harga perangkat, jumlah pegawai, dan luas gedung', 'Jumlah aplikasi, jumlah vendor, dan jumlah proyek', 'Kecepatan internet, jumlah printer, dan jadwal rapat'],
     w:'Checklist studi kasus mencakup kontrol akses, backup data, dan incident response.'}
  ],
  reviu:[
    {p:'Mana yang BUKAN bagian dari proses reviu kebijakan infrastruktur TI?', a:'Membeli perangkat baru untuk setiap unit',
     o:['Membeli perangkat baru untuk setiap unit', 'Menilai keselarasan kebijakan dengan strategi organisasi', 'Mengevaluasi roadmap dan program TI', 'Mengidentifikasi isu, duplikasi, atau kebutuhan revisi'],
     w:'Reviu menilai keselarasan dengan strategi, mengevaluasi roadmap dan program TI, serta mengidentifikasi isu, duplikasi, atau kebutuhan revisi. Pembelian perangkat bukan bagiannya.'},
    {p:'Siapa yang dilibatkan untuk mengesahkan perubahan kebijakan hasil reviu?', a:'Komite TI',
     o:['Komite TI', 'Vendor perangkat', 'Seluruh pengguna akhir', 'Penyedia internet'],
     w:'Reviu melibatkan komite TI untuk pengesahan perubahan.'},
    {p:'Kapan reviu kebijakan infrastruktur TI dilakukan?', a:'Secara berkala agar kebijakan tetap up-to-date',
     o:['Secara berkala agar kebijakan tetap up-to-date', 'Hanya saat terjadi insiden besar di unit', 'Hanya sekali, yaitu saat kebijakan pertama dibuat', 'Hanya saat terjadi pergantian vendor layanan'],
     w:'Reviu dilakukan secara berkala agar kebijakan tetap up-to-date, efisien, dan mendukung transformasi digital.'}
  ],
  renstra:[
    {p:'Analisis apa yang dipakai untuk mengetahui kekuatan dan kelemahan pada evaluasi perencanaan strategis TI?', a:'Analisis SWOT',
     o:['Analisis SWOT', 'Analisis log akses', 'Analisis bandwidth', 'Analisis harga pasar'],
     w:'Evaluasi kebijakan dan perencanaan strategis TI memakai analisis SWOT untuk melihat kekuatan dan kelemahan.'},
    {p:'Framework apa yang dipakai menilai kesiapan infrastruktur dan tata kelola pada evaluasi kebijakan dan perencanaan strategis TI?', a:'COBIT',
     o:['COBIT', 'Scrum', 'Kanban', 'Model OSI'],
     w:'Kesiapan infrastruktur dan tata kelola dinilai berdasarkan framework COBIT.'},
    {p:'Mana yang termasuk fokus evaluasi kebijakan dan perencanaan strategis TI?', a:'Pencapaian kinerja terkait IT Masterplan',
     o:['Pencapaian kinerja terkait IT Masterplan', 'Jumlah kabel yang terpasang di seluruh gedung kantor', 'Daftar harga lisensi software dari tiap vendor', 'Jadwal piket pegawai di tiap unit kerja'],
     w:'Fokusnya: kesiapan infrastruktur dan tata kelola (COBIT), pencapaian kinerja IT Masterplan, analisis SWOT, dan kepuasan pengguna TI.'},
    {p:'Penilaian apa yang termasuk fokus evaluasi kebijakan dan perencanaan strategis TI?', a:'Penilaian kepuasan pengguna TI',
     o:['Penilaian kepuasan pengguna TI', 'Penilaian harga pasar perangkat', 'Penilaian tampilan logo aplikasi', 'Penilaian jumlah rapat internal'],
     w:'Penilaian kepuasan pengguna TI termasuk fokus evaluasi, selain COBIT, IT Masterplan, dan analisis SWOT.'}
  ],
  kerangka:[
    {p:'Evaluasi kepatuhan biasanya memakai framework apa untuk mengukur kapabilitas proses dan efektivitas kontrol?', a:'COBIT 5/2019 atau ITIL',
     o:['COBIT 5/2019 atau ITIL', 'Scrum, Kanban, atau Agile', 'Model OSI atau TCP/IP', 'HTML, CSS, atau JavaScript'],
     w:'Evaluasi biasanya memakai COBIT 5/2019 atau ITIL.'},
    {p:'Evaluasi kepatuhan memastikan sistem dan proses TI memenuhi kebijakan internal serta regulasi seperti apa?', a:'ISO 27001 atau ketentuan pemerintah',
     o:['ISO 27001 atau ketentuan pemerintah', 'Selera pimpinan masing-masing unit kerja', 'Tren media sosial yang sedang populer', 'Harga pasar perangkat'],
     w:'Regulasi yang dirujuk antara lain ISO 27001 atau ketentuan pemerintah.'},
    {p:'Pemeriksaan kepatuhan infrastruktur TI adalah proses audit untuk memastikan aspek TI sesuai dengan apa?', a:'Kebijakan internal serta regulasi eksternal yang berlaku',
     o:['Kebijakan internal serta regulasi eksternal yang berlaku', 'Preferensi vendor perangkat dan penyedia layanan, serta tren pasar', 'Jumlah pegawai di unit beserta struktur jabatannya', 'Anggaran tahun sebelumnya beserta realisasi belanja'],
     w:'Pemeriksaan kepatuhan memastikan seluruh aspek TI sesuai kebijakan internal dan regulasi eksternal yang berlaku.'}
  ]
};

/* Soal hitung skor: dibangkitkan, bukan dari bank. n kontrol dipilih dari {10,20,25,50} supaya persen selalu bilangan bulat. */
function k3SkorQ(kat){
  var combos = [];
  [10, 20, 25, 50].forEach(function(n){
    for (var m = 0; m <= n; m++) { var pct = m * (100 / n); if (k3Kategori(pct) === kat) combos.push({n:n, m:m, pct:pct}); }
  });
  var c = pick(combos);
  var names = K3_KAT.map(function(k){ return k.label; });
  var range = K3_KAT.filter(function(k){ return k.id === kat; })[0].sub;
  return mkQ('Sebuah unit kerja memenuhi ' + c.m + ' dari ' + c.n + ' kontrol pada checklist kepatuhan berbasis COBIT.',
    'Skor kepatuhannya termasuk kategori apa?', names, k3Nama(kat),
    c.m + ' / ' + c.n + ' x 100% = ' + c.pct + '%, masuk kategori ' + k3Nama(kat) + ' (' + range + ').', true);
}
function k3Bank(fam){
  var e = pick(K3_BANK[fam]);
  var opts = e.o || K3_OPTS[fam];
  var fixed = !!K3_FIXED[fam];
  return K3_ASK[fam] ? mkQ(e.p, K3_ASK[fam], opts, e.a, e.w, fixed) : mkQ(null, e.p, opts, e.a, e.w, fixed);
}
/* 8 soal: 2 hitung skor (kategori berbeda) + 1 dari tiap keluarga lain. */
function k3BuildL3(){
  var cats = shuffle(['sangat', 'patuh', 'cukup', 'tidak']).slice(0, 2);
  var qs = cats.map(k3SkorQ);
  ['level', 'langkah', 'kasus', 'reviu', 'renstra', 'kerangka'].forEach(function(f){ qs.push(k3Bank(f)); });
  return shuffle(qs);
}


GAME = {
  key:'kepatuhan', title:'Kepatuhan dan Kematangan', emoji:'✅',
  intro:'Nilai skor kepatuhan, urutkan tingkat kematangan, dan baca kasus audit kepatuhan infrastruktur TI.',
  levels:[['Mudah','Cocokkan 8 skor ke 4 kategori kepatuhan, langsung ada tanda benar atau salah'],
          ['Sedang','Urutkan 5 tingkat kematangan dan 4 langkah evaluasi'],
          ['Sulit','8 soal acak: hitung skor, baca kasus, reviu dan evaluasi kebijakan (' + K3_PERQ + ' detik per soal)']],
  foot:'Rujukan: Slide Manajemen Infrastruktur TI hal. 63-70.',
  start:function(level){
    if (level === 1) {
      runSorter({level:1, title:levelTitle(1), feedback:'live', bins:K3_KAT, cards:k3L1Cards(),
        task:'Tap skor, lalu tap kategori kepatuhan yang tepat. Tap kartu di kotak untuk memindahkannya.',
        onDone:function(r){
          var s = starsLow(r.mistakes, 1, 4); saveBest(1, s);
          showResult({level:1, stars:s, title:'Semua skor tepat!', text: s === 3 ? 'Rapi. Kategori kepatuhan sudah hafal.' : 'Berhasil. Ulangi untuk lebih tepat.', stats:['Salah letak: ' + r.mistakes]});
        }});
    } else if (level === 2) {
      var checks = 0;
      var round2 = function(){
        runOrder({level:2, title:levelTitle(2) + ' (2/2)', items:K3_LANGKAH.map(function(x){ return {id:x.id, t:x.t}; }),
          labels:K3_LANGKAH.map(function(x){ return x.name; }), showLabels:false, feedback:'marks', reveal:true,
          task:'Urutkan 4 langkah evaluasi hasil pemeriksaan kepatuhan dari yang paling awal, lalu tap Periksa.',
          onDone:function(r){
            checks += r.checks;
            var s = starsLow(checks, 2, 4); saveBest(2, s);
            showResult({level:2, stars:s, title:'Dua urutan benar!', text: s === 3 ? 'Rapi. Level kematangan dan langkah evaluasi sudah lancar.' : 'Berhasil. Ulangi supaya sekali jalan.', stats:['Pemeriksaan: ' + checks + 'x']});
          }});
      };
      runOrder({level:2, title:levelTitle(2) + ' (1/2)', items:K3_MATURITY.map(function(x){ return {id:x.id, t:x.t}; }),
        labels:K3_MATURITY.map(function(x){ return x.name; }), showLabels:false, feedback:'marks', reveal:true,
        task:'Urutkan ciri-ciri ini dari tingkat kematangan paling rendah (Level 1) sampai paling tinggi (Level 5), lalu tap Periksa.',
        onDone:function(r){ checks = r.checks; round2(); }});
    } else {
      runQuiz({level:3, title:levelTitle(3), qs:k3BuildL3(), perQ:K3_PERQ,
        finish:function(score, total){
          var s = starsBy(score, 7, 5, 3); saveBest(3, s);
          showResult({level:3, stars:s, title:'Skor ' + score + ' dari ' + total,
            text: s === 3 ? 'Hampir sempurna. Kategori, level, dan kasus kepatuhan sudah tajam.' : (s >= 1 ? 'Bagus. Ulangi dan hafalkan rentang kategori serta ciri tiap level.' : 'Ulangi dulu Level 1 dan 2, lalu coba lagi.'),
            stats:[], note:'Soal hitung skor memakai asumsi sederhana: skor = kontrol terpenuhi dibagi total kontrol x 100%.'});
        }});
    }
  }
};
showMenu();
