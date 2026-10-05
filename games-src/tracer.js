/* ===================== Mini Packet Tracer ===================== */
function ip2n(s){
  s = String(s).trim();
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(s)) return null;
  var p = s.split('.').map(Number), n = 0;
  for (var i=0;i<4;i++){ if (p[i] > 255) return null; n = n * 256 + p[i]; }
  return n;
}
function maskOK(s){
  var n = ip2n(s);
  if (n === null) return false;
  var b = n.toString(2); while (b.length < 32) b = '0' + b;
  return /^1+0*$/.test(b);
}
function band(a, b){ var r = 0, m = 1; for (var i=0;i<32;i++){ if ((Math.floor(a / m) % 2) && (Math.floor(b / m) % 2)) r += m; m *= 2; } return r; }
function net(ip, mask){ return band(ip2n(ip), ip2n(mask)); }
function hostOK(ip, mask){
  var a = ip2n(ip), m = ip2n(mask), inv = 4294967295 - m, host = a - band(a, m);
  return host !== 0 && host !== inv;
}
function okAddr(ip, mask){ return ip2n(ip) !== null && maskOK(mask); }

/* simulator: dev = {id,name,seg,ip,mask,gw}; router = {ifs:[{seg,ip,mask}]} */
function simulate(S, from, to){
  var src = S.dev[from], dst = S.dev[to], R = S.router;
  function fail(code, kind, via){ return {ok:false, code:code, kind:kind || 'timeout', via:via}; }
  if (!okAddr(src.ip, src.mask)) return fail('SRC_BAD', 'unreach', src.ip);
  if (!okAddr(dst.ip, dst.mask)) return fail('DST_BAD');
  if (!hostOK(src.ip, src.mask)) return fail('HOSTADDR', 'unreach', src.ip);
  if (!hostOK(dst.ip, dst.mask)) return fail('HOSTADDR');
  var all = [];
  Object.keys(S.dev).forEach(function(k){ all.push({n:S.dev[k].name, seg:S.dev[k].seg, ip:S.dev[k].ip}); });
  if (R) R.ifs.forEach(function(f, i){ all.push({n:'Router', seg:f.seg, ip:f.ip}); });
  function conflict(d){
    return all.some(function(o){ return o.seg === d.seg && o.n !== d.name && ip2n(o.ip) !== null && ip2n(d.ip) !== null && ip2n(o.ip) === ip2n(d.ip); });
  }
  if (conflict(src) || conflict(dst)) return fail('CONFLICT');
  var sameNet = net(src.ip, src.mask) === band(ip2n(dst.ip), ip2n(src.mask));
  if (sameNet) {
    if (src.seg !== dst.seg) return fail('SAMENET_DIFFSEG');
    if (net(dst.ip, dst.mask) !== band(ip2n(src.ip), ip2n(dst.mask))) return fail('REV_MASK');
    return {ok:true, hops:[{ip:dst.ip}], ttl:128};
  }
  /* beda jaringan: perlu gateway */
  if (ip2n(src.gw) === null || !maskOK(src.mask) || net(src.gw, src.mask) !== net(src.ip, src.mask)) return fail('NO_GW', 'unreach', src.ip);
  if (!R) return fail('NO_GW', 'unreach', src.ip);
  var fi = null;
  R.ifs.forEach(function(f){ if (f.seg === src.seg) fi = f; });
  if (!fi || !okAddr(fi.ip, fi.mask) || ip2n(fi.ip) !== ip2n(src.gw)) return fail('GW_MISMATCH');
  if (band(ip2n(src.ip), ip2n(fi.mask)) !== net(fi.ip, fi.mask)) return fail('ROUTER_MASK');
  var ti = null;
  R.ifs.forEach(function(f){ if (f.seg === dst.seg) ti = f; });
  if (!ti || !okAddr(ti.ip, ti.mask)) return fail('ROUTER_IF_OFF', 'unreach', fi.ip);
  if (band(ip2n(dst.ip), ip2n(ti.mask)) !== net(ti.ip, ti.mask)) return fail('NOROUTE', 'unreach', fi.ip);
  if (band(ip2n(src.ip), ip2n(dst.mask)) === net(dst.ip, dst.mask)) return fail('DST_MASK_BAD', 'timeout', null, fi.ip);
  if (ip2n(dst.gw) === null || net(dst.gw, dst.mask) !== net(dst.ip, dst.mask) || ip2n(dst.gw) !== ip2n(ti.ip)) return fail('DST_GW_BAD');
  return {ok:true, hops:[{ip:fi.ip}, {ip:dst.ip}], ttl:127};
}
var HINTS = {
  SRC_BAD:['IP atau subnet mask PC sumber belum diisi atau tidak valid.','Layer 3 (Network)'],
  DST_BAD:['IP atau subnet mask PC tujuan belum diisi atau tidak valid.','Layer 3 (Network)'],
  HOSTADDR:['Alamat jaringan dan alamat broadcast tidak boleh dipakai sebagai IP host.','Layer 3 (Network)'],
  CONFLICT:['Ada dua perangkat dengan IP yang sama di jaringan yang sama (IP bentrok).','Layer 3 (Network)'],
  SAMENET_DIFFSEG:['PC sumber mengira tujuan satu jaringan, padahal tujuan ada di jaringan lain, sehingga tidak ada yang menjawab. Periksa IP dan subnet mask.','Layer 2-3 (Data Link, Network)'],
  REV_MASK:['Balasan tidak kembali: subnet mask kedua PC tidak seragam.','Layer 3 (Network)'],
  NO_GW:['Tujuan ada di jaringan lain, tetapi default gateway kosong atau tidak satu subnet dengan PC.','Layer 3 (Network)'],
  GW_MISMATCH:['Default gateway tidak sama dengan IP router di jaringan ini, atau interface router belum diisi.','Layer 3 (Network)'],
  ROUTER_MASK:['IP PC tidak berada di jaringan interface router. Periksa mask router dan IP PC.','Layer 3 (Network)'],
  ROUTER_IF_OFF:['Interface router di sisi tujuan belum dikonfigurasi.','Layer 3 (Network)'],
  NOROUTE:['Router tidak punya jaringan tujuan: IP tujuan tidak cocok dengan interface router di sisinya.','Layer 3 (Network)'],
  DST_MASK_BAD:['Balasan tidak kembali: mask PC tujuan terlalu luas, ia mengira sumber ada di jaringan yang sama.','Layer 3 (Network)'],
  DST_GW_BAD:['Paket sampai, tetapi balasan tidak bisa pulang: gateway PC tujuan kosong atau salah.','Layer 3 (Network)']
};

