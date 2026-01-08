# Almora Forest Fire Prediction System

A comprehensive CNN-LSTM deep learning system for predicting and simulating forest fires in Almora, Uttarakhand, India. Features an impressive 3D web interface with real-time visualizations.

![Fire Prediction System](static/images/banner.png)

## Features

### CNN-LSTM Deep Learning Model
- TimeDistributed CNN layers for spatial feature extraction
- LSTM layers for temporal pattern recognition
- Trained on satellite imagery (NDVI, LST) data
- 5-day sequence prediction for fire risk assessment

### Cellular Automata Fire Spread Simulation
- Grid-based fire spread modeling
- Physics-based parameters:
  - Wind direction and speed
  - Vegetation density (NDVI)
  - Temperature (LST)
  - Humidity
- Real-time animated visualization

### 3D Interactive Web Frontend
- **Landing Page**: 3D animated globe with fire hotspots
- **Prediction Page**: 3D terrain visualization with fire risk heatmap
- **Simulation Page**: 3D cellular automata fire spread
- **Analytics Dashboard**: Interactive charts and 3D scatter plots
- **Geographic Map**: Leaflet-based map with heatmap layers

### Technology Stack
- **Backend**: Python, Flask, TensorFlow/Keras
- **Frontend**: HTML5, CSS3, JavaScript
- **3D Graphics**: Three.js, WebGL
- **Charts**: Chart.js
- **Maps**: Leaflet, Folium
- **Data**: NumPy, Pandas, scikit-learn

## Project Structure

```
forest_fire_project/
├── app.py                    # Flask backend server
├── model_trainer.py          # CNN-LSTM training script
├── cellular_automata.py      # Fire spread simulation
├── run.sh                    # Startup script
├── requirements.txt          # Python dependencies
├── README.md                 # This file
│
├── models/                   # Trained models
│   ├── almora_fire_model.keras
│   └── training_stats.json
│
├── static/                   # Static web assets
│   ├── css/
│   │   └── main.css         # Futuristic UI styling
│   ├── js/
│   │   ├── main.js          # Core utilities
│   │   ├── globe.js         # 3D globe visualization
│   │   ├── prediction.js    # 3D terrain prediction
│   │   ├── simulation.js    # CA simulation 3D
│   │   ├── analytics.js     # Dashboard charts
│   │   └── map.js           # Leaflet map
│   └── images/              # Generated visualizations
│
├── templates/                # HTML templates
│   ├── index.html           # Landing page
│   ├── prediction.html      # Fire prediction
│   ├── simulation.html      # CA simulation
│   ├── analytics.html       # Analytics dashboard
│   └── map.html             # Geographic map
│
├── satellite_images/         # NDVI and LST data
│   ├── ndvi_YYYY-MM-DD.npy
│   └── lst_YYYY-MM-DD.npy
│
└── almora_fake_fire_data.csv # Fire incident data
```

## Quick Start

### 1. Clone/Navigate to Project
```bash
cd ~/Documents/forest_fire_project
```

### 2. Run the Application
```bash
# Start the web server
./run.sh server

# Or run everything (train + simulate + server)
./run.sh all
```

### 3. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

## Detailed Setup

### Prerequisites
- Python 3.8+
- Linux/macOS (tested on Kali Linux)
- Modern web browser with WebGL support

### Manual Installation
```bash
# Create virtual environment
python3 -m venv ~/forest_fire_env
source ~/forest_fire_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model (optional - takes time)
python model_trainer.py

# Run simulation demo
python cellular_automata.py

# Start server
python app.py
```

## Usage Guide

### Prediction Page
1. Select a date for prediction
2. Click "Generate Prediction"
3. View 3D terrain with fire risk overlay
4. Check risk gauge and statistics

### Simulation Page
1. Adjust parameters:
   - Wind speed and direction
   - Temperature and humidity
   - Spread probability
   - Number of initial fires
2. Click "Run" to start simulation
3. Use playback controls to navigate
4. View real-time statistics

### Analytics Dashboard
- View monthly fire distribution
- Analyze yearly trends
- Explore seasonal risk patterns
- Check model performance metrics

### Geographic Map
- Toggle layers (heatmap, markers, risk zones)
- Filter by date range
- Change map styles
- Click locations for details

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Generate fire prediction |
| `/api/historical` | GET | Get historical fire data |
| `/api/simulation` | POST | Run CA simulation |
| `/api/analytics` | GET | Get analytics data |
| `/api/heatmap` | GET | Get heatmap data |
| `/api/weather` | GET | Get weather data |
| `/api/terrain-data` | GET | Get 3D terrain data |

## Model Architecture

```
CNN-LSTM Model
├── TimeDistributed Conv2D (32 filters, 3x3)
├── TimeDistributed BatchNorm + MaxPool
├── TimeDistributed Conv2D (64 filters, 3x3)
├── TimeDistributed BatchNorm + MaxPool
├── TimeDistributed Conv2D (128 filters, 3x3)
├── TimeDistributed BatchNorm + MaxPool
├── TimeDistributed Flatten
├── LSTM (256 units, return_sequences=True)
├── LSTM (128 units)
├── Dense (512 units, ReLU)
├── Dense (64*64*2 units, Sigmoid)
└── Reshape (64, 64, 2)
```

## Data Sources

- **Fire Data**: Historical fire incidents (2018-2023)
- **NDVI**: Vegetation index from satellite imagery
- **LST**: Land surface temperature
- **Location**: Almora District, Uttarakhand (29.60N, 79.66E)

## Screenshots

### Landing Page
- 3D rotating globe with fire hotspots
- Animated statistics
- Glassmorphism design

### Prediction Interface
- 3D terrain visualization
- Interactive risk heatmap
- Real-time predictions

### Simulation View
- 3D cellular automata
- Live fire spread animation
- Statistical charts

## Performance Notes

- 3D visualizations use WebGL
- Simulation runs on 64x64 grid
- Model training: ~10 epochs
- Recommended: Modern GPU for smooth 3D

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

This project is developed for educational purposes.
Group 04 - Forest Fire Prediction System

## Acknowledgments

- TensorFlow/Keras for deep learning
- Three.js for 3D visualizations
- Leaflet for interactive maps
- Chart.js for analytics
- NASA POWER for weather parameters

---

**FireSight AI** - Almora Forest Fire Prediction System
