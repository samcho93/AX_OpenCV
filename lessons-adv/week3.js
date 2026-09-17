/* 심화 3주차: 머신러닝과 객체 검출 — kNN · SVM · K-Means · Haar 캐스케이드 · HOG · DNN(YOLOX · YuNet) */
COURSE.addLessons([
  /* ======================================================================
   * a3-1 머신러닝 기초와 kNN
   * ====================================================================== */
  {
    id: 'a3-1',
    summary: '규칙을 사람이 직접 정하던 영상처리에서 “데이터로부터 규칙을 배우는” 머신러닝으로 넘어갑니다. 특징 벡터 · 레이블 · 학습/테스트 같은 기본 용어를 익히고, 가장 단순한 분류기인 k-최근접 이웃(kNN)을 OpenCV 튜토리얼 그대로 실행해 봅니다.',
    goals: [
      '특징(feature) · 특징 벡터 · 레이블(label) · 학습/테스트 데이터의 뜻을 예를 들어 설명할 수 있다',
      'kNN 이 “가까운 이웃 k 개의 다수결”로 분류한다는 원리를 그림으로 설명할 수 있다',
      'cv.ml.KNearest_create() 의 train() · findNearest() 로 새 데이터를 분류하고 반환값을 해석할 수 있다',
      'k 값에 따라 결정 경계와 테스트 정확도가 어떻게 달라지는지 비교할 수 있다',
    ],
    schedule: [['도입 · 3주차 로드맵', 5], ['머신러닝 기본 용어', 10], ['kNN 원리와 튜토리얼 예제', 12], ['k 값 · 결정 경계 · 정확도', 8], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 규칙을 짜는 대신 데이터로 배우기</h3>
<p>입문 과정에서는 “밝기가 127 보다 크면 흰색”, “H 값이 35~85 이면 초록색”처럼 <b>사람이 규칙(임계값)을 직접 정했습니다.</b>
그런데 손글씨 숫자 ‘3’과 ‘8’을 구분하는 규칙이나, 사진 속에서 얼굴을 찾는 규칙은 사람이 if 문으로 적기가 거의 불가능합니다.</p>
<p><b>머신러닝(Machine Learning)</b>은 규칙을 직접 쓰는 대신 <b>정답이 붙은 예시 데이터를 잔뜩 보여 주고, 컴퓨터가 규칙을 찾게</b> 하는 방법입니다.
이번 3주차에서는 OpenCV 에 들어 있는 전통적인 머신러닝(kNN · SVM · K-Means)을 먼저 익히고, 그 위에서 얼굴 · 사람 · 물체를 찾는 <b>객체 검출</b>(Haar · HOG · DNN)로 나아갑니다.</p>
<ul>
<li>1~2교시: kNN 으로 점 분류 → 손글씨 숫자 · 영문자 인식</li>
<li>3~4교시: SVM 으로 경계 긋기 → HOG 특징 + SVM 손글씨 인식</li>
<li>5교시: K-Means 군집화와 색 양자화 (정답 없이 묶기)</li>
<li>6~8교시: Haar 캐스케이드 얼굴 검출 → HOG 보행자 검출 → DNN(YOLOX · YuNet) 검출과 비교</li>
</ul>` },
      { type: 'text', html: `<h3>2. 꼭 알아야 할 머신러닝 용어</h3>
<p>과일 가게 비유로 생각해 봅시다. 사과와 오렌지를 구분하는 기계를 만들려면, 과일마다 <b>무게</b>와 <b>색(빨간 정도)</b>을 재서 숫자로 적어 두고(특징), 옆에 “사과/오렌지” 이름표(레이블)를 붙인 표를 준비합니다.
이 표로 기계를 <b>학습</b>시키고, 처음 보는 과일의 무게와 색만 주면 이름을 맞히게 하는 것이 <b>분류(Classification)</b>입니다.</p>` },
      { type: 'table', head: ['용어', '뜻', '영상에서의 예'], rows: [
        ['특징 (Feature)', '대상을 설명하는 숫자 하나', '평균 밝기, 채도, 컨투어 면적, 픽셀 값 하나'],
        ['특징 벡터 (Feature vector)', '특징들을 한 줄로 늘어놓은 배열 = 공간의 한 점', '20×20 숫자 이미지를 펼친 400개 숫자'],
        ['레이블 (Label)', '각 데이터의 정답', '“이 이미지는 숫자 3”'],
        ['학습 데이터 (Train)', '모델이 규칙을 배우는 데 쓰는 데이터', '정답이 붙은 손글씨 2500장'],
        ['테스트 데이터 (Test)', '학습에 쓰지 않고 <b>성능 평가에만</b> 쓰는 데이터', '처음 보는 손글씨 2500장'],
        ['지도 / 비지도 학습', '레이블이 있으면 지도(Supervised), 없으면 비지도(Unsupervised)', 'kNN · SVM = 지도, K-Means = 비지도'],
      ] },
      { type: 'code', title: '예제 1 · 이미지에서 특징 벡터 뽑아 보기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# 이미지마다 [평균 밝기(V), 평균 채도(S)] 두 숫자를 뽑아 특징 벡터로 만든다
names = ['lena.jpg', 'baboon.jpg', 'fruits.jpg', 'smarties.png',
         'sudoku.png', 'notes.png', 'building.jpg', 'box.png']
features = []
for name in names:
    img = cv.imread(name)
    hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
    v = hsv[:, :, 2].mean()          # 특징 1: 평균 밝기
    s = hsv[:, :, 1].mean()          # 특징 2: 평균 채도
    features.append([v, s])

X = np.array(features, np.float32)   # (이미지 수, 특징 수) = (8, 2)
labels = (X[:, 1] > 40).astype(np.int32)   # 레이블 예: 채도 40 초과면 1(컬러풀), 아니면 0
print('특징 행렬 X 의 shape:', X.shape)
for name, f, lb in zip(names, X, labels):
    print('%-14s 특징 벡터 = [밝기 %6.1f, 채도 %6.1f]  레이블 = %d' % (name, f[0], f[1], lb))

# 특징 벡터 = 2차원 공간의 한 점
plt.figure(figsize=(6, 5))
plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='coolwarm', s=80)
for name, (v, s) in zip(names, X):
    plt.annotate(name, (v, s), textcoords='offset points', xytext=(5, 5))
plt.xlabel('mean brightness (V)')
plt.ylabel('mean saturation (S)')
plt.title('Each image = one point in feature space')
plt.show()
`, desc: '<p>이미지 한 장이 숫자 두 개(점 하나)로 요약되었습니다. 머신러닝은 이런 <b>점들의 위치</b>만 보고 판단합니다. 어떤 특징을 고르느냐가 성능의 절반을 결정합니다.</p>' },
      { type: 'text', html: `<h3>3. k-최근접 이웃 (k-Nearest Neighbour, kNN)</h3>
<p>kNN 은 가장 단순한 지도 학습 분류기입니다. OpenCV 튜토리얼의 비유를 그대로 옮기면:</p>
<ul>
<li>마을에 <b>빨간 가족(▲, Red Family)</b>과 <b>파란 가족(■, Blue Family)</b>이 흩어져 삽니다 → 학습 데이터</li>
<li><b>새 이웃(●, newcomer)</b>이 이사를 왔습니다. 어느 가족일까요?</li>
<li>새 이웃과 <b>가장 가까운 집 k 채</b>를 보고 <b>다수결</b>로 정합니다. k=3 이고 가까운 집이 빨강 2, 파랑 1 이면 → 빨간 가족</li>
</ul>
<p>“학습”이라고 해도 kNN 은 데이터를 <b>저장만</b> 합니다. 계산은 모두 새 데이터가 들어올 때(예측할 때) 모든 학습 점과의 거리를 재면서 일어납니다. 그래서 학습은 빠르지만 <b>예측이 느린</b> 방법입니다 — 다음 교시에서 직접 체감합니다.</p>
<p>거리는 보통 <b>유클리드 거리</b> √((x₁−x₂)² + (y₁−y₂)²) 를 씁니다. 특징이 400개면 400차원 공간에서 같은 공식으로 잽니다.</p>` },
      { type: 'code', title: '예제 2 · 빨간 가족 · 파란 가족과 새 이웃 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

np.random.seed(7)   # 매번 같은 결과가 나오도록 난수 고정 (지우면 매번 달라짐)

# 학습 데이터: (x, y) 좌표 25개, 0~100 범위
trainData = np.random.randint(0, 100, (25, 2)).astype(np.float32)
# 레이블: 0 = 빨강, 1 = 파랑
responses = np.random.randint(0, 2, (25, 1)).astype(np.float32)

red = trainData[responses.ravel() == 0]
plt.scatter(red[:, 0], red[:, 1], 80, 'r', '^')
blue = trainData[responses.ravel() == 1]
plt.scatter(blue[:, 0], blue[:, 1], 80, 'b', 's')

# 새 이웃 1명
newcomer = np.random.randint(0, 100, (1, 2)).astype(np.float32)
plt.scatter(newcomer[:, 0], newcomer[:, 1], 80, 'g', 'o')

knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)
ret, results, neighbours, dist = knn.findNearest(newcomer, 3)

print('새 이웃 좌표:', newcomer)
print('result    :', results, '→', 'Blue' if results[0, 0] == 1 else 'Red')
print('neighbours:', neighbours)
print('distance  :', dist)

# 가장 가까운 3개 이웃을 찾아 선으로 연결해 보기
d = np.sqrt(((trainData - newcomer) ** 2).sum(axis=1))
for i in np.argsort(d)[:3]:
    plt.plot([newcomer[0, 0], trainData[i, 0]], [newcomer[0, 1], trainData[i, 1]], 'g--')
plt.title('kNN (k=3): newcomer -> %s' % ('Blue' if results[0, 0] == 1 else 'Red'))
plt.show()
`, desc: '<p><code>dist</code> 는 거리의 <b>제곱</b>(√ 를 하지 않은 값)입니다. 직접 계산한 초록 점선의 이웃 3개와 <code>neighbours</code> 의 레이블이 같은지 확인해 보세요.</p>' },
      { type: 'table', head: ['함수 / 반환값', '의미'], rows: [
        ['<code>knn = cv.ml.KNearest_create()</code>', 'kNN 분류기 객체 만들기'],
        ['<code>knn.train(samples, cv.ml.ROW_SAMPLE, responses)</code>', '한 행 = 데이터 하나(ROW_SAMPLE). samples 는 <b>float32</b>, (N, 특징 수)'],
        ['<code>ret, results, neighbours, dist = knn.findNearest(newcomers, k)</code>', '새 데이터 여러 개를 한 번에 분류'],
        ['<code>results</code>', '(M, 1) 각 새 데이터의 예측 레이블'],
        ['<code>neighbours</code>', '(M, k) 가까운 순서대로 이웃 k 개의 레이블'],
        ['<code>dist</code>', '(M, k) 이웃까지의 거리의 제곱'],
      ] },
      { type: 'code', title: '예제 3 · 새 이웃 여러 명과 k 값 바꿔 보기', code: String.raw`
import cv2 as cv
import numpy as np

np.random.seed(7)
trainData = np.random.randint(0, 100, (25, 2)).astype(np.float32)
responses = np.random.randint(0, 2, (25, 1)).astype(np.float32)
knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)

# 새 이웃 5명을 한 번에 분류 (한 행에 한 명)
newcomers = np.array([[10, 10], [50, 50], [90, 20], [30, 80], [70, 70]], np.float32)
names = ['Red', 'Blue']
print('좌표          k=1    k=3    k=5    k=7')
for p in newcomers:
    row = []
    for k in (1, 3, 5, 7):
        _, res, nb, _ = knn.findNearest(p.reshape(1, 2), k)
        votes = int(nb.sum())                 # 파랑(1) 표 수
        row.append('%s(%d/%d)' % (names[int(res[0, 0])][0], votes, k))
    print('(%2d, %2d)   ' % (p[0], p[1]), '  '.join(row))

# 한 번에 여러 개 넣기
_, results, neighbours, dist = knn.findNearest(newcomers, 3)
print('\nresults shape   :', results.shape)
print('neighbours shape:', neighbours.shape)
`, desc: '<p>괄호 안 숫자는 “파랑 표 수 / k” 입니다. 경계 근처의 점은 k 에 따라 답이 바뀝니다. 두 가족만 있을 때 k 를 <b>홀수</b>로 두면 동점이 생기지 않습니다.</p>' },
      { type: 'text', html: `<h3>4. k 값과 결정 경계, 그리고 정확도</h3>
<p>공간의 <b>모든 위치</b>에 “여기에 새 이웃이 오면 무슨 색?”을 칠해 보면, 두 색이 만나는 선이 생깁니다. 이것이 <b>결정 경계(Decision boundary)</b>입니다.</p>
<ul>
<li><b>k 가 작으면 (k=1)</b> — 가장 가까운 한 점만 믿음 → 경계가 삐뚤빼뚤하고, 잘못 섞인 점(노이즈) 하나에도 섬이 생김 → 학습 데이터에만 딱 맞는 <b>과적합(Overfitting)</b></li>
<li><b>k 가 크면 (k=25)</b> — 멀리 있는 점까지 투표 → 경계가 매끈하지만 너무 크면 데이터가 많은 쪽으로 쏠림 → <b>과소적합(Underfitting)</b></li>
</ul>
<p>적당한 k 는 <b>테스트 데이터 정확도</b>로 고릅니다. 학습에 쓴 데이터로 채점하면 k=1 이 항상 100% 가 나오므로 의미가 없습니다. 반드시 <b>학습에 쓰지 않은 데이터</b>로 평가하세요.</p>
<p>튜토리얼은 이웃마다 거리에 따라 가중치를 주는 <b>Modified kNN</b>(가까운 이웃의 표를 더 크게)도 소개합니다. OpenCV 의 기본 kNN 은 단순 다수결입니다.</p>` },
      { type: 'code', title: '예제 4 · k 에 따른 결정 경계 그리기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

rng = np.random.default_rng(3)
# 두 무리(가우시안 분포)가 조금 겹치게 60개씩
red = rng.normal((35, 40), 13, (60, 2))
blue = rng.normal((65, 60), 13, (60, 2))
trainData = np.vstack([red, blue]).astype(np.float32)
responses = np.array([0] * 60 + [1] * 60, np.float32).reshape(-1, 1)

knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)

# 0~100 을 100×100 격자로 나눠 모든 점을 한 번에 예측
xs, ys = np.meshgrid(np.linspace(0, 100, 100), np.linspace(0, 100, 100))
grid = np.c_[xs.ravel(), ys.ravel()].astype(np.float32)

plt.figure(figsize=(12, 4))
for i, k in enumerate([1, 7, 45]):
    _, res, _, _ = knn.findNearest(grid, k)
    plt.subplot(1, 3, i + 1)
    plt.contourf(xs, ys, res.reshape(xs.shape), levels=[-0.5, 0.5, 1.5], colors=['#f4b4b4', '#b4c8f4'])
    plt.scatter(red[:, 0], red[:, 1], 20, 'r', '^')
    plt.scatter(blue[:, 0], blue[:, 1], 20, 'b', 's')
    plt.title('k = %d' % k)
    plt.xlim(0, 100), plt.ylim(0, 100)
plt.tight_layout()
plt.show()
print('격자 점 %d 개를 k 3종류로 예측 완료' % len(grid))
`, desc: '<p>k=1 에서는 반대편 무리 안에 들어간 점 하나 주변에 작은 “섬”이 생깁니다. k 를 키울수록 경계가 매끈해집니다.</p>' },
      { type: 'code', title: '예제 5 · 학습/테스트로 나누고 k 별 정확도 비교', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

rng = np.random.default_rng(3)
N = 150   # 무리당 데이터 수
red = rng.normal((35, 40), 13, (N, 2))
blue = rng.normal((65, 60), 13, (N, 2))
X = np.vstack([red, blue]).astype(np.float32)
y = np.array([0] * N + [1] * N, np.float32).reshape(-1, 1)

# 섞은 뒤 앞 2/3 은 학습, 뒤 1/3 은 테스트
idx = rng.permutation(len(X))
X, y = X[idx], y[idx]
n_train = len(X) * 2 // 3
X_train, y_train = X[:n_train], y[:n_train]
X_test, y_test = X[n_train:], y[n_train:]
print('학습 %d 개 / 테스트 %d 개' % (len(X_train), len(X_test)))

knn = cv.ml.KNearest_create()
knn.train(X_train, cv.ml.ROW_SAMPLE, y_train)

ks = [1, 3, 5, 9, 15, 25, 51, 101]
train_acc, test_acc = [], []
for k in ks:
    _, r_tr, _, _ = knn.findNearest(X_train, k)
    _, r_te, _, _ = knn.findNearest(X_test, k)
    train_acc.append((r_tr == y_train).mean() * 100)
    test_acc.append((r_te == y_test).mean() * 100)
    print('k=%3d  학습 정확도 %5.1f%%   테스트 정확도 %5.1f%%' % (k, train_acc[-1], test_acc[-1]))

plt.plot(ks, train_acc, 'o-', label='train')
plt.plot(ks, test_acc, 's-', label='test')
plt.xscale('log')
plt.xlabel('k'), plt.ylabel('accuracy (%)')
plt.title('kNN accuracy vs k')
plt.legend()
plt.show()
`, desc: '<p>k=1 의 <b>학습 정확도는 100%</b> 입니다(자기 자신이 가장 가까운 이웃이니까요). 하지만 테스트 정확도는 그보다 낮습니다. 테스트 곡선이 가장 높은 곳 근처의 k 를 고르면 됩니다.</p>' },
      { type: 'warn', html: `<p><b>특징의 단위(스케일)를 맞추세요.</b> kNN 은 거리로 판단하므로 [키(cm) 150~190, 시력 0.1~2.0] 처럼 범위가 크게 다르면 <b>범위가 큰 특징이 거리를 독차지</b>합니다. 특징마다 평균을 빼고 표준편차로 나누는 <b>표준화</b>나 0~1 로 맞추는 <b>정규화</b>를 먼저 하세요. (실습 2에서 확인)</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 클릭한 곳에 새 이웃을 놓고 분류하기',
        desc: `<p>400×400 캔버스에 빨간 가족(▲ 대신 빨간 점)과 파란 가족(파란 점) 25명이 있습니다. <b>마우스를 클릭한 위치</b>에 새 이웃을 놓고 kNN 으로 분류해,
새 이웃을 예측한 색으로 칠하고 <b>가장 가까운 k 명에게 선</b>을 그어 보세요. 트랙바 <code>k</code> 로 이웃 수를 바꿀 수 있습니다. 오른쪽 버튼을 누르면 새 이웃을 모두 지웁니다.</p>
<p>캔버스 좌표(0~400)를 4로 나누면 학습 데이터 좌표(0~100)가 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

np.random.seed(7)
trainData = np.random.randint(0, 100, (25, 2)).astype(np.float32)
responses = np.random.randint(0, 2, (25, 1)).astype(np.float32)
knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)

COLORS = [(0, 0, 255), (255, 0, 0)]   # BGR: 0 = 빨강, 1 = 파랑
canvas = np.full((400, 400, 3), 255, np.uint8)

def draw_base():
    canvas[:] = 255
    for (x, y), r in zip(trainData, responses.ravel()):
        cv.circle(canvas, (int(x * 4), int(y * 4)), 7, COLORS[int(r)], -1)

def nothing(x):
    pass

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        k = max(1, cv.getTrackbarPos('k', 'town'))
        p = np.array([[x / 4, y / 4]], np.float32)
        # TODO 1: knn.findNearest(p, k) 로 예측하고 label 에 0 또는 1 저장
        label = 0
        # TODO 2: 가장 가까운 k 명을 찾아 초록 선으로 연결하기 (거리 계산 후 np.argsort)
        cv.circle(canvas, (x, y), 9, COLORS[label], -1)
        cv.circle(canvas, (x, y), 9, (0, 200, 0), 2)
        print('새 이웃 (%d, %d) → %s' % (x / 4, y / 4, ['Red', 'Blue'][label]))
    elif event == cv.EVENT_RBUTTONDOWN:
        draw_base()

draw_base()
cv.imshow('town', canvas)
cv.createTrackbar('k', 'town', 3, 9, nothing)
cv.setMouseCallback('town', on_mouse)
print('town 창을 클릭하세요 (오른쪽 버튼 = 지우기)')
`,
        hint: `<p><code>_, res, nb, dist = knn.findNearest(p, k)</code> 후 <code>label = int(res[0, 0])</code>. 이웃 찾기: <code>d = ((trainData - p) ** 2).sum(axis=1)</code>, <code>for i in np.argsort(d)[:k]:</code> 안에서 <code>cv.line(canvas, (x, y), (int(trainData[i, 0] * 4), int(trainData[i, 1] * 4)), (0, 200, 0), 1)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

np.random.seed(7)
trainData = np.random.randint(0, 100, (25, 2)).astype(np.float32)
responses = np.random.randint(0, 2, (25, 1)).astype(np.float32)
knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)

COLORS = [(0, 0, 255), (255, 0, 0)]   # BGR: 0 = 빨강, 1 = 파랑
canvas = np.full((400, 400, 3), 255, np.uint8)

def draw_base():
    canvas[:] = 255
    for (x, y), r in zip(trainData, responses.ravel()):
        cv.circle(canvas, (int(x * 4), int(y * 4)), 7, COLORS[int(r)], -1)

def nothing(x):
    pass

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        k = max(1, cv.getTrackbarPos('k', 'town'))
        p = np.array([[x / 4, y / 4]], np.float32)
        _, res, nb, dist = knn.findNearest(p, k)
        label = int(res[0, 0])
        d = ((trainData - p) ** 2).sum(axis=1)
        for i in np.argsort(d)[:k]:
            cv.line(canvas, (x, y), (int(trainData[i, 0] * 4), int(trainData[i, 1] * 4)), (0, 200, 0), 1, cv.LINE_AA)
        cv.circle(canvas, (x, y), 9, COLORS[label], -1)
        cv.circle(canvas, (x, y), 9, (0, 200, 0), 2)
        print('새 이웃 (%d, %d) k=%d → %s  (이웃 레이블 %s)' % (x / 4, y / 4, k, ['Red', 'Blue'][label], nb.ravel().astype(int)))
    elif event == cv.EVENT_RBUTTONDOWN:
        draw_base()

draw_base()
cv.imshow('town', canvas)
cv.createTrackbar('k', 'town', 3, 9, nothing)
cv.setMouseCallback('town', on_mouse)
print('town 창을 클릭하세요 (오른쪽 버튼 = 지우기)')
`,
      },
      {
        title: '실습 2 · 특징 스케일 맞추기',
        desc: `<p>사람의 <b>[키(cm), 시력]</b> 으로 “농구부/비농구부”를 분류하는 가짜 데이터가 있습니다. 실제로는 <b>시력</b>이 두 그룹을 잘 나누도록 만들어 두었는데,
키(150~190)의 범위가 시력(0.1~2.0)보다 훨씬 커서 kNN 이 시력을 거의 무시합니다. 두 특징을 <b>표준화</b>(평균 0, 표준편차 1)한 뒤 다시 학습해 <b>테스트 정확도가 95% 이상</b>이 되게 하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(0)
N = 200
height = rng.uniform(150, 190, 2 * N)                              # 두 그룹이 거의 같음
eyesight = np.r_[rng.normal(0.6, 0.2, N), rng.normal(1.4, 0.2, N)]  # 두 그룹이 뚜렷이 다름
X = np.c_[height, eyesight].astype(np.float32)
y = np.r_[np.zeros(N), np.ones(N)].astype(np.float32).reshape(-1, 1)
idx = rng.permutation(2 * N)
X, y = X[idx], y[idx]
X_train, y_train, X_test, y_test = X[:300], y[:300], X[300:], y[300:]

def evaluate(tr, te, k=5):
    knn = cv.ml.KNearest_create()
    knn.train(tr, cv.ml.ROW_SAMPLE, y_train)
    _, r, _, _ = knn.findNearest(te, k)
    return (r == y_test).mean() * 100

print('스케일 그대로 : %.1f%%' % evaluate(X_train, X_test))

# TODO: 학습 데이터의 평균(mean)과 표준편차(std)를 구해 학습 · 테스트 모두 (X - mean) / std 로 바꾸기
X_train_s = X_train.copy()
X_test_s = X_test.copy()
print('표준화 후     : %.1f%%' % evaluate(X_train_s, X_test_s))
`,
        hint: `<p><code>mean = X_train.mean(axis=0)</code>, <code>std = X_train.std(axis=0)</code> 로 열(특징)마다 구합니다. 테스트 데이터도 <b>학습 데이터의 mean · std</b> 로 바꿔야 합니다(테스트 데이터로 다시 구하지 않기).</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(0)
N = 200
height = rng.uniform(150, 190, 2 * N)                              # 두 그룹이 거의 같음
eyesight = np.r_[rng.normal(0.6, 0.2, N), rng.normal(1.4, 0.2, N)]  # 두 그룹이 뚜렷이 다름
X = np.c_[height, eyesight].astype(np.float32)
y = np.r_[np.zeros(N), np.ones(N)].astype(np.float32).reshape(-1, 1)
idx = rng.permutation(2 * N)
X, y = X[idx], y[idx]
X_train, y_train, X_test, y_test = X[:300], y[:300], X[300:], y[300:]

def evaluate(tr, te, k=5):
    knn = cv.ml.KNearest_create()
    knn.train(tr, cv.ml.ROW_SAMPLE, y_train)
    _, r, _, _ = knn.findNearest(te, k)
    return (r == y_test).mean() * 100

print('스케일 그대로 : %.1f%%' % evaluate(X_train, X_test))

mean = X_train.mean(axis=0)
std = X_train.std(axis=0)
print('특징별 평균   :', mean, ' 표준편차:', std)
X_train_s = ((X_train - mean) / std).astype(np.float32)
X_test_s = ((X_test - mean) / std).astype(np.float32)
print('표준화 후     : %.1f%%' % evaluate(X_train_s, X_test_s))
`,
      },
    ],
    quiz: [
      { q: '손글씨 숫자 이미지 5000장과 각 이미지의 정답 숫자가 있습니다. 여기서 “레이블”에 해당하는 것은?', options: ['이미지를 펼친 400개의 픽셀 값', '이미지의 크기 20×20', '각 이미지의 정답 숫자(0~9)', 'kNN 의 k 값'], answer: 2, explain: '레이블은 각 데이터의 정답입니다. 픽셀 값을 펼친 400개 숫자는 특징 벡터입니다.' },
      { q: 'k=5 인 kNN 에서 새 데이터의 가장 가까운 이웃 5개의 레이블이 [1, 0, 1, 0, 0] 일 때 예측 결과는?', options: ['1', '0', '0.4', '판단할 수 없다'], answer: 1, explain: '다수결입니다. 0 이 3표, 1 이 2표이므로 0 으로 분류합니다.' },
      { q: 'kNN 에서 k=1 로 두고 “학습 데이터”로 정확도를 재면 거의 항상 100% 가 나오는 이유는?', options: ['k=1 이 가장 좋은 설정이라서', 'OpenCV 가 학습 데이터를 자동으로 제외해서', 'float32 로 바꿨기 때문에', '학습 데이터의 각 점은 자기 자신이 가장 가까운 이웃이라서'], answer: 3, explain: '자기 자신과의 거리가 0 이라 항상 자기 레이블을 답합니다. 그래서 성능은 학습에 쓰지 않은 테스트 데이터로 평가해야 합니다.' },
      { q: 'cv.ml.KNearest 에 대한 설명으로 옳지 않은 것은?', options: ['train() 은 사실상 데이터를 저장만 해서 빠르다', 'k 를 크게 할수록 결정 경계가 더 삐뚤빼뚤해진다', 'findNearest() 는 모든 학습 데이터와 거리를 재므로 데이터가 많으면 느리다', '특징 범위가 크게 다르면 표준화/정규화가 도움이 된다'], answer: 1, explain: 'k 가 클수록 많은 이웃이 투표해 경계가 매끈해집니다. 삐뚤빼뚤한(과적합) 경계는 k 가 작을 때 생깁니다.' },
    ],
  },

  /* ======================================================================
   * a3-2 kNN 손글씨 숫자 · 영문자 인식
   * ====================================================================== */
  {
    id: 'a3-2',
    assets: ['images/adv/digits.png', 'images/adv/letter-recognition.data'],
    summary: 'OpenCV 튜토리얼의 손글씨 숫자 5000개(digits.png)를 잘라 학습/테스트로 나누고 kNN 으로 인식해 정확도를 잽니다. 브라우저에서 kNN 이 왜 느린지 계산해 보고, 테스트 수 줄이기 · 10×10 축소 특징으로 속도를 해결한 뒤, 틀린 샘플 모아 보기 · 데이터 저장 · 영문자(UCI) 인식까지 해 봅니다.',
    goals: [
      'digits.png 를 np.vsplit · np.hsplit 으로 20×20 셀 5000개로 나누고 레이블을 만들 수 있다',
      '학습/테스트를 나눠 kNN 정확도를 계산하고, 틀린 샘플을 모아 원인을 추측할 수 있다',
      'kNN 예측 시간이 “학습 수 × 테스트 수 × 특징 수”에 비례함을 설명하고 특징 축소로 속도를 높일 수 있다',
      'np.savez / np.load 로 학습 데이터를 저장 · 불러오고, CSV 형식의 영문자 데이터로 kNN 을 적용할 수 있다',
    ],
    schedule: [['도입 · OCR 과제 소개', 4], ['digits.png 데이터 준비', 8], ['kNN 학습과 정확도 · 오답 분석', 10], ['속도 문제 · 특징 축소 · 저장', 8], ['영문자 인식', 5], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 손글씨 숫자 인식 (OCR) 데이터</h3>
<p><b>OCR(Optical Character Recognition, 광학 문자 인식)</b>은 이미지 속 글자를 컴퓨터가 읽을 수 있는 문자로 바꾸는 기술입니다. OpenCV 튜토리얼은 가장 기초적인 OCR 로 <b>손글씨 숫자 0~9</b> 인식을 kNN 으로 해 봅니다.</p>
<p>데이터 이미지 <code>digits.png</code> 의 구조:</p>
<ul>
<li>전체 크기 <b>2000×1000</b> (가로×세로), 흑백</li>
<li>숫자 하나가 <b>20×20</b> 칸 → 가로 100칸 × 세로 50줄 = <b>5000개</b></li>
<li>위에서부터 <b>5줄씩 같은 숫자</b>: 0~4번 줄은 ‘0’, 5~9번 줄은 ‘1’ … → 숫자마다 500개</li>
</ul>
<p>한 칸(20×20)을 한 줄로 펼치면 <b>400개 숫자로 된 특징 벡터</b>가 됩니다. 픽셀 값 자체를 특징으로 쓰는 가장 단순한 방법입니다.</p>` },
      { type: 'image', src: 'adv/digits.png', caption: 'digits.png — 20×20 손글씨 숫자 5000개 (숫자마다 500개, 2000×1000)' },
      { type: 'code', title: '예제 1 · digits.png 를 5000개 셀로 나누기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('digits.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
print('전체 이미지:', gray.shape)          # (1000, 2000)

# 세로로 50줄로 자르고, 각 줄을 가로 100칸으로 자르기 (튜토리얼)
cells = [np.hsplit(row, 100) for row in np.vsplit(gray, 50)]
x = np.array(cells)
print('셀 배열 x :', x.shape)              # (50, 100, 20, 20)

# 레이블: 줄 번호 // 5 = 숫자
row_labels = np.arange(50) // 5
print('줄별 숫자  :', row_labels)

# 숫자별 첫 10개를 모아 확대해서 보기
rows = []
for d in range(10):
    rows.append(np.hstack(x[d * 5, :10]))        # d 숫자의 첫 줄, 앞 10칸
sheet = np.vstack(rows)                           # 200×200
cv.imshow('first 10 of each digit (x3)', cv.resize(sheet, None, fx=3, fy=3, interpolation=cv.INTER_NEAREST))

one = x[15, 0]    # 15번 줄 = 숫자 3
print('숫자 3 한 칸의 특징 벡터 길이:', one.reshape(-1).size, ' 앞부분:', one.reshape(-1)[40:60])
`, desc: '<p><code>np.vsplit(gray, 50)</code> 은 세로로 50등분(가로로 자르기), <code>np.hsplit(row, 100)</code> 은 가로로 100등분입니다. 같은 숫자라도 기울기 · 두께 · 크기가 제각각인 것을 확인하세요.</p>' },
      { type: 'text', html: `<h3>2. 학습 데이터와 테스트 데이터 나누기</h3>
<p>튜토리얼은 각 줄의 <b>왼쪽 50칸을 학습</b>, <b>오른쪽 50칸을 테스트</b>에 씁니다. 그래서 학습 2500개, 테스트 2500개이고 두 쪽 모두 숫자마다 250개씩 들어갑니다.</p>
<pre>train = x[:, :50].reshape(-1, 400).astype(np.float32)   # (2500, 400)
test  = x[:, 50:100].reshape(-1, 400).astype(np.float32) # (2500, 400)
k = np.arange(10)
train_labels = np.repeat(k, 250)[:, np.newaxis]          # 0 이 250개, 1 이 250개 …</pre>
<p><code>reshape(-1, 400)</code> 은 (50, 50, 20, 20) 을 줄 순서대로 펼치므로, 앞 250개(0~4번 줄)가 모두 숫자 0 입니다. 그래서 레이블을 <code>np.repeat</code> 로 간단히 만들 수 있습니다.</p>` },
      { type: 'warn', html: `<p><b>브라우저에서는 튜토리얼 원본이 약 7초 걸립니다.</b> kNN 은 테스트 한 개마다 학습 데이터 2500개와의 거리를 모두 계산합니다.
2500(테스트) × 2500(학습) × 400(특징) ≈ <b>25억 번</b>의 뺄셈 · 곱셈 · 덧셈! PC 의 OpenCV 는 여러 CPU 코어와 SIMD 로 0.1초 만에 끝내지만, 브라우저(WebAssembly, 1코어)는 훨씬 느립니다.
그래서 아래 예제는 <b>테스트를 500개(숫자마다 50개)로 줄여</b> 약 1.5초로 만듭니다. 계산량이 테스트 수에 정확히 비례하므로 1/5 이 됩니다.</p>` },
      { type: 'code', title: '예제 2 · kNN 으로 손글씨 숫자 인식 (테스트 500개)', code: String.raw`
import cv2 as cv
import numpy as np
import time

img = cv.imread('digits.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
x = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])   # (50, 100, 20, 20)

train = x[:, :50].reshape(-1, 400).astype(np.float32)     # (2500, 400)
test = x[:, 50:100].reshape(-1, 400).astype(np.float32)   # (2500, 400)
k = np.arange(10)
train_labels = np.repeat(k, 250)[:, np.newaxis]
test_labels = train_labels.copy()

# 브라우저 속도를 위해 테스트는 5개 중 1개만 (숫자마다 50개씩 = 500개)
sel = np.arange(0, 2500, 5)
test_small, test_labels_small = test[sel], test_labels[sel]

knn = cv.ml.KNearest_create()
t0 = time.perf_counter()
knn.train(train, cv.ml.ROW_SAMPLE, train_labels)
t1 = time.perf_counter()
ret, result, neighbours, dist = knn.findNearest(test_small, k=5)
t2 = time.perf_counter()

matches = result == test_labels_small
correct = np.count_nonzero(matches)
accuracy = correct * 100.0 / result.size
print('학습 시간 %.3f 초, 예측 시간 %.3f 초 (테스트 %d 개)' % (t1 - t0, t2 - t1, len(test_small)))
print('정확도: %.2f%% (%d / %d)' % (accuracy, correct, result.size))

# 숫자별 정확도
for d in range(10):
    m = test_labels_small.ravel() == d
    print('  숫자 %d: %5.1f%%' % (d, matches.ravel()[m].mean() * 100))
`, desc: '<p>튜토리얼(테스트 2500개 전체)의 정확도는 <b>91.76%</b>, 여기 500개 부분집합은 약 <b>93.4%</b> 가 나옵니다. 부분집합이 작으면 정확도가 조금 달라질 수 있습니다. 어떤 숫자가 가장 어려운가요?</p>' },
      { type: 'code', title: '예제 3 · 틀린 샘플 모아 보기', code: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
x = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
train = x[:, :50].reshape(-1, 400).astype(np.float32)
test = x[:, 50:100].reshape(-1, 400).astype(np.float32)
labels = np.repeat(np.arange(10), 250)[:, np.newaxis]
sel = np.arange(0, 2500, 5)
test, test_labels = test[sel], labels[sel]

knn = cv.ml.KNearest_create()
knn.train(train, cv.ml.ROW_SAMPLE, labels)
ret, result, neighbours, dist = knn.findNearest(test, k=5)

wrong = np.where(result.ravel() != test_labels.ravel())[0]
print('틀린 개수:', len(wrong))

# 틀린 샘플을 한 장에 모으기: 칸마다 60×60 으로 키우고 “정답>예측” 글자 쓰기
tiles = []
for i in wrong[:40]:
    tile = cv.resize(test[i].reshape(20, 20).astype(np.uint8), (60, 60), interpolation=cv.INTER_NEAREST)
    tile = cv.cvtColor(tile, cv.COLOR_GRAY2BGR)
    cv.putText(tile, '%d>%d' % (test_labels[i, 0], result[i, 0]), (2, 12), cv.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
    tile = cv.copyMakeBorder(tile, 1, 1, 1, 1, cv.BORDER_CONSTANT, value=(80, 80, 80))
    tiles.append(tile)
while len(tiles) % 10:
    tiles.append(np.zeros_like(tiles[0]))
montage = np.vstack([np.hstack(tiles[r:r + 10]) for r in range(0, len(tiles), 10)])
cv.imshow('wrong: true>pred', montage)

# 어떤 숫자를 무엇으로 헷갈렸나?
pairs = {}
for i in wrong:
    key = '%d->%d' % (test_labels[i, 0], result[i, 0])
    pairs[key] = pairs.get(key, 0) + 1
print('자주 헷갈린 쌍:', sorted(pairs.items(), key=lambda kv: -kv[1])[:6])
`, desc: '<p>노란 글씨는 <b>정답&gt;예측</b> 입니다. 많이 기울어졌거나, 두껍거나, 한쪽으로 치우친 글씨가 대부분입니다. 픽셀을 그대로 비교하는 kNN 은 “모양이 조금만 옮겨져도” 거리가 멀어지기 때문입니다 → 4교시에 <b>기울기 보정(deskew) + HOG 특징</b>으로 해결합니다.</p>' },
      { type: 'text', html: `<h3>3. 특징을 줄여서 빠르게: 20×20 → 10×10</h3>
<p>예측 시간은 대략 <b>학습 수 × 테스트 수 × 특징 수</b>에 비례합니다. 테스트 수를 줄이는 대신 <b>특징 수를 줄이는</b> 방법도 있습니다.
20×20 셀을 10×10 으로 줄이면(2×2 칸 평균) 특징이 400 → <b>100개(1/4)</b>가 되어 테스트 2500개 전체도 브라우저에서 약 2초 안에 끝납니다.</p>
<p>놀랍게도 정확도는 거의 떨어지지 않습니다. 손글씨 인식에 필요한 정보는 “대략 어디에 획이 있는가” 이고, 픽셀 하나하나의 세밀함은 오히려 노이즈이기 때문입니다.
이처럼 <b>좋은 특징은 짧으면서도 구분에 필요한 정보만 담은 특징</b>입니다.</p>` },
      { type: 'code', title: '예제 4 · 10×10 축소 특징으로 전체 테스트와 k 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
x = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])   # (50, 100, 20, 20)

# 2×2 칸씩 평균 → (50, 100, 10, 10). cv.resize(cell, (10, 10), interpolation=cv.INTER_AREA) 와 같은 결과
small = x.reshape(50, 100, 10, 2, 10, 2).mean(axis=(3, 5)).astype(np.float32)
train = small[:, :50].reshape(-1, 100)
test = small[:, 50:].reshape(-1, 100)
labels = np.repeat(np.arange(10), 250)[:, np.newaxis]
print('특징 수: 400 →', train.shape[1])

knn = cv.ml.KNearest_create()
knn.train(train, cv.ml.ROW_SAMPLE, labels)

t0 = time.perf_counter()
ret, result, neighbours, dist = knn.findNearest(test, k=9)   # 가까운 9개를 한 번에 구해 두기
print('테스트 %d 개 예측: %.2f 초' % (len(test), time.perf_counter() - t0))

# neighbours 는 가까운 순서라서, 앞 k 개로 다수결을 내면 k=1,3,5,7,9 를 모두 비교할 수 있다
nb = neighbours.astype(np.int32)
for k in (1, 3, 5, 7, 9):
    votes = np.array([np.bincount(row[:k], minlength=10) for row in nb])
    pred = votes.argmax(axis=1)   # 동점이면 작은 숫자 (OpenCV 와 약간 다를 수 있음)
    print('k=%d  정확도 %.2f%%' % (k, (pred == labels.ravel()).mean() * 100))
print('findNearest(k=9) 결과 정확도: %.2f%%' % ((result == labels).mean() * 100))

cell = x[40, 60]
view = np.hstack([cell, cv.resize(small[40, 60].astype(np.uint8), (20, 20), interpolation=cv.INTER_NEAREST)])
cv.imshow('20x20 vs 10x10 (x6)', cv.resize(view, None, fx=6, fy=6, interpolation=cv.INTER_NEAREST))
`, desc: '<p>10×10 특징으로도 전체 테스트 정확도가 약 <b>92%</b> 로 원본(91.76%)과 비슷합니다. findNearest 를 k 마다 다시 부르지 않고 <code>neighbours</code> 로 여러 k 를 한 번에 비교하는 요령도 기억해 두세요.</p>' },
      { type: 'code', title: '예제 5 · 학습 데이터 저장하고 다시 불러오기 (np.savez)', code: String.raw`
import cv2 as cv
import numpy as np
import os

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
x = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
train = x[:, :50].reshape(-1, 400).astype(np.float32)
train_labels = np.repeat(np.arange(10), 250)[:, np.newaxis]

# 저장 (튜토리얼)
np.savez('knn_data.npz', train=train, train_labels=train_labels)
print('float32 로 저장:', os.path.getsize('knn_data.npz') // 1024, 'KB')

# 픽셀 값은 0~255 정수이므로 uint8 로 저장하면 1/4 크기
np.savez_compressed('knn_data_u8.npz', train=train.astype(np.uint8), train_labels=train_labels.astype(np.uint8))
print('uint8 + 압축  :', os.path.getsize('knn_data_u8.npz') // 1024, 'KB')

# 불러오기 → 다시 float32 로 바꿔 학습
with np.load('knn_data_u8.npz') as data:
    print('저장된 이름:', data.files)
    train2 = data['train'].astype(np.float32)
    labels2 = data['train_labels'].astype(np.float32)

knn = cv.ml.KNearest_create()
knn.train(train2, cv.ml.ROW_SAMPLE, labels2)
sample = x[35, 77].reshape(1, 400).astype(np.float32)     # 35번 줄 = 숫자 7 (테스트 쪽)
ret, result, neighbours, dist = knn.findNearest(sample, k=5)
print('불러온 데이터로 예측:', int(result[0, 0]), ' 이웃:', neighbours.ravel().astype(int))
cv.imshow('sample (x8)', cv.resize(x[35, 77], None, fx=8, fy=8, interpolation=cv.INTER_NEAREST))
`, desc: '<p>kNN 은 “학습 = 데이터 저장”이므로 모델 파일 대신 <b>학습 데이터 자체</b>를 저장합니다. 브라우저 가상 폴더에 저장된 파일은 콘솔의 링크로 내려받을 수 있고, 페이지를 새로 고치기 전까지 다른 예제에서도 <code>np.load</code> 할 수 있습니다.</p>' },
      { type: 'text', html: `<h3>4. 영문자 인식: UCI Letter Recognition 데이터</h3>
<p>튜토리얼의 두 번째 예제는 이미지가 아니라 <b>이미 뽑아 둔 특징</b>을 씁니다. <code>letter-recognition.data</code> 는 UCI 머신러닝 저장소의 데이터로:</p>
<ul>
<li>20000 줄, 한 줄 = 글자 하나: <code>T,2,8,3,5,1,8,13,0,6,6,10,8,0,8,0,8</code></li>
<li>첫 칸 = <b>레이블</b>(A~Z), 나머지 <b>16개 = 특징</b>(글자 상자의 가로 · 세로 크기, 픽셀 수, 무게중심 위치, 가장자리 개수 등을 0~15 로 나타낸 값)</li>
<li>튜토리얼: 앞 10000개 학습, 뒤 10000개 테스트 → 정확도 약 93%</li>
</ul>
<p>글자 ‘A’ 를 숫자로 바꾸기 위해 <code>np.loadtxt</code> 의 <code>converters</code> 로 <code>ord(ch) - ord('A')</code> (A=0, B=1, …)를 적용합니다. 브라우저 속도를 위해 테스트는 앞 2000개만 씁니다.</p>` },
      { type: 'code', title: '예제 6 · kNN 영문자 인식 (튜토리얼, 테스트 2000개)', code: String.raw`
import cv2 as cv
import numpy as np
import time

# 첫 열의 글자(A~Z)를 0~25 숫자로 바꿔서 읽기
data = np.loadtxt('letter-recognition.data', dtype='float32', delimiter=',',
                  converters={0: lambda ch: ord(ch) - ord('A')})
print('데이터 shape:', data.shape)       # (20000, 17)

train, test = np.vsplit(data, 2)          # 앞 10000 / 뒤 10000
responses, trainData = np.hsplit(train, [1])   # 첫 열 = 레이블, 나머지 16열 = 특징
labels, testData = np.hsplit(test, [1])
testData, labels = testData[:2000], labels[:2000]   # 브라우저 속도를 위해 테스트 2000개

knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)
t0 = time.perf_counter()
ret, result, neighbours, dist = knn.findNearest(testData, k=5)
print('예측 %.2f 초' % (time.perf_counter() - t0))

correct = np.count_nonzero(result == labels)
print('정확도: %.2f%%' % (correct * 100.0 / result.size))

# 글자별 정확도가 낮은 순서 5개
letters = [chr(ord('A') + i) for i in range(26)]
acc = [(result[labels == i] == i).mean() * 100 for i in range(26)]
worst = np.argsort(acc)[:5]
print('어려운 글자:', ', '.join('%s %.0f%%' % (letters[i], acc[i]) for i in worst))
print('첫 10개 예측:', ''.join(letters[int(r)] for r in result[:10, 0]), ' 정답:', ''.join(letters[int(r)] for r in labels[:10, 0]))
`, desc: '<p>테스트 2000개 정확도는 약 <b>92%</b>(전체 10000개는 약 93%)입니다. 특징이 16개뿐이라 학습 10000개여도 빠릅니다. 특징을 잘 설계하면 짧은 벡터로도 높은 성능을 낼 수 있습니다.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 학습 데이터 양과 정확도의 관계',
        desc: `<p>학습 데이터가 많을수록 kNN 이 더 정확해질까요? 10×10 축소 특징을 사용해 숫자마다 학습 데이터를 <b>5, 25, 50, 100, 250개</b>로 바꿔 가며 테스트 500개의 정확도를 출력하고 그래프로 그리세요.
각 줄의 <b>왼쪽 n/5 칸</b>을 쓰면 숫자마다 n 개가 됩니다(한 숫자 = 5줄).</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
x = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
small = x.reshape(50, 100, 10, 2, 10, 2).mean(axis=(3, 5)).astype(np.float32)

test = small[:, 50:].reshape(-1, 100)[::5]                 # 테스트 500개
test_labels = np.repeat(np.arange(10), 250)[::5, np.newaxis]

sizes = [5, 25, 50, 100, 250]      # 숫자마다 학습 데이터 수
accs = []
for n in sizes:
    cols = n // 5                   # 한 줄에서 쓸 칸 수
    # TODO 1: small[:, :cols] 를 (-1, 100) 으로 펼쳐 train 만들기
    train = small[:, :50].reshape(-1, 100)
    # TODO 2: train 순서에 맞는 레이블 만들기 (숫자마다 n 개씩)
    train_labels = np.repeat(np.arange(10), 250)[:, np.newaxis]
    knn = cv.ml.KNearest_create()
    knn.train(train, cv.ml.ROW_SAMPLE, train_labels)
    _, result, _, _ = knn.findNearest(test, k=3)
    accs.append((result == test_labels).mean() * 100)
    print('숫자마다 %3d 개 학습 → 정확도 %.1f%%' % (n, accs[-1]))

plt.plot(sizes, accs, 'o-')
plt.xlabel('train samples per digit'), plt.ylabel('test accuracy (%)')
plt.title('More data, better kNN?')
plt.show()
`,
        hint: `<p><code>train = small[:, :cols].reshape(-1, 100)</code> 는 줄 순서대로 펼쳐지므로 숫자 0 이 (5줄 × cols 칸 = n)개, 그다음 1 이 n 개 … 입니다. 레이블은 <code>np.repeat(np.arange(10), n)[:, np.newaxis]</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
x = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
small = x.reshape(50, 100, 10, 2, 10, 2).mean(axis=(3, 5)).astype(np.float32)

test = small[:, 50:].reshape(-1, 100)[::5]                 # 테스트 500개
test_labels = np.repeat(np.arange(10), 250)[::5, np.newaxis]

sizes = [5, 25, 50, 100, 250]      # 숫자마다 학습 데이터 수
accs = []
for n in sizes:
    cols = n // 5                   # 한 줄에서 쓸 칸 수
    train = small[:, :cols].reshape(-1, 100)
    train_labels = np.repeat(np.arange(10), n)[:, np.newaxis]
    knn = cv.ml.KNearest_create()
    knn.train(train, cv.ml.ROW_SAMPLE, train_labels)
    _, result, _, _ = knn.findNearest(test, k=3)
    accs.append((result == test_labels).mean() * 100)
    print('숫자마다 %3d 개 학습 → 정확도 %.1f%%' % (n, accs[-1]))

plt.plot(sizes, accs, 'o-')
plt.xlabel('train samples per digit'), plt.ylabel('test accuracy (%)')
plt.title('More data, better kNN?')
plt.show()
`,
      },
      {
        title: '실습 2 · 영문자 인식에서 가장 좋은 k 찾기',
        desc: `<p>영문자 데이터에서 k 를 <b>1, 3, 5, 7, 9</b> 로 바꿔 테스트 500개의 정확도를 비교하고, 가장 좋은 k 와 그때 가장 많이 헷갈린 <b>(정답 → 예측) 글자 쌍 3개</b>를 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

data = np.loadtxt('letter-recognition.data', dtype='float32', delimiter=',',
                  converters={0: lambda ch: ord(ch) - ord('A')})
train, test = np.vsplit(data, 2)
responses, trainData = np.hsplit(train, [1])
labels, testData = np.hsplit(test, [1])
testData, labels = testData[:500], labels[:500]
L = [chr(ord('A') + i) for i in range(26)]

knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)

best_k, best_acc, best_result = 1, 0, None
for k in (1, 3, 5, 7, 9):
    # TODO 1: findNearest 로 예측하고 정확도(%) 계산
    acc = 0.0
    result = labels.copy()
    print('k=%d 정확도 %.2f%%' % (k, acc))
    # TODO 2: 가장 좋은 k 기억하기

print('가장 좋은 k =', best_k)
# TODO 3: best_result 에서 틀린 (정답, 예측) 쌍을 세어 많은 순서 3개 출력
`,
        hint: `<p>예측: <code>_, result, _, _ = knn.findNearest(testData, k)</code>, 정확도: <code>(result == labels).mean() * 100</code>. 쌍 세기는 사전으로: <code>key = L[int(t)] + '->' + L[int(p)]</code>, <code>pairs[key] = pairs.get(key, 0) + 1</code> 후 <code>sorted(pairs.items(), key=lambda kv: -kv[1])[:3]</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

data = np.loadtxt('letter-recognition.data', dtype='float32', delimiter=',',
                  converters={0: lambda ch: ord(ch) - ord('A')})
train, test = np.vsplit(data, 2)
responses, trainData = np.hsplit(train, [1])
labels, testData = np.hsplit(test, [1])
testData, labels = testData[:500], labels[:500]
L = [chr(ord('A') + i) for i in range(26)]

knn = cv.ml.KNearest_create()
knn.train(trainData, cv.ml.ROW_SAMPLE, responses)

best_k, best_acc, best_result = 1, 0, None
for k in (1, 3, 5, 7, 9):
    _, result, _, _ = knn.findNearest(testData, k)
    acc = (result == labels).mean() * 100
    print('k=%d 정확도 %.2f%%' % (k, acc))
    if acc > best_acc:
        best_k, best_acc, best_result = k, acc, result

print('가장 좋은 k =', best_k, '(%.2f%%)' % best_acc)
pairs = {}
for t, p in zip(labels.ravel(), best_result.ravel()):
    if t != p:
        key = L[int(t)] + '->' + L[int(p)]
        pairs[key] = pairs.get(key, 0) + 1
print('많이 헷갈린 쌍:', sorted(pairs.items(), key=lambda kv: -kv[1])[:3])
`,
      },
    ],
    quiz: [
      { q: 'digits.png(2000×1000)를 np.vsplit(gray, 50) 후 각 줄을 np.hsplit(row, 100) 하면 셀 하나의 크기는?', options: ['50×100', '20×20', '10×10', '40×20'], answer: 1, explain: '세로 1000/50 = 20, 가로 2000/100 = 20 이므로 20×20 셀 5000개가 됩니다.' },
      { q: '학습 2500개 · 특징 400개인 kNN 에서 테스트를 2500개 → 500개로 줄이면 예측 시간은 대략 어떻게 되나요?', options: ['변화 없다', '약 1/25 로 줄어든다', '약 1/5 로 줄어든다', '오히려 늘어난다'], answer: 2, explain: 'kNN 예측 계산량은 테스트 수 × 학습 수 × 특징 수에 비례하므로 테스트를 1/5 로 줄이면 시간도 약 1/5 입니다.' },
      { q: '20×20 셀을 10×10 으로 줄여 특징을 100개로 만들었을 때의 결과로 가장 알맞은 것은?', options: ['정보가 사라져 정확도가 50% 아래로 떨어진다', '특징 수가 1/4 이 되어 빨라지고, 정확도는 비슷하다', '학습 시간만 줄고 예측 시간은 같다', 'kNN 에서는 특징 수를 바꿀 수 없다'], answer: 1, explain: '손글씨 구분에는 대략적인 획 위치만 있으면 충분해 정확도는 약 92% 로 비슷하고, 거리 계산량은 1/4 로 줄어듭니다.' },
      { q: 'letter-recognition.data 를 읽을 때 converters={0: lambda ch: ord(ch) - ord(\'A\')} 를 쓰는 이유는?', options: ['특징 값을 0~1 로 정규화하려고', '파일의 쉼표를 제거하려고', '글자를 대문자로 바꾸려고', '첫 열의 글자 레이블(A~Z)을 0~25 숫자로 바꾸려고'], answer: 3, explain: 'OpenCV ml 모듈은 숫자 배열만 받으므로 레이블 글자를 A=0, B=1 … 숫자로 바꿔 float32 배열로 읽습니다.' },
    ],
  },

  /* ======================================================================
   * a3-3 SVM 이해
   * ====================================================================== */
  {
    id: 'a3-3',
    summary: '두 무리 사이에 “가장 넓은 길”을 내는 서포트 벡터 머신(SVM)의 직관을 배웁니다. 초평면 · 마진 · 서포트 벡터의 의미를 그림으로 확인하고, cv.ml.SVM 으로 선형 · RBF 커널을 학습시켜 격자 예측으로 결정 영역을 그린 뒤, C 와 gamma 를 트랙바로 바꾸며 과적합을 눈으로 봅니다.',
    goals: [
      '결정 경계(초평면) · 마진 · 서포트 벡터의 뜻을 그림으로 설명할 수 있다',
      'cv.ml.SVM_create() 로 타입 · 커널 · C · gamma 를 설정해 학습하고 predict() 로 분류할 수 있다',
      '격자 점을 한꺼번에 예측해 결정 영역과 마진(RAW_OUTPUT = ±1)을 시각화할 수 있다',
      '선형으로 나눌 수 없는 데이터에 RBF 커널이 필요한 이유와 C · gamma 가 과적합에 미치는 영향을 설명할 수 있다',
    ],
    schedule: [['도입 · kNN 과 비교', 4], ['초평면 · 마진 · 서포트 벡터', 10], ['C: 넓은 마진 vs 오분류', 8], ['비선형 데이터와 커널', 10], ['gamma · 트랙바 실험 · trainAuto', 8], ['실습 과제', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. kNN 의 한계와 SVM 의 아이디어</h3>
<p>kNN 은 예측할 때마다 <b>모든 학습 데이터</b>와 거리를 재야 했습니다. 데이터가 많으면 느리고, 저장 공간도 많이 듭니다.
<b>SVM(Support Vector Machine, 서포트 벡터 머신)</b>은 반대로 학습할 때 시간을 들여 <b>두 무리를 가르는 경계선 하나</b>를 찾아 두고, 예측할 때는 “새 점이 선의 어느 쪽인가”만 봅니다.</p>
<p>그런데 두 무리를 가르는 선은 무수히 많습니다. 어떤 선이 가장 좋을까요? 튜토리얼의 답은 <b>“양쪽 데이터에서 가장 멀리 떨어진 선”</b>입니다.</p>
<ul>
<li><b>결정 경계 (Decision boundary, 초평면 Hyperplane)</b> — 2차원에서는 직선, 3차원에서는 평면, 그 이상은 초평면</li>
<li><b>마진 (Margin)</b> — 경계선에서 가장 가까운 데이터까지의 거리의 2배 = 경계 양옆으로 낸 “길의 폭”. SVM 은 <b>마진이 최대</b>가 되는 선을 찾음</li>
<li><b>서포트 벡터 (Support vectors)</b> — 길의 가장자리에 걸친 데이터들. 경계는 <b>이 점들만으로 결정</b>되고, 나머지 점은 지워도 경계가 그대로</li>
</ul>
<p>비유: 두 마을 사이에 <b>가장 넓은 도로</b>를 내는 것. 도로 폭을 정하는 것은 도로에 가장 가까운 집(서포트 벡터) 몇 채뿐입니다. 도로가 넓을수록 새로 이사 오는 집을 잘못 분류할 위험이 줄어듭니다.</p>` },
      { type: 'code', title: '예제 1 · 점 4개로 SVM 학습하고 결정 영역 칠하기 (Introduction to SVM)', code: String.raw`
import cv2 as cv
import numpy as np

# 학습 데이터 4개 (OpenCV "Introduction to Support Vector Machines" 튜토리얼)
labels = np.array([1, -1, -1, -1], np.int32)            # 레이블은 정수(int32)
trainingData = np.array([[501, 10], [255, 10], [501, 255], [10, 501]], np.float32)

svm = cv.ml.SVM_create()
svm.setType(cv.ml.SVM_C_SVC)          # 분류(C-Support Vector Classification)
svm.setKernel(cv.ml.SVM_LINEAR)       # 직선(선형) 경계
svm.setTermCriteria((cv.TERM_CRITERIA_MAX_ITER, 100, 1e-6))
svm.train(trainingData, cv.ml.ROW_SAMPLE, labels)

# 512×512 의 모든 좌표를 한 번에 예측 (튜토리얼은 픽셀마다 predict 를 부르지만 한꺼번에가 훨씬 빠름)
H, W = 512, 512
ys, xs = np.mgrid[0:H, 0:W]
grid = np.c_[xs.ravel(), ys.ravel()].astype(np.float32)
_, response = svm.predict(grid)
response = response.reshape(H, W)

image = np.zeros((H, W, 3), np.uint8)
image[response == 1] = (0, 255, 0)      # 초록 = 레이블 1 영역
image[response == -1] = (255, 0, 0)     # 파랑 = 레이블 -1 영역

# 학습 데이터 (흰색 = 1, 검정 = -1)
for (x, y), lb in zip(trainingData.astype(int), labels):
    cv.circle(image, (int(x), int(y)), 5, (255, 255, 255) if lb == 1 else (0, 0, 0), -1)

# 서포트 벡터 (회색 테두리). 선형 SVM 은 getSupportVectors() 가 1개로 압축되어 있어 Uncompressed 사용
sv = svm.getUncompressedSupportVectors()
print('서포트 벡터:\n', sv)
for (x, y) in sv.astype(int):
    cv.circle(image, (int(x), int(y)), 8, (128, 128, 128), 2)
cv.imshow('SVM simple example', image)
`, desc: '<p>점 4개 중 경계에 가까운 3개가 서포트 벡터로 뽑힙니다. 가장 먼 점 (10, 501)을 다른 곳으로 옮겨도(같은 쪽이면) 경계는 변하지 않습니다. 직접 바꿔 보세요.</p>' },
      { type: 'table', head: ['설정', '의미', '보통 쓰는 값'], rows: [
        ['<code>setType()</code>', '문제 종류', '<code>cv.ml.SVM_C_SVC</code> (여러 클래스 분류)'],
        ['<code>setKernel()</code>', '경계의 모양', '<code>SVM_LINEAR</code> 직선 · <code>SVM_RBF</code> 곡선(가장 많이 씀)'],
        ['<code>setC()</code>', '오분류 벌점 — 클수록 학습 데이터를 다 맞히려 함(마진 좁아짐)', '0.1 ~ 100'],
        ['<code>setGamma()</code>', 'RBF 커널 폭 — 클수록 점 하나의 영향 범위가 좁음(경계 구불구불)', '데이터 스케일에 따라'],
        ['<code>train(samples, ROW_SAMPLE, labels)</code>', 'samples 는 float32, <b>labels 는 int32</b>', ''],
        ['<code>predict(samples, flags=cv.ml.STAT_MODEL_RAW_OUTPUT)</code>', '레이블 대신 경계까지의 <b>부호 있는 값</b>(결정 함수) 반환. 0 = 경계, ±1 = 마진 가장자리', '시각화 · 신뢰도'],
      ] },
      { type: 'text', html: `<h3>2. C: 넓은 길 vs 모든 점 맞히기</h3>
<p>현실 데이터는 두 무리가 조금씩 섞여 있어서 “모든 점을 완벽히 가르는 넓은 길”이 없습니다. 튜토리얼은 이때 두 가지 목표를 저울질한다고 설명합니다.</p>
<ul>
<li>마진(길의 폭)을 <b>넓게</b> 하고 싶다 → 새 데이터에 강함</li>
<li>길 안쪽이나 반대편에 들어간 점(오분류)을 <b>줄이고</b> 싶다 → 학습 데이터에 잘 맞음</li>
</ul>
<p>이 저울의 추가 <b>C</b> 입니다. <b>C 가 작으면</b> 몇 개 틀려도 넓은 길을 택하고(서포트 벡터 많음), <b>C 가 크면</b> 길이 좁아지더라도 학습 데이터를 최대한 맞히려 합니다. 데이터에 노이즈가 많으면 작은 C, 깨끗하면 큰 C 가 대체로 좋습니다.</p>` },
      { type: 'code', title: '예제 2 · C 에 따라 달라지는 마진 (matplotlib)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

rng = np.random.default_rng(5)
A = rng.normal((35, 40), 9, (40, 2))       # 레이블 0 (빨강)
B = rng.normal((65, 60), 9, (40, 2))       # 레이블 1 (파랑)
X = np.vstack([A, B]).astype(np.float32)
y = np.r_[np.zeros(40), np.ones(40)].astype(np.int32)

xs, ys = np.meshgrid(np.linspace(0, 100, 120), np.linspace(0, 100, 120))
grid = np.c_[xs.ravel(), ys.ravel()].astype(np.float32)

plt.figure(figsize=(13, 4.3))
for i, C in enumerate([0.001, 0.05, 10]):
    svm = cv.ml.SVM_create()
    svm.setType(cv.ml.SVM_C_SVC)
    svm.setKernel(cv.ml.SVM_LINEAR)
    svm.setC(C)
    svm.setTermCriteria((cv.TERM_CRITERIA_MAX_ITER + cv.TERM_CRITERIA_EPS, 10000, 1e-6))
    svm.train(X, cv.ml.ROW_SAMPLE, y)

    # RAW_OUTPUT: 경계에서 0, 마진 가장자리에서 +1 / -1
    raw = svm.predict(grid, flags=cv.ml.STAT_MODEL_RAW_OUTPUT)[1].reshape(xs.shape)
    rawX = svm.predict(X, flags=cv.ml.STAT_MODEL_RAW_OUTPUT)[1].ravel()
    on_margin = np.abs(rawX) <= 1.0001          # 마진 안쪽 · 가장자리의 점 = 서포트 벡터
    acc = (svm.predict(X)[1].ravel() == y).mean() * 100

    plt.subplot(1, 3, i + 1)
    plt.contourf(xs, ys, raw, levels=[-1e9, 0, 1e9], colors=['#b4c8f4', '#f4b4b4'])
    plt.contour(xs, ys, raw, levels=[-1, 0, 1], colors='k', linestyles=['--', '-', '--'])
    plt.scatter(A[:, 0], A[:, 1], s=20, c='r', marker='^')
    plt.scatter(B[:, 0], B[:, 1], s=20, c='b', marker='s')
    plt.scatter(X[on_margin, 0], X[on_margin, 1], s=130, facecolors='none', edgecolors='g')
    plt.title('C=%g  support vectors=%d  train acc=%.0f%%' % (C, on_margin.sum(), acc))
    print('C=%-6g 마진 안의 점 %2d 개, 학습 정확도 %.1f%%' % (C, on_margin.sum(), acc))
plt.tight_layout()
plt.show()
`, desc: '<p>실선 = 결정 경계, 점선 = 마진 가장자리(결정 함수 ±1), 초록 동그라미 = 서포트 벡터입니다. C 가 커질수록 길이 좁아지고 서포트 벡터 수가 줄어듭니다.</p>' },
      { type: 'text', html: `<h3>3. 직선으로 안 나뉘는 데이터와 커널 트릭</h3>
<p>가운데 원 안은 빨강, 바깥은 파랑인 데이터는 <b>어떤 직선으로도</b> 나눌 수 없습니다. 튜토리얼의 해법은 <b>데이터를 더 높은 차원으로 옮기는 것</b>입니다.</p>
<ul>
<li>2차원 점 (x, y) 에 세 번째 특징 <b>z = x² + y²</b> (원점에서 거리의 제곱)를 추가하면</li>
<li>원 안의 점은 z 가 작고, 바깥 점은 z 가 커서 → 3차원에서는 <b>평면 하나</b>(z = 0.45)로 깔끔하게 나뉨</li>
<li>이 평면을 원래 2차원으로 내려 보면 → <b>원 모양 경계</b></li>
</ul>
<p>매번 새 특징을 사람이 만들기는 어렵습니다. <b>커널(Kernel)</b>은 “높은 차원으로 옮긴 뒤의 내적(유사도)”을 원래 공간에서 바로 계산하는 수학 요령(커널 트릭)입니다.
가장 많이 쓰는 <b>RBF(Radial Basis Function, 가우시안) 커널</b>은 두 점의 유사도를 <code>exp(−gamma × 거리²)</code> 로 잽니다 — 가까우면 1, 멀면 0.</p>` },
      { type: 'code', title: '예제 3 · 원형 데이터: 선형 vs 특징 추가 vs RBF 커널', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

rng = np.random.default_rng(2)
P = rng.uniform(-1, 1, (400, 2)).astype(np.float32)
y = ((P ** 2).sum(axis=1) < 0.45).astype(np.int32)       # 원 안 = 1, 바깥 = 0
Ptr, ytr, Pte, yte = P[:250], y[:250], P[250:], y[250:]

def make_svm(kernel, C=1.0, gamma=1.0):
    svm = cv.ml.SVM_create()
    svm.setType(cv.ml.SVM_C_SVC)
    svm.setKernel(kernel)
    svm.setC(C)
    svm.setGamma(gamma)
    return svm

def lift(p):   # (x, y) → (x, y, x² + y²)
    return np.c_[p, (p ** 2).sum(axis=1)].astype(np.float32)

models = [
    ('linear on (x, y)', make_svm(cv.ml.SVM_LINEAR), lambda p: p),
    ('linear on (x, y, x2+y2)', make_svm(cv.ml.SVM_LINEAR, C=10), lift),
    ('RBF kernel on (x, y)', make_svm(cv.ml.SVM_RBF, C=1, gamma=2), lambda p: p),
]
xs, ys = np.meshgrid(np.linspace(-1, 1, 100), np.linspace(-1, 1, 100))
grid = np.c_[xs.ravel(), ys.ravel()].astype(np.float32)

plt.figure(figsize=(13, 4.3))
for i, (name, svm, feat) in enumerate(models):
    svm.train(feat(Ptr), cv.ml.ROW_SAMPLE, ytr)
    acc = (svm.predict(feat(Pte))[1].ravel() == yte).mean() * 100
    region = svm.predict(feat(grid))[1].reshape(xs.shape)
    print('%-26s 테스트 정확도 %.1f%%' % (name, acc))
    plt.subplot(1, 3, i + 1)
    plt.contourf(xs, ys, region, levels=[-0.5, 0.5, 1.5], colors=['#b4c8f4', '#f4b4b4'])
    plt.scatter(Ptr[ytr == 1, 0], Ptr[ytr == 1, 1], s=12, c='r')
    plt.scatter(Ptr[ytr == 0, 0], Ptr[ytr == 0, 1], s=12, c='b')
    plt.title('%s  %.0f%%' % (name, acc))
plt.tight_layout()
plt.show()
`, desc: '<p>선형 SVM 은 한쪽으로 몰아서 약 65% 에 머물지만, z = x²+y² 를 추가하거나 RBF 커널을 쓰면 90% 이상이 됩니다. RBF 는 특징을 따로 만들지 않고도 곡선 경계를 찾습니다.</p>' },
      { type: 'text', html: `<h3>4. gamma: 점 하나가 미치는 범위</h3>
<p>RBF 커널의 <b>gamma</b> 는 학습 점 하나가 주변에 영향을 주는 <b>반경의 역수</b>라고 생각하면 됩니다.</p>
<ul>
<li><b>gamma 작음</b> → 한 점의 영향이 넓게 퍼짐 → 경계가 부드럽고 단순 (너무 작으면 거의 직선 = 과소적합)</li>
<li><b>gamma 큼</b> → 점마다 좁은 “섬”을 만듦 → 학습 데이터는 100% 맞히지만 새 데이터에서 틀림 = <b>과적합</b></li>
</ul>
<p>C 와 gamma 는 함께 조절합니다. 좋은 조합은 <b>학습에 쓰지 않은 데이터</b>로 정확도를 재서 고릅니다. 이것을 자동으로 해 주는 함수가 <code>svm.trainAuto()</code> 입니다(여러 C · gamma 를 k-겹 교차검증으로 시험).</p>` },
      { type: 'code', title: '예제 4 · 트랙바로 C 와 gamma 바꾸며 결정 영역 보기', code: String.raw`
import cv2 as cv
import numpy as np

def make_moons(n, noise, rng):
    # 초승달 두 개가 맞물린 모양의 2차원 데이터 (0~1 범위 근처)
    t = rng.uniform(0, np.pi, n)
    a = np.c_[np.cos(t), np.sin(t)]
    b = np.c_[1 - np.cos(t), 0.5 - np.sin(t)]
    X = np.vstack([a, b]) + rng.normal(0, noise, (2 * n, 2))
    X = (X - [-1.2, -0.9]) / [3.4, 2.4]
    return X.astype(np.float32), np.r_[np.zeros(n), np.ones(n)].astype(np.int32)

rng = np.random.default_rng(0)
X, y = make_moons(60, 0.3, rng)          # 학습 120개
Xt, yt = make_moons(200, 0.3, rng)       # 테스트 400개

N = 100   # 격자 해상도 (100×100 만 예측하고 400×400 으로 확대 → 빠름)
gx, gy = np.meshgrid(np.linspace(0, 1, N), np.linspace(0, 1, N))
grid = np.c_[gx.ravel(), gy.ravel()].astype(np.float32)

def nothing(v):
    pass

cv.namedWindow('result')
cv.createTrackbar('C 10^(v-2)', 'result', 3, 5, nothing)        # 0.01 ~ 1000
cv.createTrackbar('gamma 10^(v-1)', 'result', 2, 4, nothing)    # 0.1 ~ 1000

def process(frame):
    C = 10.0 ** (cv.getTrackbarPos('C 10^(v-2)', 'result') - 2)
    gamma = 10.0 ** (cv.getTrackbarPos('gamma 10^(v-1)', 'result') - 1)
    svm = cv.ml.SVM_create()
    svm.setType(cv.ml.SVM_C_SVC)
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(C)
    svm.setGamma(gamma)
    svm.train(X, cv.ml.ROW_SAMPLE, y)

    region = svm.predict(grid)[1].reshape(N, N).astype(np.uint8)
    img = np.zeros((N, N, 3), np.uint8)
    img[region == 0] = (180, 180, 250)   # 연한 빨강
    img[region == 1] = (250, 200, 180)   # 연한 파랑
    img = cv.resize(img, (400, 400), interpolation=cv.INTER_NEAREST)

    raw = svm.predict(X, flags=cv.ml.STAT_MODEL_RAW_OUTPUT)[1].ravel()
    for (px, py), lb, r in zip(X, y, raw):
        c = (int(px * 400), int(py * 400))
        cv.circle(img, c, 4, (0, 0, 220) if lb == 0 else (220, 0, 0), -1)
        if abs(r) <= 1.0001:                        # 서포트 벡터
            cv.circle(img, c, 7, (0, 150, 0), 1)

    tr = (svm.predict(X)[1].ravel() == y).mean() * 100
    te = (svm.predict(Xt)[1].ravel() == yt).mean() * 100
    cv.putText(img, 'C=%g gamma=%g' % (C, gamma), (8, 20), cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv.LINE_AA)
    cv.putText(img, 'train %.0f%%  test %.0f%%' % (tr, te), (8, 42), cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv.LINE_AA)
    return img
`, desc: '<p>입력 소스가 이미지일 때 트랙바를 움직일 때마다 다시 학습 · 예측합니다(입력 이미지는 쓰지 않음). gamma 를 1000 으로 올리면 점마다 작은 섬이 생기고 <b>train 은 오르는데 test 는 떨어지는</b> 과적합을 볼 수 있습니다. C=10, gamma=10 근처가 좋습니다.</p>' },
      { type: 'code', title: '예제 5 · trainAuto 로 C · gamma 자동 선택', code: String.raw`
import cv2 as cv
import numpy as np
import time

def make_moons(n, noise, rng):
    t = rng.uniform(0, np.pi, n)
    a = np.c_[np.cos(t), np.sin(t)]
    b = np.c_[1 - np.cos(t), 0.5 - np.sin(t)]
    X = np.vstack([a, b]) + rng.normal(0, noise, (2 * n, 2))
    X = (X - [-1.2, -0.9]) / [3.4, 2.4]
    return X.astype(np.float32), np.r_[np.zeros(n), np.ones(n)].astype(np.int32)

rng = np.random.default_rng(0)
X, y = make_moons(60, 0.3, rng)
Xt, yt = make_moons(200, 0.3, rng)

svm = cv.ml.SVM_create()
svm.setType(cv.ml.SVM_C_SVC)
svm.setKernel(cv.ml.SVM_RBF)
t0 = time.perf_counter()
# 학습 데이터를 kFold=5 조각으로 나눠 번갈아 검증하며 C · gamma 조합(격자)을 시험
svm.trainAuto(X, cv.ml.ROW_SAMPLE, y, kFold=5)
print('trainAuto %.2f 초' % (time.perf_counter() - t0))
print('선택된 C = %g, gamma = %g' % (svm.getC(), svm.getGamma()))
print('서포트 벡터 수:', svm.getSupportVectors().shape[0], '/ 학습', len(X))
print('테스트 정확도: %.1f%%' % ((svm.predict(Xt)[1].ravel() == yt).mean() * 100))

# 모델 저장과 불러오기
svm.save('svm_moons.xml')
svm2 = cv.ml.SVM_load('svm_moons.xml')
print('불러온 모델 테스트 정확도: %.1f%%' % ((svm2.predict(Xt)[1].ravel() == yt).mean() * 100))
`, desc: '<p>SVM 은 kNN 과 달리 학습 데이터 전체가 아니라 <b>서포트 벡터와 계수만</b> 저장하면 됩니다. <code>svm.save()</code> 로 XML 파일에 저장하고 <code>cv.ml.SVM_load()</code> 로 불러옵니다.</p>' },
      { type: 'tip', html: `<p><b>kNN vs SVM 한눈에</b> — kNN: 학습 즉시 · 예측 느림 · 학습 데이터 전부 저장 · 파라미터 k 하나. SVM: 학습에 시간 · 예측 빠름 · 서포트 벡터만 저장 · C · gamma 조절 필요. 데이터가 많고 특징이 좋을수록 SVM 이 유리합니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 마우스로 점을 찍어 SVM 학습시키기',
        desc: `<p>빈 캔버스(400×400)에 <b>왼쪽 클릭 = 빨강(0)</b>, <b>오른쪽 클릭 = 파랑(1)</b> 점을 찍습니다. 두 색이 모두 1개 이상이면 <b>RBF SVM 을 학습</b>하고, 100×100 격자를 예측해 결정 영역을 칠한 뒤 점을 다시 그리세요.
원형 · XOR(네 귀퉁이) 모양으로 점을 찍어 커널이 곡선 경계를 만드는지 확인해 봅니다. 더블클릭하면 모두 지웁니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

points, labels = [], []
canvas = np.full((400, 400, 3), 255, np.uint8)
N = 100
gx, gy = np.meshgrid(np.linspace(0, 1, N), np.linspace(0, 1, N))
grid = np.c_[gx.ravel(), gy.ravel()].astype(np.float32)
COLORS = [(0, 0, 220), (220, 0, 0)]

def redraw():
    canvas[:] = 255
    if len(set(labels)) == 2:
        X = np.array(points, np.float32) / 400.0   # 0~1 로 정규화
        y = np.array(labels, np.int32)
        # TODO 1: RBF SVM (C=10, gamma=10) 만들고 학습하기
        # TODO 2: grid 를 예측해 N×N 영역 이미지를 만들고 400×400 으로 키워 canvas 에 복사
        pass
    for (x, y), lb in zip(points, labels):
        cv.circle(canvas, (x, y), 5, COLORS[lb], -1)

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        points.append((x, y)); labels.append(0); redraw()
    elif event == cv.EVENT_RBUTTONDOWN:
        points.append((x, y)); labels.append(1); redraw()
    elif event == cv.EVENT_LBUTTONDBLCLK:
        points.clear(); labels.clear(); redraw()

cv.imshow('svm board', canvas)
cv.setMouseCallback('svm board', on_mouse)
print('왼쪽 클릭 = 빨강, 오른쪽 클릭 = 파랑, 더블클릭 = 지우기')
`,
        hint: `<p>학습: <code>svm = cv.ml.SVM_create()</code>, <code>setType(cv.ml.SVM_C_SVC)</code>, <code>setKernel(cv.ml.SVM_RBF)</code>, <code>setC(10)</code>, <code>setGamma(10)</code>, <code>svm.train(X, cv.ml.ROW_SAMPLE, y)</code>.
영역: <code>region = svm.predict(grid)[1].reshape(N, N)</code> → <code>small[region == 0] = (200, 200, 255)</code> … → <code>canvas[:] = cv.resize(small, (400, 400), interpolation=cv.INTER_NEAREST)</code>. 캔버스는 <b>제자리 수정</b>(<code>canvas[:] =</code>)해야 창에 반영됩니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

points, labels = [], []
canvas = np.full((400, 400, 3), 255, np.uint8)
N = 100
gx, gy = np.meshgrid(np.linspace(0, 1, N), np.linspace(0, 1, N))
grid = np.c_[gx.ravel(), gy.ravel()].astype(np.float32)
COLORS = [(0, 0, 220), (220, 0, 0)]

def redraw():
    canvas[:] = 255
    if len(set(labels)) == 2:
        X = np.array(points, np.float32) / 400.0   # 0~1 로 정규화
        y = np.array(labels, np.int32)
        svm = cv.ml.SVM_create()
        svm.setType(cv.ml.SVM_C_SVC)
        svm.setKernel(cv.ml.SVM_RBF)
        svm.setC(10)
        svm.setGamma(10)
        svm.train(X, cv.ml.ROW_SAMPLE, y)
        region = svm.predict(grid)[1].reshape(N, N)
        small = np.zeros((N, N, 3), np.uint8)
        small[region == 0] = (200, 200, 255)
        small[region == 1] = (255, 215, 200)
        canvas[:] = cv.resize(small, (400, 400), interpolation=cv.INTER_NEAREST)
        print('점 %d 개로 학습, 서포트 벡터 %d 개' % (len(points), svm.getSupportVectors().shape[0]))
    for (x, y), lb in zip(points, labels):
        cv.circle(canvas, (x, y), 5, COLORS[lb], -1)

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        points.append((x, y)); labels.append(0); redraw()
    elif event == cv.EVENT_RBUTTONDOWN:
        points.append((x, y)); labels.append(1); redraw()
    elif event == cv.EVENT_LBUTTONDBLCLK:
        points.clear(); labels.clear(); redraw()

cv.imshow('svm board', canvas)
cv.setMouseCallback('svm board', on_mouse)
print('왼쪽 클릭 = 빨강, 오른쪽 클릭 = 파랑, 더블클릭 = 지우기')
`,
      },
      {
        title: '실습 2 · C · gamma 격자 탐색으로 최고 조합 찾기',
        desc: `<p>초승달 데이터에서 C ∈ {0.1, 1, 10, 100}, gamma ∈ {0.1, 1, 10, 100, 1000} 의 <b>20가지 조합</b>을 모두 학습해 <b>검증(validation) 정확도</b> 표를 출력하고, 가장 좋은 조합으로 테스트 정확도를 구하세요.
테스트 데이터는 마지막에 <b>한 번만</b> 써야 공정한 평가가 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def make_moons(n, noise, rng):
    t = rng.uniform(0, np.pi, n)
    a = np.c_[np.cos(t), np.sin(t)]
    b = np.c_[1 - np.cos(t), 0.5 - np.sin(t)]
    X = np.vstack([a, b]) + rng.normal(0, noise, (2 * n, 2))
    X = (X - [-1.2, -0.9]) / [3.4, 2.4]
    return X.astype(np.float32), np.r_[np.zeros(n), np.ones(n)].astype(np.int32)

rng = np.random.default_rng(0)
X, y = make_moons(60, 0.3, rng)        # 학습
Xv, yv = make_moons(100, 0.3, rng)     # 검증 (조합 고르기용)
Xt, yt = make_moons(200, 0.3, rng)     # 테스트 (마지막에 한 번만)

def train_svm(C, gamma):
    svm = cv.ml.SVM_create()
    svm.setType(cv.ml.SVM_C_SVC)
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(C)
    svm.setGamma(gamma)
    svm.train(X, cv.ml.ROW_SAMPLE, y)
    return svm

Cs = [0.1, 1, 10, 100]
gammas = [0.1, 1, 10, 100, 1000]
best = (0, None, None)
print('C \\ gamma ' + ''.join('%8g' % g for g in gammas))
for C in Cs:
    row = []
    for g in gammas:
        # TODO 1: train_svm 으로 학습하고 검증 정확도(%) 구하기
        acc = 0.0
        row.append(acc)
        # TODO 2: 가장 좋은 (acc, C, g) 를 best 에 기억
    print('%8g  ' % C + ''.join('%8.1f' % a for a in row))

print('가장 좋은 조합:', best)
# TODO 3: 가장 좋은 조합으로 다시 학습해 테스트 정확도 출력
`,
        hint: `<p><code>svm = train_svm(C, g)</code> → <code>acc = (svm.predict(Xv)[1].ravel() == yv).mean() * 100</code>. <code>if acc &gt; best[0]: best = (acc, C, g)</code>. 마지막에 <code>svm = train_svm(best[1], best[2])</code> 로 테스트 정확도를 구합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def make_moons(n, noise, rng):
    t = rng.uniform(0, np.pi, n)
    a = np.c_[np.cos(t), np.sin(t)]
    b = np.c_[1 - np.cos(t), 0.5 - np.sin(t)]
    X = np.vstack([a, b]) + rng.normal(0, noise, (2 * n, 2))
    X = (X - [-1.2, -0.9]) / [3.4, 2.4]
    return X.astype(np.float32), np.r_[np.zeros(n), np.ones(n)].astype(np.int32)

rng = np.random.default_rng(0)
X, y = make_moons(60, 0.3, rng)        # 학습
Xv, yv = make_moons(100, 0.3, rng)     # 검증 (조합 고르기용)
Xt, yt = make_moons(200, 0.3, rng)     # 테스트 (마지막에 한 번만)

def train_svm(C, gamma):
    svm = cv.ml.SVM_create()
    svm.setType(cv.ml.SVM_C_SVC)
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(C)
    svm.setGamma(gamma)
    svm.train(X, cv.ml.ROW_SAMPLE, y)
    return svm

Cs = [0.1, 1, 10, 100]
gammas = [0.1, 1, 10, 100, 1000]
best = (0, None, None)
print('C \\ gamma ' + ''.join('%8g' % g for g in gammas))
for C in Cs:
    row = []
    for g in gammas:
        svm = train_svm(C, g)
        acc = (svm.predict(Xv)[1].ravel() == yv).mean() * 100
        row.append(acc)
        if acc > best[0]:
            best = (acc, C, g)
    print('%8g  ' % C + ''.join('%8.1f' % a for a in row))

print('가장 좋은 조합: 검증 %.1f%%, C=%g, gamma=%g' % best)
svm = train_svm(best[1], best[2])
print('테스트 정확도: %.1f%%' % ((svm.predict(Xt)[1].ravel() == yt).mean() * 100))
`,
      },
    ],
    quiz: [
      { q: 'SVM 의 “서포트 벡터”에 대한 설명으로 옳은 것은?', options: ['모든 학습 데이터를 뜻한다', '테스트 데이터 중 틀린 것들이다', '결정 경계에 가장 가까워 마진을 결정하는 학습 데이터들이다', '결정 경계의 기울기를 나타내는 벡터 하나다'], answer: 2, explain: '마진 가장자리(또는 안쪽)에 걸친 학습 데이터만이 경계를 결정합니다. 나머지 점은 지워도 경계가 같습니다.' },
      { q: '선형 SVM 에서 C 를 아주 크게 하면 일반적으로 어떻게 되나요?', options: ['마진이 좁아지더라도 학습 데이터를 최대한 맞히려 한다', '마진이 넓어지고 학습 데이터 오분류를 더 허용한다', '커널이 자동으로 RBF 로 바뀐다', '학습 속도와 결과가 전혀 달라지지 않는다'], answer: 0, explain: 'C 는 오분류 벌점입니다. 크면 틀리는 것을 싫어해 좁은 마진이라도 학습 데이터를 맞히려 하고, 작으면 몇 개 틀려도 넓은 마진을 택합니다.' },
      { q: 'RBF 커널의 gamma 를 너무 크게 했을 때 나타나는 현상은?', options: ['경계가 거의 직선이 된다', '학습 정확도는 높지만 테스트 정확도가 떨어지는 과적합', '서포트 벡터가 0개가 된다', '예측 결과가 모두 한 클래스가 된다'], answer: 1, explain: 'gamma 가 크면 점 하나의 영향 범위가 좁아져 점마다 작은 섬을 만들고, 학습 데이터만 외우는 과적합이 됩니다.' },
      { q: 'cv.ml.SVM 으로 분류기를 학습할 때 레이블 배열의 자료형으로 알맞은 것은?', options: ['float64', 'int32', 'uint8', 'bool'], answer: 1, explain: 'SVM_C_SVC 분류는 정수 레이블(np.int32)을 사용합니다. 특징(samples)은 float32 입니다.' },
      { q: '원 안/밖으로 나뉜 2차원 데이터를 선형 SVM 으로 분류하려면 어떤 특징을 추가하는 것이 가장 효과적일까요?', options: ['x + y', 'x − y', 'x² + y²', '상수 1'], answer: 2, explain: '원점에서의 거리 제곱 x² + y² 를 추가하면 3차원에서 평면 하나로 원 안과 밖을 나눌 수 있습니다. RBF 커널은 이런 변환을 자동으로 해 주는 셈입니다.' },
    ],
  },

  /* ======================================================================
   * a3-4 SVM + HOG 손글씨 인식
   * ====================================================================== */
  {
    id: 'a3-4',
    assets: ['images/adv/digits.png'],
    summary: '픽셀을 그대로 비교하던 kNN 대신, 글씨의 기울기를 바로 세우고(deskew) 획의 방향 분포(HOG 특징)를 뽑아 SVM 으로 학습합니다. OpenCV 튜토리얼의 파이프라인을 따라 정확도를 약 96~98% 로 끌어올리고, 특징 정규화의 함정 · 혼동 행렬 · kNN 비교 · 모델 저장을 거쳐 마우스로 쓴 숫자를 인식해 봅니다.',
    goals: [
      '이미지 모멘트로 글씨의 기울기(skew)를 구해 warpAffine 으로 바로 세울 수 있다',
      'HOG(Histogram of Oriented Gradients) 특징이 “셀별 그래디언트 방향 히스토그램”임을 설명하고 직접 계산할 수 있다',
      'HOG 특징 + RBF SVM 으로 손글씨 숫자를 학습 · 평가하고, 특징 정규화가 왜 필요한지 설명할 수 있다',
      '혼동 행렬로 어떤 숫자를 헷갈리는지 분석하고 kNN 과 정확도 · 속도를 비교할 수 있다',
    ],
    schedule: [['도입 · kNN 오답 돌아보기', 4], ['deskew: 기울기 바로 세우기', 8], ['HOG 특징 만들기', 10], ['SVM 학습 · 정규화 함정', 10], ['혼동 행렬 · kNN 비교 · 저장', 6], ['실습 과제', 7], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 왜 픽셀 그대로는 부족할까?</h3>
<p>2교시 kNN 의 틀린 샘플을 떠올려 보세요. 대부분 <b>기울어졌거나, 굵거나, 한쪽으로 치우친</b> 글씨였습니다. 픽셀을 칸칸이 비교하면 같은 ‘7’이라도 조금만 기울면 겹치는 칸이 줄어 “먼 데이터”가 됩니다.</p>
<p>OpenCV 튜토리얼 <em>OCR of Hand-written Data using SVM</em> 은 두 가지 전처리로 이 문제를 풉니다.</p>
<ol>
<li><b>Deskew(기울기 보정)</b> — 글씨의 기울어진 정도를 계산해 똑바로 세운다</li>
<li><b>HOG 특징</b> — 픽셀 밝기 대신 <b>“어느 방향의 획이 얼마나 있나”</b>를 영역별로 센다 → 조금 옮겨지거나 두께가 달라도 비슷한 값</li>
</ol>
<p>그리고 이렇게 만든 64개짜리 특징을 <b>RBF 커널 SVM</b> 으로 학습합니다. 흐름: <code>셀 자르기 → deskew → HOG → SVM 학습 → 예측 · 평가</code></p>` },
      { type: 'text', html: `<h3>2. Deskew: 모멘트로 기울기 구하기</h3>
<p>입문 과정 컨투어 시간에 배운 <b>이미지 모멘트</b>(<code>cv.moments</code>)를 다시 씁니다. 중심 모멘트 <code>mu11</code> 은 “x 가 커질 때 y 도 함께 커지는 정도”, <code>mu02</code> 는 “세로로 퍼진 정도”입니다.</p>
<ul>
<li><b>skew = mu11 / mu02</b> — 세로 1칸 내려갈 때 글씨가 가로로 얼마나 밀리는지 (기울기)</li>
<li>이만큼 가로로 반대로 밀어 주는 <b>전단(shear) 변환</b> 행렬: <code>M = [[1, skew, -0.5·20·skew], [0, 1, 0]]</code></li>
<li><code>cv.warpAffine(img, M, (20, 20), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)</code> — 세 번째 값은 가운데 줄을 기준으로 밀어서 글씨가 화면 밖으로 나가지 않게 함</li>
</ul>` },
      { type: 'code', title: '예제 1 · deskew 전후 비교하기', code: String.raw`
import cv2 as cv
import numpy as np

SZ = 20
affine_flags = cv.WARP_INVERSE_MAP | cv.INTER_LINEAR

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        # 세로 퍼짐이 없으면(빈 칸) 보정할 필요 없음
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    img = cv.warpAffine(img, M, (SZ, SZ), flags=affine_flags)
    return img

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])   # (50, 100, 20, 20)

