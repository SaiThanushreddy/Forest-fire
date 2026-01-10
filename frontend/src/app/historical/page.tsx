'use client';

import { useState, useMemo } from 'react';
import { History, Filter, Download, MapPin, Calendar, Flame } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useHistoricalData } from '@/hooks/useFireData';
import { formatDate, formatNumber } from '@/lib/utils';
import dynamic from 'next/dynamic';

const FireMap = dynamic(() => import('@/components/map/DynamicFireMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-900/50 rounded-lg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  ),
});

export default function HistoricalPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fireFilter, setFireFilter] = useState<'all' | 'fire' | 'no-fire'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const { data: historical, isLoading, refetch } = useHistoricalData(
    startDate || undefined,
    endDate || undefined
  );

  const filteredData = useMemo(() => {
    if (!historical?.data) return [];

    return historical.data.filter((record) => {
      if (fireFilter === 'fire') return record.fire_occurred === 1;
      if (fireFilter === 'no-fire') return record.fire_occurred === 0;
      return true;
    });
  }, [historical?.data, fireFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const fireIncidents = useMemo(() => {
    return historical?.data?.filter((d) => d.fire_occurred === 1) || [];
  }, [historical?.data]);

  const handleExport = () => {
    if (!historical?.data) return;

    const csv = [
      ['Date', 'Latitude', 'Longitude', 'Fire Occurred', 'Brightness', 'Confidence'].join(','),
      ...historical.data.map((d) =>
        [d.date, d.latitude, d.longitude, d.fire_occurred, d.brightness, d.confidence].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fire_historical_data.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        title="Historical Data"
        subtitle="Browse past fire incidents and records"
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-500" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Fire Status</label>
                <select
                  value={fireFilter}
                  onChange={(e) => setFireFilter(e.target.value as 'all' | 'fire' | 'no-fire')}
                  className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Records</option>
                  <option value="fire">Fire Incidents</option>
                  <option value="no-fire">No Fire</option>
                </select>
              </div>
              <Button onClick={() => refetch()}>
                <Filter className="w-4 h-4" />
                Apply
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Fire Locations ({fireIncidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] rounded-b-xl overflow-hidden">
                <FireMap
                  historicalData={fireIncidents}
                  showHeatmap={false}
                  showMarkers={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-orange-500" />
                Data Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500">Total Records</p>
                      <p className="text-3xl font-bold text-white">
                        {historical?.count?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500">Fire Incidents</p>
                      <p className="text-3xl font-bold text-red-400">
                        {fireIncidents.length.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500">Filtered Results</p>
                      <p className="text-3xl font-bold text-orange-400">
                        {filteredData.length.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500">Fire Rate</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {historical?.count
                          ? formatNumber((fireIncidents.length / historical.count) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {fireIncidents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Recent Fire Incidents</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {fireIncidents.slice(0, 10).map((fire, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-gray-300">{fire.date}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatNumber(fire.brightness)} brightness
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Records ({filteredData.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Brightness</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((record, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm text-white">{record.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {formatNumber(record.latitude, 4)}°N, {formatNumber(record.longitude, 4)}°E
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={record.fire_occurred ? 'danger' : 'success'}>
                            {record.fire_occurred ? 'Fire' : 'No Fire'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-orange-400">
                          {formatNumber(record.brightness)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {formatNumber(record.confidence)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paginatedData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No records found with the current filters
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
