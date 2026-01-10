'use client';

import { useState, useEffect } from 'react';
import { Zap, Info } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SimulationGrid, SimulationLegend } from '@/components/simulation/SimulationGrid';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { useSimulation } from '@/hooks/useFireData';
import { formatNumber } from '@/lib/utils';
import type { SimulationData } from '@/types';

interface SimulationParams {
  wind_speed: number;
  wind_direction: number;
  temperature: number;
  humidity: number;
  spread_prob: number;
  time_steps: number;
  num_fires: number;
}

export default function SimulationPage() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const simulation = useSimulation();

  const handleRunSimulation = async (params: SimulationParams) => {
    setIsPlaying(false);
    setCurrentStep(0);

    const result = await simulation.mutateAsync(params);
    if (result.success) {
      setSimulationData(result.simulation);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !simulationData) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= simulationData.history.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, simulationData]);

  const currentGrid = simulationData?.history[currentStep] || null;
  const currentStats = simulationData?.stats_history[currentStep] || null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        title="Fire Spread Simulation"
        subtitle="Cellular automata model for fire propagation"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <SimulationControls
              onRunSimulation={handleRunSimulation}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              isPlaying={isPlaying}
              isLoading={simulation.isPending}
              currentStep={currentStep}
              totalSteps={simulationData?.history.length || 0}
              onStepChange={setCurrentStep}
            />
          </div>

          {/* Simulation View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Simulation Grid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6">
                  <SimulationGrid
                    grid={currentGrid}
                    size={500}
                  />
                  <SimulationLegend />
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {currentStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Unburned</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatNumber(currentStats.unburned_pct)}%
                    </p>
                    <p className="text-xs text-gray-600">{currentStats.unburned} cells</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Burning</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {formatNumber(currentStats.burning_pct)}%
                    </p>
                    <p className="text-xs text-gray-600">{currentStats.burning} cells</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Burned</p>
                    <p className="text-2xl font-bold text-gray-400">
                      {formatNumber(currentStats.burned_pct)}%
                    </p>
                    <p className="text-xs text-gray-600">{currentStats.burned} cells</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total Affected</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatNumber(currentStats.affected_pct)}%
                    </p>
                    <p className="text-xs text-gray-600">{currentStats.total_affected} cells</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Info */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p className="font-medium text-white mb-1">About the Simulation</p>
                  <p>
                    This cellular automata model simulates fire spread based on environmental
                    factors including wind speed, direction, temperature, humidity, and vegetation
                    density. Each cell can be in one of four states: unburned (forest), burning,
                    burned, or water (non-flammable). Fire spreads to adjacent cells based on
                    probability calculations influenced by the configured parameters.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
