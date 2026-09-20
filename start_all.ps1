# ResQGrid Local Servers Launcher (PowerShell)
$rootDir = $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting ResQGrid Servers Locally" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. AI Microservice
Write-Host "[1/3] Starting AI Microservice (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\ai-service'; python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload"

# 2. Spring Boot Backend
Write-Host "[2/3] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; cd '$rootDir\backend'; .\mvnw.cmd spring-boot:run"

# 3. Frontend Web App
Write-Host "[3/3] Starting Frontend Web App (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; npm run dev"

Write-Host "`nAll servers initiated!" -ForegroundColor Green
Write-Host "• AI Microservice:  http://localhost:5000 (Swagger: http://localhost:5000/docs)" -ForegroundColor White
Write-Host "• Backend API:      http://localhost:8080" -ForegroundColor White
Write-Host "• Frontend Web App: http://localhost:5173" -ForegroundColor White
