#!/bin/bash
echo "🛑 Stopping FireWatch..."
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3002/tcp 2>/dev/null || true
pkill -f "python app.py" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
echo "✓ FireWatch stopped"
