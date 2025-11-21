@echo off
REM Change to script directory to ensure correct paths
cd /d "%~dp0"

echo ========================================
echo  Library Management System - Dev Server
echo ========================================
echo.
echo [INFO] Working directory: %CD%
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

REM Check if backend venv exists, create if not
if not exist "backend\.venv" (
    echo [INFO] Creating virtual environment...
    cd backend
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    cd ..
    echo [INFO] Virtual environment created successfully!
)

REM Activate venv and check/install dependencies
echo [INFO] Activating virtual environment...
cd backend

REM Check if venv activation script exists
if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment activation script not found!
    echo Please delete backend\.venv and run this script again.
    pause
    exit /b 1
)

REM Activate venv in current session
call .venv\Scripts\activate.bat

REM Verify we're using venv Python
where python > temp_python_path.txt
set /p VENV_PYTHON=<temp_python_path.txt
del temp_python_path.txt
echo [INFO] Using Python: %VENV_PYTHON%

REM Check and install dependencies
echo [INFO] Checking dependencies...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing backend dependencies...
    echo This may take a few minutes...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully!
) else (
    echo [INFO] Dependencies are already installed.
)

REM Verify passlib is installed
pip show passlib >nul 2>&1
if errorlevel 1 (
    echo [WARNING] passlib not found, installing...
    pip install passlib[bcrypt]
)

cd ..

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo [INFO] Starting servers...
echo.

REM Start Backend API in new window with venv activated
echo [INFO] Starting Backend API...
cd backend
start "Backend API" cmd /k "cd /d %CD% && call .venv\Scripts\activate.bat && echo [INFO] Backend API starting... && echo [INFO] Virtual environment: ACTIVE && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
cd ..

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start Frontend in new window
echo [INFO] Starting Frontend...
cd frontend
start "Frontend" cmd /k "cd /d %CD% && echo [INFO] Frontend starting... && npm run dev"
cd ..

echo.
echo ========================================
echo  System is starting up...
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend:    http://localhost:3000
echo.
echo [INFO] Two windows will open:
echo   - Backend API (FastAPI/Uvicorn)
echo   - Frontend (Next.js)
echo.
echo [INFO] To stop servers, close the respective windows.
echo.
echo Press any key to close this window...
pause > nul
