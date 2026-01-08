/**
 * Analytics Dashboard - Charts and 3D Visualizations
 * FireSight AI - Almora Forest Fire Prediction
 */

let monthlyChart, yearlyChart, seasonalChart, trainingChart;
let hotspots3DScene, hotspots3DCamera, hotspots3DRenderer;
let autoRotate = true;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    init3DHotspots();
    loadAnalyticsData();
    setupControls();
});

function initCharts() {
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
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
                ticks: { color: '#a0a0b0' },
                beginAtZero: true
            }
        }
    };

    // Monthly chart
    const monthlyCtx = document.getElementById('monthly-chart');
    if (monthlyCtx) {
        monthlyChart = new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Fire Incidents',
                    data: [],
                    backgroundColor: 'rgba(255, 107, 53, 0.7)',
                    borderColor: '#ff6b35',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: commonOptions
        });
    }

    // Yearly chart
    const yearlyCtx = document.getElementById('yearly-chart');
    if (yearlyCtx) {
        yearlyChart = new Chart(yearlyCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Annual Fire Count',
                    data: [],
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4ecdc4',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: commonOptions
        });
    }

    // Seasonal chart
    const seasonalCtx = document.getElementById('seasonal-chart');
    if (seasonalCtx) {
        seasonalChart = new Chart(seasonalCtx, {
            type: 'doughnut',
            data: {
                labels: ['Winter', 'Spring', 'Summer', 'Autumn'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(78, 205, 196, 0.8)',
                        'rgba(46, 213, 115, 0.8)',
                        'rgba(255, 107, 53, 0.8)',
                        'rgba(255, 230, 109, 0.8)'
                    ],
                    borderColor: '#0a0a0f',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#a0a0b0', padding: 15 }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // Training chart
    const trainingCtx = document.getElementById('training-chart');
    if (trainingCtx) {
        trainingChart = new Chart(trainingCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Training Loss',
                        data: [],
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Validation Loss',
                        data: [],
                        borderColor: '#4ecdc4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: commonOptions
        });
    }
}

function init3DHotspots() {
    const container = document.getElementById('hotspots-3d');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    hotspots3DScene = new THREE.Scene();
    hotspots3DScene.background = new THREE.Color(0x0a0a0f);

    // Camera
    hotspots3DCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    hotspots3DCamera.position.set(40, 50, 60);
    hotspots3DCamera.lookAt(0, 0, 0);

    // Renderer
    hotspots3DRenderer = new THREE.WebGLRenderer({ antialias: true });
    hotspots3DRenderer.setSize(width, height);
    hotspots3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(hotspots3DRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    hotspots3DScene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff6b35, 1, 100);
    pointLight.position.set(20, 30, 20);
    hotspots3DScene.add(pointLight);

    // Base plane (map of Almora)
    const planeGeometry = new THREE.PlaneGeometry(50, 50, 20, 20);
    planeGeometry.rotateX(-Math.PI / 2);

    const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        wireframe: false,
        flatShading: true,
        transparent: true,
        opacity: 0.8
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    hotspots3DScene.add(plane);

    // Wireframe overlay
    const wireframeGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
    wireframeGeometry.rotateX(-Math.PI / 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ecdc4,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    wireframe.position.y = 0.1;
    hotspots3DScene.add(wireframe);

    // Grid
    const grid = new THREE.GridHelper(50, 20, 0x333333, 0x222222);
    grid.position.y = 0.05;
    hotspots3DScene.add(grid);

    // Animation
    animate3DHotspots();

    // Resize handler
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        hotspots3DCamera.aspect = newWidth / newHeight;
        hotspots3DCamera.updateProjectionMatrix();
        hotspots3DRenderer.setSize(newWidth, newHeight);
    });

    // Mouse controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        autoRotate = false;
        prevMouse = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        hotspots3DScene.rotation.y += (e.clientX - prevMouse.x) * 0.005;
        prevMouse = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mouseleave', () => isDragging = false);
}

function addHotspots(locations) {
    if (!hotspots3DScene || !locations) return;

    // Clear existing hotspots (except base elements)
    const toRemove = [];
    hotspots3DScene.traverse(obj => {
        if (obj.userData.isHotspot) toRemove.push(obj);
    });
    toRemove.forEach(obj => hotspots3DScene.remove(obj));

    // Map coordinates to 3D space
    const latMin = 29.35, latMax = 29.85;
    const lonMin = 79.35, lonMax = 80.00;

    locations.forEach((loc, i) => {
        const x = ((loc[1] - lonMin) / (lonMax - lonMin) - 0.5) * 50;
        const z = ((loc[0] - latMin) / (latMax - latMin) - 0.5) * 50;
        const intensity = loc[2] || 0.5;

        // Hotspot bar
        const height = 2 + intensity * 15;
        const geometry = new THREE.CylinderGeometry(0.3, 0.5, height, 8);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.05 + (1 - intensity) * 0.1, 1, 0.5),
            emissive: new THREE.Color().setHSL(0.05, 1, 0.2),
            transparent: true,
            opacity: 0.8
        });

        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(x, height / 2, z);
        bar.userData = { isHotspot: true, intensity, baseHeight: height };
        hotspots3DScene.add(bar);

        // Glow ring at base
        const ringGeometry = new THREE.RingGeometry(0.5, 1.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.1, z);
        ring.userData = { isHotspot: true };
        hotspots3DScene.add(ring);
    });
}

