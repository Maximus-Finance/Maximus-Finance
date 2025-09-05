import { ethers } from 'ethers';
import { priceService } from '@/utils/priceService';
import { HyphaService } from '@/services/avantAndHyphaService';

export const GOGOPOOL_CONTRACTS = {
  TokenggAVAX: '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3',
  TokenggAVAXImpl: '0xf80Eb498bBfD45f5E2d123DFBdb752677757843E',
  TokenGGP: '0x69260B9483F9871ca57f81A90D91E2F96c2Cd11d',
  WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  
  Staking: '0xB6dDbf75e2F0C7FC363B47B84b5C03959526AecB',
  MinipoolManager: '0xc300Bc9B4b690BA7A182126299a0618eCe268Ee7',
  RewardsPool: '0xAA8FD06cc3f1059b6d35870Bbf625C1Bac7c1B1D',
  ProtocolDAO: '0x70fD1A4419cD4436E4d44744c09F09a743fD1b65',
  Oracle: '0x30fb915258D844E9dC420B2C3AA97420AEA16Db7',
  Vault: '0xd45Cb6F5AcA41AfAAAeBdBE4EFBA49c1bC41E6BA',
  ClaimNodeOp: '0xb42CfaD450B46FDc9cAC5FBF14Bc2e6091AfC35c'
};


export const GOGOPOOL_API = {
  BASE_URL: 'https://api.gogopool.com',
  endpoints: {
    prices: '/prices',
    ggAvax: '/ggAvax',
    validators: '/validators',
    metrics: '/metrics',
    rewards: '/rewards/byStake'
  }
};

export interface MinipoolData {
  address: string;
  nodeID: string;
  avaxLiquidStakerAmt: number;
  avaxNodeOpAmt: number;
  initialStartTime: number;
  startTime: number;
  endTime: number;
  status: number;
}

export interface GoGoPoolData {
  protocol: string;
  liquidStaking?: {
    totalAssets: number;
    totalSupply: number;
    exchangeRate: number;
    tvl: number;
    apr: number;
  };
  ggpStaking?: {
    totalGGPStaked: number;
    stakerCount: number;
    ggpPrice: number;
    stakingAPY: number;
    totalSupply: number;
  };
  minipools: {
    active: number;
    total: number;
    avgAPY: number;
  };
  prices: Record<string, number>;
}

export class GoGoPoolService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  private async fetchWithRetry(url: string, maxRetries: number = 3): Promise<Record<string, unknown>> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Maximus-Finance/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.warn(`GoGoPool API attempt ${i + 1} failed:`, error);
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('All retry attempts failed');
  }

  async fetchData(): Promise<GoGoPoolData> {
    try {
      const prices = await priceService.getTokenPrices(['AVAX', 'GGP']);
      
      const hyphaService = new HyphaService();
      const hyphaData = await hyphaService.fetchData();
      
      const [metricsResponse] = await Promise.allSettled([
        this.fetchWithRetry(`${GOGOPOOL_API.BASE_URL}${GOGOPOOL_API.endpoints.metrics}`)
      ]);

      const metrics = metricsResponse.status === 'fulfilled' ? metricsResponse.value : null;

      const liquidStakingAPR = hyphaData.stAVAX.apy;
      const totalSupply = hyphaData.stAVAX.totalSupply;
      const exchangeRate = hyphaData.stAVAX.avaxPerShare;
      const totalAssets = hyphaData.stAVAX.tvlAVAX;
      const tvl = totalAssets * (prices.avax || 42.50);

      const ggpStakingAPY = Number(metrics?.ggpStakingApy || metrics?.ggpApy || 12.5);
      const totalGGPStaked = Number(metrics?.totalGGPStaked || metrics?.totalGgpStake || 2132657);
      const stakerCount = Number(metrics?.stakerCount || metrics?.totalStakers || 250);

      const activeMinipools = Number(metrics?.activeStakingMinipools || metrics?.activeMinipools || 112); 
      const totalMinipools = Number(metrics?.totalMinipools || (activeMinipools + 20)); 
      const minipoolAPY = Number(metrics?.minipoolApy || liquidStakingAPR);

      return {
        protocol: 'GOGOPOOL',
        liquidStaking: {
          totalAssets,
          totalSupply,
          exchangeRate,
          tvl,
          apr: liquidStakingAPR
        },
        ggpStaking: {
          totalGGPStaked,
          stakerCount,
          ggpPrice: prices.ggp,
          stakingAPY: ggpStakingAPY,
          totalSupply: 22500000 
        },
        minipools: {
          active: activeMinipools,
          total: totalMinipools,
          avgAPY: minipoolAPY
        },
        prices
      };
    } catch (error) {
      console.error('GoGoPool data fetch failed:', error);
      throw error;
    }
  }
}