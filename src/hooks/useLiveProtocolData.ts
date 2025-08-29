import { useState, useEffect, useCallback, useRef } from 'react';
import { FixedProtocolService } from '@/components/protocols/FixedProtocolService';
import { YieldOpportunity } from '@/components/protocols/ProtocolAggregator';

export interface LiveProtocolData {
  opportunities: YieldOpportunity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  totalTVL: number;
  averageAPY: number;
  activeProtocols: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  systemHealth: number;
  alerts: string[];
}

export function useLiveProtocolData(refreshInterval: number = 15000) {
  const [state, setState] = useState<LiveProtocolData>({
    opportunities: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
    totalTVL: 0,
    averageAPY: 0,
    activeProtocols: 0,
    dataQuality: 'fair',
    systemHealth: 0,
    alerts: []
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔄 Fetching fixed protocol data...');
      const fixedData = await FixedProtocolService.getAllProtocolData();

      setState({
        opportunities: fixedData.opportunities,
        isLoading: false,
        error: null,
        lastUpdated: fixedData.lastUpdated,
        totalTVL: fixedData.totalTVL,
        averageAPY: fixedData.averageAPY,
        activeProtocols: fixedData.activeProtocols,
        dataQuality: fixedData.dataQuality,
        systemHealth: fixedData.systemHealth,
        alerts: fixedData.alerts
      });
      
      console.log(`✅ Data updated: ${fixedData.opportunities.length} opportunities (${fixedData.dataQuality} quality)`);
    } catch (error) {
      console.error('❌ Failed to fetch fixed protocol data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch fixed protocol data'
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