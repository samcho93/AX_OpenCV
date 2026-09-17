"""🏭 머신비전 외관검사 데모용 합성 이미지 생성

실제 카메라로 찍은 듯한 검사 이미지를 코드로 만듭니다 (조명 그라데이션 · 센서 노이즈 · 위치/각도 흔들림 · 초점 블러).
  pcb_*      PCB 기준(골든) 보드 + 정상 / 부품 누락 / 납땜 브리지 / 이물
  scratch_*  헤어라인(브러시드) 금속 표면 정상 / 스크래치 / 찍힘(점) / 얼룩
  measure_*  백라이트 와셔 실루엣 정상 / 구멍 과대 / 타원 변형 / 버(burr)
  blister_*  2×5 블리스터 포장 정상 / 누락 / 파손 / 이색 알약
  bottle_*   백라이트 병 5개 정상 / 충진 부족 / 캡 누락 / 과충진

사용: python tools/gen_app_images_inspection.py
(경로에 한글이 있어도 되도록 cv2.imencode + 파일 쓰기로 저장합니다)
"""
import math
import os

import cv2 as cv
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'apps')
W, H = 640, 480


# ---------------------------------------------------------------- 공통 도구
def save(name, img):
    os.makedirs(OUT, exist_ok=True)
    ok, buf = cv.imencode('.png', np.clip(img, 0, 255).astype(np.uint8), [cv.IMWRITE_PNG_COMPRESSION, 9])
    assert ok, name
    path = os.path.join(OUT, name)
    with open(path, 'wb') as f:
        f.write(buf.tobytes())
    print(f'  {name:24s} {len(buf) / 1024:6.0f} KB')


def light_field(h, w, seed, strength=0.22, cx=None, cy=None, tilt=(0.10, -0.06)):
    """부드러운 조명 불균일: 방사형 비네팅 + 선형 기울기"""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx = w * (0.45 + 0.1 * rng.random()) if cx is None else cx
    cy = h * (0.45 + 0.1 * rng.random()) if cy is None else cy
    r2 = ((xx - cx) / w) ** 2 + ((yy - cy) / h) ** 2
    f = 1.0 - strength * r2 * 2.2
    f += tilt[0] * (xx / w - 0.5) + tilt[1] * (yy / h - 0.5)
    return f.astype(np.float32)


def finish(img, seed, light=None, blur=0.8, noise=3.0):
    """카메라 느낌: 조명 곱하기 → 초점 블러 → 센서 노이즈"""
    rng = np.random.default_rng(seed)
    out = img.astype(np.float32)
    if light is not None:
        out *= light[..., None] if out.ndim == 3 else light
    if blur > 0:
        out = cv.GaussianBlur(out, (0, 0), blur)
    if out.ndim == 3:   # 센서 노이즈는 주로 밝기 성분 + 약간의 색 노이즈
        out += rng.normal(0, noise, out.shape[:2] + (1,)).astype(np.float32)
        out += rng.normal(0, noise * 0.3, out.shape).astype(np.float32)
    else:
        out += rng.normal(0, noise, out.shape).astype(np.float32)
    return np.clip(out, 0, 255).astype(np.uint8)


def rigid(img, dx, dy, ang, border):
    h, w = img.shape[:2]
    M = cv.getRotationMatrix2D((w / 2, h / 2), ang, 1.0)
    M[:, 2] += (dx, dy)
    return cv.warpAffine(img, M, (w, h), flags=cv.INTER_LINEAR, borderMode=cv.BORDER_CONSTANT, borderValue=border)


# ---------------------------------------------------------------- 1) PCB
S = 2  # PCB 는 2배 해상도로 그린 뒤 줄여서 안티앨리어싱


