/* 2주차: Image Processing Ⅰ — 색 공간 · 기하 변환 · 임계처리 · 스무딩 */
COURSE.addLessons([
  // =====================================================================
  // w2-1 색 공간 변환
  // =====================================================================
  {
    id: 'w2-1',
    summary: '같은 색도 BGR, GRAY, HSV 등 여러 “숫자 표현”으로 나타낼 수 있습니다. cv.cvtColor()로 색 공간을 바꾸고, HSV의 H·S·V 채널이 각각 무엇을 뜻하는지 눈으로 확인합니다.',
    goals: [
      '색 공간(Color Space)이 무엇이며 왜 여러 종류가 필요한지 설명할 수 있다',
      'cv.cvtColor()와 COLOR_ 플래그로 BGR ↔ GRAY ↔ HSV 변환을 할 수 있다',
      'OpenCV의 HSV 값 범위(H 0~179, S·V 0~255)를 알고 다른 프로그램 값과 환산할 수 있다',
      'H·S·V 채널을 따로 표시해 이미지의 색 정보를 해석할 수 있다',
    ],
    schedule: [['도입 · 1주차 복습', 5], ['색 공간 개념 · HSV', 12], ['cvtColor 예제 실습', 13], ['실습 과제', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 색 공간(Color Space)이란?</h3>
<p>컴퓨터는 색을 <b>숫자 몇 개의 조합</b>으로 저장합니다. 그런데 “어떤 숫자들로 색을 표현할지”에는 여러 방법이 있고, 이 방법 하나하나를 <b>색 공간(Color Space)</b>이라고 합니다.
같은 주황색이라도 BGR로는 <code>(0, 128, 255)</code>, HSV로는 <code>(15, 255, 255)</code>처럼 전혀 다른 숫자로 적힙니다. 색은 같고 <em>표기법</em>만 다른 것이죠.</p>
<ul>
<li><b>BGR</b> : 파랑·초록·빨강 빛의 세기. OpenCV가 이미지를 읽으면 기본으로 이 순서입니다(1주차에서 matplotlib로 보여줄 때 RGB로 바꿔야 했던 이유!).</li>
<li><b>GRAY(흑백)</b> : 밝기 한 가지 값만 저장. 채널이 1개라 계산이 빠르고, 임계처리·엣지 검출 같은 많은 알고리즘의 입력으로 씁니다.</li>
<li><b>HSV</b> : 색상(Hue), 채도(Saturation), 명도(Value)로 나눠 표현. 사람이 색을 말하는 방식(“진한 파란색”, “어두운 빨강”)과 비슷합니다.</li>
</ul>
<p><b>왜 HSV가 필요할까요?</b> 파란 컵에 그늘이 지면 BGR의 B, G, R 세 값이 <em>모두</em> 함께 줄어듭니다. 그래서 BGR 숫자만으로 “파란색인가?”를 판단하기가 어렵습니다.
HSV에서는 그늘이 져도 주로 <b>V(밝기)</b>만 줄고 <b>H(색상)</b>는 거의 그대로입니다. 그래서 다음 교시의 <b>색상 기반 물체 추적</b>에서 HSV를 사용합니다.</p>` },
      { type: 'table', head: ['색 공간', '채널', 'OpenCV 8비트 값 범위', '주로 쓰는 곳'], rows: [
        ['BGR', 'B, G, R (3)', '각 0~255', 'imread 기본, 화면 표시'],
        ['RGB', 'R, G, B (3)', '각 0~255', 'matplotlib, 웹, 대부분의 다른 라이브러리'],
        ['GRAY', '밝기 (1)', '0~255', '임계처리, 엣지, 컨투어 등 구조 분석'],
        ['HSV', 'H, S, V (3)', 'H 0~179, S 0~255, V 0~255', '색으로 물체 찾기, 채도·밝기 보정'],
      ] },
      { type: 'text', html: `<h3>2. cv.cvtColor()로 색 공간 바꾸기</h3>
<p>색 공간 변환은 함수 하나면 됩니다.</p>
<pre>dst = cv.cvtColor(src, code)</pre>
<ul>
<li><code>src</code> : 입력 이미지</li>
<li><code>code</code> : 어떤 변환인지 알려주는 플래그. 이름이 <code>COLOR_원래공간2바꿀공간</code> 규칙입니다. 예) <code>cv.COLOR_BGR2GRAY</code>, <code>cv.COLOR_BGR2HSV</code>, <code>cv.COLOR_HSV2BGR</code></li>
</ul>
<p>OpenCV에는 (별칭까지 합쳐) 수백 개의 변환 플래그가 있습니다. 공식 튜토리얼처럼 <code>dir(cv)</code>로 목록을 직접 뽑아 볼 수 있습니다.</p>` },
      { type: 'code', title: '예제 1 · 사용할 수 있는 COLOR_ 플래그 목록 보기', code: String.raw`
import cv2 as cv

# cv 모듈 안의 이름 중 'COLOR_' 로 시작하는 것만 모으기 (튜토리얼 코드)
flags = [i for i in dir(cv) if i.startswith('COLOR_')]
print('플래그 개수:', len(flags))
print('앞의 10개:', flags[:10])

# 그중 BGR 에서 출발하는 변환만 골라 보기
bgr_flags = [f for f in flags if f.startswith('COLOR_BGR2')]
print('BGR2… 플래그:', bgr_flags)

# 플래그의 정체는 그냥 정수 번호입니다
print('COLOR_BGR2GRAY =', cv.COLOR_BGR2GRAY, ', COLOR_BGR2HSV =', cv.COLOR_BGR2HSV)
`, desc: '<p>플래그는 사실 정수 상수입니다. 외울 필요는 없고, <code>BGR2GRAY</code>, <code>BGR2HSV</code>, <code>HSV2BGR</code>, <code>BGR2RGB</code> 네 가지만 기억하면 이번 강좌 대부분을 해결할 수 있습니다.</p>' },
      { type: 'code', title: '예제 2 · BGR → GRAY, BGR → HSV 변환', code: String.raw`
import cv2 as cv

img = cv.imread('fruits.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

print('BGR  shape:', img.shape, img.dtype)
print('GRAY shape:', gray.shape)          # 채널 차원이 사라짐 (h, w)
print('HSV  shape:', hsv.shape)
print('(100, 100) 픽셀  BGR =', img[100, 100], '→ HSV =', hsv[100, 100])

cv.imshow('BGR', img)
cv.imshow('GRAY', gray)
cv.imshow('HSV (as if BGR)', hsv)   # HSV 숫자를 BGR로 착각해 보여주므로 색이 이상하게 보임
cv.waitKey(0)
cv.destroyAllWindows()
`, desc: '<p>세 번째 창의 색이 이상한 것은 정상입니다. <code>cv.imshow()</code>는 받은 숫자를 <b>무조건 BGR로 해석</b>하기 때문입니다. HSV 이미지는 채널을 나눠 보거나, 다시 <code>COLOR_HSV2BGR</code>로 돌려서 보여줘야 합니다. 창 위에 마우스를 올려 같은 위치의 픽셀값이 어떻게 다른지 비교해 보세요.</p>' },
      { type: 'text', html: `<h3>3. HSV 제대로 이해하기</h3>
<p><b>H(Hue, 색상)</b>는 “무슨 색이냐”를 <b>색상환의 각도</b>로 나타냅니다. 원래 0°~360°인데, 8비트(uint8)에는 255까지만 들어가므로 OpenCV는 <b>각도를 2로 나눠서 0~179</b>로 저장합니다.
색상환은 원이라서 H=179 바로 다음이 다시 H=0(빨강)입니다. 즉 <b>빨강은 양 끝(0 근처와 179 근처)에 걸쳐</b> 있습니다.</p>
<p><b>S(Saturation, 채도)</b>는 “얼마나 선명한가”입니다. 0이면 회색·흰색 같은 무채색, 255면 물감을 짜 놓은 듯한 원색입니다.<br>
<b>V(Value, 명도)</b>는 “얼마나 밝은가”입니다. 0이면 검정, 255면 그 색의 가장 밝은 상태입니다.</p>` },
      { type: 'table', head: ['색', '일반 색상환 각도', 'OpenCV H 값 (각도 ÷ 2)'], rows: [
        ['빨강', '0° (= 360°)', '0 (= 180 → 다시 0)'],
        ['주황', '30°', '15'],
        ['노랑', '60°', '30'],
        ['초록', '120°', '60'],
        ['청록(시안)', '180°', '90'],
        ['파랑', '240°', '120'],
        ['자주(마젠타)', '300°', '150'],
      ] },
      { type: 'warn', html: `<p><b>HSV 값 범위는 프로그램마다 다릅니다!</b> 그림판·포토샵·GIMP 같은 프로그램은 보통 H 0~360, S·V 0~100(%)을 씁니다. 이 값을 그대로 OpenCV에 넣으면 엉뚱한 색이 잡힙니다.</p>
<p>환산 방법: <code>H_opencv = H ÷ 2</code>, <code>S_opencv = S% × 255 ÷ 100</code>, <code>V_opencv = V% × 255 ÷ 100</code><br>
예) 포토샵의 (H 240, S 50%, V 80%) → OpenCV의 (120, 128, 204)</p>` },
      { type: 'code', title: '예제 3 · HSV 색상표 만들어 보기', code: String.raw`
import cv2 as cv
import numpy as np

# 가로축: H(0~179), 세로축: S(위 255 → 아래 0), V 는 255 고정인 HSV 이미지 만들기
H, S = np.meshgrid(np.arange(180), np.arange(255, -1, -1))   # 256 × 180 크기의 좌표 격자
hsv = np.zeros((256, 180, 3), np.uint8)
hsv[:, :, 0] = H
hsv[:, :, 1] = S
hsv[:, :, 2] = 255

# 좁으니까 가로로 4배 늘리기 (각 열을 4번 반복)
hsv = np.repeat(hsv, 4, axis=1)

bgr = cv.cvtColor(hsv, cv.COLOR_HSV2BGR)   # 보여주려면 다시 BGR 로!
for h in range(0, 180, 30):
    x = h * 4
    cv.line(bgr, (x, 0), (x, 20), (0, 0, 0), 2)
    cv.putText(bgr, str(h), (x + 3, 18), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

print('HSV (120, 255, 255) =', cv.cvtColor(np.uint8([[[120, 255, 255]]]), cv.COLOR_HSV2BGR), '(BGR)')
cv.imshow('HSV chart: H ->, S down', bgr)
`, desc: '<p>왼쪽→오른쪽으로 H가 0→179로 변하며 빨강→노랑→초록→파랑→자주→빨강으로 한 바퀴 돕니다. 아래로 갈수록 S가 줄어 흰색에 가까워집니다. 창에 마우스를 올려 BGR 값을 확인하고, 위 표의 H 값과 맞는지 확인해 보세요.</p>' },
      { type: 'code', title: '예제 4 · H, S, V 채널을 따로 보기', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('fruits.jpg')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
h, s, v = cv.split(hsv)          # 1주차에 배운 채널 분리

cv.imshow('H (hue)', h)
cv.imshow('S (saturation)', s)
cv.imshow('V (value)', v)

# matplotlib 로 한 번에 비교 (원본은 RGB 로 바꿔서!)
titles = ['Original', 'Hue', 'Saturation', 'Value']
images = [cv.cvtColor(img, cv.COLOR_BGR2RGB), h, s, v]
plt.figure(figsize=(10, 8))
for i in range(4):
    plt.subplot(2, 2, i + 1)
    if i == 0:
        plt.imshow(images[i])
    else:
        plt.imshow(images[i], cmap='gray', vmin=0, vmax=255)
    plt.title(titles[i])
    plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p><b>S 채널</b>에서는 껍질처럼 선명한 부분이 밝고, 과육 가운데의 흰 부분이나 빛이 반사된 곳은 어둡게 나옵니다. <b>H 채널</b>에서 주황·노랑 과일은 H가 작아(약 10~30) 어둡고, 위쪽의 자주색 채소는 H가 150~179라 밝게 나옵니다. 빨강~자주 계열은 H의 양 끝(0 근처와 179 근처)에 걸쳐 있어 어두운 점과 밝은 점이 섞여 보이기도 합니다.</p>' },
      { type: 'code', title: '예제 5 · home.jpg 와 fruits.jpg 의 채널 비교', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

def channel_rows(fname):
    """[원본, B, G, R] 과 [GRAY, H, S, V] 두 줄의 (이미지, 제목) 목록을 만든다"""
    img = cv.imread(fname)
    b, g, r = cv.split(img)
    h, s, v = cv.split(cv.cvtColor(img, cv.COLOR_BGR2HSV))
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return [(cv.cvtColor(img, cv.COLOR_BGR2RGB), fname), (b, 'B'), (g, 'G'), (r, 'R'),
            (gray, 'GRAY'), (h, 'H'), (s, 'S'), (v, 'V')]

items = channel_rows('home.jpg') + channel_rows('fruits.jpg')
plt.figure(figsize=(12, 11))
for i, (im, title) in enumerate(items):
    plt.subplot(4, 4, i + 1)
    plt.imshow(im, cmap=None if im.ndim == 3 else 'gray', vmin=0, vmax=255)
    plt.title(title)
    plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>관찰 포인트: ① home.jpg의 파란 <b>하늘</b>은 B 채널에서 밝고 R 채널에서 어둡습니다. 반면 흰 <b>구름</b>은 B·G·R 모두 밝고 S 채널에서만 어둡게 드러납니다. ② <b>GRAY와 V</b>는 비슷해 보이지만 같지 않습니다(GRAY는 R·G·B의 가중 평균, V는 셋 중 최댓값). ③ 색으로 물체를 구분하고 싶을 때 어느 채널이 “물체만 튀어 보이는지” 찾는 것이 영상처리의 첫걸음입니다.</p>' },
      { type: 'text', html: `<h3>4. 웹캠으로 HSV 채널 실시간 보기</h3>
<p>1주차에 배운 <code>def process(frame):</code> 패턴을 쓰면 웹캠 프레임마다 HSV 채널을 볼 수 있습니다. 오른쪽 패널에서 입력 소스를 <b>📷 웹캠</b>으로 바꾸세요(웹캠이 없으면 <b>🎞️ 동영상</b>(예: vtest.mp4)이나 이미지를 입력으로 골라도 됩니다).
여러 색의 물건을 카메라에 비춰 보고, 조명을 가리거나 켜면서 <b>H는 잘 안 변하고 V가 크게 변하는지</b> 확인해 보세요.</p>` },
      { type: 'code', title: '예제 6 · 웹캠 HSV 채널 뷰어 (process)', code: String.raw`
import cv2 as cv
import numpy as np

def process(frame):
    small = cv.resize(frame, (320, 240))            # 절반 크기로 줄여 빠르게 (resize 는 3교시에 자세히)
    h, s, v = cv.split(cv.cvtColor(small, cv.COLOR_BGR2HSV))
    strip = np.hstack([h, s, v])                     # 세 채널을 가로로 이어 붙이기 → 960×240 흑백
    strip = cv.cvtColor(strip, cv.COLOR_GRAY2BGR)    # 컬러 글씨를 쓰려고 3채널로 변환
    for i, name in enumerate(['H', 'S', 'V']):
        cv.putText(strip, name, (10 + 320 * i, 35), cv.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 2)
    return small, strip                              # 여러 장을 튜플로 반환
`, desc: '<p>입력 소스를 바꾸면 <code>process()</code>가 자동으로 다시 호출됩니다. 흰 종이는 S가 거의 0(검게), 형광펜이나 색종이는 S가 높게(밝게) 나오는지 확인해 보세요.</p>' },
      { type: 'tip', html: `<p><b>흑백으로 읽는 두 가지 방법</b> : <code>cv.imread(파일, cv.IMREAD_GRAYSCALE)</code>로 처음부터 흑백으로 읽거나, 컬러로 읽은 뒤 <code>cv.cvtColor(img, cv.COLOR_BGR2GRAY)</code>로 바꿀 수 있습니다. 이미 컬러 이미지를 갖고 있다면(웹캠 프레임 등) 두 번째 방법을 씁니다.
또, 흑백 이미지(2차원)에 컬러 선·글자를 그리고 싶다면 <code>COLOR_GRAY2BGR</code>로 3채널로 만든 뒤 그리세요.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 채도(S)만 올려 사진을 선명하게',
        desc: `<p><code>home.jpg</code>를 HSV로 바꾼 뒤 <b>S 채널에만 60을 더해</b> 색이 더 선명한 사진을 만드세요. 원본과 결과를 나란히 보여줍니다.
H와 V는 그대로 두어야 색상과 밝기는 유지되고 “진하기”만 바뀝니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('home.jpg')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
h, s, v = cv.split(hsv)

# TODO: s 채널에 60 을 더하세요 (255 를 넘으면 255 로 고정되도록 cv.add 사용)
s2 = s

result = cv.cvtColor(cv.merge([h, s2, v]), cv.COLOR_HSV2BGR)
cv.imshow('original | vivid', np.hstack([img, result]))
print('S 평균: 전', s.mean().round(1), '→ 후', s2.mean().round(1))
`,
        hint: `<p><code>s + 60</code>처럼 numpy 덧셈을 하면 250+60=310이 uint8에서 54로 <b>넘쳐 돌아갑니다(overflow)</b>. 1주차에 배운 <code>cv.add(s, 60)</code>은 255에서 멈추는(saturation) 덧셈이라 안전합니다. 결과는 반드시 <code>COLOR_HSV2BGR</code>로 되돌려서 표시하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('home.jpg')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
h, s, v = cv.split(hsv)

s2 = cv.add(s, 60)          # 포화 덧셈: 255 를 넘지 않음

result = cv.cvtColor(cv.merge([h, s2, v]), cv.COLOR_HSV2BGR)
cv.imshow('original | vivid', np.hstack([img, result]))
print('S 평균: 전', s.mean().round(1), '→ 후', s2.mean().round(1))
`,
      },
      {
        title: '실습 2 · 색상(H) 돌리기',
        desc: `<p><code>fruits.jpg</code>의 모든 픽셀의 H 값에 <code>shift</code>(예: 60)를 더해 과일 색을 바꿔 보세요. H는 원형(0~179)이므로 180을 넘으면 <b>다시 0부터</b> 이어져야 합니다.
shift를 30, 60, 90으로 바꿔 빨간 과일이 어떤 색으로 변하는지 관찰하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('fruits.jpg')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
h, s, v = cv.split(hsv)
shift = 60

# TODO: h 에 shift 를 더하고 180 으로 나눈 나머지를 구해 uint8 로 되돌리세요
h2 = h

out = cv.cvtColor(cv.merge([h2, s, v]), cv.COLOR_HSV2BGR)
cv.imshow('hue shift', np.hstack([img, out]))
`,
        hint: `<p>uint8끼리 더하면 255에서 넘치므로, 먼저 <code>h.astype(np.int32)</code>로 큰 정수형으로 바꿔서 <code>(h + shift) % 180</code>을 계산한 뒤 <code>.astype(np.uint8)</code>로 되돌립니다. cv.merge는 세 채널의 dtype이 같아야 합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('fruits.jpg')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
h, s, v = cv.split(hsv)
shift = 60

h2 = ((h.astype(np.int32) + shift) % 180).astype(np.uint8)   # 원형이므로 % 180

out = cv.cvtColor(cv.merge([h2, s, v]), cv.COLOR_HSV2BGR)
cv.imshow('hue shift', np.hstack([img, out]))
`,
      },
      {
        title: '실습 3 · GRAY 변환 공식 직접 확인하기',
        desc: `<p>OpenCV의 BGR→GRAY 변환은 <code>Y = 0.299·R + 0.587·G + 0.114·B</code> 공식을 씁니다(사람 눈이 초록에 가장 민감하기 때문).
numpy로 이 공식을 직접 계산해서 <code>cv.cvtColor</code> 결과와 <b>최대 차이가 1 이하</b>인지 확인하세요. 비교용으로 단순 평균 (B+G+R)/3 과의 차이도 출력합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('lena.jpg')
gray_cv = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
b, g, r = [c.astype(np.float32) for c in cv.split(img)]   # 계산을 위해 실수형으로

# TODO: 가중치 공식으로 gray_my 를 계산하세요 (지금은 단순 평균)
gray_my = (b + g + r) / 3
gray_my = np.round(gray_my).astype(np.uint8)

avg = np.round((b + g + r) / 3).astype(np.uint8)
diff = np.abs(gray_cv.astype(int) - gray_my.astype(int))
print('cvtColor 와 내 공식의 최대 차이:', diff.max())
print('cvtColor 와 단순 평균의 최대 차이:', np.abs(gray_cv.astype(int) - avg.astype(int)).max())
cv.imshow('cv | mine', np.hstack([gray_cv, gray_my]))
`,
        hint: `<p><code>gray_my = 0.299 * r + 0.587 * g + 0.114 * b</code>. 반올림 방식 차이로 1 정도 차이는 날 수 있습니다. 채널 순서가 B, G, R인 것을 잊지 마세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('lena.jpg')
gray_cv = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
b, g, r = [c.astype(np.float32) for c in cv.split(img)]

gray_my = 0.299 * r + 0.587 * g + 0.114 * b      # 사람 눈 감도를 반영한 가중 평균
gray_my = np.round(gray_my).astype(np.uint8)

avg = np.round((b + g + r) / 3).astype(np.uint8)
diff = np.abs(gray_cv.astype(int) - gray_my.astype(int))
print('cvtColor 와 내 공식의 최대 차이:', diff.max())
print('cvtColor 와 단순 평균의 최대 차이:', np.abs(gray_cv.astype(int) - avg.astype(int)).max())
cv.imshow('cv | mine', np.hstack([gray_cv, gray_my]))
`,
      },
    ],
    quiz: [
      { q: 'OpenCV에서 8비트 HSV 이미지의 H(색상) 값 범위는?', options: ['0 ~ 360', '0 ~ 255', '0 ~ 179', '0 ~ 100'], answer: 2, explain: '360°를 uint8(최대 255)에 담기 위해 2로 나눠 0~179로 저장합니다. S와 V는 0~255입니다.' },
      { q: 'BGR 이미지 img를 HSV로 바꾸는 올바른 코드는?', options: ['cv.cvtColor(img, cv.COLOR_HSV2BGR)', 'cv.cvtColor(img, cv.COLOR_BGR2HSV)', 'cv.imread(img, cv.COLOR_BGR2HSV)', 'cv.split(img, cv.COLOR_BGR2HSV)'], answer: 1, explain: '플래그 이름은 “원래공간2바꿀공간” 규칙입니다. BGR에서 HSV로 가므로 COLOR_BGR2HSV입니다.' },
      { q: '포토샵에서 고른 색이 H=120°, S=100%, V=100%일 때 OpenCV HSV 값은?', options: ['(120, 100, 100)', '(60, 255, 255)', '(240, 255, 255)', '(60, 100, 100)'], answer: 1, explain: 'H는 2로 나누고(120→60), S·V는 %를 0~255로 환산합니다(100%→255). H=60은 초록입니다.' },
      { q: '색으로 물체를 찾을 때 BGR보다 HSV가 유리한 가장 큰 이유는?', options: ['HSV가 채널 수가 더 적어서', 'HSV는 항상 더 밝게 보여서', '조명(밝기) 변화가 주로 V에만 영향을 주고 H는 비교적 안정적이어서', 'imshow가 HSV를 바로 보여줄 수 있어서'], answer: 2, explain: 'BGR은 그늘이 지면 세 값이 모두 변하지만, HSV에서는 색상(H)과 밝기(V)가 분리되어 있어 “무슨 색인지”를 조명과 비교적 독립적으로 판단할 수 있습니다.' },
      { q: 'cv.cvtColor(img, cv.COLOR_BGR2GRAY)의 결과 shape는? (img.shape = (480, 640, 3))', options: ['(480, 640, 3)', '(640, 480)', '(480, 640)', '(480, 640, 1)'], answer: 2, explain: '흑백 이미지는 채널 차원이 없는 2차원 배열 (높이, 너비)입니다.' },
    ],
  },
  // =====================================================================
  // w2-2 색상 기반 객체 추적
  // =====================================================================
  {
    id: 'w2-2',
    summary: 'HSV 색 공간에서 원하는 색의 범위를 정하고 cv.inRange()로 마스크를 만들어, 특정 색 물체만 골라내고 추적합니다. 트랙바로 HSV 범위를 직접 찾아 보고 여러 색을 동시에 추적합니다.',
    goals: [
      'cv.inRange()로 HSV 범위 마스크를 만들고 cv.bitwise_and()로 해당 색 영역만 추출할 수 있다',
      '추적하고 싶은 색의 HSV 값을 계산하거나 측정해 적절한 lower/upper 범위를 정할 수 있다',
      '트랙바 6개로 HSV 범위를 실시간 조절하는 튜너를 만들 수 있다',
      '빨강처럼 H 양 끝에 걸친 색과 여러 색을 마스크 합치기로 추적할 수 있다',
    ],
    schedule: [['도입 · HSV 복습', 5], ['inRange · 마스크 원리', 10], ['추적 예제 · HSV 튜너', 15], ['실습 과제', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 색으로 물체 찾기: 딱 3단계</h3>
<p>공식 튜토리얼의 “파란 물체 추적”은 다음 세 단계로 이루어집니다.</p>
<ol>
<li><b>BGR → HSV 변환</b> : 조명에 덜 민감한 H(색상)로 판단하기 위해</li>
<li><b>마스크(mask) 만들기</b> : <code>cv.inRange(hsv, lower, upper)</code> — 픽셀의 H, S, V가 <b>모두</b> 범위 안에 있으면 255(흰색), 하나라도 벗어나면 0(검정)인 흑백 이미지</li>
<li><b>원본에 마스크 씌우기</b> : <code>cv.bitwise_and(frame, frame, mask=mask)</code> — 마스크가 흰 곳의 픽셀만 남기고 나머지는 검정으로</li>
</ol>
<p>마스크는 “이 픽셀이 내가 찾는 색인가? 예(255)/아니오(0)”를 적어 둔 <b>정답표</b>라고 생각하면 됩니다. 1주차에 로고를 합성할 때 쓴 마스크와 같은 개념입니다.</p>` },
      { type: 'table', head: ['함수', '설명', '비고'], rows: [
        ['<code>cv.inRange(src, lowerb, upperb)</code>', 'lowerb ≤ 픽셀 ≤ upperb 이면 255, 아니면 0 인 마스크(uint8, 1채널) 반환', '경계값 포함. 채널마다 모두 만족해야 255'],
        ['<code>cv.bitwise_and(src1, src2, mask=m)</code>', 'src1 AND src2 를 계산하되 mask 가 0인 곳은 0', '같은 이미지를 두 번 넣으면 “마스크 부분만 남기기”'],
        ['<code>np.array([h, s, v])</code>', '범위 경계를 배열로 표현', '튜플 <code>(h, s, v)</code> 로 써도 됨'],
        ['<code>cv.countNonZero(mask)</code>', '마스크에서 0이 아닌 픽셀 수', '물체가 얼마나 보이는지 수치로 확인'],
      ] },
      { type: 'code', title: '튜토리얼 원본 · 파란 물체 추적 (데스크톱용 while 루프)', norun: true, code: String.raw`
import cv2 as cv
import numpy as np

cap = cv.VideoCapture(0)
while(1):
    # 프레임 하나 읽기
    _, frame = cap.read()
    # BGR 을 HSV 로 변환
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    # HSV 에서 파란색 범위 정하기
    lower_blue = np.array([110, 50, 50])
    upper_blue = np.array([130, 255, 255])
    # 파란색만 남기는 마스크
    mask = cv.inRange(hsv, lower_blue, upper_blue)
    # 원본에 마스크 적용
    res = cv.bitwise_and(frame, frame, mask=mask)
    cv.imshow('frame', frame)
    cv.imshow('mask', mask)
    cv.imshow('res', res)
    k = cv.waitKey(5) & 0xFF
    if k == 27:
        break
cv.destroyAllWindows()
`, desc: '<p>웹 실습 환경에서는 <code>while</code> 루프를 쓸 수 없습니다. 루프 안의 “한 프레임 처리” 부분만 떼어 <code>process(frame)</code> 함수로 만들면 됩니다(아래 예제).</p>' },
      { type: 'code', title: '예제 1 · 파란 물체 추적 (웹용 process 버전)', code: String.raw`
import cv2 as cv
import numpy as np

# 파란색 범위 (튜토리얼은 H 110~130. 실제 파란 물체는 100 근처도 많아 조금 넓혔습니다)
lower_blue = np.array([100, 50, 50])
upper_blue = np.array([130, 255, 255])

def process(frame):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)          # 1) HSV 로 변환
    mask = cv.inRange(hsv, lower_blue, upper_blue)       # 2) 파란색이면 255
    res = cv.bitwise_and(frame, frame, mask=mask)        # 3) 파란 부분만 남기기
    return frame, mask, res                              # 세 장을 한 번에 표시
`, desc: '<p>오른쪽 패널에서 입력을 <b>smarties.png</b>로 고르면 파란 캔디만 남고, <b>📷 웹캠</b>으로 바꾸면 파란 물건(펜, 병뚜껑, 옷 등)을 실시간으로 추적합니다. 웹캠이 없으면 <b>🎞️ 동영상</b>(vtest.mp4 등)을 골라도 매 프레임 처리되는 모습을 확인할 수 있습니다. <code>process()</code> 밖에서 범위를 한 번만 만들어 두면 매 프레임 배열을 새로 만들지 않아도 됩니다.</p>' },
      { type: 'code', title: '예제 2 · 이미지에서 파란 캔디 골라내기 (튜토리얼 범위 vs 넓힌 범위)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

mask_tut = cv.inRange(hsv, np.array([110, 50, 50]), np.array([130, 255, 255]))   # 튜토리얼 값
mask_wide = cv.inRange(hsv, np.array([100, 50, 50]), np.array([130, 255, 255]))  # H 하한을 100 으로

print('파란 캔디 한 곳의 HSV:', hsv[80, 377])     # H 가 105 정도!
print('튜토리얼 범위 픽셀 수:', cv.countNonZero(mask_tut))
print('넓힌 범위 픽셀 수   :', cv.countNonZero(mask_wide))

cv.imshow('mask: H 110-130 | H 100-130', np.hstack([mask_tut, mask_wide]))
cv.imshow('result', cv.bitwise_and(img, img, mask=mask_wide))
`, desc: '<p>smarties.png의 파란 캔디는 H가 약 105라서 튜토리얼의 110~130 범위로는 절반 정도만 잡힙니다. <b>범위 값은 정답이 정해진 것이 아니라, 대상과 조명에 맞춰 직접 측정해 조정하는 값</b>이라는 점을 기억하세요.</p>' },
      { type: 'text', html: `<h3>2. 추적할 HSV 값은 어떻게 찾나요?</h3>
<p>튜토리얼에서 가장 많이 묻는 질문입니다. 방법은 두 가지입니다.</p>
<ul>
<li><b>방법 ① 계산하기</b> : 찾고 싶은 색의 BGR 값을 1×1 픽셀짜리 이미지로 만들어 <code>cv.cvtColor</code>에 넣습니다. 예를 들어 초록 <code>np.uint8([[[0, 255, 0]]])</code>을 변환하면 <code>[[[60 255 255]]]</code>가 나옵니다.
그다음 <b>[H−10, 100, 100] ~ [H+10, 255, 255]</b>를 범위로 잡는 것이 튜토리얼이 권하는 출발점입니다.</li>
<li><b>방법 ② 측정하기</b> : HSV로 변환한 이미지를 <code>cv.imshow</code>로 띄우고 물체 위에 마우스를 올리면 결과 창에 픽셀값이 표시됩니다. 물체의 밝은 곳·어두운 곳 여러 점을 재서 최솟값~최댓값을 범위로 잡습니다. 아래의 <b>트랙바 튜너</b>를 쓰면 더 편합니다.</li>
</ul>
<p>1×1 이미지를 만드는 이유: <code>cvtColor</code>는 “이미지”를 받는 함수라서 <code>[[[B, G, R]]]</code>처럼 (높이 1, 너비 1, 채널 3)인 3차원 배열이 필요하기 때문입니다.</p>` },
      { type: 'code', title: '예제 3 · BGR 색 → HSV 값과 추천 범위 계산', code: String.raw`
import cv2 as cv
import numpy as np

colors = {
    'green':  [0, 255, 0],
    'blue':   [255, 0, 0],
    'red':    [0, 0, 255],
    'yellow': [0, 255, 255],
    'orange': [0, 128, 255],
}

for name, bgr in colors.items():
    pixel = np.uint8([[bgr]])                       # 모양 (1, 1, 3) 인 1픽셀 이미지
    hsv = cv.cvtColor(pixel, cv.COLOR_BGR2HSV)
    h = int(hsv[0, 0, 0])
    lower = [max(h - 10, 0), 100, 100]
    upper = [min(h + 10, 179), 255, 255]
    print(f'{name:7s} BGR {bgr} -> HSV {hsv[0, 0]}  추천 범위 {lower} ~ {upper}')
`, desc: '<p>빨강의 추천 범위를 보세요. H=0이라 <code>h − 10</code>이 음수가 되어 0으로 잘렸습니다. 하지만 실제 빨강은 170~179 쪽에도 있습니다. 이 문제는 아래 주의 상자에서 해결합니다.</p>' },
      { type: 'warn', html: `<p><b>① 빨강은 범위가 두 개!</b> H는 원형이라 빨강이 0 근처와 179 근처에 나뉘어 있습니다. <code>inRange</code>를 두 번 하고 <code>cv.bitwise_or(mask1, mask2)</code>로 합치세요.</p>
<p><b>② S·V 하한을 0으로 두지 마세요.</b> 흰 벽, 검은 그림자, 회색 배경은 S나 V가 매우 낮아서 H 값이 사실상 “아무 값”입니다. S·V 하한을 50~100 정도로 올려야 무채색 배경이 잡히지 않습니다.</p>
<p><b>③ 하한 &gt; 상한</b>이면 아무것도 잡히지 않습니다(트랙바 조절 중 흔한 실수).</p>` },
      { type: 'code', title: '예제 4 · 트랙바 HSV 범위 튜너', code: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

# 조절용 창과 트랙바 6개 (기본값: 파란색)
cv.namedWindow('controls')
cv.createTrackbar('H min', 'controls', 100, 179, nothing)
cv.createTrackbar('H max', 'controls', 130, 179, nothing)
cv.createTrackbar('S min', 'controls', 100, 255, nothing)
cv.createTrackbar('S max', 'controls', 255, 255, nothing)
cv.createTrackbar('V min', 'controls', 70, 255, nothing)
cv.createTrackbar('V max', 'controls', 255, 255, nothing)

def process(frame):
    # 트랙바 값은 process 안에서 읽어야 움직일 때마다 반영됩니다
    lower = np.array([cv.getTrackbarPos('H min', 'controls'),
                      cv.getTrackbarPos('S min', 'controls'),
                      cv.getTrackbarPos('V min', 'controls')])
    upper = np.array([cv.getTrackbarPos('H max', 'controls'),
                      cv.getTrackbarPos('S max', 'controls'),
                      cv.getTrackbarPos('V max', 'controls')])
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.inRange(hsv, lower, upper)
    res = cv.bitwise_and(frame, frame, mask=mask)
    ratio = 100 * cv.countNonZero(mask) / mask.size
    cv.putText(res, f'{ratio:.1f}%', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    return mask, res
`, desc: '<p>입력을 <b>smarties.png</b>, <b>detect_blob.png</b>, <b>📷 웹캠</b>, <b>🎞️ 동영상 cup.mp4</b>(손의 피부색은 H 약 8~13)로 바꿔 가며 원하는 색만 남도록 슬라이더를 조절해 보세요. 요령: ① S min·V min을 올려 배경부터 없애고 ② H min/max를 좁혀 색을 고른 뒤 ③ 물체에 구멍이 생기면 S min·V min을 조금 내립니다. 찾은 값은 메모해 두었다가 다음 코드에 숫자로 넣으면 됩니다.</p>' },
      { type: 'text', html: `<h3>3. 여러 색 동시에 추적하기</h3>
<p>색마다 마스크를 하나씩 만들면 됩니다. 마스크는 흑백 이미지이므로 <code>cv.bitwise_or</code>로 “A 또는 B” 마스크를 만들 수 있고, 색마다 따로 두면 “어느 픽셀이 어떤 색인지”도 구분할 수 있습니다.
아래 예제는 smarties.png에서 파랑·초록·빨강 캔디를 찾아 각 색으로 칠해 표시합니다. 빨강은 두 구간을 합쳤습니다.</p>` },
      { type: 'code', title: '예제 5 · 파랑 · 초록 · 빨강 동시에 찾기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

# 색 이름: (범위 목록, 표시할 BGR 색)
targets = {
    'blue':  ([((100, 120, 70), (130, 255, 255))], (255, 0, 0)),
    'green': ([((40, 120, 70), (80, 255, 255))], (0, 200, 0)),
    'red':   ([((0, 120, 70), (4, 255, 255)), ((170, 120, 70), (179, 255, 255))], (0, 0, 255)),
}

view = (img * 0.3).astype(np.uint8)          # 배경은 어둡게
all_mask = np.zeros(img.shape[:2], np.uint8)
for name, (ranges, color) in targets.items():
    mask = np.zeros(img.shape[:2], np.uint8)
    for lo, hi in ranges:                     # 범위가 여러 개면 OR 로 합치기
        mask = cv.bitwise_or(mask, cv.inRange(hsv, np.array(lo), np.array(hi)))
    view[mask > 0] = color                    # 해당 색으로 칠하기
    all_mask = cv.bitwise_or(all_mask, mask)
    print(f'{name:5s}: {cv.countNonZero(mask)} 픽셀')

cv.imshow('all colors mask', all_mask)
cv.imshow('color map', view)
`, desc: '<p>결과를 자세히 보면 <b>주황 캔디의 그늘진 아래쪽</b>이 빨강으로 칠해져 있습니다. 주황은 H가 약 5~15로 빨강과 매우 가깝고, 그늘진 부분은 H가 더 낮아지기 때문입니다. 빨강 상한을 4로 좁게 잡아도 완벽히 나눌 수는 없습니다. 비슷한 색끼리 구분할 때는 범위를 촘촘히 측정하고, 필요하면 크기·모양 같은 다른 단서(3주차 컨투어)를 함께 씁니다.</p>' },
      { type: 'text', html: `<h3>4. 마스크 다듬기 미리보기</h3>
<p>실제 마스크에는 <b>작은 점(잡음)</b>이 튀거나, 물체의 반짝이는 부분이 빠져 <b>구멍</b>이 생깁니다. 이번 주 후반에 배울 <b>미디언 블러</b>(<code>cv.medianBlur</code>)나 3주차의 <b>모폴로지 연산</b>(열기 <code>MORPH_OPEN</code>, 닫기 <code>MORPH_CLOSE</code>)으로 깔끔하게 다듬을 수 있습니다. 지금은 “이런 도구가 있다” 정도만 보고 넘어갑니다.</p>` },
      { type: 'code', title: '예제 6 · 거친 마스크를 다듬어 보기 (미리보기)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

# 일부러 느슨하게 잡은 빨강 범위 → 잡음이 섞임
raw = cv.inRange(hsv, np.array([0, 40, 40]), np.array([10, 255, 255]))

median = cv.medianBlur(raw, 5)                          # 작은 점 제거 (8교시)
kernel = np.ones((5, 5), np.uint8)
opened = cv.morphologyEx(raw, cv.MORPH_OPEN, kernel)    # 열기: 작은 점 제거 (3주차)
closed = cv.morphologyEx(opened, cv.MORPH_CLOSE, kernel)  # 닫기: 작은 구멍 메우기 (3주차)

for name, m in [('raw', raw), ('median', median), ('open', opened), ('open+close', closed)]:
    print(f'{name:10s}: {cv.countNonZero(m)} 픽셀')
cv.imshow('raw | median | open | open+close', np.hstack([raw, median, opened, closed]))
`, desc: '<p>창을 확대해서 캔디 주변의 작은 점들이 사라지는지 비교해 보세요. 추적 결과를 좌표 계산이나 개수 세기에 쓰려면 이런 다듬기 과정이 거의 항상 필요합니다.</p>' },
      { type: 'tip', html: `<p><b>웹캠으로 추적이 잘 안 될 때</b> : ① 형광펜·색종이처럼 <b>채도가 높은 단색 물체</b>를 쓰세요. ② 배경에 같은 색이 없도록 합니다. ③ 웹캠의 자동 노출·화이트밸런스 때문에 색이 변할 수 있으니, 조명을 고정하고 튜너로 범위를 다시 잡으세요. ④ 피부색은 빨강~주황(H 0~20) 범위와 겹치기 쉽습니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · detect_blob.png 에서 초록 도형만 남기기',
        desc: `<p><code>detect_blob.png</code>에는 검은 배경에 초록·파랑·빨강 도형이 섞여 있습니다. <b>초록 도형만</b> 남도록 lower/upper 범위를 채우세요. 결과로 마스크와 추출 이미지를 보여주고, 초록 픽셀 수를 출력합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('detect_blob.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

# TODO: 초록색 범위로 바꾸세요 (지금은 모든 색을 통과시키는 범위)
lower = np.array([0, 0, 0])
upper = np.array([179, 255, 255])

mask = cv.inRange(hsv, lower, upper)
res = cv.bitwise_and(img, img, mask=mask)
print('초록 픽셀 수:', cv.countNonZero(mask))
cv.imshow('mask', mask)
cv.imshow('green only', res)
`,
        hint: `<p>순수한 초록 BGR (0, 255, 0)의 H는 60입니다. 튜토리얼 방식대로 H ±20 정도, S·V 하한은 50~100으로 잡아 보세요. 검은 배경은 V가 0이라 V 하한만 올려도 사라집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('detect_blob.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

lower = np.array([40, 100, 50])     # H 60 ± 20, 채도·밝기가 너무 낮은 곳 제외
upper = np.array([80, 255, 255])

mask = cv.inRange(hsv, lower, upper)
res = cv.bitwise_and(img, img, mask=mask)
print('초록 픽셀 수:', cv.countNonZero(mask))
cv.imshow('mask', mask)
cv.imshow('green only', res)
`,
      },
      {
        title: '실습 2 · 빨간 캔디: 두 구간 합치기',
        desc: `<p>smarties.png에서 <b>빨간 캔디</b>만 추출하세요. 시작 코드는 H 0~4 구간만 사용해서 일부 픽셀이 빠집니다. H 170~179 구간 마스크를 추가로 만들고 <code>cv.bitwise_or</code>로 합쳐, 합치기 전후의 픽셀 수를 비교하세요.
또한 V 하한이 왜 70인지(갈색 캔디!) 생각해 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

mask1 = cv.inRange(hsv, np.array([0, 120, 70]), np.array([4, 255, 255]))

# TODO: H 170~179 구간 마스크 mask2 를 만들고, mask1 과 OR 로 합치세요
mask = mask1

print('mask1 만:', cv.countNonZero(mask1), '/ 합친 뒤:', cv.countNonZero(mask))
cv.imshow('red mask', mask)
cv.imshow('red candies', cv.bitwise_and(img, img, mask=mask))
`,
        hint: `<p><code>mask2 = cv.inRange(hsv, np.array([170, 120, 70]), np.array([179, 255, 255]))</code>, <code>mask = cv.bitwise_or(mask1, mask2)</code>. 갈색 캔디는 H가 약 174로 빨강 구간에 들어가지만 V가 약 40으로 어둡기 때문에, V 하한 70이 갈색을 걸러 줍니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

mask1 = cv.inRange(hsv, np.array([0, 120, 70]), np.array([4, 255, 255]))
mask2 = cv.inRange(hsv, np.array([170, 120, 70]), np.array([179, 255, 255]))
mask = cv.bitwise_or(mask1, mask2)       # 빨강의 두 구간 합치기

print('mask1 만:', cv.countNonZero(mask1), '/ 합친 뒤:', cv.countNonZero(mask))
cv.imshow('red mask', mask)
cv.imshow('red candies', cv.bitwise_and(img, img, mask=mask))
`,
      },
      {
        title: '실습 3 · 색 물체의 위치 표시하기 (웹캠)',
        desc: `<p>마스크에서 흰 픽셀들의 <b>평균 좌표</b>(= 무게중심)를 구해 원으로 표시하는 추적기를 만드세요. 입력을 📷 웹캠으로 바꾸고 파란 물체를 움직여 보세요. 웹캠이 없으면 smarties.png를 쓰거나, 🎞️ 동영상 cup.mp4를 고르고 범위를 손의 피부색(예: H 5~20, S 80~255, V 70~255)으로 바꿔 움직이는 손을 따라가 보세요.
흰 픽셀이 너무 적으면(예: 500개 미만) 물체가 없는 것으로 보고 표시하지 않습니다. 4주차 “가상 페인터” 프로젝트의 핵심 아이디어입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

lower = np.array([100, 120, 70])
upper = np.array([130, 255, 255])

def process(frame):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.inRange(hsv, lower, upper)
    out = frame.copy()
    ys, xs = np.nonzero(mask)            # 흰 픽셀들의 y 좌표 배열, x 좌표 배열
    if len(xs) > 500:
        # TODO: xs, ys 의 평균으로 중심 좌표를 구하세요 (지금은 화면 중앙)
        cx, cy = frame.shape[1] // 2, frame.shape[0] // 2
        cv.circle(out, (cx, cy), 15, (0, 255, 255), 3)
        cv.putText(out, f'({cx}, {cy})', (cx + 20, cy), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    return out, mask
`,
        hint: `<p><code>np.nonzero(mask)</code>는 (행 인덱스들, 열 인덱스들)을 돌려줍니다. 행 = y, 열 = x 입니다. <code>cx = int(xs.mean())</code>, <code>cy = int(ys.mean())</code>. cv.circle 의 중심은 <b>(x, y) 순서의 정수</b>여야 합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

lower = np.array([100, 120, 70])
upper = np.array([130, 255, 255])

def process(frame):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.inRange(hsv, lower, upper)
    mask = cv.medianBlur(mask, 5)        # 작은 잡음 점 제거 (중심이 흔들리지 않게)
    out = frame.copy()
    ys, xs = np.nonzero(mask)
    if len(xs) > 500:
        cx, cy = int(xs.mean()), int(ys.mean())      # 흰 픽셀 좌표의 평균 = 무게중심
        cv.circle(out, (cx, cy), 15, (0, 255, 255), 3)
        cv.putText(out, f'({cx}, {cy})', (cx + 20, cy), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    return out, mask
`,
      },
    ],
    quiz: [
      { q: 'cv.inRange(hsv, lower, upper)가 돌려주는 결과는?', options: ['범위 안의 픽셀만 남긴 컬러 이미지', '범위 안이면 255, 밖이면 0인 1채널 마스크', '범위 안 픽셀의 개수', '범위 안 픽셀의 HSV 평균값'], answer: 1, explain: 'inRange는 조건을 만족하는지를 255/0으로 표시한 uint8 1채널 마스크를 만듭니다. 컬러로 남기려면 bitwise_and에 mask로 넣습니다.' },
      { q: 'BGR 초록 (0, 255, 0)의 HSV 값을 계산하려고 할 때 cvtColor에 넣을 올바른 입력은?', options: ['np.uint8([0, 255, 0])', 'np.uint8([[[0, 255, 0]]])', '(0, 255, 0)', 'np.float32([[0, 255, 0]])'], answer: 1, explain: 'cvtColor는 이미지(높이×너비×채널)를 받으므로 1×1×3 모양의 uint8 배열로 만들어야 합니다. 결과는 [[[60 255 255]]]입니다.' },
      { q: '빨간 물체를 안정적으로 추적하기 위한 방법으로 가장 알맞은 것은?', options: ['H 0~179 전체를 범위로 잡는다', 'H 0~10 과 H 170~179 두 마스크를 만들어 OR로 합친다', 'BGR 이미지에 inRange를 H 범위로 적용한다', 'S와 V 하한을 0으로 둔다'], answer: 1, explain: 'H는 원형이라 빨강이 양 끝에 나뉘어 있습니다. 두 구간을 각각 inRange한 뒤 bitwise_or로 합칩니다.' },
      { q: '흰 벽 배경까지 마스크에 잡힐 때 가장 먼저 조정할 값은?', options: ['H 상한을 올린다', 'S 하한을 올린다', 'V 상한을 내린다', 'H 하한을 0으로 한다'], answer: 1, explain: '흰색·회색은 채도(S)가 0에 가깝고 H 값이 불안정합니다. S 하한을 올리면 무채색 배경이 제외됩니다.' },
    ],
  },
  // =====================================================================
  // w2-3 기하학적 변환 Ⅰ
  // =====================================================================
  {
    id: 'w2-3',
    summary: '이미지의 크기를 바꾸고(resize), 옮기고(translation), 돌리고(rotation), 뒤집는(flip) 방법을 배웁니다. 2×3 변환 행렬과 cv.warpAffine()이 어떻게 픽셀 위치를 옮기는지 이해합니다.',
    goals: [
      'cv.resize()를 fx·fy 배율과 dsize 두 방식으로 사용하고, 상황에 맞는 보간법을 고를 수 있다',
      '이동 행렬을 직접 만들어 cv.warpAffine()으로 이미지를 평행 이동할 수 있다',
      'cv.getRotationMatrix2D()로 원하는 중심·각도·배율의 회전을 할 수 있다',
      'cv.flip()과 cv.rotate()로 뒤집기와 90° 단위 회전을 할 수 있다',
      '크기 인자의 (너비, 높이) 순서와 shape의 (높이, 너비) 순서를 구분할 수 있다',
    ],
    schedule: [['도입 · 변환이란', 5], ['크기 조절 · 보간법', 12], ['이동 · 회전 · 뒤집기', 13], ['실습 과제', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 기하학적 변환(Geometric Transformation)이란?</h3>
<p>지난 교시까지는 픽셀의 <b>값(색)</b>을 바꿨다면, 기하학적 변환은 픽셀의 <b>위치</b>를 바꿉니다. 사진을 확대·축소하거나, 옆으로 밀거나, 돌리거나, 거울처럼 뒤집는 것이 모두 기하학적 변환입니다.</p>
<p>이때 한 가지 문제가 생깁니다. 이미지를 1.5배로 키우면 새 이미지의 픽셀 (3, 3)은 원본의 (2, 2)에서 오지만, 픽셀 (4, 4)는 원본의 (2.67, 2.67)이라는 <b>존재하지 않는 위치</b>에서 와야 합니다.
이런 “사이 값”을 주변 픽셀로 추정하는 방법을 <b>보간법(Interpolation)</b>이라고 합니다.</p>` },
      { type: 'text', html: `<h3>2. 크기 조절: cv.resize()</h3>
<pre>dst = cv.resize(src, dsize, fx=..., fy=..., interpolation=...)</pre>
<p>크기를 정하는 방법은 두 가지이고, 둘 중 하나만 씁니다.</p>
<ul>
<li><b>배율로 지정</b> : <code>cv.resize(img, None, fx=2, fy=2)</code> — 가로 2배, 세로 2배. dsize 자리에는 <code>None</code></li>
<li><b>결과 크기로 지정</b> : <code>cv.resize(img, (640, 480))</code> — <b>(너비, 높이)</b> 순서!</li>
</ul>
<p>공식 튜토리얼은 <b>축소할 때는 INTER_AREA</b>, <b>확대할 때는 INTER_CUBIC(느리지만 부드러움)이나 INTER_LINEAR(빠름)</b>를 권합니다. 아무것도 안 쓰면 INTER_LINEAR가 기본값입니다.</p>` },
      { type: 'table', head: ['보간법 플래그', '방법', '특징 · 추천 상황'], rows: [
        ['<code>cv.INTER_NEAREST</code>', '가장 가까운 픽셀 하나를 그대로 복사', '가장 빠름. 확대하면 계단(모자이크)처럼 보임. 마스크·라벨 이미지 크기 조절'],
        ['<code>cv.INTER_LINEAR</code>', '주변 2×2 픽셀을 거리 비율로 섞음 (기본값)', '빠르고 무난. 실시간 처리, 일반적인 확대'],
        ['<code>cv.INTER_CUBIC</code>', '주변 4×4 픽셀로 부드러운 곡선 추정', '확대 품질이 좋지만 느림'],
        ['<code>cv.INTER_AREA</code>', '줄어드는 영역의 픽셀들을 평균', '<b>축소</b>할 때 가장 깔끔(자글자글한 무늬 방지)'],
      ] },
      { type: 'code', title: '예제 1 · 두 가지 방식으로 크기 바꾸기 (튜토리얼)', code: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
print('원본 shape (높이, 너비, 채널):', img.shape)

# 방법 1) 배율로: 가로·세로 2배
res = cv.resize(img, None, fx=2, fy=2, interpolation=cv.INTER_CUBIC)

# 방법 2) 결과 크기로: dsize 는 (너비, 높이) 순서!
height, width = img.shape[:2]
res2 = cv.resize(img, (2 * width, 2 * height), interpolation=cv.INTER_CUBIC)

# 축소는 INTER_AREA 추천
small = cv.resize(img, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)

# 비율 무시하고 강제로 정사각형 만들기
square = cv.resize(img, (300, 300))

print('res   :', res.shape)
print('res2  :', res2.shape)
print('small :', small.shape)
print('square:', square.shape)
cv.imshow('small (x0.5)', small)
cv.imshow('square 300x300 (distorted)', square)
`, desc: '<p>res와 res2는 같은 결과입니다. 정사각형으로 억지로 맞춘 이미지는 비율이 깨져 메시가 뚱뚱해 보입니다. 비율을 유지하려면 한쪽 크기로부터 다른 쪽을 계산해야 합니다(실습 1).</p>' },
      { type: 'warn', html: `<p><b>(너비, 높이) vs (높이, 너비) — 2주차 최다 실수!</b></p>
<ul>
<li><code>img.shape</code> → <b>(높이, 너비, 채널)</b> = (rows, cols) : numpy 배열 기준</li>
<li><code>cv.resize</code>의 dsize, <code>cv.warpAffine</code>의 dsize, 좌표 <code>(x, y)</code> → <b>(너비, 높이)</b> : OpenCV 함수 인자 기준</li>
</ul>
<p>그래서 <code>h, w = img.shape[:2]</code>로 꺼낸 뒤 함수에는 <code>(w, h)</code>로 넣는 습관을 들이세요. 순서를 바꿔 넣어도 오류가 안 나고 <b>이미지가 찌그러지기만</b> 해서 찾기 어렵습니다.</p>` },
      { type: 'code', title: '예제 2 · 보간법 비교: 작은 얼굴을 8배 확대', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

face = cv.imread('messi_face.jpg')        # 40×52 의 아주 작은 이미지
methods = [('INTER_NEAREST', cv.INTER_NEAREST), ('INTER_LINEAR', cv.INTER_LINEAR),
           ('INTER_CUBIC', cv.INTER_CUBIC), ('INTER_AREA', cv.INTER_AREA)]

plt.figure(figsize=(12, 4))
for i, (name, flag) in enumerate(methods):
    big = cv.resize(face, None, fx=8, fy=8, interpolation=flag)
    plt.subplot(1, 4, i + 1)
    plt.imshow(cv.cvtColor(big, cv.COLOR_BGR2RGB))
    plt.title(name)
    plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>NEAREST는 픽셀이 네모 블록으로 보이고, LINEAR와 CUBIC은 부드럽게 이어집니다. CUBIC이 경계가 조금 더 또렷합니다. 확대할 때 AREA는 NEAREST와 비슷하게 동작합니다.</p>' },
      { type: 'code', title: '예제 3 · 보간법 비교: 큰 이미지를 1/5로 축소', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
e1 = cv.getTickCount()
near = cv.resize(img, None, fx=0.2, fy=0.2, interpolation=cv.INTER_NEAREST)
e2 = cv.getTickCount()
area = cv.resize(img, None, fx=0.2, fy=0.2, interpolation=cv.INTER_AREA)
e3 = cv.getTickCount()

print('축소 크기:', near.shape)
print('NEAREST: %.2f ms, AREA: %.2f ms' % ((e2 - e1) / cv.getTickFrequency() * 1000,
                                          (e3 - e2) / cv.getTickFrequency() * 1000))
# 차이가 잘 보이도록 두 결과를 다시 3배 확대(NEAREST)해서 나란히 표시
view = np.hstack([near, area])
view = cv.resize(view, None, fx=3, fy=3, interpolation=cv.INTER_NEAREST)
cv.imshow('shrink: NEAREST | AREA', view)
`, desc: '<p>왼쪽(NEAREST)은 픽셀을 “건너뛰며” 골라서 가는 격자선이 끊기거나 사라지고 글자가 거칠어집니다. 오른쪽(AREA)은 영역을 평균 내므로 선이 흐려지더라도 빠지지 않습니다. 1주차에 배운 <code>getTickCount</code>로 속도도 함께 비교했습니다.</p>' },
      { type: 'text', html: `<h3>3. 이동(Translation)과 cv.warpAffine()</h3>
<p>이미지를 오른쪽으로 <code>tx</code>, 아래로 <code>ty</code>만큼 옮기면 모든 픽셀이 <code>x' = x + tx</code>, <code>y' = y + ty</code>로 이동합니다. 이것을 <b>2×3 행렬</b>로 적으면 다음과 같습니다.</p>
<pre>M = [[1, 0, tx],
     [0, 1, ty]]</pre>
<p>행렬의 첫 줄은 “새 x = 1·x + 0·y + tx”, 둘째 줄은 “새 y = 0·x + 1·y + ty”를 뜻합니다. 이 행렬을 <code>np.float32</code>로 만들어 <code>cv.warpAffine(img, M, (너비, 높이))</code>에 넣으면 됩니다.
세 번째 인자는 <b>결과 이미지의 크기</b>이고 역시 <b>(너비, 높이)</b> 순서입니다. 밀려나서 비게 된 영역은 검정(0)으로 채워집니다.</p>` },
      { type: 'code', title: '예제 4 · 이동 (튜토리얼: 오른쪽 100, 아래 50)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read, check with os.path.exists()"
rows, cols = img.shape

M = np.float32([[1, 0, 100],     # x 방향 +100 (오른쪽)
                [0, 1, 50]])     # y 방향 +50  (아래)
dst = cv.warpAffine(img, M, (cols, rows))          # (너비, 높이)!

# 빈 곳을 흰색으로 채우고, 왼쪽 위로 옮기기 (음수 이동)
M2 = np.float32([[1, 0, -80], [0, 1, -40]])
dst2 = cv.warpAffine(img, M2, (cols, rows), borderValue=255)

cv.imshow('img', dst)
cv.imshow('shift (-80, -40), white border', dst2)
`, desc: '<p>음수 값을 넣으면 왼쪽·위로 이동합니다. <code>borderValue</code>로 빈 영역의 색을 정할 수 있습니다(컬러 이미지라면 <code>(255, 255, 255)</code>).</p>' },
      { type: 'text', html: `<h3>4. 회전(Rotation): cv.getRotationMatrix2D()</h3>
<p>원점 (0, 0)을 기준으로 θ만큼 돌리는 행렬은 <code>[[cosθ, −sinθ], [sinθ, cosθ]]</code>입니다. 하지만 이미지 왼쪽 위 모서리를 중심으로 돌리면 이미지가 화면 밖으로 날아가 버립니다.
그래서 OpenCV는 <b>원하는 중심점</b>을 기준으로, <b>배율(scale)</b>까지 함께 적용하는 2×3 행렬을 계산해 주는 함수를 제공합니다.</p>
<pre>M = cv.getRotationMatrix2D(center, angle, scale)</pre>
<ul>
<li><code>center</code> : 회전 중심 <b>(x, y)</b>. 이미지 가운데는 <code>((cols-1)/2, (rows-1)/2)</code></li>
<li><code>angle</code> : 각도(도 단위). <b>양수 = 반시계 방향</b>, 음수 = 시계 방향</li>
<li><code>scale</code> : 1이면 크기 그대로, 0.5면 절반으로 줄이면서 회전</li>
</ul>
<p>내부적으로 α = scale·cosθ, β = scale·sinθ 일 때 <code>M = [[α, β, (1−α)·cx − β·cy], [−β, α, β·cx + (1−α)·cy]]</code>를 만들어 줍니다. 마지막 열이 “중심이 제자리에 있도록 보정하는 이동량”입니다.</p>` },
      { type: 'code', title: '예제 5 · 중심 기준 회전 (튜토리얼 90° + 45°·축소)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
rows, cols = img.shape
center = ((cols - 1) / 2.0, (rows - 1) / 2.0)

# 튜토리얼: 가운데를 중심으로 90도 (반시계) 회전, 배율 1
M = cv.getRotationMatrix2D(center, 90, 1)
dst = cv.warpAffine(img, M, (cols, rows))

# 45도 회전하면서 0.6배로 줄이기
M45 = cv.getRotationMatrix2D(center, 45, 0.6)
dst45 = cv.warpAffine(img, M45, (cols, rows))

np.set_printoptions(precision=3, suppress=True)
print('90도 회전 행렬:\n', M)
print('45도, 0.6배 행렬:\n', M45)
cv.imshow('rotate 90', dst)
cv.imshow('rotate 45, scale 0.6', dst45)
`, desc: '<p>90° 회전 결과를 보면 원본이 가로로 긴 이미지라 위아래가 잘리고 양옆은 검게 비어 있습니다. 결과 크기를 원본과 같게 <code>(cols, rows)</code>로 정했기 때문입니다. 잘리지 않게 돌리는 방법은 실습 2에서 다룹니다.</p>' },
      { type: 'text', html: `<h3>5. 뒤집기와 90° 단위 회전</h3>
<p>거울 모드나 90° 회전처럼 자주 쓰는 변환은 행렬 없이 전용 함수로 더 빠르고 정확하게 할 수 있습니다(보간이 필요 없어 화질 손실도 없습니다).</p>` },
      { type: 'table', head: ['함수', '인자', '결과'], rows: [
        ['<code>cv.flip(img, 1)</code>', 'flipCode = 1', '좌우 반전 (거울 모드, 셀카)'],
        ['<code>cv.flip(img, 0)</code>', 'flipCode = 0', '상하 반전'],
        ['<code>cv.flip(img, -1)</code>', 'flipCode = -1', '상하 + 좌우 반전 (= 180° 회전)'],
        ['<code>cv.rotate(img, cv.ROTATE_90_CLOCKWISE)</code>', '시계 방향 90°', '너비·높이가 서로 바뀜'],
        ['<code>cv.rotate(img, cv.ROTATE_90_COUNTERCLOCKWISE)</code>', '반시계 방향 90°', '너비·높이가 서로 바뀜'],
        ['<code>cv.rotate(img, cv.ROTATE_180)</code>', '180°', 'flip(img, -1)과 같음'],
      ] },
      { type: 'code', title: '예제 6 · flip 과 rotate 한눈에 비교', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('HappyFish.jpg')
results = [
    ('Original', img),
    ('flip 1 (left-right)', cv.flip(img, 1)),
    ('flip 0 (up-down)', cv.flip(img, 0)),
    ('flip -1 (both)', cv.flip(img, -1)),
    ('ROTATE_90_CLOCKWISE', cv.rotate(img, cv.ROTATE_90_CLOCKWISE)),
    ('ROTATE_90_COUNTERCLOCKWISE', cv.rotate(img, cv.ROTATE_90_COUNTERCLOCKWISE)),
]
plt.figure(figsize=(12, 7))
for i, (title, im) in enumerate(results):
    plt.subplot(2, 3, i + 1)
    plt.imshow(cv.cvtColor(im, cv.COLOR_BGR2RGB))
    plt.title(title)
    plt.axis('off')
    print(f'{title:28s} shape = {im.shape}')
plt.tight_layout()
plt.show()
`, desc: '<p>90° 회전 결과의 shape는 (높이, 너비)가 서로 바뀌어 있습니다. <code>warpAffine</code>으로 90° 돌렸을 때와 달리 잘리는 부분이 없습니다.</p>' },
      { type: 'code', title: '예제 7 · 트랙바로 각도와 배율 조절하기 (process)', code: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('angle', 'controls', 30, 360, nothing)      # 0~360 도
cv.createTrackbar('scale %', 'controls', 100, 200, nothing)   # 0~200 % (0 은 아래에서 10으로 보정)
cv.createTrackbar('mirror', 'controls', 0, 1, nothing)        # 1 이면 좌우 반전

def process(frame):
    angle = cv.getTrackbarPos('angle', 'controls')
    scale = max(cv.getTrackbarPos('scale %', 'controls'), 10) / 100
    if cv.getTrackbarPos('mirror', 'controls') == 1:
        frame = cv.flip(frame, 1)
    h, w = frame.shape[:2]
    M = cv.getRotationMatrix2D((w / 2, h / 2), angle, scale)
    out = cv.warpAffine(frame, M, (w, h), borderValue=(40, 40, 40))
    cv.putText(out, f'angle={angle} scale={scale:.2f}', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return out
`, desc: '<p>입력을 이미지, 📷 웹캠, 🎞️ 동영상(vtest.mp4 등)으로 바꿔 슬라이더를 움직여 보세요. 배율을 0.5 정도로 줄이면 회전해도 네 모서리가 잘리지 않는다는 것을 확인할 수 있습니다.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 비율을 유지하는 썸네일 만들기',
        desc: `<p>어떤 이미지든 <b>너비가 200픽셀</b>이 되도록 줄이되, <b>가로세로 비율은 유지</b>하는 코드를 완성하세요. <code>building.jpg</code>와 <code>water_coins.jpg</code>로 확인하고 결과 shape를 출력합니다.</p>`,
        starter: String.raw`
import cv2 as cv

for name in ['building.jpg', 'water_coins.jpg']:
    img = cv.imread(name)
    h, w = img.shape[:2]
    new_w = 200
    # TODO: 비율을 유지하도록 new_h 를 계산하세요 (지금은 200 고정이라 찌그러짐)
    new_h = 200
    thumb = cv.resize(img, (new_w, new_h), interpolation=cv.INTER_AREA)
    print(name, img.shape, '->', thumb.shape)
    cv.imshow('thumb ' + name, thumb)
`,
        hint: `<p>비율 유지: <code>new_h / new_w = h / w</code> → <code>new_h = int(h * new_w / w)</code>. dsize는 <b>(너비, 높이)</b> 순서라는 것도 다시 확인하세요.</p>`,
        solution: String.raw`
import cv2 as cv

for name in ['building.jpg', 'water_coins.jpg']:
    img = cv.imread(name)
    h, w = img.shape[:2]
    new_w = 200
    new_h = int(round(h * new_w / w))         # 원본 비율 h/w 를 그대로 유지
    thumb = cv.resize(img, (new_w, new_h), interpolation=cv.INTER_AREA)   # 축소는 INTER_AREA
    print(name, img.shape, '->', thumb.shape)
    cv.imshow('thumb ' + name, thumb)
`,
      },
      {
        title: '실습 2 · 잘리지 않는 회전',
        desc: `<p><code>messi5.jpg</code>를 30° 돌리면 모서리가 잘립니다. 회전된 이미지를 <b>모두 담을 수 있는 새 크기</b>를 계산하고, 회전 행렬의 이동 성분을 보정해 <b>잘림 없이</b> 회전하세요.</p>
<p>새 너비 = h·|sinθ| + w·|cosθ|, 새 높이 = h·|cosθ| + w·|sinθ| 이고, 결과 이미지의 중심이 새 캔버스의 중심에 오도록 <code>M[0, 2]</code>, <code>M[1, 2]</code>에 (새 중심 − 원래 중심)을 더합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
h, w = img.shape[:2]
angle = 30
cx, cy = w / 2, h / 2
M = cv.getRotationMatrix2D((cx, cy), angle, 1.0)

cos = abs(M[0, 0])      # scale=1 이므로 |cos θ|
sin = abs(M[0, 1])      # |sin θ|

# TODO 1: 회전된 이미지를 모두 담을 새 크기 new_w, new_h 를 계산하세요
new_w, new_h = w, h

# TODO 2: M[0, 2] 와 M[1, 2] 에 이동 보정값을 더하세요

dst = cv.warpAffine(img, M, (new_w, new_h))
print('원본:', img.shape, '→ 결과:', dst.shape)
cv.imshow('rotated without crop', dst)
`,
        hint: `<p><code>new_w = int(h * sin + w * cos)</code>, <code>new_h = int(h * cos + w * sin)</code>. 보정: <code>M[0, 2] += new_w / 2 - cx</code>, <code>M[1, 2] += new_h / 2 - cy</code>. 행렬 M은 numpy 배열이라 원소를 직접 바꿀 수 있습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
h, w = img.shape[:2]
angle = 30
cx, cy = w / 2, h / 2
M = cv.getRotationMatrix2D((cx, cy), angle, 1.0)

cos = abs(M[0, 0])
sin = abs(M[0, 1])

new_w = int(h * sin + w * cos)          # 회전된 사각형을 감싸는 상자의 크기
new_h = int(h * cos + w * sin)

M[0, 2] += new_w / 2 - cx               # 원래 중심 → 새 캔버스 중심으로 이동
M[1, 2] += new_h / 2 - cy

dst = cv.warpAffine(img, M, (new_w, new_h))
print('원본:', img.shape, '→ 결과:', dst.shape)
cv.imshow('rotated without crop', dst)
`,
      },
      {
        title: '실습 3 · 거울 셀카와 데칼코마니 얼굴 (웹캠)',
        desc: `<p>입력을 📷 웹캠으로 바꾸고(없으면 🎞️ 동영상 vtest.mp4나 이미지), 두 장을 반환하는 <code>process</code>를 완성하세요.</p>
<ol><li><b>mirror</b> : 좌우 반전된 거울 화면</li>
<li><b>sym</b> : 화면의 왼쪽 절반과, 그 왼쪽 절반을 좌우 반전한 것을 이어 붙인 “데칼코마니” 화면</li></ol>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def process(frame):
    h, w = frame.shape[:2]
    half = w // 2
    # TODO 1: 좌우 반전된 거울 화면
    mirror = frame
    # TODO 2: 왼쪽 절반 + (왼쪽 절반을 좌우 반전) 을 가로로 이어 붙이기
    left = frame[:, :half]
    sym = np.hstack([left, left])
    return mirror, sym
`,
        hint: `<p>좌우 반전은 <code>cv.flip(img, 1)</code>입니다. 이어 붙이기는 1주차에 쓴 <code>np.hstack([a, b])</code> — 두 이미지의 높이가 같아야 합니다. 왼쪽 절반은 <code>frame[:, :half]</code> (행은 전부, 열은 0~half).</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def process(frame):
    h, w = frame.shape[:2]
    half = w // 2
    mirror = cv.flip(frame, 1)                   # 좌우 반전
    left = frame[:, :half]
    sym = np.hstack([left, cv.flip(left, 1)])    # 왼쪽 절반 + 그 거울상
    return mirror, sym
`,
      },
    ],
    quiz: [
      { q: 'img.shape가 (342, 548, 3)일 때, 가로·세로를 절반으로 줄이는 올바른 코드는?', options: ['cv.resize(img, (171, 274))', 'cv.resize(img, (274, 171))', 'cv.resize(img, None, fx=171, fy=274)', 'cv.resize(img, 0.5)'], answer: 1, explain: 'shape는 (높이 342, 너비 548)이고, resize의 dsize는 (너비, 높이)이므로 (274, 171)입니다. 또는 cv.resize(img, None, fx=0.5, fy=0.5)도 됩니다.' },
      { q: '큰 사진을 썸네일로 축소할 때 공식 튜토리얼이 권장하는 보간법은?', options: ['cv.INTER_NEAREST', 'cv.INTER_CUBIC', 'cv.INTER_AREA', 'cv.INTER_LINEAR_EXACT'], answer: 2, explain: '축소에는 영역 평균을 쓰는 INTER_AREA가 깔끔하고, 확대에는 INTER_CUBIC(고품질)이나 INTER_LINEAR(빠름)을 권장합니다.' },
      { q: 'M = np.float32([[1, 0, -30], [0, 1, 20]])로 warpAffine하면 이미지는 어떻게 움직이나요?', options: ['왼쪽 30, 위로 20', '오른쪽 30, 아래로 20', '왼쪽 30, 아래로 20', '위로 30, 왼쪽으로 20'], answer: 2, explain: '첫 줄 마지막 값이 x 이동(−30 → 왼쪽), 둘째 줄 마지막 값이 y 이동(+20 → 아래, 이미지 y축은 아래로 증가)입니다.' },
      { q: 'cv.getRotationMatrix2D(center, 45, 1)의 회전 방향은?', options: ['시계 방향 45°', '반시계 방향 45°', '중심에 따라 달라짐', '45 라디안 회전'], answer: 1, explain: 'angle은 도(degree) 단위이며 양수는 반시계 방향입니다. 시계 방향으로 돌리려면 −45를 넣습니다.' },
      { q: '웹캠 화면을 거울처럼 좌우 반전하는 코드는?', options: ['cv.flip(frame, 0)', 'cv.flip(frame, 1)', 'cv.rotate(frame, cv.ROTATE_180)', 'cv.flip(frame, -1)'], answer: 1, explain: 'flipCode 1은 좌우 반전(세로축 기준으로 뒤집기), 0은 상하 반전(가로축 기준), −1은 둘 다입니다.' },
    ],
  },
  // =====================================================================
  // w2-4 기하학적 변환 Ⅱ
  // =====================================================================
  {
    id: 'w2-4',
    summary: '점 3쌍으로 정하는 어파인 변환과 점 4쌍으로 정하는 원근 변환을 배웁니다. 비스듬히 찍은 스도쿠 퍼즐과 카드를 정면에서 본 것처럼 반듯하게 펴고, 마우스로 네 점을 찍어 직접 펴 봅니다.',
    goals: [
      '어파인 변환과 원근 변환의 차이(행렬 크기, 필요한 점 개수, 보존되는 성질)를 설명할 수 있다',
      'cv.getAffineTransform()과 cv.warpAffine()으로 점 3쌍 기반 변환을 할 수 있다',
      'cv.getPerspectiveTransform()과 cv.warpPerspective()로 기울어진 평면을 정면 뷰로 펼 수 있다',
      '대응점의 순서를 일관되게 맞추고, 마우스 콜백으로 점을 입력받아 변환할 수 있다',
    ],
    schedule: [['도입 · 지난 시간 복습', 5], ['어파인 변환', 10], ['원근 변환', 15], ['실습 과제', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 변환 행렬 한눈에 보기</h3>
<p>지난 교시의 이동·회전·크기 조절은 모두 <b>2×3 행렬</b> 하나로 표현되는 <b>어파인 변환(Affine Transformation)</b>의 특별한 경우였습니다. 행렬 6칸을 자유롭게 채우면 기울이기(shear) 같은 변환도 할 수 있습니다.
그런데 6개의 숫자를 직접 정하기는 어렵죠. 그래서 OpenCV는 <b>“이 점이 저기로 가야 한다”는 대응점</b>만 주면 행렬을 계산해 줍니다.</p>
<ul>
<li><b>어파인 변환</b> : 미지수 6개 → 점 <b>3쌍</b>(점 하나당 x, y 식 2개)이 필요. <b>평행한 선은 변환 후에도 평행</b>합니다. 직사각형은 평행사변형이 됩니다.</li>
<li><b>원근 변환(Perspective Transformation)</b> : 3×3 행렬, 미지수 8개 → 점 <b>4쌍</b>이 필요. 직선은 직선으로 남지만 <b>평행은 깨질 수 있습니다</b>. 비스듬히 찍은 사진에서 멀리 있는 쪽이 좁아지는 효과(원근감)를 표현하거나 되돌릴 수 있습니다.</li>
</ul>` },
      { type: 'table', head: ['', '어파인 변환', '원근 변환'], rows: [
        ['행렬 크기', '2 × 3', '3 × 3'],
        ['필요한 대응점', '3쌍 (일직선 위에 있으면 안 됨)', '4쌍 (그중 3개가 일직선이면 안 됨)'],
        ['행렬 계산', '<code>cv.getAffineTransform(pts1, pts2)</code>', '<code>cv.getPerspectiveTransform(pts1, pts2)</code>'],
        ['이미지 변환', '<code>cv.warpAffine(img, M, (w, h))</code>', '<code>cv.warpPerspective(img, M, (w, h))</code>'],
        ['보존되는 성질', '직선, 평행', '직선 (평행은 보존 안 됨)'],
        ['대표 예', '이동, 회전, 크기, 기울이기', '문서 스캔, 차선 버드뷰, 간판 합성'],
      ] },
      { type: 'text', html: `<h3>2. 어파인 변환: 점 3쌍으로 변환하기</h3>
<p>입력 이미지의 세 점 <code>pts1</code>과, 그 점들이 출력에서 있어야 할 위치 <code>pts2</code>를 <b>같은 순서로</b> 적습니다. <code>pts1[0] → pts2[0]</code>, <code>pts1[1] → pts2[1]</code> 처럼 인덱스끼리 짝이 됩니다.
좌표는 <b>(x, y)</b>이고 배열은 반드시 <code>np.float32</code>여야 합니다. 공식 튜토리얼의 그림(drawing.png) 대신 격자 무늬가 잘 보이는 <code>chessboard.png</code>를 줄여서 사용합니다.</p>` },
      { type: 'code', title: '예제 1 · 어파인 변환 (튜토리얼 대응점)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('chessboard.png')
img = cv.resize(img, (360, 255), interpolation=cv.INTER_AREA)   # 1754×1240 은 너무 커서 줄이기
rows, cols, ch = img.shape

pts1 = np.float32([[50, 50], [200, 50], [50, 200]])     # 입력의 세 점 (x, y)
pts2 = np.float32([[10, 100], [200, 50], [100, 250]])   # 각 점이 이동할 위치

M = cv.getAffineTransform(pts1, pts2)
dst = cv.warpAffine(img, M, (cols, rows))

# 대응점을 같은 색으로 표시 (빨강 → 빨강, 초록 → 초록, 파랑 → 파랑)
colors = [(0, 0, 255), (0, 200, 0), (255, 0, 0)]
for p1, p2, c in zip(pts1, pts2, colors):
    cv.circle(img, (int(p1[0]), int(p1[1])), 7, c, -1)
    cv.circle(dst, (int(p2[0]), int(p2[1])), 7, c, -1)

plt.figure(figsize=(10, 4))
plt.subplot(121), plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB)), plt.title('Input')
plt.subplot(122), plt.imshow(cv.cvtColor(dst, cv.COLOR_BGR2RGB)), plt.title('Output')
plt.show()
`, desc: '<p>출력에서 체스판의 네모들이 <b>평행사변형</b>이 되었지만, 원래 평행하던 선들은 여전히 평행합니다. 이것이 어파인 변환의 특징입니다. 같은 색 점끼리 짝지어 어디로 옮겨졌는지 확인하세요.</p>' },
      { type: 'code', title: '예제 2 · 변환 행렬이 정말 점을 옮기는지 계산으로 확인', code: String.raw`
import cv2 as cv
import numpy as np

pts1 = np.float32([[50, 50], [200, 50], [50, 200]])
pts2 = np.float32([[10, 100], [200, 50], [100, 250]])
M = cv.getAffineTransform(pts1, pts2)
np.set_printoptions(precision=3, suppress=True)
print('M (2×3):\n', M)

# 점 (x, y) 에 1 을 붙여 [x, y, 1] 로 만든 뒤 행렬 곱:  [x', y'] = M @ [x, y, 1]
for p, q in zip(pts1, pts2):
    moved = M @ np.array([p[0], p[1], 1.0])
    print(f'{p} -> 계산 {moved}  (목표 {q})')

# 대응점이 아니었던 점도 옮길 수 있음: 입력의 (200, 200) 은 어디로?
print('(200, 200) ->', M @ np.array([200, 200, 1.0]))
`, desc: '<p>행렬 곱으로 계산한 위치가 목표 위치와 정확히 같습니다. <code>warpAffine</code>은 이 계산을 모든 픽셀에 대해(정확히는 출력 픽셀마다 거꾸로) 수행하고, 소수 위치의 값은 보간으로 채웁니다.</p>' },
      { type: 'text', html: `<h3>3. 원근 변환: 비스듬한 사진을 반듯하게</h3>
<p>책상 위의 종이를 비스듬히 찍으면 직사각형 종이가 사다리꼴처럼 보입니다. 사진 속 <b>종이의 네 꼭짓점</b>(pts1)과 <b>펴진 결과에서 네 꼭짓점이 갈 위치</b>(pts2, 보통 직사각형의 네 모서리)를 주면, 원근 변환으로 정면에서 본 모습을 만들 수 있습니다. 4주차 “문서 스캐너” 프로젝트의 핵심 기술입니다.</p>
<p>공식 튜토리얼은 스도쿠 사진에서 <code>pts1 = [[56,65],[368,52],[28,387],[389,390]]</code>을 골라 300×300으로 폅니다. 순서는 <b>왼쪽 위 → 오른쪽 위 → 왼쪽 아래 → 오른쪽 아래</b>이고, pts2도 같은 순서 <code>[[0,0],[300,0],[0,300],[300,300]]</code>입니다.</p>` },
      { type: 'code', title: '예제 3 · 원근 변환 (튜토리얼 좌표 그대로)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('sudoku.png')
rows, cols, ch = img.shape

pts1 = np.float32([[56, 65], [368, 52], [28, 387], [389, 390]])   # 왼위, 오위, 왼아래, 오아래
pts2 = np.float32([[0, 0], [300, 0], [0, 300], [300, 300]])

M = cv.getPerspectiveTransform(pts1, pts2)       # 3×3 행렬
dst = cv.warpPerspective(img, M, (300, 300))     # 결과 크기 (너비, 높이)

for p in pts1:                                   # 고른 점을 초록 원으로 표시
    cv.circle(img, (int(p[0]), int(p[1])), 8, (0, 255, 0), -1)

print('M (3×3):\n', np.round(M, 4))
plt.figure(figsize=(10, 5))
plt.subplot(121), plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB)), plt.title('Input')
plt.subplot(122), plt.imshow(cv.cvtColor(dst, cv.COLOR_BGR2RGB)), plt.title('Output')
plt.show()
`, desc: '<p>실습용 <code>sudoku.png</code>에서는 튜토리얼 좌표가 퍼즐의 모서리와 맞지 않아 <b>퍼즐의 왼쪽 위 일부만</b> 펴집니다. 이미지가 다르면 좌표도 직접 다시 찾아야 합니다. 아래 예제에서 퍼즐 전체를 펴 봅시다.</p>' },
      { type: 'code', title: '예제 4 · 퍼즐 네 모서리를 찾아 전체 펴기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
cv.imshow('input (hover to read x, y)', img)

# 창에 마우스를 올려 찾은 퍼즐 바깥 테두리의 네 꼭짓점 (왼위, 오위, 왼아래, 오아래)
pts1 = np.float32([[72, 85], [492, 69], [35, 516], [520, 520]])
size = 450
pts2 = np.float32([[0, 0], [size, 0], [0, size], [size, size]])

M = cv.getPerspectiveTransform(pts1, pts2)
dst = cv.warpPerspective(img, M, (size, size))

# 선택한 사각형을 입력 위에 그려 확인 (polylines 는 둘레 순서로 점을 줘야 함)
view = img.copy()
quad = np.int32([pts1[0], pts1[1], pts1[3], pts1[2]])          # 왼위→오위→오아래→왼아래
cv.polylines(view, [quad], True, (0, 0, 255), 3)
for p in pts1:
    cv.circle(view, (int(p[0]), int(p[1])), 8, (0, 255, 0), -1)

cv.imshow('selected corners', view)
cv.imshow('warped 450x450', dst)
`, desc: '<p>9×9 칸이 반듯한 격자로 펴졌습니다. 이제 각 칸은 50×50 픽셀이므로 <code>dst[r*50:(r+1)*50, c*50:(c+1)*50]</code>로 칸 하나하나를 잘라낼 수도 있습니다(숫자 인식 프로젝트의 출발점!). 그리는 순서(polylines)와 변환 순서(pts1)가 다르다는 점도 눈여겨보세요.</p>' },
      { type: 'warn', html: `<p><b>원근 변환에서 자주 하는 실수</b></p>
<ul>
<li><b>점 순서 불일치</b> : pts1이 “왼위, 오위, 왼아래, 오아래”면 pts2도 반드시 같은 순서여야 합니다. 순서가 어긋나면 결과가 뒤집히거나 꼬인 모양이 됩니다.</li>
<li><b>dtype</b> : <code>getPerspectiveTransform</code>/<code>getAffineTransform</code>은 <code>np.float32</code>만 받습니다. <code>np.array([[56, 65], ...])</code>(정수)를 넣으면 <code>Assertion failed ... CV_32F</code> 오류가 납니다.</li>
<li><b>결과 크기</b> : <code>warpPerspective</code>의 세 번째 인자는 <b>(너비, 높이)</b>이고, pts2가 그 안에 들어가도록 정해야 합니다.</li>
<li><b>함수 짝</b> : 2×3 행렬은 <code>warpAffine</code>, 3×3 행렬은 <code>warpPerspective</code>와 짝입니다.</li>
</ul>` },
      { type: 'text', html: `<h3>4. 거꾸로 쓰기: 반듯한 사진을 기울어진 면에 붙이기</h3>
<p>원근 변환은 방향을 바꿔도 됩니다. <b>pts1을 사진의 네 모서리, pts2를 목표 사각형의 네 꼭짓점</b>으로 주면, 사진을 비스듬한 면(광고판, 모니터, 종이 등)에 원근감 있게 붙일 수 있습니다.
붙일 영역은 흰 사각형을 같은 행렬로 변환해 만든 <b>마스크</b>로 골라냅니다(지난 교시의 마스크 복습).</p>` },
      { type: 'code', title: '예제 5 · 스도쿠 퍼즐 위에 사진 붙이기', code: String.raw`
import cv2 as cv
import numpy as np

board = cv.imread('sudoku.png')
photo = cv.imread('messi5.jpg')
H, W = board.shape[:2]
h, w = photo.shape[:2]

src = np.float32([[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]])      # 사진의 네 모서리
dst = np.float32([[72, 85], [492, 69], [35, 516], [520, 520]])          # 퍼즐의 네 꼭짓점 (같은 순서)
M = cv.getPerspectiveTransform(src, dst)

warped = cv.warpPerspective(photo, M, (W, H))                          # 사진을 퍼즐 모양으로 변형
mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), M, (W, H))   # 붙일 영역 마스크

result = board.copy()
result[mask > 0] = warped[mask > 0]                                     # 마스크 부분만 교체
blend = cv.addWeighted(board, 0.4, result, 0.6, 0)                      # 살짝 비치게 섞기

cv.imshow('mask', mask)
cv.imshow('photo on paper', blend)
`, desc: '<p>사진이 종이의 기울기에 맞춰 원근감 있게 붙었습니다. <code>addWeighted</code>로 섞어 퍼즐 격자가 살짝 비치게 해서 “종이에 인쇄된” 느낌을 냈습니다. AR(증강현실) 앱이 화면에 이미지를 붙이는 원리와 같습니다.</p>' },
      { type: 'tip', html: `<p><b>좌표를 찾는 요령</b> : 결과 패널의 창 위에 마우스를 올리면 좌표가 표시됩니다. 대략 찾은 뒤 결과를 보고 1~5픽셀씩 조정하세요. 점을 원으로 그려 확인하는 습관이 좋습니다.
3주차에 컨투어(<code>findContours</code>, <code>approxPolyDP</code>)를 배우면 네 꼭짓점을 <b>자동으로</b> 찾을 수 있습니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 어파인 변환으로 기울이기(이탤릭 효과)',
        desc: `<p><code>messi5.jpg</code>를 글씨의 이탤릭체처럼 <b>위쪽만 오른쪽으로 80픽셀 밀린</b> 모양으로 만드세요. 아래쪽 두 모서리는 그대로, 위쪽 모서리는 x가 +80 됩니다. 잘리지 않도록 결과 너비는 <code>w + 80</code>으로 합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
h, w = img.shape[:2]
shift = 80

# 세 점: 왼쪽 위, 오른쪽 위, 왼쪽 아래
pts1 = np.float32([[0, 0], [w - 1, 0], [0, h - 1]])
# TODO: 위쪽 두 점은 x + shift, 왼쪽 아래 점은 그대로가 되도록 pts2 를 고치세요
pts2 = np.float32([[0, 0], [w - 1, 0], [0, h - 1]])

M = cv.getAffineTransform(pts1, pts2)
dst = cv.warpAffine(img, M, (w + shift, h))
cv.imshow('sheared', dst)
`,
        hint: `<p><code>pts2 = np.float32([[shift, 0], [w - 1 + shift, 0], [0, h - 1]])</code>. 세 점만 정하면 오른쪽 아래 점은 평행사변형 규칙에 따라 자동으로 정해집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
h, w = img.shape[:2]
shift = 80

pts1 = np.float32([[0, 0], [w - 1, 0], [0, h - 1]])
pts2 = np.float32([[shift, 0], [w - 1 + shift, 0], [0, h - 1]])   # 위쪽만 오른쪽으로

M = cv.getAffineTransform(pts1, pts2)
print(np.round(M, 3))
dst = cv.warpAffine(img, M, (w + shift, h))
cv.imshow('sheared', dst)
`,
      },
      {
        title: '실습 2 · 마우스로 네 점을 찍어 펴기',
        desc: `<p><code>sudoku.png</code>를 창에 띄우고, 사용자가 퍼즐의 꼭짓점을 <b>왼쪽 위 → 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래</b>(시계 방향) 순서로 클릭하면 400×400으로 펴서 <code>warped</code> 창에 보여주세요. 오른쪽 버튼을 누르면 점을 초기화합니다.</p>
<p>시작 코드는 클릭한 점을 저장하고 원으로 표시하는 부분까지 되어 있습니다. 4번째 점이 찍혔을 때의 변환 부분을 완성하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
display = img.copy()                       # 점을 그려 보여줄 이미지
SIZE = 400
warped = np.zeros((SIZE, SIZE, 3), np.uint8)
points = []

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN and len(points) < 4:
        points.append([x, y])
        cv.circle(display, (x, y), 7, (0, 0, 255), -1)
        cv.putText(display, str(len(points)), (x + 10, y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        if len(points) == 4:
            # TODO: points 를 float32 로 바꾸고, 시계 방향 순서에 맞는 pts2 를 만들어
            #       getPerspectiveTransform → warpPerspective 결과를 warped[:] 에 넣으세요
            print('4개 점:', points)
    elif event == cv.EVENT_RBUTTONDOWN:
        points.clear()
        display[:] = img                   # 제자리 수정으로 화면 초기화
        warped[:] = 0

cv.imshow('image', display)
cv.imshow('warped', warped)
cv.setMouseCallback('image', on_mouse)
`,
        hint: `<p>클릭 순서가 시계 방향이므로 <code>pts2 = np.float32([[0, 0], [SIZE, 0], [SIZE, SIZE], [0, SIZE]])</code>입니다. 창은 콜백 뒤 자동으로 갱신되므로, 새 배열을 만드는 대신 <code>warped[:] = cv.warpPerspective(img, M, (SIZE, SIZE))</code>처럼 <b>기존 배열에 덮어써야</b> 화면에 반영됩니다. 점 표시가 없는 원본 <code>img</code>를 변환하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
display = img.copy()
SIZE = 400
warped = np.zeros((SIZE, SIZE, 3), np.uint8)
points = []

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN and len(points) < 4:
        points.append([x, y])
        cv.circle(display, (x, y), 7, (0, 0, 255), -1)
        cv.putText(display, str(len(points)), (x + 10, y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        if len(points) == 4:
            pts1 = np.float32(points)                                            # 왼위, 오위, 오아래, 왼아래
            pts2 = np.float32([[0, 0], [SIZE, 0], [SIZE, SIZE], [0, SIZE]])      # 같은 시계 방향 순서
            M = cv.getPerspectiveTransform(pts1, pts2)
            warped[:] = cv.warpPerspective(img, M, (SIZE, SIZE))               # 제자리 수정 → 창 갱신
            cv.polylines(display, [np.int32(points)], True, (0, 255, 0), 2)
            print('변환 완료! 오른쪽 클릭으로 다시 시작')
    elif event == cv.EVENT_RBUTTONDOWN:
        points.clear()
        display[:] = img
        warped[:] = 0

cv.imshow('image', display)
cv.imshow('warped', warped)
cv.setMouseCallback('image', on_mouse)
`,
      },
      {
        title: '실습 3 · 비스듬한 카드 반듯하게 펴기',
        desc: `<p><code>cards.png</code>에는 여러 장의 카드가 흩어져 있습니다. 시작 코드는 <b>똑바로 놓인 카드</b>(위쪽 가운데 왼쪽) 좌표로 이미 동작합니다.
이것을 <b>오른쪽 아래에 비스듬히 누운 카드</b>로 바꿔, 카드의 “4” 글자가 왼쪽 위에 똑바로 서도록 172×250 크기로 펴세요. 창에 마우스를 올려 네 꼭짓점 좌표를 찾으세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('cards.png')
W, H = 172, 250

# TODO: 오른쪽 아래의 기울어진 카드 꼭짓점으로 바꾸세요
#       순서: (펴진 결과 기준) 왼위, 오위, 오아래, 왼아래
pts1 = np.float32([[171, 77], [257, 77], [257, 204], [171, 204]])
pts2 = np.float32([[0, 0], [W, 0], [W, H], [0, H]])

M = cv.getPerspectiveTransform(pts1, pts2)
card = cv.warpPerspective(img, M, (W, H))

view = img.copy()
cv.polylines(view, [np.int32(pts1)], True, (0, 200, 0), 2)
cv.circle(view, (int(pts1[0][0]), int(pts1[0][1])), 6, (255, 0, 0), -1)   # 파란 점 = 결과의 왼쪽 위
cv.imshow('cards', view)
cv.imshow('card', card)
`,
        hint: `<p>카드가 옆으로 누워 있으므로 “결과의 왼쪽 위”는 사진 속 카드의 <b>왼쪽 아래 모서리</b>입니다. 대략 (412, 413), (382, 332), (499, 288), (531, 368) 부근을 확인해 보세요. 결과가 거울처럼 뒤집히면 둘째·넷째 점을 바꾸고, 90° 돌아가 있으면 순서를 한 칸씩 돌리세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('cards.png')
W, H = 172, 250

# 누운 카드: 결과의 왼위=사진의 왼아래 모서리, 이후 시계 방향으로 한 칸씩
pts1 = np.float32([[412, 413], [382, 332], [499, 288], [531, 368]])
pts2 = np.float32([[0, 0], [W, 0], [W, H], [0, H]])

M = cv.getPerspectiveTransform(pts1, pts2)
card = cv.warpPerspective(img, M, (W, H))

view = img.copy()
cv.polylines(view, [np.int32(pts1)], True, (0, 200, 0), 2)
cv.circle(view, (int(pts1[0][0]), int(pts1[0][1])), 6, (255, 0, 0), -1)
cv.imshow('cards', view)
cv.imshow('card', card)
`,
      },
    ],
    quiz: [
      { q: '어파인 변환 행렬을 구하는 데 필요한 대응점의 수는?', options: ['2쌍', '3쌍', '4쌍', '8쌍'], answer: 1, explain: '어파인 행렬은 2×3(미지수 6개)이고 점 하나가 x, y 두 식을 주므로 3쌍이 필요합니다. 원근 변환(미지수 8개)은 4쌍입니다.' },
      { q: '어파인 변환으로는 불가능하지만 원근 변환으로는 가능한 것은?', options: ['이미지를 회전하기', '직사각형을 평행사변형으로 만들기', '직사각형을 사다리꼴로 만들기', '이미지 크기를 절반으로 줄이기'], answer: 2, explain: '원근 변환은 직선을 직선으로 보내지만 평행을 유지하지 않으므로 직사각형을 사다리꼴(일반 사각형)로 만들 수 있습니다. 어파인은 평행을 유지해 평행사변형까지만 가능합니다.' },
      { q: 'cv.getPerspectiveTransform(pts1, pts2) 호출에서 “Assertion failed ... CV_32F” 오류가 났다. 가장 가능성 높은 원인은?', options: ['이미지가 흑백이라서', 'pts1, pts2가 정수형 배열이라서', '점이 4개라서', 'dsize를 (높이, 너비)로 줘서'], answer: 1, explain: '대응점 배열은 np.float32여야 합니다. np.float32([[...], ...])로 만드세요.' },
      { q: 'getPerspectiveTransform으로 얻은 3×3 행렬 M으로 이미지를 변환하는 함수는?', options: ['cv.warpAffine', 'cv.warpPerspective', 'cv.resize', 'cv.getRotationMatrix2D'], answer: 1, explain: '3×3 원근 행렬은 warpPerspective, 2×3 어파인 행렬은 warpAffine과 짝입니다.' },
    ],
  },
  // =====================================================================
  // w2-5 이미지 임계처리
  // =====================================================================
  {
    id: 'w2-5',
    summary: '픽셀을 기준값보다 밝은지 어두운지로 나누는 임계처리(Thresholding)를 배웁니다. cv.threshold()의 5가지 타입을 비교하고, 조명이 고르지 않은 사진에는 cv.adaptiveThreshold()를 사용합니다.',
    goals: [
      '임계처리가 무엇이며 왜 흑백(그레이스케일) 이미지에 적용하는지 설명할 수 있다',
      'cv.threshold()의 반환값과 5가지 타입(BINARY, BINARY_INV, TRUNC, TOZERO, TOZERO_INV)의 결과를 예측할 수 있다',
      'cv.adaptiveThreshold()의 blockSize, C 인자의 의미를 알고 조명이 고르지 않은 이미지에 적용할 수 있다',
      '트랙바와 process(frame)로 임계값을 실시간으로 조절해 볼 수 있다',
    ],
    schedule: [['도입 · 임계처리란', 5], ['단순 임계처리 5가지 타입', 13], ['적응형 임계처리', 12], ['실습 과제', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 임계처리(Thresholding)란?</h3>
<p>임계처리는 이미지의 각 픽셀을 <b>기준값(임계값, threshold)</b>과 비교해서 두 그룹으로 나누는 가장 단순한 <b>분할(segmentation)</b> 방법입니다.
“127보다 밝으면 흰색(255), 아니면 검정(0)”처럼 규칙을 정하면, 256단계의 회색 이미지가 <b>흑과 백 두 값만 있는 이진(binary) 이미지</b>가 됩니다.</p>
<p><b>왜 쓸까요?</b> 물체와 배경을 나누면 이후 단계가 훨씬 쉬워집니다. 글자만 남기기(문서 스캔), 동전 개수 세기, 컨투어 찾기(3주차) 등 수많은 파이프라인의 첫 단계가 임계처리입니다.
밝기 하나로 비교하므로 보통 <b>그레이스케일 이미지</b>에 적용합니다.</p>` },
      { type: 'text', html: `<h3>2. 단순 임계처리: cv.threshold()</h3>
<p>이미지 전체에 <b>하나의 임계값</b>을 똑같이 적용하는 방법을 단순(전역, global) 임계처리라고 합니다. 함수 모양은 다음과 같습니다.</p>
<pre>ret, dst = cv.threshold(src, thresh, maxval, type)</pre>
<ul>
<li><code>src</code> : 입력 이미지(보통 흑백) · <code>thresh</code> : 임계값 · <code>maxval</code> : 조건을 만족할 때 넣을 값(보통 255)</li>
<li><code>type</code> : 규칙의 종류(아래 표) · 반환값 <code>ret</code>는 <b>실제로 사용한 임계값</b>, <code>dst</code>는 결과 이미지</li>
</ul>` },
      { type: 'table', head: ['type', '규칙 (src > thresh 일 때 / 아닐 때)', '느낌'], rows: [
        ['<code>cv.THRESH_BINARY</code>', 'maxval / 0', '밝은 곳 → 흰색, 나머지 검정'],
        ['<code>cv.THRESH_BINARY_INV</code>', '0 / maxval', 'BINARY의 반전: 어두운 물체를 흰색으로'],
        ['<code>cv.THRESH_TRUNC</code>', 'thresh / 원래 값', '밝은 부분을 thresh 로 잘라 “천장” 만들기'],
        ['<code>cv.THRESH_TOZERO</code>', '원래 값 / 0', '어두운 부분만 0으로 지우기'],
        ['<code>cv.THRESH_TOZERO_INV</code>', '0 / 원래 값', '밝은 부분만 0으로 지우기'],
      ] },
      { type: 'code', title: '예제 1 · 숫자로 이해하는 5가지 타입', code: String.raw`
import cv2 as cv
import numpy as np

row = np.array([[0, 50, 100, 127, 128, 200, 255]], dtype=np.uint8)   # 1×7 짜리 작은 "이미지"
print('입력            :', row[0])

types = [('THRESH_BINARY', cv.THRESH_BINARY), ('THRESH_BINARY_INV', cv.THRESH_BINARY_INV),
         ('THRESH_TRUNC', cv.THRESH_TRUNC), ('THRESH_TOZERO', cv.THRESH_TOZERO),
         ('THRESH_TOZERO_INV', cv.THRESH_TOZERO_INV)]
for name, t in types:
    ret, out = cv.threshold(row, 127, 255, t)
    print(f'{name:18s}:', out[0], ' ret =', ret)
`, desc: '<p><b>127은 “127보다 큰가?”에서 거짓</b>이므로 BINARY에서 0이 됩니다(<code>&gt;</code> 비교, 같으면 아님). 128부터 255가 됩니다. ret는 우리가 넣은 127이 그대로 돌아옵니다(다음 교시 Otsu에서는 자동 계산값이 돌아옵니다).</p>' },
      { type: 'code', title: '예제 2 · gradient.png 에 5가지 타입 적용 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('gradient.png', cv.IMREAD_GRAYSCALE)     # 왼쪽 0 → 오른쪽 255 그라데이션
assert img is not None, "file could not be read, check with os.path.exists()"
ret, thresh1 = cv.threshold(img, 127, 255, cv.THRESH_BINARY)
ret, thresh2 = cv.threshold(img, 127, 255, cv.THRESH_BINARY_INV)
ret, thresh3 = cv.threshold(img, 127, 255, cv.THRESH_TRUNC)
ret, thresh4 = cv.threshold(img, 127, 255, cv.THRESH_TOZERO)
ret, thresh5 = cv.threshold(img, 127, 255, cv.THRESH_TOZERO_INV)

titles = ['Original Image', 'BINARY', 'BINARY_INV', 'TRUNC', 'TOZERO', 'TOZERO_INV']
images = [img, thresh1, thresh2, thresh3, thresh4, thresh5]

plt.figure(figsize=(10, 6))
for i in range(6):
    plt.subplot(2, 3, i + 1), plt.imshow(images[i], 'gray', vmin=0, vmax=255)
    plt.title(titles[i])
    plt.xticks([]), plt.yticks([])
plt.show()
`, desc: '<p>튜토리얼처럼 matplotlib의 <code>subplot</code>으로 여러 결과를 한 번에 비교했습니다. 가로축이 곧 밝기이므로 각 타입이 <b>어느 밝기에서 어떻게 바뀌는지</b>가 그래프처럼 보입니다. <code>vmin=0, vmax=255</code>를 주지 않으면 matplotlib이 자동으로 명암을 늘려서 TRUNC 결과가 원본과 비슷해 보일 수 있습니다.</p>' },
      { type: 'warn', html: `<ul>
<li><b>컬러 이미지를 넣으면</b> 오류는 안 나지만 B, G, R 채널마다 따로 임계처리되어 알록달록한 결과가 나옵니다. 먼저 <code>cv.cvtColor(img, cv.COLOR_BGR2GRAY)</code>로 바꾸세요.</li>
<li><code>cv.threshold</code>는 <b>값을 두 개</b> 돌려줍니다. <code>th = cv.threshold(...)</code>라고 쓰면 th가 튜플이 되어 <code>imshow</code>에서 오류가 납니다. <code>ret, th = ...</code> 또는 <code>_, th = ...</code>로 받으세요.</li>
</ul>` },
      { type: 'code', title: '예제 3 · 트랙바 임계처리 탐색기 (process)', code: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('thresh', 'controls', 127, 255, nothing)
cv.createTrackbar('type 0-4', 'controls', 0, 4, nothing)    # 0 BINARY … 4 TOZERO_INV (플래그 값이 0~4)

names = ['BINARY', 'BINARY_INV', 'TRUNC', 'TOZERO', 'TOZERO_INV']

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    t = cv.getTrackbarPos('thresh', 'controls')
    k = cv.getTrackbarPos('type 0-4', 'controls')
    ret, th = cv.threshold(gray, t, 255, k)                  # THRESH_BINARY=0, …, THRESH_TOZERO_INV=4
    out = cv.cvtColor(th, cv.COLOR_GRAY2BGR)
    cv.putText(out, f'{names[k]}  t={t}', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    return gray, out
`, desc: '<p>입력을 <b>water_coins.jpg</b>, <b>box.png</b>, <b>gradient.png</b>, <b>📷 웹캠</b>, <b>🎞️ 동영상</b>(cup.mp4 등) 등으로 바꿔 보세요. 동전이 흰색으로 깔끔하게 분리되는 임계값과 타입을 찾아보세요. 한 이미지에서 잘 되던 값이 다른 이미지에서는 전혀 안 맞는다는 것도 느낄 수 있습니다.</p>' },
      { type: 'text', html: `<h3>3. 적응형 임계처리(Adaptive Thresholding)</h3>
<p>단순 임계처리는 이미지 <b>전체에 같은 임계값 하나</b>(전역 임계값)를 씁니다. 그런데 사진 한쪽에 그림자가 지면 어떨까요? 밝은 쪽의 “종이”와 그늘진 쪽의 “글자”가 같은 밝기일 수 있어서, 어떤 값을 골라도 한쪽이 망가집니다.</p>
<p>적응형 임계처리는 <b>픽셀마다 주변 작은 영역을 보고 그 동네의 임계값을 따로 계산</b>합니다. “주변보다 조금 더 어두우면 글자”라고 판단하므로 조명이 고르지 않아도 잘 동작합니다.</p>
<pre>dst = cv.adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C)</pre>` },
      { type: 'table', head: ['인자', '의미', '팁'], rows: [
        ['<code>src</code>', '입력 이미지', '<b>8비트 1채널(흑백)만</b> 가능'],
        ['<code>maxValue</code>', '조건 만족 시 값', '보통 255'],
        ['<code>adaptiveMethod</code>', '<code>cv.ADAPTIVE_THRESH_MEAN_C</code> : 이웃 영역의 평균 − C<br><code>cv.ADAPTIVE_THRESH_GAUSSIAN_C</code> : 이웃 영역의 가우시안 가중 평균 − C', '가우시안은 가까운 픽셀을 더 중요하게 봐서 조금 더 매끈함'],
        ['<code>thresholdType</code>', '<code>cv.THRESH_BINARY</code> 또는 <code>cv.THRESH_BINARY_INV</code>', '글자를 흰색으로 원하면 INV'],
        ['<code>blockSize</code>', '이웃 영역 크기(blockSize × blockSize)', '<b>3 이상의 홀수</b>. 글자 굵기보다 충분히 크게(11~51)'],
        ['<code>C</code>', '평균에서 빼는 상수', '클수록 “확실히 어두운 것”만 검정 → 잡음 감소'],
      ] },
      { type: 'code', title: '예제 4 · 전역 vs 적응형 (튜토리얼 sudoku.png)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read, check with os.path.exists()"
img = cv.medianBlur(img, 5)          # 작은 잡음을 먼저 줄이기 (8교시에 자세히)

ret, th1 = cv.threshold(img, 127, 255, cv.THRESH_BINARY)
th2 = cv.adaptiveThreshold(img, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 2)
th3 = cv.adaptiveThreshold(img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2)

titles = ['Original Image', 'Global Thresholding (v = 127)',
          'Adaptive Mean Thresholding', 'Adaptive Gaussian Thresholding']
images = [img, th1, th2, th3]

plt.figure(figsize=(10, 10))
for i in range(4):
    plt.subplot(2, 2, i + 1), plt.imshow(images[i], 'gray')
    plt.title(titles[i])
    plt.xticks([]), plt.yticks([])
plt.show()
`, desc: '<p>전역 임계값(127) 결과는 사진 왼쪽의 어두운(그늘진) 부분이 통째로 검게 뭉개집니다. 적응형 결과는 그늘 속 숫자와 격자선까지 살아납니다. 먼저 <code>medianBlur</code>를 한 이유는 종이 질감 같은 자잘한 잡음이 “주변보다 어두운 점”으로 잡히지 않게 하기 위해서입니다.</p>' },
      { type: 'tip', html: `<p><b>blockSize와 C 고르는 감각</b></p>
<ul>
<li><b>blockSize가 너무 작으면</b>(3, 5) 굵은 글자의 가운데가 “주변도 다 어두우니 배경”으로 판단되어 속이 빈 테두리만 남습니다.</li>
<li><b>blockSize가 너무 크면</b>(101 이상) 전역 임계처리와 비슷해져 그림자에 다시 약해집니다.</li>
<li><b>C를 0으로 두면</b> 종이의 아주 작은 밝기 차이까지 검은 점으로 나옵니다. 2~10 정도에서 시작하세요.</li>
</ul>` },
      { type: 'text', html: `<h3>4. 실시간 영상에서 비교하기</h3>
<p>임계처리 결과는 이진 이미지이므로 그대로 <b>마스크</b>로 쓸 수 있습니다. 지난 교시의 색 마스크처럼 <code>bitwise_and</code>로 물체만 남기거나, 3주차에 배울 <b>컨투어</b>로 물체의 모양·개수를 분석하는 재료가 됩니다.
마지막으로 전역 임계처리와 적응형 임계처리를 실시간 영상에서 나란히 비교해 봅시다. 조명이 바뀌는 상황에서 두 방법의 차이가 가장 잘 드러납니다.</p>` },
      { type: 'code', title: '예제 5 · 웹캠 문서 모드: 전역 vs 적응형 (process)', code: String.raw`
import cv2 as cv
import numpy as np

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.medianBlur(gray, 5)
    _, glob = cv.threshold(gray, 127, 255, cv.THRESH_BINARY)
    adap = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 8)
    both = np.hstack([glob, adap])
    both = cv.resize(both, None, fx=0.6, fy=0.6, interpolation=cv.INTER_AREA)   # 화면에 맞게 축소
    return both
`, desc: '<p>입력을 <b>📷 웹캠</b>으로 바꾸고 글씨가 쓰인 종이나 책을 비춰 보세요. 손으로 그림자를 만들면 왼쪽(전역)은 그늘 부분이 새까맣게 되지만, 오른쪽(적응형)은 글씨가 유지됩니다. 웹캠이 없다면 입력을 sudoku.png나 🎞️ 동영상(vtest.mp4 등)으로 두어도 비교할 수 있습니다.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 동전을 흰색으로 분리하기',
        desc: `<p><code>water_coins.jpg</code>에서 <b>동전은 흰색(255), 배경은 검정(0)</b>이 되도록 임계처리하세요. 동전은 배경보다 <b>어둡다</b>는 점에 주의합니다. 알맞은 타입과 임계값을 찾고, 흰 픽셀 비율(%)을 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
print('배경 밝기 예:', gray[5, 5], '/ 동전 밝기 예:', gray[150, 120])

# TODO: 동전이 흰색이 되도록 thresh 값과 type 을 바꾸세요
thresh = 127
ret, th = cv.threshold(gray, thresh, 255, cv.THRESH_BINARY)

print('흰 픽셀 비율: %.1f %%' % (100 * cv.countNonZero(th) / th.size))
cv.imshow('gray', gray)
cv.imshow('coins', th)
`,
        hint: `<p>어두운 물체를 흰색으로 만들려면 <code>cv.THRESH_BINARY_INV</code>를 씁니다. 배경(약 240)과 동전(약 60~150) 사이 값을 골라 보세요. 150~170 정도에서 동전 안쪽이 가장 꽉 찹니다. 다음 교시에는 이 값을 <b>자동</b>으로 찾습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
print('배경 밝기 예:', gray[5, 5], '/ 동전 밝기 예:', gray[150, 120])

thresh = 160
ret, th = cv.threshold(gray, thresh, 255, cv.THRESH_BINARY_INV)   # 어두운 동전 → 흰색

print('흰 픽셀 비율: %.1f %%' % (100 * cv.countNonZero(th) / th.size))
cv.imshow('gray', gray)
cv.imshow('coins', th)
`,
      },
      {
        title: '실습 2 · blockSize 에 따른 적응형 결과 비교',
        desc: `<p><code>sudoku.png</code>에 <code>ADAPTIVE_THRESH_GAUSSIAN_C</code>를 blockSize <b>3, 11, 31, 101</b>로 각각 적용해 2×2 subplot으로 비교하세요(C = 2 고정). 어떤 값에서 숫자 속이 비고, 어떤 값에서 그림자에 약해지는지 관찰합니다.</p>`,
        starter: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
img = cv.medianBlur(img, 5)

# TODO: 3, 11, 31, 101 네 값을 모두 비교하도록 목록을 채우세요
sizes = [11]

plt.figure(figsize=(10, 10))
for i, bs in enumerate(sizes):
    th = cv.adaptiveThreshold(img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, bs, 2)
    plt.subplot(2, 2, i + 1)
    plt.imshow(th, 'gray')
    plt.title('blockSize = %d' % bs)
    plt.axis('off')
plt.show()
`,
        hint: `<p><code>sizes = [3, 11, 31, 101]</code>. blockSize는 반드시 홀수여야 합니다. 짝수를 넣으면 <code>Assertion failed (blockSize % 2 == 1 &amp;&amp; blockSize &gt; 1)</code> 오류가 납니다.</p>`,
        solution: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
img = cv.medianBlur(img, 5)

sizes = [3, 11, 31, 101]          # 모두 홀수

plt.figure(figsize=(10, 10))
for i, bs in enumerate(sizes):
    th = cv.adaptiveThreshold(img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, bs, 2)
    plt.subplot(2, 2, i + 1)
    plt.imshow(th, 'gray')
    plt.title('blockSize = %d' % bs)
    plt.axis('off')
plt.show()
`,
      },
      {
        title: '실습 3 · 적응형 임계처리 튜너 (트랙바 + 홀수 보정)',
        desc: `<p>트랙바 두 개(<code>block</code>, <code>C</code>)로 적응형 임계처리를 조절하는 <code>process</code>를 만드세요. 트랙바는 짝수 값도 나오므로 <b>항상 3 이상의 홀수</b>가 되도록 변환해야 합니다. 입력은 sudoku.png, 📷 웹캠, 🎞️ 동영상 중 아무거나 좋습니다.</p>`,
        starter: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('block', 'controls', 5, 50, nothing)
cv.createTrackbar('C', 'controls', 2, 20, nothing)

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    pos = cv.getTrackbarPos('block', 'controls')
    C = cv.getTrackbarPos('C', 'controls')
    # TODO: pos(0~50) 를 3 이상의 홀수 blockSize 로 바꾸세요 (지금은 11 고정)
    block = 11
    th = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, block, C)
    cv.putText(th, f'block={block} C={C}', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, 128, 2)
    return th
`,
        hint: `<p><code>block = 2 * pos + 3</code>로 하면 pos가 0일 때 3, 1일 때 5, … 50일 때 103으로 항상 홀수입니다. 흑백 이미지에 글자를 쓸 때 색은 <code>128</code>처럼 숫자 하나로 줍니다.</p>`,
        solution: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('block', 'controls', 5, 50, nothing)
cv.createTrackbar('C', 'controls', 2, 20, nothing)

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.medianBlur(gray, 3)
    pos = cv.getTrackbarPos('block', 'controls')
    C = cv.getTrackbarPos('C', 'controls')
    block = 2 * pos + 3                   # 3, 5, 7, … 항상 3 이상의 홀수
    th = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, block, C)
    cv.putText(th, f'block={block} C={C}', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, 128, 2)
    return th
`,
      },
    ],
    quiz: [
      { q: 'ret, th = cv.threshold(gray, 100, 255, cv.THRESH_BINARY)에서 픽셀 값이 100인 곳의 결과는?', options: ['255', '100', '0', '오류'], answer: 2, explain: 'THRESH_BINARY는 픽셀 값이 thresh보다 “클 때만” maxval입니다. 100은 100보다 크지 않으므로 0이 됩니다.' },
      { q: '밝은 배경 위의 어두운 글자를 흰색으로, 배경을 검정으로 만들려면?', options: ['THRESH_BINARY', 'THRESH_BINARY_INV', 'THRESH_TRUNC', 'THRESH_TOZERO'], answer: 1, explain: '어두운(임계값 이하) 픽셀을 maxval로 만드는 것은 BINARY_INV입니다.' },
      { q: 'THRESH_TRUNC(thresh=127)을 적용하면 200이던 픽셀은?', options: ['0', '127', '200', '255'], answer: 1, explain: 'TRUNC는 임계값보다 큰 값을 임계값으로 잘라냅니다. 127 이하의 값은 그대로 둡니다.' },
      { q: '조명이 고르지 않은(한쪽에 그림자가 진) 문서 사진에 가장 알맞은 방법은?', options: ['임계값을 255로 올린 단순 임계처리', 'cv.adaptiveThreshold', 'cv.resize 후 단순 임계처리', 'THRESH_TOZERO_INV'], answer: 1, explain: '적응형 임계처리는 픽셀마다 주변 영역의 (가중)평균으로 임계값을 따로 정하므로 조명 차이에 강합니다.' },
      { q: 'cv.adaptiveThreshold의 blockSize로 사용할 수 없는 값은?', options: ['3', '11', '24', '51'], answer: 2, explain: 'blockSize는 중심 픽셀이 있어야 하므로 3 이상의 홀수여야 합니다. 24는 짝수라 오류가 납니다.' },
    ],
  },
  // =====================================================================
  // w2-6 Otsu 이진화
  // =====================================================================
  {
    id: 'w2-6',
    summary: '임계값을 사람이 고르지 않고 히스토그램을 분석해 자동으로 찾는 Otsu 이진화를 배웁니다. 히스토그램과 쌍봉(bimodal) 분포를 이해하고, Otsu 알고리즘을 numpy로 직접 구현해 OpenCV 결과와 비교합니다.',
    goals: [
      '히스토그램이 무엇인지 설명하고 plt.hist()로 그릴 수 있다',
      '쌍봉(bimodal) 히스토그램에서 좋은 임계값이 어디인지 설명할 수 있다',
      'THRESH_OTSU 플래그로 자동 임계값을 구하고 반환값 ret를 해석할 수 있다',
      '노이즈가 있을 때 가우시안 블러 후 Otsu를 적용하는 이유를 설명할 수 있다',
      'Otsu 알고리즘(클래스 간 분산 최대화)을 numpy로 구현할 수 있다',
    ],
    schedule: [['도입 · 지난 시간 문제점', 5], ['히스토그램과 쌍봉 분포', 10], ['Otsu 예제', 12], ['Otsu 원리와 구현', 8], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 임계값, 매번 손으로 찾아야 할까?</h3>
<p>지난 교시에 동전 사진의 임계값을 트랙바로 이리저리 옮기며 찾았습니다. 사진이 바뀔 때마다 이렇게 할 수는 없겠죠. <b>Otsu(오츠) 이진화</b>는 이미지의 <b>히스토그램을 분석해 최적의 임계값을 자동으로 계산</b>합니다.</p>
<h4>히스토그램(Histogram)</h4>
<p>히스토그램은 “밝기 0인 픽셀이 몇 개, 1인 픽셀이 몇 개, … 255인 픽셀이 몇 개”를 세어 막대그래프로 그린 것입니다. 가로축은 밝기(0~255), 세로축은 픽셀 수입니다. 위치 정보는 사라지고 <b>밝기의 분포</b>만 남습니다.</p>
<h4>쌍봉(Bimodal) 히스토그램</h4>
<p>밝은 배경 위에 어두운 물체가 있는 사진은 히스토그램에 <b>봉우리가 두 개</b> 생깁니다. 하나는 배경, 하나는 물체의 밝기입니다. 이런 분포를 쌍봉 분포라고 하며, 좋은 임계값은 <b>두 봉우리 사이의 골짜기</b>입니다. Otsu는 바로 이 골짜기를 계산으로 찾아냅니다.</p>` },
      { type: 'code', title: '예제 1 · 히스토그램 그려 보기: 쌍봉 vs 단봉', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# 아주 작은 예로 히스토그램 개념 확인
tiny = np.array([[10, 10, 200], [10, 200, 200], [10, 10, 90]], dtype=np.uint8)
counts = np.bincount(tiny.ravel(), minlength=256)
print('값 10 의 개수:', counts[10], '/ 값 90:', counts[90], '/ 값 200:', counts[200])

coins = cv.imread('water_coins.jpg', cv.IMREAD_GRAYSCALE)   # 배경 + 동전 → 봉우리 2개
lena = cv.imread('lena.jpg', cv.IMREAD_GRAYSCALE)           # 여러 밝기가 고루 섞임

plt.figure(figsize=(10, 7))
for i, (im, name) in enumerate([(coins, 'water_coins'), (lena, 'lena')]):
    plt.subplot(2, 2, 2 * i + 1), plt.imshow(im, 'gray'), plt.title(name), plt.axis('off')
    plt.subplot(2, 2, 2 * i + 2), plt.hist(im.ravel(), 256, [0, 256]), plt.title(name + ' histogram')
plt.tight_layout()
plt.show()
`, desc: '<p><code>img.ravel()</code>은 2차원 이미지를 1차원으로 쭉 펴 줍니다. <code>plt.hist(데이터, 256, [0, 256])</code>은 0~256 구간을 256개 막대로 나눠 개수를 셉니다. water_coins는 어두운 쪽(동전)과 아주 밝은 쪽(배경)에 봉우리가 뚜렷하지만, lena는 여러 밝기에 넓게 퍼져 있어 “골짜기”가 분명하지 않습니다.</p>' },
      { type: 'text', html: `<h3>2. Otsu 이진화 사용법</h3>
<p>사용법은 아주 간단합니다. <code>cv.threshold()</code>의 type에 <code>cv.THRESH_OTSU</code>를 <b>더해</b> 주고, 임계값 자리에는 아무 값(보통 0)이나 넣습니다. 이때 넣은 임계값은 무시되고, <b>Otsu가 찾은 값이 반환값 ret</b>로 돌아옵니다.</p>
<pre>ret, th = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
print(ret)   # 자동으로 찾은 임계값</pre>` },
      { type: 'table', head: ['type 조합', '결과'], rows: [
        ['<code>cv.THRESH_BINARY + cv.THRESH_OTSU</code>', '자동 임계값보다 밝으면 255'],
        ['<code>cv.THRESH_BINARY_INV + cv.THRESH_OTSU</code>', '자동 임계값 이하(어두운 물체)를 255'],
        ['<code>cv.THRESH_BINARY + cv.THRESH_TRIANGLE</code>', '봉우리가 하나뿐이고 한쪽으로 긴 꼬리가 있는 히스토그램용 자동 임계값'],
      ] },
      { type: 'code', title: '예제 2 · 노이즈 이미지: 전역 vs Otsu vs 가우시안 + Otsu (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# 튜토리얼의 noisy2.png 대신 직접 만든 노이즈 이미지 (배경 40, 물체 120)
rng = np.random.default_rng(0)
clean = np.full((300, 400), 40, np.uint8)
cv.circle(clean, (130, 150), 80, 120, -1)
cv.rectangle(clean, (240, 60), (360, 240), 120, -1)
img = np.clip(clean + rng.normal(0, 25, clean.shape), 0, 255).astype(np.uint8)   # 가우시안 노이즈 추가

# 전역 임계처리
ret1, th1 = cv.threshold(img, 127, 255, cv.THRESH_BINARY)
# Otsu 임계처리
ret2, th2 = cv.threshold(img, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
# 가우시안 블러 후 Otsu 임계처리
blur = cv.GaussianBlur(img, (5, 5), 0)
ret3, th3 = cv.threshold(blur, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
print('ret1 (global) =', ret1, ' ret2 (Otsu) =', ret2, ' ret3 (blur+Otsu) =', ret3)

# 정답(clean 에서 물체 부분)과 비교한 정확도
truth = clean > 80
for name, th in [('global 127', th1), ('Otsu', th2), ('blur + Otsu', th3)]:
    print(f'{name:12s} 정확도: {100 * np.mean((th > 0) == truth):.2f} %')

images = [img, 0, th1, img, 0, th2, blur, 0, th3]
rets = [ret1, ret2, ret3]
titles = ['Original Noisy Image', 'Histogram', 'Global Thresholding (v=127)',
          'Original Noisy Image', 'Histogram', "Otsu's Thresholding",
          'Gaussian filtered Image', 'Histogram', "Otsu's Thresholding"]
plt.figure(figsize=(12, 9))
for i in range(3):
    plt.subplot(3, 3, i * 3 + 1), plt.imshow(images[i * 3], 'gray')
    plt.title(titles[i * 3]), plt.xticks([]), plt.yticks([])
    plt.subplot(3, 3, i * 3 + 2), plt.hist(images[i * 3].ravel(), 256, [0, 256])
    plt.axvline(rets[i], color='r')                       # 사용된 임계값 위치
    plt.title(titles[i * 3 + 1] + ' (t=%d)' % rets[i]), plt.yticks([])
    plt.subplot(3, 3, i * 3 + 3), plt.imshow(images[i * 3 + 2], 'gray')
    plt.title(titles[i * 3 + 2]), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p>① 전역 127은 두 봉우리(40, 120)의 <b>오른쪽 바깥</b>이라 물체의 절반 가까이가 검게 빠져 모래알처럼 듬성듬성해집니다. ② Otsu는 골짜기(약 78)를 찾아 물체를 살리지만 노이즈 점이 많습니다. ③ 가우시안 블러로 노이즈를 줄이면 봉우리가 <b>좁고 뾰족</b>해져 골짜기가 깊어지고, 결과가 거의 완벽해집니다. 빨간 세로선이 각 경우의 임계값입니다. 히스토그램 왼쪽 끝(0)의 긴 막대는 노이즈를 더하다 0보다 작아진 값이 <code>np.clip</code>으로 0에 모인 것입니다.</p>' },
      { type: 'warn', html: `<ul>
<li>Otsu는 <b>8비트 1채널</b> 이미지에만 쓸 수 있습니다. 컬러 이미지를 넣으면 오류가 납니다.</li>
<li><b>thresh 인자는 무시</b>됩니다. 127을 넣어도 자동 값이 쓰이므로 결과가 궁금하면 반드시 ret를 출력해 보세요.</li>
<li>히스토그램이 <b>쌍봉이 아닐 때</b>(물체가 아주 작거나, 밝기가 고루 퍼진 사진) Otsu 값은 의미가 약합니다. 이때는 적응형 임계처리나 다른 방법을 고려하세요.</li>
</ul>` },
      { type: 'code', title: '예제 3 · 실제 사진에 Otsu 적용 (water_coins, box)', code: String.raw`
import cv2 as cv
import numpy as np

coins = cv.imread('water_coins.jpg', cv.IMREAD_GRAYSCALE)
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)

# 동전은 배경보다 어두우므로 INV 로 흰색 만들기
ret_c, th_c = cv.threshold(coins, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
ret_b, th_b = cv.threshold(box, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)

print('water_coins 자동 임계값:', ret_c)
print('box         자동 임계값:', ret_b)
cv.imshow('coins | Otsu INV', np.hstack([coins, th_c]))
cv.imshow('box | Otsu', np.hstack([box, th_b]))

# 샘플 동영상의 한 프레임에도 적용 (흰 벽 앞의 검은 컵)
cap = cv.VideoCapture('cup.mp4')
cap.set(cv.CAP_PROP_POS_FRAMES, 100)         # 100번째 프레임으로 이동
ok, frame = cap.read()                       # 프레임 1장만 읽기 (반복 X)
if ok:
    cup = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    ret_u, th_u = cv.threshold(cup, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    print('cup.mp4 프레임 자동 임계값:', ret_u)
    cv.imshow('cup frame | Otsu INV', np.hstack([cup, th_u]))
`, desc: '<p>water_coins의 자동 임계값은 162로, 지난 교시 실습에서 손으로 찾은 값(150~170)과 거의 같습니다. 이제 사진이 바뀌어도 코드를 고칠 필요가 없습니다. 4주차 “동전 분석기” 프로젝트가 이 코드에서 출발합니다. 마지막 부분처럼 <code>cv.VideoCapture</code>로 동영상의 프레임 1장을 읽어 같은 처리를 할 수도 있습니다(동영상 전체는 입력 소스를 동영상으로 두고 <code>process(frame)</code>으로).</p>' },
      { type: 'text', html: `<h3>3. Otsu는 어떻게 임계값을 고를까?</h3>
<p>임계값 t로 픽셀을 “t 이하(클래스 0)”와 “t 초과(클래스 1)”로 나눴다고 합시다. 좋은 분할이란 <b>각 그룹 안의 밝기는 비슷하고(그룹 내 분산이 작고), 두 그룹끼리는 확실히 다른 것</b>입니다.</p>
<p>Otsu는 t를 0~255까지 <b>전부 시험</b>해서 다음 값이 가장 좋은 t를 고릅니다.</p>
<ul>
<li><b>그룹 내 분산(within-class variance)</b> σw² = w0·σ0² + w1·σ1² 를 <b>최소</b>로 — 튜토리얼의 설명</li>
<li>이는 <b>그룹 간 분산(between-class variance)</b> σb² = w0·w1·(μ0 − μ1)² 를 <b>최대</b>로 하는 것과 같습니다(전체 분산 = 그룹 내 + 그룹 간 이 일정하므로). 계산이 더 간단해 이쪽을 많이 씁니다.</li>
</ul>
<p>여기서 w0, w1은 각 그룹에 속한 픽셀의 비율, μ0, μ1은 각 그룹의 평균 밝기, σ0², σ1²은 각 그룹의 분산입니다. 두 그룹의 크기가 적당하고(w0·w1이 크고) 평균이 멀수록((μ0−μ1)²이 클수록) 점수가 높아집니다.</p>` },
      { type: 'code', title: '예제 4 · Otsu 알고리즘 numpy 로 직접 구현하기', code: String.raw`
import cv2 as cv
import numpy as np

def my_otsu(gray):
    hist = np.bincount(gray.ravel(), minlength=256).astype(np.float64)
    p = hist / hist.sum()                  # 각 밝기의 비율 (합 = 1)
    levels = np.arange(256)
    best_t, best_score = 0, -1.0
    for t in range(256):
        w0 = p[:t + 1].sum()               # 클래스 0: 밝기 0..t
        w1 = 1.0 - w0                      # 클래스 1: 밝기 t+1..255
        if w0 == 0 or w1 == 0:
            continue                       # 한쪽이 비면 나눌 수 없음
        mu0 = (p[:t + 1] * levels[:t + 1]).sum() / w0
        mu1 = (p[t + 1:] * levels[t + 1:]).sum() / w1
        score = w0 * w1 * (mu0 - mu1) ** 2     # 그룹 간 분산
        if score > best_score:
            best_score, best_t = score, t
    return best_t

for name in ['water_coins.jpg', 'box.png', 'sudoku.png', 'lena.jpg']:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    ret, _ = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    print(f'{name:16s} OpenCV = {ret:5.1f}   my_otsu = {my_otsu(gray)}')
`, desc: '<p>직접 만든 함수가 OpenCV와 같은 값을 냅니다. 256번만 반복하면 되므로(픽셀 수와 무관) 파이썬 반복문으로도 빠릅니다. “임계값 t에서 픽셀이 t보다 크면 흰색”이라는 규칙에 맞추려고 클래스 0을 <b>0..t</b>로 잡은 점에 주의하세요.</p>' },
      { type: 'code', title: '예제 5 · 점수 곡선으로 보는 Otsu', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

gray = cv.imread('water_coins.jpg', cv.IMREAD_GRAYSCALE)
hist = np.bincount(gray.ravel(), minlength=256).astype(np.float64)
p = hist / hist.sum()
levels = np.arange(256)

w0 = np.cumsum(p)                        # t 까지의 누적 비율 (모든 t 를 한 번에)
m = np.cumsum(p * levels)                # t 까지의 누적 (비율 × 밝기)
mT = m[-1]                               # 전체 평균 밝기
with np.errstate(divide='ignore', invalid='ignore'):
    between = (mT * w0 - m) ** 2 / (w0 * (1 - w0))   # w0·w1·(μ0-μ1)² 를 정리한 식
between = np.nan_to_num(between)

t_best = int(np.argmax(between))
ret, _ = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
print('곡선의 최댓값 위치:', t_best, '/ OpenCV Otsu:', ret)

fig, ax1 = plt.subplots(figsize=(9, 4))
ax1.bar(levels, hist, width=1, color='gray')
ax1.set_xlabel('intensity'), ax1.set_ylabel('pixel count')
ax2 = ax1.twinx()
ax2.plot(levels, between, 'b-')
ax2.set_ylabel('between-class variance', color='b')
ax1.axvline(t_best, color='r', linestyle='--')
plt.title('Histogram and Otsu score (best t = %d)' % t_best)
plt.show()
`, desc: '<p>회색 막대가 히스토그램, 파란 곡선이 각 t의 그룹 간 분산 점수입니다. 점수가 가장 높은 곳(빨간 점선)이 두 봉우리(동전 약 90, 배경 약 240) 사이에 있습니다. 곡선 윗부분이 넓고 평평한 것은 골짜기가 넓어서 110~200 어디를 골라도 비슷하게 잘 나뉜다는 뜻입니다. 이번에는 반복문 없이 <code>np.cumsum</code>(누적합)으로 모든 t의 점수를 한 번에 계산했습니다.</p>' },
      { type: 'text', html: `<h3>4. 움직이는 영상에서 자동 임계값 확인하기</h3>
<p>Otsu의 진짜 장점은 <b>입력이 계속 바뀌는 상황</b>에서 드러납니다. 웹캠이나 동영상은 프레임마다 밝기가 조금씩 달라지는데, 고정 임계값은 이를 따라가지 못하지만 Otsu는 매 프레임의 히스토그램을 다시 분석해 임계값을 새로 정합니다.
아래 예제는 프레임마다 찾은 t 값을 화면에 표시합니다.</p>` },
      { type: 'code', title: '예제 6 · 웹캠 자동 이진화 (process)', code: String.raw`
import cv2 as cv
import numpy as np

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)                 # 노이즈 줄이고
    ret, th = cv.threshold(blur, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    out = cv.cvtColor(th, cv.COLOR_GRAY2BGR)
    cv.putText(out, f'Otsu t = {ret:.0f}', (10, 35), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    return out
`, desc: '<p>입력을 <b>📷 웹캠</b>으로 바꾸고 흰 종이 위에 어두운 물건을 올려 보세요. 웹캠이 없다면 <b>🎞️ 동영상 cup.mp4</b>(흰 벽 앞에서 움직이는 검은 컵)가 딱 맞는 예입니다. 조명을 밝게/어둡게 바꾸면 <b>t 값이 스스로 따라 움직이는</b> 것을 볼 수 있습니다. 고정 임계값 127과 비교해 보면 Otsu의 장점이 분명해집니다.</p>' },
      { type: 'tip', html: `<p><b>어떤 임계처리를 쓸까?</b></p>
<ul>
<li><b>단순(전역) 임계처리</b> : 조명이 일정하고 알맞은 값을 이미 알 때. 가장 빠름</li>
<li><b>Otsu</b> : 조명은 전체적으로 고르지만 사진마다 밝기가 달라 값을 자동으로 정하고 싶을 때. 히스토그램이 쌍봉이면 최고</li>
<li><b>적응형</b> : 한 사진 안에서 조명이 고르지 않을 때(그림자, 문서 촬영)</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · Otsu 값 주변의 임계값과 비교하기',
        desc: `<p><code>box.png</code>에 Otsu를 적용해 ret를 구한 뒤, <b>ret − 40</b>, <b>ret</b>, <b>ret + 40</b> 세 임계값으로 각각 이진화해 1×3 subplot으로 비교하세요. 제목에 사용한 임계값을 표시합니다.</p>`,
        starter: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

gray = cv.imread('box.png', cv.IMREAD_GRAYSCALE)

# TODO: Otsu 로 자동 임계값 ret 를 구하세요 (지금은 127 고정)
ret = 127

values = [ret - 40, ret, ret + 40]
plt.figure(figsize=(12, 4))
for i, t in enumerate(values):
    _, th = cv.threshold(gray, t, 255, cv.THRESH_BINARY)
    plt.subplot(1, 3, i + 1), plt.imshow(th, 'gray'), plt.title('t = %d' % t), plt.axis('off')
plt.show()
`,
        hint: `<p><code>ret, _ = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)</code>. ret는 실수(float)이므로 제목에 <code>%d</code>로 쓰면 정수로 표시됩니다.</p>`,
        solution: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

gray = cv.imread('box.png', cv.IMREAD_GRAYSCALE)

ret, _ = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)   # 자동 임계값
print('Otsu ret =', ret)

values = [ret - 40, ret, ret + 40]
plt.figure(figsize=(12, 4))
for i, t in enumerate(values):
    _, th = cv.threshold(gray, t, 255, cv.THRESH_BINARY)
    plt.subplot(1, 3, i + 1), plt.imshow(th, 'gray'), plt.title('t = %d' % t), plt.axis('off')
plt.show()
`,
      },
      {
        title: '실습 2 · 노이즈 세기와 블러의 효과 측정',
        desc: `<p>예제 2의 합성 이미지를 노이즈 표준편차 <b>10, 30, 50</b>으로 만들어, 각각 <b>블러 없이 Otsu</b>와 <b>가우시안 블러(5×5) 후 Otsu</b>의 정확도(정답 마스크와 일치하는 픽셀 비율)를 표처럼 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(1)
clean = np.full((300, 400), 40, np.uint8)
cv.circle(clean, (130, 150), 80, 120, -1)
cv.rectangle(clean, (240, 60), (360, 240), 120, -1)
truth = clean > 80

def accuracy(th):
    return 100 * np.mean((th > 0) == truth)

# TODO: 10, 30, 50 모두 반복하도록 바꾸세요
for sigma in [10]:
    img = np.clip(clean + rng.normal(0, sigma, clean.shape), 0, 255).astype(np.uint8)
    ret1, th1 = cv.threshold(img, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    # TODO: 가우시안 블러 후 Otsu 결과 th2 를 구하세요 (지금은 th1 그대로)
    ret2, th2 = ret1, th1
    print(f'sigma={sigma:2d} | Otsu t={ret1:.0f} acc={accuracy(th1):.2f}% | blur+Otsu t={ret2:.0f} acc={accuracy(th2):.2f}%')
`,
        hint: `<p><code>blur = cv.GaussianBlur(img, (5, 5), 0)</code> 뒤에 <code>ret2, th2 = cv.threshold(blur, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)</code>. 노이즈가 클수록 블러의 효과가 커지는지 확인하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

rng = np.random.default_rng(1)
clean = np.full((300, 400), 40, np.uint8)
cv.circle(clean, (130, 150), 80, 120, -1)
cv.rectangle(clean, (240, 60), (360, 240), 120, -1)
truth = clean > 80

def accuracy(th):
    return 100 * np.mean((th > 0) == truth)

for sigma in [10, 30, 50]:
    img = np.clip(clean + rng.normal(0, sigma, clean.shape), 0, 255).astype(np.uint8)
    ret1, th1 = cv.threshold(img, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    blur = cv.GaussianBlur(img, (5, 5), 0)                                   # 노이즈 줄이기
    ret2, th2 = cv.threshold(blur, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    print(f'sigma={sigma:2d} | Otsu t={ret1:.0f} acc={accuracy(th1):.2f}% | blur+Otsu t={ret2:.0f} acc={accuracy(th2):.2f}%')
`,
      },
      {
        title: '실습 3 · 그룹 내 분산 최소화 버전으로 구현하기',
        desc: `<p>공식 튜토리얼은 Otsu를 <b>그룹 내 분산 σw² = w0·σ0² + w1·σ1² 을 최소화</b>하는 방식으로 설명합니다. 이 방식으로 <code>otsu_within()</code>을 완성하고 OpenCV의 ret와 비교하세요.
(부동소수점 오차 때문에 드물게 1 정도 차이가 날 수 있습니다.)</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def otsu_within(gray):
    p = np.bincount(gray.ravel(), minlength=256) / gray.size
    levels = np.arange(256)
    best_t, best_val = 0, np.inf
    for t in range(256):
        p0, p1 = p[:t + 1], p[t + 1:]              # 클래스 0: 0..t, 클래스 1: t+1..255
        l0, l1 = levels[:t + 1], levels[t + 1:]
        w0, w1 = p0.sum(), p1.sum()
        if w0 < 1e-6 or w1 < 1e-6:
            continue
        mu0, mu1 = (p0 * l0).sum() / w0, (p1 * l1).sum() / w1
        # TODO: 각 클래스의 분산 var0, var1 과 그룹 내 분산 val 을 계산하세요
        var0, var1 = 0.0, 0.0
        val = 0.0
        if val < best_val:
            best_val, best_t = val, t
    return best_t

gray = cv.imread('water_coins.jpg', cv.IMREAD_GRAYSCALE)
ret, _ = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
print('OpenCV:', ret, '/ otsu_within:', otsu_within(gray))
`,
        hint: `<p>클래스 0의 분산은 “평균과의 차이 제곱을 비율로 가중 평균”한 값입니다: <code>var0 = (p0 * (l0 - mu0) ** 2).sum() / w0</code>. 같은 방식으로 var1을 구하고 <code>val = w0 * var0 + w1 * var1</code>. 이 값이 가장 작은 t를 고릅니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def otsu_within(gray):
    p = np.bincount(gray.ravel(), minlength=256) / gray.size
    levels = np.arange(256)
    best_t, best_val = 0, np.inf
    for t in range(256):
        p0, p1 = p[:t + 1], p[t + 1:]
        l0, l1 = levels[:t + 1], levels[t + 1:]
        w0, w1 = p0.sum(), p1.sum()
        if w0 < 1e-6 or w1 < 1e-6:
            continue
        mu0, mu1 = (p0 * l0).sum() / w0, (p1 * l1).sum() / w1
        var0 = (p0 * (l0 - mu0) ** 2).sum() / w0      # 클래스 0 의 분산
        var1 = (p1 * (l1 - mu1) ** 2).sum() / w1      # 클래스 1 의 분산
        val = w0 * var0 + w1 * var1                   # 그룹 내 분산 (작을수록 좋음)
        if val < best_val:
            best_val, best_t = val, t
    return best_t

for name in ['water_coins.jpg', 'box.png', 'lena.jpg']:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    ret, _ = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    print(f'{name:16s} OpenCV: {ret:.0f} / otsu_within: {otsu_within(gray)}')
`,
      },
    ],
    quiz: [
      { q: 'ret, th = cv.threshold(gray, 127, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)에서 ret의 값은?', options: ['항상 127', 'Otsu가 자동으로 계산한 임계값', '흰 픽셀의 개수', '항상 255'], answer: 1, explain: 'THRESH_OTSU를 쓰면 입력한 thresh(127)는 무시되고, 계산된 최적 임계값이 ret로 반환됩니다.' },
      { q: 'Otsu 이진화가 가장 잘 동작하는 히스토그램의 모양은?', options: ['모든 밝기에 고르게 퍼진 모양', '봉우리가 두 개인 쌍봉(bimodal) 모양', '봉우리가 하나인 모양', '값이 모두 0인 모양'], answer: 1, explain: 'Otsu는 두 그룹(배경/물체)으로 가장 잘 나뉘는 지점을 찾으므로, 두 봉우리 사이에 골짜기가 있는 쌍봉 분포에서 효과적입니다.' },
      { q: '노이즈가 심한 이미지에서 Otsu 전에 가우시안 블러를 하는 이유는?', options: ['이미지를 더 밝게 하려고', '히스토그램의 봉우리를 좁혀 골짜기를 뚜렷하게 하고 점 잡음을 줄이려고', '컬러 이미지로 바꾸려고', 'Otsu는 블러된 이미지만 입력받기 때문에'], answer: 1, explain: '블러는 이웃 픽셀을 평균 내어 노이즈를 줄이므로 각 그룹의 밝기가 평균값 근처로 모여 봉우리가 뾰족해지고, 임계값 결과도 깔끔해집니다.' },
      { q: 'Otsu 알고리즘이 임계값 t를 고르는 기준으로 옳은 것은?', options: ['두 그룹의 픽셀 수가 정확히 같아지는 t', '그룹 내 분산이 최소(= 그룹 간 분산이 최대)가 되는 t', '히스토그램에서 가장 높은 막대의 위치', '이미지 평균 밝기'], answer: 1, explain: '각 그룹 안은 비슷하고 그룹끼리는 멀리 떨어지도록, 그룹 내 분산을 최소화(그룹 간 분산 최대화)하는 t를 모든 후보 중에서 고릅니다.' },
    ],
  },
  // =====================================================================
  // w2-7 이미지 스무딩 Ⅰ
  // =====================================================================
  {
    id: 'w2-7',
    summary: '작은 숫자 표(커널)를 이미지 위에서 미끄러뜨리며 계산하는 2D 컨볼루션(필터링)을 이해하고, 평균 블러와 가우시안 블러로 이미지를 부드럽게 만듭니다. 커널을 직접 설계해 샤프닝·엠보싱 효과도 만들어 봅니다.',
    goals: [
      '커널(kernel)과 2D 컨볼루션(필터링)의 계산 과정을 작은 숫자 예로 설명할 수 있다',
      'cv.filter2D()로 임의의 커널을 이미지에 적용할 수 있다',
      'cv.blur(), cv.boxFilter(), cv.GaussianBlur()의 차이와 인자(ksize, sigma)를 이해하고 사용할 수 있다',
      '커널 가중치의 합이 결과 밝기에 주는 영향을 알고 샤프닝·엠보싱 커널을 만들 수 있다',
    ],
    schedule: [['도입 · 필터란', 5], ['컨볼루션 개념 · 숫자 예제', 12], ['평균 · 가우시안 블러', 13], ['나만의 커널 · 실습 과제', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 필터와 2D 컨볼루션(Convolution)</h3>
<p>1차원 신호처럼 이미지도 <b>필터</b>로 가공할 수 있습니다. 공식 튜토리얼은 두 종류를 소개합니다.</p>
<ul>
<li><b>저역 통과 필터(LPF, Low-Pass Filter)</b> : 급격한 변화(노이즈, 잔무늬)를 줄여 <b>부드럽게(블러)</b> 만듭니다. 오늘의 주제!</li>
<li><b>고역 통과 필터(HPF, High-Pass Filter)</b> : 급격한 변화(경계, 엣지)를 강조합니다. 3주차 엣지 검출로 이어집니다.</li>
</ul>
<p>필터링의 핵심은 <b>커널(kernel)</b>이라고 부르는 작은 숫자 표(예: 3×3)입니다. 계산 방법은 다음과 같습니다.</p>
<ol>
<li>커널의 가운데를 이미지의 한 픽셀 위에 올립니다.</li>
<li>커널과 겹친 픽셀들을 <b>같은 위치의 커널 값과 곱해서 모두 더합니다</b>.</li>
<li>그 합을 결과 이미지의 같은 위치 픽셀 값으로 씁니다.</li>
<li>커널을 한 칸씩 옮기며 모든 픽셀에 반복합니다.</li>
</ol>
<p>예를 들어 모든 칸이 1/9인 3×3 커널은 “나와 이웃 8개, 총 9개 픽셀의 <b>평균</b>”을 구합니다. 주변과 동떨어진 값(노이즈)이 이웃과 섞여 튀지 않게 됩니다.</p>` },
      { type: 'code', title: '예제 1 · 숫자로 따라가는 컨볼루션', code: String.raw`
import cv2 as cv
import numpy as np

img = np.full((5, 5), 10, np.uint8)      # 모두 10 인 5×5 이미지
img[2, 2] = 100                          # 가운데에 튀는 값(노이즈) 하나
kernel = np.ones((3, 3), np.float32) / 9  # 3×3 평균 커널

print('입력:\n', img)
print('커널:\n', np.round(kernel, 3))

# (2, 2) 위치의 결과를 손으로 계산: 겹친 3×3 영역 × 커널 → 합
patch = img[1:4, 1:4].astype(np.float32)
print('겹친 영역:\n', patch)
print('손 계산 결과:', (patch * kernel).sum(), ' = (10×8 + 100) / 9')

out = cv.filter2D(img, -1, kernel)       # -1: 입력과 같은 자료형으로 출력
print('filter2D 결과:\n', out)
`, desc: '<p>100이던 튀는 값이 20으로 줄고, 그 대신 주변 8칸이 10 → 20으로 조금씩 올라갔습니다. 노이즈가 “퍼져서 희석”된 것입니다. 이것이 블러가 노이즈를 줄이는 원리이자, 동시에 <b>경계를 흐리게 만드는 이유</b>입니다. 테두리 픽셀은 이미지 바깥을 반사(mirror)해서 채운 뒤 계산합니다.</p>' },
      { type: 'code', title: '예제 2 · 5×5 평균 커널로 filter2D (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('opencv-logo.png')           # 투명 배경은 검정으로 읽힘
assert img is not None, "file could not be read, check with os.path.exists()"

kernel = np.ones((5, 5), np.float32) / 25    # 25칸 평균
dst = cv.filter2D(img, -1, kernel)

plt.figure(figsize=(9, 6))
plt.subplot(121), plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB)), plt.title('Original')
plt.xticks([]), plt.yticks([])
plt.subplot(122), plt.imshow(cv.cvtColor(dst, cv.COLOR_BGR2RGB)), plt.title('Averaging')
plt.xticks([]), plt.yticks([])
plt.show()
`, desc: '<p><code>cv.filter2D(src, ddepth, kernel)</code>에서 ddepth=-1은 “입력과 같은 깊이(uint8)”를 뜻합니다. 컬러 이미지는 B, G, R 채널마다 따로 같은 커널이 적용됩니다. 글자 가장자리가 부드럽게 번진 것을 확인하세요.</p>' },
      { type: 'table', head: ['함수', '주요 인자', '설명'], rows: [
        ['<code>cv.filter2D(src, ddepth, kernel)</code>', 'ddepth: -1(입력과 같게), kernel: float32 배열', '임의의 커널로 필터링(가장 일반적)'],
        ['<code>cv.blur(src, ksize)</code>', 'ksize: (너비, 높이) 예) (5, 5)', '정규화된 평균 필터. filter2D + 1/(w·h) 커널과 같음'],
        ['<code>cv.boxFilter(src, ddepth, ksize, normalize=True)</code>', 'normalize=False면 평균 대신 합계', 'normalize=True일 때 blur와 같음'],
        ['<code>cv.GaussianBlur(src, ksize, sigmaX, sigmaY=0)</code>', 'ksize: <b>양의 홀수</b> (또는 (0,0)이면 sigma로 계산), sigmaX=0이면 ksize로 자동 계산', '가운데일수록 가중치가 큰 종 모양 커널. 가우시안 노이즈 제거에 효과적'],
      ] },
      { type: 'text', html: `<h3>2. 평균 블러: cv.blur()와 cv.boxFilter()</h3>
<p>매번 커널을 직접 만들 필요 없이 <code>cv.blur(img, (5, 5))</code>라고 쓰면 5×5 평균 필터가 적용됩니다. 커널 모양이 “상자(box)”처럼 모든 칸이 같아서 <b>박스 필터</b>라고도 부릅니다.
커널이 클수록 더 넓은 범위를 평균하므로 더 많이 흐려집니다.</p>` },
      { type: 'code', title: '예제 3 · blur = boxFilter, 커널 크기에 따른 변화', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('butterfly.jpg')

b1 = cv.blur(img, (5, 5))
b2 = cv.boxFilter(img, -1, (5, 5))                          # normalize=True (기본값)
b3 = cv.filter2D(img, -1, np.ones((5, 5), np.float32) / 25)
print('blur == boxFilter :', np.array_equal(b1, b2))
print('blur 와 filter2D 최대 차이:', np.abs(b1.astype(int) - b3.astype(int)).max())

sizes = [1, 5, 15, 31]
plt.figure(figsize=(12, 4))
for i, k in enumerate(sizes):
    plt.subplot(1, 4, i + 1)
    plt.imshow(cv.cvtColor(cv.blur(img, (k, k)), cv.COLOR_BGR2RGB))
    plt.title('blur %dx%d' % (k, k))
    plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>세 방법은 사실상 같은 결과입니다(반올림 차이 정도). 1×1은 자기 자신만 평균하므로 원본 그대로입니다. 커널이 31×31이 되면 나비 날개의 무늬가 거의 사라집니다.</p>' },
      { type: 'text', html: `<h3>3. 가우시안 블러: cv.GaussianBlur()</h3>
<p>평균 블러는 멀리 있는 이웃과 바로 옆 이웃을 <b>똑같이</b> 취급합니다. 그런데 보통은 가까운 픽셀일수록 나와 비슷하겠죠?
<b>가우시안 블러</b>는 종 모양(정규분포) 곡선을 따라 <b>가운데는 크게, 멀어질수록 작게</b> 가중치를 줍니다. 그래서 같은 크기라도 평균 블러보다 자연스럽고, 가우시안 노이즈 제거에 매우 효과적입니다.</p>
<ul>
<li><code>ksize</code> : 커널 크기. <b>양수이면서 홀수</b>여야 합니다. 예) (3, 3), (5, 5), (9, 9)</li>
<li><code>sigmaX</code> : 종의 폭(표준편차). 클수록 멀리까지 가중치가 퍼져 더 흐려집니다. <b>0이면 ksize로부터 자동 계산</b></li>
<li><code>ksize=(0, 0)</code>으로 두고 sigma만 주면, 반대로 sigma에 맞는 크기를 자동으로 정합니다.</li>
</ul>` },
      { type: 'code', title: '예제 4 · 가우시안 커널 들여다보기와 블러 비교', code: String.raw`
import cv2 as cv
import numpy as np

k1d = cv.getGaussianKernel(5, 0)            # 5칸짜리 1차원 가우시안 (sigma 자동)
k2d = k1d @ k1d.T                           # 1D × 1D → 2D 커널
np.set_printoptions(precision=4, suppress=True)
print('1D 커널:', k1d.ravel(), ' 합 =', k1d.sum())
print('2D 커널 × 256:\n', k2d * 256)          # 정수로 보면 [1 4 6 4 1] 패턴

img = cv.imread('lena.jpg')
avg = cv.blur(img, (9, 9))
gau = cv.GaussianBlur(img, (9, 9), 0)
gau_big = cv.GaussianBlur(img, (0, 0), 5)   # sigma=5 에 맞는 크기 자동 결정

crop = lambda im: im[200:380, 200:380]      # 눈 주변만 잘라서 비교
cv.imshow('original | blur 9x9 | Gaussian 9x9 | Gaussian sigma=5',
          np.hstack([crop(img), crop(avg), crop(gau), crop(gau_big)]))
`, desc: '<p>2D 가우시안 커널은 가운데(36/256)가 가장 크고 모서리(1/256)가 가장 작습니다. 같은 9×9라도 평균 블러는 더 뭉개지고, 가우시안은 윤곽이 좀 더 남아 있습니다. sigma를 키우면 더 강하게 흐려집니다.</p>' },
      { type: 'warn', html: `<ul>
<li><b>GaussianBlur의 ksize는 홀수만!</b> <code>(4, 4)</code>를 넣으면 <code>Assertion failed ... ksize.width % 2 == 1</code> 오류가 납니다. (중심 칸이 있어야 하기 때문)</li>
<li><code>cv.blur</code>는 짝수 크기도 오류 없이 동작하지만 중심이 반 칸 어긋납니다. <b>습관적으로 홀수</b>를 쓰세요.</li>
<li>ksize는 <b>(너비, 높이)</b> 튜플입니다. <code>cv.blur(img, 5)</code>처럼 숫자 하나만 넣으면 오류가 납니다. (다음 교시의 medianBlur는 반대로 숫자 하나!)</li>
<li>커널이 클수록 느려집니다. 웹캠 처리에서는 적당한 크기를 쓰세요.</li>
</ul>` },
      { type: 'text', html: `<h3>4. 나만의 커널 만들기: 샤프닝 · 엠보싱</h3>
<p><code>filter2D</code>에 넣는 커널만 바꾸면 전혀 다른 효과가 납니다. 커널을 설계할 때 기억할 규칙은 <b>“가중치의 합”</b>입니다.</p>
<ul>
<li><b>합 = 1</b> : 평평한 영역의 밝기가 그대로 유지됩니다. (블러, 샤프닝, 엠보싱)</li>
<li><b>합 = 0</b> : 평평한 영역은 0(검정)이 되고 <b>변화가 있는 곳(경계)만</b> 남습니다. (엣지 검출)</li>
<li><b>합 &gt; 1</b> : 전체가 밝아지고, <b>합 &lt; 1</b> : 어두워집니다.</li>
</ul>
<p><b>샤프닝</b> 커널 <code>[[0,-1,0],[-1,5,-1],[0,-1,0]]</code>은 “나 자신 × 5 − 상하좌우 이웃”이라서, 주변과 다른 픽셀일수록 차이를 더 키워 경계를 또렷하게 합니다.</p>` },
      { type: 'code', title: '예제 5 · 샤프닝 · 엠보싱 · 엣지 커널', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('lena.jpg', cv.IMREAD_GRAYSCALE)

kernels = {
    'sharpen': np.array([[0, -1, 0],
                         [-1, 5, -1],
                         [0, -1, 0]], np.float32),          # 합 = 1
    'emboss':  np.array([[-2, -1, 0],
                         [-1, 1, 1],
                         [0, 1, 2]], np.float32),           # 합 = 1
    'edge':    np.array([[-1, -1, -1],
                         [-1, 8, -1],
                         [-1, -1, -1]], np.float32),        # 합 = 0
}

plt.figure(figsize=(12, 4))
plt.subplot(1, 4, 1), plt.imshow(img, 'gray', vmin=0, vmax=255), plt.title('Original'), plt.axis('off')
for i, (name, k) in enumerate(kernels.items()):
    out = cv.filter2D(img, -1, k)        # uint8 출력: 0 미만은 0, 255 초과는 255 로 잘림
    print(f'{name:8s} 커널 합 = {k.sum():.0f}')
    plt.subplot(1, 4, i + 2), plt.imshow(out, 'gray', vmin=0, vmax=255), plt.title(name), plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>샤프닝은 머리카락과 모자 깃털이 또렷해지고, 엠보싱은 도장처럼 튀어나온 느낌, 엣지 커널은 경계선만 하얗게 남습니다. 엣지 결과에서 음수 값은 0으로 잘려 사라졌는데, 이를 제대로 다루는 방법(<code>CV_64F</code>, <code>convertScaleAbs</code>)은 3주차 “이미지 그래디언트”에서 배웁니다.</p>' },
      { type: 'code', title: '예제 6 · 트랙바로 블러 크기 조절 (process)', code: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('k (size=2k+1)', 'controls', 3, 15, nothing)   # 커널 크기 = 2k+1 → 1~31
cv.createTrackbar('0 box / 1 gauss', 'controls', 1, 1, nothing)

def process(frame):
    k = cv.getTrackbarPos('k (size=2k+1)', 'controls')
    mode = cv.getTrackbarPos('0 box / 1 gauss', 'controls')
    size = 2 * k + 1                                            # 항상 홀수
    t0 = cv.getTickCount()
    if mode == 0:
        out = cv.blur(frame, (size, size))
    else:
        out = cv.GaussianBlur(frame, (size, size), 0)
    ms = (cv.getTickCount() - t0) / cv.getTickFrequency() * 1000
    name = 'box' if mode == 0 else 'gauss'
    cv.putText(out, f'{name} {size}x{size}  {ms:.1f} ms', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return out
`, desc: '<p>입력을 이미지, 📷 웹캠, 🎞️ 동영상(Megamind.mp4 등)으로 바꿔 크기를 키워 보세요. 트랙바 값 k를 <code>2k+1</code>로 바꿔 항상 홀수가 되게 했습니다. 화면의 ms 값으로 커널 크기와 속도의 관계도 확인할 수 있습니다(박스 필터는 크기가 커져도 거의 느려지지 않도록 최적화되어 있습니다).</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 얼굴 흐리기 (개인정보 보호)',
        desc: `<p><code>messi5.jpg</code>에서 얼굴 영역 <code>img[70:140, 210:270]</code>만 강하게 가우시안 블러(예: 31×31) 처리해 원본 이미지에 다시 넣으세요. 뉴스 화면의 얼굴 가리기처럼 보이면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
y1, y2, x1, x2 = 70, 140, 210, 270
roi = img[y1:y2, x1:x2]                 # 얼굴 부분 (1주차 ROI)

# TODO: roi 를 GaussianBlur(31×31) 로 흐리게 만든 결과를 blurred 에 저장하세요
blurred = roi

img[y1:y2, x1:x2] = blurred             # 원본 위치에 다시 넣기
cv.imshow('privacy', img)
`,
        hint: `<p><code>blurred = cv.GaussianBlur(roi, (31, 31), 0)</code>. 커널 크기가 ROI보다 커도 동작하지만 너무 작으면(5×5) 얼굴이 알아보입니다. 더 나아가 “모자이크”는 ROI를 아주 작게 줄였다가(<code>cv.resize</code>, INTER_AREA) 다시 원래 크기로 키우면(INTER_NEAREST) 만들 수 있습니다.</p>`,
        solution: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
mosaic_img = img.copy()
y1, y2, x1, x2 = 70, 140, 210, 270
roi = img[y1:y2, x1:x2]

blurred = cv.GaussianBlur(roi, (31, 31), 0)       # 강한 가우시안 블러
img[y1:y2, x1:x2] = blurred

# 보너스: 모자이크 (작게 줄였다가 계단식으로 키우기)
h, w = roi.shape[:2]
tiny = cv.resize(roi, (6, 7), interpolation=cv.INTER_AREA)
mosaic_img[y1:y2, x1:x2] = cv.resize(tiny, (w, h), interpolation=cv.INTER_NEAREST)

cv.imshow('privacy', img)
cv.imshow('mosaic', mosaic_img)
`,
      },
      {
        title: '실습 2 · 언샤프 마스킹으로 선명하게',
        desc: `<p>사진 편집 프로그램의 “선명하게(Unsharp Mask)”는 <b>원본 + amount × (원본 − 블러)</b>로 만듭니다. 즉 블러로 사라지는 “디테일”을 원본에 더 얹어 주는 것이죠. 이를 정리하면 <code>cv.addWeighted(img, 1 + amount, blur, -amount, 0)</code>입니다.
<code>butterfly.jpg</code>에 amount = 1.5로 적용하고 원본과 나란히 비교하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('butterfly.jpg')
amount = 1.5

# TODO: 가우시안 블러(9×9 정도) 결과를 blur 에 넣으세요 (지금은 원본 복사라 효과 없음)
blur = img.copy()

sharp = cv.addWeighted(img, 1 + amount, blur, -amount, 0)
cv.imshow('original | unsharp', np.hstack([img, sharp]))
`,
        hint: `<p><code>blur = cv.GaussianBlur(img, (9, 9), 0)</code>. addWeighted는 결과를 0~255로 자동으로 잘라 주므로 음수 가중치를 써도 안전합니다. amount를 0.5, 3으로 바꿔 과한 샤프닝의 부작용(테두리 번쩍임)도 관찰해 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('butterfly.jpg')
amount = 1.5

blur = cv.GaussianBlur(img, (9, 9), 0)                        # 디테일이 빠진 이미지
sharp = cv.addWeighted(img, 1 + amount, blur, -amount, 0)     # 원본 + amount × (원본 - 블러)
cv.imshow('original | unsharp', np.hstack([img, sharp]))
`,
      },
      {
        title: '실습 3 · 3×3 평균 필터를 numpy 로 직접 구현',
        desc: `<p>흑백 <code>lena.jpg</code>에 대해, 9개의 이웃 픽셀을 <b>배열 슬라이싱으로 한꺼번에 더해</b> 3×3 평균 필터를 구현하세요(이중 for문으로 픽셀을 도는 방법은 너무 느립니다).
테두리 1픽셀은 제외하고 <code>cv.blur(gray, (3, 3))</code> 결과와의 최대 차이를 출력합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('lena.jpg', cv.IMREAD_GRAYSCALE).astype(np.float32)
H, W = gray.shape

total = np.zeros((H - 2, W - 2), np.float32)
# TODO: dy, dx 가 각각 -1, 0, 1 인 9가지 경우를 모두 더하도록 반복문을 만드세요 (지금은 가운데만)
for dy in [0]:
    for dx in [0]:
        total += gray[1 + dy:H - 1 + dy, 1 + dx:W - 1 + dx]
mine = total / 9

ref = cv.blur(gray, (3, 3))[1:-1, 1:-1]      # 테두리 제외
print('최대 차이:', np.abs(mine - ref).max())
cv.imshow('mine', mine.astype(np.uint8))
`,
        hint: `<p><code>for dy in [-1, 0, 1]:</code>, <code>for dx in [-1, 0, 1]:</code>. <code>gray[1+dy : H-1+dy, 1+dx : W-1+dx]</code>는 “모든 내부 픽셀에 대해 (dy, dx)만큼 떨어진 이웃”을 모은 배열입니다. 반복은 9번뿐이고, 각 덧셈은 numpy가 한꺼번에 처리하므로 빠릅니다. 최대 차이가 0(또는 0.001 이하)이면 성공입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

gray = cv.imread('lena.jpg', cv.IMREAD_GRAYSCALE).astype(np.float32)
H, W = gray.shape

total = np.zeros((H - 2, W - 2), np.float32)
for dy in [-1, 0, 1]:
    for dx in [-1, 0, 1]:
        total += gray[1 + dy:H - 1 + dy, 1 + dx:W - 1 + dx]   # (dy, dx) 방향 이웃을 한꺼번에
mine = total / 9

ref = cv.blur(gray, (3, 3))[1:-1, 1:-1]
print('최대 차이:', np.abs(mine - ref).max())
cv.imshow('mine', mine.astype(np.uint8))
`,
      },
    ],
    quiz: [
      { q: '3×3 평균 커널(모든 값 1/9)을 가운데 값이 100이고 나머지 8개가 10인 영역에 적용하면 가운데 결과는?', options: ['10', '20', '55', '100'], answer: 1, explain: '(10 × 8 + 100) / 9 = 180 / 9 = 20입니다.' },
      { q: 'cv.GaussianBlur(img, (4, 4), 0)을 실행하면?', options: ['4×4 가우시안 블러가 적용된다', '자동으로 5×5로 바뀐다', 'ksize가 홀수가 아니라 오류가 난다', '블러 없이 원본이 반환된다'], answer: 2, explain: '가우시안 커널은 중심이 있어야 하므로 ksize는 양의 홀수여야 합니다. (4, 4)는 Assertion 오류가 납니다.' },
      { q: '평균 블러와 비교한 가우시안 블러의 특징으로 옳은 것은?', options: ['모든 이웃에 같은 가중치를 준다', '가까운 이웃일수록 큰 가중치를 준다', '항상 평균 블러보다 더 많이 흐려진다', '흑백 이미지에만 쓸 수 있다'], answer: 1, explain: '가우시안 커널은 종 모양으로 중심에 가까울수록 가중치가 큽니다. 그래서 같은 크기에서 평균 블러보다 자연스럽게 흐려집니다.' },
      { q: '커널 가중치의 합이 0인 커널(예: 가운데 8, 나머지 −1)을 적용한 결과의 특징은?', options: ['원본과 같은 밝기의 흐린 이미지', '평평한 영역은 검게 되고 경계만 남는다', '전체가 2배 밝아진다', '색이 반전된다'], answer: 1, explain: '합이 0이면 모든 이웃이 같은 값인 평평한 영역에서 결과가 0이 되고, 값이 바뀌는 경계에서만 큰 값이 나옵니다. 엣지 검출 커널의 원리입니다.' },
    ],
  },
  // =====================================================================
  // w2-8 이미지 스무딩 Ⅱ와 2주차 정리
  // =====================================================================
  {
    id: 'w2-8',
    summary: '점 잡음(salt-and-pepper)에 강한 미디언 블러와, 경계를 살리면서 노이즈를 줄이는 양방향 필터를 배웁니다. 네 가지 필터를 같은 노이즈 이미지에서 수치(PSNR)로 비교하고, 2주차 내용을 정리한 뒤 “컬러 스플래시” 미니 챌린지에 도전합니다.',
    goals: [
      '가우시안 노이즈와 소금-후추(salt-and-pepper) 노이즈의 차이를 설명하고 numpy로 만들 수 있다',
      'cv.medianBlur()가 점 잡음에 강한 이유(평균 vs 중앙값)를 설명하고 사용할 수 있다',
      'cv.bilateralFilter()가 경계를 보존하는 원리와 d, sigmaColor, sigmaSpace 인자를 이해할 수 있다',
      '노이즈 종류에 맞는 필터를 고르고 PSNR로 결과를 비교할 수 있다',
      '2주차에 배운 색 공간·기하 변환·임계처리·스무딩을 조합해 작은 응용을 만들 수 있다',
    ],
    schedule: [['도입 · 노이즈의 종류', 5], ['미디언 블러', 8], ['양방향 필터', 10], ['필터 비교 실험', 7], ['2주차 정리 · 미니 챌린지', 15], ['퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 노이즈의 두 얼굴</h3>
<ul>
<li><b>가우시안 노이즈(Gaussian noise)</b> : 모든 픽셀에 조금씩 더해지는 자글자글한 잡음. 어두운 곳에서 찍은 사진의 입자감이 대표적입니다. 원래 값 근처에서 ±조금씩 흔들립니다.</li>
<li><b>소금-후추 노이즈(Salt-and-pepper noise)</b> : 일부 픽셀이 갑자기 <b>완전한 흰색(소금)이나 검정(후추)</b>으로 바뀌는 잡음. 센서 불량 픽셀이나 전송 오류에서 생깁니다.</li>
</ul>
<p>지난 시간의 평균·가우시안 블러는 가우시안 노이즈에는 효과적이지만, 소금-후추 노이즈에는 약합니다. 255라는 극단적인 값이 평균에 섞여 들어가 주변까지 <b>회색 얼룩</b>으로 번지기 때문입니다.</p>` },
      { type: 'code', title: '예제 1 · 소금-후추 노이즈 만들기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('lena.jpg')
rng = np.random.default_rng(0)             # 같은 결과가 나오도록 시드 고정

amount = 0.05                              # 전체 픽셀의 5% 를 망가뜨리기
r = rng.random(img.shape[:2])              # 픽셀마다 0~1 사이 난수 (높이×너비)
noisy = img.copy()
noisy[r < amount / 2] = 0                  # 2.5% → 후추(검정)
noisy[r > 1 - amount / 2] = 255            # 2.5% → 소금(흰색)

print('검정 점 비율: %.2f %%' % (100 * np.mean(r < amount / 2)))
print('PSNR(원본, 노이즈) = %.2f dB' % cv.PSNR(img, noisy))
cv.imwrite('lena_sp.png', noisy)           # 다음 예제에서 다시 쓰려고 저장
cv.imshow('salt and pepper', noisy)
`, desc: '<p><code>noisy[조건 배열] = 값</code>은 조건이 True인 위치에만 값을 넣는 numpy의 불리언 인덱싱입니다. 2차원 조건으로 3채널 이미지를 인덱싱하면 B, G, R이 모두 바뀝니다. <b>PSNR</b>(최대 신호 대 잡음비)은 원본과 얼마나 비슷한지를 나타내는 수치로, <b>클수록 원본에 가깝습니다</b>(보통 30dB 이상이면 꽤 좋음).</p>' },
      { type: 'text', html: `<h3>2. 미디언 블러: cv.medianBlur()</h3>
<p>미디언(median, 중앙값) 블러는 커널 안의 값들을 <b>크기 순으로 줄 세운 뒤 한가운데 값</b>을 고릅니다.</p>
<p>예) 이웃 9개 값 <code>[12, 10, 11, 255, 13, 11, 10, 12, 11]</code><br>
· 평균 = 38.3 → 255 하나 때문에 크게 끌려 올라감<br>
· 정렬하면 <code>[10, 10, 11, 11, <b>11</b>, 12, 12, 13, 255]</code> → 중앙값 = <b>11</b> → 255는 무시됨</p>
<p>극단적인 값이 줄의 끝으로 밀려나 선택되지 않으므로 소금-후추 노이즈를 거의 완벽히 지웁니다. 또한 결과가 항상 <b>실제로 존재하던 픽셀 값 중 하나</b>라 새로운 색이 만들어지지 않고, 경계도 평균 블러보다 덜 흐려집니다.</p>
<pre>dst = cv.medianBlur(src, ksize)    # ksize: 1보다 큰 홀수 정수 하나 (3, 5, 7 …)</pre>` },
      { type: 'code', title: '예제 2 · 평균 vs 중앙값, 그리고 미디언 블러의 위력', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

values = np.array([12, 10, 11, 255, 13, 11, 10, 12, 11])
print('평균  :', values.mean().round(1))
print('중앙값:', np.median(values))

img = cv.imread('lena.jpg')
rng = np.random.default_rng(0)
r = rng.random(img.shape[:2])
noisy = img.copy()
noisy[r < 0.025] = 0
noisy[r > 0.975] = 255

results = [('Noisy', noisy),
           ('blur 5x5', cv.blur(noisy, (5, 5))),
           ('GaussianBlur 5x5', cv.GaussianBlur(noisy, (5, 5), 0)),
           ('medianBlur 3', cv.medianBlur(noisy, 3))]
plt.figure(figsize=(10, 10))
for i, (name, im) in enumerate(results):
    plt.subplot(2, 2, i + 1)
    plt.imshow(cv.cvtColor(im, cv.COLOR_BGR2RGB))
    plt.title('%s (PSNR %.1f dB)' % (name, cv.PSNR(img, im)))
    plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>평균·가우시안 블러는 점들이 회색 얼룩으로 번져 남아 있지만, 3×3 미디언 블러는 점이 거의 모두 사라지고 PSNR도 가장 높습니다. 튜토리얼 표현대로 “소금-후추 노이즈 제거에 매우 효과적”입니다.</p>' },
      { type: 'warn', html: `<ul>
<li><code>cv.medianBlur</code>의 ksize는 <b>튜플이 아니라 정수 하나</b>이고, <b>1보다 큰 홀수</b>여야 합니다. <code>cv.medianBlur(img, (5, 5))</code>나 <code>cv.medianBlur(img, 4)</code>는 오류입니다.</li>
<li>ksize가 5보다 크면 8비트(uint8) 이미지만 처리할 수 있습니다.</li>
<li>ksize를 너무 키우면 가는 선이나 작은 점 같은 <b>진짜 디테일도 노이즈처럼 지워집니다</b>. 결과가 유화처럼 뭉개지면 크기를 줄이세요.</li>
</ul>` },
      { type: 'text', html: `<h3>3. 양방향 필터: cv.bilateralFilter()</h3>
<p>지금까지의 블러는 모두 <b>경계까지 흐리게</b> 만든다는 공통 약점이 있습니다. 가우시안 필터는 “가까운 픽셀일수록 큰 가중치”라는 <b>거리</b>만 보기 때문에, 바로 옆이 전혀 다른 물체(경계 너머)여도 똑같이 섞어 버립니다.</p>
<p><b>양방향 필터(Bilateral Filter)</b>는 가우시안을 <b>두 개</b> 씁니다.</p>
<ol>
<li><b>공간 가우시안(sigmaSpace)</b> : 가까운 픽셀일수록 큰 가중치 — 일반 가우시안 블러와 같음</li>
<li><b>밝기(색) 가우시안(sigmaColor)</b> : <b>나와 밝기가 비슷한 픽셀일수록</b> 큰 가중치</li>
</ol>
<p>두 가중치를 곱해서 쓰므로, 경계 너머의 픽셀은 가깝더라도 밝기 차이가 커서 가중치가 거의 0이 됩니다. 그래서 <b>평평한 영역의 노이즈는 줄이고 경계는 날카롭게 유지</b>합니다. 대신 픽셀마다 가중치를 새로 계산해야 해서 <b>다른 필터보다 훨씬 느립니다</b>.</p>
<pre>dst = cv.bilateralFilter(src, d, sigmaColor, sigmaSpace)</pre>
<ul>
<li><code>d</code> : 이웃 지름(픽셀). 실시간이면 5, 오프라인이면 9 정도 (튜토리얼: 9)</li>
<li><code>sigmaColor</code> : 이 정도 밝기 차이까지는 “같은 영역”으로 섞음. 작을수록 경계를 더 엄격히 보존 (튜토리얼: 75)</li>
<li><code>sigmaSpace</code> : 공간 가우시안의 폭 (튜토리얼: 75)</li>
</ul>` },
      { type: 'code', title: '예제 3 · 경계 단면으로 보는 가우시안 vs 양방향 필터', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# 왼쪽 60, 오른쪽 180 인 계단 경계 + 가우시안 노이즈
rng = np.random.default_rng(0)
clean = np.zeros((100, 200), np.uint8)
clean[:, :100] = 60
clean[:, 100:] = 180
img = np.clip(clean + rng.normal(0, 15, clean.shape), 0, 255).astype(np.uint8)

gauss = cv.GaussianBlur(img, (9, 9), 0)
bil75 = cv.bilateralFilter(img, 9, 75, 75)       # 튜토리얼 값
bil30 = cv.bilateralFilter(img, 9, 30, 75)       # sigmaColor 를 작게 → 경계 더 엄격히 보존

print('평평한 부분 표준편차(노이즈 양): 원본 %.1f, 가우시안 %.1f, 양방향(75) %.1f, 양방향(30) %.1f'
      % (img[:, 20:80].std(), gauss[:, 20:80].std(), bil75[:, 20:80].std(), bil30[:, 20:80].std()))

x = np.arange(80, 120)
plt.figure(figsize=(9, 4))
plt.plot(x, img[50, 80:120], 'o-', color='lightgray', label='noisy')
plt.plot(x, gauss[50, 80:120], label='GaussianBlur 9x9')
plt.plot(x, bil75[50, 80:120], label='bilateral sigmaColor=75')
plt.plot(x, bil30[50, 80:120], label='bilateral sigmaColor=30')
plt.xlabel('x (row 50)'), plt.ylabel('intensity'), plt.legend()
plt.title('Edge profile')
plt.show()
`, desc: '<p>그래프는 이미지 50번째 행의 x=80~120 밝기입니다. 가우시안(파랑)은 계단이 <b>완만한 비탈</b>이 되었지만, 양방향 필터(주황)는 계단 모양을 더 잘 유지하고, sigmaColor=30(초록)일 때는 거의 수직 계단입니다. 평평한 부분의 노이즈(표준편차)는 셋 다 비슷하게 줄었습니다.</p>' },
      { type: 'code', title: '예제 4 · 실제 사진에서 양방향 필터 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('baboon.jpg')
rng = np.random.default_rng(1)
noisy = np.clip(img + rng.normal(0, 20, img.shape), 0, 255).astype(np.uint8)   # 가우시안 노이즈

cv.GaussianBlur(noisy, (9, 9), 0)            # 워밍업: 첫 호출은 준비 시간이 섞여 느리게 측정됨
cv.bilateralFilter(noisy, 9, 75, 75)
t0 = cv.getTickCount()
gauss = cv.GaussianBlur(noisy, (9, 9), 0)
t1 = cv.getTickCount()
bil = cv.bilateralFilter(noisy, 9, 75, 75)
t2 = cv.getTickCount()
f = cv.getTickFrequency() / 1000
print('GaussianBlur  : %.1f ms, PSNR %.2f dB' % ((t1 - t0) / f, cv.PSNR(img, gauss)))
print('bilateral     : %.1f ms, PSNR %.2f dB' % ((t2 - t1) / f, cv.PSNR(img, bil)))

crop = lambda im: im[60:260, 150:350]        # 눈과 코 주변
cv.imshow('noisy | Gaussian | bilateral', np.hstack([crop(noisy), crop(gauss), crop(bil)]))
`, desc: '<p>가우시안 블러는 털 결과 눈 테두리까지 뿌옇게 만들지만, 양방향 필터는 코의 경계선과 눈 주변 윤곽을 비교적 선명하게 유지합니다. 대신 실행 시간이 몇 배 이상 걸리는 것을 확인하세요. (털처럼 미세한 질감은 양방향 필터에서도 조금 뭉개집니다.)</p>' },
      { type: 'code', title: '예제 5 · 노이즈 종류별 필터 대결 (PSNR 비교)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('lena.jpg')
rng = np.random.default_rng(0)

gauss_noisy = np.clip(img + rng.normal(0, 20, img.shape), 0, 255).astype(np.uint8)
sp_noisy = img.copy()
r = rng.random(img.shape[:2])
sp_noisy[r < 0.025] = 0
sp_noisy[r > 0.975] = 255

filters = [
    ('blur 5', lambda x: cv.blur(x, (5, 5))),
    ('Gaussian 5', lambda x: cv.GaussianBlur(x, (5, 5), 0)),
    ('median 5', lambda x: cv.medianBlur(x, 5)),
    ('bilateral 9', lambda x: cv.bilateralFilter(x, 9, 75, 75)),
]

plt.figure(figsize=(15, 8))
for row, (noise_name, noisy) in enumerate([('Gaussian noise', gauss_noisy), ('Salt & pepper', sp_noisy)]):
    plt.subplot(2, 5, row * 5 + 1)
    plt.imshow(cv.cvtColor(noisy[150:350, 150:350], cv.COLOR_BGR2RGB))
    plt.title('%s\n%.1f dB' % (noise_name, cv.PSNR(img, noisy))), plt.axis('off')
    print(f'[{noise_name}]')
    for col, (fname, fn) in enumerate(filters):
        out = fn(noisy)
        psnr = cv.PSNR(img, out)
        print(f'   {fname:12s} PSNR = {psnr:.2f} dB')
        plt.subplot(2, 5, row * 5 + col + 2)
        plt.imshow(cv.cvtColor(out[150:350, 150:350], cv.COLOR_BGR2RGB))
        plt.title('%s\n%.1f dB' % (fname, psnr)), plt.axis('off')
plt.tight_layout()
plt.show()
`, desc: '<p>결과를 표로 읽어 보세요. <b>가우시안 노이즈</b>에서는 양방향 필터와 가우시안 블러가 가장 좋고, <b>소금-후추 노이즈</b>에서는 미디언 블러가 압도적입니다. 양방향 필터는 소금-후추 점을 “나와 밝기가 전혀 다른 이웃”으로 보고 섞지 않기 때문에 오히려 거의 효과가 없습니다. <b>노이즈의 종류를 먼저 파악하고 필터를 고르는 것</b>이 핵심입니다.</p>' },
      { type: 'table', head: ['필터', '원리', '강점', '약점', '이럴 때'], rows: [
        ['<code>cv.blur</code>', '이웃 평균', '가장 단순·빠름', '경계가 흐려짐, 점 잡음에 약함', '빠른 대략적 블러'],
        ['<code>cv.GaussianBlur</code>', '거리 가중 평균', '자연스러운 블러, 가우시안 노이즈에 효과적', '경계가 흐려짐', '엣지·임계처리 전처리 (가장 많이 씀)'],
        ['<code>cv.medianBlur</code>', '이웃의 중앙값', '소금-후추 노이즈 제거 최강, 경계 비교적 보존', '큰 커널에서 디테일 뭉개짐', '점 잡음, 마스크 잡음 정리'],
        ['<code>cv.bilateralFilter</code>', '거리 × 밝기 유사도 가중 평균', '경계 보존하며 노이즈 제거', '매우 느림, 점 잡음에 약함', '피부 보정, 카툰 효과, 고품질 노이즈 제거'],
      ] },
      { type: 'code', title: '예제 6 · 웹캠 필터 선택기와 속도 측정 (process)', code: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('filter', 'controls', 3, 4, nothing)   # 0 없음, 1 blur, 2 Gaussian, 3 median, 4 bilateral
names = ['none', 'blur 7', 'Gaussian 7', 'median 7', 'bilateral d=5']

def process(frame):
    k = cv.getTrackbarPos('filter', 'controls')
    t0 = cv.getTickCount()
    if k == 1:
        out = cv.blur(frame, (7, 7))
    elif k == 2:
        out = cv.GaussianBlur(frame, (7, 7), 0)
    elif k == 3:
        out = cv.medianBlur(frame, 7)
    elif k == 4:
        out = cv.bilateralFilter(frame, 5, 50, 50)     # 실시간이므로 d 를 작게
    else:
        out = frame.copy()
    ms = (cv.getTickCount() - t0) / cv.getTickFrequency() * 1000
    cv.putText(out, f'{names[k]}: {ms:.1f} ms', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return out
`, desc: '<p>입력을 <b>📷 웹캠</b>(없으면 <b>🎞️ 동영상</b> Megamind.mp4)으로 바꾸고 필터를 하나씩 바꿔 보세요. 미디언은 물감을 칠한 듯한 느낌, 양방향 필터는 피부가 매끈해지는 “뽀샤시” 느낌이 납니다. 화면의 ms로 필터별 속도 차이도 확인하세요.</p>' },
      { type: 'text', html: `<h3>4. 2주차 정리</h3>
<p>이번 주에는 이미지를 “가공”하는 기본 도구들을 익혔습니다. 3주차(모폴로지, 엣지, 컨투어)와 4주차 프로젝트에서 이 도구들을 <b>조합한 파이프라인</b>으로 계속 사용합니다.</p>` },
      { type: 'table', head: ['교시', '주제', '핵심 함수', '꼭 기억할 점'], rows: [
        ['2-1', '색 공간 변환', '<code>cvtColor</code>, <code>split</code>', 'HSV 범위: H 0~179, S·V 0~255. imshow는 항상 BGR로 해석'],
        ['2-2', '색상 기반 추적', '<code>inRange</code>, <code>bitwise_and</code>', 'S·V 하한으로 무채색 배제, 빨강은 두 구간을 OR'],
        ['2-3', '기하 변환 Ⅰ', '<code>resize</code>, <code>warpAffine</code>, <code>getRotationMatrix2D</code>, <code>flip</code>, <code>rotate</code>', 'dsize·좌표는 (너비, 높이)/(x, y), shape는 (높이, 너비). 축소는 INTER_AREA'],
        ['2-4', '기하 변환 Ⅱ', '<code>getAffineTransform</code>, <code>getPerspectiveTransform</code>, <code>warpPerspective</code>', '어파인 3점, 원근 4점. float32, 점 순서 일치'],
        ['2-5', '임계처리', '<code>threshold</code>, <code>adaptiveThreshold</code>', '반환값 2개(ret, th). 조명 불균일이면 적응형, blockSize 홀수'],
        ['2-6', 'Otsu 이진화', '<code>THRESH_BINARY + THRESH_OTSU</code>', 'ret가 자동 임계값. 쌍봉 히스토그램에서 최적, 블러 후 적용'],
        ['2-7', '스무딩 Ⅰ', '<code>filter2D</code>, <code>blur</code>, <code>GaussianBlur</code>', '커널 합=1 밝기 유지, 합=0 경계. Gaussian ksize 홀수'],
        ['2-8', '스무딩 Ⅱ', '<code>medianBlur</code>, <code>bilateralFilter</code>', '점 잡음엔 미디언(ksize 정수), 경계 보존엔 양방향(느림)'],
      ] },
      { type: 'code', title: '예제 7 · 2주차 종합: 기울어진 문서를 스캔본처럼 만들기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('sudoku.png')

# ① 원근 변환으로 반듯하게 펴기 (2-4)
pts1 = np.float32([[72, 85], [492, 69], [35, 516], [520, 520]])
pts2 = np.float32([[0, 0], [450, 0], [0, 450], [450, 450]])
flat = cv.warpPerspective(img, cv.getPerspectiveTransform(pts1, pts2), (450, 450))

# ② 흑백 변환 (2-1) → ③ 노이즈 줄이기 (2-7, 2-8)
gray = cv.cvtColor(flat, cv.COLOR_BGR2GRAY)
smooth = cv.GaussianBlur(gray, (3, 3), 0)

# ④ 조명 차이에 강한 적응형 임계처리 (2-5) → ⑤ 남은 점 잡음 제거 (2-8)
scan = cv.adaptiveThreshold(smooth, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 31, 6)
scan = cv.medianBlur(scan, 3)

steps = [('Input', cv.cvtColor(img, cv.COLOR_BGR2RGB)), ('Perspective', cv.cvtColor(flat, cv.COLOR_BGR2RGB)),
         ('Gray + Gaussian', smooth), ('Adaptive + median', scan)]
plt.figure(figsize=(14, 4))
for i, (title, im) in enumerate(steps):
    plt.subplot(1, 4, i + 1), plt.imshow(im, cmap='gray'), plt.title(title), plt.axis('off')
plt.tight_layout()
plt.show()
cv.imwrite('sudoku_scan.png', scan)
`, desc: '<p>이번 주에 배운 다섯 가지 기술이 한 파이프라인에 모였습니다. 각 단계의 순서를 바꾸면(예: 임계처리 후 원근 변환) 결과가 어떻게 달라질지 생각해 보세요. 4주차 “문서 스캐너” 프로젝트에서는 ①의 네 점을 컨투어로 자동으로 찾게 됩니다.</p>' },
      { type: 'tip', html: `<p><b>미니 챌린지 안내</b> : 아래 실습 3 “컬러 스플래시”는 2-1(HSV), 2-2(inRange, 트랙바), 2-8(미디언으로 마스크 정리)을 모두 사용하는 종합 과제입니다. 먼저 스스로 만들어 보고, 막히면 힌트 → 해답 순서로 확인하세요.
여유가 있다면 예제 7을 웹캠용 <code>process(frame)</code>으로 바꿔(원근 변환은 빼고) “실시간 스캔 모드”도 만들어 보세요.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 가장 좋은 미디언 커널 크기 찾기',
        desc: `<p><code>baboon.jpg</code>에 <b>10%</b> 소금-후추 노이즈를 넣고, <code>medianBlur</code>의 ksize를 <b>3, 5, 7, 9</b>로 바꿔 가며 PSNR을 출력한 뒤 가장 높은 ksize의 결과를 보여주세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('baboon.jpg')
rng = np.random.default_rng(3)
r = rng.random(img.shape[:2])
noisy = img.copy()
noisy[r < 0.05] = 0
noisy[r > 0.95] = 255
print('노이즈 PSNR: %.2f dB' % cv.PSNR(img, noisy))

best_k, best_psnr = None, -1
# TODO: 3, 5, 7, 9 를 모두 시험하도록 목록을 채우세요
for k in [3]:
    out = cv.medianBlur(noisy, k)
    psnr = cv.PSNR(img, out)
    print('ksize %d → PSNR %.2f dB' % (k, psnr))
    # TODO: psnr 이 best_psnr 보다 크면 best_k, best_psnr 을 갱신하세요
    best_k, best_psnr = k, psnr

print('가장 좋은 ksize:', best_k)
cv.imshow('noisy | best median', np.hstack([noisy, cv.medianBlur(noisy, best_k)]))
`,
        hint: `<p><code>for k in [3, 5, 7, 9]:</code> 안에서 <code>if psnr &gt; best_psnr: best_k, best_psnr = k, psnr</code>. 노이즈가 많을수록 큰 커널이 유리하지만, 너무 크면 개코원숭이의 털 같은 디테일이 뭉개져 PSNR이 다시 떨어집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('baboon.jpg')
rng = np.random.default_rng(3)
r = rng.random(img.shape[:2])
noisy = img.copy()
noisy[r < 0.05] = 0
noisy[r > 0.95] = 255
print('노이즈 PSNR: %.2f dB' % cv.PSNR(img, noisy))

best_k, best_psnr = None, -1
for k in [3, 5, 7, 9]:
    out = cv.medianBlur(noisy, k)
    psnr = cv.PSNR(img, out)
    print('ksize %d → PSNR %.2f dB' % (k, psnr))
    if psnr > best_psnr:                   # 더 좋은 결과면 기록 갱신
        best_k, best_psnr = k, psnr

print('가장 좋은 ksize:', best_k)
cv.imshow('noisy | best median', np.hstack([noisy, cv.medianBlur(noisy, best_k)]))
`,
      },
      {
        title: '실습 2 · 양방향 필터로 “뽀샤시” 피부 보정',
        desc: `<p><code>lena.jpg</code>에 <b>양방향 필터를 두 번</b>(d=9, sigmaColor=40, sigmaSpace=40) 적용해 피부를 매끈하게 만들고, 너무 인공적이지 않도록 <code>cv.addWeighted</code>로 원본 30% + 보정본 70%를 섞으세요.
같은 강도의 가우시안 블러(9×9) 결과와 나란히 비교해 눈·입술 경계가 어떻게 다른지 확인합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('lena.jpg')

# TODO 1: bilateralFilter(d=9, sigmaColor=40, sigmaSpace=40) 를 두 번 적용하세요
smooth = img.copy()

# TODO 2: 원본 0.3 + smooth 0.7 로 섞으세요
beauty = smooth

gauss = cv.GaussianBlur(img, (9, 9), 0)
crop = lambda im: im[220:400, 200:380]
cv.imshow('original | Gaussian | beauty', np.hstack([crop(img), crop(gauss), crop(beauty)]))
`,
        hint: `<p><code>smooth = cv.bilateralFilter(img, 9, 40, 40)</code> 후 <code>smooth = cv.bilateralFilter(smooth, 9, 40, 40)</code>. 섞기는 <code>cv.addWeighted(img, 0.3, smooth, 0.7, 0)</code>. 필터를 여러 번 반복하는 것은 큰 d를 한 번 쓰는 것보다 빠르면서 비슷한 효과를 냅니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('lena.jpg')

smooth = cv.bilateralFilter(img, 9, 40, 40)          # 1회차
smooth = cv.bilateralFilter(smooth, 9, 40, 40)       # 2회차: 더 매끈하게

beauty = cv.addWeighted(img, 0.3, smooth, 0.7, 0)    # 원본 질감을 조금 남기기

gauss = cv.GaussianBlur(img, (9, 9), 0)
crop = lambda im: im[220:400, 200:380]
cv.imshow('original | Gaussian | beauty', np.hstack([crop(img), crop(gauss), crop(beauty)]))
`,
      },
      {
        title: '실습 3 · 미니 챌린지: 컬러 스플래시 (웹캠)',
        desc: `<p>영화 포스터처럼 <b>한 가지 색만 컬러로 남기고 나머지는 흑백</b>으로 만드는 <code>process(frame)</code>을 완성하세요. 입력은 📷 웹캠(없으면 smarties.png, 또는 🎞️ 동영상 cup.mp4에서 hue 10 근처로 손만 컬러로 남기기).</p>
<ol>
<li>트랙바 <code>hue</code>(0~179), <code>range</code>(0~40), <code>S min</code>(0~255)으로 남길 색을 고릅니다.</li>
<li>HSV 변환 후 <code>inRange</code>로 마스크를 만들고, <code>medianBlur</code>로 점 잡음을 정리합니다.</li>
<li>흑백 이미지를 3채널로 바꾼 뒤, 마스크가 흰 곳은 원본 컬러, 나머지는 흑백을 사용합니다.</li>
</ol>
<p><b>도전</b> : hue − range가 0보다 작거나 hue + range가 179보다 큰 경우(빨강!)도 올바르게 처리해 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('hue', 'controls', 110, 179, nothing)
cv.createTrackbar('range', 'controls', 12, 40, nothing)
cv.createTrackbar('S min', 'controls', 80, 255, nothing)

def process(frame):
    hue = cv.getTrackbarPos('hue', 'controls')
    rng = cv.getTrackbarPos('range', 'controls')
    smin = cv.getTrackbarPos('S min', 'controls')

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray3 = cv.cvtColor(gray, cv.COLOR_GRAY2BGR)       # 합성하려면 채널 수를 맞춰야 함

    # TODO 1: HSV 로 바꾸고 (hue-rng ~ hue+rng, smin~255, 50~255) 범위의 마스크 만들기
    mask = np.zeros(frame.shape[:2], np.uint8)
    # TODO 2: medianBlur 로 마스크 정리하기

    # TODO 3: 마스크가 흰 곳은 frame, 나머지는 gray3 를 쓰는 out 만들기
    out = gray3
    return out, mask
`,
        hint: `<p>① <code>hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)</code>, <code>mask = cv.inRange(hsv, (max(hue - rng, 0), smin, 50), (min(hue + rng, 179), 255, 255))</code><br>
② <code>mask = cv.medianBlur(mask, 5)</code><br>
③ <code>out = np.where(mask[:, :, None] &gt; 0, frame, gray3)</code> — <code>mask[:, :, None]</code>은 (h, w)를 (h, w, 1)로 만들어 3채널과 짝을 맞춥니다. 또는 <code>out = gray3.copy(); out[mask &gt; 0] = frame[mask &gt; 0]</code>.<br>
도전: <code>hue - rng &lt; 0</code>이면 <code>(180 + hue - rng) ~ 179</code> 구간 마스크를 추가로 만들어 <code>cv.bitwise_or</code>로 합칩니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('controls')
cv.createTrackbar('hue', 'controls', 110, 179, nothing)
cv.createTrackbar('range', 'controls', 12, 40, nothing)
cv.createTrackbar('S min', 'controls', 80, 255, nothing)

def process(frame):
    hue = cv.getTrackbarPos('hue', 'controls')
    rng = cv.getTrackbarPos('range', 'controls')
    smin = cv.getTrackbarPos('S min', 'controls')

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray3 = cv.cvtColor(gray, cv.COLOR_GRAY2BGR)

    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    lo, hi = hue - rng, hue + rng
    mask = cv.inRange(hsv, (max(lo, 0), smin, 50), (min(hi, 179), 255, 255))
    if lo < 0:                                   # 0 아래로 넘친 부분 → 179 쪽 구간 (빨강)
        mask = cv.bitwise_or(mask, cv.inRange(hsv, (180 + lo, smin, 50), (179, 255, 255)))
    if hi > 179:                                 # 179 위로 넘친 부분 → 0 쪽 구간
        mask = cv.bitwise_or(mask, cv.inRange(hsv, (0, smin, 50), (hi - 180, 255, 255)))
    mask = cv.medianBlur(mask, 5)                # 점 잡음 정리

    out = np.where(mask[:, :, None] > 0, frame, gray3)   # 선택한 색만 컬러로
    cv.putText(out, f'hue {hue} +/- {rng}', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return out, mask
`,
      },
    ],
    quiz: [
      { q: '소금-후추(salt-and-pepper) 노이즈를 제거하는 데 가장 효과적인 필터는?', options: ['cv.blur', 'cv.GaussianBlur', 'cv.medianBlur', 'cv.bilateralFilter'], answer: 2, explain: '미디언 블러는 이웃 값의 중앙값을 사용하므로 0이나 255 같은 극단값이 선택되지 않아 점 잡음을 거의 완벽히 지웁니다.' },
      { q: 'cv.medianBlur의 올바른 호출은?', options: ['cv.medianBlur(img, (5, 5))', 'cv.medianBlur(img, 4)', 'cv.medianBlur(img, 5)', 'cv.medianBlur(img, 5, 0)'], answer: 2, explain: 'medianBlur의 ksize는 1보다 큰 홀수 정수 하나입니다. 튜플이나 짝수는 오류가 납니다.' },
      { q: '양방향 필터가 경계를 보존할 수 있는 이유는?', options: ['커널 크기가 항상 3×3이라서', '거리뿐 아니라 밝기 차이가 큰 이웃에게 작은 가중치를 주기 때문에', '중앙값을 사용하기 때문에', '흑백 이미지만 처리하기 때문에'], answer: 1, explain: '공간 가우시안과 밝기(색) 가우시안을 곱한 가중치를 사용하므로, 경계 너머의 밝기가 크게 다른 픽셀은 가까워도 거의 섞이지 않습니다.' },
      { q: '웹캠 실시간 처리에서 양방향 필터를 쓸 때 주의할 점으로 가장 알맞은 것은?', options: ['d를 크게 할수록 빨라진다', '다른 블러보다 느리므로 d를 작게 하거나 이미지를 줄여서 쓴다', 'uint8 이미지는 처리할 수 없다', 'sigmaColor는 반드시 0이어야 한다'], answer: 1, explain: '양방향 필터는 픽셀마다 가중치를 새로 계산해 느립니다. 실시간에는 d=5 정도로 줄이거나 resize로 축소한 뒤 적용합니다.' },
      { q: '[2주차 복습] 다음 중 올바르지 않은 설명은?', options: ['OpenCV HSV에서 H는 0~179 범위이다', 'cv.resize(img, (w, h))의 크기 인자는 (너비, 높이) 순서이다', 'cv.getPerspectiveTransform은 점 3쌍으로 계산한다', 'THRESH_OTSU를 쓰면 ret에 자동 임계값이 반환된다'], answer: 2, explain: '원근 변환은 점 4쌍이 필요합니다. 점 3쌍은 어파인 변환(getAffineTransform)입니다.' },
    ],
  },
]);
