"""🚀 응용 예제용 합성 이미지 생성 (모두 실행)

실제 데이터셋의 라이선스 문제를 피하기 위해 검사 · 인식용 샘플 이미지를 코드로 만듭니다.
분류별 생성 스크립트 tools/gen_app_images_<분류>.py 를 차례로 실행하며, 결과는 images/apps/ 에 저장됩니다.

사용: python tools/gen_app_images.py
"""
import glob
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

for script in sorted(glob.glob(os.path.join(ROOT, 'tools', 'gen_app_images_*.py'))):
    print(f'▶ {os.path.basename(script)}')
    r = subprocess.run([sys.executable, '-X', 'utf8', script], cwd=ROOT)
    if r.returncode:
        sys.exit(r.returncode)
