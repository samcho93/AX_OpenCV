/* =========================================================================
 * 강좌 구성 (5주 · 41교시: 1주차 0~8교시 + 2~5주차 각 1~8교시)
 *  - 1~3주: 교육 (영상처리 기초 이론 → OpenCV 입문 → GUI → 코어 연산 → Image Processing)
 *  - 4~5주: 프로젝트 (가이드 프로젝트 → 팀 프로젝트 → 발표)
 * 각 교시의 상세 내용은 lessons/weekN.js 에서 COURSE.addLessons()로 등록합니다.
 * ========================================================================= */
(function () {
  const DOC = 'https://docs.opencv.org/4.x/';

  const weeks = [
    {
      no: 1, kind: '교육', title: '영상처리 기초 · OpenCV 입문 · GUI · 코어 연산',
      desc: '영상처리의 기초 이론(픽셀·흑백·컬러)과 활용 분야를 이해하고, 웹 실습 환경에서 이미지/비디오 입출력과 그리기, 마우스·트랙바, 픽셀 단위 기본 연산을 익힙니다.',
    },
    {
      no: 2, kind: '교육', title: 'Image Processing Ⅰ',
      desc: '색 공간, 기하학적 변환, 임계처리, 스무딩 필터를 통해 이미지를 “가공”하는 기본기를 다집니다.',
    },
    {
      no: 3, kind: '교육', title: 'Image Processing Ⅱ',
      desc: '모폴로지, 엣지, 컨투어, 히스토그램, 템플릿 매칭, 허프 변환으로 이미지 속 “구조”를 찾아냅니다.',
    },
    {
      no: 4, kind: '프로젝트', title: '프로젝트 Ⅰ · 가이드 프로젝트와 기획',
      desc: '배운 기법을 조합한 4개의 가이드 프로젝트를 따라 만들고, 팀 프로젝트를 기획해 프로토타입을 만듭니다.',
    },
    {
      no: 5, kind: '프로젝트', title: '프로젝트 Ⅱ · 구현과 발표',
      desc: '팀 프로젝트를 단계적으로 구현·튜닝·디버깅하고, 결과를 정리해 발표와 회고로 과정을 마무리합니다.',
    },
  ];

  /* 교시별 제목과 OpenCV.org 참고 튜토리얼 (경로가 http 로 시작하면 그대로 사용) */
  const syllabus = [
    // ---------------- 1주차 ----------------
    ['w1-0', '과정 소개와 웹 실습 환경', 'Python·NumPy 기초, 이미지는 배열이다', [['Introduction to OpenCV-Python Tutorials', 'd0/de3/tutorial_py_intro.html'], ['Install OpenCV for Python with pip', 'db/dd1/tutorial_py_pip_install.html']]],
    ['w1-1', '영상처리 기초 이론', '디지털 영상 · 픽셀 · 흑백과 컬러 · 영상처리와 OpenCV의 활용', [['OpenCV: About', 'https://opencv.org/about/'], ['Color conversions (RGB ↔ GRAY 공식)', 'de/d25/imgproc_color_conversions.html'], ['Introduction (OpenCV 모듈 구성)', 'd1/dfb/intro.html']]],
    ['w1-2', '이미지 읽기 · 표시 · 저장', 'imread, imshow, imwrite, Matplotlib', [['Getting Started with Images', 'db/deb/tutorial_display_image.html']]],
    ['w1-3', '비디오와 웹캠 다루기', 'VideoCapture, 프레임 처리, process(frame)', [['Getting Started with Videos', 'dd/d43/tutorial_py_video_display.html']]],
    ['w1-4', '그리기 함수', 'line, rectangle, circle, ellipse, polylines, putText', [['Drawing Functions in OpenCV', 'dc/da5/tutorial_py_drawing_functions.html']]],
    ['w1-5', '마우스로 그리기 (페인트 브러시)', 'setMouseCallback, 마우스 이벤트', [['Mouse as a Paint-Brush', 'db/d5b/tutorial_py_mouse_handling.html']]],
    ['w1-6', '트랙바로 만드는 컬러 팔레트', 'createTrackbar, getTrackbarPos', [['Trackbar as the Color Palette', 'd9/dc8/tutorial_py_trackbar.html']]],
    ['w1-7', '이미지 기본 연산', '픽셀 접근, 속성, ROI, 채널 분리·병합, 테두리', [['Basic Operations on Images', 'd3/df2/tutorial_py_basic_ops.html']]],
    ['w1-8', '이미지 산술 연산과 성능 측정', 'add, addWeighted, 비트 연산, getTickCount', [['Arithmetic Operations on Images', 'd0/d86/tutorial_py_image_arithmetics.html'], ['Performance Measurement and Improvement Techniques', 'dc/d71/tutorial_py_optimization.html']]],
    // ---------------- 2주차 ----------------
    ['w2-1', '색 공간 변환', 'cvtColor, BGR · GRAY · HSV', [['Changing Colorspaces', 'df/d9d/tutorial_py_colorspaces.html']]],
    ['w2-2', '색상 기반 객체 추적', 'inRange, HSV 범위, 웹캠 추적', [['Changing Colorspaces', 'df/d9d/tutorial_py_colorspaces.html']]],
    ['w2-3', '기하학적 변환 Ⅰ', '크기 조절, 이동, 회전, 뒤집기', [['Geometric Transformations of Images', 'da/d6e/tutorial_py_geometric_transformations.html']]],
    ['w2-4', '기하학적 변환 Ⅱ', '어파인 변환, 원근 변환', [['Geometric Transformations of Images', 'da/d6e/tutorial_py_geometric_transformations.html']]],
    ['w2-5', '이미지 임계처리', '단순 임계처리, 적응형 임계처리', [['Image Thresholding', 'd7/d4d/tutorial_py_thresholding.html']]],
    ['w2-6', 'Otsu 이진화', '히스토그램과 자동 임계값', [['Image Thresholding', 'd7/d4d/tutorial_py_thresholding.html']]],
    ['w2-7', '이미지 스무딩 Ⅰ', '2D 컨볼루션, 평균 블러, 가우시안 블러', [['Smoothing Images', 'd4/d13/tutorial_py_filtering.html']]],
    ['w2-8', '이미지 스무딩 Ⅱ와 2주차 정리', '미디언 블러, 양방향 필터, 노이즈 제거', [['Smoothing Images', 'd4/d13/tutorial_py_filtering.html']]],
    // ---------------- 3주차 ----------------
    ['w3-1', '모폴로지 연산', '침식, 팽창, 열기, 닫기, 그래디언트', [['Morphological Transformations', 'd9/d61/tutorial_py_morphological_ops.html']]],
    ['w3-2', '이미지 그래디언트', 'Sobel, Scharr, Laplacian', [['Image Gradients', 'd5/d0f/tutorial_py_gradients.html']]],
    ['w3-3', 'Canny 엣지 검출', '4단계 알고리즘, 임계값 튜닝', [['Canny Edge Detection', 'da/d22/tutorial_py_canny.html']]],
    ['w3-4', '이미지 피라미드와 컨투어 시작', 'pyrDown, pyrUp, findContours, drawContours', [['Image Pyramids', 'dc/dff/tutorial_py_pyramids.html'], ['Contours : Getting Started', 'd4/d73/tutorial_py_contours_begin.html']]],
    ['w3-5', '컨투어 특징과 속성', '모멘트, 면적, 근사화, 볼록 껍질, 경계 도형', [['Contour Features', 'dd/d49/tutorial_py_contour_features.html'], ['Contour Properties', 'd1/d32/tutorial_py_contour_properties.html']]],
    ['w3-6', '히스토그램과 평활화', 'calcHist, equalizeHist, CLAHE', [['Histograms - 1 : Find, Plot, Analyze !!!', 'd1/db7/tutorial_py_histogram_begins.html'], ['Histograms - 2: Histogram Equalization', 'd5/daf/tutorial_py_histogram_equalization.html']]],
    ['w3-7', '템플릿 매칭', 'matchTemplate, minMaxLoc, 다중 객체', [['Template Matching', 'd4/dc6/tutorial_py_template_matching.html']]],
    ['w3-8', '허프 변환과 3주차 총정리', 'HoughLines, HoughLinesP, HoughCircles', [['Hough Line Transform', 'd6/d10/tutorial_py_houghlines.html'], ['Hough Circle Transform', 'da/d53/tutorial_py_houghcircles.html']]],
    // ---------------- 4주차 ----------------
    ['w4-1', '프로젝트 오리엔테이션', '영상처리 파이프라인 설계, 주제·평가 안내', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    ['w4-2', '가이드 프로젝트 ① 문서 스캐너 (1)', '전처리 → 엣지 → 사각형 컨투어 찾기', [['Contour Features', 'dd/d49/tutorial_py_contour_features.html'], ['Canny Edge Detection', 'da/d22/tutorial_py_canny.html']]],
    ['w4-3', '가이드 프로젝트 ① 문서 스캐너 (2)', '꼭짓점 정렬, 원근 변환, 스캔 효과', [['Geometric Transformations of Images', 'da/d6e/tutorial_py_geometric_transformations.html'], ['Image Thresholding', 'd7/d4d/tutorial_py_thresholding.html']]],
    ['w4-4', '가이드 프로젝트 ② 동전·도형 분석기', '이진화 → 모폴로지 → 컨투어 분류 · 개수 세기', [['Contour Properties', 'd1/d32/tutorial_py_contour_properties.html'], ['Hough Circle Transform', 'da/d53/tutorial_py_houghcircles.html']]],
    ['w4-5', '가이드 프로젝트 ③ 웹캠 가상 페인터', 'HSV 마커 추적, 무게중심, 캔버스 합성', [['Changing Colorspaces', 'df/d9d/tutorial_py_colorspaces.html'], ['Contour Features', 'dd/d49/tutorial_py_contour_features.html']]],
    ['w4-6', '가이드 프로젝트 ④ 사진 필터 앱', '카툰 · 스케치 · 비네팅 필터', [['Smoothing Images', 'd4/d13/tutorial_py_filtering.html'], ['Image Thresholding', 'd7/d4d/tutorial_py_thresholding.html']]],
    ['w4-7', '팀 프로젝트 기획', '주제 선정, 요구사항, 파이프라인 설계서', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    ['w4-8', '프로토타입 만들기', '핵심 기능 최소 구현, 중간 점검', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    // ---------------- 5주차 ----------------
    ['w5-1', '구현 ① 입력과 전처리 모듈화', '함수 분리, 파라미터 관리, 다양한 입력 테스트', [['Image Processing in OpenCV', 'd2/d96/tutorial_py_table_of_contents_imgproc.html']]],
    ['w5-2', '구현 ② 핵심 알고리즘과 디버그 뷰', '검출·분석 로직, 중간 결과 시각화', [['Image Processing in OpenCV', 'd2/d96/tutorial_py_table_of_contents_imgproc.html']]],
    ['w5-3', '구현 ③ 실시간 웹캠 적용', 'process(frame), 속도 측정과 최적화', [['Getting Started with Videos', 'dd/d43/tutorial_py_video_display.html'], ['Performance Measurement and Improvement Techniques', 'dc/d71/tutorial_py_optimization.html']]],
    ['w5-4', '구현 ④ 인터랙션과 파라미터 튜닝', '트랙바·마우스 조작, 결과 오버레이', [['Trackbar as the Color Palette', 'd9/dc8/tutorial_py_trackbar.html'], ['Mouse as a Paint-Brush', 'db/d5b/tutorial_py_mouse_handling.html']]],
    ['w5-5', '테스트 · 디버깅 · 코드 리뷰', '흔한 오류 패턴, 리뷰 체크리스트', [['Basic Operations on Images', 'd3/df2/tutorial_py_basic_ops.html']]],
    ['w5-6', '결과 정리와 발표 준비', '전후 비교 이미지, 결과 저장, 발표 구성', [['Getting Started with Images', 'db/deb/tutorial_display_image.html']]],
    ['w5-7', '프로젝트 발표회', '발표 진행, 동료 평가', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
    ['w5-8', '회고와 다음 단계', '과정 총정리, 수료 퀴즈, 추가 학습 로드맵', [['OpenCV-Python Tutorials', 'd6/d00/tutorial_py_root.html']]],
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
    key: 'intro',
    title: 'OpenCV-Python 입문 · Image Processing',
    docRoot: DOC + 'd6/d00/tutorial_py_root.html',
    /* 화면에 쓰는 과정 정보 (홈 화면 · 내비게이션) */
    meta: {
      name: '입문 과정',
      brandSub: '5주 · 41교시 입문 과정',
      crumb: 'OpenCV.org 공식 튜토리얼 기반 · Python',
      heroTitle: 'OpenCV-Python<br>입문부터 Image Processing까지',
      heroLead: `5주 · 총 41교시(1주차 0교시 오리엔테이션 + 매주 1~8교시). <b>3주 교육</b>으로 영상처리 기초 이론과 이미지 입출력부터 필터·엣지·컨투어·히스토그램까지 익히고,
          <b>2주 프로젝트</b>로 문서 스캐너·동전 분석기·가상 페인터 같은 결과물을 직접 만듭니다.
          설치 없이 브라우저에서 바로 Python 코드를 실행하고, 이미지와 웹캠으로 결과를 확인하세요.`,
      startId: 'w1-0',
      plan: [
        ['교육', '1주', '영상처리 기초 이론 · 입문 · GUI · 코어 연산', '픽셀·색 이해, 그림판, 컬러 팔레트, 로고 합성'],
        ['교육', '2주', 'Image Processing Ⅰ', '색상 추적기, 원근 보정, 이진화·필터 비교'],
        ['교육', '3주', 'Image Processing Ⅱ', '엣지·컨투어 분석, 히스토그램, 템플릿·허프 검출'],
        ['프로젝트', '4주', '가이드 프로젝트 · 기획', '문서 스캐너, 동전·도형 분석기, 가상 페인터, 필터 앱'],
        ['프로젝트', '5주', '구현 · 발표', '팀 프로젝트 완성, 발표, 회고'],
      ],
    },
    weeks,
    lessons,
    byId: Object.fromEntries(lessons.map((l) => [l.id, l])),
    /** lessons/weekN.js 에서 교시 상세 내용을 등록 */
    addLessons(list) {
      for (const item of list) {
        const base = this.byId[item.id];
        if (!base) { console.warn('알 수 없는 교시 id:', item.id); continue; }
        Object.assign(base, item, { placeholder: false });
        if (!item.ref) base.ref = base.ref; // 기본 참고 링크 유지
      }
    },
  };
})();
