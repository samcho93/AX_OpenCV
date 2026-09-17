/* =========================================================================
 * 슬라이드(페이지) 보기 · 전체 화면 발표 · 교사용 노트
 *  - lesson.deck (slides/weekN.js 의 COURSE.addSlides 로 등록한 요약 슬라이드)이 있으면 사용
 *  - 없으면 강좌 본문(blocks)에서 자동으로 슬라이드를 만든다
 * ========================================================================= */
(function () {
  const W = 1280, H = 720;
  const CHANNEL = 'ocv-presenter';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tidy = (code) => String(code || '').replace(/^\s*\n/, '').replace(/\s+$/, '') + '\n';
  const NUMS = '①②③④⑤⑥';

  function textOf(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent.replace(/\s+/g, ' ').trim();
  }
  function shorten(html, max = 110) {
    const t = textOf(html);
    if (t.length <= max) return html.trim();
    const m = t.match(/^(.{20,}?(?:다|요|음|함)\.)(\s|$)/);
    let s = m && m[1].length <= max ? m[1] : t.slice(0, max - 1) + '…';
    return esc(s);
  }
  const stripNum = (t) => t.replace(/^\s*\d+[.)]\s*/, '').trim();

  /* ---------------------------------------------------- 슬라이드 만들기 --- */
  function codeBlocks(l) { return l.blocks.filter((b) => b.type === 'code'); }

  /** 본문(blocks) → 슬라이드 자동 생성 (요약 슬라이드가 없는 교시용) */
  function autoBody(l) {
    const out = [];
    let cur = null;
    let codeIdx = 0;
    const push = (s) => { out.push(s); cur = s; return s; };
    for (const b of l.blocks) {
      if (b.type === 'text') {
        const d = document.createElement('div');
        d.innerHTML = b.html;
        let slide = null;
        for (const node of [...d.children]) {
          const tag = node.tagName;
          if (tag === 'H3' || ((tag === 'H4' || tag === 'H2') && !slide)) {
            slide = push({ kind: 'bullets', title: stripNum(node.textContent), points: [], notes: '' });
          } else {
            if (!slide) slide = push({ kind: 'bullets', title: cur ? cur.title : l.title, points: [], notes: '' });
            if (tag === 'H4') slide.points.push(`<b>${esc(node.textContent)}</b>`);
            else if (tag === 'UL' || tag === 'OL') [...node.children].forEach((li) => slide.points.push(shorten(li.innerHTML)));
            else if (tag === 'P') slide.points.push(shorten(node.innerHTML));
            else if (tag === 'TABLE') slide.html = (slide.html || '') + node.outerHTML;
          }
        }
        if (slide) slide.notes += `<p>${esc(textOf(b.html))}</p>`;
      } else if (b.type === 'code') {
        push({ kind: 'code', title: b.title || '예제', example: codeIdx, notes: b.desc || '' });
        codeIdx++;
      } else if (b.type === 'table') {
        const rows = b.rows;
        for (let i = 0; i < rows.length; i += 7) {
          push({ kind: 'table', title: (cur && cur.kind === 'bullets' ? cur.title : '정리 표') + (i ? ' (계속)' : ''),
            table: { head: b.head, rows: rows.slice(i, i + 7) }, notes: b.caption || '' });
        }
      } else if (b.type === 'image') {
        push({ kind: 'image', title: b.caption || b.src, image: b.src, caption: b.caption || '' });
      } else if (b.type === 'tip' || b.type === 'warn' || b.type === 'note') {
        const call = { type: b.type, html: shorten(b.html, 160) };
        if (cur && cur.kind === 'bullets' && (cur.callouts || []).length < 1 && cur.points.length <= 4) (cur.callouts = cur.callouts || []).push(call);
        else push({ kind: 'bullets', title: b.type === 'warn' ? '주의' : '팁', points: [], callouts: [call], notes: `<p>${esc(textOf(b.html))}</p>` });
      } else if (b.type === 'checklist') {
        push({ kind: 'bullets', title: b.title || '체크리스트', points: b.items.map((x) => '☐ ' + x), notes: '' });
      }
    }
    // 글머리표가 너무 많은 슬라이드는 나누기
    const split = [];
    for (const s of out) {
      if (s.kind === 'bullets' && s.points.length > 6) {
        for (let i = 0; i < s.points.length; i += 5) {
          split.push({ ...s, title: s.title + (i ? ' (계속)' : ''), points: s.points.slice(i, i + 5), callouts: i + 5 >= s.points.length ? s.callouts : null, html: i ? '' : s.html });
        }
      } else if (!(s.kind === 'bullets' && !s.points.length && !s.html && !(s.callouts || []).length)) {
        split.push(s);
      }
    }
    return split;
  }

  /** 교시 → 전체 슬라이드 목록 */
  function build(l) {
    const deck = l.deck || null;
    const slides = [];
    slides.push({ kind: 'title', title: l.title, notes: deck && deck.intro ? deck.intro : '' });
    if (l.goals.length || l.schedule) slides.push({ kind: 'goals', title: '학습 목표와 수업 흐름', notes: deck && deck.goalsNotes ? deck.goalsNotes : '' });

    const body = deck && deck.slides ? deck.slides.map((s) => normalize(s)) : autoBody(l);
    slides.push(...body);

    const hasPractice = body.some((s) => s.kind === 'practice');
    const hasQuiz = body.some((s) => s.kind === 'quiz');
    if (!hasPractice) l.practice.forEach((p, i) => slides.push({ kind: 'practice', title: p.title, practice: i, notes: (deck && deck.practiceNotes && deck.practiceNotes[i]) || '' }));
    if (!hasQuiz) l.quiz.forEach((q, i) => slides.push({ kind: 'quiz', title: `확인 퀴즈 ${i + 1}`, quiz: i, notes: '' }));
    slides.push({ kind: 'end', title: '정리', points: deck && deck.summary ? deck.summary : l.goals, notes: deck && deck.next ? deck.next : '' });
    return slides;
  }

  function normalize(s) {
    const n = { ...s, notes: s.notes || '' };
    if (s.example !== undefined) n.kind = 'code';
    else if (s.practice !== undefined) n.kind = 'practice';
    else if (s.quiz !== undefined) n.kind = 'quiz';
    else if (s.table) n.kind = 'table';
    else if (s.image && !(s.points || []).length) n.kind = 'image';
    else n.kind = 'bullets';
    n.points = s.points || [];
    return n;
  }

  /* ------------------------------------------------------ 슬라이드 HTML --- */
  function slideHtml(s, ctx) {
    const { l, role, index, total } = ctx;
    s = { ...s, points: s.points || [] };
    const teacher = role === 'teacher';
    const foot = `<footer class="sl-foot"><span>${l.week}주차 ${l.period}교시 · ${esc(l.title)}</span><span>${index + 1} / ${total}</span></footer>`;
    const callouts = (s.callouts || []).map((c) => `<div class="sl-callout ${c.type}">${c.type === 'warn' ? '⚠️' : c.type === 'note' ? '📝' : '💡'} <span>${c.html}</span></div>`).join('')
      + (s.tip ? `<div class="sl-callout tip">💡 <span>${s.tip}</span></div>` : '')
      + (s.warn ? `<div class="sl-callout warn">⚠️ <span>${s.warn}</span></div>` : '');
    const heading = (icon) => `<h2 class="sl-title">${icon ? `<span class="sl-icon">${icon}</span>` : ''}${s.title ? s.title : ''}</h2>`;

    switch (s.kind) {
      case 'title': {
        const week = COURSE.weeks.find((w) => w.no === l.week);
        return `<div class="sl sl-cover">
          <div class="sl-cover-top"><span class="sl-badge ${week.kind === '교육' ? 'edu' : 'proj'}">${week.kind}</span> ${l.week}주차 · ${esc(week.title)}</div>
          <div class="sl-cover-period">${l.period}교시</div>
          <h1>${esc(l.title)}</h1>
          <p class="sl-cover-sum">${l.summary || esc(l.topics)}</p>
          <div class="sl-cover-ref">📚 ${l.ref.map((r) => esc(r.label)).join(' · ')}</div>
          ${teacher ? '<div class="sl-teacher-tag">🧑‍🏫 교사용</div>' : ''}
          ${foot}</div>`;
      }
      case 'goals': {
        const total = (l.schedule || []).reduce((a, [, m]) => a + m, 0);
        return `<div class="sl">${heading('🎯')}
          <ul class="sl-points">${l.goals.map((g) => `<li>${g}</li>`).join('')}</ul>
          ${l.schedule ? `<div class="sl-sched"><div class="sl-sched-label">⏱️ 수업 흐름 ${total}분</div><div class="sl-timeline">${l.schedule.map(([n, m], i) => `<div class="seg s${i % 6}" style="flex:${m}"><span>${esc(n)}</span><b>${m}′</b></div>`).join('')}</div></div>` : ''}
          ${foot}</div>`;
      }
      case 'bullets': {
        const img = s.image ? `<figure class="sl-side-img"><img src="images/${esc(s.image)}" alt=""><figcaption>${esc(s.caption || s.image)}</figcaption></figure>` : '';
        return `<div class="sl ${img ? 'sl-split' : ''}">${heading('')}
          <div class="sl-body"><div class="sl-main">
            ${s.points.length ? `<ul class="sl-points ${s.points.length > 4 ? 'dense' : ''}">${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : ''}
            ${s.html ? `<div class="sl-html">${s.html}</div>` : ''}
            ${callouts}</div>${img}</div>
          ${foot}</div>`;
      }
      case 'table': {
        return `<div class="sl">${heading('')}
          ${s.points && s.points.length ? `<ul class="sl-points small">${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : ''}
          <div class="sl-table"><table><thead><tr>${s.table.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${s.table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
          ${callouts}${foot}</div>`;
      }
      case 'image':
        return `<div class="sl">${heading('')}<figure class="sl-image"><img src="images/${esc(s.image)}" alt=""><figcaption>${esc(s.caption || '')}</figcaption></figure>${foot}</div>`;
      case 'code': {
        const b = codeBlocks(l)[s.example];
        if (!b) return `<div class="sl">${heading('💻')}<p>예제를 찾을 수 없습니다 (example: ${s.example})</p>${foot}</div>`;
        return `<div class="sl sl-code">${heading('💻')}
          ${s.points.length ? `<ul class="sl-points small">${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : ''}
          <div class="sl-codebox"><div class="sl-codebar"><span>${esc(b.title || '예제 코드')}</span><span class="spacer"></span>
            ${b.norun ? '<span class="sl-muted">읽기 전용 (데스크톱 코드)</span>' : `<button class="sl-btn" data-act="load-example" data-i="${s.example}">✎ 에디터로</button>
            <button class="sl-btn primary" data-act="run-example" data-i="${s.example}">▶ 실행</button>`}</div>
            <pre class="cm-s-material-darker"><code data-src="example" data-i="${s.example}"></code></pre></div>
          ${callouts}${foot}</div>`;
      }
      case 'practice': {
        const p = l.practice[s.practice];
        if (!p) return `<div class="sl">${heading('🧪')}${foot}</div>`;
        return `<div class="sl sl-practice">${heading('🧪')}
          <div class="sl-pdesc">${p.desc || ''}</div>
          <div class="sl-actions">
            <button class="sl-btn primary" data-act="load-starter" data-i="${s.practice}">✎ 시작 코드 불러오기</button>
            ${p.hint ? `<button class="sl-btn" data-act="toggle" data-target="hint">💡 힌트</button>` : ''}
            ${teacher && p.solution ? `<button class="sl-btn" data-act="run-solution" data-i="${s.practice}">🔑 정답 코드 실행</button>` : ''}
          </div>
          ${p.hint ? `<div class="sl-hint" data-box="hint" hidden>${p.hint}</div>` : ''}
          ${callouts}${foot}</div>`;
      }
      case 'quiz': {
        const q = l.quiz[s.quiz];
        if (!q) return `<div class="sl">${heading('❓')}${foot}</div>`;
        return `<div class="sl sl-quiz" data-answer="${q.answer}">${heading('❓')}
          <p class="sl-q">${q.q}</p>
          <div class="sl-options">${q.options.map((o, j) => `<button class="sl-opt" data-act="opt" data-j="${j}"><span>${NUMS[j]}</span> ${o}</button>`).join('')}</div>
          <div class="sl-actions"><button class="sl-btn" data-act="reveal">정답 공개</button></div>
          <div class="sl-explain" hidden><b>정답 ${NUMS[q.answer]}</b> — ${q.explain || ''}</div>
          ${foot}</div>`;
      }
      case 'end': {
        const idx = COURSE.lessons.indexOf(l);
        const next = COURSE.lessons[idx + 1];
        return `<div class="sl sl-end">${heading('✅')}
          <ul class="sl-points">${(s.points || []).map((p) => `<li>${p}</li>`).join('')}</ul>
          ${next ? `<div class="sl-next">다음 시간 · ${next.week}주차 ${next.period}교시 <b>${esc(next.title)}</b><br><span>${esc(next.topics)}</span></div>` : '<div class="sl-next">🎉 과정을 모두 마쳤습니다!</div>'}
          ${foot}</div>`;
      }
      default:
        return `<div class="sl">${heading('')}${foot}</div>`;
    }
  }

  /** 교사용 노트: 작성된 노트 + 자동 보조 정보(퀴즈 정답, 실습 힌트 등) */
  function notesHtml(s, l) {
    let html = s.notes || '';
    if (s.kind === 'quiz' && l.quiz[s.quiz]) {
      const q = l.quiz[s.quiz];
      html += `<p><b>정답 ${NUMS[q.answer]}</b> ${esc(textOf(q.options[q.answer]))}</p><p>${q.explain || ''}</p>`;
    }
    if (s.kind === 'practice' && l.practice[s.practice]) {
      const p = l.practice[s.practice];
      if (p.hint) html += `<p><b>힌트</b> ${textOf(p.hint)}</p>`;
      html += '<p class="muted">‘🔑 정답 코드 실행’으로 완성 결과를 보여줄 수 있습니다. 학생 화면에는 정답 버튼이 없습니다.</p>';
    }
    if (s.kind === 'code') {
      const b = codeBlocks(l)[s.example];
      if (b && b.desc && !html.includes(textOf(b.desc).slice(0, 20))) html += `<p class="muted">${textOf(b.desc)}</p>`;
    }
    if (s.kind === 'goals' && l.schedule) html += `<p class="muted">시간 배분: ${l.schedule.map(([n, m]) => `${n} ${m}분`).join(' → ')}</p>`;
    return html || '<p class="muted">(이 슬라이드에는 노트가 없습니다)</p>';
  }

  /* -------------------------------------------------------------- Deck --- */
  let active = null;
  let channel = null;
  try { channel = new BroadcastChannel(CHANNEL); } catch (_) {}

  class Deck {
    constructor(root, lesson, opts) {
      this.root = root;
      this.l = lesson;
      this.role = opts.role;
      this.api = opts.api;
      this.slides = build(lesson);
      this.key = 'ocv:slide:' + lesson.id;
      let saved = 0;
      try { saved = Number(localStorage.getItem(this.key)) || 0; } catch (_) {}
      this.i = Math.min(Math.max(0, saved), this.slides.length - 1);
      this.timer = { start: null, acc: 0, raf: 0 };
      this.shell();
      this.go(this.i, false);
      this.ro = new ResizeObserver(() => this.fit());
      this.ro.observe(this.wrap);
      active = this;
    }

    shell() {
      const teacher = this.role === 'teacher';
      this.root.innerHTML = `<div class="deck ${teacher ? 'is-teacher' : ''}">
        <div class="deck-bar">
          <button class="icon-btn" data-act="prev" title="이전 (←)">◀</button>
          <span class="deck-count"></span>
          <button class="icon-btn" data-act="next" title="다음 (→, Space)">▶</button>
          <span class="deck-name"></span>
          <span class="spacer"></span>
          ${teacher ? `<span class="deck-timer" title="수업 경과 시간 (클릭: 시작/일시정지)" data-act="timer">⏱ 00:00</span>
          <button class="btn tiny ghost" data-act="timer-reset" title="타이머 초기화">↺</button>
          <button class="btn tiny ghost" data-act="presenter" title="노트·다음 슬라이드가 보이는 발표자 창 (다른 모니터에 띄우기)">🗒 발표자 창</button>` : ''}
          <button class="btn tiny ghost" data-act="overview" title="슬라이드 목록 (G)">▦ 목록</button>
          <button class="btn tiny ghost" data-act="doc" title="스크롤 문서로 보기">📄 문서</button>
          <button class="btn tiny primary" data-act="fullscreen" title="전체 화면 발표 (F)">⛶ 전체 화면</button>
        </div>
        <div class="deck-wrap"><div class="deck-stage"></div></div>
        <div class="deck-progress"><div></div></div>
        ${teacher ? `<div class="deck-notes"><div class="notes-head"><span>🗒 교사용 노트</span><span class="spacer"></span><span class="notes-next"></span></div><div class="notes-body"></div></div>` : ''}
        <div class="deck-overview hidden"></div>
      </div>`;
      this.el = this.root.querySelector('.deck');
      this.wrap = this.el.querySelector('.deck-wrap');
      this.stage = this.el.querySelector('.deck-stage');
      this.stage.style.width = W + 'px';
      this.stage.style.height = H + 'px';
      this.el.addEventListener('click', (e) => this.onClick(e));
      // 슬라이드 빈 곳 클릭 = 다음 (전체 화면에서만)
      this.wrap.addEventListener('click', (e) => {
        if (!document.body.classList.contains('presenting')) return;
        if (e.target.closest('button, a, input, pre, .sl-options, table, .sl-hint, .sl-explain')) return;
        this.go(this.i + 1);
      });
    }

    fit() {
      const r = this.wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const s = Math.min(r.width / W, r.height / H);
      this.stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    }

    go(i, animate = true) {
      i = Math.max(0, Math.min(this.slides.length - 1, i));
      const s = this.slides[i];
      this.i = i;
      try { localStorage.setItem(this.key, String(i)); } catch (_) {}
      try { history.replaceState(null, '', `${location.pathname}${location.search}#${this.l.id}@${i + 1}`); } catch (_) {}
      try {
        this.stage.innerHTML = slideHtml(s, { l: this.l, role: this.role, index: i, total: this.slides.length });
      } catch (err) {
        console.error(err);
        this.stage.innerHTML = `<div class="sl"><h2 class="sl-title">슬라이드를 표시할 수 없습니다</h2><p>${esc(err.message)}</p></div>`;
      }
      if (animate) { this.stage.classList.remove('enter'); void this.stage.offsetWidth; this.stage.classList.add('enter'); }
      this.stage.querySelectorAll('code[data-src="example"]').forEach((c) => {
        const b = codeBlocks(this.l)[Number(c.dataset.i)];
        const src = tidy(b.code).replace(/\n$/, '');
        if (window.CodeMirror && CodeMirror.runMode) CodeMirror.runMode(src, 'python', c); else c.textContent = src;
      });
      // 긴 코드·글머리표는 슬라이드 안에 들어오도록 글자 크기를 단계적으로 줄임
      const pre = this.stage.querySelector('.sl-codebox pre');
      if (pre) {
        for (let fs = 19; fs >= 13 && pre.scrollHeight > pre.clientHeight + 2; fs -= 1) pre.style.fontSize = fs + 'px';
      }
      const main = this.stage.querySelector('.sl-main, .sl-pdesc');
      if (main) {
        const sl = this.stage.querySelector('.sl');
        for (let fs = 30; fs >= 20 && main.scrollHeight > main.clientHeight + 2; fs -= 2) sl.style.fontSize = fs + 'px';
      }
      this.el.querySelector('.deck-count').textContent = `${i + 1} / ${this.slides.length}`;
      this.el.querySelector('.deck-name').textContent = s.kind === 'title' ? this.l.title : textOf(s.title || '');
      this.el.querySelector('.deck-progress > div').style.width = ((i + 1) / this.slides.length) * 100 + '%';
      const notes = this.el.querySelector('.notes-body');
      if (notes) {
        notes.innerHTML = notesHtml(s, this.l);
        notes.scrollTop = 0;
        const nx = this.slides[i + 1];
        this.el.querySelector('.notes-next').textContent = nx ? `다음 ▶ ${textOf(nx.kind === 'title' ? this.l.title : nx.title || '')}` : '마지막 슬라이드';
      }
      // 발표 중에는 코드·실습 슬라이드에서만 결과 패널을 보여줌
      document.body.classList.toggle('slide-has-output', s.kind === 'code' || s.kind === 'practice');
      this.fit();
      this.broadcast();
    }

    broadcast() {
      if (!channel || this.role !== 'teacher') return;
      const s = this.slides[this.i];
      const nx = this.slides[this.i + 1];
      channel.postMessage({
        type: 'state', lesson: `${this.l.week}주차 ${this.l.period}교시 · ${this.l.title}`,
        index: this.i, total: this.slides.length,
        title: textOf(s.kind === 'title' ? this.l.title : s.title || ''),
        notes: notesHtml(s, this.l),
        next: nx ? textOf(nx.kind === 'title' ? this.l.title : nx.title || '') : '',
        schedule: this.l.schedule || [],
      });
    }

    onClick(e) {
      const t = e.target.closest('[data-act]');
      if (!t) return;
      const act = t.dataset.act;
      const l = this.l;
      if (act === 'prev') this.go(this.i - 1);
      else if (act === 'next') this.go(this.i + 1);
      else if (act === 'fullscreen') toggleFullscreen();
      else if (act === 'doc') this.api.setView('doc');
      else if (act === 'overview') this.toggleOverview();
      else if (act === 'goto') { this.toggleOverview(false); this.go(Number(t.dataset.i)); }
      else if (act === 'timer') this.toggleTimer();
      else if (act === 'timer-reset') { this.timer.acc = 0; this.timer.start = this.timer.start ? performance.now() : null; this.drawTimer(); }
      else if (act === 'presenter') window.open('presenter.html', 'ocv-presenter', 'width=900,height=640');
      else if (act === 'load-example' || act === 'run-example') {
        const b = codeBlocks(l)[Number(t.dataset.i)];
        this.api.loadCode(b.code, b.title, act === 'run-example');
      } else if (act === 'load-starter') {
        const p = l.practice[Number(t.dataset.i)];
        this.api.loadCode(p.starter || '', p.title, false);
      } else if (act === 'run-solution') {
        const p = l.practice[Number(t.dataset.i)];
        this.api.loadCode(p.solution || '', '정답 · ' + p.title, true);
      } else if (act === 'toggle') {
        const box = this.stage.querySelector(`[data-box="${t.dataset.target}"]`);
        if (box) box.hidden = !box.hidden;
      } else if (act === 'opt' || act === 'reveal') {
        const quiz = t.closest('.sl-quiz');
        if (quiz.classList.contains('answered')) return;
        quiz.classList.add('answered');
        const right = Number(quiz.dataset.answer);
        quiz.querySelectorAll('.sl-opt').forEach((b) => {
          const j = Number(b.dataset.j);
          if (j === right) b.classList.add('right');
          else if (act === 'opt' && j === Number(t.dataset.j)) b.classList.add('wrong');
          b.disabled = true;
        });
        quiz.querySelector('.sl-explain').hidden = false;
      }
    }

    toggleOverview(force) {
      const ov = this.el.querySelector('.deck-overview');
      const show = force === undefined ? ov.classList.contains('hidden') : force;
      if (show) {
        ov.innerHTML = `<div class="ov-head">슬라이드 목록 <span class="muted">(클릭하여 이동 · G 또는 Esc 로 닫기)</span></div><ol>${this.slides.map((s, i) =>
          `<li class="${i === this.i ? 'cur' : ''}" data-act="goto" data-i="${i}"><span class="ov-kind k-${s.kind}">${({ title: '표지', goals: '목표', bullets: '개념', table: '표', image: '그림', code: '예제', practice: '실습', quiz: '퀴즈', end: '정리' })[s.kind] || ''}</span>${esc(textOf(s.kind === 'title' ? this.l.title : s.title || ''))}</li>`).join('')}</ol>`;
      }
      ov.classList.toggle('hidden', !show);
    }

    toggleTimer() {
      if (this.timer.start) { this.timer.acc += performance.now() - this.timer.start; this.timer.start = null; }
      else this.timer.start = performance.now();
      const tick = () => { this.drawTimer(); if (this.timer.start && active === this) this.timer.raf = setTimeout(tick, 500); };
      tick();
    }

    drawTimer() {
      const el = this.el.querySelector('.deck-timer');
      if (!el) return;
      const ms = this.timer.acc + (this.timer.start ? performance.now() - this.timer.start : 0);
      const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60;
      el.textContent = `${this.timer.start ? '⏱' : '⏸'} ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      el.classList.toggle('over', m >= 50);
    }

    destroy() {
      clearTimeout(this.timer.raf);
      this.ro.disconnect();
      document.body.classList.remove('slide-has-output');
      if (active === this) active = null;
    }
  }

  /* ------------------------------------------------------ 전체 화면 --- */
  function toggleFullscreen(force) {
    const on = force === undefined ? !document.body.classList.contains('presenting') : force;
    const app = document.getElementById('app');
    if (on) {
      document.body.classList.add('presenting');
      if (app.requestFullscreen && !document.fullscreenElement) app.requestFullscreen().catch(() => {});
    } else {
      document.body.classList.remove('presenting', 'show-output', 'show-notes');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
    setTimeout(() => { if (active) active.fit(); if (window.App && App.editor) App.editor.refresh(); }, 60);
  }
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && document.body.classList.contains('presenting')) toggleFullscreen(false);
  });

  /* ------------------------------------------------------- 키보드 --- */
  document.addEventListener('keydown', (e) => {
    if (!active || !active.root.isConnected) return;
    const t = e.target;
    if (t.closest && (t.closest('.CodeMirror') || t.closest('input, textarea, select, [contenteditable]'))) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const presenting = document.body.classList.contains('presenting');
    if (['ArrowRight', 'PageDown', ' '].includes(k)) { active.go(active.i + 1); e.preventDefault(); }
    else if (['ArrowLeft', 'PageUp'].includes(k)) { active.go(active.i - 1); e.preventDefault(); }
    else if (k === 'Home') { active.go(0); e.preventDefault(); }
    else if (k === 'End') { active.go(active.slides.length - 1); e.preventDefault(); }
    else if (k === 'f' || k === 'F') toggleFullscreen();
    else if (k === 'g' || k === 'G') active.toggleOverview();
    else if (k === 'Escape') { if (!active.el.querySelector('.deck-overview').classList.contains('hidden')) active.toggleOverview(false); else if (presenting) toggleFullscreen(false); }
    else if ((k === 'r' || k === 'R') && presenting) { document.body.classList.toggle('show-output'); setTimeout(() => active.fit(), 30); }
    else if ((k === 'n' || k === 'N') && presenting && active.role === 'teacher') { document.body.classList.toggle('show-notes'); setTimeout(() => active.fit(), 30); }
    else if ((k === 'b' || k === 'B') && presenting) document.body.classList.toggle('blackout');
    else if ((k === 't' || k === 'T') && active.role === 'teacher') active.toggleTimer();
  });

  /* ---------------------------------------------- 발표자 창 ↔ 슬라이드 --- */
  if (channel) {
    channel.onmessage = (ev) => {
      const m = ev.data || {};
      if (!active) return;
      if (m.type === 'hello') active.broadcast();
      else if (m.type === 'nav') active.go(active.i + (m.dir || 0));
      else if (m.type === 'goto') active.go(m.index);
    };
  }

  window.Slides = {
    mount(root, lesson, opts) { if (active) active.destroy(); return new Deck(root, lesson, opts); },
    unmount() { if (active) active.destroy(); toggleFullscreen(false); },
    fullscreen: toggleFullscreen,
    build,
    get active() { return active; },
  };

  /* slides/weekN.js 에서 교시별 요약 슬라이드 등록 */
  if (window.COURSE) {
    COURSE.addSlides = function (map) {
      for (const [id, deck] of Object.entries(map)) {
        if (this.byId[id]) this.byId[id].deck = deck;
        else console.warn('알 수 없는 교시 id (slides):', id);
      }
    };
  }
})();
