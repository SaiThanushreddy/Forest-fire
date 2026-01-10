import { create } from 'zustand';
import type { PredictionResponse, SimulationData, WeatherData } from '@/types';

interface AppState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  prediction: PredictionResponse | null;
  setPrediction: (prediction: PredictionResponse | null) => void;

  simulation: SimulationData | null;
  setSimulation: (simulation: SimulationData | null) => void;

  weather: WeatherData | null;
  setWeather: (weather: WeatherData | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  activeView: 'prediction' | 'historical' | 'simulation';
  setActiveView: (view: 'prediction' | 'historical' | 'simulation') => void;

  simulationStep: number;
  setSimulationStep: (step: number) => void;

  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  setSelectedDate: (date) => set({ selectedDate: date }),

  prediction: null,
  setPrediction: (prediction) => set({ prediction }),

  simulation: null,
  setSimulation: (simulation) => set({ simulation }),

  weather: null,
  setWeather: (weather) => set({ weather }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeView: 'prediction',
  setActiveView: (view) => set({ activeView: view }),

  simulationStep: 0,
  setSimulationStep: (step) => set({ simulationStep: step }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
