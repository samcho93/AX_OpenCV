# OpenCV-Python 5주 강좌 (웹 실습형)

OpenCV.org 공식 Python 튜토리얼을 기반으로 한 **초보자용 5주 · 41교시**(1주차 0교시 오리엔테이션 + 매주 1~8교시) 강좌입니다.
설치 없이 브라우저 안에서 진짜 Python + OpenCV(Pyodide, opencv-python 4.11)를 실행하며,
샘플 이미지 · 업로드 이미지 · 웹캠으로 결과를 바로 확인할 수 있습니다.

| 구분 | 주차 | 내용 |
|---|---|---|
| 교육 | 1주 | 영상처리 기초 이론(픽셀 · 흑백/컬러 · 활용 분야) · 입문 · GUI(이미지/비디오 입출력, 그리기, 마우스, 트랙바) · 코어 연산 |
| 교육 | 2주 | Image Processing Ⅰ — 색 공간, 기하 변환, 임계처리, 스무딩 |
| 교육 | 3주 | Image Processing Ⅱ — 모폴로지, 그래디언트, Canny, 피라미드, 컨투어, 히스토그램, 템플릿 매칭, 허프 변환 |
| 프로젝트 | 4주 | 가이드 프로젝트(문서 스캐너, 동전·도형 분석기, 웹캠 가상 페인터, 사진 필터 앱) · 팀 프로젝트 기획 · 프로토타입 |
| 프로젝트 | 5주 | 구현(모듈화 → 알고리즘 → 실시간 → 인터랙션) · 디버깅 · 발표 · 회고 |

## 🎓 심화 과정 (`index.html?course=advanced` 또는 `advanced.html`)

입문 과정 수료자를 위한 **5주 · 41교시** 심화 과정입니다. 형식(교시 내용 · 실습 · 퀴즈 · 교사용 요약 슬라이드 · 노드 편집기 연동)은 입문 과정과 같고,
OpenCV.org Python 튜토리얼의 *Feature Detection and Description*, *Camera Calibration and 3D Reconstruction*,
*Machine Learning*, *Object Detection* 을 기반으로 합니다. 강좌 상단의 과정 전환 버튼으로 입문 ↔ 심화를 오갈 수 있으며, 진도는 과정별로 따로 저장됩니다.

| 구분 | 주차 | 내용 |
|---|---|---|
| 교육 | 1주 | 특징점 검출과 기술 — Harris · Shi-Tomasi · SIFT · FAST/BRIEF(AKAZE · BRISK) · ORB · 특징점 매칭 · 호모그래피 |
| 교육 | 2주 | 카메라 캘리브레이션과 3D — 카메라 모델 · 체스보드 · 캘리브레이션 · 왜곡 보정 · 자세 추정(AR) · 에피폴라 기하 · 스테레오 깊이 · ArUco |
| 교육 | 3주 | 머신러닝과 객체 검출 — kNN · SVM(+HOG) 손글씨 OCR · K-Means · Haar 캐스케이드 · HOG 보행자 · DNN(YOLOX · YuNet) |
| 프로젝트 | 4주 | 가이드 프로젝트(파노라마, 평면 물체 AR 오버레이, 캘리브레이션 실측, 손글씨 숫자 인식기) · 팀 프로젝트 기획 · 프로토타입 |
| 프로젝트 | 5주 | 구현(데이터 · 학습/평가 · 실시간 최적화 · 3D 결합) · 테스트/디버깅 · 발표 · 회고 |

- 심화 교시용 이미지: `images/adv/` (OpenCV 공식 samples/data — 체스보드 left01~14, 스테레오 쌍, box/box_in_scene, graf, 파노라마, digits, letter-recognition)
- 작성 가이드: `docs/ADVANCED_GUIDE.md`, 검증: `python tools/validate.py a1`, `node tools/check_slides.js a1`
- 교사용/학생용 페이지도 `teacher.html?course=advanced`, `student.html?course=advanced` 로 열 수 있습니다.

## 실행 방법

1. `start.bat` 을 더블클릭합니다. (Python 이 설치되어 있어야 합니다)
   또는 이 폴더에서 `python -m http.server 8765` 실행 후 http://localhost:8765 접속
2. 첫 접속 시 Python/OpenCV 를 내려받느라 수십 초가 걸립니다(이후 캐시됨). **인터넷 연결이 필요합니다.**
3. 웹캠은 `http://localhost` 또는 `https` 주소에서만 사용할 수 있습니다.

> `index.html` 을 파일로 직접 열어도 대부분 동작하지만, 웹캠 권한 때문에 로컬 서버 사용을 권장합니다.

## 🚀 응용 예제 (실전 데모)

강좌 왼쪽 메뉴의 **🚀 응용 예제**(`index.html#apps`)에서 OpenCV 가 현실에서 쓰이는 모습을 **코드 없이 실행**해 볼 수 있습니다.
각 데모는 현장 활용 사례 · 동작 원리 · 사용한 OpenCV 기능 설명과 **▶ 데모 실행** 버튼, 입력(이미지 · 동영상 · 웹캠) 바꾸기, 트랙바 조절을 제공합니다.

