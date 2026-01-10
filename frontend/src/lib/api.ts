import type {
  PredictionResponse,
  HistoricalResponse,
  SimulationResponse,
  AnalyticsResponse,
  HeatmapResponse,
  WeatherResponse,
  TerrainResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  predict: async (date?: string): Promise<PredictionResponse> => {
    return fetchApi<PredictionResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify({ date: date || new Date().toISOString().split('T')[0] }),
    });
  },

  getHistorical: async (
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<HistoricalResponse>(`/api/historical${query}`);
  },

  runSimulation: async (params: {
    wind_speed?: number;
    wind_direction?: number;
    temperature?: number;
    humidity?: number;
    spread_prob?: number;
    burn_duration?: number;
    time_steps?: number;
    num_fires?: number;
    ignite_points?: Array<{ row: number; col: number }>;
  }): Promise<SimulationResponse> => {
    return fetchApi<SimulationResponse>('/api/simulation', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  getAnalytics: async (): Promise<AnalyticsResponse> => {
    return fetchApi<AnalyticsResponse>('/api/analytics');
  },

  getHeatmap: async (): Promise<HeatmapResponse> => {
    return fetchApi<HeatmapResponse>('/api/heatmap');
  },

  getWeather: async (): Promise<WeatherResponse> => {
    return fetchApi<WeatherResponse>('/api/weather');
  },

  getTerrain: async (): Promise<TerrainResponse> => {
    return fetchApi<TerrainResponse>('/api/terrain-data');
  },
};

export { ApiError };
