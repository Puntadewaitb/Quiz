/** Web App penerima rekap Game Prakom. Deploy sebagai Web App (Execute as: Me, Access: Anyone). */
var HEADERS = ['Waktu', 'Nama', 'Game', 'Tema', 'Level', 'Bintang', 'Hasil', 'Detail'];

// ===== Aturan poin (ubah di sini, lalu Deploy > Manage deployments > New version) =====
var POIN_PER_BINTANG = 10;   // dikali bintang TERBAIK per game+level
var BONUS_SEKALI_JALAN = 5;  // percobaan pertama langsung 3 bintang
var PENALTI_ULANG = 1;       // per percobaan setelah yang pertama (per game+level)
var GAME_LIST = ['Susun Kabel UTP', 'Sortir OSI', 'Detektif Jaringan', 'Mini Packet Tracer', 'Urutan Pengadaan', 'Sortir Lifecycle', 'Komponen dan Cloud', 'Kepatuhan dan Kematangan'];

/** Hitung skor per orang per kelas dari baris Log [waktu,nama,game,tema,level,bintang,hasil,detail,id,kelas]. Fungsi murni. */
function hitungSkor_(rows) {
  var by = {};
  rows.forEach(function (r) {
    var nama = String(r[1]).trim();
    if (!nama) return;
    var kelas = kelas_(r[9]);
    var key = kelas + '|' + nama.toLowerCase();
    var p = by[key] || (by[key] = {nama: nama, kelas: kelas, lv: {}, tries: 0, last: 0, lastT: {}});
    var lk = r[2] + '|' + r[4];
    var tema = String(r[3] || '-').trim() || '-';
    var l = p.lv[lk] || (p.lv[lk] = {game: r[2], tema: tema, n: 0, best: 0, first: null});
    l.n++; p.tries++;
    var b = Number(r[5]) || 0;
    if (l.first === null) l.first = b;
    if (b > l.best) l.best = b;
    var t = r[0] instanceof Date ? r[0].getTime() : 0;
    if (t > p.last) p.last = t;
    if (t > (p.lastT[tema] || 0)) p.lastT[tema] = t;
  });
  var out = Object.keys(by).map(function (k) {
    var p = by[k], stars = 0, bonus = 0, ulang = 0, selesai = 0, perGame = {}, perTema = {};
    GAME_LIST.forEach(function (g) { perGame[g] = 0; });
    Object.keys(p.lv).forEach(function (lk) {
      var l = p.lv[lk];
      stars += l.best; ulang += l.n - 1;
      if (l.best > 0) selesai++;
      if (l.first === 3) bonus += BONUS_SEKALI_JALAN;
      perGame[l.game] = (perGame[l.game] || 0) + l.best;
      // rincian per materi (tema) dengan aturan poin yang sama; dipakai tab Sisjarkom / Man TI di admin
      var T = perTema[l.tema] || (perTema[l.tema] = {stars: 0, selesai: 0, tries: 0, bonus: 0, ulang: 0, last: p.lastT[l.tema] || 0});
      T.stars += l.best; T.tries += l.n; T.ulang += l.n - 1;
      if (l.best > 0) T.selesai++;
      if (l.first === 3) T.bonus += BONUS_SEKALI_JALAN;
    });
    Object.keys(perTema).forEach(function (tm) {
      var T = perTema[tm];
      T.poinBintang = T.stars * POIN_PER_BINTANG; T.penalti = T.ulang * PENALTI_ULANG;
      T.total = Math.max(0, T.poinBintang + T.bonus - T.penalti); delete T.ulang;
    });
    var poinBintang = stars * POIN_PER_BINTANG, penalti = ulang * PENALTI_ULANG;
    return {nama: p.nama, kelas: p.kelas, selesai: selesai, stars: stars, tries: p.tries, poinBintang: poinBintang,
      bonus: bonus, penalti: penalti, total: Math.max(0, poinBintang + bonus - penalti), last: p.last, perGame: perGame, perTema: perTema};
  });
  out.sort(function (a, b) { return b.total - a.total || a.tries - b.tries || a.last - b.last; });
  return out;
}

