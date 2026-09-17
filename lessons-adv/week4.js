/* 심화 4주차: 프로젝트 Ⅰ · 가이드 프로젝트와 기획 — docs/LESSON_GUIDE.md · docs/ADVANCED_GUIDE.md 참고 */
COURSE.addLessons([
  // =====================================================================
  // a4-1 심화 프로젝트 오리엔테이션
  // =====================================================================
  {
    id: 'a4-1',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png'],
    summary: '1~3주차에 배운 특징점 매칭 · 3D 기하 · 머신러닝 · 객체 검출을 “부품”으로 보고, 여러 기술을 엮은 심화 파이프라인을 설계하는 방법을 익힙니다. 얼굴 검출(Haar) + 상품 찾기(ORB + 호모그래피) 미니 프로젝트를 단계별로 만들고, 2주 프로젝트의 일정 · 팀 규칙 · 주제 · 정량 평가 기준(정밀도 · 재현율 · FPS · 오차)을 안내합니다.',
    goals: [
      '검출 → 기술/매칭/분류 → 기하 검증 → 출력으로 이어지는 심화 파이프라인을 설명하고 각 단계의 함수를 예로 들 수 있다',
      '두 가지 기술(Haar 얼굴 검출, ORB 매칭 + 호모그래피)을 한 파이프라인으로 엮고 단계별 시간(ms)을 측정할 수 있다',
      '정확도 · 정밀도 · 재현율 · IoU · FPS · 오차(mm, px) 같은 정량 지표를 계산할 수 있다',
      '2주 프로젝트 일정, 팀 규칙, 주제 선택 기준, 평가 루브릭과 제출물을 이해한다',
    ],
    schedule: [['도입 · 프로젝트 소개', 5], ['심화 파이프라인 개념', 10], ['미니 프로젝트: 매장 CCTV', 15], ['일정 · 팀 · 주제 안내', 10], ['정량 평가 지표 · 루브릭', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 이제는 기술을 “엮는” 시간</h3>
<p>지난 3주 동안 모은 부품을 떠올려 봅시다.</p>
<ul>
<li><b>1주차 · 특징점</b>: Harris · Shi-Tomasi · SIFT · ORB, <code>BFMatcher</code> + 비율 테스트, <code>findHomography</code> 로 물체 찾기</li>
<li><b>2주차 · 3D</b>: 캘리브레이션 · 왜곡 보정, <code>solvePnP</code> 자세 추정, 에피폴라 기하, 스테레오 깊이, ArUco 마커</li>
<li><b>3주차 · 머신러닝 · 검출</b>: kNN · SVM + HOG 손글씨, K-Means, Haar 얼굴, HOG 보행자, DNN(YOLOX · YuNet)</li>
</ul>
<p>입문 과정의 프로젝트가 “필터 몇 개를 순서대로 잇기”였다면, 심화 프로젝트는 <b>서로 다른 종류의 기술을 엮어</b> 한 기술만으로는 어려운 문제를 푸는 것입니다. 예를 들어 “검출기로 관심 영역을 좁힌 뒤 → 특징 매칭으로 무엇인지 확인하고 → 호모그래피로 위치를 검증한다” 같은 식입니다.</p>
<ul>
<li><b>4주차 (가이드 프로젝트 + 기획)</b>: 파노라마, AR 오버레이, 캘리브레이션 실측, 손글씨 인식기를 단계별로 만들고 팀 프로젝트를 기획해 프로토타입과 <b>기준선 성능</b>까지 측정합니다.</li>
<li><b>5주차 (구현 + 발표)</b>: 데이터 · 특징 설계, 학습 · 튜닝, 실시간 최적화, 3D 결합, 디버깅을 거쳐 <b>숫자로 증명하는</b> 발표를 합니다.</li>
</ul>` },
      { type: 'text', html: `<h3>2. 심화 파이프라인 5단계</h3>
<p>입문의 “입력 → 전처리 → 분할 → 분석 → 출력”이 심화에서는 아래처럼 바뀝니다. 가장 큰 차이는 <b>④ 기하 · 신뢰도 검증</b> 단계입니다. 매칭이나 분류는 “항상 무언가를” 돌려주므로, 그 결과를 믿어도 되는지 <b>숫자로 확인</b>하는 단계가 꼭 필요합니다.</p>` },
      { type: 'table', head: ['단계', '하는 일', '대표 함수 (배운 것)', '결과물'], rows: [
        ['① 입력 · 정규화', '크기 줄이기, 흑백, 왜곡 보정', '<code>cv.resize</code>, <code>cvtColor</code>, <code>undistort</code>', '처리하기 좋은 이미지'],
        ['② 검출 · 후보 찾기', '볼 곳(ROI) 좁히기, 기준점 찾기', '<code>CascadeClassifier</code>, <code>HOGDescriptor</code>, YOLOX, <code>findChessboardCorners</code>, <code>ArucoDetector</code>', '박스 · 코너 목록'],
        ['③ 기술 · 매칭 · 분류', '무엇인지 알아내기', '<code>SIFT</code> · <code>ORB</code> + <code>knnMatch</code>, HOG + <code>SVM</code>, <code>KNearest</code>', '매칭 쌍, 라벨'],
        ['④ 기하 · 신뢰도 검증', '결과를 믿어도 되는지 확인', '<code>findHomography</code>(RANSAC 인라이어), <code>solvePnP</code>, 재투영 오차, 투표 수', '통과/실패, 신뢰도'],
        ['⑤ 출력 · 측정', '그리기 · 합성 · 수치화', '<code>warpPerspective</code>, <code>perspectiveTransform</code>, <code>putText</code>, 시간 측정', '결과 이미지, mm · 개수 · FPS'],
      ] },
      { type: 'tip', html: `<p><b>두 가지 습관</b>: ① 모든 단계의 중간 결과를 한 장으로 모은 <b>디버그 뷰</b> ② 모든 단계의 <b>처리 시간(ms)</b> 출력. 브라우저는 로컬 Python 보다 5~10배 느리므로, 어느 단계가 느린지 모르면 실시간 버전을 만들 수 없습니다.</p>` },
      { type: 'text', html: `<h3>3. 미니 프로젝트: “얼굴은 가리고, 상품은 찾는” 매장 CCTV</h3>
<p>가상의 매장 CCTV 화면에서 두 가지 일을 동시에 합니다.</p>
<ol>
<li><b>개인정보 보호</b>: 손님 얼굴을 Haar 캐스케이드로 찾아 모자이크 (3주차)</li>
<li><b>상품 모니터링</b>: 진열대에서 기준 상품(<code>box.png</code>)을 ORB 특징 매칭 + 호모그래피로 찾아 테두리 표시 (1주차)</li>
</ol>
<p>화면은 <code>lena.jpg</code>(손님)와 <code>box_in_scene.png</code>(진열대)를 옆으로 붙여 만듭니다. 한 번에 다 짜지 말고 <b>STEP 마다 실행해 눈으로 확인</b>합니다.</p>` },
      { type: 'code', title: '예제 1 · STEP 1: 장면 만들기 + 얼굴 검출 · 모자이크', code: String.raw`
import cv2 as cv
import numpy as np

# 가상의 매장 CCTV 장면: 왼쪽 = 손님(lena), 오른쪽 = 상품 진열대(box_in_scene)
person = cv.resize(cv.imread('lena.jpg'), (384, 384))
shelf = cv.imread('box_in_scene.png')              # 512x384 (흑백 사진이지만 3채널로 읽힘)
scene = np.hstack([person, shelf])
gray = cv.cvtColor(scene, cv.COLOR_BGR2GRAY)
print('장면 크기:', scene.shape)

# STEP 1 · 얼굴 검출 (Haar) — 절반 크기에서 검출하면 약 4배 빠름
casc = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
small = cv.resize(gray, None, fx=0.5, fy=0.5)
found = casc.detectMultiScale(small, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
faces = [(int(x * 2), int(y * 2), int(w * 2), int(h * 2)) for (x, y, w, h) in found]   # 원래 좌표로
print('얼굴 수:', len(faces), faces)

# 개인정보 보호: 얼굴 영역을 12x12 로 줄였다가 다시 키우면 모자이크
result = scene.copy()
for (x, y, w, h) in faces:
    roi = result[y:y + h, x:x + w]
    tiny = cv.resize(roi, (12, 12), interpolation=cv.INTER_AREA)
    result[y:y + h, x:x + w] = cv.resize(tiny, (w, h), interpolation=cv.INTER_NEAREST)
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 0, 255), 2)

cv.imshow('scene', scene)
cv.imshow('step1 faces', result)
`, desc: '<p>검출은 <b>절반 크기</b>에서 하고, 좌표만 2배 해서 원본에 그립니다. 이 “작게 검출 → 크게 그리기”는 실시간 프로젝트의 기본 최적화입니다.</p>' },
      { type: 'code', title: '예제 2 · STEP 2: ORB 매칭 + 호모그래피로 상품 찾기', code: String.raw`
import cv2 as cv
import numpy as np

person = cv.resize(cv.imread('lena.jpg'), (384, 384))
scene = np.hstack([person, cv.imread('box_in_scene.png')])
gray = cv.cvtColor(scene, cv.COLOR_BGR2GRAY)
ref = cv.imread('box.png', cv.IMREAD_GRAYSCALE)      # 찾을 상품의 기준 사진

# ③ 기술 · 매칭: ORB + 비율 테스트
orb = cv.ORB_create(nfeatures=1000)
kp_r, des_r = orb.detectAndCompute(ref, None)
kp_s, des_s = orb.detectAndCompute(gray, None)
pairs = cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des_r, des_s, k=2)
good = []
for p in pairs:
    if len(p) == 2 and p[0].distance < 0.75 * p[1].distance:
        good.append(p[0])
print('특징점: 기준 %d, 장면 %d / 좋은 매칭 %d' % (len(kp_r), len(kp_s), len(good)))

# ④ 기하 검증: RANSAC 호모그래피의 인라이어 수로 “진짜 찾았는지” 판단
MIN_INLIERS = 15
result = scene.copy()
found = False
if len(good) >= 4:
    src = np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    inliers = int(mask.sum()) if H is not None else 0
    print('인라이어: %d / %d (%.0f%%)' % (inliers, len(good), 100 * inliers / len(good)))
    if inliers >= MIN_INLIERS:
        found = True
        h, w = ref.shape
        corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)
        box = cv.perspectiveTransform(corners, H)
        cv.polylines(result, [np.int32(box)], True, (0, 255, 0), 3)
        x, y = np.int32(box[0, 0])
        cv.putText(result, 'box (%d inliers)' % inliers, (x, max(20, y - 10)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        print('상품 네 꼭짓점:', np.int32(box).reshape(-1, 2).tolist())
print('상품 찾음?', found)

# 매칭 선 보기 (인라이어만 초록)
vis = cv.drawMatches(ref, kp_r, gray, kp_s, good, None, matchColor=(0, 255, 0),
                     matchesMask=mask.ravel().tolist() if found else None, flags=2)
cv.imshow('step2 matches', vis)
cv.imshow('step2 product', result)
`, desc: '<p>매칭은 lena 얼굴 쪽에도 몇 개 생기지만, RANSAC 은 하나의 평면 변환에 맞는 점(인라이어)만 남깁니다. <b>인라이어 수 ≥ 15</b> 같은 기준이 “찾았다/못 찾았다”를 결정하는 <b>검증 단계</b>입니다.</p>' },
      { type: 'code', title: '예제 3 · 함수로 나눈 파이프라인 + 단계별 시간 + 디버그 뷰', code: String.raw`
import cv2 as cv
import numpy as np
import time

CONFIG = {'face_scale': 0.5, 'orb_features': 1000, 'ratio': 0.75, 'min_inliers': 15}

CASC = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
ORB = cv.ORB_create(nfeatures=CONFIG['orb_features'])
REF = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
KP_R, DES_R = ORB.detectAndCompute(REF, None)       # 기준 특징은 한 번만 계산

def load_scene():                                   # ① 입력
    person = cv.resize(cv.imread('lena.jpg'), (384, 384))
    return np.hstack([person, cv.imread('box_in_scene.png')])

def detect_faces(gray, cfg):                        # ② 검출
    s = cfg['face_scale']
    small = cv.resize(gray, None, fx=s, fy=s)
    found = CASC.detectMultiScale(small, 1.1, 5, minSize=(30, 30))
    return [tuple(int(v / s) for v in f) for f in found]

def find_product(gray, cfg):                        # ③ 매칭 + ④ 검증
    kp, des = ORB.detectAndCompute(gray, None)
    if des is None:
        return None, 0
    good = [p[0] for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(DES_R, des, k=2)
            if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
    if len(good) < 4:
        return None, 0
    src = np.float32([KP_R[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    inliers = int(mask.sum()) if H is not None else 0
    if inliers < cfg['min_inliers']:
        return None, inliers
    h, w = REF.shape
    box = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H)
    return box, inliers

def visualize(img, faces, box, inliers):            # ⑤ 출력
    out = img.copy()
    for (x, y, w, h) in faces:
        tiny = cv.resize(out[y:y + h, x:x + w], (12, 12), interpolation=cv.INTER_AREA)
        out[y:y + h, x:x + w] = cv.resize(tiny, (w, h), interpolation=cv.INTER_NEAREST)
    if box is not None:
        cv.polylines(out, [np.int32(box)], True, (0, 255, 0), 3)
    cv.putText(out, 'faces:%d  product:%s (%d)' % (len(faces), 'FOUND' if box is not None else 'none', inliers),
               (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return out

def debug_view(images, labels, tile_h=200):
    tiles = []
    for im, label in zip(images, labels):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        t = cv.resize(im, (int(im.shape[1] * tile_h / im.shape[0]), tile_h))
        cv.putText(t, label, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        tiles.append(t)
    return np.hstack(tiles)

times = {}
t = time.perf_counter(); img = load_scene(); gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY); times['input'] = time.perf_counter() - t
t = time.perf_counter(); faces = detect_faces(gray, CONFIG); times['faces'] = time.perf_counter() - t
t = time.perf_counter(); box, inl = find_product(gray, CONFIG); times['product'] = time.perf_counter() - t
t = time.perf_counter(); result = visualize(img, faces, box, inl); times['draw'] = time.perf_counter() - t

total = sum(times.values())
for k, v in times.items():
    print('%-8s %6.1f ms' % (k, v * 1000))
print('합계 %.1f ms → 약 %.1f FPS' % (total * 1000, 1 / total))
cv.imshow('result', result)
cv.imshow('debug', debug_view([img, gray, result], ['input', 'gray', 'result']))
`, desc: '<p>콘솔의 단계별 ms 를 보고 <b>어느 단계가 병목인지</b> 찾아보세요. <code>CONFIG[\'face_scale\']</code> 을 1.0 으로 바꾸면 얼굴 검출 시간이 어떻게 변하나요?</p>' },
      { type: 'code', title: '예제 4 · 실시간 버전: process(frame)', code: String.raw`
import cv2 as cv
import numpy as np
import time

WIN = 'controls'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('min inliers', WIN, 15, 60, nothing)
cv.createTrackbar('mosaic', WIN, 1, 1, nothing)

CASC = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
ORB = cv.ORB_create(nfeatures=800)
REF = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
KP_R, DES_R = ORB.detectAndCompute(REF, None)
BF = cv.BFMatcher(cv.NORM_HAMMING)

def process(frame):
    t0 = time.perf_counter()
    scale = min(1.0, 480 / frame.shape[1])            # 처리용은 가로 480 이하로
    small = cv.resize(frame, None, fx=scale, fy=scale)
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
    out = frame.copy()

    # 얼굴 → 모자이크 (절반 크기에서 한 번 더 줄여 검출)
    tiny_gray = cv.resize(gray, None, fx=0.5, fy=0.5)
    for (x, y, w, h) in CASC.detectMultiScale(tiny_gray, 1.1, 5, minSize=(24, 24)):
        k = 2 / scale                                 # 원본 좌표로
        x, y, w, h = int(x * k), int(y * k), int(w * k), int(h * k)
        roi = out[y:y + h, x:x + w]
        if roi.size and cv.getTrackbarPos('mosaic', WIN):
            out[y:y + h, x:x + w] = cv.resize(cv.resize(roi, (10, 10)), (roi.shape[1], roi.shape[0]), interpolation=cv.INTER_NEAREST)
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 2)

    # 상품 찾기
    status = 'product: none'
    kp, des = ORB.detectAndCompute(gray, None)
    if des is not None and len(kp) >= 10:
        good = [p[0] for p in BF.knnMatch(DES_R, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
        if len(good) >= 4:
            src = np.float32([KP_R[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
            dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
            H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
            inl = int(mask.sum()) if H is not None else 0
            if inl >= cv.getTrackbarPos('min inliers', WIN):
                h, w = REF.shape
                box = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H) / scale
                cv.polylines(out, [np.int32(box)], True, (0, 255, 0), 3)
                status = 'product: FOUND (%d)' % inl
    ms = (time.perf_counter() - t0) * 1000
    cv.putText(out, '%s  %.0f ms' % (status, ms), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    return out

# 이미지로 한 번 확인 (패널 입력을 box_in_scene.png, lena.jpg, 📷 웹캠으로 바꿔 보세요)
cv.imshow('test', process(cv.imread('box_in_scene.png')))
`, desc: '<p>📷 웹캠으로 바꾸면 매 프레임 실행됩니다. 웹캠이 없으면 🎞️ 동영상(vtest.avi)을 골라 얼굴 모자이크 속도를 확인하세요. 화면 위의 <b>ms 값이 300 을 넘지 않게</b> 유지하는 것이 목표입니다.</p>' },
      { type: 'text', html: `<h3>4. 2주 프로젝트 일정</h3>
<p>매 교시 끝에 <b>그날의 산출물</b>이 나오도록 짜여 있습니다. 특히 심화 과정은 <b>a4-8 에서 기준선(baseline) 숫자</b>를 측정해 두어야 5주차에 “얼마나 좋아졌는지”를 발표할 수 있습니다.</p>` },
      { type: 'table', head: ['교시', '내용', '팀 산출물'], rows: [
        ['a4-1', '심화 프로젝트 오리엔테이션 (지금)', '팀 구성, 관심 주제 후보 3개 + 떠오르는 지표'],
        ['a4-2 · a4-3', '가이드 ① 파노라마', '매칭 · 호모그래피 디버그 뷰 → 블렌딩된 파노라마'],
        ['a4-4', '가이드 ② 평면 물체 인식 · AR 오버레이', '상자 위에 합성된 AR 카드, 실시간 버전'],
        ['a4-5', '가이드 ③ 캘리브레이션 기반 실측', '탑뷰 이미지, 마우스로 mm 측정'],
        ['a4-6', '가이드 ④ 손글씨 숫자 인식기', '마우스로 쓰면 인식하는 앱'],
        ['a4-7', '팀 프로젝트 기획', '주제 확정, <b>데이터 계획</b>, 지표 · 목표, 설계서, 스켈레톤 코드'],
        ['a4-8', '프로토타입 만들기', '끝까지 도는 MVP, <b>기준선 성능표</b>, 실패 사례 갤러리'],
        ['a5-1 · a5-2', '구현 ①② 데이터 · 특징 · 학습 · 튜닝', '데이터셋, 특징 모듈, 정확도 · 혼동 행렬'],
        ['a5-3 · a5-4', '구현 ③④ 실시간 최적화 · 3D 결합', 'process(frame) 버전, 트랙바 · 마우스 인터랙션'],
        ['a5-5', '테스트 · 디버깅 · 코드 리뷰', '실패 원인 분석표, 수정된 코드'],
        ['a5-6', '결과 정리와 발표 준비', '정량 평가표, 전후 비교, 발표자료'],
        ['a5-7 · a5-8', '프로젝트 발표회 · 회고', '발표, 동료 평가, 회고'],
      ] },
      { type: 'text', html: `<h3>5. 팀 규칙</h3>
<ul>
<li>팀은 <b>2~3명</b>. 모든 팀원이 <b>코드 한 모듈 이상</b>(예: 데이터 · 특징 · 검증 · 시각화)을 직접 작성하고 발표 한 부분을 맡습니다.</li>
<li><b>테스트 세트는 처음에 정하고 고정</b>합니다. 튜닝할 때마다 테스트 이미지를 바꾸면 성능 비교가 의미가 없어집니다.</li>
<li>코드 정본은 한 명이 관리하고, 의미 있는 변경마다 <code>v1</code>, <code>v2</code> 로 저장 + <b>실험 기록</b>(바꾼 것 · 결과 숫자)을 남깁니다.</li>
<li>브라우저 속도를 존중합니다: 예제 한 번 실행 <b>3초 이내</b>, <code>process(frame)</code> 한 프레임 <b>0.3초 이내</b>.</li>
<li>남의 코드 · 데이터 · 모델을 쓰면 출처를 발표자료에 적습니다.</li>
</ul>
<h3>6. 프로젝트 주제 아이디어</h3>
<p>그대로 골라도, 변형해도, 새 주제를 가져와도 됩니다. 난이도(★)는 2주 기준이고, <b>“정량 지표”</b> 칸이 비어 있는 주제는 좋은 주제가 아닙니다.</p>` },
      { type: 'table', head: ['주제', '난이도', '결합하는 기법', '정량 지표 예'], rows: [
        ['얼굴 모자이크 CCTV', '★', 'Haar / YuNet 검출 + 블러 · 모자이크, process(frame)', '얼굴 재현율(가리지 못한 얼굴 수), FPS'],
        ['상품 인식 선반 모니터링', '★★', 'ORB · SIFT 매칭 + 호모그래피, 여러 기준 상품, 인라이어 판정', '상품별 정밀도 · 재현율, 처리 ms'],
        ['책 표지 인식 AR', '★★', '특징 매칭 + <code>warpPerspective</code> 합성, 흔들림 보정', '인식률, 꼭짓점 위치 오차(px), FPS'],
        ['파노라마 스캐너 (3장 이상)', '★★', 'SIFT + 연쇄 호모그래피 + 블렌딩 + 크롭', '인라이어 비율, 이음새 밝기 차, Stitcher 대비 시간'],
        ['거리 · 크기 측정 자', '★★', '캘리브레이션 + 체스보드/ArUco 평면 호모그래피 + 마우스', 'mm 오차(자로 잰 값과 비교), 재투영 오차'],
        ['마커 기반 로봇 도킹 가이드', '★★', 'ArUco + <code>solvePnP</code>, 방향 · 거리 안내', '각도 오차(°), 거리 오차(mm)'],
        ['손글씨 계산기', '★★★', '컨투어 분할 + HOG · SVM, 연산자 기호 직접 수집 · 학습', '숫자 정확도, 수식 정답률'],
        ['도로 표지판 분류기', '★★★', '색 · 모양 후보 검출 + HOG · SVM (직접 만든 데이터)', '정확도, 혼동 행렬, 검출 재현율'],
        ['보행자 · 차량 계수기', '★★★', 'HOG 사람 검출 / YOLOX + 중복 제거 + 선 통과 계수', '계수 오차, 정밀도 · 재현율, FPS'],
      ] },
      { type: 'text', html: `<h3>7. 정량 평가 지표</h3>
<p>심화 프로젝트는 “잘 된다” 대신 <b>숫자</b>로 말합니다. 주제에 맞는 지표 2~3개를 고르세요.</p>
<ul>
<li><b>정확도(Accuracy)</b> = 맞힌 수 / 전체 — 분류(숫자 · 표지판)에 사용. 클래스가 불균형하면 속을 수 있음</li>
<li><b>정밀도(Precision)</b> = TP / (TP + FP) — “찾았다고 한 것 중 진짜” 비율. 헛검출(FP)이 많으면 낮아짐</li>
<li><b>재현율(Recall)</b> = TP / (TP + FN) — “진짜 중 찾아낸” 비율. 놓친 것(FN)이 많으면 낮아짐</li>
<li><b>IoU</b> = 겹친 넓이 / 합친 넓이 — 검출 박스가 정답 박스와 “맞았다”고 볼지 판단 (보통 0.5 이상)</li>
<li><b>처리 시간 · FPS</b> = 1000 / (한 프레임 ms) — 실시간 여부</li>
<li><b>기하 오차</b>: 재투영 오차(px), 측정 오차(mm), 인라이어 비율 — 3D · 매칭 프로젝트</li>
</ul>` },
      { type: 'code', title: '예제 5 · 지표 계산기: IoU · 정밀도 · 재현율 · 정확도 · FPS · mm 오차', code: String.raw`
import cv2 as cv
import numpy as np
import time

# ---- 1) 검출 평가: IoU 로 정답 박스와 짝짓기 ----
def iou(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    ix = max(0, min(ax + aw, bx + bw) - max(ax, bx))
    iy = max(0, min(ay + ah, by + bh) - max(ay, by))
    inter = ix * iy
    return inter / float(aw * ah + bw * bh - inter)

def eval_detections(gt_boxes, pred_boxes, thr=0.5):
    used = set()
    tp = 0
    for p in pred_boxes:
        best, best_j = 0, -1
        for j, g in enumerate(gt_boxes):
            if j not in used and iou(p, g) > best:
                best, best_j = iou(p, g), j
        if best >= thr:
            tp += 1
            used.add(best_j)
    fp = len(pred_boxes) - tp
    fn = len(gt_boxes) - tp
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    return tp, fp, fn, precision, recall

gt = [(160, 150, 130, 130), (600, 60, 80, 80), (700, 250, 60, 60)]       # 사람이 표시한 정답
pred = [(163, 152, 130, 130), (590, 70, 85, 75), (20, 300, 50, 50)]     # 검출기 결과
tp, fp, fn, P, R = eval_detections(gt, pred)
print('[검출] TP=%d FP=%d FN=%d  정밀도=%.2f  재현율=%.2f  F1=%.2f' % (tp, fp, fn, P, R, 2 * P * R / (P + R)))
print('       첫 박스 IoU = %.2f' % iou(gt[0], pred[0]))

# ---- 2) 분류 평가: 정확도 + 혼동 행렬 ----
y_true = np.array([0, 0, 1, 1, 1, 2, 2, 2, 2, 1])
y_pred = np.array([0, 1, 1, 1, 1, 2, 2, 0, 2, 1])
acc = np.mean(y_true == y_pred)
cm = np.zeros((3, 3), int)
for t, p in zip(y_true, y_pred):
    cm[t, p] += 1
print('[분류] 정확도 = %.0f%%' % (acc * 100))
print('       혼동 행렬 (행=정답, 열=예측)\n', cm)

# ---- 3) 속도: 같은 작업을 여러 번 재서 평균 ----
img = cv.imread('lena.jpg', cv.IMREAD_GRAYSCALE)
small = cv.resize(img, None, fx=0.5, fy=0.5)
casc = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
casc.detectMultiScale(small, 1.1, 5)                   # 첫 실행(준비 시간)은 빼고
N = 5
t = time.perf_counter()
for i in range(N):
    casc.detectMultiScale(small, 1.1, 5)
ms = (time.perf_counter() - t) / N * 1000
print('[속도] 얼굴 검출 %.1f ms/프레임 → %.1f FPS' % (ms, 1000 / ms))

# ---- 4) 측정 오차: 자로 잰 값과 비교 ----
true_mm = np.array([150.0, 125.0, 195.3])
measured_mm = np.array([151.2, 124.1, 197.0])
err = np.abs(measured_mm - true_mm)
print('[측정] 평균 오차 %.2f mm, 최대 오차 %.2f mm, 평균 상대 오차 %.1f%%' % (err.mean(), err.max(), (err / true_mm).mean() * 100))
`, desc: '<p>세 번째 예측 박스는 어떤 정답과도 IoU 가 0.5 미만이라 <b>FP</b>, 세 번째 정답은 아무도 못 찾았으니 <b>FN</b> 입니다. 발표에서는 이런 숫자를 표로 보여 줍니다.</p>' },
      { type: 'table', head: ['평가 항목', '배점', '기준'], rows: [
        ['기능 완성도', '25', '설계서의 필수 기능이 끝까지 동작, 테스트 세트(10장 이상 권장) 전체에서 실행'],
        ['기술 결합 · 설계', '20', '두 가지 이상 기법을 목적에 맞게 결합, 검증 단계(인라이어 · 신뢰도 등)의 근거'],
        ['정량 평가', '20', '지표 정의 · 고정된 테스트 세트 · 기준선 대비 개선 수치 · 실패 사례 분석'],
        ['코드 품질', '15', 'CONFIG, 단계별 함수, 디버그 뷰, 시간 측정, 한국어 주석'],
        ['실시간 · 인터랙션', '10', 'process(frame) 동작(≤ 0.3 s/프레임), 트랙바 · 마우스'],
        ['발표', '10', '문제 → 파이프라인 → 데모 → 숫자 → 실패와 개선, 시간 준수'],
      ] },
      { type: 'checklist', title: '최종 제출물', items: [
        '코드: 강좌 편집기에서 실행되는 최종 코드(.py) + 학습형이면 학습 코드 포함',
        '설계서: 주제, 데이터 계획, 파이프라인, 지표와 목표값 (a4-7 템플릿)',
        '평가표: 기준선(a4-8) → 최종 결과 수치 비교 (정확도/정밀도/재현율/ms/오차 중 해당 항목)',
        '결과 · 디버그 뷰 이미지 3장 이상 + 실패 사례 갤러리 1장',
        '발표자료 7~8분 (문제 → 파이프라인 → 데모 → 숫자 → 실패와 개선 → 소감)',
      ] },
      { type: 'warn', html: `<p><b>심화 프로젝트에서 흔한 실수</b></p>
<ul>
<li>원본 크기 그대로 SIFT → 브라우저에서 한 장에 2초 가까이. <b>먼저 줄이고</b> 특징점 수를 제한하기</li>
<li>매칭 결과를 검증 없이 믿음 → 물체가 없어도 “찾았다”고 표시. <b>인라이어 수 · 비율 기준</b> 필수</li>
<li>학습에 쓴 이미지로 테스트 → 정확도 100% 착시. 학습/테스트는 <b>반드시 분리</b></li>
<li><code>cv.putText</code> 에 한글 → <b>???</b> 로 깨짐. 이미지 위 글자는 영어로</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 검출기 결합: 얼굴 안에서만 눈 찾기',
        desc: `<p>“검출기로 ROI 를 좁힌 뒤 정밀 처리”하는 결합 패턴을 연습합니다. <code>lena.jpg</code> 에서 얼굴을 찾은 뒤, <b>얼굴 윗부분 절반(ROI) 안에서만</b> <code>haarcascade_eye.xml</code> 로 눈을 찾으세요. 눈 박스는 원본 좌표로 바꿔 파란색으로 그리고, 얼굴 전체에서 찾을 때와 눈 개수 · 시간을 비교해 출력합니다. 눈 2개가 나오면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time

img = cv.imread('lena.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
face_casc = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_casc = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_eye.xml')

# 비교용: 이미지 전체에서 눈 찾기
t = time.perf_counter()
eyes_all = eye_casc.detectMultiScale(gray, 1.1, 5)
print('전체에서 찾은 눈: %d개, %.1f ms' % (len(eyes_all), (time.perf_counter() - t) * 1000))

out = img.copy()
faces = face_casc.detectMultiScale(gray, 1.1, 5, minSize=(80, 80))
t = time.perf_counter()
eye_count = 0
for (x, y, w, h) in faces:
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 2)
    # TODO 1: 얼굴 윗부분 절반을 ROI 로 자르세요 (gray[y:y + h//2, x:x + w])
    roi = gray
    # TODO 2: ROI 안에서 eye_casc.detectMultiScale 로 눈을 찾으세요
    eyes = []
    for (ex, ey, ew, eh) in eyes:
        # TODO 3: ROI 좌표 → 원본 좌표 (x + ex, y + ey)
        cv.rectangle(out, (ex, ey), (ex + ew, ey + eh), (255, 0, 0), 2)
        eye_count += 1
print('얼굴 ROI 안에서 찾은 눈: %d개, %.1f ms' % (eye_count, (time.perf_counter() - t) * 1000))
cv.imshow('face + eyes', out)
`,
        hint: `<p><code>roi = gray[y:y + h // 2, x:x + w]</code>, <code>eyes = eye_casc.detectMultiScale(roi, 1.1, 5)</code>, 그리기는 <code>(x + ex, y + ey)</code> ~ <code>(x + ex + ew, y + ey + eh)</code>. ROI 가 작아서 시간도 줄고, 입 · 콧구멍 같은 헛검출도 사라집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time

img = cv.imread('lena.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
face_casc = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_casc = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_eye.xml')

t = time.perf_counter()
eyes_all = eye_casc.detectMultiScale(gray, 1.1, 5)
print('전체에서 찾은 눈: %d개, %.1f ms' % (len(eyes_all), (time.perf_counter() - t) * 1000))

out = img.copy()
faces = face_casc.detectMultiScale(gray, 1.1, 5, minSize=(80, 80))
t = time.perf_counter()
eye_count = 0
for (x, y, w, h) in faces:
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 0, 255), 2)
    roi = gray[y:y + h // 2, x:x + w]                     # 눈은 얼굴 윗부분에만 있다
    eyes = eye_casc.detectMultiScale(roi, 1.1, 5)
    for (ex, ey, ew, eh) in eyes:
        cv.rectangle(out, (x + ex, y + ey), (x + ex + ew, y + ey + eh), (255, 0, 0), 2)
        eye_count += 1
print('얼굴 ROI 안에서 찾은 눈: %d개, %.1f ms' % (eye_count, (time.perf_counter() - t) * 1000))
cv.imshow('face + eyes', out)
`,
      },
      {
        title: '실습 2 · 판정 기준에 따른 정밀도 · 재현율 표',
        desc: `<p>어떤 상품 인식기가 테스트 이미지 12장에서 낸 결과가 <code>(인라이어 수, 실제로 상품이 있었나)</code> 목록으로 주어집니다. “인라이어 ≥ 기준이면 찾았다”로 판정할 때, 기준을 <b>5, 10, 15, 20, 30</b> 으로 바꿔 가며 TP · FP · FN · 정밀도 · 재현율 · F1 을 표로 출력하고, <b>F1 이 가장 높은 기준</b>을 고르세요.</p>`,
        starter: String.raw`
# (인라이어 수, 실제로 상품이 있었나)
results = [(42, True), (35, True), (8, False), (18, True), (12, False), (27, True),
           (6, False), (14, True), (22, False), (9, True), (51, True), (4, False)]

def score(threshold):
    tp = fp = fn = 0
    for inliers, has_product in results:
        found = inliers >= threshold
        if found and has_product:
            tp += 1
        # TODO 1: 찾았다고 했는데 상품이 없으면 fp, 상품이 있는데 못 찾았으면 fn 을 1 늘리세요
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return tp, fp, fn, precision, recall, f1

print('기준  TP FP FN  정밀도 재현율   F1')
best = None
# TODO 2: 5, 10, 15, 20, 30 모두 돌면서 표를 출력하고 F1 이 가장 큰 기준을 best 에 저장
for thr in [15]:
    tp, fp, fn, p, r, f1 = score(thr)
    print('%4d  %2d %2d %2d   %.2f   %.2f  %.2f' % (thr, tp, fp, fn, p, r, f1))
print('F1 최고 기준:', best)
`,
        hint: `<p><code>elif found and not has_product: fp += 1</code>, <code>elif not found and has_product: fn += 1</code>. 기준을 올리면 정밀도는 오르고 재현율은 떨어지는 <b>트레이드오프</b>를 표에서 확인하세요.</p>`,
        solution: String.raw`
# (인라이어 수, 실제로 상품이 있었나)
results = [(42, True), (35, True), (8, False), (18, True), (12, False), (27, True),
           (6, False), (14, True), (22, False), (9, True), (51, True), (4, False)]

def score(threshold):
    tp = fp = fn = 0
    for inliers, has_product in results:
        found = inliers >= threshold
        if found and has_product:
            tp += 1
        elif found and not has_product:
            fp += 1
        elif not found and has_product:
            fn += 1
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return tp, fp, fn, precision, recall, f1

print('기준  TP FP FN  정밀도 재현율   F1')
best, best_f1 = None, -1
for thr in [5, 10, 15, 20, 30]:
    tp, fp, fn, p, r, f1 = score(thr)
    print('%4d  %2d %2d %2d   %.2f   %.2f  %.2f' % (thr, tp, fp, fn, p, r, f1))
    if f1 > best_f1:
        best, best_f1 = thr, f1
print('F1 최고 기준:', best, '(F1 = %.2f)' % best_f1)
`,
      },
    ],
    quiz: [
      { q: '심화 파이프라인에서 “기하 · 신뢰도 검증” 단계가 특히 중요한 이유는?', options: ['이미지를 컬러로 바꾸기 위해', '처리 속도를 높이기 위해', '매칭 · 분류는 물체가 없어도 항상 어떤 결과를 내므로, 그 결과를 믿어도 되는지 확인해야 해서', 'putText 로 글자를 쓰기 위해'], answer: 2, explain: 'knnMatch 는 항상 가장 가까운 짝을 돌려주고 SVM 은 항상 어떤 라벨을 냅니다. RANSAC 인라이어 수, 재투영 오차, 투표 수 같은 검증이 있어야 헛검출을 막을 수 있습니다.' },
      { q: '얼굴을 먼저 찾고 그 윗부분에서만 눈을 찾는 방식의 장점으로 옳지 않은 것은?', options: ['얼굴을 못 찾아도 눈은 항상 찾을 수 있다', '탐색 영역이 작아 빨라진다', '얼굴 밖의 헛검출이 줄어든다', '검출기를 결합해 각자의 약점을 보완한다'], answer: 0, explain: 'ROI 를 좁히는 방식은 첫 검출기(얼굴)가 실패하면 다음 단계(눈)도 실행되지 않습니다. 결합 파이프라인은 앞 단계의 재현율이 전체 재현율의 상한이 됩니다.' },
      { q: '상품 인식기가 “찾았다”고 한 10번 중 7번만 진짜였고, 실제 상품 14개 중 7개를 찾았다. 정밀도와 재현율은?', options: ['정밀도 0.5, 재현율 0.7', '정밀도 0.7, 재현율 0.7', '정밀도 0.5, 재현율 0.5', '정밀도 0.7, 재현율 0.5'], answer: 3, explain: '정밀도 = TP/(TP+FP) = 7/10 = 0.7, 재현율 = TP/(TP+FN) = 7/14 = 0.5 입니다.' },
      { q: '브라우저에서 실시간(process) 프로젝트를 만들 때 가장 먼저 할 일로 알맞은 것은?', options: ['SIFT 를 원본 크기로 실행한다', '단계별 처리 시간(ms)을 재서 병목을 찾고, 입력을 줄이거나 특징점 수를 제한한다', 'while True 루프로 웹캠을 읽는다', '모든 단계를 하나의 긴 함수로 합친다'], answer: 1, explain: '브라우저는 로컬보다 5~10배 느립니다. 시간을 재야 병목을 알 수 있고, 축소 · 특징점 수 제한 · ROI 로 0.3 s/프레임 이내를 맞춥니다. while 루프는 웹 환경에서 사용할 수 없습니다.' },
      { q: '2주 심화 프로젝트 주제로 가장 적절한 것은?', options: ['세상의 모든 물체를 인식하는 앱', '자율주행 자동차의 전체 인지 시스템', '책 표지 3종을 인식해 위에 정보 카드를 합성하고, 20장 테스트에서 인식률과 FPS 를 측정하는 앱', '지표 없이 멋진 효과를 보여 주는 데모'], answer: 2, explain: '배운 기법(특징 매칭 + 호모그래피 + 합성)으로 2주 안에 가능하고, 테스트 세트와 정량 지표(인식률 · FPS)로 완성도를 증명할 수 있습니다.' },
    ],
  },

  // =====================================================================
  // a4-2 가이드 프로젝트 ① 파노라마 (1)
  // =====================================================================
  {
    id: 'a4-2',
    assets: ['images/adv/s1.jpg', 'images/adv/s2.jpg'],
    summary: '두 장의 사진을 이어 붙이는 파노라마의 앞부분을 만듭니다. 이번 교시에는 입력 축소 → SIFT/ORB 특징점 → knnMatch + 비율 테스트 → RANSAC 호모그래피까지 진행하고, 인라이어 비율 · 재투영 오차로 “정합이 믿을 만한지” 숫자로 확인하는 디버그 뷰를 만듭니다.',
    goals: [
      '브라우저 속도를 고려해 입력 크기를 정하고 SIFT 와 ORB 의 특징점 수 · 시간을 비교할 수 있다',
      'knnMatch 와 비율 테스트로 좋은 매칭을 고르고, 비율 값에 따른 매칭 수 변화를 설명할 수 있다',
      'findHomography(RANSAC) 결과에서 인라이어 수 · 비율 · 재투영 오차를 계산해 정합 품질을 판단할 수 있다',
      '호모그래피의 방향(어느 사진을 어느 사진 좌표로 옮기는지)을 구분하고 재사용 가능한 함수로 정리할 수 있다',
    ],
    schedule: [['도입 · 파노라마 원리', 5], ['STEP 1~2 입력 · 특징점', 10], ['STEP 3 매칭 · 비율 테스트', 10], ['STEP 4 호모그래피 · 검증', 15], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개: 파노라마 만들기</h3>
<p>스마트폰 파노라마 모드는 카메라를 <b>제자리에서 돌리며</b> 여러 장을 찍고 이어 붙입니다. 제자리에서 회전했거나 먼 풍경(거의 평면)을 찍었다면, 두 사진 사이의 관계는 <b>호모그래피(3×3 행렬) 하나</b>로 표현됩니다.</p>
<ol>
<li>두 사진에서 <b>특징점</b>을 찾고 기술자로 <b>매칭</b>한다 ← <b>이번 교시 (a4-2)</b></li>
<li>매칭 쌍으로 <b>호모그래피</b>를 추정하고 믿을 만한지 검증한다 ← <b>이번 교시 (a4-2)</b></li>
<li>한 사진을 다른 사진 좌표로 <b>워핑</b>해 큰 캔버스에 놓고 <b>블렌딩 · 크롭</b>한다 ← 다음 교시 (a4-3)</li>
</ol>
<p>입력은 프랑스 퐁뒤가르 다리를 찍은 <code>s1.jpg</code>(왼쪽)와 <code>s2.jpg</code>(오른쪽)입니다. 이번 교시에는 <b>s2 를 s1 의 좌표로 옮기는 호모그래피</b>를 구합니다.</p>` },
      { type: 'image', src: 'adv/s1.jpg', caption: 's1.jpg (왼쪽 사진, 800×449) — s2.jpg 는 오른쪽으로 돌려 찍은 사진(800×404)' },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        '두 사진의 특징점 수와 검출 시간이 출력된다 (SIFT · ORB 비교)',
        '비율 테스트를 통과한 매칭 선이 그려지고, 좋은 매칭이 100개 이상이다',
        '호모그래피 행렬과 인라이어 비율(80% 이상), 평균 재투영 오차(px)가 출력된다',
        's2 의 테두리를 s1 좌표로 옮겨 그린 “겹침 미리보기”에서 다리 난간이 이어진다',
        '관계없는 사진 쌍을 넣으면 FAIL 로 판정된다',
      ] },
      { type: 'text', html: `<h3>STEP 1. 입력 준비: 먼저 줄인다</h3>
<p>SIFT 는 브라우저에서 가로 800 px 사진 한 장에 <b>약 1.7초</b>가 걸립니다. 두 장이면 3초를 넘습니다. 특징점 매칭에는 원본 해상도가 필요하지 않으므로 <b>가로 480 px</b> 로 줄여서 시작합니다(면적이 약 1/3 → 시간도 약 1/3). 다음 교시의 워핑도 같은 크기에서 합니다.</p>` },
      { type: 'code', title: '예제 1 · STEP 1: 두 사진 읽고 같은 폭으로 줄이기', code: String.raw`
import cv2 as cv
import numpy as np
import time

WIDTH = 480                        # 처리 폭 (브라우저 속도를 위해 줄임)

def load_resized(name, width=WIDTH):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

t = time.perf_counter()
left = load_resized('s1.jpg')
right = load_resized('s2.jpg')
print('원본 크기: s1', cv.imread('s1.jpg').shape, '/ s2', cv.imread('s2.jpg').shape)
print('처리 크기: left', left.shape, '/ right', right.shape, '(%.1f ms)' % ((time.perf_counter() - t) * 1000))

# 높이가 달라서 바로 hstack 할 수 없음 → 아래쪽을 검은색으로 채워 나란히 보기
h = max(left.shape[0], right.shape[0])
pad = lambda im: cv.copyMakeBorder(im, 0, h - im.shape[0], 0, 0, cv.BORDER_CONSTANT)
view = np.hstack([pad(left), pad(right)])
cv.line(view, (WIDTH, 0), (WIDTH, h), (0, 255, 255), 2)
cv.putText(view, 'left (s1)', (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
cv.putText(view, 'right (s2)', (WIDTH + 10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
cv.imshow('inputs', view)
`, desc: '<p>두 사진에서 <b>같은 아치</b>를 찾아보세요. 오른쪽 사진 왼쪽 부분의 큰 아치들이 왼쪽 사진의 오른쪽 부분과 겹칩니다. 이 겹치는 영역에서만 매칭이 생깁니다.</p>' },
      { type: 'text', html: `<h3>STEP 2. 특징점 검출: SIFT vs ORB</h3>
<ul>
<li><b>SIFT</b>: 크기 · 회전 · 밝기 변화에 강하고 매칭이 정확함. 128차원 실수 기술자(<code>NORM_L2</code>). 느림.</li>
<li><b>ORB</b>: 매우 빠름. 32바이트 이진 기술자(<code>NORM_HAMMING</code>). 반복 무늬가 많으면 오매칭이 늘 수 있음.</li>
</ul>
<p>파노라마처럼 <b>한 번만 계산</b>하면 되는 작업은 정확한 SIFT, 매 프레임 계산하는 실시간 작업은 ORB 가 보통 유리합니다. 직접 숫자로 비교해 봅시다.</p>` },
      { type: 'code', title: '예제 2 · STEP 2: SIFT 와 ORB 특징점 수 · 시간 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

left = load_resized('s1.jpg')
gray = cv.cvtColor(left, cv.COLOR_BGR2GRAY)

detectors = {
    'SIFT': cv.SIFT_create(nfeatures=1500),
    'ORB': cv.ORB_create(nfeatures=1500),
}
views = []
for name, det in detectors.items():
    t = time.perf_counter()
    kp, des = det.detectAndCompute(gray, None)
    ms = (time.perf_counter() - t) * 1000
    print('%-4s 특징점 %4d개, 기술자 %s %s, %.1f ms' % (name, len(kp), des.shape, des.dtype, ms))
    vis = cv.drawKeypoints(left, kp, None, color=(0, 255, 0))
    cv.putText(vis, '%s: %d kp' % (name, len(kp)), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    views.append(vis)

cv.imshow('SIFT vs ORB keypoints', np.vstack(views))
`, desc: '<p>SIFT 는 128차원 <code>float32</code>, ORB 는 32바이트 <code>uint8</code> 기술자입니다. 특징점이 <b>하늘에는 거의 없고</b> 다리 · 나무 · 바위에 몰린 것도 확인하세요. 무늬 없는 영역은 매칭할 수 없습니다.</p>' },
      { type: 'text', html: `<h3>STEP 3. 매칭과 비율 테스트</h3>
<p>오른쪽 사진(right)의 각 특징점마다 왼쪽 사진(left)에서 <b>가장 가까운 2개</b>를 찾고(<code>knnMatch(k=2)</code>), 1등이 2등보다 <b>충분히 가까울 때만</b> 믿습니다(Lowe 의 비율 테스트). 반복되는 아치처럼 비슷한 곳이 여러 군데면 1등과 2등의 거리가 비슷해져 걸러집니다.</p>
<p><b>방향 주의</b>: <code>knnMatch(des_right, des_left)</code> 로 쓰면 <code>m.queryIdx</code> 는 right 의 점, <code>m.trainIdx</code> 는 left 의 점입니다. 이 순서가 다음 STEP 에서 “right → left” 호모그래피가 됩니다.</p>` },
      { type: 'code', title: '예제 3 · STEP 3: knnMatch + 비율 테스트 값 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
sift = cv.SIFT_create()
kp_l, des_l = sift.detectAndCompute(cv.cvtColor(left, cv.COLOR_BGR2GRAY), None)
kp_r, des_r = sift.detectAndCompute(cv.cvtColor(right, cv.COLOR_BGR2GRAY), None)

t = time.perf_counter()
pairs = cv.BFMatcher(cv.NORM_L2).knnMatch(des_r, des_l, k=2)    # query = right, train = left
print('knnMatch %d쌍, %.1f ms' % (len(pairs), (time.perf_counter() - t) * 1000))

for ratio in [0.6, 0.75, 0.9]:
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    print('비율 %.2f → 좋은 매칭 %d개' % (ratio, len(good)))

good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
good = sorted(good, key=lambda m: m.distance)
vis = cv.drawMatches(right, kp_r, left, kp_l, good[:80], None,
                     matchColor=(0, 255, 0), singlePointColor=(0, 0, 255), flags=2)
cv.putText(vis, 'right (s2) -> left (s1): top 80 of %d' % len(good), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
cv.imshow('matches', vis)
`, desc: '<p>비율을 0.9 로 느슨하게 하면 매칭은 늘지만 엉뚱한 선(대각선으로 가로지르는 선)도 섞입니다. 0.6 은 깨끗하지만 수가 줄어듭니다. 보통 <b>0.7~0.8</b> 에서 시작합니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. 호모그래피 추정과 검증</h3>
<p><code>cv.findHomography(src, dst, cv.RANSAC, 4.0)</code> 는 매칭 쌍 중에서 <b>하나의 3×3 변환으로 설명되는 점들(인라이어)</b>을 찾아 행렬을 계산합니다. 4.0 은 “투영했을 때 4 px 안에 들어오면 인라이어”라는 기준입니다.</p>
<p>결과를 믿기 전에 세 숫자를 확인합니다.</p>
<ul>
<li><b>인라이어 수</b>: 너무 적으면(예: 30개 미만) 우연히 맞았을 수 있음</li>
<li><b>인라이어 비율</b> = 인라이어 / 좋은 매칭: 파노라마 쌍이면 보통 70% 이상</li>
<li><b>평균 재투영 오차</b>: 인라이어 점을 H 로 옮겼을 때 실제 짝과의 거리 평균(px). 1~2 px 이하면 좋음</li>
</ul>
<p>행렬을 읽는 법: 원근 성분(3행)이 거의 0이면 <b>크기 · 이동</b> 위주의 관계입니다. <code>H[0,2]</code> 가 s2 가 s1 좌표에서 오른쪽으로 얼마나 떨어져 있는지 알려 줍니다.</p>` },
      { type: 'code', title: '예제 4 · STEP 4: RANSAC 호모그래피 + 인라이어 · 재투영 오차 + 겹침 미리보기', code: String.raw`
import cv2 as cv
import numpy as np

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
sift = cv.SIFT_create()
kp_l, des_l = sift.detectAndCompute(cv.cvtColor(left, cv.COLOR_BGR2GRAY), None)
kp_r, des_r = sift.detectAndCompute(cv.cvtColor(right, cv.COLOR_BGR2GRAY), None)
pairs = cv.BFMatcher(cv.NORM_L2).knnMatch(des_r, des_l, k=2)
good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]

src = np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)   # right 의 점
dst = np.float32([kp_l[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)   # left 의 점
H, mask = cv.findHomography(src, dst, cv.RANSAC, 4.0)                     # right → left
inl = mask.ravel().astype(bool)
np.set_printoptions(precision=3, suppress=True)
print('H (right → left):\n', H)
print('좋은 매칭 %d, 인라이어 %d (%.1f%%)' % (len(good), inl.sum(), 100 * inl.mean()))

# 재투영 오차: 인라이어 점을 H 로 옮겨 실제 짝과 비교
proj = cv.perspectiveTransform(src[inl], H)
err = np.linalg.norm(proj - dst[inl], axis=2).ravel()
print('재투영 오차: 평균 %.2f px, 최대 %.2f px' % (err.mean(), err.max()))

# 인라이어(초록) / 아웃라이어(빨강) 매칭 그리기 — 선이 너무 많으면 안 보이니 인라이어는 10개 중 1개만
show_in = [m for i, m in enumerate(good) if inl[i]][::10]
show_out = [m for i, m in enumerate(good) if not inl[i]]
vis = cv.drawMatches(right, kp_r, left, kp_l, show_in, None, matchColor=(0, 255, 0), flags=2)
vis = cv.drawMatches(right, kp_r, left, kp_l, show_out, vis, matchColor=(0, 0, 255), flags=3)
cv.imshow('inliers (green) / outliers (red)', vis)

# 겹침 미리보기: right 의 테두리를 left 좌표로 옮겨, 넓힌 캔버스에 그리기
h, w = right.shape[:2]
corners = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H)
print('right 네 모서리 → left 좌표:', np.int32(corners).reshape(-1, 2).tolist())
canvas = cv.copyMakeBorder(left, 10, 10, 0, 260, cv.BORDER_CONSTANT)
cv.polylines(canvas, [np.int32(corners + [0, 10])], True, (0, 255, 255), 2)
cv.putText(canvas, 'right image lands here', (int(corners[0, 0, 0]) + 10, int(corners[3, 0, 1])), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
cv.imshow('overlap preview', canvas)
`, desc: '<p>노란 사각형이 “s2 가 s1 좌표계에서 놓일 자리”입니다. 사각형의 왼쪽 변이 s1 의 가운데쯤에 있어 두 사진이 절반 가까이 겹친다는 것을 알 수 있습니다. 다음 교시에는 이 자리에 실제로 사진을 옮겨 놓습니다.</p>' },
      { type: 'code', title: '예제 5 · 재사용 함수 find_homography() + 실패 판정 디버그 뷰', code: String.raw`
import cv2 as cv
import numpy as np
import time

CONFIG = {'width': 480, 'ratio': 0.75, 'ransac_px': 4.0, 'min_inliers': 30, 'min_inlier_ratio': 0.5}
SIFT = cv.SIFT_create()

def load_resized(name, width):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

def features(img):
    """(이미지, 특징점, 기술자) 묶음 — 같은 사진의 특징은 한 번만 계산해 재사용"""
    kp, des = SIFT.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    return img, kp, des

def find_homography(f_src, f_dst, cfg):
    """src 좌표 → dst 좌표로 옮기는 H 와 품질 정보(dict)를 돌려준다. 실패하면 H = None"""
    info = {'good': 0, 'inliers': 0, 'ratio': 0.0, 'err': -1.0}
    src_img, kp1, d1 = f_src
    dst_img, kp2, d2 = f_dst
    if d1 is None or d2 is None or len(kp1) < 2 or len(kp2) < 2:
        return None, info, None
    pairs = cv.BFMatcher(cv.NORM_L2).knnMatch(d1, d2, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
    info['good'] = len(good)
    vis = cv.drawMatches(src_img, kp1, dst_img, kp2, good[:60], None, matchColor=(0, 255, 0), flags=2)
    if len(good) < 4:
        return None, info, vis
    src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, cfg['ransac_px'])
    if H is None:
        return None, info, vis
    inl = mask.ravel().astype(bool)
    err = np.linalg.norm(cv.perspectiveTransform(src[inl], H) - dst[inl], axis=2)
    info.update(inliers=int(inl.sum()), ratio=float(inl.mean()), err=float(err.mean()))
    if info['inliers'] < cfg['min_inliers'] or info['ratio'] < cfg['min_inlier_ratio']:
        return None, info, vis
    return H, info, vis

def label(vis, H, info):
    text = '%s  good=%d inliers=%d (%.0f%%) err=%.2fpx' % ('OK' if H is not None else 'FAIL', info['good'], info['inliers'], 100 * info['ratio'], info['err'])
    cv.putText(vis, text, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0) if H is not None else (0, 0, 255), 2)
    return vis

t = time.perf_counter()
f_left = features(load_resized('s1.jpg', CONFIG['width']))
f_right = features(load_resized('s2.jpg', CONFIG['width']))
f_other = features(cv.resize(cv.imread('lena.jpg'), (480, 270)))    # 관계없는 사진

H, info, vis = find_homography(f_right, f_left, CONFIG)
print('[s2 → s1]', 'OK' if H is not None else 'FAIL', info, '%.0f ms' % ((time.perf_counter() - t) * 1000))
H2, info2, vis2 = find_homography(f_other, f_left, CONFIG)       # left 특징은 재사용
print('[lena → s1]', 'OK' if H2 is not None else 'FAIL', info2)

cv.imshow('pair s2-s1', label(vis, H, info))
cv.imshow('pair lena-s1', label(vis2, H2, info2))
`, desc: '<p>관계없는 사진 쌍에서도 비율 테스트를 통과하는 매칭이 몇 개 생기고, RANSAC 은 그중 몇 개로 억지로 행렬을 만듭니다. <b>인라이어 수 · 비율 기준</b>이 있어야 FAIL 로 걸러집니다. 이 함수는 다음 교시에 그대로 씁니다.</p>' },
      { type: 'warn', html: `<p><b>파노라마 정합이 실패하는 흔한 원인</b></p>
<ul>
<li><b>겹치는 영역이 적음</b>(20% 미만): 매칭 자체가 적음 → 촬영할 때 30~50% 겹치게</li>
<li><b>카메라가 옆으로 이동</b>(회전이 아니라): 가까운 물체와 먼 물체가 다르게 움직여(시차) 호모그래피 하나로 설명 불가</li>
<li><b>움직이는 물체</b>(사람 · 차 · 물결): 아웃라이어가 늘어남 → RANSAC 이 대부분 걸러 주지만 인라이어 비율이 떨어짐</li>
<li><b>방향 혼동</b>: <code>knnMatch(des_r, des_l)</code> 이면 H 는 right → left. 반대로 쓰면 역행렬(<code>np.linalg.inv(H)</code>)이 나옴</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · ORB 로 바꿔 정합 품질 · 시간 비교하기',
        desc: `<p>예제 4 의 파이프라인을 <b>ORB(nfeatures=1500)</b> 로 바꿔 실행하고, SIFT 와 <b>좋은 매칭 수 · 인라이어 비율 · 재투영 오차 · 시간(ms)</b>을 한 표로 출력하세요. 두 H 의 이동 성분 <code>H[0,2]</code> 가 비슷한지도 확인합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
gl = cv.cvtColor(left, cv.COLOR_BGR2GRAY)
gr = cv.cvtColor(right, cv.COLOR_BGR2GRAY)

def run(detector, norm):
    t = time.perf_counter()
    kp_l, des_l = detector.detectAndCompute(gl, None)
    kp_r, des_r = detector.detectAndCompute(gr, None)
    pairs = cv.BFMatcher(norm).knnMatch(des_r, des_l, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    src = np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp_l[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 4.0)
    ms = (time.perf_counter() - t) * 1000
    inl = mask.ravel().astype(bool)
    err = np.linalg.norm(cv.perspectiveTransform(src[inl], H) - dst[inl], axis=2).mean()
    return len(good), inl.mean(), err, ms, H

print('방법   좋은매칭  인라이어%  오차px    ms    H[0,2]')
g, r, e, ms, H = run(cv.SIFT_create(), cv.NORM_L2)
print('SIFT  %7d   %7.1f  %6.2f  %6.1f  %7.1f' % (g, r * 100, e, ms, H[0, 2]))
# TODO: ORB_create(nfeatures=1500) 와 알맞은 거리(NORM_HAMMING)로 run 을 호출해 같은 형식으로 출력하세요
`,
        hint: `<p><code>run(cv.ORB_create(nfeatures=1500), cv.NORM_HAMMING)</code>. ORB 기술자는 이진값이라 <code>NORM_L2</code> 를 쓰면 매칭 품질이 크게 떨어집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
gl = cv.cvtColor(left, cv.COLOR_BGR2GRAY)
gr = cv.cvtColor(right, cv.COLOR_BGR2GRAY)

def run(detector, norm):
    t = time.perf_counter()
    kp_l, des_l = detector.detectAndCompute(gl, None)
    kp_r, des_r = detector.detectAndCompute(gr, None)
    pairs = cv.BFMatcher(norm).knnMatch(des_r, des_l, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    src = np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp_l[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 4.0)
    ms = (time.perf_counter() - t) * 1000
    inl = mask.ravel().astype(bool)
    err = np.linalg.norm(cv.perspectiveTransform(src[inl], H) - dst[inl], axis=2).mean()
    return len(good), inl.mean(), err, ms, H

print('방법   좋은매칭  인라이어%  오차px    ms    H[0,2]')
for name, det, norm in [('SIFT', cv.SIFT_create(), cv.NORM_L2), ('ORB', cv.ORB_create(nfeatures=1500), cv.NORM_HAMMING)]:
    g, r, e, ms, H = run(det, norm)
    print('%-4s  %7d   %7.1f  %6.2f  %6.1f  %7.1f' % (name, g, r * 100, e, ms, H[0, 2]))
`,
      },
      {
        title: '실습 2 · 비율 · RANSAC 기준 조합 실험표',
        desc: `<p>특징점은 한 번만 계산해 두고, <b>비율 테스트 값(0.6 / 0.75 / 0.9)</b> × <b>RANSAC 기준(1 / 4 / 10 px)</b> 9가지 조합에서 좋은 매칭 수, 인라이어 수 · 비율, 평균 재투영 오차를 표로 출력하세요. 어떤 조합을 고를지 한 줄로 근거를 적어 봅니다(<code>print</code>).</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
sift = cv.SIFT_create()
kp_l, des_l = sift.detectAndCompute(cv.cvtColor(left, cv.COLOR_BGR2GRAY), None)
kp_r, des_r = sift.detectAndCompute(cv.cvtColor(right, cv.COLOR_BGR2GRAY), None)
pairs = cv.BFMatcher(cv.NORM_L2).knnMatch(des_r, des_l, k=2)     # 한 번만 계산

def evaluate(ratio, ransac_px):
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp_l[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, ransac_px)
    inl = mask.ravel().astype(bool)
    err = np.linalg.norm(cv.perspectiveTransform(src[inl], H) - dst[inl], axis=2).mean()
    return len(good), int(inl.sum()), inl.mean(), err

print('ratio  ransac  good  inliers   ratio%   err(px)')
# TODO: ratio 0.6/0.75/0.9, ransac_px 1/4/10 의 모든 조합을 돌며 한 줄씩 출력하세요
g, n, r, e = evaluate(0.75, 4.0)
print('%.2f   %5.1f  %4d  %7d   %6.1f   %.2f' % (0.75, 4.0, g, n, r * 100, e))
print('선택: (여기에 근거를 쓰세요)')
`,
        hint: `<p>이중 for 문 <code>for ratio in [0.6, 0.75, 0.9]:</code> / <code>for px in [1.0, 4.0, 10.0]:</code>. RANSAC 기준을 키우면 인라이어 비율은 오르지만 재투영 오차도 커집니다. “인라이어가 충분하면서 오차가 작은” 조합을 고르세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
sift = cv.SIFT_create()
kp_l, des_l = sift.detectAndCompute(cv.cvtColor(left, cv.COLOR_BGR2GRAY), None)
kp_r, des_r = sift.detectAndCompute(cv.cvtColor(right, cv.COLOR_BGR2GRAY), None)
pairs = cv.BFMatcher(cv.NORM_L2).knnMatch(des_r, des_l, k=2)

def evaluate(ratio, ransac_px):
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp_l[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, ransac_px)
    inl = mask.ravel().astype(bool)
    err = np.linalg.norm(cv.perspectiveTransform(src[inl], H) - dst[inl], axis=2).mean()
    return len(good), int(inl.sum()), inl.mean(), err

print('ratio  ransac  good  inliers   ratio%   err(px)')
for ratio in [0.6, 0.75, 0.9]:
    for px in [1.0, 4.0, 10.0]:
        g, n, r, e = evaluate(ratio, px)
        print('%.2f   %5.1f  %4d  %7d   %6.1f   %.2f' % (ratio, px, g, n, r * 100, e))
print('선택: ratio 0.75 + ransac 4px — 인라이어가 충분히 많고(수백 개) 평균 오차가 1px 안팎으로 작음')
`,
      },
      {
        title: '실습 3 · 호모그래피 방향 뒤집기 확인',
        desc: `<p>예제 5 의 함수를 이용해 <b>right → left</b> 의 H 와 <b>left → right</b> 의 H2 를 각각 구하고, <code>H @ H2</code> 가 단위 행렬에 가까운지(마지막 원소로 나눠 정규화) 출력하세요. 또 left 의 가운데 점 (240, 130) 을 H2 로 right 에 옮긴 뒤 다시 H 로 되돌리면 원래 점과 몇 px 차이가 나는지 계산합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

SIFT = cv.SIFT_create()
def features(img):
    return SIFT.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)

def homography(f1, f2):
    """f1 = (kp1, d1) 사진 좌표 → f2 = (kp2, d2) 사진 좌표"""
    kp1, d1 = f1
    kp2, d2 = f2
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, _ = cv.findHomography(src, dst, cv.RANSAC, 4.0)
    return H

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
f_left, f_right = features(left), features(right)      # 특징은 한 번만 계산
H = homography(f_right, f_left)         # right → left
H2 = np.eye(3)                          # TODO 1: left → right 호모그래피를 구하세요

np.set_printoptions(precision=4, suppress=True)
M = H @ H2
print('H @ H2 (정규화):\n', M / M[2, 2])

p = np.float32([[[240, 130]]])
# TODO 2: p 를 H2 로 옮긴 뒤(q) 다시 H 로 되돌려(back) 원래 점과의 거리를 출력하세요
q = p
back = p
print('left 점', p.ravel(), '→ right', q.ravel(), '→ 되돌림', back.ravel(), '차이 %.2f px' % np.linalg.norm(back - p))
`,
        hint: `<p><code>H2 = homography(f_left, f_right)</code>, <code>q = cv.perspectiveTransform(p, H2)</code>, <code>back = cv.perspectiveTransform(q, H)</code>. 두 추정은 서로 독립이라 정확히 역행렬은 아니지만 매우 가깝습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

SIFT = cv.SIFT_create()
def features(img):
    return SIFT.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)

def homography(f1, f2):
    """f1 = (kp1, d1) 사진 좌표 → f2 = (kp2, d2) 사진 좌표"""
    kp1, d1 = f1
    kp2, d2 = f2
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, _ = cv.findHomography(src, dst, cv.RANSAC, 4.0)
    return H

left, right = load_resized('s1.jpg'), load_resized('s2.jpg')
f_left, f_right = features(left), features(right)      # 특징은 한 번만 계산
H = homography(f_right, f_left)         # right → left
H2 = homography(f_left, f_right)        # left → right

np.set_printoptions(precision=4, suppress=True)
M = H @ H2
print('H @ H2 (정규화):\n', M / M[2, 2])
print('inv(H) 와 H2 비교 (정규화):\n', np.linalg.inv(H) / np.linalg.inv(H)[2, 2], '\n', H2 / H2[2, 2])

p = np.float32([[[240, 130]]])
q = cv.perspectiveTransform(p, H2)
back = cv.perspectiveTransform(q, H)
print('left 점', p.ravel(), '→ right', q.ravel(), '→ 되돌림', back.ravel(), '차이 %.2f px' % np.linalg.norm(back - p))
`,
      },
    ],
    quiz: [
      { q: '두 사진의 관계를 호모그래피 하나로 잘 표현할 수 있는 촬영 조건은?', options: ['카메라를 옆으로 크게 이동하며 가까운 물체를 찍었다', '카메라를 제자리에서 회전하며 찍었거나, 먼 풍경(거의 평면)을 찍었다', '두 사진의 겹치는 영역이 전혀 없다', '사진마다 다른 물체를 찍었다'], answer: 1, explain: '제자리 회전이나 평면(먼 풍경) 장면은 3×3 호모그래피로 정확히 설명됩니다. 옆으로 이동하면 거리마다 이동량이 달라지는 시차가 생깁니다.' },
      { q: 'knnMatch(des_right, des_left, k=2) 결과로 src = right 점, dst = left 점을 넣어 구한 H 의 의미는?', options: ['right 좌표를 left 좌표로 옮긴다', 'left 좌표를 right 좌표로 옮긴다', '두 사진의 밝기 차이를 보정한다', '특징점의 크기를 나타낸다'], answer: 0, explain: 'findHomography(src, dst) 는 src 점을 dst 점으로 옮기는 변환입니다. 여기서는 right → left 이므로 s2 를 s1 좌표계에 워핑할 때 씁니다.' },
      { q: '비율 테스트 값을 0.75 에서 0.9 로 바꾸면 일반적으로 어떻게 되나?', options: ['좋은 매칭 수가 줄고 모두 정확해진다', '매칭 수는 변하지 않는다', '호모그래피를 구할 수 없게 된다', '좋은 매칭 수가 늘지만 오매칭도 더 섞인다'], answer: 3, explain: '기준이 느슨해져 1등과 2등의 거리가 비슷한(애매한) 매칭도 통과합니다. RANSAC 이 일부를 걸러 주지만 인라이어 비율은 떨어집니다.' },
      { q: '관계없는 두 사진에서도 findHomography 가 행렬을 돌려주었다. 실패로 판정하는 가장 좋은 방법은?', options: ['행렬의 첫 원소가 1인지 본다', '특징점 수가 100개 이상이면 성공으로 본다', '인라이어 수와 인라이어 비율이 기준보다 낮으면 실패로 본다', 'H 가 None 이 아니면 항상 성공이다'], answer: 2, explain: 'RANSAC 은 매칭이 4개 이상이면 억지로라도 행렬을 만들 수 있습니다. 인라이어 수 · 비율(필요하면 재투영 오차)로 검증해야 합니다.' },
    ],
  },

  // =====================================================================
  // a4-3 가이드 프로젝트 ① 파노라마 (2)
  // =====================================================================
  {
    id: 'a4-3',
    assets: ['images/adv/s1.jpg', 'images/adv/s2.jpg'],
    summary: '지난 교시에 구한 호모그래피로 파노라마를 완성합니다. 네 모서리를 옮겨 캔버스 크기와 이동 행렬을 계산하고, 두 사진을 워핑해 덮어쓰기 → 거리 기반 페더 블렌딩 → 검은 테두리 크롭까지 진행한 뒤, OpenCV 의 cv.Stitcher 결과 · 속도와 비교합니다.',
    goals: [
      'perspectiveTransform 으로 워핑 후 모서리 위치를 계산해 캔버스 크기와 이동(translation) 행렬을 만들 수 있다',
      '두 사진과 유효 영역 마스크를 같은 캔버스에 워핑하고 겹침 영역을 찾을 수 있다',
      'distanceTransform 가중치로 페더 블렌딩을 구현하고 이음새 밝기 차로 효과를 수치 비교할 수 있다',
      '검은 테두리를 잘라 내고, 직접 구현한 결과를 cv.Stitcher 와 품질 · 시간 · 유연성 면에서 비교할 수 있다',
    ],
    schedule: [['복습 · 완성 모습', 5], ['STEP 5 캔버스 계산', 10], ['STEP 6 워핑 · 덮어쓰기', 10], ['STEP 7 블렌딩', 10], ['STEP 8 크롭 · Stitcher 비교', 5], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 지난 교시 복습과 오늘의 목표</h3>
<p>a4-2 에서 <b>s2(right) 좌표 → s1(left) 좌표</b>로 옮기는 호모그래피 <code>H</code> 를 구했습니다(인라이어 97%, 재투영 오차 0.2 px). 오늘은 이 H 로 실제 파노라마 이미지를 만듭니다.</p>
<p>오늘의 파이프라인: <b>모서리 옮기기 → 캔버스 크기 · 이동 행렬 T → 두 사진 워핑 → 덮어쓰기 → 거리 기반 블렌딩 → 검은 테두리 크롭 → Stitcher 와 비교</b></p>
<p>원본 사진 쌍은 노출이 거의 같고 반듯해서 차이가 잘 안 보입니다. 그래서 예제에서는 <code>HARD = True</code> 로 오른쪽 사진을 <b>6° 돌리고 · 확대하고 · 25% 어둡게</b> 만든 “어려운 입력”도 함께 사용합니다. 실제로 손으로 찍은 사진은 대부분 이런 모습입니다.</p>` },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        '캔버스 크기와 이동량(xmin, ymin)이 출력되고, 사진이 잘리지 않는다',
        '덮어쓰기 결과에서 이음새(밝기가 확 바뀌는 선)가 보이고, 블렌딩 결과에서 사라진다',
        '이음새 밝기 차가 숫자로 출력되고 블렌딩 후 줄어든다',
        '검은 테두리가 없는 최종 파노라마가 panorama.jpg 로 저장된다',
        'cv.Stitcher 결과와 시간이 출력되고, 직접 구현과 차이를 한 가지 이상 말할 수 있다',
      ] },
      { type: 'text', html: `<h3>STEP 5. 캔버스는 얼마나 커야 할까?</h3>
<p><code>cv.warpPerspective(right, H, (w, h))</code> 로 left 크기의 캔버스에 워핑하면, left 밖으로 나가는 부분은 <b>잘려 버립니다</b>. 해결 방법:</p>
<ol>
<li>right 의 네 모서리를 <code>cv.perspectiveTransform</code> 으로 옮겨 <b>워핑 후 위치</b>를 구한다</li>
<li>left 의 네 모서리와 합쳐 <b>xmin, ymin, xmax, ymax</b> 를 구한다 → 캔버스 크기 = (xmax − xmin, ymax − ymin)</li>
<li>좌표가 음수(xmin &lt; 0 또는 ymin &lt; 0)면 캔버스 밖이므로 <b>이동 행렬 T</b> 로 전체를 (−xmin, −ymin) 만큼 민다</li>
<li>left 는 <code>T</code>, right 는 <code>T @ H</code> 로 워핑 (행렬 곱 순서: 먼저 H, 그다음 T)</li>
</ol>` },
      { type: 'code', title: '예제 1 · STEP 5: 그냥 워핑 vs 모서리로 캔버스 계산', code: String.raw`
import cv2 as cv
import numpy as np

HARD = True        # True: 오른쪽 사진을 회전 · 확대 · 어둡게 만든 어려운 입력

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

def make_hard(img, angle=6, zoom=1.25, gain=0.75):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, zoom)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

def find_homography(src_img, dst_img, ratio=0.75):
    sift = cv.SIFT_create()
    k1, d1 = sift.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = sift.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 4.0)
    print('매칭 %d, 인라이어 %d' % (len(good), int(mask.sum())))
    return H

left = load_resized('s1.jpg')
right = load_resized('s2.jpg')
if HARD:
    right = make_hard(right)
H = find_homography(right, left)                  # right → left

# (1) 그냥 left 크기 캔버스에 워핑 → 오른쪽이 잘림
h1, w1 = left.shape[:2]
naive = cv.warpPerspective(right, H, (w1, h1))

# (2) 네 모서리를 옮겨 캔버스 크기 계산
h2, w2 = right.shape[:2]
c_right = cv.perspectiveTransform(np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2), H)
c_left = np.float32([[0, 0], [w1, 0], [w1, h1], [0, h1]]).reshape(-1, 1, 2)
allc = np.vstack([c_left, c_right]).reshape(-1, 2)
xmin, ymin = np.floor(allc.min(axis=0)).astype(int)
xmax, ymax = np.ceil(allc.max(axis=0)).astype(int)
T = np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64)
size = (int(xmax - xmin), int(ymax - ymin))
print('워핑된 right 모서리:', np.int32(c_right).reshape(-1, 2).tolist())
print('범위 x: %d ~ %d, y: %d ~ %d → 캔버스 %d x %d' % (xmin, xmax, ymin, ymax, size[0], size[1]))

canvas = cv.warpPerspective(right, T @ H, size)
cv.polylines(canvas, [np.int32(c_left.reshape(-1, 2) - [xmin, ymin])], True, (0, 255, 255), 2)   # left 가 놓일 자리
cv.polylines(canvas, [np.int32(c_right.reshape(-1, 2) - [xmin, ymin])], True, (0, 0, 255), 2)   # right 테두리
cv.imshow('naive warp (cut off)', naive)
cv.imshow('canvas with T', canvas)
`, desc: '<p>노란 사각형은 left 가 놓일 자리, 빨간 사각형은 워핑된 right 의 테두리입니다. HARD 입력에서는 right 가 기울어져 <b>ymin 이 음수</b>가 될 수 있는데, 그래도 T 덕분에 잘리지 않습니다.</p>' },
      { type: 'text', html: `<h3>STEP 6. 두 사진을 한 캔버스에 놓기 (덮어쓰기)</h3>
<p>두 사진을 각각 워핑하고, 각 사진이 <b>실제로 덮는 영역</b>을 나타내는 마스크도 같은 변환으로 워핑합니다. 흰색(255)으로 가득 찬 사진 크기의 배열을 워핑하면 됩니다. 마스크가 있어야 “검은 픽셀이 사진의 어두운 부분인지, 빈 캔버스인지” 구분할 수 있습니다.</p>
<ul>
<li><b>겹침 영역</b> = 두 마스크가 모두 흰색인 곳 (<code>cv.bitwise_and</code>)</li>
<li><b>덮어쓰기</b>: right 를 깔고 left 가 있는 곳은 left 로 덮기 → 가장 간단하지만 left 의 끝에서 <b>이음새(seam)</b>가 생김</li>
</ul>` },
      { type: 'code', title: '예제 2 · STEP 6: 워핑 + 유효 마스크 + 덮어쓰기와 이음새', code: String.raw`
import cv2 as cv
import numpy as np

HARD = True

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

def make_hard(img, angle=6, zoom=1.25, gain=0.75):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, zoom)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

def find_homography(src_img, dst_img, ratio=0.75):
    sift = cv.SIFT_create()
    k1, d1 = sift.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = sift.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    return cv.findHomography(src, dst, cv.RANSAC, 4.0)[0]

def canvas_transform(left, right, H):
    """캔버스 크기와 이동 행렬 T 를 계산 (예제 1 과 같은 내용)"""
    h1, w1 = left.shape[:2]
    h2, w2 = right.shape[:2]
    c = np.vstack([np.float32([[0, 0], [w1, 0], [w1, h1], [0, h1]]).reshape(-1, 1, 2),
                   cv.perspectiveTransform(np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2), H)]).reshape(-1, 2)
    xmin, ymin = np.floor(c.min(axis=0)).astype(int)
    xmax, ymax = np.ceil(c.max(axis=0)).astype(int)
    T = np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64)
    return T, (int(xmax - xmin), int(ymax - ymin))

left = load_resized('s1.jpg')
right = load_resized('s2.jpg')
if HARD:
    right = make_hard(right)
H = find_homography(right, left)
T, size = canvas_transform(left, right, H)

warp_l = cv.warpPerspective(left, T, size)
warp_r = cv.warpPerspective(right, T @ H, size)
# 유효 영역 마스크: 사진 크기의 흰 판을 같은 변환으로 워핑
mask_l = cv.warpPerspective(np.full(left.shape[:2], 255, np.uint8), T, size, flags=cv.INTER_NEAREST)
mask_r = cv.warpPerspective(np.full(right.shape[:2], 255, np.uint8), T @ H, size, flags=cv.INTER_NEAREST)
overlap = cv.bitwise_and(mask_l, mask_r)
print('캔버스', size, '/ 겹침 영역 %.1f%%' % (100 * np.count_nonzero(overlap) / np.count_nonzero(cv.bitwise_or(mask_l, mask_r))))

# 덮어쓰기: right 를 깔고 left 로 덮기
over = warp_r.copy()
over[mask_l > 0] = warp_l[mask_l > 0]

# 이음새 밝기 차: left 의 오른쪽 끝(seam) 바로 왼쪽/오른쪽 열의 밝기 차이 (겹침 행에서만)
sx = int(T[0, 2]) + left.shape[1] - 1
rows = (overlap[:, sx - 3] > 0) & (mask_r[:, sx + 3] > 0)
g = cv.cvtColor(over, cv.COLOR_BGR2GRAY).astype(np.float32)
print('덮어쓰기 이음새 밝기 차: %.1f (0~255)' % np.abs(g[rows, sx - 3] - g[rows, sx + 3]).mean())

masks = np.hstack([mask_l, mask_r, overlap])
cv.imshow('masks: left | right | overlap', masks)
cv.imshow('overwrite', over)
`, desc: '<p>덮어쓰기 결과에서 <b>left 가 끝나는 세로선</b>을 따라 밝기가 확 바뀝니다(HARD 입력은 right 가 25% 어두움). 이음새 밝기 차 숫자를 기억해 두고 다음 예제와 비교하세요.</p>' },
      { type: 'text', html: `<h3>STEP 7. 거리 기반 페더(feather) 블렌딩</h3>
<p>겹침 영역에서 두 사진을 <b>섞되, 각 사진의 가장자리에 가까울수록 그 사진의 비중을 줄이는</b> 방법입니다.</p>
<ul>
<li><code>cv.distanceTransform(mask, cv.DIST_L2, 3)</code>: 마스크의 각 흰 픽셀이 <b>가장 가까운 검은 픽셀(사진 경계)까지의 거리</b>. 사진 가운데는 크고 가장자리는 0에 가까움</li>
<li>가중치 <b>w_l = dist(mask_l)</b>, <b>w_r = dist(mask_r)</b></li>
<li>결과 = (left × w_l + right × w_r) / (w_l + w_r) — 겹치지 않는 곳은 자기 사진 그대로, 겹치는 곳은 부드럽게 전환</li>
</ul>
<p>계산은 <code>float32</code> 로 하고 마지막에 <code>uint8</code> 로 바꿉니다. 분모가 0 인 곳(빈 캔버스)은 1 로 바꿔 0 나누기를 피합니다.</p>` },
      { type: 'code', title: '예제 3 · STEP 7: 거리 가중치 블렌딩 vs 덮어쓰기 비교', code: String.raw`
import cv2 as cv
import numpy as np

HARD = True

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

def make_hard(img, angle=6, zoom=1.25, gain=0.75):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, zoom)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

def find_homography(src_img, dst_img, ratio=0.75):
    sift = cv.SIFT_create()
    k1, d1 = sift.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = sift.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    return cv.findHomography(src, dst, cv.RANSAC, 4.0)[0]

def canvas_transform(left, right, H):
    h1, w1 = left.shape[:2]
    h2, w2 = right.shape[:2]
    c = np.vstack([np.float32([[0, 0], [w1, 0], [w1, h1], [0, h1]]).reshape(-1, 1, 2),
                   cv.perspectiveTransform(np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2), H)]).reshape(-1, 2)
    xmin, ymin = np.floor(c.min(axis=0)).astype(int)
    xmax, ymax = np.ceil(c.max(axis=0)).astype(int)
    return np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64), (int(xmax - xmin), int(ymax - ymin))

def seam_diff(img, mask_a, mask_b, sx):
    rows = (mask_a[:, sx - 3] > 0) & (mask_b[:, sx + 3] > 0)
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY).astype(np.float32)
    return np.abs(g[rows, sx - 3] - g[rows, sx + 3]).mean()

left = load_resized('s1.jpg')
right = load_resized('s2.jpg')
if HARD:
    right = make_hard(right)
H = find_homography(right, left)
T, size = canvas_transform(left, right, H)
warp_l = cv.warpPerspective(left, T, size)
warp_r = cv.warpPerspective(right, T @ H, size)
mask_l = cv.warpPerspective(np.full(left.shape[:2], 255, np.uint8), T, size, flags=cv.INTER_NEAREST)
mask_r = cv.warpPerspective(np.full(right.shape[:2], 255, np.uint8), T @ H, size, flags=cv.INTER_NEAREST)

over = warp_r.copy()
over[mask_l > 0] = warp_l[mask_l > 0]

# 거리 가중치: 사진 가장자리에서 0, 안쪽으로 갈수록 커짐
w_l = cv.distanceTransform(mask_l, cv.DIST_L2, 3)
w_r = cv.distanceTransform(mask_r, cv.DIST_L2, 3)
total = w_l + w_r
total[total == 0] = 1
blend = (warp_l.astype(np.float32) * w_l[:, :, None] + warp_r.astype(np.float32) * w_r[:, :, None]) / total[:, :, None]
blend = np.clip(blend, 0, 255).astype(np.uint8)

sx = int(T[0, 2]) + left.shape[1] - 1
print('이음새 밝기 차  덮어쓰기: %.1f  →  블렌딩: %.1f' % (seam_diff(over, mask_l, mask_r, sx), seam_diff(blend, mask_l, mask_r, sx)))
print('참고: 이음새가 없는 곳(60px 왼쪽)의 같은 값 %.1f ← 사진 자체 무늬 때문에 0 이 되지는 않음' % seam_diff(warp_l, mask_l, mask_l, sx - 60))

# 가중치 보기: left 비중 = w_l / (w_l + w_r)
ratio_view = (w_l / total * 255).astype(np.uint8)
cv.imshow('left weight (white = left)', ratio_view)
# 이음새 주변 확대 비교
y0 = size[1] // 4
crop = lambda im: cv.resize(im[y0:y0 + 120, sx - 90:sx + 90], None, fx=2, fy=2, interpolation=cv.INTER_NEAREST)
cv.imshow('seam zoom: overwrite | blend', np.hstack([crop(over), crop(blend)]))
cv.imshow('blend', blend)
`, desc: '<p>“left weight” 창에서 겹침 영역만 회색 그러데이션이고 나머지는 완전한 흰색(left만) / 검은색(right만)입니다. 확대 창의 왼쪽(덮어쓰기)은 세로 경계가 보이고, 오른쪽(블렌딩)은 부드럽게 이어집니다.</p>' },
      { type: 'text', html: `<h3>STEP 8. 검은 테두리 잘라 내기</h3>
<p>워핑된 사진이 기울어져 있으면 캔버스 모서리에 <b>검은 빈 영역</b>이 남습니다. 간단한 방법: 두 마스크를 합친 유효 영역에서 시작해, <b>빈 픽셀이 가장 많은 가장자리(위 · 아래 · 왼쪽 · 오른쪽)를 한 줄씩 깎아</b> 빈 픽셀이 하나도 없을 때까지 반복합니다. 최적의 사각형은 아니지만 빠르고 이해하기 쉽습니다.</p>` },
      { type: 'code', title: '예제 4 · STEP 8: 테두리 크롭 + 최종 파노라마 저장', code: String.raw`
import cv2 as cv
import numpy as np
import time

HARD = True

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

def make_hard(img, angle=6, zoom=1.25, gain=0.75):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, zoom)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

def find_homography(src_img, dst_img, ratio=0.75):
    sift = cv.SIFT_create()
    k1, d1 = sift.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = sift.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    return cv.findHomography(src, dst, cv.RANSAC, 4.0)[0]

def stitch_pair(left, right, H):
    """right → left 호모그래피로 두 장을 블렌딩해 (파노라마, 유효 마스크) 를 돌려준다"""
    h1, w1 = left.shape[:2]
    h2, w2 = right.shape[:2]
    c = np.vstack([np.float32([[0, 0], [w1, 0], [w1, h1], [0, h1]]).reshape(-1, 1, 2),
                   cv.perspectiveTransform(np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2), H)]).reshape(-1, 2)
    xmin, ymin = np.floor(c.min(axis=0)).astype(int)
    xmax, ymax = np.ceil(c.max(axis=0)).astype(int)
    T = np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64)
    size = (int(xmax - xmin), int(ymax - ymin))
    acc = np.zeros((size[1], size[0], 3), np.float32)
    wsum = np.zeros((size[1], size[0]), np.float32)
    for img, M in [(left, T), (right, T @ H)]:
        mask = cv.warpPerspective(np.full(img.shape[:2], 255, np.uint8), M, size, flags=cv.INTER_NEAREST)
        w = cv.distanceTransform(mask, cv.DIST_L2, 3)
        acc += cv.warpPerspective(img, M, size).astype(np.float32) * w[:, :, None]
        wsum += w
    valid = (wsum > 0).astype(np.uint8) * 255
    wsum[wsum == 0] = 1
    return np.clip(acc / wsum[:, :, None], 0, 255).astype(np.uint8), valid

def crop_black(pano, valid):
    """빈 픽셀이 가장 많은 가장자리를 한 줄씩 깎는다"""
    ok = valid > 0
    y0, y1, x0, x1 = 0, ok.shape[0] - 1, 0, ok.shape[1] - 1
    while y0 < y1 and x0 < x1:
        bad = [np.count_nonzero(~ok[y0, x0:x1 + 1]), np.count_nonzero(~ok[y1, x0:x1 + 1]),
               np.count_nonzero(~ok[y0:y1 + 1, x0]), np.count_nonzero(~ok[y0:y1 + 1, x1])]
        k = int(np.argmax(bad))
        if bad[k] == 0:
            break
        if k == 0: y0 += 1
        elif k == 1: y1 -= 1
        elif k == 2: x0 += 1
        else: x1 -= 1
    return pano[y0:y1 + 1, x0:x1 + 1], (x0, y0, x1, y1)

t = time.perf_counter()
left = load_resized('s1.jpg')
right = load_resized('s2.jpg')
if HARD:
    right = make_hard(right)
H = find_homography(right, left)
pano, valid = stitch_pair(left, right, H)
final, rect = crop_black(pano, valid)
print('파노라마 %s → 크롭 %s, 잘라 낸 사각형 %s, 총 %.0f ms' % (pano.shape[:2], final.shape[:2], rect, (time.perf_counter() - t) * 1000))

marked = pano.copy()
cv.rectangle(marked, rect[:2], rect[2:], (0, 255, 0), 2)
cv.imshow('before crop (green = keep)', marked)
cv.imshow('panorama', final)
cv.imwrite('panorama.jpg', final)
`, desc: '<p>HARD 입력은 기울어진 right 때문에 위아래가 조금 잘립니다. <code>HARD = False</code> 로 바꾸면 원본 쌍은 테두리가 거의 없어 크롭이 거의 일어나지 않습니다. 저장된 <code>panorama.jpg</code> 는 콘솔 링크로 내려받을 수 있습니다.</p>' },
      { type: 'text', html: `<h3>STEP 9. OpenCV Stitcher 와 비교</h3>
<p><code>cv.Stitcher_create()</code> 는 특징 매칭 → 카메라 파라미터 추정(번들 조정) → <b>구면/원통 워핑</b> → 노출 보정 → 최적 이음새 찾기 → <b>다중 대역(multi-band) 블렌딩</b>까지 한 번에 합니다. 브라우저에서 s1, s2 원본 두 장에 약 <b>1.9초</b>가 걸립니다.</p>
<p>상태 코드: <code>0</code> 성공 · <code>1</code> 사진 부족(ERR_NEED_MORE_IMGS) · <code>2</code> 호모그래피 추정 실패 · <code>3</code> 카메라 파라미터 조정 실패. <b>실패하면 결과가 None</b> 이므로 반드시 상태를 확인합니다.</p>` },
      { type: 'code', title: '예제 5 · cv.Stitcher 로 한 번에 만들기 · 시간 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time

s1 = cv.imread('s1.jpg')
s2 = cv.imread('s2.jpg')

t = time.perf_counter()
stitcher = cv.Stitcher_create(cv.Stitcher_PANORAMA)
status, pano = stitcher.stitch([s1, s2])
ms = (time.perf_counter() - t) * 1000

names = {0: 'OK', 1: 'ERR_NEED_MORE_IMGS', 2: 'ERR_HOMOGRAPHY_EST_FAIL', 3: 'ERR_CAMERA_PARAMS_ADJUST_FAIL'}
print('상태: %d (%s), %.0f ms' % (status, names.get(status, '?'), ms))
if status == 0:
    print('입력 폭 합 %d px → Stitcher 결과 %s' % (s1.shape[1] + s2.shape[1], pano.shape))
    view = cv.resize(pano, None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
    cv.imshow('Stitcher result (60%)', view)
else:
    print('실패 → 겹침 · 특징이 충분한지 확인하세요')

# 관계없는 사진을 넣으면?
status2, pano2 = stitcher.stitch([s1, cv.imread('lena.jpg')])
print('s1 + lena 상태: %d (%s), 결과 %s' % (status2, names.get(status2, '?'), None if pano2 is None else pano2.shape))
`, desc: '<p>Stitcher 결과는 구면 워핑 때문에 가장자리가 살짝 휘어 보이고, 노출 보정 덕분에 밝기가 고르게 맞춰집니다. 관계없는 사진을 넣으면 상태 코드 1(사진 부족 = 이어 붙일 짝을 못 찾음)이 나옵니다.</p>' },
      { type: 'table', head: ['비교', '직접 구현 (오늘)', 'cv.Stitcher'], rows: [
        ['코드 양', '약 60줄 · 단계마다 확인 가능', '3줄'],
        ['워핑', '평면 호모그래피 (넓은 화각이면 끝이 크게 늘어남)', '구면 · 원통 워핑 (넓은 화각도 자연스러움)'],
        ['밝기 · 이음새', '거리 가중치 페더 블렌딩', '노출 보정 + 최적 이음새 + 다중 대역 블렌딩'],
        ['속도 (브라우저)', '가로 480 에서 약 1초 (크기 · 특징점 수 조절 가능)', '원본 두 장 약 1.9초'],
        ['실패 진단', '매칭 · 인라이어 · 오차를 단계별로 확인', '상태 코드만 알 수 있음'],
        ['확장', '기준 사진 선택, 특정 영역만 블렌딩, 디버그 뷰 등 자유로움', '파라미터 범위 안에서만'],
      ] },
      { type: 'tip', html: `<p><b>3장 이상으로 확장하기</b>: 가운데 사진을 기준(B)으로 두고 A → B, C → B 호모그래피를 각각 구합니다. 사진이 더 많으면 <b>이웃끼리의 H 를 곱해 연결</b>합니다(예: D → B = (C → B) @ (D → C)). 모든 사진의 모서리를 옮겨 캔버스를 계산하고, 각 사진의 거리 가중치를 더해 한 번에 블렌딩하면 됩니다. 곱할수록 오차가 쌓이므로 <b>가운데 사진을 기준</b>으로 삼는 것이 중요합니다. (실습 2)</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 블렌딩 폭(band) 제한하기',
        desc: `<p>거리 가중치를 그대로 쓰면 겹침 영역 <b>전체</b>가 섞여서, 정합이 조금만 어긋나도 물체가 두 겹으로 보이는 <b>고스트(ghost)</b>가 생길 수 있습니다. 가중치를 <code>np.minimum(dist, BAND)</code> 로 제한해 이음새 근처 <b>BAND px 폭에서만</b> 섞이게 하세요. BAND = 5, 30, 제한 없음(9999) 세 결과를 세로로 붙여 보여 주고, 각 이음새 밝기 차를 출력합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

def make_hard(img, angle=6, zoom=1.25, gain=0.75):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, zoom)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

def find_homography(src_img, dst_img, ratio=0.75):
    sift = cv.SIFT_create()
    k1, d1 = sift.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = sift.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    return cv.findHomography(src, dst, cv.RANSAC, 4.0)[0]

left = load_resized('s1.jpg')
right = make_hard(load_resized('s2.jpg'))
H = find_homography(right, left)
h1, w1 = left.shape[:2]
h2, w2 = right.shape[:2]
c = np.vstack([np.float32([[0, 0], [w1, 0], [w1, h1], [0, h1]]).reshape(-1, 1, 2),
               cv.perspectiveTransform(np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2), H)]).reshape(-1, 2)
xmin, ymin = np.floor(c.min(axis=0)).astype(int)
xmax, ymax = np.ceil(c.max(axis=0)).astype(int)
T = np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64)
size = (int(xmax - xmin), int(ymax - ymin))
warp_l = cv.warpPerspective(left, T, size).astype(np.float32)
warp_r = cv.warpPerspective(right, T @ H, size).astype(np.float32)
mask_l = cv.warpPerspective(np.full(left.shape[:2], 255, np.uint8), T, size, flags=cv.INTER_NEAREST)
mask_r = cv.warpPerspective(np.full(right.shape[:2], 255, np.uint8), T @ H, size, flags=cv.INTER_NEAREST)
dist_l = cv.distanceTransform(mask_l, cv.DIST_L2, 3)
dist_r = cv.distanceTransform(mask_r, cv.DIST_L2, 3)
sx = int(T[0, 2]) + w1 - 1

def blend_with_band(band):
    # TODO: 가중치를 band 로 제한하세요 (np.minimum(dist, band))
    w_l = dist_l
    w_r = dist_r
    total = w_l + w_r
    total[total == 0] = 1
    out = (warp_l * w_l[:, :, None] + warp_r * w_r[:, :, None]) / total[:, :, None]
    return np.clip(out, 0, 255).astype(np.uint8)

def seam_diff(img):
    rows = (mask_l[:, sx - 3] > 0) & (mask_r[:, sx + 3] > 0)
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY).astype(np.float32)
    return np.abs(g[rows, sx - 3] - g[rows, sx + 3]).mean()

results = []
for band in [9999]:          # TODO: [5, 30, 9999] 로 바꾸세요
    out = blend_with_band(band)
    print('BAND %4d → 이음새 밝기 차 %.1f' % (band, seam_diff(out)))
    cv.putText(out, 'band %d' % band, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    results.append(out)
cv.imshow('band compare', np.vstack(results))
`,
        hint: `<p><code>w_l = np.minimum(dist_l, band)</code>, <code>w_r = np.minimum(dist_r, band)</code>. BAND 가 작으면 전환이 급해져 이음새 밝기 차가 커지고, 크면 부드럽지만 넓은 영역이 섞입니다. 정합이 정확하면 넓게, 어긋나 고스트가 보이면 좁게 합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def load_resized(name, width=480):
    img = cv.imread(name)
    s = width / img.shape[1]
    return cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)

def make_hard(img, angle=6, zoom=1.25, gain=0.75):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, zoom)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

def find_homography(src_img, dst_img, ratio=0.75):
    sift = cv.SIFT_create()
    k1, d1 = sift.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = sift.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    return cv.findHomography(src, dst, cv.RANSAC, 4.0)[0]

left = load_resized('s1.jpg')
right = make_hard(load_resized('s2.jpg'))
H = find_homography(right, left)
h1, w1 = left.shape[:2]
h2, w2 = right.shape[:2]
c = np.vstack([np.float32([[0, 0], [w1, 0], [w1, h1], [0, h1]]).reshape(-1, 1, 2),
               cv.perspectiveTransform(np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2), H)]).reshape(-1, 2)
xmin, ymin = np.floor(c.min(axis=0)).astype(int)
xmax, ymax = np.ceil(c.max(axis=0)).astype(int)
T = np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64)
size = (int(xmax - xmin), int(ymax - ymin))
warp_l = cv.warpPerspective(left, T, size).astype(np.float32)
warp_r = cv.warpPerspective(right, T @ H, size).astype(np.float32)
mask_l = cv.warpPerspective(np.full(left.shape[:2], 255, np.uint8), T, size, flags=cv.INTER_NEAREST)
mask_r = cv.warpPerspective(np.full(right.shape[:2], 255, np.uint8), T @ H, size, flags=cv.INTER_NEAREST)
dist_l = cv.distanceTransform(mask_l, cv.DIST_L2, 3)
dist_r = cv.distanceTransform(mask_r, cv.DIST_L2, 3)
sx = int(T[0, 2]) + w1 - 1

def blend_with_band(band):
    w_l = np.minimum(dist_l, band)
    w_r = np.minimum(dist_r, band)
    total = w_l + w_r
    total[total == 0] = 1
    out = (warp_l * w_l[:, :, None] + warp_r * w_r[:, :, None]) / total[:, :, None]
    return np.clip(out, 0, 255).astype(np.uint8)

def seam_diff(img):
    rows = (mask_l[:, sx - 3] > 0) & (mask_r[:, sx + 3] > 0)
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY).astype(np.float32)
    return np.abs(g[rows, sx - 3] - g[rows, sx + 3]).mean()

results = []
for band in [5, 30, 9999]:
    out = blend_with_band(band)
    print('BAND %4d → 이음새 밝기 차 %.1f' % (band, seam_diff(out)))
    cv.putText(out, 'band %d' % band, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    results.append(out)
cv.imshow('band compare', np.vstack(results))
`,
      },
      {
        title: '실습 2 · 3장 파노라마: 가운데 사진 기준으로 잇기',
        desc: `<p><code>s1.jpg</code> 를 겹치게 세 조각(A 왼쪽 · B 가운데 · C 오른쪽)으로 자르고 B · C 는 조금씩 돌리고 밝기를 바꿔 “세 번 찍은 사진”을 만듭니다. 시작 코드는 A → B 만 이어 붙입니다. <b>C → B</b> 호모그래피를 추가로 구해 세 장 모두를 가운데(B) 기준 캔버스에 블렌딩하세요. 모서리 계산과 가중치 합은 리스트로 일반화되어 있으니 목록에 C 만 추가하면 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def tilt(img, angle, gain):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, 1.15)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

base = cv.resize(cv.imread('s1.jpg'), (600, 337), interpolation=cv.INTER_AREA)
A = base[:, 0:260].copy()
B = tilt(base[:, 170:430], 3, 0.85)
C = tilt(base[:, 340:600], -4, 1.15)

SIFT = cv.SIFT_create()
def find_homography(src_img, dst_img, ratio=0.75):
    k1, d1 = SIFT.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = SIFT.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 4.0)
    print('  매칭 %d, 인라이어 %d' % (len(good), int(mask.sum())))
    return H

def blend_all(images, Hs):
    """images[i] 를 Hs[i] 로 기준 좌표에 옮겨 거리 가중치로 블렌딩"""
    corners = []
    for img, H in zip(images, Hs):
        h, w = img.shape[:2]
        corners.append(cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H))
    c = np.vstack(corners).reshape(-1, 2)
    xmin, ymin = np.floor(c.min(axis=0)).astype(int)
    xmax, ymax = np.ceil(c.max(axis=0)).astype(int)
    T = np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64)
    size = (int(xmax - xmin), int(ymax - ymin))
    acc = np.zeros((size[1], size[0], 3), np.float32)
    wsum = np.zeros((size[1], size[0]), np.float32)
    for img, H in zip(images, Hs):
        mask = cv.warpPerspective(np.full(img.shape[:2], 255, np.uint8), T @ H, size, flags=cv.INTER_NEAREST)
        w = cv.distanceTransform(mask, cv.DIST_L2, 3)
        acc += cv.warpPerspective(img, T @ H, size).astype(np.float32) * w[:, :, None]
        wsum += w
    wsum[wsum == 0] = 1
    return np.clip(acc / wsum[:, :, None], 0, 255).astype(np.uint8)

print('A → B')
H_AB = find_homography(A, B)
# TODO 1: C → B 호모그래피 H_CB 를 구하세요
# TODO 2: images 와 Hs 목록에 C 와 H_CB 를 추가하세요 (B 는 기준이므로 단위 행렬)
images = [A, B]
Hs = [H_AB, np.eye(3)]
pano = blend_all(images, Hs)
print('파노라마 크기:', pano.shape)
cv.imshow('inputs A | B | C', np.hstack([A, B, C]))
cv.imshow('panorama', pano)
`,
        hint: `<p><code>H_CB = find_homography(C, B)</code>, <code>images = [A, B, C]</code>, <code>Hs = [H_AB, np.eye(3), H_CB]</code>. 왼쪽 사진(A)을 기준으로 삼으면 C 는 (B → A) @ (C → B) 처럼 곱해야 하고 오차가 쌓입니다. 가운데 기준이 유리한 이유입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def tilt(img, angle, gain):
    h, w = img.shape[:2]
    R = cv.getRotationMatrix2D((w / 2, h / 2), angle, 1.15)
    return cv.convertScaleAbs(cv.warpAffine(img, R, (w, h)), alpha=gain)

base = cv.resize(cv.imread('s1.jpg'), (600, 337), interpolation=cv.INTER_AREA)
A = base[:, 0:260].copy()
B = tilt(base[:, 170:430], 3, 0.85)
C = tilt(base[:, 340:600], -4, 1.15)

SIFT = cv.SIFT_create()
def find_homography(src_img, dst_img, ratio=0.75):
    k1, d1 = SIFT.detectAndCompute(cv.cvtColor(src_img, cv.COLOR_BGR2GRAY), None)
    k2, d2 = SIFT.detectAndCompute(cv.cvtColor(dst_img, cv.COLOR_BGR2GRAY), None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 4.0)
    print('  매칭 %d, 인라이어 %d' % (len(good), int(mask.sum())))
    return H

def blend_all(images, Hs):
    corners = []
    for img, H in zip(images, Hs):
        h, w = img.shape[:2]
        corners.append(cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H))
    c = np.vstack(corners).reshape(-1, 2)
    xmin, ymin = np.floor(c.min(axis=0)).astype(int)
    xmax, ymax = np.ceil(c.max(axis=0)).astype(int)
    T = np.array([[1, 0, -xmin], [0, 1, -ymin], [0, 0, 1]], dtype=np.float64)
    size = (int(xmax - xmin), int(ymax - ymin))
    acc = np.zeros((size[1], size[0], 3), np.float32)
    wsum = np.zeros((size[1], size[0]), np.float32)
    for img, H in zip(images, Hs):
        mask = cv.warpPerspective(np.full(img.shape[:2], 255, np.uint8), T @ H, size, flags=cv.INTER_NEAREST)
        w = cv.distanceTransform(mask, cv.DIST_L2, 3)
        acc += cv.warpPerspective(img, T @ H, size).astype(np.float32) * w[:, :, None]
        wsum += w
    wsum[wsum == 0] = 1
    return np.clip(acc / wsum[:, :, None], 0, 255).astype(np.uint8)

print('A → B')
H_AB = find_homography(A, B)
print('C → B')
H_CB = find_homography(C, B)
images = [A, B, C]
Hs = [H_AB, np.eye(3), H_CB]          # 가운데 B 가 기준
pano = blend_all(images, Hs)
print('파노라마 크기:', pano.shape)
cv.imshow('inputs A | B | C', np.hstack([A, B, C]))
cv.imshow('panorama', pano)
`,
      },
    ],
    quiz: [
      { q: 'right 를 left 좌표로 옮기는 H 가 있을 때, 캔버스 크기를 정하려면 무엇을 계산해야 하나?', options: ['right 의 모든 픽셀 평균 밝기', 'H 의 행렬식', '특징점 개수', 'right 의 네 모서리를 H 로 옮긴 좌표와 left 네 모서리의 최소 · 최대'], answer: 3, explain: '워핑 후 모서리 위치를 perspectiveTransform 으로 구해 left 모서리와 합친 뒤 min/max 로 범위를 잡습니다. 음수 좌표는 이동 행렬 T 로 옮깁니다.' },
      { q: '이동 행렬 T 를 적용할 때 right 에 쓰는 변환으로 알맞은 것은?', options: ['T @ H', 'H @ T', 'T + H', 'np.linalg.inv(T) @ H'], answer: 0, explain: '점에 먼저 H(right → left 좌표)를 적용하고 그다음 T(캔버스 이동)를 적용해야 하므로 행렬 곱은 T @ H 입니다.' },
      { q: 'distanceTransform 가중치 블렌딩이 덮어쓰기보다 이음새가 덜 보이는 이유는?', options: ['사진을 더 선명하게 만들어서', '각 사진의 가장자리로 갈수록 그 사진의 비중을 줄여 겹침 영역에서 서서히 전환되므로', '겹침 영역을 모두 검은색으로 채워서', '특징점을 더 많이 찾아서'], answer: 1, explain: '가장자리에서 가중치가 0에 가까워지므로 한 사진에서 다른 사진으로 밝기가 부드럽게 넘어갑니다.' },
      { q: 'cv.Stitcher 와 직접 구현을 비교한 설명으로 옳지 않은 것은?', options: ['Stitcher 는 노출 보정과 다중 대역 블렌딩을 한다', 'Stitcher 는 실패해도 항상 파노라마 이미지를 돌려준다', '직접 구현은 매칭 · 인라이어 등 단계별 진단이 쉽다', 'Stitcher 는 구면 · 원통 워핑으로 넓은 화각을 자연스럽게 처리한다'], answer: 1, explain: 'Stitcher 는 실패하면 0이 아닌 상태 코드와 None 을 돌려줍니다. 결과를 쓰기 전에 status 를 반드시 확인해야 합니다.' },
    ],
  },

  // =====================================================================
  // a4-4 가이드 프로젝트 ② 평면 물체 인식 · AR 오버레이
  // =====================================================================
  {
    id: 'a4-4',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg', 'images/adv/graf3.jpg'],
    summary: '기준 사진(box.png) 한 장으로 장면 속 평면 물체를 찾고, 그 평면 위에 다른 이미지를 원근에 맞게 합성하는 AR(증강현실) 오버레이를 만듭니다. 호모그래피 검출에 헛검출을 막는 검증 규칙을 더하고, 마스크 합성으로 로고 · 정보 카드를 붙인 뒤, ORB 기반 process(frame) 실시간 버전에 “잠깐 놓쳐도 유지” · “흔들림 줄이기” 안정화까지 넣습니다.',
    goals: [
      '기준 이미지의 특징을 한 번만 계산해 두고 장면에서 평면 물체의 네 꼭짓점을 찾을 수 있다',
      '인라이어 수 · 비율 · 볼록성 · 면적 규칙으로 검출 결과를 검증해 헛검출을 거를 수 있다',
      '오버레이를 기준 이미지 크기에 맞춰 만들고 같은 H 로 워핑한 뒤 마스크 · 알파로 합성할 수 있다',
      'ORB · 축소 · 이전 결과 유지 · 이동 평균으로 실시간 AR 을 안정적으로 만들 수 있다',
    ],
    schedule: [['도입 · 완성 모습', 5], ['STEP 1 평면 물체 찾기', 10], ['STEP 2 검출 검증', 10], ['STEP 3 오버레이 합성', 10], ['STEP 4 실시간 · 안정화', 5], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개: 평면 물체 위에 그림 붙이기</h3>
<p>책 표지를 카메라로 비추면 표지 위에 3D 캐릭터나 리뷰 점수가 떠오르는 앱을 본 적이 있나요? 가장 기본 형태의 AR 은 다음 순서로 만듭니다.</p>
<ol>
<li><b>기준 이미지</b>(책 표지 · 상자 정면 사진)의 특징점을 미리 계산해 둔다</li>
<li>장면에서 특징을 매칭하고 <b>호모그래피 H</b> (기준 좌표 → 장면 좌표)를 구한다 — 1주차 a1-8 과 같음</li>
<li>결과를 <b>검증</b>해 물체가 정말 있을 때만 다음으로 간다</li>
<li>기준 이미지와 <b>같은 크기</b>로 만든 오버레이를 <b>같은 H 로 워핑</b>해 장면에 합성한다</li>
</ol>
<p>핵심 아이디어: 오버레이를 기준 이미지 크기로 만들면 <b>H 를 새로 구할 필요가 없습니다</b>. 기준 이미지의 (0,0) 모서리가 가는 곳에 오버레이의 (0,0) 모서리도 갑니다.</p>` },
      { type: 'image', src: 'adv/box_in_scene.png', caption: 'box_in_scene.png — 여러 물체 사이에 기준 상자(box.png)가 기울어져 놓여 있음' },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        'box_in_scene.png 에서 상자 테두리가 정확히 그려지고 인라이어 수가 출력된다',
        '상자가 없는 사진(graf1 · lena)에서는 검증 규칙에 걸려 NOT FOUND 가 된다',
        'OpenCV 로고 카드가 상자 면에 원근에 맞게 붙는다 (카드 모서리 = 상자 모서리)',
        '반투명 정보 카드(영어 글자)를 합성할 수 있다',
        'process(frame) 버전이 한 프레임 수십 ms 안에 돌고, 물체가 없어도 오류 없이 동작한다',
      ] },
      { type: 'text', html: `<h3>STEP 1. 장면에서 평면 물체 찾기</h3>
<p>이미지 크기가 작아서(324×223, 512×384) 정확한 <b>SIFT</b> 로도 충분히 빠릅니다. 기준 이미지의 특징점은 <b>한 번만</b> 계산해 두고, 장면이 바뀔 때마다 장면 쪽만 계산합니다. 기준 → 장면 방향으로 매칭하므로 H 는 <b>기준 좌표 → 장면 좌표</b>입니다.</p>` },
      { type: 'code', title: '예제 1 · STEP 1: SIFT 매칭 + 호모그래피로 상자 테두리 찾기', code: String.raw`
import cv2 as cv
import numpy as np
import time

ref = cv.imread('box.png', cv.IMREAD_GRAYSCALE)          # 기준(쿼리) 이미지
scene = cv.imread('box_in_scene.png')
gray = cv.cvtColor(scene, cv.COLOR_BGR2GRAY)

sift = cv.SIFT_create()
kp_ref, des_ref = sift.detectAndCompute(ref, None)       # 기준 특징: 한 번만
t = time.perf_counter()
kp_sc, des_sc = sift.detectAndCompute(gray, None)
pairs = cv.BFMatcher(cv.NORM_L2).knnMatch(des_ref, des_sc, k=2)
good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
src = np.float32([kp_ref[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst = np.float32([kp_sc[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)     # 기준 → 장면
ms = (time.perf_counter() - t) * 1000
inliers = int(mask.sum())
print('특징점 기준 %d / 장면 %d, 좋은 매칭 %d, 인라이어 %d (%.0f%%), %.0f ms' % (len(kp_ref), len(kp_sc), len(good), inliers, 100 * inliers / len(good), ms))

h, w = ref.shape
corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)
quad = cv.perspectiveTransform(corners, H)
print('상자 꼭짓점(장면):', np.int32(quad).reshape(-1, 2).tolist())

result = scene.copy()
cv.polylines(result, [np.int32(quad)], True, (0, 255, 0), 3)
for i, p in enumerate(np.int32(quad).reshape(-1, 2)):
    cv.circle(result, tuple(int(v) for v in p), 6, (0, 0, 255), -1)
    cv.putText(result, str(i), (int(p[0]) + 6, int(p[1]) - 6), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
vis = cv.drawMatches(ref, kp_ref, gray, kp_sc, good, None, matchColor=(0, 255, 0),
                     matchesMask=mask.ravel().tolist(), flags=2)
cv.imshow('matches (inliers)', vis)
cv.imshow('detected box', result)
`, desc: '<p>빨간 번호 0 은 기준 이미지의 왼쪽 위 모서리가 장면에서 간 곳입니다. 상자가 기울어져 있어도 <b>번호 순서는 기준 이미지 기준</b>이라 방향을 알 수 있습니다.</p>' },
      { type: 'text', html: `<h3>STEP 2. 검출 결과 검증: 헛검출 막기</h3>
<p>AR 에서 가장 보기 싫은 실패는 <b>물체가 없는데 엉뚱한 곳에 그림이 붙는 것</b>입니다. H 를 얻었다고 바로 믿지 말고 아래 규칙을 통과할 때만 “찾았다”고 합니다.</p>
<ul>
<li><b>인라이어 수</b> ≥ 15 : 우연히 맞은 소수의 점이 아님</li>
<li><b>인라이어 비율</b> ≥ 30% : 매칭 대부분이 같은 평면을 가리킴</li>
<li><b>볼록 사각형</b>(<code>cv.isContourConvex</code>) : 꼬이거나(나비 모양) 뒤집힌 사각형이 아님</li>
<li><b>면적</b>: 장면 넓이의 0.5% 이상 · 전체 이하 — 한 점으로 찌그러지거나 화면 밖으로 폭발한 H 거르기</li>
</ul>` },
      { type: 'code', title: '예제 2 · STEP 2: detect_plane() 검증 함수로 여러 장면 테스트', code: String.raw`
import cv2 as cv
import numpy as np

CFG = {'ratio': 0.75, 'min_inliers': 15, 'min_inlier_ratio': 0.3, 'min_area': 0.005}
SIFT = cv.SIFT_create()
REF = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
KP_REF, DES_REF = SIFT.detectAndCompute(REF, None)
RH, RW = REF.shape
REF_CORNERS = np.float32([[0, 0], [RW, 0], [RW, RH], [0, RH]]).reshape(-1, 1, 2)

def detect_plane(gray, cfg=CFG):
    """(H, quad, info) 를 돌려준다. 검증 실패면 H 와 quad 는 None, info['why'] 에 이유"""
    info = {'good': 0, 'inliers': 0, 'why': ''}
    kp, des = SIFT.detectAndCompute(gray, None)
    if des is None or len(kp) < 2:
        info['why'] = 'no features'
        return None, None, info
    good = [p[0] for p in cv.BFMatcher().knnMatch(DES_REF, des, k=2) if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
    info['good'] = len(good)
    if len(good) < 4:
        info['why'] = 'too few matches'
        return None, None, info
    src = np.float32([KP_REF[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    if H is None:
        info['why'] = 'no homography'
        return None, None, info
    info['inliers'] = int(mask.sum())
    quad = cv.perspectiveTransform(REF_CORNERS, H)
    area = cv.contourArea(quad) / (gray.shape[0] * gray.shape[1])
    if info['inliers'] < cfg['min_inliers']:
        info['why'] = 'inliers < %d' % cfg['min_inliers']
    elif info['inliers'] / len(good) < cfg['min_inlier_ratio']:
        info['why'] = 'inlier ratio low'
    elif not cv.isContourConvex(np.int32(quad)):
        info['why'] = 'not convex'
    elif not (cfg['min_area'] <= area <= 1.0):
        info['why'] = 'bad area %.3f' % area
    if info['why']:
        return None, None, info
    return H, quad, info

# 테스트 장면은 320x240 으로 줄여 속도 확보 (SIFT 6번)
scene = cv.resize(cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE), (320, 240), interpolation=cv.INTER_AREA)
h, w = scene.shape
tests = {
    'box_in_scene': scene,
    'rotated 90 + small': cv.warpAffine(scene, cv.getRotationMatrix2D((w / 2, h / 2), 90, 0.7), (w, h)),
    'darker': cv.convertScaleAbs(scene, alpha=0.4),
    'blurred': cv.GaussianBlur(scene, (0, 0), 3),
    'graf1 (no box)': cv.resize(cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE), (w, h)),
    'lena (no box)': cv.resize(cv.imread('lena.jpg', cv.IMREAD_GRAYSCALE), (w, h)),
}
tiles = []
for name, g in tests.items():
    H, quad, info = detect_plane(g)
    status = 'FOUND' if H is not None else 'NOT FOUND'
    print('%-20s %-9s good=%3d inliers=%3d %s' % (name, status, info['good'], info['inliers'], info['why']))
    vis = cv.cvtColor(g, cv.COLOR_GRAY2BGR)
    if quad is not None:
        cv.polylines(vis, [np.int32(quad)], True, (0, 255, 0), 3)
    cv.putText(vis, '%s: %s' % (name, status), (6, 20), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0) if quad is not None else (0, 0, 255), 2)
    tiles.append(vis)
cv.imshow('detect_plane tests', np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])]))
`, desc: '<p>회전 · 축소 · 어두워짐에는 SIFT 가 강하지만, <b>심한 블러</b>에서는 특징점이 사라져 놓칩니다. 상자가 없는 사진은 “too few matches” 나 “inliers &lt; 15” 로 걸러집니다. 테스트 목록에 조건을 추가하는 것이 곧 <b>테스트 세트</b>입니다.</p>' },
      { type: 'text', html: `<h3>STEP 3. 오버레이 합성</h3>
<ol>
<li>오버레이를 <b>기준 이미지와 같은 크기</b>(324×223)로 만든다 — 로고를 흰 카드 가운데에 배치</li>
<li><code>warpPerspective(overlay, H, 장면크기)</code> 로 장면 위 위치로 옮긴다</li>
<li>같은 H 로 <b>흰색 마스크</b>도 워핑한다 → 오버레이가 덮을 영역</li>
<li>마스크를 0~1 알파로 바꿔 <code>결과 = 장면 × (1 − α) + 오버레이 × α</code></li>
</ol>
<p>투명 PNG(<code>opencv-logo.png</code>, 4채널)는 알파 채널을 이용해 카드 위에 먼저 합성합니다. 마스크 가장자리를 살짝 블러하면 경계의 계단 현상이 줄어듭니다.</p>` },
      { type: 'code', title: '예제 3 · STEP 3: 로고 카드를 상자 면에 워핑 · 마스크 합성', code: String.raw`
import cv2 as cv
import numpy as np

# ---- 검출 (예제 1 과 같음) ----
ref = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png')
sift = cv.SIFT_create()
kp_r, des_r = sift.detectAndCompute(ref, None)
kp_s, des_s = sift.detectAndCompute(cv.cvtColor(scene, cv.COLOR_BGR2GRAY), None)
good = [p[0] for p in cv.BFMatcher().knnMatch(des_r, des_s, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
H, mask = cv.findHomography(np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2),
                            np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2), cv.RANSAC, 5.0)
print('인라이어', int(mask.sum()))

# ---- 1) 기준 이미지와 같은 크기의 오버레이 만들기: 흰 카드 + 투명 로고 ----
RH, RW = ref.shape
card = np.full((RH, RW, 3), 255, np.uint8)
logo = cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED)          # BGRA (4채널)
s = min((RW - 40) / logo.shape[1], (RH - 30) / logo.shape[0])
logo = cv.resize(logo, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
lh, lw = logo.shape[:2]
y, x = (RH - lh) // 2, (RW - lw) // 2
a = logo[:, :, 3:4].astype(np.float32) / 255.0                    # 로고 자체의 알파
roi = card[y:y + lh, x:x + lw].astype(np.float32)
card[y:y + lh, x:x + lw] = (logo[:, :, :3] * a + roi * (1 - a)).astype(np.uint8)
cv.rectangle(card, (3, 3), (RW - 4, RH - 4), (0, 140, 255), 6)      # 주황 테두리

# ---- 2) 같은 H 로 오버레이와 마스크 워핑 ----
size = (scene.shape[1], scene.shape[0])
warped = cv.warpPerspective(card, H, size)
m = cv.warpPerspective(np.full((RH, RW), 255, np.uint8), H, size)
m = cv.GaussianBlur(m, (3, 3), 0)                                  # 경계 부드럽게

# ---- 3) 알파 합성 ----
alpha = m.astype(np.float32)[:, :, None] / 255.0
result = (scene.astype(np.float32) * (1 - alpha) + warped.astype(np.float32) * alpha).astype(np.uint8)

debug = np.hstack([cv.resize(card, (320, 220)), cv.resize(warped, (320, 240))[10:230], cv.resize(cv.cvtColor(m, cv.COLOR_GRAY2BGR), (320, 240))[10:230]])
cv.imshow('debug: card | warped | mask', debug)
cv.imshow('AR overlay', result)
`, desc: '<p>카드의 주황 테두리가 상자 테두리와 <b>정확히 겹치면</b> 성공입니다. 테두리가 어긋나 보이면 H 가 부정확한 것이니 STEP 2 의 인라이어 수를 확인하세요.</p>' },
      { type: 'code', title: '예제 4 · 반투명 AR 정보 카드 만들기', code: String.raw`
import cv2 as cv
import numpy as np

ref = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png')
sift = cv.SIFT_create()
kp_r, des_r = sift.detectAndCompute(ref, None)
kp_s, des_s = sift.detectAndCompute(cv.cvtColor(scene, cv.COLOR_BGR2GRAY), None)
good = [p[0] for p in cv.BFMatcher().knnMatch(des_r, des_s, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
H, _ = cv.findHomography(np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2),
                         np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2), cv.RANSAC, 5.0)
RH, RW = ref.shape

def make_info_card(w, h, title, price, rating, stock):
    """상품 정보 카드 (이미지 위 글자는 영어로)"""
    card = np.full((h, w, 3), (60, 40, 20), np.uint8)                 # 남색 배경
    cv.rectangle(card, (0, 0), (w - 1, 44), (0, 140, 255), -1)
    cv.putText(card, title, (12, 32), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
    cv.putText(card, 'PRICE  $%.2f' % price, (14, 85), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    for i in range(5):                                                 # 별점 (원 5개)
        color = (0, 215, 255) if i < rating else (120, 120, 120)
        cv.circle(card, (30 + i * 34, 120), 12, color, -1)
    cv.putText(card, 'STOCK', (14, 175), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    cv.rectangle(card, (90, 160), (w - 20, 180), (200, 200, 200), 1)
    cv.rectangle(card, (90, 160), (90 + int((w - 110) * stock), 180), (0, 200, 0), -1)
    return card

card = make_info_card(RW, RH, 'BASTONCINI', 3.49, 4, 0.35)
size = (scene.shape[1], scene.shape[0])
warped = cv.warpPerspective(card, H, size)
mask = cv.warpPerspective(np.full((RH, RW), 255, np.uint8), H, size)

views = []
for opacity in [0.4, 0.7, 1.0]:
    alpha = (mask.astype(np.float32) / 255.0 * opacity)[:, :, None]
    out = (scene * (1 - alpha) + warped * alpha).astype(np.uint8)
    cv.putText(out, 'opacity %.1f' % opacity, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    views.append(cv.resize(out, (384, 288)))
cv.imshow('info card', card)
cv.imshow('AR opacity compare', np.hstack(views))
`, desc: '<p>불투명도(opacity)를 낮추면 뒤의 실제 상자가 비쳐 “떠 있는” 느낌이 납니다. 카드 내용을 바꾸는 것은 <code>make_info_card</code> 의 인자만 바꾸면 되므로, 여러 상품을 인식하는 프로젝트로 쉽게 확장됩니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. 실시간 버전과 안정화</h3>
<p>웹캠에서 매 프레임 SIFT 를 돌리면 브라우저에서 너무 느립니다. 실시간 버전은 다음처럼 바꿉니다.</p>
<ul>
<li><b>ORB</b>(nfeatures 500~1000) + <code>NORM_HAMMING</code>, 프레임은 <b>가로 480 이하</b>로 줄여서 처리 → 좌표만 원래 크기로</li>
<li><b>놓쳐도 잠깐 유지(hold)</b>: 한두 프레임 검출이 실패해도 직전 위치를 N 프레임 동안 유지해 깜빡임 방지</li>
<li><b>이동 평균(EMA)</b>: <code>새 꼭짓점 = 0.6 × 이전 + 0.4 × 이번</code> 으로 떨림 줄이기. 단, 크게 움직였으면(점프) 평균하지 않고 바로 교체</li>
</ul>` },
      { type: 'code', title: '예제 5 · STEP 4: 실시간 AR — process(frame) + hold + EMA', code: String.raw`
import cv2 as cv
import numpy as np
import time

WIN = 'controls'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('min inliers', WIN, 15, 60, nothing)
cv.createTrackbar('hold frames', WIN, 5, 20, nothing)
cv.createTrackbar('smooth %', WIN, 60, 90, nothing)

ORB = cv.ORB_create(nfeatures=800)
BF = cv.BFMatcher(cv.NORM_HAMMING)
REF = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
KP_REF, DES_REF = ORB.detectAndCompute(REF, None)
RH, RW = REF.shape
REF_CORNERS = np.float32([[0, 0], [RW, 0], [RW, RH], [0, RH]]).reshape(-1, 1, 2)

# 오버레이: 기준 이미지 크기의 카드
CARD = np.full((RH, RW, 3), (40, 40, 40), np.uint8)
cv.rectangle(CARD, (0, 0), (RW - 1, RH - 1), (0, 200, 255), 10)
cv.putText(CARD, 'AR DEMO', (40, 125), cv.FONT_HERSHEY_SIMPLEX, 1.6, (0, 200, 255), 4)

STATE = {'quad': None, 'miss': 0}          # 프레임 사이에 기억할 값

def detect(gray, min_inliers):
    kp, des = ORB.detectAndCompute(gray, None)
    if des is None or len(kp) < 10:
        return None, 0
    good = [p[0] for p in BF.knnMatch(DES_REF, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < 8:
        return None, 0
    src = np.float32([KP_REF[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    if H is None or int(mask.sum()) < min_inliers:
        return None, 0 if H is None else int(mask.sum())
    quad = cv.perspectiveTransform(REF_CORNERS, H)
    if not cv.isContourConvex(np.int32(quad)) or cv.contourArea(quad) < 0.005 * gray.size:
        return None, int(mask.sum())
    return quad.reshape(4, 2), int(mask.sum())

def process(frame):
    t0 = time.perf_counter()
    scale = min(1.0, 480 / frame.shape[1])
    gray = cv.cvtColor(cv.resize(frame, None, fx=scale, fy=scale), cv.COLOR_BGR2GRAY)
    quad, inl = detect(gray, cv.getTrackbarPos('min inliers', WIN))
    status = 'NOT FOUND'
    if quad is not None:
        quad = quad / scale                                  # 원래 좌표로
        prev = STATE['quad']
        k = cv.getTrackbarPos('smooth %', WIN) / 100.0
        if prev is not None and np.abs(quad - prev).mean() < 30:   # 작은 움직임만 평균
            quad = k * prev + (1 - k) * quad
        STATE['quad'], STATE['miss'] = quad, 0
        status = 'FOUND (%d)' % inl
    else:
        STATE['miss'] += 1
        if STATE['miss'] > cv.getTrackbarPos('hold frames', WIN):
            STATE['quad'] = None
        elif STATE['quad'] is not None:
            status = 'HOLD %d' % STATE['miss']

    out = frame.copy()
    if STATE['quad'] is not None:
        H = cv.getPerspectiveTransform(REF_CORNERS.reshape(4, 2), np.float32(STATE['quad']))
        size = (frame.shape[1], frame.shape[0])
        warped = cv.warpPerspective(CARD, H, size)
        mask = cv.warpPerspective(np.full((RH, RW), 255, np.uint8), H, size)
        out[mask > 0] = cv.addWeighted(out, 0.3, warped, 0.7, 0)[mask > 0]
    ms = (time.perf_counter() - t0) * 1000
    cv.putText(out, '%s  %.0f ms' % (status, ms), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    return out

cv.imshow('test on box_in_scene', process(cv.imread('box_in_scene.png')))
`, desc: '<p>📷 웹캠 입력으로 바꾸고 <b>화면에 box.png 를 띄운 휴대폰이나 인쇄물</b>을 비춰 보세요(웹캠이 없으면 입력을 box_in_scene.png 로). 🎞️ 동영상처럼 상자가 없는 입력에서도 NOT FOUND 로 오류 없이 돌아야 합니다. <code>smooth %</code> 를 0 으로 하면 카드가 떨리는 것을 비교할 수 있습니다.</p>' },
      { type: 'table', head: ['증상', '원인', '대책'], rows: [
        ['카드가 부들부들 떨림', '프레임마다 매칭 점이 조금씩 달라 H 가 흔들림', '꼭짓점 이동 평균(EMA), 인라이어만으로 H 재추정'],
        ['카드가 깜빡임(나왔다 사라짐)', '경계선 근처의 인라이어 수', '최근 N 프레임 유지(hold), 판정 기준에 여유(히스테리시스)'],
        ['엉뚱한 곳에 카드가 붙음', '헛검출', '인라이어 · 비율 · 볼록성 · 면적 검증, 기준 올리기'],
        ['기울이면 못 찾음', 'ORB 는 큰 원근 변화에 약함', '기준 이미지 여러 각도 등록, 또는 찾은 뒤엔 추적(a5-3)'],
        ['느림', '큰 프레임 · 특징점 과다', '가로 480 이하 축소, nfeatures 500~800, 기준 특징 미리 계산'],
        ['무늬 없는 물체는 안 됨', '특징점 자체가 없음', '무늬 많은 표지 · 포장 선택, 또는 ArUco 마커 사용(a4-5)'],
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 벽화 위 액자 그림 바꾸기 (graf1 → graf3)',
        desc: `<p><code>graf1.jpg</code>(정면 벽화)를 기준으로 <code>graf3.jpg</code>(비스듬히 찍은 같은 벽화)에서 평면을 찾았습니다. 벽화 자리에 <code>lena.jpg</code> 를 <b>원근에 맞게</b> 붙이세요. 속도를 위해 두 사진은 절반 크기로 줄여 처리합니다. lena 를 기준 이미지 크기로 맞추는 것이 핵심입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

S = 0.5
ref = cv.resize(cv.imread('graf1.jpg'), None, fx=S, fy=S, interpolation=cv.INTER_AREA)
scene = cv.resize(cv.imread('graf3.jpg'), None, fx=S, fy=S, interpolation=cv.INTER_AREA)
sift = cv.SIFT_create()
kp_r, des_r = sift.detectAndCompute(cv.cvtColor(ref, cv.COLOR_BGR2GRAY), None)
kp_s, des_s = sift.detectAndCompute(cv.cvtColor(scene, cv.COLOR_BGR2GRAY), None)
good = [p[0] for p in cv.BFMatcher().knnMatch(des_r, des_s, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
H, mask = cv.findHomography(np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2),
                            np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2), cv.RANSAC, 5.0)
print('좋은 매칭 %d, 인라이어 %d' % (len(good), int(mask.sum())))

RH, RW = ref.shape[:2]
# TODO 1: lena.jpg 를 읽어 기준 이미지 크기 (RW, RH) 로 resize 하세요
overlay = ref.copy()
size = (scene.shape[1], scene.shape[0])
# TODO 2: overlay 와 흰색 마스크를 H 로 워핑하고, 마스크가 있는 곳만 scene 을 overlay 로 바꾸세요
result = scene.copy()

cv.imshow('reference | scene', np.hstack([ref, scene]))
cv.imshow('AR result', result)
`,
        hint: `<p><code>overlay = cv.resize(cv.imread('lena.jpg'), (RW, RH))</code> → <code>warped = cv.warpPerspective(overlay, H, size)</code>, <code>m = cv.warpPerspective(np.full((RH, RW), 255, np.uint8), H, size)</code>, <code>result[m &gt; 0] = warped[m &gt; 0]</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

S = 0.5
ref = cv.resize(cv.imread('graf1.jpg'), None, fx=S, fy=S, interpolation=cv.INTER_AREA)
scene = cv.resize(cv.imread('graf3.jpg'), None, fx=S, fy=S, interpolation=cv.INTER_AREA)
sift = cv.SIFT_create()
kp_r, des_r = sift.detectAndCompute(cv.cvtColor(ref, cv.COLOR_BGR2GRAY), None)
kp_s, des_s = sift.detectAndCompute(cv.cvtColor(scene, cv.COLOR_BGR2GRAY), None)
good = [p[0] for p in cv.BFMatcher().knnMatch(des_r, des_s, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
H, mask = cv.findHomography(np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2),
                            np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2), cv.RANSAC, 5.0)
print('좋은 매칭 %d, 인라이어 %d' % (len(good), int(mask.sum())))

RH, RW = ref.shape[:2]
overlay = cv.resize(cv.imread('lena.jpg'), (RW, RH))            # 기준 이미지와 같은 크기
cv.rectangle(overlay, (0, 0), (RW - 1, RH - 1), (0, 255, 255), 8)
size = (scene.shape[1], scene.shape[0])
warped = cv.warpPerspective(overlay, H, size)
m = cv.warpPerspective(np.full((RH, RW), 255, np.uint8), H, size)
result = scene.copy()
result[m > 0] = warped[m > 0]

cv.imshow('reference | scene', np.hstack([ref, scene]))
cv.imshow('AR result', result)
`,
      },
      {
        title: '실습 2 · 가림(occlusion) 견딤 테스트',
        desc: `<p>실제 장면에서는 손이나 다른 물건이 물체를 가립니다. box_in_scene 에서 찾은 상자 영역의 <b>왼쪽부터 0%, 25%, 50%, 75%</b> 를 회색 사각형으로 가린 테스트 이미지를 만들고, 각각에서 인라이어 수와 검출 성공 여부(인라이어 ≥ 15)를 표로 출력하세요. 네 결과 이미지를 가로로 이어 붙여 보여 줍니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

sift = cv.SIFT_create()
ref = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
kp_r, des_r = sift.detectAndCompute(ref, None)
RH, RW = ref.shape
CORNERS = np.float32([[0, 0], [RW, 0], [RW, RH], [0, RH]]).reshape(-1, 1, 2)

def detect(gray):
    kp, des = sift.detectAndCompute(gray, None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(des_r, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < 4:
        return None, 0
    H, mask = cv.findHomography(np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2),
                                np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2), cv.RANSAC, 5.0)
    return H, (0 if H is None else int(mask.sum()))

scene = cv.resize(cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE), (384, 288), interpolation=cv.INTER_AREA)
H0, inl0 = detect(scene)                  # 가리지 않은 원본 결과 (0%)
x, y, w, h = cv.boundingRect(np.int32(cv.perspectiveTransform(CORNERS, H0)))   # 상자를 감싸는 사각형
print('상자 영역:', (x, y, w, h))

print('가림%  inliers  found')
tiles = []
for ratio in [0.0]:          # TODO 1: [0.0, 0.25, 0.5, 0.75] 로 바꾸세요
    test = scene.copy()
    # TODO 2: 상자 영역 왼쪽부터 w * ratio 폭만큼 회색(128) 사각형으로 가리세요
    H, inl = (H0, inl0) if ratio == 0 else detect(test)     # 0% 는 이미 계산한 결과 재사용
    found = H is not None and inl >= 15
    print('%4.0f  %7d  %s' % (ratio * 100, inl, found))
    vis = cv.cvtColor(test, cv.COLOR_GRAY2BGR)
    if found:
        cv.polylines(vis, [np.int32(cv.perspectiveTransform(CORNERS, H))], True, (0, 255, 0), 3)
    cv.putText(vis, '%d%% inl=%d' % (ratio * 100, inl), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    tiles.append(cv.resize(vis, (256, 192)))
cv.imshow('occlusion test', np.hstack(tiles))
`,
        hint: `<p><code>cv.rectangle(test, (x, y), (x + int(w * ratio), y + h), 128, -1)</code>. ratio 가 0 이면 폭이 0 이라 아무것도 그리지 않도록 <code>if ratio &gt; 0:</code> 으로 감싸세요. 가려진 비율만큼 인라이어가 줄지만, 보이는 부분의 특징만으로도 H 를 구할 수 있다는 것이 특징 매칭의 장점입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

sift = cv.SIFT_create()
ref = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
kp_r, des_r = sift.detectAndCompute(ref, None)
RH, RW = ref.shape
CORNERS = np.float32([[0, 0], [RW, 0], [RW, RH], [0, RH]]).reshape(-1, 1, 2)

def detect(gray):
    kp, des = sift.detectAndCompute(gray, None)
    good = [p[0] for p in cv.BFMatcher().knnMatch(des_r, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < 4:
        return None, 0
    H, mask = cv.findHomography(np.float32([kp_r[m.queryIdx].pt for m in good]).reshape(-1, 1, 2),
                                np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2), cv.RANSAC, 5.0)
    return H, (0 if H is None else int(mask.sum()))

scene = cv.resize(cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE), (384, 288), interpolation=cv.INTER_AREA)
H0, inl0 = detect(scene)                  # 가리지 않은 원본 결과 (0%)
x, y, w, h = cv.boundingRect(np.int32(cv.perspectiveTransform(CORNERS, H0)))
print('상자 영역:', (x, y, w, h))

print('가림%  inliers  found')
tiles = []
for ratio in [0.0, 0.25, 0.5, 0.75]:
    test = scene.copy()
    if ratio > 0:
        cv.rectangle(test, (x, y), (x + int(w * ratio), y + h), 128, -1)
    H, inl = (H0, inl0) if ratio == 0 else detect(test)     # 0% 는 이미 계산한 결과 재사용
    found = H is not None and inl >= 15
    print('%4.0f  %7d  %s' % (ratio * 100, inl, found))
    vis = cv.cvtColor(test, cv.COLOR_GRAY2BGR)
    if found:
        cv.polylines(vis, [np.int32(cv.perspectiveTransform(CORNERS, H))], True, (0, 255, 0), 3)
    cv.putText(vis, '%d%% inl=%d' % (ratio * 100, inl), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    tiles.append(cv.resize(vis, (256, 192)))
cv.imshow('occlusion test', np.hstack(tiles))
`,
      },
    ],
    quiz: [
      { q: '오버레이 이미지를 기준 이미지(box.png)와 같은 크기로 만드는 이유는?', options: ['파일 크기를 줄이려고', '특징점을 더 많이 찾으려고', '색을 흑백으로 바꾸려고', '기준 → 장면 호모그래피 H 를 그대로 써서 오버레이 모서리가 물체 모서리에 맞게 가도록'], answer: 3, explain: 'H 는 기준 이미지 좌표를 장면 좌표로 옮깁니다. 오버레이가 같은 좌표계(같은 크기)면 H 를 그대로 적용할 수 있습니다. 크기가 다르면 크기 조절 행렬을 곱해야 합니다.' },
      { q: '검출 결과 검증 규칙으로 적절하지 않은 것은?', options: ['장면 이미지의 파일 이름에 box 가 들어 있는가', '인라이어 수가 기준 이상인가', '투영한 사각형이 볼록한가', '사각형 면적이 너무 작거나 크지 않은가'], answer: 0, explain: '인라이어 수 · 비율, 볼록성, 면적은 기하적으로 의미 있는 검증입니다. 파일 이름은 실제 영상 내용과 무관합니다.' },
      { q: '실시간 AR 에서 카드가 프레임마다 떨릴 때 가장 알맞은 대책은?', options: ['SIFT 를 원본 크기로 계산한다', '인라이어 기준을 0 으로 낮춘다', '꼭짓점 좌표를 이전 프레임과 이동 평균(EMA)해 부드럽게 한다', '오버레이를 더 크게 만든다'], answer: 2, explain: '매 프레임 매칭 점이 조금씩 달라 H 가 흔들립니다. 이전 결과와 가중 평균하면 떨림이 줄고, 큰 움직임은 평균하지 않아 반응성을 유지합니다.' },
      { q: '마스크를 0~1 알파로 바꿔 result = scene × (1 − α) + overlay × α 로 합성할 때 α = 0.5 인 곳의 결과는?', options: ['장면과 오버레이가 반씩 섞여 보인다', '장면만 보인다', '오버레이만 보인다', '검은색이 된다'], answer: 0, explain: 'α 는 오버레이의 비중입니다. 0 이면 장면, 1 이면 오버레이, 0.5 면 반반 섞인 반투명 효과가 됩니다.' },
    ],
  },

  // =====================================================================
  // a4-5 가이드 프로젝트 ③ 캘리브레이션 기반 실측
  // =====================================================================
  {
    id: 'a4-5',
    assets: ['images/adv/left01.jpg', 'images/adv/left02.jpg', 'images/adv/left03.jpg', 'images/adv/left04.jpg', 'images/adv/left05.jpg',
      'images/adv/left06.jpg', 'images/adv/left07.jpg', 'images/adv/left08.jpg', 'images/adv/left09.jpg', 'images/adv/left11.jpg',
      'images/adv/left12.jpg', 'images/adv/left13.jpg', 'images/adv/left14.jpg', 'images/apps/aruco_board.png'],
    summary: '사진 한 장으로 평면 위 두 점 사이의 실제 거리(mm)를 재는 “카메라 자”를 만듭니다. 체스보드 사진으로 캘리브레이션하고 왜곡을 보정한 뒤, 크기를 아는 체스보드 칸(25 mm)으로 이미지 → 실제 평면(mm) 호모그래피를 구해 탑뷰(top-down) 이미지를 만들고, 마우스로 두 점을 클릭해 거리를 잽니다. 체스보드 대신 크기를 아는 ArUco 마커로 재는 방법과 정확도도 비교합니다.',
    goals: [
      '적은 수의 체스보드 사진으로 캘리브레이션하고 결과(K, 왜곡 계수, RMS)를 해석 · 저장할 수 있다',
      '왜곡 보정 전후를 “직선이 얼마나 곧은가(px)” 같은 수치로 비교할 수 있다',
      '알고 있는 칸 크기로 이미지 → mm 평면 호모그래피를 구해 탑뷰를 만들고 좌표를 mm 로 바꿀 수 있다',
      '마우스로 두 점을 찍어 거리를 재는 도구를 만들고, 마커 기반 측정과 정확도 · 한계를 비교할 수 있다',
    ],
    schedule: [['도입 · 측정 원리', 5], ['STEP 1~2 캘리브레이션 · 왜곡 보정', 10], ['STEP 3 평면 호모그래피 · 탑뷰', 10], ['STEP 4 마우스 측정 도구', 10], ['STEP 5 ArUco 로 재기', 5], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개: 사진으로 길이 재기</h3>
<p>사진 속 물체의 길이를 재려면 <b>“픽셀 몇 개 = 몇 mm”</b>를 알아야 합니다. 그런데 비스듬히 찍은 사진은 가까운 곳은 크게, 먼 곳은 작게 보이므로 이 비율이 위치마다 다릅니다. 그래서 두 가지를 준비합니다.</p>
<ol>
<li><b>렌즈 왜곡 보정</b>(2주차): 렌즈 때문에 휜 직선을 곧게 → 캘리브레이션으로 구한 K, 왜곡 계수 사용</li>
<li><b>평면 호모그래피</b>(1 · 2주차): 크기를 아는 기준물(체스보드 칸 25 mm, ArUco 마커 40 mm)의 꼭짓점으로 <b>이미지 좌표 → 실제 평면 좌표(mm)</b> 변환을 구함</li>
</ol>
<p>이 변환을 알면 <b>같은 평면 위의 어떤 점</b>이든 mm 좌표로 바꿀 수 있고, 두 점 사이 거리는 피타고라스로 계산합니다.</p>
<p>파이프라인: <b>캘리브레이션(한 번) → 왜곡 보정 → 기준물 꼭짓점 검출 → 이미지→mm 호모그래피 → 탑뷰 · 마우스 측정</b></p>` },
      { type: 'warn', html: `<p><b>가정</b>: 튜토리얼 사진(left01~14)의 체스보드 실제 칸 크기는 알려져 있지 않으므로 <b>한 칸 = 25 mm 로 가정</b>합니다. 직접 인쇄한 체스보드로 프로젝트를 할 때는 <b>자로 칸 크기를 재서</b> <code>SQUARE_MM</code> 에 넣으세요. 이 값이 틀리면 모든 측정값이 같은 비율로 틀립니다.</p>` },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        '5장으로 캘리브레이션한 K 와 RMS 가 출력되고 calib.npz 로 저장된다',
        '왜곡 보정 후 체스보드 격자선의 휨(px)이 줄어든 수치가 출력된다',
        '비스듬한 체스보드가 반듯한 탑뷰(격자 25 mm)로 펴진다',
        '마우스로 두 점을 찍으면 mm 거리가 표시되고, 코너 0 → 6 은 약 150 mm 로 나온다',
        'ArUco 패드에서 마커 1개 기준과 4개 기준의 측정 오차를 비교해 말할 수 있다',
      ] },
      { type: 'text', html: `<h3>STEP 1. 적은 사진으로 빠르게 캘리브레이션</h3>
<p>13장 전부로 코너를 찾으면 브라우저에서 약 2.7초가 걸립니다. 수업에서는 <b>5장</b>만 씁니다. 사진이 적으면 고차 왜곡 계수(k3)가 불안정하게 튀므로 <code>cv.CALIB_FIX_K3</code> 로 k3 = 0 으로 고정합니다.</p>
<ul>
<li><b>RMS 재투영 오차</b>: 0.5 px 이하면 좋은 캘리브레이션</li>
<li><b>fx, fy</b>(초점거리, px) 가 비슷하고 <b>cx, cy</b>(주점) 가 이미지 가운데 근처인지 확인</li>
<li>결과는 <code>np.savez('calib.npz', K=K, dist=dist)</code> 로 저장 → 같은 페이지의 다른 예제에서 <code>np.load</code></li>
</ul>` },
      { type: 'code', title: '예제 1 · STEP 1: 체스보드 5장으로 캘리브레이션 + 저장', code: String.raw`
import cv2 as cv
import numpy as np
import time

PATTERN = (7, 6)                # 내부 코너 수 (가로, 세로)
SQUARE_MM = 25.0                # 한 칸 크기 (가정값 — 직접 인쇄한 보드는 자로 재기)
NAMES = ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left12.jpg', 'left13.jpg']
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

objp = np.zeros((PATTERN[0] * PATTERN[1], 3), np.float32)
objp[:, :2] = np.mgrid[0:PATTERN[0], 0:PATTERN[1]].T.reshape(-1, 2) * SQUARE_MM

t = time.perf_counter()
obj_points, img_points = [], []
for name in NAMES:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    ok, corners = cv.findChessboardCorners(gray, PATTERN, None)
    print('%s: %s' % (name, '찾음' if ok else '못 찾음'))
    if ok:
        corners = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), CRIT)
        obj_points.append(objp)
        img_points.append(corners)
t1 = time.perf_counter()

rms, K, dist, rvecs, tvecs = cv.calibrateCamera(obj_points, img_points, gray.shape[::-1], None, None, flags=cv.CALIB_FIX_K3)
t2 = time.perf_counter()
np.set_printoptions(precision=4, suppress=True)
print('코너 검출 %.0f ms, 캘리브레이션 %.0f ms' % ((t1 - t) * 1000, (t2 - t1) * 1000))
print('RMS 재투영 오차: %.3f px' % rms)
print('K =\n', K)
print('왜곡 계수 (k1, k2, p1, p2, k3) =', dist.ravel())
print('참고: 13장(9장 검출) 기준값 fx=534.2 fy=534.3 cx=341.7 cy=232.1, k1=-0.294 k2=0.123')

np.savez('calib.npz', K=K, dist=dist)
print('calib.npz 저장 완료')

vis = cv.cvtColor(cv.imread(NAMES[0], cv.IMREAD_GRAYSCALE), cv.COLOR_GRAY2BGR)
cv.drawChessboardCorners(vis, PATTERN, img_points[0], True)
cv.imshow('corners (left01)', vis)
`, desc: '<p>5장만으로도 fx · cx 가 13장 결과와 1% 안쪽으로 비슷합니다. <b>RMS 가 작다고 끝이 아니라</b> 여러 기울기의 사진을 섞었는지가 중요합니다(모두 정면 사진이면 초점거리가 부정확해짐).</p>' },
      { type: 'text', html: `<h3>STEP 2. 왜곡 보정 효과를 숫자로 확인</h3>
<p>눈으로 보면 차이가 작아 보여도 측정에서는 큰 차이가 납니다. 체스보드 코너는 실제로 <b>일직선</b> 위에 있으므로, 각 행 · 열의 코너가 양 끝점을 잇는 직선에서 <b>얼마나 벗어났는지(px)</b>를 재면 왜곡 정도를 수치로 알 수 있습니다.</p>
<ul>
<li>이미지 전체 보정: <code>cv.undistort(img, K, dist)</code></li>
<li>점만 보정: <code>cv.undistortPoints(pts, K, dist, P=K)</code> — 코너를 다시 찾을 필요 없이 보정 좌표로 변환 (<code>P=K</code> 를 꼭 넣어야 픽셀 좌표로 나옴)</li>
</ul>
<p>이후 예제는 매번 캘리브레이션하지 않도록 <b>13장으로 구한 값을 코드에 적어</b> 씁니다. (예제 1 을 실행했다면 <code>np.load('calib.npz')</code> 로 바꿔도 됩니다.)</p>` },
      { type: 'code', title: '예제 2 · STEP 2: 왜곡 보정 전후 직선 휨(px) 비교', code: String.raw`
import cv2 as cv
import numpy as np

# 13장으로 구한 캘리브레이션 결과 (예제 1 의 calib.npz 를 써도 됨)
K = np.array([[534.157, 0, 341.715], [0, 534.255, 232.05], [0, 0, 1]])
DIST = np.array([-0.29427, 0.12325, 0.00114, -0.00014, 0.01021])
PATTERN = (7, 6)
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

def max_bend(pts):
    """7x6 코너의 각 행 · 열이 양 끝을 잇는 직선에서 벗어난 최대 거리(px)"""
    P = pts.reshape(PATTERN[1], PATTERN[0], 2)
    lines = [P[j] for j in range(PATTERN[1])] + [P[:, i] for i in range(PATTERN[0])]
    worst = 0
    for L in lines:
        d = (L[-1] - L[0]) / np.linalg.norm(L[-1] - L[0])
        normal = np.array([-d[1], d[0]])
        worst = max(worst, np.abs((L - L[0]) @ normal).max())
    return worst

img = cv.imread('left12.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ok, corners = cv.findChessboardCorners(gray, PATTERN, None)
corners = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), CRIT)
und_corners = cv.undistortPoints(corners, K, DIST, P=K)          # 점만 보정
undist = cv.undistort(img, K, DIST)                              # 이미지 전체 보정

print('격자선 최대 휨: 보정 전 %.2f px → 보정 후 %.2f px' % (max_bend(corners.reshape(-1, 2)), max_bend(und_corners.reshape(-1, 2))))

def draw_rows(im, pts, color):
    P = pts.reshape(PATTERN[1], PATTERN[0], 2)
    for j in [0, PATTERN[1] - 1]:                                 # 첫 행과 마지막 행
        a, b = P[j][0], P[j][-1]
        cv.line(im, (int(a[0]), int(a[1])), (int(b[0]), int(b[1])), color, 1)   # 끝점을 잇는 직선
        for p in P[j]:
            cv.circle(im, (int(p[0]), int(p[1])), 3, (0, 0, 255), -1)
    return im

before = draw_rows(img.copy(), corners, (0, 255, 0))
after = draw_rows(undist.copy(), und_corners, (0, 255, 0))
cv.putText(before, 'distorted', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
cv.putText(after, 'undistorted', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
cv.imshow('before | after', np.hstack([before, after]))
`, desc: '<p>보정 전에는 행의 가운데 코너(빨간 점)가 초록 직선에서 2 px 넘게 벗어나고, 보정 후에는 0.5 px 이하로 줄어듭니다. 이미지 가장자리일수록 왜곡이 크므로 <b>측정할 물체는 화면 가운데</b>에 두는 것이 유리합니다.</p>' },
      { type: 'text', html: `<h3>STEP 3. 이미지 → mm 평면 호모그래피와 탑뷰</h3>
<p>보정된 코너 좌표(px)와 실제 좌표(mm: 코너 i, j → (25·i, 25·j))를 <code>cv.findHomography</code> 에 넣으면 <b>H_img2mm</b> 을 얻습니다.</p>
<ul>
<li>어떤 점 p(px) → <code>cv.perspectiveTransform(p, H_img2mm)</code> → mm 좌표</li>
<li><b>탑뷰</b>: mm 좌표에 <b>배율(PX_PER_MM)과 여백</b>을 적용하는 행렬 S 를 앞에 곱해 <code>warpPerspective(undist, S @ H_img2mm, 크기)</code></li>
<li><b>방향 주의</b>: 체스보드는 대칭이라 코너 0 이 어느 모서리일지 사진마다 다릅니다. 이미지에서 x축(코너 0→1)과 y축(코너 0→7)의 외적이 음수면 탑뷰가 <b>거울상</b>이 되므로 y 좌표를 뒤집어 줍니다(거리 측정값은 같음).</li>
</ul>` },
      { type: 'code', title: '예제 3 · STEP 3: mm 좌표계 탑뷰 만들기 + 격자 검증', code: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[534.157, 0, 341.715], [0, 534.255, 232.05], [0, 0, 1]])
DIST = np.array([-0.29427, 0.12325, 0.00114, -0.00014, 0.01021])
PATTERN = (7, 6)
SQUARE_MM = 25.0
PX_PER_MM = 2.0            # 탑뷰 배율: 1 mm = 2 px
MARGIN_MM = 60             # 보드 주변 여백
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

img = cv.imread('left03.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ok, corners = cv.findChessboardCorners(gray, PATTERN, None)
corners = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), CRIT)
undist = cv.undistort(img, K, DIST)
pts = cv.undistortPoints(corners, K, DIST, P=K).reshape(-1, 2)

# 실제 평면 좌표 (mm)
mm = np.mgrid[0:PATTERN[0], 0:PATTERN[1]].T.reshape(-1, 2).astype(np.float32) * SQUARE_MM
# 방향 확인: 이미지에서 x축(0→1) × y축(0→7) 외적이 음수면 거울상 → y 뒤집기
vx, vy = pts[1] - pts[0], pts[PATTERN[0]] - pts[0]
if vx[0] * vy[1] - vx[1] * vy[0] < 0:
    mm[:, 1] = (PATTERN[1] - 1) * SQUARE_MM - mm[:, 1]
    print('거울상 방지를 위해 y 방향을 뒤집음')

H_img2mm, _ = cv.findHomography(pts, mm)
err = np.linalg.norm(cv.perspectiveTransform(pts.reshape(-1, 1, 2), H_img2mm).reshape(-1, 2) - mm, axis=1)
print('코너 42개의 mm 오차: 평균 %.3f mm, 최대 %.3f mm' % (err.mean(), err.max()))

# 탑뷰: mm → 탑뷰 픽셀 (배율 + 여백)
S = np.array([[PX_PER_MM, 0, MARGIN_MM * PX_PER_MM], [0, PX_PER_MM, MARGIN_MM * PX_PER_MM], [0, 0, 1]])
W = int(((PATTERN[0] - 1) * SQUARE_MM + 2 * MARGIN_MM) * PX_PER_MM)
Hh = int(((PATTERN[1] - 1) * SQUARE_MM + 2 * MARGIN_MM) * PX_PER_MM)
top = cv.warpPerspective(undist, S @ H_img2mm, (W, Hh))

# 25 mm 격자를 그려 칸과 맞는지 확인
for x_mm in np.arange(0, (PATTERN[0] - 1) * SQUARE_MM + 1, SQUARE_MM):
    x = int((x_mm + MARGIN_MM) * PX_PER_MM)
    cv.line(top, (x, 0), (x, Hh), (0, 255, 0), 1)
for y_mm in np.arange(0, (PATTERN[1] - 1) * SQUARE_MM + 1, SQUARE_MM):
    y = int((y_mm + MARGIN_MM) * PX_PER_MM)
    cv.line(top, (0, y), (W, y), (0, 255, 0), 1)
cv.putText(top, '1 cell = %d mm' % SQUARE_MM, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
print('탑뷰 크기 %d x %d (1 mm = %.1f px)' % (W, Hh, PX_PER_MM))

vis = undist.copy()
cv.drawChessboardCorners(vis, PATTERN, pts.reshape(-1, 1, 2).astype(np.float32), True)
cv.imshow('undistorted + corners', vis)
cv.imshow('top view (mm grid)', top)
`, desc: '<p>초록 격자선이 체스보드 칸의 경계와 딱 맞으면 호모그래피가 정확한 것입니다. 탑뷰에서는 <b>어디서나 1 mm = 2 px</b> 이므로 자처럼 사용할 수 있습니다. 보드 밖(책상 · 벽)은 같은 평면이 아니라서 늘어나 보입니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. 마우스로 두 점 찍어 거리 재기</h3>
<ul>
<li>보정된 이미지를 <code>measure</code> 창에 보여 주고 <code>cv.setMouseCallback</code> 등록</li>
<li><b>왼쪽 클릭</b>: 점 추가 (두 점이 모이면 거리 계산) · <b>오른쪽 클릭</b>: 초기화</li>
<li>각 점을 <code>perspectiveTransform(p, H_img2mm)</code> 으로 mm 로 바꿔 <code>np.linalg.norm</code></li>
<li>탑뷰 창에도 같은 선을 그려 “실제 평면에서의 선”을 함께 확인</li>
</ul>
<p>처음 실행하면 확인용으로 <b>코너 0 → 코너 6</b>(6칸 = 150 mm)이 미리 측정되어 있습니다.</p>` },
      { type: 'code', title: '예제 4 · STEP 4: 마우스 측정 도구 (이미지 · 탑뷰 동시 표시)', code: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[534.157, 0, 341.715], [0, 534.255, 232.05], [0, 0, 1]])
DIST = np.array([-0.29427, 0.12325, 0.00114, -0.00014, 0.01021])
PATTERN, SQUARE_MM, PX_PER_MM, MARGIN_MM = (7, 6), 25.0, 2.0, 60
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

# ---- 준비: 보정 → 코너 → 이미지→mm 호모그래피 (예제 3 과 같음) ----
img = cv.imread('left03.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ok, corners = cv.findChessboardCorners(gray, PATTERN, None)
corners = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), CRIT)
UNDIST = cv.undistort(img, K, DIST)
pts = cv.undistortPoints(corners, K, DIST, P=K).reshape(-1, 2)
mm = np.mgrid[0:PATTERN[0], 0:PATTERN[1]].T.reshape(-1, 2).astype(np.float32) * SQUARE_MM
vx, vy = pts[1] - pts[0], pts[PATTERN[0]] - pts[0]
if vx[0] * vy[1] - vx[1] * vy[0] < 0:
    mm[:, 1] = (PATTERN[1] - 1) * SQUARE_MM - mm[:, 1]
H_IMG2MM, _ = cv.findHomography(pts, mm)
S = np.array([[PX_PER_MM, 0, MARGIN_MM * PX_PER_MM], [0, PX_PER_MM, MARGIN_MM * PX_PER_MM], [0, 0, 1]])
TOP_SIZE = (int((150 + 2 * MARGIN_MM) * PX_PER_MM), int((125 + 2 * MARGIN_MM) * PX_PER_MM))
TOP = cv.warpPerspective(UNDIST, S @ H_IMG2MM, TOP_SIZE)

def to_mm(p):
    return cv.perspectiveTransform(np.float32([[p]]), H_IMG2MM)[0, 0]

def to_top(p):
    q = cv.perspectiveTransform(np.float32([[p]]), S @ H_IMG2MM)[0, 0]
    return (int(q[0]), int(q[1]))

# ---- 화면 (창 배열을 제자리에서 바꿔 갱신) ----
view = UNDIST.copy()
top_view = TOP.copy()
points = [tuple(pts[0]), tuple(pts[6])]          # 확인용: 코너 0 → 6 (150 mm)

def render():
    view[:] = UNDIST
    top_view[:] = TOP
    for p in points:
        cv.circle(view, (int(p[0]), int(p[1])), 5, (0, 0, 255), -1)
        cv.circle(top_view, to_top(p), 5, (0, 0, 255), -1)
    if len(points) == 2:
        a, b = points
        d = float(np.linalg.norm(to_mm(a) - to_mm(b)))
        px = float(np.hypot(a[0] - b[0], a[1] - b[1]))
        cv.line(view, (int(a[0]), int(a[1])), (int(b[0]), int(b[1])), (0, 255, 255), 2)
        cv.line(top_view, to_top(a), to_top(b), (0, 255, 255), 2)
        cv.putText(view, '%.1f mm (%.0f px)' % (d, px), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
        print('거리: %.1f mm  (이미지에서는 %.0f px)' % (d, px))
    cv.putText(view, 'L-click: point  R-click: reset', (10, view.shape[0] - 12), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

def on_mouse(event, x, y, flags, param):
    global points
    if event == cv.EVENT_LBUTTONDOWN:
        if len(points) == 2:
            points = []
        points.append((x, y))
        render()
    elif event == cv.EVENT_RBUTTONDOWN:
        points = []
        render()

render()
cv.imshow('measure', view)
cv.imshow('top view', top_view)
cv.setMouseCallback('measure', on_mouse)
`, desc: '<p>체스보드 위쪽 행의 양 끝과 아래쪽 행의 양 끝을 각각 재 보세요. <b>이미지 px 는 크게 다르지만 mm 는 둘 다 약 150</b> 입니다. 한 칸의 대각선은 약 35.4 mm 여야 합니다. 보드 밖(사람 · 책상)은 다른 평면이라 값이 틀립니다.</p>' },
      { type: 'text', html: `<h3>STEP 5. 체스보드 대신 ArUco 마커로 재기</h3>
<p>체스보드는 크고 전부 보여야 검출됩니다. 실제 현장(작업대, 로봇 도킹 패드)에서는 <b>크기를 아는 ArUco 마커</b>를 붙여 두고 잽니다. <code>aruco_board.png</code> 는 DICT_4X4_50 마커 4개(ID 0~3)가 붙은 패드를 비스듬히 찍은 장면입니다. 패드를 <b>210 × 150 mm 로 인쇄했다고 가정</b>하면 마커 한 변은 40 mm, 마커 중심은 (30, 30) · (180, 30) · (180, 120) · (30, 120) mm 에 있습니다.</p>
<ul>
<li><b>마커 1개 기준</b>: 마커의 네 꼭짓점 → 40 mm 정사각형으로 H. 준비가 쉽지만 <b>마커에서 멀수록 오차가 커짐</b></li>
<li><b>마커 여러 개 기준</b>: 배치를 아는 마커 중심 4개 → H. 넓은 영역을 고르게 덮어 <b>더 정확</b></li>
</ul>` },
      { type: 'image', src: 'apps/aruco_board.png', caption: 'aruco_board.png — 로봇 도킹 패드(마커 ID 0~3)를 비스듬히 찍은 장면' },
      { type: 'code', title: '예제 5 · STEP 5: ArUco 패드로 측정 — 마커 1개 vs 4개 정확도 비교', code: String.raw`
import cv2 as cv
import numpy as np

MARKER_MM = 40.0
CENTER_MM = {0: (30, 30), 1: (180, 30), 2: (180, 120), 3: (30, 120)}   # 패드 설계도(가정: 210x150 mm)

img = cv.imread('aruco_board.png')
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50), cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
ids = ids.ravel().tolist()
print('검출된 마커 ID:', sorted(ids))
C = {i: c.reshape(4, 2) for i, c in zip(ids, corners)}          # ID → 네 꼭짓점(px)
centers = {i: C[i].mean(axis=0) for i in C}

def dist_mm(H, a, b):
    pa = cv.perspectiveTransform(np.float32([[a]]), H)[0, 0]
    pb = cv.perspectiveTransform(np.float32([[b]]), H)[0, 0]
    return float(np.linalg.norm(pa - pb))

tests = [(0, 1), (0, 3), (1, 3), (2, 3)]
true = {k: float(np.linalg.norm(np.subtract(CENTER_MM[k[0]], CENTER_MM[k[1]]))) for k in tests}

# (1) 마커 0 하나만 기준: 네 꼭짓점 → 40 mm 정사각형
H1, _ = cv.findHomography(C[0], np.float32([[0, 0], [MARKER_MM, 0], [MARKER_MM, MARKER_MM], [0, MARKER_MM]]))
# (2) 마커 4개 중심 → 설계도 좌표
H4, _ = cv.findHomography(np.float32([centers[i] for i in range(4)]), np.float32([CENTER_MM[i] for i in range(4)]))

print('구간     실제(mm)  마커1개   오차   마커4개   오차')
e1, e4 = [], []
for a, b in tests:
    d1, d4 = dist_mm(H1, centers[a], centers[b]), dist_mm(H4, centers[a], centers[b])
    e1.append(abs(d1 - true[(a, b)]))
    e4.append(abs(d4 - true[(a, b)]))
    print('%d-%d     %6.1f   %7.1f  %5.1f   %7.1f  %5.1f' % (a, b, true[(a, b)], d1, e1[-1], d4, e4[-1]))
# 마커 4개 기준은 중심에 맞춰 구했으므로, 따로 “마커 한 변 길이(40 mm)” 로 검증
sides = [dist_mm(H4, C[i][k], C[i][(k + 1) % 4]) for i in range(4) for k in range(4)]
print('평균 오차: 마커1개 %.1f mm / 마커4개 %.1f mm' % (np.mean(e1), np.mean(e4)))
print('마커4개 기준으로 잰 마커 한 변: %.1f ± %.1f mm (정답 40)' % (np.mean(sides), np.std(sides)))

# 탑뷰: 1 mm = 4 px
S = np.array([[4, 0, 0], [0, 4, 0], [0, 0, 1]], dtype=np.float64)
top = cv.warpPerspective(img, S @ H4, (840, 600))
cross = cv.perspectiveTransform(np.float32([[[105, 115]]]), np.linalg.inv(H4))[0, 0]
vis = img.copy()
cv.aruco.drawDetectedMarkers(vis, corners, np.array(ids).reshape(-1, 1))
cv.circle(vis, (int(cross[0]), int(cross[1])), 10, (0, 255, 0), 2)      # 설계도의 십자 위치(105,115)를 이미지에 투영
print('설계도 (105, 115) mm → 이미지 (%.0f, %.0f) px' % (cross[0], cross[1]))
cv.imshow('markers', vis)
cv.imshow('pad top view (1 mm = 4 px)', top)
`, desc: '<p>마커 1개 기준은 마커에서 멀어질수록 오차가 수 mm 까지 커지고, 4개 기준은 마커 한 변을 40 mm 에 가깝게 잽니다. 초록 원은 설계도의 빨간 십자 위치(105, 115 mm)를 이미지로 되돌린 것이라 <b>십자와 겹치면</b> 호모그래피가 맞다는 뜻입니다.</p>' },
      { type: 'table', head: ['방법', '준비', '정확도', '한계'], rows: [
        ['체스보드 + 캘리브레이션', '보드 인쇄 · 사진 여러 장', '높음 (보드 위 0.2 mm 수준)', '보드 전체가 보여야 함, 보드 평면에서만'],
        ['마커 1개', '마커 한 장, 크기만 알면 됨', '마커 근처만 양호, 멀면 수 %', '작은 마커의 꼭짓점 오차가 멀리서 확대'],
        ['마커 여러 개 (배치 앎)', '패드 설계 · 인쇄', '넓은 영역에서 양호', '마커 배치를 정확히 알아야 함'],
        ['캘리브레이션 없음', '없음', '렌즈 왜곡만큼 오차 (가장자리 수 px)', '광각 웹캠은 특히 부정확'],
      ] },
      { type: 'warn', html: `<p><b>측정 프로젝트의 함정</b></p>
<ul>
<li><b>같은 평면만</b>: 호모그래피는 기준물이 놓인 평면에서만 맞습니다. 높이가 있는 물체의 <b>윗면</b>을 재면 카메라에 가까워 더 크게 측정됩니다.</li>
<li><b>해상도 한계</b>: 1 px 이 몇 mm 인지 계산해 보세요(실습 2). 클릭 오차 2~3 px 이면 멀리 있는 곳은 수 mm 오차가 납니다.</li>
<li><b>기준 크기</b>: 칸 · 마커 크기를 자로 정확히 재세요. 25 mm 칸을 26 mm 로 넣으면 전체가 4% 틀립니다.</li>
<li>평가할 때는 <b>자로 잰 실제 길이</b>와 비교한 평균 · 최대 오차를 표로 남깁니다.</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 왜곡 보정이 측정에 주는 효과 (홀드아웃 검증)',
        desc: `<p>호모그래피를 구한 점으로 오차를 재면 당연히 작게 나옵니다. 공정하게 평가하려면 <b>바깥 코너 4개(0, 6, 35, 41)로만 H 를 구하고, 나머지 38개 코너(홀드아웃)의 mm 오차</b>를 재야 합니다. left01 · left03 · left12 세 장에서 <b>보정 안 함 / 보정함</b> 두 경우의 평균 · 최대 오차를 표로 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[534.157, 0, 341.715], [0, 534.255, 232.05], [0, 0, 1]])
DIST = np.array([-0.29427, 0.12325, 0.00114, -0.00014, 0.01021])
PATTERN, SQUARE_MM = (7, 6), 25.0
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
MM = np.mgrid[0:7, 0:6].T.reshape(-1, 2).astype(np.float32) * SQUARE_MM
OUTER = [0, 6, 35, 41]
INNER = [i for i in range(42) if i not in OUTER]

def holdout_error(pts):
    """바깥 4점으로 H → 나머지 38점의 mm 오차 (평균, 최대)"""
    H = cv.getPerspectiveTransform(pts[OUTER], MM[OUTER])
    pred = cv.perspectiveTransform(pts[INNER].reshape(-1, 1, 2), H).reshape(-1, 2)
    e = np.linalg.norm(pred - MM[INNER], axis=1)
    return e.mean(), e.max()

print('사진          보정 안 함(평균/최대)   보정함(평균/최대)')
for name in ['left01.jpg']:          # TODO 1: left03.jpg, left12.jpg 추가
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    ok, c = cv.findChessboardCorners(gray, PATTERN, None)
    c = cv.cornerSubPix(gray, c, (11, 11), (-1, -1), CRIT)
    raw = c.reshape(-1, 2)
    # TODO 2: cv.undistortPoints(c, K, DIST, P=K) 로 보정한 점을 만드세요
    und = raw
    m1, x1 = holdout_error(raw)
    m2, x2 = holdout_error(und)
    print('%-12s     %.2f / %.2f mm          %.2f / %.2f mm' % (name, m1, x1, m2, x2))
`,
        hint: `<p><code>und = cv.undistortPoints(c, K, DIST, P=K).reshape(-1, 2)</code>. 보정하면 홀드아웃 오차가 약 1 mm → 0.2 mm 수준으로 줄어듭니다. 이것이 “캘리브레이션 기반” 실측을 하는 이유입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[534.157, 0, 341.715], [0, 534.255, 232.05], [0, 0, 1]])
DIST = np.array([-0.29427, 0.12325, 0.00114, -0.00014, 0.01021])
PATTERN, SQUARE_MM = (7, 6), 25.0
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
MM = np.mgrid[0:7, 0:6].T.reshape(-1, 2).astype(np.float32) * SQUARE_MM
OUTER = [0, 6, 35, 41]
INNER = [i for i in range(42) if i not in OUTER]

def holdout_error(pts):
    H = cv.getPerspectiveTransform(pts[OUTER], MM[OUTER])
    pred = cv.perspectiveTransform(pts[INNER].reshape(-1, 1, 2), H).reshape(-1, 2)
    e = np.linalg.norm(pred - MM[INNER], axis=1)
    return e.mean(), e.max()

print('사진          보정 안 함(평균/최대)   보정함(평균/최대)')
for name in ['left01.jpg', 'left03.jpg', 'left12.jpg']:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    ok, c = cv.findChessboardCorners(gray, PATTERN, None)
    c = cv.cornerSubPix(gray, c, (11, 11), (-1, -1), CRIT)
    raw = c.reshape(-1, 2)
    und = cv.undistortPoints(c, K, DIST, P=K).reshape(-1, 2)
    m1, x1 = holdout_error(raw)
    m2, x2 = holdout_error(und)
    print('%-12s     %.2f / %.2f mm          %.2f / %.2f mm' % (name, m1, x1, m2, x2))
`,
      },
      {
        title: '실습 2 · 1 픽셀은 몇 mm 일까? (가까운 곳 vs 먼 곳)',
        desc: `<p>비스듬한 사진(left03)에서는 위치마다 1 px 이 나타내는 실제 길이가 다릅니다. 코너 0 과 코너 41 위치에서 각각 <b>오른쪽으로 1 px, 아래로 1 px</b> 움직인 점을 mm 로 바꿔, 1 px 이 몇 mm 인지 출력하세요. 클릭 오차가 3 px 이라면 각 위치의 측정 오차는 최대 몇 mm 일까요?</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[534.157, 0, 341.715], [0, 534.255, 232.05], [0, 0, 1]])
DIST = np.array([-0.29427, 0.12325, 0.00114, -0.00014, 0.01021])
PATTERN, SQUARE_MM = (7, 6), 25.0
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

gray = cv.imread('left03.jpg', cv.IMREAD_GRAYSCALE)
ok, c = cv.findChessboardCorners(gray, PATTERN, None)
c = cv.cornerSubPix(gray, c, (11, 11), (-1, -1), CRIT)
pts = cv.undistortPoints(c, K, DIST, P=K).reshape(-1, 2)
mm = np.mgrid[0:7, 0:6].T.reshape(-1, 2).astype(np.float32) * SQUARE_MM
H, _ = cv.findHomography(pts, mm)

def to_mm(p):
    return cv.perspectiveTransform(np.float32([[p]]), H)[0, 0]

for idx in [0]:                    # TODO 1: 코너 41 도 추가
    p = pts[idx]
    # TODO 2: p 에서 오른쪽 1px (p + [1, 0]) 과 아래 1px (p + [0, 1]) 의 mm 거리를 구하세요
    mm_per_px_x = 0.0
    mm_per_px_y = 0.0
    print('코너 %2d (%.0f, %.0f)px: 가로 1px = %.3f mm, 세로 1px = %.3f mm → 클릭 오차 3px ≈ 최대 %.1f mm'
          % (idx, p[0], p[1], mm_per_px_x, mm_per_px_y, 3 * max(mm_per_px_x, mm_per_px_y)))
`,
        hint: `<p><code>mm_per_px_x = float(np.linalg.norm(to_mm(p + [1, 0]) - to_mm(p)))</code>. 카메라에서 먼 쪽 코너일수록 1 px 이 더 긴 거리를 나타냅니다. 정밀 측정이 필요하면 카메라를 평면에 수직으로, 가깝게 두세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[534.157, 0, 341.715], [0, 534.255, 232.05], [0, 0, 1]])
DIST = np.array([-0.29427, 0.12325, 0.00114, -0.00014, 0.01021])
PATTERN, SQUARE_MM = (7, 6), 25.0
CRIT = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

gray = cv.imread('left03.jpg', cv.IMREAD_GRAYSCALE)
ok, c = cv.findChessboardCorners(gray, PATTERN, None)
c = cv.cornerSubPix(gray, c, (11, 11), (-1, -1), CRIT)
pts = cv.undistortPoints(c, K, DIST, P=K).reshape(-1, 2)
mm = np.mgrid[0:7, 0:6].T.reshape(-1, 2).astype(np.float32) * SQUARE_MM
H, _ = cv.findHomography(pts, mm)

def to_mm(p):
    return cv.perspectiveTransform(np.float32([[p]]), H)[0, 0]

for idx in [0, 41]:
    p = pts[idx]
    mm_per_px_x = float(np.linalg.norm(to_mm(p + [1, 0]) - to_mm(p)))
    mm_per_px_y = float(np.linalg.norm(to_mm(p + [0, 1]) - to_mm(p)))
    print('코너 %2d (%.0f, %.0f)px: 가로 1px = %.3f mm, 세로 1px = %.3f mm → 클릭 오차 3px ≈ 최대 %.1f mm'
          % (idx, p[0], p[1], mm_per_px_x, mm_per_px_y, 3 * max(mm_per_px_x, mm_per_px_y)))
`,
      },
    ],
    quiz: [
      { q: '체스보드 칸 크기(SQUARE_MM)를 실제보다 1.1배 크게 입력하면 측정값은?', options: ['영향이 없다', '왜곡 보정이 실패한다', '모든 측정값이 약 1.1배 크게 나온다', '호모그래피를 구할 수 없다'], answer: 2, explain: 'mm 좌표계 전체가 같은 비율로 커지므로 모든 거리가 1.1배로 나옵니다. 기준물 크기는 자로 정확히 재야 합니다.' },
      { q: 'cv.undistortPoints(pts, K, dist, P=K) 에서 P=K 를 넣는 이유는?', options: ['속도를 높이려고', '왜곡 계수를 새로 계산하려고', '점의 순서를 정렬하려고', '결과를 정규화 좌표가 아니라 보정된 이미지의 픽셀 좌표로 받으려고'], answer: 3, explain: 'P 를 생략하면 초점거리로 나눈 정규화 좌표가 나옵니다. P=K 를 주면 cv.undistort 로 보정한 이미지와 같은 픽셀 좌표계가 됩니다.' },
      { q: '체스보드가 놓인 책상에서 높이 5 cm 상자 윗면의 폭을 이 방법으로 재면?', options: ['정확하게 측정된다', '윗면이 카메라에 더 가까워 실제보다 크게 측정된다', '항상 0 mm 가 나온다', '실제보다 작게 측정된다'], answer: 1, explain: '호모그래피는 기준 평면(책상)에서만 맞습니다. 카메라에 더 가까운 윗면은 이미지에서 더 크게 보이므로 책상 평면 기준으로 환산하면 크게 나옵니다.' },
      { q: 'ArUco 마커 1개의 꼭짓점만으로 H 를 구해 넓은 영역을 잴 때 오차가 커지는 주된 이유는?', options: ['마커 ID 를 잘못 읽어서', 'ArUco 는 흑백이라서', '마커가 정사각형이 아니라서', '작은 마커 꼭짓점의 작은 위치 오차가 멀리 떨어진 곳에서는 크게 확대되어서'], answer: 3, explain: '좁은 영역(40 mm)의 네 점으로 넓은 평면을 외삽하면 꼭짓점 오차가 거리에 비례해 커집니다. 배치를 아는 여러 마커로 넓게 덮으면 정확도가 올라갑니다.' },
      { q: '측정 도구의 정확도를 공정하게 평가하는 방법으로 가장 알맞은 것은?', options: ['H 를 구하는 데 쓰지 않은 점(홀드아웃)이나 자로 잰 실제 길이와 비교한다', '호모그래피를 구할 때 쓴 코너들의 오차만 본다', '측정값이 정수로 나오는지 본다', '탑뷰 이미지가 예쁜지 본다'], answer: 0, explain: 'H 를 만든 점으로 평가하면 오차가 과소평가됩니다. 사용하지 않은 점 또는 독립적으로 잰 실제 값과 비교해야 합니다(학습/테스트 분리와 같은 원리).' },
    ],
  },

  // =====================================================================
  // a4-6 가이드 프로젝트 ④ 손글씨 숫자 인식기
  // =====================================================================
  {
    id: 'a4-6',
    assets: ['images/adv/digits.png'],
    summary: '마우스로 쓴 숫자를 알아맞히는 손글씨 인식기를 만듭니다. 시작할 때 digits.png 로 HOG + SVM 을 학습하고(약 1.5초), 캔버스에 쓴 굵은 흰 글씨를 “학습 데이터와 같은 모양”(20×20, 비율 유지, 무게중심 정렬, 기울기 보정)으로 바꾼 뒤 예측합니다. kNN 투표로 확신도를 표시하고, 여러 자리 숫자를 컨투어로 나눠 읽는 확장까지 만듭니다.',
    goals: [
      'digits.png 로 HOG(정규화) + SVM 을 학습하고 학습/테스트 정확도와 시간을 측정할 수 있다',
      '마우스 콜백으로 굵은 선을 그리는 캔버스를 만들고 오른쪽 클릭으로 지울 수 있다',
      '캔버스 글씨를 학습 데이터와 같은 분포(크기 · 위치 · 기울기)로 전처리해야 하는 이유를 설명하고 구현할 수 있다',
      'SVM 예측과 kNN 투표를 함께 써서 확신도를 표시하고, 컨투어로 여러 자리 숫자를 인식할 수 있다',
    ],
    schedule: [['도입 · 완성 모습', 5], ['STEP 1 학습과 평가', 10], ['STEP 2 그리기 캔버스', 5], ['STEP 3 전처리 (핵심)', 15], ['STEP 4~5 인식기 · 여러 자리', 5], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개: 마우스로 쓰면 읽어 주는 숫자 인식기</h3>
<p>3주차 a3-4 에서 digits.png(20×20 손글씨 5000개)로 SVM + HOG 를 학습해 테스트 정확도를 쟀습니다. 하지만 <b>“테스트 세트 정확도 97%”와 “내가 쓴 글씨를 맞히는 앱”</b> 사이에는 큰 간격이 있습니다. 내가 마우스로 쓴 글씨는 크기 · 위치 · 굵기 · 기울기가 학습 데이터와 전혀 다르기 때문입니다.</p>
<p>파이프라인</p>
<ul>
<li><b>학습(시작할 때 한 번)</b>: digits.png → 칸 자르기 → deskew → HOG → SVM (+ kNN)</li>
<li><b>인식(글씨를 쓸 때마다)</b>: 캔버스 → 글씨 영역 자르기 → 비율 유지 축소 → 20×20 가운데 · 무게중심 정렬 → deskew → HOG → SVM 예측 + kNN 투표 → 결과 표시</li>
</ul>
<p>이 프로젝트의 핵심 교훈: <b>학습할 때와 똑같은 전처리를 입력에도 적용해야 한다.</b></p>` },
      { type: 'image', src: 'adv/digits.png', caption: 'digits.png — 2000×1000, 숫자마다 500개(5줄 × 100칸), 한 칸 20×20' },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        '학습 시간과 테스트 정확도(95% 이상)가 출력된다',
        '캔버스에 마우스로 굵은 흰 선이 그려지고, 오른쪽 클릭으로 지워진다',
        '크기 · 위치가 다른 글씨도 전처리 후 20×20 미리보기가 학습 데이터처럼 보인다',
        '글씨를 다 쓰면(버튼을 떼면) 예측 숫자와 kNN 투표 막대가 표시된다',
        '여러 자리 숫자를 쓰면 왼쪽부터 순서대로 읽은 문자열이 나온다',
      ] },
      { type: 'text', html: `<h3>STEP 1. 시작할 때 학습하기</h3>
<p>3주차 코드에서 두 가지를 바꿉니다.</p>
<ul>
<li><b>HOG 정규화</b>: 히스토그램을 합이 1 이 되게 나누고 → 제곱근 → 길이 1 로 정규화(Hellinger). 글씨 굵기 · 밝기에 따른 크기 차이가 줄어 RBF 커널 SVM 이 잘 동작합니다(정규화하지 않으면 RBF 에서는 거의 찍기 수준).</li>
<li><b>학습량 조절</b>: 브라우저 속도를 위해 짝수 번째 2500개로 학습하고 나머지 2500개로 테스트합니다. 앱에서는 학습만 하면 됩니다.</li>
</ul>
<p>kNN(k=7)도 같은 특징으로 함께 학습해 두면, 예측할 때 <b>이웃 7개 중 몇 개가 같은 숫자인지</b>를 확신도로 쓸 수 있습니다.</p>` },
      { type: 'code', title: '예제 1 · STEP 1: HOG + SVM 학습 · 테스트 정확도 · 시간', code: String.raw`
import cv2 as cv
import numpy as np
import time

SZ, BIN = 20, 16

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

def hog(img):
    gx = cv.Sobel(img, cv.CV_32F, 1, 0)
    gy = cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    hist = []
    for sl in [(slice(0, 10), slice(0, 10)), (slice(0, 10), slice(10, 20)), (slice(10, 20), slice(0, 10)), (slice(10, 20), slice(10, 20))]:
        hist.append(np.bincount(bins[sl].ravel(), mag[sl].ravel(), BIN))
    h = np.hstack(hist).astype(np.float32)
    h /= h.sum() + 1e-7          # 정규화 ① 합 = 1
    h = np.sqrt(h)               # ② 제곱근 (Hellinger)
    h /= np.linalg.norm(h) + 1e-7   # ③ 길이 = 1
    return h

t0 = time.perf_counter()
digits = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = digits.reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)    # (5000, 20, 20)
labels = np.repeat(np.arange(10), 500)
feats = np.float32([hog(deskew(c)) for c in cells])
t1 = time.perf_counter()

train = np.arange(5000) % 2 == 0          # 짝수 번째 = 학습, 홀수 번째 = 테스트
svm = cv.ml.SVM_create()
svm.setType(cv.ml.SVM_C_SVC)
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(2.67)
svm.setGamma(5.383)
svm.train(feats[train], cv.ml.ROW_SAMPLE, labels[train].astype(np.int32))
knn = cv.ml.KNearest_create()
knn.train(feats[train], cv.ml.ROW_SAMPLE, labels[train].astype(np.float32))
t2 = time.perf_counter()

pred = svm.predict(feats[~train])[1].ravel().astype(int)
t3 = time.perf_counter()
acc = np.mean(pred == labels[~train])
print('특징 계산 %.0f ms / 학습 %.0f ms / 테스트 2500개 예측 %.0f ms' % ((t1 - t0) * 1000, (t2 - t1) * 1000, (t3 - t2) * 1000))
print('테스트 정확도: %.1f%%' % (acc * 100))
for d in range(10):
    sel = labels[~train] == d
    print('  숫자 %d: %.1f%%' % (d, 100 * np.mean(pred[sel] == d)))

# 틀린 샘플 모아 보기 (최대 20개, 3배 확대)
wrong = np.where(pred != labels[~train])[0][:20]
test_cells = cells[~train]
tiles = []
for i in wrong:
    t = cv.cvtColor(cv.resize(test_cells[i], (60, 60), interpolation=cv.INTER_NEAREST), cv.COLOR_GRAY2BGR)
    cv.putText(t, '%d>%d' % (labels[~train][i], pred[i]), (2, 14), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)
    tiles.append(t)
while len(tiles) % 10:
    tiles.append(np.zeros((60, 60, 3), np.uint8))
rows = [np.hstack(tiles[i:i + 10]) for i in range(0, len(tiles), 10)]
cv.imshow('mistakes (true>pred)', np.vstack(rows))
`, desc: '<p>틀린 샘플을 보면 사람이 봐도 헷갈리는 글씨가 많습니다(4↔9, 7↔1, 3↔5). “정답&gt;예측” 순서로 표시했습니다. 이 갤러리는 a4-8 의 실패 사례 분석에 그대로 씁니다.</p>' },
      { type: 'text', html: `<h3>STEP 2. 마우스로 그리는 캔버스</h3>
<ul>
<li><b>캔버스</b>: 240×240 검은 흑백 배열. 학습 데이터처럼 <b>검은 바탕에 흰 글씨</b></li>
<li><b>그리기</b>: 왼쪽 버튼을 누르면 <code>drawing = True</code>, 움직이면 <b>직전 점과 현재 점을 굵은 선(두께 18)</b>으로 이음 → 빠르게 움직여도 끊기지 않음</li>
<li><b>지우기</b>: 오른쪽 클릭 → <code>canvas[:] = 0</code></li>
<li>콜백이 끝나면 창이 자동으로 다시 그려지므로 <b>배열을 제자리에서 수정</b>하면 바로 보입니다</li>
</ul>` },
      { type: 'code', title: '예제 2 · STEP 2: 마우스 그리기 캔버스 (굵은 흰 선 · 오른쪽 클릭 지우기)', code: String.raw`
import cv2 as cv
import numpy as np

SIZE = 240
WIN = 'canvas'
def nothing(x):
    pass

canvas = np.zeros((SIZE, SIZE), np.uint8)            # 검은 바탕
state = {'drawing': False, 'last': None, 'strokes': 0}
cv.imshow(WIN, canvas)
cv.createTrackbar('thickness', WIN, 18, 40, nothing)

def on_mouse(event, x, y, flags, param):
    th = max(1, cv.getTrackbarPos('thickness', WIN))
    if event == cv.EVENT_LBUTTONDOWN:
        state['drawing'], state['last'] = True, (x, y)
        cv.circle(canvas, (x, y), th // 2, 255, -1)
    elif event == cv.EVENT_MOUSEMOVE and state['drawing']:
        cv.line(canvas, state['last'], (x, y), 255, th)     # 직전 점과 이어서 끊김 없이
        state['last'] = (x, y)
    elif event == cv.EVENT_LBUTTONUP:
        state['drawing'] = False
        state['strokes'] += 1
        print('획 %d개, 흰 픽셀 %d개' % (state['strokes'], np.count_nonzero(canvas)))
    elif event == cv.EVENT_RBUTTONDOWN:
        canvas[:] = 0                                        # 제자리에서 지우기
        state['strokes'] = 0
        print('지움')

cv.setMouseCallback(WIN, on_mouse)

# 시작할 때 예시 숫자 '2' 를 그려 둠 (오른쪽 클릭으로 지우고 직접 써 보세요)
demo = np.int32([[60, 72], [96, 29], [156, 29], [180, 72], [156, 120], [60, 211], [192, 211]])
cv.polylines(canvas, [demo], False, 255, 18, cv.LINE_AA)
`, desc: '<p>캔버스에 마우스로 숫자를 써 보세요. 트랙바로 굵기를 바꿀 수 있습니다. 너무 가늘면(5 이하) 20×20 으로 줄였을 때 선이 사라집니다.</p>' },
      { type: 'text', html: `<h3>STEP 3. 전처리: “학습 데이터처럼” 만들기</h3>
<p>캔버스 전체를 그냥 20×20 으로 줄이면, 구석에 작게 쓴 글씨는 점 몇 개가 되고 크게 쓴 글씨는 칸을 넘칩니다. digits.png 의 글씨를 조사하면 <b>높이 약 15 px, 무게중심이 칸 가운데(10, 10)</b>에 있습니다. 그래서 다음 순서로 바꿉니다.</p>
<ol>
<li><b>글씨 영역 자르기</b>: 흰 픽셀의 최소 · 최대 좌표로 바운딩 박스</li>
<li><b>비율 유지 축소</b>: 긴 변이 15 px 가 되도록 (가로세로 비율을 지켜야 1 이 뚱뚱해지지 않음), <code>INTER_AREA</code></li>
<li><b>20×20 가운데 배치</b> 후 <b>무게중심 정렬</b>: <code>cv.moments</code> 로 무게중심을 구해 (10, 10) 으로 이동</li>
<li><b>deskew + HOG</b>: 학습 때와 똑같은 함수</li>
</ol>` },
      { type: 'code', title: '예제 3 · STEP 3: 그냥 줄이기 vs 전처리 — 크기 · 위치가 다른 글씨로 비교', code: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def hog(img):
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)
def train_svm():
    cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)[::2]
    labels = np.repeat(np.arange(10), 500)[::2]
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(2.67)
    svm.setGamma(5.383)
    svm.train(np.float32([hog(deskew(c)) for c in cells]), cv.ml.ROW_SAMPLE, labels.astype(np.int32))
    return svm
SVM = train_svm()

def naive_20(canvas):
    return cv.resize(canvas, (SZ, SZ), interpolation=cv.INTER_AREA)

def to_20(canvas, box=15):
    ys, xs = np.nonzero(canvas)
    if len(xs) == 0:
        return None
    crop = canvas[ys.min():ys.max() + 1, xs.min():xs.max() + 1]           # ① 글씨 영역
    h, w = crop.shape
    s = box / max(h, w)                                                   # ② 긴 변 = 15 px
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small             # ③ 가운데 배치
    m = cv.moments(out)
    if m['m00'] > 0:                                                      # ④ 무게중심 → (10, 10)
        cx, cy = m['m10'] / m['m00'], m['m01'] / m['m00']
        out = cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - cx], [0, 1, SZ / 2 - cy]]), (SZ, SZ))
    return out

def predict(d20):
    return int(SVM.predict(hog(deskew(d20)).reshape(1, -1))[1][0, 0])

# 테스트용 글씨: 같은 숫자를 크게 · 작게 구석에 · 가운데 씀 (좌표는 0~1 비율)
STROKES = {
    3: [(0.25, 0.15), (0.7, 0.15), (0.45, 0.45), (0.7, 0.6), (0.72, 0.8), (0.5, 0.92), (0.25, 0.85)],
    7: [(0.2, 0.12), (0.8, 0.12), (0.45, 0.9)],
    4: [(0.6, 0.9), (0.6, 0.1), (0.2, 0.65), (0.8, 0.65)],
}
PLACES = [('big', 1.0, 0.5, 0.5), ('small top-left', 0.35, 0.25, 0.25), ('small bottom-right', 0.45, 0.72, 0.7)]

rows = []
for digit, stroke in STROKES.items():
    row = []
    for pname, scale, cx, cy in PLACES:
        canvas = np.zeros((240, 240), np.uint8)
        pts = np.int32([((cx + (x - 0.5) * scale) * 240, (cy + (y - 0.5) * scale) * 240) for x, y in stroke])
        cv.polylines(canvas, [pts], False, 255, 18, cv.LINE_AA)
        a, b = naive_20(canvas), to_20(canvas)
        pa, pb = predict(a), predict(b)
        print('숫자 %d %-18s 그냥 줄이기 → %d %s | 전처리 → %d %s' % (digit, pname, pa, 'O' if pa == digit else 'X', pb, 'O' if pb == digit else 'X'))
        big = lambda im: cv.cvtColor(cv.resize(im, (100, 100), interpolation=cv.INTER_NEAREST), cv.COLOR_GRAY2BGR)
        tile = np.hstack([cv.cvtColor(cv.resize(canvas, (100, 100)), cv.COLOR_GRAY2BGR), big(a), big(b)])
        cv.putText(tile, 'naive:%d' % pa, (104, 95), cv.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)
        cv.putText(tile, 'prep:%d' % pb, (204, 95), cv.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
        cv.rectangle(tile, (0, 0), (299, 99), (80, 80, 80), 1)
        row.append(tile)
    rows.append(np.hstack(row))
cv.imshow('canvas | naive 20x20 | preprocessed 20x20', np.vstack(rows))
`, desc: '<p>각 칸은 “캔버스 | 그냥 줄인 20×20 | 전처리한 20×20” 입니다. 작게 구석에 쓴 글씨는 그냥 줄이면 몇 픽셀짜리 점이 되어 엉뚱한 숫자가 나오지만, 전처리하면 크기와 위치가 항상 같아져 맞힙니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. 인식기 완성: 확신도까지 보여 주기</h3>
<p>SVM 은 항상 0~9 중 하나를 답합니다. 낙서를 해도 숫자를 답하죠. 그래서 같은 특징으로 학습한 <b>kNN(k=7)의 이웃 투표</b>를 함께 봅니다.</p>
<ul>
<li>이웃 7개 중 SVM 답과 같은 숫자가 <b>6~7개</b>: 확실 · <b>4~5개</b>: 보통 · <b>3개 이하</b>: 헷갈림(“?” 표시 고려)</li>
<li>결과 패널에 예측 숫자, 투표 막대그래프, 전처리한 20×20 미리보기를 함께 그려 <b>왜 그렇게 판단했는지</b> 보이게 합니다</li>
<li>인식은 <b>버튼을 뗄 때(LBUTTONUP)</b>만 실행해 그리는 동안 느려지지 않게 합니다</li>
</ul>` },
      { type: 'code', title: '예제 4 · STEP 4: 손글씨 숫자 인식기 완성 (SVM + kNN 투표)', code: String.raw`
import cv2 as cv
import numpy as np
import time

SZ, BIN, SIZE, THICK = 20, 16, 240, 18

# ---------- 학습 (시작할 때 한 번) ----------
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def hog(img):
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)

t = time.perf_counter()
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)[::2]
labels = np.repeat(np.arange(10), 500)[::2]
X = np.float32([hog(deskew(c)) for c in cells])
SVM = cv.ml.SVM_create()
SVM.setKernel(cv.ml.SVM_RBF)
SVM.setC(2.67)
SVM.setGamma(5.383)
SVM.train(X, cv.ml.ROW_SAMPLE, labels.astype(np.int32))
KNN = cv.ml.KNearest_create()
KNN.train(X, cv.ml.ROW_SAMPLE, labels.astype(np.float32))
print('학습 완료: %d개, %.0f ms' % (len(X), (time.perf_counter() - t) * 1000))

# ---------- 전처리 · 예측 ----------
def to_20(canvas, box=15):
    ys, xs = np.nonzero(canvas)
    if len(xs) < 30:
        return None
    crop = canvas[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = box / max(h, w)
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    m = cv.moments(out)
    cx, cy = m['m10'] / m['m00'], m['m01'] / m['m00']
    return cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - cx], [0, 1, SZ / 2 - cy]]), (SZ, SZ))

def recognize(canvas):
    d20 = to_20(canvas)
    if d20 is None:
        return None, None, None
    f = hog(deskew(d20)).reshape(1, -1)
    digit = int(SVM.predict(f)[1][0, 0])
    _, _, neighbours, _ = KNN.findNearest(f, 7)
    votes = np.bincount(neighbours.ravel().astype(int), minlength=10)
    return digit, votes, d20

# ---------- 화면 ----------
canvas = np.zeros((SIZE, SIZE), np.uint8)
panel = np.zeros((SIZE, 300, 3), np.uint8)
state = {'drawing': False, 'last': None}

def update_panel():
    panel[:] = 30
    digit, votes, d20 = recognize(canvas)
    if digit is None:
        cv.putText(panel, 'draw a digit', (60, 130), cv.FONT_HERSHEY_SIMPLEX, 0.8, (200, 200, 200), 2)
        return
    conf = votes[digit]
    color = (0, 255, 0) if conf >= 6 else (0, 255, 255) if conf >= 4 else (0, 0, 255)
    cv.putText(panel, str(digit) if conf >= 4 else '%d?' % digit, (20, 110), cv.FONT_HERSHEY_SIMPLEX, 3.5, color, 8)
    cv.putText(panel, 'kNN votes %d/7' % conf, (20, 145), cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    for d in range(10):                                   # 투표 막대그래프
        x = 20 + d * 27
        cv.rectangle(panel, (x, 225 - votes[d] * 10), (x + 18, 225), (0, 200, 255) if d == digit else (150, 150, 150), -1)
        cv.putText(panel, str(d), (x + 3, 238), cv.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    panel[10:90, 200:280] = cv.cvtColor(cv.resize(d20, (80, 80), interpolation=cv.INTER_NEAREST), cv.COLOR_GRAY2BGR)
    print('예측: %d, kNN 투표 %s' % (digit, votes.tolist()))

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        state['drawing'], state['last'] = True, (x, y)
        cv.circle(canvas, (x, y), THICK // 2, 255, -1)
    elif event == cv.EVENT_MOUSEMOVE and state['drawing']:
        cv.line(canvas, state['last'], (x, y), 255, THICK)
        state['last'] = (x, y)
    elif event == cv.EVENT_LBUTTONUP:
        state['drawing'] = False
        update_panel()                                    # 다 쓰고 뗄 때만 인식
    elif event == cv.EVENT_RBUTTONDOWN:
        canvas[:] = 0
        update_panel()

# 시작 예시: '3' 을 그려 두고 인식 (오른쪽 클릭으로 지우고 직접 써 보세요)
demo = np.int32([[60, 36], [168, 36], [108, 108], [168, 144], [173, 192], [120, 221], [60, 204]])
cv.polylines(canvas, [demo], False, 255, THICK, cv.LINE_AA)
update_panel()
cv.imshow('canvas', canvas)
cv.imshow('result', panel)
cv.setMouseCallback('canvas', on_mouse)
`, desc: '<p><b>canvas</b> 창에 숫자를 쓰고 버튼을 떼면 <b>result</b> 창이 바뀝니다. 오른쪽 클릭으로 지웁니다. 확신도가 낮을 때 “?” 가 붙는지, 어떤 숫자끼리 표가 갈리는지 관찰하세요. 1 에 머리 깃발을 크게 그리면 7 이나 9 와 표가 갈립니다.</p>' },
      { type: 'text', html: `<h3>STEP 5. 여러 자리 숫자 읽기</h3>
<p>“2024”처럼 여러 숫자를 한 번에 쓰면, <b>외곽 컨투어</b>(<code>RETR_EXTERNAL</code>)로 글자 덩어리를 나누고 <code>boundingRect</code> 의 x 좌표로 <b>왼쪽부터 정렬</b>해 하나씩 인식합니다.</p>
<ul>
<li>숫자끼리 <b>붙여 쓰면</b> 한 덩어리가 되어 실패 → 간격을 두고 쓰기(또는 너무 넓은 덩어리는 나누기)</li>
<li>한 숫자가 <b>두 조각</b>(예: 획이 끊긴 5, 4)이면 두 번 인식됨 → 가로로 크게 겹치는 박스는 합치기</li>
<li>점 같은 작은 조각은 면적으로 거르기</li>
</ul>` },
      { type: 'code', title: '예제 5 · STEP 5: 여러 자리 숫자 인식 (컨투어 분할 + 정렬)', code: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN, THICK = 20, 16, 16

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def hog(img):
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)[::2]
SVM = cv.ml.SVM_create()
SVM.setKernel(cv.ml.SVM_RBF)
SVM.setC(2.67)
SVM.setGamma(5.383)
SVM.train(np.float32([hog(deskew(c)) for c in cells]), cv.ml.ROW_SAMPLE, np.repeat(np.arange(10), 500)[::2].astype(np.int32))

def to_20(img, box=15):
    ys, xs = np.nonzero(img)
    crop = img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = box / max(h, w)
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    m = cv.moments(out)
    return cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - m['m10'] / m['m00']], [0, 1, SZ / 2 - m['m01'] / m['m00']]]), (SZ, SZ))

def read_number(canvas, min_area=150):
    contours, _ = cv.findContours(canvas, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = sorted([cv.boundingRect(c) for c in contours if cv.contourArea(c) >= min_area], key=lambda b: b[0])  # 왼쪽부터
    result = []
    for (x, y, w, h) in boxes:
        roi = np.zeros_like(canvas)
        roi[y:y + h, x:x + w] = canvas[y:y + h, x:x + w]          # 이 덩어리만 남긴 이미지
        d = int(SVM.predict(hog(deskew(to_20(roi))).reshape(1, -1))[1][0, 0])
        result.append((d, (x, y, w, h)))
    return result

canvas = np.zeros((200, 520), np.uint8)
view = np.zeros((200, 520, 3), np.uint8)
state = {'drawing': False, 'last': None}

def refresh():
    view[:] = cv.cvtColor(canvas, cv.COLOR_GRAY2BGR)
    if np.count_nonzero(canvas) == 0:
        return
    result = read_number(canvas)
    for d, (x, y, w, h) in result:
        cv.rectangle(view, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(view, str(d), (x, max(18, y - 4)), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    text = ''.join(str(d) for d, _ in result)
    cv.putText(view, 'read: ' + text, (10, 190), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
    print('읽은 숫자열:', text)

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        state['drawing'], state['last'] = True, (x, y)
    elif event == cv.EVENT_MOUSEMOVE and state['drawing']:
        cv.line(canvas, state['last'], (x, y), 255, THICK)
        state['last'] = (x, y)
    elif event == cv.EVENT_LBUTTONUP:
        state['drawing'] = False
        refresh()
    elif event == cv.EVENT_RBUTTONDOWN:
        canvas[:] = 0
        refresh()

# 시작 예시: 2 0 4 7 (각 숫자를 120x160 칸에 그림)
DEMO = {
    2: [(0.25, 0.3), (0.4, 0.12), (0.65, 0.12), (0.75, 0.3), (0.65, 0.5), (0.25, 0.88), (0.8, 0.88)],
    0: [(0.5, 0.1), (0.25, 0.25), (0.2, 0.5), (0.25, 0.8), (0.5, 0.92), (0.75, 0.8), (0.8, 0.5), (0.75, 0.22), (0.5, 0.1)],
    4: [(0.6, 0.9), (0.6, 0.1), (0.2, 0.65), (0.8, 0.65)],
    7: [(0.2, 0.12), (0.8, 0.12), (0.45, 0.9)],
}
for i, d in enumerate([2, 0, 4, 7]):
    pts = np.int32([(15 + i * 125 + x * 110, 10 + y * 150) for x, y in DEMO[d]])
    cv.polylines(canvas, [pts], False, 255, THICK, cv.LINE_AA)
refresh()
cv.imshow('multi digits', view)
cv.imshow('draw here', canvas)
cv.setMouseCallback('draw here', on_mouse)
`, desc: '<p><b>draw here</b> 창에 간격을 두고 여러 숫자를 써 보세요(오른쪽 클릭 = 지우기). 숫자를 붙여 쓰면 한 박스로 묶여 틀리는 것도 확인하세요. 이 구조에 <b>연산자 기호(+, −)를 직접 모아 학습</b>하면 “손글씨 계산기” 프로젝트가 됩니다.</p>' },
      { type: 'table', head: ['실패 증상', '원인', '대책'], rows: [
        ['작게 · 구석에 쓰면 틀림', '크기 · 위치가 학습 데이터와 다름', '바운딩 박스 → 비율 유지 축소 → 무게중심 정렬'],
        ['1 을 뚱뚱한 막대로 인식', '비율을 무시하고 20×20 으로 늘림', '긴 변 기준으로만 축소하고 나머지는 여백'],
        ['가늘게 쓰면 틀림', '20×20 으로 줄이면 선이 흐려져 사라짐', '캔버스 선 두께 14~20, INTER_AREA'],
        ['낙서도 숫자로 답함', 'SVM 은 항상 한 클래스를 고름', 'kNN 투표 · 두 모델 일치 여부로 “?” 표시'],
        ['7 · 1 · 4 를 서로 헷갈림', '글씨체(유럽식 1, 가로줄 7) 차이 — 데이터셋 스타일', '내 글씨를 모아 추가 학습(a5-1 데이터 준비)'],
        ['여러 자리에서 개수가 틀림', '붙여 쓴 숫자 · 끊어진 획', '간격 안내, 박스 합치기 · 나누기 규칙'],
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 확신이 없으면 “?” 로 답하기',
        desc: `<p>인식기가 낙서에도 숫자를 답하지 않도록 거절 규칙을 추가합니다. 다음 중 하나라도 해당하면 <code>'?'</code> 를 돌려주세요.</p>
<ul><li>kNN 이웃 7개 중 SVM 답과 같은 표가 <b>MIN_VOTES(=5) 미만</b></li><li>kNN 다수결 답이 <b>SVM 답과 다름</b></li><li>가장 가까운 학습 샘플까지의 거리가 <b>MAX_DIST(=0.28) 초과</b> — 학습 데이터 어디에도 비슷한 글씨가 없음. (digits 테스트 글씨는 99% 가 0.28 이하)</li></ul>
<p>준비된 입력 4개(또렷한 7, 또렷한 0, 지그재그 낙서, 네모)의 결과를 표로 출력합니다. 낙서는 표가 몰려도 <b>거리</b>에서 걸러집니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def hog(img):
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)[::2]
labels = np.repeat(np.arange(10), 500)[::2]
X = np.float32([hog(deskew(c)) for c in cells])
SVM = cv.ml.SVM_create()
SVM.setKernel(cv.ml.SVM_RBF)
SVM.setC(2.67)
SVM.setGamma(5.383)
SVM.train(X, cv.ml.ROW_SAMPLE, labels.astype(np.int32))
KNN = cv.ml.KNearest_create()
KNN.train(X, cv.ml.ROW_SAMPLE, labels.astype(np.float32))

def to_20(img, box=15):
    ys, xs = np.nonzero(img)
    crop = img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = box / max(h, w)
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    m = cv.moments(out)
    return cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - m['m10'] / m['m00']], [0, 1, SZ / 2 - m['m01'] / m['m00']]]), (SZ, SZ))

