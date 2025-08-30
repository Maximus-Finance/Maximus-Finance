// src/services/avantAndHyphaService.ts
import { ethers } from 'ethers';
// import fetch from 'cross-fetch'; // <- uncomment if you run on Node < 18

// ---------- Official contract addresses ----------
export const AVANT_CONTRACTS = {
  // Core USD Tokens
  avUSD: '0x24dE8771bC5DdB3362Db529Fc3358F2df3A0E346',
  savUSD: '0x06d47F3fb376649c3A9Dafe069B3D6E35572219E',
  avUSDx: '0xDd1cDFA52E7D8474d434cd016fd346701db6B3B9',
  avUSDxPricing: '0x7b4e8103bdDD5bcA79513Fda22892BEE53bA9777',
  avUSDxRequests: '0x4C129d3aA27272211D151CA39a0a01E4C16Fc887',

  // BTC Tokens
  avBTC: '0xfd2c2A98009d0cBed715882036e43d26C4289053',
  savBTC: '0x649342c6bff544d82DF1B2bA3C93e0C22cDeBa84',
  avBTCMinting: '0x58C32c34fd4Ae48A7D45EC4b3C940b41D676cC04',
  avBTCCooldownSilo: '0x8764D4009B213e41C0Bb295FE143beA5ff91867B',

  // Protocol Infrastructure
  avUSDMinting: '0xcb43139E90f019624e3B76C56FB05394B162A49c',
  avUSDCooldownSilo: '0xf2af724f421B072D5C07C68A472EF391ef47bCbD',
  avantMintingAccount: '0x7A8B07Ea80E613efa89e6473b54bA5a2778C5da8'
};

// Hypha / GoGoPool (ggAVAX → stAVAX) token address (Avalanche C-Chain)
export const HYPHA = {
  stAVAX: '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3', // a.k.a. ggAVAX
  WAVAX:  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'  // likely underlying asset
};

// ---------- Minimal ABIs ----------
const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

const ERC4626_ABI = [
  'function totalAssets() view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
  'function asset() view returns (address)'
];

// Optional convenience (some vaults expose it)
const OPTIONAL_PRICE_PER_SHARE_ABI = [
  'function pricePerShare() view returns (uint256)'
];

export interface VaultMetrics {
  totalAssets: number;
  totalSupply: number;
  pricePerShare: number; // assets per 1 share
  tvl: number;
  apy: number;
  utilization: number;
}

export interface AvantData {
  protocol: 'AVANT';
  avUSD?: { totalSupply: number; price: number; marketCap: number; };
  savUSD?: VaultMetrics;
  avUSDx?: { totalSupply: number; price: number; marketCap: number; };
  avBTC?: { totalSupply: number; price: number; marketCap: number; };
  savBTC?: VaultMetrics;
  prices: Record<string, number>;
}

export interface HyphaData {
  protocol: 'HYPHA';
  stAVAX: {
    totalSupply: number;
    avaxPerShare: number;  // exchange rate (assets/shares)
    apy: number;           // derived or from API fallback
    tvlAVAX: number;       // totalAssets in AVAX (if on-chain available)
  };
}

// API response interfaces
interface AvantApiResponse {
  savUSD?: { apy?: number; };
  savBTC?: { apy?: number; };
}

interface HyphaApiResponse {
  stAvaAPR?: number;
  stAvaAPY?: number;
  apy?: number;
}

// ---------- Small price helper ----------
async function getTokenPrices(): Promise<Record<string, number>> {
  // Simple Coingecko fetch; stablecoins ~1.00 by default
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2,bitcoin,usd-coin,tether&vs_currencies=usd';
    const r = await fetch(url);
    const j = await r.json();
    return {
      AVAX: j['avalanche-2']?.usd ?? 0,
      BTC:  j['bitcoin']?.usd ?? 0,
      USDC: j['usd-coin']?.usd ?? 1,
      USDT: j['tether']?.usd ?? 1
    };
  } catch {
    return { AVAX: 0, BTC: 0, USDC: 1, USDT: 1 };
  }
}

