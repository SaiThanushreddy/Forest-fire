#!/usr/bin/env python3
"""
Generate PDF documentation for Forest Fire Project
"""

from fpdf import FPDF
import re

class PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)

    def header(self):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, 'FireSight AI - Almora Forest Fire Prediction System', 0, 0, 'C')
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(200, 80, 30)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(4)

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, title, 0, 1, 'L')
        self.ln(2)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def code_block(self, text):
        self.set_font('Courier', '', 9)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5, text, fill=True)
        self.ln(3)

    def table_row(self, cols, is_header=False):
        self.set_font('Helvetica', 'B' if is_header else '', 9)
        if is_header:
            self.set_fill_color(200, 80, 30)
            self.set_text_color(255, 255, 255)
        else:
            self.set_fill_color(250, 250, 250)
            self.set_text_color(0, 0, 0)

        col_width = 190 / len(cols)
        for col in cols:
            self.cell(col_width, 7, str(col)[:30], 1, 0, 'L', fill=True)
        self.ln()

def create_pdf():
    pdf = PDF()
    pdf.add_page()

    # Title Page
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(200, 80, 30)
    pdf.ln(40)
    pdf.cell(0, 15, 'FireSight AI', 0, 1, 'C')

    pdf.set_font('Helvetica', '', 18)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 10, 'Almora Forest Fire Prediction System', 0, 1, 'C')

    pdf.ln(10)
    pdf.set_font('Helvetica', '', 12)
    pdf.cell(0, 8, 'Complete Project Documentation', 0, 1, 'C')

    pdf.ln(30)
    pdf.set_font('Helvetica', 'I', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Group 04 - Forest Fire Prediction System', 0, 1, 'C')
    pdf.cell(0, 8, 'Location: Almora District, Uttarakhand, India', 0, 1, 'C')
    pdf.cell(0, 8, 'Coordinates: 29.60N, 79.66E', 0, 1, 'C')

    pdf.ln(40)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 6, 'Document Version: 1.0', 0, 1, 'C')
    pdf.cell(0, 6, 'Last Updated: December 27, 2025', 0, 1, 'C')

    # Section 1: Project Overview
    pdf.add_page()
    pdf.chapter_title('1. Project Overview')

    pdf.body_text('''FireSight AI is a comprehensive deep learning system for predicting and simulating forest fires in Almora District, Uttarakhand, India. The system combines advanced machine learning techniques with real-time visualization to provide accurate fire risk assessments and spread simulations.''')

    pdf.section_title('Key Features')
    pdf.body_text('''- CNN-LSTM Deep Learning Model for fire risk prediction
- Cellular Automata Fire Spread Simulation with physics-based parameters
- 3D Interactive Web Frontend with real-time visualizations
- Geographic Map Integration with heatmaps and fire hotspots
- Analytics Dashboard with historical data analysis''')

    # Section 2: Architecture
    pdf.add_page()
    pdf.chapter_title('2. System Architecture')

    pdf.body_text('''The system follows a modern full-stack architecture with separate frontend and backend components communicating via REST APIs.''')

    pdf.section_title('Frontend Stack')
    pdf.body_text('''- Next.js 16.1.1 (React Framework)
- React 19.2.3 (UI Library)
- Three.js 0.182.0 (3D Graphics)
- React Three Fiber 9.4.2 (React + Three.js)
- Leaflet 1.9.4 (Interactive Maps)
- TailwindCSS 4.x (Styling)
- TypeScript 5.x (Type Safety)''')

    pdf.section_title('Backend Stack')
    pdf.body_text('''- Python 3.8+ (Core Runtime)
- Flask 2.0+ (REST API Framework)
- TensorFlow/Keras 2.10+ (Deep Learning)
- NumPy 1.21+ (Numerical Computing)
- Pandas 1.3+ (Data Manipulation)
- Folium 0.14+ (Map Generation)
- scikit-learn 1.0+ (ML Utilities)''')

    # Section 3: Deep Learning Model
    pdf.add_page()
    pdf.chapter_title('3. Deep Learning Model')

    pdf.section_title('CNN-LSTM Architecture')
    pdf.body_text('''The model uses a hybrid Convolutional Neural Network + Long Short-Term Memory architecture for spatiotemporal fire prediction. It processes sequences of 5 satellite images (64x64 pixels, 2 channels: NDVI + LST) to predict the next day's conditions.''')

    pdf.section_title('Model Layers')
    pdf.code_block('''Input: (batch, 5, 64, 64, 2)

TimeDistributed Conv2D (32 filters, 3x3, ReLU)
TimeDistributed BatchNormalization
TimeDistributed MaxPooling2D (2x2)
TimeDistributed Dropout (0.25)

TimeDistributed Conv2D (64 filters, 3x3, ReLU)
TimeDistributed BatchNormalization
TimeDistributed MaxPooling2D (2x2)
TimeDistributed Dropout (0.25)

TimeDistributed Conv2D (128 filters, 3x3, ReLU)
TimeDistributed BatchNormalization
TimeDistributed MaxPooling2D (2x2)
TimeDistributed Dropout (0.25)

TimeDistributed Flatten
LSTM (256 units, return_sequences=True)
LSTM (128 units)
Dense (512 units, ReLU)
Dense (8192 units, Sigmoid)
Reshape (64, 64, 2)

Output: (batch, 64, 64, 2)''')

    pdf.section_title('Training Statistics')
    pdf.table_row(['Metric', 'Value'], is_header=True)
    pdf.table_row(['Training Date', 'December 27, 2025'])
    pdf.table_row(['Total Samples', '2,191 days'])
    pdf.table_row(['Fire Incidents', '107 events'])
    pdf.table_row(['Epochs Trained', '10'])
    pdf.table_row(['Final Loss (MSE)', '0.0325'])
    pdf.table_row(['Final Validation Loss', '0.0322'])
    pdf.table_row(['Model Accuracy', '~84.8%'])
    pdf.table_row(['Model File Size', '~150 MB'])

    # Section 4: Cellular Automata
    pdf.add_page()
    pdf.chapter_title('4. Cellular Automata Fire Simulation')

    pdf.body_text('''The simulation uses a grid-based cellular automata model to simulate realistic fire spread patterns based on environmental conditions.''')

    pdf.section_title('Cell States')
    pdf.table_row(['State', 'Value', 'Description'], is_header=True)
    pdf.table_row(['UNBURNED', '0', 'Forest/vegetation (Green)'])
    pdf.table_row(['BURNING', '1', 'Active fire (Orange)'])
    pdf.table_row(['BURNED', '2', 'Burnt area (Black)'])
    pdf.table_row(['WATER', '3', 'Cannot burn (Blue)'])

    pdf.section_title('Simulation Parameters')
    pdf.table_row(['Parameter', 'Default', 'Range'], is_header=True)
    pdf.table_row(['Grid Size', '64x64', '32-128'])
    pdf.table_row(['Wind Speed', '5.0 m/s', '0-20 m/s'])
    pdf.table_row(['Wind Direction', '45 deg', '0-360 deg'])
    pdf.table_row(['Temperature', '35 C', '15-50 C'])
    pdf.table_row(['Humidity', '30%', '10-90%'])
    pdf.table_row(['Base Spread Prob', '0.3', '0.1-0.9'])
    pdf.table_row(['Burn Duration', '3 steps', '1-10'])
    pdf.table_row(['Time Steps', '50', '10-200'])

    pdf.section_title('Fire Spread Probability Formula')
    pdf.code_block('''P(spread) = base_prob x vegetation_factor x temp_factor
             x humidity_factor x wind_factor

Where:
- vegetation_factor = 0.5 + NDVI_value
- temp_factor = 0.7 + 0.6 x normalized_temperature
- humidity_factor = 0.5 + (1 - humidity/100)
- wind_factor = 1.0 + cos(angle_diff) x wind_strength

Maximum probability capped at 95%''')

    # Section 5: API Endpoints
    pdf.add_page()
    pdf.chapter_title('5. REST API Endpoints')

    pdf.body_text('Base URL: http://localhost:5000')
    pdf.ln(5)

    pdf.table_row(['Endpoint', 'Method', 'Description'], is_header=True)
    pdf.table_row(['/api/predict', 'POST', 'Generate fire prediction'])
    pdf.table_row(['/api/simulation', 'POST', 'Run CA simulation'])
    pdf.table_row(['/api/historical', 'GET', 'Historical fire data'])
    pdf.table_row(['/api/analytics', 'GET', 'Dashboard analytics'])
    pdf.table_row(['/api/heatmap', 'GET', 'Fire heatmap data'])
    pdf.table_row(['/api/weather', 'GET', 'Weather data'])
    pdf.table_row(['/api/terrain-data', 'GET', '3D terrain elevation'])
    pdf.table_row(['/api/folium-map', 'GET', 'Generate Folium map'])

    pdf.section_title('Example: Prediction API Response')
    pdf.code_block('''{
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
  "center": {"lat": 29.5971, "lon": 79.6591}
}''')

    # Section 6: Directory Structure
    pdf.add_page()
    pdf.chapter_title('6. Project Directory Structure')

    pdf.code_block('''forest_fire_project/
|-- backend/
|   |-- app.py                 # Flask REST API server
|   |-- model_trainer.py       # CNN-LSTM training script
|   |-- cellular_automata.py   # Fire spread simulation
|   |-- requirements.txt       # Python dependencies
|   |-- almora_fake_fire_data.csv
|   |-- models/
|   |   |-- almora_fire_model.keras
|   |   |-- training_stats.json
|   |-- satellite_images/      # NDVI and LST data
|   |-- static/                # CSS, JS, images
|   |-- templates/             # HTML templates
|
|-- frontend/                  # Next.js Application
|   |-- src/
|   |   |-- app/              # Pages
|   |   |-- components/
|   |   |   |-- three/        # 3D visualizations
|   |   |   |-- map/          # 2D map components
|   |   |   |-- ui/           # Dashboard
|   |   |-- lib/              # API service
|   |   |-- hooks/            # React hooks
|   |   |-- shaders/          # WebGL shaders
|   |-- package.json
|
|-- Final_Wildfire_prediction_Group_04.ipynb
|-- start.sh                   # Full stack startup
|-- run.sh                     # Backend startup
|-- README.md
|-- PROJECT_DOCUMENTATION.md''')

    # Section 7: Installation
    pdf.add_page()
    pdf.chapter_title('7. Installation & Setup')

    pdf.section_title('System Requirements')
    pdf.body_text('''- OS: Linux, macOS, or Windows with WSL
- Python: 3.8 or higher
- Node.js: 18.x or higher
- Browser: Modern browser with WebGL support
- RAM: 4GB minimum, 8GB recommended''')

    pdf.section_title('Backend Setup')
    pdf.code_block('''# Create virtual environment
python3 -m venv ~/forest_fire_env
source ~/forest_fire_env/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Train model (optional)
python model_trainer.py

# Start server
python app.py''')

    pdf.section_title('Frontend Setup')
    pdf.code_block('''# Navigate to frontend
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev''')

    pdf.section_title('Quick Start (Both Servers)')
    pdf.code_block('''# From project root
./start.sh''')

    # Section 8: Usage Guide
    pdf.add_page()
    pdf.chapter_title('8. Usage Guide')

    pdf.section_title('Fire Prediction')
    pdf.body_text('''1. Navigate to http://localhost:3000
2. Select a date using the date picker
3. Click "Generate Prediction"
4. View the fire risk heatmap overlay
5. Check statistics panel for risk assessment''')

    pdf.section_title('Fire Simulation')
    pdf.body_text('''1. Set environment parameters:
   - Wind Speed (0-20 m/s)
   - Wind Direction (0-360 degrees)
   - Temperature (15-50 C)
   - Humidity (10-90%)

2. Choose ignition method:
   - Center: Start fire in grid center
   - Random: Random ignition points

3. Control simulation:
   - Click "Start" to begin
   - Adjust speed (1x to 30x)
   - Monitor real-time statistics''')

    pdf.section_title('Risk Classification')
    pdf.table_row(['Risk Level', 'Range', 'Action'], is_header=True)
    pdf.table_row(['LOW', '< 30%', 'Normal monitoring'])
    pdf.table_row(['MODERATE', '30-45%', 'Increased vigilance'])
    pdf.table_row(['HIGH', '45-60%', 'Alert fire services'])
    pdf.table_row(['EXTREME', '> 60%', 'Emergency response'])

    # Section 9: Data Sources
    pdf.add_page()
    pdf.chapter_title('9. Data Sources')

    pdf.section_title('Historical Fire Data (CSV)')
    pdf.table_row(['Column', 'Type', 'Description'], is_header=True)
    pdf.table_row(['date', 'datetime', 'Fire incident date'])
    pdf.table_row(['latitude', 'float', 'Location latitude'])
    pdf.table_row(['longitude', 'float', 'Location longitude'])
    pdf.table_row(['fire_occurred', 'int', 'Binary flag (0/1)'])
    pdf.table_row(['brightness', 'float', 'Fire brightness'])
    pdf.table_row(['confidence', 'float', 'Detection confidence'])

    pdf.section_title('Satellite Data')
    pdf.body_text('''NDVI (Normalized Difference Vegetation Index):
- Measures vegetation health/density
- Range: 0.0 to 1.0
- Higher values = more fuel for fire

LST (Land Surface Temperature):
- Thermal satellite measurements
- Higher values = increased fire risk''')

    pdf.section_title('NASA POWER Data')
    pdf.body_text('''- Climatic design conditions (2018-2023)
- Location: 29.60 N, 79.65 E
- Weather parameters for fire risk modeling''')

    # Section 10: Frontend Components
    pdf.add_page()
    pdf.chapter_title('10. Frontend Components')

    pdf.section_title('3D Visualizations (Three.js)')
    pdf.table_row(['Component', 'Description'], is_header=True)
    pdf.table_row(['ForestFireScene', 'Main 3D scene container'])
    pdf.table_row(['FireSpreadVisualization', 'Animated fire spread'])
    pdf.table_row(['VolumetricFire', 'Realistic fire rendering'])
    pdf.table_row(['Terrain', '3D terrain mesh'])
    pdf.table_row(['Forest', 'Tree/vegetation rendering'])
    pdf.table_row(['Smoke', 'Particle smoke effects'])

    pdf.section_title('2D Map Components (Leaflet)')
    pdf.table_row(['Component', 'Description'], is_header=True)
    pdf.table_row(['AlmoraMap', 'Main map with fire overlay'])
    pdf.table_row(['FireMap2D', '2D fire risk heatmap'])

    pdf.section_title('Dashboard Components')
    pdf.table_row(['Component', 'Description'], is_header=True)
    pdf.table_row(['PremiumDashboard', 'Full control panel'])
    pdf.table_row(['Dashboard', 'Basic stats display'])

    # Section 11: Future Enhancements
    pdf.add_page()
    pdf.chapter_title('11. Future Enhancements')

    pdf.body_text('''1. Real-time Data Integration
   - NASA FIRMS API for live fire detection
   - OpenWeatherMap API for weather data

2. Enhanced Model
   - Larger training dataset
   - Additional input features (elevation, land use)
   - Ensemble model approach

3. User Experience
   - Mobile-responsive design
   - PWA support for offline access
   - User authentication

4. Alert System
   - SMS notifications
   - Email alerts
   - Push notifications

5. Multi-region Support
   - Extend to other fire-prone regions
   - Configurable geographic boundaries''')

    # Acknowledgments
    pdf.add_page()
    pdf.chapter_title('12. Acknowledgments')

    pdf.section_title('Libraries and Frameworks')
    pdf.body_text('''- TensorFlow/Keras - Deep learning framework
- Three.js - 3D graphics library
- React Three Fiber - React renderer for Three.js
- Leaflet - Interactive maps
- Flask - Python web framework
- Next.js - React framework''')

    pdf.section_title('Data Sources')
    pdf.body_text('''- NASA POWER - Climate parameters
- MODIS - Satellite fire detection data
- Landsat/Sentinel - NDVI and LST imagery''')

    pdf.ln(20)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(200, 80, 30)
    pdf.cell(0, 10, 'FireSight AI', 0, 1, 'C')
    pdf.set_font('Helvetica', 'I', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Almora Forest Fire Prediction System', 0, 1, 'C')
    pdf.cell(0, 8, 'Protecting forests through intelligent prediction', 0, 1, 'C')
    pdf.ln(10)
    pdf.cell(0, 8, 'Group 04 - Educational Project', 0, 1, 'C')

    # Save PDF
    pdf.output('/home/kali/Documents/forest_fire_project/PROJECT_DOCUMENTATION.pdf')
    print("PDF generated successfully!")

if __name__ == "__main__":
    create_pdf()
