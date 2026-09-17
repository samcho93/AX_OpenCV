/* =========================================================================
 * 🏭 머신비전 외관검사 데모
 * 이미지: tools/gen_app_images_inspection.py 로 생성 (images/apps/)
 * ========================================================================= */

/* ------------------------------------------------------------------ PCB */
APPS.add({
  id: 'pcb',
  cat: 'inspection',
  icon: '🔌',
  title: 'PCB 외관 결함 검사',
  subtitle: '기준(골든) 보드와 비교해 부품 누락 · 납땜 브리지 · 이물을 찾기',
  summary: `<p>전자제품 공장의 SMT 라인 끝에는 <b>AOI(Automated Optical Inspection, 자동 광학 검사) 장비</b>가 있어서, 부품을 올리고 납땜한 기판을 한 장씩 카메라로 찍어 불량을 걸러냅니다.
가장 기본이 되는 방법이 <b>골든 이미지 비교</b>입니다. 불량이 없는 “기준 보드” 사진을 저장해 두고, 검사할 보드를 그 위에 정확히 겹친 뒤 <b>달라진 곳만</b> 찾는 것이죠.</p>
<p>문제는 컨베이어 위의 보드가 매번 몇 픽셀씩 밀리고 살짝 돌아가 있다는 점입니다. 그래서 먼저 <b>ORB 특징점 + 호모그래피</b>로 검사 이미지를 기준 이미지에 맞춰 정렬하고, 그 다음에 차영상을 구합니다.
찾은 결함은 번호 상자로 표시하고, 기준 보드에는 있었는데 사라진 것(MISSING)인지, 없던 것이 생긴 것(SOLDER 땜납 · FOREIGN 이물)인지 추정합니다.</p>`,
  uses: [
    ['전자 제조(SMT)', '리플로우 납땜 후 AOI 장비가 부품 누락 · 틀어짐 · 뒤집힘 · 납땜 브리지 · 미납을 전수 검사'],
    ['반도체 패키지', '리드프레임 · 웨이퍼 다이의 패턴을 기준 다이와 비교해 이물 · 패턴 결함 검출(Die-to-Die 비교)'],
    ['디스플레이 패널', '기준 패턴과 비교해 전극 단선 · 쇼트, 컬러필터 이물 검사'],
    ['인쇄 · 라벨', '인쇄된 포장재 · 라벨을 마스터 시안과 비교해 글자 누락 · 번짐 · 잉크 튐 검사'],
    ['조립 검사', '완성품 사진을 기준 조립품과 비교해 나사 · 커넥터 · 케이블 누락 확인'],
  ],
  steps: [
    '기준(골든) 보드 이미지에서 ORB 특징점을 미리 한 번 계산해 둠',
    '검사 이미지에서도 ORB 특징점을 찾고 기준 이미지와 매칭 (<code>BFMatcher</code> + 비율 테스트)',
    '<code>cv.findHomography(RANSAC)</code> 로 위치 · 회전 차이를 구하고 <code>warpPerspective</code> 로 정렬 — 매칭이 부족하면 <b>ALIGN FAIL</b>',
    '두 이미지를 살짝 블러한 뒤 <code>cv.absdiff</code> → 채널별 최댓값을 차이값으로 사용',
    '<code>sensitivity</code> 로 이진화 → 열림(open) 연산으로 정렬 오차 잡티 제거 → 팽창으로 결함 조각 묶기',
    '<code>findContours</code> 로 결함 영역 → 면적 필터 → 색(초록 기판/금속/기타) 비교로 MISSING · SOLDER · FOREIGN 추정',
    '결함 상자를 원래 이미지 좌표로 되돌려 번호와 함께 그리고 OK / NG 판정',
  ],
  tech: ['cv.ORB_create', 'cv.BFMatcher', 'cv.findHomography', 'cv.warpPerspective', 'cv.absdiff', 'cv.threshold', 'cv.morphologyEx', 'cv.findContours', 'cv.perspectiveTransform'],
  controls: [
    ['sensitivity', '두 이미지의 색 차이가 이 값보다 크면 결함 후보. 낮출수록 민감하지만 정렬 오차 · 노이즈까지 잡혀 과검(가짜 불량)이 늘어남'],
    ['min_area', '이 면적(픽셀)보다 작은 차이는 무시. 먼지 · 노이즈를 거르는 최소 결함 크기'],
  ],
  inputs: ['pcb_missing.png', 'pcb_bridge.png', 'pcb_extra.png', 'pcb_ok.png', 'camera'],
  assets: ['pcb_golden.png', 'pcb_ok.png', 'pcb_missing.png', 'pcb_bridge.png', 'pcb_extra.png'],
  note: `모든 이미지는 합성 이미지이며, 기준 이미지는 <code>pcb_golden.png</code> 입니다. <b>pcb_ok.png</b> 는 불량은 없지만 보드가 밀리고 약 1° 돌아가 있어 “정렬이 왜 필요한지” 확인할 수 있습니다.
웹캠처럼 기준 보드와 전혀 다른 장면이 들어오면 특징점 매칭이 실패하므로 <b>NO PCB / ALIGN FAIL</b> 을 표시합니다.
실제 AOI 장비는 여러 각도의 조명(RGB 돔 조명, 동축 조명)과 3D 측정(납땜 높이)까지 함께 사용하고, 부품마다 검사 영역(ROI)과 기준을 따로 둡니다.
<b>sensitivity</b> 를 아주 낮추면(15 이하) 조명 · 정렬 오차 같은 작은 차이까지 결함으로 잡히는 <b>과검</b>이, 100 이상으로 올리면 부품 누락을 놓치는 <b>미검</b>이 생기는 것도 확인해 보세요.`,
  refs: [
    ['OpenCV: Feature Matching + Homography', 'https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html'],
    ['OpenCV: ORB', 'https://docs.opencv.org/4.x/d1/d89/tutorial_py_orb.html'],
    ['OpenCV: Morphological Transformations', 'https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html'],
    ['OpenCV: Contour Features', 'https://docs.opencv.org/4.x/dd/d49/tutorial_py_contour_features.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np
import time
try:
    import webcv
    IS_IMAGE = not (webcv.is_camera() or webcv.is_video())
except Exception:
    IS_IMAGE = True

cv.namedWindow('result')
cv.createTrackbar('sensitivity', 'result', 45, 120, lambda x: None)
cv.createTrackbar('min_area', 'result', 40, 400, lambda x: None)

GOLD = cv.imread('pcb_golden.png')
GH, GW = GOLD.shape[:2]
orb = cv.ORB_create(nfeatures=1500, fastThreshold=12)
KP_G, DES_G = orb.detectAndCompute(cv.cvtColor(GOLD, cv.COLOR_BGR2GRAY), None)
matcher = cv.BFMatcher(cv.NORM_HAMMING)
GOLD_BLUR = cv.GaussianBlur(GOLD, (5, 5), 0)
GOLD_HSV = cv.cvtColor(GOLD_BLUR, cv.COLOR_BGR2HSV)

def green_mask(hsv):
    return cv.inRange(hsv, (35, 70, 35), (90, 255, 255))

def metal_mask(hsv):
    return cv.inRange(hsv, (0, 0, 130), (180, 70, 255))

# 기판 영역(검사 영역) = 가장 큰 초록 덩어리의 볼록 껍질을 조금 안쪽으로
_g = cv.morphologyEx(green_mask(GOLD_HSV), cv.MORPH_CLOSE, np.ones((25, 25), np.uint8))
_cs, _ = cv.findContours(_g, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
BOARD = np.zeros((GH, GW), np.uint8)
cv.fillPoly(BOARD, [cv.convexHull(max(_cs, key=cv.contourArea))], 255)
BOARD = cv.erode(BOARD, np.ones((15, 15), np.uint8))
NG_GOLD = cv.bitwise_not(green_mask(GOLD_HSV))

def badge(img, text, color, sub=''):
    (tw, th), _ = cv.getTextSize(text, cv.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    cv.rectangle(img, (8, 8), (24 + tw, 20 + th), color, -1)
    cv.putText(img, text, (16, 14 + th), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    if sub:
        (sw, sh), _ = cv.getTextSize(sub, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv.rectangle(img, (30 + tw, 8), (42 + tw + sw, 20 + th), (40, 40, 40), -1)
        cv.putText(img, sub, (36 + tw, 14 + th // 2 + sh // 2 + 2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)

def stamp_time(img, t0):
    s = '%.0f ms' % ((time.perf_counter() - t0) * 1000)
    w = img.shape[1]
    (tw, th), _ = cv.getTextSize(s, cv.FONT_HERSHEY_SIMPLEX, 0.45, 1)
    cv.rectangle(img, (w - tw - 16, 8), (w - 8, 16 + th), (40, 40, 40), -1)
    cv.putText(img, s, (w - tw - 12, 12 + th), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)

def align(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    kp, des = orb.detectAndCompute(gray, None)
    if des is None or len(kp) < 30:
        return None, 0
    pairs = matcher.knnMatch(des, DES_G, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < 30:
        return None, len(good)
    src = np.float32([kp[m.queryIdx].pt for m in good])
    dst = np.float32([KP_G[m.trainIdx].pt for m in good])
    Hm, inl = cv.findHomography(src, dst, cv.RANSAC, 3.0)
    if Hm is None:
        return None, 0
    n = int(inl.sum())
    scale = np.sqrt(abs(np.linalg.det(Hm[:2, :2])))
    if n < 60 or not (0.7 < scale < 1.4) or abs(Hm[2, 0]) > 1e-3 or abs(Hm[2, 1]) > 1e-3:
        return None, n
    return Hm, n

def process(frame):
    t0 = time.perf_counter()
    out = frame.copy()
    sens = max(5, cv.getTrackbarPos('sensitivity', 'result'))
    min_area = cv.getTrackbarPos('min_area', 'result')
    Hm, n_inl = align(frame)
    if Hm is None:
        badge(out, 'NO PCB / ALIGN FAIL', (0, 140, 255), 'matches %d' % n_inl)
        stamp_time(out, t0)
        if IS_IMAGE:
            print('기준 보드와 정렬할 수 없습니다 (일치 특징점 %d개). PCB 이미지를 넣어 주세요.' % n_inl)
        return out

    aligned = cv.warpPerspective(frame, Hm, (GW, GH))
    valid = cv.warpPerspective(np.full(frame.shape[:2], 255, np.uint8), Hm, (GW, GH))
    valid = cv.bitwise_and(cv.erode(valid, np.ones((9, 9), np.uint8)), BOARD)

    ab = cv.GaussianBlur(aligned, (5, 5), 0)
    diff = cv.absdiff(ab, GOLD_BLUR).max(axis=2)
    diff = cv.bitwise_and(diff, valid)
    _, raw = cv.threshold(diff, sens, 255, cv.THRESH_BINARY)
    raw = cv.morphologyEx(raw, cv.MORPH_OPEN, np.ones((3, 3), np.uint8))
    grouped = cv.dilate(raw, cv.getStructuringElement(cv.MORPH_ELLIPSE, (11, 11)))
    cs, _ = cv.findContours(grouped, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    hsv_t = cv.cvtColor(ab, cv.COLOR_BGR2HSV)
    ng_test = cv.bitwise_not(green_mask(hsv_t))
    metal_t = metal_mask(hsv_t)
    Hinv = np.linalg.inv(Hm)
    defects = []
    for c in cs:
        x, y, w, h = cv.boundingRect(c)
        m = raw[y:y + h, x:x + w]
        area = cv.countNonZero(m)
        if area < min_area:
            continue
        cg = cv.countNonZero(cv.bitwise_and(m, NG_GOLD[y:y + h, x:x + w]))
        ct = cv.countNonZero(cv.bitwise_and(m, ng_test[y:y + h, x:x + w]))
        cm = cv.countNonZero(cv.bitwise_and(m, metal_t[y:y + h, x:x + w]))
        if cg > ct * 1.3:
            kind = 'MISSING'
        elif cm > 0.35 * area:
            kind = 'SOLDER'
        else:
            kind = 'FOREIGN'
        defects.append((kind, area, (x, y, w, h)))

    for i, (kind, area, (x, y, w, h)) in enumerate(defects, 1):
        p = 6
        box = np.float32([[x - p, y - p], [x + w + p, y - p], [x + w + p, y + h + p], [x - p, y + h + p]]).reshape(-1, 1, 2)
        pts = cv.perspectiveTransform(box, Hinv).astype(np.int32)
        cv.polylines(out, [pts], True, (0, 0, 255), 2, cv.LINE_AA)
        bx, by = pts[:, 0, 0].min(), pts[:, 0, 1].min()
        label = '%d %s' % (i, kind)
        (tw, th), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        ty = by - 6 if by - th - 10 > 0 else pts[:, 0, 1].max() + th + 6
        cv.rectangle(out, (bx, ty - th - 4), (bx + tw + 6, ty + 4), (0, 0, 255), -1)
        cv.putText(out, label, (bx + 3, ty), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)

    if defects:
        badge(out, 'NG', (0, 0, 220), 'defects %d' % len(defects))
    else:
        badge(out, 'OK', (0, 170, 0), 'aligned, %d matches' % n_inl)
    stamp_time(out, t0)

    heat = cv.applyColorMap(cv.convertScaleAbs(diff, alpha=2.5), cv.COLORMAP_JET)
    heat[valid == 0] = (40, 40, 40)
    cv.imshow('diff', heat)
    if IS_IMAGE:
        if defects:
            names = {'MISSING': '부품 누락', 'SOLDER': '땜납(브리지)', 'FOREIGN': '이물'}
            print('NG: 결함 %d개 → ' % len(defects) + ', '.join('%d번 %s(%d px)' % (i, names[k], a) for i, (k, a, _) in enumerate(defects, 1)))
        else:
            print('OK: 기준 보드와 차이 없음 (정렬 특징점 %d개)' % n_inl)
    return out
`,
});

/* ------------------------------------------------------------------ 금속 표면 */
APPS.add({
  id: 'scratch',
  cat: 'inspection',
  icon: '🔩',
  title: '금속 표면 스크래치 · 얼룩 검사',
  subtitle: '헤어라인 금속 표면에서 긁힘 · 찍힘 · 얼룩을 찾아 종류별로 분류',
  summary: `<p>스마트폰 케이스, 가전제품 외장, 자동차 몰딩 같은 <b>금속 외관 부품</b>은 작은 긁힘 하나로도 고객 불만이 생기기 때문에 출하 전에 표면을 검사합니다.
어려운 점은 금속 표면 자체에 <b>헤어라인 결</b>과 <b>조명 반사 얼룩</b>이 있어서, 단순히 “어두운 곳 / 밝은 곳”을 찾으면 정상 결까지 불량으로 잡힌다는 것입니다.</p>
<p>이 데모는 이미지를 크게 줄여 <b>배경(조명 · 결의 큰 흐름)</b>을 추정한 뒤 원본에서 빼서, 배경보다 튀는 부분만 남깁니다(탑햇 · 블랙햇과 같은 원리).
남은 영역의 <b>모양</b>을 분석해 가늘고 긴 것은 <b>SCRATCH</b>(긁힘), 작고 둥근 것은 <b>DENT</b>(찍힘 · 핀홀), 넓게 번진 것은 <b>STAIN</b>(얼룩)으로 분류합니다.</p>`,
  uses: [
    ['스마트폰 · 노트북 외장', '알루미늄 하우징 아노다이징 전후 긁힘 · 찍힘 · 이색(얼룩) 검사'],
    ['철강 · 압연', '열연 · 냉연 강판 표면 검사기(SDD)가 초고속 라인에서 스크래치 · 스케일 · 구멍 검출'],
    ['자동차 부품', '도금 · 도장 부품의 흠집 · 먼지 붙음(도장 이물) · 흐름 자국 검사'],
    ['2차전지', '배터리 캔 · 파우치 표면의 찍힘 · 긁힘, 전극 코팅 핀홀 검사'],
    ['유리 · 필름', '디스플레이 커버글라스 · 광학필름의 긁힘 · 얼룩 검사'],
  ],
  steps: [
    '흑백 변환 + 5×5 블러로 센서 노이즈 · 가는 결 줄이기',
    '1/8 로 축소 → <code>medianBlur</code> → 원래 크기로 확대해 <b>배경(조명 · 반사 띠)</b> 추정',
    '<code>cv.subtract</code> 로 “배경보다 밝은 결함”과 “배경보다 어두운 결함”을 각각 구해 합침',
    '<code>threshold</code> 로 이진화 → 닫힘 연산으로 끊어진 긁힘 잇기',
    '<code>findContours</code> → <code>minAreaRect</code> 로 길이 · 폭 · 가늘기(길이/폭) 계산',
    '길고 가늘면 SCRATCH, 넓으면 STAIN, 작으면 DENT 로 분류하고 결함 수로 OK / NG 판정',
  ],
  tech: ['cv.resize', 'cv.medianBlur', 'cv.subtract', 'cv.threshold', 'cv.morphologyEx', 'cv.findContours', 'cv.minAreaRect', 'cv.contourArea'],
  controls: [
    ['threshold', '배경과의 밝기 차이가 이 값보다 크면 결함 후보. 낮추면 옅은 얼룩도 잡지만 금속 결이 과검될 수 있음'],
    ['min_area', '이 면적(픽셀)보다 작은 점은 무시 (먼지 · 노이즈 거르기)'],
  ],
  inputs: ['scratch_line.png', 'scratch_dent.png', 'scratch_stain.png', 'scratch_ok.png'],
  assets: ['scratch_ok.png', 'scratch_line.png', 'scratch_dent.png', 'scratch_stain.png'],
  note: `합성 이미지 기준 배율은 0.05 mm/픽셀(시야 32×24 mm)로 가정해 긁힘 길이를 mm 로 표시합니다.
실제 현장에서는 <b>조명이 알고리즘보다 중요</b>합니다. 긁힘은 낮은 각도에서 비추는 <b>저각(다크필드) 조명</b>에서 밝게 빛나고, 거울 같은 표면의 찍힘 · 얼룩은 <b>동축 조명</b>에서 잘 보입니다.
결 방향이 뚜렷한 표면은 결 방향으로 긴 필터를 쓰거나, 결함이 매우 다양하면 딥러닝 이상 탐지(정상 이미지만 학습)를 함께 쓰기도 합니다.`,
  refs: [
    ['OpenCV: Morphological Transformations (Top Hat · Black Hat)', 'https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html'],
    ['OpenCV: Image Thresholding', 'https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html'],
    ['OpenCV: Contour Features', 'https://docs.opencv.org/4.x/dd/d49/tutorial_py_contour_features.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np
import time
try:
    import webcv
    IS_IMAGE = not (webcv.is_camera() or webcv.is_video())
except Exception:
    IS_IMAGE = True

MM_PER_PX = 0.05
cv.namedWindow('result')
cv.createTrackbar('threshold', 'result', 24, 80, lambda x: None)
cv.createTrackbar('min_area', 'result', 25, 400, lambda x: None)

COLORS = {'SCRATCH': (0, 0, 255), 'DENT': (255, 0, 255), 'STAIN': (0, 140, 255)}

def badge(img, text, color, sub=''):
    (tw, th), _ = cv.getTextSize(text, cv.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    cv.rectangle(img, (8, 8), (24 + tw, 20 + th), color, -1)
    cv.putText(img, text, (16, 14 + th), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    if sub:
        (sw, sh), _ = cv.getTextSize(sub, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv.rectangle(img, (30 + tw, 8), (42 + tw + sw, 20 + th), (40, 40, 40), -1)
        cv.putText(img, sub, (36 + tw, 14 + th // 2 + sh // 2 + 2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)

def stamp_time(img, t0):
    s = '%.0f ms' % ((time.perf_counter() - t0) * 1000)
    w = img.shape[1]
    (tw, th), _ = cv.getTextSize(s, cv.FONT_HERSHEY_SIMPLEX, 0.45, 1)
    cv.rectangle(img, (w - tw - 16, 8), (w - 8, 16 + th), (40, 40, 40), -1)
    cv.putText(img, s, (w - tw - 12, 12 + th), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)

def process(frame):
    t0 = time.perf_counter()
    out = frame.copy()
    thr = max(3, cv.getTrackbarPos('threshold', 'result'))
    min_area = cv.getTrackbarPos('min_area', 'result')
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    h, w = gray.shape
    g = cv.GaussianBlur(gray, (5, 5), 0)

    # 1) 배경 추정: 크게 줄여서 median → 다시 확대 (결함은 사라지고 조명만 남음)
    small = cv.resize(g, (max(16, w // 8), max(16, h // 8)), interpolation=cv.INTER_AREA)
    bg = cv.medianBlur(small, 15)
    bg = cv.GaussianBlur(bg, (5, 5), 0)
    bg = cv.resize(bg, (w, h), interpolation=cv.INTER_LINEAR)

    # 2) 배경보다 밝은 결함(탑햇 원리) + 어두운 결함(블랙햇 원리)
    bright = cv.subtract(g, bg)
    dark = cv.subtract(bg, g)
    diff = cv.max(bright, dark)
    _, mask = cv.threshold(diff, thr, 255, cv.THRESH_BINARY)
    mask = cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((2, 2), np.uint8))
    # 끊어진 긁힘 조각을 하나로 묶기 위해 팽창한 마스크로 윤곽선을 찾음
    grouped = cv.dilate(mask, cv.getStructuringElement(cv.MORPH_ELLIPSE, (13, 13)))

    cs, _ = cv.findContours(grouped, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    found = []
    for c in cs:
        x, y, bw, bh = cv.boundingRect(c)
        roi = np.zeros((bh, bw), np.uint8)
        cv.drawContours(roi, [c - (x, y)], -1, 255, -1)
        area = cv.countNonZero(cv.bitwise_and(mask[y:y + bh, x:x + bw], roi))   # 실제 결함 픽셀 수
        if area < max(1, min_area):
            continue
        (cx, cy), (rw, rh), ang = cv.minAreaRect(c)
        L, Wd = max(rw, rh) - 12, max(1.0, min(rw, rh) - 12)
        if L >= 40 and L / Wd >= 4:
            kind = 'SCRATCH'
        elif area >= 600:
            kind = 'STAIN'
        else:
            kind = 'DENT'
        found.append((kind, c, L, area))

    vis = np.zeros((h, w, 3), np.uint8)
    vis[..., 2] = cv.convertScaleAbs(bright, alpha=3)
    vis[..., 0] = cv.convertScaleAbs(dark, alpha=3)
    vis[..., 1] = mask // 3
    for i, (kind, c, L, area) in enumerate(found, 1):
        col = COLORS[kind]
        if kind == 'SCRATCH':
            box = cv.boxPoints(cv.minAreaRect(c)).astype(np.intp)
            cv.drawContours(out, [box], 0, col, 2, cv.LINE_AA)
            label = '%d SCRATCH %.1fmm' % (i, L * MM_PER_PX)
            x, y = box[np.argmin(box[:, 1])]      # 가장 위 꼭짓점 근처에 글자
            x -= 40
        else:
            x, y, bw, bh = cv.boundingRect(c)
            cv.rectangle(out, (x - 5, y - 5), (x + bw + 5, y + bh + 5), col, 2, cv.LINE_AA)
            label = '%d %s' % (i, kind)
            x, y = x - 5, y - 5
        (tw, th), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        ty = y - 6 if y - th - 10 > 0 else y + th + 12
        x = int(min(max(0, x), w - tw - 8))
        cv.rectangle(out, (x, ty - th - 4), (x + tw + 6, ty + 4), col, -1)
        cv.putText(out, label, (x + 3, ty), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)
        cv.drawContours(vis, [c], -1, (255, 255, 255), 1)

    counts = {k: sum(1 for f in found if f[0] == k) for k in COLORS}
    sub = 'scratch %d  dent %d  stain %d' % (counts['SCRATCH'], counts['DENT'], counts['STAIN'])
    badge(out, 'NG' if found else 'OK', (0, 0, 220) if found else (0, 170, 0), sub)
    stamp_time(out, t0)
    cv.imshow('defect map (red=bright, blue=dark)', vis)
    if IS_IMAGE:
        if found:
            print('NG: 스크래치 %d · 찍힘 %d · 얼룩 %d' % (counts['SCRATCH'], counts['DENT'], counts['STAIN']))
        else:
            print('OK: 표면 결함 없음')
    return out
`,
});

/* ------------------------------------------------------------------ 와셔 치수 */
APPS.add({
  id: 'measure',
  cat: 'inspection',
  icon: '📏',
  title: '와셔 치수 측정 · 합불 판정',
  subtitle: '백라이트 실루엣에서 바깥지름 · 안지름 · 진원도를 mm 로 재고 공차 판정',
  summary: `<p>나사 · 와셔 · 오링 · 프레스 가공품처럼 <b>치수가 곧 품질</b>인 부품은 캘리퍼스로 몇 개만 뽑아 재는 대신, 카메라로 <b>전수 측정</b>하는 경우가 많습니다.
이때 핵심은 <b>백라이트(투과 조명)</b>입니다. 부품 뒤에서 빛을 비추면 표면 색 · 광택과 상관없이 <b>선명한 검은 실루엣</b>이 생겨 윤곽을 정확히 잡을 수 있습니다.</p>
<p>이 데모는 Otsu 이진화로 실루엣을 만들고, <b>윤곽선 계층(hierarchy)</b>으로 “바깥 윤곽”과 그 안의 “구멍”을 짝지은 뒤,
<code>minEnclosingCircle</code>(바깥지름) · 구멍 면적(안지름) · <code>fitEllipse</code>(타원 변형 = 진원도)로 치수를 mm 단위로 계산해 <b>공칭 치수 OD 12.0 / ID 6.4 mm (M6 평와셔)</b> 대비 공차를 판정합니다.</p>`,
  uses: [
    ['체결 부품', '와셔 · 너트 · 스프링의 외경 · 내경 · 두께를 초당 수십 개씩 전수 측정 · 선별'],
    ['프레스 · 사출', '가공품의 구멍 위치 · 지름, 버(burr) · 미성형(쇼트샷) 검사'],
    ['자동차 · 베어링', '오링 · 실(seal) · 베어링 링의 진원도와 치수 공차 검사'],
    ['전자 부품', '커넥터 핀 간격 · 리드 길이, 스텐실 개구부 치수 측정'],
    ['의료 · 제약', '주사기 · 바이알 입구 지름, 스텐트 형상 측정'],
  ],
  steps: [
    '흑백 변환 + 블러 → <b>Otsu 이진화</b>(반전)로 어두운 부품 = 흰색 마스크',
    '<code>findContours(RETR_CCOMP)</code> 로 바깥 윤곽과 구멍(자식 윤곽)을 한 번에 구하기',
    '너무 작은 윤곽(먼지)과 화면 가장자리에 걸린 부품은 제외',
    '<code>minEnclosingCircle</code> → 바깥지름(OD), 구멍 면적 → 등가 안지름(ID), <code>fitEllipse</code> 장축-단축 → 진원도',
    '픽셀 × 0.1 mm/px 로 mm 환산, 공칭 치수와 비교해 공차(<code>tol</code>) 밖이면 NG',
    '부품마다 측정값과 판정을 그리고 전체 OK / NG 배지 표시',
  ],
  tech: ['cv.threshold (THRESH_OTSU)', 'cv.findContours (RETR_CCOMP)', 'hierarchy', 'cv.minEnclosingCircle', 'cv.fitEllipse', 'cv.contourArea'],
  controls: [
    ['tol_x0.01mm', '허용 공차(±). 기본 30 = ±0.30 mm. 줄이면 정상 부품도 측정 오차 때문에 NG 가 날 수 있음'],
  ],
  inputs: ['measure_hole.png', 'measure_oval.png', 'measure_burr.png', 'measure_ok.png'],
  assets: ['measure_ok.png', 'measure_hole.png', 'measure_oval.png', 'measure_burr.png'],
  note: `배율은 <b>0.1 mm/픽셀</b>(카메라 캘리브레이션으로 미리 구했다고 가정)입니다. 실제 측정 장비는 원근 왜곡이 없는 <b>텔레센트릭 렌즈</b>와 균일한 백라이트를 쓰고,
눈금 기준물(교정 게이지)로 배율을 보정하며, 서브픽셀 에지 검출로 1픽셀보다 훨씬 작은 정밀도를 얻습니다.
<b>OD</b> 는 버(burr)처럼 튀어나온 부분까지 포함하는 “최대 크기”(링 게이지와 같은 개념)라서 버 불량을 잡을 수 있고, <b>ROUND</b> 는 타원 장축-단축 차이입니다.`,
  refs: [
    ['OpenCV: Image Thresholding (Otsu)', 'https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html'],
    ['OpenCV: Contours Hierarchy', 'https://docs.opencv.org/4.x/d9/d8b/tutorial_py_contours_hierarchy.html'],
    ['OpenCV: Contour Features', 'https://docs.opencv.org/4.x/dd/d49/tutorial_py_contour_features.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np
import time
try:
    import webcv
    IS_IMAGE = not (webcv.is_camera() or webcv.is_video())
except Exception:
    IS_IMAGE = True

MM_PER_PX = 0.1
NOM_OD, NOM_ID = 12.0, 6.4
cv.namedWindow('result')
cv.createTrackbar('tol_x0.01mm', 'result', 30, 150, lambda x: None)

def badge(img, text, color, sub=''):
    (tw, th), _ = cv.getTextSize(text, cv.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    cv.rectangle(img, (8, 8), (24 + tw, 20 + th), color, -1)
    cv.putText(img, text, (16, 14 + th), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    if sub:
        (sw, sh), _ = cv.getTextSize(sub, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv.rectangle(img, (30 + tw, 8), (42 + tw + sw, 20 + th), (40, 40, 40), -1)
        cv.putText(img, sub, (36 + tw, 14 + th // 2 + sh // 2 + 2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)

def stamp_time(img, t0):
    s = '%.0f ms' % ((time.perf_counter() - t0) * 1000)
    w = img.shape[1]
    (tw, th), _ = cv.getTextSize(s, cv.FONT_HERSHEY_SIMPLEX, 0.45, 1)
    cv.rectangle(img, (w - tw - 16, 8), (w - 8, 16 + th), (40, 40, 40), -1)
    cv.putText(img, s, (w - tw - 12, 12 + th), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)

def text_box(img, lines, x, y, color):
    """여러 줄 글자를 (x 가운데, y 위쪽) 기준으로 배경 상자와 함께"""
    sizes = [cv.getTextSize(s, cv.FONT_HERSHEY_SIMPLEX, 0.45, 1)[0] for s in lines]
    bw = max(s[0] for s in sizes) + 10
    bh = 18 * len(lines) + 4
    x0 = int(min(max(0, x - bw // 2), img.shape[1] - bw))
    y0 = int(min(max(0, y), img.shape[0] - bh))
    cv.rectangle(img, (x0, y0), (x0 + bw, y0 + bh), (30, 30, 30), -1)
    cv.rectangle(img, (x0, y0), (x0 + bw, y0 + bh), color, 1)
    for i, s in enumerate(lines):
        cv.putText(img, s, (x0 + 5, y0 + 16 + 18 * i), cv.FONT_HERSHEY_SIMPLEX, 0.45, color if i == len(lines) - 1 else (255, 255, 255), 1, cv.LINE_AA)

def process(frame):
    t0 = time.perf_counter()
    out = frame.copy()
    tol = cv.getTrackbarPos('tol_x0.01mm', 'result') / 100.0
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    h, w = gray.shape
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    _, bw = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    cs, hier = cv.findContours(bw, cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE)
    parts = []
    if hier is not None:
        hier = hier[0]
        for i, c in enumerate(cs):
            if hier[i][3] != -1:
                continue                     # 구멍(자식 윤곽)은 부모에서 처리
            area = cv.contourArea(c)
            if area < 1500 or area > 0.5 * h * w:
                continue
            x, y, cw, ch = cv.boundingRect(c)
            (ex, ey), r = cv.minEnclosingCircle(c)
            if x <= 1 or y <= 1 or x + cw >= w - 1 or y + ch >= h - 1:
                cv.circle(out, (int(ex), int(ey)), int(r), (0, 200, 255), 1, cv.LINE_AA)
                continue                     # 화면에 잘린 부품은 측정 불가
            hole, j = None, hier[i][2]
            while j != -1:
                if hole is None or cv.contourArea(cs[j]) > cv.contourArea(hole):
                    hole = cs[j]
                j = hier[j][0]
            od = 2 * r * MM_PER_PX
            (_, _), (ma, mb), _ = cv.fitEllipse(c)
            ovality = abs(ma - mb) * MM_PER_PX
            idd, hole_area = 0.0, 0.0
            if hole is not None and len(hole) >= 5:
                hole_area = cv.contourArea(hole)
                if hole_area > 100:
                    idd = (np.sqrt(4 * hole_area / np.pi) - 0.5) * MM_PER_PX
            reasons = []
            if idd == 0:
                reasons.append('NO HOLE')
            if abs(od - NOM_OD) > tol:
                reasons.append('OD')
            if idd and abs(idd - NOM_ID) > tol:
                reasons.append('ID')
            if ovality > tol:
                reasons.append('ROUND')
            parts.append(dict(c=c, hole=hole, center=(ex, ey), r=r, od=od, idd=idd, ov=ovality, reasons=reasons))

    # 번호 매기기: 위 → 아래 줄, 줄 안에서는 왼쪽 → 오른쪽
    parts.sort(key=lambda p: p['center'][1])
    row, row_y = 0, None
    for p in parts:
        if row_y is not None and p['center'][1] - row_y > p['r']:
            row += 1
        if row_y is None or p['center'][1] - row_y > p['r']:
            row_y = p['center'][1]
        p['row'] = row
    parts.sort(key=lambda p: (p['row'], p['center'][0]))
    n_ng = 0
    for k, p in enumerate(parts, 1):
        ok = not p['reasons']
        n_ng += not ok
        col = (0, 200, 0) if ok else (0, 0, 255)
        cx, cy = int(p['center'][0]), int(p['center'][1])
        cv.circle(out, (cx, cy), int(p['r']), col, 2, cv.LINE_AA)
        if p['hole'] is not None and len(p['hole']) >= 5:
            cv.ellipse(out, cv.fitEllipse(p['hole']), col, 2, cv.LINE_AA)
        cv.drawMarker(out, (cx, cy), col, cv.MARKER_CROSS, 14, 1)
        verdict = 'OK' if ok else 'NG: ' + ','.join(p['reasons'])
        lines = ['#%d OD %.2f ID %.2f' % (k, p['od'], p['idd']), 'round %.2f  %s' % (p['ov'], verdict)]
        ty = cy + int(p['r']) + 6
        if ty + 40 > h:
            ty = cy - int(p['r']) - 46
        text_box(out, lines, cx, ty, col)

    if not parts:
        badge(out, 'NO PART', (0, 140, 255), 'backlit washer image needed')
    else:
        badge(out, 'NG' if n_ng else 'OK', (0, 0, 220) if n_ng else (0, 170, 0),
              '%d/%d pass  nominal OD %.1f ID %.1f +-%.2fmm' % (len(parts) - n_ng, len(parts), NOM_OD, NOM_ID, tol))
    stamp_time(out, t0)
    cv.imshow('binary (Otsu)', bw)
    if IS_IMAGE and parts:
        print('측정 %d개 중 불합격 %d개 (공차 ±%.2f mm)' % (len(parts), n_ng, tol))
        for k, p in enumerate(parts, 1):
            if p['reasons']:
                print('  #%d  OD %.2f · ID %.2f · 진원도 %.2f mm → %s' % (k, p['od'], p['idd'], p['ov'], ', '.join(p['reasons'])))
    return out
`,
});

/* ------------------------------------------------------------------ 블리스터 */
APPS.add({
  id: 'blister',
  cat: 'inspection',
  icon: '💊',
  title: '블리스터 포장 알약 누락 · 파손 검사',
  subtitle: '포장 위치를 찾아 칸마다 알약 유무 · 깨짐 · 다른 약 섞임을 판정',
  summary: `<p>제약 공장의 <b>블리스터 포장기</b>는 PVC 시트에 포켓을 성형하고 알약을 채운 뒤 알루미늄 포일로 봉합합니다. 한 칸이라도 알약이 빠지거나 깨진 채 출하되면 복약 사고와 리콜로 이어지므로,
봉합 직전에 카메라가 <b>모든 포켓</b>을 검사하고 불량 시트는 자동으로 배출합니다.</p>
<p>이 데모는 어두운 컨베이어 위의 밝은 포장을 찾아 <b>원근 변환으로 반듯하게 펴고</b>, 2×5 격자로 나눈 각 칸에서 <b>HSV 색 마스크</b>로 주황색 알약 면적을 잽니다.
면적이 거의 없으면 <b>MISSING</b>, 기준보다 작으면 <b>BROKEN</b>, 다른 색 알약이 있으면 <b>COLOR</b>(이종 혼입)로 판정합니다.</p>`,
  uses: [
    ['제약 포장', '블리스터 포켓별 정제 · 캡슐 누락, 깨짐, 이종 혼입, 이물 검사 (GMP 필수 공정)'],
    ['식품 · 제과', '초콜릿 · 과자 트레이의 빈 칸, 모양 불량, 토핑 누락 검사'],
    ['전자 부품 포장', '캐리어 테이프 · 트레이의 부품 누락 · 방향 뒤집힘 검사'],
    ['화장품 · 생활용품', '팔레트 섀도 · 캡슐 세제 등 칸 단위 충전 상태 확인'],
    ['물류 · 키팅', '공구 · 부품 키트 트레이에 빠진 물품이 없는지 확인'],
  ],
  steps: [
    '흑백 + Otsu 이진화로 밝은 포장 영역 → 가장 큰 윤곽선 선택',
    '<code>minAreaRect</code> 로 기울어진 포장의 네 꼭짓점 → 크기 · 비율이 맞지 않으면 <b>NO PACK</b>',
    '<code>getPerspectiveTransform</code> + <code>warpPerspective</code> 로 520×260 정면 이미지로 펴기',
    '2×5 격자로 칸(ROI)을 나누고 HSV 에서 알약 색(주황)과 “다른 색” 마스크 만들기',
    '칸마다 알약 면적 ÷ 정상 알약 면적 = 충진율 → MISSING / BROKEN / COLOR / OK 판정',
    '격자를 원래 이미지 좌표로 되돌려 칸별 색상 표시, 한 칸이라도 불량이면 시트 NG',
  ],
  tech: ['cv.threshold (OTSU)', 'cv.findContours', 'cv.minAreaRect', 'cv.getPerspectiveTransform', 'cv.warpPerspective', 'cv.cvtColor (HSV)', 'cv.inRange', 'cv.countNonZero'],
  controls: [
    ['min_fill_%', '정상 알약 면적 대비 이 비율(%)보다 작으면 BROKEN. 기본 75%'],
    ['sat_min', '“색이 있는 알약”으로 볼 최소 채도(S). 낮추면 은색 포일 반사까지 알약으로 잡힐 수 있음'],
  ],
  inputs: ['blister_broken.png', 'blister_missing.png', 'blister_color.png', 'blister_ok.png'],
  assets: ['blister_ok.png', 'blister_missing.png', 'blister_broken.png', 'blister_color.png'],
  note: `포장 크기 · 격자(2×5) · 알약 색(주황) · 정상 알약 면적은 <b>제품(레시피)별로 미리 등록</b>하는 값이라고 가정합니다. 실제 라인에서는 품목이 바뀔 때 이 레시피를 불러옵니다.
투명 PVC 포켓은 반사가 심해서 현장에서는 <b>돔 조명</b>이나 편광 필터로 반사를 줄이고, 흰색 알약처럼 색으로 구분이 어려운 경우 컬러 대신 <b>밝기 · 윤곽</b> 또는 근적외선 · 3D 높이 센서를 씁니다.`,
  refs: [
    ['OpenCV: Changing Colorspaces (HSV · inRange)', 'https://docs.opencv.org/4.x/df/d9d/tutorial_py_colorspaces.html'],
    ['OpenCV: Image Thresholding (Otsu)', 'https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html'],
    ['OpenCV: Contour Features (minAreaRect)', 'https://docs.opencv.org/4.x/dd/d49/tutorial_py_contour_features.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np
import time
try:
    import webcv
    IS_IMAGE = not (webcv.is_camera() or webcv.is_video())
except Exception:
    IS_IMAGE = True

# 레시피(제품별 등록값)
CW, CH = 520, 260            # 펼친 포장 크기(px)
ROWS, COLS = 2, 5
PILL_AREA = 4050.0           # 정상 알약 한 알의 면적(px, 펼친 이미지 기준)
PILL_HUE = (5, 25)           # 주황색 알약 H 범위

cv.namedWindow('result')
cv.createTrackbar('min_fill_%', 'result', 75, 100, lambda x: None)
cv.createTrackbar('sat_min', 'result', 90, 255, lambda x: None)

COL = {'OK': (0, 200, 0), 'MISSING': (0, 0, 255), 'BROKEN': (0, 0, 255), 'COLOR': (255, 0, 255)}

def badge(img, text, color, sub=''):
    (tw, th), _ = cv.getTextSize(text, cv.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    cv.rectangle(img, (8, 8), (24 + tw, 20 + th), color, -1)
    cv.putText(img, text, (16, 14 + th), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    if sub:
        (sw, sh), _ = cv.getTextSize(sub, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv.rectangle(img, (30 + tw, 8), (42 + tw + sw, 20 + th), (40, 40, 40), -1)
        cv.putText(img, sub, (36 + tw, 14 + th // 2 + sh // 2 + 2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)

def stamp_time(img, t0):
    s = '%.0f ms' % ((time.perf_counter() - t0) * 1000)
    w = img.shape[1]
    (tw, th), _ = cv.getTextSize(s, cv.FONT_HERSHEY_SIMPLEX, 0.45, 1)
    cv.rectangle(img, (w - tw - 16, 8), (w - 8, 16 + th), (40, 40, 40), -1)
    cv.putText(img, s, (w - tw - 12, 12 + th), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)

def find_pack(gray):
    h, w = gray.shape
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    _, bw = cv.threshold(blur, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    bw = cv.morphologyEx(bw, cv.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    cs, _ = cv.findContours(bw, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if not cs:
        return None
    c = max(cs, key=cv.contourArea)
    area = cv.contourArea(c)
    (cx, cy), (rw, rh), ang = cv.minAreaRect(c)
    if rw < 1 or rh < 1 or area < 0.12 * h * w or area > 0.9 * h * w:
        return None
    aspect = max(rw, rh) / min(rw, rh)
    if not (1.6 < aspect < 2.5) or area / (rw * rh) < 0.85:
        return None
    box = cv.boxPoints(((cx, cy), (rw, rh), ang))
    s, d = box.sum(1), box[:, 1] - box[:, 0]
    tl, br, tr, bl = box[np.argmin(s)], box[np.argmax(s)], box[np.argmin(d)], box[np.argmax(d)]
    pts = np.float32([tl, tr, br, bl])
    if np.linalg.norm(tr - tl) < np.linalg.norm(bl - tl):     # 세로로 놓였으면 90° 돌려서 긴 변을 가로로
        pts = np.float32([bl, tl, tr, br])
    return pts

def process(frame):
    t0 = time.perf_counter()
    out = frame.copy()
    min_fill = cv.getTrackbarPos('min_fill_%', 'result') / 100.0
    sat_min = cv.getTrackbarPos('sat_min', 'result')
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    pts = find_pack(gray)
    if pts is None:
        badge(out, 'NO PACK', (0, 140, 255), 'blister pack not found')
        stamp_time(out, t0)
        if IS_IMAGE:
            print('블리스터 포장을 찾지 못했습니다.')
        return out

    dst = np.float32([[0, 0], [CW, 0], [CW, CH], [0, CH]])
    M = cv.getPerspectiveTransform(pts, dst)
    Minv = np.linalg.inv(M)
    flat = cv.warpPerspective(frame, M, (CW, CH))
    hsv = cv.cvtColor(flat, cv.COLOR_BGR2HSV)
    target = cv.inRange(hsv, (PILL_HUE[0], sat_min, 70), (PILL_HUE[1], 255, 255))
    colored = cv.inRange(hsv, (0, sat_min, 60), (180, 255, 255))
    other = cv.bitwise_and(colored, cv.bitwise_not(target))
    other = cv.morphologyEx(other, cv.MORPH_OPEN, np.ones((3, 3), np.uint8))

    cw, ch = CW / COLS, CH / ROWS
    view = flat.copy()
    results = []
    for r in range(ROWS):
        for c in range(COLS):
            x0, y0, x1, y1 = int(c * cw + 5), int(r * ch + 5), int((c + 1) * cw - 5), int((r + 1) * ch - 5)
            fill = cv.countNonZero(target[y0:y1, x0:x1]) / PILL_AREA
            oth = cv.countNonZero(other[y0:y1, x0:x1]) / PILL_AREA
            if oth > 0.35:
                st = 'COLOR'
            elif fill < 0.2:
                st = 'MISSING'
            elif fill < min_fill:
                st = 'BROKEN'
            else:
                st = 'OK'
            results.append((r, c, st, fill))
            col = COL[st]
            cv.rectangle(view, (x0, y0), (x1, y1), col, 2)
            cv.putText(view, '%d%%' % round(fill * 100), (x0 + 4, y1 - 6), cv.FONT_HERSHEY_SIMPLEX, 0.45, col, 1, cv.LINE_AA)
            # 원본 이미지에 칸 표시
            cell = np.float32([[x0 + 3, y0 + 3], [x1 - 3, y0 + 3], [x1 - 3, y1 - 3], [x0 + 3, y1 - 3]]).reshape(-1, 1, 2)
            poly = cv.perspectiveTransform(cell, Minv).astype(np.int32)
            cv.polylines(out, [poly], True, col, 2 if st == 'OK' else 3, cv.LINE_AA)
            label = st if st != 'OK' else 'OK'
            ctr = poly[:, 0].mean(0)
            (tw, th), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            lx, ly = int(ctr[0] - tw / 2), int(poly[:, 0, 1].max() - 10)
            cv.rectangle(out, (lx - 3, ly - th - 3), (lx + tw + 3, ly + 4), col, -1)
            cv.putText(out, label, (lx, ly), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)
    cv.polylines(out, [pts.astype(np.int32)], True, (255, 200, 0), 1, cv.LINE_AA)

    bad = [x for x in results if x[2] != 'OK']
    badge(out, 'NG' if bad else 'OK', (0, 0, 220) if bad else (0, 170, 0), '%d/%d pockets OK' % (len(results) - len(bad), len(results)))
    stamp_time(out, t0)
    cv.imshow('flattened pack', view)
    if IS_IMAGE:
        if bad:
            names = {'MISSING': '누락', 'BROKEN': '파손', 'COLOR': '이종(다른 색)'}
            print('NG: ' + ', '.join('%d행 %d열 %s(충진율 %d%%)' % (r + 1, c + 1, names[s], round(f * 100)) for r, c, s, f in bad))
        else:
            print('OK: 10칸 모두 정상')
    return out
`,
});

/* ------------------------------------------------------------------ 병 충진 · 캡 */
APPS.add({
  id: 'bottle',
  cat: 'inspection',
  icon: '🧴',
  title: '병 충진 높이 · 캡 유무 검사',
  subtitle: '백라이트로 비친 병마다 액체 높이를 재고 캡이 닫혔는지 확인',
  summary: `<p>음료 · 소스 · 화장품 · 의약품 병은 <b>내용량이 표시량보다 적으면 법규 위반</b>, 많으면 원가 손실과 넘침 불량이 됩니다. 캡이 빠진 병은 오염과 누액으로 이어지죠.
그래서 충진기 · 캡핑기 바로 뒤에 카메라를 두고, 컨베이어로 흘러가는 병을 <b>한 병도 빠짐없이</b> 검사해 불량은 에어 분사로 밀어냅니다.</p>
<p>이 데모는 뒤에서 비춘 <b>백라이트</b> 덕분에 액체(호박색)와 빈 유리(밝음)가 뚜렷이 구분되는 점을 이용합니다. 먼저 <b>열 방향 투영(프로파일)</b>으로 병 위치를 찾고,
병 중앙의 세로 띠에서 위에서부터 액체 색이 시작되는 줄 = <b>액면 높이</b>를 찾아 목표선(<code>target_y</code>)과 비교합니다. 병 입구 위쪽에서 파란 캡 색을 찾아 <b>캡 유무</b>도 판정합니다.</p>`,
  uses: [
    ['음료 · 주류', '충진기 출구에서 액면 높이(Under/Over fill) · 캡 누락 · 캡 비뚤어짐 검사, 불량 병 자동 배출'],
    ['제약 · 바이알', '주사액 앰플 · 바이알 충진량, 고무마개 · 알루미늄 실 유무 검사'],
    ['화장품 · 생활화학', '샴푸 · 로션 용기 충진 높이, 펌프 캡 체결 상태 검사'],
    ['식품', '소스 · 잼 병 충진량, 뚜껑 체결과 진공 버튼(안전 버튼) 상태 확인'],
    ['2차전지 · 화학', '전해액 주입량, 반투명 용기의 액위(level) 측정'],
  ],
  steps: [
    'HSV 변환 → 병 몸통 높이의 가로 띠에서 “배경이 아닌” 열의 비율을 계산 (열 프로파일)',
    '비율이 높은 연속 구간 = 병 한 개 → 가운데 x 좌표',
    '병 중앙 세로 띠에서 액체 색(호박색) <code>inRange</code> → 행마다 비율 → 위에서부터 처음 연속 5줄이 액체인 곳 = 액면',
    '액면과 목표선의 차이를 mm(0.5 mm/px)로 환산해 <code>tolerance</code> 밖이면 LOW / HIGH',
    '병 입구 위쪽 ROI 에서 캡 색(파랑) 비율로 NO CAP 판정',
    '목표선 · 허용 범위 · 병별 액면과 판정을 그리고 전체 OK / NG',
  ],
  tech: ['cv.cvtColor (HSV)', 'cv.inRange', 'np.mean (열 · 행 프로파일)', 'cv.line', 'cv.rectangle'],
  controls: [
    ['target_y', '목표 액면 높이(높이 480 기준 이미지 y 좌표, 위가 0). 기본 100 — 제품(병 종류)마다 다르게 설정'],
    ['tolerance', '목표선에서 허용하는 차이(px). 기본 10 px = ±5 mm'],
  ],
  inputs: ['bottle_under.png', 'bottle_nocap.png', 'bottle_over.png', 'bottle_ok.png'],
  assets: ['bottle_ok.png', 'bottle_under.png', 'bottle_nocap.png', 'bottle_over.png'],
  note: `카메라와 컨베이어가 고정되어 있어 병 바닥 높이가 항상 같다고 가정하고 목표선을 이미지 좌표로 둡니다. 실제 라인은 분당 수백~수천 병이 지나가므로
<b>택트타임</b>이 매우 짧아, 병 위치 센서가 신호를 줄 때 짧은 노출(스트로브 조명)로 한 장씩 찍어 수 ms 안에 판정합니다.
불투명 용기는 카메라 대신 <b>X선 · 고주파(RF) 액면 센서</b>를 쓰고, 액체가 투명하면 색 대신 액면에서 빛이 굴절되는 <b>검은 메니스커스 선</b>을 찾습니다.`,
  refs: [
    ['OpenCV: Changing Colorspaces (HSV · inRange)', 'https://docs.opencv.org/4.x/df/d9d/tutorial_py_colorspaces.html'],
    ['OpenCV: Image Thresholding', 'https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np
import time
try:
    import webcv
    IS_IMAGE = not (webcv.is_camera() or webcv.is_video())
except Exception:
    IS_IMAGE = True

MM_PER_PX = 0.5
cv.namedWindow('result')
cv.createTrackbar('target_y', 'result', 100, 479, lambda x: None)
cv.createTrackbar('tolerance', 'result', 10, 60, lambda x: None)

LIQUID = ((5, 70, 40), (30, 255, 255))     # 호박색 액체
CAP = ((95, 80, 40), (130, 255, 255))      # 파란 캡

def badge(img, text, color, sub=''):
    (tw, th), _ = cv.getTextSize(text, cv.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    cv.rectangle(img, (8, 8), (24 + tw, 20 + th), color, -1)
    cv.putText(img, text, (16, 14 + th), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    if sub:
        (sw, sh), _ = cv.getTextSize(sub, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv.rectangle(img, (30 + tw, 8), (42 + tw + sw, 20 + th), (40, 40, 40), -1)
        cv.putText(img, sub, (36 + tw, 14 + th // 2 + sh // 2 + 2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)

def stamp_time(img, t0):
    s = '%.0f ms' % ((time.perf_counter() - t0) * 1000)
    w = img.shape[1]
    (tw, th), _ = cv.getTextSize(s, cv.FONT_HERSHEY_SIMPLEX, 0.45, 1)
    cv.rectangle(img, (w - tw - 16, 8), (w - 8, 16 + th), (40, 40, 40), -1)
    cv.putText(img, s, (w - tw - 12, 12 + th), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)

def dashed(img, y, color, x0, x1, step=14):
    for x in range(x0, x1, step):
        cv.line(img, (x, y), (min(x + step // 2, x1), y), color, 1, cv.LINE_AA)

def find_bottles(hsv, gray):
    h, w = gray.shape
    y0, y1 = int(h * 0.39), int(h * 0.50)
    band = (hsv[y0:y1, :, 1] > 60) | (gray[y0:y1] < 150)
    prof = band.mean(axis=0) > 0.5
    runs, x = [], 0
    while x < w:
        if prof[x]:
            s = x
            while x < w and prof[x]:
                x += 1
            if w * 0.05 <= x - s <= w * 0.25:
                runs.append((s, x - 1))
        x += 1
    return runs

def process(frame):
    t0 = time.perf_counter()
    out = frame.copy()
    h, w = frame.shape[:2]
    k480 = h / 480.0                        # 트랙바 값은 높이 480 기준 → 입력 크기에 맞게 환산
    target = min(int(cv.getTrackbarPos('target_y', 'result') * k480), h - 1)
    tol = int(round(cv.getTrackbarPos('tolerance', 'result') * k480))
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    runs = find_bottles(hsv, gray)

    # 목표선과 허용 범위
    overlay = out.copy()
    cv.rectangle(overlay, (0, target - tol), (w, target + tol), (0, 255, 0), -1)
    out = cv.addWeighted(overlay, 0.18, out, 0.82, 0)
    dashed(out, target, (0, 160, 0), 0, w)
    cv.putText(out, 'target', (w - 60, target - 6), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 120, 0), 1, cv.LINE_AA)

    top, search_end = int(h * 0.06), int(h * 0.50)
    cap_y0, cap_y1 = int(h * 0.085), int(h * 0.13)
    results = []
    for k, (xs, xe) in enumerate(runs, 1):
        cx = (xs + xe) // 2
        strip = hsv[top:search_end, max(0, cx - 5):cx + 6]
        liq = cv.inRange(strip, LIQUID[0], LIQUID[1]).mean(axis=1) > 150
        run5 = np.convolve(liq.astype(np.int32), np.ones(5, np.int32), 'valid') == 5
        level = int(np.argmax(run5)) + top if run5.any() else None
        cap_roi = hsv[cap_y0:cap_y1, max(0, cx - 12):cx + 13]
        has_cap = cap_roi.size > 0 and cv.inRange(cap_roi, CAP[0], CAP[1]).mean() / 255 > 0.35
        reasons = []
        if level is None or level > target + tol:
            reasons.append('LOW')
        elif level < target - tol:
            reasons.append('HIGH')
        if not has_cap:
            reasons.append('NO CAP')
        results.append((k, cx, xs, xe, level, has_cap, reasons))

        col = (0, 190, 0) if not reasons else (0, 0, 255)
        cv.rectangle(out, (xs - 4, int(h * 0.07)), (xe + 4, int(h * 0.89)), col, 2 if reasons else 1)
        if level is not None:
            cv.line(out, (xs - 10, level), (xe + 10, level), (0, 255, 255) if not reasons else (0, 0, 255), 2, cv.LINE_AA)
        if not has_cap:
            cv.rectangle(out, (cx - 22, cap_y0 - 6), (cx + 22, cap_y1 + 4), (0, 0, 255), 2)
        d_mm = (target - level) * MM_PER_PX / k480 if level is not None else float('nan')
        l1 = '#%d %s' % (k, 'OK' if not reasons else '/'.join(reasons))
        l2 = '%+.1fmm' % d_mm if level is not None else 'no liquid'
        for i, s in enumerate((l1, l2)):
            (tw, th), _ = cv.getTextSize(s, cv.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            tx = int(min(max(0, cx - tw / 2), w - tw))
            ty = int(h * 0.94) + i * 17
            cv.putText(out, s, (tx, ty), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255) if not reasons else (80, 80, 255), 1, cv.LINE_AA)

    if not runs:
        badge(out, 'NO BOTTLE', (0, 140, 255), 'backlit bottle row needed')
    else:
        n_bad = sum(1 for r in results if r[6])
        badge(out, 'NG' if n_bad else 'OK', (0, 0, 220) if n_bad else (0, 170, 0), '%d/%d bottles OK' % (len(results) - n_bad, len(results)))
    stamp_time(out, t0)
    if IS_IMAGE and runs:
        bad = [r for r in results if r[6]]
        names = {'LOW': '충진 부족', 'HIGH': '과충진', 'NO CAP': '캡 누락'}
        if bad:
            print('NG: ' + ', '.join('%d번 병 %s' % (r[0], '·'.join(names[x] for x in r[6])) for r in bad))
        else:
            print('OK: 병 %d개 모두 정상' % len(results))
    return out
`,
});
