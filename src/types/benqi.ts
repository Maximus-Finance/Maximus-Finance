/**
 * BENQI Balance Data Types
 */

export interface BenqiBalance {
  // Shares (raw)
  shares: string;
  sharesWei: string;
  sharePercentage: number;

  // Deposit info (original deposit)
  depositAmount: string;
  depositAmountWei: string;
  depositTime: number;
  unlockTime: number;

  // Current balance (shares * vaultValue / totalShares)
  currentBalance: string;
  currentBalanceWei: string;

  // Profit calculation
  profit: string;
  profitWei: string;
  profitPercentage: number;

  // Status
  isActive: boolean;
  canWithdraw: boolean;
  isLocked: boolean;

  // Timestamps
  currentTime: number;
  lastUpdated: number;
}

export interface BenqiStats {
  // Investor count
  activeUsers: number;

  // Vault totals
  totalShares: string;
  totalSharesWei: string;
  totalAssets: string;
  totalAssetsWei: string;

  // Vault stats from struct
  totalDeposits: string;
  totalWithdrawals: string;
  totalFees: string;
  currentAPY: number;

  // Timestamp
  lastUpdated: number;
}

export interface BenqiDepositResult {
  success: boolean;
  receipt?: {
    transactionHash: string;
    blockNumber: number;
  };
  error?: string;
}
