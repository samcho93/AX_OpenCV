"""🚀 응용 예제 로컬 검증 · 결과 이미지 · 썸네일 생성

각 데모를 추천 입력(이미지 / 동영상 여러 프레임 / 가짜 웹캠)마다 실행해
  - 오류 여부와 프레임당 처리 시간
  - 결과 이미지(.cache/apps_out/<id>/<입력>_result.png, 추가 창)
  - 갤러리 썸네일(images/apps/thumbs/<id>.jpg, 기본 입력 결과)
을 만듭니다. 브라우저(Pyodide)보다 로컬이 약 5~10배 빠르다는 점을 감안해 시간을 보세요.

사용: python tools/test_apps.py [id ...] [--no-thumbs]
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '.cache', 'apps_out')
THUMBS = os.path.join(ROOT, 'images', 'apps', 'thumbs')

DUMP_JS = r"""
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=process.argv[1];const ctx={console};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/apps.js'),'utf8'),ctx);
const dir=path.join(root,'apps');
for(const f of (fs.existsSync(dir)?fs.readdirSync(dir):[]).filter(f=>f.endsWith('.js')).sort()){
  try{vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f});}catch(e){console.error('[SYNTAX] '+f+': '+e.message);process.exitCode=1;}
}
process.stdout.write(JSON.stringify(ctx.APPS.list.map(a=>({id:a.id,title:a.title,code:a.code,inputs:a.inputs||[],assets:a.assets||[]}))));
"""

RUNNER = r'''
import sys, os, json, time, types, traceback
os.environ["MPLBACKEND"] = "Agg"
import numpy as np
import cv2

spec = json.loads(sys.argv[1])

def imwrite_u(path, img):
    """한글 경로에서도 동작하는 저장 (cv.imwrite 는 Windows 한글 경로에서 실패)"""
    ok, buf = cv2.imencode(os.path.splitext(path)[1] or ".png", img)
    if ok:
        with open(path, "wb") as fp:
            fp.write(buf.tobytes())
    return ok
out_dir = spec["out"]
WIN = {}
TB = {}
def imshow(name, mat):
    if mat is None: raise cv2.error("imshow: None")
    a = np.asarray(mat)
    if a.size == 0 or a.dtype == object or a.dtype == np.bool_: raise cv2.error("imshow: 표시할 수 없는 배열 %s %s" % (a.dtype, a.shape))
    WIN[name] = a.copy()
def createTrackbar(tb, win, value, count, cb):
    if not callable(cb): raise TypeError("onChange 는 함수")
    TB[(win, tb)] = int(value)
def getTrackbarPos(tb, win):
    if (win, tb) not in TB: raise cv2.error("트랙바 없음: %s/%s" % (win, tb))
    return TB[(win, tb)]
noop = lambda *a, **k: None
for k, v in dict(imshow=imshow, namedWindow=noop, waitKey=lambda *a: -1, destroyAllWindows=noop, createTrackbar=createTrackbar,
                 getTrackbarPos=getTrackbarPos, setTrackbarPos=noop, setMouseCallback=noop).items():
    setattr(cv2, k, v)
webcv = types.ModuleType("webcv")
webcv.get_input = lambda: FRAMES[0].copy()
webcv.source_name = lambda: spec["input"]
webcv.is_camera = lambda: spec["input"] == "camera"
webcv.is_video = lambda: spec["input"].startswith("video:")
webcv._pv = noop
sys.modules["webcv"] = webcv

inp = spec["input"]
FRAMES = []
if inp.startswith("video:"):
    cap = cv2.VideoCapture(os.path.join(spec["videos"], inp[6:]))
    while len(FRAMES) < spec["nframes"]:
        ok, f = cap.read()
        if not ok: break
        FRAMES.append(f)
elif inp == "camera":
    base = cv2.resize(cv2.imread("messi5.jpg"), (640, 480))
    FRAMES = [base] * 3
else:
    img = cv2.imread(inp)
    if img is None: raise SystemExit("__ERR__입력 이미지 없음: " + inp)
    FRAMES = [img]

res = {"ok": False}
try:
    ns = {"__name__": "__main__"}
    t0 = time.perf_counter()
    exec(compile(spec["code"], "app.py", "exec"), ns)
    res["setup"] = time.perf_counter() - t0
    proc = ns.get("process")
    if not callable(proc): raise RuntimeError("process(frame) 가 없습니다")
    times = []
    out = None
    for i, f in enumerate(FRAMES):
        t = time.perf_counter()
        out = proc(f.copy())
        times.append(time.perf_counter() - t)
    if out is None: raise RuntimeError("process 가 결과 이미지를 return 하지 않았습니다")
    outs = out if isinstance(out, (list, tuple)) else [out]
    os.makedirs(out_dir, exist_ok=True)
    tag = inp.replace(":", "_").replace(".", "_")
    for i, o in enumerate(outs):
        a = np.asarray(o)
        if a.dtype != np.uint8: a = np.clip(a * (255 if a.dtype.kind == "f" and a.max() <= 1 else 1), 0, 255).astype(np.uint8)
        imwrite_u(os.path.join(out_dir, "%s_result%s.png" % (tag, "" if i == 0 else i + 1)), a)
    for name, a in WIN.items():
        if a.dtype != np.uint8: a = np.clip(a, 0, 255).astype(np.uint8)
        imwrite_u(os.path.join(out_dir, "%s_win_%s.png" % (tag, "".join(c if c.isalnum() else "_" for c in name))), a)
    res.update(ok=True, frames=len(FRAMES), avg=sum(times) / len(times), max=max(times), first=os.path.join(out_dir, "%s_result.png" % tag))
except BaseException:
    res["error"] = traceback.format_exc()[-1500:]
print("__RES__" + json.dumps(res))
'''


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    ids = [a for a in sys.argv[1:] if not a.startswith('--')]
    thumbs = '--no-thumbs' not in sys.argv
    dump = subprocess.run(['node', '-e', DUMP_JS, ROOT], capture_output=True, text=True, encoding='utf-8')
    if dump.stderr.strip():
        print(dump.stderr)
    if dump.returncode:
        sys.exit(2)
    apps = [a for a in json.loads(dump.stdout) if not ids or a['id'] in ids]
    work = tempfile.mkdtemp(prefix='ocv_apps_')
    # 한글 경로 문제를 피하려고 이미지 · 모델 · 동영상을 임시 폴더(영문 경로)에 모아 실행
    for d in [os.path.join(ROOT, 'images'), os.path.join(ROOT, 'images', 'apps'), os.path.join(ROOT, 'models'), os.path.join(ROOT, 'videos')]:
        if os.path.isdir(d):
            for f in os.listdir(d):
                p = os.path.join(d, f)
                if os.path.isfile(p):
                    shutil.copy(p, os.path.join(work, f))
    os.makedirs(THUMBS, exist_ok=True)
    fails = 0
    try:
        for a in apps:
            missing = [x for x in a['assets'] if not os.path.exists(os.path.join(work, x))]
            print(f"\n▶ {a['id']} · {a['title']}" + (f"  ⚠ 없는 assets: {missing}" if missing else ''))
            if missing:
                fails += 1
            for i, inp in enumerate(a['inputs']):
                spec = {'code': a['code'], 'input': inp, 'out': os.path.join(OUT, a['id']), 'videos': work, 'nframes': 60}
                try:
                    p = subprocess.run([sys.executable, '-X', 'utf8', '-c', RUNNER, json.dumps(spec)], cwd=work, capture_output=True,
                                       text=True, encoding='utf-8', timeout=600)
                    txt = (p.stdout or '') + (p.stderr or '')
                except subprocess.TimeoutExpired:
                    txt = '__RES__' + json.dumps({'ok': False, 'error': 'timeout'})
                line = [l for l in txt.splitlines() if l.startswith('__RES__')]
                res = json.loads(line[-1][7:]) if line else {'ok': False, 'error': txt[-1500:]}
                if res.get('ok'):
                    print(f"   ✓ {inp:28s} 설정 {res['setup']*1000:6.0f} ms · 프레임 {res['frames']:3d}장 평균 {res['avg']*1000:6.1f} ms (최대 {res['max']*1000:.0f})")
                    if i == 0 and thumbs:
                        import cv2
                        import numpy as np
                        img = cv2.imdecode(np.fromfile(res['first'], np.uint8), cv2.IMREAD_COLOR)
                        if img is not None:
                            h, w = img.shape[:2]
                            s = 480 / w
                            ok, buf = cv2.imencode('.jpg', cv2.resize(img, (480, int(h * s)), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 82])
                            open(os.path.join(THUMBS, a['id'] + '.jpg'), 'wb').write(buf.tobytes())
                else:
                    fails += 1
                    print(f"   ✗ {inp}\n{res.get('error')}")
    finally:
        shutil.rmtree(work, ignore_errors=True)
    print(f"\n결과: 실패 {fails} · 결과 이미지 폴더 {OUT}")
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
