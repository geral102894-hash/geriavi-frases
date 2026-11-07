const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const [,, out, lotPath] = process.argv; fs.mkdirSync(out, { recursive: true });
  const lot = JSON.parse(fs.readFileSync(lotPath)).map(x => ({ ...x, img: 'data:image/jpeg;base64,' + fs.readFileSync(x.photo).toString('base64') }));
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForFunction(() => typeof GeriCards !== 'undefined');
  const res = await p.evaluate(async lot => {
    await Promise.all(['400 40px Gloock','800 40px Figtree'].map(f => document.fonts.load(f, 'áñ¿')));
    const W = 1080, H = 1350, M = 80, out = [];
    for (const it of lot) {
      const im = new Image(); im.src = it.img; await im.decode();
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      // estilo meme: foto completa, texto blanco con sombra encima
      const s = Math.max(W / im.width, H / im.height), w = im.width * s, h = im.height * s;
      x.drawImage(im, (W - w) / 2 + (it.dx || 0), (H - h) * (it.fy ?? 0.3), w, h);
      if (it.style !== 'meme') { /* compat */ }
      const g = x.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      const words = it.t.split(' '); let size = 70, lines;
      for (; size >= 42; size -= 2) {
        x.font = `800 ${size}px Figtree`; lines = [''];
        for (const wd of words) { const t = lines[lines.length-1] ? lines[lines.length-1] + ' ' + wd : wd; if (x.measureText(t).width > W - M*2 && lines[lines.length-1]) lines.push(wd); else lines[lines.length-1] = t; }
        if (lines.length * size * 1.18 <= 420) break;
      }
      x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.lineJoin = 'round';
      const lh = size * 1.18; let y = (it.ty ?? 0.62) * H - (lines.length * lh) / 2 + size;
      for (const l of lines) {
        x.shadowColor = 'rgba(0,0,0,.85)'; x.shadowBlur = 18; x.fillStyle = '#FFFFFF'; x.fillText(l, W / 2, y);
        x.shadowBlur = 0; y += lh;
      }
      x.textAlign = 'left';
      // firma
      x.font = '800 30px Figtree'; const hw = x.measureText('@bygeriavi').width + 40;
      x.fillStyle = 'rgba(79,15,27,.88)'; x.beginPath(); x.roundRect(M - 20, H - 96, hw, 52, 26); x.fill();
      x.fillStyle = '#FFD7E7'; x.fillText('@bygeriavi', M, H - 60);
      out.push(c.toDataURL('image/png'));
    }
    return out;
  }, lot);
  res.forEach((d, i) => fs.writeFileSync(path.join(out, `meme-${String(i+1).padStart(2,'0')}.png`), Buffer.from(d.split(',')[1], 'base64')));
  await b.close(); console.log(res.length);
})();
