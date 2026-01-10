'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, MapPin, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RiskBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { RiskIndicator } from '@/components/ui/RiskIndicator';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { StatsCard } from '@/components/charts/StatsCard';
import { usePrediction, useAnalytics } from '@/hooks/useFireData';
import { formatNumber } from '@/lib/utils';
import dynamic from 'next/dynamic';

const FireMap = dynamic(() => import('@/components/map/DynamicFireMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-900/50 rounded-lg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  ),
});

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: prediction, isLoading: predictionLoading, refetch } = usePrediction(selectedDate);
  const { data: analytics } = useAnalytics();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handlePredict = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        title="Fire Prediction Dashboard"
        subtitle="Real-time fire risk monitoring for Almora region"
      />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Current Risk Level"
            value={prediction?.statistics?.risk_level || '--'}
            subtitle="Based on latest prediction"
            icon={AlertTriangle}
            variant={
              prediction?.statistics?.risk_level === 'EXTREME'
                ? 'danger'
                : prediction?.statistics?.risk_level === 'HIGH'
                ? 'warning'
                : prediction?.statistics?.risk_level === 'MODERATE'
                ? 'warning'
                : 'success'
            }
          />
          <StatsCard
            title="Total Fire Incidents"
            value={analytics?.total_fires || '--'}
            subtitle={`Out of ${analytics?.total_records || 0} records`}
            icon={Flame}
            variant="danger"
          />
          <StatsCard
            title="Fire Rate"
            value={analytics ? `${formatNumber(analytics.fire_rate)}%` : '--'}
            subtitle="Historical average"
            icon={TrendingUp}
            variant="warning"
          />
          <StatsCard
            title="Model Accuracy"
            value={analytics?.training_stats ? `${formatNumber(analytics.training_stats.model_accuracy)}%` : '--'}
            subtitle={`${analytics?.training_stats?.epochs_trained || 0} epochs trained`}
            icon={Activity}
            variant="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Fire Risk Map
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <Button onClick={handlePredict} disabled={predictionLoading}>
                    {predictionLoading ? (
                      <>
                        <Spinner size="sm" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        Predict
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] rounded-b-xl overflow-hidden">
                  <FireMap
                    prediction={prediction}
                    showHeatmap={true}
                    showMarkers={false}
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Risk Indicator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Risk Analysis
                  </span>
                  {prediction?.statistics && (
                    <RiskBadge level={prediction.statistics.risk_level} />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictionLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <RiskIndicator stats={prediction?.statistics || null} />
                )}
              </CardContent>
            </Card>

            {/* Weather Widget */}
            <WeatherWidget />
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card hover className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <div className="w-4 h-4 rounded-full bg-green-500" />
              </div>
              <div>
                <h4 className="font-medium text-white">Low Risk</h4>
                <p className="text-sm text-gray-400">
                  Safe conditions. Continue monitoring.
                </p>
              </div>
            </div>
          </Card>
          <Card hover className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
              </div>
              <div>
                <h4 className="font-medium text-white">Moderate Risk</h4>
                <p className="text-sm text-gray-400">
                  Elevated conditions. Stay alert.
                </p>
              </div>
            </div>
          </Card>
          <Card hover className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-500/20">
                <div className="w-4 h-4 rounded-full bg-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-white">High/Extreme Risk</h4>
                <p className="text-sm text-gray-400">
                  Dangerous conditions. Take precautions.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
