#!/usr/bin/env python3
"""
Cellular Automata Fire Spread Simulator
Almora Forest Fire Prediction System
"""

import numpy as np
import json
import os
from dataclasses import dataclass
from typing import Tuple, List, Optional
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.colors import ListedColormap
import imageio

# Cell states
UNBURNED = 0
BURNING = 1
BURNED = 2
WATER = 3  # Cannot burn

@dataclass
class SimulationParams:
    """Parameters for fire spread simulation"""
    grid_size: int = 64
    wind_speed: float = 5.0  # m/s
    wind_direction: float = 45.0  # degrees (0=N, 90=E, 180=S, 270=W)
    temperature: float = 35.0  # Celsius
    humidity: float = 30.0  # percentage
    base_spread_prob: float = 0.3
    burn_duration: int = 3  # time steps to burn
    time_steps: int = 50

class CellularAutomataFire:
    """Cellular Automata-based forest fire spread simulator"""

    def __init__(self, params: SimulationParams, ndvi: Optional[np.ndarray] = None,
                 lst: Optional[np.ndarray] = None):
        self.params = params
        self.grid_size = params.grid_size

        # Initialize grid
        self.grid = np.zeros((self.grid_size, self.grid_size), dtype=np.int32)
        self.burn_time = np.zeros((self.grid_size, self.grid_size), dtype=np.int32)

        # Vegetation density from NDVI (affects spread probability)
        if ndvi is not None:
            self.vegetation = np.clip(ndvi, 0, 1)
        else:
            self.vegetation = np.random.uniform(0.3, 0.9, (self.grid_size, self.grid_size))

        # Temperature from LST (affects spread probability)
        if lst is not None:
            self.temperature_map = lst
        else:
            self.temperature_map = np.random.uniform(25, 45, (self.grid_size, self.grid_size))

        # Normalize temperature to [0, 1] for probability calculation
        temp_min, temp_max = self.temperature_map.min(), self.temperature_map.max()
        self.temp_norm = (self.temperature_map - temp_min) / (temp_max - temp_min + 1e-8)

        # Calculate wind effect matrix
        self.wind_effect = self._calculate_wind_effect()

        # History for animation
        self.history = []
        self.stats_history = []

    def _calculate_wind_effect(self) -> np.ndarray:
        """Calculate wind influence on fire spread for 8 neighbors"""
        # Convert wind direction to radians (meteorological convention)
        wind_rad = np.radians(self.params.wind_direction)

        # Direction vectors for 8 neighbors (row, col offsets)
        # N, NE, E, SE, S, SW, W, NW
        directions = [
            (-1, 0, 0),     # N
            (-1, 1, 45),    # NE
            (0, 1, 90),     # E
            (1, 1, 135),    # SE
            (1, 0, 180),    # S
            (1, -1, 225),   # SW
            (0, -1, 270),   # W
            (-1, -1, 315),  # NW
        ]

        wind_effect = np.zeros(8)
        wind_strength = self.params.wind_speed / 20.0  # Normalize to [0, 1]

        for i, (_, _, angle) in enumerate(directions):
            # Calculate alignment with wind direction
            angle_diff = abs(self.params.wind_direction - angle)
            if angle_diff > 180:
                angle_diff = 360 - angle_diff

            # Downwind cells have higher probability
            alignment = np.cos(np.radians(angle_diff))
            wind_effect[i] = 1.0 + alignment * wind_strength

        return wind_effect

    def ignite(self, row: int, col: int):
        """Start a fire at specified location"""
        if 0 <= row < self.grid_size and 0 <= col < self.grid_size:
            self.grid[row, col] = BURNING
            self.burn_time[row, col] = self.params.burn_duration

    def ignite_random(self, num_points: int = 1):
        """Start fires at random locations"""
        for _ in range(num_points):
            row = np.random.randint(self.grid_size // 4, 3 * self.grid_size // 4)
            col = np.random.randint(self.grid_size // 4, 3 * self.grid_size // 4)
            self.ignite(row, col)

    def ignite_from_prediction(self, fire_risk_map: np.ndarray, threshold: float = 0.7):
        """Ignite based on prediction map (high risk areas)"""
        hot_spots = np.where(fire_risk_map > threshold)
        if len(hot_spots[0]) > 0:
            # Select a few random high-risk points
            idx = np.random.choice(len(hot_spots[0]), min(3, len(hot_spots[0])), replace=False)
            for i in idx:
                self.ignite(hot_spots[0][i], hot_spots[1][i])

    def _get_spread_probability(self, row: int, col: int, neighbor_idx: int) -> float:
        """Calculate probability of fire spreading to a cell"""
        # Base probability
        prob = self.params.base_spread_prob

        # Vegetation effect (more vegetation = higher spread)
        vegetation_factor = self.vegetation[row, col]
        prob *= (0.5 + vegetation_factor)

        # Temperature effect (higher temp = higher spread)
        temp_factor = self.temp_norm[row, col]
        prob *= (0.7 + 0.6 * temp_factor)

        # Humidity effect (lower humidity = higher spread)
        humidity_factor = 1.0 - (self.params.humidity / 100.0)
        prob *= (0.5 + humidity_factor)

        # Wind effect
        prob *= self.wind_effect[neighbor_idx]

        return min(prob, 0.95)  # Cap at 95%

    def step(self):
        """Advance simulation by one time step"""
        new_grid = self.grid.copy()
        new_burn_time = self.burn_time.copy()

        # Neighbor offsets (8-connected)
        neighbors = [
            (-1, 0), (-1, 1), (0, 1), (1, 1),
            (1, 0), (1, -1), (0, -1), (-1, -1)
        ]

        # Process each cell
        for row in range(self.grid_size):
            for col in range(self.grid_size):
                if self.grid[row, col] == BURNING:
                    # Decrement burn time
                    new_burn_time[row, col] -= 1
                    if new_burn_time[row, col] <= 0:
                        new_grid[row, col] = BURNED

                    # Try to spread to neighbors
                    for n_idx, (dr, dc) in enumerate(neighbors):
                        nr, nc = row + dr, col + dc
                        if 0 <= nr < self.grid_size and 0 <= nc < self.grid_size:
                            if self.grid[nr, nc] == UNBURNED:
                                spread_prob = self._get_spread_probability(nr, nc, n_idx)
                                if np.random.random() < spread_prob:
                                    new_grid[nr, nc] = BURNING
                                    new_burn_time[nr, nc] = self.params.burn_duration

        self.grid = new_grid
        self.burn_time = new_burn_time

        # Record state
        self.history.append(self.grid.copy())
        self.stats_history.append(self.get_stats())

    def get_stats(self) -> dict:
        """Get current simulation statistics"""
        total_cells = self.grid_size * self.grid_size
        unburned = np.sum(self.grid == UNBURNED)
        burning = np.sum(self.grid == BURNING)
        burned = np.sum(self.grid == BURNED)

        return {
            'unburned': int(unburned),
            'burning': int(burning),
            'burned': int(burned),
            'unburned_pct': float(unburned / total_cells * 100),
            'burning_pct': float(burning / total_cells * 100),
            'burned_pct': float(burned / total_cells * 100),
            'total_affected': int(burning + burned),
            'affected_pct': float((burning + burned) / total_cells * 100)
        }

    def run(self, time_steps: Optional[int] = None) -> List[dict]:
        """Run the simulation for specified time steps"""
        steps = time_steps or self.params.time_steps

        # Record initial state
        self.history = [self.grid.copy()]
        self.stats_history = [self.get_stats()]

        for t in range(steps):
            self.step()

            # Stop if no more burning cells
            if np.sum(self.grid == BURNING) == 0:
                break

        return self.stats_history

    def create_animation(self, filename: str = 'static/images/fire_simulation.gif',
                        fps: int = 5) -> str:
        """Create animated GIF of the simulation"""
        print("Creating fire spread animation...")

        # Custom colormap
        colors = ['#228B22', '#FF4500', '#1a1a1a', '#4169E1']  # Forest, Fire, Burned, Water
        cmap = ListedColormap(colors)

        frames = []

        for t, grid in enumerate(self.history):
            fig, ax = plt.subplots(figsize=(8, 8))

            im = ax.imshow(grid, cmap=cmap, vmin=0, vmax=3)
            ax.set_title(f'Fire Spread Simulation - Step {t}', fontsize=14, fontweight='bold')
            ax.set_xlabel('Column', fontsize=11)
            ax.set_ylabel('Row', fontsize=11)

            # Add stats text
            stats = self.stats_history[min(t, len(self.stats_history)-1)]
            stats_text = f"Burning: {stats['burning_pct']:.1f}% | Burned: {stats['burned_pct']:.1f}%"
            ax.text(0.5, -0.1, stats_text, transform=ax.transAxes,
                   ha='center', fontsize=11, color='#ff6b6b')

            # Wind arrow
            wind_rad = np.radians(self.params.wind_direction)
            ax.annotate('', xy=(0.9 + 0.08 * np.sin(wind_rad), 0.9 - 0.08 * np.cos(wind_rad)),
                       xytext=(0.9, 0.9), xycoords='axes fraction',
                       arrowprops=dict(arrowstyle='->', color='white', lw=2))
            ax.text(0.9, 0.95, 'Wind', transform=ax.transAxes, ha='center',
                   fontsize=9, color='white')

            plt.tight_layout()

            # Convert to image
            fig.canvas.draw()
            image = np.frombuffer(fig.canvas.buffer_rgba(), dtype=np.uint8)
            image = image.reshape(fig.canvas.get_width_height()[::-1] + (4,))
            frames.append(image[:, :, :3])  # Remove alpha channel

            plt.close(fig)

        # Save as GIF
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        imageio.mimsave(filename, frames, fps=fps, loop=0)
        print(f"  Saved: {filename}")

        return filename

    def get_simulation_data(self) -> dict:
        """Get complete simulation data for frontend"""
        return {
            'params': {
                'grid_size': self.params.grid_size,
                'wind_speed': self.params.wind_speed,
                'wind_direction': self.params.wind_direction,
                'temperature': self.params.temperature,
                'humidity': self.params.humidity,
                'time_steps': len(self.history)
            },
            'history': [grid.tolist() for grid in self.history],
            'stats_history': self.stats_history,
            'vegetation': self.vegetation.tolist(),
            'final_stats': self.stats_history[-1] if self.stats_history else None
        }


def run_demo_simulation():
    """Run a demo simulation"""
    print("="*60)
    print("CELLULAR AUTOMATA FIRE SPREAD SIMULATION")
    print("="*60)

    # Create simulation with custom parameters
    params = SimulationParams(
        grid_size=64,
        wind_speed=8.0,
        wind_direction=45.0,  # NE wind
        temperature=38.0,
        humidity=25.0,
        base_spread_prob=0.35,
        burn_duration=3,
        time_steps=50
    )

    # Load NDVI and LST if available
    try:
        ndvi = np.load('satellite_images/ndvi_2023-05-15.npy')
        lst = np.load('satellite_images/lst_2023-05-15.npy')
        print("Loaded satellite data for simulation")
    except:
        ndvi = None
        lst = None
        print("Using synthetic vegetation/temperature data")

    # Create and run simulation
    sim = CellularAutomataFire(params, ndvi, lst)
    sim.ignite_random(3)  # Start with 3 random fire points

    print("\nRunning simulation...")
    stats = sim.run()

    print(f"\nSimulation completed in {len(stats)} steps")
    print(f"Final statistics:")
    final = stats[-1]
    print(f"  - Unburned: {final['unburned_pct']:.1f}%")
    print(f"  - Burned: {final['burned_pct']:.1f}%")
    print(f"  - Total affected: {final['affected_pct']:.1f}%")

    # Create animation
    sim.create_animation()

    # Save simulation data
    sim_data = sim.get_simulation_data()
    with open('static/simulation_data.json', 'w') as f:
        json.dump(sim_data, f)
    print("  Saved: static/simulation_data.json")

    return sim


if __name__ == "__main__":
    run_demo_simulation()
