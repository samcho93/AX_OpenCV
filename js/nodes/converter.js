/* =========================================================================
 * Python 코드 → 노드 그래프 변환기 (Pyodide 안에서 실행되는 Python 코드)
 *  - 함수 호출 문장        → call 노드 (인자 = 식 텍스트, 출력 = 대입 변수)
 *  - def process(frame):   → frame(입력 소스) 노드 + 본문 노드(매 프레임) + return(결과 출력) 노드
 *  - 그 밖의 문장           → code 노드 (반복문 · 조건문 · 함수 정의 · 인덱싱 대입 등)
 * 변환된 그래프를 js/nodes/graph.js 로 다시 컴파일하면 원래 코드와 같은 순서 · 같은 문장이 됩니다.
 * ========================================================================= */
(function (root) {
  const PY = String.raw`
import ast, json, re, textwrap

_INPLACE = {'cv.line', 'cv.rectangle', 'cv.circle', 'cv.ellipse', 'cv.polylines', 'cv.fillPoly', 'cv.fillConvexPoly',
            'cv.putText', 'cv.drawContours', 'cv.arrowedLine', 'cv.drawMarker'}


def _dotted(n):
    parts = []
    while isinstance(n, ast.Attribute):
        parts.append(n.attr)
        n = n.value
    if isinstance(n, ast.Name):
        parts.append(n.id)
        return '.'.join(reversed(parts))
    return None


def _norm(fn):
    fn = re.sub(r'^cv2\.', 'cv.', fn)
    fn = re.sub(r'^numpy\.', 'np.', fn)
    fn = re.sub(r'^matplotlib\.pyplot\.', 'plt.', fn)
    return fn


def _stored_names(stmt):
    """문장이 (최상위 범위에서) 값을 정하거나 바꾸는 변수 이름"""
    names = []

    def add(n):
        if n and n != '_' and not n.startswith('__') and n not in names:
            names.append(n)

    def target(t):
        if isinstance(t, ast.Name):
            add(t.id)
        elif isinstance(t, (ast.Tuple, ast.List)):
            for e in t.elts:
                target(e)
        elif isinstance(t, ast.Starred):
            target(t.value)
        elif isinstance(t, (ast.Subscript, ast.Attribute)):
            base = t.value
            while isinstance(base, (ast.Subscript, ast.Attribute)):
                base = base.value
            if isinstance(base, ast.Name):
                add(base.id)            # 제자리 수정도 "새 값"으로 취급

    def visit(node, top):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            add(node.name)
            return                      # 함수 안쪽은 다른 범위
        if isinstance(node, ast.Lambda) or isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
            return
        if isinstance(node, ast.Assign):
            for t in node.targets:
                target(t)
        elif isinstance(node, (ast.AugAssign, ast.AnnAssign)):
            target(node.target)
        elif isinstance(node, (ast.For, ast.AsyncFor)):
            target(node.target)
        elif isinstance(node, (ast.With, ast.AsyncWith)):
            for it in node.items:
                if it.optional_vars is not None:
                    target(it.optional_vars)
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            for a in node.names:
                add((a.asname or a.name).split('.')[0])
        elif isinstance(node, ast.NamedExpr):
            target(node.target)
        elif isinstance(node, ast.ExceptHandler) and node.name:
            add(node.name)
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            # 리스트.append(...) 같은 메서드 호출은 객체를 바꿈
            f = node.value.func
            if isinstance(f, ast.Attribute) and isinstance(f.value, ast.Name) and f.attr in (
                    'append', 'extend', 'insert', 'pop', 'remove', 'clear', 'sort', 'reverse', 'update', 'add', 'fill'):
                add(f.value.id)
        for child in ast.iter_child_nodes(node):
            visit(child, False)

    visit(stmt, True)
    return names


def _segment(src, lines, node):
    seg = ast.get_source_segment(src, node, padded=True)
    if seg is None:
        seg = ast.unparse(node)
    return textwrap.dedent(seg).rstrip()


def _comments(lines, start, end):
    """[start, end) 줄 범위의 주석 줄 (빈 줄 제외)"""
    out = []
    for ln in lines[start:end]:
        s = ln.strip()
        if s.startswith('#'):
            out.append(s[1:].strip())
    return out


def convert(src, catalog_json='{}'):
    cat = json.loads(catalog_json)
    src = src.replace('\r\n', '\n')
    tree = ast.parse(src)
    lines = src.split('\n')
    graph = {'version': 1, 'imports': [], 'nodes': [], 'warnings': []}
    counter = [0]

    def add(node, stmt=None):
        counter[0] += 1
        node['id'] = 'n%d' % counter[0]
        node['order'] = counter[0]
        graph['nodes'].append(node)
        return node

    def trailing_comment(stmt):
        line = lines[stmt.end_lineno - 1]
        rest = line[stmt.end_col_offset:] if stmt.end_col_offset is not None else ''
        m = re.match(r'\s*#\s?(.*)$', rest)
        return m.group(1).strip() if m else ''

    def comment_for(stmt, prev_end):
        parts = _comments(lines, prev_end, stmt.lineno - 1)
        tc = trailing_comment(stmt)
        if tc:
            parts.append(tc)
        return '\n'.join(parts)

    def call_node(stmt, call, targets, scope, comment):
        fn_text = _dotted(call.func)
        key = _norm(fn_text)
        spec = cat.get(key)
        spec_args = spec['args'] if spec else []
        args = []
        used = set()
        for i, a in enumerate(call.args):
            name = spec_args[i] if i < len(spec_args) else ('arg%d' % (i + 1))
            used.add(name)
            args.append({'name': name, 'kw': False, 'expr': _segment(src, lines, a)})
        for k in call.keywords:
            used.add(k.arg)
            args.append({'name': k.arg, 'kw': True, 'expr': _segment(src, lines, k.value)})
        for name in spec_args[len(call.args):]:
            if name not in used:
                args.append({'name': name, 'kw': True, 'expr': ''})
        if targets is None:
            outs = []
            if key in _INPLACE and call.args and isinstance(call.args[0], ast.Name):
                outs = [call.args[0].id]          # cv.circle(img, ...) → img = cv.circle(img, ...)
        else:
            outs = targets
        node = {'type': 'call', 'fn': fn_text, 'args': args, 'outs': outs, 'scope': scope}
        if comment:
            node['comment'] = comment
        return add(node)

    def simple_targets(t):
        if isinstance(t, ast.Name):
            return [t.id]
        if isinstance(t, (ast.Tuple, ast.List)) and all(isinstance(e, ast.Name) for e in t.elts):
            return [e.id for e in t.elts]
        return None

    def is_plain_call(call):
        if not isinstance(call, ast.Call) or _dotted(call.func) is None:
            return False
        if any(isinstance(a, ast.Starred) for a in call.args) or any(k.arg is None for k in call.keywords):
            return False
        return True

    def handle(stmt, scope, prev_end):
        comment = comment_for(stmt, prev_end)
        if scope == 'main' and isinstance(stmt, (ast.Import, ast.ImportFrom)):
            graph['imports'].append(_segment(src, lines, stmt))
            return
        if (scope == 'main' and isinstance(stmt, ast.FunctionDef) and stmt.name == 'process' and not stmt.decorator_list
                and len(stmt.args.args) == 1 and not stmt.args.vararg and not stmt.args.kwarg):
            node = {'type': 'frame', 'outs': [stmt.args.args[0].arg], 'scope': 'process'}
            if comment:
                node['comment'] = comment
            add(node)
            body = stmt.body
            end = stmt.lineno
            if body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant) and isinstance(body[0].value.value, str):
                node['doc'] = body[0].value.value.strip()
                end = body[0].end_lineno
                body = body[1:]
            for s in body:
                handle(s, 'process', end)
                end = s.end_lineno
            return
        if scope == 'process' and isinstance(stmt, ast.Return):
            node = {'type': 'return', 'expr': _segment(src, lines, stmt.value) if stmt.value is not None else '', 'scope': 'process'}
            if comment:
                node['comment'] = comment
            add(node)
            return
        if isinstance(stmt, ast.Expr) and is_plain_call(stmt.value):
            call_node(stmt, stmt.value, None, scope, comment)
            return
        if isinstance(stmt, ast.Assign) and len(stmt.targets) == 1 and is_plain_call(stmt.value):
            t = simple_targets(stmt.targets[0])
            if t is not None:
                call_node(stmt, stmt.value, t, scope, comment)
                return
        node = {'type': 'code', 'code': _segment(src, lines, stmt), 'outs': _stored_names(stmt), 'scope': scope}
        if comment and not node['code'].lstrip().startswith('#'):
            node['comment'] = comment
        add(node)

    end = 0
    for stmt in tree.body:
        handle(stmt, 'main', end)
        end = stmt.end_lineno
    return graph


def convert_json(src, catalog_json='{}'):
    try:
        return json.dumps({'ok': True, 'graph': convert(src, catalog_json)}, ensure_ascii=False)
    except SyntaxError as e:
        return json.dumps({'ok': False, 'error': '문법 오류 (%d번째 줄): %s' % (e.lineno or 0, e.msg)}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({'ok': False, 'error': '%s: %s' % (type(e).__name__, e)}, ensure_ascii=False)
`;
  root.NODE_CONVERTER_PY = PY;
  if (typeof module !== 'undefined') module.exports = PY;
})(typeof window !== 'undefined' ? window : globalThis);
