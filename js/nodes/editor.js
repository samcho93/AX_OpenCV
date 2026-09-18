/* =========================================================================
 * 노드 편집 캔버스: 노드 그리기 · 이동 · 연결 · 확대/축소
 * 모델은 NodeGraph 형식(js/nodes/graph.js). 연결선은 변수 이름으로 계산합니다.
 * ========================================================================= */
(function () {
  const G = window.NodeGraph;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svgNS = 'http://www.w3.org/2000/svg';

  class NodeEditor {
    constructor(wrap, opts) {
      this.wrap = wrap;
      this.catalog = opts.catalog;
      this.onChange = opts.onChange || (() => {});
      this.onSelect = opts.onSelect || (() => {});
      this.blocks = new Map(this.catalog.blocks.map((b) => [b.key, b]));
      this.graph = { version: 1, nodes: [] };
      this.view = { x: 0, y: 0, k: 1 };
      this.selected = null;
      this.selectedEdge = null;
      this.els = new Map();
      this.status = new Map();       // id -> {error, warn}
      this.showOptional = new Set();

      wrap.innerHTML = `<div class="ncanvas"><svg class="nedges"><g class="edges"></g><path class="temp-edge" d=""></path></svg><div class="nnodes"></div></div>
        <div class="nzoom"><button data-z="in" title="확대">＋</button><button data-z="out" title="축소">－</button><button data-z="fit" title="전체 보기">⤢</button></div>
        <div class="nempty hidden"><div class="nempty-icon">🧩</div><b>왼쪽 팔레트에서 블록을 끌어오거나 클릭하세요.</b><br>
          강좌 예제의 <b>🧩 노드</b> 버튼을 누르거나, 위의 <b>📚 예제 불러오기</b>로 시작할 수 있어요.</div>`;
      this.canvas = wrap.querySelector('.ncanvas');
      this.svg = wrap.querySelector('.nedges');
      this.edgeLayer = wrap.querySelector('.edges');
      this.tempEdge = wrap.querySelector('.temp-edge');
      this.nodeLayer = wrap.querySelector('.nnodes');
      this.empty = wrap.querySelector('.nempty');
      this.bind();
    }

    /* ----------------------------------------------------------- 공통 --- */
    spec(node) {
      if (node.type === 'call') return this.blocks.get(G.normFn(node.fn)) || null;
      if (node.type === 'frame') return this.blocks.get('frame');
      if (node.type === 'return') return this.blocks.get('return');
      return null;
    }
    title(node) {
      const s = this.spec(node);
      if (node.type === 'code') {
        const first = String(node.code || '').split('\n').find((l) => l.trim() && !l.trim().startsWith('#')) || '';
        if (/^\s*def\s+(\w+)/.test(first)) return `함수 정의 · ${first.match(/def\s+(\w+)/)[1]}`;
        if (/^\s*for\s/.test(first)) return '반복문 (for)';
        if (/^\s*while\s/.test(first)) return '반복문 (while)';
        if (/^\s*if\s/.test(first)) return '조건문 (if)';
        if (/^\s*global\s/.test(first)) return '전역 변수 (global)';
        return 'Python 코드';
      }
      return s ? s.title : (node.fn || '함수 호출');
    }
    catOf(node) {
      if (node.type === 'code') return 'code';
      const s = this.spec(node);
      return s ? s.cat : 'util';
    }
    allVars() {
      const set = new Set();
      for (const n of this.graph.nodes) for (const v of G.varsOf(n)) set.add(v);
      return set;
    }
    uniqueVar(base) {
      base = String(base || 'out').replace(/[^\w]/g, '_').replace(/^(\d)/, '_$1') || 'out';
      const used = this.allVars();
      if (!used.has(base)) return base;
      for (let i = 2; ; i++) if (!used.has(`${base}_${i}`)) return `${base}_${i}`;
    }
    nextOrder() { return Math.max(0, ...this.graph.nodes.map((n) => n.order)) + 1; }
    nodeById(id) { return this.graph.nodes.find((n) => n.id === id); }
    newId() {
      let i = this.graph.nodes.length + 1;
      while (this.nodeById('n' + i)) i++;
      return 'n' + i;
    }

    /* ------------------------------------------------------- 그래프 설정 --- */
    setGraph(graph, { fit = true } = {}) {
      this.graph = graph;
      this.selected = null;
      this.renderAll();
      if (fit) requestAnimationFrame(() => this.fit());
    }

    /** 노드 크기를 실제로 잰 뒤 자동 배치 */
    autoLayout() {
      const heights = new Map();
      for (const n of this.graph.nodes) {
        const el = this.els.get(n.id);
        heights.set(n.id, el ? el.offsetHeight : 120);
      }
      G.layout(this.graph, (n) => heights.get(n.id) || 120);
      this.renderAll();
      requestAnimationFrame(() => this.fit());
    }

    /* ------------------------------------------------------------ 그리기 --- */
    renderAll() {
      this.nodeLayer.innerHTML = '';
      this.els.clear();
      this.analysis = G.analyze(this.graph);
      for (const n of this.graph.nodes) this.nodeLayer.appendChild(this.buildNode(n));
      this.empty.classList.toggle('hidden', this.graph.nodes.length > 0);
      this.refresh();
    }

    renderNode(id) {
      const n = this.nodeById(id);
      const old = this.els.get(id);
      if (!n) { if (old) old.remove(); this.els.delete(id); return; }
      this.analysis = G.analyze(this.graph);
      const el = this.buildNode(n);
      if (old) old.replaceWith(el); else this.nodeLayer.appendChild(el);
      this.refresh();
    }

    buildNode(n) {
      const el = document.createElement('div');
      const scope = this.analysis.scope.get(n.id);
      el.className = `nnode t-${n.type} c-${this.catOf(n)} ${scope === 'process' ? 'is-process' : ''} ${this.selected === n.id ? 'sel' : ''}`;
      el.dataset.id = n.id;
      el.style.left = (n.x || 0) + 'px';
      el.style.top = (n.y || 0) + 'px';
      const spec = this.spec(n);
      const rows = [];

      if (n.type === 'call') {
        const args = n.args || [];
        const showAll = this.showOptional.has(n.id);
        const specArgs = spec ? spec.args : [];
        let hidden = 0;
        args.forEach((a, i) => {
          const sa = specArgs.find((x) => x.name === a.name);
          const req = sa ? sa.req : !a.kw;
          const filled = String(a.expr ?? '').trim() !== '';
          if (!req && !filled && !showAll) { hidden++; return; }
          const opts = sa && sa.opts ? sa.opts : null;
          // 노드 id 기준으로 고유하게: 같은 함수(예: cv.imread)를 쓰는 노드가 여러 개면
          // 함수 이름만으로 만든 id 는 문서 안에서 중복돼 datalist 풀다운이 붙었다 떨어졌다 함
          const listId = opts ? `opts-${esc(n.id)}-${esc(a.name)}`.replace(/[^\w-]/g, '_') : '';
          rows.push(`<div class="nn-row in ${req ? 'req' : 'opt'}" data-slot="${i}">
            <span class="port in" data-slot="${i}" title="여기에 연결"></span>
            <label title="${esc(a.name)}${req ? ' (필수)' : ' (선택)'}">${esc(a.name)}</label>
            <input class="nn-expr" data-slot="${i}" value="${esc(a.expr ?? '')}" placeholder="${esc(sa && sa.hint ? sa.hint : (req ? '값 또는 연결' : '생략'))}" spellcheck="false" ${listId ? `list="${listId}"` : ''}>
            ${opts ? `<datalist id="${listId}">${opts.map((o) => `<option value="${esc(o)}">`).join('')}</datalist>` : ''}
          </div>`);
        });
        if (hidden || showAll) rows.push(`<button class="nn-more" data-act="optional">${showAll ? '▴ 선택 인자 숨기기' : `▾ 선택 인자 ${hidden}개`}</button>`);
        const outNames = spec && spec.outs.length ? spec.outs : [];
        const count = Math.max(n.outs.length, (n.outs.length ? 0 : outNames.length));
        for (let j = 0; j < count; j++) {
          const v = n.outs[j] || '';
          rows.push(`<div class="nn-row out" data-port="${j}">
            <span class="out-label">${esc(outNames[j] || (count > 1 ? `출력 ${j + 1}` : '출력'))}</span>
            <input class="nn-var" data-port="${j}" value="${esc(v)}" placeholder="(변수 없음)" spellcheck="false" title="결과를 담을 변수 이름">
            <span class="port out" data-port="${j}" title="끌어서 다른 노드에 연결"></span>
          </div>`);
        }
      } else if (n.type === 'code') {
        const reads = this.analysis.reads.get(n.id) || [];
        if (reads.length) {
          rows.push(`<div class="nn-reads">${reads.map((v) => `<div class="nn-row in read" data-var="${esc(v)}"><span class="port in" data-var="${esc(v)}"></span><span class="chip">${esc(v)}</span></div>`).join('')}</div>`);
        }
        rows.push(`<div class="nn-row in drop" data-slot="code"><span class="port in" data-slot="code" title="연결하면 변수 이름을 코드에 넣습니다"></span>
          <textarea class="nn-code" spellcheck="false" rows="${Math.min(14, Math.max(2, String(n.code || '').split('\n').length))}">${esc(n.code || '')}</textarea></div>`);
        (n.outs || []).forEach((v, j) => {
          rows.push(`<div class="nn-row out" data-port="${j}"><span class="out-label">변수</span><span class="chip out">${esc(v)}</span><span class="port out" data-port="${j}"></span></div>`);
        });
      } else if (n.type === 'frame') {
        rows.push(`<div class="nn-note">오른쪽 <b>입력 소스</b>(이미지 · 🎞️ 동영상 · 📷 웹캠)의 프레임이 매번 들어옵니다.</div>`);
        rows.push(`<div class="nn-row out" data-port="0"><span class="out-label">frame</span>
          <input class="nn-var" data-port="0" value="${esc(n.outs[0] || 'frame')}" spellcheck="false"><span class="port out" data-port="0"></span></div>`);
      } else if (n.type === 'return') {
        rows.push(`<div class="nn-row in req" data-slot="0"><span class="port in" data-slot="0"></span><label>결과</label>
          <input class="nn-expr" data-slot="ret" value="${esc(n.expr || '')}" placeholder="이미지 연결" spellcheck="false"></div>`);
        rows.push(`<div class="nn-note">결과는 <b>result</b> 창과 프리뷰에 매 프레임 표시됩니다.</div>`);
      }

      const icon = { call: 'ƒ', code: '🐍', frame: '📷', return: '⏎' }[n.type];
      el.innerHTML = `
        <div class="nn-head" title="${esc(spec && spec.sig ? spec.sig : (n.type === 'code' ? '직접 작성한 Python 코드' : ''))}">
          <span class="nn-icon">${icon}</span>
          <span class="nn-title">${esc(this.title(n))}</span>
          <span class="nn-scope" title="매 프레임 실행 (process 안)">⟳</span>
          <button class="nn-x" data-act="delete" title="노드 삭제 (Delete)">×</button>
        </div>
        ${n.type === 'call' ? `<div class="nn-fn" title="함수 이름 (속성 탭에서 수정)">${esc(n.fn)}</div>` : ''}
        ${n.comment ? `<div class="nn-comment">${esc(n.comment)}</div>` : ''}
        <div class="nn-rows">${rows.join('')}</div>
        <div class="nn-thumbs"></div>
        <div class="nn-msg"></div>`;
      this.els.set(n.id, el);
      return el;
    }

    /** 분석 결과(연결선, 오류, 범위)만 다시 반영 — 입력 중인 요소는 다시 만들지 않음 */
    refresh() {
      this.analysis = G.analyze(this.graph);
      const a = this.analysis;
      for (const n of this.graph.nodes) {
        const el = this.els.get(n.id);
        if (!el) continue;
        el.classList.toggle('is-process', a.scope.get(n.id) === 'process');
        el.classList.toggle('sel', this.selected === n.id);
        el.querySelectorAll('.nn-row.in').forEach((r) => r.classList.remove('linked', 'linked-expr'));
        el.querySelectorAll('.nn-row.out').forEach((r) => r.classList.remove('linked'));
      }
      for (const e of a.edges) {
        const to = this.els.get(e.to), from = this.els.get(e.from);
        if (to) {
          const row = this.targetRow(to, e);
          if (row) row.classList.add(e.exact ? 'linked' : 'linked-expr');
        }
        if (from) {
          const r = from.querySelector(`.nn-row.out[data-port="${e.fromPort}"]`);
          if (r) r.classList.add('linked');
        }
      }
      const msgs = new Map();
      for (const w of a.warnings) msgs.set(w.id, { cls: 'warn', text: w.msg });
      for (const er of a.errors) msgs.set(er.id, { cls: 'err', text: er.msg });
      for (const [id, st] of this.status) if (st && st.error) msgs.set(id, { cls: 'err', text: st.error });
      for (const n of this.graph.nodes) {
        const el = this.els.get(n.id);
        if (!el) continue;
        const m = msgs.get(n.id);
        el.classList.toggle('has-err', !!m && m.cls === 'err');
        el.classList.toggle('has-warn', !!m && m.cls === 'warn');
        el.querySelector('.nn-msg').textContent = m ? m.text : '';
      }
      this.drawEdges();
    }

    targetRow(el, e) {
      if (e.toSlot === -1) return el.querySelector('.nn-head');
      if (el.classList.contains('t-code')) return el.querySelector(`.nn-row.in.read[data-var="${CSS.escape(e.v)}"]`) || el.querySelector('.nn-row.drop');
      if (el.classList.contains('t-return')) return el.querySelector('.nn-row.in');
      return el.querySelector(`.nn-row.in[data-slot="${e.toSlot}"]`) || el.querySelector('.nn-more') || el.querySelector('.nn-head');
    }

    portPos(el, selector, side) {
      const target = el.querySelector(selector);
      const base = this.canvas.getBoundingClientRect();
      const r = (target || el).getBoundingClientRect();
      const k = this.view.k;
      if (target && target.classList.contains('port')) return [(r.left + r.width / 2 - base.left) / k, (r.top + r.height / 2 - base.top) / k];
      const y = (r.top + Math.min(r.height, 28) / 2 - base.top) / k;
      const er = el.getBoundingClientRect();
      return [((side === 'out' ? er.right : er.left) - base.left) / k, y];
    }

    centerOf(elem) {
      const base = this.canvas.getBoundingClientRect();
      const r = elem.getBoundingClientRect();
      return [(r.left + r.width / 2 - base.left) / this.view.k, (r.top + r.height / 2 - base.top) / this.view.k];
    }

    drawEdges() {
      const a = this.analysis;
      const paths = [];
      for (const e of a.edges) {
        const from = this.els.get(e.from), to = this.els.get(e.to);
        if (!from || !to) continue;
        const p1 = this.portPos(from, `.nn-row.out[data-port="${e.fromPort}"] .port`, 'out');
        const row = this.targetRow(to, e);
        const port = row && row.querySelector('.port');
        const p2 = port ? this.centerOf(port) : this.portPos(to, '.nn-head', 'in');
        const key = `${e.from}>${e.to}:${e.v}`;
        const scopeCls = a.scope.get(e.to) === 'process' ? 'proc' : '';
        paths.push(`<path class="edge ${e.exact ? '' : 'expr'} ${scopeCls} ${this.selectedEdge === key ? 'sel' : ''}" data-key="${esc(key)}" data-from="${e.from}" data-to="${e.to}" data-v="${esc(e.v)}" d="${this.curve(p1, p2)}"></path>
          <path class="edge-hit" data-key="${esc(key)}" data-from="${e.from}" data-to="${e.to}" data-v="${esc(e.v)}" d="${this.curve(p1, p2)}"><title>${esc(e.v)}</title></path>`);
      }
      this.edgeLayer.innerHTML = paths.join('');
    }

    curve([x1, y1], [x2, y2]) {
      const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
      return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
    }

    applyView() {
      const { x, y, k } = this.view;
      this.canvas.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
      this.wrap.style.backgroundPosition = `${x}px ${y}px`;
      this.wrap.style.backgroundSize = `${24 * k}px ${24 * k}px`;
    }

    fit() {
      const nodes = this.graph.nodes;
      const W = this.wrap.clientWidth, H = this.wrap.clientHeight;
      if (!nodes.length) { this.view = { x: 40, y: 40, k: 1 }; this.applyView(); this.drawEdges(); return; }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of nodes) {
        const el = this.els.get(n.id);
        const w = el ? el.offsetWidth : 240, h = el ? el.offsetHeight : 120;
        minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + w); maxY = Math.max(maxY, n.y + h);
      }
      // 너무 작아지지 않게: 최소 0.6 배. 넘치는 부분은 끌어서 이동
      const k = Math.max(0.6, Math.min(1, (W - 60) / (maxX - minX), (H - 60) / (maxY - minY)));
      const cw = (maxX - minX) * k, ch = (maxY - minY) * k;
      this.view = { k, x: (cw < W - 40 ? (W - cw) / 2 : 30) - minX * k, y: (ch < H - 40 ? Math.max(20, (H - ch) / 2) : 24) - minY * k };
      this.applyView();
      this.drawEdges();
    }

    zoomAt(factor, cx, cy) {
      const { x, y, k } = this.view;
      const nk = Math.max(0.2, Math.min(2, k * factor));
      this.view = { k: nk, x: cx - (cx - x) * (nk / k), y: cy - (cy - y) * (nk / k) };
      this.applyView();
      this.drawEdges();
    }

    toCanvas(clientX, clientY) {
      const r = this.wrap.getBoundingClientRect();
      return [(clientX - r.left - this.view.x) / this.view.k, (clientY - r.top - this.view.y) / this.view.k];
    }

    select(id) {
      this.selected = id;
      this.selectedEdge = null;
      for (const [nid, el] of this.els) el.classList.toggle('sel', nid === id);
      this.drawEdges();
      this.onSelect(id);
    }

    /* ------------------------------------------------------ 노드 만들기 --- */
    addBlock(key, at) {
      const b = this.blocks.get(key);
      if (!b) return null;
      const sel = this.selected ? this.nodeById(this.selected) : null;
      const selVar = sel ? (sel.type === 'frame' ? sel.outs[0] : G.varsOf(sel)[0]) : null;
      const hasFrame = this.graph.nodes.some((n) => n.type === 'frame');
      let node;
      if (b.type === 'call') {
        node = {
          type: 'call', fn: b.fn,
          args: b.args.map((a) => ({ name: a.name, kw: !a.req, expr: a.def || '' })),
          outs: (b.outs || []).map((o) => this.uniqueVar(o === 'retval' ? 'result' : o)),
        };
        if (b.perFrame && hasFrame) node.scope = 'process';
        // 선택된 노드의 결과를 첫 번째 인자로 자동 연결
        if (selVar && node.args.length && b.args[0].req) {
          const first = node.args[0];
          if (!first.expr || /^\[?(img|gray|img1)\]?$/.test(first.expr)) first.expr = first.expr.startsWith('[') ? `[${selVar}]` : selVar;
        }
      } else if (b.type === 'code') {
        node = { type: 'code', code: b.code, outs: [...(b.outs || [])] };
        if (b.scope) node.scope = b.scope;
        if (selVar && /\bimg\b/.test(node.code)) node.code = node.code.replace(/\bimg\b/g, selVar);
        node.outs = node.outs.map((o) => {
          if (o === selVar) return o;
          const u = this.uniqueVar(o);
          if (u !== o) node.code = node.code.replace(new RegExp(`\\b${o}\\b`, 'g'), u);
          return u;
        });
      } else if (b.type === 'frame') {
        if (hasFrame) { this.select(this.graph.nodes.find((n) => n.type === 'frame').id); return null; }
        node = { type: 'frame', outs: [this.uniqueVar('frame')] };
      } else if (b.type === 'return') {
        node = { type: 'return', expr: selVar || (this.graph.nodes.find((n) => n.type === 'frame') || { outs: ['frame'] }).outs[0] };
      }
      node.id = this.newId();
      node.order = this.nextOrder();
      if (at) { node.x = at[0]; node.y = at[1]; }
      else if (sel) { node.x = sel.x + (this.els.get(sel.id)?.offsetWidth || 240) + 60; node.y = sel.y; }
      else {
        const [cx, cy] = this.toCanvas(this.wrap.getBoundingClientRect().left + this.wrap.clientWidth / 2, this.wrap.getBoundingClientRect().top + this.wrap.clientHeight / 3);
        node.x = cx - 120; node.y = cy;
      }
      this.graph.nodes.push(node);
      this.empty.classList.add('hidden');
      this.renderAll();
      this.select(node.id);
      this.onChange('add');
      return node;
    }

    deleteNode(id) {
      this.graph.nodes = this.graph.nodes.filter((n) => n.id !== id);
      this.status.delete(id);
      if (this.selected === id) this.selected = null;
      G.renumber(this.graph);
      this.renderAll();
      this.onSelect(this.selected);
      this.onChange('delete');
    }

    duplicate(id) {
      const n = this.nodeById(id);
      if (!n || n.type === 'frame') return;
      const copy = JSON.parse(JSON.stringify(n));
      copy.id = this.newId();
      copy.order = this.nextOrder();
      copy.x += 30; copy.y += 30;
      if (copy.type === 'call') copy.outs = copy.outs.map((o) => (o ? this.uniqueVar(o.replace(/_\d+$/, '')) : o));
      this.graph.nodes.push(copy);
      this.renderAll();
      this.select(copy.id);
      this.onChange('add');
    }

    /** 출력 변수 이름 바꾸기 (이 노드의 값을 쓰던 노드의 식/코드도 함께 수정) */
    renameVar(id, port, name) {
      const n = this.nodeById(id);
      const old = n.outs[port] || '';
      name = String(name || '').trim();
      if (name === old) return;
      if (name && !/^[A-Za-z_]\w*$/.test(name)) { this.renderNode(id); return; }
      const consumers = old ? this.analysis.edges.filter((e) => e.from === id && e.v === old) : [];
      n.outs[port] = name;
      if (old && name) {
        const re = new RegExp(`(^|[^\\w.])${old}(?!\\w)`, 'g');
        for (const e of consumers) {
          const c = this.nodeById(e.to);
          if (c.type === 'call') c.args.forEach((a) => { a.expr = String(a.expr).replace(re, `$1${name}`); });
          else if (c.type === 'code') c.code = c.code.replace(re, `$1${name}`);
          else if (c.type === 'return') c.expr = String(c.expr).replace(re, `$1${name}`);
        }
      }
      this.renderAll();
      this.onChange('rename');
    }

    /** from 노드의 출력(port)을 to 노드의 입력(slot)에 연결 */
    connect(fromId, port, toId, slot) {
      if (fromId === toId) return;
      const from = this.nodeById(fromId), to = this.nodeById(toId);
      if (!from || !to) return;
      let v = from.type === 'frame' ? from.outs[0] : from.outs[port];
      if (!v) {
        const spec = this.spec(from);
        v = this.uniqueVar(spec && spec.outs[port] ? spec.outs[port] : 'out');
        from.outs[port] = v;
        this.renderNode(fromId);
      }
      if (to.type === 'call') {
        const idx = Number(slot);
        if (!to.args[idx]) return;
        const cur = String(to.args[idx].expr || '').trim();
        to.args[idx].expr = /^\[.*\]$/.test(cur) && /^(images|tup|mv)$/.test(to.args[idx].name) ? `[${v}]` : v;
      } else if (to.type === 'return') {
        to.expr = v;
      } else if (to.type === 'code') {
        const el = this.els.get(toId);
        const ta = el && el.querySelector('.nn-code');
        const pos = ta && document.activeElement === ta ? ta.selectionStart : null;
        to.code = pos == null ? `${to.code}${/\n$/.test(to.code) || !to.code ? '' : '\n'}# 입력: ${v}` : to.code.slice(0, pos) + v + to.code.slice(pos);
      } else {
        return;
      }
      if (from.order > to.order) G.moveBefore(this.graph, fromId, toId);
      this.renderNode(toId);
      this.onChange('connect');
    }

    disconnect(toId, v) {
      const to = this.nodeById(toId);
      if (!to) return;
      const re = new RegExp(`^\\s*\\[?\\s*${v}\\s*\\]?\\s*$`);
      if (to.type === 'call') {
        to.args.forEach((a) => { if (re.test(String(a.expr))) a.expr = ''; });
      } else if (to.type === 'return') {
        if (re.test(String(to.expr))) to.expr = '';
      } else {
        return;   // 코드 노드는 코드에서 직접 지워야 함
      }
      this.renderNode(toId);
      this.onChange('disconnect');
    }

    /* ------------------------------------------------------------ 입력 처리 --- */
    bind() {
      const wrap = this.wrap;
      let drag = null;

      wrap.addEventListener('wheel', (e) => {
        e.preventDefault();
        const r = wrap.getBoundingClientRect();
        this.zoomAt(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - r.left, e.clientY - r.top);
      }, { passive: false });

      wrap.querySelector('.nzoom').addEventListener('click', (e) => {
        const z = e.target.dataset.z;
        if (z === 'fit') this.fit();
        else if (z) this.zoomAt(z === 'in' ? 1.2 : 1 / 1.2, wrap.clientWidth / 2, wrap.clientHeight / 2);
      });

      wrap.addEventListener('mousedown', (e) => {
        if (e.button !== 0 && e.button !== 1) return;
        const t = e.target;
        const nodeEl = t.closest('.nnode');
        // 출력 포트에서 끌기 → 연결
        if (t.classList.contains('port') && t.classList.contains('out')) {
          e.preventDefault();
          const id = nodeEl.dataset.id;
          const [x, y] = this.portPos(nodeEl, `.nn-row.out[data-port="${t.dataset.port}"] .port`, 'out');
          drag = { kind: 'connect', from: id, port: Number(t.dataset.port), start: [x, y] };
          wrap.classList.add('connecting');
          return;
        }
        // 연결된 입력 포트 클릭 → 연결 끊기
        if (t.classList.contains('port') && t.classList.contains('in') && nodeEl) {
          const row = t.closest('.nn-row');
          if (row && row.classList.contains('linked')) {
            const e2 = this.analysis.edges.find((ed) => ed.to === nodeEl.dataset.id && this.targetRow(nodeEl, ed) === row);
            if (e2) { e.preventDefault(); this.disconnect(e2.to, e2.v); }
          }
          return;
        }
        if (t.closest('.edge-hit')) {
          const p = t.closest('.edge-hit');
          this.selectedEdge = p.dataset.key;
          this.drawEdges();
          return;
        }
        if (nodeEl && t.closest('.nn-head') && !t.closest('button')) {
          e.preventDefault();
          const n = this.nodeById(nodeEl.dataset.id);
          this.select(n.id);
          drag = { kind: 'move', id: n.id, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y, moved: false };
          return;
        }
        if (nodeEl) {
          if (this.selected !== nodeEl.dataset.id) this.select(nodeEl.dataset.id);
          return;
        }
        // 빈 곳 → 화면 이동
        drag = { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: this.view.x, oy: this.view.y, moved: false };
        wrap.classList.add('panning');
      });

      window.addEventListener('mousemove', (e) => {
        if (!drag) return;
        if (drag.kind === 'pan') {
          this.view.x = drag.ox + (e.clientX - drag.sx);
          this.view.y = drag.oy + (e.clientY - drag.sy);
          drag.moved = true;
          this.applyView();
        } else if (drag.kind === 'move') {
          const n = this.nodeById(drag.id);
          n.x = Math.round(drag.ox + (e.clientX - drag.sx) / this.view.k);
          n.y = Math.round(drag.oy + (e.clientY - drag.sy) / this.view.k);
          const el = this.els.get(n.id);
          el.style.left = n.x + 'px';
          el.style.top = n.y + 'px';
          drag.moved = true;
          if (!drag.raf) drag.raf = requestAnimationFrame(() => { drag && (drag.raf = 0); this.drawEdges(); });
        } else if (drag.kind === 'connect') {
          const p = this.toCanvas(e.clientX, e.clientY);
          this.tempEdge.setAttribute('d', this.curve(drag.start, p));
          wrap.querySelectorAll('.drop-hover').forEach((x) => x.classList.remove('drop-hover'));
          const over = document.elementFromPoint(e.clientX, e.clientY);
          const row = over && over.closest('.nn-row.in, .t-return, .t-code');
          if (row) row.classList.add('drop-hover');
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (!drag) return;
        const d = drag;
        drag = null;
        wrap.classList.remove('panning', 'connecting');
        if (d.kind === 'pan' && !d.moved && e.target.closest && e.target.closest('.ncanvas-wrap, .nwrap')) {
          this.select(null);
        }
        if (d.kind === 'move' && d.moved) this.onChange('move');
        if (d.kind === 'connect') {
          this.tempEdge.setAttribute('d', '');
          wrap.querySelectorAll('.drop-hover').forEach((x) => x.classList.remove('drop-hover'));
          const over = document.elementFromPoint(e.clientX, e.clientY);
          const nodeEl = over && over.closest('.nnode');
          if (!nodeEl) return;
          const toId = nodeEl.dataset.id;
          const to = this.nodeById(toId);
          const row = over.closest('.nn-row.in');
          if (to.type === 'call') {
            let slot = row ? row.dataset.slot : null;
            if (slot == null) {
              // 행이 아닌 곳에 놓으면: 비어 있는 첫 필수 인자
              const spec = this.spec(to);
              const idx = to.args.findIndex((a) => !String(a.expr || '').trim() && (!spec || (spec.args.find((x) => x.name === a.name) || {}).req));
              slot = idx >= 0 ? idx : 0;
            }
            this.connect(d.from, d.port, toId, slot);
          } else if (to.type === 'return' || to.type === 'code') {
            this.connect(d.from, d.port, toId, 'code');
          }
        }
      });

      // 노드 안의 입력 편집
      wrap.addEventListener('change', (e) => {
        const t = e.target;
        const nodeEl = t.closest('.nnode');
        if (!nodeEl) return;
        const n = this.nodeById(nodeEl.dataset.id);
        if (t.classList.contains('nn-expr')) {
          if (t.dataset.slot === 'ret') n.expr = t.value;
          else n.args[Number(t.dataset.slot)].expr = t.value;
          this.refresh();
          this.onChange('edit');
        } else if (t.classList.contains('nn-var')) {
          if (n.type === 'frame') { n.outs[0] = t.value.trim() || 'frame'; this.renderAll(); this.onChange('rename'); }
          else this.renameVar(n.id, Number(t.dataset.port), t.value);
        } else if (t.classList.contains('nn-code')) {
          n.code = t.value;
          this.renderNode(n.id);
          this.onChange('edit');
        }
      });
      wrap.addEventListener('input', (e) => {
        const t = e.target;
        if (t.classList.contains('nn-code')) {
          t.rows = Math.min(14, Math.max(2, t.value.split('\n').length));
          this.drawEdges();
        }
      });
      wrap.addEventListener('keydown', (e) => {
        const t = e.target;
        if (t.classList.contains('nn-expr') && e.key === 'Enter') t.blur();
        if (t.classList.contains('nn-code') && e.key === 'Tab') {
          e.preventDefault();
          const s = t.selectionStart;
          t.value = t.value.slice(0, s) + '    ' + t.value.slice(t.selectionEnd);
          t.selectionStart = t.selectionEnd = s + 4;
        }
      });
      wrap.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const nodeEl = b.closest('.nnode');
        if (!nodeEl) return;
        if (b.dataset.act === 'delete') this.deleteNode(nodeEl.dataset.id);
        if (b.dataset.act === 'optional') {
          const id = nodeEl.dataset.id;
          if (this.showOptional.has(id)) this.showOptional.delete(id); else this.showOptional.add(id);
          this.renderNode(id);
        }
      });

      // 팔레트에서 끌어 놓기
      wrap.addEventListener('dragover', (e) => { if (e.dataTransfer.types.includes('text/ocv-block')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
      wrap.addEventListener('drop', (e) => {
        const key = e.dataTransfer.getData('text/ocv-block');
        if (!key) return;
        e.preventDefault();
        const [x, y] = this.toCanvas(e.clientX, e.clientY);
        const prevSel = this.selected;
        this.selected = null;          // 끌어 놓을 때는 자동 연결하지 않음
        const node = this.addBlock(key, [Math.round(x - 20), Math.round(y - 14)]);
        if (!node) this.selected = prevSel;
      });

      document.addEventListener('keydown', (e) => {
        const t = e.target;
        if (t.closest && t.closest('input, textarea, select, .CodeMirror, [contenteditable]')) return;
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (this.selectedEdge) {
            const [, to, v] = this.selectedEdge.match(/^[^>]+>([^:]+):(.+)$/) || [];
            this.selectedEdge = null;
            if (to) this.disconnect(to, v);
            e.preventDefault();
          } else if (this.selected) {
            this.deleteNode(this.selected);
            e.preventDefault();
          }
        }
      });

      new ResizeObserver(() => this.drawEdges()).observe(wrap);
      this.applyView();
    }
  }

  window.NodeEditor = NodeEditor;
})();