/** Daftar kolom game: GAME_LIST (urutan tetap) + game apa pun yang muncul di data tapi belum terdaftar (otomatis, tanpa edit kode). */
function gameCols_(skor) {
  var g = GAME_LIST.slice();
  skor.forEach(function (s) { Object.keys(s.perGame).forEach(function (k) { if (g.indexOf(k) < 0) g.push(k); }); });
  return g;
}

/** Tulis satu tab peringkat. denganKelas=true untuk tab gabungan (ada kolom Kelas). */
function tulisRekap_(namaTab, skor, denganKelas, games) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(namaTab) || ss.insertSheet(namaTab);
  sh.clear();
  var head = ['Peringkat'].concat(denganKelas ? ['Kelas'] : [], ['Nama', 'Total Poin', 'Level Selesai', 'Total Bintang (terbaik)', 'Percobaan', 'Poin Bintang', 'Bonus', 'Penalti'],
    games.map(function (g) { return 'Bintang: ' + g; }), ['Terakhir Main']);
  var rows = skor.map(function (s, i) {
    return [i + 1].concat(denganKelas ? [s.kelas] : [], [s.nama, s.total, s.selesai, s.stars, s.tries, s.poinBintang, s.bonus, -s.penalti],
      games.map(function (g) { return s.perGame[g] || 0; }), [s.last ? new Date(s.last) : '']);
  });
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#FCDDC2');
  if (rows.length) {
    sh.getRange(2, 1, rows.length, head.length).setValues(rows);
    sh.getRange(2, head.length, rows.length, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  }
  sh.setFrozenRows(1); sh.setFrozenColumns(denganKelas ? 3 : 2);
  sh.autoResizeColumns(1, head.length);
}

