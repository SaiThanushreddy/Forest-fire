'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SimulationGridProps {
  grid: number[][] | null;
  size?: number;
  className?: string;
}

const CELL_COLORS = {
  0: '#166534', // Unburned - forest green
  1: '#ef4444', // Burning - red/orange
  2: '#1f2937', // Burned - dark gray
  3: '#3b82f6', // Water - blue
};

export function SimulationGrid({ grid, size = 400, className }: SimulationGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrid = useCallback(() => {
    if (!canvasRef.current || !grid) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = grid.length;
    const cellSize = size / gridSize;

    ctx.clearRect(0, 0, size, size);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const state = grid[y][x];
        ctx.fillStyle = CELL_COLORS[state as keyof typeof CELL_COLORS] || CELL_COLORS[0];

        // Add glow effect for burning cells
        if (state === 1) {
          const gradient = ctx.createRadialGradient(
            x * cellSize + cellSize / 2,
            y * cellSize + cellSize / 2,
            0,
            x * cellSize + cellSize / 2,
            y * cellSize + cellSize / 2,
            cellSize
          );
          gradient.addColorStop(0, '#fbbf24');
          gradient.addColorStop(0.5, '#ef4444');
          gradient.addColorStop(1, '#dc2626');
          ctx.fillStyle = gradient;
        }

        ctx.fillRect(x * cellSize, y * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }, [grid, size]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  if (!grid) {
    return (
      <div
        className={`bg-gray-800/50 rounded-lg flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500">No simulation data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-lg shadow-2xl shadow-orange-500/20"
      />
    </motion.div>
  );
}

export function SimulationLegend() {
  const items = [
    { label: 'Forest', color: CELL_COLORS[0] },
    { label: 'Burning', color: CELL_COLORS[1] },
    { label: 'Burned', color: CELL_COLORS[2] },
    { label: 'Water', color: CELL_COLORS[3] },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
