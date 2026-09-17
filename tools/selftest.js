// 브라우저(Pyodide)에서 모든 강좌 코드를 실제로 실행해 보는 자가 진단 스크립트.
// 사용: 강좌 페이지의 개발자 콘솔에서
//   await import('./tools/selftest.js'); const r = await selftest('w1'); console.table(r.failures)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

window.selftest = async function selftest(prefix = '', { interact = true } = {}) {
  await Runtime.ready;
  const tidy = (c) => String(c || '').replace(/^\s*\n/, '').replace(/\s+$/, '') + '\n';
  const snippets = [];
  for (const l of COURSE.lessons) {
    if (!l.id.startsWith(prefix)) continue;
    l.blocks.forEach((b, i) => { if (b.type === 'code' && !b.norun) snippets.push({ id: l.id, kind: 'block', i, title: b.title, code: b.code }); });
    l.practice.forEach((p, i) => {
      if (p.starter && !p.norun) snippets.push({ id: l.id, kind: 'starter', i, title: p.title, code: p.starter });
      if (p.solution) snippets.push({ id: l.id, kind: 'solution', i, title: p.title, code: p.solution });
    });
  }
  const failures = [];
  const progress = (window.selftestProgress = { total: snippets.length, done: 0, failures });
  const text = () => document.querySelector('#console').innerText;
  for (const s of snippets) {
    if (window.App && App.ensureAssets) await App.ensureAssets(COURSE.byId[s.id]);
    Runtime.clearConsole();
    const t0 = performance.now();
    const res = await Runtime.run(tidy(s.code));
    await sleep(30);
    if (interact && res.ok) {
      // 트랙바를 한 번씩 움직이고, 마우스 콜백 창을 클릭해 본다
      for (const input of document.querySelectorAll('.tb input')) {
        input.value = Math.min(Number(input.max), Number(input.value) + 1);
        input.dispatchEvent(new Event('input'));
        await sleep(40);
      }
      for (const c of document.querySelectorAll('.win.mouse-on canvas')) {
        const r = c.getBoundingClientRect();
        const ev = (type, fx, fy, buttons, button = 0) => c.dispatchEvent(new MouseEvent(type, {
          clientX: r.left + r.width * fx, clientY: r.top + r.height * fy, buttons, button, bubbles: true,
        }));
        ev('mousedown', 0.3, 0.3, 1); ev('mousemove', 0.4, 0.4, 1); await sleep(30); ev('mouseup', 0.5, 0.5, 0);
        ev('dblclick', 0.5, 0.5, 0); ev('mousedown', 0.6, 0.6, 2, 2); ev('mouseup', 0.6, 0.6, 0, 2);
        await sleep(30);
      }
    }
    const out = text();
    const ms = performance.now() - t0;
    if (!res.ok || /Traceback|\[(process\(frame\)|트랙바 콜백|마우스 콜백)\]/.test(out)) {
      failures.push({ id: s.id, kind: s.kind, i: s.i, title: s.title, out: out.slice(-900) });
    } else if (ms > 8000) {
      failures.push({ id: s.id, kind: s.kind, i: s.i, title: s.title, out: `느림: ${ms.toFixed(0)}ms` });
    }
    progress.done++;
  }
  Runtime.stopLive();
  return progress;
};
