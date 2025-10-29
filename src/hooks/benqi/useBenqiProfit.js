import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getVaultAddress } from '../../contracts/benqi/config';
import VaultABI from '../../contracts/benqi/abis/VaultMainnetV2.json';

/**
 * Custom hook for calculating and tracking BENQI strategy profit
 *
 * Usage:
 * const { profit, loading, error, updateProfit, refetch } = useBenqiProfit(provider, signer, userAddress);
 */
export const useBenqiProfit = (provider, signer, userAddress) => {
  const [profit, setProfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  /**
   * Calculate user's profit based on current value vs deposit
   */
  const calculateProfit = useCallback(async () => {
    if (!provider || !userAddress) {
      setProfit(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vaultAddress = getVaultAddress();
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, provider);

      // Fetch user deposit and current value
      const [userDeposit, userShares, totalSupply, vaultValue] = await Promise.all([
        vaultContract.deposits(userAddress),
        vaultContract.balanceOf(userAddress),
        vaultContract.totalSupply(),
        vaultContract.getVaultValue()
      ]);

      // Calculate current value based on shares
      const currentValue = totalSupply > 0n
        ? (vaultValue * userShares) / totalSupply
        : 0n;

      // Calculate profit
      const depositAmount = userDeposit.amount;
      const profitAmount = currentValue > depositAmount
        ? currentValue - depositAmount
        : 0n;

      // Calculate profit percentage
      const profitPercentage = depositAmount > 0n
        ? (profitAmount * 10000n) / depositAmount // Basis points
        : 0n;

      // Calculate days since deposit
      const depositTime = Number(userDeposit.depositTime);
      const currentTime = Math.floor(Date.now() / 1000);
      const daysSinceDeposit = depositTime > 0
        ? (currentTime - depositTime) / (24 * 60 * 60)
        : 0;

      // Calculate annualized return (APY) based on actual performance
      const actualAPY = depositTime > 0 && depositAmount > 0n
        ? (Number(profitPercentage) / 100) * (365 / daysSinceDeposit)
        : 0;

      const profitData = {
        // Profit amounts
        profit: ethers.utils.formatEther(profitAmount),
        profitWei: profitAmount.toString(),
        profitPercentage: Number(profitPercentage) / 100, // Convert to percentage

        // Principal and current value
        depositAmount: ethers.utils.formatEther(depositAmount),
        currentValue: ethers.utils.formatEther(currentValue),

        // Time-based metrics
        daysSinceDeposit: daysSinceDeposit,
        depositTime: depositTime,
        actualAPY: actualAPY,

        // Display values
        profitFormatted: Number(ethers.utils.formatEther(profitAmount)).toFixed(8),
        profitPercentageFormatted: (Number(profitPercentage) / 100).toFixed(3),

        // Status
        isPositive: profitAmount > 0n,
        lastCalculated: Date.now()
      };

      setProfit(profitData);
      setLoading(false);

      return profitData;

    } catch (err) {
      console.error('❌ Failed to calculate profit:', err);
      setError(err.message || 'Failed to calculate profit');
      setLoading(false);
      return null;
    }
  }, [provider, userAddress]);

  /**
   * Update strategy value on-chain (can be called once per hour)
   * This triggers the vault to fetch latest position value from strategy
   */
  const updateStrategyValue = useCallback(async () => {
    if (!signer) {
      throw new Error('Signer required to update strategy value');
    }

    try {
      const vaultAddress = getVaultAddress();
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, signer);

      console.log('📝 Updating strategy value...');

      // Check last update time
      const lastStrategyUpdate = await vaultContract.lastStrategyUpdate();
      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceUpdate = currentTime - Number(lastStrategyUpdate);

      if (timeSinceUpdate < 3600) { // 1 hour
        const minutesRemaining = Math.ceil((3600 - timeSinceUpdate) / 60);
        throw new Error(`Strategy value was updated ${Math.floor(timeSinceUpdate / 60)} minutes ago. Please wait ${minutesRemaining} more minutes.`);
      }

      // Call updateStrategyValue
      const tx = await vaultContract.updateStrategyValue();
      console.log('⏳ Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Strategy value updated!');

      setLastUpdate(Date.now());

      // Recalculate profit after update
      await calculateProfit();

      return {
        success: true,
        receipt,
        hash: receipt.hash
      };

    } catch (error) {
      console.error('❌ Failed to update strategy value:', error);

      let errorMessage = 'Failed to update strategy value';

      if (error.message.includes('Update too frequent')) {
        errorMessage = 'Please wait 1 hour between updates';
      } else if (error.message.includes('minutes ago')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }, [signer, calculateProfit]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(() => {
    return calculateProfit();
  }, [calculateProfit]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    calculateProfit();
  }, [calculateProfit]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      calculateProfit();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [calculateProfit]);

  return {
    profit,
    loading,
    error,
    lastUpdate,
    updateStrategyValue,
    refetch
  };
};

export default useBenqiProfit;
