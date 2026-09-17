"""노드 편집기 블록 카탈로그 생성기 → js/nodes/catalog.js

- 강좌 예제에 등장하는 OpenCV · NumPy · Matplotlib 함수를 블록으로 정의합니다.
- 인자 이름/출력 이름은 OpenCV docstring 서명에서 자동으로 읽고(np/plt 는 아래에 직접 기술),
  인자 기본값은 강좌 예제에서 가장 많이 쓰인 값으로 채웁니다.

사용: python tools/build_catalog.py
"""
import ast
import collections
import json
import os
import re
import subprocess

import cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CATEGORIES = [
    ('flow', '🔀 흐름 · 입출력', '입력 소스, 결과 출력, 이미지/동영상 읽기, 창 표시'),
    ('gui', '🖱️ GUI · 트랙바', '창, 트랙바, 마우스, 키 입력'),
    ('color', '🎨 색 · 채널', '색 공간 변환, 채널 분리/병합, 색 범위'),
    ('arith', '➕ 산술 · 비트 연산', '더하기, 블렌딩, 비트 연산, 통계'),
    ('geom', '📐 기하 변환', '크기, 회전, 이동, 원근, 테두리, 피라미드'),
    ('filter', '🌫️ 필터 · 임계처리', '블러, 컨볼루션, 이진화, 히스토그램'),
    ('morph', '🧱 모폴로지 · 엣지', '침식/팽창, 그래디언트, Canny'),
    ('contour', '🔷 컨투어 · 도형 분석', '윤곽선 찾기, 면적, 근사, 경계 도형'),
    ('detect', '🎯 검출 · 매칭', '템플릿 매칭, 허프 변환, 특징점'),
    ('draw', '✏️ 그리기', '선, 사각형, 원, 글자'),
    ('numpy', '🔢 NumPy', '배열 만들기, 이어 붙이기, 계산'),
    ('plot', '📊 Matplotlib', '그래프, 히스토그램 그리기'),
    ('util', '⏱️ 유틸 · 시간', '시간 측정, 최적화 설정, 출력'),
    ('code', '🐍 Python 코드', '직접 코드 작성, 변수, ROI, 반복문'),
]

# key: (한국어 제목, 분류, 추가 설정)
# 추가 설정: sig(직접 서명), outs(출력 이름 바꾸기), opts{인자: [선택지]}, defs{인자: 기본값}, perFrame, inplace, file(인자)
C = {}
def m(key, title, cat, **kw):
    C[key] = dict(title=title, cat=cat, **kw)

COLOR_OPTS = ['(0, 0, 255)', '(0, 255, 0)', '(255, 0, 0)', '(255, 255, 255)', '(0, 0, 0)', '(0, 255, 255)', '(255, 0, 255)', '(255, 255, 0)']
KSIZE = ['(3, 3)', '(5, 5)', '(7, 7)', '(9, 9)', '(15, 15)']
INTER = ['cv.INTER_LINEAR', 'cv.INTER_AREA', 'cv.INTER_CUBIC', 'cv.INTER_NEAREST', 'cv.INTER_LANCZOS4']
BORDER = ['cv.BORDER_CONSTANT', 'cv.BORDER_REPLICATE', 'cv.BORDER_REFLECT', 'cv.BORDER_REFLECT_101', 'cv.BORDER_WRAP']
FONT = ['cv.FONT_HERSHEY_SIMPLEX', 'cv.FONT_HERSHEY_PLAIN', 'cv.FONT_HERSHEY_DUPLEX', 'cv.FONT_HERSHEY_COMPLEX', 'cv.FONT_HERSHEY_SCRIPT_SIMPLEX']
LINE = ['cv.LINE_AA', 'cv.LINE_8', 'cv.LINE_4']
THR = ['cv.THRESH_BINARY', 'cv.THRESH_BINARY_INV', 'cv.THRESH_TRUNC', 'cv.THRESH_TOZERO', 'cv.THRESH_TOZERO_INV',
       'cv.THRESH_BINARY + cv.THRESH_OTSU', 'cv.THRESH_BINARY_INV + cv.THRESH_OTSU']
DEPTH = ['cv.CV_64F', 'cv.CV_8U', 'cv.CV_16S', 'cv.CV_32F', '-1']
DTYPE = ['np.uint8', 'np.float32', 'np.float64', 'np.int32']
DRAW = dict(opts={'color': COLOR_OPTS, 'lineType': LINE}, inplace=True)

