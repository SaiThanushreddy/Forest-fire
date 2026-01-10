'use client';

import { BarChart3, Flame, TrendingUp, Calendar, Target, Database } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/charts/StatsCard';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { SeasonalChart } from '@/components/charts/SeasonalChart';
import { useAnalytics } from '@/hooks/useFireData';
import { formatNumber, formatDate } from '@/lib/utils';

export default function AnalyticsPage() {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics?.success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const yearlyData = Object.entries(analytics.yearly_trend).map(([year, count]) => ({
    year,
    fires: count,
  }));

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        title="Analytics Dashboard"
        subtitle="Historical fire data analysis and insights"
      />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Records"
            value={analytics.total_records.toLocaleString()}
            subtitle={`${formatDate(analytics.date_range.start)} - ${formatDate(analytics.date_range.end)}`}
            icon={Database}
            variant="default"
          />
          <StatsCard
            title="Fire Incidents"
            value={analytics.total_fires.toLocaleString()}
            subtitle="Total detected fires"
            icon={Flame}
            variant="danger"
          />
          <StatsCard
            title="Fire Rate"
            value={`${formatNumber(analytics.fire_rate)}%`}
            subtitle="Overall fire probability"
            icon={TrendingUp}
            variant="warning"
          />
          <StatsCard
            title="Model Accuracy"
            value={`${formatNumber(analytics.training_stats.model_accuracy)}%`}
            subtitle={`${analytics.training_stats.epochs_trained} epochs`}
            icon={Target}
            variant="success"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Monthly Fire Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart data={analytics.monthly_distribution} />
            </CardContent>
          </Card>

          {/* Seasonal Risk */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                Seasonal Risk Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SeasonalChart data={analytics.seasonal_risk} />
            </CardContent>
          </Card>
        </div>

        {/* Yearly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Yearly Fire Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {yearlyData.map(({ year, fires }) => (
                <div
                  key={year}
                  className="bg-gray-800/50 rounded-lg p-4 text-center border border-white/5"
                >
                  <p className="text-sm text-gray-400">{year}</p>
                  <p className="text-2xl font-bold text-orange-400">{fires}</p>
                  <p className="text-xs text-gray-500">fires</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Model Accuracy</span>
                  <span className="font-semibold text-green-400">
                    {formatNumber(analytics.training_stats.model_accuracy)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Training Samples</span>
                  <span className="font-semibold text-white">
                    {analytics.training_stats.total_samples.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Fire Incidents (Training)</span>
                  <span className="font-semibold text-orange-400">
                    {analytics.training_stats.fire_incidents.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Epochs Trained</span>
                  <span className="font-semibold text-blue-400">
                    {analytics.training_stats.epochs_trained}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seasonal Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.seasonal_risk)
                  .sort(([, a], [, b]) => b - a)
                  .map(([season, risk]) => (
                    <div key={season} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">{season}</span>
                        <span
                          className={`font-semibold ${
                            risk > 20 ? 'text-red-400' : risk > 10 ? 'text-orange-400' : 'text-green-400'
                          }`}
                        >
                          {formatNumber(risk)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            risk > 20 ? 'bg-red-500' : risk > 10 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(risk * 3, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
