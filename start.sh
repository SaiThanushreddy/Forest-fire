#!/bin/bash
#
# Almora Forest Fire Prediction System - Startup Script
# Starts both backend (Flask) and frontend (Next.js)
#

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="/home/kali/forest_fire_env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  ALMORA FOREST FIRE PREDICTION SYSTEM${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}Killing existing process on port $1...${NC}"
        fuser -k $1/tcp 2>/dev/null
        sleep 1
    fi
}

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${RED}Error: Virtual environment not found at $VENV_DIR${NC}"
    echo -e "${YELLOW}Please create it first:${NC}"
    echo "  python3 -m venv $VENV_DIR"
    echo "  source $VENV_DIR/bin/activate"
    echo "  pip install -r $BACKEND_DIR/requirements.txt"
    exit 1
fi

# Kill any existing processes on required ports
echo -e "${YELLOW}Checking ports...${NC}"
kill_port 5000
kill_port 3000

# Start Backend Server
echo ""
echo -e "${GREEN}Starting Backend Server (Flask on port 5000)...${NC}"
cd "$BACKEND_DIR"
source "$VENV_DIR/bin/activate"
python app.py &
BACKEND_PID=$!
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}"

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 3

# Check if backend is running
if ! check_port 5000; then
    echo -e "${RED}Error: Backend failed to start!${NC}"
    exit 1
fi
echo -e "${GREEN}Backend is running on http://localhost:5000${NC}"

# Start Frontend Server
echo ""
echo -e "${GREEN}Starting Frontend Server (Next.js on port 3000)...${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    pnpm install
fi

pnpm dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}"

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to initialize...${NC}"
sleep 5

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}Both servers are now running!${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "  ${CYAN}Backend API:${NC}  http://localhost:5000"
echo -e "  ${CYAN}Frontend UI:${NC}  http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill_port 5000
    kill_port 3000
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
