export interface DefiLlamaPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy?: number;
  apyBase?: number;
  apyReward?: number;
  pool: string;
  underlyingTokens?: string[];
  rewardTokens?: string[];
  url?: string;
}

export interface DefiLlamaResponse {
  status: string;
  data: DefiLlamaPool[];
}

export class DefiLlamaService {
  private readonly API_BASE = 'https://yields.llama.fi';

  // Protocol name mappings (DeFiLlama names to user-friendly names)
  private readonly PROTOCOL_MAPPINGS: Record<string, string> = {
    'benqi': 'BENQI',
    'benqi-lending': 'BENQI',
    'benqi-staked-avax': 'BENQI',
    'aave-v3': 'Aave',
    'aave': 'Aave',
    'trader-joe': 'Trader Joe',
    'traderjoe': 'Trader Joe',
    'joe-lend': 'Trader Joe',
    'joe-v2': 'Trader Joe',
    'joe-v2.1': 'Trader Joe',
    'euler': 'Euler',
    'euler-v2': 'Euler',
    'pharaoh': 'Pharaoh',
    'pharaoh-v3': 'Pharaoh',
    'pangolin': 'Pangolin',
    'pangolin-v2': 'Pangolin',
    'silo-finance': 'Silo Finance',
    'silo': 'Silo Finance',
    'silo-v2': 'Silo Finance',
    'gogopool': 'GoGoPool',
    'avant-protocol': 'Avant Finance',
    'avant': 'Avant Finance'
  };

  // Protocols the user wants to track
  private readonly TARGET_PROTOCOLS = [
    'benqi',
    'benqi-lending',
    'benqi-staked-avax',
    'hypha',
    'avant',
    'avant-protocol',
    'aave',
    'aave-v3',
    'trader-joe',
    'traderjoe',
    'joe-lend',
    'joe-v2',
    'joe-v2.1',
    'euler',
    'euler-v2',
    'pharaoh',
    'pharaoh-v3',
    'pangolin',
    'pangolin-v2',
    'silo',
    'silo-finance',
    'silo-v2',
    'gogopool'
  ];

  async fetchAvalanchePools(): Promise<DefiLlamaPool[]> {
    try {
      console.log('🔄 Fetching pools from DeFiLlama...');

      const response = await fetch(`${this.API_BASE}/pools`);

      if (!response.ok) {
        throw new Error(`DeFiLlama API error: ${response.status}`);
      }

      const data = await response.json();
      const pools: DefiLlamaPool[] = data.data || [];

      console.log(`📊 Total pools fetched: ${pools.length}`);

      // Filter for Avalanche chain and target protocols
      const filteredPools = pools.filter(pool => {
        // Check if pool is on Avalanche
        const isAvalanche = pool.chain?.toLowerCase() === 'avalanche';

        // Check if pool belongs to one of our target protocols
        const protocolName = pool.project?.toLowerCase();
        const isTargetProtocol = this.TARGET_PROTOCOLS.some(target =>
          protocolName?.includes(target.toLowerCase())
        );

        // Only filter for Avalanche chain and target protocols
        // User wants all tokens on Avalanche, not just AVAX
        return isAvalanche && isTargetProtocol;
      });

      console.log(`✅ Filtered pools: ${filteredPools.length} Avalanche pools from target protocols`);

      // Sort by TVL descending
      return filteredPools.sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0));
    } catch (error) {
      console.error('❌ Error fetching DeFiLlama data:', error);
      throw error;
    }
  }

  getProtocolDisplayName(protocolSlug: string): string {
    const slug = protocolSlug.toLowerCase();
    return this.PROTOCOL_MAPPINGS[slug] || protocolSlug;
  }

  calculateRiskLevel(apy: number, tvl: number): 'Low' | 'Medium' | 'High' {
    // High APY with low TVL = High risk
    if (apy > 50 || tvl < 500000) return 'High';
    // Medium APY or medium TVL
    if (apy > 20 || tvl < 5000000) return 'Medium';
    // Low APY with high TVL = Low risk
    return 'Low';
  }

  getProtocolIcon(protocolSlug: string): string {
    const slug = protocolSlug.toLowerCase();
    const iconMap: Record<string, string> = {
      'benqi': '🏔️',
      'benqi-lending': '🏔️',
      'benqi-staked-avax': '🏔️',
      'aave': '👻',
      'aave-v3': '👻',
      'trader-joe': '🔺',
      'traderjoe': '🔺',
      'joe-lend': '🔺',
      'joe-v2': '🔺',
      'joe-v2.1': '🔺',
      'euler': '📐',
      'euler-v2': '📐',
      'pharaoh': '🏺',
      'pharaoh-v3': '🏺',
      'pangolin': '🥞',
      'pangolin-v2': '🥞',
      'silo': '🏛️',
      'silo-finance': '🏛️',
      'silo-v2': '🏛️',
      'gogopool': '⚡',
      'avant': '💰',
      'avant-protocol': '💰'
    };
    return iconMap[slug] || '💎';
  }

  getProtocolUrl(protocolSlug: string): string {
    const slug = protocolSlug.toLowerCase();
    const urlMap: Record<string, string> = {
      'benqi': 'https://app.benqi.fi',
      'benqi-lending': 'https://app.benqi.fi',
      'benqi-staked-avax': 'https://app.benqi.fi',
      'aave': 'https://app.aave.com',
      'aave-v3': 'https://app.aave.com',
      'trader-joe': 'https://traderjoexyz.com',
      'traderjoe': 'https://traderjoexyz.com',
      'joe-lend': 'https://traderjoexyz.com',
      'joe-v2': 'https://traderjoexyz.com',
      'joe-v2.1': 'https://traderjoexyz.com',
      'euler': 'https://app.euler.finance',
      'euler-v2': 'https://app.euler.finance',
      'pharaoh': 'https://pharaoh.exchange',
      'pharaoh-v3': 'https://pharaoh.exchange',
      'pangolin': 'https://app.pangolin.exchange',
      'pangolin-v2': 'https://app.pangolin.exchange',
      'silo': 'https://app.silo.finance',
      'silo-finance': 'https://app.silo.finance',
      'silo-v2': 'https://app.silo.finance',
      'gogopool': 'https://app.gogopool.com',
      'avant': 'https://app.avantprotocol.com',
      'avant-protocol': 'https://app.avantprotocol.com'
    };
    return urlMap[slug] || '#';
  }
}
