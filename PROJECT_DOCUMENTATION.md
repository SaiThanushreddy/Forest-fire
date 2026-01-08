# Almora Forest Fire Prediction System - Complete Project Documentation

## 1. Project Overview

**Project Name:** FireSight AI - Almora Forest Fire Prediction System
**Purpose:** A comprehensive deep learning system for predicting and simulating forest fires in Almora District, Uttarakhand, India
**Target Location:** Almora District (29.60°N, 79.66°E)
**Group:** Group 04 - Forest Fire Prediction System

### Key Features
- **CNN-LSTM Deep Learning Model** for fire risk prediction
- **Cellular Automata Fire Spread Simulation** with physics-based parameters
- **3D Interactive Web Frontend** with real-time visualizations
- **Geographic Map Integration** with heatmaps and fire hotspots
- **Analytics Dashboard** with historical data analysis

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   3D Globe   │  │  2D Leaflet  │  │  Premium Dashboard   │  │
│  │  (Three.js)  │  │     Map      │  │    (Controls/Stats)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                             │                                    │
│                    API Service (api.ts)                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST
┌─────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (Flask)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   app.py     │  │ model_trainer│  │ cellular_automata.py │  │
│  │  (REST API)  │  │    .py       │  │   (Simulation)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                             │                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ TensorFlow   │  │ Satellite    │  │   Historical Fire    │  │
│  │ CNN-LSTM     │  │ Images (NPY) │  │   Data (CSV)         │  │
│  │ Model        │  │ NDVI + LST   │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
forest_fire_project/
├── backend/
│   ├── app.py                    # Flask REST API server
│   ├── model_trainer.py          # CNN-LSTM model training script
│   ├── cellular_automata.py      # Fire spread simulation engine
│   ├── train_model.py            # Alternative training script
│   ├── generate_satellite_data.py # Synthetic data generator
│   ├── requirements.txt          # Python dependencies
│   ├── almora_fake_fire_data.csv # Historical fire dataset (2018-2023)
│   ├── models/
│   │   ├── almora_fire_model.keras  # Trained CNN-LSTM model (~150MB)
│   │   └── training_stats.json      # Model performance metrics
│   ├── satellite_images/         # NDVI and LST data (NPY format)
│   │   ├── ndvi_YYYY-MM-DD.npy
│   │   └── lst_YYYY-MM-DD.npy
│   ├── static/                   # Static assets
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── templates/                # HTML templates (legacy Flask UI)
│   └── utils/                    # Utility functions
│
├── frontend/                     # Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Main entry point
│   │   │   └── layout.tsx       # App layout
│   │   ├── components/
│   │   │   ├── three/           # 3D visualizations
│   │   │   │   ├── ForestFireScene.tsx
│   │   │   │   ├── FireSpreadVisualization.tsx
│   │   │   │   ├── VolumetricFire.tsx
│   │   │   │   ├── Terrain.tsx
│   │   │   │   ├── Forest.tsx
│   │   │   │   └── Smoke.tsx
│   │   │   ├── map/             # 2D map components
│   │   │   │   ├── AlmoraMap.tsx
│   │   │   │   └── FireMap2D.tsx
│   │   │   └── ui/              # Dashboard components
│   │   │       ├── PremiumDashboard.tsx
│   │   │       └── Dashboard.tsx
│   │   ├── lib/
│   │   │   ├── api.ts           # Backend API service
│   │   │   └── fireSpreadSimulation.ts
│   │   ├── hooks/
│   │   │   └── useBackend.ts    # Backend connection hook
│   │   └── shaders/
│   │       └── fireShader.ts    # WebGL fire shaders
│   ├── package.json
│   └── tsconfig.json
│
├── Final_Wildfire_prediction_Group_04.ipynb  # Research notebook
├── start.sh                      # Full stack startup script
├── run.sh                        # Backend-only startup script
├── README.md                     # Project readme
└── PROJECT_DOCUMENTATION.md      # This file
```

---

## 4. Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Core runtime |
| Flask | 2.0+ | REST API framework |
| Flask-CORS | 4.0+ | Cross-origin requests |
| TensorFlow/Keras | 2.10+ | Deep learning model |
| NumPy | 1.21+ | Numerical computing |
| Pandas | 1.3+ | Data manipulation |
| Folium | 0.14+ | Map generation |
| scikit-learn | 1.0+ | ML utilities |
| Matplotlib | 3.5+ | Visualization |
| imageio | 2.9+ | GIF animation |
| Pillow | 9.0+ | Image processing |
| SciPy | 1.7+ | Scientific computing |
| h5py | 3.7+ | HDF5 file support |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework |
| React | 19.2.3 | UI library |
| Three.js | 0.182.0 | 3D graphics |
| React Three Fiber | 9.4.2 | React + Three.js bridge |
| React Three Drei | 10.7.7 | Three.js helpers |
| Leaflet | 1.9.4 | Interactive maps |
| React-Leaflet | 5.0.0 | React + Leaflet bridge |
| TailwindCSS | 4.x | Utility-first CSS |
| TypeScript | 5.x | Type safety |
| PostCSS | 8.x | CSS processing |
| Leva | 0.10.1 | Debug controls |

---

## 5. Deep Learning Model

### CNN-LSTM Architecture

The model uses a hybrid Convolutional Neural Network + Long Short-Term Memory architecture for spatiotemporal fire prediction:

```
Input: Sequence of 5 satellite images (64x64x2 channels: NDVI + LST)
       Shape: (batch, 5, 64, 64, 2)

