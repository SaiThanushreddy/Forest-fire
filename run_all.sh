#!/bin/bash
cd "$(dirname "$0")"

echo "Setting up Forest Fire Prediction System..."

# Kill existing processes
fuser -k 5000/tcp 2>/dev/null
fuser -k 3000/tcp 2>/dev/null
sleep 1

# Setup Python venv if missing
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r backend/requirements.txt
else
    source venv/bin/activate
fi

# Train model if missing
if [ ! -f "backend/models/almora_fire_model.keras" ]; then
    echo "Training model (first run)..."
    cd backend && python model_trainer.py && cd ..
fi

# Install frontend dependencies if missing
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && pnpm install && cd ..
fi

# Start backend
cd backend && python app.py &>/dev/null &
cd ..

# Start frontend
cd frontend && pnpm dev &>/dev/null &

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
