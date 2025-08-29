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
          url: 'https://app.benqi.fi/stake',
          isLive: true,
          features: ['Liquid', 'No Lock-up', 'Validator Rewards']
        });
      }

      // BENQI Lending Markets - All available pairs
      if (data.benqi.lendingMarkets) {
        data.benqi.lendingMarkets.forEach((market) => {
          if (market.tvl > 100000) { // Only show markets with >$100k TVL
            opportunities.push({
              id: `benqi-${market.symbol.toLowerCase()}`,
              protocol: 'BENQI',
              category: 'Lending',
              pair: `${market.underlyingSymbol} (Supply)`,
              apy: `${Math.max(market.supplyAPY, 0).toFixed(2)}%`,
              tvl: `$${(market.tvl / 1000000).toFixed(1)}M`,
              risk: market.utilization > 80 ? 'High' : market.utilization > 50 ? 'Medium' : 'Low',
              icon: '🔥',
              url: 'https://app.benqi.fi/lending',
              isLive: true,
              features: [
                'Lending', 
                `${market.utilization.toFixed(1)}% Utilization`,
                market.underlyingSymbol.includes('USD') ? 'Stablecoin' : 'Volatile Asset'
              ]
            });

            // Add borrowing opportunity if there's significant borrow APY
            if (market.borrowAPY > 0.1) {
              opportunities.push({
                id: `benqi-${market.symbol.toLowerCase()}-borrow`,
                protocol: 'BENQI',
                category: 'Borrowing',
                pair: `${market.underlyingSymbol} (Borrow)`,
                apy: `${market.borrowAPY.toFixed(2)}%`,
                tvl: `$${(market.totalBorrows * (data.benqi?.prices[market.underlyingSymbol.toLowerCase().replace('.e', '').replace('.b', '')] || 1) / 1000000).toFixed(1)}M`,
                risk: market.utilization > 80 ? 'High' : market.utilization > 50 ? 'Medium' : 'Low',
                icon: '🔥',
                url: 'https://app.benqi.fi/lending',
                isLive: true,
                features: [
                  'Borrowing', 
                  'Variable Rate',
                  `${market.utilization.toFixed(1)}% Utilization`
                ]
              });
            }
          }
        });
      }
    }

    // Format GoGoPool data
    if (data.gogopool) {
      // GoGoPool Liquid Staking
      if (data.gogopool.liquidStaking) {
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

      // GoGoPool GGP Staking
      if (data.gogopool.ggpStaking) {
        opportunities.push({
          id: 'gogopool-ggp-staking',
          protocol: 'GoGoPool',
          category: 'Token Staking',
          pair: 'GGP Staking',
          apy: `${data.gogopool.ggpStaking.stakingAPY.toFixed(2)}%`,
          tvl: `$${(data.gogopool.ggpStaking.totalGGPStaked * data.gogopool.ggpStaking.ggpPrice / 1000000).toFixed(1)}M`,
          risk: 'Medium',
          icon: '⚡',
          url: 'https://www.gogopool.com/stake',
          isLive: true,
          features: ['GGP Rewards', 'Minipool Collateral', 'Protocol Governance']
        });
      }

      // Minipool Operations
      if (data.gogopool.minipools) {
        opportunities.push({
          id: 'gogopool-minipool',
          protocol: 'GoGoPool',
          category: 'Validator Staking',
          pair: 'Minipool Validation',
          apy: `${data.gogopool.minipools.avgAPY.toFixed(2)}%`,
          tvl: `$${(data.gogopool.minipools.active * 1000 * data.gogopool.prices.avax / 1000000).toFixed(1)}M`,
          risk: 'Medium',
          icon: '⚡',
          url: 'https://www.gogopool.com/minipool',
          isLive: true,
          features: ['Validator Rewards', '1000 AVAX Required', 'Hardware Operation']
        });
      }
    }

    // Format Avant data
    if (data.avant) {
      // Avant savUSD Vault Staking
      if (data.avant.savUSD) {
        opportunities.push({
          id: 'avant-savusd',
          protocol: 'Avant Finance',
          category: 'Yield Farming',
          pair: 'avUSD → savUSD',
          apy: `${data.avant.savUSD.apy.toFixed(2)}%`,
          tvl: `$${(data.avant.savUSD.tvl / 1000000).toFixed(1)}M`,
          risk: 'Low',
          icon: '💰',
          url: 'https://app.avantprotocol.com',
          isLive: true,
          features: ['ERC-4626 Vault', 'Delta-Neutral Strategy', '1-day Cooldown']
        });
      }

      // Avant savBTC Vault Staking
      if (data.avant.savBTC) {
        opportunities.push({
          id: 'avant-savbtc',
          protocol: 'Avant Finance',
          category: 'Yield Farming',
          pair: 'avBTC → savBTC',
          apy: `${data.avant.savBTC.apy.toFixed(2)}%`,
          tvl: `$${(data.avant.savBTC.tvl / 1000000).toFixed(1)}M`,
          risk: 'Medium',
          icon: '₿',
          url: 'https://app.avantprotocol.com',
          isLive: true,
          features: ['Bitcoin Yield', 'ERC-4626 Vault', 'Delta-Neutral Strategy']
        });
      }

      // Avant avUSDx Token
      if (data.avant.avUSDx) {
        opportunities.push({
          id: 'avant-avusdx',
          protocol: 'Avant Finance',
          category: 'Lending',
          pair: 'avUSDx',
          apy: '4.50%', // Base stable yield
          tvl: `$${(data.avant.avUSDx.marketCap / 1000000).toFixed(1)}M`,
          risk: 'Low',
          icon: '💎',
          url: 'https://app.avantprotocol.com',
          isLive: true,
          features: ['Stable Token', 'Cross-Chain', 'Yield-Bearing']
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
      
      // Liquid Staking TVL and APY
      if (data.benqi.liquidStaking) {
        totalTVL += data.benqi.liquidStaking.tvl;
        totalAPY += data.benqi.liquidStaking.apr;
        apyCount++;
      }
      
      // All lending markets TVL and APY
      if (data.benqi.lendingMarkets) {
        data.benqi.lendingMarkets.forEach(market => {
          if (market.tvl > 100000) { // Only count significant markets
            totalTVL += market.tvl;
            if (market.supplyAPY > 0) {
              totalAPY += market.supplyAPY;
              apyCount++;
            }
          }
        });
      }
    }

    if (data.gogopool) {
      activeProtocols++;
      
      if (data.gogopool.liquidStaking) {
        totalTVL += data.gogopool.liquidStaking.tvl;
        totalAPY += data.gogopool.liquidStaking.apr;
        apyCount++;
      }
      
      if (data.gogopool.ggpStaking) {
        totalTVL += data.gogopool.ggpStaking.totalGGPStaked * data.gogopool.ggpStaking.ggpPrice;
        totalAPY += data.gogopool.ggpStaking.stakingAPY;
        apyCount++;
      }
      
      if (data.gogopool.minipools) {
        totalTVL += data.gogopool.minipools.active * 1000 * data.gogopool.prices.avax;
        totalAPY += data.gogopool.minipools.avgAPY;
        apyCount++;
      }
    }

    if (data.avant) {
      activeProtocols++;
      
      if (data.avant.savUSD) {
        totalTVL += data.avant.savUSD.tvl;
        totalAPY += data.avant.savUSD.apy;
        apyCount++;
      }
      
      if (data.avant.savBTC) {
        totalTVL += data.avant.savBTC.tvl;
        totalAPY += data.avant.savBTC.apy;
        apyCount++;
      }
      
      if (data.avant.avUSDx) {
        totalTVL += data.avant.avUSDx.marketCap;
        totalAPY += 4.50; // Base stable yield
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