# 숫자마다 기울기가 큰 샘플 하나씩 골라 전후 비교
before, after = [], []
for d in range(10):
    row = cells[d * 5]                       # 숫자 d 의 첫 줄 100개
    skews = []
    for c in row:
        m = cv.moments(c)
        skews.append(m['mu11'] / m['mu02'] if abs(m['mu02']) > 1e-2 else 0)
    i = int(np.argmax(np.abs(skews)))        # 가장 많이 기울어진 칸
    before.append(row[i])
    after.append(deskew(row[i]))
    print('숫자 %d: %2d번 칸 skew = %+.2f' % (d, i, skews[i]))

sheet = np.vstack([np.hstack(before), np.hstack(after)])     # 위: 원본, 아래: 보정
sheet = cv.resize(sheet, None, fx=4, fy=4, interpolation=cv.INTER_NEAREST)
cv.line(sheet, (0, 80), (sheet.shape[1], 80), 128, 1)
cv.imshow('top: original / bottom: deskewed (x4)', sheet)
`, desc: '<p>skew 가 +면 아래로 갈수록 오른쪽으로 밀린 글씨(＼ 방향), −면 반대입니다. 보정 후에는 모든 숫자가 거의 똑바로 섭니다.</p>' },
      { type: 'text', html: `<h3>3. HOG 특징: 그래디언트 방향 히스토그램</h3>
