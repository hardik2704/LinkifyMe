#!/bin/bash

# LinkifyMe - Server Startup Script
# Usage: ./start.sh [backend|frontend|both]


"""
# Terminal 1 - Backend
cd backend && source venv/bin/activate
python3 -m uvicorn app.main:app --reload

# Terminal 2 - Frontend  
cd frontend && npm run dev
"""
PROJECT_DIR="/Users/hardik/AI/Deployable/LinkifyMe"

start_backend() {
    echo "🚀 Starting Backend Server..."
    cd "$PROJECT_DIR/backend"
    source venv/bin/activate
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd "$PROJECT_DIR/frontend"
    npm run dev
}

case "$1" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    both|"")
        echo "📦 Starting LinkifyMe (Backend + Frontend)..."
        echo ""
        echo "Starting Backend in background..."
        cd "$PROJECT_DIR/backend"
        source venv/bin/activate
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!
        echo "✅ Backend started (PID: $BACKEND_PID)"
        echo ""
        sleep 2
        echo "Starting Frontend..."
        cd "$PROJECT_DIR/frontend"
        npm run dev
        ;;
    *)
        echo "Usage: ./start.sh [backend|frontend|both]"
        echo ""
        echo "  backend  - Start only the backend server"
        echo "  frontend - Start only the frontend server"
        echo "  both     - Start both servers (frontend in foreground)"
        exit 1
        ;;
esac
