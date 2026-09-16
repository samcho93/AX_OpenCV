/* 4주차: 프로젝트 Ⅰ · 가이드 프로젝트와 기획 */
COURSE.addLessons([
  // =====================================================================
  // w4-1 프로젝트 오리엔테이션
  // =====================================================================
  {
    id: 'w4-1',
    summary: '지금까지 배운 기법을 “부품”으로 보고, 입력 → 전처리 → 분할/검출 → 분석 → 출력으로 이어지는 영상처리 파이프라인으로 조립하는 방법을 익힙니다. 2주 프로젝트의 일정·팀 구성·주제·평가 기준도 안내합니다.',
    goals: [
      '영상처리 파이프라인의 5단계를 말하고, 각 단계에 쓰이는 함수를 예로 들 수 있다',
      '각 단계의 중간 결과를 한 화면에 모아 보는 디버그 뷰(Debug View)를 만들 수 있다',
      '작은 예제(도형 개수 세기)를 함수 단위 파이프라인으로 나누어 작성할 수 있다',
      '2주 프로젝트 일정, 팀 구성 규칙, 평가 기준과 제출물을 이해한다',
    ],
    schedule: [['도입 · 프로젝트 소개', 5], ['파이프라인 개념', 10], ['예제: 도형 개수 세기', 15], ['일정 · 팀 · 주제 안내', 10], ['평가 기준 · 실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 이제부터는 “조립”의 시간</h3>
<p>1~3주차에 우리는 <b>부품</b>을 모았습니다. 색 공간 변환, 임계처리, 블러, 모폴로지, 엣지, 컨투어, 허프 변환… 하나하나는 작은 기능이지만, 이들을 <b>순서대로 연결</b>하면 “동전 개수 세기”, “문서 스캐너”, “웹캠 그림판” 같은 제법 쓸모 있는 프로그램이 됩니다.</p>
<p>4~5주차 2주 동안은 다음 순서로 진행합니다.</p>
<ul>
<li><b>4주차 (가이드 프로젝트 + 기획)</b>: 강사와 함께 4개의 가이드 프로젝트를 단계별로 만들고, 팀 프로젝트를 기획해 첫 프로토타입까지 만듭니다.</li>
<li><b>5주차 (구현 + 발표)</b>: 팀 프로젝트를 완성·튜닝하고 발표합니다.</li>
</ul>` },
      { type: 'text', html: `<h3>2. 영상처리 파이프라인(Pipeline) 5단계</h3>
<p>거의 모든 영상처리 프로그램은 아래 5단계로 나눠 생각할 수 있습니다. 문제를 받으면 “각 단계에서 무엇을 할까?”를 먼저 적어 보세요. 코드는 그다음입니다.</p>` },
      { type: 'table', head: ['단계', '하는 일', '대표 함수 (배운 것)', '결과물'], rows: [
        ['① 입력 (Input)', '이미지·웹캠 프레임 읽기, 크기 맞추기', '<code>cv.imread</code>, <code>process(frame)</code>, <code>cv.resize</code>', 'BGR 컬러 이미지'],
        ['② 전처리 (Preprocess)', '노이즈 줄이기, 색 공간 바꾸기, 밝기 보정', '<code>cvtColor</code>, <code>GaussianBlur</code>, <code>medianBlur</code>, <code>equalizeHist</code>', '흑백/HSV/부드러운 이미지'],
        ['③ 분할·검출 (Segment/Detect)', '관심 있는 부분만 흰색으로 골라내기', '<code>threshold</code>, <code>inRange</code>, <code>Canny</code>, 모폴로지, <code>HoughCircles</code>', '이진 마스크, 엣지, 원 목록'],
        ['④ 분석 (Analyze)', '개수·크기·모양·위치 계산', '<code>findContours</code>, <code>contourArea</code>, <code>moments</code>, <code>approxPolyDP</code>', '숫자, 좌표, 라벨'],
        ['⑤ 출력·시각화 (Output)', '결과를 그려서 보여주고 저장', '<code>drawContours</code>, <code>putText</code>, <code>imshow</code>, <code>imwrite</code>', '결과 이미지, 출력 값'],
      ] },
      { type: 'tip', html: `<p><b>디버그 뷰(Debug View) 습관</b>: 결과가 이상할 때 “어느 단계에서 잘못됐는지” 알려면 중간 결과를 눈으로 봐야 합니다. 이 과정의 모든 프로젝트에서는 <b>중간 단계 이미지를 한 장으로 이어 붙여 보는 디버그 뷰</b>를 항상 함께 만듭니다.</p>` },
      { type: 'text', html: `<h3>3. 미니 예제: pic1.png 의 도형 개수 세기</h3>
<p>흰 배경에 검은 도형이 여러 개 있는 <code>pic1.png</code>에서 도형이 몇 개인지 세어 봅시다. 파이프라인으로 적으면 다음과 같습니다.</p>
<ol>
<li><b>입력</b>: <code>cv.imread('pic1.png')</code></li>
<li><b>전처리</b>: 흑백 변환 → 가우시안 블러(작은 잡음 제거)</li>
<li><b>분할</b>: Otsu 이진화. 도형이 <b>검은색</b>이므로 <code>THRESH_BINARY_INV</code> 로 뒤집어 도형을 흰색으로</li>
<li><b>분석</b>: 바깥 컨투어 찾기 → 너무 작은 조각은 면적으로 걸러내기 → 개수 세기</li>
<li><b>출력</b>: 도형마다 외곽선과 번호를 그리고 개수를 출력</li>
</ol>
<p>한 번에 다 짜지 말고 <b>단계마다 실행해서 눈으로 확인</b>하며 진행합니다.</p>` },
      { type: 'code', title: '예제 1 · 1~3단계: 입력 → 전처리 → 이진화 확인', code: String.raw`
import cv2 as cv
import numpy as np

# ① 입력
img = cv.imread('pic1.png')
print('입력 크기:', img.shape)

# ② 전처리: 흑백 + 블러
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)

# ③ 분할: Otsu 이진화 (검은 도형 → 흰색이 되도록 INV)
t, binary = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
print('Otsu 가 고른 임계값:', t)

# 단계마다 눈으로 확인!
cv.imshow('1 input', img)
cv.imshow('2 gray+blur', blur)
cv.imshow('3 binary', binary)
`, desc: '<p>이진 이미지에서 <b>도형이 흰색, 배경이 검은색</b>인지 꼭 확인하세요. <code>findContours</code> 는 흰색 영역을 물체로 봅니다.</p>' },
      { type: 'code', title: '예제 2 · 4~5단계: 컨투어 분석과 결과 그리기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
t, binary = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

# ④ 분석: 바깥 컨투어만 찾기
contours, hierarchy = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
print('찾은 컨투어 수(필터 전):', len(contours))

MIN_AREA = 300            # 이보다 작은 조각은 무시 (물음표의 점 같은 작은 조각)
objects = [c for c in contours if cv.contourArea(c) >= MIN_AREA]
print('면적 필터 후 도형 수:', len(objects))

# ⑤ 출력: 외곽선 + 번호
result = img.copy()
for i, c in enumerate(objects):
    cv.drawContours(result, [c], -1, (0, 0, 255), 2)
    M = cv.moments(c)
    cx, cy = int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])   # 무게중심
    cv.putText(result, str(i + 1), (cx - 8, cy + 8), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 0), 2)
    print('도형', i + 1, '면적 =', cv.contourArea(c))

cv.putText(result, 'count: %d' % len(objects), (10, 290), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
cv.imshow('result', result)
`, desc: '<p>필터 전에는 물음표의 점처럼 작은 조각까지 세어집니다. <b>면적 필터</b>는 거의 모든 프로젝트에서 쓰는 기본 도구입니다.</p>' },
      { type: 'code', title: '예제 3 · 디버그 뷰: 모든 단계를 한 장으로', code: String.raw`
import cv2 as cv
import numpy as np

def to_bgr(im):
    """흑백(2차원) 이미지를 3채널로 바꿔서 컬러 이미지와 이어 붙일 수 있게 한다."""
    if im.ndim == 2:
        return cv.cvtColor(im, cv.COLOR_GRAY2BGR)
    return im

def debug_view(images, labels, tile_w=260):
    """여러 단계 이미지를 같은 크기·같은 채널로 맞춘 뒤 가로로 이어 붙인다."""
    h0, w0 = images[0].shape[:2]
    tile_h = int(h0 * tile_w / w0)
    tiles = []
    for im, label in zip(images, labels):
        t = cv.resize(to_bgr(im), (tile_w, tile_h))
        cv.putText(t, label, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
        tiles.append(t)
    return np.hstack(tiles)

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
t, binary = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
contours, _ = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
objects = [c for c in contours if cv.contourArea(c) >= 300]

result = img.copy()
cv.drawContours(result, objects, -1, (0, 0, 255), 2)
cv.putText(result, 'count: %d' % len(objects), (10, 290), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

view = debug_view([img, blur, binary, result], ['input', 'gray+blur', 'binary', 'result'])
print('디버그 뷰 크기:', view.shape)
cv.imshow('debug view', view)
`, desc: '<p><code>np.hstack</code> 은 <b>높이와 채널 수가 같아야</b> 이어 붙일 수 있습니다. 그래서 흑백은 <code>to_bgr()</code> 로 3채널로, 크기는 <code>cv.resize</code> 로 맞춥니다.</p>' },
      { type: 'code', title: '예제 4 · 함수로 나눈 파이프라인 + process(frame)', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'controls'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('min area', WIN, 300, 5000, nothing)
cv.createTrackbar('invert', WIN, 1, 1, nothing)     # 1: 검은 물체 / 0: 밝은 물체

def to_bgr(im):
    return cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im

def preprocess(img):                       # ② 전처리
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return cv.GaussianBlur(gray, (5, 5), 0)

def segment(gray, invert):                 # ③ 분할
    mode = cv.THRESH_BINARY_INV if invert else cv.THRESH_BINARY
    _, binary = cv.threshold(gray, 0, 255, mode + cv.THRESH_OTSU)
    return binary

def analyze(binary, min_area):             # ④ 분석
    contours, _ = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [c for c in contours if cv.contourArea(c) >= min_area]

def visualize(img, objects):               # ⑤ 출력
    out = img.copy()
    for i, c in enumerate(objects):
        x, y, w, h = cv.boundingRect(c)
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(out, str(i + 1), (x, y - 5), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv.putText(out, 'count: %d' % len(objects), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
    return out

def process(frame):                        # ① 입력: 패널에서 고른 이미지 또는 웹캠 프레임
    min_area = cv.getTrackbarPos('min area', WIN)
    invert = cv.getTrackbarPos('invert', WIN)
    gray = preprocess(frame)
    binary = segment(gray, invert)
    objects = analyze(binary, min_area)
    result = visualize(frame, objects)
    debug = np.hstack([to_bgr(gray), to_bgr(binary)])
    return result, debug                    # 여러 장 반환 → result 1, result 2 창

# 이미지로 한 번 확인
img = cv.imread('pic1.png')
res, dbg = process(img)
cv.imshow('pic1 result', res)
`, desc: '<p>오른쪽 패널 입력을 <code>pic1.png</code>, <code>blox.jpg</code>, <code>detect_blob.png</code> 등으로 바꾸고 트랙바를 움직여 보세요. 배경이 검은 이미지는 <b>invert = 0</b> 이어야 합니다. 📷 웹캠이나 🎞️ 동영상으로 바꾸면 매 프레임 실행됩니다.</p>' },
      { type: 'text', html: `<h3>4. 2주 프로젝트 일정</h3>
<p>매 교시가 끝날 때 <b>그날의 산출물</b>이 하나씩 나오도록 계획되어 있습니다. 밀리면 다음 교시가 힘들어지니 산출물을 기준으로 진도를 확인하세요.</p>` },
      { type: 'table', head: ['교시', '내용', '팀 산출물'], rows: [
        ['w4-1', '프로젝트 오리엔테이션 (지금)', '팀 구성, 관심 주제 3개 후보'],
        ['w4-2 · w4-3', '가이드 ① 문서 스캐너', '사각형 검출 → 원근 변환 → 스캔 결과 이미지'],
        ['w4-4', '가이드 ② 동전·도형 분석기', '개수 세기·도형 분류 결과'],
        ['w4-5', '가이드 ③ 웹캠 가상 페인터', '실시간 색 추적 그림판'],
        ['w4-6', '가이드 ④ 사진 필터 앱', '필터 선택 앱 + 저장 이미지'],
        ['w4-7', '팀 프로젝트 기획', '주제 확정, 요구사항, <b>파이프라인 설계서</b>'],
        ['w4-8', '프로토타입 만들기', '끝까지 한 번 도는 <b>최소 버전(MVP)</b>, 중간 점검'],
        ['w5-1 ~ w5-2', '구현 ①② 모듈화 · 핵심 알고리즘', '함수 분리된 코드, 디버그 뷰'],
        ['w5-3 ~ w5-4', '구현 ③④ 실시간 · 인터랙션 · 튜닝', 'process(frame) 버전, 트랙바/마우스'],
        ['w5-5', '테스트 · 디버깅 · 코드 리뷰', '테스트 결과표, 수정된 코드'],
        ['w5-6', '결과 정리와 발표 준비', '전후 비교 이미지, 발표자료'],
        ['w5-7', '프로젝트 발표회', '발표, 동료 평가'],
        ['w5-8', '회고와 다음 단계', '회고 기록'],
      ] },
      { type: 'text', html: `<h3>5. 팀 구성 규칙</h3>
<ul>
<li>팀은 <b>2~3명</b>으로 구성합니다. (인원 사정에 따라 강사와 상의해 1인 또는 4인 가능)</li>
<li>모든 팀원은 <b>코드의 한 부분 이상을 직접 작성</b>하고, 발표에서 한 부분 이상을 맡습니다.</li>
<li>역할 예시: <b>파이프라인 담당</b>(전처리·검출), <b>분석·시각화 담당</b>(개수·라벨·디버그 뷰), <b>테스트·자료 담당</b>(입력 이미지 수집, 실패 사례 기록, 발표자료). 역할은 겹쳐도 됩니다.</li>
<li>코드는 한 사람이 “정본”을 관리하고, 수정할 때마다 <code>v1</code>, <code>v2</code> 처럼 버전을 남깁니다.</li>
</ul>
<h3>6. 프로젝트 주제 아이디어</h3>
<p>아래 목록에서 고르거나 변형해도 되고, 새로운 주제도 환영합니다. 난이도(★)는 2주 기준입니다.</p>` },
      { type: 'table', head: ['주제', '난이도', '필요 기법', '입력'], rows: [
        ['색깔별 캔디/스티커 개수 세기', '★', 'HSV, inRange, 모폴로지, 컨투어', 'smarties.png, 직접 촬영'],
        ['책상 위 물건 개수·크기 측정', '★★', 'Canny, 모폴로지 닫기, 컨투어, boundingRect', 'stuff.jpg, 웹캠'],
        ['문서 스캐너 확장 (수동 보정, 여러 장)', '★★', 'Canny, approxPolyDP, 원근 변환, 적응형 임계', 'sudoku.png, 웹캠'],
        ['동전 개수·금액 계산기', '★★', 'Otsu, 거리 변환, HoughCircles, 면적 비교', 'water_coins.jpg, 직접 촬영'],
        ['사진 필터 부스 (필터 + 스티커 합성)', '★★', '블러·임계 필터, 비트 연산, 마우스', 'lena.jpg, 웹캠'],
        ['악보 오선 제거 / 음표 개수 세기', '★★', '적응형 임계, 모폴로지(가로·세로 커널)', 'notes.png'],
        ['숨은 그림(아이콘) 찾기', '★★', 'matchTemplate, 다중 검출, 그리기', 'messi5.jpg, 직접 만든 이미지'],
        ['웹캠 색 마커 게임 (풍선 터뜨리기)', '★★★', 'HSV 추적, 모멘트, 그리기, process(frame)', '웹캠'],
        ['스도쿠 격자 추출 · 칸 나누기', '★★★', '적응형 임계, 원근 변환, 모폴로지, 컨투어', 'sudoku.png'],
        ['직선(차선·책상 모서리) 검출기', '★★★', 'Canny, ROI 마스크, HoughLinesP', 'building.jpg, 웹캠'],
        ['움직이는 컵 추적 · 궤적 그리기', '★★', 'HSV(어두운 색) inRange, 모폴로지, 모멘트, process(frame)', '🎞️ cup.mp4, 웹캠'],
        ['보행자(움직임) 감지 · 개수 표시', '★★★', '이전 프레임과의 차이(cv.absdiff), 임계처리, 팽창, 컨투어, global 변수', '🎞️ vtest.avi'],
      ] },
      { type: 'text', html: `<h3>7. 평가 기준과 제출물</h3>
<p>평가는 “얼마나 어려운 것을 했나”보다 <b>“정한 목표를 얼마나 완성도 있게 해냈나”</b>를 봅니다. 작은 주제라도 끝까지 잘 동작하고, 실패 사례까지 분석하면 높은 점수를 받습니다.</p>` },
      { type: 'table', head: ['평가 항목', '배점', '기준'], rows: [
        ['기능 완성도', '30', '설계서의 필수 기능이 동작하는가, 여러 입력(3장 이상)에서 결과가 나오는가'],
        ['기술 활용', '20', '배운 기법을 목적에 맞게 조합했는가, 파라미터를 근거 있게 골랐는가'],
        ['코드 품질', '15', '단계별 함수 분리, 설정값(CONFIG) 정리, 한국어 주석, 디버그 뷰'],
        ['실시간 / 인터랙션', '15', 'process(frame) 동작, 트랙바·마우스로 조절 가능, 속도'],
        ['발표', '20', '문제·파이프라인·데모·실패와 개선을 명확히 전달, 시간 준수'],
      ] },
      { type: 'checklist', title: '최종 제출물', items: [
        '코드: 강좌 편집기에서 실행되는 최종 코드 (.py 로 저장해 제출)',
        '설계서: 주제, 요구사항, 파이프라인 단계별 설명 (w4-7 템플릿)',
        '결과 이미지: 입력/결과 전후 비교 3장 이상 (cv.imwrite 로 저장)',
        '디버그 뷰 이미지 1장 이상 (중간 단계가 보이게)',
        '발표자료: 5~7분 분량 (문제 → 파이프라인 → 데모 → 실패와 개선 → 소감)',
      ] },
      { type: 'warn', html: `<p><b>흔한 실수</b></p>
<ul>
<li>주제가 너무 큼 (“얼굴 인식”, “자율주행”) → 배운 기법으로 2주 안에 끝낼 수 있는 크기로 줄이기</li>
<li>입력 이미지를 늦게 구함 → 첫날부터 테스트용 이미지 3장 이상 확보</li>
<li><code>cv.putText</code> 에 한글 사용 → 글자가 <b>???</b> 로 깨집니다. 이미지 위 글자는 영어로!</li>
</ul>` },
    ],
    practice: [
      {
        title: '실습 1 · 디버그 뷰에 단계 추가하기',
        desc: `<p>예제 3의 디버그 뷰에 <b>모폴로지 열기(Opening)</b> 단계를 추가하세요. 이진 이미지에 5×5 커널로 열기를 적용한 <code>opened</code> 를 만들고, 컨투어는 <code>opened</code> 에서 찾습니다. 디버그 뷰는 input / binary / opened / result 네 칸이 되어야 합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def to_bgr(im):
    return cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im

def debug_view(images, labels, tile_w=220):
    h0, w0 = images[0].shape[:2]
    tile_h = int(h0 * tile_w / w0)
    tiles = []
    for im, label in zip(images, labels):
        t = cv.resize(to_bgr(im), (tile_w, tile_h))
        cv.putText(t, label, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
        tiles.append(t)
    return np.hstack(tiles)

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
t, binary = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

# TODO: 5x5 커널을 만들고 모폴로지 열기(MORPH_OPEN)를 적용하세요
opened = binary.copy()

# TODO: 컨투어를 opened 에서 찾도록 바꾸세요
contours, _ = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
objects = [c for c in contours if cv.contourArea(c) >= 300]

result = img.copy()
cv.drawContours(result, objects, -1, (0, 0, 255), 2)
print('도형 수:', len(objects))

# TODO: opened 도 디버그 뷰에 넣으세요 (라벨 'opened')
view = debug_view([img, binary, result], ['input', 'binary', 'result'])
cv.imshow('debug view', view)
`,
        hint: `<p><code>kernel = np.ones((5, 5), np.uint8)</code>, <code>cv.morphologyEx(binary, cv.MORPH_OPEN, kernel)</code>. 리스트에 이미지와 라벨을 같은 순서로 추가하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def to_bgr(im):
    return cv.cvtColor(im, cv.COLOR_GRAY2BGR) if im.ndim == 2 else im

def debug_view(images, labels, tile_w=220):
    h0, w0 = images[0].shape[:2]
    tile_h = int(h0 * tile_w / w0)
    tiles = []
    for im, label in zip(images, labels):
        t = cv.resize(to_bgr(im), (tile_w, tile_h))
        cv.putText(t, label, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
        tiles.append(t)
    return np.hstack(tiles)

img = cv.imread('pic1.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
t, binary = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

kernel = np.ones((5, 5), np.uint8)
opened = cv.morphologyEx(binary, cv.MORPH_OPEN, kernel)

contours, _ = cv.findContours(opened, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
objects = [c for c in contours if cv.contourArea(c) >= 300]

result = img.copy()
cv.drawContours(result, objects, -1, (0, 0, 255), 2)
print('도형 수:', len(objects))

view = debug_view([img, binary, opened, result], ['input', 'binary', 'opened', 'result'])
cv.imshow('debug view', view)
`,
      },
      {
        title: '실습 2 · 배경이 검은 이미지에도 동작하게 만들기',
        desc: `<p><code>detect_blob.png</code> 는 <b>검은 배경</b>에 밝은 도형이 있습니다. 지금 코드는 항상 <code>THRESH_BINARY_INV</code> 를 써서 배경이 흰색이 되어 버립니다. 이진화 결과에서 <b>흰 픽셀이 절반보다 많으면 배경이 흰색으로 잡힌 것</b>이므로 뒤집도록(<code>cv.bitwise_not</code>) 자동 판단 코드를 넣으세요. <code>pic1.png</code> 와 <code>detect_blob.png</code> 모두에서 개수가 그럴듯하게 나와야 합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def count_objects(filename, min_area=300):
    img = cv.imread(filename)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

    white_ratio = np.count_nonzero(binary) / binary.size
    print(filename, '흰 픽셀 비율: %.2f' % white_ratio)
    # TODO: white_ratio 가 0.5 보다 크면 binary 를 bitwise_not 으로 뒤집으세요

    contours, _ = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = [c for c in contours if cv.contourArea(c) >= min_area]
    result = img.copy()
    cv.drawContours(result, objects, -1, (0, 0, 255), 3)
    cv.imshow(filename + ' binary', binary)
    cv.imshow(filename + ' result', result)
    return len(objects)

for name in ['pic1.png', 'detect_blob.png']:
    print(name, '→ 물체 수:', count_objects(name))
`,
        hint: `<p><code>if white_ratio &gt; 0.5: binary = cv.bitwise_not(binary)</code>. 물체보다 배경이 더 넓다는 가정입니다. (이 가정이 틀리는 이미지도 생각해 보세요!)</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def count_objects(filename, min_area=300):
    img = cv.imread(filename)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv.threshold(blur, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

    white_ratio = np.count_nonzero(binary) / binary.size
    print(filename, '흰 픽셀 비율: %.2f' % white_ratio)
    if white_ratio > 0.5:              # 배경이 흰색으로 잡혔다 → 뒤집기
        binary = cv.bitwise_not(binary)

    contours, _ = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = [c for c in contours if cv.contourArea(c) >= min_area]
    result = img.copy()
    cv.drawContours(result, objects, -1, (0, 0, 255), 3)
    cv.imshow(filename + ' binary', binary)
    cv.imshow(filename + ' result', result)
    return len(objects)

for name in ['pic1.png', 'detect_blob.png']:
    print(name, '→ 물체 수:', count_objects(name))
`,
      },
    ],
    quiz: [
      { q: '영상처리 파이프라인의 일반적인 순서로 알맞은 것은?', options: ['입력 → 전처리 → 분할/검출 → 분석 → 출력', '입력 → 분석 → 전처리 → 분할 → 출력', '전처리 → 입력 → 출력 → 분할 → 분석', '입력 → 출력 → 전처리 → 분석 → 분할'], answer: 0, explain: '이미지를 읽고(입력), 다루기 쉽게 다듬고(전처리), 관심 영역을 골라낸 뒤(분할/검출), 수치를 계산하고(분석), 결과를 그립니다(출력).' },
      { q: '흑백 이진 이미지와 컬러 결과 이미지를 np.hstack 으로 이어 붙이려 할 때 먼저 해야 할 일은?', options: ['둘 다 float 로 바꾼다', '컬러 이미지를 HSV 로 바꾼다', '흑백 이미지를 3채널로 바꾸고 높이를 같게 맞춘다', '아무것도 하지 않아도 된다'], answer: 2, explain: 'hstack 은 높이와 채널 수가 같아야 합니다. cv.cvtColor(gray, cv.COLOR_GRAY2BGR) 와 cv.resize 로 맞춥니다.' },
      { q: '컨투어를 찾은 뒤 contourArea 로 작은 컨투어를 걸러내는 주된 이유는?', options: ['실행 속도를 높이려고', 'findContours 가 큰 컨투어를 못 찾아서', '컨투어 색을 바꾸려고', '잡음이나 작은 조각이 물체로 세어지는 것을 막으려고'], answer: 3, explain: '이진화 결과에는 작은 점 잡음이나 물체의 일부 조각이 섞입니다. 면적 기준으로 걸러야 개수가 정확해집니다.' },
      { q: '2주 팀 프로젝트 주제로 가장 적절한 것은?', options: ['사람 얼굴을 보고 이름을 맞히는 프로그램', '사진 속 색깔별 캔디 개수를 세고 결과를 표시하는 프로그램', '자율주행 자동차의 모든 장애물 인식', '모든 종류의 물체를 구분하는 인공지능'], answer: 1, explain: '배운 기법(HSV, inRange, 컨투어)으로 2주 안에 완성할 수 있고, “개수가 맞는가”로 완성 여부를 측정할 수 있습니다.' },
    ],
  },

  // =====================================================================
  // w4-2 가이드 프로젝트 ① 문서 스캐너 (1)
  // =====================================================================
  {
    id: 'w4-2',
    summary: '비스듬히 찍힌 문서를 반듯하게 펴 주는 “문서 스캐너”의 앞부분을 만듭니다. 이번 교시에는 전처리 → Canny 엣지 → 팽창 → 컨투어 → 사각형 근사로 이미지 속 가장 큰 사각형(문서)을 찾아냅니다.',
    goals: [
      '흑백 변환·블러·Canny·팽창으로 문서 외곽선이 잘 드러나는 엣지 이미지를 만들 수 있다',
      '컨투어를 면적순으로 정렬하고 approxPolyDP 로 꼭짓점이 4개인 컨투어를 고를 수 있다',
      'RETR_EXTERNAL 과 RETR_LIST 의 차이를 이해하고 입력에 맞게 선택할 수 있다',
      'process(frame) 으로 실시간 사각형 검출과 “찾지 못함” 처리를 구현할 수 있다',
    ],
    schedule: [['도입 · 완성 모습', 5], ['STEP 1~2 엣지와 팽창', 10], ['STEP 3~4 사각형 찾기', 15], ['STEP 5~6 카드 · 웹캠', 10], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개: 문서 스캐너</h3>
<p>스마트폰 스캔 앱은 비스듬히 찍은 종이를 정면에서 본 것처럼 반듯하게 펴 줍니다. 원리는 생각보다 간단합니다.</p>
<ol>
<li>이미지에서 <b>문서의 네 꼭짓점</b>을 찾는다 ← <b>이번 교시 (w4-2)</b></li>
<li>네 꼭짓점을 직사각형으로 옮기는 <b>원근 변환</b>을 한다 ← 다음 교시 (w4-3)</li>
<li>적응형 임계처리로 <b>스캔한 것 같은 흑백 효과</b>를 준다 ← 다음 교시 (w4-3)</li>
</ol>
<p>이번 교시의 파이프라인: <b>입력 → 흑백 → 가우시안 블러 → Canny 엣지 → 팽창(dilate) → 컨투어 → 면적순 정렬 → 꼭짓점 4개 근사 → 사각형 그리기</b></p>
<p>실습 이미지는 <code>sudoku.png</code>(신문 속 스도쿠 칸의 바깥 테두리 = 문서라고 가정)와 <code>cards.png</code>(흩어진 카드 중 온전히 보이는 카드)입니다.</p>` },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        'sudoku.png 에서 스도쿠 바깥 테두리에 초록 사각형이 정확히 그려진다',
        'cards.png 에서 다른 카드에 가려지지 않은 카드 하나에 사각형이 그려진다',
        '네 꼭짓점 좌표가 print 로 출력된다',
        '웹캠(또는 다른 이미지)에서 사각형이 없으면 NOT FOUND 가 표시되고 오류가 나지 않는다',
      ] },
      { type: 'text', html: `<h3>STEP 1. 전처리와 Canny 엣지</h3>
<p>문서의 <b>외곽선</b>을 찾으려면 먼저 “밝기가 급하게 변하는 곳”인 엣지를 구합니다.</p>
<ul>
<li><b>흑백 변환</b>: Canny 는 한 채널 이미지에서 동작합니다.</li>
<li><b>가우시안 블러 (5×5)</b>: 종이 질감, 글자 잡티 같은 작은 엣지를 줄입니다. 블러 없이 Canny 를 하면 자잘한 엣지가 너무 많아집니다.</li>
<li><b>Canny(50, 150)</b>: 낮은/높은 임계값. 엣지가 너무 적으면 두 값을 낮추고, 너무 많으면 높입니다.</li>
</ul>` },
      { type: 'code', title: 'STEP 1 · 흑백 → 블러 → Canny 디버그 뷰', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
edges_noblur = cv.Canny(gray, 50, 150)
edges = cv.Canny(blur, 50, 150)

print('엣지 픽셀 수 (블러 없음):', np.count_nonzero(edges_noblur))
print('엣지 픽셀 수 (블러 후)  :', np.count_nonzero(edges))

# 디버그 뷰: 흑백 3장을 가로로 (크기·채널이 같으니 바로 hstack 가능)
view = np.hstack([blur, edges_noblur, edges])
view = cv.resize(view, None, fx=0.5, fy=0.5)
cv.imshow('blur | canny(no blur) | canny(blur)', view)
`, desc: '<p>블러를 하면 엣지 픽셀 수가 줄어듭니다. 지금 필요한 건 글자 하나하나가 아니라 <b>큰 외곽선</b>이므로 블러가 도움이 됩니다.</p>' },
      { type: 'text', html: `<h3>STEP 2. 팽창(dilate)으로 끊어진 선 잇기</h3>
<p>Canny 엣지는 <b>1픽셀 두께</b>라서 중간중간 끊어지기 쉽습니다. 외곽선이 한 군데라도 끊어지면 컨투어가 여러 조각으로 나뉘어 “닫힌 사각형”을 찾을 수 없습니다. 3×3 커널로 한 번 <b>팽창</b>하면 선이 두꺼워지면서 작은 틈이 메워집니다.</p>` },
      { type: 'code', title: 'STEP 2 · 팽창 전후 비교', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
edges = cv.Canny(blur, 50, 150)

kernel = np.ones((3, 3), np.uint8)
dilated = cv.dilate(edges, kernel, iterations=1)

# 바깥 컨투어 개수로 비교: 조각이 이어지면 개수가 줄어든다
c1, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
c2, _ = cv.findContours(dilated, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
print('바깥 컨투어 수: 팽창 전', len(c1), '→ 팽창 후', len(c2))

# 오른쪽 위 모서리를 확대해서 보기 (ROI)
roi1 = cv.resize(edges[40:160, 420:558], None, fx=3, fy=3, interpolation=cv.INTER_NEAREST)
roi2 = cv.resize(dilated[40:160, 420:558], None, fx=3, fy=3, interpolation=cv.INTER_NEAREST)
cv.imshow('zoom: edges | dilated', np.hstack([roi1, roi2]))
`, desc: '<p>확대해 보면 팽창 후 선이 두껍고 매끄럽게 이어진 것을 볼 수 있습니다. 너무 많이 팽창하면(iterations 를 크게) 가까운 선끼리 붙어 버리니 1~2회가 적당합니다.</p>' },
      { type: 'text', html: `<h3>STEP 3. 컨투어를 면적순으로 정렬하고 꼭짓점 세기</h3>
<p>“문서는 이미지에서 <b>가장 큰 사각형</b>”이라는 가정을 씁니다.</p>
<ol>
<li><code>cv.findContours</code> 로 컨투어를 모두 찾는다</li>
<li><code>sorted(contours, key=cv.contourArea, reverse=True)</code> 로 <b>큰 것부터</b> 정렬한다</li>
<li>각 컨투어를 <code>cv.approxPolyDP(c, 0.02 * 둘레, True)</code> 로 단순화해서 <b>꼭짓점 수</b>를 센다. 둘레의 2% 정도 오차를 허용하면 약간 휘어진 종이 가장자리도 4개의 꼭짓점으로 정리됩니다.</li>
</ol>` },
      { type: 'code', title: 'STEP 3 · 큰 컨투어 5개의 꼭짓점 수 확인', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), 0)
edges = cv.dilate(cv.Canny(blur, 50, 150), np.ones((3, 3), np.uint8))

contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
contours = sorted(contours, key=cv.contourArea, reverse=True)   # 큰 것부터

colors = [(0, 255, 0), (0, 0, 255), (255, 0, 0), (0, 200, 255), (255, 0, 255)]
view = img.copy()
for i, c in enumerate(contours[:5]):
    peri = cv.arcLength(c, True)
    approx = cv.approxPolyDP(c, 0.02 * peri, True)
    print('순위 %d: 면적 %8.0f, 꼭짓점 %d개' % (i + 1, cv.contourArea(c), len(approx)))
    cv.drawContours(view, [approx], -1, colors[i], 3)
    x, y = approx[0][0]
    cv.putText(view, '#%d (%d pts)' % (i + 1, len(approx)), (int(x), int(y) + 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, colors[i], 2)

cv.imshow('top 5 contours', view)
`, desc: '<p>1위 컨투어(초록)가 꼭짓점 4개로 근사된 스도쿠 테두리입니다. 3위(파랑, “SUDOKU” 제목 칸)처럼 작은 사각형도 있으므로 <b>큰 것부터 검사</b>하는 순서가 중요합니다. 나머지는 신문 가장자리·그림 조각이라 꼭짓점 수가 제각각입니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. find_quad() 함수로 정리</h3>
<p>큰 것부터 차례로 보면서 다음 조건을 <b>모두</b> 만족하는 첫 번째 컨투어를 문서로 고릅니다.</p>
<ul>
<li>꼭짓점이 <b>4개</b>: <code>len(approx) == 4</code></li>
<li><b>볼록(convex)</b>한 모양: <code>cv.isContourConvex(approx)</code> — 안쪽으로 꺾인 “화살촉” 모양 제외</li>
<li>이미지 면적의 <b>일정 비율 이상</b>: 작은 글자 칸 같은 것을 문서로 착각하지 않도록</li>
</ul>
<p>찾으면 <code>(4, 2)</code> 모양의 꼭짓점 배열을, 못 찾으면 <code>None</code> 을 돌려줍니다. 디버그를 위해 엣지 이미지도 함께 돌려줍니다.</p>` },
      { type: 'code', title: 'STEP 4 · find_quad() 로 스도쿠 테두리 찾기', code: String.raw`
import cv2 as cv
import numpy as np

def find_quad(img, low=50, high=150, min_ratio=0.02, mode=cv.RETR_EXTERNAL):
    """이미지에서 가장 큰 볼록 사각형의 네 꼭짓점 (4,2) 과 엣지 이미지를 돌려준다."""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.Canny(blur, low, high)
    edges = cv.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)

    contours, _ = cv.findContours(edges, mode, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = [c for c in contours if cv.contourArea(c) > min_area]     # 작은 것은 미리 버리기
    big = sorted(big, key=cv.contourArea, reverse=True)
    for c in big:
        peri = cv.arcLength(c, True)
        approx = cv.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

img = cv.imread('sudoku.png')
quad, edges = find_quad(img)

result = img.copy()
if quad is None:
    print('사각형을 찾지 못했습니다')
else:
    print('네 꼭짓점:\n', quad)
    cv.drawContours(result, [quad], -1, (0, 255, 0), 3)
    for (x, y) in quad:
        cv.circle(result, (int(x), int(y)), 8, (0, 0, 255), -1)

debug = np.hstack([result, cv.cvtColor(edges, cv.COLOR_GRAY2BGR)])
cv.imshow('result | edges', cv.resize(debug, None, fx=0.6, fy=0.6))
`, desc: '<p>출력된 꼭짓점 순서는 컨투어를 따라간 순서라서 <b>좌상단부터라는 보장이 없습니다</b>. 다음 교시에 이 순서를 정리합니다.</p>' },
      { type: 'text', html: `<h3>STEP 5. 카드 이미지: RETR_EXTERNAL 로는 안 되는 경우</h3>
<p><code>cards.png</code> 에 같은 함수를 쓰면 사각형을 못 찾습니다. 카드들이 서로 겹쳐 있어서 <b>바깥 컨투어(RETR_EXTERNAL)는 카드 더미 전체를 감싸는 큰 덩어리 하나</b>가 되기 때문입니다. 이럴 때는 안쪽 컨투어까지 모두 돌려주는 <code>cv.RETR_LIST</code> 를 씁니다.</p>
<p>또 카드 테두리는 연한 회색이라 Canny 엣지가 곳곳에서 끊어집니다. <b>팽창을 빼면 RETR_LIST 로도 사각형을 찾지 못합니다</b>. STEP 2의 팽창이 왜 필요한지 확인해 봅시다.</p>` },
      { type: 'code', title: 'STEP 5 · cards.png: EXTERNAL vs LIST, 팽창 유무 비교', code: String.raw`
import cv2 as cv
import numpy as np

def find_quad(img, low=50, high=150, min_ratio=0.02, mode=cv.RETR_EXTERNAL, dilate=True):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.Canny(blur, low, high)
    if dilate:
        edges = cv.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)
    contours, _ = cv.findContours(edges, mode, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        peri = cv.arcLength(c, True)
        approx = cv.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

img = cv.imread('cards.png')
tests = [('EXTERNAL + dilate', cv.RETR_EXTERNAL, True),
         ('LIST, no dilate', cv.RETR_LIST, False),
         ('LIST + dilate', cv.RETR_LIST, True)]
tiles = []
for name, mode, dil in tests:
    quad, edges = find_quad(img, mode=mode, dilate=dil)
    tile = img.copy()
    if quad is None:
        cv.putText(tile, 'NOT FOUND', (20, 60), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
    else:
        cv.drawContours(tile, [quad], -1, (0, 255, 0), 4)
    cv.putText(tile, name, (20, 460), cv.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 0), 2)
    print('%-18s → %s' % (name, '못 찾음' if quad is None else quad.tolist()))
    tiles.append(cv.resize(tile, (320, 240)))

cv.imshow('compare', np.hstack(tiles))
`, desc: '<p>세 번째(LIST + dilate)에서만 다른 카드에 가려지지 않은 카드 하나가 잡힙니다. <b>입력의 특성에 따라 설계가 달라진다</b>는 것이 프로젝트의 핵심 교훈입니다. 이후 코드에서는 두 이미지 모두 동작하는 <code>RETR_LIST</code> 를 기본값으로 씁니다.</p>' },
      { type: 'warn', html: `<p><b>approxPolyDP 의 epsilon(허용 오차)</b>: 너무 작으면(예: 0.005 × 둘레) 꼭짓점이 5~8개로 남아 사각형으로 인정되지 않고, 너무 크면(예: 0.1 × 둘레) 삼각형처럼 뭉개집니다. 보통 둘레의 <b>1~5%</b> 사이에서 조절합니다.</p>` },
      { type: 'text', html: `<h3>STEP 6. 실시간 버전: process(frame)</h3>
<p>이제 같은 함수를 <code>process(frame)</code> 안에서 부르면 웹캠에서도 동작합니다. 실시간 버전에서는 두 가지를 꼭 챙깁니다.</p>
<ul>
<li><b>찾지 못한 경우</b>(<code>quad is None</code>)에도 오류 없이 “NOT FOUND” 를 그려서 돌려준다</li>
<li>Canny 임계값을 <b>트랙바</b>로 조절해서 조명에 맞게 튜닝한다</li>
</ul>
<p>📷 오른쪽 패널에서 입력 소스를 <b>웹캠</b>으로 바꾸고, <b>어두운 책상 위에 흰 종이</b>를 놓고 비춰 보세요. 웹캠이 없으면 <code>sudoku.png</code>, <code>cards.png</code> 를 입력으로 고르세요. 🎞️ 동영상(<code>vtest.avi</code> 등)을 골라 “문서가 없는 장면에서도 NOT FOUND 로 멈추지 않고 계속 도는지” 확인하는 것도 좋은 테스트입니다.</p>` },
      { type: 'code', title: 'STEP 6 · 실시간 문서 사각형 검출 (완성)', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'scanner'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('canny low', WIN, 50, 255, nothing)
cv.createTrackbar('canny high', WIN, 150, 255, nothing)
cv.createTrackbar('min area %', WIN, 2, 50, nothing)

def find_quad(img, low=50, high=150, min_ratio=0.02, mode=cv.RETR_LIST):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.Canny(blur, low, high)
    edges = cv.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)
    contours, _ = cv.findContours(edges, mode, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        peri = cv.arcLength(c, True)
        approx = cv.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

def process(frame):
    low = cv.getTrackbarPos('canny low', WIN)
    high = cv.getTrackbarPos('canny high', WIN)
    ratio = max(1, cv.getTrackbarPos('min area %', WIN)) / 100.0

    quad, edges = find_quad(frame, low, high, ratio)
    result = frame.copy()
    if quad is None:
        cv.putText(result, 'NOT FOUND', (20, 40), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    else:
        cv.drawContours(result, [quad], -1, (0, 255, 0), 3)
        for (x, y) in quad:
            cv.circle(result, (int(x), int(y)), 6, (0, 0, 255), -1)
        cv.putText(result, 'FOUND', (20, 40), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
    return result, edges

# 이미지로 먼저 한 번 테스트
for name in ['sudoku.png', 'cards.png']:
    res, _ = process(cv.imread(name))
    cv.imshow('test ' + name, res)
`, desc: '<p>결과는 <code>result 1</code>(검출 결과)과 <code>result 2</code>(엣지 디버그 뷰) 두 창에 나옵니다. 사각형이 안 잡히면 먼저 <b>엣지 창에서 종이 외곽선이 끊기지 않고 보이는지</b> 확인하세요.</p>' },
      { type: 'tip', html: `<p><b>웹캠 테스트 팁</b>: 종이와 배경의 밝기 차이가 클수록 잘 됩니다. 흰 종이 + 어두운 책상, 종이 네 모서리가 모두 화면 안에 들어오게, 손가락으로 모서리를 가리지 않기. 그래도 안 되면 <code>canny low/high</code> 를 낮춰 보세요.</p>` },
      { type: 'checklist', title: '도전 과제', items: [
        '찾은 사각형 안쪽을 반투명 초록색으로 채우기 (cv.fillPoly + cv.addWeighted)',
        '사각형이 이미지 면적의 몇 %인지 화면에 표시하기',
        '사각형을 찾은 프레임 수 / 전체 프레임 수를 세어 “검출률” 표시하기 (global 변수)',
        'box.png, messi5.jpg 등 다른 이미지에서 잘못 검출되는 경우를 찾아 원인 적어 보기',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · epsilon 비율을 트랙바로 조절하기',
        desc: `<p>STEP 6 코드에서 approxPolyDP 의 허용 오차 비율(지금은 0.02 고정)을 <b>트랙바 <code>eps x1000</code></b>(0~100, 기본 20)로 조절할 수 있게 바꾸세요. 값을 5 이하로 낮추면 사각형을 못 찾고, 20 근처에서 잘 찾는 것을 확인합니다. 결과 화면에 현재 epsilon 값도 표시하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'scanner'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('canny low', WIN, 50, 255, nothing)
cv.createTrackbar('canny high', WIN, 150, 255, nothing)
# TODO: 'eps x1000' 트랙바를 만드세요 (기본값 20, 최대 100)

def find_quad(img, low, high, eps=0.02, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        peri = cv.arcLength(c, True)
        approx = cv.approxPolyDP(c, 0.02 * peri, True)     # TODO: 0.02 대신 eps 사용
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

def process(frame):
    low = cv.getTrackbarPos('canny low', WIN)
    high = cv.getTrackbarPos('canny high', WIN)
    eps = 0.02      # TODO: 트랙바 값 / 1000 으로 바꾸세요
    quad, edges = find_quad(frame, low, high, eps)
    result = frame.copy()
    if quad is None:
        cv.putText(result, 'NOT FOUND', (20, 40), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    else:
        cv.drawContours(result, [quad], -1, (0, 255, 0), 3)
    # TODO: 'eps = 0.020' 형태로 현재 값을 화면 아래쪽에 표시하세요
    return result, edges
`,
        hint: `<p><code>cv.createTrackbar('eps x1000', WIN, 20, 100, nothing)</code> → process 안에서 <code>eps = cv.getTrackbarPos('eps x1000', WIN) / 1000.0</code>. 표시: <code>'eps = %.3f' % eps</code>. 입력 이미지를 sudoku.png 로 바꿔 테스트하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'scanner'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('canny low', WIN, 50, 255, nothing)
cv.createTrackbar('canny high', WIN, 150, 255, nothing)
cv.createTrackbar('eps x1000', WIN, 20, 100, nothing)

def find_quad(img, low, high, eps=0.02, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        peri = cv.arcLength(c, True)
        approx = cv.approxPolyDP(c, eps * peri, True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

def process(frame):
    low = cv.getTrackbarPos('canny low', WIN)
    high = cv.getTrackbarPos('canny high', WIN)
    eps = max(1, cv.getTrackbarPos('eps x1000', WIN)) / 1000.0
    quad, edges = find_quad(frame, low, high, eps)
    result = frame.copy()
    if quad is None:
        cv.putText(result, 'NOT FOUND', (20, 40), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    else:
        cv.drawContours(result, [quad], -1, (0, 255, 0), 3)
    h = result.shape[0]
    cv.putText(result, 'eps = %.3f' % eps, (20, h - 20), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
    return result, edges
`,
      },
      {
        title: '실습 2 · 찾은 문서를 반투명하게 강조하기',
        desc: `<p>sudoku.png 에서 찾은 사각형 내부를 <b>반투명 초록색</b>으로 칠하고, 사각형이 이미지 전체 면적의 몇 %인지 <code>area: 64.3%</code> 처럼 표시하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

img = cv.imread('sudoku.png')
quad, edges = find_quad(img)
result = img.copy()
if quad is not None:
    overlay = img.copy()
    # TODO: overlay 위에 quad 내부를 초록색 (0, 255, 0) 으로 채우세요 (cv.fillPoly)
    # TODO: cv.addWeighted 로 img 와 overlay 를 섞어 result 를 만드세요 (0.6 : 0.4)
    # TODO: 면적 비율(%)을 계산해 putText 로 표시하세요
    cv.drawContours(result, [quad], -1, (0, 255, 0), 3)
cv.imshow('highlight', result)
`,
        hint: `<p><code>cv.fillPoly(overlay, [quad], (0, 255, 0))</code>, <code>result = cv.addWeighted(img, 0.6, overlay, 0.4, 0)</code>. 비율은 <code>cv.contourArea(quad) / (h * w) * 100</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

img = cv.imread('sudoku.png')
quad, edges = find_quad(img)
result = img.copy()
if quad is not None:
    overlay = img.copy()
    cv.fillPoly(overlay, [quad], (0, 255, 0))
    result = cv.addWeighted(img, 0.6, overlay, 0.4, 0)
    h, w = img.shape[:2]
    ratio = cv.contourArea(quad) / (h * w) * 100
    cv.drawContours(result, [quad], -1, (0, 255, 0), 3)
    cv.putText(result, 'area: %.1f%%' % ratio, (20, 40), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    print('문서 면적 비율: %.1f%%' % ratio)
cv.imshow('highlight', result)
`,
      },
    ],
    quiz: [
      { q: 'Canny 엣지에 3×3 팽창(dilate)을 한 번 적용하는 주된 이유는?', options: ['엣지를 더 가늘게 만들려고', '이미지 크기를 키우려고', '끊어진 외곽선의 작은 틈을 메워 닫힌 컨투어를 만들려고', '색상 정보를 되살리려고'], answer: 2, explain: 'Canny 엣지는 1픽셀 두께라 끊어지기 쉽습니다. 팽창으로 선을 두껍게 하면 틈이 메워져 외곽선이 하나의 닫힌 컨투어로 잡힙니다.' },
      { q: 'approxPolyDP 결과 len(approx) == 4 가 의미하는 것은?', options: ['허용 오차 안에서 컨투어를 꼭짓점 4개짜리 다각형으로 근사할 수 있다', '컨투어 면적이 4픽셀이다', '컨투어가 4개 있다', '이미지가 4채널이다'], answer: 0, explain: '둘레의 약 2%까지 오차를 허용해 컨투어를 단순화했을 때 꼭짓점이 4개 남으면 사각형 후보로 봅니다.' },
      { q: 'cards.png 에서 RETR_EXTERNAL 로 카드 사각형을 찾지 못한 이유는?', options: ['카드가 빨간색이라서', '겹친 카드들의 바깥 컨투어가 카드 더미 전체를 감싸는 하나의 덩어리가 되어서', 'Canny 를 쓰지 않아서', '이미지가 너무 작아서'], answer: 1, explain: 'RETR_EXTERNAL 은 가장 바깥 컨투어만 돌려줍니다. 겹친 카드들은 하나로 이어져 있으므로 안쪽 컨투어까지 받는 RETR_LIST 가 필요합니다.' },
      { q: '실시간 process(frame) 버전에서 find_quad 가 None 을 돌려줄 때 올바른 처리는?', options: ['그대로 quad[0] 을 사용한다', '프로그램을 종료한다', 'while 루프로 다시 찾는다', 'NOT FOUND 를 표시한 결과 이미지를 정상적으로 return 한다'], answer: 3, explain: '실시간 입력에서는 못 찾는 프레임이 자주 생깁니다. 오류 없이 상태를 표시하고 다음 프레임을 기다리는 것이 올바른 설계입니다.' },
    ],
  },

  // =====================================================================
  // w4-3 가이드 프로젝트 ① 문서 스캐너 (2)
  // =====================================================================
  {
    id: 'w4-3',
    summary: '지난 교시에 찾은 네 꼭짓점을 좌상·우상·우하·좌하 순서로 정렬하고, 원근 변환으로 문서를 반듯하게 편 뒤 적응형 임계처리로 스캔 효과를 줍니다. 전체를 scan() 함수 하나로 묶고 웹캠 버전과 저장 기능까지 완성합니다.',
    goals: [
      '좌표의 합(x+y)과 차(y−x)를 이용해 네 꼭짓점을 tl, tr, br, bl 순서로 정렬할 수 있다',
      '변의 길이로 출력 크기를 정하고 getPerspectiveTransform + warpPerspective 로 문서를 펼 수 있다',
      '적응형 임계처리로 조명이 고르지 않은 문서를 깔끔한 흑백 스캔으로 만들 수 있다',
      '검출 실패 시 대체 동작(fallback)이 있는 scan() 함수와 웹캠 버전을 완성할 수 있다',
    ],
    schedule: [['복습 · 도입', 5], ['STEP 1 꼭짓점 정렬', 10], ['STEP 2 원근 변환', 10], ['STEP 3~5 스캔 효과 · 통합', 15], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 지난 교시 복습과 오늘의 목표</h3>
<p>w4-2 에서 만든 <code>find_quad(img)</code> 는 문서의 네 꼭짓점을 <code>(4, 2)</code> 배열로 돌려줍니다. 하지만 이 순서는 <b>컨투어를 따라간 순서</b>일 뿐이라 이미지마다 제각각입니다. 원근 변환은 “어느 점이 어느 모서리로 가는지”가 정확해야 하므로 먼저 순서를 정리해야 합니다.</p>
<p>오늘의 파이프라인: <b>find_quad → 꼭짓점 정렬 → 출력 크기 계산 → 원근 변환 → 적응형 임계처리 → 저장</b></p>` },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        'sudoku.png 의 스도쿠 판이 정면에서 본 정사각형에 가깝게 펴진다',
        '스캔 결과(흑백)에서 숫자와 격자선이 또렷하고 배경 그림자가 사라진다',
        'scan(img) 가 (debug, warped, scanned) 세 장을 돌려주고, 사각형이 없어도 오류가 나지 않는다',
        '웹캠(process) 버전이 세 창을 실시간으로 보여준다',
        'cv.imwrite 로 스캔 결과 파일이 저장된다',
      ] },
      { type: 'text', html: `<h3>STEP 1. 꼭짓점 정렬: 합과 차 트릭</h3>
<p>이미지 좌표는 오른쪽으로 갈수록 x, 아래로 갈수록 y 가 커집니다. 그래서</p>
<ul>
<li><b>좌상단(tl)</b>은 x + y 가 <b>가장 작고</b>, <b>우하단(br)</b>은 x + y 가 <b>가장 큽니다</b>.</li>
<li><b>우상단(tr)</b>은 x 는 크고 y 는 작으니 y − x 가 <b>가장 작고</b>, <b>좌하단(bl)</b>은 y − x 가 <b>가장 큽니다</b>.</li>
</ul>
<p>NumPy 로 쓰면 <code>s = pts.sum(axis=1)</code>, <code>d = np.diff(pts, axis=1)</code> 이고, <code>np.argmin</code> / <code>np.argmax</code> 로 몇 번째 점인지 찾습니다.</p>` },
      { type: 'table', head: ['점 (sudoku.png)', 'x + y', 'y − x', '판정'], rows: [
        ['(72, 83)', '155 ← 최소', '11', '<b>tl</b> 좌상단'],
        ['(519, 64)', '583', '−455 ← 최소', '<b>tr</b> 우상단'],
        ['(521, 522)', '1043 ← 최대', '1', '<b>br</b> 우하단'],
        ['(34, 517)', '551', '483 ← 최대', '<b>bl</b> 좌하단'],
      ] },
      { type: 'code', title: 'STEP 1 · order_points() 로 꼭짓점 정렬하고 라벨 붙이기', code: String.raw`
import cv2 as cv
import numpy as np

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

def order_points(pts):
    """네 점을 [tl, tr, br, bl] 순서로 정렬한다."""
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)               # x + y
    d = np.diff(pts, axis=1).ravel()  # y - x
    tl = pts[np.argmin(s)]
    br = pts[np.argmax(s)]
    tr = pts[np.argmin(d)]
    bl = pts[np.argmax(d)]
    return np.array([tl, tr, br, bl], dtype=np.float32)

img = cv.imread('sudoku.png')
quad, _ = find_quad(img)
print('정렬 전:', quad.tolist())
rect = order_points(quad)
print('정렬 후 [tl, tr, br, bl]:', rect.astype(int).tolist())

view = img.copy()
cv.polylines(view, [rect.astype(np.int32)], True, (0, 255, 0), 2)
for (x, y), name in zip(rect, ['TL', 'TR', 'BR', 'BL']):
    cv.circle(view, (int(x), int(y)), 8, (0, 0, 255), -1)
    cv.putText(view, name, (int(x) + 10, int(y) + 25), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
cv.imshow('ordered corners', view)
`, desc: '<p>라벨이 실제 위치와 맞는지 눈으로 확인하세요. 문서가 45° 가까이 크게 기울어지면 이 트릭이 헷갈릴 수 있지만, 일반적인 촬영에서는 잘 동작합니다.</p>' },
      { type: 'text', html: `<h3>STEP 2. 출력 크기 정하기와 원근 변환</h3>
<p>펼친 문서의 <b>너비</b>는 윗변(tl–tr)과 아랫변(bl–br) 중 긴 쪽, <b>높이</b>는 왼쪽 변(tl–bl)과 오른쪽 변(tr–br) 중 긴 쪽으로 정합니다. 두 점 사이 거리는 피타고라스 공식 √((x₁−x₂)² + (y₁−y₂)²) 입니다.</p>
<p>그다음 2주차에 배운 원근 변환을 그대로 씁니다.</p>
<ul>
<li><code>dst = [[0,0], [W−1,0], [W−1,H−1], [0,H−1]]</code> — 정렬한 순서(tl, tr, br, bl)와 <b>같은 순서</b>로!</li>
<li><code>M = cv.getPerspectiveTransform(rect, dst)</code> — 두 배열 모두 <b>float32</b></li>
<li><code>warped = cv.warpPerspective(img, M, (W, H))</code> — 크기는 (너비, 높이) 순서</li>
</ul>` },
      { type: 'code', title: 'STEP 2 · 네 점을 직사각형으로 펴기', code: String.raw`
import cv2 as cv
import numpy as np

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

def order_points(pts):
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)

def dist(p, q):
    """두 점 사이의 거리"""
    return float(np.sqrt(((p - q) ** 2).sum()))

def warp_document(img, quad):
    rect = order_points(quad)
    tl, tr, br, bl = rect
    W = int(max(dist(tl, tr), dist(bl, br)))     # 윗변, 아랫변 중 긴 쪽
    H = int(max(dist(tl, bl), dist(tr, br)))     # 왼쪽, 오른쪽 변 중 긴 쪽
    dst = np.array([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]], dtype=np.float32)
    M = cv.getPerspectiveTransform(rect, dst)
    return cv.warpPerspective(img, M, (W, H))

for name in ['sudoku.png', 'cards.png']:
    img = cv.imread(name)
    quad, _ = find_quad(img)
    if quad is None:
        print(name, ': 사각형 없음')
        continue
    warped = warp_document(img, quad)
    print(name, '→ 펼친 크기 (h, w):', warped.shape[:2])
    cv.imshow('warped ' + name, warped)
`, desc: '<p>스도쿠 판이 정면에서 본 것처럼 반듯해지고, 카드도 똑바로 세워집니다. 격자선이 수평·수직인지 확인해 보세요.</p>' },
      { type: 'text', html: `<h3>STEP 3. 스캔 효과: 왜 적응형 임계처리인가?</h3>
<p>사진으로 찍은 문서는 한쪽이 어둡거나 그림자가 지기 쉽습니다. 이미지 전체에 <b>임계값 하나</b>를 쓰는 전역 이진화(Otsu 포함)는 어두운 쪽을 통째로 검게 만들어 버립니다.</p>
<p><b>적응형 임계처리(Adaptive Threshold)</b>는 픽셀마다 <b>주변 영역의 평균</b>과 비교하므로 조명이 고르지 않아도 글자만 검게 남습니다.</p>
<ul>
<li><code>blockSize</code>(홀수): 주변 영역 크기. 글자 굵기보다 충분히 크게 (15~31)</li>
<li><code>C</code>: 평균에서 빼는 값. 크게 하면 배경 잡티가 줄고 글자가 가늘어짐 (5~15)</li>
</ul>` },
      { type: 'code', title: 'STEP 3 · 전역(Otsu) vs 적응형 임계처리 비교', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
# 이 비교에서는 결과만 보기 위해 지난 STEP 에서 얻은 꼭짓점을 직접 사용
quad = np.array([[72, 83], [519, 64], [521, 522], [34, 517]], dtype=np.float32)   # tl, tr, br, bl
W, H = 450, 450
dst = np.array([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]], dtype=np.float32)
warped = cv.warpPerspective(img, cv.getPerspectiveTransform(quad, dst), (W, H))

gray = cv.cvtColor(warped, cv.COLOR_BGR2GRAY)
_, otsu = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
adaptive = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 10)
clean = cv.medianBlur(adaptive, 3)          # 소금·후추 잡티 살짝 제거

tiles = [gray, otsu, adaptive, clean]
labels = ['gray', 'otsu', 'adaptive', 'adaptive+median']
row = []
for t, lab in zip(tiles, labels):
    t = cv.cvtColor(cv.resize(t, (300, 300)), cv.COLOR_GRAY2BGR)
    cv.putText(t, lab, (5, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    row.append(t)
cv.imshow('scan effect compare', np.hstack(row))
`, desc: '<p>Otsu 결과는 그림자 진 아래쪽이 뭉개지지만, 적응형 결과는 숫자와 선이 고르게 살아 있습니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. 전체 파이프라인을 scan() 하나로</h3>
<p>지금까지의 단계를 <b>하나의 함수</b>로 묶습니다. 함수는 세 장을 돌려줍니다.</p>
<ul>
<li><b>debug</b>: 원본 위에 찾은 사각형과 꼭짓점 라벨 (못 찾으면 NOT FOUND)</li>
<li><b>warped</b>: 펼친 컬러 문서</li>
<li><b>scanned</b>: 흑백 스캔 결과</li>
</ul>
<p><b>대체 동작(Fallback)</b>: 사각형을 못 찾으면 <b>원본 전체를 문서로 보고</b> 스캔 효과만 적용합니다. 이렇게 하면 어떤 입력이 와도 프로그램이 멈추지 않고, 사용자는 “검출이 실패했구나”를 debug 창으로 알 수 있습니다.</p>` },
      { type: 'code', title: 'STEP 4 · scan(img) 완성 + 결과 저장', code: String.raw`
import cv2 as cv
import numpy as np

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

def order_points(pts):
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)

def dist(p, q):
    return float(np.sqrt(((p - q) ** 2).sum()))

def warp_document(img, rect):
    tl, tr, br, bl = rect
    W = max(int(max(dist(tl, tr), dist(bl, br))), 10)
    H = max(int(max(dist(tl, bl), dist(tr, br))), 10)
    dst = np.array([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]], dtype=np.float32)
    return cv.warpPerspective(img, cv.getPerspectiveTransform(rect, dst), (W, H))

def scan_effect(bgr, block=21, C=10):
    gray = cv.cvtColor(bgr, cv.COLOR_BGR2GRAY)
    th = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, block, C)
    return cv.medianBlur(th, 3)

def scan(img):
    """문서 스캔 파이프라인: (debug, warped, scanned) 를 돌려준다."""
    debug = img.copy()
    quad, _ = find_quad(img)
    if quad is None:                                   # 대체 동작
        warped = img.copy()
        cv.putText(debug, 'NOT FOUND - using whole image', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    else:
        rect = order_points(quad)
        warped = warp_document(img, rect)
        cv.polylines(debug, [rect.astype(np.int32)], True, (0, 255, 0), 3)
        for (x, y), name in zip(rect, ['TL', 'TR', 'BR', 'BL']):
            cv.circle(debug, (int(x), int(y)), 7, (0, 0, 255), -1)
            cv.putText(debug, name, (int(x) + 8, int(y) + 22), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
    scanned = scan_effect(warped)
    return debug, warped, scanned

for name in ['sudoku.png', 'cards.png', 'messi5.jpg']:
    debug, warped, scanned = scan(cv.imread(name))
    print('%-12s warped %s' % (name, warped.shape))
    cv.imshow(name + ' debug', debug)
    cv.imshow(name + ' scanned', scanned)

# 스도쿠 결과를 파일로 저장 (콘솔에 다운로드 링크가 나타남)
_, warped, scanned = scan(cv.imread('sudoku.png'))
cv.imwrite('sudoku_warped.png', warped)
cv.imwrite('sudoku_scanned.png', scanned)
`, desc: '<p><code>messi5.jpg</code> 에는 문서가 없으니 NOT FOUND 와 함께 원본 전체가 스캔 효과로 처리됩니다. 오류 없이 끝까지 실행되는 것이 중요합니다.</p>' },
      { type: 'text', html: `<h3>STEP 5. 웹캠 스캐너</h3>
<p><code>process(frame)</code> 에서 <code>scan(frame)</code> 을 부르고 <b>튜플을 그대로 return</b> 하면 <code>result 1</code>(debug), <code>result 2</code>(warped), <code>result 3</code>(scanned) 세 창이 실시간으로 갱신됩니다. 📷 오른쪽 패널에서 입력을 웹캠으로 바꾸고 흰 종이를 비춰 보세요. 웹캠이 없으면 <code>sudoku.png</code> 를 고르거나, 🎞️ 동영상을 골라 사각형이 없는 장면에서의 대체 동작을 확인하세요.</p>` },
      { type: 'code', title: 'STEP 5 · 실시간 문서 스캐너 (완성)', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'scanner'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('canny low', WIN, 50, 255, nothing)
cv.createTrackbar('canny high', WIN, 150, 255, nothing)

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2), edges
    return None, edges

def order_points(pts):
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)

def dist(p, q):
    return float(np.sqrt(((p - q) ** 2).sum()))

def warp_document(img, rect):
    tl, tr, br, bl = rect
    W = max(int(max(dist(tl, tr), dist(bl, br))), 10)
    H = max(int(max(dist(tl, bl), dist(tr, br))), 10)
    dst = np.array([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]], dtype=np.float32)
    return cv.warpPerspective(img, cv.getPerspectiveTransform(rect, dst), (W, H))

def scan(img, low=50, high=150):
    debug = img.copy()
    quad, _ = find_quad(img, low, high)
    if quad is None:
        warped = img.copy()
        cv.putText(debug, 'NOT FOUND', (10, 35), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    else:
        rect = order_points(quad)
        warped = warp_document(img, rect)
        cv.polylines(debug, [rect.astype(np.int32)], True, (0, 255, 0), 3)
    gray = cv.cvtColor(warped, cv.COLOR_BGR2GRAY)
    scanned = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 10)
    return debug, warped, scanned

def process(frame):
    low = cv.getTrackbarPos('canny low', WIN)
    high = cv.getTrackbarPos('canny high', WIN)
    return scan(frame, low, high)          # 튜플 → result 1, 2, 3 창
`, desc: '<p>마음에 드는 장면이 나오면 웹캠 스냅샷(<code>webcam.png</code>)을 찍은 뒤 STEP 4 코드에서 <code>cv.imread(\'webcam.png\')</code> 로 스캔하고 저장해 보세요.</p>' },
      { type: 'warn', html: `<p><b>주의할 점</b></p>
<ul>
<li><code>getPerspectiveTransform</code> 의 두 점 배열은 반드시 <b>float32</b>, 모양 (4, 2) 여야 합니다. int 배열을 넣으면 오류가 납니다.</li>
<li><code>warpPerspective</code> 의 크기 인자는 <b>(너비, 높이)</b> 순서입니다. <code>img.shape</code> 는 (높이, 너비) 순서이니 헷갈리지 마세요.</li>
<li>꼭짓점 순서가 틀리면 결과가 뒤집히거나 꼬인 모양이 됩니다 → debug 창의 TL/TR/BR/BL 라벨부터 확인!</li>
</ul>` },
      { type: 'checklist', title: '도전 과제', items: [
        '마우스로 네 꼭짓점을 직접 찍어 펴는 “수동 모드” 만들기 (실습 1)',
        '출력 크기를 A4 비율(1 : 1.414)로 고정하기',
        '스캔 결과를 흑백 대신 CLAHE 로 대비만 높인 “컬러 스캔” 모드 추가',
        '최근 5프레임의 꼭짓점 좌표 평균을 써서 웹캠에서 사각형이 떨리지 않게 하기',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 마우스로 네 꼭짓점을 찍어 펴기 (수동 모드)',
        desc: `<p>자동 검출이 실패할 때를 위한 <b>수동 모드</b>를 만듭니다. <code>click corners</code> 창에서 문서 모서리 4곳을 <b>아무 순서로</b> 클릭하면 점과 번호가 그려지고, 4번째 클릭 순간 <code>order_points</code> 로 정렬해 원근 변환한 결과를 <code>manual warp</code> 창에 보여주세요. 오른쪽 버튼을 누르면 처음부터 다시 찍을 수 있어야 합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
display = img.copy()
points = []

def order_points(pts):
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN and len(points) < 4:
        points.append((x, y))
        cv.circle(display, (x, y), 7, (0, 0, 255), -1)
        cv.putText(display, str(len(points)), (x + 8, y - 8), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
        print('점', len(points), ':', (x, y))
        if len(points) == 4:
            # TODO: order_points 로 정렬 → 출력 크기 400x400 → getPerspectiveTransform → warpPerspective
            # TODO: cv.imshow('manual warp', warped)
            pass
    elif event == cv.EVENT_RBUTTONDOWN:
        # TODO: points 를 비우고 display 를 원본으로 되돌리세요 (제자리 수정: display[:] = img)
        pass

cv.imshow('click corners', display)
cv.setMouseCallback('click corners', on_mouse)
print('문서 모서리 4곳을 클릭하세요. 오른쪽 클릭 = 다시 찍기')
`,
        hint: `<p><code>rect = order_points(np.array(points))</code>, <code>dst = np.array([[0,0],[399,0],[399,399],[0,399]], np.float32)</code>. 리셋은 <code>points.clear()</code> 와 <code>display[:] = img</code> — 새 배열을 대입하면 창이 갱신되지 않으니 <b>제자리 수정</b>하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('sudoku.png')
display = img.copy()
points = []

def order_points(pts):
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN and len(points) < 4:
        points.append((x, y))
        cv.circle(display, (x, y), 7, (0, 0, 255), -1)
        cv.putText(display, str(len(points)), (x + 8, y - 8), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
        print('점', len(points), ':', (x, y))
        if len(points) == 4:
            rect = order_points(np.array(points))
            cv.polylines(display, [rect.astype(np.int32)], True, (0, 255, 0), 2)
            W, H = 400, 400
            dst = np.array([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]], dtype=np.float32)
            M = cv.getPerspectiveTransform(rect, dst)
            warped = cv.warpPerspective(img, M, (W, H))
            cv.imshow('manual warp', warped)
    elif event == cv.EVENT_RBUTTONDOWN:
        points.clear()
        display[:] = img
        print('초기화했습니다')

cv.imshow('click corners', display)
cv.setMouseCallback('click corners', on_mouse)
print('문서 모서리 4곳을 클릭하세요. 오른쪽 클릭 = 다시 찍기')
`,
      },
      {
        title: '실습 2 · 스캔 선명도를 트랙바로 조절하기',
        desc: `<p>STEP 5 의 스캐너에 <code>block</code>(적응형 임계처리 blockSize, 3~51 홀수)와 <code>C</code>(0~30) 트랙바를 추가하세요. blockSize 는 반드시 <b>3 이상의 홀수</b>여야 하므로 트랙바 값을 보정하는 코드가 필요합니다. 입력을 sudoku.png 로 두고 값을 바꾸며 가장 깨끗한 값을 찾아보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'scan params'
def nothing(x):
    pass
cv.namedWindow(WIN)
# TODO: 'block' (기본 21, 최대 51), 'C' (기본 10, 최대 30) 트랙바 만들기

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2)
    return None

def order_points(pts):
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)

def process(frame):
    quad = find_quad(frame)
    if quad is None:
        warped = frame.copy()
    else:
        rect = order_points(quad)
        W, H = 450, 450
        dst = np.array([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]], dtype=np.float32)
        warped = cv.warpPerspective(frame, cv.getPerspectiveTransform(rect, dst), (W, H))
    gray = cv.cvtColor(warped, cv.COLOR_BGR2GRAY)

    block, C = 21, 10
    # TODO: 트랙바에서 block, C 읽기. block 은 3 이상 홀수로 보정 (짝수면 +1)

    scanned = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, block, C)
    cv.putText(warped, 'block=%d C=%d' % (block, C), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return warped, scanned
`,
        hint: `<p><code>block = max(3, cv.getTrackbarPos('block', WIN))</code> 다음 <code>if block % 2 == 0: block += 1</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'scan params'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('block', WIN, 21, 51, nothing)
cv.createTrackbar('C', WIN, 10, 30, nothing)

def find_quad(img, low=50, high=150, min_ratio=0.02):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(gray, (5, 5), 0)
    edges = cv.dilate(cv.Canny(blur, low, high), np.ones((3, 3), np.uint8))
    contours, _ = cv.findContours(edges, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
    min_area = img.shape[0] * img.shape[1] * min_ratio
    big = sorted([c for c in contours if cv.contourArea(c) > min_area], key=cv.contourArea, reverse=True)
    for c in big:
        approx = cv.approxPolyDP(c, 0.02 * cv.arcLength(c, True), True)
        if len(approx) == 4 and cv.isContourConvex(approx):
            return approx.reshape(4, 2)
    return None

def order_points(pts):
    pts = pts.astype(np.float32)
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)

def process(frame):
    quad = find_quad(frame)
    if quad is None:
        warped = frame.copy()
    else:
        rect = order_points(quad)
        W, H = 450, 450
        dst = np.array([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]], dtype=np.float32)
        warped = cv.warpPerspective(frame, cv.getPerspectiveTransform(rect, dst), (W, H))
    gray = cv.cvtColor(warped, cv.COLOR_BGR2GRAY)

    block = max(3, cv.getTrackbarPos('block', WIN))
    if block % 2 == 0:
        block += 1
    C = cv.getTrackbarPos('C', WIN)

    scanned = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, block, C)
    cv.putText(warped, 'block=%d C=%d' % (block, C), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return warped, scanned
`,
      },
    ],
    quiz: [
      { q: '네 꼭짓점 중 x + y 값이 가장 작은 점은 어느 모서리인가?', options: ['우상단 (tr)', '좌하단 (bl)', '우하단 (br)', '좌상단 (tl)'], answer: 3, explain: '이미지 좌표는 왼쪽 위가 (0, 0) 이므로 x 와 y 가 모두 작은 좌상단이 합이 가장 작습니다. 반대로 우하단은 합이 가장 큽니다.' },
      { q: '펼친 문서의 너비를 윗변과 아랫변 중 “긴 쪽”으로 정하는 이유는?', options: ['계산이 더 빨라서', '원근 때문에 짧게 찍힌 쪽에 맞추면 해상도(글자 크기)가 줄어 정보가 손실되므로', 'OpenCV 규칙이라서', '긴 쪽으로 해야 흑백이 되므로'], answer: 1, explain: '카메라에서 먼 변은 짧게 찍힙니다. 긴 변 기준으로 크기를 잡아야 가까운 쪽의 디테일을 잃지 않습니다.' },
      { q: '스캔 효과에 전역 Otsu 이진화 대신 적응형 임계처리를 쓰는 가장 큰 이유는?', options: ['조명이 고르지 않아 그림자가 진 부분도 글자만 검게 남기려고', '컬러를 유지하려고', '이미지 크기를 줄이려고', '엣지를 두껍게 하려고'], answer: 0, explain: '적응형 임계처리는 주변 영역 평균과 비교하므로 밝기가 위치마다 달라도 글자와 배경을 잘 구분합니다.' },
      { q: 'scan() 에서 사각형을 찾지 못했을 때 원본 전체를 문서로 보고 처리하는 설계의 장점은?', options: ['항상 정확한 사각형을 찾는다', '처리 속도가 10배 빨라진다', '어떤 입력에도 프로그램이 멈추지 않고 결과와 실패 상태를 함께 보여준다', '원근 변환이 필요 없어진다'], answer: 2, explain: '대체 동작(fallback)은 실시간·다양한 입력 환경에서 프로그램이 오류로 멈추지 않게 합니다. 실패 여부는 debug 창으로 알립니다.' },
    ],
  },

  // =====================================================================
  // w4-4 가이드 프로젝트 ② 동전·도형 분석기
  // =====================================================================
  {
    id: 'w4-4',
    summary: '맞닿은 동전의 개수를 세는 “동전 카운터”와 도형의 모양을 판별하는 “도형 분류기”를 만듭니다. 이진화 → 모폴로지 → 거리 변환으로 붙은 물체를 떼어 내고, 컨투어 특징(꼭짓점 수, 원형도, 종횡비, 채움 비율)으로 모양을 분류합니다.',
    goals: [
      'Otsu 이진화와 모폴로지 열기로 동전 마스크를 만들고, 붙은 동전이 한 덩어리로 세어지는 문제를 확인할 수 있다',
      '거리 변환(distanceTransform)과 임계처리로 맞닿은 물체를 분리해 개수를 셀 수 있다',
      'HoughCircles 방식과 컨투어 방식의 장단점을 비교할 수 있다',
      '꼭짓점 수·원형도·종횡비·채움 비율로 도형을 분류하고 결과를 영어 라벨로 표시할 수 있다',
    ],
    schedule: [['도입', 5], ['Part A 동전 카운터', 20], ['Part B 도형 분류기', 15], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개</h3>
<p>“사진 속 물체가 <b>몇 개</b>이고 <b>어떤 모양</b>인가?”는 공장 검사, 세포 세기, 부품 분류 등 실제 현장에서 가장 많이 쓰는 영상처리 문제입니다. 이번 교시는 두 파트로 나뉩니다.</p>
<ul>
<li><b>Part A · 동전 카운터</b> (<code>water_coins.jpg</code>): 서로 <b>맞닿은 동전</b>을 하나씩 떼어서 세기</li>
<li><b>Part B · 도형 분류기</b> (<code>pic1.png</code>, <code>detect_blob.png</code>): 컨투어의 특징으로 TRIANGLE / SQUARE / RECTANGLE / CIRCLE / ELLIPSE 판별</li>
</ul>` },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        'water_coins.jpg 의 동전 개수가 24개로 출력되고, 동전마다 번호가 그려진다',
        'HoughCircles 로도 동전을 세어 두 방법의 결과를 비교한다',
        'detect_blob.png 의 원·사각형·타원이 올바른 영어 라벨로 표시된다',
        '도형 종류별 개수 요약이 print 로 출력된다',
      ] },
      { type: 'text', html: `<h3>Part A · STEP 1. 이진화와 모폴로지 — 그리고 문제 발견</h3>
<p>동전은 배경(흰 종이)보다 어두우니 <b>Otsu + THRESH_BINARY_INV</b> 로 동전을 흰색으로 만들고, <b>열기(Opening)</b>로 작은 잡티를 지웁니다. 그런데 이 마스크로 바로 컨투어를 세면… 결과가 이상합니다. 직접 확인해 봅시다.</p>` },
      { type: 'code', title: 'A-STEP 1 · Otsu 이진화 → 열기 → 바로 세어 보기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
t, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
print('Otsu 임계값:', t)

kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
opened = cv.morphologyEx(binary, cv.MORPH_OPEN, kernel, iterations=2)

contours, _ = cv.findContours(opened, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
print('바로 센 컨투어 수:', len(contours), '← 동전은 24개인데?')

view = img.copy()
cv.drawContours(view, contours, -1, (0, 0, 255), 2)
debug = np.hstack([cv.cvtColor(binary, cv.COLOR_GRAY2BGR), cv.cvtColor(opened, cv.COLOR_GRAY2BGR), view])
cv.imshow('binary | opened | contours', debug)
`, desc: '<p>동전들이 서로 살짝 닿아 있어서 마스크에서 <b>하나의 큰 덩어리</b>로 이어져 버립니다. 모폴로지를 더 세게 해도 잘 안 떨어집니다. 새로운 도구가 필요합니다.</p>' },
      { type: 'text', html: `<h3>Part A · STEP 2. 거리 변환(Distance Transform)으로 떼어 내기</h3>
<p><code>cv.distanceTransform(mask, cv.DIST_L2, 5)</code> 는 흰 픽셀마다 <b>가장 가까운 검은 픽셀(배경)까지의 거리</b>를 계산합니다.</p>
<ul>
<li>동전의 <b>가장자리</b>는 배경과 가까우니 값이 작고, <b>중심</b>은 값이 가장 큽니다.</li>
<li>동전끼리 닿은 “목” 부분은 폭이 좁아서 값이 작습니다.</li>
<li>그래서 거리 값이 <b>최댓값의 60% 이상</b>인 곳만 남기면, 목은 사라지고 <b>동전 중심부만 따로따로</b> 남습니다.</li>
</ul>
<p>결과(<code>float32</code>)를 보려면 <code>cv.normalize</code> 로 0~255 로 늘려서 표시합니다.</p>` },
      { type: 'code', title: 'A-STEP 2 · 거리 변환 → 중심부만 남기기', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('water_coins.jpg')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
_, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
opened = cv.morphologyEx(binary, cv.MORPH_OPEN, kernel, iterations=2)

dist = cv.distanceTransform(opened, cv.DIST_L2, 5)
print('거리 최댓값(대략 동전 반지름):', round(float(dist.max()), 1))
dist_view = cv.normalize(dist, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)

for ratio in [0.3, 0.6]:
    _, cores = cv.threshold(dist, ratio * dist.max(), 255, cv.THRESH_BINARY)
    cores = cores.astype(np.uint8)            # float32 → uint8 (findContours 용)
    cnts, _ = cv.findContours(cores, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    print('ratio %.1f → 조각 수 %d' % (ratio, len(cnts)))
    cv.imshow('cores ratio %.1f' % ratio, cores)

cv.imshow('distance (normalized)', dist_view)
`, desc: '<p>ratio 0.3 에서는 동전 사이의 “목”이 아직 남아 거의 한 덩어리로 이어져 있고, 0.6 에서는 동전마다 깔끔한 점 하나가 남습니다. 이 “중심부(core)” 하나가 동전 하나입니다.</p>' },
      { type: 'code', title: 'A-STEP 3 · 동전 카운터 완성: 번호 매기기', code: String.raw`
import cv2 as cv
import numpy as np

def count_coins(img, ratio=0.6, min_area=20):
    """동전을 세고 (결과 이미지, 개수, 디버그 뷰) 를 돌려준다."""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    _, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
    opened = cv.morphologyEx(binary, cv.MORPH_OPEN, kernel, iterations=2)
    dist = cv.distanceTransform(opened, cv.DIST_L2, 5)
    _, cores = cv.threshold(dist, ratio * dist.max(), 255, cv.THRESH_BINARY)
    cores = cores.astype(np.uint8)

    cnts, _ = cv.findContours(cores, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    cnts = [c for c in cnts if cv.contourArea(c) >= min_area]
    cnts = sorted(cnts, key=lambda c: cv.boundingRect(c)[1])     # 위에서 아래 순서로 번호

    result = img.copy()
    radius = int(dist.max())                   # 거리 최댓값 ≈ 동전 반지름
    for i, c in enumerate(cnts):
        M = cv.moments(c)
        cx, cy = int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])
        cv.circle(result, (cx, cy), radius, (0, 255, 0), 2)
        cv.putText(result, str(i + 1), (cx - 8, cy + 6), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
    cv.putText(result, 'coins: %d' % len(cnts), (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    dist_view = cv.normalize(dist, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
    debug = np.hstack([opened, dist_view, cores])
    return result, len(cnts), debug

img = cv.imread('water_coins.jpg')
result, n, debug = count_coins(img)
print('동전 개수:', n)
cv.imshow('coins', result)
cv.imshow('debug: opened | distance | cores', debug)
`, desc: '<p>출력이 <b>24</b> 인지, 모든 동전에 번호가 하나씩만 붙었는지 확인하세요. 이렇게 <b>기능을 함수로 감싸 두면</b> 다른 이미지나 웹캠에도 그대로 재사용할 수 있습니다.</p>' },
      { type: 'text', html: `<h3>Part A · STEP 4. 다른 방법: 허프 원 변환(HoughCircles)</h3>
<p>물체가 <b>원 모양</b>이라는 것을 안다면 3주차에 배운 <code>cv.HoughCircles</code> 로 바로 원을 찾을 수도 있습니다. 붙어 있어도 원의 “테두리 호”를 보고 찾기 때문에 분리 과정이 필요 없습니다. 대신 <b>반지름 범위(minRadius, maxRadius)</b>와 <b>원 중심 간 최소 거리(minDist)</b>를 입력에 맞게 잘 정해야 합니다.</p>` },
      { type: 'code', title: 'A-STEP 4 · HoughCircles 로 동전·캔디 세기', code: String.raw`
import cv2 as cv
import numpy as np

def hough_count(img, min_dist, min_r, max_r, p1=50, p2=20):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    gray = cv.medianBlur(gray, 5)                       # 잡음 제거가 매우 중요
    circles = cv.HoughCircles(gray, cv.HOUGH_GRADIENT, 1, min_dist,
                              param1=p1, param2=p2, minRadius=min_r, maxRadius=max_r)
    result = img.copy()
    n = 0
    if circles is not None:                             # 못 찾으면 None!
        circles = np.round(circles[0]).astype(int)
        n = len(circles)
        for (x, y, r) in circles:
            cv.circle(result, (x, y), r, (0, 255, 0), 2)
            cv.circle(result, (x, y), 2, (0, 0, 255), 3)
    cv.putText(result, 'hough: %d' % n, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
    return result, n

coins, n1 = hough_count(cv.imread('water_coins.jpg'), min_dist=35, min_r=18, max_r=28)
candy, n2 = hough_count(cv.imread('smarties.png'), min_dist=30, min_r=15, max_r=40, p2=25)
print('water_coins.jpg 허프 원 개수:', n1)
print('smarties.png   허프 원 개수:', n2, '(가장자리에 잘린 캔디 2개 제외 12개)')
cv.imshow('hough coins', coins)
cv.imshow('hough smarties', candy)
`, desc: '<p><code>param2</code>(누적 임계값)를 올리면 확실한 원만 남아 개수가 줄고, 내리면 가짜 원이 늘어납니다. 15~30 사이에서 바꿔 보세요. 반지름 범위를 실제 동전 크기(거리 변환 최댓값 ≈ 24px)에 가깝게 좁히면 어긋난 원이 줄어듭니다. <b>개수가 맞아도 원 위치가 맞는지 그림으로 꼭 확인</b>하세요.</p>' },
      { type: 'table', head: ['비교', '컨투어 + 거리 변환', 'HoughCircles'], rows: [
        ['가정', '물체가 배경과 밝기로 구분됨', '물체가 원 모양임'],
        ['붙은 물체', '거리 변환으로 분리 필요', '테두리 호로 찾아서 비교적 강함'],
        ['조절할 값', '이진화 방식, 열기 횟수, ratio', 'minDist, 반지름 범위, param1/param2'],
        ['추가 정보', '면적·모양 등 컨투어 특징 계산 가능', '중심과 반지름을 바로 얻음'],
        ['약점', '배경이 복잡하면 이진화가 어려움', '원이 아니면 못 찾음, 가짜 원 발생'],
      ] },
      { type: 'text', html: `<h3>Part B · STEP 1. 도형을 구분하는 특징(Feature)들</h3>
<p>사람은 “뾰족한 곳이 3개면 삼각형”처럼 판단합니다. 컴퓨터에게도 <b>숫자로 된 특징</b>을 주면 같은 판단을 시킬 수 있습니다.</p>` },
      { type: 'table', head: ['특징', '계산', '삼각형', '사각형', '원', '의미'], rows: [
        ['꼭짓점 수', '<code>len(approxPolyDP(c, 0.03·둘레))</code>', '3', '4', '8 이상', '모서리 개수'],
        ['원형도 (circularity)', '4π × 면적 ÷ 둘레²', '≈ 0.6', '≈ 0.78', '≈ 0.9~1.0', '1 에 가까울수록 원'],
        ['종횡비 (aspect ratio)', 'minAreaRect 긴 변 ÷ 짧은 변', '-', '정사각형 ≈ 1', '원 ≈ 1', '길쭉한 정도 (회전 무관)'],
        ['채움 비율 (extent)', '면적 ÷ minAreaRect 면적', '≈ 0.5', '≈ 1.0', '≈ 0.785', '감싸는 사각형을 채운 정도'],
        ['볼록 비율 (solidity)', '면적 ÷ convexHull 면적', '≈ 1', '≈ 1', '≈ 1', '움푹 들어간 곳이 있으면 작아짐'],
      ] },
      { type: 'warn', html: `<p><b>cv.putText 는 한글을 쓸 수 없습니다.</b> OpenCV 내장 글꼴(Hershey)에는 영문·숫자·기호만 있어서 <code>'삼각형'</code> 을 넣으면 <b>???</b> 로 깨집니다. 이미지 위 라벨은 <code>TRIANGLE</code>, <code>CIRCLE</code> 같은 영어로 쓰고, 한국어 설명은 <code>print()</code> 로 출력하세요.</p>` },
      { type: 'code', title: 'B-STEP 1 · 도형별 특징값 표 출력하기 (pic1.png)', code: String.raw`
import cv2 as cv
import numpy as np

def binarize(img):
    """밝은 배경이면 어두운 물체를, 어두운 배경이면 밝은 물체를 흰색으로."""
    v = cv.cvtColor(img, cv.COLOR_BGR2HSV)[:, :, 2]      # V = max(B, G, R) 밝기
    if v.mean() > 127:
        _, b = cv.threshold(v, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    else:
        _, b = cv.threshold(v, 50, 255, cv.THRESH_BINARY)
    return b

def features(c):
    area = cv.contourArea(c)
    peri = cv.arcLength(c, True)
    vertices = len(cv.approxPolyDP(c, 0.03 * peri, True))
    circularity = 4 * np.pi * area / (peri * peri)
    (cx, cy), (w, h), angle = cv.minAreaRect(c)
    aspect = max(w, h) / max(1.0, min(w, h))
    extent = area / max(1.0, w * h)
    solidity = area / max(1.0, cv.contourArea(cv.convexHull(c)))
    return vertices, circularity, aspect, extent, solidity

img = cv.imread('pic1.png')
mask = binarize(img)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
contours = [c for c in contours if cv.contourArea(c) >= 300]

view = img.copy()
print(' id  vert  circ  aspect  extent  solid')
for i, c in enumerate(contours):
    v, circ, asp, ext, sol = features(c)
    print('%3d  %4d  %4.2f  %6.2f  %6.2f  %5.2f' % (i, v, circ, asp, ext, sol))
    x, y, w, h = cv.boundingRect(c)
    cv.drawContours(view, [c], -1, (0, 0, 255), 2)
    cv.putText(view, str(i), (x + w // 2 - 6, y + h // 2 + 6), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 0), 2)
cv.imshow('ids', view)
`, desc: '<p>표에서 삼각형은 꼭짓점 3·채움 0.5, 사각형들은 꼭짓점 4·채움 ≈ 1.0, 얼굴 실루엣은 볼록 비율이 낮고 꼭짓점이 많은 것을 확인하세요. <b>숫자를 먼저 보고 규칙을 정하는 것</b>이 분류기 설계의 순서입니다.</p>' },
      { type: 'text', html: `<h3>Part B · STEP 2. 규칙 기반 분류기 v1 → v2</h3>
<p><b>v1</b> 은 가장 직관적인 규칙만 씁니다: 꼭짓점 3 → TRIANGLE, 꼭짓점 4 → 종횡비로 SQUARE/RECTANGLE, 원형도 &gt; 0.8 → CIRCLE, 나머지 → OTHER.</p>
<p><code>detect_blob.png</code> 에 적용하면 <b>가늘고 긴 타원</b>이 꼭짓점 4개로 근사되어 RECTANGLE 로, <b>이어 붙은 사각형 3개</b>도 RECTANGLE 로 틀립니다. 그래서 <b>v2</b> 에서는 “사각형이면 감싸는 사각형을 거의 꽉 채운다(extent &gt; 0.85)”, “원·타원은 움푹한 곳이 없다(solidity &gt; 0.96)” 조건을 추가합니다. 이렇게 <b>실패 사례를 보고 규칙을 고치는 과정</b>이 프로젝트의 실제 모습입니다.</p>` },
      { type: 'code', title: 'B-STEP 2 · 분류기 v1 의 실패 사례 확인', code: String.raw`
import cv2 as cv
import numpy as np

def binarize(img):
    v = cv.cvtColor(img, cv.COLOR_BGR2HSV)[:, :, 2]
    if v.mean() > 127:
        _, b = cv.threshold(v, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    else:
        _, b = cv.threshold(v, 50, 255, cv.THRESH_BINARY)
    return b

def classify_v1(c):
    area = cv.contourArea(c)
    peri = cv.arcLength(c, True)
    vertices = len(cv.approxPolyDP(c, 0.03 * peri, True))
    circularity = 4 * np.pi * area / (peri * peri)
    (cx, cy), (w, h), angle = cv.minAreaRect(c)
    aspect = max(w, h) / max(1.0, min(w, h))
    if vertices == 3:
        return 'TRIANGLE'
    if vertices == 4:
        return 'SQUARE' if aspect < 1.15 else 'RECTANGLE'
    if circularity > 0.8:
        return 'CIRCLE'
    return 'OTHER'

img = cv.imread('detect_blob.png')
contours, _ = cv.findContours(binarize(img), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
view = img.copy()
for c in contours:
    if cv.contourArea(c) < 300:
        continue
    label = classify_v1(c)
    x, y, w, h = cv.boundingRect(c)
    cv.drawContours(view, [c], -1, (255, 255, 255), 2)
    cv.putText(view, label, (x, y + h // 2), cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
cv.imshow('classifier v1', view)
print('가운데 가로로 긴 타원, 맨 아래 이어진 사각형 3개의 라벨을 확인하세요.')
`, desc: '<p>틀린 라벨을 찾았나요? 길쭉한 타원 두 개(파란 세로 타원, 초록 가로 타원)가 꼭짓점 4개로 근사되어 RECTANGLE 이 되고, 맨 아래 이어 붙은 사각형 3개도 RECTANGLE 이 됩니다. <b>꼭짓점 수만으로는 부족</b>하다는 뜻입니다.</p>' },
      { type: 'code', title: 'B-STEP 3 · 분류기 v2 완성 + 종류별 개수 요약', code: String.raw`
import cv2 as cv
import numpy as np

def binarize(img):
    v = cv.cvtColor(img, cv.COLOR_BGR2HSV)[:, :, 2]
    if v.mean() > 127:
        _, b = cv.threshold(v, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    else:
        _, b = cv.threshold(v, 50, 255, cv.THRESH_BINARY)
    return b

def classify(c):
    area = cv.contourArea(c)
    peri = cv.arcLength(c, True)
    vertices = len(cv.approxPolyDP(c, 0.03 * peri, True))
    circularity = 4 * np.pi * area / (peri * peri)
    (cx, cy), (w, h), angle = cv.minAreaRect(c)
    aspect = max(w, h) / max(1.0, min(w, h))
    extent = area / max(1.0, w * h)
    solidity = area / max(1.0, cv.contourArea(cv.convexHull(c)))

    if vertices == 3:
        return 'TRIANGLE'
    if vertices == 4 and extent > 0.85:                 # 사각형은 감싸는 사각형을 꽉 채움
        return 'SQUARE' if aspect < 1.15 else 'RECTANGLE'
    if solidity > 0.96 and circularity > 0.8:           # 매끈하고 둥글다
        return 'CIRCLE'
    if solidity > 0.96 and 0.70 < extent < 0.85:        # 매끈하고 채움 비율이 π/4 근처
        return 'ELLIPSE'
    return 'OTHER'

COLORS = {'TRIANGLE': (0, 255, 255), 'SQUARE': (255, 0, 255), 'RECTANGLE': (255, 128, 0),
          'CIRCLE': (0, 0, 255), 'ELLIPSE': (0, 128, 255), 'OTHER': (180, 180, 180)}
KOREAN = {'TRIANGLE': '삼각형', 'SQUARE': '정사각형', 'RECTANGLE': '직사각형',
          'CIRCLE': '원', 'ELLIPSE': '타원', 'OTHER': '기타'}

def analyze_shapes(img, min_area=300):
    contours, _ = cv.findContours(binarize(img), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    view = img.copy()
    counts = {}
    for c in contours:
        if cv.contourArea(c) < min_area:
            continue
        label = classify(c)
        counts[label] = counts.get(label, 0) + 1
        x, y, w, h = cv.boundingRect(c)
        cv.drawContours(view, [c], -1, COLORS[label], 3)
        cv.putText(view, label, (x, y + h // 2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 3)
        cv.putText(view, label, (x, y + h // 2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
    return view, counts

for name in ['detect_blob.png', 'pic1.png']:
    view, counts = analyze_shapes(cv.imread(name))
    print('[%s]' % name, ', '.join('%s %d개' % (KOREAN[k], v) for k, v in counts.items()))
    cv.imshow('shapes ' + name, view)
`, desc: '<p>흰 테두리 + 검은 글씨를 겹쳐 쓰면 어떤 배경에서도 라벨이 잘 보입니다. 동그라미 링과 속이 빈 사각형은 바깥 컨투어만 보므로 CIRCLE, SQUARE 로 분류됩니다. 붙어 있는 원 무리, 얼굴, 물음표는 OTHER 입니다.</p>' },
      { type: 'checklist', title: '도전 과제', items: [
        '동전 카운터를 process(frame) 으로 바꾸고 ratio 를 트랙바로 조절하기',
        '동전 크기(면적)로 큰 동전/작은 동전을 구분해 금액 합계 계산하기 (직접 찍은 사진)',
        '도형 분류 결과에 색깔 이름(GREEN, BLUE…)까지 붙이기 — 컨투어 내부 평균 색을 HSV 로 판단',
        '붙어 있는 원 무리(OTHER)에 거리 변환을 적용해 원 개수 세기',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 동전 카운터를 트랙바로 튜닝하기',
        desc: `<p>A-STEP 3 의 동전 카운터를 <code>process(frame)</code> 으로 바꾸고, <code>ratio x100</code>(10~90, 기본 60) 트랙바로 거리 변환 임계 비율을 조절하게 만드세요. 입력을 <code>water_coins.jpg</code> 로 두고 비율에 따라 개수가 어떻게 바뀌는지 관찰해 “안정적으로 24개가 나오는 범위”를 찾아 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'coins'
def nothing(x):
    pass
cv.namedWindow(WIN)
# TODO: 'ratio x100' 트랙바 만들기 (기본 60, 최대 90)

def count_coins(img, ratio=0.6, min_area=20):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    _, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
    opened = cv.morphologyEx(binary, cv.MORPH_OPEN, kernel, iterations=2)
    dist = cv.distanceTransform(opened, cv.DIST_L2, 5)
    _, cores = cv.threshold(dist, ratio * dist.max(), 255, cv.THRESH_BINARY)
    cores = cores.astype(np.uint8)
    cnts, _ = cv.findContours(cores, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    cnts = [c for c in cnts if cv.contourArea(c) >= min_area]
    result = img.copy()
    for c in cnts:
        (x, y), r = cv.minEnclosingCircle(c)
        cv.circle(result, (int(x), int(y)), int(r) + 3, (0, 255, 0), 2)
    return result, len(cnts), cores

def process(frame):
    ratio = 0.6    # TODO: 트랙바 값 / 100 으로 바꾸기 (최소 0.1)
    result, n, cores = count_coins(frame, ratio)
    # TODO: 'ratio 0.60  coins 24' 처럼 화면에 표시하기
    return result, cores
`,
        hint: `<p><code>ratio = max(10, cv.getTrackbarPos('ratio x100', WIN)) / 100.0</code>, 표시는 <code>'ratio %.2f  coins %d' % (ratio, n)</code>. 비율이 너무 낮으면 붙은 동전이 한 조각, 너무 높으면 작은 코어가 사라질 수 있습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'coins'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('ratio x100', WIN, 60, 90, nothing)

def count_coins(img, ratio=0.6, min_area=20):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    _, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
    opened = cv.morphologyEx(binary, cv.MORPH_OPEN, kernel, iterations=2)
    dist = cv.distanceTransform(opened, cv.DIST_L2, 5)
    _, cores = cv.threshold(dist, ratio * dist.max(), 255, cv.THRESH_BINARY)
    cores = cores.astype(np.uint8)
    cnts, _ = cv.findContours(cores, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    cnts = [c for c in cnts if cv.contourArea(c) >= min_area]
    result = img.copy()
    for c in cnts:
        (x, y), r = cv.minEnclosingCircle(c)
        cv.circle(result, (int(x), int(y)), int(r) + 3, (0, 255, 0), 2)
    return result, len(cnts), cores

def process(frame):
    ratio = max(10, cv.getTrackbarPos('ratio x100', WIN)) / 100.0
    result, n, cores = count_coins(frame, ratio)
    cv.putText(result, 'ratio %.2f  coins %d' % (ratio, n), (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    return result, cores
`,
      },
      {
        title: '실습 2 · 도형별로 칠하고 요약 막대 그리기',
        desc: `<p>B-STEP 3 의 분류기를 이용해 <code>detect_blob.png</code> 의 도형 내부를 종류별 색으로 <b>꽉 채워</b> 칠하고(<code>thickness=-1</code>), 이미지 맨 위에 검은 띠(높이 40)를 붙여 <code>CIRCLE:6 SQUARE:4 ...</code> 형태의 요약을 영어로 써 넣으세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def binarize(img):
    v = cv.cvtColor(img, cv.COLOR_BGR2HSV)[:, :, 2]
    if v.mean() > 127:
        _, b = cv.threshold(v, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    else:
        _, b = cv.threshold(v, 50, 255, cv.THRESH_BINARY)
    return b

def classify(c):
    area = cv.contourArea(c)
    peri = cv.arcLength(c, True)
    vertices = len(cv.approxPolyDP(c, 0.03 * peri, True))
    circularity = 4 * np.pi * area / (peri * peri)
    (cx, cy), (w, h), angle = cv.minAreaRect(c)
    aspect = max(w, h) / max(1.0, min(w, h))
    extent = area / max(1.0, w * h)
    solidity = area / max(1.0, cv.contourArea(cv.convexHull(c)))
    if vertices == 3:
        return 'TRIANGLE'
    if vertices == 4 and extent > 0.85:
        return 'SQUARE' if aspect < 1.15 else 'RECTANGLE'
    if solidity > 0.96 and circularity > 0.8:
        return 'CIRCLE'
    if solidity > 0.96 and 0.70 < extent < 0.85:
        return 'ELLIPSE'
    return 'OTHER'

COLORS = {'TRIANGLE': (0, 255, 255), 'SQUARE': (255, 0, 255), 'RECTANGLE': (255, 128, 0),
          'CIRCLE': (0, 0, 255), 'ELLIPSE': (0, 128, 255), 'OTHER': (180, 180, 180)}

img = cv.imread('detect_blob.png')
contours, _ = cv.findContours(binarize(img), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
view = img.copy()
counts = {}
for c in contours:
    if cv.contourArea(c) < 300:
        continue
    label = classify(c)
    counts[label] = counts.get(label, 0) + 1
    # TODO: 두께 -1 로 도형 내부를 COLORS[label] 색으로 채우세요
    cv.drawContours(view, [c], -1, COLORS[label], 2)

summary = ' '.join('%s:%d' % (k, v) for k, v in counts.items())
print(summary)
# TODO: 높이 40, 너비 view 와 같은 검은 띠(np.zeros)를 만들고 summary 를 흰 글씨로 쓰기
# TODO: np.vstack 으로 띠를 view 위에 붙이기
cv.imshow('filled shapes', view)
`,
        hint: `<p><code>cv.drawContours(view, [c], -1, COLORS[label], -1)</code>. 띠: <code>bar = np.zeros((40, view.shape[1], 3), np.uint8)</code> → <code>cv.putText(bar, summary, (5, 27), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)</code> → <code>np.vstack([bar, view])</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def binarize(img):
    v = cv.cvtColor(img, cv.COLOR_BGR2HSV)[:, :, 2]
    if v.mean() > 127:
        _, b = cv.threshold(v, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
    else:
        _, b = cv.threshold(v, 50, 255, cv.THRESH_BINARY)
    return b

def classify(c):
    area = cv.contourArea(c)
    peri = cv.arcLength(c, True)
    vertices = len(cv.approxPolyDP(c, 0.03 * peri, True))
    circularity = 4 * np.pi * area / (peri * peri)
    (cx, cy), (w, h), angle = cv.minAreaRect(c)
    aspect = max(w, h) / max(1.0, min(w, h))
    extent = area / max(1.0, w * h)
    solidity = area / max(1.0, cv.contourArea(cv.convexHull(c)))
    if vertices == 3:
        return 'TRIANGLE'
    if vertices == 4 and extent > 0.85:
        return 'SQUARE' if aspect < 1.15 else 'RECTANGLE'
    if solidity > 0.96 and circularity > 0.8:
        return 'CIRCLE'
    if solidity > 0.96 and 0.70 < extent < 0.85:
        return 'ELLIPSE'
    return 'OTHER'

COLORS = {'TRIANGLE': (0, 255, 255), 'SQUARE': (255, 0, 255), 'RECTANGLE': (255, 128, 0),
          'CIRCLE': (0, 0, 255), 'ELLIPSE': (0, 128, 255), 'OTHER': (180, 180, 180)}

img = cv.imread('detect_blob.png')
contours, _ = cv.findContours(binarize(img), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
view = img.copy()
counts = {}
for c in contours:
    if cv.contourArea(c) < 300:
        continue
    label = classify(c)
    counts[label] = counts.get(label, 0) + 1
    cv.drawContours(view, [c], -1, COLORS[label], -1)

summary = ' '.join('%s:%d' % (k, v) for k, v in counts.items())
print(summary)
bar = np.zeros((40, view.shape[1], 3), np.uint8)
cv.putText(bar, summary, (5, 27), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
view = np.vstack([bar, view])
cv.imshow('filled shapes', view)
`,
      },
    ],
    quiz: [
      { q: 'water_coins.jpg 에서 Otsu + 열기 결과로 바로 컨투어를 세면 개수가 틀리는 이유는?', options: ['맞닿은 동전들이 마스크에서 하나로 이어져 한 덩어리로 세어져서', 'Otsu 임계값이 음수라서', '컨투어는 원을 찾을 수 없어서', '이미지가 컬러라서'], answer: 0, explain: '동전끼리 닿은 부분도 흰색이라 연결된 영역 전체가 컨투어 하나가 됩니다. 거리 변환으로 중심부만 남겨 분리합니다.' },
      { q: '거리 변환 결과를 “최댓값의 60% 이상”으로 임계처리하면 남는 것은?', options: ['동전의 테두리', '배경', '각 동전의 중심부(서로 떨어진 작은 조각)', '동전 사이의 틈'], answer: 2, explain: '거리 값은 물체 중심에서 크고 가장자리·연결부(목)에서 작습니다. 높은 값만 남기면 동전마다 떨어진 중심부가 남습니다.' },
      { q: '원형도 4π×면적÷둘레² 의 값이 1 에 가장 가까운 도형은?', options: ['가늘고 긴 직사각형', '정삼각형', '별 모양', '원'], answer: 3, explain: '같은 둘레로 가장 넓은 면적을 가진 도형이 원이며, 이때 원형도가 1 입니다. 길쭉하거나 뾰족할수록 작아집니다.' },
      { q: '도형 라벨을 cv.putText 로 이미지에 쓸 때 영어(CIRCLE 등)를 쓰는 이유는?', options: ['영어가 더 짧아서', 'OpenCV 기본 Hershey 글꼴에 한글이 없어 ??? 로 깨지기 때문에', '한글은 print 로도 출력할 수 없어서', 'putText 는 대문자만 지원해서'], answer: 1, explain: 'cv.putText 의 내장 글꼴은 ASCII 문자만 그릴 수 있습니다. 한국어 설명은 print() 로 콘솔에 출력합니다.' },
    ],
  },

  // =====================================================================
  // w4-5 가이드 프로젝트 ③ 웹캠 가상 페인터
  // =====================================================================
  {
    id: 'w4-5',
    summary: '색깔 있는 물체(펜 뚜껑, 병뚜껑, 색종이)를 웹캠 앞에서 움직이면 허공에 그림이 그려지는 “가상 페인터”를 만듭니다. HSV 색 범위 보정 → 마스크 정리 → 가장 큰 컨투어의 무게중심 추적 → 프레임 사이에도 유지되는 캔버스에 선 그리기 → 화면 합성 순서로 완성합니다.',
    goals: [
      'HSV 트랙바로 마커 색의 범위를 보정(calibration)하고 마스크를 만들 수 있다',
      '모폴로지로 마스크를 정리하고 가장 큰 컨투어의 무게중심을 구할 수 있다',
      'global 변수로 프레임 사이에 유지되는 캔버스를 만들고 이전 점과 현재 점을 선으로 이을 수 있다',
      '마스크를 이용해 캔버스를 프레임 위에 자연스럽게 합성하고, 화면 버튼으로 색 선택·지우기를 구현할 수 있다',
    ],
    schedule: [['도입 · 완성 모습', 5], ['STEP 1 색 보정', 10], ['STEP 2 마커 추적', 10], ['STEP 3~5 캔버스 · 합성 · 버튼', 15], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개: 허공에 그림 그리기</h3>
<p>웹캠 앞에서 <b>색깔 있는 물체(마커)</b>를 움직이면 그 궤적이 화면에 선으로 남는 프로그램입니다. 파이프라인은 다음과 같습니다.</p>
<ol>
<li><b>입력</b>: 웹캠 프레임 (좌우 반전 선택)</li>
<li><b>전처리·분할</b>: BGR → HSV → <code>inRange</code> 로 마커 색만 흰색인 마스크 → 열기/닫기로 정리</li>
<li><b>분석</b>: 가장 큰 컨투어 → <code>moments</code> 로 무게중심 (펜 끝 위치)</li>
<li><b>출력</b>: 이전 점 → 현재 점 선을 <b>캔버스</b>에 그림 → 캔버스를 프레임에 합성 → 상단 색 버튼 표시</li>
</ol>
<p>📷 오른쪽 패널에서 입력 소스를 <b>웹캠</b>으로 바꾸세요. 웹캠이 없다면 두 가지 방법이 있습니다.</p>
<ul>
<li>🎞️ <b>동영상 <code>cup.mp4</code></b>(손으로 검은 컵을 움직이는 영상)를 입력 소스로 고르고, 트랙바를 <b>H min 0, H max 179, S min 0, V min 0, V max 60</b> 으로 맞추면 “어두운 물체 = 컵”이 마커가 되어 컵의 궤적이 그려집니다.</li>
<li>🖼️ <code>smarties.png</code> 를 고르면 파란 캔디가 마커가 됩니다 (정지 이미지라 선 대신 점이 찍힙니다).</li>
</ul>` },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        '트랙바로 마커 색만 흰색으로 남는 마스크를 만들 수 있다 (배경·피부가 섞이지 않음)',
        '마커 중심에 원이 표시되고 마커를 움직이면 따라간다',
        '마커를 움직이면 선이 남고, 마커가 사라지면 선이 끊긴다 (엉뚱한 곳과 이어지지 않음)',
        '화면 위쪽 버튼에 마커를 가져가면 펜 색이 바뀌고 CLEAR 로 전체가 지워진다',
        '정지 이미지 입력에서도 오류 없이 동작한다',
      ] },
      { type: 'text', html: `<h3>STEP 1. HSV 색 보정(Calibration)</h3>
<p>조명·카메라마다 같은 물체도 색이 조금씩 다르게 찍힙니다. 그래서 코드에 범위를 박아 두지 말고 <b>트랙바로 직접 맞추는 단계</b>를 먼저 만듭니다.</p>
<ul>
<li><b>H(색상)</b> 범위를 먼저 좁힌다: 빨강 0~10 또는 170~179, 초록 40~80, 파랑 100~130 근처</li>
<li><b>S min</b> 을 올린다(100 이상): 흰 벽·회색 책상·피부처럼 채도가 낮은 것이 빠짐</li>
<li><b>V min</b> 을 적당히 올린다: 어두운 그림자가 빠짐 (반대로 <b>검은 물체</b>를 추적할 때는 V max 를 60 정도로 낮춤)</li>
<li>목표: <b>mask 창에서 마커만 흰색</b>, 나머지는 검은색</li>
</ul>` },
      { type: 'code', title: 'STEP 1 · HSV 트랙바로 마커 색 보정하기', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'hsv'
def nothing(x):
    pass
cv.namedWindow(WIN)
# 기본값: 파란색 (smarties.png 의 파란 캔디)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179),
                             ('S min', 120, 255), ('S max', 255, 255),
                             ('V min', 70, 255), ('V max', 255, 255)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)

def read_range():
    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), cv.getTrackbarPos('S max', WIN), cv.getTrackbarPos('V max', WIN)])
    return lower, upper

def process(frame):
    lower, upper = read_range()
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.inRange(hsv, lower, upper)
    picked = cv.bitwise_and(frame, frame, mask=mask)       # 고른 색만 컬러로 보기
    ratio = cv.countNonZero(mask) / mask.size * 100
    cv.putText(picked, 'mask %.1f%%' % ratio, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return picked, mask

# 내 마커의 HSV 값이 궁금하면: BGR 한 픽셀을 HSV 로 바꿔 보기
bgr_pixel = np.uint8([[[200, 80, 20]]])        # 예: 파란색 (B, G, R)
print('BGR (200, 80, 20) → HSV', cv.cvtColor(bgr_pixel, cv.COLOR_BGR2HSV)[0, 0])
`, desc: '<p>입력을 <code>smarties.png</code> 로 두면 파란 캔디 3개만 남습니다. H 범위를 40~80 으로 바꾸면 초록 캔디가 잡힙니다. 결과 창 위에 마우스를 올리면 BGR 값이 보이니, 위의 변환 코드로 HSV 를 확인해 범위를 정하세요. <b>찾은 값은 메모해 두었다가 STEP 5 의 기본값으로 씁니다.</b></p>' },
      { type: 'tip', html: `<p><b>마커 고르기 팁</b>: 형광 초록·파랑처럼 <b>채도가 높고 주변에 없는 색</b>이 가장 좋습니다. 빨강·주황은 피부와 H 가 비슷해 섞이기 쉽습니다. 손바닥 크기의 색종이보다 <b>엄지손가락 크기</b> 물체가 추적이 안정적입니다.</p>` },
      { type: 'text', html: `<h3>STEP 2. 마스크 정리 → 가장 큰 컨투어 → 무게중심</h3>
<p><code>inRange</code> 마스크에는 작은 점 잡음과 구멍이 섞입니다.</p>
<ul>
<li><b>열기(Open)</b>: 작은 흰 점 잡음 제거 → <b>닫기(Close)</b>: 마커 안의 작은 구멍 메우기</li>
<li>컨투어 중 <b>가장 큰 것 하나</b>만 마커로 봅니다: <code>max(contours, key=cv.contourArea)</code></li>
<li>그것도 너무 작으면(<code>min_area</code> 미만) “마커 없음”으로 처리합니다.</li>
<li>무게중심: <code>M = cv.moments(c)</code> → <code>cx = M['m10'] / M['m00']</code>, <code>cy = M['m01'] / M['m00']</code></li>
</ul>` },
      { type: 'code', title: 'STEP 2 · 마커 위치 추적하기', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'hsv'
def nothing(x):
    pass
cv.namedWindow(WIN)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179), ('S min', 120, 255),
                             ('V min', 70, 255), ('V max', 255, 255), ('min area', 300, 3000)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)

KERNEL = np.ones((5, 5), np.uint8)

def find_marker(frame, lower, upper, min_area):
    """마커의 중심 (x, y) 와 정리된 마스크를 돌려준다. 없으면 (None, mask)."""
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.inRange(hsv, lower, upper)
    mask = cv.morphologyEx(mask, cv.MORPH_OPEN, KERNEL)    # 점 잡음 제거
    mask = cv.morphologyEx(mask, cv.MORPH_CLOSE, KERNEL)   # 구멍 메우기
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return None, mask
    c = max(contours, key=cv.contourArea)                  # 가장 큰 것 하나만
    if cv.contourArea(c) < min_area:
        return None, mask
    M = cv.moments(c)
    return (int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])), mask

def process(frame):
    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), 255, cv.getTrackbarPos('V max', WIN)])
    min_area = cv.getTrackbarPos('min area', WIN)
    point, mask = find_marker(frame, lower, upper, min_area)
    view = frame.copy()
    if point is None:
        cv.putText(view, 'NO MARKER', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    else:
        cv.circle(view, point, 12, (0, 255, 255), 3)
        cv.putText(view, str(point), (point[0] + 15, point[1]), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return view, mask

# 정지 이미지로 확인
res, m = process(cv.imread('smarties.png'))
cv.imshow('smarties test', res)
`, desc: '<p>파란 캔디 3개 중 가장 큰 하나에만 노란 원이 그려집니다. 웹캠에서는 마커를 움직이며 원이 잘 따라오는지, 마커를 숨기면 NO MARKER 가 뜨는지 확인하세요.</p>' },
      { type: 'text', html: `<h3>STEP 3. 프레임이 바뀌어도 남아 있는 캔버스</h3>
<p><code>process(frame)</code> 은 매 프레임 새로 호출되므로, 함수 안에서 만든 변수는 다음 프레임에 사라집니다. 그림이 남으려면 함수 <b>바깥</b>에 캔버스를 두고 <code>global</code> 로 수정해야 합니다.</p>
<ul>
<li><code>canvas</code>: 프레임과 같은 크기의 검은 이미지. 선은 여기에 그린다.</li>
<li><code>prev</code>: 직전 프레임의 마커 위치. <code>cv.line(canvas, prev, point, color, 두께)</code> 로 이으면 빠르게 움직여도 선이 끊기지 않는다.</li>
<li>마커가 안 보이면 <code>prev = None</code> 으로 <b>펜을 든다</b> → 다시 나타난 곳과 엉뚱하게 이어지지 않음</li>
<li>입력 크기가 바뀌면(이미지 ↔ 웹캠) <code>canvas.shape != frame.shape</code> 이므로 새로 만든다 → 크기 불일치 오류 방지</li>
</ul>` },
      { type: 'code', title: 'STEP 3 · global 캔버스에 궤적 그리기', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'painter'
def nothing(x):
    pass
cv.namedWindow(WIN)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179), ('S min', 120, 255), ('V min', 70, 255), ('V max', 255, 255)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)

KERNEL = np.ones((5, 5), np.uint8)
canvas = None      # 프레임 사이에 유지되는 그림판
prev = None        # 직전 마커 위치

def find_marker(frame, lower, upper, min_area=300):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.inRange(hsv, lower, upper)
    mask = cv.morphologyEx(mask, cv.MORPH_OPEN, KERNEL)
    mask = cv.morphologyEx(mask, cv.MORPH_CLOSE, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return None, mask
    c = max(contours, key=cv.contourArea)
    if cv.contourArea(c) < min_area:
        return None, mask
    M = cv.moments(c)
    return (int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])), mask

def process(frame):
    global canvas, prev
    if canvas is None or canvas.shape != frame.shape:     # 처음이거나 입력 크기가 바뀜
        canvas = np.zeros_like(frame)
        prev = None

    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), 255, cv.getTrackbarPos('V max', WIN)])
    point, mask = find_marker(frame, lower, upper)

    if point is not None:
        if prev is not None:
            cv.line(canvas, prev, point, (0, 0, 255), 8)      # 이전 점 → 현재 점
        else:
            cv.circle(canvas, point, 4, (0, 0, 255), -1)      # 첫 점
        prev = point
    else:
        prev = None                                          # 펜 들기

    out = cv.add(frame, canvas)          # 가장 단순한 합성 (STEP 4 에서 개선)
    return out, canvas, mask
`, desc: '<p>결과는 3개 창: 합성 화면, 캔버스만, 마스크. 웹캠에서 마커를 움직여 선이 그려지는지 확인하세요. 그런데 밝은 배경 위의 빨간 선이 <b>하얗게 날아가는</b> 문제가 보일 겁니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. 합성 개선: 더하기(add) 대신 마스크 합성</h3>
<p><code>cv.add(frame, canvas)</code> 는 픽셀 값을 <b>더하기</b> 때문에 밝은 곳(예: 흰 벽 (230, 230, 230))에 빨강 (0, 0, 255)을 더하면 (230, 230, 255) 가 되어 거의 흰색입니다. 1주차에 배운 <b>비트 연산 로고 합성</b>과 같은 방법을 씁니다.</p>
<ol>
<li>캔버스를 흑백으로 바꿔 <b>잉크가 있는 곳 = 흰색</b>인 마스크 <code>ink</code> 를 만든다</li>
<li>프레임에서 잉크 자리를 검게 뚫는다: <code>bitwise_and(frame, frame, mask=bitwise_not(ink))</code></li>
<li>뚫린 자리에 캔버스를 더한다: <code>cv.add(hole, canvas)</code> → 원래 색 그대로!</li>
</ol>` },
      { type: 'code', title: 'STEP 4 · add 합성 vs 마스크 합성 비교 (정지 이미지)', code: String.raw`
import cv2 as cv
import numpy as np

def overlay(frame, canvas):
    """캔버스에 그린 부분만 프레임 위에 원래 색으로 덮어쓴다."""
    gray = cv.cvtColor(canvas, cv.COLOR_BGR2GRAY)
    _, ink = cv.threshold(gray, 0, 255, cv.THRESH_BINARY)      # 0 보다 크면 잉크
    hole = cv.bitwise_and(frame, frame, mask=cv.bitwise_not(ink))
    return cv.add(hole, canvas)

frame = cv.imread('stuff.jpg')
canvas = np.zeros_like(frame)
# 테스트용 낙서
pts = [(100, 400), (200, 330), (300, 380), (420, 300), (560, 360)]
for p, q in zip(pts[:-1], pts[1:]):
    cv.line(canvas, p, q, (0, 0, 255), 10)
cv.circle(canvas, (500, 120), 40, (0, 255, 0), 8)
cv.putText(canvas, 'HELLO', (60, 200), cv.FONT_HERSHEY_SIMPLEX, 2, (255, 0, 0), 6)

added = cv.add(frame, canvas)
masked = overlay(frame, canvas)
cv.putText(added, 'cv.add', (10, 40), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv.putText(masked, 'mask overlay', (10, 40), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv.imshow('add | mask overlay', np.hstack([added, masked]))
`, desc: '<p>왼쪽은 선 색이 밝게 날아가 흐릿하고(연한 책상 위의 초록 원, 파란 글자), 오른쪽은 원래 색 그대로 선명합니다. 이 방식은 나중에 <b>검은색(0,0,0)으로 그리면 지우개</b>가 된다는 장점도 있습니다.</p>' },
      { type: 'text', html: `<h3>STEP 5. 화면 버튼과 좌우 반전 — 완성</h3>
<p>키보드 입력(<code>waitKey</code>)을 쓸 수 없으므로 <b>화면 자체를 버튼</b>으로 씁니다. 프레임 위쪽 60픽셀을 4칸으로 나눠 RED / GREEN / BLUE / CLEAR 버튼을 그리고, 마커 중심이 버튼 영역에 들어가면 해당 동작을 합니다. 버튼 영역에서는 그리지 않고 펜을 듭니다.</p>
<p>웹캠 화면은 거울처럼 <b>좌우가 뒤집혀야</b> 손을 움직이는 방향과 화면 방향이 같아 그리기 편합니다. 패널의 <code>mirror</code> 스위치(0/1 트랙바)로 켜고 끕니다. 반전은 <b>맨 처음</b>에 해야 버튼 위치와 마커 위치가 일치합니다.</p>` },
      { type: 'code', title: 'STEP 5 · 웹캠 가상 페인터 (완성)', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'painter'
def nothing(x):
    pass
cv.namedWindow(WIN)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179), ('S min', 120, 255),
                             ('V min', 70, 255), ('V max', 255, 255), ('min area', 300, 3000), ('mirror', 1, 1)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)

KERNEL = np.ones((5, 5), np.uint8)
BAR_H = 60
BUTTONS = [('RED', (0, 0, 255)), ('GREEN', (0, 200, 0)), ('BLUE', (255, 0, 0)), ('CLEAR', None)]

canvas = None
prev = None
pen_color = (0, 0, 255)

def find_marker(frame, lower, upper, min_area):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.inRange(hsv, lower, upper)
    mask = cv.morphologyEx(mask, cv.MORPH_OPEN, KERNEL)
    mask = cv.morphologyEx(mask, cv.MORPH_CLOSE, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return None, mask
    c = max(contours, key=cv.contourArea)
    if cv.contourArea(c) < min_area:
        return None, mask
    M = cv.moments(c)
    return (int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])), mask

def overlay(frame, canvas):
    gray = cv.cvtColor(canvas, cv.COLOR_BGR2GRAY)
    _, ink = cv.threshold(gray, 0, 255, cv.THRESH_BINARY)
    hole = cv.bitwise_and(frame, frame, mask=cv.bitwise_not(ink))
    return cv.add(hole, canvas)

def draw_buttons(img):
    w = img.shape[1]
    bw = w // len(BUTTONS)
    for i, (name, color) in enumerate(BUTTONS):
        x1, x2 = i * bw, (i + 1) * bw
        fill = color if color is not None else (60, 60, 60)
        cv.rectangle(img, (x1 + 4, 4), (x2 - 4, BAR_H - 4), fill, -1)
        if color == pen_color:                                   # 선택된 색 강조
            cv.rectangle(img, (x1 + 4, 4), (x2 - 4, BAR_H - 4), (255, 255, 255), 3)
        cv.putText(img, name, (x1 + 12, 40), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

def button_at(point, width):
    """점이 버튼 영역이면 버튼 번호, 아니면 -1"""
    if point[1] >= BAR_H:
        return -1
    return min(point[0] // (width // len(BUTTONS)), len(BUTTONS) - 1)

def process(frame):
    global canvas, prev, pen_color
    if cv.getTrackbarPos('mirror', WIN) == 1:
        frame = cv.flip(frame, 1)                                # ① 가장 먼저 좌우 반전
    if canvas is None or canvas.shape != frame.shape:
        canvas = np.zeros_like(frame)
        prev = None

    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), 255, cv.getTrackbarPos('V max', WIN)])
    point, mask = find_marker(frame, lower, upper, cv.getTrackbarPos('min area', WIN))

    if point is None:
        prev = None                                              # 펜 들기
    else:
        b = button_at(point, frame.shape[1])
        if b >= 0:                                               # 버튼 영역: 그리지 않음
            name, color = BUTTONS[b]
            if color is None:
                canvas[:] = 0                                    # CLEAR
            else:
                pen_color = color
            prev = None
        else:
            if prev is not None:
                cv.line(canvas, prev, point, pen_color, 8)
            else:
                cv.circle(canvas, point, 4, pen_color, -1)      # 첫 점
            prev = point

    out = overlay(frame, canvas)
    draw_buttons(out)
    if point is not None:
        cv.circle(out, point, 10, (0, 255, 255), 2)             # 현재 펜 위치
    return out, mask
`, desc: '<p>📷 웹캠으로 바꾼 뒤 트랙바로 내 마커 색을 맞추고(STEP 1 에서 메모한 값), 위쪽 버튼으로 색을 고르며 그려 보세요. <code>result 2</code>(마스크)를 보면서 마커만 흰색인지 계속 확인하는 것이 핵심입니다.</p>' },
      { type: 'warn', html: `<p><b>자주 나는 오류</b></p>
<ul>
<li><code>UnboundLocalError: local variable 'canvas'…</code> → <code>process</code> 첫 줄에 <code>global canvas, prev, pen_color</code> 를 빠뜨림</li>
<li>입력을 이미지 ↔ 웹캠으로 바꿨더니 크기 오류 → <code>canvas.shape != frame.shape</code> 검사로 새로 만들기</li>
<li><code>canvas = np.zeros_like(frame)</code> 로 지우기를 하면 global 선언이 필요합니다. <code>canvas[:] = 0</code> 은 제자리 수정이라 더 안전합니다.</li>
</ul>` },
      { type: 'checklist', title: '도전 과제', items: [
        '붓 굵기 트랙바와 지우개(ERASE) 버튼 추가하기 (실습 1)',
        '너무 멀리 순간이동한 점은 잡음으로 보고 선을 잇지 않기 (실습 2)',
        '최근 5개 점의 평균 위치로 그려서 손떨림 줄이기',
        'SAVE 버튼: 캔버스를 합성한 화면을 cv.imwrite 로 저장 (한 번만 저장되게 플래그 사용)',
        '마커 두 개(두 가지 색)를 동시에 추적해 2인용 그림판 만들기',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 붓 굵기 트랙바와 지우개 버튼',
        desc: `<p>STEP 5 페인터를 간단히 줄인 코드입니다. <b>(1)</b> <code>brush</code> 트랙바(1~40, 기본 8)로 선 굵기를 조절하고, <b>(2)</b> 버튼 목록에 <code>ERASE</code> 를 추가해 선택하면 <b>검은색 (0, 0, 0)</b> 으로 굵게(굵기 × 3) 그려 지우개처럼 동작하게 하세요. 마스크 합성 덕분에 검은색은 “잉크 없음”이 됩니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'painter'
def nothing(x):
    pass
cv.namedWindow(WIN)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179), ('S min', 120, 255), ('V min', 70, 255), ('V max', 255, 255)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)
# TODO: 'brush' 트랙바 (기본 8, 최대 40)

KERNEL = np.ones((5, 5), np.uint8)
BAR_H = 60
BUTTONS = [('RED', (0, 0, 255)), ('BLUE', (255, 0, 0)), ('CLEAR', None)]
# TODO: ('ERASE', (0, 0, 0)) 버튼 추가

canvas = None
prev = None
pen_color = (0, 0, 255)

def find_marker(frame, lower, upper, min_area=300):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.morphologyEx(cv.inRange(hsv, lower, upper), cv.MORPH_OPEN, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return None
    c = max(contours, key=cv.contourArea)
    if cv.contourArea(c) < min_area:
        return None
    M = cv.moments(c)
    return (int(M['m10'] / M['m00']), int(M['m01'] / M['m00']))

def overlay(frame, canvas):
    _, ink = cv.threshold(cv.cvtColor(canvas, cv.COLOR_BGR2GRAY), 0, 255, cv.THRESH_BINARY)
    return cv.add(cv.bitwise_and(frame, frame, mask=cv.bitwise_not(ink)), canvas)

def draw_buttons(img):
    bw = img.shape[1] // len(BUTTONS)
    for i, (name, color) in enumerate(BUTTONS):
        fill = (60, 60, 60) if color is None or color == (0, 0, 0) else color
        cv.rectangle(img, (i * bw + 4, 4), ((i + 1) * bw - 4, BAR_H - 4), fill, -1)
        cv.putText(img, name, (i * bw + 12, 40), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

def process(frame):
    global canvas, prev, pen_color
    if canvas is None or canvas.shape != frame.shape:
        canvas = np.zeros_like(frame)
        prev = None
    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), 255, cv.getTrackbarPos('V max', WIN)])
    point = find_marker(frame, lower, upper)
    brush = 8    # TODO: 트랙바에서 읽기 (최소 1)

    if point is None:
        prev = None
    elif point[1] < BAR_H:
        b = min(point[0] // (frame.shape[1] // len(BUTTONS)), len(BUTTONS) - 1)
        name, color = BUTTONS[b]
        if color is None:
            canvas[:] = 0
        else:
            pen_color = color
        prev = None
    else:
        if prev is not None:
            # TODO: 지우개(pen_color 가 (0, 0, 0))이면 굵기를 brush * 3 으로
            cv.line(canvas, prev, point, pen_color, brush)
        prev = point

    out = overlay(frame, canvas)
    draw_buttons(out)
    return out
`,
        hint: `<p><code>cv.createTrackbar('brush', WIN, 8, 40, nothing)</code>, <code>brush = max(1, cv.getTrackbarPos('brush', WIN))</code>, <code>thick = brush * 3 if pen_color == (0, 0, 0) else brush</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'painter'
def nothing(x):
    pass
cv.namedWindow(WIN)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179), ('S min', 120, 255), ('V min', 70, 255), ('V max', 255, 255)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)
cv.createTrackbar('brush', WIN, 8, 40, nothing)

KERNEL = np.ones((5, 5), np.uint8)
BAR_H = 60
BUTTONS = [('RED', (0, 0, 255)), ('BLUE', (255, 0, 0)), ('ERASE', (0, 0, 0)), ('CLEAR', None)]

canvas = None
prev = None
pen_color = (0, 0, 255)

def find_marker(frame, lower, upper, min_area=300):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.morphologyEx(cv.inRange(hsv, lower, upper), cv.MORPH_OPEN, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return None
    c = max(contours, key=cv.contourArea)
    if cv.contourArea(c) < min_area:
        return None
    M = cv.moments(c)
    return (int(M['m10'] / M['m00']), int(M['m01'] / M['m00']))

def overlay(frame, canvas):
    _, ink = cv.threshold(cv.cvtColor(canvas, cv.COLOR_BGR2GRAY), 0, 255, cv.THRESH_BINARY)
    return cv.add(cv.bitwise_and(frame, frame, mask=cv.bitwise_not(ink)), canvas)

def draw_buttons(img):
    bw = img.shape[1] // len(BUTTONS)
    for i, (name, color) in enumerate(BUTTONS):
        fill = (60, 60, 60) if color is None or color == (0, 0, 0) else color
        cv.rectangle(img, (i * bw + 4, 4), ((i + 1) * bw - 4, BAR_H - 4), fill, -1)
        cv.putText(img, name, (i * bw + 12, 40), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

def process(frame):
    global canvas, prev, pen_color
    if canvas is None or canvas.shape != frame.shape:
        canvas = np.zeros_like(frame)
        prev = None
    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), 255, cv.getTrackbarPos('V max', WIN)])
    point = find_marker(frame, lower, upper)
    brush = max(1, cv.getTrackbarPos('brush', WIN))

    if point is None:
        prev = None
    elif point[1] < BAR_H:
        b = min(point[0] // (frame.shape[1] // len(BUTTONS)), len(BUTTONS) - 1)
        name, color = BUTTONS[b]
        if color is None:
            canvas[:] = 0
        else:
            pen_color = color
        prev = None
    else:
        if prev is not None:
            thick = brush * 3 if pen_color == (0, 0, 0) else brush
            cv.line(canvas, prev, point, pen_color, thick)
        prev = point

    out = overlay(frame, canvas)
    draw_buttons(out)
    return out
`,
      },
      {
        title: '실습 2 · 순간이동 점 무시하기 (잡음 방지)',
        desc: `<p>웹캠에서는 가끔 배경의 비슷한 색이 한 프레임 동안 마커로 잡혀 화면을 가로지르는 긴 선이 생깁니다. 직전 점과 현재 점의 거리가 <code>jump</code> 트랙바 값(기본 80 픽셀)보다 크면 <b>선을 긋지 않고</b> 현재 점만 <code>prev</code> 로 기억하도록 고치세요. 무시한 횟수를 화면에 <code>skipped: 3</code> 처럼 표시합니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'painter'
def nothing(x):
    pass
cv.namedWindow(WIN)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179), ('S min', 120, 255), ('V min', 70, 255), ('V max', 255, 255)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)
cv.createTrackbar('jump', WIN, 80, 300, nothing)

KERNEL = np.ones((5, 5), np.uint8)
canvas = None
prev = None
skipped = 0

def find_marker(frame, lower, upper, min_area=300):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.morphologyEx(cv.inRange(hsv, lower, upper), cv.MORPH_OPEN, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return None
    c = max(contours, key=cv.contourArea)
    if cv.contourArea(c) < min_area:
        return None
    M = cv.moments(c)
    return (int(M['m10'] / M['m00']), int(M['m01'] / M['m00']))

def process(frame):
    global canvas, prev, skipped
    if canvas is None or canvas.shape != frame.shape:
        canvas = np.zeros_like(frame)
        prev = None
    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), 255, cv.getTrackbarPos('V max', WIN)])
    point = find_marker(frame, lower, upper)
    jump = cv.getTrackbarPos('jump', WIN)

    if point is None:
        prev = None
    else:
        if prev is not None:
            # TODO: prev 와 point 사이 거리 계산
            # TODO: 거리가 jump 보다 크면 선을 긋지 않고 skipped += 1
            cv.line(canvas, prev, point, (0, 0, 255), 8)
        prev = point

    out = cv.add(frame, canvas)
    # TODO: 'skipped: N' 표시
    return out
`,
        hint: `<p>거리: <code>d = ((point[0] - prev[0]) ** 2 + (point[1] - prev[1]) ** 2) ** 0.5</code>. <code>if d &gt; jump: skipped += 1</code> <code>else: cv.line(...)</code>. 어느 경우든 <code>prev = point</code> 는 실행합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'painter'
def nothing(x):
    pass
cv.namedWindow(WIN)
for name, value, maximum in [('H min', 100, 179), ('H max', 130, 179), ('S min', 120, 255), ('V min', 70, 255), ('V max', 255, 255)]:
    cv.createTrackbar(name, WIN, value, maximum, nothing)
cv.createTrackbar('jump', WIN, 80, 300, nothing)

KERNEL = np.ones((5, 5), np.uint8)
canvas = None
prev = None
skipped = 0

def find_marker(frame, lower, upper, min_area=300):
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
    mask = cv.morphologyEx(cv.inRange(hsv, lower, upper), cv.MORPH_OPEN, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return None
    c = max(contours, key=cv.contourArea)
    if cv.contourArea(c) < min_area:
        return None
    M = cv.moments(c)
    return (int(M['m10'] / M['m00']), int(M['m01'] / M['m00']))

def process(frame):
    global canvas, prev, skipped
    if canvas is None or canvas.shape != frame.shape:
        canvas = np.zeros_like(frame)
        prev = None
    lower = np.array([cv.getTrackbarPos('H min', WIN), cv.getTrackbarPos('S min', WIN), cv.getTrackbarPos('V min', WIN)])
    upper = np.array([cv.getTrackbarPos('H max', WIN), 255, cv.getTrackbarPos('V max', WIN)])
    point = find_marker(frame, lower, upper)
    jump = cv.getTrackbarPos('jump', WIN)

    if point is None:
        prev = None
    else:
        if prev is not None:
            d = ((point[0] - prev[0]) ** 2 + (point[1] - prev[1]) ** 2) ** 0.5
            if d > jump:
                skipped += 1                   # 순간이동 → 잡음으로 보고 무시
            else:
                cv.line(canvas, prev, point, (0, 0, 255), 8)
        prev = point

    out = cv.add(frame, canvas)
    cv.putText(out, 'skipped: %d' % skipped, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    return out
`,
      },
    ],
    quiz: [
      { q: 'process(frame) 안에서 그린 선이 다음 프레임에도 남아 있게 하려면?', options: ['process 안에서 매번 canvas = np.zeros_like(frame) 을 만든다', '함수 바깥에 canvas 를 두고 process 안에서 global 로 사용한다', 'while 루프 안에서 그린다', 'cv.waitKey(0) 을 호출한다'], answer: 1, explain: '함수 안의 지역 변수는 호출이 끝나면 사라집니다. 전역 canvas 에 그려야 프레임 사이에 그림이 누적됩니다.' },
      { q: '마커가 보이지 않는 프레임에서 prev = None 으로 두는 이유는?', options: ['메모리를 아끼려고', '캔버스를 지우려고', 'HSV 범위를 초기화하려고', '마커가 다시 나타났을 때 사라지기 전 위치와 엉뚱한 선으로 이어지지 않게(펜을 드는 효과)'], answer: 3, explain: 'prev 가 남아 있으면 다시 나타난 위치까지 화면을 가로지르는 선이 그어집니다. None 으로 두면 새 선이 시작됩니다.' },
      { q: '밝은 배경 위에 cv.add(frame, canvas) 로 빨간 선을 합성하면 선이 희게 보이는 이유는?', options: ['픽셀 값을 더하면 255 에서 포화되어 밝은 배경 + 빨강이 흰색에 가까워지기 때문', 'canvas 가 흑백이라서', 'HSV 로 변환하지 않아서', '선 굵기가 얇아서'], answer: 0, explain: '(230,230,230)+(0,0,255)=(230,230,255) 처럼 거의 흰색이 됩니다. 잉크 자리를 비트 연산으로 비운 뒤 더하면 원래 색이 유지됩니다.' },
      { q: '좌우 반전(cv.flip)을 process 의 “가장 처음”에 해야 하는 이유는?', options: ['flip 은 컬러 이미지에서만 동작해서', '속도가 빨라져서', '마커 검출·버튼 판정·그리기가 모두 사용자가 보는 반전된 좌표계에서 일치해야 하므로', 'HSV 변환이 반전을 필요로 해서'], answer: 2, explain: '검출은 원본 좌표로 하고 화면만 반전하면, 손을 오른쪽 버튼에 가져가도 왼쪽 버튼이 눌리는 식의 불일치가 생깁니다.' },
    ],
  },

  // =====================================================================
  // w4-6 가이드 프로젝트 ④ 사진 필터 앱
  // =====================================================================
  {
    id: 'w4-6',
    summary: '카툰, 연필 스케치, 비네팅, 세피아, 엠보싱 필터를 각각 “이미지를 받아 이미지를 돌려주는 함수”로 만들고, 트랙바로 필터와 강도를 고르며 전/후를 나눠 보는 실시간 사진 필터 앱으로 조립합니다.',
    goals: [
      '양방향 필터·미디언 블러·적응형 임계처리·비트 연산을 조합해 카툰 필터를 만들 수 있다',
      'cv.divide 를 이용한 닷지(dodge) 기법으로 연필 스케치 필터를 만들 수 있다',
      '가우시안 커널 마스크(비네팅), 색 변환 행렬(세피아), filter2D(엠보싱)로 필터를 만들 수 있다',
      '필터 함수 목록 + 트랙바 + addWeighted 강도 조절 + 전/후 분할 화면으로 앱을 구성하고 결과를 저장할 수 있다',
    ],
    schedule: [['도입 · 필터 함수 규칙', 5], ['STEP 1~2 카툰 · 스케치', 12], ['STEP 3~4 비네팅 · 세피아 · 엠보싱', 10], ['STEP 5 앱 조립 · 속도', 13], ['실습', 5], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 프로젝트 소개: 필터는 “함수”다</h3>
<p>사진 앱의 필터 버튼 하나하나는 결국 <b>이미지를 받아서 가공된 이미지를 돌려주는 함수</b>입니다. 이번 프로젝트에서는 모든 필터가 같은 규칙을 지키게 만듭니다.</p>
<ul>
<li>입력: BGR 3채널 <code>uint8</code> 이미지</li>
<li>출력: <b>입력과 같은 크기</b>의 BGR 3채널 <code>uint8</code> 이미지 (흑백 결과도 3채널로 바꿔서)</li>
</ul>
<p>규칙이 같으면 필터를 <b>리스트에 넣고 번호로 골라 쓰기</b>, 강도 조절(<code>addWeighted</code>), 전/후 비교(<code>hstack</code>)가 모든 필터에서 똑같이 동작합니다. 실습 이미지: <code>lena.jpg</code>, <code>butterfly.jpg</code>, <code>starry_night.jpg</code>, 그리고 📷 웹캠.</p>` },
      { type: 'checklist', title: '이번 교시 완성 기준', items: [
        '5개 필터 함수가 모두 입력과 같은 크기의 3채널 uint8 이미지를 돌려준다',
        '트랙바로 필터 종류, 강도(0~100%), 전/후 분할 위치를 조절할 수 있다',
        '웹캠 입력에서도 끊김이 심하지 않다 (필터별 처리 시간을 측정해 확인)',
        '필터 적용 결과를 cv.imwrite 로 저장했다',
      ] },
      { type: 'text', html: `<h3>STEP 1. 카툰(Cartoon) 필터</h3>
<p>만화 느낌은 <b>“색은 넓은 면으로 단순하게 + 윤곽선은 검고 굵게”</b>입니다. 두 갈래로 만들어 합칩니다.</p>
<ol>
<li><b>색 단순화</b>: 양방향 필터(bilateralFilter)는 <b>엣지는 살리고 면은 뭉개는</b> 블러입니다. 여러 번 반복할수록 물감으로 칠한 듯해집니다. 느린 필터이므로 <b>절반 크기로 줄여서</b> 반복하고 다시 키웁니다.</li>
<li><b>윤곽선</b>: 흑백 → 미디언 블러(잡티 제거) → 적응형 임계처리 → 윤곽선은 검정(0), 나머지는 흰색(255)</li>
<li><b>합치기</b>: <code>cv.bitwise_and(color, color, mask=edges)</code> → 윤곽선 자리만 검게</li>
</ol>` },
      { type: 'code', title: 'STEP 1 · 카툰 필터와 디버그 뷰', code: String.raw`
import cv2 as cv
import numpy as np

def cartoon(img, repeat=4):
    h, w = img.shape[:2]
    # ① 색 단순화: 절반 크기에서 양방향 필터 반복 (속도 ↑)
    small = cv.resize(img, (w // 2, h // 2))
    for i in range(repeat):
        small = cv.bilateralFilter(small, 7, 50, 50)
    color = cv.resize(small, (w, h))
    # ② 윤곽선: 흑백 → 미디언 → 적응형 임계처리
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    gray = cv.medianBlur(gray, 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    # ③ 합치기: 윤곽선(0) 자리만 검게
    result = cv.bitwise_and(color, color, mask=edges)
    return result, color, edges

img = cv.imread('lena.jpg')
result, color, edges = cartoon(img)
print('입력', img.shape, img.dtype, '→ 출력', result.shape, result.dtype)

debug = np.hstack([img, color, cv.cvtColor(edges, cv.COLOR_GRAY2BGR), result])
cv.imshow('input | color | edges | cartoon', cv.resize(debug, None, fx=0.5, fy=0.5))
`, desc: '<p><code>repeat</code> 를 1 과 7 로 바꿔 color 칸이 어떻게 달라지는지 보세요. 적응형 임계처리의 블록 크기(9)를 키우면 선이 굵고 많아집니다.</p>' },
      { type: 'text', html: `<h3>STEP 2. 연필 스케치(Pencil Sketch) 필터 — 닷지 기법</h3>
<p>사진 편집 프로그램의 “색상 닷지(Color Dodge)” 합성을 흉내 냅니다.</p>
<ol>
<li>흑백 이미지 <code>gray</code> 를 만들고, 반전 <code>inv = 255 − gray</code></li>
<li>반전 이미지를 크게 블러: <code>blur = GaussianBlur(inv, (21, 21), 0)</code></li>
<li><code>sketch = cv.divide(gray, 255 − blur, scale=256)</code></li>
</ol>
<p>나누기 결과는 “원래 밝기 ÷ 주변의 어두움”이라, <b>평평한 곳은 흰색(255 로 포화)</b>이 되고 <b>밝기가 급하게 바뀌는 윤곽 근처만 회색 선</b>으로 남습니다. 블러 크기가 클수록 선이 굵고 진해집니다.</p>` },
      { type: 'code', title: 'STEP 2 · 연필 스케치 필터', code: String.raw`
import cv2 as cv
import numpy as np

def pencil_sketch(img, ksize=21):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    inv = 255 - gray
    blur = cv.GaussianBlur(inv, (ksize, ksize), 0)
    sketch = cv.divide(gray, 255 - blur, scale=256)     # 닷지 합성
    return cv.cvtColor(sketch, cv.COLOR_GRAY2BGR)        # 규칙: 3채널로 돌려주기

img = cv.imread('butterfly.jpg')
tiles = [img]
for k in [5, 21, 51]:
    s = pencil_sketch(img, k)
    cv.putText(s, 'ksize %d' % k, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    tiles.append(s)
view = np.vstack([np.hstack(tiles[:2]), np.hstack(tiles[2:])])
cv.imshow('pencil sketch', cv.resize(view, None, fx=0.6, fy=0.6))
`, desc: '<p><code>cv.divide</code> 는 0 으로 나누는 경우와 255 를 넘는 값을 알아서 처리해 줍니다. NumPy 로 직접 나누면 <code>uint8</code> 오버플로와 0 나누기 문제를 따로 챙겨야 합니다.</p>' },
      { type: 'text', html: `<h3>STEP 3. 비네팅(Vignette)과 세피아(Sepia)</h3>
<p><b>비네팅</b>은 사진 가장자리를 어둡게 해 시선을 가운데로 모으는 효과입니다. 가운데가 1, 가장자리로 갈수록 작아지는 <b>2차원 가우시안 마스크</b>를 곱하면 됩니다.</p>
<ul>
<li><code>kx = cv.getGaussianKernel(w, sigma_x)</code> → (w, 1) 세로 벡터, <code>ky = cv.getGaussianKernel(h, sigma_y)</code> → (h, 1)</li>
<li><code>mask = ky @ kx.T</code> → 두 벡터의 <b>외적(outer product)</b> = (h, w) 크기의 2차원 종 모양</li>
<li><code>mask / mask.max()</code> 로 가운데를 1 로 맞추고, 채널마다 곱하기. sigma 가 작을수록 어두운 테두리가 넓어집니다.</li>
</ul>
<p><b>세피아</b>는 오래된 사진의 갈색 톤입니다. 새 (B, G, R) 각각을 원래 (B, G, R) 의 <b>가중합</b>으로 계산하는데, 이것을 3×3 행렬 하나로 <code>cv.transform</code> 에 넘기면 모든 픽셀에 한 번에 적용됩니다. 계산 결과가 255 를 넘을 수 있으므로 <b>float 로 계산 → np.clip(0, 255) → uint8</b> 순서를 꼭 지킵니다.</p>` },
      { type: 'code', title: 'STEP 3 · 비네팅 마스크와 세피아 행렬', code: String.raw`
import cv2 as cv
import numpy as np

def vignette(img, sigma_ratio=0.35):
    h, w = img.shape[:2]
    kx = cv.getGaussianKernel(w, w * sigma_ratio)     # (w, 1)
    ky = cv.getGaussianKernel(h, h * sigma_ratio)     # (h, 1)
    mask = ky @ kx.T                                   # (h, w) 외적
    mask = mask / mask.max()                           # 가운데 = 1.0
    out = img.astype(np.float32) * mask[:, :, np.newaxis]
    return out.astype(np.uint8), mask

# 행: 새 B, 새 G, 새 R / 열: 원래 B, G, R 에 곱할 값
SEPIA = np.array([[0.131, 0.534, 0.272],
                  [0.168, 0.686, 0.349],
                  [0.189, 0.769, 0.393]], dtype=np.float32)

def sepia(img):
    out = cv.transform(img.astype(np.float32), SEPIA)
    return np.clip(out, 0, 255).astype(np.uint8)       # 255 넘는 값 자르기

img = cv.imread('starry_night.jpg')
v, mask = vignette(img, 0.4)
s = sepia(img)
print('마스크 가운데 값 %.2f, 모서리 값 %.2f' % (mask[mask.shape[0] // 2, mask.shape[1] // 2], mask[0, 0]))

row = np.hstack([img, v, s, sepia(v)])
cv.imshow('input | vignette | sepia | both', cv.resize(row, None, fx=0.4, fy=0.4))
cv.imshow('vignette mask', mask)                       # float 0~1 은 그대로 표시 가능
`, desc: '<p>마지막 칸처럼 <b>필터를 이어서 적용</b>할 수도 있습니다. 함수 규칙(같은 크기·3채널·uint8)을 지켰기 때문에 가능한 일입니다.</p>' },
      { type: 'text', html: `<h3>STEP 4. 엠보싱(Emboss)과 필터 갤러리</h3>
<p>엠보싱은 동전의 부조처럼 <b>한쪽에서 빛을 비춘 듯한 입체감</b>을 줍니다. 2주차에 배운 <code>cv.filter2D</code> 에 대각선 방향 커널을 넣으면 됩니다.</p>
<pre>[-2 -1  0]
[-1  1  1]
[ 0  1  2]</pre>
<p>왼쪽 위와 오른쪽 아래의 차이를 강조하므로 대각선 방향 엣지가 밝거나 어둡게 튀어나옵니다. 커널 합이 1 이라 평평한 곳은 원래 밝기가 유지됩니다.</p>` },
      { type: 'code', title: 'STEP 4 · 엠보싱 + 5개 필터 갤러리 저장', code: String.raw`
import cv2 as cv
import numpy as np

def cartoon(img, repeat=3):
    h, w = img.shape[:2]
    small = cv.resize(img, (w // 2, h // 2))
    for i in range(repeat):
        small = cv.bilateralFilter(small, 7, 50, 50)
    color = cv.resize(small, (w, h))
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    return cv.bitwise_and(color, color, mask=edges)

def pencil_sketch(img, ksize=21):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(255 - gray, (ksize, ksize), 0)
    return cv.cvtColor(cv.divide(gray, 255 - blur, scale=256), cv.COLOR_GRAY2BGR)

def vignette(img, sigma_ratio=0.35):
    h, w = img.shape[:2]
    mask = cv.getGaussianKernel(h, h * sigma_ratio) @ cv.getGaussianKernel(w, w * sigma_ratio).T
    mask = mask / mask.max()
    return (img.astype(np.float32) * mask[:, :, np.newaxis]).astype(np.uint8)

SEPIA = np.array([[0.131, 0.534, 0.272], [0.168, 0.686, 0.349], [0.189, 0.769, 0.393]], dtype=np.float32)
def sepia(img):
    return np.clip(cv.transform(img.astype(np.float32), SEPIA), 0, 255).astype(np.uint8)

EMBOSS = np.array([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], dtype=np.float32)
def emboss(img):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return cv.cvtColor(cv.filter2D(gray, -1, EMBOSS), cv.COLOR_GRAY2BGR)

FILTERS = [('ORIGINAL', lambda im: im.copy()), ('CARTOON', cartoon), ('SKETCH', pencil_sketch),
           ('VIGNETTE', vignette), ('SEPIA', sepia), ('EMBOSS', emboss)]

img = cv.imread('butterfly.jpg')
tiles = []
for name, f in FILTERS:
    out = f(img)
    assert out.shape == img.shape and out.dtype == np.uint8, name + ' 규칙 위반!'
    t = cv.resize(out, (320, 231))
    cv.putText(t, name, (8, 28), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 3)
    cv.putText(t, name, (8, 28), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 1)
    tiles.append(t)
gallery = np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])])
cv.imshow('filter gallery', gallery)
cv.imwrite('filter_gallery.jpg', gallery)
print('갤러리 저장 완료:', gallery.shape)
`, desc: '<p><code>assert</code> 로 “필터 함수 규칙”을 자동 검사합니다. 새 필터를 추가했을 때 규칙을 어기면 바로 알려 줍니다.</p>' },
      { type: 'text', html: `<h3>STEP 5. 앱으로 조립하기</h3>
<p>이제 필터 함수 목록을 <code>process(frame)</code> 에 연결합니다. 패널의 트랙바 3개가 앱의 UI 입니다.</p>
<ul>
<li><b>filter</b> (0~5): <code>FILTERS[번호]</code> 로 필터 선택</li>
<li><b>strength</b> (0~100): <code>cv.addWeighted(원본, 1−a, 필터결과, a, 0)</code> 으로 강도 조절</li>
<li><b>split</b> (0~100): 화면의 왼쪽 split% 는 원본(BEFORE), 나머지는 결과(AFTER). NumPy 슬라이싱으로 한 줄에 합성: <code>view[:, :x] = frame[:, :x]</code></li>
</ul>
<p><b>속도</b>: 웹캠은 매 프레임 호출되므로 무거운 카툰 필터는 반복 횟수를 줄이고, 입력이 너무 크면 너비 640 으로 줄여서 처리합니다. 처리 시간(ms)도 화면에 표시해 확인합니다.</p>` },
      { type: 'code', title: 'STEP 5 · 사진 필터 앱 (완성)', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'filter app'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('filter', WIN, 1, 5, nothing)
cv.createTrackbar('strength', WIN, 100, 100, nothing)
cv.createTrackbar('split', WIN, 50, 100, nothing)

def cartoon(img, repeat=2):
    h, w = img.shape[:2]
    small = cv.resize(img, (w // 2, h // 2))
    for i in range(repeat):
        small = cv.bilateralFilter(small, 7, 50, 50)
    color = cv.resize(small, (w, h))
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    return cv.bitwise_and(color, color, mask=edges)

def pencil_sketch(img, ksize=21):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(255 - gray, (ksize, ksize), 0)
    return cv.cvtColor(cv.divide(gray, 255 - blur, scale=256), cv.COLOR_GRAY2BGR)

_mask_cache = {}
def vignette(img, sigma_ratio=0.35):
    h, w = img.shape[:2]
    if (h, w) not in _mask_cache:                  # 크기가 같으면 마스크 재사용 (속도 ↑)
        m = cv.getGaussianKernel(h, h * sigma_ratio) @ cv.getGaussianKernel(w, w * sigma_ratio).T
        _mask_cache[(h, w)] = (m / m.max()).astype(np.float32)[:, :, np.newaxis]
    return (img * _mask_cache[(h, w)]).astype(np.uint8)

SEPIA = np.array([[0.131, 0.534, 0.272], [0.168, 0.686, 0.349], [0.189, 0.769, 0.393]], dtype=np.float32)
def sepia(img):
    return np.clip(cv.transform(img.astype(np.float32), SEPIA), 0, 255).astype(np.uint8)

EMBOSS = np.array([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], dtype=np.float32)
def emboss(img):
    return cv.cvtColor(cv.filter2D(cv.cvtColor(img, cv.COLOR_BGR2GRAY), -1, EMBOSS), cv.COLOR_GRAY2BGR)

FILTERS = [('ORIGINAL', lambda im: im.copy()), ('CARTOON', cartoon), ('SKETCH', pencil_sketch),
           ('VIGNETTE', vignette), ('SEPIA', sepia), ('EMBOSS', emboss)]

def process(frame):
    t0 = cv.getTickCount()
    if frame.shape[1] > 640:                                   # 너무 크면 줄이기
        frame = cv.resize(frame, (640, int(frame.shape[0] * 640 / frame.shape[1])))
    idx = cv.getTrackbarPos('filter', WIN)
    a = cv.getTrackbarPos('strength', WIN) / 100.0
    name, f = FILTERS[idx]

    filtered = f(frame)
    after = cv.addWeighted(frame, 1 - a, filtered, a, 0)       # 강도 조절

    h, w = frame.shape[:2]
    x = int(w * cv.getTrackbarPos('split', WIN) / 100)
    view = after.copy()
    view[:, :x] = frame[:, :x]                                  # 왼쪽은 원본
    cv.line(view, (x, 0), (x, h), (255, 255, 255), 2)
    cv.putText(view, 'BEFORE', (10, h - 15), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv.putText(view, 'AFTER: %s %d%%' % (name, a * 100), (x + 10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    ms = (cv.getTickCount() - t0) / cv.getTickFrequency() * 1000
    cv.putText(view, '%.0f ms' % ms, (w - 90, h - 15), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    return view
`, desc: '<p>입력을 <code>lena.jpg</code> 로 두고 트랙바를 움직여 보세요. 웹캠이 없으면 🎞️ 동영상 <code>Megamind.avi</code>(애니메이션)를 골라 움직이는 영상에 필터를 걸어 볼 수 있습니다. 📷 웹캠·동영상에서는 오른쪽 아래 처리 시간(ms)을 확인하고, 카툰이 느리면 <code>repeat</code> 를 1 로 줄입니다. 마음에 드는 장면은 웹캠 스냅샷으로 찍어 두었다가 실습 2 에서 저장합니다.</p>' },
      { type: 'code', title: '보너스 · 필터별 처리 시간 측정 (640×480 기준)', code: String.raw`
import cv2 as cv
import numpy as np

def cartoon(img, repeat=2):
    h, w = img.shape[:2]
    small = cv.resize(img, (w // 2, h // 2))
    for i in range(repeat):
        small = cv.bilateralFilter(small, 7, 50, 50)
    color = cv.resize(small, (w, h))
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    return cv.bitwise_and(color, color, mask=edges)

def cartoon_fullsize(img, repeat=2):              # 비교용: 줄이지 않고 원본 크기에서 반복
    color = img.copy()
    for i in range(repeat):
        color = cv.bilateralFilter(color, 7, 50, 50)
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    return cv.bitwise_and(color, color, mask=edges)

def pencil_sketch(img, ksize=21):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(255 - gray, (ksize, ksize), 0)
    return cv.cvtColor(cv.divide(gray, 255 - blur, scale=256), cv.COLOR_GRAY2BGR)

def measure(f, img, n=3):
    t0 = cv.getTickCount()
    for i in range(n):
        f(img)
    return (cv.getTickCount() - t0) / cv.getTickFrequency() * 1000 / n

frame = cv.resize(cv.imread('lena.jpg'), (640, 480))
for name, f in [('cartoon (half size)', cartoon), ('cartoon (full size)', cartoon_fullsize), ('pencil sketch', pencil_sketch)]:
    print('%-22s %7.1f ms' % (name, measure(f, frame)))
print('실시간(초당 약 10장 이상)을 원하면 한 프레임 처리가 100 ms 보다 충분히 작아야 합니다.')
`, desc: '<p>양방향 필터는 이미지 크기에 민감합니다. 가로·세로를 절반으로 줄이면 픽셀 수가 1/4 이 되어 훨씬 빨라집니다. 브라우저에서는 PC 에서 직접 실행할 때보다 몇 배 느릴 수 있습니다.</p>' },
      { type: 'checklist', title: '도전 과제', items: [
        '나만의 필터 추가하기 — 예: 포스터화(색 단계 줄이기), 차가운 톤(파랑 채널 강조) (실습 1)',
        '여러 이미지에 같은 필터를 적용해 전/후 비교 이미지를 한꺼번에 저장하기 (실습 2)',
        '마우스로 분할선(split)을 드래그해서 옮기기 (setMouseCallback)',
        '필터 두 개를 순서대로 겹쳐 적용하는 “콤보” 모드 만들기 (예: CARTOON → VIGNETTE)',
        '얼굴 영역 대신 마우스로 고른 사각형 ROI 에만 필터 적용하기',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 나만의 필터 두 개 추가하기',
        desc: `<p>필터 앱의 <code>FILTERS</code> 목록에 두 필터를 추가하세요. 트랙바 최댓값도 목록 길이에 맞춰야 합니다.</p>
<ul>
<li><b>POSTER</b> (포스터화): 각 채널 값을 64 단위로 뭉개기 → <code>(img // 64) * 64 + 32</code></li>
<li><b>COOL</b> (차가운 톤): 파랑 채널에 +40, 빨강 채널에 −40 (<code>cv.split</code> → <code>cv.add</code>/<code>cv.subtract</code> → <code>cv.merge</code>, 포화 연산이라 0~255 를 넘지 않음)</li>
</ul>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

WIN = 'filter app'
def nothing(x):
    pass

def pencil_sketch(img, ksize=21):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(255 - gray, (ksize, ksize), 0)
    return cv.cvtColor(cv.divide(gray, 255 - blur, scale=256), cv.COLOR_GRAY2BGR)

def poster(img):
    # TODO: 채널 값을 64 단위로 양자화하세요 (결과는 uint8)
    return img.copy()

def cool(img):
    b, g, r = cv.split(img)
    # TODO: b 는 +40 (cv.add), r 은 -40 (cv.subtract) 한 뒤 merge
    return cv.merge([b, g, r])

FILTERS = [('ORIGINAL', lambda im: im.copy()), ('SKETCH', pencil_sketch)]
# TODO: ('POSTER', poster), ('COOL', cool) 추가

cv.namedWindow(WIN)
cv.createTrackbar('filter', WIN, 1, len(FILTERS) - 1, nothing)    # 최댓값 = 목록 길이 - 1

def process(frame):
    name, f = FILTERS[cv.getTrackbarPos('filter', WIN)]
    out = f(frame)
    cv.putText(out, name, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
    return np.hstack([frame, out])
`,
        hint: `<p>포스터화: <code>((img // 64) * 64 + 32).astype(np.uint8)</code>. 차가운 톤: <code>b = cv.add(b, 40)</code>, <code>r = cv.subtract(r, 40)</code>. <code>FILTERS</code> 에 추가한 <b>뒤에</b> 트랙바를 만들어야 최댓값이 맞습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

WIN = 'filter app'
def nothing(x):
    pass

def pencil_sketch(img, ksize=21):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    blur = cv.GaussianBlur(255 - gray, (ksize, ksize), 0)
    return cv.cvtColor(cv.divide(gray, 255 - blur, scale=256), cv.COLOR_GRAY2BGR)

def poster(img):
    return ((img // 64) * 64 + 32).astype(np.uint8)

def cool(img):
    b, g, r = cv.split(img)
    b = cv.add(b, 40)          # 포화 연산: 255 를 넘지 않음
    r = cv.subtract(r, 40)     # 포화 연산: 0 아래로 내려가지 않음
    return cv.merge([b, g, r])

FILTERS = [('ORIGINAL', lambda im: im.copy()), ('SKETCH', pencil_sketch),
           ('POSTER', poster), ('COOL', cool)]

cv.namedWindow(WIN)
cv.createTrackbar('filter', WIN, 1, len(FILTERS) - 1, nothing)

def process(frame):
    name, f = FILTERS[cv.getTrackbarPos('filter', WIN)]
    out = f(frame)
    cv.putText(out, name, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
    return np.hstack([frame, out])
`,
      },
      {
        title: '실습 2 · 전/후 비교 이미지 일괄 저장',
        desc: `<p><code>lena.jpg</code>, <code>butterfly.jpg</code>, <code>starry_night.jpg</code> 세 장에 카툰 필터를 적용하고, 각각 <b>원본과 결과를 가로로 붙인 비교 이미지</b>를 <code>before_after_lena.jpg</code> 같은 이름으로 저장하세요. 발표자료에 바로 쓸 수 있도록 높이를 300 픽셀로 맞추고 BEFORE / AFTER 글자를 넣습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def cartoon(img, repeat=3):
    h, w = img.shape[:2]
    small = cv.resize(img, (w // 2, h // 2))
    for i in range(repeat):
        small = cv.bilateralFilter(small, 7, 50, 50)
    color = cv.resize(small, (w, h))
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    return cv.bitwise_and(color, color, mask=edges)

def fit_height(img, h=300):
    return cv.resize(img, (int(img.shape[1] * h / img.shape[0]), h))

for name in ['lena.jpg', 'butterfly.jpg']:          # TODO: starry_night.jpg 도 추가
    img = cv.imread(name)
    after = cartoon(img)
    before = fit_height(img)
    # TODO: after 도 높이 300 으로 맞추기
    # TODO: before 에 'BEFORE', after 에 'AFTER' 글자 넣기
    # TODO: 가로로 붙여 compare 만들기
    compare = before
    out_name = 'before_after_' + name.split('.')[0] + '.jpg'
    cv.imshow(out_name, compare)
    # TODO: cv.imwrite 로 저장
`,
        hint: `<p><code>after = fit_height(after)</code>, <code>cv.putText(before, 'BEFORE', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)</code>, <code>compare = np.hstack([before, after])</code>, <code>cv.imwrite(out_name, compare)</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def cartoon(img, repeat=3):
    h, w = img.shape[:2]
    small = cv.resize(img, (w // 2, h // 2))
    for i in range(repeat):
        small = cv.bilateralFilter(small, 7, 50, 50)
    color = cv.resize(small, (w, h))
    gray = cv.medianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 7)
    edges = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 2)
    return cv.bitwise_and(color, color, mask=edges)

def fit_height(img, h=300):
    return cv.resize(img, (int(img.shape[1] * h / img.shape[0]), h))

for name in ['lena.jpg', 'butterfly.jpg', 'starry_night.jpg']:
    img = cv.imread(name)
    after = fit_height(cartoon(img))
    before = fit_height(img)
    cv.putText(before, 'BEFORE', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
    cv.putText(after, 'AFTER', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
    compare = np.hstack([before, after])
    out_name = 'before_after_' + name.split('.')[0] + '.jpg'
    cv.imshow(out_name, compare)
    cv.imwrite(out_name, compare)
    print('저장:', out_name, compare.shape)
`,
      },
    ],
    quiz: [
      { q: '카툰 필터에서 양방향 필터(bilateralFilter)를 쓰는 이유는?', options: ['윤곽선을 검출하려고', '이미지를 흑백으로 만들려고', '엣지는 유지하면서 넓은 면의 색을 매끈하게 뭉개 물감 칠한 느낌을 내려고', '이미지를 선명하게 하려고'], answer: 2, explain: '양방향 필터는 색 차이가 큰 경계는 보존하고 비슷한 색끼리만 평균합니다. 반복할수록 면이 단순해집니다.' },
      { q: '카툰 필터에서 양방향 필터를 “절반 크기로 줄인 이미지”에 반복 적용하는 주된 이유는?', options: ['양방향 필터는 느리므로 픽셀 수를 1/4 로 줄여 처리 속도를 높이려고', '색이 더 진해져서', '윤곽선이 사라져서', 'uint8 오버플로를 막으려고'], answer: 0, explain: '가로·세로 절반이면 픽셀 수는 1/4 입니다. 뭉개진 색 면은 다시 키워도 티가 잘 나지 않아 실시간 처리에 유리합니다.' },
      { q: '비네팅 마스크를 ky @ kx.T 로 만드는 이유는?', options: ['두 커널을 더하려고', '마스크를 흑백으로 바꾸려고', '이미지를 회전하려고', '1차원 가우시안 두 개의 외적으로 가운데가 가장 큰 2차원 가우시안 마스크를 만들려고'], answer: 3, explain: '(h,1) 과 (1,w) 의 곱은 (h,w) 행렬이 되고, 각 원소는 세로·가로 가우시안 값의 곱이라 가운데가 가장 밝은 종 모양이 됩니다.' },
      { q: '세피아 변환에서 cv.transform 결과를 np.clip(out, 0, 255) 한 뒤 uint8 로 바꾸는 이유는?', options: ['음수를 양수로 바꾸려고', '가중합이 255 를 넘을 수 있어 그냥 uint8 로 바꾸면 값이 넘쳐 엉뚱한 색이 되므로', '채널 순서를 바꾸려고', 'clip 이 없으면 transform 이 오류를 내서'], answer: 1, explain: '예를 들어 새 R = 0.393R+0.769G+0.189B 는 최대 약 345 입니다. clip 없이 uint8 로 바꾸면 값이 넘쳐 어두운 얼룩이 생깁니다.' },
    ],
  },

  // =====================================================================
  // w4-7 팀 프로젝트 기획
  // =====================================================================
  {
    id: 'w4-7',
    summary: '팀 프로젝트의 주제를 고르고, 측정 가능한 요구사항과 파이프라인 설계서를 작성합니다. 위험 요소와 역할을 정리한 뒤, 모든 팀이 공통으로 쓸 수 있는 “프로젝트 스켈레톤 코드”(CONFIG + 단계별 함수 + 디버그 뷰 + process)를 내 주제에 맞게 고쳐 봅니다.',
    goals: [
      '2주 안에 가능한지, 입력을 확보할 수 있는지, 완성을 측정할 수 있는지로 주제를 평가할 수 있다',
      '필수/선택 요구사항을 “확인 가능한 문장”으로 쓸 수 있다',
      '입력 → 전처리 → 검출 → 분석 → 출력 단계별로 파이프라인 설계서를 작성할 수 있다',
      '프로젝트 스켈레톤 코드의 구조를 이해하고 내 주제에 맞게 함수 내용을 바꿀 수 있다',
    ],
    schedule: [['도입 · 기획 흐름', 5], ['주제 선정', 10], ['요구사항 · 설계서 작성', 15], ['위험 · 역할 · 스켈레톤 코드', 10], ['실습 · 팀 작업', 5], ['공유 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `<h3>1. 왜 기획부터 하나요?</h3>
<p>가이드 프로젝트 4개를 만들면서 느꼈겠지만, 영상처리 코드는 <b>파라미터 하나, 입력 한 장</b>에 따라 결과가 크게 달라집니다. 무작정 코드부터 쓰면 “왜 안 되는지 모르는 상태”로 시간을 다 쓰기 쉽습니다. 오늘은 다음 순서로 <b>종이 위에서 먼저</b> 프로젝트를 완성합니다.</p>
<ol>
<li><b>주제 선정</b> — 후보 3개를 기준표로 평가해 1개 확정</li>
<li><b>요구사항</b> — 무엇이 되면 “완성”인지 확인 가능한 문장으로</li>
<li><b>파이프라인 설계서</b> — 단계별 입력/출력/사용 함수/확인 방법</li>
<li><b>위험 목록과 역할 분담</b></li>
<li><b>스켈레톤 코드</b> — 설계서의 단계를 그대로 함수로 옮길 틀</li>
</ol>` },
      { type: 'text', html: `<h3>2. 주제 선정 기준</h3>
<p>w4-1 에서 적어 둔 후보 주제 3개를 아래 기준으로 점수(각 1~3점)를 매겨 보세요. <b>합계가 가장 높은 주제</b>를 고르되, 한 항목이라도 1점이면 주제를 줄이거나 바꾸는 것을 권장합니다.</p>` },
      { type: 'table', head: ['기준', '스스로 물어볼 질문', '나쁜 예', '좋은 예'], rows: [
        ['2주 안에 가능', '배운 기법만으로 핵심 기능을 만들 수 있나? 모르는 기술(딥러닝 등)이 필요한가?', '사람 얼굴로 누구인지 맞히기', '웹캠 앞 색 마커로 풍선 터뜨리기 게임'],
        ['입력 확보', '테스트 이미지를 오늘 당장 3장 이상 구할 수 있나? 조명·배경을 통제할 수 있나?', '밤거리 자동차 번호판 (촬영 어려움)', '책상 위에 직접 놓고 찍은 동전 사진'],
        ['측정 가능한 완성 기준', '“잘 된다”를 숫자나 예/아니오로 확인할 수 있나?', '“예쁘게 보정되는” 사진 앱', '5장 중 4장 이상에서 동전 개수가 정확히 맞음'],
        ['흥미 · 발표 가치', '데모했을 때 결과가 눈에 보이나? 팀원 모두 관심이 있나?', '콘솔에 숫자만 출력', '전/후 비교 화면, 실시간 웹캠 데모'],
      ] },
      { type: 'text', html: `<h3>3. 요구사항 쓰기: “확인 가능한 문장”</h3>
<p>요구사항은 <b>필수(Must)</b>와 <b>선택(Nice to have)</b>으로 나눕니다. 필수는 w4-8 프로토타입과 최종 평가의 기준이 되므로 <b>적고 확실하게</b>, 선택은 시간이 남을 때 하나씩 추가합니다.</p>
<ul>
<li>✗ “물건을 잘 찾는다” → ✓ “stuff.jpg 에서 물건 5개를 모두 사각형으로 표시한다”</li>
<li>✗ “빠르다” → ✓ “웹캠 640×480 에서 한 프레임 처리 시간이 100 ms 이하이다”</li>
<li>✗ “사용하기 편하다” → ✓ “트랙바 2개로 임계값과 최소 면적을 조절할 수 있다”</li>
</ul>` },
      { type: 'table', head: ['구분', '요구사항 예시 (주제: 책상 위 물건 개수 세기)', '확인 방법'], rows: [
        ['필수 1', '입력 이미지에서 물건마다 사각형과 번호를 그린다', '결과 이미지를 눈으로 확인'],
        ['필수 2', '물건 개수를 화면과 콘솔에 출력한다', '직접 센 개수와 비교'],
        ['필수 3', '테스트 이미지 3장 중 2장 이상에서 개수가 정확하다', '테스트 결과표 (w4-8)'],
        ['필수 4', '입력/엣지/마스크/결과가 보이는 디버그 뷰가 있다', '화면 확인'],
        ['선택 1', 'process(frame) 으로 웹캠에서 실시간 동작한다', '웹캠 데모'],
        ['선택 2', '물건 크기(면적)에 따라 SMALL / LARGE 라벨을 붙인다', '결과 이미지 확인'],
      ] },
      { type: 'text', html: `<h3>4. 파이프라인 설계서</h3>
<p>아래 템플릿을 팀 문서(메모장, 공유 문서 등)에 복사해 채우세요. 가장 중요한 칸은 <b>“단계별 출력”</b>과 <b>“확인 방법”</b>입니다. 각 단계가 무엇을 만들어야 하는지 알면, 결과가 틀렸을 때 <b>어느 단계를 고칠지</b> 바로 알 수 있습니다.</p>` },
      { type: 'code', title: '파이프라인 설계서 템플릿 (복사해서 팀 문서에 작성)', norun: true, code: String.raw`
============================================================
 팀 프로젝트 설계서                         팀명: __________
============================================================
1. 주제 한 줄 요약
   예) 책상 위 사진에서 물건 개수를 세고 위치를 표시하는 프로그램

2. 입력
   - 종류: [ ] 샘플 이미지  [ ] 직접 촬영 사진  [ ] 웹캠
   - 테스트 이미지 목록 (3장 이상): stuff.jpg, desk1.jpg, desk2.jpg
   - 촬영 조건(조명/배경/거리): 밝은 낮, 무늬 없는 책상, 위에서 수직 촬영

3. 요구사항
   - 필수: (확인 가능한 문장으로 3~4개)
   - 선택: (1~3개)

4. 파이프라인
   단계        | 하는 일            | 사용 함수                 | 출력            | 확인 방법
   ------------+--------------------+---------------------------+-----------------+----------------------
   ① 입력     | 이미지 읽기/축소   | imread, resize            | BGR 640x480     | shape 출력
   ② 전처리   | 흑백, 블러         | cvtColor, GaussianBlur    | 흑백 이미지     | 디버그 뷰 1칸
   ③ 검출     | 엣지 → 틈 메우기   | Canny, morphologyEx CLOSE | 이진 마스크     | 물건이 흰 덩어리인가
   ④ 분석     | 물건 찾기·세기     | findContours, contourArea | 사각형 목록     | print(len(objects))
   ⑤ 출력     | 사각형·번호·개수   | rectangle, putText        | 결과 이미지     | 직접 센 개수와 비교

5. 주요 파라미터 (CONFIG) 와 처음 값
   canny_low=50, canny_high=150, close_kernel=7, min_area=300

6. 위험 요소와 대책 (3개 이상)

7. 역할 분담
   이름 | 맡은 단계/업무 | 산출물

8. 일정 (w4-8 ~ w5-6 교시별 목표)
`, desc: '<p>설계서는 한 번 쓰고 끝이 아니라 <b>살아 있는 문서</b>입니다. 프로토타입을 만들며 바뀐 파라미터와 결정을 계속 고쳐 적으세요. 발표자료의 “파이프라인” 슬라이드가 여기서 그대로 나옵니다.</p>' },
      { type: 'table', head: ['자주 만나는 위험', '미리 할 수 있는 대책'], rows: [
        ['조명이 바뀌면 임계값이 안 맞음', 'Otsu/적응형 임계처리 사용, 트랙바로 조절, 같은 조건에서 촬영'],
        ['배경이 복잡해 물체가 분리되지 않음', '단색 배경에서 촬영하도록 입력 조건을 요구사항에 명시'],
        ['물체끼리 붙어서 개수가 틀림', '거리 변환(w4-4) 적용, 촬영 시 간격 두기'],
        ['웹캠에서 너무 느림', '처리 전 cv.resize 로 축소, 무거운 필터 반복 줄이기, ms 측정'],
        ['팀원 코드가 서로 안 맞음', '스켈레톤의 함수 이름·입출력 형식을 먼저 합의'],
        ['마지막에 발표자료가 급함', '매 교시 결과 이미지를 imwrite 로 저장해 두기'],
      ] },
      { type: 'table', head: ['역할', '주로 맡는 일', '산출물'], rows: [
        ['파이프라인 담당', 'preprocess(), detect() 구현과 파라미터 튜닝', '검출 마스크, CONFIG 값 기록'],
        ['분석 · 시각화 담당', 'analyze(), visualize(), 디버그 뷰, 트랙바/마우스 UI', '결과 이미지, 데모 화면'],
        ['테스트 · 자료 담당', '입력 이미지 수집·촬영, 테스트 결과표, 실패 사례 기록, 발표자료 초안', '테스트 표, 슬라이드'],
      ] },
      { type: 'text', html: `<h3>5. 프로젝트 스켈레톤 코드</h3>
<p>아래 코드는 모든 팀이 출발점으로 쓰는 <b>틀(skeleton)</b>입니다. 기본 내용은 “Canny + 닫기로 물체 찾아 세기”이지만, 핵심은 <b>구조</b>입니다.</p>
<ul>
<li><b>CONFIG</b>: 코드 곳곳에 흩어진 숫자(임계값, 커널 크기, 최소 면적)를 <b>한 곳</b>에 모읍니다. 튜닝할 때 여기만 고치면 됩니다.</li>
<li><b>load_input / preprocess / detect / analyze / visualize</b>: 설계서의 ①~⑤ 단계와 1:1 로 대응합니다. 팀원별로 함수를 나눠 맡을 수 있습니다.</li>
<li><b>pipeline()</b>: 단계를 순서대로 부르고 <b>(결과, 디버그 뷰, 분석 데이터)</b>를 돌려줍니다. 이미지 실행과 <code>process(frame)</code> 이 <b>같은 pipeline 을 공유</b>합니다.</li>
</ul>` },
      { type: 'code', title: '스켈레톤 ① · 이미지 한 장으로 실행', code: String.raw`
import cv2 as cv
import numpy as np

# ============ 설정값: 숫자는 모두 여기에 ============
CONFIG = {
    'input': 'stuff.jpg',   # None 이면 오른쪽 패널에서 선택한 입력을 사용
    'max_width': 640,       # 이보다 크면 줄여서 처리 (속도)
    'blur': 5,              # 가우시안 블러 커널 (홀수)
    'canny_low': 50,
    'canny_high': 150,
    'close_kernel': 7,      # 엣지 틈 메우기 커널 크기
    'min_area': 300,        # 이보다 작은 컨투어는 무시
}

# ① 입력
def load_input(name):
    if name:
        img = cv.imread(name)
    else:
        import webcv
        img = webcv.get_input()
    if img is None:
        raise FileNotFoundError('입력 이미지를 읽을 수 없습니다: %s' % name)
    return img

def resize_to_width(img, max_w):
    h, w = img.shape[:2]
    if w <= max_w:
        return img
    return cv.resize(img, (max_w, int(h * max_w / w)))

# ② 전처리
def preprocess(img, cfg):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    k = cfg['blur'] if cfg['blur'] % 2 == 1 else cfg['blur'] + 1
    return cv.GaussianBlur(gray, (k, k), 0)

# ③ 검출 (분할): 흰색 = 물체 후보인 이진 마스크를 돌려준다
def detect(pre, cfg):
    edges = cv.Canny(pre, cfg['canny_low'], cfg['canny_high'])
    k = max(1, cfg['close_kernel'])
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (k, k))
    return cv.morphologyEx(edges, cv.MORPH_CLOSE, kernel, iterations=2)

# ④ 분석: 물체 정보(dict) 목록을 돌려준다
def analyze(mask, cfg):
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    objects = []
    for c in contours:
        area = cv.contourArea(c)
        if area < cfg['min_area']:
            continue
        objects.append({'contour': c, 'area': area, 'box': cv.boundingRect(c)})
    return objects

# ⑤ 출력
def visualize(img, objects):
    out = img.copy()
    for i, obj in enumerate(objects):
        x, y, w, h = obj['box']
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(out, '#%d' % (i + 1), (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv.putText(out, 'count: %d' % len(objects), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    return out

def debug_view(images, labels, tile_w=320):
    h0, w0 = images[0].shape[:2]
    tile_h = int(h0 * tile_w / w0)
    tiles = []
    for im, label in zip(images, labels):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        t = cv.resize(im, (tile_w, tile_h))
        cv.putText(t, label, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        tiles.append(t)
    return np.hstack(tiles)

def pipeline(img, cfg):
    img = resize_to_width(img, cfg['max_width'])
    pre = preprocess(img, cfg)
    mask = detect(pre, cfg)
    objects = analyze(mask, cfg)
    result = visualize(img, objects)
    debug = debug_view([img, pre, mask, result], ['input', 'preprocess', 'detect', 'result'])
    return result, debug, objects

# ============ 실행 ============
img = load_input(CONFIG['input'])
result, debug, objects = pipeline(img, CONFIG)
print('찾은 물체 수:', len(objects))
for i, obj in enumerate(objects):
    print('  #%d 면적 %.0f, 위치 %s' % (i + 1, obj['area'], obj['box']))
cv.imshow('result', result)
cv.imshow('debug', debug)
`, desc: '<p><code>stuff.jpg</code> 에서 물건 5개(뚜껑, 연필, 공, 동전, 라이터)가 잡히는지 확인하세요. <code>CONFIG[\'input\'] = None</code> 으로 바꾸면 오른쪽 패널에서 고른 이미지로 실행됩니다.</p>' },
      { type: 'code', title: '스켈레톤 ② · 트랙바 + process(frame) 연결', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'max_width': 640, 'blur': 5, 'canny_low': 50, 'canny_high': 150, 'close_kernel': 7, 'min_area': 300}

# 트랙바로 조절할 CONFIG 키와 최댓값
TUNABLE = [('canny_low', 255), ('canny_high', 255), ('close_kernel', 21), ('min_area', 5000)]
WIN = 'config'
def nothing(x):
    pass
cv.namedWindow(WIN)
for key, maximum in TUNABLE:
    cv.createTrackbar(key, WIN, CONFIG[key], maximum, nothing)

def resize_to_width(img, max_w):
    h, w = img.shape[:2]
    return img if w <= max_w else cv.resize(img, (max_w, int(h * max_w / w)))

def preprocess(img, cfg):
    k = cfg['blur'] if cfg['blur'] % 2 == 1 else cfg['blur'] + 1
    return cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (k, k), 0)

def detect(pre, cfg):
    edges = cv.Canny(pre, cfg['canny_low'], cfg['canny_high'])
    k = max(1, cfg['close_kernel'])
    return cv.morphologyEx(edges, cv.MORPH_CLOSE, cv.getStructuringElement(cv.MORPH_ELLIPSE, (k, k)), iterations=2)

def analyze(mask, cfg):
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [{'contour': c, 'area': cv.contourArea(c), 'box': cv.boundingRect(c)}
            for c in contours if cv.contourArea(c) >= cfg['min_area']]

def visualize(img, objects):
    out = img.copy()
    for i, obj in enumerate(objects):
        x, y, w, h = obj['box']
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(out, '#%d' % (i + 1), (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv.putText(out, 'count: %d' % len(objects), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    return out

def pipeline(img, cfg):
    img = resize_to_width(img, cfg['max_width'])
    pre = preprocess(img, cfg)
    mask = detect(pre, cfg)
    objects = analyze(mask, cfg)
    return visualize(img, objects), mask, objects

def process(frame):
    for key, maximum in TUNABLE:                  # 트랙바 값 → CONFIG
        CONFIG[key] = cv.getTrackbarPos(key, WIN)
    t0 = cv.getTickCount()
    result, mask, objects = pipeline(frame, CONFIG)
    ms = (cv.getTickCount() - t0) / cv.getTickFrequency() * 1000
    cv.putText(result, '%.0f ms' % ms, (10, result.shape[0] - 10), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return result, mask

# 트랙바를 튜닝한 뒤 이 값을 설계서에 기록하세요
print('현재 CONFIG:', CONFIG)
`, desc: '<p>입력을 <code>stuff.jpg</code> 나 📷 웹캠(없으면 🎞️ <code>cup.mp4</code> 동영상)으로 바꾸고 트랙바를 조절하세요. 좋은 값을 찾으면 <b>CONFIG 의 기본값을 그 값으로 바꾸고 설계서에도 기록</b>합니다. 파라미터를 “감”이 아니라 “기록”으로 관리하는 습관이 중요합니다.</p>' },
      { type: 'text', html: `<h3>6. 스켈레톤을 내 주제로 바꾸는 법</h3>
<p>주제가 달라져도 <b>틀은 그대로</b> 두고 함수의 <b>안쪽만</b> 바꿉니다. 예를 들어 “색깔별 캔디 세기”라면:</p>
<ul>
<li><code>CONFIG</code>: Canny 값 대신 색 이름별 HSV 범위</li>
<li><code>preprocess</code>: 흑백 대신 HSV 변환</li>
<li><code>detect</code>: Canny 대신 색마다 <code>inRange</code> + 열기 → 색별 마스크 사전(dict)</li>
<li><code>analyze</code>: 색별로 컨투어를 세어 <code>{'GREEN': 3, 'BLUE': 3}</code></li>
<li><code>visualize</code>: 색 이름 라벨과 합계 표시</li>
</ul>` },
      { type: 'code', title: '스켈레톤 ③ · 주제 바꾸기 예: 색깔별 캔디 세기', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {
    'input': 'smarties.png',
    'colors': {                      # 이름: (HSV 하한, HSV 상한, 그릴 색 BGR)
        'GREEN': ((40, 100, 80), (80, 255, 255), (0, 200, 0)),
        'BLUE': ((100, 120, 70), (130, 255, 255), (255, 0, 0)),
    },
    'open_kernel': 5,
    'min_area': 500,
}

def load_input(name):
    img = cv.imread(name)
    if img is None:
        raise FileNotFoundError(name)
    return img

def preprocess(img, cfg):                        # 흑백 → HSV 로 교체
    return cv.cvtColor(img, cv.COLOR_BGR2HSV)

def detect(hsv, cfg):                            # Canny → 색별 inRange 로 교체
    k = np.ones((cfg['open_kernel'], cfg['open_kernel']), np.uint8)
    masks = {}
    for name, (lower, upper, draw) in cfg['colors'].items():
        m = cv.inRange(hsv, np.array(lower), np.array(upper))
        masks[name] = cv.morphologyEx(m, cv.MORPH_OPEN, k)
    return masks

def analyze(masks, cfg):                         # 색별로 개수와 위치
    found = {}
    for name, m in masks.items():
        contours, _ = cv.findContours(m, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
        found[name] = [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= cfg['min_area']]
    return found

def visualize(img, found, cfg):
    out = img.copy()
    y_text = 25
    for name, boxes in found.items():
        color = cfg['colors'][name][2]
        for (x, y, w, h) in boxes:
            cv.rectangle(out, (x, y), (x + w, y + h), color, 2)
        cv.putText(out, '%s: %d' % (name, len(boxes)), (10, y_text), cv.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        y_text += 30
    return out

def pipeline(img, cfg):
    hsv = preprocess(img, cfg)
    masks = detect(hsv, cfg)
    found = analyze(masks, cfg)
    result = visualize(img, found, cfg)
    all_mask = np.zeros(img.shape[:2], np.uint8)
    for m in masks.values():
        all_mask = cv.bitwise_or(all_mask, m)
    debug = np.hstack([img, cv.cvtColor(all_mask, cv.COLOR_GRAY2BGR), result])
    return result, debug, found

result, debug, found = pipeline(load_input(CONFIG['input']), CONFIG)
for name, boxes in found.items():
    print(name, '캔디', len(boxes), '개')
cv.imshow('debug: input | masks | result', debug)
`, desc: '<p>틀(pipeline, 함수 이름, 반환 형식)은 그대로이고 <b>각 함수의 안쪽만</b> 바뀌었습니다. 왼쪽 아래 가장자리에 잘린 초록 캔디도 세어지는데, 이것을 셀지 말지도 요구사항에서 정해야 할 <b>설계 결정</b>입니다.</p>' },
      { type: 'tip', html: `<p><b>팀 작업 요령</b>: 함수의 <b>이름·입력·출력 형식</b>만 먼저 합의하면, 한 사람이 <code>detect()</code> 를 고치는 동안 다른 사람은 가짜 마스크(예: 직접 그린 흰 원)를 넣어 <code>analyze()</code>·<code>visualize()</code> 를 동시에 만들 수 있습니다.</p>` },
      { type: 'checklist', title: '오늘의 기획 완료 체크 (교시 끝나기 전 확인)', items: [
        '주제 1개 확정 (기준표 점수 기록)',
        '테스트 입력 이미지 3장 이상 확보 또는 촬영 계획 확정',
        '필수 요구사항 3~4개를 확인 가능한 문장으로 작성',
        '파이프라인 설계서 ①~⑤ 단계 표 작성',
        '위험 요소 3개 이상과 대책 작성',
        '팀원별 역할과 w4-8 까지 할 일 분담',
        '스켈레톤 코드를 팀 주제용으로 복사해 CONFIG 초안 작성',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 코드로 쓰는 설계서 점검표',
        desc: `<p>설계서의 핵심 항목을 파이썬 사전(dict)으로 적고, <b>빠진 항목이 있으면 알려주는 점검 코드</b>를 완성하세요. <code># TODO</code> 로 표시된 값에 우리 팀 내용을 채우고, <code>check_design()</code> 이 (1) 빈 문자열 항목 (2) 필수 요구사항 3개 미만 (3) 테스트 이미지 3장 미만 을 찾아 경고하게 만듭니다.</p>`,
        starter: String.raw`
DESIGN = {
    'team': '',                                   # TODO: 팀 이름
    'topic': '책상 위 물건 개수 세기',              # TODO: 우리 주제로
    'inputs': ['stuff.jpg'],                      # TODO: 테스트 이미지 3장 이상
    'must': ['물건마다 사각형과 번호를 그린다'],     # TODO: 필수 요구사항 3~4개
    'nice': [],                                   # 선택 요구사항
    'pipeline': {
        'input': 'imread, resize',
        'preprocess': 'cvtColor GRAY, GaussianBlur',
        'detect': '',                             # TODO
        'analyze': '',                            # TODO
        'output': 'rectangle, putText',
    },
    'risks': ['조명이 바뀌면 엣지가 달라짐'],        # TODO: 3개 이상
}

def check_design(d):
    problems = []
    # 1) 빈 문자열 항목 찾기 (최상위 + pipeline 안쪽)
    for key, value in d.items():
        if value == '':
            problems.append('"%s" 가 비어 있음' % key)
    # TODO: d['pipeline'] 안의 빈 단계도 찾아서 problems 에 추가
    # TODO: 필수 요구사항(must)이 3개 미만이면 추가
    # TODO: 테스트 이미지(inputs)가 3장 미만이면 추가
    # TODO: 위험(risks)이 3개 미만이면 추가
    return problems

problems = check_design(DESIGN)
print('== 설계서 점검 결과 ==')
if problems:
    for p in problems:
        print(' - 보완 필요:', p)
else:
    print(' 모든 항목 작성 완료!')
`,
        hint: `<p><code>for step, how in d['pipeline'].items(): if how == '': problems.append(...)</code>, <code>if len(d['must']) &lt; 3: problems.append('필수 요구사항 %d개 (3개 이상 필요)' % len(d['must']))</code>. 모든 TODO 를 채우면 “모든 항목 작성 완료!”가 나와야 합니다.</p>`,
        solution: String.raw`
DESIGN = {
    'team': 'Vision Rangers',
    'topic': '책상 위 물건 개수 세기',
    'inputs': ['stuff.jpg', 'desk1.jpg', 'desk2.jpg'],
    'must': ['물건마다 사각형과 번호를 그린다',
             '물건 개수를 화면과 콘솔에 출력한다',
             '테스트 이미지 3장 중 2장 이상에서 개수가 정확하다',
             '입력/검출/결과 디버그 뷰가 있다'],
    'nice': ['웹캠에서 실시간 동작', '크기별 SMALL/LARGE 라벨'],
    'pipeline': {
        'input': 'imread, resize',
        'preprocess': 'cvtColor GRAY, GaussianBlur',
        'detect': 'Canny, morphologyEx CLOSE',
        'analyze': 'findContours, contourArea, boundingRect',
        'output': 'rectangle, putText',
    },
    'risks': ['조명이 바뀌면 엣지가 달라짐', '물건끼리 붙으면 하나로 셈', '무늬 있는 책상은 엣지가 많음'],
}

def check_design(d):
    problems = []
    for key, value in d.items():
        if value == '':
            problems.append('"%s" 가 비어 있음' % key)
    for step, how in d['pipeline'].items():
        if how == '':
            problems.append('파이프라인 단계 "%s" 가 비어 있음' % step)
    if len(d['must']) < 3:
        problems.append('필수 요구사항 %d개 (3개 이상 필요)' % len(d['must']))
    if len(d['inputs']) < 3:
        problems.append('테스트 이미지 %d장 (3장 이상 필요)' % len(d['inputs']))
    if len(d['risks']) < 3:
        problems.append('위험 요소 %d개 (3개 이상 필요)' % len(d['risks']))
    return problems

problems = check_design(DESIGN)
print('== 설계서 점검 결과 ==')
if problems:
    for p in problems:
        print(' - 보완 필요:', p)
else:
    print(' 모든 항목 작성 완료!')
`,
      },
      {
        title: '실습 2 · 스켈레톤을 우리 주제로 바꾸기 (예: 밝은 물체만 세기)',
        desc: `<p>스켈레톤의 <code>detect()</code> 를 바꿔 <code>stuff.jpg</code> 에서 <b>배경보다 밝은 물체(흰 공, 동전)만</b> 세는 버전을 만들어 보세요. Canny 대신 흑백 이미지에 <code>threshold</code>(CONFIG 의 <code>bright_thresh</code>, 기본 185)를 쓰고, 열기로 잡티를 지웁니다. 최소 면적은 500 으로 올립니다. 결과는 2개(공, 동전)가 나와야 합니다. 임계값을 175~195 사이에서 바꿔 보며 <b>결과가 얼마나 민감한지</b>도 관찰해 설계서의 위험 목록에 적어 보세요. 여러분 팀 주제가 있다면 그 주제에 맞게 <code>detect()</code>/<code>analyze()</code> 를 바꿔도 좋습니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {
    'input': 'stuff.jpg',
    'blur': 5,
    'canny_low': 50,
    'canny_high': 150,
    'close_kernel': 7,
    'min_area': 300,
    # TODO: 'bright_thresh': 185, 'open_kernel': 5 추가, min_area 는 500 으로
}

def preprocess(img, cfg):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return cv.GaussianBlur(gray, (cfg['blur'], cfg['blur']), 0)

def detect(pre, cfg):
    # TODO: Canny + 닫기 대신 → threshold(bright_thresh) + 열기(open_kernel) 로 바꾸기
    edges = cv.Canny(pre, cfg['canny_low'], cfg['canny_high'])
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (cfg['close_kernel'], cfg['close_kernel']))
    return cv.morphologyEx(edges, cv.MORPH_CLOSE, kernel, iterations=2)

def analyze(mask, cfg):
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [{'area': cv.contourArea(c), 'box': cv.boundingRect(c)} for c in contours if cv.contourArea(c) >= cfg['min_area']]

def visualize(img, objects):
    out = img.copy()
    for i, obj in enumerate(objects):
        x, y, w, h = obj['box']
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, 'count: %d' % len(objects), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    return out

def pipeline(img, cfg):
    pre = preprocess(img, cfg)
    mask = detect(pre, cfg)
    objects = analyze(mask, cfg)
    result = visualize(img, objects)
    debug = np.hstack([cv.cvtColor(mask, cv.COLOR_GRAY2BGR), result])
    return result, debug, objects

result, debug, objects = pipeline(cv.imread(CONFIG['input']), CONFIG)
print('물체 수:', len(objects))
cv.imshow('debug: mask | result', debug)
`,
        hint: `<p><code>_, mask = cv.threshold(pre, cfg['bright_thresh'], 255, cv.THRESH_BINARY)</code> → <code>cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((k, k), np.uint8))</code>. 나머지 함수(analyze, visualize, pipeline)는 <b>한 줄도 고치지 않아도</b> 동작하는지 확인하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {
    'input': 'stuff.jpg',
    'blur': 5,
    'min_area': 500,
    'bright_thresh': 185,
    'open_kernel': 5,
}

def preprocess(img, cfg):
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    return cv.GaussianBlur(gray, (cfg['blur'], cfg['blur']), 0)

def detect(pre, cfg):
    _, mask = cv.threshold(pre, cfg['bright_thresh'], 255, cv.THRESH_BINARY)
    k = cfg['open_kernel']
    return cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((k, k), np.uint8))

def analyze(mask, cfg):
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [{'area': cv.contourArea(c), 'box': cv.boundingRect(c)} for c in contours if cv.contourArea(c) >= cfg['min_area']]

def visualize(img, objects):
    out = img.copy()
    for i, obj in enumerate(objects):
        x, y, w, h = obj['box']
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, 'count: %d' % len(objects), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    return out

def pipeline(img, cfg):
    pre = preprocess(img, cfg)
    mask = detect(pre, cfg)
    objects = analyze(mask, cfg)
    result = visualize(img, objects)
    debug = np.hstack([cv.cvtColor(mask, cv.COLOR_GRAY2BGR), result])
    return result, debug, objects

result, debug, objects = pipeline(cv.imread(CONFIG['input']), CONFIG)
print('물체 수:', len(objects))
cv.imshow('debug: mask | result', debug)
`,
      },
    ],
    quiz: [
      { q: '다음 중 “확인 가능한” 요구사항으로 가장 적절한 것은?', options: ['테스트 사진 5장 중 4장 이상에서 동전 개수가 정확히 맞는다', '사용자가 만족하는 결과를 보여준다', '동전을 잘 인식한다', '최대한 빠르게 동작한다'], answer: 0, explain: '숫자나 예/아니오로 판정할 수 있어야 완성 여부와 개선 정도를 객관적으로 확인할 수 있습니다.' },
      { q: '스켈레톤 코드에서 임계값·커널 크기 등을 CONFIG 사전 한 곳에 모으는 주된 이유는?', options: ['실행 속도가 빨라져서', '전역 변수를 쓰면 안 되어서', 'OpenCV 함수가 사전만 받아서', '튜닝할 값을 한곳에서 찾고 바꾸고 기록하기 쉬워서'], answer: 3, explain: '숫자가 코드 곳곳에 흩어져 있으면 어떤 값을 바꿨는지 추적하기 어렵습니다. CONFIG 에 모으면 트랙바 연결과 설계서 기록도 쉬워집니다.' },
      { q: '이미지 실행과 process(frame) 이 같은 pipeline() 함수를 공유하도록 만드는 장점은?', options: ['while 루프를 쓸 수 있게 된다', 'process 가 필요 없어진다', '코드를 한 번만 고치면 이미지 테스트와 웹캠 버전에 모두 반영된다', '디버그 뷰가 자동으로 사라진다'], answer: 2, explain: '같은 로직을 두 번 복사해 두면 한쪽만 고치는 실수가 생깁니다. 하나의 pipeline 을 공유하면 정지 이미지로 검증한 결과가 웹캠에서도 그대로 쓰입니다.' },
    ],
  },

  // =====================================================================
  // w4-8 프로토타입 만들기
  // =====================================================================
  {
    id: 'w4-8',
    summary: '설계서를 바탕으로 “처음부터 끝까지 한 번 도는 가장 얇은 버전(MVP)”을 시간을 정해 만들고, 여러 장의 테스트 이미지로 결과를 표로 정리합니다. 실패 사례를 모아 원인 단계를 추적하고, 중간 점검과 동료 피드백으로 5주차 구현 계획을 세웁니다.',
    goals: [
      'MVP(최소 기능 제품)의 의미를 설명하고, 내 프로젝트의 MVP 범위를 정할 수 있다',
      '타임박싱으로 입력 → 출력까지 이어지는 프로토타입을 한 교시 안에 만들 수 있다',
      '파일 이름 목록을 반복하며 여러 이미지를 테스트하고 기대값과 비교한 결과표를 만들 수 있다',
      '실패 사례를 저장·분류하고, 파라미터를 한 번에 하나씩 바꿔 영향을 비교할 수 있다',
    ],
    schedule: [['도입 · MVP 와 타임박싱', 5], ['예제 프로토타입 v0 → v1', 10], ['여러 이미지 테스트 · 실패 수집', 10], ['팀 프로토타입 제작', 15], ['중간 점검 · 동료 피드백', 10]],
    blocks: [
      { type: 'text', html: `<h3>1. MVP: 가장 얇은 “끝에서 끝까지”</h3>
<p><b>MVP(Minimum Viable Product, 최소 기능 제품)</b>는 “핵심 기능 하나가 <b>입력부터 출력까지</b> 실제로 동작하는 가장 작은 버전”입니다.</p>
<p>자동차를 만든다면 바퀴 → 차체 → 엔진 순서로 만드는 것이 아니라, <b>킥보드 → 자전거 → 오토바이 → 자동차</b> 순서로 “매 단계 타고 갈 수 있는 것”을 만드는 방식입니다. 영상처리 프로젝트로 바꿔 말하면:</p>
<ul>
<li>✗ 전처리를 완벽하게 만든 다음 검출을 시작 → 마지막 날에야 처음으로 결과를 봄</li>
<li>✓ <b>대충이라도</b> 읽기 → 이진화 → 컨투어 → 개수 출력까지 먼저 연결 → 결과를 보며 가장 약한 단계부터 개선</li>
</ul>
<p>MVP 가 있으면 언제든 데모할 수 있고, <b>어느 단계가 문제인지</b> 결과로 판단할 수 있습니다.</p>` },
      { type: 'text', html: `<h3>2. 타임박싱(Timeboxing)</h3>
<p>작업마다 <b>시간 상자</b>를 정하고, 시간이 끝나면 완벽하지 않아도 다음 단계로 넘어갑니다. 영상처리는 파라미터 튜닝에 끝없이 빠지기 쉬워서 특히 중요합니다.</p>
<ul>
<li><b>15분 규칙</b>: 한 문제에 15분 넘게 막히면 ① 문제를 더 단순하게 줄이거나 ② 입력 조건을 바꾸거나(배경이 단순한 사진) ③ 강사·다른 팀에 질문합니다.</li>
<li>튜닝은 MVP 가 끝까지 돈 <b>다음</b>에 합니다.</li>
</ul>` },
      { type: 'table', head: ['시간 (오늘)', '할 일', '끝났다는 기준'], rows: [
        ['0 ~ 10분', '스켈레톤 복사, CONFIG 초안, 테스트 이미지 읽기', '입력 이미지가 imshow 로 보인다'],
        ['10 ~ 25분', '전처리 · 검출 · 분석을 가장 단순한 방법으로 연결', '결과 이미지에 무언가 그려지고 숫자가 출력된다'],
        ['25 ~ 35분', '테스트 이미지 3장 이상 반복 실행, 결과표 작성', '이미지별 기대값/결과/성공 여부 표'],
        ['35 ~ 45분', '실패 사례 저장, 원인 단계 추정, 중간 점검표 확인', '실패 사례 기록 2개 이상'],
        ['45 ~ 50분', '다른 팀과 데모 교환, 피드백 받기', '피드백 양식 작성'],
      ] },
      { type: 'text', html: `<h3>3. 예제 프로토타입: 책상 위 물건 개수 세기</h3>
<p>w4-7 설계서 예시 주제를 실제 프로토타입으로 만들어 봅시다. <b>v0</b> 은 함수도, 트랙바도, 예쁜 출력도 없이 <b>끝까지 도는 것</b>만 목표로 합니다.</p>` },
      { type: 'code', title: '프로토타입 v0 · 15줄짜리 끝에서 끝까지', code: String.raw`
import cv2 as cv
import numpy as np

img = cv.imread('stuff.jpg')                                            # 입력
gray = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0)  # 전처리
edges = cv.Canny(gray, 50, 150)                                         # 검출
kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (7, 7))
mask = cv.morphologyEx(edges, cv.MORPH_CLOSE, kernel, iterations=2)
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)  # 분석
objects = [c for c in contours if cv.contourArea(c) >= 300]

for c in objects:                                                       # 출력
    x, y, w, h = cv.boundingRect(c)
    cv.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
print('물건 개수:', len(objects))
cv.imshow('v0', img)
`, desc: '<p>5개가 나오면 v0 완성! 코드가 “예쁘지 않아도” 괜찮습니다. 이제 이 버전을 기준으로 <b>개선할 곳을 결과로 판단</b>할 수 있습니다.</p>' },
      { type: 'text', html: `<h3>4. v1: 스켈레톤으로 옮기고 디버그 뷰 붙이기</h3>
<p>v0 가 돌면 바로 w4-7 스켈레톤 구조로 옮깁니다. 여러 이미지를 테스트하려면 <b>함수(pipeline)</b>로 감싸야 하고, 실패 원인을 찾으려면 <b>디버그 뷰</b>가 필요하기 때문입니다. 이때 <b>동작은 v0 와 똑같아야</b> 합니다(구조만 바꾸고 결과가 같은지 확인 = 리팩터링).</p>` },
      { type: 'code', title: '프로토타입 v1 · pipeline 함수 + 디버그 뷰', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'blur': 5, 'canny_low': 50, 'canny_high': 150, 'close_kernel': 7, 'min_area': 300}

def preprocess(img, cfg):
    return cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (cfg['blur'], cfg['blur']), 0)

def detect(pre, cfg):
    edges = cv.Canny(pre, cfg['canny_low'], cfg['canny_high'])
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (cfg['close_kernel'], cfg['close_kernel']))
    return cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)

def analyze(mask, cfg):
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= cfg['min_area']]

def visualize(img, boxes):
    out = img.copy()
    for i, (x, y, w, h) in enumerate(boxes):
        cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(out, str(i + 1), (x, max(15, y - 5)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv.putText(out, 'count: %d' % len(boxes), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    return out

def pipeline(img, cfg):
    pre = preprocess(img, cfg)
    mask = detect(pre, cfg)
    boxes = analyze(mask, cfg)
    result = visualize(img, boxes)
    debug = np.hstack([cv.cvtColor(pre, cv.COLOR_GRAY2BGR), cv.cvtColor(mask, cv.COLOR_GRAY2BGR), result])
    return result, debug, boxes

result, debug, boxes = pipeline(cv.imread('stuff.jpg'), CONFIG)
print('v1 물건 개수:', len(boxes), '(v0 와 같아야 함)')
cv.imshow('v1 debug: preprocess | mask | result', cv.resize(debug, None, fx=0.5, fy=0.5))
`, desc: '<p>v0 와 개수가 같은지 꼭 확인하세요. 구조를 바꾸다 결과가 달라졌다면 옮기는 과정에서 실수가 생긴 것입니다.</p>' },
      { type: 'text', html: `<h3>5. 여러 이미지로 테스트하기</h3>
<p>한 장에서 잘 되는 것은 “우연”일 수 있습니다. <b>기대값(직접 센 정답)</b>을 적어 두고 여러 장을 한 번에 돌려 결과표를 만듭니다. 파일 이름 목록을 <code>for</code> 로 도는 것은 정해진 횟수만 반복하므로 웹 환경에서도 괜찮습니다. 창 이름을 이미지마다 다르게 하면 결과가 따로따로 표시됩니다.</p>
<p>테스트 세트에는 <b>목표 입력(책상 사진)</b>뿐 아니라, 한계를 알아보기 위한 <b>어려운 입력</b>(붙어 있는 물체, 다른 종류의 배경)도 섞습니다.</p>` },
      { type: 'code', title: '테스트 · 이미지 4장 결과표와 정확도', code: String.raw`
import cv2 as cv
import numpy as np

CONFIG = {'blur': 5, 'canny_low': 50, 'canny_high': 150, 'close_kernel': 7, 'min_area': 300}

def pipeline(img, cfg):
    pre = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (cfg['blur'], cfg['blur']), 0)
    edges = cv.Canny(pre, cfg['canny_low'], cfg['canny_high'])
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (cfg['close_kernel'], cfg['close_kernel']))
    mask = cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= cfg['min_area']]
    result = img.copy()
    for (x, y, w, h) in boxes:
        cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(result, 'count: %d' % len(boxes), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    return result, mask, boxes

# 파일 이름: (기대 개수, 종류)
TESTS = {
    'stuff.jpg': (5, 'target'),          # 목표 입력: 책상 위 물건
    'pic1.png': (6, 'stress'),           # 어려운 입력: 가까이 붙은 도형
    'smarties.png': (14, 'stress'),      # 어려운 입력: 맞닿은 캔디
    'water_coins.jpg': (24, 'stress'),   # 어려운 입력: 빽빽한 동전
}

passed = 0
print('%-16s %-7s %5s %5s  %s' % ('image', 'type', 'exp', 'got', 'result'))
for name, (expected, kind) in TESTS.items():
    img = cv.imread(name)
    result, mask, boxes = pipeline(img, CONFIG)
    ok = len(boxes) == expected
    passed += ok
    print('%-16s %-7s %5d %5d  %s' % (name, kind, expected, len(boxes), 'PASS' if ok else 'FAIL'))
    cv.imshow('test ' + name, result)                 # 이미지마다 다른 창 이름
print('정확도: %d / %d (%.0f%%)' % (passed, len(TESTS), passed / len(TESTS) * 100))
`, desc: '<p>목표 입력은 통과했지만 어려운 입력은 모두 실패합니다. 실패는 나쁜 것이 아니라 <b>프로토타입의 한계를 보여주는 데이터</b>입니다. 발표에서도 “어디까지 되고 어디서 안 되는지”를 보여주면 좋은 평가를 받습니다.</p>' },
      { type: 'text', html: `<h3>6. 실패 사례 모으기</h3>
<p>실패한 입력은 <b>디버그 뷰와 함께 파일로 저장</b>하고, 아래 형식으로 기록합니다. “원인 단계”를 적으려면 디버그 뷰의 칸을 왼쪽부터 보면서 <b>처음으로 이상해지는 칸</b>을 찾으면 됩니다.</p>` },
      { type: 'table', head: ['이미지', '기대 → 결과', '증상 (눈으로 본 것)', '원인 단계 추정', '다음에 시도할 것'], rows: [
        ['pic1.png', '6 → 4', '얼굴·물음표·위쪽 큰 직사각형이 한 상자로 묶임', '③ 검출: 닫기 커널이 커서 가까운 도형 엣지가 이어짐', '닫기 커널 줄이기, 엣지 대신 이진화'],
        ['smarties.png', '14 → 7', '맞닿은 캔디들이 한 덩어리', '③ 검출 + ④ 분석: 붙은 물체 분리 없음', '채도(S) 이진화 + 거리 변환'],
        ['water_coins.jpg', '24 → 8', '동전 여러 개가 큰 상자 하나', '③ 검출: 동전 무늬 엣지 + 닫기로 모두 연결', 'w4-4 동전 카운터 방식 적용'],
      ] },
      { type: 'code', title: '실패 사례 자동 저장 + 파라미터 하나씩 바꿔 보기', code: String.raw`
import cv2 as cv
import numpy as np

def pipeline(img, close_kernel=7, min_area=300):
    pre = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(pre, 50, 150)
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (close_kernel, close_kernel))
    mask = cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= min_area]
    result = img.copy()
    for (x, y, w, h) in boxes:
        cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)
    return result, mask, boxes

TESTS = {'stuff.jpg': 5, 'pic1.png': 6, 'smarties.png': 14}

# ① 실패 사례를 디버그 뷰와 함께 저장
for name, expected in TESTS.items():
    img = cv.imread(name)
    result, mask, boxes = pipeline(img)
    if len(boxes) != expected:
        debug = np.hstack([img, cv.cvtColor(mask, cv.COLOR_GRAY2BGR), result])
        cv.putText(debug, 'expected %d, got %d' % (expected, len(boxes)), (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        cv.imwrite('fail_' + name.split('.')[0] + '.png', debug)
        cv.imshow('FAIL ' + name, debug)

# ② 파라미터를 한 번에 하나만 바꿔 전체 테스트 세트에서 비교
print('close_kernel |', ' | '.join('%-12s' % n for n in TESTS), '| pass')
for ck in [3, 5, 7, 11]:
    counts = [len(pipeline(cv.imread(n), close_kernel=ck)[2]) for n in TESTS]
    n_pass = sum(c == e for c, e in zip(counts, TESTS.values()))
    print('%12d |' % ck, ' | '.join('%-12s' % ('%d/%d' % (c, e)) for c, e in zip(counts, TESTS.values())), '| %d' % n_pass)
`, desc: '<p>표를 보면 커널을 3 으로 줄이면 <code>pic1.png</code> 는 맞지만 <code>stuff.jpg</code> 가 틀립니다. <b>한 이미지를 고치면 다른 이미지가 깨질 수 있으므로</b>, 파라미터는 항상 <b>테스트 세트 전체</b>로 판단합니다. 이 표 자체가 훌륭한 발표 자료입니다.</p>' },
      { type: 'code', title: '프로토타입 실시간 버전 · process(frame)', code: String.raw`
import cv2 as cv
import numpy as np

WIN = 'prototype'
def nothing(x):
    pass
cv.namedWindow(WIN)
cv.createTrackbar('close kernel', WIN, 7, 21, nothing)
cv.createTrackbar('min area', WIN, 300, 5000, nothing)

def pipeline(img, close_kernel=7, min_area=300):
    pre = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(pre, 50, 150)
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (close_kernel, close_kernel))
    mask = cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    boxes = [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= min_area]
    result = img.copy()
    for (x, y, w, h) in boxes:
        cv.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(result, 'count: %d' % len(boxes), (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    return result, mask, boxes

def process(frame):
    t0 = cv.getTickCount()
    ck = max(1, cv.getTrackbarPos('close kernel', WIN))
    result, mask, boxes = pipeline(frame, ck, cv.getTrackbarPos('min area', WIN))
    ms = (cv.getTickCount() - t0) / cv.getTickFrequency() * 1000
    cv.putText(result, '%.0f ms' % ms, (10, result.shape[0] - 10), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    return result, mask
`, desc: '<p>📷 웹캠을 책상 위로 비추거나, 웹캠이 없으면 🎞️ 동영상(<code>cup.mp4</code>)을 입력으로 골라 보세요. 정지 이미지에서 튜닝한 값이 움직이는 영상에서도 통하는지 확인하는 것이 5주차 구현의 출발점입니다.</p>' },
      { type: 'checklist', title: '중간 점검 (교시 끝나기 10분 전)', items: [
        'MVP 가 입력 → 출력까지 오류 없이 한 번 돈다',
        '결과 이미지에 검출 결과(사각형·라벨·개수 등)가 그려진다',
        '디버그 뷰로 중간 단계를 볼 수 있다',
        '테스트 이미지 3장 이상에 대한 기대값/결과/성공 여부 표가 있다',
        '실패 사례 2개 이상을 원인 단계와 함께 기록했다',
        'CONFIG 의 현재 값을 설계서에 기록했다',
        '5주차(w5-1 ~ w5-4)에 개선할 목록 3가지를 우선순위대로 적었다',
      ] },
      { type: 'text', html: `<h3>7. 동료 피드백</h3>
<p>옆 팀과 짝을 지어 <b>3분 데모 + 2분 피드백</b>을 교환합니다. 데모하는 팀은 설명을 최소로 하고 <b>결과 화면과 결과표</b>를 보여주세요. 피드백하는 팀은 아래 양식을 채워 전달합니다.</p>` },
      { type: 'table', head: ['항목', '질문', '점수 (1~5)', '한 줄 코멘트'], rows: [
        ['문제 이해', '무엇을 입력받아 무엇을 출력하는지 30초 안에 이해됐나?', '', ''],
        ['동작', 'MVP 가 실제로 끝까지 돌아가는 것을 봤나?', '', ''],
        ['테스트', '여러 입력으로 테스트하고 결과를 숫자로 보여줬나?', '', ''],
        ['디버그', '실패 원인을 디버그 뷰로 설명할 수 있었나?', '', ''],
        ['제안', '가장 먼저 개선하면 좋을 한 가지는?', '-', ''],
        ['칭찬', '가장 인상적이었던 점 한 가지는?', '-', ''],
      ] },
      { type: 'tip', html: `<p><b>버전 저장 습관</b>: 잘 동작하는 버전이 생길 때마다 코드를 <code>prototype_v1.py</code> 처럼 복사해 두세요. 개선하다 망가져도 바로 돌아갈 수 있고, 발표에서 “v0 → v1 → v2 에서 정확도가 1/4 → 3/4 로 올랐다”처럼 <b>발전 과정</b>을 보여줄 수 있습니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 기대값 표로 정확도 계산하기',
        desc: `<p><code>smarties.png</code>, <code>detect_blob.png</code> 를 직접 보고 <b>물체 개수를 세어</b> <code>EXPECTED</code> 에 적으세요(아직 모르는 값은 <code>None</code>). 코드는 <code>None</code> 인 이미지는 “SKIP” 으로 표시하고 정확도 계산에서 빼야 합니다. 또 기대값과 결과의 <b>차이(오차)</b>도 함께 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def pipeline(img, close_kernel=7, min_area=300):
    pre = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(pre, 50, 150)
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (close_kernel, close_kernel))
    mask = cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= min_area]

EXPECTED = {
    'stuff.jpg': 5,
    'pic1.png': 6,
    'smarties.png': None,       # TODO: 직접 세어서 적기
    'detect_blob.png': None,    # TODO: 직접 세어서 적기
}

passed, tested = 0, 0
for name, expected in EXPECTED.items():
    got = len(pipeline(cv.imread(name)))
    # TODO: expected 가 None 이면 'SKIP' 출력 후 continue
    # TODO: 오차(got - expected)도 함께 출력
    ok = got == expected
    tested += 1
    passed += ok
    print('%-16s expected %s, got %d → %s' % (name, expected, got, 'PASS' if ok else 'FAIL'))

print('정확도: %d / %d' % (passed, tested))
`,
        hint: `<p><code>if expected is None: print(name, 'SKIP'); continue</code>. 오차는 <code>'%+d' % (got - expected)</code> 로 부호까지 표시하면 “더 많이 셌는지/적게 셌는지” 알 수 있습니다. smarties.png 는 가장자리에 잘린 캔디까지 14개, detect_blob.png 는 서로 떨어져 있는 덩어리 17개입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def pipeline(img, close_kernel=7, min_area=300):
    pre = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(pre, 50, 150)
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (close_kernel, close_kernel))
    mask = cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return [cv.boundingRect(c) for c in contours if cv.contourArea(c) >= min_area]

EXPECTED = {
    'stuff.jpg': 5,
    'pic1.png': 6,
    'smarties.png': 14,
    'detect_blob.png': 17,
}

passed, tested = 0, 0
for name, expected in EXPECTED.items():
    got = len(pipeline(cv.imread(name)))
    if expected is None:
        print('%-16s SKIP (기대값 없음)' % name)
        continue
    ok = got == expected
    tested += 1
    passed += ok
    print('%-16s expected %2d, got %2d (오차 %+d) → %s' % (name, expected, got, got - expected, 'PASS' if ok else 'FAIL'))

print('정확도: %d / %d (%.0f%%)' % (passed, tested, passed / tested * 100))
`,
      },
      {
        title: '실습 2 · 실패 사례 개선: 입력에 맞는 검출 방법 비교',
        desc: `<p><code>smarties.png</code> 는 엣지 방식(Canny + 닫기)으로 14개 중 7개만 찾았습니다. 캔디는 <b>채도가 높고</b> 배경은 흰색(채도 ≈ 0)이라는 점을 이용해 <code>detect_saturation()</code> 을 완성하세요: HSV 의 S 채널 → Otsu 이진화 → 5×5 열기. 두 방법을 <code>stuff.jpg</code>, <code>smarties.png</code> 에 모두 돌려 비교표를 출력하고, <b>어느 방법이 어느 입력에 맞는지</b> 결론을 주석으로 적으세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

def detect_edges(img):
    pre = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(pre, 50, 150)
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (7, 7))
    return cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)

def detect_saturation(img):
    # TODO: HSV 로 바꿔 S 채널(인덱스 1)을 꺼내기
    # TODO: Otsu 이진화 (THRESH_BINARY + THRESH_OTSU)
    # TODO: 5x5 커널로 열기
    return np.zeros(img.shape[:2], np.uint8)

def count(mask, min_area=300):
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return len([c for c in contours if cv.contourArea(c) >= min_area])

EXPECTED = {'stuff.jpg': 5, 'smarties.png': 14}
print('%-14s %4s %6s %11s' % ('image', 'exp', 'edges', 'saturation'))
for name, expected in EXPECTED.items():
    img = cv.imread(name)
    m1, m2 = detect_edges(img), detect_saturation(img)
    print('%-14s %4d %6d %11d' % (name, expected, count(m1), count(m2)))
    cv.imshow(name + ' edges | saturation', np.hstack([m1, m2]))

# 결론: TODO
`,
        hint: `<p><code>s = cv.cvtColor(img, cv.COLOR_BGR2HSV)[:, :, 1]</code> → <code>_, m = cv.threshold(s, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)</code> → <code>cv.morphologyEx(m, cv.MORPH_OPEN, np.ones((5, 5), np.uint8))</code>. stuff.jpg 의 연필·뚜껑은 채도가 낮아 채도 방식에서 빠집니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

def detect_edges(img):
    pre = cv.GaussianBlur(cv.cvtColor(img, cv.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv.Canny(pre, 50, 150)
    k = cv.getStructuringElement(cv.MORPH_ELLIPSE, (7, 7))
    return cv.morphologyEx(edges, cv.MORPH_CLOSE, k, iterations=2)

def detect_saturation(img):
    s = cv.cvtColor(img, cv.COLOR_BGR2HSV)[:, :, 1]
    _, m = cv.threshold(s, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    return cv.morphologyEx(m, cv.MORPH_OPEN, np.ones((5, 5), np.uint8))

def count(mask, min_area=300):
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return len([c for c in contours if cv.contourArea(c) >= min_area])

EXPECTED = {'stuff.jpg': 5, 'smarties.png': 14}
print('%-14s %4s %6s %11s' % ('image', 'exp', 'edges', 'saturation'))
for name, expected in EXPECTED.items():
    img = cv.imread(name)
    m1, m2 = detect_edges(img), detect_saturation(img)
    print('%-14s %4d %6d %11d' % (name, expected, count(m1), count(m2)))
    cv.imshow(name + ' edges | saturation', np.hstack([m1, m2]))

# 결론: 흰 배경 위 채도 높은 물체(캔디)는 채도 방식이 훨씬 정확하고(7 → 13),
#       무채색 물체가 섞인 책상 사진(연필·검은 뚜껑)은 엣지 방식이 맞다.
#       → 요구사항에서 입력 조건을 정하고, 그 입력에 맞는 방법을 고른다.
#       → 맞닿은 캔디 1쌍은 여전히 붙어 있으므로 다음 단계로 거리 변환(w4-4)을 시도.
`,
      },
    ],
    quiz: [
      { q: 'MVP(최소 기능 제품) 방식으로 프로토타입을 만드는 순서로 가장 알맞은 것은?', options: ['전처리를 완벽하게 튜닝한 뒤 다음 단계로 넘어간다', '모든 선택 기능을 동시에 만든다', '발표자료를 먼저 만든다', '단순한 방법으로라도 입력부터 출력까지 먼저 연결하고, 결과를 보며 약한 단계를 개선한다'], answer: 3, explain: '끝까지 도는 버전이 있어야 어느 단계가 문제인지 결과로 판단할 수 있고, 언제든 데모가 가능합니다.' },
      { q: '닫기 커널을 3 으로 줄였더니 pic1.png 는 맞았지만 stuff.jpg 가 틀렸다. 올바른 다음 행동은?', options: ['테스트 세트 전체의 통과 수를 비교해 값을 고르고, 필요하면 입력 조건이나 방법 자체를 바꾼다', 'pic1.png 에 맞춘 값 3 을 바로 채택한다', 'stuff.jpg 를 테스트에서 뺀다', '커널을 무작위로 계속 바꾼다'], answer: 0, explain: '파라미터는 한 장이 아니라 테스트 세트 전체로 평가합니다. 한 값으로 모두 맞추기 어렵다면 입력 범위를 정하거나 다른 검출 방법을 고려합니다.' },
      { q: '실패 사례에서 “원인 단계”를 찾는 가장 좋은 방법은?', options: ['코드를 처음부터 다시 쓴다', '결과 이미지만 여러 번 본다', '디버그 뷰를 입력 쪽부터 차례로 보며 처음으로 이상해지는 단계를 찾는다', '임계값을 모두 0 으로 바꾼다'], answer: 2, explain: '파이프라인은 앞 단계의 출력이 다음 단계의 입력이므로, 처음 이상해지는 칸이 고쳐야 할 단계입니다.' },
      { q: '여러 테스트 이미지를 for 문으로 돌며 cv.imshow 할 때 창 이름을 이미지마다 다르게 하는 이유는?', options: ['같은 이름을 쓰면 오류가 나서', '같은 이름이면 마지막 결과로 덮어써져 이전 이미지 결과를 볼 수 없어서', 'imshow 는 한 번만 호출할 수 있어서', '속도가 빨라져서'], answer: 1, explain: '웹 환경에서도 같은 창 이름으로 imshow 하면 덮어씁니다. 이름을 다르게 하면 각 결과가 별도 카드로 남습니다.' },
    ],
  },
]);
