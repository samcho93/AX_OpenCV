# 🎓 심화 과정 작성 가이드 (입문 가이드의 추가 규칙)

심화 과정은 **입문 과정과 같은 형식**입니다. 먼저 `docs/LESSON_GUIDE.md`(교시 형식 · 웹 실습 규칙)와
`docs/SLIDE_GUIDE.md`(요약 교안 슬라이드)를 읽고, 아래 차이점을 따르세요.

- 페이지: `index.html?course=advanced` (또는 `advanced.html`). 과정 정의: `js/course-advanced.js`
- 교시 id: `a<주>-<교시>` (예: `a1-0`, `a2-5`). 제목 · 주제 · OpenCV.org 참고 링크는 `js/course-advanced.js` 에 이미 있음
- 교시 내용: `lessons-adv/weekN.js` (`COURSE.addLessons([...])`)
- 요약 슬라이드: `slides-adv/weekN.js` (`COURSE.addSlides({...})`)
- 대상: **입문 과정 수료자**(imread · 필터 · 컨투어 · process(frame) 은 안다). 그래도 수학은 비유와 그림 중심으로 쉽게.
- 기반: OpenCV.org Python 튜토리얼의 *Feature Detection and Description*, *Camera Calibration and 3D Reconstruction*,
  *Machine Learning*, *Object Detection(Cascade Classifier)* + DNN 검출(YOLO · YuNet).

## 1. 교시별 추가 파일: `assets`

심화 교시는 이미지 · 모델을 교시 단위로 불러옵니다. 교시 객체에 `assets` 를 적으면 **교시를 열 때 자동으로** 브라우저 가상 폴더에
**파일 이름만으로** 복사됩니다 (이미지는 오른쪽 입력 소스 목록에도 추가).

```js
{
  id: 'a2-3',
  assets: ['images/adv/left01.jpg', 'images/adv/left02.jpg', 'models/yolox_nano.onnx'],
  ...
  // 코드에서는 cv.imread('left01.jpg'), cv.dnn.readNetFromONNX('yolox_nano.onnx') 처럼 파일 이름만
}
```

- 기존 입문 샘플 이미지(`images/*.jpg|png`: messi5, lena, home, box, blox, building …)와 샘플 동영상(`vtest.avi` 등)은 assets 없이 바로 사용 가능
- 슬라이드 · 본문 `image` 블록에서 심화 이미지를 보여줄 때는 `src: 'adv/left01.jpg'`, 슬라이드 `image: 'adv/left01.jpg'`

### 사용할 수 있는 파일

| 경로 | 내용 · 용도 |
|---|---|
| `images/adv/left01.jpg` ~ `left09.jpg`, `left11.jpg` ~ `left14.jpg` | 체스보드 13장, 640×480 — 캘리브레이션 튜토리얼 원본. 실제 내부 코너는 **9×6** (`(9,6)` → 13장 모두 검출). 튜토리얼의 `(7,6)` 은 9장만 검출 |
| `images/adv/left.jpg`, `right.jpg` | 책 두 권을 좌우에서 찍은 스테레오 쌍 612×459 — 에피폴라 기하 |
| `images/adv/tsukuba_l.png`, `tsukuba_r.png` | Tsukuba 스테레오 쌍 384×288 — 깊이 맵 (튜토리얼 원본) |
| `images/adv/aloeL.jpg`, `aloeR.jpg` | 알로에 스테레오 쌍 640×555 — 깊이 맵 |
| `images/adv/box.png`, `box_in_scene.png` | 상자(쿼리)와 상자가 놓인 장면 — 특징 매칭 · 호모그래피 튜토리얼 원본 |
| `images/adv/graf1.jpg`, `graf3.jpg` | 벽화를 다른 각도에서 찍은 쌍 640×512 — 특징점 · 호모그래피 |
| `images/adv/s1.jpg`, `s2.jpg` | 퐁뒤가르 다리 파노라마 쌍 (가로 800) — 파노라마 |
| `images/adv/digits.png` | 손글씨 숫자 5000개(20×20, 숫자마다 500개, 2000×1000) — kNN/SVM OCR 튜토리얼 원본 |
| `images/adv/letter-recognition.data` | UCI 영문자 20000개 특징 (CSV) — kNN 영문자 인식 |
| `images/apps/street.png`, `dog416.png`, `parcel_*.png`, `aruco_board.png`, `aruco_scene.png` | 응용 예제 이미지 (사람 · 차 · 개, 송장, ArUco 마커 장면) |
| `models/yolox_nano.onnx`(3.5MB), `yolox_tiny.onnx`(20MB) | YOLOX COCO 80 클래스 (입력 416, 출력 디코딩은 `apps/dnn.js` 의 yolo 코드 참고) |
| `models/face_detection_yunet_2023mar.onnx` | YuNet 얼굴 검출 (`cv.FaceDetectorYN`) |
| Haar 캐스케이드 | 파일 복사 불필요: `cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')` (eye, smile, fullbody, upperbody, frontalcatface, russian_plate_number 등 내장) |