MIN_VOTES, MAX_DIST = 5, 0.28
def recognize(canvas):
    f = hog(deskew(to_20(canvas))).reshape(1, -1)
    svm_digit = int(SVM.predict(f)[1][0, 0])
    _, knn_result, neighbours, dists = KNN.findNearest(f, 7)
    knn_digit = int(knn_result[0, 0])
    votes = int(np.sum(neighbours == svm_digit))
    nearest = float(dists[0, 0])            # 가장 가까운 학습 샘플까지 거리
    # TODO: votes < MIN_VOTES, knn_digit != svm_digit, nearest > MAX_DIST 중 하나라도 참이면 '?' 를 돌려주세요
    return str(svm_digit), svm_digit, knn_digit, votes, nearest

def draw(points, closed=False):
    c = np.zeros((240, 240), np.uint8)
    cv.polylines(c, [np.int32(points)], closed, 255, 18, cv.LINE_AA)
    return c

inputs = {
    'clear 7': draw([(48, 29), (192, 29), (108, 216)]),
    'clear 0': draw([(120, 24), (60, 60), (48, 120), (60, 192), (120, 221), (180, 192), (192, 120), (180, 53)], True),
    'zigzag': draw([(30, 60), (80, 180), (120, 50), (160, 190), (210, 60)]),
    'box': draw([(40, 40), (200, 40), (200, 200), (40, 200)], True),
}
print('입력        답   SVM  kNN  투표  최근접거리')
tiles = []
for name, c in inputs.items():
    answer, s, k, v, dist = recognize(c)
    print('%-10s  %-3s  %3d  %3d   %d/7   %.3f' % (name, answer, s, k, v, dist))
    t = cv.cvtColor(cv.resize(c, (160, 160)), cv.COLOR_GRAY2BGR)
    cv.putText(t, answer, (120, 40), cv.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)
    tiles.append(t)
