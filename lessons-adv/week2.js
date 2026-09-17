/* 심화 2주차: 카메라 캘리브레이션과 3D 재구성 — docs/LESSON_GUIDE.md · docs/ADVANCED_GUIDE.md 참고
 *  OpenCV.org 튜토리얼: Camera Calibration · Pose Estimation · Epipolar Geometry · Depth Map from Stereo Images + ArUco
 */
COURSE.addLessons([
  // =====================================================================
  // a2-1 카메라 모델과 렌즈 왜곡
  // =====================================================================
  {
    id: 'a2-1',
    assets: ['images/adv/left12.jpg'],
    summary: '카메라가 3D 세상을 2D 사진으로 옮기는 규칙(핀홀 카메라 모델)을 숫자로 직접 계산해 보고, 내부 파라미터(fx, fy, cx, cy) · 외부 파라미터(R, t) · 렌즈 왜곡 계수(k1, k2, p1, p2, k3)가 각각 사진에 어떤 영향을 주는지 그림으로 확인합니다. 2주차 전체의 기초가 되는 교시입니다.',
    goals: [
      '핀홀 카메라 모델에서 “거리가 2배면 크기는 절반”인 이유를 닮은 삼각형으로 설명할 수 있다',
      '카메라 행렬 K 의 fx, fy, cx, cy 가 무엇을 뜻하는지 말하고, numpy 로 3D 점을 픽셀 좌표로 투영할 수 있다',
      '외부 파라미터 R, t 가 “카메라가 어디에서 어느 방향을 보는가”를 나타낸다는 것을 cv.projectPoints 로 확인할 수 있다',
      '방사 왜곡(술통형 · 실패형)과 접선 왜곡을 구별하고, 왜곡 계수의 부호와 순서(k1, k2, p1, p2, k3)를 설명할 수 있다',
    ],
    schedule: [['도입 · 2주차 로드맵', 5], ['핀홀 카메라 · 내부/외부 파라미터', 17], ['렌즈 왜곡', 13], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 2주차에서 할 일: 사진에서 “3D”를 되찾기</h3>
<p>1주차에는 사진 속 특징점을 찾고 매칭했습니다. 그런데 사진은 3D 세상을 평평한 2D 로 <b>눌러 담은 것</b>이라, “이 물체가 몇 cm 떨어져 있지?”, “카메라가 어느 방향으로 기울어 있지?” 같은 질문에는 바로 답할 수 없습니다.
2주차에는 카메라를 <b>측정 도구</b>로 바꾸는 방법을 배웁니다. 먼저 카메라가 사진을 만드는 규칙(<b>카메라 모델</b>)을 알아야, 그 규칙을 거꾸로 풀어 3D 정보를 되찾을 수 있습니다.</p>
<p>스마트폰 AR 앱이 바닥에 가구를 올려놓는 것, 로봇 팔이 물건을 집는 것, 자율주행차가 앞차와의 거리를 재는 것이 모두 이번 주 내용 위에서 동작합니다.</p>` },
      { type: 'table', head: ['교시', '질문', '핵심 함수'], rows: [
        ['a2-1 카메라 모델', '카메라는 3D 점을 어디에 찍을까?', '<code>cv.projectPoints</code>'],
        ['a2-2 ~ a2-4 캘리브레이션', '내 카메라의 K 와 왜곡 계수는? 휜 사진을 펴려면?', '<code>findChessboardCorners</code>, <code>calibrateCamera</code>, <code>undistort</code>'],
        ['a2-5 자세 추정', '체스보드가 카메라에 대해 어떻게 놓여 있나?', '<code>solvePnP</code>, <code>drawFrameAxes</code>'],
        ['a2-6 에피폴라 기하', '두 사진 사이에는 어떤 기하 규칙이 있나?', '<code>findFundamentalMat</code>'],
        ['a2-7 스테레오 깊이', '두 사진으로 거리를 알 수 있나?', '<code>StereoBM</code>, <code>StereoSGBM</code>'],
        ['a2-8 ArUco', '마커 하나로 자세를 알 수 있나?', '<code>ArucoDetector</code>, <code>solvePnP</code>'],
      ] },
      { type: 'text', html: `<h3>2. 핀홀 카메라 모델: 바늘구멍 사진기</h3>
<p>상자에 바늘구멍 하나를 뚫고 반대쪽 벽에 종이를 대면, 바깥 풍경이 거꾸로 비칩니다. 물체의 각 점에서 나온 빛이 <b>구멍 한 점을 지나 직선으로</b> 종이에 닿기 때문입니다. 실제 카메라도 렌즈를 이 “구멍”으로 생각하면 계산이 아주 간단해집니다. 이것이 <b>핀홀 카메라 모델(Pinhole Camera Model)</b>입니다.</p>
<p>구멍에서 종이까지 거리를 <b>초점거리 f</b>, 물체까지 거리를 <b>Z</b>, 물체 높이를 <b>Y</b> 라고 하면 두 삼각형이 닮은꼴이므로</p>
<pre>  사진 속 높이 y = f × Y / Z</pre>
<ul>
<li><b>Z 로 나눈다</b> → 같은 물체도 2배 멀어지면 사진에서 절반 크기. 이것이 원근감의 정체입니다.</li>
<li>나눗셈 때문에 <b>Z 정보가 사라집니다</b>. 1 m 앞의 50 cm 인형과 2 m 앞의 1 m 사람은 사진에서 같은 크기! 그래서 한 장의 사진만으로는 거리를 알 수 없습니다(a2-7 에서 두 장으로 해결).</li>
<li>OpenCV 에서 카메라 좌표계는 <b>X 오른쪽, Y 아래, Z 카메라가 보는 앞쪽</b>입니다(이미지 좌표 x, y 방향과 같게 맞춘 것).</li>
</ul>` },
      { type: 'code', title: '예제 1 · 핀홀 투영을 손으로 계산하기', code: String.raw`
import numpy as np

f = 500.0            # 초점거리 (픽셀 단위)
H = 1.7              # 사람 키 1.7 m

print('거리 Z(m) | 사진 속 키(px)')
for Z in [1, 2, 4, 8]:
    y = f * H / Z                      # 닮은 삼각형: y = f·Y/Z
    print(f'{Z:7.0f}  | {y:8.1f}')

# 한 장의 사진만으로는 크기와 거리를 구별할 수 없다!
doll = f * 0.5 / 1.0       # 1 m 앞의 50 cm 인형
person = f * 1.0 / 2.0     # 2 m 앞의 1 m 아이
print('인형:', doll, 'px  /  아이:', person, 'px  → 사진에서는 똑같은 크기')
`, desc: '<p>거리가 2배가 될 때마다 사진 속 크기가 정확히 절반이 됩니다. 마지막 줄은 “작고 가까운 것”과 “크고 먼 것”이 사진에서는 구별되지 않는다는 것을 보여 줍니다. 3D 복원이 어려운 근본 이유입니다.</p>' },
      { type: 'text', html: `<h3>3. 내부 파라미터: 카메라 행렬 K</h3>
<p>실제 사진 좌표는 왼쪽 위가 (0, 0) 이고 단위가 <b>픽셀</b>입니다. 그래서 위 식에 두 가지를 보탭니다.</p>
<ul>
<li><b>fx, fy</b> : 초점거리를 픽셀 단위로 나타낸 값. 센서의 픽셀이 정사각형이면 fx ≈ fy 입니다. 값이 클수록 <b>망원</b>(좁고 크게), 작을수록 <b>광각</b>(넓고 작게).</li>
<li><b>cx, cy</b> : 렌즈 중심(광축)이 사진에서 찍히는 위치, <b>주점(principal point)</b>. 보통 이미지 중앙 근처(640×480 이면 약 (320, 240)).</li>
</ul>
<pre>  u = fx · X/Z + cx
  v = fy · Y/Z + cy

        | fx   0  cx |
  K  =  |  0  fy  cy |      [u·s, v·s, s] = K @ [X, Y, Z]   (s = Z 로 나누면 u, v)
        |  0   0   1 |</pre>
<p>이 네 숫자는 카메라(렌즈 + 센서 + 해상도)마다 고정된 “카메라의 신분증”이라 <b>내부 파라미터(intrinsic parameters)</b>라고 부릅니다. a2-3 에서 체스보드 사진으로 이 값을 직접 구합니다.</p>` },
      { type: 'table', head: ['구분', '기호', '의미', '바뀌는 경우'], rows: [
        ['내부 파라미터', 'fx, fy, cx, cy (행렬 K)', '초점거리(px), 주점 위치', '줌 · 해상도가 바뀔 때'],
        ['왜곡 계수', 'k1, k2, p1, p2, k3 (dist)', '렌즈가 직선을 휘게 하는 정도', '렌즈가 바뀔 때'],
        ['외부 파라미터', 'R (회전), t (이동)', '월드(물체) 좌표계 → 카메라 좌표계', '카메라나 물체가 움직일 때마다'],
      ] },
      { type: 'code', title: '예제 2 · 행렬 K 로 투영하고 cv.projectPoints 와 비교', code: String.raw`
import cv2 as cv
import numpy as np
np.set_printoptions(precision=2, suppress=True)

fx, fy, cx, cy = 500.0, 500.0, 320.0, 240.0
K = np.array([[fx, 0, cx],
              [0, fy, cy],
              [0,  0,  1]])

# 카메라 앞 2 m 에 놓인 한 변 1 m 정사각형의 네 꼭짓점 (카메라 좌표계, 단위 m)
P = np.array([[-0.5, -0.5, 2.0],
              [ 0.5, -0.5, 2.0],
              [ 0.5,  0.5, 2.0],
              [-0.5,  0.5, 2.0]])

# 1) 직접 계산: K @ [X, Y, Z] 를 한 뒤 세 번째 값(Z)으로 나누기
uvw = (K @ P.T).T
uv = uvw[:, :2] / uvw[:, 2:3]
print('직접 계산:\n', uv)

# 2) OpenCV: 회전 없음(rvec=0), 이동 없음(tvec=0), 왜곡 없음(None)
rvec = np.zeros(3)
tvec = np.zeros(3)
uv2, _ = cv.projectPoints(P, rvec, tvec, K, None)
print('cv.projectPoints:\n', uv2.reshape(-1, 2))

# 그림으로 확인
canvas = np.full((480, 640, 3), 255, np.uint8)
cv.polylines(canvas, [np.int32(uv)], True, (255, 0, 0), 2)
cv.drawMarker(canvas, (int(cx), int(cy)), (0, 0, 255), cv.MARKER_CROSS, 20, 2)
cv.putText(canvas, '(cx, cy)', (int(cx) + 8, int(cy) - 8), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
cv.imshow('projection', canvas)
`, desc: '<p>1 m 정사각형이 2 m 앞에서 250×250 픽셀(= 500 × 1 / 2)로 찍힙니다. 직접 계산한 값과 <code>cv.projectPoints</code>의 결과가 같습니다. <code>projectPoints</code>는 여기에 외부 파라미터(회전 · 이동)와 렌즈 왜곡까지 한 번에 적용해 주는 함수로, 2주차 내내 사용합니다.</p>' },
      { type: 'text', html: `<h3>4. 외부 파라미터: 카메라는 어디에서 어느 쪽을 보나?</h3>
<p>위 예제는 점의 좌표가 이미 <b>카메라 기준</b>이었습니다. 하지만 보통 물체의 좌표는 “체스보드 왼쪽 위 모서리 기준”, “방 바닥 기준”처럼 <b>월드 좌표계</b>로 알고 있습니다. 월드 좌표를 카메라 좌표로 바꾸는 규칙이 <b>외부 파라미터(extrinsic parameters)</b>입니다.</p>
<pre>  [X, Y, Z]카메라 = R @ [X, Y, Z]월드 + t</pre>
<ul>
<li><b>R</b> (3×3 회전 행렬) : 카메라가 월드에 대해 얼마나 돌아가 있는지</li>
<li><b>t</b> (3개 값) : 월드 원점이 카메라 기준으로 어디에 있는지</li>
<li>OpenCV 는 회전을 숫자 3개짜리 <b>회전 벡터 rvec</b>(방향 = 회전축, 길이 = 회전 각도[라디안])로 주고받습니다. <code>cv.Rodrigues(rvec)</code> 로 3×3 행렬 R 로 바꿀 수 있습니다.</li>
</ul>
<p>비유하면 K 는 “카메라의 눈(렌즈) 성질”, R · t 는 “사진사가 서 있는 위치와 고개 방향”입니다. 같은 카메라라도 사진을 찍을 때마다 R · t 는 달라집니다. 아래 예제에서 트랙바로 사진사를 움직여 보세요.</p>` },
      { type: 'code', title: '예제 3 · 트랙바로 카메라를 움직여 집 모형 투영하기', code: String.raw`
import cv2 as cv
import numpy as np

# 집 모형 (월드 좌표, 단위 m). Y 는 아래쪽이 + 이므로 지붕은 Y 가 음수
house = np.float32([
    [-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 0, 0.5], [-0.5, 0, 0.5],       # 0~3 바닥
    [-0.5, -1, -0.5], [0.5, -1, -0.5], [0.5, -1, 0.5], [-0.5, -1, 0.5],   # 4~7 벽 윗면
    [0, -1.5, -0.5], [0, -1.5, 0.5]])                                      # 8~9 지붕 용마루
edges = [(0, 1), (1, 2), (2, 3), (3, 0), (4, 5), (5, 6), (6, 7), (7, 4),
         (0, 4), (1, 5), (2, 6), (3, 7), (4, 8), (5, 8), (7, 9), (6, 9), (8, 9)]

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('yaw deg', 'result', 30, 360, nothing)      # 집을 좌우로 돌리기
cv.createTrackbar('dist x10', 'result', 40, 150, nothing)     # 거리 (m × 10)
cv.createTrackbar('focal px', 'result', 500, 1200, nothing)   # 초점거리 fx = fy

def process(frame):
    # 입력 소스와 관계없이 흰 캔버스에 그립니다
    yaw = np.radians(cv.getTrackbarPos('yaw deg', 'result'))
    dist = max(cv.getTrackbarPos('dist x10', 'result'), 15) / 10.0
    f = max(cv.getTrackbarPos('focal px', 'result'), 50)

    K = np.array([[f, 0, 320], [0, f, 240], [0, 0, 1]], np.float64)
    rvec = np.array([0.0, yaw, 0.0])            # Y 축(위아래 축) 기준 회전
    tvec = np.array([0.0, 0.6, dist])           # 집을 카메라 앞 dist m, 조금 아래에

    pts, _ = cv.projectPoints(house, rvec, tvec, K, None)
    pts = pts.reshape(-1, 2)

    canvas = np.full((480, 640, 3), 255, np.uint8)
    for i, j in edges:
        p, q = pts[i], pts[j]
        cv.line(canvas, (int(p[0]), int(p[1])), (int(q[0]), int(q[1])), (60, 60, 60), 2, cv.LINE_AA)
    R, _ = cv.Rodrigues(rvec)
    cv.putText(canvas, 'f=%d px  dist=%.1f m  yaw=%d deg' % (f, dist, round(np.degrees(yaw))),
               (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 200), 2)
    cv.putText(canvas, 'R[0] = %s' % np.round(R[0], 2), (10, 470), cv.FONT_HERSHEY_SIMPLEX, 0.5, (120, 120, 120), 1)
    return canvas
`, desc: '<p><b>focal</b> 을 키우면 망원 렌즈처럼 집이 커지고, <b>dist</b> 를 키우면 작아집니다. 그런데 f 를 2배로 하고 dist 도 2배로 하면? 크기는 거의 같지만 원근감(앞면과 뒷면 크기 차이)이 줄어듭니다. 사진가들이 “망원으로 멀리서 찍으면 얼굴이 납작해 보인다”고 하는 이유입니다. <b>yaw</b> 는 외부 파라미터 R 만 바꾸므로 K 는 그대로입니다.</p>' },
      { type: 'text', html: `<h3>5. 렌즈 왜곡: 직선이 휘어 보이는 이유</h3>
<p>진짜 렌즈는 바늘구멍처럼 완벽하지 않아서 <b>직선이 휘어</b> 찍힙니다. 핀홀 모델로 계산한 이상적인 위치 (x, y)(초점거리로 나눈 “정규화 좌표”)가 실제로는 조금 다른 곳에 찍히는데, OpenCV 는 이것을 다섯 개의 숫자 <b>왜곡 계수(distortion coefficients)</b>로 표현합니다.</p>
<pre>  r² = x² + y²   (중심에서 멀수록 큼)
  방사 왜곡:  x' = x · (1 + k1·r² + k2·r⁴ + k3·r⁶)
  접선 왜곡:  x' += 2·p1·x·y + p2·(r² + 2x²)
              y' += p1·(r² + 2y²) + 2·p2·x·y

  dist = (k1, k2, p1, p2, k3)   ← OpenCV 의 순서! k3 가 맨 뒤</pre>
<ul>
<li><b>방사 왜곡(Radial)</b> : 중심에서 멀어질수록 커집니다. <b>k1 &lt; 0 이면 술통형(barrel)</b> — 가장자리가 안으로 말려 직선이 바깥쪽으로 볼록(광각 · 액션캠 · 싼 웹캠). <b>k1 &gt; 0 이면 실패형(pincushion)</b> — 가장자리가 밖으로 늘어나 직선이 안쪽으로 오목(망원 렌즈).</li>
<li><b>접선 왜곡(Tangential)</b> : 렌즈와 센서가 완벽히 평행하게 붙지 않아서 생깁니다. 사진이 한쪽으로 살짝 기운 것처럼 비대칭으로 휩니다. 보통 아주 작은 값입니다.</li>
</ul>` },
      { type: 'code', title: '예제 4 · 왜곡 공식으로 격자 휘게 그리기', code: String.raw`
import cv2 as cv
import numpy as np

def distort(x, y, k1=0.0, k2=0.0, p1=0.0, p2=0.0, k3=0.0):
    """정규화 좌표 (x, y) 에 OpenCV 왜곡 모델을 적용"""
    r2 = x * x + y * y
    radial = 1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3
    xd = x * radial + 2 * p1 * x * y + p2 * (r2 + 2 * x * x)
    yd = y * radial + p1 * (r2 + 2 * y * y) + 2 * p2 * x * y
    return xd, yd

def draw_grid(title, **coef):
    W, H, f = 400, 320, 300.0                     # 패널 크기와 초점거리
    panel = np.full((H, W, 3), 255, np.uint8)
    t = np.linspace(-1, 1, 60)
    for a in np.linspace(-1, 1, 9):
        for x, y in [(a * 0.55 + 0 * t, t * 0.4), (t * 0.55, a * 0.4 + 0 * t)]:   # 세로선, 가로선
            xd, yd = distort(x, y, **coef)
            pts = np.stack([xd * f + W / 2, yd * f + H / 2], axis=1)
            cv.polylines(panel, [np.int32(pts * 16)], False, (200, 80, 0), 1, cv.LINE_AA, shift=4)   # shift=4: 1/16 픽셀 정밀도
    cv.putText(panel, title, (8, 20), cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 200), 1, cv.LINE_AA)
    cv.rectangle(panel, (0, 0), (W - 1, H - 1), (180, 180, 180), 1)
    return panel

top = np.hstack([draw_grid('no distortion'), draw_grid('barrel  k1=-0.25', k1=-0.25)])
bottom = np.hstack([draw_grid('pincushion  k1=+0.25', k1=0.25), draw_grid('tangential  p1=0.04', p1=0.04)])
cv.imshow('distortion types', np.vstack([top, bottom]))
`, desc: '<p>같은 격자에 계수만 바꿔 적용했습니다. 가운데는 거의 그대로이고 <b>가장자리로 갈수록</b> 많이 휩니다(r² 에 비례). k1 의 부호에 따라 볼록 · 오목이 뒤바뀌고, p1 은 위아래가 비대칭으로 휩니다.</p>' },
      { type: 'text', html: `<h3>6. 사진 전체에 왜곡 입혀 보기 (remap)</h3>
<p>사진 전체를 휘게 하려면 <code>cv.remap(img, map_x, map_y, 보간법)</code> 을 씁니다. warpAffine · warpPerspective 가 “행렬 하나”로 픽셀을 옮긴다면, remap 은 <b>픽셀마다 가져올 위치를 표(map)로 직접</b> 정해 주는 더 자유로운 기하 변환입니다. remap 은 “<b>결과 픽셀 (u, v) 의 색을 원본의 (map_x, map_y) 에서 가져와라</b>”라는 뜻이라, 결과(왜곡된 사진)의 픽셀마다 “왜곡되기 전 원래 위치”를 알아야 합니다.
이 계산은 왜곡을 <b>되돌리는</b> 함수 <code>cv.undistortPoints</code> 가 해 줍니다. 반대로 휜 사진을 펴는 보정은 <code>cv.initUndistortRectifyMap</code> 이 map 을 만들어 주는데, a2-4 에서 자세히 다룹니다.</p>` },
      { type: 'code', title: '예제 5 · 트랙바로 building.jpg 에 렌즈 왜곡 입히기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.resize(cv.imread('building.jpg'), (480, 332))
h, w = img.shape[:2]
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)   # 가상의 카메라 (fx = fy = 이미지 폭)

# 결과 이미지의 모든 픽셀 좌표 (N, 1, 2)
ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
grid = np.stack([xs.ravel(), ys.ravel()], axis=1).reshape(-1, 1, 2)

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('k1 x100 (50=0)', 'result', 25, 100, nothing)   # 25 → k1 = -0.25
cv.createTrackbar('p1 x1000 (50=0)', 'result', 50, 100, nothing)

def process(frame):
    k1 = (cv.getTrackbarPos('k1 x100 (50=0)', 'result') - 50) / 100.0
    p1 = (cv.getTrackbarPos('p1 x1000 (50=0)', 'result') - 50) / 1000.0
    dist = np.array([k1, 0.0, p1, 0.0])
    # 왜곡된 사진의 각 픽셀이 "왜곡 전"에 있던 위치 = undistortPoints (P=K 로 픽셀 좌표로 돌려받기)
    src = cv.undistortPoints(grid, K, dist, P=K).reshape(h, w, 2)
    out = cv.remap(img, src[..., 0], src[..., 1], cv.INTER_LINEAR)
    cv.putText(out, 'k1=%+.2f  p1=%+.3f' % (k1, p1), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return out
`, desc: '<p>k1 을 음수로 두면 건물의 곧은 기둥이 바깥으로 볼록한 <b>술통형</b>, 양수로 두면 안으로 오목한 <b>실패형</b>이 됩니다. 술통형에서 네 모서리가 검게 비는 이유는 가장자리가 안쪽으로 말려 들어와 원본 바깥을 가리키기 때문입니다.</p>' },
      { type: 'text', html: `<h3>7. 진짜 렌즈의 왜곡 확인하기</h3>
<p>캘리브레이션 튜토리얼의 체스보드 사진(<code>left12.jpg</code>)은 싼 웹캠 렌즈로 찍어 <b>술통형 왜곡</b>이 눈에 보입니다. 체스보드의 가장자리 코너들은 실제로 한 직선 위에 있지만, 사진에서는 휘어 있을 것입니다.
다음 교시에 배울 <code>cv.findChessboardCorners</code> 로 코너를 미리 찾아, 양 끝 코너를 잇는 “자로 그은 직선”과 비교해 봅시다.</p>` },
      { type: 'code', title: '예제 6 · left12.jpg 에서 체스보드 가장자리가 휜 정도 재기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('left12.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (9, 6))    # 다음 교시 예습: 내부 코너 9×6 찾기
print('코너 검출:', ret)

grid = corners.reshape(6, 9, 2)                           # 6행 × 9열
lines = {'row 0': grid[0], 'row 5': grid[5], 'col 0': grid[:, 0], 'col 8': grid[:, 8]}   # 보드의 바깥쪽 네 줄

view = img.copy()
for name, pts in lines.items():
    a, b = pts[0], pts[-1]                               # 양 끝 코너
    cv.line(view, (int(a[0]), int(a[1])), (int(b[0]), int(b[1])), (0, 0, 255), 1, cv.LINE_AA)   # 자로 그은 직선
    # 각 코너가 직선에서 떨어진 거리 = |외적| / 선분 길이
    ab, ap = b - a, pts - a
    d = np.abs(ab[0] * ap[:, 1] - ab[1] * ap[:, 0]) / np.linalg.norm(ab)
    for p in pts:
        cv.circle(view, (int(p[0]), int(p[1])), 3, (0, 255, 0), -1)
    print(f'{name}: 직선에서 가장 먼 코너 {d.max():.1f} px')

big = cv.resize(view, None, fx=1.5, fy=1.5, interpolation=cv.INTER_LINEAR)
cv.imshow('red = straight line, green = corners', big)
`, desc: '<p>빨간 직선에서 초록 코너들이 몇 픽셀씩 벗어나 있습니다. 특히 사진 <b>가장자리에 가까운 줄</b>일수록 많이 벗어나는데, 이것이 렌즈의 방사 왜곡입니다. 1~2 픽셀도 3D 측정에서는 큰 오차가 되므로, 다음 교시부터 이 왜곡을 <b>측정(캘리브레이션)</b>하고 <b>제거(왜곡 보정)</b>합니다.</p>' },
      { type: 'tip', html: `<p><b>정리 한 줄</b> : 사진 속 위치 = <b>K</b>(카메라 고유) × <b>왜곡</b>(렌즈 고유) × <b>R, t</b>(찍을 때마다 다름) × 3D 점. <code>cv.projectPoints(점, rvec, tvec, K, dist)</code> 가 이 전체 과정을 한 번에 계산합니다.</p>` },
      { type: 'warn', html: `<p><b>자주 하는 실수</b></p>
<ul>
<li>왜곡 계수 순서는 <b>(k1, k2, p1, p2, k3)</b> 입니다. k3 를 세 번째에 넣으면 전혀 다른 결과가 됩니다.</li>
<li><code>cv.projectPoints</code> 의 3D 점은 <b>float32/float64</b> 배열, 모양은 (N, 3) 이어야 합니다. 결과는 (N, 1, 2) 모양이라 <code>reshape(-1, 2)</code> 해서 쓰세요.</li>
<li>OpenCV 카메라 좌표계는 <b>Y 가 아래</b> 방향입니다. 수학 교과서(Y 위)와 반대라 “높이”를 음수로 적어야 할 때가 있습니다.</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · A4 용지는 사진에서 몇 픽셀일까?',
        desc: `<p>초점거리 fx = fy = 800 px, 주점 (320, 240) 인 카메라 앞에 A4 용지(가로 0.297 m, 세로 0.210 m)를 정면으로 세웠습니다. 용지 중심이 광축 위에 있을 때, 거리 <b>Z = 0.5, 1.0, 2.0 m</b> 각각에서</p>
<ul><li>용지의 네 꼭짓점을 <code>cv.projectPoints</code> 로 투영해 흰 캔버스에 사각형으로 그리고</li><li>사진 속 가로 폭(픽셀)을 출력하세요.</li></ul>
<p>시작 코드는 Z = 0.5 m 한 경우만 네 꼭짓점을 잘못(모두 중심에) 만들어 놓았습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[800, 0, 320], [0, 800, 240], [0, 0, 1]], np.float64)
W, H = 0.297, 0.210
canvas = np.full((480, 640, 3), 255, np.uint8)
colors = [(0, 0, 255), (0, 160, 0), (255, 0, 0)]

for Z, color in zip([0.5], colors):            # TODO: [0.5, 1.0, 2.0] 로 바꾸기
    # TODO: 용지 네 꼭짓점 (카메라 좌표, 단위 m). 중심이 (0, 0, Z) 이고 가로 W, 세로 H
    corners3d = np.array([[0, 0, Z], [0, 0, Z], [0, 0, Z], [0, 0, Z]], np.float64)
    pts, _ = cv.projectPoints(corners3d, np.zeros(3), np.zeros(3), K, None)
    pts = pts.reshape(-1, 2)
    width_px = pts[:, 0].max() - pts[:, 0].min()
    print(f'Z={Z} m → 가로 {width_px:.1f} px')
    cv.polylines(canvas, [np.int32(pts)], True, color, 2)

cv.imshow('A4 paper', canvas)
`,
        hint: `<p>꼭짓점은 <code>[[-W/2, -H/2, Z], [W/2, -H/2, Z], [W/2, H/2, Z], [-W/2, H/2, Z]]</code> 입니다(둘레 순서). 가로 폭은 식으로 <code>800 × 0.297 / Z</code> 와 같아야 합니다: 0.5 m → 475.2 px.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

K = np.array([[800, 0, 320], [0, 800, 240], [0, 0, 1]], np.float64)
W, H = 0.297, 0.210
canvas = np.full((480, 640, 3), 255, np.uint8)
colors = [(0, 0, 255), (0, 160, 0), (255, 0, 0)]

for Z, color in zip([0.5, 1.0, 2.0], colors):
    corners3d = np.array([[-W / 2, -H / 2, Z], [W / 2, -H / 2, Z],
                          [W / 2, H / 2, Z], [-W / 2, H / 2, Z]], np.float64)
    pts, _ = cv.projectPoints(corners3d, np.zeros(3), np.zeros(3), K, None)
    pts = pts.reshape(-1, 2)
    width_px = pts[:, 0].max() - pts[:, 0].min()
    print(f'Z={Z} m → 가로 {width_px:.1f} px  (공식 f·W/Z = {800 * W / Z:.1f})')
    cv.polylines(canvas, [np.int32(pts)], True, color, 2)
    cv.putText(canvas, 'Z=%.1f m' % Z, (int(pts[0][0]) + 4, int(pts[0][1]) + 18), cv.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

cv.imshow('A4 paper', canvas)
`,
      },
      {
        title: '실습 2 · 입힌 왜곡을 다시 펴기',
        desc: `<p><code>chessboard.png</code> 를 줄인 사진에 술통형 왜곡(k1 = -0.3)을 입히는 코드가 준비되어 있습니다. <code>cv.initUndistortRectifyMap</code> 으로 보정용 map 을 만들고 <code>cv.remap</code> 으로 <b>왜곡을 제거</b>해 원본 · 왜곡 · 보정 세 장을 나란히 보여 주세요. 보정 결과의 격자선이 다시 곧게 펴지면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.resize(cv.imread('chessboard.png'), (440, 311), interpolation=cv.INTER_AREA)
h, w = img.shape[:2]
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
dist = np.array([-0.3, 0.0, 0.0, 0.0])

# 1) 왜곡 입히기 (예제 5 와 같은 방법)
ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
grid = np.stack([xs.ravel(), ys.ravel()], axis=1).reshape(-1, 1, 2)
src = cv.undistortPoints(grid, K, dist, P=K).reshape(h, w, 2)
distorted = cv.remap(img, src[..., 0], src[..., 1], cv.INTER_LINEAR)

# 2) TODO: 보정 map 만들기
#    map1, map2 = cv.initUndistortRectifyMap(K, dist, None, K, (w, h), cv.CV_32FC1)
#    restored = cv.remap(distorted, map1, map2, cv.INTER_LINEAR)
restored = distorted.copy()

cv.imshow('original | distorted | restored', np.hstack([img, distorted, restored]))
`,
        hint: `<p><code>initUndistortRectifyMap(K, dist, R, newK, (w, h), m1type)</code> 에서 R 은 회전 없음(None), newK 는 원래 K 를 그대로, 크기는 <b>(너비, 높이)</b> 입니다. 가장자리에서 원본 밖으로 나갔던 부분은 되살릴 수 없어서 모서리에 검은 영역이 조금 남습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.resize(cv.imread('chessboard.png'), (440, 311), interpolation=cv.INTER_AREA)
h, w = img.shape[:2]
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
dist = np.array([-0.3, 0.0, 0.0, 0.0])

ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
grid = np.stack([xs.ravel(), ys.ravel()], axis=1).reshape(-1, 1, 2)
src = cv.undistortPoints(grid, K, dist, P=K).reshape(h, w, 2)
distorted = cv.remap(img, src[..., 0], src[..., 1], cv.INTER_LINEAR)

map1, map2 = cv.initUndistortRectifyMap(K, dist, None, K, (w, h), cv.CV_32FC1)
restored = cv.remap(distorted, map1, map2, cv.INTER_LINEAR)

diff = cv.absdiff(img, restored)
print('원본과 보정 결과의 평균 차이:', round(float(diff.mean()), 2))
cv.imshow('original | distorted | restored', np.hstack([img, distorted, restored]))
`,
      },
    ],
    quiz: [
      { q: '핀홀 카메라에서 같은 물체가 카메라로부터 3배 멀어지면 사진 속 크기는?', options: ['3배', '그대로', '1/3', '1/9'], answer: 2, explain: 'y = f·Y/Z 이므로 Z 가 3배면 크기는 1/3 입니다. 넓이는 1/9 이지만 길이는 1/3 입니다.' },
      { q: '카메라 행렬 K 의 cx, cy 가 뜻하는 것은?', options: ['초점거리', '광축이 이미지에 찍히는 주점 위치', '렌즈 왜곡 정도', '카메라의 월드 좌표 위치'], answer: 1, explain: 'cx, cy 는 주점(principal point)으로 보통 이미지 중앙 근처입니다. 카메라 위치는 외부 파라미터(R, t)가 나타냅니다.' },
      { q: '광각 웹캠 사진에서 곧은 문틀이 바깥쪽으로 볼록하게 휘어 보인다. 이 왜곡의 이름과 k1 부호는?', options: ['술통형, k1 < 0', '술통형, k1 > 0', '실패형, k1 < 0', '접선 왜곡, p1 > 0'], answer: 0, explain: '가장자리가 안쪽으로 말려 직선이 바깥으로 볼록해지는 것이 술통형(barrel) 왜곡이고 k1 이 음수입니다.' },
      { q: 'OpenCV 왜곡 계수 배열 dist 의 올바른 순서는?', options: ['(k1, k2, k3, p1, p2)', '(p1, p2, k1, k2, k3)', '(k1, k2, p1, p2, k3)', '(fx, fy, cx, cy, k1)'], answer: 2, explain: 'OpenCV 는 (k1, k2, p1, p2, k3) 순서를 씁니다. k3 가 마지막에 있는 것에 주의하세요.' },
      { q: '같은 카메라로 여러 장을 찍을 때 사진마다 달라지는 것은?', options: ['fx, fy', 'cx, cy', '왜곡 계수', '외부 파라미터 R, t'], answer: 3, explain: '내부 파라미터와 왜곡 계수는 카메라 · 렌즈에 고정된 값이고, 카메라의 위치 · 방향을 나타내는 R, t 는 찍을 때마다 달라집니다.' },
    ],
  },
  // =====================================================================
  // a2-2 체스보드 코너 검출
  // =====================================================================
  {
    id: 'a2-2',
    assets: ['images/adv/left01.jpg', 'images/adv/left02.jpg', 'images/adv/left03.jpg', 'images/adv/left04.jpg', 'images/adv/left05.jpg',
      'images/adv/left06.jpg', 'images/adv/left07.jpg', 'images/adv/left08.jpg', 'images/adv/left09.jpg', 'images/adv/left11.jpg',
      'images/adv/left12.jpg', 'images/adv/left13.jpg', 'images/adv/left14.jpg'],
    summary: '캘리브레이션의 재료인 “3D 위치를 아는 점”을 사진에서 찾습니다. OpenCV 튜토리얼과 같이 체스보드 사진 13장에서 cv.findChessboardCorners 로 내부 코너를 찾고, cv.cornerSubPix 로 서브픽셀 정밀도까지 다듬은 뒤, cv.drawChessboardCorners 로 확인합니다. 검출이 실패하는 사진의 원인도 직접 추적해 봅니다.',
    goals: [
      '캘리브레이션에 체스보드를 쓰는 이유(평면 · 일정한 간격 · 정확한 코너)를 설명할 수 있다',
      '패턴 크기(내부 코너 개수)를 세고 cv.findChessboardCorners 의 반환값(ret, corners)을 해석할 수 있다',
      'cv.cornerSubPix 의 criteria · winSize 의미를 알고 서브픽셀 보정 효과를 확인할 수 있다',
      '여러 장의 사진을 반복 처리해 검출 성공/실패를 정리하고, 실패 원인을 찾아 해결할 수 있다',
    ],
    schedule: [['도입 · 왜 체스보드인가', 5], ['코너 검출과 서브픽셀', 15], ['여러 장 처리 · 실패 원인', 15], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 왜 체스보드일까?</h3>
<p>지난 시간에 사진 속 위치는 <b>K · 왜곡 · R, t</b> 로 정해진다는 것을 배웠습니다. 거꾸로 “<b>3D 위치를 정확히 아는 점</b>”과 “<b>그 점이 사진에 찍힌 위치</b>”를 많이 모으면, 이 값들을 역으로 계산할 수 있습니다. 이 작업이 <b>카메라 캘리브레이션(Camera Calibration)</b>이고, 오늘은 그 재료를 모읍니다.</p>
<p>체스보드는 이 재료로 딱 좋습니다.</p>
<ul>
<li><b>평평하다</b> → 모든 코너의 Z = 0 으로 둘 수 있습니다.</li>
<li><b>칸 간격이 일정하다</b> → 코너의 3D 좌표가 (0,0,0), (1,0,0), (2,0,0) … 처럼 저절로 정해집니다.</li>
<li><b>흑백 칸이 만나는 점</b>은 밝기 변화가 커서 1주차에 배운 코너 검출로 아주 정확하게 찾을 수 있습니다.</li>
<li>패턴이 규칙적이라 <b>코너의 순서</b>(몇 번째 줄 몇 번째 코너인지)까지 자동으로 알 수 있습니다.</li>
</ul>` },
      { type: 'image', src: 'adv/left12.jpg', caption: 'left12.jpg — OpenCV 캘리브레이션 튜토리얼의 체스보드 사진 (640×480, 13장 중 하나)' },
      { type: 'text', html: `<h3>2. 패턴 크기 = 내부 코너 개수</h3>
<p><code>cv.findChessboardCorners(gray, patternSize, flags)</code> 의 <b>patternSize</b> 는 칸의 수가 아니라 <b>안쪽 코너(검은 칸 네 모서리가 만나는 점)의 가로 × 세로 개수</b>입니다. 가로 8칸 체스판이면 내부 코너는 7개입니다(<b>칸 수 − 1</b>).
공식 튜토리얼은 이 사진들에 <code>(7, 6)</code> 패턴을 사용하므로 우리도 그대로 따라 해 봅니다.</p>
<ul>
<li>반환값 <b>ret</b> : 패턴 전체를 찾았으면 True</li>
<li>반환값 <b>corners</b> : 찾은 코너 좌표, 모양 <b>(코너 수, 1, 2)</b>, float32. 패턴의 줄(가로 개수만큼) 단위로 순서대로 들어 있습니다.</li>
<li>입력은 <b>흑백 이미지</b>를 권장합니다.</li>
</ul>` },
      { type: 'code', title: '예제 1 · 한 장에서 체스보드 코너 찾기 (튜토리얼 패턴 7×6)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('left12.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
print('찾았나?', ret)
print('corners 모양:', corners.shape, corners.dtype)      # (42, 1, 2) float32
print('첫 코너 3개:\n', corners[:3].reshape(-1, 2))

# 찾은 코너를 무지개색 선으로 연결해 그리기 (ret 을 그대로 넘기면 찾은 경우 선까지 그림)
cv.drawChessboardCorners(img, (7, 6), corners, ret)
cv.imshow('7x6 corners', img)
`, desc: '<p>42개(= 7 × 6) 코너가 <b>패턴의 한 줄(7개)마다 같은 색</b>으로 연결되어 그려집니다. 첫 줄은 빨간색이고, 줄의 끝에서 다음 줄의 처음으로 대각선이 이어집니다. 보드가 세로로 서 있어서 “줄”이 사진에서는 세로 방향으로 보입니다. 체스판은 더 크지만 7×6 크기의 영역만 찾았다는 점도 눈여겨보세요. 뒤에서 이 점이 중요해집니다.</p>' },
      { type: 'text', html: `<h3>3. cornerSubPix: 픽셀보다 더 정확하게</h3>
<p><code>findChessboardCorners</code> 가 준 좌표는 대략적인 위치입니다. 1주차 a1-2 에서 배운 <code>cv.cornerSubPix</code> 로 코너 주변의 밝기 기울기를 이용해 <b>0.1 픽셀 이하</b>까지 위치를 다듬습니다. 캘리브레이션은 이 정밀도에 크게 좌우됩니다.</p>
<pre>criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)</pre>
<ul>
<li><b>winSize (11, 11)</b> : 코너 주변 탐색 창의 “반” 크기 → 실제 창은 23×23. 칸 크기보다 작아야 옆 코너와 섞이지 않습니다.</li>
<li><b>zeroZone (-1, -1)</b> : 창 가운데를 빼고 계산할 영역. (-1, -1) = 사용 안 함.</li>
<li><b>criteria</b> : “최대 30번 반복하거나, 움직임이 0.001 픽셀보다 작아지면 멈춤”. 반복 계산을 멈추는 조건입니다.</li>
</ul>` },
      { type: 'code', title: '예제 2 · 서브픽셀 보정 전후 비교 (코너 하나 확대)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('left12.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
corners2 = cv.cornerSubPix(gray, corners.copy(), (11, 11), (-1, -1), criteria)   # copy: 원본 corners 보존

move = np.linalg.norm((corners2 - corners).reshape(-1, 2), axis=1)
print('보정으로 움직인 거리(px): 평균 %.2f, 최대 %.2f' % (move.mean(), move.max()))

# 코너 0 주변 20×20 을 16배 확대해 두 위치를 비교
S = 16
x0, y0 = corners[0, 0]
cx, cy = int(x0) - 10, int(y0) - 10
patch = cv.resize(img[cy:cy + 20, cx:cx + 20], None, fx=S, fy=S, interpolation=cv.INTER_NEAREST)
for pt, color in [(corners[0, 0], (0, 0, 255)), (corners2[0, 0], (0, 255, 0))]:
    px, py = (pt[0] - cx) * S + S / 2, (pt[1] - cy) * S + S / 2      # 픽셀 중심 기준으로 확대 좌표 변환
    cv.drawMarker(patch, (int(px), int(py)), color, cv.MARKER_CROSS, 40, 2)
print('red = findChessboardCorners', corners[0, 0], '/ green = cornerSubPix', corners2[0, 0])
cv.imshow('corner 0 zoom x16', patch)
`, desc: '<p>확대한 픽셀 격자에서 <b>초록 십자(서브픽셀)</b>가 흑백 칸이 만나는 지점에 더 정확히 놓입니다. 움직인 거리는 1픽셀도 안 되지만, 수십 장 × 수십 개 코너를 쓰는 캘리브레이션에서는 이 차이가 결과 정확도를 좌우합니다.</p>' },
      { type: 'warn', html: `<p><b>corners 가 제자리에서 바뀝니다</b> : <code>cv.cornerSubPix</code> 는 입력 배열 <code>corners</code> 를 직접 수정하고 같은 배열을 돌려줍니다. 보정 전 값과 비교하려면 예제처럼 <code>corners.copy()</code> 를 넘기세요. 튜토리얼처럼 보정 결과만 쓸 때는 신경 쓰지 않아도 됩니다.</p>` },
      { type: 'text', html: `<h3>4. 여러 장 반복 처리하기 (튜토리얼 흐름)</h3>
<p>캘리브레이션에는 <b>여러 각도에서 찍은 사진 10장 이상</b>이 필요합니다. 튜토리얼은 <code>glob.glob('*.jpg')</code> 로 파일 목록을 얻어 반복합니다. 웹 실습의 가상 폴더에는 다른 이미지도 있으므로 <code>'left[0-9]*.jpg'</code> 패턴(“left 다음에 숫자”)으로 13장만 고릅니다.</p>
<p>13장 모두 검출하는 데 브라우저에서 <b>약 3초</b> 걸리니 결과가 나올 때까지 기다려 주세요.</p>` },
      { type: 'code', title: '예제 3 · 13장에서 코너 찾고 결과 모아 보기', code: String.raw`
import cv2 as cv
import numpy as np
import glob

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
images = sorted(glob.glob('left[0-9]*.jpg'))
print('이미지', len(images), '장:', images)

thumbs = []
found = []
for fname in images:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    if ret:
        corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        cv.drawChessboardCorners(img, (7, 6), corners2, ret)
        found.append(fname)
    thumb = cv.resize(img, (240, 180))
    label, color = ('OK', (0, 200, 0)) if ret else ('FAIL', (0, 0, 255))
    cv.rectangle(thumb, (0, 0), (239, 179), color, 4)
    cv.rectangle(thumb, (4, 4), (180, 30), (0, 0, 0), -1)          # 글자 배경
    cv.putText(thumb, fname + ' ' + label, (8, 23), cv.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)
    thumbs.append(thumb)

print('검출 성공 %d / %d 장:' % (len(found), len(images)), found)

# 4열 갤러리 만들기 (빈칸은 검은 이미지로 채움)
while len(thumbs) % 4:
    thumbs.append(np.zeros_like(thumbs[0]))
rows = [np.hstack(thumbs[i:i + 4]) for i in range(0, len(thumbs), 4)]
cv.imshow('gallery', np.vstack(rows))
`, desc: '<p>튜토리얼 패턴 (7, 6) 으로는 13장 중 <b>9장만</b> 검출됩니다. 실패한 사진(left04, 05, 09, 11)을 성공한 사진과 비교해 보세요. 보드가 잘렸나요? 흐린가요? 다음 절에서 진짜 원인을 찾아봅니다.</p>' },
      { type: 'text', html: `<h3>5. 실패 원인 추적: 코너를 직접 세어 보자</h3>
<p>갤러리를 확대해서 체스판의 <b>칸 수</b>를 세어 보세요. 가로 10칸 × 세로 7칸, 즉 <b>내부 코너는 9 × 6</b> 입니다. 튜토리얼은 보드 일부인 7×6 영역만 찾도록 했기 때문에, 알고리즘이 “보드 안에 7×6 이 여러 위치로 들어갈 수 있는” 상황에서 헷갈려 실패하는 사진이 생깁니다. 실패한 사진은 전부 찾을 때까지 오래 헤매므로 <b>시간도 더 걸립니다</b>.</p>
<p><b>교훈</b> : patternSize 는 <b>보드 전체의 내부 코너 수와 정확히 맞춰야</b> 합니다. 그래야 검출이 빠르고 안정적입니다.</p>` },
      { type: 'code', title: '예제 4 · 올바른 패턴 (9, 6) 으로 다시 찾기 + 시간 비교', code: String.raw`
import cv2 as cv
import glob
import time

images = sorted(glob.glob('left[0-9]*.jpg'))
fails_76 = ['left04.jpg', 'left05.jpg', 'left09.jpg', 'left11.jpg']   # 예제 3 에서 실패한 사진

t = time.time()
for fname in fails_76:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, _ = cv.findChessboardCorners(gray, (7, 6), None)
print('(7, 6) 실패 사진 4장: %.2f 초' % (time.time() - t))

t = time.time()
ok = 0
for fname in images:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (9, 6), None)
    ok += int(ret)
    print(f'{fname}: {ret}  코너 {0 if corners is None else len(corners)}개')
print('(9, 6) 13장 전체: %d장 성공, %.2f 초' % (ok, time.time() - t))

img = cv.imread('left04.jpg')
ret, corners = cv.findChessboardCorners(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (9, 6), None)
cv.drawChessboardCorners(img, (9, 6), corners, ret)
cv.imshow('left04 with (9, 6)', img)
`, desc: '<p>(9, 6) 으로 바꾸자 <b>13장 모두</b> 검출되고, 실패하던 4장을 (7, 6) 으로 찾는 시간보다 13장 전체를 (9, 6) 으로 찾는 시간이 더 짧습니다. 그래도 다음 교시의 캘리브레이션은 먼저 <b>튜토리얼 그대로 (7, 6)</b> 으로 해 보고, 두 결과를 비교해 봅니다.</p>' },
      { type: 'table', head: ['flags', '효과', '언제'], rows: [
        ['<code>cv.CALIB_CB_ADAPTIVE_THRESH</code>', '적응형 이진화로 흑백 칸 분리 (기본 켜짐)', '조명이 고르지 않을 때'],
        ['<code>cv.CALIB_CB_NORMALIZE_IMAGE</code>', '이진화 전에 히스토그램 평활화 (기본 켜짐)', '어둡거나 대비가 낮을 때'],
        ['<code>cv.CALIB_CB_FAST_CHECK</code>', '보드가 없어 보이면 빨리 포기', '<b>웹캠 · 동영상</b> 실시간 처리'],
        ['<code>cv.findChessboardCornersSB()</code>', '더 강인한 다른 알고리즘 (보정 없이도 정밀)', '흐리거나 잡음이 많을 때 (대신 느릴 수 있음)'],
      ] },
      { type: 'text', html: `<h3>6. 실시간으로 체스보드 찾기</h3>
<p>내 카메라를 캘리브레이션하려면 체스보드를 <b>인쇄</b>(또는 태블릿 화면에 띄워)해서 여러 각도로 찍어야 합니다. 찍기 전에 “지금 보드가 검출되는지” 실시간으로 확인하면 편리합니다.
오른쪽 패널에서 입력 소스를 <b>📷 웹캠</b>으로 바꾸고 체스보드를 비춰 보세요. 웹캠이 없으면 입력 목록에서 <code>left01.jpg</code> 등을 골라도 됩니다(🎞️ 동영상에는 체스보드가 없어 FAIL 만 나옵니다).</p>` },
      { type: 'code', title: '예제 5 · 웹캠/이미지에서 실시간 체스보드 검출', code: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('cols', 'result', 9, 12, nothing)     # 내부 코너 가로 개수
cv.createTrackbar('rows', 'result', 6, 12, nothing)     # 내부 코너 세로 개수

def process(frame):
    cols = max(cv.getTrackbarPos('cols', 'result'), 3)
    rows = max(cv.getTrackbarPos('rows', 'result'), 3)
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    flags = cv.CALIB_CB_ADAPTIVE_THRESH + cv.CALIB_CB_NORMALIZE_IMAGE + cv.CALIB_CB_FAST_CHECK
    ret, corners = cv.findChessboardCorners(gray, (cols, rows), flags)
    out = frame.copy()
    if ret:
        cv.drawChessboardCorners(out, (cols, rows), corners, ret)
    msg = 'FOUND %dx%d' % (cols, rows) if ret else 'searching %dx%d ...' % (cols, rows)
    cv.putText(out, msg, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0) if ret else (0, 0, 255), 2)
    return out
`, desc: '<p>입력을 <code>left04.jpg</code> 로 고르고 cols 를 7 ↔ 9 로 바꿔 보세요. 9×6 에서는 바로 FOUND, 7×6 에서는 실패합니다. <code>FAST_CHECK</code> 덕분에 보드가 없는 프레임은 금방 넘어갑니다.</p>' },
      { type: 'tip', html: `<p><b>내 카메라용 체스보드 준비 요령</b> : OpenCV 문서의 pattern.png(9×6 내부 코너)를 A4 에 인쇄해 <b>딱딱한 판에 평평하게</b> 붙이세요. 휘어진 종이는 “평면” 가정을 깨뜨려 결과가 나빠집니다. 보드 둘레에 흰 여백이 있어야 검출이 잘 됩니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 보드가 가장 크게 찍힌 사진 찾기',
        desc: `<p>13장 모두에서 <b>(9, 6)</b> 패턴으로 코너를 찾고, 이웃한 코너 사이의 <b>평균 간격(픽셀)</b>을 계산해 출력하세요. 간격이 클수록 보드가 카메라에 가깝거나 크게 찍힌 사진입니다. 간격이 가장 큰 사진의 이름을 출력하고 그 사진을 코너와 함께 보여 주세요.</p>
<p>시작 코드는 반복문과 출력은 되어 있고, 간격 계산이 0 으로 비어 있습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import glob

best_name, best_gap = None, 0
for fname in sorted(glob.glob('left[0-9]*.jpg')):
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (9, 6), None)
    if not ret:
        continue
    grid = corners.reshape(6, 9, 2)          # 6줄 × 9개
    # TODO: 같은 줄에서 옆 코너끼리의 거리 평균을 gap 에 넣기
    #       힌트: np.diff(grid, axis=1) → (6, 8, 2) 차이 벡터, np.linalg.norm(..., axis=2)
    gap = 0.0
    print(f'{fname}: 평균 간격 {gap:.1f} px')
    if gap > best_gap:
        best_name, best_gap = fname, gap

