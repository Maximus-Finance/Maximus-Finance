/**
 * Utility functions for formatting values for display
 */

/**
 * Format AVAX amount with specified decimal places
 * @param {string|number} amount - Amount in AVAX
 * @param {number} decimals - Number of decimal places (default: 8)
 * @returns {string} - Formatted amount
 */
export const formatAVAX = (amount, decimals = 8) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.' + '0'.repeat(decimals);
  return num.toFixed(decimals);
};

/**
 * Format percentage with specified decimal places
 * @param {number} percentage - Percentage value
 * @param {number} decimals - Number of decimal places (default: 3)
 * @returns {string} - Formatted percentage with % sign
 */
export const formatPercentage = (percentage, decimals = 3) => {
  if (isNaN(percentage)) return '0.' + '0'.repeat(decimals) + '%';
  return percentage.toFixed(decimals) + '%';
};

/**
 * Format profit with + or - sign
 * @param {string|number} profit - Profit amount
 * @param {number} decimals - Number of decimal places (default: 8)
 * @returns {string} - Formatted profit with sign
 */
export const formatProfit = (profit, decimals = 8) => {
  const num = typeof profit === 'string' ? parseFloat(profit) : profit;
  if (isNaN(num)) return '+0.' + '0'.repeat(decimals);

  const sign = num >= 0 ? '+' : '';
  return sign + num.toFixed(decimals);
};

/**
 * Format wallet address (short version)
 * @param {string} address - Full wallet address
 * @returns {string} - Shortened address (0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {boolean} includeTime - Include time in output
 * @returns {string} - Formatted date
 */
export const formatDate = (timestamp, includeTime = true) => {
  if (!timestamp || timestamp === 0) return 'N/A';

  const date = new Date(timestamp * 1000);

  if (includeTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time remaining until unlock
 * @param {number} unlockTimestamp - Unix timestamp in seconds
 * @returns {string} - Human-readable time remaining
 */
export const formatTimeRemaining = (unlockTimestamp) => {
  if (!unlockTimestamp || unlockTimestamp === 0) return 'N/A';

  const currentTime = Math.floor(Date.now() / 1000);
  const remainingSeconds = unlockTimestamp - currentTime;

  if (remainingSeconds <= 0) return 'Unlocked';

  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format days since deposit
 * @param {number} depositTimestamp - Unix timestamp in seconds
 * @returns {string} - Days since deposit
 */
export const formatDaysSinceDeposit = (depositTimestamp) => {
  if (!depositTimestamp || depositTimestamp === 0) return '0 days';

  const currentTime = Math.floor(Date.now() / 1000);
  const seconds = currentTime - depositTimestamp;
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatLargeNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

/**
 * Format USD value
 * @param {number} amount - Amount in USD
 * @returns {string} - Formatted USD value
 */
export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Color for profit/loss display
 * @param {number} value - Value to check
 * @returns {string} - CSS color class or hex color
 */
export const getProfitColor = (value) => {
  if (value > 0) return '#10b981'; // Green
  if (value < 0) return '#ef4444'; // Red
  return '#6b7280'; // Gray
};

/**
 * Format APY for display
 * @param {number} apy - APY percentage
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted APY
 */
export const formatAPY = (apy, decimals = 2) => {
  if (isNaN(apy)) return '0.00%';
  return apy.toFixed(decimals) + '% APY';
};

export default {
  formatAVAX,
  formatPercentage,
  formatProfit,
  formatAddress,
  formatDate,
  formatTimeRemaining,
  formatDaysSinceDeposit,
  formatLargeNumber,
  formatUSD,
  getProfitColor,
  formatAPY
};
