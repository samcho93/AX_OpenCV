"""images/ 폴더의 샘플 이미지를 js/images-data.js 로 묶습니다.

file:// 로 index.html 을 직접 열어도 이미지를 Python 가상 파일시스템에 넣을 수 있도록
base64 로 인코딩해 둡니다. 이미지를 추가/삭제했다면 다시 실행하세요.

사용: python tools/build_images.py
"""
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, 'images')

# 이름: (설명, 주로 쓰는 단원) — 모두 OpenCV 공식 저장소(samples/data, doc/py_tutorials)의 이미지
DESC = {
    'messi5.jpg': ('축구 경기 장면 (메시)', '이미지 입출력 · ROI · 템플릿 매칭'),
    'messi_face.jpg': ('messi5.jpg 의 얼굴 부분 템플릿', '템플릿 매칭'),
    'lena.jpg': ('인물 사진 (Lena)', '필터 · 변환 전반'),
    'opencv-logo.png': ('OpenCV 로고 (컬러, 투명 배경)', '산술/비트 연산'),
    'opencv-logo-white.png': ('OpenCV 로고 (흰 글자)', '비트 연산 · 허프 원 변환'),
    'ml.png': ('머신러닝 일러스트', '이미지 블렌딩'),
    'sudoku.png': ('스도쿠 퍼즐 사진', '적응형 임계처리 · 원근 변환 · 허프 직선'),
    'gradient.png': ('검정→흰색 그라데이션', '단순 임계처리'),
    'j.png': ('글자 j (이진 이미지)', '모폴로지 연산'),
    'home.jpg': ('집 풍경 사진', '색 공간 · 히스토그램'),
    'water_coins.jpg': ('서로 맞닿은 동전들', '이진화 · 컨투어 · 동전 세기'),
    'smarties.png': ('초콜릿 캔디 (원형 물체)', '허프 원 변환 · 색상 추적'),
    'building.jpg': ('건물 외벽', '엣지 · 허프 직선'),
    'box.png': ('상자 사진', '엣지 · 컨투어'),
    'pic1.png': ('여러 도형 실루엣', '컨투어 · 도형 분석'),
    'cards.png': ('흩어진 카드', '컨투어 · 원근 변환'),
    'stuff.jpg': ('책상 위의 물건들', '색상 추적 · 컨투어'),
    'detect_blob.png': ('검은 배경의 초록·파랑 원/사각형/타원 도형 (540×760)', '색 공간 · 컨투어'),
    'blox.jpg': ('흑백 블록 도형 사진', '엣지 · 컨투어'),
    'notes.png': ('악보', '모폴로지 (선 추출)'),
    'butterfly.jpg': ('나비', '스무딩 · 필터'),
    'fruits.jpg': ('과일', '색 공간 · 히스토그램'),
    'baboon.jpg': ('맨드릴 원숭이', '필터 · 노이즈 제거'),
    'starry_night.jpg': ('별이 빛나는 밤 (고흐)', '필터 · 사진 필터 앱'),
    'apple.jpg': ('사과', '이미지 피라미드 블렌딩'),
    'orange.jpg': ('오렌지', '이미지 피라미드 블렌딩'),
    'HappyFish.jpg': ('물고기 그림', '크기 조절 · 기하 변환'),
    'LinuxLogo.jpg': ('리눅스 로고', '이미지 블렌딩'),
    'WindowsLogo.jpg': ('윈도우 로고', '이미지 블렌딩'),
    'chessboard.png': ('체스판 패턴 (1754×1240, 큼)', '기하 변환'),
}

ORDER = list(DESC.keys())


def main():
    files = [f for f in os.listdir(IMAGES) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    files.sort(key=lambda f: (ORDER.index(f) if f in ORDER else 999, f))
    items = []
    for f in files:
        with open(os.path.join(IMAGES, f), 'rb') as fp:
            b64 = base64.b64encode(fp.read()).decode('ascii')
        desc, use = DESC.get(f, ('', ''))
        items.append({'name': f, 'desc': desc, 'use': use, 'b64': b64})
    out = os.path.join(ROOT, 'js', 'images-data.js')
    with open(out, 'w', encoding='utf-8') as fp:
        fp.write('/* 자동 생성 파일 — python tools/build_images.py 로 다시 만드세요. */\n')
        fp.write('window.SAMPLE_IMAGES = ')
        json.dump(items, fp, ensure_ascii=False, separators=(',', ':'))
        fp.write(';\n')
    print(f'{len(items)}개 이미지 → {out} ({os.path.getsize(out) // 1024} KB)')


if __name__ == '__main__':
    main()
