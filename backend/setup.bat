@echo off
echo 🚀 Starting Grocery App Backend Setup...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your Supabase credentials
) else (
    echo ✅ .env file already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %ERRORLEVEL% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo 🎉 Backend setup completed!
echo.
echo Next steps:
echo 1. Edit .env file with your Supabase credentials
echo 2. Run 'npm run dev' to start development server
echo 3. Backend will be available at http://localhost:3001
echo.
echo Available commands:
echo   npm run dev     - Start development server
echo   npm start       - Start production server
echo   npm test        - Run tests
echo   npm run lint    - Run linter
echo.
pause
