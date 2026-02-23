@echo off
echo ============================================
echo   AI Study Planner - Setup Script (Windows)
echo ============================================
echo.

echo [1/4] Checking prerequisites...
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java 17+ not found. Install from https://adoptium.net/
    pause & exit /b 1
)
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven not found. Install from https://maven.apache.org/
    pause & exit /b 1
)
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org/
    pause & exit /b 1
)
echo Prerequisites OK!

echo.
echo [2/4] IMPORTANT: Before running, open backend\src\main\resources\application.properties
echo and set your GEMINI_API_KEY (get it from https://aistudio.google.com)
echo.
pause

echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause & exit /b 1
)
cd ..

echo [4/4] Building backend...
cd backend
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Maven build failed
    pause & exit /b 1
)
cd ..

echo.
echo ============================================
echo   Setup complete!
echo   Run start.bat to launch the application
echo ============================================
pause
