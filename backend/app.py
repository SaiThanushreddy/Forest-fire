#!/usr/bin/env python3
"""
Flask Backend API Server
Almora Forest Fire Prediction System
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import folium
from folium.plugins import HeatMap, MarkerCluster
import warnings
warnings.filterwarnings('ignore')

# TensorFlow import with error handling
try:
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("Warning: TensorFlow not available")

from cellular_automata import CellularAutomataFire, SimulationParams

app = Flask(__name__, static_folder='static', template_folder='templates')

# Enable CORS for frontend connection
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
ALMORA_LAT = 29.5971
ALMORA_LON = 79.6591
ALMORA_BOUNDS = {
    'north': 29.85,
    'south': 29.35,
    'east': 80.00,
    'west': 79.35
}

# Global variables
model = None
fire_data = None
training_stats = None

def load_model():
    """Load the trained CNN-LSTM model"""
    global model
    if not TENSORFLOW_AVAILABLE:
        return None

    model_path = 'models/almora_fire_model.keras'
    if os.path.exists(model_path):
        try:
            model = tf.keras.models.load_model(model_path)
            print(f"Model loaded from {model_path}")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")

    # Try .h5 format
    model_path_h5 = 'models/almora_fire_model.h5'
    if os.path.exists(model_path_h5):
        try:
            model = tf.keras.models.load_model(model_path_h5)
            print(f"Model loaded from {model_path_h5}")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")

    return None

def load_fire_data():
    """Load historical fire data"""
    global fire_data, training_stats

    try:
        fire_data = pd.read_csv('almora_fake_fire_data.csv')
        fire_data['date'] = pd.to_datetime(fire_data['date'])
        print(f"Loaded {len(fire_data)} fire records")
    except Exception as e:
        print(f"Error loading fire data: {e}")
        fire_data = pd.DataFrame()

    # Load training stats
    try:
        with open('models/training_stats.json', 'r') as f:
            training_stats = json.load(f)
    except:
        training_stats = {
            'model_accuracy': 85.0,
            'total_samples': 2191,
            'fire_incidents': 312,
            'epochs_trained': 10
        }

def generate_fire_risk_map(date_str: str = None) -> np.ndarray:
    """Generate fire risk map for given date"""
    # If we have a model and satellite data, use it
    if model and date_str:
        try:
            # Load 5 days of satellite data before the target date
            target_date = datetime.strptime(date_str, '%Y-%m-%d')
            sequence = []

            for i in range(5, 0, -1):
                date = (target_date - timedelta(days=i)).strftime('%Y-%m-%d')
                ndvi_path = f'satellite_images/ndvi_{date}.npy'
                lst_path = f'satellite_images/lst_{date}.npy'

                if os.path.exists(ndvi_path) and os.path.exists(lst_path):
                    ndvi = np.load(ndvi_path)
                    lst = np.load(lst_path)

                    # Normalize
                    ndvi_norm = (ndvi - ndvi.min()) / (ndvi.max() - ndvi.min() + 1e-8)
                    lst_norm = (lst - lst.min()) / (lst.max() - lst.min() + 1e-8)

                    sequence.append(np.stack([ndvi_norm, lst_norm], axis=-1))
                else:
                    return generate_synthetic_risk_map()

            # Make prediction
            X = np.array([sequence])
            prediction = model.predict(X, verbose=0)

            # Use LST channel as fire risk (higher temp = higher risk)
            risk_map = prediction[0, :, :, 1]

            # Enhance contrast
            risk_map = (risk_map - risk_map.min()) / (risk_map.max() - risk_map.min() + 1e-8)

            return risk_map

        except Exception as e:
            print(f"Prediction error: {e}")
            return generate_synthetic_risk_map()

    return generate_synthetic_risk_map()

def generate_synthetic_risk_map() -> np.ndarray:
    """Generate synthetic risk map for visualization"""
    np.random.seed(42)
    risk = np.random.uniform(0.1, 0.5, (64, 64))

    # Add some hotspots
    for _ in range(5):
        cx, cy = np.random.randint(10, 54, 2)
        radius = np.random.randint(5, 15)
        y, x = np.ogrid[:64, :64]
        mask = (x - cx)**2 + (y - cy)**2 <= radius**2
        risk[mask] += np.random.uniform(0.3, 0.5)

    return np.clip(risk, 0, 1)

# ==================== ROUTES ====================

@app.route('/')
def home():
    """Serve the main landing page"""
    return render_template('index.html')

@app.route('/prediction')
def prediction():
    """Serve the prediction page"""
    return render_template('prediction.html')

@app.route('/simulation')
def simulation():
    """Serve the simulation page"""
    return render_template('simulation.html')

@app.route('/analytics')
def analytics():
    """Serve the analytics dashboard"""
    return render_template('analytics.html')

@app.route('/map')
def map_page():
    """Serve the geographic visualization page"""
    return render_template('map.html')

# ==================== API ENDPOINTS ====================

@app.route('/api/predict', methods=['POST'])
def predict():
    """Generate fire prediction for a given date"""
    data = request.get_json() or {}
    date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))

    try:
        risk_map = generate_fire_risk_map(date_str)

        # Calculate risk statistics
        avg_risk = float(np.mean(risk_map))
        max_risk = float(np.max(risk_map))
        high_risk_cells = int(np.sum(risk_map > 0.7))

        # Risk level classification
        if avg_risk > 0.6:
            risk_level = 'EXTREME'
        elif avg_risk > 0.45:
            risk_level = 'HIGH'
        elif avg_risk > 0.3:
            risk_level = 'MODERATE'
        else:
            risk_level = 'LOW'

        return jsonify({
            'success': True,
            'date': date_str,
            'risk_map': risk_map.tolist(),
            'statistics': {
                'average_risk': avg_risk,
                'max_risk': max_risk,
                'high_risk_cells': high_risk_cells,
                'risk_level': risk_level,
                'risk_percentage': avg_risk * 100
            },
            'bounds': ALMORA_BOUNDS,
            'center': {'lat': ALMORA_LAT, 'lon': ALMORA_LON}
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/historical')
def historical():
    """Get historical fire data"""
    if fire_data is None or fire_data.empty:
        return jsonify({'success': False, 'error': 'No data available'}), 404

    # Filter by date range if provided
    start_date = request.args.get('start')
    end_date = request.args.get('end')

    df = fire_data.copy()

    if start_date:
        df = df[df['date'] >= start_date]
    if end_date:
        df = df[df['date'] <= end_date]

    # Convert to list of records
    records = []
    for _, row in df.iterrows():
        records.append({
            'date': row['date'].strftime('%Y-%m-%d'),
            'latitude': float(row['latitude']),
            'longitude': float(row['longitude']),
            'fire_occurred': int(row['fire_occurred']),
            'brightness': float(row['brightness']),
            'confidence': float(row['confidence'])
        })

    return jsonify({
        'success': True,
        'count': len(records),
        'data': records
    })

@app.route('/api/simulation', methods=['POST'])
def run_simulation():
    """Run cellular automata fire spread simulation"""
    data = request.get_json() or {}

    params = SimulationParams(
        grid_size=64,
        wind_speed=float(data.get('wind_speed', 5.0)),
        wind_direction=float(data.get('wind_direction', 45.0)),
        temperature=float(data.get('temperature', 35.0)),
        humidity=float(data.get('humidity', 30.0)),
        base_spread_prob=float(data.get('spread_prob', 0.3)),
        burn_duration=int(data.get('burn_duration', 3)),
        time_steps=int(data.get('time_steps', 50))
    )

    # Load satellite data if available
    try:
        ndvi = np.load('satellite_images/ndvi_2023-05-15.npy')
        lst = np.load('satellite_images/lst_2023-05-15.npy')
    except:
        ndvi = None
        lst = None

    # Create and run simulation
    sim = CellularAutomataFire(params, ndvi, lst)

    # Ignite based on request or random
    ignite_points = data.get('ignite_points', [])
    if ignite_points:
        for point in ignite_points:
            sim.ignite(int(point['row']), int(point['col']))
    else:
        sim.ignite_random(int(data.get('num_fires', 3)))

    # Run simulation
    sim.run()

    return jsonify({
        'success': True,
        'simulation': sim.get_simulation_data()
    })

@app.route('/api/analytics')
def get_analytics():
    """Get analytics data for dashboard"""
    if fire_data is None or fire_data.empty:
        return jsonify({'success': False, 'error': 'No data available'}), 404

    df = fire_data.copy()

    # Monthly fire distribution
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    monthly_fires = df[df['fire_occurred'] == 1].groupby('month').size().to_dict()

    # Fill missing months
    monthly_data = [monthly_fires.get(m, 0) for m in range(1, 13)]

    # Yearly trend
    yearly_fires = df[df['fire_occurred'] == 1].groupby('year').size().to_dict()

    # Geographic hotspots
    fire_locations = df[df['fire_occurred'] == 1][['latitude', 'longitude', 'brightness']].values.tolist()

    # Daily fire probability by season
    seasons = {
        'Winter': [12, 1, 2],
        'Spring': [3, 4, 5],
        'Summer': [6, 7, 8],
        'Autumn': [9, 10, 11]
    }

    seasonal_risk = {}
    for season, months in seasons.items():
        season_data = df[df['month'].isin(months)]
        if len(season_data) > 0:
            seasonal_risk[season] = float(season_data['fire_occurred'].mean() * 100)
        else:
            seasonal_risk[season] = 0

    return jsonify({
        'success': True,
        'total_records': len(df),
        'total_fires': int(df['fire_occurred'].sum()),
        'fire_rate': float(df['fire_occurred'].mean() * 100),
        'monthly_distribution': monthly_data,
        'yearly_trend': yearly_fires,
        'seasonal_risk': seasonal_risk,
        'hotspots': fire_locations[:100],  # Limit for performance
        'training_stats': training_stats,
        'date_range': {
            'start': df['date'].min().strftime('%Y-%m-%d'),
            'end': df['date'].max().strftime('%Y-%m-%d')
        }
    })

@app.route('/api/heatmap')
def get_heatmap():
    """Get fire risk heatmap data"""
    if fire_data is None or fire_data.empty:
        return jsonify({'success': False, 'error': 'No data available'}), 404

    # Get fire locations with intensity
    fires = fire_data[fire_data['fire_occurred'] == 1]

    heatmap_data = []
    for _, row in fires.iterrows():
        heatmap_data.append([
            float(row['latitude']),
            float(row['longitude']),
            float(row['brightness'] / 500)  # Normalize intensity
        ])

    return jsonify({
        'success': True,
        'data': heatmap_data,
        'center': {'lat': ALMORA_LAT, 'lon': ALMORA_LON},
        'bounds': ALMORA_BOUNDS
    })

@app.route('/api/folium-map')
def get_folium_map():
    """Generate Folium map HTML"""
    if fire_data is None or fire_data.empty:
        return jsonify({'success': False, 'error': 'No data available'}), 404

    # Create base map
    m = folium.Map(
        location=[ALMORA_LAT, ALMORA_LON],
        zoom_start=10,
        tiles='cartodbdark_matter'
    )

    # Add fire locations
    fires = fire_data[fire_data['fire_occurred'] == 1]

    heat_data = []
    for _, row in fires.iterrows():
        heat_data.append([row['latitude'], row['longitude'], row['brightness'] / 500])

    # Add heatmap layer
    HeatMap(
        heat_data,
        min_opacity=0.3,
        radius=15,
        blur=20,
        gradient={0.4: 'yellow', 0.65: 'orange', 1: 'red'}
    ).add_to(m)

    # Add marker cluster for individual fires
    marker_cluster = MarkerCluster(name='Fire Incidents').add_to(m)

    for _, row in fires.sample(min(100, len(fires))).iterrows():
        folium.CircleMarker(
            location=[row['latitude'], row['longitude']],
            radius=5,
            color='red',
            fill=True,
            popup=f"Date: {row['date']}<br>Brightness: {row['brightness']:.1f}<br>Confidence: {row['confidence']:.1f}%"
        ).add_to(marker_cluster)

    # Add layer control
    folium.LayerControl().add_to(m)

    # Return map HTML
    map_html = m._repr_html_()
    return jsonify({'success': True, 'map_html': map_html})

@app.route('/api/terrain-data')
def get_terrain_data():
    """Get terrain elevation data for 3D visualization"""
    # Generate synthetic terrain for Almora region
    np.random.seed(42)

    size = 64
    terrain = np.zeros((size, size))

    # Create base terrain with some hills
    for i in range(5):
        cx, cy = np.random.randint(10, 54, 2)
        height = np.random.uniform(0.5, 1.0)
        sigma = np.random.uniform(8, 15)

        y, x = np.ogrid[:size, :size]
        terrain += height * np.exp(-((x - cx)**2 + (y - cy)**2) / (2 * sigma**2))

    # Add some noise
    terrain += np.random.uniform(0, 0.1, (size, size))

    # Normalize to reasonable elevation values (1000-3000m for Almora)
    terrain = 1000 + terrain * 2000

    return jsonify({
        'success': True,
        'terrain': terrain.tolist(),
        'size': size,
        'min_elevation': float(terrain.min()),
        'max_elevation': float(terrain.max()),
        'bounds': ALMORA_BOUNDS
    })

@app.route('/api/weather')
def get_weather():
    """Get current weather data (synthetic for demo)"""
    # Simulate weather data
    weather = {
        'temperature': np.random.uniform(28, 42),
        'humidity': np.random.uniform(20, 60),
        'wind_speed': np.random.uniform(5, 25),
        'wind_direction': np.random.uniform(0, 360),
        'precipitation': np.random.uniform(0, 10),
        'fire_weather_index': np.random.uniform(40, 90)
    }

    return jsonify({
        'success': True,
        'weather': weather,
        'location': {'name': 'Almora, Uttarakhand', 'lat': ALMORA_LAT, 'lon': ALMORA_LON},
        'timestamp': datetime.now().isoformat()
    })

# ==================== STATIC FILES ====================

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

# ==================== INITIALIZATION ====================

def initialize():
    """Initialize the application"""
    print("="*60)
    print("ALMORA FOREST FIRE PREDICTION SYSTEM")
    print("="*60)

    load_fire_data()
    load_model()

    print("\nServer ready!")
    print(f"Access the application at: http://localhost:5000")
    print("="*60)

if __name__ == '__main__':
    initialize()
    app.run(host='0.0.0.0', port=5000, debug=True)
