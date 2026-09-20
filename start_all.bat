@echo off
echo ===================================================
echo Starting ResQGrid All Servers (AI, Backend, Frontend)
echo ===================================================

echo [1/3] Starting AI Microservice (FastAPI on port 5000)...
start "ResQGrid AI Service (Port 5000)" cmd /k "cd /d %~dp0ai-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload"

echo [2/3] Starting Spring Boot Backend (Port 8080)...
start "ResQGrid Backend (Port 8080)" cmd /k "cd /d %~dp0backend && set JAVA_HOME=C:\Program Files\Java\jdk-21&& mvnw.cmd spring-boot:run"

echo [3/3] Starting Frontend Dashboard (Vite on port 5173)...
start "ResQGrid Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All services launched in separate windows!
echo - AI Service: http://localhost:5000 (docs: http://localhost:5000/docs)
echo - Backend API: http://localhost:8080
echo - Frontend Web: http://localhost:5173
