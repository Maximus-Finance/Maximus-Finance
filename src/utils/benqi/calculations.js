/**
 * Utility functions for financial calculations
 */

/**
 * Calculate expected profit based on APY and time period
 * @param {number} principal - Initial deposit amount
 * @param {number} apy - Annual percentage yield
 * @param {number} days - Number of days
 * @returns {number} - Expected profit
 */
export const calculateExpectedProfit = (principal, apy, days) => {
  const dailyRate = apy / 100 / 365;
  return principal * dailyRate * days;
};

/**
 * Calculate APY from actual profit over time period
 * @param {number} profit - Actual profit earned
 * @param {number} principal - Initial deposit amount
 * @param {number} days - Number of days
 * @returns {number} - Annualized APY percentage
 */
export const calculateActualAPY = (profit, principal, days) => {
  if (principal === 0 || days === 0) return 0;

  const profitPercentage = (profit / principal) * 100;
  return (profitPercentage * 365) / days;
};

/**
 * Calculate profit percentage
 * @param {number} profit - Profit amount
 * @param {number} principal - Initial deposit amount
 * @returns {number} - Profit percentage
 */
export const calculateProfitPercentage = (profit, principal) => {
  if (principal === 0) return 0;
  return (profit / principal) * 100;
};

/**
 * Calculate leverage multiplier based on LTV ratio
 * @param {number} ltvRatio - Loan-to-value ratio (e.g., 65 for 65%)
 * @returns {number} - Leverage multiplier
 */
export const calculateLeverageMultiplier = (ltvRatio) => {
  const ltv = ltvRatio / 100;
  // Formula: 1 / (1 - LTV)
  return 1 / (1 - ltv);
};

/**
 * Calculate effective APY with leverage
 * @param {number} baseAPY - Base staking APY
 * @param {number} leverageMultiplier - Leverage multiplier
 * @param {number} borrowAPY - Borrow APY (default: 0 for Avalanche native tokens)
 * @returns {number} - Effective APY with leverage
 */
export const calculateLeveragedAPY = (baseAPY, leverageMultiplier, borrowAPY = 0) => {
  // Effective APY = (Base APY × Leverage) - (Borrow APY × (Leverage - 1))
  return (baseAPY * leverageMultiplier) - (borrowAPY * (leverageMultiplier - 1));
};

/**
 * Calculate number of loops needed to reach target LTV
 * @param {number} targetLTV - Target LTV ratio (e.g., 65 for 65%)
 * @param {number} collateralFactor - Collateral factor (e.g., 70 for 70%)
 * @returns {number} - Approximate number of loops
 */
export const calculateOptimalLoops = (targetLTV, collateralFactor) => {
  const ltv = targetLTV / 100;
  const cf = collateralFactor / 100;

  // Each loop borrows (LTV × collateral factor) of the previous amount
  // Total leverage = 1 + ltv*cf + (ltv*cf)^2 + ... + (ltv*cf)^n
  // We want to find n where total leverage approaches desired level

  let totalLeverage = 1;
  let loops = 0;
  let borrowAmount = ltv * cf;

  while (borrowAmount > 0.01 && loops < 10) {
    totalLeverage += borrowAmount;
    borrowAmount *= (ltv * cf);
    loops++;
  }

  return loops;
};

/**
 * Calculate shares from deposit amount
 * @param {number} depositAmount - Deposit amount
 * @param {number} totalSupply - Total supply of shares
 * @param {number} vaultValue - Total vault value
 * @returns {number} - Number of shares
 */
export const calculateShares = (depositAmount, totalSupply, vaultValue) => {
  if (totalSupply === 0 || vaultValue === 0) {
    return depositAmount; // First deposit: 1:1 ratio
  }

  return (depositAmount * totalSupply) / vaultValue;
};

/**
 * Calculate value from shares
 * @param {number} shares - Number of shares
 * @param {number} totalSupply - Total supply of shares
 * @param {number} vaultValue - Total vault value
 * @returns {number} - Value of shares
 */