cv.imshow('answers', np.hstack(tiles))
`,
        hint: `<p><code>if votes &lt; MIN_VOTES or knn_digit != svm_digit or nearest &gt; MAX_DIST: return '?', ...</code>. 지그재그는 투표가 6/7 로 몰리지만 최근접 거리가 0.3 을 넘습니다. 기준을 너무 엄격하게 하면 또렷한 숫자도 “?” 가 되니(재현율 ↓) 테스트 글씨로 균형을 확인하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def hog(img):
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)[::2]
labels = np.repeat(np.arange(10), 500)[::2]
X = np.float32([hog(deskew(c)) for c in cells])
SVM = cv.ml.SVM_create()
SVM.setKernel(cv.ml.SVM_RBF)
SVM.setC(2.67)
SVM.setGamma(5.383)
SVM.train(X, cv.ml.ROW_SAMPLE, labels.astype(np.int32))
KNN = cv.ml.KNearest_create()
KNN.train(X, cv.ml.ROW_SAMPLE, labels.astype(np.float32))

def to_20(img, box=15):
    ys, xs = np.nonzero(img)
    crop = img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = box / max(h, w)
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    m = cv.moments(out)
    return cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - m['m10'] / m['m00']], [0, 1, SZ / 2 - m['m01'] / m['m00']]]), (SZ, SZ))