<p><b>HOG(Histogram of Oriented Gradients)</b>는 “이 영역에 어느 방향의 경계(획)가 얼마나 강하게 있나”를 세는 특징입니다. 7교시 보행자 검출에서도 같은 아이디어를 씁니다. 튜토리얼 버전은 아주 단순합니다.</p>
<ol>
<li><b>Sobel</b> 로 x · y 방향 그래디언트 gx, gy 계산 (입문 3주차)</li>
<li><code>cv.cartToPolar(gx, gy)</code> 로 <b>크기(mag)</b>와 <b>방향(ang, 0~2π)</b>으로 변환</li>
<li>방향을 <b>16개 구간(bin)</b>으로 나눔: <code>bins = int(16 × ang / 2π)</code></li>
<li>20×20 을 <b>10×10 셀 4개</b>로 나누고, 셀마다 구간별로 <b>크기를 더한 히스토그램</b>(16개 값)을 만듦 (<code>np.bincount(bins, weights=mag)</code>)</li>
<li>4개 셀 × 16 bin = <b>64개 숫자</b>를 이어 붙인 것이 특징 벡터</li>
</ol>
<p>픽셀 400개 → HOG 64개. 더 짧지만 <b>모양(획의 방향과 위치)</b>을 요약하므로 훨씬 좋은 특징입니다.</p>` },
      { type: 'code', title: '예제 2 · 숫자 하나의 HOG 특징 들여다보기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

bin_n = 16   # 방향 구간 수

def hog(img):
    gx = cv.Sobel(img, cv.CV_32F, 1, 0)
    gy = cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(bin_n * ang / (2 * np.pi))    # 0 ~ 16 구간 번호
    bin_cells = bins[:10, :10], bins[10:, :10], bins[:10, 10:], bins[10:, 10:]
    mag_cells = mag[:10, :10], mag[10:, :10], mag[:10, 10:], mag[10:, 10:]
    hists = [np.bincount(b.ravel(), m.ravel(), bin_n) for b, m in zip(bin_cells, mag_cells)]
    hist = np.hstack(hists)     # 64개
    return hist, mag, ang

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
digit = gray[15 * 20:16 * 20, 3 * 20:4 * 20]      # 15번 줄(숫자 3), 3번 칸
hist, mag, ang = hog(digit)
print('HOG 특징 길이:', hist.shape, ' 합계:', round(float(hist.sum())))

plt.figure(figsize=(12, 3.8))
plt.subplot(1, 3, 1), plt.imshow(digit, cmap='gray'), plt.title('digit (20x20)')
plt.axhline(9.5, color='y'), plt.axvline(9.5, color='y')
plt.subplot(1, 3, 2), plt.imshow(mag, cmap='hot'), plt.title('gradient magnitude')
plt.subplot(1, 3, 3)
names = ['top-left', 'bottom-left', 'top-right', 'bottom-right']
for i in range(4):
    plt.bar(np.arange(16) + i * 17, hist[i * 16:(i + 1) * 16], label=names[i])
plt.xticks([8, 25, 42, 59], ['cell 1', 'cell 2', 'cell 3', 'cell 4'])
plt.title('64-D HOG feature (4 cells x 16 bins)')
plt.legend(fontsize=7)
plt.tight_layout()
plt.show()

# 방향을 색으로: Hue = 방향, 밝기 = 크기
hsv = np.zeros((20, 20, 3), np.uint8)
hsv[..., 0] = (ang * 90 / np.pi).astype(np.uint8)       # 0~2π → 0~180
hsv[..., 1] = 255
hsv[..., 2] = cv.normalize(mag, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
cv.imshow('gradient direction as color (x12)', cv.resize(cv.cvtColor(hsv, cv.COLOR_HSV2BGR), None, fx=12, fy=12, interpolation=cv.INTER_NEAREST))
`, desc: '<p>획의 양쪽 가장자리에서 그래디언트 방향이 반대(색이 보색)로 나타납니다. 네 셀의 히스토그램 모양이 서로 다르다는 것이 곧 “숫자 3의 모양 정보”입니다.</p>' },
      { type: 'warn', html: `<p><b>튜토리얼 코드 그대로 쓰면 정확도가 10% 가 나올 수 있습니다!</b> 튜토리얼의 hog() 는 히스토그램 값(크기의 합)이 수천~수만이나 되는데, RBF 커널은 <code>exp(−gamma × 거리²)</code> 이므로 거리가 수천이면 모든 유사도가 0 이 되어 학습이 실패합니다(모든 예측이 한 숫자).
OpenCV 의 <code>samples/python/digits.py</code> 처럼 <b>특징을 정규화</b>하세요: 합으로 나누고 → 제곱근(Hellinger) → 길이 1 로 맞추기. 1교시 실습 2 의 “특징 스케일” 문제와 같은 원리입니다. (예제 3에서 직접 확인)</p>` },
      { type: 'code', title: '예제 3 · 정규화 없는 HOG vs 정규화한 HOG (일부 데이터)', code: String.raw`
import cv2 as cv
import numpy as np

SZ, bin_n = 20, 16

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

def hog_raw(img):   # 튜토리얼 그대로 (정규화 없음)
    gx = cv.Sobel(img, cv.CV_32F, 1, 0)
    gy = cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(bin_n * ang / (2 * np.pi))
    bin_cells = bins[:10, :10], bins[10:, :10], bins[:10, 10:], bins[10:, 10:]
    mag_cells = mag[:10, :10], mag[10:, :10], mag[:10, 10:], mag[10:, 10:]
    return np.hstack([np.bincount(b.ravel(), m.ravel(), bin_n) for b, m in zip(bin_cells, mag_cells)])

def normalize(hist, eps=1e-7):   # samples/python/digits.py 방식 (Hellinger 정규화)
    hist = hist / (hist.sum() + eps)
    hist = np.sqrt(hist)
    return hist / (np.linalg.norm(hist) + eps)

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
# 빠른 실험을 위해 학습 1000개(각 줄 앞 20칸), 테스트 500개(각 줄 50~59칸)
train_raw = np.float32([hog_raw(deskew(c)) for c in cells[:, :20].reshape(-1, 20, 20)])
test_raw = np.float32([hog_raw(deskew(c)) for c in cells[:, 50:60].reshape(-1, 20, 20)])
train_lab = np.repeat(np.arange(10), 100)[:, np.newaxis].astype(np.int32)
test_lab = np.repeat(np.arange(10), 50)[:, np.newaxis].astype(np.int32)
train_n = np.float32([normalize(h) for h in train_raw])
test_n = np.float32([normalize(h) for h in test_raw])
print('정규화 전 특징 값 범위: 0 ~ %.0f' % train_raw.max())
print('정규화 후 특징 값 범위: 0 ~ %.2f' % train_n.max())

def run(tr, te, C, gamma):
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setType(cv.ml.SVM_C_SVC)
    svm.setC(C)
    svm.setGamma(gamma)
    svm.train(tr, cv.ml.ROW_SAMPLE, train_lab)
    pred = svm.predict(te)[1]
    return (pred == test_lab).mean() * 100, np.bincount(pred.ravel().astype(int), minlength=10)

for name, tr, te in [('정규화 없음', train_raw, test_raw), ('정규화 함', train_n, test_n)]:
    acc, counts = run(tr, te, 12.5, 0.5)
    print('%-8s C=12.5 gamma=0.5 → 정확도 %5.1f%%   숫자별 예측 개수 %s' % (name, acc, counts))
`, desc: '<p>정규화하지 않으면 모든 테스트를 한 숫자로 예측해 정확도가 10% 입니다. 정규화하면 학습 데이터 1000개만으로도 90% 를 훌쩍 넘습니다. <b>SVM(RBF) 앞에는 항상 특징 스케일을 확인</b>하세요.</p>' },
      { type: 'code', title: '예제 4 · 튜토리얼 파이프라인: deskew → HOG → SVM (전체 5000개)', code: String.raw`
import cv2 as cv
import numpy as np
import time

SZ = 20
bin_n = 16   # Number of bins
affine_flags = cv.WARP_INVERSE_MAP | cv.INTER_LINEAR

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    img = cv.warpAffine(img, M, (SZ, SZ), flags=affine_flags)
    return img

def hog(img):
    gx = cv.Sobel(img, cv.CV_32F, 1, 0)
    gy = cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.int32(bin_n * ang / (2 * np.pi))    # quantizing binvalues in (0...16)
    bin_cells = bins[:10, :10], bins[10:, :10], bins[:10, 10:], bins[10:, 10:]
    mag_cells = mag[:10, :10], mag[10:, :10], mag[:10, 10:], mag[10:, 10:]
    hists = [np.bincount(b.ravel(), m.ravel(), bin_n) for b, m in zip(bin_cells, mag_cells)]
    hist = np.hstack(hists)     # hist is a 64 bit vector
    # 정규화 (samples/python/digits.py 방식) — RBF SVM 에 꼭 필요
    eps = 1e-7
    hist /= hist.sum() + eps
    hist = np.sqrt(hist)
    hist /= np.linalg.norm(hist) + eps
    return hist

t0 = time.perf_counter()
img = cv.imread('digits.png', 0)
cells = [np.hsplit(row, 100) for row in np.vsplit(img, 50)]

# First half is trainData, remaining is testData
train_cells = [i[:50] for i in cells]
test_cells = [i[50:] for i in cells]

######     Now training      ########################
deskewed = [list(map(deskew, row)) for row in train_cells]
hogdata = [list(map(hog, row)) for row in deskewed]
trainData = np.float32(hogdata).reshape(-1, 64)
responses = np.repeat(np.arange(10), 250)[:, np.newaxis].astype(np.int32)
t1 = time.perf_counter()

svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setType(cv.ml.SVM_C_SVC)
svm.setC(12.5)
svm.setGamma(0.50625)
svm.train(trainData, cv.ml.ROW_SAMPLE, responses)
t2 = time.perf_counter()

######     Now testing      ########################
deskewed = [list(map(deskew, row)) for row in test_cells]
hogdata = [list(map(hog, row)) for row in deskewed]
testData = np.float32(hogdata).reshape(-1, bin_n * 4)
result = svm.predict(testData)[1]
t3 = time.perf_counter()

#######   Check Accuracy   ########################
mask = result == responses
correct = np.count_nonzero(mask)
print('정확도: %.2f%%  (%d / %d)' % (correct * 100.0 / result.size, correct, result.size))
print('서포트 벡터: %d 개 / 학습 2500 개' % svm.getSupportVectors().shape[0])
print('시간: 학습 특징 %.2f초, SVM 학습 %.2f초, 테스트 특징+예측 %.2f초' % (t1 - t0, t2 - t1, t3 - t2))
`, desc: '<p>kNN(픽셀, 91.8%)보다 크게 오른 <b>약 95.7%</b> 가 나옵니다. 튜토리얼 문서에는 C=2.67, gamma=5.383 이 적혀 있지만, 이 값들은 OpenCV 의 <code>digits.py</code> 샘플에서 정규화된 특징으로 찾은 값이라 특징 계산 방식에 따라 최적값이 달라집니다.</p>' },
      { type: 'text', html: `<h3>4. 혼동 행렬(Confusion Matrix)로 오답 분석하기</h3>
<p>정확도 숫자 하나로는 “무엇을 틀리는지” 알 수 없습니다. <b>혼동 행렬</b>은 10×10 표로, <b>행 = 정답, 열 = 예측</b>입니다.</p>
<ul>
<li>대각선(정답 = 예측) 칸이 클수록 좋음</li>
<li>대각선 밖의 큰 칸 = 자주 헷갈리는 쌍 (예: 4 → 9, 7 → 1)</li>
</ul>
<p>또 OpenCV 는 튜토리얼의 64차원 HOG 대신 <code>cv.HOGDescriptor</code> 로 더 정교한 HOG(블록 정규화 포함)를 빠르게 계산할 수 있습니다. 20×20 창 안에서 10×10 블록을 5칸씩 옮기며(3×3 = 9곳) 블록마다 9방향 히스토그램 → 9 × 9 = <b>81차원</b>. 7교시 보행자 검출에서 같은 클래스를 씁니다.</p>` },
      { type: 'code', title: '예제 5 · HOGDescriptor 특징 + 혼동 행렬 + kNN 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time

SZ = 20

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

# winSize, blockSize, blockStride, cellSize, nbins, derivAperture, winSigma, histogramNormType, L2HysThreshold, gammaCorrection, nlevels, signedGradient
hog = cv.HOGDescriptor((20, 20), (10, 10), (5, 5), (10, 10), 9, 1, -1, 0, 0.2, True, 64, True)
print('HOGDescriptor 특징 길이:', hog.getDescriptorSize())

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
t0 = time.perf_counter()
feats = np.float32([hog.compute(deskew(c)).ravel() for c in cells.reshape(-1, 20, 20)]).reshape(50, 100, -1)
train, test = feats[:, :50].reshape(2500, -1), feats[:, 50:].reshape(2500, -1)
labels = np.repeat(np.arange(10), 250)[:, np.newaxis].astype(np.int32)
t_feat = time.perf_counter() - t0

svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setType(cv.ml.SVM_C_SVC)
svm.setC(12.5)
svm.setGamma(0.5)
t0 = time.perf_counter()
svm.train(train, cv.ml.ROW_SAMPLE, labels)
pred_svm = svm.predict(test)[1].astype(np.int32)
t_svm = time.perf_counter() - t0

knn = cv.ml.KNearest_create()
t0 = time.perf_counter()
knn.train(train, cv.ml.ROW_SAMPLE, labels.astype(np.float32))
pred_knn = knn.findNearest(test, 5)[1].astype(np.int32)
t_knn = time.perf_counter() - t0

print('특징 계산 5000개: %.2f 초' % t_feat)
print('SVM (HOG 81)  정확도 %.2f%%  학습+예측 %.2f 초' % ((pred_svm == labels).mean() * 100, t_svm))
print('kNN (HOG 81)  정확도 %.2f%%  학습+예측 %.2f 초' % ((pred_knn == labels).mean() * 100, t_knn))
print('(참고) kNN 픽셀 400 : 정확도 91.76%  — 2교시 튜토리얼 결과')

# 혼동 행렬: 행 = 정답, 열 = 예측
conf = np.zeros((10, 10), np.int32)
for t, p in zip(labels.ravel(), pred_svm.ravel()):
    conf[t, p] += 1
print('\nSVM 혼동 행렬 (행=정답, 열=예측)')
print('     ' + ' '.join('%4d' % i for i in range(10)))
for i in range(10):
    print('%4d ' % i + ' '.join('%4d' % v for v in conf[i]))
off = conf.copy()
np.fill_diagonal(off, 0)
i, j = np.unravel_index(np.argmax(off), off.shape)
print('가장 많이 헷갈린 쌍: 정답 %d → 예측 %d (%d 번)' % (i, j, off[i, j]))

# 혼동 행렬을 그림으로 (대각선 밖의 칸을 강조하려고 log 스케일)
vis = cv.normalize(np.log1p(conf).astype(np.float32), None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
vis = cv.applyColorMap(cv.resize(vis, (300, 300), interpolation=cv.INTER_NEAREST), cv.COLORMAP_VIRIDIS)
cv.imshow('confusion matrix (row=true, col=pred)', vis)
`, desc: '<p>HOGDescriptor 특징으로 SVM 정확도가 약 <b>97.6%</b>, 같은 특징의 kNN 도 약 <b>97.4%</b> 입니다. 픽셀 kNN(91.8%)과 비교하면 <b>좋은 특징(HOG)이 가장 큰 차이</b>를 만든다는 것을 알 수 있습니다. 같은 특징이라면 SVM 은 서포트 벡터만 저장하므로 모델이 작고, 학습 데이터가 많아질수록 예측 속도에서 유리합니다.</p>' },
      { type: 'code', title: '예제 6 · 모델 저장 · 불러오기와 예측 결과 보기', code: String.raw`
import cv2 as cv
import numpy as np
import os

SZ = 20

def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

hog = cv.HOGDescriptor((20, 20), (10, 10), (5, 5), (10, 10), 9, 1, -1, 0, 0.2, True, 64, True)
gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
train = np.float32([hog.compute(deskew(c)).ravel() for c in cells[:, :50].reshape(-1, 20, 20)])
labels = np.repeat(np.arange(10), 250)[:, np.newaxis].astype(np.int32)

svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setType(cv.ml.SVM_C_SVC)
svm.setC(12.5)
svm.setGamma(0.5)
svm.train(train, cv.ml.ROW_SAMPLE, labels)
svm.save('svm_data.dat')                      # 튜토리얼과 같은 파일 이름
print('저장: svm_data.dat (%d KB)' % (os.path.getsize('svm_data.dat') // 1024))

# 다른 프로그램에서 불러온다고 생각하고 새로 읽기
model = cv.ml.SVM_load('svm_data.dat')
rng = np.random.default_rng(1)
picks = [(r, c) for r, c in zip(rng.integers(0, 50, 30), rng.integers(50, 100, 30))]   # 테스트 쪽에서 30개
tiles = []
for r, c in picks:
    f = hog.compute(deskew(cells[r, c])).reshape(1, -1)
    p = int(model.predict(f)[1][0, 0])
    ok = p == r // 5
    tile = cv.cvtColor(cv.resize(cells[r, c], (60, 60), interpolation=cv.INTER_NEAREST), cv.COLOR_GRAY2BGR)
    cv.putText(tile, str(p), (44, 16), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0) if ok else (0, 0, 255), 2)
    tiles.append(cv.copyMakeBorder(tile, 1, 1, 1, 1, cv.BORDER_CONSTANT, value=(90, 90, 90)))
sheet = np.vstack([np.hstack(tiles[i:i + 10]) for i in range(0, 30, 10)])
cv.imshow('predictions (green=correct, red=wrong)', sheet)
`, desc: '<p>저장한 파일(약 1MB)에는 서포트 벡터와 계수만 들어 있어, 학습 데이터(수 MB)를 들고 다닐 필요가 없습니다. 오른쪽 위 숫자가 예측값입니다.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 마우스로 쓴 숫자 인식하기',
        desc: `<p>200×200 검은 캔버스에 마우스(왼쪽 버튼 드래그)로 숫자를 쓰면, 버튼을 뗄 때 SVM 으로 인식해 결과를 출력하세요. 오른쪽 클릭 = 지우기.
digits.png 의 숫자는 <b>20×20 칸 안에서 높이 약 16픽셀, 가운데 정렬</b>되어 있습니다. 그대로 20×20 으로 줄이면 모양이 달라 잘 틀리므로, <code>preprocess()</code> 를 완성해 학습 데이터와 비슷한 모양으로 만드세요.</p>
<ol><li>흰 픽셀의 경계 상자로 자르기</li><li>긴 변이 16이 되도록 비율 유지 축소 (INTER_AREA)</li><li>20×20 검은 칸 가운데(무게중심 기준)에 붙이기</li></ol>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

SZ = 20
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

hog = cv.HOGDescriptor((20, 20), (10, 10), (5, 5), (10, 10), 9, 1, -1, 0, 0.2, True, 64, True)
gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)]).reshape(-1, 20, 20)
train = np.float32([hog.compute(deskew(c)).ravel() for c in cells])        # 5000개 모두 학습
labels = np.repeat(np.arange(10), 500)[:, np.newaxis].astype(np.int32)
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setType(cv.ml.SVM_C_SVC)
svm.setC(12.5)
svm.setGamma(0.5)
svm.train(train, cv.ml.ROW_SAMPLE, labels)
print('학습 완료! pad 창에 숫자를 쓰세요 (오른쪽 클릭 = 지우기)')

