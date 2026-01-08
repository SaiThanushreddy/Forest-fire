/**
 * 3D Globe Visualization
 * Landing page animated globe with fire hotspots
 */

function initGlobe(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 100, 300);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 30, 150);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff6b35, 2, 200);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 150);
    pointLight2.position.set(-50, -30, 50);
    scene.add(pointLight2);

    // Create globe
    const globeGroup = new THREE.Group();

    // Outer glow sphere
    const glowGeometry = new THREE.SphereGeometry(42, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            c: { value: 0.5 },
            p: { value: 4.0 },
            glowColor: { value: new THREE.Color(0xff6b35) }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float c;
            uniform float p;
            uniform vec3 glowColor;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                gl_FragColor = vec4(glowColor, intensity * 0.3);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowMesh);

    // Main globe
    const globeGeometry = new THREE.SphereGeometry(40, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        emissive: 0x0a0a15,
        specular: 0x333366,
        shininess: 20,
        wireframe: false,
        transparent: true,
        opacity: 0.9
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    // Wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(40.5, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b35,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);

    scene.add(globeGroup);

    // Create fire hotspots (representing Almora region)
    const hotspots = [];
    const hotspotsGroup = new THREE.Group();

    // Convert lat/lon to 3D position on sphere
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // Almora coordinates and surrounding areas
    const fireLocations = [
        { lat: 29.60, lon: 79.66, intensity: 1.0 },    // Almora center
        { lat: 29.65, lon: 79.70, intensity: 0.8 },
        { lat: 29.55, lon: 79.60, intensity: 0.7 },
        { lat: 29.70, lon: 79.65, intensity: 0.6 },
        { lat: 29.50, lon: 79.75, intensity: 0.9 },
        { lat: 29.62, lon: 79.55, intensity: 0.5 },
        { lat: 29.58, lon: 79.80, intensity: 0.7 },
    ];

    fireLocations.forEach((loc, i) => {
        const pos = latLonToVector3(loc.lat, loc.lon, 41);

        // Fire point
        const pointGeometry = new THREE.SphereGeometry(0.8 + loc.intensity * 0.5, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.05 + Math.random() * 0.05, 1, 0.5 + loc.intensity * 0.2),
            transparent: true,
            opacity: 0.8
        });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.copy(pos);
        point.userData = { baseScale: 1, phase: Math.random() * Math.PI * 2 };
        hotspotsGroup.add(point);
        hotspots.push(point);

        // Glow ring
        const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);
        ring.userData = { phase: Math.random() * Math.PI * 2 };
        hotspotsGroup.add(ring);
        hotspots.push(ring);
    });

    scene.add(hotspotsGroup);

    // Create particle system for fire effects
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const loc = fireLocations[Math.floor(Math.random() * fireLocations.length)];
        const pos = latLonToVector3(loc.lat + (Math.random() - 0.5) * 2, loc.lon + (Math.random() - 0.5) * 2, 42 + Math.random() * 10);

        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;

        const color = new THREE.Color().setHSL(0.05 + Math.random() * 0.08, 1, 0.5 + Math.random() * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Orbit rings
    for (let i = 0; i < 3; i++) {
        const orbitGeometry = new THREE.TorusGeometry(55 + i * 15, 0.1, 16, 100);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: i === 0 ? 0xff6b35 : (i === 1 ? 0x4ecdc4 : 0xffe66d),
            transparent: true,
            opacity: 0.2
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        orbit.rotation.y = Math.random() * Math.PI;
        scene.add(orbit);
    }

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        targetRotationY = mouseX * 0.3;
        targetRotationX = mouseY * 0.2;
    });

    // Animation
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Rotate globe
        globeGroup.rotation.y += 0.002;
        globeGroup.rotation.x = Utils.lerp(globeGroup.rotation.x, targetRotationX, 0.05);
        globeGroup.rotation.y = Utils.lerp(globeGroup.rotation.y, globeGroup.rotation.y + targetRotationY * 0.01, 0.05);

        // Animate hotspots
        hotspots.forEach((hotspot, i) => {
            if (hotspot.geometry.type === 'SphereGeometry') {
                const scale = 1 + Math.sin(time * 3 + hotspot.userData.phase) * 0.3;
                hotspot.scale.setScalar(scale);
            } else {
                hotspot.scale.setScalar(1 + Math.sin(time * 2 + hotspot.userData.phase) * 0.2);
                hotspot.material.opacity = 0.2 + Math.sin(time * 3 + hotspot.userData.phase) * 0.15;
            }
        });

        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += Math.sin(time * 2 + i) * 0.05;
            const dist = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2);
            if (dist > 60) {
                const loc = fireLocations[Math.floor(Math.random() * fireLocations.length)];
                const pos = latLonToVector3(loc.lat + (Math.random() - 0.5) * 2, loc.lon + (Math.random() - 0.5) * 2, 42);
                positions[i * 3] = pos.x;
                positions[i * 3 + 1] = pos.y;
                positions[i * 3 + 2] = pos.z;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Pulse point light
        pointLight.intensity = 1.5 + Math.sin(time * 2) * 0.5;

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });

    return { scene, camera, renderer, globeGroup };
}

// Export
window.initGlobe = initGlobe;