MIN_VOTES, MAX_DIST = 5, 0.28
def recognize(canvas):
    f = hog(deskew(to_20(canvas))).reshape(1, -1)
    svm_digit = int(SVM.predict(f)[1][0, 0])
    _, knn_result, neighbours, dists = KNN.findNearest(f, 7)
    knn_digit = int(knn_result[0, 0])
    votes = int(np.sum(neighbours == svm_digit))
    nearest = float(dists[0, 0])
    if votes < MIN_VOTES or knn_digit != svm_digit or nearest > MAX_DIST:
        return '?', svm_digit, knn_digit, votes, nearest
    return str(svm_digit), svm_digit, knn_digit, votes, nearest

def draw(points, closed=False):
    c = np.zeros((240, 240), np.uint8)
    cv.polylines(c, [np.int32(points)], closed, 255, 18, cv.LINE_AA)
    return c

inputs = {
    'clear 7': draw([(48, 29), (192, 29), (108, 216)]),
    'clear 0': draw([(120, 24), (60, 60), (48, 120), (60, 192), (120, 221), (180, 192), (192, 120), (180, 53)], True),
    'zigzag': draw([(30, 60), (80, 180), (120, 50), (160, 190), (210, 60)]),
    'box': draw([(40, 40), (200, 40), (200, 200), (40, 200)], True),
}
print('입력        답   SVM  kNN  투표  최근접거리')
tiles = []
for name, c in inputs.items():
    answer, s, k, v, dist = recognize(c)
    print('%-10s  %-3s  %3d  %3d   %d/7   %.3f' % (name, answer, s, k, v, dist))
    t = cv.cvtColor(cv.resize(c, (160, 160)), cv.COLOR_GRAY2BGR)
    cv.putText(t, answer, (120, 40), cv.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)
    tiles.append(t)
