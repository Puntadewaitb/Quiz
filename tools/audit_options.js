// Audit: seberapa sering jawaban benar = opsi terpanjang/terpendek. Pakai: node tools/audit_options.js
const fs = require('fs');
function load(file, names){
  const src = fs.readFileSync(file,'utf8');
  const cut = src.indexOf('GAME = {') > 0 ? src.slice(0, src.indexOf('GAME = {')) : src.slice(0, src.indexOf('function makeQuestions'));
  return new Function(cut + ';return {' + names.join(',') + '};')();
}
const qs = [];
let d = load('games-src/detektif.js', ['CASES1','CASES2']);
d.CASES1.forEach((c,i)=>qs.push(['detektif L1-'+(i+1), c.opts, c.ans]));
d.CASES2.forEach((c,i)=>{ qs.push(['detektif L2-'+(i+1)+'a', c.s1.opts, c.s1.ans]); qs.push(['detektif L2-'+(i+1)+'b', c.s2.opts, c.s2.ans]); });
// KNOW (kabel) : ambil lewat regex karena file tunggal dengan DOM
const html = fs.readFileSync('games/susun-kabel-utp.html','utf8');
const know = html.slice(html.indexOf('var KNOW'), html.indexOf('function makeQuestions'));
const KNOW = new Function('function opt(k,t){return {k:k,t:t};};' + know + ';return KNOW;')();
KNOW.forEach((c,i)=>qs.push(['kabel L3-'+(i+1), c.opts, c.ans]));
let longest=0, shortest=0, rows=[];
qs.forEach(([n,opts,ans])=>{
  const L = opts.map(o=>o.t.length), a = opts.find(o=>o.k===ans).t.length, mx=Math.max(...L), mn=Math.min(...L);
  const lg = a===mx && L.filter(x=>x===mx).length===1, sh = a===mn && L.filter(x=>x===mn).length===1;
  if (lg) longest++; if (sh) shortest++;
  rows.push(n.padEnd(14)+' benar='+String(a).padStart(3)+' semua='+L.join('/')+(lg?'  <-- TERPANJANG':sh?'  (terpendek)':''));
});
console.log(rows.join('\n'));
console.log(`\nTotal ${qs.length} soal | benar=terpanjang: ${longest} (${Math.round(100*longest/qs.length)}%) | benar=terpendek: ${shortest} (${Math.round(100*shortest/qs.length)}%) | acak ~33% untuk 3 opsi / 25% untuk 4`);
