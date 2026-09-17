// 노드 편집기 자가 진단: 강좌의 모든 예제를 브라우저(Pyodide)에서 노드로 변환 → 컴파일 → 실행
// 사용: nodes.html 을 연 상태에서 개발자 콘솔에
//   await import('./tools/nodes-selftest.js'); const r = await nodesSelftest('w1'); console.table(r.failures)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

window.nodesSelftest = async function nodesSelftest(prefix = '') {
  await Runtime.ready;
  const app = window.NodesApp;
  const failures = [];
  const progress = (window.nodesSelftestProgress = { total: 0, done: 0, failures });
  const jobs = [];
  for (const l of COURSE.lessons) {
    if (!l.id.startsWith(prefix)) continue;
    for (const ex of app.lessonExamples(l)) jobs.push({ l, ex });
  }
  progress.total = jobs.length;
  for (const { l, ex } of jobs) {
    Runtime.clearConsole();
    const ok = await app.convertCode(ex.code, { title: ex.title, lesson: l.id });
    await sleep(20);
    if (!ok) { failures.push({ id: l.id, title: ex.title, out: '변환 실패' }); progress.done++; continue; }
    await app.runGraph();
    await sleep(60);
    const r = app.lastResult || {};
    const cons = document.querySelector('#console').innerText;
    if (!r.ok || /Traceback|\[(process\(frame\)|트랙바 콜백|마우스 콜백)\]/.test(cons)) {
      failures.push({ id: l.id, title: ex.title, out: (r.errorText || (r.graphErrors || []).map((e) => e.msg).join('; ') || cons).slice(-600) });
    }
    progress.done++;
  }
  Runtime.stopLive();
  return progress;
};
