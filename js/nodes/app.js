/* =========================================================================
 * 노드 편집기 페이지: 팔레트 · 실행 · 프리뷰 · 속성 · 예제 불러오기 · 강좌 연동
 * ========================================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const G = window.NodeGraph;
  const CAT = window.NODE_CATALOG;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ocv:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('ocv:' + k, JSON.stringify(v)); } catch (_) {} },
  };
  const theme = store.get('theme', null);
  if (theme) document.documentElement.dataset.theme = theme;

  const catalogArgsJson = JSON.stringify(Object.fromEntries(CAT.blocks.filter((b) => b.type === 'call').map((b) => [b.key, { args: b.args.map((a) => a.name) }])));
  const blockByKey = new Map(CAT.blocks.map((b) => [b.key, b]));

  /* ------------------------------------------------------------ 알림 --- */
  let toastTimer = 0;
  function toast(msg, ms = 2600) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
  }

  /* ------------------------------------------------------------ 편집기 --- */
  const editor = new NodeEditor($('#editorWrap'), {
    catalog: CAT,
    onChange: (kind) => changed(kind),
    onSelect: () => { renderInspector(); updatePreview(); },
  });

  /* ---------------------------------------------------- 되돌리기 · 저장 --- */
  const history = { stack: [], index: -1, lock: false };
  function snapshot() {
    if (history.lock) return;
    const s = JSON.stringify(editor.graph);
    if (history.stack[history.index] === s) return;
    history.stack = history.stack.slice(0, history.index + 1);
    history.stack.push(s);
    if (history.stack.length > 80) history.stack.shift();
    history.index = history.stack.length - 1;
  }
  function restore(i) {
    if (i < 0 || i >= history.stack.length) return;
    history.index = i;
    history.lock = true;
    editor.setGraph(JSON.parse(history.stack[i]), { fit: false });
    history.lock = false;
    $('#graphTitle').value = editor.graph.title || '';
    afterGraphChange(true);
  }

  let saveTimer = 0;
  function changed(kind) {
    snapshot();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.set('nodes:graph', editor.graph), 300);
    if (kind === 'move') return;
    for (const id of [...editor.status.keys()]) editor.status.delete(id);
    afterGraphChange(false);
  }

  function afterGraphChange(forceRun) {
    renderCode();
    renderStatus();
    renderInspector();
    if ($('#autoRun').checked || forceRun) scheduleRun();
    refreshThumbs();
  }

  /* ------------------------------------------------------------ 팔레트 --- */
  function renderPalette() {
    const q = $('#palSearch').value.trim().toLowerCase();
    const open = new Set(store.get('nodes:palOpen', ['flow', 'color', 'filter', 'morph']));
    const html = CAT.categories.map((c) => {
      const items = CAT.blocks.filter((b) => b.cat === c.id && (!q || `${b.title} ${b.key} ${b.fn || ''} ${b.sig || ''}`.toLowerCase().includes(q)));
      if (!items.length) return '';
      return `<details class="npal-cat c-${c.id}" data-cat="${c.id}" ${q || open.has(c.id) ? 'open' : ''}>
        <summary title="${esc(c.desc)}">${esc(c.title)}<span class="count">${items.length}</span></summary>
        ${items.map((b) => `<button class="npal-block c-${b.cat}" draggable="true" data-key="${esc(b.key)}" title="${esc(b.sig || b.doc || '')}">
          ${esc(b.title)}<small>${esc(b.type === 'call' ? b.fn : b.type === 'code' ? (b.code || '').split('\n')[0] : b.type === 'frame' ? 'def process(frame):' : 'return …')}</small></button>`).join('')}
      </details>`;
    }).join('');
    $('#palette').innerHTML = html || '<p class="muted" style="padding:10px">검색 결과가 없습니다.</p>';
  }
  $('#palSearch').addEventListener('input', renderPalette);
  $('#palette').addEventListener('toggle', (e) => {
    if (!e.target.matches || !e.target.matches('details') || $('#palSearch').value) return;
    store.set('nodes:palOpen', $$('#palette details[open]').map((d) => d.dataset.cat));
  }, true);
  $('#palette').addEventListener('click', (e) => {
    const b = e.target.closest('.npal-block');
    if (b) editor.addBlock(b.dataset.key);
  });
  $('#palette').addEventListener('dragstart', (e) => {
    const b = e.target.closest('.npal-block');
    if (!b) return;
    e.dataTransfer.setData('text/ocv-block', b.dataset.key);
    e.dataTransfer.effectAllowed = 'copy';
  });

  /* ------------------------------------------------------------- 실행 --- */
  let compiled = null;
  let running = false, rerun = false, runTimer = 0;
  let lastResult = null;
  let relayoutAfterRun = false;

  function scheduleRun(delay = 650) {
    clearTimeout(runTimer);
    runTimer = setTimeout(runGraph, delay);
  }

  async function runGraph() {
    await Runtime.ready;
    if (running) { rerun = true; return; }
    const c = G.compile(editor.graph, { instrument: true });
    compiled = c;
    if (!editor.graph.nodes.length) { Runtime.stopLive(); lastResult = null; renderStatus(); return; }
    if (c.errors.length) {
      Runtime.stopLive();
      lastResult = { ok: false, graphErrors: c.errors };
      renderStatus();
      return;
    }
    running = true;
    $('#runBtn').disabled = true;
    const t0 = performance.now();
    const res = await Runtime.run(c.code, { quiet: true });
    running = false;
    $('#runBtn').disabled = false;
    lastResult = { ok: res.ok, ms: performance.now() - t0, error: res.error };
    editor.status.clear();
    if (!res.ok && res.error) markError(res.error.lineNo, res.error.text);
    editor.refresh();
    renderStatus();
    updatePreview();
    refreshThumbs();
    if (relayoutAfterRun) {
      // 새로 불러온 그래프: 썸네일이 붙어 커진 노드 크기로 한 번 더 정렬 (겹침 방지)
      relayoutAfterRun = false;
      editor.autoLayout();
      refreshThumbs();
      store.set('nodes:graph', editor.graph);
    }
    if (rerun) { rerun = false; scheduleRun(50); }
  }

  function nodeAtLine(lineNo) {
    if (!compiled || !lineNo) return null;
    return compiled.lineMap[lineNo - 1] || null;
  }

  function markError(lineNo, text) {
    const id = nodeAtLine(lineNo);
    const last = String(text || '').trim().split('\n').filter((l) => l.trim()).pop() || '실행 오류';
    if (id) editor.status.set(id, { error: last });
    lastResult = { ...(lastResult || {}), ok: false, errorNode: id, errorText: text || last };
  }

  // 실시간 처리 중 오류 (runtime.js 가 호출)
  window.App = {
    markErrorLine(lineNo) {
      const errs = $$('#console .err');
      const text = errs.length ? errs[errs.length - 1].textContent : '';
      markError(lineNo, text);
      editor.refresh();
      renderStatus();
    },
    get editor() { return null; },
  };

  $('#runBtn').addEventListener('click', () => { clearTimeout(runTimer); runGraph(); });
  $('#stopBtn').addEventListener('click', () => Runtime.stopLive());
  Runtime.onLiveChange((on) => { $('#stopBtn').disabled = !on; $('#stopBtn').classList.toggle('live', on); renderStatus(); });
  $('#autoRun').checked = store.get('nodes:autoRun', true);
  $('#autoRun').addEventListener('change', () => { store.set('nodes:autoRun', $('#autoRun').checked); if ($('#autoRun').checked) scheduleRun(0); });
  $('#clearConsoleBtn').addEventListener('click', () => Runtime.clearConsole());

  /* ------------------------------------------------------------ 프리뷰 --- */
  let previewPort = 0;
  let frameTick = 0, thumbTick = 0;
  Runtime.onAfter((kind) => {
    const now = performance.now();
    const media = Runtime.isCameraSource() || Runtime.isVideoSource();
    if (kind === 'frame' && media) {
      if (now - frameTick > 90) { frameTick = now; updatePreview(); }
      if (now - thumbTick > 700) { thumbTick = now; refreshThumbs(); }
    } else {
      updatePreview();
      refreshThumbs();
    }
  });

  function drawProxy(canvas, proxy) {
    if (!proxy) return false;
    try {
      const buf = proxy.getBuffer('u8clamped');
      try {
        const [h, w] = buf.shape;
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(buf.data), w, h), 0, 0);
      } finally { buf.release(); }
      return true;
    } finally {
      if (proxy.destroy) proxy.destroy();
    }
  }

  function autoPreviewTarget() {
    const g = editor.graph;
    const order = [...g.nodes].sort((a, b) => b.order - a.order);
    const ret = order.find((n) => n.type === 'return');
    if (ret) return ret.id;
    const show = order.find((n) => n.type === 'call' && /imshow$/.test(n.fn));
    if (show) return show.id;
    return order.length ? order[0].id : null;
  }

  function nodeInfo(id) {
    try { return JSON.parse(Runtime.callPy('_node_info', id) || 'null'); } catch (_) { return null; }
  }

  function updatePreview() {
    if (!Runtime.pyodide) return;
    const id = editor.selected || autoPreviewTarget();
    const node = id && editor.nodeById(id);
    const box = $('.npreview-box');
    $('#previewName').textContent = node ? `${editor.title(node)}${editor.selected ? '' : ' (자동)'}` : '';
    const info = node ? nodeInfo(id) : null;
    const names = node ? (node.type === 'call' && /imshow$/.test(node.fn) ? ['표시 이미지'] : node.type === 'return' ? ['결과'] : G.varsOf(node)) : [];
    if (!info) {
      box.classList.remove('has-image');
      $('#previewInfo').innerHTML = node ? '<span class="muted">아직 실행되지 않았거나 이 노드는 값을 만들지 않습니다.</span>' : '';
      $('#previewOuts').innerHTML = '';
      $('#previewEmpty').textContent = node ? '이 노드의 결과가 아직 없습니다.' : '노드를 선택하면 그 노드의 결과가 여기에 보입니다.';
      return;
    }
    if (previewPort >= info.length) previewPort = 0;
    let port = previewPort;
    if (!info[port].image) { const k = info.findIndex((x) => x.image); if (k >= 0 && editor.selected !== id) port = k; }
    $('#previewOuts').innerHTML = info.length > 1 ? info.map((x, i) => `<button class="${i === port ? 'active' : ''}" data-port="${i}" title="${esc(x.text)}">${esc(names[i] || i + 1)}${x.image ? ' 🖼' : ''}</button>`).join('') : '';
    const ok = info[port].image && drawProxy($('#previewCanvas'), Runtime.callPy('_node_thumb', id, port, 900, 700));
    box.classList.toggle('has-image', !!ok);
    $('#previewEmpty').textContent = ok ? '' : '이미지가 아닌 값입니다 (아래 정보 참고).';
    $('#previewInfo').innerHTML = info.map((x, i) => `<div title="${esc(x.text)}"><b>${esc(names[i] || '값')}</b> ${esc(x.text)}</div>`).join('');
  }
  $('#previewOuts').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-port]');
    if (!b) return;
    previewPort = Number(b.dataset.port);
    updatePreview();
  });
  $('.npreview-box').addEventListener('click', () => {
    const src = $('#previewCanvas');
    if (!$('.npreview-box').classList.contains('has-image')) return;
    const lb = $('#lightbox'), c = $('#lightboxCanvas');
    c.width = src.width; c.height = src.height;
    c.getContext('2d').drawImage(src, 0, 0);
    $('#lightboxCap').textContent = `${$('#previewName').textContent} · ${src.width}×${src.height} (클릭하여 닫기)`;
    lb.classList.remove('hidden');
  });

  function refreshThumbs() {
    if (!Runtime.pyodide) return;
    let ids = [];
    try { ids = JSON.parse(Runtime.callPy('_node_ids') || '[]'); } catch (_) {}
    const has = new Set(ids);
    for (const [id, el] of editor.els) {
      const holder = el.querySelector('.nn-thumbs');
      if (!holder) continue;
      if (!has.has(id)) { holder.innerHTML = ''; continue; }
      const info = nodeInfo(id);
      const k = info ? info.findIndex((x) => x.image) : -1;
      if (k < 0) { holder.innerHTML = ''; continue; }
      let c = holder.querySelector('canvas');
      if (!c) { c = document.createElement('canvas'); holder.appendChild(c); }
      if (!drawProxy(c, Runtime.callPy('_node_thumb', id, k, 300, 170))) holder.innerHTML = '';
    }
    editor.drawEdges();
  }

  /* ------------------------------------------------------------- 상태 --- */
  function renderStatus() {
    const a = G.analyze(editor.graph);
    const nodes = editor.graph.nodes;
    const msgs = [];
    const res = lastResult;
    if (!Runtime.pyodide) msgs.push(`<div class="nmsg warn">⏳ Python · OpenCV 를 불러오는 중입니다…</div>`);
    if (res && res.graphErrors) res.graphErrors.forEach((e) => msgs.push(`<div class="nmsg err" data-node="${e.id}">⛔ <span>${esc(e.msg)}</span></div>`));
    if (res && res.ok === false && res.errorText) {
      msgs.push(`<div class="nmsg err" data-node="${res.errorNode || ''}">⛔ <div><b>실행 오류</b>${res.errorNode ? ` — ${esc(editor.title(editor.nodeById(res.errorNode) || {}))} 노드` : ''}<pre>${esc(res.errorText.slice(-700))}</pre></div></div>`);
    }
    if (res && res.ok) msgs.push(`<div class="nmsg ok">✅ 실행 완료 (${Math.round(res.ms)} ms)${Runtime.isLive() ? ' · ⟳ 실시간 처리 중' : ''}</div>`);
    a.warnings.forEach((w) => msgs.push(`<div class="nmsg warn" data-node="${w.id}">⚠️ <span>${esc(w.msg)}</span>${w.fix ? `<button class="btn tiny fix" data-fix='${esc(JSON.stringify(w.fix))}'>앞으로 옮기기</button>` : ''}</div>`));
    const proc = a.frame ? a.procOrder.length : 0;
    const src = editor.graph.source;
    $('#statusPane').innerHTML = `<div class="nstatus">
      ${msgs.join('') || '<div class="nmsg">▶ 실행을 누르거나 노드를 연결하면 자동으로 실행됩니다.</div>'}
      <h4>프로그램 정보</h4>
      <div class="kv">
        <span>노드</span><span>${nodes.length}개 (함수 ${nodes.filter((n) => n.type === 'call').length} · 코드 ${nodes.filter((n) => n.type === 'code').length})</span>
        <span>실행 방식</span><span>${a.frame ? `⟳ 실시간 — 입력 소스의 매 프레임에 ${proc}개 노드 실행` : '한 번 실행'}</span>
        <span>연결</span><span>${a.edges.length}개</span>
        ${src && src.lesson ? `<span>불러온 예제</span><span><a href="index.html#${esc(src.lesson)}" data-course="${esc(src.lesson)}">${esc(src.label || src.lesson)}</a></span>` : ''}
      </div>
      <h4>사용 방법</h4>
      <div class="muted" style="font-size:12.5px;line-height:1.7">
        • 노드의 <b>오른쪽 ●</b>(출력)을 끌어 다른 노드의 <b>왼쪽 ●</b>(입력)에 놓으면 연결됩니다.<br>
        • 연결된 입력의 ●을 클릭하거나, 선을 클릭하고 <kbd>Delete</kbd> 로 연결을 끊습니다.<br>
        • 인자 칸에는 Python 식(숫자, 튜플, <code>cv.상수</code>, 변수 이름)을 직접 쓸 수 있습니다.<br>
        • <b style="color:var(--proc)">⟳ 초록 테두리</b> 노드는 <b>입력 소스</b>의 매 프레임마다 실행됩니다 (<code>def process(frame)</code>).<br>
        • 노드를 선택하면 위 <b>프리뷰</b>에 그 노드의 결과가 보입니다. 휠: 확대/축소, 빈 곳 끌기: 화면 이동.
      </div></div>`;
    const tab = $('.ntabs [data-tab="status"]');
    tab.innerHTML = '상태' + ((res && res.ok === false) || a.errors.length ? '<span class="dot"></span>' : '');
  }
  $('#statusPane').addEventListener('click', (e) => {
    const fix = e.target.closest('[data-fix]');
    if (fix) {
      const f = JSON.parse(fix.dataset.fix);
      G.moveBefore(editor.graph, f.from, f.to);
      editor.renderAll();
      changed('reorder');
      return;
    }
    const course = e.target.closest('[data-course]');
    if (course) { e.preventDefault(); goCourse(course.dataset.course); return; }
    const m = e.target.closest('[data-node]');
    if (m && m.dataset.node) focusNode(m.dataset.node);
  });

  function focusNode(id) {
    const n = editor.nodeById(id);
    if (!n) return;
    editor.select(id);
    const W = editor.wrap.clientWidth, H = editor.wrap.clientHeight;
    editor.view.x = W / 2 - (n.x + 120) * editor.view.k;
    editor.view.y = H / 3 - n.y * editor.view.k;
    editor.applyView();
    editor.drawEdges();
  }

  /* ------------------------------------------------------------ 속성 탭 --- */
  function renderInspector() {
    const n = editor.selected && editor.nodeById(editor.selected);
    const box = $('#inspector');
    if (!n) { box.innerHTML = '<div class="ninsp muted">노드를 선택하면 속성을 편집할 수 있습니다.</div>'; return; }
    const spec = editor.spec(n);
    const a = G.analyze(editor.graph);
    const scopeNow = a.scope.get(n.id);
    const rows = [];
    rows.push(`<h4>${esc(editor.title(n))}</h4>`);
    if (spec && (spec.sig || spec.doc)) rows.push(`<div class="sig">${esc(spec.sig || spec.doc)}</div>`);
    if (n.type === 'call') {
      rows.push(`<label class="row"><span>함수</span><input data-f="fn" value="${esc(n.fn)}" spellcheck="false"></label>`);
      (n.args || []).forEach((arg, i) => {
        const sa = spec && spec.args.find((x) => x.name === arg.name);
        const listId = `insp-opts-${i}`;
        rows.push(`<label class="row"><span title="${sa && sa.req ? '필수' : '선택'}">${esc(arg.name)}${sa && sa.req ? ' *' : ''}</span>
          <input data-arg="${i}" value="${esc(arg.expr)}" placeholder="${esc(sa && sa.hint ? sa.hint : '')}" spellcheck="false" ${sa && sa.opts ? `list="${listId}"` : ''}>
          ${sa && sa.opts ? `<datalist id="${listId}">${sa.opts.map((o) => `<option value="${esc(o)}">`).join('')}</datalist>` : ''}</label>`);
      });
      rows.push(`<label class="row"><span>결과 변수</span><input data-f="outs" value="${esc((n.outs || []).join(', '))}" placeholder="${esc(spec ? spec.outs.join(', ') : '')}" spellcheck="false"></label>`);
    } else if (n.type === 'code') {
      rows.push(`<label class="row" style="grid-template-columns:1fr"><textarea data-f="code" spellcheck="false">${esc(n.code)}</textarea></label>`);
      rows.push(`<label class="row"><span>만드는 변수</span><input data-f="codeouts" value="${esc((n.outs || []).join(', '))}" spellcheck="false" title="이 코드가 값을 정하는 변수 (다른 노드와 연결됨)"></label>`);
    } else if (n.type === 'frame') {
      rows.push(`<label class="row"><span>프레임 변수</span><input data-f="frameVar" value="${esc(n.outs[0])}" spellcheck="false"></label>`);
    } else if (n.type === 'return') {
      rows.push(`<label class="row"><span>결과 식</span><input data-f="expr" value="${esc(n.expr)}" spellcheck="false"></label>`);
    }
    if (n.type === 'call' || n.type === 'code') {
      rows.push(`<label class="row"><span>실행 시점</span><select data-f="scope">
        <option value="" ${!n.scope ? 'selected' : ''}>자동 (${scopeNow === 'process' ? '매 프레임' : '처음 한 번'})</option>
        <option value="main" ${n.scope === 'main' ? 'selected' : ''}>처음 한 번</option>
        <option value="process" ${n.scope === 'process' ? 'selected' : ''}>매 프레임 (process 안)</option></select></label>`);
    }
    rows.push(`<label class="row"><span>메모</span><input data-f="comment" value="${esc(n.comment || '')}" placeholder="코드에 주석으로 들어갑니다"></label>`);
    rows.push(`<div class="sig">${esc(G.statementOf(n) || (n.type === 'frame' ? `def process(${n.outs[0]}):` : ''))}</div>`);
    rows.push(`<div class="btns"><button class="btn tiny ghost" data-do="dup">⧉ 복제</button><button class="btn tiny ghost" data-do="del">🗑 삭제</button>
      ${spec && spec.type === 'call' ? `<a class="btn tiny ghost" target="_blank" rel="noopener" href="https://docs.opencv.org/4.x/search.html?q=${encodeURIComponent(n.fn.split('.').pop())}">📖 OpenCV 문서</a>` : ''}</div>`);
    box.innerHTML = `<div class="ninsp">${rows.join('')}</div>`;
  }
  $('#inspector').addEventListener('change', (e) => {
    const n = editor.selected && editor.nodeById(editor.selected);
    if (!n) return;
    const t = e.target;
    if (t.dataset.arg !== undefined) n.args[Number(t.dataset.arg)].expr = t.value;
    else if (t.dataset.f === 'fn') n.fn = t.value.trim();
    else if (t.dataset.f === 'outs') {
      const vals = t.value.split(',').map((x) => x.trim());
      const old = n.outs || [];
      vals.forEach((v, i) => { if (old[i] && v && v !== old[i]) editor.renameVar(n.id, i, v); });
      n.outs = vals.filter((v, i) => v || i < old.length);
    } else if (t.dataset.f === 'code') n.code = t.value;
    else if (t.dataset.f === 'codeouts') n.outs = t.value.split(',').map((x) => x.trim()).filter(Boolean);
    else if (t.dataset.f === 'frameVar') n.outs = [t.value.trim() || 'frame'];
    else if (t.dataset.f === 'expr') n.expr = t.value;
    else if (t.dataset.f === 'scope') { if (t.value) n.scope = t.value; else delete n.scope; }
    else if (t.dataset.f === 'comment') { if (t.value.trim()) n.comment = t.value; else delete n.comment; }
    editor.renderNode(n.id);
    changed('edit');
  });
  $('#inspector').addEventListener('click', (e) => {
    const b = e.target.closest('[data-do]');
    if (!b || !editor.selected) return;
    if (b.dataset.do === 'dup') editor.duplicate(editor.selected);
    if (b.dataset.do === 'del') editor.deleteNode(editor.selected);
  });

  /* ------------------------------------------------------------ 코드 탭 --- */
  function cleanCode() { return G.compile(editor.graph).code; }
  function renderCode() {
    const code = cleanCode();
    const el = $('#codeView');
    if (window.CodeMirror && CodeMirror.runMode) CodeMirror.runMode(code, 'python', el); else el.textContent = code;
  }
  $('#copyCodeBtn').addEventListener('click', async () => { try { await navigator.clipboard.writeText(cleanCode()); toast('Python 코드를 복사했습니다.'); } catch (_) {} });
  $('#downloadPyBtn').addEventListener('click', () => download(`${fileBase()}.py`, cleanCode(), 'text/x-python'));
  $('#sendCodeBtn').addEventListener('click', () => {
    store.set('course:inbox', { code: cleanCode(), title: editor.graph.title || '노드 프로그램', lesson: editor.graph.source && editor.graph.source.lesson, ts: Date.now() });
    goCourse(editor.graph.source && editor.graph.source.lesson, true);
    toast('강좌 페이지의 코드 에디터로 보냈습니다.');
  });

  /* ------------------------------------------------------------ 탭 전환 --- */
  $('.ntabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    $$('.ntabs button').forEach((x) => x.classList.toggle('active', x === b));
    $$('.ntab-pane').forEach((p) => p.classList.toggle('active', p.dataset.pane === b.dataset.tab));
    if (b.dataset.tab === 'code') renderCode();
  });
  function showTab(name) { $(`.ntabs [data-tab="${name}"]`).click(); }

  /* ------------------------------------------------------ 불러오기 · 저장 --- */
  function fileBase() { return (editor.graph.title || 'opencv-nodes').replace(/[^\w가-힣-]+/g, '_'); }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  $('#saveBtn').addEventListener('click', () => download(`${fileBase()}.json`, JSON.stringify(editor.graph, null, 1), 'application/json'));
  $('#openInput').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const g = JSON.parse(await f.text());
      if (!Array.isArray(g.nodes)) throw new Error('노드 그래프 파일이 아닙니다');
      loadGraph(g, false);
      toast(`${f.name} 을(를) 열었습니다.`);
    } catch (err) { toast('파일을 열 수 없습니다: ' + err.message, 4000); }
    e.target.value = '';
  });
  $('#graphTitle').addEventListener('change', () => { editor.graph.title = $('#graphTitle').value; changed('title'); });
  $('#newBtn').addEventListener('click', () => {
    if (editor.graph.nodes.length && !confirm('지금 프로그램을 지우고 새로 시작할까요? (되돌리기 가능)')) return;
    loadGraph({ version: 1, title: '새 프로그램', nodes: [] }, false);
  });
  $('#layoutBtn').addEventListener('click', () => { editor.autoLayout(); changed('move'); });
  $('#undoBtn').addEventListener('click', () => restore(history.index - 1));
  $('#redoBtn').addEventListener('click', () => restore(history.index + 1));

  function loadGraph(graph, layout) {
    Runtime.stopLive();
    editor.status.clear();
    lastResult = null;
    editor.setGraph(graph, { fit: !layout });
    if (layout) { editor.autoLayout(); relayoutAfterRun = true; }
    $('#graphTitle').value = graph.title || '';
    snapshot();
    store.set('nodes:graph', editor.graph);
    afterGraphChange(true);
  }

  /** Python 코드 → 노드 그래프 */
  let converterReady = null;
  async function convertCode(code, meta = {}) {
    await Runtime.ready;
    if (!converterReady) {
      converterReady = Promise.resolve().then(() => Runtime.pyodide.runPython(window.NODE_CONVERTER_PY, { filename: '<node-converter>' }));
    }
    await converterReady;
    const res = JSON.parse(Runtime.callPy('convert_json', String(code), catalogArgsJson));
    if (!res.ok) { toast('노드로 바꿀 수 없습니다: ' + res.error, 5000); return false; }
    const g = res.graph;
    g.title = meta.title || '가져온 코드';
    if (meta.lesson) g.source = { lesson: meta.lesson, label: meta.label || meta.lesson };
    loadGraph(g, true);
    toast(`🧩 ${g.nodes.length}개 노드로 변환했습니다${meta.title ? ` · ${meta.title}` : ''}`);
    return true;
  }

  /* ------------------------------------------------------ 예제 대화상자 --- */
  function openModal(title, html) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    $('#modal').classList.remove('hidden');
  }
  function closeModal() { $('#modal').classList.add('hidden'); }
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });

  const examples = [];
  function lessonExamples(l) {
    const list = [];
    l.blocks.forEach((b) => { if (b.type === 'code' && !b.norun) list.push({ title: b.title || '예제', code: b.code }); });
    l.practice.forEach((p) => {
      if (p.starter && !p.norun) list.push({ title: `${p.title} (시작 코드)`, code: p.starter });
      if (p.solution) list.push({ title: `${p.title} (정답)`, code: p.solution });
    });
    return list;
  }
  let exLesson = store.get('nodes:exLesson', 'w1-2');
  function renderExamples() {
    const weeks = COURSE.weeks.map((w) => `<div class="wk">${w.no}주차 · ${esc(w.title)}</div>` + COURSE.lessons.filter((l) => l.week === w.no).map((l) =>
      `<button data-lesson="${l.id}" class="${l.id === exLesson ? 'active' : ''}">${l.period}교시 ${esc(l.title)}</button>`).join('')).join('');
    const l = COURSE.byId[exLesson] || COURSE.lessons[0];
    examples.length = 0;
    const items = lessonExamples(l).map((ex, i) => {
      examples.push(ex);
      const tidy = String(ex.code).replace(/^\s*\n/, '');
      return `<div class="nex-item"><div class="t">${esc(ex.title)}<span class="spacer"></span><button class="btn tiny primary" data-ex="${i}">🧩 노드로 열기</button></div>
        <pre>${esc(tidy.split('\n').slice(0, 7).join('\n'))}</pre></div>`;
    }).join('') || '<p class="muted">실행할 수 있는 예제가 없습니다.</p>';
    openModal('📚 강좌 예제를 노드로 불러오기', `<div class="nex-grid"><div class="nex-lessons">${weeks}</div><div class="nex-list"><h4 style="margin:0 0 8px">${l.week}주차 ${l.period}교시 · ${esc(l.title)}</h4>${items}</div></div>`);
  }
  $('#examplesBtn').addEventListener('click', renderExamples);
  $('#modalBody').addEventListener('click', async (e) => {
    const les = e.target.closest('[data-lesson]');
    if (les) { exLesson = les.dataset.lesson; store.set('nodes:exLesson', exLesson); renderExamples(); return; }
    const ex = e.target.closest('[data-ex]');
    if (ex) {
      const item = examples[Number(ex.dataset.ex)];
      const l = COURSE.byId[exLesson];
      closeModal();
      await convertCode(item.code, { title: item.title, lesson: l.id, label: `${l.week}주차 ${l.period}교시 · ${item.title}` });
      return;
    }
    const conv = e.target.closest('[data-convert]');
    if (conv) {
      const code = $('#pasteArea').value;
      closeModal();
      await convertCode(code, { title: '붙여 넣은 코드' });
    }
  });
  $('#pasteBtn').addEventListener('click', () => {
    openModal('🐍 Python 코드를 노드로 변환', `<div class="npaste"><p class="muted" style="margin-top:0">강좌 에디터의 코드나 직접 작성한 OpenCV 코드를 붙여 넣으세요. 함수 호출은 블록으로, 반복문 · 조건문 · 함수 정의는 Python 코드 노드로 바뀝니다.</p>
      <textarea id="pasteArea" spellcheck="false">${esc(cleanCode())}</textarea>
      <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end"><button class="btn ghost" data-close>취소</button><button class="btn primary" data-convert>🧩 노드로 변환</button></div></div>`);
  });

  /* ------------------------------------------------------ 강좌와 전환 --- */
  function goCourse(lessonId, keepHere) {
    const url = 'index.html' + (lessonId ? '#' + lessonId : '');
    if (window.opener && !window.opener.closed) {
      try {
        if (lessonId) window.opener.location.hash = lessonId;
        window.opener.focus();
        return;
      } catch (_) {}
    }
    const w = window.open(url, 'ocv-course');
    if (!w) {   // 팝업이 막히면 같은 창에서 이동 (노드 그래프는 자동 저장되어 있음)
      store.set('nodes:graph', editor.graph);
      location.href = url;
    } else if (keepHere) {
      w.focus();
    }
  }
  $('#toCourseBtn').addEventListener('click', () => goCourse(editor.graph.source && editor.graph.source.lesson));

  // 강좌 페이지에서 보낸 예제 받기
  function consumeInbox() {
    const msg = store.get('nodes:inbox', null);
    if (!msg || !msg.code || Date.now() - (msg.ts || 0) > 120000) return false;
    try { localStorage.removeItem('ocv:nodes:inbox'); } catch (_) {}
    convertCode(msg.code, { title: msg.title, lesson: msg.lesson, label: msg.label });
    return true;
  }
  window.addEventListener('storage', (e) => { if (e.key === 'ocv:nodes:inbox' && e.newValue) { consumeInbox(); window.focus(); } });

  /* ------------------------------------------------------------ 키보드 --- */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); clearTimeout(runTimer); runGraph(); return; }
    const inField = e.target.closest && e.target.closest('input, textarea, select');
    if (inField) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); restore(history.index + (e.shiftKey ? 1 : -1)); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); restore(history.index + 1); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); $('#saveBtn').click(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && editor.selected) { e.preventDefault(); editor.duplicate(editor.selected); }
  });

  /* ------------------------------------------------------------ 시작 --- */
  function call(key, over = {}, outs) {
    const b = blockByKey.get(key);
    return { type: 'call', fn: b.fn, args: b.args.map((a) => ({ name: a.name, kw: !a.req, expr: over[a.name] !== undefined ? over[a.name] : (a.def || '') })), outs: outs || b.outs };
  }
  function demoGraph() {
    const nodes = [
      call('cv.imread', { filename: "'messi5.jpg'" }, ['img']),
      call('cv.cvtColor', { src: 'img', code: 'cv.COLOR_BGR2GRAY' }, ['gray']),
      call('cv.GaussianBlur', { src: 'gray', ksize: '(5, 5)', sigmaX: '0' }, ['blur']),
      call('cv.Canny', { image: 'blur', threshold1: '100', threshold2: '200' }, ['edges']),
      call('cv.imshow', { winname: "'edges'", mat: 'edges' }, []),
    ];
    nodes.forEach((n, i) => { n.id = 'n' + (i + 1); n.order = i + 1; });
    return G.layout({ version: 1, title: '첫 노드 프로그램: Canny 엣지', nodes });
  }

  // 자가 진단용 (tools/nodes-selftest.js)
  window.NodesApp = { editor, convertCode, runGraph: () => runGraph(), get lastResult() { return lastResult; }, lessonExamples };

  renderPalette();
  renderStatus();
  const saved = store.get('nodes:graph', null);
  const fromInbox = !!store.get('nodes:inbox', null);
  if (!fromInbox) loadGraph(saved && Array.isArray(saved.nodes) ? saved : demoGraph(), !saved);
  requestAnimationFrame(() => { if (!fromInbox) editor.autoLayout && (saved ? editor.fit() : editor.autoLayout()); });
  Runtime.ready.then(() => {
    $('#runBtn').disabled = false;
    renderStatus();
    if (!consumeInbox()) scheduleRun(0);
  });
})();
