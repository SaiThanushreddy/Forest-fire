/**
 * Geographic Map Visualization
 * Leaflet-based interactive fire map
 */

let map = null;
let heatLayer = null;
let markerLayer = null;
let riskLayer = null;
let fireData = [];

// Map configuration
const ALMORA_CENTER = [29.5971, 79.6591];
const ALMORA_BOUNDS = [[29.35, 79.35], [29.85, 80.00]];

// Map tile providers
const tileLayers = {
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 18
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 18
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenTopoMap',
        maxZoom: 17
    }),
    light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 18
    })
};

let currentTileLayer = tileLayers.dark;

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadFireData();
    loadWeather();
    setupControls();
});

function initMap() {
    // Create map
    map = L.map('leaflet-map', {
        center: ALMORA_CENTER,
        zoom: 11,
        zoomControl: false,
        maxBounds: [[28.5, 78.5], [30.5, 81.0]]
    });

    // Add default tile layer
    currentTileLayer.addTo(map);

    // Add Almora boundary
    const boundary = L.rectangle(ALMORA_BOUNDS, {
        color: '#ff6b35',
        weight: 2,
        fillColor: '#ff6b35',
        fillOpacity: 0.1,
        dashArray: '5, 5'
    }).addTo(map);

    // Add center marker
    const centerMarker = L.circleMarker(ALMORA_CENTER, {
        radius: 8,
        fillColor: '#4ecdc4',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8
    }).addTo(map);

    centerMarker.bindPopup(`
        <div style="text-align: center;">
            <strong>Almora District</strong><br>
            <small>Uttarakhand, India</small><br>
            <small>29.5971N, 79.6591E</small>
        </div>
    `);

    // Track mouse position
    map.on('mousemove', (e) => {
        const coords = document.getElementById('mouse-coords');
        if (coords) {
            coords.textContent = `Lat: ${e.latlng.lat.toFixed(4)}, Lon: ${e.latlng.lng.toFixed(4)}`;
        }
    });

    // Update location info on click
    map.on('click', (e) => {
        document.getElementById('info-lat').textContent = e.latlng.lat.toFixed(4);
        document.getElementById('info-lon').textContent = e.latlng.lng.toFixed(4);
    });
}

async function loadFireData() {
    try {
        const startDate = document.getElementById('date-from')?.value || '2018-01-01';
        const endDate = document.getElementById('date-to')?.value || '2023-12-31';

        const response = await API.get(`/api/historical?start=${startDate}&end=${endDate}`);

        if (response.success) {
            fireData = response.data;
            document.getElementById('fire-count').textContent =
                `${response.count} fire incidents recorded`;

            updateHeatmap();
            updateMarkers();
        }
    } catch (error) {
        console.error('Failed to load fire data:', error);
        document.getElementById('fire-count').textContent = 'Failed to load data';
    }
}

function updateHeatmap() {
    // Remove existing heatmap
    if (heatLayer) {
        map.removeLayer(heatLayer);
    }

    // Check if layer is enabled
    if (!document.getElementById('layer-heatmap')?.checked) return;

    // Prepare heat data
    const heatData = fireData
        .filter(d => d.fire_occurred === 1)
        .map(d => [d.latitude, d.longitude, d.brightness / 500]);

    // Create heat layer
    heatLayer = L.heatLayer(heatData, {
        radius: 20,
        blur: 25,
        maxZoom: 14,
        max: 1.0,
        gradient: {
            0.2: '#ffff00',
            0.4: '#ffa500',
            0.6: '#ff6600',
            0.8: '#ff3300',
            1.0: '#ff0000'
        }
    }).addTo(map);
}

