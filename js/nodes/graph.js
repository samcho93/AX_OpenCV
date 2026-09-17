/* =========================================================================
 * 노드 그래프 모델: 의존 관계 분석 · Python 코드로 컴파일 · 자동 배치
 * (브라우저와 Node.js 테스트에서 함께 사용)
 *
 * 그래프 형식
 *   { version, title, imports: ['import cv2 as cv', ...], nodes: [
 *       { id, order, type: 'call'|'code'|'frame'|'return', scope: 'main'|'process', x, y,
 *         fn, args: [{name, kw, expr}], outs: ['var', ...],      // call
 *         code, outs,                                          // code
 *         outs: ['frame'],                                     // frame (입력 소스)
 *         expr,                                                // return (결과 출력)
 *         comment }
 *   ]}
 * 연결선은 저장하지 않습니다. 노드의 식/코드에 등장하는 변수 이름으로 자동 계산됩니다.
 * ========================================================================= */
(function (root) {
  const PY_KEYWORDS = new Set(('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield').split(' '));

  /** 문자열 · 주석을 뺀 코드에서 식별자 목록 (f-string 의 {} 안은 코드로 취급) */
  function identifiers(text) {
    const s = String(text || '');
    let code = '';
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === '#') { while (i < s.length && s[i] !== '\n') i++; continue; }
      if (ch === '"' || ch === "'") {
        // 문자열 접두사(f, r, b, rf …) 확인 후 코드 쪽에 붙은 접두사 글자는 제거
        let k = i, prefix = '';
        while (k > 0 && /[rRbBfFuU]/.test(s[k - 1]) && prefix.length < 2) { prefix = s[k - 1] + prefix; k--; }
        if (prefix && k > 0 && /\w/.test(s[k - 1])) prefix = '';
        if (prefix) code = code.slice(0, code.length - prefix.length);
        const isF = /f/i.test(prefix);
        const triple = s.slice(i, i + 3) === ch.repeat(3);
        const q = triple ? ch.repeat(3) : ch;
        i += q.length;
        let depth = 0, inner = '';
        while (i < s.length) {
          if (!triple && s[i] === '\n') break;
          if (s[i] === '\\') { i += 2; continue; }
          if (isF && s[i] === '{') { if (s[i + 1] === '{') { i += 2; continue; } depth++; i++; continue; }
          if (isF && s[i] === '}' && depth > 0) { depth--; code += ' ' + inner + ' '; inner = ''; i++; continue; }
          if (depth > 0) { inner += s[i]; i++; continue; }
          if (s.slice(i, i + q.length) === q) { i += q.length; break; }
          i++;
        }
        code += ' ';
        continue;
      }
      code += ch;
      i++;
    }
    const out = [];
    const re = /(^|[^.\w])([A-Za-z_][A-Za-z0-9_]*)/g;
    let m;
    while ((m = re.exec(code))) {
      const name = m[2];
      if (!PY_KEYWORDS.has(name) && !out.includes(name)) out.push(name);
    }
    return out;
  }

  const normFn = (fn) => String(fn || '').replace(/^cv2\./, 'cv.').replace(/^numpy\./, 'np.');
  const isDefCode = (code) => /^\s*(@|def\s|async\s+def\s|class\s)/.test(code || '');

  function varsOf(node) {
    return (node.outs || []).filter((v) => v && v !== '_');
  }

  function readText(node) {
    switch (node.type) {
      case 'call': return [node.fn, ...(node.args || []).map((a) => a.expr)].join('\n');
      case 'code': return isDefCode(node.code) ? '' : node.code;   // 함수 본문은 나중에 실행되므로 의존 관계에서 제외
      case 'return': return node.expr || '';
      default: return '';
    }
  }

  /* --------------------------------------------------------------- 분석 --- */
  function analyze(graph) {
    const nodes = [...(graph.nodes || [])].sort((a, b) => a.order - b.order);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const errors = [];
    const warnings = [];
    const frames = nodes.filter((n) => n.type === 'frame');
    if (frames.length > 1) errors.push({ id: frames[1].id, msg: '입력 소스 노드는 하나만 둘 수 있습니다.' });
    const frame = frames[0] || null;

    const definers = new Map();
    const define = (v, n) => { if (!definers.has(v)) definers.set(v, []); definers.get(v).push(n); };
    for (const n of nodes) {
      for (const v of varsOf(n)) define(v, n);
      if (n.type === 'frame') define('process', n);
    }
    const dupVars = [...definers].filter(([, list]) => list.filter((n) => n.type === 'call' || n.type === 'frame').length > 1);

    const deps = new Map();
    const reads = new Map();
    const forward = [];
    // 범위가 명시된 노드: frame/return 은 process, scope 값이 있으면 그 값. 없으면(편집기에서 새로 만든 노드) 자동
    const explicit = (n) => (n.type === 'frame' || n.type === 'return') ? 'process' : (n.scope === 'main' || n.scope === 'process' ? n.scope : null);
    for (const n of nodes) {
      const ids = identifiers(readText(n)).filter((v) => definers.has(v));
      const list = [];
      const used = [];
      for (const v of ids) {
        let cands = definers.get(v).filter((d) => d !== n);
        // main 에서 실행되는 노드는 매 프레임 노드가 바꾼 값을 읽지 않음 (process 는 나중에 실행되므로)
        if (explicit(n) === 'main') cands = cands.filter((d) => explicit(d) !== 'process' || v === 'process');
        if (!cands.length) continue;
        const before = cands.filter((d) => d.order < n.order);
        if (!before.length) {
          // 이 노드보다 나중 순서의 노드에서만 만들어지는 변수 (반복문 변수 등과 이름이 같을 수도 있음)
          if (n.type !== 'code' || v === 'process') forward.push({ id: n.id, v, from: cands[0].id });
          continue;
        }
        list.push({ from: before[before.length - 1], v });
        used.push(v);
      }
      reads.set(n.id, used);
      deps.set(n.id, list);
    }
    // 같은 변수를 여러 노드가 만들 때: 뒤 노드가 앞 값을 이어받는 x = f(x) 형태면 안전. 아니면 경고
    for (const [v, list] of dupVars) {
      const later = list.slice(1);
      if (later.every((n) => (deps.get(n.id) || []).some((d) => d.v === v))) continue;
      const readers = nodes.filter((n) => !list.includes(n) && (deps.get(n.id) || []).some((d) => d.v === v));
      if (!readers.length) continue;   // 아무도 읽지 않으면 (예: 버리는 ret) 문제 없음
      warnings.push({ id: list[list.length - 1].id, msg: `변수 ${v} 가 여러 노드(${list.length}개)에서 만들어집니다. 연결 순서에 주의하세요.` });
    }
    for (const f of forward) warnings.push({ id: f.id, msg: `변수 ${f.v} 는 이 노드보다 뒤 순서의 노드에서 만들어집니다.`, fix: { type: 'moveBefore', from: f.from, to: f.id } });

    // 실행 범위: 입력 소스(frame)에서 이어지는 노드는 매 프레임(process) 실행
    const scope = new Map(nodes.map((n) => [n.id, explicit(n) === 'process' ? 'process' : 'main']));
    let changed = true;
    while (changed) {
      changed = false;
      for (const n of nodes) {
        if (scope.get(n.id) === 'process' || explicit(n) === 'main') continue;
        if (deps.get(n.id).some((d) => d.v !== 'process' && scope.get(d.from.id) === 'process')) {
          scope.set(n.id, 'process'); changed = true;
        }
      }
    }
    if (!frame) {
      for (const n of nodes) {
        if (scope.get(n.id) === 'process') {
          errors.push({ id: n.id, msg: n.type === 'return' ? '결과 출력 노드는 입력 소스 노드와 함께 써야 합니다.' : '매 프레임 실행 노드는 입력 소스 노드가 필요합니다.' });
          scope.set(n.id, 'main');
        }
      }
    }
    const returns = nodes.filter((n) => n.type === 'return');
    if (returns.length > 1) warnings.push({ id: returns[1].id, msg: '결과 출력 노드가 여러 개입니다. 먼저 실행되는 것만 결과가 됩니다.' });

    // 위상 정렬 (의존 관계 우선, 같은 조건이면 order 순)
    function topo(list, depFilter) {
      const set = new Set(list.map((n) => n.id));
      const indeg = new Map(list.map((n) => [n.id, 0]));
      const outs = new Map(list.map((n) => [n.id, []]));
      for (const n of list) {
        const seen = new Set();
        for (const d of deps.get(n.id)) {
          const fid = depFilter(d, n);
          if (!fid || !set.has(fid) || fid === n.id || seen.has(fid)) continue;
          seen.add(fid);
          indeg.set(n.id, indeg.get(n.id) + 1);
          outs.get(fid).push(n.id);
        }
      }
      const ready = list.filter((n) => indeg.get(n.id) === 0);
      const result = [];
      while (ready.length) {
        ready.sort((a, b) => a.order - b.order);
        const n = ready.shift();
        result.push(n);
        for (const t of outs.get(n.id)) {
          indeg.set(t, indeg.get(t) - 1);
          if (indeg.get(t) === 0) ready.push(byId.get(t));
        }
      }
      if (result.length < list.length) {
        const stuck = list.filter((n) => !result.includes(n));
        errors.push({ id: stuck[0].id, msg: '노드 연결이 순환합니다 (서로가 서로의 입력). 연결을 끊어 주세요.' });
        result.push(...stuck.sort((a, b) => a.order - b.order));
      }
      return result;
    }
    const mainList = nodes.filter((n) => scope.get(n.id) === 'main' || n === frame);
    const procList = nodes.filter((n) => scope.get(n.id) === 'process' && n !== frame);
    // main: 매 프레임 노드는 process 블록(= frame 노드) 하나로 취급. process 블록 안의 읽기는 나중에 실행되므로 의존에서 제외
    const mainOrder = topo(mainList, (d, n) => (n === frame ? null : (scope.get(d.from.id) === 'process' ? (d.v === 'process' ? frame && frame.id : null) : d.from.id)));
    const procOrder = topo(procList, (d) => (scope.get(d.from.id) === 'process' && d.from !== frame ? d.from.id : null));

    // 필수 인자 확인
    for (const n of nodes) {
      if (n.type === 'call' && !String(n.fn || '').trim()) errors.push({ id: n.id, msg: '함수 이름이 비어 있습니다.' });
    }

    // 연결선
    const edges = [];
    for (const n of nodes) {
      for (const d of deps.get(n.id)) {
        if (d.v === 'process') continue;
        const fromPort = d.from.type === 'frame' ? 0 : Math.max(0, (d.from.outs || []).indexOf(d.v));
        let toSlot = 0, exact = false;
        if (n.type === 'call') {
          const idx = (n.args || []).findIndex((a) => identifiers(a.expr).includes(d.v));
          if (idx < 0) toSlot = -1; else { toSlot = idx; exact = String(n.args[idx].expr).trim() === d.v; }
        } else if (n.type === 'code') {
          toSlot = reads.get(n.id).indexOf(d.v);
          exact = true;
        } else if (n.type === 'return') {
          exact = String(n.expr || '').trim() === d.v;
        }
        edges.push({ from: d.from.id, fromPort, to: n.id, toSlot, v: d.v, exact });
      }
    }
    return { nodes, byId, frame, scope, deps, reads, mainOrder, procOrder, edges, errors, warnings, definers };
  }

  /* ------------------------------------------------------------- 컴파일 --- */
  function callArgs(node) {
    const parts = [];
    let forceKw = false;
    for (const a of node.args || []) {
      const expr = String(a.expr ?? '').trim();
      if (!expr) { forceKw = true; continue; }
      if (a.kw || forceKw) parts.push(`${a.name}=${expr}`);
      else parts.push(expr);
    }
    return parts.join(', ');
  }

  function statementOf(node) {
    if (node.type === 'call') {
      const outs = node.outs || [];
      const lhs = outs.some((o) => o && o.trim()) ? outs.map((o) => (o && o.trim()) || '_').join(', ') + ' = ' : '';
      return `${lhs}${String(node.fn).trim()}(${callArgs(node)})`;
    }
    if (node.type === 'code') return String(node.code || '').replace(/\s+$/, '') || 'pass';
    if (node.type === 'return') return String(node.expr || '').trim() ? `return ${String(node.expr).trim()}` : 'return None';
    return '';
  }

  const DEFAULT_IMPORTS = ['import cv2 as cv', 'import numpy as np'];

  function compile(graph, opts = {}) {
    const a = analyze(graph);
    const instrument = !!opts.instrument;
    const lines = [];
    const lineMap = [];
    const emit = (text, id, indent = '') => {
      for (const ln of String(text).split('\n')) {
        lines.push(ln.length ? indent + ln : ln);
        lineMap.push(id || null);
      }
    };

    // import
    // 변환된 그래프는 원래 import 를 그대로, 새 그래프는 기본 import. 쓰는 모듈의 import 가 어디에도 없으면 추가
    const imports = Array.isArray(graph.imports) ? [...graph.imports] : [...DEFAULT_IMPORTS];
    const allText = a.nodes.map((n) => [n.fn, ...(n.args || []).map((x) => x.expr), n.code, n.expr].filter(Boolean).join('\n')).join('\n');
    const used = new Set(identifiers(allText));
    const importText = imports.join('\n') + '\n' + a.nodes.map((n) => n.code || '').join('\n');
    const has = (re) => re.test(importText);
    if (used.has('cv') && !has(/as cv\b/)) imports.unshift('import cv2 as cv');
    if (used.has('np') && !has(/as np\b/)) imports.push('import numpy as np');
    if (used.has('plt') && !has(/\bplt\b/)) imports.push('from matplotlib import pyplot as plt');
    if (used.has('time') && !has(/import time\b/)) imports.push('import time');
    if (used.has('webcv') && !has(/import webcv\b/)) imports.push('import webcv');
    for (const imp of imports) emit(imp, null);
    if (instrument) {
      emit('import webcv as __webcv', null);
      emit('__pv = __webcv._pv', null);
    }
    if (imports.length) emit('', null);

    const probe = (node, indent) => {
      if (!instrument) return;
      let vals = [];
      if (node.type === 'call') {
        vals = (node.outs || []).map((o) => (o || '').trim()).filter((o) => o && o !== '_');
        if (!vals.length && /(^|\.)imshow$/.test(String(node.fn).trim())) {
          const img = (node.args || [])[1];
          if (img && String(img.expr).trim()) vals = [`(${String(img.expr).trim()})`];
        }
      } else if (node.type === 'code') {
        vals = varsOf(node);
      }
      if (!vals.length) return;
      emit(`try: __pv(${JSON.stringify(node.id)}, ${vals.join(', ')})`, node.id, indent);
      emit('except Exception: pass', node.id, indent);
    };

    const emitNode = (node, indent) => {
      if (node.comment) emit(node.comment.split('\n').map((c) => '# ' + c).join('\n'), node.id, indent);
      if (node.type === 'return' && instrument) {
        const expr = String(node.expr || '').trim() || 'None';
        emit(`__r = ${expr}`, node.id, indent);
        emit(`__pv(${JSON.stringify(node.id)}, __r)`, node.id, indent);
        emit('return __r', node.id, indent);
        return;
      }
      emit(statementOf(node), node.id, indent);
      probe(node, indent);
    };

    for (const node of a.mainOrder) {
      if (node === a.frame) {
        const fv = varsOf(node)[0] || 'frame';
        if (lines.length && lines[lines.length - 1] !== '') emit('', null);
        if (node.comment) emit(node.comment.split('\n').map((c) => '# ' + c).join('\n'), node.id);
        emit(`def process(${fv}):`, node.id);
        const ind = '    ';
        if (node.doc) emit(`"""${node.doc.replace(/"""/g, '\\"\\"\\"')}"""`, node.id, ind);
        const globals = a.procOrder.filter((n) => n.type === 'code' && /^\s*global\s/.test(n.code) && String(n.code).trim().split('\n').every((l) => /^\s*(global\s|#|$)/.test(l)));
        for (const g of globals) emitNode(g, ind);
        if (instrument) emit(`__pv(${JSON.stringify(node.id)}, ${fv})`, node.id, ind);
        const body = a.procOrder.filter((n) => !globals.includes(n));
        for (const n of body) emitNode(n, ind);
        if (!body.length && !globals.length && !instrument && !node.doc) emit('pass', node.id, ind);
        emit('', null);
      } else {
        emitNode(node, '');
      }
    }
    while (lines.length && lines[lines.length - 1] === '') { lines.pop(); lineMap.pop(); }
    return { code: lines.join('\n') + '\n', lineMap, analysis: a, errors: a.errors, warnings: a.warnings };
  }

  /* ------------------------------------------------------------ 자동 배치 --- */
  function layout(graph, sizeOf) {
    const a = analyze(graph);
    const depth = new Map();
    const order = [...a.mainOrder.filter((n) => n !== a.frame), ...(a.frame ? [a.frame] : []), ...a.procOrder];
    for (const n of order) {
      let d = 0;
      for (const dep of a.deps.get(n.id)) {
        if (dep.v === 'process') continue;
        if (depth.has(dep.from.id)) d = Math.max(d, depth.get(dep.from.id) + 1);
      }
      depth.set(n.id, d);
    }
    // 입력 소스 이후(process) 노드는 main 노드들보다 오른쪽에서 시작
    if (a.frame) {
      const mainMax = Math.max(-1, ...a.mainOrder.filter((n) => n !== a.frame).map((n) => depth.get(n.id)));
      const shift = Math.max(0, mainMax + 1 - depth.get(a.frame.id));
      if (shift) for (const n of [a.frame, ...a.procOrder]) depth.set(n.id, depth.get(n.id) + shift);
    }
    const cols = new Map();
    for (const n of order) {
      const d = depth.get(n.id);
      if (!cols.has(d)) cols.set(d, []);
      cols.get(d).push(n);
    }
    const COL_W = 300, GAP = 24;
    for (const [d, list] of cols) {
      let y = 40;
      list.sort((p, q) => p.order - q.order);
      for (const n of list) {
        n.x = 40 + d * COL_W;
        n.y = y;
        const h = sizeOf ? sizeOf(n) : estimateHeight(n);
        y += h + GAP;
      }
    }
    return graph;
  }

  function estimateHeight(n) {
    if (n.type === 'code') return 70 + Math.min(12, String(n.code || '').split('\n').length) * 17 + (n.outs || []).length * 22;
    if (n.type === 'call') return 58 + (n.args || []).filter((a) => String(a.expr || '').trim()).length * 30 + 28 + Math.max(1, (n.outs || []).length) * 22 + 20;
    return 110;
  }

  /** fromId 노드(와 그 노드가 의존하는 상류 노드들)를 toId 노드보다 앞 순서로 옮긴 뒤 order 를 1,2,3… 으로 다시 매김 */
  function moveBefore(graph, fromId, toId) {
    const nodes = [...graph.nodes].sort((a, b) => a.order - b.order);
    const to = nodes.find((n) => n.id === toId);
    const from = nodes.find((n) => n.id === fromId);
    if (!to || !from || from.order < to.order) return renumber(graph);
    const a = analyze(graph);
    const moving = new Set();
    const visit = (n) => {
      if (moving.has(n.id) || n.order < to.order) return;
      moving.add(n.id);
      for (const d of a.deps.get(n.id)) visit(d.from);
    };
    visit(from);
    const moved = nodes.filter((n) => moving.has(n.id));
    const rest = nodes.filter((n) => !moving.has(n.id));
    const idx = rest.indexOf(to);
    const next = [...rest.slice(0, idx), ...moved, ...rest.slice(idx)];
    next.forEach((n, i) => { n.order = i + 1; });
    return graph;
  }

  function renumber(graph) {
    [...graph.nodes].sort((a, b) => a.order - b.order).forEach((n, i) => { n.order = i + 1; });
    return graph;
  }

  root.NodeGraph = { identifiers, analyze, compile, layout, statementOf, normFn, varsOf, readText, isDefCode, moveBefore, renumber, DEFAULT_IMPORTS };
  if (typeof module !== 'undefined') module.exports = root.NodeGraph;
})(typeof window !== 'undefined' ? window : globalThis);
