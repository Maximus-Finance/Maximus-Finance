import { useState } from 'react';
import { ethers } from 'ethers';
import { getVaultAddress } from '../../contracts/benqi/config';
import VaultABI from '../../contracts/benqi/abis/VaultMainnetV2.json';

/**
 * Custom hook for handling BENQI strategy deposits
 *
 * Usage:
 * const { deposit, isDepositing, depositError, depositTx } = useBenqiDeposit(signer);
 * await deposit('0.1'); // Deposit 0.1 AVAX
 */
export const useBenqiDeposit = (signer) => {
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState(null);
  const [depositTx, setDepositTx] = useState(null);

  /**
   * Deposit AVAX into the BENQI strategy vault
   * @param {string|number} amount - Amount of AVAX to deposit
   * @returns {Object} - Transaction receipt and user data
   */
  const deposit = async (amount) => {
    setIsDepositing(true);
    setDepositError(null);
    setDepositTx(null);

    try {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Check network - BENQI contracts are on Avalanche mainnet (43114)
      const provider = signer.provider;
      if (provider) {
        const network = await provider.getNetwork();
        const chainId = network.chainId;

        if (chainId !== 43114) {
          throw new Error('Please switch to Avalanche mainnet (Chain ID: 43114)');
        }
      }

      const amountInWei = ethers.utils.parseEther(amount.toString());
      const vaultAddress = getVaultAddress();
      const vaultContract = new ethers.Contract(vaultAddress, VaultABI, signer);

      // Check minimum deposit
      const minDeposit = await vaultContract.MIN_DEPOSIT();
      if (amountInWei.lt(minDeposit)) {
        throw new Error(`Minimum deposit is ${ethers.utils.formatEther(minDeposit)} AVAX`);
      }

      console.log('📝 Initiating deposit:', {
        amount: `${amount} AVAX`,
        vault: vaultAddress
      });

      // Send deposit transaction
      const tx = await vaultContract.deposit({ value: amountInWei });
      console.log('⏳ Transaction sent:', tx.hash);

      setDepositTx({
        hash: tx.hash,
        status: 'pending'
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Deposit confirmed!', receipt);

      setDepositTx({
        hash: receipt.transactionHash,
        status: 'confirmed',
        blockNumber: receipt.blockNumber
      });

      setIsDepositing(false);

      return {
        success: true,
        receipt
      };

    } catch (error) {
      console.error('❌ Deposit failed:', error);

      let errorMessage = 'Deposit failed';

      // Parse common errors
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message && error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient AVAX balance';
      } else if (error.message && error.message.includes('Minimum deposit')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setDepositError(errorMessage);
      setDepositTx({
        hash: null,
        status: 'failed',
        error: errorMessage
      });
      setIsDepositing(false);

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Reset deposit state
   */
  const resetDeposit = () => {
    setIsDepositing(false);
    setDepositError(null);
    setDepositTx(null);
  };

  return {
    deposit,
    isDepositing,
    depositError,
    depositTx,
    resetDeposit
  };
};

export default useBenqiDeposit;