# ---- 흐름 · 입출력
m('cv.imread', '이미지 읽기', 'flow', file='filename', opts={'flags': ['cv.IMREAD_COLOR', 'cv.IMREAD_GRAYSCALE', 'cv.IMREAD_UNCHANGED']}, defs={'filename': "'messi5.jpg'"})
m('cv.imshow', '창에 표시', 'flow', defs={'winname': "'result'"})
m('cv.imwrite', '파일로 저장', 'flow', defs={'filename': "'result.png'"})
m('cv.VideoCapture', '동영상 · 웹캠 열기', 'flow', sig='VideoCapture(index) -> cap', opts={'index': ['0', "'vtest.avi'", "'Megamind.avi'", "'cup.mp4'"]}, defs={'index': "'vtest.avi'"})
# ---- GUI
m('cv.namedWindow', '창 만들기', 'gui', defs={'winname': "'result'"})
m('cv.waitKey', '키 입력 대기', 'gui')
m('cv.destroyAllWindows', '모든 창 닫기', 'gui')
m('cv.createTrackbar', '트랙바 만들기', 'gui', defs={'trackbarName': "'value'", 'windowName': "'result'", 'value': '100', 'count': '255', 'onChange': 'lambda x: None'})
m('cv.getTrackbarPos', '트랙바 값 읽기', 'gui', perFrame=True, outs=['pos'], defs={'trackbarname': "'value'", 'winname': "'result'"})
m('cv.setTrackbarPos', '트랙바 값 설정', 'gui')
m('cv.setMouseCallback', '마우스 콜백 연결', 'gui')
# ---- 색 · 채널
m('cv.cvtColor', '색 공간 변환', 'color', opts={'code': ['cv.COLOR_BGR2GRAY', 'cv.COLOR_BGR2HSV', 'cv.COLOR_BGR2RGB', 'cv.COLOR_GRAY2BGR', 'cv.COLOR_HSV2BGR', 'cv.COLOR_BGR2LAB', 'cv.COLOR_BGR2YCrCb']}, defs={'code': 'cv.COLOR_BGR2GRAY'})
m('cv.split', '채널 분리', 'color', outs=['b', 'g', 'r'])
m('cv.merge', '채널 합치기', 'color', defs={'mv': '(b, g, r)'})
m('cv.inRange', '색 범위 마스크', 'color', defs={'lowerb': 'np.array([100, 50, 50])', 'upperb': 'np.array([130, 255, 255])'})
# ---- 산술 · 비트
m('cv.add', '더하기 (포화)', 'arith')
m('cv.subtract', '빼기 (포화)', 'arith')
m('cv.absdiff', '차이의 절댓값', 'arith')
m('cv.divide', '나누기', 'arith')
m('cv.addWeighted', '가중치 합성 (블렌딩)', 'arith', defs={'alpha': '0.7', 'beta': '0.3', 'gamma': '0'})
m('cv.bitwise_and', '비트 AND (마스크 적용)', 'arith')
m('cv.bitwise_or', '비트 OR', 'arith')
m('cv.bitwise_xor', '비트 XOR', 'arith')
m('cv.bitwise_not', '비트 NOT (반전)', 'arith')
m('cv.convertScaleAbs', '절댓값 → 8비트 변환', 'arith')
m('cv.normalize', '정규화', 'arith', opts={'norm_type': ['cv.NORM_MINMAX', 'cv.NORM_L2', 'cv.NORM_INF']})
m('cv.countNonZero', '0 아닌 픽셀 수', 'arith', outs=['count'])
m('cv.mean', '평균값', 'arith', outs=['mean'])
m('cv.minMaxLoc', '최솟값 · 최댓값 위치', 'arith')
m('cv.magnitude', '벡터 크기', 'arith')
m('cv.phase', '벡터 각도', 'arith')
m('cv.PSNR', 'PSNR (화질 비교)', 'arith', outs=['psnr'])
m('cv.transform', '행렬 변환 (색 변환 등)', 'arith')
# ---- 기하 변환
m('cv.resize', '크기 조절', 'geom', opts={'dsize': ['(320, 240)', '(640, 480)', 'None'], 'interpolation': INTER}, defs={'dsize': '(320, 240)'})
m('cv.flip', '뒤집기', 'geom', opts={'flipCode': ['1', '0', '-1']}, defs={'flipCode': '1'})
m('cv.rotate', '90° 단위 회전', 'geom', opts={'rotateCode': ['cv.ROTATE_90_CLOCKWISE', 'cv.ROTATE_180', 'cv.ROTATE_90_COUNTERCLOCKWISE']}, defs={'rotateCode': 'cv.ROTATE_90_CLOCKWISE'})
m('cv.getRotationMatrix2D', '회전 행렬 만들기', 'geom', outs=['M'])
m('cv.getAffineTransform', '어파인 행렬 구하기', 'geom', outs=['M'])
m('cv.getPerspectiveTransform', '원근 변환 행렬 구하기', 'geom', outs=['M'])
m('cv.warpAffine', '어파인 변환 적용', 'geom', opts={'flags': INTER, 'borderMode': BORDER})
m('cv.warpPerspective', '원근 변환 적용', 'geom', opts={'flags': INTER, 'borderMode': BORDER})
m('cv.copyMakeBorder', '테두리 추가', 'geom', opts={'borderType': BORDER})
m('cv.pyrDown', '피라미드 축소 (1/2)', 'geom')
m('cv.pyrUp', '피라미드 확대 (×2)', 'geom')
# ---- 필터 · 임계처리
m('cv.threshold', '임계처리 (이진화)', 'filter', outs=['ret', 'binary'], opts={'type': THR}, defs={'thresh': '127', 'maxval': '255', 'type': 'cv.THRESH_BINARY'})
m('cv.adaptiveThreshold', '적응형 임계처리', 'filter', opts={'adaptiveMethod': ['cv.ADAPTIVE_THRESH_GAUSSIAN_C', 'cv.ADAPTIVE_THRESH_MEAN_C'], 'thresholdType': ['cv.THRESH_BINARY', 'cv.THRESH_BINARY_INV']})
m('cv.blur', '평균 블러', 'filter', opts={'ksize': KSIZE})
m('cv.boxFilter', '박스 필터', 'filter', opts={'ksize': KSIZE, 'ddepth': DEPTH})
m('cv.GaussianBlur', '가우시안 블러', 'filter', opts={'ksize': KSIZE}, defs={'ksize': '(5, 5)', 'sigmaX': '0'})
m('cv.medianBlur', '미디언 블러', 'filter', opts={'ksize': ['3', '5', '7', '9']}, defs={'ksize': '5'})
m('cv.bilateralFilter', '양방향 필터', 'filter', defs={'d': '9', 'sigmaColor': '75', 'sigmaSpace': '75'})
m('cv.filter2D', '2D 컨볼루션 (커널 필터)', 'filter', opts={'ddepth': DEPTH})
m('cv.getGaussianKernel', '가우시안 커널 만들기', 'filter', outs=['kernel'])
m('cv.getDerivKernels', '미분 커널 만들기', 'filter')
m('cv.equalizeHist', '히스토그램 평활화', 'filter')
m('cv.createCLAHE', 'CLAHE 만들기', 'filter', outs=['clahe'], defs={'clipLimit': '2.0', 'tileGridSize': '(8, 8)'})
m('cv.calcHist', '히스토그램 계산', 'filter', defs={'images': '[gray]', 'channels': '[0]', 'mask': 'None', 'histSize': '[256]', 'ranges': '[0, 256]'})
# ---- 모폴로지 · 엣지
m('cv.getStructuringElement', '구조 요소(커널) 만들기', 'morph', outs=['kernel'], opts={'shape': ['cv.MORPH_RECT', 'cv.MORPH_ELLIPSE', 'cv.MORPH_CROSS'], 'ksize': KSIZE}, defs={'shape': 'cv.MORPH_RECT', 'ksize': '(5, 5)'})
m('cv.erode', '침식', 'morph')
m('cv.dilate', '팽창', 'morph')
m('cv.morphologyEx', '모폴로지 연산', 'morph', opts={'op': ['cv.MORPH_OPEN', 'cv.MORPH_CLOSE', 'cv.MORPH_GRADIENT', 'cv.MORPH_TOPHAT', 'cv.MORPH_BLACKHAT']})
m('cv.Sobel', 'Sobel 미분', 'morph', opts={'ddepth': DEPTH})
m('cv.Scharr', 'Scharr 미분', 'morph', opts={'ddepth': DEPTH})
m('cv.Laplacian', 'Laplacian', 'morph', opts={'ddepth': DEPTH})
m('cv.Canny', 'Canny 엣지 검출', 'morph', defs={'threshold1': '100', 'threshold2': '200'})
m('cv.distanceTransform', '거리 변환', 'morph', opts={'distanceType': ['cv.DIST_L2', 'cv.DIST_L1'], 'maskSize': ['5', '3', '0']})
# ---- 컨투어
m('cv.findContours', '컨투어 찾기', 'contour', opts={'mode': ['cv.RETR_EXTERNAL', 'cv.RETR_LIST', 'cv.RETR_TREE', 'cv.RETR_CCOMP'], 'method': ['cv.CHAIN_APPROX_SIMPLE', 'cv.CHAIN_APPROX_NONE']}, defs={'mode': 'cv.RETR_EXTERNAL', 'method': 'cv.CHAIN_APPROX_SIMPLE'})
m('cv.drawContours', '컨투어 그리기', 'draw', **DRAW)
m('cv.contourArea', '컨투어 면적', 'contour', outs=['area'])
m('cv.arcLength', '컨투어 둘레', 'contour', outs=['perimeter'], opts={'closed': ['True', 'False']})
m('cv.approxPolyDP', '다각형 근사', 'contour', outs=['approx'], opts={'closed': ['True', 'False']})
m('cv.boundingRect', '경계 사각형', 'contour', outs=['rect'])
m('cv.minAreaRect', '회전된 최소 사각형', 'contour', outs=['rect'])
m('cv.boxPoints', '사각형 꼭짓점 4개', 'contour', outs=['box'])
m('cv.minEnclosingCircle', '최소 외접원', 'contour', outs=['center', 'radius'])
m('cv.fitEllipse', '타원 맞추기', 'contour', outs=['ellipse'])
m('cv.fitLine', '직선 맞추기', 'contour', outs=['line'])
m('cv.convexHull', '볼록 껍질', 'contour', outs=['hull'])
m('cv.isContourConvex', '볼록한지 검사', 'contour', outs=['is_convex'])
m('cv.convexityDefects', '볼록 결함', 'contour', outs=['defects'])
m('cv.moments', '모멘트 (무게중심 등)', 'contour', outs=['M'])
m('cv.pointPolygonTest', '점이 컨투어 안에 있는지', 'contour', outs=['dist'])
# ---- 검출 · 매칭
m('cv.matchTemplate', '템플릿 매칭', 'detect', opts={'method': ['cv.TM_CCOEFF_NORMED', 'cv.TM_CCOEFF', 'cv.TM_CCORR_NORMED', 'cv.TM_SQDIFF', 'cv.TM_SQDIFF_NORMED']}, defs={'method': 'cv.TM_CCOEFF_NORMED'})
m('cv.HoughLines', '허프 직선 (표준)', 'detect', defs={'rho': '1', 'theta': 'np.pi / 180', 'threshold': '200'})
m('cv.HoughLinesP', '허프 직선 (확률적)', 'detect', defs={'rho': '1', 'theta': 'np.pi / 180', 'threshold': '100', 'minLineLength': '100', 'maxLineGap': '10'})
m('cv.HoughCircles', '허프 원 검출', 'detect', opts={'method': ['cv.HOUGH_GRADIENT', 'cv.HOUGH_GRADIENT_ALT']}, defs={'method': 'cv.HOUGH_GRADIENT', 'dp': '1', 'minDist': '20', 'param1': '50', 'param2': '30', 'minRadius': '0', 'maxRadius': '0'})
m('cv.ORB_create', 'ORB 특징점 검출기', 'detect', outs=['orb'])
m('cv.BFMatcher', '특징점 매처 (BF)', 'detect', sig='BFMatcher([, normType[, crossCheck]]) -> matcher', opts={'normType': ['cv.NORM_HAMMING', 'cv.NORM_L2']})
m('cv.drawMatches', '매칭 결과 그리기', 'detect')
m('cv.createBackgroundSubtractorMOG2', '배경 차분기 (MOG2)', 'detect', outs=['subtractor'])
# ---- 그리기
m('cv.line', '선', 'draw', **DRAW)
m('cv.arrowedLine', '화살표', 'draw', **DRAW)
m('cv.rectangle', '사각형', 'draw', defs={'pt1': '(50, 50)', 'pt2': '(200, 150)', 'color': '(0, 255, 0)', 'thickness': '2'}, **DRAW)
m('cv.circle', '원', 'draw', defs={'center': '(100, 100)', 'radius': '40', 'color': '(0, 0, 255)', 'thickness': '2'}, **DRAW)
m('cv.ellipse', '타원', 'draw', **DRAW)
m('cv.polylines', '꺾은선 · 다각형', 'draw', **DRAW)
m('cv.fillPoly', '다각형 채우기', 'draw', **DRAW)
m('cv.putText', '글자 쓰기', 'draw', defs={'text': "'OpenCV'", 'org': '(10, 30)', 'fontFace': 'cv.FONT_HERSHEY_SIMPLEX', 'fontScale': '1', 'color': '(0, 0, 255)', 'thickness': '2'},
  opts={'color': COLOR_OPTS, 'lineType': LINE, 'fontFace': FONT}, inplace=True)
