import { EnhancedProtocolService, ValidatedProtocolData } from './EnhancedProtocolService';
import { DataMonitoring, DataHealthScore } from '@/utils/DataMonitoring';
import { YieldOpportunity } from './ProtocolAggregator';

export interface TrustedYieldData {
  opportunities: YieldOpportunity[];
  healthScores: Record<string, DataHealthScore>;
  systemHealth: number;
  totalTVL: number;
  averageAPY: number;
  activeProtocols: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: Date;
  alerts: string[];
}

export class UltimateProtocolService {
  private static cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 30000; 
  
  static async getTrustedYieldData(): Promise<TrustedYieldData> {
    console.log('🔍 Fetching trusted yield data from multiple sources...');
    
    // Fetch validated data from all protocols
    const [gogopool, benqi, avant, pangolin] = await Promise.allSettled([
      this.getCachedData('gogopool', () => EnhancedProtocolService.getGoGoPoolData()),
      this.getCachedData('benqi', () => EnhancedProtocolService.getBenqiData()),  
      this.getCachedData('avant', () => EnhancedProtocolService.getAvantData()),
      this.getCachedData('pangolin', () => EnhancedProtocolService.getPangolinData())
    ]);
    
    // Process successful data fetches
    const validatedData: ValidatedProtocolData[] = [];
    const healthScores: Record<string, DataHealthScore> = {};
    
    if (gogopool.status === 'fulfilled') {
      validatedData.push(gogopool.value);
      healthScores['GoGoPool'] = await DataMonitoring.validateProtocolMetrics(gogopool.value);
    }
    
    if (benqi.status === 'fulfilled') {
      validatedData.push(benqi.value);
      healthScores['BENQI'] = await DataMonitoring.validateProtocolMetrics(benqi.value);
    }
    
    if (avant.status === 'fulfilled') {
      validatedData.push(avant.value);  
      healthScores['Avant Finance'] = await DataMonitoring.validateProtocolMetrics(avant.value);
    }
    
    if (pangolin.status === 'fulfilled') {
      validatedData.push(pangolin.value);
      healthScores['Pangolin'] = await DataMonitoring.validateProtocolMetrics(pangolin.value);
    }
    
    // Convert to yield opportunities format
    const opportunities = this.formatToYieldOpportunities(validatedData);
    
    // Calculate aggregated metrics
    const { totalTVL, averageAPY, activeProtocols } = this.calculateTrustedMetrics(validatedData);
    
    // Determine data quality
    const systemHealth = DataMonitoring.getSystemHealth();
    const dataQuality = this.determineDataQuality(systemHealth.overall);
    
    // Collect important alerts
    const alerts = systemHealth.criticalAlerts
      .slice(0, 5)
      .map(alert => `${alert.protocol}: ${alert.issue}`);
    
    console.log(`✅ Data fetched: ${opportunities.length} opportunities, ${dataQuality} quality`);
    
    return {
      opportunities,
      healthScores,
      systemHealth: systemHealth.overall,
      totalTVL,
      averageAPY,
      activeProtocols,
      dataQuality,
      lastUpdated: new Date(),
      alerts
    };
  }
  
