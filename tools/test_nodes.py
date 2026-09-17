"""노드 변환 왕복 테스트

강좌의 모든 예제 코드에 대해
  1) Python 코드 → 노드 그래프 (js/nodes/converter.js 의 Python 변환기)
  2) 노드 그래프 → Python 코드 (js/nodes/graph.js 컴파일러, Node.js 로 실행)
  3) 원래 코드와 컴파일된 코드의 AST 비교 (그리기 함수의 img = cv.circle(img, ...) 재대입은 같은 것으로 취급)
  4) (옵션 --run) 컴파일된 코드와 프리뷰 계측 코드를 tools/validate.py 와 같은 방식으로 실행
를 확인합니다.

사용: python tools/test_nodes.py [lessonIdPrefix] [--run]
"""
import ast
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))


def load_converter():
    code = subprocess.run(['node', '-e', "process.stdout.write(require('./js/nodes/converter.js'))"],
                          cwd=ROOT, capture_output=True, text=True, encoding='utf-8').stdout
    ns = {}
    exec(code, ns)
    return ns


def catalog_args():
    out = subprocess.run(['node', '-e', "global.window={};const c=require('./js/nodes/catalog.js');"
                          "const m={};for(const b of c.blocks){if(b.type==='call')m[b.key]={args:b.args.map(a=>a.name)}};"
                          "process.stdout.write(JSON.stringify(m))"], cwd=ROOT, capture_output=True, text=True, encoding='utf-8').stdout
    return out


INPLACE = {'cv.line', 'cv.rectangle', 'cv.circle', 'cv.ellipse', 'cv.polylines', 'cv.fillPoly', 'cv.fillConvexPoly',
           'cv.putText', 'cv.drawContours', 'cv.arrowedLine', 'cv.drawMarker'}


class Normalize(ast.NodeTransformer):
    def visit_Expr(self, node):
        c = node.value
        if isinstance(c, ast.Call) and isinstance(c.func, ast.Attribute) and isinstance(c.func.value, ast.Name):
            fn = ('cv' if c.func.value.id in ('cv', 'cv2') else c.func.value.id) + '.' + c.func.attr
            if fn in INPLACE and c.args and isinstance(c.args[0], ast.Name):
                return ast.Assign(targets=[ast.Name(id=c.args[0].id, ctx=ast.Store())], value=c, lineno=node.lineno)
        return self.generic_visit(node)


def norm_dump(src, move_imports=True):
    tree = ast.parse(src)
    body = tree.body
    if move_imports:
        body = [s for s in body if isinstance(s, (ast.Import, ast.ImportFrom))] + [s for s in body if not isinstance(s, (ast.Import, ast.ImportFrom))]
    # process 함수의 문서 문자열 · 빈 pass 차이는 무시
    tree.body = body
    tree = Normalize().visit(tree)
    return [ast.dump(s, annotate_fields=False) for s in tree.body]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    prefix = args[0] if args else ''
    run = '--run' in sys.argv
    conv = load_converter()
    cat = catalog_args()
    dump = json.loads(subprocess.run(['node', os.path.join(ROOT, 'tools', 'dump_lessons.js'), prefix], capture_output=True,
                                     text=True, encoding='utf-8').stdout)
    snippets = dump['snippets']
    graphs = []
    fails = 0
    stats = {'call': 0, 'code': 0, 'frame': 0, 'return': 0}
    for sn in snippets:
        res = json.loads(conv['convert_json'](sn['code'], cat))
        if not res['ok']:
            fails += 1
            print(f"✗ 변환 실패 {sn['id']} {sn['title']}: {res['error']}")
            graphs.append(None)
            continue
        for n in res['graph']['nodes']:
            stats[n['type']] += 1
        graphs.append(res['graph'])

    tmp = tempfile.mkdtemp(prefix='ocv_nodes_')
    gpath = os.path.join(tmp, 'graphs.json')
    with open(gpath, 'w', encoding='utf-8') as fp:
        json.dump(graphs, fp, ensure_ascii=False)
    js = ("const G=require('./js/nodes/graph.js');const fs=require('fs');const gs=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));"
          "const out=gs.map(g=>{if(!g)return null;const c=G.compile(g);const i=G.compile(g,{instrument:true});"
          "G.layout(g);return {code:c.code,inst:i.code,errors:c.errors.map(e=>e.msg)}});"
          "fs.writeFileSync(process.argv[2],JSON.stringify(out));")
    opath = os.path.join(tmp, 'compiled.json')
    r = subprocess.run(['node', '-e', js, gpath, opath], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        print(r.stderr)
        sys.exit(1)
    compiled = json.load(open(opath, encoding='utf-8'))

    mism = 0
    to_run = []
    for sn, g, c in zip(snippets, graphs, compiled):
        if not c:
            continue
        tag = f"{sn['id']} [{sn['kind']} {sn.get('index', '')}] {sn['title']}"
        if c['errors']:
            print(f"✗ 컴파일 오류 {tag}: {c['errors']}")
            fails += 1
            continue
        try:
            a = norm_dump(sn['code'])
            b = norm_dump(c['code'])
        except SyntaxError as e:
            print(f"✗ 컴파일 결과 문법 오류 {tag}: {e}\n{c['code']}")
            fails += 1
            continue
        if a != b:
            mism += 1
            if mism <= 5:
                import difflib
                print(f"△ AST 차이 {tag}")
                ua = [ast.unparse(ast.parse(sn['code']))]
                ub = [ast.unparse(ast.parse(c['code']))]
                for line in difflib.unified_diff(ua[0].split('\n'), ub[0].split('\n'), lineterm='', n=1):
                    print('   ', line)
        to_run.append((tag, c))

    print(f"\n스니펫 {len(snippets)}개 · 노드 {sum(stats.values())}개 {stats}")
    print(f"변환/컴파일 실패 {fails} · 원본과 AST 가 다른 코드 {mism}")

    if run:
        import validate
        validate.WORKDIR = None
        import shutil
        work = os.path.join(tmp, 'images')
        shutil.copytree(validate.IMAGES, work)
        validate.WORKDIR = work
        validate.RUNNER = validate.RUNNER.replace('webcv.is_camera = lambda: False', 'webcv.is_camera = lambda: False\nwebcv._pv = lambda *a: None')
        from concurrent.futures import ThreadPoolExecutor
        jobs = []
        for tag, c in to_run:
            jobs.append({'tag': tag + ' (clean)', 'code': c['code']})
            jobs.append({'tag': tag + ' (preview)', 'code': c['inst']})
        bad = 0
        with ThreadPoolExecutor(max_workers=8) as ex:
            for sn, ok, out in ex.map(validate.run_snippet, jobs):
                if not ok:
                    bad += 1
                    print(f"✗ 실행 실패 {sn['tag']}\n{out.split('__ERR__', 1)[-1][-800:]}")
        print(f"실행: {len(jobs) - bad} 통과 / {bad} 실패")
        fails += bad
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
