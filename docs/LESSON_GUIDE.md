# 강의 콘텐츠 작성 가이드

이 강좌는 **브라우저에서 Python + OpenCV(Pyodide, opencv-python 4.11, numpy 2.2, matplotlib 3.8)** 를 실행합니다.
각 교시의 내용은 `lessons/weekN.js` 파일에 JavaScript 객체로 작성합니다.

- 대상: **프로그래밍 초보자** (Python 기초 문법 정도만 앎). 1교시 = 50분 수업.
- 기반: OpenCV.org 공식 Python 튜토리얼(https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html) — 입문 ~ Image Processing 범위.
- 언어: 설명·주석은 **한국어**, 친절하고 구체적으로. 용어는 처음 나올 때 영어 병기(예: 임계처리(Thresholding)).

## 1. 파일 형식

```js
/* 1주차: OpenCV 입문 · GUI · 코어 연산 */
COURSE.addLessons([
  {
    id: 'w1-2',                       // js/course.js 의 syllabus id 와 동일해야 함 (제목/참고링크는 course.js 에 있음)
    summary: '이미지를 읽고, 화면에 보여주고, 파일로 저장하는 가장 기본적인 흐름을 익힙니다.',
    goals: ['cv.imread()의 flag 차이를 설명할 수 있다', '...'],
    schedule: [['도입', 5], ['개념 설명', 15], ['예제 실습', 15], ['실습 과제', 10], ['정리·퀴즈', 5]], // 분 단위, 합계 50
    blocks: [
      { type: 'text', html: `<h3>1. 이미지 읽기</h3><p>...</p>` },
      { type: 'code', title: '예제 1 · 이미지 읽고 표시하기', code: String.raw`
