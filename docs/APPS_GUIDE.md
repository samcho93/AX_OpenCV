# 🚀 응용 예제(실전 데모) 작성 가이드

강좌 페이지의 **🚀 응용 예제** 메뉴는 OpenCV 가 현실에서 쓰이는 모습을 보여주는 데모 모음입니다.
학생은 **코드를 보지 않고** 설명을 읽은 뒤 **▶ 데모 실행**으로 결과를 확인합니다.
데모의 Python 코드는 숨겨진 채 브라우저(Pyodide, opencv-python 4.11, numpy 2.2)에서 실행되고,
결과는 오른쪽 패널(입력 소스 · 트랙바 · 결과 창 · 콘솔)에 나타납니다.

## 1. 등록 형식 (`apps/<분류>.js`)

```js
/* 🏭 머신비전 외관검사 데모 */
APPS.add({
  id: 'pcb',                         // 영문 소문자 · 숫자 · 하이픈 (주소 #app-pcb)
  cat: 'inspection',                 // 'dnn' | 'vision' | 'inspection'
  icon: '🔌',
  title: 'PCB 외관 결함 검사',
  subtitle: '기준(골든) 이미지와 비교해 부품 누락 · 납땜 불량을 찾기',   // 한 줄
  summary: `<p>2~4문장 소개. 무엇을 · 왜 · 어떻게.</p>`,
  uses: [                            // 현장 활용 사례 3~5개: [분야, 설명]
    ['전자 제조(SMT)', 'AOI 장비가 PCB 의 부품 누락 · 뒤집힘 · 납땜 브리지를 검사'],
  ],
  steps: [                           // 처리 과정 4~7단계 (각 1줄, <code> 가능)
    '기준 이미지와 검사 이미지를 흑백으로 변환',
    'ORB 특징점 + 호모그래피로 위치 · 각도 정렬',
  ],
  tech: ['cv.ORB_create', 'cv.findHomography', 'cv.absdiff', 'cv.threshold', 'cv.findContours'],
  controls: [                        // 트랙바 설명 (없으면 빈 배열)
    ['sensitivity', '차이를 결함으로 볼 기준값. 낮을수록 민감'],
  ],
  inputs: ['pcb_ok.png', 'pcb_missing.png', 'video:vtest.mp4', 'camera'],   // 추천 입력 (첫 번째가 기본)
  assets: ['pcb_golden.png', 'pcb_ok.png', 'pcb_missing.png'],               // 이 데모가 쓰는 images/apps/ 또는 models/ 파일
  note: '브라우저에서는 … (속도 · 제한 안내, 선택)',
  refs: [['OpenCV: Feature Matching + Homography', 'https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html']],
  code: String.raw`
import cv2 as cv
import numpy as np
...
def process(frame):
    ...
    return result
`,
});
```

### 입력(`inputs`) 표기

| 표기 | 뜻 |
|---|---|
| `'street.png'` | 이미지. `images/apps/` 에 있으면 데모를 열 때 자동으로 불러오고, 없으면 기존 샘플 이미지(`images/`) |
| `'video:vtest.mp4'` | 샘플 동영상 (`vtest.mp4`, `Megamind.mp4`, `cup.mp4`) |
| `'camera'` | 📷 웹캠 |

`assets` 에는 `images/apps/` 의 이미지와 `models/` 의 모델 파일 이름을 적습니다. 실행 전에 브라우저 가상 폴더(작업 폴더)에 같은 이름으로 복사되므로
코드에서는 `cv.imread('pcb_golden.png')`, `cv.dnn.readNetFromONNX('yolox_nano.onnx')` 처럼 **파일 이름만** 씁니다.

## 2. 코드 규칙

- 반드시 `def process(frame):` 를 정의하고 **결과 이미지를 return** 합니다. 입력 소스(이미지 · 동영상 · 웹캠)의 프레임이 들어옵니다.
  (이미지면 1번, 트랙바를 움직일 때마다 다시 호출. 동영상 · 웹캠이면 매 프레임)
