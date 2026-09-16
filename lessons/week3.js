/* 3주차: Image Processing Ⅱ — 모폴로지 · 그래디언트 · Canny · 피라미드/컨투어 · 히스토그램 · 템플릿 매칭 · 허프 변환 */
COURSE.addLessons([
  /* ======================================================================
   * w3-1 모폴로지 연산
   * ====================================================================== */
  {
    id: 'w3-1',
    summary: '흰 물체를 “깎고(침식) 불리는(팽창)” 모폴로지 연산으로 이진 마스크의 점 노이즈를 지우고 구멍을 메우며, 긴 커널로 악보의 오선처럼 특정 모양만 골라내는 방법을 배웁니다.',
    goals: [
      '침식(Erosion)과 팽창(Dilation)이 커널 크기·반복 횟수에 따라 어떻게 동작하는지 설명할 수 있다',
      '열기(Opening)와 닫기(Closing)를 목적(점 노이즈 제거 / 구멍 메우기)에 맞게 골라 쓸 수 있다',
      '모폴로지 그래디언트 · 탑햇 · 블랙햇의 결과를 해석할 수 있다',
      'cv.getStructuringElement()로 사각형·타원·십자 커널을 만들고, 긴 커널로 특정 방향의 선만 추출할 수 있다',
    ],
    schedule: [['도입 · 2주차 임계처리 복습', 5], ['침식과 팽창', 12], ['열기 · 닫기 · 그래디언트 · 탑햇', 10], ['구조 요소와 실전 활용 예제', 10], ['실습 과제', 8], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 모폴로지 연산이란?</h3>
<p><b>모폴로지(Morphology)</b>는 “형태학”이라는 뜻으로, 이미지 속 물체의 <b>모양(형태)</b>을 조금씩 깎거나 불려서 다듬는 연산입니다. 주로 <b>이진 이미지</b>(흑/백)에 사용하며, 2주차에 만든 임계처리·inRange 마스크가 지저분할 때 가장 먼저 꺼내는 도구입니다.</p>
<p>모폴로지 연산에는 두 가지 입력이 필요합니다.</p>
<ul>
<li><b>원본 이미지</b> — 보통 흰색(255)이 물체, 검은색(0)이 배경인 이진 이미지</li>
<li><b>구조 요소(Structuring Element) = 커널(kernel)</b> — 연산의 “도장” 모양. 예) 5×5 사각형</li>
</ul>
<p>커널을 이미지 위에서 한 칸씩 미끄러뜨리며(2주차 필터와 같은 방식) 커널 아래 픽셀들을 보고 가운데 픽셀 값을 결정합니다. 기본 연산은 <b>침식</b>과 <b>팽창</b> 두 개이고, 나머지(열기·닫기·그래디언트 등)는 모두 이 둘의 조합입니다.</p>` },
      { type: 'image', src: 'j.png', caption: '실습 이미지 j.png — 검은 배경 위의 흰 글자 j (튜토리얼 이미지)' },
      { type: 'text', html: `<h3>2. 침식(Erosion)과 팽창(Dilation)</h3>
<h4>침식 — “가장자리를 갉아먹기”</h4>
<p>커널 아래의 픽셀이 <b>모두 흰색(1)</b>일 때만 가운데 픽셀을 흰색으로 남기고, 하나라도 검은색이면 검은색으로 바꿉니다. 그래서 물체의 <b>경계 부분이 깎여</b> 얇아지고, 커널보다 작은 흰 점은 아예 사라집니다.</p>
<ul><li>쓰임: 작은 흰 노이즈 제거, 살짝 붙어 있는 두 물체 떼어 놓기</li></ul>
<h4>팽창 — “바깥으로 불리기”</h4>
<p>침식의 반대입니다. 커널 아래에 흰 픽셀이 <b>하나라도</b> 있으면 가운데를 흰색으로 만듭니다. 물체가 <b>두꺼워지고</b>, 작은 검은 구멍이 메워지며, 끊어진 부분이 이어집니다.</p>
<ul><li>쓰임: 침식으로 줄어든 물체를 다시 키우기, 끊어진 선 잇기, 구멍 메우기</li></ul>
<p><code>iterations</code> 인자로 같은 연산을 여러 번 반복할 수 있습니다. 5×5 커널로 2번 = 더 큰 커널로 1번 한 것과 비슷한 효과입니다.</p>` },
      { type: 'code', title: '예제 1 · 침식과 팽창 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np

# 글자 j 이미지를 흑백으로 읽기 (흰 글자 = 물체, 검은 배경)
img = cv.imread('j.png', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read"

# 5×5 크기의 1로 채운 커널(구조 요소)
kernel = np.ones((5, 5), np.uint8)

erosion = cv.erode(img, kernel, iterations=1)     # 침식: 깎아내기
erosion2 = cv.erode(img, kernel, iterations=2)    # 2번 반복 → 더 많이 깎임
dilation = cv.dilate(img, kernel, iterations=1)   # 팽창: 불리기

print('원본 흰 픽셀 수   :', cv.countNonZero(img))
print('침식 1회 후       :', cv.countNonZero(erosion))
print('침식 2회 후       :', cv.countNonZero(erosion2))
print('팽창 1회 후       :', cv.countNonZero(dilation))

cv.imshow('original', img)
cv.imshow('erosion', erosion)
cv.imshow('erosion x2', erosion2)
cv.imshow('dilation', dilation)
cv.waitKey(0)
cv.destroyAllWindows()
`, desc: '<p>흰 픽셀 수가 침식하면 줄고, 팽창하면 늘어나는 것을 숫자로도 확인해 보세요. 5×5 커널은 한 번에 경계를 약 2픽셀씩 깎습니다. j 의 획 두께가 10픽셀 남짓이라 침식을 2번 하면 획이 거의 다 사라집니다 — <b>커널 크기와 반복 횟수는 물체 두께를 보고 정해야</b> 합니다.</p>' },
      { type: 'tip', html: `<p><b>“흰색이 물체” 규칙을 꼭 기억하세요.</b> 모폴로지는 흰색 영역을 기준으로 깎고 불립니다. 흰 종이에 쓴 검은 글씨에 그대로 침식을 하면 흰 배경이 깎여서 <b>글씨가 오히려 두꺼워집니다.</b> 이런 이미지는 <code>cv.THRESH_BINARY_INV</code> 나 <code>cv.bitwise_not()</code> 으로 먼저 반전하세요.</p>` },
      { type: 'text', html: `<h3>3. 열기(Opening)와 닫기(Closing)</h3>
<p>침식과 팽창을 <b>순서대로 묶은</b> 연산입니다. 한 번 깎고 다시 불리면 물체 크기는 거의 그대로인데, 그 사이에 사라진 것은 돌아오지 않는다는 점을 이용합니다.</p>
<ul>
<li><b>열기 = 침식 → 팽창</b> : 침식 때 사라진 작은 흰 점은 팽창해도 되살아나지 않습니다. → <b>배경의 흰 점 노이즈 제거</b> (“먼지 털기”)</li>
<li><b>닫기 = 팽창 → 침식</b> : 팽창 때 메워진 작은 검은 구멍은 침식해도 다시 뚫리지 않습니다. → <b>물체 안의 검은 구멍 메우기</b> (“구멍 때우기”)</li>
</ul>
<p>두 연산 모두 <code>cv.morphologyEx(src, op, kernel)</code> 한 함수로 처리하며, <code>op</code> 에 연산 종류를 넣습니다. 튜토리얼은 노이즈가 섞인 j 이미지를 따로 준비했는데, 여기서는 numpy 난수로 직접 노이즈를 만들어 봅니다.</p>` },
      { type: 'code', title: '예제 2 · 노이즈를 만들고 열기/닫기로 지우기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('j.png', cv.IMREAD_GRAYSCALE)
_, img = cv.threshold(img, 127, 255, cv.THRESH_BINARY)   # 0/255 로 확실하게 이진화
kernel = np.ones((5, 5), np.uint8)
rng = np.random.default_rng(0)     # 시드를 고정하면 매번 같은 노이즈가 생김

# ① 바깥 노이즈: 배경 곳곳에 흰 점 뿌리기 (튜토리얼 opening 입력과 비슷)
outside = img.copy()
outside[rng.random(img.shape) < 0.05] = 255

# ② 안쪽 노이즈: 글자 안에 검은 구멍 뚫기 (튜토리얼 closing 입력과 비슷)
inside = img.copy()
holes = (rng.random(img.shape) < 0.08) & (img == 255)
inside[holes] = 0

opening = cv.morphologyEx(outside, cv.MORPH_OPEN, kernel)    # 침식 → 팽창
closing = cv.morphologyEx(inside, cv.MORPH_CLOSE, kernel)    # 팽창 → 침식

# 원본과 몇 픽셀이 다른지로 복원 정도를 확인
print('흰 점 노이즈 : 원본과 다른 픽셀', cv.countNonZero(cv.absdiff(outside, img)), '→ 열기 후', cv.countNonZero(cv.absdiff(opening, img)))
print('검은 구멍    : 원본과 다른 픽셀', cv.countNonZero(cv.absdiff(inside, img)), '→ 닫기 후', cv.countNonZero(cv.absdiff(closing, img)))

cv.imshow('noise outside', outside)
cv.imshow('opening', opening)
cv.imshow('noise inside', inside)
cv.imshow('closing', closing)
`, desc: '<p>열기/닫기 후에도 원본과 약간 다른 픽셀이 남는 이유는, 모서리처럼 커널보다 뾰족한 부분이 살짝 둥글게 바뀌기 때문입니다.</p>' },
      { type: 'text', html: `<h3>4. 모폴로지 그래디언트 · 탑햇 · 블랙햇</h3>
<p>침식·팽창·열기·닫기 결과를 서로 <b>빼면</b> 또 다른 유용한 정보가 나옵니다.</p>
<ul>
<li><b>모폴로지 그래디언트 = 팽창 − 침식</b> : 불린 모양에서 깎은 모양을 빼면 경계의 띠만 남습니다 → <b>윤곽선</b></li>
<li><b>탑햇(Top Hat) = 원본 − 열기</b> : 열기로 사라진 부분, 즉 <b>커널보다 작은 밝은 부분</b>만 남습니다. 어두운 배경 위의 작은 밝은 점·글자 찾기에 유용</li>
<li><b>블랙햇(Black Hat) = 닫기 − 원본</b> : 닫기로 메워진 부분, 즉 <b>커널보다 작은 어두운 부분(구멍·틈)</b>만 남습니다</li>
</ul>
<p>튜토리얼은 탑햇/블랙햇에 조금 더 큰 9×9 커널을 사용합니다. 커널이 클수록 “작다”의 기준이 커져 더 많은 부분이 결과에 나타납니다.</p>` },
      { type: 'code', title: '예제 3 · 7가지 모폴로지 연산 한눈에 비교', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('j.png', cv.IMREAD_GRAYSCALE)
kernel5 = np.ones((5, 5), np.uint8)
kernel9 = np.ones((9, 9), np.uint8)    # 튜토리얼은 탑햇/블랙햇에 9×9 커널 사용

gradient = cv.morphologyEx(img, cv.MORPH_GRADIENT, kernel5)   # 팽창 - 침식 = 윤곽선
tophat = cv.morphologyEx(img, cv.MORPH_TOPHAT, kernel9)        # 원본 - 열기
blackhat = cv.morphologyEx(img, cv.MORPH_BLACKHAT, kernel9)    # 닫기 - 원본

# 공식이 맞는지 직접 계산해서 비교해 보기
manual = cv.subtract(cv.dilate(img, kernel5), cv.erode(img, kernel5))
print('그래디언트 == 팽창 - 침식 ?', np.array_equal(gradient, manual))

titles = ['Original', 'Erosion', 'Dilation', 'Opening',
          'Closing', 'Gradient', 'Top Hat (9x9)', 'Black Hat (9x9)']
images = [img,
          cv.erode(img, kernel5),
          cv.dilate(img, kernel5),
          cv.morphologyEx(img, cv.MORPH_OPEN, kernel5),
          cv.morphologyEx(img, cv.MORPH_CLOSE, kernel5),
          gradient, tophat, blackhat]

plt.figure(figsize=(10, 6))
for i in range(8):
    plt.subplot(2, 4, i + 1)
    plt.imshow(images[i], cmap='gray', vmin=0, vmax=255)
    plt.title(titles[i])
    plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()

cv.imshow('gradient', gradient)
`, desc: '<p>j 의 획은 9×9 커널보다 가늘어서 열기를 하면 대부분 사라집니다. 그래서 탑햇(원본 − 열기)에는 획의 대부분이 남고, 굵은 점과 획이 겹친 두꺼운 부분만 빠집니다. 블랙햇에는 곡선이 꺾이는 안쪽의 좁은 틈만 조금 나타납니다.</p>' },
      { type: 'table', head: ['op 상수', '계산', '대표 용도'], rows: [
        ['<code>cv.MORPH_ERODE</code>', '침식 (= cv.erode)', '작은 흰 점 제거, 붙은 물체 분리'],
        ['<code>cv.MORPH_DILATE</code>', '팽창 (= cv.dilate)', '끊어진 선 잇기, 물체 키우기'],
        ['<code>cv.MORPH_OPEN</code>', '침식 → 팽창', '배경의 흰 점 노이즈 제거'],
        ['<code>cv.MORPH_CLOSE</code>', '팽창 → 침식', '물체 안 검은 구멍 메우기'],
        ['<code>cv.MORPH_GRADIENT</code>', '팽창 − 침식', '윤곽선(테두리) 얻기'],
        ['<code>cv.MORPH_TOPHAT</code>', '원본 − 열기', '커널보다 작은 밝은 부분 강조'],
        ['<code>cv.MORPH_BLACKHAT</code>', '닫기 − 원본', '커널보다 작은 어두운 부분 강조'],
      ] },
      { type: 'text', html: `<h3>5. 구조 요소(Structuring Element) 만들기</h3>
<p>지금까지 쓴 <code>np.ones((5, 5), np.uint8)</code> 은 꽉 찬 <b>사각형</b> 커널입니다. 동전처럼 둥근 물체에는 <b>타원</b> 커널이 모서리를 덜 각지게 만들고, 가느다란 십자 모양이 필요할 때는 <b>십자</b> 커널을 씁니다. <code>cv.getStructuringElement(모양, (가로, 세로))</code> 로 만듭니다.</p>
<ul>
<li><code>cv.MORPH_RECT</code> — 사각형 (np.ones 와 같음)</li>
<li><code>cv.MORPH_ELLIPSE</code> — 사각형 안에 꽉 차는 타원</li>
<li><code>cv.MORPH_CROSS</code> — 가운데 행/열만 1인 십자</li>
</ul>
<p>커널 크기를 <b>(40, 1)</b> 처럼 한쪽으로 길게 만들면 “가로로 40픽셀 이상 이어진 것”만 남기는 <b>방향 필터</b>가 됩니다. 이 아이디어를 뒤의 악보 예제에서 사용합니다.</p>` },
      { type: 'code', title: '예제 4 · 구조 요소 출력하고 모양 눈으로 확인하기', code: String.raw`
import cv2 as cv
import numpy as np

# 튜토리얼처럼 5×5 커널을 출력해 보기
print('MORPH_RECT\n', cv.getStructuringElement(cv.MORPH_RECT, (5, 5)))
print('MORPH_ELLIPSE\n', cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5)))
print('MORPH_CROSS\n', cv.getStructuringElement(cv.MORPH_CROSS, (5, 5)))

# 가로/세로 순서 확인: (가로 7, 세로 3) → numpy shape 는 (행 3, 열 7)
wide = cv.getStructuringElement(cv.MORPH_RECT, (7, 3))
print('(7, 3) 커널의 shape:', wide.shape)

# 모양을 눈으로 보기: 점 하나를 팽창시키면 커널 모양이 그대로 '도장'처럼 찍힌다
dot = np.zeros((41, 41), np.uint8)
dot[20, 20] = 255
views = []
for shape in (cv.MORPH_RECT, cv.MORPH_ELLIPSE, cv.MORPH_CROSS):
    k = cv.getStructuringElement(shape, (21, 21))
    stamped = cv.dilate(dot, k)
    big = cv.resize(stamped, None, fx=4, fy=4, interpolation=cv.INTER_NEAREST)
    views.append(cv.copyMakeBorder(big, 4, 4, 4, 4, cv.BORDER_CONSTANT, value=128))
cv.imshow('RECT | ELLIPSE | CROSS', np.hstack(views))
` },
      { type: 'warn', html: `<p><b>크기 순서 헷갈림 주의!</b> <code>cv.getStructuringElement(shape, (가로, 세로))</code> 는 OpenCV 규칙대로 <b>(가로, 세로)</b> 순서지만, <code>np.ones((행, 열))</code> 은 numpy 규칙대로 <b>(세로, 가로)</b> 순서입니다. 즉 가로로 긴 커널은 <code>getStructuringElement(cv.MORPH_RECT, (40, 1))</code> 또는 <code>np.ones((1, 40), np.uint8)</code> 입니다.</p>` },
      { type: 'text', html: `<h3>6. 실전 ① 임계처리 마스크 청소하고 동전 세기</h3>
<p>현실의 임계처리 결과는 깔끔하지 않습니다. <code>water_coins.jpg</code> 를 고정 임계값으로 이진화하면 배경에 작은 점이 생기고, 동전 무늬 때문에 동전 안에 구멍이 뚫립니다. 전형적인 청소 순서는 다음과 같습니다.</p>
<ol>
<li><b>임계처리</b> — 어두운 동전을 흰색으로 (THRESH_BINARY_INV)</li>
<li><b>열기</b> — 배경의 작은 흰 점 제거</li>
<li><b>닫기</b> — 동전 안쪽의 작은 구멍 메우기</li>
<li><b>강한 침식</b> — 서로 맞닿아 한 덩어리가 된 동전을 떼어 놓기 → 떨어진 조각 수 = 동전 수</li>
</ol>
<p>조각 수를 세는 <code>cv.findContours()</code> 는 4교시에 자세히 배우니, 지금은 “흰 덩어리 목록을 돌려주는 함수” 정도로만 이해하세요.</p>` },
      { type: 'code', title: '예제 5 · 동전 마스크 청소와 개수 세기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# 1) 임계처리: 어두운 동전을 흰색으로 (반전 이진화)
_, mask = cv.threshold(gray, 120, 255, cv.THRESH_BINARY_INV)

kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))   # 둥근 동전엔 둥근 커널
# 2) 열기: 배경의 작은 흰 점 제거
opened = cv.morphologyEx(mask, cv.MORPH_OPEN, kernel, iterations=2)
# 3) 닫기: 동전 안쪽의 작은 검은 구멍 메우기
cleaned = cv.morphologyEx(opened, cv.MORPH_CLOSE, kernel, iterations=2)

def count_pieces(m):
    # RETR_LIST: 바깥 덩어리 + 안쪽 구멍까지 모두 셈 (4교시에 자세히)
    contours, _ = cv.findContours(m, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    return len(contours)

print('윤곽 조각 수 (원본 마스크):', count_pieces(mask))
print('윤곽 조각 수 (열기 후)    :', count_pieces(opened))
print('윤곽 조각 수 (닫기 후)    :', count_pieces(cleaned))

# 4) 동전끼리 붙어 있어 한 덩어리 → 강하게 침식해서 떼어 놓기
separated = cv.erode(cleaned, kernel, iterations=14)
contours, _ = cv.findContours(separated, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
print('침식으로 분리한 동전 수   :', len(contours))

vis = img.copy()
cv.drawContours(vis, contours, -1, (0, 0, 255), 2)
cv.imshow('1 mask', mask)
cv.imshow('2 cleaned', cleaned)
cv.imshow('3 separated', separated)
cv.imshow('4 result', vis)
`, desc: '<p>침식 반복 횟수(iterations)를 10, 12, 14로 바꿔 보세요. 너무 적으면 동전이 덜 떨어져 개수가 적게 나오고, 너무 많으면 작은 동전이 통째로 사라집니다. 이런 “적당한 값 찾기”가 영상처리의 일상입니다.</p>' },
      { type: 'text', html: `<h3>7. 실전 ② 악보에서 오선만 뽑아내기</h3>
<p>악보(<code>notes.png</code>)에는 <b>가로로 긴 오선</b>과 <b>세로로 짧은 음표 기둥</b>, 그리고 둥근 음표 머리가 섞여 있습니다. 모양의 “방향”과 “길이”가 다르다는 점을 이용하면 모폴로지만으로 분리할 수 있습니다.</p>
<ul>
<li><b>가로 40×세로 1 커널로 열기</b> → 가로로 40픽셀 이상 이어진 구조(오선)만 살아남음</li>
<li><b>가로 1×세로 15 커널로 열기</b> → 세로로 긴 구조(음표 기둥, 마디선)만 살아남음</li>
<li><b>전체 − 오선</b> → 음표만 남음 (오선이 지나가던 자리가 살짝 끊기므로 작은 세로 닫기로 보정)</li>
</ul>` },
      { type: 'code', title: '예제 6 · 긴 커널로 악보의 오선과 음표 분리하기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('notes.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
# 흰 종이 위 검은 악보 → 흰 물체가 되도록 반전 이진화 (Otsu 자동 임계값)
_, bw = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

# 가로로 긴 커널(가로 40, 세로 1): 가로 40픽셀 이상 이어진 선만 남음
h_kernel = cv.getStructuringElement(cv.MORPH_RECT, (40, 1))
staff = cv.morphologyEx(bw, cv.MORPH_OPEN, h_kernel)

# 세로로 긴 커널(가로 1, 세로 15): 음표 기둥과 마디선만 남음
v_kernel = cv.getStructuringElement(cv.MORPH_RECT, (1, 15))
stems = cv.morphologyEx(bw, cv.MORPH_OPEN, v_kernel)

# 전체에서 오선을 빼면 음표만 남음 + 끊긴 곳을 세로 닫기로 살짝 이어 주기
notes_only = cv.subtract(bw, staff)
notes_only = cv.morphologyEx(notes_only, cv.MORPH_CLOSE, cv.getStructuringElement(cv.MORPH_RECT, (1, 3)))

# 오선이 있는 행(y) 찾기: 행마다 흰 픽셀 합을 구해 폭의 절반 이상인 행
row_sum = staff.sum(axis=1) / 255
print('오선이 지나가는 y 좌표:', np.where(row_sum > staff.shape[1] * 0.5)[0])

# 원본 위에 오선은 빨강, 기둥은 파랑으로 표시
vis = img.copy()
vis[staff > 0] = (0, 0, 255)
vis[stems > 0] = (255, 0, 0)

cv.imshow('binary', bw)
cv.imshow('staff lines', staff)
cv.imshow('stems', stems)
cv.imshow('notes only', notes_only)
cv.imshow('overlay', vis)
` },
    ],
    practice: [
      {
        title: '실습 1 · 노이즈 섞인 글자 복원하기',
        desc: `<p>흰 점(바깥)과 검은 구멍(안쪽)이 <b>동시에</b> 섞인 j 이미지를 원본에 최대한 가깝게 복원하세요. 열기와 닫기를 차례로 적용하고, 마지막에 출력되는 “원본과 다른 픽셀 수”가 <b>400 이하</b>가 되도록 연산 순서와 커널 크기를 조절해 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('j.png', cv.IMREAD_GRAYSCALE)
_, img = cv.threshold(img, 127, 255, cv.THRESH_BINARY)
rng = np.random.default_rng(1)
noisy = img.copy()
noisy[rng.random(img.shape) < 0.04] = 255                     # 바깥 흰 점
noisy[(rng.random(img.shape) < 0.06) & (img == 255)] = 0       # 안쪽 검은 구멍

k_open = np.ones((5, 5), np.uint8)
k_close = np.ones((5, 5), np.uint8)

# TODO 1: 열기(cv.MORPH_OPEN)로 흰 점 노이즈 지우기
step1 = noisy.copy()
# TODO 2: step1 에 닫기(cv.MORPH_CLOSE)로 안쪽 구멍 메우기
step2 = step1.copy()
# TODO 3: 결과가 나쁘면 k_open 크기를 바꾸거나 순서를 바꿔 보기

print('노이즈 이미지와 원본 차이:', cv.countNonZero(cv.absdiff(noisy, img)))
print('복원 결과와 원본 차이   :', cv.countNonZero(cv.absdiff(step2, img)))
cv.imshow('noisy', noisy)
cv.imshow('step1', step1)
cv.imshow('step2', step2)
`,
        hint: `<p><code>cv.morphologyEx(noisy, cv.MORPH_OPEN, k_open)</code> 형태로 씁니다. 5×5 열기를 먼저 하면 구멍 난 글자의 가는 획까지 깎여 오히려 나빠집니다. <b>열기는 작은 커널(3×3)</b>로 점만 지우고, <b>닫기는 5×5</b>로 구멍을 메워 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('j.png', cv.IMREAD_GRAYSCALE)
_, img = cv.threshold(img, 127, 255, cv.THRESH_BINARY)
rng = np.random.default_rng(1)
noisy = img.copy()
noisy[rng.random(img.shape) < 0.04] = 255                     # 바깥 흰 점
noisy[(rng.random(img.shape) < 0.06) & (img == 255)] = 0       # 안쪽 검은 구멍

k_open = np.ones((3, 3), np.uint8)    # 점만 지울 만큼 작게
k_close = np.ones((5, 5), np.uint8)   # 구멍은 넉넉하게 메우기

step1 = cv.morphologyEx(noisy, cv.MORPH_OPEN, k_open)
step2 = cv.morphologyEx(step1, cv.MORPH_CLOSE, k_close)

# 비교: 5×5 열기 → 5×5 닫기 (가는 획이 깎여서 더 나쁨)
bad = cv.morphologyEx(cv.morphologyEx(noisy, cv.MORPH_OPEN, k_close), cv.MORPH_CLOSE, k_close)

print('노이즈 이미지와 원본 차이:', cv.countNonZero(cv.absdiff(noisy, img)))
print('복원 결과와 원본 차이   :', cv.countNonZero(cv.absdiff(step2, img)))
print('(참고) 5x5 열기 사용 시 :', cv.countNonZero(cv.absdiff(bad, img)))
cv.imshow('noisy', noisy)
cv.imshow('step1', step1)
cv.imshow('step2', step2)
cv.imshow('bad (5x5 open)', bad)
`,
      },
      {
        title: '실습 2 · 악보에서 마디선만 골라 마디 수 세기',
        desc: `<p><code>notes.png</code> 에서 오선 전체를 세로로 가로지르는 <b>마디선</b>만 남기세요. 음표 기둥(길이 약 45px)보다 마디선(약 48px)이 조금 더 깁니다. 세로 커널 길이를 조절해 <b>마디선 4개</b>만 남기고 개수를 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('notes.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, bw = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

# TODO 1: 세로로 긴 커널 만들기 (가로 1, 세로 L). 지금은 1×1 이라 아무것도 걸러지지 않음
L = 1
v_kernel = cv.getStructuringElement(cv.MORPH_RECT, (1, L))

# TODO 2: 열기로 세로 구조만 남기기
bars = bw.copy()

contours, _ = cv.findContours(bars, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
print('남은 세로 조각 수:', len(contours))
vis = img.copy()
cv.drawContours(vis, contours, -1, (0, 0, 255), 2)
cv.imshow('bars', bars)
cv.imshow('result', vis)
`,
        hint: `<p><code>bars = cv.morphologyEx(bw, cv.MORPH_OPEN, v_kernel)</code> 로 바꾸고 L 을 15 → 30 → 40 → 46 으로 늘려 가며 조각 수가 어떻게 줄어드는지 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('notes.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, bw = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

L = 46   # 음표 기둥(약 45px)보다 길고 마디선(약 48px)보다 짧게
v_kernel = cv.getStructuringElement(cv.MORPH_RECT, (1, L))
bars = cv.morphologyEx(bw, cv.MORPH_OPEN, v_kernel)

contours, _ = cv.findContours(bars, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
print('마디선 수:', len(contours))
for c in contours:
    x, y, w, h = cv.boundingRect(c)
    print('  x =', x, ' 길이 =', h)
vis = img.copy()
cv.drawContours(vis, contours, -1, (0, 0, 255), 2)
cv.imshow('bars', bars)
cv.imshow('result', vis)
`,
      },
      {
        title: '실습 3 · 트랙바로 조작하는 실시간 모폴로지 뷰어',
        desc: `<p>입력(이미지 또는 웹캠)을 적응형 임계처리한 마스크에, 트랙바 <b>op</b>(0=원본, 1=침식, 2=팽창, 3=열기, 4=닫기)와 <b>radius</b>(커널 반지름)에 따라 모폴로지 연산을 적용해 보여 주세요. 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸면 실시간으로 동작합니다. 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('op', 'result', 3, 4, nothing)       # 0:mask 1:erode 2:dilate 3:open 4:close
cv.createTrackbar('radius', 'result', 2, 10, nothing)  # 커널 반지름

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    mask = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 15, 5)

    op = cv.getTrackbarPos('op', 'result')
    r = cv.getTrackbarPos('radius', 'result')
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))

    # TODO: op 값에 따라 침식/팽창/열기/닫기를 적용해 out 에 저장하기
    out = mask

    cv.putText(out, 'op=%d r=%d' % (op, r), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, 128, 2)
    return out
`,
        hint: `<p>연산 상수를 리스트로 만들어 두면 if 문 없이 고를 수 있습니다: <code>ops = [None, cv.MORPH_ERODE, cv.MORPH_DILATE, cv.MORPH_OPEN, cv.MORPH_CLOSE]</code>. op 가 0이면 mask 를 그대로 쓰고, 아니면 <code>cv.morphologyEx(mask, ops[op], kernel)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('op', 'result', 3, 4, nothing)       # 0:mask 1:erode 2:dilate 3:open 4:close
cv.createTrackbar('radius', 'result', 2, 10, nothing)  # 커널 반지름

ops = [None, cv.MORPH_ERODE, cv.MORPH_DILATE, cv.MORPH_OPEN, cv.MORPH_CLOSE]
names = ['mask', 'erode', 'dilate', 'open', 'close']

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    mask = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 15, 5)

    op = cv.getTrackbarPos('op', 'result')
    r = cv.getTrackbarPos('radius', 'result')
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))

    if op == 0:
        out = mask.copy()
    else:
        out = cv.morphologyEx(mask, ops[op], kernel)

    cv.putText(out, '%s r=%d' % (names[op], r), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, 128, 2)
    return out
`,
      },
    ],
    quiz: [
      { q: "이진 마스크의 배경에 흩어진 작은 흰 점만 없애고, 물체 크기는 거의 그대로 유지하고 싶습니다. 가장 알맞은 연산은?", options: ["열기(침식 → 팽창)","침식만 적용","팽창만 적용","닫기(팽창 → 침식)"], answer: 0, explain: "침식으로 작은 점을 없앤 뒤 팽창으로 물체 크기를 되돌리는 열기가 적합합니다. 침식만 하면 물체도 얇아집니다." },
      { q: "cv.morphologyEx(img, cv.MORPH_GRADIENT, kernel) 의 결과로 옳은 것은?", options: ["Sobel 필터처럼 밝기 변화의 방향을 알려준다","원본에서 열기 결과를 뺀 것으로, 작은 밝은 점만 남는다","팽창 결과에서 침식 결과를 뺀 것으로, 물체의 윤곽선 띠가 남는다","이미지의 밝기를 그라데이션으로 바꾼다"], answer: 2, explain: "모폴로지 그래디언트 = 팽창 − 침식 입니다. 원본 − 열기는 탑햇입니다." },
      { q: "cv.getStructuringElement(cv.MORPH_RECT, (40, 1)) 커널로 열기를 하면 어떤 구조가 남나요?", options: ["세로로 40픽셀 이상 긴 구조","지름 40픽셀 이상의 둥근 물체","아무것도 변하지 않는다","가로로 40픽셀 이상 이어진 구조"], answer: 3, explain: "getStructuringElement 의 크기는 (가로, 세로) 순서이므로 가로 40×세로 1 커널입니다. 이 커널이 통째로 들어갈 수 있는 가로로 긴 구조만 살아남습니다." },
      { q: "흰 종이에 검은 글씨가 쓰인 이진 이미지에 반전 없이 바로 침식(cv.erode)을 적용하면 글씨는 어떻게 될까요?", options: ["글씨가 얇아진다","글씨가 두꺼워진다","글씨가 완전히 사라진다","변화가 없다"], answer: 1, explain: "모폴로지는 흰색을 물체로 봅니다. 흰 배경이 깎이므로 검은 글씨 영역은 오히려 넓어집니다. 글씨를 얇게 하려면 먼저 반전하세요." },
    ],
  },

  /* ======================================================================
   * w3-2 이미지 그래디언트
   * ====================================================================== */
  {
    id: 'w3-2',
    summary: '밝기가 급격히 변하는 곳(엣지)을 “미분”으로 찾는 Sobel · Scharr · Laplacian 필터를 배우고, 데이터 타입 때문에 엣지 절반이 사라지는 함정을 피하는 법을 익힙니다.',
    goals: [
      '이미지 그래디언트(밝기 변화량)와 엣지의 관계를 설명할 수 있다',
      'cv.Sobel()의 dx, dy, ksize 인자로 x/y 방향 엣지를 구할 수 있다',
      'Scharr 와 Laplacian 필터가 Sobel 과 어떻게 다른지 설명할 수 있다',
      'CV_8U 출력에서 음수 기울기가 사라지는 문제를 CV_64F + 절댓값으로 해결할 수 있다',
      'x/y 그래디언트를 합쳐 크기(magnitude) 영상을 만들고 웹캠에 적용할 수 있다',
    ],
    schedule: [['도입 · 그래디언트 개념', 8], ['Sobel · Scharr · Laplacian', 14], ['데이터 타입 함정', 8], ['기울기 크기와 웹캠 적용', 7], ['실습 과제', 8], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 그래디언트(Gradient)란?</h3>
<p><b>그래디언트</b>는 “기울기”, 즉 <b>밝기가 얼마나 빠르게 변하는지</b>를 나타내는 값입니다. 이미지를 산악 지형이라고 상상해 보세요. 밝은 곳은 높은 산, 어두운 곳은 골짜기입니다. 평평한 들판에서는 기울기가 0이고, 절벽(밝기가 확 바뀌는 곳)에서는 기울기가 매우 큽니다. 이 <b>절벽이 바로 엣지(Edge, 경계)</b>입니다.</p>
<p>픽셀 한 줄로 보면 더 쉽습니다. <code>[10, 10, 10, 200, 200]</code> 에서 이웃끼리 빼면 <code>[0, 0, 190, 0]</code> — 변화가 있는 곳에서만 큰 값이 나옵니다. 이것이 <b>1차 미분</b>입니다.</p>
<ul>
<li><b>x 방향 그래디언트</b> : 왼쪽↔오른쪽으로 밝기가 변하는 곳 → 결과적으로 <b>세로선</b>이 드러남</li>
<li><b>y 방향 그래디언트</b> : 위↕아래로 밝기가 변하는 곳 → <b>가로선</b>이 드러남</li>
</ul>
<p>또 하나 중요한 점: 어두움→밝음은 <b>양수(+)</b>, 밝음→어두움은 <b>음수(−)</b> 기울기입니다. 이 음수가 뒤에서 함정이 됩니다.</p>` },
      { type: 'code', title: '예제 1 · 픽셀 한 줄로 “미분” 느껴 보기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# 아주 간단한 1줄짜리 '이미지': 어두움 → 밝음 → 어두움
row = np.array([10, 10, 10, 10, 200, 200, 200, 200, 10, 10, 10], dtype=np.float64)
diff = np.diff(row)          # 이웃 픽셀끼리 뺀 값 = 1차 미분(변화량)
print('픽셀 값:', row.astype(int))
print('변화량 :', diff.astype(int))
print('→ 어두움→밝음 경계는 +190, 밝음→어두움 경계는 -190 (음수!)')

# 실제 이미지 한 줄: sudoku.png 의 y=300 행
img = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
line = img[300, :].astype(np.float64)

plt.figure(figsize=(9, 5))
plt.subplot(2, 1, 1), plt.plot(line), plt.title('Intensity along y = 300')
plt.subplot(2, 1, 2), plt.plot(np.diff(line), color='r'), plt.title('Difference (1st derivative)')
plt.tight_layout()
plt.show()

vis = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
cv.line(vis, (0, 300), (img.shape[1] - 1, 300), (0, 0, 255), 1)
cv.imshow('row y=300', vis)
`, desc: '<p>아래 그래프에서 뾰족하게 튀는 곳이 스도쿠 격자의 검은 선과 숫자를 지나는 위치입니다. 위로 튀면 밝아지는 경계, 아래로 튀면 어두워지는 경계입니다.</p>' },
      { type: 'text', html: `<h3>2. Sobel 과 Scharr 필터</h3>
<p>단순히 이웃끼리 빼면 노이즈에 매우 민감합니다. <b>Sobel</b> 필터는 “가우시안 스무딩 + 미분”을 합친 커널이라 노이즈에 조금 더 강합니다. x 방향 3×3 Sobel 커널은 다음과 같습니다(오른쪽 − 왼쪽, 가운데 행에 가중치 2).</p>
<pre>-1  0  +1
-2  0  +2
-1  0  +1</pre>
<p><code>cv.Sobel(src, ddepth, dx, dy, ksize)</code> 에서 <b>dx=1, dy=0</b> 이면 x 방향, <b>dx=0, dy=1</b> 이면 y 방향 미분입니다. <code>ksize</code> 는 1, 3, 5, 7 중 하나이며 클수록 더 부드럽고 두꺼운 엣지가 나옵니다.</p>
<p>3×3 Sobel 은 기울기 방향 계산이 약간 부정확합니다. 이를 개선한 것이 <b>Scharr</b> 필터(가중치 3, 10, 3)입니다. <code>cv.Scharr(src, ddepth, dx, dy)</code> 또는 <code>cv.Sobel(..., ksize=-1)</code> 로 사용합니다.</p>` },
      { type: 'table', head: ['인자', '의미', '보통 쓰는 값'], rows: [
        ['<code>src</code>', '입력 이미지 (보통 그레이스케일)', 'gray'],
        ['<code>ddepth</code>', '출력 데이터 타입 — 음수를 담을 수 있어야 함', '<code>cv.CV_64F</code>, <code>cv.CV_16S</code>'],
        ['<code>dx</code>, <code>dy</code>', 'x, y 방향 미분 차수', '(1, 0) 또는 (0, 1)'],
        ['<code>ksize</code>', '커널 크기 1/3/5/7, <b>-1 이면 3×3 Scharr</b>', '3 또는 5'],
        ['<code>scale</code>, <code>delta</code>', '결과에 곱할 값, 더할 값 (선택)', '1, 0'],
      ] },
      { type: 'text', html: `<h3>3. Laplacian 필터</h3>
<p><b>Laplacian</b> 은 <b>2차 미분</b>(기울기의 기울기)을 x, y 방향으로 더한 값입니다: Δ = ∂²/∂x² + ∂²/∂y². 커널 하나로 <b>모든 방향의 엣지를 한 번에</b> 구할 수 있지만, 미분을 두 번 하므로 <b>노이즈에 더 민감</b>합니다. ksize=1 일 때 커널은 다음과 같습니다.</p>
<pre> 0   1   0
 1  -4   1
 0   1   0</pre>
<p>주변 네 픽셀의 합과 가운데 픽셀×4 를 비교하는 셈이라, 주변과 다른 “튀는” 곳에서 큰 값이 나옵니다. 아래 튜토리얼 예제로 세 필터를 비교해 봅시다.</p>` },
      { type: 'code', title: '예제 2 · Laplacian, Sobel X, Sobel Y 비교 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read"

laplacian = cv.Laplacian(img, cv.CV_64F)
sobelx = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=5)   # x 방향 미분 → 세로선이 드러남
sobely = cv.Sobel(img, cv.CV_64F, 0, 1, ksize=5)   # y 방향 미분 → 가로선이 드러남

print('sobelx 타입:', sobelx.dtype, ' 최소:', sobelx.min(), ' 최대:', sobelx.max())

plt.figure(figsize=(9, 9))
plt.subplot(2, 2, 1), plt.imshow(img, cmap='gray')
plt.title('Original'), plt.xticks([]), plt.yticks([])
plt.subplot(2, 2, 2), plt.imshow(laplacian, cmap='gray')
plt.title('Laplacian'), plt.xticks([]), plt.yticks([])
plt.subplot(2, 2, 3), plt.imshow(sobelx, cmap='gray')
plt.title('Sobel X'), plt.xticks([]), plt.yticks([])
plt.subplot(2, 2, 4), plt.imshow(sobely, cmap='gray')
plt.title('Sobel Y'), plt.xticks([]), plt.yticks([])
plt.show()
`, desc: '<p>matplotlib 은 float 배열을 최소~최대 범위로 자동 조절해 보여 주므로 음수(어두운 쪽)와 양수(밝은 쪽)가 모두 보입니다. 회색 = 0, 흰색 = 양수 기울기, 검은색 = 음수 기울기입니다.</p>' },
      { type: 'code', title: '예제 3 · Sobel 커널 크기와 Scharr 비교', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png', cv.IMREAD_GRAYSCALE)

# 실제 커널 값 확인: getDerivKernels 는 1차원 커널 2개를 주고, 곱하면 2차원 커널
kx, ky = cv.getDerivKernels(1, 0, 3)
print('Sobel 3x3 (x방향)\n', (ky @ kx.T).astype(int))
kx, ky = cv.getDerivKernels(1, 0, cv.FILTER_SCHARR)   # FILTER_SCHARR = -1
print('Scharr 3x3 (x방향)\n', (ky @ kx.T).astype(int))

sobel3 = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=3)
sobel7 = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=7)
scharr = cv.Scharr(img, cv.CV_64F, 1, 0)
sobel_m1 = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=-1)
print('Sobel(ksize=-1) 과 Scharr 가 같은가?', np.allclose(sobel_m1, scharr))

# cv.imshow 로 보려면 절댓값 + uint8 변환이 필요 → convertScaleAbs
cv.imshow('Sobel ksize=3', cv.convertScaleAbs(sobel3))
cv.imshow('Sobel ksize=7 (scaled 1/64)', cv.convertScaleAbs(sobel7, alpha=1 / 64))
cv.imshow('Scharr', cv.convertScaleAbs(scharr))
`, desc: '<p>ksize=7 은 값이 매우 커서(가중치 합이 큼) 그대로 표시하면 거의 하얗게 포화됩니다. 그래서 <code>alpha=1/64</code> 로 줄여서 보여 줍니다. 커널이 클수록 엣지가 두껍고 부드러워지는 것을 확인하세요.</p>' },
      { type: 'text', html: `<h3>4. 중요한 함정: 출력 데이터 타입</h3>
<p>튜토리얼이 “One Important Matter” 로 강조하는 부분입니다. 검은 배경 위 흰 상자를 x 방향으로 미분하면,</p>
<ul>
<li>상자의 <b>왼쪽 경계</b>(검정→흰색)는 <b>양수</b> 기울기</li>
<li>상자의 <b>오른쪽 경계</b>(흰색→검정)는 <b>음수</b> 기울기</li>
</ul>
<p>그런데 출력 타입을 <code>cv.CV_8U</code>(= np.uint8, 0~255)로 정하면 <b>음수는 모두 0으로 잘려</b> 오른쪽 경계가 통째로 사라집니다. 해결책은 간단합니다.</p>
<ol>
<li><code>cv.CV_64F</code>(또는 <code>cv.CV_16S</code>)처럼 음수를 담을 수 있는 타입으로 계산하고</li>
<li><b>절댓값</b>을 취한 뒤</li>
<li>0~255 로 잘라 <b>uint8</b> 로 변환 → <code>cv.convertScaleAbs()</code> 가 이 과정을 한 번에 해 줍니다</li>
</ol>` },
      { type: 'code', title: '예제 4 · CV_8U 로 잃어버리는 엣지 (튜토리얼 box 예제)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

# 튜토리얼의 box 이미지는 '검은 배경 위 흰 사각형' 그림입니다 → numpy 로 똑같이 만들기
img = np.zeros((200, 300), np.uint8)
cv.rectangle(img, (80, 50), (220, 150), 255, -1)

# ① 출력 타입 CV_8U: 음수 기울기(흰→검 경계)가 0 으로 잘림
sobelx8u = cv.Sobel(img, cv.CV_8U, 1, 0, ksize=5)

# ② 출력 타입 CV_64F → 절댓값 → 0~255 로 자르고 uint8 로
sobelx64f = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=5)
abs_sobel64f = np.absolute(sobelx64f)
sobel_8u = np.uint8(np.clip(abs_sobel64f, 0, 255))

