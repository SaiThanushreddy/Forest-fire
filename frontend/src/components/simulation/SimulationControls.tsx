'use client';

import { useState } from 'react';
import { Play, Pause, RotateCcw, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getWindDirectionLabel } from '@/lib/utils';

interface SimulationControlsProps {
  onRunSimulation: (params: SimulationParams) => void;
  onPlayPause: () => void;
  onReset: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

interface SimulationParams {
  wind_speed: number;
  wind_direction: number;
  temperature: number;
  humidity: number;
  spread_prob: number;
  time_steps: number;
  num_fires: number;
}

export function SimulationControls({
  onRunSimulation,
  onPlayPause,
  onReset,
  isPlaying,
  isLoading,
  currentStep,
  totalSteps,
  onStepChange,
}: SimulationControlsProps) {
  const [params, setParams] = useState<SimulationParams>({
    wind_speed: 8,
    wind_direction: 45,
    temperature: 35,
    humidity: 30,
    spread_prob: 0.35,
    time_steps: 50,
    num_fires: 3,
  });

  const handleParamChange = (key: keyof SimulationParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Simulation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onRunSimulation(params)}
            disabled={isLoading}
            className="flex-1"
          >
            <Flame className="w-4 h-4" />
            {isLoading ? 'Running...' : 'Start Simulation'}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={onPlayPause}
            disabled={totalSteps === 0}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="secondary" size="icon" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Timeline */}
        {totalSteps > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Timeline</span>
              <span className="text-orange-400 font-mono">
                Step {currentStep + 1} / {totalSteps}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={currentStep}
              onChange={(e) => onStepChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        )}

        <div className="border-t border-white/10 pt-4" />

        {/* Parameters */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Environment</h4>

          <Slider
            label="Wind Speed"
            value={params.wind_speed}
            min={0}
            max={30}
            step={1}
            unit=" m/s"
            onChange={(v) => handleParamChange('wind_speed', v)}
          />

          <Slider
            label={`Wind Direction (${getWindDirectionLabel(params.wind_direction)})`}
            value={params.wind_direction}
            min={0}
            max={360}
            step={15}
            unit="°"
            onChange={(v) => handleParamChange('wind_direction', v)}
          />

          <Slider
            label="Temperature"
            value={params.temperature}
            min={20}
            max={50}
            step={1}
            unit="°C"
            onChange={(v) => handleParamChange('temperature', v)}
          />

          <Slider
            label="Humidity"
            value={params.humidity}
            min={10}
            max={90}
            step={5}
            unit="%"
            onChange={(v) => handleParamChange('humidity', v)}
          />
        </div>

        <div className="border-t border-white/10 pt-4" />

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Fire Parameters</h4>

          <Slider
            label="Spread Probability"
            value={params.spread_prob * 100}
            min={10}
            max={80}
            step={5}
            unit="%"
            onChange={(v) => handleParamChange('spread_prob', v / 100)}
          />

          <Slider
            label="Initial Fire Points"
            value={params.num_fires}
            min={1}
            max={10}
            step={1}
            onChange={(v) => handleParamChange('num_fires', v)}
          />

          <Slider
            label="Simulation Steps"
            value={params.time_steps}
            min={20}
            max={100}
            step={10}
            onChange={(v) => handleParamChange('time_steps', v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
