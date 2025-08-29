import { DataValidator, DataSourceManager } from '@/utils/DataValidator';

export interface ValidatedProtocolData {
  protocol: string;
  liquidStaking?: {
    apy: number;
    tvl: number;
    confidence: number;
    sources: string[];
  };
  lending?: Array<{
    asset: string;
    supplyApy: number;
    borrowApy: number;
    tvl: number;
    confidence: number;
    sources: string[];
  }>;
  farming?: Array<{
    pair: string;
    apr: number;
    tvl: number;
    confidence: number;
    sources: string[];
  }>;
}

export class EnhancedProtocolService {
  
  // Enhanced GoGoPool data with multi-source validation
  static async getGoGoPoolData(): Promise<ValidatedProtocolData> {
    const apySources = await DataSourceManager.fetchGoGoPoolData();
    const validatedAPY = DataValidator.validateAPY(apySources);
    
    // Fetch TVL from multiple sources
    const tvlSources = await this.fetchGoGoPoolTVL();
    const validatedTVL = DataValidator.validateTVL(tvlSources);
    
    return {
      protocol: 'GoGoPool',
      liquidStaking: {
        apy: validatedAPY.value,
        tvl: validatedTVL.value,
        confidence: (validatedAPY.confidence + validatedTVL.confidence) / 2,
        sources: [...new Set([...validatedAPY.sources, ...validatedTVL.sources])]
      }
    };
  }
  
  // Enhanced BENQI data using subgraph + API validation
  static async getBenqiData(): Promise<ValidatedProtocolData> {
    const apySources = await DataSourceManager.fetchBenqiData();
    const validatedAPY = DataValidator.validateAPY(apySources);
    
    // Fetch lending market data from subgraph
    const lendingData = await this.fetchBenqiLendingFromSubgraph();
    
    return {
      protocol: 'BENQI',
      liquidStaking: {
        apy: validatedAPY.value,
        tvl: await this.getBenqiTVL(),
        confidence: validatedAPY.confidence,
        sources: validatedAPY.sources
      },
      lending: lendingData
    };
  }
  
  // Enhanced Avant data with vault rate tracking
  static async getAvantData(): Promise<ValidatedProtocolData> {
    const sources = await DataSourceManager.fetchAvantData();
    const validatedAPY = DataValidator.validateAPY(sources);
    
    return {
      protocol: 'Avant Finance',
      liquidStaking: {
        apy: validatedAPY.value,
        tvl: await this.getAvantTVL(),
        confidence: validatedAPY.confidence,
        sources: validatedAPY.sources
      }
    };
  }
  
  // Enhanced Pangolin data from subgraph
  static async getPangolinData(): Promise<ValidatedProtocolData> {
    const farmingData = await this.fetchPangolinFromSubgraph();
    
    return {
      protocol: 'Pangolin',
      farming: farmingData
    };
  }
  
  // Private helper methods
  private static async fetchGoGoPoolTVL() {
    const sources = [];
    const now = Date.now();
    
    try {
      // DeFiLlama TVL
      const response = await fetch('https://api.llama.fi/protocol/gogopool');
      const data = await response.json();
      
      if (data.currentChainTvls?.Avalanche) {
        sources.push({
          source: 'defillama-tvl',
          value: parseFloat(data.currentChainTvls.Avalanche),
          confidence: 0.85,
          timestamp: now
        });
      }
    } catch (error) {
      console.warn('DeFiLlama GoGoPool TVL failed:', error);
    }
    
    return sources;
  }
  
  private static async fetchBenqiLendingFromSubgraph() {
    try {
      const query = `
        {
          lendingPools {
            asset
            supplyRate
            borrowRate
            totalSupply
            totalBorrows
            utilizationRate
          }
        }
      `;
      
      const response = await fetch('https://gateway.thegraph.com/api/subgraphs/id/EcNHwEGXq3KW1vCbHHj1iwvtf62ae5kxzEQhKtRqPygt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      return data.data?.lendingPools?.map((pool: Record<string, unknown>) => ({
        asset: pool.asset as string,
        supplyApy: parseFloat(pool.supplyRate as string) * 100,
        borrowApy: parseFloat(pool.borrowRate as string) * 100,
        tvl: parseFloat(pool.totalSupply as string) * parseFloat(pool.utilizationRate as string),
        confidence: 0.9,
        sources: ['benqi-subgraph']
      })) || [];
    } catch (error) {
      console.warn('BENQI subgraph failed:', error);
      return [];
    }
  }
  
  private static async fetchPangolinFromSubgraph() {
    try {
      const query = `
        {
          pairs(first: 10, orderBy: reserveUSD, orderDirection: desc) {
            token0 {
              symbol
            }
            token1 {
              symbol  
            }
            reserveUSD
            volumeUSD
          }
        }
      `;
      
      const response = await fetch('https://gateway.thegraph.com/api/subgraphs/id/7PRKughAkeESafrGZ8A2x1YsbNMQnFbxQ1bpeNjktwZk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      return data.data?.pairs?.map((pair: Record<string, unknown>) => {
        const volume = parseFloat(pair.volumeUSD as string);
        const tvl = parseFloat(pair.reserveUSD as string);
        const estimatedAPR = volume > 0 && tvl > 0 ? (volume * 365 * 0.003) / tvl * 100 : 0; // 0.3% fee estimate
        
        return {
          pair: `${(pair.token0 as Record<string, unknown>).symbol as string}-${(pair.token1 as Record<string, unknown>).symbol as string}`,
          apr: estimatedAPR,
          tvl: tvl,
          confidence: 0.8,
          sources: ['pangolin-subgraph']
        };
      }).filter((farm: Record<string, unknown>) => (farm.tvl as number) > 100000) || [];
    } catch (error) {
      console.warn('Pangolin subgraph failed:', error);
      return [];
    }
  }
  
  private static async getBenqiTVL(): Promise<number> {
    try {
      const response = await fetch('https://api.llama.fi/protocol/benqi');
      const data = await response.json();
      return parseFloat(data.currentChainTvls?.Avalanche) || 0;
    } catch {
      return 0;
    }
  }
  
  private static async getAvantTVL(): Promise<number> {
    try {
      const response = await fetch('https://api.llama.fi/protocol/avant-finance');
      const data = await response.json();
      return parseFloat(data.currentChainTvls?.Avalanche) || 0;
    } catch {
      return 0;
    }
  }
  
  // Cross-validation method to ensure data accuracy
  static async validateProtocolData() {
    const protocols = ['GoGoPool', 'BENQI', 'Avant Finance', 'Pangolin'];
    const validationReport = [];
    
    for (const protocol of protocols) {
      try {
        let data;
        switch (protocol) {
          case 'GoGoPool':
            data = await this.getGoGoPoolData();
            break;
          case 'BENQI':
            data = await this.getBenqiData();
            break;
          case 'Avant Finance':
            data = await this.getAvantData();
            break;
          case 'Pangolin':
            data = await this.getPangolinData();
            break;
        }
        
        validationReport.push({
          protocol,
          status: 'valid',
          confidence: data?.liquidStaking?.confidence || 0,
          sources: data?.liquidStaking?.sources || []
        });
      } catch (error) {
        validationReport.push({
          protocol,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          confidence: 0
        });
      }
    }
    
    return validationReport;
  }
}