/**
 * Simulation Page - 3D Cellular Automata Visualization
 * Fire spread simulation with Three.js
 */

let simScene, simCamera, simRenderer;
let cellMeshes = [];
let simulationData = null;
let currentStep = 0;
let isPlaying = false;
let playbackSpeed = 1;
let playbackInterval = null;
let spreadChart = null;

// Cell states
const UNBURNED = 0;
const BURNING = 1;
const BURNED = 2;

document.addEventListener('DOMContentLoaded', () => {
    init3DSimulation();
    initChart();
    setupControls();
    updateSliderValues();
});

function init3DSimulation() {
    const container = document.getElementById('simulation-3d');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    simScene = new THREE.Scene();
    simScene.background = new THREE.Color(0x0a0a0f);

    // Camera
    simCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    simCamera.position.set(50, 70, 80);
    simCamera.lookAt(0, 0, 0);

    // Renderer
    simRenderer = new THREE.WebGLRenderer({ antialias: true });
    simRenderer.setSize(width, height);
    simRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(simRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    simScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    simScene.add(directionalLight);

    // Create initial grid
    createCellGrid();

    // Grid helper
    const gridHelper = new THREE.GridHelper(64, 64, 0x222222, 0x111111);
    gridHelper.position.y = -0.1;
    simScene.add(gridHelper);

    // Animation loop
    animate3DSimulation();

    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        simCamera.aspect = newWidth / newHeight;
        simCamera.updateProjectionMatrix();
        simRenderer.setSize(newWidth, newHeight);
    });

    // Mouse controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        simScene.rotation.y += dx * 0.005;
        simCamera.position.y = Math.max(20, Math.min(120, simCamera.position.y + dy * 0.1));
        prevMouse = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mouseleave', () => isDragging = false);

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        simCamera.position.z = Math.max(40, Math.min(150, simCamera.position.z + e.deltaY * 0.1));
    });
}

function createCellGrid() {
    // Clear existing cells
    cellMeshes.forEach(mesh => simScene.remove(mesh));
    cellMeshes = [];

    const gridSize = 64;
    const cellSize = 1;
    const offset = gridSize / 2;

    // Create instanced mesh for better performance
    const geometry = new THREE.BoxGeometry(cellSize * 0.9, 0.5, cellSize * 0.9);

    // Create cells
    for (let z = 0; z < gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
            const material = new THREE.MeshPhongMaterial({
                color: 0x228B22,
                flatShading: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x - offset + 0.5, 0.25, z - offset + 0.5);
            mesh.userData = { row: z, col: x, state: UNBURNED };

            simScene.add(mesh);
            cellMeshes.push(mesh);
        }
    }
}

function updateCellStates(grid) {
    if (!grid || !cellMeshes.length) return;

    const gridSize = grid.length;

    cellMeshes.forEach((mesh, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        if (row < gridSize && col < gridSize) {
            const state = grid[row][col];
            mesh.userData.state = state;

            // Update color and height based on state
            switch (state) {
                case BURNING:
                    mesh.material.color.setHex(0xFF4500);
                    mesh.material.emissive = new THREE.Color(0xFF2200);
                    mesh.material.emissiveIntensity = 0.5;
                    mesh.position.y = 0.5 + Math.sin(Date.now() * 0.01 + index) * 0.2;
                    mesh.scale.y = 1.5 + Math.sin(Date.now() * 0.01 + index) * 0.3;
                    break;
                case BURNED:
                    mesh.material.color.setHex(0x1a1a1a);
                    mesh.material.emissive = new THREE.Color(0x000000);
                    mesh.position.y = 0.15;
                    mesh.scale.y = 0.6;
                    break;
                default: // UNBURNED
                    mesh.material.color.setHex(0x228B22);
                    mesh.material.emissive = new THREE.Color(0x000000);
                    mesh.position.y = 0.25;
                    mesh.scale.y = 1;
            }
        }
    });
}