  // Intelligent caching to reduce API calls
  private static async getCachedData<T>(
    key: string, 
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data as T;
    }
    
    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Return cached data if available, even if stale
      if (cached) {
        console.warn(`Using stale cache for ${key}:`, error);
        return cached.data as T;
      }
      throw error;
    }
  }
  
  // Format validated data to UI format
  private static formatToYieldOpportunities(protocols: ValidatedProtocolData[]): YieldOpportunity[] {
    const opportunities: YieldOpportunity[] = [];
    
    protocols.forEach((protocol) => {
      // Liquid staking opportunities
      if (protocol.liquidStaking && protocol.liquidStaking.confidence > 0.5) {
        opportunities.push({
          id: `${protocol.protocol.toLowerCase().replace(' ', '-')}-liquid-staking`,
          protocol: protocol.protocol,
          category: 'Liquid Staking',
          pair: this.getLiquidStakingPair(protocol.protocol),
          apy: `${protocol.liquidStaking.apy.toFixed(2)}%`,
          tvl: `$${(protocol.liquidStaking.tvl / 1000000).toFixed(1)}M`,
          risk: this.assessRisk(protocol.liquidStaking.apy, protocol.liquidStaking.confidence),
          icon: this.getProtocolIcon(protocol.protocol),
          url: this.getProtocolURL(protocol.protocol),
          isLive: protocol.liquidStaking.confidence > 0.7,
          features: [
            `${protocol.liquidStaking.confidence > 0.8 ? 'High' : 'Medium'} Confidence`,
            `${protocol.liquidStaking.sources.length} Sources`,
            'Live Data'
          ]
        });
      }
      
      // Lending opportunities
      if (protocol.lending) {
        protocol.lending
          .filter(market => market.confidence > 0.5 && market.tvl > 100000)
          .forEach((market) => {
            opportunities.push({
              id: `${protocol.protocol.toLowerCase().replace(' ', '-')}-${market.asset.toLowerCase()}`,
              protocol: protocol.protocol,
              category: 'Lending',
              pair: `${market.asset} (Supply)`,
              apy: `${market.supplyApy.toFixed(2)}%`,
              tvl: `$${(market.tvl / 1000000).toFixed(1)}M`,
              risk: this.assessRisk(market.supplyApy, market.confidence),
              icon: this.getProtocolIcon(protocol.protocol),
              url: this.getProtocolURL(protocol.protocol),
              isLive: market.confidence > 0.7,
              features: [
                `${market.confidence > 0.8 ? 'High' : 'Medium'} Confidence`,
                `${market.sources.length} Sources`,
                'Validated Data'
              ]
            });
          });
      }
      
      // Yield farming opportunities
      if (protocol.farming) {
        protocol.farming
          .filter(farm => farm.confidence > 0.5 && farm.tvl > 50000)
          .forEach((farm) => {
            opportunities.push({
              id: `${protocol.protocol.toLowerCase().replace(' ', '-')}-${farm.pair.toLowerCase().replace('-', '')}`,
              protocol: protocol.protocol,
              category: 'Yield Farming',
              pair: farm.pair,
              apy: `${farm.apr.toFixed(2)}%`,
              tvl: `$${(farm.tvl / 1000000).toFixed(1)}M`,
              risk: this.assessRisk(farm.apr, farm.confidence),
              icon: this.getProtocolIcon(protocol.protocol),
              url: this.getProtocolURL(protocol.protocol),
              isLive: farm.confidence > 0.7,
              features: [
                `${farm.confidence > 0.8 ? 'High' : 'Medium'} Confidence`,
                `${farm.sources.length} Sources`,
                'Cross-Validated'
              ]
            });
          });
      }
    });
    
    // Sort by confidence and APY
    return opportunities.sort((a, b) => {
      const aConfidence = parseFloat(a.features?.[0]?.split(' ')[0] === 'High' ? '0.9' : '0.7');
      const bConfidence = parseFloat(b.features?.[0]?.split(' ')[0] === 'High' ? '0.9' : '0.7');
      const aAPY = parseFloat(a.apy.replace('%', ''));
      const bAPY = parseFloat(b.apy.replace('%', ''));
      
      // Prioritize high confidence, then high APY
      if (Math.abs(aConfidence - bConfidence) > 0.1) {
        return bConfidence - aConfidence;
      }
      return bAPY - aAPY;
    });
  }
  
  private static calculateTrustedMetrics(protocols: ValidatedProtocolData[]) {
    let totalTVL = 0;
    let totalAPY = 0;
    let apyCount = 0;
    let activeProtocols = 0;
    
    protocols.forEach((protocol) => {
      if (protocol.liquidStaking && protocol.liquidStaking.confidence > 0.5) {
        activeProtocols++;
        totalTVL += protocol.liquidStaking.tvl;
        totalAPY += protocol.liquidStaking.apy;
        apyCount++;
      }
      
      if (protocol.lending) {
        protocol.lending
          .filter(market => market.confidence > 0.5)
          .forEach((market) => {
            totalTVL += market.tvl;
            totalAPY += market.supplyApy;
            apyCount++;
          });
      }
      
      if (protocol.farming) {
        protocol.farming
          .filter(farm => farm.confidence > 0.5)
          .forEach((farm) => {
            totalTVL += farm.tvl;
            totalAPY += farm.apr;
            apyCount++;
          });
      }
    });
    
    return {
      totalTVL,
      averageAPY: apyCount > 0 ? totalAPY / apyCount : 0,
      activeProtocols: Math.max(activeProtocols, protocols.length)
    };
  }
  
  private static determineDataQuality(overallHealth: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (overallHealth >= 85) return 'excellent';
    if (overallHealth >= 70) return 'good';
    if (overallHealth >= 50) return 'fair';
    return 'poor';
  }
  
  private static assessRisk(apy: number, confidence: number): 'Low' | 'Medium' | 'High' {
    if (confidence < 0.6) return 'High'; // Low confidence = high risk
    if (apy > 25) return 'High';
    if (apy > 10) return 'Medium';
    return 'Low';
  }
  
  private static getLiquidStakingPair(protocol: string): string {
    const pairs: Record<string, string> = {
      'GoGoPool': 'AVAX → ggAVAX',
      'BENQI': 'AVAX → sAVAX',
      'Avant Finance': 'avUSD → savUSD'
    };
    return pairs[protocol] || 'Unknown';
  }
  
  private static getProtocolIcon(protocol: string): string {
    const icons: Record<string, string> = {
      'GoGoPool': '⚡',
      'BENQI': '🔥',
      'Avant Finance': '💰',
      'Pangolin': '🥞'
    };
    return icons[protocol] || '🏦';
  }
  
  private static getProtocolURL(protocol: string): string {
    const urls: Record<string, string> = {
      'GoGoPool': 'https://www.gogopool.com/stake',
      'BENQI': 'https://app.benqi.fi',
      'Avant Finance': 'https://app.avantprotocol.com',
      'Pangolin': 'https://app.pangolin.exchange'
    };
    return urls[protocol] || '#';
  }
  
  // Real-time data quality monitoring
  static async monitorDataQuality(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    message: string;
    recommendations: string[];
  }> {
    const health = DataMonitoring.getSystemHealth();
    
    if (health.overall >= 80) {
      return {
        status: 'healthy',
        message: '✅ All protocol data sources are providing accurate, validated information',
        recommendations: []
      };
    }
    
    if (health.overall >= 60) {
      return {
        status: 'degraded', 
        message: '⚠️ Some data inconsistencies detected. Using best available sources.',
        recommendations: [
          'Cross-referencing multiple data sources',
          'Monitoring for improved data quality',
          'Using confidence scores to prioritize reliable data'
        ]
      };
    }
    
    return {
      status: 'critical',
      message: '🚨 Significant data quality issues detected. Exercise caution.',
      recommendations: [
        'Verify yields on official protocol websites',
        'Wait for data sources to stabilize',
        'Consider using only high-confidence opportunities'
      ]
    };
  }
}