pad = np.zeros((200, 200), np.uint8)
state = {'drawing': False, 'last': None}

def preprocess(canvas):
    # TODO: 경계 상자로 자르기 → 긴 변 16 으로 축소 → 20×20 가운데에 붙이기
    return cv.resize(canvas, (20, 20), interpolation=cv.INTER_AREA)

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        state['drawing'], state['last'] = True, (x, y)
    elif event == cv.EVENT_MOUSEMOVE and state['drawing']:
        cv.line(pad, state['last'], (x, y), 255, 16, cv.LINE_AA)
        state['last'] = (x, y)
    elif event == cv.EVENT_LBUTTONUP:
        state['drawing'] = False
        if cv.countNonZero(pad) > 0:
            digit = preprocess(pad)
            f = hog.compute(deskew(digit)).reshape(1, -1)
            print('인식 결과:', int(svm.predict(f)[1][0, 0]))
            cv.imshow('input 20x20 (x8)', cv.resize(digit, None, fx=8, fy=8, interpolation=cv.INTER_NEAREST))
    elif event == cv.EVENT_RBUTTONDOWN:
        pad[:] = 0

cv.imshow('pad', pad)
cv.setMouseCallback('pad', on_mouse)
`,
        hint: `<p><code>ys, xs = np.nonzero(canvas)</code> 로 흰 픽셀 좌표를 얻어 <code>crop = canvas[ys.min():ys.max()+1, xs.min():xs.max()+1]</code>.
<code>s = 16 / max(h, w)</code> 로 축소 후, <code>m = cv.moments(small)</code> 의 무게중심 <code>(m['m10']/m['m00'], m['m01']/m['m00'])</code> 이 (10, 10) 에 오도록 붙일 위치를 계산하고 <code>0 ~ 20-크기</code> 범위로 자릅니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

SZ = 20
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

hog = cv.HOGDescriptor((20, 20), (10, 10), (5, 5), (10, 10), 9, 1, -1, 0, 0.2, True, 64, True)
gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)]).reshape(-1, 20, 20)
train = np.float32([hog.compute(deskew(c)).ravel() for c in cells])        # 5000개 모두 학습
labels = np.repeat(np.arange(10), 500)[:, np.newaxis].astype(np.int32)
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setType(cv.ml.SVM_C_SVC)
svm.setC(12.5)
svm.setGamma(0.5)
svm.train(train, cv.ml.ROW_SAMPLE, labels)
print('학습 완료! pad 창에 숫자를 쓰세요 (오른쪽 클릭 = 지우기)')

pad = np.zeros((200, 200), np.uint8)
state = {'drawing': False, 'last': None}

def preprocess(canvas):
    ys, xs = np.nonzero(canvas)
    crop = canvas[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = crop.shape
    s = 16.0 / max(h, w)                                  # 긴 변을 16 픽셀로
    nw, nh = max(1, int(round(w * s))), max(1, int(round(h * s)))
    small = cv.resize(crop, (nw, nh), interpolation=cv.INTER_AREA)
    m = cv.moments(small)
    cx, cy = (m['m10'] / m['m00'], m['m01'] / m['m00']) if m['m00'] > 0 else (nw / 2, nh / 2)
    ox = min(max(int(round(10 - cx)), 0), 20 - nw)       # 무게중심이 (10, 10) 에 오도록
    oy = min(max(int(round(10 - cy)), 0), 20 - nh)
    out = np.zeros((20, 20), np.uint8)
    out[oy:oy + nh, ox:ox + nw] = small
    return out

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        state['drawing'], state['last'] = True, (x, y)
    elif event == cv.EVENT_MOUSEMOVE and state['drawing']:
        cv.line(pad, state['last'], (x, y), 255, 16, cv.LINE_AA)
        state['last'] = (x, y)
    elif event == cv.EVENT_LBUTTONUP:
        state['drawing'] = False
        if cv.countNonZero(pad) > 0:
            digit = preprocess(pad)
            f = hog.compute(deskew(digit)).reshape(1, -1)
            raw = svm.predict(f)[1][0, 0]
            print('인식 결과:', int(raw))
            cv.imshow('input 20x20 (x8)', cv.resize(digit, None, fx=8, fy=8, interpolation=cv.INTER_NEAREST))
    elif event == cv.EVENT_RBUTTONDOWN:
        pad[:] = 0

cv.imshow('pad', pad)
cv.setMouseCallback('pad', on_mouse)
`,
      },
      {
        title: '실습 2 · deskew 와 방향 구간 수의 효과 실험',
        desc: `<p>튜토리얼 HOG(정규화 포함)에서 <b>deskew 사용 여부(2가지) × bin_n = 8, 16(2가지)</b> = 4가지 조합의 정확도를 표로 출력하세요. 빠른 실험을 위해 학습은 각 줄 앞 20칸(1000개), 테스트는 50~59칸(500개)만 씁니다.
어느 요소가 정확도에 더 큰 영향을 주나요?</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

SZ = 20
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

def hog(img, bin_n):
    gx = cv.Sobel(img, cv.CV_32F, 1, 0)
    gy = cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.minimum(np.int32(bin_n * ang / (2 * np.pi)), bin_n - 1)
    bin_cells = bins[:10, :10], bins[10:, :10], bins[:10, 10:], bins[10:, 10:]
    mag_cells = mag[:10, :10], mag[10:, :10], mag[:10, 10:], mag[10:, 10:]
    hist = np.hstack([np.bincount(b.ravel(), m.ravel(), bin_n) for b, m in zip(bin_cells, mag_cells)])
    hist = np.sqrt(hist / (hist.sum() + 1e-7))
    return hist / (np.linalg.norm(hist) + 1e-7)

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
train_cells = cells[:, :20].reshape(-1, 20, 20)
test_cells = cells[:, 50:60].reshape(-1, 20, 20)
train_lab = np.repeat(np.arange(10), 100)[:, np.newaxis].astype(np.int32)
test_lab = np.repeat(np.arange(10), 50)[:, np.newaxis].astype(np.int32)

def evaluate(use_deskew, bin_n):
    prep = deskew if use_deskew else (lambda c: c)
    # TODO 1: 학습 · 테스트 셀마다 prep → hog(…, bin_n) 을 적용해 float32 특징 배열 만들기
    tr = np.zeros((len(train_cells), 4 * bin_n), np.float32)
    te = np.zeros((len(test_cells), 4 * bin_n), np.float32)
    # TODO 2: RBF SVM (C=12.5, gamma=0.5) 학습 후 테스트 정확도(%) 반환
    return 0.0

print('deskew   bin_n=8   bin_n=16')
for use in (False, True):
    print('%-6s   %6.1f%%   %6.1f%%' % (use, evaluate(use, 8), evaluate(use, 16)))
`,
        hint: `<p><code>tr = np.float32([hog(prep(c), bin_n) for c in train_cells])</code>. SVM 은 예제 4와 같은 설정으로 만들고 <code>(svm.predict(te)[1] == test_lab).mean() * 100</code> 을 반환합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

SZ = 20
def deskew(img):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        return img.copy()
    skew = m['mu11'] / m['mu02']
    M = np.float32([[1, skew, -0.5 * SZ * skew], [0, 1, 0]])
    return cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)

def hog(img, bin_n):
    gx = cv.Sobel(img, cv.CV_32F, 1, 0)
    gy = cv.Sobel(img, cv.CV_32F, 0, 1)
    mag, ang = cv.cartToPolar(gx, gy)
    bins = np.minimum(np.int32(bin_n * ang / (2 * np.pi)), bin_n - 1)
    bin_cells = bins[:10, :10], bins[10:, :10], bins[:10, 10:], bins[10:, 10:]
    mag_cells = mag[:10, :10], mag[10:, :10], mag[:10, 10:], mag[10:, 10:]
    hist = np.hstack([np.bincount(b.ravel(), m.ravel(), bin_n) for b, m in zip(bin_cells, mag_cells)])
    hist = np.sqrt(hist / (hist.sum() + 1e-7))
    return hist / (np.linalg.norm(hist) + 1e-7)

gray = cv.imread('digits.png', cv.IMREAD_GRAYSCALE)
cells = np.array([np.hsplit(row, 100) for row in np.vsplit(gray, 50)])
train_cells = cells[:, :20].reshape(-1, 20, 20)
test_cells = cells[:, 50:60].reshape(-1, 20, 20)
train_lab = np.repeat(np.arange(10), 100)[:, np.newaxis].astype(np.int32)
test_lab = np.repeat(np.arange(10), 50)[:, np.newaxis].astype(np.int32)

def evaluate(use_deskew, bin_n):
    prep = deskew if use_deskew else (lambda c: c)
    tr = np.float32([hog(prep(c), bin_n) for c in train_cells])
    te = np.float32([hog(prep(c), bin_n) for c in test_cells])
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setType(cv.ml.SVM_C_SVC)
    svm.setC(12.5)
    svm.setGamma(0.5)
    svm.train(tr, cv.ml.ROW_SAMPLE, train_lab)
    return (svm.predict(te)[1] == test_lab).mean() * 100

print('deskew   bin_n=8   bin_n=16')
for use in (False, True):
    print('%-6s   %6.1f%%   %6.1f%%' % (use, evaluate(use, 8), evaluate(use, 16)))
