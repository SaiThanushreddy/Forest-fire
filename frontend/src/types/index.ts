export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PredictionStatistics {
  average_risk: number;
  max_risk: number;
  high_risk_cells: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  risk_percentage: number;
}

export interface PredictionResponse {
  success: boolean;
  date: string;
  risk_map: number[][];
  statistics: PredictionStatistics;
  bounds: Bounds;
  center: Coordinates;
}

export interface HistoricalFireRecord {
  date: string;
  latitude: number;
  longitude: number;
  fire_occurred: number;
  brightness: number;
  confidence: number;
}

export interface HistoricalResponse {
  success: boolean;
  count: number;
  data: HistoricalFireRecord[];
}

export interface SimulationParams {
  grid_size: number;
  wind_speed: number;
  wind_direction: number;
  temperature: number;
  humidity: number;
  time_steps: number;
}

export interface SimulationStats {
  unburned: number;
  burning: number;
  burned: number;
  unburned_pct: number;
  burning_pct: number;
  burned_pct: number;
  total_affected: number;
  affected_pct: number;
}

export interface SimulationData {
  params: SimulationParams;
  history: number[][][];
  stats_history: SimulationStats[];
  vegetation: number[][];
  final_stats: SimulationStats | null;
}

export interface SimulationResponse {
  success: boolean;
  simulation: SimulationData;
}

export interface SeasonalRisk {
  Winter: number;
  Spring: number;
  Summer: number;
  Autumn: number;
}

export interface TrainingStats {
  model_accuracy: number;
  total_samples: number;
  fire_incidents: number;
  epochs_trained: number;
}

export interface AnalyticsResponse {
  success: boolean;
  total_records: number;
  total_fires: number;
  fire_rate: number;
  monthly_distribution: number[];
  yearly_trend: Record<string, number>;
  seasonal_risk: SeasonalRisk;
  hotspots: number[][];
  training_stats: TrainingStats;
  date_range: {
    start: string;
    end: string;
  };
}

export interface HeatmapResponse {
  success: boolean;
  data: number[][];
  center: Coordinates;
  bounds: Bounds;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  precipitation: number;
  fire_weather_index: number;
}

export interface WeatherResponse {
  success: boolean;
  weather: WeatherData;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  timestamp: string;
}

export interface TerrainResponse {
  success: boolean;
  terrain: number[][];
  size: number;
  min_elevation: number;
  max_elevation: number;
  bounds: Bounds;
}
