import { useState, useEffect, useCallback, useRef } from 'react';
import { DefiLlamaService } from '@/services/DefiLlamaService';
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

export function useLiveProtocolData(refreshInterval: number = 3600000) { // 1 hour = 3600000ms
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

      console.log('🔄 Fetching live protocol data from DeFiLlama... (refreshes hourly)');

      // Initialize DeFiLlama service
      const defiLlamaService = new DefiLlamaService();

      // Fetch Avalanche pools from DeFiLlama
      const pools = await defiLlamaService.fetchAvalanchePools();

      const allOpportunities: YieldOpportunity[] = [];

      // Transform DeFiLlama pools to YieldOpportunity format
      pools.forEach((pool, index) => {
        const apy = pool.apy || pool.apyBase || 0;
        const tvl = pool.tvlUsd || 0;

        // Skip pools with invalid data
        if (apy <= 0 || tvl <= 0) return;

        const protocolDisplayName = defiLlamaService.getProtocolDisplayName(pool.project);
        const risk = defiLlamaService.calculateRiskLevel(apy, tvl);
        const icon = defiLlamaService.getProtocolIcon(pool.project);
        const url = pool.url || defiLlamaService.getProtocolUrl(pool.project);

        // Determine category based on pool characteristics
        let category = 'Yield Farming';
        const symbol = pool.symbol?.toLowerCase() || '';
        if (symbol.includes('savax') || symbol.includes('ggavax') || symbol.includes('staking')) {
          category = 'Liquid Staking';
        } else if (symbol.includes('lend') || symbol.includes('borrow') || symbol.includes('supply')) {
          category = 'Lending';
        }

        // Format TVL
        let tvlFormatted = '';
        if (tvl >= 1000000000) {
          tvlFormatted = `$${(tvl / 1000000000).toFixed(2)}B`;
        } else if (tvl >= 1000000) {
          tvlFormatted = `$${(tvl / 1000000).toFixed(1)}M`;
        } else if (tvl >= 1000) {
          tvlFormatted = `$${(tvl / 1000).toFixed(1)}K`;
        } else {
          tvlFormatted = `$${tvl.toFixed(0)}`;
        }

        // Build features array
        const features: string[] = ['DeFiLlama Data'];
        if (pool.apyReward && pool.apyReward > 0) {
          features.push(`+${pool.apyReward.toFixed(2)}% Rewards`);
        }
        if (pool.rewardTokens && pool.rewardTokens.length > 0) {
          features.push('Multi-Token Rewards');
        }

        allOpportunities.push({
          id: pool.pool || `defillama-${index}`,
          protocol: protocolDisplayName,
          category,
          pair: pool.symbol || 'Unknown',
          apy: `${apy.toFixed(2)}%`,
          tvl: tvlFormatted,
          risk,
          icon,
          url,
          isLive: true,
          features
        });
      });

      // Calculate metrics - cap at reasonable maximum
      const totalTVL = Math.min(
        pools.reduce((sum, pool) => sum + (pool.tvlUsd || 0), 0),
        999000000000
      ); // Cap at 999B max

      const totalAPY = allOpportunities.reduce((sum, opp) => {
        return sum + parseFloat(opp.apy.replace('%', ''));
      }, 0);

      const averageAPY = allOpportunities.length > 0 ? totalAPY / allOpportunities.length : 0;
      const activeProtocols = new Set(allOpportunities.map(opp => opp.protocol)).size;

      // Data quality based on number of opportunities found
      const dataQuality = allOpportunities.length >= 10 ? 'excellent' :
                          allOpportunities.length >= 5 ? 'good' :
                          allOpportunities.length >= 1 ? 'fair' : 'poor';
      const systemHealth = Math.min((allOpportunities.length / 10) * 100, 100);

      const alerts: string[] = [];
      if (allOpportunities.length === 0) {
        alerts.push('No pools found matching criteria');
      } else if (allOpportunities.length < 5) {
        alerts.push('Limited pool data available');
      }

      setState({
        opportunities: allOpportunities,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        totalTVL,
        averageAPY,
        activeProtocols,
        dataQuality,
        systemHealth,
        alerts
      });

      console.log(`✅ DeFiLlama data updated: ${allOpportunities.length} opportunities from ${activeProtocols} protocols (${dataQuality} quality)`);
    } catch (error) {
      console.error('❌ Failed to fetch DeFiLlama protocol data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch DeFiLlama protocol data'
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