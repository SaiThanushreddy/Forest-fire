'use client';

import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWeather } from '@/hooks/useFireData';
import { formatNumber } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: weatherData } = useWeather();

  return (
    <header className="h-16 border-b border-white/10 bg-gray-900/50 backdrop-blur-xl px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Weather Quick Info */}
        {weatherData?.success && (
          <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-lg bg-gray-800/50 border border-white/5">
            <div className="text-center">
              <p className="text-xs text-gray-500">Temp</p>
              <p className="text-sm font-medium text-white">
                {formatNumber(weatherData.weather.temperature)}°C
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="text-sm font-medium text-white">
                {formatNumber(weatherData.weather.humidity)}%
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xs text-gray-500">FWI</p>
              <p className="text-sm font-medium text-orange-400">
                {formatNumber(weatherData.weather.fire_weather_index)}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Search className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User */}
        <Button variant="ghost" size="icon">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