function termPing(S, from, to, showHint){
  var r = simulate(S, from, to), d = S.dev[to], o = '';
  o += '<span class="hn">C:\\&gt; ping ' + esc(d.ip || '?') + '   (dari ' + S.dev[from].name + ' ke ' + d.name + ')</span>\n';
  o += 'Pinging ' + esc(d.ip || '?') + ' with 32 bytes of data:\n';
  var i;
  if (r.ok) {
    for (i=0;i<4;i++) o += '<span class="ok">Reply from ' + esc(d.ip) + ': bytes=32 time&lt;1ms TTL=' + r.ttl + '</span>\n';
    o += 'Ping statistics: Sent = 4, Received = 4, Lost = 0 (0% loss)\n';
  } else {
    for (i=0;i<4;i++) {
      if (r.kind === 'unreach' && r.via) o += '<span class="er">Reply from ' + esc(r.via) + ': Destination host unreachable.</span>\n';
      else if (r.kind === 'unreach') o += '<span class="er">Destination host unreachable.</span>\n';
      else o += '<span class="er">Request timed out.</span>\n';
    }
    o += 'Ping statistics: Sent = 4, Received = 0, Lost = 4 (100% loss)\n';
    if (showHint && HINTS[r.code]) {
      var hh = HINTS[r.code][0];
      if (S.level === 1 && r.code === 'NO_GW') hh = 'Kedua PC harus memakai jaringan yang sama (192.168.10.x dengan mask 255.255.255.0).';
      o += '<span class="hn">Petunjuk: ' + hh + ' [' + HINTS[r.code][1] + ']</span>\n';
    }
  }
  return {ok:r.ok, text:o};
}
function termTrace(S, from, to){
  var r = simulate(S, from, to), d = S.dev[to], o = '';
  o += '<span class="hn">C:\\&gt; tracert ' + esc(d.ip || '?') + '   (dari ' + S.dev[from].name + ' ke ' + d.name + ')</span>\n';
  o += 'Tracing route to ' + esc(d.ip || '?') + ' over a maximum of 30 hops:\n';
  if (r.ok) {
    r.hops.forEach(function(h, i){ o += '  ' + (i+1) + '    &lt;1 ms    ' + esc(h.ip) + '\n'; });
    o += 'Trace complete.\n';
  } else {
    var src = S.dev[from], R = S.router, reach = 0;
    /* hop 1 (gateway) menjawab hanya jika paket sampai ke router */
    if (['DST_MASK_BAD','DST_GW_BAD'].indexOf(r.code) >= 0 && R) {
      var fi = null; R.ifs.forEach(function(f){ if (f.seg === src.seg) fi = f; });
      if (fi) { o += '  1    &lt;1 ms    ' + esc(fi.ip) + '\n'; reach = 1; }
    }
    if (r.kind === 'unreach' && r.via) o += '  ' + (reach+1) + '    ' + esc(r.via) + '  reports: Destination host unreachable.\n';
    else { for (var i=reach+1;i<=reach+3;i++) o += '  ' + i + '     *        *        *     Request timed out.\n'; }
    o += 'Trace complete.\n';
  }
  return {ok:r.ok, text:o};
}

