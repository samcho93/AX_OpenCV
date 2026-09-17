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

## 실행 방법

1. `start.bat` 을 더블클릭합니다. (Python 이 설치되어 있어야 합니다)
   또는 이 폴더에서 `python -m http.server 8765` 실행 후 http://localhost:8765 접속
2. 첫 접속 시 Python/OpenCV 를 내려받느라 수십 초가 걸립니다(이후 캐시됨). **인터넷 연결이 필요합니다.**
3. 웹캠은 `http://localhost` 또는 `https` 주소에서만 사용할 수 있습니다.

> `index.html` 을 파일로 직접 열어도 대부분 동작하지만, 웹캠 권한 때문에 로컬 서버 사용을 권장합니다.

## 학생용 · 교사용

| 페이지 | 기본 보기 | 추가 기능 |
|---|---|---|
| `student.html` (🎓 학생용) | 스크롤 문서 + 실습 | 🖼️ 슬라이드 보기, ⛶ 전체 화면 |
| `teacher.html` (🧑‍🏫 교사용) | 요약 슬라이드(교안) | 교사용 노트(말할 내용 · 발문 · 시간 안배), 퀴즈 정답, 실습 정답 실행, 수업 타이머, 🗒 발표자 창 |

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
js/course.js          5주 × 8교시 커리큘럼(제목·OpenCV.org 참고 링크)
js/app.js             네비게이션 · 강좌 렌더링 · 에디터 · 진도 저장
js/runtime.js         Pyodide 로드, 결과 패널, 웹캠, 실시간 process(frame) 루프
js/webcv-bridge.js    cv2 GUI 함수(imshow, 트랙바, 마우스, VideoCapture …)를 웹 패널에 연결하는 Python 코드
js/images-data.js     샘플 이미지 묶음 (tools/build_images.py 로 생성)
lessons/week1~5.js    교시별 상세 내용
images/               OpenCV 공식 저장소 샘플 이미지
videos/               OpenCV 공식 저장소 샘플 동영상 (vtest, Megamind, cup — 브라우저용 H.264 MP4 로 변환)
docs/LESSON_GUIDE.md  강의 콘텐츠 작성 가이드
tools/validate.py     로컬 Python 으로 모든 예제 코드 검증
tools/selftest.js     브라우저(Pyodide)에서 모든 예제 코드 검증
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