print('가장 크게 찍힌 사진:', best_name)
if best_name:
    img = cv.imread(best_name)
    ret, corners = cv.findChessboardCorners(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (9, 6), None)
    cv.drawChessboardCorners(img, (9, 6), corners, ret)
    cv.imshow('biggest board', img)
`,
        hint: `<p><code>d = np.diff(grid, axis=1)</code> 는 같은 줄의 (다음 코너 − 이전 코너) 벡터 48개입니다. <code>gap = np.linalg.norm(d, axis=2).mean()</code>. 세로 방향 간격까지 넣으려면 <code>np.diff(grid, axis=0)</code> 도 같이 평균 내세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import glob

best_name, best_gap = None, 0
for fname in sorted(glob.glob('left[0-9]*.jpg')):
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (9, 6), None)
    if not ret:
        continue
    grid = corners.reshape(6, 9, 2)
    gx = np.linalg.norm(np.diff(grid, axis=1), axis=2)     # 가로 방향 이웃 간격 (6×8)
    gy = np.linalg.norm(np.diff(grid, axis=0), axis=2)     # 세로 방향 이웃 간격 (5×9)
    gap = (gx.sum() + gy.sum()) / (gx.size + gy.size)
    print(f'{fname}: 평균 간격 {gap:.1f} px')
    if gap > best_gap:
        best_name, best_gap = fname, gap

print('가장 크게 찍힌 사진:', best_name, '(%.1f px)' % best_gap)
img = cv.imread(best_name)
ret, corners = cv.findChessboardCorners(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (9, 6), None)
cv.drawChessboardCorners(img, (9, 6), corners, ret)
cv.imshow('biggest board', img)
`,
      },
      {
        title: '실습 2 · 코너 번호(원점)는 어디서 시작할까?',
        desc: `<p>캘리브레이션에서 코너 번호 i 는 3D 좌표와 짝지어지므로 <b>코너 0 이 어디인지</b>가 중요합니다. <code>left01.jpg</code>, <code>left07.jpg</code>, <code>left12.jpg</code> 세 장에서 (9, 6) 코너를 찾고, <b>네 모서리 코너(번호 0, 8, 45, 53)</b>에 번호를 적어 나란히 보여 주세요.</p>
<p>시작 코드는 코너 0 만 표시합니다. 결과를 보고 “코너 0 은 사진마다 보드의 같은 모서리인가?”를 확인하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

views = []
for fname in ['left01.jpg', 'left07.jpg', 'left12.jpg']:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (9, 6), None)
    pts = corners.reshape(-1, 2)
    for i in [0]:                        # TODO: [0, 8, 45, 53] 로 바꾸기
        x, y = int(pts[i][0]), int(pts[i][1])
        cv.circle(img, (x, y), 8, (0, 0, 255), -1)
        cv.putText(img, str(i), (x + 8, y - 8), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    cv.putText(img, fname, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
    views.append(cv.resize(img, (320, 240)))

cv.imshow('corner order', np.hstack(views))
`,
        hint: `<p>반복 목록만 <code>[0, 8, 45, 53]</code> 으로 바꾸면 됩니다. 0 → 8 은 첫 줄의 끝, 45 → 53 은 마지막 줄입니다. 번호마다 색을 다르게 하면 더 잘 보입니다.</p><p><b>관찰 포인트</b> : 코너 0 이 사진마다 보드의 <b>다른 모서리</b>에 붙을 수 있습니다. 캘리브레이션은 사진마다 R, t 를 따로 구하므로 문제없지만, a2-5 자세 추정에서 그리는 좌표축의 방향은 사진마다 달라집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

views = []
colors = {0: (0, 0, 255), 8: (0, 160, 0), 45: (255, 0, 0), 53: (0, 160, 255)}
for fname in ['left01.jpg', 'left07.jpg', 'left12.jpg']:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (9, 6), None)
    pts = corners.reshape(-1, 2)
    for i, c in colors.items():
        x, y = int(pts[i][0]), int(pts[i][1])
        cv.circle(img, (x, y), 9, c, -1)
        cv.putText(img, str(i), (x + 10, y - 10), cv.FONT_HERSHEY_SIMPLEX, 1.2, c, 3)
    cv.putText(img, fname, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 255), 2)
    views.append(cv.resize(img, (320, 240)))
    print(fname, '코너 0 위치:', pts[0].round(1))

