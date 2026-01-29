#!/bin/bash
set -e

# LinkifyMe Application Installation Script

PROJECT_ROOT=$(pwd)

if [ ! -d "$PROJECT_ROOT/backend" ] || [ ! -d "$PROJECT_ROOT/frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory."
    exit 1
fi

# 1. Backend Setup
echo "🐍 Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Created Python virtual environment."
fi

source venv/bin/activate
echo "Installing backend requirements..."
pip install --upgrade pip
pip install -r requirements.txt
# Ensure uvicorn is installed (it is in requirements, but just in case)
pip install uvicorn

# Create .env if not exists (copy example)
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  Created backend/.env from .env.example. Please update it with real values!"
    else
        echo "⚠️  No .env or .env.example found in backend. Please create one."
    fi
fi
cd ..

# 2. Frontend Setup
echo "⚛️  Setting up Frontend..."
cd frontend
echo "Installing frontend dependencies..."
npm install

# Build environment setup
# We set NEXT_PUBLIC_API_URL to empty string so it uses relative paths (proxied by Nginx)
# or you can set it to your domain https://example.com
echo "Building Frontend..."
NEXT_PUBLIC_API_URL="" npm run build

cd ..

echo "✅ Application Installed and Built!"
echo "To start the application, run:"
echo "pm2 start deployment/ecosystem.config.js"
