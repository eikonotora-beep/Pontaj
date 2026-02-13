@echo off
cd /d "%~dp0"
start npm start
timeout /t 5 /nobreak
start npm run electron
pause
