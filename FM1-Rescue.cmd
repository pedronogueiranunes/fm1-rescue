@echo off
setlocal
cd /d "%~dp0"
if exist "..\venv\Scripts\pythonw.exe" (
  start "" "..\venv\Scripts\pythonw.exe" -B "%~dp0desktop.py" %*
  exit /b
)
where pyw >nul 2>nul
if not errorlevel 1 (
  start "" pyw -3 -B "%~dp0desktop.py" %*
  exit /b
)
where pythonw >nul 2>nul
if not errorlevel 1 (
  start "" pythonw -B "%~dp0desktop.py" %*
  exit /b
)
echo Python 3.10 or newer is required. Use the existing recovery environment.
pause