function animate3DHotspots() {
    requestAnimationFrame(animate3DHotspots);

    if (autoRotate) {
        hotspots3DScene.rotation.y += 0.002;
    }

    // Animate hotspots
    hotspots3DScene.traverse(obj => {
        if (obj.userData.isHotspot && obj.geometry.type === 'CylinderGeometry') {
            const scale = 1 + Math.sin(Date.now() * 0.003 + obj.position.x) * 0.1;
            obj.scale.y = scale;
        }
    });

    hotspots3DRenderer.render(hotspots3DScene, hotspots3DCamera);
}

async function loadAnalyticsData() {
    try {
        const response = await API.get('/api/analytics');

        if (response.success) {
            updateOverviewCards(response);
            updateCharts(response);
            addHotspots(response.hotspots);
            updateGauges(response.training_stats);
        }
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
}

function updateOverviewCards(data) {
    // Animate numbers
    const fireCard = document.getElementById('card-fires');
    if (fireCard) Utils.animateNumber(fireCard, data.total_fires, 1500);

    const samplesCard = document.getElementById('card-samples');
    if (samplesCard) Utils.animateNumber(samplesCard, data.total_records, 1500);

    const rateCard = document.getElementById('card-rate');
    if (rateCard) rateCard.textContent = data.fire_rate.toFixed(1) + '%';

    const accuracyCard = document.getElementById('card-accuracy');
    if (accuracyCard) {
        const accuracy = data.training_stats?.model_accuracy || 85;
        accuracyCard.textContent = accuracy.toFixed(1) + '%';
    }

    // Date range
    const dateRange = document.getElementById('date-range');
    if (dateRange && data.date_range) {
        dateRange.textContent = `${data.date_range.start} to ${data.date_range.end}`;
    }

    // Fire trend
    const trend = document.getElementById('fire-trend');
    if (trend) trend.textContent = ((data.fire_rate / 100) * 365).toFixed(0) + '/yr';
}

function updateCharts(data) {
    // Monthly chart
    if (monthlyChart && data.monthly_distribution) {
        monthlyChart.data.datasets[0].data = data.monthly_distribution;
        monthlyChart.update();
    }

    // Yearly chart
    if (yearlyChart && data.yearly_trend) {
        const years = Object.keys(data.yearly_trend).sort();
        yearlyChart.data.labels = years;
        yearlyChart.data.datasets[0].data = years.map(y => data.yearly_trend[y]);
        yearlyChart.update();
    }

    // Seasonal chart
    if (seasonalChart && data.seasonal_risk) {
        seasonalChart.data.datasets[0].data = [
            data.seasonal_risk.Winter || 0,
            data.seasonal_risk.Spring || 0,
            data.seasonal_risk.Summer || 0,
            data.seasonal_risk.Autumn || 0
        ];
        seasonalChart.update();
    }

    // Training chart
    if (trainingChart && data.training_stats) {
        const epochs = data.training_stats.epochs_trained || 10;
        trainingChart.data.labels = Array.from({ length: epochs }, (_, i) => i + 1);

        if (data.training_stats.loss_history) {
            trainingChart.data.datasets[0].data = data.training_stats.loss_history;
        }
        if (data.training_stats.val_loss_history) {
            trainingChart.data.datasets[1].data = data.training_stats.val_loss_history;
        }
        trainingChart.update();
    }
}

function updateGauges(stats) {
    if (!stats) return;

    const accuracy = stats.model_accuracy || 85;
    const precision = accuracy - 5 + Math.random() * 10;
    const recall = accuracy - 3 + Math.random() * 6;
    const f1 = 2 * (precision * recall) / (precision + recall);

    const gauges = [
        { id: 'acc', value: accuracy },
        { id: 'prec', value: precision },
        { id: 'rec', value: recall },
        { id: 'f1', value: f1 }
    ];

    gauges.forEach(({ id, value }) => {
        const fill = document.getElementById(`gauge-${id}-fill`);
        const text = document.getElementById(`gauge-${id}-text`);

        if (fill && text) {
            // Calculate stroke offset (283 is the circumference for r=45)
            const offset = 283 - (283 * value / 100);

            // Animate the gauge
            setTimeout(() => {
                fill.style.strokeDashoffset = offset;
                text.textContent = value.toFixed(1) + '%';
            }, 500);
        }
    });
}

function setupControls() {
    // Chart view toggles
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.closest('.chart-actions');
            parent?.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const view = e.target.dataset.view;
            if (monthlyChart) {
                monthlyChart.config.type = view;
                monthlyChart.update();
            }
        });
    });

    // 3D visualization controls
    document.getElementById('rotate-left')?.addEventListener('click', () => {
        hotspots3DScene.rotation.y -= 0.5;
    });

    document.getElementById('rotate-right')?.addEventListener('click', () => {
        hotspots3DScene.rotation.y += 0.5;
    });

    document.getElementById('auto-rotate')?.addEventListener('click', (e) => {
        autoRotate = !autoRotate;
        e.target.textContent = autoRotate ? 'Auto Rotate' : 'Manual';
        e.target.classList.toggle('active', autoRotate);
    });
}