function animate3DSimulation() {
    requestAnimationFrame(animate3DSimulation);

    // Animate burning cells
    cellMeshes.forEach((mesh, index) => {
        if (mesh.userData.state === BURNING) {
            mesh.position.y = 0.5 + Math.sin(Date.now() * 0.01 + index * 0.1) * 0.2;
            mesh.scale.y = 1.5 + Math.sin(Date.now() * 0.01 + index * 0.1) * 0.3;
        }
    });

    // Slow auto-rotation
    simScene.rotation.y += 0.0005;

    simRenderer.render(simScene, simCamera);
}

function initChart() {
    const ctx = document.getElementById('spread-chart');
    if (!ctx) return;

    spreadChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Burning',
                    data: [],
                    borderColor: '#FF4500',
                    backgroundColor: 'rgba(255, 69, 0, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Burned',
                    data: [],
                    borderColor: '#333333',
                    backgroundColor: 'rgba(51, 51, 51, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#a0a0b0' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#a0a0b0' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#a0a0b0',
                        callback: (value) => value + '%'
                    },
                    max: 100
                }
            }
        }
    });
}

function updateChart(statsHistory) {
    if (!spreadChart || !statsHistory) return;

    spreadChart.data.labels = statsHistory.map((_, i) => i);
    spreadChart.data.datasets[0].data = statsHistory.map(s => s.burning_pct);
    spreadChart.data.datasets[1].data = statsHistory.map(s => s.burned_pct);
    spreadChart.update();
}

function setupControls() {
    // Run button
    document.getElementById('btn-run')?.addEventListener('click', runSimulation);

    // Pause button
    document.getElementById('btn-pause')?.addEventListener('click', pauseSimulation);

    // Reset button
    document.getElementById('btn-reset')?.addEventListener('click', resetSimulation);

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            playbackSpeed = parseFloat(e.target.dataset.speed);

            if (isPlaying) {
                clearInterval(playbackInterval);
                startPlayback();
            }
        });
    });

    // Slider updates
    document.querySelectorAll('.slider').forEach(slider => {
        slider.addEventListener('input', updateSliderValues);
    });

    // Wind direction with compass
    const windDir = document.getElementById('wind-dir');
    if (windDir) {
        windDir.addEventListener('input', () => {
            const needle = document.getElementById('compass-needle');
            if (needle) {
                needle.style.transform = `translateX(-50%) translateY(-100%) rotate(${windDir.value}deg)`;
            }
            document.getElementById('wind-dir-val').textContent = windDir.value + 'deg';
        });
    }
}

function updateSliderValues() {
    document.getElementById('wind-speed-val').textContent = document.getElementById('wind-speed')?.value || '8';
    document.getElementById('wind-dir-val').textContent = (document.getElementById('wind-dir')?.value || '45') + 'deg';
    document.getElementById('temp-val').textContent = (document.getElementById('temperature')?.value || '38') + 'C';
    document.getElementById('humid-val').textContent = (document.getElementById('humidity')?.value || '25') + '%';
    document.getElementById('spread-val').textContent = (document.getElementById('spread-prob')?.value || '35') + '%';
    document.getElementById('fires-val').textContent = document.getElementById('num-fires')?.value || '3';
    document.getElementById('steps-val').textContent = document.getElementById('time-steps')?.value || '50';
}

async function runSimulation() {
    // Get parameters
    const params = {
        wind_speed: parseFloat(document.getElementById('wind-speed')?.value || 8),
        wind_direction: parseFloat(document.getElementById('wind-dir')?.value || 45),
        temperature: parseFloat(document.getElementById('temperature')?.value || 38),
        humidity: parseFloat(document.getElementById('humidity')?.value || 25),
        spread_prob: parseFloat(document.getElementById('spread-prob')?.value || 35) / 100,
        num_fires: parseInt(document.getElementById('num-fires')?.value || 3),
        time_steps: parseInt(document.getElementById('time-steps')?.value || 50)
    };

    // Update UI
    document.getElementById('btn-run').disabled = true;
    document.getElementById('btn-pause').disabled = false;
    updateStatus('running', 'Running...');

    try {
        const response = await API.post('/api/simulation', params);

        if (response.success) {
            simulationData = response.simulation;
            currentStep = 0;

            document.getElementById('total-steps').textContent = simulationData.history.length;

            // Start playback
            isPlaying = true;
            startPlayback();
        } else {
            console.error('Simulation failed:', response.error);
            updateStatus('error', 'Error');
        }
    } catch (error) {
        console.error('Simulation error:', error);
        updateStatus('error', 'Error');
    }

    document.getElementById('btn-run').disabled = false;
}

