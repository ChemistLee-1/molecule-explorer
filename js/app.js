// 분자 탐험대 — 화면 전환, AR 탐색, 채집, 도감
(function () {
  const D = window.GAME_DATA, $ = id => document.getElementById(id);
  const REGULAR = D.ORDER.filter(id => !D.SUBS[id].special);
  const KEY = 'molecule-explorer-v1';

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

  // ── AR 탐색 ──
  const ar = { orbs: [], raf: 0, stream: null, gyro: null, gyroOn: false, dyaw: 0, dpitch: 0, yaw: 0, pitch: 0, ptr: null };
  const wrap = a => { a = (a + 180) % 360; if (a < 0) a += 360; return a - 180; };

  function onOrient(e) {
    if (e.alpha == null || e.beta == null) return;
    const r = Math.PI / 180, a = e.alpha * r, b = e.beta * r, g = (e.gamma || 0) * r;
    const cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b), cG = Math.cos(g), sG = Math.sin(g);
    // 휴대폰 뒷면(카메라)이 향하는 방향
    const fx = -(cG * sA * sB + cA * sG), fy = -(sA * sG - cA * cG * sB), fz = -cB * cG;
    const yaw = Math.atan2(fx, fy) / r, pitch = Math.asin(Math.max(-1, Math.min(1, fz))) / r;
    if (!ar.gyro) ar.gyro = { yaw, pitch };
    else { ar.gyro.yaw += wrap(yaw - ar.gyro.yaw) * 0.35; ar.gyro.pitch += (pitch - ar.gyro.pitch) * 0.35; }
    if (!ar.gyroOn) { ar.gyroOn = true; ar.dyaw -= ar.gyro.yaw; ar.dpitch = 0; setHint(); }
  }
  function setHint() {
    $('ar-hint').textContent = ar.gyroOn ? '휴대폰을 돌려 주변을 둘러보고, 신호를 터치하세요' : '화면을 밀어 주변을 둘러보고, 신호를 터치하세요';
  }

  function enterZone(z) {
    curZone = z;
    $('ar-zone').textContent = z.emoji + ' ' + z.name;
    const box = $('orbs'); box.innerHTML = ''; ar.orbs = [];
    const n = z.items.length;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807 + z.id.length * 31) % 2147483647; return (seed % 1000) / 1000; };
    z.sources.forEach(src => {
      const sibs = z.sources.filter(s => s.itemIndex === src.itemIndex), k = sibs.indexOf(src);
      const yaw = src.itemIndex * (360 / n) + (k - (sibs.length - 1) / 2) * 17 + (rnd() - 0.5) * 8;
      const pitch = -16 + rnd() * 38 + (k % 2 ? 9 : 0);
      const e = el('div', 'orb', '<div class="ball">' + src.emoji + '</div><span class="lb"></span>');
      box.appendChild(e);
      const orb = { src, yaw, pitch, e };
      e._orb = orb; ar.orbs.push(orb);
    });
    refreshOrbs();
    ar.dyaw = 0; ar.dpitch = 0; ar.gyro = null; ar.gyroOn = false;
    setHint();
    show('ar');
    startSensors();
    if (!ar.raf) ar.raf = requestAnimationFrame(arLoop);
  }
  function refreshOrbs() {
    ar.orbs.forEach(o => {
      const f = hasSrc(o.src);
      o.e.classList.toggle('found', f);
      o.e.querySelector('.lb').textContent = f ? D.SUBS[o.src.sub].name : o.src.item;
    });
    if (curZone) $('ar-count').textContent = '발견 ' + curZone.sources.filter(hasSrc).length + ' / ' + curZone.sources.length;
  }
  function startSensors() {
    const sec = $('s-ar'), v = $('cam');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(st => {
        if (current !== 'ar') { st.getTracks().forEach(t => t.stop()); return; }
        ar.stream = st; v.srcObject = st; sec.classList.add('has-cam');
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      }).catch(() => { toast('카메라를 쓸 수 없어 가상 배경으로 탐색해요'); });
    }
    const listen = () => window.addEventListener('deviceorientation', onOrient);
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') listen(); }).catch(() => {});
    } else if (window.DeviceOrientationEvent) listen();
  }
  function stopAR() {
    cancelAnimationFrame(ar.raf); ar.raf = 0;
    window.removeEventListener('deviceorientation', onOrient);
    if (ar.stream) { ar.stream.getTracks().forEach(t => t.stop()); ar.stream = null; }
    $('cam').srcObject = null; $('s-ar').classList.remove('has-cam');
  }
  function arLoop() {
    ar.raf = requestAnimationFrame(arLoop);
    const sec = $('s-ar'), W = sec.clientWidth, H = sec.clientHeight;
    if (!W) return;
    const rad = Math.PI / 180, f = W / 2 / Math.tan(32 * rad);
    ar.yaw = (ar.gyro ? ar.gyro.yaw : 0) + ar.dyaw;
    ar.pitch = Math.max(-70, Math.min(70, (ar.gyro ? ar.gyro.pitch : 0) + ar.dpitch));
    let best = null;
    ar.orbs.forEach(o => {
      const dx = wrap(o.yaw - ar.yaw), dy = o.pitch - ar.pitch;
      const vis = Math.abs(dx) < 75;
      o.e.style.display = vis ? '' : 'none';
      if (vis) {
        const x = W / 2 + Math.tan(dx * rad) * f, y = H / 2 - Math.tan(dy * rad) * f;
        const s = 1 - Math.min(0.3, Math.abs(dx) / 150);
        o.e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      }
      if (!hasSrc(o.src) && (!best || Math.abs(dx) < Math.abs(best))) best = dx;
    });
    $('ar-arrow-l').classList.toggle('on', best != null && best < -26);
    $('ar-arrow-r').classList.toggle('on', best != null && best > 26);
  }
  // 화면 밀기(둘러보기)와 터치(채집) 구분
  (function () {
    const sec = $('s-ar');
    sec.addEventListener('pointerdown', e => {
      if (e.target.closest('.ar-top')) return;
      ar.ptr = { x: e.clientX, y: e.clientY, moved: 0, orb: e.target.closest('.orb') };
    });
    sec.addEventListener('pointermove', e => {
      if (!ar.ptr) return;
      const dx = e.clientX - ar.ptr.x, dy = e.clientY - ar.ptr.y;
      ar.ptr.moved += Math.abs(dx) + Math.abs(dy);
      ar.ptr.x = e.clientX; ar.ptr.y = e.clientY;
      if (ar.ptr.moved > 8) { ar.dyaw -= dx * 0.16; ar.dpitch += dy * 0.16; }
    });
    const end = () => {
      const p = ar.ptr; ar.ptr = null;
      if (p && p.orb && p.moved <= 8 && p.orb._orb) openSheet(p.orb._orb.src.sub, p.orb._orb.src);
    };
    sec.addEventListener('pointerup', end);
    sec.addEventListener('pointercancel', () => { ar.ptr = null; });
  })();

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
      $('sh-signal').textContent = src.emoji + ' ' + src.item + '에서 물질 신호를 찾았어요!';
    } else fillInfo(false);
  }
  function fillInfo(isNew, newPlace) {
    const s = sheet.sub, g = D.GROUPS[s.group];
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
    if (s.special) ul.appendChild(el('li', 'ok', '🧪 락스 + 🧪 묽은 염산 <b>섞으면 위험!</b>'));
    s.sources.forEach(src => {
      const ok = hasSrc(src);
      ul.appendChild(el('li', ok ? 'ok' : '', src.emoji + ' ' + src.place.name + ' › ' + src.zone.name + ' › ' + src.item + '<b>' + (ok ? '✓ 발견' : '미발견') + '</b>'));
    });
    $('sh-info').querySelector('h3').style.display = s.special ? 'none' : '';
  }
  function closeSheet() {
    $('sheet').classList.add('hidden');
    view.stop(); cancelAnimationFrame(sheet.raf); sheet.raf = 0; sheet.holding = false;
    if (current === 'ar') refreshOrbs();
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
  document.addEventListener('visibilitychange', () => { if (document.hidden && current === 'ar') openPlace(curPlace); });

  renderHome();
})();
