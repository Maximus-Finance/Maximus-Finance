import { ProtocolData } from '@/types';

export const protocolData: ProtocolData[] = [
  {
    id: 1,
    name: 'Trader Joe',
    category: 'DEX AMM',
    tvl: '$45.2M',
    apy: '24.5%',
    description: 'Leading decentralized exchange on Avalanche with innovative features and high liquidity.',
    features: ['Automated Market Making', 'Liquidity Mining', 'Yield Farming', 'Cross-chain Support'],
    icon: '🔺'
  },
  {
    id: 2,
    name: 'Benqi',
    category: 'Liquid Staking',
    tvl: '$125.8M',
    apy: '8.2%',
    description: 'Liquid staking protocol allowing users to earn staking rewards while maintaining liquidity.',
    features: ['Liquid Staking', 'Lending & Borrowing', 'Low Risk', 'High TVL'],
    icon: '🏔️'
  },
  {
    id: 3,
    name: 'Aave',
    category: 'Lending',
    tvl: '$89.3M',
    apy: '5.8%',
    description: 'Decentralized lending protocol with institutional-grade security and efficiency.',
    features: ['Flash Loans', 'Variable Rates', 'Collateral Management', 'Risk Assessment'],
    icon: '👻'
  },
  {
    id: 4,
    name: 'Pangolin',
    category: 'DEX',
    tvl: '$12.4M',
    apy: '18.7%',
    description: 'Community-driven DEX focused on providing efficient swaps and yield opportunities.',
    features: ['Token Swaps', 'Liquidity Pools', 'Governance Token', 'Community Driven'],
    icon: '🐧'
  }
];