function updateMarkers() {
    // Remove existing markers
    if (markerLayer) {
        map.removeLayer(markerLayer);
    }

    // Check if layer is enabled
    if (!document.getElementById('layer-markers')?.checked) return;

    // Create marker cluster group
    markerLayer = L.layerGroup();

    // Add fire markers
    const fires = fireData.filter(d => d.fire_occurred === 1);

    // Limit markers for performance
    const maxMarkers = 200;
    const step = Math.max(1, Math.floor(fires.length / maxMarkers));

    fires.forEach((fire, index) => {
        if (index % step !== 0) return;

        const marker = L.circleMarker([fire.latitude, fire.longitude], {
            radius: 6,
            fillColor: getIntensityColor(fire.brightness),
            color: '#fff',
            weight: 1,
            fillOpacity: 0.8
        });

        marker.bindPopup(`
            <div class="fire-popup">
                <strong>Fire Incident</strong><br>
                <small>Date: ${fire.date}</small><br>
                <small>Brightness: ${fire.brightness.toFixed(1)} K</small><br>
                <small>Confidence: ${fire.confidence.toFixed(1)}%</small><br>
                <small>Location: ${fire.latitude.toFixed(4)}, ${fire.longitude.toFixed(4)}</small>
            </div>
        `);

        markerLayer.addLayer(marker);
    });

    markerLayer.addTo(map);
}

function getIntensityColor(brightness) {
    const normalized = Math.min(1, (brightness - 300) / 200);
    if (normalized < 0.33) return '#ffff00';
    if (normalized < 0.66) return '#ff6600';
    return '#ff0000';
}

async function updateRiskZones() {
    // Remove existing risk layer
    if (riskLayer) {
        map.removeLayer(riskLayer);
    }

    // Check if layer is enabled
    if (!document.getElementById('layer-risk')?.checked) return;

    try {
        const response = await API.post('/api/predict', { date: new Date().toISOString().split('T')[0] });

        if (response.success && response.risk_map) {
            const riskMap = response.risk_map;
            const bounds = ALMORA_BOUNDS;

            // Create canvas for risk overlay
            const canvas = document.createElement('canvas');
            canvas.width = riskMap.length;
            canvas.height = riskMap.length;
            const ctx = canvas.getContext('2d');

            // Draw risk map
            for (let y = 0; y < riskMap.length; y++) {
                for (let x = 0; x < riskMap.length; x++) {
                    const risk = riskMap[y][x];
                    ctx.fillStyle = Utils.getRiskColor(risk);
                    ctx.globalAlpha = risk * 0.7;
                    ctx.fillRect(x, y, 1, 1);
                }
            }

            // Create image overlay
            riskLayer = L.imageOverlay(canvas.toDataURL(), bounds, {
                opacity: 0.6
            }).addTo(map);
        }
    } catch (error) {
        console.error('Failed to load risk zones:', error);
    }
}

async function loadWeather() {
    try {
        const response = await API.get('/api/weather');

        if (response.success) {
            const weather = response.weather;
            document.getElementById('weather-temp').textContent =
                weather.temperature.toFixed(0) + 'C';
            document.getElementById('weather-humid').textContent =
                weather.humidity.toFixed(0) + '%';
            document.getElementById('weather-wind').textContent =
                weather.wind_speed.toFixed(1) + ' m/s';
            document.getElementById('weather-fwi').textContent =
                weather.fire_weather_index.toFixed(0);
        }
    } catch (error) {
        console.error('Failed to load weather:', error);
    }
}

function setupControls() {
    // Layer toggles
    document.getElementById('layer-heatmap')?.addEventListener('change', updateHeatmap);
    document.getElementById('layer-markers')?.addEventListener('change', updateMarkers);
    document.getElementById('layer-risk')?.addEventListener('change', updateRiskZones);
    document.getElementById('layer-terrain')?.addEventListener('change', (e) => {
        if (e.target.checked) {
            map.removeLayer(currentTileLayer);
            currentTileLayer = tileLayers.terrain;
            currentTileLayer.addTo(map);
        } else {
            map.removeLayer(currentTileLayer);
            currentTileLayer = tileLayers.dark;
            currentTileLayer.addTo(map);
        }
    });

    // Date filter
    document.getElementById('apply-filter')?.addEventListener('click', loadFireData);

    // Map style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const style = e.target.dataset.style;
            map.removeLayer(currentTileLayer);
            currentTileLayer = tileLayers[style] || tileLayers.dark;
            currentTileLayer.addTo(map);
        });
    });

    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out')?.addEventListener('click', () => map.zoomOut());
    document.getElementById('zoom-fit')?.addEventListener('click', () => {
        map.fitBounds(ALMORA_BOUNDS, { padding: [20, 20] });
    });
}