┌─────────────────────────────────────────────────────────┐
│ TimeDistributed Conv2D (32 filters, 3x3, ReLU, same)   │
│ TimeDistributed BatchNormalization                      │
│ TimeDistributed MaxPooling2D (2x2)                      │
│ TimeDistributed Dropout (0.25)                          │
├─────────────────────────────────────────────────────────┤
│ TimeDistributed Conv2D (64 filters, 3x3, ReLU, same)   │
│ TimeDistributed BatchNormalization                      │
│ TimeDistributed MaxPooling2D (2x2)                      │
│ TimeDistributed Dropout (0.25)                          │
├─────────────────────────────────────────────────────────┤
│ TimeDistributed Conv2D (128 filters, 3x3, ReLU, same)  │
│ TimeDistributed BatchNormalization                      │
│ TimeDistributed MaxPooling2D (2x2)                      │
│ TimeDistributed Dropout (0.25)                          │
├─────────────────────────────────────────────────────────┤
│ TimeDistributed Flatten                                 │
├─────────────────────────────────────────────────────────┤
│ LSTM (256 units, return_sequences=True, dropout=0.3)   │
│ LSTM (128 units, dropout=0.3)                          │
├─────────────────────────────────────────────────────────┤
│ Dense (512 units, ReLU)                                 │
│ Dropout (0.3)                                           │
│ Dense (64*64*2 = 8192 units, Sigmoid)                  │
│ Reshape (64, 64, 2)                                     │
└─────────────────────────────────────────────────────────┘

Output: Predicted satellite image for next day (64x64x2)
        Channel 0: Predicted NDVI
        Channel 1: Predicted LST (used as fire risk proxy)
```

### Model Training Configuration
- **Optimizer:** Adam (learning_rate=0.001)
- **Loss Function:** Mean Squared Error (MSE)
- **Metrics:** Mean Absolute Error (MAE)
- **Batch Size:** 8
- **Epochs:** 10 (with early stopping)
- **Validation Split:** 20%

### Callbacks
- **EarlyStopping:** patience=5, restore_best_weights=True
- **ModelCheckpoint:** save_best_only=True
- **ReduceLROnPlateau:** factor=0.5, patience=3, min_lr=1e-6

### Model Training Statistics (Latest Run: December 27, 2025)
| Metric | Value |
|--------|-------|
| Training Date | 2025-12-27 |
| Total Samples | 2,191 days |
| Fire Incidents | 107 events |
| Epochs Trained | 10 |
| Final Training Loss | 0.0325 |
| Final Validation Loss | 0.0322 |
| Final Training MAE | 0.1526 |
| Final Validation MAE | 0.1521 |
| Model Accuracy | ~84.8% |
| Model File Size | ~150 MB |

### Training Data Description
- **NDVI (Normalized Difference Vegetation Index)**
  - Measures vegetation health/density
  - Range: -1 to 1 (normalized to 0-1 for model)
  - Higher values = healthier/denser vegetation = more fuel for fire

- **LST (Land Surface Temperature)**
  - Thermal satellite measurements
  - Units: Celsius (normalized for model)
  - Higher values = increased fire risk

---

## 6. Cellular Automata Fire Simulation

### Overview
The simulation uses a grid-based cellular automata model to simulate realistic fire spread patterns based on environmental conditions.

### Cell States
| State | Value | Color | Description |
|-------|-------|-------|-------------|
| UNBURNED | 0 | Green (#228B22) | Forest/vegetation |
| BURNING | 1 | Orange (#FF4500) | Active fire |
| BURNED | 2 | Black (#1a1a1a) | Burnt area |
| WATER | 3 | Blue (#4169E1) | Cannot burn |

### Simulation Parameters

```python
@dataclass
class SimulationParams:
    grid_size: int = 64          # Grid dimensions (64x64 = 4,096 cells)
    wind_speed: float = 5.0      # Wind speed in m/s (0-20)
    wind_direction: float = 45.0 # Degrees (0=N, 90=E, 180=S, 270=W)
    temperature: float = 35.0    # Ambient temperature in Celsius
    humidity: float = 30.0       # Relative humidity percentage
    base_spread_prob: float = 0.3 # Base probability of fire spreading
    burn_duration: int = 3       # Time steps a cell burns before becoming burnt
    time_steps: int = 50         # Maximum simulation length
