import { useState, useEffect, useCallback, useRef } from 'react';
import { ProtocolAggregator, AggregatedData, YieldOpportunity } from '@/components/protocols/ProtocolAggregator';

export interface LiveProtocolData {
  data: AggregatedData | null;
  opportunities: YieldOpportunity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  totalTVL: number;
  averageAPY: number;
  activeProtocols: number;
}

export function useLiveProtocolData(refreshInterval: number = 15000) {
  const [state, setState] = useState<LiveProtocolData>({
    data: null,
    opportunities: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
    totalTVL: 0,
    averageAPY: 0,
    activeProtocols: 0
  });

  const aggregatorRef = useRef<ProtocolAggregator>(new ProtocolAggregator());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const aggregatedData = await aggregatorRef.current.fetchAllProtocolData();
      const opportunities = aggregatorRef.current.formatToYieldOpportunities(aggregatedData);
      const metrics = aggregatorRef.current.calculateTotalMetrics(aggregatedData);

      setState({
        data: aggregatedData,
        opportunities,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        totalTVL: metrics.totalTVL,
        averageAPY: metrics.averageAPY,
        activeProtocols: metrics.activeProtocols
      });
    } catch (error) {
      console.error('Failed to fetch protocol data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch protocol data'
      }));
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(fetchData, refreshInterval);
  }, [fetchData, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchData();
    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, [fetchData, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, [refreshInterval, startAutoRefresh, stopAutoRefresh]);

  return {
    ...state,
    refetch: fetchData,
    startAutoRefresh,
    stopAutoRefresh
  };
}