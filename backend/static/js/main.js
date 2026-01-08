/**
 * Main JavaScript - FireSight AI
 * Almora Forest Fire Prediction System
 */

// Global state
const AppState = {
    isLoading: false,
    currentPage: window.location.pathname,
    theme: 'dark'
};

// Utility functions
const Utils = {
    // Format numbers with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Animate number counting
    animateNumber(element, target, duration = 1000) {
        const start = 0;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (target - start) * this.easeOutQuart(progress));
            element.textContent = this.formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    },

    // Easing function
    easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Lerp for smooth animations
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    },

    // Map value from one range to another
    mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    // Get color for risk value (0-1)
    getRiskColor(value) {
        const colors = [
            { pos: 0, color: [34, 197, 94] },    // Green
            { pos: 0.33, color: [234, 179, 8] }, // Yellow
            { pos: 0.66, color: [249, 115, 22] }, // Orange
            { pos: 1, color: [239, 68, 68] }     // Red
        ];

        for (let i = 0; i < colors.length - 1; i++) {
            if (value >= colors[i].pos && value <= colors[i + 1].pos) {
                const t = (value - colors[i].pos) / (colors[i + 1].pos - colors[i].pos);
                const r = Math.round(this.lerp(colors[i].color[0], colors[i + 1].color[0], t));
                const g = Math.round(this.lerp(colors[i].color[1], colors[i + 1].color[1], t));
                const b = Math.round(this.lerp(colors[i].color[2], colors[i + 1].color[2], t));
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
        return 'rgb(239, 68, 68)';
    },

    // Create fire particle
    createFireParticle(container) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: radial-gradient(circle, #ff6b35, #ff4500, transparent);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            bottom: -20px;
            opacity: ${Math.random() * 0.5 + 0.5};
            pointer-events: none;
        `;

        container.appendChild(particle);

        const duration = Math.random() * 3000 + 2000;
        const startX = parseFloat(particle.style.left);
        const drift = (Math.random() - 0.5) * 50;

        const animation = particle.animate([
            { transform: 'translateY(0) scale(1)', opacity: 0.8 },
            { transform: `translateY(-${window.innerHeight}px) translateX(${drift}px) scale(0)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        });

        animation.onfinish = () => particle.remove();
    }
};

// API helper
const API = {
    async get(endpoint) {
        try {
            const response = await fetch(endpoint);
            return await response.json();
        } catch (error) {
            console.error(`API GET error for ${endpoint}:`, error);
            return { success: false, error: error.message };
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error(`API POST error for ${endpoint}:`, error);
            return { success: false, error: error.message };
        }
    }
};

// Three.js helper for 3D visualizations
const ThreeHelper = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    animationId: null,

    init(container, options = {}) {
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(options.backgroundColor || 0x0a0a0f);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            options.fov || 60,
            width / height,
            0.1,
            1000
        );
        this.camera.position.set(
            options.cameraPosition?.x || 0,
            options.cameraPosition?.y || 50,
            options.cameraPosition?.z || 100
        );

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);

        // Handle resize
        window.addEventListener('resize', Utils.debounce(() => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
        }, 100));

        return this;
    },

    animate(callback) {
        const loop = () => {
            this.animationId = requestAnimationFrame(loop);
            if (callback) callback();
            this.renderer.render(this.scene, this.camera);
        };
        loop();
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    },

    dispose() {
        this.stop();
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        this.renderer.dispose();
    }
};

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initialize fire particles on homepage
function initFireParticles() {
    const container = document.getElementById('fire-particles');
    if (!container) return;

    setInterval(() => {
        if (Math.random() > 0.7) {
            Utils.createFireParticle(container);
        }
    }, 100);
}

// Page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        ThreeHelper.stop();
    } else {
        // Resume when visible
        // Animation will be resumed by individual page scripts
    }
});

// Export for use in other scripts
window.Utils = Utils;
window.API = API;
window.ThreeHelper = ThreeHelper;
window.AppState = AppState;

// Initialize common features
document.addEventListener('DOMContentLoaded', () => {
    initFireParticles();
});