```

### Fire Spread Algorithm

The simulation uses 8-neighbor connectivity (Moore neighborhood):
```
┌────┬────┬────┐
│ NW │ N  │ NE │
├────┼────┼────┤
│ W  │ X  │ E  │
├────┼────┼────┤
│ SW │ S  │ SE │
└────┴────┴────┘
```

### Fire Spread Probability Calculation

For each unburned neighbor of a burning cell:

```
P(spread) = base_prob × vegetation_factor × temp_factor × humidity_factor × wind_factor

Where:
- vegetation_factor = 0.5 + NDVI_value
  (More vegetation = higher spread probability)

- temp_factor = 0.7 + 0.6 × normalized_temperature
  (Higher temperature = higher spread probability)

- humidity_factor = 0.5 + (1 - humidity/100)
  (Lower humidity = higher spread probability)

- wind_factor = 1.0 + cos(angle_difference) × wind_strength
  (Downwind direction = higher spread probability)

Maximum probability is capped at 95%
```

### Wind Direction Effects
- Wind direction uses meteorological convention (0° = North, clockwise)
- Fire spreads preferentially in the downwind direction
- Wind strength normalized to [0, 1] range (wind_speed / 20)
- Alignment calculated using cosine of angle difference

### Simulation Output
- **History:** Array of grid states at each time step
- **Statistics:** Per-step counts of unburned/burning/burned cells
- **Animation:** Generated as GIF file
- **JSON Export:** Complete simulation data for frontend

---

## 7. REST API Endpoints

### Base URL
- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:3000`

### API Reference

#### POST `/api/predict`
Generate fire risk prediction for a specific date.

**Request Body:**
```json
{
  "date": "2023-05-15"
}
```

**Response:**
```json
{
  "success": true,
  "date": "2023-05-15",
  "risk_map": [[0.1, 0.2, ...], ...],
  "statistics": {
    "average_risk": 0.42,
    "max_risk": 0.89,
    "high_risk_cells": 156,
    "risk_level": "MODERATE",
    "risk_percentage": 42.0
  },
  "bounds": {
    "north": 29.85,
    "south": 29.35,
    "east": 80.00,
    "west": 79.35
  },
  "center": {
    "lat": 29.5971,
    "lon": 79.6591
  }
}
```

#### POST `/api/simulation`
Run cellular automata fire spread simulation.

**Request Body:**
```json
{
  "wind_speed": 8.0,
  "wind_direction": 45.0,
  "temperature": 38.0,
  "humidity": 25.0,
  "spread_prob": 0.35,
  "burn_duration": 3,
  "time_steps": 50,
  "num_fires": 3,
  "ignite_points": [{"row": 32, "col": 32}]
}
```

**Response:**
```json
{
  "success": true,
  "simulation": {
    "params": {...},
    "history": [[[0,0,1,...], ...], ...],
    "stats_history": [
      {"unburned": 4090, "burning": 6, "burned": 0, ...},
      ...
    ],
    "vegetation": [[...], ...],
    "final_stats": {...}
  }
}
```

#### GET `/api/historical`
Get historical fire incident data.