cv.imshow('corner order', np.hstack(views))
`,
      },
    ],
    quiz: [
      { q: '가로 10칸 × 세로 7칸짜리 체스판의 patternSize 로 알맞은 것은?', options: ['(10, 7)', '(9, 6)', '(11, 8)', '(5, 3)'], answer: 1, explain: 'patternSize 는 내부 코너 개수이므로 칸 수에서 1씩 뺀 (9, 6) 입니다.' },
      { q: 'cv.findChessboardCorners 가 돌려준 corners 배열의 모양은? (패턴 7×6)', options: ['(7, 6)', '(42, 2)', '(42, 1, 2)', '(6, 7, 2)'], answer: 2, explain: 'OpenCV 점 배열 형식인 (N, 1, 2) 로, N = 7 × 6 = 42 입니다. 필요하면 reshape(-1, 2) 나 reshape(6, 7, 2) 로 바꿔 씁니다.' },
      { q: 'cornerSubPix 의 criteria = (EPS + MAX_ITER, 30, 0.001) 의 뜻은?', options: ['30픽셀 창에서 0.001초 동안 계산', '최대 30회 반복하거나 이동량이 0.001 미만이면 중단', '코너 30개 중 상위 0.1% 만 사용', '30도 이상 기울어진 코너는 무시'], answer: 1, explain: '반복 계산의 종료 조건입니다. 반복 횟수 30 에 도달하거나, 한 번의 이동이 0.001 픽셀보다 작아지면 멈춥니다.' },
      { q: '튜토리얼 사진에서 (7, 6) 으로는 4장이 실패하고 (9, 6) 으로는 13장 모두 성공한 가장 큰 이유는?', options: ['사진이 흐려서', '실제 보드의 내부 코너가 9×6 이라 7×6 은 위치가 모호해서', '(9, 6) 이 cornerSubPix 를 자동으로 해서', '(7, 6) 은 컬러 이미지에서만 동작해서'], answer: 1, explain: '패턴 크기는 보드 전체와 정확히 맞춰야 합니다. 일부 영역만 찾게 하면 후보 위치가 여러 개라 검출이 불안정하고 느려집니다.' },
    ],
  },
  // =====================================================================
  // a2-3 카메라 캘리브레이션
  // =====================================================================
  {
    id: 'a2-3',
    assets: ['images/adv/left01.jpg', 'images/adv/left02.jpg', 'images/adv/left03.jpg', 'images/adv/left04.jpg', 'images/adv/left05.jpg',
      'images/adv/left06.jpg', 'images/adv/left07.jpg', 'images/adv/left08.jpg', 'images/adv/left09.jpg', 'images/adv/left11.jpg',
      'images/adv/left12.jpg', 'images/adv/left13.jpg', 'images/adv/left14.jpg'],
    summary: '체스보드 코너의 3D 좌표(objpoints)와 사진 속 2D 좌표(imgpoints)를 모아 cv.calibrateCamera 로 카메라 행렬과 왜곡 계수를 구합니다. 재투영 오차로 결과를 평가하고, 왜곡을 무시하거나 사진 수를 줄이면 결과가 어떻게 달라지는지 실험한 뒤 np.savez 로 결과를 저장합니다.',
    goals: [
      'np.mgrid 로 체스보드 코너의 3D 좌표(objp)를 만들고 imgpoints 와 짝지을 수 있다',
      'cv.calibrateCamera 의 입력과 반환값(ret, mtx, dist, rvecs, tvecs)을 설명할 수 있다',
      'cv.projectPoints 로 재투영 오차를 계산하고 캘리브레이션 품질을 판단할 수 있다',
      '좋은 캘리브레이션을 위한 사진 수 · 각도 조건을 말하고, 결과를 np.savez / np.load 로 저장 · 재사용할 수 있다',
    ],
    schedule: [['도입 · 지난 시간 복습', 5], ['objpoints · calibrateCamera', 15], ['재투영 오차 · 품질 실험', 15], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 캘리브레이션 = 거꾸로 푸는 투영</h3>
<p>a2-1 의 투영은 “<b>3D 점 + K + 왜곡 + R, t → 사진 속 위치</b>”였습니다. 캘리브레이션은 이것을 거꾸로 풉니다.</p>
<pre>  알고 있는 것 : 3D 점 (체스보드 코너)   +   사진 속 위치 (a2-2 에서 찾은 코너)   × 여러 장
  구하는 것   : K (fx, fy, cx, cy)  +  왜곡 (k1, k2, p1, p2, k3)  +  사진마다 R, t</pre>
<p>비유하자면, 눈금이 정확한 자를 여러 방향에서 찍어 놓고 “이 사진들이 이렇게 찍히려면 카메라의 렌즈가 어떤 성질이어야 할까?”를 추리하는 것입니다. OpenCV 는 모든 사진에서 <b>계산한 위치와 실제 찾은 코너 위치의 차이가 가장 작아지도록</b> 값을 반복해서 조정합니다.</p>` },
      { type: 'text', html: `<h3>2. objpoints: 코너의 3D 좌표 만들기</h3>
<p>체스보드 위에 좌표계를 붙입니다. 코너 0 을 원점, 보드 면을 Z = 0 으로 두면 코너 좌표는 <b>(0,0,0), (1,0,0), (2,0,0), …, (6,5,0)</b> 입니다. 단위는 “칸”입니다. 실제 칸 크기가 25 mm 라면 25 를 곱해 mm 단위로 만들 수 있습니다(K 와 왜곡은 단위와 무관하고, t 만 그 단위를 따릅니다).</p>
<p>튜토리얼은 이 좌표를 <code>np.mgrid</code> 로 한 번에 만듭니다. 모든 사진에서 3D 좌표는 같으므로, 코너를 찾은 사진마다 <b>같은 objp 를 objpoints 에</b>, 찾은 코너를 <b>imgpoints 에</b> 하나씩 추가합니다.</p>` },
      { type: 'code', title: '예제 1 · np.mgrid 로 objp 만들기', code: String.raw`
import numpy as np

objp = np.zeros((6 * 7, 3), np.float32)                 # 42개 코너 × (x, y, z)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)        # x: 0~6, y: 0~5 격자 (z 는 0 그대로)

print('objp 모양:', objp.shape)
print('앞의 9개:\n', objp[:9])
print('마지막:', objp[-1])

# np.mgrid 가 하는 일을 작게 보기 (3 × 2 격자)
g = np.mgrid[0:3, 0:2]
print('mgrid 결과 모양', g.shape)
print('격자 좌표:\n', g.T.reshape(-1, 2))

# 칸 한 변이 25 mm 인 보드라면
objp_mm = objp * 25.0
print('mm 단위 코너 8번:', objp_mm[8])
`, desc: '<p>x 가 0 → 6 으로 한 줄을 채운 뒤 y 가 1 증가합니다. 이 순서가 <code>findChessboardCorners</code> 가 돌려주는 코너 순서(한 줄씩)와 같아서 i 번째 3D 점과 i 번째 코너가 짝이 됩니다.</p>' },
      { type: 'text', html: `<h3>3. cv.calibrateCamera</h3>
<pre>ret, mtx, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, gray.shape[::-1], None, None)</pre>
<p>세 번째 인자는 이미지 크기 <b>(너비, 높이)</b> 입니다. <code>gray.shape</code> 는 (높이, 너비) 라서 <code>[::-1]</code> 로 뒤집습니다. 마지막 두 None 은 “K 와 왜곡의 초깃값 없음”이라는 뜻입니다.
아래 예제는 공식 튜토리얼 코드 흐름 그대로입니다(검출에 브라우저에서 약 3초).</p>` },
      { type: 'code', title: '예제 2 · 튜토리얼 캘리브레이션 전체 흐름', code: String.raw`
import cv2 as cv
import numpy as np
import glob

# 종료 조건
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

# (0,0,0), (1,0,0), ..., (6,5,0) 같은 3D 좌표 준비
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

objpoints = []   # 실제 세계의 3D 점
imgpoints = []   # 이미지 평면의 2D 점

images = sorted(glob.glob('left[0-9]*.jpg'))
for fname in images:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    if ret:
        objpoints.append(objp)
        corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        imgpoints.append(corners2)

print('사용한 사진: %d / %d 장' % (len(imgpoints), len(images)))
ret, mtx, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, gray.shape[::-1], None, None)

np.set_printoptions(precision=4, suppress=True)
print('RMS 재투영 오차 ret =', round(ret, 4), 'px')
print('카메라 행렬 mtx =\n', mtx)
print('왜곡 계수 dist (k1, k2, p1, p2, k3) =\n', dist)
print('rvecs', len(rvecs), '개, 첫 사진 rvec =', rvecs[0].ravel(), ' tvec =', tvecs[0].ravel())

np.savez('calib.npz', mtx=mtx, dist=dist)       # 가상 폴더에 저장 → 다음 예제 · 교시에서 np.load
print('calib.npz 저장 완료')
`, desc: '<p>9장으로 구한 결과는 대략 <b>fx ≈ fy ≈ 534</b>, <b>cx ≈ 342, cy ≈ 232</b>, <b>k1 ≈ −0.29</b> 입니다(OpenCV 버전에 따라 소수점 아래가 조금 다를 수 있음). k1 이 음수 → a2-1 에서 본 <b>술통형 왜곡</b>과 일치합니다! RMS 오차는 약 0.16 픽셀로 매우 좋은 편입니다.</p>' },
      { type: 'table', head: ['반환값', '모양', '의미'], rows: [
        ['<code>ret</code>', '실수 1개', '전체 코너의 <b>RMS 재투영 오차</b>(픽셀). 보통 1 이하, 0.5 이하면 좋음'],
        ['<code>mtx</code>', '3 × 3', '카메라 행렬 K (fx, fy, cx, cy)'],
        ['<code>dist</code>', '1 × 5', '왜곡 계수 (k1, k2, p1, p2, k3)'],
        ['<code>rvecs</code>', '사진 수 × (3, 1)', '사진마다 보드의 회전 벡터 (Rodrigues)'],
        ['<code>tvecs</code>', '사진 수 × (3, 1)', '사진마다 보드 원점의 위치 (단위: objp 단위 = 칸)'],
      ] },
      { type: 'text', html: `<h3>4. 재투영 오차: 결과를 채점하는 방법</h3>
<p>구한 K, 왜곡, R, t 로 체스보드 3D 점을 <b>다시 사진에 투영</b>(<code>cv.projectPoints</code>)해 보고, 실제 찾은 코너와 얼마나 떨어져 있는지 잽니다. 이것이 <b>재투영 오차(Re-projection Error)</b>입니다. 0 에 가까울수록 모델이 사진을 잘 설명한다는 뜻입니다.</p>
<p>튜토리얼은 사진마다 <code>cv.norm(imgpoints[i], imgpoints2, cv.NORM_L2) / len(imgpoints2)</code> 를 구해 평균을 “total error”로 출력합니다. 이 값은 RMS 와 계산 방식이 달라 더 작게 나오므로, <b>사진끼리 비교하는 용도</b>로 쓰고 절대 품질은 <code>ret</code>(RMS)로 판단하세요.</p>
<p>이번부터는 시간을 아끼기 위해 예제 2 에서 <b>검출에 성공한 9장만</b> 이름으로 골라 씁니다(결과는 같음).</p>` },
      { type: 'code', title: '예제 3 · 사진별 재투영 오차 (튜토리얼 방식 + 막대그래프)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
names = ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left07.jpg',
         'left08.jpg', 'left12.jpg', 'left13.jpg', 'left14.jpg']       # (7, 6) 검출 성공 9장

objpoints, imgpoints = [], []
for fname in names:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    if ret:
        objpoints.append(objp)
        imgpoints.append(cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria))

ret, mtx, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, gray.shape[::-1], None, None)

mean_error = 0
errors = []
for i in range(len(objpoints)):
    imgpoints2, _ = cv.projectPoints(objpoints[i], rvecs[i], tvecs[i], mtx, dist)
    error = cv.norm(imgpoints[i], imgpoints2, cv.NORM_L2) / len(imgpoints2)   # 튜토리얼 식
    errors.append(error)
    mean_error += error
print('total error: {}'.format(mean_error / len(objpoints)))
print('RMS (ret): %.4f px' % ret)

plt.figure(figsize=(8, 3.5))
plt.bar([n.replace('.jpg', '') for n in names], errors, color='tab:blue')
plt.axhline(np.mean(errors), color='r', linestyle='--', label='mean')
plt.ylabel('re-projection error')
plt.title('Per-image re-projection error')
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()
plt.show()
`, desc: '<p>막대가 유난히 높은 사진이 있다면 코너가 잘못 잡혔거나 흔들린 사진일 수 있습니다. 여기서는 모든 사진이 비슷하게 낮아 고른 품질의 데이터라는 것을 알 수 있습니다.</p>' },
      { type: 'text', html: `<h3>5. 실험 ① 렌즈 왜곡을 무시하면?</h3>
<p><code>calibrateCamera</code> 에 flags 를 주면 일부 값을 0 으로 고정할 수 있습니다. <code>CALIB_FIX_K1 | CALIB_FIX_K2 | CALIB_FIX_K3 | CALIB_ZERO_TANGENT_DIST</code> 를 주면 “왜곡이 전혀 없는 핀홀 카메라”로 가정하고 K 만 구합니다. 이때 재투영 오차가 어떻게 변하는지, 사진의 어느 부분에서 오차가 큰지 화살표로 확인해 봅시다.</p>` },
      { type: 'code', title: '예제 4 · 왜곡 모델 유무에 따른 재투영 오차 비교 (화살표 20배 확대)', code: String.raw`
import cv2 as cv
import numpy as np

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
names = ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left07.jpg',
         'left08.jpg', 'left12.jpg', 'left13.jpg', 'left14.jpg']
objpoints, imgpoints = [], []
for fname in names:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    objpoints.append(objp)
    imgpoints.append(cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria))
size = gray.shape[::-1]

no_dist = cv.CALIB_FIX_K1 | cv.CALIB_FIX_K2 | cv.CALIB_FIX_K3 | cv.CALIB_ZERO_TANGENT_DIST
results = {'with distortion': cv.calibrateCamera(objpoints, imgpoints, size, None, None),
           'no distortion': cv.calibrateCamera(objpoints, imgpoints, size, None, None, flags=no_dist)}

k = names.index('left12.jpg')
views = []
for title, (ret, mtx, dist, rvecs, tvecs) in results.items():
    print('%-16s RMS = %.3f px   fx = %.1f   dist = %s' % (title, ret, mtx[0, 0], np.round(dist.ravel(), 3)))
    proj, _ = cv.projectPoints(objpoints[k], rvecs[k], tvecs[k], mtx, dist)
    view = cv.imread('left12.jpg')
    for p, q in zip(imgpoints[k].reshape(-1, 2), proj.reshape(-1, 2)):
        tip = p + (q - p) * 20                                   # 오차를 20배로 과장해서 화살표로
        cv.arrowedLine(view, (int(p[0]), int(p[1])), (int(tip[0]), int(tip[1])), (0, 0, 255), 2, tipLength=0.3)
        cv.circle(view, (int(p[0]), int(p[1])), 2, (0, 255, 0), -1)
    cv.putText(view, '%s  RMS=%.2f' % (title, ret), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
    views.append(view)

cv.imshow('re-projection error x20', np.hstack(views))
`, desc: '<p>왜곡을 무시하면 RMS 가 약 0.16 → <b>1.1 픽셀</b>로 7배 커지고, 화살표가 <b>보드의 바깥쪽 코너(사진 가장자리에 가까운 곳)에서 크게</b> 나타납니다. 핀홀 모델만으로는 술통형 왜곡을 설명할 수 없기 때문입니다. fx 값도 534 에서 크게 달라져, 왜곡 모델이 K 추정에도 중요하다는 것을 알 수 있습니다.</p>' },
      { type: 'text', html: `<h3>6. 실험 ② 사진이 적으면?</h3>
<p>미지수(fx, fy, cx, cy, 왜곡 5개, 사진마다 R · t 6개)에 비해 사진이 너무 적으면, 오차는 작아도 <b>엉뚱한 답</b>이 나올 수 있습니다. 시험 문제 1~2개만 보고 공식을 외운 학생이 그 문제는 맞히지만 새 문제는 틀리는 것과 같습니다(과적합).</p>` },
      { type: 'code', title: '예제 5 · 사진 수(1, 2, 4, 9장)에 따른 결과 변화', code: String.raw`
import cv2 as cv
import numpy as np

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
order = ['left01.jpg', 'left07.jpg', 'left03.jpg', 'left12.jpg', 'left02.jpg',
         'left06.jpg', 'left08.jpg', 'left13.jpg', 'left14.jpg']
imgpoints = []
for fname in order:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    imgpoints.append(cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria))

print(' 장수 |  RMS   |   fx    |   cx    |   cy    |   k1')
for n in [1, 2, 4, 9]:
    ret, mtx, dist, _, _ = cv.calibrateCamera([objp] * n, imgpoints[:n], (640, 480), None, None)
    print(f'{n:4d}  | {ret:.3f}  | {mtx[0, 0]:7.1f} | {mtx[0, 2]:7.1f} | {mtx[1, 2]:7.1f} | {dist[0, 0]:+.3f}')
`, desc: '<p>1장만 쓰면 RMS 는 오히려 작은데 fx 가 800 을 넘는 <b>엉뚱한 값</b>이 나옵니다. 장수가 늘수록 fx ≈ 534, k1 ≈ −0.29 근처로 안정됩니다. <b>“RMS 가 작다 = 좋은 캘리브레이션”은 아닙니다.</b> 충분한 수의, 다양한 각도의 사진이 먼저입니다.</p>' },
      { type: 'checklist', title: '좋은 캘리브레이션 사진 찍기 점검 목록', items: [
        '사진 10~20장 이상 (보드 전체가 찍힌 것만 계산됨)',
        '보드를 여러 방향으로 <b>기울여서</b> (정면만 찍으면 fx 와 거리를 구별하기 어려움)',
        '보드가 <b>사진 가장자리와 모서리</b>에도 오게 (왜곡은 가장자리에서 커짐)',
        '흔들림 · 흐림 없이, 보드는 평평하게, 초점 · 줌은 고정 (자동 초점 끄기)',
        '결과 확인: RMS 가 약 1 px 이하인지, cx · cy 가 이미지 중앙 근처인지, 보정한 사진의 직선이 곧은지(a2-4)',
      ] },
      { type: 'text', html: `<h3>7. 결과 저장하고 다시 쓰기</h3>
<p>캘리브레이션은 카메라마다 <b>한 번만</b> 하면 됩니다. 튜토리얼처럼 <code>np.savez</code> 로 저장해 두고 필요할 때 <code>np.load</code> 로 불러옵니다. 웹 실습에서는 가상 폴더에 저장되며, <b>페이지를 새로 고치기 전까지</b> 다른 예제 · 교시에서도 불러올 수 있습니다(<code>cv.imwrite</code> 처럼 다운로드 링크는 나오지 않음).
아래 예제는 파일이 없으면(예제 2 를 아직 실행하지 않았으면) 수업에서 구한 값을 대신 사용합니다.</p>` },
      { type: 'code', title: '예제 6 · calib.npz 불러와서 시야각(FOV) 계산하기', code: String.raw`
import numpy as np
import os

if os.path.exists('calib.npz'):
    with np.load('calib.npz') as X:
        mtx, dist = X['mtx'], X['dist']
    print('calib.npz 에서 불러옴')
else:
    # 예제 2 (7×6, 9장) 결과를 옮겨 적은 값
    mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
    dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
    print('calib.npz 가 없어 수업 결과값을 사용 (예제 2 를 먼저 실행하면 파일에서 불러옴)')

np.set_printoptions(precision=4, suppress=True)
print('mtx =\n', mtx)
print('dist =', dist.ravel())

w, h = 640, 480
fx, fy = mtx[0, 0], mtx[1, 1]
fov_x = np.degrees(2 * np.arctan(w / (2 * fx)))       # 가로 시야각
fov_y = np.degrees(2 * np.arctan(h / (2 * fy)))       # 세로 시야각
print('가로 시야각 %.1f°, 세로 시야각 %.1f°' % (fov_x, fov_y))
print('2 m 앞에서 사진에 담기는 가로 폭: %.2f m' % (2 * 2.0 * np.tan(np.radians(fov_x / 2))))
`, desc: '<p>fx ≈ 534 px 인 640×480 카메라의 가로 시야각은 약 <b>62°</b> 로 일반 웹캠 수준입니다. fx 가 “픽셀 단위 초점거리”라서 이미지 폭과 함께 쓰면 렌즈의 mm 정보 없이도 시야각을 구할 수 있습니다.</p>' },
      { type: 'warn', html: `<p><b>해상도가 바뀌면 K 도 바뀝니다</b> : 640×480 으로 구한 K 를 1280×960 영상에 쓰려면 fx, fy, cx, cy 를 모두 2배 해야 합니다(왜곡 계수는 정규화 좌표 기준이라 그대로). 가로세로 비율이 다른 해상도(예: 16:9 로 잘린 영상)에는 그대로 쓸 수 없으니 그 해상도로 다시 캘리브레이션하세요.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 올바른 패턴 (9, 6) 으로 13장 캘리브레이션',
        desc: `<p>a2-2 에서 이 보드의 실제 내부 코너는 <b>9 × 6</b> 이고, 그러면 13장 모두 검출된다는 것을 확인했습니다. 시작 코드의 <code>PATTERN</code> 과 사용 사진 목록을 바꿔 <b>13장 · (9, 6)</b> 으로 캘리브레이션하고, 수업 결과(7×6 · 9장: fx ≈ 534.2, cx ≈ 341.7, cy ≈ 232.1, k1 ≈ −0.294, RMS ≈ 0.156)와 비교하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import glob

PATTERN = (7, 6)                      # TODO: (9, 6) 으로
names = ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left07.jpg',
         'left08.jpg', 'left12.jpg', 'left13.jpg', 'left14.jpg']
# TODO: names = sorted(glob.glob('left[0-9]*.jpg'))  로 13장 전체 사용

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
cols, rows = PATTERN
objp = np.zeros((cols * rows, 3), np.float32)
objp[:, :2] = np.mgrid[0:cols, 0:rows].T.reshape(-1, 2)

objpoints, imgpoints = [], []
for fname in names:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, PATTERN, None)
    if ret:
        objpoints.append(objp)
        imgpoints.append(cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria))

ret, mtx, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, gray.shape[::-1], None, None)
np.set_printoptions(suppress=True)
print('패턴', PATTERN, '사진', len(imgpoints), '장')
print('RMS %.3f | fx %.1f fy %.1f | cx %.1f cy %.1f' % (ret, mtx[0, 0], mtx[1, 1], mtx[0, 2], mtx[1, 2]))
print('dist', np.round(dist.ravel(), 4))
`,
        hint: `<p>두 줄만 바꾸면 됩니다. objp 는 <code>PATTERN</code> 에서 자동으로 만들어지므로 따로 고칠 필요가 없습니다. 결과는 fx ≈ 536, cx ≈ 342, cy ≈ 236, k1 ≈ −0.27 정도로 비슷하지만 k2, k3 는 꽤 다릅니다. 고차 계수(k2, k3)는 서로 보완 관계라 개별 값보다 <b>전체 왜곡 모양</b>이 비슷한지가 중요합니다. RMS 는 약 0.41 로 커지는데, 코너가 사진 가장자리까지 더 넓게 퍼져 있어 맞추기 어려운 점이 늘었기 때문입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import glob

PATTERN = (9, 6)
names = sorted(glob.glob('left[0-9]*.jpg'))

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
cols, rows = PATTERN
objp = np.zeros((cols * rows, 3), np.float32)
objp[:, :2] = np.mgrid[0:cols, 0:rows].T.reshape(-1, 2)

objpoints, imgpoints = [], []
for fname in names:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, PATTERN, None)
    if ret:
        objpoints.append(objp)
        imgpoints.append(cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria))

ret, mtx, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, gray.shape[::-1], None, None)
np.set_printoptions(suppress=True)
print('패턴', PATTERN, '사진', len(imgpoints), '장')
print('RMS %.3f | fx %.1f fy %.1f | cx %.1f cy %.1f' % (ret, mtx[0, 0], mtx[1, 1], mtx[0, 2], mtx[1, 2]))
print('dist', np.round(dist.ravel(), 4))
print('비교(7×6, 9장): RMS 0.156 | fx 534.2 fy 534.3 | cx 341.7 cy 232.1 | k1 -0.294')
np.savez('calib96.npz', mtx=mtx, dist=dist)
`,
      },
      {
        title: '실습 2 · 오차가 가장 큰 사진을 빼고 다시 계산',
        desc: `<p>9장으로 캘리브레이션한 뒤 사진별 재투영 오차(튜토리얼 식)를 구해 <b>가장 큰 사진</b>을 찾고, 그 사진을 뺀 8장으로 다시 캘리브레이션해서 RMS 와 fx, k1 이 어떻게 변하는지 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
names = ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left07.jpg',
         'left08.jpg', 'left12.jpg', 'left13.jpg', 'left14.jpg']
imgpoints = []
for fname in names:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    imgpoints.append(cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria))

def calibrate(pts):
    return cv.calibrateCamera([objp] * len(pts), pts, (640, 480), None, None)

ret, mtx, dist, rvecs, tvecs = calibrate(imgpoints)
print('9장: RMS %.4f  fx %.2f  k1 %.4f' % (ret, mtx[0, 0], dist[0, 0]))

errors = []
for i in range(len(names)):
    # TODO: projectPoints 로 다시 투영하고 튜토리얼 식으로 오차 계산
    errors.append(0.0)

worst = int(np.argmax(errors))
print('오차가 가장 큰 사진:', names[worst], errors[worst])
# TODO: worst 번째를 뺀 imgpoints 로 다시 calibrate 하고 결과 출력
`,
        hint: `<p><code>proj, _ = cv.projectPoints(objp, rvecs[i], tvecs[i], mtx, dist)</code>, <code>cv.norm(imgpoints[i], proj, cv.NORM_L2) / len(proj)</code>. 빼는 것은 <code>rest = imgpoints[:worst] + imgpoints[worst + 1:]</code> 처럼 리스트를 이어 붙이면 됩니다. 이 데이터에서는 left08 을 빼면 RMS 가 조금 줄지만 fx 는 거의 그대로입니다. 좋은 데이터에서는 한 장을 빼도 결과가 안정적이라는 뜻입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
names = ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left07.jpg',
         'left08.jpg', 'left12.jpg', 'left13.jpg', 'left14.jpg']
imgpoints = []
for fname in names:
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    imgpoints.append(cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria))

def calibrate(pts):
    return cv.calibrateCamera([objp] * len(pts), pts, (640, 480), None, None)

ret, mtx, dist, rvecs, tvecs = calibrate(imgpoints)
print('9장: RMS %.4f  fx %.2f  k1 %.4f' % (ret, mtx[0, 0], dist[0, 0]))

errors = []
for i in range(len(names)):
    proj, _ = cv.projectPoints(objp, rvecs[i], tvecs[i], mtx, dist)
    errors.append(cv.norm(imgpoints[i], proj, cv.NORM_L2) / len(proj))
for n, e in zip(names, errors):
    print(f'  {n}: {e:.4f}')

worst = int(np.argmax(errors))
print('오차가 가장 큰 사진:', names[worst])
rest = imgpoints[:worst] + imgpoints[worst + 1:]
ret2, mtx2, dist2, _, _ = calibrate(rest)
print('8장: RMS %.4f  fx %.2f  k1 %.4f' % (ret2, mtx2[0, 0], dist2[0, 0]))
`,
      },
      {
        title: '실습 3 · 망원일까 광각일까? 해상도를 바꾸면?',
        desc: `<p>수업에서 구한 카메라 행렬(fx = 534.16, fy = 534.25, cx = 341.71, cy = 232.05, 640×480)로</p>
<ol><li>가로 · 세로 시야각을 계산하고</li><li>같은 카메라를 <b>1280×960</b> 으로 쓸 때의 새 카메라 행렬 K2 를 만들어</li><li>K2 로 구한 시야각이 1 과 같은지 확인하세요.</li></ol>`,
        starter: String.raw`
import numpy as np

K = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
w, h = 640, 480

def fov(K, w, h):
    # TODO: 가로, 세로 시야각(도)을 계산해서 돌려주기  (힌트: 2 * atan(w / (2 * fx)))
    return 0.0, 0.0

print('640x480  FOV:', fov(K, w, h))

# TODO: 해상도 2배일 때의 카메라 행렬 (fx, fy, cx, cy 모두 2배, 마지막 행은 그대로)
K2 = K.copy()
print('K2 =\n', K2)
print('1280x960 FOV:', fov(K2, 2 * w, 2 * h))
`,
        hint: `<p><code>np.degrees(2 * np.arctan(w / (2 * K[0, 0])))</code>. K2 는 <code>K2 = K.copy(); K2[:2] *= 2</code> 로 위 두 행만 2배 하면 됩니다. 픽셀 수와 픽셀 단위 초점거리가 함께 2배가 되므로 시야각은 같습니다.</p>`,
        solution: String.raw`
import numpy as np

K = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
w, h = 640, 480

def fov(K, w, h):
    fx, fy = K[0, 0], K[1, 1]
    return (round(float(np.degrees(2 * np.arctan(w / (2 * fx)))), 2),
            round(float(np.degrees(2 * np.arctan(h / (2 * fy)))), 2))

print('640x480  FOV:', fov(K, w, h))

K2 = K.copy()
K2[:2] *= 2                      # fx, cx (0행) 과 fy, cy (1행) 를 2배
print('K2 =\n', K2)
print('1280x960 FOV:', fov(K2, 2 * w, 2 * h))
print('→ 시야각 약 62° : 일반 웹캠 정도의 약간 넓은 화각')
`,
      },
    ],
    quiz: [
      { q: 'cv.calibrateCamera 에 넣는 objpoints 와 imgpoints 의 관계로 옳은 것은?', options: ['objpoints 는 사진 속 픽셀 좌표, imgpoints 는 보드 3D 좌표', '사진마다 objp 한 세트와 찾은 코너 한 세트를 같은 순서로 짝지어 넣는다', 'objpoints 는 사진 1장당 1개의 점만 넣는다', 'imgpoints 는 cornerSubPix 없이 넣어야 한다'], answer: 1, explain: '검출에 성공한 사진마다 같은 objp(3D)를 objpoints 에, 찾은 코너(2D)를 imgpoints 에 추가합니다. i 번째 3D 점과 i 번째 코너가 짝입니다.' },
      { q: 'calibrateCamera 의 이미지 크기 인자로 gray.shape[::-1] 을 쓰는 이유는?', options: ['이미지를 좌우 반전하려고', 'shape 는 (높이, 너비)인데 함수는 (너비, 높이)를 받기 때문', '채널 수를 빼려고', '흑백 이미지만 받기 때문'], answer: 1, explain: 'numpy shape 는 (행=높이, 열=너비) 순서이고 OpenCV 크기 인자는 (너비, 높이) 순서입니다.' },
      { q: '캘리브레이션 결과 k1 = −0.29 가 나왔다. 이 카메라의 렌즈에 대한 설명으로 옳은 것은?', options: ['실패형 왜곡이 있다', '술통형 왜곡이 있다', '왜곡이 전혀 없다', '접선 왜곡만 있다'], answer: 1, explain: 'k1 이 음수이면 가장자리가 안쪽으로 말리는 술통형(barrel) 왜곡입니다.' },
      { q: '사진 1장만으로 캘리브레이션했더니 RMS 는 0.12 px 로 매우 작았지만 fx 가 841 로 나왔다(여러 장: 534). 가장 알맞은 해석은?', options: ['1장 결과가 더 정확하다', 'RMS 가 작으니 둘 다 맞다', '데이터가 부족해 그 사진에만 맞춘(과적합) 결과라 믿기 어렵다', 'fx 는 사진마다 달라지는 값이다'], answer: 2, explain: '미지수에 비해 데이터가 적으면 오차는 작아도 값이 불안정합니다. 다양한 각도의 사진 10장 이상으로 캘리브레이션해야 합니다.' },
      { q: '640×480 에서 fx = 534 로 캘리브레이션한 카메라를 1280×960 으로 쓸 때 올바른 처리는?', options: ['K 를 그대로 사용', 'fx, fy, cx, cy 를 2배로', '왜곡 계수만 2배로', 'fx 만 2배로'], answer: 1, explain: '픽셀 단위 값(fx, fy, cx, cy)은 해상도 배율만큼 곱합니다. 왜곡 계수는 정규화 좌표 기준이라 그대로입니다.' },
    ],
  },
  // =====================================================================
  // a2-4 왜곡 보정
  // =====================================================================
  {
    id: 'a2-4',
    assets: ['images/adv/left01.jpg', 'images/adv/left02.jpg', 'images/adv/left03.jpg', 'images/adv/left04.jpg', 'images/adv/left05.jpg',
      'images/adv/left06.jpg', 'images/adv/left07.jpg', 'images/adv/left08.jpg', 'images/adv/left09.jpg', 'images/adv/left11.jpg',
      'images/adv/left12.jpg', 'images/adv/left13.jpg', 'images/adv/left14.jpg'],
    summary: '지난 교시에 구한 카메라 행렬과 왜곡 계수로 휘어진 사진을 곧게 폅니다. 튜토리얼의 두 가지 방법(cv.undistort / cv.initUndistortRectifyMap + cv.remap)을 비교하고, cv.getOptimalNewCameraMatrix 의 alpha 가 결과 화면(검은 가장자리 vs 잘림)에 주는 영향을 트랙바로 확인하며, 보정 전후 직선이 얼마나 곧아졌는지 수치로 검증합니다.',
    goals: [
      'cv.getOptimalNewCameraMatrix 의 alpha(0 ~ 1)와 roi 의 의미를 설명할 수 있다',
      'cv.undistort 로 사진 한 장의 왜곡을 보정하고 roi 로 잘라낼 수 있다',
      'cv.initUndistortRectifyMap 으로 map 을 한 번 만들고 cv.remap 으로 여러 장 · 영상 프레임을 빠르게 보정할 수 있다',
      '보정 전후 체스보드 코너의 직선성을 비교해 보정 효과를 수치로 확인할 수 있다',
    ],
    schedule: [['도입 · 캘리브레이션 결과 복습', 5], ['undistort 와 alpha', 15], ['remap 방식 · 효과 검증', 15], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 지난 시간 결과로 사진 펴기</h3>
<p>a2-3 에서 튜토리얼 사진 9장으로 구한 값은 다음과 같습니다. 이 교시의 예제는 매번 캘리브레이션을 다시 하지 않도록 <b>이 값을 코드에 직접 적어</b> 사용합니다(a2-3 예제 2 를 실행해 만든 <code>calib.npz</code> 를 <code>np.load</code> 해도 같습니다).</p>
<pre>mtx  = [[534.16,   0.  , 341.71],
        [  0.  , 534.25, 232.05],
        [  0.  ,   0.  ,   1.  ]]
dist = [-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]     # k1, k2, p1, p2, k3</pre>
<p><b>왜곡 보정(Undistortion)</b>은 a2-1 에서 입혀 본 왜곡을 되돌리는 것입니다. 보정한 사진의 픽셀 (u, v) 마다 “원래 사진에서는 어디에 찍혔을까?”를 왜곡 공식으로 계산해 그 위치의 색을 가져옵니다.</p>` },
      { type: 'text', html: `<h3>2. 새 카메라 행렬과 alpha</h3>
<p>술통형 왜곡을 펴면 사진 가장자리가 <b>바깥으로 늘어나</b> 원래 640×480 틀을 벗어나고, 네 모서리에는 원본에 없던 <b>빈(검은) 영역</b>이 생깁니다. 이 둘 사이에서 어떻게 화면을 잡을지 정하는 것이 <code>cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), alpha, (w, h))</code> 입니다.</p>
<ul>
<li><b>alpha = 0</b> : 검은 영역이 <b>전혀 없도록</b> 확대. 대신 가장자리 일부가 잘려 나갑니다.</li>
<li><b>alpha = 1</b> : 원본의 <b>모든 픽셀이 보이도록</b> 축소. 대신 모서리에 검은 영역이 생깁니다.</li>
<li>그 사이 값(0.5 등)은 중간 절충입니다.</li>
<li>함께 돌려주는 <b>roi</b> = (x, y, w, h) 는 검은 영역 없이 유효한 픽셀만 있는 사각형입니다. 튜토리얼은 alpha = 1 로 보정한 뒤 roi 로 잘라냅니다.</li>
</ul>` },
      { type: 'code', title: '예제 1 · 튜토리얼: undistort 로 left12.jpg 보정하고 roi 로 자르기', code: String.raw`