`,
      },
    ],
    quiz: [
      { q: 'deskew 함수에서 skew = mu11 / mu02 가 나타내는 것은?', options: ['글씨의 밝기 평균', '글씨의 넓이', '세로로 한 칸 내려갈 때 가로로 밀린 정도(기울기)', '글씨의 회전 각도(도 단위)'], answer: 2, explain: 'mu11 은 x·y 가 함께 변하는 정도, mu02 는 세로 퍼짐입니다. 그 비율이 전단(shear) 기울기이고, 반대로 밀어 주면 글씨가 똑바로 섭니다.' },
      { q: '튜토리얼 HOG 에서 20×20 이미지를 10×10 셀 4개로 나누고 방향을 16구간으로 셀 때 특징 벡터의 길이는?', options: ['16', '40', '64', '400'], answer: 2, explain: '셀 4개 × 방향 16구간 = 64 개의 히스토그램 값을 이어 붙입니다.' },
      { q: '정규화하지 않은 HOG(값이 수천) 를 RBF SVM(gamma=0.5)에 넣었더니 정확도가 10% 였습니다. 가장 알맞은 원인은?', options: ['학습 데이터가 너무 적어서', '특징 값이 커서 커널 exp(−gamma·거리²) 가 거의 모두 0 이 되어서', 'HOG 는 SVM 과 함께 쓸 수 없어서', 'deskew 를 두 번 해서'], answer: 1, explain: '거리가 수천이면 모든 쌍의 유사도가 0 이 되어 경계를 배울 수 없습니다. 합 · 제곱근 · 길이 정규화로 값의 범위를 맞춰야 합니다.' },
      { q: '혼동 행렬(행=정답, 열=예측)에서 conf[4, 9] = 12 의 의미는?', options: ['9 를 4 로 12번 예측했다', '4 와 9 를 모두 맞힌 횟수가 12번이다', '정답이 4 인 데이터를 9 로 12번 잘못 예측했다', '4 번째 테스트 데이터의 신뢰도가 9 다'], answer: 2, explain: '행이 정답, 열이 예측이므로 정답 4 → 예측 9 로 틀린 횟수가 12 입니다.' },
    ],
  },

  /* ======================================================================
   * a3-5 K-Means 군집화
   * ====================================================================== */
  {
    id: 'a3-5',
    summary: '정답(레이블) 없이 데이터를 비슷한 것끼리 K 개 무리로 묶는 비지도 학습 K-Means 를 배웁니다. 티셔츠 사이즈 정하기 비유로 알고리즘을 한 단계씩 따라가 보고, 튜토리얼의 1차원 · 2차원 예제로 cv.kmeans 의 criteria · attempts · flags 를 익힌 뒤, 사진의 색을 K 개로 줄이는 색 양자화를 트랙바로 실험합니다.',
    goals: [
      '지도 학습과 비지도 학습(군집화)의 차이를 예로 설명할 수 있다',
      'K-Means 의 “중심 배정 → 중심 다시 계산” 반복 과정을 그림으로 설명할 수 있다',
      'cv.kmeans(data, K, None, criteria, attempts, flags) 의 인자와 반환값(compactness, labels, centers)을 해석할 수 있다',
      '픽셀 색을 K 개로 묶는 색 양자화를 구현하고, K 선택(엘보 방법)과 속도(축소 · 샘플링)를 고려할 수 있다',
    ],
    schedule: [['도입 · 비지도 학습', 5], ['K-Means 알고리즘 단계별 보기', 10], ['cv.kmeans 1D · 2D 튜토리얼', 10], ['K 고르기 · 색 양자화', 10], ['트랙바 실험', 5], ['실습 과제', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 정답 없이 묶기: 군집화(Clustering)</h3>
<p>kNN · SVM 은 <b>정답(레이블)이 있는 데이터</b>로 배웠습니다(지도 학습). 그런데 현실에는 정답이 없는 데이터가 훨씬 많습니다. 이럴 때 “비슷한 것끼리 알아서 묶기”를 하는 것이 <b>군집화(Clustering)</b>, 대표적인 <b>비지도 학습</b>입니다.</p>
<p><b>티셔츠 사이즈 문제</b> (튜토리얼 비유): 옷 회사가 사람들의 키 · 몸무게 데이터를 모았습니다. 사이즈를 수백 개 만들 수는 없으니 <b>S · M · L 3개</b>만 만들고 싶습니다. 각 사이즈의 기준 키 · 몸무게를 어떻게 정할까요?
→ 데이터를 비슷한 사람끼리 <b>3무리</b>로 나누고, 각 무리의 <b>평균(중심)</b>을 사이즈 기준으로 삼으면 됩니다. 이것이 <b>K-Means (K=3)</b> 입니다.</p>
<h4>K-Means 알고리즘</h4>
<ol>
<li><b>초기화</b>: 중심(centroid) K 개를 무작위로 고른다</li>
<li><b>배정</b>: 모든 점을 가장 가까운 중심의 무리에 넣는다</li>
<li><b>갱신</b>: 무리마다 속한 점들의 평균으로 중심을 옮긴다</li>
<li>중심이 거의 움직이지 않거나 정한 횟수가 될 때까지 2~3 반복</li>
</ol>
<p>결과는 각 점과 자기 중심 사이 거리 제곱의 합(<b>compactness</b>)이 작아지는 방향으로 수렴합니다. 다만 시작 위치에 따라 결과가 달라질 수 있어, 여러 번 시도(<b>attempts</b>)해 가장 좋은 결과를 씁니다.</p>` },
      { type: 'code', title: '예제 1 · K-Means 를 한 단계씩 따라가 보기 (티셔츠 사이즈)', code: String.raw`
import numpy as np
from matplotlib import pyplot as plt

rng = np.random.default_rng(2)
# 키(cm) · 몸무게(kg) 데이터: 작은 · 중간 · 큰 체격이 섞여 있음 (레이블 없음!)
data = np.vstack([rng.normal((158, 52), (4, 4), (40, 2)),
                  rng.normal((170, 65), (4, 4), (40, 2)),
                  rng.normal((182, 80), (4, 5), (40, 2))]).astype(np.float32)

K = 3
centers = data[rng.choice(len(data), K, replace=False)]   # 1) 무작위 중심
colors = np.array(['tab:red', 'tab:green', 'tab:blue'])

plt.figure(figsize=(13, 3.6))
for step in range(4):
    # 2) 배정: 각 점에서 중심까지 거리 → 가장 가까운 중심 번호
    d = ((data[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2)    # (120, K)
    labels = d.argmin(axis=1)
    compact = d[np.arange(len(data)), labels].sum()
    plt.subplot(1, 4, step + 1)
    plt.scatter(data[:, 0], data[:, 1], s=10, c=colors[labels])
    plt.scatter(centers[:, 0], centers[:, 1], s=150, c='y', marker='*', edgecolors='k')
    plt.title('step %d  compactness=%.0f' % (step, compact))
    plt.xlabel('height'), plt.ylabel('weight')
    print('step %d: 중심 = %s' % (step, np.round(centers, 1).tolist()))
    # 3) 갱신: 무리마다 평균으로 중심 이동
    centers = np.array([data[labels == k].mean(axis=0) if np.any(labels == k) else centers[k] for k in range(K)], np.float32)
plt.tight_layout()
plt.show()
`, desc: '<p>노란 별(중심)이 몇 번 만에 세 무리의 가운데로 옮겨 가고 compactness 가 줄어드는지 보세요. 이 반복을 OpenCV 의 <code>cv.kmeans()</code> 가 한 줄로 해 줍니다.</p>' },
      { type: 'table', head: ['인자 / 반환값', '의미'], rows: [
        ['<code>data</code>', '(N, 특징 수) <b>float32</b> 배열. 1차원 데이터도 (N, 1) 모양으로'],
        ['<code>K</code>', '묶을 무리 수'],
        ['<code>bestLabels</code>', '보통 <code>None</code>'],
        ['<code>criteria</code>', '멈춤 조건 <code>(type, max_iter, epsilon)</code>. type = <code>TERM_CRITERIA_EPS</code>(중심 이동이 epsilon 미만) · <code>TERM_CRITERIA_MAX_ITER</code>(반복 횟수) 또는 둘의 합'],
        ['<code>attempts</code>', '초기값을 바꿔 가며 몇 번 실행할지 → compactness 가 가장 작은 결과 반환'],
        ['<code>flags</code>', '초기 중심 고르기: <code>cv.KMEANS_RANDOM_CENTERS</code>(무작위) · <code>cv.KMEANS_PP_CENTERS</code>(k-means++, 서로 멀리)'],
        ['반환 <code>compactness, labels, centers</code>', '거리 제곱 합 · 점마다 무리 번호 (N, 1) · 중심 좌표 (K, 특징 수)'],
      ] },
      { type: 'code', title: '예제 2 · 1차원 데이터: 두 무리로 나누기 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

np.random.seed(0)
x = np.random.randint(25, 100, 25)      # 작은 값 무리
y = np.random.randint(175, 255, 25)     # 큰 값 무리
z = np.hstack((x, y))
z = z.reshape((50, 1))                  # (N, 1) 모양: 특징이 1개인 데이터 50개
z = np.float32(z)

# 멈춤 조건: 10번 반복했거나 중심 이동이 1.0 미만이면 멈춤
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)
flags = cv.KMEANS_RANDOM_CENTERS
compactness, labels, centers = cv.kmeans(z, 2, None, criteria, 10, flags)

print('compactness:', compactness)
print('centers    :', centers.ravel())
print('labels 앞 10개:', labels.ravel()[:10], ' 뒤 10개:', labels.ravel()[-10:])

A = z[labels == 0]
B = z[labels == 1]
plt.figure(figsize=(10, 3.5))
plt.subplot(1, 2, 1), plt.hist(z, 256, [0, 256]), plt.title('data (no labels)')
plt.subplot(1, 2, 2)
plt.hist(A, 256, [0, 256], color='r')
plt.hist(B, 256, [0, 256], color='b')
plt.hist(centers, 32, [0, 256], color='y')
plt.title('K=2 clusters (yellow = centers)')
plt.show()
`, desc: '<p>무리 번호 0 · 1 은 “이름”일 뿐 순서에 의미가 없습니다. 다시 실행하거나 seed 를 바꾸면 빨강 · 파랑이 서로 바뀔 수 있습니다.</p>' },
      { type: 'code', title: '예제 3 · 2차원 데이터: 키 · 몸무게 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

np.random.seed(1)
X = np.random.randint(25, 50, (25, 2))
Y = np.random.randint(60, 85, (25, 2))
Z = np.vstack((X, Y))
Z = np.float32(Z)       # (50, 2): 한 행 = [키, 몸무게]

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)
ret, label, center = cv.kmeans(Z, 2, None, criteria, 10, cv.KMEANS_RANDOM_CENTERS)
print('compactness:', ret)
print('centers:\n', center)

# label 이 (50, 1) 이라 ravel() 로 펴서 사용
A = Z[label.ravel() == 0]
B = Z[label.ravel() == 1]
plt.scatter(A[:, 0], A[:, 1])
plt.scatter(B[:, 0], B[:, 1], c='r')
plt.scatter(center[:, 0], center[:, 1], s=80, c='y', marker='s')
plt.xlabel('Height'), plt.ylabel('Weight')
plt.title('K-Means with 2 features')
plt.show()
` },
      { type: 'text', html: `<h3>2. K 는 어떻게 정할까? — 엘보(Elbow) 방법</h3>
<p>K-Means 는 K 를 사람이 정해야 합니다. K 를 늘리면 compactness 는 <b>항상</b> 줄어듭니다(K = 데이터 수면 0). 그래서 “작을수록 좋다”로는 고를 수 없습니다.</p>
<p><b>엘보 방법</b>: K = 1, 2, 3 … 에 대한 compactness 그래프를 그려 <b>급격히 줄다가 완만해지는 꺾이는 점(팔꿈치)</b>을 고릅니다. 그 뒤로는 무리를 더 쪼개도 이득이 적다는 뜻입니다.
색 양자화처럼 목적이 분명하면 “색 8개면 충분히 보기 좋다” 같은 <b>용도 기준</b>으로 정하기도 합니다.</p>` },
      { type: 'code', title: '예제 4 · 티셔츠 사이즈 K=3 과 엘보 그래프', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

rng = np.random.default_rng(4)
data = np.vstack([rng.normal((158, 52), (4, 4), (40, 2)),
                  rng.normal((170, 65), (4, 4), (40, 2)),
                  rng.normal((182, 80), (4, 5), (40, 2))]).astype(np.float32)

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 20, 0.1)
Ks = range(1, 9)
scores = []
for K in Ks:
    compactness, labels, centers = cv.kmeans(data, K, None, criteria, 5, cv.KMEANS_PP_CENTERS)
    scores.append(compactness)
    print('K=%d  compactness=%9.0f' % (K, compactness))

compactness, labels, centers = cv.kmeans(data, 3, None, criteria, 5, cv.KMEANS_PP_CENTERS)
order = np.argsort(centers[:, 0])            # 키 순서로 S, M, L 이름 붙이기
for size, k in zip(['S', 'M', 'L'], order):
    n = np.count_nonzero(labels.ravel() == k)
    print('%s 사이즈 기준: 키 %.0f cm, 몸무게 %.0f kg  (%d 명)' % (size, centers[k, 0], centers[k, 1], n))

plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(list(Ks), scores, 'o-')
plt.xlabel('K'), plt.ylabel('compactness'), plt.title('Elbow method')
plt.subplot(1, 2, 2)
plt.scatter(data[:, 0], data[:, 1], s=12, c=labels.ravel(), cmap='brg')
plt.scatter(centers[:, 0], centers[:, 1], s=200, c='y', marker='*', edgecolors='k')
plt.xlabel('height (cm)'), plt.ylabel('weight (kg)'), plt.title('T-shirt sizes (K=3)')
plt.tight_layout()
plt.show()
`, desc: '<p>K=1 → 2 → 3 에서 크게 줄고 그 뒤로는 완만합니다. 팔꿈치는 <b>K=3</b> 입니다.</p>' },
      { type: 'text', html: `<h3>3. 색 양자화(Color Quantization)</h3>
<p>컬러 사진에는 수만 가지 색이 쓰입니다. <b>색 양자화</b>는 이를 K 개 대표색으로 줄이는 작업입니다 — GIF 처럼 색 수가 제한된 형식, 포스터 효과, 옷 · 과일의 주요 색 추출 등에 씁니다.</p>
<ul>
<li>특징 = 픽셀 하나의 <b>(B, G, R)</b> 3개 값 → 이미지 (H, W, 3) 를 <code>reshape((-1, 3))</code> 해서 (H×W, 3) 데이터로</li>
<li><code>cv.kmeans</code> 로 K 개 무리 → <b>centers = 대표색 K 개</b></li>
<li>각 픽셀을 자기 무리의 대표색으로 바꿈: <code>center[label.flatten()]</code> → 원래 모양으로 reshape</li>
</ul>
<p><b>속도 주의</b>: home.jpg(512×384)는 약 20만 픽셀입니다. 튜토리얼처럼 attempts=10 으로 돌리면 브라우저에서 수 초가 걸리므로, 아래 예제는 <b>이미지를 절반으로 줄이고</b>(픽셀 1/4) attempts 를 줄입니다.</p>` },
      { type: 'code', title: '예제 5 · home.jpg 색 양자화 K = 2 · 4 · 8 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv
import time

img = cv.imread('home.jpg')
img = cv.resize(img, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)   # 속도를 위해 절반 크기
Z = img.reshape((-1, 3))
Z = np.float32(Z)
print('픽셀 수:', len(Z), ' 원래 사용된 색 수:', len(np.unique(Z.astype(np.uint8), axis=0)))

criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)
results = [img]
for K in (2, 4, 8):
    t0 = time.perf_counter()
    ret, label, center = cv.kmeans(Z, K, None, criteria, 3, cv.KMEANS_RANDOM_CENTERS)
    # 대표색(center)을 uint8 로 바꾸고, 각 픽셀을 자기 무리의 대표색으로 교체
    center = np.uint8(center)
    res = center[label.flatten()]
    res2 = res.reshape((img.shape))
    print('K=%d  %.2f 초  대표색(BGR): %s' % (K, time.perf_counter() - t0, center.tolist()))
    cv.putText(res2, 'K=%d' % K, (8, 22), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    results.append(res2)

top = np.hstack(results[:2])
bottom = np.hstack(results[2:])
cv.imshow('original | K=2 / K=4 | K=8', np.vstack([top, bottom]))
`, desc: '<p>K=8 만 되어도 원본과 꽤 비슷해 보입니다. 원래 수천 가지였던 색이 8가지로 줄었습니다. 하늘 · 벽 · 지붕처럼 넓은 영역의 색이 대표색으로 뽑힙니다.</p>' },
      { type: 'code', title: '예제 6 · 트랙바로 K 바꾸기 (웹캠 · 이미지)', code: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('K', 'result', 6, 16, nothing)
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)

