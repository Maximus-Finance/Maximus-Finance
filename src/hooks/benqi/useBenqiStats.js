import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getVaultAddress } from '../../contracts/benqi/config';
import VaultABI from '../../contracts/benqi/abis/VaultMainnetV2.json';

/**
 * Custom hook for fetching BENQI vault statistics
 *
 * Usage:
 * const { stats, loading, error } = useBenqiStats(provider);
 */
export const useBenqiStats = (provider) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch vault statistics
   */
  const fetchStats = useCallback(async () => {
    if (!provider) {
      console.log('useBenqiStats: No provider yet');
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('useBenqiStats: Fetching stats...');

      // Check if provider has the required methods
      if (!provider.getNetwork) {
        console.log('useBenqiStats: Provider has no getNetwork method');
        setLoading(false);
        return null;
      }

      // Check network - BENQI contracts are on Avalanche mainnet (43114)
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      console.log('useBenqiStats: Chain ID:', chainId);

      if (chainId !== 43114) {
        // Wrong network - set default stats
        console.log('useBenqiStats: Wrong network, setting default stats');
        setStats({
          activeUsers: 0,
          totalShares: '0',
          totalSharesWei: '0',
          totalAssets: '0',
          totalAssetsWei: '0',
          totalDeposits: '0',
          totalWithdrawals: '0',
          totalFees: '0',
          currentAPY: 0,
          lastUpdated: Date.now()
        });
        setLoading(false);
        return null;
      }

      const vaultAddress = getVaultAddress();
      console.log('useBenqiStats: Vault address:', vaultAddress);
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, provider);

      // Fetch just the active user count first for simplicity
      console.log('useBenqiStats: Calling activeUserCount()...');
      const activeUserCount = await vaultContract.activeUserCount();
      console.log('useBenqiStats: Active user count:', activeUserCount.toString());

      // Fetch other statistics
      const [totalShares, totalAssets, vaultStats] = await Promise.all([
        vaultContract.totalShares(),
        vaultContract.totalAssets(),
        vaultContract.vaultStats()
      ]);

      const statsData = {
        // Investor count
        activeUsers: Number(activeUserCount),

        // Vault totals
        totalShares: ethers.utils.formatEther(totalShares),
        totalSharesWei: totalShares.toString(),
        totalAssets: ethers.utils.formatEther(totalAssets),
        totalAssetsWei: totalAssets.toString(),

        // Vault stats from struct
        totalDeposits: ethers.utils.formatEther(vaultStats.totalDeposits),
        totalWithdrawals: ethers.utils.formatEther(vaultStats.totalWithdrawals),
        totalFees: ethers.utils.formatEther(vaultStats.totalFees),
        currentAPY: Number(vaultStats.currentAPY) / 100, // Convert from basis points to percentage

        // Timestamp
        lastUpdated: Date.now()
      };

      console.log('useBenqiStats: Stats fetched successfully:', statsData);
      setStats(statsData);
      setLoading(false);

      return statsData;

    } catch (err) {
      console.error('useBenqiStats: Error fetching vault stats:', err);
      console.error('useBenqiStats: Error details:', err.message || err);
      setError(err.message || 'Failed to fetch stats');
      // Set default stats on error
      setStats({
        activeUsers: 0,
        totalShares: '0',
        totalSharesWei: '0',
        totalAssets: '0',
        totalAssetsWei: '0',
        totalDeposits: '0',
        totalWithdrawals: '0',
        totalFees: '0',
        currentAPY: 0,
        lastUpdated: Date.now()
      });
      setLoading(false);
      return null;
    }
  }, [provider]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export default useBenqiStats;
