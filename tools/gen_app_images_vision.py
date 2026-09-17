"""🏙️ 실무 영상 분석 데모용 합성 이미지 생성

  - 택배 송장(QR 코드 + EAN-13 바코드)  : parcel_label.png, parcel_angle.png, parcel_two.png
  - ArUco 마커 장면(DICT_4X4_50)        : aruco_board.png, aruco_scene.png

모든 이미지는 코드로 그려서(라이선스 문제 없음) 카메라로 찍은 듯한 원근 · 조명 · 노이즈 · 흐림을 넣습니다.
난수 시드를 고정하므로 다시 실행해도 같은 이미지가 나옵니다.

사용: python tools/gen_app_images_vision.py
"""
import os

import cv2 as cv
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'apps')
FONT = cv.FONT_HERSHEY_SIMPLEX
FONT_B = cv.FONT_HERSHEY_DUPLEX


# 경로에 한글이 있으면 cv.imread / cv.imwrite 가 조용히 실패하므로 imdecode / imencode 사용
def save(name, img):
    ok, buf = cv.imencode('.png', img, [cv.IMWRITE_PNG_COMPRESSION, 9])
    assert ok
    path = os.path.join(OUT, name)
    with open(path, 'wb') as f:
        f.write(buf.tobytes())
    print(f'  {name:20s} {img.shape[1]}x{img.shape[0]}  {len(buf) // 1024} KB')


def load(rel, flags=cv.IMREAD_COLOR):
    return cv.imdecode(np.fromfile(os.path.join(ROOT, rel), np.uint8), flags)


# --------------------------------------------------------------- 공통 효과 ----
def camera_effects(img, rng, blur=0.8, noise=2.5, light=None):
    """조명 불균일 + 렌즈 흐림 + 센서 노이즈"""
    h, w = img.shape[:2]
    out = img.astype(np.float32)
    if light is not None:
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        cx, cy, strength, grad = light
        r = np.sqrt((xx - cx * w) ** 2 + (yy - cy * h) ** 2) / np.hypot(w, h)
        field = (1.08 - strength * r ** 1.6) * (1 + grad * (xx / w - 0.5))
        out *= field[..., None]
    out += rng.normal(0, noise, out.shape).astype(np.float32)
    out = cv.GaussianBlur(out, (0, 0), blur)  # 노이즈까지 렌즈 흐림을 거치게(실제 카메라 느낌 + PNG 용량 절약)
    return np.clip(out, 0, 255).astype(np.uint8)