def process(frame):
    K = max(2, cv.getTrackbarPos('K', 'result'))
    h, w = frame.shape[:2]
    # 1) 학습: 작게 줄인 이미지(가로 160)의 픽셀로만 대표색 찾기 → 빠름
    s = 160.0 / w
    small = cv.resize(frame, (160, max(1, int(h * s))), interpolation=cv.INTER_AREA)
    data = np.float32(small.reshape(-1, 3))
    _, _, centers = cv.kmeans(data, K, None, criteria, 1, cv.KMEANS_PP_CENTERS)

    # 2) 적용: 원본의 모든 픽셀을 가장 가까운 대표색으로 (kNN 의 k=1 과 같은 생각)
    Z = np.float32(frame.reshape(-1, 3))
    # 거리² = |z|² - 2 z·c + |c|²  (|z|² 는 모든 c 에 같으므로 생략)
    d = -2 * Z @ centers.T + (centers ** 2).sum(axis=1)
    labels = d.argmin(axis=1)
    out = np.uint8(centers)[labels].reshape(frame.shape)

    # 아래에 팔레트 막대 그리기
    bar = np.zeros((30, w, 3), np.uint8)
    for i, c in enumerate(np.uint8(centers)):
        bar[:, i * w // K:(i + 1) * w // K] = c
    cv.putText(out, 'K=%d' % K, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
    return np.vstack([out, bar])
`, desc: '<p>오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸면 실시간 “포스터 효과”가 됩니다(웹캠이 없으면 🎞️ 동영상을 골라도 됩니다). 대표색은 작은 이미지로 학습하고, 원본 픽셀에는 가장 가까운 대표색만 배정해서 빠르게 만들었습니다.</p>' },
      { type: 'tip', html: `<p><b>K-Means 의 한계</b>: ① K 를 미리 정해야 함 ② 무리가 둥글고 크기가 비슷하다고 가정 (초승달 · 길쭉한 모양은 잘 못 나눔) ③ 시작 위치에 따라 결과가 다를 수 있음(→ attempts, KMEANS_PP_CENTERS) ④ 특징 단위가 다르면 정규화 필요 (kNN 과 같은 이유).</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 사진의 주요 색 팔레트 만들기',
        desc: `<p><code>fruits.jpg</code> 에서 K=5 대표색을 구하고, 각 색이 차지하는 <b>비율(%)</b>을 계산해 <b>비율이 큰 순서</b>로 가로 막대 팔레트(너비 = 비율)를 만드세요. 색마다 비율을 출력합니다. (속도를 위해 이미지를 가로 200 으로 줄여서 사용)</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('fruits.jpg')
img = cv.resize(img, (200, int(img.shape[0] * 200 / img.shape[1])), interpolation=cv.INTER_AREA)
Z = np.float32(img.reshape(-1, 3))
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)
K = 5

# TODO 1: cv.kmeans 로 labels, centers 구하기
labels = np.zeros((len(Z), 1), np.int32)
centers = np.zeros((K, 3), np.float32)

# TODO 2: 무리마다 픽셀 비율(0~1) 계산 (np.bincount 사용)
ratios = np.full(K, 1.0 / K)

# TODO 3: 비율 큰 순서로 정렬해 너비 500 짜리 막대에 칠하기
palette = np.zeros((60, 500, 3), np.uint8)
x = 0
for k in range(K):
    w = int(round(ratios[k] * 500))
    palette[:, x:x + w] = np.uint8(centers[k])
    x += w
    print('색 %s  %.1f%%' % (np.uint8(centers[k]).tolist(), ratios[k] * 100))

cv.imshow('image', img)
cv.imshow('palette', palette)
`,
        hint: `<p><code>_, labels, centers = cv.kmeans(Z, K, None, criteria, 3, cv.KMEANS_PP_CENTERS)</code> → <code>ratios = np.bincount(labels.ravel(), minlength=K) / len(Z)</code> → <code>for k in np.argsort(-ratios):</code> 로 큰 순서대로 돌면 됩니다.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('fruits.jpg')
img = cv.resize(img, (200, int(img.shape[0] * 200 / img.shape[1])), interpolation=cv.INTER_AREA)
Z = np.float32(img.reshape(-1, 3))
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)
K = 5

_, labels, centers = cv.kmeans(Z, K, None, criteria, 3, cv.KMEANS_PP_CENTERS)
ratios = np.bincount(labels.ravel(), minlength=K) / len(Z)

palette = np.zeros((60, 500, 3), np.uint8)
x = 0
for k in np.argsort(-ratios):
    w = int(round(ratios[k] * 500))
    palette[:, x:x + w] = np.uint8(centers[k])
    cv.rectangle(palette, (x, 0), (x + w - 1, 59), (255, 255, 255), 1)
    x += w
    print('색(BGR) %s  %.1f%%' % (np.uint8(centers[k]).tolist(), ratios[k] * 100))

cv.imshow('image', img)
cv.imshow('palette', palette)
`,
      },
      {
        title: '실습 2 · K=2 군집으로 자동 임계값 찾기 (Otsu 와 비교)',
        desc: `<p>흑백 이미지의 밝기 값을 K=2 로 군집화하면 “어두운 무리”와 “밝은 무리”의 중심이 나옵니다. 두 중심의 <b>가운데 값</b>을 임계값으로 써서 이진화하고, 입문 과정에서 배운 <b>Otsu 임계값</b>과 비교해 보세요. (<code>sudoku.png</code>, 가로 280 으로 축소)</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

gray = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
gray = cv.resize(gray, (280, int(gray.shape[0] * 280 / gray.shape[1])), interpolation=cv.INTER_AREA)
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 20, 0.5)

# TODO 1: 밝기 값을 (N, 1) float32 로 만들어 K=2 kmeans
centers = np.float32([[0], [255]])

# TODO 2: 두 중심의 평균을 임계값으로 이진화
th_km = 127
_, bw_km = cv.threshold(gray, th_km, 255, cv.THRESH_BINARY)

th_otsu, bw_otsu = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
print('K-Means 중심:', centers.ravel(), '→ 임계값', th_km)
print('Otsu 임계값 :', th_otsu)
cv.imshow('kmeans threshold', bw_km)
cv.imshow('otsu', bw_otsu)
`,
        hint: `<p><code>Z = np.float32(gray.reshape(-1, 1))</code>, <code>_, labels, centers = cv.kmeans(Z, 2, None, criteria, 3, cv.KMEANS_PP_CENTERS)</code>, <code>th_km = float(centers.mean())</code>.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

gray = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
gray = cv.resize(gray, (280, int(gray.shape[0] * 280 / gray.shape[1])), interpolation=cv.INTER_AREA)
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 20, 0.5)

Z = np.float32(gray.reshape(-1, 1))
_, labels, centers = cv.kmeans(Z, 2, None, criteria, 3, cv.KMEANS_PP_CENTERS)

th_km = float(centers.mean())
_, bw_km = cv.threshold(gray, th_km, 255, cv.THRESH_BINARY)

th_otsu, bw_otsu = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
print('K-Means 중심:', np.round(centers.ravel(), 1), '→ 임계값 %.1f' % th_km)
print('Otsu 임계값 :', th_otsu)
print('두 결과가 다른 픽셀 비율: %.2f%%' % (np.mean(bw_km != bw_otsu) * 100))
cv.imshow('kmeans threshold', bw_km)
cv.imshow('otsu', bw_otsu)
`,
      },
    ],
    quiz: [
      { q: 'K-Means 가 kNN · SVM 과 가장 크게 다른 점은?', options: ['학습에 정답(레이블)이 필요 없다', 'float32 데이터를 쓴다', '거리를 계산하지 않는다', '2차원 데이터만 다룰 수 있다'], answer: 0, explain: 'K-Means 는 레이블 없이 비슷한 데이터끼리 묶는 비지도 학습입니다. kNN · SVM 은 레이블이 필요한 지도 학습입니다.' },
      { q: 'K-Means 의 한 번의 반복에서 일어나는 두 단계를 순서대로 고르면?', options: ['중심 갱신 → 무작위 초기화', '레이블 예측 → 정확도 계산', '데이터 정렬 → 중앙값 선택', '각 점을 가장 가까운 중심에 배정 → 무리별 평균으로 중심 이동'], answer: 3, explain: '배정(가까운 중심 찾기)과 갱신(평균으로 중심 이동)을 중심이 거의 움직이지 않을 때까지 반복합니다.' },
      { q: 'cv.kmeans(Z, 8, None, criteria, 10, cv.KMEANS_RANDOM_CENTERS) 에서 10 의 의미는?', options: ['최대 반복 횟수', '서로 다른 초기 중심으로 실행할 횟수(attempts)', '무리 수', '허용 오차'], answer: 1, explain: 'attempts 입니다. 10번 다른 초기값으로 실행해 compactness 가 가장 작은 결과를 돌려줍니다. 반복 횟수 · 허용 오차는 criteria 안에 있습니다.' },
      { q: '컬러 이미지 (384, 512, 3) 를 색 양자화할 때 cv.kmeans 에 넣는 데이터의 모양으로 알맞은 것은?', options: ['(196608, 3) float32', '(384, 512, 3) uint8', '(3, 196608) float32', '(384, 512) float32'], answer: 0, explain: '픽셀 하나가 (B, G, R) 3개 특징을 가진 데이터이므로 reshape((-1, 3)) 로 (384×512, 3) 을 만들고 float32 로 바꿉니다.' },
    ],
  },

  /* ======================================================================
   * a3-6 Haar 캐스케이드 얼굴 · 눈 검출
   * ====================================================================== */
  {
    id: 'a3-6',
    summary: '분류(이 이미지는 무엇인가)에서 검출(어디에 있는가)로 넘어갑니다. Viola–Jones 얼굴 검출기의 네 가지 아이디어(Haar 특징 · 적분 영상 · AdaBoost · 캐스케이드)를 이해하고, OpenCV 에 내장된 학습 파일로 얼굴 · 눈을 찾습니다. detectMultiScale 의 scaleFactor · minNeighbors · minSize 를 트랙바로 조절하고, 전신 검출기 등 다른 캐스케이드와 학습 방법(opencv_traincascade)도 살펴봅니다.',
    goals: [
      '분류와 검출(슬라이딩 윈도우 + 이미지 피라미드)의 차이를 설명할 수 있다',
      'Haar 특징 · 적분 영상 · AdaBoost · 캐스케이드가 각각 무엇을 빠르게/정확하게 만드는지 설명할 수 있다',
      'cv.CascadeClassifier(cv.data.haarcascades + …) 와 detectMultiScale 로 얼굴을 찾고, 얼굴 ROI 안에서 눈을 찾을 수 있다',
      'scaleFactor · minNeighbors · minSize 가 검출 수 · 오검출 · 속도에 미치는 영향을 실험으로 비교할 수 있다',
    ],
    schedule: [['도입 · 분류에서 검출로', 5], ['Viola–Jones 네 가지 아이디어', 10], ['얼굴 · 눈 검출 튜토리얼', 10], ['detectMultiScale 파라미터', 8], ['다른 캐스케이드 · 학습 개념', 5], ['실습 과제', 7], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 분류에서 검출로</h3>
<p>지금까지는 “20×20 이미지 한 장이 무슨 숫자인가?”를 맞히는 <b>분류</b>였습니다. <b>검출(Detection)</b>은 큰 사진 속에서 “<b>어디에</b> 얼굴이 있는가?”를 찾아 상자(x, y, w, h)로 알려 줍니다.</p>
<p>가장 기본적인 방법은 분류기를 <b>창(window)</b> 삼아 이미지 위를 훑는 것입니다.</p>
<ul>
<li><b>슬라이딩 윈도우</b>: 24×24 창을 한 칸씩 옮기며 “얼굴인가?”를 분류</li>
<li><b>이미지 피라미드</b>: 얼굴 크기가 제각각이므로 이미지를 조금씩 줄여 가며 같은 창으로 다시 훑음</li>
</ul>
<p>문제는 창의 개수입니다. 512×512 이미지 하나에도 수십만 개의 창이 생깁니다. 2001년 <b>Viola 와 Jones</b>는 이것을 실시간으로 해내는 방법을 발표했고, 그 결과가 OpenCV 의 <b>Haar 캐스케이드 분류기</b>입니다. 디지털카메라의 얼굴 인식 초점 기능이 이 방법으로 대중화되었습니다.</p>` },
      { type: 'table', head: ['아이디어', '하는 일', '비유'], rows: [
        ['① Haar 특징', '흰 사각형 영역 합 − 검은 사각형 영역 합. 예) “눈 줄은 뺨보다 어둡다”, “콧대는 양쪽 눈보다 밝다”', '밝기 차이를 재는 흑백 도장'],
        ['② 적분 영상 (Integral image)', '(0,0)~(x,y) 누적합 표를 미리 만들어, <b>어떤 크기의 사각형 합이든 4번 덧셈 · 뺄셈</b>으로 계산', '누적 가계부로 기간 합 바로 구하기'],
        ['③ AdaBoost', '16만 개가 넘는 후보 특징 중 얼굴 구분에 <b>쓸모 있는 수천 개만 골라</b> 약한 분류기 여러 개를 가중합', '전문가 여럿의 투표'],
        ['④ 캐스케이드 (Cascade)', '특징을 여러 <b>단계(stage)</b>로 나눠, 앞 단계에서 “확실히 얼굴 아님”인 창은 바로 버림 → 대부분의 창은 처음 몇 단계에서 탈락', '공항 보안 검색대를 차례로 통과'],
      ] },
      { type: 'code', title: '예제 1 · Haar 특징과 적분 영상 직접 계산해 보기', code: String.raw`
import cv2 as cv
import numpy as np
import time

img = cv.imread('lena.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# 적분 영상: ii[y, x] = gray[0:y, 0:x] 의 합  (크기가 한 칸씩 더 큼)
ii = cv.integral(gray)
print('gray', gray.shape, '→ integral', ii.shape, ii.dtype)

def rect_sum(x, y, w, h):
    # 어떤 크기든 네 모서리 값만으로 사각형 합 계산
    return int(ii[y + h, x + w] - ii[y, x + w] - ii[y + h, x] + ii[y, x])

x, y, w, h = 240, 255, 120, 20          # lena 두 눈이 지나가는 가로 띠
print('사각형 합 (적분 영상):', rect_sum(x, y, w, h))
print('사각형 합 (numpy)   :', int(gray[y:y + h, x:x + w].sum()))

# 2-사각형 Haar 특징: 위(눈 띠) 평균 - 아래(뺨 띠) 평균 → 눈이 더 어두우면 음수
eye_band = rect_sum(x, y, w, h) / (w * h)
cheek_band = rect_sum(x, y + h, w, h) / (w * h)
print('눈 띠 평균 %.1f, 뺨 띠 평균 %.1f → Haar 특징 값 %.1f' % (eye_band, cheek_band, eye_band - cheek_band))

# 속도 비교: 무작위 사각형 5천 개의 합
rng = np.random.default_rng(0)
rects = [(int(a), int(b), int(c), int(d)) for a, b, c, d in zip(rng.integers(0, 256, 5000), rng.integers(0, 256, 5000), rng.integers(8, 256, 5000), rng.integers(8, 256, 5000))]
t0 = time.perf_counter()
s1 = [rect_sum(a, b, c, d) for a, b, c, d in rects]
t1 = time.perf_counter()
s2 = [int(gray[b:b + d, a:a + c].sum()) for a, b, c, d in rects]
t2 = time.perf_counter()
print('5천 개 사각형 합: 적분 영상 %.3f초, 직접 합 %.3f초, 결과 같음: %s' % (t1 - t0, t2 - t1, s1 == s2))

vis = img.copy()
cv.rectangle(vis, (x, y), (x + w, y + h), (0, 0, 0), -1)               # 검은 영역
cv.rectangle(vis, (x, y + h), (x + w, y + 2 * h), (255, 255, 255), -1)  # 흰 영역
cv.addWeighted(vis, 0.6, img, 0.4, 0, vis)
cv.imshow('two-rectangle Haar feature', vis)
`, desc: '<p>눈 띠가 뺨 띠보다 어두워서 특징 값이 크게 음수로 나옵니다. 적분 영상은 사각형 크기와 상관없이 계산량이 같아서, 창을 수십만 번 옮겨도 빠르게 특징을 계산할 수 있습니다. (파이썬 반복문 속도도 포함된 비교라 차이가 줄어들어 보입니다.)</p>' },
      { type: 'text', html: `<h3>2. OpenCV 로 얼굴과 눈 찾기</h3>
<p>OpenCV 에는 미리 학습된 캐스케이드 XML 파일이 들어 있습니다. <code>cv.data.haarcascades</code> 가 그 폴더 경로라서 파일을 따로 받을 필요가 없습니다.</p>
<ol>
<li><code>face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_alt.xml')</code></li>
<li>흑백으로 바꾸고 <code>cv.equalizeHist</code> 로 밝기 대비를 고르게 (조명 영향 줄이기)</li>
<li><code>faces = face_cascade.detectMultiScale(gray)</code> → <code>[[x, y, w, h], …]</code> (못 찾으면 빈 튜플)</li>
<li>얼굴 상자 안(ROI)에서만 눈 검출 → <b>눈은 얼굴 안에 있다</b>는 사실로 오검출과 계산량을 크게 줄임</li>
</ol>` },
      { type: 'code', title: '예제 2 · 얼굴과 눈 검출 (Cascade Classifier 튜토리얼)', code: String.raw`
import cv2 as cv
import time

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_alt.xml')
eyes_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml')
if face_cascade.empty() or eyes_cascade.empty():
    print('--(!)Error loading cascade')

def detectAndDisplay(frame):
    frame_gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    frame_gray = cv.equalizeHist(frame_gray)

    #-- Detect faces
    faces = face_cascade.detectMultiScale(frame_gray)
    for (x, y, w, h) in faces:
        center = (x + w // 2, y + h // 2)
        frame = cv.ellipse(frame, center, (w // 2, h // 2), 0, 0, 360, (255, 0, 255), 4)

        faceROI = frame_gray[y:y + h, x:x + w]
        #-- In each face, detect eyes
        eyes = eyes_cascade.detectMultiScale(faceROI)
        for (x2, y2, w2, h2) in eyes:
            eye_center = (x + x2 + w2 // 2, y + y2 + h2 // 2)
            radius = int(round((w2 + h2) * 0.25))
            frame = cv.circle(frame, eye_center, radius, (255, 0, 0), 4)
    return frame, faces

for name in ['lena.jpg', 'messi5.jpg']:
    img = cv.imread(name)
    t0 = time.perf_counter()
    result, faces = detectAndDisplay(img)
    print('%s: 얼굴 %d 개 %s  (%.2f 초)' % (name, len(faces), [list(map(int, f)) for f in faces], time.perf_counter() - t0))
    cv.imshow('Capture - Face detection: ' + name, result)
`, desc: '<p>lena 는 얼굴과 두 눈을 모두 찾습니다. messi5 는 얼굴은 찾지만 얼굴이 약 39×39 픽셀로 작아 눈 검출기(최소 20×20 창)가 눈을 찾지 못합니다. <b>검출기마다 찾을 수 있는 최소 크기</b>가 있다는 점을 기억하세요.</p>' },
      { type: 'table', head: ['detectMultiScale 인자', '의미', '올리면 / 내리면'], rows: [
        ['<code>scaleFactor</code> (기본 1.1)', '피라미드에서 한 단계마다 이미지를 줄이는 비율', '↑ 1.3: 단계 수가 줄어 <b>빠름</b>, 크기 사이의 얼굴을 놓칠 수 있음 · ↓ 1.05: 느리지만 촘촘'],
        ['<code>minNeighbors</code> (기본 3)', '한 얼굴 주변에 겹쳐 나온 후보 상자가 몇 개 이상이어야 인정할지', '↑: 오검출 감소, 놓침 증가 · 0: 모든 후보 상자가 그대로 나옴'],
        ['<code>minSize</code> / <code>maxSize</code>', '찾을 물체의 최소 · 최대 크기 (w, h)', 'minSize ↑: 작은 오검출 제거 + <b>빠름</b>'],
        ['반환값', '<code>[[x, y, w, h], …]</code> numpy 배열, 없으면 <b>빈 튜플 ()</b>', '<code>len(faces)</code> 로 개수 확인'],
      ] },
      { type: 'code', title: '예제 3 · minNeighbors · scaleFactor · minSize 비교 (messi5.jpg)', code: String.raw`
import cv2 as cv
import numpy as np
import time

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
img = cv.imread('messi5.jpg')
gray = cv.equalizeHist(cv.cvtColor(img, cv.COLOR_BGR2GRAY))
face_cascade.detectMultiScale(gray)       # 첫 호출 준비 시간을 빼고 재기 위해 한 번 실행

settings = [
    ('minNeighbors=0', dict(scaleFactor=1.1, minNeighbors=0)),
    ('default (1.1, 3)', dict(scaleFactor=1.1, minNeighbors=3)),
    ('minNeighbors=12', dict(scaleFactor=1.1, minNeighbors=12)),
    ('scaleFactor=1.3', dict(scaleFactor=1.3, minNeighbors=3)),
    ('minSize=(60, 60)', dict(scaleFactor=1.1, minNeighbors=3, minSize=(60, 60))),
    ('maxSize=(60, 60)', dict(scaleFactor=1.1, minNeighbors=3, maxSize=(60, 60))),
]
views = []
for title, kw in settings:
    t0 = time.perf_counter()
    faces = face_cascade.detectMultiScale(gray, **kw)
    ms = (time.perf_counter() - t0) * 1000
    print('%-18s 검출 %2d 개  %5.0f ms' % (title, len(faces), ms))
    vis = img.copy()
    for (x, y, w, h) in faces:
        cv.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(vis, '%s: %d' % (title, len(faces)), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    views.append(cv.resize(vis, None, fx=0.6, fy=0.6))
cv.imshow('Haar parameters', np.vstack([np.hstack(views[0:2]), np.hstack(views[2:4]), np.hstack(views[4:6])]))
`, desc: '<p>minNeighbors=0 이면 캐스케이드를 통과한 <b>모든 후보 창</b>이 보입니다. 진짜 얼굴 주변에는 후보가 여러 개 겹쳐 있고 오검출은 드문드문합니다 — 이것이 “이웃 수로 거르기”의 원리입니다. default 캐스케이드는 messi5 에서 얼굴 오른쪽 위에 큰 오검출(85×85)이 하나 생깁니다. minNeighbors=12 나 maxSize=(60, 60) 으로는 걸러지지만, <b>minSize=(60, 60) 은 오히려 진짜 얼굴(37×37)을 지우고 오검출만 남깁니다</b> — 크기 제한은 찾을 대상의 실제 크기를 보고 정하세요.</p>' },
      { type: 'code', title: '예제 4 · 트랙바로 조절하는 실시간 얼굴 · 눈 검출', code: String.raw`
import cv2 as cv

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_alt.xml')
eyes_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml')

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('scale x100', 'result', 115, 150, nothing)     # 1.15
cv.createTrackbar('minNeighbors', 'result', 3, 10, nothing)
cv.createTrackbar('minSize', 'result', 30, 150, nothing)
print('오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꿔 보세요 (없으면 🎞️ 동영상 · 이미지로도 동작)')

def process(frame):
    sf = max(101, cv.getTrackbarPos('scale x100', 'result')) / 100.0
    mn = cv.getTrackbarPos('minNeighbors', 'result')
    ms = max(10, cv.getTrackbarPos('minSize', 'result'))
    # 속도를 위해 가로 480 이하로 줄여서 검출하고, 좌표는 원래 크기로 되돌림
    h, w = frame.shape[:2]
    s = min(1.0, 480.0 / w)
    small = cv.resize(frame, None, fx=s, fy=s) if s < 1 else frame
    gray = cv.equalizeHist(cv.cvtColor(small, cv.COLOR_BGR2GRAY))
    faces = face_cascade.detectMultiScale(gray, scaleFactor=sf, minNeighbors=mn, minSize=(int(ms * s), int(ms * s)))
    out = frame.copy()
    for (x, y, fw, fh) in faces:
        eyes = eyes_cascade.detectMultiScale(gray[y:y + fh // 2 + fh // 8, x:x + fw])   # 얼굴 위쪽 절반만
        X, Y, W, H = int(x / s), int(y / s), int(fw / s), int(fh / s)
        cv.rectangle(out, (X, Y), (X + W, Y + H), (255, 0, 255), 2)
        for (ex, ey, ew, eh) in eyes:
            c = (int((x + ex + ew / 2) / s), int((y + ey + eh / 2) / s))
            cv.circle(out, c, int((ew + eh) / 4 / s), (255, 0, 0), 2)
    cv.putText(out, 'faces=%d sf=%.2f mn=%d min=%d' % (len(faces), sf, mn, ms), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return out
`, desc: '<p>눈은 얼굴의 위쪽에만 있으므로 ROI 를 위쪽 절반 남짓으로 좁혀 코 · 입이 눈으로 잡히는 오검출과 계산량을 줄였습니다. scale 을 1.05 로 내리면 더 잘 찾지만 느려지고, 1.4 로 올리면 빨라지지만 놓칩니다.</p>' },
      { type: 'text', html: `<h3>3. 얼굴만 있는 게 아니다: 다른 캐스케이드들</h3>
<p><code>cv.data.haarcascades</code> 폴더에는 여러 학습 파일이 있습니다. 모두 같은 코드(CascadeClassifier + detectMultiScale)로 씁니다.</p>` },
      { type: 'table', head: ['파일', '찾는 것', '참고'], rows: [
        ['<code>haarcascade_frontalface_default.xml</code> · <code>_alt.xml</code> · <code>_alt2.xml</code>', '정면 얼굴', 'alt 계열이 오검출이 적은 편'],
        ['<code>haarcascade_profileface.xml</code>', '옆얼굴', '반대쪽 옆얼굴은 이미지를 좌우 반전해서'],
        ['<code>haarcascade_eye.xml</code> · <code>_eye_tree_eyeglasses.xml</code>', '눈 (안경 포함)', '얼굴 ROI 안에서 사용'],
        ['<code>haarcascade_smile.xml</code>', '웃는 입', '얼굴 아래쪽 절반에서, minNeighbors 크게(20 전후)'],
        ['<code>haarcascade_fullbody.xml</code> · <code>_upperbody.xml</code> · <code>_lowerbody.xml</code>', '전신 · 상반신 · 하반신', '멀리 있는 작은 사람도 찾지만 오검출이 있음'],
        ['<code>haarcascade_frontalcatface.xml</code> · <code>_russian_plate_number.xml</code>', '고양이 얼굴 · 러시아 번호판', '특정 대상 전용 (다른 나라 번호판은 잘 못 찾음)'],
      ] },
      { type: 'code', title: '예제 5 · 전신 캐스케이드로 보행자 세기 (vtest 동영상)', code: String.raw`
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')          # 입력 소스를 보행자 동영상으로
body_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_fullbody.xml')
ok, first = cap.read()
if ok:
    print('동영상 프레임 크기:', first.shape)

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('resize %', 'result', 70, 100, nothing)
cv.createTrackbar('minNeighbors', 'result', 3, 10, nothing)

def process(frame):
    s = max(30, cv.getTrackbarPos('resize %', 'result')) / 100.0
    mn = cv.getTrackbarPos('minNeighbors', 'result')
    small = cv.resize(frame, None, fx=s, fy=s)
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
    bodies = body_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=mn)
    out = frame.copy()
    for (x, y, w, h) in bodies:
        cv.rectangle(out, (int(x / s), int(y / s)), (int((x + w) / s), int((y + h) / s)), (0, 255, 0), 2)
    cv.putText(out, 'people: %d (resize %d%%)' % (len(bodies), s * 100), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out
`, desc: '<p>전신 캐스케이드는 창이 14×28 로 작아서, 멀리 있는 작은 보행자도 찾습니다. 대신 기둥 · 표지판 같은 세로 물체를 사람으로 착각하기도 합니다. resize 를 줄이면 빨라지지만 작은 사람을 놓칩니다. 다음 교시 HOG 검출기와 비교해 보세요.</p>' },
      { type: 'text', html: `<h3>4. 나만의 캐스케이드 학습하기 (개념)</h3>
<p>OpenCV 튜토리얼 <em>Cascade Classifier Training</em> 은 다른 물체용 캐스케이드를 직접 학습하는 과정을 설명합니다.</p>
<ol>
<li><b>양성(positive) 샘플</b>: 찾을 물체가 담긴 이미지 수백~수천 장과 물체 위치 목록 (<code>opencv_annotation</code> 도구로 표시)</li>
<li><b>음성(negative) 샘플</b>: 물체가 <b>없는</b> 배경 이미지 수천 장 (bg.txt 목록)</li>
<li><code>opencv_createsamples</code> 로 양성 샘플을 같은 크기(예: 24×24)의 .vec 파일로 묶음</li>
<li><code>opencv_traincascade</code> 로 단계(stage)마다 AdaBoost 학습 → <code>cascade.xml</code> 생성 (수 시간 ~ 수일)</li>
</ol>
<p>이 도구들은 브라우저에서는 실행할 수 없고, OpenCV 3.4 계열 데스크톱 빌드에 들어 있습니다(4.x 에서는 기본 빌드에서 빠짐). 요즘은 새 물체 검출에 <b>HOG + SVM</b> 이나 <b>딥러닝(8교시)</b>을 더 많이 씁니다.</p>` },
      { type: 'code', title: '참고 · 캐스케이드 학습 명령 예 (데스크톱 전용)', norun: true, code: String.raw`
# 1) 양성 샘플 표시 (마우스로 물체 상자 그리기) → annotations.txt
opencv_annotation --annotations=annotations.txt --images=positives/

# 2) 양성 샘플을 24x24 로 모은 .vec 파일 만들기
opencv_createsamples -info annotations.txt -vec samples.vec -w 24 -h 24 -num 1000

# 3) 학습: 20 단계, 단계마다 양성 900 / 음성 2000 장, Haar 특징
opencv_traincascade -data cascade_out/ -vec samples.vec -bg negatives.txt \
    -numPos 900 -numNeg 2000 -numStages 20 -w 24 -h 24 -featureType HAAR

# 4) 사용
#    my_cascade = cv.CascadeClassifier('cascade_out/cascade.xml')
` },
    ],
    practice: [
      {
        title: '실습 1 · 얼굴 자동 모자이크',
        desc: `<p>웹캠(또는 이미지 · 동영상) 프레임에서 얼굴을 찾아 <b>얼굴 영역만 모자이크</b>하세요. 트랙바 <code>block</code> 으로 모자이크 칸 크기(4~40 픽셀)를 조절합니다. 모자이크 = 얼굴 ROI 를 아주 작게 줄였다가(INTER_LINEAR) 원래 크기로 키우기(INTER_NEAREST).</p>`,
        starter: String.raw`
import cv2 as cv

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_alt.xml')

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('block', 'result', 12, 40, nothing)

def process(frame):
    block = max(4, cv.getTrackbarPos('block', 'result'))
    h, w = frame.shape[:2]
    s = min(1.0, 480.0 / w)
    gray = cv.equalizeHist(cv.cvtColor(cv.resize(frame, None, fx=s, fy=s), cv.COLOR_BGR2GRAY))
    faces = face_cascade.detectMultiScale(gray, 1.15, 3, minSize=(24, 24))
    out = frame.copy()
    for (x, y, fw, fh) in faces:
        X, Y, W, H = int(x / s), int(y / s), int(fw / s), int(fh / s)
        roi = out[Y:Y + H, X:X + W]
        # TODO: roi 를 (W // block, H // block) 로 줄였다가 (W, H) 로 키워서 out[Y:Y+H, X:X+W] 에 넣기
        cv.rectangle(out, (X, Y), (X + W, Y + H), (0, 255, 0), 2)
    cv.putText(out, 'faces: %d' % len(faces), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out
`,
        hint: `<p><code>tiny = cv.resize(roi, (max(1, W // block), max(1, H // block)), interpolation=cv.INTER_LINEAR)</code> → <code>out[Y:Y + H, X:X + W] = cv.resize(tiny, (W, H), interpolation=cv.INTER_NEAREST)</code>. 모자이크를 했다면 초록 상자는 지워도 됩니다.</p>`,
        solution: String.raw`
import cv2 as cv

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_alt.xml')

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('block', 'result', 12, 40, nothing)

def process(frame):
    block = max(4, cv.getTrackbarPos('block', 'result'))
    h, w = frame.shape[:2]
    s = min(1.0, 480.0 / w)
    gray = cv.equalizeHist(cv.cvtColor(cv.resize(frame, None, fx=s, fy=s), cv.COLOR_BGR2GRAY))
    faces = face_cascade.detectMultiScale(gray, 1.15, 3, minSize=(24, 24))
    out = frame.copy()
    for (x, y, fw, fh) in faces:
        X, Y, W, H = int(x / s), int(y / s), int(fw / s), int(fh / s)
        X2, Y2 = min(w, X + W), min(h, Y + H)
        roi = out[Y:Y2, X:X2]
        tiny = cv.resize(roi, (max(1, (X2 - X) // block), max(1, (Y2 - Y) // block)), interpolation=cv.INTER_LINEAR)
        out[Y:Y2, X:X2] = cv.resize(tiny, (X2 - X, Y2 - Y), interpolation=cv.INTER_NEAREST)
    cv.putText(out, 'faces: %d' % len(faces), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out
`,
      },
      {
        title: '실습 2 · 웃는 얼굴 찾기 (smile 캐스케이드)',
        desc: `<p><code>lena.jpg</code> 에서 얼굴을 찾고, <b>얼굴의 아래쪽 절반</b> ROI 에서 <code>haarcascade_smile.xml</code> 로 웃는 입을 찾아 빨간 상자로 표시하세요.
웃음 검출기는 오검출이 많으므로 minNeighbors 를 5, 10, 20, 30 으로 바꿔 보며 입 하나만 남는 값을 찾아 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
smile_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_smile.xml')

img = cv.imread('lena.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
faces = face_cascade.detectMultiScale(gray, 1.1, 5)

for (x, y, w, h) in faces:
    cv.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
    # TODO 1: 얼굴 아래쪽 절반 ROI 만들기 (y + h//2 ~ y + h)
    roi = gray[y:y + h, x:x + w]
    for mn in (5, 10, 20, 30):
        # TODO 2: smile_cascade.detectMultiScale(roi, 1.1, mn) 결과 개수 출력
        smiles = []
        print('minNeighbors=%d → 웃음 %d 개' % (mn, len(smiles)))
    # TODO 3: 가장 적당한 minNeighbors 로 찾은 입을 빨간 상자로 그리기 (ROI 좌표 → 원본 좌표)

cv.imshow('smile', img)
`,
        hint: `<p><code>top = y + h // 2</code>, <code>roi = gray[top:y + h, x:x + w]</code>. 원본 좌표는 <code>(x + sx, top + sy)</code> 입니다. ROI 를 위쪽까지 포함하면 눈이 웃음으로 잡히는 경우가 많습니다.</p>`,
        solution: String.raw`
import cv2 as cv

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
smile_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_smile.xml')

img = cv.imread('lena.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
faces = face_cascade.detectMultiScale(gray, 1.1, 5)

for (x, y, w, h) in faces:
    cv.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
    top = y + h // 2
    roi = gray[top:y + h, x:x + w]
    best = None
    for mn in (5, 10, 20, 30):
        smiles = smile_cascade.detectMultiScale(roi, 1.1, mn)
        print('minNeighbors=%d → 웃음 %d 개' % (mn, len(smiles)))
        if len(smiles) == 1 and best is None:
            best = (mn, smiles)
    if best is not None:
        mn, smiles = best
        for (sx, sy, sw, sh) in smiles:
            cv.rectangle(img, (x + sx, top + sy), (x + sx + sw, top + sy + sh), (0, 0, 255), 2)
        print('입 하나만 남는 가장 작은 minNeighbors:', mn)
    cv.imshow('lower half ROI', roi)

cv.imshow('smile', img)
`,
      },
    ],
    quiz: [
      { q: 'Viola–Jones 검출기에서 “적분 영상(Integral image)”을 쓰는 가장 큰 이유는?', options: ['영상의 잡음을 없애려고', '컬러 영상을 흑백으로 바꾸려고', '어떤 크기의 사각형이든 픽셀 합을 몇 번의 덧셈 · 뺄셈으로 빠르게 구하려고', '얼굴의 회전 각도를 구하려고'], answer: 2, explain: '누적합 표의 네 모서리 값만으로 사각형 합을 구하므로, Haar 특징을 수십만 개 창에서 빠르게 계산할 수 있습니다.' },
      { q: '캐스케이드(Cascade) 구조가 검출을 빠르게 만드는 방식은?', options: ['모든 창에 모든 특징을 계산한다', '앞 단계에서 얼굴이 아닌 것이 확실한 창을 바로 버려, 대부분의 창은 적은 특징만 계산한다', 'GPU 를 반드시 사용한다', '이미지를 한 가지 크기로만 검사한다'], answer: 1, explain: '이미지의 대부분은 얼굴이 아닌 영역입니다. 가벼운 앞 단계에서 대부분을 탈락시키고, 남은 소수의 창만 뒤 단계에서 정밀하게 검사합니다.' },
      { q: 'detectMultiScale 에서 오검출(얼굴이 아닌데 상자가 나옴)을 줄이려면 어떤 인자를 키우는 것이 가장 직접적인가요?', options: ['scaleFactor 를 1.01 로', 'maxSize', '이미지 크기', 'minNeighbors'], answer: 3, explain: 'minNeighbors 는 한 위치에 겹쳐 나온 후보 수의 최소값입니다. 크게 하면 드문드문 나온 오검출이 걸러집니다(대신 놓치는 얼굴이 늘 수 있음).' },
      { q: '튜토리얼 코드에서 눈을 전체 이미지가 아니라 얼굴 ROI(faceROI) 안에서만 찾는 이유로 알맞지 않은 것은?', options: ['눈은 얼굴 안에 있으므로 오검출이 줄어든다', '검사할 영역이 작아져 빠르다', '눈 캐스케이드는 ROI 가 아니면 오류가 난다', '찾은 눈과 얼굴을 쉽게 짝지을 수 있다'], answer: 2, explain: '눈 캐스케이드는 전체 이미지에도 쓸 수 있습니다. ROI 를 쓰는 이유는 속도와 정확도, 그리고 얼굴-눈 짝짓기 때문입니다.' },
    ],
  },

  /* ======================================================================
   * a3-7 HOG 보행자 검출
   * ====================================================================== */
  {
    id: 'a3-7',
    assets: ['images/apps/street.png'],
    summary: '4교시 손글씨에서 쓴 HOG 특징을 64×128 창으로 키워 “사람 모양”을 찾는 Dalal–Triggs 보행자 검출기를 배웁니다. 셀 · 블록 · 방향 bin 으로 3780차원 특징이 만들어지는 과정을 그림으로 확인하고, OpenCV 기본 사람 검출기(HOG + 선형 SVM)의 winStride · padding · scale 을 실험한 뒤, 겹친 상자를 NMS 로 정리해 거리 사진과 보행자 동영상에 적용합니다.',
    goals: [
      'HOG 의 셀(8×8) · 블록(16×16, 정규화) · 방향 bin(9개)이 3780차원 특징을 만드는 과정을 설명할 수 있다',
      'cv.HOGDescriptor 와 HOGDescriptor_getDefaultPeopleDetector 로 사람을 검출하고 결과 상자와 점수를 해석할 수 있다',
      'winStride · padding · scale 이 속도와 검출 결과에 미치는 영향을 측정해 비교할 수 있다',
      '겹친 후보 상자를 cv.dnn.NMSBoxes(비최대 억제)로 정리하고, 동영상에 ROI · 확대를 적용해 실시간성을 조절할 수 있다',
    ],
    schedule: [['도입 · Haar 전신 검출 돌아보기', 4], ['HOG 특징: 그래디언트 · 셀 · 블록', 12], ['기본 사람 검출기', 8], ['파라미터와 속도', 7], ['NMS 와 동영상 적용', 7], ['실습 과제', 7], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. HOG + SVM 보행자 검출기</h3>
<p>2005년 <b>Dalal 과 Triggs</b>는 사람의 윤곽(머리 · 어깨 · 다리)이 만드는 <b>그래디언트 방향 분포</b>가 옷 색깔이나 조명이 달라도 비슷하다는 점에 주목했습니다. 이들이 만든 방법이 <b>HOG 특징 + 선형 SVM</b> 보행자 검출기이고, OpenCV 에 학습된 상태로 들어 있습니다.</p>
<ul>
<li><b>검출 창</b>: 가로 64 × 세로 128 픽셀 (서 있는 사람 비율 1:2)</li>
<li><b>특징</b>: 창 안의 HOG 3780개 숫자</li>
<li><b>분류기</b>: 선형 SVM — 특징 3780개와 가중치 3780개를 곱해 더한 값(+ 상수)이 0 보다 크면 “사람”</li>
<li><b>검출</b>: Haar 캐스케이드와 같이 창을 밀고(winStride) 이미지를 줄여 가며(scale) 모든 위치 · 크기를 검사</li>
</ul>
<p>6교시 Haar 는 “밝기 차이 사각형”을 캐스케이드로 빠르게 걸렀다면, HOG 는 “윤곽의 방향”을 촘촘하게 보고 SVM 한 번으로 판단합니다. 그래서 대체로 <b>더 정확하지만 더 느립니다.</b></p>` },
      { type: 'code', title: '예제 1 · 사람 창(64×128)의 그래디언트 보기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('street.png')
patch = img[177:343, 76:159]                  # 거리 사진 속 사람 부분
patch = cv.resize(patch, (64, 128))           # HOG 검출 창 크기로
gray = cv.cvtColor(patch, cv.COLOR_BGR2GRAY).astype(np.float32) / 255

# 1) 그래디언트: [-1, 0, 1] 커널 (Dalal-Triggs 논문과 같은 가장 단순한 미분)
gx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=1)
gy = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=1)
# 2) 크기와 방향(도). HOG 는 방향의 부호를 무시하고 0~180도만 사용 (unsigned)
mag, ang = cv.cartToPolar(gx, gy, angleInDegrees=True)
ang = ang % 180
print('창 크기:', gray.shape, ' 그래디언트 크기 최대 %.2f' % mag.max())

plt.figure(figsize=(10, 5))
titles = ['patch 64x128', '|gx|', '|gy|', 'magnitude', 'angle 0~180']
images = [cv.cvtColor(patch, cv.COLOR_BGR2RGB), np.abs(gx), np.abs(gy), mag, ang]
for i in range(5):
    plt.subplot(1, 5, i + 1)
    plt.imshow(images[i], cmap=None if i == 0 else ('hsv' if i == 4 else 'gray'))
    plt.title(titles[i]), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p>gx 는 세로 윤곽(몸통 양옆 · 다리), gy 는 가로 윤곽(어깨 · 발)에서 강합니다. 색 옷 · 배경의 무늬보다 <b>사람 외곽선</b>이 크기(magnitude) 영상에서 도드라집니다.</p>' },
      { type: 'text', html: `<h3>2. 셀 · 블록 · bin: 3780 은 어디서 나올까?</h3>
<ol>
<li><b>셀(cell) 8×8</b>: 64×128 창을 가로 8 × 세로 16 = 128개 셀로 나눔. 셀마다 <b>9개 방향 bin</b>(0°, 20°, … 160°)에 그래디언트 크기를 누적 → 셀 하나 = 9개 숫자</li>
<li><b>블록(block) 16×16</b> = 셀 2×2. 블록 안의 36개(4셀×9) 값을 <b>함께 정규화</b> → 그림자 · 조명 밝기 변화에 강해짐</li>
<li><b>블록 이동(block stride) 8</b>: 블록을 셀 하나만큼씩 겹치며 이동 → 가로 7곳 × 세로 15곳 = <b>105 블록</b></li>
<li>특징 길이 = 105 블록 × 36 = <b>3780</b></li>
</ol>
<p>4교시 손글씨 HOG(10×10 셀 4개, 16 bin, 64차원)와 원리는 같고, 크기와 정규화 방식만 다릅니다. <code>cv.HOGDescriptor()</code> 를 인자 없이 만들면 바로 이 보행자용 설정입니다.</p>` },
      { type: 'code', title: '예제 2 · 셀별 방향 히스토그램 그림 + HOGDescriptor 3780차원', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('street.png')
patch = cv.resize(img[177:343, 76:159], (64, 128))
gray = cv.cvtColor(patch, cv.COLOR_BGR2GRAY).astype(np.float32)

hog = cv.HOGDescriptor()        # 기본값 = 보행자 검출용 설정
print('winSize', hog.winSize, 'blockSize', hog.blockSize, 'blockStride', hog.blockStride,
      'cellSize', hog.cellSize, 'nbins', hog.nbins)
desc = hog.compute(patch)
print('HOG 특징 길이:', desc.shape, '= 블록 %d x %d x 셀 4 x bin 9' % ((64 - 16) // 8 + 1, (128 - 16) // 8 + 1))

# 셀(8×8)마다 9-bin 방향 히스토그램을 numpy 로 직접 계산해서 그림으로 (정규화 전 모양)
gx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=1)
gy = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=1)
mag, ang = cv.cartToPolar(gx, gy, angleInDegrees=True)
b = (ang % 180 // 20).astype(np.int32)                         # 0~8 bin
ys, xs = np.mgrid[0:128, 0:64]
cell = (ys // 8) * 8 + (xs // 8)                               # 셀 번호 0~127
hist = np.bincount((cell * 9 + b).ravel(), mag.ravel(), 128 * 9).reshape(16, 8, 9)

S = 6    # 확대 배율
vis = cv.cvtColor(cv.resize(patch, (64 * S, 128 * S), interpolation=cv.INTER_NEAREST), cv.COLOR_BGR2GRAY)
vis = cv.cvtColor((vis * 0.4).astype(np.uint8), cv.COLOR_GRAY2BGR)
top = hist.max()
for cy in range(16):
    for cx in range(8):
        c = ((cx * 8 + 4) * S, (cy * 8 + 4) * S)
        for k in range(9):
            v = hist[cy, cx, k] / top
            if v < 0.05:
                continue
            theta = np.deg2rad(k * 20 + 10 + 90)               # 그래디언트에 수직 = 윤곽선 방향
            dx, dy = np.cos(theta) * v * 4 * S, np.sin(theta) * v * 4 * S
            cv.line(vis, (int(c[0] - dx), int(c[1] - dy)), (int(c[0] + dx), int(c[1] + dy)), (0, int(120 + 135 * v), 255), 1, cv.LINE_AA)
for i in range(1, 8):
    cv.line(vis, (i * 8 * S, 0), (i * 8 * S, 128 * S), (60, 60, 60), 1)
for i in range(1, 16):
    cv.line(vis, (0, i * 8 * S), (64 * S, i * 8 * S), (60, 60, 60), 1)
cv.imshow('patch (x6)', cv.resize(patch, None, fx=S, fy=S, interpolation=cv.INTER_NEAREST))
cv.imshow('HOG cells: 8x8, 9 bins', vis)
`, desc: '<p>각 셀의 선분 묶음이 그 칸의 “주된 윤곽 방향”입니다. 두 다리와 몸통 옆선의 세로 선분, 어깨 · 발 부근의 가로 선분이 모여 사람의 윤곽 패턴을 이룹니다 — SVM 은 이 패턴을 보고 사람인지 판단합니다.</p>' },
      { type: 'code', title: '예제 3 · 기본 사람 검출기로 거리 사진에서 보행자 찾기', code: String.raw`
import cv2 as cv
import numpy as np
import time

hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())   # 미리 학습된 선형 SVM (3781개 계수)
print('SVM 계수 수:', len(cv.HOGDescriptor_getDefaultPeopleDetector()))

img = cv.imread('street.png')
t0 = time.perf_counter()
rects, weights = hog.detectMultiScale(img, winStride=(8, 8), padding=(8, 8), scale=1.05)
print('검출 %d 개, %.2f 초' % (len(rects), time.perf_counter() - t0))

out = img.copy()
for (x, y, w, h), score in zip(rects, np.array(weights).ravel()):
    color = (0, 255, 0) if score > 1.0 else (0, 165, 255)    # 점수 높으면 초록, 낮으면 주황
    cv.rectangle(out, (x, y), (x + w, y + h), color, 2)
    cv.putText(out, '%.2f' % score, (x, y - 5), cv.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    print('  상자 (x=%d, y=%d, w=%d, h=%d)  SVM 점수 %.2f' % (x, y, w, h, score))
cv.imshow('HOG people detector', out)
`, desc: '<p><code>weights</code> 는 SVM 결정 함수 값(3교시의 RAW_OUTPUT 과 같은 의미)입니다. 사람은 점수 2 이상으로 확실히 찾고, 왼쪽 난간 · 벽 쪽에 점수가 낮은 오검출이 하나 생깁니다. 점수 기준을 1.0 정도로 두면 걸러집니다.</p>' },
      { type: 'table', head: ['detectMultiScale 인자', '의미', '효과'], rows: [
        ['<code>winStride=(8, 8)</code>', '창을 옮기는 간격 (blockStride 의 배수)', '(4, 4): 촘촘 · 약 4배 느림 · (16, 16): 빠르지만 놓침'],
        ['<code>padding=(8, 8)</code>', '이미지 가장자리에 덧대는 여백', '화면 가장자리에 걸친 사람도 검사'],
        ['<code>scale=1.05</code>', '피라미드 한 단계마다 줄이는 비율 (Haar 의 scaleFactor)', '1.2: 단계가 적어 빠름 · 1.02: 느리지만 크기 사이를 촘촘히'],
        ['<code>hitThreshold=0</code>', 'SVM 점수 기준 (창 단위)', '올리면 오검출 · 검출 모두 감소'],
        ['<code>groupThreshold=2</code>', '겹친 상자 묶기 기준 (Haar 의 minNeighbors 와 비슷). <b>0 = 묶지 않음</b>', '0 으로 두고 NMS 를 직접 적용 가능'],
        ['최소 크기', '창이 64×128 이므로 <b>키가 약 128픽셀보다 작은 사람은 못 찾음</b>', '작은 사람은 이미지를 <b>확대</b>해서 검출'],
      ] },
      { type: 'code', title: '예제 4 · winStride · scale 에 따른 속도와 결과 비교', code: String.raw`
import cv2 as cv
import numpy as np
import time

hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())
img = cv.imread('street.png')

settings = [((8, 8), 1.05), ((16, 16), 1.05), ((8, 8), 1.2), ((4, 4), 1.2)]
views = []
print('winStride  scale   검출 수   시간')
for ws, sc in settings:
    t0 = time.perf_counter()
    rects, weights = hog.detectMultiScale(img, winStride=ws, padding=(8, 8), scale=sc)
    ms = (time.perf_counter() - t0) * 1000
    print('%-9s  %.2f   %4d    %5.0f ms' % (ws, sc, len(rects), ms))
    vis = img.copy()
    for (x, y, w, h) in rects:
        cv.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(vis, 'stride %d scale %.2f: %d, %.0f ms' % (ws[0], sc, len(rects), ms), (8, 24), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    views.append(cv.resize(vis, (320, 320)))
cv.imshow('HOG parameters', np.vstack([np.hstack(views[:2]), np.hstack(views[2:])]))
`, desc: '<p>winStride 를 2배로 늘리면 검사하는 창 수가 약 1/4, scale 을 1.05 → 1.2 로 올리면 피라미드 단계 수가 약 1/4 이 됩니다. 속도와 놓침 사이의 균형을 직접 확인하세요.</p>' },
      { type: 'text', html: `<h3>3. 겹친 상자 정리: 비최대 억제(NMS)</h3>
<p>창을 조금씩 옮기며 검사하므로 사람 한 명 주변에서 <b>여러 창이 동시에 “사람”</b>이라고 답합니다. 이 상자들을 하나로 정리하는 방법이 <b>비최대 억제(Non-Maximum Suppression, NMS)</b>입니다.</p>
<ol>
<li>점수(score)가 기준보다 낮은 상자는 버림</li>
<li>남은 상자 중 <b>점수가 가장 높은 상자</b>를 결과로 채택</li>
<li>채택한 상자와 <b>많이 겹치는(IoU 가 기준 이상)</b> 상자들은 “같은 사람”으로 보고 삭제</li>
<li>남은 상자가 없을 때까지 2~3 반복</li>
</ol>
<p><b>IoU(Intersection over Union)</b> = 두 상자의 겹친 넓이 ÷ 합친 넓이 (0~1). OpenCV 는 <code>cv.dnn.NMSBoxes(boxes, scores, score_threshold, nms_threshold)</code> 로 제공하며, 8교시 YOLO 에서도 똑같이 씁니다.</p>` },
      { type: 'code', title: '예제 5 · groupThreshold=0 원시 후보 → NMSBoxes 로 정리', code: String.raw`
import cv2 as cv
import numpy as np

hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())
img = cv.imread('street.png')

# groupThreshold=0: OpenCV 의 자체 묶기를 끄고 모든 후보 창을 받기
rects, weights = hog.detectMultiScale(img, winStride=(8, 8), padding=(8, 8), scale=1.05, groupThreshold=0)
scores = np.array(weights).ravel()
print('원시 후보 상자:', len(rects))

raw = img.copy()
for (x, y, w, h) in rects:
    cv.rectangle(raw, (x, y), (x + w, y + h), (0, 200, 255), 1)

def iou(a, b):
    ax2, ay2, bx2, by2 = a[0] + a[2], a[1] + a[3], b[0] + b[2], b[1] + b[3]
    iw = max(0, min(ax2, bx2) - max(a[0], b[0]))
    ih = max(0, min(ay2, by2) - max(a[1], b[1]))
    inter = iw * ih
    return inter / float(a[2] * a[3] + b[2] * b[3] - inter)

results = []
for score_th in (0.5, 1.0):
    keep = cv.dnn.NMSBoxes(rects.tolist(), scores.tolist(), score_th, 0.3) if len(rects) else []
    keep = np.array(keep).ravel()
    vis = img.copy()
    for i in keep:
        x, y, w, h = rects[i]
        cv.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(vis, '%.2f' % scores[i], (x, y - 5), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    print('score >= %.1f, IoU 0.3 NMS → %d 개: %s' % (score_th, len(keep), [rects[i].tolist() for i in keep]))
    cv.putText(vis, 'NMS score>=%.1f: %d' % (score_th, len(keep)), (8, 24), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    results.append(vis)

if len(keep) >= 1 and len(rects) >= 2:
    print('예: 최고 점수 상자와 다른 후보들의 IoU 최대값 %.2f' % max(iou(rects[keep[0]], r) for r in rects if not np.array_equal(r, rects[keep[0]])))
cv.putText(raw, 'raw candidates: %d' % len(rects), (8, 24), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
cv.imshow('raw | NMS 0.5 | NMS 1.0', np.hstack([cv.resize(v, (400, 400)) for v in [raw] + results]))
`, desc: '<p>원시 후보가 수십 개 겹쳐 있지만, NMS 후에는 사람마다 상자 하나만 남습니다. 점수 기준을 0.5 → 1.0 으로 올리면 난간 오검출도 사라집니다.</p>' },
      { type: 'code', title: '예제 6 · 보행자 동영상에 적용 (ROI 띠 + 확대 + NMS)', code: String.raw`
import cv2 as cv
import numpy as np
import time

cap = cv.VideoCapture('vtest.avi')       # 입력 소스를 보행자 동영상으로
hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('top %', 'result', 17, 100, nothing)       # 사람이 다니는 띠의 위쪽
cv.createTrackbar('bottom %', 'result', 62, 100, nothing)    # 띠의 아래쪽
cv.createTrackbar('zoom x10', 'result', 13, 20, nothing)     # 작은 사람을 키우는 배율
cv.createTrackbar('score x10', 'result', 5, 30, nothing)
print('vtest 의 사람은 키가 70~120 픽셀로 창(128)보다 작음 → 띠만 잘라 1.3배 확대해서 검출')

def process(frame):
    h, w = frame.shape[:2]
    y0 = int(h * cv.getTrackbarPos('top %', 'result') / 100)
    y1 = max(y0 + 100, int(h * cv.getTrackbarPos('bottom %', 'result') / 100))
    y1 = min(h, y1)
    z = max(10, cv.getTrackbarPos('zoom x10', 'result')) / 10.0
    score_th = cv.getTrackbarPos('score x10', 'result') / 10.0

    band = cv.resize(frame[y0:y1], None, fx=z, fy=z)
    t0 = time.perf_counter()
    rects, weights = hog.detectMultiScale(band, winStride=(8, 8), padding=(8, 8), scale=1.2, groupThreshold=0)
    ms = (time.perf_counter() - t0) * 1000

    out = frame.copy()
    cv.rectangle(out, (0, y0), (w - 1, y1 - 1), (0, 255, 255), 1)
    count = 0
    if len(rects):
        boxes = (np.array(rects, np.float32) / z)
        boxes[:, 1] += y0                                  # 띠 좌표 → 원본 좌표
        scores = np.array(weights, np.float32).ravel()
        keep = np.array(cv.dnn.NMSBoxes(boxes.tolist(), scores.tolist(), score_th, 0.3)).ravel()
        for i in keep:
            x, y, bw, bh = boxes[i].astype(int)
            cv.rectangle(out, (x, y), (x + bw, y + bh), (0, 255, 0), 2)
        count = len(keep)
    cv.putText(out, 'people: %d   HOG %.0f ms' % (count, ms), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return out
`, desc: '<p>전체 프레임을 2배 확대하면 브라우저에서 한 프레임에 수 초가 걸립니다. 사람이 다니는 <b>노란 띠(ROI)만 잘라 1.3배</b> 키우고 scale=1.2 로 단계를 줄여 한 프레임 약 0.2~0.3초로 만들었습니다. zoom 을 1.0 으로 내리면 작은 사람을 놓치는 것을 확인해 보세요.</p>' },
      { type: 'tip', html: `<p><b>Haar 전신 vs HOG 사람 검출</b> — Haar(fullbody)는 창이 14×28 로 작아 멀리 있는 사람도 찾고 빠르지만 기둥 · 표지판 오검출이 잦습니다. HOG 는 64×128 창이라 작은 사람은 확대가 필요하고 느리지만, 윤곽 방향을 보므로 오검출이 적습니다. 8교시에는 둘 다와 딥러닝(YOLOX)을 같은 사진에서 비교합니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 위험 구역 침입 경보',
        desc: `<p>보행자 동영상(또는 이미지)에서 사람을 찾고, 화면 위의 <b>위험 구역</b>(빨간 사각형) 안에 <b>사람의 발 위치(상자 아래쪽 가운데 점)</b>가 들어오면 그 사람을 빨간 상자로 표시하고 화면에 <b>ALERT</b> 를 띄우세요.
구역은 프레임 크기에 대한 비율로 정합니다: 가로 30%~60%, 세로 40%~65%.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

cap = cv.VideoCapture('vtest.avi')
hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())

def detect_people(frame):
    h, w = frame.shape[:2]
    y0, y1, z = int(h * 0.17), int(h * 0.62), 1.3
    band = cv.resize(frame[y0:y1], None, fx=z, fy=z)
    rects, weights = hog.detectMultiScale(band, winStride=(8, 8), padding=(8, 8), scale=1.2, groupThreshold=0)
    if len(rects) == 0:
        return []
    boxes = np.array(rects, np.float32) / z
    boxes[:, 1] += y0
    keep = np.array(cv.dnn.NMSBoxes(boxes.tolist(), np.array(weights, np.float32).ravel().tolist(), 0.5, 0.3)).ravel()
    return [boxes[i].astype(int) for i in keep]

def process(frame):
    h, w = frame.shape[:2]
    zx0, zx1, zy0, zy1 = int(w * 0.30), int(w * 0.60), int(h * 0.40), int(h * 0.65)
    out = frame.copy()
    cv.rectangle(out, (zx0, zy0), (zx1, zy1), (0, 0, 255), 2)
    alert = False
    for (x, y, bw, bh) in detect_people(frame):
        foot = (x + bw // 2, y + bh)             # 발 위치
        # TODO 1: foot 이 구역 안이면 inside = True
        inside = False
        # TODO 2: inside 면 빨간 상자 + alert = True, 아니면 초록 상자
        cv.rectangle(out, (x, y), (x + bw, y + bh), (0, 255, 0), 2)
        cv.circle(out, foot, 4, (255, 255, 0), -1)
    # TODO 3: alert 면 화면 왼쪽 위에 'ALERT' 크게 쓰기
    return out
`,
        hint: `<p><code>inside = zx0 &lt;= foot[0] &lt;= zx1 and zy0 &lt;= foot[1] &lt;= zy1</code>. 상자 색을 <code>color = (0, 0, 255) if inside else (0, 255, 0)</code> 로 고르고, 마지막에 <code>if alert: cv.putText(out, 'ALERT', (10, 50), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

cap = cv.VideoCapture('vtest.avi')
hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())

def detect_people(frame):
    h, w = frame.shape[:2]
    y0, y1, z = int(h * 0.17), int(h * 0.62), 1.3
    band = cv.resize(frame[y0:y1], None, fx=z, fy=z)
    rects, weights = hog.detectMultiScale(band, winStride=(8, 8), padding=(8, 8), scale=1.2, groupThreshold=0)
    if len(rects) == 0:
        return []
    boxes = np.array(rects, np.float32) / z
    boxes[:, 1] += y0
    keep = np.array(cv.dnn.NMSBoxes(boxes.tolist(), np.array(weights, np.float32).ravel().tolist(), 0.5, 0.3)).ravel()
    return [boxes[i].astype(int) for i in keep]

def process(frame):
    h, w = frame.shape[:2]
    zx0, zx1, zy0, zy1 = int(w * 0.30), int(w * 0.60), int(h * 0.40), int(h * 0.65)
    out = frame.copy()
    overlay = out.copy()
    cv.rectangle(overlay, (zx0, zy0), (zx1, zy1), (0, 0, 255), -1)
    out = cv.addWeighted(overlay, 0.2, out, 0.8, 0)          # 반투명 구역
    cv.rectangle(out, (zx0, zy0), (zx1, zy1), (0, 0, 255), 2)
    alert = False
    for (x, y, bw, bh) in detect_people(frame):
        foot = (int(x + bw // 2), int(y + bh))
        inside = zx0 <= foot[0] <= zx1 and zy0 <= foot[1] <= zy1
        color = (0, 0, 255) if inside else (0, 255, 0)
        alert = alert or inside
        cv.rectangle(out, (int(x), int(y)), (int(x + bw), int(y + bh)), color, 2)
        cv.circle(out, foot, 4, (255, 255, 0), -1)
    if alert:
        cv.putText(out, 'ALERT', (10, 50), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
    return out
`,
      },
      {
        title: '실습 2 · Haar 전신 vs HOG 사람 검출 비교',
        desc: `<p><code>street.png</code> 와 보행자 동영상의 현재 프레임(<code>cap.read()</code>) 두 장에서 <b>Haar 전신 캐스케이드</b>와 <b>HOG 사람 검출기</b>의 검출 수와 시간을 표로 출력하고, 결과를 나란히 그려 비교하세요. 동영상 프레임은 사람이 작으니 HOG 에는 1.5배 확대를 적용합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import time

cap = cv.VideoCapture('vtest.avi')
ok, frame = cap.read()
if not ok:
    frame = cv.imread('street.png')
images = {'street': cv.imread('street.png'), 'vtest': frame}

body = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_fullbody.xml')
hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())

def run_haar(img):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return list(body.detectMultiScale(gray, 1.1, 3))

def run_hog(img, zoom):
    # TODO: img 를 zoom 배 확대해 hog.detectMultiScale(winStride=(8,8), padding=(8,8), scale=1.2) 후
    #       상자 좌표를 zoom 으로 나눠 원래 크기 기준 리스트로 반환
    return []

print('%-7s %-5s %4s %8s' % ('image', 'algo', 'n', 'ms'))
for name, img in images.items():
    zoom = 1.0 if name == 'street' else 1.5
    vis = []
    for algo, fn in (('haar', lambda: run_haar(img)), ('hog', lambda: run_hog(img, zoom))):
        t0 = time.perf_counter()
        boxes = fn()
        ms = (time.perf_counter() - t0) * 1000
        print('%-7s %-5s %4d %8.0f' % (name, algo, len(boxes), ms))
        v = img.copy()
        for (x, y, w, h) in boxes:
            cv.rectangle(v, (int(x), int(y)), (int(x + w), int(y + h)), (0, 255, 0), 2)
        cv.putText(v, '%s %d' % (algo, len(boxes)), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
        vis.append(cv.resize(v, (384, int(img.shape[0] * 384 / img.shape[1]))))
    cv.imshow('compare ' + name, np.hstack(vis))
`,
        hint: `<p><code>big = cv.resize(img, None, fx=zoom, fy=zoom)</code> → <code>rects, _ = hog.detectMultiScale(big, winStride=(8, 8), padding=(8, 8), scale=1.2)</code> → <code>return [r / zoom for r in rects]</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import time

cap = cv.VideoCapture('vtest.avi')
ok, frame = cap.read()
if not ok:
    frame = cv.imread('street.png')
images = {'street': cv.imread('street.png'), 'vtest': frame}

body = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_fullbody.xml')
hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())

def run_haar(img):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return list(body.detectMultiScale(gray, 1.1, 3))

def run_hog(img, zoom):
    big = cv.resize(img, None, fx=zoom, fy=zoom) if zoom != 1.0 else img
    rects, _ = hog.detectMultiScale(big, winStride=(8, 8), padding=(8, 8), scale=1.2)
    return [np.array(r) / zoom for r in rects]

print('%-7s %-5s %4s %8s' % ('image', 'algo', 'n', 'ms'))
for name, img in images.items():
    zoom = 1.0 if name == 'street' else 1.5
    vis = []
    for algo, fn in (('haar', lambda: run_haar(img)), ('hog', lambda: run_hog(img, zoom))):
        t0 = time.perf_counter()
        boxes = fn()
        ms = (time.perf_counter() - t0) * 1000
        print('%-7s %-5s %4d %8.0f' % (name, algo, len(boxes), ms))
        v = img.copy()
        for (x, y, w, h) in boxes:
            cv.rectangle(v, (int(x), int(y)), (int(x + w), int(y + h)), (0, 255, 0), 2)
        cv.putText(v, '%s %d' % (algo, len(boxes)), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
        vis.append(cv.resize(v, (384, int(img.shape[0] * 384 / img.shape[1]))))
    cv.imshow('compare ' + name, np.hstack(vis))
`,
      },
    ],
    quiz: [
      { q: '기본 보행자 HOG(64×128 창, 8×8 셀, 16×16 블록, 블록 이동 8, 9 bin)의 특징 길이가 3780 인 이유는?', options: ['블록 7×15 = 105개 × (셀 4개 × 9 bin)', '64 × 128 / 2', '셀 128개 × 9 bin × 3', '픽셀 수 × 9'], answer: 0, explain: '블록이 가로 (64−16)/8+1 = 7, 세로 (128−16)/8+1 = 15 곳에 놓이고, 블록마다 4셀 × 9bin = 36 개이므로 105 × 36 = 3780 입니다.' },
      { q: 'HOG 에서 여러 셀을 묶은 “블록” 단위로 정규화하는 주된 이유는?', options: ['특징 길이를 줄이려고', '조명 · 그림자에 따른 밝기(대비) 변화에 강해지려고', '컬러 정보를 쓰려고', '검출 창을 더 빨리 옮기려고'], answer: 1, explain: '같은 윤곽이라도 밝은 곳과 어두운 곳의 그래디언트 크기가 다릅니다. 블록 단위로 정규화하면 상대적인 방향 분포만 남아 조명 변화에 강해집니다.' },
      { q: 'hog.detectMultiScale 에서 winStride 를 (8, 8) → (16, 16) 으로 바꾸면?', options: ['더 작은 사람을 찾을 수 있다', '정확도가 항상 올라간다', '특징 길이가 절반이 된다', '검사하는 창 수가 약 1/4 로 줄어 빨라지지만 사람을 놓칠 수 있다'], answer: 3, explain: '가로 · 세로 간격이 2배가 되어 창 수가 약 1/4 입니다. 사람 위치와 창이 잘 맞지 않으면 점수가 낮아져 놓칠 수 있습니다.' },
      { q: '비최대 억제(NMS)에 대한 설명으로 옳은 것은?', options: ['점수가 높은 상자를 남기고, 그 상자와 IoU 가 기준 이상 겹치는 상자를 지운다', '점수가 가장 낮은 상자부터 남긴다', '모든 상자의 평균 위치로 하나를 만든다', '겹치지 않는 상자를 지운다'], answer: 0, explain: 'NMS 는 가장 확신하는 상자를 채택하고 같은 물체를 가리키는(많이 겹치는) 나머지 상자를 제거하는 과정을 반복합니다.' },
      { q: 'vtest 동영상의 사람(키 약 80픽셀)을 기본 HOG 검출기로 찾으려면 가장 알맞은 방법은?', options: ['scale 을 2.0 으로 올린다', 'winStride 를 32 로 늘린다', '이미지를 확대(또는 사람이 있는 띠만 잘라 확대)한 뒤 검출한다', '흑백으로 바꾸지 않는다'], answer: 2, explain: '검출 창이 64×128 이라 그보다 작은 사람은 찾을 수 없습니다. 이미지를 키우면 사람이 창 크기 이상이 되고, ROI 로 잘라서 키우면 계산량도 줄일 수 있습니다.' },
    ],
  },

  /* ======================================================================
   * a3-8 DNN 객체 검출과 3주차 총정리
   * ====================================================================== */
  {
    id: 'a3-8',
    assets: ['images/apps/street.png', 'images/apps/dog416.png', 'models/yolox_nano.onnx', 'models/face_detection_yunet_2023mar.onnx'],
    summary: '사람이 특징을 설계하던 방법(Haar · HOG)에서, 신경망이 특징까지 스스로 배우는 딥러닝 검출로 넘어갑니다. OpenCV dnn 모듈의 파이프라인(blobFromImage → forward → 디코딩 → NMS)으로 YOLOX-nano 가 80가지 물체를 찾게 하고, FaceDetectorYN(YuNet)으로 얼굴과 랜드마크를 찾습니다. 같은 사진에서 Haar · HOG · DNN 의 속도와 결과를 직접 재어 비교하고, 3주차 전체를 정리하며 4주차 프로젝트를 예고합니다.',
    goals: [
      '전통적 검출(손으로 설계한 특징 + 분류기)과 딥러닝 검출(학습된 특징)의 차이를 설명할 수 있다',
      'readNetFromONNX · blobFromImage · setInput · forward 로 ONNX 모델을 실행하고 출력 배열의 모양을 해석할 수 있다',
      'YOLOX 출력(격자 · 스트라이드 · 점수)을 상자로 디코딩하고 NMSBoxes 로 정리할 수 있다',
      'FaceDetectorYN 으로 얼굴 · 5개 랜드마크를 찾고, Haar · HOG · DNN 의 속도 · 정확도를 측정해 상황에 맞게 고를 수 있다',
    ],
    schedule: [['도입 · 특징을 누가 만드는가', 4], ['DNN 파이프라인 · blob', 7], ['YOLOX 디코딩 · NMS', 10], ['YuNet 얼굴 검출', 5], ['Haar · HOG · DNN 비교', 7], ['3주차 총정리 · 4주차 예고', 5], ['실습 과제', 7], ['퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 특징을 사람이 만들까, 신경망이 배울까</h3>
<p>이번 주 검출기들을 돌아보면 모두 “<b>사람이 설계한 특징</b> + 학습된 분류기” 구조였습니다.</p>
<ul>
<li>Haar: 밝기 차이 사각형 (사람이 모양을 정함) + AdaBoost 캐스케이드</li>
<li>HOG: 그래디언트 방향 히스토그램 (사람이 셀 · 블록을 정함) + 선형 SVM</li>
</ul>
<p><b>딥러닝(CNN, 합성곱 신경망)</b>은 수백만 장의 사진으로 <b>특징을 만드는 필터 자체</b>까지 학습합니다. 앞쪽 층은 Sobel 같은 엣지 필터를, 뒤쪽 층은 눈 · 바퀴 · 얼굴 같은 부분을 스스로 배웁니다. 그래서 자세 · 조명 · 크기 변화에 훨씬 강하고, <b>한 번에 여러 종류의 물체</b>를 찾을 수 있습니다.</p>
<p>OpenCV 의 <b>dnn 모듈</b>은 PyTorch 등에서 학습해 <b>ONNX</b> 파일로 내보낸 모델을 불러와 추론(forward)만 합니다. 학습은 다른 도구에서, 실행은 OpenCV 에서 — 이것이 실무에서 흔한 조합입니다.</p>` },
      { type: 'table', head: ['단계', '함수', '하는 일'], rows: [
        ['① 모델 불러오기', '<code>net = cv.dnn.readNetFromONNX(\'yolox_nano.onnx\')</code>', '신경망 구조와 학습된 가중치 읽기 (한 번만)'],
        ['② 전처리 → blob', '<code>cv.dnn.blobFromImage(img, scalefactor, size, mean, swapRB)</code>', '크기 맞추기 · 정규화 · 채널 순서 → <b>(N, C, H, W)</b> 4차원 배열'],
        ['③ 추론', '<code>net.setInput(blob)</code> → <code>out = net.forward()</code>', '신경망 계산. 출력 모양은 모델마다 다름'],
        ['④ 디코딩', 'numpy', '출력 숫자를 상자 좌표 · 클래스 · 점수로 해석 (모델 문서 참고)'],
        ['⑤ NMS', '<code>cv.dnn.NMSBoxes(boxes, scores, score_th, nms_th)</code>', '겹친 상자 정리 (7교시와 같음)'],
      ] },
      { type: 'code', title: '예제 1 · blobFromImage 가 만드는 신경망 입력 살펴보기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('street.png')
print('원본 이미지:', img.shape, img.dtype, '(H, W, C) BGR')

# YOLOX 는 416×416 정사각형 입력. 비율을 지키려고 줄인 뒤 남는 곳을 회색(114)으로 채움 (letterbox)
SIZE = 416
h, w = img.shape[:2]
r = min(SIZE / h, SIZE / w)
nh, nw = int(round(h * r)), int(round(w * r))
pad = np.full((SIZE, SIZE, 3), 114, np.uint8)
pad[:nh, :nw] = cv.resize(img, (nw, nh))

blob = cv.dnn.blobFromImage(pad)          # YOLOX: 크기 그대로, 0~255, BGR 그대로
print('YOLOX blob :', blob.shape, blob.dtype, '값 범위 %.0f ~ %.0f' % (blob.min(), blob.max()))

# 다른 모델에서 흔한 설정 예: 1/255 로 정규화, 224×224, RGB 순서
blob2 = cv.dnn.blobFromImage(img, scalefactor=1 / 255.0, size=(224, 224), mean=(0, 0, 0), swapRB=True)
print('예시 blob2 :', blob2.shape, '값 범위 %.2f ~ %.2f' % (blob2.min(), blob2.max()))

# blob 의 채널 3장을 이미지로 펼쳐 보기: (1, 3, H, W) → 채널별 흑백
channels = [blob[0, c].astype(np.uint8) for c in range(3)]
view = np.hstack([cv.resize(ch, (208, 208)) for ch in channels])
cv.putText(view, 'B', (5, 25), cv.FONT_HERSHEY_SIMPLEX, 0.8, 255, 2)
cv.putText(view, 'G', (213, 25), cv.FONT_HERSHEY_SIMPLEX, 0.8, 255, 2)
cv.putText(view, 'R', (421, 25), cv.FONT_HERSHEY_SIMPLEX, 0.8, 255, 2)
cv.imshow('letterbox 416', pad)
cv.imshow('blob channels (N, C, H, W)', view)
`, desc: '<p>OpenCV 이미지는 (H, W, C) 인데 신경망은 (N, C, H, W) — <b>배치 수, 채널, 세로, 가로</b> 순서를 씁니다. 전처리(크기 · 정규화 · RGB/BGR)는 <b>모델을 학습할 때와 똑같이</b> 해야 하며, 틀리면 오류 없이 결과만 엉망이 됩니다.</p>' },
      { type: 'text', html: `<h3>2. YOLO: 한 번만 보고 모든 물체를 찾기</h3>
<p><b>YOLO(You Only Look Once)</b>는 창을 수만 번 옮기는 대신, 신경망을 <b>한 번</b> 통과시켜 격자의 칸마다 “여기에 물체가 있다면 상자와 종류는?”을 동시에 예측합니다. 여기서는 가볍고 라이선스가 자유로운 <b>YOLOX-nano</b>(3.5MB, COCO 80종)를 씁니다.</p>
<ul>
<li>416×416 입력을 <b>스트라이드 8 · 16 · 32</b> 로 나눈 격자: 52×52 + 26×26 + 13×13 = <b>3549 칸</b> (작은 · 중간 · 큰 물체 담당)</li>
<li>칸마다 <b>85개 숫자</b>: [x 오프셋, y 오프셋, log(폭), log(높이), 물체일 확률, 80개 클래스 확률]</li>
<li>디코딩: <code>중심 = (오프셋 + 칸 번호) × 스트라이드</code>, <code>폭·높이 = exp(값) × 스트라이드</code>, <code>점수 = 물체 확률 × 클래스 확률</code></li>
<li>letterbox 비율 <code>r</code> 로 나눠 원본 좌표로 되돌린 뒤 <b>NMS</b></li>
</ul>` },
      { type: 'code', title: '예제 2 · YOLOX-nano 로 80종 물체 검출 (street.png · dog416.png)', code: String.raw`
import cv2 as cv
import numpy as np
import time

CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant',
    'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard',
    'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli',
    'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush']
SIZE = 416
net = cv.dnn.readNetFromONNX('yolox_nano.onnx')

# 격자 칸 번호와 스트라이드 표 (3549 × 2, 3549 × 1) — 한 번만 만들어 둠
grids, strides = [], []
for s in (8, 16, 32):
    n = SIZE // s
    xv, yv = np.meshgrid(np.arange(n), np.arange(n))
    grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
    strides.append(np.full((n * n, 1), s))
GRIDS = np.concatenate(grids).astype(np.float32)
STRIDES = np.concatenate(strides).astype(np.float32)

def detect(img, conf_th=0.35, nms_th=0.45):
    h, w = img.shape[:2]
    r = min(SIZE / h, SIZE / w)
    nh, nw = int(round(h * r)), int(round(w * r))
    pad = np.full((SIZE, SIZE, 3), 114, np.uint8)
    pad[:nh, :nw] = cv.resize(img, (nw, nh))
    net.setInput(cv.dnn.blobFromImage(pad))
    pred = net.forward()[0]                              # (3549, 85)
    xy = (pred[:, :2] + GRIDS) * STRIDES                  # 상자 중심
    wh = np.exp(pred[:, 2:4]) * STRIDES                   # 상자 폭 · 높이
    scores = pred[:, 4:5] * pred[:, 5:]                   # 물체 확률 × 클래스 확률 (3549, 80)
    cls = scores.argmax(1)
    conf = scores[np.arange(len(cls)), cls]
    keep = conf >= conf_th
    boxes = np.concatenate([xy - wh / 2, wh], 1)[keep] / r   # (x, y, w, h) 원본 좌표
    cls, conf = cls[keep], conf[keep]
    if len(boxes) == 0:
        return []
    idx = np.array(cv.dnn.NMSBoxes(boxes.tolist(), conf.tolist(), conf_th, nms_th)).ravel()
    return [(CLASSES[cls[i]], float(conf[i]), boxes[i].astype(int)) for i in idx]

for name in ['street.png', 'dog416.png']:
    img = cv.imread(name)
    t0 = time.perf_counter()
    dets = detect(img)
    print('%s: %d 개 (%.2f 초)' % (name, len(dets), time.perf_counter() - t0))
    out = img.copy()
    for label, score, (x, y, w, h) in dets:
        print('   %-14s %.2f  (x=%d, y=%d, w=%d, h=%d)' % (label, score, x, y, w, h))
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(out, '%s %.0f%%' % (label, score * 100), (x, max(12, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1, cv.LINE_AA)
    cv.imshow('YOLOX-nano: ' + name, out)
`, desc: '<p>한 번의 forward 로 사람 · 자동차 · 신호등(street), 개 · 자전거 · 트럭(dog416)을 동시에 찾습니다. 첫 실행은 모델을 준비하느라 더 걸리고, 그다음부터 한 장에 브라우저 기준 약 0.4초입니다.</p>' },
      { type: 'text', html: `<h3>3. 얼굴 전용 딥러닝: YuNet (FaceDetectorYN)</h3>
<p>OpenCV 4.5.4 부터는 초경량 얼굴 검출 모델 <b>YuNet</b>(약 230KB)을 위한 전용 클래스 <code>cv.FaceDetectorYN</code> 이 들어 있어, blob 만들기 · 디코딩 · NMS 를 직접 할 필요가 없습니다.</p>
<ul>
<li><code>detector = cv.FaceDetectorYN.create(model, '', (w, h), score_threshold, nms_threshold, top_k)</code></li>
<li>이미지 크기가 바뀌면 <code>detector.setInputSize((w, h))</code></li>
<li><code>_, faces = detector.detect(img)</code> → 얼굴마다 <b>15개 값</b>: [x, y, w, h, 오른눈 x, y, 왼눈 x, y, 코 x, y, 오른입꼬리 x, y, 왼입꼬리 x, y, 점수] (없으면 None)</li>
</ul>` },
      { type: 'code', title: '예제 3 · YuNet 얼굴 · 랜드마크 검출 (lena · messi5)', code: String.raw`
import cv2 as cv
import numpy as np
import time

detector = cv.FaceDetectorYN.create('face_detection_yunet_2023mar.onnx', '', (320, 320), 0.6, 0.3, 5000)
COLORS = [(255, 0, 0), (0, 0, 255), (0, 255, 0), (255, 0, 255), (0, 255, 255)]   # 오른눈 · 왼눈 · 코 · 입꼬리 2
NAMES = ['right eye', 'left eye', 'nose', 'mouth R', 'mouth L']

for name in ['lena.jpg', 'messi5.jpg']:
    img = cv.imread(name)
    h, w = img.shape[:2]
    detector.setInputSize((w, h))                 # 입력 크기를 꼭 알려 주기
    t0 = time.perf_counter()
    _, faces = detector.detect(img)
    ms = (time.perf_counter() - t0) * 1000
    faces = faces if faces is not None else []
    print('%s: 얼굴 %d 개 (%.0f ms)' % (name, len(faces), ms))
    out = img.copy()
    for f in faces:
        x, y, fw, fh = f[:4].astype(int)
        cv.rectangle(out, (x, y), (x + fw, y + fh), (0, 255, 0), 2)
        for j in range(5):
            px, py = f[4 + 2 * j], f[5 + 2 * j]
            cv.circle(out, (int(px), int(py)), 3, COLORS[j], -1)
        cv.putText(out, '%.2f' % f[14], (x, max(12, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        eyes = f[4:8]
        angle = np.degrees(np.arctan2(eyes[3] - eyes[1], eyes[2] - eyes[0]))
        print('   상자 (%d, %d, %d, %d) 점수 %.2f, 두 눈을 이은 선의 기울기 %.1f도' % (x, y, fw, fh, f[14], angle))
    cv.imshow('YuNet: ' + name, out)
`, desc: '<p>messi5 의 작은 얼굴(약 31×40)에서도 두 눈 · 코 · 입꼬리를 찾습니다. Haar 눈 검출기는 이 크기에서 눈을 찾지 못했습니다(6교시). 랜드마크로 얼굴 기울기 · 정렬도 할 수 있습니다(실습 2).</p>' },
      { type: 'text', html: `<h3>4. 같은 사진, 세 가지 방법: Haar · HOG · DNN</h3>
<p>3주차에 배운 검출기를 <b>같은 조건</b>에서 비교해 봅시다. 공정하게 재려면 같은 이미지로 여러 방법을 돌리고, DNN 모델은 미리 한 번 실행해(warm-up) 첫 실행의 준비 시간을 빼고 잽니다.</p>
<ul>
<li><b>얼굴</b>: Haar(frontalface_alt) vs YuNet — lena.jpg, messi5.jpg</li>
<li><b>사람</b>: Haar(fullbody) vs HOG vs YOLOX(person 클래스) — street.png</li>
</ul>` },
      { type: 'code', title: '예제 4 · 속도 · 결과 측정 비교표', code: String.raw`
import cv2 as cv
import numpy as np
import time

SIZE = 416
face_haar = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_alt.xml')
body_haar = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_fullbody.xml')
hog = cv.HOGDescriptor()
hog.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())
yunet = cv.FaceDetectorYN.create('face_detection_yunet_2023mar.onnx', '', (320, 320), 0.6, 0.3, 5000)
yolo = cv.dnn.readNetFromONNX('yolox_nano.onnx')
grids, strides = [], []
for s in (8, 16, 32):
    n = SIZE // s
    xv, yv = np.meshgrid(np.arange(n), np.arange(n))
    grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
    strides.append(np.full((n * n, 1), s))
GRIDS = np.concatenate(grids).astype(np.float32)
STRIDES = np.concatenate(strides).astype(np.float32)

def run_haar_face(img):
    return len(face_haar.detectMultiScale(cv.equalizeHist(cv.cvtColor(img, cv.COLOR_BGR2GRAY))))

def run_yunet(img):
    yunet.setInputSize((img.shape[1], img.shape[0]))
    faces = yunet.detect(img)[1]
    return 0 if faces is None else len(faces)

def run_haar_body(img):
    return len(body_haar.detectMultiScale(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 1.1, 3))

def run_hog(img):
    return len(hog.detectMultiScale(img, winStride=(8, 8), padding=(8, 8), scale=1.05)[0])

def run_yolox_person(img, conf_th=0.35):
    h, w = img.shape[:2]
    r = min(SIZE / h, SIZE / w)
    pad = np.full((SIZE, SIZE, 3), 114, np.uint8)
    pad[:int(round(h * r)), :int(round(w * r))] = cv.resize(img, (int(round(w * r)), int(round(h * r))))
    yolo.setInput(cv.dnn.blobFromImage(pad))
    pred = yolo.forward()[0]
    score = pred[:, 4] * pred[:, 5]                        # person 클래스(0번) 점수만
    keep = score >= conf_th
    xy = (pred[keep, :2] + GRIDS[keep]) * STRIDES[keep]
    wh = np.exp(pred[keep, 2:4]) * STRIDES[keep]
    boxes = (np.concatenate([xy - wh / 2, wh], 1) / r).tolist()
    return len(cv.dnn.NMSBoxes(boxes, score[keep].tolist(), conf_th, 0.45)) if boxes else 0

def measure(fn, img, warmup):
    if warmup:
        fn(img)                               # DNN 은 첫 실행에 메모리 준비 시간이 있어 한 번 미리 실행
    t0 = time.perf_counter()
    n = fn(img)
    return n, (time.perf_counter() - t0) * 1000

tests = [('face', 'lena.jpg', 'Haar face', run_haar_face), ('face', 'lena.jpg', 'YuNet', run_yunet),
         ('face', 'messi5.jpg', 'Haar face', run_haar_face), ('face', 'messi5.jpg', 'YuNet', run_yunet),
         ('person', 'street.png', 'Haar fullbody', run_haar_body), ('person', 'street.png', 'HOG+SVM', run_hog),
         ('person', 'street.png', 'YOLOX-nano', run_yolox_person)]
images = {}
print('%-7s %-11s %-14s %6s %9s' % ('target', 'image', 'method', 'count', 'time(ms)'))
for target, name, method, fn in tests:
    img = images.setdefault(name, cv.imread(name))
    n, ms = measure(fn, img, fn in (run_yunet, run_yolox_person))
    print('%-7s %-11s %-14s %6d %9.0f' % (target, name, method, n, ms))
`, desc: '<p>일곱 가지를 차례로 재므로 브라우저에서는 몇 초 걸립니다. 시간은 컴퓨터 · 브라우저마다 다르니 <b>순서와 비율</b>을 보세요. 정답은 lena 얼굴 1, messi5 얼굴 1(관중은 흐려서 제외), street 사람 1명입니다. 이 사진들에서 HOG 는 왼쪽 난간을 사람으로 착각해 2개가 나오고, YuNet 은 Haar 보다 몇 배 빠르며, YOLOX 는 사람 외에 자동차 · 신호등까지 한 번에 찾는 계산을 하면서도 HOG 와 비슷한 시간이 걸립니다. 사진 몇 장의 비교일 뿐이니, 실제 선택은 <b>내 데이터로 측정</b>해서 하세요.</p>' },
      { type: 'table', head: ['비교', 'Haar 캐스케이드', 'HOG + SVM', 'DNN (YuNet · YOLOX)'], rows: [
        ['특징', '사람이 설계 (밝기 차이 사각형)', '사람이 설계 (그래디언트 방향)', '<b>신경망이 학습</b>'],
        ['찾는 대상', '학습 파일마다 1종 (얼굴 · 눈 · 전신…)', '1종 (기본: 서 있는 사람)', 'YOLOX: 80종 동시 · YuNet: 얼굴 + 랜드마크'],
        ['강한 점', '가볍고 빠름, 모델 파일 불필요(내장)', '윤곽 기반이라 오검출 적음', '자세 · 조명 · 크기 변화에 강함, 정확도 높음'],
        ['약한 점', '정면 · 조명 의존, 오검출 많음', '작은 사람은 확대 필요, 느림', '모델 파일 필요, CPU 에서 연산량 큼(GPU 면 매우 빠름)'],
        ['추천 상황', '저사양 · 간단한 얼굴 유무 판단', '고정 카메라 보행자, 학습 교육용', '대부분의 실제 서비스 (정확도가 중요할 때)'],
      ] },
      { type: 'code', title: '예제 5 · 실시간 YOLOX 검출 (웹캠 · 동영상)', code: String.raw`
import cv2 as cv
import numpy as np
import time

CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant',
    'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard',
    'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli',
    'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush']
SIZE = 416
net = cv.dnn.readNetFromONNX('yolox_nano.onnx')
grids, strides = [], []
for s in (8, 16, 32):
    n = SIZE // s
    xv, yv = np.meshgrid(np.arange(n), np.arange(n))
    grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
    strides.append(np.full((n * n, 1), s))
GRIDS = np.concatenate(grids).astype(np.float32)
STRIDES = np.concatenate(strides).astype(np.float32)
COLORS = np.random.default_rng(3).integers(40, 256, (80, 3)).tolist()

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('confidence %', 'result', 40, 95, nothing)
cv.createTrackbar('person only', 'result', 0, 1, nothing)
print('입력 소스를 📷 웹캠이나 🎞️ 동영상(vtest.mp4 등)으로 바꿔 보세요')

def process(frame):
    conf_th = max(5, cv.getTrackbarPos('confidence %', 'result')) / 100.0
    person_only = cv.getTrackbarPos('person only', 'result') == 1
    h, w = frame.shape[:2]
    r = min(SIZE / h, SIZE / w)
    nh, nw = int(round(h * r)), int(round(w * r))
    pad = np.full((SIZE, SIZE, 3), 114, np.uint8)
    pad[:nh, :nw] = cv.resize(frame, (nw, nh))
    net.setInput(cv.dnn.blobFromImage(pad))
    t0 = time.perf_counter()
    pred = net.forward()[0]
    ms = (time.perf_counter() - t0) * 1000

    xy = (pred[:, :2] + GRIDS) * STRIDES
    wh = np.exp(pred[:, 2:4]) * STRIDES
    scores = pred[:, 4:5] * pred[:, 5:]
    if person_only:
        scores[:, 1:] = 0
    cls = scores.argmax(1)
    conf = scores[np.arange(len(cls)), cls]
    keep = conf >= conf_th
    boxes = np.concatenate([xy - wh / 2, wh], 1)[keep] / r
    cls, conf = cls[keep], conf[keep]
    out = frame.copy()
    counts = {}
    if len(boxes):
        for i in np.array(cv.dnn.NMSBoxes(boxes.tolist(), conf.tolist(), conf_th, 0.45)).ravel():
            x, y, bw, bh = boxes[i].astype(int)
            name = CLASSES[cls[i]]
            counts[name] = counts.get(name, 0) + 1
            cv.rectangle(out, (x, y), (x + bw, y + bh), COLORS[cls[i]], 2)
            cv.putText(out, '%s %.0f%%' % (name, conf[i] * 100), (x, max(12, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[cls[i]], 2)
    text = '%.0f ms  ' % ms + '  '.join('%s:%d' % kv for kv in sorted(counts.items(), key=lambda kv: -kv[1]))
    cv.putText(out, text, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    return out
`, desc: '<p>브라우저(WebAssembly, CPU 1코어)에서는 한 프레임 약 0.4초라 동영상이 뚝뚝 끊겨 보이지만, 같은 모델이 PC CPU 에서는 수십 FPS, GPU 에서는 수백 FPS 로 동작합니다. 응용 예제 메뉴의 YOLO 데모와 같은 코드입니다.</p>' },
      { type: 'text', html: `<h3>5. 3주차 총정리</h3>
<p>이번 주에는 “데이터로 배우는” 도구를 차례로 쌓아 올렸습니다. 아래 표로 각 교시의 핵심 함수와 결과를 한눈에 정리합니다.</p>` },
      { type: 'table', head: ['교시', '주제', '핵심 함수', '이번 주 결과'], rows: [
        ['1 · 2', 'kNN 분류 · 손글씨 · 영문자', '<code>cv.ml.KNearest_create</code>, <code>findNearest</code>', '숫자 91.8% (픽셀), 영문자 약 93%'],
        ['3 · 4', 'SVM · HOG 손글씨', '<code>cv.ml.SVM_create</code>, <code>trainAuto</code>, <code>HOGDescriptor.compute</code>', 'deskew + HOG + SVM 95.7% ~ 97.6%'],
        ['5', 'K-Means 군집화 · 색 양자화', '<code>cv.kmeans</code>', '색 K 개로 줄이기, 팔레트 추출'],
        ['6', 'Haar 캐스케이드', '<code>CascadeClassifier.detectMultiScale</code>', '얼굴 · 눈 · 전신 검출'],
        ['7', 'HOG 보행자 검출', '<code>HOGDescriptor_getDefaultPeopleDetector</code>, <code>NMSBoxes</code>', 'ROI + 확대로 동영상 보행자'],
        ['8', 'DNN 검출', '<code>readNetFromONNX</code>, <code>blobFromImage</code>, <code>FaceDetectorYN</code>', '80종 물체 · 얼굴 랜드마크'],
      ] },
      { type: 'tip', html: `<p><b>4주차 예고 — 프로젝트 Ⅰ</b>: 1~3주차 기술을 엮어 결과물을 만듭니다. ① 특징 매칭 + 호모그래피로 <b>파노라마</b> ② 평면 물체 인식 · <b>AR 오버레이</b> ③ 캘리브레이션 기반 <b>실측</b> ④ 이번 주 SVM + HOG 로 <b>손글씨 숫자 인식기</b>를 따라 만들고, 팀 프로젝트를 기획해 프로토타입까지 완성합니다. 이번 주 코드(특히 deskew · HOG · SVM 저장, detect 함수)를 정리해 두세요!</p>` },
    ],
    practice: [
      {
        title: '실습 1 · YOLOX 교통량 카운터',
        desc: `<p>YOLOX 로 한 장(또는 동영상 프레임)에서 <b>사람 · 자전거 · 자동차 · 버스 · 트럭</b>만 골라 개수를 세고, 화면 위쪽에 반투명 막대로 “person 3 car 2 …” 형태의 집계를 표시하세요. 다른 클래스(신호등, 개 등)는 그리지 않습니다.
입력 소스는 street.png · dog416.png 이미지나 🎞️ 동영상으로 바꿔 가며 확인합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant',
    'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard',
    'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli',
    'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush']
TARGETS = ['person', 'bicycle', 'car', 'bus', 'truck']
SIZE = 416
net = cv.dnn.readNetFromONNX('yolox_nano.onnx')
grids, strides = [], []
for s in (8, 16, 32):
    n = SIZE // s
    xv, yv = np.meshgrid(np.arange(n), np.arange(n))
    grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
    strides.append(np.full((n * n, 1), s))
GRIDS = np.concatenate(grids).astype(np.float32)
STRIDES = np.concatenate(strides).astype(np.float32)

def detect(img, conf_th=0.35):
    h, w = img.shape[:2]
    r = min(SIZE / h, SIZE / w)
    nh, nw = int(round(h * r)), int(round(w * r))
    pad = np.full((SIZE, SIZE, 3), 114, np.uint8)
    pad[:nh, :nw] = cv.resize(img, (nw, nh))
    net.setInput(cv.dnn.blobFromImage(pad))
    pred = net.forward()[0]
    xy = (pred[:, :2] + GRIDS) * STRIDES
    wh = np.exp(pred[:, 2:4]) * STRIDES
    scores = pred[:, 4:5] * pred[:, 5:]
    cls = scores.argmax(1)
    conf = scores[np.arange(len(cls)), cls]
    keep = conf >= conf_th
    boxes = np.concatenate([xy - wh / 2, wh], 1)[keep] / r
    cls, conf = cls[keep], conf[keep]
    if len(boxes) == 0:
        return []
    idx = np.array(cv.dnn.NMSBoxes(boxes.tolist(), conf.tolist(), conf_th, 0.45)).ravel()
    return [(CLASSES[cls[i]], float(conf[i]), boxes[i].astype(int)) for i in idx]

def process(frame):
    out = frame.copy()
    counts = {t: 0 for t in TARGETS}
    for label, score, (x, y, w, h) in detect(frame):
        # TODO 1: label 이 TARGETS 에 없으면 건너뛰기 (continue)
        # TODO 2: counts[label] 1 증가
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    # TODO 3: 위쪽 36픽셀 띠를 어둡게 만들고 counts 를 'person 3  car 2 ...' 형태로 쓰기
    return out
`,
        hint: `<p><code>if label not in TARGETS: continue</code>, <code>counts[label] += 1</code>. 띠: <code>out[0:36] = (out[0:36] * 0.35).astype(np.uint8)</code>, 글자: <code>'  '.join('%s %d' % (k, v) for k, v in counts.items())</code> 를 <code>cv.putText</code> 로.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant',
    'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard',
    'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli',
    'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush']
TARGETS = ['person', 'bicycle', 'car', 'bus', 'truck']
COLORS = {'person': (0, 255, 0), 'bicycle': (255, 200, 0), 'car': (0, 165, 255), 'bus': (255, 0, 255), 'truck': (0, 0, 255)}
SIZE = 416
net = cv.dnn.readNetFromONNX('yolox_nano.onnx')
grids, strides = [], []
for s in (8, 16, 32):
    n = SIZE // s
    xv, yv = np.meshgrid(np.arange(n), np.arange(n))
    grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
    strides.append(np.full((n * n, 1), s))
GRIDS = np.concatenate(grids).astype(np.float32)
STRIDES = np.concatenate(strides).astype(np.float32)

def detect(img, conf_th=0.35):
    h, w = img.shape[:2]
    r = min(SIZE / h, SIZE / w)
    nh, nw = int(round(h * r)), int(round(w * r))
    pad = np.full((SIZE, SIZE, 3), 114, np.uint8)
    pad[:nh, :nw] = cv.resize(img, (nw, nh))
    net.setInput(cv.dnn.blobFromImage(pad))
    pred = net.forward()[0]
    xy = (pred[:, :2] + GRIDS) * STRIDES
    wh = np.exp(pred[:, 2:4]) * STRIDES
    scores = pred[:, 4:5] * pred[:, 5:]
    cls = scores.argmax(1)
    conf = scores[np.arange(len(cls)), cls]
    keep = conf >= conf_th
    boxes = np.concatenate([xy - wh / 2, wh], 1)[keep] / r
    cls, conf = cls[keep], conf[keep]
    if len(boxes) == 0:
        return []
    idx = np.array(cv.dnn.NMSBoxes(boxes.tolist(), conf.tolist(), conf_th, 0.45)).ravel()
    return [(CLASSES[cls[i]], float(conf[i]), boxes[i].astype(int)) for i in idx]

def process(frame):
    out = frame.copy()
    counts = {t: 0 for t in TARGETS}
    for label, score, (x, y, w, h) in detect(frame):
        if label not in TARGETS:
            continue
        counts[label] += 1
        cv.rectangle(out, (x, y), (x + w, y + h), COLORS[label], 2)
        cv.putText(out, '%s %.0f%%' % (label, score * 100), (x, max(48, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[label], 2)
    out[0:36] = (out[0:36] * 0.35).astype(np.uint8)
    text = '  '.join('%s %d' % (k, v) for k, v in counts.items())
    cv.putText(out, text, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
    return out
`,
      },
      {
        title: '실습 2 · 랜드마크로 기울어진 얼굴 바로 세우기',
        desc: `<p>YuNet 이 찾은 <b>두 눈의 좌표</b>로 얼굴이 몇 도 기울었는지 계산하고, 두 눈의 가운데를 중심으로 <b>반대로 회전</b>해 눈이 수평이 되게 만든 뒤 얼굴 부분을 잘라 150×150 으로 보여 주세요. (<code>lena.jpg</code> — 머리가 살짝 기울어 있습니다.)
얼굴 인식 시스템이 비교 전에 하는 <b>얼굴 정렬(alignment)</b> 단계입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('lena.jpg')
h, w = img.shape[:2]
detector = cv.FaceDetectorYN.create('face_detection_yunet_2023mar.onnx', '', (w, h), 0.6, 0.3, 5000)
_, faces = detector.detect(img)
if faces is None:
    print('얼굴을 찾지 못했습니다')
else:
    f = faces[0]
    x, y, fw, fh = f[:4]
    rx, ry, lx, ly = f[4:8]                  # 오른눈(사진 왼쪽) · 왼눈(사진 오른쪽)
    # TODO 1: 두 눈을 이은 선의 각도(도) 구하기: np.degrees(np.arctan2(ly - ry, lx - rx))
    angle = 0.0
    center = (float((rx + lx) / 2), float((ry + ly) / 2))
    # TODO 2: cv.getRotationMatrix2D(center, angle, 1.0) 로 회전 행렬을 만들고 warpAffine 으로 이미지 회전
    rotated = img.copy()
    # 얼굴 영역 자르기 (회전 중심 주변)
    size = int(max(fw, fh) * 1.1)
    cx, cy = int(center[0]), int(center[1] + fh * 0.15)
    crop = rotated[max(0, cy - size // 2):cy + size // 2, max(0, cx - size // 2):cx + size // 2]
    print('기울기 %.1f도' % angle)
    vis = img.copy()
    cv.line(vis, (int(rx), int(ry)), (int(lx), int(ly)), (0, 255, 0), 2)
    cv.imshow('input', vis)
    cv.imshow('aligned face', cv.resize(crop, (150, 150)))
`,
        hint: `<p><code>M = cv.getRotationMatrix2D(center, angle, 1.0)</code>, <code>rotated = cv.warpAffine(img, M, (w, h))</code>. getRotationMatrix2D 는 <b>양수 각도 = 반시계 방향</b> 회전입니다. 눈 선이 오른쪽 아래로 내려가 있으면(angle &gt; 0) angle 만큼 반시계로 돌리면 수평이 됩니다. 결과가 반대로 기울면 부호를 바꿔 확인해 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('lena.jpg')
h, w = img.shape[:2]
detector = cv.FaceDetectorYN.create('face_detection_yunet_2023mar.onnx', '', (w, h), 0.6, 0.3, 5000)
_, faces = detector.detect(img)
if faces is None:
    print('얼굴을 찾지 못했습니다')
else:
    f = faces[0]
    x, y, fw, fh = f[:4]
    rx, ry, lx, ly = f[4:8]                  # 오른눈(사진 왼쪽) · 왼눈(사진 오른쪽)
    angle = float(np.degrees(np.arctan2(ly - ry, lx - rx)))
    center = (float((rx + lx) / 2), float((ry + ly) / 2))
    M = cv.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv.warpAffine(img, M, (w, h), flags=cv.INTER_LINEAR, borderMode=cv.BORDER_REPLICATE)

    # 회전 후 눈 좌표로 수평이 되었는지 확인
    eyes = np.array([[rx, ry, 1], [lx, ly, 1]], np.float32)
    new_eyes = eyes @ M.T
    print('기울기 %.1f도 → 회전 후 두 눈의 y 차이 %.2f 픽셀' % (angle, new_eyes[1, 1] - new_eyes[0, 1]))

    size = int(max(fw, fh) * 1.1)
    cx, cy = int(center[0]), int(center[1] + fh * 0.15)
    crop = rotated[max(0, cy - size // 2):cy + size // 2, max(0, cx - size // 2):cx + size // 2]
    vis = img.copy()
    cv.line(vis, (int(rx), int(ry)), (int(lx), int(ly)), (0, 255, 0), 2)
    cv.imshow('input', vis)
    cv.imshow('aligned face', cv.resize(crop, (150, 150)))
`,
      },
    ],
    quiz: [
      { q: 'Haar · HOG 검출기와 비교한 딥러닝(CNN) 검출기의 가장 근본적인 차이는?', options: ['흑백 이미지만 사용한다', 'NMS 가 필요 없다', '슬라이딩 윈도우를 수만 번 옮긴다', '특징을 만드는 필터까지 데이터로 학습한다'], answer: 3, explain: 'Haar · HOG 는 사람이 특징을 설계하고 분류기만 학습하지만, CNN 은 특징 추출 필터까지 학습해 변화에 강합니다.' },
      { q: 'cv.dnn.blobFromImage 가 돌려주는 배열의 차원 순서는?', options: ['(H, W, C)', '(N, C, H, W)', '(C, H, W, N)', '(W, H, C)'], answer: 1, explain: '신경망 입력은 배치 수 N, 채널 C, 높이 H, 너비 W 순서입니다. OpenCV 이미지 (H, W, C) 와 다릅니다.' },
      { q: 'YOLOX 출력에서 한 칸의 최종 점수(score)를 구하는 방법으로 알맞은 것은?', options: ['물체일 확률 + 클래스 확률', '상자 폭 × 높이', '물체일 확률 × 클래스 확률', 'exp(클래스 확률)'], answer: 2, explain: '“물체가 있을 확률”과 “그 물체가 이 클래스일 확률”을 곱해 클래스별 점수를 만들고, 가장 큰 클래스를 고릅니다.' },
      { q: 'cv.FaceDetectorYN 의 detect 결과에서 한 얼굴이 15개 값을 갖습니다. 여기에 포함되지 않는 것은?', options: ['얼굴의 나이 추정값', '얼굴 상자 x, y, w, h', '두 눈 · 코 · 두 입꼬리 좌표', '검출 점수'], answer: 0, explain: '4(상자) + 10(랜드마크 5개 × 2) + 1(점수) = 15 입니다. 나이 같은 속성은 별도 모델이 필요합니다.' },
      { q: '브라우저 CPU 에서 실시간 보행자 수를 세야 하고 정확도도 중요합니다. 이번 주 배운 내용에 비추어 가장 알맞은 선택은?', options: ['Haar 전신 캐스케이드를 minNeighbors=0 으로', 'HOG 를 전체 프레임 2배 확대로', 'K-Means 로 사람 색 군집화', 'YOLOX-nano 로 person 클래스만 세기 (필요하면 프레임 건너뛰기)'], answer: 3, explain: 'YOLOX-nano 는 가벼운 딥러닝 모델로 정확도와 속도의 균형이 좋습니다. 브라우저에서 0.4초/프레임이면 몇 프레임마다 검출하는 방식으로 실시간성을 보완할 수 있습니다.' },
    ],
  },
]);
