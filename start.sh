#!/bin/bash

#===============================================================================
#  FIREWATCH - Almora Forest Fire Prediction System
#  One-click startup script
#===============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project directories
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$PROJECT_DIR/venv"

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Print banner
print_banner() {
    echo -e "${RED}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   🔥 FIREWATCH - Forest Fire Prediction System 🔥            ║"
    echo "║                                                               ║"
    echo "║   AI-Powered Fire Risk Monitoring for Almora Region          ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Kill process on a specific port
kill_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}⚠ Port $port is in use. Stopping existing process...${NC}"
        fuser -k $port/tcp 2>/dev/null || true
        sleep 2
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down FireWatch...${NC}"
    
    # Kill by PID
    [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
    [ ! -z "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
    [ ! -z "$TAIL_PID" ] && kill $TAIL_PID 2>/dev/null || true
    
    # Kill any remaining processes on our ports
    fuser -k $BACKEND_PORT/tcp 2>/dev/null || true
    fuser -k $FRONTEND_PORT/tcp 2>/dev/null || true
    
    echo -e "${GREEN}✓ FireWatch stopped. Goodbye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

print_banner

echo -e "${CYAN}📁 Project directory: $PROJECT_DIR${NC}\n"

#===============================================================================
# Step 1: Check Python virtual environment
#===============================================================================
echo -e "${BLUE}[1/4] Checking Python environment...${NC}"

if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

if [ ! -f "$VENV_DIR/.deps_installed" ]; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install --quiet flask flask-cors pandas numpy folium 2>/dev/null || pip install flask flask-cors pandas numpy folium
    touch "$VENV_DIR/.deps_installed"
fi

echo -e "${GREEN}✓ Python environment ready${NC}\n"

#===============================================================================
# Step 2: Check Node.js dependencies
#===============================================================================
echo -e "${BLUE}[2/4] Checking Node.js environment...${NC}"

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies (this may take a minute)...${NC}"
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v npm &> /dev/null; then
        npm install
    else
        echo -e "${RED}Error: npm or pnpm not found. Please install Node.js${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Node.js environment ready${NC}\n"

#===============================================================================
# Step 3: Start Backend Server
#===============================================================================
echo -e "${BLUE}[3/4] Starting backend server...${NC}"

kill_port $BACKEND_PORT

cd "$BACKEND_DIR"
source "$VENV_DIR/bin/activate"

python app.py > /tmp/firewatch_backend.log 2>&1 &
BACKEND_PID=$!

sleep 3

if check_port $BACKEND_PORT; then
    echo -e "${GREEN}✓ Backend running on http://localhost:$BACKEND_PORT${NC}\n"
else
    echo -e "${RED}✗ Failed to start backend. Check /tmp/firewatch_backend.log${NC}"
    cat /tmp/firewatch_backend.log
    exit 1
fi

#===============================================================================
# Step 4: Start Frontend Server
#===============================================================================
echo -e "${BLUE}[4/4] Starting frontend server...${NC}"

kill_port $FRONTEND_PORT

cd "$FRONTEND_DIR"

if command -v pnpm &> /dev/null; then
    pnpm dev -p $FRONTEND_PORT > /tmp/firewatch_frontend.log 2>&1 &
else
    npm run dev -- -p $FRONTEND_PORT > /tmp/firewatch_frontend.log 2>&1 &
fi
FRONTEND_PID=$!

echo -e "${YELLOW}Starting Next.js (please wait)...${NC}"
sleep 8

ACTUAL_PORT=$FRONTEND_PORT
for port in $FRONTEND_PORT 3001 3002 3003; do
    if check_port $port; then
        ACTUAL_PORT=$port
        break
    fi
done

echo -e "${GREEN}✓ Frontend running on http://localhost:$ACTUAL_PORT${NC}\n"

#===============================================================================
# Ready!
#===============================================================================
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   🎉 FIREWATCH IS READY!                                      ║"
echo "║                                                               ║"
echo "║   Open your browser and go to:                                ║"
echo "║                                                               ║"
echo "║   👉  http://localhost:$ACTUAL_PORT                                ║"
echo "║                                                               ║"
echo "║   Press Ctrl+C to stop all servers                            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Try to open browser automatically
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:$ACTUAL_PORT" 2>/dev/null &
elif command -v open &> /dev/null; then
    open "http://localhost:$ACTUAL_PORT" 2>/dev/null &
fi

# Keep script running
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
