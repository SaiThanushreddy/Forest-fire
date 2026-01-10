'use client';

import { motion } from 'framer-motion';
import { cn, formatNumber } from '@/lib/utils';
import type { PredictionStatistics } from '@/types';

interface RiskIndicatorProps {
  stats: PredictionStatistics | null;
  className?: string;
}

export function RiskIndicator({ stats, className }: RiskIndicatorProps) {
  if (!stats) return null;

  const getRiskGradient = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'from-green-500 to-emerald-600';
      case 'MODERATE':
        return 'from-yellow-500 to-amber-600';
      case 'HIGH':
        return 'from-orange-500 to-red-500';
      case 'EXTREME':
        return 'from-red-500 to-rose-700';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('space-y-4', className)}
    >
      {/* Main Risk Gauge */}
      <div className="relative">
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#riskGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${stats.risk_percentage * 2.83} 283`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="33%" stopColor="#eab308" />
                  <stop offset="66%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {formatNumber(stats.risk_percentage, 0)}%
              </span>
              <span
                className={cn(
                  'text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent',
                  getRiskGradient(stats.risk_level)
                )}
              >
                {stats.risk_level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-white/5">
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-lg font-semibold text-white">
            {formatNumber(stats.average_risk * 100, 1)}%
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-white/5">
          <p className="text-xs text-gray-500">Max Risk</p>
          <p className="text-lg font-semibold text-orange-400">
            {formatNumber(stats.max_risk * 100, 1)}%
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-white/5">
          <p className="text-xs text-gray-500">Hot Spots</p>
          <p className="text-lg font-semibold text-red-400">
            {stats.high_risk_cells}
          </p>
        </div>
      </div>

      {/* Risk Level Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Extreme</span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 relative">
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${stats.risk_percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute -top-1 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-900"
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