export const calculateValueFromShares = (shares, totalSupply, vaultValue) => {
  if (totalSupply === 0) return 0;
  return (shares * vaultValue) / totalSupply;
};

/**
 * Calculate health factor for leveraged position
 * @param {number} collateralValue - Total collateral value
 * @param {number} borrowValue - Total borrow value
 * @param {number} liquidationThreshold - Liquidation threshold (e.g., 75 for 75%)
 * @returns {number} - Health factor (> 1 is safe, < 1 risks liquidation)
 */
export const calculateHealthFactor = (collateralValue, borrowValue, liquidationThreshold) => {
  if (borrowValue === 0) return Infinity;

  const threshold = liquidationThreshold / 100;
  return (collateralValue * threshold) / borrowValue;
};

/**
 * Calculate current LTV ratio
 * @param {number} borrowValue - Total borrow value
 * @param {number} collateralValue - Total collateral value
 * @returns {number} - LTV ratio as percentage
 */
export const calculateCurrentLTV = (borrowValue, collateralValue) => {
  if (collateralValue === 0) return 0;
  return (borrowValue / collateralValue) * 100;
};

/**
 * Calculate withdrawal fee
 * @param {number} amount - Withdrawal amount
 * @param {number} feePercentage - Fee percentage (e.g., 0.5 for 0.5%)
 * @returns {Object} - { amountAfterFee, feeAmount }
 */
export const calculateWithdrawalFee = (amount, feePercentage) => {
  const fee = feePercentage / 100;
  const feeAmount = amount * fee;
  const amountAfterFee = amount - feeAmount;

  return {
    amountAfterFee,
    feeAmount
  };
};

/**
 * Calculate time-weighted average APY
 * @param {Array} apyHistory - Array of { apy, days } objects
 * @returns {number} - Time-weighted average APY
 */
export const calculateTimeWeightedAPY = (apyHistory) => {
  if (!apyHistory || apyHistory.length === 0) return 0;

  let totalWeightedAPY = 0;
  let totalDays = 0;

  apyHistory.forEach(({ apy, days }) => {
    totalWeightedAPY += apy * days;
    totalDays += days;
  });

  return totalDays > 0 ? totalWeightedAPY / totalDays : 0;
};

/**
 * Calculate compound interest
 * @param {number} principal - Initial amount
 * @param {number} rate - Interest rate (as percentage)
 * @param {number} time - Time period in years
 * @param {number} frequency - Compounding frequency per year (default: 365)
 * @returns {number} - Final amount
 */
export const calculateCompoundInterest = (principal, rate, time, frequency = 365) => {
  const r = rate / 100;
  return principal * Math.pow((1 + r / frequency), frequency * time);
};

/**
 * Calculate estimated daily profit
 * @param {number} currentValue - Current position value
 * @param {number} apy - Expected APY
 * @returns {number} - Estimated daily profit
 */
export const calculateDailyProfit = (currentValue, apy) => {
  return currentValue * (apy / 100) / 365;
};

/**
 * Calculate ROI (Return on Investment)
 * @param {number} currentValue - Current value
 * @param {number} investedAmount - Initial investment
 * @returns {number} - ROI as percentage
 */
export const calculateROI = (currentValue, investedAmount) => {
  if (investedAmount === 0) return 0;
  return ((currentValue - investedAmount) / investedAmount) * 100;
};

export default {
  calculateExpectedProfit,
  calculateActualAPY,
  calculateProfitPercentage,
  calculateLeverageMultiplier,
  calculateLeveragedAPY,
  calculateOptimalLoops,
  calculateShares,
  calculateValueFromShares,
  calculateHealthFactor,
  calculateCurrentLTV,
  calculateWithdrawalFee,
  calculateTimeWeightedAPY,
  calculateCompoundInterest,
  calculateDailyProfit,
  calculateROI
};
