/* 1주차: OpenCV 입문 · GUI · 코어 연산 */
COURSE.addLessons([
  /* =====================================================================
   * w1-1 과정 소개와 웹 실습 환경
   * ===================================================================== */
  {
    id: 'w1-1',
    summary: 'OpenCV가 무엇인지 알아보고, 5주 과정의 흐름과 웹 실습 환경 사용법을 익힙니다. OpenCV에 꼭 필요한 Python·NumPy 기초를 복습하고 “이미지는 숫자 배열”이라는 핵심 개념을 직접 확인합니다.',
    goals: [
      'OpenCV와 OpenCV-Python(cv2)이 무엇인지 설명할 수 있다',
      '웹 실습 환경에서 코드를 실행하고 결과 패널·콘솔·입력 소스를 사용할 수 있다',
      'NumPy 배열의 shape, dtype, 슬라이싱을 사용할 수 있다',
      'np.zeros()로 검은 이미지를 만들고 일부 영역에 색을 칠해 cv.imshow()로 표시할 수 있다',
    ],
    schedule: [['오리엔테이션 · OpenCV 소개', 10], ['웹 실습 환경 둘러보기', 10], ['Python·NumPy 복습', 15], ['이미지는 배열이다', 10], ['정리·퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. OpenCV란?</h3>
<p><b>OpenCV(Open Source Computer Vision Library)</b>는 컴퓨터가 이미지와 영상을 “보고 이해”하도록 돕는 오픈소스 라이브러리입니다.
1999년 인텔(Intel)의 Gary Bradski가 시작했고, 지금은 전 세계 개발자들이 함께 만들고 있습니다. 2,500개가 넘는 알고리즘이 들어 있어
사진 보정 앱, 공장 불량 검사, 자율주행, 의료 영상, 증강현실(AR) 등 거의 모든 영상 분야에서 쓰입니다.</p>
<p>OpenCV 본체는 속도가 빠른 <b>C++</b>로 작성되어 있고, 우리가 사용할 <b>OpenCV-Python</b>은 이 C++ 코드를 Python에서 부를 수 있게 감싼(wrapper) 것입니다.
그래서 <b>“문법은 쉬운 Python, 속도는 빠른 C++”</b> 이라는 두 장점을 모두 누릴 수 있습니다.</p>
<p>또 하나 중요한 점: OpenCV-Python은 이미지를 <b>NumPy 배열</b>로 주고받습니다. 그래서 NumPy를 조금만 알면 이미지를 자유자재로 다룰 수 있고,
Matplotlib·SciPy 같은 다른 Python 라이브러리와도 쉽게 함께 쓸 수 있습니다. 코드에서는 보통 <code>import cv2 as cv</code> 로 불러옵니다.</p>` },
      { type: 'table', head: ['분야', 'OpenCV로 할 수 있는 일 (예)', '이 과정에서 배우는 시기'],
        rows: [
          ['이미지 입출력·GUI', '이미지/영상 읽기·저장, 창 띄우기, 마우스·트랙바', '1주차'],
          ['코어 연산', '픽셀 접근, 관심 영역(ROI), 채널, 산술·비트 연산', '1주차'],
          ['이미지 가공', '색 공간 변환, 크기·회전 변환, 임계처리, 블러', '2주차'],
          ['구조 찾기', '엣지, 컨투어(윤곽선), 히스토그램, 템플릿 매칭, 허프 변환', '3주차'],
          ['응용', '문서 스캐너, 동전 세기, 웹캠 페인터, 사진 필터 앱', '4~5주차 프로젝트'],
        ] },
      { type: 'text', html: `<h3>2. 5주 과정 로드맵</h3>
<p>이 과정은 <b>5주 × 8교시(교시당 50분)</b>로 구성되어 있습니다. 앞의 3주는 OpenCV.org 공식 튜토리얼을 따라 기능을 하나씩 배우고,
뒤의 2주는 배운 기능을 조합해 실제로 동작하는 프로그램을 만듭니다.</p>
<ul>
<li><b>1주차 · OpenCV 입문 · GUI · 코어 연산</b> — 실습 환경, 이미지/비디오 입출력, 그리기, 마우스·트랙바, 픽셀 연산</li>
<li><b>2주차 · Image Processing Ⅰ</b> — 색 공간, 기하학적 변환, 임계처리, 스무딩</li>
<li><b>3주차 · Image Processing Ⅱ</b> — 모폴로지, 엣지, 컨투어, 히스토그램, 템플릿 매칭, 허프 변환</li>
<li><b>4주차 · 프로젝트 Ⅰ</b> — 가이드 프로젝트 4개 따라 만들기, 팀 프로젝트 기획</li>
<li><b>5주차 · 프로젝트 Ⅱ</b> — 팀 프로젝트 구현·튜닝, 발표와 회고</li>
</ul>
<p>매 교시는 <b>개념 설명 → 예제 실행 → 실습 과제 → 퀴즈</b> 순서로 진행됩니다. 예제는 “읽기만” 하지 말고 숫자를 바꿔 가며 여러 번 실행해 보세요. 직접 바꿔 본 만큼 기억에 남습니다.</p>` },
      { type: 'text', html: `<h3>3. 웹 실습 환경 사용법</h3>
<p>이 강좌는 설치 없이 <b>브라우저 안에서 Python과 OpenCV</b>가 돌아갑니다(Pyodide라는 기술로 Python을 웹에서 실행). 화면은 세 부분으로 나뉩니다.</p>
<ul>
<li><b>왼쪽 · 내비게이션</b>: 주차/교시 목록, 학습 진도, 검색창(예: “Canny”로 교시 찾기)</li>
<li><b>가운데 · 강의 내용 + 코드 에디터</b>: 위쪽은 설명과 예제, 아래쪽은 코드를 직접 고쳐 실행하는 에디터입니다.</li>
<li><b>오른쪽 · 실행 결과</b>: 입력 소스 선택(이미지 · 🎞️ 동영상 · 📷 웹캠), 동영상 재생 컨트롤, 트랙바(슬라이더), <code>cv.imshow()</code> 로 띄운 이미지 창, 콘솔(<code>print</code> 출력과 오류 메시지)</li>
</ul>
<p>웹캠이 없어도 괜찮습니다. 웹캠으로 하는 실습은 입력 소스를 <b>🎞️ 동영상</b>으로 골라도 똑같이 할 수 있습니다.</p>
<p>처음 페이지를 열면 오른쪽 위에 “Python 준비 중…”이 표시됩니다. 준비가 끝나면 <b>▶ 실행</b> 버튼이 활성화됩니다. 첫 로딩은 수십 초 걸릴 수 있어요.</p>` },
      { type: 'table', head: ['버튼 / 기능', '하는 일'],
        rows: [
          ['<b>▶ 실행</b> 또는 <kbd>Ctrl</kbd>+<kbd>Enter</kbd>', '에디터의 코드를 실행합니다.'],
          ['<b>■ 정지</b>', '동영상·웹캠으로 실시간 처리(<code>process</code>) 중일 때 멈춥니다.'],
          ['<b>↺ 초기화</b> / <b>⧉ 복사</b>', '에디터 코드를 기본 예제로 되돌리기 / 코드 복사'],
          ['<b>입력 소스</b> 선택 상자', '샘플 이미지, 🎞️ 샘플 동영상(vtest 등), 업로드한 파일, 📷 웹캠 중 무엇을 입력으로 쓸지 고릅니다. 동영상은 아래의 재생/일시정지/탐색 막대로 조작합니다.'],
          ['<b>📷 웹캠 켜기</b> / <b>📸 스냅샷</b>', '웹캠을 켭니다(브라우저가 권한을 물어봄) / 현재 화면을 <code>webcam.png</code> 로 저장'],
          ['<b>⬆ 업로드</b>', '내 컴퓨터의 이미지나 동영상(mp4/webm)을 실습 환경에 추가합니다. 이미지는 <code>cv.imread(\'파일이름\')</code>, 동영상은 <code>cv.VideoCapture(\'파일이름\')</code> 으로 엽니다.'],
          ['<b>콘솔</b>', '<code>print()</code> 결과, 오류 메시지, <code>cv.imwrite()</code> 로 저장한 파일의 다운로드 링크가 표시됩니다.'],
        ] },
      { type: 'code', title: '예제 1 · 첫 실행: 버전 확인하기', code: String.raw`
import cv2 as cv
import numpy as np

# print() 결과는 오른쪽 아래 '콘솔'에 나타납니다
print('안녕하세요, OpenCV!')
print('OpenCV 버전:', cv.__version__)
print('NumPy 버전:', np.__version__)
`, desc: '<p>▶ 실행(또는 <kbd>Ctrl</kbd>+<kbd>Enter</kbd>)을 눌러 콘솔에 버전이 찍히는지 확인하세요. 이것이 “환경이 잘 동작한다”는 첫 신호입니다.</p>' },
      { type: 'text', html: `<h3>4. OpenCV에 필요한 Python 기초 복습</h3>
<p>OpenCV 코드를 읽으려면 다음 정도의 Python 문법이면 충분합니다.</p>
<ul>
<li><b>리스트(list)</b> <code>[1, 2, 3]</code>: 값을 바꿀 수 있는 목록. <b>튜플(tuple)</b> <code>(10, 20)</code>: 바꿀 수 없는 묶음 — OpenCV에서 <b>좌표 (x, y)</b>와 <b>색 (B, G, R)</b>은 주로 튜플로 씁니다.</li>
<li><b>함수</b> <code>def 이름(인자):</code> — 나중에 마우스·트랙바·<code>process(frame)</code> 모두 “함수를 만들어 OpenCV에 넘기는” 방식이라 꼭 필요합니다.</li>
<li><b>여러 값 돌려받기</b> <code>ret, frame = cap.read()</code> — 함수가 튜플을 돌려주면 변수 여러 개로 한 번에 나눠 받을 수 있습니다.</li>
<li><b>import ... as ...</b> — <code>import cv2 as cv</code>, <code>import numpy as np</code> 처럼 짧은 별명을 붙입니다.</li>
</ul>` },
      { type: 'code', title: '예제 2 · 리스트 · 튜플 · 함수 복습', code: String.raw`
# 리스트: 값을 추가/변경할 수 있음
scores = [80, 95, 70]
scores.append(100)
print('scores =', scores, '길이:', len(scores))

# 튜플: OpenCV에서 좌표와 색을 표현할 때 자주 사용
point = (100, 50)          # (x, y)
blue = (255, 0, 0)         # (B, G, R) 순서! 파랑이 맨 앞
x, y = point               # 튜플 풀기(unpacking)
print('x =', x, ', y =', y)

# 함수: 입력을 받아 결과를 돌려줌
def average(values):
    return sum(values) / len(values)

print('평균 점수:', average(scores))

# 여러 값을 한 번에 돌려주는 함수 (cap.read() 가 이런 모양)
def min_max(values):
    return min(values), max(values)

lo, hi = min_max(scores)
print('최소', lo, '최대', hi)

# for 문과 range
for i in range(3):
    print(i, '번째 반복')
` },
      { type: 'text', html: `<h3>5. NumPy 기초: 배열(ndarray)</h3>
<p><b>NumPy</b>는 숫자 데이터를 “표(행렬)” 모양으로 빠르게 계산하는 라이브러리입니다. 꼭 알아야 할 속성은 세 가지입니다.</p>
<ul>
<li><code>arr.shape</code> — 배열의 모양. 예) <code>(3, 4)</code> 는 3행 4열</li>
<li><code>arr.dtype</code> — 원소의 자료형. 이미지는 대부분 <code>uint8</code>(부호 없는 8비트 정수, <b>0~255</b>)</li>
<li><b>슬라이싱</b> <code>arr[행 시작:행 끝, 열 시작:열 끝]</code> — 끝 번호는 <b>포함하지 않습니다</b>. <code>arr[0:2, 1:3]</code> 은 0~1행, 1~2열</li>
</ul>
<p>또한 NumPy는 <b>반복문 없이 배열 전체를 한 번에 계산</b>합니다(벡터화). <code>arr * 2</code> 는 모든 원소에 2를 곱합니다. 이미지 처리에서 파이썬 for 문 대신 NumPy/OpenCV 함수를 써야 하는 이유가 바로 이 속도 차이입니다.</p>` },
      { type: 'code', title: '예제 3 · NumPy 배열의 shape · dtype', code: String.raw`
import numpy as np

a = np.array([1, 2, 3, 4])
print('a =', a, 'shape:', a.shape, 'dtype:', a.dtype)

# 2차원 배열 = 표 (행, 열)
b = np.array([[1, 2, 3],
              [4, 5, 6]])
print('b.shape =', b.shape)        # (2, 3) → 2행 3열
print('b[1, 2] =', b[1, 2])        # 1행 2열 → 6

# 0으로 채운 배열, 자료형 지정
z = np.zeros((2, 5), dtype=np.uint8)
print(z, z.dtype)

# 벡터화 연산: 반복문 없이 전체 원소 계산
print('b * 10 =')
print(b * 10)

# uint8 은 0~255 만 담을 수 있음
u = np.array([250, 10], dtype=np.uint8)
print('uint8 최소/최대:', np.iinfo(np.uint8).min, np.iinfo(np.uint8).max)
print('u =', u)
` },
      { type: 'code', title: '예제 4 · 슬라이싱으로 일부분 꺼내고 바꾸기', code: String.raw`
import numpy as np

m = np.arange(1, 26).reshape(5, 5)   # 1~25 를 5x5 로
print('원본:')
print(m)

print('0~1행, 1~3열:')
print(m[0:2, 1:4])       # 끝 번호(2, 4)는 포함하지 않음

print('마지막 행:', m[-1])
print('2번 열 전체:', m[:, 2])

# 슬라이스에 값을 대입하면 그 부분만 바뀜
m[1:3, 1:3] = 0
print('가운데를 0으로:')
print(m)
` },
      { type: 'text', html: `<h3>6. 이미지는 NumPy 배열이다</h3>
<p>컴퓨터 속 이미지는 작은 점(<b>픽셀, pixel</b>)들이 바둑판처럼 모인 것이고, 각 픽셀은 밝기를 나타내는 숫자입니다. OpenCV는 이것을 그대로 NumPy 배열로 표현합니다.</p>
<ul>
<li><b>흑백(그레이스케일) 이미지</b>: shape = <code>(높이, 너비)</code>, 0=검정 ~ 255=흰색</li>
<li><b>컬러 이미지</b>: shape = <code>(높이, 너비, 3)</code>, 마지막 축은 <b>B, G, R</b> 순서의 채널 (OpenCV는 RGB가 아니라 <b>BGR</b>!)</li>
</ul>
<p>그래서 “검은 이미지 만들기”는 <code>np.zeros((높이, 너비, 3), np.uint8)</code> 한 줄이고, “사각형 영역을 빨갛게 칠하기”는 슬라이싱에 <code>(0, 0, 255)</code> 를 대입하는 것뿐입니다.</p>` },
      { type: 'code', title: '예제 5 · 검은 캔버스에 색칠하기', code: String.raw`
import cv2 as cv
import numpy as np

# 높이 300, 너비 400, 3채널(BGR) 검은 이미지
img = np.zeros((300, 400, 3), dtype=np.uint8)
print('shape:', img.shape, 'dtype:', img.dtype)

# 배열[행(y) 범위, 열(x) 범위] = (B, G, R)
img[50:150, 50:200] = (0, 0, 255)      # 빨강 (R 이 마지막)
img[100:250, 150:300] = (0, 255, 0)    # 초록 (겹친 부분은 덮어씀)
img[200:280, 300:390] = (255, 0, 0)    # 파랑
img[:, 395:] = (255, 255, 255)         # 오른쪽 끝 5픽셀 세로줄은 흰색

cv.imshow('canvas', img)   # 오른쪽 결과 패널에 표시
`, desc: '<p>결과 창 위에 마우스를 올리면 좌표와 픽셀값(B, G, R)이 표시됩니다. 빨간 영역 위에서 값이 <code>(0, 0, 255)</code> 인지 확인해 보세요.</p>' },
      { type: 'warn', html: `<p><b>좌표 순서 주의!</b> NumPy 인덱싱은 <code>img[y, x]</code> (행 → 열) 순서이고, 뒤에서 배울 OpenCV 그리기 함수의 좌표는 <code>(x, y)</code> 순서입니다.
또 shape 는 <code>(높이, 너비)</code> 순서입니다. 초보자가 가장 많이 헷갈리는 부분이니 “배열은 행부터, 좌표는 x부터”로 기억하세요.</p>` },
      { type: 'code', title: '예제 6 · 사진도 배열이다 (샘플 이미지 / 내 입력)', code: String.raw`
import cv2 as cv
import webcv   # 웹 실습 환경 전용 도우미 모듈

img = cv.imread('messi5.jpg')    # 샘플 이미지 읽기
print('messi5.jpg shape:', img.shape)   # (높이, 너비, 채널)
print('왼쪽 위 픽셀 (B,G,R):', img[0, 0])

# 슬라이싱으로 일부분 잘라서 보여주기 (행 100~300, 열 200~400)
part = img[100:300, 200:400]
cv.imshow('original', img)
cv.imshow('part', part)

# 오른쪽 패널 '입력 소스'에서 고른 이미지(또는 웹캠 프레임) 가져오기
my = webcv.get_input()
print('현재 입력 소스 shape:', my.shape)
cv.imshow('my input', my)
`, desc: '<p>오른쪽 패널에서 입력 소스를 다른 샘플이나 업로드한 사진으로 바꾼 뒤 다시 실행해 보세요. <code>webcv.get_input()</code> 은 이 웹 환경에만 있는 함수입니다.</p>' },
      { type: 'text', html: `<h3>7. (참고) 내 PC에 OpenCV-Python 설치하기</h3>
<p>과정이 끝난 뒤 내 컴퓨터에서 계속 공부하고 싶다면 다음 순서로 설치합니다. 공식 튜토리얼 “Install OpenCV-Python in Windows”의 요약입니다.</p>
<ol>
<li><b>python.org</b>에서 Python 3을 설치합니다(설치 시 “Add Python to PATH” 체크).</li>
<li>명령 프롬프트(cmd)나 터미널에서 <code>pip install opencv-python</code> 을 실행합니다. NumPy도 함께 설치됩니다.</li>
<li>그래프를 그리려면 <code>pip install matplotlib</code> 도 설치합니다.</li>
<li>Python에서 <code>import cv2</code> 후 <code>print(cv2.__version__)</code> 이 나오면 성공!</li>
</ol>
<p>데스크톱에서는 <code>cv.imshow()</code> 가 별도의 창을 띄우고, <code>cv.waitKey()</code> 로 키 입력을 기다리는 점이 웹 환경과 다릅니다. 이 차이는 다음 교시부터 자세히 비교합니다.</p>` },
      { type: 'code', title: '설치 명령 (내 PC의 터미널에서 실행 · 여기서는 실행 안 됨)', norun: true, code: String.raw`
# Windows 명령 프롬프트 / macOS·Linux 터미널에서
pip install opencv-python        # OpenCV 기본 모듈 (+ numpy 자동 설치)
pip install matplotlib           # 그래프·이미지 표시용

# 설치 확인 (python 실행 후)
python -c "import cv2; print(cv2.__version__)"
` },
      { type: 'tip', html: `<p><b>오류가 나도 괜찮습니다.</b> 콘솔의 빨간 오류 메시지는 맨 <b>마지막 줄</b>부터 읽으세요. <code>NameError</code>(이름 오타), <code>IndentationError</code>(들여쓰기), <code>SyntaxError</code>(괄호·따옴표 빠짐)가 초보자 오류의 대부분입니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 삼색 국기 만들기',
        desc: `<p>높이 200, 너비 300인 검은 이미지를 만들고, 세로로 3등분하여 <b>왼쪽 파랑 · 가운데 흰색 · 오른쪽 빨강</b>(프랑스 국기)을 칠해 <code>flag</code> 창에 표시하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

flag = np.zeros((200, 300, 3), dtype=np.uint8)

# TODO: 왼쪽 1/3 (열 0~99) 을 파랑으로
# flag[:, 0:100] = ...

# TODO: 가운데 1/3 (열 100~199) 을 흰색으로

# TODO: 오른쪽 1/3 (열 200~299) 을 빨강으로

cv.imshow('flag', flag)
print('flag shape:', flag.shape)
`,
        hint: `<p>모든 행을 뜻하는 <code>:</code> 과 열 범위를 함께 씁니다. 색은 <b>(B, G, R)</b> 순서이므로 파랑은 <code>(255, 0, 0)</code>, 빨강은 <code>(0, 0, 255)</code>, 흰색은 <code>(255, 255, 255)</code> 입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

flag = np.zeros((200, 300, 3), dtype=np.uint8)

flag[:, 0:100] = (255, 0, 0)        # 파랑
flag[:, 100:200] = (255, 255, 255)  # 흰색
flag[:, 200:300] = (0, 0, 255)      # 빨강

cv.imshow('flag', flag)
print('flag shape:', flag.shape)
`,
      },
      {
        title: '실습 2 · 그라데이션 이미지 만들기',
        desc: `<p>너비 256, 높이 100인 <b>흑백</b> 이미지에서 왼쪽(0)에서 오른쪽(255)으로 점점 밝아지는 그라데이션을 만드세요. 각 열의 밝기 = 열 번호입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

grad = np.zeros((100, 256), dtype=np.uint8)   # 흑백 이미지 (높이, 너비)

# TODO: 0, 1, 2, ..., 255 를 담은 1차원 배열 만들기
row = np.zeros(256, dtype=np.uint8)   # ← np.arange(256) 을 이용해 바꾸세요

# TODO: 모든 행에 row 를 대입 (grad[:, :] = row)

cv.imshow('gradient', grad)
print('가운데 픽셀 값:', grad[50, 128])
`,
        hint: `<p><code>np.arange(256, dtype=np.uint8)</code> 는 0~255 배열입니다. <code>grad[:, :] = row</code> 처럼 1차원 배열을 2차원 배열에 대입하면 NumPy가 모든 행에 자동으로 복사해 줍니다(브로드캐스팅).</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

grad = np.zeros((100, 256), dtype=np.uint8)

row = np.arange(256, dtype=np.uint8)   # 0 ~ 255
grad[:, :] = row                       # 브로드캐스팅으로 모든 행에 복사

cv.imshow('gradient', grad)
print('가운데 픽셀 값:', grad[50, 128])   # 128
`,
      },
      {
        title: '실습 3 · 사진에 액자 칠하기',
        desc: `<p><code>messi5.jpg</code> 를 읽어 <b>위·아래·왼쪽·오른쪽 가장자리 20픽셀</b>을 노란색 <code>(0, 255, 255)</code> 으로 칠해 액자처럼 만들고, 이미지 크기를 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
yellow = (0, 255, 255)

# TODO: 위쪽 20줄
# img[0:20, :] = yellow

# TODO: 아래쪽 20줄 (음수 인덱스 -20 활용)

# TODO: 왼쪽 20열, 오른쪽 20열

cv.imshow('frame', img)
print('높이, 너비, 채널 =', img.shape)
`,
        hint: `<p>아래쪽은 <code>img[-20:, :]</code>, 왼쪽은 <code>img[:, :20]</code>, 오른쪽은 <code>img[:, -20:]</code> 입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('messi5.jpg')
yellow = (0, 255, 255)

img[0:20, :] = yellow     # 위
img[-20:, :] = yellow     # 아래
img[:, :20] = yellow      # 왼쪽
img[:, -20:] = yellow     # 오른쪽

cv.imshow('frame', img)
print('높이, 너비, 채널 =', img.shape)
`,
      },
    ],
    quiz: [
      { q: 'OpenCV-Python에서 이미지는 어떤 형태로 다뤄지나요?', options: ['Python 리스트', 'NumPy 배열(ndarray)', '문자열', 'PIL Image 객체'], answer: 1, explain: 'cv.imread() 등 OpenCV-Python 함수는 이미지를 NumPy 배열로 주고받습니다. 그래서 NumPy 문법으로 픽셀을 다룰 수 있습니다.' },
      { q: 'img = np.zeros((300, 400, 3), np.uint8) 로 만든 이미지의 너비(가로 픽셀 수)는?', options: ['300', '400', '3', '1200'], answer: 1, explain: 'shape 는 (높이, 너비, 채널) 순서입니다. 높이 300, 너비 400, 3채널입니다.' },
      { q: 'OpenCV 컬러 이미지에서 (0, 0, 255) 는 어떤 색인가요?', options: ['파랑', '초록', '빨강', '흰색'], answer: 2, explain: 'OpenCV는 BGR 순서를 사용합니다. 마지막 값이 R(빨강)이므로 (0, 0, 255) 는 빨강입니다.' },
      { q: 'uint8 자료형이 담을 수 있는 값의 범위는?', options: ['-128 ~ 127', '0 ~ 255', '0 ~ 1', '0 ~ 65535'], answer: 1, explain: 'uint8 은 부호 없는 8비트 정수로 0~255 를 표현합니다. 대부분의 이미지 픽셀이 이 자료형입니다.' },
      { q: '웹 실습 환경에서 코드를 실행하는 단축키는?', options: ['Ctrl+S', 'Ctrl+Enter', 'F5', 'Shift+Tab'], answer: 1, explain: '▶ 실행 버튼 또는 Ctrl+Enter 로 에디터의 코드를 실행합니다.' },
    ],
  },

  /* =====================================================================
   * w1-2 이미지 읽기 · 표시 · 저장
   * ===================================================================== */
  {
    id: 'w1-2',
    summary: '이미지를 파일에서 읽고(imread), 화면에 보여주고(imshow), 파일로 저장하는(imwrite) 가장 기본적인 흐름을 익힙니다. Matplotlib로 표시할 때 생기는 BGR/RGB 색 뒤바뀜 문제도 해결해 봅니다.',
    goals: [
      'cv.imread()의 flag(IMREAD_COLOR / GRAYSCALE / UNCHANGED) 차이를 설명할 수 있다',
      'cv.imshow(), cv.waitKey(), cv.destroyAllWindows()의 역할을 데스크톱과 웹 환경으로 나누어 설명할 수 있다',
      'cv.imwrite()로 이미지를 저장하고, 읽기 실패(None)를 확인하는 코드를 작성할 수 있다',
      'Matplotlib로 이미지를 표시할 때 BGR을 RGB로 변환할 수 있다',
    ],
    schedule: [['도입 · 튜토리얼 코드 살펴보기', 5], ['imread와 flag', 12], ['imshow · waitKey · imwrite', 13], ['Matplotlib와 BGR/RGB', 10], ['실습·퀴즈', 10]],
    blocks: [
      { type: 'text', html: `<h3>1. 이미지 처리의 기본 흐름</h3>
<p>어떤 영상처리 프로그램이든 뼈대는 같습니다: <b>① 읽기 → ② 처리 → ③ 보여주기 → ④ 저장하기</b>. 이번 교시는 처리 단계를 뺀 ①, ③, ④를 확실히 익힙니다.
OpenCV.org 튜토리얼 “Getting Started with Images”는 아래 코드로 시작합니다. 한 줄씩 무슨 뜻인지 먼저 읽어 봅시다.</p>` },
      { type: 'code', title: '튜토리얼 원본 코드 (데스크톱용)', norun: true, code: String.raw`
import cv2 as cv
import sys

img = cv.imread(cv.samples.findFile("starry_night.jpg"))  # 이미지 읽기

if img is None:
    sys.exit("Could not read the image.")    # 읽기 실패 시 프로그램 종료

cv.imshow("Display window", img)             # 창에 표시
k = cv.waitKey(0)                            # 키를 누를 때까지 무한정 대기

if k == ord("s"):                            # 's' 키를 눌렀다면
    cv.imwrite("starry_night.png", img)      # PNG 파일로 저장
`, desc: '<p><code>cv.samples.findFile()</code> 은 OpenCV 샘플 폴더에서 파일을 찾아 주는 함수입니다. 웹 환경에서는 샘플 이미지가 이미 현재 폴더에 있으므로 <code>cv.imread(\'starry_night.jpg\')</code> 처럼 이름만 쓰면 됩니다.</p>' },
      { type: 'text', html: `<h3>2. cv.imread() — 이미지 읽기</h3>
<p><code>img = cv.imread(파일이름, flag)</code> 는 파일을 읽어 NumPy 배열로 돌려줍니다. 두 번째 인자 <b>flag</b> 로 “어떤 형태로 읽을지” 정합니다.</p>` },
      { type: 'table', head: ['flag', '숫자', '결과', '언제 쓰나'],
        rows: [
          ['<code>cv.IMREAD_COLOR</code>', '1', '3채널 BGR 컬러 (투명도 무시). <b>기본값</b>', '일반적인 컬러 처리'],
          ['<code>cv.IMREAD_GRAYSCALE</code>', '0', '1채널 흑백, shape = (h, w)', '엣지·임계처리 등 밝기만 필요할 때'],
          ['<code>cv.IMREAD_UNCHANGED</code>', '-1', '파일 그대로 (PNG 투명 채널 포함 → 4채널 BGRA)', '투명 배경 로고 합성'],
        ] },
      { type: 'code', title: '예제 1 · 이미지 읽고 표시하기 (웹 버전)', code: String.raw`
import cv2 as cv

img = cv.imread('starry_night.jpg')   # 기본값: IMREAD_COLOR

if img is None:
    print('이미지를 읽을 수 없습니다.')
else:
    print('크기(높이, 너비, 채널):', img.shape)
    cv.imshow('Display window', img)   # 오른쪽 결과 패널에 창(카드)으로 표시
    k = cv.waitKey(0)                  # 웹에서는 기다리지 않고 바로 -1 반환
    print('waitKey 반환값:', k)
    cv.destroyAllWindows()             # 웹에서는 아무 동작도 하지 않음
` },
      { type: 'code', title: '예제 2 · flag 에 따라 달라지는 shape 비교', code: String.raw`
import cv2 as cv

color = cv.imread('opencv-logo.png', cv.IMREAD_COLOR)
gray = cv.imread('opencv-logo.png', cv.IMREAD_GRAYSCALE)
unchanged = cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED)

print('COLOR     :', color.shape)       # (794, 600, 3)
print('GRAYSCALE :', gray.shape)        # (794, 600)  ← 채널 축이 없음
print('UNCHANGED :', unchanged.shape)   # (794, 600, 4) ← 알파(투명도) 채널 포함

# 숫자로도 쓸 수 있음: 1, 0, -1
gray2 = cv.imread('opencv-logo.png', 0)
print('flag 0 으로 읽은 shape:', gray2.shape)

cv.imshow('color', color)
cv.imshow('gray', gray)
cv.imshow('unchanged (BGRA)', unchanged)
`, desc: '<p>로고 PNG는 배경이 투명합니다. COLOR로 읽으면 투명 정보가 버려지고, 투명했던 부분의 색(여기서는 검정)만 남습니다.</p>' },
      { type: 'text', html: `<h3>3. imshow · waitKey · destroyAllWindows — 데스크톱과 웹의 차이</h3>
<p>데스크톱 OpenCV에서 <code>cv.imshow()</code> 는 새 창을 띄우지만, 창이 실제로 그려지고 키보드를 받는 일은 <code>cv.waitKey()</code> 가 호출되는 동안에만 일어납니다.
그래서 데스크톱 코드는 거의 항상 <code>imshow</code> 다음에 <code>waitKey</code> 가 짝으로 붙어 있습니다.</p>` },
      { type: 'table', head: ['함수', '데스크톱에서', '이 웹 실습 환경에서'],
        rows: [
          ['<code>cv.imshow(name, img)</code>', '이름이 name 인 창을 띄움 (같은 이름이면 내용 교체)', '오른쪽 결과 패널에 카드로 표시 (같은 이름이면 교체)'],
          ['<code>cv.waitKey(0)</code>', '키를 누를 때까지 무한 대기, 누른 키 코드 반환', '기다리지 않고 즉시 <code>-1</code> 반환'],
          ['<code>cv.waitKey(ms)</code>', 'ms 밀리초 동안 키 입력 대기 (없으면 -1)', '즉시 <code>-1</code> 반환'],
          ['<code>cv.destroyAllWindows()</code>', '열린 창을 모두 닫음', '아무 동작 안 함 (써도 무방)'],
        ] },
      { type: 'warn', html: `<p><b>파일 이름이 틀려도 imread는 오류를 내지 않습니다!</b> 대신 조용히 <code>None</code> 을 돌려줍니다. 그 상태로 <code>img.shape</code> 나 <code>cv.imshow()</code> 를 쓰면
<code>AttributeError: 'NoneType' object has no attribute 'shape'</code> 같은 엉뚱한 오류가 납니다. 이런 오류를 보면 <b>파일 이름·확장자·대소문자</b>부터 확인하세요.</p>` },
      { type: 'code', title: '예제 3 · 읽기 실패(None) 확인하기', code: String.raw`
import cv2 as cv

names = ['messi5.jpg', 'messi5.JPG', 'mesi5.jpg', 'lena.jpg']

for name in names:
    img = cv.imread(name)
    if img is None:                      # == None 보다 is None 이 올바른 비교
        print(name, '→ 읽기 실패 (None)')
    else:
        print(name, '→ 성공, shape =', img.shape)

img = cv.imread('lena.jpg')
if img is not None:
    cv.imshow('lena', img)
` },
      { type: 'text', html: `<h3>4. cv.imwrite() — 이미지 저장</h3>
<p><code>cv.imwrite(파일이름, img)</code> 는 이미지를 파일로 저장하고 성공하면 <code>True</code> 를 돌려줍니다. <b>확장자(.png, .jpg)를 보고 형식을 자동으로 결정</b>합니다.
PNG는 손실 없이(무손실) 저장되고, JPG는 용량이 작은 대신 약간의 화질 손실이 있습니다.</p>
<p>웹 환경에서는 브라우저 안의 가상 파일시스템에 저장되며, 콘솔에 <b>다운로드 링크</b>가 표시됩니다. 저장한 뒤에는 같은 이름으로 <code>cv.imread()</code> 해서 다시 읽을 수 있습니다.</p>` },
      { type: 'code', title: '예제 4 · 흑백으로 저장한 뒤 다시 읽기', code: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)

ok = cv.imwrite('messi_gray_w12.png', img)   # 콘솔에 다운로드 링크가 나타남
print('저장 성공?', ok)

again = cv.imread('messi_gray_w12.png', cv.IMREAD_UNCHANGED)
print('다시 읽은 shape:', again.shape)   # 흑백으로 저장했으므로 (342, 548)

cv.imshow('saved gray', again)
cv.waitKey(0)
cv.destroyAllWindows()
` },
      { type: 'text', html: `<h3>5. Matplotlib로 표시하기와 BGR/RGB 문제</h3>
<p><b>Matplotlib</b>는 Python의 대표 그래프 라이브러리입니다. 여러 이미지를 격자로 나란히 놓거나, 축·제목을 붙이거나, 확대해서 볼 때 편리합니다.</p>
<p>그런데 OpenCV로 읽은 컬러 이미지를 그대로 <code>plt.imshow()</code> 에 넣으면 <b>색이 이상하게</b> 나옵니다(하늘이 주황색이 되는 등).
OpenCV는 <b>BGR</b> 순서, Matplotlib는 <b>RGB</b> 순서로 해석하기 때문입니다. 해결책은 <code>cv.cvtColor(img, cv.COLOR_BGR2RGB)</code> 로 순서를 바꾸는 것입니다.
흑백 이미지는 <code>cmap='gray'</code> 를 지정해야 회색으로 보입니다.</p>` },
      { type: 'code', title: '예제 5 · Matplotlib: BGR 그대로 vs RGB 변환', code: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('fruits.jpg')                  # BGR
rgb = cv.cvtColor(img, cv.COLOR_BGR2RGB)       # RGB 로 순서 변경
gray = cv.imread('fruits.jpg', cv.IMREAD_GRAYSCALE)

plt.figure(figsize=(10, 3.5))
plt.subplot(1, 3, 1); plt.imshow(img);  plt.title('BGR as-is (wrong)')
plt.xticks([]); plt.yticks([])           # 눈금 숨기기
plt.subplot(1, 3, 2); plt.imshow(rgb);  plt.title('Converted to RGB')
plt.xticks([]); plt.yticks([])
plt.subplot(1, 3, 3); plt.imshow(gray, cmap='gray'); plt.title('Grayscale')
plt.xticks([]); plt.yticks([])
plt.show()   # 결과 패널에 그림으로 표시 (제목은 영어로!)
`, desc: '<p><code>img[:, :, ::-1]</code> (채널 축을 거꾸로 뒤집기)도 BGR→RGB 변환과 같은 결과를 냅니다.</p>' },
      { type: 'code', title: '예제 6 · 내 이미지로 해보기: 흑백 변환 후 저장', code: String.raw`
import cv2 as cv
import webcv

# 오른쪽 패널의 '입력 소스'(샘플/업로드/웹캠)를 바꿔 가며 실행해 보세요
img = webcv.get_input()
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)   # 컬러 → 흑백

print('입력 shape:', img.shape, '→ 흑백 shape:', gray.shape)
cv.imshow('input', img)
cv.imshow('gray', gray)

cv.imwrite('my_gray.jpg', gray)   # JPG 로 저장 (콘솔의 링크로 다운로드)
` },
      { type: 'tip', html: `<p><b>정리 한 줄</b>: 결과를 빠르게 보는 건 <code>cv.imshow()</code>, 여러 장을 비교하거나 발표 자료용 그림은 <b>Matplotlib</b>(단, RGB 변환!), 결과를 남기는 건 <code>cv.imwrite()</code>.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 흑백으로 저장하기',
        desc: `<p><code>lena.jpg</code> 를 <b>흑백으로 읽어</b> <code>lena_gray.png</code> 로 저장하고, 저장한 파일을 다시 읽어 shape 를 출력하고 <code>saved</code> 창에 표시하세요.</p>`,
        starter: String.raw`
import cv2 as cv

# TODO: flag 를 흑백으로 바꾸세요
img = cv.imread('lena.jpg')

# TODO: 'lena_gray.png' 로 저장하고 결과(True/False)를 출력
ok = False
print('저장 성공?', ok)

# TODO: 저장한 파일을 다시 읽기 (지금은 원본을 그대로 사용)
saved = img
print('shape:', saved.shape)
cv.imshow('saved', saved)
`,
        hint: `<p>흑백 flag 는 <code>cv.IMREAD_GRAYSCALE</code>(또는 0), 저장은 <code>ok = cv.imwrite('lena_gray.png', img)</code> 입니다. 다시 읽을 때도 <code>cv.imread('lena_gray.png', cv.IMREAD_UNCHANGED)</code> 로 읽으면 1채널 그대로 읽힙니다.</p>`,
        solution: String.raw`
import cv2 as cv

img = cv.imread('lena.jpg', cv.IMREAD_GRAYSCALE)

ok = cv.imwrite('lena_gray.png', img)
print('저장 성공?', ok)

saved = cv.imread('lena_gray.png', cv.IMREAD_UNCHANGED)
print('shape:', saved.shape)    # (512, 512)
cv.imshow('saved', saved)
`,
      },
      {
        title: '실습 2 · 원본과 흑백을 Matplotlib로 나란히 비교',
        desc: `<p><code>home.jpg</code> 를 읽어 왼쪽에는 <b>올바른 색의 원본</b>, 오른쪽에는 <b>흑백</b>을 Matplotlib 1행 2열로 표시하세요. 제목은 영어로 <code>Original</code>, <code>Gray</code>.</p>`,
        starter: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('home.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# TODO: 색이 올바르게 보이도록 BGR → RGB 변환
rgb = img

plt.subplot(1, 2, 1); plt.imshow(rgb); plt.title('Original')
# TODO: 흑백 이미지는 cmap='gray' 지정
plt.subplot(1, 2, 2); plt.imshow(gray); plt.title('Gray')
plt.show()
`,
        hint: `<p><code>rgb = cv.cvtColor(img, cv.COLOR_BGR2RGB)</code>, 흑백은 <code>plt.imshow(gray, cmap='gray')</code>. cmap 을 빼면 Matplotlib 기본 컬러맵(보라~노랑)으로 보입니다.</p>`,
        solution: String.raw`
import cv2 as cv
from matplotlib import pyplot as plt

img = cv.imread('home.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

rgb = cv.cvtColor(img, cv.COLOR_BGR2RGB)

plt.subplot(1, 2, 1); plt.imshow(rgb); plt.title('Original')
plt.xticks([]); plt.yticks([])
plt.subplot(1, 2, 2); plt.imshow(gray, cmap='gray'); plt.title('Gray')
plt.xticks([]); plt.yticks([])
plt.show()
`,
      },
      {
        title: '실습 3 · 안전하게 읽는 함수 만들기',
        desc: `<p>파일 이름을 받아 이미지를 읽고, 실패하면 <code>'읽기 실패: 파일이름'</code> 을 출력한 뒤 <code>None</code> 을 돌려주는 함수 <code>safe_read(name)</code> 을 완성하세요. 성공한 이미지만 창에 표시합니다.</p>`,
        starter: String.raw`
import cv2 as cv

def safe_read(name):
    img = cv.imread(name)
    # TODO: img 가 None 이면 메시지를 출력하고 None 반환
    # TODO: 성공하면 '읽기 성공: 이름 shape' 출력
    return img

for name in ['smarties.png', 'no_such_file.png', 'butterfly.jpg']:
    img = safe_read(name)
    if img is not None:
        cv.imshow(name, img)
`,
        hint: `<p><code>if img is None:</code> 블록 안에서 <code>print('읽기 실패:', name)</code> 후 <code>return None</code>. 그 아래에 성공 메시지를 출력하면 됩니다.</p>`,
        solution: String.raw`
import cv2 as cv

def safe_read(name):
    img = cv.imread(name)
    if img is None:
        print('읽기 실패:', name)
        return None
    print('읽기 성공:', name, img.shape)
    return img

for name in ['smarties.png', 'no_such_file.png', 'butterfly.jpg']:
    img = safe_read(name)
    if img is not None:
        cv.imshow(name, img)
`,
      },
    ],
    quiz: [
      { q: 'cv.imread() 로 PNG의 투명(알파) 채널까지 읽으려면 어떤 flag 를 써야 하나요?', options: ['cv.IMREAD_COLOR', 'cv.IMREAD_GRAYSCALE', 'cv.IMREAD_UNCHANGED', 'flag 없이 기본값'], answer: 2, explain: 'IMREAD_UNCHANGED(-1)는 파일을 그대로 읽어 4채널(BGRA)을 유지합니다. 기본값 IMREAD_COLOR 는 알파 채널을 버립니다.' },
      { q: '존재하지 않는 파일 이름으로 cv.imread() 를 호출하면?', options: ['즉시 FileNotFoundError 발생', 'None 을 반환', '검은 이미지를 반환', '빈 문자열을 반환'], answer: 1, explain: 'imread 는 실패해도 예외를 내지 않고 None 을 반환합니다. 그래서 if img is None: 확인이 중요합니다.' },
      { q: 'cv.imread("a.jpg", 0) 으로 읽은 이미지의 shape 모양은?', options: ['(높이, 너비, 3)', '(높이, 너비)', '(너비, 높이)', '(높이, 너비, 1)'], answer: 1, explain: 'flag 0 은 IMREAD_GRAYSCALE 입니다. 흑백 이미지는 채널 축이 없는 2차원 배열입니다.' },
      { q: 'OpenCV로 읽은 컬러 이미지를 plt.imshow() 로 그대로 보이면 색이 이상한 이유는?', options: ['Matplotlib가 흑백만 지원해서', 'OpenCV는 BGR, Matplotlib는 RGB 순서라서', '이미지가 float 라서', 'plt.show() 를 두 번 호출해서'], answer: 1, explain: '채널 순서가 달라 빨강과 파랑이 뒤바뀝니다. cv.cvtColor(img, cv.COLOR_BGR2RGB) 로 변환하세요.' },
      { q: '데스크톱 OpenCV에서 cv.waitKey(0) 의 동작은?', options: ['0밀리초 기다리고 바로 넘어감', '키를 누를 때까지 무한정 기다림', '모든 창을 닫음', '이미지를 저장함'], answer: 1, explain: 'waitKey(0) 은 키 입력이 있을 때까지 무한 대기합니다. (웹 실습 환경에서는 즉시 -1 을 반환합니다.)' },
    ],
  },

  /* =====================================================================
   * w1-3 비디오와 웹캠 다루기
   * ===================================================================== */
  {
    id: 'w1-3',
    summary: '비디오는 이미지(프레임)가 빠르게 이어진 것입니다. 튜토리얼의 VideoCapture 반복문 구조를 이해하고, 웹 실습 환경에서 동영상 파일(vtest.avi 등)의 정보 읽기·프레임 가져오기·탐색을 해 본 뒤, def process(frame): 로 동영상과 웹캠을 매 프레임 처리합니다.',
    goals: [
      '비디오·프레임·FPS·프레임 수의 개념과 cv.VideoCapture 의 역할을 설명할 수 있다',
      '튜토리얼의 데스크톱용 while 루프(카메라·동영상 파일) 코드를 읽고 각 줄의 의미를 설명할 수 있다',
      'cap.get()/cap.set() 으로 동영상의 FPS·프레임 수·크기를 읽고 원하는 프레임으로 이동할 수 있다',
      'def process(frame): 로 동영상/웹캠의 매 프레임을 흑백 변환·정보 표시·움직임 검출할 수 있다',
    ],
    schedule: [['도입 · 비디오란?', 5], ['VideoCapture와 데스크톱 루프', 8], ['동영상 파일 열기·탐색', 12], ['process(frame)로 매 프레임 처리', 10], ['실습 과제', 10], ['정리·퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 비디오 = 이미지의 연속</h3>
<p>동영상은 사실 정지 이미지(<b>프레임, frame</b>)를 빠르게 넘겨 보여주는 것입니다. 1초에 보여주는 프레임 수를 <b>FPS(frames per second)</b>라고 하며, 보통 웹캠은 30fps 입니다.
동영상 파일은 <b>전체 프레임 수</b>도 알 수 있어서 <b>재생 시간(초) = 프레임 수 ÷ FPS</b> 로 계산할 수 있습니다.</p>
<p>따라서 “비디오 처리”란 <b>프레임 한 장을 읽고 → 처리하고 → 보여주는 일을 계속 반복</b>하는 것입니다. 한 장을 처리하는 방법은 지난 시간에 배운 이미지 처리와 똑같습니다.
OpenCV에서 카메라나 동영상 파일은 <code>cv.VideoCapture</code> 객체로 엽니다. 인자로 <b>장치 번호</b>(0 = 첫 번째 카메라)나 <b>파일 이름</b>을 줍니다.</p>
<p>이 실습 환경에는 아래 샘플 동영상이 준비되어 있고, <b>⬆ 업로드</b>로 내 동영상(mp4/webm)도 추가할 수 있습니다.</p>` },
      { type: 'table', head: ['VideoCapture 에 쓰는 이름', '크기 · FPS · 프레임 수', '내용 · 용도'],
        rows: [
          ['<code>vtest.avi</code>', '768×576 · 10fps · 795 (약 80초)', '거리를 걷는 보행자 — 튜토리얼 영상, 움직임 검출'],
          ['<code>Megamind.avi</code>', '720×528 · 24fps · 270', '애니메이션 장면 — 프레임 처리, 필터'],
          ['<code>cup.mp4</code>', '640×480 · 27fps · 217', '손으로 움직이는 컵 — 색상/객체 추적 (2주차)'],
        ] },
      { type: 'code', title: '튜토리얼 원본 · 카메라 영상 흑백으로 보기 (데스크톱용)', norun: true, code: String.raw`
import numpy as np
import cv2 as cv

cap = cv.VideoCapture(0)            # 0번 카메라 열기
if not cap.isOpened():
    print("Cannot open camera")
    exit()

while True:
    # 프레임 한 장 읽기: ret 은 성공 여부(True/False), frame 은 이미지
    ret, frame = cap.read()
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break
    # 프레임 처리
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    # 결과 보여주기
    cv.imshow('frame', gray)
    if cv.waitKey(1) == ord('q'):   # 1ms 동안 키 확인, q 를 누르면 종료
        break

cap.release()                       # 카메라 놓아주기
cv.destroyAllWindows()
`, desc: '<p>핵심은 <b>while True 반복</b>과 <b>waitKey(1)</b> 입니다. waitKey 가 1ms 쉬는 동안 창이 갱신되고 키 입력을 확인합니다. 이 코드는 데스크톱 전용이며 웹에서는 실행하지 않습니다.</p>' },
      { type: 'text', html: `<h3>2. 동영상 파일 재생하기 (Playing Video from file)</h3>
<p>튜토리얼의 두 번째 부분은 카메라 대신 <b>파일</b>을 여는 것입니다. 장치 번호 자리에 <b>파일 이름</b>을 넣는 것만 다르고 반복 구조는 같습니다.</p>
<ul>
<li>파일이 끝나면 <code>cap.read()</code> 가 <code>ret = False</code> 를 돌려주므로, 그때 반복을 끝냅니다.</li>
<li>데스크톱에서는 <code>cv.waitKey(ms)</code> 의 대기 시간이 <b>재생 속도</b>를 정합니다. 너무 작으면 빨리 감기처럼, 너무 크면 슬로 모션처럼 보입니다. 보통 25ms 정도면 적당합니다(튜토리얼 설명).</li>
<li>코덱(ffmpeg 등)이 없으면 파일을 열지 못할 수 있으니 <code>cap.isOpened()</code> 로 확인합니다.</li>
</ul>` },
      { type: 'code', title: '튜토리얼 원본 · vtest.avi 흑백으로 재생 (데스크톱용)', norun: true, code: String.raw`
import numpy as np
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')          # 카메라 번호 대신 파일 이름

while cap.isOpened():
    ret, frame = cap.read()
    # 프레임을 못 읽었다면(파일 끝) 종료
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    cv.imshow('frame', gray)
    if cv.waitKey(1) == ord('q'):
        break

cap.release()
cv.destroyAllWindows()
` },
      { type: 'table', head: ['코드', '의미'],
        rows: [
          ['<code>cap = cv.VideoCapture(0)</code> / <code>cv.VideoCapture(\'vtest.avi\')</code>', '카메라 / 동영상 파일 열기'],
          ['<code>cap.isOpened()</code>', '제대로 열렸는지 확인 (True/False)'],
          ['<code>ret, frame = cap.read()</code>', '프레임 한 장 읽기. <code>ret</code>=성공 여부, <code>frame</code>=BGR 이미지 배열'],
          ['<code>cap.get(cv.CAP_PROP_FPS)</code>', '초당 프레임 수'],
          ['<code>cap.get(cv.CAP_PROP_FRAME_COUNT)</code>', '전체 프레임 수 (동영상 파일)'],
          ['<code>cap.get(cv.CAP_PROP_POS_FRAMES)</code>', '현재 위치(다음에 읽을 프레임 번호)'],
          ['<code>cap.get(cv.CAP_PROP_FRAME_WIDTH)</code> / <code>HEIGHT</code>', '프레임 너비 / 높이'],
          ['<code>cap.set(cv.CAP_PROP_POS_FRAMES, n)</code>', 'n 번 프레임으로 이동(탐색, seek)'],
          ['<code>cap.release()</code>', '카메라/파일 사용을 끝내고 자원 반납 (데스크톱)'],
        ] },
      { type: 'code', title: '튜토리얼 원본 · 비디오 저장하기 VideoWriter (데스크톱용, 참고)', norun: true, code: String.raw`
import cv2 as cv

cap = cv.VideoCapture(0)
# 코덱(FourCC), 파일 이름, FPS, 프레임 크기(너비, 높이)
fourcc = cv.VideoWriter_fourcc(*'XVID')
out = cv.VideoWriter('output.avi', fourcc, 20.0, (640, 480))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frame = cv.flip(frame, 0)       # 상하 반전
    out.write(frame)                # 파일에 한 장씩 기록
    cv.imshow('frame', frame)
    if cv.waitKey(1) == ord('q'):
        break

cap.release(); out.release(); cv.destroyAllWindows()
`, desc: '<p>저장할 프레임 크기는 VideoWriter 에 준 크기와 정확히 같아야 합니다. 동영상 저장은 데스크톱에서 해 보세요. 이 과정에서는 결과를 <code>cv.imwrite()</code> 로 이미지로 저장합니다.</p>' },
      { type: 'text', html: `<h3>3. 웹 환경에서 동영상 · 웹캠 쓰기</h3>
<p>브라우저에서 Python은 화면을 그리는 스레드와 같은 곳에서 실행됩니다. 그래서 <code>while True:</code> 로 계속 돌면 <b>화면이 멈춰 버립니다</b>(이 환경은 이를 막기 위해 반복이 300회를 넘으면 오류로 중단합니다). 대신 다음 두 가지를 씁니다.</p>
<ul>
<li><b>한 장씩 다루기</b>: <code>cap = cv.VideoCapture('vtest.avi')</code> 를 실행하면 오른쪽 패널의 <b>입력 소스가 그 동영상</b>으로 바뀌고(로딩될 때까지 기다림), <code>cap.read()</code> 는 <b>지금 재생 중인 프레임 1장</b>을 돌려줍니다. <code>cap.get()</code> 으로 정보를 읽고, <code>cap.set(cv.CAP_PROP_POS_FRAMES, n)</code> 으로 원하는 위치로 이동할 수 있습니다.
<code>cv.VideoCapture(0)</code> 은 실행 전에 <b>웹캠을 자동으로 켭니다</b>.</li>
<li><b>모든 프레임 처리하기</b>: <code>def process(frame):</code> 를 정의하고 결과 이미지를 <code>return</code> 하세요. 입력 소스가 <b>🎞️ 동영상</b>이나 <b>📷 웹캠</b>이면 <b>새 프레임마다</b> 호출되고, <b>이미지</b>면 한 번 호출됩니다. 반복은 웹 환경이 대신 해 줍니다.</li>
</ul>` },
      { type: 'code', title: '예제 1 · 동영상 열고 정보 읽기 + 프레임 한 장 보기', code: String.raw`
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')     # 오른쪽 패널 입력 소스가 vtest 동영상으로 바뀜

if not cap.isOpened():
    print('동영상을 열 수 없습니다.')
else:
    fps = cap.get(cv.CAP_PROP_FPS)
    count = cap.get(cv.CAP_PROP_FRAME_COUNT)
    w = int(cap.get(cv.CAP_PROP_FRAME_WIDTH))     # get() 은 float 를 돌려주므로 int 로
    h = int(cap.get(cv.CAP_PROP_FRAME_HEIGHT))
    print('FPS:', fps)
    print('전체 프레임 수:', int(count))
    print('크기: %d x %d' % (w, h))
    print('재생 시간: %.1f 초' % (count / fps))

    ret, frame = cap.read()                       # 현재 프레임 1장 (반복 금지!)
    if ret:
        print('frame shape:', frame.shape)
        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        cv.imshow('frame', frame)
        cv.imshow('gray', gray)
    else:
        print('프레임을 읽지 못했습니다.')
`, desc: '<p>실행하면 오른쪽 패널에 동영상이 나타나고, 아래의 재생/일시정지/탐색 막대로 조작할 수 있습니다. 동영상을 다른 위치로 옮긴 뒤 다시 실행하면 그 순간의 프레임이 읽힙니다.</p>' },
      { type: 'code', title: '예제 2 · 원하는 위치로 이동하기 (CAP_PROP_POS_FRAMES)', code: String.raw`
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')
fps = cap.get(cv.CAP_PROP_FPS)

sec = 30                                   # 30초 지점으로 이동
target = int(sec * fps)                    # 초 → 프레임 번호 (10fps 이면 300)
cap.set(cv.CAP_PROP_POS_FRAMES, target)

ret, frame = cap.read()
if ret:
    out = frame.copy()
    cv.putText(out, 'time %ds  frame %d' % (sec, target), (10, 40),
               cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2)
    cv.imshow('seek', out)
    print('요청한 프레임:', target, ' 현재 위치:', cap.get(cv.CAP_PROP_POS_FRAMES))
else:
    print('프레임을 읽지 못했습니다.')
`, desc: '<p><code>sec</code> 값을 0, 60, 75 등으로 바꿔 보세요. 전체 길이(약 79.5초)를 넘으면 읽기에 실패할 수 있습니다. 읽은 뒤의 위치 값은 환경에 따라 요청한 번호이거나 그다음 번호일 수 있습니다.</p>' },
      { type: 'code', title: '예제 3 · process(frame): 흑백 + 프레임 정보 표시 (동영상/웹캠 공용)', code: String.raw`
import cv2 as cv
import time

# 입력 소스를 🎞️ 동영상(vtest 등) 또는 📷 웹캠으로 바꾸면 매 프레임 실행됩니다.
# 아래 줄의 주석을 풀면 코드에서 바로 vtest 동영상을 입력 소스로 열 수 있습니다.
# cap = cv.VideoCapture('vtest.avi')

count = 0              # 지금까지 처리한 프레임 수 (함수 밖에 둬야 값이 유지됨)
start = time.time()

def process(frame):
    global count        # 함수 밖 변수를 바꾸려면 global 선언
    count += 1
    elapsed = time.time() - start

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)          # 튜토리얼의 '처리' 부분
    out = cv.cvtColor(gray, cv.COLOR_GRAY2BGR)            # 색 글자를 쓰려고 다시 3채널로
    h, w = out.shape[:2]
    cv.putText(out, 'frame: %d' % count, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv.putText(out, 'size: %dx%d' % (w, h), (10, 60), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    cv.putText(out, 'time: %.1fs' % elapsed, (10, 90), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
    return out
`, desc: '<p>데스크톱 코드에서 <code>cap.read()</code>, <code>imshow</code>, <code>waitKey</code>, <code>while</code> 이 모두 사라지고 “처리” 부분만 남았습니다. 이미지 입력일 때는 한 번만 호출되므로 frame: 1 로 보입니다. <code>cv.putText()</code> 는 다음 교시에서 자세히 배웁니다.</p>' },
      { type: 'code', title: '예제 4 · 좌우 반전과 여러 창 반환', code: String.raw`
import cv2 as cv

def process(frame):
    mirror = cv.flip(frame, 1)     # 1: 좌우 반전, 0: 상하 반전, -1: 둘 다
    upside = cv.flip(frame, 0)
    return mirror, upside          # 튜플로 돌려주면 창이 여러 개
`, desc: '<p><code>cv.flip(img, flipCode)</code> 는 이미지를 뒤집습니다. 웹캠으로 셀카 화면처럼 거울 모드를 만들 때 자주 씁니다.</p>' },
      { type: 'text', html: `<h3>4. 입력 소스 컨트롤 사용법</h3>
<ol>
<li><b>🎞️ 동영상</b>: 오른쪽 패널 <b>입력 소스</b>에서 vtest 같은 동영상을 고르거나, 코드에서 <code>cv.VideoCapture('vtest.avi')</code> 를 실행합니다. 동영상 아래의 <b>재생/일시정지/탐색 막대</b>로 원하는 장면을 찾을 수 있습니다.</li>
<li><b>📷 웹캠</b>: <b>📷 웹캠 켜기</b>를 누르고 브라우저의 카메라 권한을 <b>허용</b>한 뒤 입력 소스를 웹캠으로 고릅니다. (<code>cv.VideoCapture(0)</code> 을 실행해도 자동으로 켜집니다.)</li>
<li>에디터에서 <b>▶ 실행</b>. <code>process</code> 가 새 프레임마다 호출되어 <code>result</code> 창이 계속 갱신됩니다. 멈추려면 <b>■ 정지</b>, 코드를 고친 뒤에는 다시 ▶ 실행.</li>
</ol>
<p><b>웹캠이 없어도 괜찮습니다.</b> 모든 웹캠 예제는 입력 소스를 <b>🎞️ 동영상</b>(vtest 등)으로 골라도 똑같이 동작합니다.
<b>좌우반전</b> 체크는 웹캠 화면을 거울처럼 보이게 하고, <b>📸 스냅샷</b>은 현재 웹캠 화면을 <code>webcam.png</code> 로 저장해 <code>cv.imread('webcam.png')</code> 로 읽을 수 있게 합니다.</p>` },
      { type: 'code', title: '예제 5 · 웹캠에서 현재 프레임 한 장 가져오기', code: String.raw`
import cv2 as cv
import webcv

cap = cv.VideoCapture(0)     # 웹캠을 자동으로 켬 (브라우저 권한 허용 필요)
ret, frame = cap.read()      # '현재 프레임 1장' (반복 금지!)

if not ret:
    print('웹캠 프레임을 읽지 못해 현재 입력 소스로 대신합니다.')
    frame = webcv.get_input()

print('프레임 shape:', frame.shape)
print('웹캠 크기:', cap.get(cv.CAP_PROP_FRAME_WIDTH), 'x', cap.get(cv.CAP_PROP_FRAME_HEIGHT))
cv.imshow('snapshot', frame)
cv.imwrite('snapshot.png', frame)   # 스냅샷을 파일로 저장 (콘솔의 링크로 다운로드)
`, desc: '<p>카메라가 없거나 권한을 거부하면 <code>ret</code> 이 False 가 됩니다. 그래서 항상 <code>ret</code> 을 확인하는 습관을 들이세요.</p>' },
      { type: 'warn', html: `<p><b>process 는 가볍게!</b> 동영상·웹캠 입력이면 1초에 수십 번 호출됩니다. 안에서 <code>cv.imread()</code> 나 <code>cv.VideoCapture()</code> 를 매번 호출하거나, 파이썬 이중 for 문으로 픽셀을 돌면 영상이 뚝뚝 끊깁니다.
한 번만 준비하면 되는 것(파일 열기, 설정값)은 <b>함수 밖</b>에 두세요. 또 어디서든 <code>while</code> 로 <code>cap.read()</code> 를 반복하지 마세요. 큰 동영상(768×576)은 <code>cv.resize</code> 로 줄여서 처리하면 빨라집니다.</p>` },
      { type: 'text', html: `<h3>5. 데스크톱 코드 ↔ 웹 코드 바꾸는 법</h3>
<p>튜토리얼이나 인터넷에서 찾은 데스크톱 코드를 이 환경에서 돌리고 싶다면 아래 표처럼 바꾸면 됩니다. 반대로 여기서 만든 <code>process</code> 함수는 데스크톱의 while 루프 안에 그대로 넣으면 동작합니다.</p>` },
      { type: 'table', head: ['데스크톱 (while 루프)', '웹 실습 환경'],
        rows: [
          ['<code>cap = cv.VideoCapture(\'vtest.avi\')</code> 또는 <code>(0)</code>', '같은 코드 → 입력 소스가 동영상/웹캠으로 바뀜 (또는 패널에서 직접 선택)'],
          ['<code>while cap.isOpened():</code> + <code>ret, frame = cap.read()</code>', '없음 — 새 프레임마다 <code>process(frame)</code> 자동 호출'],
          ['루프 안의 처리 코드', '<code>def process(frame):</code> 안에 넣기'],
          ['<code>cv.imshow(\'frame\', gray)</code>', '<code>return gray</code> (result 창에 표시)'],
          ['<code>if cv.waitKey(1) == ord(\'q\'): break</code>', '■ 정지 버튼, 동영상 일시정지'],
          ['<code>cap.release()</code>, <code>cv.destroyAllWindows()</code>', '필요 없음'],
          ['루프 밖에서 한 번 하는 준비', '함수 밖(모듈 최상단)에 작성'],
        ] },
      { type: 'tip', html: `<p>데스크톱에서 <code>process</code> 함수를 재사용하는 방법: <code>while cap.isOpened():</code> 안에서 <code>ret, frame = cap.read()</code> → <code>if not ret: break</code> → <code>out = process(frame)</code> → <code>cv.imshow('result', out)</code> → <code>waitKey(25)</code>. 4~5주차 프로젝트도 이 구조로 만듭니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 흑백 거울 모드',
        desc: `<p><code>process(frame)</code> 에서 프레임을 <b>좌우 반전</b>한 뒤 <b>흑백</b>으로 바꿔 돌려주세요. 입력 소스를 📷 웹캠(손을 흔들어 보기) 또는 🎞️ 동영상(보행자가 반대로 걷는지 확인)으로 바꿔 확인합니다.</p>`,
        starter: String.raw`
import cv2 as cv

def process(frame):
    # TODO: cv.flip 으로 좌우 반전 (flipCode = 1)
    flipped = frame
    # TODO: cv.cvtColor 로 흑백 변환
    gray = flipped
    return gray
`,
        hint: `<p><code>flipped = cv.flip(frame, 1)</code>, <code>gray = cv.cvtColor(flipped, cv.COLOR_BGR2GRAY)</code></p>`,
        solution: String.raw`
import cv2 as cv

def process(frame):
    flipped = cv.flip(frame, 1)
    gray = cv.cvtColor(flipped, cv.COLOR_BGR2GRAY)
    return gray
`,
      },
      {
        title: '실습 2 · 동영상 썸네일 시트 만들기',
        desc: `<p><code>vtest.avi</code> 를 열어 전체 길이를 4등분한 위치(0, 1/4, 2/4, 3/4 지점)의 프레임을 가져오고, 각각 절반 크기로 줄여 프레임 번호를 쓴 뒤 <b>2×2 격자</b>로 이어 붙여 <code>thumbnails</code> 창에 표시하세요.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')
total = int(cap.get(cv.CAP_PROP_FRAME_COUNT))
print('전체 프레임 수:', total)

thumbs = []
for i in range(4):
    n = i * total // 4                     # 0, 1/4, 2/4, 3/4 지점
    # TODO: cap.set 으로 n 번 프레임으로 이동

    ret, frame = cap.read()
    if not ret:
        frame = np.zeros((576, 768, 3), np.uint8)   # 읽기 실패 시 검은 화면
    small = cv.resize(frame, (384, 288))   # 절반 크기 (너비, 높이)
    # TODO: small 에 'frame n' 글자 쓰기
    thumbs.append(small)

# TODO: 위쪽 2장, 아래쪽 2장을 np.hstack 으로 붙이고 np.vstack 으로 쌓기
sheet = thumbs[0]
cv.imshow('thumbnails', sheet)
`,
        hint: `<p>이동: <code>cap.set(cv.CAP_PROP_POS_FRAMES, n)</code>. 글자: <code>cv.putText(small, 'frame %d' % n, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)</code>.
격자: <code>top = np.hstack(thumbs[:2])</code>, <code>bottom = np.hstack(thumbs[2:])</code>, <code>sheet = np.vstack((top, bottom))</code></p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')
total = int(cap.get(cv.CAP_PROP_FRAME_COUNT))
print('전체 프레임 수:', total)

thumbs = []
for i in range(4):
    n = i * total // 4
    cap.set(cv.CAP_PROP_POS_FRAMES, n)

    ret, frame = cap.read()
    if not ret:
        frame = np.zeros((576, 768, 3), np.uint8)
    small = cv.resize(frame, (384, 288))
    cv.putText(small, 'frame %d' % n, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    thumbs.append(small)

top = np.hstack(thumbs[:2])
bottom = np.hstack(thumbs[2:])
sheet = np.vstack((top, bottom))
print('sheet shape:', sheet.shape)     # (576, 768, 3)
cv.imshow('thumbnails', sheet)
`,
      },
      {
        title: '실습 3 · 움직임 검출기 (프레임 차분)',
        desc: `<p><b>이전 프레임과 현재 프레임의 차이</b>를 구하면 움직인 부분만 밝게 나타납니다(프레임 차분, frame differencing). <code>vtest.avi</code> 를 입력 소스로 열고 <code>process</code> 에서</p>
<ol>
<li>프레임을 320×240 으로 줄이고 흑백으로 변환</li>
<li><code>cv.absdiff(prev, gray)</code> 로 이전 프레임과의 차이 계산</li>
<li><code>cv.threshold(diff, 25, 255, cv.THRESH_BINARY)</code> 로 차이가 큰 곳만 흰색(마스크)</li>
<li>흰 픽셀 비율이 1% 를 넘으면 화면에 <code>MOTION</code> 표시</li>
<li>현재 흑백 프레임을 <code>prev</code> 에 저장(global)</li>
</ol>
<p>를 완성하세요. 웹캠으로 바꾸면 손을 움직일 때만 MOTION 이 뜹니다.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')   # 입력 소스를 vtest 동영상으로 (웹캠으로 바꿔도 동작)
prev = None                          # 이전 프레임(흑백)을 기억할 변수

def process(frame):
    global prev
    small = cv.resize(frame, (320, 240))      # 크기를 고정 → 입력이 바뀌어도 크기가 같음
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)

    if prev is None:                          # 첫 프레임: 비교할 대상이 없음
        prev = gray
        return small

    # TODO: 이전 프레임과의 절대 차이
    diff = np.zeros_like(gray)
    # TODO: 차이가 25 보다 큰 곳만 255 로 (cv.threshold 는 (ret, 결과) 를 돌려줌)
    mask = diff

    ratio = cv.countNonZero(mask) / mask.size   # 흰 픽셀 비율
    out = small.copy()
    # TODO: ratio 가 0.01 보다 크면 'MOTION' 을 빨간 글자로 표시
    cv.putText(out, 'diff %.1f%%' % (ratio * 100), (10, 230), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # TODO: prev 를 현재 gray 로 바꾸기
    return out, mask
`,
        hint: `<p><code>diff = cv.absdiff(prev, gray)</code> — 빼기 순서와 상관없이 차이의 절댓값을 구하므로 음수 문제가 없습니다.
<code>ret, mask = cv.threshold(diff, 25, 255, cv.THRESH_BINARY)</code>. 표시: <code>if ratio &gt; 0.01: cv.putText(out, 'MOTION', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)</code>. 마지막에 <code>prev = gray</code>.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

cap = cv.VideoCapture('vtest.avi')
prev = None

def process(frame):
    global prev
    small = cv.resize(frame, (320, 240))
    gray = cv.cvtColor(small, cv.COLOR_BGR2GRAY)

    if prev is None:
        prev = gray
        return small

    diff = cv.absdiff(prev, gray)                                 # 프레임 차분
    ret, mask = cv.threshold(diff, 25, 255, cv.THRESH_BINARY)     # 큰 차이만 흰색

    ratio = cv.countNonZero(mask) / mask.size
    out = small.copy()
    if ratio > 0.01:
        cv.putText(out, 'MOTION', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv.putText(out, 'diff %.1f%%' % (ratio * 100), (10, 230), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    prev = gray                                                   # 다음 프레임을 위해 저장
    return out, mask
`,
      },
    ],
    quiz: [
      { q: 'ret, frame = cap.read() 에서 ret 의 의미는?', options: ['프레임 번호', '프레임을 제대로 읽었는지(True/False)', '남은 프레임 수', '이미지의 채널 수'], answer: 1, explain: 'read() 는 (성공 여부, 이미지)를 돌려줍니다. 동영상 파일 끝이거나 카메라 오류면 ret 이 False 입니다.' },
      { q: '웹 실습 환경에서 동영상의 모든 프레임을 처리하는 올바른 방법은?', options: ['while cap.isOpened(): 안에서 cap.read() 반복', 'def process(frame): 을 정의하고 입력 소스를 동영상으로 둔다', 'cv.waitKey(25) 를 반복 호출', 'time.sleep() 으로 반복'], answer: 1, explain: '브라우저에서는 무한 루프가 화면을 멈추게 합니다. process(frame) 을 정의하면 동영상·웹캠의 새 프레임마다 웹 환경이 호출해 줍니다.' },
      { q: '10fps, 795 프레임인 vtest.avi 에서 30초 지점으로 이동하는 코드는?', options: ['cap.set(cv.CAP_PROP_FPS, 30)', 'cap.set(cv.CAP_PROP_POS_FRAMES, 300)', 'cap.set(cv.CAP_PROP_FRAME_COUNT, 30)', 'cap.read(30)'], answer: 1, explain: '프레임 번호 = 초 × FPS = 30 × 10 = 300 입니다. CAP_PROP_POS_FRAMES 로 위치를 옮깁니다.' },
      { q: 'process 함수 안에서 함수 밖의 prev 변수에 현재 프레임을 저장하려면 무엇이 필요한가요?', options: ['return prev', 'global prev 선언', 'import prev', '아무것도 필요 없음'], answer: 1, explain: '함수 안에서 바깥 변수에 값을 대입하려면 global 선언이 필요합니다. 없으면 UnboundLocalError 가 납니다.' },
    ],
  },

  /* =====================================================================
   * w1-4 그리기 함수
   * ===================================================================== */
  {
    id: 'w1-4',
    summary: 'cv.line, cv.rectangle, cv.circle, cv.ellipse, cv.polylines, cv.putText로 이미지 위에 도형과 글자를 그립니다. 검출 결과 표시, 주석 달기 등 앞으로 모든 교시에서 쓰이는 기본 도구입니다.',
    goals: [
      'OpenCV 이미지 좌표계와 그리기 함수의 공통 인자(color, thickness, lineType)를 설명할 수 있다',
      '선·사각형·원·타원을 원하는 위치와 크기로 그릴 수 있다',
      'cv.polylines로 다각형을 그리고, 좌표 배열의 모양을 맞출 수 있다',
      'cv.putText로 이미지에 글자를 쓰고, 사진 위에 주석을 달 수 있다',
    ],
    schedule: [['도입 · 좌표계', 5], ['공통 인자와 선·사각형·원', 12], ['타원·다각형', 10], ['텍스트와 사진 주석', 8], ['실습 과제', 10], ['정리·퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 좌표계와 공통 인자</h3>
<p>OpenCV 이미지의 원점 <b>(0, 0)은 왼쪽 위</b>입니다. <b>x는 오른쪽</b>으로, <b>y는 아래쪽</b>으로 커집니다(수학 그래프와 y 방향이 반대!). 그리기 함수의 점은 항상 <b>(x, y)</b> 튜플로 줍니다.</p>
<p>모든 그리기 함수는 <b>전달한 이미지 배열 자체를 수정</b>합니다(제자리 수정). 원본을 보존하려면 먼저 <code>img.copy()</code> 로 복사한 뒤 그리세요. 튜토리얼처럼 512×512 검은 이미지를 도화지로 씁니다.</p>` },
      { type: 'table', head: ['공통 인자', '의미', '예'],
        rows: [
          ['<code>img</code>', '그림을 그릴 이미지 (직접 수정됨)', '<code>np.zeros((512, 512, 3), np.uint8)</code>'],
          ['<code>color</code>', '색. 컬러 이미지는 <b>(B, G, R)</b> 튜플, 흑백은 숫자 하나', '<code>(255, 0, 0)</code> = 파랑'],
          ['<code>thickness</code>', '선 두께(픽셀). 기본 1. 닫힌 도형에 <b>-1</b>을 주면 속을 채움', '<code>3</code>, <code>-1</code>'],
          ['<code>lineType</code>', '선 그리는 방식. <code>cv.LINE_8</code>(기본), <code>cv.LINE_AA</code>(안티앨리어싱, 매끄러움)', '<code>cv.LINE_AA</code>'],
        ] },
      { type: 'code', title: '예제 1 · 선 그리기 (cv.line)', code: String.raw`
import numpy as np
import cv2 as cv

# 검은 도화지 만들기
img = np.zeros((512, 512, 3), np.uint8)

# 왼쪽 위(0,0) → 오른쪽 아래(511,511) 파란 대각선, 두께 5
cv.line(img, (0, 0), (511, 511), (255, 0, 0), 5)

# 비교: 기본 선(LINE_8) vs 매끄러운 선(LINE_AA)
cv.line(img, (50, 400), (450, 300), (255, 255, 255), 2, cv.LINE_8)
cv.line(img, (50, 450), (450, 350), (255, 255, 255), 2, cv.LINE_AA)

cv.imshow('line', img)
`, desc: '<p>결과 창을 클릭하면 크게 볼 수 있습니다. 두 흰 선의 가장자리를 확대해 LINE_AA 가 더 부드러운지 비교해 보세요.</p>' },
      { type: 'code', title: '예제 2 · 사각형과 원 (cv.rectangle, cv.circle)', code: String.raw`
import numpy as np
import cv2 as cv

img = np.zeros((512, 512, 3), np.uint8)

# 사각형: 왼쪽 위 꼭짓점, 오른쪽 아래 꼭짓점
cv.rectangle(img, (384, 0), (510, 128), (0, 255, 0), 3)

# 원: 중심, 반지름 → 튜토리얼처럼 사각형 안에 꽉 찬 빨간 원 (thickness=-1 채우기)
cv.circle(img, (447, 63), 63, (0, 0, 255), -1)

# 추가 연습: 속이 빈 사각형과 원
cv.rectangle(img, (50, 200), (250, 350), (255, 255, 0), 2)
cv.circle(img, (150, 275), 50, (0, 255, 255), 4, cv.LINE_AA)

cv.imshow('rectangle & circle', img)
` },
      { type: 'text', html: `<h3>2. 타원 (cv.ellipse)</h3>
<p>타원은 인자가 많아 처음엔 어렵지만, 각각의 의미를 알면 호(arc)나 반원도 쉽게 그릴 수 있습니다.</p>
<p><code>cv.ellipse(img, center, axes, angle, startAngle, endAngle, color, thickness)</code></p>` },
      { type: 'table', head: ['인자', '의미'],
        rows: [
          ['<code>center</code>', '타원의 중심 (x, y)'],
          ['<code>axes</code>', '(가로 반지름, 세로 반지름). 원이면 두 값이 같음'],
          ['<code>angle</code>', '타원 전체를 회전하는 각도(도). 시계 방향으로 회전'],
          ['<code>startAngle</code>, <code>endAngle</code>', '어디부터 어디까지 그릴지(도). 0 = 오른쪽(3시), 90 = 아래(6시). 0~360 이면 온전한 타원, 0~180 이면 아래쪽 반'],
        ] },
      { type: 'code', title: '예제 3 · 타원과 호 그리기', code: String.raw`
import numpy as np
import cv2 as cv

img = np.zeros((512, 512, 3), np.uint8)

# 튜토리얼: 중심(256,256), 반지름(100,50), 회전 0, 0°~180° → 아래쪽 반 타원을 채움
# 색으로 255 하나만 주면 (255, 0, 0) → 파랑으로 해석됨
cv.ellipse(img, (256, 256), (100, 50), 0, 0, 180, 255, -1)

# 온전한 타원(0~360)을 45도 회전
cv.ellipse(img, (120, 120), (80, 30), 45, 0, 360, (0, 255, 0), 2)

# 호(arc): 원(반지름 같음)의 일부만 — 180°~360° 는 위쪽 반
cv.ellipse(img, (390, 120), (70, 70), 0, 180, 360, (0, 255, 255), 3)

# 90° 만큼 빠진 원 (팩맨 모양)
cv.ellipse(img, (390, 400), (70, 70), 0, 30, 330, (0, 200, 255), -1)

cv.imshow('ellipse', img)
` },
      { type: 'text', html: `<h3>3. 다각형 (cv.polylines)</h3>
<p>여러 점을 차례로 잇는 다각형은 <code>cv.polylines(img, [pts], isClosed, color, thickness)</code> 로 그립니다.</p>
<ul>
<li>점 배열 <code>pts</code> 는 <b>int32</b> 자료형이어야 하고, 모양은 <b>(점 개수, 1, 2)</b> 로 맞춥니다: <code>pts.reshape((-1, 1, 2))</code>. (-1 은 “나머지로 알아서 계산”)</li>
<li>두 번째 인자는 <b>리스트</b> <code>[pts]</code> 입니다. 여러 다각형을 한 번에 그릴 수 있기 때문이에요.</li>
<li><code>isClosed=True</code> 면 마지막 점과 첫 점을 이어 닫힌 도형, False 면 열린 꺾은선입니다.</li>
<li>속을 채우려면 <code>cv.fillPoly(img, [pts], color)</code> 를 씁니다.</li>
</ul>` },
      { type: 'code', title: '예제 4 · 다각형과 꺾은선', code: String.raw`
import numpy as np
import cv2 as cv

img = np.zeros((512, 512, 3), np.uint8)

# 튜토리얼의 작은 사각형 (노란색)
pts = np.array([[10, 5], [20, 30], [70, 20], [50, 10]], np.int32)
pts = pts.reshape((-1, 1, 2))
print('pts shape:', pts.shape)     # (4, 1, 2)
cv.polylines(img, [pts], True, (0, 255, 255))

# 삼각형 (닫힘)
tri = np.array([[256, 100], [156, 280], [356, 280]], np.int32).reshape((-1, 1, 2))
cv.polylines(img, [tri], True, (0, 255, 0), 3)

# 지그재그 (열림)
zig = np.array([[50, 450], [120, 350], [190, 450], [260, 350], [330, 450]], np.int32).reshape((-1, 1, 2))
cv.polylines(img, [zig], False, (255, 0, 255), 3)

# 속이 채워진 오각형
penta = np.array([[430, 300], [490, 345], [468, 415], [392, 415], [370, 345]], np.int32)
cv.fillPoly(img, [penta], (255, 128, 0))

cv.imshow('polylines', img)
` },
      { type: 'text', html: `<h3>4. 글자 쓰기 (cv.putText)</h3>
<p><code>cv.putText(img, text, org, fontFace, fontScale, color, thickness, lineType)</code></p>
<ul>
<li><code>org</code>: 글자의 <b>왼쪽 아래</b> 기준점 (x, y). 왼쪽 위가 아니라는 점에 주의!</li>
<li><code>fontFace</code>: <code>cv.FONT_HERSHEY_SIMPLEX</code>, <code>cv.FONT_HERSHEY_PLAIN</code>, <code>cv.FONT_HERSHEY_DUPLEX</code>, <code>cv.FONT_HERSHEY_COMPLEX</code>, <code>cv.FONT_HERSHEY_SCRIPT_SIMPLEX</code> 등</li>
<li><code>fontScale</code>: 글자 크기 배율(1.0 이 기본 크기). 실수 가능</li>
<li>텍스트 품질을 위해 <code>cv.LINE_AA</code> 를 권장합니다.</li>
</ul>` },
      { type: 'warn', html: `<p><b>cv.putText 는 한글을 쓸 수 없습니다.</b> 한글을 넣으면 <code>???</code> 로 표시됩니다. 영어·숫자·기호만 사용하세요. (한글이 꼭 필요하면 PIL 라이브러리를 써야 하지만 이 과정에서는 다루지 않습니다.)</p>` },
      { type: 'code', title: '예제 5 · 튜토리얼 전체 코드 + 여러 글꼴', code: String.raw`
import numpy as np
import cv2 as cv

img = np.zeros((512, 512, 3), np.uint8)

cv.line(img, (0, 0), (511, 511), (255, 0, 0), 5)
cv.rectangle(img, (384, 0), (510, 128), (0, 255, 0), 3)
cv.circle(img, (447, 63), 63, (0, 0, 255), -1)
cv.ellipse(img, (256, 256), (100, 50), 0, 0, 180, 255, -1)
pts = np.array([[10, 5], [20, 30], [70, 20], [50, 10]], np.int32).reshape((-1, 1, 2))
cv.polylines(img, [pts], True, (0, 255, 255))

font = cv.FONT_HERSHEY_SIMPLEX
cv.putText(img, 'OpenCV', (10, 500), font, 4, (255, 255, 255), 2, cv.LINE_AA)
cv.imshow('tutorial', img)

# 글꼴 비교
board = np.zeros((300, 512, 3), np.uint8)
fonts = [('SIMPLEX', cv.FONT_HERSHEY_SIMPLEX), ('PLAIN', cv.FONT_HERSHEY_PLAIN),
         ('DUPLEX', cv.FONT_HERSHEY_DUPLEX), ('COMPLEX', cv.FONT_HERSHEY_COMPLEX),
         ('SCRIPT', cv.FONT_HERSHEY_SCRIPT_SIMPLEX)]
y = 50
for name, f in fonts:
    cv.putText(board, 'Hello ' + name, (10, y), f, 1.2, (0, 255, 0), 2, cv.LINE_AA)
    y += 55
cv.imshow('fonts', board)
` },
      { type: 'code', title: '예제 6 · 사진 위에 주석 달기', code: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
out = img.copy()          # 원본은 보존하고 복사본에 그리기

# 공 위치에 사각형 + 라벨 (공은 대략 x 330~390, y 280~340)
cv.rectangle(out, (330, 280), (390, 340), (0, 0, 255), 2)
cv.putText(out, 'ball', (330, 272), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2, cv.LINE_AA)

# 글자 크기를 미리 알아내서 배경 상자 그리기
text = 'Messi & Ball'
(tw, th), base = cv.getTextSize(text, cv.FONT_HERSHEY_DUPLEX, 1.0, 2)
cv.rectangle(out, (10, 10), (10 + tw + 10, 10 + th + base + 10), (0, 0, 0), -1)
cv.putText(out, text, (15, 15 + th), cv.FONT_HERSHEY_DUPLEX, 1.0, (255, 255, 255), 2, cv.LINE_AA)

cv.imshow('original', img)
cv.imshow('annotated', out)
`, desc: '<p><code>cv.getTextSize()</code> 는 글자가 차지할 너비·높이를 알려줍니다. 검출 결과에 라벨을 붙일 때 유용합니다.</p>' },
      { type: 'tip', html: `<p>그리기 함수의 좌표는 <b>정수</b>여야 합니다. 계산 결과가 실수라면 <code>int(x)</code> 로 바꿔 주세요. 예: <code>center = (int(w / 2), int(h / 2))</code> 또는 <code>(w // 2, h // 2)</code>.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · OpenCV 로고 비슷하게 그리기',
        desc: `<p>512×512 검은 이미지에 OpenCV 로고처럼 <b>빨강(위) · 초록(왼쪽 아래) · 파랑(오른쪽 아래)</b> 굵은 고리 3개를 <code>cv.ellipse</code> 로 그리고, 아래에 <code>OpenCV</code> 글자를 쓰세요. 각 고리는 한쪽이 60° 정도 끊겨 있어야 합니다.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

img = np.zeros((512, 512, 3), np.uint8)
r = 60          # 고리 반지름
t = 35          # 고리 두께

# 빨간 고리: 중심 (256, 140), 아래쪽(90°)이 끊기도록 120° ~ 420° 를 그림
cv.ellipse(img, (256, 140), (r, r), 0, 120, 420, (0, 0, 255), t)

# TODO: 초록 고리 — 중심 (176, 280), 오른쪽 위(300° 방향)가 끊기도록 (-30° ~ 270°)

# TODO: 파란 고리 — 중심 (336, 280), 위쪽(270° 방향)이 끊기도록 (-60° ~ 240°)

# TODO: 'OpenCV' 글자 (예: 위치 (120, 440), 크기 2)

cv.imshow('logo', img)
`,
        hint: `<p><code>cv.ellipse(img, (176, 280), (r, r), 0, -30, 270, (0, 255, 0), t)</code> 처럼 시작·끝 각도로 끊긴 부분을 만듭니다. 각도 0 은 3시 방향, 90 은 6시 방향입니다(y축이 아래로 향하므로 시계 방향).</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

img = np.zeros((512, 512, 3), np.uint8)
r = 60
t = 35

cv.ellipse(img, (256, 140), (r, r), 0, 120, 420, (0, 0, 255), t)   # 빨강
cv.ellipse(img, (176, 280), (r, r), 0, -30, 270, (0, 255, 0), t)   # 초록
cv.ellipse(img, (336, 280), (r, r), 0, -60, 240, (255, 0, 0), t)   # 파랑

cv.putText(img, 'OpenCV', (110, 440), cv.FONT_HERSHEY_SIMPLEX, 2.2, (255, 255, 255), 5, cv.LINE_AA)

cv.imshow('logo', img)
`,
      },
      {
        title: '실습 2 · 과녁 그리기',
        desc: `<p>400×400 흰 배경 중앙에 반지름이 <b>180, 150, 120, 90, 60, 30</b> 인 원을 <b>빨강·흰색 번갈아</b> 채워 과녁을 만들고, 중앙에 작은 검은 십자선을 그리세요. <code>for</code> 문을 사용해 보세요.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

img = np.full((400, 400, 3), 255, np.uint8)   # 흰 배경
center = (200, 200)

radii = [180, 150, 120, 90, 60, 30]
for i, r in enumerate(radii):
    # TODO: i 가 짝수면 빨강 (0,0,255), 홀수면 흰색 (255,255,255)
    color = (0, 0, 255)
    # TODO: 채워진 원 그리기 (thickness = -1)

# TODO: 중앙 십자선 (검정, 길이 20)

cv.imshow('target', img)
`,
        hint: `<p>큰 원부터 그려야 작은 원이 위에 덮입니다. <code>color = (0, 0, 255) if i % 2 == 0 else (255, 255, 255)</code>, <code>cv.circle(img, center, r, color, -1)</code>.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

img = np.full((400, 400, 3), 255, np.uint8)
center = (200, 200)

radii = [180, 150, 120, 90, 60, 30]
for i, r in enumerate(radii):
    color = (0, 0, 255) if i % 2 == 0 else (255, 255, 255)
    cv.circle(img, center, r, color, -1, cv.LINE_AA)

cv.line(img, (190, 200), (210, 200), (0, 0, 0), 2)
cv.line(img, (200, 190), (200, 210), (0, 0, 0), 2)

cv.imshow('target', img)
`,
      },
      {
        title: '실습 3 · 이름표 만들기',
        desc: `<p>300×500 이미지에 이름표를 만드세요: 배경은 연한 회색 <code>(230, 230, 230)</code>, 위쪽 70픽셀은 파란 띠, 띠 안에 흰 글자 <code>HELLO</code>, 가운데에 <b>내 이름(영문)</b>, 테두리는 검은 사각형(두께 4).</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

card = np.full((300, 500, 3), 230, np.uint8)
name = 'Your Name'     # TODO: 내 영문 이름으로 바꾸기

# TODO: 위쪽 파란 띠 (0,0) ~ (499,70), 채우기

# TODO: 띠 안에 'HELLO' 흰 글자

# TODO: 가운데에 이름 (검정, 크기 1.5 정도)
cv.putText(card, name, (40, 190), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3, cv.LINE_AA)

# TODO: 전체 테두리 (검정, 두께 4)

cv.imshow('name tag', card)
`,
        hint: `<p>띠: <code>cv.rectangle(card, (0, 0), (499, 70), (200, 100, 0), -1)</code>. 테두리: <code>cv.rectangle(card, (0, 0), (499, 299), (0, 0, 0), 4)</code>. 테두리는 마지막에 그려야 띠에 가려지지 않습니다.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

card = np.full((300, 500, 3), 230, np.uint8)
name = 'Gil-dong Hong'

cv.rectangle(card, (0, 0), (499, 70), (200, 100, 0), -1)
cv.putText(card, 'HELLO', (180, 50), cv.FONT_HERSHEY_DUPLEX, 1.4, (255, 255, 255), 2, cv.LINE_AA)

# 이름을 가운데 정렬: 글자 너비를 구해 x 위치 계산
(tw, th), _ = cv.getTextSize(name, cv.FONT_HERSHEY_SIMPLEX, 1.5, 3)
x = (500 - tw) // 2
cv.putText(card, name, (x, 190), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3, cv.LINE_AA)

cv.rectangle(card, (0, 0), (499, 299), (0, 0, 0), 4)

cv.imshow('name tag', card)
`,
      },
    ],
    quiz: [
      { q: 'OpenCV 이미지 좌표계에서 y 값이 커지면 점은 어느 방향으로 이동하나요?', options: ['위쪽', '아래쪽', '왼쪽', '오른쪽'], answer: 1, explain: '원점 (0,0)은 왼쪽 위이고 y는 아래로 갈수록 커집니다.' },
      { q: 'cv.circle(img, (100, 100), 50, (0, 255, 0), -1) 의 결과는?', options: ['두께 1의 초록 원', '속이 채워진 초록 원', '속이 채워진 빨간 원', '오류 발생'], answer: 1, explain: 'thickness 에 -1 을 주면 도형 내부를 채웁니다. (0, 255, 0) 은 BGR 기준 초록입니다.' },
      { q: 'cv.polylines 에 넘기는 점 배열에 대한 설명으로 틀린 것은?', options: ['int32 자료형을 사용한다', 'reshape((-1, 1, 2)) 로 모양을 맞춘다', '[pts] 처럼 리스트로 감싸 전달한다', '점은 (y, x) 순서로 적는다'], answer: 3, explain: '그리기 함수의 점은 모두 (x, y) 순서입니다.' },
      { q: 'cv.putText 의 org 인자가 가리키는 위치는?', options: ['글자의 왼쪽 위', '글자의 왼쪽 아래(기준선)', '글자의 중심', '이미지의 중심'], answer: 1, explain: 'org 는 텍스트 문자열의 왼쪽 아래 기준점입니다. 그래서 y를 너무 작게 주면 글자가 위로 잘립니다.' },
      { q: 'cv.ellipse(img, (256,256), (100,50), 0, 0, 180, 255, -1) 이 그리는 모양은?', options: ['위쪽 반 타원', '아래쪽 반 타원', '온전한 타원', '왼쪽 반 타원'], answer: 1, explain: '각도 0°는 오른쪽, 90°는 아래쪽이므로 0°~180°는 시계 방향으로 아래쪽 절반입니다.' },
    ],
  },
  /* =====================================================================
   * w1-5 마우스로 그리기 (페인트 브러시)
   * ===================================================================== */
  {
    id: 'w1-5',
    summary: '마우스 이벤트를 처리하는 콜백 함수를 만들어, 이미지 창을 클릭·드래그해 그림을 그리는 간단한 페인트 프로그램을 만듭니다. 웹 환경에 맞게 모드 전환을 우클릭/트랙바로 바꿔 봅니다.',
    goals: [
      '콜백(callback) 함수의 개념과 마우스 콜백의 인자(event, x, y, flags, param)를 설명할 수 있다',
      'cv.setMouseCallback()으로 창에 마우스 이벤트 처리 함수를 연결할 수 있다',
      '더블클릭·드래그 이벤트를 구분해 원과 사각형을 그릴 수 있다',
      'global 상태 변수와 우클릭/트랙바로 그리기 모드를 전환할 수 있다',
    ],
    schedule: [['도입 · 콜백이란?', 5], ['마우스 이벤트 종류', 8], ['더블클릭으로 원 그리기', 10], ['드래그 그리기와 모드 전환', 15], ['실습·퀴즈', 12]],
    blocks: [
      { type: 'text', html: `<h3>1. 콜백(callback) 함수란?</h3>
<p>지금까지의 코드는 위에서 아래로 한 번 실행되고 끝났습니다. 하지만 마우스 클릭은 <b>언제 일어날지 모릅니다</b>. 그래서 “클릭이 일어나면 이 함수를 불러 주세요”라고 <b>함수를 미리 등록</b>해 두는데, 이렇게 나중에 호출되는 함수를 <b>콜백(callback) 함수</b>라고 합니다.
식당에서 진동벨을 받아 두면 음식이 나왔을 때 알려주는 것과 비슷합니다.</p>
<p>OpenCV 마우스 콜백은 반드시 다음 5개 인자를 받는 모양이어야 합니다.</p>
<p><code>def on_mouse(event, x, y, flags, param):</code></p>
<ul>
<li><code>event</code>: 무슨 일이 일어났는지 (왼쪽 버튼 누름, 이동, 더블클릭 …) — <code>cv.EVENT_...</code> 상수와 비교</li>
<li><code>x, y</code>: 이벤트가 일어난 이미지 좌표</li>
<li><code>flags</code>: 이벤트 순간 눌려 있던 버튼·키(Ctrl, Shift) 정보</li>
<li><code>param</code>: 등록할 때 넘긴 추가 데이터 (<code>cv.setMouseCallback(창이름, 함수, param)</code>)</li>
</ul>` },
      { type: 'code', title: '예제 1 · 사용 가능한 마우스 이벤트 목록 출력 (튜토리얼)', code: String.raw`
import cv2 as cv

# cv 모듈 안의 이름 중 'EVENT' 가 들어간 것만 모으기 (리스트 컴프리헨션)
events = [i for i in dir(cv) if 'EVENT' in i]
print(events)

# 각 상수의 실제 숫자 값도 확인
for name in events:
    print(name, '=', getattr(cv, name))
`, desc: '<p><code>dir(cv)</code> 는 cv 모듈에 들어 있는 모든 이름 목록입니다. 이벤트는 사실 숫자이고, 코드에서는 읽기 쉽도록 이름 상수를 씁니다.</p>' },
      { type: 'table', head: ['이벤트 / 플래그', '값', '언제'],
        rows: [
          ['<code>cv.EVENT_MOUSEMOVE</code>', '0', '마우스가 움직일 때 (아주 자주 발생)'],
          ['<code>cv.EVENT_LBUTTONDOWN</code> / <code>LBUTTONUP</code>', '1 / 4', '왼쪽 버튼 누름 / 뗌'],
          ['<code>cv.EVENT_RBUTTONDOWN</code> / <code>RBUTTONUP</code>', '2 / 5', '오른쪽 버튼 누름 / 뗌'],
          ['<code>cv.EVENT_LBUTTONDBLCLK</code>', '7', '왼쪽 버튼 더블클릭'],
          ['<code>cv.EVENT_FLAG_LBUTTON</code>', '1', '(flags) 왼쪽 버튼이 눌린 상태로 이동 중'],
          ['<code>cv.EVENT_FLAG_CTRLKEY</code> / <code>SHIFTKEY</code>', '8 / 16', '(flags) Ctrl / Shift 키를 누른 상태'],
        ] },
      { type: 'code', title: '튜토리얼 원본 · 더블클릭한 곳에 원 그리기 (데스크톱용)', norun: true, code: String.raw`
import numpy as np
import cv2 as cv

# 마우스 콜백 함수
def draw_circle(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDBLCLK:
        cv.circle(img, (x, y), 100, (255, 0, 0), -1)

# 검은 이미지와 창을 만들고 콜백 연결
img = np.zeros((512, 512, 3), np.uint8)
cv.namedWindow('image')
cv.setMouseCallback('image', draw_circle)

while(1):
    cv.imshow('image', img)             # 계속 다시 그려야 변화가 보임
    if cv.waitKey(20) & 0xFF == 27:     # ESC 키로 종료
        break
cv.destroyAllWindows()
` },
      { type: 'text', html: `<h3>2. 웹 환경에서의 마우스 콜백</h3>
<p>데스크톱 코드는 <code>while</code> 루프로 <b>계속 imshow</b> 해서 바뀐 그림을 보여줍니다. 웹 환경은 이 부분을 대신 해 줍니다.</p>
<ol>
<li><b>창을 먼저 만든다</b>: <code>cv.imshow('image', img)</code> — 결과 패널에 캔버스가 생깁니다.</li>
<li><b>콜백을 연결한다</b>: <code>cv.setMouseCallback('image', draw_circle)</code></li>
<li>캔버스에서 마우스 이벤트가 생기면 콜백이 호출되고, <b>콜백이 끝나면 모든 창이 자동으로 다시 그려집니다</b>.</li>
</ol>
<p>그래서 콜백 안에서는 <b>img 배열을 제자리에서 수정</b>하기만 하면 됩니다(<code>cv.circle(img, ...)</code> 처럼). 반대로 <code>img = img.copy()</code> 처럼 <b>새 배열을 만들어 변수에 다시 대입하면</b> 창은 예전 배열을 계속 보여주므로 변화가 보이지 않습니다.</p>` },
      { type: 'code', title: '예제 2 · 더블클릭으로 원 그리기 (웹 버전)', code: String.raw`
import numpy as np
import cv2 as cv

def draw_circle(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDBLCLK:
        cv.circle(img, (x, y), 100, (255, 0, 0), -1)   # img 를 제자리 수정

img = np.zeros((512, 512, 3), np.uint8)
cv.imshow('image', img)                     # 1) 창(캔버스) 먼저 만들기
cv.setMouseCallback('image', draw_circle)   # 2) 콜백 연결 — while 루프는 필요 없음
print('image 창을 더블클릭해 보세요!')
`, desc: '<p>원 반지름 100 을 20 으로 바꾸거나, 색을 <code>(0, 255, 255)</code> 로 바꿔 다시 실행해 보세요.</p>' },
      { type: 'code', title: '예제 3 · 이벤트 관찰하기: 클릭 위치의 픽셀값 출력 (param 사용)', code: String.raw`
import cv2 as cv

names = {
    cv.EVENT_LBUTTONDOWN: 'LBUTTONDOWN', cv.EVENT_LBUTTONUP: 'LBUTTONUP',
    cv.EVENT_RBUTTONDOWN: 'RBUTTONDOWN', cv.EVENT_RBUTTONUP: 'RBUTTONUP',
    cv.EVENT_LBUTTONDBLCLK: 'LBUTTONDBLCLK',
}

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_MOUSEMOVE:
        return                                  # 이동 이벤트는 너무 많아서 무시
    name = names.get(event, str(event))
    b, g, r = param[y, x]                       # param 으로 받은 이미지의 픽셀 (행 y, 열 x)
    print(name, '좌표 =', (x, y), 'BGR =', (int(b), int(g), int(r)), 'flags =', flags)
    if event == cv.EVENT_LBUTTONDOWN:
        cv.circle(param, (x, y), 4, (0, 255, 255), -1)   # 클릭한 곳 표시

img = cv.imread('messi5.jpg')
cv.imshow('messi', img)
cv.setMouseCallback('messi', on_mouse, img)     # 세 번째 인자 → 콜백의 param
print('messi 창을 클릭/우클릭/더블클릭하며 콘솔을 확인하세요.')
`, desc: '<p>Ctrl 이나 Shift 를 누른 채 클릭하면 flags 값이 어떻게 달라지는지도 확인해 보세요. 더블클릭하면 LBUTTONDOWN 과 LBUTTONDBLCLK 가 함께 발생합니다.</p>' },
      { type: 'text', html: `<h3>3. 드래그로 그리기: 상태 변수</h3>
<p>튜토리얼의 두 번째 예제는 진짜 그림판처럼 <b>드래그</b>로 사각형이나 원을 그립니다. 드래그는 이벤트 하나가 아니라 <b>누름 → 이동(여러 번) → 뗌</b>의 흐름이므로, 콜백이 호출될 때마다 “지금 버튼이 눌려 있는지”를 기억해야 합니다. 이런 값을 <b>상태 변수</b>라고 합니다.</p>
<ul>
<li><code>drawing</code>: 왼쪽 버튼이 눌려 있으면 True</li>
<li><code>ix, iy</code>: 버튼을 누른 시작 위치 (사각형의 한 꼭짓점)</li>
<li><code>mode</code>: True 면 사각형, False 면 원(브러시) 모드</li>
</ul>
<p>콜백 안에서 이 변수들에 <b>값을 대입</b>하므로 <code>global drawing, mode, ix, iy</code> 선언이 꼭 필요합니다. 빠뜨리면 <code>UnboundLocalError</code> 가 납니다.</p>
<p>튜토리얼은 키보드 <b>m</b> 키로 모드를 바꾸지만, 웹 환경에서는 <code>waitKey</code> 로 키를 받을 수 없습니다. 그래서 <b>우클릭</b> 또는 <b>트랙바 스위치</b>로 모드를 바꾸도록 고칩니다.</p>` },
      { type: 'code', title: '튜토리얼 원본 · 드래그로 사각형/원 그리기, m 키로 모드 전환 (데스크톱용)', norun: true, code: String.raw`
import numpy as np
import cv2 as cv

drawing = False   # 마우스 버튼이 눌려 있으면 True
mode = True       # True 면 사각형, 'm' 키를 누르면 곡선(원) 모드로 전환
ix, iy = -1, -1

def draw_circle(event, x, y, flags, param):
    global ix, iy, drawing, mode
    if event == cv.EVENT_LBUTTONDOWN:
        drawing = True
        ix, iy = x, y
    elif event == cv.EVENT_MOUSEMOVE:
        if drawing == True:
            if mode == True:
                cv.rectangle(img, (ix, iy), (x, y), (0, 255, 0), -1)
            else:
                cv.circle(img, (x, y), 5, (0, 0, 255), -1)
    elif event == cv.EVENT_LBUTTONUP:
        drawing = False
        if mode == True:
            cv.rectangle(img, (ix, iy), (x, y), (0, 255, 0), -1)
        else:
            cv.circle(img, (x, y), 5, (0, 0, 255), -1)

img = np.zeros((512, 512, 3), np.uint8)
cv.namedWindow('image')
cv.setMouseCallback('image', draw_circle)

while(1):
    cv.imshow('image', img)
    k = cv.waitKey(1) & 0xFF
    if k == ord('m'):
        mode = not mode
    elif k == 27:
        break
cv.destroyAllWindows()
` },
      { type: 'code', title: '예제 4 · 웹 버전: 우클릭으로 모드 전환', code: String.raw`
import numpy as np
import cv2 as cv

drawing = False   # 왼쪽 버튼이 눌려 있는가
mode = True       # True: 사각형, False: 원 브러시
ix, iy = -1, -1   # 드래그 시작점

def draw(event, x, y, flags, param):
    global ix, iy, drawing, mode
    if event == cv.EVENT_RBUTTONDOWN:              # 'm' 키 대신 우클릭
        mode = not mode
        print('모드 변경 →', '사각형' if mode else '원 브러시')
    elif event == cv.EVENT_LBUTTONDOWN:
        drawing = True
        ix, iy = x, y
    elif event == cv.EVENT_MOUSEMOVE:
        if drawing:
            if mode:
                cv.rectangle(img, (ix, iy), (x, y), (0, 255, 0), -1)
            else:
                cv.circle(img, (x, y), 5, (0, 0, 255), -1)
    elif event == cv.EVENT_LBUTTONUP:
        drawing = False
        if mode:
            cv.rectangle(img, (ix, iy), (x, y), (0, 255, 0), -1)
        else:
            cv.circle(img, (x, y), 5, (0, 0, 255), -1)

img = np.zeros((512, 512, 3), np.uint8)
cv.imshow('image', img)
cv.setMouseCallback('image', draw)
print('드래그: 그리기 / 우클릭: 사각형 ↔ 원 브러시 모드 전환')
`, desc: '<p>사각형 모드로 드래그하면 이동할 때마다 사각형이 계속 덧그려져 “부채꼴” 자국이 남습니다(튜토리얼도 같음). 깔끔한 선택 상자를 만드는 방법은 실습 3에서 다룹니다.</p>' },
      { type: 'code', title: '예제 5 · 트랙바 스위치로 모드와 브러시 크기 바꾸기', code: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

img = np.zeros((512, 512, 3), np.uint8)
cv.imshow('image', img)

# 스위치: 0 = 원 브러시, 1 = 사각형  /  브러시 크기 1~30
cv.createTrackbar('rect mode', 'image', 1, 1, nothing)
cv.createTrackbar('brush', 'image', 5, 30, nothing)

drawing = False
ix, iy = -1, -1

def draw(event, x, y, flags, param):
    global ix, iy, drawing
    rect_mode = cv.getTrackbarPos('rect mode', 'image') == 1   # 매번 트랙바에서 읽음
    size = max(1, cv.getTrackbarPos('brush', 'image'))
    if event == cv.EVENT_LBUTTONDOWN:
        drawing = True
        ix, iy = x, y
    elif event == cv.EVENT_MOUSEMOVE and drawing and not rect_mode:
        cv.circle(img, (x, y), size, (0, 0, 255), -1)
    elif event == cv.EVENT_LBUTTONUP:
        drawing = False
        if rect_mode:
            cv.rectangle(img, (ix, iy), (x, y), (0, 255, 0), size)   # 뗄 때 한 번만 그림
        else:
            cv.circle(img, (x, y), size, (0, 0, 255), -1)
    elif event == cv.EVENT_RBUTTONDOWN:
        img[:] = 0                                                  # 우클릭: 전체 지우기
        print('캔버스를 지웠습니다.')

cv.setMouseCallback('image', draw)
`, desc: '<p>이번에는 사각형을 <b>버튼을 뗄 때 한 번만</b> 그려서 자국이 남지 않습니다. <code>img[:] = 0</code> 은 배열을 제자리에서 0으로 채우므로 창에 바로 반영됩니다.</p>' },
      { type: 'tip', html: `<p><b>flags 활용</b>: <code>if flags &amp; cv.EVENT_FLAG_LBUTTON:</code> 은 “왼쪽 버튼을 누른 채 이동 중”을 뜻합니다. 상태 변수 없이도 드래그를 알 수 있어요.
<code>flags &amp; cv.EVENT_FLAG_SHIFTKEY</code> 로 Shift+드래그를 지우개로 만드는 식의 응용도 가능합니다. (<code>&amp;</code> 는 비트 AND 연산자)</p>` },
      { type: 'text', html: `<h3>4. 정리: 마우스 인터랙션 코드의 기본 틀</h3>
<p>앞으로 마우스를 쓰는 프로그램(영역 선택, 점 찍어 원근 변환, 색 찍어 추적 등)은 거의 모두 아래 틀을 따릅니다.</p>
<ol>
<li><b>데이터 준비</b>: 그릴 이미지(<code>img</code>), 필요하면 복원용 원본(<code>base</code>)과 상태 변수(<code>drawing</code>, <code>ix, iy</code>, 점 목록)</li>
<li><b>콜백 정의</b>: <code>def on_mouse(event, x, y, flags, param):</code> 안에서 <code>if/elif</code> 로 이벤트를 나눠 처리. 상태 변수에 대입하면 <code>global</code></li>
<li><b>창 만들기</b>: <code>cv.imshow('창이름', img)</code></li>
<li><b>연결</b>: <code>cv.setMouseCallback('창이름', on_mouse)</code></li>
</ol>
<p>데스크톱에서는 여기에 <code>while</code> + <code>imshow</code> + <code>waitKey</code> 루프만 덧붙이면 똑같이 동작합니다. 키보드 대신 쓸 수 있는 입력은 <b>우클릭, Ctrl/Shift + 클릭(flags), 트랙바</b>라는 것도 기억해 두세요.</p>` },
      { type: 'warn', html: `<p><b>자주 하는 실수</b></p>
<ul>
<li>콜백 인자를 4개만 쓰는 경우 → 반드시 <code>(event, x, y, flags, param)</code> 5개</li>
<li><code>cv.setMouseCallback('image', draw())</code> 처럼 <b>괄호를 붙여</b> 함수를 호출해 버리는 경우 → 함수 이름만 <code>draw</code></li>
<li>창 이름 오타: <code>imshow('image')</code> 와 <code>setMouseCallback('Image')</code> 는 다른 창</li>
<li>콜백 안에서 <code>img = ...</code> 로 새 배열을 대입 → 창에 반영되지 않음. <code>img[:] = ...</code> 로 제자리 수정</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 점 찍고 선으로 잇기',
        desc: `<p>흰 캔버스를 왼쪽 클릭할 때마다 그 위치에 빨간 점(반지름 4)을 찍고, <b>직전에 찍은 점과 선(파랑, 두께 2)으로 연결</b>하세요. 클릭 좌표는 콘솔에 출력합니다. 우클릭하면 캔버스와 점 목록을 모두 지웁니다.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

img = np.full((400, 400, 3), 255, np.uint8)
points = []    # 클릭한 좌표들

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        print('클릭:', x, y)
        # TODO: points 에 (x, y) 추가
        # TODO: 빨간 점 그리기
        # TODO: 점이 2개 이상이면 points[-2] 와 points[-1] 을 선으로 잇기
    elif event == cv.EVENT_RBUTTONDOWN:
        # TODO: img 를 흰색으로 지우고 points 비우기
        pass

cv.imshow('dots', img)
cv.setMouseCallback('dots', on_mouse)
`,
        hint: `<p><code>points.append((x, y))</code>, <code>cv.circle(img, (x, y), 4, (0, 0, 255), -1)</code>, <code>if len(points) &gt;= 2: cv.line(img, points[-2], points[-1], (255, 0, 0), 2)</code>. 지우기는 <code>img[:] = 255</code> 와 <code>points.clear()</code> — 둘 다 제자리 수정이라 global 이 필요 없습니다.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

img = np.full((400, 400, 3), 255, np.uint8)
points = []

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        print('클릭:', x, y)
        points.append((x, y))
        if len(points) >= 2:
            cv.line(img, points[-2], points[-1], (255, 0, 0), 2, cv.LINE_AA)
        cv.circle(img, (x, y), 4, (0, 0, 255), -1)
    elif event == cv.EVENT_RBUTTONDOWN:
        img[:] = 255
        points.clear()
        print('지웠습니다.')

cv.imshow('dots', img)
cv.setMouseCallback('dots', on_mouse)
`,
      },
      {
        title: '실습 2 · 사진 위 형광펜과 원본 복원',
        desc: `<p><code>messi5.jpg</code> 위에서 <b>왼쪽 버튼을 누른 채 드래그</b>하면 노란색 형광펜(반지름 6 원)이 칠해지고, <b>우클릭</b>하면 원본 사진으로 되돌아가게 하세요. 상태 변수 대신 <code>flags</code> 를 사용해 보세요.</p>`,
        starter: String.raw`
import cv2 as cv

original = cv.imread('messi5.jpg')   # 복원용 원본
img = original.copy()                # 창에 보여줄(그릴) 이미지

def pen(event, x, y, flags, param):
    # TODO: 왼쪽 버튼 누름 또는 (이동 중이면서 flags 에 왼쪽 버튼 플래그가 있으면) 노란 원 그리기
    if event == cv.EVENT_LBUTTONDOWN:
        pass
    # TODO: 우클릭이면 img 를 original 로 되돌리기 (제자리 수정!)

cv.imshow('pen', img)
cv.setMouseCallback('pen', pen)
`,
        hint: `<p>조건: <code>event == cv.EVENT_LBUTTONDOWN or (event == cv.EVENT_MOUSEMOVE and flags &amp; cv.EVENT_FLAG_LBUTTON)</code>. 복원은 <code>img[:] = original</code> — <code>img = original.copy()</code> 로 쓰면 창에 반영되지 않습니다.</p>`,
        solution: String.raw`
import cv2 as cv

original = cv.imread('messi5.jpg')
img = original.copy()

def pen(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN or (event == cv.EVENT_MOUSEMOVE and flags & cv.EVENT_FLAG_LBUTTON):
        cv.circle(img, (x, y), 6, (0, 255, 255), -1)
    elif event == cv.EVENT_RBUTTONDOWN:
        img[:] = original          # 배열 내용만 원본으로 덮어쓰기
        print('원본으로 복원')

cv.imshow('pen', img)
cv.setMouseCallback('pen', pen)
`,
      },
      {
        title: '실습 3 · 드래그로 영역 선택하기 (ROI 선택기)',
        desc: `<p><code>messi5.jpg</code> 에서 드래그하는 동안 <b>초록 선택 상자</b>가 자국 없이 따라다니고, 버튼을 떼면 선택한 영역을 잘라 <code>roi</code> 창에 표시하고 좌표를 출력하세요. (다음 교시들에서 배울 ROI의 미리보기!)</p>`,
        starter: String.raw`
import cv2 as cv

base = cv.imread('messi5.jpg')   # 깨끗한 원본
img = base.copy()                # 상자를 그릴 화면용 이미지
dragging = False
ix, iy = -1, -1

def select(event, x, y, flags, param):
    global dragging, ix, iy
    if event == cv.EVENT_LBUTTONDOWN:
        dragging = True
        ix, iy = x, y
    elif event == cv.EVENT_MOUSEMOVE and dragging:
        # TODO: 자국이 남지 않도록 img 를 base 로 덮어쓴 뒤 상자 그리기
        cv.rectangle(img, (ix, iy), (x, y), (0, 255, 0), 2)
    elif event == cv.EVENT_LBUTTONUP:
        dragging = False
        x1, x2 = sorted([ix, x])     # 어느 방향으로 드래그해도 작은 값이 먼저
        y1, y2 = sorted([iy, y])
        print('선택 영역:', (x1, y1), '~', (x2, y2))
        # TODO: base 에서 [y1:y2, x1:x2] 를 잘라 크기가 0이 아니면 'roi' 창에 표시

cv.imshow('select', img)
cv.setMouseCallback('select', select)
`,
        hint: `<p>매번 <code>img[:] = base</code> 로 깨끗한 원본을 다시 깔고 상자를 그리면 이전 상자가 지워집니다. 자르기: <code>roi = base[y1:y2, x1:x2]</code>, <code>if roi.size &gt; 0: cv.imshow('roi', roi)</code></p>`,
        solution: String.raw`
import cv2 as cv

base = cv.imread('messi5.jpg')
img = base.copy()
dragging = False
ix, iy = -1, -1

def select(event, x, y, flags, param):
    global dragging, ix, iy
    if event == cv.EVENT_LBUTTONDOWN:
        dragging = True
        ix, iy = x, y
    elif event == cv.EVENT_MOUSEMOVE and dragging:
        img[:] = base                                    # 이전 상자 지우기
        cv.rectangle(img, (ix, iy), (x, y), (0, 255, 0), 2)
    elif event == cv.EVENT_LBUTTONUP:
        dragging = False
        x1, x2 = sorted([ix, x])
        y1, y2 = sorted([iy, y])
        img[:] = base
        cv.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        print('선택 영역:', (x1, y1), '~', (x2, y2))
        roi = base[y1:y2, x1:x2]
        if roi.size > 0:
            cv.imshow('roi', roi)
            print('ROI 크기:', roi.shape)

cv.imshow('select', img)
cv.setMouseCallback('select', select)
`,
      },
    ],
    quiz: [
      { q: 'OpenCV 마우스 콜백 함수의 올바른 인자 목록은?', options: ['(x, y)', '(event, x, y)', '(event, x, y, flags, param)', '(img, event, x, y)'], answer: 2, explain: '마우스 콜백은 event, x, y, flags, param 다섯 개 인자를 받아야 합니다.' },
      { q: '왼쪽 버튼 더블클릭을 나타내는 상수는?', options: ['cv.EVENT_LBUTTONDOWN', 'cv.EVENT_LBUTTONDBLCLK', 'cv.EVENT_FLAG_LBUTTON', 'cv.EVENT_MOUSEMOVE'], answer: 1, explain: 'DBLCLK 가 더블클릭입니다. EVENT_FLAG_LBUTTON 은 flags 인자에서 “버튼이 눌린 상태”를 나타내는 플래그입니다.' },
      { q: '콜백 안에서 drawing = True 처럼 함수 밖 변수에 값을 대입할 때 필요한 것은?', options: ['return drawing', 'global drawing', 'param=drawing', 'import drawing'], answer: 1, explain: '함수 안에서 바깥 변수에 대입하려면 global 선언이 필요합니다. (img[:] = 0 같은 제자리 수정은 대입이 아니므로 필요 없습니다.)' },
      { q: '웹 환경에서 우클릭하면 이미지를 지우도록 할 때, 창에 바로 반영되는 코드는?', options: ['img = np.zeros_like(img)', 'img[:] = 0', 'img = None', 'cv.destroyAllWindows()'], answer: 1, explain: 'img[:] = 0 은 창이 보고 있는 같은 배열을 제자리에서 수정합니다. 새 배열을 대입하면 창은 예전 배열을 계속 보여줍니다.' },
    ],
  },

  /* =====================================================================
   * w1-6 트랙바로 만드는 컬러 팔레트
   * ===================================================================== */
  {
    id: 'w1-6',
    summary: '트랙바(슬라이더)로 값을 조절하는 방법을 배웁니다. 튜토리얼의 R·G·B 컬러 팔레트를 웹 환경에 맞게 두 가지 방식(onChange 제자리 수정 / process에서 읽기)으로 만들고, 트랙바로 입력 이미지의 밝기·대비·이진화 기준을 실시간 조절합니다.',
    goals: [
      'cv.createTrackbar()의 인자(이름, 창, 초기값, 최대값, onChange)를 설명할 수 있다',
      'onChange 콜백에서 이미지를 제자리 수정하는 방식으로 컬러 팔레트를 만들 수 있다',
      'process(frame) 안에서 cv.getTrackbarPos()로 값을 읽어 이미지를 실시간 조절할 수 있다',
      '정수만 주는 트랙바 값을 음수·실수 범위로 변환해 사용할 수 있다',
    ],
    schedule: [['도입 · 트랙바란?', 5], ['createTrackbar · getTrackbarPos', 10], ['컬러 팔레트 두 가지 방식', 13], ['트랙바로 이미지 조절', 12], ['실습·퀴즈', 10]],
    blocks: [
      { type: 'text', html: `<h3>1. 트랙바(Trackbar)란?</h3>
<p>영상처리에서는 “임계값을 100으로 할까 120으로 할까?” 처럼 <b>숫자를 바꿔 가며 결과를 비교</b>할 일이 아주 많습니다. 매번 코드를 고치고 다시 실행하는 대신,
<b>트랙바(슬라이더)</b>를 만들어 끌면서 결과를 바로 확인하면 훨씬 빠르게 좋은 값을 찾을 수 있습니다. 3주차 Canny 엣지, 4~5주차 프로젝트 튜닝에서도 계속 쓰입니다.</p>
<p><code>cv.createTrackbar(trackbarName, windowName, value, count, onChange)</code></p>` },
      { type: 'table', head: ['함수 / 인자', '의미'],
        rows: [
          ['<code>trackbarName</code>', '트랙바 이름 (슬라이더 옆에 표시, 값을 읽을 때도 이 이름 사용)'],
          ['<code>windowName</code>', '트랙바가 붙을 창 이름'],
          ['<code>value</code>', '처음 위치(초기값)'],
          ['<code>count</code>', '최대값. 최소값은 항상 <b>0</b>, 값은 <b>정수</b>만'],
          ['<code>onChange</code>', '값이 바뀔 때마다 호출되는 함수. 새 위치(정수) 하나를 인자로 받음. 할 일이 없으면 <code>def nothing(x): pass</code>'],
          ['<code>cv.getTrackbarPos(tb, win)</code>', '현재 위치(정수) 읽기'],
          ['<code>cv.setTrackbarPos(tb, win, pos)</code>', '코드로 위치 바꾸기'],
        ] },
      { type: 'code', title: '튜토리얼 원본 · RGB 컬러 팔레트 (데스크톱용)', norun: true, code: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

# 검은 이미지와 창 만들기
img = np.zeros((300, 512, 3), np.uint8)
cv.namedWindow('image')

# 색을 바꿀 트랙바 3개
cv.createTrackbar('R', 'image', 0, 255, nothing)
cv.createTrackbar('G', 'image', 0, 255, nothing)
cv.createTrackbar('B', 'image', 0, 255, nothing)

# ON/OFF 스위치용 트랙바 (최대값 1)
switch = '0 : OFF \n1 : ON'
cv.createTrackbar(switch, 'image', 0, 1, nothing)

while(1):
    cv.imshow('image', img)
    k = cv.waitKey(1) & 0xFF
    if k == 27:
        break

    # 네 트랙바의 현재 위치 읽기
    r = cv.getTrackbarPos('R', 'image')
    g = cv.getTrackbarPos('G', 'image')
    b = cv.getTrackbarPos('B', 'image')
    s = cv.getTrackbarPos(switch, 'image')

    if s == 0:
        img[:] = 0
    else:
        img[:] = [b, g, r]

cv.destroyAllWindows()
`, desc: '<p>OpenCV에는 버튼이 없어서 <b>최대값이 1인 트랙바</b>를 ON/OFF 스위치로 씁니다. 데스크톱 코드는 while 루프에서 계속 트랙바 값을 읽어 이미지를 칠합니다.</p>' },
      { type: 'text', html: `<h3>2. 웹 환경에서 트랙바 쓰는 두 가지 방법</h3>
<p>웹 환경에는 while 루프가 없으므로, “언제 트랙바 값을 읽을까?”를 바꿔야 합니다.</p>
<ul>
<li><b>방법 A · onChange 에서 제자리 수정</b>: 값이 바뀔 때 호출되는 함수에서 모든 트랙바 값을 읽고 <code>img[:] = ...</code> 로 칠합니다. 콜백이 끝나면 창이 자동으로 갱신됩니다. 튜토리얼과 가장 닮은 방식입니다.</li>
<li><b>방법 B · process(frame) 에서 읽기 (권장)</b>: 트랙바는 <code>nothing</code> 으로 만들고, <code>process</code> 안에서 <code>cv.getTrackbarPos()</code> 로 읽습니다. 트랙바를 움직이면 process 가 다시 실행되고, 웹캠이면 매 프레임 최신 값이 반영됩니다. <b>입력 이미지/웹캠을 조절</b>할 때 이 방식을 씁니다.</li>
</ul>
<p>어느 방법이든 <b>창을 먼저 만들고</b>(<code>cv.imshow</code> 또는 <code>cv.namedWindow</code>) 그 창 이름으로 트랙바를 붙입니다. 슬라이더는 오른쪽 결과 패널에 나타납니다.</p>` },
      { type: 'code', title: '예제 1 · 컬러 팔레트 — 방법 A (onChange 에서 제자리 수정)', code: String.raw`
import numpy as np
import cv2 as cv

img = np.zeros((300, 512, 3), np.uint8)
cv.imshow('image', img)                   # 창을 먼저 만들기

switch = '0:OFF 1:ON'                     # 스위치 트랙바 이름

def update(x):
    # 어느 트랙바가 바뀌든 네 값을 모두 읽어서 다시 칠함
    r = cv.getTrackbarPos('R', 'image')
    g = cv.getTrackbarPos('G', 'image')
    b = cv.getTrackbarPos('B', 'image')
    s = cv.getTrackbarPos(switch, 'image')
    if s == 0:
        img[:] = 0                        # 제자리 수정 → 창 자동 갱신
    else:
        img[:] = [b, g, r]                # OpenCV 는 BGR 순서!

cv.createTrackbar('R', 'image', 0, 255, update)
cv.createTrackbar('G', 'image', 0, 255, update)
cv.createTrackbar('B', 'image', 0, 255, update)
cv.createTrackbar(switch, 'image', 0, 1, update)
print('스위치를 1 로 올리고 R, G, B 슬라이더를 움직여 보세요.')
` },
      { type: 'code', title: '예제 2 · 컬러 팔레트 — 방법 B (process 에서 읽기)', code: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

palette = np.zeros((150, 512, 3), np.uint8)
cv.imshow('palette', palette)             # 트랙바를 붙일 창
cv.createTrackbar('R', 'palette', 0, 255, nothing)
cv.createTrackbar('G', 'palette', 128, 255, nothing)
cv.createTrackbar('B', 'palette', 255, 255, nothing)
cv.createTrackbar('switch', 'palette', 1, 1, nothing)

def process(frame):
    r = cv.getTrackbarPos('R', 'palette')
    g = cv.getTrackbarPos('G', 'palette')
    b = cv.getTrackbarPos('B', 'palette')
    s = cv.getTrackbarPos('switch', 'palette')
    color = (b, g, r) if s == 1 else (0, 0, 0)

    palette[:] = color                    # 팔레트 창도 함께 갱신
    out = frame.copy()                    # 입력 이미지 위에 색 견본 붙이기
    cv.rectangle(out, (10, 10), (110, 110), color, -1)
    cv.rectangle(out, (10, 10), (110, 110), (255, 255, 255), 2)
    cv.putText(out, 'R%d G%d B%d' % (r, g, b), (10, 140), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    return out
`, desc: '<p>입력 소스를 웹캠이나 🎞️ 동영상으로 바꾸면 영상 위에 선택한 색 견본이 계속 표시됩니다. 트랙바 초기값(0, 128, 255)도 바꿔 보세요.</p>' },
      { type: 'text', html: `<h3>3. 트랙바로 입력 이미지 조절하기</h3>
<p>트랙바의 진짜 쓸모는 <b>이미지 처리 파라미터 튜닝</b>입니다. 그런데 트랙바는 <b>0 이상 정수</b>만 줍니다. 필요한 범위는 간단한 계산으로 바꿔 씁니다.</p>
<ul>
<li><b>음수가 필요할 때</b> (밝기 -100 ~ +100): 트랙바 0~200, 초기값 100 → <code>beta = pos - 100</code></li>
<li><b>실수가 필요할 때</b> (대비 0.0 ~ 3.0): 트랙바 0~30 → <code>alpha = pos / 10</code></li>
<li><b>0이 되면 안 될 때</b> (크기 등): <code>max(1, pos)</code></li>
</ul>
<p><code>cv.convertScaleAbs(src, alpha=a, beta=b)</code> 는 모든 픽셀에 <b>새 값 = |원래 값 × alpha + beta|</b> 를 계산하고 0~255로 잘라 uint8 로 돌려줍니다. alpha 는 대비, beta 는 밝기를 조절합니다.</p>` },
      { type: 'code', title: '예제 3 · 밝기 · 대비 조절', code: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')                                   # process 결과가 표시되는 창
cv.createTrackbar('brightness', 'result', 100, 200, nothing)   # 100 = 변화 없음
cv.createTrackbar('contrast x10', 'result', 10, 30, nothing)   # 10 = 1.0배

def process(frame):
    beta = cv.getTrackbarPos('brightness', 'result') - 100     # -100 ~ +100
    alpha = cv.getTrackbarPos('contrast x10', 'result') / 10   # 0.0 ~ 3.0
    out = cv.convertScaleAbs(frame, alpha=alpha, beta=beta)
    cv.putText(out, 'alpha=%.1f beta=%d' % (alpha, beta), (10, 30),
               cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    return out
`, desc: '<p>입력 소스를 어두운 사진, 웹캠, 🎞️ 동영상으로 바꿔 보고, 사진이 “하얗게 날아가는” 지점(255에서 잘림)을 관찰하세요.</p>' },
      { type: 'code', title: '예제 4 · 이진화 기준값(threshold) 조절', code: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('thresh', 'result', 127, 255, nothing)
cv.createTrackbar('invert', 'result', 0, 1, nothing)

def process(frame):
    t = cv.getTrackbarPos('thresh', 'result')
    inv = cv.getTrackbarPos('invert', 'result')
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    # 기준값보다 밝으면 255(흰색), 아니면 0(검정) — NumPy 비교 연산
    mask = gray > t                          # True/False 배열
    if inv == 1:
        mask = ~mask                         # 반전
    binary = mask.astype(np.uint8) * 255     # bool 은 표시 불가 → uint8 로 변환
    return gray, binary
`, desc: '<p>이것이 2주차에 배울 <b>임계처리(Thresholding)</b>의 원리입니다. <code>cv.threshold()</code> 함수가 같은 일을 더 빠르고 다양하게 해 줍니다.</p>' },
      { type: 'code', title: '예제 5 · 트랙바 색 + 마우스 브러시 = 그림판', code: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

canvas = np.full((400, 600, 3), 255, np.uint8)
cv.imshow('paint', canvas)
cv.createTrackbar('R', 'paint', 0, 255, nothing)
cv.createTrackbar('G', 'paint', 0, 255, nothing)
cv.createTrackbar('B', 'paint', 0, 255, nothing)
cv.createTrackbar('size', 'paint', 1, 30, nothing)
cv.setTrackbarPos('size', 'paint', 8)        # 코드로 초기 위치 변경
cv.setTrackbarPos('R', 'paint', 255)

def paint(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN or (event == cv.EVENT_MOUSEMOVE and flags & cv.EVENT_FLAG_LBUTTON):
        r = cv.getTrackbarPos('R', 'paint')
        g = cv.getTrackbarPos('G', 'paint')
        b = cv.getTrackbarPos('B', 'paint')
        size = max(1, cv.getTrackbarPos('size', 'paint'))
        cv.circle(canvas, (x, y), size, (b, g, r), -1)
    elif event == cv.EVENT_RBUTTONDOWN:
        canvas[:] = 255                       # 우클릭: 지우기

cv.setMouseCallback('paint', paint)
print('드래그로 그리기, 우클릭으로 지우기. 트랙바로 색과 굵기를 바꾸세요.')
`, desc: '<p>지난 교시의 마우스 콜백과 이번 교시의 트랙바를 합친 “미니 그림판”입니다. 4주차 웹캠 가상 페인터 프로젝트의 기초가 됩니다.</p>' },
      { type: 'warn', html: `<p><b>자주 하는 실수</b></p>
<ul>
<li><code>onChange</code> 자리에 <code>None</code> 을 넣음 → 반드시 함수(<code>nothing</code>)를 넣으세요.</li>
<li>트랙바를 만들기 <b>전에</b> <code>getTrackbarPos</code> 를 호출하거나, 이름·창 이름의 대소문자·공백이 다름 → “트랙바가 없습니다” 오류</li>
<li>트랙바 값으로 나눗셈을 할 때 0 이 될 수 있음 → <code>max(1, pos)</code></li>
</ul>` },
      { type: 'text', html: `<h3>4. 정리: 어떤 방식을 쓸까?</h3>
<p>아래 표처럼 <b>내가 만든 캔버스</b>를 바꿀 때는 방법 A, <b>입력 이미지나 웹캠 영상</b>을 조절할 때는 방법 B 가 자연스럽습니다.
데스크톱으로 옮길 때 방법 B 는 while 루프 안에서 <code>getTrackbarPos</code> 를 읽는 튜토리얼 원본 구조와 똑같아집니다. 그래서 이 과정에서는 <b>방법 B 를 기본</b>으로 사용합니다.</p>` },
      { type: 'table', head: ['', '방법 A · onChange 제자리 수정', '방법 B · process 에서 읽기'],
        rows: [
          ['트랙바 onChange', '이미지를 다시 계산하는 함수', '<code>nothing</code>'],
          ['값을 읽는 곳', 'onChange 함수 안', '<code>process(frame)</code> 안'],
          ['결과 반영', '배열 제자리 수정 → 창 자동 갱신', '<code>return</code> 한 이미지가 result 창에 표시'],
          ['어울리는 용도', '팔레트, 그림판처럼 “내가 만든 캔버스”', '입력 이미지·웹캠 영상의 파라미터 조절'],
        ] },
      { type: 'tip', html: `<p>트랙바 값은 <b>process 안에서 읽는 패턴</b>을 기억하세요. 모든 조절 가능한 값을 트랙바로 빼 두면, 코드를 고치지 않고도 조명·사진이 바뀔 때마다 최적 값을 금방 다시 찾을 수 있습니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 컬러/흑백 스위치',
        desc: `<p><code>result</code> 창에 <code>gray</code> 스위치 트랙바(0 또는 1)를 만들고, 1이면 흑백, 0이면 원본 컬러를 돌려주는 <code>process</code> 를 완성하세요.</p>`,
        starter: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
# TODO: 'gray' 트랙바 만들기 (초기값 0, 최대값 1)

def process(frame):
    s = 0   # TODO: cv.getTrackbarPos 로 'gray' 값 읽기
    if s == 1:
        return cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    return frame
`,
        hint: `<p><code>cv.createTrackbar('gray', 'result', 0, 1, nothing)</code>, <code>s = cv.getTrackbarPos('gray', 'result')</code></p>`,
        solution: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('gray', 'result', 0, 1, nothing)

def process(frame):
    s = cv.getTrackbarPos('gray', 'result')
    if s == 1:
        return cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    return frame
`,
      },
      {
        title: '실습 2 · B/G/R 채널 끄기 스위치',
        desc: `<p><code>B</code>, <code>G</code>, <code>R</code> 스위치 트랙바 3개(초기값 1)를 만들고, 스위치가 0인 채널은 0으로 만들어 돌려주세요. 예: R만 0이면 붉은 기가 빠진 청록색 이미지가 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('B', 'result', 1, 1, nothing)
# TODO: G, R 스위치도 만들기

def process(frame):
    out = frame.copy()
    if cv.getTrackbarPos('B', 'result') == 0:
        out[:, :, 0] = 0          # 0번 채널(B)을 0으로
    # TODO: G(1번 채널), R(2번 채널)도 같은 방식으로
    return out
`,
        hint: `<p>채널 번호는 B=0, G=1, R=2 입니다. <code>out[:, :, 2] = 0</code> 은 모든 픽셀의 빨강 성분을 0으로 만듭니다(다음 교시에서 자세히 배웁니다).</p>`,
        solution: String.raw`
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('B', 'result', 1, 1, nothing)
cv.createTrackbar('G', 'result', 1, 1, nothing)
cv.createTrackbar('R', 'result', 1, 1, nothing)

def process(frame):
    out = frame.copy()
    for i, name in enumerate(['B', 'G', 'R']):
        if cv.getTrackbarPos(name, 'result') == 0:
            out[:, :, i] = 0
    return out
`,
      },
      {
        title: '실습 3 · 색 견본 카드와 색상 코드',
        desc: `<p>R, G, B 트랙바로 고른 색으로 300×400 견본 카드를 칠하고, 가운데에 웹 색상 코드(예: <code>#FF8000</code>)를 글자로 쓰세요. 배경이 밝으면(R+G+B 합이 382 초과) 검은 글자, 어두우면 흰 글자로 표시합니다.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('R', 'result', 255, 255, nothing)
cv.createTrackbar('G', 'result', 128, 255, nothing)
cv.createTrackbar('B', 'result', 0, 255, nothing)

def process(frame):
    r = cv.getTrackbarPos('R', 'result')
    g = cv.getTrackbarPos('G', 'result')
    b = cv.getTrackbarPos('B', 'result')
    card = np.zeros((300, 400, 3), np.uint8)
    # TODO: card 를 (b, g, r) 로 칠하기

    code = '#%02X%02X%02X' % (r, g, b)     # 16진수 두 자리씩
    # TODO: 밝기에 따라 글자색 정하기
    text_color = (255, 255, 255)
    cv.putText(card, code, (90, 165), cv.FONT_HERSHEY_SIMPLEX, 1.5, text_color, 3, cv.LINE_AA)
    return card
`,
        hint: `<p><code>card[:] = (b, g, r)</code>. 글자색: <code>text_color = (0, 0, 0) if r + g + b &gt; 382 else (255, 255, 255)</code>. 이 process 는 입력 frame 을 사용하지 않아도 괜찮습니다.</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

def nothing(x):
    pass

cv.namedWindow('result')
cv.createTrackbar('R', 'result', 255, 255, nothing)
cv.createTrackbar('G', 'result', 128, 255, nothing)
cv.createTrackbar('B', 'result', 0, 255, nothing)

def process(frame):
    r = cv.getTrackbarPos('R', 'result')
    g = cv.getTrackbarPos('G', 'result')
    b = cv.getTrackbarPos('B', 'result')
    card = np.zeros((300, 400, 3), np.uint8)
    card[:] = (b, g, r)

    code = '#%02X%02X%02X' % (r, g, b)
    text_color = (0, 0, 0) if r + g + b > 382 else (255, 255, 255)
    cv.putText(card, code, (90, 165), cv.FONT_HERSHEY_SIMPLEX, 1.5, text_color, 3, cv.LINE_AA)
    return card
`,
      },
    ],
    quiz: [
      { q: 'cv.createTrackbar("T", "win", 50, 200, nothing) 로 만든 트랙바의 값 범위는?', options: ['50 ~ 200', '0 ~ 200', '0 ~ 50', '1 ~ 200'], answer: 1, explain: '최소값은 항상 0, 네 번째 인자(count)가 최대값입니다. 세 번째 인자 50 은 초기 위치입니다.' },
      { q: '트랙바 값으로 -50 ~ +50 범위의 밝기를 만들려면?', options: ['트랙바 최대값을 -50 으로', '트랙바 0~100, 사용할 때 pos - 50', '트랙바 0~50, 사용할 때 pos * -1', '불가능하다'], answer: 1, explain: '트랙바는 0 이상 정수만 주므로 0~100 으로 만들고 50 을 빼서 -50~+50 으로 변환합니다.' },
      { q: 'onChange 인자에 대한 설명으로 옳은 것은?', options: ['생략하거나 None 을 넣어도 된다', '반드시 함수여야 하며, 할 일이 없으면 아무것도 안 하는 함수를 넣는다', '트랙바의 최대값이다', '문자열로 함수 이름을 넣는다'], answer: 1, explain: 'onChange 는 값이 바뀔 때 호출될 함수입니다. 할 일이 없으면 def nothing(x): pass 를 넘깁니다.' },
      { q: '웹 환경에서 트랙바 값을 웹캠 영상 처리에 반영하는 권장 패턴은?', options: ['while 루프에서 getTrackbarPos 반복', 'process(frame) 안에서 getTrackbarPos 로 읽기', '트랙바를 매 프레임 새로 만들기', 'waitKey 로 값 받기'], answer: 1, explain: 'process 는 트랙바를 움직이거나 새 프레임이 올 때마다 호출되므로, 그 안에서 값을 읽으면 항상 최신 값이 반영됩니다.' },
    ],
  },

  /* =====================================================================
   * w1-7 이미지 기본 연산
   * ===================================================================== */
  {
    id: 'w1-7',
    summary: '픽셀 값을 읽고 바꾸기, 이미지 속성(shape·size·dtype) 확인, 관심 영역(ROI) 잘라 붙이기, 채널 분리·병합, 테두리(패딩) 만들기 등 이미지를 다루는 기본 연산을 익힙니다.',
    goals: [
      'img[y, x] 인덱싱과 item()으로 픽셀 값을 읽고 수정할 수 있다',
      'shape, size, dtype 속성으로 이미지 정보를 확인하고 오류를 예방할 수 있다',
      '슬라이싱으로 ROI를 잘라 다른 위치에 복사하고, 뷰와 복사본의 차이를 설명할 수 있다',
      'cv.split/cv.merge 와 NumPy 인덱싱으로 채널을 다룰 수 있다',
      'cv.copyMakeBorder의 테두리 종류를 비교할 수 있다',
    ],
    schedule: [['도입', 3], ['픽셀 접근·수정', 10], ['이미지 속성', 5], ['ROI와 뷰/복사본', 12], ['채널 분리·병합', 8], ['테두리 만들기', 7], ['정리·퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 픽셀 값 읽고 바꾸기</h3>
<p>이미지는 NumPy 배열이므로 <b>행(y), 열(x)</b> 인덱스로 픽셀에 접근합니다.</p>
<ul>
<li>컬러 이미지 <code>img[100, 100]</code> → <code>[B G R]</code> 세 값이 담긴 배열</li>
<li>특정 채널만 <code>img[100, 100, 0]</code> → B(파랑) 값 하나 (1 = G, 2 = R)</li>
<li>흑백 이미지 <code>gray[100, 100]</code> → 밝기 값 하나</li>
<li>바꾸기: <code>img[100, 100] = [255, 255, 255]</code> — 흰색으로</li>
</ul>
<p>픽셀 하나는 너무 작아서 눈에 안 보이므로, 아래 예제에서는 주변을 크게 확대해서 확인합니다.</p>` },
      { type: 'code', title: '예제 1 · 픽셀 접근과 수정 (튜토리얼)', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('messi5.jpg')

px = img[100, 100]            # (y=100, x=100) 픽셀의 [B G R]
print('img[100,100] =', px)

blue = img[100, 100, 0]       # 파랑 채널 값만
print('파랑 값 =', blue)

img[100, 100] = [255, 255, 255]      # 픽셀 하나를 흰색으로
print('수정 후 =', img[100, 100])

img[95:106, 95:106, 2] = 255         # 주변 11x11 영역의 빨강 채널을 최대로

gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)
print('흑백 gray[100,100] =', gray[100, 100])   # 값 하나

# 눈으로 확인하기: (80~120, 80~120) 영역을 8배 확대 (픽셀이 네모로 보이게 NEAREST)
zoom = cv.resize(img[80:120, 80:120], None, fx=8, fy=8, interpolation=cv.INTER_NEAREST)
cv.imshow('zoom x8', zoom)
` },
      { type: 'text', html: `<h3>2. item() 과 NumPy 2 에서 달라진 점</h3>
<p>튜토리얼에는 픽셀 하나에 빠르게 접근하는 <code>img.item(y, x, c)</code> 와 <code>img.itemset((y, x, c), v)</code> 가 소개되어 있습니다.
하지만 이 환경의 <b>NumPy 2 에서는 itemset() 이 제거</b>되었습니다. 값을 바꿀 때는 그냥 <code>img[y, x, c] = v</code> 로 쓰면 됩니다.</p>
<p>또 uint8 배열에 <b>0~255 범위 밖의 숫자</b>를 대입하면 NumPy 2 는 <code>OverflowError</code> 를 냅니다. 계산 결과를 넣을 때는 범위를 확인하거나 <code>np.clip()</code> 으로 잘라 주세요.</p>` },
      { type: 'code', title: '예제 2 · item() 으로 읽고, 인덱싱으로 쓰기', code: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')

print('item(10,10,2) =', img.item(10, 10, 2))   # 파이썬 int 로 반환
img[10, 10, 2] = 100                            # itemset((10,10,2), 100) 대신
print('수정 후 =', img.item(10, 10, 2))

# 자료형 차이: 인덱싱은 numpy.uint8, item() 은 int
v1 = img[10, 10, 2]
v2 = img.item(10, 10, 2)
print(type(v1), type(v2))

# uint8 범위를 넘는 값 대입은 오류
try:
    img[10, 10, 2] = 300
except OverflowError as e:
    print('OverflowError:', e)

cv.imshow('img', img)
`, desc: '<p><b>주의</b>: 파이썬 for 문으로 모든 픽셀을 하나씩 바꾸는 코드는 매우 느립니다. 영역 단위 슬라이싱이나 OpenCV 함수를 쓰세요(다음 교시에서 속도를 직접 재 봅니다).</p>' },
      { type: 'table', head: ['속성', '의미', 'messi5.jpg 컬러 / 흑백'],
        rows: [
          ['<code>img.shape</code>', '(행=높이, 열=너비, 채널) 튜플. 흑백이면 (높이, 너비)', '(342, 548, 3) / (342, 548)'],
          ['<code>img.size</code>', '전체 원소 개수 = 높이 × 너비 × 채널', '562248 / 187416'],
          ['<code>img.dtype</code>', '원소 자료형. 대부분 uint8', 'uint8'],
          ['<code>img.ndim</code>', '차원 수. 컬러 3, 흑백 2', '3 / 2'],
        ] },
      { type: 'code', title: '예제 3 · 이미지 속성 확인하기', code: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)

print('컬러 shape:', img.shape, ' size:', img.size, ' dtype:', img.dtype, ' ndim:', img.ndim)
print('흑백 shape:', gray.shape, ' size:', gray.size, ' dtype:', gray.dtype, ' ndim:', gray.ndim)

h, w = img.shape[:2]          # 컬러/흑백 모두에서 안전하게 높이·너비 얻기
print('높이 =', h, ', 너비 =', w)

# 채널 수로 컬러/흑백 구분하기
for name, im in [('img', img), ('gray', gray)]:
    if im.ndim == 2:
        print(name, '→ 흑백 이미지')
    else:
        print(name, '→ 채널', im.shape[2], '개 컬러 이미지')
`, desc: '<p>디버깅의 첫걸음은 <code>print(img.shape, img.dtype)</code> 입니다. 많은 OpenCV 오류가 “크기나 자료형이 예상과 달라서” 생깁니다.</p>' },
      { type: 'text', html: `<h3>3. 관심 영역(ROI, Region of Interest)</h3>
<p>이미지 전체가 아니라 <b>특정 부분만</b> 처리하고 싶을 때가 많습니다. 예를 들어 얼굴을 찾은 뒤 눈은 얼굴 영역 안에서만 찾으면 훨씬 빠르고 정확합니다. 이런 부분 영역을 <b>ROI</b>라고 하며, NumPy 슬라이싱으로 얻습니다.</p>
<p><code>roi = img[y1:y2, x1:x2]</code> — <b>행(y) 먼저, 열(x) 나중</b>. 튜토리얼에서는 메시 사진의 <b>공</b>을 잘라 다른 곳에 붙여 넣습니다. 붙여 넣을 자리의 크기(60×60)가 잘라낸 크기와 정확히 같아야 합니다.</p>` },
      { type: 'code', title: '예제 4 · 공 복사하기 (튜토리얼)', code: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
before = img.copy()

ball = img[280:340, 330:390]        # 행 280~339, 열 330~389 → 60x60 영역
print('ball shape:', ball.shape)

img[273:333, 100:160] = ball        # 같은 크기(60x60)의 다른 위치에 붙여넣기

cv.imshow('before', before)
cv.imshow('ball', ball)
cv.imshow('after', img)
`, desc: '<p>붙여 넣을 위치 크기가 다르면 <code>ValueError: could not broadcast input array from shape (60,60,3) into shape (...)</code> 오류가 납니다.</p>' },
      { type: 'warn', html: `<p><b>슬라이싱은 “복사”가 아니라 “창문(view)”입니다!</b> <code>roi = img[0:100, 0:100]</code> 의 roi 는 원본 메모리를 함께 보고 있어서, <code>roi[:] = 0</code> 하면 <b>원본 img 도 검게</b> 변합니다.
원본과 독립된 조각이 필요하면 <code>img[0:100, 0:100].copy()</code> 를 쓰세요.</p>` },
      { type: 'code', title: '예제 5 · 뷰(view)와 복사본(copy)의 차이', code: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')

view = img[0:100, 0:150]            # 원본과 메모리를 공유
view[:] = (0, 0, 255)               # → 원본 왼쪽 위도 빨갛게 변함

piece = img[200:300, 0:150].copy()  # 독립된 복사본
piece[:] = (255, 0, 0)              # → 원본에는 영향 없음

print('원본 (50,50):', img[50, 50], '← 빨강으로 바뀜')
print('원본 (250,50):', img[250, 50], '← 그대로')
cv.imshow('img', img)
cv.imshow('piece (copy)', piece)
` },
      { type: 'text', html: `<h3>4. 채널 분리와 병합</h3>
<p>컬러 이미지는 B, G, R 세 장의 흑백 이미지가 겹쳐진 것입니다. <code>b, g, r = cv.split(img)</code> 로 나누고 <code>cv.merge((b, g, r))</code> 로 다시 합칩니다.
분리한 채널을 <code>imshow</code> 로 보면 흑백으로 보이는데, <b>밝은 곳일수록 그 색 성분이 많다</b>는 뜻입니다.</p>
<p>튜토리얼의 조언: <code>cv.split()</code> 은 새 배열을 만들어 <b>상대적으로 느립니다</b>. 한 채널만 필요하면 <code>img[:, :, 0]</code> 같은 NumPy 인덱싱을 쓰세요. 예를 들어 빨강 성분을 모두 없애려면 <code>img[:, :, 2] = 0</code> 한 줄이면 됩니다.</p>` },
      { type: 'code', title: '예제 6 · split / merge 와 채널 인덱싱', code: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('messi5.jpg')

b, g, r = cv.split(img)            # 세 장의 2차원 배열
print('b shape:', b.shape)
merged = cv.merge((b, g, r))
print('다시 합친 결과가 원본과 같은가?', np.array_equal(img, merged))

b2 = img[:, :, 0]                  # split 보다 빠른 방법 (뷰)
print('b 와 img[:,:,0] 같은가?', np.array_equal(b, b2))

no_red = img.copy()
no_red[:, :, 2] = 0                # 빨강 채널을 모두 0 으로

only_red = np.zeros_like(img)      # 빨강 채널만 컬러로 보기
only_red[:, :, 2] = r

cv.imshow('B channel (gray)', b)
cv.imshow('R channel (gray)', r)
cv.imshow('no red', no_red)
cv.imshow('only red', only_red)
`, desc: '<p>잔디(초록)가 G 채널에서는 밝고 R 채널에서는 어둡게 보이는지 비교해 보세요.</p>' },
      { type: 'text', html: `<h3>5. 테두리(패딩) 만들기 — cv.copyMakeBorder</h3>
<p>이미지 둘레에 여백을 붙이는 함수입니다. 액자 효과에도 쓰지만, 더 중요한 용도는 <b>필터 계산</b>입니다. 이미지 가장자리 픽셀은 주변 이웃이 없어서, 필터가 “바깥에 어떤 값이 있다고 칠지” 정해야 하는데 그 규칙이 바로 <b>border type</b>입니다.</p>
<p><code>cv.copyMakeBorder(src, top, bottom, left, right, borderType, value)</code> — 위·아래·왼쪽·오른쪽 두께와 방식. <code>value</code> 는 CONSTANT 일 때의 색입니다.</p>` },
      { type: 'table', head: ['borderType', '채우는 방식 (원본: abcdefgh)', '예: [1 2 3 4 5] 좌우 3칸'],
        rows: [
          ['<code>cv.BORDER_CONSTANT</code>', '지정한 상수 색 (value)', '0 0 0 | 1 2 3 4 5 | 0 0 0'],
          ['<code>cv.BORDER_REPLICATE</code>', '가장자리 값 반복: aaaaaa|abcdefgh|hhhhhhh', '1 1 1 | 1 2 3 4 5 | 5 5 5'],
          ['<code>cv.BORDER_REFLECT</code>', '거울 반사(가장자리 포함): fedcba|abcdefgh|hgfedcb', '3 2 1 | 1 2 3 4 5 | 5 4 3'],
          ['<code>cv.BORDER_REFLECT_101</code> (= DEFAULT)', '거울 반사(가장자리 제외): gfedcb|abcdefgh|gfedcba', '4 3 2 | 1 2 3 4 5 | 4 3 2'],
          ['<code>cv.BORDER_WRAP</code>', '반대편에서 이어 붙임: cdefgh|abcdefgh|abcdefg', '3 4 5 | 1 2 3 4 5 | 1 2 3'],
        ] },
      { type: 'code', title: '예제 7 · 테두리 종류 비교 (튜토리얼)', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# 1) 숫자로 먼저 이해하기
a = np.array([[1, 2, 3, 4, 5]], np.uint8)
for name in ['BORDER_CONSTANT', 'BORDER_REPLICATE', 'BORDER_REFLECT', 'BORDER_REFLECT_101', 'BORDER_WRAP']:
    print(name.ljust(20), cv.copyMakeBorder(a, 0, 0, 3, 3, getattr(cv, name)))

# 2) 튜토리얼: 로고 이미지에 10픽셀 테두리
BLUE = [255, 0, 0]
img1 = cv.imread('opencv-logo.png')

replicate = cv.copyMakeBorder(img1, 10, 10, 10, 10, cv.BORDER_REPLICATE)
reflect = cv.copyMakeBorder(img1, 10, 10, 10, 10, cv.BORDER_REFLECT)
reflect101 = cv.copyMakeBorder(img1, 10, 10, 10, 10, cv.BORDER_REFLECT_101)
wrap = cv.copyMakeBorder(img1, 10, 10, 10, 10, cv.BORDER_WRAP)
constant = cv.copyMakeBorder(img1, 10, 10, 10, 10, cv.BORDER_CONSTANT, value=BLUE)

plt.figure(figsize=(9, 7))
plt.subplot(231), plt.imshow(img1, 'gray'), plt.title('ORIGINAL')
plt.subplot(232), plt.imshow(replicate, 'gray'), plt.title('REPLICATE')
plt.subplot(233), plt.imshow(reflect, 'gray'), plt.title('REFLECT')
plt.subplot(234), plt.imshow(reflect101, 'gray'), plt.title('REFLECT_101')
plt.subplot(235), plt.imshow(wrap, 'gray'), plt.title('WRAP')
plt.subplot(236), plt.imshow(constant, 'gray'), plt.title('CONSTANT')
plt.show()
`, desc: '<p>튜토리얼 설명처럼 Matplotlib 는 RGB 로 해석하므로 <b>파란색(BLUE) 테두리가 빨갛게</b>, 로고의 빨강·파랑도 뒤바뀌어 보입니다. 로고 배경이 검정이라 차이가 잘 안 보이면 위의 숫자 출력으로 확인하세요.</p>' },
    ],
    practice: [
      {
        title: '실습 1 · 공 여러 개 만들기',
        desc: `<p>튜토리얼의 공(<code>img[280:340, 330:390]</code>)을 <b>같은 높이(행 273~332)</b>의 x = 30, 180, 460 위치에 각각 붙여 넣어 공이 4개가 되게 하세요. <code>for</code> 문을 사용합니다.</p>`,
        starter: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
ball = img[280:340, 330:390].copy()    # 원본이 바뀌어도 안전하게 복사

xs = [30, 180, 460]
for x in xs:
    # TODO: img[273:333, x:x+60] 에 ball 붙여넣기
    pass

cv.imshow('balls', img)
print('ball shape:', ball.shape)
`,
        hint: `<p>반복문 안에서 <code>img[273:333, x:x + 60] = ball</code>. 붙일 영역의 폭이 60 이어야 하므로 끝 인덱스는 <code>x + 60</code> 입니다. 460 + 60 = 520 은 너비 548 안에 들어갑니다.</p>`,
        solution: String.raw`
import cv2 as cv

img = cv.imread('messi5.jpg')
ball = img[280:340, 330:390].copy()

xs = [30, 180, 460]
for x in xs:
    img[273:333, x:x + 60] = ball

cv.imshow('balls', img)
print('ball shape:', ball.shape)
`,
      },
      {
        title: '실습 2 · 채널 3개를 컬러로 나란히 보기',
        desc: `<p><code>fruits.jpg</code> 를 읽어 <b>파랑만 남긴 이미지, 초록만 남긴 이미지, 빨강만 남긴 이미지</b>를 만들고 <code>np.hstack</code> 으로 가로로 이어 한 창에 표시하세요. 너무 크면 먼저 절반 크기로 줄입니다.</p>`,
        starter: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('fruits.jpg')
img = cv.resize(img, None, fx=0.5, fy=0.5)   # 절반 크기

only = []
for c in range(3):                   # c = 0(B), 1(G), 2(R)
    one = np.zeros_like(img)         # 같은 크기의 검은 이미지
    # TODO: one 의 c 번 채널에 img 의 c 번 채널 복사
    only.append(one)

# TODO: only 세 장을 가로로 이어 붙이기
result = only[0]
cv.imshow('B | G | R', result)
`,
        hint: `<p><code>one[:, :, c] = img[:, :, c]</code>, <code>result = np.hstack(only)</code> (리스트나 튜플을 넘길 수 있습니다).</p>`,
        solution: String.raw`
import numpy as np
import cv2 as cv

img = cv.imread('fruits.jpg')
img = cv.resize(img, None, fx=0.5, fy=0.5)

only = []
for c in range(3):
    one = np.zeros_like(img)
    one[:, :, c] = img[:, :, c]
    only.append(one)

result = np.hstack(only)
cv.imshow('B | G | R', result)
print('result shape:', result.shape)
`,
      },
      {
        title: '실습 3 · 이중 액자 만들기',
        desc: `<p><code>lena.jpg</code> 에 <b>흰색 20픽셀</b> 테두리를 두르고, 그 바깥에 <b>짙은 갈색 (30, 60, 100) 15픽셀</b> 테두리를 한 번 더 둘러 액자를 만드세요. 처음과 마지막 shape 를 출력합니다. 마지막에 <code>BORDER_REFLECT</code> 로 만든 결과와도 비교해 보세요.</p>`,
        starter: String.raw`
import cv2 as cv

img = cv.imread('lena.jpg')
print('원본 shape:', img.shape)

# TODO: 흰색 (255,255,255) 20픽셀 CONSTANT 테두리
inner = img

# TODO: 갈색 (30,60,100) 15픽셀 CONSTANT 테두리
framed = inner

# 비교: 반사 테두리 35픽셀
reflect = cv.copyMakeBorder(img, 35, 35, 35, 35, cv.BORDER_REFLECT)

print('액자 shape:', framed.shape)
cv.imshow('framed', framed)
cv.imshow('reflect', reflect)
`,
        hint: `<p><code>inner = cv.copyMakeBorder(img, 20, 20, 20, 20, cv.BORDER_CONSTANT, value=(255, 255, 255))</code>. 두 번째는 inner 를 입력으로 같은 방식. 최종 크기는 512 + 2×(20+15) = 582 입니다.</p>`,
        solution: String.raw`
import cv2 as cv

img = cv.imread('lena.jpg')
print('원본 shape:', img.shape)

inner = cv.copyMakeBorder(img, 20, 20, 20, 20, cv.BORDER_CONSTANT, value=(255, 255, 255))
framed = cv.copyMakeBorder(inner, 15, 15, 15, 15, cv.BORDER_CONSTANT, value=(30, 60, 100))

reflect = cv.copyMakeBorder(img, 35, 35, 35, 35, cv.BORDER_REFLECT)

print('액자 shape:', framed.shape)    # (582, 582, 3)
cv.imshow('framed', framed)
cv.imshow('reflect', reflect)
`,
      },
    ],
    quiz: [
      { q: '컬러 이미지 img 에서 x=50, y=20 위치 픽셀의 빨강(R) 값을 읽는 코드는?', options: ['img[50, 20, 2]', 'img[20, 50, 2]', 'img[20, 50, 0]', 'img[50, 20, 0]'], answer: 1, explain: '인덱싱은 [행(y), 열(x), 채널] 순서이고, BGR 에서 R 은 2번 채널입니다.' },
      { q: 'NumPy 2 환경에서 img.itemset((10, 10, 2), 100) 대신 쓸 코드는?', options: ['img.item(10, 10, 2, 100)', 'img[10, 10, 2] = 100', 'img.set(10, 10, 2, 100)', 'cv.itemset(img, 10, 10, 2, 100)'], answer: 1, explain: 'itemset 은 NumPy 2 에서 제거되었습니다. 일반 인덱싱 대입을 사용합니다.' },
      { q: 'roi = img[0:100, 0:100] 후 roi[:] = 0 을 실행하면?', options: ['roi 만 검게 되고 img 는 그대로', 'img 의 해당 영역도 검게 변한다', '오류가 발생한다', 'img 전체가 검게 변한다'], answer: 1, explain: '슬라이싱은 원본과 메모리를 공유하는 뷰입니다. 독립된 조각이 필요하면 .copy() 를 사용합니다.' },
      { q: '342×548 컬러 이미지(shape (342, 548, 3))의 img.size 는?', options: ['890', '187416', '562248', '3'], answer: 2, explain: 'size 는 전체 원소 개수로 342 × 548 × 3 = 562248 입니다.' },
      { q: '가장자리 값을 그대로 반복해서 테두리를 채우는 borderType 은?', options: ['cv.BORDER_CONSTANT', 'cv.BORDER_REPLICATE', 'cv.BORDER_WRAP', 'cv.BORDER_REFLECT_101'], answer: 1, explain: 'REPLICATE 는 aaaaaa|abcdefgh|hhhhhhh 처럼 가장자리 픽셀을 복제합니다.' },
    ],
  },

  /* =====================================================================
   * w1-8 이미지 산술 연산과 성능 측정
   * ===================================================================== */
  {
    id: 'w1-8',
    summary: '이미지 덧셈(포화 연산), 두 이미지를 섞는 블렌딩, 마스크와 비트 연산으로 로고를 자연스럽게 합성하는 방법을 배웁니다. 코드 실행 시간을 측정해 빠른 코드를 쓰는 습관을 들이고, 1주차 내용을 정리합니다.',
    goals: [
      'cv.add() 의 포화 연산과 NumPy 덧셈의 모듈로 연산 차이를 설명할 수 있다',
      'cv.addWeighted() 로 크기를 맞춘 두 이미지를 블렌딩할 수 있다',
      '마스크와 bitwise_and/not 으로 투명 배경 로고를 이미지에 합성할 수 있다',
      'cv.getTickCount() 로 실행 시간을 재고, 반복문 대신 벡터화 연산을 써야 하는 이유를 설명할 수 있다',
    ],
    schedule: [['도입', 3], ['덧셈과 포화 연산', 7], ['이미지 블렌딩', 8], ['비트 연산과 로고 합성', 12], ['성능 측정과 최적화', 8], ['1주차 정리·미니 챌린지', 12]],
    blocks: [
      { type: 'text', html: `<h3>1. 이미지 덧셈: 포화(saturation) vs 모듈로(modulo)</h3>
<p>이미지를 밝게 하거나 두 이미지를 합칠 때 픽셀끼리 더합니다. 그런데 uint8 은 255 까지만 담을 수 있어서 <b>250 + 10 = 260</b> 을 어떻게 처리할지가 문제입니다.</p>
<ul>
<li><b>OpenCV <code>cv.add()</code> — 포화 연산</b>: 255 를 넘으면 255 로 고정. 260 → <b>255</b> (아주 밝은 흰색 유지)</li>
<li><b>NumPy <code>x + y</code> — 모듈로 연산</b>: 256 으로 나눈 나머지. 260 → <b>4</b> (거의 검정으로 뒤집힘!)</li>
</ul>
<p>이미지에서는 밝은 곳이 갑자기 검게 변하면 안 되므로, 튜토리얼은 <b>OpenCV 함수를 쓰는 편이 더 좋은 결과</b>를 준다고 설명합니다. 뺄셈 <code>cv.subtract()</code> 도 0 아래는 0 으로 고정됩니다.
두 이미지를 더할 때는 <b>크기와 자료형이 같아야</b> 합니다.</p>` },
      { type: 'code', title: '예제 1 · cv.add 와 NumPy 덧셈 비교', code: String.raw`
import numpy as np
import cv2 as cv

x = np.uint8([[250]])
y = np.uint8([[10]])
print('cv.add(x, y) =', cv.add(x, y))   # [[255]]  250+10 = 260 → 255 (포화)
print('x + y        =', x + y)          # [[4]]    260 % 256 = 4 (모듈로)
print('cv.subtract(10, 20) =', cv.subtract(np.uint8([[10]]), np.uint8([[20]])))   # [[0]]

# 이미지 전체를 밝게: 모든 픽셀에 +100
img = cv.imread('messi5.jpg')
plus = np.full(img.shape, 100, np.uint8)     # 같은 크기·자료형의 배열
bright_cv = cv.add(img, plus)                # 밝은 곳은 흰색으로 고정
bright_np = img + plus                       # 밝은 곳이 어둡게 뒤집힘

cv.imshow('original', img)
cv.imshow('cv.add (saturation)', bright_cv)
cv.imshow('numpy + (modulo)', bright_np)
`, desc: '<p>NumPy 결과에서 밝았던 부분(관중석, 흰 유니폼)이 이상한 색으로 얼룩지는 것을 확인하세요.</p>' },
      { type: 'tip', html: `<p><code>cv.add(img, 100)</code> 처럼 숫자 하나를 더하는 방식은 OpenCV 버전에 따라 <b>첫 번째 채널(B)에만</b> 더해지기도 합니다. 컬러 이미지에는 위 예제처럼 <b>같은 모양의 배열</b>을 만들어 더하거나, 지난 교시의 <code>cv.convertScaleAbs(img, alpha=1, beta=100)</code> 을 쓰는 것이 안전합니다.</p>` },
      { type: 'text', html: `<h3>2. 이미지 블렌딩 — cv.addWeighted</h3>
<p>블렌딩(blending)은 두 이미지에 <b>가중치(비율)</b>를 주어 섞는 덧셈입니다. 반투명하게 겹치거나, 사진이 서서히 바뀌는 전환 효과를 만듭니다.</p>
<p><b>g(x) = (1 − α)·f₀(x) + α·f₁(x)</b> — α(알파)를 0 → 1 로 바꾸면 첫 이미지에서 두 번째 이미지로 서서히 바뀝니다.</p>
<p><code>dst = cv.addWeighted(img1, w1, img2, w2, gamma)</code> 는 <b>dst = img1·w1 + img2·w2 + gamma</b> 를 계산합니다(포화 연산 포함). 튜토리얼은 w1 = 0.7, w2 = 0.3, gamma = 0 을 씁니다.
<b>두 이미지의 크기가 반드시 같아야</b> 하므로, 다르면 <code>cv.resize(img, (너비, 높이))</code> 로 먼저 맞춥니다. resize 의 크기 인자는 <b>(너비, 높이)</b> 순서라는 점에 주의하세요(shape 와 반대!).</p>` },
      { type: 'code', title: '예제 2 · ml.png 와 OpenCV 로고 블렌딩 (튜토리얼)', code: String.raw`
import cv2 as cv

img1 = cv.imread('ml.png')            # 380x308
img2 = cv.imread('opencv-logo.png')   # 794x600 → 크기가 다름!
print('img1', img1.shape, ' img2', img2.shape)

# img2 를 img1 크기로 맞추기: resize 의 크기는 (너비, 높이)
h, w = img1.shape[:2]
img2 = cv.resize(img2, (w, h))
print('resize 후 img2', img2.shape)

dst = cv.addWeighted(img1, 0.7, img2, 0.3, 0)

cv.imshow('img1', img1)
cv.imshow('img2 (resized)', img2)
cv.imshow('dst', dst)
cv.waitKey(0)
cv.destroyAllWindows()
` },
      { type: 'code', title: '예제 3 · 트랙바로 서서히 바뀌는 전환 효과', code: String.raw`
import cv2 as cv

def nothing(x):
    pass

linux = cv.imread('LinuxLogo.jpg')       # 두 이미지는 크기가 같음 (320x240)
windows = cv.imread('WindowsLogo.jpg')

cv.namedWindow('result')
cv.createTrackbar('alpha %', 'result', 50, 100, nothing)

def process(frame):
    a = cv.getTrackbarPos('alpha %', 'result') / 100    # 0.0 ~ 1.0
    dst = cv.addWeighted(linux, 1 - a, windows, a, 0)
    cv.putText(dst, 'alpha=%.2f' % a, (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return dst
`, desc: '<p>튜토리얼 연습문제 “addWeighted 로 부드럽게 전환되는 슬라이드쇼 만들기”를 트랙바로 구현했습니다. 이 process 는 입력 frame 대신 두 로고를 섞습니다.</p>' },
      { type: 'text', html: `<h3>3. 비트 연산과 마스크로 로고 합성하기</h3>
<p>로고를 사진 위에 올리고 싶을 때, 단순 덧셈은 색이 섞이고 블렌딩은 반투명해집니다. <b>로고 모양 부분만 정확히 바꾸려면</b> <b>마스크(mask)</b>와 <b>비트 연산</b>이 필요합니다.
마스크는 “어디를 처리할지”를 흰색(255)/검정(0)으로 표시한 흑백 이미지입니다.</p>` },
      { type: 'table', head: ['함수', '동작 (흰색=1, 검정=0 으로 생각)', '주 용도'],
        rows: [
          ['<code>cv.bitwise_and(a, b, mask=m)</code>', '둘 다 흰색인 곳만 남김. mask 가 0 인 곳은 0(검정)', '마스크 영역만 잘라내기'],
          ['<code>cv.bitwise_or(a, b)</code>', '둘 중 하나라도 흰색이면 흰색', '영역 합치기'],
          ['<code>cv.bitwise_xor(a, b)</code>', '둘이 다를 때만 흰색', '차이 영역'],
          ['<code>cv.bitwise_not(a)</code>', '흑↔백 반전', '마스크 뒤집기'],
          ['<code>cv.threshold(gray, t, 255, cv.THRESH_BINARY)</code>', '밝기 &gt; t 는 255, 나머지 0 → (ret, mask) 반환', '마스크 만들기 (2주차에 자세히)'],
        ] },
      { type: 'code', title: '예제 4 · 비트 연산 한눈에 보기', code: String.raw`
import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

a = np.zeros((200, 200), np.uint8)
cv.rectangle(a, (30, 30), (130, 170), 255, -1)    # 흰 사각형
b = np.zeros((200, 200), np.uint8)
cv.circle(b, (130, 100), 60, 255, -1)             # 흰 원

results = [('A (rect)', a), ('B (circle)', b),
           ('AND', cv.bitwise_and(a, b)), ('OR', cv.bitwise_or(a, b)),
           ('XOR', cv.bitwise_xor(a, b)), ('NOT A', cv.bitwise_not(a))]

plt.figure(figsize=(9, 6))
for i, (title, im) in enumerate(results):
    plt.subplot(2, 3, i + 1)
    plt.imshow(im, cmap='gray')
    plt.title(title)
    plt.xticks([]); plt.yticks([])
plt.show()
` },
      { type: 'code', title: '예제 5 · 로고 합성 (튜토리얼) + 중간 결과 보기', code: String.raw`
import cv2 as cv

img1 = cv.imread('messi5.jpg')
img2 = cv.imread('opencv-logo-white.png')    # 배경이 검정인 흰 글자 로고

# 1) 로고를 놓을 자리(ROI) 준비: 로고와 같은 크기
rows, cols, channels = img2.shape
roi = img1[0:rows, 0:cols]

# 2) 로고 마스크 만들기: 로고 부분 255, 배경 0
img2gray = cv.cvtColor(img2, cv.COLOR_BGR2GRAY)
ret, mask = cv.threshold(img2gray, 10, 255, cv.THRESH_BINARY)
mask_inv = cv.bitwise_not(mask)              # 반대로: 배경 255, 로고 0

# 3) ROI 에서 로고 자리를 검게 파내기 (배경만 남김)
img1_bg = cv.bitwise_and(roi, roi, mask=mask_inv)

# 4) 로고 이미지에서 로고 부분만 남기기
img2_fg = cv.bitwise_and(img2, img2, mask=mask)

# 5) 둘을 더해 ROI 에 다시 넣기
dst = cv.add(img1_bg, img2_fg)
img1[0:rows, 0:cols] = dst

cv.imshow('mask', mask)
cv.imshow('mask_inv', mask_inv)
cv.imshow('img1_bg', img1_bg)
cv.imshow('img2_fg', img2_fg)
cv.imshow('res', img1)
cv.waitKey(0)
cv.destroyAllWindows()
`, desc: '<p>순서를 그림으로 정리하면: <b>배경에 로고 모양 구멍 파기(img1_bg)</b> + <b>로고만 오려내기(img2_fg)</b> = 구멍에 로고가 딱 맞게 들어감. 각 중간 창을 차례로 보며 이해해 보세요.</p>' },
      { type: 'text', html: `<h3>4. 성능 측정과 최적화</h3>
<p>영상처리는 픽셀 수가 많아(640×480 = 30만 픽셀) 코드 작성 방법에 따라 속도가 수백 배 차이 납니다. 특히 웹캠 <code>process</code> 는 1초에 수십 번 실행되므로 속도가 중요합니다.</p>
<ul>
<li><code>cv.getTickCount()</code>: 기준 시점부터 지난 “틱(tick)” 수. 작업 전후 값의 차이를 구합니다.</li>
<li><code>cv.getTickFrequency()</code>: 1초당 틱 수. <b>(e2 − e1) / 주파수 = 걸린 초</b></li>
<li>Python 의 <code>time.time()</code> 이나 <code>time.perf_counter()</code> 로도 같은 일을 할 수 있습니다.</li>
<li><code>cv.useOptimized()</code>: SSE/AVX 같은 CPU 최적화 사용 여부, <code>cv.setUseOptimized(False)</code> 로 끌 수 있습니다. (브라우저 환경에서는 차이가 작거나 없을 수 있습니다.)</li>
</ul>
<p>튜토리얼의 최적화 조언: <b>① 파이썬 반복문은 피하고 ② NumPy/OpenCV 함수(벡터화)를 쓰고 ③ 불필요한 배열 복사를 줄이고 ④ 캐시를 활용</b>하세요. 같은 일을 하는 함수가 OpenCV 에 있다면 보통 NumPy 보다 빠릅니다.</p>` },
      { type: 'code', title: '예제 6 · getTickCount 로 시간 재기 (튜토리얼)', code: String.raw`
import cv2 as cv

img1 = cv.imread('messi5.jpg')

e1 = cv.getTickCount()
for i in range(5, 25, 2):           # 튜토리얼은 range(5, 49, 2) — 웹에서는 조금 줄임
    img1 = cv.medianBlur(img1, i)
e2 = cv.getTickCount()
t = (e2 - e1) / cv.getTickFrequency()
print('medianBlur 반복 시간: %.3f 초' % t)

# 최적화 켜기/끄기 비교
print('useOptimized:', cv.useOptimized())
img = cv.imread('messi5.jpg')
for opt in [True, False]:
    cv.setUseOptimized(opt)
    e1 = cv.getTickCount()
    res = cv.medianBlur(img, 31)
    e2 = cv.getTickCount()
    print('최적화 %s → %.4f 초' % (opt, (e2 - e1) / cv.getTickFrequency()))
cv.setUseOptimized(True)            # 원래대로

cv.imshow('blurred', img1)
` },
      { type: 'code', title: '튜토리얼 참고 · IPython %timeit 으로 비교 (Jupyter 전용)', norun: true, code: String.raw`
In [10]: x = 5
In [11]: %timeit y = x**2          # 파이썬 스칼라 연산이 가장 빠름
In [12]: %timeit y = x*x
In [15]: z = np.uint8([5])
In [17]: %timeit y = z*z           # 원소 1개짜리 NumPy 배열은 오히려 느림
In [19]: %timeit y = np.square(z)

In [35]: %timeit z = cv.countNonZero(img)   # 이미지 전체 연산은
In [36]: %timeit z = np.count_nonzero(img)  # OpenCV 가 NumPy 보다 대체로 빠름
` },
      { type: 'code', title: '예제 7 · 파이썬 반복문 vs NumPy vs OpenCV 속도 대결', code: String.raw`
import numpy as np
import cv2 as cv

gray = cv.imread('messi5.jpg', cv.IMREAD_GRAYSCALE)[:120, :160]   # 작은 영역만 (반복문이 느리므로)
f = cv.getTickFrequency()

# 1) 파이썬 이중 for 문: 픽셀마다 +60 (255 넘으면 255)
e1 = cv.getTickCount()
out1 = gray.copy()
h, w = out1.shape
for y in range(h):
    for x in range(w):
        v = int(out1[y, x]) + 60
        out1[y, x] = 255 if v > 255 else v
t1 = (cv.getTickCount() - e1) / f

# 2) NumPy 벡터화
e1 = cv.getTickCount()
out2 = np.clip(gray.astype(np.int16) + 60, 0, 255).astype(np.uint8)
t2 = (cv.getTickCount() - e1) / f

# 3) OpenCV 함수
e1 = cv.getTickCount()
out3 = cv.add(gray, np.full(gray.shape, 60, np.uint8))
t3 = (cv.getTickCount() - e1) / f

print('결과가 모두 같은가?', np.array_equal(out1, out2) and np.array_equal(out2, out3))
print('for 문 : %.5f 초' % t1)
print('NumPy  : %.5f 초  (약 %.0f 배 빠름)' % (t2, t1 / max(t2, 1e-9)))
print('OpenCV : %.5f 초  (약 %.0f 배 빠름)' % (t3, t1 / max(t3, 1e-9)))
cv.imshow('result', out3)
`, desc: '<p>겨우 160×120 영역인데도 for 문이 훨씬 느립니다. 640×480 웹캠 프레임이면 16배 더 느려지겠죠? 이것이 “픽셀 반복문 금지”의 이유입니다.</p>' },
      { type: 'text', html: `<h3>5. 1주차 정리</h3>
<p>이번 주에 배운 함수들을 한눈에 정리했습니다. 이 함수들은 2~5주차 내내 기본 도구로 계속 등장합니다. 이름만 보고 무슨 일을 하는지 떠오르는지 점검해 보세요.</p>` },
      { type: 'table', head: ['교시', '핵심 함수 / 문법', '기억할 점'],
        rows: [
          ['1 · 환경·NumPy', '<code>np.zeros</code>, <code>shape</code>, <code>dtype</code>, 슬라이싱', '이미지 = (높이, 너비, 채널) uint8 배열, BGR 순서'],
          ['2 · 이미지 입출력', '<code>cv.imread</code>, <code>cv.imshow</code>, <code>cv.imwrite</code>, <code>cv.cvtColor</code>', '읽기 실패 시 None, Matplotlib 는 RGB 변환 필요'],
          ['3 · 비디오', '<code>cv.VideoCapture</code>, <code>cap.read</code>, <code>cv.flip</code>, <code>def process(frame)</code>', '웹에서는 while 루프 대신 process'],
          ['4 · 그리기', '<code>cv.line</code>, <code>rectangle</code>, <code>circle</code>, <code>ellipse</code>, <code>polylines</code>, <code>putText</code>', '좌표는 (x, y), thickness=-1 은 채우기, 한글 불가'],
          ['5 · 마우스', '<code>cv.setMouseCallback</code>, <code>cv.EVENT_*</code>', '콜백 5인자, global, 제자리 수정'],
          ['6 · 트랙바', '<code>cv.createTrackbar</code>, <code>cv.getTrackbarPos</code>', '최소 0·정수, process 안에서 읽기'],
          ['7 · 기본 연산', '<code>img[y, x]</code>, ROI, <code>cv.split/merge</code>, <code>cv.copyMakeBorder</code>', '슬라이스는 뷰 → 필요하면 .copy()'],
          ['8 · 산술·성능', '<code>cv.add</code>, <code>cv.addWeighted</code>, <code>cv.bitwise_*</code>, <code>cv.getTickCount</code>', '포화 연산, 크기 맞추기, 반복문 대신 벡터화'],
        ] },
      { type: 'tip', html: `<p><b>다음 주 예고</b>: 2주차에는 색 공간(HSV)으로 특정 색 물체를 찾고, 이미지를 회전·변환하고, 임계처리와 블러로 이미지를 “가공”합니다. 오늘 쓴 <code>cv.threshold</code> 와 마스크 개념이 바로 이어집니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 로고를 오른쪽 아래 구석으로',
        desc: `<p>튜토리얼의 로고 합성 코드는 로고를 왼쪽 위에 놓습니다. <b>오른쪽 아래 구석</b>(가장자리에서 10픽셀 떨어진 곳)에 놓이도록 ROI 위치를 바꾸세요.</p>`,
        starter: String.raw`
import cv2 as cv

img1 = cv.imread('messi5.jpg')
logo = cv.imread('opencv-logo-white.png')
logo = cv.resize(logo, (90, 119))            # 로고를 절반 크기로

H, W = img1.shape[:2]                        # 배경 크기
rows, cols = logo.shape[:2]                  # 로고 크기

# TODO: 오른쪽 아래(여백 10) 가 되도록 y0, x0 계산
y0, x0 = 0, 0
roi = img1[y0:y0 + rows, x0:x0 + cols]

gray = cv.cvtColor(logo, cv.COLOR_BGR2GRAY)
ret, mask = cv.threshold(gray, 10, 255, cv.THRESH_BINARY)
mask_inv = cv.bitwise_not(mask)
bg = cv.bitwise_and(roi, roi, mask=mask_inv)
fg = cv.bitwise_and(logo, logo, mask=mask)
img1[y0:y0 + rows, x0:x0 + cols] = cv.add(bg, fg)

cv.imshow('logo corner', img1)
`,
        hint: `<p>ROI 의 끝이 <code>H - 10</code>, <code>W - 10</code> 이 되어야 하므로 <code>y0 = H - rows - 10</code>, <code>x0 = W - cols - 10</code> 입니다.</p>`,
        solution: String.raw`
import cv2 as cv

img1 = cv.imread('messi5.jpg')
logo = cv.imread('opencv-logo-white.png')
logo = cv.resize(logo, (90, 119))

H, W = img1.shape[:2]
rows, cols = logo.shape[:2]

y0, x0 = H - rows - 10, W - cols - 10
roi = img1[y0:y0 + rows, x0:x0 + cols]

gray = cv.cvtColor(logo, cv.COLOR_BGR2GRAY)
ret, mask = cv.threshold(gray, 10, 255, cv.THRESH_BINARY)
mask_inv = cv.bitwise_not(mask)
bg = cv.bitwise_and(roi, roi, mask=mask_inv)
fg = cv.bitwise_and(logo, logo, mask=mask)
img1[y0:y0 + rows, x0:x0 + cols] = cv.add(bg, fg)

cv.imshow('logo corner', img1)
`,
      },
      {
        title: '실습 2 · 입력 영상과 명화 블렌딩',
        desc: `<p><code>process(frame)</code> 에서 입력 프레임과 <code>starry_night.jpg</code> 를 트랙바 <code>mix %</code> 비율로 블렌딩하세요. 입력 크기가 매번 다를 수 있으니 명화를 <b>프레임 크기에 맞춰 resize</b> 해야 합니다. 웹캠(또는 🎞️ 동영상)으로 바꾸면 고흐 그림 속에 들어간 듯한 효과가 납니다.</p>`,
        starter: String.raw`
import cv2 as cv

def nothing(x):
    pass

art = cv.imread('starry_night.jpg')      # 한 번만 읽기 (process 밖)
cv.namedWindow('result')
cv.createTrackbar('mix %', 'result', 40, 100, nothing)

def process(frame):
    a = cv.getTrackbarPos('mix %', 'result') / 100
    h, w = frame.shape[:2]
    # TODO: art 를 (w, h) 크기로 resize
    art_small = frame
    # TODO: frame 과 art_small 을 (1-a) : a 비율로 addWeighted
    out = frame
    return out
`,
        hint: `<p><code>art_small = cv.resize(art, (w, h))</code> — 크기는 (너비, 높이). <code>out = cv.addWeighted(frame, 1 - a, art_small, a, 0)</code></p>`,
        solution: String.raw`
import cv2 as cv

def nothing(x):
    pass

art = cv.imread('starry_night.jpg')
cv.namedWindow('result')
cv.createTrackbar('mix %', 'result', 40, 100, nothing)

def process(frame):
    a = cv.getTrackbarPos('mix %', 'result') / 100
    h, w = frame.shape[:2]
    art_small = cv.resize(art, (w, h))
    out = cv.addWeighted(frame, 1 - a, art_small, a, 0)
    return out
`,
      },
      {
        title: '실습 3 · 1주차 미니 챌린지: 포토카드 만들기',
        desc: `<p>1주차에 배운 기능을 모두 모아 <b>포토카드</b>를 만드세요.</p>
<ol>
<li><code>messi5.jpg</code> 에서 선수들이 있는 영역 <code>[30:330, 120:420]</code>(300×300)을 ROI 로 잘라 <b>복사</b></li>
<li>흰색 15픽셀 테두리 + 아래쪽만 60픽셀 더 넓은 흰 여백 (<code>copyMakeBorder</code>)</li>
<li>아래 여백에 제목 글자 <code>MY PHOTO CARD</code> (<code>putText</code>)</li>
<li>오른쪽 위 구석에 작은 OpenCV 로고를 마스크로 합성</li>
<li>전체 작업 시간을 <code>getTickCount</code> 로 측정해 출력하고, <code>photocard.png</code> 로 저장</li>
</ol>`,
        starter: String.raw`
import cv2 as cv

e1 = cv.getTickCount()

img = cv.imread('messi5.jpg')
# 1) TODO: ROI 복사 [30:330, 120:420]
card = img[0:300, 0:300].copy()

# 2) TODO: 테두리 (위·왼·오른쪽 15, 아래 75) 흰색
#    cv.copyMakeBorder(card, top, bottom, left, right, cv.BORDER_CONSTANT, value=(255, 255, 255))

# 3) TODO: 아래 여백에 제목 (검정)
cv.putText(card, 'MY PHOTO CARD', (20, 20), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2, cv.LINE_AA)

# 4) 로고 합성: 오른쪽 위 (여백 20)
logo = cv.resize(cv.imread('opencv-logo-white.png'), (45, 60))
rows, cols = logo.shape[:2]
H, W = card.shape[:2]
y0, x0 = 20, W - cols - 20
# TODO: mask, mask_inv 만들고 bitwise_and 두 번 + add 로 합성

e2 = cv.getTickCount()
print('작업 시간: %.4f 초' % ((e2 - e1) / cv.getTickFrequency()))
print('카드 크기:', card.shape)
# 5) TODO: photocard.png 로 저장
cv.imshow('photo card', card)
`,
        hint: `<p>테두리: <code>card = cv.copyMakeBorder(card, 15, 75, 15, 15, cv.BORDER_CONSTANT, value=(255, 255, 255))</code> → 크기 390×330. 제목 위치는 아래 여백 가운데쯤 <code>(55, 360)</code>.
로고 합성은 예제 5 와 같은 순서: <code>roi = card[y0:y0+rows, x0:x0+cols]</code> → threshold 로 mask → <code>bitwise_not</code> → <code>bitwise_and</code> 두 번 → <code>cv.add</code> → ROI 에 다시 대입. 저장은 <code>cv.imwrite('photocard.png', card)</code>.</p>`,
        solution: String.raw`
import cv2 as cv

e1 = cv.getTickCount()

img = cv.imread('messi5.jpg')
# 1) ROI 복사
card = img[30:330, 120:420].copy()

# 2) 테두리: 위·왼·오른쪽 15, 아래 75
card = cv.copyMakeBorder(card, 15, 75, 15, 15, cv.BORDER_CONSTANT, value=(255, 255, 255))

# 3) 제목: 글자 너비를 구해 가운데 정렬
text = 'MY PHOTO CARD'
(tw, th), _ = cv.getTextSize(text, cv.FONT_HERSHEY_DUPLEX, 0.9, 2)
H, W = card.shape[:2]
cv.putText(card, text, ((W - tw) // 2, H - 28), cv.FONT_HERSHEY_DUPLEX, 0.9, (40, 40, 40), 2, cv.LINE_AA)

# 4) 로고 합성: 오른쪽 위
logo = cv.resize(cv.imread('opencv-logo-white.png'), (45, 60))
rows, cols = logo.shape[:2]
y0, x0 = 20, W - cols - 20
roi = card[y0:y0 + rows, x0:x0 + cols]
gray = cv.cvtColor(logo, cv.COLOR_BGR2GRAY)
ret, mask = cv.threshold(gray, 10, 255, cv.THRESH_BINARY)
mask_inv = cv.bitwise_not(mask)
bg = cv.bitwise_and(roi, roi, mask=mask_inv)
fg = cv.bitwise_and(logo, logo, mask=mask)
card[y0:y0 + rows, x0:x0 + cols] = cv.add(bg, fg)

e2 = cv.getTickCount()
print('작업 시간: %.4f 초' % ((e2 - e1) / cv.getTickFrequency()))
print('카드 크기:', card.shape)     # (390, 330, 3)

# 5) 저장과 표시
cv.imwrite('photocard.png', card)
cv.imshow('photo card', card)
`,
      },
    ],
    quiz: [
      { q: 'uint8 값 250 과 10 을 더할 때 cv.add() 와 NumPy + 의 결과는 각각?', options: ['260, 260', '255, 4', '4, 255', '255, 255'], answer: 1, explain: 'cv.add 는 포화 연산으로 255 에서 멈추고, NumPy 는 모듈로 연산으로 260 % 256 = 4 가 됩니다.' },
      { q: 'cv.addWeighted(img1, 0.7, img2, 0.3, 0) 을 쓰기 위한 조건은?', options: ['두 이미지가 흑백이어야 한다', '두 이미지의 크기(와 채널 수)가 같아야 한다', '가중치 합이 반드시 1 이어야 한다', 'img2 가 PNG 여야 한다'], answer: 1, explain: '픽셀끼리 계산하므로 크기와 채널이 같아야 합니다. 가중치 합이 1 이 아니어도 계산은 됩니다(밝기가 달라질 뿐).' },
      { q: '로고 합성에서 cv.bitwise_and(roi, roi, mask=mask_inv) 의 결과는?', options: ['로고 부분만 남은 이미지', '로고 모양이 검게 파인 배경', '흑백으로 바뀐 ROI', '반전된 ROI'], answer: 1, explain: 'mask_inv 는 로고 자리가 0 이므로, 그 부분이 검게 지워지고 배경만 남습니다.' },
      { q: 'cv.getTickCount() 로 측정한 틱 차이를 초 단위로 바꾸는 방법은?', options: ['× 1000', '÷ cv.getTickFrequency()', '÷ 60', '× cv.getTickFrequency()'], answer: 1, explain: 'getTickFrequency() 는 1초당 틱 수이므로 틱 차이를 이 값으로 나누면 초가 됩니다.' },
      { q: '이미지의 모든 픽셀을 처리할 때 가장 느린 방법은?', options: ['OpenCV 함수 (cv.add 등)', 'NumPy 벡터화 연산', '파이썬 이중 for 문으로 픽셀마다 처리', '슬라이싱으로 한 번에 대입'], answer: 2, explain: '파이썬 반복문은 픽셀마다 인터프리터를 거쳐 매우 느립니다. 벡터화 연산과 OpenCV 함수를 사용하세요.' },
    ],
  },
]);
