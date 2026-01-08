#!/bin/bash
cd "$(dirname "$0")"

# Kill existing processes
fuser -k 5000/tcp 2>/dev/null
fuser -k 3000/tcp 2>/dev/null
sleep 1

# Start backend
source venv/bin/activate
cd backend && python app.py &>/dev/null &
cd ..

# Start frontend
cd frontend && pnpm dev &>/dev/null &

# Wait for servers
sleep 5

echo ""
echo "========================================"
echo "  Forest Fire Prediction System"
echo "========================================"
echo ""
echo "  URL: http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

trap "fuser -k 5000/tcp 3000/tcp 2>/dev/null; exit" SIGINT SIGTERM
wait