# ③ 같은 일을 한 줄로
sobel_csa = cv.convertScaleAbs(sobelx64f)

print('CV_8U 결과에서 엣지가 있는 열(x):', np.unique(np.nonzero(sobelx8u)[1]))
print('절댓값 결과에서 엣지가 있는 열(x):', np.unique(np.nonzero(sobel_8u)[1]))
print('np.clip 방식 == convertScaleAbs ?', np.array_equal(sobel_8u, sobel_csa))

plt.figure(figsize=(10, 3.5))
plt.subplot(1, 3, 1), plt.imshow(img, cmap='gray')
plt.title('Original'), plt.xticks([]), plt.yticks([])
plt.subplot(1, 3, 2), plt.imshow(sobelx8u, cmap='gray')
plt.title('Sobel CV_8U'), plt.xticks([]), plt.yticks([])
plt.subplot(1, 3, 3), plt.imshow(sobel_8u, cmap='gray')
plt.title('Sobel abs(CV_64F)'), plt.xticks([]), plt.yticks([])
plt.show()

# 샘플 사진 box.png 에도 적용해 비교
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
cv.imshow('box.png CV_8U', cv.Sobel(box, cv.CV_8U, 1, 0, ksize=3))
cv.imshow('box.png abs(CV_64F)', cv.convertScaleAbs(cv.Sobel(box, cv.CV_64F, 1, 0, ksize=3)))
`, desc: '<p>CV_8U 결과에는 상자의 왼쪽 경계만 남고, 절댓값 결과에는 양쪽 경계가 모두 남습니다. 샘플 사진 <code>box.png</code>(과자 상자)에서도 CV_8U 쪽 글자 윤곽이 한쪽 면만 보이는 것을 확인해 보세요.</p>' },
      { type: 'warn', html: `<p>튜토리얼 원문은 <code>np.uint8(abs_sobel64f)</code> 로 바로 변환합니다. 하지만 ksize=5 의 결과는 255 를 훨씬 넘기 때문에 그대로 uint8 로 바꾸면 <b>값이 256 으로 나눈 나머지로 “돌아가(wrap)”</b> 이상한 무늬가 생길 수 있습니다. 반드시 <code>np.clip()</code> 으로 먼저 자르거나 <code>cv.convertScaleAbs()</code> 를 사용하세요.</p>` },
      { type: 'text', html: `<h3>5. x 와 y 그래디언트 합치기 — 기울기 크기</h3>
