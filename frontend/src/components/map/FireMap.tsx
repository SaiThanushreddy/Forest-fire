'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ALMORA_CENTER, ALMORA_BOUNDS, interpolateColor } from '@/lib/utils';
import type { PredictionResponse, HistoricalFireRecord } from '@/types';

interface FireMapProps {
  prediction?: PredictionResponse | null;
  historicalData?: HistoricalFireRecord[];
  showHeatmap?: boolean;
  showMarkers?: boolean;
  className?: string;
}

export function FireMap({
  prediction,
  historicalData,
  showHeatmap = true,
  showMarkers = true,
  className,
}: FireMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [ALMORA_CENTER.lat, ALMORA_CENTER.lon],
      zoom: 10,
      zoomControl: false,
    });

    // Add dark tile layer
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }
    ).addTo(mapRef.current);

    // Add zoom control to bottom right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(mapRef.current);

    // Initialize marker layer group
    markersRef.current = L.layerGroup().addTo(mapRef.current);

    // Add Almora boundary
    const bounds: L.LatLngBoundsExpression = [
      [ALMORA_BOUNDS.south, ALMORA_BOUNDS.west],
      [ALMORA_BOUNDS.north, ALMORA_BOUNDS.east],
    ];
    L.rectangle(bounds, {
      color: '#f97316',
      weight: 2,
      fillOpacity: 0,
      dashArray: '5, 5',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Create heatmap image from risk data
  const createHeatmapImage = useCallback((riskMap: number[][]) => {
    const size = riskMap.length;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const value = riskMap[y][x];
        const color = interpolateColor(value);
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

        if (match) {
          const idx = (y * size + x) * 4;
          imageData.data[idx] = parseInt(match[1]);
          imageData.data[idx + 1] = parseInt(match[2]);
          imageData.data[idx + 2] = parseInt(match[3]);
          imageData.data[idx + 3] = Math.floor(value * 180 + 50);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }, []);

  // Update heatmap overlay when prediction changes
  useEffect(() => {
    if (!mapRef.current || !prediction?.risk_map || !showHeatmap) return;

    const imageUrl = createHeatmapImage(prediction.risk_map);
    if (!imageUrl) return;

    const bounds: L.LatLngBoundsExpression = [
      [prediction.bounds.south, prediction.bounds.west],
      [prediction.bounds.north, prediction.bounds.east],
    ];

    if (overlayRef.current) {
      overlayRef.current.remove();
    }

    overlayRef.current = L.imageOverlay(imageUrl, bounds, {
      opacity: 0.7,
    }).addTo(mapRef.current);
  }, [prediction, showHeatmap, createHeatmapImage]);

  // Update markers when historical data changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !showMarkers) return;

    markersRef.current.clearLayers();

    if (!historicalData) return;

    const fires = historicalData.filter((d) => d.fire_occurred === 1);

    fires.slice(0, 200).forEach((fire) => {
      const marker = L.circleMarker([fire.latitude, fire.longitude], {
        radius: 6,
        fillColor: '#ef4444',
        color: '#dc2626',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6,
      });

      marker.bindPopup(`
        <div class="text-sm">
          <p class="font-semibold">Fire Incident</p>
          <p>Date: ${fire.date}</p>
          <p>Brightness: ${fire.brightness.toFixed(1)}</p>
          <p>Confidence: ${fire.confidence.toFixed(1)}%</p>
        </div>
      `);

      markersRef.current!.addLayer(marker);
    });
  }, [historicalData, showMarkers]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
}

export default FireMap;
