// Browser playtest of the built game (npm run build first): node tools/playtest/test.js
// Needs Playwright with Chromium. Covers porting rules 2.5, 2.7, 3, 4.1, 4.2 and 8.
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const S = __dirname, dist = path.resolve(S, '../../dist'), shots = path.join(S, 'shots') + '/';
fs.mkdirSync(shots, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.txt': 'text/plain' };
// site: the game inside a sandboxed frame at /games/<slug>/ with a stand-in SDK at /sdk/2web.js.
// bare: the game folder on its own, with no SDK anywhere.
const serve = (site, port) => http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  let p = site
    ? u === '/host.html' ? path.join(S, 'host.html') : u === '/sdk/2web.js' ? path.join(S, '2web-stub.js') : u.startsWith('/games/') ? path.join(dist, u.slice(7)) : null
    : path.join(dist, 'sand-garden', u);
  if (!p) { r.writeHead(404); return r.end('nf'); }
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end('nf'); } else { r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d); } });
}).listen(port);
const results = []; const ok = (name, cond, extra = '') => { results.push([cond ? 'PASS' : 'FAIL', name, extra]); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function watch(page, tag, bag) {
  page.on('console', m => { if (m.type() === 'error') bag.errors.push(tag + ': ' + m.text() + ' @' + (m.location().url || '')); });
  page.on('pageerror', e => bag.errors.push(tag + ' pageerror: ' + e.message));
  page.on('request', q => { const u = new URL(q.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && u.protocol.startsWith('http')) bag.external.push(q.url()); });
  page.on('dialog', d => { bag.dialogs.push(d.type()); d.dismiss(); });
  page.on('popup', () => bag.dialogs.push('popup'));
}
// every button fully inside [inset, size-inset], nothing overlapping the canvas
const layoutCheck = (f, inset) => f.evaluate((inset) => {
  const W = innerWidth, H = innerHeight, bad = [];
  const c = document.getElementById('sand-canvas').getBoundingClientRect();
  const inside = (r) => r.left >= inset - .5 && r.top >= inset - .5 && r.right <= W - inset + .5 && r.bottom <= H - inset + .5;
  if (!inside(c)) bad.push('canvas ' + JSON.stringify(c));
  const bs = [...document.querySelectorAll('#ui button')];
  for (const b of bs) { const r = b.getBoundingClientRect();
    if (!inside(r)) bad.push('out:' + b.textContent);
    if (r.width < 24 || r.height < 14) bad.push('tiny:' + b.textContent + ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0));
    if (b.scrollWidth > b.clientWidth + 1) bad.push('clipped:' + b.textContent);
    if (!(r.right <= c.left + .5 || r.left >= c.right - .5 || r.bottom <= c.top + .5 || r.top >= c.bottom - .5)) bad.push('overlap:' + b.textContent); }
  return { W, H, canvas: Math.round(c.width) + 'x' + Math.round(c.height), n: bs.length, minBtn: Math.min(...bs.map(b => b.getBoundingClientRect().height)).toFixed(0), bad, scroll: document.documentElement.scrollHeight > H + 1 || document.documentElement.scrollWidth > W + 1 };
}, inset);
const frameOf = async (page) => { const h = await page.waitForSelector('#g'); const f = await h.contentFrame(); await f.waitForFunction(() => window.__game && window.UI && window.__game.frames > 5, null, { timeout: 15000 }); return f; };
const canvasBox = async (page, f) => { const fr = await (await page.$('#g')).boundingBox(); const c = await f.evaluate(() => { const r = document.getElementById('sand-canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }); return { x: fr.x + c.x, y: fr.y + c.y, w: c.w, h: c.h }; };
const clickBtn = (f, text) => f.evaluate((t) => { const b = [...document.querySelectorAll('#ui button')].find(b => b.textContent.trim() === t || b.getAttribute('aria-label') === t); if (!b) throw new Error('no button ' + t); b.click(); }, text);

(async () => {
  serve(true, 8931); serve(false, 8932);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

  // ---------- laptop, hosted in a sandboxed frame ----------
  {
    const bag = { errors: [], external: [], dialogs: [] };
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await ctx.newPage(); await watch(page, 'laptop', bag);
    await page.goto('http://127.0.0.1:8931/host.html?w=1100');
    const f = await frameOf(page);
    ok('laptop: TwoWeb.ready() called once', (await f.evaluate(() => window.__tw.ready)) === 1);
    ok('laptop: onPause registered', (await f.evaluate(() => window.__tw.cbs.length)) === 1);
    await sleep(2500); // boot animation
    let L = await layoutCheck(f, 0); ok('laptop 1100x619 layout', !L.bad.length && !L.scroll, JSON.stringify(L));
    await page.screenshot({ path: shots + 'laptop-1100.png' });
    // mouse drawing
    const S0 = await f.evaluate(() => window.__game.count(window.species.Sand));
    await clickBtn(f, 'Sand'); await f.evaluate(() => window.__game.setSize(3));
    let cb = await canvasBox(page, f);
    await page.mouse.move(cb.x + cb.w * .3, cb.y + cb.h * .2); await page.mouse.down();
    for (let i = 0; i <= 20; i++) { await page.mouse.move(cb.x + cb.w * (.3 + .02 * i), cb.y + cb.h * .2); await sleep(16); }
    await page.mouse.up(); await sleep(300);
    const S1 = await f.evaluate(() => window.__game.count(window.species.Sand));
    ok('laptop: mouse draws sand', S1 > S0 + 500, `${S0} -> ${S1}`);
    // keyboard
    await page.mouse.click(cb.x + 5, cb.y + 5); // focus frame
    await page.keyboard.press('Space'); ok('kbd: Space pauses', await f.evaluate(() => window.__game.paused));
    const fr0 = await f.evaluate(() => JSON.stringify([...window.__cells().slice(0, 4000)])); await sleep(300);
    await page.keyboard.press('Space'); ok('kbd: Space resumes', !(await f.evaluate(() => window.__game.paused)));
    await page.keyboard.press('4'); ok('kbd: 4 sets brush', (await f.evaluate(() => window.__game.state.size)) === 3);
    await page.keyboard.press(']'); ok('kbd: ] next element', (await f.evaluate(() => window.species[window.__game.state.selectedElement])) === 'Water');
    const Sb = await f.evaluate(() => window.__game.count(window.species.Sand));
    await page.keyboard.press('z'); await sleep(200);
    const S2 = await f.evaluate(() => window.__game.count(window.species.Sand)); ok('kbd: Z undoes last stroke', S2 < Sb, `${Sb} -> ${S2}`);
    // info page
    await clickBtn(f, 'Info'); await sleep(200);
    ok('info: opens and pauses', await f.evaluate(() => !!document.querySelector('.menu') && window.__game.paused));
    ok('info: no links out', (await f.evaluate(() => document.querySelectorAll('a').length)) === 0);
    await page.screenshot({ path: shots + 'laptop-info.png' });
    await page.keyboard.press('Escape'); await sleep(100);
    ok('info: Esc closes and resumes', await f.evaluate(() => !document.querySelector('.menu') && !window.__game.paused));
    // reset -> confirm -> ad -> pause/resume
    await clickBtn(f, 'Reset'); await sleep(100);
    ok('reset: first press only arms', (await f.evaluate(() => window.__tw.ads.length)) === 0 && await f.evaluate(() => [...document.querySelectorAll('#ui button')].some(b => b.textContent === 'Sure?')));
    await clickBtn(f, 'Sure?'); await sleep(400);
    ok('ad: interstitial requested at reset', (await f.evaluate(() => window.__tw.ads.join())) === 'interstitial');
    ok('ad: game paused while ad shows', await f.evaluate(() => window.__game.paused && !!document.getElementById('fake-ad')));
    const a = await f.evaluate(() => window.__game.frames && JSON.stringify([...window.__cells()].filter((v, i) => i % 4 === 0).reduce((s, v) => s + v, 0))); await sleep(500);
    const b = await f.evaluate(() => JSON.stringify([...window.__cells()].filter((v, i) => i % 4 === 0).reduce((s, v) => s + v, 0)));
    ok('ad: simulation frozen during ad', a === b);
    await page.screenshot({ path: shots + 'laptop-ad.png' });
    await sleep(1500);
    ok('ad: resumes after ad, board cleared', await f.evaluate(() => !window.__game.paused && window.__game.count(window.species.Sand) === 0));
    // user pause survives an ad
    await page.keyboard.press('Space'); await f.evaluate(() => { window.__tw.cbs[0](true); window.__tw.cbs[0](false); });
    ok('pause: player pause survives ad resume', await f.evaluate(() => window.__game.paused)); await page.keyboard.press('Space');
    // resize while playing
    for (const w of [600, 760, 900, 1100]) { await page.evaluate((w) => document.getElementById('box').style.setProperty('--w', w + 'px'), w); await sleep(250); L = await layoutCheck(f, 0); ok(`resize: ${w}x${Math.round(w * 9 / 16)} layout`, !L.bad.length && !L.scroll, JSON.stringify(L)); if (w === 600) await page.screenshot({ path: shots + 'laptop-600.png' }); }
    cb = await canvasBox(page, f); await clickBtn(f, 'Lava'); const l0 = await f.evaluate(() => window.__game.count(window.species.Lava));
    await page.mouse.move(cb.x + cb.w * .5, cb.y + cb.h * .5); await page.mouse.down(); await page.mouse.move(cb.x + cb.w * .6, cb.y + cb.h * .5, { steps: 8 }); await page.mouse.up(); await sleep(100);
    ok('resize: drawing still lands after resize', (await f.evaluate(() => window.__game.count(window.species.Lava))) > l0);
    ok('laptop: no console errors', !bag.errors.length, bag.errors.join(' | '));
    ok('laptop: no requests off-site', !bag.external.length, bag.external.join(' '));
    ok('laptop: no dialogs/popups', !bag.dialogs.length, bag.dialogs.join());
    await ctx.close();
  }
  // ---------- phones ----------
  for (const [name, vp] of [['390x844', { width: 390, height: 844 }], ['375x812', { width: 375, height: 812 }], ['812x375 sideways', { width: 812, height: 375 }]]) {
    const bag = { errors: [], external: [], dialogs: [] };
    const ctx = await browser.newContext({ ...devices['iPhone 12'], viewport: vp });
    const page = await ctx.newPage(); await watch(page, name, bag);
    await page.goto('http://127.0.0.1:8931/host.html?phone=1');
    const f = await frameOf(page); await sleep(1500);
    const L = await layoutCheck(f, 40); ok(`phone ${name}: layout inside 40px safe area`, !L.bad.length && !L.scroll, JSON.stringify(L));
    await f.evaluate(() => window.__game.setSize(3)); 
    const tb = await f.evaluate(() => { const b = [...document.querySelectorAll('#ui button')].find(b => b.textContent === 'Sand').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    await page.touchscreen.tap(tb.x, tb.y); await sleep(100);
    ok(`phone ${name}: tap selects element`, (await f.evaluate(() => window.species[window.__game.state.selectedElement])) === 'Sand');
    const cb = await canvasBox(page, f); const s0 = await f.evaluate(() => window.__game.count(window.species.Sand));
    const cdp = await ctx.newCDPSession(page);
    const pt = (i) => [{ x: Math.round(cb.x + cb.w * (.3 + .03 * i)), y: Math.round(cb.y + cb.h * .25) }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(0) });
    for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(i) }); await sleep(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300);
    const s1 = await f.evaluate(() => window.__game.count(window.species.Sand)); ok(`phone ${name}: finger draws sand`, s1 > s0 + 300, `${s0} -> ${s1}`);
    await sleep(1200); await page.screenshot({ path: shots + 'phone-' + name.split(' ')[0] + '.png' });
    if (name === '390x844') { await page.touchscreen.tap(...await f.evaluate(() => { const b = [...document.querySelectorAll('#ui button')].find(b => b.textContent === 'Info').getBoundingClientRect(); return [b.left + 5, b.top + 5]; })); await sleep(200);
      ok('phone info: fits inside safe area', await f.evaluate(() => { const r = document.querySelector('.menu').getBoundingClientRect(); return r.left >= 40 && r.top >= 40 && r.right <= innerWidth - 40 && r.bottom <= innerHeight - 40; })); await page.screenshot({ path: shots + 'phone-info.png' }); }
    ok(`phone ${name}: no console errors`, !bag.errors.length, bag.errors.join(' | ')); ok(`phone ${name}: no requests off-site`, !bag.external.length);
    await ctx.close();
  }
  // ---------- standalone (no 2Web around it) ----------
  {
    const bag = { errors: [], external: [], dialogs: [] };
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await ctx.newPage(); await watch(page, 'standalone', bag);
    await page.goto('http://127.0.0.1:8932/index.html');
    await page.waitForFunction(() => window.__game && window.UI && window.__game.frames > 5);
    ok('standalone: runs with no TwoWeb object', await page.evaluate(() => typeof window.TwoWeb === 'undefined' && !window.__game.paused));
    await page.click('text=Reset'); await page.click('text=Sure?'); await sleep(300);
    ok('standalone: reset works, ad comes back "not shown"', await page.evaluate(() => !window.__game.paused && window.__game.count(window.species.Sand) === 0));
    const L = await layoutCheck(page, 0); ok('standalone 1366x768 layout', !L.bad.length && !L.scroll, JSON.stringify(L));
    await page.screenshot({ path: shots + 'standalone.png' });
    const other = bag.errors.filter(e => !/sdk\/2web\.js/.test(e));
    ok('standalone: no console errors (other than the absent SDK file)', !other.length, bag.errors.join(' | '));
    ok('standalone: no requests off-site', !bag.external.length);
    await ctx.close();
  }
  await browser.close();
  for (const r of results) console.log(r[0], r[1], r[0] === 'FAIL' ? r[2] : '');
  console.log(results.filter(r => r[0] === 'FAIL').length + ' failed of ' + results.length);
  process.exit(results.some(r => r[0] === 'FAIL') ? 1 : 0);
})().catch(e => { console.error(e); for (const r of results) console.log(r.join(' ')); process.exit(1); });