m('cv.getTextSize', '글자 크기 재기', 'draw', outs=['size', 'baseline'], opts={'fontFace': FONT})
# ---- 유틸
m('cv.getTickCount', '틱 카운트 (시간 측정)', 'util', outs=['ticks'], perFrame=True)
m('cv.getTickFrequency', '초당 틱 수', 'util', outs=['freq'])
m('cv.useOptimized', '최적화 사용 여부', 'util', outs=['enabled'])
m('cv.setUseOptimized', '최적화 켜기/끄기', 'util')
m('time.perf_counter', '현재 시각 (초)', 'util', sig='perf_counter() -> t', perFrame=True)
m('time.time', '현재 시각 (Unix 초)', 'util', sig='time() -> t', perFrame=True)
m('print', '출력 (print)', 'util', sig='print(value[, value2[, value3]]) -> None', defs={'value': "'hello'"})
m('webcv.get_input', '오른쪽 입력 소스 가져오기', 'flow', sig='get_input() -> img')

# ---- NumPy (직접 서명)
NP = {
    'zeros': ('zeros(shape[, dtype]) -> arr', '0으로 채운 배열', {'shape': '(300, 400, 3)', 'dtype': 'np.uint8'}),
    'ones': ('ones(shape[, dtype]) -> arr', '1로 채운 배열 (커널 등)', {'shape': '(5, 5)', 'dtype': 'np.uint8'}),
    'full': ('full(shape, fill_value[, dtype]) -> arr', '값으로 채운 배열', {'shape': '(300, 400, 3)', 'fill_value': '255', 'dtype': 'np.uint8'}),
    'zeros_like': ('zeros_like(a[, dtype]) -> arr', '같은 크기의 0 배열', {}),
    'full_like': ('full_like(a, fill_value[, dtype]) -> arr', '같은 크기의 값 배열', {}),
    'array': ('array(object[, dtype]) -> arr', '배열 만들기', {'object': '[[0, 1], [2, 3]]'}),
    'asarray': ('asarray(a[, dtype]) -> arr', '배열로 변환', {}),
    'ascontiguousarray': ('ascontiguousarray(a) -> arr', '연속 메모리 배열로', {}),
    'uint8': ('uint8(x) -> arr', 'uint8 로 변환', {}),
    'uint16': ('uint16(x) -> arr', 'uint16 로 변환', {}),
    'int32': ('int32(x) -> arr', 'int32 로 변환', {}),
    'float32': ('float32(x) -> arr', 'float32 로 변환', {}),
    'intp': ('intp(x) -> arr', '정수 인덱스형으로 변환', {}),
    'hstack': ('hstack(tup) -> arr', '가로로 이어 붙이기', {'tup': '[img1, img2]'}),
    'vstack': ('vstack(tup) -> arr', '세로로 이어 붙이기', {'tup': '[img1, img2]'}),
    'dstack': ('dstack(tup) -> arr', '채널 방향으로 쌓기', {}),
    'column_stack': ('column_stack(tup) -> arr', '열로 쌓기', {}),
    'clip': ('clip(a, a_min, a_max) -> arr', '범위 자르기', {'a_min': '0', 'a_max': '255'}),
    'abs': ('abs(x) -> arr', '절댓값', {}),
    'absolute': ('absolute(x) -> arr', '절댓값', {}),
    'round': ('round(a[, decimals]) -> arr', '반올림', {}),
    'around': ('around(a[, decimals]) -> arr', '반올림', {}),
    'sqrt': ('sqrt(x) -> arr', '제곱근', {}),
    'sin': ('sin(x) -> arr', '사인', {}),
    'cos': ('cos(x) -> arr', '코사인', {}),
    'arctan2': ('arctan2(y, x) -> arr', '각도 (arctan2)', {}),
    'degrees': ('degrees(x) -> arr', '라디안 → 도', {}),
    'mean': ('mean(a[, axis]) -> value', '평균', {}),
    'median': ('median(a[, axis]) -> value', '중앙값', {}),
    'std': ('std(a[, axis]) -> value', '표준편차', {}),
    'argmax': ('argmax(a[, axis]) -> index', '최댓값 위치', {}),
    'argmin': ('argmin(a[, axis]) -> index', '최솟값 위치', {}),
    'where': ('where(condition[, x[, y]]) -> result', '조건으로 고르기', {}),
    'nonzero': ('nonzero(a) -> indices', '0 아닌 위치', {}),
    'count_nonzero': ('count_nonzero(a) -> count', '0 아닌 원소 수', {}),
    'unique': ('unique(ar) -> values', '고유값', {}),
    'bincount': ('bincount(x[, minlength]) -> counts', '정수 개수 세기', {}),
    'histogram': ('histogram(a[, bins[, range]]) -> hist, bin_edges', '히스토그램 (NumPy)', {'bins': '256', 'range': '[0, 256]'}),
    'cumsum': ('cumsum(a) -> arr', '누적 합', {}),
    'diff': ('diff(a) -> arr', '이웃 차이', {}),
    'arange': ('arange(start[, stop[, step]]) -> arr', '연속 숫자 배열', {'start': '0', 'stop': '10'}),
    'linspace': ('linspace(start, stop[, num]) -> arr', '균등 간격 배열', {'start': '0', 'stop': '1', 'num': '50'}),
    'meshgrid': ('meshgrid(x, y) -> X, Y', '좌표 격자', {}),
    'repeat': ('repeat(a, repeats[, axis]) -> arr', '반복', {}),
    'tile': ('tile(A, reps) -> arr', '타일처럼 반복', {}),
    'array_equal': ('array_equal(a1, a2) -> same', '배열이 같은지', {}),
    'allclose': ('allclose(a, b) -> close', '거의 같은지', {}),
    'nan_to_num': ('nan_to_num(x) -> arr', 'NaN 을 숫자로', {}),
    'set_printoptions': ('set_printoptions([, precision[, suppress]]) -> None', '출력 형식 설정', {}),
    'iinfo': ('iinfo(type) -> info', '정수형 범위 정보', {'type': 'np.uint8'}),
    'errstate': ('errstate([, divide[, invalid]]) -> ctx', '오류 처리 설정', {}),
    'random.default_rng': ('default_rng([, seed]) -> rng', '난수 생성기', {'seed': '0'}),
    'ma.masked_equal': ('masked_equal(x, value) -> masked', '값 가리기 (마스크 배열)', {}),
    'ma.filled': ('filled(a[, fill_value]) -> arr', '마스크 채우기', {}),
}
for k, (sig, title, defs) in NP.items():
    m('np.' + k, title, 'numpy', sig=sig, defs=defs, opts={'dtype': DTYPE})