| 분류 | 데모 |
|---|---|
| 🤖 딥러닝 | YOLO(YOLOX) 객체 인식 · YuNet 얼굴 검출/모자이크 · PP-HumanSeg 사람 분할/가상 배경 · PP-OCR 글자 영역 검출 |
| 🏙️ 실무 영상 분석 | 택배 송장 QR · 바코드 인식 · HOG 보행자 검출 · 침입 감지(MOG2) · ArUco 마커 AR |
| 🏭 머신비전 외관검사 | PCB 결함 · 금속 표면 스크래치 · 와셔 치수 측정 · 블리스터 알약 누락 · 병 충진/캡 검사 |

- 모델: `models/` — YOLOX(Megvii, Apache-2.0), YuNet(MIT), PP-HumanSeg · PP-OCRv3(OpenCV Zoo, Apache-2.0)
- 이미지: `images/apps/` — street.png · dog416.png(opencv_extra), imageTextR.png(OpenCV samples), 나머지는 `tools/gen_app_images*.py` 로 만든 교육용 합성 이미지
- 데모 추가 방법: `docs/APPS_GUIDE.md`, 검증: `python tools/test_apps.py`

## 🧩 노드 편집기 (`nodes.html`)

코드를 쓰지 않고 **블록(노드)을 연결해** OpenCV 프로그램을 만드는 별도 페이지입니다.

- **화면**: 왼쪽 블록 팔레트(강좌에 나오는 OpenCV · NumPy · Matplotlib 함수 약 180개 + Python 코드 블록) · 가운데 편집 화면 · 오른쪽 입력 소스 · 프리뷰 · 상태/속성/창/콘솔/Python 코드
- **연결**: 노드 오른쪽 ●(출력)을 끌어 다른 노드 왼쪽 ●(입력)에 놓기. 인자 칸에는 숫자 · 튜플 · `cv.상수` 같은 Python 식을 직접 입력
- **실행**: 연결하거나 값을 바꾸면 자동 실행. 노드마다 결과 썸네일, 선택한 노드는 오른쪽 프리뷰에 크게 표시
- **실시간**: `📷 입력 소스` 블록에서 시작하는 노드(초록 테두리 ⟳)는 이미지 · 🎞️ 동영상 · 📷 웹캠의 매 프레임마다 실행
- **코드와 동일한 실행**: 노드 그래프는 Python 코드로 컴파일되어 강좌와 같은 실행 환경에서 돌아갑니다. `Python 코드` 탭에서 코드를 확인 · 복사 · 강좌 에디터로 보내기
- **강좌와 전환**: 강좌의 모든 예제 옆 **🧩 노드** 버튼 → 노드 편집기 창에서 블록으로 열림. 노드 편집기의 **📘 강좌로** / **📘 강좌 에디터로 보내기** 로 돌아가기. `📚 예제 불러오기`로 41개 교시의 예제를 바로 불러올 수 있음
- 저장: 자동 저장(브라우저) + JSON 파일 저장/열기, 되돌리기 `Ctrl+Z`

검증: `python tools/test_nodes.py --run` (모든 예제 코드 → 노드 → 코드 왕복이 원본과 같은지, 실행되는지)

## 학생용 · 교사용

| 페이지 | 기본 보기 | 추가 기능 |
|---|---|---|
| `student.html` (🎓 학생용) | 스크롤 문서 + 실습 | 🖼️ 슬라이드 보기, ⛶ 전체 화면 |
| `teacher.html` (🧑‍🏫 교사용) | 요약 슬라이드(교안) | 교사용 노트(말할 내용 · 발문 · 시간 안배), 퀴즈 정답, 실습 정답 실행, 수업 타이머, 🗒 발표자 창 |

- **🔒 교사용 비밀번호**: 교사용으로 처음 전환할 때 비밀번호를 묻습니다. 기본값 `933228`(고정). 한 번 확인하면 그 브라우저에서는 과정을 바꾸거나 새로 고쳐도 다시 묻지 않습니다.
- **슬라이드 조작(교사용)**: 슬라이드 좌우 가장자리 클릭 = 이전/다음, 상단 ⏮ 처음 · 페이지 슬라이더
- **✏️ 판서(교사용)**: 슬라이드 가운데(지시봉 커서)에서 끌어 그리기. 상단 둘째 줄에서 펜 · 형광펜 · 지우개 · 지시봉, 색 6가지, 굵기 3단계, 되돌리기(Ctrl+Z) · 이 장 지우기 · 모두 지우기. 판서는 슬라이드마다 따로 남고 새로 고치면 지워집니다.
- **⛶ 전체 화면 발표**: 슬라이드를 크게 보여주고, 예제 코드 슬라이드에서 ▶ 실행하면 오른쪽에 결과 패널이 함께 표시됩니다.
- **발표자 창**(`presenter.html`): 노트 · 다음 슬라이드 · 타이머. 프로젝터에는 전체 화면, 교사 모니터에는 발표자 창을 띄우면 함께 넘어갑니다.
- 키보드: `←` `→` 이동, `F` 전체 화면, `G` 목록, `R` 결과 패널, `N` 노트, `B` 화면 가리기, `T` 타이머
- 딥링크: `teacher.html#w2-5@6` → 2주차 5교시 6번째 슬라이드
- 요약 슬라이드는 `slides/weekN.js` 에 있으며 작성 방법은 `docs/SLIDE_GUIDE.md`, 검사는 `node tools/check_slides.js`

