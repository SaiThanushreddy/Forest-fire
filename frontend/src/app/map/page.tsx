'use client';

import { useState } from 'react';
import { Map, Layers, Eye, EyeOff, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { usePrediction, useHistoricalData } from '@/hooks/useFireData';
import dynamic from 'next/dynamic';

const FireMap = dynamic(() => import('@/components/map/DynamicFireMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] bg-gray-900/50 rounded-lg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  ),
});

export default function MapPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  const { data: prediction, isLoading: predictionLoading } = usePrediction(selectedDate);
  const { data: historical, isLoading: historicalLoading } = useHistoricalData();

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        title="Interactive Map"
        subtitle="Geographic visualization of fire risk and incidents"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-500" />
                Map Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Prediction Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Layer Toggles */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Layers</h4>

                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    showHeatmap
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                      : 'bg-gray-800/50 border-white/10 text-gray-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                    Risk Heatmap
                  </span>
                  {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowMarkers(!showMarkers)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    showMarkers
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-gray-800/50 border-white/10 text-gray-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Fire Incidents
                  </span>
                  {showMarkers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Legend */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-gray-300">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded bg-green-500" />
                    <span className="text-xs text-gray-400">Low Risk (0-25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded bg-yellow-500" />
                    <span className="text-xs text-gray-400">Moderate (25-50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded bg-orange-500" />
                    <span className="text-xs text-gray-400">High (50-75%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded bg-red-500" />
                    <span className="text-xs text-gray-400">Extreme (75-100%)</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {prediction?.statistics && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-300">Current Stats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Risk Level</p>
                      <p className="text-sm font-semibold text-orange-400">
                        {prediction.statistics.risk_level}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Hot Spots</p>
                      <p className="text-sm font-semibold text-red-400">
                        {prediction.statistics.high_risk_cells}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-orange-500" />
                Almora Region - Fire Risk Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[700px] rounded-b-xl overflow-hidden relative">
                {(predictionLoading || historicalLoading) && (
                  <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Spinner size="lg" />
                      <p className="mt-2 text-gray-400">Loading data...</p>
                    </div>
                  </div>
                )}
                <FireMap
                  prediction={prediction}
                  historicalData={historical?.data}
                  showHeatmap={showHeatmap}
                  showMarkers={showMarkers}
                  className="h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
