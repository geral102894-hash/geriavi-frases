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
      // franja de texto arriba, foto abajo (formato meme)
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
      const top = it.band || 400, ph = H - top, s = Math.max(W / im.width, ph / im.height);
      const w = im.width * s, h = im.height * s;
      x.drawImage(im, (W - w) / 2 + (it.dx || 0), top + (ph - h) * (it.fy ?? 0.3), w, h);
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, top);
      // texto
      const words = it.t.split(' ');
      let size = 76, lines;
      for (; size >= 44; size -= 2) {
        x.font = `400 ${size}px Gloock`; lines = ['']; 
        for (const wd of words) { const t = lines[lines.length-1] ? lines[lines.length-1] + ' ' + wd : wd; if (x.measureText(t).width > W - M*2 && lines[lines.length-1]) lines.push(wd); else lines[lines.length-1] = t; }
        if (lines.length * size * 1.14 <= top - 90) break;
      }
      x.fillStyle = '#4F0F1B'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      const lh = size * 1.14; let y = (top - lines.length * lh) / 2 + size * 0.86 + 6;
      for (const l of lines) { x.fillText(l, M, y); y += lh; }
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
