import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getVaultAddress } from '../../contracts/benqi/config';
import VaultABI from '../../contracts/benqi/abis/VaultMainnetV2.json';

/**
 * Custom hook for fetching BENQI strategy user balance and position data
 *
 * Usage:
 * const { balance, loading, error, refetch } = useBenqiBalance(provider, userAddress);
 */
export const useBenqiBalance = (provider, userAddress, autoRefresh = true) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch user balance and position data from vault
   */
  const fetchBalance = useCallback(async () => {
    if (!provider || !userAddress) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if provider has the required methods
      if (!provider.getNetwork) {
        setLoading(false);
        return null;
      }

      // Check network - BENQI contracts are on Avalanche mainnet (43114)
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      if (chainId !== 43114) {
        // Wrong network - silently skip
        setLoading(false);
        setError('Please switch to Avalanche mainnet');
        return null;
      }

      const vaultAddress = getVaultAddress();
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, provider);

      // Fetch user data using the correct mappings
      const [userShares, userDeposit, totalShares, currentBalance, userProfit] = await Promise.all([
        vaultContract.userShares(userAddress),  // Use userShares mapping instead of balanceOf
        vaultContract.userDeposits(userAddress), // Use userDeposits mapping
        vaultContract.totalShares(),
        vaultContract.calculateUserBalance(userAddress), // Get actual current balance from vault
        vaultContract.calculateUserProfit(userAddress)   // Get user profit
      ]);

      // Calculate share percentage
      const sharePercentage = totalShares.gt(0)
        ? userShares.mul(10000).div(totalShares) // Basis points
        : ethers.BigNumber.from(0);

      const balanceData = {
        // Shares (raw)
        shares: ethers.utils.formatEther(userShares),
        sharesWei: userShares.toString(),
        sharePercentage: Number(sharePercentage) / 100, // Convert to percentage

        // Deposit info (original deposit)
        depositAmount: ethers.utils.formatEther(userDeposit.amount),
        depositAmountWei: userDeposit.amount.toString(),
        depositTime: Number(userDeposit.depositTime),
        unlockTime: Number(userDeposit.unlockTime),

        // Current balance (shares * vaultValue / totalShares)
        currentBalance: ethers.utils.formatEther(currentBalance),
        currentBalanceWei: currentBalance.toString(),

        // Profit calculation
        profit: ethers.utils.formatEther(userProfit),
        profitWei: userProfit.toString(),
        profitPercentage: userDeposit.amount.gt(0)
          ? Number(userProfit.mul(10000).div(userDeposit.amount)) / 100
          : 0,

        // Status
        isActive: userDeposit.isActive,
        canWithdraw: userDeposit.isActive && Date.now() / 1000 >= Number(userDeposit.unlockTime),
        isLocked: userDeposit.isActive && Date.now() / 1000 < Number(userDeposit.unlockTime),

        // Timestamps
        currentTime: Math.floor(Date.now() / 1000),
        lastUpdated: Date.now()
      };

      setBalance(balanceData);
      setLoading(false);

      return balanceData;

    } catch (err) {
      // Silently handle errors - balance is optional for deposits
      setError(null);
      setBalance(null);
      setLoading(false);
      return null;
    }
  }, [provider, userAddress]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(() => {
    return fetchBalance();
  }, [fetchBalance]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchBalance();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch
  };
};

export default useBenqiBalance;