def draw_pcb(defect=None):
    cw, ch = W * S, H * S
    rng = np.random.default_rng(7)                    # 보드 배선은 항상 같게
    img = np.zeros((ch, cw, 3), np.float32)
    img[:] = (46, 48, 50)
    img += rng.normal(0, 4, (ch, cw, 1)).astype(np.float32)
    bx0, by0, bx1, by1 = 70, 50, 1210, 910
    board = np.zeros((ch, cw), np.uint8)
    cv.rectangle(board, (bx0 + 20, by0), (bx1 - 20, by1), 255, -1)
    cv.rectangle(board, (bx0, by0 + 20), (bx1, by1 - 20), 255, -1)
    for x, y in [(bx0 + 20, by0 + 20), (bx1 - 20, by0 + 20), (bx0 + 20, by1 - 20), (bx1 - 20, by1 - 20)]:
        cv.circle(board, (x, y), 20, 255, -1)
    green = np.zeros_like(img)
    green[:] = (38, 108, 28)
    tex = cv.GaussianBlur(rng.normal(0, 1, (ch, cw)).astype(np.float32), (0, 0), 3) * 10
    green += tex[..., None] * np.float32([0.4, 1.0, 0.4])
    img[board > 0] = green[board > 0]

    def T(p):
        return tuple(int(round(v)) for v in p)

    # 배선(트레이스) + 비아
    trace = (48, 140, 38)
    for _ in range(46):
        x, y = rng.integers(bx0 + 60, bx1 - 60), rng.integers(by0 + 60, by1 - 60)
        pts = [(x, y)]
        for _ in range(rng.integers(2, 4)):
            if rng.random() < 0.5:
                x = int(np.clip(x + rng.integers(-260, 260), bx0 + 40, bx1 - 40))
            else:
                y = int(np.clip(y + rng.integers(-220, 220), by0 + 40, by1 - 40))
            pts.append((x, y))
        cv.polylines(img, [np.int32(pts)], False, trace, int(rng.choice([6, 6, 8, 12])), cv.LINE_AA)
        for p in (pts[0], pts[-1]):
            cv.circle(img, p, 11, (70, 150, 185), -1, cv.LINE_AA)
            cv.circle(img, p, 5, (25, 30, 25), -1, cv.LINE_AA)

    # 부품 그림자용 마스크
    shadow = np.zeros((ch, cw), np.float32)
    parts = []   # 그리기 함수 목록 (그림자 뒤에 그림)

    silk = (225, 230, 228)

    def label(txt, org, sc=0.9):
        cv.putText(img, txt, org, cv.FONT_HERSHEY_SIMPLEX, sc, silk, 2, cv.LINE_AA)

    def pad(x0, y0, x1, y1):
        cv.rectangle(img, T((x0, y0)), T((x1, y1)), (170, 175, 178), -1, cv.LINE_AA)

    def metal(x0, y0, x1, y1, col=(200, 203, 205)):
        cv.rectangle(img, T((x0, y0)), T((x1, y1)), col, -1, cv.LINE_AA)
        cv.line(img, T((x0 + 2, y0 + 2)), T((x1 - 2, y0 + 2)), (240, 242, 244), 2, cv.LINE_AA)

    # --- U1: QFP (정사각 IC)
    def qfp(cx, cy, size=190, n=12, name='U1'):
        pitch = size * 0.8 / (n - 1)
        for i in range(n):
            o = -size * 0.4 + i * pitch
            for sx, sy, horiz in [(0, -1, False), (0, 1, False), (-1, 0, True), (1, 0, True)]:
                if horiz:
                    px, py = cx + sx * (size / 2 + 16), cy + o
                    pad(px - 20, py - 5, px + 20, py + 5)
                else:
                    px, py = cx + o, cy + sy * (size / 2 + 16)
                    pad(px - 5, py - 20, px + 5, py + 20)
        cv.rectangle(shadow, T((cx - size / 2, cy - size / 2)), T((cx + size / 2, cy + size / 2)), 1, -1)

        def body():
            for i in range(n):
                o = -size * 0.4 + i * pitch
                metal(cx + o - 4, cy - size / 2 - 26, cx + o + 4, cy + size / 2 + 26)
                metal(cx - size / 2 - 26, cy + o - 4, cx + size / 2 + 26, cy + o + 4)
            cv.rectangle(img, T((cx - size / 2, cy - size / 2)), T((cx + size / 2, cy + size / 2)), (34, 34, 36), -1, cv.LINE_AA)
            cv.rectangle(img, T((cx - size / 2 + 8, cy - size / 2 + 8)), T((cx + size / 2 - 8, cy + size / 2 - 8)), (44, 44, 47), 2, cv.LINE_AA)
            cv.circle(img, T((cx - size / 2 + 26, cy - size / 2 + 26)), 9, (70, 70, 72), -1, cv.LINE_AA)
            cv.putText(img, 'STM32', T((cx - 62, cy + 5)), cv.FONT_HERSHEY_SIMPLEX, 1.0, (150, 150, 150), 2, cv.LINE_AA)
            cv.putText(img, 'F103C8', T((cx - 60, cy + 42)), cv.FONT_HERSHEY_SIMPLEX, 0.8, (130, 130, 130), 2, cv.LINE_AA)
            label(name, T((cx - size / 2, cy - size / 2 - 44)))
        parts.append(body)

    # --- SOIC (양쪽 핀)
    def soic(cx, cy, bw, bh, n, name, bridge=False):
        pitch = bw * 0.84 / (n - 1)
        for i in range(n):
            px = cx - bw * 0.42 + i * pitch
            for sy in (-1, 1):
                pad(px - 9, cy + sy * (bh / 2 + 18) - 16, px + 9, cy + sy * (bh / 2 + 18) + 16)
        cv.rectangle(shadow, T((cx - bw / 2, cy - bh / 2)), T((cx + bw / 2, cy + bh / 2)), 1, -1)

        def body():
            for i in range(n):
                px = cx - bw * 0.42 + i * pitch
                metal(px - 6, cy - bh / 2 - 30, px + 6, cy + bh / 2 + 30)
            cv.rectangle(img, T((cx - bw / 2, cy - bh / 2)), T((cx + bw / 2, cy + bh / 2)), (32, 32, 34), -1, cv.LINE_AA)
            cv.circle(img, T((cx - bw / 2 + 18, cy + bh / 2 - 18)), 7, (70, 70, 72), -1, cv.LINE_AA)
            cv.putText(img, name[0:2] == 'U2' and 'LM358' or '24C02', T((cx - 45, cy + 12)), cv.FONT_HERSHEY_SIMPLEX, 0.9, (140, 140, 140), 2, cv.LINE_AA)
            label(name, T((cx + bw / 2 + 14, cy + 12)))
            if bridge:   # 핀 3~5 사이 땜납 브리지
                x0 = cx - bw * 0.42 + 2 * pitch
                x1 = cx - bw * 0.42 + 4 * pitch
                yb = cy + bh / 2 + 34
                blob = np.int32([T((x0 - 4, yb - 10)), T(((x0 + x1) / 2, yb - 16)), T((x1 + 4, yb - 10)),
                                 T((x1 + 6, yb + 8)), T(((x0 + x1) / 2, yb + 14)), T((x0 - 6, yb + 8))])
                cv.fillPoly(img, [blob], (196, 200, 204), cv.LINE_AA)
                cv.ellipse(img, T(((x0 + x1) / 2, yb - 6)), (int((x1 - x0) / 2), 4), 0, 0, 360, (240, 242, 245), -1, cv.LINE_AA)
        parts.append(body)

    # --- 칩 저항/콘덴서 (1206)
    def chip(cx, cy, name, vertical=False, cap=False, present=True):
        L, Wd = 66, 34
        if vertical:
            pad(cx - 20, cy - L / 2 - 8, cx + 20, cy - L / 2 + 20)
            pad(cx - 20, cy + L / 2 - 20, cx + 20, cy + L / 2 + 8)
            label(name, T((cx + 26, cy + 10)), 0.75)
        else:
            pad(cx - L / 2 - 8, cy - 20, cx - L / 2 + 20, cy + 20)
            pad(cx + L / 2 - 20, cy - 20, cx + L / 2 + 8, cy + 20)
            label(name, T((cx - 22, cy - 32)), 0.75)
        if not present:
            return
        if vertical:
            x0, y0, x1, y1 = cx - Wd / 2, cy - L / 2, cx + Wd / 2, cy + L / 2
        else:
            x0, y0, x1, y1 = cx - L / 2, cy - Wd / 2, cx + L / 2, cy + Wd / 2
        cv.rectangle(shadow, T((x0, y0)), T((x1, y1)), 1, -1)

        def body():
            bodyc = (70, 120, 165) if cap else (30, 30, 32)
            cv.rectangle(img, T((x0, y0)), T((x1, y1)), bodyc, -1, cv.LINE_AA)
            e = 12
            if vertical:
                metal(x0, y0, x1, y0 + e)
                metal(x0, y1 - e, x1, y1)
            else:
                metal(x0, y0, x0 + e, y1)
                metal(x1 - e, y0, x1, y1)
            if not cap:
                cv.putText(img, '103', T((cx - 16 if not vertical else cx - 14, cy + 7)), cv.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1, cv.LINE_AA)
        parts.append(body)

    # --- 전해 콘덴서 (윗면)
    def ecap(cx, cy, r, name):
        cv.circle(img, (cx, cy), r + 12, silk, 3, cv.LINE_AA)
        cv.circle(shadow, (cx, cy), r, 1, -1)

        def body():
            cv.circle(img, (cx, cy), r, (178, 180, 184), -1, cv.LINE_AA)
            cv.ellipse(img, (cx, cy), (r, r), 0, 200, 260, (60, 40, 30), -1, cv.LINE_AA)
            cv.circle(img, (cx, cy), r - 10, (200, 202, 205), 3, cv.LINE_AA)
            cv.line(img, (cx - r // 2, cy), (cx + r // 2, cy), (120, 122, 125), 4, cv.LINE_AA)
            cv.line(img, (cx, cy - r // 2), (cx, cy + r // 2), (120, 122, 125), 4, cv.LINE_AA)
            label(name, (cx + r + 16, cy + r))
        parts.append(body)

    # --- 핀 헤더
    def header(x0, y0, n, name):
        cv.rectangle(shadow, (x0, y0), (x0 + n * 50, y0 + 100), 1, -1)

        def body():
            cv.rectangle(img, (x0, y0), (x0 + n * 50, y0 + 100), (28, 28, 30), -1, cv.LINE_AA)
            for i in range(n):
                for j in range(2):
                    px, py = x0 + 25 + i * 50, y0 + 25 + j * 50
                    cv.rectangle(img, (px - 10, py - 10), (px + 10, py + 10), (60, 170, 205), -1, cv.LINE_AA)
                    cv.rectangle(img, (px - 4, py - 4), (px + 4, py + 4), (140, 220, 240), -1, cv.LINE_AA)
            label(name, (x0, y0 - 16))
        parts.append(body)

    def crystal(cx, cy, name):
        cv.rectangle(shadow, (cx - 60, cy - 24), (cx + 60, cy + 24), 1, -1)

        def body():
            cv.rectangle(img, (cx - 60, cy - 24), (cx + 60, cy + 24), (185, 188, 190), -1, cv.LINE_AA)
            cv.rectangle(img, (cx - 52, cy - 16), (cx + 52, cy + 16), (215, 218, 220), 3, cv.LINE_AA)
            cv.putText(img, '8.000', (cx - 36, cy + 9), cv.FONT_HERSHEY_SIMPLEX, 0.65, (90, 90, 90), 2, cv.LINE_AA)
            label(name, (cx - 60, cy - 36))
        parts.append(body)

    # 배치
    qfp(390, 330, name='U1')
    soic(820, 280, 230, 104, 8, 'U2', bridge=(defect == 'bridge'))
    soic(800, 560, 150, 90, 4, 'U3')
    for i in range(6):
        chip(200 + i * 90, 650, f'R{i + 1}', present=not (defect == 'missing' and i == 3))
    for i in range(3):
        chip(1090, 230 + i * 110, f'C{i + 1}', vertical=True, cap=True)
    ecap(1060, 700, 80, 'C5')
    header(150, 760, 7, 'J1')
    crystal(640, 800, 'Y1')
    # 기판 인쇄 · 피듀셜 · 장착 구멍
    for (x, y) in [(125, 105), (1155, 105), (125, 855), (1155, 855)]:
        cv.circle(img, (x, y), 30, (90, 170, 200), -1, cv.LINE_AA)
        cv.circle(img, (x, y), 18, (20, 22, 24), -1, cv.LINE_AA)
    for (x, y) in [(210, 110), (1000, 860)]:
        cv.circle(img, (x, y), 22, (38, 108, 28), -1, cv.LINE_AA)
        cv.circle(img, (x, y), 11, (80, 170, 215), -1, cv.LINE_AA)
    cv.putText(img, 'OCV-AOI DEMO  REV1.2', (560, 900), cv.FONT_HERSHEY_SIMPLEX, 0.8, silk, 2, cv.LINE_AA)
    cv.rectangle(img, (620, 90), (960, 150), silk, 2, cv.LINE_AA)
    cv.putText(img, 'SN 2026-0917', (640, 132), cv.FONT_HERSHEY_SIMPLEX, 0.9, silk, 2, cv.LINE_AA)

    # 그림자 → 부품
    sh = cv.GaussianBlur(np.roll(shadow, (7, 7), (0, 1)), (0, 0), 6)
    img *= (1 - 0.45 * sh)[..., None]
    for body in parts:
        body()

    if defect == 'extra':   # 구리선 조각(이물)
        pts = np.float32([[560, 520], [590, 500], [630, 506], [660, 530], [690, 540]])
        cv.polylines(img, [pts.astype(np.int32)], False, (40, 95, 170), 7, cv.LINE_AA)
        cv.polylines(img, [(pts + (0, -2)).astype(np.int32)], False, (110, 170, 230), 2, cv.LINE_AA)
    return img


def gen_pcb():
    light = light_field(H, W, 101, strength=0.18)
    samples = [('pcb_golden.png', None, (0, 0, 0), 11),
               ('pcb_ok.png', None, (9, -6, 1.2), 12),
               ('pcb_missing.png', 'missing', (-7, 5, -1.0), 13),
               ('pcb_bridge.png', 'bridge', (5, 8, 0.8), 14),
               ('pcb_extra.png', 'extra', (-10, -4, -1.5), 15)]
    for name, defect, (dx, dy, ang), seed in samples:
        big = draw_pcb(defect)
        big = rigid(big, dx * S, dy * S, ang, (46, 48, 50))
        small = cv.resize(big, (W, H), interpolation=cv.INTER_AREA)
        save(name, finish(small, seed, light, blur=0.6, noise=2.0))


# ---------------------------------------------------------------- 2) 금속 표면
def metal_base(seed):
    rng = np.random.default_rng(seed)
    pad = 60
    hh, ww = H + 2 * pad, W + 2 * pad
    n1 = cv.blur(rng.normal(0, 1, (hh, ww)).astype(np.float32), (181, 1))
    n2 = cv.blur(rng.normal(0, 1, (hh, ww)).astype(np.float32), (41, 1))
    n1 /= n1.std() + 1e-6
    n2 /= n2.std() + 1e-6
    tex = 142 + 6 * n1 + 4 * n2
    tex = rigid(tex, 0, 0, float(rng.uniform(-2, 2)), 142)[pad:pad + H, pad:pad + W]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    band = 1 + 0.22 * np.exp(-((yy - H * rng.uniform(0.35, 0.6)) / 130) ** 2)    # 선형 조명 반사 띠
    return tex * band, rng


def gen_scratch():
    light = light_field(H, W, 202, strength=0.16, tilt=(0.12, 0.0))
    tint = np.float32([1.03, 1.0, 0.96])

    def out(name, g, seed, stain=None):
        img = g[..., None] * tint
        if stain is not None:
            img = img * (1 - stain[..., None] * np.float32([0.46, 0.36, 0.26]))
        save(name, finish(img, seed, light, blur=0.7, noise=2.5))

    g, _ = metal_base(21)
    out('scratch_ok.png', g, 31)

    # 긴 스크래치: 밝은 중심선 + 한쪽 어두운 가장자리
    g, rng = metal_base(22)
    t = np.linspace(0, 1, 200)
    x = 130 + 360 * t
    y = 390 - 280 * t + 30 * np.sin(t * 2.4)
    add = np.zeros((H, W), np.float32)
    dark = np.zeros((H, W), np.float32)
    for i in range(len(t) - 1):
        k = 0.6 + 0.4 * math.sin(i * 0.07 + 0.5) ** 2
        cv.line(add, (int(x[i] * 4), int(y[i] * 4)), (int(x[i + 1] * 4), int(y[i + 1] * 4)), 80 * k, 2, cv.LINE_AA, 2)
        cv.line(dark, (int(x[i] * 4 + 8), int(y[i] * 4 + 8)), (int(x[i + 1] * 4 + 8), int(y[i + 1] * 4 + 8)), 35 * k, 1, cv.LINE_AA, 2)
    g = g + cv.GaussianBlur(add, (0, 0), 0.6) - cv.GaussianBlur(dark, (0, 0), 0.6)
    out('scratch_line.png', g, 32)

    # 찍힘(덴트) · 핀홀 점 결함
    g, rng = metal_base(23)
    for (cx, cy, r) in [(180, 150, 7), (430, 300, 5), (520, 110, 6)]:
        d = np.zeros((H, W), np.float32)
        cv.circle(d, (cx, cy), r, 80, -1, cv.LINE_AA)
        hl = np.zeros((H, W), np.float32)
        cv.ellipse(hl, (cx + 2, cy + 2), (r, r), 0, 20, 110, 45, 2, cv.LINE_AA)
        g = g - cv.GaussianBlur(d, (0, 0), 1.3) + cv.GaussianBlur(hl, (0, 0), 1.0)
    out('scratch_dent.png', g, 33)

    # 얼룩(물자국): 불규칙한 번짐 + 테두리가 진한 링
    g, rng = metal_base(24)
    field = np.zeros((H, W), np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    for _ in range(5):
        cx, cy = 400 + rng.normal(0, 22), 250 + rng.normal(0, 18)
        sx, sy = rng.uniform(22, 38), rng.uniform(18, 32)
        field += np.exp(-(((xx - cx) / sx) ** 2 + ((yy - cy) / sy) ** 2))
    m = np.clip((field - 0.35) * 3, 0, 1)
    m = cv.GaussianBlur(m, (0, 0), 2)
    ring = np.clip(1 - np.abs(field - 0.45) * 6, 0, 1)
    stain = np.clip(0.75 * m + 0.35 * cv.GaussianBlur(ring, (0, 0), 1.5), 0, 1)
    out('scratch_stain.png', g, 34, stain=stain)


# ---------------------------------------------------------------- 3) 와셔 치수 (0.1 mm/px, M6 와셔 OD 12.0 / ID 6.4 mm)
def gen_measure():
    SS = 4
    MM = 10 * SS            # 1 mm = 10 px (x4 슈퍼샘플)
    centers = [(120, 115), (320, 115), (520, 115), (120, 330), (320, 330), (520, 330)]

    def render(name, seed, special=None):
        rng = np.random.default_rng(seed)
        part = np.zeros((H * SS, W * SS), np.uint8)
        for k, (cx, cy) in enumerate(centers):
            cx = (cx + rng.uniform(-8, 8)) * SS
            cy = (cy + rng.uniform(-6, 6)) * SS
            od = 12.0 + rng.uniform(-0.05, 0.05)
            idd = 6.4 + rng.uniform(-0.04, 0.04)
            c = (int(cx), int(cy))
            if special == ('oval', k):
                ang = 30
                cv.ellipse(part, c, (int(12.8 / 2 * MM), int(11.3 / 2 * MM)), ang, 0, 360, 255, -1, cv.LINE_8)
                cv.ellipse(part, c, (int(6.7 / 2 * MM), int(6.1 / 2 * MM)), ang, 0, 360, 0, -1, cv.LINE_8)
                continue
            cv.circle(part, c, int(od / 2 * MM), 255, -1, cv.LINE_8)
            if special == ('burr', k):
                a = math.radians(-50)
                base = [(od / 2 - 0.3, a - 0.13), (od / 2 - 0.3, a + 0.13), (od / 2 + 0.9, a + 0.04), (od / 2 + 1.05, a - 0.01)]
                pts = np.int32([[cx + r * MM * math.cos(t), cy + r * MM * math.sin(t)] for r, t in base])
                cv.fillPoly(part, [pts], 255, cv.LINE_8)
            if special == ('hole', k):
                idd = 7.1
            cv.circle(part, c, int(idd / 2 * MM), 0, -1, cv.LINE_8)
        # 먼지 몇 개 (작아서 무시돼야 함)
        for _ in range(3):
            cv.circle(part, (int(rng.uniform(20, W - 20) * SS), int(rng.uniform(215, 228) * SS)), int(rng.uniform(1, 2.5) * SS), 255, -1)
        m = cv.resize(part, (W, H), interpolation=cv.INTER_AREA).astype(np.float32) / 255
        m = cv.GaussianBlur(m, (0, 0), 1.0)
        bg = 238 * light_field(H, W, 303, strength=0.14, tilt=(0.05, 0.04))
        img = bg * (1 - m) + 28 * m
        img = np.repeat(img[..., None], 3, 2) * np.float32([1.0, 0.99, 0.97])
        save(name, finish(img, seed + 50, None, blur=0.0, noise=2.5))

    render('measure_ok.png', 41)
    render('measure_hole.png', 42, ('hole', 4))
    render('measure_oval.png', 43, ('oval', 1))
    render('measure_burr.png', 44, ('burr', 5))


# ---------------------------------------------------------------- 4) 블리스터 포장
PACK_W, PACK_H = 520, 260   # 1배 크기 (5×2 칸, 칸 104×130)


def gen_blister():
    SS = 2

    def render(name, seed, special=None):
        rng = np.random.default_rng(seed)
        cw, chh = W * SS, H * SS
        # 컨베이어 벨트
        belt = 52 + cv.GaussianBlur(rng.normal(0, 1, (chh, cw)).astype(np.float32), (0, 0), 1.2) * 6
        bg = np.stack([belt * 1.1, belt * 1.0, belt * 0.9], 2)
        for yb in range(0, chh, 64):
            bg[yb:yb + 3] *= 0.8
        # 포장(알루미늄 포일 + 투명 PVC 포켓)을 포장 좌표계에 그림
        pw, ph = PACK_W * SS, PACK_H * SS
        pack = np.zeros((ph, pw, 3), np.float32)
        foil = 176 + cv.blur(rng.normal(0, 1, (ph, pw)).astype(np.float32), (1, 25)) * 10
        pack[:] = np.stack([foil * 1.02, foil, foil * 0.97], 2)
        pmask = np.zeros((ph, pw), np.uint8)
        cv.rectangle(pmask, (0, 0), (pw - 1, ph - 1), 255, -1)
        for i in range(1, 5):            # 절취선
            x = i * pw // 5
            for yy in range(10, ph - 10, 18):
                cv.line(pack, (x, yy), (x, yy + 9), (120, 120, 122), 2, cv.LINE_AA)
        for yy in (ph // 2,):
            for xx in range(10, pw - 10, 18):
                cv.line(pack, (xx, yy), (xx + 9, yy), (120, 120, 122), 2, cv.LINE_AA)
        cv.rectangle(pack, (3, 3), (pw - 4, ph - 4), (140, 142, 145), 4, cv.LINE_AA)
        cellw, cellh = pw / 5, ph / 2
        for r in range(2):
            for c in range(5):
                k = r * 5 + c
                cx, cy = int((c + 0.5) * cellw), int((r + 0.5) * cellh)
                # 포켓(돔)
                dome = np.zeros((ph, pw), np.float32)
                cv.ellipse(dome, (cx, cy), (40 * SS, 54 * SS), 0, 0, 360, 1, -1, cv.LINE_AA)
                pack *= (1 - 0.12 * dome)[..., None]
                cv.ellipse(pack, (cx, cy), (40 * SS, 54 * SS), 0, 0, 360, (110, 112, 115), 3 * SS, cv.LINE_AA)
                kind = special.get(k, 'ok') if special else 'ok'
                if kind != 'missing':
                    col = {'ok': (40, 128, 236), 'broken': (40, 128, 236), 'color': (205, 120, 45)}[kind]
                    ox, oy = cx + rng.integers(-4, 5) * SS, cy + rng.integers(-5, 6) * SS
                    ang = float(rng.uniform(-10, 10))
                    pill = np.zeros((ph, pw), np.uint8)
                    cv.ellipse(pill, (ox, oy), (28 * SS, 45 * SS), ang, 0, 360, 255, -1, cv.LINE_AA)
                    if kind == 'broken':   # 톱니 모양으로 반쯤 깨짐
                        cut = [(ox - 60 * SS, oy - 3 * SS)]
                        for j in range(9):
                            cut.append((ox - 30 * SS + j * 7.5 * SS, oy + rng.integers(-6, 7) * SS))
                        cut += [(ox + 60 * SS, oy + 2 * SS), (ox + 60 * SS, oy - 80 * SS), (ox - 60 * SS, oy - 80 * SS)]
                        cv.fillPoly(pill, [np.int32(cut)], 0)
                        for _ in range(4):
                            cv.circle(pill, (ox + int(rng.integers(-24, 24)) * SS, oy - int(rng.integers(20, 40)) * SS), int(rng.integers(2, 4)) * SS, 255, -1, cv.LINE_AA)
                    pm = pill.astype(np.float32) / 255
                    dist = cv.distanceTransform((pill > 127).astype(np.uint8), cv.DIST_L2, 5)
                    shade = 0.72 + 0.28 * np.clip(dist / (14 * SS), 0, 1)
                    pillimg = np.float32(col)[None, None, :] * shade[..., None]
                    pack = pack * (1 - pm[..., None]) + pillimg * pm[..., None]
                    if kind != 'broken':
                        cv.line(pack, (int(ox - 20 * SS), oy), (int(ox + 20 * SS), oy), tuple(v * 0.6 for v in col), SS, cv.LINE_AA)
                # 돔 반사광
                hl = np.zeros((ph, pw), np.float32)
                cv.ellipse(hl, (cx, cy), (32 * SS, 46 * SS), 0, 200, 250, 1, 3 * SS, cv.LINE_AA)
                hl = cv.GaussianBlur(hl, (0, 0), 3)
                pack = pack + 150 * hl[..., None]
        # 포장을 흔들어 배경에 합성
        ang = float(rng.uniform(-5, 5))
        dx, dy = rng.uniform(-18, 18) * SS, rng.uniform(-14, 14) * SS
        M = cv.getRotationMatrix2D((pw / 2, ph / 2), ang, 1.0)
        M[:, 2] += ((cw - pw) / 2 + dx, (chh - ph) / 2 + dy)
        pk = cv.warpAffine(pack, M, (cw, chh), flags=cv.INTER_LINEAR)
        mk = cv.warpAffine(pmask, M, (cw, chh), flags=cv.INTER_LINEAR).astype(np.float32) / 255
        sh = cv.GaussianBlur(np.roll(mk, (8, 8), (0, 1)), (0, 0), 8)
        bg *= (1 - 0.5 * sh)[..., None]
        img = bg * (1 - mk[..., None]) + pk * mk[..., None]
        img = cv.resize(img, (W, H), interpolation=cv.INTER_AREA)
        save(name, finish(img, seed + 50, light_field(H, W, 404, strength=0.2), blur=0.6, noise=2.5))

    render('blister_ok.png', 51)
    render('blister_missing.png', 52, {3: 'missing'})
    render('blister_broken.png', 53, {6: 'broken'})
    render('blister_color.png', 54, {8: 'color'})


# ---------------------------------------------------------------- 5) 병 충진 높이 · 캡
def gen_bottle():
    SS = 2

    def halfw(y):
        """병 윤곽: y(1배 px) → 반폭"""
        if y < 64:
            return 0
        if y < 70:
            return 17
        if y < 122:
            return 14.5
        if y < 176:
            t = (y - 122) / 54
            return 14.5 + (40 - 14.5) * (0.5 - 0.5 * math.cos(math.pi * t))
        if y < 420:
            return 40
        if y < 428:
            return 40 - (y - 420) ** 2 / 8 * 0.9
        return 0

    def render(name, seed, special=None):
        rng = np.random.default_rng(seed)
        special = special or {}
        cw, chh = W * SS, H * SS
        light = light_field(chh, cw, 505, strength=0.12, tilt=(0.06, 0.08))
        bgv = 236 * light
        img = np.stack([bgv * 0.99, bgv, bgv * 1.0], 2)
        yy, xx = np.mgrid[0:chh, 0:cw].astype(np.float32)
        hw_row = np.float32([halfw(y / SS) * SS for y in range(chh)])
        for k in range(5):
            cx = (80 + k * 120 + rng.uniform(-6, 6)) * SS
            kind = special.get(k, 'ok')
            level = {'ok': 100 + rng.uniform(-3, 3), 'under': 152, 'over': 74}.get(kind, 100 + rng.uniform(-3, 3)) * SS
            dxn = (xx - cx) / np.maximum(hw_row[:, None], 1)
            inside = (np.abs(dxn) <= 1) & (hw_row[:, None] > 0)
            ad = np.abs(dxn)
            trans = 0.92 - 0.55 * np.clip(ad, 0, 1) ** 10          # 벽 가장자리 굴절로 어두움
            wall = np.clip((ad - 0.9) * 10, 0, 1)
            trans = trans * (1 - 0.55 * wall)
            glass = np.stack([trans, trans, trans * 0.98], 2)
            menis = level - 3 * SS * np.clip(ad, 0, 1) ** 4        # 벽 쪽이 살짝 올라간 메니스커스
            liq = (yy >= menis) & inside
            absorb = np.float32([0.24, 0.55, 0.90])
            f = np.where(liq[..., None], glass * absorb, glass)
            surf = inside & (np.abs(yy - menis) < 1.5 * SS)
            f[surf] *= 0.55
            img = np.where(inside[..., None], img * f, img)
            # 라벨 (불투명, 정면 조명)
            ly0, ly1 = 262 * SS, 352 * SS
            lab = inside & (yy >= ly0) & (yy < ly1)
            labc = np.float32([205, 222, 228]) * (0.85 + 0.15 * (1 - ad[..., None] ** 2))
            img = np.where(lab[..., None], labc, img)
            ib = int(cx)
            cv.rectangle(img, (ib - 40 * SS, 280 * SS), (ib + 40 * SS, 300 * SS), (40, 40, 170), -1)
            cv.putText(img, 'OCV', (ib - 22 * SS, 332 * SS), cv.FONT_HERSHEY_SIMPLEX, 0.55 * SS, (60, 50, 40), SS, cv.LINE_AA)
            # 캡
            if kind != 'nocap':
                cv.rectangle(img, (ib - 19 * SS, 38 * SS), (ib + 19 * SS, 66 * SS), (150, 70, 25), -1, cv.LINE_AA)
                for j in range(-16, 17, 4):
                    cv.line(img, (ib + j * SS, 40 * SS), (ib + j * SS, 64 * SS), (110, 50, 18), 1, cv.LINE_AA)
                cv.rectangle(img, (ib - 19 * SS, 38 * SS), (ib + 19 * SS, 42 * SS), (190, 110, 60), -1, cv.LINE_AA)
        # 컨베이어
        cv.rectangle(img, (0, 428 * SS), (cw, chh), (62, 64, 66), -1)
        cv.rectangle(img, (0, 428 * SS), (cw, 432 * SS), (120, 122, 125), -1)
        for x in range(0, cw, 36 * SS):
            cv.line(img, (x, 440 * SS), (x, chh), (48, 50, 52), 2)
        img = cv.resize(img, (W, H), interpolation=cv.INTER_AREA)
        save(name, finish(img, seed + 50, None, blur=0.7, noise=2.5))

    render('bottle_ok.png', 61)
    render('bottle_under.png', 62, {2: 'under'})
    render('bottle_nocap.png', 63, {3: 'nocap'})
    render('bottle_over.png', 64, {1: 'over'})


if __name__ == '__main__':
    print('▶ PCB')
    gen_pcb()
    print('▶ 금속 표면')
    gen_scratch()
    print('▶ 와셔 치수')
    gen_measure()
    print('▶ 블리스터')
    gen_blister()
    print('▶ 병')
    gen_bottle()