import cv2 as cv
import numpy as np

# a2-3 에서 구한 캘리브레이션 결과 (7×6 패턴, 9장)
mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

img = cv.imread('left12.jpg')
h, w = img.shape[:2]
newcameramtx, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))
np.set_printoptions(precision=2, suppress=True)
print('newcameramtx =\n', newcameramtx)
print('roi (x, y, w, h) =', roi)

# 왜곡 보정
dst = cv.undistort(img, mtx, dist, None, newcameramtx)
cv.imshow('undistorted (alpha=1)', dst)

# 이미지 자르기
x, y, w, h = roi
dst = dst[y:y + h, x:x + w]
cv.imwrite('calibresult.png', dst)
cv.imshow('calibresult.png (cropped)', dst)
`, desc: '<p>보정한 사진에서 체스보드의 휘었던 테두리가 곧게 펴졌고, 모서리의 검은 영역을 roi 로 잘라낸 결과가 <code>calibresult.png</code> 로 저장됩니다(콘솔의 링크로 내려받기 가능). newcameramtx 의 fx 가 원래(534)보다 작아진 것은 “모든 픽셀을 담기 위해 약간 광각으로 축소”했다는 뜻입니다.</p>' },
      { type: 'code', title: '예제 2 · alpha = 0 과 alpha = 1 나란히 비교', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

img = cv.imread('left12.jpg')
h, w = img.shape[:2]

panels = [('original', img)]
for alpha in [0, 1]:
    newK, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), alpha, (w, h))
    dst = cv.undistort(img, mtx, dist, None, newK)
    x, y, rw, rh = roi
    cv.rectangle(dst, (x, y), (x + rw - 1, y + rh - 1), (0, 0, 255), 2)     # 유효 영역(roi) 표시
    panels.append(('alpha=%d  fx=%.0f' % (alpha, newK[0, 0]), dst))
    print('alpha =', alpha, ' roi =', roi, ' 새 fx = %.1f' % newK[0, 0])

plt.figure(figsize=(13, 4))
for i, (title, im) in enumerate(panels):
    plt.subplot(1, 3, i + 1)
    plt.imshow(cv.cvtColor(im, cv.COLOR_BGR2RGB))
    plt.title(title)
    plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p><b>alpha = 0</b> 은 화면 전체가 유효 픽셀(roi 가 이미지 전체)이지만 원본보다 조금 확대되어 사진 가장자리(왼쪽 모니터, 아래쪽 키보드 등)가 조금 잘렸고, <b>alpha = 1</b> 은 원본 전체가 들어가는 대신 모서리가 검게 휘어 있습니다. 측정 · 인식처럼 “빈 영역이 없어야 하는” 작업은 alpha = 0, 원본 정보를 하나도 버리면 안 되는 작업은 alpha = 1 을 고릅니다.</p>' },
      { type: 'text', html: `<h3>3. 방법 2: initUndistortRectifyMap + remap</h3>
<p><code>cv.undistort</code> 는 호출할 때마다 “픽셀마다 원래 위치 계산(map 만들기) → 색 가져오기(remap)”를 모두 합니다. 동영상처럼 <b>같은 카메라의 프레임을 계속</b> 보정할 때는 map 이 매번 같으므로, 튜토리얼의 두 번째 방법처럼 <b>map 은 한 번만 만들고 remap 만 반복</b>하는 것이 훨씬 빠릅니다.</p>
<pre>mapx, mapy = cv.initUndistortRectifyMap(mtx, dist, None, newcameramtx, (w, h), cv.CV_32FC1)   # 한 번
dst = cv.remap(img, mapx, mapy, cv.INTER_LINEAR)                                                # 프레임마다</pre>
<p>세 번째 인자 None 은 회전(R) 없음이라는 뜻입니다(스테레오 정렬 때 사용). <code>cv.remap</code> 은 a2-1 예제 5 에서 왜곡을 입힐 때 쓴 바로 그 함수입니다.</p>` },
      { type: 'code', title: '예제 3 · 튜토리얼 방법 2 와 속도 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

img = cv.imread('left12.jpg')
h, w = img.shape[:2]
newcameramtx, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))

# 왜곡 보정 (방법 2)
mapx, mapy = cv.initUndistortRectifyMap(mtx, dist, None, newcameramtx, (w, h), 5)   # 5 = cv.CV_32FC1
dst = cv.remap(img, mapx, mapy, cv.INTER_LINEAR)

# 이미지 자르기
x, y, w2, h2 = roi
cv.imshow('remap result (cropped)', dst[y:y + h2, x:x + w2])

# 같은 사진을 10번 보정하는 시간 비교
N = 10
t = time.time()
for _ in range(N):
    a = cv.undistort(img, mtx, dist, None, newcameramtx)
t_undist = (time.time() - t) / N

t = time.time()
for _ in range(N):
    b = cv.remap(img, mapx, mapy, cv.INTER_LINEAR)
t_remap = (time.time() - t) / N

print('mapx 모양:', mapx.shape, mapx.dtype, '  (w, h) 픽셀마다 원래 x 좌표')
print('결과 (0, 0) 픽셀은 원본의 (%.1f, %.1f) 에서 옴' % (mapx[0, 0], mapy[0, 0]))
print('결과 위쪽 가운데 (320, 0) 픽셀은 원본의 (%.1f, %.1f) 에서 옴' % (mapx[0, 320], mapy[0, 320]))
print('undistort 1회: %.1f ms / remap 1회: %.1f ms' % (t_undist * 1000, t_remap * 1000))
print('두 결과의 최대 차이:', int(cv.absdiff(a, b).max()))
`, desc: '<p>두 방법의 결과는 (거의) 같고, map 을 미리 만들어 둔 remap 이 여러 배 빠릅니다. alpha = 1 이라 결과의 왼쪽 위 모서리는 원본의 모서리 (0, 0) 에서 오지만, 위쪽 가운데 픽셀은 원본의 y ≈ −23, 즉 <b>원본 바깥</b>을 가리킵니다. 그래서 그 자리가 검게 채워집니다(예제 2 의 alpha = 1 결과에서 위아래 가장자리가 검게 휜 부분).</p>' },
      { type: 'text', html: `<h3>4. 정말 곧아졌을까? 수치로 확인하기</h3>
<p>눈으로 보는 것만으로는 부족합니다. a2-1 예제 6 처럼 체스보드의 <b>바깥쪽 네 줄</b>이 직선에서 얼마나 벗어나는지 보정 전후로 재 봅시다. 보정한 사진에서도 코너를 다시 찾으면 됩니다(보드 전체 9×6 패턴 사용).</p>` },
      { type: 'code', title: '예제 4 · 보정 전후 체스보드 테두리의 직선성 비교', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

def edge_bend(img, title):
    """(9, 6) 코너를 찾아 바깥 네 줄이 양 끝을 잇는 직선에서 벗어난 최대 거리(px)를 그리고 돌려줌"""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (9, 6))
    view = img.copy()
    if not ret:
        return view, None
    grid = corners.reshape(6, 9, 2)
    worst = 0
    for pts in [grid[0], grid[5], grid[:, 0], grid[:, 8]]:
        a, b = pts[0], pts[-1]
        ab, ap = b - a, pts - a
        d = np.abs(ab[0] * ap[:, 1] - ab[1] * ap[:, 0]) / np.linalg.norm(ab)
        worst = max(worst, d.max())
        cv.line(view, (int(a[0]), int(a[1])), (int(b[0]), int(b[1])), (0, 0, 255), 1, cv.LINE_AA)
        for p in pts:
            cv.circle(view, (int(p[0]), int(p[1])), 3, (0, 255, 0), -1)
    cv.putText(view, '%s: max bend %.2f px' % (title, worst), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
    return view, worst

img = cv.imread('left12.jpg')
h, w = img.shape[:2]
newK, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), 0, (w, h))    # alpha=0: 빈 영역 없음
und = cv.undistort(img, mtx, dist, None, newK)

v1, b1 = edge_bend(img, 'before')
v2, b2 = edge_bend(und, 'after')
print('보정 전 최대 휨: %.2f px' % b1)
print('보정 후 최대 휨: %.2f px' % b2)
cv.imshow('before | after', np.hstack([v1, v2]))
`, desc: '<p>보정 전에는 테두리 코너가 직선에서 약 4 픽셀 벗어났지만, 보정 후에는 <b>1 픽셀 이하</b>(약 0.7)로 줄어듭니다. 남은 오차는 코너 검출의 잡음 수준입니다. “직선은 직선으로” — 핀홀 카메라의 성질이 되살아났습니다.</p>' },
      { type: 'text', html: `<h3>5. 트랙바로 alpha 조절해 보기</h3>
<p>alpha 를 0 에서 1 로 천천히 움직이면서 화면이 어떻게 확대 · 축소되는지, roi(빨간 사각형)가 어떻게 변하는지 관찰하세요. 이 예제는 입력 소스와 관계없이 <code>left12.jpg</code> 를 사용합니다. 캘리브레이션 값은 이 카메라 전용이므로 웹캠 영상에 적용하면 오히려 휘어 보일 수 있습니다.</p>` },
      { type: 'code', title: '예제 5 · 트랙바 alpha 로 보정 결과 조절', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
img = cv.imread('left12.jpg')
h, w = img.shape[:2]

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('alpha x100', 'result', 100, 100, nothing)
cv.createTrackbar('crop roi', 'result', 0, 1, nothing)

def process(frame):
    alpha = cv.getTrackbarPos('alpha x100', 'result') / 100.0
    crop = cv.getTrackbarPos('crop roi', 'result')
    newK, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), alpha, (w, h))
    mapx, mapy = cv.initUndistortRectifyMap(mtx, dist, None, newK, (w, h), cv.CV_32FC1)
    out = cv.remap(img, mapx, mapy, cv.INTER_LINEAR)
    x, y, rw, rh = roi
    if crop and rw > 0 and rh > 0:
        out = cv.resize(out[y:y + rh, x:x + rw], (w, h))          # 잘라서 원래 크기로 확대해 보기
    else:
        cv.rectangle(out, (x, y), (x + rw - 1, y + rh - 1), (0, 0, 255), 2)
    cv.putText(out, 'alpha=%.2f  fx=%.0f  roi=%s' % (alpha, newK[0, 0], roi), (10, 25),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return np.hstack([img, out])
`, desc: '<p>alpha 를 줄일수록 새 fx 가 커지며(확대) 검은 영역이 사라지고, roi 는 점점 이미지 전체와 같아집니다. <b>crop roi</b> 를 1 로 두면 roi 만 잘라 원래 크기로 늘려 보여 줍니다.</p>' },
      { type: 'text', html: `<h3>6. 여러 장을 한 번에: map 재사용</h3>
<p>같은 카메라로 찍은 사진은 크기가 같으므로 map 을 <b>한 번만</b> 만들어 모든 사진에 remap 합니다. 실시간 영상 보정(<code>process(frame)</code>)도 이 구조로 만듭니다: map 은 함수 바깥에서 한 번, remap 은 함수 안에서 매 프레임.</p>` },
      { type: 'code', title: '예제 6 · map 한 번 만들어 4장 보정 전후 갤러리', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
w, h = 640, 480
newK, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), 0, (w, h))
mapx, mapy = cv.initUndistortRectifyMap(mtx, dist, None, newK, (w, h), cv.CV_32FC1)   # 딱 한 번

rows = []
for fname in ['left01.jpg', 'left05.jpg', 'left09.jpg', 'left14.jpg']:
    img = cv.imread(fname)
    und = cv.remap(img, mapx, mapy, cv.INTER_LINEAR)           # 사진마다 remap 만
    pair = np.hstack([img, und])
    cv.line(pair, (w, 0), (w, h), (0, 255, 255), 3)
    cv.putText(pair, fname + '  before', (10, 45), cv.FONT_HERSHEY_SIMPLEX, 1.4, (0, 0, 255), 3)
    cv.putText(pair, 'after (alpha=0)', (w + 10, 45), cv.FONT_HERSHEY_SIMPLEX, 1.4, (0, 200, 0), 3)
    rows.append(cv.resize(pair, (640, 240)))

cv.imshow('before | after', np.vstack(rows))
`, desc: '<p>보드 테두리, 모니터 옆면, 칸막이 선처럼 <b>사진 가장자리 근처의 직선</b>에서 차이가 가장 잘 보입니다. 사진 가운데는 원래 왜곡이 작아 거의 달라지지 않습니다.</p>' },
      { type: 'warn', html: `<p><b>주의</b></p>
<ul>
<li>캘리브레이션 값은 <b>그 카메라 · 그 해상도 · 그 렌즈 설정(줌 · 초점)</b>에서만 유효합니다. 다른 웹캠에 이 값을 쓰면 보정이 아니라 새로운 왜곡을 만듭니다.</li>
<li>map 크기는 <code>(w, h)</code> 로 정한 결과 크기입니다. 입력 프레임 크기가 다르면 remap 결과가 이상해지니 프레임 크기가 바뀌면 map 을 다시 만드세요.</li>
<li>보정 후의 사진에서 3D 계산을 할 때는 원래 mtx 가 아니라 <b>newcameramtx</b> 를, 왜곡 계수는 <b>0</b> 을 써야 합니다.</li>
</ul>` },
      { type: 'tip', html: `<p><b>내 웹캠을 보정하려면</b> : ① 9×6 체스보드를 인쇄해 판에 붙이고 ② a2-2 예제 5 로 FOUND 가 뜨는 장면을 여러 각도로 📸 스냅샷(webcam.png) 또는 업로드해 10~15장 모으고 ③ a2-3 예제 2 의 파일 목록과 패턴만 바꿔 캘리브레이션 ④ 오늘 배운 remap 으로 <code>process(frame)</code> 안에서 매 프레임 보정하면 됩니다. 4주차 “캘리브레이션 기반 실측” 가이드 프로젝트에서 이 과정을 다시 다룹니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · alpha = 0.5 로 보정하고 잘라 저장하기',
        desc: `<p><code>left14.jpg</code> 를 <b>alpha = 0.5</b> 로 보정한 뒤 roi 로 잘라 <code>left14_undist.png</code> 로 저장하세요. 원본과 잘라낸 결과를 함께 보여 주고, roi 의 크기(너비 × 높이)와 원본 대비 몇 % 넓이인지 출력하세요. 시작 코드는 alpha = 1 이고 자르기 · 저장이 빠져 있습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

img = cv.imread('left14.jpg')
h, w = img.shape[:2]
alpha = 1.0                                   # TODO: 0.5 로
newK, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), alpha, (w, h))
dst = cv.undistort(img, mtx, dist, None, newK)

# TODO: roi 로 자르고 크기 · 넓이 비율 출력, cv.imwrite 로 저장
print('roi =', roi)
cv.imshow('original', img)
cv.imshow('undistorted', dst)
`,
        hint: `<p><code>x, y, rw, rh = roi</code> → <code>crop = dst[y:y + rh, x:x + rw]</code>. 넓이 비율은 <code>rw * rh / (w * h) * 100</code>. alpha 가 1 에 가까울수록 roi 가 작아지고(버리는 가장자리가 많음), 0 에 가까울수록 roi 가 커집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

img = cv.imread('left14.jpg')
h, w = img.shape[:2]
alpha = 0.5
newK, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), alpha, (w, h))
dst = cv.undistort(img, mtx, dist, None, newK)

x, y, rw, rh = roi
crop = dst[y:y + rh, x:x + rw]
print('roi =', roi, ' → %d × %d, 원본 넓이의 %.1f%%' % (rw, rh, rw * rh / (w * h) * 100))
cv.imwrite('left14_undist.png', crop)
cv.imshow('original', img)
cv.imshow('left14_undist.png', crop)
`,
      },
      {
        title: '실습 2 · 13장 전체의 “휨” 줄이기 효과를 한 번에',
        desc: `<p>이미지를 보정하지 않고도 <b>코너 좌표만</b> 보정할 수 있습니다: <code>cv.undistortPoints(corners, mtx, dist, P=mtx)</code> 는 왜곡된 코너 좌표를 “왜곡이 없었다면 찍혔을 픽셀 좌표”로 바꿔 줍니다. 13장 모두 (9, 6) 코너를 찾고, 사진마다 <b>보정 전 · 후 바깥 네 줄의 최대 휨</b>을 계산해 표로 출력하고, 전체 평균도 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import glob

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

def max_bend(corners):
    grid = corners.reshape(6, 9, 2)
    worst = 0.0
    for pts in [grid[0], grid[5], grid[:, 0], grid[:, 8]]:
        a, b = pts[0], pts[-1]
        ab, ap = b - a, pts - a
        d = np.abs(ab[0] * ap[:, 1] - ab[1] * ap[:, 0]) / np.linalg.norm(ab)
        worst = max(worst, float(d.max()))
    return worst

before, after = [], []
for fname in sorted(glob.glob('left[0-9]*.jpg')):
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (9, 6))
    if not ret:
        continue
    b = max_bend(corners)
    # TODO: undistortPoints 로 코너 좌표를 보정한 뒤 max_bend 계산
    a = b
    before.append(b)
    after.append(a)
    print(f'{fname}: 전 {b:.2f} px → 후 {a:.2f} px')

print('평균: 전 %.2f px → 후 %.2f px' % (np.mean(before), np.mean(after)))
`,
        hint: `<p><code>und = cv.undistortPoints(corners, mtx, dist, P=mtx)</code> 의 결과 모양도 (54, 1, 2) 라서 그대로 <code>max_bend(und)</code> 에 넣으면 됩니다. <code>P=mtx</code> 를 빼면 픽셀이 아닌 정규화 좌표(초점거리 1 기준)가 나오니 꼭 넣으세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import glob

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

def max_bend(corners):
    grid = corners.reshape(6, 9, 2)
    worst = 0.0
    for pts in [grid[0], grid[5], grid[:, 0], grid[:, 8]]:
        a, b = pts[0], pts[-1]
        ab, ap = b - a, pts - a
        d = np.abs(ab[0] * ap[:, 1] - ab[1] * ap[:, 0]) / np.linalg.norm(ab)
        worst = max(worst, float(d.max()))
    return worst

before, after = [], []
for fname in sorted(glob.glob('left[0-9]*.jpg')):
    gray = cv.imread(fname, cv.IMREAD_GRAYSCALE)
    ret, corners = cv.findChessboardCorners(gray, (9, 6))
    if not ret:
        continue
    b = max_bend(corners)
    und = cv.undistortPoints(corners, mtx, dist, P=mtx)      # 코너 좌표만 왜곡 보정
    a = max_bend(und)
    before.append(b)
    after.append(a)
    print(f'{fname}: 전 {b:.2f} px → 후 {a:.2f} px')

print('평균: 전 %.2f px → 후 %.2f px' % (np.mean(before), np.mean(after)))
`,
      },
    ],
    quiz: [
      { q: 'getOptimalNewCameraMatrix 에서 alpha = 0 으로 보정한 결과의 특징은?', options: ['모서리에 검은 영역이 가장 많다', '검은 영역은 없지만 가장자리 일부가 잘린다', '왜곡 보정이 되지 않는다', '이미지 크기가 두 배가 된다'], answer: 1, explain: 'alpha = 0 은 유효한 픽셀만 보이도록 확대하므로 빈 영역은 없고 가장자리 일부가 잘립니다. alpha = 1 은 모든 원본 픽셀을 담고 검은 영역이 생깁니다.' },
      { q: '웹캠 영상의 매 프레임을 왜곡 보정할 때 가장 효율적인 구조는?', options: ['프레임마다 calibrateCamera 실행', '프레임마다 cv.undistort 실행', 'initUndistortRectifyMap 으로 map 을 한 번 만들고 프레임마다 cv.remap', '프레임마다 getOptimalNewCameraMatrix 와 initUndistortRectifyMap 실행'], answer: 2, explain: 'map 은 카메라 · 해상도가 같으면 변하지 않으므로 한 번만 만들고, 프레임마다 remap 만 하면 빠릅니다.' },
      { q: 'getOptimalNewCameraMatrix 가 함께 돌려주는 roi 의 용도는?', options: ['왜곡 계수를 다시 계산', '검은 영역 없이 유효한 픽셀만 있는 사각형으로 잘라내기', '체스보드 위치 표시', '보정 전 이미지 크기 저장'], answer: 1, explain: 'roi = (x, y, w, h) 는 보정 결과에서 유효 픽셀만 있는 영역으로, 튜토리얼은 dst[y:y+h, x:x+w] 로 잘라냅니다.' },
      { q: '왜곡 보정된 사진에서 다시 3D 계산(예: solvePnP)을 할 때 알맞은 카메라 파라미터는?', options: ['원래 mtx 와 원래 dist', 'newcameramtx 와 dist = 0', '원래 mtx 와 dist = 0', 'newcameramtx 와 원래 dist'], answer: 1, explain: '보정된 사진은 newcameramtx 를 가진 “왜곡 없는” 카메라로 찍은 것과 같습니다. 원본 사진을 쓸 때만 원래 mtx 와 dist 를 사용합니다.' },
    ],
  },
  // =====================================================================
  // a2-5 자세 추정과 AR 좌표축
  // =====================================================================
  {
    id: 'a2-5',
    assets: ['images/adv/left01.jpg', 'images/adv/left02.jpg', 'images/adv/left03.jpg', 'images/adv/left06.jpg',
      'images/adv/left12.jpg', 'images/adv/left14.jpg'],
    summary: '캘리브레이션으로 카메라를 알게 되었으니, 이제 사진 한 장만으로 체스보드가 카메라에 대해 어떻게 놓여 있는지(자세: 회전 R · 이동 t)를 cv.solvePnP 로 구합니다. OpenCV Pose Estimation 튜토리얼처럼 보드 위에 3D 좌표축과 큐브를 그려 증강현실(AR)의 기본 원리를 체험합니다.',
    goals: [
      '자세 추정(PnP 문제)이 무엇을 입력받아 무엇을 구하는지 calibrateCamera 와 비교해 설명할 수 있다',
      'cv.solvePnP 로 rvec, tvec 을 구하고 cv.Rodrigues 로 회전 행렬 · 카메라 위치를 계산할 수 있다',
      'cv.projectPoints 로 3D 좌표축과 큐브를 사진 위에 그리고, cv.drawFrameAxes 를 사용할 수 있다',
      '보드 좌표계(원점 · X · Y · Z 방향)를 이해하고 원하는 위치에 가상 물체를 배치할 수 있다',
    ],
    schedule: [['도입 · PnP 문제', 7], ['solvePnP 와 좌표축', 15], ['큐브 · AR 배치', 13], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 자세 추정이란?</h3>
<p>캘리브레이션으로 카메라의 성질(K, 왜곡)을 알게 되었습니다. 이제 <b>사진 한 장</b>에서 “이 체스보드가 카메라 앞에 <b>어느 방향으로 얼마나 떨어져</b> 놓여 있나?”를 구할 수 있습니다. 이것이 <b>자세 추정(Pose Estimation)</b>이고, 구하는 값은 a2-1 에서 배운 외부 파라미터 <b>R(rvec), t(tvec)</b> 입니다.</p>
<p>비유: 지도에 위치가 표시된 건물 4~5개가 사진의 어디에 찍혔는지 알면, 사진을 찍은 사람이 <b>어디에서 어느 방향을 보고</b> 찍었는지 알아낼 수 있습니다. 이 문제를 <b>PnP(Perspective-n-Point)</b> 라고 부르고, OpenCV 에서는 <code>cv.solvePnP</code> 가 풉니다.</p>
<p>스마트폰 AR 이 바닥이나 마커 위에 3D 캐릭터를 “붙여” 보여 주는 것이 바로 이 원리입니다. 자세를 알면 가상 3D 물체를 <code>cv.projectPoints</code> 로 사진 위에 그릴 수 있습니다.</p>` },
      { type: 'table', head: ['', 'cv.calibrateCamera (a2-3)', 'cv.solvePnP (오늘)'], rows: [
        ['입력', '3D 점 · 2D 점 <b>여러 장</b>', '3D 점 · 2D 점 <b>한 장</b> + <b>K · dist</b>'],
        ['구하는 것', 'K, dist, 사진마다 R · t', '그 사진의 R · t (rvec, tvec)'],
        ['최소 점 수', '사진마다 많이 (체스보드 전체)', '4개 이상 (평면이면 4개로 충분)'],
        ['언제', '카메라마다 한 번', '사진 · 프레임마다 매번'],
        ['활용', '왜곡 보정, 측정 준비', 'AR, 로봇 위치 인식, 거리 측정'],
      ] },
      { type: 'text', html: `<h3>2. solvePnP 한 번 해 보기</h3>
<p>준비물은 a2-3 과 같습니다: 체스보드 코너의 3D 좌표 <code>objp</code>(칸 단위, Z = 0), 사진에서 찾은 코너 <code>corners2</code>, 그리고 캘리브레이션 결과 <code>mtx, dist</code>. 이 교시의 예제도 a2-3 결과값을 코드에 직접 적어 사용합니다.</p>
<pre>ret, rvecs, tvecs = cv.solvePnP(objp, corners2, mtx, dist)</pre>
<ul>
<li><b>tvec</b> : 카메라 좌표계에서 본 <b>보드 원점(코너 0)의 위치</b>. 단위는 objp 단위(칸). tvec 의 Z 가 “카메라 앞 거리”입니다.</li>
<li><b>rvec</b> : 보드 좌표축이 카메라에 대해 돌아간 정도(회전 벡터). <code>cv.Rodrigues(rvec)</code> → 3×3 행렬 R.</li>
<li>반대로 <b>보드 기준 카메라의 위치</b>는 <code>-R.T @ tvec</code> 입니다.</li>
</ul>` },
      { type: 'code', title: '예제 1 · left02.jpg 에서 체스보드 자세 구하기', code: String.raw`
import cv2 as cv
import numpy as np
np.set_printoptions(precision=3, suppress=True)

# a2-3 캘리브레이션 결과 (7×6 패턴, 9장)
mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

img = cv.imread('left02.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)

ret, rvecs, tvecs = cv.solvePnP(objp, corners2, mtx, dist)
print('성공:', ret)
print('rvec =', rvecs.ravel(), ' (회전각 %.1f°)' % np.degrees(np.linalg.norm(rvecs)))
print('tvec =', tvecs.ravel(), ' → 보드 원점은 카메라 앞 %.1f 칸 거리' % tvecs[2, 0])

R, _ = cv.Rodrigues(rvecs)
print('R =\n', R)
cam = -R.T @ tvecs
print('보드 좌표계에서 본 카메라 위치 =', cam.ravel())

# 검산: 구한 자세로 3D 코너를 다시 투영하면 찾은 코너와 거의 같아야 함
proj, _ = cv.projectPoints(objp, rvecs, tvecs, mtx, dist)
err = np.linalg.norm((proj - corners2).reshape(-1, 2), axis=1)
print('재투영 오차 평균 %.3f px' % err.mean())
`, desc: '<p>tvec 의 Z 는 약 12.8 칸, 즉 칸 한 변이 2.5 cm 라면 보드 원점이 카메라 앞 약 32 cm 에 있다는 뜻입니다. 재투영 오차가 0.1 px 수준이라 구한 자세가 사진과 잘 맞습니다. 카메라 위치의 Z 가 음수인 이유는 다음 절의 좌표축 방향에서 확인합니다.</p>' },
      { type: 'text', html: `<h3>3. 3D 좌표축 그리기 (튜토리얼)</h3>
<p>보드 좌표계의 원점(코너 0)에서 길이 3칸짜리 X, Y, Z 축 끝점을 3D 로 정하고, <code>cv.projectPoints</code> 로 사진 위치를 구해 선을 그립니다.</p>
<pre>axis = np.float32([[3,0,0], [0,3,0], [0,0,-3]]).reshape(-1,3)</pre>
<ul>
<li><b>X 축(파랑)</b> : 코너 번호가 증가하는 방향(한 줄 안에서), <b>Y 축(초록)</b> : 다음 줄 방향</li>
<li><b>Z 축(빨강)</b> : 보드 면에 수직. X × Y 방향(오른손 법칙)은 보드 <b>뒤쪽</b>이라, 카메라 쪽으로 튀어나오게 그리려고 <b>−3</b> 을 씁니다.</li>
<li>튜토리얼의 <code>draw()</code> 는 색을 (255,0,0)=파랑, (0,255,0)=초록, (0,0,255)=빨강 순서로 씁니다(BGR).</li>
</ul>
<p>OpenCV 에는 같은 일을 하는 <code>cv.drawFrameAxes(img, mtx, dist, rvec, tvec, 길이, 두께)</code> 도 있습니다. 이 함수는 X=빨강, Y=초록, Z=파랑(RGB 순서) 으로 그리고 Z 는 +방향(보드 뒤쪽)으로 그립니다.</p>` },
      { type: 'code', title: '예제 2 · 튜토리얼 draw() 와 cv.drawFrameAxes 비교', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
axis = np.float32([[3, 0, 0], [0, 3, 0], [0, 0, -3]]).reshape(-1, 3)

def draw(img, corners, imgpts):
    corner = tuple(corners[0].ravel().astype(int))
    imgpts = imgpts.astype(int)
    img = cv.line(img, corner, tuple(imgpts[0].ravel()), (255, 0, 0), 5)
    img = cv.line(img, corner, tuple(imgpts[1].ravel()), (0, 255, 0), 5)
    img = cv.line(img, corner, tuple(imgpts[2].ravel()), (0, 0, 255), 5)
    return img

img = cv.imread('left02.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
if ret:
    corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
    # 회전 벡터와 이동 벡터 구하기
    ret, rvecs, tvecs = cv.solvePnP(objp, corners2, mtx, dist)
    # 3D 점을 이미지 평면에 투영
    imgpts, jac = cv.projectPoints(axis, rvecs, tvecs, mtx, dist)
    left = draw(img.copy(), corners2, imgpts)
    cv.putText(left, 'tutorial draw()', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

    right = img.copy()
    cv.drawFrameAxes(right, mtx, dist, rvecs, tvecs, 3, 5)
    cv.putText(right, 'cv.drawFrameAxes', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    print('축 끝점 (px):\n', imgpts.reshape(-1, 2).round(1))
    cv.imshow('img', np.hstack([left, right]))
`, desc: '<p>두 그림 모두 코너 0 에서 축이 뻗어 나옵니다. 왼쪽(튜토리얼)의 빨간 Z 축은 카메라 쪽으로 튀어나오고, 오른쪽(drawFrameAxes)의 파란 Z 축은 보드 뒤쪽을 향합니다. 색 규칙과 Z 방향이 다를 뿐 같은 자세입니다.</p>' },
      { type: 'code', title: '예제 3 · 여러 장에 좌표축 그리기 (튜토리얼 반복문)', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
axis = np.float32([[3, 0, 0], [0, 3, 0], [0, 0, -3]]).reshape(-1, 3)

def draw(img, corners, imgpts):
    corner = tuple(corners[0].ravel().astype(int))
    imgpts = imgpts.astype(int)
    img = cv.line(img, corner, tuple(imgpts[0].ravel()), (255, 0, 0), 5)
    img = cv.line(img, corner, tuple(imgpts[1].ravel()), (0, 255, 0), 5)
    img = cv.line(img, corner, tuple(imgpts[2].ravel()), (0, 0, 255), 5)
    return img

tiles = []
for fname in ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left12.jpg', 'left14.jpg']:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    if ret:
        corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        ret, rvecs, tvecs = cv.solvePnP(objp, corners2, mtx, dist)
        imgpts, jac = cv.projectPoints(axis, rvecs, tvecs, mtx, dist)
        img = draw(img, corners2, imgpts)
        print(f'{fname}: 거리 Z = {tvecs[2, 0]:.1f} 칸')
    cv.putText(img, fname, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
    tiles.append(cv.resize(img, (320, 240)))

cv.imshow('img', np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])]))
`, desc: '<p>사진마다 보드가 기울어진 방향에 맞춰 축도 함께 기울어집니다. 튜토리얼의 원래 코드는 <code>cv.imshow</code> 후 <code>cv.waitKey(0)</code> 으로 한 장씩 넘기고 s 키로 저장하지만, 웹에서는 갤러리로 한 번에 봅니다. (7, 6) 패턴이 보드의 일부라서 사진마다 원점 위치(보드의 어느 칸인지)가 다를 수 있다는 점도 확인하세요.</p>' },
      { type: 'text', html: `<h3>4. 큐브 그리기 (튜토리얼)</h3>