**Query Parameters:**
- `start` (optional): Start date (YYYY-MM-DD)
- `end` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "count": 312,
  "data": [
    {
      "date": "2023-05-15",
      "latitude": 29.62,
      "longitude": 79.71,
      "fire_occurred": 1,
      "brightness": 342.5,
      "confidence": 85.0
    },
    ...
  ]
}
```

#### GET `/api/analytics`
Get analytics dashboard data.

**Response:**
```json
{
  "success": true,
  "total_records": 2191,
  "total_fires": 312,
  "fire_rate": 14.24,
  "monthly_distribution": [12, 18, 45, 67, 89, 42, 15, 8, 5, 3, 4, 4],
  "yearly_trend": {"2018": 45, "2019": 52, ...},
  "seasonal_risk": {
    "Winter": 5.2,
    "Spring": 28.4,
    "Summer": 12.1,
    "Autumn": 3.8
  },
  "hotspots": [[29.62, 79.71, 0.85], ...],
  "training_stats": {
    "model_accuracy": 84.8,
    "total_samples": 2191,
    "fire_incidents": 107,
    "epochs_trained": 10
  },
  "date_range": {
    "start": "2018-01-01",
    "end": "2023-12-31"
  }
}
```

#### GET `/api/heatmap`
Get fire heatmap data for map visualization.

**Response:**
```json
{
  "success": true,
  "data": [[29.62, 79.71, 0.68], ...],
  "center": {"lat": 29.5971, "lon": 79.6591},
  "bounds": {...}
}
```

#### GET `/api/weather`
Get current weather data (synthetic for demo).

**Response:**
```json
{
  "success": true,
  "weather": {
    "temperature": 35.2,
    "humidity": 42.0,
    "wind_speed": 12.5,
    "wind_direction": 225.0,
    "precipitation": 0.0,
    "fire_weather_index": 72.4
  },
  "location": {
    "name": "Almora, Uttarakhand",
    "lat": 29.5971,
    "lon": 79.6591
  },
  "timestamp": "2025-12-27T10:30:00"
}
```

#### GET `/api/terrain-data`
Get 3D terrain elevation data.

**Response:**
```json
{
  "success": true,
  "terrain": [[1234.5, ...], ...],
  "size": 64,
  "min_elevation": 1000.0,
  "max_elevation": 3000.0,
  "bounds": {...}
}
```

#### GET `/api/folium-map`
Generate interactive Folium map HTML.

**Response:**
```json
{
  "success": true,
  "map_html": "<div>...</div>"
}
```

---

## 8. Frontend Components

### 3D Visualizations (Three.js / React Three Fiber)

| Component | File | Description |
|-----------|------|-------------|
| ForestFireScene | `ForestFireScene.tsx` | Main 3D scene container with lighting and camera |
| FireSpreadVisualization | `FireSpreadVisualization.tsx` | Animated fire spread on terrain grid |
| VolumetricFire | `VolumetricFire.tsx` | Realistic volumetric fire rendering |
| PremiumScene | `PremiumScene.tsx` | Enhanced scene with post-processing |
| ImprovedTerrain | `ImprovedTerrain.tsx` | 3D terrain mesh with elevation |
| Terrain | `Terrain.tsx` | Basic terrain component |
| Forest | `Forest.tsx` | Procedural tree/vegetation rendering |
| FireParticles | `FireParticles.tsx` | Particle system for fire effects |
| Smoke | `Smoke.tsx` | Particle smoke effects |
| ImprovedFire | `ImprovedFire.tsx` | Enhanced fire visuals |

### 2D Map Components (Leaflet / React-Leaflet)

| Component | File | Description |
|-----------|------|-------------|
| AlmoraMap | `AlmoraMap.tsx` | Main map with fire overlay and controls |
| FireMap2D | `FireMap2D.tsx` | 2D fire risk heatmap layer |

### Dashboard Components

| Component | File | Description |
|-----------|------|-------------|
| PremiumDashboard | `PremiumDashboard.tsx` | Full-featured control panel |
| Dashboard | `Dashboard.tsx` | Basic statistics display |

### PremiumDashboard Features

**Top Bar:**
- Logo and title (FireSight AI)
- Location indicator (Almora District, Uttarakhand)
- Real-time statistics (Time Step, Active Fires, Burnt)
- Risk level badge (EXTREME/HIGH/MODERATE/LOW)

**Left Panel - Controls:**
- Fire spread progress ring (circular visualization)
- Burning/Safe cell counts
- Play/Pause simulation button
- Reset button
- Ignite buttons (Center, Random)
- Speed slider (1x - 30x)
- 2D/3D view toggle
- Model info display

**Right Panel - Environment:**
- Wind speed slider (0-20 m/s)
- Wind direction compass with interactive control
- Temperature slider (15-50°C)
- Humidity slider (10-90%)

**Bottom Bar:**
- Navigation hints (Drag to rotate, Scroll to zoom)
- Technology credits

### Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| useBackend | `useBackend.ts` | Backend connection state management |

### Shaders

| Shader | File | Purpose |
|--------|------|---------|
| fireShader | `fireShader.ts` | WebGL shader for fire effects |

---

## 9. Data Sources

### Historical Fire Data (`almora_fake_fire_data.csv`)

| Column | Type | Description |
|--------|------|-------------|
| date | datetime | Fire incident date |
| latitude | float | Location latitude (29.35-29.85) |
| longitude | float | Location longitude (79.35-80.00) |
| fire_occurred | int | Binary fire flag (0=no fire, 1=fire) |
| brightness | float | Fire brightness temperature (Kelvin) |
| confidence | float | Detection confidence percentage |

**Dataset Statistics:**
- Total Records: 2,191 days
- Fire Incidents: 107-312 events
- Date Range: 2018-01-01 to 2023-12-31
- Location: Almora District, Uttarakhand

### Satellite Images (NPY format)

**NDVI Files:** `satellite_images/ndvi_YYYY-MM-DD.npy`
- Normalized Difference Vegetation Index
- Shape: (64, 64)
- Range: 0.0 to 1.0
- Source: Derived from satellite imagery

**LST Files:** `satellite_images/lst_YYYY-MM-DD.npy`
- Land Surface Temperature
- Shape: (64, 64)
- Units: Normalized temperature values
- Source: Thermal satellite bands

### NASA POWER Data

**File:** `POWER_Climatic_Design_Conditions_20180101_20231231_029d60N_079d65E.xlsx`
- Climatic design conditions
- Location: 29.60°N, 79.65°E
- Period: 2018-2023
- Parameters listed in `nasa-power-parameters.csv`

---

## 10. Installation & Setup

### System Requirements

- **OS:** Linux (tested on Kali), macOS, or Windows with WSL
- **Python:** 3.8 or higher
- **Node.js:** 18.x or higher
- **Package Manager:** pnpm (recommended) or npm
- **Browser:** Modern browser with WebGL support (Chrome, Firefox, Edge)
- **RAM:** 4GB minimum, 8GB recommended
- **GPU:** WebGL-capable graphics (for 3D visualizations)

### Backend Setup

```bash
# Navigate to project directory
cd ~/Documents/forest_fire_project

