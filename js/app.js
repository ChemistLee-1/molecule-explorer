// 분자 탐험대 — 화면 전환, 카메라 실물 인식, 채집, 도감
(function () {
  const D = window.GAME_DATA, $ = id => document.getElementById(id);
  const REGULAR = D.ORDER.filter(id => !D.SUBS[id].special);
  const KEY = 'molecule-explorer-v2'; // 물건 목록을 바꾸면서 기록 형식이 달라져 새 키 사용

  // ── 저장 ──
  let save = { found: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) save = JSON.parse(raw); } catch (e) { /* 저장소를 못 쓰면 이번 실행만 유지 */ }
  if (!save.found) save.found = {};
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* 무시 */ } };
  const has = id => !!save.found[id];
  const hasSrc = s => !!(save.found[s.sub] && save.found[s.sub].src[s.key]);
  const countFound = () => REGULAR.filter(has).length;

  // ── 공통 ──
  let current = 'home', toastTimer = 0;
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 's-' + id));
    if (current === 'ar' && id !== 'ar') stopAR();
    current = id;
  }
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
  }
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  // ── 홈 ──
  function renderHome() {
    const n = countFound();
    $('home-count').textContent = n + ' / ' + REGULAR.length;
    $('home-bar').style.width = (n / REGULAR.length) * 100 + '%';
    const list = $('place-list'); list.innerHTML = '';
    D.PLACES.forEach(p => {
      const all = p.zones.flatMap(z => z.sources), got = all.filter(hasSrc).length;
      const b = el('button', 'place', '<span class="em">' + p.emoji + '</span><span class="tx"><b>' + p.name + '</b><span>' + p.zones.map(z => z.name).join(' · ') + '</span></span><span class="pc">' + got + ' / ' + all.length + '</span>');
      b.style.setProperty('--c', p.color);
      b.onclick = () => openPlace(p);
      list.appendChild(b);
    });
  }
  let curPlace = null, curZone = null;
  function openPlace(p) {
    curPlace = p;
    $('zones-title').textContent = p.emoji + ' ' + p.name;
    const list = $('zone-list'); list.innerHTML = '';
    p.zones.forEach(z => {
      const got = z.sources.filter(hasSrc).length;
      const b = el('button', 'zone', '<span class="em">' + z.emoji + '</span><span class="tx"><b>' + z.name + '</b><div class="bar"><i style="width:' + (got / z.sources.length) * 100 + '%"></i></div><small>' + z.items.map(i => i[0]).join(', ') + '</small></span><span class="go">' + got + ' / ' + z.sources.length + ' ›</span>');
      b.onclick = () => enterZone(z);
      list.appendChild(b);
    });
    show('zones');
  }

  // ── 이미지 인식 (기기 안에서 실행) ──
  const vis = { worker: null, ready: false, failed: false, pct: 0, emb: null, nextId: 1, waiting: {} };
  function decode(b64) {
    const bin = atob(b64), v = new Float32Array(bin.length);
    let n = 0;
    for (let i = 0; i < bin.length; i++) { const c = bin.charCodeAt(i); v[i] = c > 127 ? c - 256 : c; n += v[i] * v[i]; }
    n = Math.sqrt(n) || 1;
    for (let i = 0; i < v.length; i++) v[i] /= n;
    return v;
  }
  function initVision() {
    if (vis.worker || vis.failed) return;
    const E = window.CLIP_EMBEDS;
    if (!E || !window.Worker) { vis.failed = true; return; }
    vis.emb = { items: {}, neg: E.negatives.map(decode) };
    Object.keys(E.items).forEach(k => { vis.emb.items[k] = E.items[k].map(decode); });
    try { vis.worker = new Worker('js/vision-worker.js', { type: 'module' }); } catch (e) { vis.failed = true; return; }
    vis.worker.onmessage = e => {
      const m = e.data;
      if (m.type === 'progress') { vis.pct = m.pct; setStatus(); }
      else if (m.type === 'ready') { vis.ready = true; setStatus(); scanSoon(300); }
      else if (m.type === 'embed') { const cb = vis.waiting[m.id]; delete vis.waiting[m.id]; if (cb) cb(new Float32Array(m.vec)); }
      else if (m.type === 'error') {
        const cb = vis.waiting[m.id]; delete vis.waiting[m.id];
        if (cb) cb(null); else { vis.failed = true; setStatus(); }
      }
    };
    vis.worker.onerror = () => { vis.failed = true; setStatus(); };
    vis.worker.postMessage({ type: 'init' });
  }
  const snap = document.createElement('canvas');
  snap.width = snap.height = 224;
  // source(영상·사진)의 가운데 부분을 잘라 임베딩으로 변환
  function embedFrom(source, sw, sh, frac) {
    return new Promise(res => {
      if (!vis.ready || !sw || !sh) return res(null);
      const side = Math.min(sw, sh) * frac, ctx = snap.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(source, (sw - side) / 2, (sh - side) / 2, side, side, 0, 0, 224, 224);
      const d = ctx.getImageData(0, 0, 224, 224), id = vis.nextId++;
      vis.waiting[id] = res;
      vis.worker.postMessage({ type: 'embed', id, data: d.data.buffer, w: 224, h: 224 }, [d.data.buffer]);
    });
  }
  const STRONG = 0.02, WEAK = -0.005; // 인식 기준(여유값). 높일수록 엄격해짐
  const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  // 현재 구역의 물건들을 '상관없는 것' 문구와 비교해 여유값 m 계산 (m이 클수록 확실)
  function classify(vec, zone) {
    const prefix = curPlace.id + '/' + zone.id + '/';
    const score = k => Math.max.apply(null, (vis.emb.items[k] || []).map(e => dot(vec, e)));
    const rows = zone.items.map((it, i) => ({ index: i, s: score(prefix + i) }));
    // 다른 구역의 물건이 훨씬 더 잘 맞으면(예: 주방에서 비누를 비춤) 이 구역 물건이 아님
    let other = -1;
    Object.keys(vis.emb.items).forEach(k => { if (k.indexOf(prefix) !== 0) other = Math.max(other, score(k)); });
    const neg = Math.max.apply(null, vis.emb.neg.map(e => dot(vec, e)));
    rows.forEach(r => { r.m = r.s < 0.25 || r.s < other - 0.012 ? -1 : r.s - neg; });
    return rows.sort((a, b) => b.m - a.m);
  }

  // ── 카메라 탐색 ──
  const ar = { stream: null, timer: 0, busy: false, lastTop: -1, shown: [], shownUntil: 0, photo: false, camOk: false };
  function setStatus(msg) {
    const s = $('ar-status');
    if (msg) { s.textContent = msg; return; }
    if (vis.failed) s.textContent = '⚠ 인식 모델을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 들어와 주세요.';
    else if (!vis.ready) s.textContent = '🧠 AI 인식 모델 준비 중… ' + (vis.pct ? vis.pct + '%' : '') + ' (처음 한 번만 내려받아요)';
    else if (ar.photo) s.textContent = '🖼️ 사진을 분석했어요';
    else if (!ar.camOk) s.textContent = '카메라를 켤 수 없어요. 아래 버튼으로 물건 사진을 찍어 주세요.';
    else s.textContent = '🔍 찾을 물건을 네모 안에 비춰 주세요';
  }
  function enterZone(z) {
    curZone = z;
    $('ar-zone').textContent = z.emoji + ' ' + z.name;
    ar.lastTop = -1; ar.shown = []; ar.shownUntil = 0; ar.camOk = false;
    closePhoto(true);
    renderZoneHud();
    show('ar');
    initVision();
    setStatus();
    startCamera();
  }
  function renderZoneHud() {
    if (!curZone) return;
    const z = curZone;
    $('ar-count').textContent = '발견 ' + z.sources.filter(hasSrc).length + ' / ' + z.sources.length;
    $('ar-list').innerHTML = z.items.map((it, i) => {
      const srcs = z.sources.filter(s => s.itemIndex === i), got = srcs.filter(hasSrc).length;
      return '<span class="tgt' + (got === srcs.length ? ' done' : '') + '">' + it[1] + ' ' + it[0] + ' <b>' + (got === srcs.length ? '✓' : got + '/' + srcs.length) + '</b></span>';
    }).join('');
    renderFound();
  }
  // 인식된 물건과 그 속 물질 버튼
  function renderFound() {
    const box = $('ar-found'); box.innerHTML = '';
    ar.shown.forEach(i => {
      const it = curZone.items[i];
      const row = el('div', 'det', '<div class="det-t">' + it[1] + ' <b>' + it[0] + '</b>을(를) 찾았어요!</div>');
      const btns = el('div', 'det-b');
      curZone.sources.filter(s => s.itemIndex === i).forEach(src => {
        const f = hasSrc(src);
        const b = el('button', 'sub' + (f ? ' got' : ''), f ? '✓ ' + D.SUBS[src.sub].name : '❓ 물질 분석하기');
        b.onclick = () => openSheet(src.sub, src);
        btns.appendChild(b);
      });
      row.appendChild(btns); box.appendChild(row);
    });
    $('s-ar').classList.toggle('detected', ar.shown.length > 0);
  }
  function startCamera() {
    const sec = $('s-ar'), v = $('cam');
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false }).then(st => {
      if (current !== 'ar') { st.getTracks().forEach(t => t.stop()); return; }
      ar.stream = st; v.srcObject = st; sec.classList.add('has-cam'); ar.camOk = true;
      const p = v.play(); if (p && p.catch) p.catch(() => {});
      setStatus(); scanSoon(600);
    }).catch(() => { ar.camOk = false; setStatus(); });
  }
  function stopAR() {
    clearTimeout(ar.timer); ar.timer = 0;
    if (ar.stream) { ar.stream.getTracks().forEach(t => t.stop()); ar.stream = null; }
    $('cam').srcObject = null; $('s-ar').classList.remove('has-cam', 'detected');
  }
  function scanSoon(ms) { clearTimeout(ar.timer); ar.timer = setTimeout(scanLive, ms); }
  async function scanLive() {
    if (current !== 'ar') return;
    const v = $('cam'), sheetOpen = !$('sheet').classList.contains('hidden');
    if (!vis.ready || ar.busy || ar.photo || sheetOpen || !ar.camOk || v.readyState < 2) return scanSoon(500);
    ar.busy = true;
    const zone = curZone, vec = await embedFrom(v, v.videoWidth, v.videoHeight, 0.72);
    ar.busy = false;
    if (current !== 'ar' || zone !== curZone) return;
    if (vec && !ar.photo) {
      const r = classify(vec, zone), top = r[0];
      // 확실하면 바로, 애매하면 두 번 연속 같은 물건일 때 인정
      if (top.m >= STRONG || (top.m >= WEAK && ar.lastTop === top.index)) {
        const list = [top.index];
        if (r[1] && r[1].m >= WEAK && r[1].s >= top.s - 0.015) list.push(r[1].index);
        if (list.join() !== ar.shown.join()) { ar.shown = list; renderFound(); if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* 무시 */ } } }
        ar.shownUntil = Date.now() + 6000;
      } else if (ar.shown.length && Date.now() > ar.shownUntil) { ar.shown = []; renderFound(); }
      ar.lastTop = top.m >= WEAK ? top.index : -1;
    }
    scanSoon(350);
  }
  // 사진으로 찾기 (카메라를 쓸 수 없을 때 / 찍어 둔 사진)
  function closePhoto(silent) {
    ar.photo = false;
    const img = $('ar-photo');
    if (img.src) { try { URL.revokeObjectURL(img.src); } catch (e) { /* 무시 */ } }
    img.removeAttribute('src');
    $('s-ar').classList.remove('has-photo');
    if (!silent) { ar.shown = []; renderFound(); setStatus(); scanSoon(300); }
  }
  $('ar-file').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!vis.ready) return toast(vis.failed ? '인식 모델을 불러오지 못했어요' : 'AI 인식 모델을 준비하고 있어요. 잠시 후 다시 해 주세요');
    const img = $('ar-photo');
    closePhoto(true);
    img.onload = async () => {
      ar.photo = true; $('s-ar').classList.add('has-photo');
      setStatus('🔍 사진을 분석하는 중…');
      const zone = curZone, vec = await embedFrom(img, img.naturalWidth, img.naturalHeight, 1);
      if (!ar.photo || zone !== curZone) return;
      const r = vec ? classify(vec, zone) : [];
      ar.shown = r.length && r[0].m >= WEAK ? [r[0].index].concat(r[1] && r[1].m >= WEAK && r[1].s >= r[0].s - 0.015 ? [r[1].index] : []) : [];
      renderFound();
      setStatus(ar.shown.length ? null : '이 구역의 물건을 찾지 못했어요. 물건이 크게 보이도록 다시 찍어 주세요.');
    };
    img.onerror = () => toast('사진을 열 수 없어요');
    img.src = URL.createObjectURL(f);
  });
  $('ar-photo-close').onclick = () => closePhoto(false);

  // ── 물질 카드 (채집·상세) ──
  const view = new MolView($('mol'));
  const sheet = { sub: null, src: null, prog: 0, holding: false, raf: 0, last: 0, wasNew: false };

  function openSheet(subId, src) {
    const s = D.SUBS[subId], g = D.GROUPS[s.group], sh = $('sheet');
    sheet.sub = s; sheet.src = src || null; sheet.prog = 0; sheet.holding = false;
    const capture = !!src && !hasSrc(src);
    sh.classList.remove('hidden', 'scanning');
    sh.classList.toggle('mystery', capture);
    sh.querySelector('.sheet-inner').scrollTop = 0;
    $('sh-badge').style.setProperty('--g', g.color);
    $('scan-fill').style.width = '0%';
    view.setModel(Chem.build(s.id, s.model));
    view.start();
    if (capture) {
      $('sh-no').textContent = 'No. ???';
      $('sh-badge').textContent = '미확인';
      $('sh-name').textContent = '???';
      $('sh-formula').textContent = '';
      $('sh-signal').textContent = src.emoji + ' ' + src.item + ' 속에서 물질을 찾았어요!';
    } else fillInfo(false);
  }
  function fillInfo(isNew, newPlace) {
    const s = sheet.sub;
    $('sh-no').textContent = s.special ? '특별 카드' : 'No. ' + String(s.no).padStart(2, '0');
    $('sh-badge').textContent = s.cls;
    $('sh-name').textContent = s.name;
    $('sh-formula').textContent = s.formula;
    $('sh-desc').textContent = s.desc;
    $('sh-simple').textContent = s.simple ? '💡 ' + s.simple : '';
    const nt = $('sh-new');
    nt.className = 'newtag' + (isNew || newPlace ? ' on' : '');
    nt.textContent = isNew ? '🎉 새로운 물질을 도감에 등록했어요!' : newPlace ? '📍 새로운 발견 장소를 기록했어요!' : '';
    const m = Chem.build(s.id, s.model), seen = [];
    m.atoms.forEach(a => { if (seen.indexOf(a.el) < 0) seen.push(a.el); });
    $('sh-legend').innerHTML = seen.map(k => '<span><i style="background:' + (k === '*' ? 'transparent;border-style:dashed' : Chem.EL[k].c) + '"></i>' + (k === '*' ? '' : k + ' ') + Chem.EL[k].k + '</span>').join('');
    const ul = $('sh-sources'); ul.innerHTML = '';
    if (s.special) ul.appendChild(el('li', 'ok', s.special.mix + ' <b>섞으면 위험!</b>'));
    s.sources.forEach(src => {
      const ok = hasSrc(src);
      ul.appendChild(el('li', ok ? 'ok' : '', src.emoji + ' ' + src.place.name + ' › ' + src.zone.name + ' › ' + src.item + '<b>' + (ok ? '✓ 발견' : '미발견') + '</b>'));
    });
    $('sh-info').querySelector('h3').style.display = s.special ? 'none' : '';
  }
  function closeSheet() {
    $('sheet').classList.add('hidden');
    view.stop(); cancelAnimationFrame(sheet.raf); sheet.raf = 0; sheet.holding = false;
    if (current === 'ar') { renderZoneHud(); ar.shownUntil = Date.now() + 6000; }
    if (current === 'dex') renderDex();
    if (sheet.wasNew) {
      sheet.wasNew = false;
      const sp = D.SUBS.cl2;
      if (!has('cl2') && sp.special.need.every(has)) {
        save.found.cl2 = { n: 1, src: {}, t: Date.now() }; persist();
        setTimeout(() => { toast('⚠ 특별 안전 카드가 열렸어요!'); openSheet('cl2'); fillInfo(true); }, 350);
      }
    }
  }
  function collect() {
    const s = sheet.sub, src = sheet.src, isNew = !has(s.id);
    if (!save.found[s.id]) save.found[s.id] = { n: 0, src: {}, t: Date.now() };
    save.found[s.id].n++; save.found[s.id].src[src.key] = 1;
    persist();
    sheet.wasNew = isNew;
    $('sheet').classList.remove('mystery', 'scanning');
    fillInfo(isNew, !isNew);
    if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* 무시 */ } }
  }
  function scanLoop(t) {
    const dt = Math.min(60, t - (sheet.last || t)); sheet.last = t;
    sheet.prog += (sheet.holding ? dt : -dt * 0.8) / 1300;
    sheet.prog = Math.max(0, Math.min(1, sheet.prog));
    $('scan-fill').style.width = sheet.prog * 100 + '%';
    if (sheet.prog >= 1) { sheet.raf = 0; sheet.holding = false; collect(); return; }
    if (!sheet.holding && sheet.prog <= 0) { sheet.raf = 0; return; }
    sheet.raf = requestAnimationFrame(scanLoop);
  }
  (function () {
    const b = $('btn-scan');
    b.addEventListener('pointerdown', e => {
      e.preventDefault(); sheet.holding = true; sheet.last = 0;
      $('sheet').classList.add('scanning');
      if (!sheet.raf) sheet.raf = requestAnimationFrame(scanLoop);
    });
    const up = () => { sheet.holding = false; $('sheet').classList.remove('scanning'); };
    b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
    b.addEventListener('contextmenu', e => e.preventDefault());
  })();
  $('sheet-close').onclick = closeSheet;
  $('btn-ok').onclick = closeSheet;

  // ── 도감 ──
  let filter = 'all', dexFrom = 'home';
  function renderDex() {
    $('dex-count').textContent = countFound() + ' / ' + REGULAR.length;
    const fs = $('dex-filters'); fs.innerHTML = '';
    const opts = [['all', '전체']].concat(D.PLACES.map(p => ['p:' + p.id, p.emoji + ' ' + p.name]), Object.keys(D.GROUPS).map(k => ['g:' + k, D.GROUPS[k].name]));
    opts.forEach(o => {
      const b = el('button', 'fchip' + (filter === o[0] ? ' on' : ''), o[1]);
      b.onclick = () => { filter = o[0]; renderDex(); };
      fs.appendChild(b);
    });
    const grid = $('dex-grid'); grid.innerHTML = '';
    D.ORDER.forEach(id => {
      const s = D.SUBS[id];
      if (filter[0] === 'p' && !s.sources.some(x => x.place.id === filter.slice(2))) return;
      if (filter[0] === 'g' && s.group !== filter.slice(2)) return;
      const got = has(id), long = s.formula.length > 7;
      const c = el('button', 'dex-card ' + (got ? 'got' : 'lock') + (s.special ? ' sp' : ''),
        '<span class="n">' + (s.special ? '★' : String(s.no).padStart(2, '0')) + '</span>' + (got ? '<span class="dot"></span>' : '') +
        '<span class="f' + (got && long ? ' long' : '') + '">' + (got ? s.formula : '?') + '</span><span class="nm">' + (got ? s.name : '미발견') + '</span>');
      c.style.setProperty('--g', D.GROUPS[s.group].color);
      c.onclick = () => {
        if (got) return openSheet(id);
        if (s.special) return toast('🔒 ' + s.special.hint);
        const z = s.sources[0];
        toast('🔍 힌트: ' + z.place.name + ' › ' + z.zone.name + '에서 찾을 수 있어요');
      };
      grid.appendChild(c);
    });
  }
  function openDex(from) { dexFrom = from; renderDex(); show('dex'); }

  // ── 버튼 연결 ──
  $('btn-dex').onclick = () => openDex('home');
  $('ar-dex').onclick = () => openDex('zones');
  $('dex-back').onclick = () => { if (dexFrom === 'zones' && curPlace) openPlace(curPlace); else { renderHome(); show('home'); } };
  $('ar-back').onclick = () => openPlace(curPlace);
  document.querySelectorAll('[data-go="home"]').forEach(b => { b.onclick = () => { renderHome(); show('home'); }; });
  $('btn-reset').onclick = () => {
    if (confirm('지금까지 모은 도감 기록을 모두 지울까요?')) { save = { found: {} }; persist(); renderHome(); toast('기록을 초기화했어요'); }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && current === 'ar') scanSoon(400); });

  renderHome();
})();
