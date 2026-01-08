#!/bin/bash

# Almora Forest Fire Prediction System
# Startup Script

set -e

echo "=============================================="
echo "  ALMORA FOREST FIRE PREDICTION SYSTEM"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$HOME/forest_fire_env"

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    pip install --upgrade pip
    pip install -r "$PROJECT_DIR/requirements.txt"
else
    source "$VENV_DIR/bin/activate"
fi

echo -e "${GREEN}Virtual environment activated${NC}"

cd "$PROJECT_DIR"

# Function to train model
train_model() {
    echo -e "${BLUE}Training CNN-LSTM model...${NC}"
    python model_trainer.py
}

# Function to run simulation
run_simulation() {
    echo -e "${BLUE}Running fire spread simulation...${NC}"
    python cellular_automata.py
}

# Function to start server
start_server() {
    echo -e "${GREEN}Starting Flask server...${NC}"
    echo ""
    echo -e "${YELLOW}Access the application at:${NC}"
    echo -e "  ${GREEN}http://localhost:5000${NC}"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python app.py
}

# Parse command line arguments
case "$1" in
    train)
        train_model
        ;;
    simulate)
        run_simulation
        ;;
    server)
        start_server
        ;;
    all)
        train_model
        run_simulation
        start_server
        ;;
    *)
        echo "Usage: $0 {train|simulate|server|all}"
        echo ""
        echo "Commands:"
        echo "  train     - Train the CNN-LSTM model"
        echo "  simulate  - Run cellular automata simulation"
        echo "  server    - Start the Flask web server"
        echo "  all       - Run training, simulation, and start server"
        echo ""
        echo "Quick start:"
        echo "  ./run.sh server"
        echo ""
        exit 1
        ;;
esac