# Create Python virtual environment
python3 -m venv ~/forest_fire_env

# Activate virtual environment
source ~/forest_fire_env/bin/activate

# Install Python dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# (Optional) Train the model - takes ~10-15 minutes
python model_trainer.py

# (Optional) Run simulation demo
python cellular_automata.py

# Start Flask server
python app.py
```

The backend server will start at `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd ~/Documents/forest_fire_project/frontend

# Install Node.js dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend will start at `http://localhost:3000`

### Quick Start (Both Servers)

```bash
# From project root directory
cd ~/Documents/forest_fire_project

# Run the startup script
./start.sh
```

The `start.sh` script will:
1. Check for virtual environment existence
2. Kill any existing processes on ports 5000 and 3000
3. Start the Flask backend server
4. Wait for backend initialization
5. Start the Next.js frontend server
6. Display access URLs
7. Handle graceful shutdown on Ctrl+C

### Alternative: Backend Only

```bash
./run.sh server    # Start Flask server only
./run.sh train     # Train the model
./run.sh simulate  # Run CA simulation
./run.sh all       # Train + Simulate + Server
```

---

## 11. Usage Guide

### Accessing the Application

1. Start both servers using `./start.sh`
2. Open browser to `http://localhost:3000`
3. Wait for the loading screen to complete

### Fire Prediction

1. The main view shows the Almora region map
2. Use the date picker to select a prediction date
3. Click "Generate Prediction" button
4. View the fire risk heatmap overlay on the map/terrain
5. Check the statistics panel for:
   - Average risk percentage
   - Maximum risk value
   - Number of high-risk cells
   - Risk level classification