cv.imshow('answers', np.hstack(tiles))
`,
      },
      {
        title: '실습 2 · 숫자 합계 계산기: 간격으로 수 묶기',
        desc: `<p>캔버스에 <b>“12  7  30”</b> 처럼 수 사이를 넓게 띄워 썼습니다. 예제 5 처럼 숫자를 왼쪽부터 읽은 뒤, <b>앞 숫자 박스의 오른쪽 끝과 다음 숫자 박스의 왼쪽 끝 사이 간격이 GAP(=40 px) 보다 크면 새로운 수</b>로 나누세요. 읽은 수들과 합계(12 + 7 + 30 = 49)를 출력하고 화면에 표시합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN, THICK, GAP = 20, 16, 14, 40
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def hog(img):
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)[::2]
SVM = cv.ml.SVM_create()
SVM.setKernel(cv.ml.SVM_RBF)
SVM.setC(2.67)
SVM.setGamma(5.383)
SVM.train(np.float32([hog(deskew(c)) for c in cells]), cv.ml.ROW_SAMPLE, np.repeat(np.arange(10), 500)[::2].astype(np.int32))

def to_20(img, box=15):
    ys, xs = np.nonzero(img)
    crop = img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = box / max(h, w)
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    m = cv.moments(out)
    return cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - m['m10'] / m['m00']], [0, 1, SZ / 2 - m['m01'] / m['m00']]]), (SZ, SZ))

