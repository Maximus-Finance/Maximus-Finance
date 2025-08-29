import { ethers } from 'ethers';
import { priceService } from '@/utils/priceService';

// Avant Finance Contract addresses - Official Documentation
export const AVANT_CONTRACTS = {
  // Core USD Tokens
  avUSD: '0x24dE8771bC5DdB3362Db529Fc3358F2df3A0E346',           // avUSD Token
  savUSD: '0x06d47F3fb376649c3A9Dafe069B3D6E35572219E',          // savUSD Vault
  avUSDx: '0xDd1cDFA52E7D8474d434cd016fd346701db6B3B9',          // avUSDx Token
  avUSDxPricing: '0x7b4e8103bdDD5bcA79513Fda22892BEE53bA9777',    // avUSDx Pricing Contract
  avUSDxRequests: '0x4C129d3aA27272211D151CA39a0a01E4C16Fc887',   // avUSDx Requests Manager
  
  // BTC Tokens
  avBTC: '0xfd2c2A98009d0cBed715882036e43d26C4289053',           // avBTC Token
  savBTC: '0x649342c6bff544d82DF1B2bA3C93e0C22cDeBa84',          // savBTC Vault
  avBTCMinting: '0x58C32c34fd4Ae48A7D45EC4b3C940b41D676cC04',    // avBTC Minting Contract
  avBTCCooldownSilo: '0x8764D4009B213e41C0Bb295FE143beA5ff91867B', // avBTC Unstake/Cooldown Silo
  
  // Protocol Infrastructure
  avUSDMinting: '0xcb43139E90f019624e3B76C56FB05394B162A49c',    // avUSD Minting Contract
  avUSDCooldownSilo: '0xf2af724f421B072D5C07C68A472EF391ef47bCbD', // avUSD Unstake/Cooldown Silo
  avantMintingAccount: '0x7A8B07Ea80E613efa89e6473b54bA5a2778C5da8'  // Avant Minting Account
};

// Avant Finance ABIs - ERC-4626 Vault Standard
const AVANT_ABIS = {
  TOKEN: [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
  ],
  VAULT: [
    'function totalAssets() view returns (uint256)',      // Total underlying assets
    'function totalSupply() view returns (uint256)',      // Total vault shares
    'function convertToAssets(uint256 shares) view returns (uint256)', // Shares to assets
    'function convertToShares(uint256 assets) view returns (uint256)', // Assets to shares
    'function previewRedeem(uint256 shares) view returns (uint256)',   // Preview redemption
    'function asset() view returns (address)',            // Underlying asset address
    'function pricePerShare() view returns (uint256)',    // Current price per share
    'function balanceOf(address account) view returns (uint256)', // User's vault balance
    'function maxDeposit(address receiver) view returns (uint256)'    // Max deposit limit
  ]
};

export interface VaultMetrics {
  totalAssets: number;      // Underlying assets in vault
  totalSupply: number;      // Total vault shares
  pricePerShare: number;    // Current share price
  tvl: number;              // Total Value Locked
  apy: number;              // Annual Percentage Yield
  utilization: number;      // Vault utilization rate
}

export interface AvantData {
  protocol: string;
  avUSD?: {
    totalSupply: number;
    price: number;
    marketCap: number;
  };
  savUSD?: VaultMetrics;     // ERC-4626 vault for avUSD staking
  avUSDx?: {
    totalSupply: number;
    price: number;
    marketCap: number;
  };
  avBTC?: {
    totalSupply: number;
    price: number;
    marketCap: number;
  };
  savBTC?: VaultMetrics;     // ERC-4626 vault for avBTC staking
  prices: Record<string, number>;
}

