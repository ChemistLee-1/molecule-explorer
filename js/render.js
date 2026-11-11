// 공-막대 분자 모형 뷰어 (캔버스 2D, 손가락으로 돌려 보기)
window.MolView = (function () {
  const EL = Chem.EL;
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f > 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  }
  const PAL = {};
  Object.keys(EL).forEach(k => { PAL[k] = { hi: shade(EL[k].c, 0.65), mid: EL[k].c, lo: shade(EL[k].c, -0.55), bond: shade(EL[k].c, -0.15) }; });

  function MolView(canvas) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.rx = -0.3; this.ry = 0.4; this.model = null; this.raf = 0; this.drag = null; this.last = 0;
    const down = e => { this.drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); };
    const move = e => {
      if (!this.drag) return;
      this.ry += (e.clientX - this.drag.x) * 0.012; this.rx += (e.clientY - this.drag.y) * 0.012;
      this.drag = { x: e.clientX, y: e.clientY };
    };
    const up = () => { this.drag = null; };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  }
  MolView.prototype.setModel = function (m) { this.model = m; this.rx = -0.3; this.ry = 0.4; };
  MolView.prototype.start = function () {
    if (this.raf) return;
    const loop = t => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(50, t - (this.last || t)); this.last = t;
      if (!this.drag) this.ry += dt * 0.0006;
      this.draw();
    };
    this.raf = requestAnimationFrame(loop);
  };
  MolView.prototype.stop = function () { cancelAnimationFrame(this.raf); this.raf = 0; this.last = 0; };
  MolView.prototype.draw = function () {
    const c = this.c, ctx = this.ctx, m = this.model;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!m) return;
    const R = Math.max(m.radius, 1.6), sc = (Math.min(w, h) / 2 / R) * 0.9, D = R * 5;
    const cy = Math.cos(this.ry), sy = Math.sin(this.ry), cx = Math.cos(this.rx), sx = Math.sin(this.rx);
    const pts = m.atoms.map(a => {
      const x1 = a.x * cy + a.z * sy, z1 = -a.x * sy + a.z * cy;
      const y2 = a.y * cx - z1 * sx, z2 = a.y * sx + z1 * cx;
      const p = D / (D - z2);
      const rr = a.el === 'H' ? 0.3 : m.lattice ? 0.26 + EL[a.el].r * 0.3 : 0.26 + EL[a.el].r * 0.27;
      return { x: w / 2 + x1 * sc * p, y: h / 2 + y2 * sc * p, z: z2, r: rr * sc * p, a };
    });
    const items = pts.map((p, i) => ({ z: p.z, i }));
    m.bonds.forEach(b => items.push({ z: (pts[b.a].z + pts[b.b].z) / 2 - 0.01, b }));
    items.sort((p, q) => p.z - q.z);
    ctx.lineCap = 'round';
    for (const it of items) {
      if (it.b) {
        const A = pts[it.b.a], B = pts[it.b.b];
        let dx = B.x - A.x, dy = B.y - A.y;
        const len = Math.hypot(dx, dy);
        if (len < 1) continue;
        dx /= len; dy /= len;
        const sa = Math.min(A.r * 0.7, len / 2), sb = Math.min(B.r * 0.7, len / 2);
        const x1 = A.x + dx * sa, y1 = A.y + dy * sa, x2 = B.x - dx * sb, y2 = B.y - dy * sb;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const bw = sc * (it.b.thin ? 0.07 : 0.15), o = it.b.o;
        const lines = o === 3 ? [-1.3, 0, 1.3] : o === 2 ? [-0.75, 0.75] : o === 1.5 ? [-0.6, 0.6] : [0];
        lines.forEach((off, li) => {
          const ox = -dy * off * bw, oy = dx * off * bw;
          ctx.lineWidth = o === 1 ? bw : bw * 0.62;
          ctx.globalAlpha = it.b.thin ? 0.55 : o === 1.5 && li === 1 ? 0.45 : 1;
          ctx.strokeStyle = PAL[A.a.el].bond;
          ctx.beginPath(); ctx.moveTo(x1 + ox, y1 + oy); ctx.lineTo(mx + ox, my + oy); ctx.stroke();
          ctx.strokeStyle = PAL[B.a.el].bond;
          ctx.beginPath(); ctx.moveTo(mx + ox, my + oy); ctx.lineTo(x2 + ox, y2 + oy); ctx.stroke();
        });
        ctx.globalAlpha = 1;
      } else {
        const p = pts[it.i], pal = PAL[p.a.el];
        if (p.a.el === '*') {
          ctx.setLineDash([p.r * 0.5, p.r * 0.4]); ctx.lineWidth = Math.max(1.2, p.r * 0.16); ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
          continue;
        }
        const g = ctx.createRadialGradient(p.x - p.r * 0.35, p.y - p.r * 0.4, p.r * 0.08, p.x, p.y, p.r);
        g.addColorStop(0, pal.hi); g.addColorStop(0.55, pal.mid); g.addColorStop(1, pal.lo);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
    }
  };
  return MolView;
})();
