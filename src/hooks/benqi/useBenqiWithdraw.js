import { useState } from 'react';
import { ethers } from 'ethers';
import { getVaultAddress } from '../../contracts/benqi/config';
import VaultABI from '../../contracts/benqi/abis/VaultMainnetV2.json';

/**
 * Custom hook for handling BENQI strategy withdrawals
 *
 * Usage:
 * const { withdraw, isWithdrawing, withdrawError, withdrawTx, canWithdraw } = useBenqiWithdraw(signer, userAddress);
 * await withdraw('0.1'); // Withdraw 0.1 AVAX
 */
export const useBenqiWithdraw = (signer, userAddress) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [withdrawTx, setWithdrawTx] = useState(null);
  const [canWithdraw, setCanWithdraw] = useState(false);

  /**
   * Check if user can withdraw (cooldown passed)
   */
  const checkCanWithdraw = async () => {
    if (!signer || !userAddress) return false;

    try {
      const vaultAddress = getVaultAddress();
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, signer);
      const canUserWithdraw = await vaultContract.canUserWithdraw(userAddress);
      setCanWithdraw(canUserWithdraw);
      return canUserWithdraw;
    } catch (error) {
      console.error('Failed to check withdrawal status:', error);
      return false;
    }
  };

  /**
   * Withdraw AVAX from the BENQI strategy vault
   * @param {string|number} amount - Amount of AVAX to withdraw
   * @returns {Object} - Transaction receipt
   */
  const withdraw = async (amount) => {
    setIsWithdrawing(true);
    setWithdrawError(null);
    setWithdrawTx(null);

    try {
      if (!signer || !userAddress) {
        throw new Error('Wallet not connected');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      // Check if user can withdraw
      const canUserWithdraw = await checkCanWithdraw();
      if (!canUserWithdraw) {
        throw new Error('Cooldown period not passed. Please wait until the lock period expires.');
      }

      const amountInWei = ethers.utils.parseEther(amount.toString());
      const vaultAddress = getVaultAddress();
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, signer);

      // Check user balance
      const userShares = await vaultContract.balanceOf(userAddress);
      if (userShares === 0n) {
        throw new Error('No balance to withdraw');
      }

      console.log('📝 Initiating withdrawal:', {
        amount: `${amount} AVAX`,
        vault: vaultAddress
      });

      // Send withdrawal transaction
      const tx = await vaultContract.withdraw(amountInWei);
      console.log('⏳ Transaction sent:', tx.hash);

      setWithdrawTx({
        hash: tx.hash,
        status: 'pending'
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Withdrawal confirmed!', receipt);

      setWithdrawTx({
        hash: receipt.hash,
        status: 'confirmed',
        blockNumber: receipt.blockNumber
      });

      setIsWithdrawing(false);

      return {
        success: true,
        receipt,
        hash: receipt.hash
      };

    } catch (error) {
      console.error('❌ Withdrawal failed:', error);

      let errorMessage = 'Withdrawal failed';

      // Parse common errors
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('Cooldown period')) {
        errorMessage = 'Withdrawal locked. Cooldown period has not passed yet.';
      } else if (error.message.includes('No balance')) {
        errorMessage = 'No balance available to withdraw';
      } else if (error.message.includes('Insufficient balance')) {
        errorMessage = 'Insufficient balance to withdraw this amount';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setWithdrawError(errorMessage);
      setWithdrawTx({
        hash: null,
        status: 'failed',
        error: errorMessage
      });
      setIsWithdrawing(false);

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Withdraw all available balance
   */
  const withdrawAll = async () => {
    try {
      if (!signer || !userAddress) {
        throw new Error('Wallet not connected');
      }

      const vaultAddress = getVaultAddress();
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, signer);

      // Get user's total balance
      const userShares = await vaultContract.balanceOf(userAddress);
      const totalSupply = await vaultContract.totalSupply();
      const vaultValue = await vaultContract.getVaultValue();

      // Calculate user's withdrawable amount
      const withdrawAmount = totalSupply > 0n
        ? (vaultValue * userShares) / totalSupply
        : 0n;

      if (withdrawAmount === 0n) {
        throw new Error('No balance to withdraw');
      }

      return await withdraw(ethers.utils.formatEther(withdrawAmount));

    } catch (error) {
      console.error('❌ Withdraw all failed:', error);
      throw error;
    }
  };

  /**
   * Reset withdrawal state
   */
  const resetWithdraw = () => {
    setIsWithdrawing(false);
    setWithdrawError(null);
    setWithdrawTx(null);
  };

  return {
    withdraw,
    withdrawAll,
    isWithdrawing,
    withdrawError,
    withdrawTx,
    canWithdraw,
    checkCanWithdraw,
    resetWithdraw
  };
};

export default useBenqiWithdraw;
