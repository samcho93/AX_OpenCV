"""강좌 코드 스니펫 로컬 검증기

브라우저(Pyodide)의 webcv 브리지와 같은 규칙으로 cv2의 GUI 함수를 흉내 낸 뒤
모든 예제/실습 코드를 실제 OpenCV로 실행해 오류를 찾습니다.

사용: python tools/validate.py [lessonIdPrefix]   예) python tools/validate.py w2
"""
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, 'images')

RUNNER = r'''
import sys, os, json, types, traceback
os.environ["MPLBACKEND"] = "Agg"
import numpy as np
import cv2

LOOP_MSG = "웹 실습 환경에서는 while 루프로 영상을 계속 읽거나 키 입력을 기다릴 수 없습니다. def process(frame): 를 사용하세요."
S = types.SimpleNamespace(windows={}, trackbars={}, mouse={}, wait=0, read=0, figs=0)

def _check(mat):
    if mat is None:
        raise cv2.error("imshow(): 표시할 이미지가 None 입니다")
    a = np.asarray(mat)
    if a.size == 0:
        raise cv2.error("imshow(): 이미지가 비어 있습니다")
    if a.ndim == 3 and a.shape[2] == 1:
        a = a[:, :, 0]
    if a.ndim not in (2, 3) or (a.ndim == 3 and a.shape[2] not in (3, 4)):
        raise cv2.error("imshow(): 지원하지 않는 배열 모양 %r" % (a.shape,))
    if a.dtype == object:
        raise cv2.error("imshow(): dtype=object 배열은 표시할 수 없습니다")

def imshow(name, mat):
    _check(mat); S.windows[name] = mat
def namedWindow(name, flags=None): S.windows.setdefault(name, None)
def waitKey(delay=0):
    S.wait += 1
    if S.wait > 300: raise RuntimeError(LOOP_MSG)
    return -1
def createTrackbar(tb, win, value, count, cb):
    if not callable(cb): raise TypeError("createTrackbar: onChange 는 함수여야 합니다")
    S.trackbars[(win, tb)] = [int(value), int(count), cb]
def getTrackbarPos(tb, win):
    t = S.trackbars.get((win, tb))
    if t is None: raise cv2.error("getTrackbarPos: 트랙바 '%s' (창 '%s') 가 없습니다" % (tb, win))
    return t[0]
def setTrackbarPos(tb, win, pos):
    t = S.trackbars.get((win, tb))
    if t is None: raise cv2.error("setTrackbarPos: 트랙바가 없습니다")
    t[0] = int(pos)
def setMouseCallback(win, fn, param=None):
    if not callable(fn): raise TypeError("setMouseCallback: 함수가 필요합니다")
    S.mouse[win] = (fn, param)

_RealCapture = cv2.VideoCapture
VIDEO_DIR = os.environ.get("OCV_VIDEOS", "")

class VideoCapture:
    def __init__(self, src=0, *a):
        self.ok = True
        self.real = None
        if isinstance(src, str):
            base = os.path.splitext(os.path.basename(src))[0]
            path = os.path.join(VIDEO_DIR, base + ".mp4")
            if os.path.exists(path):
                self.real = _RealCapture(path)
            else:
                self.ok = cv2.imread(src) is not None
    def isOpened(self): return self.ok
    def open(self, *a): self.ok = True; return True
    def read(self):
        S.read += 1
        if S.read > 300: raise RuntimeError(LOOP_MSG)
        if not self.ok: return False, None
        if self.real is not None: return self.real.read()
        f = cv2.resize(cv2.imread("messi5.jpg"), (640, 480))
        return True, f
    def release(self): pass
    def get(self, prop):
        if self.real is not None: return self.real.get(prop)
        return {3: 640.0, 4: 480.0, 5: 30.0}.get(int(prop), 0.0)
    def set(self, prop, v):
        if self.real is not None and int(prop) in (0, 1): return self.real.set(prop, v)
        return False
    def grab(self): return True
    def retrieve(self): return self.read()

noop = lambda *a, **k: None
for k, v in dict(imshow=imshow, namedWindow=namedWindow, waitKey=waitKey, waitKeyEx=waitKey, pollKey=waitKey,
                 destroyAllWindows=noop, destroyWindow=noop, resizeWindow=noop, moveWindow=noop,
                 setWindowTitle=noop, setWindowProperty=noop, getWindowProperty=lambda *a: 1.0,
                 createTrackbar=createTrackbar, getTrackbarPos=getTrackbarPos, setTrackbarPos=setTrackbarPos,
                 setTrackbarMin=noop, setTrackbarMax=noop,
                 setMouseCallback=setMouseCallback, VideoCapture=VideoCapture).items():
    setattr(cv2, k, v)

webcv = types.ModuleType("webcv")
webcv.get_input = lambda: cv2.imread("messi5.jpg")
webcv.source_name = lambda: "messi5.jpg"
webcv.is_camera = lambda: False
sys.modules["webcv"] = webcv

code = sys.stdin.read()
ns = {"__name__": "__main__"}
try:
    exec(compile(code, "main.py", "exec"), ns)
    import matplotlib.pyplot as plt; plt.close("all")
    # 콜백과 process 도 한 번씩 호출
    for (win, tb), t in list(S.trackbars.items()):
        t[2](min(t[1], max(0, t[0] + 1)))
    for win, (fn, param) in list(S.mouse.items()):
        for ev, x, y, fl in [(1, 50, 50, 1), (0, 60, 60, 1), (0, 80, 70, 1), (4, 80, 70, 0), (7, 90, 90, 0), (2, 40, 40, 2), (5, 40, 40, 0)]:
            fn(ev, x, y, fl, param)
    proc = ns.get("process")
    if callable(proc):
        for src in ("messi5.jpg", "cam"):
            frame = cv2.imread("messi5.jpg") if src != "cam" else cv2.resize(cv2.imread("messi5.jpg"), (640, 480))
            S.wait = 0; S.read = 0
            out = proc(frame)
            if out is not None:
                outs = out if isinstance(out, (list, tuple)) else [out]
                for o in outs: _check(o)
    print("__OK__")
except Exception:
    tb = traceback.format_exc()
    print("__ERR__" + tb)
'''