### Fire Simulation

1. **Set Environment Parameters:**
   - Wind Speed: Drag slider (0-20 m/s)
   - Wind Direction: Use compass or slider (0-360°)
   - Temperature: Drag slider (15-50°C)
   - Humidity: Drag slider (10-90%)

2. **Choose Ignition Method:**
   - "Center" - Start fire in the center of the grid
   - "Random" - Randomly place initial fire points

3. **Control Simulation:**
   - Click "Start" to begin simulation
   - Click "Pause" to stop
   - Click "Reset" to clear and restart
   - Adjust "Speed" slider (1x to 30x)

4. **Monitor Progress:**
   - Watch the fire spread in real-time
   - View statistics (Burning, Burnt, Safe cells)
   - Observe the progress ring filling up

### View Modes

- **3D View:** Immersive terrain with fire particle effects
  - Drag to rotate camera
  - Scroll to zoom in/out
  - Best for visualization and presentation

- **2D Map View:** Geographic Leaflet map
  - Click toggle button to switch
  - Shows fire heatmap overlay
  - Better for precise location analysis

### Risk Level Interpretation

| Risk Level | Color | Average Risk | Recommended Action |
|------------|-------|--------------|-------------------|
| LOW | Green | < 30% | Normal monitoring |
| MODERATE | Yellow | 30-45% | Increased vigilance |
| HIGH | Orange | 45-60% | Alert fire services |
| EXTREME | Red | > 60% | Emergency response |

---

## 12. Research Notebook

The Jupyter notebook `Final_Wildfire_prediction_Group_04.ipynb` contains the original research and development work:

### Notebook Contents

1. **Environment Setup**
   - Google Colab drive mounting
   - Library installations (imagecodecs, rasterio)

2. **Data Loading**
   - Recursive TIFF file discovery
   - Date extraction from filenames
   - Multi-threaded image loading

3. **Preprocessing Pipeline**
   - Image resizing to 64x64
   - Normalization to [0, 1] range
   - NaN handling
   - Chronological sorting

4. **Model Architecture**
   - CNN-LSTM model definition
   - TimeDistributed layers for spatial features
   - LSTM for temporal patterns

5. **Training**
   - Sliding window sequence creation
   - Model compilation and fitting
   - Loss curve visualization

6. **Evaluation Metrics**
   - Mean Squared Error (MSE)
   - Mean Absolute Error (MAE)
   - Peak Signal-to-Noise Ratio (PSNR)
   - Structural Similarity Index (SSIM)
   - Binary accuracy

7. **Visualization**
   - Ground truth vs prediction comparisons
   - Pixel intensity distributions
   - Folium map overlays with fire colormap

---

## 13. Risk Classification System

### Fire Risk Calculation

The system calculates fire risk based on multiple factors:

```
Risk Score = f(Temperature, Humidity, Wind, Vegetation, Historical Data)
```

### Classification Thresholds

| Risk Level | Average Risk Range | Visual Indicator | System Response |
|------------|-------------------|------------------|-----------------|
| LOW | 0% - 30% | Green badge | Standard monitoring |
| MODERATE | 30% - 45% | Yellow badge | Enhanced surveillance |
| HIGH | 45% - 60% | Orange badge | Alert notifications |
| EXTREME | 60% - 100% | Red badge (pulsing) | Emergency protocols |

### Contributing Factors

1. **Temperature Impact**
   - Higher temperatures increase fire risk
   - Threshold: Above 35°C significantly increases risk

2. **Humidity Impact**
   - Lower humidity increases fire risk
   - Threshold: Below 30% is high risk

3. **Wind Impact**
   - Higher wind speeds increase spread rate
   - Wind direction affects spread pattern

4. **Vegetation (NDVI)**
   - Dense vegetation = more fuel
   - Dry vegetation = higher ignition risk

---

## 14. Performance Considerations

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | Dual-core 2.0 GHz | Quad-core 3.0 GHz |
| RAM | 4 GB | 8 GB |
| GPU | Integrated with WebGL | Dedicated GPU |
| Storage | 500 MB | 1 GB |

### Performance Metrics

| Operation | Typical Duration |
|-----------|-----------------|
| Model Training | 10-15 minutes (10 epochs) |
| Model Inference | 1-2 seconds per prediction |
| Simulation (50 steps) | 2-5 seconds |
| 3D Scene Loading | 3-5 seconds |
| API Response Time | < 500ms |

