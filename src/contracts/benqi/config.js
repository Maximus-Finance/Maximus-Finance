/**
 * BENQI Strategy Configuration
 * Deployed on Avalanche Mainnet (Chain ID: 43114)
 *
 * This file contains all contract addresses and strategy parameters
 * for the BENQI Leveraged Yield Strategy V2
 */

// ============================================
// V2 DEPLOYED CONTRACT ADDRESSES (MAINNET)
// ============================================

export const BENQI_STRATEGY_CONTRACTS = {
  // V2 Contracts (Active - 30-day lock + Live profit tracking)
  VAULT_V2: '0x4d950c6a58314867327e22C2dc7FcD04dA52C5BD',
  STRATEGY_V2: '0x17787697d895039f1D6D5142974EC0263017ba95',

  // BENQI Protocol Addresses (Avalanche Mainnet)
  BENQI_SAVAX: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
  BENQI_COMPTROLLER: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4',
  BENQI_QI_SAVAX: '0xF362feA9659cf036792c9cb02f8ff8198E21B4cB',
  BENQI_QI_AVAX: '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c',
  BENQI_QI_TOKEN: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
};

// ============================================
// STRATEGY METADATA
// ============================================

export const BENQI_STRATEGY_INFO = {
  id: 'benqi-leveraged-yield',
  name: 'BENQI Leveraged Yield Strategy',
  shortName: 'BENQI Strategy',
  description: 'Automated leveraged yield strategy using BENQI liquid staking and lending protocol',

  // Display Information
  icon: '🏔️', // Or use your custom icon/logo
  protocol: 'BENQI',
  blockchain: 'Avalanche',

  // Performance Metrics
  baseAPY: 5.5,           // Base sAVAX staking APY
  enhancedAPY: 12.5,      // Target APY with leverage
  improvement: 127,       // Percentage improvement (127% = 2.27x)

  // Risk Profile
  riskLevel: 'Medium',    // Low | Medium | High
  riskFactors: [
    'Smart contract risk',
    'Liquidation risk (managed via safety buffers)',
    'BENQI protocol risk',
    'Market volatility risk'
  ],

  // Strategy Parameters
  maxLoops: 6,            // Maximum leverage loops
  targetLTV: 65,          // Target loan-to-value ratio (%)
  safetyBuffer: 5,        // Safety buffer below max LTV (%)
  effectiveLeverage: 2.86, // Approximate effective leverage

  // User Requirements
  minDeposit: 0.1,        // Minimum deposit in AVAX
  cooldownPeriod: 30,     // Lock period in days

  // Fees
  withdrawalFee: 0.5,     // Normal withdrawal fee (%)
  managementFee: 1.0,     // Annual management fee (%)
  performanceFee: 10.0,   // Performance fee (%)

  // Links
  explorerUrl: 'https://snowtrace.io',
  vaultExplorerUrl: 'https://snowtrace.io/address/0x4d950c6a58314867327e22C2dc7FcD04dA52C5BD',
  strategyExplorerUrl: 'https://snowtrace.io/address/0x17787697d895039f1D6D5142974EC0263017ba95',
  benqiUrl: 'https://benqi.fi',
};

// ============================================
// NETWORK CONFIGURATION
// ============================================

export const AVALANCHE_MAINNET = {
  chainId: 43114,
  chainIdHex: '0xA86A',
  chainName: 'Avalanche Mainnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: [
    'https://api.avax.network/ext/bc/C/rpc',
    'https://avalanche-c-chain.publicnode.com'
  ],
  blockExplorerUrls: ['https://snowtrace.io/']
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the main vault contract address
 */
export const getVaultAddress = () => BENQI_STRATEGY_CONTRACTS.VAULT_V2;

/**
 * Get the strategy contract address
 */
export const getStrategyAddress = () => BENQI_STRATEGY_CONTRACTS.STRATEGY_V2;

/**
 * Check if connected to correct network
 */
export const isAvalancheMainnet = (chainId) => {
  return chainId === AVALANCHE_MAINNET.chainId ||
         chainId === parseInt(AVALANCHE_MAINNET.chainIdHex, 16);
};

/**
 * Get SnowTrace URL for transaction
 */
export const getTransactionUrl = (txHash) => {
  return `https://snowtrace.io/tx/${txHash}`;
};

/**
 * Get SnowTrace URL for address
 */
export const getAddressUrl = (address) => {
  return `https://snowtrace.io/address/${address}`;
};

/**
 * Calculate expected APY based on deposit amount and loops executed
 * @param {number} depositAmount - Deposit amount in AVAX
 * @param {number} loopsExecuted - Number of leverage loops executed
 * @returns {number} - Expected APY percentage
 */
export const calculateExpectedAPY = (depositAmount, loopsExecuted) => {
  // Larger deposits execute more loops and get higher leverage
  const baseAPY = BENQI_STRATEGY_INFO.baseAPY;
  const targetAPY = BENQI_STRATEGY_INFO.enhancedAPY;

  // Calculate leverage multiplier based on loops
  const leverageMultiplier = 1 + (loopsExecuted / BENQI_STRATEGY_INFO.maxLoops);

  return baseAPY * leverageMultiplier;
};

/**
 * Calculate expected profit after given time period
 * @param {number} depositAmount - Deposit amount in AVAX
 * @param {number} days - Number of days
 * @param {number} apy - Annual percentage yield
 * @returns {number} - Expected profit in AVAX
 */
export const calculateExpectedProfit = (depositAmount, days, apy = BENQI_STRATEGY_INFO.enhancedAPY) => {
  const dailyRate = apy / 100 / 365;
  return depositAmount * dailyRate * days;
};

/**
 * Calculate profit percentage
 * @param {number} profit - Profit amount in AVAX
 * @param {number} principal - Original deposit in AVAX
 * @returns {number} - Profit percentage
 */
export const calculateProfitPercentage = (profit, principal) => {
  if (principal === 0) return 0;
  return (profit / principal) * 100;
};

/**
 * Check if user can withdraw (cooldown period passed)
 * @param {number} depositTimestamp - Deposit timestamp in seconds
 * @returns {boolean} - True if can withdraw
 */
export const canWithdraw = (depositTimestamp) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const cooldownSeconds = BENQI_STRATEGY_INFO.cooldownPeriod * 24 * 60 * 60;
  return currentTime >= depositTimestamp + cooldownSeconds;
};

/**
 * Get remaining lock time in seconds
 * @param {number} depositTimestamp - Deposit timestamp in seconds
 * @returns {number} - Remaining seconds (0 if unlocked)
 */
export const getRemainingLockTime = (depositTimestamp) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const cooldownSeconds = BENQI_STRATEGY_INFO.cooldownPeriod * 24 * 60 * 60;
  const unlockTime = depositTimestamp + cooldownSeconds;

  return Math.max(0, unlockTime - currentTime);
};

/**
 * Format lock time remaining as human-readable string
 * @param {number} depositTimestamp - Deposit timestamp in seconds
 * @returns {string} - Formatted time remaining
 */
export const formatLockTimeRemaining = (depositTimestamp) => {
  const remainingSeconds = getRemainingLockTime(depositTimestamp);

  if (remainingSeconds === 0) return 'Unlocked';

  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

export default {
  BENQI_STRATEGY_CONTRACTS,
  BENQI_STRATEGY_INFO,
  AVALANCHE_MAINNET,
};
