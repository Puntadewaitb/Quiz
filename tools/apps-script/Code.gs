/** Web App penerima rekap Game Prakom. Deploy sebagai Web App (Execute as: Me, Access: Anyone). */
var HEADERS = ['Waktu', 'Nama', 'Game', 'Tema', 'Level', 'Bintang', 'Hasil', 'Detail'];

// ===== Aturan poin (ubah di sini, lalu Deploy > Manage deployments > New version) =====
var POIN_PER_BINTANG = 10;   // dikali bintang TERBAIK per game+level
var BONUS_SEKALI_JALAN = 5;  // percobaan pertama langsung 3 bintang
var PENALTI_ULANG = 1;       // per percobaan setelah yang pertama (per game+level)
var GAME_LIST = ['Susun Kabel UTP', 'Sortir OSI', 'Detektif Jaringan', 'Mini Packet Tracer', 'Urutan Pengadaan', 'Sortir Lifecycle'];

/** Hitung skor per orang dari baris Log [waktu,nama,game,tema,level,bintang,...]. Fungsi murni. */
function hitungSkor_(rows) {
  var by = {};
  rows.forEach(function (r) {
    var nama = String(r[1]).trim();
    if (!nama) return;
    var key = nama.toLowerCase();
    var p = by[key] || (by[key] = {nama: nama, lv: {}, tries: 0, last: 0});
    var lk = r[2] + '|' + r[4];
    var l = p.lv[lk] || (p.lv[lk] = {game: r[2], n: 0, best: 0, first: null});
    l.n++; p.tries++;
    var b = Number(r[5]) || 0;
    if (l.first === null) l.first = b;
    if (b > l.best) l.best = b;
    var t = r[0] instanceof Date ? r[0].getTime() : 0;
    if (t > p.last) p.last = t;
  });
  var out = Object.keys(by).map(function (k) {
    var p = by[k], stars = 0, bonus = 0, ulang = 0, selesai = 0, perGame = {};
    GAME_LIST.forEach(function (g) { perGame[g] = 0; });
    Object.keys(p.lv).forEach(function (lk) {
      var l = p.lv[lk];
      stars += l.best; ulang += l.n - 1;
      if (l.best > 0) selesai++;
      if (l.first === 3) bonus += BONUS_SEKALI_JALAN;
      perGame[l.game] = (perGame[l.game] || 0) + l.best;
    });
    var poinBintang = stars * POIN_PER_BINTANG, penalti = ulang * PENALTI_ULANG;
    return {nama: p.nama, selesai: selesai, stars: stars, tries: p.tries, poinBintang: poinBintang,
      bonus: bonus, penalti: penalti, total: Math.max(0, poinBintang + bonus - penalti), last: p.last, perGame: perGame};
  });
  out.sort(function (a, b) { return b.total - a.total || a.tries - b.tries || a.last - b.last; });
  return out;
}

/** Tulis ulang sheet Rekap (papan peringkat). */
function buatRekap_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = getLog_();
  var data = log.getLastRow() > 1 ? log.getRange(2, 1, log.getLastRow() - 1, 8).getValues() : [];
  var skor = hitungSkor_(data);
  var sh = ss.getSheetByName('Rekap') || ss.insertSheet('Rekap');
  sh.clear();
  var head = ['Peringkat', 'Nama', 'Total Poin', 'Level Selesai', 'Total Bintang (terbaik)', 'Percobaan', 'Poin Bintang', 'Bonus', 'Penalti']
    .concat(GAME_LIST.map(function (g) { return 'Bintang: ' + g; })).concat(['Terakhir Main']);
  var rows = skor.map(function (s, i) {
    return [i + 1, s.nama, s.total, s.selesai, s.stars, s.tries, s.poinBintang, s.bonus, -s.penalti]
      .concat(GAME_LIST.map(function (g) { return s.perGame[g]; })).concat([s.last ? new Date(s.last) : '']);
  });
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#FCDDC2');
  if (rows.length) {
    sh.getRange(2, 1, rows.length, head.length).setValues(rows);
    sh.getRange(2, head.length, rows.length, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  }
  sh.setFrozenRows(1); sh.setFrozenColumns(2);
  sh.autoResizeColumns(1, head.length);
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
      rows.push([new Date(r.waktu), clean_(r.nama), clean_(r.game), clean_(r.tema), Number(r.level), Number(r.bintang), clean_(r.hasil), clean_(r.detail), r.id]);
    });
    if (rows.length) {
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, 9).setValues(rows);
      buatRekap_();
    }
    return ContentService.createTextOutput(JSON.stringify({ok: true, added: rows.length})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

function doGet() { return ContentService.createTextOutput('Game Prakom endpoint aktif'); }

// cegah formula injection di Sheet
function clean_(v) { v = String(v == null ? '' : v).slice(0, 300); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function getLog_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Log');
  if (!sh) {
    sh = ss.insertSheet('Log');
    sh.getRange(1, 1, 1, 9).setValues([HEADERS.concat(['ID'])]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Jalankan sekali (manual) untuk membuat sheet Log + Rekap. Boleh dijalankan ulang kapan saja untuk menghitung ulang. */
function setup() {
  getLog_();
  buatRekap_();
}