WORKDIR = None  # images/ 의 임시 복사본 (imwrite 결과가 원본 폴더에 섞이지 않도록)


def run_snippet(sn):
    try:
        p = subprocess.run([sys.executable, '-X', 'utf8', '-c', RUNNER], input=sn['code'], capture_output=True,
                           text=True, encoding='utf-8', cwd=WORKDIR, timeout=90,
                           env={**os.environ, 'OCV_VIDEOS': os.path.join(ROOT, 'videos')})
        out = (p.stdout or '') + (p.stderr or '')
    except subprocess.TimeoutExpired:
        out = '__ERR__timeout (90s) — 무한 루프?'
    ok = '__OK__' in out
    return sn, ok, out


def main():
    global WORKDIR
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    import shutil
    import tempfile
    tmp = tempfile.mkdtemp(prefix='ocv_validate_')
    WORKDIR = os.path.join(tmp, 'images')
    shutil.copytree(IMAGES, WORKDIR)
    try:
        _main()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _main():
    prefix = sys.argv[1] if len(sys.argv) > 1 else ''
    dump = subprocess.run(['node', os.path.join(ROOT, 'tools', 'dump_lessons.js'), prefix], capture_output=True,
                          text=True, encoding='utf-8')
    if dump.stderr.strip():
        print(dump.stderr)
    if '[SYNTAX]' in dump.stderr or dump.returncode != 0:
        print('✗ 강좌 JS 파일에 문법 오류가 있습니다.')
        sys.exit(2)
    data = json.loads(dump.stdout)
    for s in data['stats']:
        flag = ' (미작성)' if s['placeholder'] else ''
        print(f"  {s['id']}: blocks={s['blocks']} practice={s['practice']} quiz={s['quiz']}{flag}")
    snippets = data['snippets']
    print(f'\n{len(snippets)}개 스니펫 실행 중…')
    fails = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        for sn, ok, out in ex.map(run_snippet, snippets):
            if not ok:
                fails += 1
                err = out.split('__ERR__', 1)[-1].strip()
                print(f"\n✗ {sn['id']} [{sn['kind']} {sn.get('index', '')}] {sn['title']}\n{err[-1500:]}")
    print(f"\n결과: {len(snippets) - fails} 통과 / {fails} 실패")
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
