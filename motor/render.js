// Uso: node render.js <salida> [lote.json]  -> PNG 1080x1350 + captions.json. Sin lote.json usa todo el banco.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2], lot = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3])) : null;
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForFunction(() => typeof GeriCards !== 'undefined');
  const res = await p.evaluate(async lot => {
    await Promise.all(['400 40px Gloock','500 40px Figtree','800 40px Figtree'].map(f => document.fonts.load(f, 'áñ¿')));
    const items = lot || GERI_BANK;
    return items.map(it => GeriCards.drawCard(document.createElement('canvas'), it).toDataURL('image/png'));
  }, lot);
  const items = lot || await p.evaluate(() => GERI_BANK);
  res.forEach((d, i) => fs.writeFileSync(path.join(out, `frase-${String(i + 1).padStart(2, '0')}-${items[i].f}.png`), Buffer.from(d.split(',')[1], 'base64')));
  await b.close(); console.log(res.length);
})();
