'use client';

import { motion } from 'framer-motion';
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import { useWeather } from '@/hooks/useFireData';
import { formatNumber, getWindDirectionLabel } from '@/lib/utils';
import { Spinner } from './Spinner';

export function WeatherWidget() {
  const { data, isLoading, error } = useWeather();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-gray-900/50 p-6 flex items-center justify-center min-h-[200px]">
        <Spinner />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="rounded-xl border border-white/10 bg-gray-900/50 p-6 text-center text-gray-500">
        Unable to load weather data
      </div>
    );
  }

  const { weather, location } = data;

  const getFWIColor = (fwi: number) => {
    if (fwi < 30) return 'text-green-400';
    if (fwi < 50) return 'text-yellow-400';
    if (fwi < 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFWILevel = (fwi: number) => {
    if (fwi < 30) return 'Low';
    if (fwi < 50) return 'Moderate';
    if (fwi < 70) return 'High';
    return 'Extreme';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">{location.name}</h3>
            <p className="text-xs text-gray-400">
              {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {formatNumber(weather.temperature, 0)}°C
            </p>
          </div>
        </div>
      </div>

      {/* Weather Stats */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Droplets className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Humidity</p>
            <p className="text-sm font-medium text-white">
              {formatNumber(weather.humidity, 0)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Wind className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Wind</p>
            <p className="text-sm font-medium text-white">
              {formatNumber(weather.wind_speed, 0)} m/s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <Navigation
              className="w-5 h-5 text-indigo-400"
              style={{
                transform: `rotate(${weather.wind_direction}deg)`,
              }}
            />
          </div>
          <div>
            <p className="text-xs text-gray-500">Direction</p>
            <p className="text-sm font-medium text-white">
              {getWindDirectionLabel(weather.wind_direction)} ({formatNumber(weather.wind_direction, 0)}°)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/20">
            <CloudRain className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Precipitation</p>
            <p className="text-sm font-medium text-white">
              {formatNumber(weather.precipitation, 1)} mm
            </p>
          </div>
        </div>
      </div>

      {/* Fire Weather Index */}
      <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${getFWIColor(weather.fire_weather_index)}`} />
            <div>
              <p className="text-xs text-gray-400">Fire Weather Index</p>
              <p className={`text-lg font-bold ${getFWIColor(weather.fire_weather_index)}`}>
                {formatNumber(weather.fire_weather_index, 0)} - {getFWILevel(weather.fire_weather_index)}
              </p>
            </div>
          </div>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                weather.fire_weather_index < 30
                  ? 'bg-green-500'
                  : weather.fire_weather_index < 50
                  ? 'bg-yellow-500'
                  : weather.fire_weather_index < 70
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(weather.fire_weather_index, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