def read_digits(canvas):
    contours, _ = cv.findContours(canvas, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = sorted([cv.boundingRect(c) for c in contours if cv.contourArea(c) >= 150], key=lambda b: b[0])
    out = []
    for (x, y, w, h) in boxes:
        roi = np.zeros_like(canvas)
        roi[y:y + h, x:x + w] = canvas[y:y + h, x:x + w]
        out.append((int(SVM.predict(hog(deskew(to_20(roi))).reshape(1, -1))[1][0, 0]), (x, y, w, h)))
    return out

# 캔버스에 “12  7  30” 쓰기 (숫자 칸 폭 70, 수 사이는 넓게)
SHAPES = {
    1: [(0.58, 0.1), (0.45, 0.9)],
    2: [(0.25, 0.3), (0.4, 0.12), (0.65, 0.12), (0.75, 0.3), (0.65, 0.5), (0.25, 0.88), (0.8, 0.88)],
    7: [(0.2, 0.12), (0.8, 0.12), (0.45, 0.9)],
    3: [(0.25, 0.15), (0.7, 0.15), (0.45, 0.45), (0.7, 0.6), (0.72, 0.8), (0.5, 0.92), (0.25, 0.85)],
    0: [(0.5, 0.1), (0.25, 0.25), (0.2, 0.5), (0.25, 0.8), (0.5, 0.92), (0.75, 0.8), (0.8, 0.5), (0.75, 0.22), (0.5, 0.1)],
}
canvas = np.zeros((160, 640), np.uint8)
for d, x0 in [(1, 10), (2, 80), (7, 250), (3, 420), (0, 490)]:
    cv.polylines(canvas, [np.int32([(x0 + x * 70, 15 + y * 120) for x, y in SHAPES[d]])], False, 255, THICK, cv.LINE_AA)

digits = read_digits(canvas)
print('읽은 숫자:', [d for d, _ in digits])

# TODO: 박스 간격(다음 x - (앞 x + 앞 w))이 GAP 보다 크면 새 수로 나눠 numbers 리스트를 만드세요
numbers = [int(''.join(str(d) for d, _ in digits))]
print('수:', numbers, '합계:', sum(numbers))

view = cv.cvtColor(canvas, cv.COLOR_GRAY2BGR)
for d, (x, y, w, h) in digits:
    cv.rectangle(view, (x, y), (x + w, y + h), (0, 255, 0), 1)
cv.putText(view, ' + '.join(map(str, numbers)) + ' = %d' % sum(numbers), (10, 155), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
cv.imshow('sum calculator', view)
`,
        hint: `<p>현재 수를 문자열 <code>cur</code> 로 모으다가 <code>x - (px + pw) &gt; GAP</code> 이면 <code>numbers.append(int(cur))</code> 후 <code>cur = ''</code>. 반복이 끝나면 마지막 <code>cur</code> 도 추가하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN, THICK, GAP = 20, 16, 14, 40
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def hog(img):
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)[::2]
SVM = cv.ml.SVM_create()
SVM.setKernel(cv.ml.SVM_RBF)
SVM.setC(2.67)
SVM.setGamma(5.383)
SVM.train(np.float32([hog(deskew(c)) for c in cells]), cv.ml.ROW_SAMPLE, np.repeat(np.arange(10), 500)[::2].astype(np.int32))

def to_20(img, box=15):
    ys, xs = np.nonzero(img)
    crop = img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = box / max(h, w)
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    m = cv.moments(out)
    return cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - m['m10'] / m['m00']], [0, 1, SZ / 2 - m['m01'] / m['m00']]]), (SZ, SZ))

def read_digits(canvas):
    contours, _ = cv.findContours(canvas, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = sorted([cv.boundingRect(c) for c in contours if cv.contourArea(c) >= 150], key=lambda b: b[0])
    out = []
    for (x, y, w, h) in boxes:
        roi = np.zeros_like(canvas)
        roi[y:y + h, x:x + w] = canvas[y:y + h, x:x + w]
        out.append((int(SVM.predict(hog(deskew(to_20(roi))).reshape(1, -1))[1][0, 0]), (x, y, w, h)))
    return out

SHAPES = {
    1: [(0.58, 0.1), (0.45, 0.9)],
    2: [(0.25, 0.3), (0.4, 0.12), (0.65, 0.12), (0.75, 0.3), (0.65, 0.5), (0.25, 0.88), (0.8, 0.88)],
    7: [(0.2, 0.12), (0.8, 0.12), (0.45, 0.9)],
    3: [(0.25, 0.15), (0.7, 0.15), (0.45, 0.45), (0.7, 0.6), (0.72, 0.8), (0.5, 0.92), (0.25, 0.85)],
    0: [(0.5, 0.1), (0.25, 0.25), (0.2, 0.5), (0.25, 0.8), (0.5, 0.92), (0.75, 0.8), (0.8, 0.5), (0.75, 0.22), (0.5, 0.1)],
}
canvas = np.zeros((160, 640), np.uint8)
for d, x0 in [(1, 10), (2, 80), (7, 250), (3, 420), (0, 490)]:
    cv.polylines(canvas, [np.int32([(x0 + x * 70, 15 + y * 120) for x, y in SHAPES[d]])], False, 255, THICK, cv.LINE_AA)

digits = read_digits(canvas)
print('읽은 숫자:', [d for d, _ in digits])

numbers, cur, prev_right = [], '', None
for d, (x, y, w, h) in digits:
    if prev_right is not None and x - prev_right > GAP:      # 간격이 넓으면 새 수 시작
        numbers.append(int(cur))
        cur = ''
    cur += str(d)
    prev_right = x + w
if cur:
    numbers.append(int(cur))
print('수:', numbers, '합계:', sum(numbers))

view = cv.cvtColor(canvas, cv.COLOR_GRAY2BGR)
for d, (x, y, w, h) in digits:
    cv.rectangle(view, (x, y), (x + w, y + h), (0, 255, 0), 1)
cv.putText(view, ' + '.join(map(str, numbers)) + ' = %d' % sum(numbers), (10, 155), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
cv.imshow('sum calculator', view)
`,
      },
    ],
    quiz: [
      { q: '마우스로 쓴 글씨를 인식할 때 “학습 데이터와 같은 전처리”가 중요한 이유는?', options: ['화면을 예쁘게 보이려고', 'SVM 학습 속도를 높이려고', '모델은 학습 때 본 분포(크기 · 위치 · 기울기)의 입력에서만 잘 동작하므로', '캔버스 크기를 줄이려고'], answer: 2, explain: '학습 데이터는 20×20 가운데 정렬 · 비슷한 크기였습니다. 입력을 같은 모양으로 바꾸지 않으면 테스트 정확도 97% 모델도 엉뚱한 답을 합니다.' },
      { q: '글씨를 20×20 으로 줄일 때 가로세로 비율을 유지하지 않으면 특히 어떤 숫자가 망가지나?', options: ['0', '1', '8', '모든 숫자가 똑같이 망가지지 않는다'], answer: 1, explain: '가늘고 긴 1 을 정사각형으로 늘리면 두꺼운 막대가 되어 다른 숫자처럼 보입니다. 긴 변 기준으로 축소하고 나머지는 여백으로 둡니다.' },
      { q: '마우스 콜백에서 MOUSEMOVE 마다 점(circle)만 찍지 않고 직전 점과 현재 점을 선(line)으로 잇는 이유는?', options: ['색을 바꾸려고', '선이 원보다 연산이 복잡해서', '마우스를 빠르게 움직이면 이벤트 사이 간격이 벌어져 점선처럼 끊기므로', '오른쪽 클릭을 인식하려고'], answer: 2, explain: '마우스 이벤트는 일정 간격으로만 오므로 빠르게 그리면 점 사이가 벌어집니다. 선으로 이으면 끊김 없는 획이 됩니다.' },
      { q: 'SVM 예측과 함께 kNN(k=7) 이웃 투표를 보는 목적은?', options: ['SVM 을 더 빠르게 만들려고', '학습 데이터를 늘리려고', 'HOG 특징을 계산하려고', '예측이 얼마나 확실한지 가늠해 낙서 · 애매한 글씨에 “?” 로 답하려고'], answer: 3, explain: 'SVM 은 항상 한 클래스를 고릅니다. 이웃 대부분이 같은 숫자면 확실하고, 표가 갈리면 애매한 입력이므로 거절(“?”)할 수 있습니다.' },
    ],
  },

  // =====================================================================
  // a4-7 팀 프로젝트 기획
  // =====================================================================
  {
    id: 'a4-7',
    assets: ['images/adv/digits.png', 'images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg', 'images/adv/graf3.jpg'],
    summary: '팀 프로젝트의 주제를 확정하고, 심화 프로젝트에서 가장 많이 실패하는 지점인 “데이터 계획”과 “평가 지표 · 목표값”을 먼저 설계합니다. 웹캠 스냅샷으로 라벨 붙은 데이터를 모으는 도구, 데이터 누수 없는 학습/테스트 분할을 실습하고, 설계서 템플릿과 두 가지 프로젝트 스켈레톤(학습형 · 매칭형: CONFIG · load_data · extract_features · train · evaluate · detect · visualize · process)을 내 주제에 맞게 고칩니다.',
    goals: [
      '2주 가능성 · 데이터 확보 · 측정 가능한 지표 · 브라우저 속도 기준으로 주제를 평가하고 확정할 수 있다',
      '데이터 수집 · 라벨 규칙 · 학습/테스트 분할 계획을 세우고, 데이터 누수가 정확도를 부풀리는 이유를 설명할 수 있다',
      '주제에 맞는 정량 지표와 목표값을 정해 설계서에 적을 수 있다',
      '학습형 · 매칭형 스켈레톤 코드의 구조를 이해하고 내 주제에 맞게 함수를 바꿀 수 있다',
    ],
    schedule: [['도입 · 기획 순서', 5], ['주제 선정', 10], ['데이터 계획 · 수집 · 분할', 10], ['지표 · 설계서', 10], ['스켈레톤 코드', 10], ['공유 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 심화 프로젝트는 왜 “데이터와 지표”부터 정할까?</h3>
<p>가이드 프로젝트 4개에서 봤듯이, 심화 기법은 <b>입력 데이터의 성질</b>(크기 · 무늬 · 조명 · 글씨체)에 크게 좌우되고, 잘 됐는지는 <b>숫자</b>로만 확인할 수 있습니다. 코드부터 쓰면 “내 사진 한 장에서는 되는데 발표장에서는 안 되는” 프로젝트가 됩니다. 오늘은 다음 순서로 기획합니다.</p>
<ol>
<li><b>주제 확정</b> — 후보 3개를 기준표로 점수 매기기</li>
<li><b>데이터 계획</b> — 무엇을 몇 장, 어떤 조건에서 모으고, 어떻게 라벨을 붙이고 나눌지</li>
<li><b>지표와 목표값</b> — “정확도 90% 이상, 150 ms/프레임 이하”처럼 확인 가능한 숫자</li>
<li><b>설계서</b> — 파이프라인 단계별 입력 · 출력 · 함수 · 확인 방법, 위험과 역할</li>
<li><b>스켈레톤 코드</b> — 설계서 단계를 그대로 함수로 옮길 틀</li>
</ol>` },
      { type: 'text', html: `<h3>2. 주제 선정 기준</h3>
<p>a4-1 에서 적은 후보 3개에 기준마다 1~3점을 매기세요. <b>한 항목이라도 1점이면</b> 주제를 줄이거나 바꾸는 것을 권장합니다.</p>` },
      { type: 'table', head: ['기준', '스스로 물어볼 질문', '나쁜 예', '좋은 예'], rows: [
        ['2주 안에 가능', '배운 기법(특징 · 3D · ML · 검출)만으로 핵심 기능이 되나?', '처음 보는 딥러닝 모델을 직접 학습', 'ORB 매칭으로 책 표지 3종 인식'],
        ['데이터 확보', '오늘 테스트 데이터 20장 이상을 모을 수 있나? 학습형이면 클래스당 30장 이상?', '도로에서 표지판 수백 장 촬영', '인쇄한 표지판 5종을 웹캠으로 촬영'],
        ['측정 가능한 지표', '정답(라벨 · 실제 길이)을 알 수 있어 숫자로 채점 가능한가?', '“자연스러운” AR', '인식률 · 꼭짓점 오차(px) · FPS'],
        ['브라우저 속도', '한 프레임 0.3 s 안에 되나? (SIFT 원본 크기, 큰 YOLO 는 위험)', '매 프레임 SIFT 800px + 여러 모델', 'ORB 480px + 기준 특징 미리 계산'],
        ['발표 가치', '데모에서 결과가 눈에 보이고 전후 비교가 가능한가?', '콘솔 숫자만 출력', '실시간 오버레이 + 성능표'],
      ] },
      { type: 'text', html: `<h3>3. 데이터 계획</h3>
<ul>
<li><b>수집</b>: 강좌 편집기의 📷 웹캠 스냅샷(<code>webcam.png</code>)이나 ⬆ 업로드, 또는 아래 “수집 도우미” 예제로 라벨을 붙여 저장합니다. <b>조명 · 배경 · 거리 · 각도</b>를 일부러 바꿔 가며 모읍니다.</li>
<li><b>라벨 규칙</b>: 파일 이름에 라벨을 넣습니다. 예) <code>data_book_003.png</code>, 측정형은 <code>ruler_150mm_01.png</code>. 라벨 표(CSV)를 따로 두면 더 좋습니다.</li>
<li><b>분할</b>: 학습 70~80% / 테스트 20~30%. <b>같은 촬영 세션 · 같은 물체의 연속 사진 · 증강 복사본은 같은 쪽에</b> 넣어야 합니다(그룹 분할).</li>
<li><b>양(권장 최소)</b>: 매칭형은 기준 사진 1~3장 + 테스트 20장(없음 포함), 학습형(HOG+SVM)은 클래스당 30~50장, 측정형은 자로 잰 정답 10개 이상.</li>
<li><b>테스트 세트 고정</b>: 한 번 정한 테스트 세트는 튜닝하면서 바꾸지 않습니다.</li>
</ul>` },
      { type: 'table', head: ['프로젝트 유형', '데이터', '라벨 · 정답', '주 지표'], rows: [
        ['매칭형 (상품 · 표지 인식, AR)', '기준 사진 + 다양한 조건의 장면 사진, <b>물체 없는 사진</b>', '장면마다 들어 있는 물체 이름(또는 없음), 가능하면 꼭짓점', '정밀도 · 재현율, 꼭짓점 오차 px, ms'],
        ['학습형 (숫자 · 표지판 · 제스처 분류)', '클래스별 잘린 이미지 수십~수백 장', '클래스 이름 (파일 이름/CSV)', '정확도, 혼동 행렬, 클래스별 재현율'],
        ['검출기 활용형 (얼굴 모자이크, 계수기)', '사람 · 물체가 나오는 영상 · 사진', '정답 박스 또는 개수', 'IoU ≥ 0.5 정밀도 · 재현율, 계수 오차, FPS'],
        ['기하 · 측정형 (자, 도킹 가이드)', '기준물(체스보드 · 마커) + 잴 대상', '자 · 각도기로 잰 실제 값', '평균 · 최대 mm 오차, 각도 오차'],
      ] },
      { type: 'code', title: '예제 1 · 데이터 수집 도우미: 클릭하면 라벨 붙여 저장', code: String.raw`
import cv2 as cv
import numpy as np
import os
import webcv

LABELS = ['book', 'box', 'none']          # 내 프로젝트의 클래스 이름으로 바꾸기
ROI = 0.6                                 # 가운데 60% 영역만 저장 (물체를 가운데에)
WIN = 'capture'
def nothing(x):
    pass

STATE = {'frame': webcv.get_input(), 'saved': 0}     # 가장 최근 입력 프레임

def counts():
    files = [f for f in os.listdir('.') if f.startswith('data_') and f.endswith('.png')]
    return {lab: sum(1 for f in files if f.startswith('data_%s_' % lab)) for lab in LABELS}

def crop_center(img):
    h, w = img.shape[:2]
    ch, cw = int(h * ROI), int(w * ROI)
    y, x = (h - ch) // 2, (w - cw) // 2
    return img[y:y + ch, x:x + cw], (x, y, cw, ch)

def draw_panel():
    frame = STATE['frame']
    vis = frame.copy()
    _, (x, y, w, h) = crop_center(frame)
    cv.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
    label = LABELS[cv.getTrackbarPos('label', WIN)]
    c = counts()
    cv.putText(vis, 'label: %s   (click = save)' % label, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    cv.putText(vis, '  '.join('%s:%d' % (k, v) for k, v in c.items()), (10, vis.shape[0] - 15), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    cv.imshow(WIN, vis)

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        label = LABELS[cv.getTrackbarPos('label', WIN)]
        n = counts()[label] + 1
        name = 'data_%s_%03d.png' % (label, n)
        roi, _ = crop_center(STATE['frame'])
        cv.imwrite(name, roi)
        print('저장:', name, roi.shape)
        draw_panel()

def process(frame):                       # 웹캠 · 동영상이면 매 프레임 최신 프레임을 기억
    STATE['frame'] = frame
    draw_panel()
    return frame

cv.imshow(WIN, STATE['frame'])
cv.createTrackbar('label', WIN, 0, len(LABELS) - 1, nothing)
cv.setMouseCallback(WIN, on_mouse)
draw_panel()
print('현재 데이터 수:', counts())
`, desc: '<p>📷 웹캠으로 바꾸고, 트랙바로 라벨을 고른 뒤 <b>capture 창을 클릭</b>할 때마다 초록 상자 안이 <code>data_라벨_번호.png</code> 로 저장됩니다(콘솔에 다운로드 링크). 페이지를 새로 고치면 가상 폴더가 비워지므로 <b>모은 파일은 내려받아 보관</b>하고, 다음에 ⬆ 업로드로 다시 올리세요.</p>' },
      { type: 'text', html: `<h3>4. 데이터 누수(Data Leakage): 정확도가 부풀려지는 함정</h3>
<p>데이터를 늘리려고 한 장을 조금씩 이동 · 회전한 <b>증강 복사본</b>을 만든 뒤 <b>무작위로</b> 학습/테스트를 나누면, 테스트 이미지의 “거의 똑같은 쌍둥이”가 학습 세트에 들어갑니다. 모델은 처음 보는 글씨를 맞힌 것이 아니라 <b>외운 것</b>을 맞힌 것이죠. 같은 사람이 같은 날 연속으로 찍은 사진도 마찬가지입니다. 해결책은 <b>원본(그룹) 단위로 먼저 나누고</b>, 그다음 학습 쪽만 증강하는 것입니다.</p>` },
      { type: 'code', title: '예제 2 · 무작위 분할 vs 그룹 분할: 누수가 만드는 착시', code: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(1)
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, 20, 100, 20).swapaxes(1, 2).reshape(-1, 20, 20)
labels = np.repeat(np.arange(10), 500)
pick = rng.choice(5000, 600, replace=False)          # 원본 600장 (우리 팀이 모은 데이터라고 가정)

# 증강: 원본마다 1px 이동한 복사본 3장 추가 → 2400장, group = 원본 번호
X, Y, G = [], [], []
for g, i in enumerate(pick):
    for dx, dy in [(0, 0), (1, 0), (0, 1), (-1, 0)]:
        X.append(cv.warpAffine(cells[i], np.float32([[1, 0, dx], [0, 1, dy]]), (20, 20)))
        Y.append(labels[i])
        G.append(g)
X = np.float32(X).reshape(len(X), -1)
Y, G = np.array(Y), np.array(G)
print('데이터 %d장 (원본 %d × 4)' % (len(X), len(pick)))

def accuracy(train_mask):
    knn = cv.ml.KNearest_create()
    knn.train(X[train_mask], cv.ml.ROW_SAMPLE, Y[train_mask].astype(np.float32))
    _, res, _, _ = knn.findNearest(X[~train_mask], 3)
    return np.mean(res.ravel() == Y[~train_mask])

# (1) 증강 후 무작위 분할 — 쌍둥이가 양쪽에 섞임 (누수!)
random_train = np.zeros(len(X), bool)
random_train[rng.permutation(len(X))[:int(len(X) * 0.8)]] = True
# (2) 원본(그룹) 단위 분할 — 같은 원본의 복사본은 모두 같은 쪽
test_groups = rng.permutation(len(pick))[:int(len(pick) * 0.2)]
group_train = ~np.isin(G, test_groups)

a1, a2 = accuracy(random_train), accuracy(group_train)
print('무작위 분할(누수) 정확도: %.1f%%' % (a1 * 100))
print('그룹 분할(정직)   정확도: %.1f%%' % (a2 * 100))
print('→ 누수 때문에 %.1f%%p 부풀려짐' % ((a1 - a2) * 100))

# 클래스별 테스트 개수 확인 (층화: 클래스가 고르게 들어갔나?)
print('그룹 분할 테스트의 클래스별 개수:', np.bincount(Y[~group_train], minlength=10).tolist())
`, desc: '<p>같은 모델 · 같은 데이터인데 나누는 방법만 바꿔도 정확도가 수 %p 달라집니다. 발표에서 “정확도 90%”라고 말하려면 <b>어떻게 나눴는지</b>도 함께 말해야 합니다.</p>' },
      { type: 'text', html: `<h3>5. 지표와 목표값 정하기</h3>
<p>지표는 “무엇을 셀지”, 목표값은 “얼마면 성공인지”입니다. <b>필수 요구사항 = 지표 + 목표값 + 테스트 세트</b>로 씁니다.</p>
<ul>
<li>✗ “책 표지를 잘 인식한다” → ✓ “테스트 사진 20장(표지 3종 + 없음 5장)에서 <b>정밀도 ≥ 0.9, 재현율 ≥ 0.8</b>”</li>
<li>✗ “실시간으로 동작한다” → ✓ “웹캠 640×480 에서 <b>process 평균 ≤ 150 ms</b>”</li>
<li>✗ “정확하게 잰다” → ✓ “자로 잰 10개 구간에서 <b>평균 오차 ≤ 2 mm, 최대 ≤ 5 mm</b>”</li>
</ul>
<p>목표값은 a4-8 에서 <b>기준선(baseline)</b>을 잰 뒤 현실적으로 조정해도 됩니다. 단, 조정한 사실과 이유를 기록합니다.</p>` },
      { type: 'code', title: '설계서 템플릿 (복사해서 팀 문서에 작성)', norun: true, code: String.raw`
================================================================
 심화 팀 프로젝트 설계서                         팀명: __________
================================================================
1. 주제 한 줄 요약
   예) 책상 위 책 표지 3종을 웹캠으로 인식해 표지 위에 정보 카드를 띄우는 AR 앱

