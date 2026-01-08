/**
 * Prediction Page - 3D Terrain Visualization
 * Fire risk heatmap with Three.js
 */

let terrainScene, terrainCamera, terrainRenderer;
let terrainMesh, riskMesh;
let isAnimating = true;
let wireframeMode = false;
let currentRiskMap = null;

document.addEventListener('DOMContentLoaded', () => {
    initTerrainVisualization();
    initHeatmapCanvas();
    setupEventListeners();

    // Load initial prediction
    generatePrediction();
});

function initTerrainVisualization() {
    const container = document.getElementById('terrain-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    terrainScene = new THREE.Scene();
    terrainScene.background = new THREE.Color(0x0a0a0f);
    terrainScene.fog = new THREE.Fog(0x0a0a0f, 50, 200);

    // Camera
    terrainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    terrainCamera.position.set(50, 60, 80);
    terrainCamera.lookAt(0, 0, 0);

    // Renderer
    terrainRenderer = new THREE.WebGLRenderer({ antialias: true });
    terrainRenderer.setSize(width, height);
    terrainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(terrainRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    terrainScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    terrainScene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff6b35, 1, 100);
    pointLight.position.set(0, 30, 0);
    terrainScene.add(pointLight);

    // Create base terrain
    createTerrain();

    // Create grid helper
    const gridHelper = new THREE.GridHelper(64, 16, 0x333333, 0x222222);
    gridHelper.position.y = -0.5;
    terrainScene.add(gridHelper);

    // Start animation
    animateTerrain();

    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        terrainCamera.aspect = newWidth / newHeight;
        terrainCamera.updateProjectionMatrix();
        terrainRenderer.setSize(newWidth, newHeight);
    });

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        terrainScene.rotation.y += deltaX * 0.005;
        terrainCamera.position.y += deltaY * 0.1;
        terrainCamera.position.y = Math.max(20, Math.min(100, terrainCamera.position.y));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mouseleave', () => isDragging = false);

    // Zoom with wheel
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        terrainCamera.position.z += e.deltaY * 0.1;
        terrainCamera.position.z = Math.max(30, Math.min(150, terrainCamera.position.z));
    });
}

function createTerrain() {
    const size = 64;
    const segments = 63;

    // Generate terrain heights
    const geometry = new THREE.PlaneGeometry(64, 64, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position.array;

    // Create terrain with some variation
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];

        // Create hills
        let height = 0;
        height += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3;
        height += Math.sin(x * 0.2 + 1) * Math.cos(z * 0.15) * 2;
        height += Math.random() * 0.5;

        positions[i + 1] = height;
    }

    geometry.computeVertexNormals();

    // Create material with vertex colors for risk
    const material = new THREE.MeshPhongMaterial({
        color: 0x228B22,
        flatShading: true,
        vertexColors: false,
        side: THREE.DoubleSide
    });

    terrainMesh = new THREE.Mesh(geometry, material);
    terrainScene.add(terrainMesh);

    // Create risk overlay mesh
    const riskGeometry = new THREE.PlaneGeometry(64, 64, segments, segments);
    riskGeometry.rotateX(-Math.PI / 2);

    const riskMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.6,
        vertexColors: true,
        side: THREE.DoubleSide
    });

    riskMesh = new THREE.Mesh(riskGeometry, riskMaterial);
    riskMesh.position.y = 0.1;
    terrainScene.add(riskMesh);
}

function updateTerrainRisk(riskMap) {
    if (!riskMesh || !riskMap) return;

    currentRiskMap = riskMap;
    const geometry = riskMesh.geometry;
    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    const size = riskMap.length;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];

        // Map position to grid index
        const gridX = Math.floor((x + 32) / 64 * size);
        const gridZ = Math.floor((z + 32) / 64 * size);

        // Get risk value
        let risk = 0;
        if (gridX >= 0 && gridX < size && gridZ >= 0 && gridZ < size) {
            risk = riskMap[gridZ][gridX];
        }

        // Convert risk to color
        const color = getRiskColor3(risk);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;

        // Update terrain height based on risk
        const terrainPositions = terrainMesh.geometry.attributes.position.array;
        terrainPositions[i + 1] += risk * 3;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.attributes.color.needsUpdate = true;

    terrainMesh.geometry.computeVertexNormals();
    terrainMesh.geometry.attributes.position.needsUpdate = true;
}

