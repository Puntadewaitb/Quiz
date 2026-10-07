// Uji data game Kepatuhan dan Kematangan + Komponen dan Cloud. Jalankan: node tools/test_manti.js
const fs = require('fs'), assert = require('assert');
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function loadData(file, from){ const s=fs.readFileSync(file,'utf8'); return s.slice(s.indexOf(from), s.indexOf('\nGAME = {')); }
const k3 = new Function('shuffle','pick', loadData('games-src/kepatuhan.js','/* helper kuis') +
  ';return {K3_KAT,K3_SKOR,K3_BANK,K3_OPTS,K3_MATURITY,K3_LANGKAH,k3Kategori,k3SkorQ,k3L1Cards,k3BuildL3,mkQ};')(shuffle,pick);
const k4 = new Function('shuffle','pick', loadData('games-src/komponencloud.js','/* helper kuis') +
  ';return {K4_BINS,K4_KOMP,K4_LAYANAN,K4_DEPLOY,K4_BANK,K4_OPTS,K4_MLOPS,k4L1Cards,k4SortCards,k4BuildL3};')(shuffle,pick);
let n = 0; const ok = (m) => { n++; console.log('ok  ' + m); };

function checkQ(q, tag){
  assert(q.prompt && q.opts.length >= 3, tag + ': soal tak lengkap');
  const texts = q.opts.map(o => o.t), keys = q.opts.map(o => o.k);
  assert.strictEqual(new Set(texts).size, texts.length, tag + ': opsi kembar: ' + texts.join(' | '));
  assert.strictEqual(new Set(keys).size, keys.length, tag + ': kunci kembar');
  assert.strictEqual(q.opts.filter(o => o.k === q.ans).length, 1, tag + ': jawaban tidak tepat satu');
  assert(q.why && q.why.length > 5, tag + ': penjelasan kosong');
}

// 1a. tiap entri bank: jawaban ada tepat sekali di opsi, tak ada opsi kembar
function checkBank(bank, optsDef, tag){
  Object.keys(bank).forEach(fam => bank[fam].forEach((e, i) => {
    const opts = e.o || optsDef[fam]; assert(opts, tag + ':' + fam + ' tanpa opsi');
    assert.strictEqual(opts.filter(t => t === e.a).length, 1, tag + ':' + fam + '#' + (i + 1) + ' jawaban "' + e.a + '" tidak tepat satu di opsi');
    assert.strictEqual(new Set(opts).size, opts.length, tag + ':' + fam + '#' + (i + 1) + ' opsi kembar');
    assert(e.w && e.p, tag + ':' + fam + '#' + (i + 1) + ' p/w kosong');
  }));
}
checkBank(k3.K3_BANK, k3.K3_OPTS, 'K3'); ok('K3: semua entri bank valid (jawaban tepat satu, tanpa opsi kembar)');
checkBank(k4.K4_BANK, k4.K4_OPTS, 'K4'); ok('K4: semua entri bank valid (jawaban tepat satu, tanpa opsi kembar)');

// 1b. builder 2000x
const RUN = 2000;
for (let i = 0; i < RUN; i++) {
  const a = k3.k3BuildL3(), b = k4.k4BuildL3();
  assert.strictEqual(a.length, 8, 'k3BuildL3 bukan 8 soal'); assert.strictEqual(b.length, 8, 'k4BuildL3 bukan 8 soal');
  a.forEach((q, j) => checkQ(q, 'k3#' + i + '.' + j)); b.forEach((q, j) => checkQ(q, 'k4#' + i + '.' + j));
  const ctxs = a.filter(q => /Skor kepatuhannya/.test(q.prompt));
  assert.strictEqual(ctxs.length, 2, 'K3 harus tepat 2 soal hitung skor');
  assert.notStrictEqual(ctxs[0].ans && ctxs[0].why.split('masuk kategori ')[1].split(' (')[0], ctxs[1].why.split('masuk kategori ')[1].split(' (')[0], 'dua soal skor harus beda kategori');
}
ok('k3BuildL3 dan k4BuildL3: ' + RUN + 'x menghasilkan 8 soal valid, K3 selalu 2 soal skor beda kategori');