## 2. 사용할 수 있는 기능 (브라우저 OpenCV 4.11 에서 확인함)

- 특징점: `cv.cornerHarris`, `cv.cornerSubPix`, `cv.goodFeaturesToTrack`, `cv.SIFT_create`, `cv.ORB_create`, `cv.FastFeatureDetector_create`,
  `cv.AKAZE_create`, `cv.BRISK_create`, `cv.BFMatcher`, `cv.FlannBasedMatcher`, `cv.drawKeypoints`, `cv.drawMatches`, `cv.drawMatchesKnn`,
  `cv.findHomography`, `cv.perspectiveTransform`, `cv.Stitcher_create`, `cv.calcOpticalFlowPyrLK`
- **없음(opencv-contrib)**: `cv.xfeatures2d` (SURF, BRIEF, FREAK, StarDetector). 튜토리얼의 해당 코드는 `norun: true` 로 보여주고,
  대신 실행 가능한 대안(SIFT · ORB · AKAZE · BRISK)을 제공하세요.
- 3D: `cv.findChessboardCorners`, `cv.drawChessboardCorners`, `cv.calibrateCamera`, `cv.getOptimalNewCameraMatrix`, `cv.undistort`,
  `cv.initUndistortRectifyMap`, `cv.remap`, `cv.solvePnP`, `cv.solvePnPRansac`, `cv.projectPoints`, `cv.Rodrigues`, `cv.drawFrameAxes`,
  `cv.findFundamentalMat`, `cv.computeCorrespondEpilines`, `cv.StereoBM_create`, `cv.StereoSGBM_create`, `cv.aruco.ArucoDetector`
- 머신러닝: `cv.ml.KNearest_create`, `cv.ml.SVM_create`(+`trainAuto`), `cv.ml.ANN_MLP_create`, `cv.ml.RTrees_create`, `cv.kmeans`
- 검출: `cv.CascadeClassifier`, `cv.HOGDescriptor` (+`HOGDescriptor_getDefaultPeopleDetector`), `cv.dnn.readNetFromONNX`, `cv.FaceDetectorYN`, `cv.FaceRecognizerSF_create`(모델 없음)
- 파일 저장/불러오기: `np.savez('calib.npz', mtx=mtx, dist=dist)` → 같은 실행(또는 이후 실행)에서 `np.load('calib.npz')` 가능 (가상 폴더는 페이지를 새로 고치기 전까지 유지)
- Matplotlib 사용 가능 (그래프 · 산점도 · 제목은 영어)

## 3. 속도 기준 (브라우저에서 측정한 값)

브라우저는 로컬 Python 보다 **약 5~10배 느립니다**. 예제 한 개가 브라우저에서 **3초 이내**(로컬 검증기 기준 약 0.4초 이내),
`process(frame)` 한 프레임이 **0.3초 이내**가 되도록 설계하세요.

| 작업 (브라우저) | 시간 |
|---|---|
| 체스보드 13장 `findChessboardCorners` + `cornerSubPix` | 2.7 초 (13장 중 9장 검출) |
| `calibrateCamera` (9장) | 0.3 초 |
| `SIFT.detectAndCompute` 800px 이미지 | 1.7 초 (3808점) → 필요하면 축소 · `nfeatures` 제한 |
| `Stitcher.stitch([s1, s2])` | 1.9 초 |
| `StereoSGBM` Tsukuba | 0.7 초 |
| Haar 얼굴 검출 lena.jpg | 0.45 초 |
| kNN digits 원본(2500×400차원 학습, 2500 테스트) | **7 초 — 너무 느림** → 테스트 500개로 줄이거나 HOG · 축소 특징 사용 |
| HOG 특징 5000개 계산 + SVM 학습 + 예측 | 0.3 + 0.5 + 0.6 초 (정확도 96.6%) |
| kNN 영문자 10000 학습 / 10000 테스트 | 3.3 초 (정확도 93%) → 테스트 줄이기 권장 |

## 4. 검증

```bash
python tools/validate.py a1                 # 심화 1주차 코드 실행 검증 (assets 자동 복사)
node tools/check_slides.js a1               # 심화 1주차 요약 슬라이드 검사
```

브라우저: `index.html?course=advanced` 를 열고 개발자 콘솔에서
`await import('./tools/selftest.js'); const r = await selftest('a1'); console.table(r.failures)`