def paste_warp(dst, src, quad, alpha=None, shadow=0.0, shadow_off=(8, 10), shadow_blur=9):
    """src 를 dst 의 사각형 quad(TL,TR,BR,BL) 위치로 원근 변환해 붙이기 (가장자리 안티에일리어싱 + 그림자)"""
    h, w = src.shape[:2]
    H = cv.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad))
    dh, dw = dst.shape[:2]
    if alpha is None:
        alpha = np.full((h, w), 255, np.uint8)
    # 크게 축소될 때 계단 현상을 줄이려고 미리 살짝 흐림
    scale = cv.contourArea(np.float32(quad)) / float(w * h)
    s = src
    if scale < 0.6:
        s = cv.GaussianBlur(src, (0, 0), 0.5 / max(np.sqrt(scale), 0.2))
    warped = cv.warpPerspective(s, H, (dw, dh), flags=cv.INTER_AREA if scale < 1 else cv.INTER_LINEAR, borderMode=cv.BORDER_REPLICATE)
    m = cv.warpPerspective(alpha, H, (dw, dh), flags=cv.INTER_LINEAR).astype(np.float32) / 255.0
    out = dst.astype(np.float32)
    if shadow > 0:
        sm = cv.warpAffine(m, np.float32([[1, 0, shadow_off[0]], [0, 1, shadow_off[1]]]), (dw, dh))
        sm = cv.GaussianBlur(sm, (0, 0), shadow_blur)
        out *= (1 - shadow * sm)[..., None]
    out = out * (1 - m[..., None]) + warped.astype(np.float32) * m[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


# ------------------------------------------------------------- EAN-13 ----
EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
EAN_R = [''.join('1' if c == '0' else '0' for c in p) for p in EAN_L]
EAN_G = [p[::-1] for p in EAN_R]
EAN_PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']


def ean13_full(d12):
    """12자리 + 검사 숫자(홀수 자리 ×1, 짝수 자리 ×3 의 합을 10의 배수로 맞추는 값)"""
    assert len(d12) == 12 and d12.isdigit()
    s = sum(int(c) * (1 if i % 2 == 0 else 3) for i, c in enumerate(d12))
    return d12 + str((10 - s % 10) % 10)


def ean13_bits(code):
    """13자리 → 95개 모듈(1=검은 막대). 첫 숫자는 왼쪽 6자리의 L/G 패턴 조합으로 숨겨짐"""
    par = EAN_PARITY[int(code[0])]
    bits = '101'
    for i, c in enumerate(code[1:7]):
        bits += (EAN_L if par[i] == 'L' else EAN_G)[int(c)]
    bits += '01010'
    for c in code[7:]:
        bits += EAN_R[int(c)]
    bits += '101'
    assert len(bits) == 95
    return bits


def draw_ean13(img, x, y, code, module=3, height=80):
    """(x, y) = 바코드 첫 막대의 왼쪽 위. 사람이 읽는 숫자도 아래에 인쇄"""
    bits = ean13_bits(code)
    guard = set(list(range(0, 3)) + list(range(45, 50)) + list(range(92, 95)))
    for i, b in enumerate(bits):
        if b == '1':
            hh = height + (module * 5 if i in guard else 0)
            cv.rectangle(img, (x + i * module, y), (x + (i + 1) * module - 1, y + hh), (15, 15, 15), -1)
    fs = module * 0.21
    th = cv.getTextSize('0', FONT, fs, 1)[0][1]
    ty = y + height + module + th  # 숫자는 짧은 막대 아래, 가드 막대 사이에
    cv.putText(img, code[0], (x - module * 8, ty), FONT, fs, (15, 15, 15), max(1, module // 2), cv.LINE_AA)
    for k, c in enumerate(code[1:7]):
        cv.putText(img, c, (x + module * (3 + 7 * k) + 2, ty), FONT, fs, (15, 15, 15), max(1, module // 2), cv.LINE_AA)
    for k, c in enumerate(code[7:]):
        cv.putText(img, c, (x + module * (50 + 7 * k) + 2, ty), FONT, fs, (15, 15, 15), max(1, module // 2), cv.LINE_AA)


def qr_image(text, box=5):
    enc = cv.QRCodeEncoder.create()
    q = enc.encode(text)  # 흰 여백(quiet zone) 포함, 모듈당 1픽셀
    q = cv.resize(q, None, fx=box, fy=box, interpolation=cv.INTER_NEAREST)
    return cv.cvtColor(q, cv.COLOR_GRAY2BGR)


# ------------------------------------------------------------ 택배 송장 ----
def make_label(rng, tracking, ean12, to_lines, zone, weight):
    W, H = 600, 460
    lab = np.empty((H, W, 3), np.uint8)
    lab[:] = (240, 246, 249)  # 살짝 따뜻한 종이색
    ink = (20, 20, 20)
    cv.rectangle(lab, (6, 6), (W - 7, H - 7), ink, 2)
    cv.rectangle(lab, (6, 6), (W - 7, 58), ink, -1)
    cv.putText(lab, 'EXPRESS PARCEL', (22, 44), FONT_B, 1.05, (250, 250, 250), 2, cv.LINE_AA)
    cv.putText(lab, 'NEXT DAY', (452, 42), FONT, 0.75, (250, 250, 250), 2, cv.LINE_AA)
    # 받는 사람 / 보내는 사람
    cv.putText(lab, 'TO', (22, 92), FONT, 0.5, (90, 90, 90), 1, cv.LINE_AA)
    for i, t in enumerate(to_lines):
        cv.putText(lab, t, (22, 126 + i * 32), FONT, 0.75 if i == 0 else 0.55, ink, 2 if i == 0 else 1, cv.LINE_AA)
    cv.putText(lab, 'FROM', (22, 246), FONT, 0.45, (90, 90, 90), 1, cv.LINE_AA)
    cv.putText(lab, 'OPENCV CLASS STORE, SUWON', (72, 246), FONT, 0.45, ink, 1, cv.LINE_AA)
    # QR 코드 (추적 URL) — 흰 여백(quiet zone) 포함
    url = 'https://track.example.com/p/' + tracking.replace('-', '')
    q = qr_image(url, box=6)
    qh, qw = q.shape[:2]
    lab[62:62 + qh, W - 10 - qw:W - 10] = q
    cv.line(lab, (6, 268), (W - 7, 268), ink, 2)
    cv.putText(lab, 'TRACKING NO. ' + tracking, (22, 296), FONT, 0.58, ink, 1, cv.LINE_AA)
    # EAN-13 바코드 (모듈 4px, 좌우 여백 확보)
    code = ean13_full(ean12)
    draw_ean13(lab, 50, 312, code, module=4, height=82)
    # 분류 구역 · 무게
    cv.rectangle(lab, (452, 282), (W - 16, H - 16), ink, 2)
    cv.putText(lab, 'SORT ZONE', (466, 310), FONT, 0.5, (70, 70, 70), 1, cv.LINE_AA)
    cv.putText(lab, zone, (464, 380), FONT_B, 1.25, ink, 3, cv.LINE_AA)
    cv.putText(lab, weight, (466, 420), FONT, 0.5, ink, 1, cv.LINE_AA)
    # 인쇄 번짐 · 종이 결
    lab = cv.GaussianBlur(lab, (0, 0), 0.6)
    lab = np.clip(lab.astype(np.float32) + rng.normal(0, 2.0, (H, W, 1)), 0, 255).astype(np.uint8)
    return lab, url, code


def cardboard(rng, w, h, tape=True):
    base = np.array([92, 138, 184], np.float32)  # BGR 골판지색
    n1 = cv.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 12) * 60
    n2 = cv.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), sigmaX=6, sigmaY=0.8) * 14  # 가로 섬유결
    img = base[None, None, :] * (1 + (n1 + n2)[..., None] / 255.0)
    img += rng.normal(0, 3, (h, w, 1))
    if tape:
        tw = int(w * 0.16)
        x0 = w // 2 - tw // 2
        img[:, x0:x0 + tw] = img[:, x0:x0 + tw] * 0.85 + np.array([150, 195, 225], np.float32) * 0.25
        img[:, x0:x0 + 2] *= 0.9
        img[:, x0 + tw - 2:x0 + tw] *= 0.9
    # 가장자리 어둡게(모서리 구김)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    edge = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy))
    img *= (0.82 + 0.18 * np.clip(edge / 25.0, 0, 1))[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)


def floor(rng, w, h):
    """물류센터 컨베이어 벨트(어두운 회색 고무 + 가로 줄무늬)"""
    img = np.full((h, w, 3), 62, np.float32)
    img += cv.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 3)[..., None] * 25
    for y in range(0, h, 46):
        img[y:y + 3] *= 0.7
    img[:, :, 0] += 4
    return np.clip(img, 0, 255).astype(np.uint8)


def rot_quad(cx, cy, w, h, deg, persp=(0, 0)):
    """중심 (cx,cy), 크기 w×h, 회전 deg 인 사각형 꼭짓점 TL,TR,BR,BL. persp=(위쪽 폭 축소 비율, 좌우 기울기)"""
    a = np.deg2rad(deg)
    R = np.array([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    top, side = persp
    pts = np.array([[-w / 2 * (1 - top), -h / 2], [w / 2 * (1 - top), -h / 2], [w / 2, h / 2], [-w / 2, h / 2]])
    pts[:, 0] += np.array([side, side, 0, 0]) * w
    return (pts @ R.T + [cx, cy]).astype(np.float32)


def parcel_scene(rng, W, H, parcels):
    """parcels: [(box_quad, label_args, box_size, side_depth)]"""
    img = floor(rng, W, H)
    meta = []
    for quad, largs, (bw, bh), depth in parcels:
        box = cardboard(rng, bw, bh)
        lab, url, code = make_label(rng, *largs)
        # 송장을 상자 가운데에 살짝 기울여 붙이기
        lw = int(bw * 0.8)
        lh = int(lw * lab.shape[0] / lab.shape[1])
        lq = rot_quad(bw / 2, bh / 2, lw, lh, float(rng.uniform(-3, 3)))
        box = paste_warp(box, lab, lq, shadow=0.15, shadow_off=(2, 3), shadow_blur=2)
        quad = np.float32(quad)
        # 상자 옆면(아래쪽으로 보이는 두께)
        side = np.float32([quad[3], quad[2], quad[2] + [0, depth], quad[3] + [0, depth]])
        side_tex = (cardboard(rng, bw, max(depth * 3, 30), tape=False).astype(np.float32) * 0.62).astype(np.uint8)
        img = paste_warp(img, side_tex, side, shadow=0.55, shadow_off=(14, 18), shadow_blur=14)
        img = paste_warp(img, box, quad)
        meta.append((url, code))
    return img, meta


def gen_parcels():
    print('▶ 택배 송장 (QR + EAN-13)')
    rng = np.random.default_rng(2024)
    # 1) 위에서 찍은 송장 (살짝 회전)
    W, H = 800, 600
    q1 = rot_quad(400, 285, 640, 470, -6, persp=(0.03, 0.0))
    img, meta = parcel_scene(rng, W, H, [
        (q1, ('5012-3456-7890', '880123456789', ['J. PARK', '12 TEHERAN-RO, GANGNAM-GU', 'SEOUL 06234'], 'B-07', 'WT 2.4 KG'), (640, 470), 26),
    ])
    img = camera_effects(img, rng, blur=0.7, noise=2.2, light=(0.35, 0.25, 0.55, 0.12))
    save('parcel_label.png', img)
    all_meta = list(meta)

    # 2) 비스듬히(원근) 찍은 송장
    rng = np.random.default_rng(77)
    q2 = np.float32([[190, 70], [640, 108], [770, 520], [40, 470]])
    img, meta = parcel_scene(rng, W, H, [
        (q2, ('7730-1188-2046', '880987654321', ['S. LEE', '45 GUKCHAEBOSANG-RO', 'DAEGU 41900'], 'D-12', 'WT 0.8 KG'), (640, 470), 40),
    ])
    img = camera_effects(img, rng, blur=0.9, noise=2.5, light=(0.8, 0.1, 0.6, -0.18))
    save('parcel_angle.png', img)
    all_meta += meta

    # 3) 컨베이어 위의 상자 두 개
    rng = np.random.default_rng(31)
    W, H = 960, 600
    qa = rot_quad(258, 300, 435, 338, 12, persp=(0.04, 0.02))
    qb = rot_quad(712, 305, 450, 348, -9, persp=(0.05, -0.02))
    img, meta = parcel_scene(rng, W, H, [
        (qa, ('3141-5926-5358', '490123456789', ['M. CHOI', '7 JUNGANG-RO', 'BUSAN 48940'], 'A-03', 'WT 5.1 KG'), (560, 430), 30),
        (qb, ('2718-2818-2845', '400638133393', ['H. KANG', '99 DAEHAK-RO', 'DAEJEON 34134'], 'C-21', 'WT 1.7 KG'), (560, 430), 30),
    ])
    img = camera_effects(img, rng, blur=0.8, noise=2.4, light=(0.5, 0.0, 0.5, 0.1))
    save('parcel_two.png', img)
    all_meta += meta
    return all_meta


# ---------------------------------------------------------------- ArUco ----
def aruco_dict():
    return cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50)


def marker_card(mid, px=200, margin=30, caption=None):
    m = cv.aruco.generateImageMarker(aruco_dict(), mid, px, borderBits=1)
    card = np.full((px + 2 * margin + (26 if caption else 0), px + 2 * margin, 3), 242, np.uint8)
    card[margin:margin + px, margin:margin + px] = cv.cvtColor(m, cv.COLOR_GRAY2BGR)
    if caption:
        cv.putText(card, caption, (margin, margin + px + 22), FONT, 0.55, (60, 60, 60), 1, cv.LINE_AA)
    return card


def wood(rng, w, h):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    n = cv.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), sigmaX=40, sigmaY=3)
    rings = np.sin((yy + n * 90) / 9.0) * 0.5 + 0.5
    base = np.array([70, 110, 160], np.float32)
    img = base * (0.8 + 0.25 * rings[..., None])
    img += cv.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), sigmaX=8, sigmaY=0.7)[..., None] * 18
    return np.clip(img, 0, 255).astype(np.uint8)


