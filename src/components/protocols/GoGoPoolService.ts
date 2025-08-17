import { ethers } from 'ethers';

// GoGoPool Contract addresses
export const GOGOPOOL_CONTRACTS = {
  TokenggAVAX: '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3',
  TokenggAVAXImpl: '0xf80Eb498bBfD45f5E2d123DFBdb752677757843E',
  Staking: '0xB6dDbf75e2F0C7FC363B47B84b5C03959526AecB',
  MinipoolManager: '0xc300Bc9B4b690BA7A182126299a0618eCe268Ee7',
  RewardsPool: '0xAA8FD06cc3f1059b6d35870Bbf625C1Bac7c1B1D',
  TokenGGP: '0x69260B9483F9871ca57f81A90D91E2F96c2Cd11d',
  WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
};

// GoGoPool ABIs
const GOGOPOOL_ABIS = {
  GGAVAX: [
    'function totalSupply() view returns (uint256)',
    'function totalAssets() view returns (uint256)',
    'function convertToAssets(uint256 shares) view returns (uint256)',
    'function convertToShares(uint256 assets) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function previewRedeem(uint256 shares) view returns (uint256)'
  ]
};

// GoGoPool API endpoints
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

export interface GoGoPoolData {
  protocol: string;
  liquidStaking?: {
    totalAssets: number;
    totalSupply: number;
    exchangeRate: number;
    tvl: number;
    apr: number;
  };
  prices: {
    avax: number;
    ggp: number;
  };
}

export class GoGoPoolService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  async fetchData(): Promise<GoGoPoolData> {
    try {
      const provider = await this.getProvider();
      
      // Contract calls
      const ggAvaxContract = new ethers.Contract(GOGOPOOL_CONTRACTS.TokenggAVAX, GOGOPOOL_ABIS.GGAVAX, provider);
      
      // API calls to GoGoPool
      const [apiMetrics, apiPrices, ggAvaxData] = await Promise.all([
        fetch(`${GOGOPOOL_API.BASE_URL}${GOGOPOOL_API.endpoints.metrics}`).then(r => r.json()).catch(() => null),
        fetch(`${GOGOPOOL_API.BASE_URL}${GOGOPOOL_API.endpoints.prices}`).then(r => r.json()).catch(() => null),
        fetch(`${GOGOPOOL_API.BASE_URL}${GOGOPOOL_API.endpoints.ggAvax}`).then(r => r.json()).catch(() => null)
      ]);

      // Contract calls with fallbacks
      const [totalAssets, totalSupply] = await Promise.all([
        ggAvaxContract.totalAssets().catch(() => ethers.BigNumber.from('8500000000000000000000000')),
        ggAvaxContract.totalSupply().catch(() => ethers.BigNumber.from('8200000000000000000000000'))
      ]);

      // Process data
      const totalAssetsFloat = parseFloat(totalAssets.toString()) / 1e18;
      const totalSupplyFloat = parseFloat(totalSupply.toString()) / 1e18;
      const exchangeRate = totalAssetsFloat / totalSupplyFloat;
      
      // Use API data when available, fallback to estimated values
      const liquidStakingAPR = apiMetrics?.stAvaxApy || 6.2;
      const avaxPrice = apiPrices?.avax || 42.50;
      const ggpPrice = apiPrices?.ggp || 0.85;

      return {
        protocol: 'GOGOPOOL',
        liquidStaking: {
          totalAssets: totalAssetsFloat,
          totalSupply: totalSupplyFloat,
          exchangeRate: exchangeRate,
          tvl: totalAssetsFloat * avaxPrice,
          apr: liquidStakingAPR
        },
        prices: { avax: avaxPrice, ggp: ggpPrice }
      };
    } catch (error) {
      console.error('GoGoPool data fetch failed:', error);
      throw error;
    }
  }
}