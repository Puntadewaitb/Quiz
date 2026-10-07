/* ===================== Komponen dan Cloud ===================== */
var K4_PERQ = 25;   /* detik per soal di Level 3 */
/* Data soal disalin dari TAMBAH_GAME_MANTI_3_4.md. */
/* helper kuis: bentuk satu soal untuk runQuiz. Kunci opsi berupa huruf. */
function mkQ(ctx, prompt, optTexts, ansText, why, fixed){
  var texts = fixed ? optTexts.slice() : shuffle(optTexts);
  var opts = texts.map(function(t, i){ return {k:String.fromCharCode(97 + i), t:t}; });
  var hit = opts.filter(function(o){ return o.t === ansText; });
  if (hit.length !== 1) throw new Error('Jawaban tidak ditemukan tepat satu kali: ' + ansText);
  return {ctx:ctx, prompt:prompt, opts:opts, ans:hit[0].k, why:why};
}

var K4_BINS = [
  {id:'hardware',  label:'Hardware',            short:'Hardware'},
  {id:'software',  label:'Software',            short:'Software'},
  {id:'jaringan',  label:'Jaringan Komputer',   short:'Jaringan Komputer'},
  {id:'data',      label:'Data',                short:'Data'},
  {id:'fasilitas', label:'Fasilitas Fisik',     short:'Fasilitas Fisik'},
  {id:'cloud',     label:'Platform Cloud',      short:'Platform Cloud'},
  {id:'keamanan',  label:'Keamanan Informasi',  short:'Keamanan Informasi'},
  {id:'storage',   label:'Storage dan Backup',  short:'Storage dan Backup'}
];
/* Level 1: ambil 1 acak per komponen (8 kartu). Variasi sengaja dipilih supaya tidak ambigu antar komponen. */
var K4_KOMP = {
  hardware: ['Server', 'Komputer'],
  software: ['Sistem operasi', 'Aplikasi bisnis', 'Middleware'],
  jaringan: ['LAN dan WAN', 'Koneksi internet'],
  data:     ['Database', 'File sistem', 'Data warehouse'],
  fasilitas:['Ruang server', 'UPS', 'Sistem pendingin'],
  cloud:    ['Layanan komputasi berbasis internet yang tersedia on-demand', 'Layanan infrastruktur, platform, dan aplikasi lewat internet'],
  keamanan: ['Firewall', 'Antivirus', 'Enkripsi', 'Sistem deteksi intrusi'],
  storage:  ['SAN', 'NAS', 'Solusi backup']
};
function k4L1Cards(){
  return K4_BINS.map(function(b, i){ return {id:'c' + i, t:pick(K4_KOMP[b.id]), bin:b.id}; });
}

/* Level 2: dua ronde sortir, 2 kartu acak per kotak (6 kartu per ronde). */
var K4_LAYANAN_BINS = [
  {id:'iaas', label:'IaaS', sub:'Infrastructure as a Service', short:'IaaS'},
  {id:'paas', label:'PaaS', sub:'Platform as a Service',       short:'PaaS'},
  {id:'saas', label:'SaaS', sub:'Software as a Service',       short:'SaaS'}
];
var K4_LAYANAN = {
  iaas:['Server virtual, storage, dan jaringan disewa dari penyedia', 'Pengguna mengelola sendiri OS dan aplikasinya', 'Migrasi data center ke cloud'],
  paas:['Platform pengembangan aplikasi tanpa kelola infrastruktur', 'Developer membangun aplikasi tanpa mengurus server atau jaringan', 'Platform untuk mengembangkan dan menjalankan aplikasi di cloud'],
  saas:['Aplikasi siap pakai lewat internet, misalnya email', 'CRM yang siap dipakai lewat internet', 'Pengguna tinggal memakai aplikasi tanpa mengelola infrastruktur dan platformnya']
};
var K4_DEPLOY_BINS = [
  {id:'public',  label:'Public cloud',  short:'Public cloud'},
  {id:'private', label:'Private cloud', short:'Private cloud'},
  {id:'hybrid',  label:'Hybrid cloud',  short:'Hybrid cloud'}
];
var K4_DEPLOY = {
  public: ['Infrastruktur dimiliki dan dikelola provider', 'Biaya rendah dan skalabilitas tinggi', 'Cocok untuk startup'],
  private:['Infrastruktur khusus untuk satu organisasi', 'Kontrol penuh dan keamanan tinggi', 'Ideal untuk data sensitif'],
  hybrid: ['Gabungan public dan private cloud yang terintegrasi', 'Workload dapat dipindahkan sesuai kebutuhan', 'Cocok untuk kebutuhan dinamis dan regulasi ketat']
};
function k4SortCards(pool){
  var out = [], n = 0;
  Object.keys(pool).forEach(function(bin){
    shuffle(pool[bin]).slice(0, 2).forEach(function(t){ out.push({id:'c' + (n++), t:t, bin:bin}); });
  });
  return out;
}