function startPlayback() {
    if (!simulationData) return;

    const interval = 200 / playbackSpeed;

    playbackInterval = setInterval(() => {
        if (currentStep >= simulationData.history.length) {
            pauseSimulation();
            updateStatus('completed', 'Complete');
            return;
        }

        // Update 3D visualization
        updateCellStates(simulationData.history[currentStep]);

        // Update stats
        const stats = simulationData.stats_history[currentStep];
        updateLiveStats(stats);

        // Update progress
        document.getElementById('current-step').textContent = currentStep;
        const progress = (currentStep / simulationData.history.length) * 100;
        document.getElementById('sim-progress').style.width = progress + '%';

        // Update chart
        updateChart(simulationData.stats_history.slice(0, currentStep + 1));

        currentStep++;
    }, interval);
}

function pauseSimulation() {
    isPlaying = false;
    clearInterval(playbackInterval);
    document.getElementById('btn-pause').disabled = true;
    document.getElementById('btn-run').disabled = false;
    updateStatus('paused', 'Paused');
}

function resetSimulation() {
    pauseSimulation();
    currentStep = 0;
    simulationData = null;

    // Reset 3D grid
    createCellGrid();

    // Reset UI
    document.getElementById('current-step').textContent = '0';
    document.getElementById('total-steps').textContent = '0';
    document.getElementById('sim-progress').style.width = '0%';

    // Reset stats
    updateLiveStats({ unburned_pct: 100, burning_pct: 0, burned_pct: 0 });

    // Reset chart
    if (spreadChart) {
        spreadChart.data.labels = [];
        spreadChart.data.datasets[0].data = [];
        spreadChart.data.datasets[1].data = [];
        spreadChart.update();
    }

    updateStatus('ready', 'Ready');
}

function updateLiveStats(stats) {
    document.getElementById('stat-unburned').textContent = stats.unburned_pct.toFixed(1) + '%';
    document.getElementById('stat-burning').textContent = stats.burning_pct.toFixed(1) + '%';
    document.getElementById('stat-burned').textContent = stats.burned_pct.toFixed(1) + '%';

    // Update summary stats
    if (simulationData && currentStep > 0) {
        const maxBurning = Math.max(...simulationData.stats_history.slice(0, currentStep).map(s => s.burning_pct));
        document.getElementById('peak-burning').textContent = maxBurning.toFixed(1) + '%';
        document.getElementById('total-burned').textContent = stats.burned_pct.toFixed(1) + '%';

        const spreadRate = currentStep > 1 ? (stats.burned_pct / currentStep).toFixed(2) : '--';
        document.getElementById('spread-rate').textContent = spreadRate + '%/step';
    }
}

function updateStatus(status, text) {
    const indicator = document.getElementById('sim-status');
    const statusText = document.getElementById('sim-status-text');

    indicator.className = 'status-indicator';

    switch (status) {
        case 'running':
            indicator.classList.add('online');
            indicator.style.background = '#FF4500';
            indicator.style.animation = 'pulse 0.5s infinite';
            break;
        case 'completed':
            indicator.style.background = '#22c55e';
            indicator.style.animation = 'none';
            break;
        case 'paused':
            indicator.style.background = '#eab308';
            indicator.style.animation = 'none';
            break;
        case 'error':
            indicator.style.background = '#ef4444';
            indicator.style.animation = 'none';
            break;
        default:
            indicator.classList.add('online');
    }

    statusText.textContent = text;
}