PLT = {
    'figure': ('figure([, figsize]) -> fig', '새 그림', {'figsize': '(10, 4)'}),
    'subplot': ('subplot(pos) -> ax', '칸 나누기 (subplot)', {'pos': '121'}),
    'subplots': ('subplots([, nrows[, ncols[, figsize]]]) -> fig, axes', '여러 칸 만들기', {'nrows': '1', 'ncols': '2'}),
    'imshow': ('imshow(X[, cmap]) -> image', '그림에 이미지 표시', {'cmap': "'gray'"}),
    'title': ('title(label) -> text', '제목', {'label': "'Image'"}),
    'axis': ('axis(arg) -> limits', '축 설정', {'arg': "'off'"}),
    'xticks': ('xticks(ticks) -> locs', 'x 눈금', {'ticks': '[]'}),
    'yticks': ('yticks(ticks) -> locs', 'y 눈금', {'ticks': '[]'}),
    'plot': ('plot(x[, y[, fmt]]) -> lines', '선 그래프', {}),
    'hist': ('hist(x[, bins[, range]]) -> n, bins, patches', '히스토그램 그래프', {'bins': '256', 'range': '[0, 256]'}),
    'xlim': ('xlim(left[, right]) -> lim', 'x 범위', {'left': '0', 'right': '256'}),
    'ylim': ('ylim(bottom[, top]) -> lim', 'y 범위', {}),
    'xlabel': ('xlabel(label) -> text', 'x 축 이름', {}),
    'ylabel': ('ylabel(label) -> text', 'y 축 이름', {}),
    'legend': ('legend() -> legend', '범례', {}),
    'axvline': ('axvline(x[, color]) -> line', '세로 기준선', {}),
    'axhline': ('axhline(y[, color]) -> line', '가로 기준선', {}),
    'tight_layout': ('tight_layout() -> None', '간격 자동 정리', {}),
    'show': ('show() -> None', '그래프 표시', {}),
}
for k, (sig, title, defs) in PLT.items():
    m('plt.' + k, title, 'plot', sig=sig, defs=defs, opts={'cmap': ["'gray'", "'hsv'", "'jet'", 'None']})