function startTracer(level){
  clearTimer();
  var S = {dev:{}, router:null, level:level}, goals = [], goalDone = {}, uses = 0, pings = 0, done = false, showHint = level < 3;
  function D(id, name, seg, ip, mask, gw){ S.dev[id] = {id:id, name:name, seg:seg, ip:ip||'', mask:mask||'', gw:gw||''}; }
  var task, plan = '', segs;
  if (level === 1) {
    D('pc1','PC1','A'); D('pc2','PC2','A');
    segs = [{seg:'A', label:'Jaringan A', sub:'lewat Switch', devs:['pc1','pc2']}];
    goals = [['pc1','pc2'],['pc2','pc1']];
    task = 'Isi IP dan subnet mask di PC1 dan PC2 supaya keduanya saling ping.';
    plan = 'Rencana alamat: jaringan 192.168.10.0, subnet mask 255.255.255.0. Beri IP host yang berbeda untuk tiap PC.';
  } else if (level === 2) {
    D('pc1','PC1','A'); D('pc2','PC2','A'); D('pc3','PC3','B');
    S.router = {ifs:[{seg:'A', ip:'', mask:''},{seg:'B', ip:'', mask:''}]};
    segs = [{seg:'A', label:'Jaringan A', sub:'lewat Switch A', devs:['pc1','pc2']}, {router:true}, {seg:'B', label:'Jaringan B', sub:'lewat Switch B', devs:['pc3']}];
    goals = [['pc1','pc3'],['pc2','pc3'],['pc3','pc1']];
    task = 'Isi IP, mask, dan gateway PC, serta IP interface router, supaya PC1 dan PC2 bisa ping ke PC3 dan sebaliknya.';
    plan = 'Rencana alamat: Jaringan A 192.168.10.0/24, Jaringan B 192.168.20.0/24 (mask 255.255.255.0). Router memakai alamat .1 di tiap jaringan.';
  } else {
    D('pc1','PC1','A','192.168.10.10','255.255.255.0','192.168.10.1');
    D('pc2','PC2','A','192.168.10.20','255.255.255.0','192.168.10.1');
    D('pc3','PC3','B','192.168.20.10','255.255.255.0','192.168.20.1');
    D('srv','Server','B','192.168.20.50','255.255.255.0','192.168.20.1');
    S.router = {ifs:[{seg:'A', ip:'192.168.10.1', mask:'255.255.255.0'},{seg:'B', ip:'192.168.20.1', mask:'255.255.255.0'}]};
    var targets = shuffle(['pc1','pc2','pc3','srv']).slice(0, 3);
    targets.forEach(function(t){
      if (t === 'pc1') S.dev.pc1.gw = '192.168.10.254';
      else if (t === 'pc2') { if (Math.random() < .5) S.dev.pc2.mask = '255.255.0.0'; else S.dev.pc2.ip = '192.168.10.10'; }
      else if (t === 'pc3') S.dev.pc3.ip = '192.168.2.10';
      else S.dev.srv.gw = '';
    });
    segs = [{seg:'A', label:'Jaringan A', sub:'192.168.10.0/24', devs:['pc1','pc2']}, {router:true}, {seg:'B', label:'Jaringan B', sub:'192.168.20.0/24', devs:['pc3','srv']}];
    goals = [['pc1','srv'],['pc2','srv'],['pc3','pc1'],['srv','pc2']];
    task = 'Jaringan sudah terpasang, tetapi ada kesalahan konfigurasi. Cari dan perbaiki dengan ping dan traceroute sampai semua tujuan berhasil.';
    plan = 'Rencana alamat: Jaringan A 192.168.10.0/24, Jaringan B 192.168.20.0/24, router memakai .1 di tiap jaringan.';
  }

  var CLUES = level === 1 ? [
    'Dua PC bisa saling ping kalau IP-nya berada di jaringan yang sama: bagian jaringannya sama, hanya angka host yang berbeda. Subnet mask kedua PC juga harus sama.',
    'Angka host (oktet terakhir) harus berbeda untuk tiap PC, dan jangan memakai 0 atau 255 karena itu alamat jaringan dan broadcast.',
    'Contoh: PC1 memakai 192.168.10.10 dan PC2 memakai 192.168.10.20, keduanya dengan mask 255.255.255.0.'
  ] : (level === 2 ? [
    'Tiap PC butuh default gateway, yaitu IP router di sisi jaringannya sendiri. PC di Jaringan A memakai IP router sisi A, PC di Jaringan B memakai IP router sisi B.',
    'Router: interface ke Jaringan A diisi 192.168.10.1 dan interface ke Jaringan B diisi 192.168.20.1, keduanya dengan mask 255.255.255.0.',
    'Contoh PC1: IP 192.168.10.10, mask 255.255.255.0, gateway 192.168.10.1. Contoh PC3: IP 192.168.20.10, mask 255.255.255.0, gateway 192.168.20.1. PC2 mengikuti pola PC1.'
  ] : []);
  var hintsUsed = 0;
  var devIds = Object.keys(S.dev);
  function goalLabel(g){ return S.dev[g[0]].name + ' ke ' + S.dev[g[1]].name; }
  function fieldsHTML(id){
    var d = S.dev[id];
    return '<div class="dev"><h4>' + d.name + '</h4><div class="f">' +
      '<div class="full"><label>IP address</label><input data-d="' + id + '" data-f="ip" value="' + esc(d.ip) + '" inputmode="decimal" autocomplete="off" placeholder="' + (level === 1 ? '192.168.10.x' : '192.168.x.x') + '"></div>' +
      '<div><label>Subnet mask</label><input data-d="' + id + '" data-f="mask" value="' + esc(d.mask) + '" inputmode="decimal" autocomplete="off" placeholder="255.255.255.0"></div>' +
      (level === 1 ? '' : '<div><label>Default gateway</label><input data-d="' + id + '" data-f="gw" value="' + esc(d.gw) + '" inputmode="decimal" autocomplete="off" placeholder="192.168.x.1"></div>') +
      '</div></div>';
  }
  function routerHTML(){
    var h = '<div class="rt"><h4>Router</h4><div class="ifs">';
    S.router.ifs.forEach(function(f, i){
      h += '<div class="ifr"><b>Interface ke Jaringan ' + f.seg + '</b><div class="f">' +
        '<div><label>IP address</label><input data-r="' + i + '" data-f="ip" value="' + esc(f.ip) + '" inputmode="decimal" autocomplete="off" placeholder="192.168.x.1"></div>' +
        '<div><label>Subnet mask</label><input data-r="' + i + '" data-f="mask" value="' + esc(f.mask) + '" inputmode="decimal" autocomplete="off" placeholder="255.255.255.0"></div></div></div>';
    });
    return h + '</div></div>';
  }

  var h = barHTML(levelTitle(level), '') + '<div class="task">' + task + '</div><p class="plan">' + plan + '</p>' + (CLUES.length ? '<div class="cluebox" id="clues"></div>' : '') + '<div class="goals" id="goals"></div><div class="net">';
  segs.forEach(function(s, i){
    if (s.router) { h += '<div class="link"><i></i></div>' + routerHTML() + '<div class="link"><i></i></div>'; return; }
    h += '<div class="seg"><div class="sl">' + s.label + '<span>' + s.sub + '</span></div><div class="devs">' + s.devs.map(fieldsHTML).join('') + '</div></div>';
  });
  h += '</div><div class="panel"><div class="pr"><div><label>Dari</label><select id="sf">' + devIds.map(function(id){ return '<option value="' + id + '">' + S.dev[id].name + '</option>'; }).join('') +
       '</select></div><div><label>Ke</label><select id="st">' + devIds.map(function(id, i){ return '<option value="' + id + '"' + (i === 1 ? ' selected' : '') + '>' + S.dev[id].name + '</option>'; }).join('') + '</select></div></div>' +
       '<div class="pb"><button class="btn" id="bp">Ping</button>' + (level === 3 ? '<button class="btn alt" id="bt">Traceroute</button><button class="btn dark" id="ba">Cek semua</button>' : '') +
       '</div><div class="term" id="term" aria-live="polite">Pilih perangkat asal dan tujuan, lalu tap Ping.\n</div></div><div class="msg" id="msg"></div>';
  view.innerHTML = '<div id="troot">' + h + '</div>';
  bindBack();
  var troot = document.getElementById('troot');

  function drawClues(){
    var box = document.getElementById('clues');
    if (!box) return;
    var h = '';
    for (var i=0;i<hintsUsed;i++) h += '<div class="clue1"><b>Petunjuk ' + (i+1) + '</b>' + CLUES[i] + '</div>';
    if (hintsUsed < CLUES.length) h += '<button class="btn alt" id="bh">Minta petunjuk (' + (CLUES.length - hintsUsed) + ' tersisa)</button>';
    box.innerHTML = h;
    var bh = document.getElementById('bh');
    if (bh) bh.onclick = function(){ if (done) return; hintsUsed++; drawClues(); };
  }
  function drawGoals(){
    document.getElementById('goals').innerHTML = goals.map(function(g, i){
      var ok = goalDone[i];
      return '<div class="goal' + (ok ? ' done' : '') + '"><span class="mk">' + (ok ? '✓' : '') + '</span>' + goalLabel(g) + '</div>';
    }).join('');
  }
  function resetGoals(){ goalDone = {}; drawGoals(); }
  function out(html){
    var t = document.getElementById('term');
    t.innerHTML += html + '\n'; t.scrollTop = t.scrollHeight;
  }
  function markGoals(from, to, ok){
    goals.forEach(function(g, i){ if (g[0] === from && g[1] === to && ok) goalDone[i] = true; });
    drawGoals();
    if (goals.every(function(g, i){ return goalDone[i]; })) win();
  }
  troot.addEventListener('input', function(e){
    var t = e.target;
    if (!t.dataset || !t.dataset.f) return;
    if (t.dataset.d) S.dev[t.dataset.d][t.dataset.f] = t.value;
    else if (t.dataset.r !== undefined) S.router.ifs[+t.dataset.r][t.dataset.f] = t.value;
    resetGoals();
  });
  function sel(){ return [document.getElementById('sf').value, document.getElementById('st').value]; }
  document.getElementById('bp').onclick = function(){
    if (done) return;
    var s = sel();
    if (s[0] === s[1]) { out('Pilih perangkat asal dan tujuan yang berbeda.'); return; }
    uses++; pings++;
    var r = termPing(S, s[0], s[1], showHint); out(r.text); markGoals(s[0], s[1], r.ok);
  };
  var bt = document.getElementById('bt');
  if (bt) bt.onclick = function(){
    if (done) return;
    var s = sel();
    if (s[0] === s[1]) { out('Pilih perangkat asal dan tujuan yang berbeda.'); return; }
    uses++;
    var r = termTrace(S, s[0], s[1]); out(r.text); markGoals(s[0], s[1], r.ok);
  };
  var ba = document.getElementById('ba');
  if (ba) ba.onclick = function(){
    if (done) return;
    uses++;
    goals.forEach(function(g){ var r = termPing(S, g[0], g[1], false); out(r.text); markGoals(g[0], g[1], r.ok); });
  };

  function win(){
    if (done) return;
    done = true;
    var s = level === 1 ? starsLow(uses, 4, 7) : (level === 2 ? starsLow(uses, 6, 12) : starsLow(uses, 12, 22));
    saveBest(level, s);
    var text = level === 1 ? 'Dua PC sudah saling terhubung dalam satu jaringan.' :
               (level === 2 ? 'Dua jaringan sudah terhubung lewat router.' : 'Semua kesalahan berhasil ditemukan dan diperbaiki.');
    var cfgs = '';
    if (level === 3) {
      cfgs = '<div class="reveal"><b>Konfigurasi akhir</b><ol>' + devIds.map(function(id){ var d = S.dev[id]; return '<li>' + d.name + ': ' + esc(d.ip) + ' / ' + esc(d.mask) + ', gateway ' + esc(d.gw || '-') + '</li>'; }).join('') + '</ol></div>';
    }
    setTimeout(function(){
      if (!document.getElementById('troot')) return;
      showResult({level:level, stars:s, title: level === 3 ? 'Jaringan pulih!' : 'Semua terhubung!', text:text, stats:['Pengujian: ' + uses + 'x'].concat(hintsUsed ? ['Petunjuk: ' + hintsUsed] : []), extra:cfgs,
        note:'Simulasi sederhana berbasis aturan dasar (IP, subnet mask, gateway), bukan emulator perangkat sungguhan.'});
    }, 700);
  }
  drawClues();
  drawGoals();
}

GAME = {
  key:'tracer', title:'Mini Packet Tracer', emoji:'🖧',
  intro:'Atur IP, subnet mask, dan gateway, lalu uji dengan ping dan traceroute. Versi sederhana, tanpa perlu mengetik command.',
  levels:[['Mudah','2 PC dalam satu jaringan, isi IP dan mask'],['Sedang','2 jaringan lewat router, isi IP, mask, dan gateway'],['Sulit','Jaringan sudah jadi tapi ada 3 kesalahan, cari dengan ping dan traceroute']],
  foot:'Rujukan: Modul Sistem Jaringan Komputer, bagian Penerapan (konfigurasi dan pengujian), hal. 44-46.',
  start:startTracer
};
showMenu();
