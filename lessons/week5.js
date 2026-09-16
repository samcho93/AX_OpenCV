/* 5주차: 프로젝트 Ⅱ · 구현과 발표 */
COURSE.addLessons([
  // =====================================================================
  // w5-1 구현 ① 입력과 전처리 모듈화
  // =====================================================================
  {
    id: 'w5-1',
    summary: '프로토타입 코드를 함수와 CONFIG 로 정리하고, 크기가 제각각인 입력을 일정한 작업 해상도로 맞춘 뒤 여러 이미지로 전처리를 시험합니다.',
    goals: [
      '한 덩어리 스크립트를 load_input / preprocess 같은 함수로 나누고 docstring 을 쓸 수 있다',
      '코드 곳곳의 숫자(매직 넘버)를 CONFIG 딕셔너리로 모아 관리할 수 있다',
      '작업 해상도(work width)로 크기를 맞추고, 배율(scale)로 좌표를 원본에 되돌릴 수 있다',
      'make_grid() 디버그 격자로 여러 이미지·여러 단계의 전처리 결과를 한눈에 비교할 수 있다',
    ],
    schedule: [['도입: 5주차 흐름과 예제 프로젝트', 5], ['개념: 함수 분리 · CONFIG · 작업 해상도', 12], ['예제 실습', 18], ['팀 프로젝트에 적용', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 5주차에 할 일: “돌아가는 코드”를 “완성된 프로젝트”로</h3>
<p>4주차에 팀별로 주제를 정하고 스켈레톤(<code>CONFIG</code>, <code>load_input()</code>, <code>preprocess()</code>, <code>detect()</code>, <code>analyze()</code>, <code>visualize()</code>, <code>process(frame)</code>)으로 프로토타입을 만들었습니다.
5주차에는 이 뼈대를 단계적으로 <b>튼튼하게</b> 만들고, 결과를 정리해 <b>발표</b>합니다.</p>
<p>팀마다 주제가 다르므로, 이번 주 수업은 하나의 공통 예제 <b>“책상 위 물건 분석기(Desk Object Analyzer)”</b>를 교시마다 조금씩 발전시키며 <b>어느 프로젝트에나 쓰이는 구현 기술</b>을 배웁니다. 예제에서 배운 기술을 바로 팀 코드에 옮겨 적용하세요.</p>
<ul>
  <li><b>입력</b>: <code>stuff.jpg</code> (책상 위 연필, 라이터, 동전, 공, 검은 캡) 또는 웹캠</li>
  <li><b>목표</b>: 물체를 찾아 상자로 표시하고, 크기·모양·색으로 분류하고, 개수를 셉니다</li>
  <li><b>파이프라인</b>: 흑백·블러 → Canny 엣지 → 모폴로지 닫기 → 컨투어 → 면적 필터 → 특징 계산 → 시각화</li>
</ul>` },
      { type: 'image', src: 'stuff.jpg', caption: '이번 주 예제 입력 stuff.jpg (640×480) — 왼쪽이 어둡게 그늘진(비네팅) 것이 함정입니다' },
      { type: 'table', head: ['교시', '책상 물건 분석기에 추가되는 것', '팀 프로젝트에서 할 일'], rows: [
        ['w5-1', '입력 · 전처리 함수, CONFIG, 작업 해상도, 디버그 격자', '전처리 모듈 정리, 여러 입력으로 시험'],
        ['w5-2', '검출(Canny+모폴로지+컨투어), 필터, 특징 dict, 디버그 뷰', '핵심 알고리즘 완성, 단계별 시각화'],
        ['w5-3', 'process(frame) 연결, 단계별 시간 측정, 최적화, 개수 안정화', '웹캠에서 실시간으로 동작'],
        ['w5-4', '트랙바 튜닝 패널, 클릭 선택, 반투명 정보 패널', '데모용 인터랙션 완성'],
        ['w5-5 ~ w5-8', '디버깅 · 테스트 · 결과 정리 · 발표 · 회고', '마무리와 발표'],
      ] },
      { type: 'text', html: `
<h3>2. 왜 함수로 나눌까? — 모듈화(Modularization)</h3>
<p>프로토타입은 보통 위에서 아래로 쭉 이어진 “한 덩어리” 코드입니다. 처음엔 빠르지만 곧 이런 문제가 생깁니다.</p>
<ul>
  <li>블러 크기를 바꾸려면 코드 여기저기를 찾아 고쳐야 한다 (숫자가 흩어져 있음)</li>
  <li>다른 이미지나 웹캠으로 바꾸면 크기가 달라 결과가 망가진다</li>
  <li>어느 단계에서 잘못됐는지 확인하기 어렵다 (중간 결과를 볼 수 없음)</li>
  <li>팀원이 나눠서 작업하기 어렵다 (같은 줄을 동시에 고침)</li>
</ul>
<p>함수로 나누면 <b>단계마다 입력과 출력이 분명</b>해집니다. 좋은 함수의 규칙 세 가지:</p>
<ol>
  <li><b>한 가지 일만</b> 한다 — <code>preprocess()</code> 는 전처리만, 그리기는 <code>visualize()</code> 에서</li>
  <li><b>입력 이미지를 망가뜨리지 않는다</b> — 그림을 그려야 하면 <code>img.copy()</code> 에</li>
  <li><b>docstring</b> 으로 무엇을 받고 무엇을 돌려주는지 적는다 — <code>"""설명"""</code> 을 함수 첫 줄에</li>
</ol>` },
      { type: 'code', title: '예제 1 · 모듈화 전: 한 덩어리 프로토타입', code: String.raw`
import cv2 as cv
import numpy as np

# 4주차 프로토타입처럼 위에서 아래로 쭉 쓴 코드
img = cv.imread('stuff.jpg')
small = cv.resize(img, (480, 360))          # 다른 비율의 이미지는 찌그러진다
gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)     # 5 는 왜 5일까?
edges = cv.Canny(blur, 30, 90)              # 30, 90 은?
contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

out = small.copy()
count = 0
for c in contours:
    if cv.contourArea(c) > 300:             # 300 은?
        x, y, w, h = cv.boundingRect(c)
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
        count += 1

print('찾은 컨투어 수:', len(contours), '/ 면적 300 초과:', count)
cv.imshow('edges', edges)
cv.imshow('result', out)
`, desc: '<p>동작은 하지만 숫자(5, 30, 90, 300)가 흩어져 있고, 중간 결과를 재사용하기 어렵습니다. 끊어진 엣지 때문에 물체 수도 정확하지 않습니다(이건 w5-2 에서 고칩니다). 이 코드를 함수로 나눠 봅시다.</p>' },
      { type: 'text', html: `
<h3>3. 설정은 한곳에 — CONFIG 딕셔너리</h3>
<p>코드 속에 박힌 의미 모를 숫자를 <b>매직 넘버(magic number)</b>라고 합니다. 모든 파라미터를 맨 위 <code>CONFIG</code> 딕셔너리에 이름을 붙여 모으면:</p>
<ul>
  <li>튜닝할 때 <b>한곳만</b> 고치면 되고, 나중에 트랙바와 연결하기도 쉽습니다(w5-4)</li>
  <li>이름 자체가 설명이 됩니다 — <code>CONFIG['blur_ksize']</code></li>
  <li>설정을 바꿔 가며 실험하기 쉽습니다 — <code>dict(CONFIG, use_clahe=True)</code> 는 CONFIG 를 복사하면서 한 값만 바꾼 새 딕셔너리</li>
</ul>
<p>전처리 결과는 여러 장(작업용 컬러, 흑백, 블러…)이므로 <b>딕셔너리로 묶어 반환</b>하면 다음 단계와 디버그 뷰에서 이름으로 꺼내 쓸 수 있습니다.</p>` },
      { type: 'code', title: '예제 2 · CONFIG 와 docstring 이 있는 전처리 모듈', code: String.raw`
import cv2 as cv
import numpy as np

# ---------------- 설정: 숫자는 모두 여기에 ----------------
CONFIG = {
    'input': 'stuff.jpg',   # 입력 파일
    'work_width': 480,      # 작업 해상도(가로 픽셀). 모든 입력을 이 폭으로 맞춘다
    'blur_ksize': 5,        # 가우시안 블러 커널 크기(홀수, 1 이면 블러 안 함)
    'use_clahe': False,     # 대비 향상(CLAHE) 사용 여부
    'clahe_clip': 2.0,      # CLAHE 대비 제한값
}


def load_input(name):
    """이미지 파일을 BGR 배열로 읽어 돌려준다. 읽지 못하면 오류를 낸다."""
    img = cv.imread(name)
    if img is None:
        raise FileNotFoundError('이미지를 읽을 수 없습니다: ' + name)
    return img


def resize_to_width(img, width):
    """가로 폭을 width 로 맞춘 이미지와 배율(scale = 결과 / 원본)을 돌려준다."""
    h, w = img.shape[:2]                     # shape 는 (세로, 가로) 순서
    scale = width / w
    size = (width, int(round(h * scale)))    # cv.resize 의 크기는 (가로, 세로) 순서!
    interp = cv.INTER_AREA if scale < 1 else cv.INTER_LINEAR
    return cv.resize(img, size, interpolation=interp), scale


def preprocess(img, cfg):
    """BGR 이미지를 분석하기 좋은 형태로 바꾼다.

    반환: dict
      work  : 작업 해상도로 줄인 컬러 이미지
      gray  : 흑백 (옵션: CLAHE 대비 향상)
      blur  : 블러된 흑백
      scale : 작업 해상도 / 원본 해상도
    """
    work, scale = resize_to_width(img, cfg['work_width'])
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    if cfg['use_clahe']:
        clahe = cv.createCLAHE(clipLimit=cfg['clahe_clip'], tileGridSize=(8, 8))
        gray = clahe.apply(gray)
    k = cfg['blur_ksize']
    blur = cv.GaussianBlur(gray, (k, k), 0) if k > 1 else gray
    return {'work': work, 'gray': gray, 'blur': blur, 'scale': scale}


# ---------------- 사용 ----------------
img = load_input(CONFIG['input'])
pre = preprocess(img, CONFIG)

print(preprocess.__doc__)                   # docstring 은 이렇게 읽을 수 있다
print('원본 크기:', img.shape)
for key, val in pre.items():
    if isinstance(val, np.ndarray):
        print(f'{key:6s} shape={val.shape} dtype={val.dtype}')
    else:
        print(f'{key:6s} = {val:.3f}')

cv.imshow('work', pre['work'])
cv.imshow('blur', pre['blur'])
`, desc: '<p>함수 이름과 docstring 만 읽어도 무엇을 하는지 알 수 있습니다. <code>preprocess()</code> 는 원본 <code>img</code> 를 수정하지 않고 새 이미지를 만들어 돌려줍니다.</p>' },
      { type: 'text', html: `
<h3>4. 크기가 제각각인 입력 — 작업 해상도와 배율</h3>
<p>샘플 이미지만 봐도 크기가 다릅니다: <code>stuff.jpg</code> 640×480, <code>smarties.png</code> 413×356, <code>building.jpg</code> 868×600, 웹캠 640×480(또는 1280×720).
면적 300 같은 파라미터는 <b>해상도가 바뀌면 의미가 달라집니다</b>(가로·세로가 2배면 면적은 4배).</p>
<p>그래서 입력을 받자마자 <b>정해진 가로 폭(work_width)으로 맞춘 뒤</b> 모든 처리를 그 크기에서 합니다. 이때 비율은 유지해야 하므로 세로는 <code>h × scale</code> 로 계산합니다.</p>
<ul>
  <li><code>scale = work_width / 원본 가로</code> (예: 480 / 640 = 0.75)</li>
  <li>작업 좌표 → 원본 좌표: <code>x_원본 = x_작업 / scale</code> (예: 120 / 0.75 = 160)</li>
  <li>원본 좌표 → 작업 좌표: <code>x_작업 = x_원본 × scale</code> (마우스 클릭 좌표를 변환할 때, w5-4)</li>
  <li>좌표는 그리기 함수에 넣기 전에 반드시 <code>int()</code> 로 정수화</li>
</ul>
<p>결과는 원본(고해상도)에 그려야 보기 좋으므로, <b>작업 해상도에서 찾고 → 원본 좌표로 되돌려 그리는</b> 흐름을 기억하세요. 작업 해상도가 작을수록 빠르지만(w5-3) 작은 물체를 놓칠 수 있습니다.</p>` },
      { type: 'code', title: '예제 3 · 작업 해상도에서 찾고, 원본 좌표로 되돌려 그리기', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'work_width': 320, 'blur_ksize': 5, 'canny_lo': 30, 'canny_hi': 90}


def resize_to_width(img, width):
    """가로 폭을 width 로 맞춘 이미지와 배율을 돌려준다."""
    h, w = img.shape[:2]
    scale = width / w
    return cv.resize(img, (width, int(round(h * scale))), interpolation=cv.INTER_AREA), scale


def to_original(box, scale):
    """작업 해상도의 상자 (x, y, w, h) 를 원본 해상도 좌표로 되돌린다."""
    x, y, w, h = box
    return (int(x / scale), int(y / scale), int(w / scale), int(h / scale))


def largest_object_box(work, cfg):
    """작업 이미지에서 가장 큰 엣지 덩어리의 상자를 찾는다 (간단 버전)."""
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    k = cfg['blur_ksize']
    edges = cv.Canny(cv.GaussianBlur(gray, (k, k), 0), cfg['canny_lo'], cfg['canny_hi'])
    edges = cv.dilate(edges, np.ones((5, 5), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    return cv.boundingRect(max(contours, key=cv.contourArea))


for name in ['stuff.jpg', 'HappyFish.jpg', 'blox.jpg']:
    img = cv.imread(name)
    work, scale = resize_to_width(img, CONFIG['work_width'])
    box = largest_object_box(work, CONFIG)
    if box is None:
        print(name, '물체 없음')
        continue
    obox = to_original(box, scale)
    print(f'{name:13s} 원본 {img.shape[1]}x{img.shape[0]}  scale={scale:.3f}  작업 상자={box}  원본 상자={obox}')

    x, y, w, h = obox
    out = img.copy()                          # 원본은 그대로 두고 복사본에 그리기
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 3)
    cv.putText(out, f'scale={scale:.2f}', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    cv.imshow(name, out)
`, desc: '<p>세 이미지 모두 가로 320 에서 처리했지만(stuff.jpg 는 축소, 작은 두 이미지는 확대), 빨간 상자는 원본 크기 이미지의 올바른 위치에 그려집니다. <code>to_original()</code> 을 빼고 작업 좌표를 그대로 그리면 상자가 왼쪽 위로 쏠립니다(실습 3).</p>' },
      { type: 'text', html: `
<h3>5. 대비 옵션과 디버그 격자 — make_grid()</h3>
<p><code>stuff.jpg</code> 는 왼쪽이 어둡습니다. 이렇게 <b>조명이 고르지 않은</b> 사진에 전역 Otsu 이진화를 쓰면 그늘진 책상 부분이 통째로 “물체”가 됩니다.
CLAHE(3주차)는 국소 대비를 높여 어두운 부분의 디테일을 살려 주지만, 조명 차이 자체를 없애지는 못합니다. 그래서 이 예제는 밝기 차이에 덜 민감한 <b>Canny 엣지</b>를 주 방법으로 씁니다.</p>
<p>이런 판단을 하려면 <b>여러 단계를 나란히 비교</b>할 수 있어야 합니다. 창을 여러 개 띄우면 비교가 어려우므로, 이미지를 한 장의 격자로 합치는 도우미 <code>make_grid(images, labels, cols)</code> 를 만듭니다.</p>
<ul>
  <li>흑백(2차원)은 <code>cv.COLOR_GRAY2BGR</code> 로 3채널로 바꾼다 (hstack 하려면 채널 수가 같아야 함)</li>
  <li>모든 칸을 같은 크기로 맞춘다 (비율 유지 + 남는 곳은 검은색) — <code>np.hstack</code> 은 세로 크기, <code>np.vstack</code> 은 가로 크기가 같아야 함</li>
  <li>칸 위에 라벨(영어)을 쓴다 — 가능하면 수치도 함께 (예: <code>otsu T=124</code>)</li>
  <li>칸 수가 모자라면 빈 칸을 채운 뒤 줄 단위로 <code>hstack</code> → 전체 <code>vstack</code></li>
</ul>` },
      { type: 'code', title: '예제 4 · make_grid() 로 전처리 단계 한눈에 보기', code: String.raw`
import cv2 as cv
import numpy as np


def make_grid(images, labels=None, cols=3, cell_w=240, cell_h=180):
    """여러 이미지를 같은 크기 칸에 맞춰 격자 한 장으로 합친다.

    images : 이미지 리스트 (흑백/컬러가 섞여도 됨)
    labels : 칸마다 쓸 글자 리스트 (영어) 또는 None
    cols   : 한 줄에 놓을 칸 수
    """
    cells = []
    for i, im in enumerate(images):
        if im.dtype != np.uint8:                       # float 등은 표시용 uint8 로
            im = cv.convertScaleAbs(im)
        if im.ndim == 2:                               # 흑백 → 3채널
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        elif im.shape[2] == 4:                         # 투명 채널 제거
            im = cv.cvtColor(im, cv.COLOR_BGRA2BGR)
        h, w = im.shape[:2]
        s = min(cell_w / w, cell_h / h)                # 비율 유지하며 칸에 맞추기
        nw, nh = max(1, int(w * s)), max(1, int(h * s))
        cell = np.zeros((cell_h, cell_w, 3), np.uint8)
        x0, y0 = (cell_w - nw) // 2, (cell_h - nh) // 2
        cell[y0:y0 + nh, x0:x0 + nw] = cv.resize(im, (nw, nh), interpolation=cv.INTER_AREA)
        if labels is not None:
            cv.rectangle(cell, (0, 0), (cell_w, 20), (50, 50, 50), -1)
            cv.putText(cell, str(labels[i]), (5, 15), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)
        cv.rectangle(cell, (0, 0), (cell_w - 1, cell_h - 1), (90, 90, 90), 1)
        cells.append(cell)
    while len(cells) % cols:                           # 빈 칸 채우기
        cells.append(np.zeros((cell_h, cell_w, 3), np.uint8))
    rows = [np.hstack(cells[r:r + cols]) for r in range(0, len(cells), cols)]
    return np.vstack(rows)


img = cv.imread('stuff.jpg')
work = cv.resize(img, (480, 360), interpolation=cv.INTER_AREA)
gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
blur = cv.GaussianBlur(gray, (5, 5), 0)
T, otsu = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
edges = cv.Canny(blur, 30, 90)

grid = make_grid(
    [work, gray, clahe, blur, otsu, edges],
    ['work 480x360', 'gray', 'CLAHE clip=2', 'blur k=5', f'otsu T={T:.0f} (fails!)', 'canny 30/90'],
    cols=3)
print('격자 크기:', grid.shape)
cv.imshow('preprocess debug', grid)
`, desc: '<p>Otsu 결과(아래 가운데)는 왼쪽 그늘이 통째로 흰색이 되어 실패하고, Canny(아래 오른쪽)는 물체 윤곽이 잘 보입니다. 이렇게 한 장으로 비교하면 “어떤 방법을 쓸지”를 근거를 가지고 결정할 수 있습니다. <code>make_grid()</code> 는 이번 주 내내 재사용합니다.</p>' },
      { type: 'code', title: '예제 5 · 여러 입력으로 전처리 시험하기 (내 입력 포함)', code: String.raw`
import cv2 as cv
import numpy as np
import webcv

CONFIG = {'work_width': 480, 'blur_ksize': 5, 'use_clahe': True, 'clahe_clip': 2.0,
          'canny_lo': 30, 'canny_hi': 90}


def make_grid(images, labels=None, cols=3, cell_w=200, cell_h=150):
    """여러 이미지를 같은 크기 칸에 맞춰 격자 한 장으로 합친다."""
    cells = []
    for i, im in enumerate(images):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        h, w = im.shape[:2]
        s = min(cell_w / w, cell_h / h)
        nw, nh = max(1, int(w * s)), max(1, int(h * s))
        cell = np.zeros((cell_h, cell_w, 3), np.uint8)
        x0, y0 = (cell_w - nw) // 2, (cell_h - nh) // 2
        cell[y0:y0 + nh, x0:x0 + nw] = cv.resize(im, (nw, nh), interpolation=cv.INTER_AREA)
        if labels is not None:
            cv.rectangle(cell, (0, 0), (cell_w, 18), (50, 50, 50), -1)
            cv.putText(cell, str(labels[i]), (4, 13), cv.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv.LINE_AA)
        cells.append(cell)
    while len(cells) % cols:
        cells.append(np.zeros((cell_h, cell_w, 3), np.uint8))
    return np.vstack([np.hstack(cells[r:r + cols]) for r in range(0, len(cells), cols)])


def preprocess(img, cfg):
    """작업 해상도로 맞추고 흑백 → (CLAHE) → 블러. dict 로 반환."""
    h, w = img.shape[:2]
    scale = cfg['work_width'] / w
    work = cv.resize(img, (cfg['work_width'], int(round(h * scale))), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    if cfg['use_clahe']:
        gray = cv.createCLAHE(clipLimit=cfg['clahe_clip'], tileGridSize=(8, 8)).apply(gray)
    k = cfg['blur_ksize']
    blur = cv.GaussianBlur(gray, (k, k), 0) if k > 1 else gray
    return {'work': work, 'gray': gray, 'blur': blur, 'scale': scale}


# 테스트할 입력들: 샘플 3장 + 오른쪽 패널에서 고른 입력(업로드 이미지나 웹캠도 가능)
inputs = [('stuff.jpg', cv.imread('stuff.jpg')),
          ('smarties.png', cv.imread('smarties.png')),
          ('cards.png', cv.imread('cards.png')),
          ('my input', webcv.get_input())]

images, labels = [], []
print(f'{"name":13s} {"original":>10s} {"work":>9s} {"scale":>6s} {"edge %":>7s}')
for name, img in inputs:
    pre = preprocess(img, CONFIG)
    edges = cv.Canny(pre['blur'], CONFIG['canny_lo'], CONFIG['canny_hi'])
    edge_ratio = 100.0 * cv.countNonZero(edges) / edges.size   # 엣지 픽셀 비율(%)
    wh = pre['work'].shape
    print(f'{name:13s} {img.shape[1]:>4d}x{img.shape[0]:<5d} {wh[1]:>4d}x{wh[0]:<4d} {pre["scale"]:6.3f} {edge_ratio:7.2f}')
    images += [pre['work'], pre['blur'], edges]
    labels += [name, 'blur (clahe)', f'edges {edge_ratio:.1f}%']

cv.imshow('preprocess test', make_grid(images, labels, cols=3))
`, desc: '<p>한 줄이 입력 하나입니다. 모든 입력이 가로 480 으로 맞춰졌는지, 엣지 비율이 너무 높거나(잡음·질감) 너무 낮은지(대비 부족) 표와 격자로 확인하세요. 오른쪽 패널에서 입력 소스를 바꾸거나 이미지를 업로드한 뒤 다시 실행하면 마지막 줄이 바뀝니다.</p>' },
      { type: 'tip', html: `<p><b>팀 프로젝트 적용</b>: 팀 코드의 <code>preprocess()</code> 가 <b>dict 를 반환</b>하도록 바꾸고, 팀 주제와 비슷한 이미지 3장 이상(샘플, 업로드, 웹캠 스냅샷 <code>webcam.png</code>)으로 예제 5 처럼 시험해 보세요. 한 이미지에서만 잘 되는 파라미터는 발표장에서 실패합니다.</p>` },
      { type: 'checklist', title: '전처리 모듈 점검 목록', items: [
        '코드 안에 의미 없는 숫자 대신 CONFIG 의 이름을 사용한다',
        'load_input / preprocess 에 docstring 이 있고, 반환값이 무엇인지 적혀 있다',
        '입력 크기가 달라도 work_width 로 맞춰 처리하고 scale 을 함께 돌려준다',
        '원본 이미지를 직접 수정하지 않는다 (그릴 때는 copy())',
        '파일을 못 읽었을 때(None) 알아보기 쉬운 메시지가 나온다',
        '최소 3장의 서로 다른 입력으로 make_grid 디버그 격자를 확인했다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 안전한 load_input() 만들기',
        desc: `<p><code>load_input(name)</code> 을 다음 규칙으로 완성하세요.</p>
<ul><li><code>name</code> 이 <code>None</code> 이면 오른쪽 패널 입력 <code>webcv.get_input()</code> 을 돌려준다</li>
<li>파일을 못 읽으면(<code>None</code>) <code>[경고]</code> 문구를 출력하고 <code>webcv.get_input()</code> 으로 대체한다</li>
<li>흑백(2차원)이면 3채널 BGR 로, 4채널(BGRA)이면 3채널로 바꾼다</li></ul>
<p>마지막 출력에서 모든 입력의 shape 가 <code>(세로, 가로, 3)</code> 이 되면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import webcv


def load_input(name=None):
    """name 파일(없으면 패널 입력)을 3채널 BGR 배열로 돌려준다."""
    # TODO 1: name 이 None 이면 webcv.get_input() 을 돌려주세요
    # TODO 2: 읽기에 실패하면(None) 경고를 출력하고 webcv.get_input() 으로 대체하세요
    # TODO 3: 2차원(흑백)이면 GRAY2BGR, 4채널이면 BGRA2BGR 로 바꾸세요
    img = cv.imread(name if name else 'stuff.jpg', cv.IMREAD_UNCHANGED)  # 채널을 그대로 읽음
    return img


for name in ['stuff.jpg', 'box.png', 'cards.png', 'no_such_file.jpg', None]:
    img = load_input(name)
    if img is None:
        print(f'{str(name):18s} -> None  (아직 처리하지 않음)')
    else:
        print(f'{str(name):18s} -> shape={img.shape}')

cv.imshow('last input', load_input('stuff.jpg'))
`,
        hint: `<p><code>if name is None: return webcv.get_input()</code> 으로 시작하세요. 차원 수는 <code>img.ndim</code>, 채널 수는 <code>img.shape[2]</code> 로 확인합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import webcv


def load_input(name=None):
    """name 파일(없으면 패널 입력)을 3채널 BGR 배열로 돌려준다."""
    if name is None:
        return webcv.get_input()
    img = cv.imread(name, cv.IMREAD_UNCHANGED)
    if img is None:
        print('[경고] 파일을 읽을 수 없어 패널 입력으로 대체합니다:', name)
        return webcv.get_input()
    if img.ndim == 2:
        img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        img = cv.cvtColor(img, cv.COLOR_BGRA2BGR)
    return img


for name in ['stuff.jpg', 'box.png', 'cards.png', 'no_such_file.jpg', None]:
    img = load_input(name)
    if img is None:
        print(f'{str(name):18s} -> None')
    else:
        print(f'{str(name):18s} -> shape={img.shape}')

cv.imshow('last input', load_input('stuff.jpg'))
`,
      },
      {
        title: '실습 2 · 블러 종류를 CONFIG 로 고르기',
        desc: `<p><code>CONFIG['blur_type']</code> 이 <code>'gaussian'</code>, <code>'median'</code>, <code>'bilateral'</code> 중 무엇이냐에 따라 다른 블러를 쓰도록 <code>preprocess()</code> 를 고치세요.
아래 비교 코드는 <code>dict(CONFIG, blur_type=...)</code> 로 설정만 바꿔 세 번 실행하고 Canny 결과를 격자로 보여줍니다. 세 칸의 엣지 모양이 서로 달라지면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'work_width': 480, 'blur_type': 'gaussian', 'blur_ksize': 5, 'canny_lo': 30, 'canny_hi': 90}


def make_grid(images, labels, cols=3, cell_w=240, cell_h=180):
    """같은 크기 칸에 맞춰 격자로 합친다 (라벨 포함)."""
    cells = []
    for im, lab in zip(images, labels):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        cell = cv.resize(im, (cell_w, cell_h), interpolation=cv.INTER_AREA)
        cv.putText(cell, lab, (5, 18), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv.LINE_AA)
        cells.append(cell)
    while len(cells) % cols:
        cells.append(np.zeros((cell_h, cell_w, 3), np.uint8))
    return np.vstack([np.hstack(cells[r:r + cols]) for r in range(0, len(cells), cols)])


def preprocess(img, cfg):
    """작업 해상도 → 흑백 → 블러(종류 선택)."""
    h, w = img.shape[:2]
    scale = cfg['work_width'] / w
    work = cv.resize(img, (cfg['work_width'], int(h * scale)), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    k = cfg['blur_ksize']
    # TODO: blur_type 이 'median' 이면 cv.medianBlur, 'bilateral' 이면 cv.bilateralFilter 를 쓰세요
    blur = cv.GaussianBlur(gray, (k, k), 0)
    return {'work': work, 'gray': gray, 'blur': blur, 'scale': scale}


img = cv.imread('stuff.jpg')
images, labels = [], []
for t in ['gaussian', 'median', 'bilateral']:
    pre = preprocess(img, dict(CONFIG, blur_type=t))
    edges = cv.Canny(pre['blur'], CONFIG['canny_lo'], CONFIG['canny_hi'])
    images.append(edges)
    labels.append(f'{t}: {cv.countNonZero(edges)} px')
cv.imshow('blur type compare', make_grid(images, labels))
`,
        hint: `<p><code>cv.medianBlur(gray, k)</code> 는 커널 크기 하나(홀수)만, <code>cv.bilateralFilter(gray, 9, 75, 75)</code> 는 (지름, 색 시그마, 공간 시그마)를 받습니다. <code>if / elif / else</code> 로 나누세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'work_width': 480, 'blur_type': 'gaussian', 'blur_ksize': 5, 'canny_lo': 30, 'canny_hi': 90}


def make_grid(images, labels, cols=3, cell_w=240, cell_h=180):
    """같은 크기 칸에 맞춰 격자로 합친다 (라벨 포함)."""
    cells = []
    for im, lab in zip(images, labels):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        cell = cv.resize(im, (cell_w, cell_h), interpolation=cv.INTER_AREA)
        cv.putText(cell, lab, (5, 18), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv.LINE_AA)
        cells.append(cell)
    while len(cells) % cols:
        cells.append(np.zeros((cell_h, cell_w, 3), np.uint8))
    return np.vstack([np.hstack(cells[r:r + cols]) for r in range(0, len(cells), cols)])


def preprocess(img, cfg):
    """작업 해상도 → 흑백 → 블러(종류 선택)."""
    h, w = img.shape[:2]
    scale = cfg['work_width'] / w
    work = cv.resize(img, (cfg['work_width'], int(h * scale)), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    k = cfg['blur_ksize']
    if cfg['blur_type'] == 'median':
        blur = cv.medianBlur(gray, k)
    elif cfg['blur_type'] == 'bilateral':
        blur = cv.bilateralFilter(gray, 9, 75, 75)
    else:
        blur = cv.GaussianBlur(gray, (k, k), 0)
    return {'work': work, 'gray': gray, 'blur': blur, 'scale': scale}


img = cv.imread('stuff.jpg')
images, labels = [], []
for t in ['gaussian', 'median', 'bilateral']:
    pre = preprocess(img, dict(CONFIG, blur_type=t))
    edges = cv.Canny(pre['blur'], CONFIG['canny_lo'], CONFIG['canny_hi'])
    images.append(edges)
    labels.append(f'{t}: {cv.countNonZero(edges)} px')
cv.imshow('blur type compare', make_grid(images, labels))
`,
      },
      {
        title: '실습 3 · 원본 좌표로 되돌려 그리기',
        desc: `<p>아래 코드는 가로 240 작업 이미지에서 물체 상자를 찾은 뒤 <b>원본(640×480)</b> 위에 그립니다. 그런데 배율을 잊어서 상자가 왼쪽 위에 작게 몰려 있습니다.
<code>scale</code> 을 이용해 상자를 원본 좌표로 되돌려 물체 위치에 정확히 그려지게 고치세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WORK_WIDTH = 240
img = cv.imread('stuff.jpg')
h, w = img.shape[:2]
scale = WORK_WIDTH / w
work = cv.resize(img, (WORK_WIDTH, int(h * scale)), interpolation=cv.INTER_AREA)

gray = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (3, 3), 0)
edges = cv.dilate(cv.Canny(gray, 30, 90), np.ones((3, 3), np.uint8), iterations=2)
contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

out = img.copy()
for c in contours:
    if cv.contourArea(c) < 50:
        continue
    x, y, bw, bh = cv.boundingRect(c)          # 작업(240) 좌표
    # TODO: x, y, bw, bh 를 원본 좌표로 바꾸세요 (scale 로 나누고 int 로)
    cv.rectangle(out, (x, y), (x + bw, y + bh), (0, 0, 255), 2)

print('scale =', round(scale, 3), '/ 상자 수 =', len(contours))
cv.imshow('boxes on original', out)
`,
        hint: `<p>원본 좌표 = 작업 좌표 / scale 입니다. 그리기 함수는 정수만 받으므로 <code>int(x / scale)</code> 처럼 감싸세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WORK_WIDTH = 240
img = cv.imread('stuff.jpg')
h, w = img.shape[:2]
scale = WORK_WIDTH / w
work = cv.resize(img, (WORK_WIDTH, int(h * scale)), interpolation=cv.INTER_AREA)

gray = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (3, 3), 0)
edges = cv.dilate(cv.Canny(gray, 30, 90), np.ones((3, 3), np.uint8), iterations=2)
contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

out = img.copy()
for c in contours:
    if cv.contourArea(c) < 50:
        continue
    x, y, bw, bh = cv.boundingRect(c)
    x, y, bw, bh = int(x / scale), int(y / scale), int(bw / scale), int(bh / scale)   # 원본 좌표
    cv.rectangle(out, (x, y), (x + bw, y + bh), (0, 0, 255), 2)

print('scale =', round(scale, 3), '/ 상자 수 =', len(contours))
cv.imshow('boxes on original', out)
`,
      },
    ],
    quiz: [
      { q: '파라미터를 코드 곳곳에 숫자로 쓰지 않고 CONFIG 딕셔너리에 모으는 가장 큰 이유는?', options: ['실행 속도가 빨라진다', '튜닝할 때 한곳만 고치면 되고, 이름으로 의미를 알 수 있다', 'OpenCV 함수가 딕셔너리만 받는다', '메모리를 덜 쓴다'], answer: 1, explain: 'CONFIG 는 속도와는 무관합니다. 설정을 한곳에 이름과 함께 모아 두면 튜닝·실험·트랙바 연결이 쉬워집니다.' },
      { q: '세로 360, 가로 640 인 이미지 img 를 가로 320 으로 비율 유지하며 줄이는 올바른 코드는?', options: ['cv.resize(img, (180, 320))', 'cv.resize(img, (320, 180))', 'cv.resize(img, (360, 320))', 'img.shape = (180, 320, 3)'], answer: 1, explain: 'cv.resize 의 크기 인자는 (가로, 세로) 순서입니다. 배율 0.5 이므로 (320, 180) 입니다. img.shape 는 반대로 (세로, 가로, 채널)입니다.' },
      { q: '원본 640×480 을 work_width=480 으로 처리했습니다(scale=0.75). 작업 이미지에서 찾은 점 (120, 60) 의 원본 좌표는?', options: ['(90, 45)', '(120, 60)', '(160, 80)', '(240, 120)'], answer: 2, explain: '원본 좌표 = 작업 좌표 / scale = (120/0.75, 60/0.75) = (160, 80) 입니다.' },
      { q: 'stuff.jpg 처럼 한쪽이 그늘진 사진에서 전역 Otsu 이진화가 실패했습니다. 이 상황에서 가장 알맞은 판단은?', options: ['임계값을 255 로 올린다', '밝기 변화에 덜 민감한 Canny 엣지나 적응형 임계처리를 시험해 디버그 격자로 비교한다', '이미지를 더 크게 키운다', '컬러 이미지 그대로 findContours 를 호출한다'], answer: 1, explain: '전역 임계값 하나로는 고르지 않은 조명을 처리할 수 없습니다. 국소적인 방법(적응형 임계처리)이나 엣지 기반 방법을 시험하고, 여러 단계를 격자로 비교해 근거를 가지고 고릅니다.' },
    ],
  },
  // =====================================================================
  // w5-2 구현 ② 핵심 알고리즘과 디버그 뷰
  // =====================================================================
  {
    id: 'w5-2',
    summary: '검출(분할) 방법을 비교해 고르고, 컨투어를 면적·종횡비·solidity 로 걸러 물체마다 특징 dict 를 만든 뒤, 단계별 디버그 뷰와 결과 표로 확인하며 튜닝합니다.',
    goals: [
      '임계처리 · 적응형 임계처리 · Canny 중 입력에 맞는 분할 방법을 디버그 격자로 비교해 고를 수 있다',
      '면적 범위, 종횡비(minAreaRect), solidity, 원형도로 컨투어를 걸러낼 수 있다',
      '물체마다 위치·크기·모양·평균 HSV 색을 계산해 dict 리스트로 정리하고 표로 출력할 수 있다',
      '결과 이미지와 디버그 뷰를 만들고, “한 번에 하나씩” 원칙으로 파라미터를 튜닝할 수 있다',
    ],
    schedule: [['복습: 전처리 모듈', 3], ['개념: 분할 · 필터 · 특징', 12], ['예제 실습', 20], ['팀 코드에 적용', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 검출(detect) 단계: 물체와 배경 나누기</h3>
<p>전처리 다음은 <b>분할(Segmentation)</b> — 이미지에서 “물체 픽셀”과 “배경 픽셀”을 나눠 흰/검 <b>이진 마스크</b>를 만드는 단계입니다. 마스크가 좋아야 컨투어가 좋아지고, 컨투어가 좋아야 분석이 정확합니다.
2~3주차에 배운 방법 중 무엇을 쓸지는 <b>입력의 성질</b>로 정합니다.</p>` },
      { type: 'table', head: ['방법', '잘 되는 경우', '실패하는 경우', '팀 프로젝트 예'], rows: [
        ['<code>cv.threshold</code> + Otsu', '배경과 물체의 밝기 차가 뚜렷하고 조명이 고름', '그늘·조명 차이가 있음 (stuff.jpg 왼쪽)', '흰 종이 위 검은 도형, 스캔 문서'],
        ['<code>cv.adaptiveThreshold</code>', '조명이 고르지 않은 글자·선', '크고 속이 균일한 물체는 속이 비어 테두리만 남음', '문서, 스도쿠, 악보'],
        ['<code>cv.Canny</code> + 모폴로지 닫기', '배경이 단순하고 물체 윤곽이 뚜렷함', '배경 질감이 복잡하면 잡음 엣지가 많음', '책상 위 물건, 카드, 동전'],
        ['<code>cv.inRange</code> (HSV)', '물체 색이 정해져 있음', '비슷한 색 배경, 흰/검/회색 물체', '색 마커, 신호등, 과일'],
      ] },
      { type: 'code', title: '예제 1 · 분할 방법 세 가지 비교하기', code: String.raw`
import cv2 as cv
import numpy as np


def make_grid(images, labels, cols=3, cell_w=240, cell_h=180):
    """같은 크기 칸에 맞춰 격자로 합친다 (흑백/컬러 혼합 가능)."""
    cells = []
    for im, lab in zip(images, labels):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        cell = cv.resize(im, (cell_w, cell_h), interpolation=cv.INTER_AREA)
        cv.rectangle(cell, (0, 0), (cell_w, 20), (50, 50, 50), -1)
        cv.putText(cell, lab, (5, 15), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)
        cells.append(cell)
    while len(cells) % cols:
        cells.append(np.zeros((cell_h, cell_w, 3), np.uint8))
    return np.vstack([np.hstack(cells[r:r + cols]) for r in range(0, len(cells), cols)])


img = cv.imread('stuff.jpg')
work = cv.resize(img, (480, 360), interpolation=cv.INTER_AREA)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))

# 방법 A: Otsu 전역 이진화 (물체가 배경보다 어둡다고 가정 → INV)
_, mask_a = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
# 방법 B: 적응형 이진화 (주변 51×51 평균보다 10 이상 어두우면 물체)
mask_b = cv.adaptiveThreshold(blur, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 51, 10)
# 방법 C: Canny 엣지 → 닫기(끊긴 윤곽 잇기) → 팽창
edges = cv.Canny(blur, 30, 90)
mask_c = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, kernel, iterations=2), kernel)

images, labels = [], []
results = []
for name, mask in [('otsu', mask_a), ('adaptive', mask_b), ('canny+close', mask_c)]:
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    big = [c for c in contours if 300 <= cv.contourArea(c) <= 40000]   # 같은 면적 필터 적용
    vis = work.copy()
    cv.drawContours(vis, big, -1, (0, 255, 0), 2)
    images.append(mask)
    labels.append(f'{name} mask')
    results.append((vis, f'{name}: {len(big)} objects'))
    print(f'{name:12s} 전체 컨투어 {len(contours):3d}개 → 면적 필터 후 {len(big)}개')

images += [r[0] for r in results]
labels += [r[1] for r in results]
cv.imshow('segmentation compare', make_grid(images, labels, cols=3))
`, desc: '<p>윗줄은 마스크, 아랫줄은 면적 필터를 통과한 컨투어입니다. 정답은 5개(연필, 라이터, 동전, 공, 캡)입니다. Otsu 는 그늘진 책상을 물체로 잡고, 적응형은 흰 공의 테두리만 남기고 동전을 놓치지만, Canny+닫기는 다섯 물체의 윤곽을 모두 잡습니다. <b>이런 비교 이미지가 곧 발표 자료의 “왜 이 방법을 골랐나” 근거</b>가 됩니다.</p>' },
      { type: 'text', html: `
<h3>2. 컨투어 필터링 — 잡음 걸러내기</h3>
<p>분할 결과에는 잡음(작은 점, 긴 선, 그림자 조각)이 섞입니다. 3주차에 배운 <b>컨투어 속성</b>으로 “물체다운 것”만 남깁니다.</p>
<ul>
  <li><b>면적(area)</b> <code>cv.contourArea(c)</code> — 너무 작으면 잡음, 너무 크면 배경/그늘. 작업 해상도 기준 값이라는 점 기억!</li>
  <li><b>종횡비(aspect ratio)</b> — 기울어진 연필은 <code>boundingRect</code> 로는 정사각형에 가까우므로, <b>회전 사각형</b> <code>cv.minAreaRect(c)</code> 의 긴 변 / 짧은 변을 씁니다</li>
  <li><b>solidity</b> = 컨투어 면적 / 볼록 껍질(convex hull) 면적 — 1 에 가까울수록 꽉 찬 모양, 작으면 들쭉날쭉한 잡음</li>
  <li><b>원형도(circularity)</b> = 4π × 면적 / 둘레² — 원은 1, 정사각형은 약 0.785, 가늘고 긴 모양은 0 에 가까움</li>
</ul>
<p>걸러낸 컨투어도 <b>왜 버렸는지</b>를 보여 주면 튜닝이 훨씬 쉬워집니다. 아래 예제는 일부러 Canny 임계값을 낮춰(10/30) 잡음을 만든 뒤, 통과(초록)와 탈락(빨강 + 이유)을 함께 그립니다.</p>` },
      { type: 'code', title: '예제 2 · 필터 통과/탈락과 그 이유 표시하기', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'canny_lo': 10, 'canny_hi': 30,          # 일부러 낮춰서 잡음을 만든 설정
          'close_iter': 1,
          'min_area': 300, 'max_area': 40000,        # 작업 해상도(480) 기준 면적 범위
          'max_aspect': 25.0, 'min_solidity': 0.5}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def contour_features(c):
    """컨투어 하나의 기본 특징(면적, 종횡비, solidity, 원형도)을 계산한다."""
    area = cv.contourArea(c)
    (_, _), (rw, rh), _ = cv.minAreaRect(c)
    aspect = max(rw, rh) / max(1.0, min(rw, rh))
    hull_area = cv.contourArea(cv.convexHull(c))
    solidity = area / hull_area if hull_area > 0 else 0.0
    perimeter = cv.arcLength(c, True)
    circularity = 4 * np.pi * area / (perimeter ** 2) if perimeter > 0 else 0.0
    return area, aspect, solidity, circularity


def reject_reason(area, aspect, solidity, cfg):
    """필터를 통과하면 None, 탈락이면 이유 문자열을 돌려준다."""
    if area < cfg['min_area']:
        return 'small'
    if area > cfg['max_area']:
        return 'large'
    if aspect > cfg['max_aspect']:
        return 'thin'
    if solidity < cfg['min_solidity']:
        return 'ragged'
    return None


img = cv.imread('stuff.jpg')
work = cv.resize(img, (480, 360), interpolation=cv.INTER_AREA)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
edges = cv.Canny(blur, CONFIG['canny_lo'], CONFIG['canny_hi'])
mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=CONFIG['close_iter']), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

vis = work.copy()
kept = 0
print(f'{"no":>3s} {"area":>7s} {"aspect":>6s} {"solid":>5s} {"circ":>5s}  result')
for i, c in enumerate(contours):
    area, aspect, solidity, circ = contour_features(c)
    reason = reject_reason(area, aspect, solidity, CONFIG)
    x, y, w, h = cv.boundingRect(c)
    if reason is None:
        kept += 1
        cv.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
    else:
        cv.drawContours(vis, [c], -1, (0, 0, 255), 1)
        cv.putText(vis, reason, (x, y - 3), cv.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1, cv.LINE_AA)
    print(f'{i:3d} {area:7.0f} {aspect:6.1f} {solidity:5.2f} {circ:5.2f}  {reason or "KEEP"}')

print(f'컨투어 {len(contours)}개 중 {kept}개 통과')
cv.imshow('mask (canny 10/30)', mask)
cv.imshow('filter result', vis)
`, desc: '<p>임계값을 낮추면 동전 윤곽이 주변 잡음과 붙어 <code>ragged</code>(solidity 낮음)로 탈락하고, 엉뚱한 작은 조각이 통과하기도 합니다. 필터는 잡음을 줄여 주지만 <b>나쁜 마스크를 완전히 고쳐 주지는 못합니다</b> — 분할 단계 파라미터(예제 6)를 먼저 맞추세요.</p>' },
      { type: 'text', html: `
<h3>3. 물체마다 특징을 dict 로 — analyze() 단계</h3>
<p>통과한 컨투어마다 필요한 값을 계산해 <b>딕셔너리 하나</b>에 담고, 그것들을 <b>리스트</b>로 모읍니다. 이렇게 해 두면 표 출력, 정렬, 개수 세기, 차트(w5-6), 마우스 선택(w5-4)이 모두 쉬워집니다.</p>
<pre>objects = [
  {'id': 1, 'box': (x, y, w, h), 'area': 3858, 'aspect': 3.1, 'hsv': (141, 64, 130),
   'color': 'pink', 'shape': 'box', 'size': 'M', ...},
  ...
]</pre>
<ul>
  <li><b>물체 안쪽 평균 색</b>: 컨투어를 채운 마스크를 만들어 <code>cv.mean(hsv, mask=mask)</code>. 전체 크기 마스크 대신 <b>바운딩 박스 크기의 작은 마스크</b>를 쓰면 빠릅니다(<code>drawContours(..., offset=(-x, -y))</code>). 마스크를 살짝 침식(erode)하면 테두리의 배경색이 덜 섞입니다</li>
  <li><b>색 이름</b>: 먼저 명도 V 가 낮으면 dark, 채도 S 가 낮으면 white/gray, 나머지는 색상 H 구간으로 이름 붙이기</li>
  <li><b>모양</b>: 종횡비 ≥ 4 → long, 원형도 ≥ 0.75 → round, 나머지 → box</li>
  <li><b>크기</b>: 면적 구간으로 S / M / L (작업 해상도 기준)</li>
</ul>` },
      { type: 'code', title: '예제 3 · analyze(): 특징 dict 리스트와 결과 표', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'work_width': 480, 'blur_ksize': 5, 'canny_lo': 30, 'canny_hi': 90, 'close_iter': 2,
          'min_area': 300, 'max_area': 40000, 'max_aspect': 25.0, 'min_solidity': 0.5}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def preprocess(img, cfg):
    """작업 해상도 → 흑백 → 블러. dict 반환."""
    h, w = img.shape[:2]
    scale = cfg['work_width'] / w
    work = cv.resize(img, (cfg['work_width'], int(round(h * scale))), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    k = cfg['blur_ksize']
    return {'work': work, 'gray': gray, 'blur': cv.GaussianBlur(gray, (k, k), 0), 'scale': scale}


def detect(pre, cfg):
    """Canny → 닫기 → 팽창 → 바깥 컨투어. dict 반환."""
    edges = cv.Canny(pre['blur'], cfg['canny_lo'], cfg['canny_hi'])
    closed = cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=cfg['close_iter'])
    mask = cv.dilate(closed, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return {'edges': edges, 'mask': mask, 'contours': contours}


def color_name(h, s, v):
    """평균 HSV 를 간단한 색 이름으로 바꾼다 (OpenCV H 범위 0~179)."""
    if v < 90:
        return 'dark'
    if s < 40:
        return 'white' if v > 200 else 'gray'
    if h < 10 or h >= 160:
        return 'red'
    if h < 25:
        return 'orange'
    if h < 35:
        return 'yellow'
    if h < 85:
        return 'green'
    if h < 130:
        return 'blue'
    return 'pink'


def analyze(pre, det, cfg):
    """필터를 통과한 컨투어마다 특징 dict 를 만들어 리스트로 돌려준다."""
    hsv = cv.cvtColor(pre['work'], cv.COLOR_BGR2HSV)
    objects = []
    for c in det['contours']:
        area = cv.contourArea(c)
        if not (cfg['min_area'] <= area <= cfg['max_area']):
            continue
        (cx, cy), (rw, rh), _ = cv.minAreaRect(c)
        aspect = max(rw, rh) / max(1.0, min(rw, rh))
        hull_area = cv.contourArea(cv.convexHull(c))
        solidity = area / hull_area if hull_area > 0 else 0.0
        if aspect > cfg['max_aspect'] or solidity < cfg['min_solidity']:
            continue
        perimeter = cv.arcLength(c, True)
        circularity = 4 * np.pi * area / (perimeter ** 2) if perimeter > 0 else 0.0

        # 바운딩 박스 크기의 작은 마스크로 물체 안쪽 평균 HSV 구하기
        x, y, w, h = cv.boundingRect(c)
        m = np.zeros((h, w), np.uint8)
        cv.drawContours(m, [c], -1, 255, -1, offset=(-x, -y))
        m = cv.erode(m, KERNEL)                      # 테두리(배경) 픽셀 줄이기
        mh, ms, mv, _ = cv.mean(hsv[y:y + h, x:x + w], mask=m)

        objects.append({
            'id': len(objects) + 1, 'box': (x, y, w, h), 'center': (int(cx), int(cy)),
            'area': area, 'aspect': aspect, 'solidity': solidity, 'circularity': circularity,
            'hsv': (mh, ms, mv), 'color': color_name(mh, ms, mv),
            'shape': 'long' if aspect >= 4 else ('round' if circularity >= 0.75 else 'box'),
            'size': 'S' if area < 1500 else ('M' if area < 5000 else 'L'),
            'contour': c,
        })
    return objects


def print_table(objects):
    """물체 리스트를 표 형태로 출력한다."""
    print(f'{"id":>2s} {"area":>6s} {"aspect":>6s} {"solid":>5s} {"circ":>5s} {"H":>4s} {"S":>4s} {"V":>4s}  color  shape size')
    for o in objects:
        h, s, v = o['hsv']
        print(f'{o["id"]:2d} {o["area"]:6.0f} {o["aspect"]:6.1f} {o["solidity"]:5.2f} {o["circularity"]:5.2f} '
              f'{h:4.0f} {s:4.0f} {v:4.0f}  {o["color"]:6s} {o["shape"]:5s} {o["size"]}')


img = cv.imread('stuff.jpg')
pre = preprocess(img, CONFIG)
det = detect(pre, CONFIG)
objects = analyze(pre, det, CONFIG)
print_table(objects)

# 리스트라서 정렬·검색이 쉽다
biggest = max(objects, key=lambda o: o['area'])
print('가장 큰 물체:', biggest['id'], biggest['color'], biggest['shape'])

vis = pre['work'].copy()
for o in objects:
    x, y, w, h = o['box']
    cv.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(vis, str(o['id']), (x + 3, y + 18), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
cv.imshow('objects', vis)
`, desc: '<p>표를 보면 공은 <code>white round L</code>, 동전은 <code>gray round S</code>, 연필은 종횡비가 커서 <code>dark long</code>, 캡은 <code>dark round</code>, 라이터는 <code>pink box</code> 로 나옵니다. 숫자가 기준값 경계에 가까운 물체(예: 원형도 0.75 근처)는 조명이 바뀌면 분류가 흔들릴 수 있다는 것도 표에서 읽을 수 있습니다.</p>' },
      { type: 'code', title: '예제 4 · visualize(): 원본 위에 상자 · 번호 · 라벨 · 개수 표시', code: String.raw`
import cv2 as cv
import numpy as np
from collections import Counter

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
SHAPE_COLORS = {'round': (0, 200, 255), 'long': (255, 140, 0), 'box': (0, 220, 0)}   # BGR


def find_objects(img, work_width=480):
    """(간단 버전) 전처리~분석을 한 번에: 작업 해상도 물체 리스트와 scale 을 돌려준다."""
    h, w = img.shape[:2]
    s = work_width / w
    work = cv.resize(img, (work_width, int(round(h * s))), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = []
    for c in contours:
        area = cv.contourArea(c)
        if not 300 <= area <= 40000:
            continue
        (_, _), (rw, rh), _ = cv.minAreaRect(c)
        aspect = max(rw, rh) / max(1.0, min(rw, rh))
        perimeter = cv.arcLength(c, True)
        circ = 4 * np.pi * area / (perimeter ** 2)
        shape = 'long' if aspect >= 4 else ('round' if circ >= 0.75 else 'box')
        size = 'S' if area < 1500 else ('M' if area < 5000 else 'L')
        objects.append({'id': len(objects) + 1, 'box': cv.boundingRect(c), 'contour': c,
                        'shape': shape, 'size': size, 'area': area})
    return objects, s


def put_label(img, text, org, color, scale=0.5):
    """검은 테두리가 있는 글자 (어떤 배경에서도 잘 보임)."""
    cv.putText(img, text, org, cv.FONT_HERSHEY_SIMPLEX, scale, (0, 0, 0), 4, cv.LINE_AA)
    cv.putText(img, text, org, cv.FONT_HERSHEY_SIMPLEX, scale, color, 1, cv.LINE_AA)


def visualize(img, objects, scale):
    """원본 크기 이미지에 결과를 그린다. 작업 좌표는 scale 로 나눠 원본 좌표로 바꾼다."""
    out = img.copy()                                   # 원본 보존
    for o in objects:
        color = SHAPE_COLORS[o['shape']]
        x, y, w, h = [int(v / scale) for v in o['box']]
        contour = (o['contour'] / scale).astype(np.int32)   # 컨투어 좌표도 원본 크기로
        cv.drawContours(out, [contour], -1, color, 1)
        cv.rectangle(out, (x, y), (x + w, y + h), color, 2)
        ty = y - 6 if y - 6 > 45 else y + h + 18        # 위쪽 요약 막대에 가리면 상자 아래에 쓰기
        put_label(out, f'#{o["id"]} {o["shape"]} {o["size"]}', (x, ty), color)

    counts = Counter(o['shape'] for o in objects)      # 모양별 개수
    summary = f'objects: {len(objects)}  ' + '  '.join(f'{k}={v}' for k, v in sorted(counts.items()))
    cv.rectangle(out, (0, 0), (out.shape[1], 28), (40, 40, 40), -1)
    cv.putText(out, summary, (8, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv.LINE_AA)
    return out


img = cv.imread('stuff.jpg')
objects, scale = find_objects(img)
result = visualize(img, objects, scale)
print('scale =', round(scale, 3), '/ 물체 수 =', len(objects))
cv.imshow('result', result)
cv.imshow('original (unchanged)', img)
`, desc: '<p><code>visualize()</code> 는 원본을 복사해 그리므로 <code>original</code> 창은 깨끗합니다. 모양별로 색을 정해 두면 범례 없이도 결과를 빨리 읽을 수 있습니다. 글자에 검은 테두리를 두르면 밝은 공 위에서도 라벨이 잘 보입니다.</p>' },
      { type: 'text', html: `
<h3>4. 디버그 뷰 — 파이프라인을 “투명하게”</h3>
<p>결과가 이상할 때 가장 먼저 할 일은 <b>어느 단계에서 틀어졌는지</b> 찾는 것입니다. 전처리 → 엣지 → 마스크 → 컨투어 → 결과를 한 화면 격자로 보여 주는 <b>디버그 뷰</b>를 항상 켤 수 있게 만드세요.</p>
<ul>
  <li>칸 라벨에 <b>수치</b>를 함께 쓴다: <code>edges 1.5%</code>, <code>contours 5</code>, <code>kept 5</code></li>
  <li>필터 전(모든 컨투어)과 필터 후를 <b>나란히</b> 보여 준다</li>
  <li><code>detect()</code>, <code>preprocess()</code> 가 중간 결과를 dict 로 돌려주므로 디버그 뷰는 그것을 꺼내 모으기만 하면 된다</li>
  <li>발표 때 “파이프라인 단계” 슬라이드로 그대로 쓸 수 있다 (w5-6)</li>
</ul>` },
      { type: 'code', title: '예제 5 · 전체 파이프라인 + 단계별 디버그 뷰', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'work_width': 480, 'blur_ksize': 5, 'canny_lo': 30, 'canny_hi': 90, 'close_iter': 2,
          'min_area': 300, 'max_area': 40000}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def make_grid(images, labels, cols=3, cell_w=240, cell_h=180):
    """같은 크기 칸에 맞춰 격자로 합친다."""
    cells = []
    for im, lab in zip(images, labels):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        cell = cv.resize(im, (cell_w, cell_h), interpolation=cv.INTER_AREA)
        cv.rectangle(cell, (0, 0), (cell_w, 20), (50, 50, 50), -1)
        cv.putText(cell, lab, (5, 15), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)
        cells.append(cell)
    while len(cells) % cols:
        cells.append(np.zeros((cell_h, cell_w, 3), np.uint8))
    return np.vstack([np.hstack(cells[r:r + cols]) for r in range(0, len(cells), cols)])


def preprocess(img, cfg):
    h, w = img.shape[:2]
    scale = cfg['work_width'] / w
    work = cv.resize(img, (cfg['work_width'], int(round(h * scale))), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    k = cfg['blur_ksize']
    return {'work': work, 'gray': gray, 'blur': cv.GaussianBlur(gray, (k, k), 0), 'scale': scale}


def detect(pre, cfg):
    edges = cv.Canny(pre['blur'], cfg['canny_lo'], cfg['canny_hi'])
    closed = cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=cfg['close_iter'])
    mask = cv.dilate(closed, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    kept = [c for c in contours if cfg['min_area'] <= cv.contourArea(c) <= cfg['max_area']]
    return {'edges': edges, 'closed': closed, 'mask': mask, 'contours': contours, 'kept': kept}


def debug_view(pre, det):
    """각 단계를 수치 라벨과 함께 격자 한 장으로 만든다."""
    all_c = pre['work'].copy()
    cv.drawContours(all_c, det['contours'], -1, (0, 255, 255), 2)
    kept = pre['work'].copy()
    for c in det['kept']:
        x, y, w, h = cv.boundingRect(c)
        cv.rectangle(kept, (x, y), (x + w, y + h), (0, 255, 0), 2)
    edge_pct = 100.0 * cv.countNonZero(det['edges']) / det['edges'].size
    return make_grid(
        [pre['blur'], det['edges'], det['closed'], det['mask'], all_c, kept],
        ['1 blur', f'2 edges {edge_pct:.1f}%', '3 closed', '4 mask (dilate)',
         f'5 contours {len(det["contours"])}', f'6 kept {len(det["kept"])}'],
        cols=3)


img = cv.imread('stuff.jpg')
pre = preprocess(img, CONFIG)
det = detect(pre, CONFIG)
print('컨투어:', len(det['contours']), '→ 필터 후:', len(det['kept']))
cv.imshow('debug view', debug_view(pre, det))
`, desc: '<p>2번(엣지)에서 끊겨 있던 윤곽이 3번(닫기)에서 이어지고, 4번(팽창)에서 한 덩어리가 되는 과정이 보입니다. 팀 프로젝트에도 <code>debug_view()</code> 함수를 꼭 만드세요 — 문제를 찾는 시간이 크게 줄어듭니다.</p>' },
      { type: 'text', html: `
<h3>5. 튜닝 전략 — 한 번에 하나씩</h3>
<p>파라미터가 여러 개일 때 한꺼번에 바꾸면 무엇 때문에 좋아졌는지(나빠졌는지) 알 수 없습니다. 다음 순서를 지키세요.</p>
<ol>
  <li><b>기준 이미지 세트</b>를 정한다 (쉬운 것 1장, 어려운 것 2장 이상 + 정답 개수 메모)</li>
  <li><b>앞 단계부터</b> 맞춘다 — 전처리 → 분할 → 필터 → 분류 순서. 앞 단계가 틀리면 뒤에서 고칠 수 없다</li>
  <li>파라미터를 <b>하나만</b> 바꾸며 여러 값(예: 10, 20, 30, 60, 100)을 한꺼번에 비교한다 (스윕, sweep)</li>
  <li>결과를 <b>기록</b>한다 — “canny_lo=30: 5/5 정답, 60: 연필 끊김” (발표 자료가 됨)</li>
  <li>여러 이미지에서 모두 괜찮은 값을 고른다 — 한 장에서만 최고인 값은 피한다</li>
</ol>` },
      { type: 'table', head: ['증상', '의심되는 단계', '먼저 바꿔 볼 파라미터'], rows: [
        ['물체가 여러 조각으로 쪼개짐', '분할 / 모폴로지', 'canny_lo·hi 낮추기, close_iter 늘리기'],
        ['옆 물체끼리 하나로 붙음', '모폴로지', 'close_iter 줄이기, 팽창 커널 줄이기'],
        ['작은 잡음 상자가 많음', '분할 / 필터', 'blur_ksize 키우기, min_area 올리기'],
        ['작은 물체(동전)를 놓침', '필터 / 작업 해상도', 'min_area 내리기, work_width 키우기'],
        ['그늘·그림자가 물체로 잡힘', '분할 방법 자체', 'Otsu 대신 Canny/적응형, CLAHE'],
        ['분류(색·모양)가 틀림', '분석 기준값', '표로 실제 값을 보고 기준(90, 0.75, 4 …) 조정'],
      ] },
      { type: 'code', title: '예제 6 · 파라미터 스윕: canny_lo 만 바꿔 비교하기', code: String.raw`
import cv2 as cv
import numpy as np

BASE = {'work_width': 480, 'canny_lo': 30, 'close_iter': 2, 'min_area': 300, 'max_area': 40000}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
GROUND_TRUTH = 5          # stuff.jpg 의 실제 물체 수 (직접 세어 둔 정답)


def count_objects(img, cfg):
    """설정 cfg 로 물체를 찾아 (결과 이미지, 개수)를 돌려준다. canny_hi 는 lo 의 3배."""
    h, w = img.shape[:2]
    s = cfg['work_width'] / w
    work = cv.resize(img, (cfg['work_width'], int(h * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(blur, cfg['canny_lo'], cfg['canny_lo'] * 3)
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=cfg['close_iter']), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    kept = [c for c in contours if cfg['min_area'] <= cv.contourArea(c) <= cfg['max_area']]
    vis = work.copy()
    for c in kept:
        x, y, bw, bh = cv.boundingRect(c)
        cv.rectangle(vis, (x, y), (x + bw, y + bh), (0, 255, 0), 2)
    return vis, len(kept)


img = cv.imread('stuff.jpg')
cells = []
print('canny_lo  count  정답과 차이')
for lo in [5, 10, 30, 60, 100, 150]:
    cfg = dict(BASE, canny_lo=lo)                 # 한 파라미터만 바꾼 복사본
    vis, n = count_objects(img, cfg)
    ok = (n == GROUND_TRUTH)
    print(f'{lo:8d}  {n:5d}  {n - GROUND_TRUTH:+d} {"OK" if ok else ""}')
    cell = cv.resize(vis, (240, 180))
    cv.rectangle(cell, (0, 0), (240, 22), (0, 120, 0) if ok else (0, 0, 150), -1)
    cv.putText(cell, f'lo={lo} hi={lo * 3} n={n}', (5, 16), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)
    cells.append(cell)

grid = np.vstack([np.hstack(cells[0:3]), np.hstack(cells[3:6])])
cv.imshow('sweep canny_lo', grid)
`, desc: '<p>초록 제목 칸이 정답 개수와 일치한 설정입니다. 너무 낮으면 잡음이 붙어 물체가 합쳐지거나 늘고, 너무 높으면 흐린 윤곽(라이터, 동전)을 놓칩니다. 정답과 일치하는 구간의 <b>가운데 값</b>을 고르면 다른 이미지에서도 안정적인 경우가 많습니다.</p>' },
      { type: 'checklist', title: '핵심 알고리즘 · 디버그 뷰 점검 목록', items: [
        '분할 방법을 고른 근거(비교 격자 이미지)가 있다',
        '필터 기준(면적, 종횡비, solidity 등)이 CONFIG 에 있고 탈락 이유를 확인할 수 있다',
        '물체 정보가 dict 리스트로 정리되어 표로 출력된다',
        '결과 이미지는 원본 복사본에, 원본 좌표로 그린다',
        'debug_view() 로 모든 단계를 수치 라벨과 함께 한 화면에서 볼 수 있다',
        '파라미터를 한 번에 하나씩 바꾸고 결과를 기록했다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 규칙으로 물체 이름 추정하기',
        desc: `<p>예제 3 의 특징(색, 모양, 크기)을 이용해 <code>guess_name(o)</code> 가 <code>pencil</code>, <code>ball</code>, <code>coin</code>, <code>cap</code>, <code>lighter</code> 중 하나(모르면 <code>unknown</code>)를 돌려주도록 규칙을 완성하세요.
결과 창에 다섯 물체의 이름이 모두 맞게 표시되면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def color_name(h, s, v):
    if v < 90:
        return 'dark'
    if s < 40:
        return 'white' if v > 200 else 'gray'
    if h < 10 or h >= 160:
        return 'red'
    if h < 35:
        return 'yellow'
    if h < 130:
        return 'green/blue'
    return 'pink'


def find_objects(img):
    """stuff.jpg 용 분석: 특징 dict 리스트 (작업 해상도 480)."""
    work = cv.resize(img, (480, int(img.shape[0] * 480 / img.shape[1])), interpolation=cv.INTER_AREA)
    hsv = cv.cvtColor(work, cv.COLOR_BGR2HSV)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = []
    for c in contours:
        area = cv.contourArea(c)
        if not 300 <= area <= 40000:
            continue
        x, y, w, h = cv.boundingRect(c)
        (_, _), (rw, rh), _ = cv.minAreaRect(c)
        aspect = max(rw, rh) / max(1.0, min(rw, rh))
        circ = 4 * np.pi * area / (cv.arcLength(c, True) ** 2)
        m = np.zeros((h, w), np.uint8)
        cv.drawContours(m, [c], -1, 255, -1, offset=(-x, -y))
        mh, ms, mv, _ = cv.mean(hsv[y:y + h, x:x + w], mask=cv.erode(m, KERNEL))
        objects.append({'box': (x, y, w, h), 'area': area, 'color': color_name(mh, ms, mv),
                        'shape': 'long' if aspect >= 4 else ('round' if circ >= 0.75 else 'box'),
                        'size': 'S' if area < 1500 else ('M' if area < 5000 else 'L')})
    return work, objects


def guess_name(o):
    """특징 dict 로 물체 이름을 추정한다."""
    # TODO: 아래 예시처럼 규칙을 추가하세요
    #   long + dark  -> 'pencil'
    #   round + white -> 'ball'
    #   round + gray  -> 'coin'
    #   round + dark  -> 'cap'
    #   box + (pink 또는 red) -> 'lighter'
    return 'unknown'


work, objects = find_objects(cv.imread('stuff.jpg'))
out = work.copy()
for o in objects:
    x, y, w, h = o['box']
    name = guess_name(o)
    print(f'{o["color"]:6s} {o["shape"]:5s} {o["size"]} -> {name}')
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, name, (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
cv.imshow('names', out)
`,
        hint: `<p><code>if o['shape'] == 'long' and o['color'] == 'dark': return 'pencil'</code> 처럼 <code>if</code> 문을 차례로 쓰고, 마지막에 <code>return 'unknown'</code> 을 남겨 두세요. 여러 색 중 하나인지는 <code>o['color'] in ('pink', 'red')</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def color_name(h, s, v):
    if v < 90:
        return 'dark'
    if s < 40:
        return 'white' if v > 200 else 'gray'
    if h < 10 or h >= 160:
        return 'red'
    if h < 35:
        return 'yellow'
    if h < 130:
        return 'green/blue'
    return 'pink'


def find_objects(img):
    """stuff.jpg 용 분석: 특징 dict 리스트 (작업 해상도 480)."""
    work = cv.resize(img, (480, int(img.shape[0] * 480 / img.shape[1])), interpolation=cv.INTER_AREA)
    hsv = cv.cvtColor(work, cv.COLOR_BGR2HSV)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = []
    for c in contours:
        area = cv.contourArea(c)
        if not 300 <= area <= 40000:
            continue
        x, y, w, h = cv.boundingRect(c)
        (_, _), (rw, rh), _ = cv.minAreaRect(c)
        aspect = max(rw, rh) / max(1.0, min(rw, rh))
        circ = 4 * np.pi * area / (cv.arcLength(c, True) ** 2)
        m = np.zeros((h, w), np.uint8)
        cv.drawContours(m, [c], -1, 255, -1, offset=(-x, -y))
        mh, ms, mv, _ = cv.mean(hsv[y:y + h, x:x + w], mask=cv.erode(m, KERNEL))
        objects.append({'box': (x, y, w, h), 'area': area, 'color': color_name(mh, ms, mv),
                        'shape': 'long' if aspect >= 4 else ('round' if circ >= 0.75 else 'box'),
                        'size': 'S' if area < 1500 else ('M' if area < 5000 else 'L')})
    return work, objects


def guess_name(o):
    """특징 dict 로 물체 이름을 추정한다."""
    if o['shape'] == 'long' and o['color'] == 'dark':
        return 'pencil'
    if o['shape'] == 'round' and o['color'] == 'white':
        return 'ball'
    if o['shape'] == 'round' and o['color'] == 'gray':
        return 'coin'
    if o['shape'] == 'round' and o['color'] == 'dark':
        return 'cap'
    if o['shape'] == 'box' and o['color'] in ('pink', 'red'):
        return 'lighter'
    return 'unknown'


work, objects = find_objects(cv.imread('stuff.jpg'))
out = work.copy()
for o in objects:
    x, y, w, h = o['box']
    name = guess_name(o)
    print(f'{o["color"]:6s} {o["shape"]:5s} {o["size"]} -> {name}')
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, name, (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
cv.imshow('names', out)
`,
      },
      {
        title: '실습 2 · 색상별 개수 요약 패널',
        desc: `<p><code>collections.Counter</code> 로 <b>색 이름별 개수</b>를 세어, 결과 이미지 왼쪽 위 검은 패널에 한 줄에 하나씩 <code>dark: 2</code> 처럼 표시하세요. 전체 개수도 첫 줄에 <code>total: 5</code> 로 표시합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
from collections import Counter

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def color_name(h, s, v):
    if v < 90:
        return 'dark'
    if s < 40:
        return 'white' if v > 200 else 'gray'
    return 'red' if (h < 10 or h >= 160) else ('pink' if h >= 130 else 'color')


img = cv.imread('stuff.jpg')
work = cv.resize(img, (480, 360), interpolation=cv.INTER_AREA)
hsv = cv.cvtColor(work, cv.COLOR_BGR2HSV)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

colors = []
out = work.copy()
for c in contours:
    if not 300 <= cv.contourArea(c) <= 40000:
        continue
    x, y, w, h = cv.boundingRect(c)
    m = np.zeros((h, w), np.uint8)
    cv.drawContours(m, [c], -1, 255, -1, offset=(-x, -y))
    mh, ms, mv, _ = cv.mean(hsv[y:y + h, x:x + w], mask=cv.erode(m, KERNEL))
    name = color_name(mh, ms, mv)
    colors.append(name)
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, name, (x, y - 4), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

# TODO 1: Counter(colors) 로 색별 개수를 세세요
# TODO 2: 왼쪽 위에 검은 사각형 패널을 그리고, 'total: N' 과 '색: 개수' 줄들을 putText 로 쓰세요
print('colors:', colors)
cv.imshow('summary', out)
`,
        hint: `<p><code>counts = Counter(colors)</code> → <code>counts.items()</code> 로 (색, 개수)를 꺼냅니다. 줄 간격은 y 좌표를 <code>20 + 20 * i</code> 처럼 늘리세요. 패널 높이 = <code>25 + 20 * (색 종류 수 + 1)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
from collections import Counter

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def color_name(h, s, v):
    if v < 90:
        return 'dark'
    if s < 40:
        return 'white' if v > 200 else 'gray'
    return 'red' if (h < 10 or h >= 160) else ('pink' if h >= 130 else 'color')


img = cv.imread('stuff.jpg')
work = cv.resize(img, (480, 360), interpolation=cv.INTER_AREA)
hsv = cv.cvtColor(work, cv.COLOR_BGR2HSV)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

colors = []
out = work.copy()
for c in contours:
    if not 300 <= cv.contourArea(c) <= 40000:
        continue
    x, y, w, h = cv.boundingRect(c)
    m = np.zeros((h, w), np.uint8)
    cv.drawContours(m, [c], -1, 255, -1, offset=(-x, -y))
    mh, ms, mv, _ = cv.mean(hsv[y:y + h, x:x + w], mask=cv.erode(m, KERNEL))
    name = color_name(mh, ms, mv)
    colors.append(name)
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, name, (x, y - 4), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

counts = Counter(colors)
lines = [f'total: {len(colors)}'] + [f'{k}: {v}' for k, v in sorted(counts.items())]
cv.rectangle(out, (0, 0), (130, 10 + 20 * len(lines)), (0, 0, 0), -1)
for i, text in enumerate(lines):
    cv.putText(out, text, (8, 22 + 20 * i), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)
print('colors:', dict(counts))
cv.imshow('summary', out)
`,
      },
      {
        title: '실습 3 · 크기 순 정렬과 가장 큰/작은 물체 강조',
        desc: `<p>물체 리스트를 면적 순으로 <b>정렬</b>해 1위부터 번호를 다시 매기고, 가장 큰 물체는 빨간 굵은 상자에 <code>LARGEST</code>, 가장 작은 물체는 파란 상자에 <code>SMALLEST</code> 라고 표시하세요. 콘솔에는 순위표를 출력합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
img = cv.imread('stuff.jpg')
work = cv.resize(img, (480, 360), interpolation=cv.INTER_AREA)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

objects = [{'area': cv.contourArea(c), 'box': cv.boundingRect(c)} for c in contours
           if 300 <= cv.contourArea(c) <= 40000]

# TODO 1: objects 를 area 가 큰 순서로 정렬하세요 (sorted, key=..., reverse=True)
# TODO 2: 순위(rank)를 1부터 다시 매겨 각 dict 에 넣으세요
out = work.copy()
for i, o in enumerate(objects):
    x, y, w, h = o['box']
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 1)
    print(i + 1, round(o['area']))
# TODO 3: objects[0] 은 빨간 굵은 상자 + 'LARGEST', objects[-1] 은 파란 상자 + 'SMALLEST'
cv.imshow('ranking', out)
`,
        hint: `<p><code>objects = sorted(objects, key=lambda o: o['area'], reverse=True)</code>. 강조는 반복문이 끝난 뒤 <code>objects[0]</code>, <code>objects[-1]</code> 를 따로 그리면 됩니다(리스트가 비어 있지 않은지 먼저 확인).</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
img = cv.imread('stuff.jpg')
work = cv.resize(img, (480, 360), interpolation=cv.INTER_AREA)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

objects = [{'area': cv.contourArea(c), 'box': cv.boundingRect(c)} for c in contours
           if 300 <= cv.contourArea(c) <= 40000]

objects = sorted(objects, key=lambda o: o['area'], reverse=True)
out = work.copy()
print('rank   area')
for i, o in enumerate(objects):
    o['rank'] = i + 1
    x, y, w, h = o['box']
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 1)
    cv.putText(out, str(o['rank']), (x + 3, y + 16), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    print(f'{o["rank"]:4d} {o["area"]:6.0f}')

if objects:
    for o, color, text, thick in [(objects[0], (0, 0, 255), 'LARGEST', 3), (objects[-1], (255, 0, 0), 'SMALLEST', 2)]:
        x, y, w, h = o['box']
        cv.rectangle(out, (x, y), (x + w, y + h), color, thick)
        cv.putText(out, text, (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
cv.imshow('ranking', out)
`,
      },
    ],
    quiz: [
      { q: '비스듬히 놓인 연필의 “가늘고 긴 정도”를 재기에 가장 알맞은 것은?', options: ['cv.boundingRect 의 w / h', 'cv.minAreaRect 의 긴 변 / 짧은 변', 'cv.contourArea 값', 'cv.mean 의 V 값'], answer: 1, explain: 'boundingRect 는 축에 나란한 상자라 대각선으로 놓인 연필은 정사각형에 가깝게 나옵니다. 회전 사각형(minAreaRect)의 변 비율이 실제 종횡비입니다.' },
      { q: 'solidity(= 컨투어 면적 / 볼록 껍질 면적)가 0.4 로 낮게 나왔다면 그 컨투어는?', options: ['완전한 원이다', '들쭉날쭉하거나 속이 파인 모양일 가능성이 크다', '면적이 매우 크다', '색이 어둡다'], answer: 1, explain: '볼록 껍질에 비해 실제 면적이 작다는 뜻이므로 오목하게 파였거나 잡음이 붙은 불규칙한 모양입니다. 필터 기준으로 자주 씁니다.' },
      { q: '물체들의 특징을 dict 리스트로 정리했을 때 얻는 이점이 아닌 것은?', options: ['sorted 로 크기 순 정렬이 쉽다', 'Counter 로 종류별 개수를 쉽게 센다', '마우스로 클릭한 물체를 찾기 쉽다', 'Canny 엣지 검출이 더 정확해진다'], answer: 3, explain: '데이터 정리 방식은 검출 정확도와 무관합니다. 대신 정렬·집계·출력·선택·차트 같은 후처리가 쉬워집니다.' },
      { q: '결과가 이상해서 튜닝할 때 가장 좋은 방법은?', options: ['모든 파라미터를 동시에 크게 바꿔 본다', '마지막 단계(분류 기준)부터 고친다', '앞 단계부터, 한 번에 한 파라미터만 여러 값으로 비교하고 기록한다', '결과가 좋아 보이는 이미지 한 장에 맞춘다'], answer: 2, explain: '앞 단계 오류는 뒤에서 고칠 수 없고, 여러 값을 동시에 바꾸면 원인을 알 수 없습니다. 스윕과 기록, 여러 이미지 확인이 핵심입니다.' },
    ],
  },
  // =====================================================================
  // w5-3 구현 ③ 실시간 웹캠 적용
  // =====================================================================
  {
    id: 'w5-3',
    summary: '완성한 분석 파이프라인을 process(frame) 에 연결해 웹캠에서 실시간으로 돌리고, 단계별 시간을 재서 느린 곳을 찾아 최적화하며, 프레임 사이 상태로 결과 깜빡임을 줄입니다.',
    goals: [
      '분석 파이프라인을 process(frame) 에 연결하고, 무거운 준비 작업은 함수 밖에서 한 번만 할 수 있다',
      'time.perf_counter / cv.getTickCount 로 단계별 ms 와 FPS 를 재서 화면에 표시할 수 있다',
      '작업 해상도 축소, 프레임 건너뛰기, ROI, 벡터화로 처리 속도를 높일 수 있다',
      '전역 변수와 이동 평균으로 프레임 사이 상태를 유지해 개수 표시의 깜빡임을 줄일 수 있다',
    ],
    schedule: [['도입: 이미지 → 웹캠', 5], ['개념: process 구조 · 시간 측정', 10], ['예제 실습: 측정과 최적화', 20], ['팀 코드 실시간 적용', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 이미지에서 웹캠으로 — process(frame) 의 규칙</h3>
<p>웹 실습 환경에서는 <code>while True:</code> 루프 대신 <code>def process(frame):</code> 을 정의합니다. 입력 소스가 📷 웹캠이면 <b>매 프레임마다</b>, 이미지면 <b>한 번</b>(트랙바를 움직이면 다시) 호출되고, <code>return</code> 한 이미지가 <code>result</code> 창에 표시됩니다.</p>
<ul>
  <li><b>함수 밖(맨 위)</b>: import, CONFIG, 커널·CLAHE 객체 만들기, 트랙바 만들기처럼 <b>한 번만</b> 하면 되는 일</li>
  <li><b>함수 안</b>: 프레임마다 달라지는 처리만 — <code>preprocess → detect → analyze → visualize</code></li>
  <li><b>빠르게</b>: 1초에 15프레임 이상 보려면 한 프레임에 약 <b>66ms 이내</b>, 부드러우려면 30ms 이내</li>
  <li><b>print 금지(또는 최소화)</b>: 매 프레임 print 하면 콘솔이 넘치고 느려집니다 → 화면에 글자로 표시</li>
  <li>프레임 크기는 카메라마다 다릅니다(640×480, 1280×720 …) → w5-1 의 작업 해상도 처리가 여기서 빛을 발합니다</li>
</ul>
<p>오른쪽 패널에서 <b>입력 소스를 📷 웹캠으로 바꾸고</b> 흰 종이나 단색 책상 위에 물건 몇 개를 올려 시험해 보세요. 웹캠이 없으면 이미지 입력(stuff.jpg)으로도 똑같이 동작합니다.</p>
<p><b>🎞️ 동영상 입력도 활용하세요.</b> 입력 소스를 샘플 동영상(<code>cup.mp4</code>, <code>vtest.mp4</code>)이나 직접 찍어 업로드한 영상으로 바꾸면 process 가 영상의 프레임마다 호출됩니다. 웹캠은 매번 장면이 달라지지만 동영상은 <b>항상 같은 입력</b>이라, 파라미터를 바꾼 전후를 공정하게 비교하는 <b>재현 가능한 테스트</b>에 좋습니다. 웹캠이 없는 학생도 실시간 처리를 똑같이 연습할 수 있습니다(예제 7).</p>` },
      { type: 'code', title: '예제 1 · 책상 물건 분석기를 process(frame) 에 연결하기', code: String.raw`
import cv2 as cv
import numpy as np
from collections import Counter

# ----- 한 번만 하는 준비 (함수 밖) -----
CONFIG = {'work_width': 480, 'blur_ksize': 5, 'canny_lo': 30, 'canny_hi': 90, 'close_iter': 2,
          'min_area': 300, 'max_area': 40000, 'min_solidity': 0.5}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
SHAPE_COLORS = {'round': (0, 200, 255), 'long': (255, 140, 0), 'box': (0, 220, 0)}


def preprocess(img, cfg):
    h, w = img.shape[:2]
    scale = cfg['work_width'] / w
    work = cv.resize(img, (cfg['work_width'], int(round(h * scale))), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    k = cfg['blur_ksize']
    return {'work': work, 'blur': cv.GaussianBlur(gray, (k, k), 0), 'scale': scale}


def detect(pre, cfg):
    edges = cv.Canny(pre['blur'], cfg['canny_lo'], cfg['canny_hi'])
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=cfg['close_iter']), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return {'edges': edges, 'mask': mask, 'contours': contours}


def analyze(pre, det, cfg):
    objects = []
    for c in det['contours']:
        area = cv.contourArea(c)
        if not cfg['min_area'] <= area <= cfg['max_area']:
            continue
        hull_area = cv.contourArea(cv.convexHull(c))
        if hull_area == 0 or area / hull_area < cfg['min_solidity']:
            continue
        (_, _), (rw, rh), _ = cv.minAreaRect(c)
        aspect = max(rw, rh) / max(1.0, min(rw, rh))
        circ = 4 * np.pi * area / (cv.arcLength(c, True) ** 2)
        shape = 'long' if aspect >= 4 else ('round' if circ >= 0.75 else 'box')
        objects.append({'id': len(objects) + 1, 'box': cv.boundingRect(c), 'shape': shape, 'area': area})
    return objects


def visualize(img, pre, objects):
    out = img.copy()
    s = pre['scale']
    for o in objects:
        x, y, w, h = [int(v / s) for v in o['box']]
        color = SHAPE_COLORS[o['shape']]
        cv.rectangle(out, (x, y), (x + w, y + h), color, 2)
        cv.putText(out, f'#{o["id"]} {o["shape"]}', (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    counts = Counter(o['shape'] for o in objects)
    text = f'objects {len(objects)} | ' + ' '.join(f'{k}:{v}' for k, v in sorted(counts.items()))
    cv.rectangle(out, (0, 0), (out.shape[1], 26), (40, 40, 40), -1)
    cv.putText(out, text, (8, 19), cv.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv.LINE_AA)
    return out


# ----- 프레임마다 호출되는 함수 -----
def process(frame):
    pre = preprocess(frame, CONFIG)
    det = detect(pre, CONFIG)
    objects = analyze(pre, det, CONFIG)
    return visualize(frame, pre, objects)


print('준비 완료: 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸면 실시간으로 분석합니다.')
`, desc: '<p>코드 대부분은 w5-2 에서 만든 함수 그대로이고, 마지막 <code>process()</code> 가 네 함수를 순서대로 부를 뿐입니다. <b>모듈화를 해 두었기 때문에 실시간 적용이 이렇게 간단</b>해집니다. 웹캠에서는 배경이 복잡하면 잡음 상자가 늘어나니, 단색 배경을 쓰거나 w5-4 에서 트랙바로 튜닝하세요.</p>' },
      { type: 'text', html: `
<h3>2. 어디가 느릴까? — 단계별 시간 측정</h3>
<p>최적화의 첫 원칙은 <b>“추측하지 말고 측정하라”</b>입니다. 느린 단계를 찾아야 그 부분만 고칠 수 있습니다.</p>
<ul>
  <li><code>t0 = time.perf_counter()</code> … <code>ms = (time.perf_counter() - t0) * 1000</code> — 초 단위 실수, ×1000 으로 ms</li>
  <li>OpenCV 방식: <code>t0 = cv.getTickCount()</code> … <code>ms = (cv.getTickCount() - t0) / cv.getTickFrequency() * 1000</code> (1주차 성능 측정)</li>
  <li><b>처리 시간(ms)</b>: 내 코드가 한 프레임에 쓴 시간. <b>FPS</b>: 1초에 화면이 몇 번 바뀌는지 = 1000 / (이전 호출과의 간격 ms)</li>
  <li>측정값은 프레임마다 흔들리므로 <b>지수 이동 평균(EMA)</b> <code>avg = 0.9 × avg + 0.1 × 새값</code> 으로 부드럽게 표시</li>
</ul>
<p>한 번만 재면 첫 호출의 준비 시간 때문에 크게 나올 수 있습니다. 여러 번 반복한 평균이나 EMA 를 보세요.</p>` },
      { type: 'code', title: '예제 2 · 단계별 ms 막대와 FPS 오버레이', code: String.raw`
import cv2 as cv
import numpy as np
import time

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'last_time': None, 'fps': 0.0, 'ms': {}}     # 프레임 사이에 유지되는 값


def ema(old, new, alpha=0.1):
    """지수 이동 평균: 처음이면 새 값, 아니면 조금씩 따라가기."""
    return new if old is None else (1 - alpha) * old + alpha * new


def draw_timing(img, stage_ms, fps):
    """단계별 ms 를 막대그래프로, FPS 를 글자로 그린다 (1ms = 4px, 최대 150px)."""
    x0, y0 = 10, 40
    cv.rectangle(img, (0, 0), (300, y0 + 22 * len(stage_ms) + 10), (30, 30, 30), -1)
    total = sum(stage_ms.values())
    cv.putText(img, f'FPS {fps:4.1f}  total {total:5.1f} ms', (x0, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    for i, (name, ms) in enumerate(stage_ms.items()):
        y = y0 + 22 * i
        cv.putText(img, f'{name:9s}{ms:5.1f}', (x0, y + 14), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        bar = int(min(ms * 4, 150))                   # 1ms = 4px 로 확대해 표시
        color = (0, 200, 0) if ms < 10 else ((0, 200, 255) if ms < 30 else (0, 0, 255))
        cv.rectangle(img, (130, y + 3), (130 + bar, y + 16), color, -1)


def process(frame):
    now = time.perf_counter()
    if STATE['last_time'] is not None:                # 이전 호출과의 간격 → FPS
        interval = now - STATE['last_time']
        STATE['fps'] = ema(STATE['fps'] or None, 1.0 / max(interval, 1e-6))
    STATE['last_time'] = now

    ms = {}
    t = time.perf_counter()
    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    ms['prepro'] = (time.perf_counter() - t) * 1000

    t = time.perf_counter()
    edges = cv.Canny(blur, 30, 90)
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    ms['detect'] = (time.perf_counter() - t) * 1000

    t = cv.getTickCount()                              # OpenCV 방식으로도 재 보기
    boxes = [cv.boundingRect(c) for c in contours if 300 <= cv.contourArea(c) <= 40000]
    ms['analyze'] = (cv.getTickCount() - t) / cv.getTickFrequency() * 1000

    t = time.perf_counter()
    out = frame.copy()
    s = 480 / frame.shape[1]
    for x, y, w, h in boxes:
        cv.rectangle(out, (int(x / s), int(y / s)), (int((x + w) / s), int((y + h) / s)), (0, 255, 0), 2)
    ms['draw'] = (time.perf_counter() - t) * 1000

    for k, v in ms.items():                            # 단계별 시간도 EMA 로 부드럽게
        STATE['ms'][k] = ema(STATE['ms'].get(k), v, 0.2)
    draw_timing(out, STATE['ms'], STATE['fps'])
    return out


# 이미지 입력일 때 확인용: 첫 호출(준비 시간 포함)은 버리고 5번 더 돌려 평균 시간 출력
img = cv.imread('stuff.jpg')
process(img)
STATE['ms'] = {}
for i in range(5):
    process(img)
print('단계별 평균 ms:', {k: round(v, 2) for k, v in STATE['ms'].items()})
print('📷 웹캠으로 바꾸면 FPS 와 막대가 실시간으로 바뀝니다.')
`, desc: '<p>막대 색은 10ms 미만 초록, 30ms 미만 주황, 그 이상 빨강입니다. 이미지 입력일 때는 process 가 한 번만 호출되므로 FPS 가 0 으로 보이고, 웹캠에서 실제 값이 나옵니다. 브라우저(WebAssembly) 환경은 PC 의 파이썬보다 몇 배 느리므로 <b>웹에서 재 본 숫자를 기준</b>으로 판단하세요.</p>' },
      { type: 'code', title: '예제 3 · 작업 해상도에 따른 속도와 정확도 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time
from matplotlib import pyplot as plt

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def count_objects(img, work_width):
    """작업 해상도 work_width 로 물체 수를 센다. 면적 기준은 해상도에 맞춰 자동 조정."""
    h, w = img.shape[:2]
    s = work_width / w
    work = cv.resize(img, (work_width, int(h * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    k = (work_width / 480) ** 2                    # 면적은 해상도의 제곱에 비례
    return sum(1 for c in contours if 300 * k <= cv.contourArea(c) <= 40000 * k)


img = cv.imread('stuff.jpg')
widths = [640, 480, 320, 240, 160]
times, counts = [], []
REPEAT = 5   # 브라우저에서는 느리므로 반복 횟수를 작게
for ww in widths:
    count_objects(img, ww)                         # 첫 호출(준비 시간)은 측정에서 제외
    t0 = time.perf_counter()
    for _ in range(REPEAT):
        n = count_objects(img, ww)
    ms = (time.perf_counter() - t0) / REPEAT * 1000
    times.append(ms)
    counts.append(n)
    print(f'work_width={ww:3d}  {ms:6.2f} ms  objects={n}  (정답 5)')

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.2))
ax1.bar([str(w) for w in widths], times, color='tab:blue')
ax1.set_title('Time per frame (ms)')
ax1.set_xlabel('work width (px)')
ax2.plot([str(w) for w in widths], counts, 'o-', color='tab:orange', label='detected')
ax2.axhline(5, color='gray', linestyle='--', label='ground truth')
ax2.set_title('Detected objects')
ax2.set_xlabel('work width (px)')
ax2.set_ylim(0, 8)
ax2.legend()
plt.tight_layout()
plt.show()
`, desc: '<p>해상도를 줄이면 픽셀 수가 제곱으로 줄어 대체로 빨라지지만, 너무 작으면 가는 연필이나 작은 동전의 윤곽이 뭉개져 개수가 틀리기 시작합니다. <b>정답을 유지하는 가장 작은 해상도</b>가 좋은 선택입니다. 팀 프로젝트에서도 이 그래프를 만들어 발표에 쓰세요.</p>' },
      { type: 'text', html: `
<h3>3. 최적화 기법 모음</h3>
<p>측정으로 느린 곳을 찾았다면, 효과가 큰 것부터 적용합니다.</p>` },
      { type: 'table', head: ['기법', '방법', '효과 · 주의'], rows: [
        ['작업 해상도 축소', '<code>cv.resize</code> 로 줄여 처리 → 좌표만 <code>/ scale</code> 로 원본에', '가장 효과 큼. 너무 줄이면 작은 물체 손실 (예제 3)'],
        ['무거운 단계 건너뛰기', '분석은 N 프레임마다, 나머지 프레임은 이전 결과를 다시 그림', '체감 속도 크게 향상. 빠르게 움직이는 물체는 상자가 늦게 따라옴'],
        ['ROI 처리', '관심 영역만 잘라서 처리 <code>frame[y1:y2, x1:x2]</code>, 좌표에 오프셋 더하기', '영역 밖은 못 찾음. 영역을 화면에 표시해 사용자에게 알리기'],
        ['파이썬 반복문 피하기', '픽셀 단위 for 문 대신 <code>cv.mean</code>, <code>cv.threshold</code>, NumPy 연산', '수십~수천 배 빨라짐 (예제 4)'],
        ['객체는 한 번만 생성', '커널, CLAHE, 룩업 테이블을 전역에서 미리 만들기', '작은 이득이지만 공짜'],
        ['불필요한 작업 줄이기', '같은 <code>cvtColor</code> 두 번 하지 않기, 쓰지 않는 <code>copy()</code> 제거, 디버그 뷰는 필요할 때만', '디버그 격자는 생각보다 무거움'],
        ['가벼운 필터 선택', '양방향 필터·큰 medianBlur 대신 GaussianBlur, 작은 커널', '결과 품질과 속도의 균형을 비교해서 결정'],
      ] },
      { type: 'code', title: '예제 4 · 느린 코드 vs 빠른 코드 직접 재 보기', code: String.raw`
import cv2 as cv
import numpy as np
import time

img = cv.imread('stuff.jpg')
roi = img[100:160, 100:180]                  # 작은 영역(60×80)만 사용 — 파이썬 반복문은 매우 느리므로


def timeit(fn, repeat=3):
    """fn 을 repeat 번 실행한 평균 시간(ms)과 마지막 결과를 돌려준다."""
    t0 = time.perf_counter()
    for _ in range(repeat):
        result = fn()
    return (time.perf_counter() - t0) / repeat * 1000, result


# ① 평균 색: 파이썬 이중 for 문 vs cv.mean
def mean_loop():
    total = [0, 0, 0]
    for y in range(roi.shape[0]):
        for x in range(roi.shape[1]):
            b, g, r = roi[y, x]
            total[0] += int(b); total[1] += int(g); total[2] += int(r)
    n = roi.shape[0] * roi.shape[1]
    return [round(v / n, 1) for v in total]


ms_loop, r1 = timeit(mean_loop)
ms_cv, r2 = timeit(lambda: [round(v, 1) for v in cv.mean(roi)[:3]])
print(f'① 평균 색   loop {ms_loop:8.3f} ms {r1} | cv.mean {ms_cv:6.3f} ms {r2} | {ms_loop / max(ms_cv, 1e-6):6.0f}배')

# ② 이진화: 파이썬 for 문 vs NumPy 비교 연산 vs cv.threshold
gray = cv.cvtColor(roi, cv.COLOR_BGR2GRAY)


def thresh_loop():
    out = np.zeros_like(gray)
    for y in range(gray.shape[0]):
        for x in range(gray.shape[1]):
            out[y, x] = 255 if gray[y, x] > 128 else 0
    return out


ms_loop, a = timeit(thresh_loop)
ms_np, b = timeit(lambda: ((gray > 128) * 255).astype(np.uint8))
ms_cv, c = timeit(lambda: cv.threshold(gray, 128, 255, cv.THRESH_BINARY)[1])
print(f'② 이진화    loop {ms_loop:8.3f} ms | numpy {ms_np:6.3f} ms | cv.threshold {ms_cv:6.3f} ms | 결과 같음: {np.array_equal(a, c)}')

# ③ 커널: 매번 만들기 vs 한 번 만들어 재사용
small = cv.resize(img, (480, 360))
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
ms_new, _ = timeit(lambda: cv.dilate(small, cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))), 20)
ms_reuse, _ = timeit(lambda: cv.dilate(small, KERNEL), 20)
print(f'③ 커널      매번 생성 {ms_new:6.3f} ms | 재사용 {ms_reuse:6.3f} ms (차이는 작지만 공짜 이득)')

# ④ 해상도: 640×480 vs 320×240 에서 GaussianBlur 15×15
big = cv.resize(img, (640, 480))
half = cv.resize(img, (320, 240))
ms_big, _ = timeit(lambda: cv.GaussianBlur(big, (15, 15), 0), 10)
ms_half, _ = timeit(lambda: cv.GaussianBlur(half, (15, 15), 0), 10)
print(f'④ 해상도    640x480 {ms_big:6.3f} ms | 320x240 {ms_half:6.3f} ms | 약 {ms_big / max(ms_half, 1e-6):.1f}배')

cv.imshow('roi used for test', cv.resize(roi, None, fx=3, fy=3, interpolation=cv.INTER_NEAREST))
`, desc: '<p>80×60 = 4,800 픽셀짜리 작은 영역인데도 파이썬 반복문은 OpenCV 함수보다 수백 배 이상 느립니다. 640×480(약 30만 픽셀)이라면 한 프레임에 몇 초가 걸립니다. <b>픽셀 반복문이 보이면 OpenCV/NumPy 함수로 바꿀 수 있는지 먼저 찾아보세요.</b></p>' },
      { type: 'code', title: '예제 5 · N 프레임마다 분석하기 + ROI 로 영역 제한', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {
    'every_n': 3,                        # 분석은 3 프레임에 한 번
    'roi': (0.1, 0.15, 0.9, 0.95),       # 관심 영역: (x1, y1, x2, y2) 를 화면 비율로
    'work_width': 360,
}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'frame_no': 0, 'boxes': [], 'analyzed': 0}   # 프레임 사이에 유지할 상태


def find_boxes(img, work_width):
    """img 안에서 물체 상자들을 img 좌표로 돌려준다 (내부는 작업 해상도에서 처리)."""
    h, w = img.shape[:2]
    s = work_width / w
    work = cv.resize(img, (work_width, max(1, int(h * s))), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    k = (work_width / 480) ** 2
    boxes = []
    for c in contours:
        if 300 * k <= cv.contourArea(c) <= 40000 * k:
            x, y, bw, bh = cv.boundingRect(c)
            boxes.append((int(x / s), int(y / s), int(bw / s), int(bh / s)))
    return boxes


def process(frame):
    H, W = frame.shape[:2]
    rx1, ry1, rx2, ry2 = CONFIG['roi']
    x1, y1, x2, y2 = int(rx1 * W), int(ry1 * H), int(rx2 * W), int(ry2 * H)

    # N 프레임마다 한 번만 무거운 분석을 하고, 나머지는 이전 결과 재사용
    if STATE['frame_no'] % CONFIG['every_n'] == 0:
        roi = frame[y1:y2, x1:x2]                               # 관심 영역만 잘라 처리
        boxes = find_boxes(roi, CONFIG['work_width'])
        STATE['boxes'] = [(x + x1, y + y1, w, h) for x, y, w, h in boxes]   # ROI 좌표 → 프레임 좌표
        STATE['analyzed'] += 1
    STATE['frame_no'] += 1

    out = frame.copy()
    cv.rectangle(out, (x1, y1), (x2, y2), (255, 255, 0), 1)     # ROI 경계 표시
    for x, y, w, h in STATE['boxes']:
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    info = f'frame {STATE["frame_no"]}  analyzed {STATE["analyzed"]}  objects {len(STATE["boxes"])}'
    cv.putText(out, info, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return out


# 이미지 입력 확인용: 6 프레임을 흉내 내면 분석은 2번만 일어난다
img = cv.imread('stuff.jpg')
for i in range(6):
    result = process(img)
print('6 프레임 처리, 실제 분석 횟수:', STATE['analyzed'])
STATE.update(frame_no=0, analyzed=0)      # 실제 실행을 위해 상태 초기화
cv.imshow('preview', result)
`, desc: '<p><code>STATE</code> 딕셔너리는 함수 밖에 있으므로 process 호출이 끝나도 값이 남습니다(딕셔너리 안의 값을 바꾸는 것이라 <code>global</code> 선언도 필요 없음). ROI 에서 찾은 좌표에는 반드시 ROI 시작점 <code>(x1, y1)</code> 을 더해야 전체 화면의 올바른 위치에 그려집니다.</p>' },
      { type: 'text', html: `
<h3>4. 프레임 사이의 상태 — 깜빡임 줄이기</h3>
<p>웹캠 영상은 프레임마다 잡음과 조명이 조금씩 달라서, 물체 수가 <code>5, 6, 5, 4, 5 …</code> 처럼 흔들립니다. 숫자가 깜빡이면 사용자는 결과를 믿기 어렵습니다.</p>
<ul>
  <li><b>전역 상태</b>: 함수 밖에 변수를 두고 process 안에서 갱신. 숫자·문자열 변수를 다시 대입하려면 <code>global 변수명</code> 선언 필요, 리스트·딕셔너리의 내용만 바꾸면 선언 불필요</li>
  <li><b>이동 평균(moving average)</b>: 최근 N 개 값의 평균. <code>collections.deque(maxlen=N)</code> 에 넣으면 오래된 값이 자동으로 빠짐</li>
  <li><b>중앙값(median)</b>: 가끔 튀는 값(4 → 8)에 더 강함. 개수처럼 정수인 값에 잘 맞음</li>
  <li><b>EMA</b>: <code>avg = (1-α)·avg + α·new</code>. α 가 작을수록 부드럽지만 변화에 늦게 반응</li>
</ul>
<p>안정화는 <b>반응 속도와의 교환</b>입니다. 물체를 치웠는데 1초 뒤에야 숫자가 바뀌면 답답하므로, 창 크기 N 은 5~15 프레임 정도에서 시험해 고르세요.</p>` },
      { type: 'code', title: '예제 6 · 개수 흔들림 줄이기: 이동 평균 · 중앙값', code: String.raw`
import cv2 as cv
import numpy as np
from collections import deque
from matplotlib import pyplot as plt

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
HISTORY = deque(maxlen=9)            # 최근 9 프레임의 개수만 기억


def count_objects(frame):
    """프레임에서 물체 수를 센다 (작업 해상도 480)."""
    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return sum(1 for c in contours if 300 <= cv.contourArea(c) <= 40000)


def smoothed_count(n):
    """새 개수를 기록하고 (이동 평균, 중앙값)을 돌려준다."""
    HISTORY.append(n)
    return float(np.mean(HISTORY)), int(np.median(HISTORY))


def process(frame):
    n = count_objects(frame)
    avg, med = smoothed_count(n)
    out = frame.copy()
    cv.rectangle(out, (0, 0), (330, 70), (30, 30, 30), -1)
    cv.putText(out, f'raw count     : {n}', (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv.putText(out, f'stable (median): {med}  avg {avg:.1f}', (10, 55), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    return out


# --- 웹캠 없이 확인: 잡음을 섞은 가짜 프레임 40장으로 흔들림 흉내 ---
img = cv.imread('stuff.jpg')
rng = np.random.default_rng(2)
raws, avgs, meds = [], [], []
for i in range(40):
    noise = rng.normal(0, 28, img.shape)                      # 강한 카메라 잡음 흉내
    fake = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    n = count_objects(fake)
    avg, med = smoothed_count(n)
    raws.append(n); avgs.append(avg); meds.append(med)
HISTORY.clear()                                               # 실제 실행을 위해 기록 비우기

print('raw   :', raws)
print('median:', meds)
plt.figure(figsize=(8, 3))
plt.plot(raws, 'o-', color='lightcoral', label='raw')
plt.plot(avgs, '-', color='tab:blue', label='moving avg (9)')
plt.plot(meds, 's-', color='tab:green', label='median (9)', markersize=3)
plt.axhline(5, color='gray', linestyle='--', label='ground truth')
plt.xlabel('frame')
plt.ylabel('object count')
plt.title('Stabilizing the count')
plt.legend(loc='upper right')
plt.tight_layout()
plt.show()
`, desc: '<p>빨간 점(raw)은 잡음 때문에 4~7 사이를 오가지만, 초록(중앙값)은 대부분 5 에 머뭅니다. 웹캠 모드에서는 화면의 두 숫자를 비교해 보세요. 같은 원리로 <b>상자 위치</b>나 <b>측정값</b>도 EMA 로 부드럽게 만들 수 있습니다.</p>' },
      { type: 'code', title: '예제 7 · 동영상으로 재현 가능한 실시간 테스트', code: String.raw`
import cv2 as cv
import numpy as np
import time

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'frames': 0, 'ms': 0.0}

# 동영상을 열면 오른쪽 패널의 입력 소스가 이 영상으로 바뀐다 (웹캠이 없어도 OK)
cap = cv.VideoCapture('cup.mp4')
print('열림:', cap.isOpened())
print('크기: %d x %d, FPS: %.1f, 전체 프레임: %d' % (cap.get(cv.CAP_PROP_FRAME_WIDTH), cap.get(cv.CAP_PROP_FRAME_HEIGHT),
                                               cap.get(cv.CAP_PROP_FPS), cap.get(cv.CAP_PROP_FRAME_COUNT)))


def find_boxes(frame):
    s = 480 / frame.shape[1]
    work = cv.resize(frame, (480, int(frame.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [tuple(int(v / s) for v in cv.boundingRect(c)) for c in contours if cv.contourArea(c) >= 300]


def process(frame):
    t0 = time.perf_counter()
    boxes = find_boxes(frame)
    out = frame.copy()
    for x, y, w, h in boxes:
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    ms = (time.perf_counter() - t0) * 1000
    STATE['frames'] += 1
    STATE['ms'] = ms if STATE['frames'] == 1 else 0.9 * STATE['ms'] + 0.1 * ms
    cv.putText(out, f'frame {STATE["frames"]}  objects {len(boxes)}  {STATE["ms"]:.1f} ms', (10, 30),
               cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return out


ok, first = cap.read()                       # 현재 프레임 1장 (반복해서 읽지 않기!)
if ok:
    cv.imshow('first frame test', process(first))
    STATE.update(frames=0, ms=0.0)           # 시험 호출 기록 지우기
`, desc: '<p>실행하면 입력 소스가 <code>cup.mp4</code> 로 바뀌고 재생되는 프레임마다 process 가 호출됩니다. 손과 컵이 붙어 하나의 상자가 되는 장면, 컵이 기울어질 때 상자가 커지는 장면처럼 <b>문제가 생기는 구간을 영상의 같은 위치에서 반복해서 확인</b>할 수 있습니다. 재생 막대로 그 구간에 멈춰 두고 파라미터를 바꿔 보세요. 팀 주제에 맞는 짧은 영상을 직접 찍어 업로드해 두면 발표 리허설에도 쓸 수 있습니다.</p>' },
      { type: 'warn', html: `<p><b>상태 초기화 주의</b>: 코드를 다시 ▶ 실행하면 전역 변수가 새로 만들어지지만, 한 번의 실행 안에서 이미지로 “시험 호출”을 했다면 예제 5·6 처럼 끝에서 상태를 비워 두세요. 그렇지 않으면 시험용 기록이 웹캠 결과에 섞입니다.</p>` },
      { type: 'checklist', title: '실시간 적용 점검 목록', items: [
        'process(frame) 안에서는 프레임마다 필요한 일만 하고, 커널·설정·트랙바는 함수 밖에서 만든다',
        'process 안에 while 문, 매 프레임 print, 파이썬 픽셀 반복문이 없다',
        '단계별 ms 와 FPS 를 화면에 표시해 가장 느린 단계를 알고 있다',
        '작업 해상도를 바꿔 가며 속도와 정확도를 비교하고 값을 골랐다',
        '개수·위치 표시가 깜빡이지 않도록 이동 평균/중앙값/EMA 를 적용했다',
        '웹캠이 없을 때도 이미지 입력으로 오류 없이 동작한다',
        '같은 동영상(샘플 또는 직접 찍은 영상)으로 파라미터 변경 전후를 비교해 보았다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 내 파이프라인에 FPS · ms 표시 달기',
        desc: `<p>아래 process 는 결과만 그립니다. <code>time.perf_counter()</code> 로 ① 처리 시간(ms)과 ② 이전 호출과의 간격으로 구한 FPS 를 재서, 결과 왼쪽 위에 <code>12.3 ms | 25.0 FPS</code> 형태로 표시하세요. FPS 는 EMA(α=0.1)로 부드럽게 만듭니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
# TODO 1: 이전 호출 시각과 FPS 를 기억할 딕셔너리 STATE 를 만드세요 (예: {'last': None, 'fps': 0.0})


def process(frame):
    # TODO 2: 처리 시작 시각 t0 기록
    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    for c in contours:
        if 300 <= cv.contourArea(c) <= 40000:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(work, (x, y), (x + w, y + h), (0, 255, 0), 2)
    # TODO 3: 처리 시간(ms) 계산, 이전 호출과의 간격으로 FPS 계산(EMA), putText 로 표시
    return work


print('웹캠으로 바꾸면 FPS 가 표시됩니다.')
`,
        hint: `<p>함수 첫 줄에서 <code>now = time.perf_counter()</code> 를 재고, <code>STATE['last']</code> 가 None 이 아니면 <code>fps = 1 / (now - STATE['last'])</code>. EMA 는 <code>STATE['fps'] = 0.9 * STATE['fps'] + 0.1 * fps</code>. 처리 시간은 마지막에 <code>(time.perf_counter() - now) * 1000</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'last': None, 'fps': 0.0}


def process(frame):
    now = time.perf_counter()
    if STATE['last'] is not None:
        fps = 1.0 / max(now - STATE['last'], 1e-6)
        STATE['fps'] = fps if STATE['fps'] == 0 else 0.9 * STATE['fps'] + 0.1 * fps
    STATE['last'] = now

    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    for c in contours:
        if 300 <= cv.contourArea(c) <= 40000:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(work, (x, y), (x + w, y + h), (0, 255, 0), 2)

    ms = (time.perf_counter() - now) * 1000
    cv.rectangle(work, (0, 0), (230, 30), (0, 0, 0), -1)
    cv.putText(work, f'{ms:5.1f} ms | {STATE["fps"]:4.1f} FPS', (8, 21), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return work


print('웹캠으로 바꾸면 FPS 가 표시됩니다.')
`,
      },
      {
        title: '실습 2 · 무거운 분석은 N 프레임마다만',
        desc: `<p>매 프레임 분석하는 process 를 고쳐, <code>EVERY_N</code> 프레임에 한 번만 컨투어 분석을 하고 나머지 프레임은 저장해 둔 상자만 다시 그리게 하세요. 화면에 <code>frame 7 (analyzed)</code> 또는 <code>frame 8 (reused)</code> 를 표시합니다. 아래 확인 코드에서 분석 횟수가 6 프레임 중 2 번이 되면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

EVERY_N = 3
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'frame_no': 0, 'boxes': [], 'analyzed': 0}


def find_boxes(frame):
    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    s = 480 / frame.shape[1]
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [tuple(int(v / s) for v in cv.boundingRect(c)) for c in contours if 300 <= cv.contourArea(c) <= 40000]


def process(frame):
    # TODO 1: STATE['frame_no'] % EVERY_N == 0 일 때만 분석하고 STATE['analyzed'] 를 1 늘리세요
    STATE['boxes'] = find_boxes(frame)
    STATE['analyzed'] += 1
    # TODO 2: frame_no 를 1 늘리고, 화면에 analyzed / reused 상태를 표시하세요
    out = frame.copy()
    for x, y, w, h in STATE['boxes']:
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    return out


img = cv.imread('stuff.jpg')
for i in range(6):
    process(img)
print('6 프레임 중 분석 횟수:', STATE['analyzed'])
STATE.update(frame_no=0, analyzed=0, boxes=[])
`,
        hint: `<p><code>analyzed_now = STATE['frame_no'] % EVERY_N == 0</code> 로 조건을 만들고 <code>if analyzed_now:</code> 안에서 분석하세요. 상태 글자는 <code>'analyzed' if analyzed_now else 'reused'</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

EVERY_N = 3
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'frame_no': 0, 'boxes': [], 'analyzed': 0}


def find_boxes(frame):
    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    s = 480 / frame.shape[1]
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [tuple(int(v / s) for v in cv.boundingRect(c)) for c in contours if 300 <= cv.contourArea(c) <= 40000]


def process(frame):
    analyzed_now = STATE['frame_no'] % EVERY_N == 0
    if analyzed_now:
        STATE['boxes'] = find_boxes(frame)
        STATE['analyzed'] += 1
    STATE['frame_no'] += 1

    out = frame.copy()
    for x, y, w, h in STATE['boxes']:
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    status = 'analyzed' if analyzed_now else 'reused'
    cv.putText(out, f'frame {STATE["frame_no"]} ({status})', (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.7,
               (0, 255, 0) if analyzed_now else (0, 200, 255), 2)
    return out


img = cv.imread('stuff.jpg')
for i in range(6):
    process(img)
print('6 프레임 중 분석 횟수:', STATE['analyzed'])
STATE.update(frame_no=0, analyzed=0, boxes=[])
`,
      },
      {
        title: '실습 3 · EMA 로 상자 위치 부드럽게 만들기',
        desc: `<p>가장 큰 물체의 상자가 프레임마다 떨리는 상황을 흉내 낸 코드입니다. <code>smooth_box(box)</code> 를 EMA(α=0.3)로 완성해, 초록 상자(부드럽게 만든 것)가 빨간 상자(원래 값)보다 덜 떨리게 하세요. 콘솔에 두 상자의 x 좌표 흔들림(표준편차)이 출력되며, 초록 쪽이 작아지면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

ALPHA = 0.3
STATE = {'box': None}          # 부드럽게 만든 상자 (실수 좌표)


def smooth_box(box):
    """새 상자 (x, y, w, h) 를 받아 EMA 로 부드럽게 만든 정수 상자를 돌려준다."""
    # TODO: STATE['box'] 가 None 이면 box 로 시작, 아니면 (1-ALPHA)*이전 + ALPHA*새값
    return box


img = cv.imread('stuff.jpg')
rng = np.random.default_rng(0)
true_box = np.array([335, 124, 121, 124])            # 공의 실제 상자
raw_xs, smooth_xs = [], []
for i in range(30):
    raw = tuple(int(v) for v in true_box + rng.integers(-8, 9, 4))   # 떨리는 측정값
    sm = smooth_box(raw)
    raw_xs.append(raw[0]); smooth_xs.append(sm[0])

out = img.copy()
x, y, w, h = raw
cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 2)
x, y, w, h = sm
cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
print('x 흔들림(표준편차) raw:', round(float(np.std(raw_xs)), 2), '/ smooth:', round(float(np.std(smooth_xs)), 2))
cv.imshow('box smoothing', out)
`,
        hint: `<p><code>b = np.array(box, dtype=float)</code> 로 바꾸면 한 줄로 계산할 수 있습니다: <code>STATE['box'] = (1 - ALPHA) * STATE['box'] + ALPHA * b</code>. 돌려줄 때는 <code>tuple(int(round(v)) for v in STATE['box'])</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

ALPHA = 0.3
STATE = {'box': None}


def smooth_box(box):
    """새 상자 (x, y, w, h) 를 받아 EMA 로 부드럽게 만든 정수 상자를 돌려준다."""
    b = np.array(box, dtype=float)
    if STATE['box'] is None:
        STATE['box'] = b
    else:
        STATE['box'] = (1 - ALPHA) * STATE['box'] + ALPHA * b
    return tuple(int(round(v)) for v in STATE['box'])


img = cv.imread('stuff.jpg')
rng = np.random.default_rng(0)
true_box = np.array([335, 124, 121, 124])
raw_xs, smooth_xs = [], []
for i in range(30):
    raw = tuple(int(v) for v in true_box + rng.integers(-8, 9, 4))
    sm = smooth_box(raw)
    raw_xs.append(raw[0]); smooth_xs.append(sm[0])

out = img.copy()
x, y, w, h = raw
cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 2)
x, y, w, h = sm
cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
print('x 흔들림(표준편차) raw:', round(float(np.std(raw_xs)), 2), '/ smooth:', round(float(np.std(smooth_xs)), 2))
cv.imshow('box smoothing', out)
`,
      },
    ],
    quiz: [
      { q: 'process(frame) 안에 두면 안 좋은 코드는?', options: ['cv.Canny(blur, 30, 90)', 'cv.createTrackbar(...) 로 트랙바 만들기', 'cv.resize 로 작업 해상도 맞추기', 'return 결과 이미지'], answer: 1, explain: '트랙바·커널·설정처럼 한 번만 만들면 되는 것은 함수 밖에 둡니다. process 는 프레임마다 호출되므로 매번 새로 만들면 낭비이고 동작도 꼬일 수 있습니다.' },
      { q: '한 프레임 처리에 평균 40ms 가 걸린다면 최대로 기대할 수 있는 FPS 는?', options: ['약 4', '약 25', '약 40', '약 400'], answer: 1, explain: 'FPS = 1000 / 40 = 25 입니다. 실제로는 카메라 속도와 화면 표시 시간 때문에 이보다 낮을 수 있습니다.' },
      { q: '관심 영역 roi = frame[100:300, 200:500] 에서 찾은 상자의 x, y 가 (30, 40) 입니다. 전체 프레임에서의 좌표는?', options: ['(30, 40)', '(130, 240)', '(230, 140)', '(530, 340)'], answer: 2, explain: '슬라이싱은 [y1:y2, x1:x2] 이므로 x 시작 200, y 시작 100 입니다. (30+200, 40+100) = (230, 140).' },
      { q: '물체 수가 5, 6, 5, 4, 5, 8, 5 처럼 흔들릴 때, 가끔 튀는 값에 가장 강한 안정화 방법은?', options: ['최근 값들의 중앙값', '마지막 값만 사용', '최근 값들의 최댓값', '프레임을 더 자주 분석'], answer: 0, explain: '중앙값은 튀는 값(8)의 영향을 거의 받지 않습니다. 평균은 튀는 값에 끌려가고, 최댓값은 잡음을 그대로 반영합니다.' },
    ],
  },
  // =====================================================================
  // w5-4 구현 ④ 인터랙션과 파라미터 튜닝
  // =====================================================================
  {
    id: 'w5-4',
    summary: 'CONFIG 를 트랙바와 자동으로 연결하는 도우미를 만들고, 마우스로 물체를 선택하거나 추적할 색을 고르며, 반투명 정보 패널과 범례로 결과를 보기 좋게 보여 주는 “튜닝 패널”을 완성합니다.',
    goals: [
      '트랙바 명세(spec)로 CONFIG 값을 트랙바에 자동 연결하고, process 안에서 다시 읽어 쓸 수 있다',
      '정수만 되는 트랙바 값을 홀수 커널·소수·배수 값으로 변환하고 범위를 검사할 수 있다',
      '마우스 클릭 좌표를 작업 좌표로 바꿔 물체를 선택하거나 클릭한 픽셀의 HSV 로 색을 추적할 수 있다',
      'addWeighted 로 반투명 정보 패널과 범례를 그려 데모 화면을 완성할 수 있다',
    ],
    schedule: [['도입: 왜 인터랙션인가', 3], ['트랙바 · 마우스 연결 개념', 12], ['예제 실습', 20], ['팀 튜닝 패널 만들기', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 인터랙션이 필요한 두 가지 이유</h3>
<ul>
  <li><b>튜닝</b>: 코드를 고치고 ▶ 실행을 반복하는 대신, 슬라이더를 움직이며 결과를 바로 보면 좋은 파라미터를 훨씬 빨리 찾습니다. 발표장 조명이 달라도 현장에서 맞출 수 있습니다.</li>
  <li><b>데모</b>: “물체를 클릭하면 정보가 나온다”, “원하는 색을 클릭하면 그 색을 따라간다” 같은 조작은 발표를 생생하게 만듭니다.</li>
</ul>
<h3>2. CONFIG ↔ 트랙바 자동 연결</h3>
<p>트랙바를 파라미터마다 손으로 만들면 코드가 길어지고 이름이 틀리기 쉽습니다. <b>명세(spec) 딕셔너리</b> 하나로 “어떤 CONFIG 키를, 어떤 범위로, 어떻게 변환할지”를 적고 두 함수로 처리합니다.</p>
<ul>
  <li><code>create_trackbars(win, spec)</code> — 함수 밖에서 <b>한 번</b> 호출: 명세대로 트랙바 생성</li>
  <li><code>read_trackbars(win, spec, cfg)</code> — <code>process()</code> 첫 줄에서 호출: 현재 위치를 읽어 변환한 뒤 CONFIG 에 저장</li>
</ul>
<p>트랙바는 <b>0 이상의 정수</b>만 됩니다. 그래서 변환 함수가 필요합니다.</p>` },
      { type: 'table', head: ['원하는 값', '트랙바 위치 p', '변환', '예'], rows: [
        ['홀수 커널 크기 1, 3, 5 …', '0 ~ 7', '<code>2 * p + 1</code>', 'p=2 → 5'],
        ['소수 0.0 ~ 5.0', '0 ~ 50', '<code>p / 10</code>', 'p=20 → 2.0 (CLAHE clip)'],
        ['큰 값 0 ~ 5000', '0 ~ 100', '<code>p * 50</code>', 'p=6 → 300 (최소 면적)'],
        ['최솟값이 1 이상', '0 ~ 10', '<code>max(1, p)</code>', 'p=0 → 1 (반복 횟수)'],
        ['켜기/끄기', '0 ~ 1', '<code>bool(p)</code>', 'p=1 → True (CLAHE 사용)'],
      ] },
      { type: 'code', title: '예제 1 · 트랙바 명세로 CONFIG 자동 연결하기', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'work_width': 480, 'blur_ksize': 5, 'canny_lo': 30, 'canny_hi': 90,
          'close_iter': 2, 'min_area': 300}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
WIN = 'result'                      # process 결과가 표시되는 창에 트랙바를 붙인다

# CONFIG 키: (처음 위치, 최대 위치, 위치 → 값 변환 함수)
TRACKBAR_SPEC = {
    'blur_ksize': (2, 7, lambda p: 2 * p + 1),     # 1, 3, 5, ... 15 (홀수만)
    'canny_lo':   (30, 255, lambda p: p),
    'canny_hi':   (90, 255, lambda p: p),
    'close_iter': (2, 6, lambda p: p),
    'min_area':   (6, 100, lambda p: p * 50),       # 0 ~ 5000 을 50 간격으로
}


def nothing(x):
    pass


def create_trackbars(win, spec):
    """명세대로 트랙바를 만든다 (함수 밖에서 한 번만 호출)."""
    cv.namedWindow(win)
    for key, (init, maxval, _) in spec.items():
        cv.createTrackbar(key, win, init, maxval, nothing)


def read_trackbars(win, spec, cfg):
    """트랙바 위치를 읽어 변환한 값을 cfg 에 넣고, 값의 규칙도 검사한다."""
    for key, (_, _, convert) in spec.items():
        cfg[key] = convert(cv.getTrackbarPos(key, win))
    if cfg['canny_hi'] <= cfg['canny_lo']:            # 규칙: hi 는 lo 보다 커야 한다
        cfg['canny_hi'] = cfg['canny_lo'] + 1
    return cfg


create_trackbars(WIN, TRACKBAR_SPEC)


def process(frame):
    cfg = read_trackbars(WIN, TRACKBAR_SPEC, CONFIG)
    h, w = frame.shape[:2]
    s = cfg['work_width'] / w
    work = cv.resize(frame, (cfg['work_width'], int(h * s)), interpolation=cv.INTER_AREA)
    k = cfg['blur_ksize']
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (k, k), 0)
    edges = cv.Canny(blur, cfg['canny_lo'], cfg['canny_hi'])
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=cfg['close_iter']), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= cfg['min_area']]

    out = work.copy()
    for x, y, bw, bh in boxes:
        cv.rectangle(out, (x, y), (x + bw, y + bh), (0, 255, 0), 2)
    text = f"blur={k} canny={cfg['canny_lo']}/{cfg['canny_hi']} close={cfg['close_iter']} minA={cfg['min_area']} n={len(boxes)}"
    cv.rectangle(out, (0, 0), (out.shape[1], 24), (0, 0, 0), -1)
    cv.putText(out, text, (6, 17), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1, cv.LINE_AA)
    return out


print('슬라이더를 움직여 보세요. 파라미터를 추가하려면 TRACKBAR_SPEC 에 한 줄만 더하면 됩니다.')
`, desc: '<p>새 파라미터를 트랙바로 조절하고 싶으면 <code>TRACKBAR_SPEC</code> 에 한 줄만 추가하면 됩니다. <code>canny_hi</code> 를 <code>canny_lo</code> 보다 작게 내려도 <code>read_trackbars()</code> 가 규칙을 지켜 주므로 오류나 이상한 결과가 나지 않습니다.</p>' },
      { type: 'text', html: `
<h3>3. 마우스로 물체 선택하기</h3>
<p>결과 창 <code>result</code> 에 <code>cv.setMouseCallback('result', on_mouse)</code> 를 연결하면 클릭 좌표 <code>(x, y)</code> 가 전달됩니다. 이때 세 가지를 조심하세요.</p>
<ol>
  <li><b>좌표계 맞추기</b>: 결과 이미지가 원본 크기라면 클릭 좌표도 원본 기준입니다. 작업 해상도의 컨투어와 비교하려면 <code>x × scale</code> 로 바꿉니다.</li>
  <li><b>어느 물체인지 판정</b>: 상자 안에 있는지로 판단하면 상자가 겹칠 때(연필 상자 안의 캡) 틀립니다. <code>cv.pointPolygonTest(contour, (x, y), False)</code> 가 0 이상이면 <b>컨투어 안쪽</b>입니다.</li>
  <li><b>화면 갱신</b>: 웹캠이면 다음 프레임에 자동 반영되지만, <b>이미지 입력이면 process 가 다시 불리지 않으므로</b> 콜백 안에서 마지막 프레임으로 다시 그려 <code>cv.imshow('result', …)</code> 합니다.</li>
</ol>
<p>클릭한 “위치”를 저장해 두고 프레임마다 그 위치를 포함하는 물체를 고르면, 웹캠에서 물체 번호가 바뀌어도 선택이 유지됩니다.</p>` },
      { type: 'code', title: '예제 2 · 클릭한 물체의 상세 정보 보기', code: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
WORK_W = 480
STATE = {'click': None, 'frame': None}       # 클릭 위치(원본 좌표), 마지막 프레임


def analyze(frame):
    """물체 dict 리스트와 scale 을 돌려준다 (작업 해상도 좌표)."""
    s = WORK_W / frame.shape[1]
    work = cv.resize(frame, (WORK_W, int(frame.shape[0] * s)), interpolation=cv.INTER_AREA)
    hsv = cv.cvtColor(work, cv.COLOR_BGR2HSV)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = []
    for c in contours:
        area = cv.contourArea(c)
        if not 300 <= area <= 40000:
            continue
        x, y, w, h = cv.boundingRect(c)
        m = np.zeros((h, w), np.uint8)
        cv.drawContours(m, [c], -1, 255, -1, offset=(-x, -y))
        mh, ms, mv, _ = cv.mean(hsv[y:y + h, x:x + w], mask=m)
        (_, _), (rw, rh), _ = cv.minAreaRect(c)
        objects.append({'id': len(objects) + 1, 'contour': c, 'box': (x, y, w, h), 'area': area,
                        'aspect': max(rw, rh) / max(1.0, min(rw, rh)), 'hsv': (mh, ms, mv)})
    return objects, s


def find_clicked(objects, click, s):
    """클릭 위치(원본 좌표)를 컨투어 안에 포함하는 물체를 찾는다."""
    if click is None:
        return None
    px, py = click[0] * s, click[1] * s                       # 원본 → 작업 좌표
    for o in objects:
        if cv.pointPolygonTest(o['contour'], (float(px), float(py)), False) >= 0:
            return o
    return None


def render(frame):
    objects, s = analyze(frame)
    selected = find_clicked(objects, STATE['click'], s)
    out = frame.copy()
    for o in objects:
        x, y, w, h = [int(v / s) for v in o['box']]
        is_sel = selected is not None and o['id'] == selected['id']
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255) if is_sel else (0, 255, 0), 3 if is_sel else 1)
    if selected is not None:
        h_, s_, v_ = selected['hsv']
        lines = [f'object #{selected["id"]}', f'area   {selected["area"] / (s * s):.0f} px',
                 f'aspect {selected["aspect"]:.1f}', f'HSV    {h_:.0f},{s_:.0f},{v_:.0f}']
        cv.rectangle(out, (0, 0), (200, 18 + 22 * len(lines)), (0, 0, 0), -1)
        for i, t in enumerate(lines):
            cv.putText(out, t, (8, 24 + 22 * i), cv.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv.LINE_AA)
    else:
        cv.putText(out, 'Click an object (right click: clear)', (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return out


def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        STATE['click'] = (x, y)
    elif event == cv.EVENT_RBUTTONDOWN:
        STATE['click'] = None
    else:
        return
    if STATE['frame'] is not None:                   # 이미지 입력: 직접 다시 그리기
        cv.imshow('result', render(STATE['frame']))


def process(frame):
    STATE['frame'] = frame
    return render(frame)


cv.namedWindow('result')
cv.setMouseCallback('result', on_mouse)
print('result 창에서 물체를 클릭하세요. 오른쪽 클릭은 선택 해제입니다.')
`, desc: '<p>연필 상자 안쪽의 빈 책상을 클릭하면 아무것도 선택되지 않고, 연필 몸통을 클릭해야 연필이 선택됩니다 — <code>pointPolygonTest</code> 가 상자가 아니라 실제 윤곽으로 판정하기 때문입니다. 면적은 작업 해상도 값을 <code>s²</code> 로 나눠 원본 기준으로 보여 줍니다.</p>' },
      { type: 'code', title: '예제 3 · 클릭한 색을 추적하기 (HSV 자동 범위)', code: String.raw`
import cv2 as cv
import numpy as np

STATE = {'target': None, 'frame': None}      # target: 클릭한 곳의 (H, S, V)
H_RANGE, S_MIN, V_MIN = 10, 60, 50
KERNEL = np.ones((5, 5), np.uint8)


def pick_hsv(frame, x, y, r=3):
    """(x, y) 주변 (2r+1)×(2r+1) 픽셀의 HSV 중앙값 — 한 픽셀보다 잡음에 강하다."""
    h, w = frame.shape[:2]
    patch = frame[max(0, y - r):min(h, y + r + 1), max(0, x - r):min(w, x + r + 1)]
    hsv = cv.cvtColor(patch, cv.COLOR_BGR2HSV).reshape(-1, 3)
    return tuple(int(v) for v in np.median(hsv, axis=0))


def color_mask(hsv, target):
    """목표 색 주변 범위의 마스크. H 는 0 과 179 가 이웃이므로 경계를 넘으면 두 범위를 합친다."""
    h, s, v = target
    s_lo, v_lo = max(S_MIN, s - 70), max(V_MIN, v - 90)
    lo, hi = h - H_RANGE, h + H_RANGE
    mask = cv.inRange(hsv, (max(lo, 0), s_lo, v_lo), (min(hi, 179), 255, 255))
    if lo < 0:                                                   # 예: h=5 → 175~179 도 포함
        mask |= cv.inRange(hsv, (180 + lo, s_lo, v_lo), (179, 255, 255))
    if hi > 179:                                                 # 예: h=171 → 0~2 도 포함
        mask |= cv.inRange(hsv, (0, s_lo, v_lo), (hi - 180, 255, 255))
    return cv.morphologyEx(mask, cv.MORPH_OPEN, KERNEL)


def render(frame):
    out = frame.copy()
    if STATE['target'] is None:
        cv.putText(out, 'Click a colorful object to track', (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        return out
    h, s, v = STATE['target']
    if s < S_MIN:                                                # 흰색·회색·검정은 색상(H)이 의미 없음
        cv.putText(out, f'Low saturation (S={s}). Pick a colorful object', (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        return out
    mask = color_mask(cv.cvtColor(frame, cv.COLOR_BGR2HSV), STATE['target'])
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv.contourArea)
        if cv.contourArea(c) > 200:
            x, y, w, hh = cv.boundingRect(c)
            cv.rectangle(out, (x, y), (x + w, y + hh), (0, 255, 0), 3)
            M = cv.moments(c)
            cx, cy = int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])
            cv.circle(out, (cx, cy), 6, (0, 0, 255), -1)
    # 오른쪽 위에 마스크 미리보기(1/4 크기)와 목표 색 견본
    H, W = out.shape[:2]
    thumb = cv.resize(cv.cvtColor(mask, cv.COLOR_GRAY2BGR), (W // 4, H // 4))
    out[0:H // 4, W - W // 4:W] = thumb
    swatch = cv.cvtColor(np.uint8([[[h, s, v]]]), cv.COLOR_HSV2BGR)[0, 0]
    cv.rectangle(out, (10, 10), (50, 50), tuple(int(c) for c in swatch), -1)
    cv.putText(out, f'H={h} S={s} V={v}', (60, 38), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    return out


def on_mouse(event, x, y, flags, param):
    if event != cv.EVENT_LBUTTONDOWN or STATE['frame'] is None:
        return
    STATE['target'] = pick_hsv(STATE['frame'], x, y)
    print('선택한 색 HSV =', STATE['target'])
    cv.imshow('result', render(STATE['frame']))


def process(frame):
    STATE['frame'] = frame
    return render(frame)


cv.namedWindow('result')
cv.setMouseCallback('result', on_mouse)
print('stuff.jpg 에서는 분홍 라이터를 클릭해 보세요. 웹캠에서는 색이 선명한 물건을 들고 클릭하세요.')
`, desc: '<p>라이터의 색상 H 는 약 171 로, 179 와 0 의 경계 근처입니다. 범위 ±10 이 179 를 넘기 때문에 0~2 구간을 따로 더해 주지 않으면 빨강·분홍 물체를 제대로 추적하지 못합니다. 흰 공이나 검은 캡은 채도(S)가 낮아 색상 추적에 맞지 않으므로 안내 문구를 보여 줍니다.</p>' },
      { type: 'text', html: `
<h3>4. 보기 좋은 오버레이 UI</h3>
<p>데모 화면은 “한눈에 읽히는 것”이 중요합니다. 몇 가지 도우미 함수를 만들어 두면 팀 프로젝트 어디서나 쓸 수 있습니다.</p>
<ul>
  <li><b>반투명 패널</b>: 패널 영역 ROI 와 같은 크기의 검은 이미지를 <code>cv.addWeighted(roi, 1-α, black, α, 0)</code> 로 섞어 다시 ROI 에 넣기 — 배경이 비쳐 보여 화면을 덜 가림. 영역이 이미지 밖으로 나가지 않게 잘라 주기</li>
  <li><b>테두리 글자</b>: 검은색 굵은 글자 위에 흰(색) 얇은 글자를 겹쳐 쓰면 어떤 배경에서도 읽힘</li>
  <li><b>범례(legend)</b>: 색 네모 + 이름 — 상자 색의 의미를 알려 줌</li>
  <li><b>일관성</b>: 정보는 왼쪽 위, 범례는 오른쪽 아래처럼 위치를 고정하고 색의 의미를 바꾸지 않기</li>
</ul>` },
      { type: 'code', title: '예제 4 · 반투명 정보 패널 · 테두리 글자 · 범례 도우미', code: String.raw`
import cv2 as cv
import numpy as np

SHAPE_COLORS = {'round': (0, 200, 255), 'long': (255, 140, 0), 'box': (0, 220, 0)}


def draw_panel(img, x, y, w, h, alpha=0.55, color=(0, 0, 0)):
    """img 의 (x, y, w, h) 영역에 반투명 사각형을 제자리에 그린다."""
    H, W = img.shape[:2]
    x1, y1, x2, y2 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)   # 화면 밖으로 나가지 않게
    if x2 <= x1 or y2 <= y1:
        return
    roi = img[y1:y2, x1:x2]
    overlay = np.full_like(roi, color)
    img[y1:y2, x1:x2] = cv.addWeighted(roi, 1 - alpha, overlay, alpha, 0)


def put_text(img, text, org, color=(255, 255, 255), scale=0.55):
    """검은 테두리가 있는 글자."""
    cv.putText(img, text, org, cv.FONT_HERSHEY_SIMPLEX, scale, (0, 0, 0), 3, cv.LINE_AA)
    cv.putText(img, text, org, cv.FONT_HERSHEY_SIMPLEX, scale, color, 1, cv.LINE_AA)


def draw_legend(img, items, corner='bottom-right'):
    """items: {이름: BGR색}. 오른쪽 아래에 색 견본과 이름을 그린다."""
    H, W = img.shape[:2]
    w, h = 130, 12 + 22 * len(items)
    x, y = (W - w - 10, H - h - 10) if corner == 'bottom-right' else (10, 10)
    draw_panel(img, x, y, w, h, 0.6)
    for i, (name, color) in enumerate(items.items()):
        yy = y + 10 + 22 * i
        cv.rectangle(img, (x + 10, yy), (x + 26, yy + 14), color, -1)
        put_text(img, name, (x + 34, yy + 13))


img = cv.imread('stuff.jpg')
out = img.copy()

# (예시 결과) 물체 상자 — 실제로는 analyze() 결과를 사용
demo = [((335, 124, 121, 124), 'round', 'ball'), ((312, 312, 51, 152), 'box', 'lighter'),
        ((54, 88, 289, 169), 'long', 'pencil'), ((187, 285, 45, 44), 'round', 'coin'),
        ((189, 16, 90, 92), 'round', 'cap')]
for (x, y, w, h), shape, name in demo:
    cv.rectangle(out, (x, y), (x + w, y + h), SHAPE_COLORS[shape], 2)
    put_text(out, name, (x + 4, y + h - 6), SHAPE_COLORS[shape])

# 왼쪽 위 정보 패널
lines = ['Desk Object Analyzer', 'objects: 5', 'round 3 / long 1 / box 1', 'FPS: 24.8']
draw_panel(out, 10, 10, 250, 16 + 24 * len(lines), alpha=0.55)
for i, t in enumerate(lines):
    put_text(out, t, (20, 34 + 24 * i), (0, 255, 255) if i == 0 else (255, 255, 255), 0.6)

draw_legend(out, SHAPE_COLORS)
draw_panel(out, 560, -20, 200, 60, alpha=0.5, color=(0, 0, 255))   # 화면 밖으로 나가도 안전
cv.imshow('overlay UI', out)
`, desc: '<p>패널 뒤로 책상 무늬가 비쳐 보여 화면을 덜 가립니다. 밝은 공 위의 <code>ball</code> 글자도 테두리 덕분에 잘 읽힙니다. 마지막 줄처럼 좌표가 화면 밖으로 나가도 <code>draw_panel()</code> 이 잘라서 처리하므로 오류가 나지 않습니다.</p>' },
      { type: 'text', html: `
<h3>5. 최종 “튜닝 패널” — 모든 것을 한 화면에</h3>
<p>팀 프로젝트 데모 화면의 표준 구성입니다. 아래 예제를 뼈대로 팀 파이프라인을 끼워 넣으세요.</p>
<ul>
  <li><b>트랙바</b>: 핵심 파라미터 4~6개 + <code>view</code> (0 = 결과, 1 = 디버그 격자)</li>
  <li><b>마우스</b>: 왼쪽 클릭 = 물체 선택, 오른쪽 클릭 = 현재 CONFIG 를 콘솔에 출력(좋은 값을 찾으면 코드에 복사!)</li>
  <li><b>오버레이</b>: 왼쪽 위 반투명 정보 패널(개수·파라미터·선택 물체), 오른쪽 아래 범례</li>
</ul>
<p>트랙바로 찾은 값은 발표 전에 반드시 <b>CONFIG 기본값으로 옮겨 적으세요</b>. 다시 실행하면 트랙바는 처음 위치로 돌아갑니다.</p>` },
      { type: 'code', title: '예제 5 · 최종 튜닝 패널: 트랙바 + 클릭 선택 + 오버레이 + 디버그 전환', code: String.raw`
import cv2 as cv
import numpy as np
from collections import Counter

WIN = 'result'
CONFIG = {'work_width': 480, 'canny_lo': 30, 'canny_hi': 90, 'close_iter': 2, 'min_area': 300, 'view': 0}
SPEC = {   # CONFIG 키: (처음 위치, 최대, 변환)
    'canny_lo': (30, 255, lambda p: p),
    'canny_hi': (90, 255, lambda p: p),
    'close_iter': (2, 6, lambda p: p),
    'min_area': (6, 60, lambda p: p * 50),
    'view': (0, 1, lambda p: p),             # 0 = 결과, 1 = 디버그 격자
}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
SHAPE_COLORS = {'round': (0, 200, 255), 'long': (255, 140, 0), 'box': (0, 220, 0)}
STATE = {'click': None, 'frame': None}


def nothing(x):
    pass


cv.namedWindow(WIN)
for key, (init, maxval, _) in SPEC.items():
    cv.createTrackbar(key, WIN, init, maxval, nothing)


def read_trackbars():
    for key, (_, _, conv) in SPEC.items():
        CONFIG[key] = conv(cv.getTrackbarPos(key, WIN))
    CONFIG['canny_hi'] = max(CONFIG['canny_hi'], CONFIG['canny_lo'] + 1)


def draw_panel(img, x, y, w, h, alpha=0.55):
    H, W = img.shape[:2]
    x1, y1, x2, y2 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x2 > x1 and y2 > y1:
        roi = img[y1:y2, x1:x2]
        img[y1:y2, x1:x2] = cv.addWeighted(roi, 1 - alpha, np.zeros_like(roi), alpha, 0)


def put_text(img, text, org, color=(255, 255, 255), scale=0.5):
    cv.putText(img, text, org, cv.FONT_HERSHEY_SIMPLEX, scale, (0, 0, 0), 3, cv.LINE_AA)
    cv.putText(img, text, org, cv.FONT_HERSHEY_SIMPLEX, scale, color, 1, cv.LINE_AA)


def pipeline(frame, cfg):
    """전처리~분석. 디버그용 중간 결과도 함께 돌려준다."""
    s = cfg['work_width'] / frame.shape[1]
    work = cv.resize(frame, (cfg['work_width'], int(frame.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(blur, cfg['canny_lo'], cfg['canny_hi'])
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=cfg['close_iter']), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = []
    for c in contours:
        area = cv.contourArea(c)
        if area < cfg['min_area'] or area > 40000:
            continue
        (_, _), (rw, rh), _ = cv.minAreaRect(c)
        aspect = max(rw, rh) / max(1.0, min(rw, rh))
        circ = 4 * np.pi * area / (cv.arcLength(c, True) ** 2)
        shape = 'long' if aspect >= 4 else ('round' if circ >= 0.75 else 'box')
        objects.append({'id': len(objects) + 1, 'contour': c, 'box': cv.boundingRect(c),
                        'area': area, 'aspect': aspect, 'circ': circ, 'shape': shape})
    return objects, s, {'work': work, 'blur': blur, 'edges': edges, 'mask': mask}


def debug_grid(stages, objects):
    vis = stages['work'].copy()
    for o in objects:
        x, y, w, h = o['box']
        cv.rectangle(vis, (x, y), (x + w, y + h), SHAPE_COLORS[o['shape']], 2)
    cells = []
    for img, label in [(stages['blur'], 'blur'), (stages['edges'], 'edges'), (stages['mask'], 'mask'), (vis, 'objects')]:
        if img.ndim == 2:
            img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
        cell = cv.resize(img, (320, 240))
        put_text(cell, label, (8, 22), (0, 255, 255), 0.6)
        cells.append(cell)
    return np.vstack([np.hstack(cells[:2]), np.hstack(cells[2:])])


def render(frame):
    read_trackbars()
    objects, s, stages = pipeline(frame, CONFIG)
    if CONFIG['view'] == 1:
        return debug_grid(stages, objects)

    selected = None
    if STATE['click'] is not None:
        px, py = STATE['click'][0] * s, STATE['click'][1] * s
        for o in objects:
            if cv.pointPolygonTest(o['contour'], (float(px), float(py)), False) >= 0:
                selected = o
    out = frame.copy()
    for o in objects:
        x, y, w, h = [int(v / s) for v in o['box']]
        thick = 4 if o is selected else 2
        cv.rectangle(out, (x, y), (x + w, y + h), SHAPE_COLORS[o['shape']], thick)
        put_text(out, f'#{o["id"]}', (x + 3, y + 16), SHAPE_COLORS[o['shape']])

    counts = Counter(o['shape'] for o in objects)
    lines = [f'objects {len(objects)}  ' + ' '.join(f'{k}:{v}' for k, v in sorted(counts.items())),
             f'canny {CONFIG["canny_lo"]}/{CONFIG["canny_hi"]}  close {CONFIG["close_iter"]}  minA {CONFIG["min_area"]}']
    if selected is not None:
        lines.append(f'#{selected["id"]} {selected["shape"]}  area {selected["area"] / s / s:.0f}  '
                     f'aspect {selected["aspect"]:.1f}  circ {selected["circ"]:.2f}')
    else:
        lines.append('L-click: select   R-click: print CONFIG')
    draw_panel(out, 0, 0, out.shape[1], 12 + 22 * len(lines))
    for i, t in enumerate(lines):
        put_text(out, t, (8, 26 + 22 * i), (0, 255, 255) if i == 0 else (255, 255, 255))

    H, W = out.shape[:2]                                 # 범례
    draw_panel(out, W - 110, H - 80, 100, 72)
    for i, (name, color) in enumerate(SHAPE_COLORS.items()):
        cv.rectangle(out, (W - 100, H - 72 + 22 * i), (W - 86, H - 58 + 22 * i), color, -1)
        put_text(out, name, (W - 78, H - 60 + 22 * i))
    return out


def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN and CONFIG['view'] == 0:
        STATE['click'] = (x, y)
    elif event == cv.EVENT_RBUTTONDOWN:
        print('현재 CONFIG =', {k: v for k, v in CONFIG.items()})
        return
    else:
        return
    if STATE['frame'] is not None:
        cv.imshow(WIN, render(STATE['frame']))


def process(frame):
    STATE['frame'] = frame
    return render(frame)


cv.setMouseCallback(WIN, on_mouse)
print('튜닝 패널 준비 완료: 슬라이더로 조절하고, view=1 로 디버그 격자를 보세요.')
`, desc: '<p>이 한 화면으로 “조절 → 확인 → 기록”을 모두 할 수 있습니다. <code>view</code> 를 1 로 올리면 단계별 격자로 바뀌어 어느 단계가 문제인지 바로 보입니다. 오른쪽 클릭으로 출력된 CONFIG 를 코드 맨 위에 붙여 넣으면 튜닝 결과가 보존됩니다.</p>' },
      { type: 'tip', html: `<p><b>인터랙션 설계 팁</b>: 트랙바는 6개 이하로(너무 많으면 무엇을 움직일지 헷갈림), 이름은 CONFIG 키와 같게, 기본 위치는 “가장 잘 되는 값”으로 두세요. 발표 도중 조작법을 설명할 필요가 없도록 화면 안에 <code>L-click: select</code> 같은 안내를 적어 두면 좋습니다.</p>` },
      { type: 'checklist', title: '인터랙션 · 튜닝 패널 점검 목록', items: [
        '트랙바는 함수 밖에서 한 번 만들고, process 안에서 getTrackbarPos 로 읽는다',
        '트랙바 값 → 실제 값 변환(홀수, 소수, 배수)과 규칙 검사(hi 가 lo 보다 큼, 최소 1)가 있다',
        '마우스 좌표를 작업 해상도 좌표로 변환해 사용한다',
        '이미지 입력일 때도 클릭 결과가 화면에 반영된다 (콜백에서 다시 imshow)',
        '정보 패널·범례가 결과를 가리지 않고 어떤 배경에서도 글자가 읽힌다',
        '트랙바로 찾은 최적값을 CONFIG 기본값에 옮겨 적었다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 트랙바 명세에 파라미터 추가하기',
        desc: `<p>현재는 <code>canny_lo</code> 트랙바만 있습니다. <code>TRACKBAR_SPEC</code> 에 ① <code>blur_ksize</code> (위치 0~7 → 1, 3, 5 … 15), ② <code>min_area</code> (위치 0~60 → 0~3000, 50 간격), ③ <code>use_clahe</code> (0/1 → False/True) 를 추가하고, process 가 그 값을 쓰도록 고치세요. 결과 위쪽 글자에 네 값이 모두 표시되면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'result'
CONFIG = {'canny_lo': 30, 'blur_ksize': 5, 'min_area': 300, 'use_clahe': False}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
CLAHE = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))   # 한 번만 생성

TRACKBAR_SPEC = {
    'canny_lo': (30, 255, lambda p: p),
    # TODO 1: blur_ksize, min_area, use_clahe 명세를 추가하세요
}


def nothing(x):
    pass


cv.namedWindow(WIN)
for key, (init, maxval, _) in TRACKBAR_SPEC.items():
    cv.createTrackbar(key, WIN, init, maxval, nothing)


def process(frame):
    for key, (_, _, conv) in TRACKBAR_SPEC.items():
        CONFIG[key] = conv(cv.getTrackbarPos(key, WIN))
    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    # TODO 2: use_clahe 가 True 이면 CLAHE.apply(gray)
    k = CONFIG['blur_ksize']
    blur = cv.GaussianBlur(gray, (k, k), 0)
    edges = cv.Canny(blur, CONFIG['canny_lo'], CONFIG['canny_lo'] * 3)
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    n = 0
    for c in contours:
        if cv.contourArea(c) >= CONFIG['min_area']:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(work, (x, y), (x + w, y + h), (0, 255, 0), 2)
            n += 1
    text = f"lo={CONFIG['canny_lo']} blur={k} minA={CONFIG['min_area']} clahe={CONFIG['use_clahe']} n={n}"
    cv.putText(work, text, (8, 20), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
    return work
`,
        hint: `<p><code>'blur_ksize': (2, 7, lambda p: 2 * p + 1)</code> 처럼 (처음 위치, 최대, 변환) 을 적습니다. min_area 의 처음 위치는 300/50 = 6, use_clahe 는 <code>(0, 1, lambda p: bool(p))</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'result'
CONFIG = {'canny_lo': 30, 'blur_ksize': 5, 'min_area': 300, 'use_clahe': False}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
CLAHE = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

TRACKBAR_SPEC = {
    'canny_lo': (30, 255, lambda p: p),
    'blur_ksize': (2, 7, lambda p: 2 * p + 1),
    'min_area': (6, 60, lambda p: p * 50),
    'use_clahe': (0, 1, lambda p: bool(p)),
}


def nothing(x):
    pass


cv.namedWindow(WIN)
for key, (init, maxval, _) in TRACKBAR_SPEC.items():
    cv.createTrackbar(key, WIN, init, maxval, nothing)


def process(frame):
    for key, (_, _, conv) in TRACKBAR_SPEC.items():
        CONFIG[key] = conv(cv.getTrackbarPos(key, WIN))
    work = cv.resize(frame, (480, int(frame.shape[0] * 480 / frame.shape[1])), interpolation=cv.INTER_AREA)
    gray = cv.cvtColor(work, cv.COLOR_BGR2GRAY)
    if CONFIG['use_clahe']:
        gray = CLAHE.apply(gray)
    k = CONFIG['blur_ksize']
    blur = cv.GaussianBlur(gray, (k, k), 0)
    edges = cv.Canny(blur, CONFIG['canny_lo'], CONFIG['canny_lo'] * 3)
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    n = 0
    for c in contours:
        if cv.contourArea(c) >= CONFIG['min_area']:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(work, (x, y), (x + w, y + h), (0, 255, 0), 2)
            n += 1
    text = f"lo={CONFIG['canny_lo']} blur={k} minA={CONFIG['min_area']} clahe={CONFIG['use_clahe']} n={n}"
    cv.putText(work, text, (8, 20), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
    return work
`,
      },
      {
        title: '실습 2 · 더블클릭으로 선택한 물체 잘라 저장하기',
        desc: `<p>왼쪽 클릭으로 물체를 선택하는 코드가 있습니다. ① 오른쪽 클릭하면 선택을 해제하고, ② <b>더블클릭</b>하면 그 위치의 물체 영역(상자보다 10px 여유)을 원본에서 잘라 <code>crop_1.png</code>, <code>crop_2.png</code> … 로 저장(<code>cv.imwrite</code>)하도록 완성하세요. 저장하면 콘솔에 다운로드 링크가 나타납니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'click': None, 'frame': None, 'saved': 0}


def find_contours(frame):
    """원본 크기에서 물체 컨투어 리스트 (간단 버전)."""
    blur = cv.GaussianBlur(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [c for c in contours if 500 <= cv.contourArea(c) <= 70000]


def object_at(frame, x, y):
    """(x, y) 를 포함하는 컨투어를 찾아 돌려준다. 없으면 None."""
    for c in find_contours(frame):
        if cv.pointPolygonTest(c, (float(x), float(y)), False) >= 0:
            return c
    return None


def render(frame):
    out = frame.copy()
    for c in find_contours(frame):
        x, y, w, h = cv.boundingRect(c)
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 1)
    if STATE['click'] is not None:
        c = object_at(frame, *STATE['click'])
        if c is not None:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 3)
    return out


def on_mouse(event, x, y, flags, param):
    if STATE['frame'] is None:
        return
    if event == cv.EVENT_LBUTTONDOWN:
        STATE['click'] = (x, y)
    # TODO 1: EVENT_RBUTTONDOWN 이면 선택 해제 (STATE['click'] = None)
    # TODO 2: EVENT_LBUTTONDBLCLK 이면 object_at 으로 물체를 찾아
    #         상자에 10px 여유를 두고(이미지 경계 안으로) 잘라 crop_번호.png 로 저장
    cv.imshow('result', render(STATE['frame']))


def process(frame):
    STATE['frame'] = frame
    return render(frame)


cv.namedWindow('result')
cv.setMouseCallback('result', on_mouse)
`,
        hint: `<p>여유를 둔 좌표는 <code>x1 = max(0, x - 10)</code>, <code>x2 = min(W, x + w + 10)</code> 처럼 이미지 경계 안으로 자릅니다. 저장 이름은 <code>STATE['saved'] += 1</code> 후 <code>f"crop_{STATE['saved']}.png"</code>. 자른 영역은 <code>frame[y1:y2, x1:x2]</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'click': None, 'frame': None, 'saved': 0}


def find_contours(frame):
    """원본 크기에서 물체 컨투어 리스트 (간단 버전)."""
    blur = cv.GaussianBlur(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [c for c in contours if 500 <= cv.contourArea(c) <= 70000]


def object_at(frame, x, y):
    """(x, y) 를 포함하는 컨투어를 찾아 돌려준다. 없으면 None."""
    for c in find_contours(frame):
        if cv.pointPolygonTest(c, (float(x), float(y)), False) >= 0:
            return c
    return None


def render(frame):
    out = frame.copy()
    for c in find_contours(frame):
        x, y, w, h = cv.boundingRect(c)
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 1)
    if STATE['click'] is not None:
        c = object_at(frame, *STATE['click'])
        if c is not None:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 3)
    return out


def on_mouse(event, x, y, flags, param):
    if STATE['frame'] is None:
        return
    frame = STATE['frame']
    if event == cv.EVENT_LBUTTONDOWN:
        STATE['click'] = (x, y)
    elif event == cv.EVENT_RBUTTONDOWN:
        STATE['click'] = None
    elif event == cv.EVENT_LBUTTONDBLCLK:
        c = object_at(frame, x, y)
        if c is None:
            print('이 위치에는 물체가 없습니다.')
        else:
            bx, by, bw, bh = cv.boundingRect(c)
            H, W = frame.shape[:2]
            x1, y1 = max(0, bx - 10), max(0, by - 10)
            x2, y2 = min(W, bx + bw + 10), min(H, by + bh + 10)
            STATE['saved'] += 1
            name = f"crop_{STATE['saved']}.png"
            cv.imwrite(name, frame[y1:y2, x1:x2])
            print('저장:', name, frame[y1:y2, x1:x2].shape)
    cv.imshow('result', render(frame))


def process(frame):
    STATE['frame'] = frame
    return render(frame)


cv.namedWindow('result')
cv.setMouseCallback('result', on_mouse)
`,
      },
    ],
    quiz: [
      { q: '트랙바 위치 p(0~7)로 GaussianBlur 커널 크기를 조절할 때 알맞은 변환은?', options: ['p', 'p * 2', '2 * p + 1', 'p / 10'], answer: 2, explain: 'GaussianBlur 커널은 양의 홀수여야 합니다. 2p+1 이면 p=0→1, 1→3, 2→5 … 로 항상 홀수입니다.' },
      { q: '원본 640×480 결과 창을 클릭해 (320, 240) 을 얻었습니다. 작업 해상도 480 에서 찾은 컨투어와 비교하려면 어떤 좌표를 써야 할까?', options: ['(320, 240)', '(240, 180)', '(427, 320)', '(480, 360)'], answer: 1, explain: 'scale = 480/640 = 0.75 이므로 작업 좌표 = 원본 좌표 × 0.75 = (240, 180) 입니다.' },
      { q: '이미지 입력(웹캠 아님)에서 마우스로 물체를 클릭했는데 화면이 바뀌지 않습니다. 가장 알맞은 해결책은?', options: ['while 루프로 process 를 계속 호출한다', '콜백 안에서 저장해 둔 마지막 프레임으로 다시 그려 cv.imshow 한다', 'cv.waitKey(0) 을 추가한다', '트랙바를 하나 더 만든다'], answer: 1, explain: '이미지 입력은 process 가 한 번(트랙바 변경 시 다시)만 호출됩니다. 콜백에서 직접 다시 그려 imshow 하면 즉시 반영됩니다. while 루프는 웹 환경에서 금지입니다.' },
      { q: '빨간 물체를 클릭했더니 H=176 이었습니다. inRange 범위를 H 170~182 로 주면 생기는 문제와 해결책으로 옳은 것은?', options: ['문제 없다', 'H 는 0~179 이므로 180 이상은 없다 → 170~179 와 0~2 두 범위를 OR 로 합친다', 'S 범위만 넓히면 된다', 'BGR 로 inRange 하면 해결된다'], answer: 1, explain: 'OpenCV 의 H 는 원형(0 과 179 가 이웃)입니다. 경계를 넘는 범위는 두 부분으로 나눠 마스크를 합쳐야 빨강 계열을 놓치지 않습니다.' },
    ],
  },
  // =====================================================================
  // w5-5 테스트 · 디버깅 · 코드 리뷰
  // =====================================================================
  {
    id: 'w5-5',
    summary: '초보자가 자주 만나는 OpenCV 오류를 직접 재현하고 고쳐 보며, describe() 로 값을 확인하는 체계적 디버깅과 assert 기반 테스트를 익히고, 체크리스트로 팀 간 코드 리뷰를 진행합니다.',
    goals: [
      'Traceback 과 OpenCV 오류 메시지((-215:Assertion failed) 등)에서 원인을 읽어낼 수 있다',
      '흔한 오류 10가지(None 이미지, 크기 순서, 오버플로, BGR/RGB, 원본 훼손, 자료형, 홀수 커널, 정수 좌표 등)를 알아보고 고칠 수 있다',
      'describe() 로 shape · dtype · min · max 를 확인하며 문제 단계를 좁혀 갈 수 있다',
      '합성 이미지와 assert 로 파이프라인을 자동 점검하는 간단한 테스트를 만들 수 있다',
      '체크리스트에 따라 다른 팀 코드를 리뷰하고 구체적인 피드백을 줄 수 있다',
    ],
    schedule: [['도입: 오류 메시지 읽는 법', 5], ['흔한 오류 재현과 수정', 17], ['디버깅 방법 · 테스트 작성', 10], ['팀 간 코드 리뷰', 13], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 오류 메시지는 “힌트”다</h3>
<p>빨간 오류가 나오면 당황하지 말고 <b>아래에서 위로</b> 읽으세요.</p>
<ol>
  <li><b>맨 아래 줄</b>: 오류 종류와 메시지 — 예) <code>cv2.error: ... (-215:Assertion failed) !_src.empty() in function 'cvtColor'</code></li>
  <li><b>바로 위</b>: 내 코드의 몇 번째 줄(<code>File "main.py", line 12</code>)에서 났는지</li>
  <li><b>메시지 해석</b>: <code>(-215:Assertion failed)</code> 는 “이 조건이 참이어야 하는데 아니었다”는 뜻. 뒤의 조건식이 핵심입니다
    <ul>
      <li><code>!_src.empty()</code> → 입력 이미지가 비어 있음 (대부분 imread 실패 = None)</li>
      <li><code>ksize.width % 2 == 1</code> → 커널 크기가 홀수가 아님</li>
      <li><code>Sizes of input arguments do not match</code> → 두 이미지 크기/채널이 다름</li>
      <li><code>Can't parse 'center'</code> → 좌표에 정수가 아닌 값(실수)이 들어감</li>
      <li><code>CV_8UC1</code> → 8비트 1채널(흑백) 이미지가 필요함</li>
    </ul>
  </li>
</ol>
<p>오류가 <b>안 나는데 결과가 이상한</b> 경우(조용한 버그)가 더 어렵습니다. 이때는 중간 값을 직접 찍어 보는 수밖에 없습니다 → <code>describe()</code>.</p>` },
      { type: 'code', title: '예제 1 · describe(): 이미지 상태를 한 줄로 확인하기', code: String.raw`
import cv2 as cv
import numpy as np


def describe(name, img):
    """이미지(배열)의 상태를 한 줄로 출력한다: shape, dtype, 최솟값, 최댓값, 평균."""
    if img is None:
        print(f'{name:12s} -> None  (imread 실패? 함수가 return 을 안 했나?)')
        return
    a = np.asarray(img)
    if a.size == 0:
        print(f'{name:12s} -> 빈 배열 shape={a.shape}  (슬라이싱 범위 확인)')
        return
    kind = 'gray' if a.ndim == 2 else f'{a.shape[2]}ch'
    print(f'{name:12s} shape={str(a.shape):15s} {kind:5s} dtype={str(a.dtype):8s} '
          f'min={a.min():8.2f} max={a.max():8.2f} mean={a.mean():8.2f}')


img = cv.imread('stuff.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
edges = cv.Canny(blur, 30, 90)
sobel = cv.Sobel(gray, cv.CV_64F, 1, 0)               # 실수 + 음수
mask_bool = gray > 128                                # bool 배열
roi_bad = img[500:600, 0:100]                         # 이미지(세로 480) 밖을 자름 → 빈 배열
missing = cv.imread('stufff.jpg')                     # 오타 → None

for name, im in [('img', img), ('gray', gray), ('blur', blur), ('edges', edges), ('sobel', sobel),
                 ('mask_bool', mask_bool), ('roi_bad', roi_bad), ('missing', missing)]:
    describe(name, im)

print('\n고유값으로 이진 이미지인지 확인:', np.unique(edges)[:10], '/ gray 고유값 개수:', len(np.unique(gray)))
cv.imshow('edges', edges)
`, desc: '<p>출력만 봐도 문제가 보입니다: <code>sobel</code> 은 float64 에 음수가 있어 그대로 imshow 하면 이상하게 보이고, <code>mask_bool</code> 은 bool 이라 표시·마스크로 쓸 수 없으며, <code>roi_bad</code> 는 비어 있고, <code>missing</code> 은 None 입니다. 팀 코드의 단계마다 <code>describe()</code> 를 넣어 보세요.</p>' },
      { type: 'table', head: ['증상 / 메시지', '흔한 원인', '해결'], rows: [
        ['<code>!_src.empty()</code>, NoneType has no attribute', 'imread 파일명 오타 → None', '<code>if img is None:</code> 검사, 파일명 확인'],
        ['이미지가 찌그러짐 / 크기가 뒤바뀜', '<code>cv.resize(img, (h, w))</code>', 'resize 는 (가로, 세로), shape 는 (세로, 가로)'],
        ['밝은 곳이 오히려 어두워짐', 'uint8 덧셈 넘침 <code>img + 50</code>', '<code>cv.add(img, (50, 50, 50, 0))</code> 은 255 에서 멈춤(포화)'],
        ['plt 로 보면 색이 파랗게', 'OpenCV 는 BGR, Matplotlib 은 RGB', '<code>cv.cvtColor(img, cv.COLOR_BGR2RGB)</code>'],
        ['디버그 뷰에 상자가 섞여 있음', '원본에 직접 그림', '<code>out = img.copy()</code> 에 그리기'],
        ['컨투어가 1개(화면 전체)', '흑백(비이진) 이미지로 findContours', 'threshold/Canny 로 이진화 후 호출'],
        ['imshow 결과가 하얗게 됨', 'float 이미지(0~255)를 그대로 표시', '<code>/ 255</code> 또는 <code>astype(np.uint8)</code>, <code>convertScaleAbs</code>'],
        ['<code>Sizes of input arguments do not match</code>', 'bitwise/addWeighted 두 입력의 크기·채널 다름', 'resize, cvtColor 로 맞추기'],
        ['<code>mtype == CV_8U</code>', '마스크가 float/bool', '<code>mask.astype(np.uint8)</code> (bool 은 ×255)'],
        ['<code>ksize.width % 2 == 1</code>', '블러 커널이 짝수', '<code>k = k | 1</code> 또는 <code>2*p+1</code>'],
        ['<code>Can\'t parse \'center\'</code>, <code>npoints &gt; 0</code>', '그리기 좌표가 실수', '<code>int()</code>, <code>np.intp()</code> 로 정수화'],
      ] },
      { type: 'code', title: '예제 2 · 흔한 오류 재현 ① 입력 · 크기 · 커널', code: String.raw`
import cv2 as cv
import numpy as np
import re


def short(e):
    """긴 오류 메시지에서 핵심 부분만 뽑는다."""
    text = str(e)
    if 'error:' in text:
        text = text.split('error:', 1)[1]
    text = re.sub(r"in function '[^\n]*'", '', text)
    lines = [l.strip(' >-') for l in text.splitlines() if l.strip(' >-')]
    return type(e).__name__ + ': ' + ' / '.join(lines[:3])[:220]


def try_it(title, fn):
    """fn 을 실행해 보고 성공/오류를 출력한다 (오류가 나도 프로그램은 계속)."""
    try:
        result = fn()
        shape = getattr(result, 'shape', '')
        print(f'  [OK]    {title} {shape}')
        return result
    except Exception as e:
        print(f'  [ERROR] {title}\n          -> {short(e)}')
        return None


img = cv.imread('stuff.jpg')

print('① imread 가 None 을 돌려주는 경우 (파일명 오타)')
bad = cv.imread('stuf.jpg')
try_it('cvtColor(None)', lambda: cv.cvtColor(bad, cv.COLOR_BGR2GRAY))
print('   고침: if bad is None: 경고 후 다른 입력 사용 ->', 'None 확인됨' if bad is None else '')

print('② (w, h) 와 (h, w) 순서 혼동')
wrong = try_it('cv.resize(img, (240, 320))  # (h, w) 로 착각', lambda: cv.resize(img, (240, 320)))
right = try_it('cv.resize(img, (320, 240))  # (w, h)', lambda: cv.resize(img, (320, 240)))
try_it('np.hstack([wrong, right])  # 세로 크기 다름', lambda: np.hstack([wrong, right]))
try_it('img[480:, :]  -> 빈 ROI 로 cvtColor', lambda: cv.cvtColor(img[480:, :], cv.COLOR_BGR2GRAY))

print('③ 커널 크기는 홀수')
try_it('GaussianBlur(img, (4, 4), 0)', lambda: cv.GaussianBlur(img, (4, 4), 0))
try_it('medianBlur(img, 4)', lambda: cv.medianBlur(img, 4))
k = 4 | 1                                           # 짝수면 1 을 더해 홀수로 (4 -> 5)
try_it(f'GaussianBlur(img, ({k}, {k}), 0)  # 고침', lambda: cv.GaussianBlur(img, (k, k), 0))

cv.imshow('wrong: (240, 320) -> tall image', wrong)
cv.imshow('right: (320, 240)', right)
`, desc: '<p><code>try_it()</code> 은 오류를 “안전하게” 재현하기 위한 도우미입니다. <code>(240, 320)</code> 로 줄인 이미지는 세로로 길쭉하게 찌그러집니다 — 오류는 안 나지만 틀린 <b>조용한 버그</b>입니다.</p>' },
      { type: 'code', title: '예제 3 · 흔한 오류 재현 ② 값의 범위와 자료형', code: String.raw`
import cv2 as cv
import numpy as np
import re


def short(e):
    text = str(e)
    if 'error:' in text:
        text = text.split('error:', 1)[1]
    text = re.sub(r"in function '[^\n]*'", '', text)
    lines = [l.strip(' >-') for l in text.splitlines() if l.strip(' >-')]
    return type(e).__name__ + ': ' + ' / '.join(lines[:3])[:220]


def try_it(title, fn):
    try:
        result = fn()
        print(f'  [OK]    {title}')
        return result
    except Exception as e:
        print(f'  [ERROR] {title}\n          -> {short(e)}')
        return None


img = cv.imread('stuff.jpg')

print('④ uint8 넘침(overflow): 250 + 10 은?')
a = np.full((2, 2), 250, np.uint8)
b = np.full((2, 2), 10, np.uint8)
print('   numpy  a + b      =', (a + b)[0, 0], ' (260 - 256 = 4 로 돌아감)')
print('   OpenCV cv.add(a,b) =', cv.add(a, b)[0, 0], '(255 에서 멈춤 = 포화 연산)')
print('   numpy  10 - 250    =', (b - a)[0, 0], ' / cv.subtract =', cv.subtract(b, a)[0, 0])
bright_np = img + 60                                  # 밝은 곳이 오히려 어두워짐
bright_cv = cv.add(img, (60, 60, 60, 0))

print('⑤ float 이미지 표시: 0~255 실수는 imshow 에서 거의 흰색')
f = img.astype(np.float32)
print('   float 범위:', f.min(), '~', f.max(), '-> imshow 는 실수를 0~1 로 가정')
fixed = f / 255.0                                     # 고침 1: 0~1 로
fixed2 = np.clip(f * 1.2, 0, 255).astype(np.uint8)    # 고침 2: 계산 후 uint8 로

print('⑥ 자료형 · 크기 불일치')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
mask_f = (gray > 128).astype(np.float32)
try_it('bitwise_and(mask=float32 마스크)', lambda: cv.bitwise_and(img, img, mask=mask_f))
mask_u8 = (gray > 128).astype(np.uint8) * 255
try_it('bitwise_and(mask=uint8 마스크)  # 고침', lambda: cv.bitwise_and(img, img, mask=mask_u8))
try_it('addWeighted(컬러, 흑백)', lambda: cv.addWeighted(img, 0.5, gray, 0.5, 0))
try_it('addWeighted(컬러, GRAY2BGR)  # 고침', lambda: cv.addWeighted(img, 0.5, cv.cvtColor(gray, cv.COLOR_GRAY2BGR), 0.5, 0))
small = cv.resize(img, (320, 240))
try_it('addWeighted(640x480, 320x240)', lambda: cv.addWeighted(img, 0.5, small, 0.5, 0))

cv.imshow('img + 60 (numpy overflow)', bright_np)
cv.imshow('cv.add(img, 60)', bright_cv)
cv.imshow('float 0~255 (almost white)', f)
cv.imshow('float / 255 (fixed)', fixed)
`, desc: '<p><code>img + 60</code> 창을 보면 흰 공이 검게 변했습니다 — 255 를 넘은 값이 0 근처로 돌아갔기 때문입니다. 컬러 이미지에 <code>cv.add</code> 로 스칼라를 더할 때는 <code>(60, 60, 60, 0)</code> 처럼 채널별 값을 주세요(숫자 하나면 첫 채널에만 더해짐).</p>' },
      { type: 'code', title: '예제 4 · 흔한 오류 재현 ③ 그리기와 표시', code: String.raw`
import cv2 as cv
import numpy as np
import re
from matplotlib import pyplot as plt


def short(e):
    text = str(e)
    if 'error:' in text:
        text = text.split('error:', 1)[1]
    text = re.sub(r"in function '[^\n]*'", '', text)
    lines = [l.strip(' >-') for l in text.splitlines() if l.strip(' >-')]
    return type(e).__name__ + ': ' + ' / '.join(lines[:3])[:220]


def try_it(title, fn):
    try:
        fn()
        print(f'  [OK]    {title}')
    except Exception as e:
        print(f'  [ERROR] {title}\n          -> {short(e)}')


img = cv.imread('stuff.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
mask = cv.dilate(cv.morphologyEx(cv.Canny(gray, 30, 90), cv.MORPH_CLOSE, kernel, iterations=2), kernel)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
c = max(contours, key=cv.contourArea)                            # 가장 큰 물체 (공)

print('⑦ 원본에 직접 그리면 원본이 망가진다')
original = img.copy()                 # (비교용 보관)
view = img                            # 복사가 아니라 "같은 배열"을 가리키는 이름
cv.rectangle(view, (10, 10), (200, 100), (0, 0, 255), -1)
print('   img 도 바뀌었나?', not np.array_equal(img, original), '-> 고침: view = img.copy()')
img = original                        # 원래대로 되돌리기

print('⑧ 그리기 좌표는 정수여야 한다')
M = cv.moments(c)
cx, cy = M['m10'] / M['m00'], M['m01'] / M['m00']               # 실수!
out = img.copy()
try_it(f'circle(center=({cx:.1f}, {cy:.1f}))', lambda: cv.circle(out, (cx, cy), 8, (0, 0, 255), -1))
try_it('circle(center=(int(cx), int(cy)))  # 고침', lambda: cv.circle(out, (int(cx), int(cy)), 8, (0, 0, 255), -1))
box = cv.boxPoints(cv.minAreaRect(c))                            # float32 꼭짓점
print('   boxPoints dtype:', box.dtype)
try_it('drawContours([box(float32)])', lambda: cv.drawContours(out, [box], -1, (0, 255, 0), 2))
try_it('drawContours([np.intp(box)])  # 고침', lambda: cv.drawContours(out, [np.intp(box)], -1, (0, 255, 0), 2))

print('⑨ Matplotlib 은 RGB 순서')
fig, axes = plt.subplots(1, 2, figsize=(8, 3))
axes[0].imshow(img)
axes[0].set_title('plt.imshow(BGR) - wrong colors')
axes[1].imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))
axes[1].set_title('BGR2RGB - correct')
for ax in axes:
    ax.axis('off')
plt.tight_layout()
plt.show()

cv.imshow('drawing fixed', out)
`, desc: '<p>⑦ 에서 <code>view = img</code> 는 복사가 아니라 <b>같은 이미지에 이름을 하나 더 붙인 것</b>입니다. 그래서 view 에 그리면 img 도 바뀝니다. Matplotlib 왼쪽 그림에서 분홍 라이터가 파랗게 보이는 것도 확인하세요.</p>' },
      { type: 'code', title: '예제 5 · 흔한 오류 재현 ④ findContours 에는 이진 이미지를', code: String.raw`
import cv2 as cv
import numpy as np
import re


def short(e):
    text = str(e)
    if 'error:' in text:
        text = text.split('error:', 1)[1]
    text = re.sub(r"in function '[^\n]*'", '', text)
    lines = [l.strip(' >-') for l in text.splitlines() if l.strip(' >-')]
    return type(e).__name__ + ': ' + ' / '.join(lines[:3])[:220]


img = cv.imread('stuff.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

print('⑩ findContours 입력 종류에 따라')
try:
    cv.findContours(img, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
except Exception as e:
    print('  컬러 입력      -> 오류:', short(e))

cases = {}
cnts, _ = cv.findContours(gray, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
cases['gray (not binary)'] = cnts                    # 0 이 아닌 픽셀은 모두 "물체" → 화면 전체가 하나
edges = cv.Canny(cv.GaussianBlur(gray, (5, 5), 0), 30, 90)
cnts, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
cases['canny only'] = cnts                           # 끊긴 선 조각이 각각 컨투어
kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, kernel, iterations=2), kernel)
cnts, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
cases['canny + close'] = cnts                        # 고침: 이진화 + 끊김 잇기

views = []
for name, cnts in cases.items():
    vis = img.copy()
    cv.drawContours(vis, cnts, -1, (0, 0, 255), 2)
    print(f'  {name:18s} -> 컨투어 {len(cnts):3d}개, 가장 큰 면적 {max(cv.contourArea(c) for c in cnts):9.0f}')
    small = cv.resize(vis, (320, 240))
    cv.putText(small, f'{name}: {len(cnts)}', (8, 22), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    views.append(small)
cv.imshow('findContours input', np.hstack(views))
`, desc: '<p>흑백 원본을 그대로 넣으면 오류는 안 나지만 0 이 아닌 모든 픽셀이 물체로 취급되어 <b>화면 전체가 컨투어 1개</b>가 됩니다. Canny 결과만 넣으면 선 조각마다 컨투어가 생깁니다. 항상 “흰 물체 / 검은 배경”의 깨끗한 이진 마스크를 만든 뒤 호출하세요.</p>' },
      { type: 'text', html: `
<h3>2. 오류를 미리 막는 습관 (방어적 코딩)</h3>
<p>위 오류들은 대부분 <b>“항상 그럴 것”이라고 가정한 값이 가끔 다를 때</b> 납니다. 실제 웹캠·업로드 입력에서는 이런 “가끔”이 자주 옵니다. 함수 입구와 위험한 계산 앞에 짧은 검사를 두세요.</p>
<ul>
  <li><b>입력 검사</b>: <code>if img is None or img.size == 0: return None</code> — 함수 첫 줄에서</li>
  <li><b>빈 리스트</b>: 물체가 하나도 없을 때 <code>max(contours, key=cv.contourArea)</code> 는 <code>ValueError</code> → <code>if contours:</code> 로 먼저 확인</li>
  <li><b>0 으로 나누기</b>: 모멘트 중심 <code>M['m10'] / M['m00']</code> 에서 <code>m00 == 0</code> 인 작은 컨투어가 있음 → <code>if M['m00'] &gt; 0:</code></li>
  <li><b>파라미터 범위</b>: 트랙바 값은 0 이 될 수 있음 → <code>max(1, k) | 1</code>, <code>hi = max(hi, lo + 1)</code></li>
  <li><b>ROI 경계</b>: <code>x1 = max(0, x - pad)</code>, <code>x2 = min(W, x + w + pad)</code> 로 이미지 안으로 자르기</li>
  <li><b>경계에서 assert</b>: 단계 사이에 <code>assert mask.dtype == np.uint8 and mask.ndim == 2</code> 를 두면 잘못된 값이 멀리 퍼지기 전에 멈춤 (개발 중에만, 데모 전에는 안내 메시지로 바꾸기)</li>
</ul>` },
      { type: 'text', html: `
<h3>3. 체계적인 디버깅 5단계</h3>
<ol>
  <li><b>재현</b>: 문제가 나는 입력(이미지, 설정)을 고정한다. 웹캠 문제라면 📸 스냅샷(<code>webcam.png</code>)으로 저장해 이미지로 재현</li>
  <li><b>범위 좁히기</b>: 디버그 뷰와 <code>describe()</code> 로 단계마다 확인해 <b>처음 이상해지는 단계</b>를 찾는다</li>
  <li><b>가설</b>: “Canny 임계값이 높아 라이터 윤곽이 끊긴 것 같다”처럼 구체적으로</li>
  <li><b>한 가지만 수정</b>하고 다시 실행해 확인</li>
  <li><b>재발 방지</b>: 그 경우를 테스트로 남긴다 (아래 예제 6)</li>
</ol>
<p>테스트라고 해서 어렵지 않습니다. <code>assert 조건, '실패 메시지'</code> 는 조건이 거짓이면 AssertionError 를 냅니다. <b>정답을 아는 입력</b>으로 결과를 검사하면 됩니다. 가장 좋은 정답 입력은 <b>직접 그린 합성 이미지</b>입니다 — 원 3개, 사각형 2개를 그렸다면 정답은 확실히 5개입니다.</p>` },
      { type: 'code', title: '예제 6 · assert 로 만드는 간단한 자동 테스트', code: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


# ---------- 테스트할 파이프라인 (팀 코드라고 생각하세요) ----------
def preprocess(img, work_width=480):
    s = work_width / img.shape[1]
    work = cv.resize(img, (work_width, int(round(img.shape[0] * s))), interpolation=cv.INTER_AREA)
    return {'work': work, 'blur': cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0), 'scale': s}


def detect(pre):
    mask = cv.dilate(cv.morphologyEx(cv.Canny(pre['blur'], 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [c for c in contours if 300 <= cv.contourArea(c) <= 40000]


def classify(c):
    area = cv.contourArea(c)
    (_, _), (rw, rh), _ = cv.minAreaRect(c)
    aspect = max(rw, rh) / max(1.0, min(rw, rh))
    circ = 4 * np.pi * area / (cv.arcLength(c, True) ** 2)
    return 'long' if aspect >= 4 else ('round' if circ >= 0.75 else 'box')


# ---------- 정답을 아는 합성 이미지 ----------
def make_test_image():
    img = np.full((480, 640, 3), 200, np.uint8)                      # 밝은 회색 배경
    cv.circle(img, (100, 100), 40, (40, 40, 40), -1)                 # round
    cv.circle(img, (300, 120), 60, (0, 0, 200), -1)                  # round
    cv.rectangle(img, (430, 80), (600, 140), (200, 80, 0), -1)       # box (가로로 긴 직사각형)
    cv.rectangle(img, (80, 300), (400, 330), (30, 30, 30), -1)       # long
    cv.circle(img, (520, 360), 30, (0, 160, 0), -1)                  # round
    return img, {'round': 3, 'box': 1, 'long': 1}


# ---------- 테스트 함수들 ----------
def test_preprocess_shapes():
    for name in ['stuff.jpg', 'smarties.png', 'HappyFish.jpg']:
        pre = preprocess(cv.imread(name))
        assert pre['work'].shape[1] == 480, f'{name}: 작업 폭이 480 이 아님 {pre["work"].shape}'
        assert pre['blur'].ndim == 2 and pre['blur'].dtype == np.uint8, f'{name}: blur 는 uint8 흑백이어야 함'


def test_synthetic_count():
    img, truth = make_test_image()
    n = len(detect(preprocess(img)))
    assert n == sum(truth.values()), f'합성 이미지 개수 {n} != {sum(truth.values())}'


def test_synthetic_shapes():
    img, truth = make_test_image()
    shapes = [classify(c) for c in detect(preprocess(img))]
    for shape, expected in truth.items():
        assert shapes.count(shape) == expected, f'{shape}: {shapes.count(shape)}개 (기대 {expected})'


def test_stuff_jpg():
    n = len(detect(preprocess(cv.imread('stuff.jpg'))))
    assert 4 <= n <= 6, f'stuff.jpg 물체 수 {n} 가 기대 범위(4~6) 밖'


def test_does_not_modify_input():
    img = cv.imread('stuff.jpg')
    before = img.copy()
    detect(preprocess(img))
    assert np.array_equal(img, before), '파이프라인이 입력 이미지를 수정함'


# ---------- 테스트 실행기 ----------
tests = [test_preprocess_shapes, test_synthetic_count, test_synthetic_shapes, test_stuff_jpg, test_does_not_modify_input]
passed = 0
for t in tests:
    try:
        t()
        print(f'PASS  {t.__name__}')
        passed += 1
    except AssertionError as e:
        print(f'FAIL  {t.__name__}: {e}')
    except Exception as e:
        print(f'ERROR {t.__name__}: {type(e).__name__} {e}')
print(f'\n{passed}/{len(tests)} 통과')

img, _ = make_test_image()
for c in detect(preprocess(img, 640)):
    x, y, w, h = cv.boundingRect(c)
    cv.putText(img, classify(c), (x, y - 5), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
cv.imshow('synthetic test image', img)
`, desc: '<p>파라미터를 바꾸거나 코드를 고칠 때마다 이 테스트를 돌리면, 전에 되던 것이 망가졌는지(회귀, regression) 바로 알 수 있습니다. 실제 사진 테스트는 정답을 “범위”로(4~6), 합성 이미지는 “정확히” 검사하는 것이 요령입니다. 참고로 사각형을 <b>정사각형</b>으로 바꿔 보면 <code>test_synthetic_shapes</code> 가 FAIL 합니다 — 정사각형의 원형도는 약 0.785 라 round 기준(0.75)을 넘기 때문입니다. 이렇게 테스트는 규칙의 <b>한계</b>도 드러내 줍니다.</p>' },
      { type: 'text', html: `
<h3>4. 팀 간 코드 리뷰 (Peer Review)</h3>
<p>다른 사람의 눈은 내가 못 보는 버그와 읽기 어려운 부분을 찾아 줍니다. 오늘은 <b>두 팀씩 짝을 지어 서로의 코드를 리뷰</b>합니다.</p>
<ol>
  <li><b>준비 (2분)</b>: 작성 팀이 코드 링크/파일과 “가장 봐 줬으면 하는 부분”을 한 줄로 전달</li>
  <li><b>실행해 보기 (3분)</b>: 리뷰 팀이 직접 실행 — 다른 이미지나 웹캠으로도 돌려 본다</li>
  <li><b>읽으며 체크 (5분)</b>: 아래 체크리스트를 하나씩 확인하고 코멘트를 메모</li>
  <li><b>피드백 전달 (3분)</b>: 좋은 점 1개 → 개선 제안 2~3개 → 질문 1개 순서로</li>
</ol>
<p>작성 팀은 방어하지 말고 <b>메모한 뒤 우선순위</b>를 정해 반영합니다. 리뷰어는 사람이 아니라 <b>코드</b>에 대해 말합니다.</p>` },
      { type: 'checklist', title: '코드 리뷰 체크리스트', items: [
        '[실행] 처음 받은 그대로 ▶ 실행했을 때 오류 없이 돈다 (이미지 입력과 웹캠 입력 모두)',
        '[실행] 샘플이 아닌 다른 이미지(업로드/스냅샷)에서도 오류가 나지 않는다',
        '[구조] load_input / preprocess / detect / analyze / visualize 로 역할이 나뉘어 있다',
        '[구조] 숫자 파라미터가 CONFIG 에 모여 있고, 이름만 보고 의미를 알 수 있다',
        '[안전] imread 결과 None, 빈 ROI, 컨투어 0개 같은 경우를 처리한다',
        '[안전] 원본 이미지에 직접 그리지 않고 copy() 를 쓴다',
        '[정확] resize 크기 순서, 좌표 정수화, 작업 좌표 → 원본 좌표 변환이 맞다',
        '[속도] process 안에 파이썬 픽셀 반복문, 매 프레임 print, 불필요한 객체 생성이 없다',
        '[가독] 함수에 docstring 이 있고 주석이 “왜”를 설명한다',
        '[확인] 디버그 뷰나 테스트로 각 단계를 확인할 방법이 있다',
      ] },
      { type: 'table', head: ['피하고 싶은 코멘트', '좋은 코멘트 (구체적 · 이유 · 제안)'], rows: [
        ['코드가 이상해요', '<code>detect()</code> 에서 <code>cv.resize(img, (h, w))</code> 순서가 바뀐 것 같아요. 세로로 찌그러져서 원이 타원으로 보입니다 → <code>(w, h)</code> 로 바꾸면 어떨까요?'],
        ['너무 느려요', '웹캠에서 FPS 가 5 정도예요. <code>analyze()</code> 의 이중 for 문이 원인 같아요 → <code>cv.mean(roi, mask)</code> 로 바꾸면 빨라질 것 같습니다.'],
        ['숫자가 많네요', '<code>if area &gt; 1234</code> 의 1234 가 무슨 기준인지 모르겠어요 → <code>CONFIG[\'min_area\']</code> 로 옮기고 주석을 달면 튜닝하기 쉬울 것 같아요.'],
        ['잘했네요', '디버그 뷰에 단계별 수치(<code>edges 3.2%</code>)가 있어서 어디서 문제가 생기는지 바로 보였어요. 우리 팀도 따라 하고 싶습니다!'],
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 조용한 버그 3개 찾기',
        desc: `<p>아래 코드는 오류 없이 돌지만 결과가 틀립니다. ① 작업 이미지가 찌그러져 있고, ② <code>original</code> 창에도 상자가 그려져 있으며, ③ 결과 창의 상자가 물체 위치와 맞지 않습니다. 세 곳을 고치세요. 마지막 줄 검사가 모두 <code>True</code> 가 되면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
img = cv.imread('stuff.jpg')
H, W = img.shape[:2]
WORK_W = 320
scale = WORK_W / W

# TODO 버그 ①: 크기 순서
work = cv.resize(img, (int(H * scale), WORK_W), interpolation=cv.INTER_AREA)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

# TODO 버그 ②: 결과 이미지를 따로 만들지 않음
result = img
for c in contours:
    if cv.contourArea(c) < 100:
        continue
    x, y, w, h = cv.boundingRect(c)
    # TODO 버그 ③: 작업 좌표를 그대로 원본에 그림
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 0, 255), 2)

pristine = cv.imread('stuff.jpg')
print('작업 이미지 비율 유지:', work.shape[:2] == (240, 320))
print('원본 보존:', np.array_equal(img, pristine))
print('상자 수:', sum(1 for c in contours if cv.contourArea(c) >= 100))
cv.imshow('original', img)
cv.imshow('result', result)
`,
        hint: `<p>① <code>cv.resize</code> 크기 인자는 (가로, 세로) = <code>(WORK_W, int(H * scale))</code>. ② <code>result = img.copy()</code>. ③ 그리기 전에 <code>int(x / scale)</code> 처럼 원본 좌표로. 고친 뒤 상자 수가 5 개인지도 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
img = cv.imread('stuff.jpg')
H, W = img.shape[:2]
WORK_W = 320
scale = WORK_W / W

work = cv.resize(img, (WORK_W, int(H * scale)), interpolation=cv.INTER_AREA)       # 고침 ①
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

result = img.copy()                                                                 # 고침 ②
for c in contours:
    if cv.contourArea(c) < 100:
        continue
    x, y, w, h = [int(v / scale) for v in cv.boundingRect(c)]                       # 고침 ③
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 0, 255), 2)

pristine = cv.imread('stuff.jpg')
print('작업 이미지 비율 유지:', work.shape[:2] == (240, 320))
print('원본 보존:', np.array_equal(img, pristine))
print('상자 수:', sum(1 for c in contours if cv.contourArea(c) >= 100))
cv.imshow('original', img)
cv.imshow('result', result)
`,
      },
      {
        title: '실습 2 · 오류 4개 고치기',
        desc: `<p>네 개의 코드 조각이 각각 오류를 냅니다(<code>try/except</code> 로 감싸 두어 프로그램은 멈추지 않음). 오류 메시지를 읽고 각 조각을 고쳐 <b>모든 줄에 [OK]</b> 가 나오게 하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('stuff.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
results = {}


def check(title, fn):
    try:
        results[title] = fn()
        print('[OK]   ', title)
    except Exception as e:
        print('[ERROR]', title, '->', str(e).strip().splitlines()[-1][:120])


# TODO 1: 블러 커널
check('blur', lambda: cv.GaussianBlur(gray, (6, 6), 0))

# TODO 2: 무게중심에 원 그리기
M = cv.moments(cv.threshold(gray, 60, 255, cv.THRESH_BINARY_INV)[1])
center = (M['m10'] / M['m00'], M['m01'] / M['m00'])
check('circle', lambda: cv.circle(img.copy(), center, 10, (0, 0, 255), -1))

# TODO 3: 마스크로 밝은 부분만 남기기
mask = gray > 200
check('mask', lambda: cv.bitwise_and(img, img, mask=mask))

# TODO 4: 원본과 흑백을 나란히 붙이기
check('hstack', lambda: np.hstack([img, gray]))

if 'hstack' in results:
    cv.imshow('side by side', results['hstack'])
`,
        hint: `<p>1) 커널은 홀수 (5, 5). 2) <code>(int(center[0]), int(center[1]))</code>. 3) bool 마스크는 <code>mask.astype(np.uint8) * 255</code>. 4) 채널 수를 맞추려면 <code>cv.cvtColor(gray, cv.COLOR_GRAY2BGR)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('stuff.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
results = {}


def check(title, fn):
    try:
        results[title] = fn()
        print('[OK]   ', title)
    except Exception as e:
        print('[ERROR]', title, '->', str(e).strip().splitlines()[-1][:120])


check('blur', lambda: cv.GaussianBlur(gray, (5, 5), 0))

M = cv.moments(cv.threshold(gray, 60, 255, cv.THRESH_BINARY_INV)[1])
center = (int(M['m10'] / M['m00']), int(M['m01'] / M['m00']))
check('circle', lambda: cv.circle(img.copy(), center, 10, (0, 0, 255), -1))

mask = (gray > 200).astype(np.uint8) * 255
check('mask', lambda: cv.bitwise_and(img, img, mask=mask))

check('hstack', lambda: np.hstack([img, cv.cvtColor(gray, cv.COLOR_GRAY2BGR)]))

if 'hstack' in results:
    cv.imshow('side by side', results['hstack'])
if 'mask' in results:
    cv.imshow('bright parts', results['mask'])
`,
      },
      {
        title: '실습 3 · 합성 이미지로 테스트 추가하기',
        desc: `<p><code>count_objects()</code> 를 검사하는 테스트를 늘려 보세요. ① 빈 배경(물체 0개)에서 0 이 나오는지, ② 작은 원(반지름 5, 면적 기준보다 작음)은 세지 않는지, ③ 크기가 다른 이미지(320×240)에서도 동작하는지 검사하는 테스트 함수 3개를 추가하고 실행 목록에 넣으세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def count_objects(img):
    """물체 수를 센다 (작업 해상도 480 기준 면적 300 이상)."""
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)))
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return sum(1 for c in contours if cv.contourArea(c) >= 300)


def blank(w=640, h=480):
    return np.full((h, w, 3), 200, np.uint8)


def test_two_circles():
    img = blank()
    cv.circle(img, (150, 200), 50, (30, 30, 30), -1)
    cv.circle(img, (450, 200), 50, (30, 30, 30), -1)
    assert count_objects(img) == 2, f'2개여야 하는데 {count_objects(img)}개'


# TODO: test_empty, test_tiny_ignored, test_small_image 를 만드세요


tests = [test_two_circles]          # TODO: 새 테스트를 목록에 추가
for t in tests:
    try:
        t()
        print('PASS', t.__name__)
    except AssertionError as e:
        print('FAIL', t.__name__, e)
cv.imshow('blank', blank())
`,
        hint: `<p>빈 배경은 <code>assert count_objects(blank()) == 0</code>. 작은 원은 <code>cv.circle(img, (320, 240), 5, ...)</code> 을 그린 뒤 0 인지 검사. 작은 이미지는 <code>blank(320, 240)</code> 에 원을 그려 1 인지 검사합니다(작업 해상도로 키워서 처리하므로 기준이 유지됨).</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def count_objects(img):
    """물체 수를 센다 (작업 해상도 480 기준 면적 300 이상)."""
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)))
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return sum(1 for c in contours if cv.contourArea(c) >= 300)


def blank(w=640, h=480):
    return np.full((h, w, 3), 200, np.uint8)


def test_two_circles():
    img = blank()
    cv.circle(img, (150, 200), 50, (30, 30, 30), -1)
    cv.circle(img, (450, 200), 50, (30, 30, 30), -1)
    assert count_objects(img) == 2, f'2개여야 하는데 {count_objects(img)}개'


def test_empty():
    n = count_objects(blank())
    assert n == 0, f'빈 배경인데 {n}개'


def test_tiny_ignored():
    img = blank()
    cv.circle(img, (320, 240), 5, (30, 30, 30), -1)
    n = count_objects(img)
    assert n == 0, f'작은 점을 물체로 셈: {n}개'


def test_small_image():
    img = blank(320, 240)
    cv.circle(img, (160, 120), 40, (30, 30, 30), -1)
    n = count_objects(img)
    assert n == 1, f'320x240 에서 {n}개'


tests = [test_two_circles, test_empty, test_tiny_ignored, test_small_image]
for t in tests:
    try:
        t()
        print('PASS', t.__name__)
    except AssertionError as e:
        print('FAIL', t.__name__, e)
cv.imshow('blank', blank())
`,
      },
    ],
    quiz: [
      { q: 'cv.cvtColor 에서 “(-215:Assertion failed) !_src.empty()” 오류가 났습니다. 가장 먼저 의심할 것은?', options: ['색 변환 코드가 틀렸다', '입력 이미지가 비어 있다 (imread 실패로 None 이거나 빈 ROI)', '메모리가 부족하다', 'OpenCV 버전이 낮다'], answer: 1, explain: '!_src.empty() 는 “입력이 비어 있지 않아야 한다”는 조건입니다. 파일명 오타로 imread 가 None 을 돌려주거나 슬라이싱 범위가 이미지 밖일 때 자주 납니다.' },
      { q: 'a, b 가 uint8 배열이고 값이 각각 200, 100 일 때 결과가 옳은 것은?', options: ['a + b = 300', 'a + b = 44, cv.add(a, b) = 255', 'a + b = 255, cv.add(a, b) = 44', '둘 다 255'], answer: 1, explain: 'NumPy 는 모듈로 연산(300-256=44)으로 넘치고, cv.add 는 255 에서 멈추는 포화 연산을 합니다.' },
      { q: 'view = img 후 view 에 사각형을 그렸더니 img 에도 사각형이 생겼습니다. 이유는?', options: ['OpenCV 의 버그', 'view 와 img 가 같은 배열을 가리키기 때문 — copy() 가 필요', 'imshow 를 두 번 불렀기 때문', 'cv.rectangle 이 전역 변수를 바꾸기 때문'], answer: 1, explain: '파이썬에서 대입은 복사가 아니라 이름 붙이기입니다. 독립된 이미지가 필요하면 img.copy() 를 쓰세요.' },
      { q: '파이프라인 테스트용 입력으로 “직접 그린 합성 이미지”가 특히 좋은 이유는?', options: ['실제 사진보다 예쁘다', '정답(개수·모양)을 확실히 알아서 결과를 정확히 검사할 수 있다', '처리 속도가 빨라진다', '웹캠이 필요 없어서'], answer: 1, explain: '원 3개, 사각형 2개를 그렸다면 정답이 명확하므로 assert 로 정확히 검사할 수 있습니다. 실제 사진은 범위로 검사하는 편이 안전합니다.' },
    ],
  },
  // =====================================================================
  // w5-6 결과 정리와 발표 준비
  // =====================================================================
  {
    id: 'w5-6',
    summary: '전후 비교 이미지·결과 몽타주·파이프라인 그림·차트를 코드로 만들어 저장하고, README 와 7분 발표 구성, 데모 비상 대책까지 발표 준비를 마칩니다.',
    goals: [
      '전후 비교 이미지와 여러 입력의 결과 몽타주를 제목과 함께 만들어 imwrite 로 저장할 수 있다',
      '분석 결과를 Matplotlib 막대/선 그래프로 나타내고 그림 파일로 저장할 수 있다',
      'OpenCV 그리기 함수로 발표용 파이프라인 그림을 만들 수 있다',
      'README(보고서)와 7분 발표를 “문제 → 접근 → 파이프라인 → 데모 → 한계 → 배운 점” 구조로 구성할 수 있다',
      '웹캠이 안 될 때를 대비한 데모 비상 대책을 준비할 수 있다',
    ],
    schedule: [['도입: 결과물 목록', 3], ['결과 이미지 · 차트 만들기', 20], ['README · 발표 구성', 12], ['팀별 자료 제작', 12], ['정리 · 퀴즈', 3]],
    blocks: [
      { type: 'text', html: `
<h3>1. 발표 전에 남겨야 할 결과물</h3>
<p>“잘 돌아가요”라는 말보다 <b>한 장의 비교 이미지와 숫자</b>가 훨씬 설득력 있습니다. 코드를 조금만 더 써서 다음 결과물을 자동으로 만들어 두세요.</p>
<ul>
  <li><b>전후 비교(before/after)</b>: 입력과 결과를 나란히 — 발표 첫 슬라이드의 “한 방”</li>
  <li><b>결과 몽타주</b>: 여러 입력(쉬운 것 + 어려운 것)에 대한 결과를 한 장에 — “여러 경우에 동작한다”는 증거</li>
  <li><b>파이프라인 그림</b>: 단계별 중간 결과 썸네일과 화살표 — 접근 방법 설명용</li>
  <li><b>수치와 차트</b>: 개수·정확도·처리 시간 — 튜닝 과정과 성능을 보여 줌</li>
  <li><b>실패 사례</b>: 잘 안 되는 입력과 이유 — 한계와 개선 방향 슬라이드에 사용 (감점이 아니라 이해도의 증거!)</li>
</ul>
<p>웹 실습 환경에서 <code>cv.imwrite('이름.png', img)</code> 를 실행하면 콘솔에 <b>다운로드 링크</b>가 나타납니다. 받아서 발표 자료에 넣으세요.</p>` },
      { type: 'code', title: '예제 1 · 전후 비교 이미지 만들기', code: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def analyze_and_draw(img):
    """책상 물건 분석 결과를 그린 이미지와 물체 수를 돌려준다 (작업 해상도 480)."""
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    out = img.copy()
    n = 0
    for c in contours:
        if 300 <= cv.contourArea(c) <= 40000:
            n += 1
            x, y, w, h = [int(v / s) for v in cv.boundingRect(c)]
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 3)
            cv.putText(out, f'#{n}', (x + 4, y + 24), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out, n


def titled(img, title, color=(60, 60, 60), bar_h=40):
    """이미지 위에 제목 막대를 붙인다."""
    bar = np.full((bar_h, img.shape[1], 3), color, np.uint8)
    cv.putText(bar, title, (12, bar_h - 12), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv.LINE_AA)
    return np.vstack([bar, img])


def before_after(before, after, title_before='BEFORE', title_after='AFTER', gap=60):
    """두 이미지를 같은 높이로 맞춰 제목과 화살표를 넣어 나란히 붙인다."""
    h = 360
    b = cv.resize(before, (int(before.shape[1] * h / before.shape[0]), h))
    a = cv.resize(after, (int(after.shape[1] * h / after.shape[0]), h))
    b, a = titled(b, title_before), titled(a, title_after, (0, 110, 0))
    middle = np.full((b.shape[0], gap, 3), 255, np.uint8)
    cy = b.shape[0] // 2
    cv.arrowedLine(middle, (8, cy), (gap - 8, cy), (0, 0, 0), 4, tipLength=0.4)
    return np.hstack([b, middle, a])


img = cv.imread('stuff.jpg')
result, n = analyze_and_draw(img)
comparison = before_after(img, result, 'BEFORE: input', f'AFTER: {n} objects found')
cv.imwrite('before_after.png', comparison)       # 콘솔에 다운로드 링크가 나타남
print('저장 크기:', comparison.shape)
cv.imshow('before / after', comparison)
`, desc: '<p>두 이미지의 높이를 360 으로 맞춘 뒤 <code>np.hstack</code> 으로 붙였습니다(hstack 은 높이가 같아야 함). 제목 막대에 핵심 숫자(<code>5 objects found</code>)를 넣으면 슬라이드에 설명을 따로 쓰지 않아도 됩니다.</p>' },
      { type: 'code', title: '예제 2 · 여러 입력의 결과 몽타주 (제목 · 캡션 포함)', code: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def analyze_and_draw(img):
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    out, n = img.copy(), 0
    for c in contours:
        if 300 <= cv.contourArea(c) <= 40000:
            n += 1
            x, y, w, h = [int(v / s) for v in cv.boundingRect(c)]
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    return out, n


def fit_cell(img, w, h):
    """비율을 유지하며 w×h 칸에 맞추고 남는 곳은 흰색으로 채운다."""
    s = min(w / img.shape[1], h / img.shape[0])
    small = cv.resize(img, (int(img.shape[1] * s), int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    cell = np.full((h, w, 3), 255, np.uint8)
    y0, x0 = (h - small.shape[0]) // 2, (w - small.shape[1]) // 2
    cell[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    return cell


def montage(items, title, cols=3, cell=(300, 225), caption_h=30, title_h=50):
    """items: [(이미지, 캡션)] → 제목이 있는 결과 몽타주 한 장."""
    cw, ch = cell
    cells = []
    for img, caption in items:
        c = fit_cell(img, cw, ch)
        cap = np.full((caption_h, cw, 3), 245, np.uint8)
        cv.putText(cap, caption, (8, 21), cv.FONT_HERSHEY_SIMPLEX, 0.55, (30, 30, 30), 1, cv.LINE_AA)
        cells.append(cv.copyMakeBorder(np.vstack([c, cap]), 5, 5, 5, 5, cv.BORDER_CONSTANT, value=(255, 255, 255)))
    blank = np.full_like(cells[0], 255)
    while len(cells) % cols:
        cells.append(blank)
    grid = np.vstack([np.hstack(cells[i:i + cols]) for i in range(0, len(cells), cols)])
    head = np.full((title_h, grid.shape[1], 3), (90, 50, 20), np.uint8)
    cv.putText(head, title, (15, 34), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    return np.vstack([head, grid])


items = []
for name, note in [('stuff.jpg', 'easy'), ('cards.png', 'overlap'), ('smarties.png', 'touching'),
                   ('pic1.png', 'shapes'), ('blox.jpg', '3D'), ('water_coins.jpg', 'touching')]:
    result, n = analyze_and_draw(cv.imread(name))
    items.append((result, f'{name}: {n} ({note})'))
    print(f'{name:16s} {n:3d}개')

sheet = montage(items, 'Desk Object Analyzer - results on 6 inputs')
cv.imwrite('result_montage.png', sheet)
cv.imshow('result montage', sheet)
`, desc: '<p>쉬운 입력과 어려운 입력을 섞어 보여 주는 것이 정직하고 설득력 있습니다. 겹친 카드(cards, 0개)나 맞닿은 동전(water_coins, 1개)처럼 물체가 붙어 있으면 하나로 합쳐지거나 면적 필터에 걸리는 한계가 한눈에 보이고, 이것이 “개선 방향(watershed 등)” 슬라이드로 이어집니다.</p>' },
      { type: 'text', html: `
<h3>2. 결과 파일 저장 규칙</h3>
<ul>
  <li><b>파일 이름에 의미를</b>: <code>팀명_번호_단계.png</code> 예) <code>team3_02_edges.png</code> — 번호를 두 자리(<code>02</code>)로 하면 이름순 정렬이 단계 순서와 같아짐</li>
  <li><b>PNG vs JPG</b>: 결과·마스크·그림은 <b>PNG</b>(손실 없음, 선명한 선). 사진을 작게 보낼 때만 JPG (<code>cv.imwrite('a.jpg', img, [cv.IMWRITE_JPEG_QUALITY, 90])</code>)</li>
  <li><b>원본 크기 그대로</b> 저장하고, 줄이는 것은 슬라이드에서</li>
  <li>수치 결과는 <b>CSV 형식</b>으로 콘솔에 출력해 복사하면 스프레드시트에 붙여 넣을 수 있음</li>
</ul>` },
      { type: 'code', title: '예제 3 · 단계별 이미지 일괄 저장 + CSV 출력', code: String.raw`
import cv2 as cv
import numpy as np

TEAM = 'team0'                                  # 팀 이름으로 바꾸세요 (영문)
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))

img = cv.imread('stuff.jpg')
s = 480 / img.shape[1]
work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
edges = cv.Canny(blur, 30, 90)
mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
objects = [c for c in contours if 300 <= cv.contourArea(c) <= 40000]
result = work.copy()
for i, c in enumerate(objects, 1):
    x, y, w, h = cv.boundingRect(c)
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(result, str(i), (x + 3, y + 18), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

# 단계 이름과 이미지를 순서대로 — 이 딕셔너리만 팀 파이프라인에 맞게 바꾸면 된다
stages = {'input': work, 'blur': blur, 'edges': edges, 'mask': mask, 'result': result}
for i, (name, im) in enumerate(stages.items(), 1):
    filename = f'{TEAM}_{i:02d}_{name}.png'
    ok = cv.imwrite(filename, im)
    print('저장' if ok else '실패', filename, im.shape)

# 물체별 수치를 CSV 로 출력 (복사해서 스프레드시트에 붙여 넣기)
print('\nid,x,y,w,h,area,aspect')
for i, c in enumerate(objects, 1):
    x, y, w, h = cv.boundingRect(c)
    (_, _), (rw, rh), _ = cv.minAreaRect(c)
    aspect = max(rw, rh) / max(1.0, min(rw, rh))
    print(f'{i},{int(x / s)},{int(y / s)},{int(w / s)},{int(h / s)},{cv.contourArea(c) / s / s:.0f},{aspect:.2f}')

cv.imshow('saved result', result)
`, desc: '<p>좌표와 면적은 원본 해상도 기준으로 되돌려 출력했습니다. 저장한 파일은 같은 실행 환경에서 <code>cv.imread(\'team0_05_result.png\')</code> 로 다시 읽을 수도 있습니다.</p>' },
      { type: 'text', html: `
<h3>3. 숫자는 차트로</h3>
<p>표보다 차트가 빨리 읽힙니다. 무엇을 보여 줄지에 따라 차트 종류를 고르세요. (Matplotlib 제목·라벨은 영어로)</p>` },
      { type: 'table', head: ['보여 주고 싶은 것', '차트', 'Matplotlib'], rows: [
        ['종류별 개수 (색, 모양, 클래스)', '막대그래프', '<code>plt.bar(names, counts)</code>'],
        ['물체별 크기 비교', '가로 막대', '<code>plt.barh(labels, areas)</code>'],
        ['파라미터에 따른 정확도 변화', '선 그래프 + 최적점 표시', '<code>plt.plot(x, y, "o-")</code>, <code>plt.axvline(best)</code>'],
        ['단계별 처리 시간 비율', '가로 막대(누적)', '<code>plt.barh(stages, ms)</code>'],
        ['시간에 따른 값 (개수 흔들림)', '선 그래프', '<code>plt.plot(frames, counts)</code>'],
      ] },
      { type: 'code', title: '예제 4 · 분석 결과를 막대그래프로', code: String.raw`
import cv2 as cv
import numpy as np
from collections import Counter
from matplotlib import pyplot as plt

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def color_name(h, s, v):
    if v < 90:
        return 'dark'
    if s < 40:
        return 'white' if v > 200 else 'gray'
    if h < 10 or h >= 160:
        return 'red'
    return 'pink' if h >= 130 else 'other'


def analyze(img):
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    hsv = cv.cvtColor(work, cv.COLOR_BGR2HSV)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = []
    for c in contours:
        area = cv.contourArea(c)
        if not 300 <= area <= 40000:
            continue
        x, y, w, h = cv.boundingRect(c)
        m = np.zeros((h, w), np.uint8)
        cv.drawContours(m, [c], -1, 255, -1, offset=(-x, -y))
        mh, ms, mv, _ = cv.mean(hsv[y:y + h, x:x + w], mask=cv.erode(m, KERNEL))
        (_, _), (rw, rh), _ = cv.minAreaRect(c)
        aspect = max(rw, rh) / max(1.0, min(rw, rh))
        circ = 4 * np.pi * area / (cv.arcLength(c, True) ** 2)
        objects.append({'id': len(objects) + 1, 'area': area / s / s, 'color': color_name(mh, ms, mv),
                        'shape': 'long' if aspect >= 4 else ('round' if circ >= 0.75 else 'box')})
    return objects


objects = analyze(cv.imread('stuff.jpg'))
shape_counts = Counter(o['shape'] for o in objects)
color_counts = Counter(o['color'] for o in objects)
bar_colors = {'dark': '#333333', 'white': '#dddddd', 'gray': '#999999', 'red': '#d62728', 'pink': '#e377c2', 'other': '#1f77b4'}

fig, axes = plt.subplots(1, 3, figsize=(11, 3.4))
axes[0].bar(list(shape_counts.keys()), list(shape_counts.values()), color='tab:blue')
axes[0].set_title('Objects by shape')
axes[0].set_ylabel('count')

names = list(color_counts.keys())
axes[1].bar(names, [color_counts[n] for n in names], color=[bar_colors[n] for n in names], edgecolor='black')
axes[1].set_title('Objects by color')

objs = sorted(objects, key=lambda o: o['area'])
axes[2].barh([f'#{o["id"]} {o["color"]} {o["shape"]}' for o in objs], [o['area'] for o in objs], color='tab:green')
axes[2].set_title('Area per object (px)')
for ax in axes[:2]:
    ax.set_yticks(range(0, max(max(shape_counts.values()), max(color_counts.values())) + 2))
plt.tight_layout()
plt.show()
print('모양별:', dict(shape_counts), '/ 색별:', dict(color_counts))
`, desc: '<p>색 막대는 실제 색과 비슷한 색으로 칠하면 범례가 필요 없습니다. 개수 축은 정수 눈금으로 맞췄습니다. 여러 이미지를 분석해 합산하면 “데이터셋 전체 통계” 차트도 같은 방법으로 만들 수 있습니다.</p>' },
      { type: 'code', title: '예제 5 · 파라미터 vs 정확도 그래프를 그림 파일로 저장', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
# 정답(직접 센 물체 수)이 있는 시험 이미지들
DATASET = {'stuff.jpg': 5, 'pic1.png': 6}


def count_objects(img, canny_lo):
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, canny_lo, canny_lo * 3), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return sum(1 for c in contours if 300 <= cv.contourArea(c) <= 40000)


images = {name: cv.imread(name) for name in DATASET}
values = list(range(5, 161, 10))
scores = []
for lo in values:
    # 이미지마다 "정답과의 차이"를 점수로: 1 - |n - 정답| / 정답 (0 미만은 0)
    per_image = [max(0.0, 1 - abs(count_objects(images[n], lo) - t) / t) for n, t in DATASET.items()]
    scores.append(float(np.mean(per_image)))
top = [v for v, sc in zip(values, scores) if sc == max(scores)]    # 최고 점수인 값들
best = top[len(top) // 2]                                          # 그 구간의 가운데 값 (더 안정적)
print('canny_lo 별 점수:', dict(zip(values, [round(v, 2) for v in scores])))
print('최고 점수 구간:', top, '-> 가운데 값 canny_lo =', best)

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(values, scores, 'o-', color='tab:blue', label='mean count accuracy')
ax.axvline(best, color='tab:red', linestyle='--', label=f'best = {best}')
ax.set_xlabel('canny_lo  (canny_hi = 3 x lo)')
ax.set_ylabel('accuracy (0-1)')
ax.set_ylim(0, 1.05)
ax.set_title('Parameter sweep on 2 labeled images')
ax.grid(alpha=0.3)
ax.legend()
fig.tight_layout()

# 그림을 이미지 배열로 바꿔 cv.imwrite 로 저장 → 다운로드 링크
fig.canvas.draw()
chart = cv.cvtColor(np.asarray(fig.canvas.buffer_rgba()), cv.COLOR_RGBA2BGR)
cv.imwrite('chart_param_sweep.png', chart)
plt.show()
`, desc: '<p>점수가 같은 구간이 넓으면 그 <b>가운데 값</b>을 고릅니다(끝 값은 조금만 조건이 바뀌어도 성능이 떨어지기 쉬움). 정답을 아는 이미지 여러 장으로 점수를 매기면 “감으로 고른 값”이 아니라 <b>근거 있는 값</b>이 됩니다. 발표에서 “canny_lo 를 왜 30 으로 했나요?”라는 질문에 이 그래프 한 장으로 답할 수 있습니다. <code>fig.canvas.buffer_rgba()</code> 로 그림을 배열로 바꾸면 <code>cv.imwrite</code> 로 저장해 내려받을 수 있습니다.</p>' },
      { type: 'code', title: '예제 6 · 발표용 파이프라인 그림 그리기', code: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def to_bgr(im):
    return cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im


def pipeline_figure(stages, title, thumb=(180, 135), gap=50, margin=20):
    """stages: [(단계 이름, 설명, 이미지)] → 썸네일 + 화살표 + 설명이 있는 그림."""
    tw, th = thumb
    n = len(stages)
    W = margin * 2 + n * tw + (n - 1) * gap
    H = 60 + th + 80
    canvas = np.full((H, W, 3), 255, np.uint8)
    cv.putText(canvas, title, (margin, 38), cv.FONT_HERSHEY_SIMPLEX, 0.9, (40, 40, 40), 2, cv.LINE_AA)
    top = 60
    for i, (name, detail, im) in enumerate(stages):
        x = margin + i * (tw + gap)
        canvas[top:top + th, x:x + tw] = cv.resize(to_bgr(im), (tw, th), interpolation=cv.INTER_AREA)
        cv.rectangle(canvas, (x - 1, top - 1), (x + tw, top + th), (120, 120, 120), 1)
        cv.putText(canvas, f'{i + 1}. {name}', (x, top + th + 25), cv.FONT_HERSHEY_SIMPLEX, 0.55, (150, 60, 0), 2, cv.LINE_AA)
        cv.putText(canvas, detail, (x, top + th + 48), cv.FONT_HERSHEY_SIMPLEX, 0.42, (80, 80, 80), 1, cv.LINE_AA)
        if i < n - 1:                                   # 다음 단계로 화살표
            ay = top + th // 2
            cv.arrowedLine(canvas, (x + tw + 8, ay), (x + tw + gap - 8, ay), (0, 120, 255), 3, tipLength=0.35)
    return canvas


img = cv.imread('stuff.jpg')
s = 480 / img.shape[1]
work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
edges = cv.Canny(blur, 30, 90)
mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
kept = [c for c in contours if 300 <= cv.contourArea(c) <= 40000]
result = work.copy()
for c in kept:
    x, y, w, h = cv.boundingRect(c)
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 3)

fig = pipeline_figure([
    ('Input', 'resize to 480px', work),
    ('Gray + Blur', 'Gaussian 5x5', blur),
    ('Canny', 'thresholds 30 / 90', edges),
    ('Close + Dilate', 'ellipse 5x5, iter 2', mask),
    ('Result', f'area filter -> {len(kept)} objects', result),
], 'Pipeline: Desk Object Analyzer')
cv.imwrite('pipeline_figure.png', fig)
cv.imshow('pipeline figure', fig)
`, desc: '<p>슬라이드 도구로 상자와 화살표를 그리는 것보다, 실제 중간 결과가 들어간 그림을 코드로 만드는 편이 빠르고 정확합니다. 파라미터를 바꾸면 그림도 자동으로 최신 상태가 됩니다.</p>' },
      { type: 'text', html: `
<h3>4. README(보고서) 구조</h3>
<p>코드와 함께 제출할 README 는 “처음 보는 사람이 5분 안에 이해하고 실행할 수 있게” 쓰는 것이 목표입니다.</p>` },
      { type: 'table', head: ['섹션', '쓸 내용', '분량 · 팁'], rows: [
        ['1. 프로젝트 이름 · 팀원', '한 줄 소개 + 역할 분담', '대표 결과 이미지(before_after.png) 1장'],
        ['2. 문제 정의', '무엇을, 왜, 어떤 환경(입력)에서', '3~5문장. “누가 쓰면 좋은가”'],
        ['3. 접근 방법', '파이프라인 그림 + 단계별 사용 함수와 이유', '“Otsu 대신 Canny 를 쓴 이유: 조명 불균일” 같은 근거'],
        ['4. 실행 방법', '입력 준비, 실행 순서, 조작법(트랙바·마우스)', '처음 보는 사람이 그대로 따라 할 수 있게'],
        ['5. 결과', '몽타주, 차트, 수치(정확도·FPS)', '잘 된 것 + 잘 안 된 것 모두'],
        ['6. 한계와 개선 방향', '실패 사례와 원인, 다음에 해 볼 방법', '구체적으로 (예: 맞닿은 물체 → watershed)'],
        ['7. 배운 점 · 참고 자료', '팀원별 한 줄 소감, 참고한 튜토리얼 링크', 'OpenCV 문서 링크 포함'],
      ] },
      { type: 'text', html: `
<h3>5. 7분 발표 구성</h3>
<p>발표는 <b>이야기</b>입니다: 어떤 문제가 있었고 → 어떻게 접근했고 → 실제로 되는지 보여 주고 → 무엇이 부족하며 → 무엇을 배웠는지. 슬라이드는 8장 안팎이면 충분합니다.</p>` },
      { type: 'table', head: ['순서', '슬라이드', '내용', '시간'], rows: [
        ['1', '표지 + 한 장 요약', '프로젝트 이름, 팀원, before/after 이미지 한 장', '0:30'],
        ['2', '문제', '무엇을 자동화하고 싶었나? 왜 필요한가?', '0:40'],
        ['3', '접근', '고려한 방법들과 선택한 방법 · 이유 (비교 이미지)', '1:00'],
        ['4', '파이프라인 그림', '단계별 중간 결과 썸네일 + 핵심 함수·파라미터', '1:00'],
        ['5', '라이브 데모', '웹캠/동영상으로 실행, 트랙바·클릭 조작 시연', '2:00'],
        ['6', '결과 · 수치', '몽타주, 정확도·FPS 차트', '0:40'],
        ['7', '한계 · 개선', '실패 사례 1~2개와 원인, 개선 아이디어', '0:40'],
        ['8', '배운 점', '팀원별 한 줄, 감사', '0:30'],
      ] },
      { type: 'warn', html: `<p><b>데모는 반드시 실패할 수 있다고 가정하세요.</b> 발표장 조명, 카메라 권한, 네트워크, 브라우저 차이로 웹캠 데모가 안 되는 일이 흔합니다.</p>
<ul>
  <li><b>대체 입력 준비</b>: 📸 스냅샷(<code>webcam.png</code>)과 업로드한 테스트 이미지 2~3장을 미리 확인해 두고, 이미지 입력으로도 같은 코드가 도는지 점검</li>
  <li><b>동영상 백업</b>: 리허설 때 팀 주제에 맞는 짧은 영상(10~20초)을 찍어 업로드해 두면, 웹캠이 안 될 때 입력 소스만 🎞️ 동영상으로 바꿔 <b>실시간 처리 데모를 그대로</b> 보여 줄 수 있음</li>
  <li><b>결과 이미지 백업</b>: before_after, 몽타주, 파이프라인 그림을 슬라이드에 넣어 두기 (최후의 보루)</li>
  <li><b>리허설</b>: 발표 PC/브라우저에서 한 번 이상, 시간을 재며 — 7분을 넘기면 데모 시간을 줄이기</li>
  <li><b>시작 상태 고정</b>: 트랙바 기본값을 최적값으로, 코드 첫 화면에 조작법 안내 문구</li>
</ul>` },
      { type: 'checklist', title: '발표 준비 체크리스트', items: [
        'before_after.png, result_montage.png, pipeline_figure.png 를 저장해 받았다',
        '정확도 또는 처리 시간을 보여 주는 차트가 1개 이상 있다',
        '실패 사례 이미지와 원인 설명을 준비했다',
        'README 7개 섹션을 작성했다',
        '8장 안팎의 슬라이드를 7분 안에 발표하는 리허설을 했다',
        '웹캠 없이도 데모할 수 있는 이미지 · 동영상 백업이 있다',
        '발표 PC 의 브라우저에서 코드가 오류 없이 도는 것을 확인했다',
        '팀원별 발표 담당 부분과 질의응답 담당을 정했다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 우리 팀 전후 비교 이미지 만들기',
        desc: `<p>템플릿의 <code>my_pipeline()</code> 을 팀 프로젝트의 처리로 바꾸고(지금은 예시로 카툰 느낌 필터), 제목 문구를 팀 결과에 맞게 고친 뒤 <code>before_after.png</code> 로 저장하세요. 입력은 오른쪽 패널에서 고른 이미지(<code>webcv.get_input()</code>)입니다. 두 이미지 높이가 달라도 붙도록 <code>before_after()</code> 의 TODO 를 완성하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import webcv


def my_pipeline(img):
    """TODO: 팀 프로젝트의 처리로 바꾸세요. 결과 이미지와 요약 문구를 돌려줍니다."""
    color = cv.bilateralFilter(img, 9, 75, 75)
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    out = cv.bitwise_and(color, color, mask=edges)
    return out, 'cartoon effect'


def titled(img, title, color):
    bar = np.full((40, img.shape[1], 3), color, np.uint8)
    cv.putText(bar, title, (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
    return np.vstack([bar, img])


def before_after(before, after, t1, t2):
    # TODO: 두 이미지를 높이 360 으로 맞추세요 (비율 유지)
    b = before
    a = cv.resize(after, (before.shape[1], before.shape[0]))
    b, a = titled(b, t1, (60, 60, 60)), titled(a, t2, (0, 110, 0))
    gap = np.full((b.shape[0], 20, 3), 255, np.uint8)
    return np.hstack([b, gap, a])


img = webcv.get_input()
result, summary = my_pipeline(img)
sheet = before_after(img, result, 'BEFORE', 'AFTER: ' + summary)
cv.imwrite('before_after.png', sheet)
cv.imshow('before_after', sheet)
`,
        hint: `<p>높이를 h 로 맞출 때 새 가로 = <code>int(img.shape[1] * h / img.shape[0])</code>. 두 이미지 모두 <code>cv.resize(img, (새가로, h))</code> 하면 <code>np.hstack</code> 조건(높이 같음)을 만족합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import webcv


def my_pipeline(img):
    """팀 프로젝트의 처리 (예시: 카툰 필터). 결과 이미지와 요약 문구를 돌려준다."""
    color = cv.bilateralFilter(img, 9, 75, 75)
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    out = cv.bitwise_and(color, color, mask=edges)
    return out, 'cartoon effect'


def titled(img, title, color):
    bar = np.full((40, img.shape[1], 3), color, np.uint8)
    cv.putText(bar, title, (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
    return np.vstack([bar, img])


def fit_height(img, h):
    return cv.resize(img, (int(img.shape[1] * h / img.shape[0]), h), interpolation=cv.INTER_AREA)


def before_after(before, after, t1, t2, h=360):
    b, a = fit_height(before, h), fit_height(after, h)
    b, a = titled(b, t1, (60, 60, 60)), titled(a, t2, (0, 110, 0))
    gap = np.full((b.shape[0], 20, 3), 255, np.uint8)
    return np.hstack([b, gap, a])


img = webcv.get_input()
result, summary = my_pipeline(img)
sheet = before_after(img, result, 'BEFORE', 'AFTER: ' + summary)
cv.imwrite('before_after.png', sheet)
print('저장:', sheet.shape)
cv.imshow('before_after', sheet)
`,
      },
      {
        title: '실습 2 · 여러 이미지 통계 차트',
        desc: `<p>세 이미지(<code>stuff.jpg</code>, <code>pic1.png</code>, <code>blox.jpg</code>)에서 물체 수와 처리 시간(ms)을 재어, <b>왼쪽은 이미지별 물체 수 막대</b>, <b>오른쪽은 이미지별 처리 시간 막대</b>인 차트 한 장을 만드세요. 막대 위에 값을 글자로 표시하면 더 좋습니다(<code>ax.text</code>). 차트를 <code>chart_stats.png</code> 로도 저장하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time
from matplotlib import pyplot as plt

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def count_objects(img):
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return sum(1 for c in contours if 300 <= cv.contourArea(c) <= 40000)


names = ['stuff.jpg', 'pic1.png', 'blox.jpg']
counts, times = [], []
for n in names:
    img = cv.imread(n)
    # TODO 1: time.perf_counter 로 count_objects 시간을 재서 times 에 ms 로 추가
    counts.append(count_objects(img))
    times.append(0.0)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.2))
ax1.bar(names, counts)
ax1.set_title('Objects per image')
# TODO 2: ax2 에 처리 시간 막대, 제목 'Processing time (ms)'
# TODO 3: 막대 위에 값 표시 (ax.text), chart_stats.png 로 저장
plt.tight_layout()
plt.show()
`,
        hint: `<p>막대 위 글자: <code>for i, v in enumerate(counts): ax1.text(i, v, str(v), ha='center', va='bottom')</code>. 저장은 <code>fig.canvas.draw()</code> → <code>np.asarray(fig.canvas.buffer_rgba())</code> → <code>cv.cvtColor(..., cv.COLOR_RGBA2BGR)</code> → <code>cv.imwrite</code>. 저장은 <code>plt.show()</code> 전에 하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time
from matplotlib import pyplot as plt

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def count_objects(img):
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return sum(1 for c in contours if 300 <= cv.contourArea(c) <= 40000)


names = ['stuff.jpg', 'pic1.png', 'blox.jpg']
counts, times = [], []
for n in names:
    img = cv.imread(n)
    count_objects(img)                                  # 준비 호출 (측정 제외)
    t0 = time.perf_counter()
    counts.append(count_objects(img))
    times.append((time.perf_counter() - t0) * 1000)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.2))
ax1.bar(names, counts, color='tab:blue')
ax1.set_title('Objects per image')
ax2.bar(names, times, color='tab:orange')
ax2.set_title('Processing time (ms)')
for i, v in enumerate(counts):
    ax1.text(i, v, str(v), ha='center', va='bottom')
for i, v in enumerate(times):
    ax2.text(i, v, f'{v:.1f}', ha='center', va='bottom')
ax1.set_ylim(0, max(counts) + 2)
ax2.set_ylim(0, max(times) * 1.3)
plt.tight_layout()
fig.canvas.draw()
chart = cv.cvtColor(np.asarray(fig.canvas.buffer_rgba()), cv.COLOR_RGBA2BGR)
cv.imwrite('chart_stats.png', chart)
plt.show()
`,
      },
      {
        title: '실습 3 · 우리 팀 파이프라인 그림',
        desc: `<p>예제 6 의 <code>pipeline_figure()</code> 를 이용해 <b>팀 프로젝트의 단계</b>로 그림을 만드세요. 지금은 “색 추적” 파이프라인 예시(입력 → HSV → inRange 마스크 → 열기 연산 → 결과)가 3단계만 들어 있습니다. 빠진 단계를 추가해 5단계 그림을 완성하고 <code>pipeline_figure.png</code> 로 저장하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np


def to_bgr(im):
    return cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im


def pipeline_figure(stages, title, thumb=(180, 135), gap=50, margin=20):
    tw, th = thumb
    n = len(stages)
    canvas = np.full((60 + th + 80, margin * 2 + n * tw + (n - 1) * gap, 3), 255, np.uint8)
    cv.putText(canvas, title, (margin, 38), cv.FONT_HERSHEY_SIMPLEX, 0.9, (40, 40, 40), 2, cv.LINE_AA)
    for i, (name, detail, im) in enumerate(stages):
        x = margin + i * (tw + gap)
        canvas[60:60 + th, x:x + tw] = cv.resize(to_bgr(im), (tw, th))
        cv.putText(canvas, f'{i + 1}. {name}', (x, 60 + th + 25), cv.FONT_HERSHEY_SIMPLEX, 0.55, (150, 60, 0), 2, cv.LINE_AA)
        cv.putText(canvas, detail, (x, 60 + th + 48), cv.FONT_HERSHEY_SIMPLEX, 0.42, (80, 80, 80), 1, cv.LINE_AA)
        if i < n - 1:
            cv.arrowedLine(canvas, (x + tw + 8, 60 + th // 2), (x + tw + gap - 8, 60 + th // 2), (0, 120, 255), 3, tipLength=0.35)
    return canvas


img = cv.imread('stuff.jpg')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
mask = cv.inRange(hsv, (140, 40, 60), (179, 255, 255))            # 분홍 라이터
opened = cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((5, 5), np.uint8))
result = img.copy()
contours, _ = cv.findContours(opened, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
if contours:
    x, y, w, h = cv.boundingRect(max(contours, key=cv.contourArea))
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 4)

stages = [
    ('Input', 'BGR 640x480', img),
    ('inRange', 'H 140-179', mask),
    ('Result', 'largest contour', result),
    # TODO: 'HSV' 단계(두 번째)와 'Open' 단계(네 번째)를 알맞은 위치에 추가하세요
]
fig = pipeline_figure(stages, 'Pipeline: Color Tracker')
cv.imshow('pipeline', fig)
`,
        hint: `<p>리스트에 <code>('HSV', 'cvtColor BGR2HSV', hsv)</code> 를 두 번째에, <code>('Open', 'kernel 5x5', opened)</code> 를 네 번째에 넣으세요. HSV 이미지는 그대로 보여도 되고(색이 이상하게 보이는 것이 정상), 저장은 <code>cv.imwrite('pipeline_figure.png', fig)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np


def to_bgr(im):
    return cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im


def pipeline_figure(stages, title, thumb=(180, 135), gap=50, margin=20):
    tw, th = thumb
    n = len(stages)
    canvas = np.full((60 + th + 80, margin * 2 + n * tw + (n - 1) * gap, 3), 255, np.uint8)
    cv.putText(canvas, title, (margin, 38), cv.FONT_HERSHEY_SIMPLEX, 0.9, (40, 40, 40), 2, cv.LINE_AA)
    for i, (name, detail, im) in enumerate(stages):
        x = margin + i * (tw + gap)
        canvas[60:60 + th, x:x + tw] = cv.resize(to_bgr(im), (tw, th))
        cv.putText(canvas, f'{i + 1}. {name}', (x, 60 + th + 25), cv.FONT_HERSHEY_SIMPLEX, 0.55, (150, 60, 0), 2, cv.LINE_AA)
        cv.putText(canvas, detail, (x, 60 + th + 48), cv.FONT_HERSHEY_SIMPLEX, 0.42, (80, 80, 80), 1, cv.LINE_AA)
        if i < n - 1:
            cv.arrowedLine(canvas, (x + tw + 8, 60 + th // 2), (x + tw + gap - 8, 60 + th // 2), (0, 120, 255), 3, tipLength=0.35)
    return canvas


img = cv.imread('stuff.jpg')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
mask = cv.inRange(hsv, (140, 40, 60), (179, 255, 255))
opened = cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((5, 5), np.uint8))
result = img.copy()
contours, _ = cv.findContours(opened, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
if contours:
    x, y, w, h = cv.boundingRect(max(contours, key=cv.contourArea))
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 4)

stages = [
    ('Input', 'BGR 640x480', img),
    ('HSV', 'cvtColor BGR2HSV', hsv),
    ('inRange', 'H 140-179', mask),
    ('Open', 'kernel 5x5', opened),
    ('Result', 'largest contour', result),
]
fig = pipeline_figure(stages, 'Pipeline: Color Tracker')
cv.imwrite('pipeline_figure.png', fig)
cv.imshow('pipeline', fig)
`,
      },
    ],
    quiz: [
      { q: '높이가 다른 두 이미지를 np.hstack 으로 나란히 붙이려 합니다. 올바른 준비는?', options: ['가로 길이를 같게 맞춘다', '높이(세로)를 같게 맞춘다 (채널 수도 같게)', 'dtype 을 float 로 바꾼다', '아무 준비 없이 가능하다'], answer: 1, explain: 'hstack 은 가로로 이어 붙이므로 세로 크기와 채널 수가 같아야 합니다. vstack 은 반대로 가로 크기가 같아야 합니다.' },
      { q: '결과 마스크 이미지와 그래프를 저장할 파일 형식으로 가장 알맞은 것은?', options: ['JPG — 용량이 작아서', 'PNG — 손실 없이 선명한 선과 색 경계를 보존해서', 'BMP — 가장 호환성이 좋아서', '아무거나 같다'], answer: 1, explain: 'JPG 는 손실 압축이라 경계가 번지고 마스크 값(0/255)이 바뀔 수 있습니다. 결과·마스크·차트는 PNG 가 적합합니다.' },
      { q: '7분 발표에서 라이브 데모에 대한 가장 좋은 준비는?', options: ['웹캠 데모만 준비하고 안 되면 사과한다', '동영상·이미지 입력으로도 같은 코드가 돌게 하고, 결과 이미지를 슬라이드에 백업해 둔다', '데모 없이 코드만 보여 준다', '발표 직전에 처음 실행해 본다'], answer: 1, explain: '발표장 환경에서는 웹캠이 실패하는 경우가 많습니다. 동영상/이미지 입력과 결과 이미지 백업, 사전 리허설이 필수입니다.' },
    ],
  },
  // =====================================================================
  // w5-7 프로젝트 발표회
  // =====================================================================
  {
    id: 'w5-7',
    summary: '팀 프로젝트 발표회 날입니다. 진행 순서와 7분 발표 형식, 라이브 데모 점검, 질의응답 요령을 확인하고, 루브릭으로 동료 평가를 합니다. 팀 데모용 “쇼케이스” 화면 템플릿도 제공합니다.',
    goals: [
      '정해진 7분 형식에 맞춰 문제 · 접근 · 데모 · 한계 · 배운 점을 전달할 수 있다',
      '라이브 데모 전 점검 목록으로 실패 위험을 줄이고, 실패 시 백업으로 전환할 수 있다',
      '루브릭의 기준에 따라 다른 팀의 발표를 공정하게 평가하고 구체적인 피드백을 쓸 수 있다',
      '쇼케이스 템플릿으로 타이틀 카드 · 전후 비교 · 파이프라인 단계를 한 화면에 보여 줄 수 있다',
    ],
    schedule: [['준비 · 장비 점검', 4], ['팀 발표와 질의응답 (팀당 7분 + 2분)', 36], ['동료 평가 작성 · 제출', 5], ['강사 총평', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 오늘의 진행</h3>
<p>한 팀당 <b>발표 7분 + 질의응답 2분</b>, 교대 1분입니다. 4팀 기준으로 이번 교시 안에 끝나며, 팀이 더 많으면 w5-8 앞부분에서 이어서 발표합니다(또는 강사 안내에 따라 5분 + 2분 형식).</p>
<ul>
  <li><b>발표 순서</b>는 시작 전에 추첨합니다. 다음 순서 팀은 앞 팀이 질의응답을 하는 동안 노트북·브라우저를 준비합니다.</li>
  <li><b>타임키퍼</b>(강사 또는 지정 학생)가 5분에 🟡, 7분에 🔴 신호를 줍니다. 7분이 되면 결론으로 넘어가세요.</li>
  <li><b>청중</b>은 발표마다 아래 동료 평가표를 채웁니다 — 발표가 끝난 직후 1분 안에 작성하는 것이 가장 정확합니다.</li>
  <li>모든 팀원이 발표 또는 데모 조작 중 한 부분 이상을 맡습니다 (4주차 팀 규칙).</li>
</ul>` },
      { type: 'table', head: ['구간', '시간', '내용', '팁'], rows: [
        ['① 표지 · 한 장 요약', '0:00 ~ 0:30', '프로젝트 이름, 팀원, before/after 한 장', '첫 30초에 “무엇을 만들었는지” 보여 주기'],
        ['② 문제', '0:30 ~ 1:10', '무엇을, 왜, 어떤 입력에서', '청중이 공감할 사례 하나'],
        ['③ 접근 · 파이프라인', '1:10 ~ 3:10', '선택한 방법과 이유, 단계 그림', '비교 이미지로 “왜 이 방법인지” 근거'],
        ['④ 라이브 데모', '3:10 ~ 5:10', '웹캠/동영상 실행, 조작 시연', '미리 켜 둔 탭에서 바로 시작'],
        ['⑤ 결과 · 한계 · 개선', '5:10 ~ 6:30', '수치/차트, 실패 사례와 원인, 개선 아이디어', '실패를 숨기지 말고 분석해 보여 주기'],
        ['⑥ 배운 점', '6:30 ~ 7:00', '팀원별 한 줄', '“다음에 한다면” 한 문장'],
        ['질의응답', '7:00 ~ 9:00', '청중 질문 1~2개', '답변은 30초 안에, 모르면 솔직하게'],
      ] },
      { type: 'checklist', title: '라이브 데모 직전 점검 (발표 5분 전)', items: [
        '발표 PC 의 브라우저에서 강좌 페이지가 열려 있고 Python 준비 완료 표시가 떴다',
        '최종 코드를 편집기에 붙여 넣고 ▶ 실행해 오류가 없는 것을 확인했다',
        '📷 웹캠 권한을 허용했고, 화면에 물체가 잘 보이도록 조명·배경을 맞췄다',
        '웹캠이 안 될 때 쓸 🎞️ 동영상 · 업로드 이미지로 입력 소스를 바꾸는 방법을 연습했다',
        '트랙바 기본값이 최적값이고, 화면에 조작법 안내 문구가 있다',
        '콘솔의 불필요한 print 출력을 지웠다 (화면이 깔끔하게)',
        '백업 결과 이미지(before_after, montage, pipeline)가 슬라이드에 있다',
        '데모 조작 담당과 설명 담당을 정했다',
      ] },
      { type: 'text', html: `
<h3>2. 쇼케이스 화면 — 한 장으로 보여 주기</h3>
<p>발표의 표지와 데모 시작 화면으로 쓸 수 있는 <b>쇼케이스 이미지</b>를 코드로 만듭니다. 한 장에 <b>타이틀 카드</b>(프로젝트 이름·팀·한 줄 소개), <b>전후 비교</b>, <b>파이프라인 단계</b>가 모두 들어갑니다.</p>
<p>팀에서 바꿀 곳은 두 군데뿐입니다.</p>
<ol>
  <li><code>SHOWCASE</code> 딕셔너리 — 제목, 팀 이름, 팀원, 한 줄 소개 (<b>영어</b>로, putText 는 한글 불가)</li>
  <li><code>run_pipeline(img)</code> — 팀 파이프라인을 호출해 <code>[(단계 이름, 이미지), …]</code> 와 결과 이미지·요약 문구를 돌려주게</li>
</ol>` },
      { type: 'code', title: '예제 1 · 쇼케이스 템플릿: 타이틀 카드 + 전후 비교 + 파이프라인', code: String.raw`
import cv2 as cv
import numpy as np
import webcv

# ================= 팀이 바꿀 부분 ① : 소개 문구 (영어) =================
SHOWCASE = {
    'title': 'Desk Object Analyzer',
    'team': 'Team 0',
    'members': 'Kim  /  Lee  /  Park',
    'tagline': 'Find, measure and classify objects on a desk',
    'accent': (0, 140, 255),                       # 강조색 (BGR)
}
WIDTH = 1200                                       # 쇼케이스 전체 가로
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


# ================= 팀이 바꿀 부분 ② : 파이프라인 =================
def run_pipeline(img):
    """팀 파이프라인. (단계 리스트 [(이름, 이미지)], 결과 이미지, 요약 문구) 를 돌려준다."""
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(blur, 30, 90)
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    kept = [c for c in contours if 300 <= cv.contourArea(c) <= 40000]
    result = img.copy()
    for c in kept:
        x, y, w, h = [int(v / s) for v in cv.boundingRect(c)]
        cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 3)
    stages = [('1 blur', blur), ('2 canny', edges), ('3 close+dilate', mask), ('4 result', result)]
    return stages, result, f'{len(kept)} objects found'


# ================= 공통 도우미 (그대로 사용) =================
def to_bgr(im):
    return cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im


def fit(im, w, h, bg=255):
    """비율을 유지하며 w×h 안에 맞추고 남는 곳을 배경색으로 채운다."""
    im = to_bgr(im)
    s = min(w / im.shape[1], h / im.shape[0])
    small = cv.resize(im, (max(1, int(im.shape[1] * s)), max(1, int(im.shape[0] * s))), interpolation=cv.INTER_AREA)
    cell = np.full((h, w, 3), bg, np.uint8)
    y0, x0 = (h - small.shape[0]) // 2, (w - small.shape[1]) // 2
    cell[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    return cell


def put_center(img, text, y, scale, color, thick, font=cv.FONT_HERSHEY_DUPLEX):
    """가로 가운데 정렬 글자."""
    (tw, th), _ = cv.getTextSize(text, font, scale, thick)
    cv.putText(img, text, ((img.shape[1] - tw) // 2, y), font, scale, color, thick, cv.LINE_AA)


def title_card(info, w=WIDTH, h=260):
    """어두운 그라데이션 배경의 타이틀 카드."""
    ramp = np.linspace(70, 20, h).astype(np.uint8)                 # 위에서 아래로 어두워짐
    card = np.dstack([np.tile(ramp[:, None], (1, w))] * 3)
    card[:, :, 0] = np.clip(card[:, :, 0].astype(int) + 25, 0, 255).astype(np.uint8)   # 살짝 푸른빛
    cv.rectangle(card, (0, h - 8), (w, h), info['accent'], -1)
    put_center(card, info['title'], 105, 2.0, (255, 255, 255), 3)
    put_center(card, info['tagline'], 155, 0.9, (220, 220, 220), 1, cv.FONT_HERSHEY_SIMPLEX)
    put_center(card, f"{info['team']}  |  {info['members']}", 210, 0.8, info['accent'], 2, cv.FONT_HERSHEY_SIMPLEX)
    return card


def labeled(im, label, w, h, color=(60, 60, 60)):
    bar = np.full((34, w, 3), color, np.uint8)
    cv.putText(bar, label, (10, 24), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
    return np.vstack([bar, fit(im, w, h)])


def before_after_row(before, after, summary, w=WIDTH, h=340, gap=20):
    half = (w - gap) // 2
    left = labeled(before, 'BEFORE', half, h)
    right = labeled(after, 'AFTER: ' + summary, w - gap - half, h, (0, 110, 0))
    return np.hstack([left, np.full((left.shape[0], gap, 3), 255, np.uint8), right])


def pipeline_row(stages, accent, w=WIDTH, h=170, arrow=36):
    n = len(stages)
    cw = (w - arrow * (n - 1)) // n
    parts = []
    for i, (name, im) in enumerate(stages):
        parts.append(labeled(im, name, cw, h, (90, 90, 90)))
        if i < n - 1:
            a = np.full((h + 34, arrow, 3), 255, np.uint8)
            cv.arrowedLine(a, (4, (h + 34) // 2), (arrow - 4, (h + 34) // 2), accent, 3, tipLength=0.5)
            parts.append(a)
    row = np.hstack(parts)
    return fit(row, w, row.shape[0])                                # 반올림 오차로 모자란 폭 채우기


def make_showcase(img, info):
    stages, result, summary = run_pipeline(img)
    pad = lambda n: np.full((n, WIDTH, 3), 255, np.uint8)
    return np.vstack([title_card(info), pad(20), before_after_row(img, result, summary), pad(20),
                      pipeline_row(stages, info['accent']), pad(20)])


img = cv.imread('stuff.jpg')          # 발표용 대표 입력 (webcv.get_input() 으로 바꿔도 됨)
showcase = make_showcase(img, SHOWCASE)
cv.imwrite('showcase.png', showcase)
print('쇼케이스 크기:', showcase.shape)
cv.imshow('showcase', showcase)
`, desc: '<p>아래쪽 도우미 함수는 그대로 두고 <code>SHOWCASE</code> 와 <code>run_pipeline()</code> 만 바꾸면 어느 팀 프로젝트든 같은 형식의 쇼케이스가 만들어집니다. 단계 수가 3개든 6개든 자동으로 칸이 나뉩니다. <code>showcase.png</code> 를 받아 발표 표지로 쓰세요.</p>' },
      { type: 'code', title: '예제 2 · 라이브 쇼케이스: 실시간 결과 + 단계 썸네일 + 백업 전환', code: String.raw`
import cv2 as cv
import numpy as np

TITLE = 'Desk Object Analyzer  |  Team 0'
WIN = 'result'
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
BACKUP = cv.imread('stuff.jpg')                     # 웹캠이 안 될 때 보여 줄 백업 입력


def nothing(x):
    pass


cv.namedWindow(WIN)
cv.createTrackbar('backup', WIN, 0, 1, nothing)     # 0 = 현재 입력(웹캠/동영상), 1 = 백업 이미지
cv.createTrackbar('stages', WIN, 1, 1, nothing)     # 1 = 단계 썸네일 표시


def run_pipeline(img):
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(blur, 30, 90)
    mask = cv.dilate(cv.morphologyEx(edges, cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    result = work.copy()
    n = 0
    for c in contours:
        if 300 <= cv.contourArea(c) <= 40000:
            n += 1
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)
    return [('blur', blur), ('canny', edges), ('mask', mask)], result, n


def process(frame):
    use_backup = cv.getTrackbarPos('backup', WIN) == 1
    src = BACKUP if use_backup else frame
    stages, result, n = run_pipeline(src)
    H, W = result.shape[:2]

    # 위: 제목 막대
    bar = np.full((40, W, 3), (40, 40, 40), np.uint8)
    cv.putText(bar, TITLE, (10, 27), cv.FONT_HERSHEY_DUPLEX, 0.65, (255, 255, 255), 1, cv.LINE_AA)
    tag = 'BACKUP' if use_backup else 'LIVE'
    cv.putText(bar, tag, (W - 90, 27), cv.FONT_HERSHEY_DUPLEX, 0.65, (0, 200, 255) if use_backup else (0, 0, 255), 2)
    cv.putText(result, f'objects: {n}', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    rows = [bar, result]

    # 아래: 단계 썸네일 띠
    if cv.getTrackbarPos('stages', WIN) == 1:
        tw = W // len(stages)
        th = int(tw * H / W)
        thumbs = []
        for name, im in stages:
            t = cv.resize(cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im, (tw, th))
            cv.putText(t, name, (5, 18), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv.LINE_AA)
            cv.rectangle(t, (0, 0), (tw - 1, th - 1), (255, 255, 255), 1)
            thumbs.append(t)
        strip = np.hstack(thumbs)
        rows.append(cv.resize(strip, (W, th)))
    return np.vstack(rows)


print('발표 데모: 입력을 📷 웹캠 또는 🎞️ 동영상으로 두고, 문제가 생기면 backup 트랙바를 1 로 올리세요.')
`, desc: '<p>데모 중 웹캠이 멈추거나 조명이 맞지 않으면 당황하지 말고 <code>backup</code> 트랙바를 1 로 올리세요. 화면 오른쪽 위 표시가 <code>LIVE</code> → <code>BACKUP</code> 으로 바뀌어 청중도 상황을 알 수 있습니다. 단계 썸네일 띠가 있으면 설명 없이도 파이프라인이 전달됩니다.</p>' },
      { type: 'code', title: '예제 3 · 데모 비상 키트 점검', code: String.raw`
import cv2 as cv
import numpy as np

# 발표에 쓸 백업 입력 파일 목록 — 팀에 맞게 바꾸세요 (업로드한 파일 이름, 웹캠 스냅샷 등)
BACKUP_FILES = ['stuff.jpg', 'webcam.png', 'my_test_1.jpg', 'smarties.png']

thumbs, ok_count = [], 0
print(f'{"file":16s} {"status":8s} size')
for name in BACKUP_FILES:
    img = cv.imread(name)
    if img is None:
        print(f'{name:16s} {"MISSING":8s} -  → 업로드하거나 📸 스냅샷으로 만들어 두세요')
        cell = np.full((150, 200, 3), 60, np.uint8)
        cv.putText(cell, 'MISSING', (40, 80), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    else:
        ok_count += 1
        print(f'{name:16s} {"OK":8s} {img.shape[1]}x{img.shape[0]}')
        cell = cv.resize(img, (200, 150), interpolation=cv.INTER_AREA)
    cv.putText(cell, name[:18], (5, 145), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)
    thumbs.append(cell)

print(f'\n백업 입력 {ok_count}/{len(BACKUP_FILES)} 준비됨')
if ok_count < 2:
    print('⚠ 백업 입력이 2개 미만입니다. 발표 전에 꼭 준비하세요!')
print('동영상 백업은 오른쪽 패널의 입력 소스 목록에서 🎞️ 항목이 재생되는지 직접 확인하세요.')
cv.imshow('backup kit', np.hstack(thumbs))
`, desc: '<p>발표 5분 전에 이 코드를 한 번 실행해 백업 입력이 실제로 읽히는지 확인하세요. 업로드한 파일은 새로고침하면 사라질 수 있으니 발표 PC 에서 다시 확인하는 것이 안전합니다.</p>' },
      { type: 'text', html: `
<h3>3. 질의응답 요령</h3>
<ul>
  <li><b>발표 팀</b>: 질문을 한 번 짧게 되풀이한 뒤(“~를 왜 선택했는지 물어보신 거죠?”) 30초 안에 답합니다. 모르는 것은 “확인해 보지 않았습니다. 좋은 실험 아이디어네요”라고 솔직하게.</li>
  <li><b>청중</b>: 칭찬 + 질문 형식이 좋습니다. 공격보다 <b>호기심</b>으로.</li>
</ul>
<p>좋은 질문 예시:</p>
<ul>
  <li>“그 파라미터 값은 어떻게 정했나요? 다른 값에서는 어떻게 되나요?”</li>
  <li>“조명이 어두운 곳이나 배경이 복잡한 곳에서도 되나요?”</li>
  <li>“가장 오래 걸린 문제는 무엇이었고 어떻게 해결했나요?”</li>
  <li>“시간이 더 있다면 무엇을 개선하고 싶나요?”</li>
</ul>` },
      { type: 'text', html: `<h3>4. 동료 평가 루브릭 (청중용)</h3>
<p>발표마다 5개 기준을 1~5점으로 채점합니다. 점수보다 <b>근거 한 줄</b>이 더 중요합니다. 자기 팀은 평가하지 않습니다.</p>` },
      { type: 'table', head: ['기준', '1점', '2점', '3점', '4점', '5점'], rows: [
        ['문제 정의 · 목표', '무엇을 만들었는지 알기 어려움', '주제는 알겠지만 목표가 모호함', '입력과 출력이 무엇인지 이해됨', '목표와 필요성이 분명함', '30초 안에 문제·목표·쓰임새가 명확히 전달됨'],
        ['기술 구현 · 완성도', '주요 기능이 동작하지 않음', '일부 입력에서만 부분적으로 동작', '핵심 기능이 대표 입력에서 동작', '여러 입력에서 안정적으로 동작', '여러 입력 + 실시간에서 안정적, 한계까지 분석'],
        ['접근 방법의 근거', '방법 설명 없음', '사용한 함수 나열에 그침', '파이프라인 단계를 설명함', '방법을 고른 이유를 비교 이미지/수치로 보여 줌', '대안과 비교한 근거 + 파라미터 선택 근거가 명확'],
        ['데모 · 결과 표현', '데모·결과 이미지 없음', '결과를 말로만 설명', '데모 또는 결과 이미지가 있음', '데모와 전후 비교·차트가 이해하기 쉬움', '매끄러운 라이브 데모 + 인상적인 시각 자료'],
        ['발표 전달력 · 시간', '시간 크게 초과, 전달 어려움', '구성이 산만함', '구성이 무난하고 시간 대체로 준수', '논리적 흐름, 시간 준수, 질문에 적절히 답함', '청중을 몰입시키는 흐름, 팀원 모두 참여, 명확한 답변'],
      ] },
      { type: 'table', head: ['동료 피드백 양식', '작성 내용 (팀마다 한 장)'], rows: [
        ['발표 팀 / 평가자', '팀 이름: ______ / 평가자(선택): ______'],
        ['점수 (5개 기준)', '문제 __ / 구현 __ / 근거 __ / 데모 __ / 전달 __  (합계 __ / 25)'],
        ['★ 가장 좋았던 점', '구체적으로 한 가지 — 예) “비교 이미지로 Otsu 대신 Canny 를 고른 이유가 바로 이해됐다”'],
        ['? 궁금한 점', '질문 한 가지 — 예) “배경이 흰색이 아니면 어떻게 되나요?”'],
        ['→ 제안', '다음에 해 보면 좋을 개선 한 가지 — 예) “맞닿은 물체는 거리 변환으로 나눠 보면 좋겠다”'],
        ['우리 팀이 배울 점', '우리 프로젝트에 가져가고 싶은 아이디어 한 가지'],
      ] },
      { type: 'text', html: `<h3>5. 강사 평가 기준 (w4-1 안내와 동일)</h3>
<p>프로젝트 오리엔테이션(w4-1)에서 안내한 5개 항목, 100점 만점으로 평가합니다. 동료 평가 점수는 발표 항목의 참고 자료로 사용합니다.</p>` },
      { type: 'table', head: ['항목 (배점)', '상 (90~100%)', '중 (60~89%)', '하 (60% 미만)'], rows: [
        ['기능 완성도 (30)', '설계서의 필수 기능이 모두 동작, 3장 이상 여러 입력에서 결과가 나오고 실패 사례까지 정리', '필수 기능 대부분 동작, 일부 입력에서만 결과가 좋음', '핵심 기능이 동작하지 않거나 한 장의 입력에서만 동작'],
        ['기술 활용 (20)', '배운 기법을 목적에 맞게 조합, 파라미터를 비교·스윕 등 근거로 선택', '기법 선택은 적절하나 근거 설명이 부족', '목적과 맞지 않는 기법, 근거 없는 임의 값'],
        ['코드 품질 (15)', '단계별 함수 분리, CONFIG 정리, 한국어 주석·docstring, 디버그 뷰', '함수 분리는 되었으나 매직 넘버·주석 부족', '한 덩어리 코드, 읽기 어려움'],
        ['실시간 / 인터랙션 (15)', 'process(frame) 로 웹캠/동영상에서 원활히 동작, 트랙바·마우스로 조절, 속도 측정', '실시간 동작은 하지만 느리거나 조작 기능이 적음', '이미지에서만 동작하거나 조작 불가'],
        ['발표 (20)', '문제·파이프라인·데모·실패와 개선을 명확히, 7분 준수, 팀원 모두 참여', '구성은 갖췄으나 시간 초과 또는 설명 일부 부족', '구성·데모가 부족하고 전달이 어려움'],
      ] },
      { type: 'tip', html: `<p><b>발표가 끝난 팀에게</b>: 받은 동료 피드백 중 “→ 제안” 항목을 모아 w5-8 회고의 <b>Try</b> 목록으로 가져가세요. 최종 제출(코드 · README · 결과 이미지)은 피드백을 반영해 강사가 안내한 기한까지 올립니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 우리 팀 타이틀 카드 만들기',
        desc: `<p>팀 발표 표지로 쓸 타이틀 카드(1200×400)를 만드세요. ① 제목을 <b>가운데 정렬</b>하고, ② 한 줄 소개와 ③ 팀원 이름 줄을 추가하고, ④ 아래쪽에 강조색 막대를 그린 뒤 <code>title_card.png</code> 로 저장합니다. 글자는 영어로 쓰세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

TITLE = 'Our Project Title'
TAGLINE = 'One sentence about what it does'
MEMBERS = 'Team X  |  Name1 / Name2 / Name3'
ACCENT = (80, 180, 0)               # BGR

W, H = 1200, 400
card = np.full((H, W, 3), (45, 35, 30), np.uint8)       # 어두운 배경

# 제목 (지금은 왼쪽 정렬)
cv.putText(card, TITLE, (40, 170), cv.FONT_HERSHEY_DUPLEX, 2.2, (255, 255, 255), 3, cv.LINE_AA)

# TODO 1: cv.getTextSize 로 제목 폭을 구해 가운데 정렬하세요
# TODO 2: TAGLINE 을 제목 아래(y=240)에 가운데 정렬로 쓰세요 (scale 1.0)
# TODO 3: MEMBERS 를 y=320 에 강조색으로 쓰세요
# TODO 4: 아래쪽에 높이 12 의 강조색 막대를 그리고 title_card.png 로 저장하세요
cv.imshow('title card', card)
`,
        hint: `<p><code>(tw, th), _ = cv.getTextSize(TITLE, cv.FONT_HERSHEY_DUPLEX, 2.2, 3)</code> → x = <code>(W - tw) // 2</code>. 같은 계산을 함수 <code>put_center(img, text, y, scale, color, thick)</code> 로 만들어 세 줄에 재사용하면 편합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

TITLE = 'Our Project Title'
TAGLINE = 'One sentence about what it does'
MEMBERS = 'Team X  |  Name1 / Name2 / Name3'
ACCENT = (80, 180, 0)

W, H = 1200, 400
card = np.full((H, W, 3), (45, 35, 30), np.uint8)


def put_center(img, text, y, scale, color, thick, font=cv.FONT_HERSHEY_DUPLEX):
    (tw, th), _ = cv.getTextSize(text, font, scale, thick)
    cv.putText(img, text, ((img.shape[1] - tw) // 2, y), font, scale, color, thick, cv.LINE_AA)


put_center(card, TITLE, 170, 2.2, (255, 255, 255), 3)
put_center(card, TAGLINE, 240, 1.0, (210, 210, 210), 1, cv.FONT_HERSHEY_SIMPLEX)
put_center(card, MEMBERS, 320, 0.9, ACCENT, 2, cv.FONT_HERSHEY_SIMPLEX)
cv.rectangle(card, (0, H - 12), (W, H), ACCENT, -1)
cv.imwrite('title_card.png', card)
cv.imshow('title card', card)
`,
      },
      {
        title: '실습 2 · 쇼케이스에 “핵심 숫자” 카드 추가하기',
        desc: `<p>발표에서 기억에 남는 것은 숫자입니다. <code>number_cards()</code> 를 완성해 <code>[('5', 'objects'), ('24 FPS', 'on webcam'), ('92%', 'accuracy')]</code> 같은 목록을 <b>가로로 나란한 카드</b>(큰 숫자 + 작은 설명)로 그리고, 결과 이미지 아래에 붙여 표시하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

NUMBERS = [('5', 'objects found'), ('24 FPS', 'on webcam (480px)'), ('92%', 'count accuracy')]


def number_cards(items, width=960, height=150):
    """items: [(큰 글자, 설명)] → 카드들이 가로로 놓인 이미지."""
    canvas = np.full((height, width, 3), 255, np.uint8)
    # TODO 1: 카드 폭 = width // len(items) 로 나누고, 각 카드에 옅은 회색 사각형 테두리를 그리세요
    # TODO 2: 큰 글자(scale 1.8, 굵게)와 설명(scale 0.6)을 카드 안 가운데에 쓰세요
    return canvas


result = cv.resize(cv.imread('stuff.jpg'), (960, 720))
panel = number_cards(NUMBERS)
cv.imshow('showcase with numbers', np.vstack([result, panel]))
`,
        hint: `<p>i 번째 카드의 왼쪽 x = <code>i * cw</code>. 가운데 정렬 x = <code>x0 + (cw - 글자폭) // 2</code> (글자폭은 <code>cv.getTextSize</code>). 테두리는 <code>cv.rectangle(canvas, (x0 + 10, 10), (x0 + cw - 10, height - 10), (220, 220, 220), 2)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

NUMBERS = [('5', 'objects found'), ('24 FPS', 'on webcam (480px)'), ('92%', 'count accuracy')]


def number_cards(items, width=960, height=150, accent=(0, 140, 255)):
    """items: [(큰 글자, 설명)] → 카드들이 가로로 놓인 이미지."""
    canvas = np.full((height, width, 3), 255, np.uint8)
    cw = width // len(items)
    for i, (big, small) in enumerate(items):
        x0 = i * cw
        cv.rectangle(canvas, (x0 + 10, 10), (x0 + cw - 10, height - 10), (220, 220, 220), 2)
        (bw, bh), _ = cv.getTextSize(big, cv.FONT_HERSHEY_DUPLEX, 1.8, 3)
        cv.putText(canvas, big, (x0 + (cw - bw) // 2, 85), cv.FONT_HERSHEY_DUPLEX, 1.8, accent, 3, cv.LINE_AA)
        (sw, sh), _ = cv.getTextSize(small, cv.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv.putText(canvas, small, (x0 + (cw - sw) // 2, 120), cv.FONT_HERSHEY_SIMPLEX, 0.6, (90, 90, 90), 1, cv.LINE_AA)
    return canvas


result = cv.resize(cv.imread('stuff.jpg'), (960, 720))
panel = number_cards(NUMBERS)
sheet = np.vstack([result, panel])
cv.imwrite('showcase_numbers.png', sheet)
cv.imshow('showcase with numbers', sheet)
`,
      },
    ],
    quiz: [
      { q: '라이브 데모 도중 웹캠 화면이 멈췄습니다. 가장 좋은 대응은?', options: ['문제를 해결할 때까지 코드를 고친다', '준비한 동영상/백업 이미지 입력으로 바로 전환해 데모를 계속하고, 원인은 발표 후에 확인한다', '데모를 생략하고 다음 발표 팀에게 넘긴다', '청중에게 웹캠을 빌린다'], answer: 1, explain: '발표 시간은 제한되어 있으므로 미리 준비한 백업으로 전환하는 것이 최선입니다. 그래서 백업 입력과 전환 방법을 사전에 연습해 둡니다.' },
      { q: '동료 평가에서 가장 도움이 되는 피드백은?', options: ['“좋았어요”', '“별로였어요”', '“비교 이미지 덕분에 방법 선택 이유가 이해됐고, 배경이 복잡할 때 결과도 보여 주면 더 좋겠다”', '점수만 적고 코멘트는 비운다'], answer: 2, explain: '구체적인 칭찬과 실행 가능한 제안이 함께 있는 피드백이 발표 팀의 다음 개선으로 이어집니다.' },
      { q: 'w4-1 에서 안내한 강사 평가 항목 중 배점이 가장 큰 것은?', options: ['발표', '코드 품질', '기능 완성도', '실시간 / 인터랙션'], answer: 2, explain: '기능 완성도 30점, 기술 활용 20점, 발표 20점, 코드 품질 15점, 실시간/인터랙션 15점입니다. “정한 목표를 완성도 있게 해냈나”가 가장 중요합니다.' },
    ],
  },
  // =====================================================================
  // w5-8 회고와 다음 단계
  // =====================================================================
  {
    id: 'w5-8',
    summary: '5주 과정을 한 장으로 정리하고 KPT 회고를 합니다. 수료 퀴즈와 종합 챌린지로 실력을 확인한 뒤, OpenCV 공식 튜토리얼을 따라가는 다음 학습 로드맵과 내 PC 에서 같은 코드를 실행하는 방법을 안내합니다.',
    goals: [
      '1~3주차 핵심 기법과 함수를 주제별로 정리해 설명할 수 있다',
      'KPT(Keep · Problem · Try) 방식으로 프로젝트와 학습 과정을 돌아볼 수 있다',
      '여러 기법을 하나의 실시간 앱(효과 스튜디오)으로 조합할 수 있다',
      'OpenCV 공식 튜토리얼의 다음 단원(특징점, 비디오 분석, 캘리브레이션, 머신러닝 등)으로 학습 계획을 세울 수 있다',
      'pip 로 opencv-python 을 설치하고 웹용 process(frame) 코드를 데스크톱 while 루프 코드로 옮길 수 있다',
    ],
    schedule: [['과정 총정리', 7], ['KPT 회고', 10], ['수료 퀴즈', 8], ['종합 챌린지', 13], ['다음 단계 · PC 설치 안내', 10], ['마무리', 2]],
    blocks: [
      { type: 'text', html: `
<h3>1. 5주 동안 걸어온 길</h3>
<p>처음에는 <code>cv.imread</code> 한 줄로 이미지를 띄우는 것부터 시작했습니다. 지금은 입력 → 전처리 → 검출 → 분석 → 시각화로 이어지는 <b>영상처리 파이프라인</b>을 설계하고, 웹캠에서 실시간으로 돌리고, 튜닝하고, 발표까지 했습니다. 아래 표로 배운 것을 한눈에 정리해 봅시다. 각 줄에서 <b>설명할 수 없는 함수</b>가 있다면 표시해 두고 해당 교시를 다시 보세요.</p>` },
      { type: 'table', head: ['주차', '핵심 주제', '핵심 함수 · 개념'], rows: [
        ['1주 · 입문 · GUI · 코어', '이미지는 NumPy 배열, 입출력, 비디오/웹캠, 그리기, 마우스, 트랙바, 픽셀·ROI·채널, 산술·비트 연산, 성능 측정', '<code>imread</code> <code>imshow</code> <code>imwrite</code> <code>VideoCapture</code> <code>process(frame)</code> <code>line/rectangle/circle/putText</code> <code>setMouseCallback</code> <code>createTrackbar</code> <code>split/merge</code> <code>add</code> <code>addWeighted</code> <code>bitwise_and</code> <code>getTickCount</code>'],
        ['2주 · Image Processing Ⅰ', '색 공간, 색 추적, 크기·회전·어파인·원근 변환, 단순/적응형 임계처리, Otsu, 스무딩 필터', '<code>cvtColor</code> <code>inRange</code> <code>resize</code> <code>warpAffine</code> <code>getRotationMatrix2D</code> <code>getPerspectiveTransform</code> <code>warpPerspective</code> <code>threshold</code> <code>adaptiveThreshold</code> <code>THRESH_OTSU</code> <code>filter2D</code> <code>blur</code> <code>GaussianBlur</code> <code>medianBlur</code> <code>bilateralFilter</code>'],
        ['3주 · Image Processing Ⅱ', '모폴로지, 그래디언트, Canny, 피라미드, 컨투어와 특징, 히스토그램·평활화, 템플릿 매칭, 허프 변환', '<code>erode/dilate</code> <code>morphologyEx</code> <code>Sobel</code> <code>Laplacian</code> <code>Canny</code> <code>pyrDown/pyrUp</code> <code>findContours</code> <code>contourArea</code> <code>boundingRect</code> <code>minAreaRect</code> <code>approxPolyDP</code> <code>convexHull</code> <code>moments</code> <code>calcHist</code> <code>equalizeHist</code> <code>createCLAHE</code> <code>matchTemplate</code> <code>HoughLinesP</code> <code>HoughCircles</code>'],
        ['4주 · 가이드 프로젝트 · 기획', '파이프라인 설계, 문서 스캐너, 동전·도형 분석기, 가상 페인터, 사진 필터, 기획서, MVP', '입력 → 전처리 → 분할 → 분석 → 출력, 설계서, 테스트 이미지 세트'],
        ['5주 · 구현과 발표', '모듈화·CONFIG, 디버그 뷰, 실시간 최적화, 트랙바·마우스 튜닝 패널, 디버깅·테스트·리뷰, 결과 정리, 발표', '<code>make_grid</code> <code>describe</code> <code>perf_counter</code> <code>pointPolygonTest</code> <code>assert</code> 테스트, 쇼케이스, README'],
      ] },
      { type: 'text', html: `
<h3>2. KPT 회고</h3>
<p>회고(retrospective)는 “잘잘못 따지기”가 아니라 <b>다음에 더 잘하기 위한 정리</b>입니다. KPT 는 세 칸만 채우면 되는 간단한 방법입니다.</p>
<ul>
  <li><b>Keep</b> — 잘 되었고 앞으로도 계속할 것</li>
  <li><b>Problem</b> — 어려웠거나 아쉬웠던 것 (사람이 아니라 <b>상황·방법</b>에 대해)</li>
  <li><b>Try</b> — Problem 을 해결하기 위해 <b>다음에 구체적으로 해 볼 행동</b> (w5-7 동료 피드백의 “→ 제안”도 여기로)</li>
</ul>
<p><b>진행 (10분)</b>: ① 개인별로 포스트잇/메모에 K·P·T 를 각각 2개 이상 쓰기 (4분) → ② 팀별로 공유하고 비슷한 것끼리 묶기 (4분) → ③ 팀마다 가장 중요한 Try 하나를 전체에 발표 (2분).</p>
<p>생각을 돕는 질문: “가장 시간이 오래 걸린 버그는?”, “처음부터 다시 한다면 무엇을 먼저 할까?”, “디버그 뷰·테스트·CONFIG 중 가장 도움이 된 것은?”, “팀 협업에서 좋았던 습관은?”</p>` },
      { type: 'table', head: ['', '예시 (책상 물건 분석기 팀)', '좋은 작성 요령'], rows: [
        ['Keep', '디버그 격자를 처음부터 만들어서 Canny 끊김 문제를 10분 만에 찾았다 / 매일 결과 이미지를 imwrite 로 저장했다', '구체적인 행동 + 효과'],
        ['Problem', 'stuff.jpg 에만 맞춰 튜닝해서 웹캠에서는 잡음 상자가 많았다 / 발표 리허설을 한 번밖에 못 했다', '사실 위주, 원인이 보이게'],
        ['Try', '처음부터 테스트 이미지 5장 + 동영상 1개로 스윕하기 / 발표 이틀 전에 시간 재며 리허설 2회', '측정 가능하고 바로 실행할 수 있게'],
      ] },
      { type: 'text', html: `
<h3>3. 종합 챌린지 — 웹캠 효과 스튜디오</h3>
<p>과정에서 배운 기법을 한 앱에 모았습니다. <code>mode</code> 트랙바로 효과를 바꾸고, 색 추적 모드에서는 <code>hue</code> 트랙바로 추적할 색을 고릅니다. 코드를 읽으며 각 모드가 몇 주차 기법인지 찾아보고, 실습 1 에서 나만의 모드를 추가해 보세요. (📷 웹캠 또는 🎞️ <code>cup.mp4</code> 동영상 입력 권장)</p>` },
      { type: 'code', title: '예제 1 · 종합 챌린지: 올인원 효과 스튜디오', code: String.raw`
import cv2 as cv
import numpy as np
import time
from collections import deque

WIN = 'result'
MODES = ['0 original', '1 gray', '2 edges', '3 cartoon', '4 color track', '5 objects']
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))
STATE = {'trail': deque(maxlen=30), 'last': None, 'fps': 0.0}


def nothing(x):
    pass


cv.namedWindow(WIN)
cv.createTrackbar('mode', WIN, 5, len(MODES) - 1, nothing)
cv.createTrackbar('canny', WIN, 50, 255, nothing)       # edges / objects 모드의 Canny 아래 임계값
cv.createTrackbar('hue', WIN, 170, 179, nothing)        # color track 모드의 목표 색상 (170 = 분홍/빨강)


def mode_gray(img):                                     # 2주: 색 공간
    return cv.cvtColor(cv.cvtColor(img, cv.COLOR_BGR2GRAY), cv.COLOR_GRAY2BGR)


def mode_edges(img, lo):                                # 3주: Canny
    edges = cv.Canny(cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0), lo, lo * 3)
    out = img // 3                                      # 어둡게 한 원본 위에
    out[edges > 0] = (0, 255, 255)                      # 엣지를 노란색으로
    return out


def mode_cartoon(img):                                  # 2주: 양방향 필터 + 적응형 임계, 3주: 피라미드
    small = cv.pyrDown(img)                             # 절반 크기에서 무거운 필터
    color = cv.pyrUp(cv.bilateralFilter(small, 7, 60, 60), dstsize=(img.shape[1], img.shape[0]))
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 5)
    return cv.bitwise_and(color, color, mask=edges)     # 1주: 비트 연산


def mode_color_track(img, hue):                         # 2주: HSV inRange, 3주: 모폴로지·컨투어·모멘트
    hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
    lo, hi = hue - 10, hue + 10
    mask = cv.inRange(hsv, (max(lo, 0), 70, 50), (min(hi, 179), 255, 255))
    if lo < 0:
        mask |= cv.inRange(hsv, (180 + lo, 70, 50), (179, 255, 255))
    if hi > 179:
        mask |= cv.inRange(hsv, (0, 70, 50), (hi - 180, 255, 255))
    mask = cv.morphologyEx(mask, cv.MORPH_OPEN, KERNEL)
    out = img.copy()
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv.contourArea)
        M = cv.moments(c)
        if M['m00'] > 300:
            cx, cy = int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])
            STATE['trail'].append((cx, cy))             # 5주: 프레임 사이 상태
            cv.drawContours(out, [c], -1, (0, 255, 0), 2)
    pts = list(STATE['trail'])
    for i in range(1, len(pts)):                         # 1주: 그리기 — 궤적
        cv.line(out, pts[i - 1], pts[i], (0, 0, 255), 1 + i // 6)
    swatch = cv.cvtColor(np.uint8([[[hue, 255, 255]]]), cv.COLOR_HSV2BGR)[0, 0]
    cv.rectangle(out, (out.shape[1] - 50, 45), (out.shape[1] - 10, 85), tuple(int(v) for v in swatch), -1)
    return out


def mode_objects(img, lo):                              # 5주: 책상 물건 분석기
    s = 480 / img.shape[1]
    work = cv.resize(img, (480, int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    blur = cv.GaussianBlur(cv.cvtColor(work, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, lo, lo * 3), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    out, n = img.copy(), 0
    for c in contours:
        area = cv.contourArea(c)
        if 300 <= area <= 40000:
            n += 1
            (_, _), (rw, rh), _ = cv.minAreaRect(c)
            circ = 4 * np.pi * area / (cv.arcLength(c, True) ** 2)
            shape = 'long' if max(rw, rh) / max(1.0, min(rw, rh)) >= 4 else ('round' if circ >= 0.75 else 'box')
            x, y, w, h = [int(v / s) for v in cv.boundingRect(c)]
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv.putText(out, shape, (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    cv.putText(out, f'objects: {n}', (10, out.shape[0] - 15), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return out


def process(frame):
    now = time.perf_counter()
    if STATE['last'] is not None:
        fps = 1.0 / max(now - STATE['last'], 1e-6)
        STATE['fps'] = fps if STATE['fps'] == 0 else 0.9 * STATE['fps'] + 0.1 * fps
    STATE['last'] = now

    mode = cv.getTrackbarPos('mode', WIN)
    lo = max(1, cv.getTrackbarPos('canny', WIN))
    if mode == 1:
        out = mode_gray(frame)
    elif mode == 2:
        out = mode_edges(frame, lo)
    elif mode == 3:
        out = mode_cartoon(frame)
    elif mode == 4:
        out = mode_color_track(frame, cv.getTrackbarPos('hue', WIN))
    elif mode == 5:
        out = mode_objects(frame, lo)
    else:
        out = frame.copy()

    ms = (time.perf_counter() - now) * 1000                # 1주: 성능 측정
    roi = out[0:36, :]
    out[0:36, :] = cv.addWeighted(roi, 0.4, np.zeros_like(roi), 0.6, 0)   # 반투명 제목 막대
    cv.putText(out, f'{MODES[mode]}   {ms:.0f} ms   {STATE["fps"]:.0f} FPS', (10, 25),
               cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
    return out


print('mode 트랙바: 0 원본 / 1 흑백 / 2 엣지 / 3 카툰 / 4 색 추적(hue) / 5 물체 분석')
`, desc: '<p>여섯 모드에 1~5주의 기법이 모두 들어 있습니다. 카툰 모드는 <code>pyrDown</code> 으로 절반 크기에서 양방향 필터를 돌려 속도를 지켰고(w5-3), 색 추적 모드는 H 경계(0/179)를 넘는 범위를 두 번 나눠 처리하며(w5-4), 궤적은 <code>deque</code> 상태로 유지합니다. 이미지 입력(stuff.jpg)에서 mode=4, hue=170 이면 분홍 라이터를 찾습니다.</p>' },
      { type: 'code', title: '예제 2 · 1~3주차 기법 한 장 총정리', code: String.raw`
import cv2 as cv
import numpy as np


def cell(img, label, w=220, h=165):
    """이미지를 칸 크기로 맞추고 라벨을 붙인다."""
    if img.ndim == 2:
        img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    out = cv.resize(img, (w, h), interpolation=cv.INTER_AREA)
    cv.rectangle(out, (0, 0), (w, 20), (40, 40, 40), -1)
    cv.putText(out, label, (5, 15), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)
    return out


fruits = cv.imread('fruits.jpg')
sudoku = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
coins = cv.imread('water_coins.jpg', cv.IMREAD_GRAYSCALE)
building = cv.imread('building.jpg', cv.IMREAD_GRAYSCALE)
smarties = cv.imread('smarties.png')
messi, face = cv.imread('messi5.jpg'), cv.imread('messi_face.jpg')
cells = []

# 2주: 색 공간 · 색 추적
hsv = cv.cvtColor(fruits, cv.COLOR_BGR2HSV)
mask = cv.inRange(hsv, (10, 100, 100), (25, 255, 255))                  # 주황색
cells.append(cell(cv.bitwise_and(fruits, fruits, mask=mask), 'W2 HSV inRange (orange)'))

# 2주: 기하 변환
M = cv.getRotationMatrix2D((fruits.shape[1] / 2, fruits.shape[0] / 2), 30, 0.8)
cells.append(cell(cv.warpAffine(fruits, M, (fruits.shape[1], fruits.shape[0])), 'W2 rotate 30 deg'))

# 2주: 임계처리
_, otsu = cv.threshold(coins, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
cells.append(cell(otsu, 'W2 Otsu threshold'))
cells.append(cell(cv.adaptiveThreshold(sudoku, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2), 'W2 adaptive threshold'))

# 2주: 스무딩 (소금-후추 잡음 → 미디언)
noisy = fruits.copy()
rng = np.random.default_rng(0)
ys, xs = rng.integers(0, noisy.shape[0], 3000), rng.integers(0, noisy.shape[1], 3000)
noisy[ys, xs] = rng.choice([0, 255], (3000, 1))
cells.append(cell(cv.medianBlur(noisy, 5), 'W2 median blur (denoise)'))

# 3주: 모폴로지 · 그래디언트 · Canny
cells.append(cell(cv.morphologyEx(otsu, cv.MORPH_GRADIENT, np.ones((3, 3), np.uint8)), 'W3 morph gradient'))
cells.append(cell(cv.convertScaleAbs(cv.Sobel(building, cv.CV_64F, 1, 0, ksize=3)), 'W3 Sobel x'))
cells.append(cell(cv.Canny(building, 100, 200), 'W3 Canny'))

# 3주: 컨투어
vis = smarties.copy()
g = cv.medianBlur(cv.cvtColor(smarties, cv.COLOR_BGR2GRAY), 5)
_, th = cv.threshold(g, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
cv.drawContours(vis, contours, -1, (0, 255, 0), 2)
cells.append(cell(vis, f'W3 contours ({len(contours)})'))

# 3주: 히스토그램 평활화 (CLAHE)
cells.append(cell(cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(coins), 'W3 CLAHE'))

# 3주: 템플릿 매칭
res = cv.matchTemplate(messi, face, cv.TM_CCOEFF_NORMED)
_, score, _, (x, y) = cv.minMaxLoc(res)
vis = messi.copy()
cv.rectangle(vis, (x, y), (x + face.shape[1], y + face.shape[0]), (0, 0, 255), 3)
cells.append(cell(vis, f'W3 template match {score:.2f}'))

# 3주: 허프 원
circles = cv.HoughCircles(g, cv.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=10, maxRadius=40)
vis = smarties.copy()
if circles is not None:
    for cx, cy, r in np.round(circles[0]).astype(int):
        cv.circle(vis, (int(cx), int(cy)), int(r), (255, 0, 255), 2)
cells.append(cell(vis, f'W3 HoughCircles ({0 if circles is None else len(circles[0])})'))

sheet = np.vstack([np.hstack(cells[i:i + 4]) for i in range(0, 12, 4)])
cv.imshow('weeks 2-3 recap', sheet)
print('12개 기법 — 각 칸의 코드를 보고 매개변수의 의미를 말로 설명할 수 있나요?')
`, desc: '<p>한 칸 한 칸이 한 교시입니다. 칸마다 “입력이 왜 이 기법에 맞는지”, “매개변수를 바꾸면 어떻게 될지” 짝에게 설명해 보세요. 설명이 막히는 칸이 복습할 교시입니다.</p>' },
      { type: 'text', html: `
<h3>4. 다음 단계 — OpenCV 공식 튜토리얼 로드맵</h3>
<p>이 과정은 OpenCV-Python 튜토리얼의 <b>입문 · GUI · Core · Image Processing</b> 단원을 다뤘습니다. 같은 튜토리얼의 다음 단원들이 자연스러운 다음 걸음입니다. (전체 목차: <a href="https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html" target="_blank" rel="noopener">OpenCV-Python Tutorials</a>)</p>` },
      { type: 'table', head: ['단원', '무엇을 배우나', '이 과정과의 연결', '시작 문서'], rows: [
        ['Feature Detection and Description', '코너(Harris, Shi-Tomasi), ORB 특징점, 특징 매칭, 호모그래피로 물체 찾기', '템플릿 매칭은 크기·회전에 약함 → 특징점은 회전·크기 변화에도 매칭', '<a href="https://docs.opencv.org/4.x/db/d27/tutorial_py_table_of_contents_feature2d.html" target="_blank" rel="noopener">목차</a> · <a href="https://docs.opencv.org/4.x/d1/d89/tutorial_py_orb.html" target="_blank" rel="noopener">ORB</a> · <a href="https://docs.opencv.org/4.x/dc/dc3/tutorial_py_matcher.html" target="_blank" rel="noopener">Feature Matching</a>'],
        ['Video Analysis', 'Meanshift/CamShift 추적, 옵티컬 플로(움직임 벡터), 배경 차분(움직이는 물체 분리)', 'HSV 색 추적 · 프레임 사이 상태(w5-3)의 발전형', '<a href="https://docs.opencv.org/4.x/da/dd0/tutorial_table_of_content_video.html" target="_blank" rel="noopener">목차</a> · <a href="https://docs.opencv.org/4.x/d7/d00/tutorial_meanshift.html" target="_blank" rel="noopener">Meanshift</a> · <a href="https://docs.opencv.org/4.x/d4/dee/tutorial_optical_flow.html" target="_blank" rel="noopener">Optical Flow</a> · <a href="https://docs.opencv.org/4.x/d1/dc5/tutorial_background_subtraction.html" target="_blank" rel="noopener">Background Subtraction</a>'],
        ['Camera Calibration and 3D Reconstruction', '체스판으로 렌즈 왜곡 보정, 자세 추정, 스테레오 깊이', '원근 변환(2주)과 체스판 이미지의 확장 — 픽셀을 실제 cm 로 재기', '<a href="https://docs.opencv.org/4.x/d9/db7/tutorial_py_table_of_contents_calib3d.html" target="_blank" rel="noopener">목차</a> · <a href="https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html" target="_blank" rel="noopener">Camera Calibration</a>'],
        ['Machine Learning', 'k-NN, SVM, K-Means 군집화 (색 줄이기, 손글씨 숫자 인식)', '손으로 정한 분류 규칙(w5-2 color_name) → 데이터로 학습하는 분류', '<a href="https://docs.opencv.org/4.x/d6/de2/tutorial_py_table_of_contents_ml.html" target="_blank" rel="noopener">목차</a> · <a href="https://docs.opencv.org/4.x/d9/d70/tutorial_py_kmeans_index.html" target="_blank" rel="noopener">K-Means</a>'],
        ['Computational Photography', '노이즈 제거(Non-local Means), 인페인팅(지우기·복원), HDR', '스무딩 필터(2주)와 사진 필터 앱(4주)의 고급판', '<a href="https://docs.opencv.org/4.x/d0/d07/tutorial_py_table_of_contents_photo.html" target="_blank" rel="noopener">목차</a> · <a href="https://docs.opencv.org/4.x/df/d3d/tutorial_py_inpainting.html" target="_blank" rel="noopener">Inpainting</a>'],
        ['Object Detection · DNN', 'Haar Cascade 얼굴 검출, 딥러닝 모델(dnn 모듈)로 물체·얼굴 검출', '규칙 기반 검출의 한계(복잡한 배경)를 학습된 모델로 넘기', '<a href="https://docs.opencv.org/4.x/db/d28/tutorial_cascade_classifier.html" target="_blank" rel="noopener">Cascade Classifier</a> · <a href="https://docs.opencv.org/4.x/d2/d58/tutorial_table_of_content_dnn.html" target="_blank" rel="noopener">DNN 목차</a>'],
        ['(Image Processing 심화)', 'Watershed 로 맞닿은 물체 분리, GrabCut 전경 추출', 'water_coins 처럼 붙은 물체 문제(w5-6 몽타주의 한계) 해결', '<a href="https://docs.opencv.org/4.x/d3/db4/tutorial_py_watershed.html" target="_blank" rel="noopener">Watershed</a> · <a href="https://docs.opencv.org/4.x/d8/d83/tutorial_py_grabcut.html" target="_blank" rel="noopener">GrabCut</a>'],
      ] },
      { type: 'code', title: '예제 3 · 맛보기 ① ORB 특징점 매칭 (회전 · 크기가 달라도 찾기)', code: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('messi5.jpg')
# 같은 장면을 25도 회전 + 0.7배 축소한 "다른 사진"을 만든다
h, w = img1.shape[:2]
M = cv.getRotationMatrix2D((w / 2, h / 2), 25, 0.7)
img2 = cv.warpAffine(img1, M, (w, h), borderValue=(255, 255, 255))

if not hasattr(cv, 'ORB_create'):
    print('이 환경의 OpenCV 에는 features2d 모듈이 없습니다. PC 에서 opencv-python 으로 실행해 보세요.')
    cv.imshow('rotated', img2)
else:
    orb = cv.ORB_create(nfeatures=500)                       # 특징점 검출기 + 기술자
    g1, g2 = cv.cvtColor(img1, cv.COLOR_BGR2GRAY), cv.cvtColor(img2, cv.COLOR_BGR2GRAY)
    kp1, des1 = orb.detectAndCompute(g1, None)
    kp2, des2 = orb.detectAndCompute(g2, None)
    bf = cv.BFMatcher(cv.NORM_HAMMING, crossCheck=True)      # 이진 기술자는 해밍 거리
    matches = sorted(bf.match(des1, des2), key=lambda m: m.distance)
    print('특징점:', len(kp1), len(kp2), '/ 매칭:', len(matches), '/ 가장 좋은 거리:', matches[0].distance if matches else '-')
    vis = cv.drawMatches(img1, kp1, img2, kp2, matches[:40], None,
                         flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
    cv.imshow('ORB matches (best 40)', vis)
`, desc: '<p>3주차 템플릿 매칭은 회전하거나 크기가 바뀐 물체를 잘 찾지 못했습니다. ORB 특징점은 회전·크기 변화에도 같은 지점을 이어 줍니다. 여기에 호모그래피(<code>cv.findHomography</code>)를 더하면 사진 속 책 표지를 찾아 테두리를 그릴 수 있습니다 — Feature Detection 단원의 내용입니다.</p>' },
      { type: 'code', title: '예제 4 · 맛보기 ② 배경 차분으로 움직이는 사람 찾기 (동영상)', code: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
STATE = {'sub': None, 'size': None}

# 동영상을 열면 오른쪽 패널의 입력 소스가 보행자 영상으로 바뀌고, 프레임마다 process 가 호출된다
cap = cv.VideoCapture('vtest.avi')
print('동영상 열림:', cap.isOpened(), '/ 프레임 수:', int(cap.get(cv.CAP_PROP_FRAME_COUNT)))


def process(frame):
    small = cv.resize(frame, (384, int(frame.shape[0] * 384 / frame.shape[1])), interpolation=cv.INTER_AREA)
    if STATE['size'] != small.shape:                      # 처음이거나 입력 크기가 바뀌면 새로 만들기
        STATE['sub'] = cv.createBackgroundSubtractorMOG2(history=200, varThreshold=25, detectShadows=True)
        STATE['size'] = small.shape
    fg = STATE['sub'].apply(small)                        # 배경 모델과 다른 픽셀 = 전경(255), 그림자(127)
    _, fg = cv.threshold(fg, 200, 255, cv.THRESH_BINARY)  # 그림자 제거
    fg = cv.dilate(cv.morphologyEx(fg, cv.MORPH_OPEN, KERNEL), KERNEL, iterations=2)
    contours, _ = cv.findContours(fg, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    out = small.copy()
    n = 0
    for c in contours:
        if cv.contourArea(c) > 80:
            n += 1
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, f'moving: {n}', (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return np.hstack([out, cv.cvtColor(fg, cv.COLOR_GRAY2BGR)])


print('입력 소스가 vtest 동영상이면 처음 몇 초 동안 배경을 학습한 뒤 걷는 사람만 상자로 표시됩니다.')
`, desc: '<p>배경 차분(background subtraction)은 여러 프레임을 보며 “움직이지 않는 배경”을 학습하고, 그와 다른 픽셀만 전경으로 남깁니다. 한 장의 이미지로는 할 수 없는, <b>시간 정보</b>를 쓰는 기법입니다. 결과 마스크 뒤의 모폴로지 · 컨투어 · 상자 그리기는 이번 과정에서 배운 그대로입니다 — Video Analysis 단원에서 이어서 공부하세요.</p>' },
      { type: 'text', html: `
<h3>5. 내 PC 에서 실행하기</h3>
<p>브라우저 실습 환경은 설치 없이 바로 배우기 좋지만, 수료 후에는 PC 에 직접 설치해 쓰는 것이 좋습니다(더 빠르고, 창·키보드·동영상 저장을 자유롭게 사용). (<a href="https://docs.opencv.org/4.x/d5/de5/tutorial_py_setup_in_windows.html" target="_blank" rel="noopener">공식 설치 안내</a>)</p>
<ol>
  <li><a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org</a> 에서 Python 3 설치 (Windows 는 설치 화면에서 <b>Add python.exe to PATH</b> 체크)</li>
  <li>터미널(명령 프롬프트)에서 패키지 설치:
<pre>pip install opencv-python numpy matplotlib</pre></li>
  <li>설치 확인: <code>python -c "import cv2; print(cv2.__version__)"</code></li>
  <li>편집기(VS Code 등)에서 <code>.py</code> 파일을 만들고, 실습 이미지는 같은 폴더에 두기 (<a href="https://github.com/opencv/opencv/tree/4.x/samples/data" target="_blank" rel="noopener">OpenCV samples/data</a>)</li>
</ol>` },
      { type: 'table', head: ['웹 실습 환경', '데스크톱 (PC)', '옮길 때 할 일'], rows: [
        ['<code>def process(frame):</code> 를 정의하면 자동 반복 호출', '<code>while True:</code> 루프에서 <code>cap.read()</code> 로 직접 읽기', '루프 안에서 <code>out = process(frame)</code> 호출'],
        ['<code>cv.waitKey()</code> 는 즉시 -1', '<code>cv.waitKey(1)</code> 이 창을 갱신하고 키 입력을 받음', '루프마다 <code>waitKey(1)</code>, <kbd>q</kbd> 로 종료'],
        ['<code>webcv.get_input()</code>', '없음', '<code>cv.imread(\'파일\')</code> 또는 <code>VideoCapture(0)</code> 으로 바꾸기'],
        ['imwrite → 다운로드 링크', '현재 폴더에 파일 저장', '저장 경로 확인'],
        ['트랙바/마우스는 결과 패널에', '실제 OpenCV 창에', '<code>namedWindow</code> 를 먼저, 창 이름 일치'],
        ['동영상 파일: 입력 소스로 재생', '<code>VideoCapture(\'vtest.avi\')</code> 로 직접 끝까지 읽기', '<code>ret</code> 가 False 면 루프 종료'],
      ] },
      { type: 'code', title: '참고 · 웹용 process(frame) 코드를 데스크톱에서 실행하는 틀 (PC 전용)', norun: true, code: String.raw`
import cv2 as cv
import numpy as np

KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def process(frame):
    """웹 실습에서 만든 함수를 그대로 복사해 넣는다."""
    blur = cv.GaussianBlur(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), (5, 5), 0)
    mask = cv.dilate(cv.morphologyEx(cv.Canny(blur, 30, 90), cv.MORPH_CLOSE, KERNEL, iterations=2), KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    out = frame.copy()
    for c in contours:
        if cv.contourArea(c) > 500:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    return out


def main():
    cap = cv.VideoCapture(0)                 # 웹캠 (동영상 파일이면 'vtest.avi')
    if not cap.isOpened():
        print('카메라를 열 수 없습니다')
        return
    frame_no = 0
    while True:
        ret, frame = cap.read()
        if not ret:                          # 동영상 끝 또는 카메라 오류
            break
        out = process(frame)
        cv.imshow('result', out)
        key = cv.waitKey(1) & 0xFF           # 창 갱신 + 키 입력 (1ms 대기)
        if key == ord('q'):                  # q: 종료
            break
        if key == ord('s'):                  # s: 현재 결과 저장
            cv.imwrite(f'capture_{frame_no:04d}.png', out)
            print('saved')
        frame_no += 1
    cap.release()
    cv.destroyAllWindows()


if __name__ == '__main__':
    main()
`, desc: '<p><code>process()</code> 는 한 글자도 바꾸지 않고, 그 바깥의 “읽기 → 처리 → 보여 주기 → 키 확인” 루프만 추가했습니다. 이번 과정에서 함수로 나눠 두는 습관을 들인 덕분에 옮기기가 쉽습니다. 이 코드는 웹 환경에서는 실행하지 마세요(while 루프 금지).</p>' },
      { type: 'checklist', title: '수료 후 4주 학습 계획 (하나씩 체크)', items: [
        '1주: PC 에 opencv-python 설치, 팀 프로젝트 코드를 데스크톱 루프로 옮겨 실행',
        '1주: 이번 과정에서 이해가 부족했던 교시 2개 복습 (수료 퀴즈 틀린 문제 기준)',
        '2주: Feature Detection 단원 — ORB 매칭 + 호모그래피로 책 표지 찾기',
        '3주: Video Analysis 단원 — 배경 차분 또는 옵티컬 플로로 움직임 감지',
        '4주: 팀 프로젝트의 Try 목록 중 하나를 새 기법으로 개선해 README 업데이트',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 효과 스튜디오에 스케치 모드 추가하기',
        desc: `<p>아래는 효과 스튜디오의 축소판입니다. <code>mode_sketch()</code> 를 완성하고 mode 트랙바 최대값을 늘려 <b>연필 스케치 모드</b>(mode 3)를 추가하세요. 스케치 공식: 흑백 <code>gray</code> 를 반전(<code>255 - gray</code>)해 큰 가우시안 블러(21×21)를 준 뒤, <code>cv.divide(gray, 255 - blur, scale=256)</code> 으로 “닷지” 합성합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'result'
MODES = ['0 original', '1 gray', '2 edges']          # TODO 1: '3 sketch' 추가


def nothing(x):
    pass


cv.namedWindow(WIN)
cv.createTrackbar('mode', WIN, 2, len(MODES) - 1, nothing)


def mode_sketch(img):
    """연필 스케치 효과 (3채널로 돌려주기)."""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    # TODO 2: inv = 255 - gray → blur = GaussianBlur(inv, (21, 21), 0) → sketch = cv.divide(gray, 255 - blur, scale=256)
    sketch = gray
    return cv.cvtColor(sketch, cv.COLOR_GRAY2BGR)


def process(frame):
    mode = cv.getTrackbarPos('mode', WIN)
    if mode == 1:
        out = cv.cvtColor(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), cv.COLOR_GRAY2BGR)
    elif mode == 2:
        out = cv.cvtColor(cv.Canny(frame, 80, 160), cv.COLOR_GRAY2BGR)
    # TODO 3: mode == 3 이면 mode_sketch(frame)
    else:
        out = frame.copy()
    cv.putText(out, MODES[min(mode, len(MODES) - 1)], (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out
`,
        hint: `<p><code>MODES</code> 에 항목을 더하면 트랙바 최대값(<code>len(MODES) - 1</code>)도 자동으로 3 이 됩니다. <code>cv.divide</code> 는 두 uint8 이미지를 나누고 scale 을 곱해 밝은 스케치를 만듭니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'result'
MODES = ['0 original', '1 gray', '2 edges', '3 sketch']


def nothing(x):
    pass


cv.namedWindow(WIN)
cv.createTrackbar('mode', WIN, 3, len(MODES) - 1, nothing)


def mode_sketch(img):
    """연필 스케치 효과 (3채널로 돌려주기)."""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    inv = 255 - gray
    blur = cv.GaussianBlur(inv, (21, 21), 0)
    sketch = cv.divide(gray, 255 - blur, scale=256)
    return cv.cvtColor(sketch, cv.COLOR_GRAY2BGR)


def process(frame):
    mode = cv.getTrackbarPos('mode', WIN)
    if mode == 1:
        out = cv.cvtColor(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), cv.COLOR_GRAY2BGR)
    elif mode == 2:
        out = cv.cvtColor(cv.Canny(frame, 80, 160), cv.COLOR_GRAY2BGR)
    elif mode == 3:
        out = mode_sketch(frame)
    else:
        out = frame.copy()
    cv.putText(out, MODES[min(mode, len(MODES) - 1)], (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out
`,
      },
      {
        title: '실습 2 · 여러 이미지 일괄 처리기 (PC 로 옮기기 좋은 구조)',
        desc: `<p>팀 프로젝트를 여러 이미지에 한 번에 적용하는 <b>일괄 처리기</b>를 만드세요. <code>FILES</code> 의 각 이미지에 <code>process()</code> 를 적용해 ① 결과를 <code>out_파일이름.png</code> 로 저장하고, ② 이름 · 크기 · 처리 시간(ms)을 표로 출력하고, ③ 모든 결과를 가로 240 칸의 격자로 합쳐 보여 주세요. 이 구조는 PC 에서도 그대로 동작합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time

FILES = ['stuff.jpg', 'pic1.png', 'smarties.png', 'blox.jpg']


def process(frame):
    """팀 파이프라인 자리 (예시: 엣지 오버레이)."""
    edges = cv.Canny(cv.GaussianBlur(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), (5, 5), 0), 50, 150)
    out = frame.copy()
    out[edges > 0] = (0, 0, 255)
    return out


results = []
for name in FILES:
    img = cv.imread(name)
    if img is None:
        print('건너뜀:', name)
        continue
    # TODO 1: 처리 시간을 재면서 out = process(img)
    out = process(img)
    # TODO 2: 'out_' + name 을 png 로 저장 (확장자 바꾸기: name.rsplit('.', 1)[0])
    # TODO 3: 이름, 크기, ms 를 한 줄로 출력
    results.append(out)

# TODO 4: results 를 240×180 칸, 2열 격자로 합쳐 imshow
cv.imshow('first result', results[0])
`,
        hint: `<p>시간: <code>t0 = time.perf_counter()</code> … <code>ms = (time.perf_counter() - t0) * 1000</code>. 격자: 각 결과를 <code>cv.resize(out, (240, 180))</code> 한 뒤 두 개씩 <code>np.hstack</code>, 그 줄들을 <code>np.vstack</code>. 개수가 홀수면 검은 칸을 하나 더하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time

FILES = ['stuff.jpg', 'pic1.png', 'smarties.png', 'blox.jpg']


def process(frame):
    """팀 파이프라인 자리 (예시: 엣지 오버레이)."""
    edges = cv.Canny(cv.GaussianBlur(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), (5, 5), 0), 50, 150)
    out = frame.copy()
    out[edges > 0] = (0, 0, 255)
    return out


results = []
print(f'{"file":14s} {"size":>9s} {"ms":>7s}')
for name in FILES:
    img = cv.imread(name)
    if img is None:
        print('건너뜀:', name)
        continue
    t0 = time.perf_counter()
    out = process(img)
    ms = (time.perf_counter() - t0) * 1000
    out_name = 'out_' + name.rsplit('.', 1)[0] + '.png'
    cv.imwrite(out_name, out)
    print(f'{name:14s} {img.shape[1]:>4d}x{img.shape[0]:<4d} {ms:7.2f}  -> {out_name}')
    results.append(out)

cells = [cv.resize(r, (240, 180), interpolation=cv.INTER_AREA) for r in results]
if len(cells) % 2:
    cells.append(np.zeros((180, 240, 3), np.uint8))
grid = np.vstack([np.hstack(cells[i:i + 2]) for i in range(0, len(cells), 2)])
cv.imshow('batch results', grid)
`,
      },
    ],
    quiz: [
      { q: '[1주] 640×480 컬러 이미지를 cv.imread 로 읽었을 때 img.shape 는?', options: ['(640, 480, 3)', '(480, 640, 3)', '(480, 640)', '(3, 480, 640)'], answer: 1, explain: 'NumPy 배열은 (행=세로, 열=가로, 채널) 순서입니다. 반면 cv.resize 등의 크기 인자는 (가로, 세로)입니다.' },
      { q: '[1주] cv.imread 로 읽은 이미지를 plt.imshow 로 그대로 보이면 색이 이상한 이유는?', options: ['Matplotlib 이 흑백만 지원해서', 'OpenCV 는 BGR, Matplotlib 은 RGB 순서라서', 'imread 가 HSV 로 읽어서', '이미지가 float 라서'], answer: 1, explain: 'cv.cvtColor(img, cv.COLOR_BGR2RGB) 로 바꾼 뒤 plt.imshow 해야 올바른 색이 나옵니다.' },
      { q: '[2주] OpenCV 에서 HSV 의 H(색상) 값 범위는?', options: ['0 ~ 360', '0 ~ 255', '0 ~ 179', '0 ~ 100'], answer: 2, explain: '8비트에 담기 위해 360도를 절반으로 나눠 0~179 를 씁니다. 빨강은 0 근처와 179 근처 양쪽에 있습니다.' },
      { q: '[2주] 원근 변환(cv.getPerspectiveTransform)에 필요한 대응점의 수는?', options: ['2쌍', '3쌍', '4쌍', '8쌍'], answer: 2, explain: '어파인 변환은 3쌍, 원근 변환은 4쌍의 대응점이 필요합니다.' },
      { q: '[2주] Otsu 이진화(THRESH_OTSU)가 자동으로 정해 주는 것은?', options: ['블러 커널 크기', '히스토그램을 두 무리로 가장 잘 나누는 임계값', '이미지 회전 각도', '컨투어 개수'], answer: 1, explain: 'Otsu 는 두 봉우리 히스토그램에서 두 집단의 분산을 기준으로 최적 임계값을 계산합니다. 조명이 고르지 않으면 한계가 있습니다.' },
      { q: '[2주] 소금-후추(흰/검은 점) 잡음 제거에 가장 효과적인 필터는?', options: ['평균 블러', '가우시안 블러', '미디언 블러', '샤프닝 필터'], answer: 2, explain: '미디언 블러는 주변 값의 중앙값을 쓰므로 튀는 점을 없애면서 경계를 비교적 잘 보존합니다.' },
      { q: '[3주] 모폴로지 열기(Opening) 연산의 순서와 주된 효과는?', options: ['팽창 → 침식, 물체 안의 작은 구멍 메우기', '침식 → 팽창, 작은 흰 잡음 점 제거', '침식만, 물체를 가늘게', '팽창만, 물체를 두껍게'], answer: 1, explain: '열기는 침식 후 팽창으로 작은 흰 잡음을 없앱니다. 닫기(팽창 → 침식)는 작은 구멍과 끊긴 틈을 메웁니다(책상 물건 분석기에서 사용).' },
      { q: '[3주] cv.Canny(img, 50, 150) 에서 두 임계값의 역할은?', options: ['150 이상은 확실한 엣지, 50~150 은 확실한 엣지와 이어질 때만 엣지(히스테리시스)', '50 은 블러 크기, 150 은 커널 크기', '엣지 두께의 최소·최대', '결과 이미지의 밝기 범위'], answer: 0, explain: '강한 엣지를 기준으로 약한 엣지를 연결 여부에 따라 살리거나 버리는 히스테리시스 임계처리입니다.' },
      { q: '[3주] 원형도 4π×면적/둘레² 값이 1 에 가장 가까운 도형은?', options: ['가늘고 긴 막대', '정사각형', '원', '별 모양'], answer: 2, explain: '원이 1, 정사각형은 약 0.785, 가늘고 길거나 들쭉날쭉할수록 0 에 가까워집니다.' },
      { q: '[3주] 전역 equalizeHist 대신 CLAHE 를 쓰는 주된 이유는?', options: ['컬러 이미지에만 쓸 수 있어서', '타일별로 국소 대비를 높이고 clipLimit 로 잡음 증폭을 제한해서', '처리 속도가 항상 더 빨라서', '이진화까지 해 주어서'], answer: 1, explain: 'CLAHE 는 이미지를 작은 타일로 나눠 평활화하고 대비 증폭을 제한해, 일부가 너무 밝아지거나 잡음이 커지는 문제를 줄입니다.' },
    ],
  },
]);
