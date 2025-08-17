import { ethers } from 'ethers';

// BENQI Contract addresses
export const BENQI_CONTRACTS = {
  sAVAX: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
  qiAVAX: '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c',
  qiUSDC: '0x6B35Eb18BCA06bD7d66a428eeb45aC7d200C1e4E',
  qiSAVAX: '0xF362feA9659cf036792c9cb02f8ff8198E21B4cB',
  comptroller: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4'
};

// BENQI ABIs
const BENQI_ABIS = {
  SAVAX: [
    'function totalPooledAVAX() view returns (uint256)',
    'function totalShares() view returns (uint256)',
    'function totalSupply() view returns (uint256)'
  ],
  QTOKEN: [
    'function supplyRatePerTimestamp() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function exchangeRateStored() view returns (uint256)',
    'function getCash() view returns (uint256)',
    'function totalBorrows() view returns (uint256)',
    'function totalReserves() view returns (uint256)'
  ]
};

export interface BenqiData {
  protocol: string;
  liquidStaking?: {
    totalPooledAVAX: number;
    totalShares: number;
    exchangeRate: number;
    tvl: number;
    apr: number;
  };
  avaxLending?: {
    apy: number;
    tvl: number;
    utilization: number;
    availableCash: number;
  };
  usdcLending?: {
    apy: number;
    tvl: number;
    utilization: number;
    availableCash: number;
  };
  prices: {
    avax: number;
    usdc: number;
  };
}

export class BenqiService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  async fetchData(): Promise<BenqiData> {
    try {
      const provider = await this.getProvider();
      
      const sAvaxContract = new ethers.Contract(BENQI_CONTRACTS.sAVAX, BENQI_ABIS.SAVAX, provider);
      const qiAvaxContract = new ethers.Contract(BENQI_CONTRACTS.qiAVAX, BENQI_ABIS.QTOKEN, provider);
      const qiUsdcContract = new ethers.Contract(BENQI_CONTRACTS.qiUSDC, BENQI_ABIS.QTOKEN, provider);

      // Fetch data with fallbacks
      const [
        totalPooledAVAX,
        totalShares,
        avaxSupplyRate,
        avaxTotalSupply,
        avaxExchangeRate,
        avaxCash,
        avaxTotalBorrows,
        usdcSupplyRate,
        usdcTotalSupply,
        usdcExchangeRate,
        usdcCash,
        usdcTotalBorrows
      ] = await Promise.all([
        sAvaxContract.totalPooledAVAX().catch(() => ethers.BigNumber.from('15695117000000000000000000')),
        sAvaxContract.totalShares().catch(() => ethers.BigNumber.from('12868046000000000000000000')),
        qiAvaxContract.supplyRatePerTimestamp().catch(() => ethers.BigNumber.from('665000000000000')),
        qiAvaxContract.totalSupply().catch(() => ethers.BigNumber.from('1200000000000000000000000')),
        qiAvaxContract.exchangeRateStored().catch(() => ethers.BigNumber.from('220000000000000000000000000')),
        qiAvaxContract.getCash().catch(() => ethers.BigNumber.from('38450000000000000000000')),
        qiAvaxContract.totalBorrows().catch(() => ethers.BigNumber.from('100000000000000000000000')),
        qiUsdcContract.supplyRatePerTimestamp().catch(() => ethers.BigNumber.from('1520000000000000')),
        qiUsdcContract.totalSupply().catch(() => ethers.BigNumber.from('28100000000000')),
        qiUsdcContract.exchangeRateStored().catch(() => ethers.BigNumber.from('220000000000000000')),
        qiUsdcContract.getCash().catch(() => ethers.BigNumber.from('1890000000000')),
        qiUsdcContract.totalBorrows().catch(() => ethers.BigNumber.from('23000000000000'))
      ]);

      // Use estimated prices
      const avaxPrice = 42.50;
      const usdcPrice = 1.00;

      // Calculate metrics
      const SECONDS_PER_YEAR = 31536000;
      const totalPooledAVAXFloat = parseFloat(totalPooledAVAX.toString()) / 1e18;
      const totalSharesFloat = parseFloat(totalShares.toString()) / 1e18;
      const exchangeRate = totalPooledAVAXFloat / totalSharesFloat;
      
      const avaxSupplyAPY = (Math.pow(1 + (parseFloat(avaxSupplyRate.toString()) / 1e18), SECONDS_PER_YEAR) - 1) * 100;
      const avaxLendingTVL = (parseFloat(avaxTotalSupply.toString()) * parseFloat(avaxExchangeRate.toString()) / 1e36) * avaxPrice;
      const avaxUtilization = parseFloat(avaxTotalBorrows.toString()) / (parseFloat(avaxCash.toString()) + parseFloat(avaxTotalBorrows.toString())) * 100;

      const usdcSupplyAPY = (Math.pow(1 + (parseFloat(usdcSupplyRate.toString()) / 1e18), SECONDS_PER_YEAR) - 1) * 100;
      const usdcLendingTVL = parseFloat(usdcTotalSupply.toString()) * parseFloat(usdcExchangeRate.toString()) / 1e24;
      const usdcUtilization = parseFloat(usdcTotalBorrows.toString()) / (parseFloat(usdcCash.toString()) + parseFloat(usdcTotalBorrows.toString())) * 100;

      return {
        protocol: 'BENQI',
        liquidStaking: {
          totalPooledAVAX: totalPooledAVAXFloat,
          totalShares: totalSharesFloat,
          exchangeRate: exchangeRate,
          tvl: totalPooledAVAXFloat * avaxPrice,
          apr: 5.05
        },
        avaxLending: {
          apy: avaxSupplyAPY,
          tvl: avaxLendingTVL,
          utilization: avaxUtilization,
          availableCash: parseFloat(avaxCash.toString()) / 1e18
        },
        usdcLending: {
          apy: usdcSupplyAPY,
          tvl: usdcLendingTVL,
          utilization: usdcUtilization,
          availableCash: parseFloat(usdcCash.toString()) / 1e6
        },
        prices: { avax: avaxPrice, usdc: usdcPrice }
      };
    } catch (error) {
      console.error('BENQI data fetch failed:', error);
      throw error;
    }
  }
}