<p>축 대신 3×3×3 칸 크기의 <b>큐브</b> 꼭짓점 8개를 정해 투영하면 보드 위에 입체 상자를 올릴 수 있습니다. 튜토리얼의 <code>draw()</code> 는</p>
<ol>
<li>바닥 사각형(꼭짓점 0~3)을 <b>초록색으로 채우고</b> (<code>drawContours</code> 두께 −3 = 채우기)</li>
<li>바닥과 윗면을 잇는 기둥 4개를 파란색(255)으로</li>
<li>윗면(꼭짓점 4~7)을 빨간색 테두리로 그립니다.</li>
</ol>` },
      { type: 'code', title: '예제 4 · 체스보드 위에 큐브 올리기', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

axis = np.float32([[0, 0, 0], [0, 3, 0], [3, 3, 0], [3, 0, 0],
                   [0, 0, -3], [0, 3, -3], [3, 3, -3], [3, 0, -3]])

def draw(img, corners, imgpts):
    imgpts = np.int32(imgpts).reshape(-1, 2)
    # 바닥면을 초록색으로 채우기
    img = cv.drawContours(img, [imgpts[:4]], -1, (0, 255, 0), -3)
    # 기둥은 파란색
    for i, j in zip(range(4), range(4, 8)):
        img = cv.line(img, tuple(imgpts[i]), tuple(imgpts[j]), (255), 3)
    # 윗면은 빨간색
    img = cv.drawContours(img, [imgpts[4:]], -1, (0, 0, 255), 3)
    return img

tiles = []
for fname in ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left12.jpg', 'left14.jpg']:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    if ret:
        corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        ret, rvecs, tvecs = cv.solvePnP(objp, corners2, mtx, dist)
        imgpts, jac = cv.projectPoints(axis, rvecs, tvecs, mtx, dist)
        img = draw(img, corners2, imgpts)
    tiles.append(cv.resize(img, (320, 240)))

cv.imshow('img', np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])]))
`, desc: '<p>보드가 어느 방향으로 기울어져 있든 큐브가 보드에 딱 붙어 서 있습니다. 멀리 있는 윗면이 바닥보다 크게 보이는 사진도 있는데, 윗면이 카메라에 <b>더 가깝기</b> 때문입니다(원근). 이 큐브를 3D 캐릭터로 바꾸면 AR 앱이 됩니다.</p>' },
      { type: 'text', html: `<h3>5. 원하는 칸에 가상 물체 배치하기</h3>
<p>보드 좌표계를 알면 “(4, 2) 칸 위에 높이 2 칸짜리 기둥”처럼 물체를 원하는 곳에 둘 수 있습니다. 자세(rvec, tvec)는 사진마다 한 번만 구하고, 트랙바로 위치 · 높이만 바꿔 다시 투영합니다. 입력 소스와 관계없이 <code>left02.jpg</code> 를 사용합니다.</p>` },
      { type: 'code', title: '예제 5 · 트랙바로 보드 위 상자의 위치 · 높이 조절', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

base = cv.imread('left02.jpg')
gray = cv.cvtColor(base, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
ok, rvec, tvec = cv.solvePnP(objp, corners2, mtx, dist)          # 자세는 한 번만

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('x', 'result', 3, 5, nothing)
cv.createTrackbar('y', 'result', 2, 4, nothing)
cv.createTrackbar('height', 'result', 2, 6, nothing)

def process(frame):
    x = cv.getTrackbarPos('x', 'result')
    y = cv.getTrackbarPos('y', 'result')
    hgt = max(cv.getTrackbarPos('height', 'result'), 1)
    box = np.float32([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0],
                      [x, y, -hgt], [x + 1, y, -hgt], [x + 1, y + 1, -hgt], [x, y + 1, -hgt]])
    pts, _ = cv.projectPoints(box, rvec, tvec, mtx, dist)
    pts = np.int32(pts).reshape(-1, 2)
    out = base.copy()
    overlay = out.copy()
    cv.fillConvexPoly(overlay, cv.convexHull(pts), (0, 200, 255))        # 상자 실루엣을 반투명하게
    out = cv.addWeighted(overlay, 0.4, out, 0.6, 0)
    for i in range(4):
        cv.line(out, tuple(pts[i]), tuple(pts[(i + 1) % 4]), (0, 255, 0), 2)
        cv.line(out, tuple(pts[i + 4]), tuple(pts[(i + 1) % 4 + 4]), (0, 0, 255), 2)
        cv.line(out, tuple(pts[i]), tuple(pts[i + 4]), (255, 0, 0), 2)
    cv.drawFrameAxes(out, mtx, dist, rvec, tvec, 2, 2)
    cv.putText(out, 'box at (%d, %d), height %d' % (x, y, hgt), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return out
`, desc: '<p>x, y 트랙바로 상자를 칸 단위로 옮기고 height 로 높이를 바꿔 보세요. 상자가 보드의 격자에 정확히 맞춰 움직입니다. 자세는 코드 맨 위에서 한 번만 구했기 때문에 트랙바를 움직일 때는 투영과 그리기만 다시 합니다(빠름).</p>' },
      { type: 'text', html: `<h3>6. 잘못 찾은 점이 섞이면? solvePnPRansac</h3>
<p>체스보드는 코너가 거의 완벽하게 찾아지지만, 1주차의 특징점 매칭처럼 <b>잘못된 대응점(outlier)</b>이 섞이는 경우가 많습니다. <code>cv.solvePnP</code> 는 모든 점을 믿기 때문에 틀린 점 몇 개에도 자세가 크게 흔들립니다.
<code>cv.solvePnPRansac</code> 은 1주차 <code>findHomography(RANSAC)</code> 처럼 점 일부로 자세를 여러 번 추정해 보고 <b>가장 많은 점이 동의하는 자세</b>를 고릅니다.</p>
<ul>
<li><code>ok, rvec, tvec, inliers = cv.solvePnPRansac(objp, imgpts, mtx, dist, reprojectionError=3.0)</code></li>
<li><code>flags</code> 로 풀이 방법 선택: <code>SOLVEPNP_ITERATIVE</code>(기본), 평면 물체용 <code>SOLVEPNP_IPPE</code>, 정사각형 마커용 <code>SOLVEPNP_IPPE_SQUARE</code>(a2-8), <code>SOLVEPNP_SQPNP</code> 등</li>
</ul>` },
      { type: 'code', title: '예제 6 · 틀린 점 8개를 섞었을 때 solvePnP vs solvePnPRansac', code: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

img = cv.imread('left02.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)

# 일부러 8개 코너를 엉뚱한 곳으로 옮기기 (잘못된 매칭 흉내)
rng = np.random.default_rng(0)
noisy = corners2.copy()
bad = rng.choice(len(noisy), 8, replace=False)
noisy[bad] += rng.uniform(-150, 150, (8, 1, 2)).astype(np.float32)

_, r_true, t_true = cv.solvePnP(objp, corners2, mtx, dist)
ok1, r1, t1 = cv.solvePnP(objp, noisy, mtx, dist)
ok2, r2, t2, inliers = cv.solvePnPRansac(objp, noisy, mtx, dist, reprojectionError=3.0)
print('정답(틀린 점 없음) tvec :', t_true.ravel().round(2))
print('solvePnP        tvec :', t1.ravel().round(2))
print('solvePnPRansac  tvec :', t2.ravel().round(2), ' inlier %d / %d' % (len(inliers), len(noisy)))

def angle_diff(ra, rb):                     # 두 회전 사이의 각도 차이(도)
    Ra, _ = cv.Rodrigues(ra)
    Rb, _ = cv.Rodrigues(rb)
    d, _ = cv.Rodrigues(Ra @ Rb.T)
    return np.degrees(np.linalg.norm(d))
print('정답과의 회전 차이: solvePnP %.1f° / solvePnPRansac %.1f°' % (angle_diff(r1, r_true), angle_diff(r2, r_true)))

axis = np.float32([[0, 0, 0], [3, 0, 0], [0, 3, 0], [0, 0, -3]])
views = []
for title, r, t in [('solvePnP (all points)', r1, t1), ('solvePnPRansac', r2, t2)]:
    v = img.copy()
    for i, p in enumerate(noisy.reshape(-1, 2)):
        cv.circle(v, (int(p[0]), int(p[1])), 5, (0, 0, 255) if i in bad else (0, 255, 0), -1)
    p, _ = cv.projectPoints(axis, r, t, mtx, dist)
    p = np.int32(p).reshape(-1, 2)
    for k, c in zip([1, 2, 3], [(255, 0, 0), (0, 255, 0), (0, 0, 255)]):
        cv.line(v, tuple(p[0]), tuple(p[k]), c, 5)
    cv.putText(v, title, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    views.append(v)
cv.imshow('red dots = wrong points', np.hstack(views))
`, desc: '<p>빨간 점 8개(전체의 약 19%)만 틀렸는데도 <code>solvePnP</code> 의 좌표축은 15° 이상 틀어지고 거리도 달라지지만, <code>solvePnPRansac</code> 은 틀린 점을 버리고(inlier 34개) 정답과 같은 자세를 찾습니다. 특징점 매칭으로 얻은 점으로 자세를 구할 때는 RANSAC 버전을 쓰세요.</p>' },
      { type: 'warn', html: `<p><b>자주 하는 실수</b></p>
<ul>
<li>objp 는 <b>(N, 3) float32</b>, 이미지 점은 <b>(N, 1, 2) 또는 (N, 2) float32</b> 이어야 합니다. 정수형이면 오류가 납니다.</li>
<li>solvePnP 에 넣는 <code>mtx, dist</code> 는 <b>그 사진을 찍은 카메라</b>의 값이어야 합니다. 왜곡 보정된 사진이라면 newcameramtx 와 dist = None.</li>
<li>tvec 단위는 objp 단위입니다. objp 를 칸 단위로 만들면 tvec 도 “칸”, mm 로 만들면 mm.</li>
<li>좌표축이 사진마다 뒤집혀 보이면 코너 0 의 위치(a2-2 실습 2)를 확인하세요.</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 좌표축에 X, Y, Z 이름표 붙이기',
        desc: `<p><code>left06.jpg</code> 에서 자세를 구해 <b>길이 4칸</b>짜리 좌표축을 그리고, 각 축 끝에 <code>X</code>, <code>Y</code>, <code>Z</code> 글자를 축과 같은 색으로 써 넣으세요. Z 는 카메라 쪽(−방향)으로 그립니다. 원점에는 흰 원을 그립니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

img = cv.imread('left06.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
ok, rvec, tvec = cv.solvePnP(objp, corners2, mtx, dist)

L = 3                                          # TODO: 4 칸으로
pts3d = np.float32([[0, 0, 0], [L, 0, 0], [0, L, 0], [0, 0, -L]])
pts, _ = cv.projectPoints(pts3d, rvec, tvec, mtx, dist)
pts = np.int32(pts).reshape(-1, 2)
o = tuple(pts[0])
for k, color in zip([1, 2, 3], [(255, 0, 0), (0, 255, 0), (0, 0, 255)]):
    cv.line(img, o, tuple(pts[k]), color, 4)
    # TODO: 축 끝(pts[k])에 'X', 'Y', 'Z' 글자를 같은 색으로 쓰기
# TODO: 원점에 흰 원 그리기
cv.imshow('axes with labels', img)
`,
        hint: `<p>이름을 리스트로 함께 돌리면 편합니다: <code>for k, name, color in zip([1, 2, 3], ['X', 'Y', 'Z'], colors)</code>. 글자는 <code>cv.putText(img, name, (x + 5, y - 5), cv.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)</code>, 원점은 <code>cv.circle(img, o, 8, (255, 255, 255), -1)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

img = cv.imread('left06.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
ok, rvec, tvec = cv.solvePnP(objp, corners2, mtx, dist)

L = 4
pts3d = np.float32([[0, 0, 0], [L, 0, 0], [0, L, 0], [0, 0, -L]])
pts, _ = cv.projectPoints(pts3d, rvec, tvec, mtx, dist)
pts = np.int32(pts).reshape(-1, 2)
o = tuple(pts[0])
for k, name, color in zip([1, 2, 3], ['X', 'Y', 'Z'], [(255, 0, 0), (0, 255, 0), (0, 0, 255)]):
    x, y = pts[k]
    cv.line(img, o, (int(x), int(y)), color, 4)
    cv.putText(img, name, (int(x) + 5, int(y) - 5), cv.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
cv.circle(img, o, 8, (255, 255, 255), -1)
cv.imshow('axes with labels', img)
`,
      },
      {
        title: '실습 2 · 큐브 대신 피라미드 세우기',
        desc: `<p><code>left14.jpg</code> 의 보드 위에 <b>밑면 4×4 칸, 높이 4칸</b>인 사각뿔(피라미드)을 그리세요. 밑면은 (0,0,0)~(4,4,0) 정사각형, 꼭대기는 밑면 중심 위 (2, 2, −4) 입니다. 밑면은 반투명 노랑으로 채우고, 꼭대기와 네 꼭짓점을 잇는 모서리는 빨간 선으로 그립니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

img = cv.imread('left14.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
ok, rvec, tvec = cv.solvePnP(objp, corners2, mtx, dist)

# TODO: 밑면 4점 + 꼭대기 1점 (총 5점) 으로 바꾸기
pyramid = np.float32([[0, 0, 0], [4, 0, 0], [4, 4, 0], [0, 4, 0]])
pts, _ = cv.projectPoints(pyramid, rvec, tvec, mtx, dist)
pts = np.int32(pts).reshape(-1, 2)

cv.polylines(img, [pts[:4]], True, (0, 255, 255), 2)       # 밑면 테두리
# TODO: 밑면을 반투명 노랑으로 채우기 (overlay + addWeighted)
# TODO: 꼭대기(pts[4])와 밑면 네 점을 빨간 선으로 잇기
cv.imshow('pyramid', img)
`,
        hint: `<p>꼭대기를 추가: <code>[2, 2, -4]</code>. 채우기는 <code>overlay = img.copy(); cv.fillConvexPoly(overlay, pts[:4], (0, 255, 255)); img = cv.addWeighted(overlay, 0.4, img, 0.6, 0)</code>. 모서리는 <code>for i in range(4): cv.line(img, tuple(pts[4]), tuple(pts[i]), (0, 0, 255), 3)</code>. 선은 채우기 <b>뒤에</b> 그려야 흐려지지 않습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)

img = cv.imread('left14.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
ok, rvec, tvec = cv.solvePnP(objp, corners2, mtx, dist)

pyramid = np.float32([[0, 0, 0], [4, 0, 0], [4, 4, 0], [0, 4, 0], [2, 2, -4]])
pts, _ = cv.projectPoints(pyramid, rvec, tvec, mtx, dist)
pts = np.int32(pts).reshape(-1, 2)

overlay = img.copy()
cv.fillConvexPoly(overlay, pts[:4], (0, 255, 255))
img = cv.addWeighted(overlay, 0.4, img, 0.6, 0)
cv.polylines(img, [pts[:4]], True, (0, 255, 255), 2)
for i in range(4):
    cv.line(img, tuple(pts[4]), tuple(pts[i]), (0, 0, 255), 3)
cv.circle(img, tuple(pts[4]), 6, (255, 255, 255), -1)
cv.imshow('pyramid', img)
`,
      },
      {
        title: '실습 3 · 보드까지의 실제 거리(cm) 재기',
        desc: `<p>체스보드 한 칸이 <b>2.5 cm</b> 라고 가정합니다. objp 를 <b>cm 단위</b>로 만들어 6장(left01, 02, 03, 06, 12, 14)의 자세를 구하고, 사진마다 <b>카메라에서 보드 원점까지의 직선 거리</b>(tvec 의 길이)를 cm 로 사진 위에 써서 갤러리로 보여 주세요. 가장 가까운 사진의 이름도 출력합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
SQUARE_CM = 2.5
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
# TODO: objp 를 cm 단위로 바꾸기

tiles, dists = [], {}
for fname in ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left12.jpg', 'left14.jpg']:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    if ret:
        corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        ok, rvec, tvec = cv.solvePnP(objp, corners2, mtx, dist)
        d = 0.0                                   # TODO: tvec 의 길이 (np.linalg.norm)
        dists[fname] = d
        cv.drawFrameAxes(img, mtx, dist, rvec, tvec, 3 * SQUARE_CM, 3)
        cv.putText(img, '%.1f cm' % d, (10, 60), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)
    tiles.append(cv.resize(img, (320, 240)))

print(dists)
cv.imshow('distance', np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])]))
`,
        hint: `<p><code>objp *= SQUARE_CM</code> 한 줄이면 tvec 도 cm 단위가 됩니다. 거리는 <code>float(np.linalg.norm(tvec))</code>. 가장 가까운 사진: <code>min(dists, key=dists.get)</code>. drawFrameAxes 의 축 길이도 같은 단위라서 <code>3 * SQUARE_CM</code> 으로 주었습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

mtx = np.array([[534.16, 0, 341.71], [0, 534.25, 232.05], [0, 0, 1]])
dist = np.array([[-0.2943, 0.1232, 0.0011, -0.0001, 0.0102]])
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
SQUARE_CM = 2.5
objp = np.zeros((6 * 7, 3), np.float32)
objp[:, :2] = np.mgrid[0:7, 0:6].T.reshape(-1, 2)
objp *= SQUARE_CM                                   # 칸 → cm

tiles, dists = [], {}
for fname in ['left01.jpg', 'left02.jpg', 'left03.jpg', 'left06.jpg', 'left12.jpg', 'left14.jpg']:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, corners = cv.findChessboardCorners(gray, (7, 6), None)
    if ret:
        corners2 = cv.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        ok, rvec, tvec = cv.solvePnP(objp, corners2, mtx, dist)
        d = float(np.linalg.norm(tvec))
        dists[fname] = d
        cv.drawFrameAxes(img, mtx, dist, rvec, tvec, 3 * SQUARE_CM, 3)
        cv.putText(img, '%.1f cm' % d, (10, 60), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)
    tiles.append(cv.resize(img, (320, 240)))

for k, v in dists.items():
    print(f'{k}: {v:.1f} cm')
print('가장 가까운 사진:', min(dists, key=dists.get))
cv.imshow('distance', np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])]))
`,
      },
    ],
    quiz: [
      { q: 'cv.solvePnP 를 쓰기 위해 반드시 미리 알아야 하는 것은?', options: ['여러 장의 사진', '카메라 행렬과 왜곡 계수', '물체의 색', '스테레오 카메라 간격'], answer: 1, explain: 'PnP 는 3D 점 · 2D 점 대응과 카메라 내부 파라미터(K, dist)로 한 장의 자세(R, t)를 구합니다. K 는 캘리브레이션으로 미리 구해 둡니다.' },
      { q: 'solvePnP 가 돌려준 tvec = [2.0, −4.0, 12.9] (objp 단위: 칸) 의 뜻은?', options: ['카메라가 보드 원점에서 12.9칸 위에 있다', '보드 원점이 카메라 좌표계에서 (2, −4, 12.9) 칸 위치, 즉 카메라 앞 약 12.9칸', '보드가 12.9도 회전했다', '재투영 오차가 12.9 픽셀이다'], answer: 1, explain: 'tvec 은 카메라 좌표계에서 본 보드 원점의 위치입니다. Z 가 카메라 앞 거리이고, 단위는 objp 단위를 따릅니다.' },
      { q: '튜토리얼에서 Z 축 끝점을 (0, 0, −3) 으로 정한 이유는?', options: ['OpenCV 가 음수만 받기 때문', '보드 면에 수직인 +Z 는 보드 뒤쪽이라, 카메라 쪽으로 튀어나오게 그리려고', 'Y 축과 구별하려고', '왜곡 계수가 음수라서'], answer: 1, explain: '보드 좌표계에서 X × Y = +Z 는 카메라 반대쪽(보드 뒤)을 향합니다. 보드 위로 솟아오르는 모습을 그리려면 −Z 를 씁니다.' },
      { q: '특징점 매칭으로 얻은 대응점 일부가 틀렸을 때 자세 추정에 알맞은 함수는?', options: ['cv.solvePnP', 'cv.solvePnPRansac', 'cv.calibrateCamera', 'cv.Rodrigues'], answer: 1, explain: 'solvePnPRansac 은 여러 점 조합으로 자세를 추정해 가장 많은 점이 동의하는 결과를 고르므로 outlier 에 강합니다.' },
    ],
  },
  // =====================================================================
  // a2-6 에피폴라 기하
  // =====================================================================
  {
    id: 'a2-6',
    assets: ['images/adv/left.jpg', 'images/adv/right.jpg'],
    summary: '같은 장면을 두 위치에서 찍은 사진 사이에 숨어 있는 기하 규칙(에피폴라 기하)을 배웁니다. OpenCV Epipolar Geometry 튜토리얼처럼 SIFT + FLANN 으로 대응점을 찾고, cv.findFundamentalMat 으로 기초 행렬 F 를 구한 뒤, cv.computeCorrespondEpilines 로 에피폴라 선을 그려 “대응점은 반드시 이 선 위에 있다”는 것을 확인합니다.',
    goals: [
      '한 장의 사진으로는 깊이를 알 수 없는 이유와 두 번째 시점이 주는 제약(에피폴라 선)을 설명할 수 있다',
      '에피폴, 에피폴라 선, 기초 행렬 F, 본질 행렬 E 의 의미를 구별할 수 있다',
      'SIFT + FLANN 비율 테스트로 대응점을 모으고 cv.findFundamentalMat(LMEDS / RANSAC)으로 F 와 inlier 를 구할 수 있다',
      'cv.computeCorrespondEpilines 로 에피폴라 선을 계산해 그리고, 점과 선 사이 거리로 매칭 품질을 판단할 수 있다',
    ],
    schedule: [['도입 · 한 장의 한계', 5], ['에피폴라 기하 개념', 12], ['F 구하기 · 에피폴라 선', 18], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 한 장으로는 깊이를 모른다</h3>
<p>a2-1 에서 사진 속 점 하나는 “카메라 중심에서 출발해 그 픽셀을 지나는 <b>광선(ray)</b> 위 어딘가”라는 것만 알려 준다는 것을 배웠습니다. 광선 위의 점 X, X₁, X₂ … 는 모두 같은 픽셀에 찍히므로 <b>거리(깊이)를 알 수 없습니다</b>.</p>
<p>이제 옆으로 조금 옮긴 두 번째 카메라로 같은 장면을 찍으면, 첫 번째 카메라의 광선이 두 번째 사진에서는 <b>한 줄의 선</b>으로 보입니다. 비유하면, 친구가 레이저 포인터로 어딘가를 가리킬 때 친구 눈에는 빛이 한 점이지만 <b>옆에 선 내 눈에는 빛줄기가 선</b>으로 보이는 것과 같습니다.
그래서 왼쪽 사진의 점 x 에 대응하는 오른쪽 사진의 점 x′ 은 <b>반드시 그 선 위</b>에 있습니다. 이 선이 <b>에피폴라 선(epiline)</b>이고, 대응점을 찾을 때 사진 전체가 아니라 <b>선 위만</b> 찾으면 된다는 강력한 제약(epipolar constraint)이 됩니다.</p>` },
      { type: 'table', head: ['용어', '뜻', '비유 · 특징'], rows: [
        ['에피폴라 평면', '두 카메라 중심 O, O′ 과 3D 점 X 가 이루는 평면', '점 X 마다 하나씩, 모두 O–O′ 직선을 축으로 회전한 평면들'],
        ['에피폴라 선 (epiline)', '에피폴라 평면이 사진과 만나는 선', '대응점은 반드시 이 선 위에 있음'],
        ['에피폴 (epipole)', '상대 카메라 중심이 사진에 찍히는 점', '모든 에피폴라 선이 모이는 점 (사진 밖에 있을 수도)'],
        ['기초 행렬 F (Fundamental)', '픽셀 좌표 사이의 규칙 x′ᵀ F x = 0', '3×3, 캘리브레이션 없이 대응점 8쌍 이상으로 구함'],
        ['본질 행렬 E (Essential)', '정규화 좌표 사이의 규칙, E = K′ᵀ F K', '카메라 사이 회전 · 이동(R, t)을 담고 있음'],
      ] },
      { type: 'text', html: `<h3>2. 기초 행렬 F 구하기: 먼저 대응점부터</h3>
<p>F 는 두 사진의 <b>대응점 쌍</b>에서 계산합니다(최소 7~8쌍, 정확도를 위해 많을수록 좋음). 튜토리얼은 1주차에 배운 <b>SIFT + FLANN + 비율 테스트(ratio 0.8)</b> 로 대응점을 모읍니다.
사용하는 사진 <code>left.jpg</code>, <code>right.jpg</code> 는 책상 위의 책들을 조금 다른 위치에서 찍은 쌍입니다(612×459).</p>` },
      { type: 'code', title: '예제 1 · SIFT + FLANN 으로 대응점 모으기 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)    # queryimage # left image
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)   # trainimage # right image

sift = cv.SIFT_create()
# SIFT 로 특징점과 기술자 찾기
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)

# FLANN 파라미터
FLANN_INDEX_KDTREE = 1
index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
search_params = dict(checks=50)
flann = cv.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(des1, des2, k=2)

pts1 = []
pts2 = []
good = []
# Lowe 의 비율 테스트
for i, (m, n) in enumerate(matches):
    if m.distance < 0.8 * n.distance:
        good.append(m)
        pts2.append(kp2[m.trainIdx].pt)
        pts1.append(kp1[m.queryIdx].pt)

