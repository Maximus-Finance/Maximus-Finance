import { useMemo } from 'react';
import { useBenqiDeposit } from './useBenqiDeposit';
import { useBenqiBalance } from './useBenqiBalance';
import { useBenqiProfit } from './useBenqiProfit';
import { useBenqiWithdraw } from './useBenqiWithdraw';

/**
 * Main hook that combines all BENQI strategy functionality
 *
 * This is the primary hook you should use for BENQI strategy integration.
 * It provides deposit, withdrawal, balance, and profit tracking in one place.
 *
 * Usage:
 * const benqi = useBenqiStrategy(provider, signer, userAddress);
 *
 * // Deposit
 * await benqi.deposit('0.1');
 *
 * // Check balance
 * console.log(benqi.balance);
 *
 * // Check profit
 * console.log(benqi.profit);
 *
 * // Withdraw
 * await benqi.withdraw('0.1');
 */
export const useBenqiStrategy = (provider, signer, userAddress) => {
  // Individual hooks
  const depositHook = useBenqiDeposit(signer);
  const balanceHook = useBenqiBalance(provider, userAddress);
  const profitHook = useBenqiProfit(provider, signer, userAddress);
  const withdrawHook = useBenqiWithdraw(signer, userAddress);

  // Combined state
  const state = useMemo(() => {
    return {
      // Balance data
      balance: balanceHook.balance,
      shares: balanceHook.balance?.shares || '0',
      depositAmount: balanceHook.balance?.depositAmount || '0',
      currentValue: balanceHook.balance?.currentValue || '0',
      depositTime: balanceHook.balance?.depositTime || 0,
      unlockTime: balanceHook.balance?.unlockTime || 0,
      canWithdraw: balanceHook.balance?.canWithdraw || false,
      isLocked: balanceHook.balance?.isLocked || true,

      // Profit data
      profit: profitHook.profit?.profit || '0',
      profitFormatted: profitHook.profit?.profitFormatted || '0.00000000',
      profitPercentage: profitHook.profit?.profitPercentage || 0,
      profitPercentageFormatted: profitHook.profit?.profitPercentageFormatted || '0.000',
      actualAPY: profitHook.profit?.actualAPY || 0,
      daysSinceDeposit: profitHook.profit?.daysSinceDeposit || 0,

      // Loading states
      isDepositing: depositHook.isDepositing,
      isWithdrawing: withdrawHook.isWithdrawing,
      isLoadingBalance: balanceHook.loading,
      isLoadingProfit: profitHook.loading,
      isLoading: depositHook.isDepositing ||
                 withdrawHook.isWithdrawing ||
                 balanceHook.loading ||
                 profitHook.loading,

      // Errors
      depositError: depositHook.depositError,
      withdrawError: withdrawHook.withdrawError,
      balanceError: balanceHook.error,
      profitError: profitHook.error,
      hasError: !!(depositHook.depositError ||
                   withdrawHook.withdrawError ||
                   balanceHook.error ||
                   profitHook.error),

      // Transaction data
      depositTx: depositHook.depositTx,
      withdrawTx: withdrawHook.withdrawTx,

      // User has position
      hasPosition: balanceHook.balance &&
                   parseFloat(balanceHook.balance.shares) > 0,
    };
  }, [
    depositHook,
    balanceHook,
    profitHook,
    withdrawHook
  ]);

  // Combined actions
  const actions = useMemo(() => {
    return {
      // Deposit
      deposit: depositHook.deposit,
      resetDeposit: depositHook.resetDeposit,

      // Withdraw
      withdraw: withdrawHook.withdraw,
      withdrawAll: withdrawHook.withdrawAll,
      checkCanWithdraw: withdrawHook.checkCanWithdraw,
      resetWithdraw: withdrawHook.resetWithdraw,

      // Refresh data
      refetchBalance: balanceHook.refetch,
      refetchProfit: profitHook.refetch,
      updateStrategyValue: profitHook.updateStrategyValue,

      // Refresh all data
      refetchAll: async () => {
        await Promise.all([
          balanceHook.refetch(),
          profitHook.refetch()
        ]);
      }
    };
  }, [
    depositHook,
    balanceHook,
    profitHook,
    withdrawHook
  ]);

  return {
    ...state,
    ...actions
  };
};

export default useBenqiStrategy;
