/* 심화 1주차: 특징점 검출과 기술 (Feature Detection & Description) — docs/LESSON_GUIDE.md · docs/ADVANCED_GUIDE.md 참고 */
COURSE.addLessons([
  /* ======================================================================
   * a1-0 심화 과정 소개와 준비
   * ====================================================================== */
  {
    id: 'a1-0',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg', 'images/adv/graf3.jpg'],
    summary: '5주 심화 과정(특징점 · 3D · 머신러닝 · 객체 검출 + 프로젝트)의 지도를 그리고, 입문 과정의 핵심 도구를 빠르게 복습합니다. 템플릿 매칭이 회전 · 크기 변화에 무너지는 실험으로 “특징점”이 왜 필요한지 직접 확인합니다.',
    goals: [
      '심화 과정 5주의 흐름(교육 3주 + 프로젝트 2주)과 각 영역이 어디에 쓰이는지 설명할 수 있다',
      '입문 과정의 핵심 도구(흑백 변환 · 블러 · 엣지 · 컨투어 · process(frame) · matplotlib)를 다시 사용할 수 있다',
      '교시별 추가 파일(assets)을 파일 이름만으로 불러올 수 있다',
      '템플릿 매칭이 회전 · 크기 변화에 약한 이유를 실험으로 보이고, 특징점 방식의 아이디어를 말할 수 있다',
    ],
    schedule: [['도입 · 과정 로드맵', 8], ['입문 핵심 복습', 12], ['산업 활용 사례', 6], ['동기 실험: 템플릿 매칭 vs 특징점', 12], ['실습 과제', 9], ['정리 · 퀴즈', 3]],
    blocks: [
      { type: 'text', html: `<h3>1. 심화 과정에 오신 것을 환영합니다</h3>
<p>입문 과정에서는 이미지를 <b>픽셀 단위</b>로 다뤘습니다. 밝기를 바꾸고, 블러로 노이즈를 줄이고, 엣지와 컨투어로 물체의 윤곽을 찾았죠. 심화 과정에서는 한 단계 올라가 <b>“영상에서 의미 있는 정보”</b>를 뽑아냅니다.</p>
<ul>
<li><b>이 점은 저 사진의 어느 점과 같은 곳일까?</b> → 특징점 검출 · 매칭 (1주차)</li>
<li><b>카메라로 찍은 2D 사진에서 거리와 자세(3D)를 알 수 있을까?</b> → 캘리브레이션 · 3D 재구성 (2주차)</li>
<li><b>예시를 보여 주면 컴퓨터가 스스로 규칙을 배울 수 있을까?</b> → 머신러닝 (3주차 전반)</li>
<li><b>사진 속 얼굴 · 사람 · 물체는 어디에 있을까?</b> → 객체 검출 (3주차 후반)</li>
</ul>
<p>그리고 4~5주차에는 이 도구들을 엮어 <b>파노라마, AR 오버레이, 실측 도구, 손글씨 인식기</b> 같은 결과물을 만들고 팀 프로젝트로 발표합니다. 모든 내용은 입문 과정과 마찬가지로 <b>OpenCV.org 공식 Python 튜토리얼</b>을 따라갑니다.</p>` },
      { type: 'table', head: ['주차', '영역', '핵심 질문', '대표 결과물'], rows: [
        ['1주 · 교육', '특징점 검출과 기술', '두 사진에서 같은 점을 어떻게 찾을까?', '장면 속 상자 찾기 (호모그래피)'],
        ['2주 · 교육', '카메라 캘리브레이션 · 3D', '사진에서 거리 · 자세 · 깊이를 알 수 있을까?', '체스판 위 3D 좌표축 · 깊이 맵'],
        ['3주 · 교육', '머신러닝 · 객체 검출', '예시로 배우고, 물체를 찾을 수 있을까?', '손글씨 인식 · 얼굴 / 사람 / YOLO 검출'],
        ['4주 · 프로젝트', '가이드 프로젝트 · 기획', '배운 것을 엮으면 무엇을 만들 수 있을까?', '파노라마 · AR 오버레이 · 실측 · 숫자 인식기'],
        ['5주 · 프로젝트', '구현 · 발표', '우리 팀의 문제를 풀 수 있을까?', '팀 프로젝트 발표 · 회고'],
      ] },
      { type: 'text', html: `<h3>2. 입문 과정 핵심 복습</h3>
<p>심화 과정의 코드에는 입문 과정의 도구가 “부품”처럼 계속 등장합니다. 아래 목록이 낯설지 않은지 점검해 보세요.</p>
<ul>
<li><code>cv.imread(name)</code> · <code>cv.cvtColor(img, cv.COLOR_BGR2GRAY)</code> — 읽기와 흑백 변환 (특징점 검출기는 대부분 <b>흑백</b> 입력)</li>
<li><code>cv.GaussianBlur</code> · <code>cv.Canny</code> · <code>cv.threshold</code> — 노이즈 제거, 엣지, 이진화</li>
<li><code>cv.findContours</code> · <code>cv.drawContours</code> · <code>cv.boundingRect</code> — 덩어리의 윤곽과 위치</li>
<li><code>cv.getPerspectiveTransform</code> · <code>cv.warpPerspective</code> — 원근 변환 (8교시 호모그래피와 직결!)</li>
<li><code>cv.matchTemplate</code> — 작은 그림을 큰 그림에서 찾기 (오늘의 동기 실험)</li>
<li><code>def process(frame):</code> + 트랙바 — 웹캠 · 동영상 실시간 처리</li>
<li><code>plt.subplot</code> · <code>plt.imshow</code> — 여러 결과를 한 그림에 비교 (<b>제목은 영어</b>)</li>
</ul>` },
      { type: 'code', title: '예제 1 · 복습 종합: 흑백 → 블러 → 엣지 → 컨투어', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('blox.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)          # 1) 흑백
blur = cv.GaussianBlur(gray, (5, 5), 0)             # 2) 노이즈 줄이기
edges = cv.Canny(blur, 50, 150)                     # 3) 엣지
edges = cv.dilate(edges, np.ones((3, 3), np.uint8)) #    끊긴 선 잇기

# 4) 바깥 윤곽만 찾고, 작은 조각은 버리기
contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
big = [c for c in contours if cv.contourArea(c) > 300]

result = img.copy()
for c in big:
    x, y, w, h = cv.boundingRect(c)
    cv.rectangle(result, (x, y), (x + w, y + h), (0, 0, 255), 2)
print('전체 컨투어:', len(contours), '/ 면적 300 초과:', len(big))

titles = ['Gray', 'Blur', 'Canny + dilate', 'Contours']
images = [gray, blur, edges, cv.cvtColor(result, cv.COLOR_BGR2RGB)]
plt.figure(figsize=(12, 3.5))
for i in range(4):
    plt.subplot(1, 4, i + 1)
    plt.imshow(images[i], cmap='gray')
    plt.title(titles[i]), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p>입문 과정의 대표 흐름입니다. 이 흐름은 <b>물체의 윤곽</b>은 잘 찾지만, “이 상자가 저 사진의 그 상자와 <b>같은 물체</b>인가?”라는 질문에는 답하지 못합니다. 그 질문에 답하는 도구가 이번 주의 <b>특징점</b>입니다.</p>' },
      { type: 'code', title: '예제 2 · 복습: process(frame) + 트랙바 + 처리 시간 재기', code: String.raw`
import cv2 as cv
import time

# 입력 소스를 📷 웹캠이나 🎞️ 동영상(vtest.mp4 등)으로 바꿔 보세요. 이미지여도 동작합니다.
def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('scale', 'result', 100, 100, nothing)   # 처리 해상도 (%)
cv.createTrackbar('blur', 'result', 2, 10, nothing)       # 블러 커널 = 2*값+1

def process(frame):
    t0 = time.perf_counter()
    s = max(10, cv.getTrackbarPos('scale', 'result')) / 100
    small = cv.resize(frame, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
    k = 2 * cv.getTrackbarPos('blur', 'result') + 1
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
    edges = cv.Canny(cv.GaussianBlur(gray, (k, k), 0), 50, 150)
    ms = (time.perf_counter() - t0) * 1000             # 처리 시간(밀리초)

    out = cv.cvtColor(edges, cv.COLOR_GRAY2BGR)
    cv.putText(out, '%dx%d  %.1f ms' % (out.shape[1], out.shape[0], ms), (10, 25),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return out
`, desc: '<p><code>time.perf_counter()</code> 로 처리 시간을 재는 이 틀은 심화 과정 내내 씁니다. 특징점 알고리즘은 필터보다 훨씬 무거워서, <b>해상도를 줄이면 얼마나 빨라지는지</b>를 늘 확인해야 합니다. scale 트랙바를 50 으로 내리면 픽셀 수가 1/4 이 되어 시간도 크게 줄어듭니다.</p>' },
      { type: 'text', html: `<h3>3. 심화 과정의 추가 파일(assets)</h3>
<p>심화 교시는 입문 샘플 이미지 외에 <b>교시마다 필요한 파일</b>(튜토리얼 원본 이미지, 딥러닝 모델 등)을 씁니다. 교시를 열면 필요한 파일이 <b>자동으로</b> 브라우저의 가상 폴더에 복사되므로, 코드에서는 입문 때처럼 <b>파일 이름만</b> 쓰면 됩니다.</p>
<ul>
<li>이번 주에 쓰는 파일: <code>box.png</code>(상자) · <code>box_in_scene.png</code>(상자가 놓인 장면) · <code>graf1.jpg</code> · <code>graf3.jpg</code>(같은 벽화를 다른 각도에서 찍은 사진)</li>
<li>입문 샘플(<code>messi5.jpg</code>, <code>blox.jpg</code>, <code>building.jpg</code>, <code>home.jpg</code> …)과 동영상은 원래처럼 바로 사용</li>
<li>추가 이미지는 오른쪽 <b>입력 소스 목록</b>에도 나타나서 <code>process(frame)</code> 예제의 입력으로 고를 수 있음</li>
</ul>` },
      { type: 'code', title: '예제 3 · 이번 주 추가 이미지 확인하기', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

names = ['box.png', 'box_in_scene.png', 'graf1.jpg', 'graf3.jpg']
plt.figure(figsize=(10, 7))
for i, name in enumerate(names):
    img = cv.imread(name)
    if img is None:
        print(name, '→ 불러오지 못했습니다. 교시를 다시 열어 보세요.')
        continue
    print('%-17s 가로 %4d × 세로 %4d' % (name, img.shape[1], img.shape[0]))
    plt.subplot(2, 2, i + 1)
    plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))
    plt.title(name), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p><code>box.png</code> 의 상자가 <code>box_in_scene.png</code> 에서는 <b>작아지고, 기울어지고, 다른 물건에 가려져</b> 있습니다. <code>graf3.jpg</code> 는 <code>graf1.jpg</code> 를 옆에서 비스듬히 찍었습니다. 이번 주의 목표는 이런 사진 쌍에서 <b>같은 물체를 자동으로 찾는 것</b>입니다.</p>' },
      { type: 'image', src: 'adv/box_in_scene.png', caption: 'box_in_scene.png — 8교시에는 이 장면에서 box.png 의 상자를 찾아 테두리를 그립니다' },
      { type: 'text', html: `<h3>4. 이 기술들은 어디에 쓰일까?</h3>
<p>이번 과정의 네 영역은 서로 연결되어 실제 제품 속에서 함께 동작합니다.</p>` },
      { type: 'table', head: ['분야', '사례', '쓰이는 기술', '배우는 주차'], rows: [
        ['파노라마 · 사진 합성', '스마트폰 파노라마, 위성 · 드론 사진 이어 붙이기', '특징점 매칭 + 호모그래피', '1주 → 4주 프로젝트'],
        ['증강현실(AR)', '책 표지 위에 영상 띄우기, 가구 배치 앱', '평면 물체 인식 · 자세 추정', '1 · 2주 → 4주 프로젝트'],
        ['로봇 · 드론 SLAM', '청소 로봇이 지도를 만들며 자기 위치 추정', 'ORB 특징점 추적 · 3D 재구성', '1 · 2주'],
        ['제조 검사', '부품 위치 정렬 후 불량 검사, 치수 측정', '특징 정렬 · 캘리브레이션 실측', '1 · 2주 → 4주 프로젝트'],
        ['자율주행', '차선 · 차량 · 보행자 검출, 스테레오 거리 추정', '객체 검출 · 스테레오 깊이', '2 · 3주'],
        ['문서 · 물류', '송장 숫자 인식, 손글씨 입력', '머신러닝 분류(kNN · SVM)', '3주 → 4주 프로젝트'],
      ] },
      { type: 'text', html: `<h3>5. 동기 실험: 템플릿 매칭은 왜 부족할까?</h3>
<p>입문 과정의 <b>템플릿 매칭</b>(<code>cv.matchTemplate</code>)은 작은 그림(템플릿)을 큰 그림 위에서 <b>한 칸씩 밀면서 픽셀끼리 비교</b>합니다. 템플릿과 <b>똑같은 크기 · 똑같은 방향</b>으로 찍힌 물체는 아주 잘 찾지만, 물체가 <b>조금만 돌아가거나 작아져도</b> 픽셀 배치가 달라져 점수가 뚝 떨어집니다.</p>
<p>실험 방법: messi5.jpg 에서 메시의 상체 부분을 잘라 템플릿으로 쓰고, 원본 사진을 <b>회전 · 축소</b>한 여러 장면에서 찾아봅니다. 장면을 우리가 직접 만들었으므로 <b>정답 위치</b>를 알고 있어, 찾은 위치가 맞았는지도 판정할 수 있습니다.</p>` },
      { type: 'code', title: '예제 4 · 템플릿 매칭: 회전 · 크기 변화에 무너지는 모습', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
H, W = gray.shape
x, y, w, h = 150, 55, 200, 190                 # 템플릿: 메시 상체
tpl = gray[y:y + h, x:x + w]

cases = [(0, 1.0), (15, 1.0), (30, 1.0), (60, 1.0), (0, 0.7), (30, 0.7)]   # (회전 각도, 크기)
plt.figure(figsize=(12, 6))
for i, (angle, scale) in enumerate(cases):
    M = cv.getRotationMatrix2D((W / 2, H / 2), angle, scale)
    scene = cv.warpAffine(gray, M, (W, H))

    res = cv.matchTemplate(scene, tpl, cv.TM_CCOEFF_NORMED)
    _, score, _, loc = cv.minMaxLoc(res)

    # 정답: 템플릿 중심이 변환 M 으로 옮겨 간 위치
    cx, cy = M @ np.array([x + w / 2, y + h / 2, 1])
    ok = abs(loc[0] + w / 2 - cx) < 20 and abs(loc[1] + h / 2 - cy) < 20
    print('회전 %2d° 크기 %.1f → 최고 점수 %.2f, 위치 %s' % (angle, scale, score, '정답' if ok else '틀림'))

    vis = cv.cvtColor(scene, cv.COLOR_GRAY2RGB)
    cv.rectangle(vis, loc, (loc[0] + w, loc[1] + h), (0, 255, 0) if ok else (255, 0, 0), 3)
    plt.subplot(2, 3, i + 1), plt.imshow(vis)
    plt.title('rot %d, scale %.1f, score %.2f' % (angle, scale, score)), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p>회전 0° 에서는 점수 1.00 으로 완벽하지만, <b>15° 만 돌려도 점수가 0.3 아래</b>로 떨어지고 30° 부터는 엉뚱한 곳(빨간 상자)을 찾습니다. 템플릿 매칭은 “같은 방향 · 같은 크기”라는 가정 위에 서 있기 때문입니다.</p>' },
      { type: 'text', html: `<h3>6. 아이디어: 통째로 비교하지 말고, “특별한 점”을 찾아 비교하자</h3>
<p>사람은 기울어진 사진에서도 메시를 쉽게 찾습니다. 그림 전체를 픽셀 단위로 겹쳐 보지 않고, <b>눈에 띄는 부분</b>(로고, 엠블럼, 줄무늬 모서리)을 먼저 찾아 “여기가 거기구나” 하고 맞춰 보기 때문이죠. 컴퓨터 비전의 특징점 방식도 똑같습니다.</p>
<ol>
<li><b>검출(Detection)</b> — 사진에서 다시 찾기 쉬운 특별한 점(코너 · 블롭)을 찾는다 → 2 · 3 · 5교시</li>
<li><b>기술(Description)</b> — 각 점 주변을 <b>회전 · 크기 변화에도 비슷하게 나오는 숫자 벡터</b>로 요약한다 → 4 · 5 · 6교시</li>
<li><b>매칭(Matching)</b> — 두 사진의 기술자끼리 거리가 가까운 쌍을 찾는다 → 7교시</li>
<li><b>기하 검증(Homography)</b> — 매칭 쌍들이 하나의 변환으로 설명되는지 확인하고 물체 위치를 계산한다 → 8교시</li>
</ol>
<p>아래 예제는 이번 주에 배울 ORB 특징점으로 같은 실험을 한 결과입니다. 코드는 아직 몰라도 괜찮습니다. <b>“회전 · 축소 후에도 맞는 짝이 많이 남는다”</b>는 결과만 확인하세요.</p>` },
      { type: 'code', title: '예제 5 · 미리보기: 특징점(ORB)은 회전 · 크기 변화에도 짝을 찾는다', code: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
H, W = gray.shape
x, y, w, h = 150, 55, 200, 190
tpl = gray[y:y + h, x:x + w]

orb = cv.ORB_create(1000)                               # 6교시
kp_t, des_t = orb.detectAndCompute(tpl, None)
bf = cv.BFMatcher(cv.NORM_HAMMING, crossCheck=True)     # 7교시
print('템플릿 특징점:', len(kp_t), '개')

for angle, scale in [(0, 1.0), (15, 1.0), (30, 1.0), (60, 1.0), (0, 0.7), (30, 0.7)]:
    M = cv.getRotationMatrix2D((W / 2, H / 2), angle, scale)
    scene = cv.warpAffine(gray, M, (W, H))
    kp_s, des_s = orb.detectAndCompute(scene, None)
    matches = bf.match(des_t, des_s)

    # 정답 판정: 템플릿 점을 M 으로 옮긴 위치와 5픽셀 이내면 맞는 짝
    correct = 0
    for m in matches:
        px, py = kp_t[m.queryIdx].pt
        tx, ty = M @ np.array([px + x, py + y, 1])
        sx, sy = kp_s[m.trainIdx].pt
        if np.hypot(tx - sx, ty - sy) < 5:
            correct += 1
    print('회전 %2d° 크기 %.1f → 매칭 %3d 쌍 중 맞는 짝 %3d 쌍' % (angle, scale, len(matches), correct))

    if (angle, scale) == (30, 0.7):
        good = sorted(matches, key=lambda m: m.distance)[:40]    # 거리가 가까운 40쌍만 그리기
        vis = cv.drawMatches(tpl, kp_t, scene, kp_s, good, None, flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
        cv.imshow('ORB matches (rot 30, scale 0.7)', vis)
`, desc: '<p>템플릿 매칭이 틀린 위치를 찾던 <b>30° 회전 + 0.7배</b> 장면에서도, 특징점 방식은 <b>100쌍이 넘는 맞는 짝</b>을 찾습니다. 맞는 짝이 이만큼 있으면 8교시의 호모그래피로 물체의 위치 · 기울기까지 계산할 수 있습니다.</p>' },
      { type: 'code', title: '예제 6 · 1주차 최종 목표 미리보기: 장면 속 상자 찾기', code: String.raw`
import cv2 as cv
import numpy as np

# 8교시에 한 줄씩 배울 전체 흐름입니다. 지금은 실행해서 결과만 확인하세요.
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)

sift = cv.SIFT_create()                                          # 1) 검출 + 2) 기술 (4교시)
kp1, des1 = sift.detectAndCompute(box, None)
kp2, des2 = sift.detectAndCompute(scene, None)

matches = cv.BFMatcher().knnMatch(des1, des2, k=2)               # 3) 매칭 (7교시)
good = [m for m, n in matches if m.distance < 0.7 * n.distance]

src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
M, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)            # 4) 기하 검증 (8교시)

h, w = box.shape
corners = np.float32([[0, 0], [0, h - 1], [w - 1, h - 1], [w - 1, 0]]).reshape(-1, 1, 2)
outline = cv.perspectiveTransform(corners, M)
result = cv.cvtColor(scene, cv.COLOR_GRAY2BGR)
cv.polylines(result, [np.int32(outline)], True, (0, 255, 0), 3, cv.LINE_AA)

print('특징점: 상자 %d개, 장면 %d개 / 좋은 매칭 %d쌍 / RANSAC 인라이어 %d쌍'
      % (len(kp1), len(kp2), len(good), int(mask.sum())))
cv.imshow('box found', result)
`, desc: '<p>작아지고 기울어지고 일부가 가려진 상자를 정확히 찾아 초록 테두리를 그립니다. 이번 주 9교시 동안 이 20줄을 <b>한 줄도 빠짐없이 이해</b>하는 것이 목표입니다.</p>' },
      { type: 'tip', html: `<p><b>심화 과정 공부 요령</b></p>
<ul>
<li>특징점 알고리즘은 브라우저에서 <b>수백 ms ~ 수 초</b>가 걸릴 수 있습니다. 느리면 <code>cv.resize</code> 로 이미지를 줄이고, <code>nfeatures</code> 같은 개수 제한 인자를 쓰세요.</li>
<li>수학 공식은 <b>“무엇을 재는지”</b>만 이해하면 충분합니다. 결과 그림과 숫자를 바꿔 보며 감을 잡는 것이 먼저입니다.</li>
<li>matplotlib 그래프의 제목 · 라벨은 <b>영어</b>로 씁니다(한글 폰트 없음).</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 템플릿 매칭이 버티는 한계 각도 찾기',
        desc: `<p>예제 4 에서는 15° 만 돌려도 점수가 크게 떨어졌습니다. 회전 각도를 <b>0° 부터 30° 까지 2° 간격</b>으로 바꾸며 최고 점수와 정답 여부를 출력하고, <b>점수가 처음으로 0.5 아래로 떨어지는 각도</b>와 <b>처음으로 위치가 틀리는 각도</b>를 찾으세요. 마지막에 두 각도를 print 로 보고합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
H, W = gray.shape
x, y, w, h = 150, 55, 200, 190
tpl = gray[y:y + h, x:x + w]

first_low = None      # 점수가 처음 0.5 미만이 된 각도
first_wrong = None    # 위치가 처음 틀린 각도

# TODO 1: 0, 2, 4, ..., 30 도를 모두 시험하도록 바꾸세요 (range 사용)
for angle in [0]:
    M = cv.getRotationMatrix2D((W / 2, H / 2), angle, 1.0)
    scene = cv.warpAffine(gray, M, (W, H))
    res = cv.matchTemplate(scene, tpl, cv.TM_CCOEFF_NORMED)
    _, score, _, loc = cv.minMaxLoc(res)
    cx, cy = M @ np.array([x + w / 2, y + h / 2, 1])
    ok = abs(loc[0] + w / 2 - cx) < 20 and abs(loc[1] + h / 2 - cy) < 20
    print('%2d° 점수 %.2f %s' % (angle, score, '정답' if ok else '틀림'))
    # TODO 2: first_low, first_wrong 이 아직 None 이면 조건에 맞을 때 angle 을 기록하세요

print('점수 0.5 미만이 된 첫 각도:', first_low)
print('위치가 틀린 첫 각도:', first_wrong)
`,
        hint: `<p><code>for angle in range(0, 31, 2):</code> 로 바꾸고, 반복문 안에서 <code>if first_low is None and score &lt; 0.5: first_low = angle</code> 처럼 “처음 한 번만” 기록하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
H, W = gray.shape
x, y, w, h = 150, 55, 200, 190
tpl = gray[y:y + h, x:x + w]

first_low = None
first_wrong = None
scores = []

for angle in range(0, 31, 2):
    M = cv.getRotationMatrix2D((W / 2, H / 2), angle, 1.0)
    scene = cv.warpAffine(gray, M, (W, H))
    res = cv.matchTemplate(scene, tpl, cv.TM_CCOEFF_NORMED)
    _, score, _, loc = cv.minMaxLoc(res)
    cx, cy = M @ np.array([x + w / 2, y + h / 2, 1])
    ok = abs(loc[0] + w / 2 - cx) < 20 and abs(loc[1] + h / 2 - cy) < 20
    print('%2d° 점수 %.2f %s' % (angle, score, '정답' if ok else '틀림'))
    if first_low is None and score < 0.5:
        first_low = angle
    if first_wrong is None and not ok:
        first_wrong = angle
    scores.append(score)

print('점수 0.5 미만이 된 첫 각도:', first_low)
print('위치가 틀린 첫 각도:', first_wrong)

from matplotlib import pyplot as plt
plt.plot(list(range(0, 31, 2)), scores, 'o-')
plt.axhline(0.5, color='r', linestyle='--')
plt.xlabel('rotation (deg)'), plt.ylabel('best TM_CCOEFF_NORMED score')
plt.title('Template matching vs rotation')
plt.show()
`,
      },
      {
        title: '실습 2 · 해상도에 따른 처리 시간 비교표 만들기',
        desc: `<p>특징점 알고리즘을 쓰기 전에 “해상도를 줄이면 얼마나 빨라지는가”를 직접 재 봅니다. <code>building.jpg</code> 를 <b>100% · 75% · 50% · 25%</b> 크기로 줄여 가며 <code>cv.medianBlur(img, 9)</code> + <code>cv.Canny</code> 의 처리 시간을 각각 <b>5번 재서 가장 짧은 값</b>을 출력하세요. 픽셀 수가 1/4 이 되면 시간도 약 1/4 이 되는지 확인합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import time

img = cv.imread('building.jpg')

def work(im):
    gray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
    return cv.Canny(cv.medianBlur(gray, 9), 50, 150)

# TODO 1: 1.0, 0.75, 0.5, 0.25 네 가지 배율을 모두 시험하세요
for s in [1.0]:
    small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
    # TODO 2: work(small) 를 5번 실행해 가장 짧은 시간을 ms 단위로 구하세요
    t0 = time.perf_counter()
    edges = work(small)
    ms = (time.perf_counter() - t0) * 1000
    print('배율 %.2f  크기 %4dx%-4d  픽셀 %7d  시간 %.2f ms' % (s, small.shape[1], small.shape[0], small.shape[0] * small.shape[1], ms))
`,
        hint: `<p>시간은 실행할 때마다 조금씩 흔들리므로 여러 번 재서 <code>min()</code> 을 씁니다. <code>times = []</code> 를 만들고 5번 반복하며 <code>times.append(...)</code> 후 <code>min(times)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import time

img = cv.imread('building.jpg')

def work(im):
    gray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
    return cv.Canny(cv.medianBlur(gray, 9), 50, 150)

base = None
for s in [1.0, 0.75, 0.5, 0.25]:
    small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
    times = []
    for _ in range(5):
        t0 = time.perf_counter()
        edges = work(small)
        times.append((time.perf_counter() - t0) * 1000)
    ms = min(times)
    if base is None:
        base = ms
    print('배율 %.2f  크기 %4dx%-4d  픽셀 %7d  시간 %6.2f ms  (100%% 대비 %.2f배)'
          % (s, small.shape[1], small.shape[0], small.shape[0] * small.shape[1], ms, ms / base))
    cv.imshow('edges %.2f' % s, edges)
`,
      },
    ],
    quiz: [
      { q: "심화 과정에서 “카메라로 찍은 2D 사진에서 거리 · 자세 · 깊이를 구하는 방법”을 배우는 주차는?", options: ["1주차 특징점 검출과 기술", "2주차 카메라 캘리브레이션과 3D 재구성", "3주차 머신러닝과 객체 검출", "5주차 구현과 발표"], answer: 1, explain: "2주차에 캘리브레이션 · 왜곡 보정 · 자세 추정 · 스테레오 깊이를 배웁니다." },
      { q: "예제 4 에서 템플릿 매칭이 30° 회전된 장면에서 틀린 위치를 찾은 가장 큰 이유는?", options: ["이미지가 흑백이라서", "템플릿이 너무 커서 계산이 중단되었기 때문에", "TM_CCOEFF_NORMED 가 회전을 지원하지 않는 오래된 방식이라서", "템플릿과 장면을 같은 방향 · 같은 크기로 겹쳐 픽셀끼리 비교하기 때문에"], answer: 3, explain: "템플릿 매칭은 창을 밀면서 같은 자리의 픽셀끼리 비교합니다. 물체가 회전 · 축소되면 픽셀 배치가 달라져 점수가 떨어집니다." },
      { q: "특징점 방식으로 두 사진에서 같은 물체를 찾는 흐름을 올바른 순서로 나열한 것은?", options: ["검출 → 기술 → 매칭 → 기하 검증(호모그래피)", "매칭 → 검출 → 기술 → 호모그래피", "기술 → 호모그래피 → 검출 → 매칭", "호모그래피 → 매칭 → 기술 → 검출"], answer: 0, explain: "특별한 점을 찾고(검출), 주변을 숫자 벡터로 요약하고(기술), 비슷한 벡터끼리 짝짓고(매칭), 짝들이 하나의 변환으로 설명되는지 확인합니다." },
      { q: "교시의 assets 에 images/adv/box_in_scene.png 가 들어 있을 때, 코드에서 이 이미지를 읽는 올바른 방법은?", options: ["cv.imread('images/adv/box_in_scene.png')", "cv.imread('adv/box_in_scene.png')", "cv.imread('box_in_scene.png')", "먼저 cv.download('box_in_scene.png') 를 호출해야 한다"], answer: 2, explain: "교시를 열 때 파일이 가상 폴더에 파일 이름만으로 복사되므로 cv.imread('box_in_scene.png') 처럼 이름만 씁니다." },
      { q: "웹 실습 환경에서 웹캠 영상을 매 프레임 처리하는 올바른 방법은?", options: ["while True: 안에서 cap.read() 반복", "time.sleep() 으로 프레임 간격 맞추기", "cv.waitKey(1) 을 1000번 호출", "def process(frame): 를 정의하고 결과 이미지를 return"], answer: 3, explain: "웹 환경에서는 while 반복이 금지되어 있고, process(frame) 이 매 프레임 자동으로 호출됩니다." },
    ],
  },

  /* ======================================================================
   * a1-1 특징이란 무엇인가 (Understanding Features)
   * ====================================================================== */
  {
    id: 'a1-1',
    summary: '퍼즐 맞추기 비유로 “좋은 특징”이 무엇인지 이해합니다. 평탄한 곳 · 엣지 · 코너 패치를 직접 잘라 창을 움직여 보고, 기울기(그래디언트) 분포와 고유값으로 세 종류를 숫자로 구분합니다. 특징 검출(Detection)과 기술(Description)의 뜻을 정리합니다.',
    goals: [
      '퍼즐 비유로 “좋은 특징”의 조건(다시 찾기 쉬움 · 구별됨)을 설명할 수 있다',
      '평탄한 영역 · 엣지 · 코너를 “작은 창을 움직였을 때의 변화”로 구분할 수 있다',
      '패치의 그래디언트 분포와 구조 행렬의 두 고유값(λ1, λ2)이 세 종류에서 어떻게 다른지 말할 수 있다',
      '특징 검출(Feature Detection)과 특징 기술(Feature Description)의 차이를 설명할 수 있다',
    ],
    schedule: [['도입 · 퍼즐 비유', 6], ['평탄 · 엣지 · 코너', 10], ['창 움직이기 · 유일성 실험', 12], ['기울기와 고유값 직관', 8], ['실습 과제', 10], ['정리 · 퀴즈', 4]],
    blocks: [
      { type: 'text', html: `<h3>1. 퍼즐은 어떻게 맞출까?</h3>
<p>수천 조각짜리 직소 퍼즐을 맞춘다고 해 봅시다. 여러분은 어떤 조각부터 집나요? 아마 <b>파란 하늘 조각</b>은 뒤로 미루고, <b>건물 모서리나 글자가 있는 조각</b>부터 자리를 찾을 겁니다. 하늘 조각은 어디에 놓아도 비슷해 보이지만, 모서리 조각은 <b>들어갈 자리가 딱 한 곳</b>이기 때문입니다.</p>
<p>공식 튜토리얼은 바로 이 질문에서 시작합니다. 사람이 퍼즐을 맞출 때 찾는 것은 <b>특정한 패턴, 다시 찾기 쉬운 고유한 부분</b>이고, 이것을 <b>특징(Feature)</b>이라고 부릅니다. 컴퓨터가 여러 장의 사진을 이어 붙이거나(파노라마), 여러 시점의 사진으로 3D 모양을 복원할 때도 똑같이 <b>두 사진에서 같은 곳을 가리키는 특징</b>을 먼저 찾아야 합니다.</p>
<p>그렇다면 질문은 두 가지입니다.</p>
<ol>
<li><b>어떤 부분이 좋은 특징일까?</b> — 이번 교시</li>
<li><b>그런 부분을 컴퓨터가 어떻게 자동으로 찾을까?</b> — 다음 교시부터 (Harris, Shi-Tomasi, SIFT, FAST, ORB)</li>
</ol>` },
      { type: 'text', html: `<h3>2. 평탄한 곳 · 엣지 · 코너</h3>
<p>튜토리얼의 건물 사진 예시처럼, 사진에서 작은 조각(패치) 세 종류를 떠올려 봅시다.</p>
<ul>
<li><b>A · B — 평탄한 영역(Flat)</b>: 하늘, 흰 벽. 조각을 조금 옮겨도 똑같아 보입니다. <b>정확한 위치를 찾기가 매우 어렵습니다.</b></li>
<li><b>C · D — 엣지(Edge)</b>: 건물의 경계선. 경계에 <b>수직</b>으로 옮기면 모습이 바뀌지만, 경계를 <b>따라</b> 옮기면 여전히 똑같아 보입니다. 위치를 “선 위 어딘가”까지만 좁힐 수 있습니다.</li>
<li><b>E · F — 코너(Corner)</b>: 창문 모서리. <b>어느 방향</b>으로 옮겨도 모습이 달라집니다. 위치를 <b>한 점</b>으로 정할 수 있어 가장 좋은 특징입니다.</li>
</ul>
<p>정리하면, 좋은 특징은 <b>“주변의 작은 창을 어느 방향으로 움직여도 내용이 크게 변하는 곳”</b>입니다. 이 한 문장이 다음 교시 Harris 코너 검출의 출발점입니다.</p>` },
      { type: 'table', head: ['종류', '창을 움직이면', '위치를 정할 수 있나?', '예시', '특징으로서'], rows: [
        ['평탄(Flat)', '어느 방향이든 거의 변화 없음', '거의 불가능', '하늘, 흰 벽, 도로', '나쁨'],
        ['엣지(Edge)', '경계에 수직: 큰 변화 / 경계 따라: 변화 없음', '선 위 어딘가까지만', '건물 윤곽, 지평선', '보통'],
        ['코너(Corner)', '모든 방향으로 큰 변화', '한 점으로 정확히', '창문 모서리, 글자 끝', '좋음'],
      ] },
      { type: 'code', title: '예제 1 · 건물 사진에서 세 종류의 패치 잘라 보기', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
r = 20                                           # 패치 반지름 → 41×41

points = {'flat (sky)': (95, 235), 'edge (canopy)': (571, 359), 'corner (window)': (775, 298)}
colors = [(255, 0, 0), (0, 200, 0), (0, 0, 255)] # BGR: 파랑 · 초록 · 빨강

vis = img.copy()
for (name, (x, y)), c in zip(points.items(), colors):
    cv.rectangle(vis, (x - r, y - r), (x + r, y + r), c, 3)

plt.figure(figsize=(12, 7))
plt.subplot(2, 3, (1, 3))                        # 위쪽 한 줄 전체
plt.imshow(cv.cvtColor(vis, cv.COLOR_BGR2RGB)), plt.title('building.jpg'), plt.axis('off')
for i, (name, (x, y)) in enumerate(points.items()):
    patch = gray[y - r:y + r + 1, x - r:x + r + 1]
    plt.subplot(2, 3, 4 + i)
    plt.imshow(patch, cmap='gray', vmin=0, vmax=255), plt.title(name), plt.axis('off')
    print('%-16s 위치 (%d, %d)  밝기 평균 %.1f  표준편차 %.1f' % (name, x, y, patch.mean(), patch.std()))
plt.tight_layout()
plt.show()
`, desc: '<p>41×41 픽셀 조각을 크게 확대했습니다. 하늘 조각은 거의 한 가지 색, 차양 조각은 밝은 면과 어두운 면이 <b>한 줄로</b> 나뉘고, 창문 조각은 <b>두 방향</b>의 경계가 만납니다. 표준편차(밝기가 얼마나 다양한가)만으로는 엣지와 코너를 구분하기 어렵다는 점도 눈여겨보세요.</p>' },
      { type: 'text', html: `<h3>3. 창을 움직여 보는 실험</h3>
<p>“창을 움직이면 얼마나 달라지는가”를 숫자로 재 봅시다. 패치 위치를 (u, v) 만큼 옮긴 조각과 원래 조각의 <b>픽셀 차이 제곱의 평균</b>을 구하면 됩니다.</p>
<p><b>E(u, v) = 평균[ (옮긴 조각 − 원래 조각)² ]</b></p>
<ul>
<li>평탄: 어디로 옮겨도 E 가 작음 → 지도 전체가 어두움</li>
<li>엣지: 경계를 따라가는 방향은 E 가 작음 → 지도에 <b>어두운 골짜기(선)</b></li>
<li>코너: 가운데(u=v=0)만 E 가 작고 사방이 큼 → 지도에 <b>어두운 점 하나</b></li>
</ul>
<p>이 E(u, v) 가 바로 Harris 논문이 출발한 식입니다(다음 교시에는 가중치 창 w(x, y) 가 더해집니다).</p>` },
      { type: 'code', title: '예제 2 · 창을 (u, v) 만큼 움직였을 때의 변화 지도 E(u, v)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('building.jpg', cv.IMREAD_GRAYSCALE).astype(np.float32)
r = 20        # 패치 반지름
R = 12        # 움직이는 범위: -12 ~ +12 픽셀

def shift_error(x, y):
    base = gray[y - r:y + r + 1, x - r:x + r + 1]
    E = np.zeros((2 * R + 1, 2 * R + 1), np.float32)
    for v in range(-R, R + 1):
        for u in range(-R, R + 1):
            moved = gray[y + v - r:y + v + r + 1, x + u - r:x + u + r + 1]
            E[v + R, u + R] = np.mean((moved - base) ** 2)
    return E

points = {'flat': (95, 235), 'edge': (571, 359), 'corner': (775, 298)}
plt.figure(figsize=(12, 4))
for i, (name, (x, y)) in enumerate(points.items()):
    E = shift_error(x, y)
    # 가운데(0,0)를 뺀 나머지 중 가장 작은 변화: 작을수록 "헷갈리는 이웃"이 있다는 뜻
    others = E.copy()
    others[R, R] = np.inf
    print('%-7s 최대 변화 %8.1f   가운데 제외 최소 변화 %8.1f' % (name, E.max(), others.min()))
    plt.subplot(1, 3, i + 1)
    plt.imshow(E, cmap='jet', extent=[-R, R, R, -R])
    plt.title('%s: E(u, v)' % name), plt.xlabel('u (shift x)'), plt.ylabel('v (shift y)')
    plt.colorbar(fraction=0.046)
plt.tight_layout()
plt.show()
`, desc: '<p>색 막대의 범위(최대 변화)부터 비교하세요. 평탄 영역은 최대 변화가 아주 작고, 엣지 지도에는 <b>비스듬한 파란 골짜기</b>(차양 경계를 따라가는 방향)가 생기며, 코너 지도는 <b>가운데 한 점만</b> 파랗습니다. “가운데 제외 최소 변화”가 클수록 헷갈리는 이웃이 없는 좋은 특징입니다.</p>' },
      { type: 'text', html: `<h3>4. 이 패치는 사진 전체에서 몇 번 나타날까? (유일성)</h3>
<p>퍼즐 조각이 “들어갈 자리가 한 곳”인지 확인하는 가장 직접적인 방법은, 그 조각을 <b>사진 전체와 비교</b>해 보는 것입니다. 입문 과정의 <code>cv.matchTemplate</code> 을 <code>TM_SQDIFF_NORMED</code>(작을수록 비슷함)로 쓰면, 패치와 <b>거의 똑같은 위치가 몇 곳인지</b> 셀 수 있습니다.</p>` },
      { type: 'code', title: '예제 3 · 패치의 유일성: 거의 같은 곳이 몇 군데인가?', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('building.jpg', cv.IMREAD_GRAYSCALE)
s = 15                                            # 31×31 패치
points = {'flat': (95, 235), 'edge': (571, 359), 'corner': (775, 298)}

plt.figure(figsize=(12, 3.8))
for i, (name, (x, y)) in enumerate(points.items()):
    patch = gray[y - s:y + s + 1, x - s:x + s + 1]
    res = cv.matchTemplate(gray, patch, cv.TM_SQDIFF_NORMED)   # 0 에 가까울수록 비슷
    similar = res < 0.02
    print('%-7s 거의 같은 위치: %6d 곳' % (name, int(similar.sum())))
    plt.subplot(1, 3, i + 1)
    plt.imshow(similar, cmap='gray')
    plt.title('%s: %d similar places' % (name, int(similar.sum()))), plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>흰 점이 “원래 패치와 거의 같은 위치”입니다. 하늘 패치는 <b>수만 곳</b>(하늘 전체), 차양 엣지 패치는 <b>경계선을 따라 수십~백여 곳</b>, 창문 코너 패치는 <b>단 한 곳</b>입니다. 퍼즐 비유가 숫자로 확인되었습니다.</p>' },
      { type: 'text', html: `<h3>5. 기울기(그래디언트)로 보면: 구조 행렬과 두 고유값</h3>
<p>창을 일일이 움직여 보는 대신, 패치 안의 <b>기울기</b>(입문 과정의 Sobel: Ix, Iy)만 보고도 세 종류를 구분할 수 있습니다. 패치 안 모든 픽셀의 (Ix, Iy) 를 점으로 찍어 보면,</p>
<ul>
<li><b>평탄</b>: 기울기가 거의 0 → 점들이 원점 근처에 <b>작게 뭉침</b></li>
<li><b>엣지</b>: 기울기가 한 방향(경계에 수직)으로만 큼 → 점들이 <b>한 줄</b>로 길게 퍼짐</li>
<li><b>코너</b>: 두 방향의 기울기가 모두 있음 → 점들이 <b>두 방향</b>으로 넓게 퍼짐</li>
</ul>
<p>이 “퍼진 모양”을 요약하는 것이 <b>구조 행렬(structure tensor)</b> M 입니다.</p>
<p><b>M = [ Σ Ix²  Σ IxIy ; Σ IxIy  Σ Iy² ]</b></p>
<p>M 의 두 <b>고유값(eigenvalue) λ1 ≥ λ2</b> 는 점 구름이 가장 길게 퍼진 방향의 크기와 그에 수직인 방향의 크기라고 생각하면 됩니다. 수학이 어렵다면 “λ = 그 방향으로 밝기가 얼마나 세게 변하나”만 기억하세요.</p>` },
      { type: 'table', head: ['종류', '(Ix, Iy) 점 구름', 'λ1 (큰 값)', 'λ2 (작은 값)'], rows: [
        ['평탄', '원점 근처에 작게 뭉침', '작음', '작음'],
        ['엣지', '한 줄로 길게', '<b>큼</b>', '작음'],
        ['코너', '두 방향으로 넓게', '<b>큼</b>', '<b>큼</b>'],
      ] },
      { type: 'code', title: '예제 4 · 패치의 기울기 산점도와 고유값 λ1, λ2', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('building.jpg', cv.IMREAD_GRAYSCALE)
gx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=3)     # Ix
gy = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=3)     # Iy
r = 20
points = {'flat': (95, 235), 'edge': (571, 359), 'corner': (775, 298)}

plt.figure(figsize=(12, 4))
for i, (name, (x, y)) in enumerate(points.items()):
    ix = gx[y - r:y + r + 1, x - r:x + r + 1].ravel()
    iy = gy[y - r:y + r + 1, x - r:x + r + 1].ravel()
    # 구조 행렬 (합 대신 평균을 써서 패치 크기와 무관한 값으로)
    M = np.array([[np.mean(ix * ix), np.mean(ix * iy)],
                  [np.mean(ix * iy), np.mean(iy * iy)]])
    lam2, lam1 = np.linalg.eigvalsh(M)             # 오름차순으로 나옴
    print('%-7s λ1 = %8.0f   λ2 = %8.0f' % (name, lam1, lam2))

    plt.subplot(1, 3, i + 1)
    plt.scatter(ix, iy, s=2, alpha=0.4)
    plt.xlim(-600, 600), plt.ylim(-600, 600), plt.gca().set_aspect('equal')
    plt.title('%s  l1=%.0f  l2=%.0f' % (name, lam1, lam2))
    plt.xlabel('Ix'), plt.ylabel('Iy')
plt.tight_layout()
plt.show()
`, desc: '<p>평탄 패치는 λ1 · λ2 가 모두 한 자리 수, 엣지는 λ1 만 크고 λ2 는 작으며, 코너는 <b>둘 다 큽니다</b>. 다음 교시의 Harris 는 이 두 값을 한 점수로 합치고, 3교시의 Shi-Tomasi 는 <b>작은 쪽 λ2</b> 를 점수로 씁니다.</p>' },
      { type: 'code', title: '예제 5 · 모든 위치에서 계산하면: “코너다움” 지도', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# 모든 픽셀에서 5×5 창의 구조 행렬을 만들고 작은 고유값 λ2 를 계산 (3교시에 다시 등장)
lam2 = cv.cornerMinEigenVal(gray, blockSize=5, ksize=3)
print('λ2 최댓값: %.4f, 평균: %.4f' % (lam2.max(), lam2.mean()))

# 보기 좋게 0~255 로 늘려 컬러맵 적용
norm = cv.normalize(np.sqrt(lam2), None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
heat = cv.applyColorMap(norm, cv.COLORMAP_JET)

# λ2 가 최댓값의 10% 보다 큰 곳 = 코너 후보 → 빨간 점
marked = img.copy()
marked[lam2 > 0.1 * lam2.max()] = (0, 0, 255)
print('코너 후보 픽셀 수:', int((lam2 > 0.1 * lam2.max()).sum()))

cv.imshow('corner-ness map (sqrt of lambda2)', heat)
cv.imshow('corner candidates', marked)
`, desc: '<p>지도에서 밝은(빨강 · 노랑) 곳은 창문 모서리와 패널 모서리에 몰려 있고, 하늘 · 벽 · 긴 경계선은 어둡습니다. 사람이 퍼즐에서 먼저 집는 조각과 거의 같습니다. 왼쪽 <b>나뭇가지</b>도 빨갛게 표시되는데, 잎 · 가지 같은 텍스처는 두 방향 변화가 모두 커서 코너처럼 보이기 때문입니다(아래 팁 참고). 이렇게 “모든 위치의 점수 지도 → 강한 곳 고르기”가 코너 검출기의 기본 구조입니다.</p>' },
      { type: 'text', html: `<h3>6. 특징 검출(Detection)과 특징 기술(Description)</h3>
<p>좋은 특징을 찾았다면, 다른 사진에서 <b>같은 특징</b>을 알아볼 수 있어야 합니다. 튜토리얼은 이를 두 단계로 나눕니다.</p>
<ul>
<li><b>특징 검출(Feature Detection)</b> — 사진에서 좋은 특징의 <b>위치</b>를 찾는 것. “여기 코너가 있다.” (Harris, Shi-Tomasi, FAST …)</li>
<li><b>특징 기술(Feature Description)</b> — 찾은 특징 <b>주변의 모습</b>을 설명하는 것. 사람이라면 “위쪽은 파란 하늘, 아래쪽은 건물, 건물에는 유리창이 있다”라고 말하겠지요. 컴퓨터는 이를 <b>숫자 벡터(기술자, descriptor)</b>로 만듭니다. (SIFT, BRIEF, ORB …)</li>
</ul>
<p>두 사진에서 기술자 벡터가 <b>가까운</b> 특징끼리 짝지으면(매칭, 7교시) 이어 붙이기 · 물체 찾기 · 3D 복원을 할 수 있습니다. 예제 3의 “패치 통째로 비교”도 사실 가장 단순한 기술자이지만, 회전 · 크기 · 밝기 변화에 약해서(0교시 실험) 더 똑똑한 기술자가 필요합니다.</p>` },
      { type: 'table', head: ['좋은 특징의 조건', '뜻', '예'], rows: [
        ['반복성 (Repeatability)', '시점 · 조명이 바뀐 사진에서도 같은 곳이 다시 검출됨', '창문 모서리는 다른 사진에서도 모서리'],
        ['구별성 (Distinctiveness)', '주변 모습이 독특해 다른 곳과 헷갈리지 않음', '예제 3의 코너: 사진 전체에서 1곳'],
        ['지역성 (Locality)', '작은 영역만 보고 판단 → 가려짐에 강함', '상자가 반쯤 가려져도 보이는 모서리로 찾기'],
        ['효율성 (Efficiency)', '실시간으로 계산할 수 있을 만큼 빠름', 'FAST · ORB (5 · 6교시)'],
      ] },
      { type: 'tip', html: `<p><b>텍스처(잔디, 나뭇잎)</b>는 λ1 · λ2 가 모두 커서 코너처럼 점수가 높게 나오기도 합니다. 하지만 비슷한 무늬가 반복되어 <b>구별성</b>이 낮으니 매칭에서 헷갈리기 쉽습니다. 7교시의 “비율 테스트”가 이런 애매한 짝을 걸러 냅니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 패치 분류기 만들기 (평탄 / 엣지 / 코너)',
        desc: `<p><code>classify(x, y)</code> 함수가 (x, y) 중심 41×41 패치의 구조 행렬 고유값 λ1 ≥ λ2 를 계산해 <b>'flat' / 'edge' / 'corner'</b> 를 돌려주도록 완성하세요. 기준값은 <code>T = 5000</code> 을 씁니다.</p>
<ul><li>λ2 &gt; T → corner</li><li>λ1 &gt; T 이고 λ2 ≤ T → edge</li><li>나머지 → flat</li></ul>
<p>결과는 원본 사진에 색 상자(평탄 파랑 · 엣지 초록 · 코너 빨강)로 표시됩니다. 8개 위치 중 몇 개가 여러분의 눈으로 본 것과 같은지 확인하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
gx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=3)
gy = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=3)
r = 20
T = 5000

def classify(x, y):
    ix = gx[y - r:y + r + 1, x - r:x + r + 1]
    iy = gy[y - r:y + r + 1, x - r:x + r + 1]
    # TODO 1: 구조 행렬 M (평균 사용) 을 만들고 고유값 lam1 >= lam2 를 구하세요
    lam1, lam2 = 0.0, 0.0
    # TODO 2: 기준값 T 로 'corner' / 'edge' / 'flat' 을 판정하세요
    kind = 'flat'
    return kind, lam1, lam2

color = {'flat': (255, 0, 0), 'edge': (0, 200, 0), 'corner': (0, 0, 255)}
tests = [(95, 235), (571, 359), (775, 298), (300, 560), (400, 150), (390, 470), (700, 120), (120, 420)]
vis = img.copy()
for (x, y) in tests:
    kind, l1, l2 = classify(x, y)
    print('(%3d, %3d) → %-6s  λ1=%8.0f  λ2=%8.0f' % (x, y, kind, l1, l2))
    cv.rectangle(vis, (x - r, y - r), (x + r, y + r), color[kind], 3)
    cv.putText(vis, kind, (x - r, y - r - 5), cv.FONT_HERSHEY_SIMPLEX, 0.5, color[kind], 2)
cv.imshow('classified patches', vis)
`,
        hint: `<p><code>M = np.array([[np.mean(ix*ix), np.mean(ix*iy)], [np.mean(ix*iy), np.mean(iy*iy)]])</code> 을 만들고 <code>lam2, lam1 = np.linalg.eigvalsh(M)</code> (작은 값이 먼저 나옵니다). 판정은 λ2 부터 검사하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
gx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=3)
gy = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=3)
r = 20
T = 5000

def classify(x, y):
    ix = gx[y - r:y + r + 1, x - r:x + r + 1]
    iy = gy[y - r:y + r + 1, x - r:x + r + 1]
    M = np.array([[np.mean(ix * ix), np.mean(ix * iy)],
                  [np.mean(ix * iy), np.mean(iy * iy)]])
    lam2, lam1 = np.linalg.eigvalsh(M)
    if lam2 > T:
        kind = 'corner'
    elif lam1 > T:
        kind = 'edge'
    else:
        kind = 'flat'
    return kind, lam1, lam2

color = {'flat': (255, 0, 0), 'edge': (0, 200, 0), 'corner': (0, 0, 255)}
tests = [(95, 235), (571, 359), (775, 298), (300, 560), (400, 150), (390, 470), (700, 120), (120, 420)]
vis = img.copy()
for (x, y) in tests:
    kind, l1, l2 = classify(x, y)
    print('(%3d, %3d) → %-6s  λ1=%8.0f  λ2=%8.0f' % (x, y, kind, l1, l2))
    cv.rectangle(vis, (x - r, y - r), (x + r, y + r), color[kind], 3)
    cv.putText(vis, kind, (x - r, y - r - 5), cv.FONT_HERSHEY_SIMPLEX, 0.5, color[kind], 2)
cv.imshow('classified patches', vis)
`,
      },
      {
        title: '실습 2 · 클릭한 곳은 좋은 특징일까? (유일성 검사기)',
        desc: `<p>사진을 클릭하면 그 위치의 31×31 패치를 사진 전체와 비교(<code>TM_SQDIFF_NORMED</code>)해 <b>거의 같은 곳(점수 &lt; 0.02)이 몇 군데인지</b> 세고, 개수에 따라 원의 색을 바꾸도록 완성하세요.</p>
<ul><li>1~3곳: 초록 (좋은 특징)</li><li>4~100곳: 노랑 (애매함)</li><li>그 이상: 빨강 (나쁜 특징)</li></ul>
<p>하늘, 벽, 창문 모서리, 잔디, 나무를 차례로 클릭해 보고 어떤 곳이 초록이 되는지 관찰하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
H, W = gray.shape
s = 15
vis = img.copy()

def on_mouse(event, x, y, flags, param):
    if event != cv.EVENT_LBUTTONDOWN:
        return
    # 패치가 사진 밖으로 나가지 않도록 중심을 안쪽으로 당기기
    x = min(max(x, s), W - s - 1)
    y = min(max(y, s), H - s - 1)
    patch = gray[y - s:y + s + 1, x - s:x + s + 1]

    # TODO 1: matchTemplate(TM_SQDIFF_NORMED) 로 거의 같은 곳(< 0.02)의 개수 count 를 구하세요
    count = 0

    # TODO 2: count 에 따라 초록 / 노랑 / 빨강 을 고르세요 (BGR)
    color = (255, 255, 255)

    cv.circle(vis, (x, y), 12, color, 3)
    cv.putText(vis, str(count), (x + 14, y), cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    print('(%d, %d) 거의 같은 곳: %d' % (x, y, count))

cv.imshow('image', vis)
cv.setMouseCallback('image', on_mouse)
print('사진을 클릭해 보세요.')
`,
        hint: `<p><code>res = cv.matchTemplate(gray, patch, cv.TM_SQDIFF_NORMED)</code> → <code>count = int((res &lt; 0.02).sum())</code>. 색은 <code>if count &lt;= 3: (0, 255, 0) elif count &lt;= 100: (0, 255, 255) else: (0, 0, 255)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
H, W = gray.shape
s = 15
vis = img.copy()

def on_mouse(event, x, y, flags, param):
    if event != cv.EVENT_LBUTTONDOWN:
        return
    x = min(max(x, s), W - s - 1)
    y = min(max(y, s), H - s - 1)
    patch = gray[y - s:y + s + 1, x - s:x + s + 1]

    res = cv.matchTemplate(gray, patch, cv.TM_SQDIFF_NORMED)
    count = int((res < 0.02).sum())

    if count <= 3:
        color = (0, 255, 0)        # 좋은 특징
    elif count <= 100:
        color = (0, 255, 255)      # 애매함
    else:
        color = (0, 0, 255)        # 나쁜 특징

    cv.circle(vis, (x, y), 12, color, 3)
    cv.putText(vis, str(count), (x + 14, y), cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    print('(%d, %d) 거의 같은 곳: %d' % (x, y, count))

cv.imshow('image', vis)
cv.setMouseCallback('image', on_mouse)
print('사진을 클릭해 보세요.')
`,
      },
    ],
    quiz: [
      { q: "퍼즐을 맞출 때 “파란 하늘 조각”보다 “건물 모서리 조각”의 자리를 찾기 쉬운 이유와 가장 관련 깊은 성질은?", options: ["주변 모습이 독특해 들어갈 자리가 한 곳뿐이다(구별성)", "밝기가 더 밝다", "색이 더 다양하다", "조각의 크기가 더 크다"], answer: 0, explain: "모서리 조각은 어느 방향으로 옮겨도 모습이 달라져 위치가 한 곳으로 정해집니다. 하늘 조각은 어디에 놓아도 비슷합니다." },
      { q: "엣지(경계선) 위의 작은 창을 움직일 때 나타나는 현상으로 옳은 것은?", options: ["어느 방향으로 움직여도 변화가 없다", "어느 방향으로 움직여도 크게 변한다", "경계에 수직으로 움직이면 크게 변하지만, 경계를 따라 움직이면 거의 변하지 않는다", "경계를 따라 움직이면 크게 변하지만, 수직으로 움직이면 변하지 않는다"], answer: 2, explain: "그래서 엣지 위의 점은 “선 위 어딘가”까지만 위치를 좁힐 수 있습니다. 예제 2 지도의 파란 골짜기가 이 방향입니다." },
      { q: "구조 행렬의 두 고유값이 λ1 = 20000, λ2 = 150 인 패치는 어떤 종류일까요?", options: ["평탄한 영역", "엣지", "코너", "판단할 수 없다"], answer: 1, explain: "한 방향(λ1)으로만 밝기 변화가 크고 수직 방향(λ2)은 작으므로 엣지입니다. 코너는 두 값이 모두 큽니다." },
      { q: "“특징 기술(Feature Description)”에 대한 설명으로 옳은 것은?", options: ["사진에서 코너의 위치를 찾는 것", "특징점의 개수를 세는 것", "사진을 흑백으로 바꾸는 전처리", "찾은 특징 주변의 모습을 숫자 벡터로 요약해 다른 사진의 특징과 비교할 수 있게 하는 것"], answer: 3, explain: "위치를 찾는 것은 검출(Detection), 주변을 벡터(기술자)로 설명하는 것이 기술(Description)입니다." },
    ],
  },

  /* ======================================================================
   * a1-2 Harris 코너 검출
   * ====================================================================== */
  {
    id: 'a1-2',
    summary: '“창을 움직였을 때의 변화”를 식으로 만든 Harris 코너 검출기의 원리(E(u,v) → 구조 행렬 M → 코너 응답 R)를 이해하고, cv.cornerHarris 로 코너를 찾아 표시합니다. 트랙바로 k · 임계값을 조절하고, connectedComponentsWithStats + cornerSubPix 로 코너 위치를 서브픽셀 정밀도로 다듬습니다.',
    goals: [
      'Harris 코너 응답 R = det(M) − k·(trace M)² 이 평탄 · 엣지 · 코너에서 어떤 값을 갖는지 설명할 수 있다',
      'cv.cornerHarris 의 입력(float32)과 blockSize · ksize · k 인자의 의미를 알고 코너를 표시할 수 있다',
      '트랙바로 k 와 임계값을 조절하며 결과 변화를 관찰할 수 있다',
      'connectedComponentsWithStats 로 코너 덩어리의 중심을 구하고 cornerSubPix 로 정밀하게 다듬을 수 있다',
      'Harris 가 회전에는 강하지만 크기 변화에는 약하다는 점을 실험으로 보일 수 있다',
    ],
    schedule: [['도입 · 지난 시간 연결', 3], ['Harris 원리', 12], ['cornerHarris 기본 사용', 8], ['k · 임계값 튜닝', 7], ['서브픽셀 정밀도', 7], ['실습 과제', 9], ['정리 · 퀴즈', 4]],
    blocks: [
      { type: 'text', html: `<h3>1. 창을 움직였을 때의 변화를 식으로</h3>
<p>지난 시간에 “코너 = 창을 <b>어느 방향</b>으로 움직여도 내용이 크게 변하는 곳”이라고 정리했습니다. 1988년 <b>Chris Harris 와 Mike Stephens</b> 는 논문 <em>A Combined Corner and Edge Detector</em> 에서 이 아이디어를 식으로 만들었습니다.</p>
<p><b>E(u, v) = Σ(x,y) w(x, y) · [ I(x+u, y+v) − I(x, y) ]²</b></p>
<ul>
<li><b>w(x, y)</b> — 창 함수. 창 안은 1, 밖은 0 인 사각 창이나, 가운데에 가중치를 더 주는 가우시안 창</li>
<li><b>I(x+u, y+v) − I(x, y)</b> — (u, v) 만큼 옮겼을 때의 밝기 차이</li>
<li>코너를 찾으려면 <b>모든 방향 (u, v)</b> 에 대해 E 가 커야 함</li>
</ul>
<p>그런데 모든 (u, v) 를 일일이 계산하면 너무 느립니다(지난 시간 예제 2 가 딱 이 계산). Harris 는 <b>테일러 전개</b>로 밝기 차이를 기울기로 근사해 식을 간단하게 만들었습니다.</p>
<p><b>E(u, v) ≈ [u v] · M · [u v]ᵀ</b>, &nbsp; <b>M = Σ w(x, y) · [ Ix²  IxIy ; IxIy  Iy² ]</b></p>
<p>지난 시간의 <b>구조 행렬 M</b> 이 그대로 나옵니다. 즉 M 하나만 알면 모든 방향의 변화를 한꺼번에 알 수 있습니다. (Ix, Iy 는 Sobel 로 구한 x · y 방향 기울기)</p>` },
      { type: 'text', html: `<h3>2. 코너 응답 R</h3>
<p>M 의 두 고유값 λ1, λ2 가 모두 크면 코너입니다. 하지만 고유값을 픽셀마다 계산하는 것은 (1988년 컴퓨터에게는) 부담이었기 때문에, Harris 는 고유값을 직접 구하지 않고도 판단할 수 있는 점수를 제안했습니다.</p>
<p><b>R = det(M) − k · (trace(M))²</b></p>
<ul>
<li>det(M) = λ1 · λ2 &nbsp;(두 값의 곱)</li>
<li>trace(M) = λ1 + λ2 &nbsp;(두 값의 합)</li>
<li>k = 0.04 ~ 0.06 사이의 경험적인 상수</li>
</ul>
<p>곱은 “둘 다 커야” 커지고, 합의 제곱은 “하나만 커도” 커집니다. 그래서 R 은 <b>둘 다 크면 양수로 크고</b>, <b>하나만 크면 음수</b>가 됩니다.</p>` },
      { type: 'table', head: ['영역', 'λ1, λ2', '|R| 과 부호', '결과 그림에서'], rows: [
        ['평탄 (Flat)', '둘 다 작음', '|R| 이 작음 (≈ 0)', '아무 표시 없음'],
        ['엣지 (Edge)', '하나만 큼 (λ1 ≫ λ2)', '<b>R &lt; 0</b> (음수)', '엣지 검출에도 활용 가능'],
        ['코너 (Corner)', '둘 다 크고 비슷함', '<b>R 이 큰 양수</b>', '빨간 점으로 표시'],
      ] },
      { type: 'code', title: '예제 1 · cv.cornerHarris 로 체스판 코너 찾기 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

filename = 'chessboard.png'
img = cv.imread(filename)
assert img is not None, "file could not be read"
# chessboard.png 는 1754×1240 으로 커서 35% 로 줄여서 사용
img = cv.resize(img, None, fx=0.35, fy=0.35, interpolation=cv.INTER_AREA)

gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
gray = np.float32(gray)                       # cornerHarris 는 float32 입력
dst = cv.cornerHarris(gray, 2, 3, 0.04)       # blockSize=2, ksize=3, k=0.04

print('R 최솟값 %.3g (엣지), 최댓값 %.3g (코너)' % (dst.min(), dst.max()))

# 결과를 굵게 보이도록 팽창 (표시용이며 결과 자체에는 영향 없음)
dst = cv.dilate(dst, None)

# 최댓값의 1% 보다 큰 곳을 빨갛게
img[dst > 0.01 * dst.max()] = [0, 0, 255]
print('코너로 표시된 픽셀 수:', int((dst > 0.01 * dst.max()).sum()))

cv.imshow('dst', img)
cv.waitKey(0)
cv.destroyAllWindows()
`, desc: '<p>흑백 칸이 만나는 모든 격자점과 판 바깥 테두리의 모서리에 빨간 점이 찍힙니다. 임계값 <code>0.01 * dst.max()</code> 는 “가장 강한 코너의 1%”라는 <b>상대적인</b> 기준이라 이미지 밝기가 달라도 그대로 쓸 수 있습니다.</p>' },
      { type: 'table', head: ['인자', '의미', '튜토리얼 값 · 팁'], rows: [
        ['<code>img</code>', '입력 이미지. 흑백 · <b>float32</b>', '<code>np.float32(gray)</code>'],
        ['<code>blockSize</code>', '코너를 판단할 이웃(창) 크기', '2 — 키우면 더 큰 구조를 코너로 봄'],
        ['<code>ksize</code>', '기울기를 구할 Sobel 커널 크기', '3 (1, 3, 5, 7 중 선택)'],
        ['<code>k</code>', 'R 식의 상수 (보통 0.04 ~ 0.06)', '0.04 — 키우면 코너 판정이 엄격해짐'],
        ['반환값', '입력과 같은 크기의 float32 응답 지도 R', '양수 큼 = 코너, 음수 = 엣지'],
      ] },
      { type: 'code', title: '예제 2 · 코너 응답 R 지도 들여다보기 (양수 = 코너, 음수 = 엣지)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('blox.jpg')
gray = np.float32(cv.cvtColor(img, cv.COLOR_BGR2GRAY))
R = cv.cornerHarris(gray, 2, 3, 0.04)

corner = R > 0.01 * R.max()
edge = R < 0.01 * R.min()          # 음수 쪽으로 강한 곳
print('코너 픽셀 %d 개, 엣지 픽셀 %d 개' % (corner.sum(), edge.sum()))

# R 은 값의 범위가 매우 넓어 부호는 유지하고 크기만 제곱근으로 줄여서 표시
view = np.sign(R) * np.sqrt(np.abs(R))
lim = np.abs(view).max()

marked = img.copy()
marked[edge] = (255, 0, 0)          # 파랑 = 엣지
marked[corner] = (0, 0, 255)        # 빨강 = 코너

plt.figure(figsize=(12, 4))
plt.subplot(131), plt.imshow(gray, cmap='gray'), plt.title('blox.jpg'), plt.axis('off')
plt.subplot(132), plt.imshow(view, cmap='bwr', vmin=-lim, vmax=lim)
plt.title('Harris R (red +, blue -)'), plt.axis('off'), plt.colorbar(fraction=0.046)
plt.subplot(133), plt.imshow(cv.cvtColor(marked, cv.COLOR_BGR2RGB))
plt.title('corners (red) / edges (blue)'), plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>R 지도에서 블록의 모서리는 <b>빨강(양수)</b>, 블록의 긴 윤곽선은 <b>파랑(음수)</b>, 배경과 면은 <b>흰색(≈ 0)</b> 입니다. 논문 제목이 “코너 <b>와 엣지</b> 검출기”인 이유가 바로 이것입니다.</p>' },
      { type: 'text', html: `<h3>3. k 와 임계값이 결과에 주는 영향</h3>
<ul>
<li><b>k 를 키우면</b> — 합의 제곱을 더 많이 빼므로 R 이 작아짐 → λ1, λ2 가 <b>정말 비슷하게 큰</b> 점만 코너로 남음 (엣지에 가까운 점이 탈락)</li>
<li><b>임계값(최댓값의 몇 %)을 낮추면</b> — 약한 코너까지 표시 → 텍스처 · 노이즈도 점이 됨</li>
<li><b>blockSize 를 키우면</b> — 더 넓은 이웃을 보고 판단 → 점 덩어리가 커지고, 작은 무늬보다 큰 구조의 모서리에 반응</li>
</ul>
<p>웹 환경에서는 트랙바 값을 <code>process(frame)</code> 안에서 읽는 패턴으로 직접 움직여 보면 감이 빠르게 옵니다.</p>` },
      { type: 'code', title: '예제 3 · 트랙바로 k · 임계값 · blockSize 조절하기', code: String.raw`
import cv2 as cv
import numpy as np

# 입력 이미지(blox.jpg, building.jpg, chessboard.png …)나 📷 웹캠, 🎞️ 동영상에서 트랙바를 움직여 보세요.
def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('k_x100', 'result', 4, 25, nothing)       # k = 값 / 100
cv.createTrackbar('thr_x1000', 'result', 10, 100, nothing)  # 임계값 = 최댓값 × 값 / 1000
cv.createTrackbar('blockSize', 'result', 2, 9, nothing)

def process(frame):
    if frame.shape[1] > 640:                                 # 큰 입력은 줄여서 속도 확보
        s = 640 / frame.shape[1]
        frame = cv.resize(frame, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
    gray = np.float32(cv.cvtColor(frame, cv.COLOR_BGR2GRAY))

    k = max(1, cv.getTrackbarPos('k_x100', 'result')) / 100
    thr = max(1, cv.getTrackbarPos('thr_x1000', 'result')) / 1000
    bs = max(2, cv.getTrackbarPos('blockSize', 'result'))

    R = cv.cornerHarris(gray, bs, 3, k)
    mask = cv.dilate(R, None) > thr * R.max()

    out = frame.copy()
    out[mask] = (0, 0, 255)
    cv.putText(out, 'k=%.2f thr=%.1f%% block=%d' % (k, thr * 100, bs), (10, 25),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return out
` },
      { type: 'text', html: `<h3>4. Harris 는 회전에는 강하고, 크기 변화에는 약하다</h3>
<p>물체가 <b>회전</b>하면 기울기의 방향은 바뀌지만 λ1, λ2 의 <b>크기</b>는 그대로입니다(점 구름이 통째로 돌 뿐). 그래서 Harris 는 <b>회전 불변(rotation invariant)</b>입니다.</p>
<p>하지만 <b>크기(scale)</b>는 다릅니다. 튜토리얼 그림처럼 작은 이미지에서는 창 하나에 쏙 들어오던 <b>둥근 모서리</b>가, 이미지를 크게 키우면 같은 크기의 창으로는 <b>완만한 곡선(엣지)</b>으로만 보입니다. 창 크기가 고정된 Harris 는 <b>크기 불변이 아닙니다</b>. 이 문제를 해결한 것이 4교시의 <b>SIFT</b> 입니다.</p>` },
      { type: 'code', title: '예제 4 · 실험: 회전해도 코너는 4개, 둥근 모서리는 크기에 따라 달라짐', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

def harris_corners(g, block, thr):
    R = cv.cornerHarris(np.float32(g), block, 3, 0.04)
    mask = np.uint8(cv.dilate(R, None) > thr)
    n = cv.connectedComponentsWithStats(mask)[0] - 1     # 점 덩어리 개수 = 코너 개수
    return n, mask

plt.figure(figsize=(13, 5.5))

# (1) 회전: 날카로운 사각형을 0 · 30 · 45 · 60° 돌리기 → 기준은 각 이미지 최댓값의 1%
square = np.zeros((300, 300), np.uint8)
cv.rectangle(square, (75, 75), (225, 225), 255, -1)
for i, angle in enumerate([0, 30, 45, 60]):
    M = cv.getRotationMatrix2D((150, 150), angle, 1.0)
    rot = cv.warpAffine(square, M, (300, 300))
    R = cv.cornerHarris(np.float32(rot), 2, 3, 0.04)
    n, mask = harris_corners(rot, 2, 0.01 * R.max())
    print('회전 %2d° → 코너 %d 개' % (angle, n))
    vis = cv.cvtColor(rot, cv.COLOR_GRAY2RGB)
    vis[mask > 0] = (255, 0, 0)
    plt.subplot(2, 5, i + 1), plt.imshow(vis), plt.title('rotate %d: %d corners' % (angle, n)), plt.axis('off')

# (2) 크기: 모서리 반지름 40 픽셀인 둥근 사각형을 점점 줄이기 → 같은 5×5 창, 같은 절대 기준
rounded = np.zeros((400, 400), np.uint8)
cv.rectangle(rounded, (140, 100), (260, 300), 255, -1)
cv.rectangle(rounded, (100, 140), (300, 260), 255, -1)
for c in [(140, 140), (260, 140), (140, 260), (260, 260)]:
    cv.circle(rounded, c, 40, 255, -1, cv.LINE_AA)
sharp = np.zeros((400, 400), np.uint8)
cv.rectangle(sharp, (100, 100), (300, 300), 255, -1)
ref = cv.cornerHarris(np.float32(sharp), 5, 3, 0.04).max()   # 날카로운 코너의 R

for i, s in enumerate([1.0, 0.5, 0.25, 0.15, 0.1]):
    small = cv.resize(rounded, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
    n, mask = harris_corners(small, 5, 0.1 * ref)                 # 날카로운 코너 R 의 10% 이상만
    print('크기 %.2f (%3d×%-3d, 모서리 반지름 약 %4.1f px) → 코너 %d 개' % (s, small.shape[1], small.shape[0], 40 * s, n))
    vis = cv.cvtColor(small, cv.COLOR_GRAY2RGB)
    vis[mask > 0] = (255, 0, 0)
    plt.subplot(2, 5, 6 + i), plt.imshow(vis), plt.title('scale %.2f: %d corners' % (s, n)), plt.axis('off')

plt.tight_layout()
plt.show()
`, desc: '<p>위 줄: 사각형을 돌려도 코너는 늘 <b>4개</b>. 아래 줄: 같은 5×5 창으로 보면, 반지름 40 · 20 · 10 픽셀의 둥근 모서리는 <b>코너 0개</b>(완만한 곡선일 뿐)이고, 반지름이 창보다 작아지는 15% · 10% 크기에서야 <b>코너 4개</b>가 됩니다. 같은 물체라도 찍힌 크기에 따라 코너 여부가 달라지는 것이죠.</p>' },
      { type: 'text', html: `<h3>5. 서브픽셀 정밀도로 코너 다듬기 (Corner with SubPixel Accuracy)</h3>
<p>Harris 결과는 코너 하나가 <b>여러 픽셀의 덩어리</b>로 표시되고, 위치도 픽셀 단위(정수)입니다. 카메라 캘리브레이션(2주차)처럼 <b>0.1 픽셀</b> 수준의 정확도가 필요할 때는 위치를 다듬어야 합니다. 튜토리얼의 방법은 다음과 같습니다.</p>
<ol>
<li>R 을 임계처리해 코너 덩어리 이진 영상을 만든다</li>
<li><code>cv.connectedComponentsWithStats()</code> 로 덩어리마다 <b>무게중심(centroid)</b>을 구한다 → 코너 하나당 점 하나</li>
<li><code>cv.cornerSubPix()</code> 가 무게중심에서 출발해, 주변 기울기를 이용해 <b>진짜 코너 위치를 반복 계산</b>으로 찾아간다</li>
</ol>
<p>반복을 언제 멈출지는 <b>criteria</b> 로 정합니다: <code>(TERM_CRITERIA_EPS + TERM_CRITERIA_MAX_ITER, 100, 0.001)</code> = “최대 100번 반복하거나, 한 번에 움직이는 거리가 0.001 보다 작아지면 멈춤”.</p>` },
      { type: 'code', title: '예제 5 · cornerSubPix 로 정밀한 코너 위치 구하기 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

filename = 'chessboard.png'
img = cv.imread(filename)
assert img is not None, "file could not be read"
img = cv.resize(img, None, fx=0.35, fy=0.35, interpolation=cv.INTER_AREA)
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# find Harris corners
gray = np.float32(gray)
dst = cv.cornerHarris(gray, 2, 3, 0.04)
dst = cv.dilate(dst, None)
ret, dst = cv.threshold(dst, 0.01 * dst.max(), 255, 0)
dst = np.uint8(dst)

# find centroids (덩어리마다 무게중심. 0번은 배경 덩어리)
ret, labels, stats, centroids = cv.connectedComponentsWithStats(dst)

# define the criteria to stop and refine the corners
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 100, 0.001)
corners = cv.cornerSubPix(gray, np.float32(centroids), (5, 5), (-1, -1), criteria)

print('코너 덩어리 수(배경 제외):', ret - 1)
print('   무게중심 (x, y)        →   서브픽셀 코너 (x, y)')
for c, s in zip(centroids[1:6], corners[1:6]):
    print('  (%7.2f, %7.2f)  →  (%7.3f, %7.3f)' % (c[0], c[1], s[0], s[1]))

# Now draw them (튜토리얼의 np.int0 는 numpy 2 에서 제거 → np.intp 사용)
res = np.hstack((centroids, corners))
res = np.intp(res)
img[res[:, 1], res[:, 0]] = [0, 0, 255]      # 빨강 = 무게중심
img[res[:, 3], res[:, 2]] = [0, 255, 0]      # 초록 = 서브픽셀 코너
cv.imshow('subpixel', img)

# 한 코너 주변을 12배 확대해서 두 점의 차이 보기
x0, y0 = int(corners[1][0]) - 6, int(corners[1][1]) - 6
crop = cv.resize(img[y0:y0 + 13, x0:x0 + 13], None, fx=12, fy=12, interpolation=cv.INTER_NEAREST)
cx, cy = (centroids[1] - (x0, y0) + 0.5) * 12
sx, sy = (corners[1] - (x0, y0) + 0.5) * 12
cv.circle(crop, (int(cx), int(cy)), 6, (0, 0, 255), 2)
cv.circle(crop, (int(sx), int(sy)), 6, (0, 255, 0), 2)
cv.imshow('zoom x12 (red: centroid, green: subpixel)', crop)
`, desc: '<p>콘솔에서 무게중심은 대부분 <b>.5</b> 로 끝나지만(덩어리의 가운데), 서브픽셀 코너는 흑백 칸이 실제로 만나는 <b>소수점 위치</b>로 옮겨 갑니다. 0번 centroid 는 배경 전체의 무게중심이므로 실제 코너가 아닙니다. 튜토리얼 코드는 이를 그대로 두었지만, 여러분의 코드에서는 <code>centroids[1:]</code> 로 빼고 쓰세요.</p>' },
      { type: 'warn', html: `<p>튜토리얼 원본의 <code>np.int0()</code> 는 <b>numpy 2 에서 삭제</b>되었습니다. <code>np.intp()</code> 또는 <code>arr.astype(int)</code> 를 쓰세요. 또 <code>cv.cornerHarris</code> 에 uint8 이미지를 넣으면 오류가 나므로 <code>np.float32(gray)</code> 변환을 잊지 마세요.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 체스판 코너 개수 세기',
        desc: `<p>시작 코드는 “코너로 표시된 <b>픽셀</b> 수”를 출력해서 수백 개가 나옵니다. 우리가 원하는 것은 “코너 <b>점</b>의 개수”입니다. <code>cv.connectedComponentsWithStats</code> 로 덩어리 수를 세어 코너 개수를 출력하고, 각 코너의 무게중심에 초록 원을 그리세요.</p>
<p>체스판은 10×7 칸입니다. <b>내부 격자점 9×6 = 54개</b>와 판 바깥 테두리의 모서리점을 합치면 몇 개가 나와야 할지 먼저 계산해 보고 결과와 비교하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('chessboard.png')
img = cv.resize(img, None, fx=0.35, fy=0.35, interpolation=cv.INTER_AREA)
gray = np.float32(cv.cvtColor(img, cv.COLOR_BGR2GRAY))

R = cv.cornerHarris(gray, 2, 3, 0.04)
R = cv.dilate(R, None)
mask = np.uint8(R > 0.01 * R.max()) * 255

# TODO 1: 픽셀 수가 아니라 덩어리(코너) 개수를 세세요 (배경 덩어리 1개는 빼기)
count = int((mask > 0).sum())
print('코너 개수:', count)

# TODO 2: 각 코너의 무게중심에 초록 원(반지름 6)을 그리세요
vis = img.copy()
cv.imshow('corners', vis)
cv.imshow('mask', mask)
`,
        hint: `<p><code>n, labels, stats, centroids = cv.connectedComponentsWithStats(mask)</code> → 코너 개수는 <code>n - 1</code>. 그리기는 <code>for (x, y) in centroids[1:]: cv.circle(vis, (int(x), int(y)), 6, (0, 255, 0), 2)</code>. 테두리 모서리점: 11×8 격자점 전체(88) − 내부(54) = 34.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('chessboard.png')
img = cv.resize(img, None, fx=0.35, fy=0.35, interpolation=cv.INTER_AREA)
gray = np.float32(cv.cvtColor(img, cv.COLOR_BGR2GRAY))

R = cv.cornerHarris(gray, 2, 3, 0.04)
R = cv.dilate(R, None)
mask = np.uint8(R > 0.01 * R.max()) * 255

n, labels, stats, centroids = cv.connectedComponentsWithStats(mask)
count = n - 1                                   # 0번(배경) 제외
print('코너 개수:', count, '(예상: 11×8 격자점 = 내부 54 + 테두리 34 = 88)')

vis = img.copy()
for (x, y) in centroids[1:]:
    cv.circle(vis, (int(x), int(y)), 6, (0, 255, 0), 2)
cv.putText(vis, 'corners: %d' % count, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
cv.imshow('corners', vis)
cv.imshow('mask', mask)
`,
      },
      {
        title: '실습 2 · 가장 강한 코너 50개만 골라 순위 매기기',
        desc: `<p><code>building.jpg</code> 에서 “최댓값의 1% 이상”으로 표시하면 빨간 덩어리가 너무 많습니다. 다음 순서로 <b>R 이 가장 큰 코너 50개</b>만 골라 원을 그리고, 상위 10개에는 순위 번호를 쓰세요.</p>
<ol><li><b>국소 최댓값</b>만 남기기: <code>R == cv.dilate(R, 9×9 커널)</code> 인 픽셀 (주변 9×9 안에서 내가 최대)</li>
<li>그중 <code>R &gt; 0.01 * R.max()</code> 인 점만 후보로</li>
<li>R 값으로 내림차순 정렬해 50개 선택</li></ol>
<p>이렇게 주변보다 큰 점만 남기는 방법을 <b>비최대 억제(Non-Maximum Suppression)</b>라고 합니다(입문 과정 Canny 에서도 등장!).</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = np.float32(cv.cvtColor(img, cv.COLOR_BGR2GRAY))
R = cv.cornerHarris(gray, 3, 3, 0.04)

# TODO 1: 9×9 안에서 국소 최댓값인 픽셀만 남기기 (cv.dilate 와 비교)
local_max = np.ones(R.shape, bool)

# TODO 2: 강한 점만 후보로 (최댓값의 1% 초과)
cand = local_max & (R > 0.01 * R.max())

ys, xs = np.nonzero(cand)
print('후보 코너 수:', len(xs))

# TODO 3: R 값 내림차순으로 정렬해 상위 50개만 고르기 (np.argsort 활용)
order = np.arange(len(xs))[:50]

vis = img.copy()
for rank, i in enumerate(order):
    cv.circle(vis, (int(xs[i]), int(ys[i])), 6, (0, 0, 255), 2)
    if rank < 10:
        cv.putText(vis, str(rank + 1), (int(xs[i]) + 7, int(ys[i]) - 7), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
cv.imshow('top corners', vis)
`,
        hint: `<p><code>dil = cv.dilate(R, np.ones((9, 9), np.uint8))</code> 후 <code>local_max = (R == dil)</code>. 정렬은 <code>order = np.argsort(-R[ys, xs])[:50]</code> (마이너스를 붙이면 큰 값부터).</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = np.float32(cv.cvtColor(img, cv.COLOR_BGR2GRAY))
R = cv.cornerHarris(gray, 3, 3, 0.04)

dil = cv.dilate(R, np.ones((9, 9), np.uint8))
local_max = (R == dil)                         # 주변 9×9 에서 내가 최대

cand = local_max & (R > 0.01 * R.max())

ys, xs = np.nonzero(cand)
print('후보 코너 수:', len(xs))

order = np.argsort(-R[ys, xs])[:50]            # R 큰 순서로 50개
print('1위 R = %.3g, 50위 R = %.3g' % (R[ys[order[0]], xs[order[0]]], R[ys[order[-1]], xs[order[-1]]]))

vis = img.copy()
for rank, i in enumerate(order):
    cv.circle(vis, (int(xs[i]), int(ys[i])), 6, (0, 0, 255), 2)
    if rank < 10:
        cv.putText(vis, str(rank + 1), (int(xs[i]) + 7, int(ys[i]) - 7), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
cv.imshow('top corners', vis)
`,
      },
    ],
    quiz: [
      { q: "Harris 코너 응답 R = det(M) − k·(trace M)² 에서, 엣지 위의 점(λ1 ≫ λ2 ≈ 0)은 R 이 어떤 값을 가질까요?", options: ["0 에 가까운 값", "큰 양수", "음수", "항상 1"], answer: 2, explain: "det = λ1·λ2 ≈ 0 인데 (λ1+λ2)² 는 크므로 R 은 음수가 됩니다. 코너는 큰 양수, 평탄 영역은 0 근처입니다." },
      { q: "cv.cornerHarris(gray, 2, 3, 0.04) 호출 전에 gray 에 해야 할 처리는?", options: ["np.float32(gray) 로 변환", "cv.Canny 로 엣지 검출", "컬러(BGR)로 변환", "0 과 1 로 이진화"], answer: 0, explain: "튜토리얼처럼 흑백 이미지를 float32 로 바꿔 넣습니다." },
      { q: "k 값을 0.04 에서 0.2 로 크게 키우면 어떤 변화가 예상되나요?", options: ["엣지까지 코너로 더 많이 표시된다", "이미지가 회전한다", "결과가 전혀 변하지 않는다", "λ1, λ2 가 정말 비슷하게 큰 점만 코너로 남아 코너가 줄어든다"], answer: 3, explain: "k 가 크면 합의 제곱을 더 많이 빼서 R 이 작아지므로 판정이 엄격해집니다." },
      { q: "튜토리얼에서 cornerSubPix 에 넘기는 시작 위치(centroids)는 어떻게 구했나요?", options: ["cv.goodFeaturesToTrack 의 결과", "R 임계처리 이진 영상의 connectedComponentsWithStats 무게중심", "cv.findContours 의 첫 번째 점", "사용자가 마우스로 클릭한 점"], answer: 1, explain: "코너 덩어리마다 무게중심을 구해 코너당 한 점을 만들고, cornerSubPix 가 그 점에서 출발해 정밀한 위치로 다듬습니다." },
      { q: "Harris 코너 검출기에 대한 설명으로 옳은 것은?", options: ["회전과 크기 변화 모두에 불변이다", "회전에는 불변이지만 크기 변화에는 불변이 아니다", "크기 변화에는 불변이지만 회전에는 약하다", "회전과 크기 변화 모두에 약하다"], answer: 1, explain: "회전하면 고유값 크기는 그대로라 회전 불변이지만, 창 크기가 고정되어 있어 크게 확대된 둥근 모서리는 엣지로 보입니다. 이 문제를 SIFT 가 해결합니다." },
    ],
  },

  /* ======================================================================
   * a1-3 Shi-Tomasi 코너와 추적용 특징
   * ====================================================================== */
  {
    id: 'a1-3',
    summary: 'Harris 의 점수를 min(λ1, λ2) 로 바꾼 Shi-Tomasi 코너 검출기와, 강한 코너 N개를 바로 좌표로 돌려주는 cv.goodFeaturesToTrack 을 익힙니다. maxCorners · qualityLevel · minDistance · mask 를 조절해 원하는 코너를 고르고, Harris 와 비교한 뒤, 웹캠 · 동영상에서 실시간으로 코너를 찾고 추적해 봅니다.',
    goals: [
      'Shi-Tomasi 점수 R = min(λ1, λ2) 의 의미와 Harris 점수와의 차이를 설명할 수 있다',
      'cv.goodFeaturesToTrack 의 maxCorners · qualityLevel · minDistance · mask 인자를 목적에 맞게 설정할 수 있다',
      '같은 이미지에서 Harris 방식과 Shi-Tomasi 방식의 결과를 비교할 수 있다',
      'process(frame) 안에서 코너를 검출하고, 광류(optical flow)로 추적하는 흐름을 이해할 수 있다',
    ],
    schedule: [['도입 · Harris 복습', 4], ['Shi-Tomasi 원리', 7], ['goodFeaturesToTrack 사용', 10], ['파라미터 · Harris 비교', 9], ['실시간 검출 · 추적', 7], ['실습 과제', 9], ['정리 · 퀴즈', 4]],
    blocks: [
      { type: 'text', html: `<h3>1. Harris 를 조금 바꾸면 더 좋아진다: Shi-Tomasi</h3>
<p>1994년 <b>J. Shi 와 C. Tomasi</b> 는 논문 <em>Good Features to Track</em> 에서 Harris 코너 검출기를 작게 고쳐 더 좋은 결과를 얻었습니다. 바뀐 것은 <b>점수 식 하나</b>뿐입니다.</p>
<ul>
<li>Harris: <b>R = λ1·λ2 − k·(λ1 + λ2)²</b></li>
<li>Shi-Tomasi: <b>R = min(λ1, λ2)</b></li>
</ul>
<p>“두 고유값 중 <b>작은 쪽</b>이 기준값보다 크면 코너”라는 뜻입니다. 두 값이 모두 커야 코너라는 원래 정의를 가장 직접적으로 옮긴 식이라, k 같은 경험적 상수도 필요 없습니다.</p>
<p>튜토리얼의 λ1–λ2 평면 그림으로 보면, 가로축 λ1 · 세로축 λ2 인 평면에서 <b>λ1 과 λ2 가 모두 λmin 보다 큰 오른쪽 위 영역(초록)</b>만 코너로 인정됩니다. 한쪽만 큰 영역(엣지)과 둘 다 작은 왼쪽 아래(평탄)는 버려집니다.</p>` },
      { type: 'table', head: ['비교', 'Harris (1988)', 'Shi-Tomasi (1994)'], rows: [
        ['코너 점수', 'λ1·λ2 − k(λ1+λ2)²', '<b>min(λ1, λ2)</b>'],
        ['추가 상수', 'k (0.04 ~ 0.06)', '없음'],
        ['OpenCV 함수', '<code>cv.cornerHarris</code> → 점수 지도', '<code>cv.goodFeaturesToTrack</code> → <b>코너 좌표 목록</b>'],
        ['점수 지도만 필요할 때', '<code>cv.cornerHarris</code>', '<code>cv.cornerMinEigenVal</code>'],
        ['주 용도', '코너 · 엣지 응답 분석', '추적(tracking)할 점 고르기, 캘리브레이션 코너'],
      ] },
      { type: 'code', title: '예제 1 · goodFeaturesToTrack 으로 가장 강한 코너 25개 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('blox.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

corners = cv.goodFeaturesToTrack(gray, 25, 0.01, 10)   # maxCorners, qualityLevel, minDistance
print('반환 모양:', corners.shape, corners.dtype)       # (N, 1, 2) float32
print('처음 3개 좌표:', corners[:3].reshape(-1, 2).tolist())

corners = np.intp(corners)          # 튜토리얼의 np.int0 → numpy 2 에서는 np.intp
for i in corners:
    x, y = i.ravel()
    cv.circle(img, (int(x), int(y)), 3, (0, 0, 255), -1)

cv.imshow('Shi-Tomasi corners', img)
`, desc: '<p><code>cornerHarris</code> 는 “점수 지도”를 돌려줘서 임계처리 · 덩어리 찾기를 직접 해야 했지만, <code>goodFeaturesToTrack</code> 은 <b>강한 순서대로 N개의 코너 좌표</b>를 바로 돌려줍니다. 결과 모양 <b>(N, 1, 2)</b> 는 OpenCV 의 점 목록 표준 형식으로, 추적 · 호모그래피 함수에 그대로 넣을 수 있습니다.</p>' },
      { type: 'table', head: ['인자', '의미', '팁'], rows: [
        ['<code>image</code>', '8비트 또는 float32 흑백 이미지', '컬러면 먼저 cvtColor'],
        ['<code>maxCorners</code>', '돌려줄 최대 코너 수 (강한 순)', '0 이하면 제한 없음'],
        ['<code>qualityLevel</code>', '최소 품질: <b>가장 강한 코너 점수 × 이 값</b> 미만은 버림', '0.01 = 최강 코너의 1%'],
        ['<code>minDistance</code>', '코너끼리 최소 거리(픽셀). 가까우면 약한 쪽을 버림', '고르게 퍼지게 하려면 키우기'],
        ['<code>mask</code>', '0 이 아닌 영역에서만 찾기 (uint8)', 'ROI 제한 · 움직이는 부분만'],
        ['<code>blockSize</code>, <code>useHarrisDetector</code>, <code>k</code>', '창 크기(기본 3), True 면 Harris 점수 사용', '비교 실험용'],
      ] },
      { type: 'text', html: `<h3>2. 파라미터가 결과를 어떻게 바꿀까?</h3>
<p><code>goodFeaturesToTrack</code> 은 내부적으로 다음 순서로 동작합니다.</p>
<ol>
<li>모든 픽셀의 min(λ1, λ2) 점수를 계산하고, 3×3 국소 최댓값만 남긴다 (비최대 억제)</li>
<li>점수가 <b>최댓값 × qualityLevel</b> 보다 작은 점을 버린다</li>
<li>남은 점을 점수 내림차순으로 정렬한다</li>
<li>강한 점부터 차례로 받아들이되, 이미 받은 점과 <b>minDistance 보다 가까우면 버린다</b></li>
<li>maxCorners 개가 차면 멈춘다</li>
</ol>
<p>그래서 <b>qualityLevel</b> 은 “얼마나 약한 코너까지 봐줄까”, <b>minDistance</b> 는 “얼마나 고르게 퍼뜨릴까”, <b>maxCorners</b> 는 “최대 몇 개”를 정합니다.</p>` },
      { type: 'code', title: '예제 2 · maxCorners · qualityLevel · minDistance 비교', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

settings = [  # (maxCorners, qualityLevel, minDistance)
    (50, 0.01, 10), (300, 0.01, 10), (1000, 0.01, 10),
    (1000, 0.1, 10), (300, 0.01, 30), (300, 0.001, 3),
]
plt.figure(figsize=(13, 6.5))
for i, (n, q, d) in enumerate(settings):
    corners = cv.goodFeaturesToTrack(gray, n, q, d)
    vis = img.copy()
    for x, y in corners.reshape(-1, 2):
        cv.circle(vis, (int(x), int(y)), 5, (0, 0, 255), -1)
    print('maxCorners=%4d quality=%.3f minDist=%2d → %4d 개' % (n, q, d, len(corners)))
    plt.subplot(2, 3, i + 1), plt.imshow(cv.cvtColor(vis, cv.COLOR_BGR2RGB))
    plt.title('max=%d q=%.3f d=%d: %d' % (n, q, d, len(corners))), plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>maxCorners 를 1000 으로 늘려도 qualityLevel 0.1 이면 약한 코너가 잘려 개수가 크게 줄어듭니다. minDistance 30 은 점들이 건물 전체에 <b>고르게 퍼지고</b>, qualityLevel 0.001 · minDistance 3 은 나무 · 잔디 같은 <b>텍스처에 점이 몰립니다</b>.</p>' },
      { type: 'code', title: '예제 3 · Harris 점수 vs Shi-Tomasi 점수 비교', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('blox.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
N, Q, D = 40, 0.01, 10

st = cv.goodFeaturesToTrack(gray, N, Q, D).reshape(-1, 2)                                     # min(λ1, λ2)
hr = cv.goodFeaturesToTrack(gray, N, Q, D, useHarrisDetector=True, k=0.04).reshape(-1, 2)     # Harris R

# 두 결과에서 3픽셀 이내로 겹치는 코너 세기
dist = np.linalg.norm(st[:, None, :] - hr[None, :, :], axis=2)
common = int((dist.min(axis=1) < 3).sum())
print('Shi-Tomasi %d 개, Harris %d 개, 공통 %d 개' % (len(st), len(hr), common))

vis = img.copy()
for x, y in hr:
    cv.circle(vis, (int(x), int(y)), 7, (255, 0, 0), 2)      # 파란 원 = Harris
for x, y in st:
    cv.circle(vis, (int(x), int(y)), 3, (0, 0, 255), -1)     # 빨간 점 = Shi-Tomasi
cv.imshow('Harris (blue ring) vs Shi-Tomasi (red dot)', cv.resize(vis, None, fx=2, fy=2))

# 점수 지도도 나란히: 둘 다 0~255 로 정규화
harris_map = cv.cornerHarris(np.float32(gray), 3, 3, 0.04)
st_map = cv.cornerMinEigenVal(gray, 3, 3)
h_vis = cv.normalize(np.maximum(harris_map, 0) ** 0.5, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
s_vis = cv.normalize(st_map ** 0.5, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
cv.imshow('score maps: Harris | min eigenvalue', np.hstack([h_vis, s_vis]))
`, desc: '<p>두 방식은 대부분 같은 코너를 고르지만 순위가 조금 다릅니다. Harris 는 λ1 이 아주 크면 λ2 가 약간 작아도 점수가 높아질 수 있고, Shi-Tomasi 는 <b>약한 방향(λ2)</b>만 보기 때문에 “두 방향 모두 확실한” 점을 더 우선합니다. 추적할 점을 고를 때 Shi-Tomasi 가 선호되는 이유입니다.</p>' },
      { type: 'text', html: `<h3>3. mask 와 서브픽셀: 원하는 곳에서, 정확하게</h3>
<ul>
<li><b>mask</b> — 같은 크기의 uint8 영상에서 <b>0 이 아닌 곳에서만</b> 코너를 찾습니다. 관심 영역(ROI)만 보거나, 이미 찾은 점 주변을 제외할 때 씁니다.</li>
<li><b>cornerSubPix</b> — 지난 시간처럼, goodFeaturesToTrack 의 결과도 <code>cv.cornerSubPix</code> 로 소수점 위치까지 다듬을 수 있습니다. 결과가 이미 (N, 1, 2) float32 라 바로 넣으면 됩니다.</li>
</ul>` },
      { type: 'code', title: '예제 4 · mask 로 영역 제한 + cornerSubPix 로 다듬기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# 건물 오른쪽 위 창문 영역만 (x 600~868, y 0~320)
mask = np.zeros(gray.shape, np.uint8)
mask[0:320, 600:868] = 255

corners = cv.goodFeaturesToTrack(gray, 60, 0.01, 10, mask=mask)
print('영역 안 코너:', len(corners))

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 40, 0.001)
refined = cv.cornerSubPix(gray, corners.copy(), (5, 5), (-1, -1), criteria)
shift = np.linalg.norm(refined - corners, axis=2).ravel()
print('서브픽셀로 움직인 거리: 평균 %.2f px, 최대 %.2f px' % (shift.mean(), shift.max()))

vis = img.copy()
cv.rectangle(vis, (600, 0), (867, 320), (0, 255, 255), 2)
for x, y in refined.reshape(-1, 2):
    cv.circle(vis, (int(round(x)), int(round(y))), 4, (0, 0, 255), -1)
cv.imshow('masked corners', vis)
`, desc: '<p>노란 상자 밖에는 점이 하나도 없습니다. 서브픽셀 이동 거리는 평균 1~2 px 정도인데, 체스판처럼 흑백이 X자로 교차하는 코너보다 건물 모서리처럼 모양이 불규칙한 코너에서 더 크게 움직입니다. 그래서 <code>cornerSubPix</code> 는 주로 체스판 · 마커처럼 <b>모양이 뚜렷한 코너</b>에 씁니다. mask 는 “움직이는 영역에서만 찾기”(실습 2), “칸마다 나눠 고르게 찾기”(실습 1)에 그대로 쓰입니다.</p>' },
      { type: 'text', html: `<h3>4. 왜 “추적용(to Track)” 특징일까?</h3>
<p>동영상에서 물체를 따라가려면, 한 프레임의 점이 다음 프레임에서 <b>어디로 갔는지</b> 찾아야 합니다. 이때 평탄한 점은 어디로 갔는지 알 수 없고, 엣지 위의 점은 엣지를 따라 미끄러져도 구분이 안 됩니다(<b>조리개 문제, aperture problem</b>). 두 방향 모두 변화가 확실한 코너, 즉 <b>min(λ1, λ2) 가 큰 점</b>만 안정적으로 따라갈 수 있습니다. 이것이 논문 제목이 “추적하기 좋은 특징”인 이유입니다.</p>
<p>OpenCV 에서는 <code>goodFeaturesToTrack</code> 으로 점을 고르고 <code>cv.calcOpticalFlowPyrLK</code>(Lucas-Kanade 광류)로 다음 프레임의 위치를 찾는 조합이 가장 흔합니다. 이번 교시에서는 실시간 검출을 먼저 해 보고, 추적은 맛보기로만 실행해 봅니다.</p>` },
      { type: 'code', title: '예제 5 · 웹캠 · 동영상에서 실시간 Shi-Tomasi 코너', code: String.raw`
import cv2 as cv
import numpy as np
import time

# 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸세요. 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 골라도 됩니다.
def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('maxCorners', 'result', 100, 500, nothing)
cv.createTrackbar('quality_x1000', 'result', 10, 300, nothing)   # qualityLevel = 값 / 1000
cv.createTrackbar('minDistance', 'result', 10, 50, nothing)

def process(frame):
    t0 = time.perf_counter()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    n = max(1, cv.getTrackbarPos('maxCorners', 'result'))
    q = max(1, cv.getTrackbarPos('quality_x1000', 'result')) / 1000
    d = max(1, cv.getTrackbarPos('minDistance', 'result'))

    corners = cv.goodFeaturesToTrack(gray, n, q, d)
    out = frame.copy()
    count = 0 if corners is None else len(corners)
    if corners is not None:
        for x, y in corners.reshape(-1, 2):
            cv.circle(out, (int(x), int(y)), 4, (0, 255, 0), -1)

    ms = (time.perf_counter() - t0) * 1000
    cv.putText(out, '%d corners  q=%.3f d=%d  %.0f ms' % (count, q, d, ms), (10, 25),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    return out
`, desc: '<p>코너가 하나도 없는 화면(렌즈를 손으로 가림)에서는 <code>goodFeaturesToTrack</code> 이 <b>None</b> 을 돌려줄 수 있으니 꼭 검사하세요. 640×480 에서도 수 ms~수십 ms 로 매우 빠릅니다.</p>' },
      { type: 'code', title: '예제 6 · 맛보기: 코너를 골라 광류(Lucas-Kanade)로 추적하기', code: String.raw`
import cv2 as cv
import numpy as np

# 입력 소스를 🎞️ 동영상(vtest.mp4)이나 📷 웹캠으로 두고 실행하세요. 걷는 사람을 따라 선이 그려집니다.
state = {'prev': None, 'pts': None, 'trail': None}

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    s = state
    # 첫 프레임이거나, 입력 크기가 바뀌었거나, 남은 점이 적으면 새로 코너 고르기
    if s['prev'] is None or s['prev'].shape != gray.shape or s['pts'] is None or len(s['pts']) < 20:
        s['pts'] = cv.goodFeaturesToTrack(gray, 150, 0.01, 10)
        s['prev'] = gray
        s['trail'] = np.zeros_like(frame)
        return frame

    new_pts, status, err = cv.calcOpticalFlowPyrLK(s['prev'], gray, s['pts'], None,
                                                   winSize=(15, 15), maxLevel=2)
    move = np.linalg.norm(new_pts - s['pts'], axis=2).ravel()
    ok = (status.ravel() == 1) & (move < 20)                # 추적 성공 + 한 프레임에 20px 이상 튄 점은 버림
    good_new = new_pts[ok].reshape(-1, 2)
    good_old = s['pts'][ok].reshape(-1, 2)

    s['trail'] = (s['trail'] * 0.9).astype(np.uint8)          # 오래된 선은 서서히 흐리게
    for (a, b), (c, d) in zip(good_new, good_old):
        cv.line(s['trail'], (int(a), int(b)), (int(c), int(d)), (0, 255, 0), 2)
    out = cv.add(frame, s['trail'])
    for a, b in good_new:
        cv.circle(out, (int(a), int(b)), 3, (0, 0, 255), -1)
    cv.putText(out, 'tracking %d points' % len(good_new), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

    s['prev'] = gray
    s['pts'] = good_new.reshape(-1, 1, 2)
    return out
`, desc: '<p>함수 밖의 <code>state</code> 딕셔너리에 이전 프레임과 점들을 보관합니다. 멈춰 있는 배경의 코너는 제자리에 있고, 걷는 사람 위의 코너만 초록 꼬리를 그립니다. 광류 자체는 이번 과정의 범위 밖이지만, “좋은 코너를 고르면 따라가기 쉽다”는 감만 잡으면 충분합니다.</p>' },
      { type: 'tip', html: `<p>2주차 카메라 캘리브레이션의 <code>findChessboardCorners</code> 결과를 다듬을 때도, 3교시의 <code>cornerSubPix</code> 를 그대로 씁니다. 코너 검출 · 서브픽셀 다듬기는 3D 비전의 기초 부품입니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 코너를 사진 전체에 고르게 퍼뜨리기 (격자 검출)',
        desc: `<p><code>building.jpg</code> 에서 코너 160개를 한꺼번에 찾으면 창문과 나뭇가지에 몰립니다. 사진을 <b>4×4 = 16칸</b>으로 나누고, 칸마다 <code>mask</code> 를 만들어 <b>칸당 최대 10개</b>씩 찾아 합치세요. 칸별 개수를 출력하고, 칸의 경계선과 코너를 그려 한 번에 찾은 결과(빨강)와 격자 방식(초록)을 비교합니다. (SLAM 같은 추적 시스템에서 실제로 쓰는 방법입니다.)</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
H, W = gray.shape
G = 4          # 4×4 격자
PER = 10       # 칸당 최대 개수

# 비교용: 한꺼번에 160개
all_pts = cv.goodFeaturesToTrack(gray, G * G * PER, 0.01, 10).reshape(-1, 2)

grid_pts = []
for r in range(G):
    for c in range(G):
        y0, y1 = r * H // G, (r + 1) * H // G
        x0, x1 = c * W // G, (c + 1) * W // G
        # TODO 1: 이 칸만 255 인 mask 를 만드세요
        # TODO 2: mask 를 넣어 goodFeaturesToTrack(gray, PER, 0.01, 10, mask=mask) 호출
        # TODO 3: 결과가 None 이 아니면 grid_pts 에 좌표를 추가하고 칸별 개수를 출력
        pass

vis_all = img.copy()
for x, y in all_pts:
    cv.circle(vis_all, (int(x), int(y)), 4, (0, 0, 255), -1)
vis_grid = img.copy()
for x, y in grid_pts:
    cv.circle(vis_grid, (int(x), int(y)), 4, (0, 255, 0), -1)
for i in range(1, G):
    cv.line(vis_grid, (i * W // G, 0), (i * W // G, H), (255, 255, 255), 1)
    cv.line(vis_grid, (0, i * H // G), (W, i * H // G), (255, 255, 255), 1)
print('한꺼번에: %d 개, 격자 방식: %d 개' % (len(all_pts), len(grid_pts)))
cv.imshow('all at once', vis_all)
cv.imshow('grid', vis_grid)
`,
        hint: `<p><code>mask = np.zeros_like(gray); mask[y0:y1, x0:x1] = 255</code>. 결과는 <code>pts.reshape(-1, 2)</code> 로 펴서 <code>grid_pts.extend(pts.reshape(-1, 2).tolist())</code>. 하늘처럼 코너가 없는 칸은 None 이 나올 수 있습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
H, W = gray.shape
G = 4
PER = 10

all_pts = cv.goodFeaturesToTrack(gray, G * G * PER, 0.01, 10).reshape(-1, 2)

grid_pts = []
for r in range(G):
    row = []
    for c in range(G):
        y0, y1 = r * H // G, (r + 1) * H // G
        x0, x1 = c * W // G, (c + 1) * W // G
        mask = np.zeros_like(gray)
        mask[y0:y1, x0:x1] = 255
        pts = cv.goodFeaturesToTrack(gray, PER, 0.01, 10, mask=mask)
        n = 0 if pts is None else len(pts)
        if pts is not None:
            grid_pts.extend(pts.reshape(-1, 2).tolist())
        row.append(n)
    print('행 %d 칸별 개수:' % r, row)

vis_all = img.copy()
for x, y in all_pts:
    cv.circle(vis_all, (int(x), int(y)), 4, (0, 0, 255), -1)
vis_grid = img.copy()
for x, y in grid_pts:
    cv.circle(vis_grid, (int(x), int(y)), 4, (0, 255, 0), -1)
for i in range(1, G):
    cv.line(vis_grid, (i * W // G, 0), (i * W // G, H), (255, 255, 255), 1)
    cv.line(vis_grid, (0, i * H // G), (W, i * H // G), (255, 255, 255), 1)
print('한꺼번에: %d 개, 격자 방식: %d 개' % (len(all_pts), len(grid_pts)))
cv.imshow('all at once', vis_all)
cv.imshow('grid', vis_grid)
`,
      },
      {
        title: '실습 2 · 움직이는 곳에서만 코너 찾기 (mask 활용)',
        desc: `<p>입력 소스를 <b>🎞️ 동영상 vtest.mp4</b>(또는 📷 웹캠)로 두고, 이전 프레임과의 <b>차이가 큰 곳(움직이는 곳)</b>에서만 코너를 찾도록 <code>process(frame)</code> 를 완성하세요.</p>
<ol><li><code>cv.absdiff</code> 로 이전 흑백 프레임과의 차이 → 임계값 25 로 이진화 → <code>cv.dilate</code> 로 넓히기 = mask</li>
<li><code>goodFeaturesToTrack(gray, 200, 0.01, 7, mask=mask)</code></li>
<li>mask 는 오른쪽에 함께 반환해 확인</li></ol>
<p>걷는 사람들 위에만 초록 점이 찍히면 성공입니다. (이미지 입력에서는 움직임이 없어 점이 없습니다.)</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

state = {'prev': None}

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    prev = state['prev']
    state['prev'] = gray
    if prev is None or prev.shape != gray.shape:      # 첫 프레임 · 크기 변경 시
        return frame, np.zeros_like(gray)

    # TODO 1: 이전 프레임과의 차이로 움직임 mask 만들기 (absdiff → threshold 25 → dilate)
    mask = np.full_like(gray, 255)

    # TODO 2: mask 안에서만 코너 찾기
    corners = cv.goodFeaturesToTrack(gray, 200, 0.01, 7)

    out = frame.copy()
    if corners is not None:
        for x, y in corners.reshape(-1, 2):
            cv.circle(out, (int(x), int(y)), 4, (0, 255, 0), -1)
    return out, mask
`,
        hint: `<p><code>diff = cv.absdiff(gray, prev)</code>, <code>_, mask = cv.threshold(diff, 25, 255, cv.THRESH_BINARY)</code>, <code>mask = cv.dilate(mask, np.ones((9, 9), np.uint8))</code>. 호출은 <code>cv.goodFeaturesToTrack(gray, 200, 0.01, 7, mask=mask)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

state = {'prev': None}

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    prev = state['prev']
    state['prev'] = gray
    if prev is None or prev.shape != gray.shape:
        return frame, np.zeros_like(gray)

    diff = cv.absdiff(gray, prev)
    _, mask = cv.threshold(diff, 25, 255, cv.THRESH_BINARY)
    mask = cv.dilate(mask, np.ones((9, 9), np.uint8))

    corners = cv.goodFeaturesToTrack(gray, 200, 0.01, 7, mask=mask)

    out = frame.copy()
    n = 0
    if corners is not None:
        n = len(corners)
        for x, y in corners.reshape(-1, 2):
            cv.circle(out, (int(x), int(y)), 4, (0, 255, 0), -1)
    cv.putText(out, 'moving corners: %d' % n, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    return out, mask
`,
      },
    ],
    quiz: [
      { q: "Shi-Tomasi 코너 검출기의 점수 식은?", options: ["R = λ1 + λ2", "R = λ1·λ2 − k(λ1 + λ2)²", "R = min(λ1, λ2)", "R = max(λ1, λ2)"], answer: 2, explain: "두 고유값 중 작은 쪽이 기준보다 크면 코너입니다. 두 방향 모두 변화가 커야 한다는 정의를 그대로 옮긴 식입니다." },
      { q: "cv.goodFeaturesToTrack(gray, 100, 0.05, 20) 에서 0.05 의 의미는?", options: ["코너 점수가 0.05 이상인 점만", "상위 5% 코너만 반환", "코너끼리 최소 5% 거리 유지", "가장 강한 코너 점수의 5% 보다 약한 점은 버림"], answer: 3, explain: "qualityLevel 은 상대 기준입니다. 최댓값 × 0.05 미만인 점을 버립니다." },
      { q: "코너들이 한곳에 뭉치지 않고 사진 전체에 고르게 퍼지게 하려면 우선 어떤 인자를 키워야 할까요?", options: ["minDistance", "qualityLevel", "blockSize", "k"], answer: 0, explain: "minDistance 보다 가까운 약한 코너는 버려지므로, 값을 키우면 점 사이 간격이 넓어집니다. 더 확실하게 하려면 실습 1 처럼 격자별 mask 를 씁니다." },
      { q: "goodFeaturesToTrack 의 반환값에 대한 설명으로 옳은 것은?", options: ["코너 점수 지도 (이미지와 같은 크기)", "(x, y, 점수) 튜플의 리스트", "(N, 1, 2) 모양의 float32 좌표 배열, 코너가 없으면 None 일 수 있음", "코너 위치가 255 인 이진 이미지"], answer: 2, explain: "강한 순서의 좌표 목록을 (N, 1, 2) float32 로 돌려줍니다. 코너가 없으면 None 이므로 검사가 필요합니다." },
      { q: "동영상에서 점을 추적할 때 평탄한 곳이나 엣지 위의 점보다 코너가 좋은 이유는?", options: ["코너가 더 밝기 때문에", "코너는 두 방향 모두 밝기 변화가 커서 다음 프레임에서 위치가 하나로 정해지기 때문에", "코너는 계산이 필요 없기 때문에", "엣지는 컬러 영상에서만 보이기 때문에"], answer: 1, explain: "평탄한 점은 어디로 갔는지 알 수 없고, 엣지 위의 점은 엣지를 따라 미끄러져도 구분되지 않습니다(조리개 문제)." },
    ],
  },

  /* ======================================================================
   * a1-4 SIFT: 크기 · 회전 불변 특징 (+ SURF 개념)
   * ====================================================================== */
  {
    id: 'a1-4',
    assets: ['images/adv/box.png'],
    summary: 'Harris 의 약점(크기 변화)을 해결한 SIFT 의 4단계(스케일 공간 극값 검출 → 키포인트 위치 보정 → 방향 할당 → 128차원 기술자)를 그림과 실험으로 이해합니다. cv.SIFT_create 로 키포인트와 기술자를 구하고, 이미지를 회전 · 확대 · 축소해도 매칭이 유지되는지 직접 확인합니다. SURF 는 개념과 코드만 살펴봅니다.',
    goals: [
      '가우시안 블러를 점점 키운 스케일 공간과 DoG(Difference of Gaussian)가 “블롭의 크기”를 찾는 원리를 설명할 수 있다',
      'SIFT 키포인트의 위치 · 크기(size) · 방향(angle)과 128차원 기술자가 무엇을 뜻하는지 말할 수 있다',
      'cv.SIFT_create · detect · compute · detectAndCompute · drawKeypoints 를 사용할 수 있다',
      'SIFT 가 회전 · 크기 변화에 불변임을 매칭 실험으로 보일 수 있다',
      'SURF 가 SIFT 를 어떻게 빠르게 만들었는지 개념을 설명할 수 있다',
    ],
    schedule: [['도입 · Harris 의 한계', 4], ['스케일 공간 · DoG', 11], ['위치 보정 · 방향 · 기술자', 8], ['SIFT 사용 · 파라미터', 11], ['불변성 실험 · SURF', 6], ['실습 과제', 7], ['정리 · 퀴즈', 3]],
    blocks: [
      { type: 'text', html: `<h3>1. 크기가 달라져도 같은 점을 찾으려면?</h3>
<p>지난 시간까지 배운 Harris · Shi-Tomasi 는 <b>회전에는 강하지만 크기 변화에는 약했습니다</b>(2교시 예제 4). 창 크기가 고정되어 있어서, 크게 찍힌 둥근 모서리는 엣지로만 보이기 때문이죠. 그렇다면 해결책은 간단합니다. <b>창 크기를 여러 개 써 보고, 그 점에 가장 잘 맞는 크기를 고르면</b> 됩니다.</p>
<p>2004년 <b>D. Lowe</b> 는 논문 <em>Distinctive Image Features from Scale-Invariant Keypoints</em> 에서 이 아이디어를 완성한 <b>SIFT(Scale-Invariant Feature Transform)</b> 를 발표했습니다. SIFT 는 네 단계로 이루어집니다.</p>` },
      { type: 'table', head: ['단계', '하는 일', '한 줄 비유'], rows: [
        ['1. 스케일 공간 극값 검출', '여러 크기의 블러(DoG)에서 “가장 강하게 반응하는 위치 + 크기” 찾기', '여러 배율의 돋보기로 보며 가장 선명한 배율 고르기'],
        ['2. 키포인트 위치 보정', '소수점 위치로 다듬고, 대비가 약한 점 · 엣지 위의 점 버리기', '흐릿한 후보와 선 위의 후보 탈락'],
        ['3. 방향 할당', '주변 기울기 방향 히스토그램의 최고 방향 = 키포인트 방향', '사진마다 “위쪽”을 정해 두기'],
        ['4. 기술자 만들기', '방향 기준으로 돌린 16×16 영역 → 4×4 칸 × 8방향 = <b>128차원</b> 벡터', '주변 모습을 128개 숫자로 요약'],
      ] },
      { type: 'text', html: `<h3>2. 1단계 — 스케일 공간과 DoG</h3>
<p><b>LoG(Laplacian of Gaussian)</b> 필터는 σ(블러 정도)에 맞는 크기의 <b>블롭(작은 덩어리)</b>에 가장 강하게 반응합니다. σ 가 작으면 작은 점에, σ 가 크면 큰 덩어리에 반응하므로, σ 를 바꿔 가며 반응이 가장 큰 <b>(x, y, σ)</b> 를 찾으면 “위치”와 “크기”를 함께 알 수 있습니다.</p>
<p>LoG 는 계산이 무겁기 때문에 SIFT 는 근사값인 <b>DoG(Difference of Gaussians)</b> 를 씁니다. σ 와 kσ 로 블러한 두 영상을 <b>빼기만</b> 하면 됩니다.</p>
<ul>
<li><b>옥타브(octave)</b>: 이미지를 절반씩 줄인 피라미드의 각 층 (입문 과정의 이미지 피라미드!)</li>
<li>한 옥타브 안에서 σ 를 k 배씩 키우며 블러 → 이웃한 두 장을 빼서 DoG</li>
<li>각 픽셀을 <b>같은 층 8개 + 위 층 9개 + 아래 층 9개 = 26개 이웃</b>과 비교해 가장 크거나 작으면 후보 (극값)</li>
<li>논문 권장값: 옥타브 4개, 스케일 5단계, 처음 σ = 1.6, k = √2</li>
</ul>` },
      { type: 'code', title: '예제 1 · DoG 는 블롭의 크기에 맞는 σ 에서 가장 강하게 반응한다', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# 반지름 4 · 8 · 16 · 32 픽셀인 흰 원 네 개
img = np.zeros((140, 560), np.float32)
radii = [4, 8, 16, 32]
centers = [(40, 70), (110, 70), (210, 70), (400, 70)]
for r, c in zip(radii, centers):
    cv.circle(img, c, r, 1.0, -1, cv.LINE_AA)

k = 2 ** 0.5
sigmas = [1.6 * k ** i for i in range(9)]                     # 1.6, 2.3, 3.2, 4.5, ...
blurs = [cv.GaussianBlur(img, (0, 0), s) for s in sigmas + [sigmas[-1] * k]]
dogs = [blurs[i + 1] - blurs[i] for i in range(len(sigmas))]   # DoG = 이웃한 블러끼리 빼기

plt.figure(figsize=(12, 6))
plt.subplot(2, 1, 1), plt.imshow(img, cmap='gray'), plt.title('blobs: r = 4, 8, 16, 32'), plt.axis('off')
plt.subplot(2, 1, 2)
for r, (x, y) in zip(radii, centers):
    resp = [abs(d[y, x]) for d in dogs]                        # 원 중심에서의 DoG 반응
    best = sigmas[int(np.argmax(resp))]
    print('반지름 %2d → 반응이 가장 큰 σ = %5.1f' % (r, best))
    plt.plot(sigmas, resp, 'o-', label='r=%d (best sigma %.1f)' % (r, best))
plt.xscale('log'), plt.xlabel('sigma (log scale)'), plt.ylabel('|DoG| at blob center')
plt.legend(), plt.title('DoG response vs sigma')
plt.tight_layout()
plt.show()
`, desc: '<p>원의 반지름이 2배가 되면 반응이 가장 큰 σ 도 정확히 2배(2.3 → 4.5 → 9.1 → 18.1)가 됩니다. 게다가 <b>최고 반응값은 네 원 모두 같습니다</b>. 그래서 SIFT 는 크기가 다르게 찍힌 같은 물체에서도 같은 점을 “그 크기에 맞는 σ”로 찾아냅니다.</p>' },
      { type: 'code', title: '예제 2 · 실제 사진의 가우시안 스케일 공간과 DoG', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE).astype(np.float32)
k = 2 ** 0.5
sigmas = [1.6 * k ** i for i in range(5)]

blurs = [cv.GaussianBlur(gray, (0, 0), s) for s in sigmas]
dogs = [blurs[i + 1] - blurs[i] for i in range(4)]

plt.figure(figsize=(14, 5.5))
for i in range(5):
    plt.subplot(2, 5, i + 1), plt.imshow(blurs[i], cmap='gray')
    plt.title('Gaussian s=%.1f' % sigmas[i]), plt.axis('off')
for i in range(4):
    plt.subplot(2, 5, 6 + i), plt.imshow(np.abs(dogs[i]), cmap='magma', vmax=15)
    plt.title('|DoG| %d' % (i + 1)), plt.axis('off')

# 다음 옥타브 = 절반 크기 (입문 과정의 pyrDown)
half = cv.pyrDown(blurs[-1].astype(np.uint8))
plt.subplot(2, 5, 10), plt.imshow(half, cmap='gray'), plt.title('next octave %dx%d' % (half.shape[1], half.shape[0])), plt.axis('off')
plt.tight_layout()
plt.show()
print('옥타브 1 크기:', gray.shape[::-1], '→ 옥타브 2 크기:', half.shape[::-1])
`, desc: '<p>위 줄은 σ 를 √2 배씩 키운 블러, 아래 줄은 이웃한 두 장의 차이(DoG)입니다. 첫 DoG 는 난간 · 장식 같은 가는 무늬에, 뒤쪽 DoG 는 창문 · 탑 꼭대기 같은 큰 구조에 밝게 반응합니다. SIFT 는 이런 DoG 를 옥타브마다 만들어 26개 이웃과 비교합니다.</p>' },
      { type: 'text', html: `<h3>3. 2 · 3 · 4단계 — 걸러내고, 방향을 정하고, 요약하기</h3>
<h4>2단계: 키포인트 위치 보정 (Keypoint Localization)</h4>
<ul>
<li>테일러 전개로 극값의 위치를 <b>소수점 단위</b>로 다듬음</li>
<li>다듬은 위치의 DoG 값이 작으면(<b>대비가 약하면</b>) 버림 → OpenCV 의 <code>contrastThreshold</code> (기본 0.04)</li>
<li>DoG 는 엣지에도 강하게 반응하므로, Harris 와 같은 2×2 헤시안 행렬로 두 곡률의 <b>비율이 크면(엣지)</b> 버림 → <code>edgeThreshold</code> (기본 10)</li>
</ul>
<h4>3단계: 방향 할당 (Orientation Assignment)</h4>
<ul>
<li>키포인트 크기에 비례하는 주변 영역에서 기울기 크기 · 방향을 구해 <b>36칸(10°씩) 방향 히스토그램</b>을 만듦</li>
<li>가장 높은 막대의 방향 = 키포인트 방향. 최고값의 <b>80% 이상</b>인 막대가 또 있으면 <b>같은 위치 · 크기에 방향만 다른 키포인트를 추가</b></li>
<li>기술자를 이 방향 기준으로 만들면 이미지가 돌아가도 같은 값 → <b>회전 불변</b></li>
</ul>
<h4>4단계: 기술자 (Keypoint Descriptor)</h4>
<ul>
<li>키포인트 주변 16×16 영역을 방향 기준으로 돌려서 4×4 = 16칸으로 나눔</li>
<li>칸마다 8방향 기울기 히스토그램 → <b>16 × 8 = 128개 숫자</b></li>
<li>조명 변화에 강하도록 정규화 등 처리를 추가</li>
</ul>
<p>마지막으로 두 이미지의 키포인트는 128차원 벡터 사이의 <b>거리</b>로 짝짓습니다. 가장 가까운 것과 두 번째로 가까운 것의 거리 비율이 0.8 보다 크면 애매한 짝으로 보고 버립니다(Lowe 의 비율 테스트 → 7교시).</p>` },
      { type: 'code', title: '예제 3 · SIFT 키포인트 검출과 그리기 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('home.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

sift = cv.SIFT_create()
kp = sift.detect(gray, None)
print('키포인트 개수:', len(kp))

img = cv.drawKeypoints(gray, kp, img)
cv.imwrite('sift_keypoints.jpg', img)
cv.imshow('sift_keypoints', img)

# 크기와 방향까지 그리기
img2 = cv.drawKeypoints(gray, kp, None, flags=cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv.imwrite('sift_keypoints_rich.jpg', img2)
cv.imshow('sift_keypoints_rich', img2)
`, desc: '<p>기본 그리기는 위치만 작은 원으로, <code>DRAW_RICH_KEYPOINTS</code> 는 <b>원의 크기 = 키포인트 크기(scale)</b>, <b>원 안의 선 = 방향</b>으로 그립니다. 작은 원은 난간 · 장식 같은 작은 구조, 큰 원은 창문 · 구름 덩어리 같은 큰 구조에서 나왔습니다. 대부분의 키포인트는 작은 크기에 몰려 있습니다(예제 4 의 히스토그램).</p>' },
      { type: 'table', head: ['메서드 / 속성', '설명'], rows: [
        ['<code>sift.detect(gray, mask)</code>', '키포인트 목록만 (mask 로 영역 제한 가능, 없으면 None)'],
        ['<code>sift.compute(gray, kp)</code>', '주어진 키포인트의 기술자 계산 → <code>(kp, des)</code>'],
        ['<code>sift.detectAndCompute(gray, None)</code>', '검출 + 기술을 한 번에 (가장 많이 씀)'],
        ['<code>kp.pt</code> · <code>kp.size</code> · <code>kp.angle</code>', '위치 (x, y) · 지름(크기) · 방향(0~360°)'],
        ['<code>kp.response</code> · <code>kp.octave</code>', '반응 세기 · 검출된 옥타브(인코딩된 정수)'],
        ['<code>des</code>', '(키포인트 수, 128) 모양의 <b>float32</b> 배열'],
      ] },
      { type: 'code', title: '예제 4 · 키포인트 속성과 128차원 기술자 들여다보기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

sift = cv.SIFT_create()

# (1) 반지름 4 · 8 · 16 · 32 인 원: 크기(size)가 반지름에 비례할까?
blobs = np.zeros((140, 560), np.uint8)
for r, c in zip([4, 8, 16, 32], [(40, 70), (110, 70), (210, 70), (400, 70)]):
    cv.circle(blobs, c, r, 255, -1, cv.LINE_AA)
kp_b = sift.detect(blobs, None)
print('원 이미지 키포인트 %d 개' % len(kp_b))
seen = set()
for k in kp_b:
    key = (round(k.pt[0]), round(k.pt[1]))
    n_dir = sum(1 for j in kp_b if (round(j.pt[0]), round(j.pt[1])) == key)
    if key not in seen:
        seen.add(key)
        print('  위치 %-10s size %5.1f  같은 위치의 방향 %d 개' % (key, k.size, n_dir))
cv.imshow('blobs', cv.drawKeypoints(blobs, kp_b, None, flags=cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS))

# (2) 실제 사진: 기술자 모양과 한 키포인트의 128개 값
gray = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE)
kp, des = sift.detectAndCompute(gray, None)
print('home.jpg 키포인트 %d 개, 기술자 모양 %s, 자료형 %s' % (len(kp), des.shape, des.dtype))
i = int(np.argmax([k.response for k in kp]))                 # 반응이 가장 강한 키포인트
k = kp[i]
print('가장 강한 키포인트: pt=(%.1f, %.1f) size=%.1f angle=%.1f response=%.4f' % (k.pt[0], k.pt[1], k.size, k.angle, k.response))

plt.figure(figsize=(12, 3.8))
plt.subplot(1, 2, 1), plt.hist([k.size for k in kp], bins=40)
plt.xlabel('keypoint size (pixels)'), plt.ylabel('count'), plt.title('SIFT keypoint sizes in home.jpg')
plt.subplot(1, 2, 2), plt.bar(range(128), des[i])
for b in range(0, 128, 8):
    plt.axvline(b - 0.5, color='gray', linewidth=0.5)
plt.xlabel('descriptor index (16 cells x 8 directions)'), plt.title('128-D descriptor of the strongest keypoint')
plt.tight_layout()
plt.show()
`, desc: '<p>원의 반지름이 2배가 되면 키포인트 size 도 약 2배(5.8 → 10.8 → 21.4 → 41.6)입니다. 완전한 원은 어느 방향이나 똑같아서 방향 히스토그램에 비슷한 봉우리가 여러 개 생기고, 그래서 <b>같은 위치에 방향만 다른 키포인트가 여러 개</b> 만들어집니다(80% 규칙). 기술자 막대그래프의 회색 칸 하나(8개 값)가 4×4 칸 중 한 칸의 방향 히스토그램입니다.</p>' },
      { type: 'table', head: ['<code>cv.SIFT_create()</code> 인자', '기본값', '바꾸면'], rows: [
        ['<code>nfeatures</code>', '0 (제한 없음)', '반응이 강한 순으로 N개만 → 속도 조절에 유용'],
        ['<code>nOctaveLayers</code>', '3', '옥타브당 층 수 (논문 권장 3)'],
        ['<code>contrastThreshold</code>', '0.04', '키우면 대비 약한 점 탈락 → 개수 감소'],
        ['<code>edgeThreshold</code>', '10', '<b>키우면</b> 엣지 같은 점을 덜 버림 → 개수 증가'],
        ['<code>sigma</code>', '1.6', '첫 옥타브의 블러 σ'],
      ] },
      { type: 'code', title: '예제 5 · nfeatures · contrastThreshold · edgeThreshold 의 영향', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt
import time

img = cv.imread('messi5.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

settings = [
    ('default', dict()),
    ('nfeatures=100', dict(nfeatures=100)),
    ('contrast=0.08', dict(contrastThreshold=0.08)),
    ('edge=3', dict(edgeThreshold=3)),
]
plt.figure(figsize=(12, 7))
for i, (name, params) in enumerate(settings):
    sift = cv.SIFT_create(**params)
    t0 = time.perf_counter()
    kp = sift.detect(gray, None)
    ms = (time.perf_counter() - t0) * 1000
    print('%-15s → 키포인트 %4d 개 (%.0f ms)' % (name, len(kp), ms))
    vis = cv.drawKeypoints(img, kp, None, flags=cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
    plt.subplot(2, 2, i + 1), plt.imshow(cv.cvtColor(vis, cv.COLOR_BGR2RGB))
    plt.title('%s: %d keypoints' % (name, len(kp))), plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p><code>nfeatures=100</code> 은 반응이 강한 100개만 남기므로 속도를 맞출 때 가장 편한 손잡이입니다. <code>contrastThreshold</code> 를 키우면 관중석의 흐릿한 점이 사라지고, <code>edgeThreshold</code> 를 3 으로 줄이면 선 위의 점을 더 엄격하게 버려 개수가 줄어듭니다.</p>' },
      { type: 'text', html: `<h3>4. 정말 회전 · 크기에 불변일까? 실험으로 확인하기</h3>
<p><code>box.png</code> 를 우리가 직접 <b>회전 · 확대 · 축소</b>하면, 원본의 점이 변환된 이미지의 어디로 가야 하는지(<b>정답 위치</b>)를 변환 행렬로 정확히 계산할 수 있습니다. 두 이미지의 SIFT 기술자를 매칭한 뒤(7교시에서 자세히), 짝지어진 점이 정답 위치에서 <b>3픽셀 이내</b>인지 세어 봅니다.</p>` },
      { type: 'code', title: '예제 6 · 회전 · 확대 · 축소해도 SIFT 매칭이 유지될까?', code: String.raw`
import cv2 as cv
import numpy as np

box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
H, W = box.shape
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(box, None)
bf = cv.BFMatcher()

def transform(img, angle, scale):
    # 잘리지 않도록 캔버스를 키워서 회전 · 크기 변환
    M = cv.getRotationMatrix2D((W / 2, H / 2), angle, scale)
    c, s = abs(M[0, 0]), abs(M[0, 1])
    nW, nH = int(H * s + W * c), int(H * c + W * s)
    M[0, 2] += nW / 2 - W / 2
    M[1, 2] += nH / 2 - H / 2
    return cv.warpAffine(img, M, (nW, nH)), M

print('원본 키포인트 %d 개' % len(kp1))
print('  변환          크기       키포인트  좋은 매칭  정답(3px 이내)')
for angle, scale in [(45, 1.0), (90, 1.0), (0, 0.5), (0, 2.0), (30, 0.6)]:
    img2, M = transform(box, angle, scale)
    kp2, des2 = sift.detectAndCompute(img2, None)
    pairs = bf.knnMatch(des1, des2, k=2)
    good = [m for m, n in pairs if m.distance < 0.75 * n.distance]     # 비율 테스트 (7교시)

    correct = 0
    for m in good:
        x, y = kp1[m.queryIdx].pt
        ex, ey = M @ np.array([x, y, 1])        # 원본 점이 가야 할 위치
        gx, gy = kp2[m.trainIdx].pt              # 실제로 짝지어진 위치
        if np.hypot(ex - gx, ey - gy) < 3:
            correct += 1
    print('  회전 %2d° × %.1f  %4dx%-4d  %6d    %6d     %4d (%.0f%%)'
          % (angle, scale, img2.shape[1], img2.shape[0], len(kp2), len(good), correct, 100 * correct / max(1, len(good))))

    if (angle, scale) == (30, 0.6):
        vis = cv.drawMatches(box, kp1, img2, kp2, good[:60], None, flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
        cv.imshow('SIFT matches: rotate 30, scale 0.6', vis)
`, desc: '<p>45° 회전, 절반 축소, 2배 확대, 회전+축소 모든 경우에 <b>좋은 매칭의 90% 이상이 정답 위치</b>입니다. 템플릿 매칭(0교시)이 15° 만 돌려도 무너졌던 것과 비교해 보세요. 이것이 “Scale-Invariant” Feature Transform 의 힘입니다.</p>' },
      { type: 'warn', html: `<p>SIFT 는 특허 문제로 오랫동안 opencv-contrib 의 <code>cv.xfeatures2d.SIFT_create()</code> 에만 있었지만, <b>2020년 특허 만료 후 OpenCV 4.4 부터 메인 모듈</b>로 옮겨졌습니다. 옛날 자료의 <code>cv.xfeatures2d.SIFT_create()</code> 는 <code>cv.SIFT_create()</code> 로 바꿔 쓰세요.</p>` },
      { type: 'text', html: `<h3>5. SURF: SIFT 를 빠르게 (Speeded-Up Robust Features)</h3>
<p>SIFT 는 정확하지만 느렸습니다. 2006년 <b>H. Bay 등</b>은 SIFT 의 흐름은 유지하면서 계산을 크게 줄인 <b>SURF</b> 를 발표했습니다.</p>
<ul>
<li><b>LoG 를 상자 필터(box filter)로 근사</b> — 적분 영상(integral image)을 쓰면 필터 크기에 상관없이 덧셈 · 뺄셈 몇 번으로 계산 → 크기가 다른 필터를 병렬로 적용 가능</li>
<li><b>헤시안 행렬의 행렬식(determinant)</b>으로 크기와 위치를 함께 찾음</li>
<li><b>방향</b>: 반지름 6s 원 안의 가로 · 세로 <b>Haar 웨이블릿 응답</b>을 60° 부채꼴로 모아 최대 방향 선택. 방향이 필요 없으면 <b>U-SURF(upright)</b> 로 더 빠르게 (±15° 정도까지 견딤)</li>
<li><b>기술자</b>: 20s×20s 영역을 4×4 칸으로 나눠 칸마다 (Σdx, Σdy, Σ|dx|, Σ|dy|) → <b>64차원</b> (extended 옵션이면 128차원)</li>
<li>매칭할 때 라플라시안의 부호(밝은 블롭 / 어두운 블롭)가 다르면 비교를 건너뛰어 더 빠름</li>
</ul>
<p>논문 결과로는 SIFT 보다 약 3배 빠르고, 흐림 · 회전에는 강하지만 시점 변화 · 조명 변화에는 조금 약합니다. 단, <b>SURF 는 아직 특허 문제로 opencv-contrib 의 “nonfree” 모듈</b>에만 있어서 이 강좌의 브라우저 환경(opencv-python)에서는 실행할 수 없습니다. 아래 튜토리얼 코드는 읽기만 하세요.</p>` },
      { type: 'code', norun: true, title: '참고 · SURF 튜토리얼 코드 (opencv-contrib nonfree 필요, 실행 불가)', code: String.raw`
>>> img = cv.imread('fly.png', cv.IMREAD_GRAYSCALE)

# Create SURF object. You can specify params here or later.
# Here I set Hessian Threshold to 400
>>> surf = cv.xfeatures2d.SURF_create(400)

# Find keypoints and descriptors directly
>>> kp, des = surf.detectAndCompute(img, None)
>>> len(kp)
 699

# 너무 많으면 Hessian 임계값을 올려 50 개 정도로 줄이기
>>> surf.setHessianThreshold(50000)
>>> kp, des = surf.detectAndCompute(img, None)
>>> print( len(kp) )
47

>>> img2 = cv.drawKeypoints(img, kp, None, (255, 0, 0), 4)

# 방향 계산 끄기 (U-SURF)
>>> surf.setUpright(True)

# 기술자 크기: 64 → 128 로 바꾸기
>>> print( surf.descriptorSize() )
64
>>> surf.setExtended(True)
>>> kp, des = surf.detectAndCompute(img, None)
>>> print( surf.descriptorSize() )
128
>>> print( des.shape )
(47, 128)
` },
      { type: 'table', head: ['비교', 'SIFT (2004)', 'SURF (2006)'], rows: [
        ['크기 공간', 'DoG (가우시안 블러 빼기)', '상자 필터 + 적분 영상 (헤시안 행렬식)'],
        ['방향', '36칸 기울기 히스토그램', 'Haar 웨이블릿 응답 + 60° 부채꼴'],
        ['기술자', '128차원 float', '64차원 (확장 128)'],
        ['속도', '느림', '약 3배 빠름'],
        ['OpenCV', '<code>cv.SIFT_create()</code> (메인, 무료)', '<code>cv.xfeatures2d.SURF_create()</code> (contrib nonfree)'],
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 가장 큰 키포인트와 가장 강한 키포인트 비교',
        desc: `<p><code>messi5.jpg</code> 의 SIFT 키포인트 중 <b>size 가 가장 큰 20개</b>와 <b>response 가 가장 큰 20개</b>를 각각 골라 <code>DRAW_RICH_KEYPOINTS</code> 로 두 창에 그리세요. 두 목록의 size 평균도 출력합니다. 큰 키포인트는 무엇에서 나오고, 강한 키포인트는 무엇에서 나오나요?</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
sift = cv.SIFT_create()
kp = sift.detect(gray, None)
print('전체 키포인트:', len(kp))

# TODO 1: size 가 큰 순서로 정렬해 20개 (sorted 와 key=lambda k: k.size, reverse=True)
biggest = kp[:20]
# TODO 2: response 가 큰 순서로 정렬해 20개
strongest = kp[:20]

print('biggest   size 평균: %.1f' % np.mean([k.size for k in biggest]))
print('strongest size 평균: %.1f' % np.mean([k.size for k in strongest]))
cv.imshow('biggest 20', cv.drawKeypoints(img, biggest, None, (0, 0, 255), cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS))
cv.imshow('strongest 20', cv.drawKeypoints(img, strongest, None, (0, 255, 0), cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS))
`,
        hint: `<p><code>biggest = sorted(kp, key=lambda k: k.size, reverse=True)[:20]</code>, <code>strongest = sorted(kp, key=lambda k: k.response, reverse=True)[:20]</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
sift = cv.SIFT_create()
kp = sift.detect(gray, None)
print('전체 키포인트:', len(kp))

biggest = sorted(kp, key=lambda k: k.size, reverse=True)[:20]
strongest = sorted(kp, key=lambda k: k.response, reverse=True)[:20]

print('biggest   size 평균: %.1f' % np.mean([k.size for k in biggest]))
print('strongest size 평균: %.1f' % np.mean([k.size for k in strongest]))
for k in strongest[:5]:      # 같은 위치가 두 번 나오면 방향만 다른 키포인트(80% 규칙)
    print('  강한 점 pt=(%.0f, %.0f) size=%.1f response=%.4f' % (k.pt[0], k.pt[1], k.size, k.response))
cv.imshow('biggest 20', cv.drawKeypoints(img, biggest, None, (0, 0, 255), cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS))
cv.imshow('strongest 20', cv.drawKeypoints(img, strongest, None, (0, 255, 0), cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS))
`,
      },
      {
        title: '실습 2 · 회전 각도별 매칭 정확도 그래프',
        desc: `<p>예제 6 의 실험을 확장해 <code>box.png</code> 를 <b>0°, 30°, 60°, …, 180°</b> 로 돌리면서 (크기는 1.0) 좋은 매칭 수와 정답 비율을 구하고, matplotlib 으로 <b>각도 – 정답 매칭 수</b> 꺾은선 그래프를 그리세요(제목 · 축 이름은 영어). SIFT 는 어느 각도에서나 비슷한 성능을 보여야 합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
H, W = box.shape
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(box, None)
bf = cv.BFMatcher()

def rotate(img, angle):
    M = cv.getRotationMatrix2D((W / 2, H / 2), angle, 1.0)
    c, s = abs(M[0, 0]), abs(M[0, 1])
    nW, nH = int(H * s + W * c), int(H * c + W * s)
    M[0, 2] += nW / 2 - W / 2
    M[1, 2] += nH / 2 - H / 2
    return cv.warpAffine(img, M, (nW, nH)), M

angles = [0]              # TODO 1: 0, 30, 60, ..., 180 으로 바꾸기
corrects = []
for angle in angles:
    img2, M = rotate(box, angle)
    kp2, des2 = sift.detectAndCompute(img2, None)
    good = [m for m, n in bf.knnMatch(des1, des2, k=2) if m.distance < 0.75 * n.distance]
    # TODO 2: 예제 6 처럼 정답(3px 이내) 매칭 수 correct 를 세기
    correct = 0
    corrects.append(correct)
    print('%3d° 좋은 매칭 %d, 정답 %d' % (angle, len(good), correct))

# TODO 3: angles - corrects 꺾은선 그래프 (plt.plot, xlabel, ylabel, title, show)
`,
        hint: `<p>정답 판정: <code>ex, ey = M @ np.array([x, y, 1])</code> 와 <code>kp2[m.trainIdx].pt</code> 의 거리 <code>np.hypot(...) &lt; 3</code>. 각도 목록은 <code>list(range(0, 181, 30))</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
H, W = box.shape
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(box, None)
bf = cv.BFMatcher()

def rotate(img, angle):
    M = cv.getRotationMatrix2D((W / 2, H / 2), angle, 1.0)
    c, s = abs(M[0, 0]), abs(M[0, 1])
    nW, nH = int(H * s + W * c), int(H * c + W * s)
    M[0, 2] += nW / 2 - W / 2
    M[1, 2] += nH / 2 - H / 2
    return cv.warpAffine(img, M, (nW, nH)), M

angles = list(range(0, 181, 30))
goods, corrects = [], []
for angle in angles:
    img2, M = rotate(box, angle)
    kp2, des2 = sift.detectAndCompute(img2, None)
    good = [m for m, n in bf.knnMatch(des1, des2, k=2) if m.distance < 0.75 * n.distance]
    correct = 0
    for m in good:
        x, y = kp1[m.queryIdx].pt
        ex, ey = M @ np.array([x, y, 1])
        gx, gy = kp2[m.trainIdx].pt
        if np.hypot(ex - gx, ey - gy) < 3:
            correct += 1
    goods.append(len(good))
    corrects.append(correct)
    print('%3d° 좋은 매칭 %d, 정답 %d (%.0f%%)' % (angle, len(good), correct, 100 * correct / max(1, len(good))))

plt.plot(angles, goods, 's--', label='good matches (ratio test)')
plt.plot(angles, corrects, 'o-', label='correct matches (< 3 px)')
plt.xlabel('rotation angle (deg)'), plt.ylabel('number of matches')
plt.title('SIFT matching vs rotation (box.png)')
plt.ylim(0, None), plt.legend()
plt.show()
`,
      },
    ],
    quiz: [
      { q: "SIFT 가 Harris 코너와 달리 “크기 변화”에 강한 가장 큰 이유는?", options: ["컬러 정보를 사용해서", "이미지를 항상 같은 크기로 리사이즈하기 때문에", "여러 σ 의 DoG(스케일 공간)에서 위치와 함께 가장 잘 맞는 크기를 찾기 때문에", "Canny 엣지를 먼저 구하기 때문에"], answer: 2, explain: "스케일 공간에서 (x, y, σ) 극값을 찾으므로 크게 찍힌 물체는 큰 σ, 작게 찍힌 물체는 작은 σ 에서 같은 점이 검출됩니다." },
      { q: "SIFT 의 DoG 극값 검출에서 한 픽셀은 몇 개의 이웃과 비교하나요?", options: ["4개", "8개", "9개", "26개"], answer: 3, explain: "같은 층 8개 + 위 층 9개 + 아래 층 9개 = 26개와 비교해 가장 크거나 작을 때 후보가 됩니다." },
      { q: "SIFT 기술자가 128차원인 이유로 옳은 것은?", options: ["16×16 영역의 픽셀 256개 중 절반", "4×4 = 16칸 × 칸마다 8방향 기울기 히스토그램", "36칸 방향 히스토그램 × 3채널 + 20", "옥타브 4개 × 32"], answer: 1, explain: "키포인트 주변 16×16 영역을 4×4 칸으로 나누고 칸마다 8방향 히스토그램을 만들어 16×8 = 128 입니다." },
      { q: "SIFT 가 회전에 불변인 이유는?", options: ["기술자를 키포인트의 주 방향(기울기 히스토그램의 최고 방향) 기준으로 만들기 때문에", "회전된 이미지를 36번 만들어 모두 검사하기 때문에", "원 모양의 창만 사용하기 때문에", "흑백 이미지만 쓰기 때문에"], answer: 0, explain: "3단계에서 정한 방향을 기준으로 주변 영역을 돌려 기술자를 만들므로, 이미지가 돌아가도 같은 기술자가 나옵니다." },
      { q: "SURF 에 대한 설명으로 옳지 않은 것은?", options: ["LoG 를 상자 필터와 적분 영상으로 근사해 빠르다", "기본 기술자는 64차원이다", "upright 옵션으로 방향 계산을 생략할 수 있다", "OpenCV 4.4 부터 cv.SURF_create() 로 메인 모듈에서 무료로 쓸 수 있다"], answer: 3, explain: "메인 모듈로 옮겨진 것은 특허가 만료된 SIFT 입니다. SURF 는 아직 opencv-contrib 의 nonfree(xfeatures2d)에만 있습니다." },
    ],
  },

  /* ======================================================================
   * a1-5 FAST · BRIEF 와 이진 기술자
   * ====================================================================== */
  {
    id: 'a1-5',
    assets: ['images/adv/graf1.jpg', 'images/adv/graf3.jpg'],
    summary: '실시간용으로 만들어진 FAST 코너 검출기(원 위 16개 픽셀 비교 · 고속 테스트 · 비최대 억제)와, 특징을 0/1 비트열로 요약하는 BRIEF 이진 기술자의 원리를 익힙니다. FastFeatureDetector 의 threshold · nonmaxSuppression · type 을 바꿔 보고, BRIEF 를 numpy 로 직접 만들어 해밍 거리와 회전 약점을 확인한 뒤, 브라우저에서 실행 가능한 이진 기술자 AKAZE · BRISK 를 사용합니다.',
    goals: [
      'FAST 가 원 위 16개 픽셀의 밝기로 코너를 판정하는 방법과 threshold · n · 비최대 억제의 역할을 설명할 수 있다',
      'cv.FastFeatureDetector_create 의 threshold · nonmaxSuppression · type 을 바꾸며 결과를 비교할 수 있다',
      'BRIEF 가 점 쌍의 밝기 비교로 이진 기술자를 만들고 해밍 거리로 비교한다는 것을 설명할 수 있다',
      'BRIEF 가 회전에 약한 이유를 실험으로 보이고, AKAZE · BRISK 이진 기술자를 사용할 수 있다',
    ],
    schedule: [['도입 · 실시간의 필요', 4], ['FAST 원리', 9], ['FAST 사용 · 파라미터', 10], ['BRIEF 이진 기술자', 11], ['AKAZE · BRISK', 6], ['실습 과제', 7], ['정리 · 퀴즈', 3]],
    blocks: [
      { type: 'text', html: `<h3>1. SIFT 는 좋은데… 너무 느리다</h3>
<p>SIFT 는 정확하지만 블러를 여러 번 하고 26개 이웃을 비교하는 등 계산이 많습니다. 스마트폰 AR, 드론, 청소 로봇의 <b>SLAM</b>(지도를 만들며 자기 위치 찾기)처럼 <b>1초에 수십 장</b>을 처리하면서 배터리도 아껴야 하는 곳에서는 부담이 큽니다.</p>
<p>그래서 2000년대 후반부터 <b>“조금 덜 정확해도 훨씬 빠른”</b> 방법들이 나왔습니다. 이번 시간에는 그중 두 가지 기둥을 배웁니다.</p>
<ul>
<li><b>FAST</b> (2006, Rosten &amp; Drummond) — 아주 빠른 <b>검출기</b></li>
<li><b>BRIEF</b> (2010, Calonder 등) — 아주 빠르고 작은 <b>기술자</b></li>
</ul>
<p>다음 시간의 <b>ORB</b> 는 이 둘을 개선해 합친 것입니다.</p>` },
      { type: 'text', html: `<h3>2. FAST: 원 위의 16개 픽셀만 보고 판정</h3>
<ol>
<li>후보 픽셀 <b>p</b> 의 밝기를 Ip 라 하고, 임계값 <b>t</b> 를 정한다</li>
<li>p 를 중심으로 반지름 3 인 원(브레젠험 원) 위의 <b>16개 픽셀</b>을 본다</li>
<li>16개 중 <b>연속된 n 개</b>(보통 12, OpenCV 기본 9)가 모두 <b>Ip + t 보다 밝거나</b>, 모두 <b>Ip − t 보다 어두우면</b> → 코너</li>
</ol>
<p><b>고속 테스트(high-speed test)</b>: 원 위의 1 · 9 · 5 · 13 번 픽셀(위 · 아래 · 오른쪽 · 왼쪽)을 먼저 봅니다. n=12 일 때 코너라면 이 넷 중 <b>최소 3개</b>는 모두 밝거나 모두 어두워야 하므로, 그렇지 않으면 나머지 12개는 보지도 않고 바로 탈락시킵니다. 대부분의 픽셀이 여기서 걸러져 매우 빠릅니다.</p>
<p>이 방법에는 약점(n &lt; 12 에는 고속 테스트가 잘 안 맞음, 픽셀 확인 순서가 비효율적, 붙어 있는 코너가 여러 개 검출됨)이 있어서, 논문은 두 가지를 더합니다.</p>
<ul>
<li><b>머신러닝(결정 트리, ID3)</b>으로 “어떤 순서로 픽셀을 확인해야 가장 빨리 판정되는지” 학습</li>
<li><b>비최대 억제(Non-maximum Suppression)</b>: 코너마다 점수 V = (p 와 16개 픽셀의 밝기 차이 절댓값의 합)을 매기고, 붙어 있는 코너 중 V 가 가장 큰 것만 남김</li>
</ul>` },
      { type: 'code', title: '예제 1 · FAST 의 원 16픽셀 직접 확인하기', code: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('blox.jpg', cv.IMREAD_GRAYSCALE)
# 반지름 3 브레젠험 원 위 16개 픽셀 (1번 = 위쪽, 시계 방향)
CIRCLE = [(0, -3), (1, -3), (2, -2), (3, -1), (3, 0), (3, 1), (2, 2), (1, 3),
          (0, 3), (-1, 3), (-2, 2), (-3, 1), (-3, 0), (-3, -1), (-2, -2), (-1, -3)]
t = 10

def fast_test(x, y):
    p = int(gray[y, x])
    marks = ''
    for dx, dy in CIRCLE:
        v = int(gray[y + dy, x + dx])
        marks += 'B' if v > p + t else ('D' if v < p - t else '.')   # 밝음 / 어두움 / 비슷
    # 원형으로 이어서 가장 긴 연속 B 또는 D 길이
    longest = 0
    for ch in 'BD':
        run = 0
        for c in marks + marks:
            run = run + 1 if c == ch else 0
            longest = max(longest, min(run, 16))
    return p, marks, longest

def zoom(x, y):
    crop = cv.cvtColor(gray[y - 5:y + 6, x - 5:x + 6], cv.COLOR_GRAY2BGR)
    big = cv.resize(crop, None, fx=24, fy=24, interpolation=cv.INTER_NEAREST)
    for i, (dx, dy) in enumerate(CIRCLE):
        cx, cy = (5 + dx) * 24 + 12, (5 + dy) * 24 + 12
        cv.circle(big, (cx, cy), 9, (0, 200, 255), 2)
        cv.putText(big, str(i + 1), (cx - 8, cy + 4), cv.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)
    cv.rectangle(big, (5 * 24, 5 * 24), (6 * 24, 6 * 24), (0, 255, 0), 2)    # 가운데 p
    return big

for name, (x, y) in {'corner': (86, 146), 'edge': (38, 90), 'flat': (30, 20)}.items():
    p, marks, longest = fast_test(x, y)
    verdict = '코너' if longest >= 9 else '코너 아님'
    print('%-6s (%3d,%3d) Ip=%3d  원 16픽셀: %s  최장 연속 %2d → n=9 기준 %s' % (name, x, y, p, marks, longest, verdict))
    cv.imshow('FAST circle: ' + name, zoom(x, y))
`, desc: '<p>B = Ip+t 보다 밝음, D = Ip−t 보다 어두움, . = 비슷함. 코너 점은 16개가 모두 D(주변보다 밝은 작은 점), 엣지 점은 B 와 D 가 반반으로 나뉘어 연속 길이가 짧고, 평탄한 점은 모두 “.” 입니다. 확대 그림에서 노란 원 16개가 FAST 가 실제로 보는 픽셀입니다.</p>' },
      { type: 'code', title: '예제 2 · FastFeatureDetector 기본 사용과 비최대 억제 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('blox.jpg', cv.IMREAD_GRAYSCALE)

# Initiate FAST object with default values
fast = cv.FastFeatureDetector_create()

# find and draw the keypoints
kp = fast.detect(img, None)
img2 = cv.drawKeypoints(img, kp, None, color=(255, 0, 0))

# Print all default params
print("Threshold: {}".format(fast.getThreshold()))
print("nonmaxSuppression:{}".format(fast.getNonmaxSuppression()))
print("neighborhood: {}".format(fast.getType()))
print("Total Keypoints with nonmaxSuppression: {}".format(len(kp)))
cv.imwrite('fast_true.png', img2)

# Disable nonmaxSuppression
fast.setNonmaxSuppression(0)
kp = fast.detect(img, None)
print("Total Keypoints without nonmaxSuppression: {}".format(len(kp)))
img3 = cv.drawKeypoints(img, kp, None, color=(255, 0, 0))
cv.imwrite('fast_false.png', img3)

cv.imshow('fast_true (NMS on)', cv.resize(img2, None, fx=2, fy=2))
cv.imshow('fast_false (NMS off)', cv.resize(img3, None, fx=2, fy=2))
`, desc: '<p>기본값은 threshold=10, 비최대 억제 켬, neighborhood=2(<code>TYPE_9_16</code>: 16픽셀 중 연속 9개)입니다. 비최대 억제를 끄면 코너 하나에 점이 여러 개씩 뭉쳐 개수가 3배 이상 늘어납니다. 블러도 스케일 공간도 없어서 두 결과 모두 <b>수 밀리초 이내</b>로 계산됩니다.</p>' },
      { type: 'table', head: ['설정', '메서드 / 값', '설명'], rows: [
        ['threshold', '<code>setThreshold(t)</code> · 기본 10', '밝기 차이 기준 t. 키우면 대비가 뚜렷한 코너만 → 개수 감소'],
        ['nonmaxSuppression', '<code>setNonmaxSuppression(b)</code> · 기본 True', '붙어 있는 코너 중 점수가 가장 큰 것만'],
        ['type', '<code>cv.FAST_FEATURE_DETECTOR_TYPE_9_16</code> (2, 기본)', '원 16픽셀 중 연속 9개'],
        ['', '<code>cv.FAST_FEATURE_DETECTOR_TYPE_7_12</code> (1)', '원 12픽셀 중 연속 7개 (더 작은 원)'],
        ['', '<code>cv.FAST_FEATURE_DETECTOR_TYPE_5_8</code> (0)', '원 8픽셀 중 연속 5개 (가장 작은 원)'],
        ['생성자', '<code>cv.FastFeatureDetector_create(threshold, nonmaxSuppression, type)</code>', '한 번에 지정 가능'],
      ] },
      { type: 'code', title: '예제 3 · 트랙바로 threshold · type · 비최대 억제 바꾸기 (실시간)', code: String.raw`
import cv2 as cv
import time

# 이미지 입력, 📷 웹캠, 🎞️ 동영상(vtest.mp4 등) 어디서나 동작합니다.
def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('threshold', 'result', 20, 100, nothing)
cv.createTrackbar('type', 'result', 2, 2, nothing)     # 0: 5_8, 1: 7_12, 2: 9_16
cv.createTrackbar('NMS', 'result', 1, 1, nothing)
fast = cv.FastFeatureDetector_create()
TYPE_NAMES = ['TYPE_5_8', 'TYPE_7_12', 'TYPE_9_16']

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    fast.setThreshold(max(1, cv.getTrackbarPos('threshold', 'result')))
    t = cv.getTrackbarPos('type', 'result')
    fast.setType(t)
    fast.setNonmaxSuppression(bool(cv.getTrackbarPos('NMS', 'result')))

    t0 = time.perf_counter()
    kp = fast.detect(gray, None)
    ms = (time.perf_counter() - t0) * 1000

    out = cv.drawKeypoints(frame, kp, None, color=(0, 255, 0))
    cv.putText(out, '%s  %d kp  %.1f ms' % (TYPE_NAMES[t], len(kp), ms), (10, 25),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    return out
`, desc: '<p>640×480 웹캠 영상에서도 검출 시간이 몇 ms 에 불과합니다. threshold 를 올리면 대비가 강한 코너만 남고, NMS 를 끄면 점이 뭉칩니다. type 을 0 으로 바꾸면 원이 작아져 더 작은 무늬에 반응하지만 판정이 엄격해 개수가 크게 달라집니다.</p>' },
      { type: 'text', html: `<h3>3. BRIEF: 128개 실수 대신 256개 비트로</h3>
<p>SIFT 기술자는 128개의 <b>float32</b> = 512바이트, 키포인트 수천 개면 수 MB 입니다. 매칭할 때도 128차원 실수 거리 계산을 수백만 번 해야 합니다. 그런데 매칭에 정말 그렇게 많은 정보가 필요할까요?</p>
<p><b>BRIEF(Binary Robust Independent Elementary Features)</b> 의 아이디어는 아주 단순합니다.</p>
<ol>
<li>키포인트 주변 패치를 <b>블러</b>로 부드럽게 한다 (노이즈에 강하게)</li>
<li>패치 안에서 미리 정해 둔 <b>점 쌍 (p, q)</b> 을 nd 개(128 · 256 · 512) 고른다</li>
<li>쌍마다 <b>I(p) &lt; I(q) 이면 1, 아니면 0</b> → nd 비트의 이진 문자열</li>
</ol>
<p>256비트면 <b>32바이트</b>로 SIFT 의 1/16 입니다. 두 기술자의 비교는 <b>해밍 거리(Hamming distance)</b> = “서로 다른 비트의 개수”로, XOR 한 번과 비트 세기로 끝나 CPU 에서 매우 빠릅니다.</p>
<ul>
<li>BRIEF 는 <b>기술자</b>일 뿐이라 검출기(FAST, CenSurE/STAR 등)와 함께 씁니다</li>
<li>점 쌍의 위치가 패치에 <b>고정</b>되어 있어서 이미지가 <b>회전하면 비교 결과가 달라집니다</b> → 회전에 약함 (ORB 가 해결)</li>
</ul>` },
      { type: 'code', norun: true, title: '참고 · BRIEF 튜토리얼 코드 (opencv-contrib 필요, 실행 불가)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('simple.jpg', cv.IMREAD_GRAYSCALE)

# Initiate FAST detector (STAR = CenSurE 검출기)
star = cv.xfeatures2d.StarDetector_create()

# Initiate BRIEF extractor
brief = cv.xfeatures2d.BriefDescriptorExtractor_create()

# find the keypoints with STAR
kp = star.detect(img, None)

# compute the descriptors with BRIEF
kp, des = brief.compute(img, kp)

print( brief.descriptorSize() )   # 32 (바이트) = 256 비트
print( des.shape )                # (키포인트 수, 32)
`, desc: '<p><code>cv.xfeatures2d</code> 는 opencv-contrib 에만 있어 이 강좌의 브라우저 환경에서는 실행되지 않습니다. 대신 아래 예제에서 BRIEF 를 numpy 로 직접 만들어 원리를 확인합니다.</p>' },
      { type: 'code', title: '예제 4 · numpy 로 만드는 미니 BRIEF 와 해밍 거리 실험', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
H, W = gray.shape
rng = np.random.default_rng(1)
PAIRS = rng.integers(-12, 13, size=(256, 4))       # 25×25 패치 안의 점 쌍 256개: (x1, y1, x2, y2)

def mini_brief(img, pts):
    smooth = cv.GaussianBlur(img, (9, 9), 2)         # 1) 블러
    xs = np.round(pts[:, 0]).astype(int)[:, None]
    ys = np.round(pts[:, 1]).astype(int)[:, None]
    a = smooth[ys + PAIRS[:, 1], xs + PAIRS[:, 0]].astype(int)
    b = smooth[ys + PAIRS[:, 3], xs + PAIRS[:, 2]].astype(int)
    bits = (a < b).astype(np.uint8)                  # 2) 점 쌍 비교 → 0/1
    return np.packbits(bits, axis=1)                 # 3) 256비트 → 32바이트

def hamming(d1, d2):
    return np.unpackbits(d1 ^ d2, axis=1).sum(axis=1)   # XOR 후 1 의 개수

# FAST 로 키포인트 80개 (가장자리 제외)
kp = sorted(cv.FastFeatureDetector_create(20).detect(gray, None), key=lambda k: -k.response)
pts = np.array([k.pt for k in kp if 60 < k.pt[0] < W - 60 and 60 < k.pt[1] < H - 60])[:80]
des = mini_brief(gray, pts)
print('기술자 모양:', des.shape, des.dtype, '→ 키포인트당', des.shape[1], '바이트')
print('첫 기술자 앞 32비트:', ''.join(map(str, np.unpackbits(des[0])[:32])))

tests = {}
tests['brighter (+40)'] = hamming(des, mini_brief(cv.convertScaleAbs(gray, alpha=1.0, beta=40), pts))
noisy = np.clip(gray + rng.normal(0, 8, gray.shape), 0, 255).astype(np.uint8)
tests['noise (sigma 8)'] = hamming(des, mini_brief(noisy, pts))
M = cv.getRotationMatrix2D((W / 2, H / 2), 30, 1.0)
rotated = cv.warpAffine(gray, M, (W, H))
pts_r = (M @ np.hstack([pts, np.ones((len(pts), 1))]).T).T      # 같은 점이 회전 후 간 위치
tests['rotated 30 deg'] = hamming(des, mini_brief(rotated, pts_r))
tests['different points'] = hamming(des, np.roll(des, 1, axis=0))

plt.figure(figsize=(10, 4))
for name, h in tests.items():
    print('%-17s 같은 점끼리 해밍 거리 평균 %5.1f / 256' % (name, h.mean()))
    plt.hist(h, bins=range(0, 257, 8), alpha=0.6, label=name)
plt.xlabel('Hamming distance (out of 256 bits)'), plt.ylabel('count')
plt.title('Mini BRIEF: same point under changes'), plt.legend()
plt.show()
`, desc: '<p>밝기를 올려도(대소 비교는 그대로) 거리 ≈ 0, 노이즈를 넣어도 몇 비트 차이뿐입니다. 서로 <b>다른 점</b>끼리는 256비트의 절반쯤(약 120) 다릅니다. 그런데 이미지를 <b>30° 만 돌려도</b> 같은 점끼리 70비트 이상 달라져 다른 점과 헷갈리기 시작합니다. 점 쌍이 패치에 고정되어 있기 때문이며, 이것이 ORB 가 “Rotated BRIEF” 를 만든 이유입니다.</p>' },
      { type: 'text', html: `<h3>4. 브라우저에서 쓸 수 있는 이진 기술자: AKAZE · BRISK</h3>
<p>BRIEF(와 SURF · FREAK 등)는 opencv-contrib 에 있지만, OpenCV 메인 모듈에도 <b>회전 · 크기 불변</b>을 갖춘 이진 기술자가 있습니다.</p>
<ul>
<li><b>BRISK</b> (2011) — FAST 기반 검출을 여러 크기(스케일 공간)에서 하고, <b>동심원 샘플링 패턴</b>의 점 쌍 비교로 512비트(64바이트) 기술자. 먼 점 쌍으로 방향을 구해 회전 불변</li>
<li><b>AKAZE</b> (2013) — 가우시안 대신 <b>비선형 확산</b>으로 스케일 공간을 만들어 경계가 덜 뭉개짐. <b>M-LDB</b> 이진 기술자(기본 486비트 → 61바이트). 정확도가 SIFT 에 가까우면서 이진이라 매칭이 빠름</li>
<li><b>ORB</b> (2011) — FAST + 회전 BRIEF. 가장 빠름 → 다음 시간</li>
</ul>
<p>셋 모두 <code>detectAndCompute()</code> 사용법이 SIFT 와 같고, 매칭은 <code>cv.NORM_HAMMING</code> 으로 합니다.</p>` },
      { type: 'code', title: '예제 5 · AKAZE · BRISK 로 다른 각도의 벽화 사진 매칭하기', code: String.raw`
import cv2 as cv
import numpy as np
import time

img1 = cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('graf3.jpg', cv.IMREAD_GRAYSCALE)
# 브라우저 속도를 위해 60% 로 축소
img1 = cv.resize(img1, None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
img2 = cv.resize(img2, None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)

bf = cv.BFMatcher(cv.NORM_HAMMING)            # 이진 기술자 = 해밍 거리
for name, det in [('AKAZE', cv.AKAZE_create()), ('BRISK', cv.BRISK_create())]:
    t0 = time.perf_counter()
    kp1, des1 = det.detectAndCompute(img1, None)
    kp2, des2 = det.detectAndCompute(img2, None)
    ms = (time.perf_counter() - t0) * 1000

    pairs = bf.knnMatch(des1, des2, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    print('%-5s 키포인트 %4d / %4d, 기술자 %s %s (키포인트당 %d바이트), 두 장 %.0f ms, 좋은 매칭 %d 쌍'
          % (name, len(kp1), len(kp2), des1.shape, des1.dtype, des1.shape[1], ms, len(good)))

    good = sorted(good, key=lambda m: m.distance)[:50]
    vis = cv.drawMatches(img1, kp1, img2, kp2, good, None, flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
    cv.imshow(name + ' best 50 matches', vis)
`, desc: '<p>graf3 은 graf1 을 옆에서 비스듬히 찍은 사진인데도 두 방법 모두 수십~수백 쌍의 좋은 매칭을 찾습니다. 기술자가 <b>uint8</b> 이고 바이트 수가 작다는 점, 매칭에 <code>NORM_HAMMING</code> 을 쓴다는 점을 확인하세요. (비율 테스트와 매칭은 7교시에 자세히 배웁니다.)</p>' },
      { type: 'table', head: ['기술자', '종류', '크기 (키포인트당)', '거리', '회전 · 크기 불변', 'OpenCV (브라우저)'], rows: [
        ['SIFT', '실수', '128 × float32 = 512바이트', 'L2', '○ · ○', '<code>cv.SIFT_create</code> ○'],
        ['SURF', '실수', '64 × float32 = 256바이트', 'L2', '○ · ○', 'contrib nonfree ✕'],
        ['BRIEF', '이진', '256비트 = 32바이트', 'Hamming', '✕ · ✕', 'contrib ✕'],
        ['ORB', '이진', '256비트 = 32바이트', 'Hamming', '○ · △(피라미드)', '<code>cv.ORB_create</code> ○'],
        ['BRISK', '이진', '512비트 = 64바이트', 'Hamming', '○ · ○', '<code>cv.BRISK_create</code> ○'],
        ['AKAZE', '이진', '486비트 = 61바이트', 'Hamming', '○ · ○', '<code>cv.AKAZE_create</code> ○'],
      ] },
      { type: 'tip', html: `<p>FAST 는 <b>검출기</b>, BRIEF 는 <b>기술자</b>입니다. OpenCV 에서는 검출기와 기술자를 섞어 쓸 수 있습니다. 예: <code>kp = fast.detect(gray)</code> → <code>kp, des = cv.ORB_create().compute(gray, kp)</code>. 단, ORB 기술자는 가장자리 31픽셀 안쪽 점만 계산하므로 반환된 kp 개수가 줄어들 수 있습니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 키포인트 500개가 되는 FAST threshold 찾기',
        desc: `<p>실시간 시스템에서는 “프레임마다 키포인트를 약 500개” 처럼 개수를 일정하게 맞추고 싶을 때가 많습니다. <code>building.jpg</code> 에서 threshold 를 <b>5 부터 100 까지 5 간격</b>으로 바꾸며 개수를 출력하고, <b>개수가 500 에 가장 가까운 threshold</b> 를 찾아 그 결과를 그리세요. (비최대 억제는 켠 상태)</p>`,
        starter: String.raw`
import cv2 as cv

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
fast = cv.FastFeatureDetector_create()

best_t, best_n = None, None
# TODO 1: threshold 를 5, 10, ..., 100 으로 바꾸며 개수 n 을 구하고 출력하세요
for t in [10]:
    fast.setThreshold(t)
    n = len(fast.detect(gray, None))
    print('threshold %3d → %5d 개' % (t, n))
    # TODO 2: |n - 500| 이 가장 작은 t 를 best_t, best_n 에 기록하세요

print('500개에 가장 가까운 threshold:', best_t, '→', best_n, '개')
fast.setThreshold(best_t if best_t else 10)
kp = fast.detect(gray, None)
cv.imshow('about 500 FAST keypoints', cv.drawKeypoints(img, kp, None, color=(0, 255, 0)))
`,
        hint: `<p><code>for t in range(5, 101, 5):</code> 그리고 <code>if best_n is None or abs(n - 500) &lt; abs(best_n - 500): best_t, best_n = t, n</code>.</p>`,
        solution: String.raw`
import cv2 as cv

img = cv.imread('building.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
fast = cv.FastFeatureDetector_create()

best_t, best_n = None, None
for t in range(5, 101, 5):
    fast.setThreshold(t)
    n = len(fast.detect(gray, None))
    print('threshold %3d → %5d 개' % (t, n))
    if best_n is None or abs(n - 500) < abs(best_n - 500):
        best_t, best_n = t, n

print('500개에 가장 가까운 threshold:', best_t, '→', best_n, '개')
fast.setThreshold(best_t)
kp = fast.detect(gray, None)
cv.imshow('about 500 FAST keypoints', cv.drawKeypoints(img, kp, None, color=(0, 255, 0)))
`,
      },
      {
        title: '실습 2 · 해밍 거리 직접 계산해 cv.norm 과 비교하기',
        desc: `<p>AKAZE 로 <code>graf1.jpg</code> 와 <code>graf3.jpg</code> 의 기술자를 구하고, 첫 번째 기술자 <code>des1[0]</code> 과 <code>des2</code> 의 <b>모든 기술자 사이 해밍 거리</b>를 numpy 로 직접 계산하세요(<code>np.bitwise_xor</code> → <code>np.unpackbits</code> → 합). 가장 가까운 기술자의 번호와 거리를 출력하고, <code>cv.norm(a, b, cv.NORM_HAMMING)</code> 결과와 같은지 확인합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.resize(cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6)
img2 = cv.resize(cv.imread('graf3.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6)
akaze = cv.AKAZE_create()
kp1, des1 = akaze.detectAndCompute(img1, None)
kp2, des2 = akaze.detectAndCompute(img2, None)
print('des1', des1.shape, 'des2', des2.shape)

q = des1[0]                                   # (61,) uint8

# TODO 1: q 와 des2 의 각 행을 XOR 하고 비트 1 의 개수를 세어 dists (길이 = len(des2)) 만들기
dists = np.zeros(len(des2), int)

best = int(np.argmin(dists))
print('가장 가까운 기술자: %d 번, 거리 %d 비트' % (best, dists[best]))

# TODO 2: cv.norm 으로 같은 두 기술자의 해밍 거리를 구해 비교하기
check = 0
print('cv.norm 결과:', check)
`,
        hint: `<p><code>x = np.bitwise_xor(des2, q)</code> 는 (N, 61) 이 됩니다(브로드캐스팅). <code>dists = np.unpackbits(x, axis=1).sum(axis=1)</code>. 확인은 <code>cv.norm(q, des2[best], cv.NORM_HAMMING)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.resize(cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6)
img2 = cv.resize(cv.imread('graf3.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6)
akaze = cv.AKAZE_create()
kp1, des1 = akaze.detectAndCompute(img1, None)
kp2, des2 = akaze.detectAndCompute(img2, None)
print('des1', des1.shape, 'des2', des2.shape)

q = des1[0]

x = np.bitwise_xor(des2, q)                        # (N, 61) — 다른 비트만 1
dists = np.unpackbits(x, axis=1).sum(axis=1)       # 행마다 1 의 개수

order = np.argsort(dists)
best = int(order[0])
print('가장 가까운 기술자: %d 번, 거리 %d 비트' % (best, dists[best]))
print('두 번째로 가까운 기술자: %d 번, 거리 %d 비트 (비율 %.2f)' % (order[1], dists[order[1]], dists[best] / max(1, dists[order[1]])))

check = cv.norm(q, des2[best], cv.NORM_HAMMING)
print('cv.norm 결과:', check, '→ 같음' if int(check) == int(dists[best]) else '→ 다름')
`,
      },
    ],
    quiz: [
      { q: "FAST(TYPE_9_16, threshold t)에서 픽셀 p 가 코너로 판정되는 조건은?", options: ["원 위 16픽셀의 평균이 Ip 보다 t 이상 클 때", "3×3 이웃 중 9개가 모두 다를 때", "원 위 16픽셀 중 연속 9개가 모두 Ip+t 보다 밝거나, 모두 Ip−t 보다 어두울 때", "Harris 점수가 t 보다 클 때"], answer: 2, explain: "원 위에서 연속된 n 개(여기서는 9)가 한꺼번에 밝거나 어두워야 코너입니다." },
      { q: "FAST 에서 비최대 억제(nonmaxSuppression)를 끄면 어떻게 되나요?", options: ["키포인트가 사라진다", "방향 정보가 추가된다", "검출 속도가 10배 느려진다", "붙어 있는 코너 후보가 모두 남아 개수가 크게 늘어난다"], answer: 3, explain: "예제 2 에서 431개 → 1575개처럼 한 코너에 여러 점이 뭉쳐 늘어납니다." },
      { q: "BRIEF 기술자의 한 비트는 무엇을 뜻하나요?", options: ["패치 안 미리 정한 점 쌍 (p, q) 에서 I(p) &lt; I(q) 인지 여부", "키포인트 위치의 x 좌표 한 자리", "기울기 방향 히스토그램의 한 칸", "픽셀 밝기가 128 보다 큰지 여부"], answer: 0, explain: "블러한 패치에서 점 쌍의 밝기를 비교해 1 또는 0 을 기록합니다." },
      { q: "256비트 BRIEF 기술자 두 개를 비교할 때 쓰는 거리와, 서로 무관한 두 점의 거리로 예상되는 값은?", options: ["유클리드(L2) 거리, 약 0", "해밍 거리, 약 128 (절반 정도의 비트가 다름)", "해밍 거리, 항상 256", "코사인 거리, 약 1"], answer: 1, explain: "이진 기술자는 다른 비트 수(해밍 거리)로 비교하며, 무관한 점끼리는 약 절반의 비트가 다릅니다." },
      { q: "BRIEF 가 회전된 이미지에서 매칭이 잘 안 되는 이유는?", options: ["블러를 하지 않아서", "기술자가 너무 커서", "점 쌍의 위치가 패치에 고정되어 있어 회전하면 다른 픽셀끼리 비교하게 되기 때문에", "해밍 거리가 회전을 지원하지 않아서"], answer: 2, explain: "예제 4 에서 30° 회전만으로 같은 점의 해밍 거리가 70 이상으로 커졌습니다. ORB 는 키포인트 방향으로 점 쌍을 돌려 이를 해결합니다." },
    ],
  },

  /* ======================================================================
   * a1-6 ORB: 빠르고 자유로운 특징점
   * ====================================================================== */
  {
    id: 'a1-6',
    assets: ['images/adv/box.png'],
    summary: 'FAST 검출기와 BRIEF 기술자의 약점을 고쳐 합친 ORB(Oriented FAST and Rotated BRIEF)를 배웁니다. 이미지 피라미드 · Harris 순위 · 밝기 중심(intensity centroid) 방향으로 oFAST 를, 방향에 맞춰 돌린 점 쌍과 학습된 비교 쌍으로 rBRIEF 를 만드는 원리를 실험으로 확인하고, ORB_create 의 파라미터와 SIFT 대비 속도를 비교합니다.',
    goals: [
      'ORB = oFAST(방향이 있는 FAST) + rBRIEF(회전된 BRIEF) 의 구성과 각 개선점을 설명할 수 있다',
      '밝기 중심(intensity centroid)으로 키포인트 방향을 구하는 원리를 코드로 확인할 수 있다',
      'cv.ORB_create 의 nfeatures · scaleFactor · nlevels · scoreType · WTA_K 등을 목적에 맞게 설정할 수 있다',
      'time.perf_counter 로 SIFT · AKAZE · BRISK · ORB 의 속도와 특징점 수를 비교하고 선택 기준을 말할 수 있다',
    ],
    schedule: [['도입 · FAST/BRIEF 복습', 4], ['oFAST: 크기와 방향', 9], ['rBRIEF: 회전된 기술자', 7], ['ORB 사용 · 파라미터', 10], ['속도 비교 · 실시간', 8], ['실습 과제', 9], ['정리 · 퀴즈', 3]],
    blocks: [
      { type: 'text', html: `<h3>1. ORB: OpenCV 연구실에서 태어난 “무료 SIFT 대안”</h3>
<p>OpenCV 사용자에게 SIFT 와 SURF 는 오랫동안 <b>특허</b> 때문에 마음대로 쓰기 어려운 알고리즘이었습니다(SIFT 는 2020년에야 만료). 그래서 2011년 <b>OpenCV Labs 의 E. Rublee, V. Rabaud, K. Konolige, G. Bradski</b> 는 논문 <em>ORB: An efficient alternative to SIFT or SURF</em> 에서 <b>계산 비용 · 매칭 성능 · 특허</b> 세 가지를 모두 만족하는 ORB 를 발표했습니다.</p>
<p>이름 그대로 <b>ORB = Oriented FAST and Rotated BRIEF</b>. 지난 시간의 FAST 와 BRIEF 를 가져오되 두 가지 약점을 고쳤습니다.</p>
<ul>
<li>FAST 는 <b>방향</b>을 모르고 크기 변화에 약함 → <b>oFAST</b>: 피라미드 + 방향 계산</li>
<li>BRIEF 는 <b>회전</b>하면 기술자가 달라짐 → <b>rBRIEF</b>: 방향에 맞춰 점 쌍을 돌리고, 좋은 점 쌍을 학습으로 고름</li>
</ul>
<p>오늘날 ORB 는 <b>ORB-SLAM</b> 같은 실시간 로봇 · AR 시스템의 표준 특징점으로 널리 쓰입니다.</p>` },
      { type: 'text', html: `<h3>2. oFAST — FAST 에 “크기”와 “방향”을 더하기</h3>
<ul>
<li><b>이미지 피라미드</b>: 이미지를 scaleFactor(기본 1.2)배씩 줄인 nlevels(기본 8)층에서 각각 FAST 검출 → 여러 크기의 특징을 찾음</li>
<li><b>Harris 순위</b>: FAST 는 엣지에도 반응하므로 검출된 점들을 <b>Harris 코너 점수</b>로 정렬해 상위 N개(nfeatures)만 남김</li>
<li><b>밝기 중심(intensity centroid) 방향</b>: 키포인트 주변 원형 패치에서 밝기를 “무게”로 보고 무게중심을 구합니다. 코너 중심 → 밝기 무게중심으로 향하는 벡터의 방향이 키포인트 방향입니다.</li>
</ul>
<p>모멘트로 쓰면: m10 = Σ x·I(x, y), &nbsp; m01 = Σ y·I(x, y) (패치 중심을 원점으로), &nbsp; <b>방향 θ = atan2(m01, m10)</b>. 원 안에서만 계산하기 때문에 이미지가 돌아가면 θ 도 정확히 같이 돌아갑니다.</p>` },
      { type: 'code', title: '예제 1 · ORB 키포인트 검출과 그리기 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)

# Initiate ORB detector
orb = cv.ORB_create()

# find the keypoints with ORB
kp = orb.detect(img, None)

# compute the descriptors with ORB
kp, des = orb.compute(img, kp)
print('키포인트 %d 개, 기술자 %s %s' % (len(kp), des.shape, des.dtype))

# draw only keypoints location, not size and orientation
img2 = cv.drawKeypoints(img, kp, None, color=(0, 255, 0), flags=0)
cv.imshow('ORB keypoints', img2)

# 크기와 방향까지
img3 = cv.drawKeypoints(img, kp, None, color=(0, 255, 0), flags=cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv.imshow('ORB keypoints (rich)', img3)
`, desc: '<p>기본 <code>nfeatures=500</code> 이라 키포인트는 최대 500개, 기술자는 <b>(500, 32) uint8</b> = 256비트 이진 기술자입니다. rich 그림에서 원의 크기가 몇 단계로만 나뉘는 것은 피라미드 층(level)마다 패치 크기가 31 × 1.2ⁿ (n = 층 번호) 으로 정해지기 때문입니다.</p>' },
      { type: 'code', title: '예제 2 · 밝기 중심(intensity centroid)으로 방향 직접 계산하기', code: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(300)
kp = orb.detect(gray, None)

R = 15                                            # ORB 의 방향 계산 반지름 (patchSize 31 의 절반)
yy, xx = np.mgrid[-R:R + 1, -R:R + 1]
circle = (xx ** 2 + yy ** 2) <= R * R             # 원 안쪽만 사용

print(' 번호   ORB kp.angle   직접 계산한 θ   차이')
level0 = [k for k in kp if k.octave == 0][:10]     # 원본 크기 층(level 0)의 키포인트 10개
for i, k in enumerate(level0):
    x, y = int(round(k.pt[0])), int(round(k.pt[1]))
    patch = gray[y - R:y + R + 1, x - R:x + R + 1].astype(np.float64)
    m10 = np.sum(xx * patch * circle)             # x 방향 1차 모멘트
    m01 = np.sum(yy * patch * circle)             # y 방향 1차 모멘트
    theta = np.degrees(np.arctan2(m01, m10)) % 360
    diff = (k.angle - theta + 180) % 360 - 180
    print('  %2d     %6.1f°        %6.1f°       %+5.1f°' % (i, k.angle, theta, diff))

vis = cv.drawKeypoints(gray, level0, None, color=(0, 0, 255), flags=cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv.imshow('level-0 keypoints with orientation', cv.resize(vis, None, fx=2, fy=2))
`, desc: '<p>numpy 로 모멘트 두 개만 계산했는데도 ORB 의 <code>kp.angle</code> 과 대부분 몇 도 이내로 일치합니다(차이는 좌표 반올림과, ORB 가 원 영역을 정수 픽셀 단위로 근사하기 때문). 식 하나로 끝나는 계산이라 SIFT 의 36칸 히스토그램보다 훨씬 빠릅니다.</p>' },
      { type: 'text', html: `<h3>3. rBRIEF — 회전된 BRIEF</h3>
<p><b>steered BRIEF</b>: 키포인트 방향 θ 를 알았으니, BRIEF 의 점 쌍 좌표 (x, y) 를 <b>θ 만큼 회전</b>시킨 위치에서 밝기를 비교합니다. 그러면 이미지가 돌아가도 “물체 기준으로 같은 점 쌍”을 비교하게 되어 기술자가 같아집니다. ORB 는 속도를 위해 각도를 <b>12° 단위</b>로 나눠 회전된 점 쌍 표를 미리 만들어 둡니다.</p>
<p>그런데 방향을 맞추면 부작용이 생깁니다. 원래 BRIEF 의 비트들은 <b>분산이 크고(0/1 이 반반) 서로 상관이 적어서</b> 구별력이 좋았는데, 방향을 맞추면 비트들이 비슷비슷해집니다. 그래서 ORB 는 <b>탐욕적 탐색(greedy search)</b>으로 수많은 후보 점 쌍 중 <b>분산이 크고 서로 상관이 낮은 256개</b>를 학습으로 골랐습니다. 이것이 <b>rBRIEF</b> 입니다.</p>
<p>매칭에는 해밍 거리를 쓰고, 대규모 검색에는 <b>다중 탐침 LSH(multi-probe LSH)</b> 를 씁니다(7교시 FLANN).</p>` },
      { type: 'table', head: ['구성', '원본', 'ORB 의 개선', '효과'], rows: [
        ['검출', 'FAST', '피라미드 8층 + Harris 점수로 상위 N개', '크기 변화 대응, 엣지 반응 억제'],
        ['방향', '없음', '밝기 중심 θ = atan2(m01, m10)', '회전 불변'],
        ['기술자', 'BRIEF (고정 점 쌍)', 'θ 로 점 쌍 회전 (steered)', '회전해도 같은 기술자'],
        ['점 쌍 선택', '무작위', '분산 크고 상관 낮은 256쌍 학습 (rBRIEF)', '구별력 회복'],
        ['매칭', '해밍 거리', '해밍 거리 + multi-probe LSH', '빠른 대규모 검색'],
      ] },
      { type: 'code', title: '예제 3 · 방향을 버리면? ORB vs “방향 없는 ORB(=BRIEF 처럼)”', code: String.raw`
import cv2 as cv
import numpy as np

box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
H, W = box.shape
M = cv.getRotationMatrix2D((W / 2, H / 2), 40, 1.0)          # 40° 회전
c, s = abs(M[0, 0]), abs(M[0, 1])
nW, nH = int(H * s + W * c), int(H * c + W * s)
M[0, 2] += nW / 2 - W / 2
M[1, 2] += nH / 2 - H / 2
rot = cv.warpAffine(box, M, (nW, nH))

orb = cv.ORB_create(500)
bf = cv.BFMatcher(cv.NORM_HAMMING, crossCheck=True)

def count_correct(k1, k2, matches):
    ok = 0
    for m in matches:
        ex, ey = M @ np.array([*k1[m.queryIdx].pt, 1])
        gx, gy = k2[m.trainIdx].pt
        ok += np.hypot(ex - gx, ey - gy) < 5
    return ok

# (1) 보통 ORB: 방향 계산 O
k1, d1 = orb.detectAndCompute(box, None)
k2, d2 = orb.detectAndCompute(rot, None)
m = bf.match(d1, d2)
print('ORB (방향 사용)       : 매칭 %3d 쌍, 정답 %3d 쌍' % (len(m), count_correct(k1, k2, m)))

# (2) 같은 키포인트의 방향을 모두 0° 로 바꾼 뒤 기술자 계산 → 점 쌍이 회전하지 않음 (BRIEF 와 같음)
def no_angle(kps):
    return [cv.KeyPoint(k.pt[0], k.pt[1], k.size, 0, k.response, k.octave, k.class_id) for k in kps]
k1z, d1z = orb.compute(box, no_angle(k1))
k2z, d2z = orb.compute(rot, no_angle(k2))
mz = bf.match(d1z, d2z)
print('방향 0° 고정 (BRIEF식): 매칭 %3d 쌍, 정답 %3d 쌍' % (len(mz), count_correct(k1z, k2z, mz)))

good = sorted(m, key=lambda x: x.distance)[:40]
cv.imshow('ORB with orientation', cv.drawMatches(box, k1, rot, k2, good, None, flags=2))
goodz = sorted(mz, key=lambda x: x.distance)[:40]
cv.imshow('orientation fixed to 0', cv.drawMatches(box, k1z, rot, k2z, goodz, None, flags=2))
`, desc: '<p>같은 키포인트 · 같은 기술자 계산인데 <b>방향만 0° 로 고정</b>하자 40° 회전된 상자에서 정답 매칭이 수백 쌍 → 한 자릿수로 무너집니다. 오른쪽 그림의 선들이 엉뚱한 곳을 가리키죠. “Oriented” 와 “Rotated” 가 ORB 이름에 들어간 이유입니다. (<code>flags=2</code> 는 <code>NOT_DRAW_SINGLE_POINTS</code>)</p>' },
      { type: 'table', head: ['<code>cv.ORB_create()</code> 인자', '기본값', '의미 · 팁'], rows: [
        ['<code>nfeatures</code>', '500', '남길 최대 특징점 수. 가장 중요한 속도 · 품질 손잡이'],
        ['<code>scaleFactor</code> · <code>nlevels</code>', '1.2 · 8', '피라미드 배율 · 층 수. 1.2⁷ ≈ 3.6배 크기 변화까지'],
        ['<code>edgeThreshold</code> · <code>patchSize</code>', '31 · 31', '가장자리 제외 폭 · 기술자 패치 크기 (보통 같게)'],
        ['<code>scoreType</code>', '<code>cv.ORB_HARRIS_SCORE</code>', 'Harris 로 순위(기본) / <code>cv.ORB_FAST_SCORE</code> 는 조금 빠르지만 덜 안정적'],
        ['<code>WTA_K</code>', '2', '비교할 점 개수. 3 · 4 면 비트가 2개씩 → 매칭은 <code>cv.NORM_HAMMING2</code>'],
        ['<code>fastThreshold</code>', '20', '내부 FAST 임계값. 낮추면 저대비 영상에서 더 많이 검출'],
      ] },
      { type: 'code', title: '예제 4 · nfeatures · scoreType 과 피라미드 층별 분포', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt
import time

img = cv.imread('messi5.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

plt.figure(figsize=(13, 7))
settings = [('nfeatures=100', dict(nfeatures=100)),
            ('nfeatures=1000', dict(nfeatures=1000)),
            ('FAST_SCORE, 1000', dict(nfeatures=1000, scoreType=cv.ORB_FAST_SCORE))]
for i, (name, params) in enumerate(settings):
    orb = cv.ORB_create(**params)
    t0 = time.perf_counter()
    kp, des = orb.detectAndCompute(gray, None)
    ms = (time.perf_counter() - t0) * 1000
    print('%-17s → %4d 개, %.1f ms' % (name, len(kp), ms))
    vis = cv.drawKeypoints(img, kp, None, color=(0, 255, 0), flags=cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
    plt.subplot(2, 3, i + 1), plt.imshow(cv.cvtColor(vis, cv.COLOR_BGR2RGB)), plt.title('%s: %d' % (name, len(kp))), plt.axis('off')

# 피라미드 층(kp.octave)별 개수와 크기 (nfeatures=1000)
kp = cv.ORB_create(1000).detect(gray, None)
levels = np.array([k.octave for k in kp])
sizes = {lv: kp[int(np.argmax(levels == lv))].size for lv in np.unique(levels)}
for lv in sorted(sizes):
    print('  층 %d: %3d 개, 키포인트 크기 %.1f' % (lv, int((levels == lv).sum()), sizes[lv]))
plt.subplot(2, 1, 2)
plt.bar(sorted(sizes), [int((levels == lv).sum()) for lv in sorted(sizes)])
plt.xlabel('pyramid level (kp.octave)'), plt.ylabel('number of keypoints'), plt.title('ORB keypoints per pyramid level')
plt.tight_layout()
plt.show()
`, desc: '<p>층이 올라갈수록(이미지가 작아질수록) 키포인트 수는 줄고 크기는 31 → 37.2 → 44.6 … 처럼 1.2배씩 커집니다. ORB 는 층마다 넓이에 비례해 개수를 나눠 줍니다. FAST_SCORE 는 순위 매기기가 단순해 조금 빠를 수 있지만, 기본값인 Harris 점수가 더 안정적인 코너를 고릅니다.</p>' },
      { type: 'text', html: `<h3>4. 얼마나 빠를까? SIFT · AKAZE · BRISK · ORB 비교</h3>
<p>튜토리얼은 ORB 가 SIFT · SURF 보다 훨씬 빠르다고 소개합니다. 직접 재 봅시다. <code>time.perf_counter()</code> 로 <code>detectAndCompute</code> 한 번의 시간을 재고, 키포인트 수와 기술자 크기도 함께 비교합니다. (브라우저는 로컬 PC 보다 5~10배 느리므로 이미지를 70% 로 줄여 씁니다.)</p>` },
      { type: 'code', title: '예제 5 · 속도 비교: SIFT vs AKAZE vs BRISK vs ORB', code: String.raw`
import cv2 as cv
import numpy as np
import time
from matplotlib import pyplot as plt

gray = cv.imread('building.jpg', cv.IMREAD_GRAYSCALE)
gray = cv.resize(gray, None, fx=0.7, fy=0.7, interpolation=cv.INTER_AREA)
print('입력 크기:', gray.shape[1], 'x', gray.shape[0])

detectors = [('SIFT', cv.SIFT_create()), ('AKAZE', cv.AKAZE_create()),
             ('BRISK', cv.BRISK_create()), ('ORB', cv.ORB_create(nfeatures=500))]
names, times, per_kp = [], [], []
for name, det in detectors:
    t0 = time.perf_counter()
    kp, des = det.detectAndCompute(gray, None)
    ms = (time.perf_counter() - t0) * 1000
    names.append(name)
    times.append(ms)
    per_kp.append(ms / max(1, len(kp)))
    print('%-5s 키포인트 %5d 개 | 기술자 %-9s %-7s | %7.1f ms | 점 1개당 %.3f ms'
          % (name, len(kp), str(des.shape[1]) + ' 칸', des.dtype, ms, ms / max(1, len(kp))))

plt.figure(figsize=(10, 3.8))
plt.subplot(1, 2, 1), plt.bar(names, times, color=['tab:red', 'tab:orange', 'tab:green', 'tab:blue'])
plt.ylabel('ms'), plt.title('detectAndCompute time')
plt.subplot(1, 2, 2), plt.bar(names, per_kp, color=['tab:red', 'tab:orange', 'tab:green', 'tab:blue'])
plt.ylabel('ms per keypoint'), plt.title('time per keypoint')
plt.tight_layout()
plt.show()
`, desc: '<p>ORB 는 SIFT 보다 <b>수십 배</b> 빠릅니다. 다만 ORB 는 500개로 제한했으므로 “점 1개당 시간”도 함께 보세요. 개수 제한이 없는 SIFT · BRISK 는 수천 개를 찾느라 시간이 늘어납니다. 실제 앱에서는 “필요한 개수 · 정확도 · 시간” 세 가지를 함께 따져 고릅니다.</p>' },
      { type: 'code', title: '예제 6 · 실시간 ORB 특징점 (웹캠 · 동영상)', code: String.raw`
import cv2 as cv
import time

# 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸세요. 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 골라도 됩니다.
def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('nfeatures', 'result', 300, 2000, nothing)
cv.createTrackbar('fastThreshold', 'result', 20, 60, nothing)
state = {'params': None, 'orb': None}

def process(frame):
    n = max(10, cv.getTrackbarPos('nfeatures', 'result'))
    ft = max(1, cv.getTrackbarPos('fastThreshold', 'result'))
    if state['params'] != (n, ft):                    # 값이 바뀔 때만 새로 만들기
        state['orb'] = cv.ORB_create(nfeatures=n, fastThreshold=ft)
        state['params'] = (n, ft)

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    t0 = time.perf_counter()
    kp, des = state['orb'].detectAndCompute(gray, None)
    ms = (time.perf_counter() - t0) * 1000

    out = cv.drawKeypoints(frame, kp, None, color=(0, 255, 0), flags=cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
    cv.putText(out, 'ORB %d kp  %.1f ms' % (len(kp), ms), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return out
`, desc: '<p>카메라를 천천히 돌리거나 앞뒤로 움직여도 같은 물체 위에 비슷한 원(크기 · 방향)이 따라다니는지 관찰하세요. 텍스처가 없는 흰 벽을 비추면 키포인트가 거의 사라집니다. 이것이 ORB-SLAM 같은 시스템이 “특징이 없는 복도”에서 길을 잃는 이유입니다.</p>' },
      { type: 'warn', html: `<p><code>WTA_K</code> 를 3 이나 4 로 바꾸면 기술자의 비트 의미가 달라져 매칭할 때 <code>cv.NORM_HAMMING</code> 대신 <b><code>cv.NORM_HAMMING2</code></b> 를 써야 합니다. 또 ORB 는 가장자리 <code>edgeThreshold</code>(31) 픽셀 안쪽에서만 특징점을 찾으므로, 아주 작은 이미지(예: 60×60)에서는 특징점이 거의 나오지 않습니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 피라미드 층별로 색을 다르게 그리기',
        desc: `<p><code>messi5.jpg</code> 에서 <code>cv.ORB_create(nfeatures=800)</code> 로 키포인트를 구하고, <b>kp.octave(피라미드 층)</b>마다 다른 색으로 원을 그리세요(원의 반지름 = <code>kp.size / 2</code>). 층별 개수를 출력하고, 큰 원(높은 층)과 작은 원(낮은 층)이 사진의 어떤 부분에서 나오는지 관찰합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
orb = cv.ORB_create(nfeatures=800)
kp = orb.detect(gray, None)

# 8개 층의 색 (BGR)
COLORS = [(255, 0, 0), (255, 128, 0), (255, 255, 0), (0, 255, 0),
          (0, 255, 255), (0, 128, 255), (0, 0, 255), (255, 0, 255)]

vis = img.copy()
counts = [0] * 8
for k in kp:
    # TODO 1: k.octave 로 색을 고르고 counts 를 1 증가
    color = (255, 255, 255)
    # TODO 2: 반지름 k.size / 2 인 원을 그리기 (지금은 반지름 3)
    cv.circle(vis, (int(k.pt[0]), int(k.pt[1])), 3, color, 1)

print('층별 개수:', counts)
cv.imshow('ORB keypoints by pyramid level', vis)
`,
        hint: `<p><code>lv = k.octave</code>, <code>color = COLORS[lv]</code>, <code>counts[lv] += 1</code>. 반지름은 정수로: <code>int(k.size / 2)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
orb = cv.ORB_create(nfeatures=800)
kp = orb.detect(gray, None)

COLORS = [(255, 0, 0), (255, 128, 0), (255, 255, 0), (0, 255, 0),
          (0, 255, 255), (0, 128, 255), (0, 0, 255), (255, 0, 255)]

vis = img.copy()
counts = [0] * 8
for k in kp:
    lv = k.octave
    color = COLORS[lv]
    counts[lv] += 1
    cv.circle(vis, (int(k.pt[0]), int(k.pt[1])), int(k.size / 2), color, 1)

print('층별 개수:', counts)
for lv in range(8):
    cv.putText(vis, 'level %d: %d' % (lv, counts[lv]), (10, 20 + 18 * lv), cv.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[lv], 2)
cv.imshow('ORB keypoints by pyramid level', vis)
`,
      },
      {
        title: '실습 2 · 크기 변화에 ORB 와 SIFT 는 얼마나 버틸까?',
        desc: `<p><code>box.png</code> 를 <b>0.4, 0.6, 0.8, 1.0, 1.3, 1.6 배</b>로 크기만 바꾼 이미지와 원본을 매칭해, <b>정답(5px 이내) 매칭 수</b>를 ORB 와 SIFT 에 대해 각각 구하세요. 매칭은 crossCheck 를 켠 <code>BFMatcher</code> 로 하되, ORB 는 <code>NORM_HAMMING</code>, SIFT 는 <code>NORM_L2</code> 를 씁니다.</p>
<p>두 방법은 원래 키포인트 수가 다르므로, 각 배율의 정답 수를 <b>배율 1.0 일 때의 정답 수로 나눈 유지율(%)</b>로 바꿔 한 그래프에 그리세요. 크기 변화가 클 때 어느 쪽이 더 잘 버티나요?</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scales = [0.4, 0.6, 0.8, 1.0, 1.3, 1.6]
methods = {
    'ORB': (cv.ORB_create(1000), cv.NORM_HAMMING),
    # TODO 1: 'SIFT': (cv.SIFT_create(), cv.NORM_L2) 추가
}

results = {}
for name, (det, norm) in methods.items():
    bf = cv.BFMatcher(norm, crossCheck=True)
    k1, d1 = det.detectAndCompute(box, None)
    counts = []
    for s in scales:
        img2 = cv.resize(box, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        k2, d2 = det.detectAndCompute(img2, None)
        matches = bf.match(d1, d2)
        # TODO 2: 원본 점 (x, y) 는 크기 변환 후 (x*s, y*s) 로 가야 함 → 5px 이내인 매칭 수 세기
        correct = 0
        counts.append(correct)
        print('%-4s scale %.1f: 매칭 %4d, 정답 %4d' % (name, s, len(matches), correct))
    results[name] = counts

# TODO 3: 배율 1.0 의 정답 수로 나눈 유지율(%)을 scales 에 대해 꺾은선 그래프로 (label, legend, 영어 제목 · 축)
`,
        hint: `<p><code>x, y = k1[m.queryIdx].pt</code>, <code>gx, gy = k2[m.trainIdx].pt</code>, <code>if np.hypot(x * s - gx, y * s - gy) &lt; 5: correct += 1</code>. 유지율: <code>base = c[scales.index(1.0)]</code>, <code>[100 * v / base for v in c]</code>. 그래프: <code>plt.plot(scales, rate, 'o-', label=name)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scales = [0.4, 0.6, 0.8, 1.0, 1.3, 1.6]
methods = {
    'ORB': (cv.ORB_create(1000), cv.NORM_HAMMING),
    'SIFT': (cv.SIFT_create(), cv.NORM_L2),
}

results = {}
for name, (det, norm) in methods.items():
    bf = cv.BFMatcher(norm, crossCheck=True)
    k1, d1 = det.detectAndCompute(box, None)
    counts = []
    for s in scales:
        img2 = cv.resize(box, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        k2, d2 = det.detectAndCompute(img2, None)
        matches = bf.match(d1, d2)
        correct = 0
        for m in matches:
            x, y = k1[m.queryIdx].pt
            gx, gy = k2[m.trainIdx].pt
            if np.hypot(x * s - gx, y * s - gy) < 5:
                correct += 1
        counts.append(correct)
        print('%-4s scale %.1f: 매칭 %4d, 정답 %4d' % (name, s, len(matches), correct))
    results[name] = counts

for name, c in results.items():
    base = c[scales.index(1.0)]
    rate = [100 * v / base for v in c]              # 배율 1.0 대비 유지율
    print('%-4s 유지율:' % name, ['%.0f%%' % r for r in rate])
    plt.plot(scales, rate, 'o-', label=name)
plt.xlabel('scale factor'), plt.ylabel('correct matches kept (% of scale 1.0)')
plt.title('Scale change: ORB vs SIFT (box.png)')
plt.legend()
plt.show()
`,
      },
    ],
    quiz: [
      { q: "ORB 라는 이름의 뜻으로 옳은 것은?", options: ["Optimized Robust Binary", "Octave Rotation BRISK", "Object Recognition Blob", "Oriented FAST and Rotated BRIEF"], answer: 3, explain: "방향이 있는 FAST(oFAST) 검출기와 회전된 BRIEF(rBRIEF) 기술자를 합친 것입니다." },
      { q: "ORB 가 키포인트의 방향을 구하는 방법은?", options: ["원형 패치의 밝기 중심(intensity centroid)으로 향하는 방향 θ = atan2(m01, m10)", "36칸 기울기 방향 히스토그램의 최고 방향", "Haar 웨이블릿 응답의 60° 부채꼴 합", "방향을 구하지 않는다"], answer: 0, explain: "패치 중심에서 밝기 무게중심으로 향하는 벡터의 방향을 씁니다. SIFT 의 히스토그램보다 계산이 간단합니다." },
      { q: "예제 3 에서 키포인트 방향을 모두 0° 로 고정하자 회전된 이미지의 정답 매칭이 크게 줄었습니다. 그 이유는?", options: ["키포인트 위치가 바뀌어서", "해밍 거리 계산이 틀려서", "점 쌍이 물체와 함께 회전하지 않아, 회전된 이미지에서 다른 픽셀끼리 비교하게 되어서", "피라미드 층이 사라져서"], answer: 2, explain: "rBRIEF 는 키포인트 방향만큼 점 쌍을 돌려 비교합니다. 방향이 0 이면 원래 BRIEF 와 같아져 회전에 약해집니다." },
      { q: "ORB_create(WTA_K=4) 로 만든 기술자를 BFMatcher 로 매칭할 때 알맞은 normType 은?", options: ["cv.NORM_L2", "cv.NORM_L1", "cv.NORM_HAMMING", "cv.NORM_HAMMING2"], answer: 3, explain: "WTA_K 가 3 또는 4 이면 비교 결과가 2비트씩 저장되므로 NORM_HAMMING2 를 씁니다. 기본(WTA_K=2)은 NORM_HAMMING." },
      { q: "실시간 앱에서 ORB 가 너무 느릴 때 가장 먼저 조절할 것으로 알맞은 것은?", options: ["nfeatures 를 줄이거나 입력 해상도를 낮춘다", "nlevels 를 20 으로 늘린다", "WTA_K 를 4 로 바꾼다", "patchSize 를 101 로 키운다"], answer: 0, explain: "특징점 수와 픽셀 수가 계산량을 가장 크게 좌우합니다. 층을 늘리거나 패치를 키우면 오히려 느려집니다." },
    ],
  },

  /* ======================================================================
   * a1-7 특징점 매칭 (Feature Matching)
   * ====================================================================== */
  {
    id: 'a1-7',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg'],
    summary: '두 이미지의 기술자를 짝짓는 방법을 배웁니다. 모든 쌍을 비교하는 Brute-Force 매처(BFMatcher)의 normType · crossCheck, k-최근접 매칭(knnMatch)과 Lowe 의 비율 테스트, 대량 데이터용 FLANN 매처(KD-Tree · LSH)를 튜토리얼 예제로 익히고, 정답을 아는 합성 이미지로 각 방법의 매칭 품질을 숫자로 비교합니다.',
    goals: [
      'BFMatcher 의 normType(NORM_L2 · NORM_HAMMING)을 기술자 종류에 맞게 고르고 crossCheck 의 의미를 설명할 수 있다',
      'DMatch 객체의 distance · queryIdx · trainIdx 를 이용해 매칭 결과를 다룰 수 있다',
      'knnMatch 와 비율 테스트(ratio test)로 애매한 매칭을 걸러내고 drawMatches · drawMatchesKnn 으로 그릴 수 있다',
      'FLANN 매처의 index_params · search_params 를 SIFT(KD-Tree)와 ORB(LSH)에 맞게 설정할 수 있다',
      '정답을 아는 데이터로 매칭 방법별 정확도를 비교하고 상황에 맞는 방법을 고를 수 있다',
    ],
    schedule: [['도입 · 매칭이란', 4], ['BFMatcher · crossCheck', 10], ['knnMatch · 비율 테스트', 10], ['FLANN', 8], ['매칭 품질 비교', 6], ['실습 과제', 9], ['정리 · 퀴즈', 3]],
    blocks: [
      { type: 'text', html: `<h3>1. 매칭: 두 사진의 기술자끼리 짝 찾기</h3>
<p>지금까지 SIFT · ORB 로 각 사진의 키포인트와 기술자를 구했습니다. 이제 <b>사진 1(query, 찾고 싶은 물체)</b>의 기술자 하나하나에 대해 <b>사진 2(train, 장면)</b>에서 <b>가장 비슷한 기술자</b>를 찾으면 됩니다. 기술자가 비슷하다 = 벡터 사이 <b>거리가 작다</b>입니다.</p>
<p>가장 단순한 방법은 <b>Brute-Force(전수 비교)</b>입니다. query 기술자 하나를 train 기술자 <b>전부</b>와 거리 계산해 가장 가까운 것을 고릅니다. query 가 N 개, train 이 M 개면 N × M 번 계산하지만, 수천 개 수준이면 충분히 빠릅니다.</p>` },
      { type: 'table', head: ['<code>cv.BFMatcher(normType, crossCheck)</code>', '언제 쓰나'], rows: [
        ['<code>cv.NORM_L2</code> (기본)', 'SIFT · SURF 같은 <b>실수(float)</b> 기술자 — 유클리드 거리'],
        ['<code>cv.NORM_L1</code>', '실수 기술자 — 절댓값 거리 (가끔 사용)'],
        ['<code>cv.NORM_HAMMING</code>', 'ORB · BRIEF · BRISK · AKAZE 같은 <b>이진</b> 기술자 — 해밍 거리'],
        ['<code>cv.NORM_HAMMING2</code>', 'ORB 를 <code>WTA_K=3</code> 또는 <code>4</code> 로 만든 경우'],
        ['<code>crossCheck=True</code>', '<b>서로가 서로의 최선</b>일 때만 짝으로 인정 (A 의 최선이 B 이고, B 의 최선도 A). 결과가 더 믿을 만함'],
      ] },
      { type: 'code', title: '예제 1 · ORB + Brute-Force 매칭 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)            # queryImage
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)   # trainImage

# Initiate ORB detector
orb = cv.ORB_create()

# find the keypoints and descriptors with ORB
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)

# create BFMatcher object
bf = cv.BFMatcher(cv.NORM_HAMMING, crossCheck=True)

# Match descriptors.
matches = bf.match(des1, des2)

# Sort them in the order of their distance.
matches = sorted(matches, key=lambda x: x.distance)
print('키포인트 %d / %d 개, crossCheck 매칭 %d 쌍' % (len(kp1), len(kp2), len(matches)))
print('가장 가까운 거리 %d, 10번째 %d, 가장 먼 거리 %d' % (matches[0].distance, matches[9].distance, matches[-1].distance))

# Draw first 10 matches.
img3 = cv.drawMatches(img1, kp1, img2, kp2, matches[:10], None, flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
cv.imshow('ORB BF best 10', img3)
`, desc: '<p>거리가 가장 가까운 10쌍만 그렸는데, 대부분 상자 위의 같은 위치를 연결합니다. <code>crossCheck=True</code> 라서 “서로 최선”인 쌍만 남아 결과가 비교적 깨끗합니다. <code>flags=NOT_DRAW_SINGLE_POINTS</code>(= 2)는 짝이 없는 키포인트를 그리지 않는 옵션입니다.</p>' },
      { type: 'text', html: `<h3>2. 매칭 결과: DMatch 객체</h3>
<p><code>bf.match()</code> 는 <b>DMatch</b> 객체의 리스트를 돌려줍니다. 각 DMatch 는 “query 의 몇 번 기술자가 train 의 몇 번 기술자와 얼마나 가까운가”를 담고 있습니다.</p>` },
      { type: 'table', head: ['DMatch 속성', '뜻', '사용 예'], rows: [
        ['<code>m.distance</code>', '두 기술자 사이 거리 (작을수록 비슷)', '정렬 · 임계값'],
        ['<code>m.queryIdx</code>', 'query(첫 번째 인자) 기술자 · 키포인트 번호', '<code>kp1[m.queryIdx].pt</code>'],
        ['<code>m.trainIdx</code>', 'train(두 번째 인자) 기술자 · 키포인트 번호', '<code>kp2[m.trainIdx].pt</code>'],
        ['<code>m.imgIdx</code>', 'train 이미지 번호 (여러 장을 add 로 넣은 경우)', '보통 0'],
      ] },
      { type: 'code', title: '예제 2 · DMatch 들여다보기와 거리 분포', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create()
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)

all_matches = cv.BFMatcher(cv.NORM_HAMMING).match(des1, des2)                  # crossCheck 없이
cross = cv.BFMatcher(cv.NORM_HAMMING, crossCheck=True).match(des1, des2)       # crossCheck
cross = sorted(cross, key=lambda m: m.distance)

print('crossCheck 없이 %d 쌍 (query 마다 1개) / crossCheck %d 쌍' % (len(all_matches), len(cross)))
for m in cross[:5]:
    x1, y1 = kp1[m.queryIdx].pt
    x2, y2 = kp2[m.trainIdx].pt
    print('distance=%3d  query #%3d (%5.1f, %5.1f) → train #%3d (%5.1f, %5.1f)  imgIdx=%d'
          % (m.distance, m.queryIdx, x1, y1, m.trainIdx, x2, y2, m.imgIdx))

plt.hist([m.distance for m in all_matches], bins=range(0, 110, 4), alpha=0.6, label='all (no crossCheck)')
plt.hist([m.distance for m in cross], bins=range(0, 110, 4), alpha=0.6, label='crossCheck')
plt.xlabel('Hamming distance'), plt.ylabel('count'), plt.title('ORB match distances: box vs box_in_scene')
plt.legend()
plt.show()
`, desc: '<p>crossCheck 없이 매칭하면 query 키포인트마다 <b>무조건 1개</b>씩 짝이 생깁니다. 상자에 없는(장면에 안 보이는) 부분의 키포인트도 억지로 짝이 생기므로 거리가 큰 쪽에 많이 몰려 있습니다. crossCheck 는 그중 상당수를 걸러 냅니다. 하지만 거리 하나만으로 “진짜 짝”을 가르기는 어렵습니다 → 비율 테스트.</p>' },
      { type: 'text', html: `<h3>3. knnMatch 와 Lowe 의 비율 테스트(ratio test)</h3>
<p><code>bf.knnMatch(des1, des2, k=2)</code> 는 query 기술자마다 <b>가장 가까운 것(m)과 두 번째로 가까운 것(n)</b>을 함께 돌려줍니다. SIFT 논문의 D. Lowe 는 다음 규칙을 제안했습니다.</p>
<p><b>m.distance &lt; 0.75 × n.distance 일 때만 좋은 매칭으로 인정</b></p>
<ul>
<li>1등과 2등의 거리가 <b>비슷하다</b> = 헷갈리는 후보가 있다 (창문이 여러 개, 반복 무늬) → 버림</li>
<li>1등이 2등보다 <b>확실히 가깝다</b> = 유일한 짝 → 채택</li>
<li>비율은 보통 <b>0.7 ~ 0.8</b>. 작게 하면 엄격(정확하지만 개수 적음), 크게 하면 느슨</li>
</ul>
<p>1교시 퍼즐 비유로 말하면, “이 조각이 들어갈 자리가 <b>딱 한 곳</b>인가?”를 거리 비율로 확인하는 것입니다. 튜토리얼의 SIFT 예제에서는 crossCheck 대신 이 비율 테스트를 씁니다.</p>` },
      { type: 'code', title: '예제 3 · SIFT + knnMatch + 비율 테스트 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)            # queryImage
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)   # trainImage

# Initiate SIFT detector
sift = cv.SIFT_create()

# find the keypoints and descriptors with SIFT
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)

# BFMatcher with default params (NORM_L2, crossCheck=False)
bf = cv.BFMatcher()
matches = bf.knnMatch(des1, des2, k=2)

# Apply ratio test
good = []
for m, n in matches:
    if m.distance < 0.75 * n.distance:
        good.append([m])
print('knnMatch 결과 %d 개 (각각 [1등, 2등]) → 비율 테스트 통과 %d 쌍' % (len(matches), len(good)))

# cv.drawMatchesKnn expects list of lists as matches.
img3 = cv.drawMatchesKnn(img1, kp1, img2, kp2, good, None, flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
cv.imshow('SIFT knn + ratio test', img3)
`, desc: '<p>SIFT 키포인트 약 600개 중 비율 테스트를 통과한 80쌍 정도만 남았고, 선들이 거의 모두 상자 위를 올바르게 연결합니다. <code>drawMatchesKnn</code> 은 <b>리스트의 리스트</b>(<code>[[m], [m], …]</code>)를 받기 때문에 <code>good.append([m])</code> 으로 넣은 점에 주의하세요. 평범한 리스트라면 <code>drawMatches</code> 를 씁니다.</p>' },
      { type: 'text', html: `<h3>4. FLANN 매처: 많을 때는 “대략 가장 가까운 것”을 빠르게</h3>
<p><b>FLANN(Fast Library for Approximate Nearest Neighbors)</b> 은 큰 데이터에서 <b>근사 최근접 이웃</b>을 빠르게 찾도록 최적화된 알고리즘 모음입니다. 기술자가 수만 ~ 수백만 개(예: 이미지 수천 장의 데이터베이스)일 때 BFMatcher 보다 훨씬 빠릅니다. 두 개의 딕셔너리로 설정합니다.</p>
<ul>
<li><b>index_params</b> — 어떤 자료구조로 색인할지
  <ul>
  <li>SIFT · SURF(실수): <code>dict(algorithm=FLANN_INDEX_KDTREE, trees=5)</code>, <code>FLANN_INDEX_KDTREE = 1</code></li>
  <li>ORB(이진): <code>dict(algorithm=FLANN_INDEX_LSH, table_number=6, key_size=12, multi_probe_level=1)</code>, <code>FLANN_INDEX_LSH = 6</code></li>
  </ul></li>
<li><b>search_params</b> — <code>dict(checks=50)</code>: 트리를 몇 번 살펴볼지. 크게 하면 더 정확하지만 느림</li>
</ul>` },
      { type: 'code', title: '예제 4 · SIFT + FLANN(KD-Tree) + 비율 테스트 + matchesMask (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)            # queryImage
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)   # trainImage

# Initiate SIFT detector
sift = cv.SIFT_create()

# find the keypoints and descriptors with SIFT
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)

# FLANN parameters
FLANN_INDEX_KDTREE = 1
index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
search_params = dict(checks=50)   # or pass empty dictionary

flann = cv.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(des1, des2, k=2)

# Need to draw only good matches, so create a mask
matchesMask = [[0, 0] for i in range(len(matches))]

# ratio test as per Lowe's paper
for i, (m, n) in enumerate(matches):
    if m.distance < 0.7 * n.distance:
        matchesMask[i] = [1, 0]
print('FLANN knnMatch %d 개 중 비율 테스트(0.7) 통과 %d 쌍' % (len(matches), sum(mk[0] for mk in matchesMask)))

draw_params = dict(matchColor=(0, 255, 0),
                   singlePointColor=(255, 0, 0),
                   matchesMask=matchesMask,
                   flags=cv.DrawMatchesFlags_DEFAULT)

img3 = cv.drawMatchesKnn(img1, kp1, img2, kp2, matches, None, **draw_params)
cv.imshow('SIFT FLANN', img3)
`, desc: '<p>튜토리얼은 좋은 매칭만 따로 모으는 대신 <b>matchesMask</b> 로 “그릴 것(1) / 그리지 않을 것(0)”을 표시합니다. 초록 선 = 비율 테스트를 통과한 매칭, 파란 점 = 짝이 없는 키포인트입니다. <code>[1, 0]</code> 은 k=2 결과 중 1등만 그리라는 뜻입니다.</p>' },
      { type: 'code', title: '예제 5 · ORB + FLANN(LSH) 매칭', code: String.raw`
import numpy as np
import cv2 as cv

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)

FLANN_INDEX_LSH = 6
index_params = dict(algorithm=FLANN_INDEX_LSH,
                    table_number=6,       # 12
                    key_size=12,          # 20
                    multi_probe_level=1)  # 2
search_params = dict(checks=50)
flann = cv.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(des1, des2, k=2)

# LSH 는 이웃을 2개 못 찾는 경우가 있어 결과 길이를 꼭 확인
good = []
short = 0
for pair in matches:
    if len(pair) < 2:
        short += 1
        continue
    m, n = pair
    if m.distance < 0.75 * n.distance:
        good.append(m)
print('ORB 키포인트 %d / %d, knn 결과 %d (이웃 2개 미만 %d) → 좋은 매칭 %d 쌍'
      % (len(kp1), len(kp2), len(matches), short, len(good)))

img3 = cv.drawMatches(img1, kp1, img2, kp2, good, None, matchColor=(0, 255, 0), flags=2)
cv.imshow('ORB FLANN-LSH ratio test', img3)
`, desc: '<p>이진 기술자는 KD-Tree 를 쓸 수 없어 <b>LSH(Locality Sensitive Hashing)</b> 색인을 씁니다. 비슷한 비트열이 같은 해시 칸에 모이도록 만드는 방식입니다. LSH 는 이웃을 k 개보다 적게 돌려줄 수 있으므로 <code>for m, n in matches</code> 로 바로 풀면 오류가 날 수 있습니다. 주석의 값(12, 20, 2)은 튜토리얼이 제안하는 더 정확한 설정입니다.</p>' },
      { type: 'text', html: `<h3>5. 어떤 방법이 가장 정확할까? 정답을 아는 실험</h3>
<p>box_in_scene 에는 “정답 위치”가 없어서 매칭이 맞는지 눈으로만 판단했습니다. 이번에는 <code>graf1.jpg</code> 를 우리가 정한 <b>원근 변환 행렬 H</b> 로 비틀어 두 번째 이미지를 만듭니다. 그러면 첫 이미지의 점 p 가 두 번째 이미지의 <code>cv.perspectiveTransform(p, H)</code> 위치로 가야 한다는 <b>정답</b>을 알 수 있어, 매칭마다 맞고 틀림을 셀 수 있습니다.</p>` },
      { type: 'code', title: '예제 6 · 매칭 방법별 정확도 비교 (정답을 아는 합성 이미지)', code: String.raw`
import cv2 as cv
import numpy as np
import time

img1 = cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE)
img1 = cv.resize(img1, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)
h, w = img1.shape
# 정답 변환: 원근 비틀기 + 25° 회전 + 0.8배
src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
dst = np.float32([[40, 30], [w - 20, 10], [w - 60, h - 15], [10, h - 40]])
R = np.vstack([cv.getRotationMatrix2D((w / 2, h / 2), 25, 0.8), [0, 0, 1]])
H_true = R @ cv.getPerspectiveTransform(src, dst)
img2 = cv.warpPerspective(img1, H_true, (w, h))
cv.imshow('img1 | img2 (warped with known H)', np.hstack([img1, img2]))

def accuracy(kp1, kp2, matches):
    if not matches:
        return 0
    p = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    q = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 2)
    expected = cv.perspectiveTransform(p, H_true).reshape(-1, 2)
    return int((np.linalg.norm(expected - q, axis=1) < 3).sum())      # 3픽셀 이내 = 정답

def ratio(pairs, r):
    return [p[0] for p in pairs if len(p) == 2 and p[0].distance < r * p[1].distance]

sift, orb = cv.SIFT_create(), cv.ORB_create(1000)
s1, sd1 = sift.detectAndCompute(img1, None); s2, sd2 = sift.detectAndCompute(img2, None)
o1, od1 = orb.detectAndCompute(img1, None);  o2, od2 = orb.detectAndCompute(img2, None)
flann_kd = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
flann_lsh = cv.FlannBasedMatcher(dict(algorithm=6, table_number=6, key_size=12, multi_probe_level=1), dict(checks=50))

tests = [
    ('ORB  BF (no filter)',   o1, o2, lambda: cv.BFMatcher(cv.NORM_HAMMING).match(od1, od2)),
    ('ORB  BF crossCheck',    o1, o2, lambda: cv.BFMatcher(cv.NORM_HAMMING, crossCheck=True).match(od1, od2)),
    ('ORB  BF ratio 0.75',    o1, o2, lambda: ratio(cv.BFMatcher(cv.NORM_HAMMING).knnMatch(od1, od2, k=2), 0.75)),
    ('ORB  FLANN-LSH 0.75',   o1, o2, lambda: ratio(flann_lsh.knnMatch(od1, od2, k=2), 0.75)),
    ('SIFT BF (no filter)',   s1, s2, lambda: cv.BFMatcher().match(sd1, sd2)),
    ('SIFT BF crossCheck',    s1, s2, lambda: cv.BFMatcher(cv.NORM_L2, crossCheck=True).match(sd1, sd2)),
    ('SIFT BF ratio 0.75',    s1, s2, lambda: ratio(cv.BFMatcher().knnMatch(sd1, sd2, k=2), 0.75)),
    ('SIFT FLANN-KD 0.7',     s1, s2, lambda: ratio(flann_kd.knnMatch(sd1, sd2, k=2), 0.7)),
]
print('키포인트: SIFT %d / %d, ORB %d / %d' % (len(s1), len(s2), len(o1), len(o2)))
print('%-22s %6s %6s %7s %8s' % ('method', 'match', 'correct', 'precision', 'time'))
for name, k1, k2, run in tests:
    t0 = time.perf_counter()
    ms = run()
    t = (time.perf_counter() - t0) * 1000
    c = accuracy(k1, k2, ms)
    print('%-22s %6d %6d %8.0f%% %6.1fms' % (name, len(ms), c, 100 * c / max(1, len(ms)), t))

print('\nSIFT 비율 값에 따른 변화 (BF knnMatch)')
pairs = cv.BFMatcher().knnMatch(sd1, sd2, k=2)
for r in [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]:
    g = ratio(pairs, r)
    c = accuracy(s1, s2, g)
    print('  ratio %.1f → 매칭 %4d, 정답 %4d, 정밀도 %3.0f%%' % (r, len(g), c, 100 * c / max(1, len(g))))
`, desc: '<p><b>precision(정밀도)</b> = 정답 매칭 ÷ 전체 매칭. 필터 없이 매칭하면 정밀도가 30~40% 대에 그치고, crossCheck 는 70~80%, <b>비율 테스트는 90% 이상</b>입니다. 비율 값을 키우면 매칭 수는 늘지만 정밀도가 떨어지는 <b>교환 관계</b>도 확인하세요. 다음 시간의 RANSAC 은 이렇게 남은 소수의 틀린 매칭까지 걸러 냅니다.</p>' },
      { type: 'table', head: ['상황', '추천 조합'], rows: [
        ['실시간(웹캠 · 모바일), 점 수백~수천 개', 'ORB + <code>BFMatcher(NORM_HAMMING)</code> + 비율 테스트 또는 crossCheck'],
        ['정확도가 중요한 사진 정합 · 파노라마', 'SIFT + <code>BFMatcher()</code> 또는 FLANN(KD-Tree) + 비율 0.7~0.75'],
        ['이미지 수천 장 데이터베이스 검색', 'FLANN (SIFT: KD-Tree, ORB: LSH)'],
        ['매칭 결과를 그대로 기하 계산에 쓸 때', '비율 테스트 후 반드시 RANSAC (8교시)'],
      ] },
      { type: 'warn', html: `<p>SIFT 기술자를 <code>NORM_HAMMING</code> 으로, ORB 기술자를 <code>NORM_L2</code> 로 매칭하면 오류가 나거나 엉뚱한 결과가 나옵니다. 기술자의 <b>dtype</b> 으로 확인하세요: <code>float32</code> → L2, <code>uint8</code> → HAMMING. 또 <code>crossCheck=True</code> 인 매처로 <code>knnMatch(k=2)</code> 를 하면 이웃을 1개만 돌려주는 경우가 생기므로 둘을 함께 쓰지 마세요.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 양방향 비율 테스트(대칭 매칭) 만들기',
        desc: `<p>비율 테스트(한 방향)와 crossCheck(서로 최선)를 합치면 더 믿을 만한 매칭을 얻을 수 있습니다. 예제 6 의 합성 이미지로 다음을 완성하세요.</p>
<ol><li><b>정방향</b>: des1 → des2 knnMatch + 비율 0.75 → <code>fwd</code></li>
<li><b>역방향</b>: des2 → des1 knnMatch + 비율 0.75 → <code>bwd</code></li>
<li><code>fwd</code> 의 매칭 m 중, 역방향에서 <code>m.trainIdx</code> 번의 짝이 다시 <code>m.queryIdx</code> 인 것만 남기기 → <code>sym</code></li></ol>
<p>세 결과의 매칭 수와 정밀도를 출력해 비교하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.resize(cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)
h, w = img1.shape
src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
dst = np.float32([[40, 30], [w - 20, 10], [w - 60, h - 15], [10, h - 40]])
R = np.vstack([cv.getRotationMatrix2D((w / 2, h / 2), 25, 0.8), [0, 0, 1]])
H_true = R @ cv.getPerspectiveTransform(src, dst)
img2 = cv.warpPerspective(img1, H_true, (w, h))

orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)
bf = cv.BFMatcher(cv.NORM_HAMMING)

def precision(matches):
    if not matches:
        return 0.0
    p = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    q = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 2)
    e = cv.perspectiveTransform(p, H_true).reshape(-1, 2)
    return 100 * np.mean(np.linalg.norm(e - q, axis=1) < 3)

def ratio(pairs, r=0.75):
    return [p[0] for p in pairs if len(p) == 2 and p[0].distance < r * p[1].distance]

fwd = ratio(bf.knnMatch(des1, des2, k=2))
# TODO 1: 역방향 매칭 bwd (des2 → des1)
bwd = []
# TODO 2: 역방향 결과를 {train 이미지 번호(queryIdx): img1 번호(trainIdx)} 딕셔너리로 만들고,
#         fwd 중 서로 짝이 맞는 것만 sym 에 남기기
sym = fwd

for name, ms in [('forward ratio', fwd), ('backward ratio', bwd), ('symmetric', sym)]:
    print('%-15s 매칭 %4d 쌍, 정밀도 %.1f%%' % (name, len(ms), precision(ms) if name != 'backward ratio' else 0))
`,
        hint: `<p><code>bwd = ratio(bf.knnMatch(des2, des1, k=2))</code>. 역방향의 m 은 queryIdx 가 img2 번호, trainIdx 가 img1 번호입니다. <code>back = {m.queryIdx: m.trainIdx for m in bwd}</code> 후 <code>sym = [m for m in fwd if back.get(m.trainIdx) == m.queryIdx]</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.resize(cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)
h, w = img1.shape
src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
dst = np.float32([[40, 30], [w - 20, 10], [w - 60, h - 15], [10, h - 40]])
R = np.vstack([cv.getRotationMatrix2D((w / 2, h / 2), 25, 0.8), [0, 0, 1]])
H_true = R @ cv.getPerspectiveTransform(src, dst)
img2 = cv.warpPerspective(img1, H_true, (w, h))

orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)
bf = cv.BFMatcher(cv.NORM_HAMMING)

def precision(matches):
    if not matches:
        return 0.0
    p = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    q = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 2)
    e = cv.perspectiveTransform(p, H_true).reshape(-1, 2)
    return 100 * np.mean(np.linalg.norm(e - q, axis=1) < 3)

def ratio(pairs, r=0.75):
    return [p[0] for p in pairs if len(p) == 2 and p[0].distance < r * p[1].distance]

fwd = ratio(bf.knnMatch(des1, des2, k=2))
bwd = ratio(bf.knnMatch(des2, des1, k=2))
back = {m.queryIdx: m.trainIdx for m in bwd}          # img2 번호 → img1 번호
sym = [m for m in fwd if back.get(m.trainIdx) == m.queryIdx]

for name, ms in [('forward ratio', fwd), ('backward ratio', bwd), ('symmetric', sym)]:
    # 역방향은 kp1/kp2 역할이 바뀌므로 정밀도 계산에서 제외
    print('%-15s 매칭 %4d 쌍, 정밀도 %s' % (name, len(ms), '%.1f%%' % precision(ms) if name != 'backward ratio' else '-'))

vis = cv.drawMatches(img1, kp1, img2, kp2, sym, None, matchColor=(0, 255, 0), flags=2)
cv.imshow('symmetric ratio matches', vis)
`,
      },
      {
        title: '실습 2 · 거리에 따라 색이 변하는 매칭 선 직접 그리기',
        desc: `<p><code>drawMatches</code> 를 쓰지 않고, 두 이미지를 <code>np.hstack</code> 으로 붙인 캔버스에 매칭 선을 <b>직접</b> 그려 보세요. SIFT + 비율 테스트(0.75)로 얻은 box / box_in_scene 매칭을 거리 순으로 정렬해, <b>가장 가까운 매칭은 초록 → 가장 먼 매칭은 빨강</b>으로 색이 변하게 합니다.</p>
<ul><li>두 이미지는 높이가 다르므로 작은 쪽 아래를 0 으로 채워 높이를 맞추기</li>
<li>오른쪽 이미지의 점은 x 좌표에 <b>왼쪽 이미지의 폭</b>을 더해야 함</li></ul>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
good = [m for m, n in cv.BFMatcher().knnMatch(des1, des2, k=2) if m.distance < 0.75 * n.distance]
good = sorted(good, key=lambda m: m.distance)
print('좋은 매칭:', len(good))

h1, w1 = img1.shape
h2, w2 = img2.shape
H = max(h1, h2)
# TODO 1: 높이를 H 로 맞춰(아래를 0 으로 채움) 가로로 붙인 컬러 캔버스 만들기
canvas = cv.cvtColor(img2, cv.COLOR_GRAY2BGR)

for i, m in enumerate(good):
    t = i / max(1, len(good) - 1)                   # 0(가장 가까움) ~ 1(가장 멂)
    color = (0, 255, 0)                             # TODO 2: t 에 따라 초록 (0,255,0) → 빨강 (0,0,255)
    x1, y1 = kp1[m.queryIdx].pt
    x2, y2 = kp2[m.trainIdx].pt
    # TODO 3: 오른쪽 이미지 좌표에 w1 을 더해 선과 점 그리기
    cv.circle(canvas, (int(x2), int(y2)), 3, color, -1)

cv.imshow('matches colored by distance', canvas)
`,
        hint: `<p>캔버스: <code>left = np.zeros((H, w1), np.uint8); left[:h1] = img1</code>, <code>right</code> 도 같은 방법 → <code>canvas = cv.cvtColor(np.hstack([left, right]), cv.COLOR_GRAY2BGR)</code>. 색: <code>(0, int(255 * (1 - t)), int(255 * t))</code>. 선: <code>cv.line(canvas, (int(x1), int(y1)), (int(x2) + w1, int(y2)), color, 1, cv.LINE_AA)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
good = [m for m, n in cv.BFMatcher().knnMatch(des1, des2, k=2) if m.distance < 0.75 * n.distance]
good = sorted(good, key=lambda m: m.distance)
print('좋은 매칭:', len(good))

h1, w1 = img1.shape
h2, w2 = img2.shape
H = max(h1, h2)
left = np.zeros((H, w1), np.uint8)
left[:h1] = img1
right = np.zeros((H, w2), np.uint8)
right[:h2] = img2
canvas = cv.cvtColor(np.hstack([left, right]), cv.COLOR_GRAY2BGR)

for i, m in enumerate(good):
    t = i / max(1, len(good) - 1)
    color = (0, int(255 * (1 - t)), int(255 * t))   # 초록 → 빨강
    x1, y1 = kp1[m.queryIdx].pt
    x2, y2 = kp2[m.trainIdx].pt
    p1 = (int(x1), int(y1))
    p2 = (int(x2) + w1, int(y2))
    cv.line(canvas, p1, p2, color, 1, cv.LINE_AA)
    cv.circle(canvas, p1, 3, color, -1)
    cv.circle(canvas, p2, 3, color, -1)

print('거리 범위: %.1f ~ %.1f' % (good[0].distance, good[-1].distance))
cv.imshow('matches colored by distance', canvas)
`,
      },
    ],
    quiz: [
      { q: "ORB 기술자를 BFMatcher 로 매칭할 때 알맞은 설정은?", options: ["cv.BFMatcher(cv.NORM_L2)", "cv.FlannBasedMatcher(dict(algorithm=1, trees=5), {})", "cv.BFMatcher(cv.NORM_L1)", "cv.BFMatcher(cv.NORM_HAMMING, crossCheck=True)"], answer: 3, explain: "ORB 는 이진(uint8) 기술자이므로 해밍 거리를 씁니다. KD-Tree(algorithm=1)는 실수 기술자용입니다." },
      { q: "crossCheck=True 의 의미는?", options: ["A 의 최선이 B 이고 B 의 최선도 A 일 때만 짝으로 인정한다", "k=2 로 두 개의 이웃을 찾는다", "거리가 0 인 매칭만 남긴다", "query 와 train 을 바꿔서 한 번 더 그린다"], answer: 0, explain: "서로가 서로의 가장 가까운 짝일 때만 남기므로 결과가 더 믿을 만합니다." },
      { q: "knnMatch(k=2) 결과에서 m.distance = 80, n.distance = 90 일 때 비율 0.75 테스트의 결과는?", options: ["거리가 100 보다 작으므로 채택한다", "80 &lt; 90 이므로 채택한다", "80 &lt; 0.75×90 = 67.5 가 거짓이므로 버린다", "n 을 채택한다"], answer: 2, explain: "1등과 2등의 거리가 비슷해 헷갈리는 매칭이므로 버립니다." },
      { q: "DMatch 객체에서 query 이미지 키포인트의 좌표를 얻는 올바른 코드는?", options: ["kp2[m.queryIdx].pt", "kp1[m.queryIdx].pt", "kp1[m.trainIdx].pt", "m.pt"], answer: 1, explain: "queryIdx 는 match/knnMatch 의 첫 번째 인자(des1, kp1)의 번호입니다. trainIdx 는 두 번째 인자(des2, kp2) 번호입니다." },
      { q: "FLANN 매처에 대한 설명으로 옳지 않은 것은?", options: ["SIFT 에는 KD-Tree(algorithm=1) 색인을 쓴다", "ORB 에는 LSH(algorithm=6) 색인을 쓴다", "search_params 의 checks 를 키우면 더 정확하지만 느려진다", "항상 BFMatcher 보다 정확한 최근접 이웃을 보장한다"], answer: 3, explain: "FLANN 은 “근사” 최근접 이웃이라 정확도를 조금 양보하고 속도를 얻습니다. 데이터가 클 때 유리합니다." },
    ],
  },

  /* ======================================================================
   * a1-8 매칭 + 호모그래피로 물체 찾기 · 1주차 정리
   * ====================================================================== */
  {
    id: 'a1-8',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg', 'images/adv/graf3.jpg'],
    summary: '특징점 매칭 결과로 두 평면 사이의 원근 변환인 호모그래피를 구해 장면 속 물체의 위치와 기울기를 찾습니다. 틀린 매칭(아웃라이어)을 견디는 RANSAC 의 원리를 실험으로 이해하고, 튜토리얼대로 findHomography + perspectiveTransform 으로 상자의 테두리를 그린 뒤, 다른 각도에서 찍은 벽화 사진을 정합합니다. 마지막으로 1주차 알고리즘을 표로 정리하고 실시간 물체 찾기 미니 챌린지에 도전합니다.',
    goals: [
      '호모그래피(3×3 행렬)가 평면 물체의 두 시점 사이 관계를 나타낸다는 것과 최소 4쌍의 점이 필요한 이유를 설명할 수 있다',
      'RANSAC 이 틀린 매칭 속에서 올바른 변환을 찾는 원리를 설명하고 findHomography 의 mask 로 인라이어를 구분할 수 있다',
      'SIFT · FLANN · 비율 테스트 · findHomography · perspectiveTransform 을 이어 장면 속 물체를 찾을 수 있다',
      '매칭 수 · 인라이어 비율 · 사각형 모양으로 “물체가 없음”을 판정하는 조건을 만들 수 있다',
      '1주차의 검출기 · 기술자 · 매처를 비교해 상황에 맞게 고를 수 있다',
    ],
    schedule: [['도입 · 0교시 목표 회상', 3], ['호모그래피 개념', 7], ['RANSAC', 7], ['튜토리얼: 상자 찾기', 10], ['벽화 정합 · 실패 판정', 7], ['1주차 정리', 5], ['미니 챌린지 · 퀴즈', 11]],
    blocks: [
      { type: 'text', html: `<h3>1. 매칭 다음 단계: “어디에, 어떤 모양으로” 있는가</h3>
<p>지난 시간에는 box.png 와 box_in_scene.png 의 좋은 매칭 수십 쌍을 얻었습니다. 하지만 매칭 선만으로는 “상자가 장면의 <b>어느 영역</b>에 <b>어떻게 기울어져</b> 있는지” 알 수 없습니다. 매칭 쌍들을 모두 설명하는 <b>하나의 변환</b>을 구해야 합니다.</p>
<p>상자 앞면처럼 <b>평평한 물체</b>를 다른 위치 · 각도에서 찍으면, 두 사진의 점은 <b>호모그래피(Homography)</b> 라는 3×3 행렬 H 로 연결됩니다.</p>
<p><b>[x′ y′ w]ᵀ = H · [x y 1]ᵀ</b>, &nbsp; 실제 좌표는 <b>(x′/w, y′/w)</b></p>
<ul>
<li>입문 과정에서 배운 <code>cv.getPerspectiveTransform</code>(문서 스캔)의 결과가 바로 호모그래피입니다. 그때는 점 <b>4쌍</b>을 사람이 직접 찍었죠.</li>
<li>H 는 9칸이지만 전체 크기를 곱해도 같은 변환이라 자유도는 <b>8</b> → 점 한 쌍이 식 2개를 주므로 <b>최소 4쌍</b> 필요</li>
<li>이번에는 4쌍을 사람이 고르는 대신, <b>특징점 매칭 수십 쌍</b>으로 자동 계산합니다 → <code>cv.findHomography</code></li>
<li>쓰임: 평면 물체 찾기, 파노라마 이어 붙이기(4주차), AR 로 표지 위에 영상 띄우기, 문서 · 번호판 펴기</li>
</ul>` },
      { type: 'code', title: '예제 1 · 호모그래피 직관: 4쌍으로 H 만들고 점 옮겨 보기', code: String.raw`
import cv2 as cv
import numpy as np

box = cv.imread('box.png')
h, w = box.shape[:2]

# 상자 네 모서리 → 기울어진 사각형 (시계 방향: 왼위, 오위, 오아래, 왼아래)
src = np.float32([[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]])
dst = np.float32([[80, 40], [330, 90], [300, 300], [40, 240]])
H = cv.getPerspectiveTransform(src, dst)
np.set_printoptions(precision=4, suppress=True)
print('H =\n', H)

warped = cv.warpPerspective(box, H, (380, 340))

# 상자 가운데 점 하나를 직접 계산 vs perspectiveTransform
cx, cy = w / 2, h / 2
xp, yp, ww = H @ np.array([cx, cy, 1.0])           # 동차 좌표로 곱하기
print('직접 계산: (%.2f, %.2f)  ← w=%.4f 로 나눈 결과' % (xp / ww, yp / ww, ww))
pt = cv.perspectiveTransform(np.float32([[[cx, cy]]]), H)   # 입력 모양 (N, 1, 2)
print('perspectiveTransform: (%.2f, %.2f)' % tuple(pt[0, 0]))

cv.circle(warped, (int(pt[0, 0, 0]), int(pt[0, 0, 1])), 6, (0, 0, 255), -1)
cv.polylines(warped, [np.int32(dst)], True, (0, 255, 0), 2)
cv.imshow('box.png', box)
cv.imshow('warped with H (red = box center)', warped)
`, desc: '<p>곱한 결과의 세 번째 값 w 로 나누는 것이 “원근”의 핵심입니다. 멀리 있는 쪽은 w 가 커져서 작게 보입니다. <code>cv.perspectiveTransform</code> 은 이 계산을 점 여러 개에 한꺼번에 해 주며, 입력은 <b>(N, 1, 2) float32</b> 모양이어야 합니다.</p>' },
      { type: 'text', html: `<h3>2. RANSAC: 틀린 매칭이 섞여 있어도 올바른 H 찾기</h3>
<p>비율 테스트를 거쳐도 매칭에는 틀린 쌍(<b>아웃라이어, outlier</b>)이 섞여 있습니다. 모든 쌍을 똑같이 믿고 최소제곱법으로 H 를 구하면, 멀리 튄 몇 쌍 때문에 결과가 크게 망가집니다. <b>RANSAC(RANdom SAmple Consensus)</b> 은 이렇게 동작합니다.</p>
<ol>
<li>매칭 중 <b>무작위로 4쌍</b>을 뽑아 H 를 계산한다</li>
<li>나머지 모든 쌍에 H 를 적용해, 예측 위치와 실제 위치의 거리가 <b>임계값(ransacReprojThreshold, 예: 5픽셀)</b> 이내인 쌍의 수(<b>인라이어, inlier</b>)를 센다</li>
<li>1~2 를 여러 번 반복해 <b>인라이어가 가장 많은 H</b> 를 고른다</li>
<li>그 인라이어들만으로 H 를 다시 정밀하게 계산한다</li>
</ol>
<p>“다수결”이라고 생각하면 됩니다. 틀린 매칭은 제각각 엉뚱한 방향을 가리키지만, 맞는 매칭은 모두 <b>같은 하나의 H</b> 에 동의하기 때문입니다. <code>cv.findHomography</code> 는 H 와 함께 <b>mask</b>(인라이어면 1, 아웃라이어면 0)를 돌려줍니다.</p>` },
      { type: 'code', title: '예제 2 · 실험: 30% 가 틀린 매칭일 때 최소제곱 vs RANSAC', code: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(0)
# 정답 호모그래피
src4 = np.float32([[0, 0], [300, 0], [300, 200], [0, 200]])
dst4 = np.float32([[60, 40], [330, 20], [360, 250], [40, 210]])
H_true = cv.getPerspectiveTransform(src4, dst4)

# 매칭 100쌍: 정답 위치 + 1픽셀 노이즈, 그중 30쌍은 완전히 틀린 위치(아웃라이어)
N = 100
p = rng.uniform([0, 0], [300, 200], (N, 2)).astype(np.float32).reshape(-1, 1, 2)
q = cv.perspectiveTransform(p, H_true) + rng.normal(0, 1.0, (N, 1, 2)).astype(np.float32)
bad = rng.choice(N, 30, replace=False)
q[bad] = rng.uniform([0, 0], [400, 300], (30, 1, 2)).astype(np.float32)
is_bad = np.zeros(N, bool)
is_bad[bad] = True

def corner_error(H):
    moved = cv.perspectiveTransform(src4.reshape(-1, 1, 2), H)
    return np.linalg.norm(moved - dst4.reshape(-1, 1, 2), axis=2).mean()

print('%-22s %12s %10s %14s' % ('method', 'corner err', 'inliers', 'caught outliers'))
H0, _ = cv.findHomography(p, q, 0)                       # 0 = 모든 점 최소제곱
print('%-22s %9.2f px %10s %14s' % ('least squares (0)', corner_error(H0), '-', '-'))
for name, method in [('RANSAC', cv.RANSAC), ('LMEDS', cv.LMEDS), ('RHO', cv.RHO)]:
    H, mask = cv.findHomography(p, q, method, 3.0)
    inl = mask.ravel() == 1
    print('%-22s %9.2f px %10d %11d / 30' % (name, corner_error(H), inl.sum(), (~inl & is_bad).sum()))
`, desc: '<p><b>corner err</b> = 추정한 H 로 옮긴 네 모서리가 정답에서 평균 몇 픽셀 벗어났는지. 모든 점을 믿는 최소제곱은 수십 픽셀 틀리지만, RANSAC 계열은 1픽셀 이내로 정답을 찾고 틀린 30쌍을 모두 아웃라이어로 골라냅니다. 인라이어가 70보다 조금 적은 것은 노이즈가 큰 정답 쌍 일부가 임계값(3px) 밖으로 나갔기 때문입니다.</p>' },
      { type: 'table', head: ['<code>M, mask = cv.findHomography(src, dst, method, ransacReprojThreshold)</code>', '설명'], rows: [
        ['<code>src</code>, <code>dst</code>', '대응점 좌표 (N, 1, 2) float32, N ≥ 4'],
        ['<code>method</code>', '<code>0</code> 최소제곱 · <code>cv.RANSAC</code> · <code>cv.LMEDS</code>(아웃라이어 50% 미만일 때) · <code>cv.RHO</code>(빠른 변형)'],
        ['<code>ransacReprojThreshold</code>', '인라이어로 인정할 최대 거리(픽셀). 보통 1~10, 튜토리얼 5.0'],
        ['반환 <code>M</code>', '3×3 호모그래피 (float64). 계산 실패 시 <b>None</b>'],
        ['반환 <code>mask</code>', '(N, 1) uint8, 인라이어 1 / 아웃라이어 0 → <code>mask.ravel().tolist()</code> 로 그리기용 matchesMask'],
      ] },
      { type: 'text', html: `<h3>3. 튜토리얼: 장면 속 상자 찾기</h3>
<p>공식 튜토리얼의 전체 흐름입니다. 지금까지 배운 것이 모두 들어 있습니다.</p>
<ol>
<li>SIFT 로 두 이미지의 키포인트 · 기술자 (4교시)</li>
<li>FLANN knnMatch + 비율 테스트 0.7 (7교시)</li>
<li>좋은 매칭이 <b>MIN_MATCH_COUNT(10)</b> 개 이상이면 → 좌표를 (N, 1, 2) 로 모아 <code>findHomography(RANSAC, 5.0)</code></li>
<li>상자 이미지의 네 모서리를 <code>perspectiveTransform</code> 으로 장면 좌표로 옮기고 <code>polylines</code> 로 테두리 그리기</li>
<li><code>matchesMask</code> 로 <b>인라이어 매칭만</b> 그리기</li>
</ol>` },
      { type: 'code', title: '예제 3 · SIFT + FLANN + findHomography 로 상자 찾기 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

MIN_MATCH_COUNT = 10

img1 = cv.imread('box.png', cv.IMREAD_GRAYSCALE)            # queryImage
img2 = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)   # trainImage

# Initiate SIFT detector
sift = cv.SIFT_create()

# find the keypoints and descriptors with SIFT
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)

FLANN_INDEX_KDTREE = 1
index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
search_params = dict(checks=50)

flann = cv.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(des1, des2, k=2)

# store all the good matches as per Lowe's ratio test.
good = []
for m, n in matches:
    if m.distance < 0.7 * n.distance:
        good.append(m)

if len(good) > MIN_MATCH_COUNT:
    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

    M, mask = cv.findHomography(src_pts, dst_pts, cv.RANSAC, 5.0)
    matchesMask = mask.ravel().tolist()

    h, w = img1.shape
    pts = np.float32([[0, 0], [0, h - 1], [w - 1, h - 1], [w - 1, 0]]).reshape(-1, 1, 2)
    dst = cv.perspectiveTransform(pts, M)

    img2 = cv.polylines(img2, [np.int32(dst)], True, 255, 3, cv.LINE_AA)
    print('좋은 매칭 %d 쌍 중 인라이어 %d 쌍 (%.0f%%)' % (len(good), sum(matchesMask), 100 * sum(matchesMask) / len(good)))
    print('H =\n', np.round(M, 4))
else:
    print("Not enough matches are found - {}/{}".format(len(good), MIN_MATCH_COUNT))
    matchesMask = None

draw_params = dict(matchColor=(0, 255, 0),   # draw matches in green color
                   singlePointColor=None,
                   matchesMask=matchesMask,  # draw only inliers
                   flags=2)

img3 = cv.drawMatches(img1, kp1, img2, kp2, good, None, **draw_params)
cv.imshow('homography', img3)
`, desc: '<p>장면(오른쪽)에서 기울어지고 일부 가려진 상자 둘레에 흰 사각형이 그려지고, 초록 선은 RANSAC 이 인정한 인라이어 매칭만 보여 줍니다. 좋은 매칭의 90% 이상이 인라이어입니다. 테두리 사각형의 모서리 순서(왼위 → 왼아래 → 오아래 → 오위)를 <code>pts</code> 와 비교해 보세요.</p>' },
      { type: 'text', html: `<h3>4. 다른 각도에서 찍은 사진 정합하기 (graf1 → graf3)</h3>
<p>호모그래피는 물체 찾기뿐 아니라 <b>두 사진을 겹치기(정합, registration)</b>에도 씁니다. <code>graf3.jpg</code> 는 같은 벽화를 옆에서 비스듬히 찍은 사진입니다. graf1 → graf3 호모그래피를 구해 <code>warpPerspective</code> 로 graf1 을 graf3 시점으로 바꾸면 두 사진이 겹쳐집니다. 이것이 4주차 <b>파노라마</b>의 핵심 단계입니다.</p>` },
      { type: 'code', title: '예제 4 · graf1 을 graf3 시점으로 정합하고 겹쳐 보기', code: String.raw`
import cv2 as cv
import numpy as np

# 브라우저 속도를 위해 60% 로 축소
img1 = cv.resize(cv.imread('graf1.jpg'), None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
img2 = cv.resize(cv.imread('graf3.jpg'), None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
g1 = cv.cvtColor(img1, cv.COLOR_BGR2GRAY)
g2 = cv.cvtColor(img2, cv.COLOR_BGR2GRAY)

sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(g1, None)
kp2, des2 = sift.detectAndCompute(g2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
good = [m for m, n in flann.knnMatch(des1, des2, k=2) if m.distance < 0.7 * n.distance]

src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
inliers = int(mask.sum())
print('키포인트 %d / %d, 좋은 매칭 %d, 인라이어 %d (%.0f%%)' % (len(kp1), len(kp2), len(good), inliers, 100 * inliers / len(good)))

# 인라이어들의 재투영 오차 (픽셀)
proj = cv.perspectiveTransform(src, H)
err = np.linalg.norm(proj - dst, axis=2).ravel()[mask.ravel() == 1]
print('인라이어 재투영 오차: 평균 %.2f px, 최대 %.2f px' % (err.mean(), err.max()))

h2, w2 = g2.shape
warped = cv.warpPerspective(img1, H, (w2, h2))              # graf1 → graf3 시점
blend = cv.addWeighted(img2, 0.5, warped, 0.5, 0)           # 반씩 겹치기
diff = cv.absdiff(cv.cvtColor(warped, cv.COLOR_BGR2GRAY), g2)
diff[cv.cvtColor(warped, cv.COLOR_BGR2GRAY) == 0] = 0       # 워핑 바깥(검은 영역)은 제외

cv.imshow('graf1 warped to graf3 view', warped)
cv.imshow('blend 50:50', blend)
cv.imshow('abs difference', diff)
`, desc: '<p>50:50 으로 겹친 그림에서 벽화의 선이 이중으로 보이지 않고 <b>하나로 겹치면</b> 정합 성공입니다. 차이 영상도 대부분 어둡습니다(밝은 부분은 조명 차이 · 벽화가 평면이 아닌 부분). 인라이어 재투영 오차가 평균 1~2 픽셀이면 매우 좋은 정합입니다.</p>' },
      { type: 'text', html: `<h3>5. 물체가 없을 때는? 실패를 판정하는 조건</h3>
<p><code>findHomography</code> 는 점이 4쌍 이상만 있으면 <b>틀린 매칭으로도 어떻게든 H 를 만들어 냅니다</b>. 실제 앱에서는 “찾았다”고 말하기 전에 다음을 확인해야 합니다.</p>
<ul>
<li><b>좋은 매칭 수</b> ≥ MIN_MATCH_COUNT (튜토리얼 10)</li>
<li><b>인라이어 수 · 비율</b>이 충분한가 (예: 8개 이상, 50% 이상)</li>
<li>H 가 <b>None</b> 이 아닌가</li>
<li>옮긴 네 모서리가 <b>볼록한 사각형</b>인가 (<code>cv.isContourConvex</code>) — 꼬이거나 뒤집힌 사각형은 잘못된 H</li>
<li>사각형 <b>넓이</b>가 너무 작거나 크지 않은가</li>
</ul>
<p>계산이 가벼운 ORB 로 이 검사를 모두 넣은 함수를 만들어, 상자가 있는 장면 · 없는 사진 · 90° 돌린 장면에서 시험해 봅시다.</p>` },
      { type: 'code', title: '예제 5 · 실패까지 판정하는 find_object() 함수 (ORB 버전)', code: String.raw`
import cv2 as cv
import numpy as np
import time

query = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(1000)
kq, dq = orb.detectAndCompute(query, None)
bf = cv.BFMatcher(cv.NORM_HAMMING)
qh, qw = query.shape
corners = np.float32([[0, 0], [0, qh - 1], [qw - 1, qh - 1], [qw - 1, 0]]).reshape(-1, 1, 2)

def find_object(scene_gray, min_good=10, min_inliers=8, min_ratio=0.5):
    ks, ds = orb.detectAndCompute(scene_gray, None)
    if ds is None:
        return None, '특징점 없음'
    pairs = bf.knnMatch(dq, ds, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < min_good:
        return None, '좋은 매칭 부족 (%d)' % len(good)
    src = np.float32([kq[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([ks[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    if H is None:
        return None, '호모그래피 계산 실패'
    inl = int(mask.sum())
    if inl < min_inliers or inl / len(good) < min_ratio:
        return None, '인라이어 부족 (%d / %d)' % (inl, len(good))
    quad = cv.perspectiveTransform(corners, H)
    if not cv.isContourConvex(np.int32(quad)):
        return None, '사각형이 꼬임'
    area = cv.contourArea(quad)
    if area < 0.001 * scene_gray.size:
        return None, '너무 작음 (%.0f px²)' % area
    return quad, '찾음: 매칭 %d, 인라이어 %d, 넓이 %.0f px²' % (len(good), inl, area)

scene = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
tests = [('box_in_scene.png', scene),
         ('rotated 90', cv.rotate(scene, cv.ROTATE_90_CLOCKWISE)),
         ('messi5.jpg (no box)', cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)),
         ('home.jpg (no box)', cv.imread('home.jpg', cv.IMREAD_GRAYSCALE))]
for name, g in tests:
    t0 = time.perf_counter()
    quad, msg = find_object(g)
    ms = (time.perf_counter() - t0) * 1000
    print('%-20s → %s  (%.0f ms)' % (name, msg, ms))
    vis = cv.cvtColor(g, cv.COLOR_GRAY2BGR)
    if quad is not None:
        cv.polylines(vis, [np.int32(quad)], True, (0, 255, 0), 3, cv.LINE_AA)
    cv.putText(vis, 'FOUND' if quad is not None else 'NOT FOUND', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9,
               (0, 255, 0) if quad is not None else (0, 0, 255), 2)
    cv.imshow(name, vis)
`, desc: '<p>상자가 있는 장면과 90° 돌린 장면에서는 초록 테두리를 찾고, 상자가 없는 사진에서는 “좋은 매칭 부족”으로 올바르게 <b>NOT FOUND</b> 를 판정합니다. ORB 버전은 SIFT 보다 훨씬 빨라서 이 함수를 그대로 <code>process(frame)</code> 에 넣으면 실시간 물체 찾기가 됩니다(미니 챌린지).</p>' },
      { type: 'text', html: `<h3>6. 1주차 정리: 특징점 파이프라인</h3>
<p><b>검출(Detect)</b> → <b>기술(Describe)</b> → <b>매칭(Match)</b> → <b>필터(Ratio / crossCheck)</b> → <b>기하 검증(RANSAC 호모그래피)</b> → <b>활용(물체 찾기 · 정합 · 파노라마 · AR)</b></p>
<p>각 단계에서 무엇을 고를지는 “정확도 · 속도 · 크기 / 회전 변화의 정도”로 결정합니다.</p>` },
      { type: 'table', head: ['알고리즘 (교시)', '역할', '회전 불변', '크기 불변', '기술자 · 거리', '속도', 'OpenCV'], rows: [
        ['Harris (2)', '코너 검출', '○', '✕', '—', '빠름', '<code>cv.cornerHarris</code>'],
        ['Shi-Tomasi (3)', '코너 검출 (추적용)', '○', '✕', '—', '빠름', '<code>cv.goodFeaturesToTrack</code>'],
        ['SIFT (4)', '검출 + 기술', '○', '○', '128 float · L2', '느림', '<code>cv.SIFT_create</code>'],
        ['SURF (4)', '검출 + 기술', '○', '○', '64 float · L2', '보통', 'contrib nonfree (실행 불가)'],
        ['FAST (5)', '코너 검출', '✕', '✕', '—', '매우 빠름', '<code>cv.FastFeatureDetector_create</code>'],
        ['BRIEF (5)', '기술', '✕', '✕', '256 bit · Hamming', '매우 빠름', 'contrib (실행 불가)'],
        ['ORB (6)', '검출 + 기술', '○', '△ (피라미드)', '256 bit · Hamming', '매우 빠름', '<code>cv.ORB_create</code>'],
        ['AKAZE · BRISK (5)', '검출 + 기술', '○', '○', '486 · 512 bit · Hamming', '보통', '<code>cv.AKAZE_create</code> · <code>cv.BRISK_create</code>'],
        ['BF · FLANN (7)', '매칭', '—', '—', 'match · knnMatch · 비율 테스트', 'BF 소규모 / FLANN 대규모', '<code>cv.BFMatcher</code> · <code>cv.FlannBasedMatcher</code>'],
        ['Homography (8)', '기하 검증 · 위치', '—', '—', 'RANSAC 인라이어', '빠름', '<code>cv.findHomography</code> · <code>cv.perspectiveTransform</code>'],
      ] },
      { type: 'tip', html: `<p><b>선택 요령</b>: 실시간 웹캠 · 모바일이면 <b>ORB + Hamming + 비율 테스트</b>, 사진 정합 · 파노라마처럼 정확도가 중요하면 <b>SIFT + FLANN/BF + 비율 0.7</b>, 둘 사이의 균형이 필요하면 <b>AKAZE</b>. 어떤 조합이든 물체의 위치를 쓰려면 마지막에 <b>RANSAC 호모그래피 + 실패 판정</b>을 붙이세요.</p>` },
      { type: 'text', html: `<h3>7. 미니 챌린지: 실시간 물체 찾기</h3>
<p>실습 1 에서 예제 5 의 흐름을 <code>process(frame)</code> 에 넣어 <b>웹캠 · 동영상 · 이미지 입력에서 물체를 실시간으로 찾는 앱</b>을 완성합니다.</p>
<ul>
<li>기본 찾을 물체: <code>box.png</code>. 오른쪽 입력 소스 목록에서 <b>box_in_scene.png</b> 를 고르면 바로 확인할 수 있습니다.</li>
<li>웹캠이 있으면 휴대폰 화면에 box_in_scene.png 를 띄워 비추거나, <b>register</b> 트랙바를 1 로 올려 <b>화면 가운데 물체(책 표지 등)를 새 물체로 등록</b>해 보세요.</li>
<li>도전 과제: 찾은 사각형 안에 다른 이미지(예: <code>messi5.jpg</code>)를 <code>warpPerspective</code> 로 덮어씌우면 → <b>AR 오버레이</b> (4주차 프로젝트 예고!)</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 미니 챌린지: 실시간 물체 찾기 앱 완성하기',
        desc: `<p><code>process(frame)</code> 안에서 ORB 매칭까지는 준비되어 있습니다. <b>TODO</b> 를 채워 ① RANSAC 호모그래피 → ② 인라이어 수 · 비율 검사 → ③ 네 모서리를 옮겨 초록 테두리 그리기 → ④ 상태 글자(FOUND / NOT FOUND, 인라이어 수, 처리 시간)를 완성하세요.</p>
<p>확인 방법: 입력 소스를 <b>box_in_scene.png</b> 로 두면 상자에 테두리가, <b>messi5.jpg</b> 로 두면 NOT FOUND 가 나와야 합니다. 📷 웹캠에서는 <b>register</b> 트랙바를 1 로 올려 가운데 물체를 등록한 뒤 물체를 움직여 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time

orb = cv.ORB_create(1000)
bf = cv.BFMatcher(cv.NORM_HAMMING)
Q = {}

def set_query(gray):
    Q['kp'], Q['des'] = orb.detectAndCompute(gray, None)
    h, w = gray.shape
    Q['corners'] = np.float32([[0, 0], [0, h - 1], [w - 1, h - 1], [w - 1, 0]]).reshape(-1, 1, 2)
    print('물체 등록: 키포인트 %d 개' % len(Q['kp']))

set_query(cv.imread('box.png', cv.IMREAD_GRAYSCALE))

def nothing(x):
    pass
cv.namedWindow('result')
cv.createTrackbar('register', 'result', 0, 1, nothing)     # 1 로 올리면 화면 가운데를 새 물체로 등록

def process(frame):
    t0 = time.perf_counter()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    H_, W_ = gray.shape
    if cv.getTrackbarPos('register', 'result') == 1:
        set_query(gray[H_ // 4:3 * H_ // 4, W_ // 4:3 * W_ // 4].copy())
        cv.setTrackbarPos('register', 'result', 0)

    out = frame.copy()
    found, info = False, ''
    ks, ds = orb.detectAndCompute(gray, None)
    if ds is not None and Q['des'] is not None:
        pairs = bf.knnMatch(Q['des'], ds, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
        info = 'good %d' % len(good)
        if len(good) >= 10:
            src = np.float32([Q['kp'][m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
            dst = np.float32([ks[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
            # TODO 1: cv.findHomography(src, dst, cv.RANSAC, 5.0) 로 H, mask 구하기
            # TODO 2: H 가 None 이 아니고, 인라이어 8개 이상 · 비율 50% 이상이면
            #         Q['corners'] 를 perspectiveTransform 으로 옮겨 볼록하면 초록 테두리 그리고 found = True
            pass

    ms = (time.perf_counter() - t0) * 1000
    # TODO 3: found 에 따라 'FOUND' (초록) / 'NOT FOUND' (빨강) 와 info, ms 를 화면에 쓰기
    cv.putText(out, '%s  %.0f ms' % (info, ms), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return out
`,
        hint: `<p><code>H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)</code> → <code>inl = int(mask.sum())</code> → <code>if H is not None and inl &gt;= 8 and inl / len(good) &gt;= 0.5:</code> → <code>quad = cv.perspectiveTransform(Q['corners'], H)</code> → <code>if cv.isContourConvex(np.int32(quad)):</code> <code>cv.polylines(out, [np.int32(quad)], True, (0, 255, 0), 3)</code>. mask 가 None 일 수 있으니 H 검사를 먼저 하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time

orb = cv.ORB_create(1000)
bf = cv.BFMatcher(cv.NORM_HAMMING)
Q = {}

def set_query(gray):
    Q['kp'], Q['des'] = orb.detectAndCompute(gray, None)
    h, w = gray.shape
    Q['corners'] = np.float32([[0, 0], [0, h - 1], [w - 1, h - 1], [w - 1, 0]]).reshape(-1, 1, 2)
    print('물체 등록: 키포인트 %d 개' % len(Q['kp']))

set_query(cv.imread('box.png', cv.IMREAD_GRAYSCALE))

def nothing(x):
    pass
cv.namedWindow('result')
cv.createTrackbar('register', 'result', 0, 1, nothing)

def process(frame):
    t0 = time.perf_counter()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    H_, W_ = gray.shape
    if cv.getTrackbarPos('register', 'result') == 1:
        set_query(gray[H_ // 4:3 * H_ // 4, W_ // 4:3 * W_ // 4].copy())
        cv.setTrackbarPos('register', 'result', 0)

    out = frame.copy()
    found, info = False, ''
    ks, ds = orb.detectAndCompute(gray, None)
    if ds is not None and Q['des'] is not None:
        pairs = bf.knnMatch(Q['des'], ds, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
        info = 'good %d' % len(good)
        if len(good) >= 10:
            src = np.float32([Q['kp'][m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
            dst = np.float32([ks[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
            H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
            if H is not None:
                inl = int(mask.sum())
                info += '  inliers %d' % inl
                if inl >= 8 and inl / len(good) >= 0.5:
                    quad = cv.perspectiveTransform(Q['corners'], H)
                    if cv.isContourConvex(np.int32(quad)):
                        cv.polylines(out, [np.int32(quad)], True, (0, 255, 0), 3, cv.LINE_AA)
                        found = True

    ms = (time.perf_counter() - t0) * 1000
    cv.putText(out, 'FOUND' if found else 'NOT FOUND', (10, 55), cv.FONT_HERSHEY_SIMPLEX, 0.9,
               (0, 255, 0) if found else (0, 0, 255), 2)
    cv.putText(out, '%s  %.0f ms' % (info, ms), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return out
`,
      },
      {
        title: '실습 2 · RANSAC 임계값에 따른 인라이어 수와 정합 오차',
        desc: `<p>graf1 → graf3 (60% 축소) SIFT 매칭으로, <code>ransacReprojThreshold</code> 를 <b>1, 2, 3, 5, 10, 20</b> 으로 바꿔 가며 <b>인라이어 수</b>와 <b>인라이어의 평균 재투영 오차</b>를 표로 출력하고, 두 값을 matplotlib 그래프(영어 라벨)로 그리세요. 임계값이 커지면 인라이어는 늘지만 오차는 어떻게 되나요? 어느 값이 적당할까요?</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

g1 = cv.resize(cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
g2 = cv.resize(cv.imread('graf3.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(g1, None)
kp2, des2 = sift.detectAndCompute(g2, None)
good = [m for m, n in cv.BFMatcher().knnMatch(des1, des2, k=2) if m.distance < 0.75 * n.distance]
src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
print('좋은 매칭:', len(good))

thresholds = [5.0]          # TODO 1: 1, 2, 3, 5, 10, 20 으로 바꾸기
n_inliers, mean_errs = [], []
for th in thresholds:
    H, mask = cv.findHomography(src, dst, cv.RANSAC, th)
    inl = mask.ravel() == 1
    # TODO 2: perspectiveTransform(src, H) 와 dst 의 거리 중 인라이어의 평균 오차 구하기
    e = 0.0
    n_inliers.append(int(inl.sum()))
    mean_errs.append(e)
    print('threshold %5.1f → 인라이어 %4d, 평균 오차 %.2f px' % (th, inl.sum(), e))

# TODO 3: 두 개의 subplot 에 threshold-인라이어 수, threshold-평균 오차 그래프
`,
        hint: `<p><code>err = np.linalg.norm(cv.perspectiveTransform(src, H) - dst, axis=2).ravel()</code> → <code>e = err[inl].mean()</code>. 그래프: <code>plt.subplot(1, 2, 1); plt.plot(thresholds, n_inliers, 'o-')</code> …</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

g1 = cv.resize(cv.imread('graf1.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
g2 = cv.resize(cv.imread('graf3.jpg', cv.IMREAD_GRAYSCALE), None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(g1, None)
kp2, des2 = sift.detectAndCompute(g2, None)
good = [m for m, n in cv.BFMatcher().knnMatch(des1, des2, k=2) if m.distance < 0.75 * n.distance]
src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
print('좋은 매칭:', len(good))

thresholds = [1, 2, 3, 5, 10, 20]
n_inliers, mean_errs = [], []
for th in thresholds:
    H, mask = cv.findHomography(src, dst, cv.RANSAC, th)
    inl = mask.ravel() == 1
    err = np.linalg.norm(cv.perspectiveTransform(src, H) - dst, axis=2).ravel()
    e = float(err[inl].mean())
    n_inliers.append(int(inl.sum()))
    mean_errs.append(e)
    print('threshold %5.1f → 인라이어 %4d (%.0f%%), 평균 오차 %.2f px' % (th, inl.sum(), 100 * inl.mean(), e))

plt.figure(figsize=(10, 3.8))
plt.subplot(1, 2, 1), plt.plot(thresholds, n_inliers, 'o-')
plt.xlabel('ransacReprojThreshold (px)'), plt.ylabel('inliers'), plt.title('Inliers vs threshold')
plt.subplot(1, 2, 2), plt.plot(thresholds, mean_errs, 'o-', color='tab:red')
plt.xlabel('ransacReprojThreshold (px)'), plt.ylabel('mean reprojection error (px)'), plt.title('Inlier error vs threshold')
plt.tight_layout()
plt.show()
`,
      },
    ],
    quiz: [
      { q: "호모그래피 H 를 계산하려면 최소 몇 쌍의 대응점이 필요한가요?", options: ["2쌍", "3쌍", "4쌍", "8쌍"], answer: 2, explain: "H 는 자유도가 8 이고 점 한 쌍이 식 2개를 주므로 최소 4쌍이 필요합니다. 입문 과정 getPerspectiveTransform 도 4점을 썼습니다." },
      { q: "findHomography 에서 RANSAC 을 쓰는 가장 큰 이유는?", options: ["매칭 중 섞인 틀린 쌍(아웃라이어)에 영향받지 않고 올바른 H 를 찾기 위해", "계산을 GPU 로 하기 위해", "점이 4쌍보다 적을 때도 계산하기 위해", "결과를 정수로 만들기 위해"], answer: 0, explain: "무작위 4쌍으로 H 를 만들고 가장 많은 쌍이 동의하는 H 를 고르는 다수결 방식이라 아웃라이어에 강합니다." },
      { q: "M, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0) 의 mask 에 대한 설명으로 옳은 것은?", options: ["상자 영역이 255 인 이진 영상", "좋은 매칭의 거리 값", "H 의 역행렬", "각 대응점이 인라이어면 1, 아웃라이어면 0 인 (N, 1) 배열"], answer: 3, explain: "mask.ravel().tolist() 를 drawMatches 의 matchesMask 로 넘기면 인라이어 매칭만 그릴 수 있습니다." },
      { q: "상자 이미지의 네 모서리를 장면 좌표로 옮기는 올바른 코드는?", options: ["cv.warpAffine(pts, M)", "cv.perspectiveTransform(pts.reshape(-1, 1, 2), M)", "M * pts", "cv.findHomography(pts, M)"], answer: 1, explain: "점 좌표는 (N, 1, 2) float32 모양으로 perspectiveTransform 에 넣습니다. warpPerspective 는 이미지 전체를 변환할 때 씁니다." },
      { q: "1주차 정리: 스마트폰 웹캠에서 회전하는 책 표지를 실시간으로 찾는 앱에 가장 알맞은 조합은?", options: ["ORB + BFMatcher(NORM_HAMMING) + 비율 테스트 + RANSAC 호모그래피", "SIFT + FLANN + 최소제곱 호모그래피", "Harris + 템플릿 매칭", "FAST + NORM_L2 매칭"], answer: 0, explain: "ORB 는 빠르고 회전 불변인 이진 특징이라 실시간에 알맞고, 해밍 거리 매칭 · 비율 테스트 · RANSAC 으로 안정적인 위치를 얻습니다." },
    ],
  },

]);
