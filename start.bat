@echo off
echo ============================================
echo   Starting AI Study Planner
echo ============================================
echo.
echo Make sure MongoDB is running!
echo.

echo Starting Spring Boot backend on port 8080...
start "Backend" cmd /k "cd backend && mvn spring-boot:run"

timeout /t 10 /nobreak > nul

echo Starting React frontend on port 5173...
start "Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo   App running at: http://localhost:5173
echo   Backend API at: http://localhost:8080
echo ============================================
echo.
start http://localhost:5173