// 1c. kartu Level 1 & 2
for (let i = 0; i < 500; i++) {
  const c = k3.k3L1Cards(); assert.strictEqual(c.length, 8);
  k3.K3_KAT.forEach(k => assert.strictEqual(c.filter(x => x.bin === k.id).length, 2));
  assert.strictEqual(new Set(c.map(x => x.id)).size, 8);
  c.forEach(x => { const v = parseInt(x.t, 10); assert.strictEqual(k3.k3Kategori(v), x.bin, 'kartu skor salah kotak: ' + x.t); assert(![90, 75, 60].includes(v), 'kartu memakai nilai batas'); });
  const d = k4.k4L1Cards(); assert.strictEqual(d.length, 8); assert.strictEqual(new Set(d.map(x => x.bin)).size, 8);
  d.forEach(x => assert(k4.K4_KOMP[x.bin].includes(x.t)));
  [k4.K4_LAYANAN, k4.K4_DEPLOY].forEach(p => { const s = k4.k4SortCards(p); assert.strictEqual(s.length, 6); Object.keys(p).forEach(b => assert.strictEqual(s.filter(x => x.bin === b).length, 2)); assert.strictEqual(new Set(s.map(x => x.id)).size, 6); });
}
ok('Kartu Level 1 (8 skor, 8 komponen) dan Level 2 (6 kartu, 2 per kotak) benar');
Object.values(k4.K4_KOMP).concat(Object.values(k4.K4_LAYANAN), Object.values(k4.K4_DEPLOY)).forEach(arr => assert.strictEqual(new Set(arr).size, arr.length));
const allCards = [].concat(...Object.values(k4.K4_LAYANAN), ...Object.values(k4.K4_DEPLOY));
assert.strictEqual(new Set(allCards).size, allCards.length, 'ada kartu Level 2 kembar lintas kotak'); ok('Tidak ada kartu kembar lintas kotak (Level 2)');

// 2. soal hitung skor: bandingkan dengan perhitungan lain (aritmetika bilangan bulat, tanpa float)
const kat = (m, nn) => (m * 100 >= 90 * nn ? 'sangat' : m * 100 >= 75 * nn ? 'patuh' : m * 100 >= 60 * nn ? 'cukup' : 'tidak');
const NAMA = {sangat:'Sangat patuh', patuh:'Patuh', cukup:'Cukup patuh', tidak:'Tidak patuh / risiko tinggi'};
const batas = {}; let seenBoundary = 0;
for (let i = 0; i < 6000; i++) {
  ['sangat','patuh','cukup','tidak'].forEach(target => {
    const q = k3.k3SkorQ(target), m = q.ctx.match(/memenuhi (\d+) dari (\d+) kontrol/); const mm = +m[1], nn = +m[2];
    assert([10,20,25,50].includes(nn), 'n kontrol di luar {10,20,25,50}');
    assert.strictEqual(kat(mm, nn), target, 'kategori hitung ulang beda: ' + mm + '/' + nn);
    assert.strictEqual(q.opts.find(o => o.k === q.ans).t, NAMA[target], 'jawaban benar bukan kategori ' + target);
    assert.strictEqual(String(mm * 100 / nn), q.why.match(/= ([\d.]+)%/)[1], 'persen di penjelasan salah');
    assert(Number.isInteger(mm * 100 / nn), 'persen bukan bilangan bulat');
    const pct = mm * 100 / nn; if ([90, 75, 60].includes(pct)) { seenBoundary++; batas[pct] = (batas[pct] || 0) + 1; }
  });
}
assert.deepStrictEqual(Object.keys(batas).sort(), ['60','75','90'], 'nilai batas 90/75/60 tidak pernah muncul');
assert.strictEqual(k3.k3Kategori(90), 'sangat'); assert.strictEqual(k3.k3Kategori(89), 'patuh'); assert.strictEqual(k3.k3Kategori(75), 'patuh'); assert.strictEqual(k3.k3Kategori(74), 'cukup');
assert.strictEqual(k3.k3Kategori(60), 'cukup'); assert.strictEqual(k3.k3Kategori(59), 'tidak'); assert.strictEqual(k3.k3Kategori(100), 'sangat'); assert.strictEqual(k3.k3Kategori(0), 'tidak');
ok('k3SkorQ: 24000 soal cocok dengan hitung ulang bilangan bulat; batas 90%/75%/60% muncul ' + JSON.stringify(batas) + ' dan masuk kategori yang benar');
console.log('\n' + n + ' kelompok uji lolos');
