/* =========================================================================
 * webcv 브리지 (Python 쪽 코드)
 * Pyodide 안에서 cv2 의 GUI 함수(imshow, waitKey, createTrackbar,
 * setMouseCallback, VideoCapture …)를 웹 결과 패널과 연결합니다.
 * JS 쪽 객체는 window.webcvHost (js/runtime.js) 입니다.
 * ========================================================================= */
window.WEBCV_BRIDGE_PY = String.raw`
import sys, os, io, types
os.environ.setdefault("MPLBACKEND", "Agg")
import numpy as np
import cv2
import js

HOST = js.webcvHost

LOOP_LIMIT = 300
LOOP_MSG = ("웹 실습 환경에서는 while 루프로 영상을 계속 읽거나 키 입력을 기다릴 수 없습니다.\n"
            "→ 실시간 처리는 def process(frame): 함수를 정의하고 결과 이미지를 return 하세요.")


class _State:
    def reset(self):
        self.windows = {}      # 창 이름 -> 이미지(참조 유지: 제자리 수정 시 갱신 반영)
        self.trackbars = {}    # (창, 트랙바) -> dict
        self.mouse = {}        # 창 -> (함수, param)
        self.wait_calls = 0
        self.read_calls = 0
        self.fig_count = 0
        self.ns = None


S = _State()
S.reset()

# ---------------------------------------------------------------- 표시 ----
def _prepare(mat):
    if mat is None:
        raise cv2.error("cv.imshow(): 표시할 이미지가 None 입니다. cv.imread() 의 파일 이름이나 경로를 확인하세요.")
    if isinstance(mat, cv2.UMat):
        mat = mat.get()
    a = np.asarray(mat)
    if a.dtype == object:
        raise cv2.error("cv.imshow(): 이미지 배열이 아닙니다 (dtype=object).")
    if a.size == 0:
        raise cv2.error("cv.imshow(): 이미지가 비어 있습니다 (size == 0). 슬라이싱 범위를 확인하세요.")
    if a.ndim == 3 and a.shape[2] == 1:
        a = a[:, :, 0]
    if a.ndim not in (2, 3) or (a.ndim == 3 and a.shape[2] not in (3, 4)):
        raise cv2.error("cv.imshow(): 지원하지 않는 배열 모양입니다: %r (2차원 흑백 또는 3/4채널 컬러)" % (a.shape,))
    dtype = a.dtype
    if dtype == np.bool_:
        raise cv2.error("cv.imshow(): bool 배열은 표시할 수 없습니다. mask.astype(np.uint8) * 255 로 바꾸세요.")
    if dtype == np.uint8:
        pass
    elif dtype == np.uint16:
        a = (a >> 8).astype(np.uint8)
    elif dtype.kind == "f":
        a = np.clip(np.nan_to_num(a) * 255.0, 0, 255).astype(np.uint8)
    else:
        a = np.clip(a, 0, 255).astype(np.uint8)
    if a.ndim == 2:
        rgba = cv2.cvtColor(np.ascontiguousarray(a), cv2.COLOR_GRAY2RGBA)
    elif a.shape[2] == 3:
        rgba = cv2.cvtColor(np.ascontiguousarray(a), cv2.COLOR_BGR2RGBA)
    else:
        rgba = cv2.cvtColor(np.ascontiguousarray(a), cv2.COLOR_BGRA2RGBA)
    ch = 1 if np.asarray(mat).ndim == 2 else np.asarray(mat).shape[2]
    info = "%d×%d · %dch · %s" % (rgba.shape[1], rgba.shape[0], ch, str(dtype))
    return np.ascontiguousarray(rgba), ch, info


def _render(name, mat):
    rgba, ch, info = _prepare(mat)
    HOST.showImage(str(name), rgba, ch, info)


def imshow(winname, mat):
    _prepare(mat)  # 오류가 있으면 먼저 알려줌
    S.windows[str(winname)] = mat
    _render(str(winname), mat)


def _refresh():
    for name, mat in list(S.windows.items()):
        if mat is None:
            continue
        try:
            _render(name, mat)
        except Exception:
            pass


def namedWindow(winname, flags=None):
    HOST.ensureWindow(str(winname))


def _noop(*args, **kwargs):
    return None


def waitKey(delay=0):
    S.wait_calls += 1
    if S.wait_calls > LOOP_LIMIT:
        raise RuntimeError(LOOP_MSG)
    return -1


def getWindowProperty(winname, prop_id):
    return 1.0


# ------------------------------------------------------------- 트랙바 ----
def createTrackbar(trackbarName, windowName, value, count, onChange):
    if not callable(onChange):
        raise TypeError("cv.createTrackbar(): 마지막 인자 onChange 는 함수여야 합니다. 예) def nothing(x): pass")
    key = (str(windowName), str(trackbarName))
    value = int(max(0, min(int(value), int(count))))
    S.trackbars[key] = {"value": value, "min": 0, "max": int(count), "cb": onChange}
    HOST.ensureWindow(key[0])
    HOST.addTrackbar(key[0], key[1], value, 0, int(count))


def _tb(trackbarname, winname, fn):
    key = (str(winname), str(trackbarname))
    tb = S.trackbars.get(key)
    if tb is None:
        raise cv2.error("cv.%s(): 창 '%s' 에 트랙바 '%s' 가 없습니다. createTrackbar 의 이름을 확인하세요." % (fn, key[0], key[1]))
    return key, tb


def getTrackbarPos(trackbarname, winname):
    return _tb(trackbarname, winname, "getTrackbarPos")[1]["value"]


def setTrackbarPos(trackbarname, winname, pos):
    key, tb = _tb(trackbarname, winname, "setTrackbarPos")
    tb["value"] = int(max(tb["min"], min(int(pos), tb["max"])))
    HOST.updateTrackbar(key[0], key[1], tb["value"], tb["min"], tb["max"])


def setTrackbarMin(trackbarname, winname, minval):
    key, tb = _tb(trackbarname, winname, "setTrackbarMin")
    tb["min"] = int(minval)
    tb["value"] = max(tb["value"], tb["min"])
    HOST.updateTrackbar(key[0], key[1], tb["value"], tb["min"], tb["max"])


def setTrackbarMax(trackbarname, winname, maxval):
    key, tb = _tb(trackbarname, winname, "setTrackbarMax")
    tb["max"] = int(maxval)
    tb["value"] = min(tb["value"], tb["max"])
    HOST.updateTrackbar(key[0], key[1], tb["value"], tb["min"], tb["max"])


def _on_trackbar(win, name, value):
    tb = S.trackbars.get((str(win), str(name)))
    if tb is None:
        return
    tb["value"] = int(value)
    tb["cb"](int(value))
    _refresh()


# --------------------------------------------------------------- 마우스 ----
def setMouseCallback(windowName, onMouse, param=None):
    if not callable(onMouse):
        raise TypeError("cv.setMouseCallback(): 두 번째 인자는 함수여야 합니다.")
    S.mouse[str(windowName)] = (onMouse, param)
    HOST.ensureWindow(str(windowName))
    HOST.enableMouse(str(windowName))


def _on_mouse(win, event, x, y, flags):
    entry = S.mouse.get(str(win))
    if entry is None:
        return
    fn, param = entry
    fn(int(event), int(x), int(y), int(flags), param)
    _refresh()


def _disable_mouse(win):
    S.mouse.pop(str(win), None)


# --------------------------------------------------------------- 웹캠 ----
_rgba_buf = None


def _frame_from_js(data, w, h):
    global _rgba_buf
    w, h = int(w), int(h)
    if _rgba_buf is None or _rgba_buf.shape != (h, w, 4):
        _rgba_buf = np.empty((h, w, 4), np.uint8)
    data.assign_to(_rgba_buf)
    return cv2.cvtColor(_rgba_buf, cv2.COLOR_RGBA2BGR)


def _grab_media(kind=None):
    r = HOST.grabFrame(kind)
    if r is None:
        return None
    return _frame_from_js(r.data, r.width, r.height)


class VideoCapture:
    """VideoCapture 대체 클래스.
    - VideoCapture(0): read() 는 현재 웹캠 프레임 1장
    - VideoCapture('vtest.avi'): 동영상을 오른쪽 패널의 입력 소스로 열고, read() 는 현재 재생 중인 프레임 1장
    """

    def __init__(self, index=0, apiPreference=None, *args):
        self._src = index
        self._kind = None
        self._opened = False
        self.open(index)

    def open(self, index=0, *args):
        self._src = index
        self._frame = None
        if isinstance(index, str):
            status = str(HOST.openVideo(index))
            if status != "missing":
                self._kind = "video"
                self._opened = True
                if status == "loading":
                    print("[안내] 동영상 '%s' 을(를) 입력 소스로 열었습니다. 아직 불러오는 중이면 잠시 후 다시 실행하세요.\n"
                          "       모든 프레임을 처리하려면 def process(frame): 를 정의하세요." % index)
            else:
                self._frame = cv2.imread(index)
                self._kind = "image" if self._frame is not None else None
                self._opened = self._frame is not None
                if not self._opened:
                    print("[안내] 파일을 찾을 수 없습니다: %s\n       사용 가능한 동영상: %s (또는 ⬆ 업로드한 동영상)"
                          % (index, str(HOST.videoNames())))
        else:
            self._kind = "camera"
            self._opened = bool(HOST.cameraReady())
            if not self._opened:
                HOST.requestCamera()
                print("[안내] 웹캠이 꺼져 있어 켜는 중입니다. 브라우저의 카메라 권한을 허용하고, 켜진 뒤 다시 실행하세요.")
        return self._opened

    def isOpened(self):
        return self._opened

    def read(self, image=None):
        S.read_calls += 1
        if S.read_calls > LOOP_LIMIT:
            raise RuntimeError(LOOP_MSG)
        if not self._opened:
            return False, None
        if self._kind == "image":
            return True, self._frame.copy()
        frame = _grab_media(self._kind)
        return (frame is not None), frame

    def grab(self):
        return self._opened

    def retrieve(self, image=None, flag=0):
        return self.read()

    def release(self):
        self._opened = False

    def get(self, propId):
        propId = int(propId)
        if self._kind == "video":
            info = HOST.videoInfo(self._src)
            return float({0: info.msec, 1: info.pos, 3: info.width, 4: info.height, 5: info.fps,
                          7: info.frames}.get(propId, 0.0))
        if self._kind == "image":
            h, w = self._frame.shape[:2]
            return float({3: w, 4: h, 5: 0.0, 7: 1}.get(propId, 0.0))
        if propId == 3:
            return float(HOST.cameraWidth())
        if propId == 4:
            return float(HOST.cameraHeight())
        if propId == 5:
            return 30.0
        return 0.0

    def set(self, propId, value):
        propId = int(propId)
        if self._kind == "video":
            if propId == 1:
                return bool(HOST.seekVideo(self._src, float(value)))
            if propId == 0:
                return bool(HOST.seekVideo(self._src, float(value) / 1000.0 * float(HOST.videoInfo(self._src).fps)))
        return False


class VideoWriter:
    def __init__(self, *args, **kwargs):
        print("[안내] 웹 실습 환경에서는 VideoWriter(동영상 저장)를 지원하지 않습니다. cv.imwrite 로 프레임을 저장하세요.")

    def isOpened(self):
        return False

    def write(self, frame):
        pass

    def release(self):
        pass


# ------------------------------------------------------------ 파일 저장 ----
_orig_imwrite = cv2.imwrite


def imwrite(filename, img, params=None):
    ok = _orig_imwrite(filename, img) if params is None else _orig_imwrite(filename, img, params)
    if ok:
        HOST.fileSaved(str(filename))
    return ok


# --------------------------------------------------------- process 실행 ----
def _show_result(out):
    if out is None:
        return
    if isinstance(out, (list, tuple)):
        for i, o in enumerate(out):
            imshow("result %d" % (i + 1), o)
    else:
        imshow("result", out)


def _call_process(frame):
    fn = S.ns.get("process") if S.ns is not None else None
    if not callable(fn):
        return
    S.wait_calls = 0
    S.read_calls = 0
    _show_result(fn(frame))
    _flush_figures()


def _process_camera(data, w, h):
    _call_process(_frame_from_js(data, w, h))


def _process_file(name):
    frame = cv2.imread(str(name), cv2.IMREAD_COLOR)
    if frame is None:
        raise cv2.error("입력 이미지를 읽을 수 없습니다: %s" % name)
    _call_process(frame)


def _has_process(ns):
    return callable(ns.get("process"))


# ---------------------------------------------------------- matplotlib ----
def _flush_figures():
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None:
        return
    for num in plt.get_fignums():
        fig = plt.figure(num)
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=90, bbox_inches="tight")
        img = cv2.imdecode(np.frombuffer(buf.getvalue(), np.uint8), cv2.IMREAD_COLOR)
        S.fig_count += 1
        name = "Figure %d" % S.fig_count
        S.windows[name] = None
        _render(name, img)
    plt.close("all")


def _patch_matplotlib():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    if getattr(plt, "_webcv_patched", False):
        return
    plt.show = lambda *a, **k: _flush_figures()
    plt._webcv_patched = True


# --------------------------------------------- 노드 편집기: 노드별 값 미리보기 ----
_NODE_VALUES = {}


def _pv(nid, *vals):
    _NODE_VALUES[nid] = vals


def _as_image(v):
    if isinstance(v, cv2.UMat):
        v = v.get()
    if not isinstance(v, np.ndarray) or v.size == 0 or v.dtype == object:
        return None
    a = v
    if a.ndim == 3 and a.shape[2] == 1:
        a = a[:, :, 0]
    if a.ndim == 2 and min(a.shape) >= 2:
        pass
    elif a.ndim == 3 and a.shape[2] in (3, 4) and min(a.shape[:2]) >= 2:
        pass
    else:
        return None
    if a.dtype == np.bool_:
        a = a.astype(np.uint8) * 255
    elif a.dtype.kind in "iu" and a.dtype != np.uint8:
        a = np.clip(a, 0, 255).astype(np.uint8)
    elif a.dtype.kind == "f":
        mx = float(np.nanmax(a)) if a.size else 0.0
        a = np.clip(np.nan_to_num(a) * (255.0 if mx <= 1.0 else 1.0), 0, 255).astype(np.uint8)
    return a


def _node_thumb(nid, idx, maxw, maxh):
    vals = _NODE_VALUES.get(str(nid))
    if not vals or int(idx) >= len(vals):
        return None
    a = _as_image(vals[int(idx)])
    if a is None:
        return None
    h, w = a.shape[:2]
    s = min(float(maxw) / w, float(maxh) / h, 1.0)
    if s < 1.0:
        a = cv2.resize(a, (max(1, int(w * s)), max(1, int(h * s))), interpolation=cv2.INTER_AREA)
    rgba, _, _ = _prepare(a)
    return rgba


def _describe(v):
    try:
        if isinstance(v, np.ndarray):
            txt = "ndarray %s %s" % (v.dtype, tuple(v.shape))
            if v.size and v.dtype.kind in "biuf" and v.size <= 12:
                txt += " = " + np.array2string(v.ravel(), precision=3, separator=", ")
            elif v.size and v.dtype.kind in "biuf":
                txt += "  (min %s · max %s)" % (np.round(float(v.min()), 3), np.round(float(v.max()), 3))
            return txt
        if isinstance(v, (list, tuple)):
            kind = "list" if isinstance(v, list) else "tuple"
            inner = ""
            if v and all(isinstance(x, np.ndarray) for x in v[:3]):
                inner = " · 첫 원소 ndarray %s" % (tuple(v[0].shape),)
            r = repr(v)
            return "%s 길이 %d%s%s" % (kind, len(v), inner, ("  " + r[:80] + ("…" if len(r) > 80 else "")) if not inner else "")
        if callable(v):
            return "함수 %s" % getattr(v, "__name__", type(v).__name__)
        r = repr(v)
        return "%s = %s" % (type(v).__name__, r[:120] + ("…" if len(r) > 120 else ""))
    except Exception as e:
        return type(v).__name__


def _node_info(nid):
    import json as _json
    vals = _NODE_VALUES.get(str(nid))
    if vals is None:
        return "null"
    return _json.dumps([{"text": _describe(v), "image": _as_image(v) is not None} for v in vals], ensure_ascii=False)


def _node_ids():
    import json as _json
    return _json.dumps(list(_NODE_VALUES.keys()))


# ------------------------------------------------------ 실행 준비/정리 ----
def _begin_run(ns):
    S.reset()
    S.ns = ns
    _NODE_VALUES.clear()


def _end_run():
    _flush_figures()


# ------------------------------------------------------------- 패치 적용 ----
for _name, _fn in {
    "imshow": imshow, "namedWindow": namedWindow, "waitKey": waitKey, "waitKeyEx": waitKey, "pollKey": waitKey,
    "destroyAllWindows": _noop, "destroyWindow": _noop, "resizeWindow": _noop, "moveWindow": _noop,
    "setWindowTitle": _noop, "setWindowProperty": _noop, "getWindowProperty": getWindowProperty,
    "startWindowThread": _noop,
    "createTrackbar": createTrackbar, "getTrackbarPos": getTrackbarPos, "setTrackbarPos": setTrackbarPos,
    "setTrackbarMin": setTrackbarMin, "setTrackbarMax": setTrackbarMax,
    "setMouseCallback": setMouseCallback, "VideoCapture": VideoCapture, "imwrite": imwrite,
}.items():
    setattr(cv2, _name, _fn)

if not hasattr(cv2, "VideoWriter"):
    cv2.VideoWriter = VideoWriter
if not hasattr(cv2, "VideoWriter_fourcc"):
    cv2.VideoWriter_fourcc = lambda *a: 0

_CONSTS = dict(
    EVENT_MOUSEMOVE=0, EVENT_LBUTTONDOWN=1, EVENT_RBUTTONDOWN=2, EVENT_MBUTTONDOWN=3, EVENT_LBUTTONUP=4,
    EVENT_RBUTTONUP=5, EVENT_MBUTTONUP=6, EVENT_LBUTTONDBLCLK=7, EVENT_RBUTTONDBLCLK=8, EVENT_MBUTTONDBLCLK=9,
    EVENT_MOUSEWHEEL=10, EVENT_MOUSEHWHEEL=11,
    EVENT_FLAG_LBUTTON=1, EVENT_FLAG_RBUTTON=2, EVENT_FLAG_MBUTTON=4, EVENT_FLAG_CTRLKEY=8,
    EVENT_FLAG_SHIFTKEY=16, EVENT_FLAG_ALTKEY=32,
    WINDOW_NORMAL=0, WINDOW_AUTOSIZE=1, WINDOW_OPENGL=4096, WINDOW_FULLSCREEN=1, WINDOW_FREERATIO=256,
    WINDOW_KEEPRATIO=0, WINDOW_GUI_EXPANDED=0, WINDOW_GUI_NORMAL=16,
    WND_PROP_FULLSCREEN=0, WND_PROP_AUTOSIZE=1, WND_PROP_ASPECT_RATIO=2, WND_PROP_OPENGL=3, WND_PROP_VISIBLE=4,
    CAP_PROP_POS_MSEC=0, CAP_PROP_POS_FRAMES=1, CAP_PROP_FRAME_WIDTH=3, CAP_PROP_FRAME_HEIGHT=4, CAP_PROP_FPS=5,
    CAP_PROP_FRAME_COUNT=7, CAP_ANY=0, CAP_DSHOW=700, CAP_MSMF=1400,
)
for _k, _v in _CONSTS.items():
    if not hasattr(cv2, _k):
        setattr(cv2, _k, _v)

try:
    _samples = cv2.samples
except AttributeError:
    _samples = types.SimpleNamespace()
    cv2.samples = _samples


def _find_file(relative_path, required=True, silentMode=False):
    name = os.path.basename(str(relative_path))
    for cand in (str(relative_path), name):
        if os.path.exists(cand):
            return cand
    if required:
        raise cv2.error("cv.samples.findFile(): 파일을 찾을 수 없습니다: %s" % relative_path)
    return ""


try:
    _samples.findFile = _find_file
except Exception:
    pass

# ------------------------------------------------------ webcv 도우미 모듈 ----
webcv = types.ModuleType("webcv")
webcv.__doc__ = "웹 실습 환경 도우미: get_input(), source_name(), is_camera()"


def _get_input():
    """오른쪽 패널에서 선택한 입력(이미지 또는 웹캠 프레임)을 BGR 배열로 돌려줍니다."""
    if bool(HOST.isMediaSource()):
        frame = _grab_media()
        if frame is not None:
            return frame
        print("[안내] 웹캠/동영상 프레임이 아직 준비되지 않았습니다. 기본 이미지(messi5.jpg)를 사용합니다.")
        return cv2.imread("messi5.jpg")
    name = str(HOST.sourceName())
    img = cv2.imread(name, cv2.IMREAD_COLOR)
    if img is None:
        img = cv2.imread("messi5.jpg")
    return img


webcv.get_input = _get_input
webcv.source_name = lambda: str(HOST.sourceName())
webcv.is_camera = lambda: bool(HOST.isCameraSource())
webcv.is_video = lambda: bool(HOST.isVideoSource())
webcv._pv = _pv
sys.modules["webcv"] = webcv

print("OpenCV", cv2.__version__, "| NumPy", np.__version__, "| Python", sys.version.split()[0])
`;