function getRiskColor3(value) {
    // Green to Yellow to Red gradient
    if (value < 0.33) {
        const t = value / 0.33;
        return {
            r: t,
            g: 0.8,
            b: 0.2 * (1 - t)
        };
    } else if (value < 0.66) {
        const t = (value - 0.33) / 0.33;
        return {
            r: 1,
            g: 0.8 - t * 0.5,
            b: 0
        };
    } else {
        const t = (value - 0.66) / 0.34;
        return {
            r: 1,
            g: 0.3 * (1 - t),
            b: 0
        };
    }
}

function animateTerrain() {
    if (!isAnimating) {
        requestAnimationFrame(animateTerrain);
        return;
    }

    requestAnimationFrame(animateTerrain);

    // Slow rotation
    terrainScene.rotation.y += 0.001;

    // Render
    terrainRenderer.render(terrainScene, terrainCamera);
}

function initHeatmapCanvas() {
    const canvas = document.getElementById('heatmap-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placeholder grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 64; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i * 4, 0);
        ctx.lineTo(i * 4, 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * 4);
        ctx.lineTo(256, i * 4);
        ctx.stroke();
    }
}

function updateHeatmap(riskMap) {
    const canvas = document.getElementById('heatmap-canvas');
    if (!canvas || !riskMap) return;

    const ctx = canvas.getContext('2d');
    const size = riskMap.length;
    const cellSize = canvas.width / size;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw risk cells
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const risk = riskMap[y][x];
            ctx.fillStyle = Utils.getRiskColor(risk);
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Draw grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= size; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
}

function setupEventListeners() {
    // Predict button
    document.getElementById('predict-btn')?.addEventListener('click', generatePrediction);

    // Toggle wireframe
    document.getElementById('toggle-wireframe')?.addEventListener('click', () => {
        wireframeMode = !wireframeMode;
        if (terrainMesh) {
            terrainMesh.material.wireframe = wireframeMode;
        }
    });

    // Reset camera
    document.getElementById('reset-camera')?.addEventListener('click', () => {
        terrainCamera.position.set(50, 60, 80);
        terrainCamera.lookAt(0, 0, 0);
        terrainScene.rotation.y = 0;
    });

    // Toggle animation
    document.getElementById('toggle-animation')?.addEventListener('click', () => {
        isAnimating = !isAnimating;
    });
}

async function generatePrediction() {
    const dateInput = document.getElementById('prediction-date');
    const date = dateInput?.value || new Date().toISOString().split('T')[0];

    // Show loading state
    document.getElementById('predict-btn').disabled = true;
    document.getElementById('predict-btn').innerHTML = `
        <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0110 10" stroke-linecap="round"/>
        </svg>
        Predicting...
    `;

    try {
        const response = await API.post('/api/predict', { date });

        if (response.success) {
            // Update visualizations
            updateTerrainRisk(response.risk_map);
            updateHeatmap(response.risk_map);
            updateStats(response.statistics);
            updateGauge(response.statistics.risk_percentage);
        } else {
            console.error('Prediction failed:', response.error);
        }
    } catch (error) {
        console.error('Prediction error:', error);
    } finally {
        document.getElementById('predict-btn').disabled = false;
        document.getElementById('predict-btn').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M12 22V12"/>
            </svg>
            Generate Prediction
        `;
    }
}

function updateStats(stats) {
    document.getElementById('avg-risk').textContent = (stats.average_risk * 100).toFixed(1) + '%';
    document.getElementById('max-risk').textContent = (stats.max_risk * 100).toFixed(1) + '%';
    document.getElementById('high-risk-cells').textContent = stats.high_risk_cells;
}

function updateGauge(riskPercentage) {
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeText = document.getElementById('gauge-text');
    const gaugeLabel = document.getElementById('gauge-label');

    if (gaugeFill && gaugeText && gaugeLabel) {
        // Calculate stroke offset (251 is the arc length)
        const offset = 251 - (251 * riskPercentage / 100);
        gaugeFill.style.strokeDashoffset = offset;

        gaugeText.textContent = riskPercentage.toFixed(1) + '%';

        // Set risk level label
        if (riskPercentage > 60) {
            gaugeLabel.textContent = 'EXTREME RISK';
            gaugeLabel.style.fill = '#ef4444';
        } else if (riskPercentage > 45) {
            gaugeLabel.textContent = 'HIGH RISK';
            gaugeLabel.style.fill = '#f97316';
        } else if (riskPercentage > 30) {
            gaugeLabel.textContent = 'MODERATE RISK';
            gaugeLabel.style.fill = '#eab308';
        } else {
            gaugeLabel.textContent = 'LOW RISK';
            gaugeLabel.style.fill = '#22c55e';
        }
    }
}