2. 결합하는 기술 (2가지 이상)
   예) ORB 특징 매칭 + RANSAC 호모그래피(검증) + warpPerspective 합성 + 이동 평균 안정화

3. 데이터 계획
   - 기준/학습 데이터: 표지 정면 사진 3장 (book_a.png, book_b.png, book_c.png)
   - 테스트 데이터: 20장 = 표지별 5장(각도 · 조명 · 거리 다르게) + 표지 없음 5장
   - 라벨 규칙: test_<라벨>_<번호>.png   (라벨 = a, b, c, none)
   - 분할 방법: 기준 사진은 테스트에 쓰지 않음 / 같은 촬영 연속 사진은 한쪽에만
   - 수집 일정: a4-7 오늘 10장, a4-8 전까지 20장 완성

4. 지표와 목표값
   | 지표                 | 목표        | 측정 방법                  |
   | 정밀도 / 재현율      | ≥0.9 / ≥0.8 | 테스트 20장 결과표          |
   | 꼭짓점 오차          | ≤ 8 px      | 사람이 찍은 꼭짓점과 비교   |
   | 처리 시간            | ≤ 150 ms    | process 평균 (20프레임)     |

5. 파이프라인
   단계              | 하는 일                 | 함수                          | 출력            | 확인 방법
   ------------------+-------------------------+-------------------------------+-----------------+------------------
   ① 입력 · 정규화  | 480px 축소, 흑백        | resize, cvtColor              | 흑백 프레임     | shape, ms
   ② 특징           | 특징점 · 기술자         | ORB_create, detectAndCompute  | kp, des         | 특징점 수
   ③ 매칭 · 분류    | 기준별 매칭, 비율 테스트| BFMatcher.knnMatch            | good 매칭       | drawMatches
   ④ 검증           | RANSAC, 인라이어·볼록성 | findHomography, isContourConvex| H 또는 None    | 인라이어 수
   ⑤ 출력           | 카드 합성, 성능 표시    | warpPerspective, putText      | 결과 프레임     | 디버그 뷰

6. CONFIG (주요 파라미터와 처음 값)
   width=480, nfeatures=800, ratio=0.75, min_inliers=15, smooth=0.6

7. 위험 요소와 대책 (3개 이상)

8. 역할 분담
   이름 | 맡은 모듈 (데이터/특징/검증/시각화/평가) | 산출물

9. 일정 (a4-8 ~ a5-6 교시별 목표)
`, desc: '<p>설계서는 <b>살아 있는 문서</b>입니다. 기준선을 재고 튜닝하면서 바뀐 파라미터 · 목표 · 결정을 계속 고쳐 적으세요. 발표자료의 “데이터”, “파이프라인”, “결과표” 슬라이드가 여기서 나옵니다.</p>' },
      { type: 'table', head: ['자주 만나는 위험', '미리 할 수 있는 대책'], rows: [
        ['무늬 없는 물체라 특징점이 거의 없음', '무늬 많은 대상으로 주제 조정, 또는 ArUco 마커 · 색 기반 검출로 대체'],
        ['반복 무늬(타일 · 글자)로 오매칭', '비율 테스트 엄격하게, RANSAC 인라이어 비율 검증, 여러 기준 사진'],
        ['학습 데이터가 너무 적어 과적합', '클래스당 30장 이상, 학습 쪽만 증강, 그룹 분할로 정직하게 평가'],
        ['조명 · 배경이 바뀌면 성능 급락', '수집할 때 조건을 일부러 다양하게, 테스트 세트에도 포함'],
        ['브라우저에서 너무 느림', '축소 · 특징점 수 제한 · 기준 특징 미리 계산 · 무거운 단계는 N 프레임마다'],
        ['측정형인데 캘리브레이션 누락', '첫날 체스보드 촬영 · calib.npz 저장, 기준물 크기 자로 확인'],
      ] },
      { type: 'text', html: `<h3>6. 프로젝트 스켈레톤 코드</h3>
<p>모든 팀이 출발점으로 쓰는 틀입니다. 함수 이름과 역할을 먼저 맞추면 팀원끼리 나눠 작업하기 쉽습니다.</p>
<ul>
<li><b>CONFIG</b>: 숫자는 모두 한 곳에 (튜닝 · 실험 기록이 쉬움)</li>
<li><b>load_data → extract_features → train → evaluate</b>: 오프라인 단계 — 데이터를 읽고, 특징을 만들고, 학습(매칭형은 “기준 DB 만들기”)하고, 테스트 세트로 지표를 출력</li>
<li><b>detect → visualize → process</b>: 온라인 단계 — 한 프레임에서 찾고 그리기. 이미지 실행과 웹캠 실행이 <b>같은 함수</b>를 씀</li>
</ul>
<p>아래 두 스켈레톤(학습형 · 매칭형)은 함수 이름이 같고 <b>내용만 다릅니다</b>. 내 주제에 가까운 쪽을 골라 고치세요.</p>` },
      { type: 'code', title: '스켈레톤 A · 학습형: 종이에 쓴 숫자 인식 (HOG + SVM)', code: String.raw`
import cv2 as cv
import numpy as np
import time

# ==================== CONFIG ====================
CONFIG = {
    'train_step': 2,          # digits.png 에서 n개 중 1개만 학습 (속도)
    'svm_C': 2.67, 'svm_gamma': 5.383,
    'min_h': 25,              # 검출: 이보다 작은 덩어리는 무시 (px)
    'max_boxes': 20,
}
SZ, BIN = 20, 16

# ==================== 오프라인: 데이터 → 특징 → 학습 → 평가 ====================
def load_data():
    """(이미지들, 라벨들, 그룹) — 팀 데이터면 파일 목록을 읽어 같은 형식으로"""
    cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)
    labels = np.repeat(np.arange(10), 500)
    groups = np.tile(np.arange(100), 50)          # 가정: 열 번호 = 쓴 사람
    return cells, labels, groups

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

def extract_features(img20):
    img = deskew(img20)
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)

def train(X, y, cfg):
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(cfg['svm_C'])
    svm.setGamma(cfg['svm_gamma'])
    svm.train(X, cv.ml.ROW_SAMPLE, y.astype(np.int32))
    return svm

def evaluate(model, X, y):
    pred = model.predict(X)[1].ravel().astype(int)
    cm = np.zeros((10, 10), int)
    for t, p in zip(y, pred):
        cm[t, p] += 1
    print('[평가] 테스트 %d개, 정확도 %.1f%%' % (len(y), 100 * np.mean(pred == y)))
    worst = np.argsort(np.diag(cm) / cm.sum(axis=1))[:3]
    print('       재현율이 낮은 숫자:', [(int(d), '%.0f%%' % (100 * cm[d, d] / cm[d].sum())) for d in worst])
    return cm

# ==================== 온라인: 찾기 → 그리기 → process ====================
def to_20(binary_roi, box=15):
    ys, xs = np.nonzero(binary_roi)
    crop = binary_roi[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = box / max(h, w)
    small = cv.resize(crop, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv.INTER_AREA)
    out = np.zeros((SZ, SZ), np.uint8)
    y0, x0 = (SZ - small.shape[0]) // 2, (SZ - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    m = cv.moments(out)
    return cv.warpAffine(out, np.float32([[1, 0, SZ / 2 - m['m10'] / m['m00']], [0, 1, SZ / 2 - m['m01'] / m['m00']]]), (SZ, SZ))

def detect(frame, model, cfg):
    """흰 종이에 어두운 글씨 → [(숫자, (x, y, w, h)), ...] 왼쪽부터"""
    gray = cv.GaussianBlur(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), (5, 5), 0)
    _, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    contours, _ = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = [cv.boundingRect(c) for c in contours]
    boxes = [b for b in boxes if cfg['min_h'] <= b[3] <= 0.9 * frame.shape[0] and b[2] <= 1.5 * b[3]]
    boxes = sorted(boxes, key=lambda b: b[0])[:cfg['max_boxes']]
    results = []
    for (x, y, w, h) in boxes:
        roi = np.zeros_like(binary)
        roi[y:y + h, x:x + w] = binary[y:y + h, x:x + w]
        d = int(model.predict(extract_features(to_20(roi)).reshape(1, -1))[1][0, 0])
        results.append((d, (x, y, w, h)))
    return results, binary

def visualize(frame, results, ms):
    out = frame.copy()
    for d, (x, y, w, h) in results:
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 200, 0), 2)
        cv.putText(out, str(d), (x, max(20, y - 6)), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    cv.putText(out, 'read: %s  (%.0f ms)' % (''.join(str(d) for d, _ in results), ms), (10, out.shape[0] - 12), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
    return out

def process(frame):
    t = time.perf_counter()
    results, _ = detect(frame, MODEL, CONFIG)
    return visualize(frame, results, (time.perf_counter() - t) * 1000)

# ==================== 실행 ====================
t0 = time.perf_counter()
imgs, labels, groups = load_data()
X = np.float32([extract_features(im) for im in imgs[::CONFIG['train_step']]])
y = labels[::CONFIG['train_step']]
g = groups[::CONFIG['train_step']]
is_test = g % 5 == 0                                  # 그룹(쓴 사람) 단위로 20% 테스트
MODEL = train(X[~is_test], y[~is_test], CONFIG)
print('학습 %d개 / 테스트 %d개, %.0f ms' % ((~is_test).sum(), is_test.sum(), (time.perf_counter() - t0) * 1000))
evaluate(MODEL, X[is_test], y[is_test])

# 확인용 입력: 흰 종이에 테스트 숫자 6개를 크게 써 붙인 “사진”
test_idx = np.where(is_test)[0]
chosen = [test_idx[y[test_idx] == d][2] for d in [4, 0, 7, 2, 9, 5]]    # 테스트 세트에서 숫자별로 하나씩
sheet = np.full((180, 640, 3), 235, np.uint8)
for k, i in enumerate(chosen):
    digit = cv.resize(imgs[::CONFIG['train_step']][i], (90, 90), interpolation=cv.INTER_CUBIC)
    ink = np.clip(digit.astype(np.float32) * 1.5, 0, 215).astype(np.uint8)        # 진한 펜 글씨처럼
    sheet[45:135, 20 + k * 102:110 + k * 102] = 235 - ink[:, :, None]
print('종이의 정답:', ''.join(str(y[i]) for i in chosen))
cv.imshow('sheet result', process(sheet))
`, desc: '<p>오프라인 단계는 콘솔에 <b>정확도와 약한 클래스</b>를, 온라인 단계는 종이 사진에서 읽은 숫자를 보여 줍니다. 📷 웹캠으로 바꾸고 흰 종이에 굵은 펜으로 쓴 숫자를 비춰 보세요. 팀 데이터로 바꾸려면 <code>load_data()</code> 만 고치면 됩니다.</p>' },
      { type: 'code', title: '스켈레톤 B · 매칭형: 기준 사진 여러 장 중 무엇이 보이나 (ORB + 호모그래피)', code: String.raw`
import cv2 as cv
import numpy as np
import time

# ==================== CONFIG ====================
CONFIG = {'width': 480, 'nfeatures': 1000, 'ratio': 0.75, 'min_inliers': 15}
ORB = cv.ORB_create(nfeatures=CONFIG['nfeatures'])
BF = cv.BFMatcher(cv.NORM_HAMMING)

def resize_w(img, width):
    return img if img.shape[1] <= width else cv.resize(img, (width, int(img.shape[0] * width / img.shape[1])), interpolation=cv.INTER_AREA)

# ==================== 오프라인 ====================
def load_data(cfg):
    """기준 사진(클래스) + 테스트 세트(이미지, 정답 라벨 또는 None)"""
    refs = {'box': cv.imread('box.png'), 'graf': resize_w(cv.imread('graf1.jpg'), 320)}
    tests = [('box_in_scene.png', 'box'), ('graf3.jpg', 'graf'), ('lena.jpg', None), ('messi5.jpg', None)]
    tests = [(name, resize_w(cv.imread(name), 320 if name.startswith('graf') else cfg['width']), label) for name, label in tests]
    return refs, tests

def extract_features(img):
    return ORB.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)

def train(refs):
    """매칭형의 ‘학습’ = 기준 사진 특징 DB 만들기"""
    db = {}
    for name, img in refs.items():
        kp, des = extract_features(img)
        h, w = img.shape[:2]
        db[name] = (kp, des, np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2))
        print('기준 %-5s 특징점 %d' % (name, len(kp)))
    return db

def detect(frame, db, cfg):
    """가장 인라이어가 많은 기준을 돌려줌: (라벨 또는 None, 인라이어, 사각형)"""
    kp, des = extract_features(frame)
    best = (None, 0, None)
    if des is None or len(kp) < 10:
        return best
    for name, (kr, dr, corners) in db.items():
        good = [p[0] for p in BF.knnMatch(dr, des, k=2) if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < 8:
            continue
        H, mask = cv.findHomography(np.float32([kr[m.queryIdx].pt for m in good]).reshape(-1, 1, 2),
                                    np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2), cv.RANSAC, 5.0)
        n = 0 if H is None else int(mask.sum())
        if n > best[1]:
            best = (name, n, cv.perspectiveTransform(corners, H))
    return best if best[1] >= cfg['min_inliers'] else (None, best[1], None)

def evaluate(db, tests, cfg):
    tp = fp = fn = correct = 0
    times = []
    for name, img, label in tests:
        t = time.perf_counter()
        pred, n, _ = detect(img, db, cfg)
        times.append((time.perf_counter() - t) * 1000)
        correct += pred == label
        if pred is not None and pred == label: tp += 1
        if pred is not None and pred != label: fp += 1
        if label is not None and pred != label: fn += 1
        print('  %-18s 정답 %-5s 예측 %-5s 인라이어 %3d  %s' % (name, label, pred, n, 'O' if pred == label else 'X'))
    print('[평가] 정확도 %d/%d, 정밀도 %.2f, 재현율 %.2f, 평균 %.0f ms' % (correct, len(tests), tp / max(1, tp + fp), tp / max(1, tp + fn), np.mean(times)))

