'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MONTHS } from '@/lib/utils';

interface MonthlyChartProps {
  data: number[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.map((value, index) => ({
    month: MONTHS[index],
    fires: value,
  }));

  const maxValue = Math.max(...data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#f97316' }}
        />
        <Bar dataKey="fires" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.fires === maxValue
                  ? '#ef4444'
                  : entry.fires > maxValue * 0.7
                  ? '#f97316'
                  : entry.fires > maxValue * 0.4
                  ? '#eab308'
                  : '#22c55e'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