# ---- Python 코드 템플릿 (code 노드)
TEMPLATES = [
    dict(key='frame', type='frame', title='입력 소스 (웹캠 · 동영상 · 이미지)', cat='flow', outs=['frame'],
         doc='실시간 처리의 시작점입니다. 오른쪽 "입력 소스"에서 고른 영상의 매 프레임이 frame 으로 나옵니다. (def process(frame):)'),
    dict(key='return', type='return', title='결과 출력 (return)', cat='flow', expr='frame',
         doc='process(frame) 의 결과 이미지입니다. result 창과 프리뷰에 표시됩니다.'),
    dict(key='code:python', type='code', title='Python 코드', cat='code', code='# 자유롭게 Python 코드를 작성하세요\nresult = img.copy()', outs=['result'],
         doc='블록으로 만들기 어려운 코드(반복문, 조건문, 함수 정의 등)를 직접 작성합니다. 다른 노드의 변수 이름을 코드에서 쓰면 자동으로 연결됩니다.'),
    dict(key='code:value', type='code', title='변수 값', cat='code', code='value = 100', outs=['value'], doc='숫자 · 튜플 · 문자열 같은 값을 변수로 만듭니다.'),
    dict(key='code:copy', type='code', title='이미지 복사', cat='code', code='out = img.copy()', outs=['out'], doc='원본을 보존하고 그 위에 그릴 때 사용합니다.'),
    dict(key='code:roi', type='code', title='ROI 자르기', cat='code', code='roi = img[100:200, 150:300]', outs=['roi'], doc='img[y1:y2, x1:x2] 로 관심 영역을 잘라냅니다.'),
    dict(key='code:shape', type='code', title='크기 읽기 (shape)', cat='code', code='h, w = img.shape[:2]', outs=['h', 'w'], doc='이미지의 높이와 너비를 읽습니다.'),
    dict(key='code:channel', type='code', title='채널 값 바꾸기', cat='code', code='img[:, :, 2] = 0', outs=['img'], doc='NumPy 인덱싱으로 채널 값을 바꿉니다 (제자리 수정).'),
    dict(key='code:for', type='code', title='컨투어 반복 처리', cat='code',
         code="for cnt in contours:\n    x, y, w, h = cv.boundingRect(cnt)\n    cv.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)", outs=['img'],
         doc='for 문으로 여러 컨투어를 하나씩 처리합니다.'),
    dict(key='code:def', type='code', title='함수 정의 (콜백 등)', cat='code', code='def nothing(x):\n    pass', outs=['nothing'], doc='트랙바 · 마우스 콜백 같은 함수를 정의합니다.'),
    dict(key='code:global', type='code', title='전역 변수 선언 (global)', cat='code', code='global prev', outs=[], scope='process',
         doc='process 안에서 프레임 사이에 값을 유지할 변수를 선언합니다.'),
    dict(key='code:read', type='code', title='동영상 프레임 읽기', cat='flow', code='ret, frame = cap.read()', outs=['ret', 'frame'], doc='cap.read() 로 현재 프레임 한 장을 읽습니다.'),
]