/* Level 3: bank soal, 1 soal dari tiap 8 keluarga. a = jawaban benar, o = opsi khusus, w = penjelasan. */
var K4_OPTS = {
  cloudchar:['On-Demand Self-Service', 'Broad Network Access', 'Resource Pooling', 'Rapid Elasticity', 'Measured Service'],
  tren:['Platform Digital Seluler', 'Grid Computing', 'Hardware Virtualization', 'Prosesor Hemat Daya'],
  evolusi:['Era Mainframe (1970-1980)', 'Era PC/LAN (1980-1990)', 'Era Internet (1990-2000)', 'Era Virtualisasi (2000-2010)', 'Era Cloud Computing dan Mobile (2010-2020)'],
  definisi:['ITIL 4', 'Turban dan Rainer', 'Gartner'],
  layanan:['IaaS', 'PaaS', 'SaaS'],
  deployment:['Public cloud', 'Private cloud', 'Hybrid cloud']
};
var K4_FIXED = {cloudchar:true, evolusi:true, definisi:true, layanan:true, deployment:true};
var K4_ASK = {
  cloudchar:'Karakteristik cloud yang dimaksud?',
  tren:'Tren teknologi infrastruktur yang dimaksud?',
  evolusi:'Era infrastruktur TI yang dimaksud?',
  definisi:'Definisi infrastruktur TI ini berasal dari perspektif siapa?',
  komponen:'Komponen infrastruktur TI yang paling relevan?',
  layanan:'Model layanan cloud yang paling sesuai?',
  deployment:'Model deployment cloud yang paling sesuai?'
};
var K4_MLOPS = ['Data preparation', 'Training model', 'Validasi model', 'Deployment', 'Monitoring', 'Retraining otomatis'];
var K4_BANK = {
  cloudchar:[
    {p:'Saat Sensus berlangsung, kapasitas server otomatis naik, lalu turun lagi setelah Sensus selesai.', a:'Rapid Elasticity', w:'Kapasitas layanan cloud dapat dipakai secara dinamis sesuai permintaan.'},
    {p:'Tagihan layanan cloud dihitung sesuai pemakaian aktual.', a:'Measured Service', w:'Sistem cloud mengukur tingkat penggunaan sumber daya, sehingga tagihan mengikuti pemakaian.'},
    {p:'Satu infrastruktur cloud dipakai bersama oleh banyak instansi.', a:'Resource Pooling', w:'Sumber daya milik provider disatukan dan melayani banyak konsumen dengan model multi-tenant.'},
    {p:'Pegawai mengakses layanan yang sama lewat laptop, HP, dan tablet.', a:'Broad Network Access', w:'Layanan diakses lewat jaringan dengan mekanisme standar dari berbagai platform klien.'},
    {p:'Tim membuat server cloud sendiri dalam hitungan menit tanpa berinteraksi langsung dengan penyedia layanan.', a:'On-Demand Self-Service', w:'Pengguna menyediakan kapabilitas komputasi secara mandiri sesuai kebutuhan.'}
  ],
  tren:[
    {p:'Aplikasi SOBAT BPS memungkinkan petugas mengakses survei lewat smartphone.', a:'Platform Digital Seluler', w:'Infrastruktur mobile yang mendukung akses layanan TI dari perangkat seluler.'},
    {p:'Pemrosesan data sensus dibagi ke banyak node yang bekerja secara paralel.', a:'Grid Computing', w:'Grid computing menghubungkan berbagai sumber daya komputasi untuk menyelesaikan tugas kompleks secara paralel.'},
    {p:'Satu server fisik dijadikan beberapa VM, misalnya dengan VMware.', a:'Hardware Virtualization', w:'Satu perangkat keras fisik menjalankan beberapa sistem operasi dan aplikasi secara bersamaan.'},
    {p:'Prosesor ARM dipakai di data center untuk menghemat listrik.', a:'Prosesor Hemat Daya', w:'Prosesor berefisiensi energi tinggi mengurangi konsumsi daya dan biaya operasional data center.'}
  ],
  evolusi:[
    {p:'Komputer besar terpusat, pemrosesan batch, terminal dumb, dan kontrol terpusat oleh departemen TI.', a:'Era Mainframe (1970-1980)', w:'Ciri era mainframe: komputer besar terpusat, pemrosesan batch, dan terminal dumb.'},
    {p:'Munculnya Personal Computer dan jaringan lokal, dengan arsitektur client-server.', a:'Era PC/LAN (1980-1990)', w:'Era PC/LAN: PC dan jaringan lokal, client-server memungkinkan distribusi pemrosesan data.'},
    {p:'Konektivitas global lewat internet, e-commerce, dan web server berkembang pesat.', a:'Era Internet (1990-2000)', w:'Era Internet: konektivitas global, e-commerce, web server, dan komunikasi digital.'},
    {p:'Teknologi virtualisasi mengoptimalkan sumber daya.', a:'Era Virtualisasi (2000-2010)', w:'Era Virtualisasi: teknologi virtualisasi mengoptimalkan sumber daya.'}
  ],
  definisi:[
    {p:'Infrastruktur TI mencakup fasilitas fisik, komponen TI, layanan TI, dan manajemen TI yang mendukung seluruh organisasi mencapai tujuan bisnisnya.', a:'Turban dan Rainer', w:'Definisi ini dari Turban dan Rainer.'},
    {p:'Infrastruktur TI adalah semua perangkat keras, perangkat lunak, jaringan, dan fasilitas yang diperlukan untuk mengembangkan, menguji, menyampaikan, memantau, mengendalikan, atau mendukung layanan TI.', a:'ITIL 4', w:'Definisi ini dari ITIL 4.'},
    {p:'Infrastruktur TI adalah komponen sistem yang menyediakan fondasi untuk membangun, menyampaikan, dan mengelola layanan TI bagi pelanggan, mitra, dan karyawan.', a:'Gartner', w:'Definisi ini dari Gartner.'}
  ],
  komponen:[
    {p:'Ruang server mati total karena listrik padam dan tidak ada UPS.', a:'Fasilitas Fisik', o:['Fasilitas Fisik', 'Software', 'Data', 'Platform Cloud'], w:'Data center, ruang server, sistem pendingin, dan UPS termasuk Fasilitas Fisik.'},
    {p:'Data survei tidak bisa dipulihkan karena tidak ada solusi backup.', a:'Storage dan Backup', o:['Storage dan Backup', 'Jaringan Komputer', 'Software', 'Fasilitas Fisik'], w:'SAN, NAS, dan solusi backup menjamin ketersediaan dan pemulihan data.'},
    {p:'Akses tidak sah ke server diblokir oleh firewall dan sistem deteksi intrusi.', a:'Keamanan Informasi', o:['Keamanan Informasi', 'Hardware', 'Data', 'Platform Cloud'], w:'Firewall, antivirus, enkripsi, dan sistem deteksi intrusi termasuk Keamanan Informasi.'},
    {p:'Sistem operasi, aplikasi bisnis, dan middleware yang menjalankan layanan.', a:'Software', o:['Software', 'Hardware', 'Data', 'Jaringan Komputer'], w:'Sistem operasi, aplikasi bisnis, middleware, dan perangkat lunak pendukung termasuk Software.'},
    {p:'Database, file sistem, dan data warehouse organisasi.', a:'Data', o:['Data', 'Hardware', 'Jaringan Komputer', 'Fasilitas Fisik'], w:'Aset informasi yang dikelola, disimpan, dan diproses termasuk database, file sistem, dan data warehouse.'}
  ],
  layanan:[
    {p:'Sebuah instansi memindahkan data center ke cloud dan mengelola sendiri OS dan aplikasinya.', a:'IaaS', w:'IaaS menyediakan infrastruktur dasar, sedangkan pengguna mengelola OS dan aplikasi sendiri. Cocok untuk migrasi data center.'},
    {p:'Tim developer membangun aplikasi tanpa harus mengelola infrastruktur.', a:'PaaS', w:'PaaS adalah platform pengembangan aplikasi tanpa kelola infrastruktur.'},
    {p:'Pegawai memakai email dan CRM siap pakai lewat internet.', a:'SaaS', w:'SaaS adalah aplikasi siap pakai lewat internet, misalnya email dan CRM.'}
  ],
  deployment:[
    {p:'Sebuah startup butuh biaya rendah dan skalabilitas tinggi.', a:'Public cloud', w:'Public cloud: infrastruktur dimiliki provider, biaya rendah, skalabilitas tinggi, cocok untuk startup.'},
    {p:'Data sensitif yang butuh kontrol penuh dan keamanan tinggi.', a:'Private cloud', w:'Private cloud: infrastruktur khusus organisasi, kontrol penuh, keamanan tinggi, ideal untuk data sensitif.'},
    {p:'Organisasi dengan kebutuhan dinamis dan regulasi ketat ingin memindahkan workload sesuai kebutuhan.', a:'Hybrid cloud', w:'Hybrid cloud menggabungkan public dan private cloud secara terintegrasi, dengan workload yang dapat dipindahkan.'}
  ],
  teknis:[
    {p:'Pada diagram Virtualization vs Containerization, model mana yang menjalankan container lewat Container Engine di atas Host OS, tanpa Guest OS pada tiap instans?', a:'Containerized',
     o:['Bare Metal', 'Virtualized', 'Containerized', 'Containerized on Virtualized'], fixed:true,
     w:'Pada Containerized, container berbagi Host OS lewat Container Engine. Pada Virtualized dan Containerized on Virtualized, ada Guest OS di dalam VM.'},
    {p:'Pada model Virtualized, lapisan apa yang menjalankan beberapa VM di atas server fisik?', a:'Hypervisor',
     o:['Hypervisor', 'Container Engine', 'Middleware', 'Data warehouse'],
     w:'Hypervisor menjalankan beberapa VM, masing-masing dengan Guest OS sendiri.'},
    {p:'Pada studi kasus MLOps, tim mengumpulkan dan membersihkan data historis, misalnya data inflasi bulanan. Fase apa ini?', a:'Data preparation', o:K4_MLOPS, fixed:true,
     w:'Fase 1 MLOps: data preparation, yaitu mengumpulkan dan membersihkan data historis.'},
    {p:'Tim melatih model machine learning dengan algoritma time-series. Fase MLOps apa ini?', a:'Training model', o:K4_MLOPS, fixed:true,
     w:'Fase 2 MLOps: training model.'},
    {p:'Model dipublikasikan lewat API endpoint, dashboard internal, aplikasi mobile, atau laporan otomatis. Fase MLOps apa ini?', a:'Deployment', o:K4_MLOPS, fixed:true,
     w:'Fase 4 MLOps: deployment, dengan keluaran seperti API endpoint, dashboard internal, aplikasi mobile, dan laporan otomatis.'},
    {p:'Model dilatih ulang saat data baru tersedia supaya tetap akurat. Fase MLOps apa ini?', a:'Retraining otomatis', o:K4_MLOPS, fixed:true,
     w:'Fase 6 MLOps: retraining otomatis agar model tetap akurat.'}
  ]
};
function k4Bank(fam){
  var e = pick(K4_BANK[fam]);
  var opts = e.o || K4_OPTS[fam];
  var fixed = e.fixed !== undefined ? e.fixed : !!K4_FIXED[fam];
  return K4_ASK[fam] ? mkQ(e.p, K4_ASK[fam], opts, e.a, e.w, fixed) : mkQ(null, e.p, opts, e.a, e.w, fixed);
}
/* 8 soal: tepat 1 dari tiap keluarga, lalu diacak. */
function k4BuildL3(){
  return shuffle(['cloudchar', 'tren', 'evolusi', 'definisi', 'komponen', 'layanan', 'deployment', 'teknis'].map(k4Bank));
}