- 모델 읽기 · 기준 이미지 읽기 · 트랙바 만들기처럼 한 번만 할 일은 `process` 밖(맨 위)에서.
- 트랙바: `cv.namedWindow('result')` 후 `cv.createTrackbar('이름', 'result', 기본값, 최댓값, lambda x: None)`, `process` 안에서 `cv.getTrackbarPos`.
- **결과 이미지에 판정 · 수치를 그려 넣기** (예: 좌상단 `OK` 초록 / `NG` 빨강 배지, 결함 위치 상자와 번호, 측정값). `cv.putText` 는 영어만 가능.
  보조 결과(마스크, 차영상 등)는 `cv.imshow('mask', …)` 로 추가 창에 보여줘도 좋습니다.
- 콘솔(`print`)에는 한국어로 요약 결과를 짧게 (매 프레임 출력은 피하고 이미지 입력일 때 위주).
- 어떤 크기의 입력(웹캠 640×480 포함)이 들어와도 오류 없이 동작해야 합니다. 검사용 기준 이미지가 필요한 데모에 엉뚱한 입력(웹캠 등)이 들어오면
  오류 대신 "NO PART" 같은 안내를 그려서 반환하세요.
- 속도: 브라우저는 느립니다. 한 프레임 처리가 **0.3초 이하**가 되도록 (필요하면 작업 해상도를 줄이기). 파이썬 이중 for 문으로 픽셀 순회 금지.
- numpy 2 (`np.int0` 없음 → `np.intp`), `cv.imshow` 에 bool 배열 금지.
- 사용할 수 있는 모듈: `cv2`(dnn, objdetect(QR · barcode · HOG · FaceDetectorYN), aruco, video(MOG2), features2d, calib3d, photo, stitching 포함), `numpy`, `math`, `time`.

## 3. 합성 검사 이미지

머신비전 데모용 이미지는 실제 공개 데이터셋의 라이선스 문제를 피하기 위해 **직접 생성**합니다.
분류별 스크립트 `tools/gen_app_images_<분류>.py`(예: `gen_app_images_inspection.py`)에 생성 코드를 작성하면 `images/apps/` 에 PNG 가 만들어집니다.
`python tools/gen_app_images.py` 는 모든 분류 스크립트를 차례로 실행합니다.
- 현실감: 조명 그라데이션, 센서 노이즈, 약간의 위치 · 각도 흔들림, 부드러운 가장자리(블러)를 넣어 “실제 카메라로 찍은 듯”하게.
- 한 데모에 **정상(OK) 1~2장 + 불량(NG) 2~3장**, 불량 유형이 서로 다르게. 파일 이름에 유형이 드러나게 (`pcb_ok.png`, `pcb_missing.png`).
- ⚠️ 이 프로젝트 경로에는 한글이 있어 **Windows 에서 `cv2.imwrite`/`cv2.imread` 가 실패**합니다. 저장은 `cv2.imencode` + `open(path,'wb').write(buf.tobytes())`, 읽기는 `cv2.imdecode(np.fromfile(path, np.uint8), …)` 를 쓰세요. (브라우저 안의 데모 코드는 파일 이름만 쓰므로 해당 없음)
- 크기는 640×480 안팎, PNG 한 장 500KB 이하 권장. 난수는 시드 고정.

## 4. 검증

```bash
python tools/gen_app_images.py          # 합성 이미지 생성
python tools/test_apps.py [id...]       # 모든 입력에 대해 실행 · 결과 이미지 저장 · 시간 측정 · 카드 썸네일 생성
```

`test_apps.py` 는 각 데모를 입력별로 실행해 결과를 `.cache/apps_out/<id>/` 에 저장하고(직접 열어 눈으로 확인할 것),
기본 입력의 결과로 갤러리 썸네일 `images/apps/thumbs/<id>.jpg` 를 만듭니다.