def parse_sig(doc):
    first = doc.strip().splitlines()[0]
    mm = re.match(r'\s*[\w.]+\((.*)\)\s*->\s*(.*)$', first)
    if not mm:
        return None
    params, ret = mm.group(1), mm.group(2).strip()
    req, opt = [], []
    depth = 0
    token = ''
    for ch in params:
        if ch == '[':
            if token.strip():
                (opt if depth else req).append(token.strip(' ,'))
            token = ''
            depth += 1
        elif ch == ']':
            if token.strip():
                opt.append(token.strip(' ,'))
            token = ''
            depth -= 1
        elif ch == ',':
            if token.strip():
                (opt if depth else req).append(token.strip(' ,'))
            token = ''
        else:
            token += ch
    if token.strip():
        (opt if depth else req).append(token.strip(' ,'))
    outs = [] if ret in ('None', '') else [r.strip() for r in ret.split(',')]
    req = [a for a in req if a]
    opt = [a for a in opt if a and a not in outs]
    return req, opt, outs


def usage_defaults():
    """강좌 예제에서 인자별로 가장 많이 쓰인 리터럴 값"""
    out = subprocess.run(['node', os.path.join(ROOT, 'tools', 'dump_lessons.js')], capture_output=True, text=True, encoding='utf-8').stdout
    snippets = json.loads(out)['snippets']
    stats = collections.defaultdict(collections.Counter)

    def dotted(n):
        parts = []
        while isinstance(n, ast.Attribute):
            parts.append(n.attr)
            n = n.value
        if isinstance(n, ast.Name):
            parts.append(n.id)
            return '.'.join(reversed(parts))
        return None

    def literal(n):
        for sub in ast.walk(n):
            if isinstance(sub, ast.Name) and sub.id not in ('cv', 'np', 'True', 'False', 'None'):
                return False
            if isinstance(sub, ast.Call):
                return False
        return True

    for sn in snippets:
        try:
            tree = ast.parse(sn['code'])
        except SyntaxError:
            continue
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                f = dotted(node.func)
                if not f:
                    continue
                f = re.sub(r'^cv2\.', 'cv.', f)
                for i, a in enumerate(node.args):
                    if literal(a):
                        stats[(f, i)][ast.unparse(a)] += 1
                for k in node.keywords:
                    if k.arg and literal(k.value):
                        stats[(f, k.arg)][ast.unparse(k.value)] += 1
    return stats