/** Tab "Rekap" = gabungan semua kelas; tab "Rekap <KELAS>" dibuat otomatis untuk tiap kelas (kecuali '-'). */
function buatRekap_() {
  var log = getLog_();
  var data = log.getLastRow() > 1 ? log.getRange(2, 1, log.getLastRow() - 1, 10).getValues() : [];
  var semua = hitungSkor_(data);
  var games = gameCols_(semua);
  tulisRekap_('Rekap', semua, true, games);
  var kelasAda = {};
  semua.forEach(function (s) { if (s.kelas !== '-') kelasAda[s.kelas] = 1; });
  Object.keys(kelasAda).sort().forEach(function (k) {
    tulisRekap_('Rekap ' + k, semua.filter(function (s) { return s.kelas === k; }), false, games);   // urutan sudah per skor
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    var sh = getLog_();
    var seen = {};
    if (sh.getLastRow() > 1) sh.getRange(2, 9, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { seen[r[0]] = 1; });
    var rows = [];
    (body.rows || []).forEach(function (r) {
      if (!r.id || seen[r.id]) return;                       // dedup kalau client kirim ulang
      rows.push([new Date(r.waktu), clean_(r.nama), clean_(r.game), clean_(r.tema), Number(r.level), Number(r.bintang), clean_(r.hasil), clean_(r.detail), r.id, kelas_(r.kelas)]);
    });
    if (rows.length) {
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, 10).setValues(rows);
      buatRekap_();
    }
    return ContentService.createTextOutput(JSON.stringify({ok: true, added: rows.length})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

// ===================== Endpoint baca (GET) =====================
// ?action=admin&token=XXXX&callback=cb        -> data lengkap (butuh ADMIN_TOKEN di Script Properties)
// Tanpa action -> teks penanda endpoint aktif.
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!p.action) return ContentService.createTextOutput('Game Prakom endpoint aktif');
  try {
    if (p.action === 'admin') return jsonOut_(dataAdmin_(p.token), p.callback);
    return jsonOut_({ok: false, error: 'aksi_tidak_dikenal'}, p.callback);
  } catch (err) {
    return jsonOut_({ok: false, error: 'server_error'}, p.callback);   // detail error sengaja tidak dibocorkan
  }
}

// JSONP (callback harus nama fungsi JS yang aman) agar bisa dipanggil dari halaman di GitHub Pages tanpa masalah CORS
function jsonOut_(obj, cb) {
  var s = JSON.stringify(obj).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  if (cb && /^[A-Za-z_][A-Za-z0-9_]{0,40}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + s + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON);
}

function bacaLog_() {
  var log = getLog_();
  return log.getLastRow() > 1 ? log.getRange(2, 1, log.getLastRow() - 1, 10).getValues() : [];
}

function ringkas_(s, rank) {
  return {rank: rank, nama: s.nama, kelas: s.kelas, poin: s.total, bintang: s.stars, selesai: s.selesai, percobaan: s.tries};
}

function samaToken_(a, b) {   // perbandingan waktu-konstan
  a = String(a || ''); b = String(b || '');
  var r = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return r === 0;
}

/** Data lengkap untuk halaman /admin. Wajib token. */
function dataAdmin_(token) {
  var t = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!t) return {ok: false, error: 'admin_belum_diatur'};
  if (t.length < 6) return {ok: false, error: 'token_terlalu_pendek'};
  // pembatas tebakan: 20 token salah dalam 10 menit -> admin dikunci sampai jendela waktu habis
  var cache = CacheService.getScriptCache(), gagal = Number(cache.get('adm_gagal') || 0);
  if (gagal >= 20) return {ok: false, error: 'terkunci'};
  if (!samaToken_(token, t)) { cache.put('adm_gagal', String(gagal + 1), 600); return {ok: false, error: 'token_salah'}; }
  var data = bacaLog_();
  var skor = hitungSkor_(data), kelasAda = {};
  var peserta = skor.map(function (s, i) {
    kelasAda[s.kelas] = 1;
    var o = ringkas_(s, i + 1);
    o.bonus = s.bonus; o.penalti = s.penalti; o.perGame = s.perGame; o.perTema = s.perTema; o.terakhir = s.last ? new Date(s.last).toISOString() : '';
    return o;
  });
  var terbaru = data.slice(-30).reverse().map(function (r) {
    return {waktu: r[0] instanceof Date ? r[0].toISOString() : '', nama: r[1], game: r[2], tema: String(r[3] || '-'), level: r[4], bintang: r[5], kelas: kelas_(r[9])};
  });
  var gameTema = {}, temaAda = {};
  data.forEach(function (r) { var tm = String(r[3] || '-'); temaAda[tm] = 1; if (!gameTema[r[2]]) gameTema[r[2]] = tm; });
  var temas = ['Sisjarkom', 'Man TI'].filter(function (x) { return temaAda[x]; })
    .concat(Object.keys(temaAda).filter(function (x) { return x !== 'Sisjarkom' && x !== 'Man TI'; }).sort());
  return {ok: true, diperbarui: new Date().toISOString(), games: gameCols_(skor), gameTema: gameTema, temas: temas, kelas: Object.keys(kelasAda).sort(),
    ringkasan: {peserta: skor.length, hasil: data.length, kelas: Object.keys(kelasAda).length}, peserta: peserta, terbaru: terbaru};
}

/** Jalankan SEKALI (manual) untuk membuat token admin acak. Token muncul di Execution log; simpan di tempat aman. */
function buatTokenAdmin() {
  var t = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, 28);
  PropertiesService.getScriptProperties().setProperty('ADMIN_TOKEN', t);
  Logger.log('TOKEN ADMIN: ' + t);
  return t;
}

// cegah formula injection di Sheet
function clean_(v) { v = String(v == null ? '' : v).slice(0, 300); return /^[=+\-@]/.test(v) ? "'" + v : v; }

// kode kelas: huruf/angka/spasi/_/- saja (aman dipakai sebagai nama tab), huruf besar, maks 20
function kelas_(v) { v = String(v == null ? '' : v).replace(/[^A-Za-z0-9 _-]/g, '').replace(/\s+/g, ' ').trim().toUpperCase().slice(0, 20); return v || '-'; }

function getLog_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Log');
  if (!sh) {
    sh = ss.insertSheet('Log');
    sh.getRange(1, 1, 1, 10).setValues([HEADERS.concat(['ID', 'Kelas'])]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  if (sh.getRange(1, 10).getValue() !== 'Kelas') sh.getRange(1, 10).setValue('Kelas').setFontWeight('bold');   // sheet lama
  return sh;
}

/** Jalankan sekali (manual) untuk membuat sheet Log + Rekap. Boleh dijalankan ulang kapan saja untuk menghitung ulang. */
function setup() {
  getLog_();
  buatRekap_();
}