// ---------- Block time helpers (Avalanche C-Chain) ----------
async function findNearestBlockByTimestamp(
  provider: ethers.providers.JsonRpcProvider,
  targetTs: number,
  guessWindow = 120_000 // ~2 days worth at ~2s blocks
): Promise<number> {
  const latest = await provider.getBlock('latest');
  const latestTs = latest.timestamp;
  const latestNum = latest.number;

  // Rough guess using ~2s block time
  const approx = Math.max(0, latestNum - Math.floor((latestTs - targetTs) / 2));
  let low = Math.max(0, approx - guessWindow);
  let high = Math.min(latestNum, approx + guessWindow);

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const bm = await provider.getBlock(mid);
    if (!bm) { high = mid - 1; continue; }
    if (bm.timestamp === targetTs) return mid;
    if (bm.timestamp < targetTs) low = mid + 1;
    else high = mid - 1;
  }
  return Math.max(0, Math.min(low, latestNum));
}

async function readRateAtBlock(
  provider: ethers.providers.JsonRpcProvider,
  vaultAddr: string,
  shareDecimals?: number,
  assetDecimals?: number,
  blockTag?: number
): Promise<{ rate: number; totalAssets?: number; totalSupply?: number; }> {
  const erc20 = new ethers.Contract(vaultAddr, ERC20_ABI, provider);

  // Determine decimals via on-chain if not provided
  const shareDec = shareDecimals ?? (await erc20.decimals().catch(() => 18));

  // Try ERC-4626 path
  const vault = new ethers.Contract(vaultAddr, ERC4626_ABI, provider);
  let assetsDec = assetDecimals;
  try {
    if (!assetsDec) {
      const underlying = await vault.asset({ blockTag }).catch(() => HYPHA.WAVAX);
      const underlyingErc20 = new ethers.Contract(underlying, ERC20_ABI, provider);
      assetsDec = await underlyingErc20.decimals({ blockTag }).catch(() => 18);
    }
  } catch {
    assetsDec = assetsDec ?? 18;
  }

  // 1 share in smallest units
  const oneShare = ethers.utils.parseUnits('1', shareDec);

  // Preferred: convertToAssets
  try {
    const assets = await vault.convertToAssets(oneShare, { blockTag });
    const rate = Number(ethers.utils.formatUnits(assets, assetsDec));
    // Try to enrich with totals for TVL/utilization
    const [ta, ts] = await Promise.all([
      vault.totalAssets({ blockTag }).catch(() => null),
      erc20.totalSupply({ blockTag }).catch(() => null),
    ]);
    return {
      rate,
      totalAssets: ta ? Number(ethers.utils.formatUnits(ta, assetsDec)) : undefined,
      totalSupply: ts ? Number(ethers.utils.formatUnits(ts, shareDec)) : undefined
    };
  } catch {
    // Fallback: derive from totals if available
    try {
      const [ta, ts] = await Promise.all([
        vault.totalAssets({ blockTag }),
        erc20.totalSupply({ blockTag })
      ]);
      const totalAssets = Number(ethers.utils.formatUnits(ta, assetsDec!));
      const totalSupply = Number(ethers.utils.formatUnits(ts, shareDec));
      const rate = totalSupply > 0 ? totalAssets / totalSupply : 0;
      return { rate, totalAssets, totalSupply };
    } catch {
      // Last-chance optional pricePerShare
      try {
        const maybe = new ethers.Contract(vaultAddr, OPTIONAL_PRICE_PER_SHARE_ABI, provider);
        const pps = await maybe.pricePerShare({ blockTag });
        const rate = Number(ethers.utils.formatUnits(pps, assetsDec!));
        return { rate };
      } catch {
        return { rate: 0 };
      }
    }
  }
}

