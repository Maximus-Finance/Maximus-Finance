export const SITE_CONFIG = {
    name: 'Maximus Finance',
    description: 'Maximize Your Avalanche Yields — Instantly, Intelligently, Effortlessly',
    url: 'https://maximus.finance',
    creator: 'Maximus Finance Team',
  };
  
  export const SOCIAL_LINKS = {
    twitter: 'https://twitter.com/maximusfinance',
    discord: 'https://discord.gg/maximusfinance',
    github: 'https://github.com/maximusfinance',
    docs: 'https://docs.maximus.finance',
  };
  
  export const API_ENDPOINTS = {
    yields: '/api/yields',
    protocols: '/api/protocols',
    stats: '/api/stats',
  };
  
  export const FILTER_OPTIONS = [
    'All',
    'Liquid Staking',
    'Borrowing',
    'DEX AMM',
    'LP',
    'Yield Farming',
    'Auto-Compound'
  ];
  
  export const RISK_LEVELS = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  } as const;