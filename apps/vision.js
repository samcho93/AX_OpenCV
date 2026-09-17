/* 🏙️ 실무 영상 분석 데모 — 물류 · 보안 · 교통 · 로봇 */

/* ------------------------------------------------------------------ 📦 택배 송장 QR · 바코드 */
APPS.add({
  id: 'barcode',
  cat: 'vision',
  icon: '📦',
  title: '택배 송장 QR · 바코드 인식',
  subtitle: '상자에 붙은 송장의 QR 코드와 EAN-13 바코드를 한 번에 찾아 읽기',
  summary: `<p>물류센터 컨베이어 위를 지나가는 상자의 <b>송장</b>을 카메라로 찍어 <b>QR 코드</b>(배송 조회 주소)와 <b>1차원 바코드</b>(EAN-13 상품 번호)를 자동으로 읽습니다.
사람이 스캐너를 대지 않아도 이미지 한 장에서 여러 개의 코드를 동시에 찾고, 비스듬히 찍혀도 위치(네 꼭짓점)를 알아내 해독합니다.</p>
<p>OpenCV 의 <code>QRCodeDetector</code> · <code>barcode.BarcodeDetector</code> 는 별도 라이브러리 없이 코드의 <b>검출(어디 있나)</b>과 <b>해독(무슨 값인가)</b>을 모두 해 줍니다.
결과 이미지에는 코드 테두리와 번호를, 아래 표에는 읽은 값과 검사 숫자(checksum) 확인 결과를 표시합니다.</p>`,
  uses: [
    ['물류센터 자동 분류', '컨베이어 위 카메라가 송장을 읽어 목적지별 슈트(분류 레인)로 상자를 자동으로 보냄'],
    ['재고 · 입출고 관리', '창고 선반이나 팔레트의 바코드를 한 번에 촬영해 수량과 위치를 기록'],
    ['결제 · 모바일 서비스', '편의점 계산대, QR 결제, 모바일 탑승권 · 입장권 확인'],
    ['스마트 팩토리 이력 추적', '부품마다 붙인 QR / DataMatrix 로 생산 공정 · 검사 결과를 추적(Traceability)'],
    ['의료 · 약국', '약품 바코드와 환자 팔찌를 대조해 투약 실수 방지'],
  ],
  steps: [
    '<code>QRCodeDetectorAruco</code> 로 QR 코드의 네 꼭짓점을 찾고 해독 (<code>detectAndDecodeMulti</code> — 여러 개 동시에)',
    '찾았지만 해독에 실패한 QR 은 <code>getPerspectiveTransform</code> 으로 정사각형으로 펴서 다시 해독',
    '<code>barcode.BarcodeDetector</code> 로 1차원 바코드(EAN-13 등) 검출 · 해독 — 실패하면 막대 방향으로 회전 · 확대한 띠 이미지로 재시도',
    'EAN-13 은 앞 12자리로 검사 숫자를 직접 계산해 마지막 자리와 비교 (잘못 읽음 방지)',
    '코드 위치에 테두리 · 번호를 그리고, 아래 표에 종류 · 값 · 해석(송장 번호, GS1 국가 접두어)을 정리',
  ],
  tech: ['cv.QRCodeDetectorAruco', 'cv.QRCodeDetector', 'detectAndDecodeMulti', 'cv.barcode.BarcodeDetector', 'cv.getPerspectiveTransform', 'cv.polylines'],
  controls: [
    ['mode', '0 = QR + 바코드 모두, 1 = QR 만, 2 = 바코드만'],
  ],
  inputs: ['parcel_label.png', 'parcel_angle.png', 'parcel_two.png', 'camera'],
  assets: ['parcel_label.png', 'parcel_angle.png', 'parcel_two.png'],
  note: '송장 이미지는 코드로 만든 합성 이미지입니다(주소 · 이름은 가상). 웹캠으로 해 볼 때는 휴대폰 화면의 QR 코드나 과자 봉지 바코드를 카메라에 가깝게 비춰 보세요. 코드가 너무 작거나 흔들리면 읽지 못합니다.',
  refs: [
    ['OpenCV: QRCodeDetector 클래스', 'https://docs.opencv.org/4.x/de/dc3/classcv_1_1QRCodeDetector.html'],
    ['OpenCV: Barcode 검출 · 해독 튜토리얼', 'https://docs.opencv.org/4.x/d6/d25/tutorial_barcode_detect_and_decode.html'],
    ['OpenCV: 기하 변환(원근 변환)', 'https://docs.opencv.org/4.x/da/d6e/tutorial_py_geometric_transformations.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np

cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 0, 2, lambda x: None)

QR_DETS = []
if hasattr(cv, 'QRCodeDetectorAruco'):
    QR_DETS.append(cv.QRCodeDetectorAruco())
QR_DETS.append(cv.QRCodeDetector())
BAR = cv.barcode.BarcodeDetector()
try:
    BAR.setDownsamplingThreshold(1024)   # 기본 512: 큰 사진을 줄이면 가는 막대가 뭉개짐
except Exception:
    pass

GS1 = {'880': 'KOREA', '489': 'HONG KONG', '471': 'TAIWAN', '690': 'CHINA', '691': 'CHINA', '692': 'CHINA',
       '400': 'GERMANY', '300': 'FRANCE', '500': 'UK', '800': 'ITALY', '840': 'SPAIN', '870': 'NETHERLANDS'}

def is_media():
    try:
        import webcv
        return webcv.is_video() or webcv.is_camera()
    except Exception:
        return False

def gs1_country(code):
    p = code[:3]
    if p in GS1:
        return GS1[p]
    if '450' <= p <= '459' or '490' <= p <= '499':
        return 'JAPAN'
    if '000' <= p <= '139':
        return 'USA/CANADA'
    return 'GS1 ' + p

def ean13_ok(code):
    if len(code) != 13 or not code.isdigit():
        return None
    s = sum(int(c) * (1 if i % 2 == 0 else 3) for i, c in enumerate(code[:12]))
    return (10 - s % 10) % 10 == int(code[12])

def rectify_decode(img, pts):
    """비스듬한 QR 을 정면 정사각형으로 펴서 다시 해독"""
    S, m = 264, 48
    dst = np.float32([[m, m], [m + S, m], [m + S, m + S], [m, m + S]])
    H = cv.getPerspectiveTransform(np.float32(pts).reshape(4, 2), dst)
    flat = cv.warpPerspective(img, H, (S + 2 * m, S + 2 * m), flags=cv.INTER_CUBIC, borderValue=(255, 255, 255))
    flat = cv.cvtColor(flat, cv.COLOR_BGR2GRAY)
    for det in QR_DETS:
        try:
            s = det.detectAndDecode(flat)[0]
        except cv.error:
            s = ''
        if s:
            return s
    return ''

def find_qr(img):
    found = []                       # [text, pts(4x2)]
    for det in QR_DETS:
        try:
            ok, vals, pts, _ = det.detectAndDecodeMulti(img)
        except cv.error:
            continue
        if ok and pts is not None:
            for v, p in zip(vals, pts):
                p = np.float32(p).reshape(4, 2)
                if cv.contourArea(p) < 100:
                    continue
                same = [f for f in found if np.linalg.norm(f[1].mean(0) - p.mean(0)) < 0.3 * np.sqrt(cv.contourArea(p))]
                if same:
                    if not same[0][0] and v:
                        same[0][0] = v
                    continue
                found.append([v, p])
        if found and all(f[0] for f in found):
            break                    # 모두 읽었으면 다음 검출기는 생략(속도)
    for f in found:
        if not f[0]:
            f[0] = rectify_decode(img, f[1])
    return found

def find_bar(img):
    out = []
    try:
        ok, infos, types, pts = BAR.detectAndDecodeWithType(img)
    except cv.error:
        return out
    if not ok or pts is None:
        return out
    for v, t, p in zip(infos, types, pts):
        p = np.float32(p).reshape(4, 2)
        if not v:
            v, t = retry_bar(img, p, t)
        out.append([v, t, p])
    return out

def retry_bar(img, p, typ):
    """해독 실패한 바코드: 막대가 세로로 서도록 회전 · 2배 확대한 띠 이미지로 다시 해독"""
    (cx, cy), (w, h), ang = cv.minAreaRect(p)
    if w < h:
        w, h, ang = h, w, ang + 90
    sc = min(2.0, 1600.0 / max(w * 1.3, 1))
    Wc, Hc = int(w * sc * 1.3) + 20, int(h * sc * 1.8) + 20
    M = cv.getRotationMatrix2D((cx, cy), ang, sc)
    M[0, 2] += Wc / 2 - cx
    M[1, 2] += Hc / 2 - cy
    strip = cv.warpAffine(img, M, (Wc, Hc), flags=cv.INTER_CUBIC, borderValue=(255, 255, 255))
    try:
        ok, infos, types, _ = BAR.detectAndDecodeWithType(strip)
        for v, t in zip(infos, types):
            if v:
                return v, t
    except cv.error:
        pass
    return '', typ

def label(img, text, org, color):
    (tw, th), _ = cv.getTextSize(text, cv.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    x, y = int(org[0]), int(org[1])
    x = min(max(x, 0), img.shape[1] - tw - 8)
    y = min(max(y, th + 8), img.shape[0] - 4)
    cv.rectangle(img, (x, y - th - 8), (x + tw + 8, y + 4), color, -1)
    cv.putText(img, text, (x + 4, y - 3), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv.LINE_AA)

def process(frame):
    mode = cv.getTrackbarPos('mode', 'result')
    img = frame
    vis = frame.copy()
    rows = []
    qrs = find_qr(img) if mode in (0, 1) else []
    bars = find_bar(img) if mode in (0, 2) else []
    k = 0
    for text, p in qrs:
        k += 1
        col = (40, 170, 40) if text else (0, 140, 255)
        cv.polylines(vis, [p.astype(np.int32)], True, col, 3, cv.LINE_AA)
        label(vis, '%d QR' % k, p[np.argmin(p[:, 1])] + (-10, -8), col)
        if text:
            info = text
            if '/p/' in text:
                info += '  (tracking no. %s)' % text.rsplit('/', 1)[-1]
            rows.append((k, 'QR', info, col))
        else:
            rows.append((k, 'QR', '(found but could not decode)', col))
    for text, typ, p in bars:
        k += 1
        col = (200, 90, 0) if text else (0, 140, 255)
        cv.polylines(vis, [p.astype(np.int32)], True, col, 3, cv.LINE_AA)
        label(vis, '%d %s' % (k, typ or 'BAR'), p[np.argmin(p[:, 1])] + (-10, -8), col)
        if text:
            chk = ean13_ok(text) if typ in ('EAN_13', 'EAN-13') or len(text) == 13 else None
            info = text
            if chk is not None:
                info += '  checksum %s  prefix %s' % ('OK' if chk else 'NG', gs1_country(text))
            rows.append((k, typ or 'BAR', info, col))
        else:
            rows.append((k, 'BAR', '(found but could not decode)', col))

    # 아래쪽 결과 표
    h, w = vis.shape[:2]
    fs = max(0.45, min(0.6, w / 1400))
    lh = int(34 * fs / 0.6)
    n = max(3 if is_media() else 1, len(rows))   # 동영상 · 웹캠은 표 높이를 고정(화면 흔들림 방지)
    panel = np.full((lh * (n + 1) + 10, w, 3), 32, np.uint8)
    title = 'DECODED: %d QR, %d BARCODE' % (sum(1 for r in rows if r[1] == 'QR' and not r[2].startswith('(')),
                                             sum(1 for r in rows if r[1] != 'QR' and not r[2].startswith('(')))
    cv.putText(panel, title, (10, lh - 8), cv.FONT_HERSHEY_SIMPLEX, fs, (255, 255, 255), 2, cv.LINE_AA)
    if not rows:
        cv.putText(panel, 'No code found - bring a QR code or barcode closer to the camera', (10, 2 * lh - 8),
                   cv.FONT_HERSHEY_SIMPLEX, fs, (170, 170, 170), 1, cv.LINE_AA)
    for i, (idx, typ, info, col) in enumerate(rows):
        y = (i + 2) * lh - 8
        cv.rectangle(panel, (10, y - lh + 12), (10 + lh - 10, y + 2), col, -1)
        cv.putText(panel, str(idx), (14, y - 2), cv.FONT_HERSHEY_SIMPLEX, fs * 0.9, (255, 255, 255), 2, cv.LINE_AA)
        line = '%-7s %s' % (typ, info)
        fsi = fs
        while fsi > 0.3 and cv.getTextSize(line, cv.FONT_HERSHEY_SIMPLEX, fsi, 1)[0][0] > w - lh - 20:
            fsi *= 0.92                  # 긴 값은 글자를 줄여 한 줄에 맞춤
        cv.putText(panel, line, (lh + 12, y), cv.FONT_HERSHEY_SIMPLEX, fsi, (235, 235, 235), 1, cv.LINE_AA)
    result = np.vstack([vis, panel])

    if not is_media():
        print('읽은 코드 %d개' % len(rows))
        for idx, typ, info, _ in rows:
            print('  [%d] %s : %s' % (idx, typ, info))
    return result
`,
});

/* ------------------------------------------------------------------ 🚶 보행자 검출 · 인원 계수 */
APPS.add({
  id: 'people',
  cat: 'vision',
  icon: '🚶',
  title: '보행자 검출 · 인원 계수',
  subtitle: 'HOG 특징 + SVM 으로 사람을 찾고 화면 속 인원을 세기',
  summary: `<p>CCTV 영상에서 <b>사람(보행자)</b>을 찾아 상자로 표시하고 <b>몇 명</b>인지 셉니다.
사용하는 방법은 2005년 발표된 고전 알고리즘 <b>HOG(Histogram of Oriented Gradients) + 선형 SVM</b> 으로, 사람의 윤곽에서 나타나는 <b>밝기 변화 방향의 분포</b>를 특징으로 삼아 64×128 크기 창을 이미지 곳곳 · 여러 크기로 옮겨 가며 “사람인가?”를 판정합니다.</p>
<p>지금은 딥러닝(🤖 YOLO 데모)이 훨씬 정확하지만, HOG 는 학습된 모델 파일 없이 OpenCV 에 기본 내장되어 있고 가벼워서 저사양 장비에서 여전히 쓰입니다.
동영상에서는 속도를 위해 <b>움직임이 생긴 영역만</b> 골라 검사하는 CCTV 식 최적화를 함께 보여 줍니다.</p>`,
  uses: [
    ['매장 · 전시장 방문객 계수', '출입구 카메라로 시간대별 방문객 수와 혼잡도를 집계'],
    ['스마트 시티 · 보행 안전', '횡단보도 보행자를 감지해 신호 시간을 늘리거나 운전자에게 경고'],
    ['건설 현장 · 공장 안전', '중장비 · 로봇 작업 반경에 사람이 들어오면 정지 신호'],
    ['자동차 ADAS', '보행자 충돌 경고(초기 시스템은 HOG 기반, 현재는 딥러닝으로 대체)'],
  ],
  steps: [
    '<code>cv.HOGDescriptor()</code> 에 OpenCV 내장 보행자 SVM(<code>HOGDescriptor_getDefaultPeopleDetector</code>) 설정',
    '(동영상) 1/4 크기 영상에 <code>MOG2</code> 배경 차분 → 움직임이 생긴 곳만 사람 크기 이상으로 넓혀 검사 영역(ROI) 결정',
    '각 ROI 를 1.2배 키워 <code>detectMultiScale</code> — 멀리 있는 작은 사람도 검출, 전체 화면보다 훨씬 빠름',
    '가만히 서 있어 움직임이 없는 곳은 직전 검출 결과를 잠시 유지',
    '겹친 상자는 <code>cv.dnn.NMSBoxes</code> 로 하나만 남기고, HOG 상자의 여백을 줄여 사람 몸에 맞춤',
    '인원 수 · 최대 인원 · 처리 시간을 화면에 표시',
  ],
  tech: ['cv.HOGDescriptor', 'cv.HOGDescriptor_getDefaultPeopleDetector', 'detectMultiScale', 'cv.dnn.NMSBoxes', 'cv.createBackgroundSubtractorMOG2'],
  controls: [
    ['mode', '0 = 움직이는 영역만 검사(빠름, 동영상용), 1 = 매 프레임 전체 화면 검사(느리지만 정지한 사람도 찾음)'],
    ['threshold', 'SVM 점수 기준 ×0.01 (기본 75 = 0.75). 높이면 오검출이 줄고, 낮추면 더 많이 찾지만 기둥 · 삼각대 같은 오검출이 늘어남'],
  ],
  inputs: ['video:vtest.mp4', 'street.png', 'camera'],
  assets: ['street.png'],
  note: 'HOG 보행자 검출기는 서 있는(직립) 사람을 정면 · 측면에서 본 모습으로 학습되어 앉은 사람, 많이 가려진 사람, 64×128 창보다 작은 사람(키 약 80px 미만)은 잘 못 찾습니다. 브라우저는 느리므로 mode 1(전체 검사)은 프레임이 많이 끊길 수 있습니다.',
  refs: [
    ['OpenCV: HOGDescriptor', 'https://docs.opencv.org/4.x/d5/d33/structcv_1_1HOGDescriptor.html'],
    ['OpenCV: 배경 차분(Background Subtraction)', 'https://docs.opencv.org/4.x/d1/dc5/tutorial_background_subtraction.html'],
    ['OpenCV: DNN 모듈(NMSBoxes)', 'https://docs.opencv.org/4.x/d6/d0f/group__dnn.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np
import time

cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 0, 1, lambda x: None)
cv.createTrackbar('threshold', 'result', 75, 300, lambda x: None)

try:
    cv.ocl.setUseOpenCL(False)    # (PC 에서) OpenCL 초기화 지연 방지 — 브라우저에는 영향 없음
except Exception:
    pass
hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())
K3 = np.ones((3, 3), np.uint8)
S = {'shape': None}

def is_media():
    try:
        import webcv
        return webcv.is_video() or webcv.is_camera()
    except Exception:
        return False

def hog_detect(img, x0=0, y0=0, up=1.0, scale=1.05, pad=16):
    """img 에서 사람을 찾아 원본 좌표 [x,y,w,h], 점수 목록으로 돌려줌"""
    if up != 1.0:
        img = cv.resize(img, None, fx=up, fy=up, interpolation=cv.INTER_LINEAR)
    if img.shape[0] < 128 or img.shape[1] < 64:
        return [], []
    rects, weights = hog.detectMultiScale(img, winStride=(8, 8), padding=(pad, pad), scale=scale)
    boxes, scores = [], []
    for (x, y, w, h), s in zip(rects, np.asarray(weights).ravel()):
        boxes.append([int(x0 + x / up), int(y0 + y / up), int(w / up), int(h / up)])
        scores.append(float(s))
    return boxes, scores

def overlap(a, b):
    return a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3]

def process(frame):
    t0 = time.perf_counter()
    mode = cv.getTrackbarPos('mode', 'result')
    thr = cv.getTrackbarPos('threshold', 'result') / 100.0
    # 작업 해상도: 너무 크면 가로 800 으로 축소 (속도)
    s = min(1.0, 800.0 / frame.shape[1])
    img = frame if s == 1.0 else cv.resize(frame, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
    H, W = img.shape[:2]
    media = is_media()
    if S['shape'] != img.shape:
        S.update(shape=img.shape, mog=cv.createBackgroundSubtractorMOG2(300, 25, False), n=0, prev=[], maxc=0)
    S['n'] += 1

    rois = []
    boxes, scores, hold = [], [], []
    f = 0.25
    small = cv.resize(img, None, fx=f, fy=f, interpolation=cv.INTER_AREA)
    fg = S['mog'].apply(small) if media else None
    if not media or mode == 1 or S['n'] == 1:
        # 이미지 · 첫 프레임 · mode 1 : 전체 화면 검사
        boxes, scores = hog_detect(img)
        how = 'FULL SCAN'
    else:
        fg = cv.morphologyEx(fg, cv.MORPH_OPEN, K3)
        fg = cv.dilate(fg, K3, iterations=3)
        n, _, st, _ = cv.connectedComponentsWithStats(fg)
        for i in range(1, n):
            x, y, w, h, a = st[i]
            if a < 6:
                continue
            cx, cy = (x + w / 2) / f, (y + h / 2) / f
            rw, rh = max(w / f + 48, 100), max(h / f + 48, 170)   # 사람 한 명이 충분히 들어갈 크기
            x0, y0 = int(max(0, cx - rw / 2)), int(max(0, cy - rh / 2))
            x1, y1 = int(min(W, cx + rw / 2)), int(min(H, cy + rh / 2))
            rois.append((x0, y0, x1 - x0, y1 - y0))
        for x0, y0, w, h in rois:
            b, sc = hog_detect(img[y0:y0 + h, x0:x0 + w], x0, y0, 1.2, 1.08, 8)
            boxes += b
            scores += sc
        # 움직임이 없는 곳(가만히 서 있는 사람)은 직전 결과를 잠시 유지
        for b, sc, age in S['prev']:
            if age < 60 and not any(overlap(b, r) for r in rois):
                hold.append(len(boxes))
                boxes.append(b)
                scores.append(sc)
        how = 'MOTION ROI x%d' % len(rois)

    keep = []
    if boxes:
        idx = cv.dnn.NMSBoxes(boxes, scores, thr, 0.35)
        keep = [int(i) for i in np.asarray(idx).ravel()]
    prev = []
    vis = img.copy()
    for x0, y0, w, h in rois:
        cv.rectangle(vis, (x0, y0), (x0 + w, y0 + h), (200, 200, 0), 1)
    count = 0
    for i in keep:
        x, y, w, h = boxes[i]
        old = i in hold
        age = 0
        if old:
            age = [a for b, sc, a in S['prev'] if b == boxes[i]][:1]
            age = (age[0] if age else 0) + 1
        prev.append((boxes[i], scores[i], age))
        # HOG 상자는 사람 주위에 여백이 있으므로 조금 줄여서 표시
        bx, by, bw, bh = int(x + w * 0.16), int(y + h * 0.07), int(w * 0.68), int(h * 0.86)
        col = (0, 200, 255) if old else (60, 220, 60)
        count += 1
        cv.rectangle(vis, (bx, by), (bx + bw, by + bh), col, 2, cv.LINE_AA)
        cv.putText(vis, '%d' % count, (bx + 2, by - 5), cv.FONT_HERSHEY_SIMPLEX, 0.5, col, 2, cv.LINE_AA)
    S['prev'] = prev
    S['maxc'] = max(S['maxc'], count)

    ms = (time.perf_counter() - t0) * 1000
    cv.rectangle(vis, (0, 0), (W, 44), (30, 30, 30), -1)
    cv.putText(vis, 'PEOPLE: %d' % count, (10, 32), cv.FONT_HERSHEY_DUPLEX, 1.0, (60, 230, 60), 2, cv.LINE_AA)
    info = 'HOG+SVM  %s  %.0f ms' % (how, ms)
    if media:
        info = 'MAX %d   ' % S['maxc'] + info
    cv.putText(vis, info, (215, 29), cv.FONT_HERSHEY_SIMPLEX, 0.55, (220, 220, 220), 1, cv.LINE_AA)
    if not media:
        print('검출된 사람: %d명 (SVM 점수 기준 %.2f)' % (count, thr))
    return vis
`,
});

/* ------------------------------------------------------------------ 🚨 금지 구역 침입 경보 */
APPS.add({
  id: 'intrusion',
  cat: 'vision',
  icon: '🚨',
  title: '움직임 감지 · 금지 구역 침입 경보',
  subtitle: '배경 차분으로 움직이는 물체를 찾고, 지정한 구역에 발을 들이면 경보',
  summary: `<p>고정된 CCTV 화면에서 <b>배경과 달라진 부분 = 움직이는 물체</b>를 찾고, 미리 그려 둔 <b>금지 구역(다각형)</b> 안으로 들어온 물체가 있으면 빨간 상자와 <b>ALERT</b> 경보를 띄웁니다.</p>
<p>핵심은 <b>MOG2 배경 차분</b>입니다. 픽셀마다 “평소 밝기”를 여러 개의 가우시안 분포로 기억해 두었다가 그 범위를 벗어나는 픽셀을 전경(움직임)으로 표시하고, 조명이 천천히 바뀌면 배경 모델도 따라 갱신합니다.
사람의 위치는 상자의 <b>발 위치(아래쪽 가운데)</b>로 판단합니다 — 머리가 구역 위로 겹쳐 보여도 실제로 구역에 서 있지 않으면 경보를 울리지 않기 위해서입니다.</p>`,
  uses: [
    ['공장 · 로봇 셀 안전', '산업용 로봇 · 프레스 주변 위험 구역에 작업자가 들어오면 설비 정지'],
    ['철도 · 지하철', '승강장 안전선 · 선로 무단 진입 감지'],
    ['보안 · 무인 시설', '야간 창고 · 변전소 · 주차장 울타리 침입 감지 후 관제실 알림'],
    ['건설 현장', '크레인 · 굴착기 작업 반경 출입 경고'],
  ],
  steps: [
    '프레임을 가로 320px 로 줄여 <code>createBackgroundSubtractorMOG2</code> 에 넣어 전경 마스크 생성 (그림자로 판정된 값 127 은 제외 — 바닥 그림자에 경보가 울리지 않도록)',
    '열림(<code>MORPH_OPEN</code>)으로 점 노이즈 제거, 닫힘 · 팽창으로 끊어진 몸을 한 덩어리로',
    '<code>findContours</code> → 최소 면적보다 큰 덩어리만 물체로 인정하고 외접 사각형 계산',
    '상자 발 위치가 금지 구역 안인지 <code>pointPolygonTest</code> 로 판정',
    '구역 안에 물체가 있으면 빨간 상자 · ALERT 배너, 비어 있던 구역에 새로 들어온 순간마다 경보 횟수 +1 (몇 프레임 연속 비어야 해제 — 깜빡임 방지)',
  ],
  tech: ['cv.createBackgroundSubtractorMOG2', 'cv.morphologyEx', 'cv.findContours', 'cv.boundingRect', 'cv.pointPolygonTest', 'cv.addWeighted'],
  controls: [
    ['sensitivity', '움직임 민감도(1~100). 높을수록 작은 밝기 변화도 움직임으로 봄 (MOG2 varThreshold 를 낮춤)'],
    ['min_area', '물체로 인정할 최소 면적(가로 320px 로 줄인 영상 기준 픽셀). 낙엽 · 노이즈를 무시하려면 크게'],
  ],
  inputs: ['video:vtest.mp4', 'camera'],
  assets: [],
  note: '움직임 감지는 이전 프레임들과 비교해야 하므로 동영상 · 웹캠에서만 동작합니다(이미지를 넣으면 안내 문구만 표시). 처음 몇 프레임은 배경을 배우는 중이라 경보를 내지 않습니다. 카메라가 흔들리거나 조명이 갑자기 바뀌면 화면 전체가 움직임으로 잡힐 수 있습니다.',
  refs: [
    ['OpenCV: 배경 차분(Background Subtraction)', 'https://docs.opencv.org/4.x/d1/dc5/tutorial_background_subtraction.html'],
    ['OpenCV: 모폴로지 연산', 'https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html'],
    ['OpenCV: 윤곽선(Contours) 시작하기', 'https://docs.opencv.org/4.x/d4/d73/tutorial_py_contours_begin.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np

cv.namedWindow('result')
cv.createTrackbar('sensitivity', 'result', 70, 100, lambda x: None)
cv.createTrackbar('min_area', 'result', 60, 1000, lambda x: None)

# 금지 구역: 화면 크기에 대한 비율(0~1)로 정의 → 어떤 해상도에서도 같은 위치
ZONE_N = np.float32([[0.70, 0.50], [0.99, 0.52], [0.99, 0.82], [0.78, 0.76]])
CLEAR_FRAMES = 6     # 구역이 이만큼 연속으로 비어야 경보 해제 (깜빡임 방지)
WORK_W = 320
K3 = np.ones((3, 3), np.uint8)
K5 = cv.getStructuringElement(cv.MORPH_ELLIPSE, (7, 7))
S = {'shape': None}

def is_media():
    try:
        import webcv
        return webcv.is_video() or webcv.is_camera()
    except Exception:
        return True

def reset(shape):
    h, w = shape[:2]
    S.update(shape=shape, mog=cv.createBackgroundSubtractorMOG2(history=300, varThreshold=16, detectShadows=True),
             zone=(ZONE_N * [w, h]).astype(np.int32), n=0, events=0, alarm=False, clear=0)
    # 그림자 판정 기준: 배경보다 '조금' 어두운 곳만 그림자로 (기본 0.5 는 어두운 옷까지 그림자로 봄)
    S['mog'].setShadowThreshold(0.9)

def draw_zone(vis, zone, alert):
    over = vis.copy()
    col = (0, 0, 255) if alert else (0, 215, 255)
    cv.fillPoly(over, [zone], col)
    cv.addWeighted(over, 0.28, vis, 0.72, 0, vis)
    cv.polylines(vis, [zone], True, col, 2, cv.LINE_AA)
    (tw, th), _ = cv.getTextSize('RESTRICTED ZONE', cv.FONT_HERSHEY_SIMPLEX, 0.55, 2)
    cx, cy = zone.mean(0)
    x = int(min(max(cx - tw / 2, 4), vis.shape[1] - tw - 4))
    y = int(zone[:, 1].max() - 10)
    cv.putText(vis, 'RESTRICTED ZONE', (x, y), cv.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 4, cv.LINE_AA)
    cv.putText(vis, 'RESTRICTED ZONE', (x, y), cv.FONT_HERSHEY_SIMPLEX, 0.55, col, 2, cv.LINE_AA)

def process(frame):
    if S['shape'] != frame.shape:
        reset(frame.shape)          # 입력 크기가 바뀌면 배경 모델 · 구역을 새로 만듦
    H, W = frame.shape[:2]
    vis = frame.copy()
    zone = S['zone']
    if not is_media():
        draw_zone(vis, zone, False)
        cv.rectangle(vis, (0, 0), (W, 70), (40, 40, 40), -1)
        cv.putText(vis, 'Motion detection needs VIDEO or CAMERA input', (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
        cv.putText(vis, '(a single image has no "before" frame to compare)', (10, 56), cv.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1, cv.LINE_AA)
        print('움직임 감지는 동영상 또는 웹캠 입력에서 동작합니다. 입력 소스를 vtest.mp4 나 웹캠으로 바꿔 보세요.')
        return vis

    sens = max(1, cv.getTrackbarPos('sensitivity', 'result'))
    min_area = max(1, cv.getTrackbarPos('min_area', 'result'))
    S['n'] += 1
    f = WORK_W / float(W)
    small = cv.resize(frame, (WORK_W, max(1, int(round(H * f)))), interpolation=cv.INTER_AREA)
    small = cv.GaussianBlur(small, (3, 3), 0)
    mog = S['mog']
    mog.setVarThreshold(4 + (100 - sens) * 0.6)   # sensitivity 70 → 22
    fg = mog.apply(small)
    _, mask = cv.threshold(fg, 200, 255, cv.THRESH_BINARY)   # 255=전경, 127=그림자 → 그림자 제외
    mask = cv.morphologyEx(mask, cv.MORPH_OPEN, K3)
    mask = cv.morphologyEx(mask, cv.MORPH_CLOSE, K5, iterations=2)
    mask = cv.dilate(mask, K3, iterations=1)
    cv.imshow('mask', mask)

    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    learning = S['n'] <= 5
    objs = []
    for c in contours:
        if cv.contourArea(c) < min_area:
            continue
        x, y, w, h = cv.boundingRect(c)
        x, y, w, h = int(x / f), int(y / f), int(w / f), int(h / f)
        foot = (x + w // 2, y + h)
        inside = (not learning) and cv.pointPolygonTest(zone.astype(np.float32), (float(foot[0]), float(foot[1])), False) >= 0
        objs.append((x, y, w, h, foot, inside))
    n_in = sum(1 for o in objs if o[5])
    if n_in > 0:
        if not S['alarm']:
            S['events'] += 1         # 구역이 비어 있다가 누군가 들어온 순간
        S['alarm'], S['clear'] = True, 0
    else:
        S['clear'] += 1
        if S['clear'] >= CLEAR_FRAMES:
            S['alarm'] = False
    alert = S['alarm']

    draw_zone(vis, zone, alert)
    for x, y, w, h, foot, inside in objs:
        col = (0, 0, 255) if inside else (60, 210, 60)
        cv.rectangle(vis, (x, y), (x + w, y + h), col, 3 if inside else 2, cv.LINE_AA)
        cv.circle(vis, foot, 5, col, -1, cv.LINE_AA)
        if inside:
            cv.putText(vis, 'INTRUDER', (x, max(14, y - 6)), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2, cv.LINE_AA)

    if learning:
        cv.rectangle(vis, (0, 0), (W, 44), (90, 90, 90), -1)
        cv.putText(vis, 'LEARNING BACKGROUND...', (12, 31), cv.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    elif alert:
        blink = (S['n'] // 3) % 2 == 0
        cv.rectangle(vis, (0, 0), (W, 44), (0, 0, 230) if blink else (0, 0, 150), -1)
        cv.putText(vis, 'ALERT! INTRUSION' + ('  (%d in zone)' % n_in if n_in else ''), (12, 31), cv.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
        cv.rectangle(vis, (0, 0), (W - 1, H - 1), (0, 0, 255), 6)
    else:
        cv.rectangle(vis, (0, 0), (W, 44), (40, 120, 40), -1)
        cv.putText(vis, 'MONITORING - ZONE CLEAR', (12, 31), cv.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 2, cv.LINE_AA)
    txt = 'MOVING %d   ALERTS %d' % (len(objs), S['events'])
    (tw, _), _ = cv.getTextSize(txt, cv.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    cv.putText(vis, txt, (W - tw - 12, 29), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv.LINE_AA)
    return vis
`,
});

/* ------------------------------------------------------------------ 🧭 ArUco 마커 · AR */
APPS.add({
  id: 'aruco',
  cat: 'vision',
  icon: '🧭',
  title: 'ArUco 마커 인식 · AR 합성',
  subtitle: '흑백 사각 마커의 ID · 방향 · 자세를 찾아 그 위에 그림과 3D 상자를 합성',
  summary: `<p><b>ArUco 마커</b>는 검은 테두리 안에 흰 칸 패턴으로 번호(ID)를 새긴 정사각형 표식입니다. 카메라로 찍으면 OpenCV 가 마커의 <b>네 꼭짓점 위치와 ID</b>를 정확히 찾아 주는데, 꼭짓점은 항상 마커 기준 <b>왼쪽 위 → 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래</b> 순서이므로 마커가 돌아가 있어도 <b>방향</b>을 알 수 있습니다.</p>
<p>이 네 점으로 <b>원근 변환(호모그래피)</b>을 구하면 평면 그림을 마커 위에 딱 맞게 붙일 수 있고(AR 스티커), 카메라 초점거리를 가정해 <code>solvePnP</code> 로 <b>3차원 자세</b>를 추정하면 마커 위에 서 있는 3D 상자도 그릴 수 있습니다.</p>`,
  uses: [
    ['로봇 위치 인식', '물류 로봇 · 청소 로봇이 바닥 · 충전대의 마커를 보고 자기 위치와 방향을 보정'],
    ['드론 정밀 착륙', '착륙 패드의 마커를 내려다보며 위치 · 기울기를 맞춰 정확히 착지'],
    ['AR(증강현실)', '교구 · 카드 위에 3D 모델이나 설명을 겹쳐 보여 주기'],
    ['카메라 보정 · 측정', 'ChArUco 보드로 렌즈 왜곡 보정, 마커 크기를 기준으로 거리 · 크기 측정'],
    ['모션 캡처 · 영화 촬영', '촬영 현장에 마커를 붙여 카메라 움직임을 추적하고 CG 합성'],
  ],
  steps: [
    '<code>cv.aruco.getPredefinedDictionary(DICT_4X4_50)</code> — 4×4 칸, ID 0~49 사전 선택',
    '<code>ArucoDetector.detectMarkers</code>: 적응형 이진화 → 사각형 윤곽 찾기 → 내부 칸 읽어 사전과 대조 → 꼭짓점 · ID',
    '첫 꼭짓점(마커의 왼쪽 위)과 둘째 꼭짓점을 잇는 방향으로 회전 각도 계산, 위쪽 방향 화살표 표시',
    '<code>getPerspectiveTransform</code> 으로 그림의 네 모서리 → 마커 네 꼭짓점 호모그래피를 구하고 <code>warpPerspective</code> 로 합성',
    '(mode 2) 초점거리를 영상 폭으로 가정한 카메라 행렬 + <code>solvePnP</code> → <code>projectPoints</code> 로 3D 상자 그리기',
  ],
  tech: ['cv.aruco.ArucoDetector', 'cv.aruco.getPredefinedDictionary', 'cv.aruco.drawDetectedMarkers', 'cv.getPerspectiveTransform', 'cv.warpPerspective', 'cv.solvePnP', 'cv.projectPoints'],
  controls: [
    ['mode', '0 = 검출 결과(ID · 꼭짓점 · 방향)만, 1 = 마커 위에 OpenCV 로고 합성, 2 = 3D 상자 + 좌표축'],
  ],
  inputs: ['aruco_board.png', 'aruco_scene.png', 'camera'],
  assets: ['aruco_board.png', 'aruco_scene.png'],
  note: '웹캠으로 해 보려면 DICT_4X4_50 마커를 화면에 띄우거나 인쇄해 비춰 보세요(“aruco marker generator 4x4” 로 검색하면 만들 수 있습니다). 마커 주변에 흰 여백이 있어야 잘 검출됩니다. 3D 상자는 카메라 보정 없이 초점거리를 어림한 것이라 실제 자세와 약간 다를 수 있습니다.',
  refs: [
    ['OpenCV: ArUco 마커 검출', 'https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html'],
    ['OpenCV: 자세 추정(Pose Estimation)', 'https://docs.opencv.org/4.x/d7/d53/tutorial_py_pose.html'],
    ['OpenCV: 기하 변환(원근 변환)', 'https://docs.opencv.org/4.x/da/d6e/tutorial_py_geometric_transformations.html'],
  ],
  code: String.raw`
import cv2 as cv
import numpy as np
import math

cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 1, 2, lambda x: None)

DICT = cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50)
params = cv.aruco.DetectorParameters()
params.cornerRefinementMethod = cv.aruco.CORNER_REFINE_SUBPIX
detector = cv.aruco.ArucoDetector(DICT, params)

def make_overlay():
    """마커 위에 붙일 그림(흰 카드 + OpenCV 로고). 로고 파일이 없으면 직접 그림"""
    S = 240
    card = np.full((S, S, 3), 255, np.uint8)
    logo = cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED)
    if logo is not None:
        if logo.ndim == 2:
            logo = cv.cvtColor(logo, cv.COLOR_GRAY2BGR)
        if logo.shape[2] == 4:
            a = logo[:, :, 3:4].astype(np.float32) / 255.0
            logo = (logo[:, :, :3] * a + 255 * (1 - a)).astype(np.uint8)
        s = 180.0 / max(logo.shape[:2])
        logo = cv.resize(logo, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        h, w = logo.shape[:2]
        card[(S - h) // 2:(S - h) // 2 + h, (S - w) // 2:(S - w) // 2 + w] = logo
    else:
        for c, (x, y) in zip([(0, 0, 255), (0, 200, 0), (255, 80, 0)], [(120, 80), (75, 156), (165, 156)]):
            cv.circle(card, (x, y), 40, c, 22, cv.LINE_AA)
    cv.rectangle(card, (4, 4), (S - 5, S - 5), (0, 150, 255), 8)
    cv.arrowedLine(card, (S // 2, 34), (S // 2, 8), (0, 150, 255), 5, tipLength=0.5)   # 그림의 '위쪽'
    return card

OVER = make_overlay()
OH, OW = OVER.shape[:2]
MASK = np.full((OH, OW), 255, np.uint8)
SRC = np.float32([[0, 0], [OW, 0], [OW, OH], [0, OH]])
OBJ = np.float32([[-0.5, 0.5, 0], [0.5, 0.5, 0], [0.5, -0.5, 0], [-0.5, -0.5, 0]])   # 마커 한 변 = 1
CUBE = np.float32([[-0.5, 0.5, 0], [0.5, 0.5, 0], [0.5, -0.5, 0], [-0.5, -0.5, 0],
                   [-0.5, 0.5, 1], [0.5, 0.5, 1], [0.5, -0.5, 1], [-0.5, -0.5, 1]])

def is_media():
    try:
        import webcv
        return webcv.is_video() or webcv.is_camera()
    except Exception:
        return False

def process(frame):
    mode = cv.getTrackbarPos('mode', 'result')
    H, W = frame.shape[:2]
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    corners, ids, _ = detector.detectMarkers(gray)
    vis = frame.copy()
    info = []
    if ids is not None:
        ids = ids.ravel()
        K = np.float64([[W, 0, W / 2], [0, W, H / 2], [0, 0, 1]])    # 보정 안 된 카메라: 초점거리 ≈ 영상 폭
        for c, mid in zip(corners, ids):
            p = c.reshape(4, 2).astype(np.float32)
            ctr = p.mean(0)
            up = (p[0] + p[1]) / 2                                   # 마커의 위쪽 변 가운데
            ang = math.degrees(math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]))
            side = float(np.mean([np.linalg.norm(p[i] - p[(i + 1) % 4]) for i in range(4)]))
            if mode == 1:
                # 마커를 둘러싼 작은 영역(ROI)에서만 원근 변환 · 합성 (전체 화면보다 훨씬 빠름)
                x0, y0 = np.maximum(np.floor(p.min(0)).astype(int) - 2, 0)
                x1, y1 = np.minimum(np.ceil(p.max(0)).astype(int) + 3, [W, H])
                if x1 - x0 > 2 and y1 - y0 > 2:
                    Hm = cv.getPerspectiveTransform(SRC, p - np.float32([x0, y0]))
                    size = (int(x1 - x0), int(y1 - y0))
                    warp = cv.warpPerspective(OVER, Hm, size, flags=cv.INTER_LINEAR)
                    m = cv.warpPerspective(MASK, Hm, size)
                    m = m.astype(np.float32)[:, :, None] / 255.0
                    roi = vis[y0:y1, x0:x1]
                    vis[y0:y1, x0:x1] = (roi * (1 - m) + warp * m).astype(np.uint8)
            elif mode == 2:
                ok, rvec, tvec = cv.solvePnP(OBJ, p, K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
                if ok:
                    q, _ = cv.projectPoints(CUBE, rvec, tvec, K, None)
                    q = q.reshape(-1, 2).astype(np.int32)
                    top = vis.copy()
                    cv.fillConvexPoly(top, q[4:], (255, 200, 0), cv.LINE_AA)
                    cv.addWeighted(top, 0.35, vis, 0.65, 0, vis)
                    for i in range(4):
                        cv.line(vis, tuple(map(int, q[i])), tuple(map(int, q[4 + i])), (255, 180, 0), 2, cv.LINE_AA)
                        cv.line(vis, tuple(map(int, q[4 + i])), tuple(map(int, q[4 + (i + 1) % 4])), (255, 230, 80), 2, cv.LINE_AA)
                    cv.drawFrameAxes(vis, K, None, rvec, tvec, 0.6, 2)
                    info.append('   ID %d  pose t=(%.1f, %.1f, %.1f) marker units' % (mid, tvec[0][0], tvec[1][0], tvec[2][0]))
            if mode == 0:
                cv.aruco.drawDetectedMarkers(vis, [c], np.array([[mid]]), (0, 255, 0))
            else:
                cv.polylines(vis, [p.astype(np.int32)], True, (0, 255, 0), 2, cv.LINE_AA)
            # 꼭짓점 0(마커의 왼쪽 위) 강조 + 위쪽 방향 화살표
            cv.circle(vis, tuple(map(int, p[0])), max(4, int(side / 25)), (0, 0, 255), -1, cv.LINE_AA)
            if mode == 0:
                tip = ctr + (up - ctr) * 1.6
                cv.arrowedLine(vis, tuple(map(int, ctr)), tuple(map(int, tip)), (0, 0, 255), 3, cv.LINE_AA, tipLength=0.25)
            txt = 'ID %d  %+.0f deg' % (mid, ang)
            (tw, th), _ = cv.getTextSize(txt, cv.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            org = (int(min(max(ctr[0] - tw / 2, 2), W - tw - 2)), int(min(p[:, 1].max() + th + 12, H - 6)))
            cv.rectangle(vis, (org[0] - 4, org[1] - th - 6), (org[0] + tw + 4, org[1] + 6), (20, 20, 20), -1)
            cv.putText(vis, txt, org, cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv.LINE_AA)
    n = 0 if ids is None else len(ids)
    cv.rectangle(vis, (0, 0), (W, 40), (30, 30, 30), -1)
    title = ['DETECT', 'AR OVERLAY', '3D POSE'][mode]
    if n:
        cv.putText(vis, 'MARKERS: %d   IDs %s   [%s]' % (n, sorted(int(i) for i in ids), title), (10, 27),
                   cv.FONT_HERSHEY_SIMPLEX, 0.7, (80, 255, 80), 2, cv.LINE_AA)
    else:
        cv.putText(vis, 'No marker - show an ArUco DICT_4X4_50 marker', (10, 27), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2, cv.LINE_AA)
    if not is_media():
        print('검출된 마커 %d개: ID %s' % (n, [] if ids is None else sorted(int(i) for i in ids)))
        for s in info:
            print(s)
    return vis
`,
});