print('특징점: 왼쪽 %d개, 오른쪽 %d개' % (len(kp1), len(kp2)))
print('비율 테스트 통과 대응점: %d쌍' % len(pts1))
vis = cv.drawMatches(img1, kp1, img2, kp2, good[:60], None,
                     flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
cv.imshow('good matches (first 60)', vis)
`, desc: '<p>수백 개의 특징점 중 비율 테스트를 통과한 대응점 160여 쌍이 남습니다. 연결선이 대부분 비슷한 방향으로 달리지만, 엉뚱한 곳을 잇는 선(잘못된 매칭)도 보입니다. 다음 단계의 LMEDS/RANSAC 이 이런 점을 걸러냅니다.</p>' },
      { type: 'text', html: `<h3>3. cv.findFundamentalMat</h3>
<pre>pts1 = np.int32(pts1)
pts2 = np.int32(pts2)
F, mask = cv.findFundamentalMat(pts1, pts2, cv.FM_LMEDS)
pts1 = pts1[mask.ravel() == 1]      # inlier 만 남기기
pts2 = pts2[mask.ravel() == 1]</pre>
<ul>
<li><b>F</b> : 3×3 기초 행렬. 왼쪽 점 x 와 오른쪽 점 x′ 이 대응이면 <b>x′ᵀ · F · x = 0</b> (x = [u, v, 1]).</li>
<li><b>mask</b> : 각 대응점이 F 와 잘 맞는(inlier) 점이면 1, 아니면 0.</li>
<li>방법: <code>cv.FM_8POINT</code>(모든 점 사용, outlier 에 약함), <code>cv.FM_LMEDS</code>(튜토리얼, 최소 중앙값), <code>cv.FM_RANSAC</code>(임계 거리 · 신뢰도 지정).</li>
<li>F · x 를 계산하면 오른쪽 사진의 선 <b>a·u + b·v + c = 0</b> 의 계수 (a, b, c) 가 나옵니다. 이것이 에피폴라 선입니다.</li>
</ul>
<p>튜토리얼은 좌표를 <code>np.int32</code> 로 바꿔 넣습니다. 정밀도를 조금 더 원하면 <code>np.float32</code> 로 넣어도 됩니다.</p>` },
      { type: 'code', title: '예제 2 · F 구하고 x′ᵀ F x ≈ 0 확인하기', code: String.raw`
import cv2 as cv
import numpy as np
np.set_printoptions(precision=6, suppress=True)

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
matches = flann.knnMatch(des1, des2, k=2)
pts1, pts2 = [], []
for m, n in matches:
    if m.distance < 0.8 * n.distance:
        pts1.append(kp1[m.queryIdx].pt)
        pts2.append(kp2[m.trainIdx].pt)

pts1 = np.int32(pts1)
pts2 = np.int32(pts2)
F, mask = cv.findFundamentalMat(pts1, pts2, cv.FM_LMEDS)
print('F =\n', F)
print('inlier %d / %d' % (mask.sum(), len(mask)))

# 점과 에피폴라 선 사이 거리(px): 오른쪽 점 x' 과, 왼쪽 점 x 로 만든 선 F·x
x1 = np.hstack([pts1, np.ones((len(pts1), 1))])          # [u, v, 1]
x2 = np.hstack([pts2, np.ones((len(pts2), 1))])
lines = x1 @ F.T                                          # 각 행 = (a, b, c)
dist = np.abs(np.sum(lines * x2, axis=1)) / np.sqrt(lines[:, 0] ** 2 + lines[:, 1] ** 2)
inl = mask.ravel() == 1
print("x'ᵀFx 값 (inlier 앞 5개):", np.sum(lines * x2, axis=1)[inl][:5].round(4))
print('선까지 거리 평균: inlier %.2f px / outlier %.1f px' % (dist[inl].mean(), dist[~inl].mean()))
`, desc: '<p>inlier 대응점은 <b>x′ᵀ F x</b> 가 거의 0 이고, 오른쪽 점이 에피폴라 선에서 평균 1 픽셀 안쪽에 있습니다. outlier 는 평균 수십 ~ 100 픽셀 가까이 떨어져 있어 “F 와 맞지 않는 잘못된 매칭”이라는 것이 드러납니다.</p>' },
      { type: 'text', html: `<h3>4. 에피폴라 선 그리기 (튜토리얼)</h3>
<p><code>cv.computeCorrespondEpilines(points, whichImage, F)</code> 는 한쪽 사진의 점들에 대응하는 <b>다른 쪽 사진의 선</b>을 (a, b, c) 로 돌려줍니다.</p>
<ul>
<li><code>whichImage = 1</code> : points 가 <b>왼쪽(1번)</b> 사진의 점 → 오른쪽 사진의 선</li>
<li><code>whichImage = 2</code> : points 가 <b>오른쪽(2번)</b> 사진의 점 → 왼쪽 사진의 선</li>
</ul>
<p>선 a·x + b·y + c = 0 을 그리려면 왼쪽 끝 x = 0 일 때 y = −c/b, 오른쪽 끝 x = 너비 W 일 때 y = −(c + a·W)/b 를 계산해 <code>cv.line</code> 으로 잇습니다(튜토리얼의 <code>drawlines</code>).</p>` },
      { type: 'code', title: '예제 3 · 두 사진에 에피폴라 선 그리기 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
matches = flann.knnMatch(des1, des2, k=2)
pts1, pts2 = [], []
for m, n in matches:
    if m.distance < 0.8 * n.distance:
        pts2.append(kp2[m.trainIdx].pt)
        pts1.append(kp1[m.queryIdx].pt)

pts1 = np.int32(pts1)
pts2 = np.int32(pts2)
F, mask = cv.findFundamentalMat(pts1, pts2, cv.FM_LMEDS)
# inlier 점만 선택
pts1 = pts1[mask.ravel() == 1]
pts2 = pts2[mask.ravel() == 1]

def drawlines(img1, img2, lines, pts1, pts2):
    ''' img1 - img2 의 점들에 대한 에피폴라 선을 그릴 이미지
        lines - 대응하는 에피폴라 선 '''
    r, c = img1.shape
    img1 = cv.cvtColor(img1, cv.COLOR_GRAY2BGR)
    img2 = cv.cvtColor(img2, cv.COLOR_GRAY2BGR)
    for r, pt1, pt2 in zip(lines, pts1, pts2):
        color = tuple(np.random.randint(0, 255, 3).tolist())
        x0, y0 = map(int, [0, -r[2] / r[1]])
        x1, y1 = map(int, [c, -(r[2] + r[0] * c) / r[1]])
        img1 = cv.line(img1, (x0, y0), (x1, y1), color, 1)
        img1 = cv.circle(img1, tuple(map(int, pt1)), 5, color, -1)
        img2 = cv.circle(img2, tuple(map(int, pt2)), 5, color, -1)
    return img1, img2

np.random.seed(0)
# 오른쪽 사진(두 번째)의 점에 대응하는 선을 왼쪽 사진에 그리기
lines1 = cv.computeCorrespondEpilines(pts2.reshape(-1, 1, 2), 2, F)
lines1 = lines1.reshape(-1, 3)
img5, img6 = drawlines(img1, img2, lines1, pts1, pts2)

# 왼쪽 사진(첫 번째)의 점에 대응하는 선을 오른쪽 사진에 그리기
lines2 = cv.computeCorrespondEpilines(pts1.reshape(-1, 1, 2), 1, F)
lines2 = lines2.reshape(-1, 3)
img3, img4 = drawlines(img2, img1, lines2, pts2, pts1)

plt.figure(figsize=(12, 5))
plt.subplot(121), plt.imshow(img5[:, :, ::-1]), plt.title('left + epilines')
plt.subplot(122), plt.imshow(img3[:, :, ::-1]), plt.title('right + epilines')
plt.show()
`, desc: '<p>각 점(동그라미)이 <b>같은 색의 선 위에</b> 정확히 놓여 있습니다. 오른쪽 사진의 선들은 모두 <b>왼쪽 바깥의 한 점</b>으로 모이고, 왼쪽 사진의 선들은 오른쪽 멀리서 모입니다. 그 모이는 점이 에피폴, 즉 “상대 카메라가 있는 방향”입니다. 튜토리얼 설명처럼 두 카메라 사이의 이동 방향을 알려 주는 단서입니다.</p>' },
      { type: 'tip', html: `<p><b>matplotlib 로 컬러 보기</b> : OpenCV 이미지는 BGR 이라 <code>img[:, :, ::-1]</code> 로 채널 순서를 뒤집어 RGB 로 바꾼 뒤 <code>plt.imshow</code> 에 넣습니다(<code>cv.cvtColor(img, cv.COLOR_BGR2RGB)</code> 와 같음). 선 색은 <code>np.random</code> 이라 실행할 때마다 달라지므로 <code>np.random.seed(0)</code> 으로 고정했습니다.</p>` },
      { type: 'text', html: `<h3>5. 에피폴 찾기: 선들이 모이는 점</h3>
<p>에피폴 e 는 “모든 에피폴라 선 위에 있는 점”이라 <b>F · e = 0</b> 을 만족합니다(오른쪽 사진의 에피폴 e′ 은 <b>Fᵀ · e′ = 0</b>). numpy 의 특이값 분해 <code>np.linalg.svd</code> 로 이런 e 를 구할 수 있습니다. 결과가 사진 크기 밖이면 에피폴이 사진 바깥에 있다는 뜻입니다. 오른쪽 사진의 에피폴은 왼쪽 가장자리 바로 바깥에 있으니, 캔버스를 넓혀 선들이 정말 한 점에 모이는지 확인해 봅시다.</p>` },
      { type: 'code', title: '예제 4 · 에피폴 계산하고 선이 모이는 모습 보기', code: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg')
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(cv.cvtColor(img2, cv.COLOR_BGR2GRAY), None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
pts1, pts2 = [], []
for m, n in flann.knnMatch(des1, des2, k=2):
    if m.distance < 0.8 * n.distance:
        pts1.append(kp1[m.queryIdx].pt)
        pts2.append(kp2[m.trainIdx].pt)
pts1, pts2 = np.int32(pts1), np.int32(pts2)
F, mask = cv.findFundamentalMat(pts1, pts2, cv.FM_LMEDS)
pts1 = pts1[mask.ravel() == 1]

# 에피폴: F e = 0 (왼쪽), F^T e' = 0 (오른쪽) → SVD 의 마지막 행
_, _, Vt = np.linalg.svd(F)
e1 = Vt[-1] / Vt[-1][2]
_, _, Vt = np.linalg.svd(F.T)
e2 = Vt[-1] / Vt[-1][2]
print('왼쪽 사진의 에피폴  (x, y) = (%.0f, %.0f)' % (e1[0], e1[1]))
print('오른쪽 사진의 에피폴 (x, y) = (%.0f, %.0f)' % (e2[0], e2[1]))

# 오른쪽 사진 왼쪽에 여백 200px 을 붙여 에피폴까지 보이게
pad = 200
h, w = img2.shape[:2]
canvas = cv.copyMakeBorder(img2, 60, 60, pad, 0, cv.BORDER_CONSTANT, value=(40, 40, 40))
lines = cv.computeCorrespondEpilines(pts1[::6].reshape(-1, 1, 2), 1, F).reshape(-1, 3)
rng = np.random.default_rng(1)
for a, b, c in lines:
    color = tuple(int(v) for v in rng.integers(60, 255, 3))
    xs = np.array([-pad, w])                                 # 원래 사진 좌표계의 x 범위
    ys = -(c + a * xs) / b
    cv.line(canvas, (int(xs[0]) + pad, int(ys[0]) + 60), (int(xs[1]) + pad, int(ys[1]) + 60), color, 1, cv.LINE_AA)
cv.circle(canvas, (int(e2[0]) + pad, int(e2[1]) + 60), 8, (0, 0, 255), -1)
cv.putText(canvas, 'epipole', (int(e2[0]) + pad + 10, int(e2[1]) + 55), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
cv.rectangle(canvas, (pad, 60), (pad + w - 1, 60 + h - 1), (0, 255, 255), 1)       # 원래 사진 영역
cv.imshow('epilines meet at the epipole', canvas)
`, desc: '<p>빨간 점(에피폴)은 오른쪽 사진의 왼쪽 가장자리 바로 바깥에 있고, 에피폴라 선이 모두 그곳으로 모입니다. 오른쪽 사진을 찍은 카메라에서 보면 “왼쪽 카메라가 그 방향에 있다”는 뜻입니다. 왼쪽 사진의 에피폴은 x ≈ 1300 으로 훨씬 멀리 있어 선들이 거의 나란하게 보였습니다.</p>' },
      { type: 'code', title: '예제 5 · 8POINT / LMEDS / RANSAC 비교', code: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
pts1, pts2 = [], []
for m, n in flann.knnMatch(des1, des2, k=2):
    if m.distance < 0.8 * n.distance:
        pts1.append(kp1[m.queryIdx].pt)
        pts2.append(kp2[m.trainIdx].pt)
pts1, pts2 = np.float32(pts1), np.float32(pts2)

def epi_dist(F, p1, p2):
    """오른쪽 점과 (왼쪽 점의) 에피폴라 선 사이 거리(px)"""
    l = cv.computeCorrespondEpilines(p1.reshape(-1, 1, 2), 1, F).reshape(-1, 3)
    return np.abs(l[:, 0] * p2[:, 0] + l[:, 1] * p2[:, 1] + l[:, 2])       # (a, b) 는 길이 1 로 정규화되어 나옴

print('방법      | inlier | 전체 점 평균 거리 | 1px 이내 점')
for name, method, args in [('8POINT', cv.FM_8POINT, ()), ('LMEDS', cv.FM_LMEDS, ()),
                           ('RANSAC', cv.FM_RANSAC, (1.0, 0.99))]:
    F, mask = cv.findFundamentalMat(pts1, pts2, method, *args)
    d = epi_dist(F, pts1, pts2)
    n_in = len(pts1) if mask is None else int(mask.sum())
    print(f'{name:8s}  | {n_in:4d}   | {d.mean():10.1f} px     | {(d < 1).sum():4d}')
`, desc: '<p><b>8POINT</b> 는 모든 점(틀린 매칭 포함)을 믿고 F 를 구해 1픽셀 안에 드는 점이 적습니다. <b>LMEDS · RANSAC</b> 은 틀린 점을 무시하고 구해서 훨씬 많은 점이 선 위에 딱 맞습니다. RANSAC 의 1.0 은 “선에서 1픽셀 이내면 inlier”, 0.99 는 신뢰도입니다. 대응점에 잘못된 매칭이 섞이는 실제 상황에서는 LMEDS 나 RANSAC 을 쓰세요.</p>' },
      { type: 'text', html: `<h3>6. 클릭한 점의 에피폴라 선 보기</h3>
<p>에피폴라 제약을 직접 체험해 봅시다. 왼쪽 사진의 아무 곳이나 클릭하면 그 점에 대응하는 오른쪽 사진의 에피폴라 선이 그려집니다. 오른쪽 사진에서 “같은 물체의 같은 부분”이 <b>정말 그 선 위에 있는지</b> 눈으로 확인해 보세요. F 는 코드 시작 부분에서 한 번만 구합니다(실행에 약 1~2초).</p>` },
      { type: 'code', title: '예제 6 · 마우스로 클릭한 점의 에피폴라 선 그리기', code: String.raw`
import cv2 as cv
import numpy as np

left = cv.imread('left.jpg')
right = cv.imread('right.jpg')
g1 = cv.cvtColor(left, cv.COLOR_BGR2GRAY)
g2 = cv.cvtColor(right, cv.COLOR_BGR2GRAY)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(g1, None)
kp2, des2 = sift.detectAndCompute(g2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
pts1, pts2 = [], []
for m, n in flann.knnMatch(des1, des2, k=2):
    if m.distance < 0.8 * n.distance:
        pts1.append(kp1[m.queryIdx].pt)
        pts2.append(kp2[m.trainIdx].pt)
F, mask = cv.findFundamentalMat(np.float32(pts1), np.float32(pts2), cv.FM_LMEDS)
print('F 준비 완료 (inlier %d). 왼쪽 사진을 클릭하세요. 오른쪽 버튼 = 지우기' % mask.sum())

h, w = left.shape[:2]
canvas = np.hstack([left, right])
colors = [(0, 0, 255), (0, 200, 0), (255, 0, 0), (0, 200, 255), (255, 0, 255), (255, 255, 0)]
count = [0]

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN and x < w:
        color = colors[count[0] % len(colors)]
        count[0] += 1
        a, b, c = cv.computeCorrespondEpilines(np.float32([[[x, y]]]), 1, F).reshape(3)
        y0, y1 = -c / b, -(c + a * w) / b
        cv.circle(canvas, (x, y), 6, color, -1)
        cv.line(canvas, (w, int(y0)), (2 * w, int(y1)), color, 2, cv.LINE_AA)    # 오른쪽 절반에 그리기
    elif event == cv.EVENT_RBUTTONDOWN:
        canvas[:] = np.hstack([left, right])                                     # 제자리에서 지우기

cv.imshow('click left image', canvas)
cv.setMouseCallback('click left image', on_mouse)
`, desc: '<p>왼쪽 책 모서리를 클릭하면 오른쪽 사진의 같은 책 모서리를 지나는 선이 나타납니다. 스테레오 매칭 알고리즘은 이 성질을 이용해 대응점을 <b>선 위에서만</b> 찾습니다. 다음 교시의 스테레오 깊이 맵은 이 선들이 모두 <b>가로로 나란하도록</b> 사진을 정렬(rectification)해 두고, 같은 행에서만 대응점을 찾습니다.</p>' },
      { type: 'warn', html: `<p><b>자주 하는 실수</b></p>
<ul>
<li><code>computeCorrespondEpilines</code> 의 두 번째 인자(1 또는 2)는 “<b>점이 어느 사진의 점인지</b>”입니다. 선이 그려질 사진이 아닙니다.</li>
<li>F 는 <b>점의 순서</b>에 따라 달라집니다. <code>findFundamentalMat(pts1, pts2)</code> 로 구했다면 pts1 이 1번(왼쪽) 사진입니다.</li>
<li>대응점이 모두 한 평면(예: 벽 하나) 위에 있거나 두 카메라 위치가 같으면(회전만) F 를 안정적으로 구할 수 없습니다. 깊이가 다양한 장면을 옆으로 이동하며 찍어야 합니다.</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 비율 테스트 기준에 따른 대응점 · inlier 변화',
        desc: `<p>SIFT + FLANN 매칭에서 비율 테스트 기준을 <b>0.5, 0.6, 0.7, 0.8, 0.9</b> 로 바꿔 가며 ① 통과한 대응점 수 ② LMEDS inlier 수 ③ inlier 비율(%)을 표로 출력하세요. SIFT 와 knnMatch 는 <b>한 번만</b> 계산하고 비율 기준만 반복해서 바꿉니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
matches = flann.knnMatch(des1, des2, k=2)            # 한 번만 계산

print('ratio | matches | inliers | inlier %')
for ratio in [0.8]:                                  # TODO: [0.5, 0.6, 0.7, 0.8, 0.9]
    pts1, pts2 = [], []
    for m, n in matches:
        if m.distance < ratio * n.distance:
            pts1.append(kp1[m.queryIdx].pt)
            pts2.append(kp2[m.trainIdx].pt)
    # TODO: 점이 8개 이상이면 findFundamentalMat(LMEDS) 로 inlier 수 구하기
    inliers = 0
    print(f'{ratio:.1f}   | {len(pts1):5d}   | {inliers:5d}   |')
`,
        hint: `<p><code>F, mask = cv.findFundamentalMat(np.float32(pts1), np.float32(pts2), cv.FM_LMEDS)</code>, <code>inliers = int(mask.sum())</code>. 점이 8개보다 적으면 F 를 구할 수 없으니 <code>if len(pts1) &gt;= 8:</code> 로 감싸세요. 기준이 엄격할수록(작을수록) 대응점 수는 줄지만 inlier 비율은 높아집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
matches = flann.knnMatch(des1, des2, k=2)

print('ratio | matches | inliers | inlier %')
for ratio in [0.5, 0.6, 0.7, 0.8, 0.9]:
    pts1, pts2 = [], []
    for m, n in matches:
        if m.distance < ratio * n.distance:
            pts1.append(kp1[m.queryIdx].pt)
            pts2.append(kp2[m.trainIdx].pt)
    inliers = 0
    if len(pts1) >= 8:
        F, mask = cv.findFundamentalMat(np.float32(pts1), np.float32(pts2), cv.FM_LMEDS)
        if mask is not None:
            inliers = int(mask.sum())
    pct = 100.0 * inliers / max(len(pts1), 1)
    print(f'{ratio:.1f}   | {len(pts1):5d}   | {inliers:5d}   | {pct:5.1f}')
`,
      },
      {
        title: '실습 2 · SIFT 대신 ORB 로 에피폴라 선 그리기',
        desc: `<p>1주차에 배운 <b>ORB</b>(nfeatures=2000) + <b>BFMatcher(NORM_HAMMING)</b> + knnMatch 비율 테스트(0.75)로 대응점을 모으고, <b>RANSAC</b>(1.0, 0.99)으로 F 를 구해 오른쪽 사진에 inlier 20개의 에피폴라 선을 그려 보세요. SIFT 결과(예제 3)와 선의 모양 · 에피폴 방향이 비슷한지 비교합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)

# TODO: ORB 로 특징점 · 기술자 계산 (nfeatures=2000)
orb = cv.ORB_create(nfeatures=2000)
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)
print('ORB 특징점', len(kp1), len(kp2))

# TODO: BFMatcher(cv.NORM_HAMMING) knnMatch(k=2) + 비율 테스트 0.75 로 pts1, pts2 모으기
pts1, pts2 = [], []

# TODO: 8쌍 이상이면 findFundamentalMat(RANSAC, 1.0, 0.99) → inlier 20개의 선을 오른쪽 사진에 그리기
vis = cv.cvtColor(img2, cv.COLOR_GRAY2BGR)
cv.imshow('ORB epilines on right', vis)
`,
        hint: `<p><code>bf = cv.BFMatcher(cv.NORM_HAMMING)</code>, <code>for pair in bf.knnMatch(des1, des2, k=2):</code> 에서 이웃이 2개 미만일 수 있으니 <code>if len(pair) == 2</code> 를 확인하세요. 선은 <code>cv.computeCorrespondEpilines(p1.reshape(-1, 1, 2), 1, F)</code> → 각 (a, b, c) 에 대해 x = 0, x = w 의 y 를 계산해 <code>cv.line</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)

orb = cv.ORB_create(nfeatures=2000)
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)
print('ORB 특징점', len(kp1), len(kp2))

bf = cv.BFMatcher(cv.NORM_HAMMING)
pts1, pts2 = [], []
for pair in bf.knnMatch(des1, des2, k=2):
    if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance:
        pts1.append(kp1[pair[0].queryIdx].pt)
        pts2.append(kp2[pair[0].trainIdx].pt)
print('대응점', len(pts1))

vis = cv.cvtColor(img2, cv.COLOR_GRAY2BGR)
if len(pts1) >= 8:
    p1, p2 = np.float32(pts1), np.float32(pts2)
    F, mask = cv.findFundamentalMat(p1, p2, cv.FM_RANSAC, 1.0, 0.99)
    inl = mask.ravel() == 1
    print('RANSAC inlier', int(inl.sum()))
    p1, p2 = p1[inl][:20], p2[inl][:20]
    lines = cv.computeCorrespondEpilines(p1.reshape(-1, 1, 2), 1, F).reshape(-1, 3)
    w = vis.shape[1]
    rng = np.random.default_rng(0)
    for (a, b, c), q in zip(lines, p2):
        color = tuple(int(v) for v in rng.integers(0, 255, 3))
        cv.line(vis, (0, int(-c / b)), (w, int(-(c + a * w) / b)), color, 1, cv.LINE_AA)
        cv.circle(vis, (int(q[0]), int(q[1])), 5, color, -1)
cv.imshow('ORB epilines on right', vis)
`,
      },
      {
        title: '실습 3 · 에피폴라 거리로 잘못된 매칭 걸러내기',
        desc: `<p>대응점마다 “오른쪽 점과 에피폴라 선 사이 거리”를 구해 <b>1.5 px 이하는 초록, 그보다 크면 빨강</b>으로 <code>cv.drawMatches</code> 의 <code>matchColor</code> 를 달리해 그리세요. 시작 코드는 모든 매칭을 한 색으로 그립니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
good = [m for m, n in flann.knnMatch(des1, des2, k=2) if m.distance < 0.8 * n.distance]
p1 = np.float32([kp1[m.queryIdx].pt for m in good])
p2 = np.float32([kp2[m.trainIdx].pt for m in good])
F, mask = cv.findFundamentalMat(p1, p2, cv.FM_LMEDS)

# TODO: computeCorrespondEpilines 로 p1 의 선을 구하고, p2 와의 거리 d 계산
d = np.zeros(len(good))
ok = [m for m, di in zip(good, d) if di <= 1.5]
bad = [m for m, di in zip(good, d) if di > 1.5]
print('통과 %d / 탈락 %d' % (len(ok), len(bad)))

