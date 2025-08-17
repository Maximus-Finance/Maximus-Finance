import { BenqiService, BenqiData } from './BenqiService';
import { GoGoPoolService, GoGoPoolData } from './GoGoPoolService';
import { AvantService, AvantData } from './AvantService';

export interface YieldOpportunity {
  id: string;
  protocol: string;
  category: string;
  pair: string;
  apy: string;
  tvl: string;
  risk: 'Low' | 'Medium' | 'High';
  icon: string;
  url: string;
  isLive: boolean;
  features?: string[];
}

export interface AggregatedData {
  benqi?: BenqiData;
  gogopool?: GoGoPoolData;
  avant?: AvantData;
  lastUpdated: Date;
}

export class ProtocolAggregator {
  private benqiService: BenqiService;
  private gogoPoolService: GoGoPoolService;
  private avantService: AvantService;

  constructor() {
    this.benqiService = new BenqiService();
    this.gogoPoolService = new GoGoPoolService();
    this.avantService = new AvantService();
  }

  async fetchAllProtocolData(): Promise<AggregatedData> {
    const [benqiData, gogopoolData, avantData] = await Promise.allSettled([
      this.benqiService.fetchData(),
      this.gogoPoolService.fetchData(),
      this.avantService.fetchData()
    ]);

    const result: AggregatedData = {
      lastUpdated: new Date()
    };

    if (benqiData.status === 'fulfilled') {
      result.benqi = benqiData.value;
    }
    if (gogopoolData.status === 'fulfilled') {
      result.gogopool = gogopoolData.value;
    }
    if (avantData.status === 'fulfilled') {
      result.avant = avantData.value;
    }

    return result;
  }

  formatToYieldOpportunities(data: AggregatedData): YieldOpportunity[] {
    const opportunities: YieldOpportunity[] = [];

    // Format BENQI data
    if (data.benqi) {
      // BENQI Liquid Staking
      if (data.benqi.liquidStaking) {
        opportunities.push({
          id: 'benqi-savax',
          protocol: 'BENQI',
          category: 'Liquid Staking',
          pair: 'AVAX → sAVAX',
          apy: `${data.benqi.liquidStaking.apr.toFixed(2)}%`,
          tvl: `$${(data.benqi.liquidStaking.tvl / 1000000).toFixed(1)}M`,
          risk: 'Low',
          icon: '🔥',
          url: 'https://benqi.fi/stake',
          isLive: true,
          features: ['Liquid', 'No Lock-up', 'Validator Rewards']
        });
      }

      // BENQI AVAX Lending
      if (data.benqi.avaxLending) {
        opportunities.push({
          id: 'benqi-avax-lending',
          protocol: 'BENQI',
          category: 'Borrowing',
          pair: 'AVAX',
          apy: `${Math.max(data.benqi.avaxLending.apy, 0).toFixed(2)}%`,
          tvl: `$${(data.benqi.avaxLending.tvl / 1000000).toFixed(1)}M`,
          risk: data.benqi.avaxLending.utilization > 80 ? 'High' : data.benqi.avaxLending.utilization > 50 ? 'Medium' : 'Low',
          icon: '🔥',
          url: 'https://benqi.fi/lend',
          isLive: true,
          features: ['Borrowing', 'Collateral', 'Variable APY']
        });
      }

      // BENQI USDC Lending
      if (data.benqi.usdcLending) {
        opportunities.push({
          id: 'benqi-usdc-lending',
          protocol: 'BENQI',
          category: 'Borrowing',
          pair: 'USDC',
          apy: `${Math.max(data.benqi.usdcLending.apy, 0).toFixed(2)}%`,
          tvl: `$${(data.benqi.usdcLending.tvl / 1000000).toFixed(1)}M`,
          risk: 'Low',
          icon: '🔥',
          url: 'https://benqi.fi/lend',
          isLive: true,
          features: ['Stable Asset', 'Borrowing', 'Low Risk']
        });
      }
    }

    // Format GoGoPool data
    if (data.gogopool?.liquidStaking) {
      opportunities.push({
        id: 'gogopool-ggavax',
        protocol: 'GoGoPool',
        category: 'Liquid Staking',
        pair: 'AVAX → ggAVAX',
        apy: `${data.gogopool.liquidStaking.apr.toFixed(2)}%`,
        tvl: `$${(data.gogopool.liquidStaking.tvl / 1000000).toFixed(1)}M`,
        risk: 'Low',
        icon: '⚡',
        url: 'https://www.gogopool.com/stake',
        isLive: true,
        features: ['Minipool Network', 'Decentralized', 'Node Operators']
      });
    }

    // Format Avant data
    if (data.avant) {
      // Avant USD Staking
      if (data.avant.usdStaking) {
        opportunities.push({
          id: 'avant-usd',
          protocol: 'Avant Finance',
          category: 'Yield Farming',
          pair: 'USD → avUSD',
          apy: `${data.avant.usdStaking.apy.toFixed(2)}%`,
          tvl: `$${(data.avant.usdStaking.tvl / 1000000).toFixed(1)}M`,
          risk: 'Low',
          icon: '💰',
          url: 'https://avant.fi',
          isLive: true,
          features: ['Stablecoin Yield', 'USD Denominated', 'Low Risk']
        });
      }

      // Avant AVAX Yield
      if (data.avant.avaxYield) {
        opportunities.push({
          id: 'avant-avax',
          protocol: 'Avant Finance',
          category: 'Yield Farming',
          pair: 'AVAX → avAVAX',
          apy: `${data.avant.avaxYield.apy.toFixed(2)}%`,
          tvl: `$${(data.avant.avaxYield.tvl / 1000000).toFixed(1)}M`,
          risk: 'Medium',
          icon: '🌟',
          url: 'https://avant.fi',
          isLive: true,
          features: ['AVAX Yield', 'Optimized Returns', 'Auto-Compounding']
        });
      }
    }

    return opportunities;
  }

  calculateTotalMetrics(data: AggregatedData): { totalTVL: number; averageAPY: number; activeProtocols: number } {
    let totalTVL = 0;
    let totalAPY = 0;
    let apyCount = 0;
    let activeProtocols = 0;

    if (data.benqi) {
      activeProtocols++;
      if (data.benqi.liquidStaking) {
        totalTVL += data.benqi.liquidStaking.tvl;
        totalAPY += data.benqi.liquidStaking.apr;
        apyCount++;
      }
      if (data.benqi.avaxLending) {
        totalTVL += data.benqi.avaxLending.tvl;
        totalAPY += data.benqi.avaxLending.apy;
        apyCount++;
      }
      if (data.benqi.usdcLending) {
        totalTVL += data.benqi.usdcLending.tvl;
        totalAPY += data.benqi.usdcLending.apy;
        apyCount++;
      }
    }

    if (data.gogopool?.liquidStaking) {
      activeProtocols++;
      totalTVL += data.gogopool.liquidStaking.tvl;
      totalAPY += data.gogopool.liquidStaking.apr;
      apyCount++;
    }

    if (data.avant) {
      activeProtocols++;
      if (data.avant.usdStaking) {
        totalTVL += data.avant.usdStaking.tvl;
        totalAPY += data.avant.usdStaking.apy;
        apyCount++;
      }
      if (data.avant.avaxYield) {
        totalTVL += data.avant.avaxYield.tvl;
        totalAPY += data.avant.avaxYield.apy;
        apyCount++;
      }
    }

    const averageAPY = apyCount > 0 ? totalAPY / apyCount : 0;

    return {
      totalTVL,
      averageAPY,
      activeProtocols
    };
  }
}