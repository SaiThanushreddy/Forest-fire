import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatNumber(num: number, decimals = 1): string {
  return num.toFixed(decimals);
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'LOW':
      return 'text-green-500';
    case 'MODERATE':
      return 'text-yellow-500';
    case 'HIGH':
      return 'text-orange-500';
    case 'EXTREME':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

export function getRiskBgColor(level: string): string {
  switch (level) {
    case 'LOW':
      return 'bg-green-500/20 border-green-500/50';
    case 'MODERATE':
      return 'bg-yellow-500/20 border-yellow-500/50';
    case 'HIGH':
      return 'bg-orange-500/20 border-orange-500/50';
    case 'EXTREME':
      return 'bg-red-500/20 border-red-500/50';
    default:
      return 'bg-gray-500/20 border-gray-500/50';
  }
}

export function getHeatmapColor(value: number): string {
  if (value < 0.25) return '#22c55e';
  if (value < 0.5) return '#eab308';
  if (value < 0.75) return '#f97316';
  return '#ef4444';
}

export function interpolateColor(value: number): string {
  const colors = [
    { pos: 0, r: 34, g: 197, b: 94 },
    { pos: 0.33, r: 234, g: 179, b: 8 },
    { pos: 0.66, r: 249, g: 115, b: 22 },
    { pos: 1, r: 239, g: 68, b: 68 },
  ];

  let lower = colors[0];
  let upper = colors[colors.length - 1];

  for (let i = 0; i < colors.length - 1; i++) {
    if (value >= colors[i].pos && value <= colors[i + 1].pos) {
      lower = colors[i];
      upper = colors[i + 1];
      break;
    }
  }

  const range = upper.pos - lower.pos;
  const factor = range === 0 ? 0 : (value - lower.pos) / range;

  const r = Math.round(lower.r + (upper.r - lower.r) * factor);
  const g = Math.round(lower.g + (upper.g - lower.g) * factor);
  const b = Math.round(lower.b + (upper.b - lower.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

export function getWindDirectionLabel(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const ALMORA_CENTER = {
  lat: 29.5971,
  lon: 79.6591,
};

export const ALMORA_BOUNDS = {
  north: 29.85,
  south: 29.35,
  east: 80.0,
  west: 79.35,
};