GAME = {
  key:'komponencloud', title:'Komponen dan Cloud', emoji:'☁️',
  intro:'Kenali komponen infrastruktur TI, model layanan cloud, dan contoh penerapannya di BPS.',
  levels:[['Mudah','Cocokkan 8 contoh ke 8 komponen infrastruktur TI'],
          ['Sedang','Sortir model layanan (IaaS, PaaS, SaaS), lalu model deployment cloud'],
          ['Sulit','8 soal skenario acak dari seluruh materi (' + K4_PERQ + ' detik per soal)']],
  foot:'Rujukan: Slide Manajemen Infrastruktur TI hal. 5-19.',
  start:function(level){
    if (level === 1) {
      runSorter({level:1, title:levelTitle(1), feedback:'live', bins:K4_BINS, cards:k4L1Cards(),
        task:'Tap contoh, lalu tap komponen infrastruktur TI yang tepat. Tap kartu di kotak untuk memindahkannya.',
        onDone:function(r){
          var s = starsLow(r.mistakes, 1, 4); saveBest(1, s);
          showResult({level:1, stars:s, title:'Semua komponen tepat!', text: s === 3 ? 'Rapi. Delapan komponen sudah hafal.' : 'Berhasil. Ulangi untuk lebih tepat.', stats:['Salah letak: ' + r.mistakes]});
        }});
    } else if (level === 2) {
      var checks = 0;
      var round2 = function(){
        runSorter({level:2, title:levelTitle(2) + ' (2/2)', feedback:'check', bins:K4_DEPLOY_BINS, cards:k4SortCards(K4_DEPLOY),
          task:'Tempatkan 6 ciri ke model deployment cloud yang tepat, lalu tap Periksa.',
          onDone:function(r){
            checks += r.checks;
            var s = starsLow(checks, 2, 4); saveBest(2, s);
            showResult({level:2, stars:s, title:'Dua ronde selesai!', text: s === 3 ? 'Rapi. Model layanan dan deployment cloud sudah lancar.' : 'Berhasil. Ulangi supaya sekali jalan.', stats:['Pemeriksaan: ' + checks + 'x']});
          }});
      };
      runSorter({level:2, title:levelTitle(2) + ' (1/2)', feedback:'check', bins:K4_LAYANAN_BINS, cards:k4SortCards(K4_LAYANAN),
        task:'Tempatkan 6 ciri ke model layanan cloud yang tepat, lalu tap Periksa.',
        onDone:function(r){ checks = r.checks; round2(); }});
    } else {
      runQuiz({level:3, title:levelTitle(3), qs:k4BuildL3(), perQ:K4_PERQ,
        finish:function(score, total){
          var s = starsBy(score, 7, 5, 3); saveBest(3, s);
          showResult({level:3, stars:s, title:'Skor ' + score + ' dari ' + total,
            text: s === 3 ? 'Hampir sempurna. Komponen, cloud, dan tren sudah dikuasai.' : (s >= 1 ? 'Bagus. Ulangi dan perhatikan karakteristik cloud serta model layanan.' : 'Ulangi dulu Level 1 dan 2, lalu coba lagi.'),
            stats:[]});
        }});
    }
  }
};
showMenu();