vis = cv.drawMatches(img1, kp1, img2, kp2, good, None, matchColor=(255, 200, 0),
                     flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
# TODO: ok 는 초록, bad 는 빨강으로 두 번 나눠 그리기 (두 번째는 outImg=vis, flags 에 DRAW_OVER_OUTIMG 추가)
cv.imshow('epipolar filter', vis)
`,
        hint: `<p><code>l = cv.computeCorrespondEpilines(p1.reshape(-1, 1, 2), 1, F).reshape(-1, 3)</code>, <code>d = np.abs(l[:, 0] * p2[:, 0] + l[:, 1] * p2[:, 1] + l[:, 2])</code> ((a, b) 가 정규화되어 있어 나눌 필요 없음). 겹쳐 그리기: <code>cv.drawMatches(img1, kp1, img2, kp2, bad, vis, matchColor=(0, 0, 255), flags=cv.DrawMatchesFlags_DRAW_OVER_OUTIMG | cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img1 = cv.imread('left.jpg', cv.IMREAD_GRAYSCALE)
img2 = cv.imread('right.jpg', cv.IMREAD_GRAYSCALE)
sift = cv.SIFT_create()
kp1, des1 = sift.detectAndCompute(img1, None)
kp2, des2 = sift.detectAndCompute(img2, None)
flann = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
good = [m for m, n in flann.knnMatch(des1, des2, k=2) if m.distance < 0.8 * n.distance]
p1 = np.float32([kp1[m.queryIdx].pt for m in good])
p2 = np.float32([kp2[m.trainIdx].pt for m in good])
F, mask = cv.findFundamentalMat(p1, p2, cv.FM_LMEDS)

l = cv.computeCorrespondEpilines(p1.reshape(-1, 1, 2), 1, F).reshape(-1, 3)
d = np.abs(l[:, 0] * p2[:, 0] + l[:, 1] * p2[:, 1] + l[:, 2])
ok = [m for m, di in zip(good, d) if di <= 1.5]
bad = [m for m, di in zip(good, d) if di > 1.5]
print('통과 %d / 탈락 %d' % (len(ok), len(bad)))

flags = cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
vis = cv.drawMatches(img1, kp1, img2, kp2, ok, None, matchColor=(0, 255, 0), flags=flags)
vis = cv.drawMatches(img1, kp1, img2, kp2, bad, vis, matchColor=(0, 0, 255),
                     flags=flags | cv.DrawMatchesFlags_DRAW_OVER_OUTIMG)
cv.imshow('epipolar filter', vis)
`,
      },
    ],
    quiz: [
      { q: '왼쪽 사진의 점 x 에 대응하는 오른쪽 사진의 점 x′ 에 대해 옳은 것은?', options: ['x′ 은 x 와 같은 좌표에 있다', "x′ 은 x 로 정해지는 오른쪽 사진의 에피폴라 선 위에 있다", 'x′ 은 오른쪽 사진의 에피폴에 있다', 'x′ 은 사진 어디든 있을 수 있어 제약이 없다'], answer: 1, explain: '대응점은 에피폴라 선 위에 있어야 합니다(에피폴라 제약). 그래서 대응점 탐색을 2D 전체가 아닌 1D 선 위로 줄일 수 있습니다.' },
      { q: '에피폴(epipole)에 대한 설명으로 옳은 것은?', options: ['사진의 정중앙 점', '상대 카메라 중심이 사진에 투영된 점으로, 모든 에피폴라 선이 지나는 점', '가장 밝은 특징점', '기초 행렬의 첫 번째 원소'], answer: 1, explain: '에피폴은 다른 카메라의 중심이 찍히는 위치이며 모든 에피폴라 선이 모입니다. 사진 바깥에 있을 수도 있습니다.' },
      { q: '기초 행렬 F 와 본질 행렬 E 의 차이로 옳은 것은?', options: ['F 는 캘리브레이션 없이 픽셀 좌표로 구할 수 있고, E 는 카메라 행렬 K 로 정규화한 좌표 기준이다', 'E 는 3×3, F 는 4×4 이다', 'F 는 한 장, E 는 두 장의 사진이 필요하다', '둘은 완전히 같다'], answer: 0, explain: 'F 는 픽셀 좌표 사이의 관계(x′ᵀFx = 0), E 는 정규화 좌표 사이의 관계이며 E = K′ᵀ F K 입니다. E 에서 두 카메라의 R, t 를 꺼낼 수 있습니다.' },
      { q: 'cv.computeCorrespondEpilines(pts2, 2, F) 가 돌려주는 선은 어느 사진에 그려야 하나?', options: ['2번(오른쪽) 사진', '1번(왼쪽) 사진', '두 사진 모두', '어느 사진도 아님'], answer: 1, explain: '두 번째 인자는 점이 속한 사진 번호입니다. 2번 사진의 점에 대응하는 선은 1번(왼쪽) 사진 위의 선입니다.' },
      { q: '잘못된 매칭이 섞인 대응점으로 F 를 구할 때 가장 부적절한 방법은?', options: ['cv.FM_LMEDS', 'cv.FM_RANSAC', 'cv.FM_8POINT', '비율 테스트로 먼저 거르고 RANSAC 사용'], answer: 2, explain: 'FM_8POINT 는 모든 점을 사용해 outlier 에 약합니다. LMEDS 나 RANSAC 이 틀린 매칭을 무시하고 F 를 구합니다.' },
    ],
  },
  // =====================================================================
  // a2-7 스테레오 깊이 맵
  // =====================================================================
  {
    id: 'a2-7',
    assets: ['images/adv/tsukuba_l.png', 'images/adv/tsukuba_r.png', 'images/adv/aloeL.jpg', 'images/adv/aloeR.jpg'],
    summary: '두 눈으로 거리를 느끼는 원리(시차)를 이용해 나란한 두 사진에서 깊이 맵을 만듭니다. OpenCV Depth Map 튜토리얼처럼 Tsukuba 사진에 cv.StereoBM 을 적용하고, cv.StereoSGBM 과 비교하며, 컬러맵으로 시각화하고 트랙바로 numDisparities · blockSize 를 조절해 봅니다. 시차를 실제 거리로 바꾸는 식 Z = f·B/d 도 계산합니다.',
    goals: [
      '시차(disparity)와 깊이의 관계 Z = f·B/d 를 설명하고 계산할 수 있다',
      '스테레오 매칭이 “정렬된 두 사진의 같은 행에서 블록을 비교”하는 것임을 에피폴라 기하와 연결해 설명할 수 있다',
      'cv.StereoBM_create 와 cv.StereoSGBM_create 로 시차 맵을 구하고, 결과가 16배 고정소수점(int16)임을 알고 변환할 수 있다',
      'numDisparities · blockSize 등 파라미터가 결과에 주는 영향을 트랙바로 확인하고 컬러맵으로 시각화할 수 있다',
    ],
    schedule: [['도입 · 두 눈과 시차', 7], ['StereoBM (튜토리얼)', 13], ['SGBM · 파라미터 · 깊이', 15], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 두 눈이 거리를 아는 방법: 시차</h3>
<p>손가락 하나를 눈앞에 세우고 왼쪽 눈, 오른쪽 눈을 번갈아 감아 보세요. 손가락이 좌우로 <b>크게 점프</b>하지만, 멀리 있는 창문은 거의 움직이지 않습니다. 두 눈(두 카메라)에서 본 위치 차이를 <b>시차(disparity)</b>라고 하며, <b>가까울수록 시차가 크고 멀수록 작습니다</b>. 뇌는 이 차이로 거리를 느낍니다.</p>
<p>두 카메라가 같은 방향을 보며 옆으로 <b>B</b>(기선, baseline)만큼 떨어져 있고 초점거리가 <b>f</b>(px)일 때, 3D 점이 왼쪽 사진의 x, 오른쪽 사진의 x′ 에 찍혔다면 닮은 삼각형으로</p>
<pre>  시차 d = x − x′            깊이 Z = f · B / d</pre>
<ul>
<li>d 가 2배면 Z 는 절반 → 시차 맵(disparity map)은 <b>밝을수록(시차가 클수록) 가까운</b> 영상입니다.</li>
<li>B 가 클수록(두 카메라가 멀수록) 같은 거리에서 시차가 커져 먼 곳까지 정밀하게 잴 수 있습니다.</li>
<li>d = 0 이면 무한히 먼 곳, d 를 못 찾으면 깊이도 모릅니다.</li>
</ul>` },
      { type: 'code', title: '예제 1 · 시차 → 깊이 계산해 보기', code: String.raw`
import numpy as np
from matplotlib import pyplot as plt

f = 700.0      # 초점거리 (px) — 가정한 값
B = 0.12       # 두 카메라 사이 거리 12 cm — 가정한 값

print('시차 d(px) | 깊이 Z(m)')
for d in [84, 42, 21, 10, 5, 2, 1]:
    print(f'{d:8d}   | {f * B / d:7.2f}')

# 시차가 1 px 틀리면 깊이는 얼마나 틀릴까?
for Z in [1.0, 5.0, 20.0]:
    d = f * B / Z
    dZ = f * B / (d - 1) - Z
    print(f'Z={Z:4.1f} m 에서 시차 {d:.1f} px → 1 px 오차면 깊이 오차 {dZ:.2f} m')

d = np.linspace(1, 100, 200)
plt.figure(figsize=(6, 3.5))
plt.plot(d, f * B / d)
plt.xlabel('disparity d (px)')
plt.ylabel('depth Z (m)')
plt.title('Z = f * B / d   (f=700 px, B=0.12 m)')
plt.ylim(0, 20)
plt.grid(True)
plt.show()
`, desc: '<p>가까운 곳(시차 큼)은 시차 1 px 오차가 깊이에 거의 영향이 없지만, 먼 곳(시차 작음)은 1 px 만 틀려도 깊이가 수 m 씩 틀립니다. 스테레오 카메라가 <b>가까운 거리에서 정확하고 먼 거리에서 부정확</b>한 이유입니다.</p>' },
      { type: 'text', html: `<h3>2. 정렬(rectified)된 스테레오 사진</h3>
<p>지난 교시에 대응점은 <b>에피폴라 선 위</b>에 있다는 것을 배웠습니다. 두 카메라를 정확히 나란히 두거나 <b>스테레오 정렬(rectification)</b>로 사진을 변환해 두면 모든 에피폴라 선이 <b>가로로 나란하고 같은 높이</b>가 됩니다. 그러면 왼쪽 사진 (x, y) 의 대응점은 오른쪽 사진의 <b>같은 행 y</b> 에서 x 보다 왼쪽에만 찾으면 됩니다.</p>
<p>튜토리얼의 <b>Tsukuba</b> 사진(384×288)은 이미 정렬된 연구용 스테레오 쌍입니다. 두 사진을 빨강 · 청록으로 겹쳐(3D 안경용 애너글리프) 가로 방향으로만 어긋나 있는지 확인해 봅시다.</p>` },
      { type: 'code', title: '예제 2 · Tsukuba 두 사진 겹쳐 보기 (가로로만 어긋남)', code: String.raw`
import cv2 as cv
import numpy as np

imgL = cv.imread('tsukuba_l.png', cv.IMREAD_GRAYSCALE)
imgR = cv.imread('tsukuba_r.png', cv.IMREAD_GRAYSCALE)
print('크기:', imgL.shape)

# 빨강 = 왼쪽 사진, 청록(초록+파랑) = 오른쪽 사진
anaglyph = cv.merge([imgR, imgR, imgL])          # BGR 순서

# 나란히 놓고 같은 높이에 가로선 긋기
pair = cv.cvtColor(np.hstack([imgL, imgR]), cv.COLOR_GRAY2BGR)
for y in range(20, pair.shape[0], 40):
    cv.line(pair, (0, y), (pair.shape[1], y), (0, 255, 0), 1)

cv.imshow('anaglyph (red=left, cyan=right)', anaglyph)
cv.imshow('same rows', pair)
`, desc: '<p>겹친 사진에서 가까운 <b>램프와 조각상 머리</b>는 빨강 · 청록이 크게 어긋나고, 뒤쪽 벽과 선반은 거의 겹칩니다. 초록 가로선을 따라가면 같은 물체가 같은 높이에 있어 <b>세로 어긋남이 없다</b>는 것도 확인됩니다. 이 “좌우 어긋남의 크기”를 픽셀마다 구한 것이 시차 맵입니다.</p>' },
      { type: 'text', html: `<h3>3. StereoBM: 블록 매칭 (튜토리얼)</h3>
<p><b>블록 매칭(Block Matching)</b>은 왼쪽 사진의 각 픽셀 주변 blockSize×blockSize 블록을 떼어, 오른쪽 사진 같은 행에서 0 ~ numDisparities−1 픽셀 왼쪽으로 옮겨 가며 가장 비슷한(차이가 가장 작은) 위치를 찾습니다. 그 이동량이 시차입니다.</p>
<ul>
<li><b>numDisparities</b> : 찾아볼 최대 시차 범위. <b>16 의 배수</b>여야 합니다. 가장 가까운 물체의 시차보다 커야 합니다.</li>
<li><b>blockSize</b> : 비교 블록 크기. <b>홀수</b>(5 ~ 255). 작으면 세밀하지만 잡음이 많고, 크면 매끈하지만 경계가 뭉개집니다.</li>
<li>입력은 <b>흑백</b> 8비트 두 장, 결과는 <b>int16</b> 이며 실제 시차의 <b>16배</b> 값입니다(소수점 4비트를 정수로 저장). 매칭 실패는 −16 (= (minDisparity − 1) × 16).</li>
</ul>` },
      { type: 'code', title: '예제 3 · 튜토리얼: StereoBM 으로 Tsukuba 시차 맵', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

imgL = cv.imread('tsukuba_l.png', cv.IMREAD_GRAYSCALE)
imgR = cv.imread('tsukuba_r.png', cv.IMREAD_GRAYSCALE)

stereo = cv.StereoBM_create(numDisparities=16, blockSize=15)
disparity = stereo.compute(imgL, imgR)

print('dtype:', disparity.dtype, ' min:', disparity.min(), ' max:', disparity.max())
print('실제 시차 범위: %.2f ~ %.2f px' % (disparity[disparity >= 0].min() / 16, disparity.max() / 16))
print('매칭 실패(-16) 픽셀 비율: %.1f%%' % (100 * (disparity < 0).mean()))

plt.imshow(disparity, 'gray')
plt.title('StereoBM numDisparities=16 blockSize=15')
plt.colorbar()
plt.show()
`, desc: '<p>튜토리얼 결과처럼 가까운 <b>램프 · 조각상 머리 · 아래 상자</b>가 밝고 뒤쪽 벽은 어둡게 나옵니다. 가장자리(특히 왼쪽 세로 띠)와 무늬가 적은 일부 영역은 검게(−16, 실패) 나옵니다. 왼쪽 띠는 오른쪽 사진에서 numDisparities 만큼 왼쪽을 볼 수 없어서, 무늬 없는 영역은 블록끼리 구별이 안 돼서 생깁니다. 튜토리얼도 “파라미터를 조절하면 더 좋아진다”고 말합니다.</p>' },
      { type: 'code', title: '예제 4 · 16 으로 나누고 컬러맵으로 보기 (실패 픽셀은 검게)', code: String.raw`
import numpy as np
import cv2 as cv

imgL = cv.imread('tsukuba_l.png', cv.IMREAD_GRAYSCALE)
imgR = cv.imread('tsukuba_r.png', cv.IMREAD_GRAYSCALE)
stereo = cv.StereoBM_create(numDisparities=16, blockSize=15)
disp = stereo.compute(imgL, imgR).astype(np.float32) / 16.0      # 실제 시차(px)

valid = disp >= 0                                                 # 매칭 성공 픽셀
disp_valid = np.where(valid, disp, 0)

# 0~255 로 정규화 → 컬러맵 (빨강 = 가까움, 파랑 = 멂)
norm = cv.normalize(disp_valid, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
color = cv.applyColorMap(norm, cv.COLORMAP_JET)
color[~valid] = 0                                                 # 실패 픽셀은 검정

left_color = cv.imread('tsukuba_l.png')
blend = cv.addWeighted(left_color, 0.5, color, 0.5, 0)
cv.imshow('disparity (JET)', color)
cv.imshow('overlay on left image', blend)
for name, (x, y) in [('lamp', (230, 140)), ('head', (150, 200)), ('back wall', (300, 40))]:
    print('%-9s (x=%d, y=%d) 시차 %.1f px' % (name, x, y, disp[y, x]))
`, desc: '<p>컬러맵을 쓰면 깊이 차이가 훨씬 잘 보입니다. 램프(약 14 px) → 머리(약 11 px) → 뒤 벽(약 5 px) 순으로 시차가 작아집니다. 결과 창에 마우스를 올려 색을 비교해 보세요. <code>cv.normalize</code> 전에 실패 픽셀(−1)을 0 으로 바꿔 두지 않으면 색 범위가 망가지니 주의하세요.</p>' },
      { type: 'text', html: `<h3>4. StereoSGBM: 더 매끄러운 준-전역 매칭</h3>
<p>BM 은 블록마다 따로 결정해서 무늬 없는 곳에 구멍이 많습니다. <b>SGBM(Semi-Global Block Matching)</b>은 “이웃한 픽셀은 시차가 비슷해야 한다”는 <b>매끄러움 벌점</b>을 여러 방향으로 함께 고려해 구멍이 적고 경계가 깔끔합니다. 대신 조금 느립니다(브라우저에서 Tsukuba 약 0.7초).</p>` },
      { type: 'table', head: ['파라미터', '의미', '권장 · 예'], rows: [
        ['<code>minDisparity</code>', '탐색 시작 시차', '보통 0'],
        ['<code>numDisparities</code>', '탐색 범위 (16 의 배수)', 'Tsukuba 16, Aloe 64~96'],
        ['<code>blockSize</code>', '블록 크기 (홀수, SGBM 은 작게)', '3 ~ 11'],
        ['<code>P1</code>, <code>P2</code>', '이웃 시차가 1 차이 / 크게 차이 날 때 벌점 (P2 &gt; P1)', '8·채널·bs², 32·채널·bs²'],
        ['<code>uniquenessRatio</code>', '1등이 2등보다 몇 % 더 좋아야 인정', '5 ~ 15'],
        ['<code>speckleWindowSize</code>, <code>speckleRange</code>', '작은 얼룩(잡음 덩어리) 제거', '50 ~ 200, 1 ~ 2(×16 이면 16 ~ 32)'],
      ] },
      { type: 'code', title: '예제 5 · StereoBM vs StereoSGBM 비교 (Tsukuba)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

imgL = cv.imread('tsukuba_l.png')
imgR = cv.imread('tsukuba_r.png')
grayL = cv.cvtColor(imgL, cv.COLOR_BGR2GRAY)
grayR = cv.cvtColor(imgR, cv.COLOR_BGR2GRAY)

bm = cv.StereoBM_create(numDisparities=16, blockSize=15)
d_bm = bm.compute(grayL, grayR).astype(np.float32) / 16

bs = 5
sgbm = cv.StereoSGBM_create(minDisparity=0, numDisparities=16, blockSize=bs,
                            P1=8 * 3 * bs * bs, P2=32 * 3 * bs * bs,
                            disp12MaxDiff=1, uniquenessRatio=10,
                            speckleWindowSize=100, speckleRange=32)
d_sg = sgbm.compute(imgL, imgR).astype(np.float32) / 16          # SGBM 은 컬러 입력도 가능

for name, d in [('BM', d_bm), ('SGBM', d_sg)]:
    print('%-4s 유효 픽셀 %.1f%%' % (name, 100 * (d >= 0).mean()))

plt.figure(figsize=(12, 4))
for i, (title, im) in enumerate([('left image', cv.cvtColor(imgL, cv.COLOR_BGR2RGB)),
                                 ('StereoBM', np.maximum(d_bm, 0)), ('StereoSGBM', np.maximum(d_sg, 0))]):
    plt.subplot(1, 3, i + 1)
    plt.imshow(im, cmap='jet' if i else None)
    plt.title(title)
    plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>SGBM 결과는 유효 픽셀이 약 81% → 94% 로 늘고, 테이블 · 벽처럼 무늬가 적은 영역도 매끄럽게 채워집니다. 램프 · 조각상 · 카메라의 윤곽도 더 또렷합니다. 실시간성이 중요하면 BM, 품질이 중요하면 SGBM 을 고릅니다.</p>' },
      { type: 'text', html: `<h3>5. 파라미터를 직접 움직여 보기 (Aloe)</h3>
<p>알로에 사진(640×555)은 가까운 잎과 먼 배경의 시차 차이가 커서 <b>numDisparities</b> 가 결과를 크게 좌우합니다. 트랙바로 <code>num x16</code>(1 → 16, 2 → 32 …)과 <code>blockSize</code> 를 바꿔 보세요. 결과 창의 검은 부분이 실패 픽셀입니다. (입력 소스와 관계없이 aloe 사진을 사용합니다.)</p>` },
      { type: 'code', title: '예제 6 · 트랙바로 StereoBM 파라미터 조절 (Aloe)', code: String.raw`
import numpy as np
import cv2 as cv

grayL = cv.imread('aloeL.jpg', cv.IMREAD_GRAYSCALE)
grayR = cv.imread('aloeR.jpg', cv.IMREAD_GRAYSCALE)

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('num x16', 'result', 1, 8, nothing)      # numDisparities = 값 × 16
cv.createTrackbar('blockSize', 'result', 15, 51, nothing)  # 홀수로 맞춰 사용

def process(frame):
    num = max(cv.getTrackbarPos('num x16', 'result'), 1) * 16
    bs = cv.getTrackbarPos('blockSize', 'result')
    bs = max(5, bs | 1)                                     # 홀수, 최소 5
    stereo = cv.StereoBM_create(numDisparities=num, blockSize=bs)
    disp = stereo.compute(grayL, grayR)
    valid = disp >= 0
    vis = cv.applyColorMap(cv.convertScaleAbs(disp, alpha=255.0 / (num * 16)), cv.COLORMAP_JET)
    vis[~valid] = 0
    cv.putText(vis, 'num=%d  block=%d  valid=%.0f%%' % (num, bs, 100 * valid.mean()), (10, 30),
               cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    return vis
`, desc: '<p>시작 값(num = 16)에서는 대부분이 검게 실패합니다. 알로에 잎의 시차가 16 px 보다 크기 때문입니다. num 을 4(=64) 로 올리면 잎과 화분이 나타나고, blockSize 를 줄이면 잎 가장자리가 세밀해지지만 잡음이 늘어납니다. <code>alpha=255/(num×16)</code> 로 시차 범위를 0~255 에 맞춰 색을 입혔습니다.</p>' },
      { type: 'text', html: `<h3>6. 시차 맵에서 거리 읽기</h3>
<p>시차 맵을 거리로 바꾸려면 두 카메라의 <b>f(px)</b> 와 <b>B</b> 를 알아야 합니다. 이 값은 스테레오 캘리브레이션(<code>cv.stereoCalibrate</code>)으로 구하는데, 샘플 사진에는 정보가 없으므로 아래 예제는 <b>f = 700 px, B = 0.12 m</b> 로 <b>가정</b>한 “예시 거리”를 보여 줍니다. 값의 절대 크기보다 <b>가까운 것과 먼 것의 비율</b>에 주목하세요. 결과 창을 클릭하면 그 점의 시차와 거리를 표시합니다.</p>` },
      { type: 'code', title: '예제 7 · Aloe SGBM 깊이 맵 + 클릭한 점의 거리 표시', code: String.raw`
import numpy as np
import cv2 as cv

imgL = cv.imread('aloeL.jpg')
imgR = cv.imread('aloeR.jpg')
f, B = 700.0, 0.12                                   # 가정한 초점거리(px) · 기선(m)

bs = 5
sgbm = cv.StereoSGBM_create(minDisparity=0, numDisparities=96, blockSize=bs,
                            P1=8 * 3 * bs * bs, P2=32 * 3 * bs * bs,
                            disp12MaxDiff=1, uniquenessRatio=10,
                            speckleWindowSize=100, speckleRange=32)
disp = sgbm.compute(imgL, imgR).astype(np.float32) / 16
valid = disp > 0
depth = np.zeros_like(disp)
depth[valid] = f * B / disp[valid]                  # Z = f·B/d

print('유효 픽셀 %.1f%%, 시차 범위 %.1f ~ %.1f px' % (100 * valid.mean(), disp[valid].min(), disp[valid].max()))
lo, hi = np.percentile(depth[valid], [5, 95])                 # 극단값(잡음) 5% 씩 제외
print('예시 거리 범위(5~95%%): %.2f ~ %.2f m' % (lo, hi))

vis = cv.applyColorMap(cv.convertScaleAbs(disp, alpha=255.0 / 96), cv.COLORMAP_JET)
vis[~valid] = 0
view = np.hstack([imgL, vis])
h, w = imgL.shape[:2]

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        xx = x % w                                   # 오른쪽(시차 맵)을 눌러도 같은 위치
        d = disp[y, xx]
        text = 'd=%.1f px  Z=%.2f m' % (d, f * B / d) if d > 0 else 'no match'
        for ox in (0, w):
            cv.circle(view, (xx + ox, y), 6, (255, 255, 255), -1)
            cv.putText(view, text, (xx + ox + 8, y - 8), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        print('(%d, %d): %s' % (xx, y, text))

cv.imshow('aloe depth (click)', view)
cv.setMouseCallback('aloe depth (click)', on_mouse)
`, desc: '<p>앞쪽 알로에 잎을 클릭하면 시차가 크고(거리 짧음), 뒤쪽 천을 클릭하면 시차가 작게(거리 김) 나옵니다. 스테레오 카메라(예: 로봇의 두 눈, 스마트폰 인물 모드)는 이 계산을 매 프레임 수행해 배경 흐림, 장애물 회피 등에 씁니다.</p>' },
      { type: 'warn', html: `<p><b>스테레오 매칭이 잘 안 되는 곳</b></p>
<ul>
<li><b>무늬 없는 면</b>(흰 벽, 하늘) : 어느 블록이나 비슷해 대응을 못 찾음</li>
<li><b>가려짐(occlusion)</b> : 한쪽 카메라에만 보이는 부분(물체 경계 옆)</li>
<li><b>반사 · 투명 · 반복 무늬</b> : 잘못된 위치와 매칭</li>
<li><b>정렬되지 않은 사진</b> : 같은 행에 대응점이 없으면 전부 실패 → 먼저 <code>cv.stereoRectify</code> / <code>cv.initUndistortRectifyMap</code> 으로 정렬</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · Aloe 에 맞는 numDisparities 찾기',
        desc: `<p>Aloe 사진에 StereoBM(blockSize = 15)을 적용하면서 numDisparities 를 <b>16, 32, 48, 64, 80, 96</b> 으로 바꿔 ① 유효 픽셀 비율 ② 찾은 최대 시차를 출력하고, 유효 비율이 가장 높은 값의 결과를 컬러맵으로 보여 주세요.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

grayL = cv.imread('aloeL.jpg', cv.IMREAD_GRAYSCALE)
grayR = cv.imread('aloeR.jpg', cv.IMREAD_GRAYSCALE)

best_num, best_valid, best_disp = 16, 0.0, None
for num in [16]:                                   # TODO: [16, 32, 48, 64, 80, 96]
    disp = cv.StereoBM_create(numDisparities=num, blockSize=15).compute(grayL, grayR)
    valid = 0.0                                    # TODO: disp >= 0 인 픽셀 비율
    max_d = disp.max() / 16
    print(f'num={num:3d}  valid={valid * 100:5.1f}%  max disparity={max_d:.1f}px')
    # TODO: valid 가 best_valid 보다 크면 best_* 갱신
    best_disp = disp

vis = cv.applyColorMap(cv.convertScaleAbs(best_disp, alpha=255.0 / (best_num * 16)), cv.COLORMAP_JET)
vis[best_disp < 0] = 0
cv.imshow('best num=%d' % best_num, vis)
`,
        hint: `<p><code>valid = (disp &gt;= 0).mean()</code>. 갱신은 <code>if valid &gt; best_valid: best_num, best_valid, best_disp = num, valid, disp</code> 이고, 반복 전에 <code>best_disp = disp</code> 줄은 지웁니다. 64 부근에서 가장 높고, 너무 크면 왼쪽 띠(탐색 불가 영역)가 넓어져 다시 줄어듭니다.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

grayL = cv.imread('aloeL.jpg', cv.IMREAD_GRAYSCALE)
grayR = cv.imread('aloeR.jpg', cv.IMREAD_GRAYSCALE)

best_num, best_valid, best_disp = 16, 0.0, None
for num in [16, 32, 48, 64, 80, 96]:
    disp = cv.StereoBM_create(numDisparities=num, blockSize=15).compute(grayL, grayR)
    valid = (disp >= 0).mean()
    max_d = disp.max() / 16
    print(f'num={num:3d}  valid={valid * 100:5.1f}%  max disparity={max_d:.1f}px')
    if valid > best_valid:
        best_num, best_valid, best_disp = num, valid, disp

print('가장 좋은 numDisparities:', best_num)
vis = cv.applyColorMap(cv.convertScaleAbs(best_disp, alpha=255.0 / (best_num * 16)), cv.COLORMAP_JET)
vis[best_disp < 0] = 0
cv.imshow('best num=%d' % best_num, vis)
`,
      },
      {
        title: '실습 2 · 가장 가까운 물체 찾아 표시하기',
        desc: `<p>Tsukuba 사진에서 SGBM 시차 맵을 구한 뒤, 유효 시차 중 <b>상위 10%</b>(가장 가까운 부분)를 마스크로 만들고, 가장 큰 덩어리(컨투어)를 왼쪽 사진 위에 <b>빨간 반투명</b>으로 칠하고 <b>외접 사각형</b>과 “NEAR” 글자를 표시하세요. 램프가 잡히면 성공입니다.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

imgL = cv.imread('tsukuba_l.png')
imgR = cv.imread('tsukuba_r.png')
bs = 5
sgbm = cv.StereoSGBM_create(minDisparity=0, numDisparities=16, blockSize=bs,
                            P1=8 * 3 * bs * bs, P2=32 * 3 * bs * bs, uniquenessRatio=10,
                            speckleWindowSize=100, speckleRange=32)
disp = sgbm.compute(imgL, imgR).astype(np.float32) / 16

valid = disp > 0
thr = 0.0            # TODO: np.percentile 로 유효 시차의 상위 10% 기준값 (90 번째 백분위수)
mask = ((disp >= thr) & valid).astype(np.uint8) * 255
print('기준 시차 %.1f px' % thr)

# TODO: 모폴로지 열기로 잡음 제거 → findContours → 가장 큰 컨투어
#       → 빨간 반투명 칠하기 + boundingRect + 'NEAR' 표시
out = imgL.copy()
cv.imshow('mask', mask)
cv.imshow('nearest object', out)
`,
        hint: `<p><code>thr = np.percentile(disp[valid], 90)</code>. 잡음 제거는 <code>cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((5, 5), np.uint8))</code>, 가장 큰 컨투어는 <code>max(contours, key=cv.contourArea)</code>. 반투명은 <code>overlay = out.copy(); cv.drawContours(overlay, [c], -1, (0, 0, 255), -1); out = cv.addWeighted(overlay, 0.5, out, 0.5, 0)</code>.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

imgL = cv.imread('tsukuba_l.png')
imgR = cv.imread('tsukuba_r.png')
bs = 5
sgbm = cv.StereoSGBM_create(minDisparity=0, numDisparities=16, blockSize=bs,
                            P1=8 * 3 * bs * bs, P2=32 * 3 * bs * bs, uniquenessRatio=10,
                            speckleWindowSize=100, speckleRange=32)
disp = sgbm.compute(imgL, imgR).astype(np.float32) / 16

valid = disp > 0
thr = np.percentile(disp[valid], 90)
mask = ((disp >= thr) & valid).astype(np.uint8) * 255
mask = cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((5, 5), np.uint8))
print('기준 시차 %.1f px' % thr)

out = imgL.copy()
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
if contours:
    c = max(contours, key=cv.contourArea)
    overlay = out.copy()
    cv.drawContours(overlay, [c], -1, (0, 0, 255), -1)
    out = cv.addWeighted(overlay, 0.5, out, 0.5, 0)
    x, y, w, h = cv.boundingRect(c)
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 255), 2)
    cv.putText(out, 'NEAR', (x, max(y - 6, 12)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    print('가장 가까운 덩어리: 위치 (%d, %d) 크기 %d×%d' % (x, y, w, h))
cv.imshow('mask', mask)
cv.imshow('nearest object', out)
`,
      },
    ],
    quiz: [
      { q: '같은 스테레오 카메라에서 물체 A 의 시차가 40 px, 물체 B 의 시차가 10 px 이다. 옳은 것은?', options: ['A 가 B 보다 4배 멀다', 'B 가 A 보다 4배 멀다', '둘은 같은 거리', '시차만으로는 비교할 수 없다'], answer: 1, explain: 'Z = f·B/d 이므로 시차가 1/4 인 B 가 4배 멉니다. 시차가 클수록 가깝습니다.' },
      { q: 'StereoBM 의 compute 결과 값이 160 이다. 실제 시차는?', options: ['160 px', '16 px', '10 px', '2.5 px'], answer: 2, explain: '결과는 16배 고정소수점(int16)이라 160 / 16 = 10 px 입니다.' },
      { q: 'StereoBM_create 의 파라미터로 올바른 조합은?', options: ['numDisparities=20, blockSize=15', 'numDisparities=16, blockSize=14', 'numDisparities=64, blockSize=21', 'numDisparities=64, blockSize=2'], answer: 2, explain: 'numDisparities 는 16 의 배수, blockSize 는 5 이상의 홀수여야 합니다.' },
      { q: '스테레오 매칭에서 대응점을 “같은 행”에서만 찾을 수 있는 전제 조건은?', options: ['두 사진이 컬러일 것', '두 사진이 정렬(rectified)되어 에피폴라 선이 가로로 나란할 것', '사진 크기가 16의 배수일 것', '카메라 왜곡이 클 것'], answer: 1, explain: '정렬된 스테레오 쌍에서는 에피폴라 선이 모두 수평이고 같은 높이라 같은 행만 탐색하면 됩니다.' },
      { q: 'StereoBM 결과에서 흰 벽처럼 무늬 없는 영역이 검게(실패) 나오는 주된 이유는?', options: ['너무 가까워서', '블록끼리 비슷해 어느 위치가 대응인지 구별할 수 없어서', 'numDisparities 가 16의 배수라서', '컬러맵을 쓰지 않아서'], answer: 1, explain: '블록 매칭은 무늬 차이로 위치를 찾으므로 무늬가 없으면 대응을 확정할 수 없습니다. SGBM 은 이웃 매끄러움으로 이런 영역을 어느 정도 채웁니다.' },
    ],
  },
  // =====================================================================
  // a2-8 ArUco 마커 자세 추정과 2주차 정리
  // =====================================================================
  {
    id: 'a2-8',
    assets: ['images/apps/aruco_board.png', 'images/apps/aruco_scene.png'],
    summary: '체스보드 대신 작은 정사각형 표식 하나로 ID 와 자세를 한꺼번에 알 수 있는 ArUco 마커를 다룹니다. cv.aruco.ArucoDetector 로 마커를 찾고, 마커 네 꼭짓점의 3D 좌표와 (가정한) 카메라 행렬로 cv.solvePnP 를 풀어 좌표축과 큐브를 그립니다. 마지막으로 2주차 전체를 표로 정리하고 미니 챌린지로 마무리합니다.',
    goals: [
      'ArUco 마커의 구조(검은 테두리 · 내부 비트 · 사전 · ID)와 꼭짓점 순서를 설명할 수 있다',
      'cv.aruco.ArucoDetector 로 마커를 검출하고 ID · 꼭짓점을 그릴 수 있다',
      '마커 한 변 길이로 3D 꼭짓점 좌표를 만들고 solvePnP(SOLVEPNP_IPPE_SQUARE)로 마커의 자세 · 거리를 구할 수 있다',
      '캘리브레이션 없이 카메라 행렬을 어림할 때의 방법과 한계를 설명할 수 있다',
      '2주차의 흐름(카메라 모델 → 캘리브레이션 → 보정 → 자세 → 에피폴라 → 깊이)을 정리할 수 있다',
    ],
    schedule: [['도입 · 마커가 필요한 이유', 5], ['ArUco 검출', 10], ['마커 자세 추정 · AR', 15], ['실습 · 미니 챌린지', 12], ['2주차 정리 · 퀴즈', 8]],
    blocks: [
      { type: 'text', html: `<h3>1. 왜 ArUco 마커인가?</h3>
<p>a2-5 에서는 체스보드로 자세를 구했습니다. 하지만 체스보드는 <b>크고</b>, 일부가 가려지면 검출이 실패하며, 여러 개를 놓아도 <b>어느 보드인지 구별할 수 없습니다</b>. <b>ArUco 마커</b>는 이 문제를 해결한 작은 정사각형 표식입니다.</p>
<ul>
<li><b>검은 테두리</b> : 사진에서 사각형 후보를 빠르게 찾게 해 줍니다.</li>
<li><b>안쪽 흰/검 칸(비트)</b> : 마커 번호(<b>ID</b>)를 담은 바코드. 4×4 칸이면 16비트.</li>
<li><b>사전(dictionary)</b> : 서로 헷갈리지 않게 골라 둔 패턴 모음. <code>DICT_4X4_50</code> = 4×4 칸, ID 0~49.</li>
<li>패턴이 회전에 대해 비대칭이라 <b>꼭짓점 순서</b>(마커 기준 왼쪽 위 → 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래)가 항상 일정합니다. 그래서 <b>네 꼭짓점만으로 자세</b>를 구할 수 있습니다.</li>
</ul>
<p>로봇 충전 도킹, 드론 착륙 지점, AR 명함, 카메라 캘리브레이션 보드(ChArUco) 등에 널리 쓰입니다.</p>` },
      { type: 'code', title: '예제 1 · DICT_4X4_50 마커 만들어 보기', code: String.raw`
import cv2 as cv
import numpy as np

dictionary = cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50)
print('사전의 마커 수:', dictionary.bytesList.shape[0], ' 마커 칸 수:', dictionary.markerSize, 'x', dictionary.markerSize)

tiles = []
for marker_id in [0, 1, 7, 23, 42]:
    m = cv.aruco.generateImageMarker(dictionary, marker_id, 180)     # 180×180 px 마커 (테두리 1칸 포함)
    tile = cv.copyMakeBorder(m, 20, 40, 20, 20, cv.BORDER_CONSTANT, value=255)   # 흰 여백 (검출에 필요)
    cv.putText(tile, 'ID %d' % marker_id, (70, 238), cv.FONT_HERSHEY_SIMPLEX, 0.7, 0, 2)
    tiles.append(tile)

cv.imshow('ArUco DICT_4X4_50', np.hstack(tiles))
cv.imwrite('marker_7.png', tiles[2])        # 인쇄해서 웹캠으로 비춰 볼 수 있음
`, desc: '<p>각 마커는 검은 테두리 안에 4×4 칸 패턴이 있고, 번호마다 패턴이 다릅니다. 저장된 <code>marker_7.png</code> 를 내려받아 인쇄하거나 휴대폰 화면에 띄우면 예제 6 의 웹캠 실습에 쓸 수 있습니다. <b>흰 여백</b>이 없으면 검은 테두리를 찾지 못하니 여백을 꼭 남기세요.</p>' },
      { type: 'text', html: `<h3>2. 마커 검출: ArucoDetector</h3>
<pre>detector = cv.aruco.ArucoDetector(dictionary, cv.aruco.DetectorParameters())
corners, ids, rejected = detector.detectMarkers(img)</pre>
<ul>
<li><b>corners</b> : 마커마다 (1, 4, 2) 배열의 리스트. 네 꼭짓점이 <b>마커 기준 시계 방향</b>(왼위 → 오위 → 오아래 → 왼아래)으로 들어 있습니다.</li>
<li><b>ids</b> : (N, 1) 배열. 못 찾으면 <b>None</b> 이므로 반드시 확인하세요.</li>
<li><b>rejected</b> : 사각형처럼 보였지만 사전에 없는 후보(디버깅용).</li>
<li>내부 동작: 적응형 이진화 → 사각형 윤곽 찾기 → 원근 변환으로 펴서 칸 읽기 → 사전과 대조. 입문 · 1주차에 배운 기술의 조합입니다.</li>
</ul>
<p><code>aruco_board.png</code> 는 책상 위 “로봇 도킹 패드”를 비스듬히 찍은 장면으로, ID 0~3 마커가 <b>서로 다른 방향</b>(0°, 90°, 180°, 270°)으로 붙어 있습니다.</p>` },
      { type: 'code', title: '예제 2 · aruco_board.png 에서 마커 검출하기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_board.png')
dictionary = cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50)
detector = cv.aruco.ArucoDetector(dictionary, cv.aruco.DetectorParameters())

corners, ids, rejected = detector.detectMarkers(img)
print('검출된 마커 수:', 0 if ids is None else len(ids), ' IDs:', None if ids is None else ids.ravel())
print('후보였지만 탈락한 사각형:', len(rejected))

vis = img.copy()
if ids is not None:
    cv.aruco.drawDetectedMarkers(vis, corners, ids)          # 테두리 + ID + 첫 꼭짓점(작은 사각형)
    for c, marker_id in zip(corners, ids.ravel()):
        p = c.reshape(4, 2)
        print('ID %d 꼭짓점:' % marker_id, p.round(0).tolist())
        for k, color in enumerate([(0, 0, 255), (0, 255, 0), (255, 0, 0), (0, 255, 255)]):
            cv.circle(vis, (int(p[k][0]), int(p[k][1])), 6, color, -1)   # 0 빨강, 1 초록, 2 파랑, 3 노랑
cv.imshow('detected markers', vis)
`, desc: '<p>네 마커 모두 검출되고, 꼭짓점 0(빨강)이 마커마다 <b>다른 위치</b>에 있습니다. 마커를 90° 씩 돌려 붙였기 때문입니다. 사진 속 방향과 상관없이 “마커 자신의 왼쪽 위”가 꼭짓점 0 이라서, 마커가 어느 쪽으로 돌아가 있는지 알 수 있습니다.</p>' },
      { type: 'text', html: `<h3>3. 마커 한 개로 자세 구하기</h3>
<p>마커 중심을 원점, 마커 면을 Z = 0, 한 변 길이를 <b>L</b> 이라 하면 네 꼭짓점의 3D 좌표는 검출 순서에 맞춰</p>
<pre>obj = [[-L/2,  L/2, 0],    # 0 왼쪽 위
       [ L/2,  L/2, 0],    # 1 오른쪽 위
       [ L/2, -L/2, 0],    # 2 오른쪽 아래
       [-L/2, -L/2, 0]]    # 3 왼쪽 아래</pre>
<p>입니다(X 오른쪽, Y 위쪽, Z 는 마커에서 <b>카메라 쪽으로</b> 튀어나옴). 이 4점과 검출된 꼭짓점으로 a2-5 의 <code>cv.solvePnP</code> 를 풀면 됩니다. 정사각형 마커 전용 풀이법 <code>flags=cv.SOLVEPNP_IPPE_SQUARE</code> 가 빠르고 안정적입니다(이 풀이법은 위 점 순서를 요구합니다).</p>` },
      { type: 'warn', html: `<p><b>카메라 행렬을 모른다면? (이 교시의 가정)</b> : 샘플 사진은 캘리브레이션 정보가 없으므로 흔한 어림값을 씁니다.</p>
<ul>
<li><b>fx = fy ≈ 이미지 폭</b>(800 px) → 가로 시야각 약 53° 인 일반 카메라 가정</li>
<li><b>cx, cy = 이미지 중심</b>, <b>왜곡 = 0</b></li>
</ul>
<p>이렇게 구한 방향(좌표축)은 그럴듯하지만, <b>거리 값은 f 에 비례해 틀릴 수 있습니다</b>(f 를 10% 크게 잡으면 거리도 약 10% 커짐). 정확한 측정이 필요하면 a2-3 처럼 먼저 캘리브레이션하세요. 또한 tvec 의 단위는 L 의 단위이고, 거리는 <b>실제 마커 크기 L</b>을 정확히 넣어야 맞습니다.</p>` },
      { type: 'code', title: '예제 3 · 도킹 패드 마커 4개의 자세와 거리', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_board.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)

# 가정: 캘리브레이션 없음 → 초점거리 ≈ 이미지 폭, 주점 = 중심, 왜곡 없음
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
dist = np.zeros(5)
L = 80.0                                                   # 마커 한 변 80 mm 라고 가정
obj = np.array([[-L / 2, L / 2, 0], [L / 2, L / 2, 0],
                [L / 2, -L / 2, 0], [-L / 2, -L / 2, 0]], np.float32)

vis = img.copy()
if ids is not None:
    for c, marker_id in sorted(zip(corners, ids.ravel()), key=lambda t: t[1]):
        ok, rvec, tvec = cv.solvePnP(obj, c.reshape(4, 2), K, dist, flags=cv.SOLVEPNP_IPPE_SQUARE)
        cv.drawFrameAxes(vis, K, dist, rvec, tvec, L * 0.7, 3)            # X 빨강, Y 초록, Z 파랑
        d = np.linalg.norm(tvec)
        print('ID %d: tvec = %s mm, 거리 %.0f mm' % (marker_id, tvec.ravel().round(0), d))
        p = c.reshape(4, 2).max(axis=0)
        cv.putText(vis, 'ID%d %.0fmm' % (marker_id, d), (int(p[0]) - 90, int(p[1]) + 22),
                   cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
cv.imshow('marker pose', vis)
`, desc: '<p>사진 위쪽(멀리 있는) 마커 0, 1 은 거리가 약 75 cm, 아래쪽(가까운) 마커 2, 3 은 약 57 cm 로 나옵니다. 파란 Z 축은 패드 면에서 카메라 쪽으로 서 있고, 빨강 · 초록 축은 마커를 붙인 방향에 따라 90° 씩 돌아가 있습니다. 좌표축은 마커마다 “자기 자신” 기준이라는 점을 기억하세요.</p>' },
      { type: 'code', title: '예제 4 · aruco_scene.png: 크기 · 각도가 다른 마커들', code: String.raw`
import cv2 as cv
import numpy as np
import math

img = cv.imread('aruco_scene.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
L = 50.0                                                   # 이 장면의 마커는 한 변 50 mm 라고 가정
obj = np.array([[-L / 2, L / 2, 0], [L / 2, L / 2, 0], [L / 2, -L / 2, 0], [-L / 2, -L / 2, 0]], np.float32)

vis = img.copy()
cv.aruco.drawDetectedMarkers(vis, corners, ids)
for c, marker_id in zip(corners, ids.ravel()):
    p = c.reshape(4, 2)
    side = np.mean([np.linalg.norm(p[k] - p[(k + 1) % 4]) for k in range(4)])      # 사진 속 한 변 길이(px)
    angle = math.degrees(math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]))           # 윗변(0→1)의 기울기
    ok, rvec, tvec = cv.solvePnP(obj, p, K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
    cv.drawFrameAxes(vis, K, None, rvec, tvec, L * 0.8, 3)
    print('ID %2d: 한 변 %.0f px, 화면 회전 %+.0f°, 거리 %.0f mm' % (marker_id, side, angle, np.linalg.norm(tvec)))
cv.imshow('scene markers', vis)
`, desc: '<p>세 마커(ID 7, 23, 42)는 크기와 회전이 모두 다릅니다. 같은 실제 크기(50 mm)라고 가정했으므로 <b>사진에서 크게 찍힌 마커일수록 가깝게</b> 계산됩니다(핀홀 모델: 크기 ∝ 1/거리). 화면 회전 각도는 꼭짓점 0 → 1 방향으로 구해, 마커가 사진 속에서 얼마나 돌아가 있는지 알려 줍니다.</p>' },
      { type: 'text', html: `<h3>4. 마커 위에 AR 큐브 올리기</h3>
<p>a2-5 의 큐브와 같은 방법입니다. 마커 좌표계는 Z 가 <b>카메라 쪽(+)</b>이므로 큐브 윗면은 <b>z = +L</b> 입니다(체스보드 튜토리얼의 −3 과 부호가 반대인 이유: 좌표축을 잡는 방법이 다름). 여러 마커가 있어도 마커마다 자세를 따로 구해 각각 큐브를 그립니다.</p>` },
      { type: 'code', title: '예제 5 · 모든 마커 위에 반투명 큐브 그리기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_scene.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
L = 50.0
obj = np.array([[-L / 2, L / 2, 0], [L / 2, L / 2, 0], [L / 2, -L / 2, 0], [-L / 2, -L / 2, 0]], np.float32)
cube = np.vstack([obj, obj + np.float32([0, 0, L])])       # 아래 4점 + 위 4점 (z = +L)
colors = {7: (255, 120, 0), 23: (0, 200, 255), 42: (200, 0, 255)}

vis = img.copy()
for c, marker_id in zip(corners, ids.ravel()):
    ok, rvec, tvec = cv.solvePnP(obj, c.reshape(4, 2), K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
    pts, _ = cv.projectPoints(cube, rvec, tvec, K, None)
    pts = np.int32(pts).reshape(-1, 2)
    color = colors.get(int(marker_id), (0, 255, 0))
    overlay = vis.copy()
    cv.fillConvexPoly(overlay, pts[4:], color)                 # 윗면 채우기
    vis = cv.addWeighted(overlay, 0.4, vis, 0.6, 0)
    for i in range(4):
        cv.line(vis, tuple(pts[i]), tuple(pts[(i + 1) % 4]), color, 2, cv.LINE_AA)          # 아랫면
        cv.line(vis, tuple(pts[i + 4]), tuple(pts[(i + 1) % 4 + 4]), color, 2, cv.LINE_AA)  # 윗면
        cv.line(vis, tuple(pts[i]), tuple(pts[i + 4]), color, 2, cv.LINE_AA)                # 기둥
    top = pts[4:].mean(axis=0).astype(int)
    cv.putText(vis, 'ID %d' % marker_id, (int(top[0]) - 25, int(top[1])), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
cv.imshow('AR cubes', vis)
`, desc: '<p>각 마커 위에 마커와 같은 크기의 큐브가 서 있습니다. 카메라에 대해 기울어진 정도에 따라 큐브의 옆면이 보이는 방향이 다릅니다. 큐브 대신 3D 모델의 꼭짓점을 넣으면 AR 캐릭터가 됩니다(4주차 AR 오버레이 가이드 프로젝트).</p>' },
      { type: 'text', html: `<h3>5. 웹캠 · 동영상으로 실시간 마커 추적</h3>
<p>오른쪽 패널의 입력 소스를 <b>📷 웹캠</b>으로 바꾸고 예제 1 에서 저장한 마커(또는 휴대폰 화면에 띄운 DICT_4X4_50 마커)를 비춰 보세요. 웹캠이 없으면 입력 목록에서 <code>aruco_board.png</code> / <code>aruco_scene.png</code> 를 골라도 됩니다(🎞️ 샘플 동영상에는 마커가 없습니다). 카메라 행렬은 프레임 크기로 어림합니다.</p>` },
      { type: 'code', title: '예제 6 · process(frame) 로 실시간 마커 자세 추정', code: String.raw`
import cv2 as cv
import numpy as np

detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
L = 50.0                                                   # 인쇄한 마커 한 변(mm)으로 바꾸세요
obj = np.array([[-L / 2, L / 2, 0], [L / 2, L / 2, 0], [L / 2, -L / 2, 0], [-L / 2, -L / 2, 0]], np.float32)

def process(frame):
    h, w = frame.shape[:2]
    K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    corners, ids, _ = detector.detectMarkers(gray)
    out = frame.copy()
    if ids is None:
        cv.putText(out, 'no marker (DICT_4X4_50)', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        return out
    cv.aruco.drawDetectedMarkers(out, corners, ids)
    for c, marker_id in zip(corners, ids.ravel()):
        ok, rvec, tvec = cv.solvePnP(obj, c.reshape(4, 2), K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
        if ok:
            cv.drawFrameAxes(out, K, None, rvec, tvec, L * 0.8, 2)
            p = c.reshape(4, 2)[2]
            cv.putText(out, '%.0f mm' % np.linalg.norm(tvec), (int(p[0]), int(p[1]) + 20),
                       cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    cv.putText(out, 'markers: %d' % len(ids), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    return out
`, desc: '<p>마커를 기울이면 좌표축이 따라 기울고, 카메라에 가까이 가져가면 거리 숫자가 줄어듭니다. 거리가 실제와 다르면 <code>L</code> 을 인쇄한 마커 크기로 고치고, 그래도 다르면 카메라 행렬 어림값(f ≈ 폭) 때문입니다. 내 웹캠을 캘리브레이션해 K 를 바꾸면 훨씬 정확해집니다.</p>' },
      { type: 'text', html: `<h3>6. 2주차 정리: 2D 사진에서 3D 를 되찾는 흐름</h3>
<p>이번 주에 배운 내용은 하나의 흐름으로 이어집니다. <b>카메라 모델</b>을 세우고(a2-1), 체스보드로 모델의 숫자를 <b>측정</b>하고(a2-2, a2-3), 렌즈 왜곡을 <b>제거</b>한 뒤(a2-4), 알고 있는 물체로 <b>자세</b>를 구하고(a2-5, a2-8), 두 시점의 <b>기하 관계</b>(a2-6)를 이용해 픽셀마다 <b>깊이</b>를 계산했습니다(a2-7).</p>` },
      { type: 'table', head: ['교시', '핵심 질문', '핵심 함수', '결과물'], rows: [
        ['a2-1 카메라 모델', '3D 점은 사진 어디에 찍히나?', '<code>projectPoints</code>', 'K, R·t, 왜곡 계수의 의미'],
        ['a2-2 코너 검출', '3D 위치를 아는 점을 어떻게 찾나?', '<code>findChessboardCorners</code>, <code>cornerSubPix</code>', 'imgpoints'],
        ['a2-3 캘리브레이션', '내 카메라의 K 와 왜곡은?', '<code>calibrateCamera</code>', 'mtx, dist, 재투영 오차'],
        ['a2-4 왜곡 보정', '휜 사진을 어떻게 펴나?', '<code>undistort</code>, <code>initUndistortRectifyMap</code> + <code>remap</code>', '곧게 펴진 사진'],
        ['a2-5 · a2-8 자세 추정', '물체가 카메라에 대해 어떻게 놓였나?', '<code>solvePnP</code>, <code>drawFrameAxes</code>, <code>ArucoDetector</code>', 'rvec, tvec, AR 그래픽'],
        ['a2-6 · a2-7 두 시점', '두 사진으로 무엇을 더 알 수 있나?', '<code>findFundamentalMat</code>, <code>StereoBM</code>, <code>StereoSGBM</code>', '에피폴라 선, 깊이 맵'],
      ] },
      { type: 'checklist', title: '미니 챌린지 · 로봇 도킹 패드 중심 찾기 (실습 3)', items: [
        '<code>aruco_board.png</code> 의 도킹 패드 설계도: 패드 420 × 300 mm, 마커 ID 0 · 1 · 2 · 3 의 <b>중심</b>이 패드 왼쪽 위 기준 (60, 60), (360, 60), (360, 240), (60, 240) mm',
        '네 마커의 중심(꼭짓점 평균)을 2D 점, 설계도 좌표를 3D 점(패드 면 Z = 0)으로 짝지어 <code>solvePnP(flags=cv.SOLVEPNP_IPPE)</code>',
        '구한 자세로 패드의 빨간 십자 표시 위치 (210, 230) mm 를 <code>projectPoints</code> 로 사진에 찍어 실제 십자와 겹치는지 확인',
        '십자 위치에 좌표축을 그리고, 카메라에서 십자까지 거리(mm)를 출력',
        '도전: 마커 한 개를 가린(목록에서 뺀) 상태로도 되는지, 3개면 충분한지 실험',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 마커 크기를 잘못 알면 거리는?',
        desc: `<p><code>aruco_scene.png</code> 의 ID 23 마커에 대해 한 변 길이 L 을 <b>25, 50, 100 mm</b> 로 바꿔 가며 solvePnP 로 구한 거리와 회전 벡터(rvec)를 출력하세요. 거리와 방향이 L 에 따라 어떻게 달라지는지 관찰합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_scene.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)

c23 = [c for c, i in zip(corners, ids.ravel()) if i == 23][0].reshape(4, 2)

for L in [50.0]:                                  # TODO: [25.0, 50.0, 100.0]
    # TODO: 아래 숫자 25 를 L 로 표현해 L 에 맞는 obj (4점) 만들기
    obj = np.array([[-25, 25, 0], [25, 25, 0], [25, -25, 0], [-25, -25, 0]], np.float32)
    ok, rvec, tvec = cv.solvePnP(obj, c23, K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
    print('L=%5.1f mm → 거리 %.1f mm, rvec %s' % (L, np.linalg.norm(tvec), rvec.ravel().round(3)))
`,
        hint: `<p><code>obj = np.array([[-L/2, L/2, 0], [L/2, L/2, 0], [L/2, -L/2, 0], [-L/2, -L/2, 0]], np.float32)</code>. 결과: L 이 2배면 거리도 정확히 2배이고, rvec(방향)은 그대로입니다. 사진 한 장으로는 “작고 가까운 마커”와 “크고 먼 마커”를 구별할 수 없기 때문입니다(a2-1 예제 1 과 같은 이유). 그래서 거리를 재려면 <b>실제 크기</b>를 알아야 합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_scene.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)

c23 = [c for c, i in zip(corners, ids.ravel()) if i == 23][0].reshape(4, 2)

for L in [25.0, 50.0, 100.0]:
    obj = np.array([[-L / 2, L / 2, 0], [L / 2, L / 2, 0], [L / 2, -L / 2, 0], [-L / 2, -L / 2, 0]], np.float32)
    ok, rvec, tvec = cv.solvePnP(obj, c23, K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
    print('L=%5.1f mm → 거리 %.1f mm, rvec %s' % (L, np.linalg.norm(tvec), rvec.ravel().round(3)))
print('→ 거리는 L 에 정비례, 방향(rvec)은 같음')
`,
      },
      {
        title: '실습 2 · ID 만큼 높은 기둥 세우기',
        desc: `<p><code>aruco_scene.png</code> 의 각 마커 중심에 <b>높이 = ID × 2 mm</b> 인 세로 기둥(선)을 세우고, 기둥 꼭대기에 ID 를 쓰세요(마커 한 변 50 mm 가정). ID 42 의 기둥이 가장 높아야 합니다. 시작 코드는 모든 기둥 높이가 같습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_scene.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
L = 50.0
obj = np.array([[-L / 2, L / 2, 0], [L / 2, L / 2, 0], [L / 2, -L / 2, 0], [-L / 2, -L / 2, 0]], np.float32)

vis = img.copy()
for c, marker_id in zip(corners, ids.ravel()):
    ok, rvec, tvec = cv.solvePnP(obj, c.reshape(4, 2), K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
    height = 30.0                                  # TODO: marker_id * 2
    pole = np.float32([[0, 0, 0], [0, 0, height]])  # 마커 중심 → 위(+Z, 카메라 쪽)
    pts, _ = cv.projectPoints(pole, rvec, tvec, K, None)
    (x0, y0), (x1, y1) = pts.reshape(2, 2).astype(int)
    cv.line(vis, (int(x0), int(y0)), (int(x1), int(y1)), (0, 255, 255), 6)
    # TODO: 꼭대기 (x1, y1) 에 'ID %d' 글자 쓰기
cv.imshow('poles', vis)
`,
        hint: `<p>높이만 <code>height = marker_id * 2.0</code> 로 바꾸면 됩니다(ID 42 → 84 mm). 글자는 <code>cv.putText(vis, 'ID %d' % marker_id, (int(x1) + 5, int(y1)), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)</code>. 기둥이 사진 “위쪽”이 아니라 마커 면에 수직인 방향으로 뻗는 것을 확인하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_scene.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)
L = 50.0
obj = np.array([[-L / 2, L / 2, 0], [L / 2, L / 2, 0], [L / 2, -L / 2, 0], [-L / 2, -L / 2, 0]], np.float32)

vis = img.copy()
for c, marker_id in zip(corners, ids.ravel()):
    ok, rvec, tvec = cv.solvePnP(obj, c.reshape(4, 2), K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
    height = marker_id * 2.0
    pole = np.float32([[0, 0, 0], [0, 0, height]])
    pts, _ = cv.projectPoints(pole, rvec, tvec, K, None)
    (x0, y0), (x1, y1) = pts.reshape(2, 2).astype(int)
    cv.circle(vis, (int(x0), int(y0)), 6, (0, 255, 0), -1)
    cv.line(vis, (int(x0), int(y0)), (int(x1), int(y1)), (0, 255, 255), 6)
    tx, ty = min(max(int(x1) + 5, 0), w - 70), min(max(int(y1), 20), h - 5)      # 글자가 화면 밖으로 나가지 않게
    cv.putText(vis, 'ID %d' % marker_id, (tx, ty), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    print('ID %d: 기둥 높이 %.0f mm' % (marker_id, height))
cv.imshow('poles', vis)
`,
      },
      {
        title: '실습 3 · 미니 챌린지: 도킹 패드 중심 좌표계',
        desc: `<p>본문의 “미니 챌린지” 점검 목록을 따라 <code>aruco_board.png</code> 에서 <b>패드 전체의 자세</b>를 구하세요. 마커 네 개의 <b>중심</b>을 설계도 좌표와 짝지어 solvePnP 를 풀고, 빨간 십자 위치 (210, 230) mm 를 투영해 초록 원으로 표시한 뒤 그 자리에 좌표축을 그립니다. 초록 원이 사진 속 빨간 십자와 겹치면 성공!</p>
<p>패드 좌표는 설계도(왼쪽 위 원점, 아래로 +)를 그대로 쓰되, 좌표축이 패드 위로 서도록 3D 점을 <b>(x, −y, 0)</b> 으로 만듭니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_board.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)

layout = {0: (60, 60), 1: (360, 60), 2: (360, 240), 3: (60, 240)}   # 마커 중심 (mm, 설계도 좌표)
cross = (210, 230)                                                   # 빨간 십자 (mm)

obj_pts, img_pts = [], []
for c, marker_id in zip(corners, ids.ravel()):
    if int(marker_id) in layout:
        x, y = layout[int(marker_id)]
        obj_pts.append([x, -y, 0])                   # Y 뒤집기 → Z 가 패드 위(카메라 쪽)
        # TODO: 마커 중심(네 꼭짓점 평균)을 img_pts 에 추가
        img_pts.append([0, 0])

obj_pts = np.float32(obj_pts)
img_pts = np.float32(img_pts)
vis = img.copy()
# TODO: solvePnP(obj_pts, img_pts, K, None, flags=cv.SOLVEPNP_IPPE)
# TODO: 십자 3D 점 [cross[0], -cross[1], 0] 을 projectPoints → 초록 원
# TODO: 십자 위치에 좌표축: R, _ = cv.Rodrigues(rvec); t2 = tvec + R @ 십자3D.reshape(3, 1)
#       cv.drawFrameAxes(vis, K, None, rvec, t2, 60, 3)
print('사용한 마커 수:', len(obj_pts))
cv.imshow('docking pad', vis)
`,
        hint: `<p>중심: <code>c.reshape(4, 2).mean(axis=0)</code>. 자세: <code>ok, rvec, tvec = cv.solvePnP(obj_pts, img_pts, K, None, flags=cv.SOLVEPNP_IPPE)</code>. 좌표축을 십자 위치로 옮기는 원리: 패드 좌표의 점 P 는 카메라 좌표로 <code>R @ P + tvec</code> 이므로, 원점을 P 로 옮긴 좌표계의 이동 벡터가 <code>tvec + R @ P</code> 입니다. 가정한 K 때문에 초록 원이 십자에서 몇 픽셀 어긋날 수 있습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('aruco_board.png')
h, w = img.shape[:2]
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50),
                                  cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(img)
K = np.array([[w, 0, w / 2], [0, w, h / 2], [0, 0, 1]], np.float64)

layout = {0: (60, 60), 1: (360, 60), 2: (360, 240), 3: (60, 240)}
cross = (210, 230)

obj_pts, img_pts = [], []
for c, marker_id in zip(corners, ids.ravel()):
    if int(marker_id) in layout:
        x, y = layout[int(marker_id)]
        obj_pts.append([x, -y, 0])
        img_pts.append(c.reshape(4, 2).mean(axis=0))

obj_pts = np.float32(obj_pts)
img_pts = np.float32(img_pts)
vis = img.copy()
ok, rvec, tvec = cv.solvePnP(obj_pts, img_pts, K, None, flags=cv.SOLVEPNP_IPPE)

P = np.float32([[cross[0], -cross[1], 0]])
p, _ = cv.projectPoints(P, rvec, tvec, K, None)
px, py = p.ravel()
cv.circle(vis, (int(px), int(py)), 12, (0, 255, 0), 3)

R, _ = cv.Rodrigues(rvec)
t2 = tvec + R @ P.reshape(3, 1)
cv.drawFrameAxes(vis, K, None, rvec, t2, 60, 3)
for q in img_pts:
    cv.drawMarker(vis, (int(q[0]), int(q[1])), (255, 0, 255), cv.MARKER_TILTED_CROSS, 16, 2)

print('사용한 마커 수:', len(obj_pts))
print('십자 투영 위치: (%.0f, %.0f) px' % (px, py))
print('카메라 → 십자 거리: %.0f mm' % np.linalg.norm(t2))
cv.imshow('docking pad', vis)
`,
      },
    ],
    quiz: [
      { q: 'ArUco 마커 하나만으로 자세를 구할 수 있는 가장 중요한 이유는?', options: ['마커가 컬러라서', '네 꼭짓점의 순서가 마커 기준으로 항상 일정하고 실제 크기를 알면 3D 좌표가 정해지기 때문', '마커가 매우 커서', 'ID 가 거리 정보를 담고 있어서'], answer: 1, explain: '비대칭 패턴 덕분에 꼭짓점 0~3 의 순서가 고정되어, 한 변 길이 L 로 만든 3D 꼭짓점과 1:1 로 짝지을 수 있습니다. 4점이면 평면 물체의 PnP 를 풀 수 있습니다.' },
      { q: 'detector.detectMarkers(img) 결과를 쓸 때 가장 먼저 확인해야 할 것은?', options: ['corners 가 정렬되었는지', 'ids 가 None 인지', 'rejected 가 비었는지', '이미지가 흑백인지'], answer: 1, explain: '마커를 하나도 찾지 못하면 ids 는 None 입니다. 확인 없이 ids.ravel() 등을 쓰면 오류가 납니다.' },
      { q: '캘리브레이션 없이 K 를 fx = fy = 이미지 폭으로 어림해 마커 거리를 구했다. 옳은 설명은?', options: ['거리는 항상 정확하다', '방향은 대략 맞지만 거리는 실제 f 와의 차이만큼 비례해서 틀릴 수 있다', '왜곡이 0 이므로 오차가 없다', '마커 크기를 몰라도 거리는 정확하다'], answer: 1, explain: '거리 추정은 f 에 비례하므로 f 를 잘못 잡으면 같은 비율로 틀립니다. 정확한 측정에는 캘리브레이션과 실제 마커 크기가 필요합니다.' },
      { q: '마커 한 변 길이를 실제의 2배로 잘못 입력하면 solvePnP 결과는?', options: ['거리가 2배로, 방향은 그대로', '거리가 절반으로', '방향만 180° 뒤집힘', '오류가 난다'], answer: 0, explain: '사진 한 장으로는 크기와 거리를 구별할 수 없어, 크기를 2배로 가정하면 거리도 2배로 계산됩니다. 회전은 변하지 않습니다.' },
      { q: '2주차 흐름에서 “체스보드 사진 여러 장 → K, dist” 다음에 오는 단계로 알맞게 짝지은 것은?', options: ['K, dist → 왜곡 보정 · 자세 추정(solvePnP)', 'K, dist → 특징점 검출(SIFT)', 'K, dist → 체스보드 코너 검출', 'K, dist → 히스토그램 평활화'], answer: 0, explain: '캘리브레이션 결과(K, dist)는 왜곡 보정(undistort)과 자세 추정(solvePnP, 마커 AR), 그리고 스테레오 · 측정의 기초로 쓰입니다.' },
    ],
  },
]);
