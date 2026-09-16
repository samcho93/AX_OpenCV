@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo OpenCV-Python 강좌 서버를 시작합니다: http://localhost:8765
echo 종료하려면 이 창을 닫거나 Ctrl+C 를 누르세요.
start "" http://localhost:8765
where python >nul 2>nul && (python -m http.server 8765 --bind 127.0.0.1) || (py -m http.server 8765 --bind 127.0.0.1)
pause