<p>Sobel X 는 세로 엣지, Sobel Y 는 가로 엣지만 보여 줍니다. 모든 방향의 엣지를 보려면 두 결과를 합칩니다. 피타고라스 정리처럼</p>
<p><b>크기(magnitude) = √(Gx² + Gy²)</b>, &nbsp; <b>방향(angle) = atan2(Gy, Gx)</b></p>
<ul>
<li><code>cv.magnitude(gx, gy)</code> — 정확한 크기 (float 입력)</li>
<li><code>cv.phase(gx, gy, angleInDegrees=True)</code> — 방향(도)</li>
<li>빠른 근사: <code>cv.addWeighted(|Gx|, 0.5, |Gy|, 0.5, 0)</code> — 실시간 처리에서 자주 사용</li>
</ul>
<p>이 “크기와 방향”은 다음 시간 <b>Canny 엣지 검출</b>의 2단계에서 그대로 사용됩니다.</p>` },
      { type: 'code', title: '예제 5 · 기울기 크기와 방향 구하기 (box.png)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('box.png', cv.IMREAD_GRAYSCALE)

gx = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=3)
gy = cv.Sobel(img, cv.CV_64F, 0, 1, ksize=3)

mag = cv.magnitude(gx, gy)                        # sqrt(gx^2 + gy^2)
angle = cv.phase(gx, gy, angleInDegrees=True)     # 0 ~ 360 도

# 표시용: 최소~최대를 0~255 로 늘려서 uint8 로
mag_u8 = cv.normalize(mag, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
# 빠른 근사: |gx|/2 + |gy|/2
approx = cv.addWeighted(cv.convertScaleAbs(gx), 0.5, cv.convertScaleAbs(gy), 0.5, 0)

_, max_val, _, max_loc = cv.minMaxLoc(mag)
x, y = max_loc
print('가장 강한 엣지 위치 (x, y):', max_loc, ' 크기: %.1f' % max_val)
print('그 위치의 기울기 방향: %.1f 도' % angle[y, x])

cv.imshow('Sobel X', cv.convertScaleAbs(gx))
cv.imshow('Sobel Y', cv.convertScaleAbs(gy))
cv.imshow('magnitude (normalized)', mag_u8)
cv.imshow('approx 0.5|gx| + 0.5|gy|', approx)
` },
      { type: 'code', title: '예제 6 · 웹캠 실시간 엣지 뷰 (process)', code: String.raw`
import cv2 as cv
import numpy as np

# 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸면 매 프레임 실행됩니다 (이미지로도 동작).
# 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 됩니다.
def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (3, 3), 0)          # 노이즈를 살짝 줄이고 미분

    # CV_16S: 음수를 담을 수 있고 CV_64F 보다 가벼워 실시간에 적합
    gx = cv.Sobel(gray, cv.CV_16S, 1, 0, ksize=3)
    gy = cv.Sobel(gray, cv.CV_16S, 0, 1, ksize=3)
    ax = cv.convertScaleAbs(gx)
    ay = cv.convertScaleAbs(gy)

    edges = cv.addWeighted(ax, 0.5, ay, 0.5, 0)       # 전체 엣지(근사 크기)
    # 방향별 색칠: 파랑 = 세로 엣지(x 미분), 빨강 = 가로 엣지(y 미분)
    colored = cv.merge([ax, np.zeros_like(ax), ay])
    return edges, colored
`, desc: '<p>여러 장을 튜플로 반환하면 결과 패널에 나란히 표시됩니다. 손을 좌우로 움직이면 파란색(세로 엣지), 위아래로 움직이면 빨간색(가로 엣지)이 강해지는지 관찰해 보세요.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 건물 사진에서 세로선과 가로선 분리하기',
        desc: `<p><code>building.jpg</code> 에서 세로 엣지만 보이는 창, 가로 엣지만 보이는 창, 두 방향을 합친 기울기 크기 창을 만드세요. 창틀의 세로선과 층을 나누는 가로선이 각 창에 따로 보여야 합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg', cv.IMREAD_GRAYSCALE)
img = cv.resize(img, None, fx=0.6, fy=0.6)     # 화면에 맞게 축소

gx = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=3)
# TODO 1: y 방향 미분 gy 를 구하세요 (지금은 gx 를 그대로 복사)
gy = gx.copy()
# TODO 2: 두 방향을 합친 기울기 크기 mag 를 구하세요 (cv.magnitude)
mag = np.abs(gx)

cv.imshow('vertical edges (gx)', cv.convertScaleAbs(gx))
cv.imshow('horizontal edges (gy)', cv.convertScaleAbs(gy))
cv.imshow('magnitude', cv.convertScaleAbs(mag))
`,
        hint: `<p>y 방향은 <code>cv.Sobel(img, cv.CV_64F, 0, 1, ksize=3)</code>, 크기는 <code>cv.magnitude(gx, gy)</code> 입니다. 둘 다 float64 여야 합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg', cv.IMREAD_GRAYSCALE)
img = cv.resize(img, None, fx=0.6, fy=0.6)

gx = cv.Sobel(img, cv.CV_64F, 1, 0, ksize=3)
gy = cv.Sobel(img, cv.CV_64F, 0, 1, ksize=3)
mag = cv.magnitude(gx, gy)

print('세로 엣지 에너지 합: %.0f' % np.abs(gx).sum())
print('가로 엣지 에너지 합: %.0f' % np.abs(gy).sum())
cv.imshow('vertical edges (gx)', cv.convertScaleAbs(gx))
cv.imshow('horizontal edges (gy)', cv.convertScaleAbs(gy))
cv.imshow('magnitude', cv.convertScaleAbs(mag))
`,
      },
      {
        title: '실습 2 · CV_8U 함정을 숫자로 확인하고 고치기',
        desc: `<p>이번에는 <b>흰 배경 위 검은 원</b>입니다. 시작 코드는 CV_8U 로 x, y 미분을 하고 있어 엣지가 일부만 나옵니다. 음수 기울기까지 살려서 원 둘레 전체가 보이도록 고치고, 엣지 픽셀 수가 얼마나 늘었는지 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = np.full((240, 240), 255, np.uint8)
cv.circle(img, (120, 120), 70, 0, -1)          # 흰 배경 위 검은 원

# TODO: CV_8U 대신 음수를 담을 수 있는 타입으로 계산하고 convertScaleAbs 로 변환하기
gx = cv.Sobel(img, cv.CV_8U, 1, 0, ksize=3)
gy = cv.Sobel(img, cv.CV_8U, 0, 1, ksize=3)
edges = cv.addWeighted(gx, 0.5, gy, 0.5, 0)

print('엣지 픽셀 수:', cv.countNonZero(edges))
cv.imshow('image', img)
cv.imshow('edges', edges)
`,
        hint: `<p><code>gx = cv.convertScaleAbs(cv.Sobel(img, cv.CV_64F, 1, 0, ksize=3))</code> 처럼 바꾸면 됩니다. 원래 방식(CV_8U) 결과도 따로 계산해서 두 개수를 함께 출력해 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = np.full((240, 240), 255, np.uint8)
cv.circle(img, (120, 120), 70, 0, -1)          # 흰 배경 위 검은 원

# 잘못된 방식 (비교용)
bad = cv.addWeighted(cv.Sobel(img, cv.CV_8U, 1, 0, ksize=3), 0.5,
                     cv.Sobel(img, cv.CV_8U, 0, 1, ksize=3), 0.5, 0)

# 올바른 방식: CV_64F → 절댓값 → uint8
gx = cv.convertScaleAbs(cv.Sobel(img, cv.CV_64F, 1, 0, ksize=3))
gy = cv.convertScaleAbs(cv.Sobel(img, cv.CV_64F, 0, 1, ksize=3))
edges = cv.addWeighted(gx, 0.5, gy, 0.5, 0)

print('CV_8U 엣지 픽셀 수   :', cv.countNonZero(bad))
print('abs(CV_64F) 픽셀 수  :', cv.countNonZero(edges))
cv.imshow('image', img)
cv.imshow('edges CV_8U (bad)', bad)
cv.imshow('edges', edges)
`,
      },
      {
        title: '실습 3 · 웹캠 “연필 스케치” 효과',
        desc: `<p>기울기 크기를 반전(255 − 값)하면 흰 종이 위 연필 선처럼 보입니다. 트랙바 <b>gain</b> 으로 선의 진하기를 조절하는 스케치 필터를 완성하세요. 입력 소스를 📷 웹캠으로 바꿔 확인해 보세요. 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('gain', 'result', 20, 50, nothing)   # 선 진하기 (x0.1)

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    gain = cv.getTrackbarPos('gain', 'result') / 10

    # TODO 1: Sobel x, y (CV_16S) → convertScaleAbs → addWeighted 로 edges 만들기
    edges = np.zeros_like(gray)
    # TODO 2: edges 에 gain 을 곱하고(convertScaleAbs 의 alpha) 반전해서 sketch 만들기
    sketch = 255 - edges
    return sketch
`,
        hint: `<p><code>edges = cv.convertScaleAbs(edges, alpha=gain)</code> 로 진하게 만든 뒤 <code>255 - edges</code> 로 반전합니다. uint8 끼리의 뺄셈이지만 255 − (0~255) 는 음수가 되지 않아 안전합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('gain', 'result', 20, 50, nothing)   # 선 진하기 (x0.1)

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    gain = cv.getTrackbarPos('gain', 'result') / 10

    ax = cv.convertScaleAbs(cv.Sobel(gray, cv.CV_16S, 1, 0, ksize=3))
    ay = cv.convertScaleAbs(cv.Sobel(gray, cv.CV_16S, 0, 1, ksize=3))
    edges = cv.addWeighted(ax, 0.5, ay, 0.5, 0)
    edges = cv.convertScaleAbs(edges, alpha=gain)   # 선을 더 진하게
    sketch = 255 - edges
    return sketch
`,
      },
    ],
    quiz: [
      { q: "cv.Sobel(img, cv.CV_64F, 1, 0, ksize=3) 결과에서 주로 강하게 드러나는 것은?", options: ["가로 방향 선","원형 물체","세로 방향 선","밝기가 일정한 넓은 영역"], answer: 2, explain: "dx=1 은 x(좌우) 방향 밝기 변화를 구합니다. 좌우로 밝기가 바뀌는 곳은 세로로 뻗은 경계선입니다." },
      { q: "Sobel 의 출력 타입을 cv.CV_8U 로 하면 생기는 문제는?", options: ["흰색→검은색 경계(음수 기울기)가 0 으로 잘려 사라진다","계산이 매우 느려진다","결과가 컬러로 나온다","엣지가 두 배로 두꺼워진다"], answer: 0, explain: "uint8 은 음수를 표현할 수 없어 음수 기울기가 0 으로 포화됩니다. CV_64F/CV_16S 로 계산 후 절댓값을 취하세요." },
      { q: "cv.Sobel(img, cv.CV_64F, 1, 0, ksize=-1) 은 무엇과 같나요?", options: ["1×1 Sobel","Laplacian","5×5 가우시안 블러","3×3 Scharr 필터"], answer: 3, explain: "ksize=-1 (cv.FILTER_SCHARR) 은 3×3 Scharr 커널을 사용합니다. cv.Scharr() 와 결과가 같습니다." },
      { q: "Laplacian 필터에 대한 설명으로 옳은 것은?", options: ["1차 미분이며 x 방향만 계산한다","2차 미분이며 모든 방향의 엣지를 한 번에 구하지만 노이즈에 민감하다","이미지를 부드럽게 만드는 블러 필터다","결과가 항상 0 이상이므로 CV_8U 로 충분하다"], answer: 1, explain: "Laplacian 은 x, y 2차 미분의 합으로 방향 구분 없이 엣지를 찾습니다. 미분을 두 번 하므로 노이즈를 증폭시키기 쉽고, 결과에 음수가 있습니다." },
      { q: "cv.convertScaleAbs(src) 가 하는 일로 옳은 것은?", options: ["절댓값을 취하고 0~255 로 포화시켜 uint8 로 변환한다","음수를 0 으로 바꾼다","최소~최대를 0~255 로 정규화한다","컬러를 흑백으로 바꾼다"], answer: 0, explain: "|src×alpha + beta| 를 계산해 255 를 넘으면 255 로 자르고 uint8 로 바꿉니다. 정규화(NORM_MINMAX)는 cv.normalize 의 역할입니다." },
    ],
  },
  /* ======================================================================
   * w3-3 Canny 엣지 검출
   * ====================================================================== */
  {
    id: 'w3-3',
    summary: '가장 널리 쓰이는 엣지 검출기 Canny 의 4단계 원리(노이즈 제거 → 그래디언트 → 비최대 억제 → 히스테리시스)를 이해하고, 두 임계값을 트랙바와 자동 계산으로 조절해 원하는 엣지를 얻는 법을 익힙니다.',
    goals: [
      'Canny 알고리즘의 4단계를 순서대로, 각 단계가 왜 필요한지와 함께 설명할 수 있다',
      'cv.Canny()의 minVal/maxVal 이 결과에 미치는 영향을 설명하고 트랙바로 튜닝할 수 있다',
      '중앙값(median)을 이용해 이미지마다 임계값을 자동으로 정할 수 있다',
      '블러 · L2gradient 옵션을 활용하고 웹캠 영상에 Canny 를 적용할 수 있다',
    ],
    schedule: [['도입 · 그래디언트 복습', 5], ['Canny 4단계 원리', 13], ['cv.Canny 기본 사용', 7], ['임계값 튜닝 · 자동 임계값', 10], ['실습 과제', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. Canny 엣지 검출이란?</h3>
<p>지난 시간의 Sobel 결과는 엣지가 <b>두껍고</b>, 노이즈 때문에 <b>자잘한 점</b>이 많고, 선이 <b>군데군데 끊겨</b> 있었습니다. 1986년 John F. Canny 는 “좋은 엣지 검출기”의 조건을 세 가지로 정리하고 이를 만족하는 알고리즘을 만들었습니다.</p>
<ul>
<li><b>잘 찾기</b> — 진짜 엣지는 놓치지 않고, 가짜 엣지(노이즈)는 적게</li>
<li><b>정확한 위치</b> — 엣지가 실제 경계 위에 <b>1픽셀 두께</b>로</li>
<li><b>한 번만 응답</b> — 경계 하나에 선 하나</li>
</ul>
<p>Canny 엣지 검출은 여러 단계를 거치는 알고리즘이지만, OpenCV 에서는 <code>cv.Canny()</code> 한 줄이면 됩니다. 다만 <b>두 개의 임계값</b>을 잘 고르려면 내부 동작을 이해해야 합니다.</p>` },
      { type: 'text', html: `<h3>2. 1단계 노이즈 제거 · 2단계 그래디언트 계산</h3>
<h4>1단계 — 노이즈 제거 (Noise Reduction)</h4>
<p>미분은 작은 노이즈도 엣지로 착각합니다. 그래서 먼저 <b>5×5 가우시안 필터</b>로 이미지를 부드럽게 만듭니다. 사진의 자잘한 먼지를 먼저 털어내는 과정이라고 생각하세요.</p>
<h4>2단계 — 그래디언트의 크기와 방향 (Intensity Gradient)</h4>
<p>부드러워진 이미지에 Sobel 필터로 x, y 방향 미분(Gx, Gy)을 구하고, 지난 시간에 배운 대로</p>
<p><b>크기 = √(Gx² + Gy²)</b>, &nbsp; <b>방향 θ = atan(Gy / Gx)</b></p>
<p>를 계산합니다. 방향은 엣지와 항상 <b>수직</b>이며, 계산을 쉽게 하기 위해 <b>0°, 45°, 90°, 135°</b> 네 방향 중 가장 가까운 값으로 반올림합니다.</p>` },
      { type: 'text', html: `<h3>3. 3단계 비최대 억제 · 4단계 히스테리시스 임계처리</h3>
<h4>3단계 — 비최대 억제 (Non-maximum Suppression)</h4>
<p>2단계의 엣지는 산등성이처럼 <b>두툼한 띠</b> 모양입니다. 각 픽셀에서 그래디언트 방향(엣지에 수직인 방향)으로 앞뒤 이웃과 크기를 비교해, <b>자신이 가장 클 때만 남기고 나머지는 0</b>으로 만듭니다. 산맥에서 <b>능선(꼭대기 줄)만 남기는</b> 것과 같아서, 결과는 <b>1픽셀 두께의 얇은 선</b>이 됩니다.</p>
<h4>4단계 — 히스테리시스 임계처리 (Hysteresis Thresholding)</h4>
<p>이제 “진짜 엣지”를 고릅니다. 임계값을 <b>두 개</b>(minVal, maxVal) 사용합니다.</p>
<ul>
<li>크기 ≥ <b>maxVal</b> → <b>확실한 엣지(sure edge)</b>. 무조건 남김</li>
<li>크기 &lt; <b>minVal</b> → 엣지 아님. 버림</li>
<li><b>그 사이</b> → “후보”. <b>확실한 엣지와 연결되어 있을 때만</b> 남김</li>
</ul>
<p>비유하자면 <b>반장(확실한 엣지)의 친구</b>는 인정해 주고, 아무와도 연결되지 않은 애매한 후보는 탈락시키는 방식입니다. 튜토리얼 그림에서 A 는 maxVal 위라 확실한 엣지, C 는 maxVal 아래지만 A 와 이어져 있어 인정, B 는 같은 구간이지만 확실한 엣지와 연결되지 않아 버려집니다. 이 덕분에 <b>약하지만 이어진 선은 끊기지 않고</b>, <b>고립된 노이즈 점은 사라집니다.</b></p>` },
      { type: 'table', head: ['단계', '하는 일', '비유', '결과'], rows: [
        ['1. 노이즈 제거', '5×5 가우시안 블러', '먼지 털기', '자잘한 노이즈 감소'],
        ['2. 그래디언트', 'Sobel 로 크기·방향 계산', '경사가 급한 곳 찾기', '두꺼운 엣지 띠'],
        ['3. 비최대 억제', '방향을 따라 최대값만 남김', '산의 능선만 남기기', '1픽셀 두께 선'],
        ['4. 히스테리시스', '두 임계값 + 연결성 검사', '반장과 친구만 인정', '이어진 진짜 엣지'],
      ] },
      { type: 'code', title: '예제 1 · 단계별로 따라가 보기', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)

# 1단계: 노이즈 제거
blur = cv.GaussianBlur(img, (5, 5), 0)

# 2단계: 그래디언트 크기 (cv.Canny 기본값과 같은 L1 방식: |gx| + |gy|)
gx = cv.Sobel(blur, cv.CV_64F, 1, 0, ksize=3)
gy = cv.Sobel(blur, cv.CV_64F, 0, 1, ksize=3)
mag = np.abs(gx) + np.abs(gy)

# 4단계 이해용: 크기를 세 구간으로 나눠 색칠
low, high = 100, 200
strong = mag >= high                    # 확실한 엣지
weak = (mag >= low) & (mag < high)      # 애매한 후보
zone = np.zeros(img.shape + (3,), np.uint8)
zone[weak] = (0, 255, 255)              # 노랑(BGR) = 후보
zone[strong] = (0, 0, 255)              # 빨강 = 확실

# 3~4단계를 포함한 전체 결과
edges = cv.Canny(blur, low, high)

print('확실한 엣지 픽셀 수(두꺼운 띠) :', int(strong.sum()))
print('후보 픽셀 수                  :', int(weak.sum()))
print('Canny 최종 엣지 픽셀 수        :', cv.countNonZero(edges))

titles = ['Original', '1. Gaussian blur', '2. Gradient magnitude', '4. Strong(red) / Weak(yellow)', 'Canny result']
images = [img, blur, np.clip(mag / 4, 0, 255), cv.cvtColor(zone, cv.COLOR_BGR2RGB), edges]
plt.figure(figsize=(12, 7))
for i in range(5):
    plt.subplot(2, 3, i + 1)
    plt.imshow(images[i], cmap='gray')
    plt.title(titles[i]), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p>빨강·노랑 영역은 두꺼운 띠인데, 최종 Canny 결과는 가느다란 선입니다. 비최대 억제가 띠를 얇게 만들고, 히스테리시스가 빨강과 이어진 노랑만 남긴 결과입니다.</p>' },
      { type: 'tip', html: `<p>튜토리얼은 1단계(가우시안 블러)를 알고리즘의 일부로 설명하지만, <b>OpenCV 의 <code>cv.Canny()</code> 함수는 내부에서 블러를 따로 하지 않습니다</b> (Sobel 커널 자체의 약한 스무딩만 있음). 노이즈가 많은 사진은 <code>cv.GaussianBlur()</code> 를 <b>먼저 직접</b> 적용하면 결과가 훨씬 깔끔해집니다.</p>` },
      { type: 'code', title: '예제 2 · cv.Canny 기본 사용 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read"
edges = cv.Canny(img, 100, 200)      # minVal=100, maxVal=200

plt.subplot(121), plt.imshow(img, cmap='gray')
plt.title('Original Image'), plt.xticks([]), plt.yticks([])
plt.subplot(122), plt.imshow(edges, cmap='gray')
plt.title('Edge Image'), plt.xticks([]), plt.yticks([])
plt.show()

print('결과 타입:', edges.dtype, ' 들어 있는 값:', np.unique(edges))
cv.imshow('edges', edges)
`, desc: '<p>결과는 0 과 255 두 값만 있는 <b>이진 이미지</b>입니다. 그래서 곧바로 컨투어 찾기(4교시)나 허프 변환(8교시)의 입력으로 쓸 수 있습니다.</p>' },
      { type: 'table', head: ['인자', '의미', '기본값 / 팁'], rows: [
        ['<code>image</code>', '입력 이미지 (8비트, 보통 그레이스케일)', '컬러도 되지만 흑백 권장'],
        ['<code>threshold1</code>', 'minVal — 이보다 작으면 버림', 'maxVal 의 1/2 ~ 1/3 정도'],
        ['<code>threshold2</code>', 'maxVal — 이보다 크면 확실한 엣지', '올리면 엣지가 줄어듦'],
        ['<code>apertureSize</code>', '그래디언트 계산용 Sobel 커널 크기', '3 (3, 5, 7 가능)'],
        ['<code>L2gradient</code>', 'True: √(Gx²+Gy²) 정확한 크기, False: |Gx|+|Gy| 근사', 'False'],
      ] },
      { type: 'text', html: `<h3>4. 임계값 고르기</h3>
<p>두 임계값은 결과를 크게 바꿉니다.</p>
<ul>
<li><b>너무 낮으면</b> — 잔디·관중석 무늬 같은 질감까지 전부 엣지가 되어 지저분해짐</li>
<li><b>너무 높으면</b> — 중요한 윤곽까지 끊기거나 사라짐</li>
<li><b>minVal 과 maxVal 사이 간격</b> — 넓을수록 약한 선이 확실한 선에 “이어 붙어” 더 길게 연결됨</li>
</ul>
<p>Canny 가 권장한 비율은 <b>maxVal : minVal = 2:1 ~ 3:1</b> 입니다. 튜토리얼의 추가 과제처럼 <b>트랙바</b>를 달아 두 값을 움직여 보면 감이 금방 옵니다. 웹 환경에서는 트랙바 값을 <code>process()</code> 안에서 읽는 패턴을 씁니다.</p>` },
      { type: 'code', title: '예제 3 · 트랙바로 minVal / maxVal 조절하기 (튜토리얼 추가 과제)', code: String.raw`
import cv2 as cv

# 입력 이미지(messi5.jpg 등)나 📷 웹캠, 🎞️ 동영상(vtest.mp4 등)에서 트랙바를 움직여 보세요.
def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('minVal', 'result', 100, 500, nothing)
cv.createTrackbar('maxVal', 'result', 200, 500, nothing)

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    lo = cv.getTrackbarPos('minVal', 'result')
    hi = cv.getTrackbarPos('maxVal', 'result')
    if lo > hi:                      # 순서가 뒤바뀌어도 동작하도록
        lo, hi = hi, lo
    edges = cv.Canny(gray, lo, hi)
    cv.putText(edges, 'min=%d max=%d' % (lo, hi), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, 255, 2)
    return edges
` },
      { type: 'code', title: '예제 4 · 설정별 결과와 히스테리시스 효과 비교', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)

# (minVal, maxVal, L2gradient)
settings = [(30, 60, False), (100, 200, False), (250, 400, False),
            (200, 200, False), (50, 200, False), (100, 200, True)]

plt.figure(figsize=(12, 6))
for i, (lo, hi, l2) in enumerate(settings):
    e = cv.Canny(img, lo, hi, L2gradient=l2)
    n = cv.countNonZero(e)
    print('min=%3d max=%3d L2=%-5s → 엣지 픽셀 %6d 개' % (lo, hi, l2, n))
    plt.subplot(2, 3, i + 1)
    plt.imshow(e, cmap='gray')
    plt.title('min=%d max=%d L2=%s' % (lo, hi, l2))
    plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p><b>(200, 200)</b> 은 후보 구간이 없어 “확실한 엣지만” 남긴 결과이고, <b>(50, 200)</b> 은 같은 maxVal 에서 후보를 넓게 인정한 결과입니다. 둘을 비교하면 히스테리시스가 약한 선을 이어 붙이는 효과가 보입니다. L2gradient=True 는 크기를 더 정확히(값이 약간 작게) 계산해 엣지가 조금 줄어듭니다.</p>' },
      { type: 'text', html: `<h3>5. 임계값 자동으로 정하기</h3>
<p>밝은 사진과 어두운 사진은 그래디언트 크기의 범위도 달라서, 한 이미지에 맞춘 임계값이 다른 이미지에는 맞지 않습니다. 실전에서 많이 쓰는 간단한 방법은 <b>이미지 밝기의 중앙값(median)</b>을 기준으로 잡는 것입니다.</p>
<ul>
<li>v = 그레이스케일 이미지의 중앙값</li>
<li>minVal = max(0, (1 − σ) × v), &nbsp; maxVal = min(255, (1 + σ) × v)</li>
<li>σ(시그마) = 0.33 이 흔히 쓰는 기본값. 크게 하면 구간이 넓어져 엣지가 많아짐</li>
</ul>
<p>또 다른 방법으로 2주차에 배운 <b>Otsu 임계값</b>을 maxVal 로, 그 절반을 minVal 로 쓰기도 합니다. 어느 쪽도 “정답”은 아니고, <b>좋은 출발점</b>을 자동으로 잡아 준다고 생각하세요.</p>` },
      { type: 'code', title: '예제 5 · 중앙값 기반 자동 Canny', code: String.raw`
import cv2 as cv
import numpy as np

def auto_canny(gray, sigma=0.33):
    v = np.median(gray)
    lower = int(max(0, (1.0 - sigma) * v))
    upper = int(min(255, (1.0 + sigma) * v))
    return cv.Canny(gray, lower, upper), lower, upper

# 동영상에서도 같은 함수를 쓸 수 있도록 vtest.avi 의 현재 프레임 한 장도 가져오기
cap = cv.VideoCapture('vtest.avi')
ret, frame = cap.read()
inputs = [(name, cv.imread(name, cv.IMREAD_GRAYSCALE)) for name in ['messi5.jpg', 'sudoku.png', 'home.jpg']]
if ret:
    inputs.append(('vtest frame', cv.cvtColor(frame, cv.COLOR_BGR2GRAY)))

for name, gray in inputs:
    blur = cv.GaussianBlur(gray, (5, 5), 0)

    edges, lo, hi = auto_canny(blur)
    # 비교: Otsu 임계값을 maxVal 로, 절반을 minVal 로
    otsu, _ = cv.threshold(blur, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    edges_otsu = cv.Canny(blur, 0.5 * otsu, otsu)

    print('%-11s 중앙값=%5.1f → median 방식 (%3d, %3d) 엣지 %5d개 | Otsu 방식 (%3d, %3d) 엣지 %5d개'
          % (name, np.median(blur), lo, hi, cv.countNonZero(edges),
             0.5 * otsu, otsu, cv.countNonZero(edges_otsu)))
    cv.imshow('auto ' + name, edges)
`, desc: '<p><code>cv.VideoCapture("vtest.avi")</code> 로 동영상을 열면 <code>cap.read()</code> 는 현재 프레임 <b>한 장</b>을 돌려줍니다. 모든 프레임을 처리하고 싶다면 while 반복 대신, 입력 소스를 🎞️ 동영상으로 두고 <code>process(frame)</code> 안에서 <code>auto_canny</code> 를 호출하세요.</p>' },
      { type: 'code', title: '예제 6 · 웹캠 카툰 효과 (Canny 윤곽 + 색 단순화)', code: String.raw`
import cv2 as cv
import numpy as np

# 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸면 실시간으로 동작합니다.
# 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 됩니다.
def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.medianBlur(gray, 5)                 # 점 노이즈에 강한 블러
    edges = cv.Canny(gray, 50, 150)
    edges = cv.dilate(edges, np.ones((2, 2), np.uint8))   # 선을 살짝 굵게

    color = cv.medianBlur(frame, 7)               # 색 영역을 뭉개기
    color = (color // 64) * 64 + 32               # 색 단계 줄이기 (포스터 효과)
    cartoon = color.copy()
    cartoon[edges > 0] = (0, 0, 0)                # 엣지 자리를 검은 선으로
    return cartoon, edges
`, desc: '<p><code>(color // 64) * 64 + 32</code> 는 0~255 를 4단계(32, 96, 160, 224)로 줄이는 계산입니다. 최대값이 3×64+32 = 224 라 uint8 범위를 넘지 않습니다. 웹캠이 없다면 🎞️ 동영상 Megamind.mp4 를 입력 소스로 골라 보세요.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 동전 무늬는 지우고 테두리만 남기기',
        desc: `<p><code>water_coins.jpg</code> 에 시작 코드 그대로 Canny 를 하면 동전 안의 글자·무늬까지 엣지가 잔뜩 나옵니다. <b>블러 크기</b>와 <b>두 임계값</b>을 조절해 <b>동전 테두리 원만</b> 깔끔하게 남기세요. (목표: 엣지 픽셀 수 약 3,000~3,500 개)</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# TODO 1: 블러 커널 크기 조절 (1 = 블러 없음, 홀수만 가능)
k = 1
blur = cv.GaussianBlur(gray, (k, k), 0)

# TODO 2: 무늬는 사라지고 테두리만 남도록 임계값 조절
lo, hi = 10, 30
edges = cv.Canny(blur, lo, hi)

print('엣지 픽셀 수:', cv.countNonZero(edges))
overlay = img.copy()
overlay[edges > 0] = (0, 0, 255)
cv.imshow('edges', edges)
cv.imshow('overlay', overlay)
`,
        hint: `<p>블러를 5 정도로 키우면 동전 무늬가 크게 줄어듭니다. 동전 테두리는 흰 배경과의 대비가 커서 maxVal 을 150 정도로 올려도 살아남습니다. minVal 은 maxVal 의 1/3 쯤으로 두세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

k = 5                                   # 무늬를 뭉개는 블러
blur = cv.GaussianBlur(gray, (k, k), 0)

lo, hi = 50, 150                        # 대비가 큰 테두리만 남김
edges = cv.Canny(blur, lo, hi)

print('엣지 픽셀 수:', cv.countNonZero(edges))
overlay = img.copy()
overlay[edges > 0] = (0, 0, 255)
cv.imshow('edges', edges)
cv.imshow('overlay', overlay)
`,
      },
      {
        title: '실습 2 · 자동 Canny 함수 완성하기',
        desc: `<p><code>auto_canny(gray, sigma)</code> 함수가 이미지의 중앙값을 이용해 minVal/maxVal 을 계산하도록 완성하세요. 세 이미지에 대해 계산된 임계값과 엣지 픽셀 수를 출력하고, sigma 를 0.2 와 0.5 로 바꿨을 때의 차이도 비교해 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def auto_canny(gray, sigma=0.33):
    # TODO: 중앙값 v 를 구하고 lower, upper 를 계산하세요 (0~255 범위를 벗어나지 않게)
    lower = 0
    upper = 255
    return cv.Canny(gray, lower, upper), lower, upper

for name in ['lena.jpg', 'building.jpg', 'smarties.png']:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    edges, lo, hi = auto_canny(gray)
    print(name, '→ min=%d max=%d 엣지=%d' % (lo, hi, cv.countNonZero(edges)))
    cv.imshow(name, edges)
`,
        hint: `<p><code>v = np.median(gray)</code>, <code>lower = int(max(0, (1.0 - sigma) * v))</code>, <code>upper = int(min(255, (1.0 + sigma) * v))</code></p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def auto_canny(gray, sigma=0.33):
    v = np.median(gray)
    lower = int(max(0, (1.0 - sigma) * v))
    upper = int(min(255, (1.0 + sigma) * v))
    return cv.Canny(gray, lower, upper), lower, upper

for name in ['lena.jpg', 'building.jpg', 'smarties.png']:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    for sigma in (0.2, 0.33, 0.5):
        edges, lo, hi = auto_canny(gray, sigma)
        print('%-13s sigma=%.2f → min=%3d max=%3d 엣지=%6d' % (name, sigma, lo, hi, cv.countNonZero(edges)))
    edges, lo, hi = auto_canny(gray)
    cv.imshow(name, edges)
`,
      },
      {
        title: '실습 3 · 웹캠 네온사인 엣지',
        desc: `<p>어둡게 만든 화면 위에 Canny 엣지를 <b>밝은 청록색(BGR 255, 255, 0)</b>으로 입히고, 엣지를 블러로 번지게 해 네온사인처럼 빛나는 효과를 만드세요. 트랙바 <b>sigma</b>(0~100, ×0.01)로 자동 임계값의 범위를 조절합니다. 입력 소스를 📷 웹캠으로 바꿔 확인하세요. 웹캠이 없으면 🎞️ 동영상 Megamind.mp4 를 골라 보세요 — 애니메이션 윤곽이 네온처럼 빛납니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('sigma', 'result', 33, 100, nothing)

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    sigma = cv.getTrackbarPos('sigma', 'result') / 100

    # TODO 1: 중앙값 기반으로 lo, hi 를 계산해 Canny 적용
    edges = cv.Canny(gray, 100, 200)

    # TODO 2: 청록색 엣지 이미지(neon)를 만들고 블러로 번지게(glow) 하기
    # TODO 3: 어둡게 만든 frame 에 neon 과 glow 를 더하기 (cv.add)
    result = frame
    return result
`,
        hint: `<p><code>neon = np.zeros_like(frame); neon[edges &gt; 0] = (255, 255, 0)</code>, <code>glow = cv.GaussianBlur(neon, (9, 9), 0)</code>, 어둡게는 <code>cv.convertScaleAbs(frame, alpha=0.3)</code>. 더할 때는 255 를 넘지 않도록 <code>cv.add()</code> 를 사용하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('sigma', 'result', 33, 100, nothing)

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    sigma = cv.getTrackbarPos('sigma', 'result') / 100

    v = np.median(gray)
    lo = int(max(0, (1 - sigma) * v))
    hi = int(min(255, (1 + sigma) * v))
    edges = cv.Canny(gray, lo, hi)

    neon = np.zeros_like(frame)
    neon[edges > 0] = (255, 255, 0)                # 청록색 선
    glow = cv.GaussianBlur(neon, (9, 9), 0)        # 번짐 효과

    dark = cv.convertScaleAbs(frame, alpha=0.3)    # 배경 어둡게
    result = cv.add(cv.add(dark, glow), neon)
    cv.putText(result, 'min=%d max=%d' % (lo, hi), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    return result
`,
      },
    ],
    quiz: [
      { q: "Canny 엣지 검출의 4단계를 올바른 순서로 나열한 것은?", options: ["그래디언트 → 노이즈 제거 → 히스테리시스 → 비최대 억제","노이즈 제거 → 히스테리시스 → 그래디언트 → 비최대 억제","노이즈 제거 → 그래디언트 → 비최대 억제 → 히스테리시스 임계처리","비최대 억제 → 노이즈 제거 → 그래디언트 → 히스테리시스"], answer: 2, explain: "블러로 노이즈를 줄이고, Sobel 로 크기·방향을 구한 뒤, 비최대 억제로 얇게 만들고, 두 임계값과 연결성으로 진짜 엣지를 고릅니다." },
      { q: "비최대 억제(Non-maximum Suppression)의 역할은?", options: ["노이즈를 제거한다","두꺼운 엣지 띠에서 그래디언트 방향으로 최대인 픽셀만 남겨 1픽셀 두께로 만든다","끊어진 엣지를 이어 준다","컬러 이미지를 흑백으로 바꾼다"], answer: 1, explain: "산의 능선만 남기듯, 엣지에 수직인 방향으로 이웃보다 큰 픽셀만 남깁니다." },
      { q: "cv.Canny(img, 100, 200) 에서 그래디언트 크기가 150 인 픽셀은 어떻게 처리되나요?", options: ["항상 엣지로 남는다","항상 버려진다","크기가 100 이 될 때까지 블러를 반복한다","크기 200 이상인 확실한 엣지와 연결되어 있을 때만 엣지로 남는다"], answer: 3, explain: "minVal 과 maxVal 사이의 픽셀은 “후보”이며, 확실한 엣지와 이어져 있을 때만 인정됩니다(히스테리시스)." },
      { q: "엣지가 너무 많이(지저분하게) 나올 때 가장 먼저 시도할 조치로 알맞지 않은 것은?", options: ["Canny 전에 GaussianBlur 적용하기","maxVal 을 올리기","minVal 과 maxVal 을 모두 낮추기","minVal 을 조금 올리기"], answer: 2, explain: "두 임계값을 낮추면 더 많은 픽셀이 엣지로 인정되어 오히려 더 지저분해집니다." },
      { q: "중앙값(median) 기반 자동 임계값의 장점은?", options: ["밝기 분포가 다른 이미지마다 임계값을 자동으로 맞춰 좋은 출발점을 준다","항상 가장 정확한 엣지를 보장한다","Canny 보다 빠른 새로운 알고리즘이다","컬러 정보를 이용해 엣지를 찾는다"], answer: 0, explain: "이미지마다 중앙값이 달라 임계값이 자동으로 조정됩니다. 완벽한 정답은 아니므로 sigma 로 미세 조정합니다." },
    ],
  },

  /* ======================================================================
   * w3-4 이미지 피라미드와 컨투어 시작
   * ====================================================================== */
  {
    id: 'w3-4',
    summary: '이미지를 단계적으로 줄이고 키우는 이미지 피라미드와 이를 이용한 자연스러운 합성(사과+오렌지)을 살펴본 뒤, 이미지 속 물체의 외곽선을 점들의 목록으로 얻는 컨투어(Contour)의 기초를 배웁니다.',
    goals: [
      'cv.pyrDown()/cv.pyrUp()으로 가우시안 피라미드를 만들고, 축소 후 확대하면 정보가 손실되는 이유를 설명할 수 있다',
      '라플라시안 피라미드의 개념과 피라미드 블렌딩이 경계를 자연스럽게 만드는 원리를 설명할 수 있다',
      '이진화 → cv.findContours() → cv.drawContours() 흐름으로 컨투어를 찾고 그릴 수 있다',
      'RETR_EXTERNAL/LIST/TREE 모드와 CHAIN_APPROX_NONE/SIMPLE 의 차이를 결과로 확인할 수 있다',
    ],
    schedule: [['도입', 3], ['가우시안 · 라플라시안 피라미드', 10], ['피라미드 블렌딩', 7], ['컨투어 찾기와 그리기', 12], ['검색 모드 · 근사 방법', 8], ['실습 과제', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 이미지 피라미드란?</h3>
<p>사진 속 얼굴을 찾는데 얼굴이 크게 찍혔는지 작게 찍혔는지 모른다면? 같은 이미지를 <b>여러 해상도로</b> 만들어 두고 각각에서 찾으면 됩니다. 원본을 맨 아래에 두고 점점 작은 이미지를 위로 쌓으면 피라미드 모양이 되어 <b>이미지 피라미드(Image Pyramid)</b>라고 부릅니다.</p>
<h4>가우시안 피라미드 (Gaussian Pyramid)</h4>
<ul>
<li><code>cv.pyrDown(img)</code> — 가우시안 블러를 한 뒤 <b>짝수 행·열을 제거</b> → 가로·세로 1/2, 넓이 1/4. 한 단계를 <b>옥타브(octave)</b>라고 부릅니다</li>
<li><code>cv.pyrUp(img)</code> — 행·열 사이에 0 을 끼워 넣고 블러로 채워 → 가로·세로 2배</li>
</ul>
<p>블러 없이 그냥 픽셀을 건너뛰면 계단 현상(에일리어싱)이 생기므로, 줄이기 전에 먼저 부드럽게 만드는 것이 핵심입니다.</p>
<h4>라플라시안 피라미드 (Laplacian Pyramid)</h4>
<p>pyrDown 으로 줄였다가 pyrUp 으로 키우면 <b>크기는 돌아오지만 디테일은 돌아오지 않습니다.</b> 그 “잃어버린 차이”를 모은 것이 라플라시안 피라미드입니다.</p>
<p><b>Lᵢ = Gᵢ − pyrUp(Gᵢ₊₁)</b> &nbsp; (Gᵢ = 가우시안 피라미드의 i 번째 층)</p>
<p>대부분 0 에 가깝고 엣지 부분만 값이 있어 엣지 이미지처럼 보이며, 이미지 압축과 블렌딩에 쓰입니다.</p>` },
      { type: 'code', title: '예제 1 · 가우시안 피라미드 만들기 (pyrDown)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
lower1 = cv.pyrDown(img)       # 1/2 크기 (넓이 1/4)
lower2 = cv.pyrDown(lower1)
lower3 = cv.pyrDown(lower2)

for name, im in [('원본', img), ('레벨 1', lower1), ('레벨 2', lower2), ('레벨 3', lower3)]:
    print('%-5s: %d x %d' % (name, im.shape[1], im.shape[0]))

# 피라미드처럼 한 캔버스에 붙여 보기: 왼쪽에 원본, 오른쪽에 작은 것들을 위에서부터
h, w = img.shape[:2]
canvas = np.full((h, w + w // 2 + 10, 3), 255, np.uint8)
canvas[:h, :w] = img
x, y = w + 10, 0
for im in (lower1, lower2, lower3):
    ih, iw = im.shape[:2]
    canvas[y:y + ih, x:x + iw] = im
    y += ih + 5
cv.imshow('gaussian pyramid', canvas)

# 가장 작은 레벨을 원래 크기로 늘려 보면 정보가 얼마나 줄었는지 보임
cv.imshow('level 3 enlarged', cv.resize(lower3, (w, h), interpolation=cv.INTER_NEAREST))
` },
      { type: 'code', title: '예제 2 · pyrUp(pyrDown(img)) 은 원본이 아니다 — 라플라시안 층 보기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
lower = cv.pyrDown(img)
higher = cv.pyrUp(lower)         # 크기는 원래대로 돌아오지만…
print('원본', img.shape, '→ pyrDown', lower.shape, '→ pyrUp', higher.shape)

diff = cv.absdiff(img, higher)
print('원본과의 평균 차이 (0 이면 완벽 복원): %.2f' % diff.mean())

# 라플라시안 층 = 원본 - pyrUp(pyrDown(원본)) : 잃어버린 '디테일'
lap = img.astype(np.float32) - higher.astype(np.float32)
lap_vis = cv.convertScaleAbs(lap, alpha=4)      # 잘 보이게 4배로 키워서 표시

# 거꾸로: pyrUp(pyrDown) + 라플라시안 층 = 원본으로 복원
restored = np.clip(higher.astype(np.float32) + lap, 0, 255).astype(np.uint8)
print('라플라시안 층을 더하면 완전히 복원되나?', np.array_equal(restored, img))

cv.imshow('original', img)
cv.imshow('pyrUp(pyrDown(img))', higher)
cv.imshow('laplacian layer x4', lap_vis)
`, desc: '<p>pyrUp 결과는 흐릿하고, 라플라시안 층에는 윤곽과 질감(잔디, 유니폼 글자)만 밝게 남습니다. 두 개를 더하면 원본이 정확히 복원되므로 “작은 이미지 + 차이 정보” 형태로 이미지를 저장할 수 있습니다.</p>' },
      { type: 'warn', html: `<p><b>홀수 크기 주의!</b> 가로가 343 처럼 홀수이면 pyrDown 결과는 172, 다시 pyrUp 하면 344 가 되어 원본과 크기가 달라집니다. 이럴 때는 <code>cv.pyrUp(small, dstsize=(원래가로, 원래세로))</code> 로 크기를 지정하세요. 아래 블렌딩 예제에서 이 방법을 씁니다.</p>` },
      { type: 'text', html: `<h3>2. 피라미드 블렌딩 — 사과와 오렌지 합치기</h3>
<p>사과 사진의 왼쪽 절반과 오렌지 사진의 오른쪽 절반을 그냥 이어 붙이면 가운데에 <b>뚜렷한 이음매</b>가 보입니다. 튜토리얼은 피라미드를 이용해 이 경계를 자연스럽게 녹입니다.</p>
<ol>
<li>사과, 오렌지 각각의 <b>가우시안 피라미드</b>를 만든다 (튜토리얼은 6단계)</li>
<li>각각의 <b>라플라시안 피라미드</b>를 만든다</li>
<li>같은 층끼리 <b>왼쪽 절반(사과) + 오른쪽 절반(오렌지)</b>으로 붙인다</li>
<li>가장 작은 층부터 pyrUp 하며 다음 층을 더해 <b>다시 쌓아 올린다</b></li>
</ol>
<p><b>왜 자연스러워질까요?</b> 작은 층(색·밝기 같은 큰 흐름)에서 붙인 경계는 pyrUp 을 거듭하며 <b>넓게 번져</b> 부드럽게 섞이고, 큰 층(잔 무늬)에서 붙인 경계는 좁게 유지되어 선명함이 살아납니다. 큰 흐름은 넓게, 디테일은 좁게 섞는 것이 핵심입니다.</p>` },
      { type: 'code', title: '예제 3 · 단순 이어 붙이기 vs 피라미드 블렌딩', code: String.raw`
import cv2 as cv
import numpy as np

A = cv.imread('apple.jpg')
B = cv.imread('orange.jpg')
LEVELS = 6
e1 = cv.getTickCount()

# 1) 가우시안 피라미드 (float32 로 계산해야 음수 차이를 잃지 않음)
gpA = [A.astype(np.float32)]
gpB = [B.astype(np.float32)]
for i in range(LEVELS - 1):
    gpA.append(cv.pyrDown(gpA[-1]))
    gpB.append(cv.pyrDown(gpB[-1]))

# 2) 라플라시안 피라미드 (가장 작은 층부터 저장)
lpA = [gpA[-1]]
lpB = [gpB[-1]]
for i in range(LEVELS - 1, 0, -1):
    size = (gpA[i - 1].shape[1], gpA[i - 1].shape[0])
    lpA.append(gpA[i - 1] - cv.pyrUp(gpA[i], dstsize=size))
    lpB.append(gpB[i - 1] - cv.pyrUp(gpB[i], dstsize=size))

# 3) 층마다 왼쪽 절반(사과) + 오른쪽 절반(오렌지)
LS = []
for la, lb in zip(lpA, lpB):
    cols = la.shape[1]
    LS.append(np.hstack((la[:, :cols // 2], lb[:, cols // 2:])))

# 4) 다시 쌓아 올리기
blend = LS[0]
for i in range(1, LEVELS):
    size = (LS[i].shape[1], LS[i].shape[0])
    blend = cv.pyrUp(blend, dstsize=size) + LS[i]
blend = np.clip(blend, 0, 255).astype(np.uint8)

# 비교용: 그냥 반반 이어 붙이기
cols = A.shape[1]
direct = np.hstack((A[:, :cols // 2], B[:, cols // 2:]))

t = (cv.getTickCount() - e1) / cv.getTickFrequency()
print('블렌딩 계산 시간: %.3f 초' % t)
cv.imshow('Direct blending', direct)
cv.imshow('Pyramid blending', blend)
`, desc: '<p>LEVELS 를 2, 4, 6 으로 바꿔 보세요. 레벨이 적으면 경계가 좁게 섞여 이음매가 남고, 많을수록 넓게 섞여 자연스러워집니다.</p>' },
      { type: 'text', html: `<h3>3. 컨투어(Contour)란?</h3>
<p><b>컨투어</b>는 같은 색(밝기)을 가진 영역의 <b>경계를 따라 이어진 점들의 곡선</b>입니다. 지도에서 같은 높이를 이은 “등고선”과 같은 말입니다. 컨투어를 얻으면 물체의 <b>모양 분석, 크기 측정, 개수 세기, 검출·인식</b>을 할 수 있어 영상처리에서 가장 많이 쓰는 도구 중 하나입니다.</p>
<p>정확한 결과를 위한 규칙:</p>
<ul>
<li>입력은 <b>이진 이미지</b> — findContours 전에 임계처리나 Canny 를 먼저 합니다</li>
<li><b>검은 배경 위 흰 물체</b>를 찾습니다 — 흰 배경 위 검은 도형이면 <code>THRESH_BINARY_INV</code> 로 반전</li>
<li>OpenCV 3.2 이후로는 findContours 가 입력 이미지를 <b>수정하지 않습니다</b></li>
</ul>
<p><code>contours, hierarchy = cv.findContours(이진이미지, 검색모드, 근사방법)</code></p>
<ul>
<li><b>contours</b> — 컨투어들을 담은 파이썬 <b>튜플</b>(리스트처럼 len, 인덱싱, for 문 사용). 각 원소는 한 물체의 경계점 배열로 모양이 <b>(점 개수, 1, 2)</b>, 각 점은 <b>(x, y)</b></li>
<li><b>hierarchy</b> — 컨투어 사이의 부모/자식 관계 정보 (모양: (1, 컨투어 수, 4))</li>
</ul>` },
      { type: 'warn', html: `<p><b>버전에 따라 반환값 개수가 다릅니다.</b> OpenCV 3.x 는 <code>image, contours, hierarchy</code> 3개를 반환했고, <b>OpenCV 4.x (이 강좌)</b> 는 <code>contours, hierarchy</code> <b>2개</b>를 반환합니다. 인터넷의 옛날 코드를 그대로 쓰면 “too many values to unpack” 오류가 나니 주의하세요.</p>` },
      { type: 'code', title: '예제 4 · 컨투어 찾고 그리기 (튜토리얼 흐름)', code: String.raw`
import numpy as np
import cv2 as cv

im = cv.imread('pic1.png')
assert im is not None, "file could not be read"
imgray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)

# 흰 배경 위 검은 도형 → 반전 이진화로 '검은 배경 위 흰 물체' 만들기
ret, thresh = cv.threshold(imgray, 127, 255, cv.THRESH_BINARY_INV)
contours, hierarchy = cv.findContours(thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

print('찾은 컨투어 수:', len(contours))
print('contours 의 자료형:', type(contours))
print('contours[0] 의 shape (점 개수, 1, 2):', contours[0].shape)
print('contours[0] 의 앞 3개 점 (x, y):', contours[0][:3].reshape(-1, 2).tolist())
print('hierarchy shape:', hierarchy.shape)

# ① 모든 컨투어 그리기: 인덱스 -1
all_img = im.copy()
cv.drawContours(all_img, contours, -1, (0, 255, 0), 3)

# ② 특정 컨투어 하나만: 인덱스 지정
one_img = im.copy()
cv.drawContours(one_img, contours, 5, (0, 0, 255), 3)

# ③ 튜토리얼이 권하는 방식: 컨투어 하나를 리스트로 감싸서 그리기 (두께 -1 = 채우기)
cnt = contours[5]
fill_img = im.copy()
cv.drawContours(fill_img, [cnt], 0, (255, 0, 0), -1)

cv.imshow('threshold', thresh)
cv.imshow('all contours', all_img)
cv.imshow('contour #5', one_img)
cv.imshow('contour #5 filled', fill_img)
`, desc: '<p>컨투어 수가 눈에 보이는 도형 수보다 많은 이유는 RETR_TREE 가 사각형 안의 흰 점(구멍)과 물음표의 점까지 모두 찾기 때문입니다. 바로 아래에서 검색 모드를 바꿔 비교합니다.</p>' },
      { type: 'table', head: ['인자/반환', '값', '설명'], rows: [
        ['<code>mode</code>', '<code>cv.RETR_EXTERNAL</code>', '가장 바깥 컨투어만 (구멍 무시) — 물체 개수 셀 때'],
        ['', '<code>cv.RETR_LIST</code>', '모든 컨투어를 계층 관계 없이 나열'],
        ['', '<code>cv.RETR_CCOMP</code>', '2단계 계층: 바깥 경계 / 그 안의 구멍'],
        ['', '<code>cv.RETR_TREE</code>', '전체 부모-자식 계층 트리'],
        ['<code>method</code>', '<code>cv.CHAIN_APPROX_NONE</code>', '경계의 모든 점 저장'],
        ['', '<code>cv.CHAIN_APPROX_SIMPLE</code>', '직선 구간의 중간 점 생략, 끝점만 저장'],
        ['<code>hierarchy[0][i]</code>', '[Next, Previous, First_Child, Parent]', 'i번 컨투어의 다음/이전/첫 자식/부모 인덱스 (없으면 -1)'],
      ] },
      { type: 'text', html: `<h3>4. 검색 모드(Retrieval Mode)와 계층</h3>
<p><code>pic1.png</code> 의 큰 검은 사각형 안에는 흰 점 7개가 있습니다. 반전 이진화 후에는 흰 사각형 안에 <b>검은 구멍 7개</b>가 뚫린 모양이 되죠. 구멍의 경계도 컨투어이므로, 검색 모드에 따라 구멍을 셀지 말지가 달라집니다.</p>
<ul>
<li><b>RETR_EXTERNAL</b> — 바깥 윤곽만. “도형이 몇 개인가?”에 딱 맞음</li>
<li><b>RETR_TREE</b> — 구멍까지 모두 찾고, 사각형(부모)과 구멍(자식)의 관계를 hierarchy 에 기록</li>
</ul>
<p>hierarchy 의 <b>Parent 값이 -1</b> 이면 가장 바깥 컨투어, 아니면 누군가의 안쪽에 있는 컨투어(구멍)입니다. 계층 구조는 뒤의 프로젝트(문서 속 도형, 과녁 등)에서 유용하게 쓰입니다.</p>` },
      { type: 'code', title: '예제 5 · RETR_EXTERNAL 과 RETR_TREE 비교', code: String.raw`
import cv2 as cv
import numpy as np

im = cv.imread('pic1.png')
gray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
_, thresh = cv.threshold(gray, 127, 255, cv.THRESH_BINARY_INV)

for mode_name in ['RETR_EXTERNAL', 'RETR_LIST', 'RETR_CCOMP', 'RETR_TREE']:
    contours, hierarchy = cv.findContours(thresh, getattr(cv, mode_name), cv.CHAIN_APPROX_SIMPLE)
    print('%-14s → 컨투어 %2d 개' % (mode_name, len(contours)))

# EXTERNAL 결과
ext, _ = cv.findContours(thresh, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
vis_ext = im.copy()
cv.drawContours(vis_ext, ext, -1, (0, 0, 255), 2)

# TREE 결과: 부모가 없으면(바깥) 빨강, 부모가 있으면(구멍) 파랑
tree, hier = cv.findContours(thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
vis_tree = im.copy()
for i, (nxt, prv, child, parent) in enumerate(hier[0]):
    color = (0, 0, 255) if parent == -1 else (255, 0, 0)
    cv.drawContours(vis_tree, tree, i, color, 2)
    if child != -1:
        print('%d번 컨투어는 자식(구멍)을 가짐 → 첫 자식: %d번, 넓이 %.0f' % (i, child, cv.contourArea(tree[i])))

cv.imshow('RETR_EXTERNAL', vis_ext)
cv.imshow('RETR_TREE (red=outer, blue=hole)', vis_tree)
`, desc: '<p>삼각형에서도 작은 구멍 몇 개가 파란색으로 잡히는데, 원본 이미지의 삼각형 안에 눈에 잘 안 보이는 흰 점이 있기 때문입니다. 이런 작은 컨투어는 보통 면적으로 걸러냅니다(다음 시간).</p>' },
      { type: 'text', html: `<h3>5. 근사 방법 — CHAIN_APPROX_NONE vs SIMPLE</h3>
<p>컨투어는 경계점 좌표의 목록인데, <b>모든 점</b>을 저장할 필요가 있을까요? 직사각형의 윗변은 직선이므로 <b>양 끝점 2개</b>만 있으면 충분합니다.</p>
<ul>
<li><code>cv.CHAIN_APPROX_NONE</code> — 경계의 모든 픽셀 좌표 저장 (튜토리얼의 사각형 예: 734개)</li>
<li><code>cv.CHAIN_APPROX_SIMPLE</code> — 가로·세로·대각선 직선 구간의 중간 점을 버림 (사각형이면 <b>4개</b>) → 메모리 절약</li>
</ul>
<p>단, SIMPLE 이 줄여 주는 것은 <b>정확히 가로/세로/45° 대각선</b> 구간뿐입니다. 비스듬히 기울어진 사각형은 계단 모양 경계라 점이 많이 남습니다. 이런 모양을 꼭짓점 몇 개로 단순화하는 방법(approxPolyDP)은 다음 시간에 배웁니다.</p>` },
      { type: 'code', title: '예제 6 · 컨투어 점을 찍어 근사 방법 비교하기', code: String.raw`
import cv2 as cv
import numpy as np

# 튜토리얼처럼 반듯한 직사각형 하나 그리기
img = np.zeros((300, 400, 3), np.uint8)
cv.rectangle(img, (60, 60), (340, 240), (255, 255, 255), -1)
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

for method_name, color in [('CHAIN_APPROX_NONE', (0, 0, 255)), ('CHAIN_APPROX_SIMPLE', (0, 255, 0))]:
    contours, _ = cv.findContours(gray, cv.RETR_EXTERNAL, getattr(cv, method_name))
    cnt = contours[0]
    print('%-20s 점 개수: %d' % (method_name, len(cnt)))
    vis = img.copy()
    for p in cnt:
        x, y = p[0]
        cv.circle(vis, (int(x), int(y)), 3, color, -1)   # 저장된 점마다 동그라미
    cv.imshow(method_name, vis)

# 기울어진 사각형(pic1.png 오른쪽 위)은 SIMPLE 이어도 점이 많다
im = cv.imread('pic1.png')
_, th = cv.threshold(cv.cvtColor(im, cv.COLOR_BGR2GRAY), 127, 255, cv.THRESH_BINARY_INV)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
tilted = [c for c in contours if cv.pointPolygonTest(c, (320, 110), False) >= 0][0]
print('기울어진 사각형 (SIMPLE) 점 개수:', len(tilted))
vis2 = im.copy()
for p in tilted:
    cv.circle(vis2, (int(p[0][0]), int(p[0][1])), 2, (0, 0, 255), -1)
cv.imshow('tilted rectangle SIMPLE points', vis2)
`, desc: '<p><code>cv.pointPolygonTest(컨투어, (x, y), False)</code> 는 점이 컨투어 안쪽이면 +1, 경계면 0, 바깥이면 -1 을 돌려줍니다. 여기서는 “(320, 110) 을 포함하는 도형”을 고르는 데 사용했습니다.</p>' },
      { type: 'tip', html: `<p><b>좌표 순서 다시 한번!</b> 컨투어의 점은 <b>(x, y)</b> 순서이고, numpy 이미지 인덱싱은 <b>img[y, x]</b> 순서입니다. 컨투어 점으로 픽셀 값을 읽을 때는 <code>img[y, x]</code> 로 뒤집어 써야 합니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 가우시안 피라미드 레벨별 엣지 비교',
        desc: `<p>입력 이미지(또는 📷 웹캠)를 트랙바 <b>level</b>(0~3) 만큼 pyrDown 한 뒤 Canny 를 적용하고, 결과를 다시 원래 크기로 키워서 보여 주세요. 레벨이 올라갈수록 잔 질감은 사라지고 큰 윤곽만 남으며, 계산도 빨라집니다. 화면에 처리 시간(ms)도 표시하세요. 입력 소스를 📷 웹캠이나 🎞️ 동영상(vtest.mp4)으로 바꾸면 레벨별 속도 차이가 더 잘 느껴집니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('level', 'result', 1, 3, nothing)

def process(frame):
    e1 = cv.getTickCount()
    level = cv.getTrackbarPos('level', 'result')

    small = frame
    # TODO 1: level 번 만큼 pyrDown 반복하기
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
    edges = cv.Canny(gray, 50, 150)
    # TODO 2: edges 를 frame 크기로 되돌리기 (cv.resize, INTER_NEAREST)

    ms = (cv.getTickCount() - e1) / cv.getTickFrequency() * 1000
    cv.putText(edges, 'level=%d  %.1f ms' % (level, ms), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, 255, 2)
    return edges
`,
        hint: `<p><code>for _ in range(level): small = cv.pyrDown(small)</code>, 되돌리기는 <code>cv.resize(edges, (frame.shape[1], frame.shape[0]), interpolation=cv.INTER_NEAREST)</code>. 크기를 되돌린 뒤에 putText 해야 글자가 잘 보입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('level', 'result', 1, 3, nothing)

def process(frame):
    e1 = cv.getTickCount()
    level = cv.getTrackbarPos('level', 'result')

    small = frame
    for _ in range(level):
        small = cv.pyrDown(small)
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
    edges = cv.Canny(gray, 50, 150)
    edges = cv.resize(edges, (frame.shape[1], frame.shape[0]), interpolation=cv.INTER_NEAREST)

    ms = (cv.getTickCount() - e1) / cv.getTickFrequency() * 1000
    cv.putText(edges, 'level=%d  %.1f ms' % (level, ms), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, 255, 2)
    return edges
`,
      },
      {
        title: '실습 2 · detect_blob.png 도형 개수 세고 색칠하기',
        desc: `<p>검은 배경 위 도형들이 있는 <code>detect_blob.png</code> 에서 <b>도형 개수</b>를 세고, 각 도형을 <b>서로 다른 색으로 채워</b> 그린 뒤 번호를 적으세요. 가운데가 뚫린 사각형·고리의 구멍은 따로 세면 안 됩니다. 면적 100 미만의 아주 작은 조각은 제외합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('detect_blob.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 20, 255, cv.THRESH_BINARY)

# TODO 1: 구멍을 따로 세지 않는 검색 모드로 바꾸기
contours, _ = cv.findContours(th, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

# TODO 2: 면적(cv.contourArea) 100 미만은 제외하기
shapes = contours

print('도형 개수:', len(shapes))
vis = np.zeros_like(img)
# TODO 3: 도형마다 다른 색으로 채우고(두께 -1) 번호 쓰기
cv.drawContours(vis, shapes, -1, (255, 255, 255), 1)
cv.imshow('threshold', th)
cv.imshow('shapes', vis)
`,
        hint: `<p>검색 모드는 <code>cv.RETR_EXTERNAL</code>. 걸러내기는 <code>[c for c in contours if cv.contourArea(c) &gt;= 100]</code>. 색은 <code>rng = np.random.default_rng(0)</code> 후 <code>tuple(int(v) for v in rng.integers(60, 256, 3))</code> 로 만들고, 번호 위치는 <code>cv.boundingRect(c)</code> 의 x, y 를 쓰면 됩니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('detect_blob.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 20, 255, cv.THRESH_BINARY)

contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
shapes = [c for c in contours if cv.contourArea(c) >= 100]

print('도형 개수:', len(shapes))
vis = np.zeros_like(img)
rng = np.random.default_rng(0)
for i, c in enumerate(shapes):
    color = tuple(int(v) for v in rng.integers(60, 256, 3))
    cv.drawContours(vis, [c], 0, color, -1)
    x, y, w, h = cv.boundingRect(c)
    cv.putText(vis, str(i), (x, y - 3 if y > 15 else y + 15), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
cv.imshow('threshold', th)
cv.imshow('shapes', vis)
`,
      },
      {
        title: '실습 3 · 웹캠 컨투어 뷰어',
        desc: `<p>입력 프레임을 흑백 → 블러 → Otsu 반전 이진화한 뒤 바깥 컨투어를 찾아 원본 위에 그리세요. 작은 노이즈 컨투어가 너무 많으므로 <b>면적이 트랙바 minArea 값(×100) 이상인 것만</b> 그리고, 그린 개수를 화면에 표시하세요. 흰 종이 위에 어두운 물건을 올려 놓고 📷 웹캠으로 비춰 보면 좋습니다. 웹캠이 없으면 🎞️ 동영상 cup.mp4(손으로 움직이는 컵)를 입력 소스로 골라 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('minArea', 'result', 10, 100, nothing)   # x100 픽셀

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    _, th = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    min_area = cv.getTrackbarPos('minArea', 'result') * 100
    # TODO: 면적이 min_area 이상인 컨투어만 골라 big 에 담기
    big = contours

    vis = frame.copy()
    cv.drawContours(vis, big, -1, (0, 255, 0), 2)
    cv.putText(vis, 'objects: %d' % len(big), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    return vis, th
`,
        hint: `<p><code>big = [c for c in contours if cv.contourArea(c) &gt;= min_area]</code> 한 줄이면 됩니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('minArea', 'result', 10, 100, nothing)   # x100 픽셀

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    _, th = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    min_area = cv.getTrackbarPos('minArea', 'result') * 100
    big = [c for c in contours if cv.contourArea(c) >= min_area]

    vis = frame.copy()
    cv.drawContours(vis, big, -1, (0, 255, 0), 2)
    cv.putText(vis, 'objects: %d' % len(big), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    return vis, th
`,
      },
    ],
    quiz: [
      { q: "548×342 크기 이미지에 cv.pyrDown() 을 한 번 적용한 결과 크기는?", options: ["1096×684","274×171","137×86","548×342 (크기 유지, 블러만 적용)"], answer: 1, explain: "pyrDown 은 가로·세로를 각각 1/2 로 줄입니다(넓이는 1/4)." },
      { q: "cv.pyrUp(cv.pyrDown(img)) 의 결과에 대한 설명으로 옳은 것은?", options: ["원본과 완전히 같다","크기가 원본의 1/4 이다","색이 반전된다","크기는 같지만 잃어버린 디테일이 복원되지 않아 흐릿하다"], answer: 3, explain: "pyrDown 에서 버린 정보는 되돌릴 수 없습니다. 그 차이가 라플라시안 피라미드의 한 층입니다." },
      { q: "흰 배경 위의 검은 도형들에서 컨투어를 찾기 전에 해야 할 일로 가장 알맞은 것은?", options: ["THRESH_BINARY_INV 로 반전 이진화해 검은 배경 위 흰 물체로 만든다","그대로 findContours 에 넣는다","컬러로 변환한다","pyrUp 으로 키운다"], answer: 0, explain: "findContours 는 흰색을 물체로 봅니다. 반전하지 않으면 흰 배경 전체가 하나의 큰 물체가 됩니다." },
      { q: "OpenCV 4.x 에서 cv.findContours() 의 반환값은?", options: ["contours 하나","image, contours, hierarchy 세 개","contours, hierarchy 두 개","contours 의 개수(정수)"], answer: 2, explain: "OpenCV 4.x 는 2개를 반환합니다. 3개를 받는 코드는 OpenCV 3.x 용입니다." },
      { q: "반듯한 직사각형 하나의 컨투어를 CHAIN_APPROX_SIMPLE 로 찾으면 점은 몇 개인가요?", options: ["2개","둘레 픽셀 수만큼","8개","4개"], answer: 3, explain: "SIMPLE 은 가로·세로 직선 구간의 중간 점을 버리고 끝점만 남기므로 네 꼭짓점만 저장됩니다." },
    ],
  },
  /* ======================================================================
   * w3-5 컨투어 특징과 속성
   * ====================================================================== */
  {
    id: 'w3-5',
    summary: '찾아낸 컨투어로 무게중심·면적·둘레를 재고, 다각형 근사·볼록 껍질·경계 도형으로 모양을 요약한 뒤, 종횡비·extent·solidity 같은 속성으로 “이 도형은 삼각형/사각형/원”이라고 이름을 붙여 봅니다.',
    goals: [
      'cv.moments()로 무게중심을 구하고 contourArea, arcLength 로 면적과 둘레를 잴 수 있다',
      'approxPolyDP 의 epsilon 이 꼭짓점 수에 주는 영향을 설명하고, convexHull 로 볼록 껍질을 구할 수 있다',
      'boundingRect, minAreaRect, minEnclosingCircle, fitEllipse, fitLine 으로 도형을 둘러쌀 수 있다',
      '종횡비 · extent · solidity · 등가 지름 · 평균 색 · 극점 같은 컨투어 속성을 계산할 수 있다',
      '꼭짓점 수와 속성을 조합해 도형 이름(삼각형/사각형/원)을 자동으로 붙일 수 있다',
    ],
    schedule: [['도입 · 컨투어 복습', 3], ['모멘트 · 면적 · 둘레', 7], ['근사화 · 볼록 껍질', 9], ['경계 도형', 9], ['컨투어 속성', 8], ['도형 분류 실전 · 실습', 9], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 모멘트(Moments)와 무게중심</h3>
<p><b>이미지 모멘트</b>는 도형을 이루는 픽셀들의 위치를 여러 방식으로 “합산한” 숫자 묶음입니다. <code>cv.moments(cnt)</code> 는 이 값들을 딕셔너리로 돌려줍니다.</p>
<ul>
<li><b>m00</b> — 모든 픽셀을 1씩 더한 값 = <b>면적</b></li>
<li><b>m10</b> — 픽셀마다 x 좌표를 더한 값, <b>m01</b> — y 좌표를 더한 값</li>
<li>따라서 <b>무게중심(centroid)</b>: <b>cx = m10 / m00</b>, <b>cy = m01 / m00</b> (x 좌표들의 평균, y 좌표들의 평균)</li>
</ul>
<p>무게중심은 물체의 “대표 위치”로, 물체 추적(4주차 가상 페인터)에서 핵심적으로 쓰입니다. 선처럼 면적이 0 인 컨투어는 m00 = 0 이라 나눗셈 오류가 나므로 <b>반드시 확인</b>하세요.</p>
<p>함께 쓰는 함수:</p>
<ul>
<li><code>cv.contourArea(cnt)</code> — 면적 (= M['m00'])</li>
<li><code>cv.arcLength(cnt, True)</code> — 둘레 길이. 두 번째 인자는 <b>닫힌 도형이면 True</b>, 열린 곡선이면 False</li>
</ul>` },
      { type: 'code', title: '예제 1 · 도형마다 무게중심 · 면적 · 둘레 구하기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 127, 255, cv.THRESH_BINARY_INV)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

# 튜토리얼처럼 모멘트 딕셔너리 일부 출력
M = cv.moments(contours[0])
print('모멘트 키 예시:', list(M.keys())[:10])

vis = img.copy()
for i, cnt in enumerate(contours):
    M = cv.moments(cnt)
    if M['m00'] == 0:          # 면적 0 이면 무게중심을 구할 수 없음
        continue
    cx = int(M['m10'] / M['m00'])
    cy = int(M['m01'] / M['m00'])
    area = cv.contourArea(cnt)
    perimeter = cv.arcLength(cnt, True)
    print('#%d 중심=(%3d,%3d)  면적=%7.1f (m00=%7.1f)  둘레=%6.1f' % (i, cx, cy, area, M['m00'], perimeter))

    cv.drawContours(vis, [cnt], 0, (0, 200, 0), 2)
    cv.circle(vis, (cx, cy), 4, (0, 0, 255), -1)
    cv.putText(vis, str(i), (cx + 6, cy - 6), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
cv.imshow('centroids', vis)
` },
      { type: 'text', html: `<h3>2. 컨투어 근사화와 볼록 껍질</h3>
<h4>근사화 — cv.approxPolyDP(cnt, epsilon, closed)</h4>
<p>울퉁불퉁한 컨투어를 <b>꼭짓점이 더 적은 다각형</b>으로 단순화합니다(Douglas-Peucker 알고리즘). 종이에 그려진 삐뚤빼뚤한 사각형도 “꼭짓점 4개”로 요약할 수 있죠.</p>
<ul>
<li><b>epsilon</b> — 원래 컨투어와 근사 다각형 사이에 허용하는 <b>최대 거리</b>. 클수록 대충(꼭짓점 적게), 작을수록 원본에 가깝게(꼭짓점 많게)</li>
<li>도형 크기에 맞추기 위해 보통 <b>둘레의 비율</b>로 정합니다: <code>epsilon = 0.02 * cv.arcLength(cnt, True)</code> (튜토리얼은 10%와 1%를 비교)</li>
</ul>
<h4>볼록 껍질 — cv.convexHull(cnt)</h4>
<p>도형 바깥에 <b>고무줄을 씌웠을 때</b> 생기는 모양입니다. 안으로 움푹 들어간 부분(<b>볼록 결함, convexity defect</b>)을 건너뛰어 연결합니다. 손 모양에서 손가락 사이 골짜기를 찾는 데 유명하게 쓰입니다.</p>
<ul>
<li><code>cv.isContourConvex(cnt)</code> — 도형이 볼록한지 True/False</li>
<li><code>cv.convexHull(cnt, returnPoints=False)</code> — 좌표 대신 컨투어 점의 <b>인덱스</b>를 반환 (볼록 결함 계산에 필요)</li>
</ul>` },
      { type: 'code', title: '예제 2 · 트랙바로 epsilon 바꾸며 근사화 관찰하기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 127, 255, cv.THRESH_BINARY_INV)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE)

# 점 (50, 230) 을 포함하는 도형 = 왼쪽 아래 얼굴 모양
cnt = [c for c in contours if cv.pointPolygonTest(c, (50, 230), False) >= 0][0]
peri = cv.arcLength(cnt, True)
print('원래 컨투어 점 개수:', len(cnt), ' 둘레: %.1f' % peri)

def on_eps(pos):
    epsilon = pos / 1000 * peri                   # 둘레의 pos/10 %
    approx = cv.approxPolyDP(cnt, epsilon, True)
    vis = img.copy()
    cv.drawContours(vis, [cnt], 0, (0, 200, 0), 1)       # 원본: 초록 얇은 선
    cv.drawContours(vis, [approx], 0, (0, 0, 255), 2)    # 근사: 빨강
    for p in approx:
        cv.circle(vis, (int(p[0][0]), int(p[0][1])), 4, (255, 0, 0), -1)
    cv.putText(vis, 'eps=%.1f%%  vertices=%d' % (pos / 10, len(approx)), (10, 20),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv.imshow('approx', vis)

cv.imshow('approx', img)
cv.createTrackbar('eps x0.1%', 'approx', 10, 100, on_eps)
on_eps(10)

for ratio in (0.1, 0.05, 0.02, 0.01, 0.005):
    n = len(cv.approxPolyDP(cnt, ratio * peri, True))
    print('epsilon = 둘레의 %4.1f%% → 꼭짓점 %d 개' % (ratio * 100, n))
`, desc: '<p>트랙바를 오른쪽으로 옮길수록(epsilon 증가) 꼭짓점이 줄어 얼굴이 단순한 다각형으로 바뀝니다. 튜토리얼의 10% 는 매우 거친 근사, 1% 는 원본에 꽤 가까운 근사입니다.</p>' },
      { type: 'code', title: '예제 3 · 볼록 껍질과 볼록 결함', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 127, 255, cv.THRESH_BINARY_INV)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
face = [c for c in contours if cv.pointPolygonTest(c, (50, 230), False) >= 0][0]

hull = cv.convexHull(face)                      # 볼록 껍질의 꼭짓점 좌표
print('얼굴 컨투어가 볼록한가?', cv.isContourConvex(face))
print('볼록 껍질은 볼록한가?  ', cv.isContourConvex(hull))
print('면적: 도형 %.0f / 볼록 껍질 %.0f' % (cv.contourArea(face), cv.contourArea(hull)))

vis = img.copy()
cv.drawContours(vis, [hull], 0, (0, 200, 0), 2)

# 볼록 결함: 고무줄과 도형 사이가 가장 깊게 벌어진 곳
hull_idx = cv.convexHull(face, returnPoints=False)
defects = cv.convexityDefects(face, hull_idx)    # 각 행: [시작, 끝, 가장 먼 점, 깊이*256]
if defects is not None:
    for s, e, f, d in defects[:, 0]:
        depth = d / 256.0
        if depth > 5:                              # 5픽셀보다 깊게 파인 곳만
            far = tuple(int(v) for v in face[f][0])
            cv.circle(vis, far, 5, (0, 0, 255), -1)
            print('움푹 파인 곳', far, '깊이 %.1f px' % depth)
cv.imshow('convex hull & defects', vis)

# 근사화하면 볼록 여부가 달라질 수 있음 (픽셀 계단 때문에 원본은 False 가 되기 쉬움)
for c in contours:
    if cv.contourArea(c) < 1000:
        continue
    approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
    print('꼭짓점 %2d개 도형: 원본 볼록=%-5s 근사 볼록=%s' % (len(approx), cv.isContourConvex(c), cv.isContourConvex(approx)))
`, desc: '<p>빨간 점이 코 아래, 입술 부분처럼 얼굴 윤곽이 안쪽으로 들어간 곳입니다. 반듯한 사각형도 원본 컨투어는 픽셀 계단 때문에 “볼록하지 않음”으로 나올 수 있어서, 볼록 여부는 근사한 다각형으로 판단하는 것이 안전합니다.</p>' },
      { type: 'text', html: `<h3>3. 경계 도형 — 도형을 감싸는 틀</h3>
<p>복잡한 컨투어를 단순한 도형으로 “감싸면” 위치·크기·기울기를 쉽게 다룰 수 있습니다.</p>
<ul>
<li><b>똑바른 사각형</b> <code>x, y, w, h = cv.boundingRect(cnt)</code> — 회전을 고려하지 않아 계산이 빠르고 ROI 자르기에 편리</li>
<li><b>회전된 최소 사각형</b> <code>rect = cv.minAreaRect(cnt)</code> — <b>((중심x, 중심y), (너비, 높이), 각도)</b>. 그리려면 <code>cv.boxPoints(rect)</code> 로 네 꼭짓점을 구한 뒤 정수로 변환</li>
<li><b>최소 외접원</b> <code>(x, y), radius = cv.minEnclosingCircle(cnt)</code></li>
<li><b>타원 맞추기</b> <code>ellipse = cv.fitEllipse(cnt)</code> — 점이 <b>5개 이상</b> 필요. 결과를 <code>cv.ellipse(img, ellipse, color, 2)</code> 로 바로 그림</li>
<li><b>직선 맞추기</b> <code>vx, vy, x0, y0 = cv.fitLine(cnt, cv.DIST_L2, 0, 0.01, 0.01)</code> — 방향 벡터 (vx, vy) 와 직선 위의 한 점 (x0, y0)</li>
</ul>` },
      { type: 'table', head: ['함수', '반환값', '쓰임'], rows: [
        ['<code>cv.boundingRect(cnt)</code>', 'x, y, w, h', 'ROI 자르기, 종횡비'],
        ['<code>cv.minAreaRect(cnt)</code>', '((cx, cy), (w, h), angle)', '기울어진 물체의 크기·각도 (문서 스캐너)'],
        ['<code>cv.boxPoints(rect)</code>', '4×2 float 배열', 'minAreaRect 를 그리기 위한 꼭짓점'],
        ['<code>cv.minEnclosingCircle(cnt)</code>', '(x, y), radius', '동그란 물체의 중심·반지름'],
        ['<code>cv.fitEllipse(cnt)</code>', '((cx, cy), (MA, ma), angle)', '타원 모양, 물체 방향'],
        ['<code>cv.fitLine(pts, dist, 0, 0.01, 0.01)</code>', '[vx, vy, x0, y0] (4×1)', '점들의 대표 직선, 기울기'],
      ] },
      { type: 'warn', html: `<p><b>np.int0 는 NumPy 2 에서 제거되었습니다.</b> 튜토리얼의 <code>box = np.int0(box)</code> 는 오류가 납니다. 같은 뜻인 <code>box = np.intp(box)</code> 를 사용하세요 (또는 <code>box.astype(np.int32)</code>). 또, <code>cv.circle</code> 등에 넘기는 중심 좌표는 <code>(int(x), int(y))</code> 처럼 파이썬 정수로 바꿔 주세요.</p>` },
      { type: 'code', title: '예제 4 · 다섯 가지 경계 도형 그리기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 127, 255, cv.THRESH_BINARY_INV)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE)
contours = [c for c in contours if cv.contourArea(c) > 1000]

# ① 똑바른 사각형(초록) vs 회전된 최소 사각형(빨강)
rect_vis = img.copy()
for cnt in contours:
    x, y, w, h = cv.boundingRect(cnt)
    cv.rectangle(rect_vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
    rect = cv.minAreaRect(cnt)
    box = np.intp(cv.boxPoints(rect))            # np.int0 대신 np.intp
    cv.drawContours(rect_vis, [box], 0, (0, 0, 255), 2)
    print('boundingRect 넓이 %6d | minAreaRect 넓이 %8.0f | 각도 %5.1f' % (w * h, rect[1][0] * rect[1][1], rect[2]))
cv.imshow('boundingRect(green) vs minAreaRect(red)', rect_vis)

# ② 기울어진 사각형 하나에 원 · 타원 · 직선 맞추기
tilted = [c for c in contours if cv.pointPolygonTest(c, (320, 110), False) >= 0][0]
vis = img.copy()
(cx, cy), radius = cv.minEnclosingCircle(tilted)
cv.circle(vis, (int(cx), int(cy)), int(radius), (255, 0, 0), 2)          # 파랑: 외접원

ellipse = cv.fitEllipse(tilted)
cv.ellipse(vis, ellipse, (255, 0, 255), 2)                               # 보라: 타원
print('fitEllipse → 중심', tuple(round(v) for v in ellipse[0]), ' 축 길이', tuple(round(v) for v in ellipse[1]), ' 각도 %.1f' % ellipse[2])

vx, vy, x0, y0 = cv.fitLine(tilted, cv.DIST_L2, 0, 0.01, 0.01).flatten()
p1 = (int(x0 - vx * 300), int(y0 - vy * 300))    # 방향 벡터로 양쪽 300px 연장
p2 = (int(x0 + vx * 300), int(y0 + vy * 300))
cv.line(vis, p1, p2, (0, 200, 255), 2)                                    # 주황: 직선
print('fitLine 방향 벡터 (%.2f, %.2f) → 기울기 각도 %.1f 도' % (vx, vy, np.degrees(np.arctan2(vy, vx))))
cv.imshow('circle / ellipse / line', vis)
`, desc: '<p>튜토리얼은 fitLine 결과로 이미지 왼쪽·오른쪽 끝의 y 를 계산하는데, 직선이 수직에 가까우면 vx 가 0 이 되어 나눗셈 문제가 생깁니다. 여기서는 중심점에서 방향 벡터만큼 양쪽으로 늘리는 더 안전한 방법을 썼습니다.</p>' },
      { type: 'text', html: `<h3>4. 컨투어 속성 (Contour Properties)</h3>
<p>숫자 몇 개로 도형의 “성격”을 표현할 수 있습니다. 이 값들을 조합하면 도형을 분류하거나 원하는 물체만 골라낼 수 있습니다.</p>
<ul>
<li><b>종횡비(Aspect Ratio)</b> = w / h (boundingRect) — 1 에 가까우면 정사각형·원, 크면 가로로 긴 물체</li>
<li><b>Extent</b> = 도형 면적 / 경계 사각형 면적 — 사각형 ≈ 1, 원 ≈ 0.785(π/4), 삼각형 ≈ 0.5</li>
<li><b>Solidity</b> = 도형 면적 / 볼록 껍질 면적 — 속이 꽉 찬 볼록 도형 ≈ 1, 별·손처럼 움푹한 도형은 작음</li>
<li><b>등가 지름(Equivalent Diameter)</b> = √(4 × 면적 / π) — 같은 면적의 원의 지름</li>
<li><b>방향(Orientation)</b> — fitEllipse 의 각도</li>
<li><b>마스크와 픽셀 좌표</b> — 컨투어를 채워 그린 마스크로 <code>cv.findNonZero(mask)</code>, <code>cv.minMaxLoc(gray, mask=mask)</code>, <code>cv.mean(img, mask=mask)</code>(평균 색)</li>
<li><b>극점(Extreme Points)</b> — 가장 왼쪽/오른쪽/위/아래 점. 예) <code>cnt[cnt[:, :, 0].argmin()][0]</code> 가 가장 왼쪽 점</li>
</ul>` },
      { type: 'table', head: ['속성', '계산', '사각형', '원', '삼각형'], rows: [
        ['Extent', 'area / (w×h)', '≈ 1.0', '≈ 0.785', '≈ 0.5'],
        ['Solidity', 'area / hull_area', '≈ 1.0', '≈ 1.0', '≈ 1.0'],
        ['원형도(Circularity)', '4π×area / 둘레²', '≈ 0.785', '≈ 1.0', '≈ 0.6'],
        ['approxPolyDP 꼭짓점', '0.02×둘레', '4', '8 이상', '3'],
      ] },
      { type: 'code', title: '예제 5 · 속성 표 만들기와 평균 색 · 극점 (detect_blob.png)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('detect_blob.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 20, 255, cv.THRESH_BINARY)
# fitEllipse 는 점이 5개 이상 필요 → 모든 점을 저장하는 CHAIN_APPROX_NONE 사용
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE)
contours = [c for c in contours if cv.contourArea(c) > 300]

vis = img.copy()
print(' #  종횡비  extent  solidity  등가지름  방향   평균색(B,G,R)')
for i, cnt in enumerate(contours):
    area = cv.contourArea(cnt)
    x, y, w, h = cv.boundingRect(cnt)
    aspect_ratio = w / h
    extent = area / (w * h)
    solidity = area / cv.contourArea(cv.convexHull(cnt))
    equi_diameter = np.sqrt(4 * area / np.pi)
    (_, _), (_, _), angle = cv.fitEllipse(cnt)

    mask = np.zeros(gray.shape, np.uint8)
    cv.drawContours(mask, [cnt], 0, 255, -1)          # 도형 내부를 흰색으로 채운 마스크
    b, g, r, _ = cv.mean(img, mask=mask)

    print('%2d  %5.2f   %5.2f    %5.2f    %6.1f  %5.1f   (%3d,%3d,%3d)'
          % (i, aspect_ratio, extent, solidity, equi_diameter, angle, b, g, r))
    cv.putText(vis, str(i), (x, y + 15), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

# solidity 가 가장 낮은(가장 울퉁불퉁한) 도형의 극점 표시
k = int(np.argmin([cv.contourArea(c) / cv.contourArea(cv.convexHull(c)) for c in contours]))
cnt = contours[k]
leftmost = tuple(int(v) for v in cnt[cnt[:, :, 0].argmin()][0])
rightmost = tuple(int(v) for v in cnt[cnt[:, :, 0].argmax()][0])
topmost = tuple(int(v) for v in cnt[cnt[:, :, 1].argmin()][0])
bottommost = tuple(int(v) for v in cnt[cnt[:, :, 1].argmax()][0])
for p in (leftmost, rightmost, topmost, bottommost):
    cv.circle(vis, p, 6, (0, 0, 255), -1)
print('가장 울퉁불퉁한 도형 #%d 의 극점 (좌, 우, 위, 아래):' % k, leftmost, rightmost, topmost, bottommost)
cv.imshow('properties', vis)
` },
      { type: 'text', html: `<h3>5. 실전: 도형에 이름 붙이기</h3>
<p>지금까지 배운 값을 조합하면 간단한 <b>도형 분류기</b>를 만들 수 있습니다. 규칙은 사람이 도형을 보는 방식과 비슷하게 세웁니다.</p>
<ol>
<li>면적이 너무 작은 조각(노이즈)은 건너뛴다</li>
<li><code>approxPolyDP(cnt, 0.02×둘레)</code> 로 꼭짓점 수 n 을 구한다</li>
<li><b>n = 3</b> → 삼각형</li>
<li><b>n = 4</b> 이고 회전 사각형 대비 채움 비율(면적 / minAreaRect 넓이)이 0.9 이상 → 사각형 <em>(납작한 타원도 n=4 로 근사될 수 있어서 추가 확인)</em></li>
<li>원형도 4π×면적/둘레² 가 <b>0.8 이상</b> → 원</li>
<li>나머지 → 기타</li>
</ol>
<p><code>cv.putText()</code> 는 <b>한글을 그릴 수 없으므로</b> 이미지에는 영어(triangle, rectangle, circle)로 쓰고, 한글 이름은 print 로 출력합니다.</p>` },
      { type: 'code', title: '예제 6 · pic1.png 도형 자동 분류하기', code: String.raw`
import cv2 as cv
import numpy as np

def classify(cnt):
    area = cv.contourArea(cnt)
    peri = cv.arcLength(cnt, True)
    approx = cv.approxPolyDP(cnt, 0.02 * peri, True)
    n = len(approx)
    circularity = 4 * np.pi * area / (peri * peri)
    (_, (rw, rh), _) = cv.minAreaRect(cnt)
    fill = area / (rw * rh) if rw * rh > 0 else 0     # 회전 사각형 대비 채움 비율

    if n == 3:
        return 'triangle', '삼각형', approx
    if n == 4 and fill > 0.9:
        return 'rectangle', '사각형', approx
    if circularity > 0.8:
        return 'circle', '원', approx
    return 'other', '기타', approx

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 127, 255, cv.THRESH_BINARY_INV)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

vis = img.copy()
for cnt in contours:
    area = cv.contourArea(cnt)
    if area < 300:                      # 물음표의 점 같은 작은 조각 제외
        continue
    en, ko, approx = classify(cnt)
    x, y, w, h = cv.boundingRect(cnt)
    print('%-4s 꼭짓점 %2d개, 면적 %7.0f, 위치 (%d, %d)' % (ko, len(approx), area, x, y))
    cv.drawContours(vis, [approx], 0, (0, 0, 255), 2)
    label = '%s A=%d V=%d' % (en, area, len(approx))
    ty = y - 5 if y > 20 else y + h + 15
    cv.putText(vis, label, (x, ty), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 0, 0), 1)
cv.imshow('shapes', vis)
`, desc: '<p>얼굴과 물음표는 “기타”로 분류됩니다. 규칙 기반 분류는 간단하고 빠르지만, 기준값(0.02, 0.9, 0.8)은 이미지에 따라 조정이 필요합니다.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · detect_blob.png 의 모든 도형에 라벨 달기',
        desc: `<p>예제 6의 분류 규칙을 <code>detect_blob.png</code>(검은 배경 위 컬러 도형)에 적용하세요. 도형마다 <b>이름, 면적, 꼭짓점 수</b>를 이미지에 쓰고, 콘솔에는 종류별 개수(삼각형/사각형/원/기타)를 출력하세요. (이 이미지에는 삼각형이 없으니 0개가 정상입니다.)</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def classify(cnt):
    area = cv.contourArea(cnt)
    peri = cv.arcLength(cnt, True)
    approx = cv.approxPolyDP(cnt, 0.02 * peri, True)
    # TODO 1: 꼭짓점 수 · 회전 사각형 채움 비율 · 원형도로 이름 결정하기
    return 'other', approx

img = cv.imread('detect_blob.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
# TODO 2: 검은 배경 위 밝은 도형 → 반전하지 않는 이진화로 바꾸기 (지금은 반전되어 있음)
_, th = cv.threshold(gray, 20, 255, cv.THRESH_BINARY_INV)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

counts = {'triangle': 0, 'rectangle': 0, 'circle': 0, 'other': 0}
vis = img.copy()
for cnt in contours:
    area = cv.contourArea(cnt)
    if area < 300:
        continue
    name, approx = classify(cnt)
    counts[name] += 1
    x, y, w, h = cv.boundingRect(cnt)
    cv.drawContours(vis, [cnt], 0, (0, 0, 255), 2)
    # TODO 3: 이름, 면적, 꼭짓점 수를 도형 위에 쓰기
print(counts)
cv.imshow('labels', vis)
`,
        hint: `<p>분류 코드는 예제 6과 같습니다. 이진화는 <code>cv.THRESH_BINARY</code>. 글자는 <code>cv.putText(vis, '%s A=%d V=%d' % (name, area, len(approx)), (x, y + 15), cv.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)</code> 처럼 쓰면 됩니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def classify(cnt):
    area = cv.contourArea(cnt)
    peri = cv.arcLength(cnt, True)
    approx = cv.approxPolyDP(cnt, 0.02 * peri, True)
    n = len(approx)
    circularity = 4 * np.pi * area / (peri * peri)
    (_, (rw, rh), _) = cv.minAreaRect(cnt)
    fill = area / (rw * rh) if rw * rh > 0 else 0
    if n == 3:
        return 'triangle', approx
    if n == 4 and fill > 0.9:
        return 'rectangle', approx
    if circularity > 0.8:
        return 'circle', approx
    return 'other', approx

img = cv.imread('detect_blob.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 20, 255, cv.THRESH_BINARY)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

counts = {'triangle': 0, 'rectangle': 0, 'circle': 0, 'other': 0}
ko = {'triangle': '삼각형', 'rectangle': '사각형', 'circle': '원', 'other': '기타'}
vis = img.copy()
for cnt in contours:
    area = cv.contourArea(cnt)
    if area < 300:
        continue
    name, approx = classify(cnt)
    counts[name] += 1
    x, y, w, h = cv.boundingRect(cnt)
    cv.drawContours(vis, [cnt], 0, (0, 0, 255), 2)
    cv.putText(vis, '%s A=%d V=%d' % (name, area, len(approx)), (x, y + 15),
               cv.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
for k, v in counts.items():
    print('%s: %d개' % (ko[k], v))
cv.imshow('labels', vis)
`,
      },
      {
        title: '실습 2 · 가장 동그란 도형과 가장 울퉁불퉁한 도형 찾기',
        desc: `<p><code>detect_blob.png</code> 의 도형(면적 300 이상)마다 <b>원형도</b>(4π×면적/둘레²)와 <b>solidity</b>(면적/볼록 껍질 면적)를 계산하세요. 원형도가 가장 큰 도형은 초록색, solidity 가 가장 작은 도형은 빨간색으로 두껍게 그리고 두 값을 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('detect_blob.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 20, 255, cv.THRESH_BINARY)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
contours = [c for c in contours if cv.contourArea(c) >= 300]

circularities = []
solidities = []
for cnt in contours:
    area = cv.contourArea(cnt)
    # TODO 1: 둘레를 구해 원형도 계산하기
    circularities.append(0.0)
    # TODO 2: 볼록 껍질 면적으로 solidity 계산하기
    solidities.append(1.0)

best = int(np.argmax(circularities))
worst = int(np.argmin(solidities))
vis = img.copy()
cv.drawContours(vis, contours, best, (0, 255, 0), 4)
cv.drawContours(vis, contours, worst, (0, 0, 255), 4)
print('가장 동그란 도형 원형도: %.3f' % circularities[best])
print('가장 울퉁불퉁한 도형 solidity: %.3f' % solidities[worst])
cv.imshow('result', vis)
`,
        hint: `<p><code>peri = cv.arcLength(cnt, True)</code>, <code>4 * np.pi * area / (peri * peri)</code>, <code>area / cv.contourArea(cv.convexHull(cnt))</code></p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('detect_blob.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, th = cv.threshold(gray, 20, 255, cv.THRESH_BINARY)
contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
contours = [c for c in contours if cv.contourArea(c) >= 300]

circularities = []
solidities = []
for cnt in contours:
    area = cv.contourArea(cnt)
    peri = cv.arcLength(cnt, True)
    circularities.append(4 * np.pi * area / (peri * peri))
    solidities.append(area / cv.contourArea(cv.convexHull(cnt)))

best = int(np.argmax(circularities))
worst = int(np.argmin(solidities))
vis = img.copy()
cv.drawContours(vis, contours, best, (0, 255, 0), 4)
cv.drawContours(vis, contours, worst, (0, 0, 255), 4)
print('가장 동그란 도형 원형도: %.3f' % circularities[best])
print('가장 울퉁불퉁한 도형 solidity: %.3f' % solidities[worst])
cv.imshow('result', vis)
`,
      },
      {
        title: '실습 3 · 웹캠 도형 탐지기',
        desc: `<p>종이에 삼각형·사각형·원을 그려 📷 웹캠에 비추면, 각 도형 위에 <b>꼭짓점 수와 이름</b>을 표시하는 <code>process(frame)</code> 를 완성하세요. (이미지 입력으로도 오류 없이 동작해야 합니다. 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 됩니다.)</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    _, th = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    vis = frame.copy()
    for cnt in contours:
        if cv.contourArea(cnt) < 1500:
            continue
        # TODO 1: approxPolyDP 로 꼭짓점 수 n 구하기
        n = 0
        # TODO 2: n 이 3 → 'triangle', 4 → 'rectangle', 8 이상 → 'circle' 로 이름 정하기
        name = '?'
        x, y, w, h = cv.boundingRect(cnt)
        cv.drawContours(vis, [cnt], 0, (0, 255, 0), 2)
        cv.putText(vis, '%s (%d)' % (name, n), (x, y - 5), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    return vis
`,
        hint: `<p><code>approx = cv.approxPolyDP(cnt, 0.03 * cv.arcLength(cnt, True), True)</code>, <code>n = len(approx)</code>. 웹캠 영상은 경계가 흔들리므로 epsilon 을 0.02 보다 조금 크게 잡는 것이 안정적입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    _, th = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    contours, _ = cv.findContours(th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    vis = frame.copy()
    for cnt in contours:
        if cv.contourArea(cnt) < 1500:
            continue
        approx = cv.approxPolyDP(cnt, 0.03 * cv.arcLength(cnt, True), True)
        n = len(approx)
        if n == 3:
            name = 'triangle'
        elif n == 4:
            name = 'rectangle'
        elif n >= 8:
            name = 'circle'
        else:
            name = 'polygon'
        x, y, w, h = cv.boundingRect(cnt)
        cv.drawContours(vis, [approx], 0, (0, 255, 0), 2)
        cv.putText(vis, '%s (%d)' % (name, n), (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    return vis
`,
      },
    ],
    quiz: [
      { q: "M = cv.moments(cnt) 일 때 무게중심의 x 좌표는?", options: ["M['m01'] / M['m00']","M['m10'] / M['m00']","M['m00'] / M['m10']","M['m10'] × M['m01']"], answer: 1, explain: "m10 은 x 좌표의 합, m00 은 픽셀 수(면적)이므로 나누면 x 좌표의 평균 = cx 입니다." },
      { q: "cv.approxPolyDP(cnt, epsilon, True) 에서 epsilon 을 크게 하면?", options: ["꼭짓점 수가 늘어난다","꼭짓점 수가 줄어 더 단순한 다각형이 된다","도형이 커진다","컨투어가 열린 곡선이 된다"], answer: 1, explain: "epsilon 은 허용 오차입니다. 오차를 많이 허용할수록 더 적은 꼭짓점으로 근사합니다." },
      { q: "cv.minAreaRect() 가 cv.boundingRect() 와 다른 점은?", options: ["회전을 고려해 면적이 최소인 사각형을 ((중심), (너비, 높이), 각도) 로 반환한다","항상 더 큰 사각형을 반환한다","원을 반환한다","정수 좌표 x, y, w, h 를 반환한다"], answer: 0, explain: "boundingRect 는 축에 나란한 사각형, minAreaRect 는 회전된 최소 사각형입니다. 그리려면 boxPoints 로 꼭짓점을 구합니다." },
      { q: "Solidity(솔리디티)의 정의로 옳은 것은?", options: ["너비 / 높이","도형 면적 / 경계 사각형 면적","도형 면적 / 볼록 껍질 면적","둘레 / 면적"], answer: 2, explain: "움푹 들어간 곳이 많을수록 볼록 껍질에 비해 면적이 작아져 solidity 가 낮아집니다. 면적/경계 사각형 면적은 extent 입니다." },
      { q: "NumPy 2 환경에서 box = cv.boxPoints(rect) 를 정수 좌표로 바꾸는 올바른 코드는?", options: ["np.int0(box)","int(box)","box.int()","np.intp(box)"], answer: 3, explain: "np.int0 는 NumPy 2 에서 제거되었습니다. 같은 의미의 np.intp 를 사용합니다." },
    ],
  },

  /* ======================================================================
   * w3-6 히스토그램과 평활화
   * ====================================================================== */
  {
    id: 'w3-6',
    summary: '이미지의 밝기 분포를 한눈에 보여 주는 히스토그램을 계산·시각화하고, 좁게 몰린 분포를 넓게 펼쳐 대비를 높이는 히스토그램 평활화와 그 한계를 보완한 CLAHE 를 익힙니다.',
    goals: [
      '히스토그램의 의미와 BINS · DIMS · RANGE 용어를 설명할 수 있다',
      'cv.calcHist()와 np.histogram()으로 히스토그램을 계산하고 matplotlib 로 그릴 수 있다',
      '마스크를 이용해 특정 영역의 히스토그램을 구할 수 있다',
      'CDF 를 이용한 평활화 원리를 이해하고 cv.equalizeHist()로 대비를 개선할 수 있다',
      'CLAHE 의 clipLimit · tileGridSize 를 조절하고 컬러/웹캠 영상에 적용할 수 있다',
    ],
    schedule: [['도입', 3], ['히스토그램 개념과 계산', 9], ['그리기 · 마스크', 8], ['평활화 원리와 equalizeHist', 12], ['CLAHE · 웹캠 적용', 8], ['실습 과제', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 히스토그램(Histogram)이란?</h3>
<p><b>히스토그램</b>은 “밝기 값마다 픽셀이 몇 개 있는가”를 세어 그린 막대그래프입니다. x 축은 밝기(0~255), y 축은 그 밝기를 가진 픽셀 수입니다.</p>
<ul>
<li>그래프가 <b>왼쪽</b>에 몰려 있으면 → 어두운 이미지</li>
<li><b>오른쪽</b>에 몰려 있으면 → 밝은 이미지</li>
<li><b>가운데 좁은 구간</b>에만 몰려 있으면 → 대비(contrast)가 낮은, 뿌연 이미지</li>
<li><b>넓게 퍼져</b> 있으면 → 대비가 좋은 이미지</li>
</ul>
<p>히스토그램은 이미지를 “보지 않고도” 밝기 상태를 파악하게 해 주며, 2주차의 Otsu 이진화도 이 히스토그램을 분석해 임계값을 정했습니다. 튜토리얼에서 쓰는 용어 세 가지를 알아 둡시다.</p>` },
      { type: 'table', head: ['용어', '의미', '예'], rows: [
        ['<b>BINS</b> (histSize)', '막대(구간)의 개수. 256 이면 밝기 하나당 막대 하나, 16 이면 0~15, 16~31, … 처럼 묶음', '<code>[256]</code>, <code>[16]</code>'],
        ['<b>DIMS</b>', '몇 가지 값을 세는지. 밝기 하나만 세면 1차원', '그레이스케일 = 1'],
        ['<b>RANGE</b>', '셀 값의 범위 (끝값은 포함하지 않음)', '<code>[0, 256]</code>'],
      ] },
      { type: 'text', html: `<h3>2. 히스토그램 계산하기</h3>
<p><b>OpenCV</b>: <code>cv.calcHist(images, channels, mask, histSize, ranges)</code></p>
<ul>
<li><b>images</b> — 이미지를 <b>리스트로 감싸서</b> 전달: <code>[img]</code></li>
<li><b>channels</b> — 채널 번호 리스트. 그레이스케일은 <code>[0]</code>, 컬러의 B/G/R 은 <code>[0]</code>/<code>[1]</code>/<code>[2]</code></li>
<li><b>mask</b> — 전체 이미지면 <code>None</code>, 일부 영역만이면 마스크 이미지</li>
<li><b>histSize</b> — BINS, 리스트로 <code>[256]</code></li>
<li><b>ranges</b> — <code>[0, 256]</code></li>
</ul>
<p>결과는 <b>(256, 1) 모양의 float32 배열</b>입니다.</p>
<p><b>NumPy</b>: <code>hist, bins = np.histogram(img.ravel(), 256, [0, 256])</code> (bins 는 경계값 257개), 또는 1차원 정수 데이터에 특화된 <code>np.bincount(img.ravel(), minlength=256)</code>. 튜토리얼에 따르면 <b>OpenCV 함수가 np.histogram 보다 약 40배 빠르므로</b> 실전에서는 cv.calcHist 를 권장합니다.</p>` },
      { type: 'code', title: '예제 1 · calcHist vs np.histogram vs np.bincount', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE)

hist_cv = cv.calcHist([img], [0], None, [256], [0, 256])     # (256, 1) float32
hist_np, bins = np.histogram(img.ravel(), 256, [0, 256])     # (256,) , bins 257개
hist_bc = np.bincount(img.ravel(), minlength=256)            # (256,)

print('calcHist  모양:', hist_cv.shape, hist_cv.dtype)
print('histogram 모양:', hist_np.shape, ' bins 모양:', bins.shape)
print('세 결과가 같은가?', np.array_equal(hist_cv.ravel(), hist_np), np.array_equal(hist_np, hist_bc))
print('밝기 0 픽셀 수:', int(hist_cv[0, 0]), ' / 밝기 255 픽셀 수:', int(hist_cv[255, 0]))
print('가장 흔한 밝기 값:', int(np.argmax(hist_cv)))
print('히스토그램 합 = 전체 픽셀 수?', int(hist_cv.sum()), '==', img.size)

# BINS 를 16 으로 줄이면 16칸으로 묶어서 셈
hist16 = cv.calcHist([img], [0], None, [16], [0, 256])
print('BINS=16 결과:', hist16.ravel().astype(int))

# 속도 비교 (각 20회)
def timeit(fn):
    e1 = cv.getTickCount()
    for _ in range(20):
        fn()
    return (cv.getTickCount() - e1) / cv.getTickFrequency() * 1000

t_cv = timeit(lambda: cv.calcHist([img], [0], None, [256], [0, 256]))
t_np = timeit(lambda: np.histogram(img.ravel(), 256, [0, 256]))
t_bc = timeit(lambda: np.bincount(img.ravel(), minlength=256))
print('20회 시간(ms): calcHist %.1f / np.histogram %.1f / np.bincount %.1f' % (t_cv, t_np, t_bc))
`, desc: '<p>속도 차이는 실행 환경(브라우저/PC)에 따라 다르게 나올 수 있습니다. 중요한 것은 세 방법의 결과가 같다는 점과, 반복 처리에서는 빠른 함수를 고르는 습관입니다.</p>' },
      { type: 'code', title: '예제 2 · 히스토그램 그리기 — 흑백과 BGR (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read"

plt.figure(figsize=(11, 4))
# ① matplotlib 이 직접 세서 그리기
plt.subplot(1, 2, 1)
plt.hist(img.ravel(), bins=256, range=(0, 256))
plt.title('Grayscale histogram (plt.hist)')

# ② 채널별로 calcHist 한 뒤 선으로 그리기
img_c = cv.imread('home.jpg')
color = ('b', 'g', 'r')
plt.subplot(1, 2, 2)
for i, col in enumerate(color):
    histr = cv.calcHist([img_c], [i], None, [256], [0, 256])
    plt.plot(histr, color=col)
    plt.xlim([0, 256])
plt.title('BGR histogram (cv.calcHist)')
plt.show()

cv.imshow('home.jpg', img_c)
`, desc: '<p>파란 선이 오른쪽(밝은 쪽)에 크게 솟아 있다면 밝은 파란 하늘 영역이 넓다는 뜻입니다. 이미지와 그래프를 번갈아 보며 “어느 봉우리가 어느 영역인지” 짝지어 보세요.</p>' },
      { type: 'text', html: `<h3>3. 마스크로 일부 영역의 히스토그램 구하기</h3>
<p>이미지 전체가 아니라 <b>특정 영역</b>(예: 얼굴, 하늘, 도로)의 밝기 분포만 알고 싶을 때는 <b>마스크</b>를 씁니다. 원하는 영역은 흰색(255), 나머지는 검은색(0)인 uint8 이미지를 만들어 calcHist 의 세 번째 인자로 넘기면 됩니다. 1주차에 배운 <code>cv.bitwise_and(img, img, mask=mask)</code> 로 마스크 영역만 잘라 확인할 수도 있습니다.</p>` },
      { type: 'code', title: '예제 3 · 마스크 히스토그램 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE)

# 마스크 만들기: (100~300 행, 100~400 열) 영역만 흰색
mask = np.zeros(img.shape[:2], np.uint8)
mask[100:300, 100:400] = 255
masked_img = cv.bitwise_and(img, img, mask=mask)

# 마스크 없이 / 마스크 적용해서 히스토그램 계산
hist_full = cv.calcHist([img], [0], None, [256], [0, 256])
hist_mask = cv.calcHist([img], [0], mask, [256], [0, 256])
print('전체 픽셀 수:', int(hist_full.sum()), ' / 마스크 영역 픽셀 수:', int(hist_mask.sum()))

plt.figure(figsize=(9, 7))
plt.subplot(221), plt.imshow(img, 'gray'), plt.title('Image')
plt.subplot(222), plt.imshow(mask, 'gray'), plt.title('Mask')
plt.subplot(223), plt.imshow(masked_img, 'gray'), plt.title('Masked image')
plt.subplot(224), plt.plot(hist_full, label='full'), plt.plot(hist_mask, label='mask')
plt.xlim([0, 256]), plt.legend(), plt.title('Histograms')
plt.tight_layout()
plt.show()
` },
      { type: 'text', html: `<h3>4. 히스토그램 평활화(Histogram Equalization)</h3>
<p>안개 낀 듯 뿌연 사진은 밝기가 90~170 처럼 <b>좁은 구간에만 몰려</b> 있습니다. <b>평활화</b>는 이 분포를 0~255 전체로 <b>넓게 펼쳐서</b> 대비를 높입니다. 방법은 “순위”를 이용하는 것입니다.</p>
<ol>
<li>히스토그램의 <b>누적 합(CDF, 누적 분포 함수)</b>을 구한다 — “밝기 v 이하인 픽셀이 전체의 몇 %인가”</li>
<li>그 비율에 255 를 곱해 <b>새 밝기</b>로 삼는다 — 하위 50% 에 해당하는 밝기는 약 128 로, 하위 90% 는 약 230 으로</li>
<li>이 변환표(<b>LUT</b>, Look-Up Table)로 모든 픽셀을 바꾼다: <code>new_img = lut[img]</code></li>
</ol>
<p>결과적으로 CDF 가 <b>대각선에 가까운 직선</b>이 되고, 히스토그램은 전체 범위에 고르게 퍼집니다. OpenCV 에서는 <code>cv.equalizeHist(gray)</code> 한 줄로 끝나며, <b>입력은 8비트 1채널(흑백)</b> 이어야 합니다.</p>` },
      { type: 'code', title: '예제 4 · 저대비 이미지 만들고 CDF 로 직접 평활화하기 (튜토리얼 numpy 방식)', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE)
# 밝기 범위를 좁혀 '뿌연' 저대비 이미지 만들기: 0~255 → 약 90~166
low = (img.astype(np.float32) * 0.3 + 90).astype(np.uint8)
print('원본 밝기 범위:', img.min(), '~', img.max(), ' / 저대비 범위:', low.min(), '~', low.max())

def plot_hist_cdf(im, title):
    hist, bins = np.histogram(im.flatten(), 256, [0, 256])
    cdf = hist.cumsum()
    cdf_normalized = cdf * float(hist.max()) / cdf.max()   # 같은 그래프에 보이도록 크기 맞춤
    plt.plot(cdf_normalized, color='b')
    plt.hist(im.flatten(), bins=256, range=(0, 256), color='r')
    plt.xlim([0, 256])
    plt.legend(('cdf', 'histogram'), loc='upper left')
    plt.title(title)
    return cdf

plt.figure(figsize=(11, 4))
plt.subplot(1, 2, 1)
cdf = plot_hist_cdf(low, 'Low contrast')

# CDF 로 변환표(LUT) 만들기 — 0 인 칸은 무시(masked array)하고 최소~최대를 0~255 로
cdf_m = np.ma.masked_equal(cdf, 0)
cdf_m = (cdf_m - cdf_m.min()) * 255 / (cdf_m.max() - cdf_m.min())
lut = np.ma.filled(cdf_m, 0).astype('uint8')
img2 = lut[low]               # 모든 픽셀을 변환표로 한 번에 바꾸기

plt.subplot(1, 2, 2)
plot_hist_cdf(img2, 'After equalization (numpy)')
plt.show()

print('변환표 예: 밝기 100 → %d, 128 → %d, 160 → %d' % (lut[100], lut[128], lut[160]))
cv.imshow('low contrast', low)
cv.imshow('equalized (numpy)', img2)
`, desc: '<p>왼쪽 그래프는 히스토그램이 좁고 CDF 가 급경사인 계단 모양, 오른쪽은 히스토그램이 전체로 퍼지고 CDF 가 대각선에 가까운 모양입니다.</p>' },
      { type: 'code', title: '예제 5 · cv.equalizeHist 로 한 줄에 평활화', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE)
low = (img.astype(np.float32) * 0.3 + 90).astype(np.uint8)

equ = cv.equalizeHist(low)
res = np.hstack((low, equ))       # 튜토리얼처럼 나란히 붙이기
cv.imshow('low | equalized', res)
print('평활화 후 밝기 범위:', equ.min(), '~', equ.max())
print('표준편차(대비 지표): %.1f → %.1f' % (low.std(), equ.std()))

plt.figure(figsize=(10, 3.5))
plt.subplot(1, 2, 1), plt.hist(low.ravel(), bins=256, range=(0, 256)), plt.title('Before'), plt.xlim([0, 256])
plt.subplot(1, 2, 2), plt.hist(equ.ravel(), bins=256, range=(0, 256)), plt.title('After equalizeHist'), plt.xlim([0, 256])
plt.show()
`, desc: '<p>평활화 후 히스토그램이 빗살처럼 듬성듬성해지는 것은 정상입니다. 원래 77단계뿐이던 밝기를 0~255 에 펼쳤으니 중간에 빈 값이 생기는 것이죠.</p>' },
      { type: 'text', html: `<h3>5. CLAHE — 영역별로 똑똑하게 평활화하기</h3>
<p>전역 평활화(equalizeHist)는 이미지 <b>전체</b>의 히스토그램 하나로 변환표를 만듭니다. 그래서 역광 사진처럼 <b>어두운 곳과 밝은 곳이 함께 있는</b> 이미지에서는</p>
<ul>
<li>이미 밝은 부분이 <b>하얗게 날아가</b> 디테일을 잃고 (튜토리얼의 조각상 얼굴 예)</li>
<li>평평한 영역의 <b>노이즈가 과하게 강조</b>됩니다</li>
</ul>
<p><b>CLAHE</b>(Contrast Limited Adaptive Histogram Equalization)는 이를 두 가지로 해결합니다.</p>
<ul>
<li><b>Adaptive</b> — 이미지를 작은 타일(기본 8×8)로 나눠 <b>타일마다</b> 평활화 → 지역마다 알맞은 대비. 타일 경계는 쌍선형 보간으로 부드럽게 연결</li>
<li><b>Contrast Limited</b> — 한 밝기에 픽셀이 너무 몰리면(clipLimit 초과) 잘라서 다른 칸에 나눠 줌 → <b>노이즈 증폭 억제</b></li>
</ul>
<p>사용법: <code>clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))</code> → <code>result = clahe.apply(gray)</code>. clipLimit 이 클수록 대비가 강해지고 노이즈도 늘어납니다.</p>` },
      { type: 'code', title: '예제 6 · 역광 이미지에서 equalizeHist vs CLAHE', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('home.jpg', cv.IMREAD_GRAYSCALE)
h, w = img.shape
# 왼쪽은 어둡고(×0.25) 오른쪽은 밝은(×1.6) '역광' 이미지 만들기
ramp = np.linspace(0.25, 1.6, w, dtype=np.float32)
scene = np.clip(img.astype(np.float32) * ramp, 0, 255).astype(np.uint8)

equ = cv.equalizeHist(scene)
clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
cl1 = clahe.apply(scene)
clahe_strong = cv.createCLAHE(clipLimit=8.0, tileGridSize=(8, 8)).apply(scene)

titles = ['Backlit scene', 'equalizeHist (global)', 'CLAHE clip=2', 'CLAHE clip=8']
images = [scene, equ, cl1, clahe_strong]
plt.figure(figsize=(11, 8))
for i in range(4):
    plt.subplot(2, 2, i + 1)
    plt.imshow(images[i], cmap='gray', vmin=0, vmax=255)
    plt.title(titles[i]), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()

cv.imshow('global | CLAHE', np.hstack((equ, cl1)))
`, desc: '<p>전역 평활화는 오른쪽 건물이 하얗게 뭉개지고 왼쪽 하늘은 여전히 어둡습니다. CLAHE 는 왼쪽 구름과 오른쪽 건물 장식이 모두 살아납니다. clipLimit=8 은 대비가 더 강하지만 하늘의 거친 질감(노이즈)도 함께 강조됩니다.</p>' },
      { type: 'code', title: '예제 7 · 웹캠 실시간 평활화 (컬러는 밝기 채널만)', code: String.raw`
import cv2 as cv
import numpy as np

# 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸면 실시간으로 동작합니다.
# 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 됩니다.
clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))   # 한 번만 만들어 재사용

def draw_hist(img_gray, canvas, color):
    # 캔버스 왼쪽 아래에 256×100 크기 히스토그램 그리기
    hist = cv.calcHist([img_gray], [0], None, [256], [0, 256]).ravel()
    hist = hist / (hist.max() + 1e-6) * 100
    h = canvas.shape[0]
    pts = np.column_stack((np.arange(256), h - 10 - hist)).astype(np.int32)
    cv.rectangle(canvas, (0, h - 112), (257, h - 8), (0, 0, 0), -1)
    cv.polylines(canvas, [pts], False, color, 1)

def process(frame):
    # 컬러 이미지는 B,G,R 을 따로 평활화하면 색이 틀어짐 → YCrCb 의 Y(밝기)만 평활화
    ycrcb = cv.cvtColor(frame, cv.COLOR_BGR2YCrCb)
    y, cr, cb = cv.split(ycrcb)
    y_eq = cv.equalizeHist(y)
    y_cl = clahe.apply(y)

    eq = cv.cvtColor(cv.merge([y_eq, cr, cb]), cv.COLOR_YCrCb2BGR)
    cl = cv.cvtColor(cv.merge([y_cl, cr, cb]), cv.COLOR_YCrCb2BGR)
    orig = frame.copy()

    draw_hist(y, orig, (255, 255, 255))
    draw_hist(y_eq, eq, (0, 255, 255))
    draw_hist(y_cl, cl, (0, 255, 0))
    cv.putText(eq, 'equalizeHist', (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    cv.putText(cl, 'CLAHE', (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    return orig, eq, cl
`, desc: '<p>방을 어둡게 하거나 창문을 등지고 서 보세요. 원본 히스토그램은 한쪽에 몰리고, 평활화 결과는 넓게 퍼집니다. <code>createCLAHE</code> 는 process 밖에서 한 번만 만드는 것이 효율적입니다.</p>' },
      { type: 'warn', html: `<p><b>컬러 이미지를 B, G, R 채널별로 따로 평활화하지 마세요.</b> 채널마다 변환표가 달라져 색이 이상하게 틀어집니다. <b>YCrCb 의 Y</b> 또는 <b>HSV 의 V</b>, <b>Lab 의 L</b> 처럼 밝기 채널만 평활화한 뒤 다시 합치는 것이 정석입니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 뿌연 컬러 사진 선명하게 만들기',
        desc: `<p><code>fruits.jpg</code> 로 만든 저대비(뿌연) 컬러 이미지를 평활화하세요. ① 잘못된 방법(B, G, R 각각 평활화)과 ② 올바른 방법(YCrCb 의 Y 만 평활화)을 모두 만들어 색이 어떻게 다른지 비교합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('fruits.jpg')
foggy = (img.astype(np.float32) * 0.4 + 100).astype(np.uint8)   # 뿌연 이미지

# TODO 1: B, G, R 채널을 각각 equalizeHist 한 뒤 merge (잘못된 방법)
wrong = foggy.copy()

# TODO 2: YCrCb 로 변환 → Y 만 equalizeHist → merge → BGR 로 되돌리기 (올바른 방법)
right = foggy.copy()

cv.imshow('foggy', foggy)
cv.imshow('wrong (per BGR channel)', wrong)
cv.imshow('right (Y channel only)', right)
`,
        hint: `<p>① <code>b, g, r = cv.split(foggy)</code> → 각각 <code>cv.equalizeHist()</code> → <code>cv.merge([b2, g2, r2])</code><br>② <code>y, cr, cb = cv.split(cv.cvtColor(foggy, cv.COLOR_BGR2YCrCb))</code> → Y 만 평활화 → <code>cv.cvtColor(cv.merge([...]), cv.COLOR_YCrCb2BGR)</code></p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('fruits.jpg')
foggy = (img.astype(np.float32) * 0.4 + 100).astype(np.uint8)   # 뿌연 이미지

# ① 잘못된 방법: 채널마다 따로 평활화 → 색 균형이 깨짐
b, g, r = cv.split(foggy)
wrong = cv.merge([cv.equalizeHist(b), cv.equalizeHist(g), cv.equalizeHist(r)])

# ② 올바른 방법: 밝기(Y)만 평활화
y, cr, cb = cv.split(cv.cvtColor(foggy, cv.COLOR_BGR2YCrCb))
right = cv.cvtColor(cv.merge([cv.equalizeHist(y), cr, cb]), cv.COLOR_YCrCb2BGR)

print('원본 평균 색(B,G,R):', np.round(img.reshape(-1, 3).mean(axis=0)))
print('잘못된 방법 평균 색:', np.round(wrong.reshape(-1, 3).mean(axis=0)))
print('올바른 방법 평균 색:', np.round(right.reshape(-1, 3).mean(axis=0)))
cv.imshow('foggy', foggy)
cv.imshow('wrong (per BGR channel)', wrong)
cv.imshow('right (Y channel only)', right)
`,
      },
      {
        title: '실습 2 · 히스토그램으로 이미지 밝기 진단하기',
        desc: `<p>여러 이미지의 히스토그램을 calcHist 로 구해, 전체 픽셀 중 <b>어두운 픽셀(0~63)</b>, <b>중간(64~191)</b>, <b>밝은 픽셀(192~255)</b>의 비율(%)을 계산하고, 가장 많은 쪽에 따라 “어두운/보통/밝은 이미지”라고 진단해 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

for name in ['lena.jpg', 'smarties.png', 'baboon.jpg', 'starry_night.jpg']:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    hist = cv.calcHist([gray], [0], None, [256], [0, 256]).ravel()
    total = hist.sum()

    # TODO 1: 구간별 픽셀 수 합을 구해 비율(%)로 바꾸기 (hist[0:64] 처럼 슬라이싱)
    dark = 0.0
    mid = 0.0
    bright = 0.0

    # TODO 2: 가장 큰 비율에 따라 진단 문구 정하기
    verdict = '?'
    print('%-17s 어두움 %5.1f%%  중간 %5.1f%%  밝음 %5.1f%%  → %s' % (name, dark, mid, bright, verdict))
`,
        hint: `<p><code>dark = hist[0:64].sum() / total * 100</code>, 중간은 <code>hist[64:192]</code>, 밝음은 <code>hist[192:256]</code>. 진단은 <code>['어두운 이미지', '보통 이미지', '밝은 이미지'][int(np.argmax([dark, mid, bright]))]</code> 처럼 할 수 있습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

for name in ['lena.jpg', 'smarties.png', 'baboon.jpg', 'starry_night.jpg']:
    gray = cv.imread(name, cv.IMREAD_GRAYSCALE)
    hist = cv.calcHist([gray], [0], None, [256], [0, 256]).ravel()
    total = hist.sum()

    dark = hist[0:64].sum() / total * 100
    mid = hist[64:192].sum() / total * 100
    bright = hist[192:256].sum() / total * 100

    verdict = ['어두운 이미지', '보통 이미지', '밝은 이미지'][int(np.argmax([dark, mid, bright]))]
    print('%-17s 어두움 %5.1f%%  중간 %5.1f%%  밝음 %5.1f%%  → %s' % (name, dark, mid, bright, verdict))
`,
      },
      {
        title: '실습 3 · 트랙바로 CLAHE 튜닝하기',
        desc: `<p>트랙바 <b>clip</b>(1~40)과 <b>tile</b>(1~16)로 CLAHE 의 clipLimit 과 tileGridSize 를 바꿔 가며 결과를 비교하는 <code>process(frame)</code> 를 완성하세요. 입력은 흑백으로 바꿔 사용하고, 원본과 결과를 나란히 반환합니다. 📷 웹캠에서도 확인해 보세요. 웹캠이 없으면 🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('clip', 'result', 2, 40, nothing)
cv.createTrackbar('tile', 'result', 8, 16, nothing)
clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    clip = max(1, cv.getTrackbarPos('clip', 'result'))
    tile = max(1, cv.getTrackbarPos('tile', 'result'))

    # TODO 1: clahe.setClipLimit(), clahe.setTilesGridSize() 로 설정 바꾸기
    # TODO 2: clahe.apply(gray) 결과를 out 에 저장하기
    out = gray.copy()

    cv.putText(out, 'clip=%d tile=%dx%d' % (clip, tile, tile), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, 255, 2)
    return gray, out
`,
        hint: `<p><code>clahe.setClipLimit(float(clip))</code>, <code>clahe.setTilesGridSize((tile, tile))</code> — 함수 이름이 <b>Tiles</b>GridSize 인 점에 주의하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('clip', 'result', 2, 40, nothing)
cv.createTrackbar('tile', 'result', 8, 16, nothing)
clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

def process(frame):
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    clip = max(1, cv.getTrackbarPos('clip', 'result'))
    tile = max(1, cv.getTrackbarPos('tile', 'result'))

    clahe.setClipLimit(float(clip))
    clahe.setTilesGridSize((tile, tile))
    out = clahe.apply(gray)

    cv.putText(out, 'clip=%d tile=%dx%d' % (clip, tile, tile), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, 255, 2)
    return gray, out
`,
      },
    ],
    quiz: [
      { q: "cv.calcHist([img], [0], None, [256], [0, 256]) 에서 첫 인자를 [img] 처럼 대괄호로 감싸는 이유는?", options: ["calcHist 가 여러 이미지를 받을 수 있도록 이미지 리스트를 인자로 받기 때문에","이미지를 복사하기 위해","흑백으로 변환하기 위해","속도를 높이기 위해"], answer: 0, explain: "images, channels, histSize, ranges 인자는 모두 리스트 형태로 전달합니다." },
      { q: "histSize 를 [16] 으로 지정하면 결과 히스토그램은?", options: ["밝기 0~15 만 센다","16비트 이미지 전용 히스토그램","16배 확대된 히스토그램","0~255 를 16개 구간으로 묶어 센 16칸짜리 히스토그램"], answer: 3, explain: "BINS=16 이면 0~15, 16~31, … 처럼 16개 구간의 픽셀 수를 셉니다." },
      { q: "히스토그램 평활화의 효과로 가장 알맞은 것은?", options: ["노이즈를 제거한다","좁은 구간에 몰린 밝기 분포를 넓게 펼쳐 대비를 높인다","이미지 크기를 줄인다","엣지만 남긴다"], answer: 1, explain: "CDF 를 변환표로 사용해 밝기를 0~255 전체로 재배치하므로 대비가 좋아집니다." },
      { q: "컬러 이미지의 대비를 평활화로 개선하는 올바른 방법은?", options: ["B, G, R 채널을 각각 equalizeHist 한다","컬러 이미지를 그대로 equalizeHist 에 넣는다","YCrCb 의 Y(밝기) 채널만 평활화하고 다시 합친다","HSV 의 H(색상) 채널을 평활화한다"], answer: 2, explain: "equalizeHist 는 1채널 전용이며, 채널별 평활화는 색을 틀어지게 합니다. 밝기 채널만 처리해야 색이 유지됩니다." },
      { q: "CLAHE 의 clipLimit 인자의 역할은?", options: ["이미지를 자를 영역의 크기","출력 밝기의 최대값","타일마다 히스토그램 높이를 제한해 대비(와 노이즈) 증폭 정도를 억제한다","타일의 개수"], answer: 2, explain: "clipLimit 을 넘는 히스토그램 칸은 잘라서 다른 칸에 나눠 주므로 과도한 대비 증폭과 노이즈 강조를 막습니다. 타일 개수는 tileGridSize 입니다." },
    ],
  },
  /* ======================================================================
   * w3-7 템플릿 매칭
   * ====================================================================== */
  {
    id: 'w3-7',
    summary: '작은 “찾을 그림(템플릿)”을 큰 이미지 위에서 한 칸씩 밀어 가며 가장 닮은 위치를 찾는 템플릿 매칭을 배웁니다. 6가지 비교 방법의 차이, 여러 개 찾기, 크기·회전에 약한 한계까지 직접 실험합니다.',
    goals: [
      'cv.matchTemplate()의 동작 원리와 결과 배열의 크기를 설명할 수 있다',
      'cv.minMaxLoc()으로 최적 위치를 찾고, TM_SQDIFF 계열은 최소값을 써야 하는 이유를 설명할 수 있다',
      '임계값과 np.where 로 여러 개의 객체를 찾고, 중복 검출을 줄일 수 있다',
      '크기·회전 변화에 약한 템플릿 매칭의 한계를 실험으로 확인하고 대처 방법을 말할 수 있다',
    ],
    schedule: [['도입', 3], ['원리와 기본 사용', 10], ['6가지 방법 비교', 8], ['여러 객체 찾기', 10], ['한계 실험 · 나만의 템플릿', 9], ['실습 과제', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 템플릿 매칭(Template Matching)이란?</h3>
<p>“월리를 찾아라” 책에서 월리 사진 조각을 들고 큰 그림 위를 한 칸씩 옮겨 가며 대 보는 모습을 상상해 보세요. <b>템플릿 매칭</b>이 바로 그 방법입니다.</p>
<ol>
<li>작은 이미지(<b>템플릿</b>)를 큰 이미지의 왼쪽 위에 겹친다</li>
<li>겹친 부분이 템플릿과 <b>얼마나 닮았는지 점수</b>를 계산한다</li>
<li>한 칸씩 오른쪽·아래로 밀며 모든 위치에서 반복한다 (2D 컨볼루션과 같은 방식)</li>
</ol>
<p>결과는 <b>점수들로 이루어진 흑백 이미지</b>입니다. 입력 이미지가 W×H, 템플릿이 w×h 이면 결과 크기는 <b>(W−w+1) × (H−h+1)</b> 입니다. 결과의 (x, y) 값은 “템플릿의 <b>왼쪽 위 모서리</b>를 (x, y) 에 놓았을 때의 점수”이므로, 최고점 위치를 찾은 뒤 (w, h) 만큼 더해 사각형을 그리면 됩니다.</p>` },
      { type: 'image', src: 'messi_face.jpg', caption: '템플릿 messi_face.jpg (40×52) — messi5.jpg 에서 잘라낸 얼굴' },
      { type: 'code', title: '예제 1 · 가장 기본적인 템플릿 매칭', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
template = cv.imread('messi_face.jpg')
th, tw = template.shape[:2]           # numpy 모양은 (높이, 너비)

res = cv.matchTemplate(img, template, cv.TM_CCOEFF_NORMED)
print('이미지 크기  :', img.shape[1], 'x', img.shape[0])
print('템플릿 크기  :', tw, 'x', th)
print('결과 배열 크기:', res.shape[1], 'x', res.shape[0], '(= W-w+1, H-h+1)')

min_val, max_val, min_loc, max_loc = cv.minMaxLoc(res)
print('최고 점수 %.3f, 위치(왼쪽 위) %s' % (max_val, max_loc))

top_left = max_loc
bottom_right = (top_left[0] + tw, top_left[1] + th)
vis = img.copy()
cv.rectangle(vis, top_left, bottom_right, (0, 0, 255), 2)

# 점수 지도 보기: -1~1 → 0~255
res_vis = cv.normalize(res, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
cv.circle(res_vis, max_loc, 6, 255, 2)
cv.imshow('result', vis)
cv.imshow('score map', res_vis)
`, desc: '<p>점수 지도에서 가장 밝은 점(동그라미)이 얼굴 위치입니다. 결과 창에 마우스를 올려 점수 지도의 크기가 원본보다 조금 작은 것도 확인해 보세요.</p>' },
      { type: 'text', html: `<h3>2. 6가지 비교 방법</h3>
<p><code>cv.matchTemplate(image, templ, method)</code> 의 method 로 “닮음 점수” 계산 방식을 고릅니다. 크게 세 종류이고, 각각 정규화(<b>_NORMED</b>) 버전이 있습니다.</p>
<ul>
<li><b>SQDIFF</b> (제곱 차이 합) — 픽셀 차이를 제곱해 더함. <b>0 에 가까울수록(작을수록) 닮음</b> → <code>min_loc</code> 사용</li>
<li><b>CCORR</b> (상관) — 픽셀 값을 곱해 더함. 클수록 닮음이지만 <b>밝은 영역에서 무조건 점수가 커지는</b> 약점</li>
<li><b>CCOEFF</b> (상관 계수) — 평균을 뺀 뒤 곱해 더함. 밝기 차이에 덜 민감, 클수록 닮음</li>
</ul>
<p><b>_NORMED</b> 버전은 점수를 일정한 범위(CCOEFF_NORMED 는 −1~1, 나머지는 0~1)로 맞춰 줍니다. 그래서 “0.8 이상이면 찾은 것” 같은 <b>임계값을 정하기 쉽습니다.</b> 처음에는 <b>TM_CCOEFF_NORMED</b> 를 기본으로 쓰세요.</p>` },
      { type: 'table', head: ['method', '최적 위치', '정규화 범위', '특징'], rows: [
        ['<code>cv.TM_SQDIFF</code>', '<b>최소값</b> (min_loc)', '—', '완전히 같으면 0'],
        ['<code>cv.TM_SQDIFF_NORMED</code>', '<b>최소값</b> (min_loc)', '0 ~ 1', '임계값 정하기 쉬움'],
        ['<code>cv.TM_CCORR</code>', '최대값 (max_loc)', '—', '밝은 곳에 치우쳐 자주 틀림'],
        ['<code>cv.TM_CCORR_NORMED</code>', '최대값 (max_loc)', '0 ~ 1', 'CCORR 보다 낫지만 대비가 약함'],
        ['<code>cv.TM_CCOEFF</code>', '최대값 (max_loc)', '—', '평균을 빼서 밝기 변화에 강함'],
        ['<code>cv.TM_CCOEFF_NORMED</code>', '최대값 (max_loc)', '−1 ~ 1', '<b>가장 무난한 기본 선택</b>'],
      ] },
      { type: 'code', title: '예제 2 · 6가지 방법 한 번에 비교 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read"
img2 = img.copy()
template = cv.imread('messi_face.jpg', cv.IMREAD_GRAYSCALE)
w, h = template.shape[::-1]          # shape 는 (높이, 너비) → 뒤집어서 (너비, 높이)

methods = ['TM_CCOEFF', 'TM_CCOEFF_NORMED', 'TM_CCORR',
           'TM_CCORR_NORMED', 'TM_SQDIFF', 'TM_SQDIFF_NORMED']

plt.figure(figsize=(12, 10))
for i, meth in enumerate(methods):
    img = img2.copy()
    method = getattr(cv, meth)       # 문자열 이름 → 실제 상수 값

    res = cv.matchTemplate(img, template, method)
    min_val, max_val, min_loc, max_loc = cv.minMaxLoc(res)

    # TM_SQDIFF 계열은 값이 작을수록 닮은 것 → 최소 위치 사용
    if method in [cv.TM_SQDIFF, cv.TM_SQDIFF_NORMED]:
        top_left = min_loc
    else:
        top_left = max_loc
    bottom_right = (top_left[0] + w, top_left[1] + h)
    cv.rectangle(img, top_left, bottom_right, 255, 2)
    print('%-17s → 찾은 위치 %s' % (meth, top_left))

    plt.subplot(3, 4, 2 * i + 1), plt.imshow(res, cmap='gray')
    plt.title(meth + ' map', fontsize=9), plt.xticks([]), plt.yticks([])
    plt.subplot(3, 4, 2 * i + 2), plt.imshow(img, cmap='gray')
    plt.title('Detected', fontsize=9), plt.xticks([]), plt.yticks([])
plt.tight_layout()
plt.show()
`, desc: '<p>정답 위치는 (220, 85) 근처입니다. 튜토리얼 결과처럼 <b>TM_CCORR</b> 만 엉뚱한(밝은) 곳을 찾는 것을 확인하세요. SQDIFF 계열의 점수 지도는 정답 위치가 <b>가장 어두운</b> 점입니다.</p>' },
      { type: 'warn', html: `<p><b>자주 하는 실수 두 가지</b><br>① TM_SQDIFF / TM_SQDIFF_NORMED 인데 <code>max_loc</code> 을 쓰면 가장 <b>안 닮은</b> 곳을 찾습니다.<br>② 템플릿 크기를 <code>h, w = template.shape[:2]</code> 로 받아 놓고 사각형을 <code>(x + h, y + w)</code> 로 그리는 순서 실수. numpy shape 는 (높이, 너비), OpenCV 좌표는 (x, y) 입니다.</p>` },
      { type: 'text', html: `<h3>3. 여러 개의 객체 찾기</h3>
<p><code>cv.minMaxLoc()</code> 은 <b>최고점 하나</b>만 알려 줍니다. 같은 물체가 여러 개라면 “점수가 임계값 이상인 <b>모든</b> 위치”를 찾아야 합니다. 튜토리얼(마리오 동전 예제)의 방법은 다음과 같습니다.</p>
<ul>
<li><code>loc = np.where(res &gt;= threshold)</code> → (y 좌표 배열, x 좌표 배열) 을 반환</li>
<li><code>zip(*loc[::-1])</code> → 순서를 뒤집어 (x, y) 쌍으로 하나씩 꺼냄</li>
</ul>
<p>그런데 정답 위치 바로 옆 픽셀들도 점수가 높아서 <b>같은 물체에 사각형이 수십 개 겹쳐</b> 그려집니다. 간단한 해결책은 “주변에서 가장 높은 점(<b>지역 최대값</b>)만 남기기”입니다. 결과 배열을 팽창(dilate)시키면 각 픽셀이 주변 최대값으로 바뀌므로, <code>res == cv.dilate(res, kernel)</code> 인 곳이 바로 지역 최대값입니다(3교시 비최대 억제와 같은 아이디어).</p>
<p>우리 샘플에는 마리오 이미지가 없으므로 <code>water_coins.jpg</code> 에서 <b>동전 하나를 잘라</b> 템플릿으로 사용합니다.</p>` },
      { type: 'code', title: '예제 3 · 동전 하나를 잘라 모든 동전 찾기 (튜토리얼 방식)', code: String.raw`
import cv2 as cv
import numpy as np

img_rgb = cv.imread('water_coins.jpg')
img_gray = cv.cvtColor(img_rgb, cv.COLOR_BGR2GRAY)

# 왼쪽 위 동전 하나를 ROI 로 잘라 템플릿으로 사용
template = img_gray[15:62, 42:90]
h, w = template.shape

res = cv.matchTemplate(img_gray, template, cv.TM_CCOEFF_NORMED)
threshold = 0.6
loc = np.where(res >= threshold)             # (y 배열, x 배열)
print('임계값 %.1f 이상인 위치 수: %d  ← 같은 동전이 여러 번 잡힘' % (threshold, len(loc[0])))

vis = img_rgb.copy()
for pt in zip(*loc[::-1]):                   # (x, y) 순서로
    cv.rectangle(vis, pt, (pt[0] + w, pt[1] + h), (0, 0, 255), 1)

cv.imshow('template', cv.resize(template, None, fx=3, fy=3, interpolation=cv.INTER_NEAREST))
cv.imshow('res.png', vis)
` },
      { type: 'code', title: '예제 4 · 지역 최대값만 남겨 중복 없이 세기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
template = gray[15:62, 42:90]
h, w = template.shape
res = cv.matchTemplate(gray, template, cv.TM_CCOEFF_NORMED)

# 21×21 범위 안에서 가장 높은 점만 남기기 (동전 반지름보다 작게)
local_max = cv.dilate(res, np.ones((21, 21), np.uint8))
for threshold in (0.4, 0.5, 0.6, 0.7):
    peaks = (res == local_max) & (res >= threshold)
    print('임계값 %.1f → 찾은 동전 %2d 개 (실제 24개)' % (threshold, np.count_nonzero(peaks)))

threshold = 0.5
ys, xs = np.where((res == local_max) & (res >= threshold))
vis = img.copy()
for x, y in zip(xs, ys):
    cv.rectangle(vis, (int(x), int(y)), (int(x) + w, int(y) + h), (0, 0, 255), 2)
    cv.putText(vis, '%.2f' % res[y, x], (int(x), int(y) + 12), cv.FONT_HERSHEY_SIMPLEX, 0.35, (255, 0, 0), 1)
cv.imshow('peaks (threshold 0.5)', vis)
`, desc: '<p>임계값을 낮춰도 24개를 모두 찾지 못합니다. 동전마다 <b>숫자 “1” 이 회전된 각도</b>가 달라서, 템플릿(똑바른 “1”)과 모양이 다르기 때문입니다. 점수가 1.00 인 동전은 템플릿을 잘라 온 바로 그 동전입니다.</p>' },
      { type: 'text', html: `<h3>4. 템플릿 매칭의 한계와 대처</h3>
<p>템플릿 매칭은 간단하고 빠르지만, 템플릿을 “픽셀 그대로” 비교하므로 다음 변화에 약합니다.</p>
<ul>
<li><b>크기(scale)</b> — 물체가 조금만 커지거나 작아져도 점수가 크게 떨어짐 → 이미지나 템플릿을 여러 크기로 바꿔 가며 찾기(<b>멀티 스케일</b>)</li>
<li><b>회전(rotation)</b> — 동전 예제처럼 돌아간 물체를 놓침 → 여러 각도로 회전한 템플릿 사용</li>
<li><b>조명·색</b> — _NORMED 방법이 어느 정도 버텨 주지만 그림자 등에는 약함</li>
<li><b>가려짐·모양 변화</b> — 사람 자세처럼 모양이 바뀌면 사실상 불가</li>
<li><b>색 정보</b> — 흑백으로 비교하면 모양이 같은 다른 색 물체도 찾음. 컬러 이미지를 그대로 넣으면 색까지 비교</li>
</ul>
<p>이런 한계를 넘는 방법(특징점 매칭 ORB/SIFT, 딥러닝 검출기)은 이 강좌 이후의 학습 주제입니다. 반대로 <b>크기·각도가 고정된 환경</b>(화면 캡처 속 아이콘, 고정 카메라의 부품 검사)에서는 템플릿 매칭이 여전히 매우 유용합니다.</p>` },
      { type: 'code', title: '예제 5 · 크기와 회전이 바뀌면 점수가 얼마나 떨어질까?', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
tpl = cv.imread('messi_face.jpg', cv.IMREAD_GRAYSCALE)
h, w = img.shape

# ① 이미지 크기를 바꿔 가며 최고 점수 기록
scales = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5]
scale_scores = []
for s in scales:
    resized = cv.resize(img, None, fx=s, fy=s)
    res = cv.matchTemplate(resized, tpl, cv.TM_CCOEFF_NORMED)
    scale_scores.append(cv.minMaxLoc(res)[1])

# ② 얼굴 중심(240, 111)을 기준으로 이미지를 회전시키며 최고 점수 기록
angles = [0, 3, 5, 10, 15, 20, 30, 45]
angle_scores = []
for a in angles:
    M = cv.getRotationMatrix2D((240, 111), a, 1.0)
    rotated = cv.warpAffine(img, M, (w, h))
    res = cv.matchTemplate(rotated, tpl, cv.TM_CCOEFF_NORMED)
    angle_scores.append(cv.minMaxLoc(res)[1])

for s, sc in zip(scales, scale_scores):
    print('크기 x%.1f → 최고 점수 %.3f' % (s, sc))
for a, sc in zip(angles, angle_scores):
    print('회전 %2d도 → 최고 점수 %.3f' % (a, sc))

plt.figure(figsize=(10, 3.5))
plt.subplot(1, 2, 1), plt.plot(scales, scale_scores, 'o-'), plt.ylim(0, 1.05)
plt.title('Score vs scale'), plt.xlabel('scale')
plt.subplot(1, 2, 2), plt.plot(angles, angle_scores, 'o-', color='r'), plt.ylim(0, 1.05)
plt.title('Score vs rotation'), plt.xlabel('degrees')
plt.tight_layout()
plt.show()
`, desc: '<p>크기가 10% 만 달라져도 점수가 0.99 에서 0.77 정도로, 20% 달라지면 0.6 대로 떨어집니다. 회전도 5° 에 0.87, 10° 에 0.75 로 빠르게 낮아집니다. 0.6~0.7 은 엉뚱한 곳의 점수와 비슷한 수준이라 구분하기 어려워집니다.</p>' },
      { type: 'code', title: '예제 6 · 마우스로 클릭한 캔디를 템플릿으로 같은 색 캔디 찾기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')
vis = img.copy()
HALF = 22                     # 클릭 위치를 중심으로 44×44 를 잘라 템플릿으로

def on_mouse(event, x, y, flags, param):
    if event != cv.EVENT_LBUTTONDOWN:
        return
    H, W = img.shape[:2]
    x1, y1 = max(0, x - HALF), max(0, y - HALF)
    x2, y2 = min(W, x + HALF), min(H, y + HALF)
    tpl = img[y1:y2, x1:x2]
    if tpl.std() < 10:        # 거의 한 가지 색(흰 배경)이면 비교 의미가 없음
        print('배경을 클릭했어요. 캔디 가운데를 클릭해 보세요.')
        return

    # 컬러 그대로 비교 → 모양뿐 아니라 색까지 닮아야 높은 점수
    res = cv.matchTemplate(img, tpl, cv.TM_CCOEFF_NORMED)
    th, tw = tpl.shape[:2]
    peaks = (res == cv.dilate(res, np.ones((25, 25), np.uint8))) & (res >= 0.7)
    ys, xs = np.where(peaks)

    vis[:] = img                                   # 이전 표시 지우기 (제자리 수정)
    for px, py in zip(xs, ys):
        cv.rectangle(vis, (int(px), int(py)), (int(px) + tw, int(py) + th), (0, 0, 255), 2)
    cv.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 2)
    print('클릭 (%d, %d) → 비슷한 캔디 %d 개' % (x, y, len(xs)))

cv.imshow('smarties', vis)
cv.setMouseCallback('smarties', on_mouse)
print('캔디를 클릭하세요 (초록 = 템플릿, 빨강 = 찾은 위치)')
`, desc: '<p>파란 캔디를 클릭하면 파란 캔디만, 빨간 캔디를 클릭하면 빨간(때로는 주황) 캔디가 잡힙니다. 컬러 이미지를 그대로 비교했기 때문입니다. 흑백으로 바꿔 비교하면 어떻게 달라질지 예상해 보세요.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 나만의 템플릿을 ROI 로 잘라 파란 캔디 모두 찾기',
        desc: `<p><code>smarties.png</code> 에서 <b>파란 캔디 하나</b>를 ROI 좌표로 잘라 템플릿을 만들고, 이미지 안의 <b>파란 캔디 3개</b>를 모두 찾아 사각형을 그리세요. 오른쪽 위의 파란 캔디 중심은 약 (376, 82), 반지름은 약 27 입니다. 마우스를 이미지 위에 올리면 좌표를 확인할 수 있습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')

# TODO 1: 파란 캔디가 들어가도록 ROI 좌표 바꾸기 (지금은 빈 배경 영역)
y1, y2, x1, x2 = 0, 55, 0, 55
template = img[y1:y2, x1:x2]
th, tw = template.shape[:2]

res = cv.matchTemplate(img, template, cv.TM_CCOEFF_NORMED)
# TODO 2: 임계값을 조절해 파란 캔디 3개만 남기기
threshold = 0.99
peaks = (res == cv.dilate(res, np.ones((31, 31), np.uint8))) & (res >= threshold)
ys, xs = np.where(peaks)
print('찾은 개수:', len(xs))

vis = img.copy()
for x, y in zip(xs, ys):
    cv.rectangle(vis, (int(x), int(y)), (int(x) + tw, int(y) + th), (0, 0, 255), 2)
cv.imshow('template', template)
cv.imshow('result', vis)
`,
        hint: `<p>중심 (376, 82), 반지름 27 이면 행은 55~110, 열은 349~404 입니다: <code>y1, y2, x1, x2 = 55, 110, 349, 404</code>. 임계값 0.5 에서는 다른 캔디도 섞이니 0.7 전후로 올려 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('smarties.png')

y1, y2, x1, x2 = 55, 110, 349, 404          # 오른쪽 위 파란 캔디
template = img[y1:y2, x1:x2]
th, tw = template.shape[:2]

res = cv.matchTemplate(img, template, cv.TM_CCOEFF_NORMED)
for t in (0.5, 0.6, 0.7, 0.8):
    n = np.count_nonzero((res == cv.dilate(res, np.ones((31, 31), np.uint8))) & (res >= t))
    print('임계값 %.1f → %d 개' % (t, n))

threshold = 0.7
peaks = (res == cv.dilate(res, np.ones((31, 31), np.uint8))) & (res >= threshold)
ys, xs = np.where(peaks)
print('찾은 개수:', len(xs))

vis = img.copy()
for x, y in zip(xs, ys):
    cv.rectangle(vis, (int(x), int(y)), (int(x) + tw, int(y) + th), (0, 0, 255), 2)
    cv.putText(vis, '%.2f' % res[y, x], (int(x), int(y) - 3), cv.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
cv.imshow('template', template)
cv.imshow('result', vis)
`,
      },
      {
        title: '실습 2 · 멀티 스케일 템플릿 매칭',
        desc: `<p>messi5.jpg 를 <b>0.7배로 줄인</b> 이미지에서는 원래 크기의 얼굴 템플릿이 잘 맞지 않습니다. 템플릿 크기를 0.5~1.5배로 바꿔 가며 매칭해 <b>가장 점수가 높은 크기와 위치</b>를 찾고, 그 결과로 사각형을 그리세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
small = cv.resize(img, None, fx=0.7, fy=0.7)      # 얼굴이 작아진 이미지
gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
tpl = cv.imread('messi_face.jpg', cv.IMREAD_GRAYSCALE)

best_score, best_loc, best_size = -1, (0, 0), (tpl.shape[1], tpl.shape[0])

# TODO: s 를 0.5 ~ 1.5 (0.1 간격)로 바꾸며 템플릿을 resize 하고,
#       matchTemplate + minMaxLoc 으로 최고 점수를 비교해 best_* 갱신하기
res = cv.matchTemplate(gray, tpl, cv.TM_CCOEFF_NORMED)
_, best_score, _, best_loc = cv.minMaxLoc(res)

print('최고 점수 %.3f, 위치 %s, 템플릿 크기 %s' % (best_score, best_loc, best_size))
x, y = best_loc
cv.rectangle(small, (x, y), (x + best_size[0], y + best_size[1]), (0, 0, 255), 2)
cv.imshow('multi-scale', small)
`,
        hint: `<p><code>for s in np.arange(0.5, 1.51, 0.1):</code> 안에서 <code>t = cv.resize(tpl, None, fx=s, fy=s)</code> 로 만들고, 점수가 best_score 보다 크면 <code>best_size = (t.shape[1], t.shape[0])</code> 와 함께 갱신합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
small = cv.resize(img, None, fx=0.7, fy=0.7)      # 얼굴이 작아진 이미지
gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)
tpl = cv.imread('messi_face.jpg', cv.IMREAD_GRAYSCALE)

best_score, best_loc, best_size, best_s = -1, (0, 0), (tpl.shape[1], tpl.shape[0]), 1.0
for s in np.arange(0.5, 1.51, 0.1):
    t = cv.resize(tpl, None, fx=s, fy=s)
    res = cv.matchTemplate(gray, t, cv.TM_CCOEFF_NORMED)
    _, score, _, loc = cv.minMaxLoc(res)
    print('템플릿 x%.1f → 점수 %.3f' % (s, score))
    if score > best_score:
        best_score, best_loc, best_size, best_s = score, loc, (t.shape[1], t.shape[0]), s

print('최고 점수 %.3f (템플릿 x%.1f), 위치 %s, 크기 %s' % (best_score, best_s, best_loc, best_size))
x, y = best_loc
cv.rectangle(small, (x, y), (x + best_size[0], y + best_size[1]), (0, 0, 255), 2)
cv.imshow('multi-scale', small)
`,
      },
      {
        title: '실습 3 · 웹캠 템플릿 추적기',
        desc: `<p>처음 실행할 때와 트랙바 <b>grab</b> 값을 바꿀 때(0↔1)마다 화면 <b>가운데 80×80</b> 영역을 템플릿으로 저장하고, 이후 매 프레임마다 그 물체를 찾아 사각형과 점수를 표시하세요. 속도를 위해 프레임을 320×240 으로 줄여서 처리합니다. 📷 웹캠에서 물건을 화면 가운데에 두고 grab 한 뒤 천천히 움직여 보세요. 웹캠이 없으면 🎞️ 동영상 cup.mp4 를 입력 소스로 고르고, 컵이 가운데 올 때 grab 을 바꿔 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('grab', 'result', 0, 1, nothing)
template = None
last_grab = 0

def process(frame):
    global template, last_grab
    small = cv.resize(frame, (320, 240))
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)

    g = cv.getTrackbarPos('grab', 'result')
    if template is None or g != last_grab:           # 처음이거나 grab 값이 바뀌면
        template = gray[80:160, 120:200].copy()     # 가운데 80×80 저장
        last_grab = g

    # TODO 1: gray 에서 template 을 TM_CCOEFF_NORMED 로 찾고 최고 점수·위치 구하기
    score, loc = 0.0, (120, 80)

    # TODO 2: 점수가 0.6 이상이면 초록, 아니면 빨강으로 사각형과 점수 그리기
    cv.rectangle(small, loc, (loc[0] + 80, loc[1] + 80), (0, 255, 255), 2)
    return small
`,
        hint: `<p><code>res = cv.matchTemplate(gray, template, cv.TM_CCOEFF_NORMED)</code>, <code>_, score, _, loc = cv.minMaxLoc(res)</code>. 색은 <code>(0, 255, 0) if score &gt;= 0.6 else (0, 0, 255)</code>, 점수는 <code>cv.putText(small, '%.2f' % score, ...)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('grab', 'result', 0, 1, nothing)
template = None
last_grab = 0

def process(frame):
    global template, last_grab
    small = cv.resize(frame, (320, 240))
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)

    g = cv.getTrackbarPos('grab', 'result')
    if template is None or g != last_grab:           # 처음이거나 grab 값이 바뀌면
        template = gray[80:160, 120:200].copy()     # 가운데 80×80 저장
        last_grab = g

    res = cv.matchTemplate(gray, template, cv.TM_CCOEFF_NORMED)
    _, score, _, loc = cv.minMaxLoc(res)

    color = (0, 255, 0) if score >= 0.6 else (0, 0, 255)
    cv.rectangle(small, loc, (loc[0] + 80, loc[1] + 80), color, 2)
    cv.putText(small, '%.2f' % score, (loc[0], max(15, loc[1] - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    return small
`,
      },
    ],
    quiz: [
      { q: "크기 500×400 이미지에서 50×40 템플릿으로 matchTemplate 을 하면 결과 배열의 (너비×높이)는?", options: ["451×361","500×400","450×360","550×440"], answer: 0, explain: "결과 크기는 (W−w+1) × (H−h+1) = 451 × 361 입니다." },
      { q: "cv.TM_SQDIFF_NORMED 방법에서 가장 닮은 위치는?", options: ["minMaxLoc 의 max_loc","결과 배열의 가운데","항상 (0, 0)","minMaxLoc 의 min_loc"], answer: 3, explain: "SQDIFF 는 차이의 제곱합이라 작을수록 닮았습니다. 그래서 min_loc 을 사용합니다." },
      { q: "np.where(res >= 0.8) 로 여러 객체를 찾을 때 한 물체에 사각형이 여러 개 겹치는 이유는?", options: ["템플릿이 컬러라서","정답 위치 주변 픽셀들도 점수가 임계값을 넘기 때문","np.where 가 좌표를 중복해서 돌려주기 때문","이미지가 너무 커서"], answer: 1, explain: "템플릿을 한두 픽셀 옮겨도 여전히 많이 겹치므로 점수가 높습니다. 지역 최대값만 남기거나 겹치는 박스를 합쳐 해결합니다." },
      { q: "템플릿 매칭이 잘 동작하기 어려운 상황은?", options: ["카메라와의 거리와 각도가 계속 바뀌는 물체 찾기","게임 화면 속 크기가 일정한 아이콘 찾기","고정 카메라로 같은 부품 위치 확인하기","같은 이미지에서 잘라 낸 조각의 원래 위치 찾기"], answer: 0, explain: "템플릿 매칭은 크기·회전 변화에 약합니다. 이런 경우 멀티 스케일/회전 템플릿이나 특징점 매칭 같은 다른 방법이 필요합니다." },
    ],
  },

  /* ======================================================================
   * w3-8 허프 변환과 3주차 총정리
   * ====================================================================== */
  {
    id: 'w3-8',
    summary: '엣지 점들의 “투표”로 직선과 원을 찾는 허프 변환(HoughLines, HoughLinesP, HoughCircles)을 배우고, 1~3주차에 배운 모든 기법을 목적별로 정리해 4주차 가이드 프로젝트를 준비합니다.',
    goals: [
      '허프 변환의 투표(accumulator) 아이디어와 직선의 (ρ, θ) 표현을 설명할 수 있다',
      'cv.HoughLines 와 cv.HoughLinesP 의 차이를 알고 minLineLength, maxLineGap 을 조절할 수 있다',
      'cv.HoughCircles 의 dp, minDist, param1, param2, 반지름 범위를 조절해 원을 검출할 수 있다',
      '1~3주차 기법을 “목적 → 함수” 파이프라인으로 조합해 문제 해결 순서를 설계할 수 있다',
    ],
    schedule: [['도입', 3], ['허프 직선 원리', 7], ['HoughLines · HoughLinesP 예제', 9], ['HoughCircles 예제', 9], ['실습 과제', 7], ['3주차 총정리 · 4주차 예고', 8], ['종합 퀴즈', 7]],
    blocks: [
      { type: 'text', html: `<h3>1. 허프 변환(Hough Transform)의 아이디어 — 점들의 투표</h3>
<p>Canny 로 엣지 점들을 얻었다고 해도, 컴퓨터는 아직 “여기에 <b>직선</b>이 있다”는 사실을 모릅니다. 점들은 끊겨 있고 노이즈도 섞여 있죠. <b>허프 변환</b>은 모양을 수식으로 나타낼 수 있다면 어떤 모양이든 찾아내는 방법으로, 핵심은 <b>투표</b>입니다.</p>
<ul>
<li>엣지 점 하나를 지나는 직선은 무수히 많습니다. 점은 “나를 지나는 모든 직선 후보”에 <b>한 표씩</b> 던집니다</li>
<li>모든 엣지 점이 투표를 마치면, 실제로 존재하는 직선은 그 위의 많은 점들에게서 표를 받아 <b>득표수가 높아집니다</b></li>
<li><b>득표수가 임계값(threshold) 이상</b>인 후보만 직선으로 인정합니다</li>
</ul>
<h4>직선을 (ρ, θ) 로 표현하기</h4>
<p>y = mx + c 로 직선을 나타내면 세로선은 기울기 m 이 무한대가 되어 곤란합니다. 그래서 허프 변환은 직선을</p>
<p><b>ρ = x·cosθ + y·sinθ</b></p>
<p>로 나타냅니다. <b>ρ(로)</b> 는 원점(왼쪽 위)에서 직선까지의 <b>수직 거리</b>, <b>θ(세타)</b> 는 그 수선이 x 축과 이루는 <b>각도</b>입니다. 예를 들어 가로선은 θ = 90°, 세로선은 θ = 0° 이고, 원점에서 50 픽셀 아래의 가로선은 (ρ, θ) = (50, 90°) 입니다.</p>` },
      { type: 'text', html: `<h3>2. 투표함(Accumulator)과 cv.HoughLines</h3>
<p>튜토리얼의 예를 따라가 봅시다. 100×100 이미지 한가운데에 가로선이 있습니다.</p>
<ol>
<li>ρ 는 행, θ 는 열인 2차원 배열(투표함)을 0 으로 준비합니다. 각도 정밀도를 1° 로 하면 열은 180 개, ρ 의 최대값은 이미지 대각선 길이입니다</li>
<li>선 위의 첫 점 (x, y) 에 대해 θ = 0°, 1°, 2°, … 180° 마다 ρ 를 계산해 해당 칸에 +1 합니다. 이때 (50, 90°) 칸도 한 표를 받습니다</li>
<li>선 위의 다른 점들도 똑같이 투표하면, 모두가 공통으로 지나는 <b>(50, 90°) 칸의 표가 가장 많이 쌓입니다</b></li>
<li>표가 가장 많은 칸 = “원점에서 50 떨어진 90° 방향의 직선”을 찾은 것!</li>
</ol>
<p><code>lines = cv.HoughLines(edges, rho, theta, threshold)</code> 는 이 과정을 수행해 <b>[[ρ, θ]] 배열</b>을 돌려줍니다. 선분의 끝점이 아니라 <b>무한히 긴 직선</b>의 정보이므로, 그릴 때는 직선 위의 점 (x0, y0) = (ρcosθ, ρsinθ) 에서 방향을 따라 ±1000 픽셀 늘린 두 점을 이어 그립니다.</p>` },
      { type: 'table', head: ['함수 / 인자', '의미', '예시 값'], rows: [
        ['<code>image</code>', '이진 엣지 이미지 (보통 Canny 결과)', 'edges'],
        ['<code>rho</code>', 'ρ 의 해상도(픽셀). 투표함 칸의 거리 간격', '1'],
        ['<code>theta</code>', 'θ 의 해상도(라디안)', '<code>np.pi / 180</code> (1°)'],
        ['<code>threshold</code>', '직선으로 인정할 <b>최소 득표수</b>. 클수록 긴(확실한) 직선만', '100 ~ 200'],
        ['<code>minLineLength</code> (P 전용)', '이보다 짧은 선분은 버림', '100'],
        ['<code>maxLineGap</code> (P 전용)', '같은 직선 위 선분 사이 간격이 이 이하면 하나로 이음', '10'],
      ] },
      { type: 'code', title: '예제 1 · HoughLines 로 스도쿠 격자선 찾기 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
assert img is not None, "file could not be read"
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
edges = cv.Canny(gray, 50, 150, apertureSize=3)

lines = cv.HoughLines(edges, 1, np.pi / 180, 200)
print('찾은 직선 수:', 0 if lines is None else len(lines))

if lines is not None:
    for line in lines:
        rho, theta = line[0]
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a * rho                     # 원점에서 직선에 내린 수선의 발
        y0 = b * rho
        x1 = int(x0 + 1000 * (-b))       # 직선 방향으로 ±1000 픽셀
        y1 = int(y0 + 1000 * (a))
        x2 = int(x0 - 1000 * (-b))
        y2 = int(y0 - 1000 * (a))
        cv.line(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
    for rho, theta in lines[:5, 0]:
        print('  ρ = %6.1f px, θ = %5.1f 도' % (rho, np.degrees(theta)))

cv.imshow('edges', edges)
cv.imshow('houghlines3.jpg', img)
`, desc: '<p>θ 가 0° 근처면 세로선, 90° 근처면 가로선입니다. threshold 를 150 으로 낮추면 선이 늘고, 250 으로 올리면 줄어드는 것을 확인해 보세요. 같은 격자선에 비슷한 직선이 여러 개 겹치기도 합니다.</p>' },
      { type: 'text', html: `<h3>3. 확률적 허프 변환 — cv.HoughLinesP</h3>
<p>HoughLines 는 모든 엣지 점이 모든 각도에 투표하므로 계산량이 많고, 결과가 끝없는 직선이라 “선분이 어디서 어디까지인지”를 알 수 없습니다. <b>확률적 허프 변환(Probabilistic Hough Transform)</b> 은</p>
<ul>
<li>엣지 점 중 <b>무작위로 일부만</b> 뽑아 투표해 더 빠르고 (그래서 threshold 를 조금 낮게 잡음)</li>
<li>결과를 <b>선분의 두 끝점 [[x1, y1, x2, y2]]</b> 으로 바로 돌려줘 그리기 쉽습니다</li>
</ul>
<p>추가 인자 <b>minLineLength</b>(너무 짧은 선분 버리기)와 <b>maxLineGap</b>(끊어진 선분 이어 붙이기)로 결과를 다듬습니다.</p>` },
      { type: 'code', title: '예제 2 · HoughLinesP 로 선분 찾기 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
edges = cv.Canny(gray, 50, 150, apertureSize=3)

lines = cv.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)
print('찾은 선분 수:', 0 if lines is None else len(lines))

if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]
        cv.line(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
    print('첫 선분의 끝점:', lines[0][0].tolist())

cv.imshow('houghlines5.jpg', img)
` },
      { type: 'code', title: '예제 3 · 트랙바로 HoughLinesP 파라미터 튜닝 (building.jpg)', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('building.jpg')
img = cv.resize(img, None, fx=0.7, fy=0.7)
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
edges = cv.Canny(cv.GaussianBlur(gray, (5, 5), 0), 50, 150)
WIN = 'lines'

def update(x=0):
    t = max(1, cv.getTrackbarPos('threshold', WIN))
    min_len = cv.getTrackbarPos('minLineLength', WIN)
    gap = cv.getTrackbarPos('maxLineGap', WIN)
    lines = cv.HoughLinesP(edges, 1, np.pi / 180, t, minLineLength=min_len, maxLineGap=gap)
    vis = img.copy()
    n = 0 if lines is None else len(lines)
    if lines is not None:
        for x1, y1, x2, y2 in lines[:, 0]:
            cv.line(vis, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
    cv.putText(vis, 'lines: %d' % n, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
    cv.imshow(WIN, vis)

cv.imshow(WIN, img)
cv.createTrackbar('threshold', WIN, 80, 300, update)
cv.createTrackbar('minLineLength', WIN, 50, 300, update)
cv.createTrackbar('maxLineGap', WIN, 5, 50, update)
update()
`, desc: '<p>minLineLength 를 올리면 짧은 나뭇가지·잔디 선분이 사라지고 건물의 긴 층 경계만 남습니다. maxLineGap 을 올리면 창문으로 끊긴 선분들이 하나의 긴 선으로 이어집니다.</p>' },
      { type: 'text', html: `<h3>4. 허프 원 변환 — cv.HoughCircles</h3>
<p>원은 <b>(중심 x, 중심 y, 반지름 r)</b> 세 값으로 표현되므로 투표함이 3차원이 되어 계산량이 매우 큽니다. OpenCV 는 엣지의 <b>그래디언트 방향</b>을 이용하는 똑똑한 방법(<code>cv.HOUGH_GRADIENT</code>)으로 이를 줄입니다. 원의 엣지에서 그래디언트 방향은 항상 중심을 향하므로, 그 방향으로만 중심 후보에 투표하면 됩니다.</p>
<p>함수 안에서 Canny 를 직접 수행하므로 입력은 엣지가 아닌 <b>8비트 흑백 이미지</b>이며, 노이즈 때문에 가짜 원이 많이 생기므로 보통 <b>medianBlur</b> 를 먼저 합니다. 결과는 <b>[[[x, y, r], …]]</b> 모양이고, 원을 못 찾으면 <b>None</b> 입니다.</p>` },
      { type: 'table', head: ['인자', '의미', '조절 요령'], rows: [
        ['<code>method</code>', '<code>cv.HOUGH_GRADIENT</code> (또는 개선판 HOUGH_GRADIENT_ALT)', '기본은 HOUGH_GRADIENT'],
        ['<code>dp</code>', '투표함 해상도의 역비율. 1 = 이미지와 같음, 2 = 절반', '1 ~ 1.5'],
        ['<code>minDist</code>', '검출된 원 중심 사이의 최소 거리', '작으면 같은 원이 여러 번, 크면 붙은 원을 놓침'],
        ['<code>param1</code>', '내부 Canny 의 높은 임계값 (낮은 값은 절반)', '50 ~ 150'],
        ['<code>param2</code>', '중심 투표의 임계값', '<b>작을수록 원이 많이(가짜 포함) 검출</b>'],
        ['<code>minRadius</code>, <code>maxRadius</code>', '찾을 반지름 범위 (0 = 제한 없음)', '크기를 알면 꼭 지정 → 정확·빠름'],
      ] },
      { type: 'code', title: '예제 4 · OpenCV 로고에서 원 찾기 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('opencv-logo-white.png', cv.IMREAD_GRAYSCALE)
assert img is not None, "file could not be read"
img = cv.medianBlur(img, 5)
cimg = cv.cvtColor(img, cv.COLOR_GRAY2BGR)

circles = cv.HoughCircles(img, cv.HOUGH_GRADIENT, 1, 20,
                          param1=50, param2=30, minRadius=0, maxRadius=0)

if circles is None:
    print('원을 찾지 못했습니다')
else:
    circles = np.uint16(np.around(circles))
    print('찾은 원 수:', circles.shape[1])
    for i in circles[0, :]:
        cx, cy, r = int(i[0]), int(i[1]), int(i[2])    # 파이썬 int 로 변환해서 전달
        cv.circle(cimg, (cx, cy), r, (0, 255, 0), 2)    # 바깥 원
        cv.circle(cimg, (cx, cy), 2, (0, 0, 255), 3)    # 중심점
        print('  중심 (%d, %d), 반지름 %d' % (cx, cy, r))

cv.imshow('detected circles', cimg)
` },
      { type: 'code', title: '예제 5 · 캔디 개수 세기 (smarties.png)', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('smarties.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
gray = cv.medianBlur(gray, 5)

# 캔디 반지름이 약 25~30px 이므로 범위를 지정하면 가짜 원이 크게 줄어듦
for p2 in (15, 30, 50):
    c = cv.HoughCircles(gray, cv.HOUGH_GRADIENT, 1, 20, param1=50, param2=p2, minRadius=15, maxRadius=40)
    print('param2 = %2d → 원 %s 개' % (p2, 0 if c is None else c.shape[1]))

circles = cv.HoughCircles(gray, cv.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=15, maxRadius=40)
vis = img.copy()
count = 0
if circles is not None:
    for x, y, r in np.around(circles[0]).astype(int):
        count += 1
        cv.circle(vis, (int(x), int(y)), int(r), (0, 255, 0), 2)
        cv.putText(vis, str(count), (int(x) - 6, int(y) + 6), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
print('캔디 개수:', count)
cv.putText(vis, 'count: %d' % count, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)
cv.imshow('smarties count', vis)
`, desc: '<p>이미지 가장자리에 반쯤 잘린 캔디(왼쪽 아래 초록, 아래쪽 갈색)는 원의 일부만 보여서 표를 충분히 받지 못해 빠질 수 있습니다. param2 를 낮추면 이런 원도 잡히지만 가짜 원이 늘어날 위험이 있습니다.</p>' },
      { type: 'code', title: '예제 6 · 웹캠 원 검출 (축소해서 빠르게)', code: String.raw`
import numpy as np
import cv2 as cv

# 오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸고 컵·동전·공 같은 둥근 물체를 비춰 보세요.
# 웹캠이 없으면 입력 이미지를 smarties.png 로 고르거나 🎞️ 동영상(cup.mp4 등)으로 실험해도 됩니다.
def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('param2', 'result', 30, 100, nothing)

def process(frame):
    scale = 0.5                                        # 640×480 → 320×240 로 줄여 계산
    small = cv.resize(frame, None, fx=scale, fy=scale)
    gray = cv.medianBlur(cv.cvtColor(small, cv.COLOR_BGR2GRAY), 5)

    p2 = max(10, cv.getTrackbarPos('param2', 'result'))
    circles = cv.HoughCircles(gray, cv.HOUGH_GRADIENT, 1, 20,
                              param1=100, param2=p2, minRadius=8, maxRadius=50)
    vis = frame.copy()
    n = 0
    if circles is not None:
        for x, y, r in circles[0]:
            # 줄인 좌표를 원래 크기로 되돌려 그리기
            cx, cy, rr = int(x / scale), int(y / scale), int(r / scale)
            cv.circle(vis, (cx, cy), rr, (0, 255, 0), 2)
            cv.circle(vis, (cx, cy), 3, (0, 0, 255), -1)
            n += 1
    cv.putText(vis, 'circles: %d  (param2=%d)' % (n, p2), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return vis
`, desc: '<p>가짜 원이 많이 보이면 param2 를 올리고, 원을 놓치면 내리세요. messi5.jpg 처럼 관중석 무늬가 복잡한 화면에서는 가짜 원이 쉽게 생기므로, 단순한 배경에서 실험하면 좋습니다. 좌표를 줄여서 계산했으므로 그릴 때 <code>/ scale</code> 로 되돌리는 것을 잊지 마세요.</p>' },
      { type: 'warn', html: `<p><b>HoughCircles 에서 자주 나는 오류</b><br>① 원을 못 찾으면 <code>None</code> 이 반환됩니다 — <code>for</code> 문 전에 반드시 <code>if circles is not None:</code> 확인.<br>② 튜토리얼처럼 <code>np.uint16</code> 으로 바꾼 값을 그대로 <code>cv.circle</code> 에 넣으면 버전에 따라 타입 오류가 날 수 있습니다 — <code>int()</code> 로 변환해서 전달하세요.<br>③ 입력은 컬러가 아닌 <b>8비트 흑백</b> 이미지여야 합니다.</p>` },
      { type: 'text', html: `<h3>5. 3주차 총정리 — 영상처리 파이프라인 지도</h3>
<p>3주 동안 배운 기법들은 따로따로가 아니라 <b>순서대로 이어 붙여</b> 문제를 해결합니다. 대부분의 영상처리 프로그램은 다음 흐름을 따릅니다.</p>
<p><b>입력</b>(imread / 웹캠 process) → <b>전처리</b>(크기 조절 · 색 공간 · 블러 · 평활화) → <b>분할</b>(임계처리 · inRange · Canny) → <b>정리</b>(모폴로지) → <b>분석</b>(컨투어 특징 · 허프 · 템플릿 매칭) → <b>표시·출력</b>(그리기 · putText · imwrite)</p>
<p>새로운 문제를 만나면 “<b>무엇을 얻고 싶은가?</b>”를 먼저 정하고, 아래 표에서 해당 목적의 함수를 골라 파이프라인을 설계해 보세요.</p>` },
      { type: 'table', head: ['하고 싶은 일 (목적)', '주요 함수', '주차'], rows: [
        ['이미지·영상 읽기/보기/저장', '<code>imread</code>, <code>imshow</code>, <code>imwrite</code>, <code>VideoCapture</code>, <code>process(frame)</code>', '1'],
        ['결과 표시하기 · 사용자 입력', '<code>line</code>, <code>rectangle</code>, <code>circle</code>, <code>putText</code>, <code>setMouseCallback</code>, <code>createTrackbar</code>', '1'],
        ['일부 영역 · 채널 다루기, 합성', 'ROI 슬라이싱, <code>split</code>/<code>merge</code>, <code>addWeighted</code>, <code>bitwise_and</code>', '1'],
        ['특정 색 물체만 골라내기', '<code>cvtColor(HSV)</code>, <code>inRange</code>', '2'],
        ['크기·각도·시점 바꾸기', '<code>resize</code>, <code>warpAffine</code>, <code>getRotationMatrix2D</code>, <code>warpPerspective</code>', '2'],
        ['흑백 두 가지로 나누기(이진화)', '<code>threshold</code>(+OTSU), <code>adaptiveThreshold</code>', '2'],
        ['노이즈 줄이기 · 부드럽게', '<code>GaussianBlur</code>, <code>medianBlur</code>, <code>bilateralFilter</code>', '2'],
        ['마스크의 점 제거 · 구멍 메우기', '<code>erode</code>, <code>dilate</code>, <code>morphologyEx</code>, <code>getStructuringElement</code>', '3'],
        ['경계선(엣지) 찾기', '<code>Sobel</code>, <code>Laplacian</code>, <code>Canny</code>', '3'],
        ['여러 해상도로 처리 · 자연스러운 합성', '<code>pyrDown</code>, <code>pyrUp</code>', '3'],
        ['물체 윤곽 찾고 개수·크기·모양 분석', '<code>findContours</code>, <code>contourArea</code>, <code>moments</code>, <code>approxPolyDP</code>, <code>minAreaRect</code>', '3'],
        ['어둡거나 뿌연 이미지 대비 개선', '<code>calcHist</code>, <code>equalizeHist</code>, <code>createCLAHE</code>', '3'],
        ['정해진 모양(아이콘·부품) 위치 찾기', '<code>matchTemplate</code>, <code>minMaxLoc</code>', '3'],
        ['직선·원 찾기', '<code>HoughLines</code>, <code>HoughLinesP</code>, <code>HoughCircles</code>', '3'],
        ['속도 측정', '<code>getTickCount</code>, <code>getTickFrequency</code>', '1'],
      ] },
      { type: 'text', html: `<h3>6. 4주차 가이드 프로젝트 미리보기</h3>
<p>다음 주에는 지금까지 배운 기법을 조합해 <b>실제로 쓸 수 있는 프로그램 4개</b>를 단계별로 만들어 봅니다. 각 프로젝트에서 어떤 기법이 쓰일지 미리 생각해 보세요.</p>
<ul>
<li><b>① 문서 스캐너</b> — 비스듬히 찍은 종이를 반듯한 스캔본으로: 흑백 → 블러 → <b>Canny</b> → <b>findContours</b> → <b>approxPolyDP</b> 로 꼭짓점 4개인 가장 큰 컨투어 → 꼭짓점 정렬 → <b>warpPerspective</b> → <b>adaptiveThreshold</b> 로 스캔 효과</li>
<li><b>② 동전·도형 분석기</b> — 동전 수와 도형 종류 세기: 이진화(Otsu) → <b>모폴로지</b> → <b>컨투어 특징·속성</b>으로 분류 → <b>HoughCircles</b> 와 결과 비교</li>
<li><b>③ 웹캠 가상 페인터</b> — 색 마커로 허공에 그림 그리기: <b>HSV + inRange</b> → 모폴로지 → 가장 큰 컨투어의 <b>무게중심(moments)</b> → 캔버스에 선 그리기 → 영상과 합성</li>
<li><b>④ 사진 필터 앱</b> — 카툰 · 연필 스케치 · 비네팅: <b>medianBlur/bilateral</b> + <b>adaptiveThreshold/Canny</b> 윤곽, 그래디언트·블러를 이용한 스케치, 가우시안 마스크 비네팅, <b>트랙바</b>로 강도 조절</li>
</ul>` },
      { type: 'checklist', title: '3주차 자기 점검', items: [
        '열기와 닫기를 목적에 맞게 골라 마스크를 청소할 수 있다',
        'Sobel 결과를 CV_64F 로 계산하고 convertScaleAbs 로 표시할 수 있다',
        'Canny 의 두 임계값이 결과에 주는 영향을 설명할 수 있다',
        'findContours 로 물체 개수를 세고 면적·무게중심을 구할 수 있다',
        'approxPolyDP 와 속성 값으로 도형을 분류할 수 있다',
        '컬러 이미지를 밝기 채널만 평활화(또는 CLAHE)할 수 있다',
        '템플릿 매칭으로 여러 객체를 찾고 한계를 설명할 수 있다',
        'HoughLinesP / HoughCircles 파라미터를 조절해 원하는 선·원을 찾을 수 있다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 스도쿠 격자에서 가로선과 세로선 나누기',
        desc: `<p>HoughLinesP 로 찾은 선분을 기울기 각도로 분류해 <b>가로선(|각도| &lt; 20°)은 빨강</b>, <b>세로선(|각도| &gt; 70°)은 파랑</b>으로 그리고, 각각의 개수를 출력하세요. 각도는 <code>np.degrees(np.arctan2(y2 - y1, x2 - x1))</code> 로 구합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
edges = cv.Canny(gray, 50, 150, apertureSize=3)
lines = cv.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)

horizontal, vertical = 0, 0
if lines is not None:
    for x1, y1, x2, y2 in lines[:, 0]:
        # TODO 1: 각도를 계산하기
        angle = 0.0
        # TODO 2: 각도에 따라 빨강(가로) / 파랑(세로) 로 그리고 개수 세기 (그 외는 회색)
        cv.line(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

print('가로선:', horizontal, ' 세로선:', vertical)
cv.imshow('classified lines', img)
`,
        hint: `<p><code>angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))</code> 후 <code>a = abs(angle)</code>. arctan2 는 −180~180° 를 주므로 왼쪽을 향한 가로선은 180° 근처가 됩니다. <code>a &lt; 20 or a &gt; 160</code> 이면 가로, <code>70 &lt; a &lt; 110</code> 이면 세로로 판단하세요. 좌표를 int 로 바꿔야 음수 뺄셈이 안전합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
edges = cv.Canny(gray, 50, 150, apertureSize=3)
lines = cv.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)

horizontal, vertical = 0, 0
if lines is not None:
    for x1, y1, x2, y2 in lines[:, 0].astype(int):
        angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        a = abs(angle)
        if a < 20 or a > 160:
            color = (0, 0, 255)          # 가로선: 빨강
            horizontal += 1
        elif 70 < a < 110:
            color = (255, 0, 0)          # 세로선: 파랑
            vertical += 1
        else:
            color = (128, 128, 128)      # 비스듬한 선: 회색
        cv.line(img, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)

print('가로선:', horizontal, ' 세로선:', vertical)
cv.imshow('classified lines', img)
`,
      },
      {
        title: '실습 2 · 캔디 색깔별로 세기',
        desc: `<p><code>smarties.png</code> 에서 HoughCircles 로 캔디를 찾은 뒤, 각 원의 중심 주변(작은 사각형)의 <b>HSV 값</b>으로 색 이름을 정해 원 옆에 쓰고, 색깔별 개수를 출력하세요. (빨강 H&lt;4 또는 H≥170, 주황 4~21, 초록 35~85, 파랑 90~130, 갈색은 V&lt;100)</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('smarties.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 5)
circles = cv.HoughCircles(gray, cv.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=15, maxRadius=40)

def color_name(h, s, v):
    # TODO 1: 문제 설명의 규칙대로 'brown', 'red', 'orange', 'green', 'blue', 'other' 반환
    return 'other'

counts = {}
vis = img.copy()
if circles is not None:
    for x, y, r in np.around(circles[0]).astype(int):
        # TODO 2: 중심 주변 (반지름의 절반 크기) 영역의 H, S, V 중앙값 구하기
        h, s, v = 0, 0, 0
        name = color_name(h, s, v)
        counts[name] = counts.get(name, 0) + 1
        cv.circle(vis, (int(x), int(y)), int(r), (0, 0, 0), 2)
        cv.putText(vis, name, (int(x) - 20, int(y) + 5), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 2)
print(counts)
cv.imshow('candy colors', vis)
`,
        hint: `<p>영역은 <code>patch = hsv[y - r // 2 : y + r // 2, x - r // 2 : x + r // 2]</code> (음수가 되지 않게 <code>max(0, …)</code>). 중앙값은 <code>np.median(patch[:, :, 0])</code> 처럼 채널별로. 빨강은 색상환 양 끝(0 과 179 근처)에 걸쳐 있어서 평균 대신 <b>중앙값</b>을 쓰는 것이 안전합니다.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('smarties.png')
hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 5)
circles = cv.HoughCircles(gray, cv.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=15, maxRadius=40)

def color_name(h, s, v):
    if v < 100:
        return 'brown'
    if h < 4 or h >= 170:
        return 'red'
    if h < 22:
        return 'orange'
    if 35 <= h <= 85:
        return 'green'
    if 90 <= h <= 130:
        return 'blue'
    return 'other'

counts = {}
vis = img.copy()
if circles is not None:
    for x, y, r in np.around(circles[0]).astype(int):
        half = r // 2
        patch = hsv[max(0, y - half):y + half, max(0, x - half):x + half]
        h = np.median(patch[:, :, 0])
        s = np.median(patch[:, :, 1])
        v = np.median(patch[:, :, 2])
        name = color_name(h, s, v)
        counts[name] = counts.get(name, 0) + 1
        cv.circle(vis, (int(x), int(y)), int(r), (0, 0, 0), 2)
        cv.putText(vis, name, (int(x) - 20, int(y) + 5), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 2)
        print('중심 (%3d,%3d) H=%5.1f S=%5.1f V=%5.1f → %s' % (x, y, h, s, v, name))
print(counts)
cv.imshow('candy colors', vis)
`,
      },
      {
        title: '실습 3 · (종합) 동전 개수를 두 가지 방법으로 세고 비교하기',
        desc: `<p><code>water_coins.jpg</code> 의 동전(24개)을 <b>방법 A: 이진화 → 모폴로지 → 컨투어</b>(1교시 예제 5), <b>방법 B: HoughCircles</b> 두 가지로 세어 결과를 나란히 보여 주세요. 방법 B 는 동전 반지름(약 20~28px)과 minDist 를 조절해 24개에 가깝게 만들어 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# 방법 A: 이진화 → 열기/닫기 → 강한 침식 → 외곽 컨투어 개수
_, mask = cv.threshold(gray, 120, 255, cv.THRESH_BINARY_INV)
k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
mask = cv.morphologyEx(mask, cv.MORPH_OPEN, k, iterations=2)
mask = cv.morphologyEx(mask, cv.MORPH_CLOSE, k, iterations=2)
# TODO 1: 침식 반복 횟수를 조절해 붙은 동전 떼어 놓기 (지금은 1회)
sep = cv.erode(mask, k, iterations=1)
contours, _ = cv.findContours(sep, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
count_a = len(contours)

# 방법 B: HoughCircles
blur = cv.medianBlur(gray, 5)
# TODO 2: dp, minDist, param2, minRadius, maxRadius 를 조절하기
circles = cv.HoughCircles(blur, cv.HOUGH_GRADIENT, 1, 10, param1=50, param2=20, minRadius=0, maxRadius=0)
count_b = 0 if circles is None else circles.shape[1]

vis_a = img.copy()
cv.drawContours(vis_a, contours, -1, (0, 0, 255), 2)
vis_b = img.copy()
if circles is not None:
    for x, y, r in np.around(circles[0]).astype(int):
        cv.circle(vis_b, (int(x), int(y)), int(r), (0, 255, 0), 2)
print('방법 A (컨투어):', count_a, '개 / 방법 B (허프 원):', count_b, '개 / 실제: 24개')
cv.imshow('A contours | B hough', np.hstack((vis_a, vis_b)))
`,
        hint: `<p>방법 A 는 1교시 예제 5처럼 iterations=14 부근. 방법 B 는 동전 지름이 약 45px 이므로 <code>minDist</code> 는 35 정도, <code>minRadius=18, maxRadius=30</code>, <code>dp=1.2, param2=25</code> 부터 시작해 보세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# 방법 A: 이진화 → 열기/닫기 → 강한 침식 → 외곽 컨투어 개수
_, mask = cv.threshold(gray, 120, 255, cv.THRESH_BINARY_INV)
k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
mask = cv.morphologyEx(mask, cv.MORPH_OPEN, k, iterations=2)
mask = cv.morphologyEx(mask, cv.MORPH_CLOSE, k, iterations=2)
sep = cv.erode(mask, k, iterations=14)
contours, _ = cv.findContours(sep, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
count_a = len(contours)

# 방법 B: HoughCircles — 동전 크기에 맞춘 파라미터
blur = cv.medianBlur(gray, 5)
circles = cv.HoughCircles(blur, cv.HOUGH_GRADIENT, 1.2, 35, param1=50, param2=25, minRadius=18, maxRadius=30)
count_b = 0 if circles is None else circles.shape[1]

vis_a = img.copy()
cv.drawContours(vis_a, contours, -1, (0, 0, 255), 2)
vis_b = img.copy()
if circles is not None:
    for x, y, r in np.around(circles[0]).astype(int):
        cv.circle(vis_b, (int(x), int(y)), int(r), (0, 255, 0), 2)
print('방법 A (컨투어):', count_a, '개 / 방법 B (허프 원):', count_b, '개 / 실제: 24개')
cv.imshow('A contours | B hough', np.hstack((vis_a, vis_b)))
`,
      },
    ],
    quiz: [
      { q: "허프 직선 변환에서 직선을 ρ = x·cosθ + y·sinθ 로 표현하는 가장 큰 이유는?", options: ["계산 결과가 항상 정수이기 때문","y = mx + c 로는 세로선의 기울기가 무한대가 되어 표현하기 어렵기 때문","컬러 이미지를 처리하기 위해","선분의 끝점을 바로 얻기 위해"], answer: 1, explain: "(ρ, θ) 표현은 세로선(θ=0°)을 포함한 모든 방향의 직선을 유한한 값으로 나타낼 수 있습니다." },
      { q: "cv.HoughLinesP 가 cv.HoughLines 와 다른 점으로 옳은 것은?", options: ["원도 함께 찾는다","입력으로 컬러 이미지를 받는다","threshold 인자가 없다","무작위 일부 점만 투표해 더 빠르고, 선분의 두 끝점 (x1, y1, x2, y2) 를 반환한다"], answer: 3, explain: "HoughLines 는 무한 직선의 (ρ, θ) 를, HoughLinesP 는 선분의 끝점을 돌려주며 minLineLength, maxLineGap 으로 다듬을 수 있습니다." },
      { q: "HoughCircles 에서 가짜 원이 너무 많이 검출될 때 가장 먼저 시도할 조치는?", options: ["param2 를 낮춘다","minDist 를 1 로 줄인다","param2 를 높이고, 알고 있다면 minRadius/maxRadius 를 지정한다","medianBlur 를 제거한다"], answer: 2, explain: "param2 는 중심 투표 임계값으로, 높일수록 확실한 원만 남습니다. 반지름 범위 지정도 가짜 원을 크게 줄입니다." },
      { q: "웹캠 영상에서 “노란 공의 위치를 추적”하려고 합니다. 가장 알맞은 파이프라인은?", options: ["Canny → HoughLines → equalizeHist","calcHist → matchTemplate → pyrUp","Laplacian → threshold → warpPerspective","HSV 변환 → inRange → 모폴로지 열기 → findContours → 가장 큰 컨투어의 moments 로 무게중심"], answer: 3, explain: "색으로 분리(inRange) → 노이즈 청소(모폴로지) → 물체 윤곽(컨투어) → 위치(무게중심) 순서가 색 물체 추적의 전형적인 파이프라인입니다. 4주차 가상 페인터가 바로 이 구조입니다." },
      { q: "비스듬히 찍힌 문서 사진을 반듯하게 펴는 문서 스캐너에서, 문서의 네 꼭짓점을 찾는 단계에 필요한 조합은?", options: ["Canny + findContours + approxPolyDP(꼭짓점 4개인 가장 큰 컨투어)","equalizeHist + HoughCircles","medianBlur + matchTemplate","pyrDown + calcHist"], answer: 0, explain: "엣지를 찾고, 컨투어를 근사해 꼭짓점이 4개인 가장 큰 도형을 문서로 보고, 그 네 점으로 원근 변환(warpPerspective)을 합니다." },
    ],
  },
]);
