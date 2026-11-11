// 분자 모형 생성기: SMILES(연결 정보) → 3차원 좌표, 결정·금속·흑연 모형
window.Chem = (function () {
  // c: 색, r: 공유 반지름(Å), v: 원자가, k: 한글 이름
  const EL = {
    H: { c: '#f1f5f9', r: 0.31, v: [1], k: '수소' },
    C: { c: '#6b7280', r: 0.76, v: [4], k: '탄소' },
    N: { c: '#3b82f6', r: 0.71, v: [3], k: '질소' },
    O: { c: '#ef4444', r: 0.66, v: [2], k: '산소' },
    F: { c: '#7ee0a0', r: 0.57, v: [1], k: '플루오린' },
    Na: { c: '#a78bfa', r: 1.66, v: [1], k: '나트륨' },
    Mg: { c: '#84cc16', r: 1.41, v: [2], k: '마그네슘' },
    Al: { c: '#cbd5e1', r: 1.21, v: [3], k: '알루미늄' },
    Si: { c: '#e0b97a', r: 1.11, v: [4], k: '규소' },
    P: { c: '#fb923c', r: 1.07, v: [3, 5], k: '인' },
    Cr: { c: '#8fb4c9', r: 1.39, v: [3], k: '크로뮴' },
    Ni: { c: '#9fd4a3', r: 1.24, v: [2], k: '니켈' },
    S: { c: '#facc15', r: 1.05, v: [2, 4, 6], k: '황' },
    Cl: { c: '#22c55e', r: 1.02, v: [1], k: '염소' },
    K: { c: '#c084fc', r: 2.03, v: [1], k: '칼륨' },
    Ca: { c: '#f5d0a9', r: 1.76, v: [2], k: '칼슘' },
    Ti: { c: '#b0bec5', r: 1.6, v: [4], k: '타이타늄' },
    Mn: { c: '#b06ad9', r: 1.39, v: [4], k: '망가니즈' },
    Fe: { c: '#e07a3a', r: 1.32, v: [3], k: '철' },
    Cu: { c: '#c87533', r: 1.32, v: [2], k: '구리' },
    Zn: { c: '#8aa0c8', r: 1.22, v: [2], k: '아연' },
    Br: { c: '#b4532a', r: 1.2, v: [1], k: '브로민' },
    Sn: { c: '#7f9aa8', r: 1.39, v: [4], k: '주석' },
    Ar: { c: '#67e8f9', r: 1.06, v: [0], k: '아르곤' },
    '*': { c: '#94a3b8', r: 0.5, v: [1], k: '계속 이어짐' },
  };
  const METALS = { Mg: 1, Fe: 1, Mn: 1, Ti: 1, Zn: 1, Cu: 1, Na: 1, K: 1, Ca: 1, Al: 1, Sn: 1 };

  function rng(seedStr) {
    let h = 1779033703;
    for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353), h = (h << 13) | (h >>> 19);
    let a = h >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── SMILES 해석 ──
  function parseSmiles(s) {
    const atoms = [], bonds = [], stack = [], rings = {};
    let prev = -1, order = 0, i = 0;
    function addBond(a, b, o) { bonds.push({ a, b, o }); atoms[a].nb.push(b); atoms[b].nb.push(a); }
    function addAtom(el, arom, charge, h, br) {
      atoms.push({ el, arom, charge, h, br, nb: [] });
      const idx = atoms.length - 1;
      if (prev >= 0) addBond(prev, idx, order || (arom && atoms[prev].arom ? 1.5 : 1));
      prev = idx; order = 0;
    }
    while (i < s.length) {
      const ch = s[i];
      if (ch === '(') { stack.push(prev); i++; }
      else if (ch === ')') { prev = stack.pop(); i++; }
      else if (ch === '.') { prev = -1; order = 0; i++; }
      else if (ch === '-') { order = 1; i++; }
      else if (ch === '=') { order = 2; i++; }
      else if (ch === '#') { order = 3; i++; }
      else if (ch === ':') { order = 1.5; i++; }
      else if (ch === '[') {
        const m = /^\[([A-Z][a-z]?|[a-z]|\*)(H(\d*))?([+-]\d*)?\]/.exec(s.slice(i));
        if (!m) throw new Error('SMILES 오류: ' + s + ' @' + i);
        let sym = m[1], arom = false;
        if (/^[a-z]$/.test(sym)) { arom = true; sym = sym.toUpperCase(); }
        const h = m[2] ? (m[3] ? +m[3] : 1) : 0;
        let charge = 0;
        if (m[4]) charge = (m[4][0] === '+' ? 1 : -1) * (m[4].length > 1 ? +m[4].slice(1) : 1);
        addAtom(sym, arom, charge, h, true);
        i += m[0].length;
      } else if (/\d/.test(ch)) {
        const r = rings[ch];
        if (r) {
          addBond(r.a, prev, order || r.o || (atoms[prev].arom && atoms[r.a].arom ? 1.5 : 1));
          delete rings[ch];
        } else rings[ch] = { a: prev, o: order };
        order = 0; i++;
      } else {
        const two = s.substr(i, 2);
        if (two === 'Cl' || two === 'Br') { addAtom(two, false, 0, null, false); i += 2; }
        else if (/[a-z]/.test(ch)) { addAtom(ch.toUpperCase(), true, 0, null, false); i++; }
        else if (EL[ch]) { addAtom(ch, false, 0, null, false); i++; }
        else throw new Error('SMILES 오류: ' + s + ' @' + i);
      }
    }
    // 생략된 수소 채우기
    const sum = atoms.map(() => 0);
    bonds.forEach(b => { sum[b.a] += b.o; sum[b.b] += b.o; });
    const heavy = atoms.length;
    for (let k = 0; k < heavy; k++) {
      const a = atoms[k];
      let nh;
      if (a.br) nh = a.h;
      else if (a.el === '*') nh = 0;
      else {
        const used = a.arom ? a.nb.length + (a.el === 'C' || a.el === 'N' ? 1 : 0) : Math.ceil(sum[k]);
        const vs = EL[a.el].v;
        let val = vs[vs.length - 1];
        for (const v of vs) if (v >= used) { val = v; break; }
        nh = Math.max(0, val - used);
      }
      for (let j = 0; j < nh; j++) {
        atoms.push({ el: 'H', arom: false, charge: 0, nb: [k] });
        a.nb.push(atoms.length - 1);
        bonds.push({ a: k, b: atoms.length - 1, o: 1 });
      }
    }
    return { atoms, bonds };
  }

  // ── 3차원 배치 (결합 길이·각도 조건을 반복해서 맞춤) ──
  function layout(mol, seed) {
    const A = mol.atoms, B = mol.bonds, n = A.length, rand = rng(seed);
    const P = new Float64Array(n * 3);
    const bo = {};
    B.forEach(b => { bo[b.a + '_' + b.b] = b.o; bo[b.b + '_' + b.a] = b.o; });
    const ru = () => {
      let x, y, z, l;
      do { x = rand() * 2 - 1; y = rand() * 2 - 1; z = rand() * 2 - 1; l = x * x + y * y + z * z; } while (l > 1 || l < 0.01);
      l = Math.sqrt(l); return [x / l, y / l, z / l];
    };
    // 조각(fragment) 나누기 + 초기 위치
    const frag = new Int32Array(n).fill(-1);
    let nf = 0;
    for (let s0 = 0; s0 < n; s0++) {
      if (frag[s0] >= 0) continue;
      const o = ru(), sc = s0 === 0 ? 0 : 3;
      P[s0 * 3] = o[0] * sc; P[s0 * 3 + 1] = o[1] * sc; P[s0 * 3 + 2] = o[2] * sc;
      frag[s0] = nf;
      const q = [[s0, -1]];
      while (q.length) {
        const [c, par] = q.shift();
        for (const m of A[c].nb) {
          if (frag[m] >= 0) continue;
          frag[m] = nf;
          const d = ru();
          if (par >= 0) {
            let bx = P[c * 3] - P[par * 3], by = P[c * 3 + 1] - P[par * 3 + 1], bz = P[c * 3 + 2] - P[par * 3 + 2];
            const bl = Math.hypot(bx, by, bz) || 1;
            d[0] += (bx / bl) * 1.3; d[1] += (by / bl) * 1.3; d[2] += (bz / bl) * 1.3;
          }
          const dl = Math.hypot(d[0], d[1], d[2]) || 1;
          P[m * 3] = P[c * 3] + (d[0] / dl) * 1.5; P[m * 3 + 1] = P[c * 3 + 1] + (d[1] / dl) * 1.5; P[m * 3 + 2] = P[c * 3 + 2] + (d[2] / dl) * 1.5;
          q.push([m, c]);
        }
      }
      nf++;
    }
    const blen = (i, j) => {
      const o = bo[i + '_' + j];
      return (EL[A[i].el].r + EL[A[j].el].r) * (o === 3 ? 0.78 : o === 2 ? 0.87 : o === 1.5 ? 0.92 : 1);
    };
    function ringSize(a, c, b) {
      const seen = { [a]: 0, [c]: -1 }, q = [a];
      while (q.length) {
        const x = q.shift();
        if (seen[x] >= 5) continue;
        for (const m of A[x].nb) {
          if (m === c || seen[m] !== undefined) continue;
          if (m === b) return seen[x] + 3;
          seen[m] = seen[x] + 1; q.push(m);
        }
      }
      return 0;
    }
    function centerAngle(c) {
      const nb = A[c].nb;
      let dbl = 0, tri = 0, ar = A[c].arom ? 1 : 0;
      nb.forEach(m => { const o = bo[c + '_' + m]; if (o === 2) dbl++; else if (o === 3) tri++; else if (o === 1.5) ar++; });
      if (nb.length >= 4) return 109.5;
      if (nb.length === 3) return dbl || ar ? 120 : 109.5;
      if (tri || dbl >= 2) return 180;
      if (dbl || ar) return 120;
      if (A[c].el === 'O' && nb.every(m => A[m].el === 'H')) return 104.5;
      return 109.5;
    }
    // 거리 조건: 결합(1-2), 각도(1-3)
    const cons = [], excl = new Uint8Array(n * n), planar = [];
    B.forEach(b => { cons.push([b.a, b.b, blen(b.a, b.b), 1]); excl[b.a * n + b.b] = excl[b.b * n + b.a] = 1; });
    for (let c = 0; c < n; c++) {
      const nb = A[c].nb;
      if (nb.length < 2) continue;
      const base = centerAngle(c), skip = METALS[A[c].el] && nb.length > 2;
      if (nb.length === 3 && base === 120) planar.push([c, nb[0], nb[1], nb[2]]);
      for (let x = 0; x < nb.length; x++) for (let y = x + 1; y < nb.length; y++) {
        const a = nb[x], b = nb[y];
        excl[a * n + b] = excl[b * n + a] = 1;
        if (skip || bo[a + '_' + b]) continue;
        let ang = base;
        const rs = ringSize(a, c, b);
        if (rs >= 3 && rs <= 5) ang = (180 * (rs - 2)) / rs;
        const d1 = blen(c, a), d2 = blen(c, b), t = (ang * Math.PI) / 180;
        cons.push([a, b, Math.sqrt(d1 * d1 + d2 * d2 - 2 * d1 * d2 * Math.cos(t)), 0.8]);
      }
    }
    const N = n > 40 ? 800 : 500;
    for (let it = 0; it < N + 40; it++) {
      const t = Math.max(0, 1 - it / N), polish = it >= N; // 마지막 40회는 결합 길이·각도만 다듬음
      for (const [i, j, d0, k] of cons) {
        const dx = P[j * 3] - P[i * 3], dy = P[j * 3 + 1] - P[i * 3 + 1], dz = P[j * 3 + 2] - P[i * 3 + 2];
        const d = Math.hypot(dx, dy, dz) || 1e-6, f = ((d - d0) / d) * 0.5 * k;
        P[i * 3] += dx * f; P[i * 3 + 1] += dy * f; P[i * 3 + 2] += dz * f;
        P[j * 3] -= dx * f; P[j * 3 + 1] -= dy * f; P[j * 3 + 2] -= dz * f;
      }
      if (polish) continue;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        if (excl[i * n + j]) continue;
        const dx = P[j * 3] - P[i * 3], dy = P[j * 3 + 1] - P[i * 3 + 1], dz = P[j * 3 + 2] - P[i * 3 + 2];
        const d = Math.hypot(dx, dy, dz) || 1e-6;
        const hi = A[i].el === 'H', hj = A[j].el === 'H';
        let f = 0;
        if (frag[i] === frag[j]) {
          const dmin = hi && hj ? 1.9 : hi || hj ? 2.2 : 2.6;
          if (d < dmin) f = (-(dmin - d) / d) * 0.5;
          else if (it < N * 0.75) f = (-0.12 * t) / (d * d * d);
        } else {
          const qi = A[i].charge, qj = A[j].charge;
          if (qi * qj < 0) {
            const d0 = EL[A[i].el].r + EL[A[j].el].r;
            f = d > d0 ? ((d - d0) / d) * 0.06 : ((d - d0) / d) * 0.5;
          } else {
            const dmin = qi * qj > 0 ? 3.6 : hi || hj ? 2.3 : 2.9;
            if (d < dmin) f = (-(dmin - d) / d) * 0.5;
          }
        }
        if (f) {
          P[i * 3] += dx * f; P[i * 3 + 1] += dy * f; P[i * 3 + 2] += dz * f;
          P[j * 3] -= dx * f; P[j * 3 + 1] -= dy * f; P[j * 3 + 2] -= dz * f;
        }
      }
      // 평면 구조(이중 결합·벤젠 고리) 유지
      for (const [c, a, b, e] of planar) {
        const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2];
        const vx = P[e * 3] - P[a * 3], vy = P[e * 3 + 1] - P[a * 3 + 1], vz = P[e * 3 + 2] - P[a * 3 + 2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const nl = Math.hypot(nx, ny, nz);
        if (nl < 1e-6) continue;
        nx /= nl; ny /= nl; nz /= nl;
        const h = (P[c * 3] - P[a * 3]) * nx + (P[c * 3 + 1] - P[a * 3 + 1]) * ny + (P[c * 3 + 2] - P[a * 3 + 2]) * nz;
        P[c * 3] -= nx * h * 0.5; P[c * 3 + 1] -= ny * h * 0.5; P[c * 3 + 2] -= nz * h * 0.5;
        for (const m of [a, b, e]) { P[m * 3] += (nx * h) / 6; P[m * 3 + 1] += (ny * h) / 6; P[m * 3 + 2] += (nz * h) / 6; }
      }
      if (nf > 1) { // 떨어진 조각(이온)을 통째로 가운데 쪽으로 모음
        const cen = new Float64Array(nf * 4);
        for (let i = 0; i < n; i++) { const g = frag[i] * 4; cen[g] += P[i * 3]; cen[g + 1] += P[i * 3 + 1]; cen[g + 2] += P[i * 3 + 2]; cen[g + 3]++; }
        for (let i = 0; i < n; i++) { const g = frag[i] * 4, w = 0.02 / cen[g + 3]; P[i * 3] -= cen[g] * w; P[i * 3 + 1] -= cen[g + 1] * w; P[i * 3 + 2] -= cen[g + 2] * w; }
      }
      if (it < N / 3) for (let i = 0; i < n * 3; i++) P[i] += (rand() - 0.5) * 0.08 * t;
    }
    return finish(A.map((a, i) => ({ el: a.el, charge: a.charge || 0, x: P[i * 3], y: P[i * 3 + 1], z: P[i * 3 + 2] })), B.map(b => ({ a: b.a, b: b.b, o: b.o })));
  }

  // 가운데 정렬 + 넓은 면이 정면을 보도록 회전
  function finish(atoms, bonds, keepAxes) {
    const n = atoms.length;
    let cx = 0, cy = 0, cz = 0;
    atoms.forEach(a => { cx += a.x; cy += a.y; cz += a.z; });
    atoms.forEach(a => { a.x -= cx / n; a.y -= cy / n; a.z -= cz / n; });
    if (!keepAxes && n > 2) {
      const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      atoms.forEach(a => { const p = [a.x, a.y, a.z]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += p[i] * p[j]; });
      const power = M => {
        let v = [0.6, 0.5, 0.62];
        for (let k = 0; k < 60; k++) {
          const w = [0, 1, 2].map(i => M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2]);
          const l = Math.hypot(w[0], w[1], w[2]) || 1; v = w.map(x => x / l);
        }
        return v;
      };
      const v1 = power(C);
      const l1 = [0, 1, 2].reduce((s, i) => s + v1[i] * (C[i][0] * v1[0] + C[i][1] * v1[1] + C[i][2] * v1[2]), 0);
      const C2 = C.map((r, i) => r.map((x, j) => x - l1 * v1[i] * v1[j]));
      let v2 = power(C2);
      const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
      v2 = v2.map((x, i) => x - dot * v1[i]);
      const l2 = Math.hypot(v2[0], v2[1], v2[2]);
      if (l2 > 1e-6) {
        v2 = v2.map(x => x / l2);
        const v3 = [v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]];
        atoms.forEach(a => {
          const p = [a.x, a.y, a.z];
          a.x = p[0] * v1[0] + p[1] * v1[1] + p[2] * v1[2];
          a.y = p[0] * v2[0] + p[1] * v2[1] + p[2] * v2[2];
          a.z = p[0] * v3[0] + p[1] * v3[1] + p[2] * v3[2];
        });
      }
    }
    let R = 0;
    atoms.forEach(a => { R = Math.max(R, Math.hypot(a.x, a.y, a.z) + 0.3 + EL[a.el].r * 0.3); });
    return { atoms, bonds, radius: R };
  }

  function bondNear(atoms, dist, tol) {
    const bonds = [];
    for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) {
      const d = Math.hypot(atoms[i].x - atoms[j].x, atoms[i].y - atoms[j].y, atoms[i].z - atoms[j].z);
      if (Math.abs(d - dist) < tol) bonds.push({ a: i, b: j, o: 1, thin: true });
    }
    return bonds;
  }

  // 염화나트륨형 결정: 두 이온이 번갈아 쌓임
  function rocksalt(a, b) {
    const atoms = [], d = 2.6;
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const first = (x + y + z + 30) % 2 === 0;
      atoms.push({ el: first ? b : a, charge: first ? -1 : 1, x: x * d, y: y * d, z: z * d });
    }
    return finish(atoms, bondNear(atoms, d, 0.1), true);
  }

  // 금속 결정(면심 입방 단위 격자). b가 있으면 합금으로 일부 원자를 바꿈
  function metal(a, b) {
    const atoms = [], L = 3.9, h = L / 2;
    [-1, 1].forEach(x => [-1, 1].forEach(y => [-1, 1].forEach(z => atoms.push({ el: a, charge: 0, x: x * h, y: y * h, z: z * h }))));
    [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(p => atoms.push({ el: a, charge: 0, x: p[0] * h, y: p[1] * h, z: p[2] * h }));
    if (b) [2, 9, 12].forEach(i => { atoms[i].el = b; });
    return finish(atoms, bondNear(atoms, L / Math.SQRT2, 0.1), true);
  }

  // 흑연: 탄소 육각형 판
  function graphite(layers) {
    const atoms = [], d = 1.42, s3 = Math.sqrt(3);
    for (let l = 0; l < layers; l++) {
      const zz = (l - (layers - 1) / 2) * 3.35, ox = l % 2 ? (s3 / 2) * d : 0, oy = l % 2 ? d / 2 : 0;
      for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) for (let k = 0; k < 2; k++) {
        const x = (i + j / 2) * s3 * d, y = j * 1.5 * d + k * d + d; // 육각형 중심이 원점
        if (Math.hypot(x, y) < 3.9) atoms.push({ el: 'C', charge: 0, x: x + ox, y: zz, z: y + oy });
      }
    }
    const m = finish(atoms, bondNear(atoms, d, 0.1), true);
    m.bonds.forEach(b => { b.thin = false; b.o = 1.5; });
    return m;
  }

  const cache = {};
  function build(id, model) {
    if (cache[id]) return cache[id];
    let m;
    if (model.type === 'rocksalt') m = rocksalt(model.a, model.b);
    else if (model.type === 'metal') m = metal(model.a, model.b);
    else if (model.type === 'graphite') m = graphite(model.layers);
    else m = layout(parseSmiles(model.smiles), id);
    m.lattice = !!model.type;
    return (cache[id] = m);
  }

  return { EL, build, parseSmiles };
})();