function annualizeFromWindow(r0: number, r1: number, hours: number): number {
  if (r0 <= 0 || r1 <= 0 || hours <= 0) return 0;
  const growth = r1 / r0;
  // APY = (growth)^(365*24 / hours) - 1
  const apy = Math.pow(growth, (365.25 * 24) / hours) - 1;
  // keep a conservative cap, matching your original approach
  return Math.max(0, Math.min(apy * 100, 50));
}

// ---------- Avant ----------
export class AvantService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  // Optional: pull Avant's own metrics to mirror the app, if available
  private async getAvantAPIFallback(): Promise<AvantApiResponse | null> {
    try {
      const r = await fetch('https://app.avantprotocol.com/api/metrics', { cache: 'no-store' });
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  public async computeVaultAPY(
    provider: ethers.providers.JsonRpcProvider,
    vaultAddress: string,
    shareDecimals?: number,
    assetDecimals?: number,
    windowHours = 24
  ): Promise<{ apy: number; rateNow: number; totalAssets?: number; totalSupply?: number; }> {
    const latest = await provider.getBlock('latest');
    const targetTs = latest.timestamp - Math.floor(windowHours * 3600);
    const thenBlock = await findNearestBlockByTimestamp(provider, targetTs);

    const [then, now] = await Promise.all([
      readRateAtBlock(provider, vaultAddress, shareDecimals, assetDecimals, thenBlock),
      readRateAtBlock(provider, vaultAddress, shareDecimals, assetDecimals, latest.number)
    ]);

    const apy = annualizeFromWindow(then.rate, now.rate, windowHours);
    return {
      apy,
      rateNow: now.rate,
      totalAssets: now.totalAssets,
      totalSupply: now.totalSupply
    };
  }

  async fetchData(): Promise<AvantData> {
    const provider = await this.getProvider();
    const prices = await getTokenPrices();
    const apiData = await this.getAvantAPIFallback();

    // Contracts
    const avUSD = new ethers.Contract(AVANT_CONTRACTS.avUSD, ERC20_ABI, provider);
    const savUSD = new ethers.Contract(AVANT_CONTRACTS.savUSD, ERC20_ABI, provider);
    const avUSDx = new ethers.Contract(AVANT_CONTRACTS.avUSDx, ERC20_ABI, provider);
    const avBTC  = new ethers.Contract(AVANT_CONTRACTS.avBTC,  ERC20_ABI, provider);
    const savBTC = new ethers.Contract(AVANT_CONTRACTS.savBTC, ERC20_ABI, provider);

    // Supplies
    const [
      avUSDSupplyRaw, avUSDxSupplyRaw, avBTCSupplyRaw,
      savUSDDec, savBTCDec
    ] = await Promise.all([
      avUSD.totalSupply().catch(() => ethers.BigNumber.from('0')),
      avUSDx.totalSupply().catch(() => ethers.BigNumber.from('0')),
      avBTC.totalSupply().catch(() => ethers.BigNumber.from('0')),
      savUSD.decimals().catch(() => 18),
      savBTC.decimals().catch(() => 8)
    ]);

    const avUSDSupply = Number(ethers.utils.formatUnits(avUSDSupplyRaw, 18));
    const avUSDxSupply = Number(ethers.utils.formatUnits(avUSDxSupplyRaw, 18));
    const avBTCSupply = Number(ethers.utils.formatUnits(avBTCSupplyRaw, 8));

    // savUSD metrics (ERC-4626 -> underlying USDC, 6 or 18; the code infers from asset())
    const savUSDComp = await this.computeVaultAPY(provider, AVANT_CONTRACTS.savUSD, savUSDDec, undefined, 24);
    const savUSDAPY = apiData?.savUSD?.apy ?? savUSDComp.apy;
    const savUSDTotalAssets = savUSDComp.totalAssets ?? 0;
    const savUSDShares = savUSDComp.totalSupply ?? Number(ethers.utils.formatUnits(await savUSD.totalSupply(), savUSDDec));
    const savUSDTVL = savUSDTotalAssets * (prices.USDC || 1);

    // savBTC metrics (ERC-4626 -> underlying BTC.b likely 8 decimals)
    const savBTCComp = await this.computeVaultAPY(provider, AVANT_CONTRACTS.savBTC, savBTCDec, 8, 24);
    const savBTCAPY = apiData?.savBTC?.apy ?? savBTCComp.apy;
    const savBTCTotalAssets = savBTCComp.totalAssets ?? 0;
    const savBTCShares = savBTCComp.totalSupply ?? Number(ethers.utils.formatUnits(await savBTC.totalSupply(), savBTCDec));
    const savBTCTVL = savBTCTotalAssets * (prices.BTC || 0);

    return {
      protocol: 'AVANT',
      avUSD: { totalSupply: avUSDSupply, price: 1.00, marketCap: avUSDSupply * 1.00 },
      savUSD: {
        totalAssets: savUSDTotalAssets,
        totalSupply: savUSDShares,
        pricePerShare: savUSDComp.rateNow,
        tvl: savUSDTVL,
        apy: savUSDAPY,
        utilization: savUSDTotalAssets > 0 ? (savUSDShares / savUSDTotalAssets) * 100 : 0
      },
      avUSDx: { totalSupply: avUSDxSupply, price: 1.00, marketCap: avUSDxSupply * 1.00 },
      avBTC:  { totalSupply: avBTCSupply, price: prices.BTC || 0, marketCap: avBTCSupply * (prices.BTC || 0) },
      savBTC: {
        totalAssets: savBTCTotalAssets,
        totalSupply: savBTCShares,
        pricePerShare: savBTCComp.rateNow,
        tvl: savBTCTVL,
        apy: savBTCAPY,
        utilization: savBTCTotalAssets > 0 ? (savBTCShares / savBTCTotalAssets) * 100 : 0
      },
      prices
    };
  }
}

// ---------- Hypha / GoGoPool ----------
export class HyphaService {
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    }
    return this.provider;
  }

  private async getHyphaMetrics(): Promise<HyphaApiResponse | null> {
    try {
      const r = await fetch('https://api.gogopool.com/metrics', { cache: 'no-store' });
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  async fetchData(): Promise<HyphaData> {
    const provider = await this.getProvider();

    // stAVAX/ggAVAX behaves like an ERC-4626 vault whose exchange rate vs AVAX grows over time.
    // Prefer on-chain rate; fallback to Hypha's /metrics if needed.
    const st = new ethers.Contract(HYPHA.stAVAX, ERC20_ABI, provider);
    const dec = await st.decimals().catch(() => 18);

    const comp = await (async () => {
      try {
        // try ERC-4626 reads directly on the token address
        return await (async () => {
          const c = await (new AvantService()).computeVaultAPY(provider, HYPHA.stAVAX, dec, 18, 24);
          return c;
        })();
      } catch {
        return { apy: 0, rateNow: 0, totalAssets: undefined, totalSupply: undefined };
      }
    })();

    // If API exists, prefer its APY to match what the dapp shows
    const api = await this.getHyphaMetrics();
    const apiAPY = api?.stAvaAPR ?? api?.stAvaAPY ?? api?.apy ?? null; // field names differ across deployments

    const totalSupplyRaw = await st.totalSupply().catch(() => ethers.BigNumber.from(0));
    const totalSupply = Number(ethers.utils.formatUnits(totalSupplyRaw, dec));

    return {
      protocol: 'HYPHA',
      stAVAX: {
        totalSupply,
        avaxPerShare: comp.rateNow,
        apy: typeof apiAPY === 'number' ? apiAPY : comp.apy,
        tvlAVAX: comp.totalAssets ?? 0
      }
    };
  }
}