## 화면 구성

- **왼쪽**: 주차/교시 네비게이션, 진도(브라우저에 저장), 검색
- **가운데**: 강좌 내용(학습 목표 · 수업 흐름 · 개념 · 예제 · 실습 과제 · 퀴즈) + 코드 에디터(`Ctrl+Enter` 실행)
- **오른쪽**: 입력 소스(샘플 이미지/업로드/웹캠), 트랙바, `cv.imshow()` 결과 창(픽셀값 확인·확대·다운로드), 콘솔

## 폴더 구조

```
index.html            메인 페이지
css/style.css         스타일 (라이트/다크)
js/course.js          입문 5주 × 8교시 커리큘럼(제목·OpenCV.org 참고 링크)
js/course-advanced.js 심화 5주 × 8교시 커리큘럼
js/app.js             네비게이션 · 강좌 렌더링 · 에디터 · 진도 저장
js/runtime.js         Pyodide 로드, 결과 패널, 웹캠, 실시간 process(frame) 루프
js/webcv-bridge.js    cv2 GUI 함수(imshow, 트랙바, 마우스, VideoCapture …)를 웹 패널에 연결하는 Python 코드
js/images-data.js     샘플 이미지 묶음 (tools/build_images.py 로 생성)
lessons/week1~5.js    교시별 상세 내용 (입문)
lessons-adv/week1~5.js 심화 과정 교시 내용
slides/, slides-adv/  교사용 요약 슬라이드 (입문 / 심화)
images/adv/           심화 과정 이미지 · 데이터
advanced.html         심화 과정 바로가기
images/               OpenCV 공식 저장소 샘플 이미지
videos/               OpenCV 공식 저장소 샘플 동영상 (vtest, Megamind, cup — 브라우저용 H.264 MP4 로 변환)
docs/LESSON_GUIDE.md  강의 콘텐츠 작성 가이드
tools/validate.py     로컬 Python 으로 모든 예제 코드 검증
tools/selftest.js     브라우저(Pyodide)에서 모든 예제 코드 검증
nodes.html            🧩 노드 편집기 페이지
js/nodes/catalog.js   블록 카탈로그 (tools/build_catalog.py 로 생성)
js/nodes/converter.js Python 코드 → 노드 그래프 변환기 (Pyodide 에서 실행)
js/nodes/graph.js     노드 그래프 분석 · Python 컴파일 · 자동 배치
js/nodes/editor.js    노드 편집 캔버스
js/nodes/app.js       노드 편집기 페이지 (팔레트 · 프리뷰 · 실행 · 강좌 연동)
tools/test_nodes.py   예제 코드 ↔ 노드 왕복 테스트
```

## 강의 내용 수정/추가

`docs/LESSON_GUIDE.md` 의 형식을 따라 `lessons/weekN.js` 를 수정한 뒤 검증합니다.

```bash
python tools/validate.py        # 전체 (또는 w2 처럼 교시 접두어)
```

브라우저 검증: 강좌 페이지를 연 상태에서 개발자 콘솔에 입력

```js
await import('./tools/selftest.js'); const r = await selftest('w1'); console.table(r.failures)
```

## 웹 실습 환경과 데스크톱 OpenCV 의 차이

- `cv.VideoCapture('vtest.avi')`(샘플 동영상·업로드 동영상) / `cv.VideoCapture(0)`(웹캠)은 실행 전에 영상을 준비하고, `cap.read()` 는 현재 프레임 1장을 돌려줍니다
- `while True:` + `cap.read()`/`cv.waitKey()` 반복은 사용할 수 없습니다 → `def process(frame):` 를 정의하고 결과 이미지를 `return` (웹캠·동영상의 매 프레임에 자동 적용)
- `cv.waitKey()`, `cv.destroyAllWindows()` 는 바로 반환됩니다
- `cv.imwrite()` 로 저장한 파일은 콘솔의 링크로 다운로드합니다
- Matplotlib 그래프는 결과 패널에 그림으로 표시됩니다(한글 폰트 없음 → 라벨은 영어)

## 출처

- 튜토리얼: [OpenCV-Python Tutorials](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
- 이미지: [opencv/opencv](https://github.com/opencv/opencv) `samples/data`, `doc/py_tutorials`
- 실행 환경: [Pyodide](https://pyodide.org), [CodeMirror 5](https://codemirror.net/5/)
