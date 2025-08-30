import { AvantService, AvantData } from '@/services/avantAndHyphaService';

export interface AvantProtocolData {
  protocol: string;
  avUSD: {
    totalSupply: number;
    price: number;
    marketCap: number;
  };
  savUSD: {
    totalAssets: number;
    totalSupply: number;
    pricePerShare: number;
    tvl: number;
    apy: number;
    utilization: number;
  };
  avUSDx: {
    totalSupply: number;
    price: number;
    marketCap: number;
  };
  avBTC: {
    totalSupply: number;
    price: number;
    marketCap: number;
  };
  savBTC: {
    totalAssets: number;
    totalSupply: number;
    pricePerShare: number;
    tvl: number;
    apy: number;
    utilization: number;
  };
  prices: Record<string, number>;
}

export class AvantProtocolService {
  private avantService: AvantService;

  constructor() {
    this.avantService = new AvantService();
  }

  async fetchData(): Promise<AvantProtocolData> {
    try {
      const avantData: AvantData = await this.avantService.fetchData();
      
      return {
        protocol: 'AVANT',
        avUSD: avantData.avUSD || {
          totalSupply: 0,
          price: 1.0,
          marketCap: 0
        },
        savUSD: avantData.savUSD || {
          totalAssets: 0,
          totalSupply: 0,
          pricePerShare: 1.0,
          tvl: 0,
          apy: 0,
          utilization: 0
        },
        avUSDx: avantData.avUSDx || {
          totalSupply: 0,
          price: 1.0,
          marketCap: 0
        },
        avBTC: avantData.avBTC || {
          totalSupply: 0,
          price: 0,
          marketCap: 0
        },
        savBTC: avantData.savBTC || {
          totalAssets: 0,
          totalSupply: 0,
          pricePerShare: 1.0,
          tvl: 0,
          apy: 0,
          utilization: 0
        },
        prices: avantData.prices
      };
    } catch (error) {
      console.error('Avant Protocol data fetch failed:', error);
      throw error;
    }
  }
}