### Optimization Tips

1. **3D Performance:**
   - Use dedicated GPU for smooth rendering
   - Lower simulation speed if frame rate drops
   - Close other GPU-intensive applications

2. **Backend Performance:**
   - Ensure TensorFlow uses GPU if available
   - Pre-load model on server startup
   - Use batch predictions when possible

3. **Memory Management:**
   - Model uses ~500 MB RAM
   - Simulation history stored in memory
   - Clear browser cache if issues occur

---

## 15. Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill existing process
fuser -k 5000/tcp

# Ensure virtual environment is activated
source ~/forest_fire_env/bin/activate
```

**Frontend won't start:**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear node modules and reinstall
rm -rf node_modules
pnpm install
```

**Model not loading:**
- Ensure `models/almora_fire_model.keras` exists
- Run `python model_trainer.py` to train model
- Check TensorFlow installation

**3D visualization issues:**
- Update browser to latest version
- Enable hardware acceleration in browser settings
- Check WebGL support at https://get.webgl.org/

**API connection errors:**
- Verify backend is running on port 5000
- Check CORS configuration in `app.py`
- Ensure firewall allows local connections

---

## 16. Future Enhancements

### Planned Features

1. **Real-time Data Integration**
   - NASA FIRMS API for live fire detection
   - OpenWeatherMap API for weather data
   - Satellite imagery streaming

2. **Enhanced Model**
   - Larger training dataset
   - Additional input features (elevation, land use)
   - Ensemble model approach
   - Transfer learning from larger datasets

3. **User Experience**
   - Mobile-responsive design
   - Touch-friendly controls
   - PWA support for offline access
   - User authentication and saved preferences

4. **Alert System**
   - SMS notifications
   - Email alerts
   - Push notifications
   - Integration with emergency services

5. **Multi-region Support**
   - Extend to other fire-prone regions
   - Configurable geographic boundaries
   - Region-specific model fine-tuning

6. **Historical Analysis**
   - Playback of past fire events
   - Trend analysis and reporting
   - Seasonal pattern recognition

7. **Collaboration Features**
   - Multi-user support
   - Shared simulation sessions
   - Report generation and export

---

## 17. API Integration Examples

### Python Client Example

```python
import requests

BASE_URL = "http://localhost:5000"

# Get prediction
response = requests.post(f"{BASE_URL}/api/predict",
    json={"date": "2023-05-15"})
prediction = response.json()
print(f"Risk Level: {prediction['statistics']['risk_level']}")

# Run simulation
sim_params = {
    "wind_speed": 10.0,
    "wind_direction": 90.0,
    "temperature": 40.0,
    "humidity": 20.0,
    "num_fires": 3
}
response = requests.post(f"{BASE_URL}/api/simulation", json=sim_params)
simulation = response.json()
print(f"Final burn percentage: {simulation['simulation']['final_stats']['burned_pct']}%")
```

### JavaScript/TypeScript Client Example

```typescript
import { api } from '@/lib/api';

// Get prediction
const prediction = await api.getPrediction('2023-05-15');
console.log(`Risk Level: ${prediction.statistics.risk_level}`);

// Run simulation
const simulation = await api.runSimulation({
    wind_speed: 10.0,
    wind_direction: 90.0,
    temperature: 40.0,
    humidity: 20.0,
    num_fires: 3
});
console.log(`Frames: ${simulation.simulation.history.length}`);
```

---

## 18. Acknowledgments

### Libraries and Frameworks
- **TensorFlow/Keras** - Deep learning framework
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **Flask** - Python web framework
- **Next.js** - React framework

### Data Sources
- **NASA POWER** - Climate parameters
- **MODIS** - Satellite fire detection data
- **Landsat/Sentinel** - NDVI and LST imagery

### Inspiration
- Forest Fire research community
- Climate change awareness initiatives
- Emergency response organizations

---

## 19. License

This project is developed for educational purposes.

**Group 04 - Forest Fire Prediction System**

---

## 20. Contact & Support

For issues and feature requests, please refer to the project repository.

---

**FireSight AI** - Almora Forest Fire Prediction System
*Protecting forests through intelligent prediction*

Document Version: 1.0
Last Updated: December 27, 2025
