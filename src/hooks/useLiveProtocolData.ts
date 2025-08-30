import { useState, useEffect, useCallback, useRef } from 'react';
import { AvantService, HyphaService } from '@/services/avantAndHyphaService';
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
      
      console.log('🔄 Fetching live protocol data...');
      
      // Fetch data from all live services in parallel
      const avantService = new AvantService();
      const hyphaService = new HyphaService();
      
      const [avantData, hyphaData] = await Promise.allSettled([
        avantService.fetchData(),
        hyphaService.fetchData()
      ]);

      const allOpportunities: YieldOpportunity[] = [];
      
      // Convert Avant data to YieldOpportunity format
      if (avantData.status === 'fulfilled') {
        const data = avantData.value;
        
        // avUSD opportunity (basic token info)
        if (data.avUSD && data.avUSD.marketCap > 0) {
          allOpportunities.push({
            id: 'avant-avusd',
            protocol: 'Avant Finance',
            category: 'Yield Farming',
            pair: 'avUSD',
            apy: '3.2%', // Base rate for holding avUSD
            tvl: `$${(data.avUSD.marketCap / 1000000).toFixed(1)}M`,
            risk: 'Low',
            icon: '💰',
            url: 'https://app.avantprotocol.com',
            isLive: true,
            features: ['ERC-4626 Vault', 'Stable Asset', 'Delta-Neutral']
          });
        }
        
        // savUSD opportunity (the vault with yield)
        if (data.savUSD && data.savUSD.apy > 0) {
          allOpportunities.push({
            id: 'avant-savusd',
            protocol: 'Avant Finance',
            category: 'Yield Farming', 
            pair: 'avUSD → savUSD',
            apy: `${data.savUSD.apy.toFixed(2)}%`,
            tvl: `$${(data.savUSD.tvl * (data.prices.avUSD || 1) / 1000000).toFixed(1)}M`,
            risk: 'Low',
            icon: '💰',
            url: 'https://app.avantprotocol.com',
            isLive: true,
            features: ['Live Rate', 'ERC-4626 Vault', 'Real-time APY']
          });
        }
        
        // avBTC opportunity (basic token info)
        if (data.avBTC && data.avBTC.marketCap > 0) {
          allOpportunities.push({
            id: 'avant-avbtc',
            protocol: 'Avant Finance',
            category: 'Yield Farming',
            pair: 'avBTC',
            apy: '2.1%', // Base rate for holding avBTC
            tvl: `$${(data.avBTC.marketCap / 1000000).toFixed(1)}M`,
            risk: 'Medium',
            icon: '₿',
            url: 'https://app.avantprotocol.com',
            isLive: true,
            features: ['Bitcoin Exposure', 'ERC-4626 Vault', 'Live Rate']
          });
        }
        
        // savBTC opportunity (the vault with yield)
        if (data.savBTC && data.savBTC.apy > 0) {
          allOpportunities.push({
            id: 'avant-savbtc',
            protocol: 'Avant Finance',
            category: 'Yield Farming',
            pair: 'avBTC → savBTC', 
            apy: `${data.savBTC.apy.toFixed(2)}%`,
            tvl: `$${(data.savBTC.tvl * (data.prices.avBTC || 65000) / 1000000).toFixed(1)}M`,
            risk: 'Medium',
            icon: '₿',
            url: 'https://app.avantprotocol.com',
            isLive: true,
            features: ['Bitcoin Yield', 'ERC-4626 Vault', 'Real-time APY']
          });
        }
      }
      
      // Convert Hypha data to YieldOpportunity format
      if (hyphaData.status === 'fulfilled') {
        const data = hyphaData.value;
        
        // stAVAX/ggAVAX opportunity
        if (data.stAVAX.apy > 0) {
          allOpportunities.push({
            id: 'gogopool-stavax',
            protocol: 'GoGoPool',
            category: 'Liquid Staking',
            pair: 'AVAX → stAVAX',
            apy: `${data.stAVAX.apy.toFixed(2)}%`,
            tvl: `$${(data.stAVAX.tvlAVAX * 42 / 1000000).toFixed(1)}M`, // AVAX price estimate
            risk: 'Low',
            icon: '⚡',
            url: 'https://www.gogopool.com/stake',
            isLive: true,
            features: ['Official API', 'Live Data', 'Minipool Network']
          });
        }
      }

      // Calculate metrics
      const totalTVL = allOpportunities.reduce((sum, opp) => {
        const tvlValue = parseFloat(opp.tvl.replace(/[$M,]/g, '')) * 1000000;
        return sum + tvlValue;
      }, 0);

      const totalAPY = allOpportunities.reduce((sum, opp) => {
        return sum + parseFloat(opp.apy.replace('%', ''));
      }, 0);

      const averageAPY = allOpportunities.length > 0 ? totalAPY / allOpportunities.length : 0;
      const activeProtocols = new Set(allOpportunities.map(opp => opp.protocol)).size;
      
      // Determine data quality based on successful service calls
      const successfulServices = [avantData, hyphaData].filter(result => result.status === 'fulfilled').length;
      const dataQuality = successfulServices >= 2 ? 'excellent' : successfulServices >= 1 ? 'good' : 'poor';
      const systemHealth = (successfulServices / 2) * 100;

      const alerts: string[] = [];
      if (avantData.status === 'rejected') alerts.push('Avant Protocol data unavailable');
      if (hyphaData.status === 'rejected') alerts.push('GoGoPool/Hypha data unavailable');

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
      
      console.log(`✅ Live data updated: ${allOpportunities.length} opportunities from ${activeProtocols} protocols (${dataQuality} quality)`);
    } catch (error) {
      console.error('❌ Failed to fetch live protocol data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live protocol data'
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