def gen_aruco():
    print('▶ ArUco 마커 장면 (DICT_4X4_50)')
    rng = np.random.default_rng(11)
    # 1) 책상 위 로봇 도킹 패드(마커 4개가 붙은 카드)를 비스듬히 찍은 장면
    W, H = 800, 600
    img = wood(rng, W, H)
    board = np.full((600, 840, 3), 238, np.uint8)
    cv.rectangle(board, (4, 4), (835, 595), (200, 200, 200), 2)
    # 마커를 서로 다른 방향(0°, 90°, 180°, 270°)으로 붙여 방향 인식을 확인할 수 있게
    for mid, (x, y) in zip([0, 1, 2, 3], [(40, 40), (640, 40), (640, 400), (40, 400)]):
        m = np.ascontiguousarray(np.rot90(cv.aruco.generateImageMarker(aruco_dict(), mid, 160, borderBits=1), mid))
        board[y:y + 160, x:x + 160] = cv.cvtColor(m, cv.COLOR_GRAY2BGR)
    cv.putText(board, 'ROBOT DOCKING PAD', (262, 290), FONT_B, 1.0, (40, 40, 40), 2, cv.LINE_AA)
    cv.putText(board, 'ArUco DICT_4X4_50  ID 0-3', (285, 330), FONT, 0.65, (90, 90, 90), 1, cv.LINE_AA)
    cv.drawMarker(board, (420, 460), (60, 60, 200), cv.MARKER_CROSS, 60, 3, cv.LINE_AA)
    quad = np.float32([[215, 150], [640, 170], [735, 500], [95, 470]])
    img = paste_warp(img, board, quad, shadow=0.45, shadow_off=(10, 14), shadow_blur=10)
    # 책상 위 소품: 머그컵(위에서 본 원)과 펜
    cv.ellipse(img, (110, 110), (62, 52), 0, 0, 360, (40, 40, 45), -1, cv.LINE_AA)
    cv.ellipse(img, (110, 106), (50, 41), 0, 0, 360, (25, 45, 70), -1, cv.LINE_AA)
    cv.line(img, (560, 70), (760, 120), (160, 60, 20), 9, cv.LINE_AA)
    cv.line(img, (560, 70), (590, 77), (200, 200, 200), 9, cv.LINE_AA)
    img = camera_effects(img, rng, blur=0.9, noise=2.5, light=(0.3, 0.2, 0.6, 0.15))
    save('aruco_board.png', img)

    # 2) 실내 장면(stuff.jpg) 곳곳에 붙인 마커 3개 — 크기 · 각도 · 원근이 서로 다름
    rng = np.random.default_rng(5)
    bg = load('images/stuff.jpg')
    bg = cv.resize(bg, (800, 600), interpolation=cv.INTER_CUBIC)
    img = bg
    cards = [
        (7, (150, 405), 150, -35, (0.06, 0.03)),     # (id, 중심, 폭, 회전, (원근 · 기울기))
        (23, (395, 180), 135, 100, (0.08, -0.02)),
        (42, (640, 440), 165, 195, (0.10, 0.04)),
    ]
    for mid, c, w, deg, persp in cards:
        card = marker_card(mid, px=200, margin=26, caption='ID %d' % mid)
        h = w * card.shape[0] / card.shape[1]  # 카드 비율 유지
        q = rot_quad(c[0], c[1], w, h, deg, persp=persp)
        img = paste_warp(img, card, q, shadow=0.4, shadow_off=(7, 9), shadow_blur=6)
    img = camera_effects(img, rng, blur=0.8, noise=2.8, light=(0.6, 0.3, 0.45, -0.1))
    save('aruco_scene.png', img)


