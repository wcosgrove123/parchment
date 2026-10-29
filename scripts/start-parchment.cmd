@echo off
rem Starts Parchment: rebuilds on change and serves the atlas at http://127.0.0.1:8321, then opens it.
rem Keep this window open; close it to stop. If 8321 is already in use, Parchment is running elsewhere.
title Parchment
cd /d "%~dp0.."
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo.
echo   Parchment is running at  http://127.0.0.1:8321
echo   Keep this window open; close it to stop.
echo.
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://127.0.0.1:8321"
call npm run dev
if errorlevel 1 pause
