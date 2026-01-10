'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePrediction(date?: string) {
  return useQuery({
    queryKey: ['prediction', date],
    queryFn: () => api.predict(date),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useHistoricalData(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['historical', startDate, endDate],
    queryFn: () => api.getHistorical(startDate, endDate),
    staleTime: 1000 * 60 * 10,
  });
}

export function useSimulation() {
  return useMutation({
    mutationFn: api.runSimulation,
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: api.getAnalytics,
    staleTime: 1000 * 60 * 10,
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ['heatmap'],
    queryFn: api.getHeatmap,
    staleTime: 1000 * 60 * 10,
  });
}

export function useWeather() {
  return useQuery({
    queryKey: ['weather'],
    queryFn: api.getWeather,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}

export function useTerrain() {
  return useQuery({
    queryKey: ['terrain'],
    queryFn: api.getTerrain,
    staleTime: 1000 * 60 * 60,
  });
}