import cv2 as cv
img = cv.imread('messi5.jpg')
cv.imshow('image', img)
`, desc: '<p>(선택) 코드 아래 설명</p>' },
      { type: 'table', head: ['함수', '설명'], rows: [['<code>cv.imread()</code>', '이미지 읽기']] },
      { type: 'image', src: 'messi5.jpg', caption: '실습 이미지 messi5.jpg' },
      { type: 'tip', html: `<p>팁 내용</p>` },
      { type: 'warn', html: `<p>주의 내용</p>` },
      { type: 'checklist', title: '점검 목록', items: ['항목1', '항목2'] },   // 주로 프로젝트 교시
    ],
    practice: [
      {
        title: '실습 1 · 흑백으로 저장하기',
        desc: `<p>과제 설명 (무엇을, 어떤 결과가 나와야 하는지)</p>`,
        starter: String.raw`...빈칸(# TODO)이 있는 시작 코드...`,
        hint: `<p>힌트</p>`,
        solution: String.raw`...완성 코드...`,
      },
    ],
    quiz: [
      { q: '질문', options: ['보기1', '보기2', '보기3', '보기4'], answer: 1, explain: '해설' }, // answer 는 0부터
    ],
  },
]);
```

### 작성 규칙

- **코드는 반드시 `String.raw\`...\`` 로 작성**합니다 (`\n` 등 백슬래시가 그대로 유지됨). 코드 안에 백틱(`` ` ``)과 `${` 는 쓰지 마세요.
  첫 줄 개행과 끝 개행은 자동으로 제거되니 위 예시처럼 써도 됩니다.
- `html` 은 일반 템플릿 문자열입니다. 본문에 `<`, `>`, `&` 를 글자로 쓰려면 `&lt;` `&gt;` `&amp;` 로 씁니다. 사용 가능한 태그: `h3 h4 p ul ol li b strong em code pre kbd br table span`. 수식은 간단한 텍스트/유니코드로.
- 한 교시 분량: 설명 text 블록 4~8개, **code 예제 4~7개**, **practice 2~3개**, **quiz 3~5개**.
- 모든 code 예제는 **단독으로 실행 가능**해야 합니다(필요한 import 포함). 각 예제는 `cv.imshow()` 로 결과를 보여주거나 `print()` 로 값을 출력하세요.
- practice 의 `starter` 는 그대로 실행해도 **오류 없이** 돌아가야 합니다 (빈칸은 `# TODO:` 주석 + 동작하는 기본값으로). `solution` 은 완성본.
- 실행하지 않을 코드(설명용 조각, 데스크톱 전용 코드 등)는 code 블록에 `norun: true` 를 넣습니다. 이 경우 실행 버튼이 숨겨집니다.

## 2. 웹 실습 환경 규칙 (매우 중요)

코드는 **브라우저의 메인 스레드**에서 실행됩니다. 데스크톱 OpenCV와 다른 점:

| 기능 | 웹 환경 동작 |
|---|---|
| `cv.imshow(name, img)` | 오른쪽 결과 패널에 창(카드)으로 표시. 같은 이름이면 덮어씀. 마우스를 올리면 좌표/픽셀값 표시 |
| `cv.waitKey()` / `cv.destroyAllWindows()` | 즉시 -1 반환 / 아무 동작 안 함 (써도 무방. 튜토리얼과 같은 모양 유지를 위해 마지막에 써도 됨) |
| **`while True:` + `waitKey` / `cap.read()` 반복** | **사용 금지.** 300회 넘게 호출되면 오류로 중단됨 |
| **실시간 처리** | `def process(frame):` 를 정의하고 결과 이미지를 `return` → 입력 소스가 웹캠·동영상이면 매 프레임, 이미지면 1회(트랙바를 움직일 때마다 다시) 호출. 결과는 `result` 창에 표시. 튜플/리스트로 여러 장 반환 가능 |
| `cv.VideoCapture(0)` | 실행 전에 웹캠을 자동으로 켜고, `cap.read()` 가 **현재 프레임 1장**을 돌려줌 (반복 금지) |
| `cv.VideoCapture('vtest.avi')` | 동영상을 오른쪽 패널의 입력 소스로 열고(실행 전 로딩 대기) 재생. `cap.read()` 는 **현재 재생 중인 프레임 1장**. `cap.get(cv.CAP_PROP_FPS / CAP_PROP_FRAME_COUNT / CAP_PROP_POS_FRAMES / CAP_PROP_FRAME_WIDTH)`, `cap.set(cv.CAP_PROP_POS_FRAMES, n)`(탐색) 지원. 모든 프레임 처리는 입력 소스를 동영상으로 두고 `process(frame)` |
| `cv.namedWindow` + `cv.createTrackbar(tb, win, value, max, onChange)` | 결과 패널에 슬라이더 생성. 값이 바뀌면 onChange 호출 → 창 자동 갱신 → process 재실행. onChange 는 **반드시 함수**(`def nothing(x): pass`) |
| `cv.getTrackbarPos(tb, win)` | 슬라이더 값. **process 안에서 읽는 패턴**을 권장 |
| `cv.setMouseCallback(win, fn, param)` | 해당 창 캔버스의 마우스 이벤트(EVENT_LBUTTONDOWN/MOUSEMOVE/LBUTTONUP/LBUTTONDBLCLK/RBUTTONDOWN…, flags) 전달. 콜백 후 모든 창 자동 갱신 → 콜백 안에서 이미지 배열을 **제자리 수정**하면 바로 보임. 창은 먼저 `cv.imshow` 로 만들어 두기 |
| `cv.imwrite(name, img)` | 가상 파일시스템에 저장 + 콘솔에 다운로드 링크 표시. 이후 `cv.imread(name)` 가능 |
| Matplotlib | `from matplotlib import pyplot as plt` → `plt.show()` 시 결과 패널에 그림으로 표시. **그래프 제목/라벨은 영어**(한글 폰트 없음) |
| `import webcv` | `webcv.get_input()` → 현재 오른쪽 패널에서 선택한 입력(이미지 또는 웹캠 프레임)을 BGR 배열로 반환. "내 이미지로 해보기"에 사용 |
| 입력 파일 | 아래 샘플 이미지 이름으로 바로 `cv.imread('messi5.jpg')`. 학생이 업로드한 파일과 `webcam.png`(스냅샷)도 사용 가능 |

기타 주의:
- **numpy 2** 입니다: `img.itemset()` 은 제거됨 (`img[y, x, c] = v` 사용). `img.item(y, x, c)` 는 가능.
- 파이썬 이중 for 문으로 픽셀 전체를 도는 코드는 매우 느립니다 → 예제에서 피하고, 필요하면 작은 ROI 로만.
- `process(frame)` 은 매 프레임 호출되므로 가볍게 (640×480 기준 수십 ms 이내). 무거운 필터는 `cv.resize` 로 줄여서.
- `cv.imshow` 규칙은 OpenCV 와 같음: uint8 그대로, float 는 ×255 후 표시(0~1 범위 가정), bool 불가 → `astype(np.uint8)*255`. `CV_64F` 결과(Sobel 등)는 `cv.convertScaleAbs()` 로 변환하거나 plt 로 보여주기.
- 웹캠 예제는 “오른쪽 패널에서 입력 소스를 📷 웹캠으로 바꾸세요” 안내 문구를 넣고, 웹캠이 없어도 이미지 입력으로 동작하게 작성. 웹캠이 없는 학생을 위해 “🎞️ 동영상(vtest.mp4 등)을 입력 소스로 골라도 된다”는 안내도 함께.
- 튜토리얼 원본 코드(데스크톱용 while 루프)를 소개할 때는 `norun: true` 로 보여주고, 바로 아래에 웹용(process) 버전을 제공하세요.

## 3. 샘플 이미지 (OpenCV 공식 저장소 이미지)

| 파일 | 크기(w×h, 채널) | 내용 · 용도 |
|---|---|---|
| messi5.jpg | 548×342, 3 | 축구 경기(메시) — 입출력, ROI(공 복사), 템플릿 매칭 |
| messi_face.jpg | 40×52, 3 | messi5.jpg 의 얼굴 템플릿 |
| lena.jpg | 512×512, 3 | 인물 — 필터 전반 |
| opencv-logo.png | 600×794, 4(투명) | OpenCV 로고 컬러 |
| opencv-logo-white.png | 180×238, 4 | 로고(흰 글자) — 비트 연산 튜토리얼, 허프 원 튜토리얼 |
| ml.png | 308×380, 3 | 블렌딩 튜토리얼 이미지 (opencv-logo.png 와 합성: 크기 맞춰야 함) |
| sudoku.png | 558×563, 3 | 적응형 임계처리, 원근 변환, 허프 직선 |
| gradient.png | 300×300, 4 | 그라데이션 — 단순 임계처리 튜토리얼 |
| j.png | 112×150, 4 | 글자 j — 모폴로지 튜토리얼 |
| home.jpg | 512×384, 3 | 집 — 색공간/히스토그램 튜토리얼 |
| water_coins.jpg | 252×312, 3 | 맞닿은 동전 — 이진화/컨투어/동전 세기 |
| smarties.png | 413×356, 3 | 원형 캔디 — HoughCircles, 색상 |
| building.jpg | 868×600, 3 | 건물 — 엣지, HoughLines |
| box.png | 324×223, 1(흑백) | 상자 — 엣지/컨투어 |
| pic1.png | 400×300, 3 | 흰 배경의 검은 도형 실루엣(사각형, 삼각형, 사람 얼굴 등) — 컨투어 |
| cards.png | 640×480, 4 | 흰 배경에 흩어진 카드 — 컨투어/원근 변환 |
| stuff.jpg | 640×480, 3 | 책상 위 물건(연필, 라이터, 동전, 공) — 색 추적/컨투어 |
| detect_blob.png | 540×760, 4 | 검은 배경 초록/파랑 원·사각형·타원 — 색 공간, 컨투어 특징 |
| blox.jpg | 256×256, 3 | 흑백 블록 도형 — 엣지/컨투어 |
| notes.png | 1024×134, 3 | 악보 — 모폴로지로 선 추출 |
| butterfly.jpg | 493×356, 3 | 나비 — 필터 |
| fruits.jpg | 512×480, 3 | 과일 — 색공간/히스토그램 |
| baboon.jpg | 512×512, 3 | 맨드릴 — 필터/노이즈 |
| starry_night.jpg | 752×600, 3 | 고흐 그림 — 사진 필터 |
| apple.jpg, orange.jpg | 512×512, 3 | 피라미드 블렌딩 튜토리얼 |
| HappyFish.jpg | 259×194, 3 | 물고기 그림 — 크기 조절 |
| LinuxLogo.jpg, WindowsLogo.jpg | 320×240, 3 | 같은 크기 로고 — addWeighted 블렌딩 |
| chessboard.png | 1754×1240, 4 | 체스판 — 기하 변환 (크니까 줄여서 사용) |

`cv.imread()` 기본값은 3채널 BGR 로 읽습니다(투명 PNG 도 3채널). 알파가 필요하면 `cv.IMREAD_UNCHANGED`.

### 샘플 동영상 (videos/ — OpenCV 저장소 영상을 브라우저용 MP4 로 변환)

| 이름 (VideoCapture 에 쓰는 이름) | 크기 · fps · 프레임 | 내용 · 용도 |
|---|---|---|
| `vtest.avi` (= vtest.mp4) | 768×576 · 10fps · 795 | 거리를 걷는 보행자 — Getting Started with Videos 튜토리얼 영상, 배경 차분·움직임 검출 |
| `Megamind.avi` (= Megamind.mp4) | 720×528 · 24fps · 270 | 애니메이션 장면 — 프레임 처리, 필터 |
| `cup.mp4` | 640×480 · 27fps · 217 | 손으로 움직이는 컵 — 색상/객체 추적 |

학생은 ⬆ 업로드로 자기 동영상(mp4/webm)도 추가할 수 있습니다.

## 4. 검증

작성 후 반드시 로컬 검증기를 실행해 모든 코드가 오류 없이 도는지 확인합니다.

```bash
python tools/validate.py w1      # w1-* 교시만
python tools/validate.py         # 전체
```

검증기는 cv2 GUI 함수를 웹 환경과 같은 규칙으로 흉내 내고, 등록된 트랙바/마우스 콜백과 `process()` 도 한 번씩 호출합니다.
