@echo off
echo Starting Agora...
echo.

REM Start Ollama in background
echo Starting Ollama...
start "" ollama serve

REM Wait a moment
timeout /t 2 /nobreak > nul

REM Start backend
echo Starting Backend (port 8000)...
start "Agora Backend" cmd /k "cd /d "%~dp0backend" && python main.py"

REM Wait for backend
timeout /t 3 /nobreak > nul

REM Start frontend
echo Starting Frontend (port 5173)...
start "Agora Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Agora is starting...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open Agora in your browser...
pause > nul

start http://localhost:5173