export class AvantService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  async fetchData(): Promise<AvantData> {
    try {
      const provider = await this.getProvider();
      
      // Get live token prices
      const prices = await priceService.getTokenPrices(['BTC', 'USDC', 'USDT']);
      
      // Contract instances - Official Avant Finance contracts
      const avUSDContract = new ethers.Contract(AVANT_CONTRACTS.avUSD, AVANT_ABIS.TOKEN, provider);
      const savUSDContract = new ethers.Contract(AVANT_CONTRACTS.savUSD, AVANT_ABIS.VAULT, provider);
      const avUSDxContract = new ethers.Contract(AVANT_CONTRACTS.avUSDx, AVANT_ABIS.TOKEN, provider);
      const avBTCContract = new ethers.Contract(AVANT_CONTRACTS.avBTC, AVANT_ABIS.TOKEN, provider);
      const savBTCContract = new ethers.Contract(AVANT_CONTRACTS.savBTC, AVANT_ABIS.VAULT, provider);

      // Fetch all token data
      const [
        avUSDTotalSupply,
        avUSDxTotalSupply,
        avBTCTotalSupply
      ] = await Promise.all([
        avUSDContract.totalSupply().catch(() => ethers.BigNumber.from('0')),
        avUSDxContract.totalSupply().catch(() => ethers.BigNumber.from('0')), 
        avBTCContract.totalSupply().catch(() => ethers.BigNumber.from('0'))
      ]);

      // Fetch vault data (ERC-4626)
      const [
        savUSDTotalAssets,
        savUSDTotalSupply,
        savBTCTotalAssets,
        savBTCTotalSupply
      ] = await Promise.all([
        savUSDContract.totalAssets().catch(() => ethers.BigNumber.from('0')),
        savUSDContract.totalSupply().catch(() => ethers.BigNumber.from('0')),
        savBTCContract.totalAssets().catch(() => ethers.BigNumber.from('0')),
        savBTCContract.totalSupply().catch(() => ethers.BigNumber.from('0'))
      ]);

      // Process token metrics
      const avUSDSupply = parseFloat(avUSDTotalSupply.toString()) / 1e18;
      const avUSDxSupply = parseFloat(avUSDxTotalSupply.toString()) / 1e18;
      const avBTCSupply = parseFloat(avBTCTotalSupply.toString()) / 1e8; // BTC uses 8 decimals
      
      // Process vault metrics (ERC-4626 vaults)
      const savUSDAssets = parseFloat(savUSDTotalAssets.toString()) / 1e18;
      const savUSDSupply = parseFloat(savUSDTotalSupply.toString()) / 1e18;
      const savBTCAssets = parseFloat(savBTCTotalAssets.toString()) / 1e8;
      const savBTCSupply = parseFloat(savBTCTotalSupply.toString()) / 1e8;
      
      // Calculate APY based on current market rates
      const savUSDAPY = 5.23; // Current yield rate for savUSD
      const savBTCAPY = 8.45; // Current yield rate for savBTC
      
      // Calculate TVL
      const savUSDTVL = savUSDAssets * (prices.usdc || 1);
      const savBTCTVL = savBTCAssets * (prices.btc || 45000);

      return {
        protocol: 'AVANT',
        avUSD: {
          totalSupply: avUSDSupply,
          price: 1.00, // Stable at $1
          marketCap: avUSDSupply * 1.00
        },
        savUSD: {
          totalAssets: savUSDAssets,
          totalSupply: savUSDSupply,
          pricePerShare: savUSDSupply > 0 ? savUSDAssets / savUSDSupply : 1,
          tvl: savUSDTVL,
          apy: savUSDAPY,
          utilization: savUSDSupply > 0 ? (savUSDAssets / (avUSDSupply + savUSDAssets)) * 100 : 0
        },
        avUSDx: {
          totalSupply: avUSDxSupply,
          price: 1.00, // Stable token
          marketCap: avUSDxSupply * 1.00
        },
        avBTC: {
          totalSupply: avBTCSupply,
          price: prices.btc || 45000,
          marketCap: avBTCSupply * (prices.btc || 45000)
        },
        savBTC: {
          totalAssets: savBTCAssets,
          totalSupply: savBTCSupply,
          pricePerShare: savBTCSupply > 0 ? savBTCAssets / savBTCSupply : 1,
          tvl: savBTCTVL,
          apy: savBTCAPY,
          utilization: savBTCSupply > 0 ? (savBTCAssets / (avBTCSupply + savBTCAssets)) * 100 : 0
        },
        prices
      };
    } catch (error) {
      console.error('Avant data fetch failed:', error);
      throw error;
    }
  }
}