# ==================== 온라인 ====================
def visualize(frame, result):
    label, n, quad = result
    out = frame.copy()
    if quad is not None:
        cv.polylines(out, [np.int32(quad)], True, (0, 255, 0), 3)
    cv.putText(out, '%s (%d)' % (label or 'nothing', n), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out

def process(frame):
    small = resize_w(frame, CONFIG['width'])
    return visualize(small, detect(small, DB, CONFIG))

# ==================== 실행 ====================
refs, tests = load_data(CONFIG)
DB = train(refs)
evaluate(DB, tests, CONFIG)
cv.imshow('result box_in_scene', process(cv.imread('box_in_scene.png')))
`, desc: '<p>기준 사진을 추가하려면 <code>load_data()</code> 의 <code>refs</code> 에 한 줄, 테스트 사진과 정답을 <code>tests</code> 에 한 줄 넣으면 됩니다. <b>물체가 없는 테스트(None)</b>를 꼭 포함해야 정밀도(헛검출)를 잴 수 있습니다.</p>' },
      { type: 'table', head: ['역할', '맡는 모듈', '산출물'], rows: [
        ['데이터 담당', 'load_data, 수집 · 라벨 · 분할 규칙, 테스트 세트 관리', '데이터 폴더, 라벨 표, 분할 설명'],
        ['알고리즘 담당', 'extract_features, train, detect 의 핵심 로직과 CONFIG 튜닝', '실험 기록(바꾼 값 → 결과)'],
        ['평가 담당', 'evaluate, 기준선 · 개선 수치표, 실패 사례 갤러리', '성능표, 실패 분석표'],
        ['앱 · 발표 담당', 'visualize, process, 트랙바 · 마우스 UI, 데모 · 발표자료', '데모 화면, 슬라이드'],
      ] },
      { type: 'checklist', title: '기획 완료 체크 (교시 끝나기 전)', items: [
        '주제 한 줄 요약과 결합하는 기술 2가지 이상이 정해졌다',
        '데이터 계획(양 · 조건 · 라벨 규칙 · 분할 방법)이 적혀 있고, 오늘 첫 데이터를 모으기 시작했다',
        '지표 2~3개와 목표값, 측정 방법이 정해졌다',
        '설계서의 파이프라인 표가 단계별로 채워졌다',
        '스켈레톤 A 또는 B 를 복사해 팀 주제 이름으로 CONFIG · load_data 를 고치기 시작했다',
        '역할 분담이 끝났고, 모든 팀원이 코드 모듈 하나 이상을 맡았다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 합성 테스트 세트로 인식률 · 꼭짓점 오차 재기',
        desc: `<p>실제 사진을 모으기 전에도 <b>합성 데이터</b>로 파이프라인을 시험할 수 있습니다. <code>box.png</code> 를 무작위 원근 변환 · 크기 · 밝기로 배경 사진(lena, messi5, home) 위에 붙여 <b>정답 꼭짓점을 아는</b> 테스트 이미지를 만듭니다. 시작 코드는 1장만 만듭니다. <b>6장</b>을 만들어 각 장의 검출 성공 여부와 <b>꼭짓점 평균 오차(px)</b>를 출력하고, 전체 재현율과 성공한 것들의 평균 오차를 계산하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(7)
REF = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
RH, RW = REF.shape
CORNERS = np.float32([[0, 0], [RW, 0], [RW, RH], [0, RH]])
ORB = cv.ORB_create(nfeatures=1000)
KP_R, DES_R = ORB.detectAndCompute(REF, None)
BACKGROUNDS = ['lena.jpg', 'messi5.jpg', 'home.jpg']

def make_sample(bg_name):
    """배경 위에 box.png 를 무작위로 붙이고 (이미지, 정답 꼭짓점) 반환"""
    bg = cv.resize(cv.imread(bg_name, cv.IMREAD_GRAYSCALE), (512, 384))
    scale = rng.uniform(0.6, 1.0)
    cx, cy = rng.uniform(150, 360), rng.uniform(120, 260)
    jitter = rng.uniform(-0.12, 0.12, (4, 2)) * [RW, RH] * scale
    gt = (CORNERS - [RW / 2, RH / 2]) * scale + [cx, cy] + jitter
    H = cv.getPerspectiveTransform(CORNERS, np.float32(gt))
    warped = cv.warpPerspective(REF, H, (512, 384))
    mask = cv.warpPerspective(np.full_like(REF, 255), H, (512, 384))
    img = bg.copy()
    img[mask > 0] = warped[mask > 0]
    img = cv.convertScaleAbs(img, alpha=rng.uniform(0.6, 1.2))
    return img, np.float32(gt)

def detect(gray):
    kp, des = ORB.detectAndCompute(gray, None)
    if des is None:
        return None
    good = [p[0] for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(DES_R, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < 8:
        return None
    H, mask = cv.findHomography(np.float32([KP_R[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
    if H is None or mask.sum() < 15:
        return None
    return cv.perspectiveTransform(CORNERS.reshape(-1, 1, 2), H).reshape(4, 2)

tiles = []
# TODO 1: 6장을 만들도록 반복하세요 (배경은 BACKGROUNDS[i % 3])
for i in range(1):
    img, gt = make_sample(BACKGROUNDS[i % 3])
    quad = detect(img)
    vis = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    cv.polylines(vis, [np.int32(gt)], True, (0, 0, 255), 2)                # 정답 = 빨강
    if quad is None:
        print('#%d 실패' % i)
    else:
        # TODO 2: 꼭짓점 평균 오차(px) = np.linalg.norm(quad - gt, axis=1).mean() 를 계산해 출력하고 모으세요
        cv.polylines(vis, [np.int32(quad)], True, (0, 255, 0), 2)         # 검출 = 초록
        print('#%d 성공' % i)
    tiles.append(cv.resize(vis, (256, 192)))
# TODO 3: 재현율(성공 수 / 전체)과 성공한 것들의 평균 꼭짓점 오차를 출력하세요
while len(tiles) % 3:
    tiles.append(np.zeros((192, 256, 3), np.uint8))
cv.imshow('synthetic tests (red=GT, green=detected)', np.vstack([np.hstack(tiles[k:k + 3]) for k in range(0, len(tiles), 3)]))
`,
        hint: `<p><code>for i in range(6):</code> 로 바꾸고, 반복문 위에 <code>errors, found = [], 0</code> 을 두세요. 성공하면 <code>e = np.linalg.norm(quad - gt, axis=1).mean()</code>, <code>errors.append(e)</code>, <code>found += 1</code>. 마지막에 <code>found / 6</code> 과 <code>np.mean(errors)</code>. 합성 데이터는 실제 사진보다 쉬우므로 <b>실제 사진 테스트를 대신할 수는 없다</b>는 점도 기억하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(7)
REF = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
RH, RW = REF.shape
CORNERS = np.float32([[0, 0], [RW, 0], [RW, RH], [0, RH]])
ORB = cv.ORB_create(nfeatures=1000)
KP_R, DES_R = ORB.detectAndCompute(REF, None)
BACKGROUNDS = ['lena.jpg', 'messi5.jpg', 'home.jpg']

def make_sample(bg_name):
    bg = cv.resize(cv.imread(bg_name, cv.IMREAD_GRAYSCALE), (512, 384))
    scale = rng.uniform(0.6, 1.0)
    cx, cy = rng.uniform(150, 360), rng.uniform(120, 260)
    jitter = rng.uniform(-0.12, 0.12, (4, 2)) * [RW, RH] * scale
    gt = (CORNERS - [RW / 2, RH / 2]) * scale + [cx, cy] + jitter
    H = cv.getPerspectiveTransform(CORNERS, np.float32(gt))
    warped = cv.warpPerspective(REF, H, (512, 384))
    mask = cv.warpPerspective(np.full_like(REF, 255), H, (512, 384))
    img = bg.copy()
    img[mask > 0] = warped[mask > 0]
    img = cv.convertScaleAbs(img, alpha=rng.uniform(0.6, 1.2))
    return img, np.float32(gt)

def detect(gray):
    kp, des = ORB.detectAndCompute(gray, None)
    if des is None:
        return None
    good = [p[0] for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(DES_R, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < 8:
        return None
    H, mask = cv.findHomography(np.float32([KP_R[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
    if H is None or mask.sum() < 15:
        return None
    return cv.perspectiveTransform(CORNERS.reshape(-1, 1, 2), H).reshape(4, 2)

N = 6
tiles, errors, found = [], [], 0
for i in range(N):
    img, gt = make_sample(BACKGROUNDS[i % 3])
    quad = detect(img)
    vis = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    cv.polylines(vis, [np.int32(gt)], True, (0, 0, 255), 2)
    if quad is None:
        print('#%d 실패' % i)
    else:
        e = float(np.linalg.norm(quad - gt, axis=1).mean())
        errors.append(e)
        found += 1
        cv.polylines(vis, [np.int32(quad)], True, (0, 255, 0), 2)
        print('#%d 성공, 꼭짓점 평균 오차 %.1f px' % (i, e))
    tiles.append(cv.resize(vis, (256, 192)))
print('재현율 %d/%d = %.2f, 성공한 것들의 평균 꼭짓점 오차 %.1f px' % (found, N, found / N, np.mean(errors) if errors else -1))
while len(tiles) % 3:
    tiles.append(np.zeros((192, 256, 3), np.uint8))
cv.imshow('synthetic tests (red=GT, green=detected)', np.vstack([np.hstack(tiles[k:k + 3]) for k in range(0, len(tiles), 3)]))
`,
      },
      {
        title: '실습 2 · evaluate() 에 클래스별 정밀도 · 재현율 추가',
        desc: `<p>스켈레톤 A 의 <code>evaluate()</code> 는 전체 정확도만 보여 줍니다. 혼동 행렬 <code>cm</code>(행 = 정답, 열 = 예측)에서 <b>숫자별 정밀도(열 기준)와 재현율(행 기준)</b>을 계산해 표로 출력하고, F1 이 가장 낮은 숫자를 알려 주도록 확장하세요. 속도를 위해 학습 1000개 · 테스트 1000개로 줄였습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def extract_features(img20):
    img = deskew(img20)
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)

cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)
labels = np.repeat(np.arange(10), 500)
tr, te = np.arange(0, 5000, 5), np.arange(2, 5000, 5)          # 1000개씩, 서로 겹치지 않게
Xtr = np.float32([extract_features(c) for c in cells[tr]])
Xte = np.float32([extract_features(c) for c in cells[te]])
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(2.67)
svm.setGamma(5.383)
svm.train(Xtr, cv.ml.ROW_SAMPLE, labels[tr].astype(np.int32))

def evaluate(model, X, y):
    pred = model.predict(X)[1].ravel().astype(int)
    cm = np.zeros((10, 10), int)
    for t, p in zip(y, pred):
        cm[t, p] += 1
    print('정확도 %.1f%%' % (100 * np.mean(pred == y)))
    # TODO 1: 숫자 d 마다 precision = cm[d, d] / cm[:, d].sum(), recall = cm[d, d] / cm[d, :].sum(), f1 을 계산해 표로 출력
    # TODO 2: F1 이 가장 낮은 숫자와, 그 숫자를 가장 많이 헷갈린 다른 숫자(행에서 대각선 제외 최댓값)를 출력
    return cm

cm = evaluate(svm, Xte, labels[te])
`,
        hint: `<p><code>col = cm[:, d].sum()</code> 가 0 이면 정밀도는 0 으로 처리하세요. 헷갈린 숫자는 <code>row = cm[d].copy(); row[d] = 0; int(row.argmax())</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def extract_features(img20):
    img = deskew(img20)
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)

cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)
labels = np.repeat(np.arange(10), 500)
tr, te = np.arange(0, 5000, 5), np.arange(2, 5000, 5)
Xtr = np.float32([extract_features(c) for c in cells[tr]])
Xte = np.float32([extract_features(c) for c in cells[te]])
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(2.67)
svm.setGamma(5.383)
svm.train(Xtr, cv.ml.ROW_SAMPLE, labels[tr].astype(np.int32))

def evaluate(model, X, y):
    pred = model.predict(X)[1].ravel().astype(int)
    cm = np.zeros((10, 10), int)
    for t, p in zip(y, pred):
        cm[t, p] += 1
    print('정확도 %.1f%%' % (100 * np.mean(pred == y)))
    print('숫자  정밀도  재현율    F1')
    f1s = []
    for d in range(10):
        col, row = cm[:, d].sum(), cm[d, :].sum()
        p = cm[d, d] / col if col else 0.0
        r = cm[d, d] / row if row else 0.0
        f1 = 2 * p * r / (p + r) if p + r else 0.0
        f1s.append(f1)
        print('  %d    %.3f   %.3f  %.3f' % (d, p, r, f1))
    worst = int(np.argmin(f1s))
    row = cm[worst].copy()
    row[worst] = 0
    print('F1 최저: 숫자 %d (F1 %.3f) — 가장 많이 %d 로 잘못 예측 (%d번)' % (worst, f1s[worst], int(row.argmax()), row.max()))
    return cm

cm = evaluate(svm, Xte, labels[te])
`,
      },
    ],
    quiz: [
      { q: '증강 복사본을 만든 뒤 무작위로 학습/테스트를 나누면 생기는 문제는?', options: ['테스트 이미지의 거의 똑같은 쌍둥이가 학습에 들어가 정확도가 실제보다 높게 나온다', '학습이 느려진다', '테스트 정확도가 항상 0 이 된다', '라벨이 사라진다'], answer: 0, explain: '데이터 누수입니다. 원본(그룹) 단위로 먼저 나눈 뒤 학습 쪽만 증강해야 처음 보는 입력에 대한 성능을 정직하게 잴 수 있습니다.' },
      { q: '매칭형 상품 인식 프로젝트의 테스트 세트에 “상품이 없는 사진”을 꼭 넣어야 하는 이유는?', options: ['사진 수를 늘리려고', '헛검출(FP)을 측정해 정밀도를 계산하려고', '학습 속도를 높이려고', '기준 사진으로 쓰려고'], answer: 1, explain: '상품이 있는 사진만 있으면 “항상 찾았다”고 답하는 인식기도 높은 점수를 받습니다. 없는 사진이 있어야 FP 를 세어 정밀도를 알 수 있습니다.' },
      { q: '요구사항을 “확인 가능한 문장”으로 가장 잘 쓴 것은?', options: ['테스트 60장(5종 × 12장)에서 정확도 90% 이상, process 평균 150 ms 이하', '표지판을 잘 분류한다', '빠르게 동작한다', '사용자가 만족한다'], answer: 0, explain: '지표(정확도 · ms), 목표값(90% · 150 ms), 테스트 세트(60장)가 모두 있어 누구나 같은 방법으로 확인할 수 있습니다.' },
      { q: '스켈레톤 코드에서 이미지 실행과 process(frame) 이 같은 detect · visualize 함수를 쓰도록 만드는 가장 큰 이점은?', options: ['코드 줄 수가 늘어난다', 'process 가 더 느려진다', '사진으로 평가한 성능과 실시간 데모의 동작이 같아 결과를 믿을 수 있고 수정도 한 곳에서 끝난다', '팀원이 서로 다른 코드를 쓸 수 있다'], answer: 2, explain: '평가용 코드와 데모 코드가 다르면 “평가에서는 되는데 데모에서는 안 되는” 일이 생깁니다. 같은 함수를 쓰면 한 번 고치면 양쪽이 함께 좋아집니다.' },
    ],
  },

  // =====================================================================
  // a4-8 프로토타입 만들기
  // =====================================================================
  {
    id: 'a4-8',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg', 'images/adv/graf3.jpg', 'images/adv/digits.png'],
    summary: '팀 프로젝트의 최소 기능 제품(MVP)을 끝에서 끝까지 한 번 돌게 만들고, 고정된 테스트 세트로 기준선(baseline) 성능을 숫자로 측정합니다. 상품 인식기(ORB 매칭)와 손글씨 인식기(HOG + SVM)를 예로 결과표 · 정밀도 · 재현율 · 처리 시간 · 혼동 행렬을 만들고, 실패 사례 갤러리와 실험 기록표로 “다음에 무엇을 고칠지”를 정한 뒤 중간 점검과 동료 피드백을 진행합니다.',
    goals: [
      '입력부터 결과 표시까지 한 번에 도는 MVP 를 30분 안에 만들 수 있다',
      '정답이 있는 테스트 세트로 정확도 · 정밀도 · 재현율 · 처리 시간을 측정해 기준선 표를 만들 수 있다',
      '실패한 입력을 모아 갤러리로 보고 원인 단계를 추정할 수 있다',
      '파라미터를 하나씩 바꾸는 실험을 기록해 기준선과 비교하고, 동료 피드백으로 다음 목표를 정할 수 있다',
    ],
    schedule: [['도입 · MVP 와 기준선', 5], ['예제: 상품 인식 기준선', 15], ['실패 갤러리 · 실험 기록', 10], ['팀 작업: 프로토타입', 10], ['중간 점검 · 동료 피드백', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. MVP 와 기준선(baseline)</h3>
<p><b>MVP(Minimum Viable Product)</b>는 “가장 얇은 끝에서 끝까지”입니다. 입력 → 특징 · 검출 → 검증 → 출력이 <b>품질은 낮아도 한 번에</b> 돌아가야 합니다. 부분 부분을 완벽하게 만들다가 마지막에 연결하면 반드시 늦습니다.</p>
<p>심화 프로젝트에서는 MVP 가 돌자마자 <b>기준선(baseline)</b>을 잽니다. 기준선은 “아무 튜닝도 하지 않은 첫 버전의 점수”이고, 5주차의 모든 개선은 이 숫자와 비교합니다.</p>
<ul>
<li>발표에서 가장 설득력 있는 문장: <b>“기준선 정확도 67% → 최종 92%, 처리 시간 180 ms → 90 ms”</b></li>
<li>기준선이 없으면 튜닝이 효과가 있었는지 <b>알 수 없습니다</b></li>
<li>테스트 세트는 a4-7 에서 정한 것을 <b>고정</b>해서 씁니다</li>
</ul>` },
      { type: 'table', head: ['시간 (오늘)', '할 일', '끝났다는 기준'], rows: [
        ['0~10분', '스켈레톤 복사 → 입력 · 기준 데이터 연결', '내 데이터 1장으로 오류 없이 실행'],
        ['10~25분', '가장 단순한 detect / classify 구현 (MVP)', '결과가 화면에 그려짐 (틀려도 됨)'],
        ['25~35분', '테스트 세트 전체로 evaluate → 기준선 표', '정확도 · 정밀도 · 재현율 · ms 출력'],
        ['35~45분', '실패 갤러리 · 원인 추정 · 다음 실험 1개', '실패 기록표 3줄 이상'],
        ['45~50분', '중간 점검 · 동료 피드백', '피드백 폼 작성'],
      ] },
      { type: 'text', html: `<h3>2. 예제 프로토타입: 상품 인식기</h3>
<p>기준 상품 2개(<code>box.png</code>, <code>graf1.jpg</code>)를 장면에서 알아보는 인식기입니다. 먼저 <b>20줄짜리 v0</b> 로 끝에서 끝까지 돌려 봅니다.</p>` },
      { type: 'code', title: '예제 1 · 프로토타입 v0: 20줄짜리 끝에서 끝까지', code: String.raw`
import cv2 as cv
import numpy as np

orb = cv.ORB_create(1000)
ref = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png')
kr, dr = orb.detectAndCompute(ref, None)
ks, ds = orb.detectAndCompute(cv.cvtColor(scene, cv.COLOR_BGR2GRAY), None)
good = [p[0] for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(dr, ds, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
H, mask = cv.findHomography(np.float32([kr[m.queryIdx].pt for m in good]), np.float32([ks[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
inliers = int(mask.sum())
found = inliers >= 15
print('좋은 매칭 %d, 인라이어 %d → %s' % (len(good), inliers, 'FOUND' if found else 'NOT FOUND'))
out = scene.copy()
if found:
    h, w = ref.shape
    quad = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H)
    cv.polylines(out, [np.int32(quad)], True, (0, 255, 0), 3)
cv.putText(out, 'v0: %s (%d)' % ('box' if found else 'none', inliers), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
cv.imshow('prototype v0', out)
`, desc: '<p>v0 는 이미지 한 장, 기준 한 개, 함수도 없습니다. 그래도 <b>끝까지 돈다</b>는 것이 중요합니다. 이제 스켈레톤 구조로 옮기고 여러 입력으로 평가합니다.</p>' },
      { type: 'text', html: `<h3>3. 기준선 측정: 테스트 세트 결과표</h3>
<p>정답을 아는 테스트 세트를 만듭니다. 실제 프로젝트는 직접 찍은 사진을 쓰고, 여기서는 샘플 사진에 <b>조건 변화(회전 · 축소 · 어둡게 · 블러 · 잡음 · 기울임)</b>를 주어 만듭니다. <b>물체가 없는 사진</b>도 반드시 넣습니다.</p>
<ul>
<li>행마다: 이름 · 정답 · 예측 · 인라이어 · 시간(ms) · 맞음/틀림</li>
<li>요약: <b>정확도</b>(전체 중 맞힌 비율), <b>정밀도</b>(“찾았다” 중 맞은 비율), <b>재현율</b>(물체가 있는 사진 중 맞게 찾은 비율), <b>평균 ms</b></li>
</ul>` },
      { type: 'code', title: '예제 2 · 기준선 측정: 12장 테스트 세트 결과표', code: String.raw`
import cv2 as cv
import numpy as np
import time

CONFIG = {'nfeatures': 1000, 'ratio': 0.75, 'min_inliers': 15}

def half(img):
    return cv.resize(img, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)

def make_test_set():
    """(이름, 이미지, 정답) — 정답 None = 물체 없음"""
    scene = cv.imread('box_in_scene.png')
    h, w = scene.shape[:2]
    rot = lambda im, a, s=1.0: cv.warpAffine(im, cv.getRotationMatrix2D((im.shape[1] / 2, im.shape[0] / 2), a, s), (im.shape[1], im.shape[0]))
    tilt = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32([[w * 0.3, 0], [w * 0.7, 0], [w, h], [0, h]]))
    noise = np.random.default_rng(0).normal(0, 25, scene.shape)
    return [
        ('box original', scene, 'box'),
        ('box rotate 45', rot(scene, 45), 'box'),
        ('box small x0.5', half(scene), 'box'),
        ('box dark', cv.convertScaleAbs(scene, alpha=0.35), 'box'),
        ('box blur', cv.GaussianBlur(scene, (0, 0), 2.5), 'box'),
        ('box noise', np.clip(scene + noise, 0, 255).astype(np.uint8), 'box'),
        ('box tilt', cv.warpPerspective(scene, tilt, (w, h)), 'box'),
        ('graf view 3', half(cv.imread('graf3.jpg')), 'graf'),
        ('graf rotate 90', rot(half(cv.imread('graf1.jpg')), 90, 0.8), 'graf'),
        ('none lena', cv.resize(cv.imread('lena.jpg'), (384, 384)), None),
        ('none messi', cv.imread('messi5.jpg'), None),
        ('none home', cv.imread('home.jpg'), None),
    ]

ORB = cv.ORB_create(nfeatures=CONFIG['nfeatures'])
BF = cv.BFMatcher(cv.NORM_HAMMING)
DB = {}
for name, img in [('box', cv.imread('box.png')), ('graf', half(cv.imread('graf1.jpg')))]:
    DB[name] = ORB.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)

def recognize(img, cfg):
    kp, des = ORB.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    best, best_n = None, 0
    if des is None or len(kp) < 10:
        return None, 0
    for name, (kr, dr) in DB.items():
        good = [p[0] for p in BF.knnMatch(dr, des, k=2) if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < 8:
            continue
        H, mask = cv.findHomography(np.float32([kr[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
        n = 0 if H is None else int(mask.sum())
        if n > best_n:
            best, best_n = name, n
    return (best if best_n >= cfg['min_inliers'] else None), best_n

tests = make_test_set()
rows = []
print('%-16s %-5s %-5s %5s %6s' % ('test', 'true', 'pred', 'inl', 'ms'))
for name, img, truth in tests:
    t = time.perf_counter()
    pred, n = recognize(img, CONFIG)
    ms = (time.perf_counter() - t) * 1000
    rows.append((name, truth, pred, n, ms))
    print('%-16s %-5s %-5s %5d %6.1f  %s' % (name, truth, pred, n, ms, 'O' if pred == truth else 'X  <-- 실패'))

correct = sum(r[1] == r[2] for r in rows)
tp = sum(r[2] is not None and r[2] == r[1] for r in rows)
fp = sum(r[2] is not None and r[2] != r[1] for r in rows)
positives = sum(r[1] is not None for r in rows)
ms_mean = np.mean([r[4] for r in rows])
BASELINE = {'accuracy': correct / len(rows), 'precision': tp / max(1, tp + fp), 'recall': tp / positives, 'ms': ms_mean}
print('\n[기준선 v1] 정확도 %d/%d = %.2f | 정밀도 %.2f | 재현율 %.2f | 평균 %.0f ms' % (correct, len(rows), BASELINE['accuracy'], BASELINE['precision'], BASELINE['recall'], ms_mean))
print('CONFIG =', CONFIG)
`, desc: '<p>헛검출(물체 없는 사진에서 찾음)은 없어 <b>정밀도는 1.0</b> 이지만, 작게 · 흐리게 · 기울어진 상자를 놓쳐 <b>재현율이 낮습니다</b>. 이 콘솔 출력(표 + 요약 한 줄 + CONFIG)을 그대로 복사해 팀 문서의 “실험 기록”에 붙여 두세요.</p>' },
      { type: 'code', title: '예제 3 · 실패 사례 갤러리 만들기 + 저장', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'nfeatures': 1000, 'ratio': 0.75, 'min_inliers': 15}
def half(img):
    return cv.resize(img, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)
def make_test_set():
    scene = cv.imread('box_in_scene.png')
    h, w = scene.shape[:2]
    rot = lambda im, a, s=1.0: cv.warpAffine(im, cv.getRotationMatrix2D((im.shape[1] / 2, im.shape[0] / 2), a, s), (im.shape[1], im.shape[0]))
    tilt = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32([[w * 0.3, 0], [w * 0.7, 0], [w, h], [0, h]]))
    noise = np.random.default_rng(0).normal(0, 25, scene.shape)
    return [('box original', scene, 'box'), ('box rotate 45', rot(scene, 45), 'box'), ('box small x0.5', half(scene), 'box'),
            ('box dark', cv.convertScaleAbs(scene, alpha=0.35), 'box'), ('box blur', cv.GaussianBlur(scene, (0, 0), 2.5), 'box'),
            ('box noise', np.clip(scene + noise, 0, 255).astype(np.uint8), 'box'), ('box tilt', cv.warpPerspective(scene, tilt, (w, h)), 'box'),
            ('graf view 3', half(cv.imread('graf3.jpg')), 'graf'), ('graf rotate 90', rot(half(cv.imread('graf1.jpg')), 90, 0.8), 'graf'),
            ('none lena', cv.resize(cv.imread('lena.jpg'), (384, 384)), None), ('none messi', cv.imread('messi5.jpg'), None), ('none home', cv.imread('home.jpg'), None)]
ORB = cv.ORB_create(nfeatures=CONFIG['nfeatures'])
BF = cv.BFMatcher(cv.NORM_HAMMING)
DB = {name: ORB.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None) for name, img in [('box', cv.imread('box.png')), ('graf', half(cv.imread('graf1.jpg')))]}
def recognize(img, cfg):
    kp, des = ORB.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    best, best_n, n_kp = None, 0, len(kp)
    if des is None or n_kp < 10:
        return None, 0, n_kp
    for name, (kr, dr) in DB.items():
        good = [p[0] for p in BF.knnMatch(dr, des, k=2) if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < 8:
            continue
        H, mask = cv.findHomography(np.float32([kr[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
        n = 0 if H is None else int(mask.sum())
        if n > best_n:
            best, best_n = name, n
    return (best if best_n >= cfg['min_inliers'] else None), best_n, n_kp

# ---- 실패 모으기: 틀린 것 + 아슬아슬하게 맞은 것(인라이어가 기준의 2배 미만) ----
gallery = []
for name, img, truth in make_test_set():
    pred, n, n_kp = recognize(img, CONFIG)
    wrong = pred != truth
    close = (not wrong) and truth is not None and n < 2 * CONFIG['min_inliers']
    if wrong or close:
        kind = 'FAIL' if wrong else 'CLOSE'
        print('%-5s %-16s 정답=%s 예측=%s 인라이어=%d 장면 특징점=%d' % (kind, name, truth, pred, n, n_kp))
        tile = cv.resize(img, (240, 180))
        cv.rectangle(tile, (0, 0), (239, 52), (0, 0, 0), -1)
        cv.putText(tile, '%s: %s' % (kind, name), (5, 18), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255) if wrong else (0, 255, 255), 1)
        cv.putText(tile, 'true=%s pred=%s' % (truth, pred), (5, 34), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        cv.putText(tile, 'inliers=%d  kp=%d' % (n, n_kp), (5, 49), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        gallery.append(tile)

if gallery:
    while len(gallery) % 3:
        gallery.append(np.zeros((180, 240, 3), np.uint8))
    sheet = np.vstack([np.hstack(gallery[i:i + 3]) for i in range(0, len(gallery), 3)])
    cv.imshow('failure gallery', sheet)
    cv.imwrite('failures_v1.png', sheet)
else:
    print('실패 없음 — 테스트 세트가 너무 쉬운지 의심해 보세요!')
`, desc: '<p>갤러리를 보며 “어느 단계에서 실패했나?”를 추정합니다. <b>장면 특징점 수(kp)</b>가 적으면 ② 특징 단계(블러 · 축소로 코너가 사라짐), 특징점은 많은데 인라이어가 적으면 ③ 매칭 단계(ORB 의 원근 · 크기 변화 한계)입니다. <b>아슬아슬하게 맞은 것(CLOSE)</b>도 다음에 실패할 후보입니다.</p>' },
      { type: 'table', head: ['입력', '기대 → 결과', '증상 (본 것)', '원인 단계 추정', '다음에 시도할 것'], rows: [
        ['box small x0.5', 'box → none', '장면 특징점은 있으나 인라이어 0', '③ 매칭: 기준(324px)과 크기 차이가 커 ORB 스케일 범위 밖', '기준 사진을 여러 크기로 등록, SIFT 재시도'],
        ['box blur', 'box → none', '인라이어 거의 없음', '② 특징: 블러로 FAST 코너 소실', '샤프닝 전처리, fastThreshold 낮추기, SIFT'],
        ['box tilt', 'box → none', '인라이어 거의 없음', '③ 매칭: 큰 원근 변화에 ORB 기술자 약함', '기울인 기준 사진 추가, AKAZE/SIFT 비교'],
        ['(우리 팀 입력)', '? → ?', '', '', ''],
      ] },
      { type: 'text', html: `<h3>4. 학습형 기준선: 손글씨 인식기</h3>
<p>학습형 프로젝트의 기준선은 <b>정확도 한 숫자로 끝내지 않습니다</b>. 혼동 행렬(confusion matrix)을 그려 <b>어떤 클래스끼리 헷갈리는지</b> 확인해야 다음 실험(데이터 추가 · 특징 변경)을 정할 수 있습니다. 그래프 제목 · 라벨은 영어로 씁니다.</p>` },
      { type: 'code', title: '예제 4 · 학습형 기준선: 손글씨 정확도 · 혼동 행렬 · 헷갈리는 쌍', code: String.raw`
import cv2 as cv
import numpy as np
import time
from matplotlib import pyplot as plt

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def features(img):
    img = deskew(img)
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)

t0 = time.perf_counter()
cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)
labels = np.repeat(np.arange(10), 500)
col = np.tile(np.arange(100), 50)
keep = col % 2 == 0                                # 브라우저 속도를 위해 짝수 열만 (2500장)
cells, labels, col = cells[keep], labels[keep], col[keep]
train, test = col < 50, col >= 50                  # 왼쪽 절반 열 = 학습, 오른쪽 절반 = 테스트 (튜토리얼과 같은 방식)
X = np.float32([features(c) for c in cells])
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(2.67)
svm.setGamma(5.383)
svm.train(X[train], cv.ml.ROW_SAMPLE, labels[train].astype(np.int32))
pred = svm.predict(X[test])[1].ravel().astype(int)
y = labels[test]
print('학습 %d / 테스트 %d, 총 %.0f ms' % (train.sum(), test.sum(), (time.perf_counter() - t0) * 1000))

cm = np.zeros((10, 10), int)
for t, p in zip(y, pred):
    cm[t, p] += 1
print('[기준선] 정확도 %.2f%%' % (100 * np.mean(pred == y)))
print('숫자별 재현율:', ' '.join('%d:%.0f%%' % (d, 100 * cm[d, d] / cm[d].sum()) for d in range(10)))

off = cm.copy()
np.fill_diagonal(off, 0)
pairs = sorted(((off[t, p], t, p) for t in range(10) for p in range(10) if off[t, p] > 0), reverse=True)[:5]
print('가장 헷갈린 쌍 (정답 → 예측, 횟수):', [(int(t), int(p), int(n)) for n, t, p in pairs])

plt.figure(figsize=(5, 4.5))
plt.imshow(off, cmap='Reds')
plt.colorbar(label='count')
plt.xticks(range(10))
plt.yticks(range(10))
plt.xlabel('predicted')
plt.ylabel('true')
plt.title('Confusion (errors only), acc=%.1f%%' % (100 * np.mean(pred == y)))
for t in range(10):
    for p in range(10):
        if off[t, p]:
            plt.text(p, t, str(off[t, p]), ha='center', va='center', fontsize=8)
plt.tight_layout()
plt.show()
`, desc: '<p>대각선(맞힌 것)은 너무 커서 오류가 안 보이므로 <b>대각선을 0으로 지운 혼동 행렬</b>을 그렸습니다. 진한 칸이 “다음 실험의 목표”입니다. 예를 들어 7→1 이 많다면 7 의 가로획 특징이 약한 것이므로 셀 분할(2×2 → 3×3)이나 데이터 추가를 실험합니다.</p>' },
      { type: 'text', html: `<h3>5. 실험 기록: 한 번에 하나만 바꾸기</h3>
<p>기준선을 잰 뒤에는 <b>파라미터 하나만</b> 바꿔 같은 테스트 세트로 다시 잽니다. 두세 개를 한꺼번에 바꾸면 무엇이 효과였는지 알 수 없습니다. 무거운 계산(특징점 · 매칭)은 <b>한 번만</b> 하고, 판정 기준만 바꾸는 실험은 캐시해서 빠르게 돌립니다.</p>` },
      { type: 'code', title: '예제 5 · 실험 기록표: 비율 테스트 · 인라이어 기준 바꿔 보기', code: String.raw`
import cv2 as cv
import numpy as np

BASE = {'ratio': 0.75, 'min_inliers': 15}
EXPERIMENTS = [('baseline', {}), ('ratio 0.8', {'ratio': 0.8}), ('ratio 0.85', {'ratio': 0.85}),
               ('min_inl 10', {'min_inliers': 10}), ('min_inl 8', {'min_inliers': 8}), ('ratio 0.85 + min 8', {'ratio': 0.85, 'min_inliers': 8})]

def half(img):
    return cv.resize(img, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)
def make_test_set():
    scene = cv.imread('box_in_scene.png')
    h, w = scene.shape[:2]
    rot = lambda im, a, s=1.0: cv.warpAffine(im, cv.getRotationMatrix2D((im.shape[1] / 2, im.shape[0] / 2), a, s), (im.shape[1], im.shape[0]))
    tilt = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32([[w * 0.3, 0], [w * 0.7, 0], [w, h], [0, h]]))
    noise = np.random.default_rng(0).normal(0, 25, scene.shape)
    return [('box original', scene, 'box'), ('box rotate 45', rot(scene, 45), 'box'), ('box small x0.5', half(scene), 'box'),
            ('box dark', cv.convertScaleAbs(scene, alpha=0.35), 'box'), ('box blur', cv.GaussianBlur(scene, (0, 0), 2.5), 'box'),
            ('box noise', np.clip(scene + noise, 0, 255).astype(np.uint8), 'box'), ('box tilt', cv.warpPerspective(scene, tilt, (w, h)), 'box'),
            ('graf view 3', half(cv.imread('graf3.jpg')), 'graf'), ('graf rotate 90', rot(half(cv.imread('graf1.jpg')), 90, 0.8), 'graf'),
            ('none lena', cv.resize(cv.imread('lena.jpg'), (384, 384)), None), ('none messi', cv.imread('messi5.jpg'), None), ('none home', cv.imread('home.jpg'), None)]

ORB = cv.ORB_create(nfeatures=1000)
BF = cv.BFMatcher(cv.NORM_HAMMING)
DB = {name: ORB.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None) for name, img in [('box', cv.imread('box.png')), ('graf', half(cv.imread('graf1.jpg')))]}

# ---- 무거운 부분은 한 번만: 테스트마다 (기준별 knn 매칭 결과) 캐시 ----
CACHE = []
for name, img, truth in make_test_set():
    kp, des = ORB.detectAndCompute(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    pairs = {ref: (BF.knnMatch(dr, des, k=2) if des is not None else []) for ref, (kr, dr) in DB.items()}
    CACHE.append((name, truth, kp, pairs))

def run(cfg):
    rows = []
    for name, truth, kp, pairs in CACHE:
        best, best_n = None, 0
        for ref, knn in pairs.items():
            kr = DB[ref][0]
            good = [p[0] for p in knn if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
            if len(good) < 6:
                continue
            H, mask = cv.findHomography(np.float32([kr[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
            n = 0 if H is None else int(mask.sum())
            if n > best_n:
                best, best_n = ref, n
        pred = best if best_n >= cfg['min_inliers'] else None
        rows.append((truth, pred))
    tp = sum(p is not None and p == t for t, p in rows)
    fp = sum(p is not None and p != t for t, p in rows)
    pos = sum(t is not None for t, p in rows)
    return np.mean([t == p for t, p in rows]), tp / max(1, tp + fp), tp / pos

print('%-20s %6s %6s %6s   %s' % ('experiment', 'acc', 'prec', 'recall', 'vs baseline'))
base_acc = None
for label, change in EXPERIMENTS:
    cfg = dict(BASE, **change)
    acc, prec, rec = run(cfg)
    if base_acc is None:
        base_acc = acc
    print('%-20s %6.2f %6.2f %6.2f   %+.2f' % (label, acc, prec, rec, acc - base_acc))
print('※ 재현율이 오르는지, 대신 정밀도(헛검출)가 떨어지는지 함께 보세요.')
`, desc: '<p>결과를 보면 판정 기준을 느슨하게 해도 <b>재현율은 그대로</b>이고, 너무 느슨하게 하면 물체 없는 사진에서 “찾았다”고 해 <b>정밀도만 떨어집니다</b>. 실패한 사진은 인라이어가 0~4 개라 기준 문제가 아니었던 것이죠. “효과 없음”도 중요한 결과입니다 — <b>판정 단계가 아니라 특징 · 매칭 단계를 바꿔야 한다</b>는 결론이 나옵니다(→ 실습 1). 표 전체를 실험 기록에 붙이고 결론을 한 줄로 적으세요.</p>' },
      { type: 'checklist', title: '중간 점검 (교시 끝나기 10분 전)', items: [
        'MVP 가 팀 데이터 1장 이상에서 끝에서 끝까지 오류 없이 돈다',
        '고정된 테스트 세트(물체 없는 사진 · 어려운 조건 포함)가 준비되어 있다',
        '기준선 표: 정확도(또는 정밀도 · 재현율 / mm 오차) + 평균 ms 가 기록되었다',
        '실패 사례 갤러리 이미지와 실패 기록표 3줄 이상이 있다',
        '다음 교시(a5-1)에 시도할 실험 1~2개와 담당자가 정해졌다',
        '코드를 prototype_v1.py 로 저장하고 실험 기록에 CONFIG 를 남겼다',
      ] },
      { type: 'text', html: `<h3>6. 동료 피드백</h3>
<p>옆 팀과 짝을 지어 <b>3분 데모 + 2분 피드백</b>을 교대로 합니다. 데모하는 팀은 기준선 숫자와 실패 갤러리를 반드시 보여 주고, 듣는 팀은 아래 폼을 채워 전달합니다. 비판보다 <b>“다음에 무엇을 해 보면 좋을지”</b>를 구체적으로 말해 주세요.</p>` },
      { type: 'table', head: ['항목', '질문', '점수 (1~5)', '한 줄 코멘트'], rows: [
        ['문제 · 가치', '무엇을 왜 만드는지 한 문장으로 이해됐나?', '', ''],
        ['기술 결합', '두 가지 이상 기법이 목적에 맞게 연결됐나? 검증 단계가 있나?', '', ''],
        ['데이터 · 지표', '테스트 세트가 공정한가(없는 사진 · 어려운 조건 · 누수 없음)? 지표가 주제에 맞나?', '', ''],
        ['기준선 · 실패 분석', '숫자가 있고, 실패 원인을 단계별로 추정했나?', '', ''],
        ['실현 가능성', '남은 1주에 목표를 달성할 수 있어 보이나? 범위를 줄여야 하나?', '', ''],
        ['가장 좋았던 점 / 한 가지 제안', '', '', ''],
      ] },
      { type: 'tip', html: `<p><b>실험 기록 습관</b>: 한 줄에 <code>날짜 · 버전 · 바꾼 것 · 정확도/정밀도/재현율 · ms · 결론</code>. 예) <code>a4-8 · v1 · baseline(ORB1000, r0.75, inl15) · 0.75/1.00/0.67 · 45ms · 작은 상자 놓침</code>. 발표의 “개선 과정” 슬라이드가 이 기록에서 바로 나옵니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 실패 개선: ORB 가 못 찾으면 SIFT 로 다시 시도',
        desc: `<p>ORB 는 빠르지만 작거나 흐리거나 기울어진 상자를 놓쳤습니다. <b>ORB 결과가 None 일 때만 SIFT 로 다시 시도</b>하는 2단계(cascade) 인식기를 만들고, 7장 테스트에서 ORB 단독과 비교해 <b>정확도 · 재현율 · 정밀도 · 평균 ms</b>를 출력하세요. SIFT 는 느리므로 “실패했을 때만” 쓰는 것이 핵심입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time

def half(img):
    return cv.resize(img, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)
scene = cv.imread('box_in_scene.png')
h, w = scene.shape[:2]
tilt = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32([[w * 0.3, 0], [w * 0.7, 0], [w, h], [0, h]]))
TESTS = [('box original', scene, 'box'), ('box small x0.5', half(scene), 'box'), ('box blur', cv.GaussianBlur(scene, (0, 0), 2.5), 'box'),
         ('box tilt', cv.warpPerspective(scene, tilt, (w, h)), 'box'), ('graf view 3', half(cv.imread('graf3.jpg')), 'graf'),
         ('none lena', cv.resize(cv.imread('lena.jpg'), (256, 256)), None), ('none messi', half(cv.imread('messi5.jpg')), None)]
REFS = {'box': cv.imread('box.png', cv.IMREAD_GRAYSCALE), 'graf': cv.cvtColor(half(cv.imread('graf1.jpg')), cv.COLOR_BGR2GRAY)}

def make_recognizer(detector, norm, min_inliers=15):
    db = {name: detector.detectAndCompute(img, None) for name, img in REFS.items()}
    bf = cv.BFMatcher(norm)
    def recognize(gray):
        kp, des = detector.detectAndCompute(gray, None)
        best, best_n = None, 0
        if des is None or len(kp) < 10:
            return None
        for name, (kr, dr) in db.items():
            good = [p[0] for p in bf.knnMatch(dr, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
            if len(good) < 8:
                continue
            H, mask = cv.findHomography(np.float32([kr[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
            n = 0 if H is None else int(mask.sum())
            if n > best_n:
                best, best_n = name, n
        return best if best_n >= min_inliers else None
    return recognize

orb_recognize = make_recognizer(cv.ORB_create(nfeatures=1000), cv.NORM_HAMMING)
# TODO 1: SIFT 인식기를 만드세요 (cv.SIFT_create(), cv.NORM_L2)
sift_recognize = None

def cascade(gray):
    pred = orb_recognize(gray)
    # TODO 2: pred 가 None 이면 sift_recognize 로 다시 시도하세요
    return pred

def evaluate(fn, label):
    rows, times = [], []
    for name, img, truth in TESTS:
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        t = time.perf_counter()
        pred = fn(gray)
        times.append((time.perf_counter() - t) * 1000)
        rows.append((truth, pred))
    tp = sum(p is not None and p == t for t, p in rows)
    fp = sum(p is not None and p != t for t, p in rows)
    pos = sum(t is not None for t, p in rows)
    print('%-12s 정확도 %.2f  정밀도 %.2f  재현율 %.2f  평균 %.0f ms  예측 %s' % (label, np.mean([t == p for t, p in rows]), tp / max(1, tp + fp), tp / pos, np.mean(times), [p for t, p in rows]))

evaluate(orb_recognize, 'ORB only')
evaluate(cascade, 'ORB -> SIFT')
`,
        hint: `<p><code>sift_recognize = make_recognizer(cv.SIFT_create(), cv.NORM_L2)</code>, <code>if pred is None: pred = sift_recognize(gray)</code>. 물체가 없는 사진도 ORB 가 None 을 내므로 SIFT 가 돌아 시간이 늘어납니다. “정확도 향상 vs 시간 증가”를 함께 보고 채택 여부를 정하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time

def half(img):
    return cv.resize(img, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)
scene = cv.imread('box_in_scene.png')
h, w = scene.shape[:2]
tilt = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32([[w * 0.3, 0], [w * 0.7, 0], [w, h], [0, h]]))
TESTS = [('box original', scene, 'box'), ('box small x0.5', half(scene), 'box'), ('box blur', cv.GaussianBlur(scene, (0, 0), 2.5), 'box'),
         ('box tilt', cv.warpPerspective(scene, tilt, (w, h)), 'box'), ('graf view 3', half(cv.imread('graf3.jpg')), 'graf'),
         ('none lena', cv.resize(cv.imread('lena.jpg'), (256, 256)), None), ('none messi', half(cv.imread('messi5.jpg')), None)]
REFS = {'box': cv.imread('box.png', cv.IMREAD_GRAYSCALE), 'graf': cv.cvtColor(half(cv.imread('graf1.jpg')), cv.COLOR_BGR2GRAY)}

def make_recognizer(detector, norm, min_inliers=15):
    db = {name: detector.detectAndCompute(img, None) for name, img in REFS.items()}
    bf = cv.BFMatcher(norm)
    def recognize(gray):
        kp, des = detector.detectAndCompute(gray, None)
        best, best_n = None, 0
        if des is None or len(kp) < 10:
            return None
        for name, (kr, dr) in db.items():
            good = [p[0] for p in bf.knnMatch(dr, des, k=2) if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
            if len(good) < 8:
                continue
            H, mask = cv.findHomography(np.float32([kr[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
            n = 0 if H is None else int(mask.sum())
            if n > best_n:
                best, best_n = name, n
        return best if best_n >= min_inliers else None
    return recognize

orb_recognize = make_recognizer(cv.ORB_create(nfeatures=1000), cv.NORM_HAMMING)
sift_recognize = make_recognizer(cv.SIFT_create(), cv.NORM_L2)

def cascade(gray):
    pred = orb_recognize(gray)
    if pred is None:                     # 빠른 ORB 가 실패했을 때만 느린 SIFT
        pred = sift_recognize(gray)
    return pred

def evaluate(fn, label):
    rows, times = [], []
    for name, img, truth in TESTS:
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        t = time.perf_counter()
        pred = fn(gray)
        times.append((time.perf_counter() - t) * 1000)
        rows.append((truth, pred))
    tp = sum(p is not None and p == t for t, p in rows)
    fp = sum(p is not None and p != t for t, p in rows)
    pos = sum(t is not None for t, p in rows)
    print('%-12s 정확도 %.2f  정밀도 %.2f  재현율 %.2f  평균 %.0f ms  예측 %s' % (label, np.mean([t == p for t, p in rows]), tp / max(1, tp + fp), tp / pos, np.mean(times), [p for t, p in rows]))

evaluate(orb_recognize, 'ORB only')
evaluate(cascade, 'ORB -> SIFT')
`,
      },
      {
        title: '실습 2 · 헷갈리는 쌍 갤러리 만들기 (학습형)',
        desc: `<p>예제 4 의 혼동 행렬에서 <b>가장 많이 헷갈린 쌍 3개</b>(정답 → 예측)를 찾고, 각 쌍마다 실제로 틀린 테스트 이미지를 <b>최대 8장</b>씩 한 줄로 보여 주세요(3배 확대, 줄 앞에 “7&gt;1” 같은 라벨). 이 갤러리를 보고 “사람이 봐도 헷갈리는지 / 전처리 문제인지”를 한 줄로 print 하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def features(img):
    img = deskew(img)
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)

cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)
labels = np.repeat(np.arange(10), 500)
col = np.tile(np.arange(100), 50)
keep = col % 2 == 0                                # 속도를 위해 짝수 열만 (2500장)
cells, labels, col = cells[keep], labels[keep], col[keep]
train, test = col < 50, col >= 50
X = np.float32([features(c) for c in cells])
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(2.67)
svm.setGamma(5.383)
svm.train(X[train], cv.ml.ROW_SAMPLE, labels[train].astype(np.int32))
pred = svm.predict(X[test])[1].ravel().astype(int)
y, test_cells = labels[test], cells[test]

cm = np.zeros((10, 10), int)
for t, p in zip(y, pred):
    cm[t, p] += 1
np.fill_diagonal(cm, 0)

# TODO 1: cm 에서 값이 가장 큰 (정답, 예측) 쌍 3개를 찾으세요 (np.argsort(cm.ravel())[::-1][:3], divmod(i, 10))
top_pairs = [(4, 9)]

rows = []
for t, p in top_pairs:
    idx = np.where((y == t) & (pred == p))[0][:8]
    row = np.zeros((60, 60 * 9), np.uint8)
    cv.putText(row, '%d>%d' % (t, p), (5, 38), cv.FONT_HERSHEY_SIMPLEX, 0.7, 255, 2)
    # TODO 2: idx 의 각 이미지를 60x60 으로 키워 row 의 60*(k+1) 위치에 붙이세요
    rows.append(row)
    print('%d → %d : %d번' % (t, p, cm[t, p]))
cv.imshow('confused pairs', np.vstack(rows))
print('관찰: (여기에 한 줄로 적으세요)')
`,
        hint: `<p><code>order = np.argsort(cm.ravel())[::-1][:3]</code> → <code>top_pairs = [divmod(int(i), 10) for i in order]</code>. 붙이기는 <code>row[:, 60 * (k + 1):60 * (k + 2)] = cv.resize(test_cells[i], (60, 60), interpolation=cv.INTER_NEAREST)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

SZ, BIN = 20, 16
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    return cv.warpAffine(img, np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]]), (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
def features(img):
    img = deskew(img)
    gx, gy = cv.Sobel(img, cv.CV_32F, 1, 0), cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(BIN * ang / (2 * np.pi)) % BIN
    h = np.hstack([np.bincount(bins[a:a + 10, b:b + 10].ravel(), mag[a:a + 10, b:b + 10].ravel(), BIN) for a in (0, 10) for b in (0, 10)]).astype(np.float32)
    h = np.sqrt(h / (h.sum() + 1e-7))
    return h / (np.linalg.norm(h) + 1e-7)

cells = cv.imread('digits.png', cv.IMREAD_GRAYSCALE).reshape(50, SZ, 100, SZ).swapaxes(1, 2).reshape(-1, SZ, SZ)
labels = np.repeat(np.arange(10), 500)
col = np.tile(np.arange(100), 50)
keep = col % 2 == 0                                # 속도를 위해 짝수 열만 (2500장)
cells, labels, col = cells[keep], labels[keep], col[keep]
train, test = col < 50, col >= 50
X = np.float32([features(c) for c in cells])
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(2.67)
svm.setGamma(5.383)
svm.train(X[train], cv.ml.ROW_SAMPLE, labels[train].astype(np.int32))
pred = svm.predict(X[test])[1].ravel().astype(int)
y, test_cells = labels[test], cells[test]

cm = np.zeros((10, 10), int)
for t, p in zip(y, pred):
    cm[t, p] += 1
np.fill_diagonal(cm, 0)

order = np.argsort(cm.ravel())[::-1][:3]
top_pairs = [divmod(int(i), 10) for i in order]

rows = []
for t, p in top_pairs:
    idx = np.where((y == t) & (pred == p))[0][:8]
    row = np.zeros((60, 60 * 9), np.uint8)
    cv.putText(row, '%d>%d' % (t, p), (5, 38), cv.FONT_HERSHEY_SIMPLEX, 0.7, 255, 2)
    for k, i in enumerate(idx):
        row[:, 60 * (k + 1):60 * (k + 2)] = cv.resize(test_cells[i], (60, 60), interpolation=cv.INTER_NEAREST)
    rows.append(row)
    print('%d → %d : %d번' % (t, p, cm[t, p]))
cv.imshow('confused pairs', np.vstack(rows))
print('관찰: 대부분 사람이 봐도 애매한 글씨(끊긴 획 · 심한 기울기)라 데이터 한계에 가깝고, 일부는 획이 굵어 뭉친 경우라 셀 분할을 늘리는 실험을 해 볼 만함')
`,
      },
    ],
    quiz: [
      { q: 'MVP(최소 기능 제품)를 먼저 만드는 가장 큰 이유는?', options: ['코드를 짧게 유지하려고', '입력부터 출력까지 연결을 일찍 확인해 통합 문제와 병목을 빨리 발견하려고', '발표 시간을 줄이려고', '테스트를 하지 않아도 되게'], answer: 1, explain: '부분을 따로 완성한 뒤 마지막에 연결하면 형식 불일치 · 속도 문제가 늦게 드러납니다. 얇게라도 끝까지 돌리면 문제를 일찍 찾고 기준선도 바로 잴 수 있습니다.' },
      { q: '기준선(baseline)을 측정할 때 지켜야 할 것으로 가장 중요한 것은?', options: ['매번 새로운 테스트 사진을 사용한다', '가장 잘 되는 사진만 골라 잰다', '처리 시간은 기록하지 않는다', '고정된 테스트 세트와 같은 지표로 재고, 이후 모든 개선을 이 숫자와 비교한다'], answer: 3, explain: '테스트 세트나 지표가 바뀌면 개선 전후를 비교할 수 없습니다. 기준선은 고정된 조건에서 재야 의미가 있습니다.' },
      { q: '상품 인식기에서 판정 기준(min_inliers)을 15 → 8 로 낮췄더니 재현율이 올랐다. 반드시 함께 확인해야 할 것은?', options: ['이미지 파일 크기', '특징점의 색', '코드 줄 수', '정밀도(물체 없는 사진에서 헛검출이 늘었는지)'], answer: 3, explain: '기준을 느슨하게 하면 놓치던 물체를 찾지만, 물체가 없는 곳에서도 “찾았다”고 할 가능성이 커집니다. 정밀도 · 재현율을 함께 봐야 합니다.' },
      { q: '실패 갤러리에서 “장면 특징점 수는 많은데 인라이어가 거의 없음” 증상의 원인 단계로 가장 가능성이 높은 것은?', options: ['① 입력 읽기 실패', '③ 매칭 단계: 크기 · 원근 변화로 기술자가 서로 맞지 않음', '② 특징점 검출 단계에서 코너가 사라짐', '⑤ 출력 그리기 오류'], answer: 1, explain: '특징점은 충분히 검출됐으므로 ② 는 아닙니다. 기술자끼리 짝이 맞지 않아 인라이어가 없는 것이므로 매칭 단계(기술자 한계, 기준 사진 조건 차이)를 의심합니다.' },
    ],
  },
]);
