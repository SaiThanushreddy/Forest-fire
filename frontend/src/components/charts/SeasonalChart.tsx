'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { SeasonalRisk } from '@/types';

interface SeasonalChartProps {
  data: SeasonalRisk;
}

export function SeasonalChart({ data }: SeasonalChartProps) {
  const chartData = [
    { season: 'Winter', risk: data.Winter, fullMark: 100 },
    { season: 'Spring', risk: data.Spring, fullMark: 100 },
    { season: 'Summer', risk: data.Summer, fullMark: 100 },
    { season: 'Autumn', risk: data.Autumn, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="season"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 10 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Fire Risk']}
        />
        <Radar
          name="Fire Risk"
          dataKey="risk"
          stroke="#f97316"
          fill="#f97316"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
