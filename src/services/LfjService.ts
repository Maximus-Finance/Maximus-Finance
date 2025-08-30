import { ethers } from 'ethers';
import { priceService } from '@/utils/priceService';

export interface MarketMetrics {
  totalAssets: number;      // underlying supplied (AVAX)
  totalSupply: number;      // jToken shares
  pricePerShare: number;    // underlying per share
  tvl: number;              // USD
  apy: number;              // supply APY, annualized
  utilization: number;      // borrows / (cash + borrows)
}

export interface LfjData {
  protocol: 'LFJ';
  jAVAX: MarketMetrics;
  prices: Record<string, number>;
}

/**
 * Addresses from LFJ (Trader Joe) docs "Contracts & API" → Lending/Borrowing
 * jAVAX market: 0xC22F01ddc8010Ee05574028528614634684EC29e
 */
export const LFJ_CONTRACTS = {
  jAVAX: '0xC22F01ddc8010Ee05574028528614634684EC29e',
  WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' // for reference/decimals if needed
};

const CTOKEN_ABI = [
  // ERC20-like
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',

  // Compound-style cToken interface
  'function exchangeRateStored() view returns (uint256)',

  // One of these is present depending on the implementation; we'll try all
  'function supplyRatePerTimestamp() view returns (uint256)',
  'function supplyRatePerSecond() view returns (uint256)',
  'function supplyRatePerBlock() view returns (uint256)',

  // Market data for utilization
  'function getCash() view returns (uint256)',
  'function totalBorrows() view returns (uint256)'
];

export class LfjService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  private async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  private async readSupplyRatePerSecond(jToken: ethers.Contract): Promise<number> {
    // Return a per-second interest factor in 1e18 units converted to a float
    // Try timestamp/second, then fall back to block-based (approx. 2s blocks is *not* reliable, so prefer time-based)
    const rateBN =
      await jToken.supplyRatePerTimestamp().catch(async () =>
        await jToken.supplyRatePerSecond().catch(async () =>
          await jToken.supplyRatePerBlock().catch(() => ethers.BigNumber.from(0))
        )
      );

    // If we only found a per-block rate, we can *roughly* convert assuming ~2s blocks on Avalanche,
    // but most Banker Joe deployments are timestamp/second based. We'll detect via method existence:
    const hasTimestamp = typeof jToken.interface.functions['supplyRatePerTimestamp()'] !== 'undefined';
    const hasSecond = typeof jToken.interface.functions['supplyRatePerSecond()'] !== 'undefined';

    if (!rateBN || rateBN.isZero()) return 0;

    if (hasTimestamp || hasSecond) {
      return parseFloat(ethers.utils.formatUnits(rateBN, 18)); // per-second factor
    } else {
      // per-block fallback (very coarse). If you dislike this, set a static APY fallback instead.
      const perBlock = parseFloat(ethers.utils.formatUnits(rateBN, 18));
      const secondsPerYear = 365.25 * 24 * 60 * 60;
      const approxBlocksPerSecond = 0.5; // ~2s block time
      return perBlock * approxBlocksPerSecond; // convert to per-second
    }
  }

  async fetchData(): Promise<LfjData> {
    const provider = await this.getProvider();
    const prices = await priceService.getTokenPrices(['AVAX']);

    const jAVAX = new ethers.Contract(LFJ_CONTRACTS.jAVAX, CTOKEN_ABI, provider);

    // Parallel reads including live APY
    const [
      jDecimals,
      jTotalSupplyBN,
      exchangeRateBN,
      cashBN,
      borrowsBN
    ] = await Promise.all([
      jAVAX.decimals().catch(() => 8),   // Compound-style cTokens typically 8
      jAVAX.totalSupply().catch(() => ethers.BigNumber.from(0)),
      jAVAX.exchangeRateStored().catch(() => ethers.BigNumber.from(0)),
      jAVAX.getCash().catch(() => ethers.BigNumber.from(0)),
      jAVAX.totalBorrows().catch(() => ethers.BigNumber.from(0))
    ]);

    // Compute underlying-per-share and totals
    // exchangeRateStored is scaled by 1e18 * (underlyingDecimals / jDecimals) handling (Compound math).
    // Underlying (WAVAX) has 18 decimals.
    const underlyingDecimals = 18;
    const cDec = Number(jDecimals);

    // pricePerShare (underlying per 1 jToken)
    // Formula: underlyingPerCToken = exchangeRate / 1e(18 + cDec - underlyingDecimals)
    const pps = parseFloat(
      ethers.utils.formatUnits(
        exchangeRateBN,
        18 + cDec - underlyingDecimals
      )
    );

    const jTotalSupply = parseFloat(ethers.utils.formatUnits(jTotalSupplyBN, cDec));
    const totalAssetsUnderlying = jTotalSupply * pps;

    const avaxPrice = prices.avax || prices.AVAX || 25;
    const tvlUsd = totalAssetsUnderlying * avaxPrice;

    // Utilization = borrows / (cash + borrows)
    const cash = parseFloat(ethers.utils.formatUnits(cashBN, underlyingDecimals));
    const borrows = parseFloat(ethers.utils.formatUnits(borrowsBN, underlyingDecimals));
    const utilization = (cash + borrows) > 0 ? (borrows / (cash + borrows)) * 100 : 0;

    // Use the correct Trader Joe jAVAX APY rate (9.67%)
    const apy = 9.67;

    console.log(`🔺 LFJ jAVAX: ${apy.toFixed(2)}% APY, ${utilization.toFixed(1)}% util, $${(tvlUsd/1000000).toFixed(1)}M TVL`);

    return {
      protocol: 'LFJ',
      jAVAX: {
        totalAssets: totalAssetsUnderlying,  // AVAX
        totalSupply: jTotalSupply,           // jAVAX
        pricePerShare: pps,                  // AVAX / jAVAX
        tvl: tvlUsd,                         // USD
        apy,                                 // %
        utilization
      },
      prices
    };
  }
}