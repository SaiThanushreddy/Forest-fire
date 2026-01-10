# 🔥 FireWatch - Almora Forest Fire Prediction System

AI-powered forest fire prediction and monitoring system for the Almora region, Uttarakhand, India.

## Quick Start

```bash
./start.sh
```

That's it! The script will:
1. Set up Python environment
2. Install all dependencies
3. Start the backend server
4. Start the frontend server
5. Open your browser automatically

## Access the Application

After running the script, open: **http://localhost:3000**

## Features

- **🗺️ Interactive Map** - Real-time fire risk visualization on geographic map
- **📊 Fire Predictions** - CNN-LSTM model predictions with risk levels
- **🔥 Fire Simulation** - Cellular automata fire spread modeling
- **📈 Analytics** - Historical data analysis and trends
- **🌤️ Weather Data** - Real-time weather and Fire Weather Index

## System Requirements

- Python 3.8+
- Node.js 18+
- npm or pnpm

## Manual Start (if needed)

**Backend:**
```bash
cd backend
source ../venv/bin/activate
python app.py
```

**Frontend:**
```bash
cd frontend
pnpm dev
# or: npm run dev
```

## Tech Stack

- **Backend**: Flask, TensorFlow, NumPy, Pandas
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Maps**: Leaflet
- **Charts**: Recharts

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Get fire risk prediction |
| `/api/historical` | GET | Historical fire data |
| `/api/simulation` | POST | Run fire spread simulation |
| `/api/analytics` | GET | Analytics dashboard data |
| `/api/weather` | GET | Current weather data |

---

Built with ❤️ for forest fire prevention
