/* =========================================================================
 * 심화 과정 구성 (5주 · 41교시: 1주차 0~8교시 + 2~5주차 각 1~8교시)
 *  - 1~3주: 교육 (특징점 검출과 기술 → 카메라 캘리브레이션과 3D → 머신러닝 · 객체 검출)
 *  - 4~5주: 프로젝트 (가이드 프로젝트 → 팀 프로젝트 → 발표)
 * 각 교시의 상세 내용은 lessons-adv/weekN.js 에서 COURSE.addLessons()로 등록합니다.
 * ========================================================================= */
(function () {
  const DOC = 'https://docs.opencv.org/4.x/';

  const weeks = [
    {
      no: 1, kind: '교육', title: '특징점 검출과 기술 (Feature Detection & Description)',
      desc: '코너 · 블롭 같은 “좋은 특징”을 찾고(Harris, Shi-Tomasi, FAST, SIFT, ORB), 특징점끼리 매칭해 호모그래피로 물체를 찾습니다.',
    },
    {
      no: 2, kind: '교육', title: '카메라 캘리브레이션과 3D 재구성',
      desc: '카메라 내부 파라미터와 렌즈 왜곡을 구하고 보정한 뒤, 자세 추정 · 에피폴라 기하 · 스테레오 깊이로 2D 영상에서 3D 정보를 얻습니다.',
    },
    {
      no: 3, kind: '교육', title: '머신러닝과 객체 검출',
      desc: 'kNN · SVM · K-Means 로 데이터를 학습 · 분류하고, Haar 캐스케이드 · HOG · DNN(YOLO) 으로 얼굴 · 사람 · 물체를 검출합니다.',
    },
    {
      no: 4, kind: '프로젝트', title: '프로젝트 Ⅰ · 가이드 프로젝트와 기획',
      desc: '파노라마, AR 오버레이, 캘리브레이션 실측, 손글씨 인식기를 따라 만들고 팀 프로젝트를 기획해 프로토타입을 만듭니다.',
    },
    {
      no: 5, kind: '프로젝트', title: '프로젝트 Ⅱ · 구현과 발표',
      desc: '데이터 · 특징 설계부터 학습 · 평가, 실시간 적용, 3D 결합, 디버깅을 거쳐 결과를 발표하고 회고합니다.',
    },
  ];

  const syllabus = [
    // ---------------- 1주차: 특징점 ----------------
    ['a1-0', '심화 과정 소개와 준비', '입문 과정 복습, 심화 로드맵, 특징 · 3D · 머신러닝 · 검출의 활용', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html'], ['Feature Detection and Description', 'db/d27/tutorial_py_table_of_contents_feature2d.html']]],
    ['a1-1', '특징이란 무엇인가', '좋은 특징(코너 · 엣지 · 평탄 영역), 퍼즐 비유, 특징점과 기술자', [['Understanding Features', 'df/d54/tutorial_py_features_meaning.html']]],
    ['a1-2', 'Harris 코너 검출', 'cornerHarris, 코너 응답, cornerSubPix 서브픽셀 정밀도', [['Harris Corner Detection', 'dc/d0d/tutorial_py_features_harris.html']]],
    ['a1-3', 'Shi-Tomasi 코너와 추적용 특징', 'goodFeaturesToTrack, 품질 · 최소 거리, Harris 와 비교', [['Shi-Tomasi Corner Detector & Good Features to Track', 'd4/d8c/tutorial_py_shi_tomasi.html']]],
    ['a1-4', 'SIFT: 크기 · 회전 불변 특징', '스케일 공간, 키포인트 방향, 128차원 기술자, SURF 개념', [['Introduction to SIFT', 'da/df5/tutorial_py_sift_intro.html'], ['Introduction to SURF', 'df/dd2/tutorial_py_surf_intro.html']]],
    ['a1-5', 'FAST · BRIEF 와 이진 기술자', 'FastFeatureDetector, 비최대 억제, 이진 기술자 개념, AKAZE · BRISK', [['FAST Algorithm for Corner Detection', 'df/d0c/tutorial_py_fast.html'], ['BRIEF', 'dc/d7d/tutorial_py_brief.html']]],
    ['a1-6', 'ORB: 빠르고 자유로운 특징점', 'ORB_create, 방향이 있는 FAST + 회전 BRIEF, 파라미터', [['ORB (Oriented FAST and Rotated BRIEF)', 'd1/d89/tutorial_py_orb.html']]],
    ['a1-7', '특징점 매칭', 'BFMatcher, crossCheck, knnMatch 비율 테스트, FLANN', [['Feature Matching', 'dc/dc3/tutorial_py_matcher.html']]],
    ['a1-8', '매칭 + 호모그래피로 물체 찾기와 1주차 정리', 'findHomography, RANSAC, perspectiveTransform', [['Feature Matching + Homography to find Objects', 'd1/de0/tutorial_py_feature_homography.html']]],
    // ---------------- 2주차: 캘리브레이션 · 3D ----------------
    ['a2-1', '카메라 모델과 렌즈 왜곡', '핀홀 카메라, 내부 · 외부 파라미터, 방사 · 접선 왜곡', [['Camera Calibration', 'dc/dbb/tutorial_py_calibration.html']]],
    ['a2-2', '체스보드 코너 검출', 'findChessboardCorners, cornerSubPix, drawChessboardCorners', [['Camera Calibration', 'dc/dbb/tutorial_py_calibration.html']]],
    ['a2-3', '카메라 캘리브레이션', 'calibrateCamera, 재투영 오차, 결과 저장', [['Camera Calibration', 'dc/dbb/tutorial_py_calibration.html']]],
    ['a2-4', '왜곡 보정', 'getOptimalNewCameraMatrix, undistort, initUndistortRectifyMap · remap', [['Camera Calibration', 'dc/dbb/tutorial_py_calibration.html']]],
    ['a2-5', '자세 추정과 AR 좌표축', 'solvePnP, projectPoints, 3D 축 · 큐브 그리기', [['Pose Estimation', 'd7/d53/tutorial_py_pose.html']]],
    ['a2-6', '에피폴라 기하', 'findFundamentalMat, computeCorrespondEpilines, 에피폴라 선', [['Epipolar Geometry', 'da/de9/tutorial_py_epipolar_geometry.html']]],
    ['a2-7', '스테레오 깊이 맵', 'StereoBM, StereoSGBM, 시차와 깊이', [['Depth Map from Stereo Images', 'dd/d53/tutorial_py_depthmap.html']]],
    ['a2-8', 'ArUco 마커 자세 추정과 2주차 정리', 'ArucoDetector, solvePnP, 마커 좌표계', [['Detection of ArUco Markers', 'd5/dae/tutorial_aruco_detection.html'], ['Calibration with ArUco and ChArUco', 'da/d13/tutorial_aruco_calibration.html']]],
    // ---------------- 3주차: 머신러닝 · 객체 검출 ----------------
    ['a3-1', '머신러닝 기초와 kNN', '학습 · 분류, 특징 벡터, KNearest', [['Understanding k-Nearest Neighbour', 'd5/d26/tutorial_py_knn_understanding.html']]],
    ['a3-2', 'kNN 손글씨 숫자 · 영문자 인식', 'digits.png 5000개, 학습 · 테스트 분리, 정확도', [['OCR of Hand-written Data using kNN', 'd8/d4b/tutorial_py_knn_opencv.html']]],
    ['a3-3', 'SVM 이해', '초평면 · 마진 · 서포트 벡터, 커널, cv.ml.SVM', [['Understanding SVM', 'd4/db1/tutorial_py_svm_basics.html']]],
    ['a3-4', 'SVM + HOG 손글씨 인식', 'deskew, HOG 특징, 정확도 비교', [['OCR of Hand-written Data using SVM', 'dd/d3b/tutorial_py_svm_opencv.html']]],
    ['a3-5', 'K-Means 군집화', 'cv.kmeans, 1D · 2D 데이터, 색 양자화', [['Understanding K-Means Clustering', 'de/d4d/tutorial_py_kmeans_understanding.html'], ['K-Means Clustering in OpenCV', 'd1/d5c/tutorial_py_kmeans_opencv.html']]],
    ['a3-6', 'Haar 캐스케이드 얼굴 · 눈 검출', 'CascadeClassifier, detectMultiScale, 캐스케이드 학습 개념', [['Cascade Classifier', 'db/d28/tutorial_cascade_classifier.html'], ['Cascade Classifier Training', 'dc/d88/tutorial_traincascade.html']]],
    ['a3-7', 'HOG 보행자 검출', 'HOGDescriptor, 기본 사람 검출기, winStride · scale', [['cv::HOGDescriptor', 'd5/d33/structcv_1_1HOGDescriptor.html']]],
    ['a3-8', 'DNN 객체 검출과 3주차 총정리', 'readNetFromONNX, YOLO, FaceDetectorYN, 전통 방법과 비교', [['YOLO DNNs', 'da/d9d/tutorial_dnn_yolo.html'], ['DNN-based Face Detection And Recognition', 'd0/dd4/tutorial_dnn_face.html']]],
    // ---------------- 4주차: 프로젝트 Ⅰ ----------------
    ['a4-1', '심화 프로젝트 오리엔테이션', '특징 · 3D · 머신러닝 · 검출을 결합한 파이프라인, 주제 · 평가', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    ['a4-2', '가이드 프로젝트 ① 파노라마 (1)', '특징 매칭 → 호모그래피 추정', [['Feature Matching + Homography to find Objects', 'd1/de0/tutorial_py_feature_homography.html']]],
    ['a4-3', '가이드 프로젝트 ① 파노라마 (2)', '워핑 · 캔버스 · 블렌딩, Stitcher 와 비교', [['Geometric Transformations of Images', 'da/d6e/tutorial_py_geometric_transformations.html']]],
    ['a4-4', '가이드 프로젝트 ② 평면 물체 인식 · AR 오버레이', '표지 인식 → 호모그래피 → 이미지 합성', [['Feature Matching', 'dc/dc3/tutorial_py_matcher.html']]],
    ['a4-5', '가이드 프로젝트 ③ 캘리브레이션 기반 실측', '왜곡 보정 → 평면 호모그래피 → mm 측정', [['Camera Calibration', 'dc/dbb/tutorial_py_calibration.html'], ['Pose Estimation', 'd7/d53/tutorial_py_pose.html']]],
    ['a4-6', '가이드 프로젝트 ④ 손글씨 숫자 인식기', '마우스로 쓰기 → 전처리 → SVM/kNN 인식', [['OCR of Hand-written Data using SVM', 'dd/d3b/tutorial_py_svm_opencv.html']]],
    ['a4-7', '팀 프로젝트 기획', '주제 선정, 데이터 계획, 파이프라인 · 평가 지표 설계', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    ['a4-8', '프로토타입 만들기', '최소 기능 구현, 기준선(baseline) 성능 측정', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    // ---------------- 5주차: 프로젝트 Ⅱ ----------------
    ['a5-1', '구현 ① 데이터 준비와 특징 설계', '데이터 수집 · 라벨, 특징 추출 모듈화', [['Machine Learning', 'd6/de2/tutorial_py_table_of_contents_ml.html']]],
    ['a5-2', '구현 ② 학습 · 평가와 튜닝', '정확도 · 혼동 행렬, 파라미터 탐색, 과적합', [['Machine Learning', 'd6/de2/tutorial_py_table_of_contents_ml.html']]],
    ['a5-3', '구현 ③ 실시간 적용과 최적화', 'process(frame), 특징점 수 · 해상도 · ROI 최적화', [['Feature Detection and Description', 'db/d27/tutorial_py_table_of_contents_feature2d.html']]],
    ['a5-4', '구현 ④ 3D 정보 결합과 인터랙션', '자세 · 거리 추정 결합, 트랙바 · 마우스 튜닝', [['Camera Calibration and 3D Reconstruction', 'd9/db7/tutorial_py_table_of_contents_calib3d.html']]],
    ['a5-5', '테스트 · 디버깅 · 코드 리뷰', '매칭 실패 · 호모그래피 퇴화 · 과적합 진단', [['Feature Matching + Homography to find Objects', 'd1/de0/tutorial_py_feature_homography.html']]],
    ['a5-6', '결과 정리와 발표 준비', '정량 평가표, 전후 비교, 발표 구성', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    ['a5-7', '프로젝트 발표회', '발표 진행, 동료 평가', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    ['a5-8', '회고와 다음 단계', '과정 총정리, 수료 퀴즈, 딥러닝 · 추적 · 3D 로드맵', [['Deep Neural Networks (dnn module)', 'd2/d58/tutorial_table_of_content_dnn.html'], ['Video analysis', 'da/dd0/tutorial_table_of_content_video.html']]],
  ];

  const lessons = syllabus.map(([id, title, topics, refs]) => {
    const [w, p] = id.slice(1).split('-').map(Number);
    return {
      id, week: w, period: p, title, topics,
      ref: refs.map(([label, path]) => ({ label, url: /^https?:/.test(path) ? path : DOC + path })),
      goals: [], blocks: [], practice: [], quiz: [],
      placeholder: true,
    };
  });

  window.COURSE = {
    key: 'advanced',
    title: 'OpenCV-Python 심화 · 특징점 · 3D · 머신러닝 · 객체 검출',
    docRoot: DOC + 'd6/d00/tutorial_py_root.html',
    meta: {
      name: '심화 과정',
      brandSub: '5주 · 41교시 심화 과정',
      crumb: 'OpenCV.org 공식 튜토리얼 기반 · 입문 과정 수료자 대상',
      heroTitle: 'OpenCV-Python 심화<br>특징점 · 3D · 머신러닝 · 객체 검출',
      heroLead: `5주 · 총 41교시(1주차 0교시 오리엔테이션 + 매주 1~8교시). <b>3주 교육</b>으로 특징점 검출 · 매칭, 카메라 캘리브레이션과 3D 재구성,
          머신러닝(kNN · SVM · K-Means)과 객체 검출(Haar · HOG · DNN)을 익히고, <b>2주 프로젝트</b>로 파노라마 · AR 오버레이 · 실측 · 손글씨 인식기 같은 결과물을 만듭니다.`,
      startId: 'a1-0',
      plan: [
        ['교육', '1주', '특징점 검출과 기술', '코너 검출, SIFT · ORB, 특징 매칭, 호모그래피 물체 찾기'],
        ['교육', '2주', '카메라 캘리브레이션과 3D 재구성', '캘리브레이션 · 왜곡 보정, 자세 추정 AR, 에피폴라 · 깊이 맵'],
        ['교육', '3주', '머신러닝과 객체 검출', '손글씨 인식(kNN · SVM), 색 양자화, 얼굴 · 보행자 · YOLO 검출'],
        ['프로젝트', '4주', '가이드 프로젝트 · 기획', '파노라마, AR 오버레이, 캘리브레이션 실측, 손글씨 인식기'],
        ['프로젝트', '5주', '구현 · 발표', '팀 프로젝트 완성, 정량 평가, 발표, 회고'],
      ],
    },
    weeks,
    lessons,
    byId: Object.fromEntries(lessons.map((l) => [l.id, l])),
    addLessons(list) {
      for (const item of list) {
        const base = this.byId[item.id];
        if (!base) { console.warn('알 수 없는 교시 id:', item.id); continue; }
        Object.assign(base, item, { placeholder: false });
      }
    },
  };
})();
