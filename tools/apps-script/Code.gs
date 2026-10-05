/** Web App penerima rekap Game Prakom. Deploy sebagai Web App (Execute as: Me, Access: Anyone). */
var HEADERS = ['Waktu', 'Nama', 'Game', 'Tema', 'Level', 'Bintang', 'Hasil', 'Detail'];

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
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 9).setValues(rows);
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

/** Jalankan sekali (manual) untuk membuat sheet Log + Rekap per nama. */
function setup() {
  getLog_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var r = ss.getSheetByName('Rekap') || ss.insertSheet('Rekap');
  r.clear();
  r.getRange('A1').setFormula(
    '=QUERY(Log!A:H,"select B, sum(F), count(F), max(A) where B is not null group by B order by sum(F) desc ' +
    'label B \'Nama\', sum(F) \'Total Bintang\', count(F) \'Jumlah Percobaan\', max(A) \'Terakhir Main\'",1)');
}
