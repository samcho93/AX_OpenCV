/* =========================================================================
 * 화면 구성: 네비게이션 · 강좌 내용 · 코드 에디터 · 진도 저장
 * ========================================================================= */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const C = window.COURSE;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ocv:' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem('ocv:' + k, JSON.stringify(v)); } catch (_) {} },
    del(k) { try { localStorage.removeItem('ocv:' + k); } catch (_) {} },
  };

  const el = {
    nav: $('#navTree'), search: $('#navSearch'), content: $('#content'),
    progressBar: $('#progressBar'), progressText: $('#progressText'),
    runBtn: $('#runBtn'), stopBtn: $('#stopBtn'), resetBtn: $('#resetBtn'), copyBtn: $('#copyBtn'),
    editorLabel: $('#editorLabel'), themeBtn: $('#themeBtn'),
  };

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tidy = (code) => String(code || '').replace(/^\s*\n/, '').replace(/\s+$/, '') + '\n';

  /* --------------------------------------------------------------- 테마 --- */
  function applyTheme(t) {
    if (t) document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }
  applyTheme(store.get('theme', null));
  el.themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('theme', next);
  });

  /* ------------------------------------------------------------- 에디터 --- */
  const editor = CodeMirror($('#editorHost'), {
    value: '', mode: 'python', theme: 'material-darker', lineNumbers: true, indentUnit: 4, tabSize: 4,
    indentWithTabs: false, matchBrackets: true, lineWrapping: false,
    extraKeys: {
      'Ctrl-Enter': () => run(), 'Cmd-Enter': () => run(),
      Tab: (cm) => (cm.somethingSelected() ? cm.indentSelection('add') : cm.replaceSelection('    ', 'end')),
      'Shift-Tab': (cm) => cm.indentSelection('subtract'),
      'Ctrl-/': 'toggleComment', 'Cmd-/': 'toggleComment',
    },
  });
  let errorMark = null;
  let current = null;       // 현재 교시
  let saveTimer = 0;
  editor.on('change', () => {
    if (errorMark !== null) { editor.removeLineClass(errorMark, 'background', 'cm-error-line'); errorMark = null; }
    if (!current) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.set('code:' + current.id, editor.getValue()), 400);
  });

  function setEditor(code, label) {
    editor.setValue(tidy(code));
    editor.clearHistory();
    if (label) el.editorLabel.textContent = '· ' + label;
    editor.refresh();
  }

  function markErrorLine(lineNo) {
    if (!lineNo) return;
    const ln = lineNo - 1;
    if (ln < 0 || ln >= editor.lineCount()) return;
    errorMark = editor.addLineClass(ln, 'background', 'cm-error-line');
    editor.scrollIntoView({ line: ln, ch: 0 }, 80);
  }

  async function run() {
    if (el.runBtn.disabled) return;
    el.runBtn.disabled = true;
    el.runBtn.textContent = '⏳ 실행 중';
    const res = await Runtime.run(editor.getValue());
    el.runBtn.disabled = false;
    el.runBtn.textContent = '▶ 실행';
    if (!res.ok && res.error) markErrorLine(res.error.lineNo);
  }

  el.runBtn.addEventListener('click', run);
  el.stopBtn.addEventListener('click', () => Runtime.stopLive());
  Runtime.onLiveChange((on) => {
    el.stopBtn.disabled = !on;
    el.stopBtn.classList.toggle('live', on);
  });
  Runtime.ready.then(() => { el.runBtn.disabled = false; });

  el.copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(editor.getValue()); flash(el.copyBtn, '✓ 복사됨'); } catch (_) { flash(el.copyBtn, '복사 실패'); }
  });
  el.resetBtn.addEventListener('click', () => {
    if (!current) return;
    if (!confirm('이 교시의 기본 예제 코드로 되돌릴까요? (지금 코드는 사라집니다)')) return;
    store.del('code:' + current.id);
    setEditor(defaultCode(current), '기본 예제');
  });

  function flash(btn, text) {
    const old = btn.textContent;
    btn.textContent = text;
    setTimeout(() => (btn.textContent = old), 1200);
  }

  /* ------------------------------------------------------------- 진도 --- */
  const done = new Set(store.get('done', []));
  function setDone(id, v) {
    v ? done.add(id) : done.delete(id);
    store.set('done', [...done]);
    renderProgress();
    $$(`[data-lesson="${id}"]`, el.nav).forEach((a) => a.classList.toggle('done', v));
  }
  function renderProgress() {
    const n = C.lessons.filter((l) => done.has(l.id)).length;
    el.progressText.textContent = `${n} / ${C.lessons.length}`;
    el.progressBar.style.width = (100 * n) / C.lessons.length + '%';
  }

  /* ------------------------------------------------------- 네비게이션 --- */
  function renderNav() {
    const openWeeks = new Set(store.get('openWeeks', [1]));
    const html = [];
    html.push(`<a class="nav-item home" href="#home" data-page="home">🏠 과정 개요 · 시간표</a>`);
    html.push(`<a class="nav-item home" href="#guide" data-page="guide">🧭 실습 환경 사용법</a>`);
    html.push(`<a class="nav-item home" href="#images" data-page="images">🖼️ 샘플 이미지 · 동영상</a>`);
    for (const w of C.weeks) {
      const ls = C.lessons.filter((l) => l.week === w.no);
      html.push(`<details class="week" data-week="${w.no}" ${openWeeks.has(w.no) ? 'open' : ''}>
        <summary><span class="week-no">${w.no}주차</span><span class="week-title">${escapeHtml(w.title)}</span>
          <span class="badge ${w.kind === '교육' ? 'edu' : 'proj'}">${w.kind}</span></summary>
        <ol class="lessons">
          ${ls.map((l) => `<li><a class="nav-item nav-lesson ${done.has(l.id) ? 'done' : ''}" href="#${l.id}" data-lesson="${l.id}"
            data-search="${escapeHtml((l.title + ' ' + l.topics).toLowerCase())}">
            <span class="period">${l.period}교시</span><span class="ltitle">${escapeHtml(l.title)}</span></a></li>`).join('')}
        </ol></details>`);
    }
    el.nav.innerHTML = html.join('');
    $$('details.week', el.nav).forEach((d) => d.addEventListener('toggle', () => {
      store.set('openWeeks', $$('details.week[open]', el.nav).map((x) => Number(x.dataset.week)));
    }));
  }

  el.search.addEventListener('input', () => {
    const q = el.search.value.trim().toLowerCase();
    $$('details.week', el.nav).forEach((d) => {
      let any = false;
      $$('a.nav-lesson', d).forEach((a) => {
        const hit = !q || a.dataset.search.includes(q) || searchLessonBody(a.dataset.lesson, q);
        a.parentElement.hidden = !hit;
        any = any || hit;
      });
      d.hidden = !any;
      if (q && any) d.open = true;
    });
  });
  const bodyIndex = {};
  function searchLessonBody(id, q) {
    if (!bodyIndex[id]) {
      const l = C.byId[id];
      bodyIndex[id] = JSON.stringify([l.goals, l.blocks, l.practice]).toLowerCase();
    }
    return bodyIndex[id].includes(q);
  }

  function highlightNav(key) {
    $$('.nav-item', el.nav).forEach((a) => a.classList.toggle('active', a.dataset.lesson === key || a.dataset.page === key));
    const active = $('.nav-item.active', el.nav);
    if (active) {
      const d = active.closest('details');
      if (d && !d.open) d.open = true;
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  /* ------------------------------------------------------- 코드 블록 --- */
  function codeBlockHtml(code, title, opts = {}) {
    const id = 'cb' + Math.random().toString(36).slice(2, 9);
    codeStore[id] = tidy(code);
    return `<div class="codeblock ${opts.cls || ''}">
      <div class="codebar"><span class="codetitle">${escapeHtml(title || '코드')}</span><span class="spacer"></span>
        <button class="btn tiny ghost" data-copy="${id}">⧉ 복사</button>
        ${opts.norun ? '<span class="muted tiny">읽기 전용 예시</span>' : `<button class="btn tiny ghost" data-load="${id}" title="에디터로 불러오기">✎ 에디터로</button>
        <button class="btn tiny primary" data-runcode="${id}" title="에디터로 불러와 바로 실행">▶ 실행</button>`}
      </div>
      <pre class="cm-s-material-darker"><code data-code="${id}"></code></pre></div>`;
  }
  const codeStore = {};

  function highlightOne(c) {
    if (c.dataset.hl) return;
    c.dataset.hl = '1';
    const src = codeStore[c.dataset.code];
    if (window.CodeMirror && CodeMirror.runMode) CodeMirror.runMode(src.replace(/\n$/, ''), 'python', c);
    else c.textContent = src;
  }
  function highlightCodes(root) {
    $$('code[data-code]', root).forEach(highlightOne);
  }

  el.content.addEventListener('click', async (e) => {
    const t = e.target.closest('button, input');
    if (!t) return;
    if (t.dataset.copy) {
      try { await navigator.clipboard.writeText(codeStore[t.dataset.copy]); flash(t, '✓ 복사됨'); } catch (_) {}
    } else if (t.dataset.load || t.dataset.runcode) {
      const id = t.dataset.load || t.dataset.runcode;
      const title = t.closest('.codeblock, .practice')?.querySelector('.codetitle, .ptitle')?.textContent || '';
      setEditor(codeStore[id], title);
      if (current) store.set('code:' + current.id, editor.getValue());
      if (t.dataset.runcode) run();
      else editor.focus();
    } else if (t.dataset.toggle) {
      const box = $('#' + t.dataset.toggle);
      box.hidden = !box.hidden;
      if (!box.hidden) highlightCodes(box);
    } else if (t.dataset.quiz !== undefined) {
      answerQuiz(t);
    } else if (t.dataset.done) {
      setDone(t.dataset.done, t.checked);
    } else if (t.dataset.check) {
      const key = 'check:' + t.dataset.check;
      const s = new Set(store.get(key, []));
      t.checked ? s.add(t.value) : s.delete(t.value);
      store.set(key, [...s]);
    }
  });

  function answerQuiz(btn) {
    const q = btn.closest('.quiz-q');
    if (q.classList.contains('answered')) return;
    q.classList.add('answered');
    const right = Number(q.dataset.answer);
    const pick = Number(btn.dataset.quiz);
    $$('button[data-quiz]', q).forEach((b) => {
      const i = Number(b.dataset.quiz);
      if (i === right) b.classList.add('right');
      else if (i === pick) b.classList.add('wrong');
      b.disabled = true;
    });
    $('.explain', q).hidden = false;
    $('.verdict', q).textContent = pick === right ? '정답입니다! 🎉' : '아쉬워요. 해설을 확인하세요.';
    $('.verdict', q).className = 'verdict ' + (pick === right ? 'right' : 'wrong');
  }

  /* ------------------------------------------------------- 교시 화면 --- */
  function defaultCode(l) {
    if (l.starter) return l.starter;
    const first = l.blocks.find((b) => b.type === 'code' && !b.norun);
    if (first) return first.code;
    return `# ${l.week}주차 ${l.period}교시 · ${l.title}\nimport cv2 as cv\nimport numpy as np\n\nimg = cv.imread('messi5.jpg')\ncv.imshow('image', img)\n`;
  }

  function renderBlock(b) {
    switch (b.type) {
      case 'text': return `<div class="block text">${b.html}</div>`;
      case 'tip': return `<div class="block callout tip"><div class="callout-icon">💡</div><div>${b.html}</div></div>`;
      case 'warn': return `<div class="block callout warn"><div class="callout-icon">⚠️</div><div>${b.html}</div></div>`;
      case 'note': return `<div class="block callout note"><div class="callout-icon">📝</div><div>${b.html}</div></div>`;
      case 'code': return `<div class="block">${codeBlockHtml(b.code, b.title, { norun: b.norun })}${b.desc ? `<div class="code-desc">${b.desc}</div>` : ''}</div>`;
      case 'table': return `<div class="block table-wrap"><table>
          <thead><tr>${b.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
          ${b.caption ? `<div class="caption">${b.caption}</div>` : ''}</div>`;
      case 'image': return `<figure class="block figure"><img src="images/${escapeHtml(b.src)}" alt="${escapeHtml(b.caption || b.src)}" loading="lazy">
          <figcaption>${b.caption || b.src}</figcaption></figure>`;
      case 'checklist': {
        const key = current.id + ':' + (b.title || 'list');
        const saved = new Set(store.get('check:' + key, []));
        return `<div class="block checklist"><div class="checklist-title">✅ ${escapeHtml(b.title || '체크리스트')}</div>
          ${b.items.map((it, i) => `<label><input type="checkbox" data-check="${escapeHtml(key)}" value="${i}" ${saved.has(String(i)) ? 'checked' : ''}><span>${it}</span></label>`).join('')}</div>`;
      }
      default: return b.html ? `<div class="block">${b.html}</div>` : '';
    }
  }

  function renderLesson(l) {
    current = l;
    const week = C.weeks.find((w) => w.no === l.week);
    const idx = C.lessons.indexOf(l);
    const prev = C.lessons[idx - 1], next = C.lessons[idx + 1];
    const total = (l.schedule || []).reduce((a, [, m]) => a + m, 0) || 50;

    const parts = [];
    parts.push(`<header class="lesson-head">
      <div class="crumbs"><span class="badge ${week.kind === '교육' ? 'edu' : 'proj'}">${week.kind}</span>
        ${l.week}주차 · ${escapeHtml(week.title)} <span class="sep">›</span> ${l.period}교시</div>
      <h1>${escapeHtml(l.title)}</h1>
      <p class="lead">${l.summary ? l.summary : escapeHtml(l.topics)}</p>
      <div class="refs">📚 OpenCV.org 튜토리얼:
        ${l.ref.map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.label)} ↗</a>`).join('')}</div>
    </header>`);

    if (l.placeholder) {
      parts.push(`<div class="block callout note"><div class="callout-icon">🛠️</div><div><p>이 교시의 상세 내용이 아직 등록되지 않았습니다.</p></div></div>`);
    }

    if (l.goals.length || l.schedule) {
      parts.push(`<section class="overview">
        ${l.goals.length ? `<div class="goals"><h2>🎯 학습 목표</h2><ul>${l.goals.map((g) => `<li>${g}</li>`).join('')}</ul></div>` : ''}
        ${l.schedule ? `<div class="schedule"><h2>⏱️ 수업 흐름 (${total}분)</h2>
          <div class="timeline">${l.schedule.map(([name, m], i) => `<div class="seg s${i % 6}" style="flex:${m}" title="${escapeHtml(name)} ${m}분"><span>${escapeHtml(name)}</span><b>${m}′</b></div>`).join('')}</div></div>` : ''}
      </section>`);
    }

    parts.push(`<section class="blocks">${l.blocks.map(renderBlock).join('')}</section>`);

    if (l.practice.length) {
      parts.push(`<section class="practice-list"><h2 class="section-title">🧪 실습 과제</h2>
        ${l.practice.map((p, i) => {
          const hid = `hint-${l.id}-${i}`, sid = `sol-${l.id}-${i}`;
          const starterId = 'cb' + Math.random().toString(36).slice(2, 9);
          codeStore[starterId] = tidy(p.starter || defaultCode(l));
          return `<article class="practice">
            <div class="practice-head"><span class="pnum">${i + 1}</span><h3 class="ptitle">${escapeHtml(p.title)}</h3></div>
            <div class="pdesc">${p.desc || ''}</div>
            <div class="pactions">
              <button class="btn small primary" data-load="${starterId}">✎ 시작 코드 불러오기</button>
              ${p.hint ? `<button class="btn small ghost" data-toggle="${hid}">💡 힌트</button>` : ''}
              ${p.solution ? `<button class="btn small ghost" data-toggle="${sid}">🔑 정답 코드</button>` : ''}
            </div>
            ${p.hint ? `<div id="${hid}" class="hint" hidden>${p.hint}</div>` : ''}
            ${p.solution ? `<div id="${sid}" class="solution" hidden>${codeBlockHtml(p.solution, '정답 예시 · ' + p.title)}</div>` : ''}
          </article>`;
        }).join('')}</section>`);
    }

    if (l.quiz.length) {
      parts.push(`<section class="quiz"><h2 class="section-title">❓ 확인 퀴즈</h2>
        ${l.quiz.map((q, i) => `<div class="quiz-q" data-answer="${q.answer}">
          <p class="qtext"><b>Q${i + 1}.</b> ${q.q}</p>
          <div class="options">${q.options.map((o, j) => `<button class="opt" data-quiz="${j}"><span class="optno">${'①②③④⑤⑥'[j]}</span> ${o}</button>`).join('')}</div>
          <div class="verdict"></div>
          <div class="explain" hidden>${q.explain || ''}</div></div>`).join('')}</section>`);
    }

    parts.push(`<footer class="lesson-foot">
      <label class="done-toggle"><input type="checkbox" data-done="${l.id}" ${done.has(l.id) ? 'checked' : ''}> 이 교시 학습 완료</label>
      <div class="pager">
        ${prev ? `<a class="btn ghost" href="#${prev.id}">← ${prev.week}주 ${prev.period}교시</a>` : ''}
        ${next ? `<a class="btn primary" href="#${next.id}">${next.week}주 ${next.period}교시 →</a>` : ''}
      </div></footer>`);

    el.content.innerHTML = `<article class="lesson">${parts.join('')}</article>`;
    // 인라인 정답/힌트 영역은 열 때 하이라이트, 나머지는 지금
    $$('code[data-code]', el.content).forEach((c) => { if (!c.closest('[hidden]')) highlightOne(c); });
    el.content.scrollTop = 0;

    const saved = store.get('code:' + l.id, null);
    setEditor(saved || defaultCode(l), saved ? '이어서 작성' : '기본 예제');
    document.title = `${l.week}주 ${l.period}교시 · ${l.title} | OpenCV-Python 강좌`;
  }

  /* ----------------------------------------------------- 특별 페이지 --- */
  function renderHome() {
    current = null;
    const rows = C.weeks.map((w) => {
      const ls = C.lessons.filter((l) => l.week === w.no);
      return `<section class="week-card ${w.kind === '교육' ? 'edu' : 'proj'}">
        <header><span class="week-no">${w.no}주차</span><h3>${escapeHtml(w.title)}</h3><span class="badge ${w.kind === '교육' ? 'edu' : 'proj'}">${w.kind}</span></header>
        <p class="muted">${escapeHtml(w.desc)}</p>
        <ol class="period-grid">${ls.map((l) => `<li><a href="#${l.id}" class="${done.has(l.id) ? 'done' : ''}">
          <span class="period">${l.period}교시</span><b>${escapeHtml(l.title)}</b><small>${escapeHtml(l.topics)}</small></a></li>`).join('')}</ol>
      </section>`;
    }).join('');
    el.content.innerHTML = `<article class="lesson home">
      <header class="hero">
        <div class="hero-text">
          <div class="crumbs">OpenCV.org 공식 튜토리얼 기반 · Python</div>
          <h1>OpenCV-Python<br>입문부터 Image Processing까지</h1>
          <p class="lead">5주 · 주 8교시(총 40교시). <b>3주 교육</b>으로 이미지 입출력부터 필터·엣지·컨투어·히스토그램까지 익히고,
          <b>2주 프로젝트</b>로 문서 스캐너·동전 분석기·가상 페인터 같은 결과물을 직접 만듭니다.
          설치 없이 브라우저에서 바로 Python 코드를 실행하고, 이미지와 웹캠으로 결과를 확인하세요.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#w1-1">1주차 1교시부터 시작 →</a>
            <a class="btn ghost" href="#guide">실습 환경 사용법</a>
          </div>
        </div>
        <div class="hero-stats">
          <div><b>40</b><span>교시</span></div><div><b>24</b><span>교육</span></div><div><b>16</b><span>프로젝트</span></div>
        </div>
      </header>
      <div class="block table-wrap"><table class="plan">
        <thead><tr><th>구분</th><th>주차</th><th>주제</th><th>핵심 결과물</th></tr></thead>
        <tbody>
          <tr><td rowspan="3"><span class="badge edu">교육</span></td><td>1주</td><td>입문 · GUI · 코어 연산</td><td>그림판, 컬러 팔레트, 로고 합성</td></tr>
          <tr><td>2주</td><td>Image Processing Ⅰ</td><td>색상 추적기, 원근 보정, 이진화·필터 비교</td></tr>
          <tr><td>3주</td><td>Image Processing Ⅱ</td><td>엣지·컨투어 분석, 히스토그램, 템플릿·허프 검출</td></tr>
          <tr><td rowspan="2"><span class="badge proj">프로젝트</span></td><td>4주</td><td>가이드 프로젝트 · 기획</td><td>문서 스캐너, 동전·도형 분석기, 가상 페인터, 필터 앱</td></tr>
          <tr><td>5주</td><td>구현 · 발표</td><td>팀 프로젝트 완성, 발표, 회고</td></tr>
        </tbody></table></div>
      ${rows}
    </article>`;
    el.content.scrollTop = 0;
    setEditor(`# 자유 실습 공간입니다. 왼쪽에서 교시를 고르면 해당 예제가 열립니다.\nimport cv2 as cv\nimport numpy as np\n\nimg = cv.imread('messi5.jpg')\nprint(img.shape)\ncv.imshow('messi', img)\n`, '자유 실습');
    document.title = 'OpenCV-Python 5주 강좌';
  }

  function renderGuide() {
    current = null;
    el.content.innerHTML = `<article class="lesson">
      <header class="lesson-head"><div class="crumbs">안내</div><h1>실습 환경 사용법</h1>
        <p class="lead">이 강좌는 브라우저 안에서 진짜 Python과 OpenCV(opencv-python ${'4.11'})를 실행합니다. 설치가 필요 없어요.</p></header>
      <section class="blocks">
        <div class="block text"><h3>1. 화면 구성</h3>
          <ul><li><b>왼쪽</b> — 주차/교시 네비게이션, 진도, 검색</li>
          <li><b>가운데 위</b> — 강좌 내용(개념 · 예제 · 실습 과제 · 퀴즈)</li>
          <li><b>가운데 아래</b> — 코드 에디터. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> 또는 <b>▶ 실행</b></li>
          <li><b>오른쪽</b> — 입력 소스(이미지/웹캠), 트랙바, <code>cv.imshow()</code> 결과 창, 콘솔(<code>print</code> 출력과 오류)</li></ul>
          <p>경계선을 드래그하면 각 영역의 크기를 조절할 수 있습니다. 작성한 코드와 진도는 이 브라우저에 자동 저장됩니다.</p></div>
        <div class="block text"><h3>2. 데스크톱 OpenCV와 다른 점</h3></div>
        <div class="block table-wrap"><table><thead><tr><th>데스크톱 코드</th><th>웹 실습 환경</th></tr></thead><tbody>
          <tr><td><code>cv.imshow('win', img)</code></td><td>오른쪽 패널에 창 카드로 표시. 마우스를 올리면 좌표와 픽셀값(B,G,R)이 보입니다. ⤢ 크게 보기, ⬇ 다운로드</td></tr>
          <tr><td><code>cv.waitKey(0)</code>, <code>cv.destroyAllWindows()</code></td><td>그대로 써도 되지만 기다리지 않고 바로 넘어갑니다</td></tr>
          <tr><td><code>cap = cv.VideoCapture('vtest.avi')</code> / <code>cv.VideoCapture(0)</code></td><td>동영상을 입력 소스로 열거나 웹캠을 켠 뒤 실행합니다. <code>cap.read()</code> 는 지금 화면의 프레임 1장, <code>cap.get()</code>/<code>cap.set()</code> 으로 FPS·프레임 수·탐색</td></tr>
          <tr><td><code>while True: ret, frame = cap.read() …</code></td><td><b>사용 불가</b> → <code>def process(frame):</code> 를 정의하고 결과를 <code>return</code> (동영상·웹캠의 매 프레임에 자동 적용)</td></tr>
          <tr><td><code>cv.createTrackbar</code> / <code>cv.setMouseCallback</code></td><td>그대로 동작. 슬라이더를 움직이거나 창을 클릭하면 콜백 → 화면 자동 갱신</td></tr>
          <tr><td><code>cv.imwrite('out.png', img)</code></td><td>가상 폴더에 저장되고 콘솔에 다운로드 링크가 나타납니다</td></tr>
          <tr><td><code>plt.show()</code></td><td>그래프가 결과 패널에 그림으로 표시됩니다 (라벨은 영어 권장)</td></tr>
        </tbody></table></div>
        <div class="block text"><h3>3. 실시간 처리: process(frame)</h3>
          <p>코드에 <code>process</code> 함수가 있으면, 실행 후 오른쪽 <b>입력 소스</b>의 영상이 이 함수로 전달됩니다.
          입력이 <b>📷 웹캠</b>이나 <b>🎞️ 동영상</b>이면 매 프레임마다, <b>이미지</b>면 한 번(그리고 트랙바를 움직일 때마다) 호출됩니다. 반환한 이미지는 <code>result</code> 창에 나타납니다.
          동영상은 패널의 재생 컨트롤로 일시정지·탐색할 수 있고, 웹캠이 없어도 동영상으로 같은 실습을 할 수 있습니다.</p></div>
        <div class="block">${codeBlockHtml(`import cv2 as cv\n\ndef process(frame):\n    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)\n    edges = cv.Canny(gray, 100, 200)\n    return edges\n`, '예제 · 입력 영상을 실시간으로 엣지 검출')}</div>
        <div class="block text"><h3>4. 입력 이미지 · 동영상</h3>
          <p>OpenCV 공식 튜토리얼의 샘플 이미지가 미리 들어 있어 <code>cv.imread('messi5.jpg')</code>처럼 이름만 쓰면 됩니다.
          샘플 동영상 <code>vtest.avi</code>(보행자), <code>Megamind.avi</code>(애니메이션), <code>cup.mp4</code>(움직이는 컵)는 <code>cv.VideoCapture('vtest.avi')</code> 로 엽니다.
          <b>⬆ 업로드</b>로 내 사진·동영상을 추가하거나, 웹캠/동영상에서 <b>📸 스냅샷</b>을 찍어 <code>webcam.png</code>·<code>frame.png</code> 로 쓸 수 있습니다.
          <code>import webcv</code> 후 <code>webcv.get_input()</code> 을 호출하면 지금 선택된 입력을 바로 가져옵니다.</p></div>
        <div class="block callout warn"><div class="callout-icon">⚠️</div><div><p>웹캠은 <b>http://localhost</b> 또는 <b>https</b> 주소에서만 켜집니다. 폴더의 <code>start.bat</code>(또는 <code>python -m http.server</code>)로 실행하세요.
          처음 접속하면 Python/OpenCV를 내려받느라 수십 초가 걸리며, 이후에는 브라우저 캐시로 빨라집니다.</p></div></div>
        <div class="block callout tip"><div class="callout-icon">💡</div><div><p>코드가 멈춘 것 같으면 <code>while</code> 문이 끝나지 않는지 확인하세요. 브라우저 탭을 새로고침하면 복구됩니다(코드는 저장되어 있음).</p></div></div>
      </section></article>`;
    highlightCodes(el.content);
    el.content.scrollTop = 0;
    setEditor(`import cv2 as cv\n\ndef process(frame):\n    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)\n    edges = cv.Canny(gray, 100, 200)\n    return edges\n`, '사용법 예제');
  }

  function renderImages() {
    current = null;
    const imgs = window.SAMPLE_IMAGES || [];
    el.content.innerHTML = `<article class="lesson">
      <header class="lesson-head"><div class="crumbs">자료</div><h1>샘플 이미지</h1>
        <p class="lead">OpenCV 공식 저장소(<a href="https://github.com/opencv/opencv/tree/4.x/samples/data" target="_blank" rel="noopener">samples/data</a>,
        doc/py_tutorials)의 이미지입니다. 코드에서 파일 이름으로 바로 읽을 수 있습니다.</p></header>
      <div class="gallery">${imgs.map((i) => `<figure class="gcard">
        <img src="images/${i.name}" alt="${escapeHtml(i.desc)}" loading="lazy">
        <figcaption><code>${i.name}</code><span>${escapeHtml(i.desc)}</span><small class="muted">${escapeHtml(i.use)}</small>
        <button class="btn tiny ghost" data-load="${(() => { const id = 'cb' + Math.random().toString(36).slice(2, 9); codeStore[id] = `import cv2 as cv\n\nimg = cv.imread('${i.name}')\nprint('${i.name}', img.shape, img.dtype)\ncv.imshow('${i.name}', img)\n`; return id; })()}">✎ 읽어보기</button></figcaption>
      </figure>`).join('')}</div>
      <h2 class="section-title" style="margin-top:32px">🎞️ 샘플 동영상</h2>
      <p class="muted">OpenCV 저장소의 <code>samples/data/vtest.avi</code>, <code>Megamind.avi</code>, <code>doc/js_tutorials/js_assets/cup.mp4</code> 를 브라우저에서 재생 가능한 MP4 로 변환했습니다. 튜토리얼의 원래 이름으로 열 수 있습니다.</p>
      <div class="gallery">${[['vtest.mp4', 'vtest.avi', '거리의 보행자 · 768×576 · 10fps'], ['Megamind.mp4', 'Megamind.avi', '애니메이션 장면 · 720×528 · 24fps'], ['cup.mp4', 'cup.mp4', '움직이는 컵 · 640×480 · 27fps']].map(([file, name, desc]) => `<figure class="gcard">
        <video src="videos/${file}" muted loop playsinline preload="metadata" onmouseenter="this.play()" onmouseleave="this.pause()"></video>
        <figcaption><code>${name}</code><span>${desc}</span>
        <button class="btn tiny ghost" data-load="${(() => { const id = 'cb' + Math.random().toString(36).slice(2, 9); codeStore[id] = `import cv2 as cv\n\ncap = cv.VideoCapture('${name}')\nprint('FPS:', cap.get(cv.CAP_PROP_FPS), '프레임 수:', cap.get(cv.CAP_PROP_FRAME_COUNT))\nret, frame = cap.read()\ncv.imshow('frame', frame)\n\n# 모든 프레임 처리: 입력 소스가 동영상일 때 매 프레임 호출\ndef process(frame):\n    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)\n    return gray\n`; return id; })()}">✎ 열어보기</button></figcaption>
      </figure>`).join('')}</div></article>`;
    el.content.scrollTop = 0;
  }

  /* -------------------------------------------------------------- 라우팅 --- */
  function route() {
    const key = decodeURIComponent(location.hash.slice(1)) || store.get('last', 'home');
    if (C.byId[key]) renderLesson(C.byId[key]);
    else if (key === 'guide') renderGuide();
    else if (key === 'images') renderImages();
    else renderHome();
    highlightNav(C.byId[key] || ['guide', 'images'].includes(key) ? key : 'home');
    store.set('last', key);
  }
  window.addEventListener('hashchange', route);

  /* ---------------------------------------------------- 영역 크기 조절 --- */
  function initResizers() {
    const root = document.documentElement;
    const sizes = store.get('sizes', {});
    for (const [k, v] of Object.entries(sizes)) root.style.setProperty('--' + k, v + 'px');
    $$('[data-resize]').forEach((g) => {
      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        g.setPointerCapture(e.pointerId);
        const kind = g.dataset.resize;
        document.body.classList.add('resizing');
        const move = (ev) => {
          let v;
          if (kind === 'nav') v = Math.max(200, Math.min(420, ev.clientX));
          else if (kind === 'out') v = Math.max(300, Math.min(window.innerWidth * 0.6, window.innerWidth - ev.clientX));
          else {
            const r = $('#center').getBoundingClientRect();
            v = Math.max(120, Math.min(r.height - 120, r.bottom - ev.clientY));
          }
          const name = kind === 'nav' ? 'nav-w' : kind === 'out' ? 'out-w' : 'editor-h';
          root.style.setProperty('--' + name, v + 'px');
          sizes[name] = Math.round(v);
          editor.refresh();
        };
        const up = () => {
          g.removeEventListener('pointermove', move);
          document.body.classList.remove('resizing');
          store.set('sizes', sizes);
          editor.refresh();
        };
        g.addEventListener('pointermove', move);
        g.addEventListener('pointerup', up, { once: true });
      });
    });
  }

  $('#clearConsoleBtn').addEventListener('click', () => Runtime.clearConsole());

  window.App = { markErrorLine, run, editor, route };

  renderNav();
  renderProgress();
  initResizers();
  route();
})();