# ------------------------------------------------------------ 자체 확인 ----
def self_check(parcel_meta):
    print('▶ 자체 확인 (단순 1회 디코딩 — 데모 코드는 실패 시 펴서 재시도하므로 더 많이 읽음)')
    for name in ['parcel_label.png', 'parcel_angle.png', 'parcel_two.png']:
        img = load('images/apps/' + name)
        ok, vals, pts, _ = cv.QRCodeDetectorAruco().detectAndDecodeMulti(img)
        try:
            bd = cv.barcode.BarcodeDetector()
            bd.setDownsamplingThreshold(1024)
            r = bd.detectAndDecodeWithType(img)
            bars = [v for v in (r[1] if r[0] else []) if v]
        except Exception as e:  # noqa
            bars = ['(barcode 오류: %s)' % e]
        print(f'  {name}: QR={[v for v in vals if v] if ok else []}  EAN={bars}')
    print('  기대값:', parcel_meta)
    det = cv.aruco.ArucoDetector(aruco_dict(), cv.aruco.DetectorParameters())
    for name in ['aruco_board.png', 'aruco_scene.png']:
        img = load('images/apps/' + name)
        corners, ids, _ = det.detectMarkers(img)
        print(f'  {name}: ids={sorted(ids.ravel().tolist()) if ids is not None else []}')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    meta = gen_parcels()
    gen_aruco()
    self_check(meta)