def main():
    stats = usage_defaults()
    blocks = []
    missing = []
    for key, meta in C.items():
        if 'sig' in meta:
            sig = parse_sig(meta['sig'])
        else:
            obj = cv2
            for part in key.split('.')[1:]:
                obj = getattr(obj, part, None)
            doc = getattr(obj, '__doc__', None) if obj is not None else None
            sig = parse_sig(doc) if doc and '->' in doc.splitlines()[0] else None
        if not sig:
            missing.append(key)
            continue
        req, opt, outs = sig
        if 'outs' in meta:
            outs = meta['outs']
        outs = ['cap' if o == 'retval' and key == 'cv.VideoCapture' else o for o in outs]
        outs = [('result' if o == 'retval' else o) for o in outs]
        args = []
        allnames = req + opt
        for i, name in enumerate(allnames):
            required = i < len(req)
            d = meta.get('defs', {}).get(name)
            if d is None:
                pos = stats.get((key, i)) if required else None
                kw = stats.get((key, name))
                cnt = (pos or collections.Counter()) + (kw or collections.Counter())
                if cnt:
                    d = cnt.most_common(1)[0][0]
            arg = {'name': name, 'req': required, 'def': (d or '') if (required or (meta.get('defs', {}).get(name) is not None)) else ''}
            if not required and d is not None and not arg['def']:
                arg['hint'] = d
            if name in meta.get('opts', {}):
                arg['opts'] = meta['opts'][name]
            if meta.get('file') == name:
                arg['file'] = True
            args.append(arg)
        blocks.append({
            'key': key, 'type': 'call', 'fn': key, 'title': meta['title'], 'cat': meta['cat'],
            'args': args, 'outs': outs, 'sig': (meta.get('sig') or '').strip() or None,
            'perFrame': bool(meta.get('perFrame')), 'inplace': bool(meta.get('inplace')),
        })
    for b in blocks:
        if not b['sig']:
            obj = cv2
            for part in b['key'].split('.')[1:]:
                obj = getattr(obj, part, None)
            b['sig'] = ((getattr(obj, '__doc__', '') or '').strip().splitlines() or [''])[0]
    blocks.extend(TEMPLATES)
    data = {'categories': [{'id': a, 'title': b, 'desc': c} for a, b, c in CATEGORIES], 'blocks': blocks}
    out = os.path.join(ROOT, 'js', 'nodes', 'catalog.js')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as fp:
        fp.write('/* 자동 생성 파일 — python tools/build_catalog.py 로 다시 만드세요. */\n')
        fp.write('window.NODE_CATALOG = ')
        json.dump(data, fp, ensure_ascii=False, indent=1)
        fp.write(';\nif (typeof module !== "undefined") module.exports = window.NODE_CATALOG;\n')
    print(f'{len(blocks)}개 블록 → {out}')
    if missing:
        print('서명을 찾지 못한 함수:', missing)


if __name__ == '__main__':
    main()
