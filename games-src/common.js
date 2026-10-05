/* ===================== util umum ===================== */
var GAME = null;
var view = document.getElementById('view');
var timerId = null;
function clearTimer(){ if (timerId){ clearInterval(timerId); timerId = null; } }
function shuffle(a){
  a = a.slice();
  for (var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function eqArr(a,b){ if (a.length !== b.length) return false; for (var i=0;i<a.length;i++){ if (a[i]!==b[i]) return false; } return true; }

function loadBest(){
  try { var r = localStorage.getItem('best_' + GAME.key); if (r) return JSON.parse(r); } catch(e){}
  return {1:0,2:0,3:0};
}
function saveBest(level, stars){
  try {
    var b = loadBest();
    if (stars > (b[level]||0)) { b[level] = stars; localStorage.setItem('best_' + GAME.key, JSON.stringify(b)); }
  } catch(e){}
}
function starsHTML(n){
  var s = '<span class="stars" aria-label="' + n + ' dari 3 bintang">';
  for (var i=1;i<=3;i++) s += i<=n ? '★' : '<span class="off">★</span>';
  return s + '</span>';
}
function barHTML(title, chip){
  return '<div class="bar"><button class="back" id="bk">&larr; Menu</button><h2>' + title + '</h2>' + (chip||'') + '</div>';
}
function bindBack(){ var b = document.getElementById('bk'); if (b) b.onclick = showMenu; }
function levelTitle(n){ return 'Level ' + n + ': ' + ['Mudah','Sedang','Sulit'][n-1]; }

/* ===================== menu ===================== */
function showMenu(){
  clearTimer();
  var best = loadBest(), h = '';
  h += '<div class="hero"><div class="decor" aria-hidden="true">' + GAME.emoji + '</div><h1>' + GAME.title + '</h1><p>' + GAME.intro + '</p></div><div class="levels">';
  GAME.levels.forEach(function(l, i){
    h += '<button class="lvl" data-l="' + (i+1) + '"><span class="no">' + (i+1) + '</span><span><h2>' + l[0] + '</h2><p>' + l[1] + '</p></span>' + starsHTML(best[i+1]||0) + '</button>';
  });
  h += '</div><p class="foot">Semua level terbuka. Mulai dari mana saja. ' + GAME.foot + '</p>';
  view.innerHTML = h;
  Array.prototype.forEach.call(view.querySelectorAll('.lvl'), function(b){
    b.addEventListener('click', function(){ GAME.start(+b.dataset.l); });
  });
}

/* ===================== hasil ===================== */
function showResult(r){
  clearTimer();
  var h = '<div class="result">' + starsHTML(r.stars) + '<h2>' + r.title + '</h2><p>' + r.text + '</p>';
  if (r.stats && r.stats.length) h += '<div class="stat">' + r.stats.map(function(s){ return '<span>' + s + '</span>'; }).join('') + '</div>';
  if (r.extra) h += '<div class="extra">' + r.extra + '</div>';
  h += '<div class="row-btns"><button class="btn alt" id="rm">Menu</button><button class="btn" id="ra">Main lagi</button>' +
       (r.level < 3 && r.stars > 0 ? '<button class="btn dark" id="rn">Level ' + (r.level+1) + '</button>' : '') + '</div>';
  if (r.note) h += '<p class="note">' + r.note + '</p>';
  view.innerHTML = h + '</div>';
  document.getElementById('rm').onclick = showMenu;
  document.getElementById('ra').onclick = function(){ GAME.start(r.level); };
  var rn = document.getElementById('rn');
  if (rn) rn.onclick = function(){ GAME.start(r.level + 1); };
}
function starsBy(v, hi, mid, lo){ return v >= hi ? 3 : (v >= mid ? 2 : (v >= lo ? 1 : 0)); }
function starsLow(v, a, b){ return v <= a ? 3 : (v <= b ? 2 : 1); }   /* makin kecil makin baik */

/* ===================== komponen: kuis pilihan ===================== */
/* cfg: {level,title,qs:[{ctx,clue,cluelabel,prompt,opts:[{k,t,fb}],ans,why}],perQ,cols,finish(score,total)} */
function runQuiz(cfg){
  clearTimer();
  var qs = cfg.qs, idx = 0, score = 0, answered = false, left = 0;
  function render(){
    clearTimer(); answered = false;
    var q = qs[idx];
    var h = barHTML(cfg.title, '<span class="chip">Soal ' + (idx+1) + '/' + qs.length + '</span>');
    h += '<div class="status"><span class="chip">Skor: ' + score + '</span>' + (cfg.perQ ? '<span class="chip" id="tchip">' + cfg.perQ + ' dtk</span>' : '') + '</div>';
    h += '<div class="qcard">';
    if (q.ctx) h += '<p class="ctx">' + q.ctx + '</p>';
    if (q.clue) h += '<div class="clue"><b>' + (q.cluelabel || 'Temuan') + '</b>' + q.clue + '</div>';
    h += '<h3>' + q.prompt + '</h3><div class="opts' + (cfg.cols === 2 ? ' cols2' : '') + '">';
    q.opts.forEach(function(o){ h += '<button class="opt" data-k="' + o.k + '">' + o.t + '</button>'; });
    h += '</div><div id="fb"></div></div>';
    view.innerHTML = h;
    bindBack();
    Array.prototype.forEach.call(view.querySelectorAll('.opt'), function(b){
      b.addEventListener('click', function(){ answer(b.dataset.k); });
    });
    if (cfg.perQ) {
      left = cfg.perQ;
      timerId = setInterval(function(){
        left--;
        var c = document.getElementById('tchip');
        if (c) { c.textContent = left + ' dtk'; c.className = 'chip' + (left <= 5 ? ' warn' : ''); }
        if (left <= 0) { clearTimer(); answer(null); }
      }, 1000);
    }
  }
  function answer(k){
    if (answered) return;
    answered = true; clearTimer();
    var q = qs[idx];
    var right = (k !== null && String(k) === String(q.ans));
    if (right) score++;
    var chosen = null, correct = null;
    q.opts.forEach(function(o){ if (String(o.k) === String(k)) chosen = o; if (String(o.k) === String(q.ans)) correct = o; });
    Array.prototype.forEach.call(view.querySelectorAll('.opt'), function(b){
      b.disabled = true;
      if (String(b.dataset.k) === String(q.ans)) b.classList.add('right');
      else if (k !== null && b.dataset.k === String(k)) b.classList.add('wrong');
    });
    var txt = '';
    if (k === null) txt += 'Waktu habis. ';
    if (!right && chosen && chosen.fb) txt += chosen.fb + ' ';
    if (!right && correct) txt += 'Jawaban tepat: ' + correct.t + '. ';
    if (right && correct && correct.fb) txt += correct.fb + ' ';
    if (q.why) txt += q.why;
    var last = idx === qs.length - 1;
    document.getElementById('fb').innerHTML =
      '<div class="fb ' + (right ? 'ok' : 'bad') + '"><b>' + (right ? 'Benar' : (k === null ? 'Waktu habis' : 'Belum tepat')) + '</b>' + txt + '</div>' +
      '<div class="row-btns"><button class="btn" id="nx">' + (last ? 'Lihat hasil' : 'Lanjut') + '</button></div>';
    var nx = document.getElementById('nx');
    nx.onclick = function(){ if (last) cfg.finish(score, qs.length); else { idx++; render(); } };
    nx.focus();
  }
  render();
}

/* ===================== komponen: urutkan ===================== */
/* cfg: {level,title,task,items:[{id,t}] (urutan benar),labels,locked:[idx],feedback:'live'|'marks'|'count',timer,g2,reveal,
         onDone(res),onTimeout(res)} */
function runOrder(cfg){
  clearTimer();
  var items = cfg.items, n = items.length, byId = {};
  items.forEach(function(it){ byId[it.id] = it; });
  var st = {slots:[], locked:{}, done:false, mistakes:0, checks:0, left:cfg.timer || 0, msg:'', marks:null};
  for (var i=0;i<n;i++) st.slots.push(null);
  (cfg.locked || []).forEach(function(i){ st.slots[i] = items[i].id; st.locked[i] = true; });
  var poolOrder = shuffle(items.map(function(it){ return it.id; })).filter(function(id){ return st.slots.indexOf(id) < 0; });
  var fbk = cfg.feedback;

  view.innerHTML = barHTML(cfg.title, '') + '<div id="stage"></div>';
  bindBack();
  var stage = document.getElementById('stage');

  function chipHTML(){
    if (cfg.timer) return '<span class="chip" id="tchip">' + st.left + ' dtk</span>';
    if (fbk === 'live') return '<span class="chip" id="mchip">Salah: ' + st.mistakes + '</span>';
    return '<span class="chip" id="mchip">Periksa: ' + st.checks + 'x</span>';
  }
  function draw(){
    var h = '<div class="status">' + chipHTML() + '</div><div class="task">' + cfg.task + '</div><div class="slots" id="slots">';
    for (var i=0;i<n;i++){
      var id = st.slots[i], cls = 'c';
      if (id) {
        cls += st.locked[i] ? ' locked' : ' filled';
        if (!st.locked[i]) {
          if (fbk === 'live') cls += (id === items[i].id ? ' ok' : ' bad');
          else if (st.marks) cls += (st.marks[i] ? ' ok' : ' bad');
        }
      }
      h += '<div class="slot" data-i="' + i + '"><div class="n">' + (i+1) + '</div><div class="' + cls + '">';
      if (id) h += '<span>' + (cfg.labels && cfg.showLabels ? '<span class="lab">' + cfg.labels[i] + '</span>' : '') + esc(byId[id].t) + (st.locked[i] ? ' <span class="lab" style="display:inline">(terkunci)</span>' : '') + '</span>';
      else h += '<span class="lab" style="color:var(--muted)">Tap kartu di bawah</span>';
      h += '</div></div>';
    }
    h += '</div><div class="opool' + (cfg.g2 ? ' g2' : '') + '" id="opool">';
    var inPool = poolOrder.filter(function(id){ return st.slots.indexOf(id) < 0; });
    if (!inPool.length) h += '<span class="empty">Semua kartu sudah dipasang</span>';
    inPool.forEach(function(id){ h += '<button class="ocard" data-id="' + id + '">' + esc(byId[id].t) + '</button>'; });
    h += '</div><div class="row-btns"><button class="btn alt" id="rs">Ulangi</button>' +
         (fbk !== 'live' ? '<button class="btn" id="ck">Periksa</button>' : '') + '</div><div class="msg" id="msg"></div>';
    stage.innerHTML = h;
    document.getElementById('msg').textContent = st.msg;
    document.getElementById('rs').onclick = function(){
      if (st.done) return;
      for (var i=0;i<n;i++) if (!st.locked[i]) st.slots[i] = null;
      st.msg = ''; st.marks = null; draw();
    };
    var ck = document.getElementById('ck');
    if (ck) ck.onclick = check;
  }
  function firstEmpty(){ for (var i=0;i<n;i++) if (st.slots[i] === null) return i; return -1; }
  function allCorrect(){ for (var i=0;i<n;i++) if (st.slots[i] !== items[i].id) return false; return true; }

  stage.addEventListener('click', function(e){
    if (st.done) return;
    var oc = e.target.closest('.ocard');
    if (oc) {
      var i = firstEmpty();
      if (i < 0) return;
      st.slots[i] = oc.dataset.id; st.msg = ''; st.marks = null;
      if (fbk === 'live' && oc.dataset.id !== items[i].id) st.mistakes++;
      draw();
      if (fbk === 'live') {
        if (allCorrect()) finish();
        else if (firstEmpty() < 0) { st.msg = 'Tap kartu yang merah untuk mengembalikannya, lalu coba lagi.'; draw(); }
      }
      return;
    }
    var sl = e.target.closest('.slot');
    if (sl) {
      var j = +sl.dataset.i;
      if (st.slots[j] && !st.locked[j]) { st.slots[j] = null; st.msg = ''; st.marks = null; draw(); }
    }
  });

  function check(){
    if (st.done) return;
    if (firstEmpty() >= 0) { st.msg = 'Isi semua posisi dulu.'; draw(); return; }
    st.checks++;
    var ok = 0, marks = [];
    for (var i=0;i<n;i++){ var m = st.slots[i] === items[i].id; marks.push(m); if (m) ok++; }
    if (ok === n) { finish(); return; }
    st.marks = fbk === 'marks' ? marks : null;
    st.msg = ok + ' dari ' + n + ' posisi sudah benar. Coba lagi.';
    draw();
  }
  function finish(){
    if (st.done) return;
    st.done = true; clearTimer();
    var res = {mistakes:st.mistakes, checks:st.checks, left:st.left, ok:true};
    if (cfg.reveal) {
      var h = '<div class="reveal"><b>Urutan yang benar</b><ol>';
      items.forEach(function(it, i){ h += '<li>' + (cfg.labels ? '<b>' + cfg.labels[i] + ':</b> ' : '') + esc(it.t) + '</li>'; });
      h += '</ol></div><div class="row-btns"><button class="btn" id="go">Lanjut</button></div>';
      stage.innerHTML = '<div class="status"><span class="chip good">Urutan benar</span></div>' + h;
      document.getElementById('go').onclick = function(){ cfg.onDone(res); };
    } else cfg.onDone(res);
  }
  if (cfg.timer) {
    timerId = setInterval(function(){
      if (st.done) return;
      st.left--;
      var c = document.getElementById('tchip');
      if (c) { c.textContent = st.left + ' dtk'; c.className = 'chip' + (st.left <= 15 ? ' warn' : ''); }
      if (st.left <= 0) { st.left = 0; st.done = true; clearTimer(); if (cfg.onTimeout) cfg.onTimeout({checks:st.checks}); }
    }, 1000);
  }
  draw();
}

/* ===================== komponen: sortir ke kotak ===================== */
/* cfg: {level,title,task,bins:[{id,label,short,sub}],cards:[{id,t,bin}],hideNames,feedback:'live'|'check',onDone(res)} */
function runSorter(cfg){
  clearTimer();
  var st = {place:{}, sel:null, mistakes:0, checks:0, done:false, msg:'', marks:null};
  var cards = shuffle(cfg.cards), byId = {};
  cfg.cards.forEach(function(c){ byId[c.id] = c; });
  var live = cfg.feedback === 'live';
  view.innerHTML = barHTML(cfg.title, '') + '<div id="stage"></div>';
  bindBack();
  var stage = document.getElementById('stage');

  function draw(){
    var h = '<div class="status"><span class="chip" id="mchip">' + (live ? 'Salah: ' + st.mistakes : 'Periksa: ' + st.checks + 'x') + '</span></div>';
    h += '<div class="task">' + cfg.task + '</div>';
    h += '<div class="spool"><div class="box" id="pool">';
    var rest = cards.filter(function(c){ return !st.place[c.id]; });
    if (!rest.length) h += '<span class="empty">Semua kartu sudah dipasang</span>';
    rest.forEach(function(c){ h += '<button class="scard' + (st.sel === c.id ? ' sel' : '') + '" data-id="' + c.id + '">' + esc(c.t) + '</button>'; });
    h += '</div></div><div id="bins">';
    cfg.bins.forEach(function(b){
      h += '<div class="bin' + (st.sel ? ' target' : '') + '" data-bin="' + b.id + '"><div class="bl">' + (cfg.hideNames ? b.short : b.label) +
           (!cfg.hideNames && b.sub ? '<span class="bs">' + b.sub + '</span>' : '') + '</div><div class="items">';
      cards.filter(function(c){ return st.place[c.id] === b.id; }).forEach(function(c){
        var cls = 'scard';
        if (live) cls += (c.bin === b.id ? ' ok' : ' bad');
        else if (st.marks) cls += (c.bin === b.id ? ' ok' : ' bad');
        h += '<button class="' + cls + '" data-placed="' + c.id + '">' + esc(c.t) + '</button>';
      });
      h += '</div></div>';
    });
    h += '</div>' + (live ? '' : '<div class="row-btns"><button class="btn alt" id="rs">Ulangi</button><button class="btn" id="ck">Periksa</button></div>') +
         '<div class="msg" id="msg"></div>';
    stage.innerHTML = h;
    document.getElementById('msg').textContent = st.msg;
    var rs = document.getElementById('rs');
    if (rs) rs.onclick = function(){ if (st.done) return; st.place = {}; st.sel = null; st.msg = ''; st.marks = null; draw(); };
    var ck = document.getElementById('ck');
    if (ck) ck.onclick = check;
  }
  function allPlaced(){ return cards.every(function(c){ return st.place[c.id]; }); }
  function allRight(){ return cards.every(function(c){ return st.place[c.id] === c.bin; }); }

  stage.addEventListener('click', function(e){
    if (st.done) return;
    var c = e.target.closest('#pool [data-id]');
    if (c) { st.sel = (st.sel === c.dataset.id) ? null : c.dataset.id; draw(); return; }
    var bin = e.target.closest('[data-bin]');
    var pc = e.target.closest('[data-placed]');
    if (pc && !st.sel) { delete st.place[pc.dataset.placed]; st.msg = ''; st.marks = null; draw(); return; }
    if (bin && st.sel) {
      var card = byId[st.sel];
      st.place[card.id] = bin.dataset.bin;
      if (live && card.bin !== bin.dataset.bin) st.mistakes++;
      st.sel = null; st.msg = ''; st.marks = null;
      draw();
      if (live) {
        if (allRight()) finish();
        else if (allPlaced()) { st.msg = 'Tap kartu yang merah untuk memindahkannya, lalu coba lagi.'; draw(); }
      }
    }
  });
  function check(){
    if (st.done) return;
    if (!allPlaced()) { st.msg = 'Pasang semua kartu dulu.'; draw(); return; }
    st.checks++;
    var ok = cards.filter(function(c){ return st.place[c.id] === c.bin; }).length;
    if (ok === cards.length) { finish(); return; }
    st.marks = true;
    st.msg = ok + ' dari ' + cards.length + ' kartu sudah di tempat yang benar.';
    draw();
  }
  function finish(){
    if (st.done) return;
    st.done = true;
    cfg.onDone({mistakes:st.mistakes, checks:st.checks});
  }
  draw();
}
