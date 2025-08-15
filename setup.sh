#!/bin/bash

# Grocery Simplified Setup Script

echo "🛒 Setting up Grocery Simplified with AI Recommendations..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

echo "✅ Python and pip found"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Install Node.js dependencies (if not already done)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Node.js dependencies installed successfully"
    else
        echo "❌ Failed to install Node.js dependencies"
        exit 1
    fi
else
    echo "✅ Node.js dependencies already installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the AI API server:"
echo "   python3 api_server.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "🌟 Features included:"
echo "   ✅ Group grocery lists with localStorage fallback"
echo "   ✅ Budget management with approval workflows"
echo "   ✅ Brand management system for admins"
echo "   ✅ AI-powered birthday recommendations (Gemini API)"
echo "   ✅ Complete offline-first architecture"
echo ""
echo "📝 Notes:"
echo "   - The Gemini API key is already configured in gemini_config.py"
echo "   - All features work offline with localStorage fallbacks"
echo "   - Database migrations are ready for production deployment"
echo ""
