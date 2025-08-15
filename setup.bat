@echo off
REM Grocery Simplified Setup Script for Windows

echo 🛒 Setting up Grocery Simplified with AI Recommendations...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.7+ first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

echo ✅ Python and pip found

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
) else (
    echo ✅ Python dependencies installed successfully
)

REM Install Node.js dependencies (if not already done)
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
    
    if errorlevel 1 (
        echo ❌ Failed to install Node.js dependencies
        pause
        exit /b 1
    ) else (
        echo ✅ Node.js dependencies installed successfully
    )
) else (
    echo ✅ Node.js dependencies already installed
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the application:
echo 1. Start the AI API server:
echo    python api_server.py
echo.
echo 2. In a new terminal, start the frontend:
echo    npm run dev
echo.
echo 🌟 Features included:
echo    ✅ Group grocery lists with localStorage fallback
echo    ✅ Budget management with approval workflows
echo    ✅ Brand management system for admins
echo    ✅ AI-powered birthday recommendations (Gemini API)
echo    ✅ Complete offline-first architecture
echo.
echo 📝 Notes:
echo    - The Gemini API key is already configured in gemini_config.py
echo    - All features work offline with localStorage fallbacks
echo    - Database migrations are ready for production deployment
echo.
pause
