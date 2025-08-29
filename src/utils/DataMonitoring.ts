// Real-time data monitoring and accuracy tracking system
export interface DataAlert {
  protocol: string;
  metric: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  currentValue: number;
  expectedRange: [number, number];
}

export interface DataHealthScore {
  protocol: string;
  overall: number; // 0-100 score
  apy: number;
  tvl: number;
  lastUpdated: number;
  alerts: DataAlert[];
}

export class DataMonitoring {
  private static alerts: DataAlert[] = [];
  private static readonly MAX_ALERTS = 50;
  
  // Monitor data accuracy by comparing with known reliable sources
  static async validateProtocolMetrics(protocolData: { protocol: string; liquidStaking?: { apy: number; tvl: number } }): Promise<DataHealthScore> {
    const alerts: DataAlert[] = [];
    let apyScore = 100;
    let tvlScore = 100;
    
    // APY validation rules
    if (protocolData.liquidStaking?.apy) {
      const apy = protocolData.liquidStaking.apy;
      
      // Flag unrealistic APY values
      if (apy > 50) {
        alerts.push({
          protocol: protocolData.protocol,
          metric: 'APY',
          issue: `APY of ${apy}% seems unrealistically high`,
          severity: 'high',
          timestamp: Date.now(),
          currentValue: apy,
          expectedRange: [0, 50]
        });
        apyScore = 30;
      } else if (apy < 0.1) {
        alerts.push({
          protocol: protocolData.protocol,
          metric: 'APY', 
          issue: `APY of ${apy}% seems too low for DeFi`,
          severity: 'medium',
          timestamp: Date.now(),
          currentValue: apy,
          expectedRange: [0.1, 50]
        });
        apyScore = 60;
      }
      
      // Compare with historical data
      const historicalAPY = this.getHistoricalAPY(protocolData.protocol);
      if (historicalAPY && Math.abs(apy - historicalAPY) / historicalAPY > 0.5) {
        alerts.push({
          protocol: protocolData.protocol,
          metric: 'APY',
          issue: `APY changed by ${Math.abs(apy - historicalAPY)}% from historical average`,
          severity: 'medium',
          timestamp: Date.now(),
          currentValue: apy,
          expectedRange: [historicalAPY * 0.5, historicalAPY * 1.5]
        });
        apyScore = Math.min(apyScore, 70);
      }
    }
    
    // TVL validation rules  
    if (protocolData.liquidStaking?.tvl) {
      const tvl = protocolData.liquidStaking.tvl;
      
      // Flag suspicious TVL values
      if (tvl < 100000) {
        alerts.push({
          protocol: protocolData.protocol,
          metric: 'TVL',
          issue: `TVL of $${tvl} seems too low for major protocol`,
          severity: 'high',
          timestamp: Date.now(),
          currentValue: tvl,
          expectedRange: [100000, Infinity]
        });
        tvlScore = 40;
      }
      
      // Compare with DeFiLlama reference
      const defiLlamaTVL = await this.fetchDeFiLlamaTVL(protocolData.protocol);
      if (defiLlamaTVL && Math.abs(tvl - defiLlamaTVL) / defiLlamaTVL > 0.3) {
        alerts.push({
          protocol: protocolData.protocol,
          metric: 'TVL',
          issue: `TVL differs significantly from DeFiLlama ($${defiLlamaTVL})`,
          severity: 'medium',
          timestamp: Date.now(),
          currentValue: tvl,
          expectedRange: [defiLlamaTVL * 0.7, defiLlamaTVL * 1.3]
        });
        tvlScore = Math.min(tvlScore, 75);
      }
    }
    
    // Store alerts
    this.alerts.push(...alerts);
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS);
    }
    
    const overall = (apyScore + tvlScore) / 2;
    
    return {
      protocol: protocolData.protocol,
      overall,
      apy: apyScore,
      tvl: tvlScore,
      lastUpdated: Date.now(),
      alerts
    };
  }
  
  // Cross-reference with DeFiLlama for TVL validation
  private static async fetchDeFiLlamaTVL(protocol: string): Promise<number | null> {
    try {
      const protocolMap: Record<string, string> = {
        'GoGoPool': 'gogopool',
        'BENQI': 'benqi', 
        'Avant Finance': 'avant-finance',
        'Pangolin': 'pangolin'
      };
      
      const slug = protocolMap[protocol];
      if (!slug) return null;
      
      const response = await fetch(`https://api.llama.fi/protocol/${slug}`);
      const data = await response.json();
      
      return parseFloat(data.currentChainTvls?.Avalanche) || null;
    } catch {
      return null;
    }
  }
  
  // Track historical APY for deviation detection
  private static getHistoricalAPY(protocol: string): number | null {
    const key = `historical_apy_${protocol.toLowerCase().replace(' ', '_')}`;
    const stored = localStorage.getItem(key);
    return stored ? parseFloat(stored) : null;
  }
  
  private static setHistoricalAPY(protocol: string, apy: number) {
    const key = `historical_apy_${protocol.toLowerCase().replace(' ', '_')}`;
    localStorage.setItem(key, apy.toString());
  }
  
  // Get current system health status
  static getSystemHealth(): {
    overall: number;
    protocols: Record<string, number>;
    criticalAlerts: DataAlert[];
    totalAlerts: number;
  } {
    const criticalAlerts = this.alerts.filter(alert => alert.severity === 'high');
    const protocolScores: Record<string, number[]> = {};
    
    // Calculate average scores per protocol
    this.alerts.forEach(alert => {
      if (!protocolScores[alert.protocol]) {
        protocolScores[alert.protocol] = [];
      }
      const score = alert.severity === 'high' ? 30 : alert.severity === 'medium' ? 70 : 90;
      protocolScores[alert.protocol].push(score);
    });
    
    const protocols: Record<string, number> = {};
    Object.keys(protocolScores).forEach(protocol => {
      const scores = protocolScores[protocol];
      protocols[protocol] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });
    
    const overall = Object.values(protocols).length > 0 
      ? Object.values(protocols).reduce((sum, score) => sum + score, 0) / Object.values(protocols).length
      : 100;
    
    return {
      overall,
      protocols,
      criticalAlerts,
      totalAlerts: this.alerts.length
    };
  }
  
  // Clear old alerts
  static clearOldAlerts(maxAgeHours: number = 24) {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }
  
  // Get alerts for specific protocol
  static getProtocolAlerts(protocol: string): DataAlert[] {
    return this.alerts.filter(alert => alert.protocol === protocol);
  }
}