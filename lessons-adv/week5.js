/* 심화 5주차: 프로젝트 Ⅱ · 구현과 발표 — docs/LESSON_GUIDE.md · docs/ADVANCED_GUIDE.md 참고
 * 공통 예제: “스마트 선반 상품 인식기(Smart Shelf Product Recognizer)”
 *   기준(정면) 이미지 4종 → ORB 매칭 + 호모그래피 검증 → 정면화 crop → SVM 확인 → solvePnP 거리 → 표시
 */
COURSE.addLessons([
  // =====================================================================
  // a5-1 구현 ① 데이터 준비와 특징 설계
  // =====================================================================
  {
    id: 'a5-1',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg'],
    summary: '이번 주 공통 예제 “스마트 선반 상품 인식기”의 재료를 준비합니다. 상품 카탈로그를 딕셔너리로 정리하고, 원근 · 밝기 · 잡음 증강으로 학습 데이터를, 정답이 있는 합성 선반 장면으로 테스트 데이터를 만든 뒤, ORB · 색 히스토그램 · HOG 특징 추출기를 모듈로 설계합니다.',
    goals: [
      '상품 이름 → 이미지 딕셔너리로 데이터셋 구조를 설계하고, 학습 · 테스트 · 실제 장면 데이터의 역할을 구분할 수 있다',
      'warpPerspective · 밝기 · 잡음으로 증강 함수를 만들고, 난수 시드(rng)로 결과를 재현할 수 있다',
      '정답(꼭짓점 좌표)이 함께 저장되는 합성 선반 장면을 만들어 자동 평가에 쓸 수 있다',
      'ORB 기술자 · 색 히스토그램 · HOG 특징 추출기를 docstring 이 있는 함수로 만들고 차원 · dtype 을 확인할 수 있다',
    ],
    schedule: [['도입: 5주차 흐름과 스마트 선반 예제', 5], ['개념: 데이터셋 구조 · 증강 · 합성 장면', 12], ['예제 실습', 18], ['팀 프로젝트에 적용', 10], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 5주차: 프로토타입을 “측정할 수 있는 시스템”으로</h3>
<p>4주차에 팀별로 주제를 정하고 기준선(baseline) 프로토타입을 만들었습니다. 5주차에는 이 프로토타입을 <b>데이터로 평가하고, 튜닝하고, 실시간으로 돌리고, 발표</b>할 수 있게 완성합니다.
심화 프로젝트는 입문 프로젝트와 달리 “잘 되는 것 같다”로 끝나지 않고 <b>정확도 · 정밀도 · 재현율 · FPS 같은 숫자</b>로 말해야 합니다.</p>
<p>팀마다 주제가 다르므로 수업은 하나의 공통 예제 <b>“스마트 선반 상품 인식기(Smart Shelf Product Recognizer)”</b>를 교시마다 키워 가며 <b>어느 심화 프로젝트에나 쓰이는 구현 기술</b>을 배웁니다.</p>
<ul>
  <li><b>문제</b>: 편의점 선반 사진(또는 웹캠)에서 등록된 상품 4종을 찾아 위치 · 이름 · 거리를 표시한다</li>
  <li><b>1주차 기술</b>: ORB 특징점 + knnMatch 비율 테스트 + RANSAC 호모그래피로 상품 위치 찾기</li>
  <li><b>3주차 기술</b>: 색 히스토그램 + HOG 특징과 SVM/kNN 으로 “정말 그 상품인지” 한 번 더 확인</li>
  <li><b>2주차 기술</b>: 상품의 실제 크기(cm)와 solvePnP 로 카메라까지 거리 · 기울기 추정</li>
</ul>` },
      { type: 'table', head: ['교시', '스마트 선반 인식기에 추가되는 것', '팀 프로젝트에서 할 일'], rows: [
        ['a5-1', '상품 카탈로그, 증강, 합성 장면(정답 포함), 특징 추출 모듈', '데이터 폴더 · 라벨 정리, 특징 함수 모듈화'],
        ['a5-2', 'kNN · SVM 학습, 혼동 행렬, 정밀도/재현율, 파라미터 탐색', '평가 지표 계산, 기준선 대비 개선 수치'],
        ['a5-3', 'process(frame), 단계별 시간, 축소 · N프레임마다 인식 + 광류 추적', '웹캠 · 동영상에서 실시간 동작'],
        ['a5-4', 'solvePnP 거리 · 3D 축, 트랙바 튜닝, 클릭 선택 정보 패널', '3D 정보 · 인터랙션 결합'],
        ['a5-5 ~ a5-8', '실패 사례 재현 · 테스트, 평가 보고서, 발표, 회고', '마무리와 발표'],
      ] },
      { type: 'text', html: `
<h3>2. 데이터셋 구조 — “이름 → 이미지들” 딕셔너리</h3>
<p>머신러닝이 들어간 프로젝트는 코드보다 <b>데이터 정리</b>에서 먼저 무너집니다. 파일이 여기저기 흩어져 있고, 어떤 이미지가 학습용인지 테스트용인지 헷갈리면 평가 숫자를 믿을 수 없습니다. 처음부터 구조를 정해 둡시다.</p>
<ul>
  <li><b>카탈로그(catalog)</b>: 상품마다 정면 기준 이미지 1장 — <code>{'cookie': img, 'graffiti': img, ...}</code>. 특징점 매칭의 “쿼리”로 씁니다.</li>
  <li><b>학습 세트(train)</b>: 기준 이미지를 <b>증강</b>해 만든 작은 조각(64×64) + <b>배경 조각('none')</b>. 분류기를 학습합니다.</li>
  <li><b>테스트 세트(test)</b>: 학습에 쓰지 않은 <b>다른 방식</b>으로 만든 데이터 — 합성 선반 장면에서 잘라낸 조각. 성능은 여기서만 잽니다.</li>
  <li><b>실제 장면</b>: <code>box_in_scene.png</code>, 웹캠 스냅샷 — 합성 데이터로 튜닝한 결과가 실제로도 통하는지 마지막에 확인</li>
</ul>
<p>클래스 이름은 <code>CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']</code> 처럼 <b>순서가 고정된 리스트</b>로 두고, 라벨은 그 인덱스(0~4)를 씁니다. <code>'none'</code>(상품 아님) 클래스가 있어야 분류기가 “모르겠다”고 말할 수 있습니다.</p>` },
      { type: 'image', src: 'adv/box.png', caption: '상품 ① cookie — 특징 매칭 튜토리얼의 box.png (324×223). 나머지 상품은 코드에서 잘라내거나 직접 그려 만듭니다' },
      { type: 'code', title: '예제 1 · 상품 카탈로그와 디버그 격자', code: String.raw`
import cv2 as cv
import numpy as np


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리를 만든다 (4종)."""
    cookie = cv.imread('box.png')                                              # 과자 상자 (흑백 사진)
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))   # 그래피티 포스터
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))    # 축구 카드
    tea = np.full((260, 220, 3), 245, np.uint8)                                # 직접 그린 녹차 라벨
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128                                                    # 투명하지 않은 곳만
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_grid(images, labels=None, cols=4, cell=(200, 200)):
    """여러 이미지를 같은 크기 칸(비율 유지)에 맞춰 격자 한 장으로 합친다."""
    cw, ch = cell
    cells = []
    for i, im in enumerate(images):
        if im.ndim == 2:
            im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
        s = min(cw / im.shape[1], (ch - 20) / im.shape[0])
        small = cv.resize(im, (max(1, int(im.shape[1] * s)), max(1, int(im.shape[0] * s))), interpolation=cv.INTER_AREA)
        c = np.full((ch, cw, 3), 40, np.uint8)
        y0, x0 = 20 + (ch - 20 - small.shape[0]) // 2, (cw - small.shape[1]) // 2
        c[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
        if labels:
            cv.putText(c, str(labels[i]), (4, 14), cv.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv.LINE_AA)
        cells.append(c)
    while len(cells) % cols:
        cells.append(np.full((ch, cw, 3), 40, np.uint8))
    return np.vstack([np.hstack(cells[r:r + cols]) for r in range(0, len(cells), cols)])


products = make_products()
orb = cv.ORB_create(500)
labels = []
print(f'{"name":9s} {"size(w x h)":>12s} {"mean":>6s} {"ORB kp":>7s}')
for name, img in products.items():
    kp = orb.detect(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    print(f'{name:9s} {img.shape[1]:>5d} x {img.shape[0]:<4d} {img.mean():6.1f} {len(kp):7d}')
    labels.append(f'{name} {img.shape[1]}x{img.shape[0]} kp={len(kp)}')

cv.imshow('catalog', make_grid(list(products.values()), labels))
`, desc: '<p>카탈로그는 “이름으로 꺼내 쓰는” 딕셔너리입니다. 상품을 추가 · 삭제해도 나머지 코드는 <code>for name, img in products.items()</code> 로 그대로 동작합니다. ORB 키포인트 수가 너무 적은 상품(대략 100개 미만)은 특징 매칭으로 찾기 어렵다는 신호입니다.</p>' },
      { type: 'text', html: `
<h3>3. 증강(Augmentation) — 한 장으로 수백 장 만들기</h3>
<p>상품마다 기준 이미지가 한 장뿐이면 분류기는 “정면 · 같은 밝기”만 배웁니다. 실제 선반에서는 <b>기울어지고(원근), 어둡거나 밝고(조명), 잡음이 낀</b> 모습으로 보입니다. 그래서 기준 이미지를 일부러 흔들어 비슷한 변형을 많이 만듭니다.</p>
<ul>
  <li><b>원근 흔들림</b>: 네 꼭짓점을 조금씩 움직여 <code>cv.getPerspectiveTransform</code> → <code>cv.warpPerspective</code> (호모그래피가 조금 틀렸을 때의 모습도 흉내)</li>
  <li><b>밝기 · 대비</b>: <code>cv.convertScaleAbs(img, alpha=대비, beta=밝기)</code></li>
  <li><b>잡음</b>: 정수 난수를 더하고 0~255 로 자르기 (<code>np.clip</code>)</li>
  <li><b>크기 통일</b>: 모든 조각을 64×64 로 — 특징 벡터 길이가 같아야 학습할 수 있습니다</li>
</ul>
<p>무작위는 <code>rng = np.random.default_rng(seed)</code> 로 만든 <b>난수 생성기</b>를 함수에 넘겨 씁니다. 같은 seed 면 매번 같은 데이터가 나오므로 <b>실험을 재현</b>할 수 있고, 팀원과 결과를 비교할 수 있습니다.</p>` },
      { type: 'code', title: '예제 2 · 증강 함수와 증강 결과 격자', code: String.raw`
import cv2 as cv
import numpy as np


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 사이의 정수 잡음을 더한다 (uint8 범위로 자름)."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def augment(img, rng, size=64, jitter=0.06):
    """기준 이미지를 원근 · 밝기 · 잡음으로 흔든 size×size 조각을 돌려준다.

    jitter : 꼭짓점을 흔드는 정도 (size 에 대한 비율)
    """
    h, w = img.shape[:2]
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(src, dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


products = make_products()
rng = np.random.default_rng(0)             # seed 를 바꾸면 다른 증강, 같으면 같은 증강

rows = []
for name, img in products.items():
    ref = cv.resize(img, (64, 64), interpolation=cv.INTER_AREA)
    augs = [augment(img, rng) for _ in range(7)]
    row = np.hstack([ref] + augs)
    cv.rectangle(row, (0, 0), (63, 63), (0, 255, 255), 1)            # 첫 칸 = 원본
    rows.append(row)
grid = cv.resize(np.vstack(rows), None, fx=2, fy=2, interpolation=cv.INTER_NEAREST)
print('격자 크기:', grid.shape, '(한 줄 = 상품 1종, 첫 칸 = 원본 축소)')

# 재현성 확인: 같은 seed → 완전히 같은 결과
a = augment(products['tea'], np.random.default_rng(42))
b = augment(products['tea'], np.random.default_rng(42))
c = augment(products['tea'], np.random.default_rng(43))
print('seed 42 두 번 같은가?', np.array_equal(a, b), '/ seed 42 vs 43 같은가?', np.array_equal(a, c))
cv.imshow('augmentations', grid)
`, desc: '<p>줄마다 첫 칸(노란 테두리)이 원본, 나머지 7칸이 증강입니다. 너무 약하면 다양성이 없고, 너무 강하면(예: jitter=0.3) 상품이 알아볼 수 없게 찌그러져 오히려 학습을 망칩니다. <b>실제 장면에서 볼 법한 범위</b>로 정하세요.</p>' },
      { type: 'text', html: `
<h3>4. 합성 선반 장면 — 정답을 “공짜로” 얻기</h3>
<p>인식기를 평가하려면 <b>정답(ground truth)</b> — “이 장면에서 cookie 는 이 네 꼭짓점에 있다” — 이 필요합니다. 실제 사진에 정답을 손으로 표시하는 일(라벨링)은 오래 걸립니다.
그래서 개발 단계에서는 <b>배경에 상품을 원근 변환해 붙인 합성 장면</b>을 만들고, 붙일 때 쓴 꼭짓점을 그대로 정답으로 저장합니다.</p>
<ul>
  <li>배경: 그라데이션 나무 선반 + 선반 판 → <code>make_shelf()</code></li>
  <li>배치: 6칸 중 무작위 자리 + 크기(가로 150~190px) · 회전(±15°) · 원근 흔들림 → <code>random_quad()</code></li>
  <li>붙이기: 상품을 꼭짓점에 맞게 <code>warpPerspective</code> 하고 마스크로 복사 → <code>paste()</code></li>
  <li><b>방해물(distractor)</b>: 카탈로그에 없는 상품(fruits.jpg)도 함께 놓아 “없는 상품을 찾았다고 우기는지”(오검출) 확인</li>
</ul>
<p>합성 데이터의 한계도 기억하세요. 실제 카메라의 흐림 · 반사 · 가림은 없으므로, 마지막에는 반드시 <b>실제 장면</b>(<code>box_in_scene.png</code>, 웹캠)으로 확인합니다.</p>` },
      { type: 'code', title: '예제 3 · 정답이 있는 합성 선반 장면 만들기', code: String.raw`
import cv2 as cv
import numpy as np

SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]   # 선반 6칸의 중심


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경: 위가 밝고 아래가 어두운 그라데이션 + 선반 판 2개."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])        # 왼위 → 오위 → 오아래 → 왼아래
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (밝기 · 대비도 무작위). scene 을 직접 수정."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), quad - np.float32([x0, y0]))
    img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)                                   # 상품이 놓일 작은 영역에서만 변환 (빠름)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    roi = scene[y0:y1, x0:x1]
    np.copyto(roi, cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개(float32)} 를 돌려준다."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:                                             # 카탈로그에 없는 방해물
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)   # 세로로 긴 상품은 폭을 줄임
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth


products = make_products()
scene, truth = make_scene(products, np.random.default_rng(7))

vis = scene.copy()
for name, quad in truth.items():
    color = (0, 0, 255) if name == 'unknown' else (0, 255, 0)
    cv.polylines(vis, [np.int32(quad)], True, color, 2, cv.LINE_AA)
    cv.putText(vis, 'GT ' + name, tuple(np.int32(quad[0]) + [0, -6]), cv.FONT_HERSHEY_SIMPLEX, 0.5, color, 2, cv.LINE_AA)
    print(f'{name:9s} 꼭짓점(왼위)={np.round(quad[0], 1)}  넓이={cv.contourArea(quad):7.0f} px^2')

real = cv.imread('box_in_scene.png')
print('합성 장면', scene.shape, '/ 실제 장면 box_in_scene.png', real.shape)
cv.imshow('synthetic shelf + ground truth', vis)
cv.imshow('real scene (box_in_scene.png)', real)
`, desc: '<p>초록 테두리가 정답(GT) 꼭짓점, 빨간 테두리가 방해물입니다. seed(7)를 바꾸면 배치 · 기울기 · 밝기가 달라진 새 장면이 나오므로, seed 0~19 로 장면 20장을 만들면 곧바로 “테스트 세트”가 됩니다. <code>paste()</code> 는 전체 화면이 아니라 상품이 놓일 작은 영역에서만 변환해 브라우저에서도 빠릅니다.</p>' },
      { type: 'text', html: `
<h3>5. 특징 설계 — 무엇을 숫자로 바꿀까?</h3>
<p>같은 상품 조각이라도 어떤 특징으로 바꾸느냐에 따라 잘 되는 일이 다릅니다. 이번 프로젝트는 세 가지를 <b>역할을 나눠</b> 씁니다.</p>
<table>
<tr><th>특징</th><th>무엇을 담나</th><th>형태</th><th>강점 / 약점</th><th>쓰임</th></tr>
<tr><td>ORB 기술자</td><td>코너 주변의 밝기 비교 패턴</td><td>키포인트마다 32바이트(uint8, 256비트)</td><td>회전 · 크기 · 위치 변화에 강함 / 무늬 없는 상품은 점이 적음</td><td>매칭 + 호모그래피로 <b>위치</b> 찾기</td></tr>
<tr><td>색 히스토그램</td><td>H(색상) × S(채도) 분포 (회색 픽셀의 H 는 0 으로)</td><td>8×4 = 32차원, 합 1로 정규화</td><td>기울기 · 가림에 강함 / 색이 비슷한 상품은 구분 못함, 조명에 약함</td><td>조각 분류(색 단서)</td></tr>
<tr><td>HOG</td><td>작은 칸마다 엣지 방향 분포</td><td>64×64 조각 → 324차원</td><td>모양 · 글자 배치를 잘 담음 / 회전 · 큰 위치 어긋남에 약함</td><td>조각 분류(모양 단서)</td></tr>
</table>
<p><b>색 히스토그램의 함정</b>: 채도(S)가 거의 0 인 회색 픽셀은 색상(H)이 정해지지 않아, 잡음이 조금만 섞여도 H 가 0~179 사이를 제멋대로 오갑니다. 증강에서 채널마다 잡음을 더한 흑백 상자(cookie)는 H 가 골고루 퍼지고, 실제 흑백 사진(box_in_scene)은 H 가 모두 0 이라 “완전히 다른 색”으로 보이게 됩니다. 그래서 <code>S &lt; 40</code> 인 픽셀의 H 는 0 으로 고정합니다(실제로 이 줄이 없으면 실제 장면의 cookie 가 none 으로 분류됩니다).</p>
<p>특징 추출기는 <b>“조각 한 장 → 1차원 float32 벡터”</b> 라는 약속(인터페이스)을 지키는 함수로 만듭니다. 그러면 나중에 특징을 바꾸거나 이어 붙여도(<code>np.concatenate</code>) 학습 · 평가 코드는 그대로입니다.
HOG 는 3주차와 같은 <code>cv.HOGDescriptor(winSize, blockSize, blockStride, cellSize, nbins)</code> 이고, 여기서는 64×64 창 · 32 블록 · 16 이동 · 16 셀 · 9 방향 → (3×3 블록) × (2×2 셀) × 9 = 324 차원입니다.</p>` },
      { type: 'code', title: '예제 4 · 특징 추출기 3종 모듈과 분리도 확인', code: String.raw`
import cv2 as cv
import numpy as np

HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)   # 324 차원


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def add_noise(img, rng, amount=14):
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


# ---------------- 특징 추출 모듈 ----------------
def orb_features(img, n=500):
    """이미지 → (키포인트 리스트, 기술자 N×32 uint8 또는 None). 매칭용 지역 특징."""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    return cv.ORB_create(n).detectAndCompute(gray, None)


def color_hist(crop):
    """BGR 조각 → HSV 의 H(8칸)×S(4칸) 히스토그램, 합이 1인 32차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    return (h / (h.sum() + 1e-6)).astype(np.float32)


def hog_feat(crop):
    """64×64 BGR 조각 → HOG 324차원 float32 (엣지 방향 분포)."""
    return HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel().astype(np.float32)


def extract(crop):
    """분류기 입력: [색 히스토그램 32 | HOG 324] = 356차원 float32."""
    return np.concatenate([color_hist(crop), hog_feat(crop)]).astype(np.float32)


products = make_products()
names = list(products)
rng = np.random.default_rng(1)

# 1) 모양 · dtype 점검 (학습 전에 반드시!)
crop = augment(products['tea'], rng)
kp, des = orb_features(products['tea'])
print('ORB  :', len(kp), 'keypoints, des', des.shape, des.dtype)
for f in (color_hist, hog_feat, extract):
    v = f(crop)
    print(f'{f.__name__:10s}: shape={v.shape} dtype={v.dtype} min={v.min():.3f} max={v.max():.3f}')

# 2) 분리도: 같은 상품끼리(intra) vs 다른 상품끼리(inter) 평균 거리
feats = {n: np.array([extract(augment(products[n], rng)) for _ in range(10)]) for n in names}
print(f'\n{"feature":8s} {"intra":>7s} {"inter":>7s} {"inter/intra":>11s}')
for label, sl in [('color', slice(0, 32)), ('hog', slice(32, None)), ('both', slice(None))]:
    intra, inter = [], []
    for i, a in enumerate(names):
        A = feats[a][:, sl]
        intra.append(np.linalg.norm(A[:5] - A[5:], axis=1).mean())
        for b in names[i + 1:]:
            inter.append(np.linalg.norm(A - feats[b][:, sl], axis=1).mean())
    print(f'{label:8s} {np.mean(intra):7.3f} {np.mean(inter):7.3f} {np.mean(inter) / np.mean(intra):11.2f}')

vis = [cv.drawKeypoints(img, orb_features(img)[0], None, (0, 255, 0)) for img in products.values()]
h = 220
cv.imshow('ORB keypoints per product', np.hstack([cv.resize(v, (int(v.shape[1] * h / v.shape[0]), h)) for v in vis]))
`, desc: '<p><b>inter/intra</b> 가 클수록 “같은 상품끼리는 가깝고 다른 상품끼리는 멀다” = 분류하기 쉬운 특징입니다. 색만 쓰면 흑백인 cookie 와 흰 바탕 tea 처럼 색이 비슷한 상품이 헷갈리고, HOG 를 더하면 모양 단서가 생깁니다. 분류기를 학습하기 전에 이런 <b>빠른 점검</b>으로 특징 설계가 말이 되는지 확인하세요.</p>' },
      { type: 'text', html: `
<h3>6. 학습 · 테스트 세트 만들고 저장하기</h3>
<p>이제 조각을 특징 벡터로 바꿔 <code>X</code>(N×356)와 <code>y</code>(N)로 모읍니다. <code>cv.ml</code> 학습기에는 형식 규칙이 있습니다(3주차).</p>
<ul>
  <li><code>X</code>: <b>float32</b>, 한 행 = 샘플 하나 (<code>cv.ml.ROW_SAMPLE</code>)</li>
  <li><code>y</code>: <b>int32</b> 정수 라벨 (클래스 인덱스)</li>
  <li><b>학습은 증강 조각, 테스트는 합성 장면에서 잘라낸 조각</b> — 만드는 방법이 달라야 “처음 보는 데이터” 성능을 잴 수 있습니다. 같은 증강에서 무작위로 나누면 거의 똑같은 조각이 양쪽에 들어가 점수가 부풀려집니다(데이터 누수, a5-5).</li>
  <li>장면 조각은 정답 꼭짓점에 <b>작은 오차(±3px)</b>를 더해 잘라냅니다 — 실제로는 호모그래피가 조금씩 틀리기 때문입니다.</li>
  <li>만든 데이터는 <code>np.savez('shelf_data.npz', ...)</code> 로 저장해 다음 교시 예제에서 <code>np.load</code> 로 재사용합니다(페이지를 새로 고치기 전까지 유지).</li>
</ul>` },
      { type: 'code', title: '예제 5 · 학습/테스트 세트 만들기 · 점검 · 저장', code: String.raw`
import cv2 as cv
import numpy as np

CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


# ---------------- 데이터 도구 (예제 1~3) ----------------
def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng):
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), quad - np.float32([x0, y0]))
    img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth


def augment(img, rng, size=64, jitter=0.06):
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """[H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


# ---------------- 데이터셋 만들기 ----------------
def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각으로 학습 세트 (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):                                    # 상품이 아닌 조각 → 'none'
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각으로 테스트 세트 (정답 꼭짓점 + 3px 오차)."""
    X, y, crops = [], [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            crop = rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))
            X.append(extract(crop))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
            crops.append(crop)
        for _ in range(2):                                     # 빈 선반 조각
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            crop = rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))
            X.append(extract(crop))
            y.append(CLASSES.index('none'))
            crops.append(crop)
    return np.array(X, np.float32), np.array(y, np.int32), crops


products = make_products()
Xtr, ytr = build_train(products, np.random.default_rng(1))    # 학습과 테스트는 seed 도 다르게
Xte, yte, crops = build_test(products, np.random.default_rng(2))

# ---- 학습 전 점검: 여기서 걸러지는 버그가 가장 많다 ----
assert Xtr.dtype == np.float32 and ytr.dtype == np.int32, 'cv.ml 은 X float32, y int32'
assert Xtr.shape[1] == Xte.shape[1] == 356, '특징 차원이 다름'
assert not np.isnan(Xtr).any(), 'NaN 이 섞여 있음'
print('train X', Xtr.shape, Xtr.dtype, '| y', ytr.shape, ytr.dtype)
print('test  X', Xte.shape, Xte.dtype, '| y', yte.shape, yte.dtype)
print(f'{"class":9s} {"train":>6s} {"test":>5s}')
for i, c in enumerate(CLASSES):
    print(f'{c:9s} {np.sum(ytr == i):6d} {np.sum(yte == i):5d}')

np.savez('shelf_data.npz', Xtr=Xtr, ytr=ytr, Xte=Xte, yte=yte, classes=np.array(CLASSES))
print('저장 완료: shelf_data.npz  (다음 예제에서 np.load 로 불러오기)')

sample = [cv.resize(c, (96, 96), interpolation=cv.INTER_NEAREST) for c in crops[:14]]
row1, row2 = np.hstack(sample[:7]), np.hstack(sample[7:14])
cv.imshow('test crops (rectified from scenes)', np.vstack([row1, row2]))
`, desc: '<p>assert 세 줄이 “학습 전 점검표”입니다. 조건이 틀리면 즉시 멈추고 메시지를 보여 주므로, 학습이 이상하게 되는 원인을 한참 뒤에 찾는 일을 막아 줍니다. 아래 창의 조각들은 장면에서 <b>정면으로 펴서(rectify)</b> 잘라낸 테스트 샘플입니다 — 약간 어긋나고 잡음이 있습니다.</p>' },
      { type: 'tip', html: `<p><b>팀 프로젝트 적용</b>: 팀 데이터도 ① 카탈로그/원본, ② 학습, ③ 테스트, ④ 실제 시연 입력으로 나누고, 이름 → 이미지 딕셔너리와 <code>CLASSES</code> 리스트를 만드세요. 실제 사진을 모을 수 있다면 <b>테스트는 학습과 다른 날 · 다른 조명 · 다른 배경</b>에서 찍은 것으로 정하세요. 합성 데이터는 “정답이 공짜”라는 장점이 있지만 실제와 다르다는 점을 발표에서 한계로 밝히면 좋습니다.</p>` },
      { type: 'checklist', title: '데이터 · 특징 설계 점검 목록', items: [
        'CLASSES 리스트(순서 고정)와 이름 → 이미지 딕셔너리가 있다',
        '상품이 아닌 것(none/배경) 클래스가 있다',
        '증강 함수가 rng 를 인자로 받아 같은 seed 면 같은 결과를 낸다',
        '학습 세트와 테스트 세트를 서로 다른 방법(또는 다른 촬영)으로 만들었다',
        '테스트 장면에 정답(꼭짓점 · 박스 · 라벨)이 저장되어 있다',
        '특징 추출 함수마다 docstring 에 입력 · 출력 모양이 적혀 있다',
        '학습 전에 X float32 · y int32 · 차원 · NaN 을 assert 로 점검한다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 다섯 번째 상품 등록하기',
        desc: `<p><code>make_products()</code> 에 <b>'starry'</b> 상품을 추가하세요: <code>starry_night.jpg</code> 의 가운데 부분 <code>[100:500, 150:600]</code> 을 잘라 가로 240 으로 줄인 이미지입니다.
그다음 모든 상품의 ORB 키포인트 수를 세어, <b>100개 미만이면 “[경고] 특징점 부족”</b>을 출력하게 하세요. 격자에 5개 상품이 모두 보이면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리."""
    products = {
        'cookie': cv.imread('box.png'),
        'graffiti': cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216)),
        'soccer': cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274)),
    }
    # TODO 1: 'starry' 상품 추가 (starry_night.jpg 의 [100:500, 150:600] 을 가로 240 으로, 비율 유지)
    return products


products = make_products()
orb = cv.ORB_create(500)
cells = []
for name, img in products.items():
    kp = orb.detect(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    print(f'{name:9s} {img.shape[1]}x{img.shape[0]}  keypoints={len(kp)}')
    # TODO 2: len(kp) < 100 이면 '[경고] 특징점 부족' 출력
    cell = cv.resize(img, (160, 160))
    cv.putText(cell, name, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    cells.append(cell)
print('상품 수:', len(products))
cv.imshow('catalog', np.hstack(cells))
`,
        hint: `<p>비율 유지 축소: <code>crop = img[100:500, 150:600]</code> → <code>s = 240 / crop.shape[1]</code> → <code>cv.resize(crop, (240, int(crop.shape[0] * s)))</code>. 딕셔너리에 새 키를 넣을 때는 <code>products['starry'] = ...</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리."""
    products = {
        'cookie': cv.imread('box.png'),
        'graffiti': cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216)),
        'soccer': cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274)),
    }
    crop = cv.imread('starry_night.jpg')[100:500, 150:600]
    s = 240 / crop.shape[1]
    products['starry'] = cv.resize(crop, (240, int(crop.shape[0] * s)), interpolation=cv.INTER_AREA)
    return products


products = make_products()
orb = cv.ORB_create(500)
cells = []
for name, img in products.items():
    kp = orb.detect(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    print(f'{name:9s} {img.shape[1]}x{img.shape[0]}  keypoints={len(kp)}')
    if len(kp) < 100:
        print('   [경고] 특징점 부족 — 특징 매칭으로 찾기 어려울 수 있음:', name)
    cell = cv.resize(img, (160, 160))
    cv.putText(cell, name, (5, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    cells.append(cell)
print('상품 수:', len(products))
cv.imshow('catalog', np.hstack(cells))
`,
      },
      {
        title: '실습 2 · 증강에 흐림(blur) 옵션 추가하기',
        desc: `<p>실제 카메라는 초점이 조금 나가거나 흔들려 흐려집니다. <code>augment()</code> 에 인자 <code>blur_prob</code>(기본 0.5)를 추가해, 그 확률로 3×3 또는 5×5 <code>cv.GaussianBlur</code> 를 적용하세요.
아래 코드는 증강 16장을 격자로 보여 주고 흐려진 장수를 셉니다. 대략 절반이 흐려지고, 같은 seed 로 두 번 실행한 결과가 같으면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np


def augment(img, rng, size=64, jitter=0.06, blur_prob=0.5):
    """원근 · 밝기 · (확률적) 흐림 증강. (조각, 흐림 커널 크기 또는 0) 을 돌려준다."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    k = 0
    # TODO: rng.random() < blur_prob 이면 k 를 3 또는 5 중 하나로 고르고(rng.choice) GaussianBlur 적용
    return out, k


img = cv.imread('box.png')
rng = np.random.default_rng(3)
results = [augment(img, rng) for _ in range(16)]
blurred = sum(1 for _, k in results if k > 0)
print('흐려진 장수:', blurred, '/ 16')

again = [augment(img, np.random.default_rng(3))[0] for _ in range(1)]
print('재현성(첫 장 동일):', np.array_equal(again[0], results[0][0]))

cells = []
for crop, k in results:
    c = cv.resize(crop, (96, 96), interpolation=cv.INTER_NEAREST)
    cv.putText(c, f'k={k}', (3, 14), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)
    cells.append(c)
cv.imshow('augment + blur', np.vstack([np.hstack(cells[r:r + 8]) for r in (0, 8)]))
`,
        hint: `<p><code>if rng.random() &lt; blur_prob:</code> 안에서 <code>k = int(rng.choice([3, 5]))</code>, <code>out = cv.GaussianBlur(out, (k, k), 0)</code>. 난수를 쓰는 순서가 같으면 같은 seed 에서 항상 같은 결과가 나옵니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np


def augment(img, rng, size=64, jitter=0.06, blur_prob=0.5):
    """원근 · 밝기 · (확률적) 흐림 증강. (조각, 흐림 커널 크기 또는 0) 을 돌려준다."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    k = 0
    if rng.random() < blur_prob:
        k = int(rng.choice([3, 5]))
        out = cv.GaussianBlur(out, (k, k), 0)
    return out, k


img = cv.imread('box.png')
rng = np.random.default_rng(3)
results = [augment(img, rng) for _ in range(16)]
blurred = sum(1 for _, k in results if k > 0)
print('흐려진 장수:', blurred, '/ 16')

again = [augment(img, np.random.default_rng(3))[0] for _ in range(1)]
print('재현성(첫 장 동일):', np.array_equal(again[0], results[0][0]))

cells = []
for crop, k in results:
    c = cv.resize(crop, (96, 96), interpolation=cv.INTER_NEAREST)
    cv.putText(c, f'k={k}', (3, 14), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)
    cells.append(c)
cv.imshow('augment + blur', np.vstack([np.hstack(cells[r:r + 8]) for r in (0, 8)]))
`,
      },
      {
        title: '실습 3 · 색 히스토그램으로 가장 비슷한 상품 찾기',
        desc: `<p>특징 하나만으로 얼마나 구분되는지 빠르게 확인해 봅시다. 상품 4종의 기준 색 히스토그램을 만들어 두고, 증강 조각 20장 각각에 대해 <code>cv.compareHist(..., cv.HISTCMP_CORREL)</code> 가 <b>가장 큰</b> 상품을 예측으로 고르세요.
상품별 맞힌 개수(5장 중)를 출력하세요. 전체 정확도는 90% 안팎이 나옵니다 — 색만으로는 왜 100% 가 안 되는지, 밝기 증강이 색 히스토그램에 어떤 영향을 주는지 생각해 보세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np


def color_hist(crop):
    """H(8)×S(4) 히스토그램, 합 1 정규화, float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    return (h / (h.sum() + 1e-6)).astype(np.float32)


def augment(img, rng, size=64):
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]]) + rng.uniform(-4, 4, (4, 2)).astype(np.float32)
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    return cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))


tea = np.full((260, 220, 3), 245, np.uint8)
cv.circle(tea, (110, 100), 60, (40, 40, 200), 20)
cv.putText(tea, 'GREEN TEA', (20, 220), cv.FONT_HERSHEY_DUPLEX, 0.9, (40, 40, 160), 2)
products = {'cookie': cv.imread('box.png'),
            'graffiti': cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216)),
            'soccer': cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274)),
            'tea': tea}
names = list(products)
refs = {n: color_hist(cv.resize(img, (64, 64))) for n, img in products.items()}

rng = np.random.default_rng(5)
correct = {n: 0 for n in names}
for true_name in names:
    for _ in range(5):
        h = color_hist(augment(products[true_name], rng))
        # TODO: refs 의 각 상품과 compareHist(CORREL) 점수를 계산해 가장 큰 상품을 pred 로
        pred = names[0]
        if pred == true_name:
            correct[true_name] += 1

for n in names:
    print(f'{n:9s} {correct[n]} / 5')
print('전체 정확도:', sum(correct.values()) / 20)
`,
        hint: `<p><code>scores = {n: cv.compareHist(h, refs[n], cv.HISTCMP_CORREL) for n in names}</code> 를 만들고 <code>pred = max(scores, key=scores.get)</code>. CORREL 은 1 에 가까울수록 비슷합니다(거리와 반대!).</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np


def color_hist(crop):
    """H(8)×S(4) 히스토그램, 합 1 정규화, float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    return (h / (h.sum() + 1e-6)).astype(np.float32)


def augment(img, rng, size=64):
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]]) + rng.uniform(-4, 4, (4, 2)).astype(np.float32)
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    return cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))


tea = np.full((260, 220, 3), 245, np.uint8)
cv.circle(tea, (110, 100), 60, (40, 40, 200), 20)
cv.putText(tea, 'GREEN TEA', (20, 220), cv.FONT_HERSHEY_DUPLEX, 0.9, (40, 40, 160), 2)
products = {'cookie': cv.imread('box.png'),
            'graffiti': cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216)),
            'soccer': cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274)),
            'tea': tea}
names = list(products)
refs = {n: color_hist(cv.resize(img, (64, 64))) for n, img in products.items()}

rng = np.random.default_rng(5)
correct = {n: 0 for n in names}
for true_name in names:
    for _ in range(5):
        h = color_hist(augment(products[true_name], rng))
        scores = {n: cv.compareHist(h, refs[n], cv.HISTCMP_CORREL) for n in names}
        pred = max(scores, key=scores.get)
        if pred == true_name:
            correct[true_name] += 1

for n in names:
    print(f'{n:9s} {correct[n]} / 5')
print('전체 정확도:', sum(correct.values()) / 20)
print('→ 색만으로도 꽤 맞히지만 100% 는 아니다: 밝기가 바뀌거나 색 구성이 비슷하면 헷갈린다. HOG(모양)를 함께 쓰는 이유!')
`,
      },
    ],
    quiz: [
      { q: '분류기 학습 데이터에 “none(상품 아님)” 클래스를 넣는 가장 큰 이유는?', options: ['학습 속도가 빨라진다', '어떤 조각이든 반드시 상품 4종 중 하나로 우기는 것을 막고 “모른다”고 답할 수 있게 한다', '특징 벡터의 차원이 줄어든다', 'SVM 은 클래스가 5개 이상이어야 동작한다'], answer: 1, explain: '분류기는 배운 클래스 중 하나를 고를 수밖에 없습니다. 배경 · 다른 물건 조각을 none 으로 가르쳐야 잘못 찾은 영역을 거를 수 있습니다.' },
      { q: '증강 함수에 np.random.default_rng(seed) 로 만든 rng 를 넘겨 쓰는 이유로 가장 알맞은 것은?', options: ['증강이 더 강해진다', '같은 seed 면 같은 데이터가 만들어져 실험을 재현하고 팀원과 비교할 수 있다', 'OpenCV 함수는 numpy 난수만 받는다', '메모리를 적게 쓴다'], answer: 1, explain: '재현성(reproducibility)이 핵심입니다. 파라미터를 바꿨을 때 결과가 달라진 이유가 “데이터가 달라서”가 아님을 보장합니다.' },
      { q: '합성 선반 장면을 테스트에 쓰는 장점과 한계를 바르게 짝지은 것은?', options: ['장점: 실제와 똑같다 / 한계: 느리다', '장점: 붙일 때 쓴 꼭짓점이 곧 정답이라 라벨링이 필요 없다 / 한계: 실제 카메라의 흐림 · 반사 · 가림이 없어 실제 성능과 다를 수 있다', '장점: 특징점이 많아진다 / 한계: 컬러가 안 된다', '장점: 학습 데이터로도 그대로 쓸 수 있다 / 한계: 없다'], answer: 1, explain: '합성 데이터는 정답이 공짜라 자동 평가에 좋지만, 반드시 실제 장면(box_in_scene, 웹캠)으로 최종 확인해야 합니다.' },
      { q: 'HOGDescriptor((64,64), (32,32), (16,16), (16,16), 9) 의 특징 차원은?', options: ['81', '144', '324', '1764'], answer: 2, explain: '블록 위치 (64−32)/16+1 = 3 → 3×3=9 블록, 블록당 (32/16)² = 4셀, 셀당 9방향 → 9×4×9 = 324 차원입니다.' },
    ],
  },
  // =====================================================================
  // a5-2 구현 ② 학습 · 평가와 튜닝
  // =====================================================================
  {
    id: 'a5-2',
    assets: ['images/adv/box.png', 'images/adv/graf1.jpg'],
    summary: 'a5-1 에서 만든 데이터로 kNN · SVM 을 학습하고, 정확도 하나가 아니라 혼동 행렬 · 클래스별 정밀도 · 재현율로 평가합니다. k · C · gamma 와 매칭의 비율 임계값 · 최소 인라이어 수를 표로 탐색해 근거 있게 고르고, 학습/테스트 정확도 차이로 과적합을 진단합니다.',
    goals: [
      'kNN · SVM 을 같은 데이터로 학습해 학습 · 테스트 정확도와 속도를 표로 비교할 수 있다',
      'numpy 로 혼동 행렬을 만들고 클래스별 정밀도(precision) · 재현율(recall) · F1 을 계산 · 해석할 수 있다',
      '파라미터 격자 탐색 결과를 표와 그래프로 정리하고, 학습/테스트 정확도 차이로 과적합을 설명할 수 있다',
      '검출 파이프라인을 IoU 기준 TP/FP/FN 으로 평가하고 비율 임계값 · 최소 인라이어 수를 근거 있게 정할 수 있다',
    ],
    schedule: [['도입: “정확도 97%”는 믿을 만한가?', 5], ['개념: 혼동 행렬 · 정밀도/재현율 · 과적합', 12], ['예제 실습: 학습 · 평가 · 탐색', 20], ['팀 프로젝트 평가 지표 계산', 8], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 평가는 “테스트 세트에서, 여러 숫자로”</h3>
<p>3주차에서 digits 인식 정확도를 재 봤습니다. 프로젝트에서는 한 걸음 더 나아가 다음 세 가지를 지킵니다.</p>
<ol>
  <li><b>학습에 쓰지 않은 데이터로만</b> 성능을 잽니다. 학습 정확도는 “외운 정도”일 뿐입니다.</li>
  <li><b>정확도 하나로 끝내지 않습니다.</b> 우리 테스트 세트는 none 이 절반 가까이라, “전부 none” 이라고 답해도 정확도가 40% 를 넘습니다. 클래스마다 따로 봐야 합니다.</li>
  <li><b>조건을 바꿔 가며 표로 남깁니다.</b> “k=3 이 좋았다”가 아니라 “k=1,3,5,9 중 k=1 이 테스트 91%”처럼 비교 근거를 남겨야 발표에서 설득력이 생깁니다.</li>
</ol>
<p>이번 교시의 예제는 모두 a5-1 의 데이터 함수(공통 도구)를 맨 위에 포함하고 있어 <b>단독으로 실행</b>됩니다. 학습 조각은 증강(seed 1), 테스트 조각은 합성 장면(seed 2)에서 만듭니다.</p>` },
      { type: 'code', title: '예제 1 · kNN vs SVM: 학습 · 테스트 정확도와 속도', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def timed(fn, *args):
    """fn(*args) 실행 결과와 걸린 시간(ms)."""
    t = time.perf_counter()
    out = fn(*args)
    return out, (time.perf_counter() - t) * 1000


products = make_products()
Xtr, ytr = build_train(products, np.random.default_rng(1))
Xte, yte = build_test(products, np.random.default_rng(2))
print('train', Xtr.shape, '/ test', Xte.shape)

knn = cv.ml.KNearest_create()
_, t_knn_train = timed(knn.train, Xtr, cv.ml.ROW_SAMPLE, ytr)

svm = cv.ml.SVM_create()
svm.setType(cv.ml.SVM_C_SVC)
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(10)
svm.setGamma(1.0)
_, t_svm_train = timed(svm.train, Xtr, cv.ml.ROW_SAMPLE, ytr)

rows = []
(_, p_tr, _, _), _ = timed(knn.findNearest, Xtr, 3)
(_, p_te, _, _), t_pred = timed(knn.findNearest, Xte, 3)
rows.append(('kNN (k=3)', (p_tr.ravel() == ytr).mean(), (p_te.ravel() == yte).mean(), t_knn_train, t_pred))
(_, p_tr), _ = timed(svm.predict, Xtr)
(_, p_te), t_pred = timed(svm.predict, Xte)
rows.append(('SVM RBF C=10 g=1', (p_tr.ravel() == ytr).mean(), (p_te.ravel() == yte).mean(), t_svm_train, t_pred))

print(f'\n{"model":18s} {"train acc":>9s} {"test acc":>9s} {"train ms":>9s} {"pred ms":>8s}')
for name, a_tr, a_te, t1, t2 in rows:
    print(f'{name:18s} {a_tr:9.3f} {a_te:9.3f} {t1:9.1f} {t2:8.1f}')

baseline = np.mean(yte == CLASSES.index('none'))
print(f'\n참고: 전부 none 이라고 답하는 “바보 분류기” 정확도 = {baseline:.3f}')
`, desc: '<p>SVM 은 학습에 시간이 조금 더 들지만 예측이 빠르고 정확합니다. kNN 은 학습이 “저장”뿐이라 즉시 끝나지만, 예측할 때 모든 학습 샘플과 거리를 계산하므로 데이터가 커질수록 느려집니다(3주차 digits). 마지막 줄의 <b>바보 분류기(baseline)</b> 정확도보다 확실히 높아야 의미가 있습니다.</p>' },
      { type: 'text', html: `
<h3>2. 혼동 행렬과 정밀도 · 재현율</h3>
<p><b>혼동 행렬(confusion matrix)</b> <code>cm[i, j]</code> = “정답이 i 인데 j 라고 예측한 개수”입니다. 대각선이 맞힌 것, 나머지가 헷갈린 것입니다.</p>
<ul>
  <li><b>정밀도(precision)</b> = <code>cm[c, c] / 열 c 의 합</code> — “c 라고 말한 것 중 진짜 c 의 비율”. 낮으면 <b>헛것을 본다</b>(오검출).</li>
  <li><b>재현율(recall)</b> = <code>cm[c, c] / 행 c 의 합</code> — “진짜 c 중에서 찾아낸 비율”. 낮으면 <b>놓친다</b>(미검출).</li>
  <li><b>F1</b> = 2·P·R / (P + R) — 둘의 조화 평균. 둘 중 하나만 높으면 F1 은 낮습니다.</li>
</ul>
<p>스마트 선반에서는 무엇이 더 중요할까요? “재고 없음 알림”이라면 상품을 놓치는 것(재현율)이, “자동 결제”라면 다른 상품으로 착각하는 것(정밀도)이 더 치명적입니다. <b>프로젝트 목적에 따라 우선할 지표를 정하세요.</b></p>
<p>numpy 로 혼동 행렬 만들기: <code>np.add.at(cm, (y_true, y_pred), 1)</code> — (정답, 예측) 쌍마다 해당 칸에 1 을 더합니다.</p>` },
      { type: 'code', title: '예제 2 · 혼동 행렬 히트맵과 클래스별 정밀도 · 재현율', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def confusion_matrix(y_true, y_pred, n):
    """cm[i, j] = 정답 i 를 j 로 예측한 개수."""
    cm = np.zeros((n, n), np.int32)
    np.add.at(cm, (np.asarray(y_true).ravel().astype(int), np.asarray(y_pred).ravel().astype(int)), 1)
    return cm


def per_class_report(cm, names):
    """클래스별 정밀도 · 재현율 · F1 표를 출력하고 (P, R, F1) 배열을 돌려준다."""
    tp = np.diag(cm).astype(float)
    P = tp / np.maximum(cm.sum(axis=0), 1)
    R = tp / np.maximum(cm.sum(axis=1), 1)
    F = 2 * P * R / np.maximum(P + R, 1e-9)
    print(f'{"class":9s} {"precision":>9s} {"recall":>7s} {"F1":>6s} {"support":>8s}')
    for i, c in enumerate(names):
        print(f'{c:9s} {P[i]:9.3f} {R[i]:7.3f} {F[i]:6.3f} {cm[i].sum():8d}')
    print(f'{"macro avg":9s} {P.mean():9.3f} {R.mean():7.3f} {F.mean():6.3f}')
    return P, R, F


def plot_cm(ax, cm, names, title):
    ax.imshow(cm, cmap='Blues')
    ax.set_xticks(range(len(names)))
    ax.set_xticklabels(names, rotation=45)
    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names)
    ax.set_xlabel('predicted')
    ax.set_ylabel('true')
    ax.set_title(title)
    for i in range(len(names)):
        for j in range(len(names)):
            ax.text(j, i, cm[i, j], ha='center', va='center', color='white' if cm[i, j] > cm.max() / 2 else 'black')


products = make_products()
Xtr, ytr = build_train(products, np.random.default_rng(1))
Xte, yte = build_test(products, np.random.default_rng(2))

knn = cv.ml.KNearest_create()
knn.train(Xtr, cv.ml.ROW_SAMPLE, ytr)
pred_knn = knn.findNearest(Xte, 3)[1]
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(10)
svm.setGamma(1.0)
svm.train(Xtr, cv.ml.ROW_SAMPLE, ytr)
pred_svm = svm.predict(Xte)[1]

fig, axes = plt.subplots(1, 2, figsize=(10, 4.5))
for ax, pred, title in [(axes[0], pred_knn, 'kNN k=3'), (axes[1], pred_svm, 'SVM RBF')]:
    cm = confusion_matrix(yte, pred, len(CLASSES))
    print(f'\n=== {title}  accuracy={np.trace(cm) / cm.sum():.3f} ===')
    per_class_report(cm, CLASSES)
    plot_cm(ax, cm, CLASSES, title)
plt.tight_layout()
plt.show()
`, desc: '<p>kNN 표에서 대각선 밖의 칸을 찾아 보세요. 정답이 상품인데 none 으로 예측한 칸(맨 오른쪽 열)이 있다면 그 상품의 <b>재현율</b>이 떨어지고, none 인데 상품으로 예측한 칸(맨 아래 행)이 있다면 그 상품의 <b>정밀도</b>가 떨어집니다. 테스트 세트가 작으면(클래스당 6개) 한 개만 틀려도 수치가 크게 흔들린다는 점도 함께 보고하세요(support 열).</p>' },
      { type: 'text', html: `
<h3>3. 파라미터 탐색과 과적합(Overfitting)</h3>
<p>파라미터를 “감”으로 고르지 말고 <b>격자 탐색(grid search)</b> 으로 후보를 모두 시험해 표로 남깁니다.</p>
<ul>
  <li><b>kNN 의 k</b>: k=1 은 학습 데이터를 100% 맞히지만(자기 자신이 가장 가까우므로) 잡음에 민감, k 가 크면 경계가 뭉개짐</li>
  <li><b>SVM 의 C</b>: 오분류 벌점. 크면 학습 데이터에 딱 맞추려 함</li>
  <li><b>SVM RBF 의 gamma</b>: 한 샘플의 영향 범위의 역수. 크면 샘플 하나하나 주변만 “섬”처럼 외움</li>
</ul>
<p><b>과적합</b>은 학습 정확도는 높은데 테스트 정확도가 낮은 상태, 즉 <b>“외웠지만 이해하지 못한”</b> 상태입니다. 판단 기준은 간단합니다: <b>학습 − 테스트 정확도 차이</b>가 크면 과적합, 둘 다 낮으면 과소적합(underfitting).
해결책은 모델을 단순하게(작은 gamma, 큰 k), 데이터를 다양하게(증강), 특징을 알맞게 고르는 것입니다.</p>
<p>주의: 탐색에서 가장 좋은 값을 <b>테스트 세트로 고르면</b>, 그 테스트 점수는 다시 낙관적으로 부풀려집니다. 데이터가 넉넉하면 학습 / <b>검증(validation)</b> / 테스트 세 부분으로 나눠 검증 세트로 고르고, 테스트는 마지막에 한 번만 씁니다. 이번 예제는 간단히 하려고 테스트로 비교합니다.</p>` },
      { type: 'code', title: '예제 3 · C × gamma 격자 탐색과 과적합 확인', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

products = make_products()
Xtr, ytr = build_train(products, np.random.default_rng(1))
Xte, yte = build_test(products, np.random.default_rng(2))

Cs = [0.1, 1, 10, 100]
gammas = [0.1, 1, 5, 30]
train_acc = np.zeros((len(Cs), len(gammas)))
test_acc = np.zeros((len(Cs), len(gammas)))
for i, C in enumerate(Cs):
    for j, g in enumerate(gammas):
        svm = cv.ml.SVM_create()
        svm.setKernel(cv.ml.SVM_RBF)
        svm.setC(C)
        svm.setGamma(g)
        svm.train(Xtr, cv.ml.ROW_SAMPLE, ytr)
        train_acc[i, j] = (svm.predict(Xtr)[1].ravel() == ytr).mean()
        test_acc[i, j] = (svm.predict(Xte)[1].ravel() == yte).mean()

print('test accuracy (행 = C, 열 = gamma)')
print('C \\ gamma ' + ''.join(f'{g:>8}' for g in gammas))
for i, C in enumerate(Cs):
    print(f'{C:>9} ' + ''.join(f'{v:8.3f}' for v in test_acc[i]))
print('\n학습 - 테스트 차이 (클수록 과적합)')
for i, C in enumerate(Cs):
    print(f'{C:>9} ' + ''.join(f'{v:8.3f}' for v in train_acc[i] - test_acc[i]))

bi, bj = np.unravel_index(np.argmax(test_acc), test_acc.shape)
print(f'\n최고 테스트 정확도 {test_acc[bi, bj]:.3f}: C={Cs[bi]}, gamma={gammas[bj]}')

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
for ax, M, title in [(axes[0], train_acc, 'train accuracy'), (axes[1], test_acc, 'test accuracy')]:
    ax.imshow(M, vmin=0, vmax=1, cmap='viridis')
    ax.set_xticks(range(len(gammas)))
    ax.set_xticklabels(gammas)
    ax.set_yticks(range(len(Cs)))
    ax.set_yticklabels(Cs)
    ax.set_xlabel('gamma')
    ax.set_ylabel('C')
    ax.set_title(title)
    for i in range(len(Cs)):
        for j in range(len(gammas)):
            ax.text(j, i, f'{M[i, j]:.2f}', ha='center', va='center', color='w')
plt.tight_layout()
plt.show()
`, desc: '<p>gamma=30 열을 보세요. 학습 정확도는 1.00 인데 테스트는 절반 이하로 떨어집니다 — 학습 샘플 주변만 외워서 처음 보는 조각은 전부 none 처럼 판단하는 <b>전형적인 과적합</b>입니다. 반대로 C=0.1, gamma=0.1 처럼 둘 다 작으면 학습 정확도부터 낮은 <b>과소적합</b>이 나타납니다. 좋은 영역(가운데)이 넓으면 “튜닝에 덜 민감한 안정적인 설정”이라고 보고할 수 있습니다.</p>' },
      { type: 'text', html: `
<h3>4. 검출 파이프라인 평가 — IoU 와 TP · FP · FN</h3>
<p>분류기는 “조각 → 라벨”이지만, 인식기 전체는 “장면 → 상품 위치들”을 냅니다. 이때는 위치가 맞았는지도 봐야 합니다.</p>
<ul>
  <li><b>IoU(Intersection over Union)</b> = 겹친 넓이 / 합친 넓이. 찾은 사각형과 정답 사각형의 IoU 가 0.5 를 넘으면 “맞게 찾음”</li>
  <li><b>TP</b>: 맞게 찾음 · <b>FP</b>: 없는 곳(또는 엉뚱한 곳)을 찾음 · <b>FN</b>: 있는데 못 찾음 → 정밀도 = TP/(TP+FP), 재현율 = TP/(TP+FN)</li>
  <li>볼록한 사각형끼리의 겹친 넓이는 <code>cv.intersectConvexConvex(q1, q2)</code> 로 바로 구할 수 있습니다</li>
</ul>
<p>튜닝할 파라미터는 1주차의 <b>비율 테스트 임계값(ratio)</b> 과 호모그래피의 <b>최소 인라이어 수(min_inliers)</b> 입니다. 조합마다 장면 전체를 다시 처리하면 느리므로,
<b>시간이 드는 부분(ORB 검출 · knnMatch)은 장면마다 한 번만 계산해 캐시</b>하고, 임계값만 바꿔 가며 호모그래피를 다시 구합니다. 이 “비싼 계산 캐시” 요령은 팀 프로젝트 탐색에도 그대로 쓰세요.</p>` },
      { type: 'code', title: '예제 4 · 비율 임계값 × 최소 인라이어 탐색 (P · R · F1 표와 그래프)', code: String.raw`
import time
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found


def iou(q1, q2):
    """볼록 사각형 두 개의 IoU."""
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


cv.setRNGSeed(0)                                   # RANSAC 의 무작위도 고정 (재현성)
t0 = time.perf_counter()
products = make_products()
db = build_db(products, CFG)
orb = cv.ORB_create(CFG['scene_features'])
bf = cv.BFMatcher(cv.NORM_HAMMING)

# ---- 1) 비싼 계산(검출 + knnMatch)은 장면마다 한 번만 ----
rng = np.random.default_rng(100)
cache = []
for _ in range(6):
    scene, truth = make_scene(products, rng, width=(110, 160), noise=20)    # 조금 어려운 장면
    kp, des = orb.detectAndCompute(prep_gray(scene, CFG), None)
    per = {}
    for name, ref in db.items():
        pairs = [p for p in bf.knnMatch(ref['des'], des, k=2) if len(p) == 2]
        d = np.float32([[p[0].distance, p[1].distance] for p in pairs])     # 1등 · 2등 거리
        src = ref['pts'][[p[0].queryIdx for p in pairs]]
        dst = np.float32([kp[p[0].trainIdx].pt for p in pairs])
        per[name] = (d, src, dst)
    cache.append((scene.shape, truth, per))
print(f'캐시 준비 {time.perf_counter() - t0:.2f}s')


# ---- 2) 임계값만 바꿔 가며 평가 ----
def run_ratio(ratio):
    """ratio 로 매칭을 거르고 (인라이어 수, IoU>0.5 여부) 목록을 돌려준다."""
    rows = []
    for shape, truth, per in cache:
        for name, (d, src, dst) in per.items():
            sel = d[:, 0] < ratio * d[:, 1]
            inliers, hit = 0, False
            if sel.sum() >= 4:
                H, mask = cv.findHomography(src[sel], dst[sel], cv.RANSAC, 5.0, maxIters=500)
                ok, quad = quad_ok(H, db[name]['size'], shape)
                if ok:
                    inliers, hit = int(mask.sum()), iou(quad, truth[name]) > 0.5
            rows.append((inliers, hit))
    return rows


ratios = [0.6, 0.7, 0.8, 0.85, 0.9]
min_list = [6, 10, 20, 30]
F1 = np.zeros((len(ratios), len(min_list)))
print(f'\n{"ratio":>5s} {"min_in":>6s} {"TP":>3s} {"FP":>3s} {"FN":>3s} {"P":>6s} {"R":>6s} {"F1":>6s}')
for i, r in enumerate(ratios):
    rows = run_ratio(r)
    for j, m in enumerate(min_list):
        tp = sum(1 for n, hit in rows if n >= m and hit)
        fp = sum(1 for n, hit in rows if n >= m and not hit)
        fn = len(rows) - tp
        P, R = tp / max(tp + fp, 1), tp / len(rows)
        F1[i, j] = 2 * P * R / max(P + R, 1e-9)
        print(f'{r:5.2f} {m:6d} {tp:3d} {fp:3d} {fn:3d} {P:6.3f} {R:6.3f} {F1[i, j]:6.3f}')

bi, bj = np.unravel_index(np.argmax(F1), F1.shape)
print(f'\n최고 F1 = {F1[bi, bj]:.3f} : ratio={ratios[bi]}, min_inliers={min_list[bj]}   (총 {time.perf_counter() - t0:.2f}s)')

for j, m in enumerate(min_list):
    plt.plot(ratios, F1[:, j], 'o-', label=f'min_inliers={m}')
plt.xlabel('ratio threshold')
plt.ylabel('F1')
plt.title('Detection F1 on 6 hard synthetic scenes')
plt.legend()
plt.grid(alpha=0.3)
plt.show()
`, desc: '<p>ratio 가 작으면(0.6) 매칭이 너무 적어 놓치고(재현율↓), 최소 인라이어를 크게 하면(30) 확실한 것만 남아 정밀도는 1.0 이지만 재현율이 무너집니다. ratio 를 0.85~0.9 로 올리면 찾는 수는 조금 늘지만 이상치가 많아져 FP 가 끼어들기 시작하고, RANSAC 반복(maxIters=500)과 계산 시간도 늘어납니다. 그래프의 봉우리(대략 ratio 0.8~0.9, min_inliers 6~10)가 이 데이터의 좋은 설정이고, 봉우리가 평평하면 그중 <b>더 엄격한(FP 가 없는) 쪽</b>을 고르는 것이 안전합니다. RANSAC 과 OpenCV 버전에 따라 표의 숫자가 1~2개씩 달라질 수 있습니다(PC 와 브라우저도 다름).</p>' },
      { type: 'text', html: `
<h3>5. 머신러닝을 “검증 단계”로 결합하기</h3>
<p>특징 매칭 인식기의 설정을 느슨하게 하면(ratio↑, min_inliers↓) 어려운 장면에서 더 많이 찾지만 오검출도 늘어납니다. 이때 <b>서로 다른 원리의 검증을 겹쳐</b> 오검출을 거릅니다.</p>
<ul>
  <li><b>기하 검증</b> <code>quad_ok()</code>: 호모그래피가 만든 사각형이 볼록한가, 뒤집히지 않았나, 넓이가 적당한가</li>
  <li><b>외형 검증</b> SVM: 찾은 사각형을 64×64 로 펴서(<code>rectify</code>) 색 + HOG 로 분류 → <b>매칭이 말한 상품 이름과 같을 때만</b> 인정</li>
</ul>
<p>둘은 실패하는 방식이 다릅니다. 무늬가 우연히 맞은 엉뚱한 영역은 기하 검사를 통과해도 외형이 다르고, 외형이 비슷한 배경은 매칭 기하가 맞지 않습니다. 아래 예제는 상품이 전혀 없는 사진 3장 + 어려운 합성 장면 3장에서 “검증 없음 / SVM 만 / 기하 검사만”을 비교합니다.</p>` },
      { type: 'code', title: '예제 5 · 느슨한 매칭 + 기하 검증 + SVM 검증 비교', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found


def iou(q1, q2):
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


def candidates(frame, db, cfg, orb):
    """매칭 + 호모그래피 후보를 기하 검사 없이 모두 모은다 → [(이름, quad, 기하 통과 여부)]."""
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    out = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0, maxIters=500)
        if H is None or mask.sum() < cfg['min_inliers']:
            continue
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        out.append((name, quad, ok))
    return out


cv.setRNGSeed(0)
t0 = time.perf_counter()
products = make_products()
Xtr, ytr = build_train(products, np.random.default_rng(1), n_per=25, n_none=40)
svm = cv.ml.SVM_create()
svm.setKernel(cv.ml.SVM_RBF)
svm.setC(10)
svm.setGamma(1.0)
svm.train(Xtr, cv.ml.ROW_SAMPLE, ytr)

loose = dict(CFG, ratio=0.85, min_inliers=6, scene_features=1000)     # 일부러 느슨하게
db = build_db(products, loose)
orb = cv.ORB_create(loose['scene_features'])

frames = []
for name in ['home.jpg', 'baboon.jpg', 'building.jpg']:      # 상품이 없는 사진
    im = cv.imread(name)
    frames.append((cv.resize(im, (640, im.shape[0] * 640 // im.shape[1])), {}))
rng = np.random.default_rng(50)
for _ in range(3):
    frames.append(make_scene(products, rng, width=(110, 160), noise=20))

counts = {k: [0, 0] for k in ['none', 'svm', 'geometry', 'geometry+svm']}   # [TP, FP]
for frame, truth in frames:
    for name, quad, geo_ok in candidates(frame, db, loose, orb):
        correct = geo_ok and name in truth and iou(quad, truth[name]) > 0.5
        svm_ok = CLASSES[int(svm.predict(extract(rectify(frame, quad))[None])[1][0, 0])] == name
        for key, accept in [('none', True), ('svm', svm_ok), ('geometry', geo_ok), ('geometry+svm', geo_ok and svm_ok)]:
            if accept:
                counts[key][0 if correct else 1] += 1

total = 4 * 3
print(f'느슨한 설정 ratio=0.85, min_inliers=6 · 상품 없는 사진 3장 + 합성 장면 3장 (정답 {total}개)')
print(f'{"verification":14s} {"TP":>3s} {"FP":>3s} {"precision":>9s} {"recall":>7s}')
for key, (tp, fp) in counts.items():
    print(f'{key:14s} {tp:3d} {fp:3d} {tp / max(tp + fp, 1):9.3f} {tp / total:7.3f}')
print(f'({time.perf_counter() - t0:.2f}s)')
`, desc: '<p>검증 없이 인라이어 수만 보면 상품이 없는 사진에서도 우연히 맞은 매칭으로 FP 가 여럿 생깁니다. <b>SVM 만</b> 붙여도, <b>기하 검사만</b> 붙여도 FP 가 대부분 사라집니다 — 서로 다른 원리의 검증이 각각 같은 오류를 잡아낸 것입니다. 실행 환경에 따라 한쪽 검증만으로는 FP 가 1개쯤 남기도 하는데(브라우저에서는 기하 검사만 썼을 때 1개), 둘을 함께 쓴 geometry+svm 줄은 0 입니다. 대신 SVM 은 잡음이 심한 진짜 상품 조각을 하나쯤 거절해 재현율이 조금 내려갈 수 있습니다(검증을 겹칠수록 정밀도↑ · 재현율↓). 실제 카메라 영상처럼 더 까다로운 입력에서는 둘을 함께 쓰고, 재현율이 아쉬우면 SVM 학습 데이터(잡음 · 흐림 증강)를 보강하세요.</p>' },
      { type: 'tip', html: `<p><b>팀 프로젝트 적용</b>: ① 팀의 최종 지표 1~2개(예: 클래스별 F1, 검출 정밀도/재현율, 평균 오차 mm)를 정하고, ② 기준선(4주차 프로토타입) 수치를 먼저 기록한 뒤, ③ 바꾼 것 하나마다 표에 한 줄씩 추가하세요. “무엇을 바꿨더니 몇 % 좋아졌다”는 표가 곧 발표 자료가 됩니다(a5-6).</p>` },
      { type: 'checklist', title: '평가 · 튜닝 점검 목록', items: [
        '성능은 학습에 쓰지 않은 테스트 데이터로만 쟀다',
        '정확도와 함께 혼동 행렬 · 클래스별 정밀도/재현율(또는 F1)을 보고한다',
        '“전부 한 클래스로 답하기” 같은 기준선(baseline)과 비교했다',
        '학습 정확도와 테스트 정확도를 나란히 적어 과적합 여부를 확인했다',
        '파라미터 탐색 결과를 표(또는 그래프)로 남겼고, 고른 값의 근거를 말할 수 있다',
        '무작위 요소(np.random rng, cv.setRNGSeed)를 고정해 결과를 재현할 수 있다',
        '검출 과제라면 IoU 기준과 TP/FP/FN 정의를 명시했다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 혼동 행렬에서 정밀도 · 재현율 · F1 계산하기',
        desc: `<p>아래 혼동 행렬은 어느 팀의 3클래스 분류 결과입니다(행 = 정답, 열 = 예측). <code>metrics(cm)</code> 을 완성해 클래스별 정밀도 · 재현율 · F1 과 전체 정확도를 계산하세요.
정답 확인: cat 의 정밀도 0.800, dog 의 재현율 0.600, 전체 정확도 0.767 이 나오면 성공입니다. 마지막 줄에 “가장 개선이 필요한 클래스”(F1 최저)를 출력하세요.</p>`,
        starter: String.raw`
import numpy as np

names = ['cat', 'dog', 'none']
cm = np.array([[16, 2, 2],     # 정답 cat  → 예측 cat/dog/none
               [3, 12, 5],     # 정답 dog
               [1, 1, 18]])    # 정답 none


def metrics(cm):
    """(precision, recall, f1, accuracy) — 앞의 셋은 클래스별 배열."""
    n = cm.shape[0]
    # TODO 1: 대각선(np.diag) = 맞힌 개수
    # TODO 2: precision = 대각선 / 열 합(axis=0), recall = 대각선 / 행 합(axis=1)
    # TODO 3: f1 = 2PR/(P+R), accuracy = 대각선 합 / 전체 합
    precision = np.zeros(n)
    recall = np.zeros(n)
    f1 = np.zeros(n)
    accuracy = 0.0
    return precision, recall, f1, accuracy


P, R, F, acc = metrics(cm)
print(f'{"class":6s} {"P":>6s} {"R":>6s} {"F1":>6s}')
for i, c in enumerate(names):
    print(f'{c:6s} {P[i]:6.3f} {R[i]:6.3f} {F[i]:6.3f}')
print(f'accuracy = {acc:.3f}')
print('가장 개선이 필요한 클래스:', names[int(np.argmin(F))])
`,
        hint: `<p><code>tp = np.diag(cm)</code>, <code>P = tp / cm.sum(axis=0)</code>, <code>R = tp / cm.sum(axis=1)</code>. 0 으로 나누는 경우를 막으려면 <code>np.maximum(합, 1)</code> 로 나누세요.</p>`,
        solution: String.raw`
import numpy as np

names = ['cat', 'dog', 'none']
cm = np.array([[16, 2, 2],
               [3, 12, 5],
               [1, 1, 18]])


def metrics(cm):
    """(precision, recall, f1, accuracy) — 앞의 셋은 클래스별 배열."""
    tp = np.diag(cm).astype(float)
    precision = tp / np.maximum(cm.sum(axis=0), 1)
    recall = tp / np.maximum(cm.sum(axis=1), 1)
    f1 = 2 * precision * recall / np.maximum(precision + recall, 1e-9)
    accuracy = tp.sum() / cm.sum()
    return precision, recall, f1, accuracy


P, R, F, acc = metrics(cm)
print(f'{"class":6s} {"P":>6s} {"R":>6s} {"F1":>6s}')
for i, c in enumerate(names):
    print(f'{c:6s} {P[i]:6.3f} {R[i]:6.3f} {F[i]:6.3f}')
print(f'accuracy = {acc:.3f}')
print('가장 개선이 필요한 클래스:', names[int(np.argmin(F))])
print('→ dog 는 none 으로 5개나 놓침(재현율 0.6): dog 학습 데이터 다양화가 우선')
`,
      },
      {
        title: '실습 2 · kNN 의 k 를 바꿔 과적합 곡선 그리기',
        desc: `<p>k = 1, 3, 5, 9, 15, 25 에 대해 kNN 의 <b>학습 정확도</b>와 <b>테스트 정확도</b>를 계산해 한 그래프에 그리세요. 데이터는 빠르게 돌도록 작게(상품당 20개, none 30개, 테스트 장면 4장) 만듭니다.
k=1 의 학습 정확도가 1.0 인 이유를 주석으로 적고, 테스트 정확도가 가장 높은 k 를 출력하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

products = make_products()
Xtr, ytr = build_train(products, np.random.default_rng(1), n_per=20, n_none=30)
Xte, yte = build_test(products, np.random.default_rng(2), n_scenes=4)

knn = cv.ml.KNearest_create()
knn.train(Xtr, cv.ml.ROW_SAMPLE, ytr)
ks = [1, 3, 5, 9, 15, 25]
train_acc, test_acc = [], []
for k in ks:
    # TODO: knn.findNearest(Xtr, k) 와 knn.findNearest(Xte, k) 로 정확도를 계산해 두 리스트에 추가
    train_acc.append(0.0)
    test_acc.append(0.0)

for k, a, b in zip(ks, train_acc, test_acc):
    print(f'k={k:2d}  train={a:.3f}  test={b:.3f}')
plt.plot(ks, train_acc, 'o-', label='train')
plt.plot(ks, test_acc, 's-', label='test')
plt.xlabel('k')
plt.ylabel('accuracy')
plt.title('kNN: train vs test accuracy')
plt.legend()
plt.show()
`,
        hint: `<p><code>ret, result, neighbours, dist = knn.findNearest(X, k)</code> 에서 <code>result</code> 가 (N, 1) 모양의 예측입니다. <code>(result.ravel() == y).mean()</code> 이 정확도입니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

products = make_products()
Xtr, ytr = build_train(products, np.random.default_rng(1), n_per=20, n_none=30)
Xte, yte = build_test(products, np.random.default_rng(2), n_scenes=4)

knn = cv.ml.KNearest_create()
knn.train(Xtr, cv.ml.ROW_SAMPLE, ytr)
ks = [1, 3, 5, 9, 15, 25]
train_acc, test_acc = [], []
for k in ks:
    # k=1 의 학습 정확도는 항상 1.0: 학습 샘플의 가장 가까운 이웃은 거리 0 인 자기 자신이기 때문
    train_acc.append((knn.findNearest(Xtr, k)[1].ravel() == ytr).mean())
    test_acc.append((knn.findNearest(Xte, k)[1].ravel() == yte).mean())

for k, a, b in zip(ks, train_acc, test_acc):
    print(f'k={k:2d}  train={a:.3f}  test={b:.3f}')
print('테스트 정확도가 가장 높은 k =', ks[int(np.argmax(test_acc))])
plt.plot(ks, train_acc, 'o-', label='train')
plt.plot(ks, test_acc, 's-', label='test')
plt.xlabel('k')
plt.ylabel('accuracy')
plt.title('kNN: train vs test accuracy')
plt.legend()
plt.show()
`,
      },
      {
        title: '실습 3 · “운영 기준”으로 설정 고르기',
        desc: `<p>탐색 결과표가 주어졌습니다. 자동 결제 선반이라 <b>정밀도 0.98 이상</b>이 필수 조건이고, 그중 <b>재현율이 가장 높은</b> 설정을 고르려고 합니다. 재현율이 같으면 <b>처리 시간이 짧은</b> 설정을 고르세요.
<code>choose(rows)</code> 를 완성해 선택된 설정과 이유를 출력하세요. (정답: ratio 0.8, min_inliers 10, features 1000)</p>`,
        starter: String.raw`
rows = [  # (ratio, min_inliers, features, precision, recall, ms)
    (0.7, 6, 1500, 0.95, 0.88, 21.0),
    (0.7, 10, 1500, 0.99, 0.81, 21.0),
    (0.8, 6, 1500, 0.96, 0.94, 23.0),
    (0.8, 10, 1500, 0.99, 0.91, 23.0),
    (0.8, 10, 1000, 0.99, 0.91, 15.0),
    (0.8, 20, 1000, 1.00, 0.84, 15.0),
    (0.9, 10, 1500, 0.97, 0.95, 41.0),
]


def choose(rows, min_precision=0.98):
    """정밀도 조건을 만족하는 설정 중 재현율 최대, 같으면 시간 최소."""
    # TODO 1: precision >= min_precision 인 행만 남기기
    # TODO 2: 재현율 큰 순, 같으면 ms 작은 순으로 정렬해 첫 번째 고르기
    return rows[0]


best = choose(rows)
print('선택:', best)
print(f'ratio={best[0]}, min_inliers={best[1]}, features={best[2]} → P={best[3]}, R={best[4]}, {best[5]} ms')
`,
        hint: `<p><code>ok = [r for r in rows if r[3] &gt;= min_precision]</code> 후 <code>sorted(ok, key=lambda r: (-r[4], r[5]))[0]</code>. 키를 튜플로 주면 앞 항목부터 차례로 비교합니다.</p>`,
        solution: String.raw`
rows = [  # (ratio, min_inliers, features, precision, recall, ms)
    (0.7, 6, 1500, 0.95, 0.88, 21.0),
    (0.7, 10, 1500, 0.99, 0.81, 21.0),
    (0.8, 6, 1500, 0.96, 0.94, 23.0),
    (0.8, 10, 1500, 0.99, 0.91, 23.0),
    (0.8, 10, 1000, 0.99, 0.91, 15.0),
    (0.8, 20, 1000, 1.00, 0.84, 15.0),
    (0.9, 10, 1500, 0.97, 0.95, 41.0),
]


def choose(rows, min_precision=0.98):
    """정밀도 조건을 만족하는 설정 중 재현율 최대, 같으면 시간 최소."""
    ok = [r for r in rows if r[3] >= min_precision]
    if not ok:
        raise ValueError('정밀도 조건을 만족하는 설정이 없습니다')
    return sorted(ok, key=lambda r: (-r[4], r[5]))[0]


best = choose(rows)
print('선택:', best)
print(f'ratio={best[0]}, min_inliers={best[1]}, features={best[2]} → P={best[3]}, R={best[4]}, {best[5]} ms')
print('이유: 재현율이 가장 높은 0.9/10 과 0.8/6 은 정밀도 조건 탈락, 0.8/10 두 개 중 1000 features 가 더 빠름')
`,
      },
    ],
    quiz: [
      { q: '테스트 세트 60개 중 none 이 30개입니다. 모든 입력에 none 이라고 답하는 분류기의 정확도와, 이 사실이 주는 교훈은?', options: ['0% — none 은 정답이 아니다', '50% — 정확도만으로는 부족하고 클래스별 정밀도 · 재현율과 기준선을 함께 봐야 한다', '100% — none 이 가장 안전하다', '계산할 수 없다'], answer: 1, explain: '클래스가 불균형하면 아무것도 배우지 않은 분류기도 높은 정확도를 냅니다. 기준선(baseline)과 비교하고, 상품 클래스의 재현율을 따로 봐야 합니다.' },
      { q: '어떤 상품의 정밀도는 1.0 인데 재현율이 0.5 입니다. 올바른 해석은?', options: ['그 상품이라고 한 것은 모두 맞았지만, 실제 그 상품의 절반은 놓쳤다', '그 상품의 절반을 다른 상품으로 착각했고 놓친 것은 없다', '정확도가 50% 이다', '과적합이다'], answer: 0, explain: '정밀도 = 예측한 것 중 맞은 비율, 재현율 = 실제 중 찾은 비율. 보수적인(엄격한) 설정에서 자주 보이는 패턴입니다.' },
      { q: 'SVM RBF 에서 gamma 를 30 으로 키웠더니 학습 정확도 1.00, 테스트 정확도 0.43 이 되었습니다. 가장 알맞은 조치는?', options: ['C 를 더 크게 한다', 'gamma 를 더 키운다', 'gamma 를 줄이거나 학습 데이터 증강을 늘린다', '테스트 세트를 학습 세트에 합친다'], answer: 2, explain: '학습-테스트 차이가 큰 과적합입니다. 모델을 단순하게(작은 gamma) 하거나 데이터를 다양하게 해야 합니다. 테스트 데이터를 학습에 넣으면 평가 자체가 무의미해집니다.' },
      { q: '비율 테스트 임계값과 최소 인라이어 수를 20가지 조합으로 탐색할 때 가장 효율적인 방법은?', options: ['조합마다 장면을 새로 만들고 ORB 부터 다시 계산한다', '장면마다 ORB 검출 · knnMatch 결과(1등 · 2등 거리)를 한 번만 계산해 두고, 임계값만 바꿔 호모그래피를 구한다', 'ratio 는 항상 0.75 이므로 탐색할 필요가 없다', '가장 느린 설정 하나만 시험한다'], answer: 1, explain: '비싼 계산을 캐시하고 싼 계산만 반복하는 것이 탐색의 기본 요령입니다. 같은 인라이어 결과로 여러 min_inliers 를 한꺼번에 평가할 수도 있습니다.' },
      { q: '검출 결과 사각형과 정답 사각형의 IoU 가 0.3 입니다. IoU>0.5 기준에서 이 검출은?', options: ['TP', 'FP (그리고 정답은 FN 으로 남음)', 'TN', '계산에서 제외'], answer: 1, explain: '위치가 충분히 겹치지 않으면 엉뚱한 곳을 찾은 것(FP)이고, 정답 물체는 여전히 못 찾은 것(FN)으로 셉니다.' },
    ],
  },
  // =====================================================================
  // a5-3 구현 ③ 실시간 적용과 최적화
  // =====================================================================
  {
    id: 'a5-3',
    assets: ['images/adv/box.png', 'images/adv/graf1.jpg'],
    summary: '인식기를 process(frame) 에 연결해 웹캠 · 동영상에서 돌립니다. 단계별 시간을 재서 병목을 찾고, 해상도 · 특징점 수를 바꾼 속도-정확도 표를 만든 뒤, “N 프레임마다 인식 + 그 사이는 광류(LK) 추적” 구조로 평균 처리 시간을 크게 줄입니다.',
    goals: [
      '단계별 시간 측정 도구(with stage(...))로 병목 단계를 찾고 화면에 시간 막대를 표시할 수 있다',
      '작업 해상도 · nfeatures 를 바꿔 속도와 재현율의 트레이드오프를 표로 정리할 수 있다',
      'goodFeaturesToTrack + calcOpticalFlowPyrLK + findHomography 로 인식 결과를 프레임 사이에 추적할 수 있다',
      '프레임 번호 · 상태를 전역에 두고 N 프레임마다 인식하는 process(frame) 를 만들고, 동영상 입력으로 재현 가능하게 시험할 수 있다',
    ],
    schedule: [['도입: 한 프레임에 쓸 수 있는 시간', 5], ['개념: 측정 → 병목 → 최적화 순서', 10], ['예제: 시간 측정 · 해상도 표 · 추적', 18], ['process(frame) 실시간 실습 (웹캠/동영상)', 12], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 실시간의 기준 — 프레임 예산(frame budget)</h3>
<p>웹캠은 보통 초당 30장을 보냅니다. 한 장을 <b>33 ms</b> 안에 처리하면 모든 프레임을 따라가고, 100 ms 면 초당 10장(10 FPS), 300 ms 면 3 FPS 로 뚝뚝 끊깁니다. 이 강좌의 브라우저 환경은 PC 의 Python 보다 5~10배 느리므로 <code>process(frame)</code> 한 번을 <b>0.3 초 이내</b>로 설계합니다.</p>
<p>최적화의 순서는 항상 같습니다.</p>
<ol>
  <li><b>측정</b>: 단계마다 시간을 잰다 — 추측으로 고치면 엉뚱한 곳을 고칩니다</li>
  <li><b>병목</b>: 가장 오래 걸리는 단계 하나를 고른다 (보통 전체의 50% 이상을 차지)</li>
  <li><b>줄이기</b>: 입력을 줄이거나(해상도 · ROI), 일을 줄이거나(특징점 수), 덜 자주 하거나(N 프레임마다)</li>
  <li><b>다시 측정 + 정확도 확인</b>: 빨라졌지만 못 찾게 됐다면 실패입니다 — a5-2 의 재현율을 함께 봅니다</li>
</ol>
<p>시간 측정은 <code>time.perf_counter()</code> 로 합니다. 코드 여러 곳에 시작/끝을 쓰면 지저분하므로 <code>with stage('orb'):</code> 한 줄로 블록 시간을 모으는 도구를 만듭니다(<code>contextlib.contextmanager</code>).</p>` },
      { type: 'code', title: '예제 1 · 단계별 시간 측정과 시간 막대 그래프', code: String.raw`
import time
from contextlib import contextmanager
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

TIMES = {}


@contextmanager
def stage(name):
    """with stage('이름'): 블록 실행 시간(ms)을 TIMES[이름] 에 더한다."""
    t = time.perf_counter()
    yield
    TIMES[name] = TIMES.get(name, 0.0) + (time.perf_counter() - t) * 1000


def draw_time_bars(img, times, x=10, y=20, bar_max=150):
    """단계별 시간을 막대로 그린다 (가장 긴 막대 = bar_max px). 가장 느린 단계는 빨간색."""
    worst = max(times, key=times.get)
    cv.rectangle(img, (0, 0), (x + 150 + bar_max + 10, y + 22 * len(times)), (30, 30, 30), -1)
    for i, (name, ms) in enumerate(times.items()):
        yy = y + 22 * i
        color = (0, 0, 255) if name == worst else (0, 200, 0)
        cv.putText(img, f'{name} {ms:.1f}ms', (x, yy), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv.LINE_AA)
        cv.rectangle(img, (x + 150, yy - 12), (x + 150 + int(bar_max * ms / times[worst]), yy + 2), color, -1)


products = make_products()
db = build_db(products, CFG)
scene, truth = make_scene(products, np.random.default_rng(4))
orb = cv.ORB_create(CFG['scene_features'])
bf = cv.BFMatcher(cv.NORM_HAMMING)

REPEAT = 3                                     # 여러 번 돌려 평균 (첫 실행은 준비 시간 때문에 느릴 수 있음)
for _ in range(REPEAT):
    with stage('prep'):
        gray = prep_gray(scene, CFG)
    with stage('orb'):
        kp, des = orb.detectAndCompute(gray, None)
    found = []
    for name, ref in db.items():
        with stage('match'):
            pairs = bf.knnMatch(ref['des'], des, k=2)
            good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < CFG['ratio'] * p[1].distance]
        if len(good) < CFG['min_inliers']:
            continue
        with stage('homography'):
            src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
            dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
            H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
            ok, quad = quad_ok(H, ref['size'], scene.shape)
        if ok and mask.sum() >= CFG['min_inliers']:
            found.append((name, quad))
    with stage('draw'):
        vis = scene.copy()
        for name, quad in found:
            cv.polylines(vis, [np.int32(quad)], True, (0, 255, 0), 3, cv.LINE_AA)
            cv.putText(vis, name, tuple(np.int32(quad[0])), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv.LINE_AA)

avg = {k: v / REPEAT for k, v in TIMES.items()}
total = sum(avg.values())
print(f'찾은 상품: {[n for n, _ in found]}  (키포인트 {len(kp)}개)')
print(f'{"stage":>11s} {"ms":>6s} {"share":>6s}')
for k, v in sorted(avg.items(), key=lambda kv: -kv[1]):
    print(f'{k:>11s} {v:6.1f} {100 * v / total:5.1f}%')
print(f'{"total":>11s} {total:6.1f}  → 이 속도라면 약 {1000 / total:.0f} FPS (브라우저는 5~10배 느림)')
draw_time_bars(vis, avg)
cv.imshow('stage timing', vis)
`, desc: '<p>대부분 <b>orb</b>(특징점 검출 + 기술자 계산)이 가장 느리고, 상품 수만큼 반복하는 <b>match</b> 가 그다음입니다. 병목이 orb 라면 “특징점 수를 줄이거나 이미지를 줄이는” 최적화가, match 라면 “상품 수 · 기준 특징점 수를 줄이는” 최적화가 효과가 큽니다. 자기 팀 코드에도 <code>with stage(...)</code> 를 붙여 병목부터 확인하세요.</p>' },
      { type: 'text', html: `
<h3>2. 해상도와 특징점 수 — 속도 · 정확도 트레이드오프</h3>
<p>가장 쉬운 최적화는 <b>입력을 줄이는 것</b>입니다. 가로 640 → 320 이면 픽셀 수가 1/4 이 되고, ORB 의 <code>nfeatures</code> 를 줄이면 기술자 계산과 매칭이 줄어듭니다. 하지만 공짜가 아닙니다.</p>
<ul>
  <li>축소하면 상품도 작아집니다. ORB 는 한 점의 기술자를 31×31 패치로 계산하므로 <b>상품이 화면에서 대략 100~120 px 보다 작아지면</b> 쓸 만한 점이 급격히 줄어듭니다.</li>
  <li>축소할 때는 기준 이미지 크기(<code>ref_side</code>)도 같은 비율로 줄여야 두 영상의 배율 차이가 커지지 않습니다.</li>
  <li>찾은 꼭짓점은 작업 해상도 좌표이므로 <b>원본 좌표 = 작업 좌표 / s</b> 로 되돌려 그리고 평가합니다(입문 w5-1 과 같은 원리).</li>
</ul>
<p>아래 예제는 같은 5장면을 여러 (가로, nfeatures) 조합으로 처리해 <b>재현율과 장면당 시간</b>을 표로 만듭니다. 발표에서 “왜 이 해상도를 골랐나?”에 대한 답이 이 표입니다.</p>` },
      { type: 'code', title: '예제 2 · 작업 해상도 × nfeatures 속도-재현율 표', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found


def iou(q1, q2):
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


cv.setRNGSeed(0)
products = make_products()
rng = np.random.default_rng(10)
scenes = [make_scene(products, rng) for _ in range(5)]

print(f'{"width":>5s} {"nfeat":>5s} {"recall":>6s} {"ms/scene":>8s} {"speedup":>7s}')
base_ms = None
rows = []
for width, nf in [(640, 1500), (640, 800), (480, 1000), (480, 600), (400, 800), (320, 600)]:
    s = width / 640
    cfg = dict(CFG, scene_features=nf, ref_side=int(CFG['ref_side'] * s))   # 기준 이미지도 같은 비율로
    db = build_db(products, cfg)
    orb = cv.ORB_create(nf)
    tp, ms = 0, 0.0
    for scene, truth in scenes:
        t = time.perf_counter()
        small = cv.resize(scene, None, fx=s, fy=s, interpolation=cv.INTER_AREA) if s < 1 else scene
        found = recognize(small, db, cfg, orb)
        ms += (time.perf_counter() - t) * 1000
        for r in found:
            if iou(r['quad'] / s, truth[r['name']]) > 0.5:          # 작업 좌표 → 원본 좌표
                tp += 1
    ms /= len(scenes)
    base_ms = base_ms or ms
    recall = tp / (4 * len(scenes))
    rows.append((width, nf, recall, ms))
    print(f'{width:5d} {nf:5d} {recall:6.2f} {ms:8.1f} {base_ms / ms:6.1f}x')

ok = [r for r in rows if r[2] >= 0.9]
best = min(ok, key=lambda r: r[3])
print(f'\n재현율 0.9 이상 중 가장 빠른 설정: width={best[0]}, nfeatures={best[1]} ({best[3]:.1f} ms)')
`, desc: '<p>대표 결과: 640/1500 은 재현율 1.00, 640/800 은 조금 빠르면서 0.95 수준, 가로 480 이하로 줄이면 시간은 줄지만 상품이 작아져 재현율이 크게 떨어집니다(320 에서는 거의 못 찾음). 이 데이터에서는 “해상도는 유지하고 nfeatures 를 줄이는” 편이 낫고, 더 빨라져야 한다면 다음 절의 <b>덜 자주 인식하기</b>가 답입니다. 숫자는 실행 환경마다 조금씩 다릅니다.</p>' },
      { type: 'text', html: `
<h3>3. 덜 자주 인식하고, 그 사이는 추적하기</h3>
<p>상품은 한 프레임 사이에 거의 움직이지 않습니다. 매 프레임 ORB + 매칭 + 호모그래피를 다시 할 필요가 없습니다.</p>
<ul>
  <li><b>인식(detect) 프레임</b> — N 프레임마다 한 번: <code>recognize()</code> 로 상품과 사각형을 찾고, 사각형 안에서 <code>cv.goodFeaturesToTrack</code>(1주차 Shi-Tomasi)으로 추적용 코너를 뽑아 둡니다.</li>
  <li><b>추적(track) 프레임</b> — 나머지: <code>cv.calcOpticalFlowPyrLK(이전 흑백, 현재 흑백, 점들)</code> 로 점들이 어디로 갔는지 찾고, 이전 점 → 현재 점의 호모그래피로 <b>사각형 꼭짓점을 옮깁니다</b>.</li>
  <li><b>실패 처리</b>: 살아남은 점이 8개 미만이거나 사각형이 꼬이면 그 상품을 버리고, 다음 인식 프레임에서 다시 찾습니다. 영상 크기가 바뀌면(입력 소스 변경) 즉시 인식합니다.</li>
</ul>
<p>이 로직을 <code>ShelfTracker</code> 클래스로 묶습니다. 클래스는 “이전 흑백 영상, 프레임 번호, 추적 중인 상품” 같은 <b>프레임 사이의 상태</b>를 담기 좋습니다.
평가는 재현 가능한 <b>합성 동영상</b>(상품 2개가 선반 위를 움직이는 15프레임)에서 합니다 — 정답 꼭짓점이 있으니 프레임마다 IoU 를 잴 수 있습니다.</p>` },
      { type: 'code', title: '예제 3 · 매 프레임 인식 vs N 프레임마다 인식 + LK 추적', code: String.raw`
import time
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ④ N프레임마다 인식 + 광류 추적 (a5-3) =====
class ShelfTracker:
    """every 프레임마다 recognize() 로 새로 찾고, 그 사이 프레임은 LK 광류로 사각형을 따라간다."""

    def __init__(self, db, cfg, every=6):
        self.db, self.cfg, self.every = db, cfg, every
        self.orb = cv.ORB_create(cfg['scene_features'])
        self.frame_no = 0
        self.prev_gray = None
        self.tracks = []                          # [{'name', 'quad', 'pts', 'inliers'}]

    def detect(self, frame, gray):
        self.tracks = []
        for r in recognize(frame, self.db, self.cfg, self.orb):
            mask = np.zeros_like(gray)
            cv.fillConvexPoly(mask, np.int32(r['quad']), 255)
            pts = cv.goodFeaturesToTrack(gray, 60, 0.01, 5, mask=mask)   # 사각형 안의 추적용 코너
            if pts is not None and len(pts) >= 8:
                self.tracks.append({'name': r['name'], 'quad': r['quad'], 'pts': pts, 'inliers': r['inliers']})

    def track(self, gray):
        alive = []
        for t in self.tracks:
            nxt, st, _ = cv.calcOpticalFlowPyrLK(self.prev_gray, gray, t['pts'], None, winSize=(21, 21), maxLevel=3)
            ok = st.ravel() == 1
            old, new = t['pts'][ok], nxt[ok]
            if len(new) < 8:
                continue                                                  # 점을 너무 많이 잃음 → 버림
            M, inl = cv.findHomography(old, new, cv.RANSAC, 3.0)
            if M is None:
                continue
            quad = cv.perspectiveTransform(t['quad'].reshape(-1, 1, 2), M).reshape(4, 2)
            if not cv.isContourConvex(np.int32(quad)):
                continue
            t['quad'], t['pts'] = quad, new[inl.ravel() == 1].reshape(-1, 1, 2)
            alive.append(t)
        self.tracks = alive

    def update(self, frame):
        """프레임 하나 처리 → (tracks, 'detect' 또는 'track')."""
        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        size_changed = self.prev_gray is None or self.prev_gray.shape != gray.shape
        if self.frame_no % self.every == 0 or not self.tracks or size_changed:
            self.detect(frame, gray)
            mode = 'detect'
        else:
            self.track(gray)
            mode = 'track'
        self.prev_gray = gray
        self.frame_no += 1
        return self.tracks, mode

# ===== 데모 입력: 영상 위에 상품을 움직이며 붙이기 (상품이 없는 웹캠 · 동영상으로도 시험) =====
def place(img, center, width, angle=0.0, tilt=0.0):
    """img 를 center 에 가로 width 로, angle(도) 회전 · tilt(좌우 원근) 를 주어 놓는 네 꼭짓점."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh * (1 - tilt)], [hw, -hh * (1 + tilt)], [hw, hh * (1 + tilt)], [-hw, hh * (1 - tilt)]])
    a = np.deg2rad(angle)
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def demo_overlay(frame, product, n):
    """n 번째 프레임에서 상품을 8자 모양으로 움직이며 frame 에 직접 붙이고 정답 꼭짓점을 돌려준다."""
    h, w = frame.shape[:2]
    t = n / 25.0
    center = (w * (0.5 + 0.22 * np.sin(t)), h * (0.5 + 0.15 * np.sin(2 * t)))
    quad = place(product, center, 0.32 * w, angle=15 * np.sin(0.7 * t), tilt=0.15 * np.sin(1.3 * t))
    paste(frame, product, quad)
    return quad


def iou(q1, q2):
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


def make_sequence(products, n=15, seed=3):
    """cookie 와 tea 가 선반 위를 움직이는 합성 동영상 (프레임 리스트, 정답 리스트)."""
    rng = np.random.default_rng(seed)
    bg = add_noise(make_shelf(), rng, 10)
    frames, truths = [], []
    for i in range(n):
        t = i / (n - 1)
        truth = {'cookie': place(products['cookie'], (130 + 380 * t, 130 + 20 * np.sin(6 * t)), 170, -10 + 20 * t, 0.15 * np.sin(4 * t)),
                 'tea': place(products['tea'], (500 - 330 * t, 350), 140, 8 * np.sin(5 * t), -0.1 * t)}
        f = bg.copy()
        for name, q in truth.items():
            paste(f, products[name], q)
        frames.append(add_noise(f, rng, 6))
        truths.append(truth)
    return frames, truths


cv.setRNGSeed(0)
products = make_products()
cfg = dict(CFG, scene_features=1000)
db = build_db(products, cfg)
frames, truths = make_sequence(products)

results = {}
for every in (1, 6):
    tracker = ShelfTracker(db, cfg, every)
    ms, ious, modes = [], [], []
    for frame, truth in zip(frames, truths):
        t = time.perf_counter()
        tracks, mode = tracker.update(frame)
        ms.append((time.perf_counter() - t) * 1000)
        modes.append(mode)
        got = {tr['name']: tr['quad'] for tr in tracks}
        ious.append(np.mean([iou(got[n], q) if n in got else 0.0 for n, q in truth.items()]))
    results[every] = (ms, ious, modes)
    det = [m for m, md in zip(ms, modes) if md == 'detect']
    trk = [m for m, md in zip(ms, modes) if md == 'track']
    print(f'every={every:2d}: 평균 {np.mean(ms):5.1f} ms/frame (detect {np.mean(det):5.1f} ms x{len(det)}, '
          f'track {np.mean(trk) if trk else 0:4.1f} ms x{len(trk)}) · 평균 IoU {np.mean(ious):.3f} · 최소 IoU {np.min(ious):.3f}')

last = frames[-1].copy()
for tr in tracker.tracks:
    cv.polylines(last, [np.int32(tr['quad'])], True, (0, 255, 0), 3, cv.LINE_AA)
    for p in tr['pts'].reshape(-1, 2):
        cv.circle(last, (int(p[0]), int(p[1])), 2, (0, 0, 255), -1)
cv.imshow('last frame: tracked quads + LK points', last)

fig, ax = plt.subplots(2, 1, figsize=(8, 5), sharex=True)
for every, (ms, ious, modes) in results.items():
    ax[0].plot(ms, 'o-', label=f'every {every}')
    ax[1].plot(ious, 'o-', label=f'every {every}')
ax[0].set_ylabel('ms / frame')
ax[1].set_ylabel('mean IoU')
ax[1].set_xlabel('frame')
ax[0].legend()
ax[0].set_title('Detect every frame vs detect every 6 + LK tracking')
plt.tight_layout()
plt.show()
`, desc: '<p>6 프레임마다 인식하면 평균 처리 시간이 약 1/3 이하로 줄고(인식 프레임만 뾰족하게 튐), IoU 는 매 프레임 인식과 거의 같습니다. 오히려 추적이 사각형을 부드럽게 이어 주어 흔들림이 줄기도 합니다. 빨간 점이 LK 로 따라간 코너들입니다. 물체가 빠르게 움직이거나 가려지면 추적이 끊기므로 N 을 너무 크게 잡지 마세요(보통 5~15).</p>' },
      { type: 'text', html: `
<h3>4. process(frame) 로 실시간 연결하기</h3>
<p>이제 웹캠 · 동영상에 연결합니다. 입문 과정에서처럼 <code>def process(frame):</code> 만 정의하면 입력 소스가 웹캠 · 동영상일 때 매 프레임 호출됩니다. 실시간 코드에서 신경 쓸 점:</p>
<ul>
  <li><b>무거운 준비는 process 밖에서 한 번만</b>: 상품 이미지 로드, <code>build_db</code>, 트래커 생성</li>
  <li><b>프레임 사이 상태는 전역 객체에</b>: <code>tracker</code>(이전 영상 · 프레임 번호), FPS 이동 평균</li>
  <li><b>큰 입력은 작업 해상도로</b>: 가로 640 초과면 줄여서 처리하고, 결과 좌표는 원본으로 되돌려 그리기</li>
  <li><b>화면에 상태 표시(HUD)</b>: 모드(DETECT/TRACK), 처리 ms, FPS — 발표 데모에서도 “실시간”을 숫자로 보여 줍니다</li>
  <li><b>재현 가능한 시험</b>: 웹캠 앞에 상품이 없어도 되도록 <code>demo</code> 트랙바를 켜면 입력 영상 위에 cookie 상품을 움직이며 붙입니다. 🎞️ <code>cup.mp4</code> · <code>vtest.mp4</code> 를 입력으로 고르면 누구나 같은 영상으로 시험할 수 있습니다.</li>
</ul>` },
      { type: 'code', title: '예제 4 · 실시간 스마트 선반 인식기 process(frame) — 웹캠 · 동영상', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ④ N프레임마다 인식 + 광류 추적 (a5-3) =====
class ShelfTracker:
    """every 프레임마다 recognize() 로 새로 찾고, 그 사이 프레임은 LK 광류로 사각형을 따라간다."""

    def __init__(self, db, cfg, every=6):
        self.db, self.cfg, self.every = db, cfg, every
        self.orb = cv.ORB_create(cfg['scene_features'])
        self.frame_no = 0
        self.prev_gray = None
        self.tracks = []                          # [{'name', 'quad', 'pts', 'inliers'}]

    def detect(self, frame, gray):
        self.tracks = []
        for r in recognize(frame, self.db, self.cfg, self.orb):
            mask = np.zeros_like(gray)
            cv.fillConvexPoly(mask, np.int32(r['quad']), 255)
            pts = cv.goodFeaturesToTrack(gray, 60, 0.01, 5, mask=mask)   # 사각형 안의 추적용 코너
            if pts is not None and len(pts) >= 8:
                self.tracks.append({'name': r['name'], 'quad': r['quad'], 'pts': pts, 'inliers': r['inliers']})

    def track(self, gray):
        alive = []
        for t in self.tracks:
            nxt, st, _ = cv.calcOpticalFlowPyrLK(self.prev_gray, gray, t['pts'], None, winSize=(21, 21), maxLevel=3)
            ok = st.ravel() == 1
            old, new = t['pts'][ok], nxt[ok]
            if len(new) < 8:
                continue                                                  # 점을 너무 많이 잃음 → 버림
            M, inl = cv.findHomography(old, new, cv.RANSAC, 3.0)
            if M is None:
                continue
            quad = cv.perspectiveTransform(t['quad'].reshape(-1, 1, 2), M).reshape(4, 2)
            if not cv.isContourConvex(np.int32(quad)):
                continue
            t['quad'], t['pts'] = quad, new[inl.ravel() == 1].reshape(-1, 1, 2)
            alive.append(t)
        self.tracks = alive

    def update(self, frame):
        """프레임 하나 처리 → (tracks, 'detect' 또는 'track')."""
        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        size_changed = self.prev_gray is None or self.prev_gray.shape != gray.shape
        if self.frame_no % self.every == 0 or not self.tracks or size_changed:
            self.detect(frame, gray)
            mode = 'detect'
        else:
            self.track(gray)
            mode = 'track'
        self.prev_gray = gray
        self.frame_no += 1
        return self.tracks, mode

# ===== 데모 입력: 영상 위에 상품을 움직이며 붙이기 (상품이 없는 웹캠 · 동영상으로도 시험) =====
def place(img, center, width, angle=0.0, tilt=0.0):
    """img 를 center 에 가로 width 로, angle(도) 회전 · tilt(좌우 원근) 를 주어 놓는 네 꼭짓점."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh * (1 - tilt)], [hw, -hh * (1 + tilt)], [hw, hh * (1 + tilt)], [-hw, hh * (1 - tilt)]])
    a = np.deg2rad(angle)
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def demo_overlay(frame, product, n):
    """n 번째 프레임에서 상품을 8자 모양으로 움직이며 frame 에 직접 붙이고 정답 꼭짓점을 돌려준다."""
    h, w = frame.shape[:2]
    t = n / 25.0
    center = (w * (0.5 + 0.22 * np.sin(t)), h * (0.5 + 0.15 * np.sin(2 * t)))
    quad = place(product, center, 0.32 * w, angle=15 * np.sin(0.7 * t), tilt=0.15 * np.sin(1.3 * t))
    paste(frame, product, quad)
    return quad

# ---- 준비는 한 번만 ----
products = make_products()
RT_CFG = dict(CFG, scene_features=1000)
db = build_db(products, RT_CFG)
tracker = ShelfTracker(db, RT_CFG, every=6)
STATE = {'n': 0, 'fps': 0.0}
COLORS = {'cookie': (0, 200, 255), 'graffiti': (255, 0, 255), 'soccer': (0, 255, 0), 'tea': (255, 180, 0)}


def nothing(x):
    pass


cv.namedWindow('result')
cv.createTrackbar('demo', 'result', 1, 1, nothing)          # 1: 입력 위에 cookie 를 붙여 시험
cv.createTrackbar('every N', 'result', 6, 15, nothing)      # N 프레임마다 인식


def process(frame):
    t0 = time.perf_counter()
    frame = frame.copy()
    if cv.getTrackbarPos('demo', 'result') == 1:
        demo_overlay(frame, products['cookie'], STATE['n'])
    s = min(1.0, 640 / frame.shape[1])                       # 작업 해상도: 가로 최대 640
    work = cv.resize(frame, None, fx=s, fy=s, interpolation=cv.INTER_AREA) if s < 1 else frame
    tracker.every = max(1, cv.getTrackbarPos('every N', 'result'))

    tracks, mode = tracker.update(work)

    for tr in tracks:
        quad = np.int32(tr['quad'] / s)                       # 작업 좌표 → 원본 좌표
        color = COLORS.get(tr['name'], (0, 255, 0))
        cv.polylines(frame, [quad], True, color, 3, cv.LINE_AA)
        cv.putText(frame, tr['name'], (int(quad[:, 0].min()), int(quad[:, 1].min()) - 8),
                   cv.FONT_HERSHEY_SIMPLEX, 0.8, color, 2, cv.LINE_AA)

    ms = (time.perf_counter() - t0) * 1000
    STATE['fps'] = 0.9 * STATE['fps'] + 0.1 * (1000 / max(ms, 1))     # 이동 평균 FPS
    STATE['n'] += 1
    hud_color = (0, 0, 255) if mode == 'detect' else (0, 255, 0)
    cv.rectangle(frame, (0, 0), (frame.shape[1], 34), (30, 30, 30), -1)
    cv.putText(frame, f'{mode.upper():6s} {ms:5.1f} ms  ~{STATE["fps"]:4.0f} FPS  N={tracker.every}  items={len(tracks)}',
               (10, 24), cv.FONT_HERSHEY_SIMPLEX, 0.65, hud_color, 2, cv.LINE_AA)
    return frame


print('오른쪽 패널에서 입력 소스를 📷 웹캠 또는 🎞️ 동영상(cup.mp4 · vtest.mp4)으로 바꾸세요.')
print('demo=1 이면 영상 위에 cookie 상품을 붙여 시험합니다. 실제 상품으로 하려면 box.png 를 휴대폰 화면에 띄워 비추고 demo=0.')
`, desc: '<p>HUD 의 DETECT(빨강)가 N 프레임마다 한 번씩 깜빡이고 나머지는 TRACK(초록)으로 빠르게 처리되는지 보세요. <b>every N</b> 을 1 로 내리면 매 프레임 인식해 FPS 가 떨어집니다. 이미지 입력(정지 화면)일 때는 트랙바를 움직일 때마다 한 번씩 호출되므로 데모 상품 위치가 조금씩 바뀝니다.</p>' },
      { type: 'code', norun: true, title: '참고 · 데스크톱 OpenCV 에서는 while 루프로 (웹 실습 환경에서는 실행하지 않음)', code: String.raw`
import time
import cv2 as cv

cap = cv.VideoCapture(0)                 # 또는 'cup.mp4'
while True:
    ok, frame = cap.read()
    if not ok:
        break
    out = process(frame)                  # 위 예제의 process 를 그대로 재사용
    cv.imshow('result', out)
    if cv.waitKey(1) & 0xFF == 27:        # ESC 로 종료
        break
cap.release()
cv.destroyAllWindows()
`, desc: '<p>웹 실습 환경의 <code>process(frame)</code> 구조로 만들어 두면, 데스크톱으로 옮길 때 이 루프만 덧붙이면 됩니다. 함수를 “프레임 하나 → 결과 이미지 하나”로 설계하는 것이 이식성의 핵심입니다.</p>' },
      { type: 'warn', html: `<p><b>실시간 코드에서 흔한 실수</b>: ① process 안에서 <code>build_db</code> · 이미지 로드 · 모델 학습을 매번 함(가장 흔한 “느림”의 원인), ② 입력 크기가 바뀌었는데 이전 흑백 영상과 광류를 계산해 오류, ③ 작업 해상도 좌표를 원본에 그대로 그려 상자가 어긋남, ④ 원본 <code>frame</code> 에 그린 뒤 그 이미지를 다시 인식에 사용(그림이 특징점이 됨).</p>` },
      { type: 'checklist', title: '실시간 적용 점검 목록', items: [
        '무거운 준비(이미지 · 모델 · DB)는 process 밖에서 한 번만 한다',
        '단계별 시간을 측정해 병목 단계를 알고 있다',
        '해상도 · 특징점 수를 바꾼 속도-정확도 표가 있다',
        'N 프레임마다 인식 + 추적(또는 결과 유지)으로 평균 처리 시간을 줄였다',
        '입력 크기가 바뀌거나 추적이 끊겨도 오류 없이 다시 인식한다',
        '화면에 모드 · ms · FPS 를 표시한다',
        '동영상 입력(cup.mp4 등)으로 누구나 같은 조건에서 재현할 수 있다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · ROI 에서만 다시 찾기',
        desc: `<p>추적이 끊긴 상품은 보통 <b>직전 위치 근처</b>에 있습니다. 전체 화면 대신 직전 사각형을 사방 60px 넓힌 <b>ROI</b> 에서만 <code>recognize()</code> 를 돌리면 훨씬 빠릅니다.
<code>recognize_in_roi(frame, quad, pad)</code> 를 완성하세요: ROI 를 잘라 인식하고, 찾은 꼭짓점에 ROI 의 왼쪽 위 좌표를 더해 전체 좌표로 돌려줍니다. 전체 화면 인식 대비 시간 비율과, 두 결과의 꼭짓점 차이(px)가 출력되면 성공입니다. ROI 안에서는 같은 nfeatures 가 상품에 몰리므로 인라이어 수도 늘어나는지 확인해 보세요.</p>`,
        starter: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

products = make_products()
db = build_db({'cookie': products['cookie']}, CFG)
scene, truth = make_scene(products, np.random.default_rng(4))
orb = cv.ORB_create(CFG['scene_features'])
prev_quad = truth['cookie'] + np.float32([6, -4])            # 직전 프레임 위치(조금 어긋남)


def recognize_in_roi(frame, quad, pad=60):
    """quad 를 pad 만큼 넓힌 ROI 에서만 인식하고, 결과 꼭짓점을 전체 영상 좌표로 돌려준다."""
    # TODO 1: quad 의 min/max 로 x0, y0, x1, y1 을 구하고 pad 만큼 넓힌 뒤 영상 범위로 자르기
    # TODO 2: roi = frame[y0:y1, x0:x1] 로 recognize() 호출
    # TODO 3: 결과마다 r['quad'] 에 (x0, y0) 를 더하기
    return recognize(frame, db, CFG, orb)                    # (지금은 전체 화면)


t_full, t_roi = [], []
for _ in range(5):                                           # 5번 재서 가장 빠른 값 (측정 잡음 줄이기)
    t = time.perf_counter()
    full = recognize(scene, db, CFG, orb)
    t_full.append((time.perf_counter() - t) * 1000)
    t = time.perf_counter()
    roi = recognize_in_roi(scene, prev_quad)
    t_roi.append((time.perf_counter() - t) * 1000)
print(f'전체 {min(t_full):.1f} ms / ROI {min(t_roi):.1f} ms  → {min(t_full) / max(min(t_roi), 1e-3):.1f}배 빠름')
if full and roi:
    print('꼭짓점 차이(px):', np.round(np.abs(full[0]['quad'] - roi[0]['quad']).max(), 2))
    print('인라이어 수  전체:', full[0]['inliers'], '/ ROI:', roi[0]['inliers'])
vis = scene.copy()
for r in roi:
    cv.polylines(vis, [np.int32(r['quad'])], True, (0, 255, 0), 3)
cv.imshow('roi recognition', vis)
`,
        hint: `<p><code>x0, y0 = np.maximum(quad.min(axis=0) - pad, 0).astype(int)</code>, <code>x1, y1 = np.minimum(quad.max(axis=0) + pad, [w, h]).astype(int)</code>. 결과 좌표 보정은 <code>r['quad'] = r['quad'] + np.float32([x0, y0])</code>. ROI 가 작으면 특징점이 적으니 <code>nfeatures</code> 가 그대로여도 충분합니다.</p>`,
        solution: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

products = make_products()
db = build_db({'cookie': products['cookie']}, CFG)
scene, truth = make_scene(products, np.random.default_rng(4))
orb = cv.ORB_create(CFG['scene_features'])
prev_quad = truth['cookie'] + np.float32([6, -4])


def recognize_in_roi(frame, quad, pad=60):
    """quad 를 pad 만큼 넓힌 ROI 에서만 인식하고, 결과 꼭짓점을 전체 영상 좌표로 돌려준다."""
    h, w = frame.shape[:2]
    x0, y0 = np.maximum(quad.min(axis=0) - pad, 0).astype(int)
    x1, y1 = np.minimum(quad.max(axis=0) + pad, [w, h]).astype(int)
    found = recognize(frame[y0:y1, x0:x1], db, CFG, orb)
    for r in found:
        r['quad'] = r['quad'] + np.float32([x0, y0])
    return found


t_full, t_roi = [], []
for _ in range(5):                                           # 5번 재서 가장 빠른 값 (측정 잡음 줄이기)
    t = time.perf_counter()
    full = recognize(scene, db, CFG, orb)
    t_full.append((time.perf_counter() - t) * 1000)
    t = time.perf_counter()
    roi = recognize_in_roi(scene, prev_quad)
    t_roi.append((time.perf_counter() - t) * 1000)
print(f'전체 {min(t_full):.1f} ms / ROI {min(t_roi):.1f} ms  → {min(t_full) / max(min(t_roi), 1e-3):.1f}배 빠름')
if full and roi:
    print('꼭짓점 차이(px):', np.round(np.abs(full[0]['quad'] - roi[0]['quad']).max(), 2))
    print('인라이어 수  전체:', full[0]['inliers'], '/ ROI:', roi[0]['inliers'])
vis = scene.copy()
for r in roi:
    cv.polylines(vis, [np.int32(r['quad'])], True, (0, 255, 0), 3)
cv.imshow('roi recognition', vis)
`,
      },
      {
        title: '실습 2 · 결과 유지(hold)로 깜빡임 줄이기',
        desc: `<p>인식이 가끔 한두 프레임 실패하면 상자가 깜빡여 데모가 불안해 보입니다. 아래 시뮬레이션은 30프레임 중 무작위로 25% 의 프레임에서 인식이 실패합니다.
<code>Holder.update(detected)</code> 를 완성해, 실패해도 <b>최근 결과를 최대 HOLD 프레임까지 유지</b>하도록 하세요. “화면에 상자가 없는 프레임 수”가 HOLD=0 일 때보다 크게 줄면 성공입니다.</p>`,
        starter: String.raw`
import numpy as np

rng = np.random.default_rng(7)
detections = [None if rng.random() < 0.25 else ('cookie', i) for i in range(30)]   # None = 인식 실패


class Holder:
    """마지막으로 성공한 결과를 hold 프레임까지 유지한다."""

    def __init__(self, hold):
        self.hold = hold
        self.last = None
        self.missed = 0

    def update(self, detected):
        # TODO: detected 가 있으면 last 갱신 · missed=0 후 반환
        #       없으면 missed += 1, missed <= hold 이면 last 반환, 아니면 None
        return detected


for HOLD in (0, 2):
    h = Holder(HOLD)
    shown = [h.update(d) for d in detections]
    blank = sum(1 for s in shown if s is None)
    print(f'HOLD={HOLD}: 상자 없는 프레임 {blank} / 30   ' + ''.join('.' if s is None else '#' for s in shown))
`,
        hint: `<p><code>if detected is not None: self.last, self.missed = detected, 0; return detected</code> 다음에 실패 처리. 너무 오래 유지하면 물체가 사라져도 상자가 남으니 hold 는 짧게(2~5 프레임).</p>`,
        solution: String.raw`
import numpy as np

rng = np.random.default_rng(7)
detections = [None if rng.random() < 0.25 else ('cookie', i) for i in range(30)]


class Holder:
    """마지막으로 성공한 결과를 hold 프레임까지 유지한다."""

    def __init__(self, hold):
        self.hold = hold
        self.last = None
        self.missed = 0

    def update(self, detected):
        if detected is not None:
            self.last, self.missed = detected, 0
            return detected
        self.missed += 1
        return self.last if self.missed <= self.hold else None


for HOLD in (0, 2):
    h = Holder(HOLD)
    shown = [h.update(d) for d in detections]
    blank = sum(1 for s in shown if s is None)
    print(f'HOLD={HOLD}: 상자 없는 프레임 {blank} / 30   ' + ''.join('.' if s is None else '#' for s in shown))
`,
      },
      {
        title: '실습 3 · 실시간 HUD 에 단계별 시간 막대 넣기',
        desc: `<p>예제 4 를 간단히 만든 process(frame) 입니다. 매 프레임 <b>prep / orb / match+H / draw</b> 네 단계의 시간을 재서 왼쪽 위에 막대로 그리고, <b>가장 느린 단계를 빨간색</b>으로 표시하세요. 동영상 입력에서 막대가 매 프레임 갱신되면 성공입니다.</p>`,
        starter: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 데모 입력: 영상 위에 상품을 움직이며 붙이기 (상품이 없는 웹캠 · 동영상으로도 시험) =====
def place(img, center, width, angle=0.0, tilt=0.0):
    """img 를 center 에 가로 width 로, angle(도) 회전 · tilt(좌우 원근) 를 주어 놓는 네 꼭짓점."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh * (1 - tilt)], [hw, -hh * (1 + tilt)], [hw, hh * (1 + tilt)], [-hw, hh * (1 - tilt)]])
    a = np.deg2rad(angle)
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def demo_overlay(frame, product, n):
    """n 번째 프레임에서 상품을 8자 모양으로 움직이며 frame 에 직접 붙이고 정답 꼭짓점을 돌려준다."""
    h, w = frame.shape[:2]
    t = n / 25.0
    center = (w * (0.5 + 0.22 * np.sin(t)), h * (0.5 + 0.15 * np.sin(2 * t)))
    quad = place(product, center, 0.32 * w, angle=15 * np.sin(0.7 * t), tilt=0.15 * np.sin(1.3 * t))
    paste(frame, product, quad)
    return quad

products = make_products()
db = build_db(products, CFG)
orb = cv.ORB_create(1000)
STATE = {'n': 0}


def process(frame):
    frame = frame.copy()
    demo_overlay(frame, products['cookie'], STATE['n'])
    STATE['n'] += 1
    times = {}
    t = time.perf_counter()
    gray = prep_gray(frame, CFG)
    # TODO 1: times['prep'] 에 ms 기록 (아래 단계도 같은 방식)
    kp, des = orb.detectAndCompute(gray, None)
    found = []
    if des is not None:
        bf = cv.BFMatcher(cv.NORM_HAMMING)
        for name, ref in db.items():
            pairs = bf.knnMatch(ref['des'], des, k=2)
            good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.8 * p[1].distance]
            if len(good) >= 10:
                H, mask = cv.findHomography(ref['pts'][[m.queryIdx for m in good]],
                                            np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
                ok, quad = quad_ok(H, ref['size'], frame.shape)
                if ok:
                    found.append((name, quad))
    for name, quad in found:
        cv.polylines(frame, [np.int32(quad)], True, (0, 255, 0), 3)
        cv.putText(frame, name, tuple(np.int32(quad[0])), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    # TODO 2: times 의 각 항목을 막대로 그리기 (가장 느린 단계는 빨간색)
    return frame
`,
        hint: `<p>단계가 끝날 때마다 <code>now = time.perf_counter(); times['orb'] = (now - t) * 1000; t = now</code> 를 반복하면 간단합니다. 막대 길이는 가장 느린 단계를 기준으로 비례해서: <code>int(160 * ms / times[worst])</code>, 가장 느린 단계는 <code>worst = max(times, key=times.get)</code>.</p>`,
        solution: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 데모 입력: 영상 위에 상품을 움직이며 붙이기 (상품이 없는 웹캠 · 동영상으로도 시험) =====
def place(img, center, width, angle=0.0, tilt=0.0):
    """img 를 center 에 가로 width 로, angle(도) 회전 · tilt(좌우 원근) 를 주어 놓는 네 꼭짓점."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh * (1 - tilt)], [hw, -hh * (1 + tilt)], [hw, hh * (1 + tilt)], [-hw, hh * (1 - tilt)]])
    a = np.deg2rad(angle)
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def demo_overlay(frame, product, n):
    """n 번째 프레임에서 상품을 8자 모양으로 움직이며 frame 에 직접 붙이고 정답 꼭짓점을 돌려준다."""
    h, w = frame.shape[:2]
    t = n / 25.0
    center = (w * (0.5 + 0.22 * np.sin(t)), h * (0.5 + 0.15 * np.sin(2 * t)))
    quad = place(product, center, 0.32 * w, angle=15 * np.sin(0.7 * t), tilt=0.15 * np.sin(1.3 * t))
    paste(frame, product, quad)
    return quad

products = make_products()
db = build_db(products, CFG)
orb = cv.ORB_create(1000)
STATE = {'n': 0}


def process(frame):
    frame = frame.copy()
    demo_overlay(frame, products['cookie'], STATE['n'])
    STATE['n'] += 1
    times = {}
    t = time.perf_counter()

    def lap(name):
        nonlocal t
        now = time.perf_counter()
        times[name] = (now - t) * 1000
        t = now

    gray = prep_gray(frame, CFG)
    lap('prep')
    kp, des = orb.detectAndCompute(gray, None)
    lap('orb')
    found = []
    if des is not None:
        bf = cv.BFMatcher(cv.NORM_HAMMING)
        for name, ref in db.items():
            pairs = bf.knnMatch(ref['des'], des, k=2)
            good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.8 * p[1].distance]
            if len(good) >= 10:
                H, mask = cv.findHomography(ref['pts'][[m.queryIdx for m in good]],
                                            np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
                ok, quad = quad_ok(H, ref['size'], frame.shape)
                if ok:
                    found.append((name, quad))
    lap('match+H')
    for name, quad in found:
        cv.polylines(frame, [np.int32(quad)], True, (0, 255, 0), 3)
        cv.putText(frame, name, tuple(np.int32(quad[0])), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    lap('draw')

    worst = max(times, key=times.get)
    cv.rectangle(frame, (0, 0), (300, 22 * len(times) + 12), (30, 30, 30), -1)
    for i, (name, ms) in enumerate(times.items()):
        y = 22 + 22 * i
        color = (0, 0, 255) if name == worst else (0, 200, 0)
        cv.putText(frame, f'{name} {ms:.1f}', (5, y), cv.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        cv.rectangle(frame, (130, y - 12), (130 + int(160 * ms / times[worst]), y + 2), color, -1)
    return frame
`,
      },
    ],
    quiz: [
      { q: '처리 시간이 전체 120 ms 인데 단계별로 orb 80 ms, match 25 ms, draw 15 ms 였습니다. 가장 먼저 시도할 최적화는?', options: ['draw 에서 선 두께를 줄인다', 'ORB 의 nfeatures 를 줄이거나, N 프레임마다만 ORB 인식을 한다', 'match 의 비율 임계값을 0.75 로 바꾼다', 'print 문을 지운다'], answer: 1, explain: '병목(전체의 2/3)인 orb 단계를 줄여야 효과가 큽니다. 15 ms 짜리 draw 를 절반으로 줄여도 전체는 6% 만 빨라집니다.' },
      { q: '가로 640 영상을 가로 320 으로 줄여 처리했더니 빨라졌지만 상품을 거의 못 찾았습니다. 가장 알맞은 설명은?', options: ['ORB 는 흑백에서만 동작하기 때문', '상품이 화면에서 너무 작아져(약 100px 미만) 31×31 패치 기반 ORB 특징점이 급격히 줄었기 때문', '축소하면 색이 바뀌기 때문', 'findHomography 는 320 이하에서 동작하지 않기 때문'], answer: 1, explain: '축소의 대가는 작은 물체의 정보 손실입니다. 물체 크기를 기준으로 작업 해상도의 하한을 정하고, 더 빨라져야 하면 N 프레임마다 인식 · ROI 같은 다른 방법을 씁니다.' },
      { q: 'N 프레임마다 인식하고 그 사이를 calcOpticalFlowPyrLK 로 추적할 때, 추적 프레임에서 사각형 꼭짓점을 옮기는 방법은?', options: ['꼭짓점 4개를 직접 LK 로 추적한다', '사각형 안 코너 점들의 이전 → 현재 위치로 호모그래피를 구해 꼭짓점을 perspectiveTransform 한다', '이전 사각형을 그대로 둔다', '매 프레임 ORB 로 다시 찾는다'], answer: 1, explain: '꼭짓점 자체는 배경과 경계라 추적이 불안정합니다. 물체 내부의 많은 코너로 변환을 추정해 꼭짓점에 적용하는 것이 안정적입니다.' },
      { q: 'process(frame) 안에 build_db(products, CFG) 를 넣었더니 FPS 가 크게 떨어졌습니다. 올바른 수정은?', options: ['build_db 를 process 밖(전역)에서 한 번만 실행한다', 'build_db 를 두 번 호출한다', 'process 를 while True 로 감싼다', 'cv.waitKey(1) 을 추가한다'], answer: 0, explain: '기준 이미지의 특징은 바뀌지 않으므로 한 번만 계산해 두고 재사용합니다. process 는 매 프레임 호출된다는 점을 항상 기억하세요.' },
    ],
  },
  // =====================================================================
  // a5-4 구현 ④ 3D 정보 결합과 인터랙션
  // =====================================================================
  {
    id: 'a5-4',
    assets: ['images/adv/box.png', 'images/adv/graf1.jpg'],
    summary: '인식된 상품의 꼭짓점과 “실제 크기(cm)”를 solvePnP 에 넣어 카메라까지의 거리와 기울기를 추정하고, 3D 좌표축 · 입체 상자를 그립니다. 초점거리 가정의 영향을 확인한 뒤, 트랙바 튜닝 패널과 마우스 클릭 정보 패널로 데모용 인터랙션을 완성합니다.',
    goals: [
      '상품의 실제 크기로 3D 꼭짓점을 만들고 solvePnP(IPPE)로 거리 · 기울기를 추정해 정답과 비교할 수 있다',
      'projectPoints · drawFrameAxes 로 인식된 상품 위에 3D 축과 입체 상자를 그릴 수 있다',
      '캘리브레이션 없이 어림한 초점거리가 거리 추정에 주는 오차를 설명하고, 저장된 calib.npz 가 있으면 사용할 수 있다',
      '트랙바로 인식 파라미터를 실시간 튜닝하고, 마우스 클릭으로 상품을 선택해 정보 패널을 보여 줄 수 있다',
    ],
    schedule: [['도입: 2D 인식에 3D 를 더하면?', 5], ['개념: 실제 크기 + 카메라 행렬 → solvePnP', 10], ['예제: 거리 · 3D 축 · 초점거리 영향', 15], ['인터랙션: 트랙바 패널 · 클릭 정보 패널', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 호모그래피 사각형 + 실제 크기 = 3D 자세</h3>
<p>지금까지 인식기는 “화면의 어디에 무엇이 있다”(2D)까지 알려 줍니다. 2주차의 <b>자세 추정(Pose Estimation)</b> 을 결합하면 “카메라에서 <b>몇 cm 떨어져</b>, <b>몇 도 기울어져</b> 있다”(3D)를 알 수 있습니다. 필요한 재료는 세 가지입니다.</p>
<ol>
  <li><b>2D 점</b>: 인식기가 찾은 네 꼭짓점 <code>quad</code> (픽셀)</li>
  <li><b>3D 점</b>: 같은 꼭짓점의 실제 좌표 — 상품 크기를 알면 만들 수 있습니다. cookie 상자 앞면이 16×11 cm 이면 중심을 원점으로 <code>(-8,-5.5,0) (8,-5.5,0) (8,5.5,0) (-8,5.5,0)</code></li>
  <li><b>카메라 행렬 K</b>: 초점거리 f 와 중심 (cx, cy). 2주차 캘리브레이션 결과가 가장 좋고, 없으면 <b>f ≈ 영상 폭 × 0.9 안팎</b>으로 어림합니다</li>
</ol>
<p><code>cv.solvePnP(3D점, 2D점, K, dist, flags=cv.SOLVEPNP_IPPE)</code> 는 3D 점들을 카메라 좌표로 옮기는 회전 <code>rvec</code> 과 이동 <code>tvec</code>(cm)을 돌려줍니다. <b>IPPE</b> 는 점들이 한 평면(z=0) 위에 있을 때를 위한 방법이라 상품 앞면에 딱 맞습니다.</p>
<p>꼭짓점 4개만 쓰면 작은 오차에도 <b>“앞으로 기운 해”와 “뒤로 기운 해”</b>가 뒤바뀌는 평면 자세의 모호성이 생기기 쉽습니다. 그래서 <code>estimate_pose()</code> 는 인식 단계의 <b>인라이어 매칭점 전부</b>를 3D-2D 대응으로 씁니다. 기준 이미지 좌표 (x, y) 픽셀은 실제 크기로 바꾸면 <code>((x/w − 0.5)·W, (y/h − 0.5)·H, 0)</code> cm 입니다.</p>
<ul>
  <li><b>거리</b> = <code>np.linalg.norm(tvec)</code> (카메라 → 상품 중심, 3D 점을 cm 로 줬으므로 cm)</li>
  <li><b>기울기</b> = 상품 면의 법선(회전 행렬의 3번째 열)과 카메라 광축 사이 각 → <code>arccos(|R[2,2]|)</code></li>
</ul>
<p>검증은 역시 <b>정답을 아는 합성 장면</b>으로 합니다. 이번에는 상품을 3D 공간에 (거리 · 회전을 정해) 놓고 <code>cv.projectPoints</code> 로 화면에 투영해 붙이므로, 진짜 거리 · 기울기를 알고 있습니다.</p>` },
      { type: 'code', title: '예제 1 · solvePnP 로 상품까지의 거리 · 기울기 추정 (정답과 비교)', code: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth

products = make_products()
db = build_db(products, CFG)
K = camera_matrix(640, 480)
print('카메라 행렬 K (f = 0.94 × 640):\n', np.round(K, 1))

errors = []
print(f'\n{"scene":>5s} {"name":9s} {"dist est":>8s} {"true":>6s} {"err%":>5s} {"tilt est":>8s} {"true":>5s}')
for seed in range(3):
    scene, truth = make_scene_3d(products, K, np.random.default_rng(seed))
    for r in recognize(scene, db, CFG):
        rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
        t = truth[r['name']]
        d_true = np.linalg.norm(t['tvec'])
        R_true, _ = cv.Rodrigues(t['rvec'])
        tilt_true = np.degrees(np.arccos(abs(R_true[2, 2])))
        err = 100 * abs(dist_cm - d_true) / d_true
        errors.append(err)
        print(f'{seed:5d} {r["name"]:9s} {dist_cm:8.1f} {d_true:6.1f} {err:5.1f} {tilt:8.1f} {tilt_true:5.1f}')
print(f'\n거리 상대 오차: 평균 {np.mean(errors):.1f}%, 최대 {np.max(errors):.1f}%  ({len(errors)}개 상품)')

vis = scene.copy()
for r in recognize(scene, db, CFG):
    _, _, dist_cm, tilt = estimate_pose(r, K)
    cv.polylines(vis, [np.int32(r['quad'])], True, (0, 255, 0), 2, cv.LINE_AA)
    cv.putText(vis, f'{r["name"]} {dist_cm:.0f}cm {tilt:.0f}deg', tuple(np.int32(r['quad'][0]) + [0, -8]),
               cv.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 2, cv.LINE_AA)
cv.imshow('distance and tilt', vis)
`, desc: '<p>호모그래피 꼭짓점이 정확하면 거리 오차는 대개 1~3% 수준입니다. 기울기가 크거나(25° 이상) 상품이 작게 보일수록 꼭짓점 1~2px 오차가 거리 오차로 커집니다. 이 결과는 <b>카메라 행렬이 정확하다</b>는 가정 아래의 숫자라는 점을 기억하세요(예제 3).</p>' },
      { type: 'code', title: '예제 2 · 인식된 상품 위에 3D 좌표축과 입체 상자 그리기', code: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth

DEPTH_CM = {'cookie': 3.0, 'graffiti': 0.5, 'soccer': 0.3, 'tea': 2.5}     # 상품 두께(앞면에서 튀어나오게 그림)


def draw_box(img, name, rvec, tvec, K, color):
    """상품 앞면(z=0)과 카메라 쪽으로 depth 만큼 나온 면(z=-depth)을 이어 입체 상자를 그린다."""
    front = object_corners(name)
    top = front.copy()
    top[:, 2] = -DEPTH_CM[name]
    pts, _ = cv.projectPoints(np.vstack([front, top]), rvec, tvec, K, None)
    p = np.int32(pts.reshape(-1, 2))
    overlay = img.copy()
    cv.fillConvexPoly(overlay, p[4:], color, cv.LINE_AA)
    cv.addWeighted(overlay, 0.3, img, 0.7, 0, img)                   # 윗면 반투명
    for i in range(4):
        cv.line(img, tuple(map(int, p[i])), tuple(map(int, p[4 + i])), color, 2, cv.LINE_AA)
        cv.line(img, tuple(map(int, p[4 + i])), tuple(map(int, p[4 + (i + 1) % 4])), color, 2, cv.LINE_AA)
    cv.polylines(img, [p[:4]], True, color, 2, cv.LINE_AA)


products = make_products()
db = build_db(products, CFG)
K = camera_matrix(640, 480)
scene, truth = make_scene_3d(products, K, np.random.default_rng(1))

vis = scene.copy()
COLORS = {'cookie': (0, 200, 255), 'graffiti': (255, 0, 255), 'soccer': (0, 255, 0), 'tea': (255, 180, 0)}
for r in recognize(scene, db, CFG):
    rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
    draw_box(vis, r['name'], rvec, tvec, K, COLORS[r['name']])
    cv.drawFrameAxes(vis, K, None, rvec, tvec, SIZES_CM[r['name']][0] / 2, 2)   # 빨강 x · 초록 y · 파랑 z
    x, y = np.int32(r['quad'].min(axis=0))
    cv.putText(vis, f'{r["name"]} {dist_cm:.0f}cm', (x, max(15, y - 8)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv.LINE_AA)
    print(f'{r["name"]:9s} tvec(cm)={np.round(tvec.ravel(), 1)}  rvec(deg)={np.round(np.degrees(rvec.ravel()), 1)}')
cv.imshow('3D axes + boxes', vis)
`, desc: '<p><code>drawFrameAxes</code> 의 빨강(x) · 초록(y) 축은 상품 면을 따라 눕고, 파랑(z) 축은 상품 <b>뒤쪽</b>을 가리킵니다(3D 점을 x 오른쪽 · y 아래로 정했기 때문). 그래서 입체 상자는 z = −두께 쪽으로 그려야 카메라 쪽으로 튀어나와 보입니다. 축이 엉뚱하게 뒤집혀 보이면 3D 꼭짓점 순서와 2D 꼭짓점 순서(왼위 → 오위 → 오아래 → 왼아래)가 같은지 먼저 확인하세요.</p>' },
      { type: 'text', html: `
<h3>2. 카메라 행렬을 모르면? — 초점거리 가정의 영향</h3>
<p>핀홀 모델에서 물체의 화면 크기는 <b>f × 실제 크기 / 거리</b>입니다. 그러므로 같은 화면 크기에서 추정 거리는 <b>f 에 정비례</b>합니다. f 를 10% 크게 잡으면 거리도 약 10% 멀게 나옵니다.</p>
<ul>
  <li><b>기울기 · 좌표축 방향</b>은 f 가 조금 틀려도 크게 변하지 않아 AR 표시에는 어림값으로도 충분한 경우가 많습니다</li>
  <li><b>거리(cm)를 숫자로 보고</b>하려면 2주차 방법으로 캘리브레이션하세요: <code>calibrateCamera</code> → <code>np.savez('calib.npz', mtx=mtx, dist=dist)</code></li>
  <li>캘리브레이션 해상도와 실행 해상도가 다르면 K 의 f · cx · cy 를 <b>같은 배율로</b> 바꿔 써야 합니다 (예: 1280×720 에서 구한 K 를 640×360 에 쓰면 모두 × 0.5)</li>
  <li>실측 검증: 줄자로 30 · 50 · 80 cm 에 상품을 놓고 추정값과 비교한 표를 발표에 넣으면 설득력이 큽니다</li>
</ul>` },
      { type: 'code', title: '예제 3 · 초점거리를 잘못 가정하면 거리가 얼마나 틀릴까?', code: String.raw`
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth


def load_camera(w, h):
    """calib.npz(2주차 캘리브레이션 결과)가 있으면 쓰고, 없으면 어림값. (K, dist, 출처) 를 돌려준다."""
    try:
        data = np.load('calib.npz')
        return data['mtx'], data['dist'], 'calib.npz'
    except Exception:                                     # 파일 없음 · 형식 다름
        return camera_matrix(w, h), None, 'approx f=0.94w'


products = make_products()
db = build_db(products, CFG)
K_true = camera_matrix(640, 480)                          # 장면을 만든 “진짜” 카메라
scene, truth = make_scene_3d(products, K_true, np.random.default_rng(0))
found = recognize(scene, db, CFG)

K_used, dist, source = load_camera(640, 480)
print('사용한 카메라 행렬 출처:', source)

scales = [0.7, 0.85, 1.0, 1.15, 1.3]
print(f'\n{"f scale":>7s} ' + ' '.join(f'{r["name"]:>14s}' for r in found))
curves = {r['name']: [] for r in found}
for s in scales:
    K = camera_matrix(640, 480, K_true[0, 0] * s)
    cells = []
    for r in found:
        _, _, d, tilt = estimate_pose(r, K)
        d_true = np.linalg.norm(truth[r['name']]['tvec'])
        curves[r['name']].append(d / d_true)
        cells.append(f'{d:5.1f}cm {tilt:4.1f}d')
    print(f'{s:7.2f} ' + ' '.join(f'{c:>14s}' for c in cells))
print('정답 거리:', {r['name']: round(float(np.linalg.norm(truth[r['name']]['tvec'])), 1) for r in found})

for name, ratio in curves.items():
    plt.plot(scales, ratio, 'o-', label=name)
plt.plot(scales, scales, 'k--', label='y = x')
plt.xlabel('assumed f / true f')
plt.ylabel('estimated distance / true distance')
plt.title('Distance error grows linearly with focal length error')
plt.legend()
plt.grid(alpha=0.3)
plt.show()
`, desc: '<p>모든 상품의 점이 <b>y = x 점선 위</b>에 놓입니다 — 거리 비율이 초점거리 비율과 같다는 뜻입니다. 반면 표의 기울기(d) 열은 f 를 30% 틀려도 몇 도밖에 변하지 않습니다. 결론: <b>AR 좌표축은 어림 K 로도 괜찮지만, cm 단위 거리를 주장하려면 캘리브레이션이 필수</b>입니다. 2주차에 만든 <code>calib.npz</code> 를 이 페이지에서 저장했다면 첫 줄 출처가 바뀝니다.</p>' },
      { type: 'text', html: `
<h3>3. 데모용 인터랙션 ① — 트랙바 튜닝 패널</h3>
<p>발표장 조명은 연습할 때와 다릅니다. 코드를 고치지 않고 <b>현장에서 파라미터를 조정</b>할 수 있어야 합니다. a5-2 에서 중요하다고 확인한 파라미터를 트랙바로 꺼냅니다.</p>
<ul>
  <li><code>ratio x100</code>(50~95) · <code>min inliers</code>(4~40) · <code>features x100</code>(3~20) · <code>focal %</code>(50~150, 영상 폭 대비)</li>
  <li>트랙바는 정수만 → 코드에서 <code>/ 100</code> 으로 바꿔 씁니다. 0 이 되면 안 되는 값은 <code>max(최솟값, ...)</code> 로 막기</li>
  <li>값이 바뀔 때만 비싼 객체를 다시 만들기: <code>features</code> 가 바뀌면 ORB 를 새로 만들고, 아니면 재사용</li>
  <li>튜닝 중에는 <b>매 프레임 인식</b>해 변화를 바로 보고, 값이 정해지면 a5-3 의 추적기와 합칩니다</li>
  <li>화면 아래에 현재 설정을 글자로 표시 → 발표 후 “그때 설정이 뭐였지?”를 막아 줍니다</li>
</ul>` },
      { type: 'code', title: '예제 4 · process(frame) + 트랙바 튜닝 패널 + 거리 표시', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

# ===== 데모 입력: 영상 위에 상품을 움직이며 붙이기 (상품이 없는 웹캠 · 동영상으로도 시험) =====
def place(img, center, width, angle=0.0, tilt=0.0):
    """img 를 center 에 가로 width 로, angle(도) 회전 · tilt(좌우 원근) 를 주어 놓는 네 꼭짓점."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh * (1 - tilt)], [hw, -hh * (1 + tilt)], [hw, hh * (1 + tilt)], [-hw, hh * (1 - tilt)]])
    a = np.deg2rad(angle)
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def demo_overlay(frame, product, n):
    """n 번째 프레임에서 상품을 8자 모양으로 움직이며 frame 에 직접 붙이고 정답 꼭짓점을 돌려준다."""
    h, w = frame.shape[:2]
    t = n / 25.0
    center = (w * (0.5 + 0.22 * np.sin(t)), h * (0.5 + 0.15 * np.sin(2 * t)))
    quad = place(product, center, 0.32 * w, angle=15 * np.sin(0.7 * t), tilt=0.15 * np.sin(1.3 * t))
    paste(frame, product, quad)
    return quad

products = make_products()
db = build_db(products, CFG)
STATE = {'n': 0, 'nf': None, 'orb': None}


def nothing(x):
    pass


cv.namedWindow('result')
cv.createTrackbar('ratio x100', 'result', 80, 95, nothing)
cv.createTrackbar('min inliers', 'result', 10, 40, nothing)
cv.createTrackbar('features x100', 'result', 10, 20, nothing)
cv.createTrackbar('focal %', 'result', 94, 150, nothing)
cv.createTrackbar('demo', 'result', 1, 1, nothing)


def read_panel():
    """트랙바 값을 읽어 설정 dict 로 (범위 보정 포함)."""
    return dict(CFG,
                ratio=max(50, cv.getTrackbarPos('ratio x100', 'result')) / 100,
                min_inliers=max(4, cv.getTrackbarPos('min inliers', 'result')),
                scene_features=max(3, cv.getTrackbarPos('features x100', 'result')) * 100,
                focal=max(50, cv.getTrackbarPos('focal %', 'result')) / 100)


def process(frame):
    t0 = time.perf_counter()
    cfg = read_panel()
    frame = frame.copy()
    if cv.getTrackbarPos('demo', 'result') == 1:
        demo_overlay(frame, products['cookie'], STATE['n'])
    STATE['n'] += 1
    if STATE['nf'] != cfg['scene_features']:                  # 값이 바뀔 때만 ORB 새로 만들기
        STATE['nf'], STATE['orb'] = cfg['scene_features'], cv.ORB_create(cfg['scene_features'])

    h, w = frame.shape[:2]
    K = camera_matrix(w, h, cfg['focal'] * w)
    for r in recognize(frame, db, cfg, STATE['orb']):
        rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
        cv.polylines(frame, [np.int32(r['quad'])], True, (0, 255, 0), 3, cv.LINE_AA)
        cv.drawFrameAxes(frame, K, None, rvec, tvec, SIZES_CM[r['name']][0] / 2, 3)
        x, y = np.int32(r['quad'].min(axis=0))
        cv.putText(frame, f'{r["name"]} {dist_cm:.0f}cm tilt {tilt:.0f}  in={r["inliers"]}', (x, max(20, y - 10)),
                   cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv.LINE_AA)

    ms = (time.perf_counter() - t0) * 1000
    cv.rectangle(frame, (0, h - 30), (w, h), (30, 30, 30), -1)
    cv.putText(frame, f'ratio={cfg["ratio"]:.2f} min_in={cfg["min_inliers"]} feat={cfg["scene_features"]} '
                      f'f={cfg["focal"]:.2f}w  {ms:.0f}ms', (8, h - 9), cv.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv.LINE_AA)
    return frame


print('📷 웹캠 또는 🎞️ 동영상(cup.mp4)을 입력으로 고르고 트랙바를 움직여 보세요.')
print('ratio 를 60 으로 내리거나 min inliers 를 40 으로 올리면 언제 인식이 끊기는지 관찰합니다.')
`, desc: '<p><b>min inliers</b> 를 40 으로 올리면 확실한 순간에만 상자가 뜨고, <b>ratio</b> 를 60 으로 내리면 매칭이 부족해 자주 끊깁니다. <b>focal %</b> 를 바꾸면 좌표축 모양은 거의 그대로인데 거리 숫자만 비례해서 변합니다(예제 3). 데모 상품(cookie)은 화면 폭의 32% 크기로 붙이므로, 실제 카메라에서 16cm 상자를 그 크기로 볼 때의 거리가 표시됩니다.</p>' },
      { type: 'text', html: `
<h3>4. 데모용 인터랙션 ② — 클릭해서 상품 정보 보기</h3>
<p>청중이 “저건 뭐예요?”라고 물으면 상품을 <b>클릭해서 정보 패널</b>을 띄우면 좋습니다. 입문 과정의 마우스 콜백과 같지만, 이번에는 선택 판정이 사각형이 아니라 <b>기울어진 사각형(quad)</b> 입니다.</p>
<ul>
  <li>클릭 좌표가 사각형 안인지: <code>cv.pointPolygonTest(quad, (x, y), False) &gt;= 0</code></li>
  <li>선택 상태는 전역 dict 에 두고, 콜백에서 <b>표시 중인 이미지 배열을 제자리에서 다시 그리기</b>: <code>vis[:] = render(selected)</code> → 웹 환경이 창을 자동 갱신</li>
  <li>정보 패널: 반투명 배경(<code>addWeighted</code>) + 이름 · 가격 · 인라이어 · 거리 · 기울기 + <b>정면으로 편 상품 조각</b>(<code>warpPerspective</code>)</li>
  <li>오른쪽 클릭으로 선택 해제, 빈 곳 클릭도 해제</li>
</ul>` },
      { type: 'code', title: '예제 5 · 마우스 클릭으로 상품 선택 → 정보 패널', code: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth

PRICES = {'cookie': 2500, 'graffiti': 12000, 'soccer': 1500, 'tea': 1800}

products = make_products()
db = build_db(products, CFG)
K = camera_matrix(640, 480)
scene, truth = make_scene_3d(products, K, np.random.default_rng(2))
items = []
for r in recognize(scene, db, CFG):
    rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
    items.append(dict(r, rvec=rvec, tvec=tvec, dist=dist_cm, tilt=tilt))
STATE = {'selected': None}


def rectified_thumb(item, size=110):
    """선택한 상품을 정면으로 편 썸네일 (가로세로 비율 유지)."""
    W, H = SIZES_CM[item['name']]
    tw, th = (size, int(size * H / W)) if W >= H else (int(size * W / H), size)
    M = cv.getPerspectiveTransform(np.float32(item['quad']), np.float32([[0, 0], [tw, 0], [tw, th], [0, th]]))
    return cv.warpPerspective(scene, M, (tw, th))


def render(selected):
    """선택 상태에 따라 장면 + 사각형 + 정보 패널을 새로 그린다."""
    out = scene.copy()
    for i, it in enumerate(items):
        color = (0, 255, 255) if i == selected else (0, 200, 0)
        cv.polylines(out, [np.int32(it['quad'])], True, color, 4 if i == selected else 2, cv.LINE_AA)
    if selected is None:
        cv.putText(out, 'Click a product', (10, 470), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
        return out
    it = items[selected]
    cv.drawFrameAxes(out, K, None, it['rvec'], it['tvec'], SIZES_CM[it['name']][0] / 2, 3)
    x0, y0, pw, ph = 380, 10, 250, 190
    panel = out.copy()
    cv.rectangle(panel, (x0, y0), (x0 + pw, y0 + ph), (20, 20, 20), -1)
    cv.addWeighted(panel, 0.75, out, 0.25, 0, out)                      # 반투명 패널
    lines = [it['name'].upper(), f'price  {PRICES[it["name"]]:,} won', f'size   {SIZES_CM[it["name"]][0]:.0f}x{SIZES_CM[it["name"]][1]:.0f} cm',
             f'dist   {it["dist"]:.1f} cm', f'tilt   {it["tilt"]:.0f} deg', f'inliers {it["inliers"]}']
    for k, text in enumerate(lines):
        cv.putText(out, text, (x0 + 10, y0 + 28 + 26 * k), cv.FONT_HERSHEY_SIMPLEX, 0.55 if k else 0.75,
                   (0, 255, 255) if k == 0 else (255, 255, 255), 2 if k == 0 else 1, cv.LINE_AA)
    thumb = rectified_thumb(it)
    th, tw = thumb.shape[:2]
    out[y0 + ph - th - 8:y0 + ph - 8, x0 + pw - tw - 8:x0 + pw - 8] = thumb
    return out


def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:
        hit = [i for i, it in enumerate(items) if cv.pointPolygonTest(np.float32(it['quad']), (float(x), float(y)), False) >= 0]
        STATE['selected'] = hit[0] if hit else None
    elif event == cv.EVENT_RBUTTONDOWN:
        STATE['selected'] = None
    else:
        return
    vis[:] = render(STATE['selected'])                                 # 제자리 수정 → 창 자동 갱신


vis = render(0 if items else None)                                    # 처음에는 첫 상품을 선택해 보여 줌
cv.imshow('smart shelf', vis)
cv.setMouseCallback('smart shelf', on_mouse)
print('인식된 상품:', [it['name'] for it in items], '— 상품을 클릭하세요 (오른쪽 클릭: 해제)')
`, desc: '<p>상품을 클릭하면 노란 테두리 · 3D 축 · 반투명 정보 패널 · 정면 썸네일이 나타납니다. 핵심은 <code>vis[:] = render(...)</code> — 새 배열을 만들어 <code>cv.imshow</code> 를 다시 부르지 않고, 이미 표시 중인 배열의 <b>내용만 바꾸는</b> 것입니다. 발표 데모에서는 가격 대신 팀 프로젝트의 정보(인식 신뢰도, 측정값 등)를 넣으세요.</p>' },
      { type: 'tip', html: `<p><b>팀 프로젝트 적용</b>: 3D 정보가 필요 없는 주제라도 “실제 단위(cm · 도 · 초)로 바꾸기”는 결과의 가치를 크게 높입니다. 기준 물체의 실제 크기나 캘리브레이션을 이용할 수 있는지 검토하고, 튜닝이 필요한 파라미터 3~4개는 트랙바로, 결과 상세는 클릭 패널로 꺼내 두세요.</p>` },
      { type: 'checklist', title: '3D · 인터랙션 점검 목록', items: [
        '3D 꼭짓점과 2D 꼭짓점의 순서(왼위 → 오위 → 오아래 → 왼아래)가 같다',
        '3D 점의 단위(cm 또는 mm)를 정하고 거리 표시에 단위를 적었다',
        '카메라 행렬의 출처(캘리브레이션 / 어림값)와 그에 따른 오차를 설명할 수 있다',
        '정답을 아는 데이터(합성 또는 줄자 실측)로 거리 오차를 확인했다',
        '현장 튜닝용 트랙바가 있고, 현재 설정값이 화면에 표시된다',
        '트랙바 값이 0 이 되어도 오류가 나지 않는다 (max 로 하한 보정)',
        '마우스 콜백에서 표시 중인 배열을 제자리 수정해 화면이 갱신된다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 너무 기울어진 상품 경고하기',
        desc: `<p>상품이 카메라에 대해 크게 기울어지면 인식과 거리 추정이 모두 불안정해집니다. 기울기가 <b>30° 를 넘는</b> 상품은 주황색 테두리와 <code>TILTED</code> 글자로 표시하고, 콘솔에 “[경고] 기울기 큼” 을 출력하세요. 나머지는 초록색으로 거리만 표시합니다.
장면 seed 를 0~2 로 바꿔 가며 경고가 기울기 값과 맞게 나오는지 확인하세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth

MAX_TILT = 30
SEED = 1

products = make_products()
db = build_db(products, CFG)
K = camera_matrix(640, 480)
scene, truth = make_scene_3d(products, K, np.random.default_rng(SEED))
vis = scene.copy()
for r in recognize(scene, db, CFG):
    rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
    print(f'{r["name"]:9s} dist={dist_cm:5.1f}cm tilt={tilt:4.1f}deg')
    color = (0, 255, 0)
    label = f'{r["name"]} {dist_cm:.0f}cm'
    # TODO: tilt > MAX_TILT 이면 color 를 주황(0, 140, 255)으로, label 끝에 ' TILTED', 경고 출력
    cv.polylines(vis, [np.int32(r['quad'])], True, color, 3, cv.LINE_AA)
    cv.putText(vis, label, tuple(np.int32(r['quad'][0]) + [0, -8]), cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv.LINE_AA)
cv.imshow('tilt warning', vis)
`,
        hint: `<p><code>if tilt &gt; MAX_TILT:</code> 블록 안에서 <code>color = (0, 140, 255)</code>, <code>label += ' TILTED'</code>, <code>print('[경고] 기울기 큼:', r['name'])</code>. 기울기는 <code>estimate_pose</code> 가 이미 도(degree) 단위로 계산해 줍니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth

MAX_TILT = 30
SEED = 1

products = make_products()
db = build_db(products, CFG)
K = camera_matrix(640, 480)
scene, truth = make_scene_3d(products, K, np.random.default_rng(SEED))
vis = scene.copy()
for r in recognize(scene, db, CFG):
    rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
    print(f'{r["name"]:9s} dist={dist_cm:5.1f}cm tilt={tilt:4.1f}deg')
    color = (0, 255, 0)
    label = f'{r["name"]} {dist_cm:.0f}cm'
    if tilt > MAX_TILT:
        color = (0, 140, 255)
        label += ' TILTED'
        print(f'   [경고] 기울기 큼: {r["name"]} ({tilt:.0f}°) — 거리 추정을 믿기 어려움')
    cv.polylines(vis, [np.int32(r['quad'])], True, color, 3, cv.LINE_AA)
    cv.putText(vis, label, tuple(np.int32(r['quad'][0]) + [0, -8]), cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv.LINE_AA)
cv.imshow('tilt warning', vis)
`,
      },
      {
        title: '실습 2 · 캘리브레이션 파일을 다른 해상도에 맞춰 쓰기',
        desc: `<p>팀원이 1280×720 웹캠으로 캘리브레이션한 <code>calib.npz</code> 를 공유했는데, 데모는 640×360 으로 돌립니다. <code>load_camera(w, h)</code> 를 완성해 파일에 저장된 해상도(<code>size</code>)와 실행 해상도가 다르면 <b>fx, fy, cx, cy 를 같은 배율로</b> 바꾸세요. 파일이 없으면 어림값을 씁니다.
출력된 K 의 fx 가 450.0, cx 가 320.0 이면 성공입니다.</p>`,
        starter: String.raw`
import numpy as np

# 팀원이 1280x720 에서 구한 캘리브레이션 결과라고 가정하고 저장
mtx = np.float64([[900.0, 0, 640.0], [0, 900.0, 360.0], [0, 0, 1]])
np.savez('calib.npz', mtx=mtx, dist=np.zeros(5), size=np.array([1280, 720]))


def load_camera(w, h):
    """(K, dist, 출처). calib.npz 의 size 와 (w, h) 가 다르면 K 를 배율 조정한다."""
    try:
        data = np.load('calib.npz')
    except OSError:
        f = 0.94 * w
        return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]]), None, 'approx'
    K = data['mtx'].copy()
    # TODO: sx = w / size[0], sy = h / size[1] 로 K[0, 0], K[0, 2] 는 sx 배, K[1, 1], K[1, 2] 는 sy 배
    return K, data['dist'], 'calib.npz'


K, dist, src = load_camera(640, 360)
print('출처:', src)
print(np.round(K, 1))
`,
        hint: `<p><code>sx, sy = w / data['size'][0], h / data['size'][1]</code> 후 <code>K[0, [0, 2]] *= sx</code>, <code>K[1, [1, 2]] *= sy</code>. 왜곡 계수 dist 는 정규화된 좌표에서 정의되므로 해상도가 바뀌어도 그대로 씁니다(가로세로 비율이 같을 때).</p>`,
        solution: String.raw`
import numpy as np

mtx = np.float64([[900.0, 0, 640.0], [0, 900.0, 360.0], [0, 0, 1]])
np.savez('calib.npz', mtx=mtx, dist=np.zeros(5), size=np.array([1280, 720]))


def load_camera(w, h):
    """(K, dist, 출처). calib.npz 의 size 와 (w, h) 가 다르면 K 를 배율 조정한다."""
    try:
        data = np.load('calib.npz')
    except OSError:
        f = 0.94 * w
        return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]]), None, 'approx'
    K = data['mtx'].copy()
    if 'size' in data.files:
        sx, sy = w / data['size'][0], h / data['size'][1]
        K[0, [0, 2]] *= sx
        K[1, [1, 2]] *= sy
        if abs(sx - sy) > 1e-3:
            print('[경고] 가로세로 비율이 달라 왜곡 보정이 맞지 않을 수 있음')
    return K, data['dist'], 'calib.npz'


K, dist, src = load_camera(640, 360)
print('출처:', src)
print(np.round(K, 1))
`,
      },
      {
        title: '실습 3 · 선택한 상품만 강조하고 거리순 목록 표시하기',
        desc: `<p>예제 5 를 간단히 만든 코드입니다. ① 화면 왼쪽 위에 인식된 상품을 <b>가까운 순서</b>로 “1. tea 24cm” 처럼 나열하고, ② 클릭한 상품은 노란 두꺼운 테두리 + 3D 축, 나머지는 <b>회색 얇은 테두리</b>로 그리세요. 목록의 선택 항목도 노란색으로 표시하면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth

products = make_products()
db = build_db(products, CFG)
K = camera_matrix(640, 480)
scene, truth = make_scene_3d(products, K, np.random.default_rng(2))
items = []
for r in recognize(scene, db, CFG):
    rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
    items.append(dict(r, rvec=rvec, tvec=tvec, dist=dist_cm))
# TODO 1: items 를 거리(dist) 순으로 정렬
STATE = {'selected': None}


def render(selected):
    out = scene.copy()
    for i, it in enumerate(items):
        # TODO 2: 선택된 것은 노랑(0,255,255) 두께 4 + drawFrameAxes, 나머지는 회색(150,150,150) 두께 1
        cv.polylines(out, [np.int32(it['quad'])], True, (0, 255, 0), 2, cv.LINE_AA)
    # TODO 3: 왼쪽 위에 '1. tea 24cm' 형식 목록 (선택 항목은 노랑)
    return out


def on_mouse(event, x, y, flags, param):
    if event != cv.EVENT_LBUTTONDOWN:
        return
    hit = [i for i, it in enumerate(items) if cv.pointPolygonTest(np.float32(it['quad']), (float(x), float(y)), False) >= 0]
    STATE['selected'] = hit[0] if hit else None
    vis[:] = render(STATE['selected'])


vis = render(None)
cv.imshow('nearest list', vis)
cv.setMouseCallback('nearest list', on_mouse)
`,
        hint: `<p>정렬: <code>items.sort(key=lambda it: it['dist'])</code>. 목록은 <code>for k, it in enumerate(items): cv.putText(out, f'{k+1}. {it["name"]} {it["dist"]:.0f}cm', (10, 25 + 25*k), ...)</code>. 정렬을 콜백보다 먼저 해야 클릭 인덱스와 목록 번호가 일치합니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑤ 3D: 상품 실제 크기 + 카메라 행렬 → 자세 · 거리 (a5-4) =====
SIZES_CM = {'cookie': (16.0, 11.0), 'graffiti': (20.0, 16.0), 'soccer': (8.0, 10.15), 'tea': (7.0, 8.27)}   # (가로, 세로) cm


def camera_matrix(w, h, f=None):
    """캘리브레이션을 안 했을 때의 근사 카메라 행렬: 초점거리 ≈ 영상 폭 × 0.94 (화각 약 56°)."""
    f = f or 0.94 * w
    return np.float64([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]])


def object_corners(name):
    """상품 네 꼭짓점의 3D 좌표(cm). 상품 중심이 원점, x 오른쪽 · y 아래 · z 는 상품 뒤쪽."""
    W, H = SIZES_CM[name]
    return np.float64([[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]])


def estimate_pose(r, K, dist=None):
    """인식 결과 r → (rvec, tvec, 거리 cm, 기울기 도).
    인라이어 매칭점이 6개 이상이면 모두 3D(cm)-2D 대응으로 사용 (꼭짓점 4개만 쓰는 것보다 안정적)."""
    W, H = SIZES_CM[r['name']]
    if 'src' in r and len(r['src']) >= 6:
        w, h = r['size']
        obj = np.c_[(r['src'][:, 0] / w - 0.5) * W, (r['src'][:, 1] / h - 0.5) * H, np.zeros(len(r['src']))]
        img = r['dst']
    else:
        obj, img = object_corners(r['name']), r['quad']
    ok, rvec, tvec = cv.solvePnP(np.float64(obj), np.float64(img).reshape(-1, 1, 2), K, dist, flags=cv.SOLVEPNP_IPPE)
    R, _ = cv.Rodrigues(rvec)
    tilt = np.degrees(np.arccos(min(1.0, abs(R[2, 2]))))           # 상품 면의 법선과 카메라 광축 사이 각
    return rvec, tvec, float(np.linalg.norm(tvec)), float(tilt)

def make_scene_3d(products, K, rng, noise=10):
    """정답 자세(rvec, tvec)를 알고 있는 합성 장면: 상품을 3D 로 놓고 projectPoints 로 투영해 붙인다."""
    scene = make_shelf()
    truth = {}
    for (name, img), slot in zip(products.items(), rng.permutation(len(SLOTS))):
        W, H = SIZES_CM[name]
        u, v = SLOTS[slot]
        Z = K[0, 0] * W / rng.uniform(150, 190)                         # 화면에서 150~190px 로 보일 거리
        tvec = np.float64([(u - K[0, 2]) * Z / K[0, 0], (v - K[1, 2]) * Z / K[1, 1], Z])
        rvec = np.radians([rng.uniform(-25, 25), rng.uniform(-25, 25), rng.uniform(-12, 12)])
        quad, _ = cv.projectPoints(object_corners(name), rvec, tvec, K, None)
        quad = quad.reshape(4, 2).astype(np.float32)
        paste(scene, img, quad, rng)
        truth[name] = {'quad': quad, 'rvec': rvec, 'tvec': tvec}
    return add_noise(scene, rng, noise), truth

products = make_products()
db = build_db(products, CFG)
K = camera_matrix(640, 480)
scene, truth = make_scene_3d(products, K, np.random.default_rng(2))
items = []
for r in recognize(scene, db, CFG):
    rvec, tvec, dist_cm, tilt = estimate_pose(r, K)
    items.append(dict(r, rvec=rvec, tvec=tvec, dist=dist_cm))
items.sort(key=lambda it: it['dist'])
STATE = {'selected': None}


def render(selected):
    out = scene.copy()
    for i, it in enumerate(items):
        if i == selected:
            cv.polylines(out, [np.int32(it['quad'])], True, (0, 255, 255), 4, cv.LINE_AA)
            cv.drawFrameAxes(out, K, None, it['rvec'], it['tvec'], SIZES_CM[it['name']][0] / 2, 3)
        else:
            cv.polylines(out, [np.int32(it['quad'])], True, (150, 150, 150), 1, cv.LINE_AA)
    cv.rectangle(out, (0, 0), (200, 20 + 25 * len(items)), (30, 30, 30), -1)
    for k, it in enumerate(items):
        color = (0, 255, 255) if k == selected else (255, 255, 255)
        cv.putText(out, f'{k + 1}. {it["name"]} {it["dist"]:.0f}cm', (10, 25 + 25 * k), cv.FONT_HERSHEY_SIMPLEX, 0.6, color, 1, cv.LINE_AA)
    return out


def on_mouse(event, x, y, flags, param):
    if event != cv.EVENT_LBUTTONDOWN:
        return
    hit = [i for i, it in enumerate(items) if cv.pointPolygonTest(np.float32(it['quad']), (float(x), float(y)), False) >= 0]
    STATE['selected'] = hit[0] if hit else None
    vis[:] = render(STATE['selected'])


vis = render(None)
cv.imshow('nearest list', vis)
cv.setMouseCallback('nearest list', on_mouse)
`,
      },
    ],
    quiz: [
      { q: '인식된 상품의 거리를 solvePnP 로 추정하려고 합니다. 반드시 필요한 것이 아닌 것은?', options: ['상품 꼭짓점의 이미지 좌표', '상품의 실제 크기로 만든 3D 꼭짓점', '카메라 행렬(초점거리 · 중심)', '상품의 색 히스토그램'], answer: 3, explain: 'solvePnP 는 2D-3D 대응점과 카메라 행렬(+왜곡 계수)로 자세를 구합니다. 색 히스토그램은 분류 검증에 쓰는 특징입니다.' },
      { q: '캘리브레이션 없이 초점거리를 실제보다 20% 크게 가정했습니다. 추정 거리는 어떻게 될까요?', options: ['변하지 않는다', '약 20% 멀게 나온다', '약 20% 가깝게 나온다', '기울기만 20% 커진다'], answer: 1, explain: '화면 크기 = f × 실제 크기 / 거리 이므로, 같은 화면 크기에서 거리는 f 에 비례합니다. 기울기는 상대적으로 영향을 덜 받습니다.' },
      { q: '상품 앞면처럼 모든 3D 점이 한 평면(z=0) 위에 있을 때 solvePnP 에 알맞은 flags 는?', options: ['cv.SOLVEPNP_IPPE', 'cv.RANSAC', 'cv.CALIB_CB_ADAPTIVE_THRESH', 'cv.NORM_HAMMING'], answer: 0, explain: 'IPPE(Infinitesimal Plane-based Pose Estimation)는 평면 물체의 4점 이상 대응에 맞춘 방법입니다. 마커 전용은 SOLVEPNP_IPPE_SQUARE 입니다.' },
      { q: '마우스 콜백에서 선택 결과를 화면에 반영하는 올바른 방법은?', options: ['콜백 안에서 while True 로 imshow 를 반복한다', '표시 중인 배열을 vis[:] = render(...) 로 제자리 수정한다', 'vis = render(...) 로 새 변수에 대입만 한다', 'cv.waitKey(0) 을 호출한다'], answer: 1, explain: 'vis = ... 는 이름만 새 배열을 가리킬 뿐 창에 표시된 배열은 그대로입니다. vis[:] = ... 로 내용을 바꿔야 자동 갱신 때 반영됩니다.' },
    ],
  },
  // =====================================================================
  // a5-5 테스트 · 디버깅 · 코드 리뷰
  // =====================================================================
  {
    id: 'a5-5',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg'],
    summary: '심화 프로젝트에서 자주 터지는 실패를 일부러 안전하게 재현합니다. 점 부족 · None 기술자 · NORM 불일치 · FLANN dtype · 퇴화 호모그래피 · cv.ml 형식 오류 · 뷰가 부족한 캘리브레이션 · 데이터 누수 · Haar 오검출을 try/except 와 수치로 확인하고 고친 뒤, assert 기반 테스트와 코드 리뷰 점검표로 마무리합니다.',
    goals: [
      '매칭 · 호모그래피 단계의 대표 오류(점 부족, None, NORM 불일치, FLANN dtype)를 재현하고 방어 코드를 쓸 수 있다',
      '퇴화 호모그래피(뒤집힘 · 꼬임 · 발산)를 행렬식 · 볼록성 · 넓이 검사로 걸러낼 수 있다',
      'cv.ml 의 입력 형식 오류, 뷰가 부족한 캘리브레이션, 데이터 누수처럼 “조용히 틀리는” 문제를 수치로 진단할 수 있다',
      'test_ 함수와 assert 로 핵심 함수의 테스트를 만들고, 점검표로 팀원 코드를 리뷰할 수 있다',
    ],
    schedule: [['도입: 오류가 나는 버그 vs 조용히 틀리는 버그', 5], ['실패 카탈로그 재현 ① 매칭 · 호모그래피', 12], ['실패 카탈로그 재현 ② 머신러닝 · 3D · 검출', 13], ['테스트 작성 · 코드 리뷰', 15], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 두 종류의 버그</h3>
<p>입문 과정의 버그는 대부분 <b>오류 메시지가 나는 버그</b>(None 이미지, 채널 수, 좌표 dtype)였습니다. 심화 프로젝트에는 여기에 <b>조용히 틀리는 버그</b>가 더해집니다.</p>
<ul>
  <li><b>오류가 나는 버그</b>: 점이 4개 미만인데 findHomography, 기술자가 None 인데 knnMatch, float64 로 cv.ml 학습 → 메시지를 읽으면 원인이 보임</li>
  <li><b>조용히 틀리는 버그</b>: ORB 에 NORM_L2, 뒤집힌 호모그래피, 뷰 1장으로 캘리브레이션, 학습/테스트 누수 → <b>오류 없이 그럴듯한 숫자</b>가 나와서 더 위험</li>
</ul>
<p>조용한 버그는 <b>수치로 확인하는 습관</b>으로만 잡힙니다: 인라이어 수 · 인라이어 비율, 호모그래피 사각형의 모양, 정답과의 오차, 학습/테스트 정확도 차이. 이번 교시의 예제는 모두 실패를 <code>try/except</code> 로 감싸 <b>안전하게 재현</b>하고, 바로 아래에 고친 코드를 둡니다.</p>` },
      { type: 'table', head: ['증상', '흔한 원인', '확인 방법', '해결'], rows: [
        ['findHomography 오류 “at least 4 corresponding point sets”', '비율 테스트 후 좋은 매칭이 4개 미만', '<code>len(good)</code> 출력', '<code>if len(good) &lt; MIN: continue</code> 로 먼저 거르기'],
        ['knnMatch 오류 “type == src2.type()”', '특징점 없는 영상(빈 화면 · 너무 어두움)에서 des 가 None', '<code>des is None</code> 확인', 'None · 점 개수 검사 후 건너뛰기'],
        ['매칭은 되는데 인라이어가 매우 적음', 'ORB(이진) 기술자에 NORM_L2 사용', 'NORM 을 바꿔 인라이어 수 비교', 'ORB · BRISK · AKAZE 는 <code>NORM_HAMMING</code>, SIFT 는 <code>NORM_L2</code>'],
        ['FlannBasedMatcher 오류 “Unsupported format … type=0”', 'KD-트리 인덱스에 uint8 기술자', '<code>des.dtype</code> 확인', 'SIFT 는 float32, ORB 는 LSH 인덱스(algorithm=6)'],
        ['상자가 꼬이거나 뒤집히거나 화면 밖으로 튐', '퇴화 호모그래피(오매칭 위주로 추정)', '사각형 볼록성 · det(H) · 넓이', '<code>quad_ok()</code> 검사 + 최소 인라이어 수'],
        ['정확도가 너무 좋음(100%)인데 실제로는 안 됨', '학습/테스트 누수, 테스트가 너무 쉬움', '다른 출처(다른 날 · 장면) 데이터로 재평가', '출처(원본) 단위로 분할, 테스트는 따로 수집'],
        ['합성 데이터에서는 되는데 실제 흑백 사진에서만 none 으로 분류', '회색 픽셀의 색상(H)이 잡음 → 증강 조각과 실제 조각의 색 히스토그램이 전혀 다름', '실제 조각과 학습 조각의 특징을 부분별(색 · HOG)로 거리 비교', '채도 낮은 픽셀의 H 를 0 으로 고정 (a5-1 color_hist)'],
      ] },
      { type: 'code', title: '예제 1 · 매칭 단계 실패 재현: 점 부족 · None 기술자 · NORM 불일치 · FLANN dtype', code: String.raw`
import cv2 as cv
import numpy as np


def short(e):
    """OpenCV 오류 메시지에서 핵심 한 줄만 꺼낸다."""
    msg = str(e)
    i = msg.find('error: (')
    return (msg[i:] if i >= 0 else msg).strip().splitlines()[0][:110]


def try_run(label, fn):
    try:
        print(f'  OK   {label}: {fn()}')
    except cv.error as e:
        print(f'  FAIL {label}: {short(e)}')


box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(box, None)
kp2, des2 = orb.detectAndCompute(scene, None)
print('ORB 기술자:', des1.shape, des1.dtype)

print('\n① 점이 4개 미만인 findHomography')
p = np.float32([[0, 0], [10, 0], [0, 10]])
try_run('3점 호모그래피', lambda: cv.findHomography(p, p, cv.RANSAC, 5.0))
print('   고침: if len(good) < 4 (실제로는 min_inliers 이상) 일 때만 호출')

print('\n② 특징점이 없는 영상 (기술자 None)')
blank = np.full((240, 320), 128, np.uint8)
kpb, desb = orb.detectAndCompute(blank, None)
print('  빈 화면 키포인트:', len(kpb), '/ des =', desb)
try_run('None 과 knnMatch', lambda: cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des1, desb, k=2))
print('   고침: if des is None or len(kp) < 10: return []')


def match_and_count(norm, ratio=0.8):
    """비율 테스트 후 좋은 매칭 수와 RANSAC 인라이어 수."""
    pairs = cv.BFMatcher(norm).knnMatch(des1, des2, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    if len(good) < 4:
        return len(good), 0
    src = np.float32([kp1[m.queryIdx].pt for m in good])
    dst = np.float32([kp2[m.trainIdx].pt for m in good])
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    return len(good), 0 if mask is None else int(mask.sum())


print('\n③ NORM 불일치 — 오류 없이 조용히 나빠짐')
cv.setRNGSeed(0)
for name, norm in [('NORM_HAMMING (올바름)', cv.NORM_HAMMING), ('NORM_L2 (ORB 에 틀림)', cv.NORM_L2)]:
    good, inl = match_and_count(norm)
    print(f'  {name:22s} good={good:3d} inliers={inl:3d}')

print('\n④ FLANN 인덱스와 기술자 dtype')
kd = cv.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))          # KD-트리: float32 전용
try_run('KD-트리 + ORB(uint8)', lambda: len(kd.knnMatch(des1, des2, k=2)))
lsh = cv.FlannBasedMatcher(dict(algorithm=6, table_number=6, key_size=12, multi_probe_level=1), dict(checks=50))
try_run('LSH + ORB(uint8)', lambda: f'{len(lsh.knnMatch(des1, des2, k=2))} 쌍 (이진 기술자는 LSH)')
sift = cv.SIFT_create(500)
_, s1 = sift.detectAndCompute(box, None)
_, s2 = sift.detectAndCompute(scene, None)
try_run('KD-트리 + SIFT(float32)', lambda: f'{len(kd.knnMatch(s1, s2, k=2))} 쌍, dtype={s1.dtype}')

print('\n⑤ knnMatch 결과가 2개 미만인 쌍 (장면 기술자가 1개뿐일 때, LSH 인덱스일 때 생김)')
pairs = cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des1, des2[:1], k=2)          # 후보가 1개뿐인 극단적 상황
short_pairs = sum(1 for p in pairs if len(p) < 2)
print(f'  2개 미만 쌍: {short_pairs} / {len(pairs)}')
try:
    good = [m for m, n in pairs if m.distance < 0.8 * n.distance]
    print('  통과', len(good))
except ValueError as e:
    print('  FAIL for m, n in pairs:', e)
good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.8 * p[1].distance]
print('  고침: [p[0] for p in pairs if len(p) == 2 and ...] →', len(good), '개 (오류 없음)')
`, desc: '<p>①②④는 오류 메시지가 원인을 알려 주지만, ③은 오류 없이 인라이어만 크게 줄어듭니다 — “인식률이 왜 낮지?”로 며칠을 헤매게 만드는 대표적인 조용한 버그입니다. 기술자 종류와 NORM 을 짝지어 외우세요: <b>이진(ORB · BRISK · AKAZE) → HAMMING, 실수(SIFT) → L2</b>. ⑤의 방어 코드는 BFMatcher 에서도 그대로 쓰는 것이 안전합니다.</p>' },
      { type: 'text', html: `
<h3>2. 퇴화 호모그래피(Degenerate Homography)</h3>
<p>findHomography 는 <b>어떤 점들을 줘도 3×3 행렬 하나를 돌려주려</b> 합니다. 오매칭이 대부분이면 수학적으로는 답이지만 물리적으로는 불가능한 변환이 나옵니다.</p>
<ul>
  <li><b>뒤집힘</b>: 상품이 거울상으로 매핑 → 사각형 꼭짓점 순서가 반대(시계 ↔ 반시계), <code>det(H) &lt; 0</code></li>
  <li><b>꼬임</b>: 두 꼭짓점이 엇갈려 나비 넥타이 모양 → <code>cv.isContourConvex</code> 가 False</li>
  <li><b>발산</b>: 원근 항이 커서 일부 꼭짓점이 무한대로 → 넓이가 화면보다 크거나, 분모 <code>h31·x + h32·y + h33 ≤ 0</code></li>
  <li><b>붕괴</b>: 점들이 거의 한 직선 → None 또는 넓이가 거의 0</li>
</ul>
<p>주의: 흔히 소개되는 “<code>det(H[:2, :2]) &gt; 0</code>” 검사는 물체가 원점 근처에 있을 때만 맞습니다. 이동량이 크고 원근이 있으면 정상 호모그래피에서도 음수가 나올 수 있어, 우리 <code>quad_ok()</code> 는 <b>전체 행렬식 + 네 꼭짓점의 분모 부호 + 볼록성 + 넓이</b>로 검사합니다.</p>` },
      { type: 'code', title: '예제 2 · 퇴화 호모그래피 재현과 quad_ok() 검사', code: String.raw`
import cv2 as cv
import numpy as np


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 이유, 꼭짓점)."""
    if H is None:
        return False, 'H is None', None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.any(z <= 0):
        return False, 'corner at infinity (diverged)', quad
    if not cv.isContourConvex(quad.astype(np.int32)):
        return False, 'not convex (twisted)', quad
    if np.linalg.det(H) <= 0:
        return False, 'det(H) <= 0 (flipped)', quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, f'bad area {area:.0f}', quad
    return True, 'ok', quad


box = cv.imread('box.png')
scene = cv.imread('box_in_scene.png')
h, w = box.shape[:2]
src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
good_dst = np.float32([[130, 160], [300, 150], [310, 290], [120, 300]])

cases = {
    'normal': cv.getPerspectiveTransform(src, good_dst),
    'flipped (mirror)': cv.getPerspectiveTransform(src, good_dst[[1, 0, 3, 2]]),
    'twisted (bow tie)': cv.getPerspectiveTransform(src, good_dst[[0, 1, 3, 2]]),
    'diverged (perspective)': cv.getPerspectiveTransform(src, np.float32([[130, 160], [500, 150], [2000, 1500], [120, 300]])),
    'collapsed (collinear)': cv.findHomography(np.float32([[0, 0], [50, 50], [100, 100], [150, 150], [200, 200]]),
                                               np.float32([[10, 10], [60, 60], [110, 110], [160, 160], [210, 210]]), cv.RANSAC, 3.0)[0],
}

tiles = []
for name, H in cases.items():
    ok, reason, quad = quad_ok(H, (w, h), scene.shape)
    det2 = np.linalg.det(H[:2, :2]) if H is not None else float('nan')
    print(f'{name:24s} → {"PASS" if ok else "REJECT":6s} {reason:34s} det(H[:2,:2])={det2:8.3f}')
    vis = scene.copy()
    if quad is not None and np.all(np.abs(quad) < 5000):
        cv.polylines(vis, [np.int32(quad)], True, (0, 255, 0) if ok else (0, 0, 255), 3, cv.LINE_AA)
        cv.circle(vis, tuple(np.int32(quad[0])), 7, (255, 0, 0), -1)                  # 0번 꼭짓점(왼위)
    cv.putText(vis, name, (8, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv.LINE_AA)
    cv.putText(vis, reason, (8, 375), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0) if ok else (0, 0, 255), 2, cv.LINE_AA)
    tiles.append(cv.resize(vis, (320, 240)))

tiles.append(np.zeros_like(tiles[0]))
cv.imshow('degenerate homographies', np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:6])]))
`, desc: '<p>뒤집힌 경우는 사각형 모양이 멀쩡해 보여서 눈으로는 놓치기 쉽습니다 — 파란 점(0번 꼭짓점)의 위치가 달라진 것을 보세요. 꼬인(나비 넥타이) 사각형은 변환 도중 분모가 0 을 지나므로 “무한대” 검사에 먼저 걸립니다. 볼록성 검사는 반올림 · 아주 작은 사각형 같은 경우를 위한 추가 안전장치입니다. 오른쪽 열 <code>det(H[:2,:2])</code> 값도 확인해 보면, 이 값만으로는 정상과 비정상을 확실히 가를 수 없다는 것을 알 수 있습니다. 검사를 통과하지 못한 결과는 <b>그리지도, 거리를 계산하지도 않고</b> 버리는 것이 원칙입니다.</p>' },
      { type: 'text', html: `
<h3>3. 머신러닝 입력 형식 — 규칙 네 가지</h3>
<p><code>cv.ml</code> 은 numpy 를 받지만 C++ 규칙을 그대로 따릅니다. 3주차에 배운 규칙을 다시 정리하면:</p>
<ol>
  <li>특징 <code>X</code> 는 <b>float32</b> 2차원 배열 (N × 차원). float64 는 오류</li>
  <li>분류 라벨 <code>y</code> 는 <b>정수</b>(int32 권장). SVM 분류(C_SVC)에 float32 라벨을 주면 “categorical” 오류</li>
  <li>샘플 <b>하나</b>를 예측할 때도 2차원: <code>x[None]</code> 또는 <code>x.reshape(1, -1)</code></li>
  <li>리스트가 아니라 <b>하나의 배열</b>로: <code>np.array(list_of_vectors, np.float32)</code></li>
</ol>
<p>그리고 조용한 규칙 하나: <b>학습과 예측의 특징 함수가 완전히 같아야</b> 합니다(같은 크기 64×64, 같은 HOG 설정, 같은 정규화). 학습 때는 64×64, 실시간에는 96×96 으로 잘랐다면 오류 없이 엉뚱한 답이 나옵니다.</p>` },
      { type: 'code', title: '예제 3 · cv.ml 형식 오류 재현과 수정', code: String.raw`
import cv2 as cv
import numpy as np


def short(e):
    msg = str(e)
    i = msg.find('error: (')
    return (msg[i:] if i >= 0 else msg).strip().splitlines()[0][:100]


def try_run(label, fn):
    try:
        print(f'  OK   {label}: {fn()}')
    except cv.error as e:
        print(f'  FAIL {label}: {short(e)}')


rng = np.random.default_rng(0)
X64 = np.vstack([rng.normal(0, 1, (30, 8)), rng.normal(3, 1, (30, 8))])   # float64 (numpy 기본)
y = np.repeat([0, 1], 30)                                                    # int64 (numpy 기본)
print('X dtype:', X64.dtype, '/ y dtype:', y.dtype)


def new_svm():
    s = cv.ml.SVM_create()
    s.setKernel(cv.ml.SVM_LINEAR)
    return s


print('\n① 특징 dtype')
try_run('kNN train(X float64)', lambda: cv.ml.KNearest_create().train(X64, cv.ml.ROW_SAMPLE, y.astype(np.int32)))
X = X64.astype(np.float32)
try_run('kNN train(X float32)', lambda: cv.ml.KNearest_create().train(X, cv.ml.ROW_SAMPLE, y.astype(np.int32)))

print('\n② 라벨 dtype (SVM 분류)')
try_run('SVM y float32', lambda: new_svm().train(X, cv.ml.ROW_SAMPLE, y.astype(np.float32)))
try_run('SVM y int32', lambda: new_svm().train(X, cv.ml.ROW_SAMPLE, y.astype(np.int32)))

svm = new_svm()
svm.train(X, cv.ml.ROW_SAMPLE, y.astype(np.int32))
print('\n③ 샘플 하나 예측')
try_run('predict(X[0])  shape ' + str(X[0].shape), lambda: svm.predict(X[0]))
try_run('predict(X[0][None]) shape ' + str(X[0][None].shape), lambda: int(svm.predict(X[0][None])[1][0, 0]))

print('\n④ 차원이 다른 특징 (학습 8차원, 예측 6차원)')
try_run('predict 6 dims', lambda: svm.predict(X[:1, :6]))

print('\n⑤ 조용한 버그: 학습/예측 특징 설정 불일치')
hog64 = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)
img = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
f_train = hog64.compute(cv.resize(img, (64, 64))).ravel()
f_live = hog64.compute(cv.resize(img, (96, 96))).ravel()           # 실수로 96×96 으로 자름
print(f'  학습 특징 {f_train.shape}, 실시간 특징 {f_live.shape} → 차원이 달라 이번엔 오류로 드러남')
f_live2 = hog64.compute(cv.resize(cv.GaussianBlur(img, (9, 9), 0), (64, 64))).ravel()   # 전처리만 다름
print(f'  전처리만 다르면 차원은 같음 {f_live2.shape} → 오류 없이 특징이 달라짐, 거리 = {np.linalg.norm(f_train - f_live2):.3f}')
print('  고침: extract() 함수 하나를 학습 · 평가 · 실시간 모두에서 import 해서 사용')
`, desc: '<p>①~④는 오류로 드러나므로 메시지의 <code>samples.type() == CV_32F</code>, <code>categorical</code>, <code>var_count</code> 같은 단어를 읽으면 원인이 보입니다. ⑤처럼 특징 크기는 같은데 전처리가 다른 경우는 오류가 나지 않으니, 특징 추출을 <b>한 함수로만</b> 하도록 코드 구조로 막는 것이 최선입니다(a5-1 의 모듈화).</p>' },
      { type: 'code', title: '예제 4 · 캘리브레이션 뷰가 너무 적으면 — 오차는 작은데 값은 틀리다', code: String.raw`
import cv2 as cv
import numpy as np

# 정답 카메라로 체스보드(9×6 내부 코너, 2.5cm)를 여러 자세에서 “찍은” 코너 좌표를 만든다
K_true = np.float64([[600, 0, 320], [0, 600, 240], [0, 0, 1]])
objp = np.zeros((6 * 9, 3), np.float32)
objp[:, :2] = np.mgrid[0:9, 0:6].T.reshape(-1, 2) * 2.5
rng = np.random.default_rng(0)
views = []
for _ in range(10):
    rvec = np.radians([rng.uniform(-35, 35), rng.uniform(-35, 35), rng.uniform(-10, 10)])
    tvec = np.float64([rng.uniform(-12, 2), rng.uniform(-8, 0), rng.uniform(35, 60)])
    pts, _ = cv.projectPoints(objp, rvec, tvec, K_true, None)
    views.append((pts + rng.normal(0, 0.3, pts.shape)).astype(np.float32))       # 코너 검출 잡음 0.3px

print('정답: fx=fy=600, cx=320, cy=240, 왜곡 k1=0')
print(f'{"views":>5s} {"RMS":>6s} {"fx":>7s} {"fy":>7s} {"cx":>7s} {"cy":>7s} {"k1":>7s} {"fx err%":>7s}')
for n in (1, 2, 3, 5, 10):
    rms, K, dist, _, _ = cv.calibrateCamera([objp] * n, views[:n], (640, 480), None, None)
    print(f'{n:5d} {rms:6.3f} {K[0, 0]:7.1f} {K[1, 1]:7.1f} {K[0, 2]:7.1f} {K[1, 2]:7.1f} {dist.ravel()[0]:7.3f} '
          f'{100 * abs(K[0, 0] - 600) / 600:7.1f}')
print('\n→ 뷰 1장: 재투영 RMS 는 가장 작은데 fx · cx · k1 이 크게 틀림 (자유도가 남아 “끼워 맞춘” 결과)')
print('→ 기준: 서로 다른 각도 · 위치의 뷰 10장 이상, 화면 구석까지 골고루, RMS 와 함께 값의 상식성도 확인')
`, desc: '<p>재투영 오차(RMS)는 “주어진 사진들을 얼마나 잘 설명하나”이지 “카메라 값이 맞나”가 아닙니다. 뷰가 1장이면 초점거리 · 중심 · 왜곡을 서로 바꿔 가며 그 한 장을 잘 설명하는 해가 무수히 많아, RMS 는 작아도 값은 틀립니다. 2주차 체스보드 13장 중 9장 이상을 쓴 이유가 여기에 있습니다. 이 틀린 fx 로 a5-4 의 거리를 추정하면 15% 가까이 틀립니다.</p>' },
      { type: 'text', html: `
<h3>4. 데이터 누수(Data Leakage) — 너무 좋은 점수를 의심하라</h3>
<p><b>누수</b>는 테스트 데이터의 정보가 학습에 새어 들어가 점수가 부풀려지는 현상입니다. 심화 프로젝트에서 흔한 형태:</p>
<ul>
  <li><b>증강 후 무작위 분할</b>: 같은 원본에서 나온 거의 똑같은 조각이 학습과 테스트 양쪽에 들어감</li>
  <li><b>연속 프레임 분할</b>: 동영상의 1번 프레임은 학습, 2번 프레임은 테스트 → 사실상 같은 이미지</li>
  <li><b>테스트로 튜닝</b>: 테스트 점수가 가장 좋은 파라미터를 고르고 그 점수를 그대로 보고 (a5-2)</li>
</ul>
<p>해결은 <b>출처(원본 · 촬영 세션 · 장면) 단위로 나누기</b>입니다. 누수의 피해는 <b>문제가 어려울수록</b> 커집니다. 아래 예제는 맛만 다른 녹차 두 종(MATCHA / LEMON, 글자만 다름)을 구분하는 어려운 과제에서, 같은 데이터를 ① 조각 단위 무작위 분할 ② 장면 단위 분할로 나눠 kNN 정확도를 비교합니다.</p>` },
      { type: 'code', title: '예제 5 · 데이터 누수: 조각 단위 무작위 분할 vs 출처(장면) 단위 분할', code: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def tea_label(text):
    """글자만 다른 녹차 라벨 (구분하기 어려운 두 상품)."""
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, text, (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return tea


teas = {'matcha': tea_label('MATCHA'), 'lemon': tea_label('LEMON')}
rng = np.random.default_rng(0)

# 장면 12장 · 장면마다 상품 2개 · 상품마다 조각 4번을 1px 씩만 다르게 잘라냄 (= 쌍둥이 조각)
X, y, group = [], [], []
for scene_id in range(12):
    scene = make_shelf()
    quads = {}
    for (name, img), slot in zip(teas.items(), rng.permutation(len(SLOTS))):
        quads[name] = random_quad(img, SLOTS[slot], rng.uniform(90, 120), rng)
        paste(scene, img, quads[name], rng)
    scene = add_noise(scene, rng, 30)
    for label, quad in enumerate(quads.values()):
        base = quad + rng.normal(0, 6, quad.shape).astype(np.float32)          # 이 장면의 검출 오차
        for _ in range(4):
            X.append(extract(rectify(scene, base + rng.normal(0, 1, quad.shape).astype(np.float32))))
            y.append(label)
            group.append(scene_id)
X, y, group = np.array(X, np.float32), np.array(y, np.int32), np.array(group)
print('조각', X.shape, '/ 장면 수', len(set(group)), '/ 클래스: matcha=0, lemon=1 (찍기 = 0.5)')


def knn_acc(tr, te, k=1):
    knn = cv.ml.KNearest_create()
    knn.train(X[tr], cv.ml.ROW_SAMPLE, y[tr])
    return (knn.findNearest(X[te], k)[1].ravel() == y[te]).mean()


# ① 조각 단위 무작위 분할 (누수: 같은 장면의 쌍둥이 조각이 양쪽에)
accs_leaky = []
for seed in range(5):
    idx = np.random.default_rng(seed).permutation(len(X))
    accs_leaky.append(knn_acc(idx[:len(X) // 2], idx[len(X) // 2:]))

# ② 장면 단위 분할 (앞 6장면 학습 / 뒤 6장면 테스트, 섞어서 5번)
accs_group = []
for seed in range(5):
    scenes = np.random.default_rng(seed).permutation(12)
    tr = np.isin(group, scenes[:6])
    accs_group.append(knn_acc(np.where(tr)[0], np.where(~tr)[0]))

print(f'① 조각 단위 무작위 분할 kNN(k=1) 정확도: {np.mean(accs_leaky):.3f}  (누수)')
print(f'② 장면 단위 분할        kNN(k=1) 정확도: {np.mean(accs_group):.3f}  (정직한 추정)')
print(f'   차이 {100 * (np.mean(accs_leaky) - np.mean(accs_group)):.1f}%p — 발표에서 ①을 보고하면 과장입니다')
`, desc: '<p>같은 장면에서 1px 씩만 다르게 잘라낸 쌍둥이 조각은 잡음 · 밝기 · 검출 오차가 같아서, k=1 이웃이 글자를 보고 고른 것이 아니라 <b>“자기 쌍둥이”</b>를 찾아 맞힙니다. 그래서 ①은 90% 안팎으로 높게 나오지만, 처음 보는 장면으로만 평가한 ②는 찍기(50%)보다 조금 나은 수준까지 떨어집니다. ②가 진짜 실력이고, 이 결과는 “글자만 다른 상품은 지금 특징(64×64 HOG)으로는 구분이 어렵다”는 중요한 사실도 알려 줍니다. 팀 데이터도 <b>“이 테스트 이미지와 거의 같은 이미지가 학습에 있나?”</b>를 스스로 물어보세요.</p>' },
      { type: 'code', title: '예제 6 · Haar 캐스케이드 오검출: minNeighbors · minSize 로 줄이기', code: String.raw`
import cv2 as cv
import numpy as np

face = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
tests = [('messi5.jpg', 1), ('lena.jpg', 1), ('starry_night.jpg', 0), ('baboon.jpg', 0)]   # (이미지, 실제 얼굴 수)
MIN_SIZE = 30                                                                  # 가로 400 기준 최소 얼굴 크기(px)


def group(rects, min_neighbors):
    """후보 상자를 묶는다 = detectMultiScale(minNeighbors=...) 와 같은 결과."""
    if not rects:
        return []
    grouped, _ = cv.groupRectangles(rects, min_neighbors, 0.2)
    return [tuple(map(int, r)) for r in grouped]


print(f'{"image":17s} {"faces":>5s} ' + ' '.join(f'{"mn=" + str(m):>6s}' for m in (1, 3, 5)) + f' {"mn=5,min" + str(MIN_SIZE):>10s}')
tiles = []
for name, n_true in tests:
    img = cv.imread(name)
    img = cv.resize(img, (400, img.shape[0] * 400 // img.shape[1]), interpolation=cv.INTER_AREA)   # 속도를 위해 가로 400
    gray = cv.equalizeHist(cv.cvtColor(img, cv.COLOR_BGR2GRAY))
    raw = [list(map(int, r)) for r in face.detectMultiScale(gray, 1.1, 0)]    # minNeighbors=0: 묶기 전 후보 전부 (검출은 한 번만)
    counts = [len(group(raw, m)) for m in (1, 3, 5)]
    loose = group(raw, 1)
    strict = [r for r in group(raw, 5) if r[2] >= MIN_SIZE]
    print(f'{name:17s} {n_true:5d} ' + ' '.join(f'{c:6d}' for c in counts) + f' {len(strict):10d}   (후보 {len(raw)}개)')
    vis = img.copy()
    for (x, y, w, h) in loose:                                                 # 느슨한 설정 = 빨강
        cv.rectangle(vis, (x, y), (x + w, y + h), (0, 0, 255), 2)
    for (x, y, w, h) in strict:                                                # 엄격한 설정 = 초록
        cv.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 3)
    s = 240 / vis.shape[0]
    tiles.append(cv.resize(vis, (int(vis.shape[1] * s), 240)))

print(f'\n빨강 = minNeighbors=1 (오검출 많음), 초록 = minNeighbors=5 + 크기 {MIN_SIZE}px 이상')
print('고침: 오검출이 문제면 minNeighbors↑ · minSize 로 너무 작은 후보 제거 · 관심 영역 제한 · DNN(YuNet) 검출로 교체')
cv.imshow('haar false positives', np.hstack(tiles))
`, desc: '<p>얼굴이 없는 그림(starry_night, baboon)에서도 “얼굴”이 나옵니다. Haar 는 밝기 패턴만 보므로 비슷한 명암 배치에 속습니다. minNeighbors 를 올리면 baboon 의 오검출은 사라지지만 starry_night 의 오검출은 남고, 크기 기준을 올리면 오히려 <b>작은 진짜 얼굴(messi5)을 놓칩니다</b> — 설정만으로는 정밀도와 재현율을 동시에 올릴 수 없다는 뜻입니다. 이럴 때가 검출기 자체를 DNN(YuNet)으로 바꿀 때입니다. <b>오검출 수를 얼굴 없는 이미지 모음으로 세는 것</b>이 검출 프로젝트의 필수 테스트이고, 한 번 검출한 후보를 <code>groupRectangles</code> 로 여러 기준에 재사용하면 탐색이 빨라집니다.</p>' },
      { type: 'text', html: `
<h3>5. 테스트 자동화 — test_ 함수와 assert</h3>
<p>한 번 고친 버그가 다시 생기지 않게 하려면 <b>확인 과정을 코드로 남겨야</b> 합니다. 복잡한 도구 없이 규칙 세 가지면 충분합니다.</p>
<ul>
  <li>함수 이름을 <code>test_</code> 로 시작하고, 기대하는 결과를 <code>assert 조건, '실패 메시지'</code> 로 쓴다</li>
  <li><b>정상 입력</b>(합성 장면에서 상품을 찾는가)과 <b>나쁜 입력</b>(빈 화면 · 아주 작은 영상 · 상품 없는 사진에서 오류 없이 빈 결과인가)을 모두 시험한다</li>
  <li>작은 실행기가 <code>test_</code> 함수를 모두 돌려 PASS/FAIL 을 표로 출력한다 — 코드를 고칠 때마다 한 번씩 실행</li>
</ul>
<p>좋은 테스트는 <b>빠르고(수백 ms), 결정적이며(seed 고정), 하나만 확인</b>합니다. 실패 메시지에는 기대값과 실제값을 함께 넣으세요.</p>` },
      { type: 'code', title: '예제 7 · assert 기반 테스트 모음과 실행기', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

cv.setRNGSeed(0)
PRODUCTS = make_products()
DB = build_db(PRODUCTS, CFG)


def test_extract_shape_and_dtype():
    f = extract(np.zeros((64, 64, 3), np.uint8))
    assert f.shape == (356,), f'차원 356 기대, 실제 {f.shape}'
    assert f.dtype == np.float32, f'float32 기대, 실제 {f.dtype}'


def test_quad_ok_rejects_flip_and_twist():
    src = np.float32([[0, 0], [100, 0], [100, 80], [0, 80]])
    dst = np.float32([[10, 10], [110, 12], [112, 90], [8, 92]])
    assert quad_ok(cv.getPerspectiveTransform(src, dst), (100, 80), (480, 640))[0], '정상 사각형이 거부됨'
    assert not quad_ok(cv.getPerspectiveTransform(src, dst[[1, 0, 3, 2]]), (100, 80), (480, 640))[0], '뒤집힘 통과'
    assert not quad_ok(cv.getPerspectiveTransform(src, dst[[0, 1, 3, 2]]), (100, 80), (480, 640))[0], '꼬임 통과'


def test_recognize_finds_products_on_synthetic_scene():
    scene, truth = make_scene(PRODUCTS, np.random.default_rng(0))
    found = {r['name'] for r in recognize(scene, DB, CFG)}
    assert len(found) >= 3, f'4개 중 3개 이상 기대, 실제 {sorted(found)}'


def test_recognize_real_box_in_scene():
    found = [r for r in recognize(cv.imread('box_in_scene.png'), DB, CFG) if r['name'] == 'cookie']
    assert found and found[0]['inliers'] >= 15, 'box_in_scene 에서 cookie 를 인라이어 15 이상으로 찾아야 함'


def test_recognize_safe_on_bad_inputs():
    for img in [np.zeros((480, 640, 3), np.uint8), np.full((20, 20, 3), 200, np.uint8)]:
        assert recognize(img, DB, CFG) == [], f'빈 영상 {img.shape} 에서 결과가 나오면 안 됨'


def test_no_false_positive_on_non_products():
    for name in ['home.jpg', 'baboon.jpg']:
        found = recognize(cv.imread(name), DB, CFG)
        assert not found, f'{name} 에서 오검출: {[r["name"] for r in found]}'


def run_tests():
    """이름이 test_ 로 시작하는 함수를 모두 실행해 결과 표를 출력한다."""
    tests = [(n, f) for n, f in globals().items() if n.startswith('test_') and callable(f)]
    passed = 0
    for name, fn in tests:
        t = time.perf_counter()
        try:
            fn()
            status, msg = 'PASS', ''
            passed += 1
        except AssertionError as e:
            status, msg = 'FAIL', str(e)
        except Exception as e:                                   # 예상 못 한 오류도 실패로 기록
            status, msg = 'ERROR', f'{type(e).__name__}: {str(e)[:80]}'
        print(f'{status:5s} {name:50s} {(time.perf_counter() - t) * 1000:6.1f} ms  {msg}')
    print(f'\n{passed} / {len(tests)} 통과')


run_tests()
`, desc: '<p>여섯 테스트가 <b>정상 입력 · 실제 이미지 · 나쁜 입력 · 오검출</b>을 모두 덮습니다. 이제 CFG 를 바꾸거나 함수를 고칠 때마다 이 실행기를 돌리면, 예전에 고친 문제가 다시 생겼는지 바로 알 수 있습니다. 실습 2 에서 직접 테스트를 추가해 봅니다.</p>' },
      { type: 'checklist', title: '코드 리뷰 점검표 (팀원 코드를 서로 바꿔 읽기)', items: [
        '입력 방어: 이미지 None · 기술자 None · 점 개수 부족 · 빈 결과에서 오류 없이 넘어간다',
        '기술자와 NORM 이 짝이 맞는다 (이진 → HAMMING, SIFT → L2), FLANN 이면 인덱스와 dtype 이 맞다',
        '호모그래피 결과를 쓰기 전에 볼록성 · 행렬식 · 넓이(quad_ok)를 검사한다',
        'cv.ml 입력: X float32 2차원, y int32, 예측도 2차원, 특징 함수는 학습 · 실시간이 같은 함수',
        '카메라 행렬의 출처와 해상도가 실행 조건과 맞는다',
        '평가 데이터가 출처 단위로 분리되어 있고, 튜닝에 쓰지 않은 테스트로 최종 점수를 낸다',
        '매직 넘버 대신 CFG 이름을 쓰고, 무작위 요소는 seed 로 고정했다',
        'process(frame) 안에 무거운 준비 작업이 없다',
        'test_ 함수가 있고 모두 통과한다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 조용한 버그 3개 찾기',
        desc: `<p>아래 <code>find_cookie()</code> 는 오류 없이 실행되지만 결과가 이상합니다. box_in_scene 에서 인라이어가 적고, <b>상품이 없는 baboon.jpg 에서도 cookie 를 찾았다고</b> 할 때가 있습니다.
조용한 버그 3개(<b>NORM</b>, <b>비율 테스트</b>, <b>호모그래피 검사</b>)를 찾아 고치세요. 고친 뒤 box_in_scene 은 인라이어 30 이상으로 찾고, baboon · home 에서는 None 이 나오면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

cv.setRNGSeed(0)
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(box, None)
h, w = box.shape


def find_cookie(img):
    """img 에서 cookie(box.png)를 찾아 (꼭짓점, 인라이어 수) 또는 None."""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    kp2, des2 = orb.detectAndCompute(gray, None)
    if des2 is None:
        return None
    pairs = cv.BFMatcher(cv.NORM_L2).knnMatch(des1, des2, k=2)
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 1.0 * p[1].distance]
    if len(good) < 4:
        return None
    src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    if H is None:
        return None
    quad = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H).reshape(4, 2)
    return quad, int(mask.sum())


for name in ['box_in_scene.png', 'baboon.jpg', 'home.jpg']:
    res = find_cookie(cv.imread(name))
    print(f'{name:17s} →', None if res is None else f'inliers={res[1]}, convex={cv.isContourConvex(np.int32(res[0]))}')
`,
        hint: `<p>① ORB 는 이진 기술자 → <code>cv.NORM_HAMMING</code>. ② <code>1.0 *</code> 이면 비율 테스트가 아무것도 거르지 않음 → 0.75~0.8. ③ 인라이어 수만 믿지 말고 <code>mask.sum() &lt; 15</code> 이거나 사각형이 볼록하지 않으면(<code>cv.isContourConvex</code>) None.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

cv.setRNGSeed(0)
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(box, None)
h, w = box.shape
MIN_INLIERS = 15


def find_cookie(img):
    """img 에서 cookie(box.png)를 찾아 (꼭짓점, 인라이어 수) 또는 None."""
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    kp2, des2 = orb.detectAndCompute(gray, None)
    if des2 is None or len(kp2) < 10:
        return None
    pairs = cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des1, des2, k=2)              # 버그 1: NORM_L2 → HAMMING
    good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.8 * p[1].distance]   # 버그 2: 1.0 → 0.8
    if len(good) < MIN_INLIERS:
        return None
    src = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
    if H is None or mask.sum() < MIN_INLIERS:                                     # 버그 3: 검사 추가
        return None
    quad = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H).reshape(4, 2)
    if np.linalg.det(H) <= 0 or not cv.isContourConvex(np.int32(quad)) or cv.contourArea(quad) < 400:
        return None
    return quad, int(mask.sum())


for name in ['box_in_scene.png', 'baboon.jpg', 'home.jpg']:
    res = find_cookie(cv.imread(name))
    print(f'{name:17s} →', None if res is None else f'inliers={res[1]}, convex={cv.isContourConvex(np.int32(res[0]))}')
`,
      },
      {
        title: '실습 2 · 안전한 good_matches() 와 테스트 작성',
        desc: `<p><code>good_matches(des1, des2, ratio)</code> 는 비율 테스트를 통과한 매칭 리스트를 돌려줘야 합니다. 다음 테스트 4개가 모두 <b>PASS</b> 가 되도록 함수를 고치세요.</p>
<ul><li>기술자가 None 이면 빈 리스트</li><li>knnMatch 결과가 2개 미만인 쌍은 건너뜀</li><li>ratio 가 작을수록 결과가 같거나 적음</li><li>box ↔ box_in_scene 에서 20개 이상</li></ul>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

orb = cv.ORB_create(1000)
_, D_BOX = orb.detectAndCompute(cv.imread('box.png', cv.IMREAD_GRAYSCALE), None)
_, D_SCENE = orb.detectAndCompute(cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE), None)


def good_matches(des1, des2, ratio=0.8):
    """비율 테스트를 통과한 DMatch 리스트. 입력이 나쁘면 빈 리스트."""
    # TODO: None 검사, len(p) == 2 검사를 추가하세요
    pairs = cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des1, des2, k=2)
    return [m for m, n in pairs if m.distance < ratio * n.distance]


def test_none_descriptor():
    assert good_matches(D_BOX, None) == [], 'None 이면 빈 리스트'


def test_short_pairs():
    few = D_SCENE[:1]                                   # 후보가 1개뿐 → knnMatch 쌍의 길이가 1
    assert good_matches(D_BOX, few) == [], '쌍이 1개뿐이면 건너뛰어야 함'


def test_ratio_monotonic():
    assert len(good_matches(D_BOX, D_SCENE, 0.6)) <= len(good_matches(D_BOX, D_SCENE, 0.8)), 'ratio 가 작으면 적어야 함'


def test_real_pair():
    n = len(good_matches(D_BOX, D_SCENE, 0.8))
    assert n >= 20, f'20개 이상 기대, 실제 {n}'


for name, fn in [(n, f) for n, f in list(globals().items()) if n.startswith('test_')]:
    try:
        fn()
        print('PASS ', name)
    except AssertionError as e:
        print('FAIL ', name, '-', e)
    except Exception as e:
        print('ERROR', name, '-', type(e).__name__, str(e).strip().splitlines()[0][:70])
`,
        hint: `<p>맨 앞에 <code>if des1 is None or des2 is None: return []</code>. 리스트 만들기는 <code>[p[0] for p in pairs if len(p) == 2 and p[0].distance &lt; ratio * p[1].distance]</code>. 테스트 실행기가 오류(ERROR)와 실패(FAIL)를 구분해 보여 주는 점도 확인하세요.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

orb = cv.ORB_create(1000)
_, D_BOX = orb.detectAndCompute(cv.imread('box.png', cv.IMREAD_GRAYSCALE), None)
_, D_SCENE = orb.detectAndCompute(cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE), None)


def good_matches(des1, des2, ratio=0.8):
    """비율 테스트를 통과한 DMatch 리스트. 입력이 나쁘면 빈 리스트."""
    if des1 is None or des2 is None or len(des1) == 0 or len(des2) == 0:
        return []
    pairs = cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des1, des2, k=2)
    return [p[0] for p in pairs if len(p) == 2 and p[0].distance < ratio * p[1].distance]


def test_none_descriptor():
    assert good_matches(D_BOX, None) == [], 'None 이면 빈 리스트'


def test_short_pairs():
    few = D_SCENE[:1]
    assert good_matches(D_BOX, few) == [], '쌍이 1개뿐이면 건너뛰어야 함'


def test_ratio_monotonic():
    assert len(good_matches(D_BOX, D_SCENE, 0.6)) <= len(good_matches(D_BOX, D_SCENE, 0.8)), 'ratio 가 작으면 적어야 함'


def test_real_pair():
    n = len(good_matches(D_BOX, D_SCENE, 0.8))
    assert n >= 20, f'20개 이상 기대, 실제 {n}'


for name, fn in [(n, f) for n, f in list(globals().items()) if n.startswith('test_')]:
    try:
        fn()
        print('PASS ', name)
    except AssertionError as e:
        print('FAIL ', name, '-', e)
    except Exception as e:
        print('ERROR', name, '-', type(e).__name__, str(e).strip().splitlines()[0][:70])
`,
      },
      {
        title: '실습 3 · 비율 임계값 진단표 만들기 (실제 이미지)',
        desc: `<p>실제 장면 box_in_scene 에서 비율 임계값 0.5 ~ 1.0 을 바꿔 가며 <b>좋은 매칭 수 · 인라이어 수 · 인라이어 비율</b>을 표로 출력하고, 인라이어 비율이 가장 높으면서 인라이어가 20개 이상인 임계값을 추천하세요.
임계값이 1.0 에 가까워질수록 좋은 매칭은 늘지만 인라이어 비율이 떨어지는 경향이 보이면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

cv.setRNGSeed(0)
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(box, None)
kp2, des2 = orb.detectAndCompute(scene, None)
pairs = [p for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des1, des2, k=2) if len(p) == 2]

rows = []
print(f'{"ratio":>5s} {"good":>5s} {"inliers":>7s} {"inlier%":>7s}')
for ratio in [0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0]:
    good = [p[0] for p in pairs if p[0].distance < ratio * p[1].distance]
    inliers = 0
    # TODO 1: good 가 4개 이상이면 findHomography(RANSAC, 5.0) 로 인라이어 수 계산
    ratio_pct = 100 * inliers / max(len(good), 1)
    rows.append((ratio, len(good), inliers, ratio_pct))
    print(f'{ratio:5.2f} {len(good):5d} {inliers:7d} {ratio_pct:6.1f}%')
# TODO 2: 인라이어 20 이상인 행 중 inlier% 가 가장 높은 ratio 추천
`,
        hint: `<p>인라이어: <code>H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)</code> 후 <code>int(mask.sum())</code>. 추천: <code>cands = [r for r in rows if r[2] &gt;= 20]</code>, <code>max(cands, key=lambda r: r[3])</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

cv.setRNGSeed(0)
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
orb = cv.ORB_create(1000)
kp1, des1 = orb.detectAndCompute(box, None)
kp2, des2 = orb.detectAndCompute(scene, None)
pairs = [p for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(des1, des2, k=2) if len(p) == 2]

rows = []
print(f'{"ratio":>5s} {"good":>5s} {"inliers":>7s} {"inlier%":>7s}')
for ratio in [0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0]:
    good = [p[0] for p in pairs if p[0].distance < ratio * p[1].distance]
    inliers = 0
    if len(good) >= 4:
        src = np.float32([kp1[m.queryIdx].pt for m in good])
        dst = np.float32([kp2[m.trainIdx].pt for m in good])
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        inliers = 0 if mask is None else int(mask.sum())
    ratio_pct = 100 * inliers / max(len(good), 1)
    rows.append((ratio, len(good), inliers, ratio_pct))
    print(f'{ratio:5.2f} {len(good):5d} {inliers:7d} {ratio_pct:6.1f}%')
cands = [r for r in rows if r[2] >= 20]
if cands:
    best = max(cands, key=lambda r: r[3])
    print(f'\n추천 ratio = {best[0]} (인라이어 {best[2]}개, 비율 {best[3]:.1f}%)')
else:
    print('\n인라이어 20개 이상인 설정이 없음 → nfeatures 를 늘리거나 전처리를 점검')
`,
      },
    ],
    quiz: [
      { q: 'ORB 기술자를 BFMatcher(cv.NORM_L2) 로 매칭했습니다. 어떤 일이 일어날까요?', options: ['즉시 오류가 난다', '오류 없이 실행되지만 거리 계산이 의미에 맞지 않아 좋은 매칭 · 인라이어가 크게 줄어든다', '더 정확해진다', 'SIFT 로 자동 변환된다'], answer: 1, explain: 'ORB 는 비트 문자열이라 서로 다른 비트 수(해밍 거리)로 비교해야 합니다. 바이트 값의 L2 거리는 오류 없이 계산되지만 의미가 없어 “조용히” 성능이 떨어집니다.' },
      { q: 'FlannBasedMatcher(KD-트리)에 ORB 기술자를 넣었더니 “Unsupported format … type=0” 오류가 났습니다. 가장 알맞은 해결은?', options: ['기술자를 uint16 으로 바꾼다', '이진 기술자용 LSH 인덱스(algorithm=6)를 쓰거나 BFMatcher(NORM_HAMMING)를 쓴다', 'k=1 로 바꾼다', '이미지를 컬러로 넣는다'], answer: 1, explain: 'KD-트리는 float32 실수 기술자(SIFT)용입니다. ORB 같은 uint8 이진 기술자는 LSH 인덱스나 해밍 거리 BFMatcher 를 씁니다.' },
      { q: '체스보드 사진 1장으로 캘리브레이션했더니 재투영 RMS 가 0.38px 로 매우 작았습니다. 올바른 판단은?', options: ['매우 정확하므로 그대로 사용한다', 'RMS 가 작아도 뷰가 부족하면 초점거리 · 중심 · 왜곡이 틀릴 수 있으므로 다양한 각도의 뷰를 10장 이상 모은다', 'RMS 가 0 이 될 때까지 같은 사진을 반복해서 넣는다', '왜곡 계수만 버리면 된다'], answer: 1, explain: '재투영 오차는 주어진 사진을 얼마나 잘 설명하는지일 뿐, 카메라 값이 맞는지를 보장하지 않습니다. 자유도를 충분히 제약하려면 다양한 자세의 뷰가 필요합니다.' },
      { q: '증강한 조각 1000개를 무작위로 섞어 800/200 으로 나눴더니 테스트 정확도가 99.8% 였습니다. 가장 먼저 의심할 것은?', options: ['모델이 완벽하다', '같은 원본에서 나온 거의 같은 조각이 학습과 테스트에 함께 들어간 데이터 누수', '테스트 세트가 너무 크다', 'SVM 의 C 가 너무 작다'], answer: 1, explain: '증강 후 무작위 분할은 대표적인 누수입니다. 원본 · 장면 · 촬영 세션 단위로 나누거나 별도로 모은 테스트로 평가해야 합니다.' },
      { q: '다음 중 “조용히 틀리는 버그”를 잡는 데 가장 효과적인 방법은?', options: ['try/except 로 모든 오류를 무시한다', '정답을 아는 입력으로 기대값을 assert 하는 test_ 함수를 만들어 코드를 고칠 때마다 실행한다', 'print 문을 모두 지운다', '코드를 한 파일에 모은다'], answer: 1, explain: '조용한 버그는 오류가 나지 않으므로 “결과가 기대와 같은가”를 수치로 확인해야 합니다. 합성 장면 · 실제 이미지 · 나쁜 입력에 대한 테스트가 그 역할을 합니다.' },
    ],
  },
  // =====================================================================
  // a5-6 결과 정리와 발표 준비
  // =====================================================================
  {
    id: 'a5-6',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/adv/graf1.jpg'],
    summary: '프로젝트 결과를 “숫자와 그림”으로 정리합니다. 클래스별 정밀도 · 재현율과 처리 시간을 담은 정량 평가표, 성공 · 실패 사례 몽타주, 발표용 차트, 파이프라인 단계 그림을 코드로 만들어 저장하고, 7분 발표 구성과 데모 실패에 대비한 백업 계획을 세웁니다.',
    goals: [
      '평가 코드를 한 번 돌려 클래스별 P · R · F1, 전체 지표, 평균 처리 시간(FPS)을 표로 출력할 수 있다',
      '성공 · 실패 사례를 제목이 붙은 몽타주와 파이프라인 단계 그림으로 만들어 imwrite 로 저장할 수 있다',
      '기준선 대비 개선, 클래스별 성능, 단계별 시간을 발표용 차트로 그릴 수 있다',
      '심화 프로젝트 발표 구성과 데모 백업 계획(동영상 · 이미지 입력 전환)을 준비할 수 있다',
    ],
    schedule: [['도입: 발표에서 믿음을 주는 세 가지', 5], ['정량 평가표 만들기', 12], ['몽타주 · 차트 · 파이프라인 그림', 15], ['발표 구성 · 백업 계획 수립 (팀)', 13], ['정리 · 퀴즈', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 발표에서 믿음을 주는 세 가지</h3>
<p>청중은 코드를 보지 않습니다. 발표 7분 동안 “이 팀의 결과를 믿을 수 있다”고 느끼게 하는 것은 세 가지입니다.</p>
<ol>
  <li><b>숫자</b>: 어떤 데이터(몇 장, 어떻게 만든)에서, 어떤 기준(IoU 0.5)으로, 몇 %였는지 — 그리고 <b>기준선 대비</b> 얼마나 좋아졌는지</li>
  <li><b>그림</b>: 성공 사례만이 아니라 <b>실패 사례와 그 원인</b>. 실패를 분석해 보여 주는 팀이 더 신뢰를 얻습니다</li>
  <li><b>재현</b>: 라이브 데모 — 그리고 데모가 실패해도 같은 결과를 보여 줄 수 있는 <b>백업</b></li>
</ol>
<p>이번 교시에는 이 재료를 <b>코드로 자동 생성</b>합니다. 파라미터를 바꾸면 표 · 그림 · 차트가 다시 만들어지므로, 발표 직전까지 튜닝해도 자료를 손으로 고칠 필요가 없습니다.</p>` },
      { type: 'table', head: ['보고 항목', '스마트 선반 예시', '팀 프로젝트에서'], rows: [
        ['데이터', '합성 장면 8장(상품 4종 + 방해물), 실제 장면 box_in_scene 1장', '장수 · 출처 · 만든 방법 · 학습/테스트 분리 방식'],
        ['기준', '찾은 사각형과 정답의 IoU &gt; 0.5 이면 TP', '정답 판정 기준(IoU, 오차 mm, 라벨 일치)'],
        ['정확도 지표', '클래스별 P · R · F1, macro 평균', '목적에 맞는 주 지표 1개 + 보조 지표'],
        ['속도', '장면당 평균 ms, FPS (PC / 브라우저)', '실시간이면 FPS, 아니면 장당 시간'],
        ['비교', '기준선(4주차) → 최종, 설정별 F1', '바꾼 것 하나마다 한 줄'],
        ['한계', 'cookie 재현율 낮음(작고 흑백), 합성 데이터', '실패 사례 2~3개와 원인 · 개선 아이디어'],
      ] },
      { type: 'code', title: '예제 1 · 정량 평가 보고서: 클래스별 P · R · F1 과 처리 시간', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑥ SVM 검증 + 평가 (a5-2 · a5-5) =====
def iou(q1, q2):
    """볼록 사각형 두 개의 IoU."""
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


def train_verifier(products, seed=1):
    """증강 조각으로 SVM(RBF, C=10, gamma=1) 검증기를 학습한다."""
    X, y = build_train(products, np.random.default_rng(seed), n_per=25, n_none=40)
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(10)
    svm.setGamma(1.0)
    svm.train(X, cv.ml.ROW_SAMPLE, y)
    return svm


def verify(svm, frame, r):
    """찾은 사각형을 펴서 SVM 이 같은 상품이라고 하면 True."""
    return CLASSES[int(svm.predict(extract(rectify(frame, r['quad']))[None])[1][0, 0])] == r['name']


def evaluate(products, db, cfg, svm, n_scenes=8, seed=100, width=(120, 175), noise=18):
    """합성 장면 평가 → (클래스별 {'tp','fp','fn'}, 장면당 ms 리스트, [(장면, 정답, 결과)])."""
    rng = np.random.default_rng(seed)
    orb = cv.ORB_create(cfg['scene_features'])
    counts = {n: {'tp': 0, 'fp': 0, 'fn': 0} for n in products}
    times, records = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng, width=width, noise=noise)
        t = time.perf_counter()
        found = [r for r in recognize(scene, db, cfg, orb) if verify(svm, scene, r)]
        times.append((time.perf_counter() - t) * 1000)
        hit = set()
        for r in found:
            if iou(r['quad'], truth[r['name']]) > 0.5:
                counts[r['name']]['tp'] += 1
                hit.add(r['name'])
            else:
                counts[r['name']]['fp'] += 1
        for n in products:
            if n not in hit:
                counts[n]['fn'] += 1
        records.append((scene, truth, found))
    return counts, times, records

cv.setRNGSeed(0)
products = make_products()
db = build_db(products, CFG)
svm = train_verifier(products)
counts, times, records = evaluate(products, db, CFG, svm, n_scenes=8, seed=100)

print('## Smart Shelf 평가 결과')
print(f'- 데이터: 합성 선반 장면 {len(records)}장 (상품 4종 + 방해물 1, 가로 120~175px, 잡음 ±18)')
print('- 기준: IoU > 0.5 이면 TP · 인식 = ORB 매칭 + 호모그래피 검사 + SVM 검증')
print(f'- 설정: ratio={CFG["ratio"]}, min_inliers={CFG["min_inliers"]}, nfeatures={CFG["scene_features"]}, CLAHE={CFG["clahe"]}\n')

print('| class | TP | FP | FN | precision | recall | F1 |')
print('|---|---|---|---|---|---|---|')
P_all, R_all, F_all = [], [], []
for name, c in counts.items():
    P = c['tp'] / max(c['tp'] + c['fp'], 1)
    R = c['tp'] / max(c['tp'] + c['fn'], 1)
    F = 2 * P * R / max(P + R, 1e-9)
    P_all.append(P)
    R_all.append(R)
    F_all.append(F)
    print(f'| {name} | {c["tp"]} | {c["fp"]} | {c["fn"]} | {P:.2f} | {R:.2f} | {F:.2f} |')
tp = sum(c['tp'] for c in counts.values())
fp = sum(c['fp'] for c in counts.values())
fn = sum(c['fn'] for c in counts.values())
print(f'| **macro avg** | {tp} | {fp} | {fn} | {np.mean(P_all):.2f} | {np.mean(R_all):.2f} | {np.mean(F_all):.2f} |')

ms = np.array(times)
print(f'\n- 처리 시간: 장면당 평균 {ms.mean():.1f} ms (중앙값 {np.median(ms):.1f}, 최대 {ms.max():.1f}) → 약 {1000 / ms.mean():.0f} FPS (이 PC 기준)')
real = [r for r in recognize(cv.imread('box_in_scene.png'), db, CFG) if verify(svm, cv.imread('box_in_scene.png'), r)]
print(f'- 실제 장면 box_in_scene.png: {[(r["name"], r["inliers"]) for r in real]}')
worst = min(counts, key=lambda n: counts[n]['tp'] / max(counts[n]['tp'] + counts[n]['fn'], 1))
print(f'- 가장 약한 클래스: {worst} → 실패 사례를 몽타주로 확인하고 원인을 적을 것 (예제 2)')
`, desc: '<p>출력이 <b>마크다운 표</b> 형식이라 그대로 복사해 발표 자료 · 보고서에 붙일 수 있습니다. 이 설정에서는 정밀도는 모두 1.00 이지만 <b>cookie 의 재현율</b>이 낮게 나옵니다 — 숫자가 “어디를 더 봐야 하는지” 알려 준 것입니다. 처리 시간은 PC 기준이므로, 브라우저 데모의 FPS 는 a5-3 의 HUD 값으로 따로 보고하세요.</p>' },
      { type: 'text', html: `
<h3>2. 결과 몽타주 — 성공과 실패를 한 장에</h3>
<p>여러 장면의 결과를 한 장으로 모으면 “대체로 잘 되고, 이런 경우에 실패한다”가 한눈에 보입니다. 규칙:</p>
<ul>
  <li>칸마다 <b>제목 띠</b>: 장면 번호, 찾은 개수 / 정답 개수, 처리 시간</li>
  <li><b>색의 약속</b>을 지키고 범례를 넣기: 정답 = 흰 얇은 선, 맞게 찾음 = 초록, 놓침 = 빨간 글자</li>
  <li>실패가 있는 칸은 테두리를 빨간색으로 — 청중의 눈이 먼저 가게</li>
  <li><code>cv.imwrite('montage.png', img)</code> 로 저장하면 콘솔에 다운로드 링크가 생깁니다 → 슬라이드에 붙이기</li>
</ul>` },
      { type: 'code', title: '예제 2 · 성공 · 실패 사례 몽타주 만들고 저장하기', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑥ SVM 검증 + 평가 (a5-2 · a5-5) =====
def iou(q1, q2):
    """볼록 사각형 두 개의 IoU."""
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


def train_verifier(products, seed=1):
    """증강 조각으로 SVM(RBF, C=10, gamma=1) 검증기를 학습한다."""
    X, y = build_train(products, np.random.default_rng(seed), n_per=25, n_none=40)
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(10)
    svm.setGamma(1.0)
    svm.train(X, cv.ml.ROW_SAMPLE, y)
    return svm


def verify(svm, frame, r):
    """찾은 사각형을 펴서 SVM 이 같은 상품이라고 하면 True."""
    return CLASSES[int(svm.predict(extract(rectify(frame, r['quad']))[None])[1][0, 0])] == r['name']


def evaluate(products, db, cfg, svm, n_scenes=8, seed=100, width=(120, 175), noise=18):
    """합성 장면 평가 → (클래스별 {'tp','fp','fn'}, 장면당 ms 리스트, [(장면, 정답, 결과)])."""
    rng = np.random.default_rng(seed)
    orb = cv.ORB_create(cfg['scene_features'])
    counts = {n: {'tp': 0, 'fp': 0, 'fn': 0} for n in products}
    times, records = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng, width=width, noise=noise)
        t = time.perf_counter()
        found = [r for r in recognize(scene, db, cfg, orb) if verify(svm, scene, r)]
        times.append((time.perf_counter() - t) * 1000)
        hit = set()
        for r in found:
            if iou(r['quad'], truth[r['name']]) > 0.5:
                counts[r['name']]['tp'] += 1
                hit.add(r['name'])
            else:
                counts[r['name']]['fp'] += 1
        for n in products:
            if n not in hit:
                counts[n]['fn'] += 1
        records.append((scene, truth, found))
    return counts, times, records


def annotate(scene, truth, found, title):
    """정답(흰 선) · 찾음(초록) · 놓침(빨간 글자)을 그리고 제목 띠를 붙인다."""
    vis = scene.copy()
    for name, q in truth.items():
        if name != 'unknown':
            cv.polylines(vis, [np.int32(q)], True, (255, 255, 255), 1, cv.LINE_AA)
    got = set()
    for r in found:
        cv.polylines(vis, [np.int32(r['quad'])], True, (0, 255, 0), 3, cv.LINE_AA)
        cv.putText(vis, r['name'], tuple(np.int32(r['quad'][0]) + [4, 22]), cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv.LINE_AA)
        got.add(r['name'])
    missed = [n for n in truth if n != 'unknown' and n not in got]
    if missed:
        cv.putText(vis, 'MISSED: ' + ', '.join(missed), (10, 465), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2, cv.LINE_AA)
    bar = np.full((40, vis.shape[1], 3), 40, np.uint8)
    cv.putText(bar, title, (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv.LINE_AA)
    tile = np.vstack([bar, vis])
    cv.rectangle(tile, (0, 0), (tile.shape[1] - 1, tile.shape[0] - 1), (0, 0, 255) if missed else (0, 160, 0), 6)
    return cv.resize(tile, None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA)


cv.setRNGSeed(0)
products = make_products()
db = build_db(products, CFG)
svm = train_verifier(products)
counts, times, records = evaluate(products, db, CFG, svm, n_scenes=6, seed=100)

tiles = []
for i, ((scene, truth, found), ms) in enumerate(zip(records, times)):
    n_ok = sum(1 for r in found if iou(r['quad'], truth[r['name']]) > 0.5)
    tiles.append(annotate(scene, truth, found, f'scene {i}: {n_ok}/4 found, {ms:.0f} ms'))

header = np.full((50, tiles[0].shape[1] * 3, 3), 255, np.uint8)
cv.putText(header, 'Smart Shelf results  (white = ground truth, green = found, red = missed)', (12, 33),
           cv.FONT_HERSHEY_SIMPLEX, 0.75, (30, 30, 30), 2, cv.LINE_AA)
montage = np.vstack([header, np.hstack(tiles[:3]), np.hstack(tiles[3:6])])
cv.imwrite('montage.png', montage)
print('montage.png 저장:', montage.shape)
print('놓친 경우:', [(i, [n for n in t if n != 'unknown' and n not in {r['name'] for r in f}]) for i, (s, t, f) in enumerate(records)])
cv.imshow('result montage', montage)
`, desc: '<p>빨간 테두리 칸을 확대해 보세요. 놓친 cookie 는 대부분 <b>작고 어둡게</b> 붙은 경우입니다 — 가로로 긴 상자라 화면에서 세로가 작아지고, 흑백이라 어두워지면 ORB 코너가 거의 나오지 않습니다. 이것이 발표의 “한계와 개선” 슬라이드 내용이 됩니다(개선 예: 상품별 ref_side, CLAHE 강화, ROI 재검출, AKAZE 비교).</p>' },
      { type: 'text', html: `
<h3>3. 발표용 차트 — 한 차트에 메시지 하나</h3>
<p>차트는 “무엇을 말하고 싶은가”를 먼저 정하고 그리는 것입니다. 심화 프로젝트에서 자주 쓰는 세 가지:</p>
<ul>
  <li><b>기준선 → 최종 비교 막대</b>: “우리가 한 일의 효과” (가장 중요)</li>
  <li><b>클래스별 P/R 막대</b>: “어디가 강하고 어디가 약한가”</li>
  <li><b>단계별 처리 시간 가로 막대</b>: “왜 실시간이 되는가 / 병목은 어디인가”</li>
</ul>
<p>규칙: 제목에 결론을 쓰기(예: “CLAHE: recall 0.88 → 0.94”), 막대 위에 숫자 표시, 축 이름과 단위, 0 에서 시작하는 축. 차트의 글자는 영어로(웹 환경에 한글 폰트 없음). 수치는 앞 교시들의 평가 결과를 옮겨 적었습니다.</p>` },
      { type: 'code', title: '예제 3 · 발표용 차트 3종: 기준선 대비 · 클래스별 · 단계별 시간', code: String.raw`
import numpy as np
from matplotlib import pyplot as plt

# 앞 교시에서 측정한 값을 옮겨 적은 표 (실행 환경에 따라 조금씩 다를 수 있음)
baseline_vs_final = {                         # 합성 장면 40장 (a5-1 설정, SVM 검증 전), 재현율 · 정밀도
    'baseline\n(no CLAHE)': (0.88, 0.98),
    'final\n(CLAHE)': (0.94, 0.99),
}
per_class = {'cookie': (1.00, 0.50), 'graffiti': (1.00, 1.00), 'soccer': (1.00, 1.00), 'tea': (1.00, 1.00)}   # 예제 1 (P, R)
stage_ms = {'prep': 0.7, 'orb': 7.5, 'match': 5.8, 'homography': 3.0, 'draw': 0.8}                          # a5-3 예제 1


def bar_labels(ax, bars, fmt='{:.2f}'):
    for b in bars:
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.01, fmt.format(b.get_height()), ha='center', va='bottom', fontsize=9)


fig, axes = plt.subplots(1, 3, figsize=(14, 4.2))

ax = axes[0]
names = list(baseline_vs_final)
x = np.arange(len(names))
b1 = ax.bar(x - 0.18, [v[0] for v in baseline_vs_final.values()], 0.36, label='recall')
b2 = ax.bar(x + 0.18, [v[1] for v in baseline_vs_final.values()], 0.36, label='precision')
bar_labels(ax, b1)
bar_labels(ax, b2)
ax.set_xticks(x)
ax.set_xticklabels(names)
ax.set_ylim(0, 1.12)
ax.set_title('Recall 0.88 -> 0.94 with CLAHE')
ax.legend(loc='lower right')

ax = axes[1]
names = list(per_class)
x = np.arange(len(names))
b1 = ax.bar(x - 0.18, [v[0] for v in per_class.values()], 0.36, label='precision')
b2 = ax.bar(x + 0.18, [v[1] for v in per_class.values()], 0.36, label='recall', color='tab:orange')
bar_labels(ax, b1)
bar_labels(ax, b2)
ax.set_xticks(x)
ax.set_xticklabels(names)
ax.set_ylim(0, 1.12)
ax.set_title('Weak spot: cookie recall 0.50')
ax.legend(loc='lower right')

ax = axes[2]
names = list(stage_ms)
b = ax.barh(names, list(stage_ms.values()), color=['tab:red' if v == max(stage_ms.values()) else 'tab:gray' for v in stage_ms.values()])
for rect, v in zip(b, stage_ms.values()):
    ax.text(v + 0.1, rect.get_y() + rect.get_height() / 2, f'{v:.1f} ms', va='center', fontsize=9)
ax.invert_yaxis()
ax.set_xlabel('ms per frame (PC)')
ax.set_title(f'Bottleneck: ORB ({100 * stage_ms["orb"] / sum(stage_ms.values()):.0f}% of {sum(stage_ms.values()):.0f} ms)')

plt.tight_layout()
plt.savefig('charts.png', dpi=100)
plt.show()
print('charts.png 로도 저장했습니다 (가상 폴더).')
`, desc: '<p>세 차트의 제목이 모두 <b>결론 문장</b>입니다. 청중은 제목만 읽어도 메시지를 가져갑니다. 팀 프로젝트에서는 딕셔너리의 숫자만 자기 결과로 바꾸면 같은 차트가 나옵니다. 막대가 너무 많아지면(클래스 10개 이상) 가장 약한 3개와 평균만 보여 주세요.</p>' },
      { type: 'code', title: '예제 4 · 파이프라인 단계 그림: 입력 → 특징점 → 매칭 → 검증 조각 → 최종', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑥ SVM 검증 + 평가 (a5-2 · a5-5) =====
def iou(q1, q2):
    """볼록 사각형 두 개의 IoU."""
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


def train_verifier(products, seed=1):
    """증강 조각으로 SVM(RBF, C=10, gamma=1) 검증기를 학습한다."""
    X, y = build_train(products, np.random.default_rng(seed), n_per=25, n_none=40)
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(10)
    svm.setGamma(1.0)
    svm.train(X, cv.ml.ROW_SAMPLE, y)
    return svm


def verify(svm, frame, r):
    """찾은 사각형을 펴서 SVM 이 같은 상품이라고 하면 True."""
    return CLASSES[int(svm.predict(extract(rectify(frame, r['quad']))[None])[1][0, 0])] == r['name']


def evaluate(products, db, cfg, svm, n_scenes=8, seed=100, width=(120, 175), noise=18):
    """합성 장면 평가 → (클래스별 {'tp','fp','fn'}, 장면당 ms 리스트, [(장면, 정답, 결과)])."""
    rng = np.random.default_rng(seed)
    orb = cv.ORB_create(cfg['scene_features'])
    counts = {n: {'tp': 0, 'fp': 0, 'fn': 0} for n in products}
    times, records = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng, width=width, noise=noise)
        t = time.perf_counter()
        found = [r for r in recognize(scene, db, cfg, orb) if verify(svm, scene, r)]
        times.append((time.perf_counter() - t) * 1000)
        hit = set()
        for r in found:
            if iou(r['quad'], truth[r['name']]) > 0.5:
                counts[r['name']]['tp'] += 1
                hit.add(r['name'])
            else:
                counts[r['name']]['fp'] += 1
        for n in products:
            if n not in hit:
                counts[n]['fn'] += 1
        records.append((scene, truth, found))
    return counts, times, records


def label_tile(img, text, size=(400, 300)):
    """비율을 유지해 size 칸에 넣고 위에 단계 이름 띠를 붙인다."""
    if img.ndim == 2:
        img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    w, h = size
    s = min(w / img.shape[1], (h - 30) / img.shape[0])
    small = cv.resize(img, (int(img.shape[1] * s), int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    tile = np.full((h, w, 3), 255, np.uint8)
    y0, x0 = 30 + (h - 30 - small.shape[0]) // 2, (w - small.shape[1]) // 2
    tile[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    cv.rectangle(tile, (0, 0), (w, 28), (60, 60, 60), -1)
    cv.putText(tile, text, (8, 20), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv.LINE_AA)
    return tile


cv.setRNGSeed(0)
products = make_products()
db = build_db(products, CFG)
svm = train_verifier(products)
scene, truth = make_scene(products, np.random.default_rng(3))

gray = prep_gray(scene, CFG)
kp, _ = cv.ORB_create(CFG['scene_features']).detectAndCompute(gray, None)
stage_kp = cv.drawKeypoints(scene, kp, None, (0, 255, 0))
found = recognize(scene, db, CFG)

r0 = max(found, key=lambda r: r['inliers'])                             # 인라이어가 가장 많은 상품의 매칭 그림
ref = products[r0['name']]
kp_ref = [cv.KeyPoint(float(x), float(y), 8) for x, y in r0['src']]
kp_scn = [cv.KeyPoint(float(x), float(y), 8) for x, y in r0['dst']]
matches = [cv.DMatch(i, i, 0) for i in range(len(kp_ref))]
stage_match = cv.drawMatches(ref, kp_ref, scene, kp_scn, matches, None, matchColor=(0, 255, 0), flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)

crops = []
final = scene.copy()
for r in found:
    crop = cv.resize(rectify(scene, r['quad']), (120, 120), interpolation=cv.INTER_NEAREST)
    ok = verify(svm, scene, r)
    cv.putText(crop, ('OK ' if ok else 'NO ') + r['name'], (4, 16), cv.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0) if ok else (0, 0, 255), 1, cv.LINE_AA)
    crops.append(crop)
    if ok:
        cv.polylines(final, [np.int32(r['quad'])], True, (0, 255, 0), 3, cv.LINE_AA)
        cv.putText(final, r['name'], tuple(np.int32(r['quad'][0]) + [4, 24]), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv.LINE_AA)
stage_crops = np.hstack(crops) if crops else np.zeros((120, 120, 3), np.uint8)

tiles = [label_tile(scene, '1. input (640x480)'),
         label_tile(stage_kp, f'2. ORB keypoints ({len(kp)})'),
         label_tile(stage_match, f'3. matches: {r0["name"]} ({r0["inliers"]} inliers)'),
         label_tile(stage_crops, '4. rectified crops + SVM check'),
         label_tile(final, f'5. result: {len(found)} products'),
         label_tile(products[r0['name']], '(reference image)')]
pipeline = np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])])
cv.imwrite('pipeline.png', pipeline)
print('pipeline.png 저장', pipeline.shape)
cv.imshow('pipeline stages', pipeline)
`, desc: '<p>“접근 방법” 슬라이드는 이 그림 한 장이면 충분합니다. 각 칸 제목에 <b>숫자</b>(키포인트 수, 인라이어 수, 찾은 개수)를 넣어 “이 단계에서 무엇이 일어났는지”를 말하게 하세요. 매칭 그림은 인라이어만 그려야 깔끔합니다 — 인식 결과의 <code>src/dst</code> 를 KeyPoint · DMatch 로 바꿔 <code>drawMatches</code> 에 넣었습니다.</p>' },
      { type: 'text', html: `
<h3>4. 발표 구성과 데모 백업 계획</h3>
<p>발표는 7분입니다(a5-7). 심화 프로젝트는 설명할 기술이 많아 시간이 모자라기 쉬우니, <b>“문제 → 결과 한 장 → 방법 → 데모 → 숫자 → 한계”</b> 순서로 결과를 먼저 보여 주세요.</p>
<table>
<tr><th>슬라이드</th><th>시간</th><th>내용</th><th>이번 교시 산출물</th></tr>
<tr><td>1. 표지 · 한 장 요약</td><td>0:30</td><td>프로젝트 이름, 팀원, 결과 이미지 한 장</td><td>montage.png 중 가장 좋은 칸</td></tr>
<tr><td>2. 문제와 데이터</td><td>0:50</td><td>무엇을 · 왜 · 어떤 데이터(장수, 만든 방법)</td><td>평가 보고서의 “데이터” 줄</td></tr>
<tr><td>3. 파이프라인</td><td>1:20</td><td>단계 그림 + 기술 선택 이유(1~3주차 기술)</td><td>pipeline.png</td></tr>
<tr><td>4. 라이브 데모</td><td>1:50</td><td>웹캠/동영상 실행, 트랙바 · 클릭 시연</td><td>a5-3 · a5-4 process</td></tr>
<tr><td>5. 정량 결과</td><td>1:30</td><td>기준선 대비 · 클래스별 · 속도</td><td>평가표, charts.png</td></tr>
<tr><td>6. 한계와 다음 단계</td><td>1:00</td><td>실패 사례 2개와 원인 · 개선 아이디어, 배운 점</td><td>montage.png 빨간 칸</td></tr>
</table>
<p><b>데모 백업 계획</b>: 라이브 데모는 조명 · 카메라 권한 · 네트워크 때문에 실패할 수 있습니다. ① 입력을 🎞️ 동영상으로 바꾸는 방법을 연습하고, ② 입력이 비었거나 너무 어두우면 <b>저장된 장면으로 자동 전환</b>하는 코드를 넣고(예제 5), ③ 최악의 경우를 위해 결과 이미지(montage · pipeline)를 슬라이드에 넣어 둡니다.</p>` },
      { type: 'code', title: '예제 5 · 데모 백업: 입력이 이상하면 저장된 장면으로 자동 전환하는 process(frame)', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

products = make_products()
db = build_db(products, CFG)
BACKUP = [make_scene(products, np.random.default_rng(s))[0] for s in (0, 2, 3)]   # 미리 만들어 둔 백업 장면
STATE = {'n': 0, 'backup_frames': 0}


def input_problem(frame):
    """입력이 쓸 수 없는 상태면 이유 문자열, 괜찮으면 None."""
    if frame is None or frame.size == 0:
        return 'no frame'
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    if gray.mean() < 25:
        return f'too dark (mean {gray.mean():.0f})'
    if gray.std() < 8:
        return f'flat image (std {gray.std():.1f})'
    return None


def process(frame):
    t0 = time.perf_counter()
    problem = input_problem(frame)
    if problem:
        frame = BACKUP[(STATE['n'] // 30) % len(BACKUP)].copy()           # 30 프레임마다 다음 백업 장면
        STATE['backup_frames'] += 1
    else:
        frame = frame.copy()
    STATE['n'] += 1

    found = recognize(frame, db, CFG)
    for r in found:
        cv.polylines(frame, [np.int32(r['quad'])], True, (0, 255, 0), 3, cv.LINE_AA)
        cv.putText(frame, r['name'], tuple(np.int32(r['quad'][0]) + [4, 24]), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv.LINE_AA)

    ms = (time.perf_counter() - t0) * 1000
    h, w = frame.shape[:2]
    if problem:
        cv.rectangle(frame, (0, 0), (w, 36), (0, 0, 180), -1)
        cv.putText(frame, f'BACKUP MODE: {problem}', (10, 25), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
    cv.putText(frame, f'{len(found)} items  {ms:.0f} ms', (10, h - 12), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv.LINE_AA)
    return frame


# 발표 전 점검: 어두운 입력 · 빈 입력에서도 오류 없이 백업으로 넘어가는지 미리 시험
for test_name, test_frame in [('dark', np.full((480, 640, 3), 5, np.uint8)), ('flat', np.full((480, 640, 3), 128, np.uint8)),
                              ('normal', BACKUP[0])]:
    out = process(test_frame)
    print(f'{test_name:6s} → problem={input_problem(test_frame)}, output {out.shape}')
cv.imshow('backup mode test (dark input)', process(np.full((480, 640, 3), 5, np.uint8)))
print('입력 소스를 📷 웹캠으로 두고 렌즈를 손으로 가려 보세요 → BACKUP MODE 로 전환됩니다.')
`, desc: '<p>렌즈를 가리거나 카메라가 검은 화면을 보내면 빨간 <b>BACKUP MODE</b> 띠와 함께 미리 만든 장면이 돌아가므로, 발표 흐름이 끊기지 않습니다. 코드 아래쪽처럼 <b>일부러 나쁜 입력을 넣어 보는 리허설</b>을 발표 전에 꼭 하세요. 팀 프로젝트에서는 백업 장면 대신 미리 저장한 시연 이미지 · 동영상을 쓰면 됩니다.</p>' },
      { type: 'checklist', title: '결과 정리 · 발표 준비 점검 목록', items: [
        '정량 평가표: 데이터 설명 · 판정 기준 · 클래스별 지표 · 평균 · 처리 시간이 있다',
        '기준선(4주차 프로토타입) 대비 개선 수치가 있다',
        '성공 사례와 실패 사례가 함께 있는 몽타주를 저장했다 (imwrite)',
        '발표용 차트의 제목이 결론 문장이고, 막대에 숫자가 표시된다',
        '파이프라인 단계 그림에 단계별 숫자(점 수 · 인라이어 · 결과 수)가 있다',
        '한계 슬라이드에 실패 원인과 개선 아이디어가 있다',
        '데모 입력이 실패하면 동영상 · 백업 장면으로 바꾸는 방법을 리허설했다',
        '발표 7분 구성과 담당자를 정하고 한 번 이상 시간을 재며 연습했다',
      ] },
    ],
    practice: [
      {
        title: '실습 1 · 평가표를 F1 순으로 정렬하고 약점 요약 문장 만들기',
        desc: `<p>팀의 클래스별 TP/FP/FN 이 딕셔너리로 주어졌습니다. <code>report(counts)</code> 를 완성해 ① 클래스별 P · R · F1 을 계산하고 ② <b>F1 이 낮은 순</b>으로 정렬해 마크다운 표로 출력하고 ③ 가장 약한 클래스에 대해 “bottle 은 재현율 0.55 로 가장 약함(놓침 9개)” 같은 요약 문장을 출력하세요.</p>`,
        starter: String.raw`
counts = {
    'can':    {'tp': 18, 'fp': 1, 'fn': 2},
    'bottle': {'tp': 11, 'fp': 0, 'fn': 9},
    'snack':  {'tp': 17, 'fp': 5, 'fn': 3},
    'box':    {'tp': 20, 'fp': 0, 'fn': 0},
}


def report(counts):
    rows = []
    for name, c in counts.items():
        # TODO 1: P, R, F1 계산 (0 으로 나누기 주의)
        P = R = F = 0.0
        rows.append((name, c, P, R, F))
    # TODO 2: F1 낮은 순으로 정렬
    print('| class | TP | FP | FN | P | R | F1 |')
    print('|---|---|---|---|---|---|---|')
    for name, c, P, R, F in rows:
        print(f'| {name} | {c["tp"]} | {c["fp"]} | {c["fn"]} | {P:.2f} | {R:.2f} | {F:.2f} |')
    # TODO 3: 가장 약한 클래스 요약 문장 (재현율이 낮으면 놓침, 정밀도가 낮으면 오검출 강조)


report(counts)
`,
        hint: `<p><code>rows.sort(key=lambda r: r[4])</code> 로 F1 오름차순. 요약: <code>name, c, P, R, F = rows[0]</code> 후 <code>if R &lt; P:</code> 이면 “재현율 … (놓침 fn 개)”, 아니면 “정밀도 … (오검출 fp 개)”.</p>`,
        solution: String.raw`
counts = {
    'can':    {'tp': 18, 'fp': 1, 'fn': 2},
    'bottle': {'tp': 11, 'fp': 0, 'fn': 9},
    'snack':  {'tp': 17, 'fp': 5, 'fn': 3},
    'box':    {'tp': 20, 'fp': 0, 'fn': 0},
}


def report(counts):
    rows = []
    for name, c in counts.items():
        P = c['tp'] / max(c['tp'] + c['fp'], 1)
        R = c['tp'] / max(c['tp'] + c['fn'], 1)
        F = 2 * P * R / max(P + R, 1e-9)
        rows.append((name, c, P, R, F))
    rows.sort(key=lambda r: r[4])
    print('| class | TP | FP | FN | P | R | F1 |')
    print('|---|---|---|---|---|---|---|')
    for name, c, P, R, F in rows:
        print(f'| {name} | {c["tp"]} | {c["fp"]} | {c["fn"]} | {P:.2f} | {R:.2f} | {F:.2f} |')
    name, c, P, R, F = rows[0]
    if R < P:
        print(f'\n요약: {name} 은 재현율 {R:.2f} 로 가장 약함 (놓침 {c["fn"]}개) → 다양한 각도 · 조명 데이터 보강')
    else:
        print(f'\n요약: {name} 은 정밀도 {P:.2f} 로 가장 약함 (오검출 {c["fp"]}개) → 검증 단계 · 임계값 강화')


report(counts)
`,
      },
      {
        title: '실습 2 · 실패 사례 갤러리 만들기',
        desc: `<p>조금 어려운 장면(가로 110~160px, 잡음 ±20) 8장을 평가해 <b>놓친 상품이 있는 장면만</b> 모아 갤러리를 만드세요. 칸마다 놓친 상품의 정답 사각형을 <b>빨간색</b>으로 그리고, 제목에 “scene 3 missed: cookie, tea” 처럼 적습니다. 갤러리를 <code>failures.png</code> 로 저장하면 성공입니다.</p>`,
        starter: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑥ SVM 검증 + 평가 (a5-2 · a5-5) =====
def iou(q1, q2):
    """볼록 사각형 두 개의 IoU."""
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


def train_verifier(products, seed=1):
    """증강 조각으로 SVM(RBF, C=10, gamma=1) 검증기를 학습한다."""
    X, y = build_train(products, np.random.default_rng(seed), n_per=25, n_none=40)
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(10)
    svm.setGamma(1.0)
    svm.train(X, cv.ml.ROW_SAMPLE, y)
    return svm


def verify(svm, frame, r):
    """찾은 사각형을 펴서 SVM 이 같은 상품이라고 하면 True."""
    return CLASSES[int(svm.predict(extract(rectify(frame, r['quad']))[None])[1][0, 0])] == r['name']


def evaluate(products, db, cfg, svm, n_scenes=8, seed=100, width=(120, 175), noise=18):
    """합성 장면 평가 → (클래스별 {'tp','fp','fn'}, 장면당 ms 리스트, [(장면, 정답, 결과)])."""
    rng = np.random.default_rng(seed)
    orb = cv.ORB_create(cfg['scene_features'])
    counts = {n: {'tp': 0, 'fp': 0, 'fn': 0} for n in products}
    times, records = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng, width=width, noise=noise)
        t = time.perf_counter()
        found = [r for r in recognize(scene, db, cfg, orb) if verify(svm, scene, r)]
        times.append((time.perf_counter() - t) * 1000)
        hit = set()
        for r in found:
            if iou(r['quad'], truth[r['name']]) > 0.5:
                counts[r['name']]['tp'] += 1
                hit.add(r['name'])
            else:
                counts[r['name']]['fp'] += 1
        for n in products:
            if n not in hit:
                counts[n]['fn'] += 1
        records.append((scene, truth, found))
    return counts, times, records

cv.setRNGSeed(0)
products = make_products()
db = build_db(products, CFG)
svm = train_verifier(products)
counts, times, records = evaluate(products, db, CFG, svm, n_scenes=8, seed=5, width=(110, 160), noise=20)

tiles = []
for i, (scene, truth, found) in enumerate(records):
    hit = {r['name'] for r in found if iou(r['quad'], truth[r['name']]) > 0.5}
    missed = [n for n in products if n not in hit]
    # TODO 1: missed 가 없으면 건너뛰기
    # TODO 2: 놓친 상품의 정답 사각형(truth[n])을 빨간색 두께 4 로 그리기
    # TODO 3: 위에 제목 띠('scene i missed: ...')를 붙이고 절반 크기로 줄여 tiles 에 추가
    tiles.append(cv.resize(scene, None, fx=0.5, fy=0.5))

print('실패 장면 수:', len(tiles))
while len(tiles) % 3:
    tiles.append(np.zeros_like(tiles[0]))
gallery = np.vstack([np.hstack(tiles[r:r + 3]) for r in range(0, len(tiles), 3)])
cv.imshow('failure gallery', gallery)
`,
        hint: `<p><code>if not missed: continue</code>. 제목 띠: <code>bar = np.full((40, 640, 3), 40, np.uint8)</code> 에 putText 후 <code>np.vstack([bar, vis])</code>. 모든 칸의 크기가 같아야 hstack 이 됩니다(640×520 → 절반 320×260).</p>`,
        solution: String.raw`
import time
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ② 조각 · 특징 · 데이터셋 (a5-1) =====
HOG = cv.HOGDescriptor((64, 64), (32, 32), (16, 16), (16, 16), 9)


def augment(img, rng, size=64, jitter=0.06):
    """원근 · 밝기 · 잡음으로 흔든 size×size 조각."""
    h, w = img.shape[:2]
    dst = np.float32([[0, 0], [size, 0], [size, size], [0, size]])
    dst += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * size
    M = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
    out = cv.warpPerspective(img, M, (size, size), borderMode=cv.BORDER_REPLICATE)
    out = cv.convertScaleAbs(out, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    return add_noise(out, rng)


def rectify(frame, quad, size=64):
    """장면의 사각형(quad)을 size×size 정면 조각으로 편다."""
    M = cv.getPerspectiveTransform(np.float32(quad), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return cv.warpPerspective(frame, M, (size, size))


def extract(crop):
    """조각 → [H×S 색 히스토그램 32 | HOG 324] = 356차원 float32."""
    hsv = cv.cvtColor(crop, cv.COLOR_BGR2HSV)
    hsv[:, :, 0][hsv[:, :, 1] < 40] = 0              # 채도가 낮은(회색) 픽셀의 색상(H)은 잡음 → 0 으로
    h = cv.calcHist([hsv], [0, 1], None, [8, 4], [0, 180, 0, 256]).ravel()
    hog = HOG.compute(cv.cvtColor(crop, cv.COLOR_BGR2GRAY)).ravel()
    return np.concatenate([h / (h.sum() + 1e-6), hog]).astype(np.float32)


def build_train(products, rng, n_per=40, n_none=60):
    """증강 조각 학습 세트 → (X float32 N×356, y int32 N)."""
    X, y = [], []
    for name, img in products.items():
        for _ in range(n_per):
            X.append(extract(augment(img, rng)))
            y.append(CLASSES.index(name))
    pool = [make_shelf(), cv.imread('fruits.jpg'), cv.imread('home.jpg'), cv.imread('baboon.jpg')]
    for i in range(n_none):
        im = pool[i % len(pool)]
        s = int(rng.uniform(60, 200))
        x, yy = int(rng.uniform(0, im.shape[1] - s)), int(rng.uniform(0, im.shape[0] - s))
        X.append(extract(augment(im[yy:yy + s, x:x + s], rng)))
        y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)


def build_test(products, rng, n_scenes=6):
    """합성 장면에서 잘라낸 조각 테스트 세트 (정답 꼭짓점 + 3px 오차, 빈 선반 조각 포함)."""
    X, y = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng)
        for name, quad in truth.items():
            X.append(extract(rectify(scene, quad + rng.normal(0, 3, quad.shape).astype(np.float32))))
            y.append(CLASSES.index(name) if name in products else CLASSES.index('none'))
        for _ in range(2):
            x0, y0, s = rng.uniform(0, 540), rng.uniform(0, 380), rng.uniform(60, 100)
            X.append(extract(rectify(scene, np.float32([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]]))))
            y.append(CLASSES.index('none'))
    return np.array(X, np.float32), np.array(y, np.int32)

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ===== 스마트 선반 공통 도구 ⑥ SVM 검증 + 평가 (a5-2 · a5-5) =====
def iou(q1, q2):
    """볼록 사각형 두 개의 IoU."""
    inter, _ = cv.intersectConvexConvex(np.float32(q1), np.float32(q2))
    union = cv.contourArea(np.float32(q1)) + cv.contourArea(np.float32(q2)) - inter
    return inter / max(union, 1e-6)


def train_verifier(products, seed=1):
    """증강 조각으로 SVM(RBF, C=10, gamma=1) 검증기를 학습한다."""
    X, y = build_train(products, np.random.default_rng(seed), n_per=25, n_none=40)
    svm = cv.ml.SVM_create()
    svm.setKernel(cv.ml.SVM_RBF)
    svm.setC(10)
    svm.setGamma(1.0)
    svm.train(X, cv.ml.ROW_SAMPLE, y)
    return svm


def verify(svm, frame, r):
    """찾은 사각형을 펴서 SVM 이 같은 상품이라고 하면 True."""
    return CLASSES[int(svm.predict(extract(rectify(frame, r['quad']))[None])[1][0, 0])] == r['name']


def evaluate(products, db, cfg, svm, n_scenes=8, seed=100, width=(120, 175), noise=18):
    """합성 장면 평가 → (클래스별 {'tp','fp','fn'}, 장면당 ms 리스트, [(장면, 정답, 결과)])."""
    rng = np.random.default_rng(seed)
    orb = cv.ORB_create(cfg['scene_features'])
    counts = {n: {'tp': 0, 'fp': 0, 'fn': 0} for n in products}
    times, records = [], []
    for _ in range(n_scenes):
        scene, truth = make_scene(products, rng, width=width, noise=noise)
        t = time.perf_counter()
        found = [r for r in recognize(scene, db, cfg, orb) if verify(svm, scene, r)]
        times.append((time.perf_counter() - t) * 1000)
        hit = set()
        for r in found:
            if iou(r['quad'], truth[r['name']]) > 0.5:
                counts[r['name']]['tp'] += 1
                hit.add(r['name'])
            else:
                counts[r['name']]['fp'] += 1
        for n in products:
            if n not in hit:
                counts[n]['fn'] += 1
        records.append((scene, truth, found))
    return counts, times, records

cv.setRNGSeed(0)
products = make_products()
db = build_db(products, CFG)
svm = train_verifier(products)
counts, times, records = evaluate(products, db, CFG, svm, n_scenes=8, seed=5, width=(110, 160), noise=20)

tiles = []
for i, (scene, truth, found) in enumerate(records):
    hit = {r['name'] for r in found if iou(r['quad'], truth[r['name']]) > 0.5}
    missed = [n for n in products if n not in hit]
    if not missed:
        continue
    vis = scene.copy()
    for n in missed:
        cv.polylines(vis, [np.int32(truth[n])], True, (0, 0, 255), 4, cv.LINE_AA)
    for r in found:
        cv.polylines(vis, [np.int32(r['quad'])], True, (0, 255, 0), 2, cv.LINE_AA)
    bar = np.full((40, vis.shape[1], 3), 40, np.uint8)
    cv.putText(bar, f'scene {i} missed: ' + ', '.join(missed), (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2, cv.LINE_AA)
    tiles.append(cv.resize(np.vstack([bar, vis]), None, fx=0.5, fy=0.5, interpolation=cv.INTER_AREA))

print('실패 장면 수:', len(tiles), '/ 전체', len(records))
if tiles:
    while len(tiles) % 3:
        tiles.append(np.zeros_like(tiles[0]))
    gallery = np.vstack([np.hstack(tiles[r:r + 3]) for r in range(0, len(tiles), 3)])
    cv.imwrite('failures.png', gallery)
    cv.imshow('failure gallery', gallery)
`,
      },
      {
        title: '실습 3 · 발표 표지(타이틀 카드) 만들기',
        desc: `<p>발표 첫 슬라이드용 1280×720 타이틀 카드를 코드로 만드세요. 들어갈 것: 프로젝트 이름(크게), 한 줄 소개, 팀원, 그리고 <b>핵심 숫자 3개</b>를 카드 모양 상자로(예: “Recall 0.94”, “Precision 0.99”, “15 ms/frame”). 오른쪽에는 결과 이미지(합성 장면 인식 결과)를 넣고 <code>title_card.png</code> 로 저장합니다. 글자는 영어로 쓰세요.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np

INFO = {'title': 'Smart Shelf', 'tagline': 'Find products on a shelf with ORB + SVM + solvePnP',
        'team': 'Team 3: Kim / Lee / Park',
        'metrics': [('Recall', '0.94'), ('Precision', '0.99'), ('Speed', '15 ms')]}

card = np.full((720, 1280, 3), (40, 30, 20), np.uint8)
cv.putText(card, INFO['title'], (60, 150), cv.FONT_HERSHEY_DUPLEX, 3.0, (255, 255, 255), 4, cv.LINE_AA)
# TODO 1: tagline(0.9 크기)과 team(0.8 크기, 강조색) 쓰기
# TODO 2: metrics 3개를 (60 + 230*i, 420) 위치에 200×140 상자로: 큰 숫자 + 작은 이름
# TODO 3: 오른쪽(가로 700~1240, 세로 200~620)에 결과 이미지 넣기 (box_in_scene.png 로 대신해도 됨)
cv.imwrite('title_card.png', card)
cv.imshow('title card', card)
`,
        hint: `<p>상자: <code>cv.rectangle(card, (x, 420), (x + 200, 560), (80, 60, 40), -1)</code> 후 숫자는 <code>cv.putText(..., (x + 20, 500), cv.FONT_HERSHEY_DUPLEX, 1.6, ...)</code>. 이미지 넣기: <code>img = cv.resize(img, (540, 420))</code> → <code>card[200:620, 700:1240] = img</code>.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np

INFO = {'title': 'Smart Shelf', 'tagline': 'Find products on a shelf with ORB + SVM + solvePnP',
        'team': 'Team 3: Kim / Lee / Park',
        'metrics': [('Recall', '0.94'), ('Precision', '0.99'), ('Speed', '15 ms')]}
ACCENT = (0, 180, 255)

card = np.full((720, 1280, 3), (40, 30, 20), np.uint8)
cv.putText(card, INFO['title'], (60, 150), cv.FONT_HERSHEY_DUPLEX, 3.0, (255, 255, 255), 4, cv.LINE_AA)
cv.putText(card, INFO['tagline'], (64, 215), cv.FONT_HERSHEY_SIMPLEX, 0.9, (220, 220, 220), 2, cv.LINE_AA)
cv.putText(card, INFO['team'], (64, 265), cv.FONT_HERSHEY_SIMPLEX, 0.8, ACCENT, 2, cv.LINE_AA)
cv.line(card, (60, 300), (640, 300), ACCENT, 3)
for i, (name, value) in enumerate(INFO['metrics']):
    x = 60 + 200 * i
    cv.rectangle(card, (x, 420), (x + 180, 560), (80, 60, 40), -1)
    cv.rectangle(card, (x, 420), (x + 180, 560), ACCENT, 2)
    cv.putText(card, value, (x + 15, 500), cv.FONT_HERSHEY_DUPLEX, 1.4, (255, 255, 255), 2, cv.LINE_AA)
    cv.putText(card, name, (x + 15, 540), cv.FONT_HERSHEY_SIMPLEX, 0.7, ACCENT, 2, cv.LINE_AA)
img = cv.imread('box_in_scene.png')
img = cv.resize(img, (540, 420), interpolation=cv.INTER_AREA)
card[200:620, 700:1240] = img
cv.rectangle(card, (700, 200), (1240, 620), (255, 255, 255), 3)
cv.imwrite('title_card.png', card)
cv.imshow('title card', card)
`,
      },
    ],
    quiz: [
      { q: '발표의 정량 결과 슬라이드에 반드시 함께 적어야 하는 것으로 가장 알맞은 묶음은?', options: ['사용한 노트북 사양과 브라우저 종류', '평가 데이터(장수 · 만든 방법)와 판정 기준(예: IoU>0.5), 기준선 대비 수치', '코드 줄 수와 함수 개수', '팀원별 작업 시간'], answer: 1, explain: '같은 “정확도 94%”라도 어떤 데이터와 기준으로 쟀는지, 무엇보다 얼마나 좋아졌는지가 있어야 의미가 생깁니다.' },
      { q: '결과 몽타주에 실패 사례를 넣는 가장 큰 이유는?', options: ['슬라이드를 채우기 위해', '한계와 원인을 보여 주어 결과의 신뢰도를 높이고 개선 방향을 설명하기 위해', '청중의 동정을 얻기 위해', '성공 사례가 부족해서'], answer: 1, explain: '성공만 보여 주면 “고른 결과”로 의심받습니다. 실패의 공통점(작다 · 어둡다 · 기울었다)을 분석해 보여 주면 이해도와 신뢰를 동시에 보여 줄 수 있습니다.' },
      { q: '발표용 차트의 제목으로 가장 좋은 것은?', options: ['“Chart 1”', '“Results”', '“Recall 0.88 → 0.94 with CLAHE”', '“막대 그래프”'], answer: 2, explain: '제목에 결론을 쓰면 청중이 차트를 해석하는 시간을 줄여 줍니다.' },
      { q: '라이브 데모 직전 웹캠이 검은 화면만 보냅니다. 준비된 팀의 대응으로 가장 알맞은 것은?', options: ['코드를 즉석에서 고친다', '발표를 중단한다', '자동 백업 모드(저장된 장면) 또는 동영상 입력으로 전환하고, 결과 이미지 슬라이드로 설명을 이어간다', '청중에게 웹캠을 빌린다'], answer: 2, explain: '데모 실패는 흔합니다. 백업 입력 · 백업 이미지를 미리 준비하고 전환을 리허설한 팀은 흐름을 잃지 않습니다.' },
    ],
  },
  // =====================================================================
  // a5-7 프로젝트 발표회
  // =====================================================================
  {
    id: 'a5-7',
    assets: ['images/adv/box.png', 'images/adv/graf1.jpg'],
    summary: '심화 팀 프로젝트 발표회입니다. 진행 순서와 7분 발표 형식, 라이브 데모 점검, 질의응답 요령을 확인하고, 기능 완성도 · 기술 활용 · 정량 평가 · 실시간/인터랙션 · 발표 다섯 기준의 루브릭으로 동료 평가를 합니다. 발표 화면용 쇼케이스 템플릿과 동료 평가 집계 코드를 제공합니다.',
    goals: [
      '7분 형식에 맞춰 문제 · 방법 · 데모 · 정량 결과 · 한계를 전달할 수 있다',
      '데모 직전 점검 목록으로 실패 위험을 줄이고, 실패 시 백업 입력으로 전환할 수 있다',
      '다섯 기준 루브릭으로 다른 팀을 근거 있게 평가하고 구체적인 피드백을 쓸 수 있다',
      '쇼케이스 템플릿으로 타이틀 · 전후 비교 · 파이프라인 · 지표를 한 화면에 보여 줄 수 있다',
    ],
    schedule: [['준비 · 장비 점검', 4], ['팀 발표와 질의응답 (팀당 7분 + 2분)', 36], ['동료 평가 작성 · 집계', 5], ['강사 총평', 5]],
    blocks: [
      { type: 'text', html: `
<h3>1. 오늘의 진행</h3>
<p>한 팀당 <b>발표 7분 + 질의응답 2분</b>, 교대 1분입니다. 4팀 기준으로 이 교시 안에 끝나며, 팀이 더 많으면 a5-8 앞부분에서 이어서 발표합니다.</p>
<ul>
  <li><b>순서</b>는 시작 전에 추첨합니다. 다음 팀은 앞 팀의 질의응답 동안 브라우저를 열고 <b>Python 준비 완료 · 모델/이미지 로딩</b>을 끝내 둡니다.</li>
  <li><b>타임키퍼</b>가 5분에 🟡, 7분에 🔴 신호를 줍니다. 🔴 이 뜨면 “한계와 다음 단계” 한 문장으로 마무리합니다.</li>
  <li><b>청중</b>은 발표마다 동료 평가표(아래)를 채웁니다. 점수보다 <b>근거 한 줄</b>이 더 중요합니다.</li>
  <li>모든 팀원이 발표 · 데모 조작 · 질의응답 중 하나 이상을 맡습니다.</li>
</ul>` },
      { type: 'table', head: ['구간', '시간', '내용', '심화 프로젝트 팁'], rows: [
        ['① 표지 · 한 장 요약', '0:00 ~ 0:30', '프로젝트 이름, 팀원, 결과 이미지 한 장', '쇼케이스 화면(예제 1)으로 시작'],
        ['② 문제 · 데이터', '0:30 ~ 1:20', '무엇을 왜, 데이터 몇 장 · 어떻게 만들었나', '학습/테스트 분리 방법을 한 줄로'],
        ['③ 방법 · 파이프라인', '1:20 ~ 2:40', '단계 그림, 1~3주차 기술 선택 이유', '“왜 SIFT 가 아니라 ORB?” 같은 선택 근거'],
        ['④ 라이브 데모', '2:40 ~ 4:30', '웹캠/동영상, 트랙바 · 클릭 시연', 'HUD 에 FPS · 모드 표시, 백업 입력 준비'],
        ['⑤ 정량 결과', '4:30 ~ 6:00', '기준선 대비 · 클래스별 · 속도', '평가 데이터와 판정 기준 명시'],
        ['⑥ 한계 · 다음 단계', '6:00 ~ 7:00', '실패 사례와 원인, 개선 아이디어, 배운 점', '실패 몽타주 한 장'],
        ['질의응답', '7:00 ~ 9:00', '청중 질문 1~2개', '30초 안에, 모르면 “확인해 보겠다”'],
      ] },
      { type: 'checklist', title: '라이브 데모 직전 점검 (발표 5분 전)', items: [
        '강좌 페이지에서 해당 교시를 열어 assets(이미지 · 모델)가 로드되었고 Python 준비 완료 표시가 떴다',
        '최종 코드를 ▶ 실행해 오류가 없고, 준비 단계(학습 · DB 생성) 시간이 몇 초인지 알고 있다',
        '📷 웹캠 권한을 허용했고 조명 · 배경 · 시연 물체(인쇄물 · 휴대폰 화면)를 준비했다',
        '🎞️ 동영상 입력 또는 백업 모드로 전환하는 방법을 한 번 연습했다',
        '트랙바 기본값이 튜닝된 최적값이고, 현재 설정값이 화면에 표시된다',
        'calib.npz 같은 저장 파일이 필요하면 이번 페이지에서 다시 만들었다(새로 고침하면 사라짐)',
        '결과 이미지(showcase · montage · pipeline · charts)가 슬라이드에 들어 있다',
        '데모 조작 담당 · 설명 담당 · 질의응답 담당을 정했다',
      ] },
      { type: 'text', html: `
<h3>2. 평가 루브릭</h3>
<p>강사 평가와 동료 평가 모두 같은 다섯 기준을 씁니다. 각 기준을 <b>1~5점</b>으로 매기고 가중치를 곱해 100점으로 환산합니다. 점수 옆에는 반드시 <b>근거 한 줄</b>(“클래스별 재현율까지 보고함”, “데모에서 추적이 끊겼지만 원인을 설명함” 등)을 적으세요.</p>` },
      { type: 'table', head: ['기준 (가중치)', '5점 — 우수', '3점 — 보통', '1점 — 미흡'], rows: [
        ['<b>기능 완성도</b> (20%)', '기획한 핵심 기능이 모두 동작하고 나쁜 입력에도 오류가 없다', '핵심 기능은 동작하나 일부 입력에서 실패 · 오류', '핵심 기능이 동작하지 않거나 데모 불가'],
        ['<b>기술 활용</b> (25%) — 특징 · 3D · ML · 검출', '2개 이상 영역을 결합하고 각 선택의 이유를 비교 근거와 함께 설명', '1~2개 영역을 사용했으나 선택 이유가 약함', '튜토리얼 코드를 그대로 사용, 결합 없음'],
        ['<b>정량 평가</b> (20%)', '분리된 테스트 데이터 · 판정 기준 · 클래스별 지표 · 기준선 대비 개선을 제시', '정확도 등 지표는 있으나 데이터 · 기준 설명이나 비교가 부족', '“잘 된다” 수준의 주관적 평가만'],
        ['<b>실시간 · 인터랙션</b> (15%)', 'process(frame) 로 실시간 동작, FPS 표시, 트랙바 · 마우스로 조작 가능', '실시간이지만 느리거나 조작 기능이 제한적', '정지 이미지에서만 동작'],
        ['<b>발표</b> (20%)', '7분 안에 결과 → 방법 → 근거 순으로 명확, 실패 분석과 질의응답이 훌륭', '내용은 전달되나 시간 초과 · 구성이 산만', '핵심이 전달되지 않음'],
      ] },
      { type: 'text', html: `
<h3>3. 동료 평가표와 좋은 피드백</h3>
<p>발표가 끝난 직후 1분 안에 작성합니다. 형식(종이 또는 공유 문서):</p>
<ul>
  <li><b>팀 이름 / 평가자</b></li>
  <li><b>다섯 기준 점수</b>(1~5) + 기준마다 근거 한 줄</li>
  <li><b>가장 인상 깊었던 점</b> 1개 — 다른 팀이 배울 만한 기술 · 표현</li>
  <li><b>하나만 개선한다면</b> 1개 — 구체적인 행동으로(“ORB 대신 AKAZE 도 비교해 보면 좋겠다”, “테스트 데이터를 다른 날 찍으면 좋겠다”)</li>
  <li><b>질문</b>(선택) — 발표에서 못 한 질문</li>
</ul>
<p>좋은 피드백은 <b>관찰 → 영향 → 제안</b> 순서입니다: “데모에서 상품이 기울면 상자가 사라졌다(관찰) → 실제 매장에서는 자주 생길 상황이다(영향) → 추적(LK)이나 기울기 증강을 넣어 보면 어떨까(제안)”. 사람이 아니라 결과물에 대해 말하세요.</p>` },
      { type: 'code', title: '예제 1 · 발표 쇼케이스 화면: 타이틀 + 전후 비교 + 파이프라인 + 지표 패널', code: String.raw`
import cv2 as cv
import numpy as np

# ===== 스마트 선반 공통 도구 ① 데이터 (a5-1 에서 만든 함수) =====
CLASSES = ['cookie', 'graffiti', 'soccer', 'tea', 'none']
SLOTS = [(110, 125), (320, 125), (530, 125), (110, 355), (320, 355), (530, 355)]


def make_products():
    """상품 이름 → 정면 기준 이미지(BGR) 딕셔너리 (4종)."""
    cookie = cv.imread('box.png')
    graffiti = cv.resize(cv.imread('graf1.jpg')[40:472, 60:600], (270, 216))
    soccer = cv.resize(cv.imread('messi5.jpg')[0:342, 130:400], (216, 274))
    tea = np.full((260, 220, 3), 245, np.uint8)
    logo = cv.resize(cv.imread('opencv-logo.png', cv.IMREAD_UNCHANGED), (120, 159))
    m = logo[:, :, 3] > 128
    tea[20:179, 50:170][m] = logo[:, :, :3][m]
    cv.rectangle(tea, (0, 0), (219, 259), (40, 40, 160), 8)
    cv.putText(tea, 'MATCHA', (30, 212), cv.FONT_HERSHEY_DUPLEX, 1.1, (40, 40, 160), 2)
    cv.putText(tea, 'GREEN TEA 500ml', (18, 242), cv.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 1)
    return {'cookie': cookie, 'graffiti': graffiti, 'soccer': soccer, 'tea': tea}


def make_shelf(w=640, h=480):
    """나무 선반 배경 (그라데이션 + 선반 판 2개)."""
    ramp = np.linspace(1.0, 0.6, h, dtype=np.float32)[:, None, None]
    bg = np.empty((h, w, 3), np.uint8)
    bg[:] = (np.float32([70, 110, 150]) * ramp).astype(np.uint8)
    for y in (h // 2 - 10, h - 30):
        bg[y:y + 18] = (40, 60, 90)
    return bg


def random_quad(img, center, width, rng, jitter=0.12, max_angle=15):
    """img 를 가로 width 픽셀로 center 에 놓을 때의 네 꼭짓점 (원근 흔들림 + 회전)."""
    h, w = img.shape[:2]
    hw, hh = width / 2, width * h / w / 2
    pts = np.float32([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]])
    pts += rng.uniform(-jitter, jitter, (4, 2)).astype(np.float32) * np.float32([2 * hw, 2 * hh])
    a = np.deg2rad(rng.uniform(-max_angle, max_angle))
    R = np.float32([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return (pts @ R.T + np.float32(center)).astype(np.float32)


def paste(scene, img, quad, rng=None):
    """img 를 scene 의 quad 위치에 원근 변환해 붙인다 (rng 가 있으면 밝기 · 대비도 무작위)."""
    h, w = img.shape[:2]
    x, y, bw, bh = cv.boundingRect(np.int32(np.round(quad)))
    x0, y0 = max(x - 1, 0), max(y - 1, 0)
    x1, y1 = min(x + bw + 1, scene.shape[1]), min(y + bh + 1, scene.shape[0])
    if x1 <= x0 or y1 <= y0:
        return
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad) - np.float32([x0, y0]))
    if rng is not None:
        img = cv.convertScaleAbs(img, alpha=rng.uniform(0.7, 1.3), beta=rng.uniform(-30, 30))
    size = (x1 - x0, y1 - y0)
    mask = cv.warpPerspective(np.full((h, w), 255, np.uint8), H, size)
    np.copyto(scene[y0:y1, x0:x1], cv.warpPerspective(img, H, size), where=(mask > 0)[:, :, None])


def add_noise(img, rng, amount=14):
    """-amount ~ +amount 정수 잡음."""
    n = rng.integers(-amount, amount + 1, img.shape, dtype=np.int16)
    return np.clip(img.astype(np.int16) + n, 0, 255).astype(np.uint8)


def make_scene(products, rng, width=(150, 190), noise=14, distractor=True):
    """합성 선반 장면과 정답 {이름: 꼭짓점 4개} ('unknown' = 카탈로그에 없는 방해물)."""
    scene = make_shelf()
    items = list(products.items())
    if distractor:
        items.append(('unknown', cv.resize(cv.imread('fruits.jpg'), (200, 190))))
    truth = {}
    for (name, img), slot in zip(items, rng.permutation(len(SLOTS))):
        cx, cy = SLOTS[slot]
        h, w = img.shape[:2]
        width_px = min(rng.uniform(*width), (width[1] + 10) * w / h)
        quad = random_quad(img, (cx + rng.uniform(-15, 15), cy + rng.uniform(-10, 10)), width_px, rng)
        paste(scene, img, quad, rng)
        truth[name] = quad
    return add_noise(scene, rng, noise), truth

# ===== 스마트 선반 공통 도구 ③ 특징 매칭 인식기 (1주차 ORB + 호모그래피) =====
CFG = {'ref_side': 220, 'ref_features': 500, 'scene_features': 1500,
       'ratio': 0.8, 'min_inliers': 10, 'clahe': True}


def prep_gray(img, cfg):
    """흑백 → (CLAHE 대비 보정) → 3×3 블러."""
    g = cv.cvtColor(img, cv.COLOR_BGR2GRAY) if img.ndim == 3 else img
    if cfg['clahe']:
        g = cv.createCLAHE(2.0, (8, 8)).apply(g)
    return cv.GaussianBlur(g, (3, 3), 0)


def build_db(products, cfg):
    """상품마다 ORB 점 좌표(원본 기준) · 기술자 · 크기를 미리 계산해 둔다."""
    orb = cv.ORB_create(cfg['ref_features'])
    db = {}
    for name, img in products.items():
        s = cfg['ref_side'] / max(img.shape[:2])
        small = cv.resize(img, None, fx=s, fy=s, interpolation=cv.INTER_AREA)
        kp, des = orb.detectAndCompute(prep_gray(small, cfg), None)
        db[name] = {'pts': np.float32([k.pt for k in kp]) / s, 'des': des, 'size': (img.shape[1], img.shape[0])}
    return db


def quad_ok(H, size, frame_shape):
    """호모그래피가 말이 되는 사각형을 만드는지 검사 → (통과 여부, 꼭짓점 4개)."""
    if H is None:
        return False, None
    w, h = size
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = cv.perspectiveTransform(corners.reshape(-1, 1, 2), H).reshape(4, 2)
    z = corners @ H[2, :2] + H[2, 2]
    if np.linalg.det(H) <= 0 or np.any(z <= 0):                 # 뒤집힘 · 무한대로 발산
        return False, quad
    if not cv.isContourConvex(quad.astype(np.int32)):           # 꼬이거나 오목한 사각형
        return False, quad
    area = cv.contourArea(quad)
    if area < 400 or area > 0.9 * frame_shape[0] * frame_shape[1]:
        return False, quad
    return True, quad


def recognize(frame, db, cfg, orb=None):
    """장면에서 상품을 찾아 [{'name', 'quad', 'inliers', 'good', 'H', 'src', 'dst', 'size'}] 로 돌려준다.
    src/dst = 인라이어 매칭점(기준 이미지 좌표 / 장면 좌표), size = 기준 이미지 (가로, 세로)."""
    orb = orb or cv.ORB_create(cfg['scene_features'])
    kp, des = orb.detectAndCompute(prep_gray(frame, cfg), None)
    if des is None or len(kp) < 10:
        return []
    bf = cv.BFMatcher(cv.NORM_HAMMING)
    found = []
    for name, ref in db.items():
        pairs = bf.knnMatch(ref['des'], des, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < cfg['ratio'] * p[1].distance]
        if len(good) < max(4, cfg['min_inliers']):
            continue
        src = ref['pts'][[m.queryIdx for m in good]].reshape(-1, 1, 2)
        dst = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        ok, quad = quad_ok(H, ref['size'], frame.shape)
        if ok and int(mask.sum()) >= cfg['min_inliers']:
            m = mask.ravel() == 1
            found.append({'name': name, 'quad': quad, 'inliers': int(m.sum()), 'good': len(good), 'H': H,
                          'src': src[m].reshape(-1, 2), 'dst': dst[m].reshape(-1, 2), 'size': ref['size']})
    return found

# ================= 팀이 바꿀 부분 ① : 소개와 지표 (영어) =================
SHOWCASE = {
    'title': 'Smart Shelf Recognizer',
    'tagline': 'ORB matching + homography check + SVM verification + solvePnP distance',
    'team': 'Team 0  |  Kim / Lee / Park',
    'accent': (0, 170, 255),
    'metrics': [('Recall', '0.88'), ('Precision', '1.00'), ('F1 macro', '0.92'), ('Speed', '15 ms')],   # a5-6 평가표에서
}
W = 1200


# ================= 팀이 바꿀 부분 ② : 파이프라인 =================
def run_pipeline(scene):
    """(단계 [(이름, 이미지)], 결과 이미지, 요약 문구)."""
    cv.setRNGSeed(0)
    db = build_db(PRODUCTS, CFG)
    gray = prep_gray(scene, CFG)
    kp = cv.ORB_create(CFG['scene_features']).detect(gray, None)
    found = recognize(scene, db, CFG)
    result = scene.copy()
    for r in found:
        cv.polylines(result, [np.int32(r['quad'])], True, (0, 255, 0), 3, cv.LINE_AA)
        cv.putText(result, r['name'], tuple(np.int32(r['quad'][0]) + [4, 24]), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv.LINE_AA)
    best = max(found, key=lambda r: r['inliers'])
    ref = PRODUCTS[best['name']]
    matches = cv.drawMatches(ref, [cv.KeyPoint(float(x), float(y), 8) for x, y in best['src']],
                             scene, [cv.KeyPoint(float(x), float(y), 8) for x, y in best['dst']],
                             [cv.DMatch(i, i, 0) for i in range(len(best['src']))], None, matchColor=(0, 255, 0),
                             flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
    stages = [('1 CLAHE gray', gray), (f'2 ORB {len(kp)} pts', cv.drawKeypoints(scene, kp, None, (0, 255, 0))),
              (f'3 {best["name"]}: {best["inliers"]} inliers', matches), ('4 verified result', result)]
    return stages, result, f'{len(found)} products found'


# ================= 공통 도우미 (그대로 사용) =================
def fit(im, w, h, bg=255):
    """비율을 유지하며 w×h 칸에 넣는다."""
    if im.ndim == 2:
        im = cv.cvtColor(im, cv.COLOR_GRAY2BGR)
    s = min(w / im.shape[1], h / im.shape[0])
    small = cv.resize(im, (max(1, int(im.shape[1] * s)), max(1, int(im.shape[0] * s))), interpolation=cv.INTER_AREA)
    cell = np.full((h, w, 3), bg, np.uint8)
    y0, x0 = (h - small.shape[0]) // 2, (w - small.shape[1]) // 2
    cell[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    return cell


def text_center(img, text, y, scale, color, thick, font=cv.FONT_HERSHEY_DUPLEX):
    (tw, _), _ = cv.getTextSize(text, font, scale, thick)
    cv.putText(img, text, ((img.shape[1] - tw) // 2, y), font, scale, color, thick, cv.LINE_AA)


def title_card(info, h=230):
    ramp = np.linspace(75, 25, h).astype(np.uint8)
    card = np.dstack([np.tile(ramp[:, None], (1, W))] * 3)
    cv.rectangle(card, (0, h - 8), (W, h), info['accent'], -1)
    text_center(card, info['title'], 95, 1.9, (255, 255, 255), 3)
    text_center(card, info['tagline'], 145, 0.75, (220, 220, 220), 1, cv.FONT_HERSHEY_SIMPLEX)
    text_center(card, info['team'], 195, 0.8, info['accent'], 2, cv.FONT_HERSHEY_SIMPLEX)
    return card


def labeled(im, label, w, h, color=(70, 70, 70)):
    bar = np.full((32, w, 3), color, np.uint8)
    cv.putText(bar, label, (10, 22), cv.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv.LINE_AA)
    return np.vstack([bar, fit(im, w, h)])


def metrics_panel(metrics, accent, h=110):
    panel = np.full((h, W, 3), 245, np.uint8)
    n = len(metrics)
    bw = (W - 40 - 20 * (n - 1)) // n
    for i, (name, value) in enumerate(metrics):
        x = 20 + i * (bw + 20)
        cv.rectangle(panel, (x, 10), (x + bw, h - 10), (40, 40, 40), -1)
        cv.rectangle(panel, (x, 10), (x + bw, 16), accent, -1)
        cv.putText(panel, value, (x + 20, 70), cv.FONT_HERSHEY_DUPLEX, 1.4, (255, 255, 255), 2, cv.LINE_AA)
        cv.putText(panel, name, (x + 22, 92), cv.FONT_HERSHEY_SIMPLEX, 0.6, accent, 2, cv.LINE_AA)
    return panel


def make_showcase(scene, info):
    stages, result, summary = run_pipeline(scene)
    half = (W - 20) // 2
    gap = lambda w, h: np.full((h, w, 3), 255, np.uint8)
    before_after = np.hstack([labeled(scene, 'BEFORE: shelf image', half, 330), gap(20, 362),
                              labeled(result, 'AFTER: ' + summary, W - 20 - half, 330, (0, 120, 0))])
    cw = (W - 3 * 12) // 4
    parts = []
    for i, (name, im) in enumerate(stages):
        parts.append(labeled(im, name, cw, 170))
        if i < 3:
            parts.append(gap(12, 202))
    pipe = fit(np.hstack(parts), W, 202)
    return np.vstack([title_card(info), gap(W, 14), before_after, gap(W, 14), pipe, gap(W, 10),
                      metrics_panel(info['metrics'], info['accent'])])


PRODUCTS = make_products()
scene, _ = make_scene(PRODUCTS, np.random.default_rng(3))      # 발표용 대표 장면 (webcv.get_input() 으로 바꿔도 됨)
showcase = make_showcase(scene, SHOWCASE)
cv.imwrite('showcase.png', showcase)
print('showcase.png 저장:', showcase.shape)
cv.imshow('showcase', showcase)
`, desc: '<p>팀은 맨 위 두 부분만 바꾸면 됩니다: <code>SHOWCASE</code>(제목 · 소개 · 팀 · 지표 4개)와 <code>run_pipeline()</code>(팀 파이프라인의 단계 이미지 4개와 결과). 지표 패널의 숫자는 반드시 a5-6 평가표에서 옮겨 적고, 발표에서 “어떤 데이터에서 잰 숫자인지” 말로 덧붙이세요. 저장된 <code>showcase.png</code> 는 첫 슬라이드와 데모 대기 화면으로 씁니다.</p>' },
      { type: 'code', title: '예제 2 · 동료 평가 집계: 가중 점수 · 기준별 평균 · 피드백 모아 보기', code: String.raw`
import numpy as np
from matplotlib import pyplot as plt

CRITERIA = ['function', 'technique', 'evaluation', 'realtime', 'presentation']
WEIGHTS = np.array([20, 25, 20, 15, 20]) / 100            # 루브릭 가중치 (합 1)

# 평가표를 옮겨 적은 데이터: 팀 → [(평가자, [5개 기준 점수 1~5], '인상 깊었던 점', '하나만 개선한다면'), ...]
reviews = {
    'Smart Shelf': [('A', [5, 5, 4, 4, 4], 'SVM check removed false matches', 'test on real photos'),
                    ('B', [4, 5, 5, 4, 5], 'recall table per class', 'cookie recall is low'),
                    ('C', [5, 4, 4, 5, 4], 'distance in cm with solvePnP', 'explain camera matrix')],
    'Gesture Pad': [('A', [4, 3, 3, 5, 4], 'smooth realtime tracking', 'no quantitative results'),
                    ('B', [4, 4, 2, 5, 3], 'fun demo', 'add test set and accuracy'),
                    ('D', [3, 3, 3, 4, 4], 'clear slides', 'compare with HOG detector')],
    'Doc Scanner': [('B', [5, 4, 5, 3, 5], 'before/after montage', 'make it realtime'),
                    ('C', [5, 4, 4, 3, 4], 'failure analysis', 'try ArUco for corners'),
                    ('D', [4, 5, 4, 3, 4], 'calibrated measurement', 'shorter intro')],
}

summary = {}
print(f'{"team":12s} ' + ' '.join(f'{c[:6]:>6s}' for c in CRITERIA) + f' {"score":>6s} {"std":>5s}')
for team, rows in reviews.items():
    S = np.array([r[1] for r in rows], float)              # 평가자 × 기준
    per_reviewer = (S @ WEIGHTS) / 5 * 100                  # 평가자별 100점 환산
    summary[team] = (S.mean(axis=0), per_reviewer.mean(), per_reviewer.std())
    print(f'{team:12s} ' + ' '.join(f'{v:6.2f}' for v in S.mean(axis=0)) + f' {per_reviewer.mean():6.1f} {per_reviewer.std():5.1f}')

print('\n순위:')
for rank, (team, (_, score, std)) in enumerate(sorted(summary.items(), key=lambda kv: -kv[1][1]), 1):
    weakest = CRITERIA[int(np.argmin(summary[team][0]))]
    print(f'{rank}. {team:12s} {score:5.1f}점 (±{std:.1f})  가장 낮은 기준: {weakest}')
    for _, _, good, improve in reviews[team]:
        print(f'     + {good:35s} → {improve}')

fig, ax = plt.subplots(figsize=(9, 4))
x = np.arange(len(CRITERIA))
for i, (team, (means, _, _)) in enumerate(summary.items()):
    ax.bar(x + (i - 1) * 0.27, means, 0.27, label=team)
ax.set_xticks(x)
ax.set_xticklabels(CRITERIA)
ax.set_ylim(0, 5.5)
ax.set_ylabel('mean score (1-5)')
ax.set_title('Peer review by criterion')
ax.legend(ncol=3, loc='upper center')
plt.tight_layout()
plt.show()
`, desc: '<p>점수는 평가자마다 기준이 달라 흔들리므로 <b>평균과 표준편차</b>를 함께 봅니다. 점수 순위보다 중요한 것은 팀별 <b>“가장 낮은 기준”과 피드백 문장</b>입니다 — a5-8 회고에서 바로 쓰입니다. 실제 수업에서는 공유 스프레드시트에서 복사한 값을 <code>reviews</code> 에 붙여 넣으면 됩니다.</p>' },
      { type: 'tip', html: `<p><b>질의응답 요령</b>: ① 질문을 한 문장으로 되풀이해 모두가 듣게 한다 ② 결론부터 30초 안에 답한다 ③ 숫자가 있으면 숫자로(“재현율 0.88 이고 놓친 것은 대부분 작은 흑백 상자”) ④ 모르면 추측하지 말고 “확인해서 알려 드리겠다”. 자주 나오는 질문: “실제 사진에서도 되나요?”, “왜 딥러닝을 안 썼나요?”, “테스트 데이터는 학습과 어떻게 달랐나요?”, “카메라가 바뀌면?”</p>` },
      { type: 'warn', html: `<p><b>데모가 실패했을 때</b>: 당황해서 코드를 고치기 시작하지 마세요. 30초 안에 ① 동영상 입력 · 백업 모드로 전환하거나 ② 준비한 결과 이미지 슬라이드로 넘어가 “라이브에서는 이런 이유로 실패했지만 평가 결과는 이렇다”고 설명합니다. 실패 원인을 차분히 설명하는 것도 좋은 평가를 받습니다.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 우리 팀 쇼케이스 만들기',
        desc: `<p>예제 1 을 간단히 만든 템플릿입니다. <code>TEAM</code> 딕셔너리를 우리 팀 정보(영어)로 바꾸고, <code>METRICS</code> 에 팀 평가표의 핵심 지표 3~4개를 넣으세요. 결과 이미지는 <code>webcv.get_input()</code>(오른쪽 패널에서 고른 입력)을 쓰며, 팀의 <code>process()</code> 결과로 바꿔도 됩니다.
타이틀 · 이미지 · 지표 상자가 한 장에 나오고 <code>team_showcase.png</code> 로 저장되면 성공입니다.</p>`,
        starter: String.raw`
import cv2 as cv
import numpy as np
import webcv

# TODO 1: 팀 정보를 바꾸세요 (영어)
TEAM = {'title': 'Our Project', 'tagline': 'one line about what it does', 'members': 'Team ?  |  A / B / C'}
# TODO 2: 팀 평가표의 지표로 바꾸세요 (3~4개)
METRICS = [('Metric 1', '0.00'), ('Metric 2', '0.00'), ('Speed', '0 ms')]
ACCENT = (0, 170, 255)
W = 1000


def team_result(img):
    """TODO 3: 팀 파이프라인 결과로 바꾸기 (지금은 Canny 엣지)."""
    edges = cv.Canny(cv.cvtColor(img, cv.COLOR_BGR2GRAY), 80, 160)
    return cv.cvtColor(edges, cv.COLOR_GRAY2BGR)


img = webcv.get_input()
header = np.full((170, W, 3), 35, np.uint8)
cv.putText(header, TEAM['title'], (30, 75), cv.FONT_HERSHEY_DUPLEX, 1.8, (255, 255, 255), 3, cv.LINE_AA)
cv.putText(header, TEAM['tagline'], (32, 115), cv.FONT_HERSHEY_SIMPLEX, 0.75, (220, 220, 220), 1, cv.LINE_AA)
cv.putText(header, TEAM['members'], (32, 150), cv.FONT_HERSHEY_SIMPLEX, 0.7, ACCENT, 2, cv.LINE_AA)

h = 300
left = cv.resize(img, (W // 2, h))
right = cv.resize(team_result(img), (W - W // 2, h))
body = np.hstack([left, right])

panel = np.full((110, W, 3), 245, np.uint8)
bw = (W - 20 * (len(METRICS) + 1)) // len(METRICS)
for i, (name, value) in enumerate(METRICS):
    x = 20 + i * (bw + 20)
    cv.rectangle(panel, (x, 10), (x + bw, 100), (40, 40, 40), -1)
    cv.putText(panel, value, (x + 15, 62), cv.FONT_HERSHEY_DUPLEX, 1.2, (255, 255, 255), 2, cv.LINE_AA)
    cv.putText(panel, name, (x + 15, 88), cv.FONT_HERSHEY_SIMPLEX, 0.55, ACCENT, 2, cv.LINE_AA)

showcase = np.vstack([header, body, panel])
cv.imwrite('team_showcase.png', showcase)
cv.imshow('team showcase', showcase)
`,
        hint: `<p>글자가 넘치면 <code>cv.getTextSize(text, font, scale, thick)</code> 로 폭을 재서 크기를 줄이세요. 지표는 4개를 넘기지 않는 것이 좋습니다. 팀 코드의 <code>process(frame)</code> 가 있다면 <code>team_result = process</code> 처럼 그대로 연결할 수 있습니다.</p>`,
        solution: String.raw`
import cv2 as cv
import numpy as np
import webcv

TEAM = {'title': 'Smart Shelf', 'tagline': 'Recognize products with ORB + SVM + solvePnP', 'members': 'Team 0  |  Kim / Lee / Park'}
METRICS = [('Recall', '0.88'), ('Precision', '1.00'), ('F1 macro', '0.92'), ('Speed', '15 ms')]
ACCENT = (0, 170, 255)
W = 1000


def team_result(img):
    """ORB 키포인트를 그린 결과 (팀 파이프라인으로 바꿔 쓰기)."""
    kp = cv.ORB_create(800).detect(cv.cvtColor(img, cv.COLOR_BGR2GRAY), None)
    out = cv.drawKeypoints(img, kp, None, (0, 255, 0))
    cv.putText(out, f'{len(kp)} keypoints', (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2, cv.LINE_AA)
    return out


def put_fit(img, text, org, max_w, scale, color, thick, font=cv.FONT_HERSHEY_SIMPLEX):
    """max_w 를 넘지 않도록 글자 크기를 줄여서 쓴다."""
    while scale > 0.3 and cv.getTextSize(text, font, scale, thick)[0][0] > max_w:
        scale -= 0.05
    cv.putText(img, text, org, font, scale, color, thick, cv.LINE_AA)


img = webcv.get_input()
header = np.full((170, W, 3), 35, np.uint8)
put_fit(header, TEAM['title'], (30, 75), W - 60, 1.8, (255, 255, 255), 3, cv.FONT_HERSHEY_DUPLEX)
put_fit(header, TEAM['tagline'], (32, 115), W - 60, 0.75, (220, 220, 220), 1)
put_fit(header, TEAM['members'], (32, 150), W - 60, 0.7, ACCENT, 2)

h = 300
left = cv.resize(img, (W // 2, h))
right = cv.resize(team_result(img), (W - W // 2, h))
body = np.hstack([left, right])

panel = np.full((110, W, 3), 245, np.uint8)
bw = (W - 20 * (len(METRICS) + 1)) // len(METRICS)
for i, (name, value) in enumerate(METRICS):
    x = 20 + i * (bw + 20)
    cv.rectangle(panel, (x, 10), (x + bw, 100), (40, 40, 40), -1)
    cv.rectangle(panel, (x, 10), (x + bw, 16), ACCENT, -1)
    cv.putText(panel, value, (x + 15, 62), cv.FONT_HERSHEY_DUPLEX, 1.2, (255, 255, 255), 2, cv.LINE_AA)
    cv.putText(panel, name, (x + 15, 88), cv.FONT_HERSHEY_SIMPLEX, 0.55, ACCENT, 2, cv.LINE_AA)

showcase = np.vstack([header, body, panel])
cv.imwrite('team_showcase.png', showcase)
cv.imshow('team showcase', showcase)
`,
      },
      {
        title: '실습 2 · 루브릭 가중 점수와 동점 처리 순위',
        desc: `<p>강사 점수(60%)와 동료 평균 점수(40%)를 합쳐 최종 점수(100점)를 계산하세요. 각 점수는 다섯 기준(1~5점)에 루브릭 가중치(20 · 25 · 20 · 15 · 20%)를 곱해 100점으로 환산합니다.
최종 점수가 같으면 <b>정량 평가(evaluation) 기준 점수가 높은 팀</b>이 앞서도록 순위를 매기세요. 정답 확인: 1위 Smart Shelf 89.8, 그리고 83.4 로 동점인 두 팀 중 evaluation 이 높은 <b>Plant Care 가 Doc Scanner 보다 앞</b>에 나오면 성공입니다.</p>`,
        starter: String.raw`
import numpy as np

WEIGHTS = np.array([20, 25, 20, 15, 20]) / 100      # function, technique, evaluation, realtime, presentation
instructor = {'Smart Shelf': [5, 5, 4, 4, 4], 'Gesture Pad': [4, 3, 3, 5, 4],
              'Doc Scanner': [5, 4, 4, 3, 5], 'Plant Care': [4, 4, 5, 3, 5]}
peers = {'Smart Shelf': [[5, 5, 4, 4, 4], [4, 5, 5, 4, 5]],
         'Gesture Pad': [[4, 3, 3, 5, 4], [4, 4, 2, 5, 3]],
         'Doc Scanner': [[5, 4, 4, 3, 5], [4, 4, 4, 3, 4]],
         'Plant Care': [[4, 4, 5, 3, 5], [4, 4, 4, 3, 4]]}


def to100(scores):
    """[5개 기준 1~5점] → 100점 환산."""
    # TODO 1: 가중합 / 5 * 100
    return 0.0


results = []
for team in instructor:
    peer_mean = np.mean(peers[team], axis=0)
    final = 0.0          # TODO 2: 0.6 * 강사 + 0.4 * 동료평균 (둘 다 100점 환산)
    evaluation = 0.0     # TODO 3: 동점 처리용 — 강사와 동료 평균의 evaluation(3번째) 기준 점수 평균
    results.append((team, final, evaluation))

# TODO 4: final 내림차순, 같으면 evaluation 내림차순으로 정렬
for rank, (team, final, evaluation) in enumerate(results, 1):
    print(f'{rank}. {team:12s} {final:5.1f}  (evaluation {evaluation:.2f})')
`,
        hint: `<p><code>np.dot(scores, WEIGHTS) / 5 * 100</code>. 정렬 키는 <code>key=lambda r: (-r[1], -r[2])</code>. 부동소수 비교에서 “같다”를 확실히 하려면 <code>round(final, 1)</code> 로 반올림한 값을 키로 쓰세요.</p>`,
        solution: String.raw`
import numpy as np

WEIGHTS = np.array([20, 25, 20, 15, 20]) / 100
instructor = {'Smart Shelf': [5, 5, 4, 4, 4], 'Gesture Pad': [4, 3, 3, 5, 4],
              'Doc Scanner': [5, 4, 4, 3, 5], 'Plant Care': [4, 4, 5, 3, 5]}
peers = {'Smart Shelf': [[5, 5, 4, 4, 4], [4, 5, 5, 4, 5]],
         'Gesture Pad': [[4, 3, 3, 5, 4], [4, 4, 2, 5, 3]],
         'Doc Scanner': [[5, 4, 4, 3, 5], [4, 4, 4, 3, 4]],
         'Plant Care': [[4, 4, 5, 3, 5], [4, 4, 4, 3, 4]]}


def to100(scores):
    """[5개 기준 1~5점] → 100점 환산."""
    return float(np.dot(scores, WEIGHTS) / 5 * 100)


results = []
for team in instructor:
    peer_mean = np.mean(peers[team], axis=0)
    final = 0.6 * to100(instructor[team]) + 0.4 * to100(peer_mean)
    evaluation = (instructor[team][2] + peer_mean[2]) / 2
    results.append((team, final, evaluation))

results.sort(key=lambda r: (-round(r[1], 1), -r[2]))
for rank, (team, final, evaluation) in enumerate(results, 1):
    print(f'{rank}. {team:12s} {final:5.1f}  (evaluation {evaluation:.2f})')
`,
      },
    ],
    quiz: [
      { q: '7분 발표에서 결과 이미지 한 장을 “표지 직후(첫 30초)”에 보여 주는 가장 큰 이유는?', options: ['시간을 채우기 위해', '청중이 무엇을 만들었는지 먼저 알고 나머지 설명을 그 맥락에서 이해하게 하기 위해', '데모가 실패할 것에 대비해서만', '루브릭에 그렇게 적혀 있어서'], answer: 1, explain: '결과를 먼저 보여 주면 방법 · 숫자 설명이 “저 결과를 어떻게 얻었나”로 연결되어 이해가 빠릅니다.' },
      { q: '동료 평가의 피드백으로 가장 좋은 것은?', options: ['“좋았어요”', '“별로였어요”', '“상품이 기울면 상자가 사라졌다 → 매장에서는 흔한 상황 → 기울기 증강이나 추적을 넣어 보면 좋겠다”', '“발표자가 긴장했다”'], answer: 2, explain: '관찰 → 영향 → 제안 순서로, 사람이 아니라 결과물에 대해 구체적으로 쓰는 피드백이 실제로 도움이 됩니다.' },
      { q: '루브릭의 “정량 평가” 기준에서 5점을 받기 위해 필요한 것이 아닌 것은?', options: ['학습과 분리된 테스트 데이터', '판정 기준(예: IoU>0.5)', '기준선 대비 개선 수치', '가장 화려한 시각 효과'], answer: 3, explain: '정량 평가는 “무엇을, 어떤 기준으로, 얼마나 좋아졌는지”를 숫자로 보이는 것입니다. 시각 효과는 발표 · 인터랙션 영역입니다.' },
    ],
  },
  // =====================================================================
  // a5-8 회고와 다음 단계
  // =====================================================================
  {
    id: 'a5-8',
    assets: ['images/adv/box.png', 'images/adv/box_in_scene.png', 'images/apps/aruco_board.png', 'images/apps/dog416.png',
      'models/face_detection_yunet_2023mar.onnx', 'models/yolox_nano.onnx'],
    summary: '심화 과정 5주를 한 장의 표와 한 장의 그림으로 돌아보고, KPT 로 개인 · 팀 회고를 합니다. 수료 퀴즈로 1~3주차 핵심을 점검하고, ORB 매칭 · Haar vs YuNet · K-Means · ArUco AR 을 한 프로그램에 담은 “비전 스튜디오” 최종 도전을 풉니다. 마지막으로 동영상 분석 · 딥러닝 학습과 ONNX · 3D 재구성으로 이어지는 로드맵을 맛보기 코드와 함께 안내합니다.',
    goals: [
      '주차별 핵심 주제와 대표 함수를 표로 정리하고, 한 프로젝트에서 어떻게 결합되는지 설명할 수 있다',
      'KPT(Keep · Problem · Try)로 프로젝트 과정을 돌아보고 다음 행동을 구체적으로 정할 수 있다',
      '특징 매칭 · 얼굴 검출 · 군집화 · 마커 자세 추정을 모드 전환형 process(frame) 하나로 통합할 수 있다',
      '동영상 분석(배경 차분 · 광류), DNN 모델(ONNX) 활용, 3D 재구성 중 다음 학습 방향을 고르고 공식 문서를 찾아갈 수 있다',
    ],
    schedule: [['과정 총정리 (표 · 한 장 그림)', 8], ['KPT 회고 (개인 → 팀 → 공유)', 10], ['수료 퀴즈', 10], ['최종 도전: 비전 스튜디오', 14], ['로드맵 · 맛보기 · 마무리', 8]],
    blocks: [
      { type: 'text', html: `
<h3>1. 심화 과정 5주 돌아보기</h3>
<p>입문 과정이 “픽셀을 다루는 법”이었다면, 심화 과정은 <b>“영상에서 의미 있는 정보를 뽑고, 3D 로 해석하고, 데이터로 판단하는 법”</b>이었습니다. 스마트 선반 인식기 하나에 세 영역이 모두 들어 있습니다.</p>
<ul>
  <li><b>특징(1주)</b>: ORB 특징점 → knnMatch 비율 테스트 → RANSAC 호모그래피 → 상품 위치</li>
  <li><b>3D(2주)</b>: 실제 크기 + 카메라 행렬 → solvePnP → 거리 · 기울기 · AR 좌표축</li>
  <li><b>머신러닝 · 검출(3주)</b>: 색 히스토그램 + HOG → SVM 검증, (얼굴 · 사람 · 물체는 Haar · HOG · DNN)</li>
  <li><b>프로젝트(4~5주)</b>: 데이터 설계 → 평가 지표 · 튜닝 → 실시간 최적화 → 테스트 · 디버깅 → 발표</li>
</ul>` },
      { type: 'table', head: ['주차', '주제', '핵심 개념', '대표 함수'], rows: [
        ['1주', '특징점 검출과 기술', '코너 · 스케일 불변 · 이진 기술자 · 비율 테스트 · RANSAC', '<code>cornerHarris</code> <code>goodFeaturesToTrack</code> <code>SIFT_create</code> <code>ORB_create</code> <code>BFMatcher.knnMatch</code> <code>FlannBasedMatcher</code> <code>findHomography</code> <code>perspectiveTransform</code>'],
        ['2주', '캘리브레이션과 3D', '핀홀 모델 · 내부/외부 파라미터 · 왜곡 · 자세 · 에피폴라 · 시차', '<code>findChessboardCorners</code> <code>calibrateCamera</code> <code>undistort</code> <code>solvePnP</code> <code>projectPoints</code> <code>drawFrameAxes</code> <code>findFundamentalMat</code> <code>StereoSGBM_create</code> <code>aruco.ArucoDetector</code>'],
        ['3주', '머신러닝과 객체 검출', '특징 벡터 · 학습/테스트 · 마진 · 군집 · 캐스케이드 · 슬라이딩 윈도 · DNN', '<code>ml.KNearest_create</code> <code>ml.SVM_create</code> <code>HOGDescriptor</code> <code>kmeans</code> <code>CascadeClassifier</code> <code>dnn.readNetFromONNX</code> <code>FaceDetectorYN</code>'],
        ['4주', '가이드 프로젝트 · 기획', '파노라마 · AR 오버레이 · 실측 · 손글씨 인식 · 파이프라인 설계', '<code>warpPerspective</code> <code>Stitcher_create</code> <code>setMouseCallback</code> <code>createTrackbar</code>'],
        ['5주', '구현과 발표', '데이터 · 증강 · 혼동 행렬 · 과적합 · 프레임 예산 · 추적 · 테스트 · 누수', '<code>calcOpticalFlowPyrLK</code> <code>solvePnP(IPPE)</code> <code>intersectConvexConvex</code> <code>imwrite</code> · <code>assert</code>'],
      ] },
      { type: 'code', title: '예제 1 · 한 장으로 보는 심화 과정: 매칭 · ArUco 자세 · K-Means · YuNet', code: String.raw`
import cv2 as cv
import numpy as np


def tile(img, title, size=(400, 300)):
    """비율 유지로 칸에 넣고 제목 띠를 붙인다."""
    w, h = size
    s = min(w / img.shape[1], (h - 30) / img.shape[0])
    small = cv.resize(img, (int(img.shape[1] * s), int(img.shape[0] * s)), interpolation=cv.INTER_AREA)
    out = np.full((h, w, 3), 30, np.uint8)
    y0, x0 = 30 + (h - 30 - small.shape[0]) // 2, (w - small.shape[1]) // 2
    out[y0:y0 + small.shape[0], x0:x0 + small.shape[1]] = small
    cv.putText(out, title, (8, 21), cv.FONT_HERSHEY_SIMPLEX, 0.58, (255, 255, 255), 1, cv.LINE_AA)
    return out


cv.setRNGSeed(0)
# ---- 1주: ORB 매칭 + 호모그래피 ----
box, scene = cv.imread('box.png'), cv.imread('box_in_scene.png')
orb = cv.ORB_create(1000)
k1, d1 = orb.detectAndCompute(box, None)
k2, d2 = orb.detectAndCompute(scene, None)
good = [p[0] for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < 0.8 * p[1].distance]
H, mask = cv.findHomography(np.float32([k1[m.queryIdx].pt for m in good]), np.float32([k2[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
h, w = box.shape[:2]
quad = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H)
scene_vis = cv.polylines(scene.copy(), [np.int32(quad)], True, (0, 255, 0), 3, cv.LINE_AA)
inliers = [m for m, ok in zip(good, mask.ravel()) if ok]
week1 = cv.drawMatches(box, k1, scene_vis, k2, inliers, None, matchColor=(0, 255, 0), flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)

# ---- 2주: ArUco 마커 → solvePnP → 좌표축 ----
board = cv.imread('aruco_board.png')
detector = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50), cv.aruco.DetectorParameters())
corners, ids, _ = detector.detectMarkers(cv.cvtColor(board, cv.COLOR_BGR2GRAY))
bh, bw = board.shape[:2]
K = np.float64([[0.94 * bw, 0, bw / 2], [0, 0.94 * bw, bh / 2], [0, 0, 1]])
obj = np.float32([[-2.5, 2.5, 0], [2.5, 2.5, 0], [2.5, -2.5, 0], [-2.5, -2.5, 0]])      # 한 변 5cm 마커 (IPPE_SQUARE 순서)
week2 = board.copy()
if ids is not None:
    cv.aruco.drawDetectedMarkers(week2, corners, ids)
    for c in corners:
        ok, rvec, tvec = cv.solvePnP(obj, c.reshape(4, 2), K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
        cv.drawFrameAxes(week2, K, None, rvec, tvec, 2.5, 3)

# ---- 3주: K-Means 색 양자화 + YuNet 얼굴 검출 ----
lena = cv.imread('lena.jpg')
Z = cv.resize(lena, (160, 160), interpolation=cv.INTER_AREA).reshape(-1, 3).astype(np.float32)
_, labels, centers = cv.kmeans(Z, 6, None, (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0), 2, cv.KMEANS_PP_CENTERS)
quant = cv.resize(centers.astype(np.uint8)[labels.ravel()].reshape(160, 160, 3), (512, 512), interpolation=cv.INTER_NEAREST)
yunet = cv.FaceDetectorYN.create('face_detection_yunet_2023mar.onnx', '', (lena.shape[1], lena.shape[0]), 0.6, 0.3, 5000)
_, faces = yunet.detect(lena)
face_vis = lena.copy()
for f in (faces if faces is not None else []):
    x, y, fw, fh = f[:4].astype(int)
    cv.rectangle(face_vis, (x, y), (x + fw, y + fh), (0, 255, 0), 3)
    for j in range(5):
        cv.circle(face_vis, (int(f[4 + 2 * j]), int(f[5 + 2 * j])), 4, (0, 0, 255), -1)
week3 = np.hstack([quant, face_vis])

tiles = [tile(week1, f'Week 1  ORB + RANSAC homography ({len(inliers)} inliers)', (600, 300)),
         tile(week2, f'Week 2  ArUco markers {sorted(ids.ravel().tolist()) if ids is not None else []} + solvePnP axes', (600, 300)),
         tile(week3, f'Week 3  K-Means K=6  |  YuNet faces: {0 if faces is None else len(faces)}', (600, 300)),
         tile(cv.imread('dog416.png'), 'Next  DNN (YOLOX) / video / 3D ...', (600, 300))]
summary = np.vstack([np.hstack(tiles[:2]), np.hstack(tiles[2:])])
cv.imwrite('course_summary.png', summary)
print('인라이어', len(inliers), '/ 마커', None if ids is None else ids.ravel(), '/ 얼굴', 0 if faces is None else len(faces))
cv.imshow('advanced course in one picture', summary)
`, desc: '<p>1~3주차의 대표 결과를 한 장에 모았습니다. 각 칸을 가리키며 “이 결과를 얻으려면 어떤 입력과 어떤 가정(평면, 카메라 행렬, 학습 데이터)이 필요했는지”를 말로 설명해 보세요. 설명이 막히는 칸이 복습할 주제입니다. <code>course_summary.png</code> 로 저장해 수료 기념으로 가져가세요.</p>' },
      { type: 'text', html: `
<h3>2. KPT 회고 — 잘한 것 · 문제 · 시도할 것</h3>
<p>회고는 “누가 잘못했나”가 아니라 <b>“다음에 무엇을 다르게 할까”</b>를 정하는 시간입니다. KPT 는 세 칸만 채우면 됩니다.</p>
<table>
<tr><th>칸</th><th>질문</th><th>좋은 예 (스마트 선반 팀)</th></tr>
<tr><td><b>K</b>eep (유지)</td><td>효과가 있어서 다음에도 계속할 것은?</td><td>합성 장면으로 정답을 자동 생성해 튜닝마다 재현율을 숫자로 확인한 것</td></tr>
<tr><td><b>P</b>roblem (문제)</td><td>시간을 잡아먹거나 결과를 망친 것은?</td><td>실제 흑백 사진에서만 SVM 이 none 을 냈는데 원인(회색 픽셀의 H)을 찾는 데 하루가 걸림</td></tr>
<tr><td><b>T</b>ry (시도)</td><td>Problem 을 줄이기 위해 다음에 해 볼 구체적 행동은?</td><td>처음부터 실제 사진 5장을 테스트 세트에 넣고, 특징을 부분별(색 · HOG)로 비교하는 디버그 코드를 만든다</td></tr>
</table>
<p><b>진행</b>: ① 개인 3분 — 칸마다 포스트잇 2장 이상 ② 팀 4분 — 비슷한 것끼리 묶고 Try 를 2개로 좁힘 ③ 공유 3분 — 팀마다 Try 1개 발표. Try 는 “더 열심히”가 아니라 <b>다음 프로젝트 첫 주에 실제로 할 수 있는 행동</b>이어야 합니다.</p>` },
      { type: 'checklist', title: '나의 심화 과정 자기 점검', items: [
        '특징점 매칭 결과를 인라이어 수 · 비율로 판단하고 호모그래피 퇴화를 걸러낼 수 있다',
        '카메라 행렬의 의미를 알고, 실제 크기로 solvePnP 해서 거리 · 자세를 구할 수 있다',
        'kNN · SVM 입력 형식(float32 · int32)을 지키고, 혼동 행렬 · 정밀도 · 재현율로 평가할 수 있다',
        'Haar · HOG · DNN 검출기의 장단점(속도 · 정확도 · 오검출)을 비교해 고를 수 있다',
        '학습/테스트를 출처 단위로 나누고 과적합 · 누수를 의심할 수 있다',
        'process(frame) 의 병목을 측정하고 N 프레임마다 인식 + 추적으로 최적화할 수 있다',
        '결과를 정량 평가표 · 몽타주 · 차트로 정리해 발표할 수 있다',
      ] },
      { type: 'text', html: `
<h3>3. 최종 도전: 비전 스튜디오</h3>
<p>심화 과정의 기술 네 가지를 <b>하나의 process(frame)</b> 에 담습니다. 트랙바 <code>mode</code> 로 기능을 바꾸고, 모든 모드가 공통 HUD(모드 이름 · ms)를 씁니다.</p>
<ul>
  <li><b>mode 0 — ORB 매칭</b>: 입력에서 box.png 상자를 찾아 사각형 + 인라이어 수 (1주)</li>
  <li><b>mode 1 — Haar vs YuNet</b>: 같은 프레임을 왼쪽은 Haar, 오른쪽은 YuNet 으로 검출해 개수 · 시간 비교 (3주)</li>
  <li><b>mode 2 — K-Means 색 양자화</b>: 트랙바 <code>K</code> 로 색 수 조절, 작은 영상에서 군집 후 확대 (3주)</li>
  <li><b>mode 3 — ArUco AR 좌표축</b>: DICT_4X4_50 마커를 찾아 solvePnP → 좌표축 · 거리 (2주)</li>
</ul>
<p>설계 요령: 모드마다 <code>mode_xxx(frame) -&gt; (결과 이미지, 한 줄 정보)</code> 함수로 나누고, <code>process</code> 는 “모드 고르기 → 호출 → HUD” 만 합니다. 무거운 준비(ORB 기준 특징, 캐스케이드, YuNet, ArUco 검출기)는 모두 process 밖에서 한 번만. 입력은 이미지 패널에서 <code>aruco_board.png</code> · <code>lena.jpg</code> · <code>box_in_scene.png</code> 로 바꿔 가며 시험하고, 웹캠으로도 해 보세요.</p>` },
      { type: 'code', title: '예제 2 · 최종 도전 “비전 스튜디오” — 4개 모드 process(frame)', code: String.raw`
import time
import cv2 as cv
import numpy as np

# ---------------- 준비 (한 번만) ----------------
BOX = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
ORB = cv.ORB_create(1000)
BOX_KP, BOX_DES = ORB.detectAndCompute(BOX, None)
HAAR = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
YUNET = cv.FaceDetectorYN.create('face_detection_yunet_2023mar.onnx', '', (320, 320), 0.6, 0.3, 5000)
ARUCO = cv.aruco.ArucoDetector(cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50), cv.aruco.DetectorParameters())
MARKER_CM = 5.0
MODES = ['ORB MATCH', 'HAAR vs YUNET', 'K-MEANS', 'ARUCO AR']


def nothing(x):
    pass


cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 3, 3, nothing)
cv.createTrackbar('K', 'result', 6, 16, nothing)


def mode_orb(frame):
    """box.png 상자를 ORB 매칭 + 호모그래피로 찾는다."""
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    kp, des = ORB.detectAndCompute(gray, None)
    if des is None or len(kp) < 10:
        return frame, 'no keypoints'
    good = [p[0] for p in cv.BFMatcher(cv.NORM_HAMMING).knnMatch(BOX_DES, des, k=2) if len(p) == 2 and p[0].distance < 0.8 * p[1].distance]
    if len(good) < 12:
        return frame, f'good matches {len(good)} (<12)'
    H, mask = cv.findHomography(np.float32([BOX_KP[m.queryIdx].pt for m in good]), np.float32([kp[m.trainIdx].pt for m in good]), cv.RANSAC, 5.0)
    if H is None or mask.sum() < 12:
        return frame, 'homography failed'
    h, w = BOX.shape
    quad = cv.perspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), H)
    if not cv.isContourConvex(np.int32(quad)) or np.linalg.det(H) <= 0:
        return frame, 'degenerate homography'
    cv.polylines(frame, [np.int32(quad)], True, (0, 255, 0), 3, cv.LINE_AA)
    return frame, f'box found, inliers {int(mask.sum())}'


def mode_faces(frame):
    """왼쪽 절반은 Haar, 오른쪽 절반은 YuNet 결과를 그린다 (같은 프레임)."""
    left, right = frame.copy(), frame.copy()
    t = time.perf_counter()
    haar = HAAR.detectMultiScale(cv.equalizeHist(cv.cvtColor(frame, cv.COLOR_BGR2GRAY)), 1.1, 5, minSize=(40, 40))
    t_haar = (time.perf_counter() - t) * 1000
    for (x, y, w, h) in haar:
        cv.rectangle(left, (x, y), (x + w, y + h), (0, 0, 255), 3)
    t = time.perf_counter()
    YUNET.setInputSize((frame.shape[1], frame.shape[0]))
    _, faces = YUNET.detect(frame)
    t_yunet = (time.perf_counter() - t) * 1000
    faces = faces if faces is not None else []
    for f in faces:
        x, y, w, h = f[:4].astype(int)
        cv.rectangle(right, (x, y), (x + w, y + h), (0, 255, 0), 3)
    half = frame.shape[1] // 2
    out = np.hstack([left[:, :half], right[:, half:]])
    cv.line(out, (half, 0), (half, out.shape[0]), (255, 255, 255), 2)
    return out, f'Haar {len(haar)} ({t_haar:.0f}ms) | YuNet {len(faces)} ({t_yunet:.0f}ms)'


def mode_kmeans(frame):
    """작게 줄여 K-Means 로 색을 K 개로 줄인 뒤 원래 크기로 키운다."""
    K = max(2, cv.getTrackbarPos('K', 'result'))
    small = cv.resize(frame, (160, int(160 * frame.shape[0] / frame.shape[1])), interpolation=cv.INTER_AREA)
    Z = small.reshape(-1, 3).astype(np.float32)
    _, labels, centers = cv.kmeans(Z, K, None, (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0), 1, cv.KMEANS_PP_CENTERS)
    quant = centers.astype(np.uint8)[labels.ravel()].reshape(small.shape)
    return cv.resize(quant, (frame.shape[1], frame.shape[0]), interpolation=cv.INTER_NEAREST), f'K = {K} colors'


def mode_aruco(frame):
    """ArUco 마커 → solvePnP(IPPE_SQUARE) → 좌표축 + 거리."""
    corners, ids, _ = ARUCO.detectMarkers(cv.cvtColor(frame, cv.COLOR_BGR2GRAY))
    if ids is None:
        return frame, 'no marker (DICT_4X4_50)'
    h, w = frame.shape[:2]
    K = np.float64([[0.94 * w, 0, w / 2], [0, 0.94 * w, h / 2], [0, 0, 1]])
    s = MARKER_CM / 2
    obj = np.float32([[-s, s, 0], [s, s, 0], [s, -s, 0], [-s, -s, 0]])      # IPPE_SQUARE 가 요구하는 꼭짓점 순서
    cv.aruco.drawDetectedMarkers(frame, corners, ids)
    dists = []
    for c in corners:
        ok, rvec, tvec = cv.solvePnP(obj, c.reshape(4, 2), K, None, flags=cv.SOLVEPNP_IPPE_SQUARE)
        if ok:
            cv.drawFrameAxes(frame, K, None, rvec, tvec, MARKER_CM * 0.8, 3)
            dists.append(np.linalg.norm(tvec))
    return frame, f'{len(ids)} markers, mean dist {np.mean(dists):.0f} cm (approx K)'


def process(frame):
    t0 = time.perf_counter()
    mode = cv.getTrackbarPos('mode', 'result')
    out, info = [mode_orb, mode_faces, mode_kmeans, mode_aruco][mode](frame.copy())
    ms = (time.perf_counter() - t0) * 1000
    cv.rectangle(out, (0, 0), (out.shape[1], 34), (30, 30, 30), -1)
    cv.putText(out, f'[{mode}] {MODES[mode]}  {ms:.0f} ms  |  {info}', (10, 24), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv.LINE_AA)
    return out


print('입력 추천: mode 0 → box_in_scene.png, mode 1 → lena.jpg · 웹캠, mode 2 → 아무 이미지, mode 3 → aruco_board.png')
`, desc: '<p><b>mode</b> 트랙바를 움직이며 입력 이미지를 바꿔 보세요. mode 1 은 한 화면을 반으로 나눠 Haar(빨강)와 YuNet(초록)의 개수 · 시간을 나란히 보여 주므로, 3주차에서 배운 “전통 검출기 vs DNN” 차이를 직접 확인할 수 있습니다. 도전 과제는 실습 1(모드 추가)입니다.</p>' },
      { type: 'text', html: `
<h3>4. 다음 단계 로드맵</h3>
<p>OpenCV 공식 튜토리얼에서 이 과정 다음으로 이어지는 세 갈래입니다. 모두 지금까지 쓴 <code>process(frame)</code> · 평가 · 디버깅 습관이 그대로 쓰입니다.</p>
<table>
<tr><th>방향</th><th>무엇을 배우나</th><th>이번 과정과의 연결</th><th>공식 문서</th></tr>
<tr><td><b>동영상 분석</b></td><td>광류(Lucas-Kanade · Farneback), Meanshift/CamShift 추적, 배경 차분(MOG2 · KNN)</td><td>a5-3 의 LK 추적 확장, 움직이는 물체만 골라 인식해 속도 향상</td><td><a href="https://docs.opencv.org/4.x/da/dd0/tutorial_table_of_content_video.html" target="_blank" rel="noopener">Video analysis</a> · <a href="https://docs.opencv.org/4.x/d4/dee/tutorial_optical_flow.html" target="_blank" rel="noopener">Optical Flow</a> · <a href="https://docs.opencv.org/4.x/d1/dc5/tutorial_background_subtraction.html" target="_blank" rel="noopener">Background Subtraction</a></td></tr>
<tr><td><b>딥러닝 학습과 ONNX</b></td><td>PyTorch 등에서 모델 학습 → ONNX 로 내보내기 → <code>cv.dnn.readNetFromONNX</code> 로 추론, YOLO 출력 디코딩 · NMS</td><td>SVM 검증기를 작은 CNN 으로 교체, 상품 검출을 YOLO 로 학습</td><td><a href="https://docs.opencv.org/4.x/d2/d58/tutorial_table_of_content_dnn.html" target="_blank" rel="noopener">Deep Neural Networks (dnn)</a> · <a href="https://docs.opencv.org/4.x/da/d9d/tutorial_dnn_yolo.html" target="_blank" rel="noopener">YOLO DNNs</a></td></tr>
<tr><td><b>3D 재구성</b></td><td>여러 장의 사진으로 카메라 자세와 3D 점 구름 만들기(SfM), 스테레오 깊이 → 점 구름</td><td>2주차 에피폴라 · 스테레오의 확장, 상품 선반을 3D 로 스캔</td><td><a href="https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html" target="_blank" rel="noopener">OpenCV-Python Tutorials</a> (Camera Calibration and 3D Reconstruction)</td></tr>
</table>
<p>아래 두 예제는 각 방향의 <b>맛보기</b>입니다. 예제 3 은 동영상(🎞️ vtest.mp4)을 입력으로 고르면 매 프레임 동작합니다.</p>` },
      { type: 'code', title: '예제 3 · 맛보기 ① 동영상 분석: 배경 차분(MOG2)과 광류(Farneback)', code: String.raw`
import time
import cv2 as cv
import numpy as np

MOG = cv.createBackgroundSubtractorMOG2(history=200, varThreshold=25, detectShadows=True)
STATE = {'prev': None}
KERNEL = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))


def nothing(x):
    pass


cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 0, 1, nothing)      # 0: 배경 차분, 1: 광류


def background_subtraction(frame):
    """움직이는 물체 마스크 → 컨투어 상자."""
    mask = MOG.apply(frame)
    mask = cv.threshold(mask, 200, 255, cv.THRESH_BINARY)[1]           # 그림자(127) 제거
    mask = cv.morphologyEx(mask, cv.MORPH_OPEN, KERNEL)
    contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    out = frame.copy()
    n = 0
    for c in contours:
        if cv.contourArea(c) > 300:
            x, y, w, h = cv.boundingRect(c)
            cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
            n += 1
    small = cv.resize(cv.cvtColor(mask, cv.COLOR_GRAY2BGR), None, fx=0.3, fy=0.3)
    out[0:small.shape[0], out.shape[1] - small.shape[1]:] = small      # 오른쪽 위에 마스크 미리보기
    return out, f'moving objects {n}'


def optical_flow(frame):
    """이전 프레임과의 조밀 광류 → 방향은 색상, 크기는 밝기."""
    gray = cv.cvtColor(cv.resize(frame, (320, int(320 * frame.shape[0] / frame.shape[1]))), cv.COLOR_BGR2GRAY)
    prev = STATE['prev']
    STATE['prev'] = gray
    if prev is None or prev.shape != gray.shape:
        return frame, 'waiting for next frame'
    flow = cv.calcOpticalFlowFarneback(prev, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
    mag, ang = cv.cartToPolar(flow[..., 0], flow[..., 1])
    hsv = np.zeros((*gray.shape, 3), np.uint8)
    hsv[..., 0] = (ang * 180 / np.pi / 2).astype(np.uint8)
    hsv[..., 1] = 255
    hsv[..., 2] = cv.normalize(mag, None, 0, 255, cv.NORM_MINMAX).astype(np.uint8)
    vis = cv.resize(cv.cvtColor(hsv, cv.COLOR_HSV2BGR), (frame.shape[1], frame.shape[0]))
    return cv.addWeighted(frame, 0.4, vis, 0.8, 0), f'mean motion {mag.mean():.2f} px/frame'


def process(frame):
    t0 = time.perf_counter()
    mode = cv.getTrackbarPos('mode', 'result')
    out, info = (background_subtraction if mode == 0 else optical_flow)(frame)
    ms = (time.perf_counter() - t0) * 1000
    cv.putText(out, f'{["MOG2", "Farneback"][mode]}  {ms:.0f} ms  {info}', (10, 28), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv.LINE_AA)
    return out


print('🎞️ vtest.mp4 를 입력으로 고르세요. 처음 몇십 프레임은 MOG2 가 배경을 배우는 중이라 잡음이 많습니다.')
`, desc: '<p>배경 차분은 “고정 카메라에서 움직이는 것만” 골라내므로, 스마트 선반에 적용하면 <b>손이 상품을 집는 순간</b>만 인식을 돌려 계산을 크게 아낄 수 있습니다. 광류는 픽셀마다 움직임 벡터를 주어, a5-3 의 LK(희소 광류)보다 무겁지만 화면 전체의 움직임 패턴을 볼 수 있습니다. 공식 튜토리얼 Video analysis 단원에서 이어서 공부하세요.</p>' },
      { type: 'code', title: '예제 4 · 맛보기 ② DNN: ONNX 모델(YOLOX-nano) 불러와 출력 해석하기', code: String.raw`
import time
import cv2 as cv
import numpy as np

COCO = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
        'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow']   # 앞 20개만 (전체 80)
SIZE = 416

net = cv.dnn.readNetFromONNX('yolox_nano.onnx')
img = cv.imread('dog416.png')
r = min(SIZE / img.shape[0], SIZE / img.shape[1])
pad = np.full((SIZE, SIZE, 3), 114, np.uint8)                              # 비율 유지 + 회색 여백 (학습 때와 같은 전처리)
pad[:int(img.shape[0] * r), :int(img.shape[1] * r)] = cv.resize(img, (int(img.shape[1] * r), int(img.shape[0] * r)))

t = time.perf_counter()
net.setInput(cv.dnn.blobFromImage(pad))                                   # (1, 3, 416, 416)
pred = net.forward()[0]                                                    # (3549, 85)
print(f'forward {1000 * (time.perf_counter() - t):.0f} ms, 출력 모양 {pred.shape} = 후보 3549개 × (x, y, w, h, objectness, 80 클래스)')

# 후보 3549 = 52×52 + 26×26 + 13×13 격자 (stride 8, 16, 32) → 격자 좌표를 더하고 stride 를 곱해 픽셀로
grids, strides = [], []
for s in (8, 16, 32):
    n = SIZE // s
    xv, yv = np.meshgrid(np.arange(n), np.arange(n))
    grids.append(np.stack([xv, yv], 2).reshape(-1, 2))
    strides.append(np.full((n * n, 1), s))
grids, strides = np.concatenate(grids), np.concatenate(strides)
xy = (pred[:, :2] + grids) * strides
wh = np.exp(pred[:, 2:4]) * strides
scores = pred[:, 4:5] * pred[:, 5:]
cls = scores.argmax(1)
conf = scores[np.arange(len(cls)), cls]
keep = conf > 0.4
boxes = np.concatenate([xy - wh / 2, wh], 1)[keep] / r
idx = cv.dnn.NMSBoxes(boxes.tolist(), conf[keep].tolist(), 0.4, 0.45)       # 겹친 상자 정리

out = img.copy()
for i in np.array(idx).flatten():
    x, y, w, h = boxes[i].astype(int)
    c = int(cls[keep][i])
    name = COCO[c] if c < len(COCO) else f'class {c}'
    cv.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.putText(out, f'{name} {conf[keep][i]:.2f}', (x, max(15, y - 6)), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv.LINE_AA)
    print(f'  {name:10s} conf={conf[keep][i]:.2f} box={boxes[i].astype(int)}')
cv.imshow('YOLOX-nano (ONNX) result', out)
`, desc: '<p>DNN 을 쓰는 코드의 90%는 <b>전처리(학습 때와 같게)와 출력 디코딩</b>입니다. 직접 학습한 모델도 ONNX 로 내보내면 이 코드 구조 그대로 OpenCV 에서 돌릴 수 있습니다. 스마트 선반이라면 상품 사진을 모아 YOLO 를 학습시키고, 이번 주에 만든 평가 코드(IoU · P · R)로 ORB 방식과 비교해 보는 것이 좋은 다음 프로젝트입니다.</p>' },
      { type: 'code', norun: true, title: '참고 · PyTorch 모델을 ONNX 로 내보내기 (PC 에서, 웹 실습 환경에서는 실행하지 않음)', code: String.raw`
# pip install torch torchvision onnx
import torch
import torchvision

model = torchvision.models.mobilenet_v3_small(weights='DEFAULT')   # 또는 직접 학습한 모델
model.eval()
dummy = torch.randn(1, 3, 224, 224)                                 # 입력 모양 = 추론 때 blob 모양
torch.onnx.export(model, dummy, 'classifier.onnx', input_names=['input'], output_names=['logits'], opset_version=13)

# OpenCV 에서 사용
import cv2 as cv
net = cv.dnn.readNetFromONNX('classifier.onnx')
blob = cv.dnn.blobFromImage(cv.imread('crop.png'), 1 / 255.0, (224, 224), mean=(0.485 * 255, 0.456 * 255, 0.406 * 255), swapRB=True)
net.setInput(blob)
print(net.forward().argmax())
`, desc: '<p>핵심은 ① <code>model.eval()</code> ② 추론과 같은 입력 모양의 dummy ③ 학습 때와 같은 정규화(mean · scale · RGB 순서)를 <code>blobFromImage</code> 에 그대로 옮기는 것입니다. 전처리가 다르면 오류 없이 엉뚱한 답이 나오는 “조용한 버그”가 됩니다(a5-5).</p>' },
      { type: 'tip', html: `<p><b>수료 후 공부 방법</b>: ① PC 에 Python + <code>pip install opencv-contrib-python</code> 을 설치해 이 강좌의 코드를 데스크톱에서 돌려 보기(while 루프 버전) ② 팀 프로젝트를 GitHub 에 README(문제 · 데이터 · 평가표 · 데모 GIF)와 함께 올리기 ③ OpenCV 공식 튜토리얼에서 위 로드맵 중 하나를 골라 매주 한 단원씩 — 이번 과정처럼 “예제 실행 → 정답 있는 데이터로 평가 → 한 장으로 정리” 순서로.</p>` },
    ],
    practice: [
      {
        title: '실습 1 · 비전 스튜디오에 “보행자 검출” 모드 추가하기 (최종 도전)',
        desc: `<p>간단히 만든 스튜디오(2개 모드)에 <b>mode 2: HOG 보행자 검출</b>을 추가하세요(3주차). 요구 사항:</p>
<ul><li>프레임을 가로 400 으로 줄여 <code>detectMultiScale(winStride=(8, 8), scale=1.1)</code> 로 검출 (속도)</li>
<li>찾은 상자를 원본 좌표로 되돌려 그리기, 정보 문구는 <code>people N</code></li>
<li>트랙바 mode 의 최댓값을 2 로 늘리고 MODES 에 이름 추가</li></ul>
<p>🎞️ vtest.mp4 입력에서 사람들에게 상자가 그려지고 HUD 에 사람 수 · ms 가 나오면 성공입니다.</p>`,
        starter: String.raw`
import time
import cv2 as cv
import numpy as np

HAAR = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
MODES = ['EDGES', 'HAAR FACE']                      # TODO 1: 'HOG PEOPLE' 추가
# TODO 2: HOGDescriptor + setSVMDetector(HOGDescriptor_getDefaultPeopleDetector()) 준비


def nothing(x):
    pass


cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 0, 1, nothing)  # TODO 3: 최댓값 2


def mode_edges(frame):
    edges = cv.Canny(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), 80, 160)
    return cv.cvtColor(edges, cv.COLOR_GRAY2BGR), f'edge px {cv.countNonZero(edges)}'


def mode_face(frame):
    faces = HAAR.detectMultiScale(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), 1.1, 5, minSize=(40, 40))
    for (x, y, w, h) in faces:
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)
    return frame, f'faces {len(faces)}'


# TODO 4: def mode_people(frame): 가로 400 으로 줄여 검출 → 원본 좌표로 그리기 → (frame, 'people N')


def process(frame):
    t0 = time.perf_counter()
    mode = min(cv.getTrackbarPos('mode', 'result'), len(MODES) - 1)
    funcs = [mode_edges, mode_face]                  # TODO 5: mode_people 추가
    out, info = funcs[mode](frame.copy())
    ms = (time.perf_counter() - t0) * 1000
    cv.rectangle(out, (0, 0), (out.shape[1], 34), (30, 30, 30), -1)
    cv.putText(out, f'[{mode}] {MODES[mode]}  {ms:.0f} ms  |  {info}', (10, 24), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv.LINE_AA)
    return out
`,
        hint: `<p><code>HOG = cv.HOGDescriptor()</code>, <code>HOG.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())</code>. 축소 배율 <code>s = 400 / frame.shape[1]</code>, 검출 상자 <code>(x, y, w, h)</code> 를 <code>/ s</code> 해서 int 로. 정지 이미지(messi5 등)에서는 사람을 못 찾아도 정상입니다.</p>`,
        solution: String.raw`
import time
import cv2 as cv
import numpy as np

HAAR = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
MODES = ['EDGES', 'HAAR FACE', 'HOG PEOPLE']
HOG = cv.HOGDescriptor()
HOG.setSVMDetector(cv.HOGDescriptor_getDefaultPeopleDetector())


def nothing(x):
    pass


cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 2, 2, nothing)


def mode_edges(frame):
    edges = cv.Canny(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), 80, 160)
    return cv.cvtColor(edges, cv.COLOR_GRAY2BGR), f'edge px {cv.countNonZero(edges)}'


def mode_face(frame):
    faces = HAAR.detectMultiScale(cv.cvtColor(frame, cv.COLOR_BGR2GRAY), 1.1, 5, minSize=(40, 40))
    for (x, y, w, h) in faces:
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)
    return frame, f'faces {len(faces)}'


def mode_people(frame):
    """가로 400 에서 HOG 보행자 검출 → 원본 좌표로 그리기."""
    s = min(1.0, 400 / frame.shape[1])
    small = cv.resize(frame, None, fx=s, fy=s, interpolation=cv.INTER_AREA) if s < 1 else frame
    rects, weights = HOG.detectMultiScale(small, winStride=(8, 8), scale=1.1)
    for (x, y, w, h), wt in zip(rects, np.ravel(weights)):
        x, y, w, h = int(x / s), int(y / s), int(w / s), int(h / s)
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv.putText(frame, f'{wt:.1f}', (x, y - 4), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv.LINE_AA)
    return frame, f'people {len(rects)}'


def process(frame):
    t0 = time.perf_counter()
    mode = min(cv.getTrackbarPos('mode', 'result'), len(MODES) - 1)
    funcs = [mode_edges, mode_face, mode_people]
    out, info = funcs[mode](frame.copy())
    ms = (time.perf_counter() - t0) * 1000
    cv.rectangle(out, (0, 0), (out.shape[1], 34), (30, 30, 30), -1)
    cv.putText(out, f'[{mode}] {MODES[mode]}  {ms:.0f} ms  |  {info}', (10, 24), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv.LINE_AA)
    return out
`,
      },
      {
        title: '실습 2 · 특징점 검출기 비교표 (ORB · AKAZE · BRISK · SIFT)',
        desc: `<p>다음 프로젝트에서 어떤 특징을 쓸지 근거를 만들어 봅시다. box.png ↔ box_in_scene.png 에서 네 검출기의 <b>키포인트 수 · 검출+기술 시간 · 좋은 매칭 수 · RANSAC 인라이어 수</b>를 표로 출력하세요.
기술자 종류에 맞는 NORM(이진 → HAMMING, SIFT → L2)을 고르는 것이 핵심입니다. 인라이어가 가장 많은 검출기와 가장 빠른 검출기를 출력하면 성공입니다.</p>`,
        starter: String.raw`
import time
import cv2 as cv
import numpy as np

cv.setRNGSeed(0)
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
detectors = {
    'ORB': (cv.ORB_create(1000), cv.NORM_HAMMING),
    'AKAZE': (cv.AKAZE_create(), cv.NORM_HAMMING),
    'BRISK': (cv.BRISK_create(), cv.NORM_HAMMING),
    'SIFT': (cv.SIFT_create(1000), cv.NORM_HAMMING),     # TODO 1: SIFT 에 맞는 NORM 으로 고치기
}

rows = []
print(f'{"name":6s} {"kp box":>6s} {"kp scene":>8s} {"ms":>6s} {"good":>5s} {"inliers":>7s}')
for name, (det, norm) in detectors.items():
    t = time.perf_counter()
    k1, d1 = det.detectAndCompute(box, None)
    k2, d2 = det.detectAndCompute(scene, None)
    ms = (time.perf_counter() - t) * 1000
    good, inliers = [], 0
    # TODO 2: BFMatcher(norm).knnMatch(k=2) + 비율 테스트(0.8) → good
    # TODO 3: good 가 4개 이상이면 findHomography(RANSAC, 5.0) → inliers
    rows.append((name, len(k1), len(k2), ms, len(good), inliers))
    print(f'{name:6s} {len(k1):6d} {len(k2):8d} {ms:6.1f} {len(good):5d} {inliers:7d}')
# TODO 4: 인라이어 최대 검출기, 시간 최소 검출기 출력
`,
        hint: `<p>SIFT 는 float32 기술자 → <code>cv.NORM_L2</code>. 매칭: <code>[p[0] for p in cv.BFMatcher(norm).knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance &lt; 0.8 * p[1].distance]</code>. 최대/최소는 <code>max(rows, key=lambda r: r[5])</code>, <code>min(rows, key=lambda r: r[3])</code>.</p>`,
        solution: String.raw`
import time
import cv2 as cv
import numpy as np

cv.setRNGSeed(0)
box = cv.imread('box.png', cv.IMREAD_GRAYSCALE)
scene = cv.imread('box_in_scene.png', cv.IMREAD_GRAYSCALE)
detectors = {
    'ORB': (cv.ORB_create(1000), cv.NORM_HAMMING),
    'AKAZE': (cv.AKAZE_create(), cv.NORM_HAMMING),
    'BRISK': (cv.BRISK_create(), cv.NORM_HAMMING),
    'SIFT': (cv.SIFT_create(1000), cv.NORM_L2),
}

rows = []
print(f'{"name":6s} {"kp box":>6s} {"kp scene":>8s} {"ms":>6s} {"good":>5s} {"inliers":>7s}')
for name, (det, norm) in detectors.items():
    t = time.perf_counter()
    k1, d1 = det.detectAndCompute(box, None)
    k2, d2 = det.detectAndCompute(scene, None)
    ms = (time.perf_counter() - t) * 1000
    good, inliers = [], 0
    if d1 is not None and d2 is not None:
        good = [p[0] for p in cv.BFMatcher(norm).knnMatch(d1, d2, k=2) if len(p) == 2 and p[0].distance < 0.8 * p[1].distance]
    if len(good) >= 4:
        src = np.float32([k1[m.queryIdx].pt for m in good])
        dst = np.float32([k2[m.trainIdx].pt for m in good])
        H, mask = cv.findHomography(src, dst, cv.RANSAC, 5.0)
        inliers = 0 if mask is None else int(mask.sum())
    rows.append((name, len(k1), len(k2), ms, len(good), inliers))
    print(f'{name:6s} {len(k1):6d} {len(k2):8d} {ms:6.1f} {len(good):5d} {inliers:7d}')
best = max(rows, key=lambda r: r[5])
fast = min(rows, key=lambda r: r[3])
print(f'\n인라이어 최다: {best[0]} ({best[5]}개) / 가장 빠름: {fast[0]} ({fast[3]:.0f} ms)')
print('→ 정확도가 중요하면 인라이어가 많은 쪽, 실시간이 중요하면 빠른 쪽. 둘 다 표로 근거를 남기기!')
`,
      },
    ],
    quiz: [
      { q: '[1주] SIFT 가 템플릿 매칭보다 물체 찾기에 유리한 가장 큰 이유는?', options: ['컬러 정보를 쓰기 때문', '크기와 회전이 달라져도 같은 점을 비슷한 기술자로 표현하기 때문', '항상 더 빠르기 때문', '학습 데이터가 필요 없기 때문'], answer: 1, explain: 'SIFT 는 스케일 공간과 주 방향으로 크기 · 회전 불변 기술자를 만듭니다. 템플릿 매칭은 크기 · 회전이 바뀌면 실패합니다.' },
      { q: '[1주] knnMatch(k=2) 후 비율 테스트(1등 거리 < 0.75 × 2등 거리)를 하는 목적은?', options: ['매칭 속도를 높이려고', '1등과 2등이 비슷해 애매한 매칭(반복 무늬 등)을 버려 오매칭을 줄이려고', '키포인트 수를 늘리려고', '호모그래피를 대신하려고'], answer: 1, explain: '확실한 매칭은 1등이 2등보다 훨씬 가깝습니다. 비슷하면 어느 쪽인지 모르는 애매한 매칭이므로 버립니다.' },
      { q: '[1주] findHomography 에 cv.RANSAC 을 주는 이유로 가장 알맞은 것은?', options: ['점이 4개보다 적어도 계산하려고', '오매칭(이상치)이 섞여 있어도 다수의 일관된 매칭으로 변환을 추정하려고', '결과를 정수로 만들려고', '왜곡 계수를 함께 구하려고'], answer: 1, explain: 'RANSAC 은 무작위 4점으로 가설을 세우고 가장 많은 점이 동의하는 변환을 고릅니다. mask 로 인라이어를 알려 줍니다.' },
      { q: '[2주] 카메라 캘리브레이션으로 구하는 “내부 파라미터”에 해당하지 않는 것은?', options: ['초점거리 fx, fy', '주점(광학 중심) cx, cy', '렌즈 왜곡 계수', '체스보드에 대한 카메라의 회전 rvec'], answer: 3, explain: 'rvec · tvec 은 사진마다 달라지는 외부 파라미터(자세)입니다. 내부 파라미터와 왜곡 계수는 카메라 · 렌즈 고유의 값입니다.' },
      { q: '[2주] solvePnP 가 돌려주는 tvec 의 단위는 무엇으로 정해질까요?', options: ['항상 픽셀', '항상 미터', '3D 점(object points)을 준 단위 — cm 로 주면 cm', '카메라 행렬의 단위'], answer: 2, explain: '3D 점을 cm 로 만들면 tvec 도 cm 입니다. 체스보드 칸 크기나 마커 크기를 실제 단위로 넣어야 실측이 됩니다.' },
      { q: '[2주] 스테레오 깊이에서 시차(disparity)가 큰 픽셀은?', options: ['카메라에서 먼 곳', '카메라에서 가까운 곳', '색이 밝은 곳', '왜곡이 큰 곳'], answer: 1, explain: '깊이 = 초점거리 × 기준선 / 시차 이므로 시차가 클수록 가깝습니다(손가락을 눈앞에 두고 한쪽 눈씩 감아 보면 크게 움직임).' },
      { q: '[3주] cv.ml.SVM 으로 분류를 학습할 때 올바른 데이터 형식은?', options: ['X float64, y float32', 'X float32 (N×차원), y int32 (N)', 'X uint8 이미지 리스트, y 문자열', 'X float32 (차원×N), y float64'], answer: 1, explain: 'cv.ml 은 샘플 행렬 float32 (ROW_SAMPLE) 와 분류용 정수 라벨을 요구합니다(a5-5 예제 3).' },
      { q: '[3주] K-Means 로 이미지 색을 줄일 때 K 의 의미는?', options: ['반복 횟수', '결과 이미지에 남는 대표 색의 개수(군집 수)', '블러 커널 크기', '학습 데이터 수'], answer: 1, explain: '모든 픽셀 색을 K 개 군집으로 나누고 각 픽셀을 소속 군집 중심색으로 바꿉니다.' },
      { q: '[3주] Haar 캐스케이드와 비교한 DNN 얼굴 검출기(YuNet)의 일반적인 특징은?', options: ['학습된 모델 파일이 필요 없다', '옆얼굴 · 조명 변화에 더 강하고 오검출이 적지만, 모델을 불러와 추론해야 한다', '항상 Haar 보다 느리고 부정확하다', '흑백 영상에서만 동작한다'], answer: 1, explain: 'DNN 은 다양한 데이터로 학습되어 강인하지만 모델 파일과 추론 비용이 필요합니다. 작은 YuNet 은 브라우저에서도 실시간에 가깝게 동작합니다.' },
      { q: '[프로젝트] 테스트 정확도 99% 인데 발표장 웹캠에서는 거의 동작하지 않았습니다. 가장 먼저 점검할 것은?', options: ['트랙바 색상', '학습/테스트 데이터가 같은 출처(쌍둥이 조각 · 같은 장면)라 누수됐거나, 실제 환경과 분포가 달랐는지', 'print 문 개수', '코드 줄 수'], answer: 1, explain: '누수와 분포 차이(합성 vs 실제, 조명 · 카메라 차이)가 “실험실에서만 되는” 결과의 대표 원인입니다. 출처 단위 분할과 실제 데이터 테스트로 확인합니다.' },
    ],
  },
]);
