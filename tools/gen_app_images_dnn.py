"""딥러닝 데모용 합성 이미지 → images/apps/

- text_signs.png : 벽면의 여러 간판 · 안내판 (원근 · 조명 · 노이즈) — 글자 영역 검출 데모
"""
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'apps')
rng = np.random.default_rng(7)


def sign(w, h, bg, fg, lines, scale, thick, border=None):
    img = np.full((h, w, 3), bg, np.uint8)
    if border:
        cv2.rectangle(img, (6, 6), (w - 7, h - 7), border, 4)
    total = len(lines)
    for i, t in enumerate(lines):
        (tw, th), _ = cv2.getTextSize(t, cv2.FONT_HERSHEY_DUPLEX, scale, thick)
        y = int(h * (i + 1) / (total + 1) + th / 2)
        cv2.putText(img, t, ((w - tw) // 2, y), cv2.FONT_HERSHEY_DUPLEX, scale, fg, thick, cv2.LINE_AA)
    return img


def paste_warp(scene, patch, quad):
    h, w = patch.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad))
    warped = cv2.warpPerspective(patch, M, (scene.shape[1], scene.shape[0]))
    mask = cv2.warpPerspective(np.full((h, w), 255, np.uint8), M, (scene.shape[1], scene.shape[0]))
    mask = cv2.GaussianBlur(mask, (3, 3), 0).astype(np.float32)[:, :, None] / 255
    return (scene * (1 - mask) + warped * mask).astype(np.uint8)


def text_signs():
    H, W = 480, 720
    # 벽돌 느낌의 벽
    wall = np.zeros((H, W, 3), np.uint8)
    wall[:] = (70, 90, 120)
    for y in range(0, H, 24):
        off = 0 if (y // 24) % 2 == 0 else 30
        for x in range(-60, W, 60):
            c = np.array((70, 90, 120)) + rng.integers(-12, 12, 3)
            cv2.rectangle(wall, (x + off + 2, y + 2), (x + off + 58, y + 22), c.tolist(), -1)
    wall = cv2.GaussianBlur(wall, (3, 3), 0)
    scene = wall.copy()
    s1 = sign(420, 120, (30, 30, 30), (80, 220, 255), ['OpenCV COFFEE'], 1.7, 3, border=(80, 220, 255))
    s2 = sign(220, 150, (240, 240, 240), (20, 20, 200), ['SALE', '50% OFF'], 1.4, 3)
    s3 = sign(200, 90, (40, 140, 40), (255, 255, 255), ['EXIT'], 1.6, 3)
    s4 = sign(260, 120, (250, 250, 235), (40, 40, 40), ['OPEN 24 HOURS', 'Tel 010-1234'], 0.8, 2, border=(40, 40, 40))
    scene = paste_warp(scene, s1, [[150, 40], [590, 60], [585, 175], [148, 150]])
    scene = paste_warp(scene, s2, [[40, 230], [250, 215], [255, 370], [45, 380]])
    scene = paste_warp(scene, s3, [[480, 250], [670, 265], [668, 350], [478, 340]])
    scene = paste_warp(scene, s4, [[290, 300], [470, 310], [465, 420], [285, 410]])
    # 조명 그라데이션 + 노이즈
    gx = np.linspace(0.75, 1.1, W)[None, :, None]
    gy = np.linspace(1.05, 0.85, H)[:, None, None]
    scene = np.clip(scene * gx * gy + rng.normal(0, 4, scene.shape), 0, 255).astype(np.uint8)
    scene = cv2.GaussianBlur(scene, (3, 3), 0)
    ok, buf = cv2.imencode('.png', scene, [cv2.IMWRITE_PNG_COMPRESSION, 9])   # 한글 경로 대응
    open(os.path.join(OUT, 'text_signs.png'), 'wb').write(buf.tobytes())
    print('  text_signs.png', os.path.getsize(os.path.join(OUT, 'text_signs.png')) // 1024, 'KB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    text_signs()
