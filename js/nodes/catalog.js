/* 자동 생성 파일 — python tools/build_catalog.py 로 다시 만드세요. */
window.NODE_CATALOG = {
 "categories": [
  {
   "id": "flow",
   "title": "🔀 흐름 · 입출력",
   "desc": "입력 소스, 결과 출력, 이미지/동영상 읽기, 창 표시"
  },
  {
   "id": "gui",
   "title": "🖱️ GUI · 트랙바",
   "desc": "창, 트랙바, 마우스, 키 입력"
  },
  {
   "id": "color",
   "title": "🎨 색 · 채널",
   "desc": "색 공간 변환, 채널 분리/병합, 색 범위"
  },
  {
   "id": "arith",
   "title": "➕ 산술 · 비트 연산",
   "desc": "더하기, 블렌딩, 비트 연산, 통계"
  },
  {
   "id": "geom",
   "title": "📐 기하 변환",
   "desc": "크기, 회전, 이동, 원근, 테두리, 피라미드"
  },
  {
   "id": "filter",
   "title": "🌫️ 필터 · 임계처리",
   "desc": "블러, 컨볼루션, 이진화, 히스토그램"
  },
  {
   "id": "morph",
   "title": "🧱 모폴로지 · 엣지",
   "desc": "침식/팽창, 그래디언트, Canny"
  },
  {
   "id": "contour",
   "title": "🔷 컨투어 · 도형 분석",
   "desc": "윤곽선 찾기, 면적, 근사, 경계 도형"
  },
  {
   "id": "detect",
   "title": "🎯 검출 · 매칭",
   "desc": "템플릿 매칭, 허프 변환, 특징점"
  },
  {
   "id": "draw",
   "title": "✏️ 그리기",
   "desc": "선, 사각형, 원, 글자"
  },
  {
   "id": "numpy",
   "title": "🔢 NumPy",
   "desc": "배열 만들기, 이어 붙이기, 계산"
  },
  {
   "id": "plot",
   "title": "📊 Matplotlib",
   "desc": "그래프, 히스토그램 그리기"
  },
  {
   "id": "util",
   "title": "⏱️ 유틸 · 시간",
   "desc": "시간 측정, 최적화 설정, 출력"
  },
  {
   "id": "code",
   "title": "🐍 Python 코드",
   "desc": "직접 코드 작성, 변수, ROI, 반복문"
  }
 ],
 "blocks": [
  {
   "key": "cv.imread",
   "type": "call",
   "fn": "cv.imread",
   "title": "이미지 읽기",
   "cat": "flow",
   "args": [
    {
     "name": "filename",
     "req": true,
     "def": "'messi5.jpg'",
     "file": true
    },
    {
     "name": "flags",
     "req": false,
     "def": "",
     "opts": [
      "cv.IMREAD_COLOR",
      "cv.IMREAD_GRAYSCALE",
      "cv.IMREAD_UNCHANGED"
     ]
    }
   ],
   "outs": [
    "result"
   ],
   "sig": "imread(filename[, flags]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.imshow",
   "type": "call",
   "fn": "cv.imshow",
   "title": "창에 표시",
   "cat": "flow",
   "args": [
    {
     "name": "winname",
     "req": true,
     "def": "'result'"
    },
    {
     "name": "mat",
     "req": true,
     "def": ""
    }
   ],
   "outs": [],
   "sig": "imshow(winname, mat) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.imwrite",
   "type": "call",
   "fn": "cv.imwrite",
   "title": "파일로 저장",
   "cat": "flow",
   "args": [
    {
     "name": "filename",
     "req": true,
     "def": "'result.png'"
    },
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "params",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "result"
   ],
   "sig": "imwrite(filename, img[, params]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.VideoCapture",
   "type": "call",
   "fn": "cv.VideoCapture",
   "title": "동영상 · 웹캠 열기",
   "cat": "flow",
   "args": [
    {
     "name": "index",
     "req": true,
     "def": "'vtest.avi'",
     "opts": [
      "0",
      "'vtest.avi'",
      "'Megamind.avi'",
      "'cup.mp4'"
     ]
    }
   ],
   "outs": [
    "cap"
   ],
   "sig": "VideoCapture(index) -> cap",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.namedWindow",
   "type": "call",
   "fn": "cv.namedWindow",
   "title": "창 만들기",
   "cat": "gui",
   "args": [
    {
     "name": "winname",
     "req": true,
     "def": "'result'"
    },
    {
     "name": "flags",
     "req": false,
     "def": ""
    }
   ],
   "outs": [],
   "sig": "namedWindow(winname[, flags]) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.waitKey",
   "type": "call",
   "fn": "cv.waitKey",
   "title": "키 입력 대기",
   "cat": "gui",
   "args": [
    {
     "name": "delay",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "result"
   ],
   "sig": "waitKey([, delay]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.destroyAllWindows",
   "type": "call",
   "fn": "cv.destroyAllWindows",
   "title": "모든 창 닫기",
   "cat": "gui",
   "args": [],
   "outs": [],
   "sig": "destroyAllWindows() -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.createTrackbar",
   "type": "call",
   "fn": "cv.createTrackbar",
   "title": "트랙바 만들기",
   "cat": "gui",
   "args": [
    {
     "name": "trackbarName",
     "req": true,
     "def": "'value'"
    },
    {
     "name": "windowName",
     "req": true,
     "def": "'result'"
    },
    {
     "name": "value",
     "req": true,
     "def": "100"
    },
    {
     "name": "count",
     "req": true,
     "def": "255"
    },
    {
     "name": "onChange",
     "req": true,
     "def": "lambda x: None"
    }
   ],
   "outs": [],
   "sig": "createTrackbar(trackbarName, windowName, value, count, onChange) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getTrackbarPos",
   "type": "call",
   "fn": "cv.getTrackbarPos",
   "title": "트랙바 값 읽기",
   "cat": "gui",
   "args": [
    {
     "name": "trackbarname",
     "req": true,
     "def": "'value'"
    },
    {
     "name": "winname",
     "req": true,
     "def": "'result'"
    }
   ],
   "outs": [
    "pos"
   ],
   "sig": "getTrackbarPos(trackbarname, winname) -> retval",
   "perFrame": true,
   "inplace": false
  },
  {
   "key": "cv.setTrackbarPos",
   "type": "call",
   "fn": "cv.setTrackbarPos",
   "title": "트랙바 값 설정",
   "cat": "gui",
   "args": [
    {
     "name": "trackbarname",
     "req": true,
     "def": "'size'"
    },
    {
     "name": "winname",
     "req": true,
     "def": "'paint'"
    },
    {
     "name": "pos",
     "req": true,
     "def": "8"
    }
   ],
   "outs": [],
   "sig": "setTrackbarPos(trackbarname, winname, pos) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.setMouseCallback",
   "type": "call",
   "fn": "cv.setMouseCallback",
   "title": "마우스 콜백 연결",
   "cat": "gui",
   "args": [
    {
     "name": "windowName",
     "req": true,
     "def": "'image'"
    },
    {
     "name": "onMouse",
     "req": true,
     "def": ""
    },
    {
     "name": "param",
     "req": false,
     "def": ""
    }
   ],
   "outs": [],
   "sig": "setMouseCallback(windowName, onMouse [, param]) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.cvtColor",
   "type": "call",
   "fn": "cv.cvtColor",
   "title": "색 공간 변환",
   "cat": "color",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "code",
     "req": true,
     "def": "cv.COLOR_BGR2GRAY",
     "opts": [
      "cv.COLOR_BGR2GRAY",
      "cv.COLOR_BGR2HSV",
      "cv.COLOR_BGR2RGB",
      "cv.COLOR_GRAY2BGR",
      "cv.COLOR_HSV2BGR",
      "cv.COLOR_BGR2LAB",
      "cv.COLOR_BGR2YCrCb"
     ]
    },
    {
     "name": "dstCn",
     "req": false,
     "def": ""
    },
    {
     "name": "hint",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "cvtColor(src, code[, dst[, dstCn[, hint]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.split",
   "type": "call",
   "fn": "cv.split",
   "title": "채널 분리",
   "cat": "color",
   "args": [
    {
     "name": "m",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "b",
    "g",
    "r"
   ],
   "sig": "split(m[, mv]) -> mv",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.merge",
   "type": "call",
   "fn": "cv.merge",
   "title": "채널 합치기",
   "cat": "color",
   "args": [
    {
     "name": "mv",
     "req": true,
     "def": "(b, g, r)"
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "merge(mv[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.inRange",
   "type": "call",
   "fn": "cv.inRange",
   "title": "색 범위 마스크",
   "cat": "color",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "lowerb",
     "req": true,
     "def": "np.array([100, 50, 50])"
    },
    {
     "name": "upperb",
     "req": true,
     "def": "np.array([130, 255, 255])"
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "inRange(src, lowerb, upperb[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.add",
   "type": "call",
   "fn": "cv.add",
   "title": "더하기 (포화)",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": "60"
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    },
    {
     "name": "dtype",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "add(src1, src2[, dst[, mask[, dtype]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.subtract",
   "type": "call",
   "fn": "cv.subtract",
   "title": "빼기 (포화)",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": "40"
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    },
    {
     "name": "dtype",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "subtract(src1, src2[, dst[, mask[, dtype]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.absdiff",
   "type": "call",
   "fn": "cv.absdiff",
   "title": "차이의 절댓값",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "absdiff(src1, src2[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.divide",
   "type": "call",
   "fn": "cv.divide",
   "title": "나누기",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": ""
    },
    {
     "name": "scale",
     "req": false,
     "def": "",
     "hint": "256"
    },
    {
     "name": "dtype",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "divide(src1, src2[, dst[, scale[, dtype]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.addWeighted",
   "type": "call",
   "fn": "cv.addWeighted",
   "title": "가중치 합성 (블렌딩)",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "alpha",
     "req": true,
     "def": "0.7"
    },
    {
     "name": "src2",
     "req": true,
     "def": ""
    },
    {
     "name": "beta",
     "req": true,
     "def": "0.3"
    },
    {
     "name": "gamma",
     "req": true,
     "def": "0"
    },
    {
     "name": "dtype",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "addWeighted(src1, alpha, src2, beta, gamma[, dst[, dtype]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.bitwise_and",
   "type": "call",
   "fn": "cv.bitwise_and",
   "title": "비트 AND (마스크 적용)",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": ""
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "bitwise_and(src1, src2[, dst[, mask]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.bitwise_or",
   "type": "call",
   "fn": "cv.bitwise_or",
   "title": "비트 OR",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": ""
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "bitwise_or(src1, src2[, dst[, mask]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.bitwise_xor",
   "type": "call",
   "fn": "cv.bitwise_xor",
   "title": "비트 XOR",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": ""
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "bitwise_xor(src1, src2[, dst[, mask]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.bitwise_not",
   "type": "call",
   "fn": "cv.bitwise_not",
   "title": "비트 NOT (반전)",
   "cat": "arith",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "bitwise_not(src[, dst[, mask]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.convertScaleAbs",
   "type": "call",
   "fn": "cv.convertScaleAbs",
   "title": "절댓값 → 8비트 변환",
   "cat": "arith",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "alpha",
     "req": false,
     "def": "",
     "hint": "1 / 64"
    },
    {
     "name": "beta",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "convertScaleAbs(src[, dst[, alpha[, beta]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.normalize",
   "type": "call",
   "fn": "cv.normalize",
   "title": "정규화",
   "cat": "arith",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "dst",
     "req": true,
     "def": "None"
    },
    {
     "name": "alpha",
     "req": false,
     "def": ""
    },
    {
     "name": "beta",
     "req": false,
     "def": ""
    },
    {
     "name": "norm_type",
     "req": false,
     "def": "",
     "opts": [
      "cv.NORM_MINMAX",
      "cv.NORM_L2",
      "cv.NORM_INF"
     ]
    },
    {
     "name": "dtype",
     "req": false,
     "def": ""
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "normalize(src, dst[, alpha[, beta[, norm_type[, dtype[, mask]]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.countNonZero",
   "type": "call",
   "fn": "cv.countNonZero",
   "title": "0 아닌 픽셀 수",
   "cat": "arith",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "count"
   ],
   "sig": "countNonZero(src) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.mean",
   "type": "call",
   "fn": "cv.mean",
   "title": "평균값",
   "cat": "arith",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "mean"
   ],
   "sig": "mean(src[, mask]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.minMaxLoc",
   "type": "call",
   "fn": "cv.minMaxLoc",
   "title": "최솟값 · 최댓값 위치",
   "cat": "arith",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "minVal",
    "maxVal",
    "minLoc",
    "maxLoc"
   ],
   "sig": "minMaxLoc(src[, mask]) -> minVal, maxVal, minLoc, maxLoc",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.magnitude",
   "type": "call",
   "fn": "cv.magnitude",
   "title": "벡터 크기",
   "cat": "arith",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "y",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "magnitude"
   ],
   "sig": "magnitude(x, y[, magnitude]) -> magnitude",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.phase",
   "type": "call",
   "fn": "cv.phase",
   "title": "벡터 각도",
   "cat": "arith",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "y",
     "req": true,
     "def": ""
    },
    {
     "name": "angleInDegrees",
     "req": false,
     "def": "",
     "hint": "True"
    }
   ],
   "outs": [
    "angle"
   ],
   "sig": "phase(x, y[, angle[, angleInDegrees]]) -> angle",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.PSNR",
   "type": "call",
   "fn": "cv.PSNR",
   "title": "PSNR (화질 비교)",
   "cat": "arith",
   "args": [
    {
     "name": "src1",
     "req": true,
     "def": ""
    },
    {
     "name": "src2",
     "req": true,
     "def": ""
    },
    {
     "name": "R",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "psnr"
   ],
   "sig": "PSNR(src1, src2[, R]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.transform",
   "type": "call",
   "fn": "cv.transform",
   "title": "행렬 변환 (색 변환 등)",
   "cat": "arith",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "m",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "transform(src, m[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.resize",
   "type": "call",
   "fn": "cv.resize",
   "title": "크기 조절",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "dsize",
     "req": true,
     "def": "(320, 240)",
     "opts": [
      "(320, 240)",
      "(640, 480)",
      "None"
     ]
    },
    {
     "name": "fx",
     "req": false,
     "def": "",
     "hint": "0.5"
    },
    {
     "name": "fy",
     "req": false,
     "def": "",
     "hint": "0.5"
    },
    {
     "name": "interpolation",
     "req": false,
     "def": "",
     "hint": "cv.INTER_AREA",
     "opts": [
      "cv.INTER_LINEAR",
      "cv.INTER_AREA",
      "cv.INTER_CUBIC",
      "cv.INTER_NEAREST",
      "cv.INTER_LANCZOS4"
     ]
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "resize(src, dsize[, dst[, fx[, fy[, interpolation]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.flip",
   "type": "call",
   "fn": "cv.flip",
   "title": "뒤집기",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "flipCode",
     "req": true,
     "def": "1",
     "opts": [
      "1",
      "0",
      "-1"
     ]
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "flip(src, flipCode[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.rotate",
   "type": "call",
   "fn": "cv.rotate",
   "title": "90° 단위 회전",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "rotateCode",
     "req": true,
     "def": "cv.ROTATE_90_CLOCKWISE",
     "opts": [
      "cv.ROTATE_90_CLOCKWISE",
      "cv.ROTATE_180",
      "cv.ROTATE_90_COUNTERCLOCKWISE"
     ]
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "rotate(src, rotateCode[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getRotationMatrix2D",
   "type": "call",
   "fn": "cv.getRotationMatrix2D",
   "title": "회전 행렬 만들기",
   "cat": "geom",
   "args": [
    {
     "name": "center",
     "req": true,
     "def": "(240, 111)"
    },
    {
     "name": "angle",
     "req": true,
     "def": "90"
    },
    {
     "name": "scale",
     "req": true,
     "def": "1.0"
    }
   ],
   "outs": [
    "M"
   ],
   "sig": "getRotationMatrix2D(center, angle, scale) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getAffineTransform",
   "type": "call",
   "fn": "cv.getAffineTransform",
   "title": "어파인 행렬 구하기",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "dst",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "M"
   ],
   "sig": "getAffineTransform(src, dst) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getPerspectiveTransform",
   "type": "call",
   "fn": "cv.getPerspectiveTransform",
   "title": "원근 변환 행렬 구하기",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "dst",
     "req": true,
     "def": ""
    },
    {
     "name": "solveMethod",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "M"
   ],
   "sig": "getPerspectiveTransform(src, dst[, solveMethod]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.warpAffine",
   "type": "call",
   "fn": "cv.warpAffine",
   "title": "어파인 변환 적용",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "M",
     "req": true,
     "def": ""
    },
    {
     "name": "dsize",
     "req": true,
     "def": ""
    },
    {
     "name": "flags",
     "req": false,
     "def": "",
     "opts": [
      "cv.INTER_LINEAR",
      "cv.INTER_AREA",
      "cv.INTER_CUBIC",
      "cv.INTER_NEAREST",
      "cv.INTER_LANCZOS4"
     ]
    },
    {
     "name": "borderMode",
     "req": false,
     "def": "",
     "opts": [
      "cv.BORDER_CONSTANT",
      "cv.BORDER_REPLICATE",
      "cv.BORDER_REFLECT",
      "cv.BORDER_REFLECT_101",
      "cv.BORDER_WRAP"
     ]
    },
    {
     "name": "borderValue",
     "req": false,
     "def": "",
     "hint": "255"
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "warpAffine(src, M, dsize[, dst[, flags[, borderMode[, borderValue]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.warpPerspective",
   "type": "call",
   "fn": "cv.warpPerspective",
   "title": "원근 변환 적용",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "M",
     "req": true,
     "def": ""
    },
    {
     "name": "dsize",
     "req": true,
     "def": "(300, 300)"
    },
    {
     "name": "flags",
     "req": false,
     "def": "",
     "opts": [
      "cv.INTER_LINEAR",
      "cv.INTER_AREA",
      "cv.INTER_CUBIC",
      "cv.INTER_NEAREST",
      "cv.INTER_LANCZOS4"
     ]
    },
    {
     "name": "borderMode",
     "req": false,
     "def": "",
     "opts": [
      "cv.BORDER_CONSTANT",
      "cv.BORDER_REPLICATE",
      "cv.BORDER_REFLECT",
      "cv.BORDER_REFLECT_101",
      "cv.BORDER_WRAP"
     ]
    },
    {
     "name": "borderValue",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "warpPerspective(src, M, dsize[, dst[, flags[, borderMode[, borderValue]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.copyMakeBorder",
   "type": "call",
   "fn": "cv.copyMakeBorder",
   "title": "테두리 추가",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "top",
     "req": true,
     "def": "10"
    },
    {
     "name": "bottom",
     "req": true,
     "def": "10"
    },
    {
     "name": "left",
     "req": true,
     "def": "10"
    },
    {
     "name": "right",
     "req": true,
     "def": "10"
    },
    {
     "name": "borderType",
     "req": true,
     "def": "cv.BORDER_CONSTANT",
     "opts": [
      "cv.BORDER_CONSTANT",
      "cv.BORDER_REPLICATE",
      "cv.BORDER_REFLECT",
      "cv.BORDER_REFLECT_101",
      "cv.BORDER_WRAP"
     ]
    },
    {
     "name": "value",
     "req": false,
     "def": "",
     "hint": "(255, 255, 255)"
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "copyMakeBorder(src, top, bottom, left, right, borderType[, dst[, value]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.pyrDown",
   "type": "call",
   "fn": "cv.pyrDown",
   "title": "피라미드 축소 (1/2)",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "dstsize",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "pyrDown(src[, dst[, dstsize[, borderType]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.pyrUp",
   "type": "call",
   "fn": "cv.pyrUp",
   "title": "피라미드 확대 (×2)",
   "cat": "geom",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "dstsize",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "pyrUp(src[, dst[, dstsize[, borderType]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.threshold",
   "type": "call",
   "fn": "cv.threshold",
   "title": "임계처리 (이진화)",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "thresh",
     "req": true,
     "def": "127"
    },
    {
     "name": "maxval",
     "req": true,
     "def": "255"
    },
    {
     "name": "type",
     "req": true,
     "def": "cv.THRESH_BINARY",
     "opts": [
      "cv.THRESH_BINARY",
      "cv.THRESH_BINARY_INV",
      "cv.THRESH_TRUNC",
      "cv.THRESH_TOZERO",
      "cv.THRESH_TOZERO_INV",
      "cv.THRESH_BINARY + cv.THRESH_OTSU",
      "cv.THRESH_BINARY_INV + cv.THRESH_OTSU"
     ]
    }
   ],
   "outs": [
    "ret",
    "binary"
   ],
   "sig": "threshold(src, thresh, maxval, type[, dst]) -> retval, dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.adaptiveThreshold",
   "type": "call",
   "fn": "cv.adaptiveThreshold",
   "title": "적응형 임계처리",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "maxValue",
     "req": true,
     "def": "255"
    },
    {
     "name": "adaptiveMethod",
     "req": true,
     "def": "cv.ADAPTIVE_THRESH_MEAN_C",
     "opts": [
      "cv.ADAPTIVE_THRESH_GAUSSIAN_C",
      "cv.ADAPTIVE_THRESH_MEAN_C"
     ]
    },
    {
     "name": "thresholdType",
     "req": true,
     "def": "cv.THRESH_BINARY",
     "opts": [
      "cv.THRESH_BINARY",
      "cv.THRESH_BINARY_INV"
     ]
    },
    {
     "name": "blockSize",
     "req": true,
     "def": "9"
    },
    {
     "name": "C",
     "req": true,
     "def": "2"
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.blur",
   "type": "call",
   "fn": "cv.blur",
   "title": "평균 블러",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ksize",
     "req": true,
     "def": "(5, 5)",
     "opts": [
      "(3, 3)",
      "(5, 5)",
      "(7, 7)",
      "(9, 9)",
      "(15, 15)"
     ]
    },
    {
     "name": "anchor",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "blur(src, ksize[, dst[, anchor[, borderType]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.boxFilter",
   "type": "call",
   "fn": "cv.boxFilter",
   "title": "박스 필터",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ddepth",
     "req": true,
     "def": "-1",
     "opts": [
      "cv.CV_64F",
      "cv.CV_8U",
      "cv.CV_16S",
      "cv.CV_32F",
      "-1"
     ]
    },
    {
     "name": "ksize",
     "req": true,
     "def": "(5, 5)",
     "opts": [
      "(3, 3)",
      "(5, 5)",
      "(7, 7)",
      "(9, 9)",
      "(15, 15)"
     ]
    },
    {
     "name": "anchor",
     "req": false,
     "def": ""
    },
    {
     "name": "normalize",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "boxFilter(src, ddepth, ksize[, dst[, anchor[, normalize[, borderType]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.GaussianBlur",
   "type": "call",
   "fn": "cv.GaussianBlur",
   "title": "가우시안 블러",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ksize",
     "req": true,
     "def": "(5, 5)",
     "opts": [
      "(3, 3)",
      "(5, 5)",
      "(7, 7)",
      "(9, 9)",
      "(15, 15)"
     ]
    },
    {
     "name": "sigmaX",
     "req": true,
     "def": "0"
    },
    {
     "name": "sigmaY",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    },
    {
     "name": "hint",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "GaussianBlur(src, ksize, sigmaX[, dst[, sigmaY[, borderType[, hint]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.medianBlur",
   "type": "call",
   "fn": "cv.medianBlur",
   "title": "미디언 블러",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ksize",
     "req": true,
     "def": "5",
     "opts": [
      "3",
      "5",
      "7",
      "9"
     ]
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "medianBlur(src, ksize[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.bilateralFilter",
   "type": "call",
   "fn": "cv.bilateralFilter",
   "title": "양방향 필터",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "d",
     "req": true,
     "def": "9"
    },
    {
     "name": "sigmaColor",
     "req": true,
     "def": "75"
    },
    {
     "name": "sigmaSpace",
     "req": true,
     "def": "75"
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "bilateralFilter(src, d, sigmaColor, sigmaSpace[, dst[, borderType]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.filter2D",
   "type": "call",
   "fn": "cv.filter2D",
   "title": "2D 컨볼루션 (커널 필터)",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ddepth",
     "req": true,
     "def": "-1",
     "opts": [
      "cv.CV_64F",
      "cv.CV_8U",
      "cv.CV_16S",
      "cv.CV_32F",
      "-1"
     ]
    },
    {
     "name": "kernel",
     "req": true,
     "def": ""
    },
    {
     "name": "anchor",
     "req": false,
     "def": ""
    },
    {
     "name": "delta",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "filter2D(src, ddepth, kernel[, dst[, anchor[, delta[, borderType]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getGaussianKernel",
   "type": "call",
   "fn": "cv.getGaussianKernel",
   "title": "가우시안 커널 만들기",
   "cat": "filter",
   "args": [
    {
     "name": "ksize",
     "req": true,
     "def": "5"
    },
    {
     "name": "sigma",
     "req": true,
     "def": "0"
    },
    {
     "name": "ktype",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "kernel"
   ],
   "sig": "getGaussianKernel(ksize, sigma[, ktype]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getDerivKernels",
   "type": "call",
   "fn": "cv.getDerivKernels",
   "title": "미분 커널 만들기",
   "cat": "filter",
   "args": [
    {
     "name": "dx",
     "req": true,
     "def": "1"
    },
    {
     "name": "dy",
     "req": true,
     "def": "0"
    },
    {
     "name": "ksize",
     "req": true,
     "def": "3"
    },
    {
     "name": "normalize",
     "req": false,
     "def": ""
    },
    {
     "name": "ktype",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "kx",
    "ky"
   ],
   "sig": "getDerivKernels(dx, dy, ksize[, kx[, ky[, normalize[, ktype]]]]) -> kx, ky",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.equalizeHist",
   "type": "call",
   "fn": "cv.equalizeHist",
   "title": "히스토그램 평활화",
   "cat": "filter",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "equalizeHist(src[, dst]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.createCLAHE",
   "type": "call",
   "fn": "cv.createCLAHE",
   "title": "CLAHE 만들기",
   "cat": "filter",
   "args": [
    {
     "name": "clipLimit",
     "req": false,
     "def": "2.0"
    },
    {
     "name": "tileGridSize",
     "req": false,
     "def": "(8, 8)"
    }
   ],
   "outs": [
    "clahe"
   ],
   "sig": "createCLAHE([, clipLimit[, tileGridSize]]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.calcHist",
   "type": "call",
   "fn": "cv.calcHist",
   "title": "히스토그램 계산",
   "cat": "filter",
   "args": [
    {
     "name": "images",
     "req": true,
     "def": "[gray]"
    },
    {
     "name": "channels",
     "req": true,
     "def": "[0]"
    },
    {
     "name": "mask",
     "req": true,
     "def": "None"
    },
    {
     "name": "histSize",
     "req": true,
     "def": "[256]"
    },
    {
     "name": "ranges",
     "req": true,
     "def": "[0, 256]"
    },
    {
     "name": "accumulate",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "hist"
   ],
   "sig": "calcHist(images, channels, mask, histSize, ranges[, hist[, accumulate]]) -> hist",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getStructuringElement",
   "type": "call",
   "fn": "cv.getStructuringElement",
   "title": "구조 요소(커널) 만들기",
   "cat": "morph",
   "args": [
    {
     "name": "shape",
     "req": true,
     "def": "cv.MORPH_RECT",
     "opts": [
      "cv.MORPH_RECT",
      "cv.MORPH_ELLIPSE",
      "cv.MORPH_CROSS"
     ]
    },
    {
     "name": "ksize",
     "req": true,
     "def": "(5, 5)",
     "opts": [
      "(3, 3)",
      "(5, 5)",
      "(7, 7)",
      "(9, 9)",
      "(15, 15)"
     ]
    },
    {
     "name": "anchor",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "kernel"
   ],
   "sig": "getStructuringElement(shape, ksize[, anchor]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.erode",
   "type": "call",
   "fn": "cv.erode",
   "title": "침식",
   "cat": "morph",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "kernel",
     "req": true,
     "def": ""
    },
    {
     "name": "anchor",
     "req": false,
     "def": ""
    },
    {
     "name": "iterations",
     "req": false,
     "def": "",
     "hint": "1"
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    },
    {
     "name": "borderValue",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "erode(src, kernel[, dst[, anchor[, iterations[, borderType[, borderValue]]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.dilate",
   "type": "call",
   "fn": "cv.dilate",
   "title": "팽창",
   "cat": "morph",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "kernel",
     "req": true,
     "def": ""
    },
    {
     "name": "anchor",
     "req": false,
     "def": ""
    },
    {
     "name": "iterations",
     "req": false,
     "def": "",
     "hint": "1"
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    },
    {
     "name": "borderValue",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "dilate(src, kernel[, dst[, anchor[, iterations[, borderType[, borderValue]]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.morphologyEx",
   "type": "call",
   "fn": "cv.morphologyEx",
   "title": "모폴로지 연산",
   "cat": "morph",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "op",
     "req": true,
     "def": "cv.MORPH_CLOSE",
     "opts": [
      "cv.MORPH_OPEN",
      "cv.MORPH_CLOSE",
      "cv.MORPH_GRADIENT",
      "cv.MORPH_TOPHAT",
      "cv.MORPH_BLACKHAT"
     ]
    },
    {
     "name": "kernel",
     "req": true,
     "def": ""
    },
    {
     "name": "anchor",
     "req": false,
     "def": ""
    },
    {
     "name": "iterations",
     "req": false,
     "def": "",
     "hint": "2"
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    },
    {
     "name": "borderValue",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "morphologyEx(src, op, kernel[, dst[, anchor[, iterations[, borderType[, borderValue]]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.Sobel",
   "type": "call",
   "fn": "cv.Sobel",
   "title": "Sobel 미분",
   "cat": "morph",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ddepth",
     "req": true,
     "def": "cv.CV_64F",
     "opts": [
      "cv.CV_64F",
      "cv.CV_8U",
      "cv.CV_16S",
      "cv.CV_32F",
      "-1"
     ]
    },
    {
     "name": "dx",
     "req": true,
     "def": "1"
    },
    {
     "name": "dy",
     "req": true,
     "def": "0"
    },
    {
     "name": "ksize",
     "req": false,
     "def": "",
     "hint": "3"
    },
    {
     "name": "scale",
     "req": false,
     "def": ""
    },
    {
     "name": "delta",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "Sobel(src, ddepth, dx, dy[, dst[, ksize[, scale[, delta[, borderType]]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.Scharr",
   "type": "call",
   "fn": "cv.Scharr",
   "title": "Scharr 미분",
   "cat": "morph",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ddepth",
     "req": true,
     "def": "cv.CV_64F",
     "opts": [
      "cv.CV_64F",
      "cv.CV_8U",
      "cv.CV_16S",
      "cv.CV_32F",
      "-1"
     ]
    },
    {
     "name": "dx",
     "req": true,
     "def": "1"
    },
    {
     "name": "dy",
     "req": true,
     "def": "0"
    },
    {
     "name": "scale",
     "req": false,
     "def": ""
    },
    {
     "name": "delta",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "Scharr(src, ddepth, dx, dy[, dst[, scale[, delta[, borderType]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.Laplacian",
   "type": "call",
   "fn": "cv.Laplacian",
   "title": "Laplacian",
   "cat": "morph",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "ddepth",
     "req": true,
     "def": "cv.CV_64F",
     "opts": [
      "cv.CV_64F",
      "cv.CV_8U",
      "cv.CV_16S",
      "cv.CV_32F",
      "-1"
     ]
    },
    {
     "name": "ksize",
     "req": false,
     "def": ""
    },
    {
     "name": "scale",
     "req": false,
     "def": ""
    },
    {
     "name": "delta",
     "req": false,
     "def": ""
    },
    {
     "name": "borderType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "Laplacian(src, ddepth[, dst[, ksize[, scale[, delta[, borderType]]]]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.Canny",
   "type": "call",
   "fn": "cv.Canny",
   "title": "Canny 엣지 검출",
   "cat": "morph",
   "args": [
    {
     "name": "image",
     "req": true,
     "def": ""
    },
    {
     "name": "threshold1",
     "req": true,
     "def": "100"
    },
    {
     "name": "threshold2",
     "req": true,
     "def": "200"
    },
    {
     "name": "apertureSize",
     "req": false,
     "def": "",
     "hint": "3"
    },
    {
     "name": "L2gradient",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "edges"
   ],
   "sig": "Canny(image, threshold1, threshold2[, edges[, apertureSize[, L2gradient]]]) -> edges",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.distanceTransform",
   "type": "call",
   "fn": "cv.distanceTransform",
   "title": "거리 변환",
   "cat": "morph",
   "args": [
    {
     "name": "src",
     "req": true,
     "def": ""
    },
    {
     "name": "distanceType",
     "req": true,
     "def": "cv.DIST_L2",
     "opts": [
      "cv.DIST_L2",
      "cv.DIST_L1"
     ]
    },
    {
     "name": "maskSize",
     "req": true,
     "def": "5",
     "opts": [
      "5",
      "3",
      "0"
     ]
    },
    {
     "name": "dstType",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "dst"
   ],
   "sig": "distanceTransform(src, distanceType, maskSize[, dst[, dstType]]) -> dst",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.findContours",
   "type": "call",
   "fn": "cv.findContours",
   "title": "컨투어 찾기",
   "cat": "contour",
   "args": [
    {
     "name": "image",
     "req": true,
     "def": ""
    },
    {
     "name": "mode",
     "req": true,
     "def": "cv.RETR_EXTERNAL",
     "opts": [
      "cv.RETR_EXTERNAL",
      "cv.RETR_LIST",
      "cv.RETR_TREE",
      "cv.RETR_CCOMP"
     ]
    },
    {
     "name": "method",
     "req": true,
     "def": "cv.CHAIN_APPROX_SIMPLE",
     "opts": [
      "cv.CHAIN_APPROX_SIMPLE",
      "cv.CHAIN_APPROX_NONE"
     ]
    },
    {
     "name": "offset",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "contours",
    "hierarchy"
   ],
   "sig": "findContours(image, mode, method[, contours[, hierarchy[, offset]]]) -> contours, hierarchy",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.drawContours",
   "type": "call",
   "fn": "cv.drawContours",
   "title": "컨투어 그리기",
   "cat": "draw",
   "args": [
    {
     "name": "image",
     "req": true,
     "def": ""
    },
    {
     "name": "contours",
     "req": true,
     "def": ""
    },
    {
     "name": "contourIdx",
     "req": true,
     "def": "-1"
    },
    {
     "name": "color",
     "req": true,
     "def": "(0, 0, 255)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": ""
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "hierarchy",
     "req": false,
     "def": ""
    },
    {
     "name": "maxLevel",
     "req": false,
     "def": ""
    },
    {
     "name": "offset",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "image"
   ],
   "sig": "drawContours(image, contours, contourIdx, color[, thickness[, lineType[, hierarchy[, maxLevel[, offset]]]]]) -> image",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.contourArea",
   "type": "call",
   "fn": "cv.contourArea",
   "title": "컨투어 면적",
   "cat": "contour",
   "args": [
    {
     "name": "contour",
     "req": true,
     "def": ""
    },
    {
     "name": "oriented",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "area"
   ],
   "sig": "contourArea(contour[, oriented]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.arcLength",
   "type": "call",
   "fn": "cv.arcLength",
   "title": "컨투어 둘레",
   "cat": "contour",
   "args": [
    {
     "name": "curve",
     "req": true,
     "def": ""
    },
    {
     "name": "closed",
     "req": true,
     "def": "True",
     "opts": [
      "True",
      "False"
     ]
    }
   ],
   "outs": [
    "perimeter"
   ],
   "sig": "arcLength(curve, closed) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.approxPolyDP",
   "type": "call",
   "fn": "cv.approxPolyDP",
   "title": "다각형 근사",
   "cat": "contour",
   "args": [
    {
     "name": "curve",
     "req": true,
     "def": ""
    },
    {
     "name": "epsilon",
     "req": true,
     "def": ""
    },
    {
     "name": "closed",
     "req": true,
     "def": "True",
     "opts": [
      "True",
      "False"
     ]
    }
   ],
   "outs": [
    "approx"
   ],
   "sig": "approxPolyDP(curve, epsilon, closed[, approxCurve]) -> approxCurve",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.boundingRect",
   "type": "call",
   "fn": "cv.boundingRect",
   "title": "경계 사각형",
   "cat": "contour",
   "args": [
    {
     "name": "array",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "rect"
   ],
   "sig": "boundingRect(array) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.minAreaRect",
   "type": "call",
   "fn": "cv.minAreaRect",
   "title": "회전된 최소 사각형",
   "cat": "contour",
   "args": [
    {
     "name": "points",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "rect"
   ],
   "sig": "minAreaRect(points) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.boxPoints",
   "type": "call",
   "fn": "cv.boxPoints",
   "title": "사각형 꼭짓점 4개",
   "cat": "contour",
   "args": [
    {
     "name": "box",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "box"
   ],
   "sig": "boxPoints(box[, points]) -> points",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.minEnclosingCircle",
   "type": "call",
   "fn": "cv.minEnclosingCircle",
   "title": "최소 외접원",
   "cat": "contour",
   "args": [
    {
     "name": "points",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "center",
    "radius"
   ],
   "sig": "minEnclosingCircle(points) -> center, radius",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.fitEllipse",
   "type": "call",
   "fn": "cv.fitEllipse",
   "title": "타원 맞추기",
   "cat": "contour",
   "args": [
    {
     "name": "points",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "ellipse"
   ],
   "sig": "fitEllipse(points) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.fitLine",
   "type": "call",
   "fn": "cv.fitLine",
   "title": "직선 맞추기",
   "cat": "contour",
   "args": [
    {
     "name": "points",
     "req": true,
     "def": ""
    },
    {
     "name": "distType",
     "req": true,
     "def": "cv.DIST_L2"
    },
    {
     "name": "param",
     "req": true,
     "def": "0"
    },
    {
     "name": "reps",
     "req": true,
     "def": "0.01"
    },
    {
     "name": "aeps",
     "req": true,
     "def": "0.01"
    }
   ],
   "outs": [
    "line"
   ],
   "sig": "fitLine(points, distType, param, reps, aeps[, line]) -> line",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.convexHull",
   "type": "call",
   "fn": "cv.convexHull",
   "title": "볼록 껍질",
   "cat": "contour",
   "args": [
    {
     "name": "points",
     "req": true,
     "def": ""
    },
    {
     "name": "clockwise",
     "req": false,
     "def": ""
    },
    {
     "name": "returnPoints",
     "req": false,
     "def": "",
     "hint": "False"
    }
   ],
   "outs": [
    "hull"
   ],
   "sig": "convexHull(points[, hull[, clockwise[, returnPoints]]]) -> hull",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.isContourConvex",
   "type": "call",
   "fn": "cv.isContourConvex",
   "title": "볼록한지 검사",
   "cat": "contour",
   "args": [
    {
     "name": "contour",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "is_convex"
   ],
   "sig": "isContourConvex(contour) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.convexityDefects",
   "type": "call",
   "fn": "cv.convexityDefects",
   "title": "볼록 결함",
   "cat": "contour",
   "args": [
    {
     "name": "contour",
     "req": true,
     "def": ""
    },
    {
     "name": "convexhull",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "defects"
   ],
   "sig": "convexityDefects(contour, convexhull[, convexityDefects]) -> convexityDefects",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.moments",
   "type": "call",
   "fn": "cv.moments",
   "title": "모멘트 (무게중심 등)",
   "cat": "contour",
   "args": [
    {
     "name": "array",
     "req": true,
     "def": ""
    },
    {
     "name": "binaryImage",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "M"
   ],
   "sig": "moments(array[, binaryImage]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.pointPolygonTest",
   "type": "call",
   "fn": "cv.pointPolygonTest",
   "title": "점이 컨투어 안에 있는지",
   "cat": "contour",
   "args": [
    {
     "name": "contour",
     "req": true,
     "def": ""
    },
    {
     "name": "pt",
     "req": true,
     "def": "(320, 110)"
    },
    {
     "name": "measureDist",
     "req": true,
     "def": "False"
    }
   ],
   "outs": [
    "dist"
   ],
   "sig": "pointPolygonTest(contour, pt, measureDist) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.matchTemplate",
   "type": "call",
   "fn": "cv.matchTemplate",
   "title": "템플릿 매칭",
   "cat": "detect",
   "args": [
    {
     "name": "image",
     "req": true,
     "def": ""
    },
    {
     "name": "templ",
     "req": true,
     "def": ""
    },
    {
     "name": "method",
     "req": true,
     "def": "cv.TM_CCOEFF_NORMED",
     "opts": [
      "cv.TM_CCOEFF_NORMED",
      "cv.TM_CCOEFF",
      "cv.TM_CCORR_NORMED",
      "cv.TM_SQDIFF",
      "cv.TM_SQDIFF_NORMED"
     ]
    },
    {
     "name": "mask",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "result"
   ],
   "sig": "matchTemplate(image, templ, method[, result[, mask]]) -> result",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.HoughLines",
   "type": "call",
   "fn": "cv.HoughLines",
   "title": "허프 직선 (표준)",
   "cat": "detect",
   "args": [
    {
     "name": "image",
     "req": true,
     "def": ""
    },
    {
     "name": "rho",
     "req": true,
     "def": "1"
    },
    {
     "name": "theta",
     "req": true,
     "def": "np.pi / 180"
    },
    {
     "name": "threshold",
     "req": true,
     "def": "200"
    },
    {
     "name": "srn",
     "req": false,
     "def": ""
    },
    {
     "name": "stn",
     "req": false,
     "def": ""
    },
    {
     "name": "min_theta",
     "req": false,
     "def": ""
    },
    {
     "name": "max_theta",
     "req": false,
     "def": ""
    },
    {
     "name": "use_edgeval",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "lines"
   ],
   "sig": "HoughLines(image, rho, theta, threshold[, lines[, srn[, stn[, min_theta[, max_theta[, use_edgeval]]]]]]) -> lines",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.HoughLinesP",
   "type": "call",
   "fn": "cv.HoughLinesP",
   "title": "허프 직선 (확률적)",
   "cat": "detect",
   "args": [
    {
     "name": "image",
     "req": true,
     "def": ""
    },
    {
     "name": "rho",
     "req": true,
     "def": "1"
    },
    {
     "name": "theta",
     "req": true,
     "def": "np.pi / 180"
    },
    {
     "name": "threshold",
     "req": true,
     "def": "100"
    },
    {
     "name": "minLineLength",
     "req": false,
     "def": "100"
    },
    {
     "name": "maxLineGap",
     "req": false,
     "def": "10"
    }
   ],
   "outs": [
    "lines"
   ],
   "sig": "HoughLinesP(image, rho, theta, threshold[, lines[, minLineLength[, maxLineGap]]]) -> lines",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.HoughCircles",
   "type": "call",
   "fn": "cv.HoughCircles",
   "title": "허프 원 검출",
   "cat": "detect",
   "args": [
    {
     "name": "image",
     "req": true,
     "def": ""
    },
    {
     "name": "method",
     "req": true,
     "def": "cv.HOUGH_GRADIENT",
     "opts": [
      "cv.HOUGH_GRADIENT",
      "cv.HOUGH_GRADIENT_ALT"
     ]
    },
    {
     "name": "dp",
     "req": true,
     "def": "1"
    },
    {
     "name": "minDist",
     "req": true,
     "def": "20"
    },
    {
     "name": "param1",
     "req": false,
     "def": "50"
    },
    {
     "name": "param2",
     "req": false,
     "def": "30"
    },
    {
     "name": "minRadius",
     "req": false,
     "def": "0"
    },
    {
     "name": "maxRadius",
     "req": false,
     "def": "0"
    }
   ],
   "outs": [
    "circles"
   ],
   "sig": "HoughCircles(image, method, dp, minDist[, circles[, param1[, param2[, minRadius[, maxRadius]]]]]) -> circles",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.ORB_create",
   "type": "call",
   "fn": "cv.ORB_create",
   "title": "ORB 특징점 검출기",
   "cat": "detect",
   "args": [
    {
     "name": "nfeatures",
     "req": false,
     "def": "",
     "hint": "500"
    },
    {
     "name": "scaleFactor",
     "req": false,
     "def": ""
    },
    {
     "name": "nlevels",
     "req": false,
     "def": ""
    },
    {
     "name": "edgeThreshold",
     "req": false,
     "def": ""
    },
    {
     "name": "firstLevel",
     "req": false,
     "def": ""
    },
    {
     "name": "WTA_K",
     "req": false,
     "def": ""
    },
    {
     "name": "scoreType",
     "req": false,
     "def": ""
    },
    {
     "name": "patchSize",
     "req": false,
     "def": ""
    },
    {
     "name": "fastThreshold",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "orb"
   ],
   "sig": "ORB_create([, nfeatures[, scaleFactor[, nlevels[, edgeThreshold[, firstLevel[, WTA_K[, scoreType[, patchSize[, fastThreshold]]]]]]]]]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.BFMatcher",
   "type": "call",
   "fn": "cv.BFMatcher",
   "title": "특징점 매처 (BF)",
   "cat": "detect",
   "args": [
    {
     "name": "normType",
     "req": false,
     "def": "",
     "opts": [
      "cv.NORM_HAMMING",
      "cv.NORM_L2"
     ]
    },
    {
     "name": "crossCheck",
     "req": false,
     "def": "",
     "hint": "True"
    }
   ],
   "outs": [
    "matcher"
   ],
   "sig": "BFMatcher([, normType[, crossCheck]]) -> matcher",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.drawMatches",
   "type": "call",
   "fn": "cv.drawMatches",
   "title": "매칭 결과 그리기",
   "cat": "detect",
   "args": [
    {
     "name": "img1",
     "req": true,
     "def": ""
    },
    {
     "name": "keypoints1",
     "req": true,
     "def": ""
    },
    {
     "name": "img2",
     "req": true,
     "def": ""
    },
    {
     "name": "keypoints2",
     "req": true,
     "def": ""
    },
    {
     "name": "matches1to2",
     "req": true,
     "def": ""
    },
    {
     "name": "outImg",
     "req": true,
     "def": "None"
    },
    {
     "name": "matchColor",
     "req": false,
     "def": ""
    },
    {
     "name": "singlePointColor",
     "req": false,
     "def": ""
    },
    {
     "name": "matchesMask",
     "req": false,
     "def": ""
    },
    {
     "name": "flags",
     "req": false,
     "def": "",
     "hint": "cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS"
    }
   ],
   "outs": [
    "outImg"
   ],
   "sig": "drawMatches(img1, keypoints1, img2, keypoints2, matches1to2, outImg[, matchColor[, singlePointColor[, matchesMask[, flags]]]]) -> outImg",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.createBackgroundSubtractorMOG2",
   "type": "call",
   "fn": "cv.createBackgroundSubtractorMOG2",
   "title": "배경 차분기 (MOG2)",
   "cat": "detect",
   "args": [
    {
     "name": "history",
     "req": false,
     "def": "",
     "hint": "200"
    },
    {
     "name": "varThreshold",
     "req": false,
     "def": "",
     "hint": "25"
    },
    {
     "name": "detectShadows",
     "req": false,
     "def": "",
     "hint": "True"
    }
   ],
   "outs": [
    "subtractor"
   ],
   "sig": "createBackgroundSubtractorMOG2([, history[, varThreshold[, detectShadows]]]) -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.line",
   "type": "call",
   "fn": "cv.line",
   "title": "선",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "pt1",
     "req": true,
     "def": "(0, 0)"
    },
    {
     "name": "pt2",
     "req": true,
     "def": "(511, 511)"
    },
    {
     "name": "color",
     "req": true,
     "def": "(0, 0, 255)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": ""
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "shift",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "line(img, pt1, pt2, color[, thickness[, lineType[, shift]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.arrowedLine",
   "type": "call",
   "fn": "cv.arrowedLine",
   "title": "화살표",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "pt1",
     "req": true,
     "def": ""
    },
    {
     "name": "pt2",
     "req": true,
     "def": ""
    },
    {
     "name": "color",
     "req": true,
     "def": "(0, 120, 255)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": ""
    },
    {
     "name": "line_type",
     "req": false,
     "def": ""
    },
    {
     "name": "shift",
     "req": false,
     "def": ""
    },
    {
     "name": "tipLength",
     "req": false,
     "def": "",
     "hint": "0.35"
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "arrowedLine(img, pt1, pt2, color[, thickness[, line_type[, shift[, tipLength]]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.rectangle",
   "type": "call",
   "fn": "cv.rectangle",
   "title": "사각형",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "pt1",
     "req": true,
     "def": "(50, 50)"
    },
    {
     "name": "pt2",
     "req": true,
     "def": "(200, 150)"
    },
    {
     "name": "color",
     "req": true,
     "def": "(0, 255, 0)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": "2"
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "shift",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "rectangle(img, pt1, pt2, color[, thickness[, lineType[, shift]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.circle",
   "type": "call",
   "fn": "cv.circle",
   "title": "원",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "center",
     "req": true,
     "def": "(100, 100)"
    },
    {
     "name": "radius",
     "req": true,
     "def": "40"
    },
    {
     "name": "color",
     "req": true,
     "def": "(0, 0, 255)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": "2"
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "shift",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "circle(img, center, radius, color[, thickness[, lineType[, shift]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.ellipse",
   "type": "call",
   "fn": "cv.ellipse",
   "title": "타원",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "center",
     "req": true,
     "def": "(256, 256)"
    },
    {
     "name": "axes",
     "req": true,
     "def": "(100, 50)"
    },
    {
     "name": "angle",
     "req": true,
     "def": "0"
    },
    {
     "name": "startAngle",
     "req": true,
     "def": "0"
    },
    {
     "name": "endAngle",
     "req": true,
     "def": "180"
    },
    {
     "name": "color",
     "req": true,
     "def": "255",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": ""
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "shift",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "ellipse(img, center, axes, angle, startAngle, endAngle, color[, thickness[, lineType[, shift]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.polylines",
   "type": "call",
   "fn": "cv.polylines",
   "title": "꺾은선 · 다각형",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "pts",
     "req": true,
     "def": ""
    },
    {
     "name": "isClosed",
     "req": true,
     "def": "True"
    },
    {
     "name": "color",
     "req": true,
     "def": "(0, 255, 0)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": ""
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "shift",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "polylines(img, pts, isClosed, color[, thickness[, lineType[, shift]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.fillPoly",
   "type": "call",
   "fn": "cv.fillPoly",
   "title": "다각형 채우기",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "pts",
     "req": true,
     "def": ""
    },
    {
     "name": "color",
     "req": true,
     "def": "(255, 128, 0)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "shift",
     "req": false,
     "def": ""
    },
    {
     "name": "offset",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "fillPoly(img, pts, color[, lineType[, shift[, offset]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.putText",
   "type": "call",
   "fn": "cv.putText",
   "title": "글자 쓰기",
   "cat": "draw",
   "args": [
    {
     "name": "img",
     "req": true,
     "def": ""
    },
    {
     "name": "text",
     "req": true,
     "def": "'OpenCV'"
    },
    {
     "name": "org",
     "req": true,
     "def": "(10, 30)"
    },
    {
     "name": "fontFace",
     "req": true,
     "def": "cv.FONT_HERSHEY_SIMPLEX",
     "opts": [
      "cv.FONT_HERSHEY_SIMPLEX",
      "cv.FONT_HERSHEY_PLAIN",
      "cv.FONT_HERSHEY_DUPLEX",
      "cv.FONT_HERSHEY_COMPLEX",
      "cv.FONT_HERSHEY_SCRIPT_SIMPLEX"
     ]
    },
    {
     "name": "fontScale",
     "req": true,
     "def": "1"
    },
    {
     "name": "color",
     "req": true,
     "def": "(0, 0, 255)",
     "opts": [
      "(0, 0, 255)",
      "(0, 255, 0)",
      "(255, 0, 0)",
      "(255, 255, 255)",
      "(0, 0, 0)",
      "(0, 255, 255)",
      "(255, 0, 255)",
      "(255, 255, 0)"
     ]
    },
    {
     "name": "thickness",
     "req": false,
     "def": "2"
    },
    {
     "name": "lineType",
     "req": false,
     "def": "",
     "opts": [
      "cv.LINE_AA",
      "cv.LINE_8",
      "cv.LINE_4"
     ]
    },
    {
     "name": "bottomLeftOrigin",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "img"
   ],
   "sig": "putText(img, text, org, fontFace, fontScale, color[, thickness[, lineType[, bottomLeftOrigin]]]) -> img",
   "perFrame": false,
   "inplace": true
  },
  {
   "key": "cv.getTextSize",
   "type": "call",
   "fn": "cv.getTextSize",
   "title": "글자 크기 재기",
   "cat": "draw",
   "args": [
    {
     "name": "text",
     "req": true,
     "def": ""
    },
    {
     "name": "fontFace",
     "req": true,
     "def": "cv.FONT_HERSHEY_DUPLEX",
     "opts": [
      "cv.FONT_HERSHEY_SIMPLEX",
      "cv.FONT_HERSHEY_PLAIN",
      "cv.FONT_HERSHEY_DUPLEX",
      "cv.FONT_HERSHEY_COMPLEX",
      "cv.FONT_HERSHEY_SCRIPT_SIMPLEX"
     ]
    },
    {
     "name": "fontScale",
     "req": true,
     "def": "1.0"
    },
    {
     "name": "thickness",
     "req": true,
     "def": "2"
    }
   ],
   "outs": [
    "size",
    "baseline"
   ],
   "sig": "getTextSize(text, fontFace, fontScale, thickness) -> retval, baseLine",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.getTickCount",
   "type": "call",
   "fn": "cv.getTickCount",
   "title": "틱 카운트 (시간 측정)",
   "cat": "util",
   "args": [],
   "outs": [
    "ticks"
   ],
   "sig": "getTickCount() -> retval",
   "perFrame": true,
   "inplace": false
  },
  {
   "key": "cv.getTickFrequency",
   "type": "call",
   "fn": "cv.getTickFrequency",
   "title": "초당 틱 수",
   "cat": "util",
   "args": [],
   "outs": [
    "freq"
   ],
   "sig": "getTickFrequency() -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.useOptimized",
   "type": "call",
   "fn": "cv.useOptimized",
   "title": "최적화 사용 여부",
   "cat": "util",
   "args": [],
   "outs": [
    "enabled"
   ],
   "sig": "useOptimized() -> retval",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "cv.setUseOptimized",
   "type": "call",
   "fn": "cv.setUseOptimized",
   "title": "최적화 켜기/끄기",
   "cat": "util",
   "args": [
    {
     "name": "onoff",
     "req": true,
     "def": "True"
    }
   ],
   "outs": [],
   "sig": "setUseOptimized(onoff) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "time.perf_counter",
   "type": "call",
   "fn": "time.perf_counter",
   "title": "현재 시각 (초)",
   "cat": "util",
   "args": [],
   "outs": [
    "t"
   ],
   "sig": "perf_counter() -> t",
   "perFrame": true,
   "inplace": false
  },
  {
   "key": "time.time",
   "type": "call",
   "fn": "time.time",
   "title": "현재 시각 (Unix 초)",
   "cat": "util",
   "args": [],
   "outs": [
    "t"
   ],
   "sig": "time() -> t",
   "perFrame": true,
   "inplace": false
  },
  {
   "key": "print",
   "type": "call",
   "fn": "print",
   "title": "출력 (print)",
   "cat": "util",
   "args": [
    {
     "name": "value",
     "req": true,
     "def": "'hello'"
    },
    {
     "name": "value2",
     "req": false,
     "def": ""
    },
    {
     "name": "value3",
     "req": false,
     "def": ""
    }
   ],
   "outs": [],
   "sig": "print(value[, value2[, value3]]) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "webcv.get_input",
   "type": "call",
   "fn": "webcv.get_input",
   "title": "오른쪽 입력 소스 가져오기",
   "cat": "flow",
   "args": [],
   "outs": [
    "img"
   ],
   "sig": "get_input() -> img",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.zeros",
   "type": "call",
   "fn": "np.zeros",
   "title": "0으로 채운 배열",
   "cat": "numpy",
   "args": [
    {
     "name": "shape",
     "req": true,
     "def": "(300, 400, 3)"
    },
    {
     "name": "dtype",
     "req": false,
     "def": "np.uint8",
     "opts": [
      "np.uint8",
      "np.float32",
      "np.float64",
      "np.int32"
     ]
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "zeros(shape[, dtype]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.ones",
   "type": "call",
   "fn": "np.ones",
   "title": "1로 채운 배열 (커널 등)",
   "cat": "numpy",
   "args": [
    {
     "name": "shape",
     "req": true,
     "def": "(5, 5)"
    },
    {
     "name": "dtype",
     "req": false,
     "def": "np.uint8",
     "opts": [
      "np.uint8",
      "np.float32",
      "np.float64",
      "np.int32"
     ]
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "ones(shape[, dtype]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.full",
   "type": "call",
   "fn": "np.full",
   "title": "값으로 채운 배열",
   "cat": "numpy",
   "args": [
    {
     "name": "shape",
     "req": true,
     "def": "(300, 400, 3)"
    },
    {
     "name": "fill_value",
     "req": true,
     "def": "255"
    },
    {
     "name": "dtype",
     "req": false,
     "def": "np.uint8",
     "opts": [
      "np.uint8",
      "np.float32",
      "np.float64",
      "np.int32"
     ]
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "full(shape, fill_value[, dtype]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.zeros_like",
   "type": "call",
   "fn": "np.zeros_like",
   "title": "같은 크기의 0 배열",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "dtype",
     "req": false,
     "def": "",
     "opts": [
      "np.uint8",
      "np.float32",
      "np.float64",
      "np.int32"
     ]
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "zeros_like(a[, dtype]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.full_like",
   "type": "call",
   "fn": "np.full_like",
   "title": "같은 크기의 값 배열",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "fill_value",
     "req": true,
     "def": "255"
    },
    {
     "name": "dtype",
     "req": false,
     "def": "",
     "opts": [
      "np.uint8",
      "np.float32",
      "np.float64",
      "np.int32"
     ]
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "full_like(a, fill_value[, dtype]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.array",
   "type": "call",
   "fn": "np.array",
   "title": "배열 만들기",
   "cat": "numpy",
   "args": [
    {
     "name": "object",
     "req": true,
     "def": "[[0, 1], [2, 3]]"
    },
    {
     "name": "dtype",
     "req": false,
     "def": "",
     "hint": "np.float32",
     "opts": [
      "np.uint8",
      "np.float32",
      "np.float64",
      "np.int32"
     ]
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "array(object[, dtype]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.asarray",
   "type": "call",
   "fn": "np.asarray",
   "title": "배열로 변환",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "dtype",
     "req": false,
     "def": "",
     "opts": [
      "np.uint8",
      "np.float32",
      "np.float64",
      "np.int32"
     ]
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "asarray(a[, dtype]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.ascontiguousarray",
   "type": "call",
   "fn": "np.ascontiguousarray",
   "title": "연속 메모리 배열로",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "ascontiguousarray(a) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.uint8",
   "type": "call",
   "fn": "np.uint8",
   "title": "uint8 로 변환",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": "[[10]]"
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "uint8(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.uint16",
   "type": "call",
   "fn": "np.uint16",
   "title": "uint16 로 변환",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "uint16(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.int32",
   "type": "call",
   "fn": "np.int32",
   "title": "int32 로 변환",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "int32(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.float32",
   "type": "call",
   "fn": "np.float32",
   "title": "float32 로 변환",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": "[[72, 85], [492, 69], [35, 516], [520, 520]]"
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "float32(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.intp",
   "type": "call",
   "fn": "np.intp",
   "title": "정수 인덱스형으로 변환",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "intp(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.hstack",
   "type": "call",
   "fn": "np.hstack",
   "title": "가로로 이어 붙이기",
   "cat": "numpy",
   "args": [
    {
     "name": "tup",
     "req": true,
     "def": "[img1, img2]"
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "hstack(tup) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.vstack",
   "type": "call",
   "fn": "np.vstack",
   "title": "세로로 이어 붙이기",
   "cat": "numpy",
   "args": [
    {
     "name": "tup",
     "req": true,
     "def": "[img1, img2]"
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "vstack(tup) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.dstack",
   "type": "call",
   "fn": "np.dstack",
   "title": "채널 방향으로 쌓기",
   "cat": "numpy",
   "args": [
    {
     "name": "tup",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "dstack(tup) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.column_stack",
   "type": "call",
   "fn": "np.column_stack",
   "title": "열로 쌓기",
   "cat": "numpy",
   "args": [
    {
     "name": "tup",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "column_stack(tup) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.clip",
   "type": "call",
   "fn": "np.clip",
   "title": "범위 자르기",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "a_min",
     "req": true,
     "def": "0"
    },
    {
     "name": "a_max",
     "req": true,
     "def": "255"
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "clip(a, a_min, a_max) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.abs",
   "type": "call",
   "fn": "np.abs",
   "title": "절댓값",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "abs(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.absolute",
   "type": "call",
   "fn": "np.absolute",
   "title": "절댓값",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "absolute(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.round",
   "type": "call",
   "fn": "np.round",
   "title": "반올림",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "decimals",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "round(a[, decimals]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.around",
   "type": "call",
   "fn": "np.around",
   "title": "반올림",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "decimals",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "around(a[, decimals]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.sqrt",
   "type": "call",
   "fn": "np.sqrt",
   "title": "제곱근",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "sqrt(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.sin",
   "type": "call",
   "fn": "np.sin",
   "title": "사인",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "sin(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.cos",
   "type": "call",
   "fn": "np.cos",
   "title": "코사인",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "cos(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.arctan2",
   "type": "call",
   "fn": "np.arctan2",
   "title": "각도 (arctan2)",
   "cat": "numpy",
   "args": [
    {
     "name": "y",
     "req": true,
     "def": ""
    },
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "arctan2(y, x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.degrees",
   "type": "call",
   "fn": "np.degrees",
   "title": "라디안 → 도",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "degrees(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.mean",
   "type": "call",
   "fn": "np.mean",
   "title": "평균",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "axis",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "value"
   ],
   "sig": "mean(a[, axis]) -> value",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.median",
   "type": "call",
   "fn": "np.median",
   "title": "중앙값",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "axis",
     "req": false,
     "def": "",
     "hint": "0"
    }
   ],
   "outs": [
    "value"
   ],
   "sig": "median(a[, axis]) -> value",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.std",
   "type": "call",
   "fn": "np.std",
   "title": "표준편차",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "axis",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "value"
   ],
   "sig": "std(a[, axis]) -> value",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.argmax",
   "type": "call",
   "fn": "np.argmax",
   "title": "최댓값 위치",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "axis",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "index"
   ],
   "sig": "argmax(a[, axis]) -> index",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.argmin",
   "type": "call",
   "fn": "np.argmin",
   "title": "최솟값 위치",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "axis",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "index"
   ],
   "sig": "argmin(a[, axis]) -> index",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.where",
   "type": "call",
   "fn": "np.where",
   "title": "조건으로 고르기",
   "cat": "numpy",
   "args": [
    {
     "name": "condition",
     "req": true,
     "def": ""
    },
    {
     "name": "x",
     "req": false,
     "def": ""
    },
    {
     "name": "y",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "result"
   ],
   "sig": "where(condition[, x[, y]]) -> result",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.nonzero",
   "type": "call",
   "fn": "np.nonzero",
   "title": "0 아닌 위치",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "indices"
   ],
   "sig": "nonzero(a) -> indices",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.count_nonzero",
   "type": "call",
   "fn": "np.count_nonzero",
   "title": "0 아닌 원소 수",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "count"
   ],
   "sig": "count_nonzero(a) -> count",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.unique",
   "type": "call",
   "fn": "np.unique",
   "title": "고유값",
   "cat": "numpy",
   "args": [
    {
     "name": "ar",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "values"
   ],
   "sig": "unique(ar) -> values",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.bincount",
   "type": "call",
   "fn": "np.bincount",
   "title": "정수 개수 세기",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "minlength",
     "req": false,
     "def": "",
     "hint": "256"
    }
   ],
   "outs": [
    "counts"
   ],
   "sig": "bincount(x[, minlength]) -> counts",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.histogram",
   "type": "call",
   "fn": "np.histogram",
   "title": "히스토그램 (NumPy)",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "bins",
     "req": false,
     "def": "256"
    },
    {
     "name": "range",
     "req": false,
     "def": "[0, 256]"
    }
   ],
   "outs": [
    "hist",
    "bin_edges"
   ],
   "sig": "histogram(a[, bins[, range]]) -> hist, bin_edges",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.cumsum",
   "type": "call",
   "fn": "np.cumsum",
   "title": "누적 합",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "cumsum(a) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.diff",
   "type": "call",
   "fn": "np.diff",
   "title": "이웃 차이",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "diff(a) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.arange",
   "type": "call",
   "fn": "np.arange",
   "title": "연속 숫자 배열",
   "cat": "numpy",
   "args": [
    {
     "name": "start",
     "req": true,
     "def": "0"
    },
    {
     "name": "stop",
     "req": false,
     "def": "10"
    },
    {
     "name": "step",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "arange(start[, stop[, step]]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.linspace",
   "type": "call",
   "fn": "np.linspace",
   "title": "균등 간격 배열",
   "cat": "numpy",
   "args": [
    {
     "name": "start",
     "req": true,
     "def": "0"
    },
    {
     "name": "stop",
     "req": true,
     "def": "1"
    },
    {
     "name": "num",
     "req": false,
     "def": "50"
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "linspace(start, stop[, num]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.meshgrid",
   "type": "call",
   "fn": "np.meshgrid",
   "title": "좌표 격자",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "y",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "X",
    "Y"
   ],
   "sig": "meshgrid(x, y) -> X, Y",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.repeat",
   "type": "call",
   "fn": "np.repeat",
   "title": "반복",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "repeats",
     "req": true,
     "def": "4"
    },
    {
     "name": "axis",
     "req": false,
     "def": "",
     "hint": "1"
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "repeat(a, repeats[, axis]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.tile",
   "type": "call",
   "fn": "np.tile",
   "title": "타일처럼 반복",
   "cat": "numpy",
   "args": [
    {
     "name": "A",
     "req": true,
     "def": ""
    },
    {
     "name": "reps",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "tile(A, reps) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.array_equal",
   "type": "call",
   "fn": "np.array_equal",
   "title": "배열이 같은지",
   "cat": "numpy",
   "args": [
    {
     "name": "a1",
     "req": true,
     "def": ""
    },
    {
     "name": "a2",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "same"
   ],
   "sig": "array_equal(a1, a2) -> same",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.allclose",
   "type": "call",
   "fn": "np.allclose",
   "title": "거의 같은지",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "b",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "close"
   ],
   "sig": "allclose(a, b) -> close",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.nan_to_num",
   "type": "call",
   "fn": "np.nan_to_num",
   "title": "NaN 을 숫자로",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "nan_to_num(x) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.set_printoptions",
   "type": "call",
   "fn": "np.set_printoptions",
   "title": "출력 형식 설정",
   "cat": "numpy",
   "args": [
    {
     "name": "precision",
     "req": false,
     "def": "",
     "hint": "3"
    },
    {
     "name": "suppress",
     "req": false,
     "def": "",
     "hint": "True"
    }
   ],
   "outs": [],
   "sig": "set_printoptions([, precision[, suppress]]) -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.iinfo",
   "type": "call",
   "fn": "np.iinfo",
   "title": "정수형 범위 정보",
   "cat": "numpy",
   "args": [
    {
     "name": "type",
     "req": true,
     "def": "np.uint8"
    }
   ],
   "outs": [
    "info"
   ],
   "sig": "iinfo(type) -> info",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.errstate",
   "type": "call",
   "fn": "np.errstate",
   "title": "오류 처리 설정",
   "cat": "numpy",
   "args": [
    {
     "name": "divide",
     "req": false,
     "def": "",
     "hint": "'ignore'"
    },
    {
     "name": "invalid",
     "req": false,
     "def": "",
     "hint": "'ignore'"
    }
   ],
   "outs": [
    "ctx"
   ],
   "sig": "errstate([, divide[, invalid]]) -> ctx",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.random.default_rng",
   "type": "call",
   "fn": "np.random.default_rng",
   "title": "난수 생성기",
   "cat": "numpy",
   "args": [
    {
     "name": "seed",
     "req": false,
     "def": "0"
    }
   ],
   "outs": [
    "rng"
   ],
   "sig": "default_rng([, seed]) -> rng",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.ma.masked_equal",
   "type": "call",
   "fn": "np.ma.masked_equal",
   "title": "값 가리기 (마스크 배열)",
   "cat": "numpy",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "value",
     "req": true,
     "def": "0"
    }
   ],
   "outs": [
    "masked"
   ],
   "sig": "masked_equal(x, value) -> masked",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "np.ma.filled",
   "type": "call",
   "fn": "np.ma.filled",
   "title": "마스크 채우기",
   "cat": "numpy",
   "args": [
    {
     "name": "a",
     "req": true,
     "def": ""
    },
    {
     "name": "fill_value",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "arr"
   ],
   "sig": "filled(a[, fill_value]) -> arr",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.figure",
   "type": "call",
   "fn": "plt.figure",
   "title": "새 그림",
   "cat": "plot",
   "args": [
    {
     "name": "figsize",
     "req": false,
     "def": "(10, 4)"
    }
   ],
   "outs": [
    "fig"
   ],
   "sig": "figure([, figsize]) -> fig",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.subplot",
   "type": "call",
   "fn": "plt.subplot",
   "title": "칸 나누기 (subplot)",
   "cat": "plot",
   "args": [
    {
     "name": "pos",
     "req": true,
     "def": "121"
    }
   ],
   "outs": [
    "ax"
   ],
   "sig": "subplot(pos) -> ax",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.subplots",
   "type": "call",
   "fn": "plt.subplots",
   "title": "여러 칸 만들기",
   "cat": "plot",
   "args": [
    {
     "name": "nrows",
     "req": false,
     "def": "1"
    },
    {
     "name": "ncols",
     "req": false,
     "def": "2"
    },
    {
     "name": "figsize",
     "req": false,
     "def": "",
     "hint": "(9, 3.2)"
    }
   ],
   "outs": [
    "fig",
    "axes"
   ],
   "sig": "subplots([, nrows[, ncols[, figsize]]]) -> fig, axes",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.imshow",
   "type": "call",
   "fn": "plt.imshow",
   "title": "그림에 이미지 표시",
   "cat": "plot",
   "args": [
    {
     "name": "X",
     "req": true,
     "def": ""
    },
    {
     "name": "cmap",
     "req": false,
     "def": "'gray'",
     "opts": [
      "'gray'",
      "'hsv'",
      "'jet'",
      "None"
     ]
    }
   ],
   "outs": [
    "image"
   ],
   "sig": "imshow(X[, cmap]) -> image",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.title",
   "type": "call",
   "fn": "plt.title",
   "title": "제목",
   "cat": "plot",
   "args": [
    {
     "name": "label",
     "req": true,
     "def": "'Image'"
    }
   ],
   "outs": [
    "text"
   ],
   "sig": "title(label) -> text",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.axis",
   "type": "call",
   "fn": "plt.axis",
   "title": "축 설정",
   "cat": "plot",
   "args": [
    {
     "name": "arg",
     "req": true,
     "def": "'off'"
    }
   ],
   "outs": [
    "limits"
   ],
   "sig": "axis(arg) -> limits",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.xticks",
   "type": "call",
   "fn": "plt.xticks",
   "title": "x 눈금",
   "cat": "plot",
   "args": [
    {
     "name": "ticks",
     "req": true,
     "def": "[]"
    }
   ],
   "outs": [
    "locs"
   ],
   "sig": "xticks(ticks) -> locs",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.yticks",
   "type": "call",
   "fn": "plt.yticks",
   "title": "y 눈금",
   "cat": "plot",
   "args": [
    {
     "name": "ticks",
     "req": true,
     "def": "[]"
    }
   ],
   "outs": [
    "locs"
   ],
   "sig": "yticks(ticks) -> locs",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.plot",
   "type": "call",
   "fn": "plt.plot",
   "title": "선 그래프",
   "cat": "plot",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "y",
     "req": false,
     "def": ""
    },
    {
     "name": "fmt",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "lines"
   ],
   "sig": "plot(x[, y[, fmt]]) -> lines",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.hist",
   "type": "call",
   "fn": "plt.hist",
   "title": "히스토그램 그래프",
   "cat": "plot",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "range",
     "req": false,
     "def": "[0, 256]"
    }
   ],
   "outs": [
    "n",
    "bins",
    "patches"
   ],
   "sig": "hist(x[, bins[, range]]) -> n, bins, patches",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.xlim",
   "type": "call",
   "fn": "plt.xlim",
   "title": "x 범위",
   "cat": "plot",
   "args": [
    {
     "name": "left",
     "req": true,
     "def": "0"
    },
    {
     "name": "right",
     "req": false,
     "def": "256"
    }
   ],
   "outs": [
    "lim"
   ],
   "sig": "xlim(left[, right]) -> lim",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.ylim",
   "type": "call",
   "fn": "plt.ylim",
   "title": "y 범위",
   "cat": "plot",
   "args": [
    {
     "name": "bottom",
     "req": true,
     "def": "0"
    },
    {
     "name": "top",
     "req": false,
     "def": ""
    }
   ],
   "outs": [
    "lim"
   ],
   "sig": "ylim(bottom[, top]) -> lim",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.xlabel",
   "type": "call",
   "fn": "plt.xlabel",
   "title": "x 축 이름",
   "cat": "plot",
   "args": [
    {
     "name": "label",
     "req": true,
     "def": "'x (row 50)'"
    }
   ],
   "outs": [
    "text"
   ],
   "sig": "xlabel(label) -> text",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.ylabel",
   "type": "call",
   "fn": "plt.ylabel",
   "title": "y 축 이름",
   "cat": "plot",
   "args": [
    {
     "name": "label",
     "req": true,
     "def": "'intensity'"
    }
   ],
   "outs": [
    "text"
   ],
   "sig": "ylabel(label) -> text",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.legend",
   "type": "call",
   "fn": "plt.legend",
   "title": "범례",
   "cat": "plot",
   "args": [],
   "outs": [
    "legend"
   ],
   "sig": "legend() -> legend",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.axvline",
   "type": "call",
   "fn": "plt.axvline",
   "title": "세로 기준선",
   "cat": "plot",
   "args": [
    {
     "name": "x",
     "req": true,
     "def": ""
    },
    {
     "name": "color",
     "req": false,
     "def": "",
     "hint": "'r'"
    }
   ],
   "outs": [
    "line"
   ],
   "sig": "axvline(x[, color]) -> line",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.axhline",
   "type": "call",
   "fn": "plt.axhline",
   "title": "가로 기준선",
   "cat": "plot",
   "args": [
    {
     "name": "y",
     "req": true,
     "def": "5"
    },
    {
     "name": "color",
     "req": false,
     "def": "",
     "hint": "'gray'"
    }
   ],
   "outs": [
    "line"
   ],
   "sig": "axhline(y[, color]) -> line",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.tight_layout",
   "type": "call",
   "fn": "plt.tight_layout",
   "title": "간격 자동 정리",
   "cat": "plot",
   "args": [],
   "outs": [],
   "sig": "tight_layout() -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "plt.show",
   "type": "call",
   "fn": "plt.show",
   "title": "그래프 표시",
   "cat": "plot",
   "args": [],
   "outs": [],
   "sig": "show() -> None",
   "perFrame": false,
   "inplace": false
  },
  {
   "key": "frame",
   "type": "frame",
   "title": "입력 소스 (웹캠 · 동영상 · 이미지)",
   "cat": "flow",
   "outs": [
    "frame"
   ],
   "doc": "실시간 처리의 시작점입니다. 오른쪽 \"입력 소스\"에서 고른 영상의 매 프레임이 frame 으로 나옵니다. (def process(frame):)"
  },
  {
   "key": "return",
   "type": "return",
   "title": "결과 출력 (return)",
   "cat": "flow",
   "expr": "frame",
   "doc": "process(frame) 의 결과 이미지입니다. result 창과 프리뷰에 표시됩니다."
  },
  {
   "key": "code:python",
   "type": "code",
   "title": "Python 코드",
   "cat": "code",
   "code": "# 자유롭게 Python 코드를 작성하세요\nresult = img.copy()",
   "outs": [
    "result"
   ],
   "doc": "블록으로 만들기 어려운 코드(반복문, 조건문, 함수 정의 등)를 직접 작성합니다. 다른 노드의 변수 이름을 코드에서 쓰면 자동으로 연결됩니다."
  },
  {
   "key": "code:value",
   "type": "code",
   "title": "변수 값",
   "cat": "code",
   "code": "value = 100",
   "outs": [
    "value"
   ],
   "doc": "숫자 · 튜플 · 문자열 같은 값을 변수로 만듭니다."
  },
  {
   "key": "code:copy",
   "type": "code",
   "title": "이미지 복사",
   "cat": "code",
   "code": "out = img.copy()",
   "outs": [
    "out"
   ],
   "doc": "원본을 보존하고 그 위에 그릴 때 사용합니다."
  },
  {
   "key": "code:roi",
   "type": "code",
   "title": "ROI 자르기",
   "cat": "code",
   "code": "roi = img[100:200, 150:300]",
   "outs": [
    "roi"
   ],
   "doc": "img[y1:y2, x1:x2] 로 관심 영역을 잘라냅니다."
  },
  {
   "key": "code:shape",
   "type": "code",
   "title": "크기 읽기 (shape)",
   "cat": "code",
   "code": "h, w = img.shape[:2]",
   "outs": [
    "h",
    "w"
   ],
   "doc": "이미지의 높이와 너비를 읽습니다."
  },
  {
   "key": "code:channel",
   "type": "code",
   "title": "채널 값 바꾸기",
   "cat": "code",
   "code": "img[:, :, 2] = 0",
   "outs": [
    "img"
   ],
   "doc": "NumPy 인덱싱으로 채널 값을 바꿉니다 (제자리 수정)."
  },
  {
   "key": "code:for",
   "type": "code",
   "title": "컨투어 반복 처리",
   "cat": "code",
   "code": "for cnt in contours:\n    x, y, w, h = cv.boundingRect(cnt)\n    cv.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)",
   "outs": [
    "img"
   ],
   "doc": "for 문으로 여러 컨투어를 하나씩 처리합니다."
  },
  {
   "key": "code:def",
   "type": "code",
   "title": "함수 정의 (콜백 등)",
   "cat": "code",
   "code": "def nothing(x):\n    pass",
   "outs": [
    "nothing"
   ],
   "doc": "트랙바 · 마우스 콜백 같은 함수를 정의합니다."
  },
  {
   "key": "code:global",
   "type": "code",
   "title": "전역 변수 선언 (global)",
   "cat": "code",
   "code": "global prev",
   "outs": [],
   "scope": "process",
   "doc": "process 안에서 프레임 사이에 값을 유지할 변수를 선언합니다."
  },
  {
   "key": "code:read",
   "type": "code",
   "title": "동영상 프레임 읽기",
   "cat": "flow",
   "code": "ret, frame = cap.read()",
   "outs": [
    "ret",
    "frame"
   ],
   "doc": "cap.read() 로 현재 프레임 한 장을 읽습니다."
  }
 ]
};
if (typeof module !== "undefined") module.exports = window.NODE_CATALOG;
